import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "./CookieBanner.css";
import { Link } from "react-router-dom";
import { logger } from "../../utils/logger";

/**
 * Chiave per il consenso cookie in localStorage
 */
const COOKIE_CONSENT_KEY = "sgamapp_cookie_consent";

/**
 * Componente banner per il consenso cookie
 *
 * Mostra un banner informativo sui cookie tecnici essenziali.
 * Gestisce il consenso in localStorage con fallback per browser
 * che bloccano localStorage (es. Brave mobile in modalità privata).
 */
const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null
  );

  useEffect(() => {
    /**
     * Controlla se l'utente ha già dato il consenso
     * Gestisce errori per browser che bloccano localStorage
     */
    let consent: string | null = null;
    try {
      consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    } catch (error) {
      // Brave mobile in modalità privata può bloccare localStorage
      logger.warn("localStorage non disponibile:", error);
      return;
    }

    if (consent === "accepted" || consent === "dismissed") {
      setIsVisible(false);
      return;
    }

    // Mostra il banner dopo un breve delay
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Crea portal per Chrome mobile (evita problemi con trasformazioni CSS dei parent)
  useEffect(() => {
    if (typeof document === "undefined") return;

    // Crea o recupera portal
    let portalDiv = document.getElementById(
      "cookie-banner-portal"
    ) as HTMLDivElement;
    if (!portalDiv) {
      portalDiv = document.createElement("div");
      portalDiv.id = "cookie-banner-portal";
      document.body.appendChild(portalDiv);
    } else if (portalDiv.parentElement !== document.body) {
      document.body.appendChild(portalDiv);
    }

    setPortalContainer(portalDiv);

    return () => {
      // Non rimuovere il portal, può essere riutilizzato
    };
  }, []);

  // Chrome mobile: gestisce padding-bottom del body quando il banner è visibile
  useEffect(() => {
    if (isVisible) {
      // Calcola l'altezza del banner e aggiungi padding al body
      const banner = document.querySelector(".cookie-banner");
      if (banner) {
        const bannerHeight = banner.getBoundingClientRect().height;
        document.body.style.paddingBottom = `${bannerHeight}px`;
      }
    } else {
      // Rimuovi padding quando il banner non è visibile
      document.body.style.paddingBottom = "";
    }

    // Cleanup
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [isVisible]);

  /**
   * Gestisce l'accettazione del consenso cookie
   */
  const handleAccept = (): void => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
      localStorage.setItem(
        `${COOKIE_CONSENT_KEY}_date`,
        new Date().toISOString()
      );
    } catch (error) {
      logger.warn("Impossibile salvare il consenso:", error);
    }
    setIsVisible(false);
  };

  /**
   * Gestisce la chiusura del banner
   * Salva che l'utente ha chiuso senza accettare esplicitamente
   * (accettabile per cookie tecnici essenziali secondo GDPR)
   */
  const handleClose = (): void => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "dismissed");
    } catch (error) {
      logger.warn("Impossibile salvare il consenso:", error);
    }
    setIsVisible(false);
  };

  // Doppio controllo per evitare che il banner appaia dopo l'accettazione
  // (fix per Brave mobile)
  if (!isVisible) {
    return null;
  }

  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent === "accepted" || consent === "dismissed") {
      return null;
    }
  } catch {
    // Se localStorage non è disponibile, non mostrare il banner
    return null;
  }

  const bannerContent = (
    <div
      className="cookie-banner"
      role="region"
      aria-label="Informativa sui cookie"
      aria-live="polite"
    >
      <div className="cookie-banner__container">
        <div className="cookie-banner__content">
          <div className="cookie-banner__text">
            <p className="cookie-banner__title">
              Utilizziamo cookie tecnici essenziali
            </p>
            <p className="cookie-banner__description">
              Questo sito utilizza solo cookie tecnici necessari per il
              funzionamento dell'applicazione e per garantire la sicurezza delle
              sessioni. Non utilizziamo cookie di profilazione o di
              tracciamento. Per maggiori informazioni, consulta la nostra{" "}
              <Link
                to="/privacy"
                className="cookie-banner__link"
                onClick={handleClose}
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="cookie-banner__actions">
          <button
            type="button"
            className="cookie-banner__button cookie-banner__button--accept"
            onClick={handleAccept}
            aria-label="Accetta l'utilizzo dei cookie"
          >
            Accetta
          </button>
          <button
            type="button"
            className="cookie-banner__button cookie-banner__button--close"
            onClick={handleClose}
            aria-label="Chiudi il banner dei cookie"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );

  // Usa portal per Chrome mobile per evitare problemi con trasformazioni CSS dei parent
  return portalContainer
    ? createPortal(bannerContent, portalContainer)
    : bannerContent;
};

export default CookieBanner;
