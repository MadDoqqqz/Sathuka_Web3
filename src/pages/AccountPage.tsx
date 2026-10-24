import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, Plan, UserRole } from '../types';
import { Shield, Settings, Key, Bell, CreditCard, CheckCircle2 } from 'lucide-react';

interface AccountPageProps {
  currentUser: User | null;
  onUserUpdate: () => void;
  navigate: (route: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ currentUser, onUserUpdate, navigate }) => {
  const [user, setUser] = useState<User | null>(currentUser);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [telegramAlerts, setTelegramAlerts] = useState(false);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [apiKeyGenerated, setApiKeyGenerated] = useState(false);

  useEffect(() => {
    api.getAccount().then(res => {
      setUser(res.user);
      setPlan(res.plan);
      setProfiles(res.availableTestProfiles || []);
    }).catch(console.error);
  }, []);

  const handleSwitchUser = async (targetUserId: string) => {
    try {
      const res = await api.switchRoleOrUser({ switchUserId: targetUserId });
      setUser(res.user);
      onUserUpdate();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleRoleChange = async (role: UserRole) => {
    try {
      const planId = role === 'ADMINISTRATOR' ? 'plan-premium' : role === 'PREMIUM_MEMBER' ? 'plan-pro' : 'plan-free';
      const res = await api.switchRoleOrUser({ role, planId });
      setUser(res.user);
      onUserUpdate();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-teal-400" />
          Account & Entitlements Management
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          User authorization profile, subscription credentials, API keys, and notification channels
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-5 rounded-lg bg-[#0F172A] border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 font-bold text-lg">
              {user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'CP'}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{user?.displayName || 'Quantitative User'}</h2>
              <div className="text-xs text-slate-400 font-mono">{user?.email || 'user@cryptopulse.io'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Current Role:</span>
            <span className={`px-2.5 py-1 rounded font-bold ${
              user?.role === 'ADMINISTRATOR' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
              user?.role === 'PREMIUM_MEMBER' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40' :
              'bg-slate-800 text-slate-300'
            }`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Subscription Plan details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Active Plan</span>
            <span className="text-white font-bold text-sm">{plan?.name || 'Pro'}</span>
          </div>

          <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Billing Status</span>
            <span className="text-emerald-400 font-bold text-sm">{user?.subscriptionStatus || 'ACTIVE'}</span>
          </div>

          <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Member Since</span>
            <span className="text-slate-300 font-bold text-sm">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026-01-01'}
            </span>
          </div>
        </div>
      </div>

      {/* Role & Session Switcher */}
      <div className="p-5 rounded-lg bg-[#0F172A] border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-400" />
            Instant Sandbox Role Switcher
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Switch your active profile to test Public Visitor, Premium Member, and Administrator entitlements
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => handleSwitchUser(p.id)}
              className={`p-3 rounded-lg border text-left transition-all ${
                user?.id === p.id
                  ? 'bg-slate-800/80 border-teal-500 text-white shadow-md'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{p.displayName}</span>
                {user?.id === p.id && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
              </div>
              <div className="text-[11px] font-mono text-teal-400 mt-1">{p.role}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{p.email}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="p-5 rounded-lg bg-[#0F172A] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-400" />
          Alert Dispatch Preferences
        </h3>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded bg-slate-900 border border-slate-800 cursor-pointer">
            <div>
              <div className="text-white font-medium">In-App Terminal Notifications</div>
              <div className="text-[11px] text-slate-400">Immediate signal alerts and CEX spread warnings</div>
            </div>
            <input
              type="checkbox"
              checked={inAppAlerts}
              onChange={e => setInAppAlerts(e.target.checked)}
              className="accent-teal-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded bg-slate-900 border border-slate-800 cursor-pointer">
            <div>
              <div className="text-white font-medium">Email Dispatch Summary</div>
              <div className="text-[11px] text-slate-400">Daily US Spot ETF creation digest and high-confidence signals</div>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={e => setEmailAlerts(e.target.checked)}
              className="accent-teal-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded bg-slate-900 border border-slate-800 cursor-pointer">
            <div>
              <div className="text-white font-medium">Telegram Webhook Channel</div>
              <div className="text-[11px] text-slate-400">Real-time bot execution triggers for Telegram groups</div>
            </div>
            <input
              type="checkbox"
              checked={telegramAlerts}
              onChange={e => setTelegramAlerts(e.target.checked)}
              className="accent-teal-500 w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* Developer API Keys */}
      <div className="p-5 rounded-lg bg-[#0F172A] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-teal-400" />
              Direct REST API Access Keys
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Authenticate programmatic requests to <code>/api/v1/signals</code> and <code>/api/v1/liquidity</code>
            </p>
          </div>

          <button
            onClick={() => setApiKeyGenerated(true)}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold border border-slate-700"
          >
            {apiKeyGenerated ? 'Rotate API Key' : 'Generate API Key'}
          </button>
        </div>

        {apiKeyGenerated ? (
          <div className="p-3 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-teal-400 flex items-center justify-between">
            <span>cp_live_sec_8f92a10b47e2c9184d0932</span>
            <span className="text-[10px] text-slate-500 uppercase">Read-Only Market Access</span>
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-mono">
            No API key provisioned for this account. Click Generate above.
          </div>
        )}
      </div>
    </div>
  );
};
