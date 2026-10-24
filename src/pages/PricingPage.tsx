import React, { useState } from 'react';
import { api } from '../services/api';
import { Check, Zap, Shield, Sparkles } from 'lucide-react';

interface PricingPageProps {
  navigate: (route: string) => void;
  onUpgradeSuccess: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ navigate, onUpgradeSuccess }) => {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'plan-free',
      name: 'Free',
      subtitle: 'For retail researchers exploring basic cryptocurrency markets',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        'Public Market Overview (BTC, ETH, SOL, Alts)',
        'Daily Delayed News Feed (15 min delay)',
        'Daily Public Candidate Signal Previews (1D timeframe)',
        'Methodology & Quantitative Documentation',
        'Single Watchlist (Up to 5 assets)',
        'Community Support'
      ],
      ctaText: 'Current Plan',
      isPopular: false
    },
    {
      id: 'plan-pro',
      name: 'Pro Trader',
      subtitle: 'For active traders demanding real-time order books & ETF analytics',
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        'Everything in Free, plus:',
        'Real-time CEX Market Feeds & Candlestick Charts',
        'Full 5-Pillar Signal Rationales & Stop Loss/Take Profit Zones',
        'Verified US Spot BTC & ETH ETF Daily Net Flows',
        'Perpetual Futures Derivatives (Funding Rates & Open Interest)',
        'Unlimited Watchlists & Email/Telegram Alerts',
        'Standard Strategy Backtester (1-year walk-forward history)'
      ],
      ctaText: 'Upgrade to Pro',
      isPopular: true
    },
    {
      id: 'plan-premium',
      name: 'Institutional Premium',
      subtitle: 'For quant funds, family offices, and systematic crypto desks',
      monthlyPrice: 129,
      annualPrice: 103,
      features: [
        'Everything in Pro, plus:',
        'Deep CEX Order-Book Depth & Imbalance (10/25/50 bps ladders)',
        'Gemini AI Quantitative Analyst Synthesis & News Impact Scoring',
        'Fund-Level SEC Disclosures (IBIT, FBTC, ARKB, BITB, GBTC, ETHA)',
        'Walk-Forward Strategy Backtesting & Execution Drag Slippage',
        'Direct REST API Webhook Access for Automated Systems',
        'Multi-User Trading Desk Support'
      ],
      ctaText: 'Upgrade to Premium',
      isPopular: false
    }
  ];

  const handleCheckout = async (planId: string) => {
    setUpgradingPlan(planId);
    try {
      const res = await api.upgradePlan(planId);
      alert(res.message);
      onUpgradeSuccess();
      navigate('/dashboard');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUpgradingPlan(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
          Institutional Market Intelligence Plans
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Unlock institutional CEX depth ladders, verified US Spot ETF flow reconciliations, and explainable 5-pillar trading signals.
        </p>

        {/* Interval Selector */}
        <div className="pt-2 flex items-center justify-center gap-3 text-xs">
          <span className={billingInterval === 'month' ? 'text-white font-semibold' : 'text-slate-400'}>Monthly</span>
          <button
            onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
            className="w-12 h-6 rounded-full bg-slate-800 p-0.5 relative transition-colors border border-slate-700"
          >
            <div className={`w-5 h-5 rounded-full bg-teal-400 transition-transform ${billingInterval === 'year' ? 'translate-x-6' : ''}`} />
          </button>
          <span className={billingInterval === 'year' ? 'text-white font-semibold' : 'text-slate-400'}>
            Annual <span className="text-teal-400 font-mono font-bold">(Save 20%)</span>
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(p => {
          const price = billingInterval === 'month' ? p.monthlyPrice : p.annualPrice;
          return (
            <div
              key={p.id}
              className={`p-6 rounded-xl flex flex-col justify-between transition-all ${
                p.isPopular
                  ? 'bg-[#0F172A] border-2 border-teal-500 shadow-xl shadow-teal-500/10'
                  : 'bg-[#0B101B] border border-slate-800'
              }`}
            >
              <div className="space-y-4">
                {p.isPopular && (
                  <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider font-mono">
                    Most Popular for Traders
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.subtitle}</p>
                </div>

                <div className="pt-2 flex items-baseline gap-1 font-mono">
                  <span className="text-3xl font-bold text-white">${price}</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleCheckout(p.id)}
                  disabled={upgradingPlan === p.id}
                  className={`w-full py-2.5 rounded font-bold text-xs transition-all shadow-sm ${
                    p.isPopular
                      ? 'bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {upgradingPlan === p.id ? 'Processing Upgrade...' : p.ctaText}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="bg-[#0F172A] rounded-lg border border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-white">Concrete Entitlement & Limit Comparison</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                <th className="py-2.5 font-sans">Feature Module</th>
                <th className="py-2.5">Free</th>
                <th className="py-2.5 text-teal-400">Pro</th>
                <th className="py-2.5 text-amber-400">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 font-sans text-white">Candle & Price Data</td>
                <td className="py-2.5">15-min Delayed</td>
                <td className="py-2.5 text-emerald-400">Real-Time (Binance)</td>
                <td className="py-2.5 text-emerald-400">Real-Time (Multi-CEX)</td>
              </tr>
              <tr>
                <td className="py-2.5 font-sans text-white">US Spot ETF Flows</td>
                <td className="py-2.5">Aggregate Summary</td>
                <td className="py-2.5">Full Daily Series</td>
                <td className="py-2.5 text-emerald-400">Fund-Level SEC Breakdown</td>
              </tr>
              <tr>
                <td className="py-2.5 font-sans text-white">CEX Order Book Depth</td>
                <td className="py-2.5">Top 5 Levels</td>
                <td className="py-2.5">10 & 25 bps Depth</td>
                <td className="py-2.5 text-emerald-400">Full 50 bps + Imbalance</td>
              </tr>
              <tr>
                <td className="py-2.5 font-sans text-white">Explainable Signals</td>
                <td className="py-2.5">Daily Candidates</td>
                <td className="py-2.5 text-emerald-400">15m, 1h, 4h, 1D Active</td>
                <td className="py-2.5 text-emerald-400">Instant AI Quantitative Synthesis</td>
              </tr>
              <tr>
                <td className="py-2.5 font-sans text-white">Walk-Forward Backtesting</td>
                <td className="py-2.5">Disabled</td>
                <td className="py-2.5">1 Year History</td>
                <td className="py-2.5 text-emerald-400">Unlimited + Slippage Model</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
