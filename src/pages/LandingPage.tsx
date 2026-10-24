import React from 'react';
import { FloatingLogoBadge } from '../components/FloatingLogoBadge';
import { ScrollReveal } from '../components/ScrollReveal';
import {
  TrendingUp,
  Layers,
  BarChart3,
  Radio,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface LandingPageProps {
  navigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative px-4 lg:px-8 pt-12 lg:pt-16 max-w-6xl mx-auto text-center space-y-6">
        {/* Floating Centerpiece Logo Badge */}
        <div className="flex justify-center pb-2">
          <FloatingLogoBadge size="lg" showText={false} />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 backdrop-blur shadow-sm">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-sathuka-pulse-glow" />
          <span>Presented by <strong className="text-white">Sathuka Web3 Community</strong></span>
          <span className="text-teal-400 font-mono">· v2.4 Institutional Engine</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Institutional Crypto Intelligence & <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-sky-400">Explainable Signals</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Reconcile real-time CEX order-book liquidity, US spot Bitcoin & Ethereum ETF flows, derivatives funding, and technical analysis into deterministic, backtested trading signals.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2"
          >
            <span>Launch Market Terminal</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/signals')}
            className="px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm border border-slate-700 transition-colors"
          >
            Explore Active Signals
          </button>

          <button
            onClick={() => navigate('/etf-flows')}
            className="px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-sm border border-slate-700 transition-colors"
          >
            US Spot ETF Tracker
          </button>
        </div>

        {/* Live Market Ribbon */}
        <ScrollReveal direction="up" delay={150}>
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-xs font-mono">
            <div className="p-3 rounded bg-slate-900/80 border border-slate-800/80 backdrop-blur hover:border-teal-500/50 transition-colors">
              <span className="text-slate-400 block text-[10px]">BTC/USDT Spot</span>
              <span className="text-white font-bold text-sm">$81,745</span>
              <span className="text-emerald-400 block text-[11px]">+2.45%</span>
            </div>

            <div className="p-3 rounded bg-slate-900/80 border border-slate-800/80 backdrop-blur hover:border-teal-500/50 transition-colors">
              <span className="text-slate-400 block text-[10px]">US Spot ETF 24h Flow</span>
              <span className="text-emerald-400 font-bold text-sm">+$226.9M</span>
              <span className="text-slate-400 block text-[10px]">5-day cumulative</span>
            </div>

            <div className="p-3 rounded bg-slate-900/80 border border-slate-800/80 backdrop-blur hover:border-teal-500/50 transition-colors">
              <span className="text-slate-400 block text-[10px]">Binance CEX Imbalance</span>
              <span className="text-teal-400 font-bold text-sm">+34.2%</span>
              <span className="text-slate-400 block text-[10px]">25bps bid bias</span>
            </div>

            <div className="p-3 rounded bg-slate-900/80 border border-slate-800/80 backdrop-blur hover:border-teal-500/50 transition-colors">
              <span className="text-slate-400 block text-[10px]">Perp Funding (8h)</span>
              <span className="text-sky-400 font-bold text-sm">0.0071%</span>
              <span className="text-slate-400 block text-[10px]">Disciplined</span>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 3 Core Architecture Pillars */}
      <section className="px-4 lg:px-8 max-w-6xl mx-auto space-y-8">
        <ScrollReveal direction="up" delay={100}>
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Built On Empirical Multi-Pillar Market Microstructure
            </h2>
            <p className="text-xs text-slate-400">
              Never trade on isolated indicators. CryptoPulse combines five verified pillars before issuing directional capital signals.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScrollReveal direction="up" delay={100}>
            <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/50 transition-all backdrop-blur space-y-3 h-full">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">1. US Spot ETF Flow Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track daily net creations, redemptions, and AUM across BlackRock IBIT, Fidelity FBTC, Bitwise, and Ark 21Shares with SEC Form 8-K reconciliation.
              </p>
              <div className="text-xs text-teal-400 font-semibold pt-1">
                Weight in Signal Engine: 15%
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200}>
            <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 transition-all backdrop-blur space-y-3 h-full">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">2. CEX Depth & Imbalance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compute standardized bid-ask spread in basis points, bid/ask depth at 10, 25, and 50 bps, and multi-venue depth imbalances across Binance, Coinbase, and OKX.
              </p>
              <div className="text-xs text-sky-400 font-semibold pt-1">
                Weight in Signal Engine: 25%
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={300}>
            <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all backdrop-blur space-y-3 h-full">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">3. Explainable AI Signals</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every signal delivers clear ATR-based entry zones, stop losses, profit targets, and invalidation criteria. Gemini AI synthesizes textual evidence without hallucinating numbers.
              </p>
              <div className="text-xs text-amber-400 font-semibold pt-1">
                Technical: 30% · Derivs: 20% · News: 10%
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Sathuka Web3 Community Credibility Callout */}
      <section className="px-4 lg:px-8 max-w-4xl mx-auto">
        <ScrollReveal direction="zoom" delay={150}>
          <div className="p-6 rounded-xl bg-gradient-to-r from-slate-900/90 via-[#0F172A]/90 to-slate-900/90 border border-slate-800 hover:border-teal-500/40 transition-colors flex flex-col sm:flex-row items-center gap-6 backdrop-blur shadow-xl">
            <FloatingLogoBadge size="md" showText={false} className="shrink-0" />
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-lg font-bold text-white">
                Sathuka Web3 Community Quantitative Initiative
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bridging institutional Wall Street market microstructure with decentralized digital asset intelligence. Developed as an open, auditable research standard for cryptocurrency traders worldwide.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono text-teal-400 pt-1">
                <span>• No Black-Box Models</span>
                <span>• Walk-Forward Backtesting</span>
                <span>• Direct SEC Attribution</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Call to Action Footer Strip */}
      <section className="px-4 lg:px-8 max-w-4xl mx-auto text-center space-y-4">
        <ScrollReveal direction="up" delay={150}>
          <h2 className="text-2xl font-bold text-white">Ready to elevate your trading intelligence?</h2>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/pricing')}
              className="px-6 py-2.5 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
            >
              Explore Pro & Premium Plans
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-colors"
            >
              Launch Terminal
            </button>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};
