import { logger } from '../utils/logger';

// Usa Vercel Edge Functions per evitare problemi CORS
// Funziona sia in sviluppo che in produzione senza backend
const COUNTER_INCREMENT_API = '/api/counter-increment';

const TIMEOUT_MS = 10000;

export const incrementDownloadCounter = async (): Promise<void> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Usa Vercel Edge Function: /api/counter-increment
    const url = COUNTER_INCREMENT_API;

    await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
      cache: 'no-cache',
    });

    clearTimeout(timeoutId);
  } catch (error) {
    logger.warn('Errore nell\'incremento del contatore download:', error);
  }
};

