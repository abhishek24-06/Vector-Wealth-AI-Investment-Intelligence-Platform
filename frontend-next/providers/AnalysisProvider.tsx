'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { analyzeTicker } from '@/lib/api/endpoints';
import type { AnalysisResult, AnalysisState } from '@/lib/types/analysis';
import { STORAGE_KEYS } from '@/lib/utils/storage';
import { getLocalStorage, setLocalStorage } from '@/lib/utils/storage';

interface AnalysisContextType extends AnalysisState {
  analyzeTicker: (ticker: string) => Promise<void>;
  clearError: () => void;
  recordRecentTicker: (ticker: string) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AnalysisState>({
    isLoading: false,
    error: null,
    result: null,
    recentTickers: [],
  });

  const loadRecentTickers = useCallback(() => {
    const stored = getLocalStorage<string[]>(STORAGE_KEYS.THEME, []);
    // This is wrong - should use a different key
  }, []);

  const analyzeTickerAction = useCallback(async (ticker: string) => {
    const cleanTicker = ticker.trim().toUpperCase();
    if (!cleanTicker) {
      setState(prev => ({ ...prev, error: 'Please enter a stock ticker.', result: null }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await analyzeTicker(cleanTicker);
      setState(prev => ({ ...prev, isLoading: false, result }));
      
      // Record recent ticker
      const recent = getLocalStorage<string[]>('vector-wealth-recent-tickers', []);
      const updated = [cleanTicker, ...recent.filter(t => t !== cleanTicker)].slice(0, 10);
      setLocalStorage('vector-wealth-recent-tickers', updated);
      setState(prev => ({ ...prev, recentTickers: updated }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to analyze';
      setState(prev => ({ ...prev, isLoading: false, error: message, result: null }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const recordRecentTicker = useCallback((ticker: string) => {
    const recent = getLocalStorage<string[]>('vector-wealth-recent-tickers', []);
    const updated = [ticker, ...recent.filter(t => t !== ticker)].slice(0, 10);
    setLocalStorage('vector-wealth-recent-tickers', updated);
    setState(prev => ({ ...prev, recentTickers: updated }));
  }, []);

  // Load recent tickers on mount
  useState(() => {
    const recent = getLocalStorage<string[]>('vector-wealth-recent-tickers', []);
    setState(prev => ({ ...prev, recentTickers: recent }));
  });

  return (
    <AnalysisContext.Provider value={{ ...state, analyzeTicker: analyzeTickerAction, clearError, recordRecentTicker }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}