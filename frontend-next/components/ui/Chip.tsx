'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface ChipProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'filled';
  icon?: ReactNode;
  avatar?: ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

export function Chip({ 
  children, 
  className, 
  onClick, 
  variant = 'default', 
  icon, 
  avatar, 
  removable, 
  onRemove 
}: ChipProps) {
  const isDark = document.documentElement.classList.contains('dark');
  
  const variantStyles = {
    default: isDark 
      ? 'bg-white/10 text-white border-white/10 hover:bg-white/15' 
      : 'bg-gray-100 text-gray-900 border-gray-200 hover:bg-gray-200',
    outline: isDark 
      ? 'bg-transparent text-white border-white/20 hover:bg-white/10' 
      : 'bg-transparent text-gray-700 border-gray-300 hover:bg-gray-50',
    filled: isDark 
      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
      : 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const baseStyles = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200';

  return (
    <div 
      className={cn(baseStyles, variantStyles[variant], onClick && 'cursor-pointer', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {avatar && <span className="flex items-center">{avatar}</span>}
      {icon && <span className="flex items-center">{icon}</span>}
      <span>{children}</span>
      {removable && onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-1 p-0.5 rounded-full hover:bg-black/10 hover:bg-white/10 transition-colors"
          aria-label="Remove"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

