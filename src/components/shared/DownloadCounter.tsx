import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Counter.css';

/**
 * Props per il componente DownloadCounter
 */
interface DownloadCounterProps {
  /** Classe CSS aggiuntiva */
  className?: string;
  /** Intervallo di aggiornamento automatico in millisecondi (default: 30000) */
  refreshIntervalMs?: number;
}

/**
 * Costanti per la configurazione del counter
 */
const COUNTER_API_BASE = '/api/counter';
const MAX_RETRIES = 3;
const TIMEOUT_MS = 10000;

/**
 * Chiavi per localStorage
 */
const STORAGE_KEYS = {
  LOCAL: 'sgamapp_local_visits',
} as const;

/**
 * Componente per visualizzare il contatore dei download
 * 
 * Utilizza:
 * - Vite dev middleware in sviluppo
 * - Vercel Edge Functions in produzione
 * 
 * Legge solo il conteggio senza incrementarlo
 */
const DownloadCounter: React.FC<DownloadCounterProps> = ({ 
  className = '', 
  refreshIntervalMs = 30000 
}) => {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Recupera il conteggio dei download con retry e timeout
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
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        // Backend restituisce { count: number } o { value: number }
        return data.count ?? data.value ?? 0;
      } catch {
        if (retries > 0) {
          return fetchWithRetry(url, retries - 1);
        } else {
          return null;
        }
      }
    };

    const newCount = await fetchWithRetry(COUNTER_API_BASE, MAX_RETRIES);

    if (newCount !== null) {
      setCount(newCount);
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
      aria-label={`Contatore download: ${count ?? 'caricamento'}`}
    >
      <span className="visitor-counter-label">Download:</span>
      <span className="visitor-counter-value" aria-live="polite">
        {renderCount()}
      </span>
    </div>
  );
};

export default DownloadCounter;

