import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import { createHash } from "crypto";
import type { IncomingMessage, ServerResponse } from "http";

// --- Counter API dev middleware (replica la logica IP-based delle Edge Functions) ---

const COUNTER_API_BASE = "https://api.counterapi.dev/v1";
const COUNTER_NAMESPACE = "sgamapp";
const COUNTER_KEY = "visits";
const IP_HASH_SALT = "_sgamapp_visitor_salt";

function hashIP(ip: string): string {
  return createHash("sha256")
    .update(ip + IP_HASH_SALT)
    .digest("hex")
    .substring(0, 16);
}

function getVisitorIP(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

async function handleCounterIncrement(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const ip = getVisitorIP(req);
  const ipHash = hashIP(ip);
  const ipKey = `ip_${ipHash}`;
  const fetchOpts = { headers: { Accept: "application/json" } };

  let alreadyCounted = false;
  try {
    const checkRes = await fetch(`${COUNTER_API_BASE}/${COUNTER_NAMESPACE}/${ipKey}`, fetchOpts);
    if (checkRes.ok) {
      const checkData = await checkRes.json() as { count?: number; value?: number };
      alreadyCounted = ((checkData.count ?? checkData.value) ?? 0) > 0;
    }
  } catch {
    // Se il check fallisce, assumiamo IP non contato
  }

  let count: number;

  if (!alreadyCounted) {
    const [, incrementRes] = await Promise.all([
      fetch(`${COUNTER_API_BASE}/${COUNTER_NAMESPACE}/${ipKey}/up`),
      fetch(`${COUNTER_API_BASE}/${COUNTER_NAMESPACE}/${COUNTER_KEY}/up`, fetchOpts),
    ]);
    const data = await incrementRes.json() as { count?: number; value?: number };
    count = (data.count ?? data.value) ?? 0;
  } else {
    const readRes = await fetch(`${COUNTER_API_BASE}/${COUNTER_NAMESPACE}/${COUNTER_KEY}`, fetchOpts);
    const data = await readRes.json() as { count?: number; value?: number };
    count = (data.count ?? data.value) ?? 0;
  }

  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ count }));
}

async function handleCounterRead(res: ServerResponse): Promise<void> {
  const readRes = await fetch(
    `${COUNTER_API_BASE}/${COUNTER_NAMESPACE}/${COUNTER_KEY}`,
    { headers: { Accept: "application/json" } }
  );
  const data = await readRes.json() as { count?: number; value?: number };
  const count = (data.count ?? data.value) ?? 0;

  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ count }));
}

function counterDevMiddleware(): Plugin {
  return {
    name: "counter-dev-middleware",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || "").split("?")[0];

        if (url === "/api/counter-increment") {
          handleCounterIncrement(req, res).catch(() => {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Counter API error" }));
          });
          return;
        }

        if (url === "/api/counter") {
          handleCounterRead(res).catch(() => {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Counter API error" }));
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    legacy({
      targets: ["defaults", "not IE 11"],
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
      renderLegacyChunks: true,
    }),
    counterDevMiddleware(),
  ],
  css: {
    devSourcemap: false,
  },
  build: {
    target: "es2015",
    minify: "esbuild",
    sourcemap: false,
    assetsInlineLimit: 2048,
    cssCodeSplit: true,
    assetsDir: "assets",
    cssMinify: "esbuild",
    rollupOptions: {
      treeshake: {
        moduleSideEffects: "no-external",
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        preset: "smallest",
      },
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom"))
              return "react-core";
            if (id.includes("react-router")) return "react-router";
            if (id.includes("@radix-ui")) return "radix-ui";
            return "vendor";
          }
          if (id.includes("/components/")) {
            if (
              id.includes("Navbar") ||
              id.includes("AccessibilityLoader") ||
              id.includes("AccessibilityModal")
            )
              return undefined;
            if (id.includes("/components/shared/")) {
              if (
                id.includes("Footer") ||
                id.includes("Chatbot") ||
                id.includes("AppDownloadBanner")
              )
                return "shared-non-critical";
              return "shared-components";
            }
            if (id.includes("/components/pages/")) {
              if (id.includes("Admin")) return "admin-pages";
              if (id.includes("Guida") || id.includes("Guide"))
                return "guide-pages";
              return "pages";
            }
          }
          if (id.includes("/contexts/")) return "contexts";
          if (id.includes("/utils/")) return "utils";
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        compact: true,
        generatedCode: {
          constBindings: true,
          objectShorthand: true,
          symbols: false,
        },
        experimentalMinChunkSize: 5000,
      },
    },
    chunkSizeWarningLimit: 400,
    reportCompressedSize: true,
    modulePreload: {
      polyfill: false,
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      // Proxy per Chatbot API (sgamy.onrender.com)
      "/api/analyze": {
        target: "https://sgamy.onrender.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/api/analyze-image": {
        target: "https://sgamy.onrender.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      // Proxy per Backend principale (online su Render)
      "^/api/(?!counter|counter-increment|analyze|analyze-image|nonce)": {
        target: "https://sgamapp.onrender.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
