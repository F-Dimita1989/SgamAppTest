import React from "react";
import GuidaTemplate from "../shared/GuidaTemplate";
import anagrafeDigitaleImg from "../../assets/SGAMY_ANAGRAFE.webp";

const GuidaAnagrafeDigitale: React.FC = () => {
  const steps = [
    { 
      title: "Accedi al portale", 
      description: "Effettua il login con SPID o CIE.",
      list: [
        "Vai sul portale del tuo Comune",
        "Clicca su 'Accedi' o 'Login'",
        "Scegli SPID o CIE come metodo di autenticazione",
        "Completa il processo di autenticazione"
      ]
    },
    { 
      title: "Verifica i tuoi dati", 
      description: "Controlla i dati personali registrati.",
      list: [
        "Naviga nella sezione 'I miei dati' o 'Anagrafe'",
        "Verifica che tutti i dati siano corretti",
        "Segnala eventuali errori o aggiornamenti necessari",
        "Salva le modifiche se effettuate"
      ]
    },
    { 
      title: "Usa i servizi online", 
      description: "Richiedi certificati, consultazioni e aggiornamenti online.",
      list: [
        "Scegli il servizio che ti serve (certificati, residenza, ecc.)",
        "Compila il modulo richiesto",
        "Verifica i dati inseriti",
        "Invia la richiesta",
        "Scarica o ricevi il documento richiesto"
      ]
    },
  ];

  const info = {
    difficulty: "Facile",
    duration: "10 minuti",
    stepsCount: steps.length,
  };

  const prerequisites = {
    title: "Prima di iniziare",
    documents: [
      "SPID o CIE attivi",
      "Accesso al portale del Comune",
      "Dati anagrafici corretti e aggiornati"
    ]
  };

  const sidebarContent = [
    {
      title: "Link Utili",
      links: [
        { text: "Guida SPID", url: "/guide/spid", external: false },
        { text: "Guida CIE", url: "/guide/cie", external: false },
        { text: "Portale servizi digitali", url: "https://www.italia.it", external: true }
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
      title="Anagrafe Digitale"
      subtitle="Accesso e utilizzo dei servizi di anagrafe digitale"
      image={anagrafeDigitaleImg}
      steps={steps}
      info={info}
      prerequisites={prerequisites}
      sidebarContent={sidebarContent}
      previousLink="/guide/pagamenti-dm-sanitari"
      previousTitle="Guida precedente: Pagamenti DM Sanitari"
      nextLink="/guide/prenotazioni-asl-puglia"
      nextTitle="Prossima guida: Prenotazioni ASL Puglia"
    />
  );
};

export default GuidaAnagrafeDigitale;
