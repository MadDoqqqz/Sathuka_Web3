import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DerivativesData } from '../types';
import { Flame, Clock, BarChart2, ShieldAlert, ArrowUpRight, TrendingUp } from 'lucide-react';

export const DerivativesPage: React.FC = () => {
  const [derivatives, setDerivatives] = useState<DerivativesData[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>('BTC');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDerivatives()
      .then(res => {
        if (Array.isArray(res.data)) {
          setDerivatives(res.data);
        } else if (res.data) {
          setDerivatives([res.data]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const active = derivatives.find(d => d.symbol === selectedAsset) || derivatives[0];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-400" />
            Cryptocurrency Derivatives & Futures Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Perpetual funding rate telemetry, open interest aggregate expansion, futures basis, and liquidation cascades
          </p>
        </div>

        {/* Asset Filter */}
        <div className="flex items-center bg-slate-900 rounded border border-slate-700/80 p-0.5">
          {derivatives.map(d => (
            <button
              key={d.symbol}
              onClick={() => setSelectedAsset(d.symbol)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-colors ${
                (active?.symbol === d.symbol)
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {d.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Metric Cards */}
      {active && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800">
            <div className="text-xs text-slate-400">Current Funding Rate (8h)</div>
            <div className="text-2xl font-bold font-mono text-teal-400 tabular-nums mt-1">
              {(active.fundingRate * 100).toFixed(4)}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" />
              <span>Next Funding in: <strong>{active.nextFundingCountdown}</strong></span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800">
            <div className="text-xs text-slate-400">Total Open Interest (USD)</div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums mt-1">
              ${(active.openInterestUsd / 1e9).toFixed(2)}B
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 font-mono">
              +{active.openInterestChange24h}% (24h Aggregate OI Change)
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800">
            <div className="text-xs text-slate-400">Futures Basis / Premium</div>
            <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums mt-1">
              +{active.futuresBasisBps} bps
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Mark Price vs Spot Index spread
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800">
            <div className="text-xs text-slate-400">Long / Short Account Ratio</div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums mt-1">
              {active.longShortRatio} : 1
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              54.1% Long accounts vs 45.9% Short
            </div>
          </div>
        </div>
      )}

      {/* Liquidations Breakdown */}
      {active && (
        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">24h Liquidation Volume Comparison</h3>
              <p className="text-xs text-slate-400">Forced position closures across perpetual futures contracts</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total 24h: ${((active.liquidationLong24hUsd + active.liquidationShort24hUsd) / 1e6).toFixed(1)}M
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between font-mono">
              <div>
                <span className="text-xs text-slate-400 block">Long Liquidations (Wrecked Bids)</span>
                <span className="text-xl font-bold text-red-400">
                  ${(active.liquidationLong24hUsd / 1e6).toFixed(1)}M
                </span>
              </div>
              <span className="text-xs text-red-400 bg-red-950/60 px-2 py-1 rounded border border-red-800/40">
                {((active.liquidationLong24hUsd / (active.liquidationLong24hUsd + active.liquidationShort24hUsd)) * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between font-mono">
              <div>
                <span className="text-xs text-slate-400 block">Short Liquidations (Squeezed Bears)</span>
                <span className="text-xl font-bold text-emerald-400">
                  ${(active.liquidationShort24hUsd / 1e6).toFixed(1)}M
                </span>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800/40">
                {((active.liquidationShort24hUsd / (active.liquidationLong24hUsd + active.liquidationShort24hUsd)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Asset Derivatives Matrix Table */}
      <div className="bg-[#0F172A] rounded-lg border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Cross-Asset Perpetual Futures Matrix</h3>
          <span className="text-xs text-slate-400 font-mono">Binance Futures (USDT-M)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Contract</th>
                <th className="py-3 px-4">Funding Rate (8h)</th>
                <th className="py-3 px-4">Predicted (Next)</th>
                <th className="py-3 px-4">Open Interest (USD)</th>
                <th className="py-3 px-4">OI Native</th>
                <th className="py-3 px-4">Futures Basis</th>
                <th className="py-3 px-4">Long/Short Ratio</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {derivatives.map(d => (
                <tr key={d.symbol} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-teal-400">
                    {d.symbol}USDT PERP
                  </td>
                  <td className="py-3 px-4 font-bold text-white tabular-nums">
                    {(d.fundingRate * 100).toFixed(4)}%
                  </td>
                  <td className="py-3 px-4 text-slate-300 tabular-nums">
                    {(d.predictedFundingRate * 100).toFixed(4)}%
                  </td>
                  <td className="py-3 px-4 text-white tabular-nums">
                    ${(d.openInterestUsd / 1e6).toFixed(1)}M
                  </td>
                  <td className="py-3 px-4 text-slate-400 tabular-nums">
                    {d.openInterestNative.toLocaleString()} {d.symbol}
                  </td>
                  <td className="py-3 px-4 text-amber-400 tabular-nums">
                    +{d.futuresBasisBps} bps
                  </td>
                  <td className="py-3 px-4 text-slate-300 tabular-nums">
                    {d.longShortRatio}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 font-semibold">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
