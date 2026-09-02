import { useState, useEffect } from "react";
import {
  X,
  Calculator,
  AlertTriangle,
  FileText,
  Mail,
  Users,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Sparkles,
  Zap,
  Trees,
  Home,
} from "lucide-react";
import { Deal, DealInput } from "../types";
import { calculateDealProfit, calculateDealScore, getRecommendation } from "../services/profitEngine";

// Regional material & labor cost indices
const REGIONAL_MATERIAL_COST_INDEX: Record<string, { multiplier: number; label: string; landClearingPerAcre: number; sfhCostPerSqFt: number }> = {
  MI: { multiplier: 1.02, label: "Great Lakes Regional", landClearingPerAcre: 3100, sfhCostPerSqFt: 28 },
  TN: { multiplier: 0.94, label: "Southeast Regional", landClearingPerAcre: 2600, sfhCostPerSqFt: 24 },
  OH: { multiplier: 0.98, label: "Midwest Rustbelt", landClearingPerAcre: 2800, sfhCostPerSqFt: 26 },
  FL: { multiplier: 1.12, label: "Florida Coastal/Windstorm", landClearingPerAcre: 3600, sfhCostPerSqFt: 34 },
  TX: { multiplier: 0.96, label: "Texas Sunbelt", landClearingPerAcre: 2700, sfhCostPerSqFt: 25 },
  AZ: { multiplier: 1.05, label: "Southwest Desert Grading", landClearingPerAcre: 3200, sfhCostPerSqFt: 30 },
  NY: { multiplier: 1.28, label: "Northeast Metro", landClearingPerAcre: 4500, sfhCostPerSqFt: 42 },
  MD: { multiplier: 1.15, label: "Mid-Atlantic Corridor", landClearingPerAcre: 3700, sfhCostPerSqFt: 33 },
  AL: { multiplier: 0.90, label: "Deep South", landClearingPerAcre: 2400, sfhCostPerSqFt: 22 },
  MO: { multiplier: 0.95, label: "Central Midwest", landClearingPerAcre: 2650, sfhCostPerSqFt: 25 },
  IN: { multiplier: 0.97, label: "Midwest Sub-Market", landClearingPerAcre: 2750, sfhCostPerSqFt: 25 },
  OK: { multiplier: 0.92, label: "Southern Plains", landClearingPerAcre: 2500, sfhCostPerSqFt: 23 },
  IL: { multiplier: 1.10, label: "Illinois / Chicagoland", landClearingPerAcre: 3500, sfhCostPerSqFt: 32 },
};

interface DealAnalysisModalProps {
  deal: Deal | null;
  onClose: () => void;
  onSaveAnalysis: (propertyId: string, customFinancials: DealInput) => Promise<void>;
  onAdvanceStage: (dealId: string, stage: Deal["status"]) => void;
  onDraftOutreach: (propertyId: string) => void;
  onDraftContract: (dealId: string) => void;
  onMatchInvestors: (dealId: string) => void;
}

export default function DealAnalysisModal({
  deal,
  onClose,
  onSaveAnalysis,
  onAdvanceStage,
  onDraftOutreach,
  onDraftContract,
  onMatchInvestors,
}: DealAnalysisModalProps) {
  if (!deal) return null;

  const [financials, setFinancials] = useState<DealInput>({
    ...deal.financials,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"underwriting" | "ai_audit" | "comps">("underwriting");
  const [showRepairBreakdown, setShowRepairBreakdown] = useState(false);

  // Sensitivity Analysis & Stress Test State
  const [showSensitivity, setShowSensitivity] = useState(false);
  const [sensitivityRepairPct, setSensitivityRepairPct] = useState<number>(20); // +20% default stress
  const [sensitivityHoldingMonths, setSensitivityHoldingMonths] = useState<number>(4); // default 4 months
  const [sensitivityPricePct, setSensitivityPricePct] = useState<number>(0); // 0% price drift

  const regionInfo = REGIONAL_MATERIAL_COST_INDEX[deal.property.state] || {
    multiplier: 1.0,
    label: "National Baseline",
    landClearingPerAcre: 3000,
    sfhCostPerSqFt: 28,
  };

  const isLand = deal.property.propertyType === "land" || !!deal.property.lotSizeAcres;
  const propertyAcreage = deal.property.lotSizeAcres || (deal.property.sqft ? deal.property.sqft / 43560 : 1.2);
  const calculatedRegionalRepair = isLand
    ? Math.round(propertyAcreage * regionInfo.landClearingPerAcre * regionInfo.multiplier)
    : Math.round((deal.property.sqft || 1800) * regionInfo.sfhCostPerSqFt * regionInfo.multiplier);

  const handleApplyRegionalRepairs = () => {
    handleFinancialChange("repairs", calculatedRegionalRepair);
    setShowRepairBreakdown(true);
  };

  useEffect(() => {
    setFinancials({ ...deal.financials });
  }, [deal]);

  // Reactive Profit Engine calculations
  const liveMetrics = calculateDealProfit(financials);

  // Reactive Deal Scoring
  const discountRate = Math.round(
    ((financials.expectedSalePrice - financials.purchasePrice) / (financials.expectedSalePrice || 1)) * 100
  );
  const liveScore = calculateDealScore({
    financialOpportunity: Math.min(100, Math.round((liveMetrics.projectedProfit / 20000) * 85)),
    discount: Math.min(100, discountRate * 1.5),
    compsConfidence: deal.property.comps && deal.property.comps.length > 0 ? 90 : 65,
    repairConfidence: 85,
    marketLiquidity: 80,
    exitPotential: 85,
    daysOnMarket: Math.max(25, 100 - deal.property.daysOnMarket),
    dataConfidence: 90,
  });

  const liveRec = getRecommendation(liveScore, liveMetrics.projectedProfit, liveMetrics.roi);

  const handleFinancialChange = (key: keyof DealInput, val: number) => {
    setFinancials((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveAnalysis(deal.propertyId, financials);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const stageOptions: Deal["status"][] = [
    "ANALYSIS",
    "OFFER",
    "NEGOTIATION",
    "CONTRACT",
    "CLOSING",
    "REALIZED",
    "REJECTED",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0E1218] border border-slate-800 rounded w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0B0E14]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase">
                Agent 2 Forensic Underwriting
              </span>
              <span className="text-xs text-slate-500 font-mono">PROFIT ENGINE</span>
              <button
                onClick={() => onMatchInvestors(deal.id)}
                className="px-2.5 py-0.5 bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-500/40 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition"
                title="Automatically match this property against Investor database"
              >
                <Users className="w-3 h-3 text-blue-400" />
                <span>Quick Match Buyers</span>
              </button>
            </div>
            <h2 className="text-lg sm:text-xl font-light text-white tracking-tight mt-0.5 font-sans">
              {deal.property.address}, {deal.property.city}, {deal.property.state} {deal.property.zip}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-[#0B0E14] px-6 text-xs font-mono">
          <button
            onClick={() => setActiveTab("underwriting")}
            className={`py-3 px-4 border-b-2 uppercase tracking-wider transition ${
              activeTab === "underwriting"
                ? "border-emerald-500 text-white font-bold"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            Profit Engine & Parameters
          </button>
          <button
            onClick={() => setActiveTab("ai_audit")}
            className={`py-3 px-4 border-b-2 uppercase tracking-wider transition ${
              activeTab === "ai_audit"
                ? "border-emerald-500 text-white font-bold"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            Forensic AI Audit
          </button>
          <button
            onClick={() => setActiveTab("comps")}
            className={`py-3 px-4 border-b-2 uppercase tracking-wider transition ${
              activeTab === "comps"
                ? "border-emerald-500 text-white font-bold"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            Verified MLS Comps
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Top Live Score HUD Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#161B22] p-4 rounded border border-slate-800 font-mono">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Projected Net Profit:</span>
              <span className="text-xl font-bold text-emerald-400">
                ${(liveMetrics?.projectedProfit ?? 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Projected ROI:</span>
              <span className="text-xl font-bold text-emerald-300">
                {liveMetrics?.roi ?? 0}%
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Total Capital:</span>
              <span className="text-xl font-bold text-slate-200">
                ${(liveMetrics?.totalInvestment ?? 0).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Score & Rec:</span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    liveRec === "PURSUE"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : liveRec === "REVIEW"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {liveRec}
                </span>
                <span className="text-sm font-bold text-white">
                  {liveScore}/100
                </span>
              </div>
            </div>
          </div>

          {activeTab === "underwriting" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Acquisition & Renovation Costs */}
              <div className="space-y-4 bg-[#161B22] p-5 rounded border border-slate-800 font-mono">
                <h4 className="font-bold text-white text-xs uppercase tracking-widest flex items-center justify-between">
                  <span>1. Acquisition & Renovation</span>
                  <span className="text-slate-500 text-[10px]">Inputs</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 text-[10px] uppercase mb-1">
                      Purchase Price ($):
                    </label>
                    <input
                      type="number"
                      value={financials.purchasePrice}
                      onChange={(e) => handleFinancialChange("purchasePrice", Number(e.target.value))}
                      className="w-full bg-[#0B0E14] border border-slate-800 rounded px-3 py-1.5 text-white"
                    />
                  </div>

                  <div className="bg-[#0B0E14] p-2.5 rounded border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-slate-400 text-[10px] uppercase font-bold">
                        {isLand ? "Estimated Site Prep / Clearing ($):" : "Estimated Repairs & Renovation ($):"}
                      </label>
                      <button
                        type="button"
                        onClick={handleApplyRegionalRepairs}
                        className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1 transition font-bold font-mono"
                        title={`Calculate using ${regionInfo.label} index (${regionInfo.multiplier}x)`}
                      >
                        <Calculator className="w-3 h-3 text-amber-400" />
                        <span>Auto-Estimate Regional</span>
                      </button>
                    </div>

                    <input
                      type="number"
                      value={financials.repairs}
                      onChange={(e) => handleFinancialChange("repairs", Number(e.target.value))}
                      className="w-full bg-[#161B22] border border-slate-700 rounded px-3 py-1.5 text-amber-300 font-mono font-bold"
                    />

                    {/* Regional Cost Calculation Formula Note */}
                    <div className="text-[10px] font-mono text-slate-400 bg-[#161B22]/80 p-2 rounded border border-slate-800 flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="text-slate-500 block uppercase font-bold">Regional Index Model ({deal.property.state}):</span>
                        <p className="text-slate-300">
                          {isLand
                            ? `${propertyAcreage.toFixed(2)} Acres @ $${regionInfo.landClearingPerAcre}/acre × ${regionInfo.multiplier}x`
                            : `${deal.property.sqft || 1800} SqFt @ $${regionInfo.sfhCostPerSqFt}/sqft × ${regionInfo.multiplier}x`}
                          {" "} = <strong className="text-amber-300">${calculatedRegionalRepair.toLocaleString()}</strong>
                        </p>
                      </div>
                      <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700 uppercase">
                        {regionInfo.label.split(" ")[0]}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 text-[10px] uppercase mb-1">Closing Costs ($):</label>
                      <input
                        type="number"
                        value={financials.closingCosts}
                        onChange={(e) => handleFinancialChange("closingCosts", Number(e.target.value))}
                        className="w-full bg-[#0B0E14] border border-slate-800 rounded px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[10px] uppercase mb-1">Holding Costs ($):</label>
                      <input
                        type="number"
                        value={financials.holdingCosts}
                        onChange={(e) => handleFinancialChange("holdingCosts", Number(e.target.value))}
                        className="w-full bg-[#0B0E14] border border-slate-800 rounded px-3 py-1.5 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 text-[10px] uppercase mb-1">Financing ($):</label>
                      <input
                        type="number"
                        value={financials.financingCosts}
                        onChange={(e) => handleFinancialChange("financingCosts", Number(e.target.value))}
                        className="w-full bg-[#0B0E14] border border-slate-800 rounded px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[10px] uppercase mb-1">Taxes & Ins ($):</label>
                      <input
                        type="number"
                        value={financials.taxes + financials.insurance}
                        onChange={(e) => {
                          const total = Number(e.target.value);
                          handleFinancialChange("taxes", Math.round(total * 0.6));
                          handleFinancialChange("insurance", Math.round(total * 0.4));
                        }}
                        className="w-full bg-[#0B0E14] border border-slate-800 rounded px-3 py-1.5 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Disposition & Exit Economics */}
              <div className="space-y-4 bg-[#161B22] p-5 rounded border border-slate-800 font-mono">
                <h4 className="font-bold text-white text-xs uppercase tracking-widest flex items-center justify-between">
                  <span>2. Resale (ARV) & Disposition</span>
                  <span className="text-slate-500 text-[10px]">Exit</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 text-[10px] uppercase mb-1">
                      Expected ARV / Resale Price ($):
                    </label>
                    <input
                      type="number"
                      value={financials.expectedSalePrice}
                      onChange={(e) => handleFinancialChange("expectedSalePrice", Number(e.target.value))}
                      className="w-full bg-[#0B0E14] border border-slate-800 rounded px-3 py-1.5 text-blue-300 font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 text-[10px] uppercase mb-1">Selling Costs ($):</label>
                      <input
                        type="number"
                        value={financials.sellingCosts}
                        onChange={(e) => handleFinancialChange("sellingCosts", Number(e.target.value))}
                        className="w-full bg-[#0B0E14] border border-slate-800 rounded px-3 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[10px] uppercase mb-1">Commissions ($):</label>
                      <input
                        type="number"
                        value={financials.commissions}
                        onChange={(e) => handleFinancialChange("commissions", Number(e.target.value))}
                        className="w-full bg-[#0B0E14] border border-slate-800 rounded px-3 py-1.5 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 text-[10px] uppercase mb-1">
                      Concessions ($):
                    </label>
                    <input
                      type="number"
                      value={financials.concessions}
                      onChange={(e) => handleFinancialChange("concessions", Number(e.target.value))}
                      className="w-full bg-[#0B0E14] border border-slate-800 rounded px-3 py-1.5 text-white"
                    />
                  </div>

                  {/* Net Proceeds Calculation */}
                  <div className="p-3.5 bg-[#0B0E14] rounded border border-slate-800 space-y-1">
                    <div className="flex justify-between text-slate-400 text-xs">
                      <span>Gross Resale:</span>
                      <span className="text-white">${(financials.expectedSalePrice ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-xs">
                      <span>Total Friction:</span>
                      <span className="text-amber-400">
                        -${((financials.sellingCosts ?? 0) + (financials.commissions ?? 0) + (financials.concessions ?? 0)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800 text-xs">
                      <span>Net Cash Proceeds:</span>
                      <span className="text-emerald-400">${(liveMetrics?.netProceeds ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sensitivity Analysis & Profit Impact Bar Chart Module */}
              <div className="md:col-span-2 bg-[#161B22] p-5 rounded border border-slate-800 font-mono space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                        SENSITIVITY & STRESS TEST ENGINE
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Dynamically test margin durability against repair overruns and extended holding timelines
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowSensitivity(!showSensitivity)}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 border ${
                      showSensitivity
                        ? "bg-amber-500 text-black border-amber-400 shadow-sm"
                        : "bg-slate-900 text-slate-300 hover:text-white border-slate-700"
                    }`}
                  >
                    <span>{showSensitivity ? "HIDE SENSITIVITY" : "ENABLE SENSITIVITY TOGGLE"}</span>
                  </button>
                </div>

                {showSensitivity && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    {/* Interactive Input Sliders */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0B0E14] p-4 rounded border border-slate-800">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Repair Cost Delta:</span>
                          <span className={`font-bold ${sensitivityRepairPct > 0 ? "text-red-400" : "text-emerald-400"}`}>
                            {sensitivityRepairPct > 0 ? `+${sensitivityRepairPct}%` : `${sensitivityRepairPct}%`}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-30"
                          max="80"
                          step="5"
                          value={sensitivityRepairPct}
                          onChange={(e) => setSensitivityRepairPct(Number(e.target.value))}
                          className="w-full accent-amber-400"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                          <span>-30% Under</span>
                          <span>Base</span>
                          <span>+80% Overrun</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Holding Duration:</span>
                          <span className="text-amber-400 font-bold">{sensitivityHoldingMonths} Months</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="12"
                          step="1"
                          value={sensitivityHoldingMonths}
                          onChange={(e) => setSensitivityHoldingMonths(Number(e.target.value))}
                          className="w-full accent-amber-400"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                          <span>1 Mo (Quick)</span>
                          <span>4 Mo (Base)</span>
                          <span>12 Mo (Slow)</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Exit Resale Delta:</span>
                          <span className={`font-bold ${sensitivityPricePct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {sensitivityPricePct >= 0 ? `+${sensitivityPricePct}%` : `${sensitivityPricePct}%`}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-20"
                          max="20"
                          step="5"
                          value={sensitivityPricePct}
                          onChange={(e) => setSensitivityPricePct(Number(e.target.value))}
                          className="w-full accent-blue-400"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                          <span>-20% Dip</span>
                          <span>0% Base</span>
                          <span>+20% Surge</span>
                        </div>
                      </div>
                    </div>

                    {/* Scenarios Computation & Real-Time Bar Chart */}
                    {(() => {
                      const baseProfit = liveMetrics.projectedProfit;
                      const monthlyHoldBase = (financials.holdingCosts || 2400) / 4;

                      // Helper to compute profit for given deltas
                      const calcScenarioProfit = (repairDeltaPct: number, holdMonths: number, priceDeltaPct: number) => {
                        const adjRepairs = financials.repairs * (1 + repairDeltaPct / 100);
                        const adjHolding = monthlyHoldBase * holdMonths;
                        const adjSalePrice = financials.expectedSalePrice * (1 + priceDeltaPct / 100);
                        const friction = (financials.sellingCosts + financials.commissions + financials.concessions) * (1 + priceDeltaPct / 100);
                        const netProceeds = adjSalePrice - friction;
                        const totalCosts = financials.purchasePrice + adjRepairs + financials.closingCosts + adjHolding + financials.financingCosts + financials.taxes + financials.insurance + financials.otherCosts;
                        return Math.round(netProceeds - totalCosts);
                      };

                      const bearProfit = calcScenarioProfit(35, 8, -5);
                      const customProfit = calcScenarioProfit(sensitivityRepairPct, sensitivityHoldingMonths, sensitivityPricePct);
                      const bullProfit = calcScenarioProfit(-15, 2, 5);

                      const scenarios = [
                        { label: "Bear / Worst Case", desc: "+35% Repairs, 8mo Hold, -5% ARV", profit: bearProfit },
                        { label: "Live Stressed Model", desc: `${sensitivityRepairPct >= 0 ? "+" : ""}${sensitivityRepairPct}% Rep, ${sensitivityHoldingMonths}mo Hold, ${sensitivityPricePct >= 0 ? "+" : ""}${sensitivityPricePct}% ARV`, profit: customProfit, isCurrent: true },
                        { label: "Baseline Model", desc: "Current Deal Inputs (4mo Hold)", profit: baseProfit },
                        { label: "Bull / Best Case", desc: "-15% Repairs, 2mo Hold, +5% ARV", profit: bullProfit },
                      ];

                      const maxVal = Math.max(1, ...scenarios.map((s) => Math.abs(s.profit)));

                      return (
                        <div className="bg-[#0B0E14] p-4 rounded border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white uppercase tracking-wider">
                              Real-Time Projected Profit Impact Chart
                            </span>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className="flex items-center gap-1 text-emerald-400">
                                <span className="w-2 h-2 rounded bg-emerald-500"></span> Profitable
                              </span>
                              <span className="flex items-center gap-1 text-red-400">
                                <span className="w-2 h-2 rounded bg-red-500"></span> Risk / Negative
                              </span>
                            </div>
                          </div>

                          {/* Bar Chart Visualization */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                            {scenarios.map((sc, idx) => {
                              const isPositive = sc.profit >= 0;
                              const barHeightPct = Math.min(100, Math.max(12, Math.round((Math.abs(sc.profit) / maxVal) * 100)));

                              return (
                                <div
                                  key={idx}
                                  className={`p-3 rounded border flex flex-col justify-between transition ${
                                    sc.isCurrent
                                      ? "bg-amber-950/30 border-amber-500/50 shadow-md"
                                      : "bg-[#121720] border-slate-800"
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-bold text-slate-200 truncate">{sc.label}</span>
                                      {sc.isCurrent && (
                                        <span className="text-[8px] px-1 py-0.2 bg-amber-500 text-black font-bold rounded">
                                          ACTIVE
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[9px] text-slate-500 mt-0.5">{sc.desc}</p>
                                  </div>

                                  {/* Bar container */}
                                  <div className="my-3 flex flex-col justify-end h-24 bg-slate-950/80 rounded p-1.5 border border-slate-800/80">
                                    <div
                                      style={{ height: `${barHeightPct}%` }}
                                      className={`w-full rounded transition-all duration-300 flex items-center justify-center text-[10px] font-bold ${
                                        isPositive
                                          ? sc.isCurrent
                                            ? "bg-gradient-to-t from-amber-600 to-amber-400 text-black"
                                            : "bg-gradient-to-t from-emerald-600 to-emerald-400 text-black"
                                          : "bg-gradient-to-t from-red-700 to-red-500 text-white"
                                      }`}
                                    >
                                      {barHeightPct > 25 && (
                                        <span>{isPositive ? `+$${Math.round(sc.profit / 1000)}k` : `-$${Math.round(Math.abs(sc.profit) / 1000)}k`}</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="pt-1 border-t border-slate-800 flex justify-between items-center text-xs">
                                    <span className="text-[10px] text-slate-400">Net Profit:</span>
                                    <span className={`font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                                      {isPositive ? `+$${sc.profit.toLocaleString()}` : `-$${Math.abs(sc.profit).toLocaleString()}`}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "ai_audit" && (
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Verified Facts */}
                <div className="bg-[#161B22] p-4 rounded border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 uppercase tracking-widest flex items-center space-x-1.5 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified Facts (Rule 1 & 3)</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    {deal.verifiedFacts?.map((fact, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Explicit Estimates */}
                <div className="bg-[#161B22] p-4 rounded border border-slate-800 space-y-2">
                  <h4 className="font-bold text-blue-400 uppercase tracking-widest flex items-center space-x-1.5 text-[11px]">
                    <Calculator className="w-3.5 h-3.5 text-blue-400" />
                    <span>Labeled Estimates (Rule 4)</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    {deal.estimates?.map((est, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-blue-400 font-bold">•</span>
                        <span>{est}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Unknowns */}
                <div className="bg-[#161B22] p-4 rounded border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-400 uppercase tracking-widest flex items-center space-x-1.5 text-[11px]">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Inspection Unknowns</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    {deal.unknowns?.map((unk, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{unk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risks & Mitigations */}
                <div className="bg-[#161B22] p-4 rounded border border-slate-800 space-y-2">
                  <h4 className="font-bold text-rose-400 uppercase tracking-widest flex items-center space-x-1.5 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Identified Risks</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    {deal.risks?.map((risk, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Next Action Directive */}
              <div className="p-4 bg-[#161B22] border border-emerald-500/40 rounded text-slate-200 flex items-center justify-between border-l-2 border-l-emerald-500">
                <div>
                  <span className="text-emerald-400 font-bold uppercase text-[10px] block">
                    Agent 2 Underwriting Recommendation & Directive:
                  </span>
                  <p className="font-medium text-xs mt-0.5 font-sans">{deal.nextAction}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "comps" && (
            <div className="space-y-4 font-mono text-xs">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                MLS Verified Comparable Sales (Rule 2: Never invent comps)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {deal.property.comps?.map((comp, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-[#161B22] rounded border border-slate-800 space-y-1"
                  >
                    <div className="flex justify-between font-bold text-white">
                      <span>{comp.address}</span>
                      <span className="text-emerald-400">${(comp.salePrice ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>{comp.sqft} sqft • {comp.distanceMiles} mi away</span>
                      <span>Sold: {comp.soldDate}</span>
                    </div>
                    <div className="pt-1 text-[11px] text-teal-400 font-semibold uppercase">
                      Similarity Index: {comp.similarityScore}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0B0E14] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 uppercase text-[11px]">Deal Stage:</span>
            <select
              value={deal.status}
              onChange={(e) => onAdvanceStage(deal.id, e.target.value as Deal["status"])}
              className="bg-[#161B22] border border-slate-800 text-white text-xs rounded px-2.5 py-1.5 font-mono"
            >
              {stageOptions.map((stg) => (
                <option key={stg} value={stg}>
                  {stg}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDraftOutreach(deal.propertyId)}
              className="px-3 py-1.5 bg-[#161B22] hover:bg-slate-800 text-purple-300 rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1 transition border border-slate-800"
            >
              <Mail className="w-3 h-3" />
              <span>Outreach</span>
            </button>
            <button
              onClick={() => onDraftContract(deal.id)}
              className="px-3 py-1.5 bg-[#161B22] hover:bg-slate-800 text-slate-200 rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1 transition border border-slate-800"
            >
              <FileText className="w-3 h-3" />
              <span>Contract</span>
            </button>
            <button
              onClick={() => onMatchInvestors(deal.id)}
              className="px-3 py-1.5 bg-[#161B22] hover:bg-slate-800 text-blue-300 rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1 transition border border-slate-800"
            >
              <Users className="w-3 h-3" />
              <span>Buyers</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1"
            >
              {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
              <span>Save & Snapshot</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
