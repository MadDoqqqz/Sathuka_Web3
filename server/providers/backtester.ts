import { BacktestConfig, BacktestResult, BacktestTrade, Candle } from '../types';
import { fetchCandles } from './marketData';

export async function runBacktest(config: BacktestConfig): Promise<BacktestResult> {
  const candles = await fetchCandles(config.symbol, (config.timeframe as '1h' | '4h' | '1D') || '4h', 150);
  
  const trades: BacktestTrade[] = [];
  let capital = config.capitalUsd;
  const equityCurve: { date: string; equity: number }[] = [];
  
  const feeRate = (config.feeBps || 5) / 10000;       // 5 bps = 0.05%
  const slippageRate = (config.slippageBps || 2) / 10000; // 2 bps = 0.02%

  equityCurve.push({
    date: new Date(candles[0].time * 1000).toISOString().split('T')[0],
    equity: capital
  });

  // Walk forward simulation without lookahead bias
  for (let i = 30; i < candles.length - 2; i += 2) {
    const historicalSlice = candles.slice(0, i);
    const currentCandle = candles[i];
    const prevCandle = candles[i - 1];

    // Compute simple moving average crossover & momentum on historical slice only
    const closes = historicalSlice.map(c => c.close);
    const maFast = closes.slice(-10).reduce((a, b) => a + b, 0) / 10;
    const maSlow = closes.slice(-25).reduce((a, b) => a + b, 0) / 25;

    // Simulated multi-pillar score based on trend slope & volume
    const trendPct = ((maFast - maSlow) / maSlow) * 100;
    const volumeConfirmation = currentCandle.volume > prevCandle.volume;
    const simulatedScore = (trendPct * 25) + (volumeConfirmation ? 20 : -10);

    let direction: 'LONG' | 'SHORT' | null = null;
    if (simulatedScore >= config.entryThresholdScore) direction = 'LONG';
    else if (simulatedScore <= -config.entryThresholdScore) direction = 'SHORT';

    if (!direction) continue;

    // Account for entry slippage & fees
    const rawEntryPrice = currentCandle.close;
    const entryPrice = direction === 'LONG'
      ? rawEntryPrice * (1 + slippageRate)
      : rawEntryPrice * (1 - slippageRate);

    // Look forward to evaluate outcome in subsequent 1-5 bars
    const targetMovePct = (config.riskRewardTarget || 2.5) * 0.015;
    const stopMovePct = 0.018;

    let exitPrice = entryPrice;
    let exitReason: BacktestTrade['exitReason'] = 'TIME_EXPIRED';
    let exitIndex = i + 1;

    for (let j = i + 1; j < Math.min(i + 6, candles.length); j++) {
      const nextCandle = candles[j];
      exitIndex = j;

      if (direction === 'LONG') {
        if (nextCandle.high >= entryPrice * (1 + targetMovePct)) {
          exitPrice = entryPrice * (1 + targetMovePct);
          exitReason = 'TAKE_PROFIT';
          break;
        } else if (nextCandle.low <= entryPrice * (1 - stopMovePct)) {
          exitPrice = entryPrice * (1 - stopMovePct);
          exitReason = 'STOP_LOSS';
          break;
        }
      } else {
        if (nextCandle.low <= entryPrice * (1 - targetMovePct)) {
          exitPrice = entryPrice * (1 - targetMovePct);
          exitReason = 'TAKE_PROFIT';
          break;
        } else if (nextCandle.high >= entryPrice * (1 + stopMovePct)) {
          exitPrice = entryPrice * (1 + stopMovePct);
          exitReason = 'STOP_LOSS';
          break;
        }
      }
      exitPrice = nextCandle.close;
    }

    // Adjust exit for slippage
    if (direction === 'LONG') {
      exitPrice = exitPrice * (1 - slippageRate);
    } else {
      exitPrice = exitPrice * (1 + slippageRate);
    }

    const tradeSizeUsd = capital * 0.25; // 25% position sizing
    const rawReturnPct = direction === 'LONG'
      ? ((exitPrice - entryPrice) / entryPrice) * 100
      : ((entryPrice - exitPrice) / entryPrice) * 100;

    const roundTripFeesUsd = tradeSizeUsd * (feeRate * 2);
    const netProfitUsd = (tradeSizeUsd * (rawReturnPct / 100)) - roundTripFeesUsd;
    const returnPct = Number(((netProfitUsd / tradeSizeUsd) * 100).toFixed(2));

    capital += netProfitUsd;

    const trade: BacktestTrade = {
      id: `trade-${trades.length + 1}`,
      symbol: config.symbol,
      entryTime: new Date(currentCandle.time * 1000).toISOString(),
      exitTime: new Date(candles[exitIndex].time * 1000).toISOString(),
      direction,
      entryPrice: Number(entryPrice.toFixed(2)),
      exitPrice: Number(exitPrice.toFixed(2)),
      returnPct,
      netProfitUsd: Number(netProfitUsd.toFixed(2)),
      exitReason,
      feesUsd: Number(roundTripFeesUsd.toFixed(2))
    };

    trades.push(trade);
    equityCurve.push({
      date: new Date(candles[exitIndex].time * 1000).toISOString().split('T')[0],
      equity: Number(capital.toFixed(2))
    });
  }

  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.netProfitUsd > 0).length;
  const losingTrades = trades.filter(t => t.netProfitUsd <= 0).length;
  const winRatePct = totalTrades > 0 ? Number(((winningTrades / totalTrades) * 100).toFixed(1)) : 0;

  const totalGains = trades.filter(t => t.netProfitUsd > 0).reduce((s, t) => s + t.netProfitUsd, 0);
  const totalLosses = Math.abs(trades.filter(t => t.netProfitUsd < 0).reduce((s, t) => s + t.netProfitUsd, 0));
  const profitFactor = totalLosses > 0 ? Number((totalGains / totalLosses).toFixed(2)) : totalGains > 0 ? 99 : 1.0;

  const netReturnPct = Number((((capital - config.capitalUsd) / config.capitalUsd) * 100).toFixed(2));
  const avgWin = winningTrades > 0 ? totalGains / winningTrades : 0;
  const avgLoss = losingTrades > 0 ? totalLosses / losingTrades : 1;
  const expectancyPct = Number((( (winRatePct / 100) * avgWin - ((100 - winRatePct) / 100) * avgLoss ) / config.capitalUsd * 100).toFixed(2));

  // Max drawdown calculation
  let peak = config.capitalUsd;
  let maxDd = 0;
  for (const point of equityCurve) {
    if (point.equity > peak) peak = point.equity;
    const dd = ((peak - point.equity) / peak) * 100;
    if (dd > maxDd) maxDd = dd;
  }

  // Sharpe ratio (annualized approximation)
  const returns = trades.map(t => t.returnPct);
  const meanReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.length > 1 ? returns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / (returns.length - 1) : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? Number(((meanReturn / stdDev) * Math.sqrt(252)).toFixed(2)) : 1.5;

  return {
    config,
    totalTrades,
    winningTrades,
    losingTrades,
    winRatePct,
    profitFactor,
    expectancyPct,
    maxDrawdownPct: Number(maxDd.toFixed(2)),
    netReturnPct,
    sharpeRatio,
    finalCapitalUsd: Number(capital.toFixed(2)),
    equityCurve,
    trades
  };
}
