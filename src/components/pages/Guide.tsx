import GuideCards from '../shared/GuideCards';
import spidImg from '../../assets/SGAMY_SPID.webp';
import pecImg from '../../assets/SGAMY_PEC.webp';
import cieImg from '../../assets/SGAMY_CIE.webp';
import scudoImg from '../../assets/SGAMY_SCUDO.webp';
import passwordImg from '../../assets/SGAMY_PASSWORD_VARIANT.webp';
import passwordRecoveryImg from '../../assets/SGAMY_PASSWORD.webp';
import certificatiImg from '../../assets/SGAMY_CERTFICATI.webp';
import anagrafeImg from '../../assets/SGAMY_ANAGRAFE.webp';
import prenotazioniImg from '../../assets/SGAMY_DOTTORE.webp';
import pagamentiImg from '../../assets/SGAMY_PAGAMENTO.webp';

const GuidePage = () => {
  const guides = [
    { 
      icon: spidImg, 
      title: "SPID", 
      description: "Ottieni la tua identità digitale", 
      link: "/guide/spid",
      duration: "15 min",
      tags: ["Identità", "Accesso", "Digitale"]
    },
    { 
      icon: pecImg, 
      title: "PEC", 
      description: "Configura la tua Posta Elettronica Certificata", 
      link: "/guide/pec",
      duration: "10 min",
      tags: ["Email", "Certificata", "Comunicazioni"]
    },
    { 
      icon: cieImg, 
      title: "CIE", 
      description: "Carta d'Identità Elettronica", 
      link: "/guide/cie",
      duration: "5 min",
      tags: ["Identità", "Documenti", "Digitale"]
    },
    { 
      icon: scudoImg, 
      title: "Sicurezza", 
      description: "Tecniche avanzate per proteggere i tuoi dati", 
      link: "/guide/sicurezza",
      duration: "20 min",
      tags: ["Sicurezza", "Privacy", "Protezione"]
    },
    { 
      icon: passwordImg, 
      title: "Primo Accesso", 
      description: "Primo accesso ai servizi digitali", 
      link: "/guide/primo-accesso",
      duration: "10 min",
      tags: ["Accesso", "Primo", "Servizi"]
    },
    { 
      icon: passwordRecoveryImg, 
      title: "Recupero Password", 
      description: "Come recuperare la password dimenticata", 
      link: "/guide/recupero-password",
      duration: "8 min",
      tags: ["Password", "Recupero", "Accesso"]
    },
    { 
      icon: certificatiImg, 
      title: "Certificati Online", 
      description: "Come richiedere certificati online", 
      link: "/guide/certificati-online",
      duration: "12 min",
      tags: ["Certificati", "Documenti", "Online"]
    },
    { 
      icon: pagamentiImg, 
      title: "Pagamenti DM", 
      description: "Pagamenti DM Sanitari digitali", 
      link: "/guide/pagamenti-dm-sanitari",
      duration: "15 min",
      tags: ["Pagamenti", "Sanità", "Digitale"]
    },
    { 
      icon: anagrafeImg, 
      title: "Anagrafe Digitale", 
      description: "Servizi di anagrafe digitale", 
      link: "/guide/anagrafe-digitale",
      duration: "10 min",
      tags: ["Anagrafe", "Servizi", "Digitale"]
    },
    { 
      icon: prenotazioniImg, 
      title: "Prenotazioni ASL Puglia", 
      description: "Come prenotare visite mediche online", 
      link: "/guide/prenotazioni-asl-puglia",
      duration: "8 min",
      tags: ["Prenotazioni", "Sanità", "ASL"]
    },
  ];

  return <GuideCards guides={guides} />;
};

export default GuidePage;
