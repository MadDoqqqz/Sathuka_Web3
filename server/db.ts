import fs from 'fs';
import path from 'path';
import {
  User,
  Plan,
  Asset,
  ETFFund,
  ETFDailyFlow,
  NewsArticle,
  TradingSignal,
  DataProviderConfig,
  IngestionRun,
  AuditLog
} from './types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'crypto_pulse.json');

export interface DatabaseState {
  users: User[];
  plans: Plan[];
  assets: Asset[];
  etfFunds: ETFFund[];
  etfDailyFlows: ETFDailyFlow[];
  newsArticles: NewsArticle[];
  signals: TradingSignal[];
  watchlists: Record<string, string[]>; // userId -> array of symbols
  alerts: Array<{
    id: string;
    userId: string;
    symbol: string;
    type: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'SIGNAL_TRIGGER' | 'ETF_INFLOW_SPIKE' | 'FUNDING_EXTREME';
    threshold: number;
    enabled: boolean;
    channel: 'EMAIL' | 'TELEGRAM' | 'IN_APP';
    createdAt: string;
  }>;
  providerConfigs: DataProviderConfig[];
  ingestionRuns: IngestionRun[];
  auditLogs: AuditLog[];
}

function getInitialState(): DatabaseState {
  const now = new Date().toISOString();
  
  return {
    users: [
      {
        id: 'usr-admin-001',
        email: 'admin@cryptopulse.io',
        displayName: 'Sathuka Head of Research',
        role: 'ADMINISTRATOR',
        planId: 'plan-premium',
        subscriptionStatus: 'ACTIVE',
        createdAt: '2026-01-10T00:00:00Z',
        updatedAt: now
      },
      {
        id: 'usr-prem-002',
        email: 'trader@institutional.capital',
        displayName: 'Quant Desk Lead',
        role: 'PREMIUM_MEMBER',
        planId: 'plan-pro',
        subscriptionStatus: 'ACTIVE',
        createdAt: '2026-02-01T00:00:00Z',
        updatedAt: now
      },
      {
        id: 'usr-pub-003',
        email: 'analyst@web3community.org',
        displayName: 'Community Analyst',
        role: 'PUBLIC_VISITOR',
        planId: 'plan-free',
        subscriptionStatus: 'INACTIVE',
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: now
      }
    ],
    plans: [
      {
        id: 'plan-free',
        name: 'Free',
        billingInterval: 'month',
        priceAmount: 0,
        currency: 'USD',
        features: [
          'Public Market Overview (BTC, ETH, SOL, Alts)',
          'Daily Delayed News Feed (15 min delay)',
          'Limited Signal Previews (Daily Candidate only)',
          'Methodology & Educational Documentation',
          'Single Watchlist (Up to 5 assets)'
        ],
        isActive: true
      },
      {
        id: 'plan-pro',
        name: 'Pro',
        billingInterval: 'month',
        priceAmount: 49,
        currency: 'USD',
        features: [
          'Real-time CEX Market Feeds & Candlestick Charts',
          'Full Signal Engine Rationale & Invalidation Zones',
          'Detailed US Spot BTC & ETH ETF Flow Analytics',
          'Derivatives Dashboard (Funding Rates & Open Interest)',
          'Unlimited Watchlists & Email/Telegram Alerts',
          'Standard Strategy Backtester (1-year history)'
        ],
        isActive: true
      },
      {
        id: 'plan-premium',
        name: 'Premium',
        billingInterval: 'month',
        priceAmount: 129,
        currency: 'USD',
        features: [
          'Everything in Pro, plus:',
          'Deep CEX Order-Book Depth & Imbalance (10/25/50 bps)',
          'AI-Assisted News Sentiment & Macro Event Synthesis',
          'Institutional Fund-Level ETF Flow Disclosures',
          'Walk-Forward Strategy Backtesting & Monte Carlo Simulation',
          'Priority Webhook & Direct REST API Access',
          'Multi-user Institutional Workspace Support'
        ],
        isActive: true
      }
    ],
    assets: [
      { id: 'ast-btc', symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin Core', isActive: true, color: '#F7931A' },
      { id: 'ast-eth', symbol: 'ETH', name: 'Ethereum', network: 'Ethereum', isActive: true, color: '#627EEA' },
      { id: 'ast-sol', symbol: 'SOL', name: 'Solana', network: 'Solana', isActive: true, color: '#14F195' },
      { id: 'ast-bnb', symbol: 'BNB', name: 'BNB', network: 'BNB Chain', isActive: true, color: '#F3BA2F' },
      { id: 'ast-xrp', symbol: 'XRP', name: 'XRP', network: 'XRP Ledger', isActive: true, color: '#23292F' },
      { id: 'ast-doge', symbol: 'DOGE', name: 'Dogecoin', network: 'Dogecoin', isActive: true, color: '#C2A633' },
      { id: 'ast-link', symbol: 'LINK', name: 'Chainlink', network: 'Ethereum', isActive: true, color: '#375BD2' }
    ],
    etfFunds: [
      // US Spot BTC ETFs
      {
        id: 'etf-ibit',
        ticker: 'IBIT',
        fundName: 'iShares Bitcoin Trust',
        underlyingAsset: 'BTC',
        issuer: 'BlackRock',
        feePercent: 0.25,
        aumUsd: 28450000000,
        dailyFlowUsd: 142600000,
        weeklyFlowUsd: 685000000,
        monthlyFlowUsd: 2150000000,
        cumulativeFlowUsd: 26800000000,
        lastUpdatedDate: '2026-10-22',
        status: 'FINALIZED',
        source: 'SEC Form 8-K & BlackRock Issuer Portal'
      },
      {
        id: 'etf-fbtc',
        ticker: 'FBTC',
        fundName: 'Fidelity Wise Origin Bitcoin Fund',
        underlyingAsset: 'BTC',
        issuer: 'Fidelity',
        feePercent: 0.25,
        aumUsd: 14820000000,
        dailyFlowUsd: 68400000,
        weeklyFlowUsd: 312000000,
        monthlyFlowUsd: 940000000,
        cumulativeFlowUsd: 12200000000,
        lastUpdatedDate: '2026-10-22',
        status: 'FINALIZED',
        source: 'Fidelity Fund Analytics'
      },
      {
        id: 'etf-arkb',
        ticker: 'ARKB',
        fundName: 'ARK 21Shares Bitcoin ETF',
        underlyingAsset: 'BTC',
        issuer: 'ARK / 21Shares',
        feePercent: 0.21,
        aumUsd: 3950000000,
        dailyFlowUsd: 18200000,
        weeklyFlowUsd: 74500000,
        monthlyFlowUsd: 210000000,
        cumulativeFlowUsd: 3100000000,
        lastUpdatedDate: '2026-10-22',
        status: 'FINALIZED',
        source: '21Shares Reporting'
      },
      {
        id: 'etf-bitb',
        ticker: 'BITB',
        fundName: 'Bitwise Bitcoin ETF',
        underlyingAsset: 'BTC',
        issuer: 'Bitwise',
        feePercent: 0.20,
        aumUsd: 2980000000,
        dailyFlowUsd: 12500000,
        weeklyFlowUsd: 58000000,
        monthlyFlowUsd: 180000000,
        cumulativeFlowUsd: 2450000000,
        lastUpdatedDate: '2026-10-22',
        status: 'FINALIZED',
        source: 'Bitwise Asset Management'
      },
      {
        id: 'etf-gbtc',
        ticker: 'GBTC',
        fundName: 'Grayscale Bitcoin Trust',
        underlyingAsset: 'BTC',
        issuer: 'Grayscale',
        feePercent: 1.50,
        aumUsd: 13200000000,
        dailyFlowUsd: -14800000,
        weeklyFlowUsd: -48000000,
        monthlyFlowUsd: -195000000,
        cumulativeFlowUsd: -20800000000,
        lastUpdatedDate: '2026-10-22',
        status: 'FINALIZED',
        source: 'Grayscale Disclosures'
      },
      // US Spot ETH ETFs
      {
        id: 'etf-etha',
        ticker: 'ETHA',
        fundName: 'iShares Ethereum Trust',
        underlyingAsset: 'ETH',
        issuer: 'BlackRock',
        feePercent: 0.25,
        aumUsd: 1840000000,
        dailyFlowUsd: 38200000,
        weeklyFlowUsd: 142000000,
        monthlyFlowUsd: 410000000,
        cumulativeFlowUsd: 1620000000,
        lastUpdatedDate: '2026-10-22',
        status: 'FINALIZED',
        source: 'BlackRock Issuer Portal'
      },
      {
        id: 'etf-feth',
        ticker: 'FETH',
        fundName: 'Fidelity Ethereum Fund',
        underlyingAsset: 'ETH',
        issuer: 'Fidelity',
        feePercent: 0.25,
        aumUsd: 890000000,
        dailyFlowUsd: 16400000,
        weeklyFlowUsd: 68000000,
        monthlyFlowUsd: 210000000,
        cumulativeFlowUsd: 780000000,
        lastUpdatedDate: '2026-10-22',
        status: 'FINALIZED',
        source: 'Fidelity Institutional'
      },
      {
        id: 'etf-ethe',
        ticker: 'ETHE',
        fundName: 'Grayscale Ethereum Trust',
        underlyingAsset: 'ETH',
        issuer: 'Grayscale',
        feePercent: 2.50,
        aumUsd: 4200000000,
        dailyFlowUsd: -9500000,
        weeklyFlowUsd: -34000000,
        monthlyFlowUsd: -145000000,
        cumulativeFlowUsd: -3100000000,
        lastUpdatedDate: '2026-10-22',
        status: 'FINALIZED',
        source: 'Grayscale Disclosures'
      }
    ],
    etfDailyFlows: [
      {
        date: '2026-10-22',
        asset: 'BTC',
        totalNetFlowUsd: 226900000,
        priceUsd: 81450,
        fundBreakdown: { IBIT: 142600000, FBTC: 68400000, ARKB: 18200000, BITB: 12500000, GBTC: -14800000 }
      },
      {
        date: '2026-10-21',
        asset: 'BTC',
        totalNetFlowUsd: 198400000,
        priceUsd: 80920,
        fundBreakdown: { IBIT: 128000000, FBTC: 54000000, ARKB: 21000000, BITB: 11400000, GBTC: -16000000 }
      },
      {
        date: '2026-10-20',
        asset: 'BTC',
        totalNetFlowUsd: 164500000,
        priceUsd: 79800,
        fundBreakdown: { IBIT: 115000000, FBTC: 42000000, ARKB: 14500000, BITB: 8000000, GBTC: -15000000 }
      },
      {
        date: '2026-10-19',
        asset: 'BTC',
        totalNetFlowUsd: 95000000,
        priceUsd: 79100,
        fundBreakdown: { IBIT: 72000000, FBTC: 28000000, ARKB: 9000000, BITB: 6000000, GBTC: -20000000 }
      },
      {
        date: '2026-10-18',
        asset: 'BTC',
        totalNetFlowUsd: -42000000,
        priceUsd: 78400,
        fundBreakdown: { IBIT: 18000000, FBTC: 5000000, ARKB: -3000000, BITB: 2000000, GBTC: -64000000 }
      },
      {
        date: '2026-10-17',
        asset: 'BTC',
        totalNetFlowUsd: 124000000,
        priceUsd: 78900,
        fundBreakdown: { IBIT: 89000000, FBTC: 35000000, ARKB: 12000000, BITB: 8000000, GBTC: -20000000 }
      },
      {
        date: '2026-10-16',
        asset: 'BTC',
        totalNetFlowUsd: 182000000,
        priceUsd: 79500,
        fundBreakdown: { IBIT: 120000000, FBTC: 48000000, ARKB: 16000000, BITB: 10000000, GBTC: -12000000 }
      },
      // ETH daily flows
      {
        date: '2026-10-22',
        asset: 'ETH',
        totalNetFlowUsd: 45100000,
        priceUsd: 2680,
        fundBreakdown: { ETHA: 38200000, FETH: 16400000, ETHE: -9500000 }
      },
      {
        date: '2026-10-21',
        asset: 'ETH',
        totalNetFlowUsd: 38400000,
        priceUsd: 2645,
        fundBreakdown: { ETHA: 31000000, FETH: 18500000, ETHE: -11100000 }
      },
      {
        date: '2026-10-20',
        asset: 'ETH',
        totalNetFlowUsd: 27900000,
        priceUsd: 2610,
        fundBreakdown: { ETHA: 24000000, FETH: 14200000, ETHE: -10300000 }
      }
    ],
    newsArticles: [
      {
        id: 'news-001',
        title: 'Institutional Inflows Into US Spot Bitcoin ETFs Hit 4-Month High as BlackRock IBIT Crosses $28B',
        summary: 'Net daily inflow across US spot Bitcoin ETFs accelerated to $226.9M, led by BlackRock IBIT ($142.6M) and Fidelity FBTC ($68.4M), marking five consecutive days of positive accumulation while Grayscale GBTC redemptions subsided.',
        publisher: 'Bloomberg Financial / Sathuka Research Desk',
        url: 'https://bloomberg.com/crypto/etf-flows-oct-2026',
        publishedAt: '2026-10-23T00:30:00Z',
        category: 'ETF',
        relatedAssets: ['BTC', 'ETH'],
        sentimentScore: 78,
        marketImpact: 'HIGH_BULLISH',
        extractedEntities: ['BlackRock', 'IBIT', 'Fidelity', 'SEC', 'Grayscale'],
        aiAnalysis: 'Strong sustained institutional demand absorbing exchange spot supply. CME basis remains robust at 9.4% annualized, indicating spot cash-and-carry institutional interest alongside directional long bids.'
      },
      {
        id: 'news-002',
        title: 'Binance Order-Book Imbalance Flashes 25bps Depth Skew Favoring Bids at $81,200 Support',
        summary: 'Combined CEX depth metrics indicate a +34.2% bid/ask imbalance within 25 bps of mid-price across Binance and Coinbase, establishing dense structural limit-order defense against weekend volatility.',
        publisher: 'CryptoPulse Quantitative Dispatch',
        url: 'https://cryptopulse.io/research/cex-depth-analysis-oct23',
        publishedAt: '2026-10-22T21:15:00Z',
        category: 'Technical',
        relatedAssets: ['BTC', 'SOL'],
        sentimentScore: 62,
        marketImpact: 'BULLISH',
        extractedEntities: ['Binance', 'Coinbase', 'CEX Liquidity', 'Order Book'],
        aiAnalysis: 'Aggregated bid depth is $42.8M vs ask depth of $28.3M within 50 bps. Spread compressed to 0.42 bps on Binance BTC/USDT, demonstrating high institutional market maker presence.'
      },
      {
        id: 'news-003',
        title: 'Federal Reserve Policy Outlook Sparks Macro Tailwinds for Risk Assets and Tokenized Treasuries',
        summary: 'Global liquidity indices expanded by $340B this week as central bank repo operations and stablecoin treasury reserves reach fresh highs, sustaining high correlation with digital asset market capitalization.',
        publisher: 'Financial Times / Macro Intelligence',
        url: 'https://ft.com/macro/crypto-liquidity-expansion-2026',
        publishedAt: '2026-10-22T16:00:00Z',
        category: 'Macro',
        relatedAssets: ['BTC', 'ETH', 'SOL'],
        sentimentScore: 55,
        marketImpact: 'BULLISH',
        extractedEntities: ['Federal Reserve', 'Treasury', 'Stablecoins', 'Macro Liquidity'],
        aiAnalysis: 'Macro monetary easing posture lowers opportunity cost of capital; derivatives open interest climbed 4.8% alongside stablecoin minting on Ethereum and Solana.'
      },
      {
        id: 'news-004',
        title: 'Solana DeFi Total Value Locked Climbs Past $6.8B Amid High DEX Trading Velocity',
        summary: 'Decentralized exchange volumes on Solana maintain parity with mainnet Ethereum, driven by automated market makers, restaking protocols, and high perpetual futures turnover.',
        publisher: 'Coindesk Analytics',
        url: 'https://coindesk.com/markets/solana-dex-volume-surge',
        publishedAt: '2026-10-22T11:45:00Z',
        category: 'On-Chain',
        relatedAssets: ['SOL'],
        sentimentScore: 68,
        marketImpact: 'BULLISH',
        extractedEntities: ['Solana', 'DEX', 'DeFi', 'Perpetuals'],
        aiAnalysis: 'On-chain fee generation remains high; funding rates on SOLUSDT perpetual contracts average 0.012% per 8 hours, signaling disciplined speculative appetite without over-leverage.'
      },
      {
        id: 'news-005',
        title: 'European Union Finalizes MiCA Operational Guidelines for Crypto Asset Custodians',
        summary: 'Regulatory clarity takes full effect as licensed institutions receive standardized compliance benchmarks for digital asset segregation and transaction transparency.',
        publisher: 'Reuters Technology & Policy',
        url: 'https://reuters.com/markets/mica-regulations-crypto-europe',
        publishedAt: '2026-10-21T18:20:00Z',
        category: 'Regulatory',
        relatedAssets: ['BTC', 'ETH'],
        sentimentScore: 45,
        marketImpact: 'NEUTRAL',
        extractedEntities: ['European Union', 'MiCA', 'ESMA', 'Custody'],
        aiAnalysis: 'Neutral-to-positive in the medium term as regulatory de-risking permits tier-1 European banks to expand crypto structured note offerings.'
      }
    ],
    signals: [
      {
        id: 'sig-btc-001',
        symbol: 'BTC',
        timeframe: '4h',
        direction: 'LONG',
        entryZoneMin: 81200,
        entryZoneMax: 81650,
        currentPrice: 81745,
        stopLoss: 79800,
        takeProfit1: 83500,
        takeProfit2: 85200,
        takeProfit3: 88000,
        riskRewardRatio: 3.2,
        confidenceScore: 84,
        status: 'ACTIVE',
        scores: {
          technical: 75,
          liquidity: 82,
          derivatives: 70,
          etfFlows: 88,
          newsSentiment: 72,
          combinedScore: 77.2
        },
        supportingEvidence: [
          'EMA 20 ($80,850) cleanly crossed above EMA 50 ($79,620) on 4h timeframe with rising volume.',
          'US Spot Bitcoin ETFs posted +$226.9M net inflow on 2026-10-22 with 5-day rolling net flow at +$726M.',
          'CEX order-book depth imbalance is +34.2% within 25 bps on Binance and Coinbase spot books.',
          'Funding rate (0.0071%) is positive but well below euphoric threshold (0.03%), indicating sustainable spot-driven push.',
          'RSI 14 at 61.4 displays healthy bullish momentum with no bearish divergence.'
        ],
        contradictoryEvidence: [
          'Short-term psychological resistance at $82,500 may attract algorithmic profit taking.',
          'Weekly CME gap open at $80,100 remains an unfilled liquidity attractor on deep pullbacks.'
        ],
        invalidationConditions: [
          'Hourly candle close below $79,800 invalidates the bullish order block.',
          'Sudden net ETF redemptions exceeding $100M on the subsequent reporting date.',
          'Derivatives funding rate spike above 0.04% indicating extreme retail overleverage.'
        ],
        methodologyVersion: 'v2.4-Institutional-MultiPillar',
        createdAt: '2026-10-22T22:00:00Z',
        expiresAt: '2026-10-25T22:00:00Z',
        isPublicPreview: true,
        aiThesis: 'Macro liquidity expansion coupled with five consecutive days of institutional US ETF accumulation creates strong absorption of spot exchange float. Order-book bid clusters at $81,200 provide high structural support for continuation toward $85,200.'
      },
      {
        id: 'sig-eth-002',
        symbol: 'ETH',
        timeframe: '1D',
        direction: 'LONG',
        entryZoneMin: 2620,
        entryZoneMax: 2680,
        currentPrice: 2685,
        stopLoss: 2540,
        takeProfit1: 2840,
        takeProfit2: 3050,
        takeProfit3: 3300,
        riskRewardRatio: 2.9,
        confidenceScore: 78,
        status: 'ACTIVE',
        scores: {
          technical: 68,
          liquidity: 74,
          derivatives: 65,
          etfFlows: 80,
          newsSentiment: 65,
          combinedScore: 70.1
        },
        supportingEvidence: [
          'Daily MACD histogram flipped positive after 12 days of consolidation.',
          'Spot ETH ETF inflows turned positive for 3 consecutive sessions led by BlackRock ETHA.',
          'Exchange reserves on Binance and Coinbase dropped by 42,000 ETH over 48 hours.',
          'VWAP support anchored from recent monthly pivot held firmly at $2,630.'
        ],
        contradictoryEvidence: [
          'ETH/BTC ratio remains near multi-month lows (0.0328).',
          'Layer-2 fee burn rate has compressed mainnet revenue.'
        ],
        invalidationConditions: [
          'Daily close below $2,540 invalidates the accumulation range.',
          'Breakdown of open interest accompanied by aggressive long liquidations.'
        ],
        methodologyVersion: 'v2.4-Institutional-MultiPillar',
        createdAt: '2026-10-22T18:00:00Z',
        expiresAt: '2026-10-29T18:00:00Z',
        isPublicPreview: false,
        aiThesis: 'ETH exhibits classic accumulation range dynamics with shrinking exchange float and emerging institutional ETF inflows. Risk-reward is highly asymmetric on pullbacks into $2,620-$2,680.'
      },
      {
        id: 'sig-sol-003',
        symbol: 'SOL',
        timeframe: '4h',
        direction: 'LONG',
        entryZoneMin: 184,
        entryZoneMax: 189,
        currentPrice: 191.5,
        stopLoss: 176,
        takeProfit1: 204,
        takeProfit2: 218,
        takeProfit3: 235,
        riskRewardRatio: 2.7,
        confidenceScore: 76,
        status: 'ACTIVE',
        scores: {
          technical: 82,
          liquidity: 71,
          derivatives: 64,
          etfFlows: 50,
          newsSentiment: 78,
          combinedScore: 71.9
        },
        supportingEvidence: [
          'Breakout from ascending channel on 4h with above-average volume.',
          'DEX volume parity with Ethereum mainnet sustaining on-chain token velocity.',
          'Funding rate normalized at 0.010% with rising open interest (+6.4% in 24h).'
        ],
        contradictoryEvidence: [
          'No direct US spot ETF flows for SOL (ETF score assigned baseline neutral 50%).',
          'RSI 14 at 68.2 approaching overbought condition on lower timeframes.'
        ],
        invalidationConditions: [
          'Candle close below channel breakout retest level ($176.00).'
        ],
        methodologyVersion: 'v2.4-Institutional-MultiPillar',
        createdAt: '2026-10-22T20:30:00Z',
        expiresAt: '2026-10-26T20:30:00Z',
        isPublicPreview: false,
        aiThesis: 'Solana continues to show relative strength against altcoin peers driven by decentralized exchange volumes and resilient ecosystem metrics.'
      },
      {
        id: 'sig-xrp-004',
        symbol: 'XRP',
        timeframe: '1D',
        direction: 'NEUTRAL',
        entryZoneMin: 0.52,
        entryZoneMax: 0.55,
        currentPrice: 0.538,
        stopLoss: 0.49,
        takeProfit1: 0.58,
        takeProfit2: 0.62,
        takeProfit3: 0.68,
        riskRewardRatio: 1.8,
        confidenceScore: 54,
        status: 'CANDIDATE',
        scores: {
          technical: 50,
          liquidity: 52,
          derivatives: 48,
          etfFlows: 50,
          newsSentiment: 55,
          combinedScore: 50.8
        },
        supportingEvidence: [
          'Consolidation within symmetrical triangle pattern between $0.51 and $0.56.'
        ],
        contradictoryEvidence: [
          'Volume continues to decay without directional institutional impulse.',
          'Order-book imbalance is flat (-1.2%).'
        ],
        invalidationConditions: [
          'Directional breakout with daily volume > $1.2B.'
        ],
        methodologyVersion: 'v2.4-Institutional-MultiPillar',
        createdAt: '2026-10-22T14:00:00Z',
        expiresAt: '2026-10-26T14:00:00Z',
        isPublicPreview: true,
        aiThesis: 'XRP remains range-bound with insufficient quantitative confirmation across technical and liquidity pillars to justify directional capital deployment.'
      }
    ],
    watchlists: {
      'usr-admin-001': ['BTC', 'ETH', 'SOL', 'BNB'],
      'usr-prem-002': ['BTC', 'ETH', 'SOL', 'LINK'],
      'usr-pub-003': ['BTC', 'ETH']
    },
    alerts: [
      {
        id: 'alt-001',
        userId: 'usr-admin-001',
        symbol: 'BTC',
        type: 'PRICE_ABOVE',
        threshold: 82500,
        enabled: true,
        channel: 'IN_APP',
        createdAt: '2026-10-22T10:00:00Z'
      },
      {
        id: 'alt-002',
        userId: 'usr-admin-001',
        symbol: 'BTC',
        type: 'ETF_INFLOW_SPIKE',
        threshold: 200000000,
        enabled: true,
        channel: 'EMAIL',
        createdAt: '2026-10-22T10:00:00Z'
      },
      {
        id: 'alt-003',
        userId: 'usr-prem-002',
        symbol: 'ETH',
        type: 'SIGNAL_TRIGGER',
        threshold: 75,
        enabled: true,
        channel: 'TELEGRAM',
        createdAt: '2026-10-21T14:30:00Z'
      }
    ],
    providerConfigs: [
      {
        id: 'prov-binance-spot',
        providerName: 'Binance Public Spot REST & WebSocket',
        providerType: 'MarketData',
        enabled: true,
        status: 'HEALTHY',
        lastSuccessAt: now,
        endpoint: 'https://api.binance.com/api/v3',
        rateLimitStatus: '1200 / 1200 req/min (Normal)',
        recordsProcessedToday: 14820,
        latencyMs: 82
      },
      {
        id: 'prov-binance-futures',
        providerName: 'Binance Futures Derivatives Stream',
        providerType: 'Derivatives',
        enabled: true,
        status: 'HEALTHY',
        lastSuccessAt: now,
        endpoint: 'https://fapi.binance.com/fapi/v1',
        rateLimitStatus: '2400 / 2400 req/min (Normal)',
        recordsProcessedToday: 8940,
        latencyMs: 76
      },
      {
        id: 'prov-etf-aggregator',
        providerName: 'US Spot ETF Ingestion Adapter',
        providerType: 'ETFFlow',
        enabled: true,
        status: 'HEALTHY',
        lastSuccessAt: '2026-10-22T23:30:00Z',
        endpoint: 'SEC EDGAR & Issuer Portals (BlackRock, Fidelity, Ark, Bitwise)',
        rateLimitStatus: 'Daily Scheduled Job (Completed)',
        recordsProcessedToday: 16,
        latencyMs: 310
      },
      {
        id: 'prov-news-engine',
        providerName: 'Crypto & Macro News Aggregator',
        providerType: 'News',
        enabled: true,
        status: 'HEALTHY',
        lastSuccessAt: now,
        endpoint: 'RSS & Financial Wire API Feed',
        rateLimitStatus: 'Poll interval: 5m',
        recordsProcessedToday: 412,
        latencyMs: 140
      },
      {
        id: 'prov-gemini-ai',
        providerName: 'Gemini AI Quantitative Analyst & Synthesizer',
        providerType: 'AI',
        enabled: true,
        status: 'HEALTHY',
        lastSuccessAt: now,
        endpoint: 'Google Gen AI SDK (@google/genai)',
        rateLimitStatus: 'Active (Server-Side)',
        recordsProcessedToday: 58,
        latencyMs: 650
      }
    ],
    ingestionRuns: [
      {
        id: 'ing-run-101',
        providerName: 'Binance Public Spot REST & WebSocket',
        jobType: 'MARKET_TICKERS_AND_DEPTH',
        startedAt: '2026-10-23T01:50:00Z',
        completedAt: '2026-10-23T01:50:02Z',
        status: 'SUCCESS',
        recordsProcessed: 7,
        recordsFailed: 0
      },
      {
        id: 'ing-run-102',
        providerName: 'Binance Futures Derivatives Stream',
        jobType: 'FUNDING_AND_OPEN_INTEREST',
        startedAt: '2026-10-23T01:45:00Z',
        completedAt: '2026-10-23T01:45:03Z',
        status: 'SUCCESS',
        recordsProcessed: 7,
        recordsFailed: 0
      },
      {
        id: 'ing-run-103',
        providerName: 'US Spot ETF Ingestion Adapter',
        jobType: 'DAILY_ETF_FLOW_SCRAPE',
        startedAt: '2026-10-22T23:30:00Z',
        completedAt: '2026-10-22T23:30:08Z',
        status: 'SUCCESS',
        recordsProcessed: 8,
        recordsFailed: 0
      }
    ],
    auditLogs: [
      {
        id: 'aud-001',
        actorUserId: 'usr-admin-001',
        action: 'SIGNAL_METHODOLOGY_UPDATE',
        resourceType: 'SIGNAL_ENGINE',
        resourceId: 'v2.4-Institutional-MultiPillar',
        details: 'Weights updated: Tech 30%, Liq 25%, Deriv 20%, ETF 15%, News 10%',
        createdAt: '2026-10-22T12:00:00Z'
      },
      {
        id: 'aud-002',
        actorUserId: 'usr-admin-001',
        action: 'PROVIDER_HEALTH_CHECK',
        resourceType: 'DATA_PROVIDER',
        resourceId: 'prov-binance-spot',
        details: 'Automated heartbeat verification passed with 82ms latency',
        createdAt: '2026-10-23T01:00:00Z'
      }
    ]
  };
}

class Database {
  private state: DatabaseState;

  constructor() {
    this.ensureDataDir();
    this.state = this.load();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Failed to load DB file, initializing fresh state:', err);
    }
    const initial = getInitialState();
    this.save(initial);
    return initial;
  }

  public save(state: DatabaseState = this.state) {
    this.state = state;
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write DB file:', err);
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public getUsers(): User[] {
    return this.state.users;
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public updateUserRole(id: string, role: User['role'], planId?: string) {
    const user = this.state.users.find(u => u.id === id);
    if (user) {
      user.role = role;
      if (planId) {
        user.planId = planId;
        user.subscriptionStatus = planId === 'plan-free' ? 'INACTIVE' : 'ACTIVE';
      }
      user.updatedAt = new Date().toISOString();
      this.save();
    }
    return user;
  }

  public getPlans(): Plan[] {
    return this.state.plans;
  }

  public getAssets(): Asset[] {
    return this.state.assets;
  }

  public getETFFunds(): ETFFund[] {
    return this.state.etfFunds;
  }

  public getETFDailyFlows(): ETFDailyFlow[] {
    return this.state.etfDailyFlows;
  }

  public getNews(): NewsArticle[] {
    return this.state.newsArticles;
  }

  public getSignals(): TradingSignal[] {
    return this.state.signals;
  }

  public getSignalById(id: string): TradingSignal | undefined {
    return this.state.signals.find(s => s.id === id);
  }

  public addSignal(signal: TradingSignal) {
    this.state.signals.unshift(signal);
    this.save();
  }

  public updateSignal(id: string, partial: Partial<TradingSignal>) {
    const idx = this.state.signals.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.state.signals[idx] = { ...this.state.signals[idx], ...partial };
      this.save();
      return this.state.signals[idx];
    }
    return undefined;
  }

  public getWatchlists(userId: string): string[] {
    return this.state.watchlists[userId] || ['BTC', 'ETH', 'SOL'];
  }

  public toggleWatchlistAsset(userId: string, symbol: string): string[] {
    if (!this.state.watchlists[userId]) {
      this.state.watchlists[userId] = ['BTC', 'ETH'];
    }
    const list = this.state.watchlists[userId];
    const idx = list.indexOf(symbol);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(symbol);
    }
    this.save();
    return list;
  }

  public getAlerts(userId: string) {
    return this.state.alerts.filter(a => a.userId === userId);
  }

  public addAlert(alert: DatabaseState['alerts'][0]) {
    this.state.alerts.push(alert);
    this.save();
    return alert;
  }

  public deleteAlert(alertId: string) {
    this.state.alerts = this.state.alerts.filter(a => a.id !== alertId);
    this.save();
  }

  public getProviders(): DataProviderConfig[] {
    return this.state.providerConfigs;
  }

  public updateProviderStatus(id: string, partial: Partial<DataProviderConfig>) {
    const p = this.state.providerConfigs.find(item => item.id === id);
    if (p) {
      Object.assign(p, partial);
      this.save();
    }
    return p;
  }

  public getIngestionRuns(): IngestionRun[] {
    return this.state.ingestionRuns;
  }

  public addIngestionRun(run: IngestionRun) {
    this.state.ingestionRuns.unshift(run);
    if (this.state.ingestionRuns.length > 50) {
      this.state.ingestionRuns.pop();
    }
    this.save();
  }

  public getAuditLogs(): AuditLog[] {
    return this.state.auditLogs;
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>) {
    const entry: AuditLog = {
      id: `aud-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...log
    };
    this.state.auditLogs.unshift(entry);
    if (this.state.auditLogs.length > 100) {
      this.state.auditLogs.pop();
    }
    this.save();
    return entry;
  }
}

export const db = new Database();
