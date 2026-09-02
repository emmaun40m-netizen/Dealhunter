import { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Play,
  Pause,
  Trash2,
  Download,
  Filter,
  Search,
  Zap,
  Code,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Sliders,
  Handshake,
  ExternalLink,
} from "lucide-react";
import { store } from "../../services/store";
import { DeveloperTraceEntry } from "../../types";

interface LiveConsoleWidgetProps {
  onOpenCodeEditor?: () => void;
  onOpenConfig?: () => void;
}

export default function LiveConsoleWidget({ onOpenCodeEditor, onOpenConfig }: LiveConsoleWidgetProps) {
  const [logs, setLogs] = useState<DeveloperTraceEntry[]>(() => store.getDeveloperTraces());
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch
    setLogs([...store.getDeveloperTraces()]);

    const unsubscribe = store.subscribeToLiveEvents((event) => {
      if (event.type === "DEVELOPER_TRACE" && !isPaused) {
        setLogs([...store.getDeveloperTraces()]);
      } else if (event.type === "DEVELOPER_TRACE_CLEARED") {
        setLogs([]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isPaused]);

  useEffect(() => {
    if (autoScroll && consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const handleClearLogs = () => {
    store.clearDeveloperTraces();
    setLogs([]);
  };

  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dealhunter-dev-traces-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleTestAgentTrace = async () => {
    setIsSimulating(true);
    const traceTypes = [
      {
        source: "BuyerScoutAgent" as const,
        action: "wholesaler_ready_buyer_discovered",
        message: "Identified wholesaler-friendly cash buyer: Cody Rasmussen (Desert Ridge Construction LLC) - Source: https://www.biggerpockets.com/forums/wholesale-buyers-az",
        inputPayload: {
          county: "Maricopa County",
          state: "AZ",
          query: "cash buyers seeking wholesale contract assignments",
          candidateModels: ["gemini-2.5-flash", "gemini-3.7-flash"],
        },
        outputPayload: {
          name: "Cody Rasmussen",
          company: "Desert Ridge Construction LLC",
          source_url: "https://www.biggerpockets.com/forums/wholesale-buyers-az",
          targetMarkets: ["Phoenix, AZ", "Scottsdale, AZ", "Maricopa County, AZ"],
          wholesaleTags: ["Wholesaler-Ready", "Assignment Friendly", "High Priority Lead"],
          feeRange: "$15,000 - $40,000",
          notes: "Active homebuilder actively seeking wholesale deal assignments on BiggerPockets and local investor forums.",
        },
        astNode: "BuyerScoutAgent.onWholesalerReadyMatch",
        codeRef: "src/services/store.ts:2320",
      },
      {
        source: "BuyerScoutAgent" as const,
        action: "wholesale_buyer_grounded_sweep",
        message: "Dispatched grounded live search query: 'cash buyers that work with wholesalers Travis County TX'",
        inputPayload: {
          county: "Travis County",
          state: "TX",
          query: "cash buyers that work with wholesalers",
          candidateModels: ["gemini-2.5-flash", "gemini-3.7-flash"],
        },
        outputPayload: {
          name: "Austin Infill Partners LLC",
          company: "Austin Infill Partners LLC",
          source_url: "https://www.mylandbaron.com/buyers/travis-tx",
          discoveredBuyers: [
            { name: "Austin Infill Partners", company: "Austin Infill Partners LLC", buyBox: "0.25-2 Acre infill lots" },
            { name: "Hill Country Capital", company: "Hill Country Capital LLC", buyBox: "5-50 Acres raw land" },
          ],
          confidenceScore: 98,
        },
        astNode: "BuyerScoutAgent.runSearchSession(params)",
        codeRef: "src/services/buyerScoutAgent.ts:295",
      },
      {
        source: "UnderwritingMAO" as const,
        action: "compute_mao_formula",
        message: "Evaluated 70% Wholesale MAO: ($185,000 ARV * 0.70) - $22,000 Repairs - $15,000 Minimum Fee = $92,500 MAO.",
        inputPayload: { arv: 185000, repairEst: 22000, targetWholesaleFee: 15000 },
        outputPayload: { maxAllowableOffer: 92500, roiPercent: 32.5, recommendation: "DISPATCH_OFFER" },
        astNode: "profitEngine.calculateDealProfit(input)",
        codeRef: "src/services/profitEngine.ts:55",
      },
      {
        source: "InvestorMatcher" as const,
        action: "syndicate_match_score",
        message: "Matched deal-4 with 4 institutional buyers in portfolio database. Highest fit: 96.5%.",
        inputPayload: { dealId: "deal-4", targetState: "AZ", propertyType: "land" },
        outputPayload: { matchedCount: 4, topMatchedBuyer: "Sonoran Desert Capital & Land Trust" },
        astNode: "store.matchInvestorsForDeal(dealId)",
        codeRef: "src/services/store.ts:1090",
      },
    ];

    const randomTrace = traceTypes[Math.floor(Math.random() * traceTypes.length)];
    const stopActivity = store.startActivity(`Simulated Trace: ${randomTrace.source}`, "DEV_TRACE");

    try {
      await new Promise((r) => setTimeout(r, 250));
      store.trace(randomTrace.source, randomTrace.action, randomTrace.message, {
        level: "EXEC",
        inputPayload: randomTrace.inputPayload,
        outputPayload: randomTrace.outputPayload,
        astNode: randomTrace.astNode,
        codeRef: randomTrace.codeRef,
        executionTimeMs: Math.round((Math.random() * 20 + 8) * 10) / 10,
      });
      setLogs([...store.getDeveloperTraces()]);
    } finally {
      stopActivity();
      setIsSimulating(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterType === "WHOLESALER_SCOUT") {
      const isWholesale =
        log.action === "wholesaler_ready_buyer_discovered" ||
        log.action === "wholesaler_buyer_identified" ||
        log.message.toLowerCase().includes("wholesaler") ||
        log.message.toLowerCase().includes("assignment") ||
        Boolean(log.outputPayload?.name && log.outputPayload?.source_url);
      if (!isWholesale) return false;
    } else if (filterType === "TRACE" && log.level !== "TRACE" && log.level !== "EXEC") {
      return false;
    } else if (filterType === "AGENTS" && log.source !== "BuyerScoutAgent" && log.source !== "InvestorMatcher") {
      return false;
    } else if (filterType === "LIVE_SEARCH" && log.source !== "BuyerScoutAgent") {
      return false;
    } else if (filterType === "UNDERWRITING" && log.source !== "UnderwritingMAO" && log.source !== "DesktopCloser") {
      return false;
    } else if (filterType === "DEBUG_FIXES" && log.source !== "LiveDebugAgent") {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${log.source} ${log.action} ${log.message} ${log.astNode || ""} ${log.codeRef || ""}`.toLowerCase();
      return matchText.includes(q);
    }
    return true;
  });

  return (
    <div
      id="widget-live-console"
      className="bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-xl"
    >
      {/* Console Top Header Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
              Live Console & Developer Trace
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                {logs.length} EVENTS
              </span>
            </h3>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="btn-console-test-trace"
            onClick={handleTestAgentTrace}
            disabled={isSimulating}
            className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] transition-all disabled:opacity-50"
            title="Inject real-time trace telemetry from BuyerScout or MAO Engine"
          >
            <Zap className={`w-3 h-3 ${isSimulating ? "animate-spin text-yellow-400" : "text-cyan-400"}`} />
            <span>{isSimulating ? "Tracing..." : "Test Trace"}</span>
          </button>

          <button
            type="button"
            id="btn-console-toggle-pause"
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1.5 rounded border text-[11px] transition-colors ${
              isPaused
                ? "bg-amber-950 border-amber-800 text-amber-300"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
            }`}
            title={isPaused ? "Resume Live Stream" : "Pause Stream"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            id="btn-console-export"
            onClick={handleExportLogs}
            className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Export JSON Trace Logs"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            id="btn-console-clear"
            onClick={handleClearLogs}
            className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 transition-colors"
            title="Clear Console Stream"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {onOpenConfig && (
            <button
              type="button"
              id="btn-console-config"
              onClick={onOpenConfig}
              className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400 transition-colors"
              title="Developer Trace Settings in ConfigModal"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {["ALL", "WHOLESALER_SCOUT", "TRACE", "LIVE_SEARCH", "UNDERWRITING", "DEBUG_FIXES"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterType(tab)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                filterType === tab
                  ? tab === "WHOLESALER_SCOUT"
                    ? "bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40"
                    : "bg-slate-800 text-cyan-400 font-bold border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab === "WHOLESALER_SCOUT" ? "🤝 Wholesaler Scout" : tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter trace AST / agent..."
              className="bg-slate-900 border border-slate-800 rounded pl-7 pr-2 py-0.5 text-[10px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-36 sm:w-44"
            />
          </div>

          <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 w-3 h-3"
            />
            <span>Auto-scroll</span>
          </label>
        </div>
      </div>

      {/* Terminal Logs Output Viewport */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 font-mono text-[11px] select-text bg-[#07090E]">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center py-8">
            <Terminal className="w-8 h-8 mb-2 opacity-40 text-cyan-500" />
            <p className="text-xs font-semibold text-slate-400">Live Console Idle</p>
            <p className="text-[10px] text-slate-600 mt-1 max-w-xs">
              No developer trace events match current filters. Click "Test Trace" or trigger live agents to stream AST execution.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const isWholesalerEvent =
              log.action === "wholesaler_ready_buyer_discovered" ||
              log.action === "wholesaler_buyer_identified" ||
              log.message.toLowerCase().includes("wholesaler-friendly") ||
              log.message.toLowerCase().includes("wholesaler-ready");

            const levelColor =
              isWholesalerEvent
                ? "text-emerald-300 border-emerald-500/50 bg-emerald-950/30"
                : log.level === "ERROR"
                ? "text-red-400 border-red-500/40 bg-red-950/20"
                : log.level === "WARN"
                ? "text-amber-400 border-amber-500/40 bg-amber-950/20"
                : log.level === "EXEC"
                ? "text-emerald-400 border-emerald-500/40 bg-emerald-950/20"
                : "text-cyan-400 border-cyan-500/40 bg-cyan-950/20";

            // Extract Wholesaler Buyer Info from payload if available
            const buyerName = log.outputPayload?.name;
            const buyerFirm = log.outputPayload?.company;
            const sourceUrl = log.outputPayload?.source_url;
            const feeRange = log.outputPayload?.feeRange;

            return (
              <div
                key={log.id}
                className={`border rounded transition-colors p-2 text-left ${
                  isWholesalerEvent
                    ? "border-emerald-500/40 bg-emerald-950/15 border-l-4 border-l-emerald-500"
                    : "border-slate-800/80 bg-slate-950/60 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="text-slate-500 hover:text-slate-300 mt-0.5 flex-shrink-0"
                    >
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 mb-0.5">
                        <span className="text-slate-400">{log.timestamp.slice(11, 19)}</span>
                        <span className={`px-1.5 py-0.2 rounded border font-bold ${levelColor}`}>
                          {log.source}
                        </span>
                        {isWholesalerEvent && (
                          <span className="px-1.5 py-0.2 rounded border font-bold bg-emerald-950 text-emerald-400 border-emerald-500/40 flex items-center gap-1">
                            <Handshake className="w-2.5 h-2.5" />
                            WHOLESALER-READY
                          </span>
                        )}
                        <span className="text-slate-400 font-semibold">{log.action}</span>
                        {log.executionTimeMs && (
                          <span className="text-emerald-500 text-[9px]">+{log.executionTimeMs}ms</span>
                        )}
                        {log.codeRef && (
                          <span className="text-slate-600 hover:text-cyan-400 cursor-pointer hidden sm:inline">
                            {log.codeRef}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-200 text-[11px] leading-relaxed break-words">
                        {log.message}
                      </p>

                      {/* Real-Time Wholesaler Highlight Callout */}
                      {(buyerName || buyerFirm || sourceUrl) && (
                        <div className="mt-1.5 bg-emerald-950/30 border border-emerald-800/40 rounded p-1.5 text-[10px] flex flex-wrap items-center gap-x-3 gap-y-1">
                          {buyerName && (
                            <div>
                              <span className="text-slate-400">Buyer: </span>
                              <span className="text-emerald-300 font-bold">{buyerName}</span>
                            </div>
                          )}
                          {buyerFirm && buyerFirm !== buyerName && (
                            <div>
                              <span className="text-slate-400">Firm: </span>
                              <span className="text-white">{buyerFirm}</span>
                            </div>
                          )}
                          {feeRange && (
                            <div>
                              <span className="text-slate-400">Fee: </span>
                              <span className="text-emerald-400">{feeRange}</span>
                            </div>
                          )}
                          {sourceUrl && (
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400">Source: </span>
                              <a
                                href={sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 underline flex items-center gap-0.5 truncate max-w-[200px]"
                              >
                                <span>{sourceUrl}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {log.astNode && !isExpanded && (
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5 flex items-center gap-1 truncate">
                          <Code className="w-2.5 h-2.5 text-cyan-400" />
                          <span className="text-cyan-300/80">{log.astNode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Payload & AST Breakdown */}
                {isExpanded && (
                  <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] space-y-1.5 bg-slate-900/80 rounded p-2">
                    {log.astNode && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 uppercase text-[9px]">AST Function Node:</span>
                        <span className="text-cyan-400 font-bold">{log.astNode}</span>
                      </div>
                    )}
                    {log.codeRef && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 uppercase text-[9px]">Source Reference:</span>
                        <span className="text-amber-300">{log.codeRef}</span>
                        {onOpenCodeEditor && (
                          <button
                            type="button"
                            onClick={onOpenCodeEditor}
                            className="text-[9px] text-cyan-400 underline hover:text-cyan-300 ml-2"
                          >
                            Jump to Editor
                          </button>
                        )}
                      </div>
                    )}
                    {log.inputPayload && (
                      <div>
                        <span className="text-slate-500 uppercase text-[9px]">Input Payload:</span>
                        <pre className="bg-black/50 p-1.5 rounded mt-0.5 text-slate-300 overflow-x-auto text-[9px]">
                          {JSON.stringify(log.inputPayload, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.outputPayload && (
                      <div>
                        <span className="text-slate-500 uppercase text-[9px]">Output Result:</span>
                        <pre className="bg-black/50 p-1.5 rounded mt-0.5 text-emerald-300 overflow-x-auto text-[9px]">
                          {JSON.stringify(log.outputPayload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={consoleBottomRef} />
      </div>
    </div>
  );
}
