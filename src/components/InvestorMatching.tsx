import { useState, useEffect, useMemo } from "react";
import {
  Send,
  CheckCircle2,
  RefreshCw,
  Handshake,
  ExternalLink,
  ShieldCheck,
  Zap,
  Tag,
  Search,
  Filter,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { Investor, Deal } from "../types";

interface MatchingItem {
  id?: string;
  name?: string;
  company?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  targetMarkets?: string[];
  targetStates?: string[];
  maxPurchasePrice?: number;
  minROI?: number;
  minYieldPct?: number;
  matchScore?: number;
  matchReasons?: string[];
  reasons?: string[];
  isWholesalerReady?: boolean;
  wholesaleTags?: string[];
  priority?: "HIGH" | "MEDIUM" | "LOW";
  acceptsAssignments?: boolean;
  targetAssignmentFeeRange?: string;
  wholesalerForumNote?: string;
  source_url?: string;
  sourceUrl?: string;
  source?: string;
  notes?: string;
  investor?: {
    id?: string;
    name?: string;
    company?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    targetMarkets?: string[];
    targetStates?: string[];
    maxPurchasePrice?: number;
    minROI?: number;
    isWholesalerReady?: boolean;
    wholesaleTags?: string[];
    priority?: "HIGH" | "MEDIUM" | "LOW";
    acceptsAssignments?: boolean;
    targetAssignmentFeeRange?: string;
    wholesalerForumNote?: string;
    source_url?: string;
    sourceUrl?: string;
    source?: string;
    notes?: string;
    criteria?: {
      maxPurchasePrice?: number;
      targetStates?: string[];
      minYieldPct?: number;
    };
  };
}

interface InvestorMatchingProps {
  investors: Investor[];
  deals: Deal[];
  selectedDealId?: string;
  onSendDealPacket: (investorId: string, dealId: string) => void;
}

export default function InvestorMatching({
  deals,
  selectedDealId,
  onSendDealPacket,
}: InvestorMatchingProps) {
  const [activeDealId, setActiveDealId] = useState<string>(
    selectedDealId || deals[0]?.id || ""
  );
  const [matches, setMatches] = useState<MatchingItem[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [dispatched, setDispatched] = useState<Record<string, boolean>>({});
  const [wholesaleOnlyFilter, setWholesaleOnlyFilter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilterTab, setActiveFilterTab] = useState<"ALL" | "WHOLESALE" | "HIGH_PRIORITY">("ALL");

  const activeDeal = deals.find((d) => d.id === activeDealId) || deals[0];

  const fetchMatches = async (dealId: string) => {
    if (!dealId) return;
    setIsMatching(true);
    try {
      const res = await fetch(`/api/investors/match/${dealId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.matches)) {
        setMatches(data.matches);
      }
    } catch (err) {
      console.error("Failed to fetch investor matches:", err);
    } finally {
      setIsMatching(false);
    }
  };

  useEffect(() => {
    if (activeDealId) {
      fetchMatches(activeDealId);
    }
  }, [activeDealId]);

  const handleDispatch = (investorId: string) => {
    setDispatched((prev) => ({ ...prev, [`${investorId}-${activeDealId}`]: true }));
    onSendDealPacket(investorId, activeDealId);
  };

  // Filter and search computation
  const filteredMatches = useMemo(() => {
    return matches.filter((item) => {
      const isWholesale =
        item.isWholesalerReady ||
        item.investor?.isWholesalerReady ||
        item.acceptsAssignments ||
        item.investor?.acceptsAssignments;
      const isHighPriority =
        item.priority === "HIGH" ||
        item.investor?.priority === "HIGH" ||
        item.isWholesalerReady;

      // Filter tabs
      if (activeFilterTab === "WHOLESALE" && !isWholesale) return false;
      if (activeFilterTab === "HIGH_PRIORITY" && !isHighPriority) return false;
      if (wholesaleOnlyFilter && !isWholesale) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (item.name || item.investor?.name || "").toLowerCase();
        const company = (item.company || item.investor?.company || "").toLowerCase();
        const markets = (
          item.targetMarkets ||
          item.investor?.targetMarkets ||
          item.targetStates ||
          item.investor?.targetStates ||
          []
        )
          .join(" ")
          .toLowerCase();
        const tags = (item.wholesaleTags || item.investor?.wholesaleTags || []).join(" ").toLowerCase();
        return name.includes(q) || company.includes(q) || markets.includes(q) || tags.includes(q);
      }

      return true;
    });
  }, [matches, activeFilterTab, wholesaleOnlyFilter, searchQuery]);

  const wholesaleCount = useMemo(() => {
    return matches.filter(
      (m) =>
        m.isWholesalerReady ||
        m.investor?.isWholesalerReady ||
        m.acceptsAssignments ||
        m.investor?.acceptsAssignments
    ).length;
  }, [matches]);

  const highPriorityCount = useMemo(() => {
    return matches.filter(
      (m) => m.priority === "HIGH" || m.investor?.priority === "HIGH" || m.isWholesalerReady
    ).length;
  }, [matches]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0E1218] border border-slate-800 rounded p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Institutional Syndication
              </span>
              <span className="text-xs text-slate-500 font-mono">DISPOSITION & BUYER SCOUT MATCHING</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Handshake className="w-3 h-3" />
                Wholesaler-Ready Active
              </span>
            </div>
            <h2 className="text-2xl font-light text-white tracking-tight mt-1 font-sans">
              Automated Investor & Disposition Matching Engine
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cross-references deeply discounted underwritten opportunities with qualified cash buyers and BuyerScout-verified wholesale assignment partners.
            </p>
          </div>

          {/* Deal Selector */}
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-slate-500 uppercase text-[11px]">Match Deal:</span>
            <select
              value={activeDealId}
              onChange={(e) => setActiveDealId(e.target.value)}
              className="bg-[#161B22] border border-slate-800 text-white text-xs rounded px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
            >
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.property?.address} ({d.property?.city}, {d.property?.state}) - ${(d.metrics?.projectedProfit ?? 0).toLocaleString()} profit
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Selected Deal Summary Card */}
      {activeDeal && (
        <div className="bg-[#0E1218] p-5 rounded border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-2 border-l-emerald-500">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold">Active Matching Target:</span>
            <div className="text-lg font-light text-white font-sans mt-0.5">
              {activeDeal.property?.address}, {activeDeal.property?.city}, {activeDeal.property?.state}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {(activeDeal.property?.propertyType || "single_family").replace("_", " ").toUpperCase()} • ASKING ${(activeDeal.property?.askingPrice ?? 0).toLocaleString()} • ARV ${(activeDeal.financials?.expectedSalePrice ?? 0).toLocaleString()}
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-[#161B22] p-3 rounded border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Projected Profit:</span>
              <span className="font-bold text-emerald-400">
                ${(activeDeal.metrics?.projectedProfit ?? 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Projected ROI:</span>
              <span className="font-bold text-emerald-300">
                {activeDeal.metrics?.roi ?? 0}%
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Deal Score:</span>
              <span className="font-bold text-white">
                {activeDeal.dealScore ?? 80}/100
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls & Wholesale-Friendly Toggle Bar */}
      <div className="bg-[#0E1218] border border-slate-800 rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Tabs & Wholesale Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveFilterTab("ALL");
              setWholesaleOnlyFilter(false);
            }}
            className={`px-3 py-1.5 rounded text-xs font-mono transition flex items-center gap-1.5 ${
              activeFilterTab === "ALL" && !wholesaleOnlyFilter
                ? "bg-slate-800 text-white font-bold border border-slate-700"
                : "bg-[#161B22] text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <span>All Matches</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded bg-slate-900 text-slate-400">
              {matches.length}
            </span>
          </button>

          {/* Wholesale-Friendly Filter Toggle Button */}
          <button
            id="wholesale-friendly-filter-btn"
            onClick={() => {
              const next = !wholesaleOnlyFilter;
              setWholesaleOnlyFilter(next);
              setActiveFilterTab(next ? "WHOLESALE" : "ALL");
            }}
            className={`px-3 py-1.5 rounded text-xs font-mono transition flex items-center gap-1.5 ${
              wholesaleOnlyFilter || activeFilterTab === "WHOLESALE"
                ? "bg-emerald-600 text-white font-bold border border-emerald-500 shadow-sm"
                : "bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-800/40"
            }`}
          >
            <Handshake className="w-3.5 h-3.5" />
            <span>Wholesale-Friendly</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded ${
                wholesaleOnlyFilter || activeFilterTab === "WHOLESALE"
                  ? "bg-emerald-700 text-white"
                  : "bg-emerald-900/60 text-emerald-300"
              }`}
            >
              {wholesaleCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveFilterTab("HIGH_PRIORITY");
              setWholesaleOnlyFilter(false);
            }}
            className={`px-3 py-1.5 rounded text-xs font-mono transition flex items-center gap-1.5 ${
              activeFilterTab === "HIGH_PRIORITY"
                ? "bg-amber-600 text-white font-bold border border-amber-500"
                : "bg-amber-950/40 text-amber-400 hover:bg-amber-900/50 border border-amber-800/40"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>High Priority</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded ${
                activeFilterTab === "HIGH_PRIORITY"
                  ? "bg-amber-700 text-white"
                  : "bg-amber-900/60 text-amber-300"
              }`}
            >
              {highPriorityCount}
            </span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search cash buyer or market..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161B22] border border-slate-800 text-white text-xs rounded pl-8 pr-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Matched Investors Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center gap-2">
            <span>
              Ranked Cash Buyer Matches ({filteredMatches.length} of {matches.length})
            </span>
            {wholesaleOnlyFilter && (
              <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                Filtered: Wholesale-Friendly Only
              </span>
            )}
          </h3>
          {isMatching && <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
        </div>

        {filteredMatches.length === 0 ? (
          <div className="bg-[#0E1218] border border-slate-800 rounded p-8 text-center">
            <p className="text-sm text-slate-400 font-mono">
              No matching cash buyers found with the active filters.
            </p>
            <button
              onClick={() => {
                setWholesaleOnlyFilter(false);
                setActiveFilterTab("ALL");
                setSearchQuery("");
              }}
              className="mt-3 px-3 py-1.5 text-xs bg-slate-800 text-white rounded font-mono hover:bg-slate-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map((item: MatchingItem, idx) => {
              const invId = item.investor?.id || item.id || `inv-${idx}`;
              const invName = item.investor?.name || item.name || "Private Capital Group";
              const invCompany = item.investor?.company || item.company || "Private Capital Partner";
              const maxPrice =
                item.investor?.criteria?.maxPurchasePrice ??
                item.investor?.maxPurchasePrice ??
                item.maxPurchasePrice ??
                100000;
              const targetStates =
                item.investor?.criteria?.targetStates ??
                item.investor?.targetStates ??
                item.investor?.targetMarkets ??
                item.targetMarkets ??
                item.targetStates ?? ["National"];
              const minYield =
                item.investor?.criteria?.minYieldPct ??
                item.investor?.minROI ??
                item.minYieldPct ??
                item.minROI ??
                20;
              const matchScore = item.matchScore ?? 85;
              const matchReasons =
                item.matchReasons ||
                item.reasons || ["Direct buy-box alignment", "State target match"];
              const isSent = dispatched[`${invId}-${activeDealId}`];

              // Wholesaler-Ready Metadata
              const isWholesalerReady =
                item.isWholesalerReady ||
                item.investor?.isWholesalerReady ||
                item.acceptsAssignments ||
                item.investor?.acceptsAssignments ||
                false;
              const priority = item.priority || item.investor?.priority || (isWholesalerReady ? "HIGH" : "MEDIUM");
              const wholesaleTags =
                item.wholesaleTags ||
                item.investor?.wholesaleTags ||
                (isWholesalerReady
                  ? ["Wholesaler-Ready", "Assignment Friendly", "High Priority Lead"]
                  : []);
              const feeRange =
                item.targetAssignmentFeeRange ||
                item.investor?.targetAssignmentFeeRange ||
                (isWholesalerReady ? "$10,000 - $35,000" : undefined);
              const forumNote =
                item.wholesalerForumNote ||
                item.investor?.wholesalerForumNote ||
                item.notes ||
                item.investor?.notes;
              const sourceUrl =
                item.source_url ||
                item.sourceUrl ||
                item.investor?.source_url ||
                item.investor?.sourceUrl;
              const sourceName = item.source || item.investor?.source || "BuyerScout Sweep";

              return (
                <div
                  key={invId}
                  className={`bg-[#0E1218] border rounded p-5 space-y-4 flex flex-col justify-between transition ${
                    isWholesalerReady
                      ? "border-emerald-500/40 border-l-4 border-l-emerald-500 shadow-md shadow-emerald-950/20"
                      : "border-slate-800 border-l-2 border-l-slate-700 hover:border-l-blue-500"
                  }`}
                >
                  <div>
                    {/* Header with Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-semibold text-white text-sm font-sans truncate">
                            {invName}
                          </h4>
                          {priority === "HIGH" && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                              <Zap className="w-2.5 h-2.5" />
                              High Priority
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono truncate">{invCompany}</p>
                      </div>

                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                        {matchScore}% MATCH
                      </span>
                    </div>

                    {/* Wholesaler-Ready Highlight Banner */}
                    {isWholesalerReady && (
                      <div className="mt-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-emerald-300 font-bold flex items-center gap-1">
                            <Handshake className="w-3 h-3 text-emerald-400" />
                            Wholesaler-Ready Buyer
                          </span>
                          {feeRange && (
                            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-900/60 px-1.5 py-0.5 rounded">
                              Fee: {feeRange}
                            </span>
                          )}
                        </div>

                        {forumNote && (
                          <p className="text-[11px] text-slate-300 font-sans italic line-clamp-2">
                            "{forumNote}"
                          </p>
                        )}

                        {/* Wholesale Tags */}
                        {wholesaleTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {wholesaleTags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-1.5 py-0.5 text-[9px] rounded font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Criteria specs */}
                    <div className="mt-3 bg-[#161B22] p-3 rounded border border-slate-800 text-xs font-mono space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Max Purchase:</span>
                        <span className="font-semibold text-white">
                          ${maxPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Target States:</span>
                        <span className="text-slate-300 truncate max-w-[150px] text-right">
                          {Array.isArray(targetStates) ? targetStates.join(", ") : targetStates}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Min Required Yield:</span>
                        <span className="text-emerald-400 font-semibold">{minYield}%</span>
                      </div>
                      {sourceUrl && (
                        <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                          <span className="text-slate-500">Source:</span>
                          <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-[10px] flex items-center gap-1 truncate max-w-[150px]"
                          >
                            <span className="truncate">{sourceName}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Match reasons */}
                    <div className="mt-3 space-y-1">
                      {matchReasons.map((r, i) => (
                        <div
                          key={i}
                          className="text-[11px] text-slate-400 flex items-center space-x-1.5 font-mono"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dispatch Button */}
                  <div className="pt-3 border-t border-slate-800">
                    <button
                      onClick={() => handleDispatch(invId)}
                      disabled={isSent}
                      className={`w-full py-2.5 rounded text-xs font-bold font-mono uppercase tracking-wider transition flex items-center justify-center space-x-1.5 ${
                        isSent
                          ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                          : isWholesalerReady
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                          : "bg-slate-700 hover:bg-slate-600 text-white"
                      }`}
                    >
                      {isSent ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Packet Dispatched</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Deal Packet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
