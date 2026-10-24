import React from 'react';
import {
  TrendingUp,
  BarChart3,
  Layers,
  Activity,
  Flame,
  Radio,
  Newspaper,
  Calculator,
  Bookmark,
  CreditCard,
  Settings,
  Database
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  currentUser: User | null;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  navigate,
  currentUser
}) => {
  const menuGroups = [
    {
      title: 'MARKET INTELLIGENCE',
      items: [
        { label: 'Overview', route: '/dashboard', icon: Activity },
        { label: 'Markets Screener', route: '/markets', icon: TrendingUp },
        { label: 'US Spot ETF Flows', route: '/etf-flows', icon: Layers },
        { label: 'CEX Liquidity & Depth', route: '/liquidity', icon: BarChart3 },
        { label: 'Derivatives & Basis', route: '/derivatives', icon: Flame }
      ]
    },
    {
      title: 'QUANTITATIVE & SIGNALS',
      items: [
        { label: 'Signal Engine', route: '/signals', icon: Radio },
        { label: 'News & AI Impact', route: '/news', icon: Newspaper },
        { label: 'Strategy Backtest', route: '/backtesting', icon: Calculator },
        { label: 'Watchlists & Alerts', route: '/watchlists', icon: Bookmark }
      ]
    },
    {
      title: 'PLATFORM & SYSTEM',
      items: [
        { label: 'Plans & Pricing', route: '/pricing', icon: CreditCard },
        { label: 'Account Profile', route: '/account', icon: Settings },
        ...(currentUser?.role === 'ADMINISTRATOR' ? [
          { label: 'Admin Workspace', route: '/admin', icon: Database }
        ] : [])
      ]
    }
  ];

  return (
    <aside className="w-56 shrink-0 bg-[#0A0E17] border-r border-slate-800/80 flex flex-col justify-between hidden md:flex h-[calc(100vh-3.5rem)] sticky top-14">
      <div className="py-3 px-3 space-y-5 overflow-y-auto no-scrollbar">
        {menuGroups.map(group => (
          <div key={group.title} className="space-y-1">
            <div className="px-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {group.title}
            </div>
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route || (item.route !== '/dashboard' && currentRoute.startsWith(item.route));

              return (
                <button
                  key={item.route}
                  onClick={() => navigate(item.route)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-slate-800 text-teal-400 font-semibold border-l-2 border-teal-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Freshness & Connection Status Strip */}
      <div className="p-3 border-t border-slate-800/80 bg-[#080C14] text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Binance Spot</span>
          <span className="text-emerald-400 font-mono text-[10px]">LIVE (82ms)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">US Spot ETF</span>
          <span className="text-teal-400 font-mono text-[10px]">FINALIZED</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Gemini AI Engine</span>
          <span className="text-indigo-400 font-mono text-[10px]">ACTIVE</span>
        </div>
      </div>
    </aside>
  );
};
