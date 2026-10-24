import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { TradingSignal } from '../types';
import { Radio, Filter, Clock, ArrowRight, ShieldCheck, Plus, RefreshCw } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

interface SignalsPageProps {
  navigate: (route: string) => void;
}

export const SignalsPage: React.FC<SignalsPageProps> = ({ navigate }) => {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [directionFilter, setDirectionFilter] = useState<string>('ALL');
  const [assetFilter, setAssetFilter] = useState<string>('ALL');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSignals = async () => {
    try {
      const filters: any = {};
      if (directionFilter !== 'ALL') filters.direction = directionFilter;
      if (assetFilter !== 'ALL') filters.symbol = assetFilter;
      const res = await api.getSignals(filters);
      setSignals(res.signals || []);
    } catch (err) {
      console.error('Failed to load signals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignals();
  }, [directionFilter, assetFilter]);

  const handleGenerateNew = async (sym: string = 'BTC') => {
    setGenerating(true);
    try {
      const res = await api.generateSignal(sym, '4h');
      setSignals([res.signal, ...signals]);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <ScrollReveal direction="down" delay={40}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Radio className="w-6 h-6 text-teal-400" />
              Explainable Quantitative Trading Signals
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Deterministic 5-pillar weighting model (Tech 30%, Liquidity 25%, Derivatives 20%, ETF 15%, News 10%)
            </p>
          </div>

          {/* Generate Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGenerateNew('BTC')}
              disabled={generating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{generating ? 'Evaluating Model...' : 'Generate Live Signal'}</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Filters Bar */}
      <ScrollReveal direction="up" delay={80}>
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#0F172A] border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-300">Filter By Direction:</span>
            <div className="flex items-center bg-slate-900 rounded p-0.5 border border-slate-800">
              {['ALL', 'LONG', 'SHORT', 'NEUTRAL'].map(d => (
                <button
                  key={d}
                  onClick={() => setDirectionFilter(d)}
                  className={`px-2.5 py-1 rounded font-mono font-medium transition-colors ${
                    directionFilter === d ? 'bg-teal-500/20 text-teal-400 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Asset:</span>
            <select
              value={assetFilter}
              onChange={e => setAssetFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
            >
              <option value="ALL">All Assets</option>
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="SOL">Solana (SOL)</option>
              <option value="XRP">XRP</option>
            </select>
          </div>
        </div>
      </ScrollReveal>

      {/* Signal Cards Feed */}
      <div className="space-y-4">
        {signals.map((sig, idx) => {
          const isLong = sig.direction === 'LONG';
          const isShort = sig.direction === 'SHORT';

          return (
            <ScrollReveal key={sig.id} direction="up" delay={Math.min(300, idx * 50)}>
              <div
                onClick={() => navigate(`/signals/${sig.id}`)}
                className="p-5 rounded-lg bg-[#0F172A] border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all space-y-4 group"
              >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                    {sig.symbol}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white group-hover:text-teal-400 transition-colors">
                        {sig.symbol} / USDT
                      </span>
                      <span className="text-xs text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {sig.timeframe}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                        isLong ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                        isShort ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {sig.direction}
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans">
                        Status: <strong className="text-white">{sig.status}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Confidence</span>
                    <span className="text-teal-400 font-bold text-sm">{sig.confidenceScore}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Combined Score</span>
                    <span className="text-white font-bold text-sm">+{sig.scores.combinedScore}</span>
                  </div>
                </div>
              </div>

              {/* Execution Levels */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded bg-slate-900/80 border border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">Entry Zone</span>
                  <span className="text-white font-semibold">
                    ${sig.entryZoneMin.toLocaleString()} - ${sig.entryZoneMax.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Stop Loss (ATR Protected)</span>
                  <span className="text-red-400 font-semibold">${sig.stopLoss.toLocaleString()}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Take Profit 1 / 2</span>
                  <span className="text-emerald-400 font-semibold">
                    ${sig.takeProfit1.toLocaleString()} / ${sig.takeProfit2.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Risk / Reward Ratio</span>
                  <span className="text-teal-400 font-semibold">1 : {sig.riskRewardRatio}</span>
                </div>
              </div>

              {/* 5-Pillar Score Badges */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                <span className="text-slate-400 font-sans text-[11px]">Component Weights:</span>
                <span className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Tech (30%): <strong className="text-emerald-400">+{sig.scores.technical}</strong>
                </span>
                <span className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Liquidity (25%): <strong className="text-teal-400">+{sig.scores.liquidity}</strong>
                </span>
                <span className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Derivatives (20%): <strong className="text-sky-400">+{sig.scores.derivatives}</strong>
                </span>
                <span className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  ETF Flows (15%): <strong className="text-amber-400">+{sig.scores.etfFlows}</strong>
                </span>
                <span className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  News (10%): <strong className="text-indigo-400">+{sig.scores.newsSentiment}</strong>
                </span>
              </div>

              {/* AI Thesis Summary Preview */}
              <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                <p className="line-clamp-1 italic max-w-3xl">
                  "{sig.aiThesis || sig.supportingEvidence[0]}"
                </p>
                <span className="text-teal-400 font-semibold flex items-center gap-1 shrink-0 ml-4 group-hover:translate-x-0.5 transition-transform">
                  View Full Rationale <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </ScrollReveal>
        );
      })}
      </div>
    </div>
  );
};
