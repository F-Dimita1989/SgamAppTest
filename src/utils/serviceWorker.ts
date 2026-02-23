// Registrazione Service Worker (solo in produzione)
import { logger } from './logger';

export const registerServiceWorker = (): void => {
  // Registra solo in produzione e se il browser supporta service workers
  if (
    import.meta.env.PROD &&
    'serviceWorker' in navigator
  ) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', {
          scope: '/',
        })
        .then((registration) => {
          logger.log('[SW] Service Worker registrato:', registration.scope);

          // Controlla aggiornamenti ogni 30 minuti (bilanciamento tra freschezza e performance)
          setInterval(() => {
            registration.update();
          }, 1800000); // 30 minuti

          // Controlla aggiornamenti quando l'utente torna alla tab (efficiente)
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
              registration.update();
            }
          });

          // Gestisce aggiornamenti del service worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nuovo service worker disponibile, ricarica la pagina
                  logger.log('[SW] Nuova versione disponibile, ricarico...');
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((error) => {
          logger.warn('[SW] Errore nella registrazione:', error);
        });
    });
  }
};

// Funzione per rimuovere il service worker (utile per debug)
export const unregisterServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    const unregistered = await registration.unregister();
    if (unregistered) {
      logger.log('[SW] Service Worker rimosso');
      // Rimuove anche tutte le cache
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
      logger.log('[SW] Cache rimosse');
    }
  }
};

