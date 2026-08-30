'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  ref?: React.Ref<HTMLDivElement>;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl';
  skipBlur?: boolean;
}

const paddingMap = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const radiusMap = {
  sm: 'rounded-xl',
  md: 'rounded-2xl',
  lg: 'rounded-3xl',
  xl: 'rounded-[28px]',
};

export function GlassCard({ 
  children, 
  className, 
  style,
  onClick, 
  ref,
  padding = 'md', 
  borderRadius = 'lg',
  skipBlur = false,
}: GlassCardProps) {
  const isDark = document.documentElement.classList.contains('dark');
  
  const baseStyles = `
    ${paddingMap[padding]} ${radiusMap[borderRadius]}
    border transition-all duration-200
    ${isDark 
      ? 'bg-white/6 border-white/10' 
      : 'bg-white/60 border-gray-300/40'
    }
    ${skipBlur ? '' : 'backdrop-blur-[24px]'}
  `;

  const content = (
    <div ref={ref} className={cn(baseStyles, className)} style={style}>
      {children}
    </div>
  );

  if (onClick) {
    return (
      <button 
        onClick={onClick} 
        className={cn('w-full text-left focus:outline-none focus:ring-2 focus:ring-indigo-500/50', radiusMap[borderRadius])}
      >
        {content}
      </button>
    );
  }

  return content;
}

