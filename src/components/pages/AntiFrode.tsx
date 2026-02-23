import React, { useState, useEffect, useLayoutEffect, useRef, memo } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { 
  LightningBoltIcon, 
  LockClosedIcon, 
  GearIcon, 
  MobileIcon, 
  CheckIcon, 
  BarChartIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon as AlertIcon,
  Link2Icon
} from '@radix-ui/react-icons';
import difesaImage from '../../assets/SGAMY_SCUDO.webp';
import './AntiFrode.css';

import type { InteractiveAccessibilityProps } from '../../types/accessibility';

interface CollapsibleProps extends InteractiveAccessibilityProps {
  title: string;
  content: string;
}

const Collapsible: React.FC<CollapsibleProps> = memo(({ title, content }) => {
  const [open, setOpen] = useState(false);
  const id = title.replace(/\s+/g, '-').toLowerCase();
  
  return (
    <article className="antifrode-collapsible">
      <button 
        type="button" 
        className="antifrode-collapsible__header" 
        onClick={() => setOpen(!open)} 
        aria-expanded={open}
        aria-controls={`collapsible-content-${id}`}
        id={`collapsible-header-${id}`}
      >
        <span>{title}</span>
        <span className={`antifrode-collapsible__icon ${open ? 'open' : ''}`}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div 
          className="antifrode-collapsible__content" 
          role="region"
          id={`collapsible-content-${id}`}
          aria-labelledby={`collapsible-header-${id}`}
        >
          {content}
        </div>
      )}
    </article>
  );
});

const AntiFrode: React.FC = () => {
  const [semaforoColor, setSemaforoColor] = useState<'verde' | 'giallo' | 'rosso'>('verde');
  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false);
  const introRef = useRef<HTMLElement>(null);
  const practicesRef = useRef<HTMLElement>(null);
  const chatbotRef = useRef<HTMLElement>(null);
  const collapsiblesRef = useRef<HTMLElement>(null);
  const backgroundImageRef = useRef<HTMLDivElement>(null);

  const handleTestLink = (color: 'verde' | 'giallo' | 'rosso') => {
    setSemaforoColor(color);
  };

  // useLayoutEffect per rivelare gli elementi visibili PRIMA del rendering
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
      const allRevealElements = document.querySelectorAll('.scroll-reveal-item');
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

  // Lazy load per l'immagine di background
  useEffect(() => {
    if (!backgroundImageRef.current || backgroundImageLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !backgroundImageLoaded) {
            const img = new Image();
            img.onload = () => {
              setBackgroundImageLoaded(true);
              if (backgroundImageRef.current) {
                backgroundImageRef.current.style.backgroundImage = `url(${difesaImage})`;
              }
            };
            img.src = difesaImage;
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(backgroundImageRef.current);

    return () => observer.disconnect();
  }, [backgroundImageLoaded]);

  // Scroll reveal animations standardizzate
  useScrollReveal('.scroll-reveal-item', {
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
    rootMargin: '0px'
  });

  // Effetto separato per gestire l'alert quando cambia il colore
  useEffect(() => {
    const statusMessage = document.querySelector('.status-message');
    if (statusMessage) {
      // Rimuove le classi per forzare il re-render
      statusMessage.classList.remove('scroll-reveal-visible', 'scroll-reveal-hidden');
      // Aggiunge la classe hidden inizialmente
      statusMessage.classList.add('scroll-reveal-hidden');
      // Dopo un breve delay, mostra l'alert con l'effetto
      setTimeout(() => {
        statusMessage.classList.add('scroll-reveal-visible');
        statusMessage.classList.remove('scroll-reveal-hidden');
      }, 50);
    }
  }, [semaforoColor]);


  return (
    <section className="antifrode">

      <header ref={introRef} className="antifrode__intro scroll-reveal-item scroll-reveal-hidden">
        <h1 className="antifrode__main-title scroll-reveal-item scroll-reveal-hidden">Protezione Anti-Frode</h1>
        <p className="scroll-reveal-item scroll-reveal-hidden">Il nostro sistema intelligente analizza messaggi, email e comunicazioni per proteggerti da tentativi di frode e phishing.</p>
      </header>

      <section ref={chatbotRef} className="antifrode__chatbot scroll-reveal-item scroll-reveal-hidden">
        <div className="semaforo-container">
          <div className="semaforo-visual-wrapper scroll-reveal-item scroll-reveal-hidden">
            <div className="semaforo-visual scroll-reveal-item scroll-reveal-hidden">
              <div className={`semaforo-light rosso ${semaforoColor === 'rosso' ? 'active' : ''}`}></div>
              <div className={`semaforo-light giallo ${semaforoColor === 'giallo' ? 'active' : ''}`}></div>
              <div className={`semaforo-light verde ${semaforoColor === 'verde' ? 'active' : ''}`}></div>
            </div>
            <div className="antifrode__buttons scroll-reveal-item scroll-reveal-hidden" role="group" aria-label="Test semaforo di sicurezza">
              <button 
                type="button" 
                onClick={() => handleTestLink('rosso')}
                aria-label="Testa link con possibile rischio - semaforo rosso"
              >
                Test Rosso
              </button>
              <button 
                type="button" 
                onClick={() => handleTestLink('giallo')}
                aria-label="Testa link con rischio moderato - semaforo giallo"
              >
                Test Giallo
              </button>
              <button 
                type="button" 
                onClick={() => handleTestLink('verde')}
                aria-label="Testa link sicuro - semaforo verde"
              >
                Test Verde
              </button>
            </div>
          </div>
          <div className="semaforo-info scroll-reveal-item scroll-reveal-hidden">
            <h2>Semaforo Dinamico</h2>
            <p className="semaforo-description">Simula la valutazione di un link sospetto con il nostro semaforo interattivo. Il sistema ti aiuta a comprendere rapidamente il livello di rischio associato a un link o a un messaggio.</p>
            <div className="semaforo-status">
              {semaforoColor === 'verde' && (
                <div 
                  key="verde" 
                  className="status-message verde scroll-reveal-item scroll-reveal-hidden" 
                  role="status" 
                  aria-live="polite"
                >
                  <CheckCircledIcon className="status-icon" />
                  <span>Sicuro - Nessun rischio rilevato</span>
                </div>
              )}
              {semaforoColor === 'giallo' && (
                <div 
                  key="giallo" 
                  className="status-message giallo scroll-reveal-item scroll-reveal-hidden" 
                  role="status" 
                  aria-live="polite"
                >
                  <ExclamationTriangleIcon className="status-icon" />
                  <span>Attenzione - Rischio Moderato</span>
                </div>
              )}
              {semaforoColor === 'rosso' && (
                <div 
                  key="rosso" 
                  className="status-message rosso scroll-reveal-item scroll-reveal-hidden" 
                  role="status" 
                  aria-live="polite"
                >
                  <CrossCircledIcon className="status-icon" />
                  <span>Pericolo - Possibile Rischio</span>
                </div>
              )}
            </div>
            <p className="disclaimer">Informativo. Nessuna responsabilità per danni o perdite.</p>
          </div>
        </div>
      </section>

      <section className="antifrode__how-it-works scroll-reveal-item scroll-reveal-hidden">
        <h2 className="antifrode__how-it-works-title">Come Funziona</h2>
        <div className="antifrode__steps">
          <div className="antifrode__step scroll-reveal-item scroll-reveal-hidden">
            <div className="antifrode__step-number">1</div>
            <h3 className="antifrode__step-title">Invia il messaggio</h3>
            <p className="antifrode__step-description">Incolla il testo del messaggio sospetto che hai ricevuto (email, SMS, WhatsApp, ecc. )</p>
          </div>
          <div className="antifrode__step scroll-reveal-item scroll-reveal-hidden">
            <div className="antifrode__step-number">2</div>
            <h3 className="antifrode__step-title">Analisi Intelligente</h3>
            <p className="antifrode__step-description">Il nostro assistente analizza il contenuto utilizzando algoritmi di machine learning per identificare pattern di frode e phishing</p>
          </div>
          <div className="antifrode__step scroll-reveal-item scroll-reveal-hidden">
            <div className="antifrode__step-number">3</div>
            <h3 className="antifrode__step-title">Valutazione a Semaforo</h3>
            <p className="antifrode__step-description">Ricevi una valutazione immediata basata sulla probabilità di rischio</p>
          </div>
        </div>
      </section>

      <section className="antifrode__what-we-analyze scroll-reveal-item scroll-reveal-hidden">
        <h2 className="antifrode__what-we-analyze-title">Cosa Analizziamo</h2>
        <div className="antifrode__analyze-list">
          <div className="antifrode__analyze-item scroll-reveal-item scroll-reveal-hidden">
            URL sospetti o accorciati
          </div>
          <div className="antifrode__analyze-item scroll-reveal-item scroll-reveal-hidden">
            Linguaggio di urgenza e pressione
          </div>
          <div className="antifrode__analyze-item scroll-reveal-item scroll-reveal-hidden">
            Richiesta di dati sensibili
          </div>
          <div className="antifrode__analyze-item scroll-reveal-item scroll-reveal-hidden">
            Errori grammaticali e ortografici
          </div>
          <div className="antifrode__analyze-item scroll-reveal-item scroll-reveal-hidden">
            Promesse di guadagni facili
          </div>
          <div className="antifrode__analyze-item scroll-reveal-item scroll-reveal-hidden">
            Mittenti e domini sospetti
          </div>
          <div className="antifrode__analyze-item scroll-reveal-item scroll-reveal-hidden">
            Pattern di phishing noti
          </div>
        </div>
      </section>

      <section className="antifrode__benefits scroll-reveal-item scroll-reveal-hidden">
        <h2 className="antifrode__benefits-title">Vantaggi del Servizio</h2>
        <div className="antifrode__benefits-grid">
          <div className="antifrode__benefit-card scroll-reveal-item scroll-reveal-hidden">
            <div className="antifrode__benefit-icon">
              <LightningBoltIcon />
            </div>
            <h3 className="antifrode__benefit-title">Analisi Immediata</h3>
            <p className="antifrode__benefit-description">Ricevi una valutazione istantanea del livello di rischio senza attese</p>
          </div>
          <div className="antifrode__benefit-card scroll-reveal-item scroll-reveal-hidden">
            <div className="antifrode__benefit-icon">
              <LockClosedIcon />
            </div>
            <h3 className="antifrode__benefit-title">Sicurezza Garantita</h3>
            <p className="antifrode__benefit-description">Protezione avanzata contro frodi e tentativi di phishing</p>
          </div>
          <div className="antifrode__benefit-card scroll-reveal-item scroll-reveal-hidden">
            <div className="antifrode__benefit-icon">
              <GearIcon />
            </div>
            <h3 className="antifrode__benefit-title">Intelligenza Artificiale</h3>
            <p className="antifrode__benefit-description">Algoritmi di machine learning all'avanguardia per rilevare pattern sospetti</p>
          </div>
          <div className="antifrode__benefit-card scroll-reveal-item scroll-reveal-hidden">
            <div className="antifrode__benefit-icon">
              <MobileIcon />
            </div>
            <h3 className="antifrode__benefit-title">Facile da Usare</h3>
            <p className="antifrode__benefit-description">Interfaccia intuitiva e semplice, accessibile a tutti</p>
          </div>
          <div className="antifrode__benefit-card scroll-reveal-item scroll-reveal-hidden">
            <div className="antifrode__benefit-icon">
              <CheckIcon />
            </div>
            <h3 className="antifrode__benefit-title">Gratuito</h3>
            <p className="antifrode__benefit-description">Servizio completamente gratuito e sempre disponibile</p>
          </div>
          <div className="antifrode__benefit-card scroll-reveal-item scroll-reveal-hidden">
            <div className="antifrode__benefit-icon">
              <BarChartIcon />
            </div>
            <h3 className="antifrode__benefit-title">Risultati Chiari</h3>
            <p className="antifrode__benefit-description">Sistema a semaforo che indica immediatamente il livello di rischio</p>
          </div>
        </div>
      </section>

      <hr className="antifrode-divider scroll-reveal-item scroll-reveal-hidden" />

      <section className="antifrode__fraud-report scroll-reveal-item scroll-reveal-hidden">
        <h2 className="antifrode__fraud-report-title">Hai ricevuto una truffa?</h2>
        <p className="antifrode__fraud-report-intro">
          Se hai ricevuto un messaggio sospetto o sei stato vittima di una truffa, segui questa guida e contatta le autorità competenti.
        </p>

        <div className="antifrode__fraud-guide">
          <h3 className="antifrode__fraud-guide-title">Cosa fare subito</h3>
          <div className="antifrode__fraud-steps">
            <div className="antifrode__fraud-step scroll-reveal-item scroll-reveal-hidden">
              <div className="antifrode__fraud-step-number">1</div>
              <div className="antifrode__fraud-step-content">
                <h4>Non rispondere</h4>
                <p>Non rispondere al messaggio e non cliccare su link o allegati sospetti</p>
              </div>
            </div>
            <div className="antifrode__fraud-step scroll-reveal-item scroll-reveal-hidden">
              <div className="antifrode__fraud-step-number">2</div>
              <div className="antifrode__fraud-step-content">
                <h4>Conserva le prove</h4>
                <p>Salva screenshot, email, SMS o qualsiasi altra comunicazione ricevuta</p>
              </div>
            </div>
            <div className="antifrode__fraud-step scroll-reveal-item scroll-reveal-hidden">
              <div className="antifrode__fraud-step-number">3</div>
              <div className="antifrode__fraud-step-content">
                <h4>Segnala immediatamente</h4>
                <p>Contatta le autorità competenti utilizzando i contatti qui sotto</p>
              </div>
            </div>
            <div className="antifrode__fraud-step scroll-reveal-item scroll-reveal-hidden">
              <div className="antifrode__fraud-step-number">4</div>
              <div className="antifrode__fraud-step-content">
                <h4>Proteggi i tuoi account</h4>
                <p>Cambia immediatamente le password se hai fornito dati sensibili</p>
              </div>
            </div>
          </div>
        </div>

        <div className="antifrode__fraud-contacts">
          <h3 className="antifrode__fraud-contacts-title">Contatti utili per segnalare</h3>
          <div className="antifrode__fraud-contacts-grid">
            <div className="antifrode__fraud-contact-card scroll-reveal-item scroll-reveal-hidden">
              <div className="antifrode__fraud-contact-icon">
                <AlertIcon />
              </div>
              <h4 className="antifrode__fraud-contact-name">Polizia Postale</h4>
              <p className="antifrode__fraud-contact-desc">Segnalazione reati informatici e truffe online</p>
              <div className="antifrode__fraud-contact-info">
                <a href="https://www.commissariatodips.it/" target="_blank" rel="noopener noreferrer" className="antifrode__fraud-contact-link" aria-label="Visita il sito web del Commissariato di Polizia Postale (si apre in una nuova scheda)">
                  <Link2Icon />
                  <span>www.commissariatodips.it</span>
                </a>
                <a href="mailto:poliziapostale@poliziadistato.it" className="antifrode__fraud-contact-link" aria-label="Invia email al Commissariato di Polizia Postale all'indirizzo poliziapostale@poliziadistato.it">
                  <Link2Icon />
                  <span>poliziapostale@poliziadistato.it</span>
                </a>
              </div>
            </div>

            <div className="antifrode__fraud-contact-card scroll-reveal-item scroll-reveal-hidden">
              <div className="antifrode__fraud-contact-icon">
                <AlertIcon />
              </div>
              <h4 className="antifrode__fraud-contact-name">Guardia di Finanza</h4>
              <p className="antifrode__fraud-contact-desc">Frodi finanziarie e truffe bancarie</p>
              <div className="antifrode__fraud-contact-info">
                <a href="tel:117" className="antifrode__fraud-contact-link" aria-label="Chiama il numero di emergenza 117 della Guardia di Finanza">
                  <MobileIcon />
                  <span>117 (Numero di emergenza)</span>
                </a>
                <a href="https://www.gdf.gov.it/" target="_blank" rel="noopener noreferrer" className="antifrode__fraud-contact-link" aria-label="Visita il sito web della Guardia di Finanza (si apre in una nuova scheda)">
                  <Link2Icon />
                  <span>www.gdf.gov.it</span>
                </a>
              </div>
            </div>

            <div className="antifrode__fraud-contact-card scroll-reveal-item scroll-reveal-hidden">
              <div className="antifrode__fraud-contact-icon">
                <AlertIcon />
              </div>
              <h4 className="antifrode__fraud-contact-name">Numero Unico di Emergenza</h4>
              <p className="antifrode__fraud-contact-desc">Carabinieri, Polizia, Ambulanza, Vigili del Fuoco</p>
              <div className="antifrode__fraud-contact-info">
                <a href="tel:112" className="antifrode__fraud-contact-link" aria-label="Chiama il numero unico di emergenza 112 per Carabinieri, Polizia, Ambulanza e Vigili del Fuoco">
                  <MobileIcon />
                  <span>112</span>
                </a>
                <p className="antifrode__fraud-contact-note">Numero unico europeo per tutte le emergenze</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="antifrode-divider scroll-reveal-item scroll-reveal-hidden" />

      <section ref={practicesRef} className="antifrode__practices-wrapper scroll-reveal-item scroll-reveal-hidden">
        <article className="antifrode__practices">
          <div className="antifrode__practices-image">
            <div 
              ref={backgroundImageRef}
              className="antifrode__practices-background"
            >
              <div className="antifrode__practices-overlay"></div>
            </div>
          </div>
          <div className="antifrode__practices-content">
            <h2 className="antifrode__practices-title">Pratiche di Sicurezza</h2>
            <p className="antifrode__practices-subtitle">Per una navigazione e vita digitale più sicura</p>
            <ul className="antifrode-practices-list">
              <li>Non condividere mai password o codici PIN via telefono o email</li>
              <li>Controlla sempre il mittente di email e messaggi</li>
              <li>Installa sempre gli aggiornamenti di sicurezza</li>
              <li>Usa password diverse per ogni servizio</li>
              <li>Attiva l'autenticazione a due fattori quando possibile</li>
              <li>Presta attenzione alla grammatica e alle richieste urgenti</li>
            </ul>
          </div>
        </article>
      </section>

      <section ref={collapsiblesRef} className="antifrode__collapsibles scroll-reveal-item scroll-reveal-hidden">
        <h2 className="scroll-reveal-item scroll-reveal-hidden">Approfondimenti</h2>
        <div className="antifrode-collapsibles-list">
          <div className="scroll-reveal-item scroll-reveal-hidden">
            <Collapsible
              title="Cos'è un Phishing?"
              content="Il phishing è un tentativo di truffa online in cui i malintenzionati cercano di ottenere informazioni sensibili fingendosi enti affidabili."
            />
          </div>
          <div className="scroll-reveal-item scroll-reveal-hidden">
            <Collapsible
              title="Come riconoscere un link sospetto"
              content="Controlla sempre l'URL, verifica certificati SSL, cerca errori di ortografia o domini strani."
            />
          </div>
          <div className="scroll-reveal-item scroll-reveal-hidden">
            <Collapsible
              title="Password sicure"
              content="Usa combinazioni lunghe, includi numeri, simboli, lettere maiuscole e minuscole. Cambiale spesso e non riciclarle."
            />
          </div>
        </div>
      </section>

      
    </section>
  );
};

export default memo(AntiFrode);
