import React, { useRef, useState, memo } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { 
  EnvelopeClosedIcon,
  HomeIcon,
  GlobeIcon,
  MobileIcon,
  ChatBubbleIcon,
  FileTextIcon,
  AccessibilityIcon,
  EyeOpenIcon,
  LockClosedIcon,
  PersonIcon
} from '@radix-ui/react-icons';
import './Info.css';

interface Service {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const servizi: Service[] = [
  {
    title: "Assistente Digitale Educativo",
    description: "Un assistente virtuale intelligente che risponde a tutte le tue domande su truffe online, phishing e sicurezza digitale. Disponibile 24/7, chiaro e semplice da capire.",
    icon: <ChatBubbleIcon />
  },
  {
    title: "Guide Pratiche",
    description: "Guide passo passo per usare strumenti online in sicurezza, riconoscere link sospetti e proteggere dati personali. Testi chiari, esempi concreti e screenshot intuitivi.",
    icon: <FileTextIcon />
  },
  {
    title: "Metodologia Sicura",
    description: "Approccio basato su spiegazioni semplici, esempi pratici e attività guidate, seguendo principi didattici per adulti e anziani. Ogni passo è verificabile e facilmente replicabile.",
    icon: <LockClosedIcon />
  },
  {
    title: "UX/UI Inclusiva",
    description: "Design pensato per utenti anziani: font grandi, contrasto elevato, colori chiari, pulsanti grandi e leggibili. Riduce errori e stress visivo durante l'uso dell'app.",
    icon: <EyeOpenIcon />
  },
  {
    title: "Accessibilità & WCAG",
    description: "Rispettiamo gli standard WCAG 2.1: navigazione da tastiera, lettori di schermo compatibili, testi leggibili e etichette chiare. Nessun utente è escluso dall'esperienza digitale.",
    icon: <AccessibilityIcon />
  },
  {
    title: "Consapevolezza Digitale",
    description: "Promuoviamo l'alfabetizzazione digitale per anziani: capire i rischi, riconoscere phishing e truffe telefoniche, sapere come reagire e proteggere i propri dati.",
    icon: <PersonIcon />
  }
];

const Info: React.FC = () => {
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [activeMethodologyTab, setActiveMethodologyTab] = useState<string>('educazione');

  // Scroll reveal animations standardizzate
  useScrollReveal('.scroll-reveal-item', {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  return (
    <section className="info">
      <header className="info__intro scroll-reveal-item scroll-reveal-hidden">
        <h1 className="info__main-title">
          Info e Contatti
        </h1>
        <p className="info__subtitle">
          Scopri di più su SgamApp, i nostri servizi e come contattarci. Siamo qui per aiutarti a navigare in sicurezza nel mondo digitale.
        </p>
      </header>

      {/* Sezione Servizi */}
      <section className="info__services scroll-reveal-item scroll-reveal-hidden">
        <h2 className="info__section-title">I Nostri Servizi</h2>
        <div className="info__cards" ref={cardsContainerRef}>
          {servizi.map((item, index) => (
            <article 
              key={index} 
              className="info-card scroll-reveal-item scroll-reveal-hidden"
            >
              <div className="info-card__icon">
                {item.icon}
              </div>
              <h3 className="info-card__title">{item.title}</h3>
              <p className="info-card__description">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Sezione Informazioni */}
      <section className="info__about scroll-reveal-item scroll-reveal-hidden">
        <h2 className="info__section-title">Chi Siamo</h2>
        <div className="info__about-content">
          <p className="info__about-text">
            SgamApp è una piattaforma digitale progettata per aiutare gli utenti, in particolare gli anziani, 
            a navigare in sicurezza nel mondo digitale. La nostra missione è proteggere gli utenti dalle truffe 
            online attraverso educazione, strumenti pratici e supporto continuo.
          </p>
          <p className="info__about-text">
            Offriamo strumenti innovativi, guide pratiche, supporto personalizzato e un design inclusivo 
            pensato per tutti. Ogni aspetto della piattaforma è stato sviluppato seguendo principi di 
            accessibilità e usabilità, garantendo che nessun utente sia escluso dall'esperienza digitale.
          </p>
        </div>
      </section>

      {/* Sezione Contatti */}
      <section className="info__contacts scroll-reveal-item scroll-reveal-hidden">
        <h2 className="info__section-title">Contatti</h2>
        <div className="info__contacts-grid">
          <div className="info__contact-item">
            <div className="info__contact-icon">
              <EnvelopeClosedIcon />
            </div>
            <div className="info__contact-content">
              <h3 className="info__contact-title">Email</h3>
              <p className="info__contact-text">
                <a href="mailto:info.sgamapp@gmail.com" className="info__contact-link">
                  info.sgamapp@gmail.com
                </a>
              </p>
            </div>
          </div>
          <div className="info__contact-item">
            <div className="info__contact-icon">
              <HomeIcon />
            </div>
            <div className="info__contact-content">
              <h3 className="info__contact-title">Indirizzo</h3>
              <p className="info__contact-text">
                Piazza Aldo Moro, 37<br />
                70121 Bari (BA)
              </p>
            </div>
          </div>
          <div className="info__contact-item">
            <div className="info__contact-icon">
              <GlobeIcon />
            </div>
            <div className="info__contact-content">
              <h3 className="info__contact-title">Sito Web</h3>
              <p className="info__contact-text">
                <a href="https://sgamapp.vercel.app" target="_blank" rel="noopener noreferrer" className="info__contact-link">
                  sgamapp.vercel.app
                </a>
              </p>
            </div>
          </div>
          <div className="info__contact-item">
            <div className="info__contact-icon">
              <MobileIcon />
            </div>
            <div className="info__contact-content">
              <h3 className="info__contact-title">Telefono</h3>
              <p className="info__contact-text">
                <a href="tel:+390804169704" className="info__contact-link">
                  +39 080 416 9704
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sezione Metodologia */}
      <section className="info__methodology scroll-reveal-item scroll-reveal-hidden">
        <div className="info__methodology-tabs">
          <h2 className="info__methodology-title">La Nostra Metodologia</h2>
          <div className="info__methodology-wrapper">
            <div className="info__methodology-header">
              <button
                type="button"
                className={`info__methodology-tab ${activeMethodologyTab === 'educazione' ? 'active' : ''}`}
                onClick={() => setActiveMethodologyTab('educazione')}
              >
                Educazione
              </button>
              <button
                type="button"
                className={`info__methodology-tab ${activeMethodologyTab === 'pratica' ? 'active' : ''}`}
                onClick={() => setActiveMethodologyTab('pratica')}
              >
                Pratica
              </button>
              <button
                type="button"
                className={`info__methodology-tab ${activeMethodologyTab === 'accessibilita' ? 'active' : ''}`}
                onClick={() => setActiveMethodologyTab('accessibilita')}
              >
                Accessibilità
              </button>
              <button
                type="button"
                className={`info__methodology-tab ${activeMethodologyTab === 'supporto' ? 'active' : ''}`}
                onClick={() => setActiveMethodologyTab('supporto')}
              >
                Supporto
              </button>
            </div>
            <div className="info__methodology-content">
              {activeMethodologyTab === 'educazione' && (
                <div className="info__methodology-panel active">
                  <h3>Educazione Progressiva</h3>
                  <p>
                    Introduciamo i concetti di sicurezza digitale gradualmente, partendo dalle basi e avanzando passo dopo passo. 
                    Ogni concetto è spiegato in modo semplice e chiaro, senza assumere conoscenze pregresse.
                  </p>
                  <ul className="info__methodology-features">
                    <li>Apprendimento graduale e strutturato</li>
                    <li>Linguaggio semplice e accessibile</li>
                    <li>Esempi concreti e pratici</li>
                    <li>Verifica continua della comprensione</li>
                  </ul>
                </div>
              )}
              {activeMethodologyTab === 'pratica' && (
                <div className="info__methodology-panel active">
                  <h3>Pratica Guidata</h3>
                  <p>
                    Esercizi concreti per riconoscere phishing, link sospetti e truffe telefoniche, con esempi reali e simulazioni interattive. 
                    La pratica è essenziale per consolidare le conoscenze.
                  </p>
                  <ul className="info__methodology-features">
                    <li>Esercizi interattivi e pratici</li>
                    <li>Simulazioni di scenari reali</li>
                    <li>Feedback immediato e costruttivo</li>
                    <li>Esempi tratti da casi reali</li>
                  </ul>
                </div>
              )}
              {activeMethodologyTab === 'accessibilita' && (
                <div className="info__methodology-panel active">
                  <h3>Accessibilità Totale</h3>
                  <p>
                    Testi leggibili, contrasti elevati, compatibilità con lettori di schermo e navigazione da tastiera. 
                    Rispettiamo gli standard WCAG 2.1 per garantire che tutti possano utilizzare la piattaforma.
                  </p>
                  <ul className="info__methodology-features">
                    <li>Standard WCAG 2.1 rispettati</li>
                    <li>Navigazione da tastiera completa</li>
                    <li>Compatibilità con lettori di schermo</li>
                    <li>Contrasti elevati e font leggibili</li>
                  </ul>
                </div>
              )}
              {activeMethodologyTab === 'supporto' && (
                <div className="info__methodology-panel active">
                  <h3>Supporto Continuo</h3>
                  <p>
                    Assistente digitale sempre disponibile e aggiornato con le ultime minacce digitali, pronto a rispondere alle tue domande 24/7. 
                    Ogni utente può segnalare difficoltà o suggerire miglioramenti.
                  </p>
                  <ul className="info__methodology-features">
                    <li>Assistenza disponibile 24/7</li>
                    <li>Aggiornamenti costanti sulle minacce</li>
                    <li>Feedback e miglioramento continuo</li>
                    <li>Supporto multilingua</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default memo(Info);
