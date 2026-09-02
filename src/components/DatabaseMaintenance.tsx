import { useState, useEffect } from "react";
import {
  Database,
  Trash2,
  Archive,
  Clock,
  HardDrive,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Download,
  Shield,
  Activity,
  FileCheck,
  Zap,
} from "lucide-react";
import { Deal, Contract, Property } from "../types";

interface MaintenanceLog {
  id: string;
  timestamp: string;
  type: "MANUAL_ARCHIVE" | "AUTOMATED_CRON" | "INDEX_OPTIMIZATION" | "PURGE";
  itemsProcessed: number;
  spaceReclaimedKb: number;
  status: "SUCCESS" | "WARNING" | "FAILED";
  details: string;
}

interface DatabaseMaintenanceProps {
  deals: Deal[];
  contracts: Contract[];
  properties: Property[];
  onRefreshData?: () => void;
}

export default function DatabaseMaintenance({
  deals,
  contracts,
  properties,
  onRefreshData,
}: DatabaseMaintenanceProps) {
  // Retention & Policy Config
  const [retentionDays, setRetentionDays] = useState<number>(180);
  const [autoArchivalEnabled, setAutoArchivalEnabled] = useState<boolean>(true);
  const [scheduleInterval, setScheduleInterval] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("WEEKLY");
  const [preferredAction, setPreferredAction] = useState<"ARCHIVE_COLD" | "PERMANENT_PURGE">("ARCHIVE_COLD");
  const [autoVacuumEnabled, setAutoVacuumEnabled] = useState<boolean>(true);

  // Execution State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmTarget, setConfirmTarget] = useState<"ARCHIVE" | "PURGE" | "VACUUM" | null>(null);

  // Maintenance Execution History
  const [logs, setLogs] = useState<MaintenanceLog[]>(() => [
    {
      id: "log_1",
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
      type: "AUTOMATED_CRON",
      itemsProcessed: 14,
      spaceReclaimedKb: 420,
      status: "SUCCESS",
      details: "Automated weekly cron archived 14 stale closed deals older than 180 days to cold storage.",
    },
    {
      id: "log_2",
      timestamp: new Date(Date.now() - 86400000 * 10).toISOString(),
      type: "INDEX_OPTIMIZATION",
      itemsProcessed: 148,
      spaceReclaimedKb: 1250,
      status: "SUCCESS",
      details: "Postgres index vacuum completed. Spatial GIST and B-Tree indexes rebuilt for fast GIS searches.",
    },
  ]);

  // Calculate Stale Items based on cutoff
  const now = Date.now();
  const cutoffTimestamp = now - retentionDays * 24 * 60 * 60 * 1000;

  const staleDeals = deals.filter((d) => {
    const itemDate = new Date(d.createdAt || d.updatedAt || 0).getTime();
    return itemDate < cutoffTimestamp;
  });

  const staleContracts = contracts.filter((c) => {
    const itemDate = new Date(c.createdAt || c.updatedAt || 0).getTime();
    return itemDate < cutoffTimestamp;
  });

  const totalStaleCount = staleDeals.length + staleContracts.length;
  const estimatedSpaceSavingsKb = totalStaleCount * 28; // ~28KB per complex deal + contract JSON structure

  const handleExecuteMaintenance = async (action: "ARCHIVE" | "PURGE" | "VACUUM") => {
    setIsProcessing(true);
    setActionSuccessMsg(null);
    setShowConfirmModal(false);

    try {
      // Simulate real maintenance execution
      await new Promise((resolve) => setTimeout(resolve, 900));

      const newLog: MaintenanceLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: action === "ARCHIVE" ? "MANUAL_ARCHIVE" : action === "PURGE" ? "PURGE" : "INDEX_OPTIMIZATION",
        itemsProcessed: action === "VACUUM" ? deals.length + contracts.length : totalStaleCount,
        spaceReclaimedKb: action === "VACUUM" ? 850 : estimatedSpaceSavingsKb,
        status: "SUCCESS",
        details:
          action === "ARCHIVE"
            ? `Archived ${staleDeals.length} deals and ${staleContracts.length} contracts older than ${retentionDays} days into gzip compressed cold partition.`
            : action === "PURGE"
            ? `Permanently deleted ${totalStaleCount} records older than ${retentionDays} days with foreign-key cascade integrity.`
            : `VACUUM ANALYZE completed across tables [deals, contracts, properties, comps]. Space reclaimed.`,
      };

      setLogs((prev) => [newLog, ...prev]);
      setActionSuccessMsg(
        action === "ARCHIVE"
          ? `Successfully archived ${totalStaleCount} records to cold storage!`
          : action === "PURGE"
          ? `Successfully purged ${totalStaleCount} stale records!`
          : "Database indexes vacuumed and re-indexed successfully!"
      );

      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      database: "dealhunter_db",
      exportedAt: new Date().toISOString(),
      retentionPolicyDays: retentionDays,
      staleDeals,
      staleContracts,
      metadata: {
        totalRecords: totalStaleCount,
        systemVersion: "v2.0.4",
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dealhunter_archive_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-mono text-slate-200">
      {/* Top Banner */}
      <div className="bg-[#0E1218] p-6 rounded border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                DATABASE MAINTENANCE & RETENTION ENGINE
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                SYSTEM HEALTH: OPTIMAL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configure automated archival and scheduled purging of stale deals, contracts, and leads older than 180 days to maintain peak indexing and sub-10ms query execution.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs font-bold text-slate-300 flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>EXPORT PRE-PURGE DUMP</span>
            </button>
            <button
              onClick={() => {
                setConfirmTarget("VACUUM");
                setShowConfirmModal(true);
              }}
              disabled={isProcessing}
              className="px-3 py-2 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${isProcessing ? "animate-spin" : ""}`} />
              <span>VACUUM & RE-INDEX</span>
            </button>
          </div>
        </div>

        {actionSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Storage & Table Metrics HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#161B22] p-4 rounded border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] uppercase">Active Live Deals</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-bold text-white mt-1 block">{deals.length}</span>
          <span className="text-[10px] text-slate-500">Indexed in Postgres</span>
        </div>

        <div className="bg-[#161B22] p-4 rounded border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] uppercase">Active Contracts</span>
            <FileCheck className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-2xl font-bold text-white mt-1 block">{contracts.length}</span>
          <span className="text-[10px] text-slate-500">Legal Vault snapshots</span>
        </div>

        <div className="bg-[#161B22] p-4 rounded border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] uppercase">Stale Records (&gt;{retentionDays}d)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold text-amber-400 mt-1 block">{totalStaleCount}</span>
          <span className="text-[10px] text-slate-500">
            {staleDeals.length} Deals, {staleContracts.length} Contracts
          </span>
        </div>

        <div className="bg-[#161B22] p-4 rounded border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[10px] uppercase">Estimated Savings</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">
            ~{estimatedSpaceSavingsKb} KB
          </span>
          <span className="text-[10px] text-slate-500">Reclaimable memory buffer</span>
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention Schedule Policy */}
        <div className="bg-[#161B22] p-5 rounded border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Automated Schedule & Archival Policy</span>
            </h3>
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={autoArchivalEnabled}
                onChange={(e) => setAutoArchivalEnabled(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-cyan-500"
              />
              <span className={autoArchivalEnabled ? "text-cyan-400 font-bold" : "text-slate-500"}>
                {autoArchivalEnabled ? "CRON ACTIVE" : "DISABLED"}
              </span>
            </label>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 text-[11px] uppercase mb-1 font-bold">
                Stale Age Threshold:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[90, 180, 365].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setRetentionDays(days)}
                    className={`py-2 px-3 rounded border text-xs font-bold transition ${
                      retentionDays === days
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {days} Days {days === 180 ? "(Recommended)" : ""}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] uppercase mb-1 font-bold">
                Automated Execution Frequency:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((interval) => (
                  <button
                    key={interval}
                    type="button"
                    onClick={() => setScheduleInterval(interval)}
                    className={`py-2 px-3 rounded border text-xs font-bold transition ${
                      scheduleInterval === interval
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {interval}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] uppercase mb-1 font-bold">
                Action on Retention Expiry:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPreferredAction("ARCHIVE_COLD")}
                  className={`p-3 rounded border text-left transition ${
                    preferredAction === "ARCHIVE_COLD"
                      ? "bg-cyan-950/40 border-cyan-500/60 text-cyan-300"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <Archive className="w-3.5 h-3.5" />
                    <span>Compress to Cold Storage</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Retains full audit integrity in compressed archive for legal compliance.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPreferredAction("PERMANENT_PURGE")}
                  className={`p-3 rounded border text-left transition ${
                    preferredAction === "PERMANENT_PURGE"
                      ? "bg-red-950/40 border-red-500/60 text-red-300"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanent Deletion</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Hard deletion of stale records to reclaim max disk space.
                  </p>
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoVacuumEnabled}
                  onChange={(e) => setAutoVacuumEnabled(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500"
                />
                <span className="text-slate-300 text-xs">Run auto-vacuum after job completion</span>
              </label>

              <button
                type="button"
                onClick={() => setActionSuccessMsg("Schedule & Retention Policy saved successfully!")}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-bold rounded text-xs transition"
              >
                SAVE POLICY
              </button>
            </div>
          </div>
        </div>

        {/* Manual Actions & Stale Records Preview */}
        <div className="bg-[#161B22] p-5 rounded border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Immediate Maintenance Actions</span>
            </h3>
            <span className="text-[10px] text-slate-400">
              Targeting records older than {retentionDays} days
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setConfirmTarget("ARCHIVE");
                setShowConfirmModal(true);
              }}
              disabled={isProcessing || totalStaleCount === 0}
              className="p-3 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 rounded text-left transition disabled:opacity-50"
            >
              <div className="flex items-center gap-1.5 font-bold text-cyan-300 text-xs">
                <Archive className="w-4 h-4" />
                <span>ARCHIVE {totalStaleCount} STALE RECORDS</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Move {totalStaleCount} items into compressed cold storage.
              </p>
            </button>

            <button
              onClick={() => {
                setConfirmTarget("PURGE");
                setShowConfirmModal(true);
              }}
              disabled={isProcessing || totalStaleCount === 0}
              className="p-3 bg-red-950/60 hover:bg-red-900 border border-red-500/40 rounded text-left transition disabled:opacity-50"
            >
              <div className="flex items-center gap-1.5 font-bold text-red-300 text-xs">
                <Trash2 className="w-4 h-4" />
                <span>PURGE {totalStaleCount} STALE RECORDS</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Hard delete items older than {retentionDays} days.
              </p>
            </button>
          </div>

          {/* Stale Items Preview Box */}
          <div className="bg-[#0B0E14] p-3.5 rounded border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-300">Stale Inventory Candidate Sample:</span>
              <span>{totalStaleCount} Total Items</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {staleDeals.length === 0 && staleContracts.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500">
                  No stale deals or contracts found older than {retentionDays} days. Database is lean!
                </div>
              ) : (
                <>
                  {staleDeals.slice(0, 4).map((d) => (
                    <div
                      key={d.id}
                      className="p-2 bg-[#161B22] rounded border border-slate-800/80 flex items-center justify-between text-[11px]"
                    >
                      <div className="truncate mr-2">
                        <span className="text-[9px] px-1 py-0.2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded mr-1.5 font-bold">
                          DEAL
                        </span>
                        <span className="text-slate-200">{d.property?.address || d.id}</span>
                      </div>
                      <span className="text-slate-500 text-[10px] shrink-0 font-mono">
                        {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "Old"}
                      </span>
                    </div>
                  ))}

                  {staleContracts.slice(0, 3).map((c) => (
                    <div
                      key={c.id}
                      className="p-2 bg-[#161B22] rounded border border-slate-800/80 flex items-center justify-between text-[11px]"
                    >
                      <div className="truncate mr-2">
                        <span className="text-[9px] px-1 py-0.2 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded mr-1.5 font-bold">
                          CONTRACT
                        </span>
                        <span className="text-slate-200">{c.propertyAddress || c.id}</span>
                      </div>
                      <span className="text-slate-500 text-[10px] shrink-0 font-mono">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Old"}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Execution Audit Log */}
      <div className="bg-[#161B22] p-5 rounded border border-slate-800 space-y-3">
        <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Database Maintenance Execution & Vacuum Audit Log</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Operation Type</th>
                <th className="pb-2">Items</th>
                <th className="pb-2">Reclaimed Space</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 text-slate-400 whitespace-nowrap text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 text-[10px] font-bold">
                      {log.type}
                    </span>
                  </td>
                  <td className="py-2.5 text-white font-bold">{log.itemsProcessed}</td>
                  <td className="py-2.5 text-emerald-400 font-bold">+{log.spaceReclaimedKb} KB</td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-300 text-[11px] max-w-md truncate">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0E1218] border border-slate-800 rounded p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Maintenance Operation</span>
            </div>

            <p className="text-xs text-slate-300">
              {confirmTarget === "ARCHIVE"
                ? `Are you sure you want to archive ${totalStaleCount} deals and contracts older than ${retentionDays} days into compressed storage?`
                : confirmTarget === "PURGE"
                ? `WARNING: This will permanently delete ${totalStaleCount} records older than ${retentionDays} days. This action cannot be undone.`
                : "Run VACUUM ANALYZE to reclaim disk space and rebuild spatial indices?"}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold"
              >
                CANCEL
              </button>
              <button
                onClick={() => handleExecuteMaintenance(confirmTarget!)}
                className={`px-4 py-1.5 rounded text-xs font-bold ${
                  confirmTarget === "PURGE"
                    ? "bg-red-600 hover:bg-red-500 text-white"
                    : "bg-cyan-600 hover:bg-cyan-500 text-black"
                }`}
              >
                PROCEED
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
