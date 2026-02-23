import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Props per il componente ProtectedRoute
 */
interface ProtectedRouteProps {
  /** Contenuto da proteggere */
  children: React.ReactNode;
}

/**
 * Componente per proteggere route che richiedono autenticazione
 * Reindirizza al login se l'utente non è autenticato
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, checkAuth, isLoading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    /**
     * Verifica l'autenticazione dell'utente
     */
    const verifyAuth = async (): Promise<void> => {
      if (!isAuthenticated) {
        await checkAuth();
      }
      setIsVerifying(false);
    };
    
    verifyAuth();
  }, [isAuthenticated, checkAuth]);

  // Mostra loading durante verifica
  if (isLoading || isVerifying) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          color: 'var(--colore-primario)'
        }}
        role="status"
        aria-label="Verifica autenticazione in corso"
      >
        <div 
          style={{ 
            width: '48px', 
            height: '48px', 
            border: '4px solid rgba(var(--colore-primario-rgb), 0.1)', 
            borderTop: '4px solid var(--colore-primario)', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }}
          aria-hidden="true"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/sgam-admin-login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

