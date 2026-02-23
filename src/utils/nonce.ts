/**
 * Utility per gestire il nonce CSP (Content Security Policy)
 * Legge il nonce dall'API endpoint o da un meta tag e lo applica agli script dinamici
 */

let cachedNonce: string | null = null;
let noncePromise: Promise<string | null> | null = null;

/**
 * Ottiene il nonce CSP dall'API endpoint o da un meta tag
 * Il nonce viene generato dal middleware Vercel per ogni richiesta
 */
export function getNonce(): string | null {
  // Se già in cache, restituisci quello
  if (cachedNonce) {
    return cachedNonce;
  }

  // Prova a leggere da meta tag (se iniettato dal middleware)
  const metaNonce = document.querySelector('meta[name="csp-nonce"]');
  if (metaNonce) {
    const nonce = metaNonce.getAttribute('content');
    if (nonce) {
      cachedNonce = nonce;
      return nonce;
    }
  }

  // Prova a leggere da attributo data sul body (alternativa)
  const bodyNonce = document.body.getAttribute('data-nonce');
  if (bodyNonce) {
    cachedNonce = bodyNonce;
    return bodyNonce;
  }

  // Se non trovato, restituisci null
  // In questo caso, gli script useranno 'strict-dynamic' come fallback
  return null;
}

/**
 * Ottiene il nonce in modo asincrono dall'API endpoint
 * Usa questo metodo se il nonce non è disponibile immediatamente
 */
export async function getNonceAsync(): Promise<string | null> {
  // Se già in cache, restituisci quello
  if (cachedNonce) {
    return cachedNonce;
  }

  // Se c'è già una richiesta in corso, aspetta quella
  if (noncePromise) {
    return noncePromise;
  }

  // Crea una nuova richiesta per ottenere il nonce
  noncePromise = fetch('/api/nonce')
    .then(response => response.json())
    .then(data => {
      if (data.nonce) {
        cachedNonce = data.nonce;
        return data.nonce;
      }
      return null;
    })
    .catch(() => {
      // In caso di errore, restituisci null
      // Gli script useranno 'strict-dynamic' come fallback
      return null;
    })
    .finally(() => {
      // Pulisci la promise dopo il completamento
      noncePromise = null;
    });

  return noncePromise;
}

/**
 * Applica il nonce a un elemento script
 * @param scriptElement - L'elemento script a cui applicare il nonce
 */
export function applyNonceToScript(scriptElement: HTMLScriptElement): void {
  const nonce = getNonce();
  if (nonce) {
    scriptElement.nonce = nonce;
  }
}

/**
 * Crea un nuovo script element con nonce applicato
 * @param src - URL dello script (opzionale)
 * @param inline - Codice inline dello script (opzionale)
 * @returns L'elemento script con nonce applicato
 */
export function createScriptWithNonce(
  src?: string,
  inline?: string
): HTMLScriptElement {
  const script = document.createElement('script');
  
  if (src) {
    script.src = src;
  }
  
  if (inline) {
    script.textContent = inline;
  }
  
  // Applica il nonce
  applyNonceToScript(script);
  
  return script;
}

/**
 * Inizializza il nonce all'avvio dell'applicazione
 * Chiama questa funzione all'inizio di main.tsx
 * 
 * NOTA: Il nonce è gestito dal middleware Vercel in produzione.
 * In sviluppo, gli script funzionano con 'strict-dynamic' come fallback.
 */
export async function initializeNonce(): Promise<void> {
  // Prova a leggere il nonce immediatamente da meta tag o attributo data
  const nonce = getNonce();
  
  // Se non trovato e siamo in produzione, prova a fare una richiesta per ottenerlo dall'API
  if (!nonce && import.meta.env.PROD) {
    try {
      await getNonceAsync();
    } catch (error) {
      // In caso di errore, usa 'strict-dynamic' come fallback
      // Questo è accettabile perché Vite carica gli script come moduli ES6 esterni
      // Non loggare errori in produzione per evitare rumore
    }
  }
  
  // In sviluppo, non chiamare l'API (evita errori di proxy)
  // Gli script funzionano comunque con strict-dynamic
}

