'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { formatDate } from '@/lib/utils/format';
import type { AnalysisResult } from '@/lib/types/analysis';

export function NewsCard({ result }: { result: AnalysisResult }) {
  const newsReferences = Array.isArray(result.newsReferences)
    ? result.newsReferences
    : [];

  if (newsReferences.length === 0) {
    return null;
  }

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: 'var(--accentIndigo)' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>

        <h3 className="font-semibold text-base">Recent News</h3>
      </div>

      <div className="space-y-3">
        {newsReferences.slice(0, 5).map((item, i) => (
          <div
            key={i}
            className="py-2 border-t border-white/10 dark:border-white/5 first:border-0 first:pt-0"
          >
            <p className="text-sm line-clamp-2">
              {item.title}
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(item.date)}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}