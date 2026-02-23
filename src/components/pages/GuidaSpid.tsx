import React from 'react';
import GuidaTemplate from '../shared/GuidaTemplate';
import spidImage from '../../assets/SGAMY_SPID.webp';

const GuidaSpid: React.FC = () => {
  const steps = [
    { 
      title: "Scegli un Provider", 
      description: "Seleziona uno dei provider accreditati dall'Agenzia per l'Italia Digitale (AgID). Puoi consultare la lista completa sul sito ufficiale.",
      link: "https://www.agid.gov.it/it/piattaforme/spid",
      list: [
        "Accedi al sito istituzionale SPID",
        "Consulta la lista dei provider disponibili",
        "Scegli quello più adatto alle tue esigenze"
      ]
    },
    { 
      title: "Registrazione Online", 
      description: "Completa la registrazione sul sito del provider scelto. Ti serviranno alcuni documenti e dati personali.",
      list: [
        "Compila il modulo di registrazione",
        "Inserisci i tuoi dati anagrafici",
        "Carica i documenti richiesti (carta d'identità, codice fiscale)"
      ]
    },
    { 
      title: "Verifica Identità", 
      description: "Completa la verifica della tua identità scegliendo tra diverse modalità.",
      list: [
        "Videochiamata con operatore",
        "Recarsi in un ufficio pubblico",
        "Identificazione tramite CIE"
      ]
    },
    { 
      title: "Ricevi le Credenziali", 
      description: "Dopo la verifica, riceverai le tue credenziali SPID via email o SMS",
      list: [
        "Ricevi username e password temporanea",
        "Cambia la password al primo accesso",
        "Salva le credenziali in modo sicuro"
      ]
    },
    { 
      title: "Primo Accesso", 
      description: "Accedi per la prima volta ai servizi pubblici usando le tue credenziali SPID.",
      list: [
        "Vai sul sito del servizio pubblico",
        "Seleziona \"Accedi con SPID\"",
        "Inserisci le tue credenziali"
      ]
    },
  ];

  const info = {
    difficulty: "Facile",
    duration: "15 minuti",
    stepsCount: steps.length,
  };

  const prerequisites = {
    title: "Prima di iniziare",
    documents: [
      "Carta d'identità valida (CIE, patente o passaporto)",
      "Codice fiscale",
      "Indirizzo email",
      "Numero di telefono cellulare"
    ]
  };

  const sidebarContent = [
    {
      title: "Link Utili",
      links: [
        { text: "Sito ufficiale SPID", url: "https://www.spid.gov.it", external: true },
        { text: "Lista Provider AgID", url: "https://www.agid.gov.it/it/piattaforme/spid", external: true },
        { text: "Trova ufficio postale", url: "https://www.poste.it/cerca-mappe-app/?vieni-in-poste", external: true }
      ]
    },
    {
      title: "Informazioni",
      links: [
        { text: "Contatta il supporto", url: "/info", external: false }
      ],
      content: (
        <p>Hai bisogno di aiuto? Contatta il supporto per assistenza.</p>
      )
    }
  ];

  return (
    <GuidaTemplate
      title="Come creare un SPID"
      subtitle="Guida completa per ottenere la tua identità digitale SPID"
      image={spidImage}
      steps={steps}
      info={info}
      prerequisites={prerequisites}
      sidebarContent={sidebarContent}
      nextLink="/guide/pec"
      nextTitle="Prossima guida: PEC"
      // Rimuoviamo prevLink e prevTitle se non esistono
    />
  );
};

export default GuidaSpid;
