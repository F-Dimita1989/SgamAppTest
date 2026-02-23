/**
 * Vercel Edge Function - Counter Proxy
 * 
 * Risolve problemi CORS su Firefox, Brave e Opera
 * facendo da proxy per l'API esterna api.counterapi.dev
 * 
 * Formato Vercel Edge Function (come nonce.ts)
 */

export const config = {
  runtime: 'edge',
};

const COUNTER_API_BASE = 'https://api.counterapi.dev/v1';
const COUNTER_NAMESPACE = 'sgamapp';
const COUNTER_KEY = 'visits';
const TIMEOUT_MS = 10000;

export default async function handler(request: Request): Promise<Response> {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
  };

  // Gestisci preflight OPTIONS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Solo GET è supportato
  if (request.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: corsHeaders,
      }
    );
  }

  try {
    // Leggi solo (non incrementare)
    const apiUrl = `${COUNTER_API_BASE}/${COUNTER_NAMESPACE}/${COUNTER_KEY}`;

    // Crea AbortController per timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // Chiama l'API esterna
    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-cache',
    });

    clearTimeout(timeoutId);

    if (!apiResponse.ok) {
      return new Response(
        JSON.stringify({ error: `API error: ${apiResponse.status}` }),
        {
          status: apiResponse.status,
          headers: corsHeaders,
        }
      );
    }

    const data = await apiResponse.json();
    
    // Restituisci il count in formato standard
    const count = data.count ?? data.value ?? 0;
    
    return new Response(
      JSON.stringify({ count }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );

  } catch (error: unknown) {
    // Gestisci errori
    if (error instanceof Error && error.name === 'AbortError') {
      return new Response(
        JSON.stringify({ error: 'Request timeout' }),
        {
          status: 504,
          headers: corsHeaders,
        }
      );
    }

    // Log errore solo in sviluppo (Vercel Edge Functions)
    // In produzione, gli errori sono loggati automaticamente da Vercel
    if (process.env.NODE_ENV !== 'production') {
      console.error('Counter API error:', error);
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

