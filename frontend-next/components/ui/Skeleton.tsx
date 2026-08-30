'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
  height?: number | string;
  width?: number | string;
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const radiusMap = {
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  full: 'rounded-full',
};

export function Skeleton({ className, height = '100%', width = '100%', borderRadius = 'md' }: SkeletonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isDark = document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (!ref.current) return;
    
    const gradient = isDark
      ? 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.02) 75%)'
      : 'linear-gradient(90deg, rgba(200,200,212,0.4) 25%, rgba(200,200,212,0.6) 50%, rgba(200,200,212,0.4) 75%)';
    
    ref.current.style.background = gradient;
    ref.current.style.backgroundSize = '200% 100%';
    ref.current.style.animation = 'shimmer 1.5s infinite';
  }, [isDark]);

  return (
    <div
      ref={ref}
      className={cn(radiusMap[borderRadius], className)}
      style={{ height, width }}
    />
  );
}

export function SkeletonCard({ height = 120, className }: { height?: number; className?: string }) {
  return (
    <div className={cn('bg-white/60 dark:bg-white/6 backdrop-blur-[24px] rounded-2xl border', 
      'dark:border-white/10 border-gray-300/40', className)}>
      <Skeleton height={height} width="100%" borderRadius="xl" />
    </div>
  );
}

