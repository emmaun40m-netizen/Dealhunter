import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Info,
  Wrench,
  Sparkles,
} from "lucide-react";
import { store } from "../../services/store";
import { DebugSessionReport } from "../../types";

interface DebugSessionNotificationPaneProps {
  onOpenConsole?: () => void;
  onOpenCode?: () => void;
}

export default function DebugSessionNotificationPane({
  onOpenConsole,
  onOpenCode,
}: DebugSessionNotificationPaneProps) {
  const [reports, setReports] = useState<DebugSessionReport[]>(() => store.getDebugSessionReports());
  const [isOpen, setIsOpen] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    setReports([...store.getDebugSessionReports()]);

    const unsubscribe = store.subscribeToLiveEvents((event) => {
      if (
        event.type === "DEBUG_REPORT_DISMISSED" ||
        event.type === "DEVELOPER_TRACE" ||
        event.type === "ACTIVITY_STOPPED"
      ) {
        setReports([...store.getDebugSessionReports()]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRunDiagnosticScan = async () => {
    setIsScanning(true);
    try {
      const result = await store.runLiveDebugScan();
      setReports([...result.reports]);
      setIsOpen(true);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDismiss = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    store.dismissDebugReport(id);
    setReports([...store.getDebugSessionReports()]);
  };

  if (reports.length === 0) {
    return (
      <div
        id="debug-session-pane-empty"
        className="bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between font-mono text-xs text-slate-400"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200">LIVE DEBUG AGENT: ALL SYSTEMS NOMINAL</span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">| 0 Unresolved Faults</span>
        </div>
        <button
          type="button"
          onClick={handleRunDiagnosticScan}
          disabled={isScanning}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isScanning ? "animate-spin text-emerald-400" : "text-slate-400"}`} />
          <span>{isScanning ? "Scanning..." : "Run Health Scan"}</span>
        </button>
      </div>
    );
  }

  const autoHealedCount = reports.filter((r) => r.status === "AUTO_HEALED" || r.status === "RESOLVED").length;

  return (
    <div
      id="debug-session-notification-pane"
      className="bg-[#0A0E17] border border-cyan-500/40 rounded-lg overflow-hidden shadow-lg font-mono text-xs transition-all"
    >
      {/* Header Alert Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 uppercase tracking-wider text-[11px]">
                Live Debug Agent Notification Pane
              </span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                {autoHealedCount} AUTO-HEALED
              </span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                {reports.length} ACTIVE SESSIONS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Autonomous runtime diagnostics, self-healing failovers, and statutory compliance patches.
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-run-debug-diagnostic-scan"
            onClick={handleRunDiagnosticScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 rounded font-bold text-[10px] transition disabled:opacity-50"
            title="Perform autonomous diagnostic and self-healing scan"
          >
            <RefreshCw className={`w-3 h-3 ${isScanning ? "animate-spin text-yellow-400" : "text-cyan-400"}`} />
            <span>{isScanning ? "Auditing Pipeline..." : "Run Self-Healing Diagnostic"}</span>
          </button>

          {onOpenConsole && (
            <button
              type="button"
              id="btn-debug-open-live-console"
              onClick={onOpenConsole}
              className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[10px] font-bold transition"
            >
              <Terminal className="w-3 h-3 text-cyan-400" />
              <span>Console</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Session Reports List */}
      {isOpen && (
        <div className="p-3 space-y-2.5 max-h-72 overflow-y-auto bg-[#070A11]">
          {reports.map((report) => {
            const isAutoHealed = report.status === "AUTO_HEALED" || report.status === "RESOLVED";
            const statusBadgeColor =
              report.status === "AUTO_HEALED"
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50"
                : report.status === "RESOLVED"
                ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/50"
                : report.status === "ACTIVE_MONITORING"
                ? "bg-amber-950/80 text-amber-300 border-amber-500/50"
                : "bg-blue-950/80 text-blue-300 border-blue-500/50";

            return (
              <div
                key={report.id}
                className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded p-3 transition space-y-2 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadgeColor}`}>
                      {report.status}
                    </span>
                    <span className="font-bold text-slate-200 text-xs">{report.title}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-500 mr-1">
                      {report.timestamp.slice(11, 19)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDismiss(report.id, e)}
                      className="p-1 text-slate-500 hover:text-slate-300 rounded"
                      title="Dismiss notification"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                  <span className="text-slate-500 uppercase">Target Component:</span>
                  <span className="text-cyan-300 font-semibold">{report.component}</span>
                </div>

                {/* Root Cause & Fix Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-sans">
                  <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                    <span className="text-[9px] uppercase font-mono text-amber-400 font-bold block mb-0.5">
                      Root Cause Diagnosed:
                    </span>
                    <p className="text-slate-300 leading-snug">{report.rootCause}</p>
                  </div>

                  <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/30">
                    <span className="text-[9px] uppercase font-mono text-emerald-400 font-bold block mb-0.5 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                      Autonomous Fix Applied:
                    </span>
                    <p className="text-emerald-200 leading-snug">{report.fixApplied}</p>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="pt-1 text-[11px] font-sans text-slate-400 flex items-center justify-between border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                    <span>{report.actionRecommendation}</span>
                  </div>
                  {onOpenCode && (
                    <button
                      type="button"
                      onClick={onOpenCode}
                      className="text-[10px] font-mono text-cyan-400 hover:underline flex-shrink-0 ml-2"
                    >
                      Inspect in Code Studio →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
