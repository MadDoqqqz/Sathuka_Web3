import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Shield, ChevronDown, CheckCircle, Zap } from 'lucide-react';

interface HeaderProps {
  currentRoute: string;
  navigate: (route: string) => void;
  currentUser: User | null;
  onRoleSwitch: (role: UserRole, planId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  navigate,
  currentUser,
  onRoleSwitch
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Overview', route: '/dashboard' },
    { label: 'Markets', route: '/markets' },
    { label: 'ETF Flows', route: '/etf-flows' },
    { label: 'Liquidity', route: '/liquidity' },
    { label: 'Derivatives', route: '/derivatives' },
    { label: 'Signals', route: '/signals' },
    { label: 'News', route: '/news' },
    { label: 'Backtest', route: '/backtesting' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B101B]/95 backdrop-blur border-b border-slate-800/80 px-4 lg:px-6 h-14 flex items-center justify-between gap-6">
      {/* Zone 1: Single text element wordmark with Sathuka brand logo */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-left group transition-opacity hover:opacity-95"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-teal-500/30 to-amber-500/25 blur-sm animate-sathuka-pulse-glow pointer-events-none" />
            <img
              src="/assets/aistudio/image_1d08876f.png"
              alt="Sathuka Web3 Community"
              className="w-7 h-7 object-contain rounded relative z-10 animate-sathuka-float"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
              CryptoPulse <span className="text-teal-400 font-normal">Intelligence</span>
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider">
              Sathuka Web3
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: 4–8 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-300 overflow-x-auto no-scrollbar">
        {navLinks.map(link => {
          const isActive = currentRoute === link.route || (link.route !== '/dashboard' && currentRoute.startsWith(link.route));
          return (
            <button
              key={link.route}
              onClick={() => navigate(link.route)}
              className={`whitespace-nowrap transition-colors py-1 px-1.5 border-b-2 ${
                isActive
                  ? 'text-teal-400 border-teal-400 font-semibold'
                  : 'text-slate-300 border-transparent hover:text-white'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action / Role Entitlement switcher */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Quick Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-xs font-medium text-slate-200 transition-colors whitespace-nowrap"
            title="Switch User Role to test Public, Premium or Admin access"
          >
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline text-slate-400 font-normal">Role:</span>
            <span className={
              currentUser?.role === 'ADMINISTRATOR' ? 'text-amber-400 font-semibold' :
              currentUser?.role === 'PREMIUM_MEMBER' ? 'text-teal-400 font-semibold' :
              'text-slate-300'
            }>
              {currentUser?.role === 'ADMINISTRATOR' ? 'Admin' :
               currentUser?.role === 'PREMIUM_MEMBER' ? 'Premium Member' : 'Public Visitor'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 border border-slate-700 rounded-lg shadow-2xl p-2 z-50 text-xs text-slate-200">
              <div className="px-2 py-1.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                Switch Role / Entitlement
              </div>

              <button
                onClick={() => {
                  onRoleSwitch('PUBLIC_VISITOR', 'plan-free');
                  setRoleMenuOpen(false);
                }}
                className={`w-full text-left px-2 py-2 rounded flex items-center justify-between hover:bg-slate-800 transition-colors ${
                  currentUser?.role === 'PUBLIC_VISITOR' ? 'text-teal-400 font-semibold bg-slate-800/50' : 'text-slate-300'
                }`}
              >
                <div>
                  <div className="font-medium">Public Visitor</div>
                  <div className="text-[10px] text-slate-400">Public overview, delayed news & signals</div>
                </div>
                {currentUser?.role === 'PUBLIC_VISITOR' && <CheckCircle className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  onRoleSwitch('PREMIUM_MEMBER', 'plan-pro');
                  setRoleMenuOpen(false);
                }}
                className={`w-full text-left px-2 py-2 rounded flex items-center justify-between hover:bg-slate-800 transition-colors ${
                  currentUser?.role === 'PREMIUM_MEMBER' ? 'text-teal-400 font-semibold bg-slate-800/50' : 'text-slate-300'
                }`}
              >
                <div>
                  <div className="font-medium">Premium Member</div>
                  <div className="text-[10px] text-slate-400">Full ETF, order-book depth, live signals</div>
                </div>
                {currentUser?.role === 'PREMIUM_MEMBER' && <CheckCircle className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  onRoleSwitch('ADMINISTRATOR', 'plan-premium');
                  setRoleMenuOpen(false);
                }}
                className={`w-full text-left px-2 py-2 rounded flex items-center justify-between hover:bg-slate-800 transition-colors ${
                  currentUser?.role === 'ADMINISTRATOR' ? 'text-amber-400 font-semibold bg-slate-800/50' : 'text-slate-300'
                }`}
              >
                <div>
                  <div className="font-medium">Administrator</div>
                  <div className="text-[10px] text-slate-400">Ingestion logs, provider configs, audit</div>
                </div>
                {currentUser?.role === 'ADMINISTRATOR' && <CheckCircle className="w-3.5 h-3.5" />}
              </button>

              <div className="mt-1 pt-1 border-t border-slate-800 flex justify-between">
                <button
                  onClick={() => {
                    navigate('/account');
                    setRoleMenuOpen(false);
                  }}
                  className="text-slate-400 hover:text-white px-2 py-1 text-[11px]"
                >
                  Account Profile
                </button>
                {currentUser?.role === 'ADMINISTRATOR' && (
                  <button
                    onClick={() => {
                      navigate('/admin');
                      setRoleMenuOpen(false);
                    }}
                    className="text-amber-400 hover:text-amber-300 px-2 py-1 text-[11px] font-semibold"
                  >
                    Admin Console →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Upgrade / Account Action */}
        {currentUser?.role === 'PUBLIC_VISITOR' ? (
          <button
            onClick={() => navigate('/pricing')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 rounded hover:from-teal-300 hover:to-emerald-300 transition-all shadow-sm whitespace-nowrap"
          >
            <Zap className="w-3 h-3" />
            <span>Upgrade to Pro</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/account')}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded transition-colors whitespace-nowrap"
          >
            Account
          </button>
        )}
      </div>
    </header>
  );
};
