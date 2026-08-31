'use client';

import type { ChatMessage } from '@/lib/types/chat';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isDark = document.documentElement.classList.contains('dark');
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex gap-3 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && (
        <div
          className="flex-shrink-0 mt-1 p-1.5 rounded-lg"
          style={{
            background:
              'linear-gradient(135deg, var(--accentIndigo), var(--accentEmerald))',
          }}
        >
          <svg
            className="w-3.5 h-3.5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser ? 'rounded-br-md' : 'rounded-bl-md'
        }`}
        style={{
          backgroundColor: isUser
            ? 'var(--accentIndigo)'
            : isDark
              ? '#1A1D2E'
              : '#FFFFFF',
          border: isUser
            ? 'none'
            : isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid var(--accentIndigo)20',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <p
          className={`whitespace-pre-wrap leading-relaxed ${
            isUser ? 'text-gray-900' : 'text-foreground'
          }`}
          style={{
            fontSize: '14px',
            lineHeight: '1.45',
          }}
        >
          {message.content}
        </p>
      </div>

      {isUser && <div className="w-8" />}
    </div>
  );
}