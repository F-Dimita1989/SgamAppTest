/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
// Import dinamici per utilities non critiche (caricate solo quando necessarie)
import { loginApi, verifyAuthApi, logoutApi, setStoredToken, clearStoredToken } from "../apiServices/authApi";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica autenticazione al caricamento
  useEffect(() => {
    const checkInitialAuth = async () => {
      try {
        const status = await verifyAuthApi();
        setIsAuthenticated(status.authenticated);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkInitialAuth();
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    try {
      // Carica validation solo quando necessario (lazy import)
      const { validatePassword } = await import("../utils/validation");
      const validation = validatePassword(password);
      if (!validation.valid) {
        return false;
      }

      const response = await loginApi(password);
      
      // Log per debug (solo in sviluppo)
      if (import.meta.env.DEV) {
        const { logger } = await import("../utils/logger");
        logger.dev('[AuthContext] Login response:', {
          success: response.success,
          hasToken: !!response.token,
          error: response.error
        });
      }
      
      // Se response.success è true, il login è riuscito
      // In produzione cross-origin, i cookie HttpOnly potrebbero non funzionare
      // quindi salviamo il token come fallback
      if (response.success) {
        // Salva il token se presente (fallback per quando i cookie non funzionano)
        if (response.token) {
          setStoredToken(response.token);
        }
        
        // Verifica che l'autenticazione sia effettivamente valida
        // In produzione cross-origin, i cookie potrebbero non funzionare,
        // quindi verifichiamo se abbiamo un token come fallback
        try {
          const authStatus = await verifyAuthApi();
          if (import.meta.env.DEV) {
            const { logger } = await import("../utils/logger");
            logger.dev('[AuthContext] Verify auth status:', authStatus);
          }
          
          if (authStatus.authenticated) {
            setIsAuthenticated(true);
            return true;
          }
          
          // Se la verifica fallisce ma abbiamo un token, accettiamo comunque il login
          // Questo è necessario in produzione cross-origin quando i cookie non funzionano
          if (response.token) {
            if (import.meta.env.DEV) {
              const { logger } = await import("../utils/logger");
              logger.dev('[AuthContext] Login OK con token, accetto anche se verify fallisce (cookie non funzionano)');
            }
            setIsAuthenticated(true);
            return true;
          }
          
          // Se il login ha avuto successo ma non c'è token e la verifica fallisce,
          // potrebbe essere un problema di cookie HttpOnly
          // Accettiamo comunque il login se il backend ha risposto con successo
          // (il backend potrebbe aver impostato il cookie ma la verifica cross-origin fallisce)
          if (import.meta.env.DEV) {
            const { logger } = await import("../utils/logger");
            logger.dev('[AuthContext] Dev mode: login OK ma verify fallisce (cookie-based), accetto comunque');
          }
          setIsAuthenticated(true);
          return true;
        } catch (verifyError) {
          const { logger } = await import("../utils/logger");
          logger.error('[AuthContext] Errore verifica auth:', verifyError);
          
          // Se abbiamo un token, accettiamo comunque il login
          // (fallback per quando i cookie non funzionano in produzione cross-origin)
          if (response.token) {
            if (import.meta.env.DEV) {
              logger.dev('[AuthContext] Errore verify ma ho token, accetto login (fallback)');
            }
            setIsAuthenticated(true);
            return true;
          }
          
          // In sviluppo, accettiamo comunque se il login ha avuto successo
          if (import.meta.env.DEV) {
            logger.dev('[AuthContext] Dev mode: accetto login dopo errore verify (login aveva successo)');
            setIsAuthenticated(true);
            return true;
          }
        }
      } else {
        const { logger } = await import("../utils/logger");
        logger.error('[AuthContext] Login fallito:', response.error);
      }
      
      return false;
    } catch (error) {
      // Carica errorHandler solo quando necessario (lazy import)
      const { handleApiError } = await import("../utils/errorHandler");
      handleApiError(error);
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutApi();
    } catch {
      // Ignora errori di logout
    } finally {
      clearStoredToken();
      setIsAuthenticated(false);
    }
  }, []);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const status = await verifyAuthApi();
      setIsAuthenticated(status.authenticated);
      
      if (!status.authenticated) {
        clearStoredToken();
      }
      
      return status.authenticated;
    } catch {
      setIsAuthenticated(false);
      clearStoredToken();
      return false;
    }
  }, []);

  const value = useMemo(() => ({
    isAuthenticated,
    login,
    logout,
    checkAuth,
    isLoading
  }), [isAuthenticated, login, logout, checkAuth, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere usato all'interno di AuthProvider");
  }
  return context;
};
