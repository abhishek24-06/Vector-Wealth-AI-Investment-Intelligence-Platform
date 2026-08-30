export interface NewsReference {
  date: string;
  title: string;
}

export interface PeerStock {
  ticker: string;
  currentPrice: number | null;
  priceChange: number | null;
  priceChangePercent: number | null;
}

export interface AnalysisResult {
  ticker: string;
  sentiment: number;
  nowSentiment: number;
  patternSentiment: number;
  confidence: number;
  recentNewsCount: number;
  patternNewsCount: number;
  latestNewsDate: string;
  staleData: boolean;
  staleReason: string;
  explanation: string;
  positiveDrivers: string[];
  negativeDrivers: string[];
  recommendation: string;
  newsReferences: NewsReference[];
  currentPrice: number | null;
  priceChange: number | null;
  priceChangePercent: number | null;
  aiSummary: string | null;
  peers: PeerStock[] | null;
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  result: AnalysisResult | null;
  recentTickers: string[];
}