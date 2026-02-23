/**
 * Utility per notifiche utente sicure
 * Sostituisce alert(), confirm(), prompt() con alternative più sicure e accessibili
 */

/**
 * Mostra una notifica all'utente
 * In futuro può essere sostituita con un sistema di toast/notifiche più avanzato
 */
export const showNotification = (message: string, type: 'error' | 'warning' | 'info' | 'success' = 'info'): void => {
  // Per ora usa alert() ma in modo controllato
  // In futuro può essere sostituito con un sistema di toast
  if (type === 'error') {
    alert(`Errore: ${message}`);
  } else if (type === 'warning') {
    alert(`Attenzione: ${message}`);
  } else {
    alert(message);
  }
};

/**
 * Mostra una conferma all'utente
 * Restituisce true se l'utente conferma, false altrimenti
 */
export const showConfirmation = (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const confirmed = window.confirm(message);
    resolve(confirmed);
  });
};

/**
 * Valida e mostra errore in modo sicuro
 */
export const showError = (error: unknown, defaultMessage: string = 'Si è verificato un errore'): void => {
  const isProduction = import.meta.env.PROD;
  
  if (error instanceof Error) {
    // In produzione, mostra solo messaggi generici
    if (isProduction) {
      showNotification(defaultMessage, 'error');
    } else {
      // In sviluppo, mostra il messaggio completo
      showNotification(error.message || defaultMessage, 'error');
    }
  } else {
    showNotification(defaultMessage, 'error');
  }
};

