'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Line, ReferenceLine } from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { getSentimentColor, getSentimentBgColor } from '@/lib/utils/sentiment';
import { formatDate } from '@/lib/utils/format';
import type { TrendEntry } from '@/lib/hooks/useTrendStore';

interface SentimentTrendChartProps {
  data: TrendEntry[];
  ticker: string;
}

export function SentimentTrendChart({ data, ticker }: SentimentTrendChartProps) {
  if (data.length < 2) return null;

  const chartData = data.map((d, i) => ({
    ...d,
    index: i,
    dateLabel: formatDate(d.date),
  }));

  const lastSentiment = data[data.length - 1].sentiment;
  const lineColor = getSentimentColor(lastSentiment);
  const bgColor = getSentimentBgColor(lastSentiment);
  
  const isDark = document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const textColor = isDark ? '#94A3B8' : '#64748B';

  const sentiments = data.map(d => d.sentiment);
  const minVal = Math.min(...sentiments) - 0.1;
  const maxVal = Math.max(...sentiments) + 0.1;

  return (
    <GlassCard className="min-h-[160px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accentIndigo)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h3 className="font-semibold text-base">Sentiment History</h3>
        </div>
        <span className="text-xs text-muted-foreground">{data.length} analyses</span>
      </div>
      
      <div className="h-[100px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              horizontal={false} 
              vertical={false} 
              strokeDasharray="3 3"
              stroke={gridColor}
            />
            
            <XAxis 
              dataKey="index" 
              type="number"
              tick={{ fill: textColor, fontSize: 10 }}
              tickFormatter={(value) => chartData[value]?.dateLabel || ''}
              interval={Math.max(1, Math.floor(chartData.length / 4))}
              axisLine={false}
              tickLine={false}
            />
            
            <YAxis 
              domain={[minVal, maxVal]}
              tick={{ fill: textColor, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickCount={4}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                padding: '12px',
              }}
              labelFormatter={(_, payload) => payload[0]?.payload?.dateLabel || ''}
              formatter={(value: number) => [value.toFixed(2), 'Sentiment']}
            />
            
            <ReferenceLine 
              y={0} 
              stroke={gridColor} 
              strokeWidth={1} 
              strokeDasharray="4 4"
            />
            
            <Area
              type="monotone"
              dataKey="sentiment"
              stroke={lineColor}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#sentimentGradient)"
              connectNulls
            />
            
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke={lineColor}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2, stroke: lineColor, fill: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Date labels at bottom */}
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[10px] text-muted-foreground">
            {formatDate(data[0].date)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatDate(data[data.length - 1].date)}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}

