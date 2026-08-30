'use client';

import { useState, useRef, useEffect } from 'react';
import { RefreshIndicator } from '@/components/ui/RefreshIndicator';
import { TickerSearchField } from '@/components/analyze/TickerSearchField';
import { ErrorDisplay } from '@/components/analyze/ErrorDisplay';
import { AnimatedResults } from '@/components/analyze/AnimatedResults';
import { AnalysisSkeleton } from '@/components/analyze/AnalysisSkeleton';
import { useAnalysis } from '@/providers/AnalysisProvider';
import { useWatchlistStore } from '@/lib/hooks/useWatchlistStore';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function AnalyzePage() {
  const { 
    isLoading, 
    error, 
    result, 
    recentTickers, 
    analyzeTicker, 
    clearError,
    recordRecentTicker 
  } = useAnalysis();
  const { tickers: watchlistTickers } = useWatchlistStore();
  const [tickerInput, setTickerInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Pull to refresh
  const onRefresh = async () => {
    if (tickerInput.trim()) {
      await analyzeTicker(tickerInput);
    }
  };

  // Handle recent ticker tap
  const handleRecentTap = (ticker: string) => {
    setTickerInput(ticker);
    analyzeTicker(ticker);
    recordRecentTicker(ticker);
  };

  // Handle watchlist tap
  const handleWatchlistTap = (ticker: string) => {
    setTickerInput(ticker);
    analyzeTicker(ticker);
  };

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3" style={{
        backgroundColor: isDark ? 'rgba(8, 11, 22, 0.8)' : 'rgba(240, 240, 245, 0.8)',
        backdropFilter: 'blur(24px)',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)',
      }}>
        <h1 className="text-xl font-bold">Vector Wealth</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <RefreshIndicator onRefresh={onRefresh}>
        <div ref={scrollRef} className="px-4 pb-24">
          {/* Watchlist */}
          {watchlistTickers.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Watchlist
              </div>
              <div className="flex flex-wrap gap-2">
                {watchlistTickers.slice(0, 8).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleWatchlistTap(t)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                    style={{
                      backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)',
                      color: '#FBBF24',
                      border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(251, 191, 36, 0.15)',
                    }}
                  >
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      {t}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <TickerSearchField
            value={tickerInput}
            onChange={setTickerInput}
            isLoading={isLoading}
            onAnalyze={(ticker) => analyzeTicker(ticker ?? tickerInput)}
            recentTickers={recentTickers}
            onRecentTap={handleRecentTap}
          />

          {/* Error */}
          {error && (
            <ErrorDisplay message={error} onDismiss={clearError} className="mt-4" />
          )}

          {/* Loading Skeleton */}
          {isLoading && <AnalysisSkeleton className="mt-4" />}

          {/* Results */}
          {result && !isLoading && (
            <AnimatedResults key={result.ticker} result={result} />
          )}

          {/* Empty state */}
          {!result && !isLoading && !error && !tickerInput && (
            <div className="mt-12 text-center text-muted-foreground">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-lg font-medium">Enter a stock ticker to begin analysis</p>
              <p className="text-sm mt-1">Try RELIANCE, TCS, HDFCBANK, or any NSE/BSE symbol</p>
            </div>
          )}
        </div>
      </RefreshIndicator>
    </div>
  );
}


