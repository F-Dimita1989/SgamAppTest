import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { Link, useLocation } from 'react-router-dom';
import { FileTextIcon, InfoCircledIcon, Link2Icon } from '@radix-ui/react-icons';
import { sanitizeURL } from '../../utils/sanitize';
import { logger } from '../../utils/logger';
import './GuidaTemplate.css';

interface Step {
  title: string;
  description: string | React.ReactNode;
  list?: string[];
  link?: string;
}

interface GuidaInfo {
  difficulty: string;
  duration: string;
  stepsCount?: number;
}

interface Prerequisites {
  title?: string;
  documents: string[];
}

interface SidebarItem {
  title?: string;
  content?: React.ReactNode;
  links?: Array<{ text: string; url: string; external?: boolean }>;
}

interface GuidaTemplateProps {
  title: string;
  subtitle: string;
  image: string;
  steps: Step[];
  info: GuidaInfo;
  nextLink?: string;
  nextTitle?: string;
  previousLink?: string;
  previousTitle?: string;
  prerequisites?: Prerequisites;
  sidebarContent?: SidebarItem[];
}

const GuidaTemplate: React.FC<GuidaTemplateProps> = ({
  title,
  subtitle,
  image,
  steps,
  info,
  nextLink,
  nextTitle,
  previousLink,
  previousTitle,
  prerequisites,
  sidebarContent,
}) => {
  const location = useLocation();
  const [speakingStepIndex, setSpeakingStepIndex] = useState<number | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isSpeechSynthesisAvailable, setIsSpeechSynthesisAvailable] = useState<boolean>(false);
  const isMountedRef = useRef(true);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  
  // Crea ref dinamici per ogni step
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const stepsContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Inizializza i ref quando cambiano gli step
  useEffect(() => {
    stepRefs.current = stepRefs.current.slice(0, steps.length);
  }, [steps.length]);

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  // Sincronizza la larghezza della barra di progresso con quella della navbar
  useEffect(() => {
    const syncProgressBarWidth = () => {
      if (progressBarRef.current) {
        const navbar = document.querySelector('.navbar-simple') as HTMLElement;
        
        if (navbar) {
          // Ottieni la larghezza e la posizione della navbar
          const navbarWidth = navbar.getBoundingClientRect().width;
          const navbarLeft = navbar.getBoundingClientRect().left;
          
          // Imposta la larghezza e la posizione della barra di progresso uguali a quelle della navbar
          progressBarRef.current.style.width = `${navbarWidth}px`;
          progressBarRef.current.style.left = `${navbarLeft}px`;
        }
      }
    };

    // Esegui subito e dopo che il DOM è caricato
    syncProgressBarWidth();
    const timeout = setTimeout(syncProgressBarWidth, 100);
    window.addEventListener('resize', syncProgressBarWidth);
    window.addEventListener('scroll', syncProgressBarWidth);
    
    // Usa MutationObserver per rilevare cambiamenti nel DOM
    const observer = new MutationObserver(syncProgressBarWidth);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', syncProgressBarWidth);
      window.removeEventListener('scroll', syncProgressBarWidth);
      observer.disconnect();
    };
  }, []);

  // useLayoutEffect per rivelare gli elementi visibili PRIMA del rendering
  useLayoutEffect(() => {
    const revealedElements = new Set<Element>();

    const revealElement = (element: Element) => {
      element.classList.add('scroll-reveal-visible');
      element.classList.remove('scroll-reveal-hidden');
      revealedElements.add(element);
    };

    const checkInitialVisibleElements = () => {
      const allRevealElements = document.querySelectorAll('article .scroll-reveal-item');
      allRevealElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
          revealElement(element);
        }
      });
    };

    checkInitialVisibleElements();
  }, [steps]);

  // Scroll reveal animations standardizzate
  useScrollReveal('article .scroll-reveal-item', {
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
    rootMargin: '0px'
  });

  // Effetto per gestire l'ingrandimento degli step quando sono centrati e l'indicatore dinamico
  useEffect(() => {
    if (!steps || steps.length === 0) return;
    
    // Aspetta che il DOM sia pronto
    const setupIndicator = () => {
      const stepsContainer = stepsContainerRef.current || document.querySelector('.guida-steps') as HTMLElement;
      if (!stepsContainer) {
        setTimeout(setupIndicator, 50);
        return;
      }
    
      const updateIndicator = (element: HTMLElement) => {
        if (!stepsContainer || !element) return;
        
        try {
          // Calcola la posizione relativa al container usando getBoundingClientRect
          const containerRect = stepsContainer.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          
          // Posizione relativa al container (getBoundingClientRect restituisce coordinate viewport)
          // In desktop, dobbiamo assicurarci che il calcolo sia corretto anche con scroll
          const stepTop = elementRect.top - containerRect.top;
          const stepHeight = elementRect.height;
          const indicatorHeight = 60;
          let indicatorTop = stepTop + (stepHeight / 2) - (indicatorHeight / 2);
          
          // Assicurati che l'indicatore non vada mai sopra il primo step
          const firstStep = stepRefs.current[0];
          if (firstStep && firstStep !== element) {
            const firstStepRect = firstStep.getBoundingClientRect();
            const firstStepTop = firstStepRect.top - containerRect.top;
            const minIndicatorTop = firstStepTop + (firstStepRect.height / 2) - (indicatorHeight / 2);
            // Se stiamo cercando di posizionare l'indicatore sopra il primo step, usa il primo step
            if (indicatorTop < minIndicatorTop) {
              indicatorTop = minIndicatorTop;
            }
          }
          
          // Assicurati che l'indicatore non vada in negativo
          indicatorTop = Math.max(0, indicatorTop);
          
          // Aggiorna la variabile CSS - forza l'aggiornamento anche in desktop
          stepsContainer.style.setProperty('--indicator-top', `${indicatorTop}px`);
          
          // Forza il reflow per assicurarsi che il browser aggiorni la posizione
          void stepsContainer.offsetHeight;
        } catch (error) {
          logger.error('Error updating indicator:', error);
        }
      };

      // Inizializza l'indicatore sul primo step
      const initializeIndicator = () => {
      const firstStep = stepRefs.current[0];
      if (!firstStep || !stepsContainer) return;
      
      // Forza il calcolo della posizione dopo che il DOM è stato renderizzato
      const init = () => {
        const containerRect = stepsContainer.getBoundingClientRect();
        const firstStepRect = firstStep.getBoundingClientRect();
        const stepTop = firstStepRect.top - containerRect.top;
        const stepHeight = firstStepRect.height;
        const indicatorHeight = 60;
        const indicatorTop = Math.max(0, stepTop + (stepHeight / 2) - (indicatorHeight / 2));
        
        // Imposta direttamente la posizione dell'indicatore sul primo step
        stepsContainer.style.setProperty('--indicator-top', `${indicatorTop}px`);
        
        // Aggiungi anche la classe centered al primo step se è visibile
        const viewportCenter = window.innerHeight / 2;
        const elementCenter = firstStepRect.top + (firstStepRect.height / 2);
        const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
        if (distanceFromCenter < 200) {
          firstStep.classList.add('centered');
        }
      };
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          init();
        });
      });
    };

    const observerOptions = {
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      rootMargin: '-40% 0px -40% 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const element = entry.target as HTMLElement;
        const viewportCenter = window.innerHeight / 2;
        const elementRect = element.getBoundingClientRect();
        const elementCenter = elementRect.top + (elementRect.height / 2);
        const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
        const isCentered = entry.isIntersecting && distanceFromCenter < 100;
        
        if (isCentered) {
          stepRefs.current.forEach((ref) => {
            if (ref && ref !== element) {
              ref.classList.remove('centered');
            }
          });
          
          element.classList.add('centered');
          updateIndicator(element);
        } else {
          element.classList.remove('centered');
        }
      });
    }, observerOptions);

      const handleScroll = () => {
        if (!stepsContainer) return;
        
        const viewportCenter = window.innerHeight / 2;
        let closestStep: HTMLElement | null = null;
        let closestDistance = Infinity;
        
        // Trova lo step più vicino al centro del viewport
        stepRefs.current.forEach((ref) => {
          if (ref) {
            const elementRect = ref.getBoundingClientRect();
            const elementCenter = elementRect.top + (elementRect.height / 2);
            const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
            
            // Considera solo gli step visibili nel viewport
            // In desktop, gli step potrebbero essere più grandi, quindi allarghiamo la condizione
            if (elementRect.top < window.innerHeight + 500 && elementRect.bottom > -500) {
              if (distanceFromCenter < closestDistance) {
                closestDistance = distanceFromCenter;
                closestStep = ref;
              }
            }
          }
        });
        
        // Se non c'è uno step visibile, usa il primo step
        if (!closestStep) {
          closestStep = stepRefs.current[0];
        }
        
        // Aggiorna l'indicatore sempre, anche se non c'è uno step perfettamente centrato
        if (closestStep) {
          // Rimuovi la classe centered da tutti gli step
          stepRefs.current.forEach((ref) => {
            if (ref) {
              ref.classList.remove('centered');
            }
          });
          
          // Aggiungi la classe centered allo step più vicino
          closestStep.classList.add('centered');
          
          // Aggiorna la posizione dell'indicatore
          updateIndicator(closestStep);
        }

        // Calcola il progresso basato sugli step completati
        const newCompletedSteps = new Set<number>();
        stepRefs.current.forEach((ref, index) => {
          if (ref) {
            const rect = ref.getBoundingClientRect();
            // Uno step è considerato completato se è passato sopra il viewport (30% dall'alto)
            if (rect.top < window.innerHeight * 0.3) {
              newCompletedSteps.add(index);
            }
          }
        });

        // Calcola la percentuale di completamento
        const totalSteps = steps.length;
        const completedCount = newCompletedSteps.size;
        const currentProgress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
        
        setProgress(currentProgress);
      };

      stepRefs.current.forEach((ref) => {
        if (ref) {
          observer.observe(ref);
        }
      });

      // Inizializza l'indicatore sul primo step
      // Usa più timeout per assicurarsi che il DOM sia completamente renderizzato
      const initTimeout1 = setTimeout(() => {
        initializeIndicator();
      }, 100);
      
      const initTimeout2 = setTimeout(() => {
        initializeIndicator();
        handleScroll();
      }, 300);
      
      const initTimeout3 = setTimeout(() => {
        handleScroll();
      }, 500);

      // Throttle migliorato per prestazioni ottimali
      let ticking = false;
      let lastScrollTime = 0;
      const scrollThrottle = 16; // ~60fps
      
      const throttledHandleScroll = () => {
        const currentTime = performance.now();
        
        if (!ticking && (currentTime - lastScrollTime >= scrollThrottle)) {
          requestAnimationFrame(() => {
            handleScroll();
            lastScrollTime = performance.now();
            ticking = false;
          });
          ticking = true;
        }
      };

      // Aggiungi listener per scroll e resize
      window.addEventListener('scroll', throttledHandleScroll, { passive: true });
      window.addEventListener('resize', handleScroll, { passive: true });
      
      // Forza un aggiornamento iniziale e continuo
      handleScroll();
      
      // In desktop, aggiorna anche periodicamente per assicurarsi che funzioni (meno frequente per performance)
      const updateInterval = setInterval(() => {
        if (!ticking) {
          handleScroll();
        }
      }, 200);

      return () => {
        window.removeEventListener('scroll', throttledHandleScroll);
        window.removeEventListener('resize', handleScroll);
        observer.disconnect();
        clearTimeout(initTimeout1);
        clearTimeout(initTimeout2);
        clearTimeout(initTimeout3);
        clearInterval(updateInterval);
      };
    };
    
    setupIndicator();
  }, [steps]);

  // Ferma il parlato quando si cambia pagina o il componente si smonta
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setSpeakingStepIndex(null);
    };
  }, [location.pathname]);

  // Carica le voci quando il componente si monta
  useEffect(() => {
    // Verifica se SpeechSynthesis è disponibile
    if (!window.speechSynthesis) {
      logger.warn('SpeechSynthesis non disponibile su questo browser');
      setIsSpeechSynthesisAvailable(false);
      return;
    }

    setIsSpeechSynthesisAvailable(true);

    const loadVoices = () => {
      if (!window.speechSynthesis) return;
      
      const voices = window.speechSynthesis.getVoices();
      const italianVoices = voices.filter(voice => voice.lang.startsWith('it'));
      
      // Seleziona automaticamente la prima voce italiana se non ne è stata scelta una
      if (italianVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(italianVoices[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Esegue solo al mount, selectedVoice viene gestito internamente

  // Funzione per leggere uno step
  const speakStep = (step: Step, stepIndex: number) => {
    // Verifica se SpeechSynthesis è disponibile
    if (!window.speechSynthesis) {
      logger.warn('SpeechSynthesis non disponibile su questo browser');
      return;
    }

    // Se questo step sta già parlando, fermalo
    if (speakingStepIndex === stepIndex) {
      window.speechSynthesis.cancel();
      if (isMountedRef.current) {
        setSpeakingStepIndex(null);
      }
      return;
    }

    // Ferma qualsiasi altro parlato in corso
    window.speechSynthesis.cancel();

    // Costruisci il testo completo dello step
    let textToSpeak = `${step.title}. ${step.description}`;
    if (step.list && step.list.length > 0) {
      textToSpeak += '. ' + step.list.map((item, i) => `${i + 1}. ${item}`).join('. ');
    }

    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'it-IT';
    utterance.rate = 0.95; // Velocità naturale e rilassata
    utterance.pitch = 0.9; // Pitch leggermente basso per voce maschile naturale
    utterance.volume = 1;

    // Usa la voce selezionata dall'utente
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Verifica se il componente è ancora montato prima di aggiornare lo stato
    utterance.onstart = () => {
      if (isMountedRef.current) {
        setSpeakingStepIndex(stepIndex);
      }
    };
    utterance.onend = () => {
      if (isMountedRef.current) {
        setSpeakingStepIndex(null);
      }
    };
    utterance.onerror = () => {
      if (isMountedRef.current) {
        setSpeakingStepIndex(null);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <article>
      {/* Barra di progresso - sempre visibile su mobile */}
      <div 
        className="guida-progress-bar-container" 
        ref={progressBarRef}
        style={{ display: 'flex' }}
      >
        <div className="guida-progress-bar">
          <div 
            className="guida-progress-bar-fill" 
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progresso guida: ${Math.round(progress)}%`}
          />
        </div>
        <span className="guida-progress-text">{Math.round(progress)}%</span>
      </div>

      <header className="guida-hero scroll-reveal-item scroll-reveal-hidden">
        <div className="guida-hero-content">
          <div className="guida-hero-image">
            <img src={image} alt={`Immagine illustrativa della guida su ${title}: ${subtitle}. Rappresenta visivamente il contenuto della guida passo-passo.`} loading="lazy" width="300" height="300" />
          </div>
          <div className="guida-hero-text">
            <h1>{title}</h1>
            <p className="guida-subtitle">{subtitle}</p>
            <div className="guida-meta">
              <span className={`difficulty ${info.difficulty.toLowerCase()}`}>{info.difficulty}</span>
              <span className="duration">{info.duration}</span>
              <span className="steps">{info.stepsCount || steps.length} passi</span>
            </div>
          </div>
        </div>
      </header>

      {prerequisites && prerequisites.documents.length > 0 && (
        <section className="guida-prerequisites scroll-reveal-item scroll-reveal-hidden">
          <div className="guida-container">
            <h2 className="prerequisites-title">{prerequisites.title || "Prima di iniziare"}</h2>
            <div className="prerequisites-grid">
              <div className="prerequisites-icon-box scroll-reveal-item scroll-reveal-hidden">
                <FileTextIcon />
              </div>
              <div className="prerequisites-content scroll-reveal-item scroll-reveal-hidden">
                <p className="prerequisites-description">Assicurati di avere a disposizione i seguenti documenti:</p>
                <ul className="prerequisites-list">
                  {prerequisites.documents.map((document, index) => (
                    <li key={index} className="prerequisites-item">
                      {document}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="guida-content">
        <div className="guida-container">
          <div className="guida-content-wrapper">
            <div className="guida-steps" ref={stepsContainerRef}>
              <h2 className="scroll-reveal-item scroll-reveal-hidden">{`Passaggi per ${title}`}</h2>
              {steps.map((step, index) => (
                <article 
                  ref={(el) => {
                    stepRefs.current[index] = el;
                  }}
                  className="step scroll-reveal-item scroll-reveal-hidden" 
                  key={index}
                >
                  <div className="step-number">{index + 1}</div>
                  <div className="step-content">
                    <h3 className="step-title">{step.title}</h3>
                    <div className="step-description">
                      {typeof step.description === 'string' ? (
                        <p>{step.description}</p>
                      ) : (
                        step.description
                      )}
                      {step.link && (() => {
                        const sanitizedLink = sanitizeURL(step.link);
                        if (!sanitizedLink) return null;
                        return (
                          <a 
                            href={sanitizedLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="step-link"
                            aria-label={`Visita il sito ufficiale per ${step.title} (si apre in una nuova scheda)`}
                          >
                            Visita il sito ufficiale per {step.title}
                          </a>
                        );
                      })()}
                    </div>
                    {step.list && (
                      <ul>
                        {step.list.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {isSpeechSynthesisAvailable && (
                      <button
                        type="button"
                        className={`step-speak-btn ${speakingStepIndex === index ? 'speaking' : ''}`}
                        onClick={() => speakStep(step, index)}
                        aria-label={speakingStepIndex === index ? 'Ferma lettura' : 'Ascolta questo step'}
                        title={speakingStepIndex === index ? 'Ferma lettura' : 'Ascolta step'}
                      >
                        <span>{speakingStepIndex === index ? 'Ferma' : 'Ascolta'}</span>
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
            {sidebarContent && sidebarContent.length > 0 && (
              <aside className="guida-sidebar scroll-reveal-item scroll-reveal-hidden">
                {sidebarContent.map((item, index) => {
                  // Determina l'icona in base al titolo
                  const getIcon = () => {
                    if (item.title?.toLowerCase().includes('link') || item.title?.toLowerCase().includes('utili')) {
                      return <Link2Icon className="guida-sidebar-title-icon" />;
                    }
                    if (item.title?.toLowerCase().includes('informazioni') || item.title?.toLowerCase().includes('info')) {
                      return <InfoCircledIcon className="guida-sidebar-title-icon" />;
                    }
                    return null;
                  };

                  return (
                    <section key={index} className="guida-sidebar-item scroll-reveal-item scroll-reveal-hidden">
                      {item.title && (
                        <h3 className="guida-sidebar-title">
                          {getIcon()}
                          <span>{item.title}</span>
                        </h3>
                      )}
                      {item.content && <div className="guida-sidebar-content">{item.content}</div>}
                      {item.links && item.links.length > 0 && (
                        <nav aria-label={item.title || "Link utili"}>
                          <ul className="guida-sidebar-links">
                            {item.links.map((link, linkIndex) => {
                              // Valida URL esterni, permetti link interni
                              const sanitizedUrl = link.external 
                                ? sanitizeURL(link.url) 
                                : (link.url.startsWith('/') ? link.url : sanitizeURL(link.url));
                              
                              if (!sanitizedUrl) return null;
                              
                              return (
                                <li key={linkIndex}>
                                  <a 
                                    href={sanitizedUrl} 
                                    target={link.external ? "_blank" : undefined}
                                    rel={link.external ? "noopener noreferrer" : undefined}
                                    className="guida-sidebar-link"
                                  >
                                    {link.text}
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        </nav>
                      )}
                    </section>
                  );
                })}
              </aside>
            )}
          </div>
        </div>
      </section>

      {(previousLink || nextLink) && (
        <nav className={`guida-navigation-wrapper ${!previousLink ? 'only-next' : ''} scroll-reveal-item scroll-reveal-hidden`} aria-label="Navigazione tra le guide">
          {previousLink && (
            <Link 
              to={previousLink} 
              className="nav-button previous"
              aria-label={`Vai alla guida precedente: ${previousTitle}`}
            >
              {previousTitle}
            </Link>
          )}
          {nextLink && (
            <Link 
              to={nextLink} 
              className="nav-button next"
              aria-label={`Vai alla guida successiva: ${nextTitle}`}
            >
              {nextTitle}
            </Link>
          )}
        </nav>
      )}
    </article>
  );
};

export default GuidaTemplate;
