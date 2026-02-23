import React from 'react';
import GuidaTemplate from '../shared/GuidaTemplate';
import cieImage from '../../assets/SGAMY_CIE.webp';

const GuidaCie: React.FC = () => {
  const steps = [
    { title: "Richiedi la CIE", description: "Recati presso il tuo Comune di residenza con i documenti necessari: documento d'identità scaduto, fototessera recente e codice fiscale." },
    { title: "Attendi la produzione", description: "La CIE viene prodotta in 6 giorni lavorativi. Riceverai un SMS quando sarà pronta per il ritiro." },
    { title: "Ritira la CIE", description: "Recati presso il Comune con un documento d'identità valido per ritirare la tua CIE. Ti verrà chiesto di inserire un PIN." },
    { title: "Scarica l'app CieID", description: "Installa l'app ufficiale 'CieID' dal tuo store preferito (App Store o Google Play)." },
    { title: "Attiva la CIE nell'app", description: "Apri l'app e segui la procedura di attivazione inserendo il PIN che hai scelto al momento del ritiro." },
    { title: "Configura l'autenticazione", description: "Imposta il metodo di autenticazione preferito: PIN, impronta digitale o riconoscimento facciale." },
    { title: "Testa l'accesso ai servizi", description: "Prova ad accedere a un servizio della Pubblica Amministrazione utilizzando la tua CIE per verificare che tutto funzioni." },
    { title: "Configura la firma digitale", description: "Se necessario, configura la firma digitale per utilizzare la CIE per firmare documenti elettronicamente." },
    { title: "Mantieni aggiornata l'app", description: "Assicurati di avere sempre l'ultima versione dell'app CIE per garantire la massima sicurezza." },
    { title: "Conserva la CIE fisica", description: "Mantieni sempre con te la CIE fisica come documento d'identità tradizionale, anche se hai l'app." },
  ];

  const info = {
    difficulty: "Facile",
    duration: "20 minuti",
    stepsCount: steps.length,
  };

  const prerequisites = {
    title: "Prima di iniziare",
    documents: [
      "Documento d'identità scaduto o in scadenza",
      "Fototessera recente (formato tessera)",
      "Codice fiscale",
      "Smartphone con sistema operativo iOS o Android"
    ]
  };

  const sidebarContent = [
    {
      title: "Link Utili",
      links: [
        { text: "Sito ufficiale CIE", url: "https://www.cartaidentita.interno.gov.it", external: true },
        { text: "App CieID", url: "https://www.cartaidentita.interno.gov.it/cie-app", external: true },
        { text: "Trova il tuo Comune", url: "https://www.comuni.it", external: true }
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
      title="Carta d'Identità Elettronica"
      subtitle="Tutto quello che devi sapere sulla CIE e come utilizzarla"
      image={cieImage}
      steps={steps}
      info={info}
      prerequisites={prerequisites}
      sidebarContent={sidebarContent}
      previousLink="/guide/pec"
      previousTitle="Guida precedente: PEC"
      nextLink="/guide/sicurezza"
      nextTitle="Prossima guida: Sicurezza"
    />
  );
};

export default GuidaCie;

