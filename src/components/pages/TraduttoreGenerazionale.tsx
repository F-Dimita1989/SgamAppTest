import { useState, useEffect, useRef, useMemo, memo, useCallback } from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { useDebouncedCallback } from "../../hooks/useDebounce";
import { useClickOutside } from "../../hooks/useClickOutside";
import { 
  MagnifyingGlassIcon, 
  Cross2Icon,
  CheckIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon
} from '@radix-ui/react-icons';
import "./TraduttoreGenerazionale.css";
import { translatorApi } from "../../apiServices/api";
import type { TranslationResult } from "../../apiServices/api";

const TraduttoreGenerazionale: React.FC = () => {
  const [searchWord, setSearchWord] = useState("");
  const [allTranslations, setAllTranslations] = useState<TranslationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationResult | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useClickOutside<HTMLDivElement>(() => {
    setShowSuggestions(false);
  });

  // Carica tutte le traduzioni
  useEffect(() => {
    const loadAllTranslations = async () => {
      try {
        setError(null);
        const data = await translatorApi.getAll();
        setAllTranslations(Array.isArray(data) ? data : []);
      } catch {
        setAllTranslations([]);
      }
    };
    loadAllTranslations();
  }, []);

  // Non serve più la ricerca separata, usiamo il filtro diretto su allTranslations

  // Suggerimenti con debounce
  const loadSuggestions = useCallback(async () => {
    if (!searchWord.trim() || searchWord.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const s = await translatorApi.getSuggestions(searchWord.trim(), allTranslations, 5);
      setSuggestions(s);
      setShowSuggestions(s.length > 0);
      setSelectedSuggestionIndex(-1);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchWord, allTranslations]);

  const debouncedLoadSuggestions = useDebouncedCallback(loadSuggestions, 300);

  useEffect(() => {
    debouncedLoadSuggestions();
  }, [debouncedLoadSuggestions]);


  const handleSuggestionClick = useCallback((s: string) => {
    setSearchWord(s);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    searchInputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((i) => (i < suggestions.length - 1 ? i + 1 : i));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((i) => (i > 0 ? i - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  }, [showSuggestions, suggestions, selectedSuggestionIndex]);

  // Memoizza il filtro delle traduzioni per evitare ricalcoli inutili ad ogni render
  const displayTranslations = useMemo(() => {
    // Mostra sempre tutti i dati, filtrati se c'è una ricerca
    if (searchWord.trim()) {
      const q = searchWord.toLowerCase().trim();
      return allTranslations.filter(
        (t) =>
          t.boomerWord.toLowerCase().includes(q) ||
          t.slangWord.toLowerCase().includes(q)
      );
    }
    return allTranslations;
  }, [allTranslations, searchWord]);

  // Seleziona automaticamente la prima traduzione quando cambiano i risultati
  useEffect(() => {
    if (displayTranslations.length > 0) {
      // Se la traduzione selezionata non è più nella lista filtrata, seleziona la prima
      setSelectedTranslation((prev) => {
        if (!prev || !displayTranslations.find(t => t.id === prev.id)) {
          return displayTranslations[0];
        }
        return prev;
      });
    } else {
      setSelectedTranslation(null);
    }
  }, [displayTranslations]);

  // Scroll reveal animations standardizzate
  useScrollReveal('.traduttore .scroll-reveal-item', {
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
    rootMargin: '0px'
  });

  return (
    <section className="traduttore">
      <header className="traduttore__intro scroll-reveal-item scroll-reveal-hidden">
        <h1 className="traduttore__main-title scroll-reveal-item scroll-reveal-hidden">
          Traduttore Generazionale
        </h1>
        <p className="traduttore__subtitle scroll-reveal-item scroll-reveal-hidden">
          Traduci parole tra linguaggio boomer e slang moderno. Inserisci una parola e scopri la sua
          traduzione.
        </p>
      </header>

      <div className="traduttore__filters scroll-reveal-item scroll-reveal-hidden">
        <div className="traduttore__search">
          <label htmlFor="traduttore-search-input" className="sr-only">
            Inserisci una parola da tradurre
          </label>
          <div className="traduttore__search-wrapper">
            <MagnifyingGlassIcon className="traduttore__search-icon" aria-hidden="true" />
            <input
              ref={searchInputRef}
              id="traduttore-search-input"
              type="text"
              placeholder="Cerca un termine..."
              value={searchWord}
              onChange={(e) => {
                setSearchWord(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              className="traduttore__search-input"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-controls="traduttore-suggestions"
              aria-activedescendant={selectedSuggestionIndex >= 0 ? `traduttore-suggestion-${selectedSuggestionIndex}` : undefined}
              aria-label="Cerca un termine nel traduttore generazionale"
            />
            {searchWord && (
              <button
                type="button"
                className="traduttore__search-clear"
                onClick={() => {
                  setSearchWord('');
                  setShowSuggestions(false);
                  searchInputRef.current?.focus();
                }}
                aria-label="Cancella ricerca"
              >
                <Cross2Icon aria-hidden="true" />
              </button>
            )}
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              id="traduttore-suggestions"
              className="traduttore__suggestions"
              role="listbox"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  id={`traduttore-suggestion-${index}`}
                  type="button"
                  className={`traduttore__suggestion ${
                    index === selectedSuggestionIndex
                      ? "traduttore__suggestion--selected"
                      : ""
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                  role="option"
                  aria-selected={index === selectedSuggestionIndex}
                >
                  <MagnifyingGlassIcon className="traduttore__suggestion-icon" aria-hidden="true" />
                  <span>{suggestion}</span>
                  {index === selectedSuggestionIndex && (
                    <CheckIcon className="traduttore__suggestion-check" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error ? (
        <div className="traduttore__error" role="alert" aria-live="assertive">
          <ExclamationTriangleIcon className="traduttore__error-icon" aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : displayTranslations.length === 0 && searchWord.trim() ? (
        <div className="traduttore__no-results" role="status" aria-live="polite" aria-atomic="true">
          <InfoCircledIcon className="traduttore__no-results-icon" aria-hidden="true" />
          <p>Nessuna traduzione trovata per "{searchWord}"</p>
        </div>
      ) : (
        <>
          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {displayTranslations.length === 1 
              ? `Trovata 1 traduzione` 
              : `Trovate ${displayTranslations.length} traduzioni`}
          </div>
          <div className="traduttore__content-wrapper scroll-reveal-item scroll-reveal-hidden">
            {/* Colonna sinistra - Lista traduzioni */}
            <aside className="traduttore__translations-list scroll-reveal-item scroll-reveal-hidden">
              <div className="traduttore__current-label">Traduzioni</div>
              <nav className="traduttore__translations-nav" aria-label="Lista traduzioni">
                {displayTranslations.map((translation, index) => (
                  <button
                    key={translation.id || index}
                    type="button"
                    className={`traduttore__translation-item ${
                      selectedTranslation?.id === translation.id ? 'traduttore__translation-item--active' : ''
                    }`}
                    onClick={() => setSelectedTranslation(translation)}
                  >
                    <span className="traduttore__translation-boomer">{translation.boomerWord}</span>
                    <span className="traduttore__translation-arrow">→</span>
                    <span className="traduttore__translation-slang">{translation.slangWord}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Colonna destra - Dettagli traduzione */}
            <section className="traduttore__definition scroll-reveal-item scroll-reveal-hidden" aria-label="Dettagli traduzione">
              {selectedTranslation ? (
                <article className="traduttore__definition-content">
                  <div className="traduttore__definition-header">
                    <div className="traduttore__definition-from">
                      <span className="traduttore__definition-label">Boomer</span>
                      <h2 className="traduttore__definition-word">{selectedTranslation.boomerWord}</h2>
                    </div>
                    <div className="traduttore__definition-arrow">→</div>
                    <div className="traduttore__definition-to">
                      <span className="traduttore__definition-label">Slang</span>
                      <h2 className="traduttore__definition-word">{selectedTranslation.slangWord}</h2>
                    </div>
                  </div>
                  {selectedTranslation.description && (
                    <div className="traduttore__definition-description">
                      <p>{selectedTranslation.description}</p>
                    </div>
                  )}
                </article>
              ) : (
                <div className="traduttore__definition-empty">
                  <p>Seleziona una traduzione dalla lista per visualizzare i dettagli</p>
                </div>
              )}
            </section>
          </div>
        </>
      )}

      <p className="traduttore__count scroll-reveal-item scroll-reveal-hidden" role="status" aria-live="polite" aria-atomic="true">
        Mostrando {displayTranslations.length} di {allTranslations.length} termini
      </p>
    </section>
  );
};

export default memo(TraduttoreGenerazionale);
