/**
 * Helper per creare headers con autenticazione
 */
import { getStoredToken } from './authApi';
import { logger } from '../utils/logger';

/**
 * Crea headers standard con autenticazione se disponibile
 */
export const createHeaders = (includeAuth: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

/**
 * Crea headers per FormData (senza Content-Type)
 */
export const createFormDataHeaders = (includeAuth: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    'Accept': 'application/json',
  };
  
  if (includeAuth) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

/**
 * Valida il Content-Type della risposta API
 * Previene attacchi dove un server malintenzionato invia contenuto non JSON
 * @param response - La risposta fetch
 * @param expectedType - Il tipo MIME atteso (default: 'application/json')
 * @returns true se il Content-Type è valido, false altrimenti
 */
export const validateResponseContentType = (
  response: Response, 
  expectedType: string = 'application/json'
): boolean => {
  const contentType = response.headers.get('content-type');
  
  if (!contentType) {
    // Se non c'è Content-Type, potrebbe essere un problema di sicurezza
    // Ma alcuni server potrebbero non inviarlo, quindi loggiamo ma non blocchiamo
    logger.warn('⚠️ Risposta API senza Content-Type header');
    return true; // Permettiamo ma con warning
  }
  
  // Normalizza il Content-Type rimuovendo charset e altri parametri
  const normalizedContentType = contentType.split(';')[0].trim().toLowerCase();
  const normalizedExpected = expectedType.split(';')[0].trim().toLowerCase();
  
  // Verifica che il Content-Type corrisponda a quello atteso
  if (normalizedContentType !== normalizedExpected) {
    logger.error(
      `❌ Content-Type non valido: atteso "${expectedType}", ricevuto "${contentType}"`
    );
    return false;
  }
  
  return true;
};

