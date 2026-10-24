import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MarketTicker } from '../types';
import { Search, TrendingUp, TrendingDown, ArrowUpDown, ChevronRight } from 'lucide-react';
import { ScrollReveal } from '../components/ScrollReveal';

interface MarketsPageProps {
  navigate: (route: string) => void;
}

export const MarketsPage: React.FC<MarketsPageProps> = ({ navigate }) => {
  const [tickers, setTickers] = useState<MarketTicker[]>([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'volume' | 'price' | 'change'>('volume');
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMarkets()
      .then(res => setTickers(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = tickers.filter(t =>
    t.symbol.toLowerCase().includes(search.toLowerCase()) ||
    t.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    let valA = 0;
    let valB = 0;
    if (sortField === 'volume') { valA = a.volume24hUsd; valB = b.volume24hUsd; }
    else if (sortField === 'price') { valA = a.price; valB = b.price; }
    else if (sortField === 'change') { valA = a.change24h; valB = b.change24h; }

    return sortAsc ? valA - valB : valB - valA;
  });

  const handleSort = (field: 'volume' | 'price' | 'change') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <ScrollReveal direction="down" delay={40}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
              Cryptocurrency Markets & Screener
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Institutional multi-asset coverage with live Binance spot order feeds and volume analytics
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search asset symbol or name..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>
      </ScrollReveal>

      {/* Markets Table */}
      <ScrollReveal direction="up" delay={100}>
        <div className="bg-[#0F172A] rounded-lg border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('price')}>
                  <div className="flex items-center gap-1">
                    Price (USD) <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('change')}>
                  <div className="flex items-center gap-1">
                    24h Change <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">24h High / Low</th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('volume')}>
                  <div className="flex items-center gap-1">
                    24h Volume (USD) <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Market Cap</th>
                <th className="py-3 px-4">Feed Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map(t => {
                const isUp = t.change24h >= 0;
                return (
                  <tr
                    key={t.symbol}
                    onClick={() => navigate(`/markets/${t.symbol}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                          {t.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs tracking-wide">{t.symbol}</div>
                          <div className="text-[10px] text-slate-400 font-sans">{t.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-bold text-white tabular-nums">
                      ${t.price > 10 ? t.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : t.price.toFixed(4)}
                    </td>

                    <td className="py-3 px-4 tabular-nums">
                      <span className={`inline-flex items-center gap-1 font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? '+' : ''}{t.change24h.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300 tabular-nums">
                      <div className="text-[11px]">${t.high24h.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">${t.low24h.toLocaleString()}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-300 tabular-nums">
                      ${(t.volume24hUsd / 1e6).toFixed(1)}M
                    </td>

                    <td className="py-3 px-4 text-slate-300 tabular-nums">
                      ${(t.marketCapUsd / 1e9).toFixed(2)}B
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 font-sans font-semibold">
                        {t.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/markets/${t.symbol}`);
                        }}
                        className="p-1 text-slate-400 hover:text-teal-400 inline-flex items-center gap-1 font-sans text-xs"
                      >
                        Deep Dive <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ScrollReveal>
  </div>
);
};
