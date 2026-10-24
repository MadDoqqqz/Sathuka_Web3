import {
  MarketTicker,
  Candle,
  ETFFund,
  ETFDailyFlow,
  OrderBookData,
  DerivativesData,
  NewsArticle,
  TradingSignal,
  BacktestResult,
  DataProviderConfig,
  IngestionRun,
  AuditLog,
  User,
  Plan,
  UserRole
} from '../types';

const API_BASE = '/api/v1';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: `Request failed with status ${res.status}` }));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Health
  getHealth: () => request<any>('/health'),

  // Markets
  getMarkets: () => request<{ data: MarketTicker[]; timestamp: string }>('/markets'),
  getMarketDetail: (symbol: string) => request<{ ticker: MarketTicker; indicators: any }>('/markets/' + symbol),
  getCandles: (symbol: string, interval = '1h', limit = 100) =>
    request<{ candles: Candle[]; symbol: string; interval: string }>(`/markets/${symbol}/candles?interval=${interval}&limit=${limit}`),

  // ETF Flows
  getETFFlowSummary: () => request<{
    summary: {
      btcDailyNetFlowUsd: number;
      ethDailyNetFlowUsd: number;
      btcCumulativeFlowUsd: number;
      ethCumulativeFlowUsd: number;
      observationDate: string;
      reportingStatus: string;
      source: string;
    };
    recentBtcFlows: ETFDailyFlow[];
    recentEthFlows: ETFDailyFlow[];
  }>('/etf-flows/summary'),

  getETFFunds: () => request<{ funds: ETFFund[]; dailyFlows: ETFDailyFlow[]; totalAumUsd: number }>('/etf-flows/funds'),

  // Liquidity
  getOrderBook: (symbol = 'BTC', exchange = 'Binance') =>
    request<{ data: OrderBookData }>(`/liquidity/orderbook?symbol=${symbol}&exchange=${exchange}`),
  getCrossExchangeLiquidity: (symbol = 'BTC') =>
    request<{ symbol: string; exchanges: OrderBookData[] }>(`/liquidity/depth?symbol=${symbol}`),

  // Derivatives
  getDerivatives: (symbol?: string) =>
    request<{ data: DerivativesData | DerivativesData[] }>(symbol ? `/derivatives?symbol=${symbol}` : '/derivatives'),

  // Signals
  getPublicSignals: () => request<{ signals: TradingSignal[]; disclosure: string }>('/signals/public'),
  getSignals: (filters?: { symbol?: string; direction?: string; timeframe?: string }) => {
    const params = new URLSearchParams();
    if (filters?.symbol) params.append('symbol', filters.symbol);
    if (filters?.direction) params.append('direction', filters.direction);
    if (filters?.timeframe) params.append('timeframe', filters.timeframe);
    return request<{ signals: TradingSignal[]; count: number }>(`/signals?${params.toString()}`);
  },
  getSignalDetail: (id: string) => request<{ signal: TradingSignal }>(`/signals/${id}`),
  generateSignal: (symbol: string, timeframe = '4h') =>
    request<{ signal: TradingSignal }>('/signals/generate', {
      method: 'POST',
      body: JSON.stringify({ symbol, timeframe })
    }),
  getAIExplanation: (symbol: string) =>
    request<{ analysis: any }>('/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ symbol })
    }),

  // News
  getNews: (filters?: { category?: string; asset?: string; query?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.asset) params.append('asset', filters.asset);
    if (filters?.query) params.append('query', filters.query);
    return request<{ articles: NewsArticle[]; total: number }>(`/news?${params.toString()}`);
  },
  getNewsDetail: (id: string) => request<{ article: NewsArticle }>(`/news/${id}`),

  // Backtesting
  getBacktestDefault: () => request<{ result: BacktestResult }>('/backtests'),
  runBacktest: (config: any) =>
    request<{ result: BacktestResult }>('/backtests', {
      method: 'POST',
      body: JSON.stringify(config)
    }),

  // Watchlists & Alerts
  getWatchlists: () => request<{ symbols: string[] }>('/watchlists'),
  toggleWatchlist: (symbol: string) =>
    request<{ symbols: string[] }>('/watchlists', {
      method: 'POST',
      body: JSON.stringify({ symbol })
    }),
  getAlerts: () => request<{ alerts: any[] }>('/alerts'),
  createAlert: (alert: { symbol: string; type: string; threshold: number; channel?: string }) =>
    request<{ alert: any }>('/alerts', {
      method: 'POST',
      body: JSON.stringify(alert)
    }),
  deleteAlert: (id: string) => request<{ success: boolean }>(`/alerts/${id}`, { method: 'DELETE' }),

  // Account & Role Switcher
  getAccount: () => request<{ user: User; plan: Plan; availableTestProfiles: User[] }>('/account'),
  switchRoleOrUser: (payload: { role?: UserRole; planId?: string; switchUserId?: string }) =>
    request<{ user: User; message: string }>('/account/role', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  upgradePlan: (planId: string) =>
    request<{ success: boolean; plan: Plan; message: string }>('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId })
    }),

  // Admin
  getAdminProviders: () => request<{ providers: DataProviderConfig[] }>('/admin/providers'),
  getAdminIngestionRuns: () => request<{ runs: IngestionRun[] }>('/admin/ingestion-runs'),
  getAdminSystemHealth: () => request<any>('/admin/system-health'),
  testProvider: (id: string) => request<any>(`/admin/providers/${id}/test`, { method: 'POST' }),
  retryIngestionRun: (id: string) => request<any>(`/admin/ingestion-runs/${id}/retry`, { method: 'POST' }),
  getAdminAuditLogs: () => request<{ logs: AuditLog[] }>('/admin/audit-logs')
};
