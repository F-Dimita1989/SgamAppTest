import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronUpIcon } from '@radix-ui/react-icons';
import './ScrollToTopButton.css';

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [shouldUsePortal, setShouldUsePortal] = useState(false);

  // Toggle visibilità pulsante in base allo scroll
  const toggleVisibility = useCallback(() => {
    setIsVisible(window.pageYOffset > 300);
  }, []);

  // Controlla scroll per visibilità
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [toggleVisibility]);

  // Setup portal e fix per iOS / mobile
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
    const isMobile = window.innerWidth <= 768;
    const needsPortal = isMobile || isIOS;

    setShouldUsePortal(needsPortal);

    // Crea il portal solo se necessario (mobile/iOS)
    if (needsPortal) {
      let portalDiv = document.getElementById('scroll-to-top-portal') as HTMLDivElement;
      if (!portalDiv) {
        portalDiv = document.createElement('div');
        portalDiv.id = 'scroll-to-top-portal';
        document.body.appendChild(portalDiv);
      } else if (portalDiv.parentElement !== document.body) {
        document.body.appendChild(portalDiv);
      }

      portalDiv.classList.add('mobile-ios-fix-portal');
      setPortalContainer(portalDiv);

      const applyPortalFix = () => {
        const buttonElement = document.querySelector('.scroll-to-top-button') as HTMLElement;
        if (!buttonElement || !portalDiv) return;

        if (buttonElement.parentElement !== portalDiv) portalDiv.appendChild(buttonElement);

        buttonElement.style.pointerEvents = 'auto';
        buttonElement.classList.add('mobile-ios-fix');
      };

      applyPortalFix();

      const handleViewportChange = () => applyPortalFix();
      window.addEventListener('scroll', handleViewportChange, { passive: true });
      window.addEventListener('resize', handleViewportChange, { passive: true });
      document.addEventListener('touchmove', handleViewportChange, { passive: true });

      const observer = new MutationObserver(handleViewportChange);
      observer.observe(document.body, { childList: true, subtree: false });

      return () => {
        window.removeEventListener('scroll', handleViewportChange);
        window.removeEventListener('resize', handleViewportChange);
        document.removeEventListener('touchmove', handleViewportChange);
        observer.disconnect();
      };
    } else {
      // Su desktop, non usare il portal
      setPortalContainer(null);
    }
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  const buttonContent = (
    <button
      className="scroll-to-top-button"
      onClick={scrollToTop}
      aria-label="Torna all'inizio della pagina"
      title="Torna all'inizio"
    >
      <ChevronUpIcon className="scroll-to-top-icon" aria-hidden="true" />
    </button>
  );

  // Usa il portal solo su mobile/iOS, su desktop renderizza direttamente
  return shouldUsePortal && portalContainer ? createPortal(buttonContent, portalContainer) : buttonContent;
}

export default ScrollToTopButton;
