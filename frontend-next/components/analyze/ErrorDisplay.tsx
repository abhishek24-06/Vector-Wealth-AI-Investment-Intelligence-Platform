'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils/cn';

interface ErrorDisplayProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorDisplay({ message, onDismiss, className }: ErrorDisplayProps) {
  return (
    <GlassCard className={cn("border-red-500/30 bg-red-500/10", className)}>
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-sm text-red-300 flex-1">{message}</p>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="p-1 rounded hover:bg-white/10 transition-colors text-red-400"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </GlassCard>
  );
}

