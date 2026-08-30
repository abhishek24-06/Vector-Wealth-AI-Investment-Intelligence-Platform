'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { POPULAR_TICKERS } from '@/lib/config';
import { cn } from '@/lib/utils/cn';

interface TickerSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  onAnalyze: (ticker?: string) => void;
  recentTickers: string[];
  onRecentTap: (ticker: string) => void;
}

export function TickerSearchField({ 
  value, 
  onChange, 
  isLoading, 
  onAnalyze, 
  recentTickers, 
  onRecentTap 
}: TickerSearchFieldProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredTickers, setFilteredTickers] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const query = value.trim().toUpperCase();
    if (!query) {
      setFilteredTickers([]);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      return;
    }
    const matches = POPULAR_TICKERS
      .filter(t => t.includes(query))
      .slice(0, 6);
    setFilteredTickers(matches);
    setShowSuggestions(matches.length > 0);
    setHighlightedIndex(-1);
  }, [value]);

  const handleSelect = (ticker: string) => {
    onChange(ticker);
    onAnalyze(ticker);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If suggestions are visible and one is highlighted, select it
      if (showSuggestions && highlightedIndex >= 0 && filteredTickers[highlightedIndex]) {
        handleSelect(filteredTickers[highlightedIndex]);
      } else {
        onAnalyze(value);
      }
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showSuggestions && filteredTickers.length > 0) {
        setHighlightedIndex(prev => (prev + 1) % filteredTickers.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showSuggestions && filteredTickers.length > 0) {
        setHighlightedIndex(prev => (prev - 1 + filteredTickers.length) % filteredTickers.length);
      }
    }
  };

  const handleFocus = () => {
    if (filteredTickers.length > 0) setShowSuggestions(true);
  };

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <GlassCard ref={containerRef}>
      <h3 className="text-lg font-bold mb-4">Stock Analysis</h3>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Enter Stock Ticker"
          className={cn(
            'w-full px-4 py-3 rounded-xl text-lg font-medium transition-all',
            'bg-white/60 dark:bg-white/10',
            'border border-gray-300/40 dark:border-white/10',
            'placeholder:text-muted-foreground/60',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent',
            'text-uppercase'
          )}
          autoComplete="off"
          spellCheck={false}
        />
        
        {showSuggestions && filteredTickers.length > 0 && (
          <div className={cn(
            'absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-lg z-50 overflow-hidden',
            'bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm',
            'border-gray-300/40 dark:border-white/10'
          )}>
            {filteredTickers.map((ticker, index) => (
              <button
                key={ticker}
                onClick={() => handleSelect(ticker)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  'w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex items-center gap-3',
                  index === highlightedIndex && 'bg-indigo-500/10 dark:bg-indigo-500/20'
                )}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accentIndigo)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-semibold">{ticker}</span>
              </button>
            ))}
          </div>
        )}

        {/* Highlighted suggestion indicator (for keyboard users) */}
        {showSuggestions && highlightedIndex >= 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-1 px-2 text-xs text-muted-foreground text-center">
            Press Enter to select "{filteredTickers[highlightedIndex]}"
          </div>
        )}

      </div>

      {recentTickers.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {recentTickers.map((ticker) => (
              <Chip
                key={ticker}
                variant="outline"
                icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accentIndigo)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                onClick={() => onRecentTap(ticker)}
              >
                {ticker}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <Button 
        className="w-full mt-4" 
        size="lg" 
        loading={isLoading}
        onClick={() => onAnalyze(value)}
        disabled={isLoading || !value.trim()}
      >
        {isLoading ? 'Analyzing...' : 'Deep Analysis'}
      </Button>
    </GlassCard>
  );
}
