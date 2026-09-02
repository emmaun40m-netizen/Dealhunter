import { X, ShieldCheck } from "lucide-react";

interface CriticalRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CriticalRulesModal({ isOpen, onClose }: CriticalRulesModalProps) {
  if (!isOpen) return null;

  const rules = [
    {
      id: 1,
      title: "Never invent property information",
      description: "Use only verified property data or clearly label estimates with methodology.",
      status: "COMPLIANT",
    },
    {
      id: 2,
      title: "Never invent comparable sales",
      description: "Use only actual sold comps with verified dates, distance, and verified sale prices.",
      status: "COMPLIANT",
    },
    {
      id: 3,
      title: "Separate facts from assumptions",
      description: "Clearly distinguish verified facts, modeled estimates, unknown variables, and identified risks.",
      status: "COMPLIANT",
    },
    {
      id: 4,
      title: "Explicitly labeled estimates",
      description: "Always state the source and estimation logic for repairs, ARV, and holding costs.",
      status: "COMPLIANT",
    },
    {
      id: 5,
      title: "Jurisdiction-appropriate contracts",
      description: "Generate state-specific real estate contracts, wholesale assignments, and non-binding LOIs.",
      status: "COMPLIANT",
    },
    {
      id: 6,
      title: "Respect contact suppression",
      description: "Strict safety gate: Enforces do-not-contact lists, max 3 touches, and 48-hour cooldowns.",
      status: "COMPLIANT",
    },
    {
      id: 7,
      title: "Professional tone enforcement",
      description: "Outreach messages must be direct, credible, and never misleading about buyer capabilities.",
      status: "COMPLIANT",
    },
    {
      id: 8,
      title: "Human approval for consequential actions",
      description: "Binding offers, contract execution, and direct outbound emails route through human sign-off.",
      status: "COMPLIANT",
    },
    {
      id: 9,
      title: "Immutable audit trail",
      description: "Every agent calculation, prompt, response, and action is permanently recorded in the audit event bus.",
      status: "COMPLIANT",
    },
    {
      id: 10,
      title: "Historical profit snapshots",
      description: "Preserves snapshot history across all pipeline stages (Analysis -> Closing) with timestamp & reason.",
      status: "COMPLIANT",
    },
    {
      id: 11,
      title: "Deterministic investor matching",
      description: "Matches deals only to cash buyers whose buy-box states, budget, and minimum yield are met.",
      status: "COMPLIANT",
    },
    {
      id: 12,
      title: "Multi-tenant data isolation",
      description: "Strict separation of portfolios, contact registries, search profiles, and financial parameters.",
      status: "COMPLIANT",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0E1218] border border-slate-800 rounded w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0B0E14]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-light text-white tracking-tight font-sans">
                DealHunter AI — 12 Critical Governance Rules
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                ARCHITECTURAL GOVERNANCE & SAFETY GATES
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Rules Grid */}
        <div className="p-6 overflow-y-auto space-y-3 font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="bg-[#161B22] p-4 rounded border border-slate-800 space-y-1.5 relative border-l-2 border-l-emerald-500"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">
                    RULE {rule.id < 10 ? `0${rule.id}` : rule.id}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 uppercase">
                    {rule.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white font-sans">{rule.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-mono">{rule.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0B0E14] flex justify-end font-mono">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase tracking-wider transition"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
