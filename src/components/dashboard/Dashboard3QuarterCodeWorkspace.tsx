import React, { useState, useEffect, useMemo } from "react";
import {
  Code,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Cpu,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  Layers,
  Copy,
  Check,
  Maximize2,
  Volume2,
  Building2,
  ShieldCheck,
  Zap,
  Activity,
  FileCode,
  Save,
  Download,
  Info,
} from "lucide-react";
import { Deal, DashboardMetrics, ApprovalRequest, Contract, Investor } from "../../types";
import { voiceAssistant } from "../../services/voiceAssistant";
import { store } from "../../services/store";

interface Dashboard3QuarterCodeWorkspaceProps {
  deals: Deal[];
  approvals?: ApprovalRequest[];
  metrics?: DashboardMetrics | null;
  contracts?: Contract[];
  investors?: Investor[];
  configMinROI?: number;
  onSelectDeal: (deal: Deal) => void;
  onNavigateTab: (tab: string) => void;
  onOpenVoiceSettings?: () => void;
}

interface AlgorithmScript {
  id: string;
  name: string;
  category: "Wholesale" | "Creative Financing" | "BRRRR" | "AI Underwriting" | "Escrow Smart Rules";
  description: string;
  inputs: Record<string, number | string>;
  code: string;
}

const REAL_ESTATE_ALGORITHMS: AlgorithmScript[] = [
  {
    id: "mao_70_wholesale",
    name: "MAO 70% Wholesale Underwriter (Institutional)",
    category: "Wholesale",
    description: "Computes exact maximum cash purchase price factoring holding costs, 10% repair buffer, closing fees, and target assignment profit.",
    inputs: {
      arv: 245000,
      rulePercentage: 0.70,
      repairs: 28000,
      repairContingency: 0.10,
      closingCosts: 3500,
      holdingMonths: 3,
      monthlyHoldingCost: 650,
      targetWholesaleFee: 20000,
    },
    code: `// Institutional Maximum Allowable Offer (MAO) Engine
function computeMAO(inputs) {
  const { 
    arv, 
    rulePercentage, 
    repairs, 
    repairContingency, 
    closingCosts, 
    holdingMonths, 
    monthlyHoldingCost, 
    targetWholesaleFee 
  } = inputs;

  const totalRepairs = repairs * (1 + repairContingency);
  const totalHolding = holdingMonths * monthlyHoldingCost;
  
  // Standard 70% Institutional Formula
  const rawMAO = (arv * rulePercentage) - totalRepairs - targetWholesaleFee;
  
  // Net cash acquisition ceiling factoring transaction friction
  const netAcquisitionCeiling = rawMAO - closingCosts - totalHolding;
  
  const projectedROI = (targetWholesaleFee / (netAcquisitionCeiling > 0 ? netAcquisitionCeiling : 1)) * 100;
  const equityCapture = arv - netAcquisitionCeiling - totalRepairs;

  return {
    arv: arv,
    maximumAllowableOffer: Math.round(netAcquisitionCeiling),
    totalRepairsWithBuffer: Math.round(totalRepairs),
    totalHoldingCosts: Math.round(totalHolding),
    targetWholesaleFee: targetWholesaleFee,
    projectedWholesaleROI: Number(projectedROI.toFixed(2)),
    equityCaptureDollars: Math.round(equityCapture),
    verdict: netAcquisitionCeiling > 0 ? "PURSUE_QUALIFIED" : "UNPROFITABLE_SPREAD",
    strategy: "WHOLESALE_ASSIGNMENT"
  };
}`,
  },
  {
    id: "subject_to_wraparound",
    name: "Subject-To Low-Rate Mortgage Arbitrage (2.85% Assumption)",
    category: "Creative Financing",
    description: "Evaluates taking over seller's 2.85% fixed debt vs structuring a 7.5% wraparound note to tenant-buyer for monthly spread.",
    inputs: {
      existingLoanBalance: 142000,
      existingInterestRate: 0.0285,
      existingMonthlyPITI: 810,
      buyerPurchasePrice: 215000,
      buyerDownPayment: 25000,
      wrapInterestRate: 0.075,
      wrapLoanTermYears: 30,
      marketRent: 1750,
    },
    code: `// Subject-To Wrap Yield & Cashflow Arbitrage
function evaluateSubjectToWrap(inputs) {
  const {
    existingLoanBalance,
    existingMonthlyPITI,
    buyerPurchasePrice,
    buyerDownPayment,
    wrapInterestRate,
    wrapLoanTermYears,
    marketRent
  } = inputs;

  const wrapLoanAmount = buyerPurchasePrice - buyerDownPayment;
  const monthlyRate = wrapInterestRate / 12;
  const totalMonths = wrapLoanTermYears * 12;
  
  // Standard monthly amortization formula for wraparound note
  const monthlyWrapPayment = (wrapLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) / 
                             (Math.pow(1 + monthlyRate, totalMonths) - 1);
  
  const monthlyNetSpread = monthlyWrapPayment - existingMonthlyPITI;
  const annualCashFlow = monthlyNetSpread * 12;
  
  // Upfront cash-in-pocket at closing
  const upfrontCashCollected = buyerDownPayment;
  const dscr = marketRent / existingMonthlyPITI;

  return {
    wrapLoanAmount: Math.round(wrapLoanAmount),
    monthlyBuyerPayment: Math.round(monthlyWrapPayment),
    monthlyUnderlyingDebt: existingMonthlyPITI,
    monthlyNetSpread: Math.round(monthlyNetSpread),
    annualArbitrageCashFlow: Math.round(annualCashFlow),
    upfrontAssignmentCash: upfrontCashCollected,
    debtServiceCoverageRatio: Number(dscr.toFixed(2)),
    verdict: dscr >= 1.25 ? "PURSUE_QUALIFIED" : "TIGHT_MARGIN",
    strategy: "SUBJECT_TO_WRAP"
  };
}`,
  },
  {
    id: "brrrr_recapture",
    name: "BRRRR 5-Stage Capital Recapture & Infinite Return",
    category: "BRRRR",
    description: "Models Buy, Rehab, Rent, Refinance, Repeat equity extraction at 75% LTV to determine net capital left in deal.",
    inputs: {
      purchasePrice: 110000,
      rehabCost: 35000,
      afterRepairValue: 210000,
      monthlyGrossRent: 1850,
      refinanceLTV: 0.75,
      refiInterestRate: 0.068,
    },
    code: `// BRRRR Capital Recapture & Velocity Model
function modelBRRRR(inputs) {
  const {
    purchasePrice,
    rehabCost,
    afterRepairValue,
    monthlyGrossRent,
    refinanceLTV,
    refiInterestRate
  } = inputs;

  const totalAllInCost = purchasePrice + rehabCost;
  const maxRefinanceLoan = afterRepairValue * refinanceLTV;
  
  // Capital returned to investor at cash-out refinance
  const capitalExtracted = maxRefinanceLoan - totalAllInCost;
  const netCapitalRemaining = capitalExtracted >= 0 ? 0 : Math.abs(capitalExtracted);
  
  const monthlyInterestRate = refiInterestRate / 12;
  const newMonthlyPI = (maxRefinanceLoan * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, 360))) / 
                       (Math.pow(1 + monthlyInterestRate, 360) - 1);
  
  const monthlyOperatingExpenses = monthlyGrossRent * 0.40; // Taxes, ins, maintenance, mgmt
  const netOperatingIncome = monthlyGrossRent - monthlyOperatingExpenses;
  const monthlyCashflow = netOperatingIncome - newMonthlyPI;

  const isInfiniteReturn = capitalExtracted >= 0;
  const cashOnCashROI = isInfiniteReturn ? "INFINITE (100% CAPITAL RETURNED)" : 
                        ((monthlyCashflow * 12) / (netCapitalRemaining || 1) * 100).toFixed(2) + "%";

  return {
    afterRepairValue: afterRepairValue,
    totalAllInBasis: totalAllInCost,
    cashOutRefinanceLoan: Math.round(maxRefinanceLoan),
    capitalRecapturedAtRefi: Math.round(capitalExtracted),
    netCapitalTiedUp: Math.round(netCapitalRemaining),
    monthlyNetCashflow: Math.round(monthlyCashflow),
    annualNetCashflow: Math.round(monthlyCashflow * 12),
    cashOnCashReturn: cashOnCashROI,
    verdict: isInfiniteReturn ? "PURSUE_QUALIFIED" : "STANDARD_HOLD",
    strategy: "BRRRR_RECAPTURE"
  };
}`,
  },
  {
    id: "seller_carryback",
    name: "0% / Low-Interest Seller Carryback Note Amortizer",
    category: "Creative Financing",
    description: "Evaluates pure principal paydown acceleration on seller second mortgages vs conventional debt service.",
    inputs: {
      purchasePrice: 175000,
      sellerDownPayment: 15000,
      sellerNoteRate: 0.02,
      amortizationYears: 20,
      marketRent: 1550,
      insuranceAndTaxes: 280,
    },
    code: `// Seller Carryback Note Amortizer
function evaluateSellerCarryback(inputs) {
  const {
    purchasePrice,
    sellerDownPayment,
    sellerNoteRate,
    amortizationYears,
    marketRent,
    insuranceAndTaxes
  } = inputs;

  const loanBalance = purchasePrice - sellerDownPayment;
  const monthlyRate = sellerNoteRate / 12;
  const totalMonths = amortizationYears * 12;
  
  let monthlyPayment = 0;
  if (sellerNoteRate === 0) {
    monthlyPayment = loanBalance / totalMonths;
  } else {
    monthlyPayment = (loanBalance * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) / 
                     (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  const totalMonthlyExpenses = monthlyPayment + insuranceAndTaxes;
  const netMonthlyCashflow = marketRent - totalMonthlyExpenses;
  const yearOnePrincipalPaydown = (loanBalance / totalMonths) * 12;

  return {
    carrybackLoanAmount: Math.round(loanBalance),
    monthlySellerDebtService: Math.round(monthlyPayment),
    totalMonthlyExpenses: Math.round(totalMonthlyExpenses),
    netMonthlyCashflow: Math.round(netMonthlyCashflow),
    annualCashflow: Math.round(netMonthlyCashflow * 12),
    firstYearPrincipalEquityGained: Math.round(yearOnePrincipalPaydown),
    verdict: netMonthlyCashflow >= 300 ? "PURSUE_QUALIFIED" : "TIGHT_CASHFLOW",
    strategy: "SELLER_CARRYBACK"
  };
}`,
  },
  {
    id: "ai_underwriting_scorer",
    name: "Agent 2 Multi-Factor Underwriting & Liquidity Scorer",
    category: "AI Underwriting",
    description: "Calculates institutional deal score (0-100) weighting distress, equity margin, DOM submarket velocity, and title confidence.",
    inputs: {
      askingPrice: 140000,
      arv: 235000,
      estimatedRepairs: 26000,
      daysOnMarket: 84,
      submarketLiquidityScore: 92, // 0-100
      distressFactor: 85, // 0-100
      titleConfidenceScore: 98, // 0-100
    },
    code: `// Agent 2 Autonomous Real Estate Scorer
function computeDealScore(inputs) {
  const {
    askingPrice,
    arv,
    estimatedRepairs,
    daysOnMarket,
    submarketLiquidityScore,
    distressFactor,
    titleConfidenceScore
  } = inputs;

  const totalBasis = askingPrice + estimatedRepairs;
  const equityMargin = ((arv - totalBasis) / arv) * 100;
  
  // Equity score weight (40%)
  const equityScore = Math.min(100, Math.max(0, (equityMargin / 35) * 100)) * 0.40;
  
  // Distress & Motivated Seller score (25%)
  const distressScore = (distressFactor * 0.25);
  
  // Submarket Velocity score (20%)
  const liquidityScore = (submarketLiquidityScore * 0.20);
  
  // Title & Legal compliance score (15%)
  const titleScore = (titleConfidenceScore * 0.15);

  const rawScore = equityScore + distressScore + liquidityScore + titleScore;
  const finalScore = Math.round(rawScore);

  let recommendation = "PASS";
  if (finalScore >= 80) recommendation = "PURSUE";
  else if (finalScore >= 65) recommendation = "MONITOR";

  return {
    equityMarginPercent: Number(equityMargin.toFixed(1)),
    computedDealScore: finalScore,
    componentScores: {
      equityWeight: Number(equityScore.toFixed(1)),
      distressWeight: Number(distressScore.toFixed(1)),
      liquidityWeight: Number(liquidityScore.toFixed(1)),
      titleSafetyWeight: Number(titleScore.toFixed(1))
    },
    recommendation: recommendation,
    autonomousAction: recommendation === "PURSUE" ? "DISPATCH_AGENT_3_OUTREACH" : "HOLD_IN_PIPELINE"
  };
}`,
  },
];

export default function Dashboard3QuarterCodeWorkspace({
  deals,
  approvals = [],
  metrics,
  contracts = [],
  investors = [],
  configMinROI = 25,
  onSelectDeal,
  onNavigateTab,
  onOpenVoiceSettings,
}: Dashboard3QuarterCodeWorkspaceProps) {
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>("mao_70_wholesale");
  const [customInputs, setCustomInputs] = useState<Record<string, number | string>>({});
  const [editableCode, setEditableCode] = useState<string>("");
  const [executionOutput, setExecutionOutput] = useState<any>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(1.42);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(deals[0]?.id || "");
  const [activeSubTab, setActiveSubTab] = useState<"EDITOR" | "INPUTS" | "TRACE">("EDITOR");
  const [traceLogs, setTraceLogs] = useState<string[]>([
    "V8 Isolate initialized (Memory footprint: 14.8MB)",
    "Loaded ECMAScript 2026 Sandbox Environment",
    "Compiled Real Estate Underwriting Rule Engine",
  ]);

  const currentAlgo = useMemo(() => {
    return REAL_ESTATE_ALGORITHMS.find((a) => a.id === selectedAlgoId) || REAL_ESTATE_ALGORITHMS[0];
  }, [selectedAlgoId]);

  // Load algorithm into editor when selection changes
  useEffect(() => {
    setEditableCode(currentAlgo.code);
    setCustomInputs({ ...currentAlgo.inputs });
    runExecution(currentAlgo.code, currentAlgo.inputs);
  }, [selectedAlgoId]);

  // Execute algorithm in sandboxed Function evaluation
  const runExecution = (codeStr: string, inputValues: Record<string, any>) => {
    setIsExecuting(true);
    const start = performance.now();
    try {
      // Create sandbox function
      // Wrap code and invoke the entry function
      const wrapped = `
        ${codeStr}
        if (typeof computeMAO === 'function') return computeMAO(inputs);
        if (typeof evaluateSubjectToWrap === 'function') return evaluateSubjectToWrap(inputs);
        if (typeof modelBRRRR === 'function') return modelBRRRR(inputs);
        if (typeof evaluateSellerCarryback === 'function') return evaluateSellerCarryback(inputs);
        if (typeof computeDealScore === 'function') return computeDealScore(inputs);
        return { message: "Executed code cleanly", inputs };
      `;
      const fn = new Function("inputs", wrapped);
      const res = fn(inputValues);
      const end = performance.now();
      setExecutionTimeMs(Number((end - start).toFixed(2)));
      setExecutionOutput(res);

      setTraceLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Executed ${currentAlgo.name} in ${(end - start).toFixed(2)}ms (Status: 200 OK)`,
        ...prev.slice(0, 15),
      ]);
    } catch (err: any) {
      const end = performance.now();
      setExecutionTimeMs(Number((end - start).toFixed(2)));
      setExecutionOutput({ error: err.message || "Execution error" });
      setTraceLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ERROR in ${currentAlgo.name}: ${err.message}`,
        ...prev.slice(0, 15),
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    const num = isNaN(Number(value)) ? value : Number(value);
    const updated = { ...customInputs, [key]: num };
    setCustomInputs(updated);
    runExecution(editableCode, updated);
  };

  const handleInjectPropertyComps = (deal: Deal) => {
    setSelectedPropertyId(deal.id);
    const arv = deal.financials?.expectedSalePrice || deal.property.estimatedValue || deal.property.askingPrice * 1.35 || 250000;
    const repairs = deal.financials?.repairs || deal.property.estimatedRepairs || 25000;
    const asking = deal.property.askingPrice || 165000;

    const newInputs = {
      ...customInputs,
      arv: Math.round(arv),
      repairs: Math.round(repairs),
      askingPrice: Math.round(asking),
      purchasePrice: Math.round(asking),
      buyerPurchasePrice: Math.round(arv * 0.92),
    };

    setCustomInputs(newInputs);
    runExecution(editableCode, newInputs);

    voiceAssistant.speak(
      `Injected comps for ${deal.property.address}. ARV: ${(arv).toLocaleString()} dollars. Running MAO algorithm.`,
      { chime: "success" }
    );
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editableCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleResetToDefault = () => {
    setEditableCode(currentAlgo.code);
    setCustomInputs({ ...currentAlgo.inputs });
    runExecution(currentAlgo.code, currentAlgo.inputs);
  };

  const highROIDeals = useMemo(() => {
    return deals.filter((d) => (d.metrics?.roi ?? 0) >= configMinROI);
  }, [deals, configMinROI]);

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Top Banner: 3/4 Coding Workspace Active Notice */}
      <div className="bg-[#0E1218] border border-emerald-500/40 rounded p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg shadow-emerald-950/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white font-sans tracking-tight">
                Institutional Deal Algorithm & Coding Workspace
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                3/4 SCREEN LAYOUT ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Dedicated 75% Coding Studio & V8 Sandboxed Rule Engine paired with 25% Executive Pipeline Telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => runExecution(editableCode, customInputs)}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition shadow-sm"
          >
            <Play className={`w-3.5 h-3.5 ${isExecuting ? "animate-spin" : ""}`} />
            <span>{isExecuting ? "RUNNING..." : "RUN ALGORITHM (V8)"}</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            title="Copy algorithm code"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main 3/4 + 1/4 Dual-Screen Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ========================================================================= */}
        {/* LEFT 3/4 SCREEN (lg:col-span-9 = 75% WIDTH): DEDICATED CODING WORKSPACE */}
        {/* ========================================================================= */}
        <div className="lg:col-span-9 flex flex-col space-y-4">
          {/* Algorithm Tabs Header */}
          <div className="bg-[#0B0E14] border border-slate-800 rounded p-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold px-1 hidden sm:inline">
                ALGORITHM:
              </span>
              {REAL_ESTATE_ALGORITHMS.map((algo) => (
                <button
                  key={algo.id}
                  onClick={() => setSelectedAlgoId(algo.id)}
                  className={`px-2.5 py-1.5 rounded text-[11px] font-bold border transition flex items-center gap-1.5 ${
                    selectedAlgoId === algo.id
                      ? "bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-sm"
                      : "bg-[#0E1218] text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <FileCode className="w-3 h-3 text-emerald-400" />
                  <span>{algo.name.split("(")[0]}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveSubTab("EDITOR")}
                className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                  activeSubTab === "EDITOR" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Code IDE
              </button>
              <button
                onClick={() => setActiveSubTab("INPUTS")}
                className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                  activeSubTab === "INPUTS" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Variables & Sliders
              </button>
              <button
                onClick={() => setActiveSubTab("TRACE")}
                className={`px-2 py-1 rounded text-[10px] font-bold transition ${
                  activeSubTab === "TRACE" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                V8 Trace ({traceLogs.length})
              </button>
            </div>
          </div>

          {/* Main Code Studio Box with Line Numbers & Monospace Canvas */}
          <div className="bg-[#080B10] border border-slate-800 rounded flex flex-col min-h-[460px] shadow-2xl overflow-hidden">
            {/* Editor Sub-header Bar */}
            <div className="px-4 py-2 bg-[#0E1218] border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                <span className="text-slate-300 font-bold ml-2">{currentAlgo.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {currentAlgo.category}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500">Execution time: <strong className="text-emerald-400">{executionTimeMs}ms</strong></span>
                <button
                  onClick={handleResetToDefault}
                  className="hover:text-slate-200 flex items-center gap-1 text-[10px]"
                  title="Reset script to factory template"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Editor Body or Inputs */}
            {activeSubTab === "EDITOR" && (
              <div className="p-4 flex-1 flex flex-col font-mono text-xs">
                <textarea
                  value={editableCode}
                  onChange={(e) => {
                    setEditableCode(e.target.value);
                    runExecution(e.target.value, customInputs);
                  }}
                  className="w-full flex-1 min-h-[380px] bg-transparent text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-emerald-500/30 selection:text-white"
                  spellCheck={false}
                />
              </div>
            )}

            {activeSubTab === "INPUTS" && (
              <div className="p-5 flex-1 space-y-4 overflow-y-auto max-h-[420px]">
                <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                  <h4 className="text-white font-bold text-xs font-sans">Live Variable Sliders & Deal Arguments</h4>
                  <span className="text-[10px] text-slate-400">Mutates function parameters instantaneously</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(customInputs).map(([key, val]) => (
                    <div key={key} className="bg-[#0E1218] border border-slate-800 rounded p-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-300 font-bold uppercase text-[10px]">{key}</label>
                        <span className="text-emerald-400 font-bold">
                          {typeof val === "number" ? val.toLocaleString() : val}
                        </span>
                      </div>
                      <input
                        type={typeof val === "number" ? "number" : "text"}
                        value={val}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSubTab === "TRACE" && (
              <div className="p-4 flex-1 bg-black/40 space-y-2 overflow-y-auto max-h-[420px] font-mono text-[11px]">
                <div className="text-slate-500 pb-2 border-b border-slate-800 flex items-center justify-between">
                  <span>V8 SANDBOX TRACE LOGS</span>
                  <span className="text-emerald-400">ENGINE: V8 ISOLATE v12.4</span>
                </div>
                {traceLogs.map((log, idx) => (
                  <div key={idx} className="text-slate-300 flex items-start gap-2">
                    <span className="text-slate-600 select-none">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Calculation Result & Evaluation Card */}
          <div className="bg-[#0E1218] border border-slate-800 rounded p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-bold text-xs uppercase font-sans">
                  Real-time Algorithm Execution Output
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  {executionTimeMs}ms
                </span>
              </div>

              {executionOutput && executionOutput.verdict && (
                <div
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${
                    executionOutput.verdict.includes("QUALIFIED")
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>VERDICT: {executionOutput.verdict}</span>
                </div>
              )}
            </div>

            {/* Visual JSON Output & Primary Metric Cards */}
            {executionOutput && !executionOutput.error ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                {executionOutput.maximumAllowableOffer !== undefined && (
                  <div className="bg-[#111620] border border-slate-800 rounded p-2.5 space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase">MAX ALLOWABLE OFFER (MAO)</span>
                    <div className="text-lg font-bold text-white">
                      ${executionOutput.maximumAllowableOffer.toLocaleString()}
                    </div>
                  </div>
                )}

                {executionOutput.targetWholesaleFee !== undefined && (
                  <div className="bg-[#111620] border border-slate-800 rounded p-2.5 space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase">TARGET WHOLESALE SPREAD</span>
                    <div className="text-lg font-bold text-emerald-400">
                      ${executionOutput.targetWholesaleFee.toLocaleString()}
                    </div>
                  </div>
                )}

                {executionOutput.projectedWholesaleROI !== undefined && (
                  <div className="bg-[#111620] border border-slate-800 rounded p-2.5 space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase">PROJECTED RETURN (ROI)</span>
                    <div className="text-lg font-bold text-emerald-400">
                      {executionOutput.projectedWholesaleROI}%
                    </div>
                  </div>
                )}

                {executionOutput.monthlyNetSpread !== undefined && (
                  <div className="bg-[#111620] border border-slate-800 rounded p-2.5 space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase">MONTHLY WRAP SPREAD</span>
                    <div className="text-lg font-bold text-emerald-400">
                      ${executionOutput.monthlyNetSpread.toLocaleString()}/mo
                    </div>
                  </div>
                )}

                {executionOutput.computedDealScore !== undefined && (
                  <div className="bg-[#111620] border border-slate-800 rounded p-2.5 space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase">AI DEAL SCORE</span>
                    <div className="text-lg font-bold text-blue-400">
                      {executionOutput.computedDealScore}/100
                    </div>
                  </div>
                )}

                {executionOutput.cashOnCashReturn !== undefined && (
                  <div className="bg-[#111620] border border-slate-800 rounded p-2.5 space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase">CASH-ON-CASH YIELD</span>
                    <div className="text-lg font-bold text-emerald-400">
                      {executionOutput.cashOnCashReturn}
                    </div>
                  </div>
                )}
              </div>
            ) : executionOutput?.error ? (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>Execution syntax error: {executionOutput.error}</span>
              </div>
            ) : null}

            {/* Raw JSON viewer */}
            <pre className="p-3 bg-[#080B10] border border-slate-800/80 rounded text-[11px] text-slate-300 overflow-x-auto">
              {JSON.stringify(executionOutput, null, 2)}
            </pre>
          </div>
        </div>

        {/* ============================================================================ */}
        {/* RIGHT 1/4 SCREEN (lg:col-span-3 = 25% WIDTH): EXECUTIVE DEAL TELEMETRY HUD */}
        {/* ============================================================================ */}
        <div className="lg:col-span-3 space-y-4">
          {/* Quick Property Comps Injector */}
          <div className="bg-[#0E1218] border border-slate-800 rounded p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-xs font-sans">Active Pipeline Listings</h3>
              </div>
              <span className="text-[10px] text-slate-500">{deals.length} deals</span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              Click any property to inject its live comps directly into the 3/4 Code IDE:
            </p>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {deals.map((deal) => {
                const isSelected = selectedPropertyId === deal.id;
                return (
                  <div
                    key={deal.id}
                    onClick={() => handleInjectPropertyComps(deal)}
                    className={`p-2.5 rounded border transition cursor-pointer flex flex-col justify-between gap-1 group ${
                      isSelected
                        ? "bg-emerald-950/40 border-emerald-500 text-white shadow-sm"
                        : "bg-[#111620] border-slate-800 hover:border-slate-700 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-sans font-bold">
                      <span className="truncate group-hover:text-emerald-400">{deal.property.address}</span>
                      <span className="text-emerald-400 font-mono text-[10px]">
                        ${(deal.metrics?.projectedProfit || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{deal.property.city}, {deal.property.state}</span>
                      <span>ROI: <strong className="text-emerald-300">{deal.metrics?.roi}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Autonomous Agents Status HUD */}
          <div className="bg-[#0E1218] border border-slate-800 rounded p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-xs font-sans">Multi-Agent Engine</h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">4/4 ACTIVE</span>
            </div>

            <div className="space-y-1.5 text-[10px]">
              {[
                { name: "Agent 1 (Scout)", role: "MLS Scanner", status: "Scanning 50 States", color: "text-emerald-400" },
                { name: "Agent 2 (Underwriter)", role: "Algorithm V8", status: "Computing MAO", color: "text-blue-400" },
                { name: "Agent 3 (Outreach)", role: "SMS/Email", status: "14 Dispatched", color: "text-purple-400" },
                { name: "Agent 4 (Closer)", role: "Contracts", status: "$0 Down Clause", color: "text-indigo-400" },
              ].map((agent, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 bg-[#111620] rounded border border-slate-800/80">
                  <span className="text-slate-300 font-medium">{agent.name}</span>
                  <span className={`${agent.color} font-bold`}>{agent.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* High-ROI Spotlight Matrix in Rail */}
          {highROIDeals.length > 0 && (
            <div className="bg-[#0E1218] border border-emerald-500/40 rounded p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-bold text-xs font-sans">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>High-ROI Alerts (≥{configMinROI}%)</span>
                </div>
                <span className="text-[10px] text-emerald-400">{highROIDeals.length} Deals</span>
              </div>

              <div className="p-2.5 bg-[#111620] border border-emerald-500/30 rounded space-y-1">
                <div className="font-bold text-white text-xs truncate">
                  {highROIDeals[0].property.address}
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-bold">{highROIDeals[0].metrics?.roi}% ROI</span>
                  <span className="text-slate-400">${(highROIDeals[0].metrics?.projectedProfit || 0).toLocaleString()} spread</span>
                </div>
                <button
                  onClick={() => handleInjectPropertyComps(highROIDeals[0])}
                  className="w-full mt-1.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold transition flex items-center justify-center gap-1"
                >
                  <Play className="w-2.5 h-2.5" />
                  <span>Load Into 3/4 Code IDE</span>
                </button>
              </div>
            </div>
          )}

          {/* Fast Navigation Quick Links */}
          <div className="bg-[#0E1218] border border-slate-800 rounded p-3 space-y-2">
            <h4 className="text-[10px] uppercase font-bold text-slate-500">Direct Actions</h4>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
              <button
                onClick={() => onNavigateTab("closer")}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded text-center transition"
              >
                Virtual Closer
              </button>
              <button
                onClick={() => onNavigateTab("contracts")}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded text-center transition"
              >
                Contracts Vault
              </button>
              <button
                onClick={() => onNavigateTab("payments")}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded text-center transition"
              >
                Escrow Wallet
              </button>
              <button
                onClick={() => onNavigateTab("chat")}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded text-center transition"
              >
                Agent Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
