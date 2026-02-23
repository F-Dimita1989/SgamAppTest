/**
 * Utility per gestione errori sicura
 * Non espone informazioni sensibili agli utenti
 */

import { logger } from "./logger";

/**
 * Gestisce errori API in modo sicuro
 * In produzione, non mostra dettagli tecnici
 */
export const handleApiError = (error: unknown): string => {
  const isProduction = import.meta.env.PROD;

  if (error instanceof Error) {
    // In produzione, mostra solo messaggi generici
    if (isProduction) {
      // Non esporre stack trace o dettagli tecnici
      if (
        error.message.includes("fetch") ||
        error.message.includes("network")
      ) {
        return "Errore di connessione. Verifica la tua connessione internet e riprova.";
      }

      if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        return "Accesso non autorizzato. Effettua il login.";
      }

      if (
        error.message.includes("403") ||
        error.message.includes("Forbidden")
      ) {
        return "Accesso negato. Non hai i permessi necessari.";
      }

      if (
        error.message.includes("404") ||
        error.message.includes("Not Found")
      ) {
        return "Risorsa non trovata.";
      }

      if (
        error.message.includes("500") ||
        error.message.includes("Internal Server Error")
      ) {
        return "Errore del server. Riprova più tardi.";
      }

      // Messaggio generico per altri errori
      return "Si è verificato un errore. Riprova più tardi.";
    }

    // In sviluppo, mostra il messaggio completo
    return error.message;
  }

  // Errore sconosciuto
  return isProduction
    ? "Si è verificato un errore imprevisto. Riprova più tardi."
    : "Errore sconosciuto";
};

/**
 * Logga errori in modo sicuro (solo in sviluppo o se esplicitamente abilitato)
 */
export const logError = (error: unknown, context?: string): void => {
  if (context) {
    logger.error(`[${context}]`, error);
  } else {
    logger.error(error);
  }

  // In produzione, invia errori a Sentry se configurato (async, non blocca)
  if (import.meta.env.PROD) {
    import("./sentry")
      .then(({ captureException }) => {
        captureException(error, { context });
      })
      .catch(() => {
        // Ignora se Sentry non è configurato
      });
  }
};

/**
 * Gestisce errori di validazione
 */
export const handleValidationError = (errors: string[]): string => {
  if (errors.length === 0) return "";
  if (errors.length === 1) return errors[0];
  return `Errori di validazione: ${errors.join(", ")}`;
};
