import React from 'react';
import GuidaTemplate from '../shared/GuidaTemplate';
import scudoImage from '../../assets/SGAMY_SCUDO.webp';

const GuidaSicurezza: React.FC = () => {
  const steps = [
    { title: "Usa password complesse", description: "Crea password di almeno 12 caratteri con lettere maiuscole, minuscole, numeri e simboli. Evita informazioni personali." },
    { title: "Attiva l'autenticazione a due fattori", description: "Abilita 2FA su tutti i servizi che lo supportano per aggiungere un ulteriore livello di sicurezza." },
    { title: "Utilizza un gestore di password", description: "Installa un password manager come Bitwarden, 1Password o LastPass per gestire le tue credenziali in modo sicuro." },
    { title: "Mantieni aggiornati i software", description: "Installa sempre gli aggiornamenti di sicurezza per sistema operativo, browser e applicazioni." },
    { title: "Usa una VPN", description: "Utilizza una VPN affidabile quando navighi su reti pubbliche per proteggere i tuoi dati." },
    { title: "Configura il firewall", description: "Attiva e configura il firewall del tuo sistema per bloccare connessioni non autorizzate." },
    { title: "Installa un antivirus", description: "Utilizza un software antivirus affidabile e mantienilo sempre aggiornato." },
    { title: "Fai backup regolari", description: "Esegui backup automatici dei tuoi dati importanti su dispositivi esterni o cloud sicuri." },
    { title: "Controlla le impostazioni privacy", description: "Verifica e limita le informazioni che condividi sui social network e servizi online." },
    { title: "Usa connessioni sicure", description: "Verifica sempre che i siti web utilizzino HTTPS e evita di inserire dati sensibili su connessioni non sicure." },
    { title: "Configura il blocco schermo", description: "Imposta un PIN, password o biometria per bloccare il tuo dispositivo quando non lo usi." },
    { title: "Monitora le tue attività", description: "Controlla regolarmente i log di accesso e le attività sospette sui tuoi account." },
    { title: "Usa email temporanee", description: "Utilizza servizi di email temporanee per registrazioni che non richiedono la tua email principale." },
    { title: "Configura la crittografia", description: "Abilita la crittografia del disco per proteggere i dati memorizzati sul tuo dispositivo." },
    { title: "Elimina account inutilizzati", description: "Chiudi e elimina account di servizi che non utilizzi più per ridurre la superficie di attacco." },
    { title: "Usa browser sicuri", description: "Configura il tuo browser per bloccare tracker, popup e contenuti dannosi." },
    { title: "Proteggi la tua rete domestica", description: "Cambia la password predefinita del router e utilizza WPA3 per la crittografia Wi-Fi." },
    { title: "Fai attenzione al phishing", description: "Non cliccare mai su link sospetti e verifica sempre l'autenticità dei mittenti email." },
    { title: "Usa dispositivi separati", description: "Considera l'uso di dispositivi separati per attività sensibili e personali." },
    { title: "Resta informato", description: "Mantieniti aggiornato sulle ultime minacce informatiche e le migliori pratiche di sicurezza." },
  ];

  const info = {
    difficulty: "Avanzato",
    duration: "45 minuti",
    stepsCount: steps.length,
  };

  const prerequisites = {
    title: "Prima di iniziare",
    documents: [
      "Accesso amministratore al tuo dispositivo",
      "Account su servizi online da proteggere",
      "Connessione internet stabile"
    ]
  };

  const sidebarContent = [
    {
      title: "Link Utili",
      links: [
        { text: "Password Manager - Bitwarden", url: "https://bitwarden.com", external: true },
        { text: "Password Manager - 1Password", url: "https://1password.com", external: true },
        { text: "Verifica sicurezza password", url: "https://www.passwordmonitor.com", external: true }
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
      title="Sicurezza Avanzata"
      subtitle="Tecniche avanzate per proteggere i tuoi dati e la tua privacy online"
      image={scudoImage}
      steps={steps}
      info={info}
      prerequisites={prerequisites}
      sidebarContent={sidebarContent}
      previousLink="/guide/cie"
      previousTitle="Guida precedente: CIE"
      nextLink="/guide/primo-accesso"
      nextTitle="Prossima guida: Primo Accesso"
    />
  );
};

export default GuidaSicurezza;
