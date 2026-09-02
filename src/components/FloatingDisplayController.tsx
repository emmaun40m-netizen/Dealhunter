import { useState, useEffect } from "react";
import {
  Monitor,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sliders,
  Radio,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  Zap,
  CheckCircle2,
  Shield,
  Layers,
  ArrowRightLeft,
  X,
} from "lucide-react";
import {
  multiMonitorSync,
  MonitorDisplay,
  GridPreset,
} from "../services/multiMonitorSync";

interface FloatingDisplayControllerProps {
  currentPreset: GridPreset;
  onSelectPreset: (preset: GridPreset) => void;
  onPopoutWidget: (widgetId: string, title: string, display?: MonitorDisplay) => void;
  detachedWidgets: string[];
  onRecallAll: () => void;
  onRecallWidget: (widgetId: string) => void;
}

export default function FloatingDisplayController({
  currentPreset,
  onSelectPreset,
  onPopoutWidget,
  detachedWidgets,
  onRecallAll,
  onRecallWidget,
}: FloatingDisplayControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [monitors, setMonitors] = useState<MonitorDisplay[]>([]);
  const [syncStatus, setSyncStatus] = useState<"ACTIVE" | "IDLE">("ACTIVE");
  const [lastSyncTime, setLastSyncTime] = useState<string>("Just now");

  useEffect(() => {
    // Detect hardware monitors
    multiMonitorSync.getConnectedMonitors().then((res) => {
      setMonitors(res);
    });

    const unsub = multiMonitorSync.subscribe((msg) => {
      setSyncStatus("ACTIVE");
      setLastSyncTime(new Date().toLocaleTimeString());
    });

    return () => unsub();
  }, []);

  const handleRefreshDisplays = async () => {
    const res = await multiMonitorSync.getConnectedMonitors();
    setMonitors(res);
  };

  const availableWidgets = [
    { id: "daily_briefing", title: "Daily Executive Rundown & Action Tasks (AI Voice)" },
    { id: "global_traffic", title: "Global Traffic Map & Load-Balancing Agent" },
    { id: "sla_monitor", title: "SLA Compliance & Response Monitor (15s Target)" },
    { id: "maintenance_routine", title: "Automated Maintenance & 5-Day Overnight Engine" },
    { id: "graphs", title: "Financial Yield & ARV Matrix" },
    { id: "live_feeds", title: "Live Telemetry & Auction Stream" },
    { id: "live_code", title: "Deal Algorithm & V8 Script Engine" },
    { id: "deals_spotlight", title: "Autonomous Underwriting Spotlight" },
    { id: "deals_matrix", title: "Underwritten Deals Matrix" },
    { id: "payment_portal", title: "Title Escrow & ACH Payment Portal" },
    { id: "closer_studio", title: "Desktop Virtual Closer (Agent 4)" },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 font-mono text-xs">
      {/* Expanded Control HUD Modal / Drawer */}
      {isOpen && (
        <div className="mb-2 w-80 sm:w-96 bg-[#0E1218] border border-slate-700 rounded-sm shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="p-3 bg-[#111620] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-emerald-950 border border-emerald-500/40 rounded text-emerald-400">
                <Monitor className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">MULTI-MONITOR DISPLAY CONTROLLER</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>host_multi_monitor_sync_v2</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 space-y-3.5 max-h-[420px] overflow-y-auto">
            {/* Section 1: Detected Physical / Extended Screens */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-300 font-bold">
                <span className="flex items-center gap-1">
                  <Monitor className="w-3 h-3 text-blue-400" />
                  <span>DETECTED HARDWARE DISPLAYS ({monitors.length})</span>
                </span>
                <button
                  onClick={handleRefreshDisplays}
                  className="text-slate-400 hover:text-slate-200 flex items-center gap-0.5 text-[9px]"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Query API</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {monitors.map((mon) => (
                  <div
                    key={mon.id}
                    className="p-2 bg-slate-900/80 rounded border border-slate-800 flex items-center justify-between text-[10px]"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{mon.label}</span>
                        {mon.isPrimary && (
                          <span className="px-1 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded text-[9px]">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-[9px]">
                        Resolution: {mon.width} x {mon.height} @ {mon.colorDepth}bit | Scale: {mon.pixelRatio}x
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Workspace Layout Presets */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-slate-300 font-bold flex items-center gap-1">
                <LayoutGrid className="w-3 h-3 text-emerald-400" />
                <span>WORKSPACE GRID PRESETS</span>
              </div>
              <div className="grid grid-cols-5 gap-1 text-[10px]">
                {(["1x1", "1x2", "1x3", "2x2", "2x3"] as GridPreset[]).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => onSelectPreset(preset)}
                    className={`py-1.5 px-1 rounded border font-bold text-center transition ${
                      currentPreset === preset
                        ? "bg-emerald-950 text-emerald-300 border-emerald-500"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Push Component to External Window */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-300 font-bold">
                <span className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3 text-indigo-400" />
                  <span>PUSH PORTAL TO SECONDARY SCREEN</span>
                </span>
              </div>

              <div className="space-y-1">
                {availableWidgets.map((w) => {
                  const isDetached = detachedWidgets.includes(w.id);
                  return (
                    <div
                      key={w.id}
                      className="p-1.5 bg-slate-900/60 rounded border border-slate-800 flex items-center justify-between text-[10px]"
                    >
                      <span className="text-slate-300 truncate max-w-[170px]">{w.title}</span>
                      {isDetached ? (
                        <button
                          onClick={() => onRecallWidget(w.id)}
                          className="px-2 py-0.5 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-500/40 rounded text-[9px] font-bold"
                        >
                          Return
                        </button>
                      ) : (
                        <button
                          onClick={() => onPopoutWidget(w.id, w.title, monitors[1] || monitors[0])}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded text-[9px] flex items-center gap-1 font-bold"
                        >
                          <span>Pop Out</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Detached Windows Summary & Recall All */}
            {detachedWidgets.length > 0 && (
              <div className="p-2 bg-amber-950/40 border border-amber-500/30 rounded space-y-1.5 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-amber-300 font-bold">
                    {detachedWidgets.length} Window{detachedWidgets.length > 1 ? "s" : ""} on Secondary Screen
                  </span>
                  <button
                    onClick={onRecallAll}
                    className="px-2 py-0.5 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded text-[9px]"
                  >
                    Recall All
                  </button>
                </div>
                <div className="text-slate-400 text-[9px]">
                  Closing any secondary window automatically returns it here.
                </div>
              </div>
            )}
          </div>

          {/* Footer Status */}
          <div className="p-2 bg-[#111620] border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-500">
            <span>BroadcastChannel: ONLINE</span>
            <span>Sync: {lastSyncTime}</span>
          </div>
        </div>
      )}

      {/* Floating Toggle Button (Always visible on bottom-right) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded shadow-xl font-mono text-xs font-bold transition hover:border-emerald-500 group"
      >
        <div className="relative">
          <Monitor className="w-4 h-4 text-emerald-400" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
        </div>
        <span>DISPLAY CONTROLLER</span>
        {detachedWidgets.length > 0 && (
          <span className="px-1.5 py-0.2 bg-amber-500 text-black rounded-full text-[10px] font-extrabold">
            {detachedWidgets.length}
          </span>
        )}
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
