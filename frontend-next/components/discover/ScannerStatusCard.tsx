'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { SCAN_TYPE_LABELS } from '@/lib/types/opportunity';
import type { ScannerStatus } from '@/lib/types/opportunity';

interface ScannerStatusCardProps {
  status: ScannerStatus | null;
  isScanning: boolean;
  onScan: () => void;
}

export function ScannerStatusCard({
  status,
  isScanning,
  onScan,
}: ScannerStatusCardProps) {
  const isDark =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  const currentMode = status?.currentMode;
  const sentimentThreshold =
    status?.sentimentThreshold != null &&
    Number.isFinite(status.sentimentThreshold)
      ? status.sentimentThreshold
      : null;

  const lookbackHours =
    status?.lookbackHours != null &&
    Number.isFinite(status.lookbackHours)
      ? status.lookbackHours
      : null;

  const topOpportunities =
    status?.topOpportunities != null &&
    Number.isFinite(status.topOpportunities)
      ? status.topOpportunities
      : null;

  return (
    <GlassCard>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="p-2 rounded-xl"
            style={{
              backgroundColor: 'var(--accentIndigo)',
              color: 'white',
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>

          <div>
            <h3 className="font-semibold text-base">
              Opportunity Scanner
            </h3>

            {currentMode && (
              <p className="text-sm text-muted-foreground">
                {SCAN_TYPE_LABELS[currentMode] || currentMode}
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={onScan}
          disabled={isScanning}
          size="md"
        >
          {isScanning ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Scanning...
            </>
          ) : (
            <>
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Scan Now
            </>
          )}
        </Button>
      </div>

      {status && (
        <div
          className="mt-4 pt-4 border-t"
          style={{
            borderColor: isDark
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(0,0,0,0.06)',
          }}
        >
          <div className="flex flex-wrap gap-3">
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
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              }
            >
              <span className="text-muted-foreground">
                Threshold:{' '}
              </span>
              <span className="font-semibold">
                {sentimentThreshold !== null
                  ? `>${sentimentThreshold.toFixed(2)}`
                  : '—'}
              </span>
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            >
              <span className="text-muted-foreground">
                Lookback:{' '}
              </span>
              <span className="font-semibold">
                {lookbackHours !== null
                  ? `${lookbackHours}h`
                  : '—'}
              </span>
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
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888a1 1 0 00-.588 1.81h4.915a1 1 0 00.95-.69l1.519-4.674z"
                  />
                </svg>
              }
            >
              <span className="text-muted-foreground">
                Top Picks:{' '}
              </span>
              <span className="font-semibold">
                {topOpportunities !== null
                  ? topOpportunities
                  : '—'}
              </span>
            </Chip>
          </div>
        </div>
      )}
    </GlassCard>
  );
}