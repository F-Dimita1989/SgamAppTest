import React from 'react';
import GuidaTemplate from '../shared/GuidaTemplate';
import prenotazioniImage from '../../assets/SGAMY_DOTTORE.webp';
/* NOTA: GuidaTemplate.css gestisce già tutti gli stili necessari */

const GuidaPrenotazioniASL: React.FC = () => {
  const steps = [
    { 
      title: "Prepara i documenti necessari", 
      description: "Assicurati di avere sempre a disposizione gli eventuali esami propedeutici alla prestazione ambulatoriale richiesta. Per le prescrizioni con codice di priorità U (urgenza), puoi prenotare in diversi modi.",
      list: [
        "Presso gli sportelli CUP ASL Bari",
        "Telefonando al Numero Verde 800 345477 (lun-ven 8:00-18:30, sab 8:00-13:00)",
        "Tramite i servizi online del sito della ASL",
        "Con la App Puglia Salute",
        "Via e-mail all'indirizzo servizio.cup@asl.bari.it (inviare codice fiscale e NRE)",
        "Presso le farmacie abilitate (costo 2 euro)"
      ]
    },
    { 
      title: "Prenotazioni con priorità B, D, P", 
      description: "Per prescrizioni con codice priorità breve (B), differibile (D) o programmata (P), le modalità di prenotazione sono simili a quelle per urgenza.",
      list: [
        "Presso gli sportelli CUP ASL Bari",
        "Telefonando al Numero Verde 800 345477",
        "Tramite i servizi online del sito della ASL",
        "Con la App Puglia Salute",
        "Presso le farmacie abilitate (costo 2 euro)"
      ]
    },
    { 
      title: "Accedi al portale online", 
      description: "Vai sul sito della ASL Puglia per la prenotazione online. Il link è: https://www.sanita.puglia.it/web/guest/fse-servizio-gestione-prenotazioni-accesso-libero",
      list: [
        "Apri il browser e vai al sito della ASL Puglia",
        "Cerca la sezione 'FSE - Servizio Gestione Prenotazioni'",
        "Seleziona 'Accesso Libero' per iniziare"
      ]
    },
    { 
      title: "Inserisci Codice Fiscale e Tessera Sanitaria", 
      description: "Nella prima schermata inserisci i tuoi dati identificativi.",
      list: [
        "Inserisci il tuo Codice Fiscale nella sezione dedicata",
        "Inserisci il numero della Tessera Sanitaria (solo le ultime 13 cifre)",
        "Attenzione: non inserire il numero completo della tessera, ma solo le ultime 13 cifre (esempio: 1234567890123)"
      ]
    },
    { 
      title: "Completa la verifica di sicurezza", 
      description: "Inserisci il codice di sicurezza visualizzato per procedere.",
      list: [
        "Inserisci il codice di sicurezza (numero o simbolo) visualizzato nella sezione dedicata",
        "Se il codice è difficile da leggere, clicca sul simbolo di ricarica/aggiornamento per generarne uno nuovo",
        "Clicca sul pulsante 'Verifica' per confermare"
      ]
    },
    { 
      title: "Autenticati con SPID o CIE", 
      description: "Accedi in modo sicuro utilizzando le tue credenziali digitali.",
      list: [
        "Scegli il metodo di autenticazione: SPID, CIE o altri sistemi riconosciuti",
        "Inserisci le tue credenziali",
        "Completa il processo di autenticazione"
      ]
    },
    { 
      title: "Scegli per chi prenotare", 
      description: "Indica se la prenotazione è per te o per un'altra persona.",
      list: [
        "Seleziona se prenotare per te stesso o per un'altra persona",
        "Se prenoti per un'altra persona, tieni a portata di mano il Codice Fiscale e la Tessera Sanitaria di quella persona"
      ]
    },
    { 
      title: "Inserisci i dettagli della prestazione", 
      description: "Completa tutti i dati necessari per la prenotazione.",
      list: [
        "Verifica o completa i dati personali se mancanti",
        "Scegli il Distretto/Provincia di riferimento",
        "Seleziona la Struttura (Ospedale/Poliambulatorio)",
        "Per prestazioni SSN (con ricetta rossa): indica priorità, codice esenzione, nome/codice prestazione e data",
        "Per prestazioni ALPI (a pagamento): indica nome/codice prestazioni, cognome del medico e data di ricerca",
        "Clicca sul pulsante 'Prosegui'"
      ]
    },
    { 
      title: "Seleziona l'appuntamento", 
      description: "Scegli tra gli appuntamenti disponibili quello più adatto a te.",
      list: [
        "Dalla lista di appuntamenti disponibili, ordina per data e luogo",
        "Seleziona l'appuntamento di tuo interesse cliccando sul pulsante dedicato",
        "Clicca nuovamente sul pulsante 'Prosegui' per confermare"
      ]
    },
    { 
      title: "Conferma e completa la prenotazione", 
      description: "Rivedi le informazioni e accetta i termini per finalizzare la prenotazione.",
      list: [
        "Leggi attentamente le eventuali 'NOTE OPERATORE'",
        "Accetta obbligatoriamente i 'TERMINI DI DISDETTA'",
        "Accetta la 'PRESA VISIONE DELL'INFORMATIVA PRIVACY'",
        "Nella pagina di riepilogo, verifica tutti i dati",
        "Scarica la copia della prenotazione",
        "Una copia di cortesia sarà inviata automaticamente al tuo indirizzo email"
      ]
    }
  ];

  const info = {
    difficulty: "Medio",
    duration: "20 minuti",
    stepsCount: steps.length,
  };

  const prerequisites = {
    title: "Prima di iniziare",
    documents: [
      "SPID o CIE attivi",
      "Codice Fiscale",
      "Tessera Sanitaria (ultime 13 cifre)",
      "Prescrizione medica (se richiesta)",
      "Numero NRE (se disponibile)"
    ]
  };

  const sidebarContent = [
    {
      title: "Link Utili",
      links: [
        { text: "Portale ASL Puglia", url: "https://www.sanita.puglia.it", external: true },
        { text: "App Puglia Salute", url: "https://www.sanita.puglia.it/web/guest/app-puglia-salute", external: true },
        { text: "Numero Verde CUP", url: "tel:800345477", external: false },
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
      title="Prenotazioni Visite Mediche Sanità Puglia"
      subtitle="Guida completa per prenotare visite mediche e esami tramite il portale ASL Puglia"
      image={prenotazioniImage}
      steps={steps}
      info={info}
      prerequisites={prerequisites}
      sidebarContent={sidebarContent}
      previousLink="/guide/anagrafe-digitale"
      previousTitle="Guida precedente: Anagrafe Digitale"
    />
  );
};

export default GuidaPrenotazioniASL;

