import { useEffect, useRef } from 'react';

/**
 * Hook ottimizzato per scroll reveal su iOS Safari
 * Gestisce IntersectionObserver con rootMargin ottimizzato per mobile/iOS
 */
export const useScrollReveal = (
  selector: string = '.scroll-reveal-item',
  options?: {
    threshold?: number | number[];
    rootMargin?: string;
    enableOnMobile?: boolean;
  }
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const revealedElementsRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    // Rileva se siamo su iOS o mobile
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
    const isMobile = window.innerWidth <= 768;
    const enableOnMobile = options?.enableOnMobile !== false;

    if (!enableOnMobile && (isIOS || isMobile)) {
      // Su mobile/iOS, riveliamo immediatamente tutti gli elementi se disabilitato
      const allElements = document.querySelectorAll(selector);
      allElements.forEach((element) => {
        element.classList.add('scroll-reveal-visible');
        element.classList.remove('scroll-reveal-hidden');
      });
      return;
    }

    const revealElement = (element: Element) => {
      element.classList.add('scroll-reveal-visible');
      element.classList.remove('scroll-reveal-hidden');
      revealedElementsRef.current.add(element);
    };

    // RootMargin ottimizzato per iOS Safari
    // Su iOS, la barra degli indirizzi può nascondersi/mostrarsi, quindi usiamo un rootMargin più generoso
    const defaultRootMargin = isIOS || isMobile 
      ? '0px 0px -10% 0px' // Più generoso su mobile/iOS per compensare il cambio viewport
      : options?.rootMargin || '0px 0px -50px 0px';

    const observerOptions: IntersectionObserverInit = {
      threshold: options?.threshold ?? 0.1,
      rootMargin: defaultRootMargin,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Su Safari mobile, una volta rivelato un elemento, non riosservarlo mai più
        // Questo previene il flash quando si scrolla verso l'alto
        if (entry.isIntersecting && !revealedElementsRef.current.has(entry.target)) {
          revealElement(entry.target);
          // Su Safari mobile, smetti di osservare l'elemento una volta rivelato
          if (isIOS) {
            observer.unobserve(entry.target);
          }
        }
      });
    }, observerOptions);

    observerRef.current = observer;

    // Funzione per osservare tutti gli elementi
    const observeAllElements = () => {
      const allElements = document.querySelectorAll(selector);
      allElements.forEach((element) => {
        // Se l'elemento è già stato rivelato, non osservarlo più (soprattutto su Safari mobile)
        if (revealedElementsRef.current.has(element)) {
          // Su Safari mobile, smetti di osservare elementi già rivelati per evitare flash
          if (isIOS) {
            return; // Non osservare elementi già rivelati
          }
        } else {
          observer.observe(element);
        }
        
        // Se è già visibile, rivelalo immediatamente
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 1.2 && rect.bottom > -window.innerHeight * 0.2;
        if (isVisible && !revealedElementsRef.current.has(element)) {
          revealElement(element);
          // Su Safari mobile, smetti di osservare dopo la rivelazione
          if (isIOS) {
            observer.unobserve(element);
          }
        }
      });
    };

    // Controlla immediatamente gli elementi visibili
    const checkInitialVisible = () => {
      const allElements = document.querySelectorAll(selector);
      allElements.forEach((element) => {
        // Se già rivelato, non fare nulla
        if (revealedElementsRef.current.has(element)) {
          return;
        }
        
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 1.2 && rect.bottom > -window.innerHeight * 0.2;
        if (isVisible) {
          revealElement(element);
          // Su Safari mobile, smetti di osservare dopo la rivelazione
          if (isIOS && observerRef.current) {
            observerRef.current.unobserve(element);
          }
        }
      });
    };

    // Esegui immediatamente e dopo un breve delay per iOS Safari
    checkInitialVisible();
    setTimeout(checkInitialVisible, 50);
    setTimeout(checkInitialVisible, 200);
    
    // Osserva dopo un breve delay per assicurarsi che gli elementi siano nel DOM
    setTimeout(observeAllElements, 100);

    // Su iOS Safari, riosserva quando la viewport cambia (barra indirizzi)
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        checkInitialVisible();
      }, 150);
    };

    if (isIOS) {
      window.addEventListener('resize', handleResize, { passive: true });
      window.addEventListener('orientationchange', handleResize, { passive: true });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (isIOS) {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      }
    };
  }, [selector, options?.threshold, options?.rootMargin, options?.enableOnMobile]);
};

