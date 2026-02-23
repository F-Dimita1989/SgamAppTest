import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Componente che gestisce lo scroll automatico in cima alla pagina
 * quando cambia la route.
 * 
 * Gestisce anche:
 * - Focus management per accessibilità
 * - Popstate (back/forward browser)
 * - Click su link interni
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const prevPathnameRef = useRef(pathname);

  /**
   * Forza lo scroll in cima alla pagina usando multiple strategie
   * per garantire compatibilità cross-browser
   */
  const forceScrollToTop = (): void => {
    // Metodo 1: window.scrollTo con behavior instant
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      // Fallback per browser che non supportano 'instant'
      window.scrollTo(0, 0);
    }
    
    // Metodo 2: Proprietà dirette (più affidabile)
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;
    }
    
    // Metodo 3: Elementi scrollabili interni
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      (mainContent as HTMLElement).scrollTop = 0;
    }
    
    // Metodo 4: Tutti gli elementi scrollabili
    const allScrollable = document.querySelectorAll('*');
    allScrollable.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.scrollTop && htmlEl.scrollTop > 0) {
        htmlEl.scrollTop = 0;
      }
    });
  };

  useEffect(() => {
    // Solo se il pathname è cambiato
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      
      // Scroll immediato
      forceScrollToTop();

      /**
       * Gestisce il focus per l'accessibilità
       * Sposta il focus all'h1 principale o al main content
       */
      const focusToMainContent = (): void => {
        // Cerca prima l'h1 principale della pagina
        const mainHeading = document.querySelector(
          'main h1, main [role="heading"][aria-level="1"]'
        ) as HTMLElement;
        
        if (mainHeading) {
          mainHeading.setAttribute('tabindex', '-1');
          mainHeading.focus();
          // Rimuovi tabindex dopo il focus per non interferire con la navigazione normale
          setTimeout(() => {
            mainHeading.removeAttribute('tabindex');
          }, 100);
          return;
        }

        // Fallback: focus al main content
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.setAttribute('tabindex', '-1');
          mainContent.focus();
          setTimeout(() => {
            mainContent.removeAttribute('tabindex');
          }, 100);
        }
      };

      // Focus dopo un breve delay per permettere al DOM di renderizzare
      setTimeout(focusToMainContent, 100);

      // Scroll multipli per assicurarsi che funzioni
      const timeouts: ReturnType<typeof setTimeout>[] = [];
      [0, 1, 10, 50, 100, 200, 300].forEach((delay) => {
        timeouts.push(setTimeout(forceScrollToTop, delay));
      });
      
      // RequestAnimationFrame multipli
      const rafs: number[] = [];
      for (let i = 0; i < 5; i++) {
        const raf = requestAnimationFrame(() => {
          forceScrollToTop();
        });
        rafs.push(raf);
      }

      return () => {
        timeouts.forEach(clearTimeout);
        rafs.forEach(cancelAnimationFrame);
      };
    }
  }, [pathname, navigationType]);

  /**
   * Gestisce popstate (back/forward del browser)
   */
  useEffect(() => {
    const handlePopState = (): void => {
      forceScrollToTop();
      setTimeout(forceScrollToTop, 0);
      setTimeout(forceScrollToTop, 10);
      setTimeout(forceScrollToTop, 50);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  /**
   * Intercetta i click su link interni per scrollare in cima
   */
  useEffect(() => {
    const handleClick = (e: MouseEvent): void => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]');
      if (link && link.getAttribute('href')?.startsWith('/')) {
        forceScrollToTop();
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return null;
}

export default ScrollToTop;

