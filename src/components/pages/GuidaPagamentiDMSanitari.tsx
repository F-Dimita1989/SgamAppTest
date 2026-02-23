import React from "react";
import GuidaTemplate from "../shared/GuidaTemplate";
import pagamentiDMSanitariImg from "../../assets/SGAMY_PAGAMENTO.webp";

const GuidaPagamentiDMSanitari: React.FC = () => {
  const steps = [
    { 
      title: "Accedi al portale", 
      description: "Effettua il login con SPID o CIE.",
      list: [
        "Vai sul portale dei servizi sanitari",
        "Clicca su 'Accedi' o 'Login'",
        "Scegli SPID o CIE come metodo di autenticazione",
        "Completa il processo di autenticazione"
      ]
    },
    { 
      title: "Seleziona il pagamento", 
      description: "Scegli la pratica o il servizio da pagare.",
      list: [
        "Naviga nella sezione 'Pagamenti' o 'Fatture'",
        "Cerca la pratica o il servizio da pagare",
        "Verifica l'importo e i dettagli",
        "Seleziona il pagamento da effettuare"
      ]
    },
    { 
      title: "Completa transazione", 
      description: "Effettua il pagamento tramite PagoPA o carta di credito.",
      list: [
        "Scegli il metodo di pagamento (PagoPA, carta di credito, ecc.)",
        "Inserisci i dati richiesti",
        "Verifica tutti i dettagli della transazione",
        "Conferma il pagamento",
        "Salva o stampa la ricevuta"
      ]
    },
  ];

  const info = {
    difficulty: "Media",
    duration: "10 minuti",
    stepsCount: steps.length,
  };

  const prerequisites = {
    title: "Prima di iniziare",
    documents: [
      "SPID o CIE attivi",
      "Carta di credito o metodo di pagamento valido",
      "Codice pratica o fattura da pagare"
    ]
  };

  const sidebarContent = [
    {
      title: "Link Utili",
      links: [
        { text: "PagoPA", url: "https://www.pagopa.gov.it", external: true },
        { text: "Guida SPID", url: "/guide/spid", external: false },
        { text: "Guida CIE", url: "/guide/cie", external: false }
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
      title="Pagamenti DM Sanitari"
      subtitle="Guida per effettuare pagamenti digitali dei DM Sanitari"
      image={pagamentiDMSanitariImg}
      steps={steps}
      info={info}
      prerequisites={prerequisites}
      sidebarContent={sidebarContent}
      previousLink="/guide/certificati-online"
      previousTitle="Certificati Online"
      nextLink="/guide/anagrafe-digitale"
      nextTitle="Anagrafe Digitale"
    />
  );
};

export default GuidaPagamentiDMSanitari;
