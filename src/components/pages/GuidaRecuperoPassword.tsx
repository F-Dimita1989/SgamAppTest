import React from "react";
import GuidaTemplate from "../shared/GuidaTemplate";
import recuperoPasswordImg from "../../assets/SGAMY_PASSWORD.webp";

const GuidaRecuperoPassword: React.FC = () => {
  const steps = [
    { 
      title: "Vai alla pagina login", 
      description: "Clicca su 'Password dimenticata'.",
      list: [
        "Apri il sito del servizio",
        "Vai alla pagina di login",
        "Clicca sul link 'Password dimenticata' o 'Recupera password'"
      ]
    },
    { 
      title: "Inserisci email", 
      description: "Scrivi l'email associata al tuo account.",
      list: [
        "Inserisci l'indirizzo email registrato",
        "Verifica che l'email sia corretta",
        "Clicca su 'Invia' o 'Recupera'"
      ]
    },
    { 
      title: "Segui istruzioni", 
      description: "Riceverai un link via email per reimpostare la password.",
      list: [
        "Controlla la tua casella email",
        "Apri l'email di recupero password",
        "Clicca sul link di reimpostazione",
        "Crea una nuova password sicura",
        "Conferma la nuova password"
      ]
    },
  ];

  const info = {
    difficulty: "Facile",
    duration: "5 minuti",
    stepsCount: steps.length,
  };

  const prerequisites = {
    title: "Prima di iniziare",
    documents: [
      "Accesso alla casella email associata all'account",
      "Connessione internet stabile"
    ]
  };

  const sidebarContent = [
    {
      title: "Link Utili",
      links: [
        { text: "Guida Primo Accesso", url: "/guide/primo-accesso", external: false },
        { text: "Guida Sicurezza", url: "/guide/sicurezza", external: false },
        { text: "Contatta il supporto", url: "/info", external: false }
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
      title="Recupero Password"
      subtitle="Procedura guidata per recuperare la password dimenticata"
      image={recuperoPasswordImg}
      steps={steps}
      info={info}
      prerequisites={prerequisites}
      sidebarContent={sidebarContent}
      previousLink="/guide/primo-accesso"
      previousTitle="Primo Accesso ai Servizi"
      nextLink="/guide/certificati-online"
      nextTitle="Certificati Online"
    />
  );
};

export default GuidaRecuperoPassword;
