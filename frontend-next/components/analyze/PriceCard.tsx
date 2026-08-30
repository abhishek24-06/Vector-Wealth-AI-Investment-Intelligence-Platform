'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { Chip } from '@/components/ui/Chip';
import { useWatchlistStore } from '@/lib/hooks/useWatchlistStore';
import { formatCurrency, formatPriceChange } from '@/lib/utils/format';
import { getSentimentColor, getRecommendationColor, getRecommendationIcon } from '@/lib/utils/sentiment';
import type { AnalysisResult } from '@/lib/types/analysis';

interface PriceCardProps {
  result: AnalysisResult;
}

export function PriceCard({ result }: PriceCardProps) {
  const { isWatched, toggle } = useWatchlistStore();
  const hasPrice = result.currentPrice !== null;
  const isPositive = (result.priceChange ?? 0) >= 0;
  const watched = isWatched(result.ticker);

  return (
    <GlassCard>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold truncate">{result.ticker}</h3>
          {hasPrice ? (
            <>
              <div className="mt-2 text-3xl font-semibold">{formatCurrency(result.currentPrice)}</div>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <span className="font-medium" style={{ color: getSentimentColor(isPositive ? 1 : -1) }}>
                  {formatPriceChange(result.priceChange, result.priceChangePercent)}
                </span>
              </div>
            </>
          ) : (
            <p className="mt-2 text-muted-foreground">Price unavailable</p>
          )}
          {result.staleData && (
            <div className="mt-3 p-3 rounded-xl border text-sm" style={{ 
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              borderColor: 'rgba(251, 191, 36, 0.25)',
              color: '#FBBF24'
            }}>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{result.staleReason || 'Limited recent data available'}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
<Chip
            variant="outline"
            icon={<svg className={`w-4 h-4 ${watched ? 'text-yellow-400' : 'text-muted-foreground'}`} fill={watched ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674c.3.922-.755 1.688-1.538-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
            onClick={() => toggle(result.ticker)}
          >
            {watched ? 'Watching' : 'Watch'}
          </Chip>
          
          <div 
            className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5"
            style={{
              backgroundColor: `${getRecommendationColor(result.recommendation)}20`,
              borderColor: `${getRecommendationColor(result.recommendation)}40`,
              color: getRecommendationColor(result.recommendation),
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          >
            <span>{getRecommendationIcon(result.recommendation)}</span>
            <span>{result.recommendation.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

