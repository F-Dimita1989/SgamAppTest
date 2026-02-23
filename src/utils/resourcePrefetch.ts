/**
 * Utility per prefetch dinamico di risorse che potrebbero essere necessarie in futuro.
 * Viene eseguito dopo che la pagina è completamente caricata per non interferire
 * con le risorse critiche.
 */

/**
 * Prefetch di una risorsa quando il browser è in idle.
 * Usa requestIdleCallback se disponibile, altrimenti setTimeout.
 */
export const prefetchResource = (url: string, as: 'script' | 'style' | 'image' | 'font' = 'script') => {
  // Evita prefetch duplicati
  const existing = document.querySelector(`link[rel="prefetch"][href="${url}"]`);
  if (existing) return;

  const prefetchLink = document.createElement('link');
  prefetchLink.rel = 'prefetch';
  prefetchLink.as = as;
  prefetchLink.href = url;
  document.head.appendChild(prefetchLink);
};

/**
 * Prefetch di risorse comuni dopo che la pagina è caricata.
 * Eseguito in idle time per non interferire con il caricamento iniziale.
 */
export const prefetchCommonResources = () => {
  // Esegui solo dopo che la pagina è completamente caricata
  if (document.readyState === 'complete') {
    schedulePrefetch();
  } else {
    window.addEventListener('load', schedulePrefetch, { once: true });
  }
};

const schedulePrefetch = () => {
  // Usa requestIdleCallback se disponibile (Chrome, Firefox)
  if ('requestIdleCallback' in window) {
    const requestIdleCallback = (window as Window & { requestIdleCallback: (callback: () => void, options?: { timeout?: number }) => number }).requestIdleCallback;
    requestIdleCallback(() => {
      prefetchPopularPages();
      prefetchCommonChunks();
    }, { timeout: 2000 });
  } else {
    // Fallback per browser che non supportano requestIdleCallback
    setTimeout(() => {
      prefetchPopularPages();
      prefetchCommonChunks();
    }, 2000);
  }
};

/**
 * Prefetch delle pagine più visitate.
 * Queste risorse vengono caricate in background quando il browser è in idle.
 */
const prefetchPopularPages = () => {
  // Prefetch solo delle pagine più comuni per non sprecare bandwidth
  const popularRoutes = [
    '/glossario',
    '/traduttore-generazionale',
    '/info',
  ];

  // Prefetch delle route usando link prefetch
  // Nota: In produzione, React Router gestisce automaticamente il prefetch
  // dei chunk quando si naviga, ma possiamo anticipare le route più comuni
  popularRoutes.forEach(route => {
    // Prefetch della route (il browser pre-fetcha automaticamente i chunk JS)
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  });
};

/**
 * Prefetch dei chunk comuni che potrebbero essere necessari.
 * Questo riduce le catene di richieste quando l'utente naviga.
 */
const prefetchCommonChunks = () => {
  // Prefetch dei chunk che sono probabilmente necessari:
  // - shared-components (Footer, Chatbot, etc.)
  // - react-router (se non già caricato)
  
  // Nota: I nomi dei chunk in produzione hanno hash, quindi questo
  // prefetch funziona meglio con un service worker o analisi del manifest.
  // Per ora, lasciamo che React Router gestisca il prefetch automatico.
};

