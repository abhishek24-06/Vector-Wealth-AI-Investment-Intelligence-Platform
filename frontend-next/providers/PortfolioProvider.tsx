'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { analyzePortfolio, suggestForGoal, savePortfolio, loadPortfolio } from '@/lib/api/endpoints';
import type { Goal, Holding, RecommendedStock, PortfolioState, AnalyzedGoal } from '@/lib/types/portfolio';
import { getLocalStorage, setLocalStorage } from '@/lib/utils/storage';

const STORAGE_KEY = 'vector-wealth-portfolio-goals';

interface PortfolioContextType extends PortfolioState {
  addGoal: (goal: Omit<Goal, 'id' | 'holdings' | 'recommendedStocks'>) => Promise<void>;
  updateGoal: (goalId: string, updated: Goal) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  addHolding: (goalId: string, holding: Holding) => Promise<void>;
  removeHolding: (goalId: string, holdingIndex: number) => Promise<void>;
  analyzePortfolio: () => Promise<void>;
  fetchSuggestion: (goalId: string) => Promise<void>;
  loadGoals: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PortfolioState>({
    isLoading: true,
    isAnalyzing: false,
    error: null,
    goals: [],
  });

  const loadGoals = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // Try local storage first
      const localGoals = getLocalStorage<Goal[]>(STORAGE_KEY, []);
      
      if (localGoals.length > 0) {
        setState(prev => ({ ...prev, goals: localGoals, isLoading: false }));
      }

      // Also try backend
      try {
        const response = await loadPortfolio('default');
        if (response.goals && response.goals.length > 0) {
          setState(prev => ({ ...prev, goals: response.goals }));
          setLocalStorage(STORAGE_KEY, response.goals);
        }
      } catch {
        // Backend not reachable - local data is fine
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load portfolio';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const saveGoals = useCallback(async (goals: Goal[]) => {
    setLocalStorage(STORAGE_KEY, goals);
    try {
      await savePortfolio('default', goals);
    } catch {
      // Silently fail - local storage is primary
    }
  }, []);

  const addGoal = useCallback(async (goal: Omit<Goal, 'id' | 'holdings' | 'recommendedStocks'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal_${Date.now()}`,
      holdings: [],
      recommendedStocks: [],
    };
    setState(prev => {
      const newGoals = [...prev.goals, newGoal];
      saveGoals(newGoals);
      return { ...prev, goals: newGoals };
    });
  }, [saveGoals]);

  const updateGoal = useCallback(async (goalId: string, updated: Goal) => {
    setState(prev => {
      const newGoals = prev.goals.map(g => g.id === goalId ? updated : g);
      saveGoals(newGoals);
      return { ...prev, goals: newGoals };
    });
  }, [saveGoals]);

  const deleteGoal = useCallback(async (goalId: string) => {
    setState(prev => {
      const newGoals = prev.goals.filter(g => g.id !== goalId);
      saveGoals(newGoals);
      return { ...prev, goals: newGoals };
    });
  }, [saveGoals]);

  const addHolding = useCallback(async (goalId: string, holding: Holding) => {
    setState(prev => {
      const newGoals = prev.goals.map(g => {
        if (g.id === goalId) {
          return { ...g, holdings: [...g.holdings, holding] };
        }
        return g;
      });
      saveGoals(newGoals);
      return { ...prev, goals: newGoals };
    });
  }, [saveGoals]);

  const removeHolding = useCallback(async (goalId: string, holdingIndex: number) => {
    setState(prev => {
      const newGoals = prev.goals.map(g => {
        if (g.id === goalId) {
          const newHoldings = [...g.holdings];
          newHoldings.splice(holdingIndex, 1);
          return { ...g, holdings: newHoldings };
        }
        return g;
      });
      saveGoals(newGoals);
      return { ...prev, goals: newGoals };
    });
  }, [saveGoals]);

  const analyzePortfolioAction = useCallback(async () => {
    if (state.goals.length === 0) return;
    
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    
    try {
      const result = await analyzePortfolio(state.goals) as { goals: AnalyzedGoal[] };
      
      setState(prev => {
        const updatedGoals = prev.goals.map(goal => {
          const analyzedGoal = result.goals.find(g => g.goalId === goal.id);
          if (!analyzedGoal) return goal;
          
          return {
            ...goal,
            totalInvested: analyzedGoal.totalInvested,
            totalCurrentValue: analyzedGoal.totalCurrentValue,
            totalPnl: analyzedGoal.totalPnl,
            totalPnlPercent: analyzedGoal.totalPnlPercent,
            progress: analyzedGoal.progress,
            yearsLeft: analyzedGoal.yearsLeft,
            holdings: goal.holdings.map((holding, idx) => {
              const analyzedHolding = analyzedGoal.holdings[idx];
              if (!analyzedHolding) return holding;
              return {
                ...holding,
                currentPrice: analyzedHolding.currentPrice,
                currentValue: analyzedHolding.currentValue,
                pnl: analyzedHolding.pnl,
                pnlPercent: analyzedHolding.pnlPercent,
              };
            }),
          };
        });
        return { ...prev, isAnalyzing: false, goals: updatedGoals };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      setState(prev => ({ ...prev, isAnalyzing: false, error: message }));
    }
  }, [state.goals]);

  const fetchSuggestion = useCallback(async (goalId: string) => {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    try {
      const result = await suggestForGoal(goal);
      
      setState(prev => ({
        ...prev,
        goals: prev.goals.map(g => 
          g.id === goalId 
            ? { ...g, suggestion: result.suggestion, recommendedStocks: result.recommendedStocks }
            : g
        ),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not fetch suggestions';
      setState(prev => ({
        ...prev,
        goals: prev.goals.map(g => 
          g.id === goalId 
            ? { ...g, suggestion: message, recommendedStocks: [] }
            : g
        ),
      }));
    }
  }, [state.goals]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  return (
    <PortfolioContext.Provider value={{ 
      ...state, 
      addGoal, 
      updateGoal, 
      deleteGoal, 
      addHolding, 
      removeHolding, 
      analyzePortfolio: analyzePortfolioAction, 
      fetchSuggestion, 
      loadGoals 
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}