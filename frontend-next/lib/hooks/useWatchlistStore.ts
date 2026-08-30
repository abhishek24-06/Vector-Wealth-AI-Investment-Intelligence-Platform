import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchlistState {
  tickers: string[];
  isWatched: (ticker: string) => boolean;
  toggle: (ticker: string) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      tickers: [],
      
      isWatched: (ticker: string) => {
        return get().tickers.includes(ticker.toUpperCase());
      },
      
      toggle: (ticker: string) => {
        const upper = ticker.toUpperCase();
        set(state => {
          if (state.tickers.includes(upper)) {
            return { tickers: state.tickers.filter(t => t !== upper) };
          } else {
            const updated = [upper, ...state.tickers].slice(0, 20);
            return { tickers: updated };
          }
        });
      },
    }),
    {
      name: 'vector-wealth-watchlist',
    }
  )
);