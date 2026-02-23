/**
 * Utility per validazione input avanzata
 * Previene input malformati e attacchi
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valida un termine del glossario
 */
export const validateTerm = (term: string): ValidationResult => {
  if (!term || term.trim().length === 0) {
    return { valid: false, error: 'Il termine è obbligatorio' };
  }
  
  if (term.length > 200) {
    return { valid: false, error: 'Il termine non può superare 200 caratteri' };
  }
  
  // Permette lettere, numeri, spazi, punteggiatura comune e caratteri accentati
  if (!/^[a-zA-Z0-9\s\-_.,;:!?'"àèéìòùÀÈÉÌÒÙ]+$/i.test(term)) {
    return { valid: false, error: 'Il termine contiene caratteri non validi' };
  }
  
  return { valid: true };
};

/**
 * Valida una definizione
 */
export const validateDefinition = (definition: string): ValidationResult => {
  if (!definition || definition.trim().length === 0) {
    return { valid: false, error: 'La definizione è obbligatoria' };
  }
  
  if (definition.length > 2000) {
    return { valid: false, error: 'La definizione non può superare 2000 caratteri' };
  }
  
  // Controlla pattern sospetti di XSS
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];
  
  for (const pattern of xssPatterns) {
    if (pattern.test(definition)) {
      return { valid: false, error: 'La definizione contiene contenuto non sicuro' };
    }
  }
  
  return { valid: true };
};

/**
 * Valida una categoria
 */
export const validateCategory = (category: string): ValidationResult => {
  if (!category || category.trim().length === 0) {
    return { valid: false, error: 'La categoria è obbligatoria' };
  }
  
  if (category.length > 100) {
    return { valid: false, error: 'La categoria non può superare 100 caratteri' };
  }
  
  return { valid: true };
};

/**
 * Valida una parola boomer/slang
 */
export const validateWord = (word: string, fieldName: string = 'Parola'): ValidationResult => {
  if (!word || word.trim().length === 0) {
    return { valid: false, error: `${fieldName} è obbligatoria` };
  }
  
  if (word.length > 100) {
    return { valid: false, error: `${fieldName} non può superare 100 caratteri` };
  }
  
  // Permette lettere, numeri, spazi e caratteri accentati
  if (!/^[a-zA-Z0-9\s\-_àèéìòùÀÈÉÌÒÙ]+$/i.test(word)) {
    return { valid: false, error: `${fieldName} contiene caratteri non validi` };
  }
  
  return { valid: true };
};

/**
 * Valida una descrizione
 */
export const validateDescription = (description: string): ValidationResult => {
  // Descrizione è opzionale, ma se presente deve essere valida
  if (!description || description.trim().length === 0) {
    return { valid: true }; // Opzionale
  }
  
  if (description.length > 1000) {
    return { valid: false, error: 'La descrizione non può superare 1000 caratteri' };
  }
  
  // Controlla pattern sospetti di XSS
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
  ];
  
  for (const pattern of xssPatterns) {
    if (pattern.test(description)) {
      return { valid: false, error: 'La descrizione contiene contenuto non sicuro' };
    }
  }
  
  return { valid: true };
};

/**
 * Valida password admin
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.length === 0) {
    return { valid: false, error: 'La password è obbligatoria' };
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'La password deve contenere almeno 8 caratteri' };
  }
  
  if (password.length > 128) {
    return { valid: false, error: 'La password non può superare 128 caratteri' };
  }
  
  return { valid: true };
};

/**
 * Valida che una stringa non contenga solo spazi
 */
export const validateNotOnlySpaces = (input: string, fieldName: string): ValidationResult => {
  if (!input || input.trim().length === 0) {
    return { valid: false, error: `${fieldName} non può essere vuoto` };
  }
  
  return { valid: true };
};

