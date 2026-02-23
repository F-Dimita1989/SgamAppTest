import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Rate limiting lato server (in-memory cache)
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitCache = new Map<string, RateLimitRecord>();
const RATE_LIMIT_MAX = 100; // Max richieste
const RATE_LIMIT_WINDOW = 60000; // 1 minuto

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitCache.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitCache.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  rateLimitCache.set(ip, record);
  return true;
}

// Pulisci cache ogni minuto
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitCache.entries()) {
    if (now > record.resetTime) {
      rateLimitCache.delete(key);
    }
  }
}, 60000);

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 0️⃣ Rate limiting lato server
    const clientIp =
      req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
      req.headers["x-real-ip"]?.toString() ||
      "unknown";

    if (!checkRateLimit(clientIp)) {
      res.setHeader("Retry-After", "60");
      return res.status(429).json({
        error: "Troppe richieste. Riprova più tardi.",
      });
    }

    // 1️⃣ Genera un nonce sicuro
    const nonce = crypto.randomBytes(16).toString("base64");

    // 2️⃣ Determina la cartella della build
    let buildDir: string | null = null;
    if (fs.existsSync(path.join(process.cwd(), "dist"))) {
      buildDir = "dist"; // Vite
    } else if (fs.existsSync(path.join(process.cwd(), "build"))) {
      buildDir = "build"; // CRA
    } else {
      console.error("Né 'dist' né 'build' esistono!");
      return res.status(500).send("index.html not found");
    }

    const indexPath = path.join(process.cwd(), buildDir, "index.html");

    // 3️⃣ Leggi index.html
    if (!fs.existsSync(indexPath)) {
      console.error("index.html non trovato in", buildDir);
      return res.status(500).send("index.html not found");
    }

    let html = fs.readFileSync(indexPath, "utf8");

    // 4️⃣ Sostituisci tutti i placeholder __NONCE__
    html = html.replace(/__NONCE__/g, nonce);

    // 5️⃣ Aggiungi nonce a tutti i <script src> e <script type="module">
    html = html.replace(
      /<script(\s+[^>]*)src=/gi,
      `<script nonce="${nonce}"$1src=`
    );
    html = html.replace(
      /<script type="module"/gi,
      `<script type="module" nonce="${nonce}"`
    );

    // 6️⃣ Aggiungi nonce a tutti gli <style> inline
    html = html.replace(/<style/gi, `<style nonce="${nonce}"`);

    // 7️⃣ Trova tutti i JS generati da Vite in /assets/ e aggiungi nonce (fallback)
    const assetDir = path.join(process.cwd(), buildDir, "assets");
    if (fs.existsSync(assetDir)) {
      const files = fs.readdirSync(assetDir);
      files.forEach((file) => {
        if (file.endsWith(".js")) {
          const regex = new RegExp(
            `<script[^>]+src="/assets/${file}"[^>]*></script>`,
            "gi"
          );
          html = html.replace(
            regex,
            `<script src="/assets/${file}" nonce="${nonce}"></script>`
          );
        }
      });
    }

    // 8️⃣ Header di sicurezza + CSP dinamica (produzione-ready)
    // Nota: 'strict-dynamic' permette agli script con nonce di caricare altri script
    // Questo è più sicuro di 'unsafe-eval' e funziona con Vite
    // 'unsafe-inline' per style-src: necessario per stili inline React (style={{ ... }})
    // È relativamente sicuro per CSS (a differenza di script) su Brave mobile
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://*.vercel.app`,
      `style-src 'self' 'unsafe-inline' 'nonce-${nonce}' https://fonts.googleapis.com`,
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://sgamapp.onrender.com https://sgamy.onrender.com https://api.counterapi.dev",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "media-src 'self' blob:",
      "upgrade-insecure-requests",
    ].join("; ");

    // Security headers completi per produzione
    res.setHeader("Content-Security-Policy", csp);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
    );
    res.setHeader("X-Download-Options", "noopen");
    res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    // Expect-CT header (deprecato ma ancora utile per alcuni browser)
    res.setHeader("Expect-CT", "max-age=86400, enforce");
    // Cross-Origin-Resource-Policy rimosso: può bloccare Google Fonts e altre risorse esterne

    // 9️⃣ Invia HTML finale
    res.status(200).send(html);
  } catch (err) {
    console.error("Errore Serverless:", err);
    res.status(500).send("Serverless function error");
  }
}
