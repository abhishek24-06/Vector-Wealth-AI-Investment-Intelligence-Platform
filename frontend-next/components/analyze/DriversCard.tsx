'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import type { AnalysisResult } from '@/lib/types/analysis';

export function DriversCard({ result }: { result: AnalysisResult }) {
  const positiveDrivers = Array.isArray(result.positiveDrivers)
    ? result.positiveDrivers
    : [];

  const negativeDrivers = Array.isArray(result.negativeDrivers)
    ? result.negativeDrivers
    : [];

  const hasPositive = positiveDrivers.length > 0;
  const hasNegative = negativeDrivers.length > 0;

  if (!hasPositive && !hasNegative) {
    return null;
  }

  return (
    <GlassCard>
      <h3 className="font-semibold text-base mb-4">Key Drivers</h3>

      {hasPositive && (
        <div className="mb-4">
          <div
            className="flex items-center gap-2 text-sm font-medium mb-2"
            style={{ color: '#34D399' }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>

            <span>Positive</span>
          </div>

          <div className="space-y-1 ml-6">
            {positiveDrivers.slice(0, 3).map((driver, i) => (
              <div
                key={i}
                className="text-sm text-muted-foreground flex items-start gap-1.5"
              >
                <span className="text-green-500">•</span>
                <span>{driver}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasPositive && hasNegative && (
        <div className="h-px bg-white/10 dark:bg-white/5 my-3" />
      )}

      {hasNegative && (
        <div>
          <div
            className="flex items-center gap-2 text-sm font-medium mb-2"
            style={{ color: '#F87171' }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>

            <span>Negative</span>
          </div>

          <div className="space-y-1 ml-6">
            {negativeDrivers.slice(0, 3).map((driver, i) => (
              <div
                key={i}
                className="text-sm text-muted-foreground flex items-start gap-1.5"
              >
                <span className="text-red-500">•</span>
                <span>{driver}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}