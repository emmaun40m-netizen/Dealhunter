import { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Maximize2,
  TrendingUp,
  Cpu,
  BarChart3,
  Server,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

export interface AgentSLAMetric {
  agentId: string;
  name: string;
  role: string;
  avgResponseSec: number;
  p99ResponseSec: number;
  slaTargetSec: number; // 15 seconds
  compliancePct: number;
  capacityLoadPct: number; // 0-100%
  status: "OPTIMAL" | "NEAR_CAPACITY" | "DEGRADED";
  totalRequestsServed: number;
  activeExecutions: number;
}

interface SLAComplianceMonitorWidgetProps {
  onPopout?: () => void;
  isDetached?: boolean;
}

export default function SLAComplianceMonitorWidget({
  onPopout,
  isDetached,
}: SLAComplianceMonitorWidgetProps) {
  // Agent SLA metrics against 15-second target
  const [agents, setAgents] = useState<AgentSLAMetric[]>([
    {
      agentId: "agent-1",
      name: "Agent 1: Lead Scanner",
      role: "MLS & Auction Ingestion",
      avgResponseSec: 3.2,
      p99ResponseSec: 7.8,
      slaTargetSec: 15.0,
      compliancePct: 99.4,
      capacityLoadPct: 64,
      status: "OPTIMAL",
      totalRequestsServed: 14820,
      activeExecutions: 8,
    },
    {
      agentId: "agent-2",
      name: "Agent 2: Desktop Analyst",
      role: "Underwriting & MAO Comp Engine",
      avgResponseSec: 4.6,
      p99ResponseSec: 9.4,
      slaTargetSec: 15.0,
      compliancePct: 98.9,
      capacityLoadPct: 78,
      status: "OPTIMAL",
      totalRequestsServed: 8430,
      activeExecutions: 14,
    },
    {
      agentId: "agent-3",
      name: "Agent 3: Outreach & Comms",
      role: "Multi-Channel Seller AI",
      avgResponseSec: 5.8,
      p99ResponseSec: 11.2,
      slaTargetSec: 15.0,
      compliancePct: 98.1,
      capacityLoadPct: 88, // Near capacity!
      status: "NEAR_CAPACITY",
      totalRequestsServed: 6190,
      activeExecutions: 22,
    },
    {
      agentId: "agent-4",
      name: "Agent 4: Virtual Closer",
      role: "Contract Generation & Escrow",
      avgResponseSec: 7.1,
      p99ResponseSec: 13.6,
      slaTargetSec: 15.0,
      compliancePct: 98.8,
      capacityLoadPct: 72,
      status: "OPTIMAL",
      totalRequestsServed: 3240,
      activeExecutions: 6,
    },
    {
      agentId: "agent-lb",
      name: "Agent L-B: Geo Load-Balancer",
      role: "Dynamic 30s Edge Rebalance",
      avgResponseSec: 1.1,
      p99ResponseSec: 2.8,
      slaTargetSec: 15.0,
      compliancePct: 100.0,
      capacityLoadPct: 34,
      status: "OPTIMAL",
      totalRequestsServed: 42100,
      activeExecutions: 4,
    },
  ]);

  // Overall Platform Compliance (Weighted average)
  const overallCompliancePct = useMemo(() => {
    const total = agents.reduce((acc, a) => acc + a.compliancePct, 0);
    return (total / agents.length).toFixed(1);
  }, [agents]);

  // Historical response timeline data for chart
  const [timelineData, setTimelineData] = useState([
    { time: "00:00", avgLatency: 4.1, p99Latency: 8.2, slaTarget: 15.0, compliance: 99.1 },
    { time: "00:05", avgLatency: 4.4, p99Latency: 8.9, slaTarget: 15.0, compliance: 98.9 },
    { time: "00:10", avgLatency: 5.2, p99Latency: 10.4, slaTarget: 15.0, compliance: 98.4 },
    { time: "00:15", avgLatency: 4.8, p99Latency: 9.6, slaTarget: 15.0, compliance: 98.8 },
    { time: "00:20", avgLatency: 4.2, p99Latency: 8.5, slaTarget: 15.0, compliance: 99.0 },
    { time: "00:25", avgLatency: 4.9, p99Latency: 10.1, slaTarget: 15.0, compliance: 98.6 },
    { time: "00:30", avgLatency: 4.5, p99Latency: 9.1, slaTarget: 15.0, compliance: 98.8 },
  ]);

  // Live simulation tick to update metrics slightly
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => {
          const jitter = (Math.random() - 0.5) * 0.4;
          const newAvg = Math.max(0.8, Number((agent.avgResponseSec + jitter).toFixed(1)));
          const isNearCap = agent.capacityLoadPct > 85;
          return {
            ...agent,
            avgResponseSec: newAvg,
            status: isNearCap ? "NEAR_CAPACITY" : "OPTIMAL",
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#0E1218] border border-slate-800 rounded-sm overflow-hidden font-mono text-xs">
      {/* Header bar */}
      <div className="p-3 bg-[#111620] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-950/80 border border-emerald-500/40 rounded text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide text-xs">
                SLA COMPLIANCE & AGENT RESPONSE MONITOR
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {overallCompliancePct}% OVERALL COMPLIANCE
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              15.0s Strict Response SLA Target • Real-Time Capacity & Latency Tracking
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

      {/* Main SLA Visual Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 overflow-y-auto">
        {/* Left 6 Columns: Agent Breakdown & Capacity Flags */}
        <div className="lg:col-span-6 p-3 space-y-3 bg-[#0B0E14] overflow-y-auto">
          <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold border-b border-slate-800 pb-1.5">
            <span>ACTIVE COGNITIVE AGENTS (15.0s TARGET)</span>
            <span className="text-slate-500 text-[10px]">AVG / P99 / CAPACITY</span>
          </div>

          <div className="space-y-2">
            {agents.map((agent) => {
              const isNearCap = agent.capacityLoadPct >= 85;
              const isSlaBreach = agent.avgResponseSec > 15.0;

              return (
                <div
                  key={agent.agentId}
                  className={`p-2.5 rounded border transition ${
                    isNearCap
                      ? "bg-amber-950/30 border-amber-500/50 text-amber-200"
                      : "bg-slate-900/60 border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-[11px]">{agent.name}</span>
                        {isNearCap && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-500/50 rounded flex items-center gap-0.5 font-bold animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            NEAR CAPACITY ({agent.capacityLoadPct}%)
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-[10px]">{agent.role}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-emerald-400 font-bold text-xs">
                        {agent.avgResponseSec.toFixed(1)}s{" "}
                        <span className="text-slate-500 font-normal text-[10px]">/ 15s</span>
                      </div>
                      <div className="text-slate-400 text-[9px]">
                        P99: {agent.p99ResponseSec.toFixed(1)}s • {agent.compliancePct}% SLA
                      </div>
                    </div>
                  </div>

                  {/* Progress / Capacity Bar */}
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>Agent Workload:</span>
                      <span>{agent.activeExecutions} active tasks ({agent.capacityLoadPct}% load)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isNearCap ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                        style={{ width: `${agent.capacityLoadPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 6 Columns: Latency vs SLA Target Horizon Chart & Key Stats */}
        <div className="lg:col-span-6 p-3 flex flex-col justify-between space-y-3 bg-[#0E1218]">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-500">Target Ceiling:</span>
              <div className="text-white font-bold text-sm">15.0s</div>
              <span className="text-emerald-400 text-[9px]">Hard SLA Limit</span>
            </div>
            <div className="p-2 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-500">Platform Mean:</span>
              <div className="text-emerald-400 font-bold text-sm">4.46s</div>
              <span className="text-slate-400 text-[9px]">3.3x Headroom</span>
            </div>
            <div className="p-2 bg-slate-900 border border-slate-800 rounded">
              <span className="text-slate-500">Total Invocations:</span>
              <div className="text-cyan-400 font-bold text-sm">74.8k</div>
              <span className="text-slate-400 text-[9px]">24h Volume</span>
            </div>
          </div>

          {/* Response Latency Horizon Chart */}
          <div className="flex-1 min-h-[170px] bg-[#0B0E14] border border-slate-800 rounded p-2 flex flex-col">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-cyan-400" />
                LATENCY HORIZON VS 15.0s CEILING
              </span>
              <span className="text-amber-400 font-bold">15s SLA Reference Line</span>
            </div>

            <div className="flex-1 w-full h-full min-h-[130px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="slaLatGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748B" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={9} domain={[0, 18]} tickLine={false} unit="s" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0B0E14",
                      borderColor: "#334155",
                      fontSize: "10px",
                      borderRadius: "2px",
                    }}
                  />
                  <ReferenceLine y={15} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: "15s SLA Target", fill: "#F59E0B", fontSize: 9, position: "insideTopRight" }} />
                  <Area
                    type="monotone"
                    dataKey="avgLatency"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#slaLatGrad)"
                    name="Avg Latency (s)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Compliance Guarantee Banner */}
          <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded text-[10px] flex items-center justify-between text-emerald-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>50-State High-Concurrency SLA: <strong>99.4% guaranteed uptime</strong></span>
            </span>
            <span className="text-slate-400">P99: 10.4s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
