// src/apiServices/apiService.ts

import { logger } from '../utils/logger';
import { canMakeRequest, RateLimitConfigs, getTimeUntilReset } from '../utils/rateLimiter';
import { validateResponseContentType } from './apiHelpers';
import { sanitizeInput } from '../utils/sanitize';

// Usa variabili d'ambiente per URL API
const CHATBOT_API_BASE = import.meta.env.VITE_CHATBOT_API_BASE_URL || 
  (import.meta.env.PROD 
    ? 'https://sgamy.onrender.com' 
    : ''); // In dev usa il proxy

const API_URL = import.meta.env.PROD 
  ? `${CHATBOT_API_BASE}/analyze`
  : '/api/analyze'; // Nota: usa il proxy /api per bypassare CORS
const API_URL_IMAGE = import.meta.env.PROD
  ? `${CHATBOT_API_BASE}/analyze-image`
  : '/api/analyze-image'; // Endpoint per le immagini

// Helper per ottenere gli headers necessari
const getHeaders = (contentType?: string): HeadersInit => {
  const headers: HeadersInit = {};
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  return headers;
};

export interface OllamaResponse {
  response?: string;
  scam_level?: 'safe' | 'warning' | 'danger';
  confidence?: number;
  error?: string;
  score?: string;
}

export interface AnalyzeResult {
  text: string;
  score?: string;
}

/**
 * Controlla se il server API è disponibile facendo un ping
 */
export async function checkServerStatus(): Promise<boolean> {
  try {
    logger.dev('🏓 PING: Verifico disponibilità server...');
    const startTime = Date.now();
    
    // Timeout di 5 secondi per dare tempo al server
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Prova a fare una richiesta di test minima
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders('application/json'),
      body: JSON.stringify({ message_text: 'ping' }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const elapsedTime = Date.now() - startTime;
    
    logger.dev(`✅ PONG! Server risponde in ${elapsedTime}ms con status ${response.status}`);
    
    // Se il server risponde con QUALSIASI status code → è ONLINE
    // Non importa se è 200, 400, 500... se risponde è attivo!
    return true;
    
  } catch (error) {
    // Solo errori di rete o timeout indicano che il server è offline
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        logger.dev('💤 TIMEOUT: Server non risponde entro 5 secondi → Sta dormendo');
      } else {
        logger.dev('💤 ERRORE RETE: Server non raggiungibile →', error.message);
      }
    } else {
      logger.dev('💤 ERRORE: Server non disponibile');
    }
    return false;
  }
}

/**
 * Invia un messaggio all'API e riceve la risposta dal chatbot
 */
export async function analyzeText(text: string, image?: File | null): Promise<AnalyzeResult | null> {
  if (!text || !text.trim()) {
    if (!image) return null;
  }

  // Sanitizzazione input (defense in depth)
  const sanitizedText = sanitizeInput(text.trim());
  
  // Validazione base: lunghezza minima e massima
  if (sanitizedText.length === 0 && !image) {
    return null;
  }
  if (sanitizedText.length > 5000) {
    throw new Error('Il messaggio è troppo lungo. Massimo 5000 caratteri.');
  }

  // Rate limiting
  const rateLimitKey = image ? 'chatbot-image' : 'chatbot-text';
  if (!canMakeRequest(rateLimitKey, RateLimitConfigs.chatbot)) {
    const timeUntilReset = getTimeUntilReset(rateLimitKey);
    logger.warn(`Rate limit raggiunto. Riprova tra ${Math.ceil(timeUntilReset / 1000)} secondi.`);
    throw new Error(`Troppe richieste. Attendi ${Math.ceil(timeUntilReset / 1000)} secondi prima di riprovare.`);
  }

  try {
    const trimmedText = sanitizedText; // Già sanitizzato sopra
    logger.dev('🚀 Invio messaggio all\'API:', trimmedText);
    if (image) {
      logger.dev('🖼️ Immagine allegata:', image.name, `(${(image.size / 1024).toFixed(2)} KB)`);
    }

    let response: Response | null = null;
    let raw: string | null = null;

    if (image) {
      // Se c'è un'immagine, usa FormData
      // Prova diversi nomi di campo che il backend potrebbe aspettarsi
      const imageFieldNames = ['image', 'file', 'image_file', 'photo', 'upload'];
      
      let foundValid = false;
      
      for (const fieldName of imageFieldNames) {
        const formData = new FormData();
        formData.append('message_text', trimmedText || '');
        formData.append(fieldName, image);

        logger.dev(`📤 Tentativo con campo "${fieldName}":`);
        logger.dev('📤 - message_text:', trimmedText || '(vuoto)');
        logger.dev('📤 - ' + fieldName + ':', image.name, image.type, `(${(image.size / 1024).toFixed(2)} KB)`);

        try {
          const testResponse = await fetch(API_URL_IMAGE, {
            method: 'POST',
            headers: getHeaders(), // Non impostare Content-Type per FormData, il browser lo fa automaticamente
            body: formData,
          });

          logger.dev(`📊 Status risposta (campo "${fieldName}"): ${testResponse.status} ${testResponse.statusText}`);
          
          if (testResponse.ok) {
            const testRaw = await testResponse.text();
            logger.dev('📥 Test risposta RAW:', testRaw.substring(0, 200));
            
            // Se la risposta contiene "errore" o "error", prova il prossimo campo
            if (testRaw.toLowerCase().includes('errore') || 
                testRaw.toLowerCase().includes('error') ||
                testRaw.toLowerCase().includes('nessun') ||
                testRaw.trim().length === 0) {
              logger.dev(`⚠️ Campo "${fieldName}" non funziona, provo il successivo`);
              continue;
            }
            
            // Funziona! Salva la risposta
            logger.dev(`✅ Campo "${fieldName}" funziona!`);
            raw = testRaw;
            response = testResponse;
            foundValid = true;
            break;
          } else if (fieldName !== imageFieldNames[imageFieldNames.length - 1]) {
            // Non è l'ultimo campo, prova il prossimo
            logger.dev(`⚠️ HTTP ${testResponse.status} con campo "${fieldName}", provo il successivo`);
            continue;
          } else {
            // Ultimo tentativo, salva comunque per vedere l'errore
            raw = await testResponse.text();
            response = testResponse;
          }
        } catch (err) {
          logger.error(`❌ Errore con campo "${fieldName}":`, err);
          if (fieldName === imageFieldNames[imageFieldNames.length - 1]) {
            throw err;
          }
          continue;
        }
      }
      
      // Se dopo tutti i tentativi non abbiamo una risposta valida
      if (!foundValid) {
        logger.error('❌ Nessun campo immagine ha funzionato');
        if (!raw || !response) return null;
      }
    } else {
      // Altrimenti usa JSON come prima
      const requestBody = { message_text: trimmedText };

      response = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders('application/json'),
        body: JSON.stringify(requestBody),
      });
    }

    // Verifica che response sia stata assegnata
    if (!response) {
      logger.error('❌ Risposta non disponibile');
      return null;
    }

    logger.dev(`📊 Status risposta: ${response.status} ${response.statusText}`);
    
    // Valida Content-Type della risposta per sicurezza
    if (response.ok && !validateResponseContentType(response, 'application/json')) {
      logger.error('❌ Content-Type non valido nella risposta API. Possibile attacco.');
      return null;
    }
    
    // Se non abbiamo già letto il raw (caso senza immagine), leggilo ora
    if (raw === null) {
      raw = await response.text();
    }
    
    logger.dev('📥 Risposta RAW:', raw);
    logger.dev('📥 Lunghezza risposta:', raw.length, 'caratteri');

    if (!response.ok) {
      // Gestione specifica per errore 405 (Method Not Allowed)
      if (response.status === 405) {
        logger.error('❌ Errore 405: Metodo HTTP non consentito. Verifica che il backend accetti POST su questo endpoint.');
        logger.error('❌ URL chiamato:', response.url || API_URL);
        logger.error('❌ Metodo usato: POST');
        logger.error('❌ Risposta server:', raw);
      } else {
        logger.error('❌ Risposta HTTP non OK:', raw);
      }
      return null;
    }

    // Se la risposta è vuota
    if (!raw || raw.trim().length === 0) {
      logger.warn('⚠️ Risposta vuota dall\'API');
      return null;
    }

    try {
      const data: OllamaResponse = JSON.parse(raw);
      logger.dev('📦 JSON parsato:', data);
      logger.dev('📦 Keys disponibili:', Object.keys(data));

      // Controlla se c'è un errore
      if (data.error) {
        logger.error('❌ Errore nell\'API response:', data.error);
        return null;
      }

      // Estrai lo score (potrebbe essere un colore come "green", "yellow", "red" o un valore)
      let score: string | undefined = undefined;
      if (data.score) {
        score = String(data.score).trim().toLowerCase();
        logger.dev('🎯 Score trovato nel campo score:', score);
      }

      // Prova diversi campi per la risposta
      let responseText: string | null = null;
      if (data.response && typeof data.response === 'string' && data.response.trim().length > 0) {
        logger.dev('✅ Trovato data.response');
        responseText = data.response.trim();
      } else {
        // Se non c'è response, prova altri campi comuni
        const possibleFields = ['message', 'content', 'answer', 'text', 'result', 'output'];
        for (const field of possibleFields) {
          if (data[field as keyof OllamaResponse] && typeof data[field as keyof OllamaResponse] === 'string') {
            const value = String(data[field as keyof OllamaResponse]).trim();
            if (value.length > 0) {
              logger.dev(`✅ Trovato data.${field}`);
              responseText = value;
              break;
            }
          }
        }
      }

      // Se non trova nulla ma c'è un oggetto, restituisci il JSON formattato
      if (!responseText) {
        logger.dev('⚠️ Nessun campo testo trovato, restituisco JSON completo');
        responseText = JSON.stringify(data, null, 2);
      }

      // Cerca il colore nel testo della risposta dopo "score: " (con uno o più spazi)
      if (!score && responseText) {
        // Pattern per cercare "score: <colore>" o "score:<colore>" (case insensitive)
        const scorePattern = /score\s*:\s*([a-zA-Z]+)/i;
        const match = responseText.match(scorePattern);
        if (match && match[1]) {
          score = match[1].trim().toLowerCase();
          logger.dev('🎯 Score trovato nel testo dopo "score:":', score);
        }
      }

      // Rimuovi il testo dello score dal messaggio se presente
      if (score && responseText) {
        const scorePattern = /score\s*:\s*[a-zA-Z]+/gi;
        responseText = responseText.replace(scorePattern, '').trim();
        // Rimuovi anche eventuali spazi multipli
        responseText = responseText.replace(/\s+/g, ' ').trim();
      }

      return {
        text: responseText,
        score: score
      };
    } catch (parseError) {
      logger.error('❌ Errore nel parsing JSON:', parseError);
      logger.dev('📥 Tentativo di restituire risposta come testo:', raw.substring(0, 200));
      // Se non è JSON, cerca comunque lo score nel testo
      let score: string | undefined = undefined;
      let responseText = raw.trim();
      
      // Cerca il pattern "score: <colore>" (case insensitive, con uno o più spazi)
      const scorePattern = /score\s*:\s*([a-zA-Z]+)/i;
      const scoreMatch = responseText.match(scorePattern);
      if (scoreMatch && scoreMatch[1]) {
        score = scoreMatch[1].trim().toLowerCase();
        logger.dev('🎯 Score trovato nel testo dopo "score:":', score);
        
        // Rimuovi il testo dello score dal messaggio
        responseText = responseText.replace(scorePattern, '').trim();
        // Rimuovi anche eventuali spazi multipli
        responseText = responseText.replace(/\s+/g, ' ').trim();
      }
      
      // Se non è JSON, restituisci la stringa direttamente se non è vuota
      if (responseText.length > 0) {
        return {
          text: responseText,
          score: score
        };
      }
      return null;
    }
  } catch (error) {
    logger.error('❌ Errore nella chiamata API:', error);
    return null;
  }
}
