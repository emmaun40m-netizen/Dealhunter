import React, { useState } from "react";
import {
  History,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Download,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";
import { ProfitSnapshot, RealizedDeal, Deal, DashboardMetrics } from "../types";
import { store } from "../services/store";

interface ProfitAnalyticsProps {
  snapshots: ProfitSnapshot[];
  realizedDeals: RealizedDeal[];
  deals: Deal[];
  metrics: DashboardMetrics | null;
  onRecordRealized: (params: {
    dealId: string;
    actualPurchasePrice: number;
    actualRepairs: number;
    actualSalePrice: number;
    actualClosingCosts: number;
    actualHoldingCosts: number;
    actualSellingCosts: number;
    closedDate: string;
    notes?: string;
  }) => Promise<void>;
  onRefresh: () => void;
}

export default function ProfitAnalytics({
  snapshots,
  realizedDeals,
  deals,
  metrics,
  onRecordRealized,
  onRefresh,
}: ProfitAnalyticsProps) {
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string>(deals[0]?.id || "");
  const [form, setForm] = useState({
    actualPurchasePrice: 38000,
    actualRepairs: 13500,
    actualSalePrice: 94000,
    actualClosingCosts: 2200,
    actualHoldingCosts: 1800,
    actualSellingCosts: 6800,
    closedDate: new Date().toISOString().split("T")[0],
    notes: "Closed on schedule with cash buyer.",
  });

  const handleDownloadCSV = () => {
    try {
      const csvData = store.exportProfitAnalyticsCSV();
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `dealhunter_realized_profit_audit_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to export CSV:", err);
    }
  };

  const handleSubmitRealized = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealId) return;

    await onRecordRealized({
      dealId: selectedDealId,
      ...form,
    });
    setShowRecordModal(false);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0E1218] border border-slate-800 rounded p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Rule 10 Profit Tracking
              </span>
              <span className="text-xs text-slate-500 font-mono">REALIZED YIELD AUDITS</span>
            </div>
            <h2 className="text-2xl font-light text-white tracking-tight mt-1 font-sans">
              Historical Profit Snapshots & Realized Yield Audits
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Audits projected vs. realized profits at every deal milestone with automated historical snapshot logs.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider rounded transition font-mono shadow-sm"
              title="Download formatted CSV of all realized deals and historical profit snapshots"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">CSV Exported!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download CSV</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowRecordModal(true)}
              className="flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded transition font-mono"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Closed Deal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Realized Profit Performance Table */}
      <div className="bg-[#0E1218] border border-slate-800 rounded overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm uppercase tracking-wide font-sans">
              Realized Closed Deals (Actual vs. Projected)
            </h3>
            <p className="text-xs text-slate-400 font-mono">Historical performance of fully executed transactions</p>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold">
            TOTAL REALIZED: ${(metrics?.realized?.totalProfit ?? 54880).toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161B22] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Closed Date</th>
                <th className="py-3 px-4">Actual Cost Basis</th>
                <th className="py-3 px-4">Actual Sale (ARV)</th>
                <th className="py-3 px-4">Projected Profit</th>
                <th className="py-3 px-4">Realized Profit</th>
                <th className="py-3 px-4">Variance</th>
                <th className="py-3 px-4">Actual ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
              {realizedDeals.map((rd) => {
                const isPositive = (rd.variance ?? 0) >= 0;
                return (
                  <tr key={rd.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 font-semibold text-white font-sans">
                      {rd.propertyAddress || "Property"}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {rd.closedDate}
                    </td>
                    <td className="py-3 px-4">
                      ${(rd.actualTotalInvestment ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-blue-300 font-semibold">
                      ${(rd.actualSalePrice ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      ${(rd.projectedProfit ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      ${(rd.realizedProfit ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span
                        className={`inline-flex items-center space-x-0.5 ${
                          isPositive ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isPositive ? "+" : ""}${(rd.variance ?? 0).toLocaleString()} ({rd.variancePercentage ?? 0}%)
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-teal-300">
                      {rd.realizedROI ?? 0}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Profit Snapshots */}
      <div className="bg-[#0E1218] border border-slate-800 rounded p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-white text-xs uppercase tracking-widest font-mono flex items-center space-x-2">
          <History className="w-4 h-4 text-emerald-400" />
          <span>Stage-by-Stage Profit Snapshots (Rule 10 Audit Log)</span>
        </h3>

        <div className="space-y-2 max-h-72 overflow-y-auto font-mono text-xs">
          {snapshots.map((s) => (
            <div
              key={s.id}
              className="p-3.5 bg-[#161B22] rounded border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white text-[11px]">
                    {new Date(s.timestamp || Date.now()).toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px] uppercase">
                    {s.stage}
                  </span>
                  <span className="text-slate-500 text-[11px]">• {s.dealId}</span>
                </div>
                <div className="text-slate-400 text-[11px] font-sans">{s.reason}</div>
              </div>

              <div className="flex items-center space-x-4 text-xs self-end sm:self-auto">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Projected Net:</span>
                  <span className="font-bold text-emerald-400">
                    ${(s.projectedProfit ?? 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">ROI:</span>
                  <span className="font-bold text-emerald-300">{s.roi ?? 0}%</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Total Capital:</span>
                  <span className="font-bold text-slate-300">
                    ${(s.totalInvestment ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Record Realized Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0E1218] border border-slate-700 rounded w-full max-w-lg p-6 shadow-2xl space-y-4 font-mono">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
              Record Realized Closed Deal
            </h3>
            <form onSubmit={handleSubmitRealized} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 text-[10px] uppercase mb-1">Select Deal:</label>
                <select
                  value={selectedDealId}
                  onChange={(e) => {
                    setSelectedDealId(e.target.value);
                    const d = deals.find((x) => x.id === e.target.value);
                    if (d) {
                      setForm((prev) => ({
                        ...prev,
                        actualPurchasePrice: d.financials?.purchasePrice ?? 0,
                        actualRepairs: d.financials?.repairs ?? 0,
                        actualSalePrice: d.financials?.expectedSalePrice ?? 0,
                      }));
                    }
                  }}
                  className="w-full bg-[#0B0E14] border border-slate-800 text-white rounded p-2 text-xs font-mono"
                >
                  {deals.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.property?.address} - Projected ${(d.metrics?.projectedProfit ?? 0).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 text-[10px] uppercase mb-1">Actual Purchase ($):</label>
                  <input
                    type="number"
                    value={form.actualPurchasePrice}
                    onChange={(e) => setForm({ ...form, actualPurchasePrice: Number(e.target.value) })}
                    className="w-full bg-[#0B0E14] border border-slate-800 text-white rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] uppercase mb-1">Actual Repairs ($):</label>
                  <input
                    type="number"
                    value={form.actualRepairs}
                    onChange={(e) => setForm({ ...form, actualRepairs: Number(e.target.value) })}
                    className="w-full bg-[#0B0E14] border border-slate-800 text-white rounded p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 text-[10px] uppercase mb-1">Actual Resale ($):</label>
                  <input
                    type="number"
                    value={form.actualSalePrice}
                    onChange={(e) => setForm({ ...form, actualSalePrice: Number(e.target.value) })}
                    className="w-full bg-[#0B0E14] border border-slate-800 text-white rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] uppercase mb-1">Closed Date:</label>
                  <input
                    type="date"
                    value={form.closedDate}
                    onChange={(e) => setForm({ ...form, closedDate: e.target.value })}
                    className="w-full bg-[#0B0E14] border border-slate-800 text-white rounded p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase tracking-wider"
                >
                  Confirm & Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
