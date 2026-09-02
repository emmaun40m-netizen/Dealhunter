import { useState, useEffect } from "react";
import {
  Globe,
  Radio,
  Zap,
  RotateCcw,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Server,
  Layers,
  Cpu,
  RefreshCw,
  Sliders,
  Volume2,
} from "lucide-react";
import { voiceAssistant } from "../../services/voiceAssistant";

export interface EdgeNode {
  id: string;
  name: string;
  regionCode: string;
  location: string;
  coordinates: { x: number; y: number }; // Percentage on canvas (0-100)
  latencyMs: number;
  trafficPct: number;
  activeRequests: number;
  health: "HEALTHY" | "DEGRADED" | "HEALING" | "OPTIMIZING";
  packetLoss: number;
  lastRebalanced: string;
}

export interface TroubleshootingLog {
  id: string;
  timestamp: string;
  node: string;
  type: "REBALANCE" | "AUTO_HEAL" | "LATENCY_SPIKE" | "FAILOVER" | "ROUTING_OPT";
  message: string;
  resolvedInSec?: number;
  status: "RESOLVED" | "IN_PROGRESS" | "MONITORING";
}

interface GlobalTrafficMapWidgetProps {
  onPopout?: () => void;
  isDetached?: boolean;
}

export default function GlobalTrafficMapWidget({
  onPopout,
  isDetached,
}: GlobalTrafficMapWidgetProps) {
  // Edge Nodes State
  const [nodes, setNodes] = useState<EdgeNode[]>([
    {
      id: "us-east",
      name: "US-East (N. Virginia)",
      regionCode: "iad-1",
      location: "Ashburn, VA",
      coordinates: { x: 28, y: 36 },
      latencyMs: 14,
      trafficPct: 42,
      activeRequests: 1842,
      health: "HEALTHY",
      packetLoss: 0.0,
      lastRebalanced: "12s ago",
    },
    {
      id: "us-west",
      name: "US-West (Oregon)",
      regionCode: "pdx-1",
      location: "Boardman, OR",
      coordinates: { x: 18, y: 34 },
      latencyMs: 28,
      trafficPct: 26,
      activeRequests: 1140,
      health: "HEALTHY",
      packetLoss: 0.01,
      lastRebalanced: "12s ago",
    },
    {
      id: "eu-central",
      name: "EU-Central (Frankfurt)",
      regionCode: "fra-1",
      location: "Frankfurt, DE",
      coordinates: { x: 52, y: 30 },
      latencyMs: 74,
      trafficPct: 18,
      activeRequests: 790,
      health: "HEALTHY",
      packetLoss: 0.02,
      lastRebalanced: "12s ago",
    },
    {
      id: "ap-north",
      name: "AP-North (Tokyo)",
      regionCode: "nrt-1",
      location: "Tokyo, JP",
      coordinates: { x: 82, y: 38 },
      latencyMs: 112,
      trafficPct: 14,
      activeRequests: 615,
      health: "HEALTHY",
      packetLoss: 0.04,
      lastRebalanced: "12s ago",
    },
  ]);

  // Load Balancing Agent Timers & Live State
  const [rebalanceCountdown, setRebalanceCountdown] = useState<number>(30);
  const [activeHealingTask, setActiveHealingTask] = useState<{
    nodeId: string;
    secondsRemaining: number;
    issue: string;
  } | null>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string>("us-east");

  const [troubleshootingLogs, setTroubleshootingLogs] = useState<TroubleshootingLog[]>([
    {
      id: "log-1",
      timestamp: "Just now",
      node: "US-East (iad-1)",
      type: "REBALANCE",
      message: "Automated 30s geo-rebalance: dynamically optimized ingress weight (42% allocation).",
      status: "RESOLVED",
    },
    {
      id: "log-2",
      timestamp: "45s ago",
      node: "AP-North (nrt-1)",
      type: "AUTO_HEAL",
      message: "Tenant TLS handshake latency jitter mitigated via Edge BGP route reroute.",
      resolvedInSec: 8,
      status: "RESOLVED",
    },
    {
      id: "log-3",
      timestamp: "2m ago",
      node: "EU-Central (fra-1)",
      type: "ROUTING_OPT",
      message: "Direct fiber peering established. Latency trimmed by 12ms to 74ms.",
      status: "RESOLVED",
    },
  ]);

  // 30-Second Automated Geographic Rebalance Cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setRebalanceCountdown((prev) => {
        if (prev <= 1) {
          // Trigger automated rebalance
          performAutomatedRebalance();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 15-Second Auto-Fix / Self-Healing Countdown
  useEffect(() => {
    if (!activeHealingTask) return;

    const healTimer = setInterval(() => {
      setActiveHealingTask((current) => {
        if (!current) return null;
        if (current.secondsRemaining <= 1) {
          // Healed! Restore node health
          setNodes((prevNodes) =>
            prevNodes.map((n) =>
              n.id === current.nodeId
                ? {
                    ...n,
                    health: "HEALTHY",
                    latencyMs: Math.max(14, n.latencyMs - 45),
                    packetLoss: 0.0,
                  }
                : n
            )
          );

          // Append resolved log
          const newLog: TroubleshootingLog = {
            id: `log-heal-${Date.now()}`,
            timestamp: "Just now",
            node: current.nodeId.toUpperCase(),
            type: "AUTO_HEAL",
            message: `Tenant platform issue resolved automatically in 15s. Edge node restored to 100% SLA.`,
            resolvedInSec: 15,
            status: "RESOLVED",
          };
          setTroubleshootingLogs((prev) => [newLog, ...prev.slice(0, 14)]);
          voiceAssistant.announceTroubleshooting("Load-Balancer Agent", "Platform Auto-Fix Resolved in 15s");
          return null;
        }

        return {
          ...current,
          secondsRemaining: current.secondsRemaining - 1,
        };
      });
    }, 1000);

    return () => clearInterval(healTimer);
  }, [activeHealingTask]);

  // Execute Geographic Rebalance
  const performAutomatedRebalance = () => {
    setNodes((prev) =>
      prev.map((n) => {
        // Minor natural variance
        const jitter = Math.floor((Math.random() - 0.5) * 4);
        const newLatency = Math.max(10, n.latencyMs + jitter);
        return {
          ...n,
          latencyMs: newLatency,
          lastRebalanced: "Just now",
        };
      })
    );

    const rebalanceLog: TroubleshootingLog = {
      id: `log-reb-${Date.now()}`,
      timestamp: "Just now",
      node: "GLOBAL-MESH",
      type: "REBALANCE",
      message: `30s Periodic Load Rebalance complete. Active connections redistributed across 4 edge clusters.`,
      status: "RESOLVED",
    };
    setTroubleshootingLogs((prev) => [rebalanceLog, ...prev.slice(0, 14)]);
  };

  // Simulate an edge issue to test 15-second Auto-Healing Agent
  const triggerSimulatedIssue = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              health: "HEALING",
              latencyMs: n.latencyMs + 65,
              packetLoss: 0.08,
            }
          : n
      )
    );

    setActiveHealingTask({
      nodeId,
      secondsRemaining: 15,
      issue: "Simulated Tenant API Gateway Queue Congestion",
    });

    const issueLog: TroubleshootingLog = {
      id: `log-issue-${Date.now()}`,
      timestamp: "Just now",
      node: nodeId.toUpperCase(),
      type: "LATENCY_SPIKE",
      message: `Anomaly detected on ${nodeId.toUpperCase()}. Auto-Fix Load Balancer initiated 15-second self-healing procedure.`,
      status: "IN_PROGRESS",
    };
    setTroubleshootingLogs((prev) => [issueLog, ...prev.slice(0, 14)]);
    voiceAssistant.playChime("alert");
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const totalRequests = nodes.reduce((sum, n) => sum + n.activeRequests, 0);

  return (
    <div className="h-full flex flex-col bg-[#0E1218] border border-slate-800 rounded-sm overflow-hidden font-mono text-xs">
      {/* Header bar */}
      <div className="p-3 bg-[#111620] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-950/80 border border-cyan-500/40 rounded text-cyan-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide text-xs">
                GLOBAL TRAFFIC DISTRIBUTION & LOAD-BALANCING AGENT
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-500/30 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                4 REGIONAL EDGES
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Autonomous 30s geographic rebalancing & 15s self-healing tenant platform auto-remediation
            </span>
          </div>
        </div>

        {/* Action Controls & Timers */}
        <div className="flex items-center gap-2">
          {/* 30s Rebalance Live Meter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-[10px]">
            <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
            <span className="text-slate-400">Next Geo-Rebalance:</span>
            <span className="text-emerald-400 font-bold">{rebalanceCountdown}s</span>
          </div>

          <button
            onClick={performAutomatedRebalance}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded text-[10px] font-bold transition flex items-center gap-1"
            title="Force immediate geographic redistribution"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Force Rebalance</span>
          </button>

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
      </div>

      {/* Active Self-Healing Banner (if an issue is being resolved within 15s) */}
      {activeHealingTask && (
        <div className="px-3 py-2 bg-amber-950/60 border-b border-amber-500/40 flex items-center justify-between text-[11px] animate-pulse">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>
              <strong>Auto-Fix Agent Active:</strong> Remediating {activeHealingTask.issue} on{" "}
              {activeHealingTask.nodeId.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 bg-slate-900 h-2 rounded overflow-hidden border border-amber-500/30">
              <div
                className="bg-amber-400 h-full transition-all duration-1000"
                style={{
                  width: `${((15 - activeHealingTask.secondsRemaining) / 15) * 100}%`,
                }}
              />
            </div>
            <span className="font-bold text-amber-400">
              {activeHealingTask.secondsRemaining}s remaining (15s SLA Target)
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Interactive Vector World Heatmap (Top) + Regional Nodes & Live Troubleshooting Log (Bottom) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 overflow-y-auto">
        {/* Left 7 Columns: Interactive Global Heatmap & Route Mesh */}
        <div className="lg:col-span-7 p-3 flex flex-col justify-between space-y-3 bg-[#0B0E14]">
          {/* Vector Map Canvas */}
          <div className="relative w-full h-[210px] bg-[#070A0F] border border-slate-800 rounded-sm overflow-hidden p-2 select-none">
            {/* Grid overlay & World Latitude Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#141E2E15_1px,transparent_1px),linear-gradient(to_bottom,#141E2E15_1px,transparent_1px)] bg-[size:16px_16px]" />
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <Globe className="w-48 h-48 text-cyan-400" />
            </div>

            {/* Pulsing Inter-Region Fiber Lines (SVG vectors connecting nodes) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="fiberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#10B981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              {/* US-West to US-East */}
              <line x1="18%" y1="34%" x2="28%" y2="36%" stroke="url(#fiberGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* US-East to EU-Central */}
              <line x1="28%" y1="36%" x2="52%" y2="30%" stroke="url(#fiberGrad)" strokeWidth="1.5" strokeDasharray="4 2" />
              {/* EU-Central to AP-North */}
              <line x1="52%" y1="30%" x2="82%" y2="38%" stroke="url(#fiberGrad)" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* AP-North to US-West (Trans-Pacific loop) */}
              <path d="M 82% 38% Q 95% 20% 99% 30%" stroke="#06B6D4" strokeWidth="1" strokeDasharray="2 2" fill="none" opacity="0.5" />
              <path d="M 1% 30% Q 8% 20% 18% 34%" stroke="#06B6D4" strokeWidth="1" strokeDasharray="2 2" fill="none" opacity="0.5" />
            </svg>

            {/* Regional Node Markers */}
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHealing = node.health === "HEALING";

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{
                    left: `${node.coordinates.x}%`,
                    top: `${node.coordinates.y}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10 transition-all ${
                    isSelected ? "scale-110" : "hover:scale-105"
                  }`}
                >
                  {/* Ping Waves */}
                  <div
                    className={`absolute -inset-2 rounded-full opacity-40 animate-ping ${
                      isHealing ? "bg-amber-400" : "bg-cyan-400"
                    }`}
                  />
                  {/* Node Dot */}
                  <div
                    className={`relative w-4 h-4 rounded-full border-2 flex items-center justify-center shadow-lg ${
                      isHealing
                        ? "bg-amber-500 border-amber-200"
                        : isSelected
                        ? "bg-cyan-400 border-white"
                        : "bg-slate-900 border-cyan-400"
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  {/* Node Label Tooltip Card */}
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-[#0B0E14]/95 border border-slate-700 px-2 py-1 rounded text-[9px] whitespace-nowrap shadow-xl">
                    <div className="font-bold text-white flex items-center gap-1">
                      <span>{node.regionCode.toUpperCase()}</span>
                      <span className="text-emerald-400">{node.latencyMs}ms</span>
                    </div>
                    <div className="text-slate-400">{node.trafficPct}% traffic</div>
                  </div>
                </div>
              );
            })}

            {/* Bottom Status Ribbon on Vector Map */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] text-slate-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Aggregated Ingress: <strong>{totalRequests.toLocaleString()} req/s</strong></span>
              </span>
              <span>Global Packet Loss: <strong>0.01%</strong></span>
              <span>BGP Edge Anycast: <strong>ACTIVE</strong></span>
            </div>
          </div>

          {/* Regional Edge Nodes Summary Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-2 rounded border cursor-pointer transition ${
                    isSelected
                      ? "bg-cyan-950/60 border-cyan-500 text-white"
                      : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{node.regionCode.toUpperCase()}</span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                        node.health === "HEALING"
                          ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {node.health}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[9px] truncate">{node.location}</div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-emerald-400 font-bold text-xs">{node.latencyMs}ms</span>
                    <span className="text-slate-400">{node.trafficPct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Columns: Selected Edge Node Detail & Live Troubleshooting Log */}
        <div className="lg:col-span-5 p-3 flex flex-col justify-between space-y-3 bg-[#0E1218]">
          {/* Node Inspector & Auto-Fix Simulation Trigger */}
          <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-300 font-bold border-b border-slate-800 pb-1">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedNode.name}</span>
              </span>
              <button
                onClick={() => triggerSimulatedIssue(selectedNode.id)}
                disabled={activeHealingTask !== null}
                className="text-amber-400 hover:text-amber-300 text-[9px] underline flex items-center gap-0.5"
                title="Inject a latency spike to watch 15-second self-healing in action"
              >
                <span>Simulate Anomaly (Test 15s Auto-Fix)</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-slate-500">RTT Latency:</span>
                <div className="text-emerald-400 font-bold text-xs">{selectedNode.latencyMs} ms</div>
              </div>
              <div>
                <span className="text-slate-500">Traffic Allocation:</span>
                <div className="text-white font-bold text-xs">{selectedNode.trafficPct}%</div>
              </div>
              <div>
                <span className="text-slate-500">Active Handshakes:</span>
                <div className="text-slate-200 font-bold">{selectedNode.activeRequests.toLocaleString()} req/s</div>
              </div>
              <div>
                <span className="text-slate-500">Packet Loss Rate:</span>
                <div className="text-emerald-400 font-bold">{(selectedNode.packetLoss * 100).toFixed(2)}%</div>
              </div>
            </div>
          </div>

          {/* Live Troubleshooting & Anomaly Log Stream */}
          <div className="space-y-1.5 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-slate-300 font-bold">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span>LIVE LOAD-BALANCER AUTO-TROUBLESHOOTING LOG</span>
              </span>
              <span className="text-slate-500 text-[9px]">15s Auto-Fix Engine</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded p-2 max-h-[140px] overflow-y-auto space-y-1.5 text-[10px]">
              {troubleshootingLogs.map((log) => (
                <div key={log.id} className="p-1.5 bg-slate-900/60 rounded border border-slate-800/80 space-y-0.5">
                  <div className="flex items-center justify-between text-[9px]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1 py-0.1 rounded font-bold ${
                          log.type === "AUTO_HEAL"
                            ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                            : log.type === "REBALANCE"
                            ? "bg-cyan-950 text-cyan-300 border border-cyan-500/40"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {log.type}
                      </span>
                      <span className="text-slate-400">{log.node}</span>
                    </div>
                    <span className="text-slate-500">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-300 text-[10px] leading-snug">{log.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="px-3 py-1.5 bg-[#111620] border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
        <span>Mesh Protocol: BGP Anycast v6</span>
        <span>Auto-Remediation SLA: 100% (&lt;15s)</span>
      </div>
    </div>
  );
}
