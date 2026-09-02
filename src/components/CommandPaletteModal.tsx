import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Command,
  LayoutDashboard,
  MapPin,
  GitPullRequest,
  ShieldCheck,
  FileText,
  DollarSign,
  Users,
  Wallet,
  Calendar,
  Monitor,
  Code2,
  Settings,
  Sparkles,
  Zap,
  Download,
  FileBarChart2,
  BrainCircuit,
  Volume2,
  ArrowRight,
  CornerDownLeft,
  X,
} from "lucide-react";
import { AgentPersona } from "../types";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onOpenReportModal: () => void;
  onExportVaultSnapshot: () => void;
  onOpenConfigModal: () => void;
  onOpenVoiceModal: () => void;
  onTriggerDiagnosticSweep?: () => void;
  currentPersona?: AgentPersona;
  onSelectPersona?: (persona: AgentPersona) => void;
}

interface PaletteAction {
  id: string;
  title: string;
  subtitle: string;
  category: "NAVIGATION" | "ACTIONS" | "PERSONA" | "REPORTS";
  icon: React.ReactNode;
  shortcut?: string;
  badge?: string;
  action: () => void;
}

export default function CommandPaletteModal({
  isOpen,
  onClose,
  activeTab,
  onNavigateTab,
  onOpenReportModal,
  onExportVaultSnapshot,
  onOpenConfigModal,
  onOpenVoiceModal,
  onTriggerDiagnosticSweep,
  currentPersona,
  onSelectPersona,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const allActions: PaletteAction[] = [
    // Navigation items
    {
      id: "nav-dashboard",
      title: "Dashboard Overview",
      subtitle: "Autonomous executive metrics, KPI sparklines, and live agent feeds",
      category: "NAVIGATION",
      icon: <LayoutDashboard className="w-4 h-4 text-emerald-400" />,
      shortcut: "G D",
      action: () => {
        onNavigateTab("dashboard");
        onClose();
      },
    },
    {
      id: "nav-properties",
      title: "National Property Finder & Live Map",
      subtitle: "Filter 500k+ listings, land parcels, and interactive Google Map pins",
      category: "NAVIGATION",
      icon: <MapPin className="w-4 h-4 text-blue-400" />,
      shortcut: "G P",
      action: () => {
        onNavigateTab("properties");
        onClose();
      },
    },
    {
      id: "nav-pipeline",
      title: "Deal Pipeline & Kanban",
      subtitle: "Manage deal stages from Discovery to Closing and Escrow",
      category: "NAVIGATION",
      icon: <GitPullRequest className="w-4 h-4 text-purple-400" />,
      shortcut: "G L",
      action: () => {
        onNavigateTab("pipeline");
        onClose();
      },
    },
    {
      id: "nav-approvals",
      title: "Human-in-the-Loop Approval Queue",
      subtitle: "Bulk authorize outreach emails, offer submissions, and contracts",
      category: "NAVIGATION",
      icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
      shortcut: "G A",
      badge: "Safety Gate",
      action: () => {
        onNavigateTab("approvals");
        onClose();
      },
    },
    {
      id: "nav-closer",
      title: "Agent 4 — Desktop Underwriter & Closer",
      subtitle: "Title commitments, RON e-closing, and escrow settlement statements",
      category: "NAVIGATION",
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      shortcut: "G C",
      action: () => {
        onNavigateTab("closer");
        onClose();
      },
    },
    {
      id: "nav-contracts",
      title: "Contracts & Templates Vault",
      subtitle: "Legal agreements, multi-lingual dispatch, and daily encrypted snapshots",
      category: "NAVIGATION",
      icon: <FileText className="w-4 h-4 text-rose-400" />,
      shortcut: "G V",
      action: () => {
        onNavigateTab("contracts");
        onClose();
      },
    },
    {
      id: "nav-profits",
      title: "Realized Profits & Analytics",
      subtitle: "Cashflow accounting, assignment fee ledger, and performance ROI",
      category: "NAVIGATION",
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
      shortcut: "G R",
      action: () => {
        onNavigateTab("profits");
        onClose();
      },
    },
    {
      id: "nav-investors",
      title: "Cash Buyers & Investor Matcher",
      subtitle: "Target buy-boxes, institutional land funds, and spec builders",
      category: "NAVIGATION",
      icon: <Users className="w-4 h-4 text-indigo-400" />,
      shortcut: "G I",
      action: () => {
        onNavigateTab("investors");
        onClose();
      },
    },
    {
      id: "nav-payment",
      title: "Cashout & Escrow Portal",
      subtitle: "Wallet balance, bank wire transfers, and escrow disbursements",
      category: "NAVIGATION",
      icon: <Wallet className="w-4 h-4 text-yellow-400" />,
      shortcut: "G W",
      action: () => {
        onNavigateTab("payment_portal");
        onClose();
      },
    },
    {
      id: "nav-digest",
      title: "Daily Intelligence Digest",
      subtitle: "Morning executive briefing with voice audio announcer",
      category: "NAVIGATION",
      icon: <Calendar className="w-4 h-4 text-amber-300" />,
      shortcut: "G B",
      action: () => {
        onNavigateTab("daily_digest");
        onClose();
      },
    },
    {
      id: "nav-multimonitor",
      title: "Multi-Monitor Control Deck",
      subtitle: "Detached HUD viewports, broadcast sync, and multi-display telemetry",
      category: "NAVIGATION",
      icon: <Monitor className="w-4 h-4 text-sky-400" />,
      shortcut: "G M",
      action: () => {
        onNavigateTab("multi_monitor");
        onClose();
      },
    },
    {
      id: "nav-code",
      title: "Live Code Editor Studio (3/4 Screen)",
      subtitle: "Real-time AST debugger, variable deltas, and live agent code execution",
      category: "NAVIGATION",
      icon: <Code2 className="w-4 h-4 text-teal-400" />,
      shortcut: "G E",
      action: () => {
        onNavigateTab("code");
        onClose();
      },
    },

    // Rapid Actions
    {
      id: "act-report",
      title: "Generate Agent Performance Report",
      subtitle: "Synthesize weekly agent velocity, MAO accuracy, and profit report into PDF/text",
      category: "REPORTS",
      icon: <FileBarChart2 className="w-4 h-4 text-emerald-400" />,
      shortcut: "Shift+R",
      badge: "Executive",
      action: () => {
        onClose();
        onOpenReportModal();
      },
    },
    {
      id: "act-snapshot",
      title: "Export Contracts Vault Snapshot (JSON)",
      subtitle: "Create secure encrypted archive of all agreements and dispatches",
      category: "ACTIONS",
      icon: <Download className="w-4 h-4 text-blue-400" />,
      shortcut: "Shift+S",
      badge: "Backup",
      action: () => {
        onExportVaultSnapshot();
        onClose();
      },
    },
    {
      id: "act-voice",
      title: "Open Voice Assistant & Announcer",
      subtitle: "Listen to deal summaries and execute voice commands",
      category: "ACTIONS",
      icon: <Volume2 className="w-4 h-4 text-purple-400" />,
      action: () => {
        onClose();
        onOpenVoiceModal();
      },
    },
    {
      id: "act-diagnostic",
      title: "Run Autonomous Diagnostic Sweep",
      subtitle: "Verify agent state, memory heap, and safety gate latency",
      category: "ACTIONS",
      icon: <BrainCircuit className="w-4 h-4 text-amber-400" />,
      action: () => {
        if (onTriggerDiagnosticSweep) onTriggerDiagnosticSweep();
        onClose();
      },
    },
    {
      id: "act-config",
      title: "Open System Configuration & Persona",
      subtitle: "Adjust minimum ROI, daily outreach limit, and agent negotiation tone",
      category: "ACTIONS",
      icon: <Settings className="w-4 h-4 text-slate-300" />,
      shortcut: ",",
      action: () => {
        onClose();
        onOpenConfigModal();
      },
    },

    // Agent Personas
    {
      id: "persona-aggressive",
      title: "Switch to: Aggressive Cash Investor Persona",
      subtitle: "High-conviction, non-contingent cash offers with rapid 7-10 day close",
      category: "PERSONA",
      icon: <Zap className="w-4 h-4 text-rose-400" />,
      badge: currentPersona === "AGGRESSIVE_INVESTOR" ? "ACTIVE" : undefined,
      action: () => {
        if (onSelectPersona) onSelectPersona("AGGRESSIVE_INVESTOR");
        onClose();
      },
    },
    {
      id: "persona-analytical",
      title: "Switch to: Analytical Underwriter Persona",
      subtitle: "Granular repair itemization, comps analysis, and data-driven offer rationale",
      category: "PERSONA",
      icon: <BrainCircuit className="w-4 h-4 text-blue-400" />,
      badge: currentPersona === "ANALYTICAL_UNDERWRITER" ? "ACTIVE" : undefined,
      action: () => {
        if (onSelectPersona) onSelectPersona("ANALYTICAL_UNDERWRITER");
        onClose();
      },
    },
    {
      id: "persona-diplomatic",
      title: "Switch to: Diplomatic Negotiator Persona",
      subtitle: "Collaborative, relationship-first tone protecting listing broker commissions",
      category: "PERSONA",
      icon: <Users className="w-4 h-4 text-emerald-400" />,
      badge: currentPersona === "DIPLOMATIC_NEGOTIATOR" ? "ACTIVE" : undefined,
      action: () => {
        if (onSelectPersona) onSelectPersona("DIPLOMATIC_NEGOTIATOR");
        onClose();
      },
    },
    {
      id: "persona-direct",
      title: "Switch to: Direct Problem Solver Persona",
      subtitle: "Empathetic, straightforward as-is cash exit for distressed situations",
      category: "PERSONA",
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      badge: currentPersona === "DIRECT_PROBLEM_SOLVER" ? "ACTIVE" : undefined,
      action: () => {
        if (onSelectPersona) onSelectPersona("DIRECT_PROBLEM_SOLVER");
        onClose();
      },
    },
    {
      id: "persona-wholesale",
      title: "Switch to: Wholesale Speedster Persona",
      subtitle: "Rapid 5-to-7 day closing speed with immediate investor assignment",
      category: "PERSONA",
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      badge: currentPersona === "WHOLESALE_SPEEDSTER" ? "ACTIVE" : undefined,
      action: () => {
        if (onSelectPersona) onSelectPersona("WHOLESALE_SPEEDSTER");
        onClose();
      },
    },
  ];

  // Filter actions based on query
  const filteredActions = allActions.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.shortcut && item.shortcut.toLowerCase().includes(q))
    );
  });

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredActions.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % Math.max(1, filteredActions.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // Group filtered actions by category
  const categories = ["NAVIGATION", "REPORTS", "ACTIONS", "PERSONA"] as const;

  if (!isOpen) return null;

  return (
    <div
      id="command-palette-backdrop"
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="command-palette-modal"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            id="command-palette-search-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, search tabs, deals, personas, or reports..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base outline-none font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-slate-500 hover:text-slate-300 text-xs px-1.5 py-0.5 rounded bg-slate-800"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          id="command-palette-results"
          className="overflow-y-auto p-2 divide-y divide-slate-800/50 max-h-[60vh] custom-scrollbar"
        >
          {filteredActions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Command className="w-10 h-10 text-slate-600 mx-auto mb-3 stroke-[1.5]" />
              <p className="text-sm font-medium text-slate-300">No matching commands found</p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for "Map", "Report", "Persona", "Approval", "Snapshot", or "Contracts"
              </p>
            </div>
          ) : (
            categories.map((cat) => {
              const catActions = filteredActions.filter((a) => a.category === cat);
              if (catActions.length === 0) return null;

              return (
                <div key={cat} className="py-1.5">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    {cat === "NAVIGATION" && "Quick Tab Navigation"}
                    {cat === "REPORTS" && "Performance & Analytics Reports"}
                    {cat === "ACTIONS" && "Autonomous Operations & Utilities"}
                    {cat === "PERSONA" && "Agent Outreach Personas"}
                  </div>
                  <div className="space-y-0.5 mt-0.5">
                    {catActions.map((item) => {
                      const itemGlobalIndex = filteredActions.indexOf(item);
                      const isSelected = itemGlobalIndex === selectedIndex;

                      return (
                        <div
                          key={item.id}
                          id={`palette-action-${item.id}`}
                          onClick={() => item.action()}
                          onMouseEnter={() => setSelectedIndex(itemGlobalIndex)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? "bg-emerald-950/70 text-emerald-200 border border-emerald-500/40 shadow-sm"
                              : "text-slate-300 hover:bg-slate-800/60"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div
                              className={`p-2 rounded-lg shrink-0 ${
                                isSelected ? "bg-emerald-900/50 text-emerald-300" : "bg-slate-800/80 text-slate-400"
                              }`}
                            >
                              {item.icon}
                            </div>
                            <div className="truncate">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold truncate text-slate-100">{item.title}</span>
                                {item.badge && (
                                  <span
                                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                                      item.badge === "ACTIVE"
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                        : "bg-slate-800 text-slate-400 border border-slate-700"
                                    }`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.shortcut && (
                              <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                                {item.shortcut}
                              </kbd>
                            )}
                            {isSelected && (
                              <CornerDownLeft className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>DealHunter Swarm Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
