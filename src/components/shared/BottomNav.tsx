import React, { useEffect, useRef, useCallback, useState } from "react";
import "./BottomNav.css";

// Import statici delle immagini
import spidImage from "../../assets/SGAMY_SPID.webp";
import pecImage from "../../assets/SGAMY_PEC.webp";
import cieImage from "../../assets/SGAMY_CIE.webp";
import scudoImage from "../../assets/SGAMY_SCUDO.webp";
import pagoPaImage from "../../assets/SGAMY_PAGAMENTO.webp";
import primoAccessoImage from "../../assets/SGAMY_POLLICE.webp";
import recuperoPwdImage from "../../assets/SGAMY_PASSWORD.webp";
import certificatiImage from "../../assets/SGAMY_CERTFICATI.webp";
import anagrafeImage from "../../assets/SGAMY_PASSWORD_VARIANT.webp";
import prenotazioniImage from "../../assets/SGAMY_DOTTORE.webp";

const imageMap: Record<string, string> = {
  spid: spidImage,
  pec: pecImage,
  cie: cieImage,
  scudo: scudoImage,
  pagoPa: pagoPaImage,
  primoAccesso: primoAccessoImage,
  recuperoPwd: recuperoPwdImage,
  certificati: certificatiImage,
  anagrafe: anagrafeImage,
  prenotazioni: prenotazioniImage,
};

interface NavItem {
  icon: string;
  label: string;
  link: string;
}

const BottomNav: React.FC = () => {
  const navRef = useRef<HTMLElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, string>>({});
  const [isMobile, setIsMobile] = useState(false);
  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    target: EventTarget | null;
  } | null>(null);
  const isScrollingRef = useRef(false);

  // Rileva mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Lazy load immagini
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setImagesLoaded(imageMap);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    if (navRef.current) observer.observe(navRef.current);
    return () => observer.disconnect();
  }, []);

  // Assicura che lo scroll parta da sinistra su desktop (mostra prima icona)
  useEffect(() => {
    if (!isMobile && navRef.current) {
      // Usa requestAnimationFrame per assicurarsi che il layout sia renderizzato
      const setScrollLeft = () => {
        if (navRef.current) {
          navRef.current.scrollLeft = 0;
        }
      };
      // Imposta immediatamente e anche dopo un frame per sicurezza
      setScrollLeft();
      requestAnimationFrame(() => {
        requestAnimationFrame(setScrollLeft);
      });
    }
  }, [isMobile, imagesLoaded]);

  // Gestione swipe nativa sul container nav (migliorata per produzione)
  useEffect(() => {
    if (!isMobile || !navRef.current) return;

    const nav = navRef.current;
    let touchStart: { x: number; y: number; time: number; scrollLeft: number } | null = null;
    let isScrolling = false;
    let hasMoved = false;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStart = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
        scrollLeft: nav.scrollLeft,
      };
      isScrolling = false;
      hasMoved = false;
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
        target: e.target,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Se è uno swipe orizzontale significativo
      if (absDeltaX > 5 || absDeltaY > 5) {
        hasMoved = true;
      }

      if (absDeltaX > 10 && absDeltaX > absDeltaY) {
        isScrolling = true;
        isScrollingRef.current = true;
        
        // Previeni il default per permettere lo scroll nativo
        // Solo se è chiaramente uno swipe orizzontale
        if (absDeltaX > 15) {
          e.preventDefault();
          // Applica lo scroll manualmente se necessario
          const newScrollLeft = touchStart.scrollLeft - deltaX;
          nav.scrollLeft = newScrollLeft;
        }
      } else if (absDeltaY > absDeltaX) {
        // Se è uno swipe verticale, non interferire
        touchStart = null;
        isScrolling = false;
        isScrollingRef.current = false;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart) return;

      const touch = e.changedTouches[0];
      const deltaX = Math.abs(touch.clientX - touchStart.x);
      const deltaY = Math.abs(touch.clientY - touchStart.y);
      const deltaTime = Date.now() - touchStart.time;

      // Se è uno swipe orizzontale, previeni il click sul link
      if (
        hasMoved &&
        (isScrolling ||
        (deltaX > 10 && deltaX > deltaY * 2) ||
        (deltaX > 5 && deltaTime < 300 && deltaX > deltaY))
      ) {
        // Previeni la navigazione se era uno swipe
        if (
          touchStartRef.current?.target &&
          touchStartRef.current.target instanceof HTMLElement
        ) {
          const link = touchStartRef.current.target.closest("a");
          if (link) {
            e.preventDefault();
            e.stopPropagation();
            // Previeni anche il click che potrebbe arrivare dopo
            link.style.pointerEvents = "none";
            setTimeout(() => {
              link.style.pointerEvents = "";
            }, 300);
          }
        }
      }

      touchStart = null;
      isScrolling = false;
      hasMoved = false;
      isScrollingRef.current = false;
      touchStartRef.current = null;
    };

    // Usa event listeners nativi NON passivi per avere controllo completo
    // IMPORTANTE: { passive: false } permette preventDefault()
    const options = { passive: false, capture: false };
    nav.addEventListener("touchstart", handleTouchStart, options);
    nav.addEventListener("touchmove", handleTouchMove, options);
    nav.addEventListener("touchend", handleTouchEnd, options);
    nav.addEventListener("touchcancel", handleTouchEnd, options);

    return () => {
      nav.removeEventListener("touchstart", handleTouchStart);
      nav.removeEventListener("touchmove", handleTouchMove);
      nav.removeEventListener("touchend", handleTouchEnd);
      nav.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isMobile]);

  const navItems = React.useMemo<NavItem[]>(
    () => [
      { icon: imagesLoaded.spid, label: "SPID", link: "/guide/spid" },
      { icon: imagesLoaded.pec, label: "PEC", link: "/guide/pec" },
      { icon: imagesLoaded.cie, label: "CIE", link: "/guide/cie" },
      {
        icon: imagesLoaded.scudo,
        label: "Sicurezza",
        link: "/guide/sicurezza",
      },
      {
        icon: imagesLoaded.primoAccesso,
        label: "Primo Accesso",
        link: "/guide/primo-accesso",
      },
      {
        icon: imagesLoaded.prenotazioni,
        label: "Prenotazioni ASL",
        link: "/guide/prenotazioni-asl-puglia",
      },
      {
        icon: imagesLoaded.recuperoPwd,
        label: "Recupero Password",
        link: "/guide/recupero-password",
      },
      {
        icon: imagesLoaded.certificati,
        label: "Certificati Online",
        link: "/guide/certificati-online",
      },
      {
        icon: imagesLoaded.pagoPa,
        label: "Pagamenti DM",
        link: "/guide/pagamenti-dm-sanitari",
      },
      {
        icon: imagesLoaded.anagrafe,
        label: "Anagrafe Digitale",
        link: "/guide/anagrafe-digitale",
      },
    ],
    [imagesLoaded]
  );

  // ============================================================
  // LOGICA NAVIGAZIONE DESKTOP
  // ============================================================

  const scrollLeft = useCallback(() => {
    if (!navRef.current) return;
    const nav = navRef.current;
    const scrollAmount = nav.clientWidth * 0.75;
    nav.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  }, []);

  const scrollRight = useCallback(() => {
    if (!navRef.current) return;
    const nav = navRef.current;
    const scrollAmount = nav.clientWidth * 0.75;
    nav.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }, []);

  const renderNavItem = (
    item: NavItem,
    keyPrefix: string,
    isHidden: boolean = false
  ) => (
    <a
      key={`${keyPrefix}-${item.label}`}
      href={item.link}
      className="nav-item"
      aria-hidden={isHidden}
      tabIndex={isHidden ? -1 : 0}
      draggable="false"
      onClick={(e) => {
        // Previeni il click se era uno swipe
        if (isScrollingRef.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      {item.icon && (
        <img
          src={item.icon}
          alt=""
          className="nav-icon"
          loading="lazy"
          draggable="false"
          width={40}
          height={40}
        />
      )}
      <span className="nav-label">{item.label}</span>
    </a>
  );

  return (
    <section className="bottom-nav-container" aria-label="Navigazione rapida">
      {!isMobile && (
        <button
          type="button"
          className="bottom-nav-arrow bottom-nav-arrow-left"
          onClick={scrollLeft}
        >
          &lt;
        </button>
      )}

      <nav ref={navRef} className="bottom-nav" aria-label="Lista guide">
        {navItems.map((item) => renderNavItem(item, "original", false))}
      </nav>

      {!isMobile && (
        <button
          type="button"
          className="bottom-nav-arrow bottom-nav-arrow-right"
          onClick={scrollRight}
        >
          &gt;
        </button>
      )}
    </section>
  );
};

export default BottomNav;
