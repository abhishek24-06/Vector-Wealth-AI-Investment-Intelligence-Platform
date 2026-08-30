'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { WelcomeView } from '@/components/chat/WelcomeView';
import { ChatInput } from '@/components/chat/ChatInput';
import { useChat } from '@/providers/ChatProvider';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function ChatPage() {
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    clearChat 
  } = useChat();
  
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 flex-shrink-0" style={{
        backgroundColor: isDark ? 'rgba(8, 11, 22, 0.8)' : 'rgba(240, 240, 245, 0.8)',
        backdropFilter: 'blur(24px)',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)',
      }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ 
            background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
          }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Research Assistant</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-2 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-muted-foreground"
            aria-label="Clear chat"
            disabled={messages.length === 0 && !isLoading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{ 
          scrollBehavior: 'smooth',
        }}
      >
        {messages.length === 0 && !isLoading ? (
          <WelcomeView onSuggestionTap={(text) => { setInputValue(text); handleSend(); }} />
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatBubble key={index} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={endRef} />
          </>
        )}
      </div>

      {/* Input */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        isLoading={isLoading}
      />
    </div>
  );
}


