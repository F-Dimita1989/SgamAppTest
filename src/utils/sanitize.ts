/**
 * Utility per sanitizzazione input/output HTML
 * Previene attacchi XSS (Cross-Site Scripting)
 * 
 * Usa DOMPurify per sanitizzazione robusta e testata
 */

import DOMPurify from 'dompurify';

/**
 * Sanitizza input di testo semplice (rimuove tutto l'HTML)
 * Usa DOMPurify per massima sicurezza
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // DOMPurify con configurazione che rimuove tutto l'HTML
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // Mantiene il contenuto testuale
  });
  
  return sanitized.trim();
};

/**
 * Sanitizza HTML permettendo solo tag sicuri
 * Usa per contenuti che devono mantenere formattazione base
 * 
 * DOMPurify è più robusto della sanitizzazione custom e previene
 * bypass complessi di XSS
 */
export const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  
  // DOMPurify con tag e attributi sicuri permessi
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // Previene javascript: e data: URLs pericolosi
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  });
  
  return sanitized.trim();
};

/**
 * Valida e sanitizza URL
 */
export const sanitizeURL = (url: string): string | null => {
  if (!url) return null;
  
  try {
    const parsed = new URL(url);
    
    // Permetti solo http e https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    
    // Rimuove javascript: e data: URLs
    if (url.toLowerCase().startsWith('javascript:') || url.toLowerCase().startsWith('data:')) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    // Se non è un URL valido, ritorna null
    return null;
  }
};

/**
 * Valida lunghezza input
 */
export const validateLength = (input: string, min: number, max: number): boolean => {
  if (!input) return min === 0;
  return input.length >= min && input.length <= max;
};

/**
 * Valida formato email (base)
 */
export const validateEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

