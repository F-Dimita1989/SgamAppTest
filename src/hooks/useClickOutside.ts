import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

/**
 * Custom hook per rilevare click fuori da un elemento
 * 
 * @param handler - Funzione chiamata quando si clicca fuori
 * @param enabled - Se true, il listener è attivo (default: true)
 * 
 * @example
 * const ref = useClickOutside(() => {
 *   setIsOpen(false);
 * });
 * 
 * return <div ref={ref}>...</div>;
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };

    // Usa mousedown invece di click per migliore UX
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handler, enabled]);

  return ref;
}

