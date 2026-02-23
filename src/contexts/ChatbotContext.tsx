/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";

interface ChatbotContextType {
  isOpen: boolean;
  openChatbot: (initialMessage?: string) => void;
  closeChatbot: () => void;
  initialMessage: string | null;
  clearInitialMessage: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const ChatbotProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);

  const openChatbot = useCallback((message?: string) => {
    if (message) {
      setInitialMessage(message);
    }
    setIsOpen(true);
  }, []);
  
  const closeChatbot = useCallback(() => {
    setIsOpen(false);
    setInitialMessage(null);
  }, []);

  const clearInitialMessage = useCallback(() => {
    setInitialMessage(null);
  }, []);

  const value = useMemo(() => ({
    isOpen,
    openChatbot,
    closeChatbot,
    initialMessage,
    clearInitialMessage
  }), [isOpen, openChatbot, closeChatbot, initialMessage, clearInitialMessage]);

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within ChatbotProvider");
  }
  return context;
};
