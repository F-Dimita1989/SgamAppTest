/**
 * Logger utility per gestire console.log in modo sicuro
 * In produzione, i log vengono disabilitati a meno che VITE_ENABLE_CONSOLE_LOGS non sia 'true'
 * Gli errori critici vengono sempre loggati per debugging
 */

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
const enableLogs = import.meta.env.VITE_ENABLE_CONSOLE_LOGS === "true";

// Cache per evitare spam di errori
const errorCache = new Map<string, number>();
const ERROR_CACHE_TTL = 60000; // 1 minuto

/**
 * Pulisce la cache degli errori periodicamente
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of errorCache.entries()) {
    if (now - timestamp > ERROR_CACHE_TTL) {
      errorCache.delete(key);
    }
  }
}, 30000); // Ogni 30 secondi

/**
 * Logga un errore evitando spam
 */
const logErrorSafely = (key: string, ...args: unknown[]) => {
  const now = Date.now();
  const lastLogged = errorCache.get(key);

  // Logga solo se non è stato loggato di recente o se è in dev
  if (!lastLogged || now - lastLogged > ERROR_CACHE_TTL || isDev) {
    errorCache.set(key, now);
    console.error(...args);
  }
};

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev || enableLogs) {
      console.log(...args);
    }
  },

  error: (...args: unknown[]) => {
    // Gli errori critici vengono sempre loggati, ma con throttling in produzione
    if (isDev || enableLogs) {
      console.error(...args);
    } else if (isProd) {
      // In produzione, logga solo errori critici con throttling
      const errorKey = args[0]?.toString() || "unknown";
      logErrorSafely(errorKey, ...args);

      // In produzione, invia errori a Sentry se configurato (async, non blocca)
      if (isProd) {
        import("./sentry")
          .then(({ captureException }) => {
            captureException(new Error(args.join(" ")));
          })
          .catch(() => {
            // Ignora se Sentry non è configurato
          });
      }
    }
  },

  warn: (...args: unknown[]) => {
    if (isDev || enableLogs) {
      console.warn(...args);
    }
  },

  debug: (...args: unknown[]) => {
    if (isDev || enableLogs) {
      console.debug(...args);
    }
  },

  info: (...args: unknown[]) => {
    if (isDev || enableLogs) {
      console.info(...args);
    }
  },

  /**
   * Logga solo in sviluppo (mai in produzione)
   */
  dev: (...args: unknown[]) => {
    if (isDev) {
      console.log("[DEV]", ...args);
    }
  },
};
