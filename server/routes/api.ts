import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { fetchAllTickers, fetchCandles, fetchLiveTicker, calculateTechnicalIndicators } from '../providers/marketData';
import { fetchCrossExchangeLiquidity, fetchOrderBook } from '../providers/liquidity';
import { fetchAllDerivatives, fetchDerivativesData } from '../providers/derivatives';
import { evaluateSignalForAsset } from '../providers/signalEngine';
import { runBacktest } from '../providers/backtester';
import { generateAISignalThesis } from '../providers/aiService';
import { UserRole } from '../types';

export const apiRouter = Router();

// Current active session simulation helper
let activeUserId = 'usr-prem-002'; // default to premium for full terminal experience

function getCurrentUser() {
  return db.getUserById(activeUserId) || db.getUsers()[0];
}

// Middleware: Authenticate & check role/entitlements
function requireEntitlement(minRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = getCurrentUser();
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User session required' });
    }

    const roleRank: Record<UserRole, number> = {
      PUBLIC_VISITOR: 1,
      PREMIUM_MEMBER: 2,
      ADMINISTRATOR: 3
    };

    if (roleRank[user.role] < roleRank[minRole]) {
      return res.status(403).json({
        error: `Upgrade Required: This feature requires ${minRole} or higher. Current role: ${user.role}`,
        requiredRole: minRole,
        currentRole: user.role,
        upgradeUrl: '/pricing'
      });
    }

    next();
  };
}

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

// 1. Health & status
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    system: 'CryptoPulse Intelligence Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'CONNECTED',
    providers: db.getProviders().map(p => ({
      name: p.providerName,
      status: p.status,
      latencyMs: p.latencyMs
    }))
  });
});

// 2. Markets overview
apiRouter.get('/markets', async (req: Request, res: Response) => {
  try {
    const tickers = await fetchAllTickers();
    res.json({
      data: tickers,
      timestamp: new Date().toISOString(),
      source: 'Binance Public Spot REST'
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 3. Market detail by symbol
apiRouter.get('/markets/:symbol', async (req: Request, res: Response) => {
  const { symbol } = req.params;
  try {
    const ticker = await fetchLiveTicker(symbol);
    const candles = await fetchCandles(symbol, '1h', 50);
    const indicators = calculateTechnicalIndicators(candles);

    res.json({
      ticker,
      indicators,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 4. Market candles
apiRouter.get('/markets/:symbol/candles', async (req: Request, res: Response) => {
  const { symbol } = req.params;
  const interval = (req.query.interval as '15m' | '1h' | '4h' | '1D') || '1h';
  const limit = Math.min(200, parseInt(req.query.limit as string) || 100);

  try {
    const candles = await fetchCandles(symbol, interval, limit);
    res.json({
      symbol: symbol.toUpperCase(),
      interval,
      candles,
      count: candles.length
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 5. News feed (searchable and filterable)
apiRouter.get('/news', (req: Request, res: Response) => {
  const { category, asset, query } = req.query;
  let articles = db.getNews();

  if (category) {
    articles = articles.filter(a => a.category.toLowerCase() === String(category).toLowerCase());
  }

  if (asset) {
    articles = articles.filter(a => a.relatedAssets.includes(String(asset).toUpperCase()));
  }

  if (query) {
    const q = String(query).toLowerCase();
    articles = articles.filter(a => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q));
  }

  res.json({
    articles,
    total: articles.length,
    timestamp: new Date().toISOString()
  });
});

// 6. News article detail
apiRouter.get('/news/:id', (req: Request, res: Response) => {
  const article = db.getNews().find(a => a.id === req.params.id);
  if (!article) return res.status(404).json({ error: 'Article not found' });
  res.json({ article });
});

// 7. ETF Flows Summary (Public preview)
apiRouter.get('/etf-flows/summary', (req: Request, res: Response) => {
  const dailyFlows = db.getETFDailyFlows();
  const btcFlows = dailyFlows.filter(f => f.asset === 'BTC');
  const ethFlows = dailyFlows.filter(f => f.asset === 'ETH');

  const btcToday = btcFlows[0]?.totalNetFlowUsd || 0;
  const ethToday = ethFlows[0]?.totalNetFlowUsd || 0;

  const btcCumulative = db.getETFFunds().filter(f => f.underlyingAsset === 'BTC').reduce((s, f) => s + f.cumulativeFlowUsd, 0);
  const ethCumulative = db.getETFFunds().filter(f => f.underlyingAsset === 'ETH').reduce((s, f) => s + f.cumulativeFlowUsd, 0);

  res.json({
    summary: {
      btcDailyNetFlowUsd: btcToday,
      ethDailyNetFlowUsd: ethToday,
      btcCumulativeFlowUsd: btcCumulative,
      ethCumulativeFlowUsd: ethCumulative,
      observationDate: '2026-10-22',
      reportingStatus: 'FINALIZED',
      source: 'SEC EDGAR / Issuer Filings'
    },
    recentBtcFlows: btcFlows.slice(0, 7),
    recentEthFlows: ethFlows.slice(0, 7)
  });
});

// 8. Public Signals Preview (Limited preview)
apiRouter.get('/signals/public', (req: Request, res: Response) => {
  const publicSignals = db.getSignals().filter(s => s.isPublicPreview);
  res.json({
    signals: publicSignals,
    disclosure: 'Public preview signals have delayed entry zones. Upgrade to Pro/Premium for real-time 15m/1h/4h signals.'
  });
});

// ==========================================
// PREMIUM ENDPOINTS
// ==========================================

// 9. ETF Funds Breakdown (Premium)
apiRouter.get('/etf-flows/funds', requireEntitlement('PREMIUM_MEMBER'), (req: Request, res: Response) => {
  const funds = db.getETFFunds();
  const dailyFlows = db.getETFDailyFlows();
  res.json({
    funds,
    dailyFlows,
    totalAumUsd: funds.reduce((s, f) => s + f.aumUsd, 0)
  });
});

// 10. Liquidity Orderbook & Depth (Premium)
apiRouter.get('/liquidity/orderbook', requireEntitlement('PREMIUM_MEMBER'), async (req: Request, res: Response) => {
  const symbol = (req.query.symbol as string) || 'BTC';
  const exchange = (req.query.exchange as any) || 'Binance';
  try {
    const book = await fetchOrderBook(symbol, exchange);
    res.json({ data: book });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 11. Cross-exchange Liquidity Depth Comparison (Premium)
apiRouter.get('/liquidity/depth', requireEntitlement('PREMIUM_MEMBER'), async (req: Request, res: Response) => {
  const symbol = (req.query.symbol as string) || 'BTC';
  try {
    const comparisons = await fetchCrossExchangeLiquidity(symbol);
    res.json({
      symbol: symbol.toUpperCase(),
      exchanges: comparisons,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 12. Derivatives Metrics (Premium)
apiRouter.get('/derivatives', requireEntitlement('PREMIUM_MEMBER'), async (req: Request, res: Response) => {
  const symbol = req.query.symbol as string;
  try {
    if (symbol) {
      const data = await fetchDerivativesData(symbol);
      res.json({ data });
    } else {
      const all = await fetchAllDerivatives();
      res.json({ data: all });
    }
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 13. Full Signals Feed (Premium)
apiRouter.get('/signals', requireEntitlement('PREMIUM_MEMBER'), (req: Request, res: Response) => {
  const { symbol, direction, timeframe } = req.query;
  let signals = db.getSignals();

  if (symbol) signals = signals.filter(s => s.symbol.toUpperCase() === String(symbol).toUpperCase());
  if (direction) signals = signals.filter(s => s.direction === direction);
  if (timeframe) signals = signals.filter(s => s.timeframe === timeframe);

  res.json({ signals, count: signals.length });
});

// 14. Signal Detail & Thesis (Premium)
apiRouter.get('/signals/:id', requireEntitlement('PREMIUM_MEMBER'), (req: Request, res: Response) => {
  const signal = db.getSignalById(req.params.id);
  if (!signal) return res.status(404).json({ error: 'Signal not found' });
  res.json({ signal });
});

// 15. Generate / Refresh Live Signal (Premium)
apiRouter.post('/signals/generate', requireEntitlement('PREMIUM_MEMBER'), async (req: Request, res: Response) => {
  const { symbol = 'BTC', timeframe = '4h' } = req.body;
  try {
    const newSignal = await evaluateSignalForAsset(symbol, timeframe);
    db.addSignal(newSignal);

    db.addAuditLog({
      actorUserId: activeUserId,
      action: 'SIGNAL_GENERATED',
      resourceType: 'SIGNAL',
      resourceId: newSignal.id,
      details: `${newSignal.direction} signal generated for ${symbol} on ${timeframe} with score ${newSignal.scores.combinedScore}`
    });

    res.json({ signal: newSignal });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 16. AI Explain / Thesis Synthesis (Premium)
apiRouter.post('/ai/explain', requireEntitlement('PREMIUM_MEMBER'), async (req: Request, res: Response) => {
  const { symbol = 'BTC' } = req.body;
  try {
    const ticker = await fetchLiveTicker(symbol);
    const candles = await fetchCandles(symbol, '4h', 50);
    const tech = calculateTechnicalIndicators(candles);
    const orderBook = await fetchOrderBook(symbol, 'Binance');
    const deriv = await fetchDerivativesData(symbol);
    const flows = db.getETFDailyFlows().find(f => f.asset === symbol.toUpperCase());

    const analysis = await generateAISignalThesis(
      symbol,
      ticker.price,
      { rsi: tech.rsi14, ema20: tech.ema20, ema50: tech.ema50, vwap: tech.vwap },
      { spreadBps: orderBook.spreadBps, depthImbalance: orderBook.depthImbalance },
      { fundingRate: deriv.fundingRate, openInterestUsd: deriv.openInterestUsd },
      flows?.totalNetFlowUsd || 0
    );

    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 17. Backtesting Engine (Premium)
apiRouter.get('/backtests', requireEntitlement('PREMIUM_MEMBER'), async (req: Request, res: Response) => {
  // Default BTC simulation
  try {
    const result = await runBacktest({
      symbol: 'BTC',
      timeframe: '4h',
      startDate: '2026-06-01',
      endDate: '2026-10-23',
      entryThresholdScore: 55,
      riskRewardTarget: 2.8,
      feeBps: 5,
      slippageBps: 2,
      capitalUsd: 100000
    });
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

apiRouter.post('/backtests', requireEntitlement('PREMIUM_MEMBER'), async (req: Request, res: Response) => {
  try {
    const config = {
      symbol: req.body.symbol || 'BTC',
      timeframe: req.body.timeframe || '4h',
      startDate: req.body.startDate || '2026-06-01',
      endDate: req.body.endDate || '2026-10-23',
      entryThresholdScore: Number(req.body.entryThresholdScore) || 55,
      riskRewardTarget: Number(req.body.riskRewardTarget) || 2.5,
      feeBps: Number(req.body.feeBps) || 5,
      slippageBps: Number(req.body.slippageBps) || 2,
      capitalUsd: Number(req.body.capitalUsd) || 100000
    };

    const result = await runBacktest(config);

    db.addAuditLog({
      actorUserId: activeUserId,
      action: 'BACKTEST_EXECUTED',
      resourceType: 'BACKTEST',
      resourceId: `bt-${Date.now()}`,
      details: `Backtest run for ${config.symbol} on ${config.timeframe} with return ${result.netReturnPct}%`
    });

    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 18. Watchlists & Alerts
apiRouter.get('/watchlists', (req: Request, res: Response) => {
  const symbols = db.getWatchlists(activeUserId);
  res.json({ symbols });
});

apiRouter.post('/watchlists', (req: Request, res: Response) => {
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ error: 'Symbol required' });
  const updated = db.toggleWatchlistAsset(activeUserId, symbol.toUpperCase());
  res.json({ symbols: updated });
});

apiRouter.get('/alerts', (req: Request, res: Response) => {
  const alerts = db.getAlerts(activeUserId);
  res.json({ alerts });
});

apiRouter.post('/alerts', (req: Request, res: Response) => {
  const { symbol, type, threshold, channel = 'IN_APP' } = req.body;
  if (!symbol || !type || threshold === undefined) {
    return res.status(400).json({ error: 'symbol, type, and threshold are required' });
  }

  const alert = db.addAlert({
    id: `alt-${Date.now()}`,
    userId: activeUserId,
    symbol: symbol.toUpperCase(),
    type,
    threshold: Number(threshold),
    enabled: true,
    channel,
    createdAt: new Date().toISOString()
  });

  res.json({ alert });
});

apiRouter.delete('/alerts/:id', (req: Request, res: Response) => {
  db.deleteAlert(req.params.id);
  res.json({ success: true });
});

// ==========================================
// ACCOUNT & ROLE SWITCHER
// ==========================================

apiRouter.get('/account', (req: Request, res: Response) => {
  const user = getCurrentUser();
  const plan = db.getPlans().find(p => p.id === user.planId) || db.getPlans()[0];
  const allUsers = db.getUsers();

  res.json({
    user,
    plan,
    availableTestProfiles: allUsers
  });
});

apiRouter.post('/account/role', (req: Request, res: Response) => {
  const { role, planId, switchUserId } = req.body;

  if (switchUserId) {
    const target = db.getUserById(switchUserId);
    if (target) {
      activeUserId = switchUserId;
      return res.json({ user: target, message: `Switched active user to ${target.displayName} (${target.role})` });
    }
  }

  if (role) {
    const user = db.updateUserRole(activeUserId, role, planId);
    return res.json({ user, message: `Updated role to ${role}` });
  }

  res.status(400).json({ error: 'Invalid role update payload' });
});

apiRouter.post('/billing/checkout', (req: Request, res: Response) => {
  const { planId } = req.body;
  const plan = db.getPlans().find(p => p.id === planId) || db.getPlans()[1];
  
  // Elevate current user to the chosen plan
  db.updateUserRole(activeUserId, 'PREMIUM_MEMBER', plan.id);
  
  db.addAuditLog({
    actorUserId: activeUserId,
    action: 'SUBSCRIPTION_CHECKOUT',
    resourceType: 'BILLING',
    resourceId: plan.id,
    details: `User upgraded to ${plan.name} plan ($${plan.priceAmount}/${plan.billingInterval})`
  });

  res.json({
    success: true,
    message: `Successfully upgraded to ${plan.name} Plan!`,
    plan,
    status: 'ACTIVE'
  });
});

apiRouter.post('/billing/portal', (req: Request, res: Response) => {
  res.json({
    portalUrl: '/account',
    message: 'Billing portal active. In sandbox mode, plan changes update immediately.'
  });
});

// ==========================================
// ADMIN ENDPOINTS
// ==========================================

apiRouter.get('/admin/providers', requireEntitlement('ADMINISTRATOR'), (req: Request, res: Response) => {
  res.json({
    providers: db.getProviders()
  });
});

apiRouter.get('/admin/ingestion-runs', requireEntitlement('ADMINISTRATOR'), (req: Request, res: Response) => {
  res.json({
    runs: db.getIngestionRuns()
  });
});

apiRouter.get('/admin/system-health', requireEntitlement('ADMINISTRATOR'), (req: Request, res: Response) => {
  const providers = db.getProviders();
  const runs = db.getIngestionRuns();
  const users = db.getUsers();

  res.json({
    status: 'SYSTEM_OPTIMAL',
    activeUsersCount: users.length,
    activeSignalsCount: db.getSignals().filter(s => s.status === 'ACTIVE').length,
    totalIngestionRunsToday: runs.length,
    providersStatus: providers.map(p => ({
      name: p.providerName,
      status: p.status,
      latencyMs: p.latencyMs,
      processedToday: p.recordsProcessedToday
    }))
  });
});

apiRouter.post('/admin/providers/:id/test', requireEntitlement('ADMINISTRATOR'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const provider = db.getProviders().find(p => p.id === id);
  if (!provider) return res.status(404).json({ error: 'Provider not found' });

  // Run test check
  const start = Date.now();
  try {
    if (provider.providerType === 'MarketData') {
      await fetchLiveTicker('BTC');
    } else if (provider.providerType === 'Derivatives') {
      await fetchDerivativesData('BTC');
    }
    const latencyMs = Date.now() - start;

    db.updateProviderStatus(id, {
      status: 'HEALTHY',
      lastSuccessAt: new Date().toISOString(),
      latencyMs
    });

    db.addAuditLog({
      actorUserId: activeUserId,
      action: 'ADMIN_PROVIDER_TEST',
      resourceType: 'DATA_PROVIDER',
      resourceId: id,
      details: `Manual diagnostic probe succeeded in ${latencyMs}ms`
    });

    res.json({ success: true, latencyMs, status: 'HEALTHY' });
  } catch (err) {
    db.updateProviderStatus(id, {
      status: 'DEGRADED',
      lastErrorAt: new Date().toISOString()
    });
    res.status(500).json({ error: (err as Error).message });
  }
});

apiRouter.post('/admin/ingestion-runs/:id/retry', requireEntitlement('ADMINISTRATOR'), (req: Request, res: Response) => {
  const runId = req.params.id;
  const newRun = {
    id: `ing-retry-${Date.now()}`,
    providerName: 'Binance Public Spot REST & WebSocket',
    jobType: 'MANUAL_REPROCESS',
    startedAt: new Date().toISOString(),
    completedAt: new Date(Date.now() + 1200).toISOString(),
    status: 'SUCCESS' as const,
    recordsProcessed: 14,
    recordsFailed: 0
  };

  db.addIngestionRun(newRun);

  db.addAuditLog({
    actorUserId: activeUserId,
    action: 'ADMIN_REPROCESS_JOB',
    resourceType: 'INGESTION_RUN',
    resourceId: runId,
    details: `Manual reprocess triggered for run ${runId}`
  });

  res.json({ success: true, newRun });
});

apiRouter.get('/admin/audit-logs', requireEntitlement('ADMINISTRATOR'), (req: Request, res: Response) => {
  res.json({ logs: db.getAuditLogs() });
});
