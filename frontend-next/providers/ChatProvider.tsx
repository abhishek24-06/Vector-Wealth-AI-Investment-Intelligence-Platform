'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { sendChatMessage, loadChatHistory } from '@/lib/api/endpoints';
import type { ChatMessage, ChatRequest, ChatState } from '@/lib/types/chat';
import { getLocalStorage, setLocalStorage } from '@/lib/utils/storage';

const CHAT_HISTORY_KEY = 'vector-wealth-chat-history';
const CHAT_SESSION_KEY = 'vector-wealth-chat-session';
const MAX_PERSISTED_MESSAGES = 50;

interface ChatContextType extends ChatState {
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
  loadHistory: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ 
  children, 
  getPortfolioData 
}: { 
  children: ReactNode; 
  getPortfolioData?: () => any[];
}) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    sessionId: '',
  });

  const loadHistory = useCallback(async () => {
    try {
      // Load session ID
      let sessionId = getLocalStorage<string>(CHAT_SESSION_KEY, '');
      if (!sessionId) {
        sessionId = `session_${Date.now()}`;
        setLocalStorage(CHAT_SESSION_KEY, sessionId);
      }

      // Load local messages first
      const localMessages = getLocalStorage<ChatMessage[]>(CHAT_HISTORY_KEY, []);
      if (localMessages.length > 0) {
        setState(prev => ({ ...prev, messages: localMessages, sessionId }));
      }

      // Try backend if local is empty
      if (localMessages.length === 0) {
        try {
          const response = await loadChatHistory(sessionId);
          if (response.messages.length > 0) {
            setState(prev => ({ ...prev, messages: response.messages, sessionId }));
            setLocalStorage(CHAT_HISTORY_KEY, response.messages);
          }
        } catch {
          // Backend not reachable
        }
      } else {
        setState(prev => ({ ...prev, sessionId }));
      }
    } catch {
      // Start fresh
      const sessionId = `session_${Date.now()}`;
      setState(prev => ({ ...prev, sessionId }));
    }
  }, []);

  const saveLocal = useCallback((messages: ChatMessage[]) => {
    const toSave = messages.length > MAX_PERSISTED_MESSAGES 
      ? messages.slice(-MAX_PERSISTED_MESSAGES) 
      : messages;
    setLocalStorage(CHAT_HISTORY_KEY, toSave);
  }, []);

  const saveToStorage = useCallback(async (messages: ChatMessage[], sessionId: string) => {
    saveLocal(messages);
    try {
      await sendChatMessage({ session_id: sessionId, message: '', context_data: { messages } });
    } catch {
      // Silently fail
    }
  }, [saveLocal]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setState(prev => ({ 
      ...prev, 
      messages: [...prev.messages, userMsg], 
      isLoading: true, 
      error: null 
    }));

    try {
      const portfolio = getPortfolioData?.() || [];
      const payload: ChatRequest = {
        message: trimmed,
        session_id: state.sessionId,
        context_data: portfolio.length > 0 ? { portfolio } : undefined,
      };

      const data = await sendChatMessage(payload);
      const assistantMsg: ChatMessage = {
        role: data.role as 'user' | 'assistant',
        content: data.content,
        timestamp: data.timestamp,
        data: data.data,
      };

      setState(prev => {
        const newMessages = [...prev.messages, assistantMsg];
        saveLocal(newMessages);
        return { ...prev, messages: newMessages, isLoading: false };
      });

      // Also sync to backend
      try {
        await sendChatMessage({ 
          session_id: state.sessionId, 
          message: '', 
          context_data: { messages: [...state.messages, userMsg, assistantMsg] } 
        });
      } catch {}
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed';
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: error instanceof Error && error.message.includes('503') 
          ? message 
          : `Sorry, something went wrong: ${message}`,
        timestamp: new Date().toISOString(),
      };
      setState(prev => {
        const newMessages = [...prev.messages, errorMsg];
        saveLocal(newMessages);
        return { ...prev, messages: newMessages, isLoading: false, error: message };
      });
    }
  }, [state.sessionId, state.messages, getPortfolioData, saveLocal]);

  const clearChat = useCallback(() => {
    const newSessionId = `session_${Date.now()}`;
    setState(prev => ({ ...prev, messages: [], error: null, sessionId: newSessionId }));
    setLocalStorage(CHAT_HISTORY_KEY, []);
    setLocalStorage(CHAT_SESSION_KEY, newSessionId);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <ChatContext.Provider value={{ ...state, sendMessage, clearChat, loadHistory }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}