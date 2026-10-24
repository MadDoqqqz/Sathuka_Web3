import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Candle, MarketTicker, TradingSignal, OrderBookData } from '../types';
import { CandleChart } from '../components/CandleChart';
import { ArrowLeft, TrendingUp, TrendingDown, Radio, RefreshCw, BarChart2, ShieldAlert } from 'lucide-react';

interface MarketDetailPageProps {
  symbol: string;
  navigate: (route: string) => void;
}

export const MarketDetailPage: React.FC<MarketDetailPageProps> = ({ symbol, navigate }) => {
  const normSymbol = symbol.toUpperCase();
  const [interval, setIntervalTimeframe] = useState<'15m' | '1h' | '4h' | '1D'>('1h');
  const [ticker, setTicker] = useState<MarketTicker | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [indicators, setIndicators] = useState<any>(null);
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [relatedSignals, setRelatedSignals] = useState<TradingSignal[]>([]);
  const [generatingSignal, setGeneratingSignal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [detailRes, candlesRes, bookRes, signalsRes] = await Promise.all([
        api.getMarketDetail(normSymbol),
        api.getCandles(normSymbol, interval, 80),
        api.getOrderBook(normSymbol, 'Binance'),
        api.getSignals({ symbol: normSymbol })
      ]);

      setTicker(detailRes.ticker);
      setIndicators(detailRes.indicators);
      setCandles(candlesRes.candles);
      setOrderBook(bookRes.data);
      setRelatedSignals(signalsRes.signals || []);
    } catch (err) {
      console.error('Failed to load asset details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [normSymbol, interval]);

  const handleGenerateSignal = async () => {
    setGeneratingSignal(true);
    try {
      const res = await api.generateSignal(normSymbol, interval);
      setRelatedSignals([res.signal, ...relatedSignals]);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setGeneratingSignal(false);
    }
  };

  const isUp = (ticker?.change24h || 0) >= 0;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/markets')}
            className="p-1.5 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                {normSymbol} / USDT
              </h1>
              <span className="text-xs text-slate-400 font-sans">
                {ticker?.name || normSymbol}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 font-mono font-semibold">
                Binance Spot
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs mt-1 font-mono">
              <span className="text-lg font-bold text-white">
                ${ticker ? (ticker.price > 10 ? ticker.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : ticker.price.toFixed(4)) : '---'}
              </span>
              <span className={`flex items-center gap-0.5 font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isUp ? '+' : ''}{ticker?.change24h.toFixed(2)}%
              </span>
              <span className="text-slate-400">· 24h Vol: ${( (ticker?.volume24hUsd || 0) / 1e6 ).toFixed(1)}M</span>
            </div>
          </div>
        </div>

        {/* Timeframe selector & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 rounded border border-slate-700/80 p-0.5">
            {(['15m', '1h', '4h', '1D'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setIntervalTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors ${
                  interval === tf
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerateSignal}
            disabled={generatingSignal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-teal-500/10 border border-teal-500/40 hover:bg-teal-500/20 text-xs font-semibold text-teal-300 transition-colors"
          >
            <Radio className={`w-3.5 h-3.5 ${generatingSignal ? 'animate-spin' : ''}`} />
            <span>{generatingSignal ? 'Evaluating...' : 'Run Signal Engine'}</span>
          </button>
        </div>
      </div>

      {/* Candlestick Chart */}
      <CandleChart
        candles={candles}
        height={420}
        symbol={normSymbol}
        interval={interval}
        showEma={true}
      />

      {/* Quantitative Indicator Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">EMA 20</div>
          <div className="text-sm font-bold text-white font-mono mt-1">
            ${indicators?.ema20 ? indicators.ema20.toLocaleString() : '---'}
          </div>
          <div className="text-[10px] text-teal-400 mt-0.5">Short-term trend</div>
        </div>

        <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">EMA 50</div>
          <div className="text-sm font-bold text-white font-mono mt-1">
            ${indicators?.ema50 ? indicators.ema50.toLocaleString() : '---'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Intermediate</div>
        </div>

        <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">EMA 200</div>
          <div className="text-sm font-bold text-white font-mono mt-1">
            ${indicators?.ema200 ? indicators.ema200.toLocaleString() : '---'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Macro baseline</div>
        </div>

        <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">RSI (14)</div>
          <div className="text-sm font-bold text-teal-400 font-mono mt-1">
            {indicators?.rsi14 || '---'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {indicators?.rsi14 > 70 ? 'Overbought' : indicators?.rsi14 < 35 ? 'Oversold' : 'Neutral Momentum'}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">MACD Hist</div>
          <div className={`text-sm font-bold font-mono mt-1 ${indicators?.macd?.histogram >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {indicators?.macd?.histogram !== undefined ? indicators.macd.histogram : '---'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Momentum impulse</div>
        </div>

        <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">ATR (14)</div>
          <div className="text-sm font-bold text-white font-mono mt-1">
            ${indicators?.atr14 ? indicators.atr14.toLocaleString() : '---'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Expected bar range</div>
        </div>

        <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">VWAP Anchor</div>
          <div className="text-sm font-bold text-sky-400 font-mono mt-1">
            ${indicators?.vwap ? indicators.vwap.toLocaleString() : '---'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Volume weighted</div>
        </div>
      </div>

      {/* Split: Order Book Ladder & Related Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Book Ladder */}
        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">CEX Order Book Depth</h3>
              <p className="text-xs text-slate-400">Binance Spot L2 Snapshot</p>
            </div>
            <div className="text-right text-xs font-mono">
              <span className="text-slate-400">Spread: </span>
              <strong className="text-teal-400">{orderBook?.spreadBps || 0.42} bps</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            {/* Bids Column */}
            <div>
              <div className="text-[11px] font-semibold text-emerald-400 border-b border-slate-800 pb-1 mb-1.5 flex justify-between">
                <span>Bid Price</span>
                <span>Size (USD)</span>
              </div>
              <div className="space-y-1">
                {(orderBook?.bids || []).slice(0, 7).map((b, idx) => (
                  <div key={idx} className="flex justify-between text-slate-300">
                    <span className="text-emerald-400">${b.price.toLocaleString()}</span>
                    <span>${(b.totalUsd / 1000).toFixed(1)}k</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Asks Column */}
            <div>
              <div className="text-[11px] font-semibold text-red-400 border-b border-slate-800 pb-1 mb-1.5 flex justify-between">
                <span>Ask Price</span>
                <span>Size (USD)</span>
              </div>
              <div className="space-y-1">
                {(orderBook?.asks || []).slice(0, 7).map((a, idx) => (
                  <div key={idx} className="flex justify-between text-slate-300">
                    <span className="text-red-400">${a.price.toLocaleString()}</span>
                    <span>${(a.totalUsd / 1000).toFixed(1)}k</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>25bps Imbalance: <strong className="text-teal-400">{((orderBook?.depthImbalance || 0) * 100).toFixed(1)}%</strong></span>
            <button onClick={() => navigate('/liquidity')} className="text-teal-400 hover:underline">
              Multi-Exchange Depth →
            </button>
          </div>
        </div>

        {/* Signals for this Asset */}
        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Quantitative Signals</h3>
              <p className="text-xs text-slate-400">Multi-pillar signal detections for {normSymbol}</p>
            </div>
            <button
              onClick={() => navigate('/signals')}
              className="text-xs text-teal-400 hover:underline"
            >
              All Signals →
            </button>
          </div>

          {relatedSignals.length > 0 ? (
            <div className="space-y-3">
              {relatedSignals.map(sig => (
                <div
                  key={sig.id}
                  onClick={() => navigate(`/signals/${sig.id}`)}
                  className="p-3 rounded bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                        sig.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' :
                        sig.direction === 'SHORT' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {sig.direction}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{sig.timeframe}</span>
                      <span className="text-xs text-slate-400">Confidence: <strong className="text-teal-400">{sig.confidenceScore}%</strong></span>
                    </div>

                    <div className="text-xs font-mono font-bold text-teal-400">
                      Score: +{sig.scores.combinedScore}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    {sig.aiThesis || sig.supportingEvidence[0]}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              No active signals published yet for {normSymbol}. Click "Run Signal Engine" above to trigger analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
