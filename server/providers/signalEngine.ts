import { Candle, SignalScores, TradingSignal } from '../types';
import { calculateTechnicalIndicators, fetchCandles, fetchLiveTicker } from './marketData';
import { fetchOrderBook } from './liquidity';
import { fetchDerivativesData } from './derivatives';
import { db } from '../db';

export async function evaluateSignalForAsset(
  symbol: string,
  timeframe: '15m' | '1h' | '4h' | '1D' = '4h'
): Promise<TradingSignal> {
  const normSymbol = symbol.toUpperCase();
  
  // 1. Fetch market data & technical indicators
  const ticker = await fetchLiveTicker(normSymbol);
  const candles = await fetchCandles(normSymbol, timeframe, 100);
  const tech = calculateTechnicalIndicators(candles);
  const currentPrice = ticker.price;

  // Technical Scoring (-100 to +100)
  let techScore = 0;
  // EMA alignment
  if (currentPrice > tech.ema20 && tech.ema20 > tech.ema50) techScore += 35;
  else if (currentPrice < tech.ema20 && tech.ema20 < tech.ema50) techScore -= 35;
  
  // RSI scoring (ideal bullish momentum between 52 and 68)
  if (tech.rsi14 >= 50 && tech.rsi14 <= 65) techScore += 25;
  else if (tech.rsi14 > 65 && tech.rsi14 <= 75) techScore += 15;
  else if (tech.rsi14 > 75) techScore -= 20; // overbought risk
  else if (tech.rsi14 <= 50 && tech.rsi14 >= 35) techScore -= 20;
  else if (tech.rsi14 < 35) techScore += 10; // oversold bounce potential

  // MACD histogram
  if (tech.macd.histogram > 0) techScore += 25;
  else techScore -= 25;

  // VWAP position
  if (currentPrice > tech.vwap) techScore += 15;
  else techScore -= 15;

  techScore = Math.max(-100, Math.min(100, techScore));

  // 2. Liquidity Scoring (-100 to +100)
  const orderBook = await fetchOrderBook(normSymbol, 'Binance');
  let liqScore = 0;
  // Depth imbalance (-1 to +1) scaled to (-60 to +60)
  liqScore += orderBook.depthImbalance * 60;
  // Spread tightness (sub-1 bps is institutional tier)
  if (orderBook.spreadBps < 1.0) liqScore += 20;
  else if (orderBook.spreadBps > 3.0) liqScore -= 20;
  // Bid depth 25bps vs Ask depth 25bps
  if (orderBook.bidDepth25bps > orderBook.askDepth25bps * 1.2) liqScore += 20;
  else if (orderBook.askDepth25bps > orderBook.bidDepth25bps * 1.2) liqScore -= 20;

  liqScore = Math.max(-100, Math.min(100, Math.round(liqScore)));

  // 3. Derivatives Scoring (-100 to +100)
  const deriv = await fetchDerivativesData(normSymbol);
  let derivScore = 0;
  // Funding rate: moderate positive is bullish; extreme positive (>0.03%) is overbought/contrarian short
  if (deriv.fundingRate > 0 && deriv.fundingRate < 0.02) derivScore += 30;
  else if (deriv.fundingRate >= 0.02) derivScore -= 30; // crowded longs
  else if (deriv.fundingRate < 0) derivScore += 20; // negative funding / short squeeze potential
  
  // Open interest expansion with positive price movement
  if (deriv.openInterestChange24h > 2.0 && ticker.change24h > 0) derivScore += 35;
  else if (deriv.openInterestChange24h > 2.0 && ticker.change24h < 0) derivScore -= 35;

  // Long/Short ratio tilt
  if (deriv.longShortRatio >= 1.05 && deriv.longShortRatio <= 1.30) derivScore += 20;
  else if (deriv.longShortRatio > 1.6) derivScore -= 25; // extreme crowded long

  // Liquidations tilt
  if (deriv.liquidationShort24hUsd > deriv.liquidationLong24hUsd * 1.5) derivScore += 15;

  derivScore = Math.max(-100, Math.min(100, Math.round(derivScore)));

  // 4. ETF Flow Scoring (-100 to +100)
  let etfScore = 50; // baseline neutral for non-ETF assets
  if (normSymbol === 'BTC' || normSymbol === 'ETH') {
    const flows = db.getETFDailyFlows().filter(f => f.asset === normSymbol);
    if (flows.length > 0) {
      const latest = flows[0];
      const sum3d = flows.slice(0, 3).reduce((acc, f) => acc + f.totalNetFlowUsd, 0);
      
      let flowPoints = 0;
      if (latest.totalNetFlowUsd > 100000000) flowPoints += 50;
      else if (latest.totalNetFlowUsd > 0) flowPoints += 30;
      else if (latest.totalNetFlowUsd < -50000000) flowPoints -= 50;
      else flowPoints -= 25;

      if (sum3d > 200000000) flowPoints += 40;
      else if (sum3d < -100000000) flowPoints -= 40;

      etfScore = Math.max(-100, Math.min(100, flowPoints));
    }
  }

  // 5. News Sentiment Scoring (-100 to +100)
  const articles = db.getNews().filter(a => a.relatedAssets.includes(normSymbol));
  let newsScore = 50;
  if (articles.length > 0) {
    const avgSentiment = articles.reduce((sum, a) => sum + a.sentimentScore, 0) / articles.length;
    newsScore = Math.round(avgSentiment);
  }

  // Combined Weighted Scoring
  // Technical: 30%, Liquidity: 25%, Derivatives: 20%, ETF: 15%, News: 10%
  const combined = (
    techScore * 0.30 +
    liqScore * 0.25 +
    derivScore * 0.20 +
    etfScore * 0.15 +
    newsScore * 0.10
  );
  const combinedScore = Number(combined.toFixed(1));

  // Determine Direction
  let direction: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL';
  if (combinedScore >= 60) direction = 'LONG';
  else if (combinedScore <= -60) direction = 'SHORT';

  // Risk Parameters using ATR 14
  const atr = tech.atr14 > 0 ? tech.atr14 : currentPrice * 0.025;
  const entrySpread = currentPrice * 0.003;

  let entryZoneMin = Number((currentPrice - entrySpread).toFixed(2));
  let entryZoneMax = Number((currentPrice + entrySpread).toFixed(2));
  let stopLoss = 0;
  let takeProfit1 = 0;
  let takeProfit2 = 0;
  let takeProfit3 = 0;

  if (direction === 'LONG') {
    stopLoss = Number((currentPrice - (1.6 * atr)).toFixed(2));
    const risk = currentPrice - stopLoss;
    takeProfit1 = Number((currentPrice + (1.5 * risk)).toFixed(2));
    takeProfit2 = Number((currentPrice + (2.6 * risk)).toFixed(2));
    takeProfit3 = Number((currentPrice + (3.8 * risk)).toFixed(2));
  } else if (direction === 'SHORT') {
    stopLoss = Number((currentPrice + (1.6 * atr)).toFixed(2));
    const risk = stopLoss - currentPrice;
    takeProfit1 = Number((currentPrice - (1.5 * risk)).toFixed(2));
    takeProfit2 = Number((currentPrice - (2.6 * risk)).toFixed(2));
    takeProfit3 = Number((currentPrice - (3.8 * risk)).toFixed(2));
  } else {
    // Neutral bounds
    stopLoss = Number((currentPrice * 0.96).toFixed(2));
    takeProfit1 = Number((currentPrice * 1.04).toFixed(2));
    takeProfit2 = Number((currentPrice * 1.07).toFixed(2));
    takeProfit3 = Number((currentPrice * 1.10).toFixed(2));
  }

  const riskDistance = Math.abs(currentPrice - stopLoss) || 1;
  const rewardDistance = Math.abs(takeProfit2 - currentPrice) || 1;
  const riskRewardRatio = Number((rewardDistance / riskDistance).toFixed(2));

  // Confidence calculation based on score convergence
  const confidenceScore = Math.min(95, Math.max(50, Math.round(50 + Math.abs(combinedScore) * 0.45)));

  // Supporting & Contradictory Evidence
  const supportingEvidence: string[] = [];
  const contradictoryEvidence: string[] = [];

  if (techScore > 30) supportingEvidence.push(`Technical indicators positive: EMA 20 above EMA 50, RSI 14 at ${tech.rsi14}.`);
  else if (techScore < -30) supportingEvidence.push(`Technical indicators negative: Price below key moving averages, RSI 14 at ${tech.rsi14}.`);
  else contradictoryEvidence.push(`Technical posture is indecisive around moving average cluster.`);

  if (liqScore > 20) supportingEvidence.push(`Order-book depth imbalance is +${(orderBook.depthImbalance * 100).toFixed(1)}% favoring bids.`);
  else if (liqScore < -20) supportingEvidence.push(`Order-book depth imbalance is ${(orderBook.depthImbalance * 100).toFixed(1)}% favoring asks.`);
  else contradictoryEvidence.push(`Order book depth demonstrates balanced two-sided market liquidity.`);

  if (derivScore > 25) supportingEvidence.push(`Derivatives posture favorable: Funding rate (${(deriv.fundingRate * 100).toFixed(4)}%) remains disciplined.`);
  else if (derivScore < -25) contradictoryEvidence.push(`Derivatives show heavy positioning skew with long/short ratio at ${deriv.longShortRatio}.`);

  if (normSymbol === 'BTC' || normSymbol === 'ETH') {
    if (etfScore > 40) supportingEvidence.push(`US Spot ETF flows provide strong net demand absorption.`);
    else if (etfScore < -20) contradictoryEvidence.push(`Institutional ETF outflows recorded in recent trading sessions.`);
  }

  const scores: SignalScores = {
    technical: techScore,
    liquidity: liqScore,
    derivatives: derivScore,
    etfFlows: etfScore,
    newsSentiment: newsScore,
    combinedScore
  };

  const signal: TradingSignal = {
    id: `sig-${normSymbol.toLowerCase()}-${Date.now()}`,
    symbol: normSymbol,
    timeframe,
    direction,
    entryZoneMin,
    entryZoneMax,
    currentPrice,
    stopLoss,
    takeProfit1,
    takeProfit2,
    takeProfit3,
    riskRewardRatio,
    confidenceScore,
    status: direction === 'NEUTRAL' ? 'CANDIDATE' : 'ACTIVE',
    scores,
    supportingEvidence,
    contradictoryEvidence,
    invalidationConditions: [
      `Hourly candle close beyond stop-loss level ($${stopLoss.toLocaleString()}).`,
      `Opposing order-book depth expansion exceeding 40% within 25 bps.`,
      `Major macroeconomic or regulatory breaking news reversing sentiment.`
    ],
    methodologyVersion: 'v2.4-Institutional-MultiPillar',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    isPublicPreview: normSymbol === 'BTC' || normSymbol === 'XRP',
    aiThesis: `Quantitative model detects ${direction} bias with combined multi-pillar score of ${combinedScore}. Technical strength (${techScore}) supported by liquidity depth (${liqScore}) and institutional flows (${etfScore}).`
  };

  return signal;
}
