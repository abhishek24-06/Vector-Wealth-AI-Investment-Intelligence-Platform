'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/format';
import { getSentimentColor } from '@/lib/utils/sentiment';
import type { Goal, Holding, RecommendedStock } from '@/lib/types/portfolio';

interface HoldingRowProps {
  holding: Holding;
  onDelete: () => void;
}

function HoldingRow({ holding, onDelete }: HoldingRowProps) {
  const isDark = document.documentElement.classList.contains('dark');
  const pnl = holding.pnl ?? 0;
  const pnlPct = holding.pnlPercent ?? 0;
  const isPositive = pnl >= 0;

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400 dark:text-indigo-300 text-xs font-medium">
        {holding.ticker}
      </div>
      <div className="flex-1 text-sm text-muted-foreground">
        {holding.quantity.toFixed(0)} × ₹{holding.buyPrice.toFixed(0)}
      </div>
      {holding.currentPrice !== null && (
        <span className="text-sm font-medium" style={{ color: isPositive ? '#34D399' : '#F87171' }}>
          {isPositive ? '+' : ''}₹{pnl.toFixed(0)} ({isPositive ? '+' : ''}{pnlPct.toFixed(1)}%)
        </span>
      )}
      <button
        onClick={onDelete}
        className="p-1 rounded hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-muted-foreground"
        aria-label="Remove holding"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

interface RecommendedStockCardProps {
  stock: RecommendedStock;
  goalId: string;
  onAdd: (stock: RecommendedStock, goalId: string) => void;
}

function RecommendedStockCard({ stock, goalId, onAdd }: RecommendedStockCardProps) {
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{
      backgroundColor: isDark ? 'rgba(52, 211, 153, 0.1)' : 'rgba(52, 211, 153, 0.05)',
      borderColor: 'rgba(52, 211, 153, 0.3)',
      borderWidth: '1px',
      borderStyle: 'solid',
    }}>
      <div className="px-2.5 py-1 rounded bg-green-500/20 text-green-400 dark:text-green-300 text-xs font-medium">
        {stock.ticker}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{stock.quantity} qty × ₹{stock.buyPrice.toFixed(0)}</p>
        {stock.reasoning && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{stock.reasoning}</p>
        )}
      </div>
      <Button 
        variant="tonal" 
        size="sm" 
        onClick={() => onAdd(stock, goalId)}
        className="flex-shrink-0"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add
      </Button>
    </div>
  );
}

interface PnlChipProps {
  label: string;
  value: string;
  color?: string;
}

function PnlChip({ label, value, color }: PnlChipProps) {
  return (
    <div className="flex-1 text-center">
      <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
      <p className="text-sm font-semibold mt-0.5" style={{ color }}>{value}</p>
    </div>
  );
}

interface GoalCardProps {
  goal: Goal;
  onAnalyze: () => void;
  onAddHolding: (goalId: string, holding: Holding) => void;
  onRemoveHolding: (goalId: string, index: number) => void;
  onFetchSuggestion: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
}

export function GoalCard({ 
  goal, 
  onAnalyze, 
  onAddHolding, 
  onRemoveHolding, 
  onFetchSuggestion, 
  onDeleteGoal 
}: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isDark = document.documentElement.classList.contains('dark');
  
  const progress = goal.progress ?? 0;
  const progressColor = progress > 60 ? '#34D399' : progress > 30 ? '#F59E0B' : 'var(--accentIndigo)';
  
  const riskIcons: Record<string, string> = {
    conservative: '',
    moderate: '',
    aggressive: '',
  };

  const handleMenu = (action: string) => {
    switch (action) {
      case 'add':
        break;
      case 'suggest':
        onFetchSuggestion(goal.id);
        break;
      case 'delete':
        onDeleteGoal(goal.id);
        break;
    }
  };

  return (
    <GlassCard className="relative">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base truncate">{goal.name}</h3>
            <span className="text-lg">{riskIcons[goal.riskTolerance] || ''}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Target: {formatCurrency(goal.targetAmount)} · {goal.targetDate.slice(0, 4)} · {goal.riskTolerance[0].toUpperCase() + goal.riskTolerance.slice(1)}
          </p>
        </div>
        <div className="relative">
          <button
            className="p-1 rounded hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-muted-foreground"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${progressColor}30` }}>
            <div 
              className="h-full rounded-full transition-all duration-500" 
              style={{ 
                width: `${Math.min(progress, 100)}%`, 
                backgroundColor: progressColor 
              }} 
            />
          </div>
          <span className="text-sm font-semibold whitespace-nowrap" style={{ color: progressColor }}>
            {progress.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* P&L Summary */}
      {goal.totalCurrentValue !== null && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <PnlChip label="Invested" value={formatCurrency(goal.totalInvested ?? 0)} />
          <PnlChip label="Current" value={formatCurrency(goal.totalCurrentValue ?? 0)} />
          <PnlChip 
            label="P&L" 
            value={`${(goal.totalPnl ?? 0) >= 0 ? '+' : ''}${formatCurrency(goal.totalPnl ?? 0)}`} 
            color={(goal.totalPnl ?? 0) >= 0 ? '#34D399' : '#F87171'}
          />
        </div>
      )}

      {/* Holdings count & expand */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span>{goal.holdings.length} holdings</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded hover:bg-white/10 dark:hover:bg-white/5 transition-colors text-muted-foreground"
        >
          <svg className="w-5 h-5 transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-4 space-y-3 border-t pt-4" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
          {goal.holdings.length > 0 ? (
            goal.holdings.map((holding, idx) => (
              <HoldingRow 
                key={idx} 
                holding={holding} 
                onDelete={() => onRemoveHolding(goal.id, idx)} 
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No holdings yet. Tap ⋮ → Add Holding.</p>
          )}

          {goal.suggestion && goal.suggestion.length > 0 && (
            <div className="p-3 rounded-xl" style={{
              backgroundColor: 'var(--accentIndigo)10',
              borderColor: 'var(--accentIndigo)30',
              borderWidth: '1px',
              borderStyle: 'solid',
            }}>
              <div className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: 'var(--accentIndigo)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Suggestion
              </div>
              <p className="text-sm text-muted-foreground/90 whitespace-pre-line">{goal.suggestion}</p>
            </div>
          )}

          {goal.recommendedStocks && goal.recommendedStocks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--accentEmerald)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Recommended Stocks
              </div>
              {goal.recommendedStocks.map((stock) => (
                <RecommendedStockCard 
                  key={stock.ticker} 
                  stock={stock} 
                  goalId={goal.id}
                  onAdd={(stock, goalId) => onAddHolding(goalId, {
                    ticker: stock.ticker,
                    quantity: stock.quantity,
                    buyPrice: stock.buyPrice,
                    buyDate: new Date().toISOString().split('T')[0],
                  })}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}

