import React, { memo, useEffect, useLayoutEffect } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { ClockIcon, BookmarkIcon, FileTextIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import './GuideCards.css';
import type { ImageAccessibilityProps } from '../../types/accessibility';

/**
 * Tipo per una guida
 */
type GuideType = { 
  title: string; 
  description: string; 
  icon: string; 
  link: string;
  duration?: string;
  tags?: string[];
};

/**
 * Componente card per una singola guida
 * Memoizzato per evitare re-render inutili
 */
const GuideCard: React.FC<GuideType> = memo(({ title, description, icon, link, duration, tags }) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;charset=utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="100%25" height="100%25" fill="%23cfe8ff"/><text x="50%25" y="55%25" font-family="Arial" font-size="14" text-anchor="middle" fill="%23224466">no image</text></svg>';
  };

  return (
    <a href={link} className="guide-card-link" aria-label={`Vai alla guida ${title}`}>
      <div className="guide-card">
        <img
          src={icon}
          onError={handleImageError}
          alt={`Immagine illustrativa che rappresenta la guida passo-passo su ${title} di SgamApp` as ImageAccessibilityProps['alt']}
          className="guide-card-image"
          loading="lazy"
          width="400"
          height="300"
        />
        <div className="guide-card-overlay">
          <div className="guide-card-content">
            <h3 className="guide-card-title">{title}</h3>
            {duration && (
              <div className="guide-card-duration">
                <ClockIcon />
                <span>{duration}</span>
              </div>
            )}
            <p className="guide-card-description">{description}</p>
            {tags && tags.length > 0 && (
              <div className="guide-card-tags">
                <BookmarkIcon />
                <div className="guide-card-tags-list">
                  {tags.map((tag, index) => (
                    <span key={index} className="guide-card-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </a>
  );
});
GuideCard.displayName = 'GuideCard';

/**
 * Props per GuideCards
 */
interface GuideCardsProps {
  guides: GuideType[];
}

/**
 * Componente principale per mostrare le card delle guide
 * 
 * Funzionalità:
 * - Animazioni scroll reveal
 * - Gestione classi per scrollbar
 * - Layout responsive
 */
const GuideCards: React.FC<GuideCardsProps> = ({ guides }) => {
  /**
   * Aggiunge classe al body per nascondere scrollbar verticale
   */
  useEffect(() => {
    document.body.classList.add('guide-page-active');
    document.documentElement.classList.add('guide-page-active');
    
    return () => {
      document.body.classList.remove('guide-page-active');
      document.documentElement.classList.remove('guide-page-active');
    };
  }, []);

  /**
   * Rileva gli elementi visibili PRIMA del rendering
   * Usa useLayoutEffect per evitare flash di contenuto
   */
  useLayoutEffect(() => {
    const revealedElements = new Set<Element>();

    // Funzione per rivelare un elemento
    const revealElement = (element: Element) => {
      element.classList.add('scroll-reveal-visible');
      element.classList.remove('scroll-reveal-hidden');
      revealedElements.add(element);
    };

    // Controlla immediatamente gli elementi visibili all'inizio
    const checkInitialVisibleElements = () => {
      const wrapper = document.querySelector('.guide-list-wrapper');
      if (!wrapper) return;
      const allRevealElements = wrapper.querySelectorAll('.scroll-reveal-item');
      allRevealElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
          revealElement(element);
        }
      });
    };

    // Controlla subito
    checkInitialVisibleElements();
  }, []);

  // Scroll reveal animations standardizzate
  useScrollReveal('.guide-list-wrapper .scroll-reveal-item', {
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
    rootMargin: '0px'
  });

  return (
    <section className="guide-list-wrapper">
      <header className="guide-intro scroll-reveal-item scroll-reveal-hidden">
        <h1 className="guide-main-title">Benvenuti nelle Guide</h1>
        <p>Qui troverai tutte le informazioni necessarie per utilizzare i servizi digitali in modo semplice e sicuro</p>
      </header>

      <section className="guide-how-it-works-wrapper scroll-reveal-item scroll-reveal-hidden">
        <div className="guide-how-it-works-container">
          <h2 className="guide-how-it-works-title">Come funzionano le guide</h2>
          <div className="guide-steps">
            <div className="guide-step scroll-reveal-item scroll-reveal-hidden">
              <div className="guide-step-icon">
                <ClockIcon />
              </div>
              <h3 className="guide-step-title">Durata</h3>
              <p className="guide-step-description">Ogni guida mostra il tempo stimato per completarla</p>
            </div>
            <div className="guide-step scroll-reveal-item scroll-reveal-hidden">
              <div className="guide-step-icon">
                <BookmarkIcon />
              </div>
              <h3 className="guide-step-title">Tag</h3>
              <p className="guide-step-description">Ogni guida ha dei tag per trovare facilmente l'argomento che cerchi</p>
            </div>
            <div className="guide-step scroll-reveal-item scroll-reveal-hidden">
              <div className="guide-step-icon">
                <FileTextIcon />
              </div>
              <h3 className="guide-step-title">Contenuto</h3>
              <p className="guide-step-description">Guide dettagliate con immagini e istruzioni passo-passo</p>
            </div>
          </div>
        </div>
      </section>

      <header className="guide-intro guide-intro-secondary scroll-reveal-item scroll-reveal-hidden">
        <h1 className="guide-main-title">Guide disponibili</h1>
      </header>
      <div className="guide-list-container">
        <div className="guide-list-grid">
          {guides.map((guide, i) => (
            <div key={i} className="guide-list-item scroll-reveal-item scroll-reveal-hidden">
              <GuideCard {...guide} />
            </div>
          ))}
        </div>
      </div>

      <hr className="guide-divider scroll-reveal-item scroll-reveal-hidden" />

      <section className="guide-help-section scroll-reveal-item scroll-reveal-hidden">
        <h2 className="guide-help-title">Hai bisogno di aiuto?</h2>
        <a href="/info" className="guide-help-button" aria-label="Vai alla pagina Info e Contatti per contattare il supporto di SgamApp">
          <QuestionMarkCircledIcon />
          <span>Contatta il supporto</span>
        </a>
      </section>
    </section>
  );
};

export default GuideCards;

