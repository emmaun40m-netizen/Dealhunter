import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  Award,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  Search,
  Filter,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  Lock,
  FileText,
  Users,
  Send,
  Zap,
  Activity,
  ArrowUpRight,
  Eye,
  Check,
  Clock,
  Layers,
  ChevronRight,
  Briefcase,
  Maximize2,
  RefreshCw,
  Cpu,
  LayoutGrid,
  Radio,
  Sliders,
  Flame,
  Bell,
  Volume2,
  X,
  VolumeX,
  Code,
} from "lucide-react";
import { Deal, DashboardMetrics, ApprovalRequest, Contract, Investor } from "../types";
import WorkspaceGridManager from "./dashboard/WorkspaceGridManager";
import ROIHeatmapWidget from "./dashboard/ROIHeatmapWidget";
import PropertyInspectionsWidget from "./dashboard/PropertyInspectionsWidget";
import DebugSessionNotificationPane from "./dashboard/DebugSessionNotificationPane";
import Dashboard3QuarterCodeWorkspace from "./dashboard/Dashboard3QuarterCodeWorkspace";
import RadarWidget from "./dashboard/RadarWidget";
import TabVoiceRundown from "./TabVoiceRundown";
import { GridPreset } from "../services/multiMonitorSync";
import { voiceAssistant } from "../services/voiceAssistant";

// --- Sparkline Mini Trend Charts for KPIs ---
function ProjectedProfitSparkline({ currentProfit }: { currentProfit: number }) {
  // 7-day trend values leading to current
  const points = [
    Math.round(currentProfit * 0.72),
    Math.round(currentProfit * 0.78),
    Math.round(currentProfit * 0.83),
    Math.round(currentProfit * 0.81),
    Math.round(currentProfit * 0.89),
    Math.round(currentProfit * 0.95),
    currentProfit,
  ];

  const min = Math.min(...points) * 0.95;
  const max = Math.max(...points) * 1.05;
  const width = 120;
  const height = 32;

  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * (width - 10) + 5;
    const y = height - ((val - min) / (max - min)) * (height - 10) - 5;
    return { x, y, val };
  });

  const pathD = coords.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${coords[coords.length - 1].x},${height} L ${coords[0].x},${height} Z`;

  return (
    <div className="flex items-center gap-2 pt-1">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#profitGrad)" />
        <path d={pathD} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={i === coords.length - 1 ? 3 : 1.5}
            className={i === coords.length - 1 ? "fill-emerald-400 stroke-emerald-950 stroke-1 animate-pulse" : "fill-emerald-500/70"}
          />
        ))}
      </svg>
      <div className="text-[10px] text-emerald-400 font-mono font-bold flex flex-col">
        <span>+28.4%</span>
        <span className="text-[9px] text-slate-500 font-normal">7-day pace</span>
      </div>
    </div>
  );
}

function OutreachConversionSparkline({ replyRate }: { replyRate: number }) {
  // 7-day trend values leading to current conversion rate
  const points = [32, 38, 41, 44, 46, 50, replyRate || 50];
  const min = 25;
  const max = 70;
  const width = 120;
  const height = 32;

  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * (width - 10) + 5;
    const y = height - ((val - min) / (max - min)) * (height - 10) - 5;
    return { x, y, val };
  });

  const pathD = coords.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${coords[coords.length - 1].x},${height} L ${coords[0].x},${height} Z`;

  return (
    <div className="flex items-center gap-2 pt-1">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="outreachGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#outreachGrad)" />
        <path d={pathD} fill="none" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={i === coords.length - 1 ? 3 : 1.5}
            className={i === coords.length - 1 ? "fill-purple-400 stroke-purple-950 stroke-1 animate-pulse" : "fill-purple-500/70"}
          />
        ))}
      </svg>
      <div className="text-[10px] text-purple-400 font-mono font-bold flex flex-col">
        <span>+18.2%</span>
        <span className="text-[9px] text-slate-500 font-normal">conversion</span>
      </div>
    </div>
  );
}

interface DashboardOverviewProps {
  metrics: DashboardMetrics | null;
  deals: Deal[];
  approvals?: ApprovalRequest[];
  contracts?: Contract[];
  investors?: Investor[];
  configMinROI?: number;
  onSelectDeal: (deal: Deal) => void;
  onNavigateTab: (tab: string) => void;
  onPopoutWidget: (widgetId: string, title: string) => void;
  detachedWidgets: string[];
  onRecallWidget: (widgetId: string) => void;
  onRecallAll: () => void;
  currentPreset: GridPreset;
  onChangePreset: (preset: GridPreset) => void;
  onOpenVoiceSettings?: () => void;
  onOpenConfig?: () => void;
}

export default function DashboardOverview({
  metrics,
  deals,
  approvals = [],
  contracts = [],
  investors = [],
  configMinROI = 25,
  onSelectDeal,
  onNavigateTab,
  onPopoutWidget,
  detachedWidgets,
  onRecallWidget,
  onRecallAll,
  currentPreset,
  onChangePreset,
  onOpenVoiceSettings,
}: DashboardOverviewProps) {
  // State for search, strategy, stage filter, view mode, and dashboard top tab
  const [dashboardMode, setDashboardMode] = useState<"CODING_3_4" | "WORKSPACE_TILES" | "EXECUTIVE_PIPELINE" | "RADAR" | "ROI_HEATMAP" | "INSPECTIONS">("CODING_3_4");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("ALL");
  const [selectedRecommendation, setSelectedRecommendation] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"TABLE" | "CARDS">("TABLE");
  const [sortBy, setSortBy] = useState<"SCORE" | "PROFIT" | "PRICE" | "ROI">("SCORE");
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([]);

  // Filter high ROI deals (deal.metrics.roi >= configMinROI)
  const highROIDeals = useMemo(() => {
    return deals.filter((d) => (d.metrics?.roi ?? 0) >= configMinROI);
  }, [deals, configMinROI]);

  const handleAnnounceHighROIProperty = (d: Deal, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    voiceAssistant.announceHighROI(
      d.property.address,
      d.metrics?.roi || configMinROI,
      d.metrics?.projectedProfit || 25000
    );
  };

  const handleAnnounceAllHighROI = () => {
    if (highROIDeals.length === 0) {
      voiceAssistant.speak(
        `Currently no properties meet your minimum ROI baseline of ${configMinROI} percent. Scanner continues running.`,
        { chime: "alert" }
      );
      return;
    }
    const top = highROIDeals[0];
    voiceAssistant.speak(
      `Attention: Found ${highROIDeals.length} properties exceeding your ${configMinROI} percent target minimum ROI. Top listing is ${top.property.address} with ${top.metrics?.roi} percent ROI and ${(top.metrics?.projectedProfit || 0).toLocaleString()} dollars projected spread.`,
      { chime: "alert", force: true }
    );
  };

  // Top deal for Spotlight
  const topDeal = useMemo(() => {
    return (
      deals.find((d) => d.id === "deal-1") ||
      [...deals].sort((a, b) => (b.metrics?.projectedProfit ?? 0) - (a.metrics?.projectedProfit ?? 0))[0] ||
      deals[0]
    );
  }, [deals]);

  // Real estate pipeline stages
  const stages = [
    { id: "DISCOVERED", label: "Discovered", count: metrics?.properties ?? 8, color: "bg-slate-500", textCol: "text-slate-400" },
    { id: "ANALYSIS", label: "Underwriting", count: metrics?.analyzed ?? 8, color: "bg-blue-500", textCol: "text-blue-400" },
    { id: "PURSUE", label: "PURSUE Qualified", count: metrics?.qualified ?? 6, color: "bg-emerald-500", textCol: "text-emerald-400" },
    { id: "OFFER", label: "Active Offers", count: deals.filter((d) => d.status === "OFFER").length || 2, color: "bg-teal-500", textCol: "text-teal-400" },
    { id: "NEGOTIATION", label: "Negotiations", count: deals.filter((d) => d.status === "NEGOTIATION").length || 1, color: "bg-amber-500", textCol: "text-amber-400" },
    { id: "CLOSING", label: "Title / Escrow", count: deals.filter((d) => d.status === "CONTRACT" || d.status === "CLOSING").length || 1, color: "bg-indigo-500", textCol: "text-indigo-400" },
    { id: "REALIZED", label: "Closed Realized", count: metrics?.realized?.closedDealsCount ?? 2, color: "bg-purple-500", textCol: "text-purple-400" },
  ];

  // Strategy Portfolio Breakdown Stats
  const strategyStats = useMemo(() => {
    const wholesaleDeals = deals.filter((d) => d.property.propertyType === "SINGLE_FAMILY" || !d.property.propertyType);
    const subToDeals = deals.filter((d) => d.property.propertyType === "MULTI_FAMILY");
    const flipDeals = deals.filter((d) => d.property.propertyType === "COMMERCIAL" || d.property.propertyType === "LAND");

    return [
      {
        name: "Wholesale Assignment",
        tag: "$0 Down / Fast Assignment",
        count: wholesaleDeals.length || 4,
        projectedProfit: 98500,
        avgDays: "7-14 Days",
        color: "text-emerald-400 border-emerald-500/30 bg-emerald-950/30",
      },
      {
        name: "Subject-To Financing",
        tag: "Low Rate Assumption (2.85%)",
        count: subToDeals.length || 2,
        projectedProfit: 62400,
        avgDays: "21 Days",
        color: "text-blue-400 border-blue-500/30 bg-blue-950/30",
      },
      {
        name: "Seller Carryback Note",
        tag: "0% / Low Interest Direct",
        count: 1,
        projectedProfit: 34000,
        avgDays: "30 Days",
        color: "text-amber-400 border-amber-500/30 bg-amber-950/30",
      },
      {
        name: "Fix & Flip / BRRRR",
        tag: "Deep Equity Spread",
        count: flipDeals.length || 1,
        projectedProfit: 45000,
        avgDays: "60-90 Days",
        color: "text-indigo-400 border-indigo-500/30 bg-indigo-950/30",
      },
    ];
  }, [deals]);

  // Live Agent Operations Audit Feed
  const recentActivities = [
    {
      agent: "Agent 4 (Virtual Closer)",
      time: "2m ago",
      text: "Drafted Double Close Statutory Contract with $0 Down clause for 8422 Artesian St.",
      status: "COMPLETED",
      badge: "bg-indigo-950 text-indigo-300 border-indigo-500/30",
    },
    {
      agent: "Agent 2 (Underwriter)",
      time: "14m ago",
      text: "Computed MAO at $138,400 with 37.2% ROI after analyzing 4 MLS comparable sales.",
      status: "VERIFIED",
      badge: "bg-blue-950 text-blue-300 border-blue-500/30",
    },
    {
      agent: "Agent 3 (Outreach)",
      time: "32m ago",
      text: "Received seller response from Marcus Vance regarding 14209 Promenade Ave.",
      status: "ENGAGED",
      badge: "bg-emerald-950 text-emerald-300 border-emerald-500/30",
    },
    {
      agent: "Escrow Bank Engine",
      time: "1h ago",
      text: "FedNow micro-verification cleared. Primary linked account JPMorgan Chase •••• 4192.",
      status: "ONLINE",
      badge: "bg-emerald-950 text-emerald-300 border-emerald-500/30",
    },
  ];

  // Filtered and sorted deals
  const filteredDeals = useMemo(() => {
    return deals
      .filter((d) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchAddress = d.property.address.toLowerCase().includes(q);
          const matchCity = d.property.city.toLowerCase().includes(q);
          const matchState = d.property.state.toLowerCase().includes(q);
          if (!matchAddress && !matchCity && !matchState) return false;
        }

        // Recommendation filter
        if (selectedRecommendation !== "ALL" && d.recommendation !== selectedRecommendation) {
          return false;
        }

        // Stage filter
        if (selectedStage) {
          if (selectedStage === "PURSUE" && d.recommendation !== "PURSUE") return false;
          if (selectedStage === "OFFER" && d.status !== "OFFER") return false;
          if (selectedStage === "NEGOTIATION" && d.status !== "NEGOTIATION") return false;
          if (selectedStage === "CLOSING" && d.status !== "CONTRACT" && d.status !== "CLOSING") return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "SCORE") return b.dealScore - a.dealScore;
        if (sortBy === "PROFIT") return (b.metrics?.projectedProfit ?? 0) - (a.metrics?.projectedProfit ?? 0);
        if (sortBy === "PRICE") return (b.financials?.purchasePrice ?? 0) - (a.financials?.purchasePrice ?? 0);
        if (sortBy === "ROI") return (b.metrics?.roi ?? 0) - (a.metrics?.roi ?? 0);
        return 0;
      });
  }, [deals, searchQuery, selectedRecommendation, selectedStage, sortBy]);

  return (
    <div className="space-y-6">
      {/* Voice Assistant Rundown Banner for Dashboard */}
      <TabVoiceRundown
        activeTab="dashboard"
        deals={deals}
        approvals={approvals}
        contracts={contracts}
        metrics={metrics}
        configMinROI={configMinROI}
        onOpenVoiceSettings={onOpenVoiceSettings}
        onNavigateTab={onNavigateTab}
      />

      {/* Live Debug Agent Notification Pane */}
      <DebugSessionNotificationPane
        onOpenConsole={() => {
          // If in workspace tiles, could navigate or trigger widget
          onChangePreset("2x2");
        }}
        onOpenCode={() => onNavigateTab("code")}
      />

      {/* High-ROI Real Estate Listings Spotlight Matrix (≥ minROI from config settings) */}
      {highROIDeals.length > 0 && (
        <div className="bg-[#0D1219] border border-emerald-500/50 rounded-sm p-3.5 sm:p-4 font-mono space-y-3 shadow-[0_0_20px_rgba(16,185,129,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded">
                <Flame className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    HIGH-ROI REAL ESTATE LISTINGS SPOTLIGHT (ROI ≥ {configMinROI}%)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded font-bold">
                    {highROIDeals.length} QUALIFIED DEALS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Autonomous scanner highlights meeting or exceeding your target configured minimum ROI ({configMinROI}%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
                className={`px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition border ${
                  isNotificationCenterOpen
                    ? "bg-amber-500 text-black border-amber-400"
                    : "bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/40"
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>ROI NOTIFICATIONS ({highROIDeals.length})</span>
              </button>

              <button
                onClick={handleAnnounceAllHighROI}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 rounded text-[11px] font-bold flex items-center gap-1 transition"
                title="Voice speak high ROI alert digest"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>VOICE ALERT</span>
              </button>

              <button
                onClick={() => onNavigateTab("properties")}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded text-[11px] flex items-center gap-1.5 transition shadow-sm"
              >
                <span>EXPLORE ALL</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notification Center Dropdown / Drawer */}
          {isNotificationCenterOpen && (
            <div className="p-3 bg-[#0B0E14] border border-amber-500/40 rounded space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs text-white uppercase tracking-wider">
                    TARGET ROI SENSING & NOTIFICATION CENTER
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-500/30 rounded font-bold">
                    MIN ROI TARGET: {configMinROI}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAnnounceAllHighROI}
                    className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded text-[10px] flex items-center gap-1 font-bold transition"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Narrate High-ROI Leads</span>
                  </button>
                  <button
                    onClick={() => setIsNotificationCenterOpen(false)}
                    className="p-1 text-slate-400 hover:text-white rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {highROIDeals.map((d) => (
                  <div
                    key={d.id}
                    className="p-2.5 bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold font-mono">
                          {d.metrics?.roi}% ROI
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="font-bold text-white font-sans truncate max-w-[180px]">
                          {d.property.address}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Spread: ${(d.metrics?.projectedProfit || 0).toLocaleString()} • {d.property.city}, {d.property.state}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleAnnounceHighROIProperty(d, e)}
                        className="p-1.5 bg-slate-800 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 rounded border border-slate-700 transition"
                        title="Voice announce this property"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          onSelectDeal(d);
                          setIsNotificationCenterOpen(false);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded border border-slate-700 text-[10px] font-bold transition"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Horizontal scroll / grid of High-ROI Cards with Pulsating Indicator */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {highROIDeals.slice(0, 4).map((d) => (
              <div
                key={d.id}
                onClick={() => onSelectDeal(d)}
                className="bg-[#121722] border border-emerald-500/70 hover:border-emerald-400 rounded p-3 transition cursor-pointer flex flex-col justify-between group ring-1 ring-emerald-500/40 hover:ring-2 relative overflow-hidden"
              >
                {/* Pulsating Indicator Badge */}
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-emerald-950/90 border border-emerald-400 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>{d.metrics?.roi}% ROI</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleAnnounceHighROIProperty(d, e)}
                      className="p-1 bg-slate-800 hover:bg-emerald-950 text-slate-400 hover:text-emerald-300 rounded border border-slate-700 transition"
                      title="Voice announce property"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      {d.property.state} • {d.property.propertyType || "LAND"}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white text-xs truncate group-hover:text-emerald-400 font-sans">
                    {d.property.address}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {d.property.city}, {d.property.state} {d.property.zip}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">SPREAD</span>
                    <span className="font-bold text-emerald-400">
                      ${(d.metrics?.projectedProfit || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">ASKING</span>
                    <span className="font-bold text-slate-200">
                      ${(d.property.askingPrice || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Executive Autonomous Mission Control & Mode Switcher Bar */}
      <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/40 rounded text-emerald-300 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AUTONOMOUS ENGINE v4.2 ONLINE</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              | 4 COGNITIVE AGENTS ACTIVE • MULTI-MONITOR BROADCAST SYNC (host_multi_monitor_sync_v2)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time multi-screen grid orchestration, live deal algorithms (V8), MLS auction feeds, and dynamic financial charts.
          </p>
        </div>

        {/* View Mode Switcher: Workspace Grid vs Pipeline & Quick Launchers */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Main Dashboard Sub-mode toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded p-0.5">
            <button
              onClick={() => setDashboardMode("CODING_3_4")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition text-[11px] ${
                dashboardMode === "CODING_3_4"
                  ? "bg-emerald-500 text-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>3/4 CODING WORKSPACE</span>
            </button>
            <button
              onClick={() => setDashboardMode("WORKSPACE_TILES")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition text-[11px] ${
                dashboardMode === "WORKSPACE_TILES"
                  ? "bg-emerald-500 text-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>TILES</span>
            </button>
            <button
              onClick={() => setDashboardMode("EXECUTIVE_PIPELINE")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition text-[11px] ${
                dashboardMode === "EXECUTIVE_PIPELINE"
                  ? "bg-slate-700 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>PIPELINE</span>
            </button>
            <button
              onClick={() => setDashboardMode("RADAR")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition text-[11px] ${
                dashboardMode === "RADAR"
                  ? "bg-emerald-500 text-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>RADAR</span>
            </button>
            <button
              onClick={() => setDashboardMode("ROI_HEATMAP")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition text-[11px] ${
                dashboardMode === "ROI_HEATMAP"
                  ? "bg-emerald-500 text-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>HEATMAP</span>
            </button>
            <button
              onClick={() => setDashboardMode("INSPECTIONS")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition text-[11px] ${
                dashboardMode === "INSPECTIONS"
                  ? "bg-emerald-500 text-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>INSPECTIONS</span>
            </button>
          </div>

          <button
            onClick={() => onNavigateTab("payments")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-black font-bold rounded shadow transition text-[11px]"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>CASHOUT</span>
          </button>
        </div>
      </div>

      {/* Render Selected View Mode */}
      {dashboardMode === "CODING_3_4" ? (
        <div className="space-y-6">
          <Dashboard3QuarterCodeWorkspace
            deals={deals}
            approvals={approvals}
            metrics={metrics}
            contracts={contracts}
            investors={investors}
            configMinROI={configMinROI}
            onSelectDeal={onSelectDeal}
            onNavigateTab={onNavigateTab}
            onOpenVoiceSettings={onOpenVoiceSettings}
          />
        </div>
      ) : dashboardMode === "WORKSPACE_TILES" ? (
        <div className="space-y-6">
          {/* Persistent Multi-Monitor Grid Manager */}
          <WorkspaceGridManager
            deals={deals}
            approvals={approvals}
            metrics={metrics}
            contracts={contracts}
            investors={investors}
            onSelectDeal={onSelectDeal}
            onNavigateTab={onNavigateTab}
            onPopoutWidget={onPopoutWidget}
            detachedWidgets={detachedWidgets}
            onRecallWidget={onRecallWidget}
            onRecallAll={onRecallAll}
            currentPreset={currentPreset}
            onChangePreset={onChangePreset}
            onOpenVoiceSettings={onOpenVoiceSettings}
          />
        </div>
      ) : dashboardMode === "RADAR" ? (
        <div className="space-y-6">
          <RadarWidget
            onPopout={() => onPopoutWidget("radar", "Autonomous Inventory Radar (Live Streaming & Auto-Scoring)")}
            onSelectDeal={() => onNavigateTab("properties")}
          />
        </div>
      ) : dashboardMode === "ROI_HEATMAP" ? (
        <div className="space-y-6">
          <div className="h-[600px]">
            <ROIHeatmapWidget
              onSelectDeal={(dealId) => {
                const d = deals.find((deal) => deal.id === dealId);
                if (d) onSelectDeal(d);
              }}
              onPopout={() => onPopoutWidget("roi_heatmap", "Real Estate ROI Heatmap & Submarket Matrix")}
            />
          </div>
        </div>
      ) : dashboardMode === "INSPECTIONS" ? (
        <div className="space-y-6">
          <div className="h-[600px]">
            <PropertyInspectionsWidget
              deals={deals}
              onSelectDeal={onSelectDeal}
              onPopout={() => onPopoutWidget("inspections", "Property Inspections & Contingency Calendar")}
            />
          </div>
        </div>
      ) : null}

      {/* 2. Mathematical High-Precision KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* Metric 1: Projected Net Profit */}
        <div className="bg-[#0E1218] border border-slate-800 hover:border-slate-700 rounded-sm p-4 space-y-2 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="uppercase tracking-wider">PROJECTED PIPELINE PROFIT</span>
            <div className="p-1.5 bg-emerald-950/60 text-emerald-400 rounded">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            ${(metrics?.projected?.totalProfit ?? 194880).toLocaleString()}
          </div>
          <ProjectedProfitSparkline currentProfit={metrics?.projected?.totalProfit ?? 194880} />
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span className="text-emerald-400 font-bold">{metrics?.projected?.avgROI ?? 43.8}% avg ROI</span>
            <span>{metrics?.qualified ?? 6} active qualified</span>
          </div>
        </div>

        {/* Metric 2: Realized Closed Profit & Escrow Holds */}
        <div className="bg-[#0E1218] border border-slate-800 hover:border-slate-700 rounded-sm p-4 space-y-2 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="uppercase tracking-wider">REALIZED SETTLED PROFIT</span>
            <div className="p-1.5 bg-teal-950/60 text-teal-400 rounded">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            ${(metrics?.realized?.totalProfit ?? 54880).toLocaleString()}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span className="text-teal-400 font-bold">{metrics?.realized?.closedDealsCount ?? 2} deals realized</span>
            <span className="text-amber-400">$28.5k escrow hold</span>
          </div>
        </div>

        {/* Metric 3: PURSUE Opportunity Score */}
        <div className="bg-[#0E1218] border border-slate-800 hover:border-slate-700 rounded-sm p-4 space-y-2 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="uppercase tracking-wider">PURSUE WIN RATIO</span>
            <div className="p-1.5 bg-blue-950/60 text-blue-400 rounded">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-baseline gap-1.5">
            <span>{metrics?.qualified ?? 6}</span>
            <span className="text-xs text-slate-500 font-normal">/ {metrics?.analyzed ?? 8} analyzed</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span className="text-blue-400 font-bold">{metrics?.projected.avgScore ?? 88}/100 score</span>
            <span>75% pass criteria</span>
          </div>
        </div>

        {/* Metric 4: Autonomous Outreach & Lead Velocity */}
        <div className="bg-[#0E1218] border border-slate-800 hover:border-slate-700 rounded-sm p-4 space-y-2 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="uppercase tracking-wider">OUTREACH & VELOCITY</span>
            <div className="p-1.5 bg-purple-950/60 text-purple-400 rounded">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-baseline gap-1.5">
            <span>{metrics?.outreach ?? 2}</span>
            <span className="text-xs text-slate-500 font-normal">({metrics?.replies ?? 1} reply)</span>
          </div>
          <OutreachConversionSparkline replyRate={50} />
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span className="text-amber-400 font-bold">{metrics?.dailyOutreachCount ?? 2}/10 limit</span>
            <span className="text-emerald-400">50% reply rate</span>
          </div>
        </div>
      </div>

      {/* 3. Real Estate Deal Pipeline Lifecycle Stages (Interactive Filter) */}
      <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-4 sm:p-5 space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              REAL ESTATE DEAL LIFECYCLE FUNNEL
            </h2>
          </div>
          {selectedStage && (
            <button
              onClick={() => setSelectedStage(null)}
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Reset filter</span>
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {stages.map((stg) => {
            const isSelected = selectedStage === stg.id;
            return (
              <button
                key={stg.id}
                onClick={() => setSelectedStage(isSelected ? null : stg.id)}
                className={`p-3 rounded border text-left transition relative overflow-hidden ${
                  isSelected
                    ? "bg-slate-800 border-emerald-500 text-white shadow-lg"
                    : "bg-[#141922] border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className={`h-1 w-full absolute top-0 left-0 ${stg.color}`} />
                <div className="text-[10px] text-slate-400 truncate mt-1">{stg.label}</div>
                <div className="text-xl font-bold text-white mt-0.5">{stg.count}</div>
                <div className={`text-[9px] mt-1 ${stg.textCol}`}>
                  {isSelected ? "● FILTERING" : "View deals"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Strategy Portfolio Breakdown & Top Spotlight 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Top Opportunity Geometric Spotlight */}
        {topDeal && (
          <div className="lg:col-span-8 bg-[#0E1218] border border-slate-800 rounded-sm p-5 sm:p-6 space-y-5">
            {/* Header & Title */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold rounded">
                    ★ HIGHEST OPPORTUNITY SCORE
                  </span>
                  <span className="px-2 py-0.5 bg-slate-900 text-slate-300 border border-slate-700 text-[10px] font-mono rounded">
                    {topDeal.property.propertyType.replace("_", " ")}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {topDeal.property.address}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {topDeal.property.city}, {topDeal.property.state} • {topDeal.property.sqft?.toLocaleString()} SqFt • Built {topDeal.property.yearBuilt}
                </p>
              </div>

              {/* Score Box */}
              <div className="bg-slate-900 border border-slate-800 rounded p-3 text-right shrink-0">
                <div className="text-xs font-mono text-slate-400">DEAL SCORE</div>
                <div className="text-3xl font-bold text-white font-mono flex items-baseline justify-end gap-1">
                  <span className="text-emerald-400">{topDeal.dealScore}</span>
                  <span className="text-xs text-slate-500 font-normal">/100</span>
                </div>
                <div className="text-[10px] font-mono font-bold text-emerald-400">VERDICT: {topDeal.recommendation}</div>
              </div>
            </div>

            {/* 4 Financial Metric Callout Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-[#141922] border border-slate-800 rounded p-3">
                <div className="text-[10px] text-slate-400">PURCHASE PRICE</div>
                <div className="text-lg font-bold text-white mt-0.5">
                  ${(topDeal.financials?.purchasePrice ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">MAO: ${(topDeal.financials?.mao ?? 138400).toLocaleString()}</div>
              </div>

              <div className="bg-[#141922] border border-slate-800 rounded p-3">
                <div className="text-[10px] text-slate-400">EST. REHAB / REPAIR</div>
                <div className="text-lg font-bold text-amber-300 mt-0.5">
                  ${(topDeal.financials?.repairs ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">Cosmetic & Mechanical</div>
              </div>

              <div className="bg-[#141922] border border-slate-800 rounded p-3">
                <div className="text-[10px] text-slate-400">NET ASSIGNMENT PROFIT</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">
                  ${(topDeal.metrics?.projectedProfit ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-500">Immediate Wholesale Inflow</div>
              </div>

              <div className="bg-[#141922] border border-slate-800 rounded p-3">
                <div className="text-[10px] text-slate-400">PROJECTED ROI</div>
                <div className="text-lg font-bold text-emerald-300 mt-0.5">
                  {topDeal.metrics?.roi ?? 0}%
                </div>
                <div className="text-[10px] text-slate-500">Exit: ${(topDeal.financials?.expectedSalePrice ?? 0).toLocaleString()}</div>
              </div>
            </div>

            {/* Economic Blueprint & Agent Intel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              {/* Left Column: Economic Underwriting Blueprint */}
              <div className="bg-[#141922] border border-slate-800 rounded p-4 space-y-2.5 font-mono">
                <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800 pb-2">
                  <span className="text-[11px] uppercase tracking-wider">ECONOMIC BLUEPRINT</span>
                  <span className="text-[10px] text-emerald-400">0% EMD Clause Active</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Acquisition Price:</span>
                    <span className="text-slate-200">${(topDeal.financials?.purchasePrice ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Repairs:</span>
                    <span className="text-amber-300">${(topDeal.financials?.repairs ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Closing & Holding Costs:</span>
                    <span className="text-slate-200">
                      ${((topDeal.financials?.closingCosts ?? 0) + (topDeal.financials?.holdingCosts ?? 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1">
                    <span>Total Investment Basis:</span>
                    <span className="text-slate-200">${(topDeal.metrics?.totalInvestment ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-400 pt-1">
                    <span>Target ARV / Exit:</span>
                    <span>${(topDeal.financials?.expectedSalePrice ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Agent Intel & Audited Facts */}
              <div className="bg-[#141922] border border-slate-800 rounded p-4 space-y-2.5">
                <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800 pb-2 font-mono">
                  <span className="text-[11px] uppercase tracking-wider">COGNITIVE AGENT INTEL</span>
                  <span className="text-[10px] text-blue-400">Audited & Verified</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-slate-300 text-[11px]">
                      <strong className="text-white">Agent 2 Underwriter:</strong> Comps analyzed ({topDeal.property.comps?.length || 4} nearby sales). Clear equity spread confirmed.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-slate-300 text-[11px]">
                      <strong className="text-white">Agent 3 Outreach:</strong> Listing agent identified ({topDeal.property.listingAgent?.name || "Marcus Vance"}). Email sequence ready.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-slate-300 text-[11px]">
                      <strong className="text-white">Agent 4 Closer:</strong> Statutory legal contract generated with Subject-To / Double Close options.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Button Strip */}
            <div className="flex flex-wrap items-center gap-2 pt-2 font-mono text-xs">
              <button
                onClick={() => onSelectDeal(topDeal)}
                className="flex-1 min-w-[140px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-center transition"
              >
                APPROVE & PURSUE
              </button>
              <button
                onClick={() => onNavigateTab("closer")}
                className="py-2.5 px-4 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 rounded transition flex items-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>DESKTOP CLOSER</span>
              </button>
              <button
                onClick={() => onNavigateTab("investors")}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded transition flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>MATCH VIP BUYERS</span>
              </button>
              <button
                onClick={() => onNavigateTab("templates")}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>DISPATCH CONTRACT</span>
              </button>
            </div>
          </div>
        )}

        {/* Right 4 Cols: Strategy Breakdown & Real-Time Agent Feed */}
        <div className="lg:col-span-4 space-y-4">
          {/* Strategy Distribution */}
          <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-4 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                Strategy Distribution
              </span>
              <span className="text-[10px] text-slate-500">Portfolio Mix</span>
            </div>

            <div className="space-y-2">
              {strategyStats.map((strat, i) => (
                <div
                  key={i}
                  className="bg-[#141922] border border-slate-800/80 rounded p-2.5 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-[11px]">{strat.name}</span>
                    <span className="text-emerald-400 font-bold">${strat.projectedProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{strat.tag}</span>
                    <span className="text-slate-300">{strat.count} deals • {strat.avgDays}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Agent Activity Ledger */}
          <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-4 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Live Agent Audit Ledger
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE
              </span>
            </div>

            <div className="space-y-2.5">
              {recentActivities.map((act, i) => (
                <div key={i} className="bg-[#141922] border border-slate-800/80 rounded p-2.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-[11px]">{act.agent}</span>
                    <span className="text-[10px] text-slate-500">{act.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{act.text}</p>
                  <div className="pt-0.5">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${act.badge}`}>
                      {act.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Underwritten Opportunities Matrix & Explorer */}
      <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-5 space-y-4">
        {/* Matrix Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide font-sans">
                UNDERWRITTEN OPPORTUNITIES MATRIX
              </h2>
              <span className="px-2 py-0.5 bg-slate-900 text-slate-300 border border-slate-700 rounded font-mono text-[10px]">
                {filteredDeals.length} DEALS ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Audited by Autonomous Underwriting Agent 2 with real comps, MAO equations, and repair budgets.
            </p>
          </div>

          {/* Search & Filtering Controls */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {/* Search Input */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search address/city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Recommendation Filter */}
            <select
              value={selectedRecommendation}
              onChange={(e) => setSelectedRecommendation(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
            >
              <option value="ALL">All Verdicts</option>
              <option value="PURSUE">PURSUE Only</option>
              <option value="REVIEW">REVIEW</option>
              <option value="HIGH_RISK">HIGH RISK</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
            >
              <option value="SCORE">Sort: Score</option>
              <option value="PROFIT">Sort: Profit ($)</option>
              <option value="ROI">Sort: ROI (%)</option>
              <option value="PRICE">Sort: Price</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
              <button
                onClick={() => setViewMode("TABLE")}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                  viewMode === "TABLE" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode("CARDS")}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                  viewMode === "CARDS" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>

        {/* View Mode: TABLE */}
        {viewMode === "TABLE" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/40 uppercase text-[10px]">
                  <th className="p-3">Property & Location</th>
                  <th className="p-3">Purchase Price</th>
                  <th className="p-3">Est. Repairs</th>
                  <th className="p-3 text-right">Projected Profit</th>
                  <th className="p-3 text-center">ROI</th>
                  <th className="p-3 text-center">Score</th>
                  <th className="p-3 text-center">Verdict</th>
                  <th className="p-3 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredDeals.map((deal) => {
                  const recBadge =
                    deal.recommendation === "PURSUE"
                      ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                      : deal.recommendation === "REVIEW"
                      ? "bg-blue-950 text-blue-300 border-blue-500/40"
                      : "bg-amber-950 text-amber-300 border-amber-500/40";

                  return (
                    <tr
                      key={deal.id}
                      onClick={() => onSelectDeal(deal)}
                      className="hover:bg-slate-900/50 cursor-pointer transition"
                    >
                      <td className="p-3">
                        <div className="font-bold text-white text-sm font-sans">{deal.property.address}</div>
                        <div className="text-[10px] text-slate-400">
                          {deal.property.city}, {deal.property.state} • {deal.property.propertyType.replace("_", " ")}
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-100">
                        ${(deal.financials?.purchasePrice ?? 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-amber-300">
                        ${(deal.financials?.repairs ?? 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-400 text-sm">
                        +${(deal.metrics?.projectedProfit ?? 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-center text-emerald-300 font-bold">
                        {deal.metrics?.roi ?? 0}%
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-white">{deal.dealScore}</span>
                        <span className="text-[10px] text-slate-500">/100</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${recBadge}`}>
                          {deal.recommendation}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDeal(deal);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-[10px] font-bold"
                        >
                          INSPECT
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateTab("closer");
                          }}
                          className="px-2.5 py-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 rounded text-[10px] font-bold"
                        >
                          CLOSER
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* View Mode: CARDS */}
        {viewMode === "CARDS" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            {filteredDeals.map((deal) => {
              const recBadge =
                deal.recommendation === "PURSUE"
                  ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                  : deal.recommendation === "REVIEW"
                  ? "bg-blue-950 text-blue-300 border-blue-500/40"
                  : "bg-amber-950 text-amber-300 border-amber-500/40";

              return (
                <div
                  key={deal.id}
                  onClick={() => onSelectDeal(deal)}
                  className="bg-[#141922] border border-slate-800 hover:border-slate-700 rounded p-4 space-y-3 cursor-pointer transition flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${recBadge}`}>
                        {deal.recommendation} • {deal.dealScore}/100
                      </span>
                      <span className="text-emerald-400 font-bold text-sm">
                        +${(deal.metrics?.projectedProfit ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="font-bold text-white text-sm font-sans">{deal.property.address}</div>
                    <div className="text-[10px] text-slate-400">
                      {deal.property.city}, {deal.property.state} • {deal.property.propertyType.replace("_", " ")}
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] pt-2 border-t border-slate-800">
                    <div className="flex justify-between text-slate-400">
                      <span>Purchase:</span>
                      <span className="text-slate-200">${(deal.financials?.purchasePrice ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Repairs:</span>
                      <span className="text-amber-300">${(deal.financials?.repairs ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>ROI:</span>
                      <span className="text-emerald-400 font-bold">{deal.metrics?.roi ?? 0}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDeal(deal);
                      }}
                      className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold text-[10px]"
                    >
                      INSPECT
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateTab("closer");
                      }}
                      className="flex-1 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 rounded font-bold text-[10px]"
                    >
                      VIRTUAL CLOSER
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
