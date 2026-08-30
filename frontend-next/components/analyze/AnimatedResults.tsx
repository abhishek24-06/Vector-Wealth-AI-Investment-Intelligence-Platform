'use client';

import { useState, useEffect, useRef } from 'react';
import type { AnalysisResult } from '@/lib/types/analysis';
import { PriceCard } from './PriceCard';
import { SentimentCard } from './SentimentCard';
import { AiSummaryCard } from './AiSummaryCard';
import { DriversCard } from './DriversCard';
import { NewsCard } from './NewsCard';
import { PeerComparisonCard } from './PeerComparisonCard';
import { SentimentTrendChart } from './SentimentTrendChart';
import { useTrendStore } from '@/lib/hooks/useTrendStore';

interface AnimatedResultsProps {
  result: AnalysisResult;
}

const CARD_COUNT = 7;
const STAGGER_DELAY = 80;
const ANIM_DURATION = 500;

export function AnimatedResults({ result }: AnimatedResultsProps) {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const recordedRef = useRef(false);
  const { recordAnalysis, getTrend, hasTrend } = useTrendStore();

  // Record analysis for trend tracking
  useEffect(() => {
    if (recordedRef.current) return;
    recordedRef.current = true;
    recordAnalysis(result.ticker, result.sentiment, result.recommendation);
  }, [result, recordAnalysis]);

  // Staggered animation
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    for (let i = 0; i < CARD_COUNT; i++) {
      const timer = setTimeout(() => {
        setVisibleCards(prev => new Set([...prev, i]));
      }, i * STAGGER_DELAY);
      timers.push(timer);
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  const shouldShow = (index: number) => visibleCards.has(index);

  const trendData = getTrend(result.ticker);
  const showTrend = hasTrend(result.ticker);

  return (
    <div className="space-y-4 animate-fade-in">
      {shouldShow(0) && <PriceCard key="price" result={result} />}
      {result.aiSummary && shouldShow(1) && <AiSummaryCard key="summary" summary={result.aiSummary} />}
      {shouldShow(2) && <SentimentCard key="sentiment" result={result} />}
      {showTrend && shouldShow(3) && <SentimentTrendChart key="trend" data={trendData} ticker={result.ticker} />}
      {result.peers && result.peers.length > 0 && shouldShow(4) && <PeerComparisonCard key="peers" peers={result.peers} />}
      {shouldShow(5) && <DriversCard key="drivers" result={result} />}
      {shouldShow(6) && <NewsCard key="news" result={result} />}
    </div>
  );
}

