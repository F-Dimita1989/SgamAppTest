import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useDebouncedCallback } from '../../hooks/useDebounce';
import { useClickOutside } from '../../hooks/useClickOutside';
import { 
  MagnifyingGlassIcon, 
  InfoCircledIcon,
  ExclamationTriangleIcon,
  Cross2Icon,
  CheckIcon
} from '@radix-ui/react-icons';
import './Glossario.css';
import { glossaryApi } from '../../apiServices/api';
import type { GlossaryTerm } from '../../apiServices/api';
import { logger } from '../../utils/logger';

const Glossario: React.FC = () => {
  const [allTerms, setAllTerms] = useState<GlossaryTerm[]>([]);
  const [filteredTerms, setFilteredTerms] = useState<GlossaryTerm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useClickOutside<HTMLDivElement>(() => {
    setShowSuggestions(false);
  });

  // Alfabeto italiano
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Carica i dati dal backend
  useEffect(() => {
    const loadGlossary = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const terms = await glossaryApi.getAll();
        
        if (terms && Array.isArray(terms) && terms.length > 0) {
          
          // Mappa i dati dal backend al formato corretto
          const mappedTerms = terms.map((item: Partial<GlossaryTerm> & { 
            boomerWord?: string; 
            name?: string; 
            description?: string; 
            slangWord?: string;
          }) => {
            return {
              id: item.id || 0,
              term: item.term || item.boomerWord || item.name || '',
              definition: item.definition || item.description || item.slangWord || '',
              category: item.category || 'Generale',
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            };
          });
          
          setAllTerms(mappedTerms);
          setFilteredTerms(mappedTerms);
        } else {
          setError('Nessun termine disponibile nel glossario.');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
        
        // Se è un errore di rete, mostra un messaggio più specifico
        if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
          setError('Impossibile connettersi al server. Verifica che il backend sia in esecuzione.');
        } else {
          setError('Impossibile caricare il glossario. Riprova più tardi.');
        }
        
        // Inizializza comunque con array vuoto per evitare errori di rendering
        setAllTerms([]);
        setFilteredTerms([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadGlossary();
  }, []);

  // Funzione per filtrare i termini (memoizzata con useCallback)
  const filterTerms = useCallback(() => {
    let results: GlossaryTerm[] = [...allTerms];

    // Filtra per lettera selezionata
    if (selectedLetter) {
      results = results.filter(term => 
        term.term.toUpperCase().startsWith(selectedLetter)
      );
    }

    // Filtra per query di ricerca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(term =>
        term.term.toLowerCase().includes(query) ||
        term.definition.toLowerCase().includes(query)
      );
      // NON resettiamo più selectedLetter qui per evitare race conditions
      // Il reset viene gestito nell'onChange della ricerca
    }

    // Ordina alfabeticamente
    results.sort((a, b) => a.term.localeCompare(b.term, 'it'));

    setFilteredTerms(results);
  }, [allTerms, searchQuery, selectedLetter]);

  // Gestisce la selezione automatica del termine quando cambiano i risultati filtrati
  useEffect(() => {
    if (filteredTerms.length === 0) {
      setSelectedTerm(null);
      return;
    }

    setSelectedTerm((currentSelected) => {
      // Se c'è un termine selezionato e è ancora nei risultati filtrati, mantienilo
      const currentTermStillValid = currentSelected && filteredTerms.find(t => t.id === currentSelected.id);
      
      if (currentTermStillValid) {
        return currentSelected;
      }
      
      // Se c'è una lettera selezionata, seleziona il primo termine di quella lettera
      if (selectedLetter) {
        const firstTermForLetter = filteredTerms.find(t => 
          t.term.toUpperCase().startsWith(selectedLetter)
        );
        if (firstTermForLetter) {
          return firstTermForLetter;
        }
      }
      
      // Se non c'è una lettera selezionata (pulsante "Tutti"), seleziona il primo termine disponibile
      return filteredTerms[0];
    });
  }, [filteredTerms, selectedLetter]);

  // Seleziona automaticamente la lettera "A" SOLO quando i dati vengono caricati per la prima volta
  useEffect(() => {
    if (allTerms.length > 0 && !selectedLetter && !searchQuery.trim() && isFirstLoad) {
      // Verifica se ci sono termini che iniziano con "A"
      const hasTermsWithA = allTerms.some(term => 
        term.term.toUpperCase().startsWith('A')
      );
      if (hasTermsWithA) {
        setSelectedLetter('A');
      }
      setIsFirstLoad(false); // Impedisce che si riattivi dopo il primo caricamento
    }
    // RIMOSSO selectedLetter dalle dependencies per evitare loop infiniti
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTerms, isFirstLoad]);

  // Applica il filtro immediatamente quando cambia categoria o vengono caricati i dati
  useEffect(() => {
    // Applica il filtro immediatamente (usando i valori correnti di searchQuery)
    filterTerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTerms]);

  // Applica il filtro IMMEDIATAMENTE quando cambia la lettera selezionata (anche quando diventa '')
  useEffect(() => {
    if (selectedLetter) {
      logger.dev('🔤 Lettera cambiata, applico filtro:', selectedLetter);
    } else {
      logger.dev('🔤 Mostra tutti i termini (nessuna lettera selezionata)');
    }
    filterTerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLetter]);

  // Debounce per la ricerca: aspetta 500ms prima di filtrare
  const debouncedFilterTerms = useDebouncedCallback(() => {
    if (!searchQuery.trim()) {
      filterTerms();
      return;
    }
    filterTerms();
  }, 500);

  useEffect(() => {
    debouncedFilterTerms();
  }, [searchQuery, debouncedFilterTerms]);

  // Carica suggerimenti con debounce
  const loadSuggestions = useCallback(async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      logger.dev('Suggerimenti: query troppo corta o vuota');
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    logger.dev('Caricamento suggerimenti per:', searchQuery.trim());

    try {
      const suggestionsList = await glossaryApi.getSuggestions(searchQuery.trim(), 5);
      logger.dev('Suggerimenti ricevuti:', suggestionsList);
      logger.dev('Numero suggerimenti:', suggestionsList.length);
      setSuggestions(suggestionsList);
      setShowSuggestions(suggestionsList.length > 0);
      setSelectedSuggestionIndex(-1);
    } catch (error) {
      logger.error('Errore nel caricamento dei suggerimenti:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const debouncedLoadSuggestions = useDebouncedCallback(loadSuggestions, 300);

  useEffect(() => {
    debouncedLoadSuggestions();
  }, [debouncedLoadSuggestions]);


  // Scroll reveal animations standardizzate
  useScrollReveal('.glossario .scroll-reveal-item', {
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
    rootMargin: '0px'
  });

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleLetterClick = (letter: string) => {
    logger.dev('📌 Lettera cliccata:', letter);
    setSelectedLetter(letter);
    setSearchQuery(''); // Resetta la ricerca quando selezioni una lettera
    setShowSuggestions(false);
    // Il termine verrà selezionato automaticamente dal filterTerms
  };

  const handleShowAll = () => {
    logger.dev('📌 Mostra tutti i termini');
    setSelectedLetter('');
    setSearchQuery('');
    setShowSuggestions(false);
    // Il filtro verrà applicato automaticamente dal useEffect quando selectedLetter cambia
  };

  const handleTermClick = (term: GlossaryTerm) => {
    setSelectedTerm(term);
  };


  // Raggruppa i termini per lettera iniziale
  const termsByLetter = filteredTerms.reduce((acc, term) => {
    const firstLetter = term.term.toUpperCase()[0];
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(term);
    return acc;
  }, {} as Record<string, GlossaryTerm[]>);

  // Determina la lettera corrente e i termini da mostrare
  let currentLetter: string;
  let currentLetterTerms: GlossaryTerm[];
  
  if (selectedLetter) {
    // Se c'è una lettera selezionata, mostra solo i termini di quella lettera
    currentLetter = selectedLetter;
    currentLetterTerms = termsByLetter[currentLetter] || [];
  } else {
    // Se non c'è una lettera selezionata (pulsante "Tutti"), mostra tutti i termini
    currentLetter = 'Tutti';
    currentLetterTerms = filteredTerms;
  }


  return (
    <section className="glossario">
      <header className="glossario__intro scroll-reveal-item scroll-reveal-hidden">
        <h1 className="glossario__main-title scroll-reveal-item scroll-reveal-hidden">
          Glossario Digitale
        </h1>
        <p className="glossario__subtitle scroll-reveal-item scroll-reveal-hidden">
          Benvenuto nel Glossario - Qui troverai tutti i termini tecnici e le definizioni relative ai servizi pubblici digitali.
        </p>
      </header>

      {/* Griglia alfabetica */}
      <div className="glossario__alphabet-wrapper scroll-reveal-item scroll-reveal-hidden">
        <button
          type="button"
          className={`glossario__alphabet-letter glossario__alphabet-letter--all ${
            !selectedLetter ? 'glossario__alphabet-letter--active' : ''
          }`}
          onClick={handleShowAll}
          aria-label="Mostra tutti i termini"
        >
          Tutti
        </button>
        <div className="glossario__alphabet">
          {alphabet.map((letter) => {
            const hasTerms = allTerms.some(term => 
              term.term.toUpperCase().startsWith(letter)
            );
            return (
              <button
                key={letter}
                type="button"
                className={`glossario__alphabet-letter ${
                  selectedLetter === letter ? 'glossario__alphabet-letter--active' : ''
                } ${!hasTerms ? 'glossario__alphabet-letter--disabled' : ''}`}
                onClick={() => handleLetterClick(letter)}
                disabled={!hasTerms}
                aria-label={`Filtra per lettera ${letter}`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      <div className="glossario__filters scroll-reveal-item scroll-reveal-hidden">
        <div className="glossario__search">
          <label htmlFor="glossario-search-input" className="sr-only">
            Cerca un termine nel glossario
          </label>
          <div className="glossario__search-wrapper">
            <MagnifyingGlassIcon className="glossario__search-icon" aria-hidden="true" />
            <input
              ref={searchInputRef}
              id="glossario-search-input"
              type="text"
              placeholder="Cerca un termine..."
              value={searchQuery}
              onChange={(e) => {
                const newValue = e.target.value;
                setSearchQuery(newValue);
                setShowSuggestions(true);
                // Resetta la lettera selezionata quando l'utente inizia a cercare
                if (newValue.trim() && selectedLetter) {
                  logger.dev('🔍 Ricerca attiva, resetto lettera selezionata');
                  setSelectedLetter('');
                }
              }}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onKeyDown={handleKeyDown}
              className="glossario__search-input"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-controls="glossario-suggestions"
              aria-activedescendant={selectedSuggestionIndex >= 0 ? `glossario-suggestion-${selectedSuggestionIndex}` : undefined}
              aria-label="Cerca un termine nel glossario antifrode"
            />
            {searchQuery && (
              <button
                type="button"
                className="glossario__search-clear"
                onClick={() => {
                  setSearchQuery('');
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
              id="glossario-suggestions"
              className="glossario__suggestions"
              role="listbox"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  id={`glossario-suggestion-${index}`}
                  type="button"
                  className={`glossario__suggestion ${
                    index === selectedSuggestionIndex ? 'glossario__suggestion--selected' : ''
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setSelectedSuggestionIndex(index)}
                  role="option"
                  aria-selected={index === selectedSuggestionIndex}
                >
                  <MagnifyingGlassIcon className="glossario__suggestion-icon" aria-hidden="true" />
                  <span>{suggestion}</span>
                  {index === selectedSuggestionIndex && (
                    <CheckIcon className="glossario__suggestion-check" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="glossario__loading" role="status" aria-live="polite">
          <div className="glossario__loading-spinner"></div>
          <p>Caricamento del glossario...</p>
        </div>
      ) : error ? (
        <div className="glossario__error" role="alert" aria-live="assertive">
          <ExclamationTriangleIcon className="glossario__error-icon" aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : filteredTerms.length === 0 ? (
        <div className="glossario__no-results" role="status" aria-live="polite" aria-atomic="true">
          <InfoCircledIcon className="glossario__no-results-icon" aria-hidden="true" />
          <p>Nessun termine trovato. Prova a modificare la ricerca.</p>
        </div>
      ) : (
        <>
          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {filteredTerms.length === 1 
              ? `Trovato 1 termine` 
              : `Trovati ${filteredTerms.length} termini`}
          </div>
          <div className="glossario__content-wrapper scroll-reveal-item scroll-reveal-hidden">
            {/* Colonna sinistra - Lista termini */}
            <aside className="glossario__terms-list scroll-reveal-item scroll-reveal-hidden">
              <div className={`glossario__current-letter ${currentLetter === 'Tutti' ? 'glossario__current-letter--all' : ''}`}>
                {currentLetter}
              </div>
              <nav className="glossario__terms-nav" aria-label="Lista termini">
                {currentLetterTerms.map((term) => (
                  <button
                    key={term.id}
                    type="button"
                    className={`glossario__term-item ${
                      selectedTerm?.id === term.id ? 'glossario__term-item--active' : ''
                    }`}
                    onClick={() => handleTermClick(term)}
                  >
                    {term.term}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Colonna destra - Definizione */}
            <section className="glossario__definition scroll-reveal-item scroll-reveal-hidden" aria-label="Definizione termine">
              {selectedTerm ? (
                <article className="glossario__definition-content">
                  <h2 className="glossario__definition-term">{selectedTerm.term}:</h2>
                  <p className="glossario__definition-text">
                    {selectedTerm.definition || '(Descrizione non disponibile)'}
                  </p>
                </article>
              ) : (
                <div className="glossario__definition-empty">
                  <p>Seleziona un termine dalla lista per visualizzare la definizione</p>
                </div>
              )}
            </section>
          </div>
        </>
      )}

      {!isLoading && (
        <p className="glossario__count scroll-reveal-item scroll-reveal-hidden" role="status" aria-live="polite" aria-atomic="true">
          Mostrando {filteredTerms.length} di {allTerms.length} termini
        </p>
      )}
    </section>
  );
};

export default memo(Glossario);
