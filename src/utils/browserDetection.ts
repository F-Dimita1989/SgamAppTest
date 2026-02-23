// Utility per rilevare browser mobile e applicare fix specifici

export interface BrowserInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isBrave: boolean;
  isOpera: boolean;
  isFirefox: boolean;
  isFirefoxIOS: boolean; // Firefox iOS usa WebKit, non Gecko
  isEdge: boolean;
  needsMobileFix: boolean;
}

/**
 * Rileva informazioni sul browser corrente
 */
export const detectBrowser = (): BrowserInfo => {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      isSafari: false,
      isChrome: false,
      isBrave: false,
      isOpera: false,
      isFirefox: false,
      isFirefoxIOS: false,
      isEdge: false,
      needsMobileFix: false,
    };
  }

  const ua = window.navigator.userAgent.toLowerCase();

  // Rileva mobile
  const isMobile =
    /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  const isIOS = /ipad|iphone|ipod/.test(ua) && !("MSStream" in window);
  const isAndroid = /android/.test(ua);

  // Rileva browser specifici
  const isSafari = /safari/.test(ua) && !/chrome|crios|fxios/.test(ua);
  // Brave detection: controlla user agent e API specifica (PRIMA di Chrome)
  const braveNavigator = window.navigator as typeof window.navigator & {
    brave?: { isBrave?: () => Promise<boolean> };
  };
  const isBrave =
    /brave/.test(ua) || braveNavigator.brave?.isBrave !== undefined;
  const isChrome = /chrome|crios/.test(ua) && !/edg|opr|brave/.test(ua);
  const isOpera = /opr|opera/.test(ua);
  // Firefox iOS usa WebKit (come Safari), non Gecko!
  const isFirefoxIOS = /fxios/.test(ua);
  const isFirefox = /firefox/.test(ua) && !isFirefoxIOS; // Solo Firefox Gecko (Android/Desktop)
  const isEdge = /edg|edge/.test(ua);

  // Browser che necessitano fix mobile
  // Firefox iOS usa WebKit → NON necessita fix Gecko, usa fix Safari
  const needsMobileFix =
    isMobile &&
    (isIOS ||
      isAndroid ||
      isBrave ||
      isOpera ||
      isSafari ||
      (isFirefox && isAndroid));

  return {
    isMobile,
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    isBrave,
    isOpera,
    isFirefox,
    isFirefoxIOS,
    isEdge,
    needsMobileFix,
  };
};

/**
 * Applica classi CSS al body in base al browser rilevato
 */
export const applyBrowserClasses = (): void => {
  if (typeof document === "undefined") return;

  const browser = detectBrowser();
  const body = document.body;
  const html = document.documentElement;

  // Rimuove classi precedenti
  body.classList.remove(
    "is-mobile",
    "is-ios",
    "is-android",
    "is-safari",
    "is-chrome",
    "is-brave",
    "is-opera",
    "is-firefox",
    "is-firefox-ios",
    "is-edge",
    "needs-mobile-fix"
  );

  html.classList.remove(
    "is-mobile",
    "is-ios",
    "is-android",
    "is-safari",
    "is-chrome",
    "is-brave",
    "is-opera",
    "is-firefox",
    "is-firefox-ios",
    "is-edge",
    "needs-mobile-fix"
  );

  // Aggiunge classi correnti
  if (browser.isMobile) {
    body.classList.add("is-mobile");
    html.classList.add("is-mobile");
  }
  if (browser.isIOS) {
    body.classList.add("is-ios");
    html.classList.add("is-ios");
  }
  if (browser.isAndroid) {
    body.classList.add("is-android");
    html.classList.add("is-android");
  }
  if (browser.isSafari) {
    body.classList.add("is-safari");
    html.classList.add("is-safari");
  }
  if (browser.isChrome) {
    body.classList.add("is-chrome");
    html.classList.add("is-chrome");
  }
  if (browser.isBrave) {
    body.classList.add("is-brave");
    html.classList.add("is-brave");
  }
  if (browser.isOpera) {
    body.classList.add("is-opera");
    html.classList.add("is-opera");
  }
  if (browser.isFirefox) {
    body.classList.add("is-firefox");
    html.classList.add("is-firefox");
  }
  if (browser.isFirefoxIOS) {
    body.classList.add("is-firefox-ios");
    html.classList.add("is-firefox-ios");
  }
  if (browser.isEdge) {
    body.classList.add("is-edge");
    html.classList.add("is-edge");
  }
  if (browser.needsMobileFix) {
    body.classList.add("needs-mobile-fix");
    html.classList.add("needs-mobile-fix");
  }
};

/**
 * Fix specifici per browser problematici
 */
const applyBrowserSpecificFixes = (): void => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const browser = detectBrowser();

  // Fix Opera mobile: forza visibilità #root e contenuto
  if (browser.isOpera && browser.isMobile) {
    const root = document.getElementById("root");
    if (root) {
      root.style.visibility = "visible";
      root.style.opacity = "1";
      root.style.display = "flex";
      root.style.backgroundColor = "#F4F4FA";
    }

    // Forza visibilità di tutti gli elementi principali
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      (mainContent as HTMLElement).style.visibility = "visible";
      (mainContent as HTMLElement).style.opacity = "1";
    }

    // Forza visibilità del body
    document.body.style.visibility = "visible";
    document.body.style.opacity = "1";
  }

  // Fix Safari mobile, Chrome iOS, Firefox iOS e altri browser iOS: forza visibilità bottone chatbot
  // Firefox iOS usa WebKit (come Safari) → applica gli stessi fix di Safari
  // CONFIGURAZIONE CORRETTA: Portal 100%x100% con pointer-events: none, bottone con pointer-events: auto
  if (
    (browser.isIOS ||
      (browser.isSafari && browser.isMobile) ||
      (browser.isChrome && browser.isIOS) ||
      browser.isFirefoxIOS) && // Firefox iOS usa WebKit
    browser.isMobile
  ) {
    // Attendi che il DOM sia pronto
    setTimeout(() => {
      const portal = document.getElementById("chatbot-button-portal");
      if (portal) {
        portal.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 1000 !important;
          pointer-events: none !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        `;
      }

      const buttonFixed = document.querySelector(".chatbot-button-fixed");
      if (buttonFixed) {
        (buttonFixed as HTMLElement).style.cssText = `
          position: fixed !important;
          bottom: calc(var(--spaziatura-lg, 24px) + var(--spaziatura-sm, 8px) + env(safe-area-inset-bottom, 0px)) !important;
          right: calc(var(--spaziatura-lg, 24px) + var(--spaziatura-sm, 8px) + env(safe-area-inset-right, 0px)) !important;
          z-index: 1001 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        `;
      }

      // Fix scroll-to-top button per iOS/Firefox iOS
      const scrollPortal = document.getElementById("scroll-to-top-portal");
      if (scrollPortal) {
        scrollPortal.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 1002 !important;
          pointer-events: none !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        `;
      }

      const scrollButton = document.querySelector(".scroll-to-top-button");
      if (scrollButton) {
        (scrollButton as HTMLElement).style.cssText = `
          position: fixed !important;
          bottom: calc(var(--spaziatura-lg, 24px) + var(--spaziatura-sm, 8px) + env(safe-area-inset-bottom, 0px)) !important;
          left: calc(var(--spaziatura-lg, 24px) + var(--spaziatura-sm, 8px) + env(safe-area-inset-left, 0px)) !important;
          z-index: 1002 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
        `;
      }

      // Fix cookie banner per iOS/Firefox iOS
      const cookiePortal = document.getElementById("cookie-banner-portal");
      if (cookiePortal) {
        cookiePortal.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 9999 !important;
          pointer-events: none !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        `;
      }

      const cookieBanner = document.querySelector("#cookie-banner-portal .cookie-banner");
      if (cookieBanner) {
        (cookieBanner as HTMLElement).style.cssText = `
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          z-index: 10000 !important;
          pointer-events: auto !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        `;
      }
    }, 500);
  }

  // Fix Firefox mobile (SOLO ANDROID/GECKO), Opera Mobile e Android Chrome: applica gli stessi fix del cookie banner portal
  // Firefox iOS usa WebKit → NON applica fix Gecko, usa fix Safari
  // Usa la stessa configurazione di Chrome mobile per consistenza
  if (
    browser.isMobile &&
    ((browser.isFirefox && browser.isAndroid) ||
      browser.isAndroid ||
      browser.isChrome ||
      browser.isOpera) &&
    !browser.isFirefoxIOS // CRITICO: escludi Firefox iOS (usa WebKit, non Gecko)
  ) {
    const applyCookieBannerFixes = () => {
      const cookiePortal = document.getElementById("cookie-banner-portal");
      if (cookiePortal) {
        // Applica gli stessi stili del portal fantasma di Chrome mobile
        cookiePortal.style.cssText = `
          position: fixed !important;
          width: 0 !important;
          height: 0 !important;
          top: 0 !important;
          left: 0 !important;
          overflow: visible !important;
          contain: none !important;
          isolation: auto !important;
          background: transparent !important;
          pointer-events: none !important;
          transform: none !important;
          z-index: 9999 !important;
        `;
      }

      const cookieBanner = document.querySelector(
        "#cookie-banner-portal .cookie-banner"
      );
      if (cookieBanner) {
        // Verifica se il banner è effettivamente visibile (non ancora accettato/chiuso)
        const computedStyle = window.getComputedStyle(cookieBanner);
        if (computedStyle.display !== "none") {
          // Su TUTTI i Firefox mobile (Android E iOS) e Opera Mobile: CRITICO - rimuovi transform dai parent che rompono position fixed
          // Questo è necessario perché `position: fixed` smette di funzionare se i parent hanno transform/contain/perspective/filter
          if (
            (browser.isFirefox && browser.isAndroid) ||
            browser.isFirefoxIOS ||
            browser.isOpera
          ) {
            // Rimuovi transform da html, body, #root
            const html = document.documentElement;
            const body = document.body;
            const root = document.getElementById("root");

            if (html) {
              html.style.transform = "none";
              html.style.contain = "none";
              html.style.perspective = "none";
              html.style.filter = "none";
            }

            if (body) {
              body.style.transform = "none";
              body.style.contain = "none";
              body.style.perspective = "none";
              body.style.filter = "none";
            }

            if (root) {
              root.style.transform = "none";
              root.style.contain = "none";
              root.style.perspective = "none";
              root.style.filter = "none";
            }
          }

          // Applica gli stessi stili del banner di Chrome mobile
          (cookieBanner as HTMLElement).style.cssText = `
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            z-index: 10000 !important;
            pointer-events: auto !important;
            transform: none !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            contain: none !important;
            isolation: isolate !important;
            perspective: none !important;
            filter: none !important;
            will-change: auto !important;
            margin: 0 !important;
          `;
        }
      }
    };

    // Fix Firefox mobile per chatbot button portal
    const applyChatbotButtonFixes = () => {
      const chatbotPortal = document.getElementById("chatbot-button-portal");
      if (chatbotPortal) {
        // Applica gli stessi stili del portal fantasma di Chrome mobile
        chatbotPortal.style.cssText = `
          position: fixed !important;
          width: 0 !important;
          height: 0 !important;
          top: 0 !important;
          left: 0 !important;
          overflow: visible !important;
          contain: none !important;
          isolation: auto !important;
          background: transparent !important;
          pointer-events: none !important;
          transform: none !important;
          z-index: 1000 !important;
        `;
      }

      const chatbotButton = document.querySelector(
        "#chatbot-button-portal .chatbot-button-fixed"
      );
      if (chatbotButton) {
        // Verifica se il bottone è effettivamente visibile
        const computedStyle = window.getComputedStyle(chatbotButton);
        if (computedStyle.display !== "none") {
          // Su TUTTI i Firefox mobile (Android E iOS) e Opera Mobile: CRITICO - rimuovi transform dai parent che rompono position fixed
          // Questo è necessario perché `position: fixed` smette di funzionare se i parent hanno transform/contain/perspective/filter
          if (
            (browser.isFirefox && browser.isAndroid) ||
            browser.isFirefoxIOS ||
            browser.isOpera
          ) {
            // Rimuovi transform da html, body, #root
            const html = document.documentElement;
            const body = document.body;
            const root = document.getElementById("root");

            if (html) {
              html.style.transform = "none";
              html.style.contain = "none";
              html.style.perspective = "none";
              html.style.filter = "none";
            }

            if (body) {
              body.style.transform = "none";
              body.style.contain = "none";
              body.style.perspective = "none";
              body.style.filter = "none";
            }

            if (root) {
              root.style.transform = "none";
              root.style.contain = "none";
              root.style.perspective = "none";
              root.style.filter = "none";
            }
          }

          // Applica gli stessi stili del bottone di Chrome mobile
          (chatbotButton as HTMLElement).style.cssText = `
            position: fixed !important;
            bottom: calc(20px + env(safe-area-inset-bottom, 0px)) !important;
            right: calc(20px + env(safe-area-inset-right, 0px)) !important;
            z-index: 1001 !important;
            pointer-events: auto !important;
            transform: translateZ(0) !important;
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
            contain: none !important;
            isolation: isolate !important;
            perspective: none !important;
            filter: none !important;
            will-change: auto !important;
            margin: 0 !important;
          `;
        }
      }
    };

    // Applica fix iniziale
    setTimeout(applyCookieBannerFixes, 500);
    setTimeout(applyChatbotButtonFixes, 500);

    // Su TUTTI i Firefox mobile (Android E iOS) e Opera Mobile, ri-applica i fix durante lo scroll per mantenere visibilità
    if (
      (browser.isFirefox && browser.isAndroid) ||
      browser.isFirefoxIOS ||
      browser.isOpera
    ) {
      // Ri-applica periodicamente durante lo scroll (throttled)
      let scrollTimeout: number | undefined;
      window.addEventListener(
        "scroll",
        () => {
          if (scrollTimeout) {
            clearTimeout(scrollTimeout);
          }
          scrollTimeout = window.setTimeout(() => {
            applyCookieBannerFixes();
            applyChatbotButtonFixes();
          }, 50);
        },
        { passive: true }
      );

      // Ri-applica su resize e orientation change
      window.addEventListener("resize", () => {
        applyCookieBannerFixes();
        applyChatbotButtonFixes();
      });
      window.addEventListener("orientationchange", () => {
        setTimeout(() => {
          applyCookieBannerFixes();
          applyChatbotButtonFixes();
        }, 200);
      });

      // Ri-applica dopo 2 secondi per sicurezza
      setTimeout(() => {
        applyCookieBannerFixes();
        applyChatbotButtonFixes();
      }, 2000);
    }
  }
};

/**
 * Inizializza il rilevamento browser all'avvio
 */
export const initBrowserDetection = (): void => {
  if (typeof window === "undefined") return;

  // Applica classi immediatamente
  applyBrowserClasses();

  // Applica fix specifici per browser problematici
  applyBrowserSpecificFixes();

  // Ri-applica dopo il caricamento completo (per browser che cambiano user agent)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      applyBrowserClasses();
      applyBrowserSpecificFixes();
    });
  } else {
    applyBrowserClasses();
    applyBrowserSpecificFixes();
  }

  // Ri-applica su resize (alcuni browser cambiano comportamento su orientamento)
  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      applyBrowserClasses();
      applyBrowserSpecificFixes();
    }, 100);
  });

  // Ri-applica fix dopo che React ha renderizzato
  setTimeout(() => {
    applyBrowserSpecificFixes();
  }, 2000);
};
