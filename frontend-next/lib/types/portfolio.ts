export interface Holding {
  ticker: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  currentPrice?: number;
  currentValue?: number;
  pnl?: number;
  pnlPercent?: number;
}

export interface RecommendedStock {
  ticker: string;
  quantity: number;
  buyPrice: number;
  reasoning: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  holdings: Holding[];
  totalInvested?: number;
  totalCurrentValue?: number;
  totalPnl?: number;
  totalPnlPercent?: number;
  progress?: number;
  yearsLeft?: number;
  suggestion?: string;
  recommendedStocks?: RecommendedStock[];
}

export interface AnalyzedGoal {
  goalId: string;
  goalName: string;
  targetAmount: number;
  targetDate: string;
  riskTolerance: string;
  yearsLeft: number;
  totalInvested: number;
  totalCurrentValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  progress: number;
  holdings: AnalyzedHolding[];
}

export interface AnalyzedHolding {
  ticker: string;
  quantity: number;
  buyPrice: number;
  currentPrice?: number;
  currentValue?: number;
  pnl?: number;
  pnlPercent?: number;
  priceChange?: number;
  priceChangePercent?: number;
}

export interface GoalSuggestResponse {
  goalId: string;
  suggestion: string;
  recommendedStocks: RecommendedStock[];
}

export interface PortfolioState {
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  goals: Goal[];
}