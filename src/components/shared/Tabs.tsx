import React, { useState, useCallback, memo, useMemo } from 'react';
import { sanitizeHTML } from '../../utils/sanitize';
import './Tabs.css';

/**
 * Tipo per una tab
 */
interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

/**
 * Props per il componente Collapsible
 */
interface CollapsibleProps {
  title: string;
  content: string | React.ReactNode;
}

/**
 * Componente collassabile per FAQ nelle tab (ottimizzato)
 */
const Collapsible: React.FC<CollapsibleProps> = memo(({ title, content }) => {
  const [open, setOpen] = useState(false);
  const id = useMemo(() => title.replace(/\s+/g, '-').toLowerCase(), [title]);
  
  const handleToggle = useCallback(() => {
    setOpen(prev => !prev);
  }, []);
  
  return (
    <article className="tabs-faq-collapsible">
      <button 
        type="button" 
        className="tabs-faq-collapsible__header" 
        onClick={handleToggle} 
        aria-expanded={open}
        aria-controls={`collapsible-content-${id}`}
        id={`collapsible-header-${id}`}
      >
        <span>{title}</span>
        <span className={`tabs-faq-collapsible__icon ${open ? 'open' : ''}`}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div 
          className="tabs-faq-collapsible__content" 
          role="region"
          id={`collapsible-content-${id}`}
          aria-labelledby={`collapsible-header-${id}`}
          {...(typeof content === 'string' 
            ? { dangerouslySetInnerHTML: { __html: sanitizeHTML(content) } }
            : { children: content }
          )}
        />
      )}
    </article>
  );
});

Collapsible.displayName = 'Collapsible';

/**
 * Componente Tabs principale (ottimizzato)
 * Mostra diverse sezioni informative in formato tab
 */
const Tabs: React.FC = memo(() => {
  const [activeTab, setActiveTab] = useState<string>('tab1');
  
  const handleTabClick = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  /**
   * Lista delle FAQ (memoizzata - contenuto statico)
   */
  const faqs = useMemo(() => [
    {
      title: 'Come posso proteggermi dalle truffe online?',
      content: 'Puoi proteggerti seguendo alcune semplici regole: verifica sempre l\'autenticità dei siti web, non fornire mai password o dati sensibili via email o telefono, usa password forti e diverse per ogni account, mantieni aggiornati i tuoi dispositivi e software, e verifica sempre i link prima di cliccarci. Il nostro assistente Sgamy può aiutarti a valutare i rischi in tempo reale.'
    },
    {
      title: 'Il servizio è gratuito?',
      content: 'Sì, <strong>SgamApp</strong> è completamente gratuito. Tutti i servizi, incluse le guide, l\'assistente digitale educativo e gli strumenti di protezione, sono disponibili senza costi. Il nostro obiettivo è rendere la sicurezza digitale accessibile a tutti.'
    },
    {
      title: 'Come funziona l\'assistente Sgamy?',
      content: 'Sgamy è il nostro assistente virtuale disponibile 24/7. Puoi chiedergli qualsiasi domanda sulla sicurezza digitale, sulle truffe online, sul phishing e molto altro. Basta cliccare sul pulsante "Parla con Sgamy" presente nella home page e iniziare una conversazione. Sgamy è progettato per essere chiaro, paziente e sempre aggiornato sulle ultime minacce digitali.'
    },
    {
      title: 'Le guide sono adatte anche per chi non è esperto?',
      content: 'Assolutamente sì! Le nostre guide sono pensate proprio per chi non ha molta esperienza con il digitale. Ogni procedura è spiegata passo-passo con linguaggio semplice, esempi concreti e screenshot intuitivi. Inoltre, il nostro design è pensato per essere accessibile a tutti, con font grandi e interfaccia chiara.'
    }
  ], []);

  /**
   * Lista delle tab disponibili (memoizzata - contenuto statico)
   */
  const tabs: Tab[] = useMemo(() => [
    {
      id: 'tab1',
      label: 'Sicurezza',
      content: (
        <div className="tabs-panel-content">
          <h3>Proteggi i tuoi dati</h3>
          <p>
            La sicurezza dei tuoi dati personali è fondamentale. Impara a riconoscere le minacce online,
            a creare password sicure e a proteggere le tue informazioni sensibili. Usa sempre connessioni
            sicure e verifica l'autenticità dei siti prima di inserire dati personali.
          </p>
          <ul className="tabs-feature-list">
            <li>Usa password uniche e complesse per ogni account</li>
            <li>Attiva l'autenticazione a due fattori quando possibile</li>
            <li>Mantieni aggiornati software e sistema operativo</li>
            <li>Verifica sempre i certificati SSL dei siti web</li>
          </ul>
        </div>
      )
    },
    {
      id: 'tab2',
      label: 'Guide',
      content: (
        <div className="tabs-panel-content">
          <h3>Le nostre guide pratiche</h3>
          <p>
            Esplora le nostre guide passo-passo per utilizzare strumenti digitali in sicurezza.
            Ogni guida è pensata per essere chiara e accessibile, anche per chi non ha molta esperienza.
          </p>
          <ul className="tabs-feature-list">
            <li>Guide su SPID, CIE, PEC e servizi digitali</li>
            <li>Istruzioni chiare con screenshot e esempi</li>
            <li>Supporto per ogni livello di esperienza</li>
            <li>Aggiornamenti costanti con le ultime novità</li>
          </ul>
        </div>
      )
    },
    {
      id: 'tab3',
      label: 'Supporto',
      content: (
        <div className="tabs-panel-content">
          <h3>Ricevi aiuto quando ne hai bisogno</h3>
          <p>
            Non sei solo! Il nostro assistente Sgamy è sempre disponibile a verificare e controllare se sei vittima di truffa/frode
            e aiutarti a navigare in sicurezza online. Puoi contattarci anche per segnalare problemi
            o per suggerimenti.
          </p>
          <ul className="tabs-feature-list">
            <li>Assistente disponibile 24/7 per la tua sicurezza</li>
            <li>Risposte immediate e chiare</li>
            <li>Supporto multilingua</li>
            <li>Contatti per assistenza personalizzata</li>
          </ul>
        </div>
      )
    },
    {
      id: 'tab4',
      label: 'FAQ',
      content: (
        <div className="tabs-panel-content">
          <h3>Domande Frequenti</h3>
          <p className="tabs-faq-intro">
            Qui trovi le risposte alle domande più comuni su <strong>SgamApp</strong>, i nostri servizi e la sicurezza digitale.
          </p>
          <div className="tabs-faq-list">
            {faqs.map((faq, index) => (
              <Collapsible key={index} title={faq.title} content={faq.content} />
            ))}
          </div>
        </div>
      )
    }
  ], [faqs]);

  return (
    <section className="tabs-section">
      <div className="tabs-container">
        <h2 className="tabs-title">Scopri di più</h2>
        <div className="tabs-wrapper">
          <div className="tabs-header" role="tablist" aria-label="Sezioni informative">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                id={`tab-${tab.id}`}
                className={`tabs-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabClick(tab.id)}
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                role="tab"
                tabIndex={activeTab === tab.id ? 0 : -1}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="tabs-content">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`tabs-panel ${activeTab === tab.id ? 'active' : ''}`}
                role="tabpanel"
                id={`tabpanel-${tab.id}`}
                aria-labelledby={`tab-${tab.id}`}
              >
                {tab.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

Tabs.displayName = 'Tabs';

export default Tabs;
