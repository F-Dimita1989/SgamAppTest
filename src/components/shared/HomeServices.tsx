import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { useChatbot } from "../../contexts/ChatbotContext";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import type { ButtonAccessibilityProps } from "../../types/accessibility";
import { sanitizeHTML, sanitizeURL } from "../../utils/sanitize";
import { logger } from "../../utils/logger";
import { incrementDownloadCounter } from "../../apiServices/downloadCounter";
import "./HomeServices.css";
import sgamyGif from "../../assets/SGAMY-GIF2.gif";
import missionImage from "../../assets/SGAMY_SCUDO.webp";
import scopriImage from "../../assets/SGAMY_POLLICE.webp";

/**
 * Props per ChatbotPromoCard
 */
interface ChatbotPromoCardProps {
  onOpenChatbot: (message?: string) => void;
}

/**
 * Card promozionale per il chatbot
 */
const ChatbotPromoCard: React.FC<ChatbotPromoCardProps> = memo(
  ({ onOpenChatbot }) => {
    const [inputValue, setInputValue] = useState("");

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        const message = inputValue.trim();
        if (message) {
          onOpenChatbot(message);
          setInputValue("");
        }
      },
      [inputValue, onOpenChatbot]
    );

    return (
      <section className="sg-cards-wrap">
        <article className="chatbot-promo-card">
          <div className="chatbot-promo-card__content">
            <div className="chatbot-promo-card__icon-wrapper">
              <img
                src={sgamyGif}
                alt="Animazione di Sgamy, l'assistente virtuale di SgamApp per la sicurezza digitale, sempre disponibile per rispondere alle domande"
                className="chatbot-promo-card__icon"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                width="200"
                height="200"
              />
            </div>
            <div className="chatbot-promo-card__text-wrapper">
              <h2 className="chatbot-promo-card__title">Parla con Sgamy</h2>
              <p className="chatbot-promo-card__description">
                Il tuo assistente virtuale sempre disponibile per rispondere
                alle tue domande sulla sicurezza digitale. Chiedi qualsiasi cosa
                e ricevi risposte immediate e chiare.
              </p>
            </div>
            <div className="chatbot-promo-card__input-section">
              <form
                className="chatbot-promo-card__input-wrapper"
                onSubmit={handleSubmit}
              >
                <input
                  type="text"
                  className="chatbot-promo-card__input"
                  placeholder="Scrivi un messaggio a Sgamy..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  aria-label="Campo per chattare con Sgamy"
                />
                <button
                  type="submit"
                  className="chatbot-promo-card__send-btn"
                  aria-label="Invia messaggio"
                  title="Invia messaggio"
                  disabled={!inputValue.trim()}
                >
                  <PaperPlaneIcon />
                </button>
              </form>
              <div className="chatbot-promo-card__download-wrapper">
                <p className="chatbot-promo-card__download-text-info">
                  Scarica l'app per smartphone Android! Per avere Sgamy sempre
                  con te!
                </p>
                <a
                  href="/SgamAppAndroid.apk"
                  download="SgamAppAndroid.apk"
                  className="chatbot-promo-card__download-link"
                  aria-label="Scarica l'app SgamApp per Android"
                  rel="noopener noreferrer"
                  onClick={incrementDownloadCounter}
                >
                  <span className="chatbot-promo-card__download-text">
                    Scarica l'app
                  </span>
                </a>
              </div>
            </div>
          </div>
        </article>
      </section>
    );
  }
);

ChatbotPromoCard.displayName = "ChatbotPromoCard";

/**
 * Props per SquareCard
 */
interface SquareCardProps extends ButtonAccessibilityProps {
  image: string;
  title: string;
  buttonText: string;
  buttonLink: string;
  buttonAriaLabel: string;
  description: string;
  additionalClassName?: string;
}

/**
 * Card quadrata con effetto flip
 * Mostra informazioni sul fronte e descrizione sul retro
 */
const SquareCard: React.FC<SquareCardProps> = memo(
  ({
    image,
    title,
    buttonText,
    buttonLink,
    buttonAriaLabel,
    description,
    additionalClassName = "",
  }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const backgroundRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !imageLoaded) {
              const img = new Image();
              img.onload = () => {
                setImageLoaded(true);
                if (backgroundRef.current) {
                  backgroundRef.current.style.backgroundImage = `url(${image})`;
                }
              };
              img.src = image;
              observer.disconnect();
            }
          });
        },
        { rootMargin: "50px" }
      );

      if (backgroundRef.current) {
        observer.observe(backgroundRef.current);
      }

      return () => observer.disconnect();
    }, [image, imageLoaded]);

    const handleFlip = useCallback(() => {
      setIsFlipped((prev) => !prev);
    }, []);

    const handleButtonClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        // Valida il link prima di navigare
        const sanitizedLink = sanitizeURL(buttonLink);
        if (sanitizedLink) {
          window.location.href = sanitizedLink;
        } else {
          // Se è un link interno (non URL completo), usa direttamente
          if (buttonLink.startsWith("/")) {
            window.location.href = buttonLink;
          } else {
            logger.error("Link non valido:", buttonLink);
          }
        }
      },
      [buttonLink]
    );

    return (
      <article
        className={`chatbot-promo-card square-card ${additionalClassName} ${
          isFlipped ? "is-flipped" : ""
        }`}
        onClick={handleFlip}
      >
        <div className="square-card__inner">
          <div className="square-card__front">
            <div ref={backgroundRef} className="square-card__background">
              <div className="square-card__overlay"></div>
            </div>
            <div className="square-card__content">
              <div className="square-card__text-wrapper">
                <h2 className="square-card__title">{title}</h2>
              </div>
              <button
                className="square-card__cta-button"
                onClick={handleButtonClick}
                aria-label={buttonAriaLabel}
              >
                {buttonText}
              </button>
            </div>
          </div>
          <div className="square-card__back">
            <div className="square-card__back-background"></div>
            <div className="square-card__content">
              <div className="square-card__text-wrapper">
                <p
                  className="square-card__description"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(description),
                  }}
                ></p>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }
);

SquareCard.displayName = "SquareCard";

/**
 * Card promozionale per la missione
 */
const MissionPromoCard: React.FC = memo(() => {
  return (
    <SquareCard
      image={missionImage}
      title="La Nostra Missione"
      buttonText="Scopri la nostra missione"
      buttonLink="/info"
      buttonAriaLabel="Vai alla pagina Info e Contatti per scoprire la missione di SgamApp"
      description="Scopri i valori e gli obiettivi di <strong>SgamApp</strong>. Rendiamo la sicurezza digitale accessibile a tutti, con particolare attenzione alle esigenze degli utenti meno esperti."
      additionalClassName="mission-promo-card"
    />
  );
});

MissionPromoCard.displayName = "MissionPromoCard";

/**
 * Card promozionale per scoprire di più
 */
const ScopriPromoCard: React.FC = memo(() => {
  return (
    <SquareCard
      image={scopriImage}
      title="Scopri di Più"
      buttonText="Esplora le guide"
      buttonLink="/guide"
      buttonAriaLabel="Vai alle guide"
      description="Esplora tutte le nostre guide pratiche e semplici per navigare in sicurezza nel mondo digitale. Impara a proteggere i tuoi dati e riconoscere le truffe online."
    />
  );
});

ScopriPromoCard.displayName = "ScopriPromoCard";

/**
 * Componente principale per i servizi della home
 *
 * Include:
 * - Card promozionale chatbot
 * - Card missione e scopri di più con animazioni scroll reveal
 */
const HomeServices: React.FC = () => {
  const { openChatbot } = useChatbot();
  const missionCardRef = useRef<HTMLElement>(null);
  const scopriCardRef = useRef<HTMLElement>(null);

  /**
   * Gestisce le animazioni scroll reveal per le card
   * Ottimizzato per Safari mobile (iOS)
   */
  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const timer = setTimeout(() => {
      // Rileva se siamo su Safari mobile (iOS)
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
      const revealedElements = new Set<Element>();

      const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      };

      const newObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          // Su Safari mobile, una volta rivelato un elemento, non riosservarlo mai più
          // Questo previene il flash quando si scrolla verso l'alto
          if (entry.isIntersecting && !revealedElements.has(entry.target)) {
            entry.target.classList.add("scroll-reveal-visible");
            entry.target.classList.remove("scroll-reveal-hidden");
            revealedElements.add(entry.target);

            // Su Safari mobile, smetti di osservare l'elemento una volta rivelato
            if (isIOS) {
              newObserver.unobserve(entry.target);
            }
          }
        });
      }, observerOptions);

      observer = newObserver;

      const elementsToObserve = [
        missionCardRef.current,
        scopriCardRef.current,
      ].filter(Boolean) as Element[];

      if (newObserver) {
        elementsToObserve.forEach((element) => {
          if (element) {
            newObserver.observe(element);
          }
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <>
      <ChatbotPromoCard onOpenChatbot={openChatbot} />
      <section className="home-services-grid" aria-label="Servizi principali">
        <article
          ref={missionCardRef as React.RefObject<HTMLElement>}
          className="scroll-reveal-item scroll-reveal-hidden"
        >
          <MissionPromoCard />
        </article>
        <article
          ref={scopriCardRef as React.RefObject<HTMLElement>}
          className="scroll-reveal-item scroll-reveal-hidden"
        >
          <ScopriPromoCard />
        </article>
      </section>
    </>
  );
};

export default HomeServices;
