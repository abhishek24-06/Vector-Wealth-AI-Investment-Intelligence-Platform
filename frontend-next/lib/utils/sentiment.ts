export function getSentimentColor(sentiment: number): string {
  const clamped = Math.max(-1, Math.min(1, sentiment));
  if (clamped >= 0) {
    // 0 to 1: amber to emerald
    const ratio = clamped;
    const r = Math.round(245 * (1 - ratio) + 52 * ratio);
    const g = Math.round(158 * (1 - ratio) + 211 * ratio);
    const b = Math.round(11 * (1 - ratio) + 153 * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // -1 to 0: coral red to amber
    const ratio = clamped + 1;
    const r = Math.round(248 * (1 - ratio) + 245 * ratio);
    const g = Math.round(113 * (1 - ratio) + 158 * ratio);
    const b = Math.round(113 * (1 - ratio) + 11 * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

export function getSentimentBgColor(sentiment: number): string {
  const color = getSentimentColor(sentiment);
  return color.replace('rgb', 'rgba').replace(')', ', 0.12)');
}

export function getSentimentLabel(sentiment: number): string {
  if (sentiment > 0.2) return 'Bullish';
  if (sentiment < -0.2) return 'Bearish';
  return 'Neutral';
}

export function getSentimentIcon(sentiment: number): string {
  if (sentiment > 0.2) return '📈';
  if (sentiment < -0.2) return '📉';
  return '➡️';
}

export function getRecommendationColor(recommendation: string): string {
  switch (recommendation.toUpperCase()) {
    case 'BUY':
      return getSentimentColor(1);
    case 'SELL':
      return getSentimentColor(-1);
    default:
      return getSentimentColor(0);
  }
}

export function getRecommendationIcon(recommendation: string): string {
  switch (recommendation.toUpperCase()) {
    case 'BUY':
      return '⬆️';
    case 'SELL':
      return '⬇️';
    default:
      return '⏸️';
  }
}