import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import './HeroSection.css';
import heroImage from '../../assets/SGAMY_NONNINAHD.webp';
import { searchApi, type SearchPage } from '../../apiServices/api';

/**
 * Componente Hero Section principale
 * 
 * Funzionalità:
 * - Preload ottimizzato dell'immagine hero per LCP
 * - Ricerca in tempo reale con debounce
 * - Navigazione con tastiera
 * - Gestione risultati ricerca
 */
function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchPage[]>([])
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const heroSectionRef = useRef<HTMLElement>(null)
  const navigate = useNavigate()

  /**
   * Preload ottimizzato dell'immagine hero per migliorare LCP
   * L'immagine è nel viewport iniziale, quindi non deve essere lazy loaded
   */
  useEffect(() => {
    if (!heroSectionRef.current) return;

    // Pre-carica l'immagine immediatamente con alta priorità
    const img = new Image();
    // Priorità alta per LCP - forza il browser a caricare subito
    if ('fetchPriority' in img) {
      (img as HTMLImageElement & { fetchPriority?: 'high' | 'low' | 'auto' }).fetchPriority = 'high';
    }
    img.onload = () => {
      if (heroSectionRef.current) {
        heroSectionRef.current.style.backgroundImage = `url(${heroImage})`;
        // Aggiungi classe per transizione smooth
        heroSectionRef.current.classList.add('hero-image-loaded');
      }
    };
    img.onerror = () => {
      // Fallback se l'immagine non carica
      if (heroSectionRef.current) {
        heroSectionRef.current.style.backgroundImage = `url(${heroImage})`;
      }
    };
    // Carica immediatamente (non lazy) - questo forza il preload
    img.src = heroImage;
    
    // Aggiungi anche preload link dinamicamente per massima priorità
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'image';
    preloadLink.href = heroImage;
    if ('fetchPriority' in preloadLink) {
      (preloadLink as HTMLLinkElement & { fetchPriority?: 'high' | 'low' | 'auto' }).fetchPriority = 'high';
    }
    document.head.appendChild(preloadLink);
    
    return () => {
      // Cleanup: rimuovi il preload link quando il componente si smonta
      const existingPreload = document.querySelector(`link[href="${heroImage}"]`);
      if (existingPreload) {
        existingPreload.remove();
      }
    };
  }, [])

  /**
   * Ricerca in tempo reale con debouncing (ottimizzato)
   */
  useEffect(() => {
    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true)
        const searchResults = await searchApi.search(trimmedQuery)
        setResults(searchResults.slice(0, 5)) // Mostra max 5 risultati
        setShowResults(true)
      } catch {
        // Errore nella ricerca - gestito silenziosamente
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300) // Debounce 300ms per ridurre chiamate API

    return () => clearTimeout(timeoutId)
  }, [searchQuery])
  
  /**
   * Handler chiusura risultati (memoizzato)
   */
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowResults(false)
    }
  }, [])

  /**
   * Chiudi risultati quando si clicca fuori dalla searchbar (ottimizzato)
   */
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  const handleResultClick = useCallback((route: string) => {
    navigate(route)
    setSearchQuery('')
    setShowResults(false)
    setSelectedIndex(-1)
  }, [navigate])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = searchQuery.trim()
    
    if (trimmedQuery.length >= 2) {
      if (results.length > 0) {
        // Naviga al primo risultato o a quello selezionato
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex].route)
        } else {
          handleResultClick(results[0].route)
        }
      } else if (!loading) {
        // Se non ci sono risultati ma la query è valida, prova comunque a cercare
        searchApi.search(trimmedQuery).then(searchResults => {
          if (searchResults.length > 0) {
            handleResultClick(searchResults[0].route)
          }
        })
      }
    }
  }, [searchQuery, results, selectedIndex, loading, handleResultClick])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
        setShowResults(true)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Escape') {
      setShowResults(false)
      setSelectedIndex(-1)
    }
  }, [results])

  return (
    <section 
      ref={heroSectionRef}
      className="hero-section"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* Immagine LCP nascosta per forzare preload con alta priorità e renderla rilevabile come LCP */}
      <img
        src={heroImage}
        alt=""
        fetchPriority="high"
        loading="eager"
        decoding="sync"
        width="1"
        height="1"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
          objectFit: 'cover'
        }}
        aria-hidden="true"
      />
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1>
          Benvenuto in <strong>SgamApp</strong>
        </h1>
        <p>L'assistente Easy & Smart per la Cittadinanza digitale Inclusiva e Cybersicura</p>
        
        {/* Searchbar Material Design */}
        <div className="hero-searchbar-wrapper" ref={searchRef}>
          <form className="hero-searchbar" onSubmit={handleSearch}>
            <div className="hero-searchbar-container">
              <MagnifyingGlassIcon className="hero-searchbar-icon" />
              <input
                type="text"
                className="hero-searchbar-input"
                placeholder="Cerca guide, servizi, informazioni..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setSelectedIndex(-1)
                }}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2 && results.length > 0) {
                    setShowResults(true)
                  }
                }}
                onKeyDown={handleKeyDown}
                aria-label="Cerca nel sito"
                autoComplete="off"
              />
            </div>
          </form>
          
          {/* Risultati ricerca */}
          {showResults && (results.length > 0 || loading) && (
            <div className="hero-search-results">
              {loading ? (
                <div className="hero-search-loading">Caricamento...</div>
              ) : (
                results.map((result, index) => (
                  <div
                    key={result.id}
                    className={`hero-search-result-item ${selectedIndex === index ? 'selected' : ''}`}
                    onClick={() => handleResultClick(result.route)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="hero-search-result-title">{result.title}</div>
                    <div className="hero-search-result-category">{result.category}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default memo(HeroSection)
