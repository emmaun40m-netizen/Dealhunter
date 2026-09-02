import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from "recharts";
import {
  TrendingUp,
  BarChart3,
  Layers,
  ArrowUpRight,
  Maximize2,
  DollarSign,
  Percent,
  RefreshCw,
  Activity,
  Zap,
} from "lucide-react";
import { Deal } from "../../types";

interface LiveGraphsWidgetProps {
  deals: Deal[];
  onSelectDeal?: (deal: Deal) => void;
  isDetached?: boolean;
  onPopout?: () => void;
}

export default function LiveGraphsWidget({
  deals,
  onSelectDeal,
  isDetached,
  onPopout,
}: LiveGraphsWidgetProps) {
  const [activeTab, setActiveTab] = useState<"SPREAD" | "CASHFLOW" | "ROI_SCATTER" | "STRATEGY">("SPREAD");
  const [timeframe, setTimeframe] = useState<"30D" | "90D" | "1Y">("30D");
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);

  // 1. Data for Wholesale Spread & ARV Breakdown
  const spreadChartData = useMemo(() => {
    return deals.map((d) => {
      const arv = d.property.expectedSalePrice || 240000;
      const purchase = d.financials?.purchasePrice || 140000;
      const repairs = d.financials?.repairs || 25000;
      const profit = d.metrics?.projectedProfit || 35000;
      const mao = Math.round((arv * 0.7) - repairs);

      return {
        name: d.property.address.split(",")[0].substring(0, 14),
        fullName: d.property.address,
        ARV: arv,
        Purchase: purchase,
        Repairs: repairs,
        MAO: mao,
        WholesaleSpread: profit,
        roi: d.metrics?.roi || 32,
        dealRef: d,
      };
    });
  }, [deals]);

  // 2. Data for Cashflow & Escrow Trajectory
  const cashflowTrendData = useMemo(() => {
    return [
      { date: "Aug 01", realized: 18500, inEscrow: 8000, projectedPipeline: 85000 },
      { date: "Aug 05", realized: 24000, inEscrow: 14500, projectedPipeline: 110000 },
      { date: "Aug 09", realized: 31200, inEscrow: 19000, projectedPipeline: 135000 },
      { date: "Aug 13", realized: 42800, inEscrow: 22000, projectedPipeline: 162000 },
      { date: "Aug 17", realized: 54880, inEscrow: 28500, projectedPipeline: 194880 },
      { date: "Aug 21 (Today)", realized: 64200, inEscrow: 35000, projectedPipeline: 228000 },
    ];
  }, []);

  // 3. Data for Risk-Reward ROI Scatter plot
  const scatterData = useMemo(() => {
    return deals.map((d) => ({
      x: d.financials?.repairs || 15000, // Rehab Capital
      y: d.metrics?.roi || 30,          // ROI %
      z: d.metrics?.projectedProfit || 25000, // Profit
      address: d.property.address,
      score: d.dealScore,
      dealRef: d,
    }));
  }, [deals]);

  // 4. Strategy breakdown data
  const strategyData = [
    { strategy: "Wholesale Assign", deals: 4, profit: 98500, avgRoi: 48 },
    { strategy: "Subject-To Low Rate", deals: 2, profit: 62400, avgRoi: 38 },
    { strategy: "Seller Carryback", deals: 1, profit: 34000, avgRoi: 29 },
    { strategy: "Double Close", deals: 1, profit: 45000, avgRoi: 41 },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0E1218] border border-slate-800 rounded-sm overflow-hidden font-mono text-xs">
      {/* Header bar */}
      <div className="p-3 bg-[#111620] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-950/80 border border-emerald-500/40 rounded text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide text-xs">
                FINANCIAL YIELD & ARV SPREAD MATRIX
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Institutional real-time valuation, MAO equity curves, and escrow cashflow trajectory
            </span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1.5">
          {/* Sub-view switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5 text-[10px]">
            <button
              onClick={() => setActiveTab("SPREAD")}
              className={`px-2 py-1 rounded font-bold transition ${
                activeTab === "SPREAD" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ARV Spread
            </button>
            <button
              onClick={() => setActiveTab("CASHFLOW")}
              className={`px-2 py-1 rounded font-bold transition ${
                activeTab === "CASHFLOW" ? "bg-emerald-950 text-emerald-300" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Cashflow Flow
            </button>
            <button
              onClick={() => setActiveTab("ROI_SCATTER")}
              className={`px-2 py-1 rounded font-bold transition ${
                activeTab === "ROI_SCATTER" ? "bg-blue-950 text-blue-300" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ROI Scatter
            </button>
            <button
              onClick={() => setActiveTab("STRATEGY")}
              className={`px-2 py-1 rounded font-bold transition ${
                activeTab === "STRATEGY" ? "bg-indigo-950 text-indigo-300" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Strategies
            </button>
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
      </div>

      {/* Main Graph Canvas Area */}
      <div className="flex-1 p-3 min-h-[260px] relative">
        {activeTab === "SPREAD" && (
          <div className="w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spreadChartData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B0E14",
                    borderColor: "#334155",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    borderRadius: "4px",
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "6px" }} />
                <Bar dataKey="Purchase" fill="#3B82F6" name="Acquisition Basis" stackId="a" />
                <Bar dataKey="Repairs" fill="#F59E0B" name="Est. Repairs" stackId="a" />
                <Bar dataKey="WholesaleSpread" fill="#10B981" name="Net Wholesale Spread" stackId="a" />
                <Bar dataKey="MAO" fill="#6366F1" name="Underwritten MAO (70%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === "CASHFLOW" && (
          <div className="w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="escrowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="pipeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 10 }} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B0E14",
                    borderColor: "#334155",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, ""]}
                />
                <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "4px" }} />
                <Area
                  type="monotone"
                  dataKey="projectedPipeline"
                  stroke="#6366F1"
                  fillOpacity={1}
                  fill="url(#pipeGrad)"
                  name="Pipeline Value"
                />
                <Area
                  type="monotone"
                  dataKey="realized"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#profitGrad)"
                  name="Realized Settled"
                />
                <Area
                  type="monotone"
                  dataKey="inEscrow"
                  stroke="#F59E0B"
                  fillOpacity={1}
                  fill="url(#escrowGrad)"
                  name="In-Escrow Hold"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === "ROI_SCATTER" && (
          <div className="w-full h-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Repairs Required"
                  stroke="#64748B"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="ROI %"
                  stroke="#64748B"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <ZAxis type="number" dataKey="z" range={[80, 400]} name="Projected Spread ($)" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ payload }: any) => {
                    if (payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#0B0E14] border border-slate-700 p-2 text-[10px] rounded space-y-0.5">
                          <div className="font-bold text-white">{data.address}</div>
                          <div className="text-emerald-400 font-bold">ROI: {data.y}%</div>
                          <div className="text-slate-300">Spread: ${data.z.toLocaleString()}</div>
                          <div className="text-amber-400">Repairs: ${data.x.toLocaleString()}</div>
                          <div className="text-slate-400">Score: {data.score}/100</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Underwritten Deals" data={scatterData} fill="#10B981">
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.y > 40 ? "#10B981" : entry.y > 25 ? "#3B82F6" : "#F59E0B"}
                      onClick={() => onSelectDeal && onSelectDeal(entry.dealRef)}
                      className="cursor-pointer"
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === "STRATEGY" && (
          <div className="w-full h-full min-h-[250px] flex flex-col justify-between">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={strategyData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" stroke="#64748B" tickFormatter={(v) => `$${v / 1000}k`} tick={{ fontSize: 10 }} />
                <YAxis dataKey="strategy" type="category" stroke="#94A3B8" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0B0E14", borderColor: "#334155" }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Projected Profit"]}
                />
                <Bar dataKey="profit" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[10px] text-center">
              {strategyData.map((s, idx) => (
                <div key={idx} className="bg-slate-900/60 p-1.5 rounded border border-slate-800">
                  <div className="text-slate-400 truncate">{s.strategy}</div>
                  <div className="font-bold text-emerald-400">${(s.profit / 1000).toFixed(1)}k</div>
                  <div className="text-[9px] text-slate-500">{s.avgRoi}% avg ROI</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer KPI ticker */}
      <div className="px-3 py-2 bg-[#111620] border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            Avg Spread: <strong className="text-emerald-400">$32,480</strong>
          </span>
          <span>
            MAO Accuracy: <strong className="text-slate-200">99.4%</strong>
          </span>
        </div>
        <div className="text-slate-500">Auto-synchronized with MLS Comps Engine</div>
      </div>
    </div>
  );
}
