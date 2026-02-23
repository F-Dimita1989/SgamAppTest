import React from "react";
import GuidaTemplate from "../shared/GuidaTemplate";
import primoAccessoImg from "../../assets/SGAMY_PASSWORD_VARIANT.webp";

const GuidaPrimoAccesso: React.FC = () => {
  const steps = [
    { 
      title: "Registrazione iniziale", 
      description: "Crea il tuo account sui portali dei servizi.",
      list: [
        "Vai sul sito del servizio che vuoi utilizzare",
        "Clicca su 'Registrati' o 'Crea account'",
        "Inserisci i tuoi dati personali richiesti",
        "Scegli username e password sicura"
      ]
    },
    { 
      title: "Verifica email", 
      description: "Controlla la tua casella di posta e conferma l'email.",
      list: [
        "Apri la tua casella email",
        "Cerca l'email di conferma dal servizio",
        "Clicca sul link di verifica nell'email",
        "Attendi la conferma della verifica"
      ]
    },
    { 
      title: "Accesso al portale", 
      description: "Effettua il login e completa il profilo.",
      list: [
        "Torna al sito del servizio",
        "Inserisci username e password",
        "Completa il profilo con i dati mancanti",
        "Salva le informazioni importanti"
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
      "Indirizzo email valido",
      "SPID o CIE (per alcuni servizi)",
      "Documenti di identità (se richiesti)"
    ]
  };

  const sidebarContent = [
    {
      title: "Link Utili",
      links: [
        { text: "Portale servizi digitali", url: "https://www.italia.it", external: true },
        { text: "SPID", url: "/guide/spid", external: false },
        { text: "CIE", url: "/guide/cie", external: false }
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
      title="Primo Accesso ai Servizi"
      subtitle="Guida passo passo per accedere per la prima volta ai servizi digitali"
      image={primoAccessoImg}
      steps={steps}
      info={info}
      prerequisites={prerequisites}
      sidebarContent={sidebarContent}
      previousLink="/guide/sicurezza"
      previousTitle="Guida precedente: Sicurezza"
      nextLink="/guide/recupero-password"
      nextTitle="Prossima guida: Recupero Password"
    />
  );
};

export default GuidaPrimoAccesso;
