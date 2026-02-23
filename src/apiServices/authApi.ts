/**
 * API per autenticazione admin
 * Gestisce login, logout e verifica token con backend
 */

import { logger } from "../utils/logger";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "https://sgamapp.onrender.com/api" : "/api");

export interface LoginResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  expiresAt?: number;
}

/**
 * Effettua login con password
 * Endpoint backend: POST /api/admin/login
 *
 * IMPORTANTE - Cookie Security:
 * - Il backend DEVE impostare cookie con flag: HttpOnly, Secure, SameSite=Lax
 * - credentials: 'include' è necessario per inviare/ricevere cookie HttpOnly
 * - In produzione, il token dovrebbe essere gestito dal backend tramite HttpOnly cookie
 */
export const loginApi = async (password: string): Promise<LoginResponse> => {
  // Prova SEMPRE prima il backend (anche in sviluppo)
  // Il fallback dev è solo un backup se il backend non è raggiungibile
  try {
    const url = `${API_BASE_URL}/admin/login`;
    logger.dev("🔐 Tentativo login backend:", url);
    logger.dev("🔐 API_BASE_URL:", API_BASE_URL);
    logger.dev("🔐 Password length:", password.length);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // CRITICO: Necessario per cookie HttpOnly (Secure, SameSite=Lax)
      body: JSON.stringify({ password }),
    });

    logger.dev("🔐 Response status:", response.status);
    logger.dev("🔐 Response ok:", response.ok);
    logger.dev(
      "🔐 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const responseText = await response.text();
      logger.dev("🔐 Response text:", responseText);

      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error: responseText || "Errore di autenticazione" };
      }

      logger.dev("🔐 Error data:", errorData);

      // Se il backend risponde con errore, restituisci l'errore
      // (non usare fallback dev se il backend è raggiungibile)
      return {
        success: false,
        error:
          errorData.error ||
          errorData.message ||
          `Errore ${response.status}: Password non corretta`,
      };
    }

    const responseText = await response.text();
    logger.dev("🔐 Response text:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      // Se non è JSON, potrebbe essere una stringa semplice
      logger.dev("🔐 Response non è JSON, è stringa:", responseText);
      // Se la risposta è solo "OK" o simile, considera successo
      if (responseText.includes("OK") || response.status === 200) {
        data = { success: true };
      } else {
        throw new Error("Risposta non valida dal backend");
      }
    }

    logger.dev("🔐 Response data:", data);

    // Il backend imposta il cookie HttpOnly, quindi il token nella risposta
    // è opzionale (solo per compatibilità o fallback sviluppo)
    // In produzione, il token è gestito dal backend tramite HttpOnly cookie
    const token = data.token || data.accessToken || data.jwtToken;

    // Se il backend risponde con {"ok": true} senza token, significa che usa solo cookie HttpOnly
    // In questo caso, il login è riuscito ma non abbiamo token in memory
    const loginSuccess =
      data.ok === true || data.success === true || token !== undefined;

    logger.dev("🔐 Login success:", loginSuccess);
    logger.dev("🔐 Token presente:", !!token);

    // Salva il token se presente (fallback per quando i cookie non funzionano)
    // In produzione cross-origin, i cookie HttpOnly potrebbero non funzionare
    // quindi salviamo il token come fallback
    if (token) {
      setStoredToken(token);
    }

    // Se il login ha successo ma non c'è token, significa che il backend usa solo cookie
    // Restituisci success: true anche senza token (la verifica userà i cookie)
    if (loginSuccess) {
      logger.dev(
        "🔐 Login backend riuscito, token presente:",
        !!token,
        "cookie-based:",
        !token
      );
      return {
        success: true,
        token: token, // Potrebbe essere undefined se usa solo cookie
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn || data.expires_in || 3600, // Default 1 ora
      };
    }

    // Se non è successo, restituisci errore
    return {
      success: false,
      error: "Login fallito",
    };
  } catch (error) {
    // Errore di rete (backend non raggiungibile)
    logger.dev("🔐 Errore connessione backend:", error);

    // Fallback per sviluppo SOLO se backend non raggiungibile (errore di rete)
    // ⚠️ SOLO IN SVILUPPO - Mai in produzione
    // ⚠️ Usa variabile d'ambiente VITE_DEV_ADMIN_PASSWORD
    // ⚠️ Questa variabile è esposta al client, NON è sicura per produzione
    if (import.meta.env.DEV && !import.meta.env.PROD) {
      const DEV_PASSWORD = import.meta.env.VITE_DEV_ADMIN_PASSWORD;

      // Se la password di sviluppo è configurata e corrisponde, usa il fallback
      // SOLO se il backend non è raggiungibile (errore di rete)
      if (DEV_PASSWORD && password === DEV_PASSWORD) {
        logger.dev("🔐 Backend non raggiungibile, uso fallback sviluppo");
        const mockToken = btoa(
          JSON.stringify({
            admin: true,
            exp: Date.now() + 3600000,
            dev: true,
          })
        );
        setStoredToken(mockToken);
        return {
          success: true,
          token: mockToken,
          expiresIn: 3600,
        };
      }
    }

    // In produzione, non fornire fallback
    // L'errore deve essere gestito dal backend
    return {
      success: false,
      error:
        "Errore di connessione al server. Verifica che il backend sia in esecuzione.",
    };
  }
};

/**
 * Verifica se il token è valido
 * Endpoint backend: GET https://sgamapp.onrender.com/api/admin/verify (protetto con [Authorize(Policy = "AdminOnly")])
 *
 * IMPORTANTE - Cookie Security:
 * - credentials: 'include' è necessario per inviare cookie HttpOnly al backend
 * - Il backend valida il cookie HttpOnly (non serve più Bearer token in header)
 * - In produzione, il token è gestito dal backend tramite HttpOnly cookie
 */
export const verifyAuthApi = async (): Promise<AuthStatusResponse> => {
  try {
    // PROVA SEMPRE PRIMA CON I COOKIE (sia in dev che prod)
    // Il backend usa cookie HttpOnly, quindi proviamo sempre prima con i cookie
    const url = `${API_BASE_URL}/admin/verify`;
    logger.dev("🔐 Verify auth - chiamata cookie-based:", url);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include", // CRITICO: Necessario per cookie HttpOnly (Secure, SameSite=Lax)
      });

      logger.dev("🔐 Verify auth (cookie) - response status:", response.status);
      logger.dev("🔐 Verify auth (cookie) - response ok:", response.ok);

      if (response.ok) {
        const responseText = await response.text();
        logger.dev("🔐 Verify auth (cookie) - response text:", responseText);

        try {
          const data = JSON.parse(responseText);
          logger.dev("🔐 Verify auth (cookie) - JSON parsed:", data);

          // Se la risposta è {"ok": true} o {"authenticated": true}, considera autenticato
          if (data.ok === true || data.authenticated === true) {
            logger.dev("🔐 Verify auth (cookie) - autenticato (JSON)");
            return {
              authenticated: true,
              expiresAt: data.expiresAt,
            };
          }
        } catch {
          // Se non è JSON, controlla se è una stringa "OK"
          if (responseText.includes("OK") || response.status === 200) {
            logger.dev("🔐 Verify auth (cookie) - autenticato (stringa OK)");
            return {
              authenticated: true,
            };
          }
        }
      } else {
        logger.dev(
          "🔐 Verify auth (cookie) - response non ok:",
          response.status
        );
      }
    } catch (error) {
      logger.dev("🔐 Verify auth (cookie) - errore:", error);
    }

    // Fallback: se i cookie non funzionano, prova con il token in memory
    // Questo è necessario in produzione cross-origin quando i cookie HttpOnly
    // con SameSite=Lax non vengono inviati
    const token = getStoredToken();
    logger.dev("🔐 Verify auth - token presente:", !!token);

    if (!token) {
      logger.dev("🔐 Verify auth - nessun token, non autenticato");
      // In sviluppo, se non c'è token ma il login aveva successo,
      // potrebbe essere che i cookie non funzionano. Restituiamo false
      // e lasciamo che AuthContext gestisca (accetterà comunque se login aveva successo)
      return { authenticated: false };
    }

    const verifyUrl = `${API_BASE_URL}/admin/verify`;
    logger.dev("🔐 Verify auth - chiamata con token:", verifyUrl);

    try {
      const response = await fetch(verifyUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        credentials: "include", // CRITICO: Necessario per cookie HttpOnly (Secure, SameSite=Lax)
      });

      logger.dev("🔐 Verify auth - response status:", response.status);
      logger.dev("🔐 Verify auth - response ok:", response.ok);

      if (response.ok) {
        // Il backend ritorna "Accesso admin OK" come stringa o JSON
        const responseText = await response.text();
        logger.dev("🔐 Verify auth - response text:", responseText);

        try {
          const data = JSON.parse(responseText);
          logger.dev("🔐 Verify auth - JSON parsed:", data);
          return {
            authenticated: true,
            expiresAt: data.expiresAt,
          };
        } catch {
          // Se è solo una stringa "Accesso admin OK", considera autenticato
          if (responseText.includes("OK") || response.status === 200) {
            logger.dev("🔐 Verify auth - autenticato (stringa OK)");
            return {
              authenticated: true,
            };
          }
        }
      } else {
        logger.dev("🔐 Verify auth - response non ok:", response.status);
      }
    } catch (error) {
      logger.dev("🔐 Verify auth - errore:", error);
      // Se abbiamo un token mock (dev), considera autenticato
      if (token) {
        try {
          const decoded = JSON.parse(atob(token));
          if (decoded.dev && decoded.admin) {
            logger.dev("🔐 Verify auth - token dev valido");
            return { authenticated: true, expiresAt: decoded.exp };
          }
        } catch {
          // Token non valido o non è un token mock
        }
      }
    }

    logger.dev("🔐 Verify auth - non autenticato");
    return { authenticated: false };
  } catch {
    // Fallback: verifica token in memory (per dev mock o fallback produzione)
    const token = getStoredToken();
    if (token) {
      try {
        const decoded = JSON.parse(atob(token));
        // Verifica se è un token valido (dev mock o token reale)
        if (decoded.admin) {
          // Se è un token dev, controlla exp
          if (decoded.dev && decoded.exp > Date.now()) {
            return { authenticated: true, expiresAt: decoded.exp };
          }
          // Se non è un token dev, potrebbe essere un token reale
          // In questo caso, assumiamo che sia valido (il backend lo validerà)
          if (!decoded.dev) {
            return { authenticated: true };
          }
        }
      } catch {
        // Token invalido
      }
    }

    return { authenticated: false };
  }
};

/**
 * Effettua logout
 * Chiama l'endpoint logout del backend per cancellare i cookie HttpOnly
 */
export const logoutApi = async (): Promise<void> => {
  try {
    // Chiama l'endpoint logout del backend per cancellare i cookie HttpOnly
    await fetch(`${API_BASE_URL}/admin/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      credentials: "include", // CRITICO: Necessario per inviare cookie HttpOnly al backend
    });
  } catch {
    // Ignora errori di logout (il backend potrebbe non avere l'endpoint)
  } finally {
    // Pulisci anche il token in memory (fallback per sviluppo)
    clearStoredToken();
  }
};

/**
 * Refresh del token
 * Nota: Se il backend non ha endpoint refresh, questa funzione non è utilizzata
 */
export const refreshTokenApi = async (
  _refreshToken: string // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<LoginResponse> => {
  // Per ora, ritorna errore (endpoint non implementato nel backend)
  return {
    success: false,
    error: "Refresh token non implementato",
  };

  // TODO: Quando il backend implementa l'endpoint refresh, decommentare:
  // try {
  //   const response = await fetch(`${API_BASE_URL}/admin/auth/refresh`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     credentials: 'include',
  //     body: JSON.stringify({ refreshToken }),
  //   });
  //
  //   if (!response.ok) {
  //     return { success: false, error: 'Errore nel refresh del token' };
  //   }
  //
  //   const data = await response.json();
  //   return {
  //     success: true,
  //     token: data.token,
  //     expiresIn: data.expiresIn,
  //   };
  // } catch (error) {
  //   return {
  //     success: false,
  //     error: 'Errore di connessione',
  //   };
  // }
};

/**
 * Salva token in modo sicuro (in memory, non in localStorage)
 *
 * SICUREZZA COOKIE:
 * - In produzione, il token DOVREBBE essere gestito dal backend tramite HttpOnly cookie
 * - HttpOnly cookie previene accesso da JavaScript (protezione XSS)
 * - Il backend deve impostare cookie con flag: Secure, HttpOnly, SameSite=Lax
 * - Questo storage in memory è solo un fallback temporaneo per cross-origin
 *
 * ⚠️ COMPROMESSO SICUREZZA:
 * - Token in memory è accessibile da JavaScript (rischio XSS)
 * - MITIGAZIONI:
 *   1. Token perso al refresh (non persistente)
 *   2. Non è in localStorage/sessionStorage (più sicuro)
 *   3. Solo fallback quando cookie non funzionano (cross-origin)
 *   4. CSP, DOMPurify e validazione XSS già implementate
 * - RACCOMANDAZIONE: Configurare backend con SameSite=None; Secure per cookie cross-origin
 *
 * @see COOKIE_SECURITY_GUIDE.md per dettagli sulla configurazione backend
 */
let tokenInMemory: string | null = null;

export const setStoredToken = (token: string): void => {
  // SICUREZZA: Salva il token in memory (non in localStorage/sessionStorage)
  // Il backend preferisce gestire il token tramite HttpOnly cookie
  // Ma in produzione cross-origin, i cookie potrebbero non funzionare
  // quindi usiamo memory storage come fallback
  // Il token viene perso al refresh della pagina (comportamento sicuro)
  //
  // ⚠️ NOTA: Token accessibile da JavaScript = rischio XSS se c'è vulnerabilità
  // Ma è mitigato da: CSP, DOMPurify, validazione, e non persistenza
  tokenInMemory = token;
};

export const getStoredToken = (): string | null => {
  // Restituisce il token in memory (fallback quando i cookie non funzionano)
  // In produzione cross-origin, i cookie HttpOnly potrebbero non funzionare
  // quindi usiamo il token in memory come fallback
  return tokenInMemory;
};

export const clearStoredToken = (): void => {
  // Pulisce solo memory storage (non usa più sessionStorage)
  tokenInMemory = null;
  // Rimuove eventuali token residui da sessionStorage (cleanup legacy)
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem("sgam_admin_token");
    sessionStorage.removeItem("sgam_admin_auth");
  }
};
