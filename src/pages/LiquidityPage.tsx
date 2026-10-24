import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { OrderBookData } from '../types';
import { BarChart3, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export const LiquidityPage: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<'BTC' | 'ETH' | 'SOL'>('BTC');
  const [selectedExchange, setSelectedExchange] = useState<OrderBookData['exchange']>('Binance');
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [crossExchanges, setCrossExchanges] = useState<OrderBookData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [bookRes, crossRes] = await Promise.all([
        api.getOrderBook(selectedSymbol, selectedExchange),
        api.getCrossExchangeLiquidity(selectedSymbol)
      ]);
      setOrderBook(bookRes.data);
      setCrossExchanges(crossRes.exchanges || []);
    } catch (err) {
      console.error('Failed to load liquidity data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s refresh
    return () => clearInterval(interval);
  }, [selectedSymbol, selectedExchange]);

  const imbalance = orderBook ? orderBook.depthImbalance : 0;
  const isBidHeavy = imbalance >= 0;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-400" />
            CEX Order-Book Depth & Liquidity Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time market depth, bid-ask spread bps, depth imbalance, and cross-venue liquidity concentration
          </p>
        </div>

        {/* Asset & Exchange Controls */}
        <div className="flex items-center gap-2">
          {/* Symbol */}
          <div className="flex items-center bg-slate-900 rounded border border-slate-700/80 p-0.5">
            {(['BTC', 'ETH', 'SOL'] as const).map(sym => (
              <button
                key={sym}
                onClick={() => setSelectedSymbol(sym)}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-colors ${
                  selectedSymbol === sym
                    ? 'bg-teal-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Exchange */}
          <select
            value={selectedExchange}
            onChange={e => setSelectedExchange(e.target.value as any)}
            className="bg-slate-900 border border-slate-700/80 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
          >
            <option value="Binance">Binance Spot</option>
            <option value="Coinbase">Coinbase</option>
            <option value="OKX">OKX</option>
            <option value="Bybit">Bybit</option>
            <option value="Kraken">Kraken</option>
          </select>
        </div>
      </div>

      {/* Primary Liquidity Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-xs text-slate-400">Mid-Market Price</div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums mt-1">
            ${orderBook ? orderBook.midPrice.toLocaleString() : '---'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Bid: ${orderBook?.bestBid.toLocaleString()} · Ask: ${orderBook?.bestAsk.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-xs text-slate-400">Bid-Ask Spread</div>
          <div className="text-2xl font-bold font-mono text-teal-400 tabular-nums mt-1">
            {orderBook ? orderBook.spreadBps : '---'} <span className="text-sm font-normal text-slate-400">bps</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Tight Institutional Spread Tier (&lt;1 bps)
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-xs text-slate-400">Depth Imbalance (25 bps)</div>
          <div className={`text-2xl font-bold font-mono tabular-nums mt-1 ${isBidHeavy ? 'text-emerald-400' : 'text-red-400'}`}>
            {isBidHeavy ? '+' : ''}{(imbalance * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isBidHeavy ? 'Limit Bid Cluster Dominance' : 'Limit Ask Pressure Dominance'}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-xs text-slate-400">25bps Bid / Ask Liquidity</div>
          <div className="text-sm font-bold font-mono text-white tabular-nums mt-2 flex items-center justify-between">
            <span className="text-emerald-400">${((orderBook?.bidDepth25bps || 0) / 1e6).toFixed(2)}M Bid</span>
            <span className="text-red-400">${((orderBook?.askDepth25bps || 0) / 1e6).toFixed(2)}M Ask</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Standardized distance from mid
          </div>
        </div>
      </div>

      {/* Visual Depth Imbalance Meter */}
      <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-emerald-400 font-semibold">
            Bids: ${((orderBook?.bidDepth50bps || 0) / 1e6).toFixed(2)}M (50bps)
          </span>
          <span className="text-slate-300 font-semibold">
            Depth Balance Meter
          </span>
          <span className="text-red-400 font-semibold">
            Asks: ${((orderBook?.askDepth50bps || 0) / 1e6).toFixed(2)}M (50bps)
          </span>
        </div>

        <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden flex border border-slate-700/60">
          <div
            className="bg-emerald-500 h-full transition-all"
            style={{ width: `${Math.max(10, Math.min(90, ((orderBook?.bidDepth25bps || 1) / ((orderBook?.bidDepth25bps || 1) + (orderBook?.askDepth25bps || 1))) * 100))}%` }}
          />
          <div
            className="bg-red-500 h-full transition-all"
            style={{ width: `${Math.max(10, Math.min(90, ((orderBook?.askDepth25bps || 1) / ((orderBook?.bidDepth25bps || 1) + (orderBook?.askDepth25bps || 1))) * 100))}%` }}
          />
        </div>
      </div>

      {/* Split: Order Book Ladder & Multi-Exchange Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Book Level 2 Snapshot */}
        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              {selectedExchange} {selectedSymbol}/USDT Level-2 Ladder
            </h3>
            <span className="text-xs text-slate-400 font-mono">Top 15 Price Levels</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            {/* Bids */}
            <div>
              <div className="text-[11px] font-semibold text-emerald-400 border-b border-slate-800 pb-1 mb-1.5 flex justify-between">
                <span>Bid Price</span>
                <span>Size</span>
                <span>Depth ($)</span>
              </div>
              <div className="space-y-1">
                {(orderBook?.bids || []).slice(0, 12).map((b, i) => (
                  <div key={i} className="flex justify-between text-slate-300">
                    <span className="text-emerald-400">${b.price.toLocaleString()}</span>
                    <span className="text-slate-400">{b.size.toFixed(2)}</span>
                    <span>${(b.totalUsd / 1000).toFixed(1)}k</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Asks */}
            <div>
              <div className="text-[11px] font-semibold text-red-400 border-b border-slate-800 pb-1 mb-1.5 flex justify-between">
                <span>Ask Price</span>
                <span>Size</span>
                <span>Depth ($)</span>
              </div>
              <div className="space-y-1">
                {(orderBook?.asks || []).slice(0, 12).map((a, i) => (
                  <div key={i} className="flex justify-between text-slate-300">
                    <span className="text-red-400">${a.price.toLocaleString()}</span>
                    <span className="text-slate-400">{a.size.toFixed(2)}</span>
                    <span>${(a.totalUsd / 1000).toFixed(1)}k</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cross-Exchange Liquidity Comparison */}
        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Cross-Exchange Liquidity Comparison</h3>
            <span className="text-xs text-slate-400 font-mono">5 Major CEX Venues</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                  <th className="py-2">Venue</th>
                  <th className="py-2">Spread</th>
                  <th className="py-2">10bps Depth</th>
                  <th className="py-2">25bps Depth</th>
                  <th className="py-2">Imbalance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {crossExchanges.map(ex => (
                  <tr key={ex.exchange} className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-bold text-white font-sans flex items-center gap-1.5">
                      <span>{ex.exchange}</span>
                    </td>
                    <td className="py-2.5 text-teal-400">
                      {ex.spreadBps} bps
                    </td>
                    <td className="py-2.5 text-slate-300">
                      ${((ex.bidDepth10bps + ex.askDepth10bps) / 1e6).toFixed(2)}M
                    </td>
                    <td className="py-2.5 text-slate-300">
                      ${((ex.bidDepth25bps + ex.askDepth25bps) / 1e6).toFixed(2)}M
                    </td>
                    <td className={`py-2.5 font-bold ${ex.depthImbalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {ex.depthImbalance >= 0 ? '+' : ''}{(ex.depthImbalance * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 rounded bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-300">Market Structure Notice:</strong> Visible limit orders in order books can be modified or canceled prior to fill. Displayed depth does not capture algorithmic icebergs, hidden liquidity, or OTC block crosses.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
