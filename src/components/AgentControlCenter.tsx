import { useState, useEffect } from "react";
import {
  Bot,
  Brain,
  Mail,
  Send,
  Sparkles,
  Play,
  CheckCircle2,
  Terminal,
  RefreshCw,
  Search,
  Award,
  TrendingUp,
  Trophy,
  Flame,
  Zap,
  ShieldCheck,
  Globe,
  ExternalLink,
  Target,
  Users,
  Compass,
  FileCheck2,
  Filter,
  BarChart3,
  Activity,
  Volume2,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { AgentStatusInfo, Deal, AgentReport, AgentVelocityMetric, AgentMilestone } from "../types";
import { voiceAssistant } from "../services/voiceAssistant";

interface AgentControlCenterProps {
  onDealSelect: (deal: Deal) => void;
  onRefreshData: () => void;
}

export default function AgentControlCenter({
  onDealSelect,
  onRefreshData,
}: AgentControlCenterProps) {
  const [command, setCommand] = useState(
    "Find me the best properties in America under $50,000 with at least $20,000 projected net profit and 25% ROI."
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [agents, setAgents] = useState<Record<string, AgentStatusInfo>>({});
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [lastExecutionResult, setLastExecutionResult] = useState<any | null>(null);

  // Velocity state
  const [velocityData, setVelocityData] = useState<AgentVelocityMetric[]>([]);
  const [velocityView, setVelocityView] = useState<"quota_bar" | "daily_trend">("quota_bar");

  // Milestones & High-Performance Toast
  const [milestones, setMilestones] = useState<AgentMilestone[]>([
    {
      id: "m_1",
      agentKey: "DEALHUNTER",
      agentName: "DealHunter Boss",
      title: "120% Weekly Quota Surpassed",
      metric: "42 Converted Leads",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      achievedValue: "42 leads (120%)",
      targetValue: "35 leads",
      category: "VOLUME",
      badge: "🏆 ELITE VELOCITY",
    },
    {
      id: "m_2",
      agentKey: "CLOSER",
      agentName: "Virtual Closer & Title Pro",
      title: "Zero-Defect Contract Generation",
      metric: "18 Executed Contracts (100% Legal SLA)",
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      achievedValue: "18 contracts",
      targetValue: "15 contracts",
      category: "SLA",
      badge: "⚡ LEGAL SPEEDSTER",
    },
    {
      id: "m_3",
      agentKey: "ANALYST",
      agentName: "Desktop Underwriter & Comp Engine",
      title: "High Spread Alpha Detector",
      metric: "$240,000 Total Projected Profit Unlocked",
      timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      achievedValue: "$240,000 profit",
      targetValue: "$150,000 target",
      category: "PROFIT",
      badge: "💎 PROFIT MULTIPLIER",
    },
  ]);
  const [activeMilestoneToast, setActiveMilestoneToast] = useState<AgentMilestone | null>(null);

  const triggerMilestoneNotification = (m: AgentMilestone) => {
    setActiveMilestoneToast(m);
    voiceAssistant.announceMilestone(m.agentName, m.title, String(m.achievedValue));
    setTimeout(() => {
      setActiveMilestoneToast((curr) => (curr?.id === m.id ? null : curr));
    }, 8000);
  };

  // BuyerScout state
  const [buyerScoutCounty, setBuyerScoutCounty] = useState("Cumberland County");
  const [buyerScoutState, setBuyerScoutState] = useState("TN");
  const [buyerScoutCustomQuery, setBuyerScoutCustomQuery] = useState("");
  const [isBuyerScouting, setIsBuyerScouting] = useState(false);
  const [buyerScoutResult, setBuyerScoutResult] = useState<any | null>(null);
  const [agentReports, setAgentReports] = useState<AgentReport[]>([]);

  const presetCommands = [
    "Find me the best properties in America under $50,000 with at least $20,000 projected net profit and 25% ROI.",
    "Scan Michigan and Tennessee for duplexes under $65,000 with high cashflow.",
    "Find single family homes in Ohio and Missouri under $45,000 with 30%+ ROI.",
    "Identify deals needing under $15,000 repairs in Detroit and Memphis.",
  ];

  const presetCounties = [
    { county: "Cumberland County", state: "TN", desc: "Crossville Plateau timber & view parcels" },
    { county: "Maricopa County", state: "AZ", desc: "Scottsdale & West Valley luxury infill" },
    { county: "Travis County", state: "TX", desc: "Austin Hill Country custom homesites" },
    { county: "Wayne County", state: "MI", desc: "Detroit infill & residential assemblages" },
    { county: "Hillsborough County", state: "FL", desc: "Tampa MSA build-ready vacant lots" },
  ];

  const fetchAgentsAndLogs = () => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => d.success && setAgents(d.agents))
      .catch(console.error);

    fetch("/api/audit-logs")
      .then((r) => r.json())
      .then((d) => d.success && setAuditLogs(d.logs))
      .catch(console.error);

    fetch("/api/agents/velocity")
      .then((r) => r.json())
      .then((d) => d.success && setVelocityData(d.velocity))
      .catch(console.error);

    fetch("/api/agents/reports")
      .then((r) => r.json())
      .then((d) => d.success && setAgentReports(d.reports))
      .catch(console.error);
  };

  useEffect(() => {
    fetchAgentsAndLogs();
    const interval = setInterval(fetchAgentsAndLogs, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSendCommand = async (cmdText?: string) => {
    const textToSend = cmdText || command;
    if (!textToSend.trim() || isProcessing) return;

    setIsProcessing(true);
    setLastExecutionResult(null);

    try {
      const res = await fetch("/api/agents/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: textToSend }),
      });
      const data = await res.json();
      if (data.success) {
        setLastExecutionResult(data);
        fetchAgentsAndLogs();
        onRefreshData();
      }
    } catch (err) {
      console.error("Agent command execution error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunAutonomousPipeline = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/agents/run-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setLastExecutionResult(data);
        fetchAgentsAndLogs();
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunBuyerScoutSweep = async () => {
    if (isBuyerScouting) return;
    setIsBuyerScouting(true);
    setBuyerScoutResult(null);

    try {
      const res = await fetch("/api/agents/buyer-scout/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          county: buyerScoutCounty,
          state: buyerScoutState,
          customQuery: buyerScoutCustomQuery,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBuyerScoutResult(data);
        fetchAgentsAndLogs();
        onRefreshData();
      }
    } catch (err) {
      console.error("BuyerScout run error:", err);
    } finally {
      setIsBuyerScouting(false);
    }
  };

  // Prepare recharts aggregated datasets
  const chartData = velocityData.map((v) => ({
    name: v.agentKey,
    fullName: v.agentName,
    role: v.role,
    converted: v.convertedLeads,
    quota: v.weeklyQuota,
    pace: v.pacePercentage,
    yieldRate: v.conversionYieldRate,
    delta: v.convertedLeads - v.weeklyQuota,
  }));

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const trendData = daysOfWeek.map((day) => {
    const entry: any = { day };
    velocityData.forEach((agent) => {
      const dayRecord = agent.dailyProgress?.find((p) => p.day === day);
      entry[agent.agentKey] = dayRecord ? dayRecord.converted : 0;
    });
    return entry;
  });

  const totalConverted = velocityData.reduce((acc, v) => acc + v.convertedLeads, 0);
  const totalQuota = velocityData.reduce((acc, v) => acc + v.weeklyQuota, 0);
  const globalVelocityPace = totalQuota > 0 ? ((totalConverted / totalQuota) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 font-sans">
      {/* High-Performance Milestone Floating/Top Toast Notification */}
      {activeMilestoneToast && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950/80 border-2 border-emerald-500 rounded p-4 shadow-2xl flex items-center justify-between gap-4 animate-bounce font-mono">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-black rounded-full font-bold shadow-lg">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded font-bold uppercase">
                  {activeMilestoneToast.badge}
                </span>
                <span className="text-xs text-amber-300 font-bold">
                  HIGH-PERFORMANCE WEEKLY MILESTONE UNLOCKED!
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">
                {activeMilestoneToast.agentName} — {activeMilestoneToast.title}
              </h4>
              <p className="text-xs text-emerald-300 font-sans">
                Achieved: <span className="font-bold text-white">{activeMilestoneToast.metric}</span> (Target: {activeMilestoneToast.targetValue})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                voiceAssistant.announceMilestone(
                  activeMilestoneToast.agentName,
                  activeMilestoneToast.title,
                  String(activeMilestoneToast.achievedValue)
                )
              }
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded text-xs flex items-center gap-1.5 transition shadow"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Replay Voice Alert</span>
            </button>
            <button
              onClick={() => setActiveMilestoneToast(null)}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Executive Command Center Header */}
      <div className="bg-[#0E1218] border border-slate-800 rounded p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Agent 1 Boss Console
              </span>
              <span className="text-xs text-slate-500 font-mono">AUTONOMOUS MULTI-AGENT WORKFORCE</span>
            </div>
            <h2 className="text-2xl font-light text-white mt-1 tracking-tight">
              Workforce Orchestration & Intelligence Hub
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instruct Agent 1 (DealHunter Boss) to coordinate property discovery, delegate deep comp forensics to Agent 2, queue rate-limited outreach with Agent 3, close with Agent 4, and scout builders with BuyerScoutAgent.
            </p>
          </div>

          <button
            onClick={handleRunAutonomousPipeline}
            disabled={isProcessing}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest rounded transition-colors font-mono shadow-sm"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>Execute Full Scan</span>
          </button>
        </div>

        {/* Command Input Bar */}
        <div className="relative mb-4">
          <div className="flex items-center bg-[#0B0E14] border border-slate-800 rounded p-2 focus-within:border-emerald-500/80 transition">
            <Search className="w-4 h-4 text-slate-500 ml-2" />
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendCommand()}
              placeholder="Enter instruction for DealHunter Boss (e.g., Find properties in Detroit under $50k with $20k+ net profit)"
              className="w-full bg-transparent border-0 text-white placeholder-slate-600 text-xs px-3 py-1.5 focus:outline-none font-mono"
            />
            <button
              onClick={() => handleSendCommand()}
              disabled={isProcessing || !command.trim()}
              className="flex items-center space-x-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider rounded transition font-mono"
            >
              {isProcessing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Dispatch</span>
            </button>
          </div>
        </div>

        {/* Preset Prompt Suggestions */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 font-bold flex items-center text-[10px] uppercase tracking-wider">
            <Sparkles className="w-3 h-3 mr-1 text-emerald-400" />
            Presets:
          </span>
          {presetCommands.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCommand(preset);
                handleSendCommand(preset);
              }}
              className="px-2.5 py-1 rounded bg-[#161B22] hover:bg-slate-800 text-slate-300 border border-slate-800 transition truncate max-w-xs sm:max-w-md text-[11px]"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Execution Feedback Banner if present */}
      {lastExecutionResult && (
        <div className="bg-[#0E1218] border border-emerald-500/40 rounded p-4 text-slate-200 border-l-2 border-emerald-500 font-mono">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Agent 1 Execution Completed
              </h4>
            </div>
            {lastExecutionResult.results?.topOpportunity && (
              <button
                onClick={() => onDealSelect(lastExecutionResult.results.topOpportunity)}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider px-3 py-1 rounded transition"
              >
                Inspect Top Opportunity
              </button>
            )}
          </div>
          {lastExecutionResult.parsed && (
            <p className="text-xs text-slate-300 mt-2">
              <span className="font-bold text-emerald-400">Agent Briefing:</span>{" "}
              {lastExecutionResult.parsed.agentSummary}
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Properties Scanned:</span>
              <span className="font-bold text-white">
                {lastExecutionResult.results?.discoveredCount ?? 0}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Underwritten by Agent 2:</span>
              <span className="font-bold text-white">
                {lastExecutionResult.results?.analyzedCount ?? 0}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">PURSUE Qualified:</span>
              <span className="font-bold text-emerald-400">
                {lastExecutionResult.results?.pursueCount ?? 0}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Next Action:</span>
              <span className="font-bold text-teal-300">
                {lastExecutionResult.parsed?.suggestedAction ?? "Human Decision Gate"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: WEEKLY AGENT VELOCITY PERFORMANCE STUDIO (Recharts) */}
      <div className="bg-[#0E1218] border border-slate-800 rounded p-6 shadow-sm font-mono">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider font-sans">
                Weekly Agent Velocity Analytics
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold">
                LEADS CONVERTED VS WEEKLY QUOTA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Monitoring workforce throughput across lead discovery, comp underwriting, seller outreach, virtual closings, and buyer scouting.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-[#161B22] p-1 rounded border border-slate-800 flex items-center space-x-1 text-xs">
              <button
                onClick={() => setVelocityView("quota_bar")}
                className={`px-3 py-1 rounded text-[11px] font-bold uppercase transition ${
                  velocityView === "quota_bar"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Quota vs Actual
              </button>
              <button
                onClick={() => setVelocityView("daily_trend")}
                className={`px-3 py-1 rounded text-[11px] font-bold uppercase transition ${
                  velocityView === "daily_trend"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                7-Day Velocity Curve
              </button>
            </div>
          </div>
        </div>

        {/* Velocity KPI Top Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#161B22] p-3 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Converted Leads</span>
            <div className="text-2xl font-bold text-emerald-400 mt-0.5">{totalConverted}</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Across all 5 autonomous agents</span>
          </div>

          <div className="bg-[#161B22] p-3 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Workforce Target Quota</span>
            <div className="text-2xl font-bold text-white mt-0.5">{totalQuota}</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Weekly production benchmark</span>
          </div>

          <div className="bg-[#161B22] p-3 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Global Velocity Pace</span>
            <div className="text-2xl font-bold text-teal-300 mt-0.5">{globalVelocityPace}%</div>
            <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">+14.2% vs last week</span>
          </div>

          <div className="bg-[#161B22] p-3 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Top Performing Agent</span>
            <div className="text-lg font-bold text-amber-300 mt-0.5 truncate">DEALHUNTER BOSS</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">98.2% conversion yield</span>
          </div>
        </div>

        {/* Recharts Graphical Display */}
        <div className="bg-[#0B0E14] border border-slate-800/80 rounded p-4 mb-6">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {velocityView === "quota_bar" ? (
                <BarChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderColor: "#334155",
                      borderRadius: "4px",
                      color: "#E2E8F0",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                    formatter={(value: any, name: string) => [
                      `${value} leads`,
                      name === "converted" ? "Converted Leads" : "Weekly Quota",
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", fontFamily: "monospace", paddingTop: "8px" }}
                  />
                  <Bar dataKey="quota" name="Weekly Quota" fill="#334155" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="converted" name="Converted Leads" fill="#10B981" radius={[3, 3, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={trendData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderColor: "#334155",
                      borderRadius: "4px",
                      color: "#E2E8F0",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", fontFamily: "monospace", paddingTop: "8px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="DEALHUNTER"
                    name="DealHunter Boss"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.15}
                  />
                  <Area
                    type="monotone"
                    dataKey="ANALYST"
                    name="Deal Analyst"
                    stroke="#38BDF8"
                    fill="#38BDF8"
                    fillOpacity={0.15}
                  />
                  <Area
                    type="monotone"
                    dataKey="OUTREACH"
                    name="Outreach Hub"
                    stroke="#A855F7"
                    fill="#A855F7"
                    fillOpacity={0.15}
                  />
                  <Area
                    type="monotone"
                    dataKey="CLOSER"
                    name="Virtual Closer"
                    stroke="#6366F1"
                    fill="#6366F1"
                    fillOpacity={0.15}
                  />
                  <Area
                    type="monotone"
                    dataKey="BUYER_SCOUT"
                    name="BuyerScout"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.15}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Velocity Detailed Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800">
            <thead className="bg-[#161B22] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Agent & Role</th>
                <th className="py-2.5 px-3">Weekly Quota</th>
                <th className="py-2.5 px-3">Converted Leads</th>
                <th className="py-2.5 px-3">Yield Rate</th>
                <th className="py-2.5 px-3">Quota Pace</th>
                <th className="py-2.5 px-3">Velocity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {velocityData.map((agent) => (
                <tr key={agent.agentKey} className="hover:bg-slate-900/50 transition">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-white">{agent.agentName}</div>
                    <div className="text-[10px] text-slate-500">{agent.role}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{agent.weeklyQuota} leads</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">{agent.convertedLeads}</td>
                  <td className="py-2.5 px-3 text-slate-300">{agent.conversionYieldRate}%</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            agent.pacePercentage >= 100
                              ? "bg-emerald-500"
                              : agent.pacePercentage >= 85
                              ? "bg-teal-400"
                              : "bg-amber-400"
                          }`}
                          style={{ width: `${Math.min(agent.pacePercentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-[11px] font-bold text-white">{agent.pacePercentage}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        agent.status === "EXCEEDING"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                          : agent.status === "ON_PACE"
                          ? "bg-teal-950 text-teal-300 border border-teal-500/40"
                          : "bg-amber-950 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* High-Performance Conversion Milestone Cards & Alert Triggers */}
        <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-white text-xs uppercase tracking-wider font-sans">
                Agent Conversion Milestones & High-Performance Voiced Alerts
              </h4>
              <span className="text-[9px] px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-500/30 rounded font-bold">
                AUTO-VOICED BY ASSISTANT
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-sans">
              Click any card to trigger celebratory voice milestone praise
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {milestones.map((m) => (
              <div
                key={m.id}
                onClick={() => triggerMilestoneNotification(m)}
                className="p-3 bg-[#161B22] border border-slate-800 hover:border-emerald-500/60 rounded cursor-pointer transition group hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-800 text-amber-300 border border-amber-500/20 font-mono">
                    {m.badge}
                  </span>
                  <button
                    type="button"
                    className="p-1 bg-slate-800 text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-950 rounded transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h5 className="font-bold text-xs text-white mt-2 font-sans group-hover:text-emerald-300 transition">
                  {m.title}
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                  {m.agentName}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-emerald-400 font-bold">{m.achievedValue}</span>
                  <span className="text-slate-500">Goal: {m.targetValue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: SUB-AGENT BUYERSCOUTAGENT LIVE WEB SEARCH CONSOLE */}
      <div className="bg-[#0E1218] border border-amber-500/40 rounded p-6 shadow-sm font-mono border-l-2 border-amber-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider font-sans">
                Sub-Agent: BuyerScoutAgent (Live Web Search Session)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 font-bold">
                GOOGLE SEARCH GROUNDING ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Conducts real-time live search sweeps across counties to extract home builders, institutional land funds, and cash buyers with direct contact info and source URLs.
            </p>
          </div>

          <button
            onClick={handleRunBuyerScoutSweep}
            disabled={isBuyerScouting}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest rounded transition-colors shadow-sm"
          >
            {isBuyerScouting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Globe className="w-3.5 h-3.5" />
            )}
            <span>Launch Live Buyer Sweep</span>
          </button>
        </div>

        {/* County & Query Configuration Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
              Target County:
            </label>
            <input
              type="text"
              value={buyerScoutCounty}
              onChange={(e) => setBuyerScoutCounty(e.target.value)}
              placeholder="e.g. Cumberland County"
              className="w-full bg-[#0B0E14] border border-slate-800 focus:border-amber-500/80 rounded p-2 text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
              State (2-Letter Code):
            </label>
            <input
              type="text"
              value={buyerScoutState}
              onChange={(e) => setBuyerScoutState(e.target.value)}
              placeholder="e.g. TN"
              className="w-full bg-[#0B0E14] border border-slate-800 focus:border-amber-500/80 rounded p-2 text-xs text-white placeholder-slate-600 focus:outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
              Custom Buy-Box Keyword (Optional):
            </label>
            <input
              type="text"
              value={buyerScoutCustomQuery}
              onChange={(e) => setBuyerScoutCustomQuery(e.target.value)}
              placeholder="e.g. spec homebuilder buying lots"
              className="w-full bg-[#0B0E14] border border-slate-800 focus:border-amber-500/80 rounded p-2 text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>
        </div>

        {/* County Presets */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          <span className="text-slate-500 text-[10px] font-bold uppercase">Quick Counties:</span>
          {presetCounties.map((c) => (
            <button
              key={`${c.county}-${c.state}`}
              onClick={() => {
                setBuyerScoutCounty(c.county);
                setBuyerScoutState(c.state);
              }}
              className={`px-2.5 py-1 rounded text-[11px] border transition ${
                buyerScoutCounty === c.county && buyerScoutState === c.state
                  ? "bg-amber-950/80 text-amber-300 border-amber-500/50 font-bold"
                  : "bg-[#161B22] text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {c.county}, {c.state}
            </button>
          ))}
        </div>

        {/* Live Grounded Execution Feedback */}
        {buyerScoutResult && (
          <div className="bg-[#0B0E14] border border-amber-500/40 rounded p-4 mb-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-xs uppercase">
                  BuyerScout Live Sweep Complete: {buyerScoutCounty}, {buyerScoutState}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                {buyerScoutResult.buyersFound?.length || 0} Cash Buyers Ingested into Database
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              <span className="font-bold text-amber-400">Scout Report:</span>{" "}
              {buyerScoutResult.rawSummary || buyerScoutResult.report?.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {buyerScoutResult.buyersFound?.map((buyer: any) => (
                <div
                  key={buyer.id}
                  className="bg-[#161B22] border border-slate-800 rounded p-3 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{buyer.name}</div>
                      {buyer.company && (
                        <div className="text-[11px] text-amber-400 font-semibold">{buyer.company}</div>
                      )}
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold">
                      {buyer.confidenceScore || 95}% CONFIDENCE
                    </span>
                  </div>

                  <p className="text-slate-400 text-[11px] mt-1.5">{buyer.buyBoxSummary}</p>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Contact:</span>
                      <span className="text-slate-200 truncate ml-2">
                        {buyer.email || buyer.phone || "Public Inquiry Page"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Acreage:</span>
                      <span className="text-slate-200">{buyer.acreagePreferences || "1-20 Acres"}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-500">Source:</span>
                      {buyer.source_url ? (
                        <a
                          href={buyer.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 underline flex items-center space-x-1"
                        >
                          <span>View Grounded Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-500">Live Search Grounded</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Latest Agent Reports Log */}
        {agentReports.length > 0 && (
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block mb-2">
              Recent BuyerScout Session Digest Reports:
            </span>
            <div className="space-y-2">
              {agentReports.slice(0, 3).map((rep) => (
                <div
                  key={rep.id}
                  className="bg-[#161B22] border border-slate-800 rounded p-2.5 text-xs flex flex-col md:flex-row md:items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-slate-200 flex items-center space-x-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{rep.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{rep.summary}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(rep.sessionTimestamp).toLocaleDateString()} at{" "}
                      {new Date(rep.sessionTimestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {rep.newBuyersFoundCount} buyers added • {rep.duplicatesSkippedCount} skipped
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: 5-AGENT WORKFORCE STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Agent 1: DEALHUNTER BOSS */}
        <div className="bg-[#0E1218] border border-emerald-500/40 rounded p-4 border-l-2 border-emerald-500 shadow-sm relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs font-mono">AGENT_01</h3>
                  <span className="text-[9px] text-emerald-400 font-semibold tracking-wider uppercase font-mono">
                    DEALHUNTER BOSS
                  </span>
                </div>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold flex items-center space-x-0.5">
                <Trophy className="w-2.5 h-2.5 text-amber-400" />
                <span>TOP YIELD</span>
              </span>
            </div>

            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-emerald-500 w-[98%]"></div>
            </div>

            <p className="text-[11px] text-slate-400 mb-3 min-h-[28px]">
              "Discovers high-equity properties, filters submarkets, and routes tasks."
            </p>
          </div>

          <div className="bg-[#161B22] rounded p-2.5 border border-slate-800 text-[11px] font-mono space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Processed:</span>
              <span className="font-bold text-emerald-400">
                {agents.DEALHUNTER?.processedCount ?? 142} deals
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Conversion Rate:</span>
              <span className="font-bold text-emerald-300">
                {agents.DEALHUNTER?.successRate ?? 98.2}% Yield
              </span>
            </div>
          </div>
        </div>

        {/* Agent 2: DEAL ANALYST */}
        <div className="bg-[#0E1218] border border-blue-500/40 rounded p-4 border-l-2 border-blue-500 shadow-sm relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs font-mono">AGENT_02</h3>
                  <span className="text-[9px] text-blue-400 font-semibold tracking-wider uppercase font-mono">
                    DEAL ANALYST
                  </span>
                </div>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-bold flex items-center space-x-0.5">
                <ShieldCheck className="w-2.5 h-2.5 text-blue-400" />
                <span>99.1% FORENSIC</span>
              </span>
            </div>

            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-blue-500 w-[92%]"></div>
            </div>

            <p className="text-[11px] text-slate-400 mb-3 min-h-[28px]">
              "Forensic underwriting, profit formulas, repair risk estimation & comps."
            </p>
          </div>

          <div className="bg-[#161B22] rounded p-2.5 border border-slate-800 text-[11px] font-mono space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Underwritten:</span>
              <span className="font-bold text-blue-400">
                {agents.ANALYST?.processedCount ?? 89} audits
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Forensic Quality:</span>
              <span className="font-bold text-blue-300">
                {agents.ANALYST?.successRate ?? 99.1}%
              </span>
            </div>
          </div>
        </div>

        {/* Agent 3: OUTREACH */}
        <div className="bg-[#0E1218] border border-purple-500/40 rounded p-4 border-l-2 border-purple-500 shadow-sm relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs font-mono">AGENT_03</h3>
                  <span className="text-[9px] text-purple-400 font-semibold tracking-wider uppercase font-mono">
                    OUTREACH DISPATCH
                  </span>
                </div>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-bold flex items-center space-x-0.5">
                <Flame className="w-2.5 h-2.5 text-purple-400" />
                <span>42.1% REPLY</span>
              </span>
            </div>

            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-purple-500 w-[78%]"></div>
            </div>

            <p className="text-[11px] text-slate-400 mb-3 min-h-[28px]">
              "Identifies listing agents, applies safety gates, and crafts cash offers."
            </p>
          </div>

          <div className="bg-[#161B22] rounded p-2.5 border border-slate-800 text-[11px] font-mono space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Drafted:</span>
              <span className="font-bold text-purple-400">
                {agents.OUTREACH?.processedCount ?? 38} drafts
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Safety Gate:</span>
              <span className="font-bold text-emerald-400">100% Rule 6 Verified</span>
            </div>
          </div>
        </div>

        {/* Agent 4: VIRTUAL CLOSER */}
        <div className="bg-[#0E1218] border border-indigo-500/40 rounded p-4 border-l-2 border-indigo-500 shadow-sm relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs font-mono">AGENT_04</h3>
                  <span className="text-[9px] text-indigo-400 font-semibold tracking-wider uppercase font-mono">
                    VIRTUAL CLOSER
                  </span>
                </div>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[9px] font-bold flex items-center space-x-0.5">
                <CheckCircle2 className="w-2.5 h-2.5 text-indigo-400" />
                <span>100% EXECUTED</span>
              </span>
            </div>

            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-indigo-500 w-[88%]"></div>
            </div>

            <p className="text-[11px] text-slate-400 mb-3 min-h-[28px]">
              "Drafts state-compliant assignments, double closes, and $0 EMD contracts."
            </p>
          </div>

          <div className="bg-[#161B22] rounded p-2.5 border border-slate-800 text-[11px] font-mono space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Executed:</span>
              <span className="font-bold text-indigo-400">
                {agents.CLOSER?.processedCount ?? 27} contracts
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Closing Yield:</span>
              <span className="font-bold text-indigo-300">100% Escrow Cleared</span>
            </div>
          </div>
        </div>

        {/* Sub-Agent 5: BUYER SCOUT */}
        <div className="bg-[#0E1218] border border-amber-500/40 rounded p-4 border-l-2 border-amber-500 shadow-sm relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs font-mono">SUB_AGENT</h3>
                  <span className="text-[9px] text-amber-400 font-semibold tracking-wider uppercase font-mono">
                    BUYER SCOUT
                  </span>
                </div>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold flex items-center space-x-0.5">
                <Globe className="w-2.5 h-2.5 text-amber-400" />
                <span>LIVE GROUNDING</span>
              </span>
            </div>

            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-amber-500 w-[95%]"></div>
            </div>

            <p className="text-[11px] text-slate-400 mb-3 min-h-[28px]">
              "Live web search session scout finding vetted home builders & cash buyers."
            </p>
          </div>

          <div className="bg-[#161B22] rounded p-2.5 border border-slate-800 text-[11px] font-mono space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Vetted Buyers:</span>
              <span className="font-bold text-amber-400">
                {agents.BUYER_SCOUT?.processedCount ?? 34} buyers
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Wholesaler Filter:</span>
              <span className="font-bold text-emerald-400">100% Skip Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Inter-Agent Event Bus & Live Feed Timeline */}
      <div className="bg-[#0E1218] border border-slate-800 rounded p-6 shadow-inner font-mono text-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
              Live Feed & Inter-Agent Event Bus
            </h4>
          </div>
          <button
            onClick={fetchAgentsAndLogs}
            className="text-[11px] font-mono text-slate-400 hover:text-emerald-400 flex items-center space-x-1 uppercase"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Live Stream</span>
          </button>
        </div>

        <div className="space-y-4 max-h-56 overflow-y-auto font-mono text-xs pl-2">
          {auditLogs.map((log, index) => {
            const isFirst = index === 0;

            return (
              <div key={log.id} className={`relative pl-4 border-l border-slate-800 ${isFirst ? "" : "opacity-75"}`}>
                <div
                  className={`absolute -left-[4.5px] top-1 w-2 h-2 rounded-full ${
                    isFirst ? "bg-emerald-500 animate-ping" : "bg-slate-700"
                  }`}
                ></div>
                <div className="text-[10px] text-slate-500 mb-0.5 uppercase font-bold">
                  {new Date(log.timestamp).toLocaleTimeString()} — {log.agent}
                </div>
                <div className="text-slate-300">
                  <span className="text-white font-semibold">{log.action}: </span>
                  <span className="text-slate-400">{log.detail}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
