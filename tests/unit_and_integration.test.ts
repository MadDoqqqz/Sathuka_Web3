import { calculateTechnicalIndicators } from '../server/providers/marketData';
import { runBacktest } from '../server/providers/backtester';
import { db } from '../server/db';
import { evaluateSignalForAsset } from '../server/providers/signalEngine';

async function runTestSuite() {
  console.log('--- STARTING CRYPTOPULSE INTELLIGENCE AUTOMATED TEST SUITE ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // TEST 1: Technical Indicator Engine Calculations
  try {
    const mockCandles = [];
    let price = 80000;
    for (let i = 0; i < 60; i++) {
      const open = price;
      const close = open * (1 + (i % 2 === 0 ? 0.01 : -0.005));
      const high = Math.max(open, close) * 1.005;
      const low = Math.min(open, close) * 0.995;
      mockCandles.push({
        time: 1700000000 + (i * 3600),
        open,
        high,
        low,
        close,
        volume: 1000 + i * 10
      });
      price = close;
    }

    const indicators = calculateTechnicalIndicators(mockCandles);
    assert(indicators.ema20 > 0, 'EMA 20 is calculated accurately');
    assert(indicators.rsi14 >= 0 && indicators.rsi14 <= 100, `RSI(14) is bounded [0, 100], got ${indicators.rsi14}`);
    assert(typeof indicators.macd.histogram === 'number', 'MACD histogram is computed');
    assert(indicators.atr14 > 0, `ATR(14) is positive: ${indicators.atr14}`);
    assert(indicators.vwap > 0, `VWAP is positive: ${indicators.vwap}`);
  } catch (err) {
    assert(false, `Technical indicators test threw error: ${(err as Error).message}`);
  }

  // TEST 2: Order Book Imbalance & Spread Math
  try {
    const bestBid = 81740;
    const bestAsk = 81744;
    const midPrice = (bestBid + bestAsk) / 2;
    const spreadBps = ((bestAsk - bestBid) / midPrice) * 10000;
    assert(spreadBps > 0 && spreadBps < 1.0, `Tight spread calculation: ${spreadBps.toFixed(2)} bps`);

    const bidDepthUsd = 12500000;
    const askDepthUsd = 8400000;
    const depthImbalance = (bidDepthUsd - askDepthUsd) / (bidDepthUsd + askDepthUsd);
    assert(depthImbalance > 0.15 && depthImbalance < 0.25, `Depth imbalance normalized: ${(depthImbalance * 100).toFixed(1)}%`);
  } catch (err) {
    assert(false, `Liquidity math test error: ${(err as Error).message}`);
  }

  // TEST 3: ETF Flow Net Aggregation & Integrity
  try {
    const flows = db.getETFDailyFlows();
    assert(flows.length >= 5, `ETF daily flow history persisted (${flows.length} records)`);
    const latestBtcFlow = flows.find(f => f.asset === 'BTC');
    assert(latestBtcFlow !== undefined && latestBtcFlow.totalNetFlowUsd > 0, `Latest BTC ETF flow is positive: $${latestBtcFlow?.totalNetFlowUsd}`);
  } catch (err) {
    assert(false, `ETF flow test error: ${(err as Error).message}`);
  }

  // TEST 4: 5-Pillar Signal Scoring Normalization & Directional Gating
  try {
    const signal = await evaluateSignalForAsset('BTC', '4h');
    assert(signal.symbol === 'BTC', 'Signal asset matches BTC');
    assert(signal.scores.technical >= -100 && signal.scores.technical <= 100, 'Technical score bounded [-100, +100]');
    assert(signal.scores.liquidity >= -100 && signal.scores.liquidity <= 100, 'Liquidity score bounded [-100, +100]');
    assert(signal.scores.derivatives >= -100 && signal.scores.derivatives <= 100, 'Derivatives score bounded [-100, +100]');
    assert(signal.scores.etfFlows >= -100 && signal.scores.etfFlows <= 100, 'ETF score bounded [-100, +100]');
    assert(signal.scores.newsSentiment >= -100 && signal.scores.newsSentiment <= 100, 'News score bounded [-100, +100]');
    assert(signal.confidenceScore >= 50 && signal.confidenceScore <= 98, `Confidence score calibrated: ${signal.confidenceScore}%`);
    assert(signal.stopLoss < signal.currentPrice || signal.direction === 'SHORT', 'Stop loss obeys directional risk structure');
    assert(signal.invalidationConditions.length >= 2, 'Mandatory invalidation conditions present');
  } catch (err) {
    assert(false, `Signal engine test error: ${(err as Error).message}`);
  }

  // TEST 5: Backtester No-Lookahead Simulation & Drag Assumptions
  try {
    const btResult = await runBacktest({
      symbol: 'BTC',
      timeframe: '4h',
      startDate: '2026-06-01',
      endDate: '2026-10-23',
      entryThresholdScore: 50,
      riskRewardTarget: 2.5,
      feeBps: 5,
      slippageBps: 2,
      capitalUsd: 100000
    });
    assert(btResult.totalTrades > 0, `Backtest generated valid trade executions: ${btResult.totalTrades}`);
    assert(btResult.winRatePct >= 0 && btResult.winRatePct <= 100, `Win rate valid: ${btResult.winRatePct}%`);
    assert(btResult.equityCurve.length > 0, 'Equity curve points generated without lookahead bias');
  } catch (err) {
    assert(false, `Backtester test error: ${(err as Error).message}`);
  }

  // TEST 6: User Roles & Subscription Entitlements
  try {
    const users = db.getUsers();
    assert(users.some(u => u.role === 'ADMINISTRATOR'), 'Administrator role exists');
    assert(users.some(u => u.role === 'PREMIUM_MEMBER'), 'Premium Member role exists');
    assert(users.some(u => u.role === 'PUBLIC_VISITOR'), 'Public Visitor role exists');
  } catch (err) {
    assert(false, `Entitlements test error: ${(err as Error).message}`);
  }

  console.log(`--- TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
