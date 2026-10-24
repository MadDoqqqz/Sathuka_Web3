import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { BacktestResult } from '../types';
import { Calculator, Play, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

export const BacktestingPage: React.FC = () => {
  const [symbol, setSymbol] = useState('BTC');
  const [timeframe, setTimeframe] = useState('4h');
  const [entryScore, setEntryScore] = useState(55);
  const [riskReward, setRiskReward] = useState(2.8);
  const [feeBps, setFeeBps] = useState(5);
  const [slippageBps, setSlippageBps] = useState(2);
  const [capital, setCapital] = useState(100000);

  const [result, setResult] = useState<BacktestResult | null>(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBacktestDefault()
      .then(res => setResult(res.result))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRunBacktest = async () => {
    setRunning(true);
    try {
      const res = await api.runBacktest({
        symbol,
        timeframe,
        entryThresholdScore: entryScore,
        riskRewardTarget: riskReward,
        feeBps,
        slippageBps,
        capitalUsd: capital
      });
      setResult(res.result);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <ScrollReveal direction="down" delay={40}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Calculator className="w-6 h-6 text-teal-400" />
              Walk-Forward Quantitative Backtester
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical walk-forward simulation incorporating trading fees, fill slippage, and stop-loss execution
            </p>
          </div>

          <button
            onClick={handleRunBacktest}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-xs transition-all shadow-md"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'Simulating Strategy...' : 'Run Simulation'}</span>
          </button>
        </div>
      </ScrollReveal>

      {/* Configuration Matrix */}
      <ScrollReveal direction="up" delay={80}>
        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Strategy Parameters & Market Microstructure Assumptions
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Asset</label>
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-teal-400"
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="SOL">Solana (SOL)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Timeframe</label>
            <select
              value={timeframe}
              onChange={e => setTimeframe(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-teal-400"
            >
              <option value="1h">1 Hour (1h)</option>
              <option value="4h">4 Hours (4h)</option>
              <option value="1D">1 Day (1D)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Signal Score Gate</label>
            <input
              type="number"
              value={entryScore}
              onChange={e => setEntryScore(Number(e.target.value))}
              min={40}
              max={85}
              className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-teal-400"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Take-Profit Target (R)</label>
            <input
              type="number"
              step="0.1"
              value={riskReward}
              onChange={e => setRiskReward(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-teal-400"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Fee Drag (bps)</label>
            <input
              type="number"
              value={feeBps}
              onChange={e => setFeeBps(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-teal-400"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Slippage (bps)</label>
            <input
              type="number"
              value={slippageBps}
              onChange={e => setSlippageBps(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>
      </div>
    </ScrollReveal>

      {/* KPI Performance Metric Strip */}
      {result && (
        <ScrollReveal direction="up" delay={120}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Net Return</div>
              <div className={`text-xl font-bold font-mono mt-1 ${result.netReturnPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.netReturnPct >= 0 ? '+' : ''}{result.netReturnPct}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                Final: ${result.finalCapitalUsd.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Win Rate</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {result.winRatePct}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {result.winningTrades} W / {result.losingTrades} L ({result.totalTrades} total)
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Profit Factor</div>
              <div className="text-xl font-bold font-mono text-teal-400 mt-1">
                {result.profitFactor}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                Expectancy: +{result.expectancyPct}%
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Max Drawdown</div>
              <div className="text-xl font-bold font-mono text-red-400 mt-1">
                -{result.maxDrawdownPct}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Peak-to-trough
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Sharpe Ratio</div>
              <div className="text-xl font-bold font-mono text-sky-400 mt-1">
                {result.sharpeRatio}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Annualized
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#0F172A] border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Execution Drag</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {result.config.feeBps + result.config.slippageBps} bps
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Fees + Slippage
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Equity Curve Visualization */}
      {result && result.equityCurve && (
        <ScrollReveal direction="up" delay={160}>
          <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Simulated Cumulative Equity Growth Curve</h3>
              <span className="text-xs text-slate-400 font-mono">Initial Capital: ${result.config.capitalUsd.toLocaleString()}</span>
            </div>

            {/* Sparkline / Bar Graph of Equity Steps */}
            <div className="h-44 flex items-end gap-1 pt-6 px-2 bg-slate-900/60 rounded border border-slate-800/80">
              {result.equityCurve.map((pt, i) => {
                const minVal = result.config.capitalUsd * 0.95;
                const maxVal = Math.max(...result.equityCurve.map(p => p.equity)) * 1.02;
                const range = maxVal - minVal || 1;
                const heightPct = Math.min(100, Math.max(10, ((pt.equity - minVal) / range) * 100));

                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <div
                      className="w-full bg-teal-500 rounded-t hover:bg-teal-300 transition-colors"
                      style={{ height: `${heightPct}%` }}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 hidden group-hover:block bg-slate-950 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-white font-mono whitespace-nowrap z-10">
                      ${pt.equity.toLocaleString()} ({pt.date})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Trade Log Table */}
      {result && (
        <ScrollReveal direction="up" delay={200}>
          <div className="bg-[#0F172A] rounded-lg border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Out-of-Sample Simulated Trade Log</h3>
              <span className="text-xs text-slate-400 font-mono">{result.trades.length} Simulated Executions</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Trade ID</th>
                    <th className="py-2.5 px-4">Direction</th>
                    <th className="py-2.5 px-4">Entry Time</th>
                    <th className="py-2.5 px-4">Exit Time</th>
                    <th className="py-2.5 px-4">Entry Price</th>
                    <th className="py-2.5 px-4">Exit Price</th>
                    <th className="py-2.5 px-4">Net P&L ($)</th>
                    <th className="py-2.5 px-4">Return (%)</th>
                    <th className="py-2.5 px-4">Exit Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {result.trades.map(trade => {
                    const isWin = trade.netProfitUsd > 0;
                    return (
                      <tr key={trade.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 text-slate-400 font-bold">{trade.id}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            trade.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {trade.direction}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-400">{trade.entryTime.slice(0, 10)}</td>
                        <td className="py-2.5 px-4 text-slate-400">{trade.exitTime.slice(0, 10)}</td>
                        <td className="py-2.5 px-4 text-white">${trade.entryPrice.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-white">${trade.exitPrice.toLocaleString()}</td>
                        <td className={`py-2.5 px-4 font-bold ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isWin ? '+' : ''}${trade.netProfitUsd.toLocaleString()}
                        </td>
                        <td className={`py-2.5 px-4 font-bold ${isWin ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isWin ? '+' : ''}{trade.returnPct}%
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                            {trade.exitReason}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Mandatory Disclaimer */}
      <ScrollReveal direction="up" delay={240}>
        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400 leading-relaxed">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200">Quantitative Risk & Simulation Disclosure:</strong>
            <p className="mt-1">
              Backtest results are hypothetical and modeled using historical price series and walk-forward parameter isolation. Past performance does not guarantee future results. Simulated trading does not capture all market liquidity shocks, broker halts, latency delays, or exchange outage events.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};
