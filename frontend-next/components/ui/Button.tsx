'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'tonal';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const isDark = document.documentElement.classList.contains('dark');
    
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantStyles = {
      primary: `
        bg-gradient-to-r from-indigo-500 to-teal-500 text-white
        hover:from-indigo-600 hover:to-teal-600
        focus:ring-indigo-500/50
        shadow-lg shadow-indigo-500/25
      `,
      secondary: `
        ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}
        hover:${isDark ? 'bg-white/15' : 'bg-gray-200'}
        focus:ring-${isDark ? 'white/20' : 'gray-400'}
        border ${isDark ? 'border-white/10' : 'border-gray-200'}
      `,
      outline: `
        ${isDark ? 'bg-transparent text-white border-white/20' : 'bg-transparent text-gray-700 border-gray-300'}
        hover:${isDark ? 'bg-white/10' : 'bg-gray-50'}
        focus:ring-${isDark ? 'white/20' : 'gray-400'}
      `,
      ghost: `
        ${isDark ? 'bg-transparent text-white' : 'bg-transparent text-gray-700'}
        hover:${isDark ? 'bg-white/10' : 'bg-gray-100'}
        focus:ring-${isDark ? 'white/20' : 'gray-400'}
      `,
      tonal: `
        ${isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200'}
        hover:${isDark ? 'bg-green-500/30' : 'bg-green-100'}
        focus:ring-green-500/50
      `,
    };
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-5 py-2.5 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

