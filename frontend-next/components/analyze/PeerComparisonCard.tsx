'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import type { PeerStock } from '@/lib/types/analysis';

interface PeerComparisonCardProps {
  peers: PeerStock[];
}

export function PeerComparisonCard({ peers }: PeerComparisonCardProps) {
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>

        <h3 className="font-semibold text-base">Peer Comparison</h3>
      </div>

      <div className="space-y-3">
        {peers.map((peer) => {
          const currentPrice =
            peer.currentPrice != null &&
            Number.isFinite(peer.currentPrice)
              ? peer.currentPrice
              : null;

          const priceChangePercent =
            peer.priceChangePercent != null &&
            Number.isFinite(peer.priceChangePercent)
              ? peer.priceChangePercent
              : null;

          return (
            <div
              key={peer.ticker}
              className="flex items-center justify-between py-2 border-t border-white/10 dark:border-white/5 first:border-0 first:pt-0"
            >
              <span className="font-medium text-sm">{peer.ticker}</span>

              <div className="flex items-center gap-3 text-right">
                {currentPrice !== null ? (
                  <>
                    <span className="font-medium text-sm">
                      ₹{currentPrice.toFixed(2)}
                    </span>

                    {priceChangePercent !== null && (
                      <span
                        className="text-xs font-medium"
                        style={{
                          color:
                            priceChangePercent >= 0
                              ? '#34D399'
                              : '#F87171',
                        }}
                      >
                        {priceChangePercent >= 0 ? '+' : ''}
                        {priceChangePercent.toFixed(2)}%
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    —
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}