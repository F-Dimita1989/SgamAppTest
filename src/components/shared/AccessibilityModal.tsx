import React, { useState, useEffect, useRef } from "react";
import {
  Cross2Icon,
  TextIcon,
  MixIcon,
  Link2Icon,
  StopIcon,
  CircleIcon,
  AccessibilityIcon,
  KeyboardIcon,
  SpeakerLoudIcon,
  ExclamationTriangleIcon,
  EyeOpenIcon,
  FileTextIcon,
  ImageIcon,
  CodeIcon,
} from "@radix-ui/react-icons";
import "./AccessibilityModal.css";

interface AccessibilitySettings {
  fontSize: "normal" | "large" | "xlarge";
  highContrast: boolean;
  underlineLinks: boolean;
  reduceMotion: boolean;
  enhancedFocus: boolean;
}

interface AccessibilityModalProps {
  onClose?: () => void;
}

const AccessibilityModal: React.FC<AccessibilityModalProps> = ({ onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dragStartY = useRef<number>(0);
  const dragCurrentY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const [isDraggingState, setIsDraggingState] = useState(false);

  const handleClose = () => {
    onClose?.();
  };

  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem("accessibility-settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Valida schema per sicurezza
        if (
          parsed &&
          typeof parsed === "object" &&
          ["normal", "large", "xlarge"].includes(parsed.fontSize) &&
          typeof parsed.highContrast === "boolean" &&
          typeof parsed.underlineLinks === "boolean" &&
          typeof parsed.reduceMotion === "boolean" &&
          typeof parsed.enhancedFocus === "boolean"
        ) {
          return parsed;
        }
        // Schema non valido, rimuovi e usa default
        localStorage.removeItem("accessibility-settings");
      } catch {
        // Dati corrotti, rimuovi e usa default
        localStorage.removeItem("accessibility-settings");
      }
    }
    return {
      fontSize: "normal",
      highContrast: false,
      underlineLinks: false,
      reduceMotion: false,
      enhancedFocus: false,
    };
  });

  useEffect(() => {
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Body scroll lock quando il modale è aperto
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Applica le impostazioni di accessibilità
  useEffect(() => {
    const html = document.documentElement;

    // Font size
    html.removeAttribute("data-accessibility-font");
    if (settings.fontSize !== "normal") {
      html.setAttribute("data-accessibility-font", settings.fontSize);
    }

    // High contrast
    html.removeAttribute("data-accessibility-contrast");
    if (settings.highContrast) {
      html.setAttribute("data-accessibility-contrast", "high");
    }

    // Underline links
    html.removeAttribute("data-accessibility-links");
    if (settings.underlineLinks) {
      html.setAttribute("data-accessibility-links", "underline");
    }

    // Reduce motion
    html.removeAttribute("data-accessibility-motion");
    if (settings.reduceMotion) {
      html.setAttribute("data-accessibility-motion", "reduce");
    }

    // Enhanced focus
    html.removeAttribute("data-accessibility-focus");
    if (settings.enhancedFocus) {
      html.setAttribute("data-accessibility-focus", "enhanced");
    }

    // Salva le impostazioni
    localStorage.setItem("accessibility-settings", JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }

      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener("keydown", handleKeyboard);
    return () => modal.removeEventListener("keydown", handleKeyboard);
  }, [onClose]);

  // Gestione drag/swipe per mobile
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Solo se tocchi nella parte superiore del modale (header o handle)
      const touch = e.touches[0];
      const target = e.target as HTMLElement;
      const header = modal.querySelector(".accessibility-modal-header");

      if (header && (header.contains(target) || touch.clientY < 150)) {
        dragStartY.current = touch.clientY;
        dragCurrentY.current = touch.clientY;
        isDragging.current = true;
        setIsDraggingState(true);
        modal.style.transition = "none";
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;

      const touch = e.touches[0];
      dragCurrentY.current = touch.clientY;
      const deltaY = dragCurrentY.current - dragStartY.current;

      // Permetti solo drag verso il basso
      if (deltaY > 0) {
        modal.style.transform = `translateY(${deltaY}px)`;
        // Aumenta opacità overlay quando si trascina
        const overlay = modal.parentElement;
        if (overlay) {
          const opacity = Math.max(0.3, 0.6 - deltaY / 500);
          overlay.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging.current) return;

      const deltaY = dragCurrentY.current - dragStartY.current;
      const threshold = 100; // 100px per chiudere

      modal.style.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

      if (deltaY > threshold) {
        // Chiudi il modale
        modal.style.transform = "translateY(100%)";
        setTimeout(() => {
          handleClose();
        }, 300);
      } else {
        // Ripristina posizione
        modal.style.transform = "translateY(0)";
        const overlay = modal.parentElement;
        if (overlay) {
          overlay.style.backgroundColor = "";
        }
      }

      isDragging.current = false;
      setIsDraggingState(false);
    };

    modal.addEventListener("touchstart", handleTouchStart, { passive: true });
    modal.addEventListener("touchmove", handleTouchMove, { passive: true });
    modal.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      modal.removeEventListener("touchstart", handleTouchStart);
      modal.removeEventListener("touchmove", handleTouchMove);
      modal.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onClose]);

  const accessibilityFeatures = [
    {
      title: "Navigazione da Tastiera",
      description:
        "Tutti gli elementi interattivi sono accessibili tramite tastiera. Usa Tab per navigare, Enter o Spazio per attivare i controlli.",
      icon: "keyboard",
    },
    {
      title: "Lettori di Schermo",
      description:
        "Compatibilità completa con screen reader (NVDA, JAWS, VoiceOver). Contenuti semantici, ARIA labels e ruoli appropriati.",
      icon: "screen-reader",
    },
    {
      title: "Contrasto e Leggibilità",
      description:
        "Contrasto elevato per testi e pulsanti, font di dimensioni adeguate per garantire la leggibilità.",
      icon: "contrast",
    },
    {
      title: "Messaggi di Errore Accessibili",
      description:
        'Messaggi di errore e notifiche annunciati dai lettori di schermo con role="alert" e aria-live.',
      icon: "error",
    },
    {
      title: "Focus Visibile",
      description:
        "Indicatori di focus chiari e visibili per la navigazione da tastiera, con outline blu ben contrastato.",
      icon: "focus",
    },
    {
      title: "Label e Form",
      description:
        "Tutti i campi di input hanno label associate tramite htmlFor o aria-label per una navigazione efficace.",
      icon: "form",
    },
    {
      title: "Immagini Descrittive",
      description:
        "Tutte le immagini hanno testi alternativi (alt) accurati che descrivono il contenuto.",
      icon: "image",
    },
    {
      title: "HTML Semantico",
      description:
        "Utilizzo di elementi HTML5 semantici (header, nav, main, section, article, footer) per una migliore struttura.",
      icon: "semantic",
    },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "keyboard":
        return <KeyboardIcon />;
      case "screen-reader":
        return <SpeakerLoudIcon />;
      case "contrast":
        return <MixIcon />;
      case "error":
        return <ExclamationTriangleIcon />;
      case "focus":
        return <EyeOpenIcon />;
      case "form":
        return <FileTextIcon />;
      case "image":
        return <ImageIcon />;
      case "semantic":
        return <CodeIcon />;
      default:
        return <CircleIcon />;
    }
  };

  return (
    <>
      <div
        className="accessibility-modal-overlay"
        onClick={handleClose}
        aria-hidden="true"
      >
        <div
          className={`accessibility-modal ${isDraggingState ? "dragging" : ""}`}
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="accessibility-modal-title"
          aria-modal="true"
        >
          <div className="accessibility-modal-header">
            <div className="accessibility-modal-title-section">
              <AccessibilityIcon
                className="accessibility-modal-icon"
                aria-hidden="true"
              />
              <h2 id="accessibility-modal-title">Accessibilità</h2>
            </div>
            <button
              type="button"
              ref={closeButtonRef}
              className="accessibility-modal-close"
              onClick={handleClose}
              aria-label="Chiudi finestra accessibilità"
            >
              <Cross2Icon
                className="accessibility-modal-close-icon"
                aria-hidden="true"
              />
            </button>
          </div>

          <div className="accessibility-modal-content">
            <p className="accessibility-intro">
              <strong>SgamApp</strong> è progettato per essere accessibile a
              tutti. Personalizza la tua esperienza utilizzando i controlli qui
              sotto. Le tue preferenze verranno salvate automaticamente.
            </p>

            <div className="accessibility-controls">
              <h3 className="accessibility-controls-title">
                Opzioni di Accessibilità
              </h3>

              {/* Font Size */}
              <div className="accessibility-control-item">
                <div className="accessibility-control-header">
                  <TextIcon
                    className="accessibility-control-icon"
                    aria-hidden="true"
                  />
                  <label
                    htmlFor="font-size-select"
                    className="accessibility-control-label"
                  >
                    Dimensione Testo
                  </label>
                </div>
                <select
                  id="font-size-select"
                  value={settings.fontSize}
                  onChange={(e) =>
                    updateSetting(
                      "fontSize",
                      e.target.value as "normal" | "large" | "xlarge"
                    )
                  }
                  className="accessibility-control-select"
                  aria-describedby="font-size-desc"
                >
                  <option value="normal">Normale (100%)</option>
                  <option value="large">Grande (120%)</option>
                  <option value="xlarge">Molto Grande (150%)</option>
                </select>
                <span id="font-size-desc" className="sr-only">
                  Seleziona la dimensione del testo per migliorare la
                  leggibilità
                </span>
              </div>

              {/* High Contrast */}
              <div className="accessibility-control-item">
                <div className="accessibility-control-header">
                  <MixIcon
                    className="accessibility-control-icon"
                    aria-hidden="true"
                  />
                  <label
                    htmlFor="high-contrast-toggle"
                    className="accessibility-control-label"
                  >
                    Alto Contrasto
                  </label>
                </div>
                <button
                  type="button"
                  id="high-contrast-toggle"
                  className={`accessibility-toggle ${
                    settings.highContrast ? "active" : ""
                  }`}
                  onClick={() =>
                    updateSetting("highContrast", !settings.highContrast)
                  }
                  aria-pressed={settings.highContrast}
                  aria-describedby="high-contrast-desc"
                >
                  <span className="accessibility-toggle-slider"></span>
                </button>
                <span id="high-contrast-desc" className="sr-only">
                  Attiva o disattiva l'alto contrasto per migliorare la
                  visibilità dei testi
                </span>
              </div>

              {/* Underline Links */}
              <div className="accessibility-control-item">
                <div className="accessibility-control-header">
                  <Link2Icon
                    className="accessibility-control-icon"
                    aria-hidden="true"
                  />
                  <label
                    htmlFor="underline-links-toggle"
                    className="accessibility-control-label"
                  >
                    Evidenzia Link
                  </label>
                </div>
                <button
                  type="button"
                  id="underline-links-toggle"
                  className={`accessibility-toggle ${
                    settings.underlineLinks ? "active" : ""
                  }`}
                  onClick={() =>
                    updateSetting("underlineLinks", !settings.underlineLinks)
                  }
                  aria-pressed={settings.underlineLinks}
                  aria-describedby="underline-links-desc"
                >
                  <span className="accessibility-toggle-slider"></span>
                </button>
                <span id="underline-links-desc" className="sr-only">
                  Attiva o disattiva la sottolineatura dei link per
                  identificarli meglio
                </span>
              </div>

              {/* Reduce Motion */}
              <div className="accessibility-control-item">
                <div className="accessibility-control-header">
                  <StopIcon
                    className="accessibility-control-icon"
                    aria-hidden="true"
                  />
                  <label
                    htmlFor="reduce-motion-toggle"
                    className="accessibility-control-label"
                  >
                    Riduci Animazioni
                  </label>
                </div>
                <button
                  type="button"
                  id="reduce-motion-toggle"
                  className={`accessibility-toggle ${
                    settings.reduceMotion ? "active" : ""
                  }`}
                  onClick={() =>
                    updateSetting("reduceMotion", !settings.reduceMotion)
                  }
                  aria-pressed={settings.reduceMotion}
                  aria-describedby="reduce-motion-desc"
                >
                  <span className="accessibility-toggle-slider"></span>
                </button>
                <span id="reduce-motion-desc" className="sr-only">
                  Attiva o disattiva la riduzione delle animazioni per ridurre
                  il movimento
                </span>
              </div>

              {/* Enhanced Focus */}
              <div className="accessibility-control-item">
                <div className="accessibility-control-header">
                  <CircleIcon
                    className="accessibility-control-icon"
                    aria-hidden="true"
                  />
                  <label
                    htmlFor="enhanced-focus-toggle"
                    className="accessibility-control-label"
                  >
                    Focus Migliorato
                  </label>
                </div>
                <button
                  type="button"
                  id="enhanced-focus-toggle"
                  className={`accessibility-toggle ${
                    settings.enhancedFocus ? "active" : ""
                  }`}
                  onClick={() =>
                    updateSetting("enhancedFocus", !settings.enhancedFocus)
                  }
                  aria-pressed={settings.enhancedFocus}
                  aria-describedby="enhanced-focus-desc"
                >
                  <span className="accessibility-toggle-slider"></span>
                </button>
                <span id="enhanced-focus-desc" className="sr-only">
                  Attiva o disattiva un indicatore di focus più visibile per la
                  navigazione da tastiera
                </span>
              </div>
            </div>

            <div className="accessibility-features">
              <h3 className="accessibility-features-title">
                Caratteristiche Implementate
              </h3>
              <ul className="accessibility-features-list">
                {accessibilityFeatures.map((feature, index) => (
                  <li key={index} className="accessibility-feature-item">
                    <div
                      className="accessibility-feature-icon"
                      aria-hidden="true"
                    >
                      {getIcon(feature.icon)}
                    </div>
                    <div className="accessibility-feature-content">
                      <h4 className="accessibility-feature-title">
                        {feature.title}
                      </h4>
                      <p className="accessibility-feature-description">
                        {feature.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="accessibility-footer">
              <p>
                <strong>Standard Seguiti:</strong> WCAG 2.1 Livello AA
              </p>
              <p>
                Le tue impostazioni vengono salvate automaticamente e rimarranno
                attive nelle prossime visite.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Componente per il bottone dell'accessibilità da usare nella navbar
export const AccessibilityButton: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const handleTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <button
      type="button"
      className="btn-icon accessibility-btn"
      onClick={handleClick}
      onTouchEnd={handleTouch}
      aria-label="Visualizza informazioni e opzioni di accessibilità del sito"
      title="Accessibilità"
    >
      <AccessibilityIcon />
    </button>
  );
};

export default AccessibilityModal;
