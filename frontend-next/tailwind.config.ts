import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme
        bgPrimary: '#080B16',
        accentIndigo: '#818CF8',
        accentEmerald: '#34D399',
        textPrimary: '#F1F5F9',
        textSecondary: '#94A3B8',
        // Light theme
        lightBg: '#F0F0F5',
        lightAccent: '#6366F1',
        lightTextPrimary: '#0F172A',
        lightTextSecondary: '#64748B',
        // Semantic colors
        sentimentPositive: '#34D399',
        sentimentNegative: '#F87171',
        sentimentNeutral: '#F59E0B',
        // Glass card
        glassDark: 'rgba(255, 255, 255, 0.06)',
        glassLight: 'rgba(255, 255, 255, 0.60)',
        glassBorderDark: 'rgba(255, 255, 255, 0.10)',
        glassBorderLight: 'rgba(200, 200, 212, 0.40)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
        'card-sm': '14px',
        'chip': '10px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        'glass': '24px',
        'glass-light': '16px',
      },
    },
  },
  plugins: [],
};

export default config;