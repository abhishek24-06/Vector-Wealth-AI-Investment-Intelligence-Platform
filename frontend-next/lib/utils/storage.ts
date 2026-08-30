export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
}

export function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
}

// Specific storage keys
export const STORAGE_KEYS = {
  THEME: 'vector-wealth-theme',
  WATCHLIST: 'vector-wealth-watchlist',
  SENTIMENT_TRENDS: 'vector-wealth-sentiment-trends',
  CHAT_HISTORY: 'vector-wealth-chat-history',
  CHAT_SESSION: 'vector-wealth-chat-session',
} as const;