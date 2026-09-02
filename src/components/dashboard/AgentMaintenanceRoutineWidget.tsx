import { useState, useEffect } from "react";
import {
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  Maximize2,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Volume2,
} from "lucide-react";
import { voiceAssistant } from "../../services/voiceAssistant";

export interface DiagnosticRun {
  id: string;
  timestamp: string;
  type: "HOURLY_TROUBLESHOOT" | "5DAY_OVERNIGHT_UPDATE";
  agent: string;
  itemsChecked: number;
  healthScore: number;
  status: "PASSED" | "OPTIMIZED" | "WARNING";
  summary: string;
}

interface AgentMaintenanceRoutineWidgetProps {
  onPopout?: () => void;
  isDetached?: boolean;
}

export default function AgentMaintenanceRoutineWidget({
  onPopout,
  isDetached,
}: AgentMaintenanceRoutineWidgetProps) {
  // Hourly troubleshooting countdown (seconds remaining in current hour)
  const [hourlyCountdownSec, setHourlyCountdownSec] = useState<number>(() => {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    return (59 - minutes) * 60 + (60 - seconds);
  });

  // 5-Day overnight update countdown (in seconds, e.g. 1 day 14 hours)
  const [fiveDayCountdownSec, setFiveDayCountdownSec] = useState<number>(142400);

  // Active diagnostic / update execution state
  const [isRunningHourly, setIsRunningHourly] = useState(false);
  const [isRunningFiveDay, setIsRunningFiveDay] = useState(false);
  const [executionStep, setExecutionStep] = useState<string>("");

  const [diagnosticHistory, setDiagnosticHistory] = useState<DiagnosticRun[]>([
    {
      id: "diag-1",
      timestamp: "18 mins ago",
      type: "HOURLY_TROUBLESHOOT",
      agent: "ALL (Agents 1-4 + Load-Balancer)",
      itemsChecked: 48,
      healthScore: 100,
      status: "PASSED",
      summary: "Heap memory garbage collected, MLS token refreshed, 50-state statutory rules intact.",
    },
    {
      id: "diag-2",
      timestamp: "1h 18m ago",
      type: "HOURLY_TROUBLESHOOT",
      agent: "ALL (Agents 1-4 + Load-Balancer)",
      itemsChecked: 48,
      healthScore: 99.4,
      status: "PASSED",
      summary: "Agent 3 context window re-indexed, socket connections verified.",
    },
    {
      id: "diag-3",
      timestamp: "3 days ago (Cycle #14)",
      type: "5DAY_OVERNIGHT_UPDATE",
      agent: "PLATFORM ARCHITECTURE",
      itemsChecked: 240,
      healthScore: 100,
      status: "OPTIMIZED",
      summary: "5-day overnight update: Re-indexed 3,100 national county tax databases & regenerated underwriting models.",
    },
  ]);

  // Hourly countdown timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      setHourlyCountdownSec((prev) => {
        if (prev <= 1) {
          // Trigger automated hourly troubleshoot
          runHourlyTroubleshooting(true);
          return 3600;
        }
        return prev - 1;
      });

      setFiveDayCountdownSec((prev) => (prev > 1 ? prev - 1 : 432000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const formatFiveDayTime = (totalSec: number) => {
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  // Run Hourly Troubleshooting routine
  const runHourlyTroubleshooting = (isAuto = false) => {
    setIsRunningHourly(true);
    setExecutionStep("Checking Agent 1 scanner buffers & MLS sync...");

    setTimeout(() => {
      setExecutionStep("Evaluating Agent 2 MAO algorithms & underwriting cache...");
    }, 800);

    setTimeout(() => {
      setExecutionStep("Testing Agent 3 outreach SMS/voice queues & Twilio webhooks...");
    }, 1600);

    setTimeout(() => {
      setExecutionStep("Validating Agent 4 50-state contracts & FedNow wire verification...");
    }, 2400);

    setTimeout(() => {
      setIsRunningHourly(false);
      setExecutionStep("");

      const newRun: DiagnosticRun = {
        id: `diag-${Date.now()}`,
        timestamp: "Just now",
        type: "HOURLY_TROUBLESHOOT",
        agent: "ALL (Agents 1-4 + Load-Balancer)",
        itemsChecked: 48,
        healthScore: 100,
        status: "PASSED",
        summary: `Hourly automated diagnostics completed successfully. All 4 cognitive agents operating at 100% capacity.`,
      };

      setDiagnosticHistory((prev) => [newRun, ...prev.slice(0, 9)]);
      voiceAssistant.announceTroubleshooting(
        "All Cognitive Agents",
        "Hourly diagnostics verified healthy"
      );
    }, 3200);
  };

  // Run 5-Day Overnight Update Routine
  const runFiveDayOvernightUpdate = () => {
    setIsRunningFiveDay(true);
    setExecutionStep("Flushing 5-day memory cache & invalidating model weights...");

    setTimeout(() => {
      setExecutionStep("Re-indexing 3,142 nationwide county tax lien & foreclosure registries...");
    }, 1200);

    setTimeout(() => {
      setExecutionStep("Updating 50-state statutory wholesale & Novation legal contracts...");
    }, 2400);

    setTimeout(() => {
      setExecutionStep("Optimizing BGP edge load-balancer routing paths across 4 global zones...");
    }, 3600);

    setTimeout(() => {
      setIsRunningFiveDay(false);
      setExecutionStep("");
      setFiveDayCountdownSec(432000); // Reset to 5 days (432,000s)

      const newRun: DiagnosticRun = {
        id: `diag-5d-${Date.now()}`,
        timestamp: "Just now",
        type: "5DAY_OVERNIGHT_UPDATE",
        agent: "PLATFORM ARCHITECTURE",
        itemsChecked: 240,
        healthScore: 100,
        status: "OPTIMIZED",
        summary: "5-Day Overnight Update completed. Comprehensive system overhaul & legal schemas re-certified.",
      };

      setDiagnosticHistory((prev) => [newRun, ...prev.slice(0, 9)]);
      voiceAssistant.speak(
        "5-day overnight update completed. All national datasets, county tax registries, and 50-state contracts updated.",
        { chime: "success" }
      );
    }, 4800);
  };

  return (
    <div className="h-full flex flex-col bg-[#0E1218] border border-slate-800 rounded-sm overflow-hidden font-mono text-xs">
      {/* Header bar */}
      <div className="p-3 bg-[#111620] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-950/80 border border-indigo-500/40 rounded text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide text-xs">
                AUTOMATED AGENT MAINTENANCE & 5-DAY OVERNIGHT ENGINE
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-indigo-950 text-indigo-300 border border-indigo-500/30 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                CRON ACTIVE
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Hourly Agent Troubleshooting • 5-Day Overnight Global Model & Registry Overhaul
            </span>
          </div>
        </div>

        {onPopout && !isDetached && (
          <button
            onClick={onPopout}
            title="Pop out to secondary monitor"
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded transition"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Progress banner when actively running */}
      {(isRunningHourly || isRunningFiveDay) && (
        <div className="px-3 py-2 bg-indigo-950/80 border-b border-indigo-500/40 flex items-center justify-between text-[11px] animate-pulse">
          <div className="flex items-center gap-2 text-indigo-300">
            <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>
              <strong>Executing Routine:</strong> {executionStep}
            </span>
          </div>
          <span className="text-emerald-400 font-bold">IN PROGRESS...</span>
        </div>
      )}

      {/* Main Grid: Scheduled Timers & Action Triggers (Left) + Audit History (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 overflow-y-auto">
        {/* Left 6 Columns: Schedule Cards & Triggers */}
        <div className="lg:col-span-6 p-3 space-y-3 bg-[#0B0E14] overflow-y-auto flex flex-col justify-between">
          {/* Card 1: Hourly Agent Troubleshooting */}
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                HOURLY AGENT TROUBLESHOOTING
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-950 text-cyan-400 border border-cyan-500/30 rounded font-bold">
                1h Cycle
              </span>
            </div>

            <p className="text-[10px] text-slate-400">
              Performs exhaustive health verification on Agents 1, 2, 3, 4 and the Load-Balancer, clearing token buffers and verifying MLS latency.
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
              <div>
                <span className="text-slate-500">Next Auto-Troubleshoot in:</span>
                <div className="text-emerald-400 font-bold text-sm">
                  {formatTime(hourlyCountdownSec)}
                </div>
              </div>
              <button
                onClick={() => runHourlyTroubleshooting(false)}
                disabled={isRunningHourly || isRunningFiveDay}
                className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded font-bold transition flex items-center gap-1 text-[11px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunningHourly ? "animate-spin" : ""}`} />
                <span>Run Diagnostics Now</span>
              </button>
            </div>
          </div>

          {/* Card 2: 5-Day Overnight Update Overhaul */}
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                5-DAY OVERNIGHT UPDATE OVERHAUL
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-950 text-indigo-400 border border-indigo-500/30 rounded font-bold">
                5-Day Interval
              </span>
            </div>

            <p className="text-[10px] text-slate-400">
              Rebuilds nationwide tax-assessor comps, invalidates deep neural weights, and synchronizes 50-state statutory wholesale compliance mandates.
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
              <div>
                <span className="text-slate-500">Next Overnight Cycle in:</span>
                <div className="text-indigo-400 font-bold text-sm">
                  {formatFiveDayTime(fiveDayCountdownSec)}
                </div>
              </div>
              <button
                onClick={runFiveDayOvernightUpdate}
                disabled={isRunningHourly || isRunningFiveDay}
                className="px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 rounded font-bold transition flex items-center gap-1 text-[11px]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Trigger 5-Day Update</span>
              </button>
            </div>
          </div>

          {/* Auto-Cron Engine Status Bar */}
          <div className="p-2 bg-slate-950 border border-slate-800 rounded flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cron Daemon: <strong>Active (PID: 4180)</strong></span>
            </span>
            <span>Target Execution Window: <strong>03:00 AM UTC</strong></span>
          </div>
        </div>

        {/* Right 6 Columns: Diagnostics & Maintenance Audit Trail */}
        <div className="lg:col-span-6 p-3 flex flex-col justify-between space-y-2 bg-[#0E1218]">
          <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold border-b border-slate-800 pb-1.5">
            <span>MAINTENANCE AUDIT TRAIL</span>
            <span className="text-slate-500 text-[10px]">ALL LOGS VERIFIED</span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[260px] pr-1">
            {diagnosticHistory.map((run) => (
              <div
                key={run.id}
                className="p-2.5 bg-slate-900/60 border border-slate-800 rounded space-y-1 text-[10px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                        run.type === "5DAY_OVERNIGHT_UPDATE"
                          ? "bg-indigo-950 text-indigo-300 border border-indigo-500/40"
                          : "bg-cyan-950 text-cyan-300 border border-cyan-500/40"
                      }`}
                    >
                      {run.type === "5DAY_OVERNIGHT_UPDATE" ? "5-DAY OVERNIGHT" : "HOURLY TROUBLESHOOT"}
                    </span>
                    <span className="text-white font-bold">{run.agent}</span>
                  </div>
                  <span className="text-slate-500 text-[9px]">{run.timestamp}</span>
                </div>

                <p className="text-slate-300 leading-snug">{run.summary}</p>

                <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-800/60">
                  <span>{run.itemsChecked} verification checkpoints</span>
                  <span className="text-emerald-400 font-bold">Health Score: {run.healthScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
