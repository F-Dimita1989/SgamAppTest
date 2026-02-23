/**
 * Vercel Edge Function - Counter Increment Proxy (IP-based dedup)
 * 
 * Incrementa il contatore solo per IP unici, usando un hash dell'IP
 * come chiave su counterapi.dev per tracciare visitatori già contati.
 * 
 * Flusso:
 * 1. Estrae l'IP dal request header
 * 2. Genera un hash SHA-256 dell'IP (privacy-safe)
 * 3. Controlla su counterapi.dev se l'IP è già stato contato
 * 4. Se nuovo: incrementa il contatore principale + segna l'IP
 * 5. Se già contato: restituisce solo il conteggio attuale
 */

export const config = {
  runtime: 'edge',
};

const COUNTER_API_BASE = 'https://api.counterapi.dev/v1';
const COUNTER_NAMESPACE = 'sgamapp';
const COUNTER_KEY = 'visits';
const TIMEOUT_MS = 10000;
const IP_HASH_SALT = '_sgamapp_visitor_salt';

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + IP_HASH_SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

function getVisitorIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

export default async function handler(request: Request): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (request.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const fetchOpts = { headers: { 'Accept': 'application/json' }, signal: controller.signal };

    const ip = getVisitorIP(request);
    const ipHash = await hashIP(ip);
    const ipKey = `ip_${ipHash}`;

    // Verifica se l'IP è già stato contato
    let alreadyCounted = false;
    try {
      const checkRes = await fetch(
        `${COUNTER_API_BASE}/${COUNTER_NAMESPACE}/${ipKey}`,
        fetchOpts
      );
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        alreadyCounted = (checkData.count ?? checkData.value ?? 0) > 0;
      }
    } catch {
      // Se il check fallisce, assumiamo IP non contato
    }

    let count: number;

    if (!alreadyCounted) {
      // Nuovo visitatore: segna IP e incrementa contatore in parallelo
      const [, incrementRes] = await Promise.all([
        fetch(`${COUNTER_API_BASE}/${COUNTER_NAMESPACE}/${ipKey}/up`, { signal: controller.signal }),
        fetch(`${COUNTER_API_BASE}/${COUNTER_NAMESPACE}/${COUNTER_KEY}/up`, fetchOpts),
      ]);
      clearTimeout(timeoutId);
      const data = await incrementRes.json();
      count = data.count ?? data.value ?? 0;
    } else {
      // Visitatore già contato: solo lettura
      const readRes = await fetch(
        `${COUNTER_API_BASE}/${COUNTER_NAMESPACE}/${COUNTER_KEY}`,
        fetchOpts
      );
      clearTimeout(timeoutId);
      const data = await readRes.json();
      count = data.count ?? data.value ?? 0;
    }

    return new Response(
      JSON.stringify({ count }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      return new Response(
        JSON.stringify({ error: 'Request timeout' }),
        { status: 504, headers: corsHeaders }
      );
    }

    if (process.env.NODE_ENV !== 'production') {
      console.error('Counter Increment API error:', error);
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
}
