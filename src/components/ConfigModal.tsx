import React, { useState } from "react";
import { X, Sliders, Zap, BrainCircuit, Users, Sparkles, Shield } from "lucide-react";
import { AppConfig, AgentPersona } from "../types";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (newConfig: AppConfig) => Promise<void>;
}

export default function ConfigModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}: ConfigModalProps) {
  if (!isOpen) return null;

  const [form, setForm] = useState<AppConfig>({
    ...config,
    agentPersona: config.agentPersona || "AGGRESSIVE_INVESTOR",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveConfig(form);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0E1218] border border-slate-800 rounded w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0B0E14]">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white font-sans uppercase tracking-wider">
              Platform & Agent Workforce Config
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-mono">
          {/* Executive Contact Settings */}
          <div className="bg-[#0B0E14] border border-emerald-500/30 rounded p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                Primary Executive Point of Contact
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                ACTIVE
              </span>
            </div>

            <div>
              <label className="block text-slate-400 text-[10px] uppercase mb-1">
                Main Contact Email (Digests, Approvals & Title Escrow):
              </label>
              <input
                type="email"
                value={form.mainContactEmail || "emmaun40m@gmail.com"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    mainContactEmail: e.target.value,
                    adminEmail: e.target.value,
                  })
                }
                className="w-full bg-[#121620] border border-slate-700 rounded p-2 text-emerald-300 font-mono font-semibold"
                placeholder="emmaun40m@gmail.com"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Designated recipient for all autonomous deal alerts, buyer matches, and escrow disbursements.
              </span>
            </div>
          </div>

          {/* Agent Persona Selection (Outreach & Negotiation Tone) */}
          <div className="bg-[#0B0E14] border border-purple-500/30 rounded p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-purple-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5" />
                Agent Persona & Outreach Voice
              </span>
              <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-500/40 font-bold">
                {form.agentPersona?.replace("_", " ") || "AGGRESSIVE INVESTOR"}
              </span>
            </div>

            <label className="block text-slate-400 text-[10px] uppercase mb-1">
              Select Negotiation & Proposal Tone for Autonomous Outreach:
            </label>
            <select
              id="select-agent-persona"
              value={form.agentPersona || "AGGRESSIVE_INVESTOR"}
              onChange={(e) =>
                setForm({
                  ...form,
                  agentPersona: e.target.value as AgentPersona,
                })
              }
              className="w-full bg-[#121620] border border-slate-700 rounded p-2 text-purple-200 font-mono font-medium outline-none"
            >
              <option value="AGGRESSIVE_INVESTOR">Aggressive Investor — Fast cash, certainty of close, 7-10 day settlement</option>
              <option value="ANALYTICAL_UNDERWRITER">Analytical Underwriter — Data-driven, comps-based, repair risk itemization</option>
              <option value="DIPLOMATIC_NEGOTIATOR">Diplomatic Negotiator — Relationship-first, collaborative, broker commission protection</option>
              <option value="DIRECT_PROBLEM_SOLVER">Direct Problem Solver — Empathetic, simple as-is buyout for distressed owners</option>
              <option value="WHOLESALE_SPEEDSTER">Wholesale Speedster — Rapid 5-7 day closing speed, instant buyer dispatch</option>
            </select>

            <div className="grid grid-cols-1 gap-1.5 pt-1">
              {form.agentPersona === "AGGRESSIVE_INVESTOR" && (
                <div className="p-2 rounded bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-300">
                  <span className="font-bold block text-purple-200">Aggressive Cash Buyer Style:</span>
                  Highlights guaranteed non-contingent cash execution, $0 seller repairs, verified proof of funds, and rapid 7-10 day closing.
                </div>
              )}
              {form.agentPersona === "ANALYTICAL_UNDERWRITER" && (
                <div className="p-2 rounded bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-300">
                  <span className="font-bold block text-blue-200">Analytical Underwriter Style:</span>
                  Articulates submarket price-per-sqft comps, line-item renovation buffers, and objective financial rationale.
                </div>
              )}
              {form.agentPersona === "DIPLOMATIC_NEGOTIATOR" && (
                <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300">
                  <span className="font-bold block text-emerald-200">Diplomatic Negotiator Style:</span>
                  Fosters rapport with listing agents, guarantees commission protection, and offers flexible seller move-out schedules.
                </div>
              )}
              {form.agentPersona === "DIRECT_PROBLEM_SOLVER" && (
                <div className="p-2 rounded bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300">
                  <span className="font-bold block text-amber-200">Direct Problem Solver Style:</span>
                  Zero-jargon, empathetic approach for heirs and fatigued landlords wanting a simple, clean exit without inspection hassles.
                </div>
              )}
              {form.agentPersona === "WHOLESALE_SPEEDSTER" && (
                <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-300">
                  <span className="font-bold block text-cyan-200">Wholesale Speedster Style:</span>
                  Emphasizes lightning turnaround speed, 24-hour earnest money deposits, and rapid closing pipelines.
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] uppercase mb-1">
              Daily Outreach Send Limit (Section 13 Cap):
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={form.dailyOutreachLimit}
              onChange={(e) =>
                setForm({ ...form, dailyOutreachLimit: Number(e.target.value) })
              }
              className="w-full bg-[#0B0E14] border border-slate-800 rounded p-2 text-white font-mono"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Default is 10/day to prevent spam suppression and protect domain reputation.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-[10px] uppercase mb-1">
                Min Projected Profit ($):
              </label>
              <input
                type="number"
                step={1000}
                value={form.minProfit}
                onChange={(e) =>
                  setForm({ ...form, minProfit: Number(e.target.value) })
                }
                className="w-full bg-[#0B0E14] border border-slate-800 rounded p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] uppercase mb-1">
                Min Projected ROI (%):
              </label>
              <input
                type="number"
                value={form.minROI}
                onChange={(e) =>
                  setForm({ ...form, minROI: Number(e.target.value) })
                }
                className="w-full bg-[#0B0E14] border border-slate-800 rounded p-2 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] uppercase mb-1">
              Default National Max Asking Price ($):
            </label>
            <input
              type="number"
              step={5000}
              value={form.defaultMaxPrice}
              onChange={(e) =>
                setForm({ ...form, defaultMaxPrice: Number(e.target.value) })
              }
              className="w-full bg-[#0B0E14] border border-slate-800 rounded p-2 text-white font-mono"
            />
          </div>

          {/* Developer Trace Mode & Diagnostics */}
          <div className="bg-[#0B0E14] border border-cyan-500/40 rounded p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Developer Trace & Code Flow Logging
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                {form.developerTraceEnabled !== false ? "ENABLED" : "DISABLED"}
              </span>
            </div>

            <label className="flex items-start space-x-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                id="checkbox-developer-trace-enabled"
                checked={form.developerTraceEnabled !== false}
                onChange={(e) =>
                  setForm({ ...form, developerTraceEnabled: e.target.checked })
                }
                className="accent-cyan-500 rounded mt-0.5"
              />
              <div className="text-[11px] font-sans">
                <span className="font-bold text-slate-100 block">
                  Enable Developer Trace Mode (UI Console Wrapper)
                </span>
                <span className="text-slate-400 text-[10px] leading-relaxed block mt-0.5">
                  Injects real-time console wrappers and telemetry around BuyerScoutAgent, Underwriting MAO, Investor Matcher, and Virtual Closer to stream raw AST payloads, execution timing, and query traces directly to the Live Console and Code Studio.
                </span>
              </div>
            </label>

            {form.developerTraceEnabled !== false && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-slate-400 text-[10px]">TRACE VERBOSITY:</span>
                <select
                  value={form.developerTraceVerbosity || "FULL_AST_TRACE"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      developerTraceVerbosity: e.target.value as any,
                    })
                  }
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="FULL_AST_TRACE">FULL_AST_TRACE (All AST & Payloads)</option>
                  <option value="AGENT_PAYLOADS_ONLY">AGENT_PAYLOADS_ONLY (Inputs / Outputs)</option>
                  <option value="PERFORMANCE_BENCHMARKS">PERFORMANCE_BENCHMARKS (Timing Delta Only)</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="flex items-center space-x-2 text-slate-300">
              <input
                type="checkbox"
                checked={form.humanApprovalRequired}
                onChange={(e) =>
                  setForm({ ...form, humanApprovalRequired: e.target.checked })
                }
                className="accent-emerald-500 rounded"
              />
              <span className="text-xs">Require Human Sign-off for Outbound Actions (Rule 8)</span>
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#161B22] text-slate-400 hover:text-white rounded text-xs font-bold uppercase tracking-wider border border-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase tracking-wider"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
