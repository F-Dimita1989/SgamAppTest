import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Counter.css';

/**
 * Props per il componente VisitorCounter
 */
interface VisitorCounterProps {
  /** Classe CSS aggiuntiva */
  className?: string;
  /** Intervallo di aggiornamento automatico in millisecondi (default: 30000) */
  refreshIntervalMs?: number;
}

/**
 * Costanti per la configurazione del counter
 */
const COUNTER_API_BASE = '/api/counter';
const COUNTER_INCREMENT_API = '/api/counter-increment';
const MAX_RETRIES = 3;
const TIMEOUT_MS = 10000;

/**
 * Chiavi per sessionStorage e localStorage
 */
const STORAGE_KEYS = {
  SESSION: 'sgamapp_visit_counted',
  LOCAL: 'sgamapp_local_visits',
} as const;

/**
 * Componente per visualizzare il contatore delle visite
 * 
 * Utilizza:
 * - Vite dev middleware in sviluppo
 * - Vercel Edge Functions in produzione
 * 
 * Gestisce automaticamente CORS su tutti i browser
 */
const VisitorCounter: React.FC<VisitorCounterProps> = ({ 
  className = '', 
  refreshIntervalMs = 30000 
}) => {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Recupera il conteggio delle visite con retry e timeout
   */
  const fetchCount = useCallback(async () => {
    /**
     * Funzione interna per fetch con retry e timeout
     */
    const fetchWithRetry = async (url: string, retries: number): Promise<number | null> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
          cache: 'no-cache',
          // In sviluppo, il proxy Vite gestisce CORS
          // In produzione, le Edge Functions gestiscono CORS
          mode: 'cors',
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (import.meta.env.DEV) {
            const errorText = await response.text().catch(() => '');
            const { logger } = await import('../../utils/logger');
            logger.error(
              `Counter API error: ${response.status} ${response.statusText}`,
              url,
              errorText
            );
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        // Backend/Edge Function restituisce { count: number } o { value: number }
        const count = data.count ?? data.value ?? 0;
        
        if (import.meta.env.DEV) {
          const { logger } = await import('../../utils/logger');
          logger.dev('Counter API response:', { url, data, count });
        }
        
        return count;
      } catch {
        if (retries > 0) {
          return fetchWithRetry(url, retries - 1);
        } else {
          return null;
        }
      }
    };

    const hasCountedNow = sessionStorage.getItem(STORAGE_KEYS.SESSION);
    const url = hasCountedNow ? COUNTER_API_BASE : COUNTER_INCREMENT_API;

    const newCount = await fetchWithRetry(url, MAX_RETRIES);

    if (newCount !== null) {
      setCount(newCount);
      if (!hasCountedNow) {
        sessionStorage.setItem(STORAGE_KEYS.SESSION, 'true');
      }
      localStorage.setItem(STORAGE_KEYS.LOCAL, newCount.toString());
      setError(false);
    } else {
      // Fallback a localStorage se l'API fallisce
      const localCount = parseInt(
        localStorage.getItem(STORAGE_KEYS.LOCAL) || '0',
        10
      );
      if (localCount > 0) {
        setCount(localCount);
        setError(false);
      } else {
        setCount(null);
        setError(true);
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCount();

    intervalRef.current = setInterval(fetchCount, refreshIntervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchCount, refreshIntervalMs]);

  /**
   * Renderizza il conteggio formattato
   */
  const renderCount = (): string => {
    if (isLoading) return '...';
    if (error || count === null) return '-';
    return count.toLocaleString('it-IT');
  };

  return (
    <div 
      className={`visitor-counter ${className}`} 
      aria-label={`Contatore visite: ${count ?? 'caricamento'}`}
    >
      <span className="visitor-counter-label">Visite:</span>
      <span className="visitor-counter-value" aria-live="polite">
        {renderCount()}
      </span>
    </div>
  );
};

export default VisitorCounter;
