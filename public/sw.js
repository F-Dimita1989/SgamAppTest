// Service Worker per SgamApp
// Versione: 1.1.0 - Aggiornamento per garantire versione recente su Brave mobile
// Strategia conservativa: cache solo risorse statiche, network-first per HTML/JS

const CACHE_NAME = 'sgamapp-v1.1.0';
const STATIC_CACHE_NAME = 'sgamapp-static-v1.1.0';

// Risorse statiche da cachare (immagini, font, CSS)
const STATIC_ASSETS = [
  '/logo-favicon.svg',
  '/logo.svg',
  '/logoIOS.png',
  '/manifest.json'
];

// Installa il service worker
self.addEventListener('install', (event) => {
  // Non blocca l'installazione se la cache fallisce
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        // Aggiunge solo risorse statiche, non blocca se fallisce
        return cache.addAll(STATIC_ASSETS).catch(() => {
          // Errore nel caching - silenzioso in produzione
        });
      })
      .then(() => {
        // Forza l'attivazione immediata (skip waiting)
        return self.skipWaiting();
      })
  );
});

// Attiva il service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Rimuove cache vecchie
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Rimuove cache che non corrispondono alla versione corrente
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      // Prende controllo di tutte le pagine
      return self.clients.claim();
    })
  );
});

// Gestisce le richieste
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora richieste non GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignora richieste a domini esterni (API, analytics, ecc.)
  if (url.origin !== location.origin) {
    return;
  }

  // Strategia Network First per HTML e JS (sempre aggiornati)
  if (request.destination === 'document' || 
      request.destination === 'script' ||
      url.pathname.endsWith('.html') ||
      url.pathname.endsWith('.js')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Se la richiesta ha successo, salva in cache
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Se la rete fallisce, prova dalla cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Se non c'è in cache, mostra pagina offline (se disponibile)
            return new Response('Offline - SgamApp', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
        })
    );
    return;
  }

  // Strategia Cache First per risorse statiche (immagini, font, CSS)
  if (request.destination === 'image' ||
      request.destination === 'font' ||
      request.destination === 'style' ||
      url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf|eot|css)$/i)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          // Se è in cache, restituisci dalla cache
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Altrimenti, scarica dalla rete e salva in cache
          return fetch(request)
            .then((response) => {
              // Salva solo risposte valide
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE_NAME).then((cache) => {
                  cache.put(request, responseClone);
                });
              }
              return response;
            })
            .catch(() => {
              // Se la rete fallisce e non c'è in cache, restituisci placeholder
              if (request.destination === 'image') {
                return new Response(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#F4F4FA"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#1565D6" font-family="Arial">Immagine non disponibile</text></svg>',
                  {
                    headers: { 'Content-Type': 'image/svg+xml' }
                  }
                );
              }
              return new Response('Risorsa non disponibile offline', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
        })
    );
    return;
  }

  // Per tutte le altre richieste, usa Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

