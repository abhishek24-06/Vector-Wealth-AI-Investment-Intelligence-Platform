'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import {
  getSentimentColor,
  getSentimentLabel,
} from '@/lib/utils/sentiment';
import type { AnalysisResult } from '@/lib/types/analysis';

interface MetricChipProps {
  label: string;
  value: string;
  color: string;
}

function MetricChip({ label, value, color }: MetricChipProps) {
  return (
    <div
      className="flex-1 px-4 py-3 rounded-xl text-center"
      style={{
        backgroundColor: `${color}20`,
        borderColor: `${color}40`,
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
    >
      <div className="font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">
        {label}
      </div>
    </div>
  );
}

interface SentimentGaugeProps {
  value: number | null | undefined;
}

function SentimentGauge({ value }: SentimentGaugeProps) {
  // Gracefully handle missing sentiment data.
  if (value == null || !Number.isFinite(value)) {
    return (
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
          <span className="text-sm font-bold text-muted-foreground">
            —
          </span>
        </div>

        <div>
          <div className="font-medium text-sm">Overall Sentiment</div>
          <div className="font-semibold text-lg mt-0.5 text-muted-foreground">
            Unavailable
          </div>
        </div>
      </div>
    );
  }

  const normalized = (value + 1) / 2;
  const color = getSentimentColor(value);
  const label = getSentimentLabel(value);
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle
            className={isDark ? 'text-white/10' : 'text-black/10'}
            cx="32"
            cy="32"
            r="28"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
          />

          <circle
            className="transition-all duration-1000 ease-out"
            style={{
              stroke: color,
              strokeDashoffset: 176 * (1 - normalized),
            }}
            cx="32"
            cy="32"
            r="28"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="176"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold" style={{ color }}>
            {value.toFixed(2)}
          </span>
        </div>
      </div>

      <div>
        <div className="font-medium text-sm">Overall Sentiment</div>
        <div
          className="font-semibold text-lg mt-0.5"
          style={{ color }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

export function SentimentCard({ result }: { result: AnalysisResult }) {
  const nowSentiment =
    result.nowSentiment != null &&
    Number.isFinite(result.nowSentiment)
      ? result.nowSentiment.toFixed(2)
      : '—';

  const patternSentiment =
    result.patternSentiment != null &&
    Number.isFinite(result.patternSentiment)
      ? result.patternSentiment.toFixed(2)
      : '—';

  const confidence =
    result.confidence != null &&
    Number.isFinite(result.confidence)
      ? `${(result.confidence * 100).toFixed(0)}%`
      : '—';

  return (
    <GlassCard>
      <h3 className="font-semibold text-base mb-4">
        Sentiment Analysis
      </h3>

      <SentimentGauge value={result.sentiment} />

      <div className="grid grid-cols-3 gap-3 mt-5">
        <MetricChip
          label="Now"
          value={nowSentiment}
          color={
            result.nowSentiment != null
              ? getSentimentColor(result.nowSentiment)
              : 'var(--muted-foreground)'
          }
        />

        <MetricChip
          label="Pattern"
          value={patternSentiment}
          color={
            result.patternSentiment != null
              ? getSentimentColor(result.patternSentiment)
              : 'var(--muted-foreground)'
          }
        />

        <MetricChip
          label="Confidence"
          value={confidence}
          color="var(--accentIndigo)"
        />
      </div>

      <div className="mt-4 text-xs text-muted-foreground space-y-1">
        <p>
          Recent: {result.recentNewsCount ?? 0} articles • Total:{' '}
          {result.patternNewsCount ?? 0} articles
        </p>

        {result.latestNewsDate && (
          <p>Latest news: {result.latestNewsDate}</p>
        )}

        {result.explanation && (
          <p className="mt-2 italic text-muted-foreground/80">
            {result.explanation}
          </p>
        )}
      </div>
    </GlassCard>
  );
}