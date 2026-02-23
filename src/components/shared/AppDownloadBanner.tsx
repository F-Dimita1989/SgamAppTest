import React, { useState, useEffect, useRef, useCallback } from 'react';
import sgamyPollice from '../../assets/SGAMY_POLLICE.webp';
import mainLogo from '../../assets/logo.svg';
import logosImage from '../../assets/LOGO_S.webp';
import { incrementDownloadCounter } from '../../apiServices/downloadCounter';
import { logger } from '../../utils/logger';
import './AppDownloadBanner.css';

/**
 * Chiave per sessionStorage per tracciare se il banner è stato mostrato
 */
const BANNER_SESSION_KEY = 'sgamapp_download_banner_shown';

/**
 * Helper per gestire sessionStorage in modo sicuro
 * Safari mobile in modalità privata può lanciare eccezioni
 */
const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      // Safari mobile in modalità privata può lanciare eccezioni
      logger.warn('sessionStorage non disponibile:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      // Safari mobile in modalità privata può lanciare eccezioni
      logger.warn('sessionStorage non disponibile:', error);
    }
  }
};

/**
 * Rileva se il browser è su iOS
 * Tutti i browser su iOS condividono gli stessi problemi con position: fixed
 */
const isIOSMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
};

/**
 * Componente banner per il download dell'app Android
 * 
 * Gestisce:
 * - Mostra il banner solo una volta per sessione
 * - Blocca lo scroll quando il banner è visibile
 * - Chiusura automatica dopo 7 secondi
 * - Supporto per iOS con gestione speciale dello scroll
 */
const AppDownloadBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const scrollYRef = useRef<number>(0);

  /**
   * Monta il componente e controlla se mostrare il banner
   */
  useEffect(() => {
    setIsMounted(true);
    
    let timer: ReturnType<typeof setTimeout> | null = null;
    
    // Attendi che il DOM sia pronto (importante per iOS mobile)
    const checkAndShow = () => {
      // Controlla se il banner è già stato mostrato in questa sessione
      const bannerShown = safeSessionStorage.getItem(BANNER_SESSION_KEY);
      
      if (!bannerShown) {
        // Su iOS (tutti i browser), aumenta leggermente il delay per assicurarsi che tutto sia caricato
        // Chrome iOS, Safari iOS, Firefox iOS hanno tutti bisogno di più tempo
        const delay = isIOSMobile() ? 1500 : 1000;
        timer = setTimeout(() => {
          setIsVisible(true);
        }, delay);
      } else {
        setIsVisible(false);
      }
    };

    // Se il documento è già caricato, esegui subito, altrimenti aspetta
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      checkAndShow();
    } else {
      window.addEventListener('load', checkAndShow);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      window.removeEventListener('load', checkAndShow);
    };
  }, []);

  const handleClose = useCallback(() => {
    // Salva in sessionStorage che il banner è stato mostrato
    safeSessionStorage.setItem(BANNER_SESSION_KEY, 'true');
    setIsVisible(false);
  }, []);

  /**
   * Salva la posizione di scroll e blocca lo scroll quando il banner appare
   */
  useEffect(() => {
    if (isVisible) {
      // Salva la posizione corrente di scroll (con fallback per Safari mobile)
      const scrollY = window.pageYOffset || 
                      document.documentElement.scrollTop || 
                      document.body.scrollTop || 
                      0;
      scrollYRef.current = scrollY;
      
      const body = document.body;
      const html = document.documentElement;
      
      // Su iOS (tutti i browser), usa un approccio diverso per bloccare lo scroll
      // Chrome iOS, Safari iOS, Firefox iOS hanno tutti problemi con position: fixed
      if (isIOSMobile()) {
        // Metodo alternativo per iOS che evita problemi con position: fixed
        body.style.overflow = 'hidden';
        body.style.position = 'relative';
        body.style.height = '100%';
        html.style.overflow = 'hidden';
        html.style.height = '100%';
        
        // Salva la posizione di scroll in un attributo data per ripristinarla dopo
        html.setAttribute('data-scroll-y', scrollY.toString());
      } else {
        // Metodo standard per altri browser
        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.width = '100%';
      }

      return () => {
        // Ripristina lo scroll quando il banner si chiude
        if (isIOSMobile()) {
          // Metodo per iOS (tutti i browser su iOS)
          body.style.overflow = '';
          body.style.position = '';
          body.style.height = '';
          html.style.overflow = '';
          html.style.height = '';
          
          // Ripristina la posizione di scroll
          const savedScrollY = parseInt(html.getAttribute('data-scroll-y') || '0', 10);
          html.removeAttribute('data-scroll-y');
          
          // Usa requestAnimationFrame per assicurarsi che il DOM sia aggiornato
          requestAnimationFrame(() => {
            window.scrollTo(0, savedScrollY);
          });
        } else {
          // Metodo standard per altri browser
          body.style.overflow = '';
          body.style.position = '';
          body.style.top = '';
          body.style.width = '';
          
          // Ripristina la posizione di scroll
          requestAnimationFrame(() => {
            window.scrollTo(0, scrollY);
          });
        }
      };
    }
  }, [isVisible]);

  /**
   * Chiusura automatica dopo 7 secondi
   */
  useEffect(() => {
    if (isVisible) {
      const autoCloseTimer = setTimeout(() => {
        // Salva in sessionStorage che il banner è stato mostrato
        safeSessionStorage.setItem(BANNER_SESSION_KEY, 'true');
        handleClose();
      }, 7000);

      return () => clearTimeout(autoCloseTimer);
    }
  }, [isVisible, handleClose]);

  /**
   * Gestione tasto ESC per chiudere il banner
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, handleClose]);

  // Non renderizzare nulla finché il componente non è montato
  if (!isMounted || !isVisible) return null;

  return (
    <div 
      className="app-download-banner-overlay" 
      onClick={handleClose}
      role="dialog"
      aria-label="Scarica l'app SgamApp"
      aria-modal="true"
    >
      <button
        ref={closeButtonRef}
        className="app-download-banner__close"
        onClick={handleClose}
        aria-label="Chiudi banner informativo"
        type="button"
      >
        <span className="app-download-banner__close-icon">×</span>
      </button>
      <div
        ref={bannerRef}
        className="app-download-banner"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="app-download-banner__content">
          <div className="app-download-banner__image-container">
            <img 
              src={sgamyPollice} 
              alt="Sgamy, l'assistente virtuale di SgamApp" 
              className="app-download-banner__image"
              loading="eager"
              width="600"
              height="400"
            />
          </div>

          <div className="app-download-banner__text-container">
            <div className="app-download-banner__logos">
              <img 
                src={mainLogo} 
                alt="Logo SgamApp" 
                className="app-download-banner__logo-main"
                loading="eager"
                width="60"
                height="60"
              />
              <img 
                src={logosImage} 
                alt="Loghi istituzionali e partner di SgamApp" 
                className="app-download-banner__logo-partners"
                loading="eager"
                width="60"
                height="60"
              />
            </div>
            <h2 className="app-download-banner__title">
              Scarica l'app Android di SgamApp!
            </h2>
            <p className="app-download-banner__description">
              Porta SgamApp sempre con te. Scarica l'app mobile Android per accedere a tutti i servizi 
              di sicurezza digitale direttamente dal tuo smartphone.
            </p>
            <div className="app-download-banner__actions">
              <a
                href="/SgamAppAndroid.apk"
                download="SgamAppAndroid.apk"
                className="app-download-banner__link"
                aria-label="Scarica l'app SgamApp per Android"
                rel="noopener noreferrer"
                onClick={incrementDownloadCounter}
              >
                <span className="app-download-banner__link-text">Scarica l'app</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDownloadBanner;

