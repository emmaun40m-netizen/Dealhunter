import React, { useState } from "react";
import {
  Flame,
  TrendingUp,
  MapPin,
  DollarSign,
  Percent,
  Layers,
  ArrowUpRight,
  Filter,
  Maximize2,
  Building,
  TreePine,
  ChevronRight,
  Info,
} from "lucide-react";
import { ZipROIHeatmapData, Deal } from "../../types";
import { store } from "../../services/store";

interface ROIHeatmapWidgetProps {
  onSelectDeal?: (dealId: string) => void;
  onPopout?: () => void;
}

export default function ROIHeatmapWidget({ onSelectDeal, onPopout }: ROIHeatmapWidgetProps) {
  const [heatmapData, setHeatmapData] = useState<ZipROIHeatmapData[]>(() => store.getZipCodeHeatmapData());
  const [filterStrategy, setFilterStrategy] = useState<string>("ALL");
  const [selectedZipData, setSelectedZipData] = useState<ZipROIHeatmapData | null>(null);

  const filteredData = heatmapData.filter((item) => {
    if (filterStrategy === "ALL") return true;
    if (filterStrategy === "LAND") return item.primaryStrategy.toLowerCase().includes("land");
    if (filterStrategy === "RESIDENTIAL") return !item.primaryStrategy.toLowerCase().includes("land");
    if (filterStrategy === "ULTRA_HIGH") return item.avgROI >= 50;
    return true;
  });

  const totalPipelineProfit = heatmapData.reduce((acc, item) => acc + item.totalProjectedProfit, 0);
  const avgNationalROI =
    heatmapData.length > 0
      ? Math.round((heatmapData.reduce((acc, item) => acc + item.avgROI, 0) / heatmapData.length) * 10) / 10
      : 0;

  return (
    <div className="h-full flex flex-col bg-[#0E1218] border border-slate-800 rounded p-4 font-mono text-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-bold text-white text-xs tracking-wider">REAL ESTATE ROI HEATMAP</span>
          <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded text-[10px]">
            ZIP CODE MATRIX
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onPopout && (
            <button onClick={onPopout} className="text-slate-400 hover:text-white transition p-1" title="Popout Widget">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-[#161B22] p-2 rounded border border-slate-800">
          <span className="text-slate-500 text-[10px] block">Avg Submarket ROI:</span>
          <div className="text-emerald-400 font-bold text-sm flex items-center space-x-1">
            <Percent className="w-3.5 h-3.5" />
            <span>{avgNationalROI}%</span>
          </div>
        </div>
        <div className="bg-[#161B22] p-2 rounded border border-slate-800">
          <span className="text-slate-500 text-[10px] block">Top Submarket Profit:</span>
          <div className="text-teal-300 font-bold text-sm flex items-center space-x-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>${(totalPipelineProfit / 1000).toFixed(0)}k</span>
          </div>
        </div>
        <div className="bg-[#161B22] p-2 rounded border border-slate-800">
          <span className="text-slate-500 text-[10px] block">Monitored Zips:</span>
          <div className="text-white font-bold text-sm flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>{heatmapData.length} Target Clusters</span>
          </div>
        </div>
      </div>

      {/* Color Intensity Scale Legend */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded p-2 mb-3 flex items-center justify-between text-[10px]">
        <span className="text-slate-400 font-semibold">Yield Heat Scale:</span>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-emerald-400 text-[9px]">&gt;50% Ultra</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 rounded bg-teal-400 shadow-sm shadow-teal-500/50" />
            <span className="text-teal-300 text-[9px]">35-50% High</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 rounded bg-amber-400 shadow-sm shadow-amber-500/50" />
            <span className="text-amber-300 text-[9px]">25-35% Med</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-2.5 rounded bg-orange-500 shadow-sm shadow-orange-500/50" />
            <span className="text-orange-300 text-[9px]">15-25% Mod</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 mb-2 overflow-x-auto pb-1 text-[10px]">
        {[
          { id: "ALL", label: "All Submarkets" },
          { id: "ULTRA_HIGH", label: "🔥 Ultra-High ROI (>50%)" },
          { id: "LAND", label: "Land & Acreage" },
          { id: "RESIDENTIAL", label: "Turnkey & Single-Family" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStrategy(tab.id)}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition font-mono ${
              filterStrategy === tab.id
                ? "bg-slate-700 text-white font-bold border border-slate-600"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Heatmap Grid Cards */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filteredData.map((item) => (
            <div
              key={item.zip}
              onClick={() => setSelectedZipData(item)}
              className={`p-3 rounded border transition cursor-pointer flex flex-col justify-between hover:scale-[1.01] ${item.colorClass}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-base font-bold text-white font-mono tracking-tight">{item.zip}</span>
                    <span className="text-[10px] text-slate-300">({item.city}, {item.state})</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans block mt-0.5">{item.primaryStrategy}</span>
                </div>

                <div className="text-right">
                  <div className="text-base font-extrabold text-emerald-400 font-mono">
                    {item.avgROI}%
                  </div>
                  <span className="text-[9px] text-slate-400 uppercase block font-mono">AVG ROI</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-700/40 text-[10px]">
                <div>
                  <span className="text-slate-400 text-[9px] block">Avg Profit Spread:</span>
                  <span className="font-bold text-white">${item.avgProjectedProfit.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[9px] block">Discount Rate:</span>
                  <span className="font-bold text-teal-300">{item.avgDiscountRate}% below ARV</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submarket Drilldown Modal */}
      {selectedZipData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0E1218] border border-slate-800 rounded p-5 max-w-md w-full space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="font-bold text-white text-sm">
                  Submarket Underwriting: {selectedZipData.zip} ({selectedZipData.city}, {selectedZipData.state})
                </h3>
                <span className="text-[10px] text-emerald-400">{selectedZipData.primaryStrategy}</span>
              </div>
              <button onClick={() => setSelectedZipData(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px] py-1">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block">Avg ROI:</span>
                <span className="text-emerald-400 font-bold text-xs">{selectedZipData.avgROI}%</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block">Median ARV:</span>
                <span className="text-white font-bold text-xs">${selectedZipData.medianExpectedARV.toLocaleString()}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block">Discount Rate:</span>
                <span className="text-teal-300 font-bold text-xs">{selectedZipData.avgDiscountRate}%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Opportunities in Zip Code:</span>
              {selectedZipData.topDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between text-[11px]"
                >
                  <div>
                    <div className="font-bold text-white font-sans">{deal.address}</div>
                    <span className="text-slate-400 text-[10px] uppercase">{deal.propertyType}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold">${deal.profit.toLocaleString()} Net</div>
                    <div className="text-teal-300 text-[10px] font-bold">{deal.roi}% ROI</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedZipData(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
