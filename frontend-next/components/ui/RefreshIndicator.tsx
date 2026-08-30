'use client';

import { useState, useRef, useEffect } from 'react';
import { ReactNode } from 'react';

interface RefreshIndicatorProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
}

export function RefreshIndicator({ onRefresh, children, threshold = 80 }: RefreshIndicatorProps) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (refreshing) return;
    const scrollTop = containerRef.current?.scrollTop ?? 0;
    if (scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pulling || refreshing) return;
    const distance = e.touches[0].clientY - startY.current;
    if (distance > 0) {
      e.preventDefault();
      const clamped = Math.min(distance * 0.5, threshold * 1.5);
      setPullDistance(clamped);
    }
  };

  const handleTouchEnd = async () => {
    if (!pulling || refreshing) return;
    setPulling(false);
    
    if (pullDistance >= threshold) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPullDistance(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        transform: pulling ? `translateY(${pullDistance}px)` : undefined,
        transition: pulling ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
    >
      {pulling && pullDistance > 10 && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none"
          style={{ height: pullDistance, top: -pullDistance }}
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg 
              className="w-5 h-5 transition-transform duration-200" 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ 
                transform: pullDistance >= threshold ? 'rotate(180deg)' : 'rotate(0deg)',
                color: pullDistance >= threshold ? 'var(--accent)' : 'currentColor'
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span>{pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}</span>
          </div>
        </div>
      )}
      
      {refreshing && (
        <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-center pointer-events-none border-b" style={{ 
          borderColor: 'var(--border)',
          backgroundColor: 'var(--bg)',
        }}>
          <svg className="animate-spin w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}
      
      <div style={{ paddingTop: refreshing ? '48px' : 0 }}>
        {children}
      </div>
    </div>
  );
}

