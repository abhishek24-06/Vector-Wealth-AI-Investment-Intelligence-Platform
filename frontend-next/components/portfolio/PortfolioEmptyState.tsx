'use client';

import { Button } from '@/components/ui/Button';

interface PortfolioEmptyStateProps {
  onAdd: () => void;
}

export function PortfolioEmptyState({ onAdd }: PortfolioEmptyStateProps) {
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="mb-6 p-5 rounded-full" style={{
        background: isDark 
          ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.15), rgba(52, 211, 153, 0.15))'
          : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(52, 211, 153, 0.1))',
      }}>
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accentIndigo)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold mb-2">Set Your Financial Goals</h3>
      <p className="text-muted-foreground text-center max-w-xs mb-6">
        Create goals like retirement, car, or education. Assign stocks and get AI-powered portfolio analysis.
      </p>
      <Button size="lg" onClick={onAdd}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create First Goal
      </Button>
    </div>
  );
}

