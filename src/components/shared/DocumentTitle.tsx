import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente che aggiorna il titolo del documento in base alla route corrente.
 * Questo è importante per gli screen reader e per la navigazione generale,
 * poiché il titolo della pagina è la prima cosa che viene annunciata quando si carica una nuova pagina.
 */
function DocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    /**
     * Mappa delle route ai loro titoli per il documento
     */
    const routeTitles: Record<string, string> = {
      '/': 'Home - SgamApp',
      '/servizio-antifrode': 'Protezione Anti-Frode - SgamApp',
      '/guide': 'Guide - SgamApp',
      '/guide/spid': 'Guida SPID - SgamApp',
      '/guide/pec': 'Guida PEC - SgamApp',
      '/guide/cie': 'Guida CIE - SgamApp',
      '/guide/sicurezza': 'Guida Sicurezza Digitale - SgamApp',
      '/guide/primo-accesso': 'Guida Primo Accesso - SgamApp',
      '/guide/recupero-password': 'Guida Recupero Password - SgamApp',
      '/guide/certificati-online': 'Guida Certificati Online - SgamApp',
      '/guide/pagamenti-dm-sanitari': 'Guida Pagamenti DM Sanitari - SgamApp',
      '/guide/anagrafe-digitale': 'Guida Anagrafe Digitale - SgamApp',
      '/guide/prenotazioni-asl-puglia': 'Guida Prenotazioni ASL Puglia - SgamApp',
      '/guide/asl': 'Guida Prenotazioni ASL Puglia - SgamApp',
      '/glossario': 'Glossario Antifrode - SgamApp',
      '/traduttore-generazionale': 'Traduttore Generazionale - SgamApp',
      '/info': 'Info e Contatti - SgamApp',
      '/privacy': 'Privacy e Policy - SgamApp',
      '/sgam-admin-login': 'Login Amministratore - SgamApp',
      '/admin-dashboard': 'Dashboard Amministratore - SgamApp',
      '/admin-dashboard/glossario': 'Gestione Glossario - SgamApp',
      '/admin-dashboard/traduttore': 'Gestione Traduttore - SgamApp',
    };

    /**
     * Determina il titolo in base alla route corrente
     */
    let title = routeTitles[pathname];

    if (!title) {
      if (pathname.startsWith('/guide/')) {
        // Estrai e formatta il nome della guida dalla route
        const guideName = pathname.split('/guide/')[1];
        if (guideName) {
          const formattedName = guideName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          title = `Guida ${formattedName} - SgamApp`;
        } else {
          title = 'Guide - SgamApp';
        }
      } else {
        // Route non trovata (404)
        title = 'Pagina Non Trovata - SgamApp';
      }
    }

    document.title = title;

    // Cleanup: ripristina il titolo di default quando il componente si smonta
    return () => {
      document.title = 'SgamApp';
    };
  }, [pathname]);

  // Questo componente non renderizza nulla
  return null;
}

export default DocumentTitle;

