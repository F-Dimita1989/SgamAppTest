/**
 * API endpoint Vercel Edge Function per ottenere il nonce CSP
 * Questo endpoint restituisce il nonce generato dal middleware
 * 
 * @see middleware.ts per la generazione del nonce
 * 
 * Formato Vercel Edge Function:
 * - File nella cartella api/ con export default
 * - Runtime edge configurato tramite vercel.json o export config
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request): Promise<Response> {
  // Il nonce viene generato dal middleware e aggiunto all'header x-nonce
  // Questo endpoint può essere usato come fallback se il meta tag non è disponibile
  const nonce = request.headers.get('x-nonce') || '';

  return new Response(JSON.stringify({ nonce }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

