import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { TradingSignal } from '../types';
import { ArrowLeft, Radio, ShieldCheck, AlertOctagon, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

interface SignalDetailPageProps {
  signalId: string;
  navigate: (route: string) => void;
}

export const SignalDetailPage: React.FC<SignalDetailPageProps> = ({ signalId, navigate }) => {
  const [signal, setSignal] = useState<TradingSignal | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSignalDetail(signalId)
      .then(res => setSignal(res.signal))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [signalId]);

  const handleRequestAiThesis = async () => {
    if (!signal) return;
    setGeneratingAi(true);
    try {
      const res = await api.getAIExplanation(signal.symbol);
      setAiAnalysis(res.analysis);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setGeneratingAi(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading signal thesis...</div>;
  }

  if (!signal) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-white font-bold">Signal not found</div>
        <button onClick={() => navigate('/signals')} className="px-4 py-2 bg-slate-800 rounded text-teal-400 text-xs">
          Return to Signals
        </button>
      </div>
    );
  }

  const isLong = signal.direction === 'LONG';
  const isShort = signal.direction === 'SHORT';

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/signals')}
          className="p-1.5 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
              Signal Thesis: {signal.symbol} / USDT
            </h1>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
              isLong ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
              isShort ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
              'bg-slate-800 text-slate-300'
            }`}>
              {signal.direction}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            ID: {signal.id} · Timeframe: {signal.timeframe} · Methodology: {signal.methodologyVersion}
          </p>
        </div>
      </div>

      {/* Primary Execution Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-[#0F172A] border border-slate-800 font-mono text-xs">
        <div>
          <span className="text-slate-400 text-[10px] block uppercase">Validated Entry Zone</span>
          <span className="text-white text-base font-bold">
            ${signal.entryZoneMin.toLocaleString()} - ${signal.entryZoneMax.toLocaleString()}
          </span>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] block uppercase">Stop Loss (ATR 1.6x)</span>
          <span className="text-red-400 text-base font-bold">${signal.stopLoss.toLocaleString()}</span>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] block uppercase">Profit Targets (1.5R / 2.6R / 3.8R)</span>
          <span className="text-emerald-400 text-base font-bold">
            ${signal.takeProfit1.toLocaleString()} · ${signal.takeProfit2.toLocaleString()}
          </span>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] block uppercase">Risk / Reward Ratio</span>
          <span className="text-teal-400 text-base font-bold">1 : {signal.riskRewardRatio}</span>
        </div>
      </div>

      {/* 5-Pillar Score Cards */}
      <div className="p-5 rounded-lg bg-[#0F172A] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Deterministic 5-Pillar Scoring Model
          </h2>
          <div className="text-xs font-mono">
            <span className="text-slate-400">Combined Model Output: </span>
            <strong className="text-teal-400 text-base font-bold">+{signal.scores.combinedScore}</strong> / 100
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
            <div className="text-slate-400 text-[10px]">Technical (30%)</div>
            <div className="text-lg font-bold text-emerald-400 mt-1">+{signal.scores.technical}</div>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">EMAs, RSI, MACD, ATR</div>
          </div>

          <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
            <div className="text-slate-400 text-[10px]">CEX Liquidity (25%)</div>
            <div className="text-lg font-bold text-teal-400 mt-1">+{signal.scores.liquidity}</div>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">Depth skew & spread</div>
          </div>

          <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
            <div className="text-slate-400 text-[10px]">Derivatives (20%)</div>
            <div className="text-lg font-bold text-sky-400 mt-1">+{signal.scores.derivatives}</div>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">Funding rate & OI</div>
          </div>

          <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
            <div className="text-slate-400 text-[10px]">ETF Flows (15%)</div>
            <div className="text-lg font-bold text-amber-400 mt-1">+{signal.scores.etfFlows}</div>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">SEC daily creations</div>
          </div>

          <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
            <div className="text-slate-400 text-[10px]">News Sentiment (10%)</div>
            <div className="text-lg font-bold text-indigo-400 mt-1">+{signal.scores.newsSentiment}</div>
            <div className="text-[10px] text-slate-500 font-sans mt-0.5">AI impact score</div>
          </div>
        </div>
      </div>

      {/* Supporting vs Contradictory Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supporting Evidence */}
        <div className="p-5 rounded-lg bg-[#0F172A] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Supporting Empirical Evidence</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            {signal.supportingEvidence.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contradictory Evidence & Invalidation */}
        <div className="p-5 rounded-lg bg-[#0F172A] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <XCircle className="w-4 h-4" />
            <span>Contradictory Factors & Invalidation Criteria</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Risk Factors:
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {signal.contradictoryEvidence.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-400 mt-0.5">!</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-red-400 uppercase tracking-wide mb-1">
                Mandatory Invalidation Conditions:
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {signal.invalidationConditions.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-red-400 mt-0.5">✕</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Gemini AI Synthesis Section */}
      <div className="p-5 rounded-lg bg-gradient-to-br from-[#0F172A] to-[#131B2E] border border-slate-700/80 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h2 className="text-sm font-bold text-white">
              Gemini Quantitative Analyst Synthesis
            </h2>
          </div>

          <button
            onClick={handleRequestAiThesis}
            disabled={generatingAi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-teal-500/20 border border-teal-500/50 hover:bg-teal-500/30 text-teal-300 text-xs font-semibold transition-colors"
          >
            <Sparkles className={`w-3.5 h-3.5 ${generatingAi ? 'animate-spin' : ''}`} />
            <span>{generatingAi ? 'Generating Synthesis...' : 'Refresh AI Interpretation'}</span>
          </button>
        </div>

        <div className="text-xs text-slate-300 leading-relaxed space-y-3 font-sans">
          <p className="bg-slate-900/60 p-3 rounded border border-slate-800 italic">
            "{aiAnalysis?.marketSummary || signal.aiThesis || signal.supportingEvidence[0]}"
          </p>

          {aiAnalysis && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <span className="font-semibold text-teal-400 block mb-1">AI Supporting Factors:</span>
                <ul className="space-y-1 text-slate-400">
                  {aiAnalysis.supportingEvidence?.map((p: string, i: number) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-semibold text-amber-400 block mb-1">AI Key Vulnerabilities:</span>
                <ul className="space-y-1 text-slate-400">
                  {aiAnalysis.keyRisks?.map((p: string, i: number) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
