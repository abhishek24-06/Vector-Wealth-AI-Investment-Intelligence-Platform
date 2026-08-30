'use client';

import { useEffect } from 'react';
import { RefreshIndicator } from '@/components/ui/RefreshIndicator';
import { ErrorDisplay } from '@/components/analyze/ErrorDisplay';
import { ScannerStatusCard } from '@/components/discover/ScannerStatusCard';
import { OpportunityCard } from '@/components/discover/OpportunityCard';
import { useDiscover } from '@/providers/DiscoverProvider';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { SCAN_TYPE_LABELS } from '@/lib/types/opportunity';

export default function DiscoverPage() {
  const { 
    isLoading, 
    isScanning, 
    error, 
    opportunities, 
    isMarketHours, 
    status, 
    refresh,
    triggerScan 
  } = useDiscover();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3" style={{
        backgroundColor: isDark ? 'rgba(8, 11, 22, 0.8)' : 'rgba(240, 240, 245, 0.8)',
        backdropFilter: 'blur(24px)',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)',
      }}>
        <h1 className="text-xl font-bold">Discover</h1>
        <div className="flex items-center gap-2">
          {status && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{
              backgroundColor: isMarketHours ? 'rgba(52, 211, 153, 0.15)' : 'rgba(148, 163, 184, 0.15)',
              color: isMarketHours ? '#34D399' : '#94A3B8',
              border: isMarketHours ? '1px solid rgba(52, 211, 153, 0.2)' : '1px solid rgba(148, 163, 184, 0.2)',
            }}>
              {isMarketHours ? 'Market Open' : 'Market Closed'}
            </span>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <RefreshIndicator onRefresh={refresh}>
        <div className="px-4 pb-24 space-y-4">
          {/* Scanner Status */}
          <ScannerStatusCard 
            status={status} 
            isScanning={isScanning} 
            onScan={triggerScan} 
          />

          {/* Error */}
          {error && <ErrorDisplay message={error} className="mx-0" />}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && opportunities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Tap "Scan Now" to find opportunities or wait for the next scheduled scan
              </p>
            </div>
          )}

          {/* Opportunities List */}
          {!isLoading && !error && opportunities.length > 0 && (
            <div className="space-y-3">
              {opportunities.map((opportunity, index) => (
                <OpportunityCard key={opportunity.ticker} opportunity={opportunity} rank={index + 1} />
              ))}
            </div>
          )}
        </div>
      </RefreshIndicator>
    </div>
  );
}


