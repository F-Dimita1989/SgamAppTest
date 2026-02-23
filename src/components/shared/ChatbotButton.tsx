import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useChatbot } from '../../contexts/ChatbotContext';
import sgamyLogo from '../../assets/SGAMY_ICONA.webp';
import './ChatbotButton.css';

/**
 * Componente bottone fisso per aprire il chatbot
 * - Usa portal per evitare problemi di z-index
 * - Fix per iOS / mobile
 * - Nasconde il bottone quando il banner di download è visibile
 * - Gestisce overscroll su iOS
 */
function ChatbotButton() {
  const { openChatbot, isOpen } = useChatbot();
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  const handleChatbotClick = useCallback((e?: React.MouseEvent | React.TouchEvent): void => {
    if (e) {
      e.stopPropagation();
    }
    openChatbot();
  }, [openChatbot]);

  const handleChatbotTouch = useCallback((e: React.TouchEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    openChatbot();
  }, [openChatbot]);

  // Controlla visibilità del banner
  const checkBannerVisibility = useCallback(() => {
    const banner = document.querySelector('.app-download-banner-overlay');
    setIsBannerVisible(banner instanceof HTMLElement);
  }, []);

  useEffect(() => {
    // Controllo iniziale
    checkBannerVisibility();

    // Observer per aggiunte/rimozioni di nodi
    const observer = new MutationObserver(checkBannerVisibility);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [checkBannerVisibility]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
    const isMobile = window.innerWidth <= 768;

    // Crea o recupera portal
    let portalDiv = document.getElementById('chatbot-button-portal') as HTMLDivElement;
    if (!portalDiv) {
      portalDiv = document.createElement('div');
      portalDiv.id = 'chatbot-button-portal';
      document.body.appendChild(portalDiv);
    } else if (portalDiv.parentElement !== document.body) {
      document.body.appendChild(portalDiv);
    }

    // Aggiungi classi per mobile/iOS
    if (isMobile || isIOS) portalDiv.classList.add('mobile-ios-fix-portal');

    setPortalContainer(portalDiv);

    // Funzione per spostare il bottone nel portal e applicare classi
    const moveButtonToPortal = () => {
      const buttonElement = document.querySelector('.chatbot-button-fixed') as HTMLElement;
      if (!buttonElement || !portalDiv) return;

      if (buttonElement.parentElement !== portalDiv) {
        portalDiv.appendChild(buttonElement);
      }

      if (isMobile || isIOS) {
        buttonElement.classList.add('mobile-ios-fix');
      }
    };

    // Applica subito e con piccolo timeout per sicurezza
    moveButtonToPortal();
    const timeout = setTimeout(moveButtonToPortal, 50);

    // Listener resize / scroll per mobile/iOS
    const handleViewportChange = () => moveButtonToPortal();
    if (isMobile || isIOS) {
      window.addEventListener('resize', handleViewportChange);
      window.addEventListener('scroll', handleViewportChange, { passive: true });
      document.addEventListener('touchmove', handleViewportChange, { passive: true });
    }

    return () => {
      clearTimeout(timeout);
      if (isMobile || isIOS) {
        window.removeEventListener('resize', handleViewportChange);
        window.removeEventListener('scroll', handleViewportChange);
        document.removeEventListener('touchmove', handleViewportChange);
      }
    };
  }, []);

  if (isOpen || isBannerVisible) return null;

  const buttonContent = (
    <div className="chatbot-button-fixed">
      <button
        type="button"
        className="chatbot-btn-fixed"
        onClick={handleChatbotClick}
        onTouchEnd={handleChatbotTouch}
        title="Parla con Sgamy"
        aria-label="Apri assistente digitale Sgamy"
      >
        <img
          src={sgamyLogo}
          alt="Icona di Sgamy, assistente virtuale"
          className="sgamy-fixed-icon"
          loading="lazy"
          width={60}
          height={60}
        />
      </button>
    </div>
  );

  return portalContainer ? createPortal(buttonContent, portalContainer) : null;
}

export default ChatbotButton;
