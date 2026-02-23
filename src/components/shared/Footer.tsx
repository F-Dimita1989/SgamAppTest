import React, { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import VisitorCounter from "./VisitorCounter";
import DownloadCounter from "./DownloadCounter";
import "./Footer.css";

const Footer: React.FC = React.memo(() => {

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, []);

  const footerLinks = useMemo(() => [
    { to: "/", label: "Home" },
    { to: "/servizio-antifrode", label: "Protezione Anti-Frode" },
    { to: "/guide", label: "Guide" },
    { to: "/glossario", label: "Glossario" },
    { to: "/traduttore-generazionale", label: "Traduttore Generazionale" },
    { to: "/info", label: "Info e Contatti" }
  ], []);

  // Rimossi gli effetti scroll-reveal per il footer
  // Il footer è sempre visibile e non ha bisogno di animazioni scroll-reveal
  // Questo previene problemi di rendering su Brave mobile e altri browser

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-column">
            <h3>LINK UTILI</h3>
            <nav aria-label="Link utili principali">
              {footerLinks.map((link) => (
                <Link key={link.to} to={link.to} className="footer-link" onClick={scrollToTop}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="footer-column">
            <h3>CONTATTI</h3>
            <address>
              <p className="footer-contact">
                <a href="mailto:info.sgamapp@gmail.com" className="footer-contact-link">
                  info.sgamapp@gmail.com
                </a>
              </p>
              <p className="footer-contact">
                <a 
                  href="https://maps.app.goo.gl/6N4u5x9AkCq24LxV9" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="footer-contact-link"
                >
                  Piazza Aldo Moro, 37<br />
                  70121 Bari (BA)
                </a>
              </p>
              <p className="footer-contact">
                <a href="https://sgamapp.vercel.app" target="_blank" rel="noopener noreferrer" className="footer-contact-link">
                  sgamapp.vercel.app
                </a>
              </p>
              <p className="footer-contact">
                <a href="tel:+390804169704" className="footer-contact-link">
                  +39 080 416 9704
                </a>
              </p>
            </address>
          </div>

          <div className="footer-column">
            <h3>INFO</h3>
            <nav aria-label="Informazioni legali">
              <Link to="/privacy" className="footer-link" onClick={scrollToTop}>
                Privacy e Policy
              </Link>
            </nav>
          </div>
        </div>

        <div className="content">
          <p>© {currentYear} SgamApp - Tutti i diritti riservati</p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
            <DownloadCounter />
            <VisitorCounter />
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
