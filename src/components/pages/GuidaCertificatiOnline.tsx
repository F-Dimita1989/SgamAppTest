import React from "react";
import GuidaTemplate from "../shared/GuidaTemplate";
import certificatiOnlineImg from '../../assets/SGAMY_CERTFICATI.webp';

const GuidaCertificatiOnline: React.FC = () => {
  const steps = [
    { 
      title: "Accedi al portale", 
      description: "Effettua il login con SPID o CIE.",
      list: [
        "Vai sul portale del tuo Comune o servizio",
        "Clicca su 'Accedi' o 'Login'",
        "Scegli SPID o CIE come metodo di autenticazione",
        "Completa il processo di autenticazione"
      ]
    },
    { 
      title: "Seleziona il certificato", 
      description: "Scegli tra certificati disponibili online.",
      list: [
        "Naviga nella sezione 'Certificati' o 'Documenti'",
        "Scegli il tipo di certificato che ti serve",
        "Verifica i dati personali mostrati",
        "Seleziona il periodo di validità richiesto"
      ]
    },
    { 
      title: "Scarica il documento", 
      description: "Salva il certificato in PDF sul tuo dispositivo.",
      list: [
        "Clicca su 'Scarica' o 'Genera certificato'",
        "Attendi la generazione del documento",
        "Salva il file PDF sul tuo dispositivo",
        "Stampa il certificato se necessario"
      ]
    },
  ];

  const info = {
    difficulty: "Media",
    duration: "15 minuti",
    stepsCount: steps.length,
  };

  const prerequisites = {
    title: "Prima di iniziare",
    documents: [
      "SPID o CIE attivi",
      "Accesso al portale del Comune o servizio",
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
      title="Certificati Online"
      subtitle="Come richiedere e scaricare i certificati online"
      image={certificatiOnlineImg}
      steps={steps}
      info={info}
      prerequisites={prerequisites}
      sidebarContent={sidebarContent}
      previousLink="/guide/recupero-password"
      previousTitle="Recupero Password"
      nextLink="/guide/pagamenti-dm-sanitari"
      nextTitle="Pagamenti DM Sanitari"
    />
  );
};

export default GuidaCertificatiOnline;
