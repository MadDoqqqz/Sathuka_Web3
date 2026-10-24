import React from 'react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#080C14] text-xs text-slate-400 py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Community Attribution */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-teal-500/25 to-amber-500/20 blur-sm animate-sathuka-pulse-glow" />
            <img
              src="/assets/aistudio/image_1d08876f.png"
              alt="Sathuka Web3 Community"
              className="w-6 h-6 object-contain relative z-10 animate-sathuka-float"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white tracking-tight">
              CryptoPulse <span className="text-teal-400 font-normal">Intelligence</span>
            </span>
            <span className="text-[10px] text-slate-400">
              Powered by Sathuka Web3 Community · Quantitative Research Desk
            </span>
          </div>
        </div>

        {/* Clean Text Navigation Links */}
        <div className="flex flex-wrap items-center gap-5 text-slate-400 text-xs font-medium">
          <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">
            Overview
          </button>
          <button onClick={() => navigate('/markets')} className="hover:text-white transition-colors">
            Markets
          </button>
          <button onClick={() => navigate('/etf-flows')} className="hover:text-white transition-colors">
            ETF Flows
          </button>
          <button onClick={() => navigate('/liquidity')} className="hover:text-white transition-colors">
            Liquidity
          </button>
          <button onClick={() => navigate('/derivatives')} className="hover:text-white transition-colors">
            Derivatives
          </button>
          <button onClick={() => navigate('/signals')} className="hover:text-white transition-colors">
            Signals
          </button>
          <button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors">
            Pricing
          </button>
        </div>

        {/* Legal & Risk Statement */}
        <div className="text-[11px] text-slate-400 text-center md:text-right">
          <div>© {new Date().getFullYear()} CryptoPulse Intelligence. All rights reserved.</div>
          <div className="text-slate-400">Research & analytics only. Not investment or brokerage advice.</div>
        </div>
      </div>
    </footer>
  );
};
