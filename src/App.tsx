import React, { useEffect, useState } from 'react';
import { api } from './services/api';
import { User, UserRole } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { SathukaBackgroundAnimation } from './components/SathukaBackgroundAnimation';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MarketsPage } from './pages/MarketsPage';
import { MarketDetailPage } from './pages/MarketDetailPage';
import { ETFFlowsPage } from './pages/ETFFlowsPage';
import { LiquidityPage } from './pages/LiquidityPage';
import { DerivativesPage } from './pages/DerivativesPage';
import { SignalsPage } from './pages/SignalsPage';
import { SignalDetailPage } from './pages/SignalDetailPage';
import { NewsPage } from './pages/NewsPage';
import { BacktestingPage } from './pages/BacktestingPage';
import { WatchlistsPage } from './pages/WatchlistsPage';
import { PricingPage } from './pages/PricingPage';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname === '/' ? '/dashboard' : window.location.pathname;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const fetchUser = () => {
    api.getAccount()
      .then(res => setCurrentUser(res.user))
      .catch(console.error);
  };

  useEffect(() => {
    fetchUser();

    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentRoute(path);
    window.scrollTo(0, 0);
  };

  const handleRoleSwitch = async (role: UserRole, planId?: string) => {
    try {
      const res = await api.switchRoleOrUser({ role, planId });
      setCurrentUser(res.user);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // Route Dispatcher
  const renderRoute = () => {
    if (currentRoute === '/') {
      return <LandingPage navigate={navigate} />;
    }
    if (currentRoute === '/dashboard') {
      return <DashboardPage navigate={navigate} />;
    }
    if (currentRoute === '/markets') {
      return <MarketsPage navigate={navigate} />;
    }
    if (currentRoute.startsWith('/markets/')) {
      const symbol = currentRoute.replace('/markets/', '');
      return <MarketDetailPage symbol={symbol} navigate={navigate} />;
    }
    if (currentRoute === '/etf-flows') {
      return <ETFFlowsPage />;
    }
    if (currentRoute === '/liquidity') {
      return <LiquidityPage />;
    }
    if (currentRoute === '/derivatives') {
      return <DerivativesPage />;
    }
    if (currentRoute === '/signals') {
      return <SignalsPage navigate={navigate} />;
    }
    if (currentRoute.startsWith('/signals/')) {
      const signalId = currentRoute.replace('/signals/', '');
      return <SignalDetailPage signalId={signalId} navigate={navigate} />;
    }
    if (currentRoute === '/news') {
      return <NewsPage />;
    }
    if (currentRoute === '/backtesting') {
      return <BacktestingPage />;
    }
    if (currentRoute === '/watchlists') {
      return <WatchlistsPage navigate={navigate} />;
    }
    if (currentRoute === '/pricing') {
      return <PricingPage navigate={navigate} onUpgradeSuccess={fetchUser} />;
    }
    if (currentRoute === '/account') {
      return <AccountPage currentUser={currentUser} onUserUpdate={fetchUser} navigate={navigate} />;
    }
    if (currentRoute === '/admin') {
      return <AdminPage />;
    }

    // Default to Dashboard
    return <DashboardPage navigate={navigate} />;
  };

  const isLanding = currentRoute === '/';

  return (
    <div className="min-h-screen bg-[#070A11]/90 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200 relative">
      {/* Sathuka Logo Ambient Floating Orbital Background Animation */}
      <SathukaBackgroundAnimation />

      {/* 3-Zone Header */}
      <Header
        currentRoute={currentRoute}
        navigate={navigate}
        currentUser={currentUser}
        onRoleSwitch={handleRoleSwitch}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex">
        {/* Sidebar on desktop (except on public landing page) */}
        {!isLanding && (
          <Sidebar
            currentRoute={currentRoute}
            navigate={navigate}
            currentUser={currentUser}
          />
        )}

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-x-hidden min-w-0">
          {renderRoute()}
        </main>
      </div>

      {/* Footer */}
      <Footer navigate={navigate} />
    </div>
  );
}
