import React from 'react';
import GuidaTemplate from '../shared/GuidaTemplate';
import pecImage from '../../assets/SGAMY_PEC.webp';

const GuidaPec: React.FC = () => {
  const steps = [
    { 
      title: "Scegli un provider PEC", 
      description: "Seleziona un provider certificato per la PEC. I principali sono: Aruba, Register.it, Poste Italiane, Infocert, Namirial, Sielte." 
    },
    { 
      title: "Registrati sul sito del provider", 
      description: "Crea un account sul sito del provider scelto inserendo i tuoi dati personali e aziendali." 
    },
    { 
      title: "Verifica la tua identità", 
      description: "Completa la verifica dell'identità tramite documento d'identità valido e codice fiscale." 
    },
    { 
      title: "Attiva il servizio PEC", 
      description: "Procedi con l'attivazione del servizio PEC seguendo le istruzioni del provider." 
    },
    { 
      title: "Configura il client email", 
      description: "Imposta il tuo client email (Outlook, Thunderbird, ecc.) con i parametri forniti dal provider:",
      list: [
        "Server in entrata: imap.pec.it",
        "Server in uscita: smtp.pec.it",
        "Porta IMAP: 993 (SSL)",
        "Porta SMTP: 465 (SSL)"
      ]
    },
    { 
      title: "Testa l'invio di una PEC", 
      description: "Invia una PEC di test a te stesso per verificare che tutto funzioni correttamente." 
    },
    { 
      title: "Configura le firme digitali", 
      description: "Se necessario, configura la firma digitale per le tue PEC utilizzando un certificato valido." 
    },
    { 
      title: "Imposta le notifiche", 
      description: "Configura le notifiche per ricevere avvisi quando ricevi PEC importanti." 
    },
    { 
      title: "Organizza le cartelle", 
      description: "Crea un sistema di cartelle per organizzare le tue PEC ricevute e inviate." 
    },
    { 
      title: "Configura i filtri", 
      description: "Imposta filtri automatici per categorizzare le PEC in base al mittente o all'argomento." 
    },
    { 
      title: "Backup delle PEC", 
      description: "Configura un sistema di backup per conservare le tue PEC in modo sicuro." 
    },
    { 
      title: "Aggiorna i tuoi contatti", 
      description: "Comunica la tua nuova PEC a tutti i tuoi contatti professionali e istituzionali." 
    },
  ];

  const info = {
    difficulty: "Medio",
    duration: "30 minuti",
    stepsCount: steps.length,
  };

  const prerequisites = {
    title: "Prima di iniziare",
    documents: [
      "Carta d'identità valida (CIE, patente o passaporto)",
      "Codice fiscale",
      "Indirizzo email",
      "Numero di telefono cellulare",
      "Dati aziendali (se richiesto dal provider)"
    ]
  };

  const sidebarContent = [
    {
      title: "Link Utili",
      links: [
        { text: "Sito ufficiale PEC", url: "https://www.pec.it", external: true },
        { text: "Lista provider certificati", url: "https://www.agid.gov.it/it/piattaforme/pec", external: true },
        { text: "Poste Italiane PEC", url: "https://www.poste.it/pec", external: true }
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
      title="Configurazione PEC"
      subtitle="Impara a configurare correttamente la tua Posta Elettronica Certificata"
      image={pecImage}
      steps={steps}
      info={info}
      prerequisites={prerequisites}
      sidebarContent={sidebarContent}
      previousLink="/guide/spid"
      previousTitle="Guida precedente: SPID"
      nextLink="/guide/cie"
      nextTitle="Prossima guida: CIE"
    />
  );
};

export default GuidaPec;
