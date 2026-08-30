'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { getSentimentColor } from '@/lib/utils/sentiment';
import { useAnalysis } from '@/providers/AnalysisProvider';
import type { Opportunity } from '@/lib/types/opportunity';

interface OpportunityCardProps {
  opportunity: Opportunity;
  rank: number;
}

function getRankColor(rank: number): string {
  switch (rank) {
    case 1:
      return 'bg-amber-500';
    case 2:
      return 'bg-gray-400';
    case 3:
      return 'bg-amber-700';
    default:
      return 'bg-indigo-400';
  }
}

function formatTimeAgo(isoString: string | null | undefined): string {
  if (!isoString) return '';

  try {
    const date = new Date(isoString);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    return `${diffDays}d ago`;
  } catch {
    return '';
  }
}

export function OpportunityCard({
  opportunity,
  rank,
}: OpportunityCardProps) {
  const { analyzeTicker } = useAnalysis();

  const isDark =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  const sentiment =
    opportunity.sentiment != null &&
    Number.isFinite(opportunity.sentiment)
      ? opportunity.sentiment
      : null;

  const currentPrice =
    opportunity.currentPrice != null &&
    Number.isFinite(opportunity.currentPrice)
      ? opportunity.currentPrice
      : null;

  const priceChangePercent =
    opportunity.priceChangePercent != null &&
    Number.isFinite(opportunity.priceChangePercent)
      ? opportunity.priceChangePercent
      : null;

  const confidence =
    opportunity.confidence != null &&
    Number.isFinite(opportunity.confidence)
      ? opportunity.confidence
      : null;

  const newsCount =
    opportunity.newsCount != null &&
    Number.isFinite(opportunity.newsCount)
      ? opportunity.newsCount
      : 0;

  const headlines = Array.isArray(opportunity.headlines)
    ? opportunity.headlines
    : [];

  const sentimentColor =
    sentiment !== null
      ? getSentimentColor(sentiment)
      : 'var(--muted-foreground)';

  const pricePositive =
    priceChangePercent !== null
      ? priceChangePercent >= 0
      : true;

  const handleAnalyze = () => {
    analyzeTicker(opportunity.ticker);

    window.dispatchEvent(
      new CustomEvent('switch-tab', {
        detail: { tab: 0 },
      })
    );
  };

  return (
    <GlassCard
      onClick={handleAnalyze}
      className="cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {/* Rank badge */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getRankColor(
            rank
          )} text-white text-xs font-bold`}
        >
          #{rank}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-lg truncate">
                  {opportunity.ticker}
                </h4>

                {currentPrice !== null && (
                  <span className="text-sm font-medium text-teal-400 dark:text-teal-300 whitespace-nowrap">
                    ₹{currentPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="mt-1 flex items-center gap-3 flex-wrap text-sm">
                <span
                  className="flex items-center gap-1 font-medium"
                  style={{ color: sentimentColor }}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>

                  {sentiment !== null
                    ? `${sentiment >= 0 ? '+' : ''}${sentiment.toFixed(2)}`
                    : '—'}
                </span>

                {priceChangePercent !== null && (
                  <span
                    className="font-bold"
                    style={{
                      color: pricePositive
                        ? '#34D399'
                        : '#F87171',
                    }}
                  >
                    {priceChangePercent >= 0 ? '+' : ''}
                    {priceChangePercent.toFixed(2)}%
                  </span>
                )}

                <span className="flex items-center gap-1 text-muted-foreground">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>

                  {newsCount} articles
                </span>
              </div>
            </div>

            <Chip
              variant="filled"
              className="flex-shrink-0"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: '#34D399' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              BUY
            </Chip>
          </div>

          {/* AI Reasoning */}
          {opportunity.reasoning && (
            <div className="mt-3 flex gap-3">
              <svg
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--accentIndigo)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>

              <p className="text-sm text-muted-foreground/90 leading-relaxed">
                {opportunity.reasoning}
              </p>
            </div>
          )}

          {/* Headlines */}
          {headlines.length > 0 && (
            <div className="mt-3 space-y-1">
              <p className="text-xs text-muted-foreground">
                Latest Headlines:
              </p>

              {headlines.slice(0, 2).map((headline, i) => (
                <p
                  key={i}
                  className="text-sm text-muted-foreground/80 truncate flex items-center gap-1"
                >
                  <span>•</span>
                  {headline}
                </p>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Chip
                variant="outline"
                icon={
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              >
                {formatTimeAgo(opportunity.scannedAt)}
              </Chip>

              <Chip
                variant="outline"
                icon={
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 00-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                }
              >
                Confidence:{' '}
                {confidence !== null
                  ? `${(confidence * 100).toFixed(0)}%`
                  : '—'}
              </Chip>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleAnalyze();
              }}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 002 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Deep Analyze
            </Button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}