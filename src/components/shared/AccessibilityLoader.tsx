import { useEffect } from 'react';

/**
 * Componente che carica e applica le impostazioni di accessibilità salvate
 * all'avvio dell'applicazione, prima che qualsiasi componente venga renderizzato.
 * Questo assicura che le preferenze dell'utente siano sempre attive.
 */
const AccessibilityLoader: React.FC = () => {
  useEffect(() => {
    // Carica le impostazioni salvate dal localStorage
    const saved = localStorage.getItem('accessibility-settings');
    if (!saved) return;

    try {
      const settings = JSON.parse(saved);
      
      // Valida schema per sicurezza
      if (!settings || typeof settings !== 'object' ||
          !['normal', 'large', 'xlarge'].includes(settings.fontSize) ||
          typeof settings.highContrast !== 'boolean' ||
          typeof settings.underlineLinks !== 'boolean' ||
          typeof settings.reduceMotion !== 'boolean' ||
          typeof settings.enhancedFocus !== 'boolean') {
        // Schema non valido, rimuovi e usa default
        localStorage.removeItem('accessibility-settings');
        return;
      }
      
      const html = document.documentElement;

      // Applica Font Size
      html.removeAttribute('data-accessibility-font');
      if (settings.fontSize && settings.fontSize !== 'normal') {
        html.setAttribute('data-accessibility-font', settings.fontSize);
      }

      // Applica High Contrast
      html.removeAttribute('data-accessibility-contrast');
      if (settings.highContrast) {
        html.setAttribute('data-accessibility-contrast', 'high');
      }

      // Applica Underline Links
      html.removeAttribute('data-accessibility-links');
      if (settings.underlineLinks) {
        html.setAttribute('data-accessibility-links', 'underline');
      }

      // Applica Reduce Motion
      html.removeAttribute('data-accessibility-motion');
      if (settings.reduceMotion) {
        html.setAttribute('data-accessibility-motion', 'reduce');
      }

      // Applica Enhanced Focus
      html.removeAttribute('data-accessibility-focus');
      if (settings.enhancedFocus) {
        html.setAttribute('data-accessibility-focus', 'enhanced');
      }
    } catch {
      // Dati corrotti, rimuovi e usa default
      localStorage.removeItem('accessibility-settings');
    }
  }, []); // Esegue solo al mount

  return null; // Componente invisibile
};

export default AccessibilityLoader;

