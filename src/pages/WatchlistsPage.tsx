import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { MarketTicker } from '../types';
import { Bookmark, Bell, Plus, Trash2, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';

interface WatchlistsPageProps {
  navigate: (route: string) => void;
}

export const WatchlistsPage: React.FC<WatchlistsPageProps> = ({ navigate }) => {
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([]);
  const [tickers, setTickers] = useState<MarketTicker[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Form states
  const [alertSymbol, setAlertSymbol] = useState('BTC');
  const [alertType, setAlertType] = useState('PRICE_ABOVE');
  const [alertThreshold, setAlertThreshold] = useState('83000');
  const [alertChannel, setAlertChannel] = useState('IN_APP');
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    try {
      const [wlRes, mktsRes, altRes] = await Promise.all([
        api.getWatchlists(),
        api.getMarkets(),
        api.getAlerts()
      ]);
      setWatchlistSymbols(wlRes.symbols || []);
      setTickers(mktsRes.data || []);
      setAlerts(altRes.alerts || []);
    } catch (err) {
      console.error('Failed to load watchlists/alerts:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleWatchlist = async (sym: string) => {
    try {
      const res = await api.toggleWatchlist(sym);
      setWatchlistSymbols(res.symbols);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.createAlert({
        symbol: alertSymbol,
        type: alertType,
        threshold: Number(alertThreshold),
        channel: alertChannel
      });
      setAlerts([...alerts, res.alert]);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      await api.deleteAlert(id);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const watchlistTickers = tickers.filter(t => watchlistSymbols.includes(t.symbol));

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-teal-400" />
          Personalized Watchlists & Alert Triggers
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure real-time price boundary alarms, ETF creation spikes, and multi-pillar signal notifications
        </p>
      </div>

      {/* Watchlist Assets Table */}
      <div className="bg-[#0F172A] rounded-lg border border-slate-800 overflow-hidden space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Active Watchlist Assets ({watchlistTickers.length})</h2>
          <span className="text-xs text-slate-400">Click any asset to toggle</span>
        </div>

        {/* Quick symbol tags to add/remove */}
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-3 border-b border-slate-800">
          {tickers.map(t => {
            const isSaved = watchlistSymbols.includes(t.symbol);
            return (
              <button
                key={t.symbol}
                onClick={() => handleToggleWatchlist(t.symbol)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  isSaved
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <span>{t.symbol}</span>
                <span>{isSaved ? '✓' : '+'}</span>
              </button>
            );
          })}
        </div>

        {/* Watchlist table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                <th className="py-2.5">Asset</th>
                <th className="py-2.5">Price (USD)</th>
                <th className="py-2.5">24h Change</th>
                <th className="py-2.5">24h Volume</th>
                <th className="py-2.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {watchlistTickers.map(t => {
                const isUp = t.change24h >= 0;
                return (
                  <tr key={t.symbol} className="hover:bg-slate-800/40">
                    <td className="py-3 font-bold text-white font-sans flex items-center gap-2">
                      <span className="font-mono text-teal-400">{t.symbol}</span>
                      <span className="text-slate-400 text-xs">({t.name})</span>
                    </td>
                    <td className="py-3 text-white font-bold tabular-nums">
                      ${t.price.toLocaleString()}
                    </td>
                    <td className={`py-3 font-bold tabular-nums ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isUp ? '+' : ''}{t.change24h.toFixed(2)}%
                    </td>
                    <td className="py-3 text-slate-300 tabular-nums">
                      ${(t.volume24hUsd / 1e6).toFixed(1)}M
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => navigate(`/markets/${t.symbol}`)}
                        className="text-teal-400 hover:underline font-sans text-xs"
                      >
                        Deep Dive →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts Section: Form & Existing Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Alert Form */}
        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Create New Alert Trigger</h3>
          </div>

          <form onSubmit={handleCreateAlert} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Asset Symbol</label>
              <select
                value={alertSymbol}
                onChange={e => setAlertSymbol(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-400"
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="SOL">Solana (SOL)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Trigger Condition</label>
              <select
                value={alertType}
                onChange={e => setAlertType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-400"
              >
                <option value="PRICE_ABOVE">Price Above Threshold (USD)</option>
                <option value="PRICE_BELOW">Price Below Threshold (USD)</option>
                <option value="SIGNAL_TRIGGER">Signal Score Exceeds (+60)</option>
                <option value="ETF_INFLOW_SPIKE">US Spot ETF Inflow &gt; $200M</option>
                <option value="FUNDING_EXTREME">Perpetual Funding Exceeds 0.03%</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Threshold Value</label>
              <input
                type="number"
                value={alertThreshold}
                onChange={e => setAlertThreshold(e.target.value)}
                placeholder="e.g. 82500"
                className="w-full bg-slate-900 border border-slate-700/80 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-400"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Notification Channel</label>
              <select
                value={alertChannel}
                onChange={e => setAlertChannel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-teal-400"
              >
                <option value="IN_APP">In-App Terminal Push</option>
                <option value="EMAIL">Email Dispatch</option>
                <option value="TELEGRAM">Telegram Bot (Webhook)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-2.5 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
            >
              {creating ? 'Arming Alert...' : 'Arm Alert Trigger'}
            </button>
          </form>
        </div>

        {/* Active Alerts List */}
        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white">Configured Alerts ({alerts.length})</h3>

          <div className="space-y-2.5">
            {alerts.map(a => (
              <div
                key={a.id}
                className="p-3 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-sans">{a.symbol}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
                      {a.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-sans">
                    Threshold: <strong className="text-white font-mono">{a.threshold.toLocaleString()}</strong> · Channel: <strong className="text-teal-400 font-mono">{a.channel}</strong>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAlert(a.id)}
                  className="p-1.5 rounded text-slate-500 hover:text-red-400 transition-colors"
                  title="Remove Alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
