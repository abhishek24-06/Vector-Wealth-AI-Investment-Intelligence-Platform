'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import {
  STORAGE_KEYS,
  getLocalStorage,
  setLocalStorage,
} from '@/lib/utils/storage';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export const ThemeContext = createContext<
  ThemeContextType | undefined
>(undefined);

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<ThemeMode>('light');

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);

    if (typeof document !== 'undefined') {
      const stored = getLocalStorage(
        STORAGE_KEYS.THEME,
        'light'
      ) as ThemeMode;

      setThemeState(stored);

      document.documentElement.classList.toggle(
        'dark',
        stored === 'dark'
      );
    }
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);

    setLocalStorage(
      STORAGE_KEYS.THEME,
      newTheme
    );

    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle(
        'dark',
        newTheme === 'dark'
      );
    }
  };

  const toggleTheme = () => {
    setTheme(
      theme === 'dark'
        ? 'light'
        : 'dark'
    );
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(
    ThemeContext
  );

  if (!context) {
    throw new Error(
      'useTheme must be used within a ThemeProvider'
    );
  }

  return context;
}