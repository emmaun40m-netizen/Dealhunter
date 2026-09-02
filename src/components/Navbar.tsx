import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Zap,
  Sliders,
  Volume2,
  VolumeX,
  Download,
  Terminal,
  CheckCircle2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { AgentStatusInfo, DashboardMetrics } from "../types";
import { voiceAssistant } from "../services/voiceAssistant";
import { offlineSync, OfflineSyncState } from "../services/offlineSyncService";
import OfflineSyncModal from "./OfflineSyncModal";

interface NavbarProps {
  metrics: DashboardMetrics | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenRulesModal: () => void;
  onOpenConfigModal: () => void;
  onOpenVoiceModal?: () => void;
  onOpenDownloadModal?: () => void;
  onRefreshData?: () => void;
}

export default function Navbar({
  metrics,
  activeTab,
  setActiveTab,
  onOpenRulesModal,
  onOpenConfigModal,
  onOpenVoiceModal,
  onOpenDownloadModal,
  onRefreshData,
}: NavbarProps) {
  const [, setAgents] = useState<Record<string, AgentStatusInfo>>({});
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => voiceAssistant.getSettings().enabled);
  const [syncState, setSyncState] = useState<OfflineSyncState>(() => offlineSync.getState());
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineSync.subscribe((state) => {
      setSyncState(state);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.agents) {
          setAgents(data.agents);
        }
      })
      .catch(console.error);
  }, []);

  const navItems = [
    { id: "dashboard", label: "DASHBOARD" },
    { id: "agents", label: "AGENT_WORKFORCE" },
    { id: "closer", label: "AGENT4_CLOSER" },
    { id: "templates", label: "CONTRACT_TEMPLATES" },
    { id: "payments", label: "PAYMENT_PORTAL" },
    { id: "chat", label: "LIVE_AI_CHAT" },
    { id: "properties", label: "NATIONAL_FINDER" },
    { id: "approvals", label: "APPROVAL_GATE" },
    { id: "outreach", label: "OUTREACH_HUB" },
    { id: "investors", label: "INVESTOR_MATCH" },
    { id: "contracts", label: "CONTRACTS_VAULT" },
    { id: "profits", label: "PROFIT_SNAPSHOTS" },
    { id: "code", label: "SCRIPT_ENGINE" },
    { id: "db_maintenance", label: "DB_MAINTENANCE" },
  ];

  const dailyCount = metrics?.dailyOutreachCount ?? 2;
  const dailyLimit = metrics?.dailyOutreachLimit ?? 10;

  return (
    <header className="sticky top-0 z-40 bg-[#0B0E14] border-b border-slate-800 text-slate-200">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={() => setActiveTab("dashboard")}
          >
            <div className="w-8 h-8 bg-emerald-500 rounded-sm flex items-center justify-center text-black font-extrabold font-mono text-base shadow-sm">
              D
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white font-sans">
                  DEALHUNTER{" "}
                  <span className="text-emerald-500 underline decoration-2 underline-offset-4">
                    AI
                  </span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                  v2.0.4
                </span>
              </div>
            </div>
          </div>

          {/* Active Agents Status / Live Indicator */}
          <div className="hidden md:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-emerald-500/30 rounded">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-400 font-bold uppercase tracking-widest text-[11px]">
                LIVE_SEARCH: ACTIVE
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>A1:SCAN</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>A2:ANALYST</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span>A3:OUTREACH</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span className="text-amber-300 font-semibold">A4:CLOSER</span>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Persistent PWA Ready Indicator */}
            <button
              onClick={() => setIsOfflineModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold rounded border transition ${
                syncState.isOnline
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50 hover:border-emerald-400 shadow-sm"
                  : "bg-amber-950/50 text-amber-300 border-amber-500/40 hover:bg-amber-900/50"
              }`}
              title={
                syncState.isPWAReady
                  ? `PWA Ready: Service Worker Active & Caching Enabled (${syncState.isOnline ? "Online" : "Offline Mode"})`
                  : "PWA Service Worker Initializing..."
              }
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="uppercase text-[11px] tracking-wider font-extrabold flex items-center gap-1">
                <span>PWA Ready</span>
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  syncState.isOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
                title={syncState.isOnline ? "Connected" : "Offline Local Cache"}
              />
              {syncState.pendingCount > 0 && (
                <span
                  className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-black animate-pulse"
                  title={`${syncState.pendingCount} actions queued for sync`}
                >
                  {syncState.pendingCount}
                </span>
              )}
            </button>

            {/* Daily Outreach Gauge */}
            <div
              className="hidden sm:flex items-center gap-2 bg-[#0E1218] border border-slate-800 px-3 py-1.5 rounded text-xs font-mono cursor-pointer hover:border-slate-700 transition"
              onClick={() => setActiveTab("outreach")}
              title="Daily Outreach Rate Limiter (Section 13)"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 text-[11px]">CAP:</span>
              <span className="font-bold text-amber-300">
                {dailyCount}/{dailyLimit}
              </span>
            </div>

            {/* Audio Voice Announcer Trigger */}
            <button
              onClick={onOpenVoiceModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium rounded border transition ${
                isVoiceEnabled
                  ? "bg-slate-900 text-emerald-300 border-emerald-500/40 hover:bg-slate-800"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
              title="AI Voice Announcer & Audio Settings"
            >
              {isVoiceEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className="hidden sm:inline uppercase text-[11px] tracking-wider">AI Voice</span>
            </button>

            {/* Cross-Platform App Download & PWA Install Button */}
            <button
              onClick={onOpenDownloadModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded shadow-sm transition animate-pulse hover:animate-none"
              title="Download & Install DealHunter AI on iOS, Android, Windows, Mac & Linux"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="uppercase text-[11px] tracking-wider font-extrabold">Install App</span>
            </button>

            {/* Config Trigger */}
            <button
              onClick={onOpenConfigModal}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-medium text-slate-300 bg-[#0E1218] hover:bg-slate-800 rounded border border-slate-800 transition"
              title="Configure Search & Risk Model Parameters"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline uppercase text-[11px] tracking-wider">Settings</span>
            </button>

            {/* Critical Rules Audit Button */}
            <button
              onClick={onOpenRulesModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60 rounded border border-emerald-500/40 transition"
              title="12 Critical AI Rules Compliance Audit"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline uppercase text-[11px] tracking-wider">12 Rules</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar with Geometric Monospace Tab Links */}
      <div className="border-t border-slate-800/80 bg-[#0E1218]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-1.5 scrollbar-none text-xs font-mono">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded transition-all uppercase tracking-wider text-[11px] ${
                    isActive
                      ? "bg-slate-800 text-white font-bold border-l-2 border-emerald-500 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Offline Action Queue & PWA Sync Modal */}
      <OfflineSyncModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        onRefreshData={onRefreshData}
      />
    </header>
  );
}
