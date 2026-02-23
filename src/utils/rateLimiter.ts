/**
 * Rate Limiter lato client per prevenire abusi di API
 * Implementa throttling e debouncing per chiamate API
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

// Cache per tracciare le richieste
const requestCache = new Map<string, RequestRecord>();

/**
 * Pulisce la cache periodicamente
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCache.entries()) {
    if (now > record.resetTime) {
      requestCache.delete(key);
    }
  }
}, 60000); // Ogni minuto

/**
 * Verifica se una richiesta può essere effettuata
 * @param key Identificatore univoco per la richiesta (es: 'api-login', 'api-chatbot')
 * @param config Configurazione del rate limit
 * @returns true se la richiesta può essere effettuata, false altrimenti
 */
export const canMakeRequest = (
  key: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }
): boolean => {
  const now = Date.now();
  const record = requestCache.get(key);

  if (!record || now > record.resetTime) {
    // Nuovo record o finestra scaduta
    requestCache.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return true;
  }

  if (record.count >= config.maxRequests) {
    // Limite raggiunto
    return false;
  }

  // Incrementa il contatore
  record.count++;
  requestCache.set(key, record);
  return true;
};

/**
 * Resetta il rate limit per una chiave specifica
 */
export const resetRateLimit = (key: string): void => {
  requestCache.delete(key);
};

/**
 * Ottiene il tempo rimanente prima che il rate limit si resetti
 */
export const getTimeUntilReset = (key: string): number => {
  const record = requestCache.get(key);
  if (!record) return 0;
  
  const remaining = record.resetTime - Date.now();
  return remaining > 0 ? remaining : 0;
};

/**
 * Configurazioni predefinite per diversi tipi di richieste
 * Configurazioni più restrittive per maggiore sicurezza
 */
export const RateLimitConfigs = {
  login: { maxRequests: 5, windowMs: 900000 }, // 5 richieste ogni 15 minuti (brute force protection)
  chatbot: { maxRequests: 15, windowMs: 60000 }, // 15 richieste al minuto (ridotto da 20)
  api: { maxRequests: 25, windowMs: 60000 }, // 25 richieste al minuto (ridotto da 30)
  admin: { maxRequests: 40, windowMs: 60000 }, // 40 richieste al minuto (ridotto da 50)
  // Nuove configurazioni per endpoint specifici
  imageUpload: { maxRequests: 10, windowMs: 60000 }, // 10 upload al minuto
  fileDownload: { maxRequests: 20, windowMs: 60000 }, // 20 download al minuto
} as const;

