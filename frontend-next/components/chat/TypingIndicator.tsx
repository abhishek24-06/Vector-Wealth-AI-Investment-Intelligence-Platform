'use client';

import { useState, useEffect, useRef } from 'react';

export function TypingIndicator() {
  const [dots, setDots] = useState([0, 1, 2]);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setDots(prev => prev.map((_, i) => (i + 1) % 3));
    }, 400);
    return () => clearInterval(intervalRef.current);
  }, []);

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-1 p-1.5 rounded-lg" style={{
        background: 'linear-gradient(135deg, var(--accentIndigo), var(--accentEmerald))',
      }}>
        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      
      <div className={`flex items-center gap-1 px-4 py-3 rounded-2xl rounded-bl-md`} style={{
        backgroundColor: isDark ? '#1A1D2E' : '#FFFFFF',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--accentIndigo)20',
      }}>
        {dots.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: 'var(--accentIndigo)',
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

