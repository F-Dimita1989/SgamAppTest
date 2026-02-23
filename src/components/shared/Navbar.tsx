import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import './Navbar.css'
import logosImage from '../../assets/LOGO_S.webp'
import mainLogo from '../../assets/logo.svg'
import { AccessibilityButton } from './AccessibilityModal'
import AccessibilityModal from './AccessibilityModal'

// Utility function per throttle
const throttle = <T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

const Navbar = memo(function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false)
  
  // Stati per menu di navigazione
  const [openGuidePanel, setOpenGuidePanel] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const guideTriggerRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLElement>(null)
  const hamburgerBtnRef = useRef<HTMLButtonElement>(null)
  const [arrowLeft, setArrowLeft] = useState(20)


  const handleLogoClick = useCallback(() => {
    navigate('/')
  }, [navigate])

  const handleAccessibilityClick = useCallback(() => {
    setIsAccessibilityOpen(true)
  }, [])

  // Funzioni per menu di navigazione - Hover
  const handleGuideMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setOpenGuidePanel(true)
  }, [])

  const handleGuideMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setOpenGuidePanel(false)
    }, 200)
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev)
  }, [])
  
  // Lista guide memoizzata (contenuto statico)
  const guideLinks = useMemo(() => [
    { to: '/guide/spid', label: 'SPID' },
    { to: '/guide/pec', label: 'PEC' },
    { to: '/guide/cie', label: 'CIE' },
    { to: '/guide/sicurezza', label: 'Sicurezza' },
    { to: '/guide/primo-accesso', label: 'Primo Accesso' },
    { to: '/guide/recupero-password', label: 'Recupero Password' },
    { to: '/guide/certificati-online', label: 'Certificati Online' },
    { to: '/guide/pagamenti-dm-sanitari', label: 'Pagamenti DM Sanitari' },
    { to: '/guide/anagrafe-digitale', label: 'Anagrafe Digitale' },
    { to: '/guide/prenotazioni-asl-puglia', label: 'Prenotazioni ASL Puglia' },
  ], [])
  
  const handleGuideClick = useCallback(() => {
    setOpenGuidePanel(false)
  }, [])

  useEffect(() => {
    const updateNavbarHeight = () => {
      const navbar = document.querySelector('.navbar-simple')
      if (navbar) {
        const height = navbar.getBoundingClientRect().height
        document.documentElement.style.setProperty('--navbar-height', `${height}px`)
      }
    }

    updateNavbarHeight()
    const throttledUpdate = throttle(updateNavbarHeight, 100)
    window.addEventListener('resize', throttledUpdate)
    return () => window.removeEventListener('resize', throttledUpdate)
  }, [])

  // Sincronizza la larghezza della navbar con quella del footer
  useEffect(() => {
    const syncNavbarWidth = () => {
      const navbar = document.querySelector('.navbar-simple') as HTMLElement
      const footer = document.querySelector('footer.footer') as HTMLElement
      
      if (navbar && footer) {
        // Ottieni la larghezza effettiva del footer (escludendo la scrollbar)
        const footerWidth = footer.getBoundingClientRect().width
        const footerLeft = footer.getBoundingClientRect().left
        
        // Imposta la larghezza della navbar uguale a quella del footer
        // Il footer ha position: relative quindi la sua larghezza è già corretta
        navbar.style.width = `${footerWidth}px`
        navbar.style.left = `${footerLeft}px`
      }
    }

    // Esegui subito e dopo che il DOM è caricato
    syncNavbarWidth()
    const timeout = setTimeout(syncNavbarWidth, 100)
    
    // Throttle per resize e scroll
    const throttledSync = throttle(syncNavbarWidth, 16) // ~60fps
    window.addEventListener('resize', throttledSync, { passive: true })
    window.addEventListener('scroll', throttledSync, { passive: true })
    
    // Usa MutationObserver per rilevare cambiamenti nel DOM (debounced)
    const debouncedSync = throttle(syncNavbarWidth, 100)
    const observer = new MutationObserver(debouncedSync)
    observer.observe(document.body, { childList: true, subtree: true, attributes: false })
    
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('resize', throttledSync)
      window.removeEventListener('scroll', throttledSync)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!isMobileMenuOpen) {
      // Rimuovi il focus da tutti gli elementi nel menu quando si chiude
      const mobileMenu = document.getElementById('mobile-links-menu')
      if (mobileMenu) {
        const focusableElements = mobileMenu.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]'
        )
        focusableElements.forEach((element) => {
          if (document.activeElement === element) {
            element.blur()
          }
          // Forza tabIndex={-1} quando il menu è chiuso
          element.setAttribute('tabindex', '-1')
        })
      }
    } else {
      // Quando il menu si apre, ripristina tabIndex normale
      const mobileMenu = document.getElementById('mobile-links-menu')
      if (mobileMenu) {
        const links = mobileMenu.querySelectorAll<HTMLElement>('a.mobile-link-item')
        links.forEach((link) => {
          link.removeAttribute('tabindex')
        })
        const buttons = mobileMenu.querySelectorAll<HTMLElement>('button.mobile-guide-toggle')
        buttons.forEach((button) => {
          button.removeAttribute('tabindex')
        })
      }
    }
  }, [isMobileMenuOpen])

  // Blocca lo scroll del body quando il menu mobile è aperto
  useEffect(() => {
    if (isMobileMenuOpen) {
      // Salva la posizione di scroll corrente
      const scrollY = window.scrollY
      
      // Blocca lo scroll del body
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.touchAction = 'none'
      
      return () => {
        // Ripristina lo scroll del body
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.touchAction = ''
        
        // Ripristina la posizione di scroll
        window.scrollTo(0, scrollY)
      }
    }
  }, [isMobileMenuOpen])

  // Prevenire il focus sugli elementi quando il menu è chiuso
  useEffect(() => {
    const mobileMenu = document.getElementById('mobile-links-menu')
    if (!mobileMenu) return

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (!isMobileMenuOpen && mobileMenu.contains(target)) {
        e.preventDefault()
        target.blur()
        // Sposta il focus al bottone hamburger
        const hamburgerBtn = document.querySelector('.mobile-hamburger-btn') as HTMLElement
        if (hamburgerBtn) {
          hamburgerBtn.focus()
        }
      }
    }

    mobileMenu.addEventListener('focusin', handleFocus, true)
    return () => {
      mobileMenu.removeEventListener('focusin', handleFocus, true)
    }
  }, [isMobileMenuOpen])

  // Chiudi il menu mobile quando si clicca fuori
  useEffect(() => {
    if (!isMobileMenuOpen) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      const mobileMenu = mobileMenuRef.current
      const hamburgerBtn = hamburgerBtnRef.current

      // Se il click è dentro il menu o sul bottone hamburger, non fare nulla
      if (
        (mobileMenu && mobileMenu.contains(target)) ||
        (hamburgerBtn && hamburgerBtn.contains(target))
      ) {
        return
      }

      // Altrimenti chiudi il menu
      setIsMobileMenuOpen(false)
    }

    // Usa mousedown e touchstart per catturare i click prima che vengano processati
    document.addEventListener('mousedown', handleClickOutside, true)
    document.addEventListener('touchstart', handleClickOutside, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true)
      document.removeEventListener('touchstart', handleClickOutside, true)
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setOpenGuidePanel(false)
      } else {
        setIsMobileMenuOpen(false)
      }
    }

    const throttledResize = throttle(handleResize, 150)
    window.addEventListener('resize', throttledResize, { passive: true })
    return () => window.removeEventListener('resize', throttledResize)
  }, [])

  // Calcola la posizione del link Guide per allineare la freccia
  useEffect(() => {
    const updateArrowPosition = () => {
      if (guideTriggerRef.current && openGuidePanel) {
        const trigger = guideTriggerRef.current
        const triggerRect = trigger.getBoundingClientRect()
        const dropdown = document.querySelector('.guide-dropdown-menu') as HTMLElement
        if (dropdown) {
          const dropdownRect = dropdown.getBoundingClientRect()
          // Calcola il centro del link Guide
          const triggerCenterX = triggerRect.left + (triggerRect.width / 2)
          // Calcola la posizione relativa rispetto al dropdown
          // La freccia usa translateX(-50%) nel CSS, quindi si centra automaticamente
          const relativeLeft = triggerCenterX - dropdownRect.left
          setArrowLeft(relativeLeft)
        }
      }
    }

    if (openGuidePanel) {
      // Piccolo delay per assicurarsi che il dropdown sia renderizzato
      const timeoutId = setTimeout(() => {
        updateArrowPosition()
      }, 50)
      
      // Chiama anche dopo il rendering
      requestAnimationFrame(() => {
        updateArrowPosition()
      })
      
      // Throttle per resize e scroll
      const throttledUpdate = throttle(updateArrowPosition, 16)
      window.addEventListener('resize', throttledUpdate, { passive: true })
      window.addEventListener('scroll', throttledUpdate, { passive: true })
      
      return () => {
        clearTimeout(timeoutId)
        window.removeEventListener('resize', throttledUpdate)
        window.removeEventListener('scroll', throttledUpdate)
      }
    }
  }, [openGuidePanel])

  return (
    <>
      <header className={`navbar-simple ${openGuidePanel ? 'dropdown-open' : ''}`}>
        <nav>
          <button 
            type="button"
            className="logo-button" 
            onClick={handleLogoClick}
            title="Torna alla home"
          >
            <img src={mainLogo} alt="Logo SgamApp - Sicurezza digitale e identità digitale" className="logo-img me-2" loading="eager" fetchPriority="high" width="60" height="60" />
            <img src={logosImage} alt="Loghi istituzionali e partner di SgamApp" className="logos-img me-2" loading="eager" fetchPriority="high" width="80" height="80" />
          </button>

          {/* LOGO CENTRALE RESPONSIVE */}
          <button
            type="button"
            className="logo-center-responsive"
            onClick={handleLogoClick}
            aria-label="Torna alla home"
            title="Torna alla home"
          >
            <img 
              src={logosImage} 
              alt="Loghi istituzionali e partner di SgamApp" 
              loading="eager"
              fetchPriority="high"
              width="80"
              height="80"
            />
          </button>

          {/* HAMBURGER MOBILE */}
          <button
            ref={hamburgerBtnRef}
            type="button"
            className="mobile-hamburger-btn"
            onClick={toggleMobileMenu}
            aria-label="Apri o chiudi menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-links-menu"
          >
            {[...Array(3)].map((_, i) => (
              <span key={i} className={`hamburger-line ${isMobileMenuOpen ? "active" : ""}`}></span>
            ))}
          </button>

          {/* DESKTOP LINKS */}
          <div className="navbar-links">
            <Link 
              to="/" 
              className={`header-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </Link>

            <Link 
              to="/servizio-antifrode" 
              className={`header-link ${location.pathname === '/servizio-antifrode' ? 'active' : ''}`}
            >
              Protezione Anti-Frode
            </Link>

            {/* GUIDE TABS DESKTOP */}
            <div
              ref={guideTriggerRef}
              className="guide-tabs-wrapper"
              onMouseEnter={handleGuideMouseEnter}
              onMouseLeave={handleGuideMouseLeave}
            >
              <Link
                to="/guide"
                className={`header-link ${location.pathname.startsWith('/guide') ? 'active' : ''}`}
                onClick={() => setOpenGuidePanel(false)}
                aria-haspopup="true"
                aria-expanded={openGuidePanel}
                aria-controls="guide-dropdown-panel"
              >
                Guide
                {openGuidePanel ? (
                  <ChevronUpIcon 
                    className="guide-chevron-icon"
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronDownIcon 
                    className="guide-chevron-icon"
                    aria-hidden="true"
                  />
                )}
              </Link>
            </div>

            <Link 
              to="/glossario" 
              className={`header-link ${location.pathname === '/glossario' ? 'active' : ''}`}
            >
              Glossario
            </Link>

            <Link 
              to="/traduttore-generazionale" 
              className={`header-link ${location.pathname === '/traduttore-generazionale' ? 'active' : ''}`}
            >
              Traduttore Generazionale
            </Link>

            <Link 
              to="/info" 
              className={`header-link ${location.pathname === '/info' ? 'active' : ''}`}
            >
              Info e Contatti
            </Link>
          </div>

          <div className="navbar-right">
            <AccessibilityButton onClick={handleAccessibilityClick} />
          </div>
        </nav>

        {/* MOBILE MENU */}
        <nav
          ref={mobileMenuRef}
          id="mobile-links-menu"
          className={`mobile-links-menu ${isMobileMenuOpen ? "open" : ""}`}
          aria-hidden={!isMobileMenuOpen}
          aria-label="Menu di navigazione mobile"
        >
          <Link 
            to="/" 
            className={`mobile-link-item ${location.pathname === '/' ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            tabIndex={!isMobileMenuOpen ? -1 : undefined}
          >
            <span>Home</span>
          </Link>

          <Link
            to="/servizio-antifrode"
            className={`mobile-link-item ${location.pathname === '/servizio-antifrode' ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            tabIndex={!isMobileMenuOpen ? -1 : undefined}
          >
            <span>Protezione Anti-Frode</span>
          </Link>

          {/* MOBILE GUIDE DROPDOWN */}
          <div className="mobile-guide-section">
            <Link
              to="/guide"
              className={`mobile-link-item ${location.pathname.startsWith('/guide') ? 'active' : ''}`}
              onClick={toggleMobileMenu}
              tabIndex={!isMobileMenuOpen ? -1 : undefined}
            >
              <span>Guide</span>
            </Link>

            <div
              id="mobile-guide-dropdown"
              className="mobile-guide-dropdown open"
              role="region"
              aria-label="Menu guide disponibili"
              aria-hidden={!isMobileMenuOpen}
            >
              <div className="mobile-guide-dropdown-content">
                {/* Colonna sinistra - Titolo e descrizione */}
                <div className="mobile-guide-dropdown-left">
                  <Link
                    to="/guide"
                    className="mobile-guide-dropdown-title"
                    onClick={toggleMobileMenu}
                    style={{ textDecoration: 'none', color: 'var(--testo-bianco)', display: 'block' }}
                    tabIndex={!isMobileMenuOpen ? -1 : undefined}
                  >
                    <h3 style={{ margin: 0, cursor: 'pointer', color: 'var(--testo-bianco)' }}>Guide</h3>
                  </Link>
                  <p className="mobile-guide-dropdown-description">
                    Il Catalogo delle Guide di SgamApp, la pagina per trovare le guide e le informazioni 
                    in maniera facile, chiara e veloce.
                  </p>
                </div>

                {/* Divider orizzontale per mobile */}
                <div className="mobile-guide-dropdown-divider"></div>

                {/* Colonna destra - Lista link */}
                <div className="mobile-guide-dropdown-right">
                  <h4 className="mobile-guide-dropdown-section-title">Servizi Guide</h4>
                  <div className="mobile-guide-dropdown-items">
                    <Link
                      to="/guide/spid"
                      className="mobile-guide-dropdown-item"
                      onClick={toggleMobileMenu}
                      tabIndex={!isMobileMenuOpen ? -1 : undefined}
                    >
                      SPID
                    </Link>
                    <Link
                      to="/guide/pec"
                      className="mobile-guide-dropdown-item"
                      onClick={toggleMobileMenu}
                      tabIndex={!isMobileMenuOpen ? -1 : undefined}
                    >
                      PEC
                    </Link>
                    <Link
                      to="/guide/cie"
                      className="mobile-guide-dropdown-item"
                      onClick={toggleMobileMenu}
                      tabIndex={!isMobileMenuOpen ? -1 : undefined}
                    >
                      CIE
                    </Link>
                    <Link
                      to="/guide/sicurezza"
                      className="mobile-guide-dropdown-item"
                      onClick={toggleMobileMenu}
                      tabIndex={!isMobileMenuOpen ? -1 : undefined}
                    >
                      Sicurezza
                    </Link>
                    <Link
                      to="/guide/primo-accesso"
                      className="mobile-guide-dropdown-item"
                      onClick={toggleMobileMenu}
                      tabIndex={!isMobileMenuOpen ? -1 : undefined}
                    >
                      Primo Accesso
                    </Link>
                    <Link
                      to="/guide/recupero-password"
                      className="mobile-guide-dropdown-item"
                      onClick={toggleMobileMenu}
                      tabIndex={!isMobileMenuOpen ? -1 : undefined}
                    >
                      Recupero Password
                    </Link>
                    <Link
                      to="/guide/certificati-online"
                      className="mobile-guide-dropdown-item"
                      onClick={toggleMobileMenu}
                      tabIndex={!isMobileMenuOpen ? -1 : undefined}
                    >
                      Certificati Online
                    </Link>
                    <Link
                      to="/guide/pagamenti-dm-sanitari"
                      className="mobile-guide-dropdown-item"
                      onClick={toggleMobileMenu}
                      tabIndex={!isMobileMenuOpen ? -1 : undefined}
                    >
                      Pagamenti DM Sanitari
                    </Link>
                    <Link
                      to="/guide/anagrafe-digitale"
                      className="mobile-guide-dropdown-item"
                      onClick={toggleMobileMenu}
                      tabIndex={!isMobileMenuOpen ? -1 : undefined}
                    >
                      Anagrafe Digitale
                    </Link>
                    <Link
                      to="/guide/prenotazioni-asl-puglia"
                      className="mobile-guide-dropdown-item"
                      onClick={toggleMobileMenu}
                      tabIndex={!isMobileMenuOpen ? -1 : undefined}
                    >
                      Prenotazioni ASL Puglia
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link 
            to="/glossario" 
            className={`mobile-link-item ${location.pathname === '/glossario' ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            tabIndex={!isMobileMenuOpen ? -1 : undefined}
          >
            <span>Glossario</span>
          </Link>

          <Link
            to="/traduttore-generazionale"
            className={`mobile-link-item ${location.pathname === '/traduttore-generazionale' ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            tabIndex={!isMobileMenuOpen ? -1 : undefined}
          >
            <span>Traduttore Generazionale</span>
          </Link>

          <Link 
            to="/info" 
            className={`mobile-link-item ${location.pathname === '/info' ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            tabIndex={!isMobileMenuOpen ? -1 : undefined}
          >
            <span>Info e Contatti</span>
          </Link>
        </nav>
      </header>

      {isAccessibilityOpen && (
        <AccessibilityModal onClose={() => setIsAccessibilityOpen(false)} />
      )}

      {/* GUIDE DROPDOWN MENU */}
      {openGuidePanel && (
        <div
          id="guide-dropdown-panel"
          className="guide-dropdown-menu"
          role="menu"
          onMouseEnter={handleGuideMouseEnter}
          onMouseLeave={handleGuideMouseLeave}
          aria-label="Menu guide disponibili"
        >
          <div className="guide-dropdown-content">
            {/* Freccia che punta al link Guide */}
            <div 
              className="guide-dropdown-arrow"
              style={{ left: `${arrowLeft}px` }}
            >
              <ChevronUpIcon 
                className="guide-arrow-up"
                aria-hidden="true"
              />
            </div>

            {/* Colonna sinistra - Titolo e descrizione */}
            <div className="guide-dropdown-left">
              <h3 className="guide-dropdown-title">Guide</h3>
              <p className="guide-dropdown-description">
                Il Catalogo delle Guide di SGAMAPP, la pagina per trovare le guide e le informazioni 
                in maniera facile, chiara e veloce.
              </p>
            </div>

            {/* Divider verticale */}
            <div className="guide-dropdown-vertical-divider"></div>

            {/* Colonna destra - Lista link (ottimizzata) */}
            <div className="guide-dropdown-right">
              <h4 className="guide-dropdown-section-title">Servizi Guide</h4>
              <div className="guide-dropdown-items">
                {guideLinks.map((link) => (
                  <Link 
                    key={link.to}
                    to={link.to} 
                    className="guide-dropdown-item" 
                    role="menuitem" 
                    onClick={handleGuideClick}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
});

export default Navbar;
