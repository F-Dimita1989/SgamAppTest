// src/components/ChatbotModal/ChatbotModal.tsx

import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import { useChatbot } from "../../contexts/ChatbotContext";
import { analyzeText, checkServerStatus } from "../../apiServices/apiService";
import { sanitizeHTML, sanitizeInput } from "../../utils/sanitize";
import { validateFile } from "../../utils/fileValidation";
import { showNotification } from "../../utils/notifications";
import { logger } from "../../utils/logger";
import {
  ImageIcon,
  PaperPlaneIcon,
  Cross2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import "./ChatbotModal.css";
import sgamyLogo from "../../assets/SGAMY_ICONA.webp";

interface Message {
  type: "user" | "bot";
  text: string;
  imageUrl?: string;
  score?: string;
  id?: string; // ID univoco per identificare i messaggi da eliminare
}

const STORAGE_KEY = "sgamapp_chatbot_messages";
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limite per sessionStorage
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB limite per immagini base64

// Funzione per validare e sanitizzare un messaggio prima del salvataggio
const sanitizeMessageForStorage = (message: Message): Message | null => {
  try {
    // Valida struttura base
    if (!message || typeof message !== "object") {
      return null;
    }

    // Valida tipo
    if (message.type !== "user" && message.type !== "bot") {
      return null;
    }

    // Sanitizza il testo
    if (message.text && typeof message.text === "string") {
      // Per i messaggi utente, usa sanitizeInput (rimuove tutto HTML)
      // Per i messaggi bot, usa sanitizeHTML (mantiene formattazione base)
      message.text =
        message.type === "user"
          ? sanitizeInput(message.text)
          : sanitizeHTML(message.text);

      // Limita lunghezza testo (prevenzione DoS)
      if (message.text.length > 10000) {
        message.text = message.text.substring(0, 10000);
      }
    } else {
      message.text = "";
    }

    // Valida e sanitizza imageUrl (base64)
    if (message.imageUrl && typeof message.imageUrl === "string") {
      // Verifica che sia un data URI valido
      if (!message.imageUrl.startsWith("data:image/")) {
        logger.warn("Tentativo di salvare URL immagine non valido");
        message.imageUrl = undefined;
      } else {
        // Limita dimensione immagine base64 (prevenzione DoS)
        if (message.imageUrl.length > MAX_IMAGE_SIZE) {
          logger.warn("Immagine troppo grande, rimossa dal salvataggio");
          message.imageUrl = undefined;
        }
      }
    }

    // Valida score
    if (message.score && typeof message.score !== "string") {
      message.score = undefined;
    }

    // Valida ID
    if (message.id && typeof message.id !== "string") {
      message.id = undefined;
    }

    return message;
  } catch (error) {
    logger.error("Errore nella sanitizzazione del messaggio:", error);
    return null;
  }
};

// Funzione per salvare i messaggi in sessionStorage
const saveMessagesToStorage = (messages: Message[]) => {
  try {
    // Salva tutti i messaggi tranne il messaggio di benvenuto iniziale
    const messagesToSave = messages
      .filter((m, index) => m.id || index > 0)
      .map((m) => sanitizeMessageForStorage(m))
      .filter((m): m is Message => m !== null);

    // Controlla dimensione totale prima di salvare
    const dataToSave = JSON.stringify(messagesToSave);
    if (dataToSave.length > MAX_STORAGE_SIZE) {
      logger.warn(
        "Dati troppo grandi per sessionStorage, rimuovo messaggi più vecchi"
      );
      // Rimuovi i messaggi più vecchi fino a rientrare nel limite
      const trimmed = [...messagesToSave];
      while (
        JSON.stringify(trimmed).length > MAX_STORAGE_SIZE &&
        trimmed.length > 0
      ) {
        trimmed.shift();
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } else {
      sessionStorage.setItem(STORAGE_KEY, dataToSave);
    }
  } catch (error) {
    // Se sessionStorage è pieno o c'è un errore, pulisci e riprova
    if (error instanceof DOMException && error.code === 22) {
      logger.warn("sessionStorage pieno, pulizia dati vecchi");
      try {
        sessionStorage.removeItem(STORAGE_KEY);
        // Prova a salvare solo gli ultimi 10 messaggi
        const lastMessages = messages
          .filter((m, index) => m.id || index > 0)
          .slice(-10)
          .map((m) => sanitizeMessageForStorage(m))
          .filter((m): m is Message => m !== null);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lastMessages));
      } catch (retryError) {
        logger.error("Impossibile salvare in sessionStorage:", retryError);
      }
    } else {
      logger.error("Errore nel salvataggio dei messaggi:", error);
    }
  }
};

// Funzione per caricare i messaggi da sessionStorage
const loadMessagesFromStorage = (): Message[] => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [];
    }

    // Valida dimensione dati caricati
    if (saved.length > MAX_STORAGE_SIZE) {
      logger.warn("Dati corrotti in sessionStorage, pulizia");
      sessionStorage.removeItem(STORAGE_KEY);
      return [];
    }

    const parsed = JSON.parse(saved);

    // Valida che sia un array
    if (!Array.isArray(parsed)) {
      logger.warn("Dati non validi in sessionStorage, pulizia");
      sessionStorage.removeItem(STORAGE_KEY);
      return [];
    }

    // Sanitizza ogni messaggio caricato (doppia protezione)
    const sanitized = parsed
      .map((m: unknown) => sanitizeMessageForStorage(m as Message))
      .filter((m): m is Message => m !== null);

    return sanitized;
  } catch (error) {
    logger.error("Errore nel caricamento dei messaggi:", error);
    // In caso di errore, pulisci i dati corrotti
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignora errori di pulizia
    }
    return [];
  }
};

// Funzione per generare un ID univoco
const generateMessageId = (): string => {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const ChatbotModal: React.FC = memo(() => {
  const { isOpen, closeChatbot, initialMessage, clearInitialMessage } =
    useChatbot();
  
  const welcomeMessage: Message = useMemo(() => ({
    type: "bot",
    text: "Ciao! Sono Sgamy, il tuo assistente di SgamApp. Come posso aiutarti oggi? Puoi inviare immagini, testi e messaggi per ricevere una valutazione della sicurezza.",
  }), []);

  const [messages, setMessages] = useState<Message[]>(() => [welcomeMessage]);

  const [inputMessage, setInputMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<
    number | null
  >(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const hasSentInitialMessage = useRef(false);
  const apiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const isInteractingWithFormRef = useRef(false);

  // Blocca lo scroll del body quando il modale è aperto (previene scroll indesiderato su mobile)
  useEffect(() => {
    if (isOpen) {
      // Rileva se siamo su mobile
      const isMobile = window.innerWidth <= 768;

      // Salva la posizione di scroll corrente
      const scrollY =
        window.pageYOffset || document.documentElement.scrollTop || 0;

      // Blocca lo scroll del body
      const body = document.body;
      const html = document.documentElement;

      // Su mobile: scrolla istantaneamente in alto per rendere il modale visibile
      if (isMobile) {
        // Scroll immediato verso l'alto (senza animazione)
        window.scrollTo(0, 0);
        
        // Blocca lo scroll con posizione fissa in alto
        body.style.overflow = "hidden";
        body.style.position = "fixed";
        body.style.top = "0px";
        body.style.width = "100%";
        html.style.overflow = "hidden";
      } else {
        // Desktop: blocca lo scroll mantenendo la posizione corrente
        body.style.overflow = "hidden";
        body.style.position = "fixed";
        body.style.top = `-${scrollY}px`;
        body.style.width = "100%";
        html.style.overflow = "hidden";
      }

      // Piccolo delay per permettere al browser di applicare lo stato iniziale
      // prima di attivare l'animazione (ottimizzazione per Chrome mobile)
      // Usa doppio requestAnimationFrame per garantire che il layout sia completato
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (modalRef.current) {
            modalRef.current.classList.add("animate-in");
            // Forza il reflow per garantire transizioni fluide
            void modalRef.current.offsetHeight;
          }
        });
      });

      return () => {
        // Ripristina lo scroll quando il modale si chiude
        body.style.overflow = "";
        body.style.position = "";
        body.style.top = "";
        body.style.width = "";
        html.style.overflow = "";

        // Rimuovi classe animazione
        if (modalRef.current) {
          modalRef.current.classList.remove("animate-in");
        }

        // Desktop: ripristina la posizione di scroll originale
        if (!isMobile && scrollY > 0) {
          window.scrollTo(0, scrollY);
        }
        // Su mobile rimaniamo in alto per migliore UX dopo la chiusura
      };
    }
  }, [isOpen]);

  // Focus management: salva elemento attivo prima di aprire e ripristina alla chiusura
  useEffect(() => {
    if (isOpen) {
      // Salva l'elemento che aveva il focus prima di aprire il modale
      previousActiveElementRef.current = document.activeElement as HTMLElement;

      // Focus sul bottone di chiusura o sull'input dopo un breve delay
      // Usa un delay più lungo per evitare scroll automatico su mobile
      setTimeout(() => {
        if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        } else if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
    } else {
      // Ripristina il focus all'elemento precedente quando si chiude
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
        previousActiveElementRef.current = null;
      }
    }
  }, [isOpen]);

  // Focus trap per il modale
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal || !isOpen) return;

    const getFocusableElements = (): HTMLElement[] => {
      const selector =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      return Array.from(modal.querySelectorAll<HTMLElement>(selector));
    };

    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeChatbot();
        return;
      }

      if (e.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab: andare indietro
        if (activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: andare avanti
        if (activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modal.addEventListener("keydown", handleKeyboard);
    return () => modal.removeEventListener("keydown", handleKeyboard);
  }, [isOpen, closeChatbot]);

  // Scroll automatico ai messaggi solo quando necessario, senza causare scroll della pagina
  useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      // Usa scrollTop invece di scrollIntoView per evitare scroll della pagina
      // Delay per permettere al DOM di aggiornarsi
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages, isOpen]);

  // Rileva quando la tastiera è aperta/chiusa (mobile)
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const input = inputRef.current;
    if (!input) return;

    // Usa Visual Viewport API se disponibile (migliore per mobile)
    const handleViewportResize = () => {
      if (window.visualViewport && modalRef.current) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        // Se il viewport è significativamente più piccolo della finestra, la tastiera è aperta
        const keyboardThreshold = windowHeight * 0.75; // 75% dell'altezza originale
        const keyboardIsOpen = viewportHeight < keyboardThreshold;
        const wasKeyboardClosed = !isKeyboardOpen && keyboardIsOpen;
        
        setIsKeyboardOpen(keyboardIsOpen);

        // Quando la tastiera si apre, scrolla solo i messaggi (non il modale)
        if (wasKeyboardClosed && messagesContainerRef.current) {
          // Usa requestAnimationFrame per garantire che le transizioni CSS siano completate
          requestAnimationFrame(() => {
            setTimeout(() => {
              if (messagesContainerRef.current) {
                // Scroll fluido all'ultimo messaggio - solo il container dei messaggi
                messagesContainerRef.current.scrollTo({
                  top: messagesContainerRef.current.scrollHeight,
                  behavior: 'smooth'
                });
              }
              // NON usare scrollIntoView sull'input per evitare che il modale si muova
              // Il modale resta fermo, solo i messaggi scrollano
            }, 300); // Delay ridotto per risposta più rapida
          });
        }
      }
    };

    // Fallback: rileva focus/blur sull'input
    const handleInputFocus = () => {
      setIsKeyboardOpen(true);
      // Scrolla solo i messaggi quando l'input riceve focus (non il modale)
      // Usa requestAnimationFrame per garantire transizioni fluide
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (input && document.activeElement === input && messagesContainerRef.current) {
            // Scrolla solo all'interno del container dei messaggi, non la pagina
            // Questo mantiene il modale fermo nella sua posizione
            messagesContainerRef.current.scrollTo({
              top: messagesContainerRef.current.scrollHeight,
              behavior: 'smooth'
            });
          }
          // NON usare scrollIntoView per evitare che il modale si muova
        }, 300); // Delay ridotto per risposta più rapida
      });
    };

    const handleInputBlur = () => {
      // Delay per permettere al browser di gestire il blur
      setTimeout(() => {
        if (window.visualViewport) {
          const viewportHeight = window.visualViewport.height;
          const windowHeight = window.innerHeight;
          const keyboardThreshold = windowHeight * 0.75;
          setIsKeyboardOpen(viewportHeight < keyboardThreshold);
        } else {
          setIsKeyboardOpen(false);
        }
      }, 100);
    };

    // Aggiungi listener per Visual Viewport API
    // Usa solo resize per evitare movimenti indesiderati del modale
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportResize);
      // Rimosso scroll listener - può causare movimenti indesiderati del modale
    }

    // Aggiungi listener per focus/blur
    input.addEventListener("focus", handleInputFocus);
    input.addEventListener("blur", handleInputBlur);

    // Cleanup
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleViewportResize
        );
        // Rimosso scroll listener cleanup
      }
      input.removeEventListener("focus", handleInputFocus);
      input.removeEventListener("blur", handleInputBlur);
    };
  }, [isOpen]);

  // Carica i messaggi salvati quando il modale si apre
  useEffect(() => {
    if (isOpen) {
      const savedMessages = loadMessagesFromStorage();
      if (savedMessages.length > 0) {
        // Ricostruisci la chat con il messaggio di benvenuto e i messaggi salvati
        setMessages([welcomeMessage, ...savedMessages]);
      } else {
        setMessages([welcomeMessage]);
      }
      hasSentInitialMessage.current = false;
    }
  }, [isOpen]);

  // Salva i messaggi ogni volta che cambiano (solo quando il modale è aperto)
  useEffect(() => {
    if (isOpen && messages.length > 1) {
      // Salva solo se ci sono messaggi oltre al messaggio di benvenuto
      saveMessagesToStorage(messages);
    }
  }, [messages, isOpen]);

  // Gestisci messaggio iniziale quando il modale è aperto
  useEffect(() => {
    if (isOpen && initialMessage && !hasSentInitialMessage.current) {
      const messageToSend = initialMessage.trim();

      if (messageToSend) {
        hasSentInitialMessage.current = true;

        // Salva il messaggio nel ref
        const savedMessage = messageToSend;

        // STEP 1: Mostra il messaggio di benvenuto e il messaggio utente
        const userMessage: Message = {
          type: "user",
          text: savedMessage,
          id: generateMessageId(),
        };

        // Carica i messaggi salvati e aggiungi il nuovo
        const savedMessages = loadMessagesFromStorage();
        setMessages([welcomeMessage, ...savedMessages, userMessage]);

        // STEP 2: Invia il messaggio all'API dopo un breve delay
        apiTimeoutRef.current = setTimeout(async () => {
          setIsLoading(true);

          try {
            const botResponse = await analyzeText(savedMessage, null);

            if (!isOpen) {
              return;
            }

            if (
              botResponse &&
              botResponse.text &&
              botResponse.text.trim().length > 0
            ) {
              setServerStatus("online");
              setMessages((prev) => {
                const newBotMessage: Message = {
                  type: "bot",
                  text: botResponse.text.trim(),
                  score: botResponse.score,
                  id: generateMessageId(),
                };
                return [...prev, newBotMessage];
              });
            } else {
              setMessages((prev) => [
                ...prev,
                {
                  type: "bot",
                  text: "Mi dispiace, non ho ricevuto una risposta valida dal server.",
                  id: generateMessageId(),
                },
              ]);
            }
          } catch (error) {
            logger.error("Errore nella chiamata API:", error);

            if (!isOpen) return;

            setServerStatus("offline");
            setMessages((prev) => [
              ...prev,
              {
                type: "bot",
                text: "Si è verificato un errore durante la comunicazione con il server. Riprova più tardi.",
                id: generateMessageId(),
              },
            ]);
          } finally {
            if (isOpen) {
              setIsLoading(false);
            }
            // Pulisci il messaggio iniziale dal context DOPO che l'API è stata chiamata
            clearInitialMessage();
            apiTimeoutRef.current = null;
          }
        }, 500);

        return () => {
          if (apiTimeoutRef.current) {
            clearTimeout(apiTimeoutRef.current);
            apiTimeoutRef.current = null;
          }
        };
      }
    }
  }, [isOpen, initialMessage, clearInitialMessage]);

  // Funzione per leggere un messaggio specifico
  const speakMessage = (text: string, messageIndex: number) => {
    if (!text) return;

    // Verifica che speechSynthesis sia disponibile
    if (!window.speechSynthesis) {
      logger.warn("SpeechSynthesis non disponibile su questo browser");
      return;
    }

    // Se questo messaggio sta già parlando, fermalo
    if (speakingMessageIndex === messageIndex) {
      window.speechSynthesis.cancel();
      setSpeakingMessageIndex(null);
      return;
    }

    // Ferma qualsiasi altro parlato in corso
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "it-IT";
    utterance.rate = 0.95; // Velocità naturale e rilassata
    utterance.pitch = 0.9; // Pitch leggermente basso per voce maschile naturale
    utterance.volume = 1;

    // Usa la voce selezionata dall'utente
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setSpeakingMessageIndex(messageIndex);
    utterance.onend = () => setSpeakingMessageIndex(null);
    utterance.onerror = () => setSpeakingMessageIndex(null);

    window.speechSynthesis.speak(utterance);
  };

  // Ferma il parlato quando si chiude il modal
  useEffect(() => {
    if (!isOpen && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingMessageIndex(null);
    }
  }, [isOpen]);

  // Carica le voci quando il componente si monta
  useEffect(() => {
    // Verifica che speechSynthesis sia disponibile
    if (!window.speechSynthesis) {
      logger.warn("SpeechSynthesis non disponibile su questo browser");
      return;
    }

    const loadVoices = () => {
      if (!window.speechSynthesis) return;

      const voices = window.speechSynthesis.getVoices();
      const italianVoices = voices.filter((voice) =>
        voice.lang.startsWith("it")
      );

      // Seleziona automaticamente la prima voce italiana se non ne è stata scelta una
      if (italianVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(italianVoices[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Cleanup
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedVoice]);

  // Controlla lo stato del server quando il chatbot si apre
  useEffect(() => {
    if (isOpen) {
      const checkServer = async () => {
        logger.dev("Chatbot: Verifico se Sgamy è sveglio...");
        setServerStatus("checking");
        const isOnline = await checkServerStatus();
        logger.dev(
          `Chatbot: Server ${isOnline ? "ONLINE" : "OFFLINE (dormendo)"}`
        );
        setServerStatus(isOnline ? "online" : "offline");
      };
      checkServer();
    }
  }, [isOpen]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validazione completa del file (tipo, dimensione, magic bytes)
    const validation = await validateFile(file, {
      allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      maxSizeMB: 10,
    });

    if (!validation.valid) {
      showNotification(
        validation.error ||
          "File non valido. Per favore seleziona un'immagine valida (JPEG, PNG, GIF o WebP) di massimo 10MB.",
        "error"
      );
      // Pulisci l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setSelectedImage(file);

    // Crea preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.onerror = () => {
      showNotification(
        "Errore nel caricamento dell'immagine. Riprova con un altro file.",
        "error"
      );
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const getScoreColor = (score: string): "green" | "yellow" | "red" => {
    const scoreLower = score.toLowerCase().trim();

    // Verifica colori diretti
    if (
      scoreLower === "green" ||
      scoreLower === "verde" ||
      scoreLower === "safe" ||
      scoreLower === "sicuro"
    ) {
      return "green";
    }
    if (
      scoreLower === "yellow" ||
      scoreLower === "giallo" ||
      scoreLower === "warning" ||
      scoreLower === "attenzione"
    ) {
      return "yellow";
    }
    if (
      scoreLower === "red" ||
      scoreLower === "rosso" ||
      scoreLower === "danger" ||
      scoreLower === "pericolo" ||
      scoreLower === "rischioso"
    ) {
      return "red";
    }

    // Se è un numero, usa una logica basata sul valore
    const numScore = parseFloat(scoreLower);
    if (!isNaN(numScore)) {
      if (numScore >= 0 && numScore < 0.4) return "green";
      if (numScore >= 0.4 && numScore < 0.7) return "yellow";
      if (numScore >= 0.7) return "red";
    }

    // Default: giallo se non riconosciuto
    return "yellow";
  };

  const getScoreLabel = (score: string): string => {
    const color = getScoreColor(score);

    if (color === "green") return "SICURO";
    if (color === "yellow") return "ATTENZIONE";
    if (color === "red") return "RISCHIOSO";

    return `Score: ${score}`;
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage.trim();
    if ((!textToSend && !selectedImage) || isLoading) return;

    const userText = textToSend;
    const userImageUrl = imagePreview;

    // Aggiungi messaggio utente con eventuale immagine
    const newUserMessage: Message = {
      type: "user",
      text: userText || "Immagine caricata",
      imageUrl: userImageUrl || undefined,
      id: generateMessageId(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // Pulisci l'input solo se non è un messaggio esterno
    if (!messageText) {
      setInputMessage("");
    }
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsLoading(true);

    try {
      const botResponse = await analyzeText(
        userText || "Analizza questa immagine",
        imageToSend
      );
      logger.dev("📨 Risposta chatbot:", botResponse);

      // Controlla se il componente è ancora montato prima di aggiornare lo stato
      if (!isOpen) return;

      if (
        botResponse &&
        botResponse.text &&
        botResponse.text.trim().length > 0
      ) {
        // Server ha risposto correttamente
        setServerStatus("online");
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: botResponse.text.trim(),
            score: botResponse.score,
            id: generateMessageId(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "Mi dispiace, non ho ricevuto una risposta valida dal server.",
            id: generateMessageId(),
          },
        ]);
      }
    } catch (error) {
      logger.error("Errore nella chiamata API:", error);

      // Controlla se il componente è ancora montato prima di aggiornare lo stato
      if (!isOpen) return;

      // Solo ora segna il server come offline
      setServerStatus("offline");
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Si è verificato un errore durante la comunicazione con il server. Riprova più tardi.",
          id: generateMessageId(),
        },
      ]);
    } finally {
      // Controlla se il componente è ancora montato prima di aggiornare lo stato
      if (isOpen) {
        setIsLoading(false);
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage();
  };

  // Funzione per eliminare tutta la chat
  const handleClearChat = useCallback(() => {
    setMessages([welcomeMessage]);
    // Pulisci anche lo storage
    if (isOpen) {
      saveMessagesToStorage([welcomeMessage]);
    }
  }, [welcomeMessage, isOpen]);

  // Gestisce il click sull'overlay per chiudere il modale
  // Usa mousedown invece di click per evitare conflitti con focus su mobile
  const handleOverlayMouseDown = useCallback((e: React.MouseEvent) => {
    // Non chiudere se si sta interagendo con il form
    if (isInteractingWithFormRef.current) {
      return;
    }
    // Chiudi solo se il click è direttamente sull'overlay, non su elementi figli
    if (e.target === e.currentTarget) {
      e.preventDefault();
      closeChatbot();
    }
  }, [closeChatbot]);

  // Gestisce il touch sull'overlay (solo per overlay, non per elementi interni)
  const handleOverlayTouchStart = useCallback((e: React.TouchEvent) => {
    // Non chiudere se si sta interagendo con il form
    if (isInteractingWithFormRef.current) {
      return;
    }
    // Chiudi solo se il touch è direttamente sull'overlay
    if (e.target === e.currentTarget) {
      // Verifica che non sia un elemento interattivo
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || 
          target.tagName === 'BUTTON' || 
          target.tagName === 'TEXTAREA' ||
          target.closest('.chatbot-modal') ||
          target.closest('.chatbot-input-form') ||
          target.closest('input') ||
          target.closest('button') ||
          target.closest('form')) {
        return;
      }
      closeChatbot();
    }
  }, [closeChatbot]);

  if (!isOpen) return null;

  return (
    <div
      className={`chatbot-modal-overlay ${isOpen ? "is-open" : ""}`}
      onMouseDown={handleOverlayMouseDown}
      onTouchStart={handleOverlayTouchStart}
    >
      <div
        ref={modalRef}
        className={`chatbot-modal ${isKeyboardOpen ? "keyboard-open" : ""}`}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="chatbot-title"
        aria-describedby="chatbot-subtitle"
        aria-modal="true"
      >
        <header className="chatbot-modal-header">
          <div className="chatbot-header-content">
            <img
              src={sgamyLogo}
              alt="Logo di Sgamy, assistente virtuale di SgamApp per la sicurezza digitale"
              className="chatbot-logo"
              loading="lazy"
              width="48"
              height="48"
            />
            <div>
              <h2 id="chatbot-title" className="chatbot-title">
                Sgamy
              </h2>
              <p id="chatbot-subtitle" className="chatbot-subtitle">
                Il tuo assistente digitale
              </p>
            </div>
          </div>
          <div className="chatbot-header-actions">
            {serverStatus === "checking" && (
              <div className="server-status server-status-checking">
                <span className="status-indicator"></span>
                <span className="status-text">Verifica connessione...</span>
              </div>
            )}
            {serverStatus === "online" && (
              <div className="server-status server-status-online">
                <span className="status-indicator"></span>
                <span className="status-text">Sgamy è operativo!</span>
              </div>
            )}
            {serverStatus === "offline" && (
              <div className="server-status server-status-offline">
                <span className="status-indicator"></span>
                <span className="status-text">
                  Sgamy sta dormendo... zzz...
                </span>
              </div>
            )}
            <button
              type="button"
              className="chatbot-clear-chat-btn"
              onClick={handleClearChat}
              aria-label="Elimina tutta la chat"
              title="Elimina tutta la chat"
            >
              <TrashIcon
                className="chatbot-clear-chat-icon"
                aria-hidden="true"
              />
            </button>
            <button
              ref={closeButtonRef}
              type="button"
              className="chatbot-close-btn"
              onClick={closeChatbot}
              aria-label="Chiudi assistente digitale"
            >
              <Cross2Icon className="chatbot-close-icon" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div
          ref={messagesContainerRef}
          className="chatbot-messages"
          role="log"
          aria-live="polite"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {messages.map((m, i) => (
            <div
              key={m.id || `msg-${i}-${m.type}-${m.text.substring(0, 10)}`}
              className={`chatbot-message ${
                m.type === "user" ? "user-message" : "bot-message"
              }`}
            >
              {m.type === "bot" && (
                <img
                  src={sgamyLogo}
                  alt="Avatar di Sgamy, assistente virtuale che sta rispondendo al messaggio"
                  className="message-avatar"
                  loading="lazy"
                  width="48"
                  height="48"
                />
              )}
              <div className="message-content">
                {m.imageUrl && (
                  <div className="message-image-container">
                    <img
                      src={m.imageUrl}
                      alt="Immagine caricata dall'utente nel messaggio per l'analisi di sicurezza"
                      className="message-image"
                      loading="lazy"
                      width="300"
                      height="300"
                    />
                  </div>
                )}
                {m.type === "bot" && m.score && (
                  <div
                    className={`score-alert score-alert-${getScoreColor(
                      m.score
                    )}`}
                  >
                    {getScoreLabel(m.score)}
                  </div>
                )}
                <p
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(
                      m.text.replace(/SgamApp/g, "<strong>SgamApp</strong>")
                    ),
                  }}
                ></p>
                {m.type === "bot" && (
                  <button
                    type="button"
                    className={`message-speak-btn ${
                      speakingMessageIndex === i ? "speaking" : ""
                    }`}
                    onClick={() => speakMessage(m.text, i)}
                    aria-label={
                      speakingMessageIndex === i
                        ? "Ferma lettura"
                        : "Ascolta questo messaggio"
                    }
                    title={
                      speakingMessageIndex === i
                        ? "Ferma lettura"
                        : "Ascolta messaggio"
                    }
                  >
                    {speakingMessageIndex === i ? "Ferma" : "Ascolta"}
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chatbot-message bot-message">
              <img
                src={sgamyLogo}
                alt="Avatar di Sgamy, assistente virtuale che sta elaborando la risposta"
                className="message-avatar"
                loading="lazy"
                width="48"
                height="48"
              />
              <div className="message-content">
                <p className="typing-indicator">Sgamy sta scrivendo...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form 
          className="chatbot-input-form" 
          onSubmit={handleSend}
          onMouseDown={(e) => {
            e.stopPropagation();
            isInteractingWithFormRef.current = true;
          }}
          onClick={(e) => {
            e.stopPropagation();
            isInteractingWithFormRef.current = true;
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            isInteractingWithFormRef.current = true;
            // Non preventDefault per permettere il focus
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            isInteractingWithFormRef.current = true;
          }}
        >
          {imagePreview && (
            <div className="image-preview-container">
              <div className="image-preview">
                <img
                  src={imagePreview}
                  alt="Anteprima dell'immagine selezionata da caricare per l'analisi di sicurezza"
                  loading="lazy"
                  width="300"
                  height="300"
                />
              </div>
              <button
                type="button"
                className="remove-image-btn"
                onClick={handleRemoveImage}
                aria-label="Rimuovi immagine"
              >
                <Cross2Icon />
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="chatbot-file-input"
            id="chatbot-file-input"
            aria-label="Carica immagine"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          />
          <label
            htmlFor="chatbot-file-input"
            className="chatbot-file-label"
            title="Carica immagine"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <ImageIcon />
          </label>
          <label htmlFor="chatbot-message-input" className="sr-only">
            Scrivi un messaggio
          </label>
          <input
            id="chatbot-message-input"
            ref={inputRef}
            type="text"
            className="chatbot-input"
            placeholder={
              selectedImage
                ? "Scrivi un messaggio (opzionale)..."
                : "Scrivi un messaggio..."
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onMouseDown={(e) => {
              e.stopPropagation();
              isInteractingWithFormRef.current = true;
              // Permetti il focus normale
            }}
            onClick={(e) => {
              e.stopPropagation();
              isInteractingWithFormRef.current = true;
              // Assicura che l'input riceva il focus
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }}
            onFocus={(e) => {
              e.stopPropagation();
              isInteractingWithFormRef.current = true;
              // Previeni la chiusura quando l'input riceve focus
            }}
            onBlur={() => {
              // Reset dopo un breve delay per permettere altri click nel form
              setTimeout(() => {
                isInteractingWithFormRef.current = false;
              }, 200);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              isInteractingWithFormRef.current = true;
              // Non preventDefault qui, altrimenti blocca il focus
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              isInteractingWithFormRef.current = true;
              // Assicura che l'input riceva il focus dopo il touch
              setTimeout(() => {
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }, 0);
            }}
            autoComplete="off"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="chatbot-send-btn"
            aria-label="Invia messaggio"
            title="Invia messaggio"
            disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <PaperPlaneIcon />
          </button>
        </form>
      </div>
    </div>
  );
});

ChatbotModal.displayName = 'ChatbotModal';

export default ChatbotModal;
