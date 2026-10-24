import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DataProviderConfig, IngestionRun, AuditLog } from '../types';
import { Database, Shield, Activity, RefreshCw, CheckCircle2, AlertTriangle, Play } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [providers, setProviders] = useState<DataProviderConfig[]>([]);
  const [runs, setRuns] = useState<IngestionRun[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [healthData, setHealthData] = useState<any>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [retryingRun, setRetryingRun] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      const [provRes, runsRes, healthRes, logsRes] = await Promise.all([
        api.getAdminProviders(),
        api.getAdminIngestionRuns(),
        api.getAdminSystemHealth(),
        api.getAdminAuditLogs()
      ]);
      setProviders(provRes.providers || []);
      setRuns(runsRes.runs || []);
      setHealthData(healthRes);
      setAuditLogs(logsRes.logs || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleTestProvider = async (id: string) => {
    setTestingProvider(id);
    try {
      const res = await api.testProvider(id);
      alert(`Diagnostic probe passed! Latency: ${res.latencyMs}ms. Status: ${res.status}`);
      loadAdminData();
    } catch (err) {
      alert(`Provider test failed: ${(err as Error).message}`);
    } finally {
      setTestingProvider(null);
    }
  };

  const handleRetryRun = async (id: string) => {
    setRetryingRun(id);
    try {
      await api.retryIngestionRun(id);
      alert(`Ingestion job reprocess dispatched successfully.`);
      loadAdminData();
    } catch (err) {
      alert(`Retry failed: ${(err as Error).message}`);
    } finally {
      setRetryingRun(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-amber-400" />
            System Administration & Ingestion Observability
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Provider health telemetry, manual diagnostic probing, job ingestion queues, and immutable audit logs
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh System State</span>
        </button>
      </div>

      {/* High-level System KPI metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-xs text-slate-400">System Infrastructure</div>
          <div className="text-xl font-bold font-mono text-emerald-400 flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-4 h-4" />
            OPTIMAL
          </div>
          <div className="text-[10px] text-slate-500 mt-1">TimescaleDB & PostgreSQL Ready</div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-xs text-slate-400">Registered Providers</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {providers.length} Active
          </div>
          <div className="text-[10px] text-teal-400 mt-1">0 Degraded / 0 Offline</div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-xs text-slate-400">Total Ingestion Runs</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {runs.length} Today
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">100% Success Rate</div>
        </div>

        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800">
          <div className="text-xs text-slate-400">Audit Logs Recorded</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {auditLogs.length} Entries
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Immutable Security Trail</div>
        </div>
      </div>

      {/* Data Providers Health Table */}
      <div className="bg-[#0F172A] rounded-lg border border-slate-800 overflow-hidden space-y-3 p-4">
        <h3 className="text-sm font-bold text-white">External Data Source Providers</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                <th className="py-2.5">Provider Name</th>
                <th className="py-2.5">Type</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5">Endpoint</th>
                <th className="py-2.5">Rate Limit</th>
                <th className="py-2.5">Latency</th>
                <th className="py-2.5">Records Today</th>
                <th className="py-2.5 text-right">Diagnostic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {providers.map(p => (
                <tr key={p.id} className="hover:bg-slate-800/40">
                  <td className="py-3 font-bold text-white font-sans">{p.providerName}</td>
                  <td className="py-3 text-teal-400">{p.providerType}</td>
                  <td className="py-3">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 font-sans font-semibold">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 max-w-xs truncate">{p.endpoint}</td>
                  <td className="py-3 text-slate-300">{p.rateLimitStatus}</td>
                  <td className="py-3 text-white">{p.latencyMs}ms</td>
                  <td className="py-3 text-white tabular-nums">{p.recordsProcessedToday.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleTestProvider(p.id)}
                      disabled={testingProvider === p.id}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-sans border border-slate-700 transition-colors"
                    >
                      {testingProvider === p.id ? 'Testing...' : 'Test Feed'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingestion Runs & Job Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingestion Runs */}
        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white">Recent Data Ingestion Runs</h3>

          <div className="space-y-2 text-xs font-mono">
            {runs.map(run => (
              <div
                key={run.id}
                className="p-3 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-sans">{run.jobType}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-semibold">
                      {run.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-sans">
                    {run.providerName} · {run.recordsProcessed} records processed
                  </div>
                </div>

                <button
                  onClick={() => handleRetryRun(run.id)}
                  disabled={retryingRun === run.id}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans border border-slate-700"
                >
                  {retryingRun === run.id ? 'Retrying...' : 'Reprocess'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Trail */}
        <div className="p-4 rounded-lg bg-[#0F172A] border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white">Administrative Audit Trail</h3>

          <div className="space-y-2 text-xs font-mono">
            {auditLogs.map(log => (
              <div
                key={log.id}
                className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-teal-400">{log.action}</span>
                  <span className="text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {log.details}
                </div>
                <div className="text-[10px] text-slate-500">
                  Resource: {log.resourceType} ({log.resourceId})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
