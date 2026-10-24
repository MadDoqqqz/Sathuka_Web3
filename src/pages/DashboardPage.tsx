import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MarketTicker, TradingSignal, ETFDailyFlow } from '../types';
import { CandleChart } from '../components/CandleChart';
import { ScrollReveal } from '../components/ScrollReveal';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  BarChart2,
  Radio,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  ExternalLink
} from 'lucide-react';

interface DashboardPageProps {
  navigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const [tickers, setTickers] = useState<MarketTicker[]>([]);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [etfSummary, setEtfSummary] = useState<any>(null);
  const [recentBtcFlows, setRecentBtcFlows] = useState<ETFDailyFlow[]>([]);
  const [btcCandles, setBtcCandles] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [mkts, sigs, etf, cndl, nw] = await Promise.all([
        api.getMarkets(),
        api.getSignals(),
        api.getETFFlowSummary(),
        api.getCandles('BTC', '1h', 50),
        api.getNews()
      ]);
      setTickers(mkts.data || []);
      setSignals(sigs.signals || []);
      setEtfSummary(etf.summary);
      setRecentBtcFlows(etf.recentBtcFlows || []);
      setBtcCandles(cndl.candles || []);
      setNews((nw.articles || []).slice(0, 4));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // 15-second refresh
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const btcTicker = tickers.find(t => t.symbol === 'BTC') || tickers[0];
  const primarySignal = signals.find(s => s.symbol === 'BTC') || signals[0];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar / Breadcrumb Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:flex items-center justify-center p-2 rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-md shadow-teal-500/10 animate-sathuka-float">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-teal-500/20 to-amber-500/20 blur-sm pointer-events-none" />
            <img
              src="/assets/aistudio/image_1d08876f.png"
              alt="Sathuka Web3"
              className="w-7 h-7 object-contain relative z-10"
            />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
              Institutional Market Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time CEX liquidity, US spot ETF flow reconciliation, derivatives funding and 5-pillar signals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-teal-400' : 'text-slate-400'}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Feeds'}</span>
          </button>

          <button
            onClick={() => navigate('/signals')}
            className="px-3 py-1.5 rounded bg-teal-500/10 border border-teal-500/30 hover:bg-teal-500/20 text-xs font-semibold text-teal-300 transition-colors"
          >
            All Signals ({signals.length})
          </button>
        </div>
      </div>

      {/* Real-Time Market Ticker Ribbon */}
      <ScrollReveal direction="up" delay={50}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {tickers.map(t => {
            const isUp = t.change24h >= 0;
            return (
              <button
                key={t.symbol}
                onClick={() => navigate(`/markets/${t.symbol}`)}
                className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-teal-500/50 text-left transition-all group backdrop-blur"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                    {t.symbol}
                  </span>
                  <span className={`flex items-center gap-0.5 font-mono text-[11px] ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isUp ? '+' : ''}{t.change24h.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-1.5 text-sm lg:text-base font-bold text-white font-mono tabular-nums">
                  ${t.price > 10 ? t.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : t.price.toFixed(4)}
                </div>
                <div className="mt-1 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Vol: ${(t.volume24hUsd / 1e9).toFixed(2)}B</span>
                  <span className="text-teal-400/80">View →</span>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollReveal>

      {/* Macro & Institutional Metrics Row */}
      <ScrollReveal direction="up" delay={100}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: ETF Inflow */}
          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-teal-500/40 transition-colors backdrop-blur flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>US Spot BTC ETF (24h Flow)</span>
              <Layers className="w-4 h-4 text-teal-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-white font-mono tabular-nums">
                +${((etfSummary?.btcDailyNetFlowUsd || 226900000) / 1e6).toFixed(1)}M
              </div>
              <div className="text-xs text-emerald-400 font-medium">
                5 Consecutive Days Inflow (+${((etfSummary?.btcCumulativeFlowUsd || 26800000000) / 1e9).toFixed(1)}B Total)
              </div>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
              <span>Status: <strong>FINALIZED</strong></span>
              <button onClick={() => navigate('/etf-flows')} className="text-teal-400 hover:underline">
                Fund Details →
              </button>
            </div>
          </div>

          {/* Metric 2: CEX Order Book Imbalance */}
          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-sky-500/40 transition-colors backdrop-blur flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Binance BTC/USDT Spread</span>
              <BarChart2 className="w-4 h-4 text-sky-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-white font-mono tabular-nums">
                0.42 <span className="text-sm font-normal text-slate-400">bps</span>
              </div>
              <div className="text-xs text-emerald-400 font-medium">
                Bid Depth Skew: +34.2% within 25bps
              </div>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
              <span>Mid: ${btcTicker ? btcTicker.price.toLocaleString() : '81,745'}</span>
              <button onClick={() => navigate('/liquidity')} className="text-teal-400 hover:underline">
                Depth Ladder →
              </button>
            </div>
          </div>

          {/* Metric 3: Derivatives Funding */}
          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 transition-colors backdrop-blur flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Perp Funding Rate (8h)</span>
              <Radio className="w-4 h-4 text-amber-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-white font-mono tabular-nums">
                0.0071%
              </div>
              <div className="text-xs text-slate-300 font-medium">
                Annualized: 7.77% · Basis: +8.4 bps
              </div>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
              <span>Next Funding: <strong>3h 18m</strong></span>
              <button onClick={() => navigate('/derivatives')} className="text-teal-400 hover:underline">
                Derivatives →
              </button>
            </div>
          </div>

          {/* Metric 4: Macro Sentiment Index */}
          <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/40 transition-colors backdrop-blur flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Institutional Sentiment Index</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-teal-400 font-mono tabular-nums">
                74 / 100
              </div>
              <div className="text-xs text-slate-300 font-medium">
                Zone: Strong Quantitative Greed
              </div>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
              <span>Vol Regime: <strong>Moderate (ATR $1,420)</strong></span>
              <button onClick={() => navigate('/news')} className="text-teal-400 hover:underline">
                News Feed →
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Split: Candlestick Chart & Signal Intelligence Thesis */}
      <ScrollReveal direction="up" delay={150}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Live Candlestick Chart */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">BTC/USDT Spot Live Chart</span>
                <span className="text-xs text-slate-400">· Binance REST Stream</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigate('/markets/BTC')}
                  className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
                >
                  Expand Chart <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <CandleChart
              candles={btcCandles}
              height={380}
              symbol="BTC"
              interval="1h"
              showEma={true}
            />

            {/* Quick Technical Indicator Ticker Bar */}
            <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-slate-400 text-[11px]">EMA 20 (1h)</div>
                <div className="font-mono text-white font-semibold">$80,940</div>
              </div>
              <div>
                <div className="text-slate-400 text-[11px]">EMA 50 (1h)</div>
                <div className="font-mono text-white font-semibold">$79,810</div>
              </div>
              <div>
                <div className="text-slate-400 text-[11px]">RSI 14 (1h)</div>
                <div className="font-mono text-teal-400 font-semibold">61.4 (Healthy)</div>
              </div>
              <div>
                <div className="text-slate-400 text-[11px]">ATR 14 Volatility</div>
                <div className="font-mono text-white font-semibold">$1,280 (1.56%)</div>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Featured High-Confidence Signal */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Featured Active Signal</span>
              <span className="text-[10px] text-teal-400 font-mono bg-teal-950/60 border border-teal-800/40 px-2 py-0.5 rounded">
                v2.4 Institutional Engine
              </span>
            </div>

            {primarySignal ? (
              <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800/80 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">{primarySignal.symbol}</span>
                      <span className="text-xs text-slate-400 font-mono">{primarySignal.timeframe}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                        primarySignal.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                        primarySignal.direction === 'SHORT' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {primarySignal.direction}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>Created 2h ago · Confidence: <strong className="text-teal-400">{primarySignal.confidenceScore}%</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase">Combined Score</div>
                    <div className="text-lg font-bold font-mono text-teal-400">
                      +{primarySignal.scores.combinedScore}
                    </div>
                  </div>
                </div>

                {/* 5-Pillar Score Weights Breakdown */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    5-Pillar Weighted Composition
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Technical (30%)</span>
                      <span className="font-mono text-emerald-400 font-medium">+{primarySignal.scores.technical}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full" style={{ width: `${Math.min(100, Math.max(10, (primarySignal.scores.technical + 100) / 2))}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">CEX Liquidity (25%)</span>
                      <span className="font-mono text-teal-400 font-medium">+{primarySignal.scores.liquidity}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-400 h-full" style={{ width: `${Math.min(100, Math.max(10, (primarySignal.scores.liquidity + 100) / 2))}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Derivatives (20%)</span>
                      <span className="font-mono text-sky-400 font-medium">+{primarySignal.scores.derivatives}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-sky-400 h-full" style={{ width: `${Math.min(100, Math.max(10, (primarySignal.scores.derivatives + 100) / 2))}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">ETF Flows (15%)</span>
                      <span className="font-mono text-amber-400 font-medium">+{primarySignal.scores.etfFlows}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full" style={{ width: `${Math.min(100, Math.max(10, (primarySignal.scores.etfFlows + 100) / 2))}%` }}></div>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">News & AI (10%)</span>
                      <span className="font-mono text-indigo-400 font-medium">+{primarySignal.scores.newsSentiment}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-400 h-full" style={{ width: `${Math.min(100, Math.max(10, (primarySignal.scores.newsSentiment + 100) / 2))}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Execution Parameters */}
                <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Entry Zone</span>
                    <span className="text-white font-semibold">${primarySignal.entryZoneMin.toLocaleString()} - ${primarySignal.entryZoneMax.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Stop Loss (ATR)</span>
                    <span className="text-red-400 font-semibold">${primarySignal.stopLoss.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Target 1 (1.5R)</span>
                    <span className="text-emerald-400 font-semibold">${primarySignal.takeProfit1.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Risk / Reward</span>
                    <span className="text-teal-400 font-semibold">1 : {primarySignal.riskRewardRatio}</span>
                  </div>
                </div>

                {/* Thesis summary */}
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{primarySignal.aiThesis || primarySignal.supportingEvidence[0]}"
                </p>

                <button
                  onClick={() => navigate(`/signals/${primarySignal.id}`)}
                  className="w-full py-2 rounded bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold transition-colors text-center"
                >
                  View Full Thesis & Evidence →
                </button>
              </div>
            ) : (
              <div className="p-6 rounded-lg bg-[#0F172A] border border-slate-800 text-center text-xs text-slate-400">
                No active signals loaded. Click below to evaluate market state.
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Bottom Section: ETF Historical Net Flow Timeline & Breaking News */}
      <ScrollReveal direction="up" delay={200}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: US Spot Bitcoin ETF Flow History */}
          <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">US Spot Bitcoin ETF Daily Flows</h3>
                <p className="text-xs text-slate-400">Institutional Net Creations & Redemptions (USD)</p>
              </div>
              <button
                onClick={() => navigate('/etf-flows')}
                className="text-xs text-teal-400 hover:underline"
              >
                Full Breakdown →
              </button>
            </div>

            <div className="space-y-2 pt-2">
              {recentBtcFlows.slice(0, 5).map(flow => {
                const isPositive = flow.totalNetFlowUsd >= 0;
                const absFlow = Math.abs(flow.totalNetFlowUsd);
                const maxScale = 250000000;
                const barWidth = Math.min(100, (absFlow / maxScale) * 100);

                return (
                  <div key={flow.date} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300">{flow.date}</span>
                      <span className="text-slate-400">BTC: ${flow.priceUsd.toLocaleString()}</span>
                      <span className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : '-'}${ (absFlow / 1e6).toFixed(1) }M
                      </span>
                    </div>
                    <div className="w-full bg-slate-800/60 h-2 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full ${isPositive ? 'bg-emerald-400' : 'bg-red-400'}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Breaking News & AI Impact Classification */}
          <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Curated Market & Macro News</h3>
                <p className="text-xs text-slate-400">Categorized with AI market impact assessment</p>
              </div>
              <button
                onClick={() => navigate('/news')}
                className="text-xs text-teal-400 hover:underline"
              >
                All News →
              </button>
            </div>

            <div className="space-y-2.5 pt-1">
              {news.map(article => (
                <div
                  key={article.id}
                  className="p-2.5 rounded bg-slate-900/50 border border-slate-800/60 hover:border-slate-700 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="text-teal-400 font-semibold">{article.category}</span>
                      <span>·</span>
                      <span>{article.publisher}</span>
                    </div>
                    <span className={`font-mono px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      article.marketImpact.includes('BULLISH') ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/50' :
                      article.marketImpact.includes('BEARISH') ? 'bg-red-950/70 text-red-400 border border-red-800/50' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {article.marketImpact.replace('_', ' ')}
                    </span>
                  </div>

                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-slate-200 hover:text-white transition-colors line-clamp-1 flex items-center justify-between gap-1 group"
                  >
                    <span>{article.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>

                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {article.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};
