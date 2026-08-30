'use client';

interface WelcomeViewProps {
  onSuggestionTap: (text: string) => void;
}

const SUGGESTIONS = [
  { icon: '', text: 'How is TCS doing today?' },
  { icon: '', text: 'Compare INFY vs WIPRO' },
  { icon: '', text: "What's happening in the banking sector?" },
  { icon: '', text: 'Show me bullish opportunities' },
  { icon: '', text: 'Explain what PE ratio means' },
  { icon: '', text: 'Best IT stocks to watch?' },
];

export function WelcomeView({ onSuggestionTap }: WelcomeViewProps) {
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="mb-8">
        <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center" style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.2), rgba(52, 211, 153, 0.2))'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(52, 211, 153, 0.15))',
        }}>
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accentIndigo)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-center mb-2">Stock Research Assistant</h3>
      <p className="text-muted-foreground text-center mb-8 max-w-xs">
        Ask me about stocks, sectors, market trends, or financial concepts.
      </p>
      
      <div className="w-full max-w-md">
        <p className="text-xs font-medium text-muted-foreground text-center mb-3">Try asking...</p>
        <div className="flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => onSuggestionTap(s.text)}
              className="px-3 py-2 rounded-xl text-sm transition-all hover:scale-105"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                borderWidth: '1px',
                borderStyle: 'solid',
              }}
            >
              <span className="flex items-center gap-1.5">
                <span>{s.icon}</span>
                <span>{s.text}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

