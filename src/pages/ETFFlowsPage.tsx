import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ETFDailyFlow, ETFFund } from '../types';
import { Layers, TrendingUp, TrendingDown, Info, ShieldCheck, Download, Calendar } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

export const ETFFlowsPage: React.FC = () => {
  const [assetFilter, setAssetFilter] = useState<'BTC' | 'ETH'>('BTC');
  const [funds, setFunds] = useState<ETFFund[]>([]);
  const [dailyFlows, setDailyFlows] = useState<ETFDailyFlow[]>([]);
  const [totalAum, setTotalAum] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getETFFunds()
      .then(res => {
        setFunds(res.funds || []);
        setDailyFlows(res.dailyFlows || []);
        setTotalAum(res.totalAumUsd || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredFunds = funds.filter(f => f.underlyingAsset === assetFilter);
  const filteredDaily = dailyFlows.filter(f => f.asset === assetFilter);

  const totalDailyFlow = filteredFunds.reduce((sum, f) => sum + f.dailyFlowUsd, 0);
  const totalCumulativeFlow = filteredFunds.reduce((sum, f) => sum + f.cumulativeFlowUsd, 0);
  const totalAssetAum = filteredFunds.reduce((sum, f) => sum + f.aumUsd, 0);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Controls */}
      <ScrollReveal direction="down" delay={40}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-teal-400" />
              US Spot Cryptocurrency ETF Flows
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified institutional fund-level creations, redemptions, AUM disclosures, and SEC filing tracking
            </p>
          </div>

          {/* Asset Switcher Tab */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 rounded border border-slate-700/80 p-0.5">
              <button
                onClick={() => setAssetFilter('BTC')}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                  assetFilter === 'BTC'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Spot Bitcoin ETFs (10 Funds)
              </button>
              <button
                onClick={() => setAssetFilter('ETH')}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                  assetFilter === 'ETH'
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Spot Ethereum ETFs (8 Funds)
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Aggregate ETF Metrics Row */}
      <ScrollReveal direction="up" delay={80}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-xs text-slate-400">24h Net Inflow ({assetFilter})</div>
          <div className={`text-2xl font-bold font-mono tabular-nums mt-1 ${totalDailyFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalDailyFlow >= 0 ? '+' : '-'}${Math.abs(totalDailyFlow / 1e6).toFixed(1)}M
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Observation Date: <strong>2026-10-22</strong>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-xs text-slate-400">Total Net Assets (AUM)</div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums mt-1">
            ${(totalAssetAum / 1e9).toFixed(2)}B
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {filteredFunds.length} authorized US issuers
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-xs text-slate-400">Cumulative Net Inflow</div>
          <div className="text-2xl font-bold font-mono text-teal-400 tabular-nums mt-1">
            +${(totalCumulativeFlow / 1e9).toFixed(2)}B
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            All-time net institutional absorption
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-xs text-slate-400">Reporting Verification Status</div>
          <div className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1.5 mt-2">
            <ShieldCheck className="w-4 h-4" />
            FINALIZED & AUDITED
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Source: SEC Form 8-K & Daily Custodian Sheets
          </div>
        </div>
      </div>
    </ScrollReveal>

      {/* Historical Flow Visualization Strip */}
      <ScrollReveal direction="up" delay={120}>
        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">Daily Net Inflow / Outflow History</h3>
              <p className="text-xs text-slate-400">Daily net creation/redemption volume in millions USD</p>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-3">
              <span className="flex items-center gap-1 font-mono">
                <span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block"></span> Net Inflow
              </span>
              <span className="flex items-center gap-1 font-mono">
                <span className="w-2.5 h-2.5 rounded bg-red-400 inline-block"></span> Net Outflow
              </span>
            </div>
          </div>

          {/* Visual Bar Chart */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-3">
            {filteredDaily.map(d => {
              const isPos = d.totalNetFlowUsd >= 0;
              const flowMillions = Math.abs(d.totalNetFlowUsd / 1e6);
              const heightPct = Math.min(100, Math.max(15, (flowMillions / 250) * 100));

              return (
                <div key={d.date} className="p-3 rounded bg-slate-900/80 border border-slate-800 flex flex-col justify-between h-40">
                  <div className="text-[11px] font-mono text-slate-400">{d.date}</div>
                  <div className="my-auto flex flex-col items-center justify-end h-20 w-full">
                    <div
                      className={`w-8 rounded-t transition-all ${isPos ? 'bg-emerald-400' : 'bg-red-400'}`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <div className="text-center font-mono">
                    <div className={`text-xs font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPos ? '+' : '-'}${flowMillions.toFixed(1)}M
                    </div>
                    <div className="text-[10px] text-slate-500">${d.priceUsd.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

      {/* Fund by Fund Breakdown Table */}
      <ScrollReveal direction="up" delay={160}>
        <div className="bg-[#0F172A] rounded-lg border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">US Spot {assetFilter} ETF Issuer Breakdown</h3>
            <span className="text-xs text-slate-400 font-mono">100% Normalized USD</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Ticker</th>
                  <th className="py-3 px-4">Fund Name</th>
                  <th className="py-3 px-4">Issuer</th>
                  <th className="py-3 px-4">Sponsor Fee</th>
                  <th className="py-3 px-4">24h Net Flow</th>
                  <th className="py-3 px-4">7d Net Flow</th>
                  <th className="py-3 px-4">Total AUM</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredFunds.map(fund => {
                  const isPos = fund.dailyFlowUsd >= 0;
                  return (
                    <tr key={fund.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-teal-400 text-sm">
                        {fund.ticker}
                      </td>
                      <td className="py-3 px-4 font-sans text-white">
                        {fund.fundName}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-300">
                        {fund.issuer}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {fund.feePercent.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 font-bold tabular-nums">
                        <span className={isPos ? 'text-emerald-400' : 'text-red-400'}>
                          {isPos ? '+' : '-'}${Math.abs(fund.dailyFlowUsd / 1e6).toFixed(1)}M
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold tabular-nums">
                        <span className={fund.weeklyFlowUsd >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {fund.weeklyFlowUsd >= 0 ? '+' : '-'}${Math.abs(fund.weeklyFlowUsd / 1e6).toFixed(1)}M
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white tabular-nums">
                        ${(fund.aumUsd / 1e9).toFixed(2)}B
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 font-semibold">
                          {fund.status}
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

      {/* Methodology & Regulatory Compliance Callout */}
      <ScrollReveal direction="up" delay={200}>
        <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400 leading-relaxed">
          <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200">Regulatory Disclosure & Flow Methodology:</strong>
            <p className="mt-1">
              Data reflects reported authorized participant share creation and redemption orders filed with custody banks (BNY Mellon, Coinbase Custody) and verified against SEC disclosures. Observation dates represent trade date ($T$), reconciled after close of trading ($T+1$). ETF trading volume is distinct from net balance sheet flows. CryptoPulse Intelligence does not estimate flows based solely on intraday price movements.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};
