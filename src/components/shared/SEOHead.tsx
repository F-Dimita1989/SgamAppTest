import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente per gestire meta tags SEO dinamici
 * Include: Open Graph, Twitter Cards, Canonical URLs, Structured Data
 */
function SEOHead() {
  const { pathname } = useLocation();
  /**
   * Costanti per SEO
   */
  const baseUrl = 'https://sgamapp.vercel.app';
  const siteName = 'SgamApp';
  const defaultDescription = 'SgamApp: la tua soluzione completa per la sicurezza digitale. Guide pratiche, assistente digitale educativo Sgamy e strumenti per proteggerti dalle truffe online. Accessibile e facile da usare per tutti.';
  const defaultImage = `${baseUrl}/icon-512x512.png`;

  /**
   * Mappa delle route con metadata specifici per SEO
   */
  const routeMetadata: Record<string, {
    title: string;
    description: string;
    keywords?: string[];
    image?: string;
    type?: 'website' | 'article';
  }> = {
    '/': {
      title: 'Home - SgamApp',
      description: defaultDescription,
      keywords: ['home', 'principale', 'inizio', 'sgam', 'servizi', 'digitali'],
      type: 'website'
    },
    '/servizio-antifrode': {
      title: 'Protezione Anti-Frode - SgamApp',
      description: 'Proteggi te stesso e i tuoi cari dalle truffe online. Servizio gratuito di analisi link sospetti e messaggi di phishing. Valutazione immediata del rischio.',
      keywords: ['antifrode', 'frode', 'truffa', 'sicurezza', 'protezione', 'segnalazione', 'truffe online'],
      type: 'website'
    },
    '/guide': {
      title: 'Guide - SgamApp',
      description: 'Guide pratiche e semplici per navigare in sicurezza nel mondo digitale. Impara a proteggere i tuoi dati e riconoscere le truffe online.',
      keywords: ['guide', 'tutorial', 'aiuto', 'istruzioni', 'come fare'],
      type: 'website'
    },
    '/glossario': {
      title: 'Glossario Antifrode - SgamApp',
      description: 'Dizionario completo dei termini legati alla sicurezza digitale e alle truffe online. Definizioni semplici e chiare per tutti.',
      keywords: ['glossario', 'termini', 'definizioni', 'dizionario', 'significato', 'parole'],
      type: 'website'
    },
    '/traduttore-generazionale': {
      title: 'Traduttore Generazionale - SgamApp',
      description: 'Traduci il linguaggio dei giovani in termini comprensibili. Uno strumento per avvicinare le generazioni attraverso la comprensione del linguaggio.',
      keywords: ['traduttore', 'generazionale', 'slang', 'linguaggio', 'giovani', 'boomer', 'traduzione'],
      type: 'website'
    },
    '/info': {
      title: 'Info e Contatti - SgamApp',
      description: 'Scopri chi siamo, la nostra missione e come contattarci. SgamApp rende la sicurezza digitale accessibile a tutti.',
      keywords: ['info', 'informazioni', 'contatti', 'chi siamo', 'about'],
      type: 'website'
    },
    '/privacy': {
      title: 'Privacy e Policy - SgamApp',
      description: 'Informativa sulla privacy e trattamento dei dati personali. SgamApp rispetta la tua privacy e protegge i tuoi dati secondo il GDPR.',
      keywords: ['privacy', 'policy', 'gdpr', 'dati personali', 'trattamento dati', 'cookie'],
      type: 'website'
    }
  };

  /**
   * Determina i metadata per la route corrente
   */
  const getMetadata = () => {
    let metadata = routeMetadata[pathname];

    // Se è una guida dinamica, genera metadata automaticamente
    if (!metadata && pathname.startsWith('/guide/')) {
      const guideName = pathname.split('/guide/')[1];
      if (guideName) {
        const formattedName = guideName
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        metadata = {
          title: `Guida ${formattedName} - SgamApp`,
          description: `Guida completa e semplice su ${formattedName}. Istruzioni passo-passo per navigare in sicurezza nel mondo digitale.`,
          keywords: [guideName, 'guida', 'tutorial', 'istruzioni'],
          type: 'article' as const
        };
      }
    }

    // Fallback ai default
    return metadata || {
      title: 'SgamApp - Sicurezza Digitale',
      description: defaultDescription,
      keywords: ['sgamapp', 'sicurezza digitale'],
      type: 'website' as const
    };
  };

  useEffect(() => {
    const metadata = getMetadata();
    const canonicalUrl = `${baseUrl}${pathname}`;
    const fullTitle = metadata.title;

    /**
     * Aggiorna o crea un meta tag nel documento
     */
    const updateMetaTag = (
      name: string,
      content: string,
      attribute: string = 'name'
    ): void => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Meta tags standard
    updateMetaTag('description', metadata.description);
    if (metadata.keywords) {
      updateMetaTag('keywords', metadata.keywords.join(', '));
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // Open Graph tags
    updateMetaTag('og:title', fullTitle, 'property');
    updateMetaTag('og:description', metadata.description, 'property');
    updateMetaTag('og:url', canonicalUrl, 'property');
    updateMetaTag('og:type', metadata.type || 'website', 'property');
    updateMetaTag('og:image', metadata.image || defaultImage, 'property');
    updateMetaTag('og:site_name', siteName, 'property');
    updateMetaTag('og:locale', 'it_IT', 'property');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', metadata.description);
    updateMetaTag('twitter:image', metadata.image || defaultImage);

    // Structured Data (JSON-LD) per migliorare il SEO
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': metadata.type === 'article' ? 'Article' : 'WebSite',
      name: siteName,
      url: baseUrl,
      description: metadata.description,
      ...(metadata.type === 'article' ? {
        headline: fullTitle,
        datePublished: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        author: {
          '@type': 'Organization',
          name: siteName
        },
        publisher: {
          '@type': 'Organization',
          name: siteName,
          logo: {
            '@type': 'ImageObject',
            url: defaultImage
          }
        }
      } : {
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/glossario?search={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      })
    };

    // Rimuovi structured data esistente e aggiungi quello nuovo
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }, [pathname]);

  return null;
}

export default SEOHead;

