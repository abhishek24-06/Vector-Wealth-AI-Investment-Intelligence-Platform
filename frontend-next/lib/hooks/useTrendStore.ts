import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Goal } from '@/lib/types/portfolio';

export interface TrendEntry {
  date: string;
  sentiment: number;
  recommendation: string;
}

interface TrendState {
  trends: Record<string, TrendEntry[]>;
  recordAnalysis: (ticker: string, sentiment: number, recommendation: string) => void;
  getTrend: (ticker: string) => TrendEntry[];
  hasTrend: (ticker: string) => boolean;
}

export const useTrendStore = create<TrendState>()(
  persist(
    (set, get) => ({
      trends: {},
      
      recordAnalysis: (ticker: string, sentiment: number, recommendation: string) => {
        const upper = ticker.toUpperCase();
        set(state => {
          const existing = state.trends[upper] || [];
          const newEntry: TrendEntry = {
            date: new Date().toISOString().split('T')[0],
            sentiment,
            recommendation,
          };
          const updated = [...existing, newEntry].slice(-20);
          return { trends: { ...state.trends, [upper]: updated } };
        });
      },
      
      getTrend: (ticker: string) => {
        return get().trends[ticker.toUpperCase()] || [];
      },
      
      hasTrend: (ticker: string) => {
        return get().trends[ticker.toUpperCase()]?.length >= 2 || false;
      },
    }),
    {
      name: 'vector-wealth-sentiment-trends',
    }
  )
);