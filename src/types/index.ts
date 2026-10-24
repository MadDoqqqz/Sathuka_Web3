export type UserRole = 'PUBLIC_VISITOR' | 'PREMIUM_MEMBER' | 'ADMINISTRATOR';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  planId: string;
  subscriptionStatus: 'ACTIVE' | 'TRIALING' | 'CANCELED' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: 'Free' | 'Pro' | 'Premium';
  billingInterval: 'month' | 'year';
  priceAmount: number;
  currency: string;
  features: string[];
  isActive: boolean;
}

export interface MarketTicker {
  symbol: string;
  name: string;
  price: number;
  bid: number;
  ask: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24hUsd: number;
  volume24hBase: number;
  marketCapUsd: number;
  observedAt: string;
  source: string;
  status: 'LIVE' | 'DELAYED' | 'ESTIMATED';
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ETFFund {
  id: string;
  ticker: string;
  fundName: string;
  underlyingAsset: 'BTC' | 'ETH';
  issuer: string;
  feePercent: number;
  aumUsd: number;
  dailyFlowUsd: number;
  weeklyFlowUsd: number;
  monthlyFlowUsd: number;
  cumulativeFlowUsd: number;
  lastUpdatedDate: string;
  status: 'FINALIZED' | 'PRELIMINARY' | 'ESTIMATED';
  source: string;
}

export interface ETFDailyFlow {
  date: string;
  asset: 'BTC' | 'ETH';
  totalNetFlowUsd: number;
  priceUsd: number;
  fundBreakdown: Record<string, number>;
}

export interface OrderBookLevel {
  price: number;
  size: number;
  totalUsd: number;
}

export interface OrderBookData {
  symbol: string;
  exchange: 'Binance' | 'Coinbase' | 'OKX' | 'Bybit' | 'Kraken';
  midPrice: number;
  bestBid: number;
  bestAsk: number;
  spreadBps: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  bidDepth10bps: number;
  askDepth10bps: number;
  bidDepth25bps: number;
  askDepth25bps: number;
  bidDepth50bps: number;
  askDepth50bps: number;
  depthImbalance: number;
  observedAt: string;
  status: 'LIVE' | 'DELAYED' | 'ESTIMATED';
}

export interface DerivativesData {
  symbol: string;
  exchange: string;
  fundingRate: number;
  predictedFundingRate: number;
  nextFundingCountdown: string;
  openInterestUsd: number;
  openInterestNative: number;
  openInterestChange24h: number;
  futuresBasisBps: number;
  liquidationLong24hUsd: number;
  liquidationShort24hUsd: number;
  longShortRatio: number;
  observedAt: string;
  status: 'LIVE' | 'DELAYED' | 'ESTIMATED';
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  publisher: string;
  url: string;
  publishedAt: string;
  category: 'ETF' | 'Regulatory' | 'Macro' | 'Derivatives' | 'Technical' | 'On-Chain';
  relatedAssets: string[];
  sentimentScore: number;
  marketImpact: 'HIGH_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'HIGH_BEARISH';
  extractedEntities: string[];
  aiAnalysis: string;
}

export interface SignalScores {
  technical: number;
  liquidity: number;
  derivatives: number;
  etfFlows: number;
  newsSentiment: number;
  combinedScore: number;
}

export interface TradingSignal {
  id: string;
  symbol: string;
  timeframe: '15m' | '1h' | '4h' | '1D';
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  entryZoneMin: number;
  entryZoneMax: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  riskRewardRatio: number;
  confidenceScore: number;
  status: 'CANDIDATE' | 'ACTIVE' | 'TRIGGERED' | 'TARGET_PARTIAL' | 'TARGET_COMPLETE' | 'STOPPED' | 'INVALIDATED';
  scores: SignalScores;
  supportingEvidence: string[];
  contradictoryEvidence: string[];
  invalidationConditions: string[];
  methodologyVersion: string;
  createdAt: string;
  expiresAt: string;
  isPublicPreview: boolean;
  aiThesis?: string;
  outcome?: {
    grossReturnPct: number;
    netReturnPct: number;
    exitReason: string;
    evaluatedAt: string;
  };
}

export interface BacktestResult {
  config: {
    symbol: string;
    timeframe: string;
    startDate: string;
    endDate: string;
    entryThresholdScore: number;
    riskRewardTarget: number;
    feeBps: number;
    slippageBps: number;
    capitalUsd: number;
  };
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePct: number;
  profitFactor: number;
  expectancyPct: number;
  maxDrawdownPct: number;
  netReturnPct: number;
  sharpeRatio: number;
  finalCapitalUsd: number;
  equityCurve: { date: string; equity: number }[];
  trades: Array<{
    id: string;
    symbol: string;
    entryTime: string;
    exitTime: string;
    direction: 'LONG' | 'SHORT';
    entryPrice: number;
    exitPrice: number;
    returnPct: number;
    netProfitUsd: number;
    exitReason: 'TAKE_PROFIT' | 'STOP_LOSS' | 'TIME_EXPIRED';
    feesUsd: number;
  }>;
}

export interface DataProviderConfig {
  id: string;
  providerName: string;
  providerType: 'MarketData' | 'OrderBook' | 'Derivatives' | 'ETFFlow' | 'News' | 'AI';
  enabled: boolean;
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
  lastSuccessAt: string;
  lastErrorAt?: string;
  endpoint: string;
  rateLimitStatus: string;
  recordsProcessedToday: number;
  latencyMs: number;
}

export interface IngestionRun {
  id: string;
  providerName: string;
  jobType: string;
  startedAt: string;
  completedAt: string;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING';
  recordsProcessed: number;
  recordsFailed: number;
  errorSummary?: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  createdAt: string;
}
