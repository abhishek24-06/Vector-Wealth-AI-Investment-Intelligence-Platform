'use client';

import { useState } from 'react';
import { RefreshIndicator } from '@/components/ui/RefreshIndicator';
import { Button } from '@/components/ui/Button';
import { GoalCard } from '@/components/portfolio/GoalCard';
import { PortfolioEmptyState } from '@/components/portfolio/PortfolioEmptyState';
import { AddGoalModal } from '@/components/portfolio/AddGoalModal';
import { AddHoldingModal } from '@/components/portfolio/AddHoldingModal';
import { usePortfolio } from '@/providers/PortfolioProvider';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function PortfolioPage() {
  const { 
    isLoading, 
    isAnalyzing, 
    error, 
    goals, 
    addGoal, 
    analyzePortfolio, 
    addHolding, 
    removeHolding,
    fetchSuggestion,
    deleteGoal,
  } = usePortfolio();
  
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddHolding, setShowAddHolding] = useState<{ goalId: string } | null>(null);
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3" style={{
        backgroundColor: isDark ? 'rgba(8, 11, 22, 0.8)' : 'rgba(240, 240, 245, 0.8)',
        backdropFilter: 'blur(24px)',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.04)',
      }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ 
            background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
          }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Portfolio</h1>
        </div>
        <div className="flex items-center gap-2">
          {isAnalyzing && (
            <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <RefreshIndicator onRefresh={async () => {}}>
        <div className="px-4 pb-28">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : goals.length === 0 ? (
            <PortfolioEmptyState onAdd={() => setShowAddGoal(true)} />
          ) : (
            <div className="space-y-3 pr-1">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onAnalyze={analyzePortfolio}
                  onAddHolding={addHolding}
                  onRemoveHolding={removeHolding}
                  onFetchSuggestion={fetchSuggestion}
                  onDeleteGoal={deleteGoal}
                />
              ))}
            </div>
          )}
        </div>
      </RefreshIndicator>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-50 safe-area-bottom">
        <Button 
          onClick={() => setShowAddGoal(true)}
          size="lg"
          className="w-14 h-14 rounded-full p-0 shadow-xl"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
            boxShadow: '0 8px 32px rgba(129, 140, 248, 0.4)',
          }}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </Button>
      </div>

      {/* Analyzing Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <svg className="w-12 h-12 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {/* Modals */}
      <AddGoalModal 
        isOpen={showAddGoal} 
        onClose={() => setShowAddGoal(false)} 
        onSubmit={addGoal} 
      />
      <AddHoldingModal 
        isOpen={!!showAddHolding} 
        onClose={() => setShowAddHolding(null)} 
        onSubmit={(holding) => {
          if (showAddHolding) {
            addHolding(showAddHolding.goalId, holding);
          }
          setShowAddHolding(null);
        }} 
      />
    </div>
  );
}


