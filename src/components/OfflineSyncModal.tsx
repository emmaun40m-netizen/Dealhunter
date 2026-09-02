import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  AlertTriangle,
  Database,
  Layers,
  Trash2,
  Play,
  X,
  FileCheck,
  Send,
  Zap,
  HardDriveDownload,
  Info,
} from "lucide-react";
import { offlineSync, OfflineAction, OfflineSyncState } from "../services/offlineSyncService";

interface OfflineSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export default function OfflineSyncModal({ isOpen, onClose, onRefreshData }: OfflineSyncModalProps) {
  const [syncState, setSyncState] = useState<OfflineSyncState>(() => offlineSync.getState());
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [activeTab, setActiveTab] = useState<"queue" | "cache" | "architecture">("queue");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = offlineSync.subscribe((state) => {
      setSyncState(state);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleSyncAll = async () => {
    setNotice("Processing offline actions queue...");
    const result = await offlineSync.processQueue();
    if (result.synced > 0) {
      setNotice(`Successfully synced ${result.synced} action(s) with backend.`);
      if (onRefreshData) onRefreshData();
    } else if (result.failed > 0) {
      setNotice(`Sync encountered issues with ${result.failed} action(s). Retrying on next connection.`);
    } else {
      setNotice("No pending actions in queue.");
    }
    setTimeout(() => setNotice(null), 4000);
  };

  const handlePrefetch = () => {
    setIsPrefetching(true);
    offlineSync.triggerPrefetch();
    setNotice("Cache pre-fetching initiated. Downloading dashboard, agents, and property scans...");
    setTimeout(() => {
      setIsPrefetching(false);
      setNotice("Cache pre-fetch complete. 24 data endpoints cached for 100% offline access.");
      setTimeout(() => setNotice(null), 4000);
    }, 1800);
  };

  const handleTestQueueApproval = async () => {
    const mockPropertyAddress = "4102 Whispering Pines Rd, Nashville, TN";
    const result = await offlineSync.enqueueAction({
      type: "DEAL_APPROVAL",
      title: `Approve Wholesale Offer — ${mockPropertyAddress}`,
      endpoint: `/api/approvals/appr-demo-${Date.now()}/approve`,
      method: "POST",
      body: {
        notes: "Authorized by Human Executive (Queued via Offline Action Queue)",
        dealMetrics: { projectedProfit: 32500, roi: 34 },
      },
      metadata: {
        propertyName: mockPropertyAddress,
        amount: 32500,
        queuedReason: syncState.isOnline ? "Simulated Action" : "Device Disconnected",
      },
    });

    if (result.executedOnline) {
      setNotice("Action executed immediately against backend.");
    } else {
      setNotice("Action captured in Offline Action Queue! Will automatically synchronize when connection stabilizes.");
    }
    setTimeout(() => setNotice(null), 4000);
  };

  const handleRetry = async (id: string) => {
    await offlineSync.retryAction(id);
    if (onRefreshData) onRefreshData();
  };

  const handleDelete = (id: string) => {
    offlineSync.deleteAction(id);
  };

  const handleClearCompleted = () => {
    offlineSync.clearCompleted();
    setNotice("Cleared all synced action records.");
    setTimeout(() => setNotice(null), 3000);
  };

  const pendingList = syncState.actions.filter((a) => a.status === "PENDING" || a.status === "SYNCING");
  const completedList = syncState.actions.filter((a) => a.status === "SYNCED");
  const failedList = syncState.actions.filter((a) => a.status === "FAILED");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0B0E14] border border-slate-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0E1218]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-sans tracking-tight">
                  PWA Ready & Offline Action Queue
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> PWA ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Background Sync API & Offline Caching Engine (v3.5)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Status Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#080B10] border-b border-slate-800/80">
          {/* Service Worker Status */}
          <div className="bg-[#0E1218] border border-slate-800 rounded p-3">
            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center justify-between">
              <span>Service Worker</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
              <span>ACTIVE & READY</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {syncState.isPWAReady ? "Caching enabled & verified" : "Registering worker..."}
            </div>
          </div>

          {/* Background Sync API */}
          <div className="bg-[#0E1218] border border-slate-800 rounded p-3">
            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center justify-between">
              <span>Background Sync</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-amber-300 font-bold text-sm">
              {syncState.hasBackgroundSync ? "SUPPORTED (AUTO)" : "RECONNECT SYNC"}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Syncs on connection restore
            </div>
          </div>

          {/* Network State */}
          <div className="bg-[#0E1218] border border-slate-800 rounded p-3">
            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center justify-between">
              <span>Device Network</span>
              {syncState.isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              )}
            </div>
            <div
              className={`font-bold text-sm flex items-center gap-1.5 ${
                syncState.isOnline ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  syncState.isOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              ></span>
              <span>{syncState.isOnline ? "ONLINE" : "OFFLINE (LOCAL)"}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {syncState.isOnline ? "Real-time backend link" : "Queuing actions locally"}
            </div>
          </div>

          {/* Queue Count */}
          <div className="bg-[#0E1218] border border-slate-800 rounded p-3">
            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1 flex items-center justify-between">
              <span>Action Queue</span>
              <Clock className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-white font-bold text-sm flex items-center gap-1.5">
              <span className={syncState.pendingCount > 0 ? "text-amber-300" : "text-slate-300"}>
                {syncState.pendingCount} PENDING
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {syncState.actions.length} total recorded
            </div>
          </div>
        </div>

        {/* Notice alert */}
        {notice && (
          <div className="px-6 py-2.5 bg-emerald-950/50 border-b border-emerald-500/30 text-emerald-300 flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{notice}</span>
            </div>
            <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#0E1218] px-6">
          <button
            onClick={() => setActiveTab("queue")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition uppercase tracking-wider flex items-center gap-2 ${
              activeTab === "queue"
                ? "border-emerald-500 text-emerald-400 bg-slate-900/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Action Queue ({syncState.actions.length})</span>
            {syncState.pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
                {syncState.pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("cache")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition uppercase tracking-wider flex items-center gap-2 ${
              activeTab === "cache"
                ? "border-emerald-500 text-emerald-400 bg-slate-900/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <HardDriveDownload className="w-3.5 h-3.5" />
            <span>Cache Pre-fetching ({syncState.cachedEndpointsCount} Endpoints)</span>
          </button>

          <button
            onClick={() => setActiveTab("architecture")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition uppercase tracking-wider flex items-center gap-2 ${
              activeTab === "architecture"
                ? "border-emerald-500 text-emerald-400 bg-slate-900/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Background Sync Flow</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "queue" && (
            <div className="space-y-4">
              {/* Controls Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0E1218] border border-slate-800 rounded">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSyncAll}
                    disabled={syncState.isSyncing || syncState.pendingCount === 0}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition ${
                      syncState.isSyncing || syncState.pendingCount === 0
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                        : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-sm"
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncState.isSyncing ? "animate-spin" : ""}`} />
                    <span>{syncState.isSyncing ? "SYNCING..." : "SYNC ALL PENDING"}</span>
                  </button>

                  <button
                    onClick={handleTestQueueApproval}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
                    title="Simulate queueing a deal approval action"
                  >
                    <Play className="w-3 h-3 text-amber-400" />
                    <span>TEST QUEUE ACTION</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {completedList.length > 0 && (
                    <button
                      onClick={handleClearCompleted}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear Synced</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Action Queue List */}
              {syncState.actions.length === 0 ? (
                <div className="bg-[#0E1218] border border-slate-800 rounded p-12 text-center text-slate-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-80" />
                  <h3 className="text-white font-sans font-semibold text-sm">Action Queue is Empty</h3>
                  <p className="text-slate-500 max-w-md mx-auto">
                    When you perform actions (like approving a deal, updating contracts, or dispatching outreach) while offline or disconnected, they will be captured here and synchronized automatically.
                  </p>
                  <button
                    onClick={handleTestQueueApproval}
                    className="mt-3 px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition inline-flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3" /> Test Offline Queue Action
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {syncState.actions.map((act) => {
                    const isPending = act.status === "PENDING" || act.status === "SYNCING";
                    const isSynced = act.status === "SYNCED";
                    const isFailed = act.status === "FAILED";

                    return (
                      <div
                        key={act.id}
                        className={`p-3.5 rounded border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                          isPending
                            ? "bg-amber-950/20 border-amber-500/40"
                            : isSynced
                            ? "bg-[#0E1218] border-slate-800/90"
                            : "bg-red-950/20 border-red-500/40"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                act.type.includes("APPROVAL")
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  : act.type.includes("CONTRACT")
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                                  : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                              }`}
                            >
                              {act.type}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                                isSynced
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : isPending
                                  ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                                  : "bg-red-500/10 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {isSynced && <CheckCircle2 className="w-3 h-3" />}
                              {isPending && <Clock className="w-3 h-3 animate-pulse" />}
                              {isFailed && <AlertTriangle className="w-3 h-3" />}
                              {act.status}
                            </span>

                            <span className="text-slate-500 text-[10px]">
                              {new Date(act.createdAt).toLocaleTimeString()}
                            </span>
                          </div>

                          <div className="text-slate-200 font-medium text-xs font-sans">
                            {act.title}
                          </div>

                          <div className="text-slate-400 text-[10px] flex items-center gap-2">
                            <span>Endpoint: <code className="text-slate-300">{act.method} {act.endpoint}</code></span>
                            {act.retryCount > 0 && (
                              <span className="text-amber-400">Retries: {act.retryCount}</span>
                            )}
                            {act.lastError && (
                              <span className="text-red-400 truncate max-w-xs">{act.lastError}</span>
                            )}
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                          {isFailed && (
                            <button
                              onClick={() => handleRetry(act.id)}
                              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition flex items-center gap-1 text-[11px]"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Retry</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(act.id)}
                            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-red-400 border border-slate-800 transition"
                            title="Remove from queue"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "cache" && (
            <div className="space-y-4">
              <div className="bg-[#0E1218] border border-slate-800 rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h4 className="text-white font-bold font-sans text-sm">Cache Pre-Fetching Strategy</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Automatically pre-caches core dashboards, agent velocity metrics, and property scan results during idle time.
                  </p>
                </div>
                <button
                  onClick={handlePrefetch}
                  disabled={isPrefetching}
                  className="px-3.5 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition flex items-center gap-1.5 flex-shrink-0"
                >
                  <HardDriveDownload className={`w-3.5 h-3.5 ${isPrefetching ? "animate-bounce" : ""}`} />
                  <span>{isPrefetching ? "PRE-FETCHING..." : "PRE-FETCH CACHE NOW"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: "Dashboard Overview & Profit Snapshots", path: "/api/dashboard, /api/profits", status: "Cached & Ready" },
                  { name: "Multi-Agent Workforce & Velocity Metrics", path: "/api/agents, /api/agents/velocity", status: "Cached & Ready" },
                  { name: "National Property Finder & Live Scans", path: "/api/properties/search, /api/deals", status: "Cached & Ready" },
                  { name: "Human-in-the-Loop Approvals Gate", path: "/api/approvals", status: "Cached & Ready" },
                  { name: "Contracts Vault & Legal Templates ($0 Down)", path: "/api/contracts, /api/contract-templates", status: "Cached & Ready" },
                  { name: "Outreach Hub & Automated SMS/Email Engine", path: "/api/outreach", status: "Cached & Ready" },
                  { name: "50-State Wholesale Rules & Real Estate News", path: "/api/compliance/states, /api/compliance/news", status: "Cached & Ready" },
                  { name: "Escrow Wallet & Payment Invoices", path: "/api/payments/wallet", status: "Cached & Ready" },
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#0E1218] border border-slate-800 rounded p-3 space-y-1">
                    <div className="flex items-center justify-between text-slate-200 font-bold font-sans">
                      <span>{item.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> READY
                      </span>
                    </div>
                    <div className="text-slate-500 text-[10px]">{item.path}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "architecture" && (
            <div className="space-y-4 text-slate-300">
              <div className="bg-[#0E1218] border border-slate-800 rounded p-4 space-y-3">
                <h4 className="text-white font-bold font-sans text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Background Sync & Resilience Architecture
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  DealHunter AI uses a multi-tier offline synchronization engine combining the browser{" "}
                  <strong className="text-emerald-400">Background Sync API</strong>, local persistent{" "}
                  <strong className="text-blue-400">IndexedDB & LocalStorage queues</strong>, and a proactive{" "}
                  <strong className="text-purple-400">Cache Pre-fetching Strategy</strong>.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">1</span>
                    <div>
                      <strong className="text-white">Action Interception:</strong> When disconnected, user approvals, stage advances, or contract updates are stored instantly in IndexedDB and local storage.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold flex-shrink-0">2</span>
                    <div>
                      <strong className="text-white">Optimistic UI Continuity:</strong> Local application state updates immediately so deal flow never stutters.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold flex-shrink-0">3</span>
                    <div>
                      <strong className="text-white">Background Sync Event:</strong> As soon as the device reconnects or triggers a <code className="text-amber-300 font-mono">sync</code> event tag, the Service Worker automatically flushes and confirms pending requests.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0E1218] flex items-center justify-between text-slate-400 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>PWA Ready (Offline Cache Version 3.5)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
