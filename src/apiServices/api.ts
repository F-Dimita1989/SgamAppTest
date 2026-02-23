// Usa variabili d'ambiente per URL API
// In sviluppo: /api viene reindirizzato a http://localhost:5147 tramite proxy
// In produzione: usa VITE_API_BASE_URL o fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD 
    ? 'https://sgamapp.onrender.com/api' 
    : '/api'); // In dev usa il proxy

// Import per headers con autenticazione
import { createHeaders, validateResponseContentType } from './apiHelpers';
import { logger } from '../utils/logger';
import { sanitizeInput } from '../utils/sanitize';
import { validateTerm, validateDefinition, validateCategory, validateWord, validateDescription } from '../utils/validation';
import { cachedFetch } from './apiCache';

export interface GlossaryModel {
  id?: number;
  term: string;
  definition: string;
  category: string;
}

export interface GlossaryTerm {
  id: number;
  term: string;
  definition: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SearchPage {
  id: number;
  title: string;
  keywords: string[];
  route: string;
  category: string;
}

export const glossaryApi = {
  getAll: async (): Promise<GlossaryTerm[]> => {
    try {
      const url = `${API_BASE_URL}/Glossary/GetAll`;
      logger.dev('🔍 Chiamata API getAll (Glossario) - con cache:', url);
      
      // Usa cachedFetch per GET con cache di 10 minuti
      const backendData = await cachedFetch<Array<Record<string, unknown>>>(
        url,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        },
        10 * 60 * 1000 // 10 minuti cache
      );
      
      logger.dev('✅ Dati dal backend (cached):', backendData);
      logger.dev('📦 Primo elemento:', backendData[0]);
      
      if (!Array.isArray(backendData)) {
        return [];
      }
      
      // Mappa i campi del backend al formato del frontend
      const mappedData: GlossaryTerm[] = backendData.map((item: Record<string, unknown>) => {
        const typedItem = item as Partial<GlossaryTerm> & {
          Term?: string; 
          description?: string;
          Description?: string; 
          Definition?: string; 
          Category?: string;
          CreatedAt?: string;
          UpdatedAt?: string;
        };
        
        return {
          id: (typedItem.id as number) || 0,
          term: typedItem.term || typedItem.Term || '',
          definition: typedItem.definition || typedItem.description || typedItem.Description || typedItem.Definition || '',
          category: typedItem.category || typedItem.Category || 'Generale',
          createdAt: typedItem.createdAt || typedItem.CreatedAt,
          updatedAt: typedItem.updatedAt || typedItem.UpdatedAt
        };
      });
      
      logger.dev('✅ Dati mappati:', mappedData);
      logger.dev('📦 Primo elemento mappato:', mappedData[0]);
      
      return mappedData;
    } catch (error) {
      logger.error('Errore nel caricamento del glossario:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<GlossaryTerm> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Glossary/GetById/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (!validateResponseContentType(response, 'application/json')) {
        throw new Error('Risposta API non valida: Content-Type non corretto');
      }
      return await response.json();
    } catch (error) {
      logger.error('Errore nel recupero del termine:', error);
      throw error;
    }
  },

  getByWord: async (word: string): Promise<GlossaryTerm[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Glossary/GetByWord/${encodeURIComponent(word)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      logger.error('Errore nella ricerca per parola:', error);
      throw error;
    }
  },

  getSuggestions: async (query: string, limit: number = 5): Promise<string[]> => {
    try {
      if (!query.trim() || query.length < 2) {
        return [];
      }
      
      const url = `${API_BASE_URL}/Glossary/GetByWord/${encodeURIComponent(query)}`;
      logger.dev('🔍 Chiamata API getSuggestions (Glossario):', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      logger.dev('📊 Risposta getSuggestions status:', response.status);
      
      if (!response.ok) {
        // Se è 404 o 400, non ci sono suggerimenti (non è un errore)
        if (response.status === 404 || response.status === 400) {
          logger.dev('ℹ️ Nessun suggerimento trovato per:', query);
          return [];
        }
        logger.warn('⚠️ Errore HTTP nei suggerimenti:', response.status);
        return [];
      }
      
      const data = await response.json();
      logger.dev('📦 Dati ricevuti per suggerimenti:', data);
      
      const terms = Array.isArray(data) ? data : [];
      logger.dev('📦 Numero di termini trovati:', terms.length);
      
      // Mappa i dati come nel componente Glossario per gestire formati diversi
      const mappedTerms = terms.map((item: Partial<GlossaryTerm> & { boomerWord?: string; name?: string }) => ({
        term: item.term || item.boomerWord || item.name || '',
      }));
      
      // Estrai solo i termini unici e limitati, filtrando quelli vuoti
      const suggestions = Array.from(
        new Set(
          mappedTerms
            .map((term) => term.term)
            .filter((term) => term && term.trim().length > 0)
        )
      ).slice(0, limit);
      
      logger.dev('✅ Suggerimenti estratti:', suggestions);
      return suggestions;
    } catch (error) {
      logger.error('❌ Errore nel recupero dei suggerimenti:', error);
      return [];
    }
  },

  add: async (glossary: GlossaryModel): Promise<GlossaryTerm> => {
    try {
      // Sanitizzazione e validazione input (defense in depth)
      const sanitizedTerm = sanitizeInput(glossary.term);
      const sanitizedDefinition = sanitizeInput(glossary.definition);
      const sanitizedCategory = sanitizeInput(glossary.category);
      
      // Validazione
      const termValidation = validateTerm(sanitizedTerm);
      const definitionValidation = validateDefinition(sanitizedDefinition);
      const categoryValidation = validateCategory(sanitizedCategory);
      
      if (!termValidation.valid) {
        throw new Error(termValidation.error || 'Errore di validazione termine');
      }
      if (!definitionValidation.valid) {
        throw new Error(definitionValidation.error || 'Errore di validazione definizione');
      }
      if (!categoryValidation.valid) {
        throw new Error(categoryValidation.error || 'Errore di validazione categoria');
      }
      
      // Mappa i campi del frontend a quelli del backend (con dati sanitizzati)
      const backendData = {
        term: sanitizedTerm,
        description: sanitizedDefinition, // Backend usa 'description', frontend usa 'definition'
        category: sanitizedCategory
      };
      
      logger.dev('📤 Glossario Add - Dati inviati al backend:', backendData);
      
      const response = await fetch(`${API_BASE_URL}/Glossary/Add`, {
        method: 'POST',
        headers: createHeaders(true), // Include token per autenticazione admin
        body: JSON.stringify(backendData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      // Mappa la risposta del backend al formato frontend
      return {
        ...result,
        definition: result.description || result.Description || result.definition
      };
    } catch (error) {
      logger.error('Errore nell\'aggiunta del termine:', error);
      throw error;
    }
  },

  update: async (id: number, glossary: GlossaryModel): Promise<GlossaryTerm> => {
    try {
      // Sanitizzazione e validazione input (defense in depth)
      const sanitizedTerm = sanitizeInput(glossary.term);
      const sanitizedDefinition = sanitizeInput(glossary.definition);
      const sanitizedCategory = sanitizeInput(glossary.category);
      
      // Validazione
      const termValidation = validateTerm(sanitizedTerm);
      const definitionValidation = validateDefinition(sanitizedDefinition);
      const categoryValidation = validateCategory(sanitizedCategory);
      
      if (!termValidation.valid) {
        throw new Error(termValidation.error || 'Errore di validazione termine');
      }
      if (!definitionValidation.valid) {
        throw new Error(definitionValidation.error || 'Errore di validazione definizione');
      }
      if (!categoryValidation.valid) {
        throw new Error(categoryValidation.error || 'Errore di validazione categoria');
      }
      
      // Mappa i campi del frontend a quelli del backend (con dati sanitizzati)
      const backendData = {
        term: sanitizedTerm,
        description: sanitizedDefinition, // Backend usa 'description', frontend usa 'definition'
        category: sanitizedCategory
      };
      
      logger.dev('📤 Glossario Update - Dati inviati al backend:', backendData);
      
      const response = await fetch(`${API_BASE_URL}/Glossary/Update/${id}`, {
        method: 'PUT',
        headers: createHeaders(true), // Include token per autenticazione admin
        body: JSON.stringify(backendData)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      
      // Mappa la risposta del backend al formato frontend
      return {
        ...result,
        definition: result.description || result.Description || result.definition
      };
    } catch (error) {
      logger.error('Errore nell\'aggiornamento del termine:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Glossary/Delete/${id}`, {
        method: 'DELETE',
        headers: createHeaders(true), // Include token per autenticazione admin
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      logger.error('Errore nell\'eliminazione del termine:', error);
      throw error;
    }
  }
};

export interface TranslatorModel {
  id?: number;
  boomerWord: string;
  slangWord: string;
  description?: string;
}

// Interfaccia per i dati che arrivano dal backend
export interface TranslatorBackendModel {
  id: number;
  oldWord: string;
  newWord: string;
  descriptionWord?: string;
}

// Interfaccia per l'uso nel frontend
export interface TranslationResult {
  id?: number;
  boomerWord: string;
  slangWord: string;
  description?: string;
}

export const translatorApi = {
  getAll: async (): Promise<TranslationResult[]> => {
    try {
      const url = `${API_BASE_URL}/Translator/GetAll`;
      logger.dev('🔍 Chiamata API getAll:', url);
      logger.dev('🔍 API_BASE_URL:', API_BASE_URL);
      logger.dev('🔍 URL completo:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      logger.dev('📊 Risposta status:', response.status, response.statusText);
      logger.dev('📊 Response URL:', response.url);
      
      if (!response.ok) {
        const errorText = await response.text();
        logger.dev('ℹ️ Risposta backend:', errorText);
        logger.dev('ℹ️ Status:', response.status);
        
        // Se è un 404, potrebbe essere database vuoto o endpoint non trovato
        if (response.status === 404) {
          // Se il messaggio è "No Words found", il database è vuoto
          if (errorText.includes('No Words found')) {
            logger.dev('ℹ️ Nessuna traduzione trovata nel database, restituisco array vuoto');
            return [];
          }
          // Altrimenti l'endpoint non esiste o il backend non è raggiungibile
          // Restituisci array vuoto senza sollevare errore - è una funzionalità opzionale
          logger.warn('⚠️ Endpoint GetAll non trovato (404). Verifica che il backend sia in esecuzione su http://localhost:5147');
          logger.warn('⚠️ Verifica anche che il controller Translator sia registrato correttamente');
          logger.warn('⚠️ La ricerca per parola (GetByWord) funzionerà comunque');
          return [];
        }
        
        // Per altri errori HTTP, solleva l'errore solo se non è un problema di rete
        // Se è un errore server (500, etc), prova comunque a restituire array vuoto
        if (response.status >= 500) {
          logger.error('❌ Errore server:', errorText);
          return [];
        }
        
        // Per altri errori client (400, 403, etc), solleva l'errore
        logger.error('❌ Risposta errore:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const backendData: TranslatorBackendModel[] = await response.json();
      logger.dev('✅ Dati grezzi ricevuti:', backendData);
      
      // Mappa tutti i risultati dal formato backend al formato frontend
      const mappedData: TranslationResult[] = backendData.map(item => ({
        id: item.id,
        boomerWord: item.oldWord,
        slangWord: item.newWord,
        description: item.descriptionWord
      }));
      
      logger.dev('✅ Dati mappati:', mappedData);
      return mappedData;
    } catch (error) {
      // Se è un errore di rete, gestiscilo
      if (error instanceof TypeError && error.message.includes('fetch')) {
        logger.error('❌ Errore di rete nel caricamento delle traduzioni:', error);
        logger.error('❌ Verifica che il backend sia in esecuzione su http://localhost:5147');
        throw error;
      }
      logger.error('Errore nel caricamento delle traduzioni:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<TranslationResult> => {
    try {
      const url = `${API_BASE_URL}/Translator/GetById/${id}`;
      logger.dev('🔍 Chiamata API getById:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 404) {
          throw new Error(`Traduzione non trovata: ${errorText}`);
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      logger.error('Errore nel recupero della traduzione:', error);
      throw error;
    }
  },

  getSuggestions: async (query: string, allTranslations: TranslationResult[] = [], limit: number = 5): Promise<string[]> => {
    try {
      if (!query.trim() || query.length < 2) {
        return [];
      }
      
      const queryLower = query.toLowerCase().trim();
      
      // Se abbiamo già i dati caricati, usali; altrimenti carica dal backend
      let translations = allTranslations;
      if (translations.length === 0) {
        translations = await translatorApi.getAll();
      }
      
      // Estrai tutti i termini (boomer e slang) che corrispondono
      const suggestions = new Set<string>();
      
      translations.forEach(translation => {
        if (translation.boomerWord.toLowerCase().includes(queryLower)) {
          suggestions.add(translation.boomerWord);
        }
        if (translation.slangWord.toLowerCase().includes(queryLower)) {
          suggestions.add(translation.slangWord);
        }
      });
      
      return Array.from(suggestions).slice(0, limit);
    } catch (error) {
      logger.error('Errore nel recupero dei suggerimenti:', error);
      return [];
    }
  },

  getByWord: async (word: string): Promise<TranslationResult | null> => {
    try {
      const url = `${API_BASE_URL}/Translator/GetByWord/${encodeURIComponent(word)}`;
      logger.dev('🔍 Chiamata API getByWord:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        // Il backend può restituire 404 o 400 quando il termine non viene trovato
        if (response.status === 404 || response.status === 400) {
          // Parola non trovata, non è un errore critico
          logger.dev('ℹ️ Parola non trovata:', word, '(status:', response.status + ')');
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const backendData: TranslatorBackendModel = await response.json();
      logger.dev('📦 Dati grezzi dal backend:', backendData);
      
      // Mappa i nomi dei campi del backend ai nomi usati nel frontend
      const mappedResult: TranslationResult = {
        id: backendData.id,
        boomerWord: backendData.oldWord,
        slangWord: backendData.newWord,
        description: backendData.descriptionWord
      };
      
      logger.dev('✅ Dati mappati per il frontend:', mappedResult);
      return mappedResult;
    } catch (error) {
      logger.error('Errore nella ricerca per parola:', error);
      throw error;
    }
  },

  add: async (translator: TranslatorModel): Promise<string> => {
    try {
      // Sanitizzazione e validazione input (defense in depth)
      const sanitizedBoomerWord = sanitizeInput(translator.boomerWord);
      const sanitizedSlangWord = sanitizeInput(translator.slangWord);
      const sanitizedDescription = translator.description ? sanitizeInput(translator.description) : '';
      
      // Validazione
      const boomerValidation = validateWord(sanitizedBoomerWord, 'Parola Boomer');
      const slangValidation = validateWord(sanitizedSlangWord, 'Parola Slang');
      const descriptionValidation = validateDescription(sanitizedDescription);
      
      if (!boomerValidation.valid) {
        throw new Error(boomerValidation.error || 'Errore di validazione parola boomer');
      }
      if (!slangValidation.valid) {
        throw new Error(slangValidation.error || 'Errore di validazione parola slang');
      }
      if (!descriptionValidation.valid) {
        throw new Error(descriptionValidation.error || 'Errore di validazione descrizione');
      }
      
      const url = `${API_BASE_URL}/Translator/Add`;
      logger.dev('🔍 Chiamata API add:', url);
      
      // Mappa i campi del frontend a quelli del backend (con dati sanitizzati)
      const backendData = {
        oldWord: sanitizedBoomerWord,
        newWord: sanitizedSlangWord,
        descriptionWord: sanitizedDescription
      };
      
      logger.dev('📤 Dati inviati al backend:', backendData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: createHeaders(true), // Include token per autenticazione admin
        body: JSON.stringify(backendData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.text();
      return result;
    } catch (error) {
      logger.error('Errore nell\'aggiunta della traduzione:', error);
      throw error;
    }
  },

  update: async (id: number, translator: TranslatorModel): Promise<string> => {
    try {
      // Sanitizzazione e validazione input (defense in depth)
      const sanitizedBoomerWord = sanitizeInput(translator.boomerWord);
      const sanitizedSlangWord = sanitizeInput(translator.slangWord);
      const sanitizedDescription = translator.description ? sanitizeInput(translator.description) : '';
      
      // Validazione
      const boomerValidation = validateWord(sanitizedBoomerWord, 'Parola Boomer');
      const slangValidation = validateWord(sanitizedSlangWord, 'Parola Slang');
      const descriptionValidation = validateDescription(sanitizedDescription);
      
      if (!boomerValidation.valid) {
        throw new Error(boomerValidation.error || 'Errore di validazione parola boomer');
      }
      if (!slangValidation.valid) {
        throw new Error(slangValidation.error || 'Errore di validazione parola slang');
      }
      if (!descriptionValidation.valid) {
        throw new Error(descriptionValidation.error || 'Errore di validazione descrizione');
      }
      
      const url = `${API_BASE_URL}/Translator/Update/${id}`;
      logger.dev('🔍 Chiamata API update:', url);
      
      // Mappa i campi del frontend a quelli del backend (con dati sanitizzati)
      const backendData = {
        oldWord: sanitizedBoomerWord,
        newWord: sanitizedSlangWord,
        descriptionWord: sanitizedDescription
      };
      
      logger.dev('📤 Dati inviati al backend:', backendData);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: createHeaders(true), // Include token per autenticazione admin
        body: JSON.stringify(backendData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 404) {
          throw new Error(`Traduzione non trovata: ${errorText}`);
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.text();
      return result;
    } catch (error) {
      logger.error('Errore nell\'aggiornamento della traduzione:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<string> => {
    try {
      const url = `${API_BASE_URL}/Translator/Delete/${id}`;
      logger.dev('🔍 Chiamata API delete:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: createHeaders(true), // Include token per autenticazione admin
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 404) {
          throw new Error(`Traduzione non trovata: ${errorText}`);
        }
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.text();
      return result;
    } catch (error) {
      logger.error('Errore nell\'eliminazione della traduzione:', error);
      throw error;
    }
  }
};

// Database locale con tutte le pagine del sito
const localSearchPages: SearchPage[] = [
  {
    id: 1,
    title: 'Home',
    keywords: ['home', 'principale', 'inizio', 'sgam', 'servizi', 'digitali'],
    route: '/',
    category: 'Pagine Principali'
  },
  {
    id: 2,
    title: 'Protezione Anti-Frode',
    keywords: ['antifrode', 'frode', 'truffa', 'sicurezza', 'protezione', 'segnalazione', 'truffe online'],
    route: '/servizio-antifrode',
    category: 'Sicurezza'
  },
  {
    id: 3,
    title: 'Guide',
    keywords: ['guide', 'tutorial', 'aiuto', 'istruzioni', 'come fare'],
    route: '/guide',
    category: 'Guide'
  },
  {
    id: 4,
    title: 'Guida SPID',
    keywords: ['spid', 'identità digitale', 'accesso', 'login', 'registrazione', 'come ottenere spid', 'identità'],
    route: '/guide/spid',
    category: 'Guide'
  },
  {
    id: 5,
    title: 'Guida PEC',
    keywords: ['pec', 'posta elettronica certificata', 'email', 'casella pec', 'attivazione pec'],
    route: '/guide/pec',
    category: 'Guide'
  },
  {
    id: 6,
    title: 'Guida CIE',
    keywords: ['cie', 'carta identità elettronica', 'documento', 'identità', 'carta'],
    route: '/guide/cie',
    category: 'Guide'
  },
  {
    id: 7,
    title: 'Guida Sicurezza',
    keywords: ['sicurezza', 'password', 'protezione', 'privacy', 'dati', 'truffe', 'phishing'],
    route: '/guide/sicurezza',
    category: 'Guide'
  },
  {
    id: 8,
    title: 'Guida Primo Accesso',
    keywords: ['primo accesso', 'registrazione', 'iscrizione', 'nuovo utente', 'iniziare'],
    route: '/guide/primo-accesso',
    category: 'Guide'
  },
  {
    id: 9,
    title: 'Guida Recupero Password',
    keywords: ['recupero password', 'password dimenticata', 'reset password', 'cambio password', 'reimpostare'],
    route: '/guide/recupero-password',
    category: 'Guide'
  },
  {
    id: 10,
    title: 'Guida Certificati Online',
    keywords: ['certificati', 'certificato anagrafico', 'documenti', 'online', 'richiedere certificato'],
    route: '/guide/certificati-online',
    category: 'Guide'
  },
  {
    id: 11,
    title: 'Guida Pagamenti DM Sanitari',
    keywords: ['pagamenti', 'dm sanitari', 'dispositivi medici', 'ticket', 'sanità', 'salute'],
    route: '/guide/pagamenti-dm-sanitari',
    category: 'Guide'
  },
  {
    id: 12,
    title: 'Guida Anagrafe Digitale',
    keywords: ['anagrafe', 'anagrafe digitale', 'dati anagrafici', 'residenza', 'cambio residenza'],
    route: '/guide/anagrafe-digitale',
    category: 'Guide'
  },
  {
    id: 13,
    title: 'Guida Prenotazioni ASL Puglia',
    keywords: ['prenotazioni', 'asl puglia', 'visite mediche', 'cup', 'prenotare visita', 'sanità puglia', 'appuntamento medico', 'numero verde', 'farmacie'],
    route: '/guide/prenotazioni-asl-puglia',
    category: 'Guide'
  },
  {
    id: 13.1,
    title: 'Guida Prenotazioni ASL Puglia',
    keywords: ['prenotazioni', 'asl puglia', 'visite mediche', 'cup', 'prenotare visita', 'sanità puglia', 'appuntamento medico', 'numero verde', 'farmacie', 'asl'],
    route: '/guide/asl',
    category: 'Guide'
  },
  {
    id: 14,
    title: 'Glossario',
    keywords: ['glossario', 'termini', 'definizioni', 'dizionario', 'significato', 'parole'],
    route: '/glossario',
    category: 'Strumenti'
  },
  {
    id: 15,
    title: 'Traduttore Generazionale',
    keywords: ['traduttore', 'generazionale', 'slang', 'linguaggio', 'giovani', 'boomer', 'traduzione'],
    route: '/traduttore-generazionale',
    category: 'Strumenti'
  },
  {
    id: 16,
    title: 'Info',
    keywords: ['info', 'informazioni', 'contatti', 'chi siamo', 'about'],
    route: '/info',
    category: 'Informazioni'
  },
  {
    id: 18,
    title: 'Privacy Policy',
    keywords: ['privacy', 'policy', 'gdpr', 'dati personali', 'trattamento dati', 'cookie'],
    route: '/privacy',
    category: 'Informazioni'
  }
];

export const searchApi = {
  // Ricerca locale che funziona sempre (non dipende dal backend)
  searchLocal: (query: string): SearchPage[] => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    
    const filtered = localSearchPages.filter(page => {
      // Cerca nel titolo
      if (page.title.toLowerCase().includes(searchTerm)) {
        return true;
      }
      
      // Cerca nelle keywords
      return page.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchTerm)
      );
    });

    // Ordina per rilevanza
    return filtered.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(searchTerm);
      const bTitleMatch = b.title.toLowerCase().includes(searchTerm);
      
      // Priorità: match nel titolo > match nelle keywords
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      
      // Se entrambi hanno match nel titolo, ordina per posizione del match
      if (aTitleMatch && bTitleMatch) {
        const aIndex = a.title.toLowerCase().indexOf(searchTerm);
        const bIndex = b.title.toLowerCase().indexOf(searchTerm);
        if (aIndex !== bIndex) return aIndex - bIndex;
      }
      
      return 0;
    });
  },

  // Ricerca che prova prima il backend, poi fallback locale (con cache)
  search: async (query: string): Promise<SearchPage[]> => {
    try {
      // Prova prima con il backend - usa cachedFetch con cache di 5 minuti
      const data = await cachedFetch<SearchPage[]>(
        `${API_BASE_URL}/Search/Search/${encodeURIComponent(query)}`,
        { method: 'GET' },
        5 * 60 * 1000 // 5 minuti cache
      );
      return Array.isArray(data) ? data : [];
    } catch (error) {
      // Se il backend non è disponibile, usa la ricerca locale
      logger.dev('Backend non disponibile, uso ricerca locale:', error);
      return searchApi.searchLocal(query);
    }
  },

  getAllPages: async (): Promise<SearchPage[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/Search/GetAllPages`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      // Fallback locale
      logger.dev('Backend non disponibile, restituisco pagine locali:', error);
      return localSearchPages;
    }
  }
};