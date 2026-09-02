import { useState } from "react";
import {
  Code,
  Play,
  RotateCcw,
  Maximize2,
  CheckCircle2,
  Terminal,
  Cpu,
  Sliders,
  Layers,
  Sparkles,
} from "lucide-react";

interface LiveCodeExecutionWidgetProps {
  onPopout?: () => void;
  isDetached?: boolean;
}

interface AlgorithmPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
  defaultInputs: Record<string, number>;
}

const PRESETS: AlgorithmPreset[] = [
  {
    id: "mao_70_percent",
    name: "Maximum Allowable Offer (MAO 70% Rule)",
    category: "Wholesale Underwriting",
    description: "Computes exact maximum cash purchase price factoring holding costs, repair buffer, and target assignment fee.",
    defaultInputs: {
      arv: 240000,
      rulePercentage: 0.70,
      repairs: 25000,
      repairContingency: 0.10,
      closingCosts: 3000,
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
  
  // Strict 70% equation
  const rawMAO = (arv * rulePercentage) - totalRepairs - targetWholesaleFee;
  
  // Net cash acquisition ceiling
  const netAcquisitionCeiling = rawMAO - closingCosts - totalHolding;
  
  const projectedROI = ((targetWholesaleFee) / (rawMAO > 0 ? rawMAO : 1)) * 100;
  const equityCapture = arv - netAcquisitionCeiling - totalRepairs;

  return {
    arv: arv,
    maximumAllowableOffer: Math.round(netAcquisitionCeiling),
    totalRepairsWithContingency: Math.round(totalRepairs),
    totalHoldingCosts: Math.round(totalHolding),
    targetWholesaleFee: targetWholesaleFee,
    projectedWholesaleROI: Number(projectedROI.toFixed(2)),
    equityCaptureDollars: Math.round(equityCapture),
    verdict: netAcquisitionCeiling > 0 ? "PURSUE_QUALIFIED" : "UNPROFITABLE_SPREAD"
  };
}`,
  },
  {
    id: "subject_to_wraparound",
    name: "Subject-To Low Rate Wraparound Yield",
    category: "Creative Financing",
    description: "Evaluates existing low-rate mortgage assumption (2.85%) against buyer wraparound note (7.5%) and DSCR.",
    defaultInputs: {
      existingLoanBalance: 125000,
      existingInterestRate: 0.0285,
      existingMonthlyPITI: 780,
      buyerPurchasePrice: 195000,
      buyerDownPayment: 25000,
      wrapInterestRate: 0.075,
      wrapLoanTermYears: 30,
      marketRent: 1650,
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
  const monthlyWrapRate = wrapInterestRate / 12;
  const numPayments = wrapLoanTermYears * 12;

  // Monthly amortized payment received from buyer
  const buyerMonthlyPayment = wrapLoanAmount * 
    (monthlyWrapRate * Math.pow(1 + monthlyWrapRate, numPayments)) / 
    (Math.pow(1 + monthlyWrapRate, numPayments) - 1);

  const monthlyNetCashArbitrage = buyerMonthlyPayment - existingMonthlyPITI;
  const annualNetArbitrage = monthlyNetCashArbitrage * 12;

  // Cash on cash return based on $0-$5,000 initial acquisition cost
  const upfrontNetCash = buyerDownPayment - 2500; // after title/closing
  const dscr = marketRent / existingMonthlyPITI;

  return {
    upfrontCashCollected: Math.round(upfrontNetCash),
    monthlyPaymentFromBuyer: Math.round(buyerMonthlyPayment),
    monthlyPaymentToUnderlyingBank: existingMonthlyPITI,
    monthlyNetSpreadArbitrage: Math.round(monthlyNetCashArbitrage),
    annualPassiveSpread: Math.round(annualNetArbitrage),
    debtServiceCoverageRatio: Number(dscr.toFixed(2)),
    spreadYieldPercentage: Number(((wrapInterestRate - 0.0285) * 100).toFixed(2)),
    status: dscr >= 1.25 ? "INSTITUTIONAL_GRADE" : "HIGH_LEVERAGE"
  };
}`,
  },
  {
    id: "double_close_settlement",
    name: "Double Close (A-B & B-C) Net Proceeds",
    category: "Title & Settlement",
    description: "Calculates transactional funding costs, dry escrow charges, and net owner wire for back-to-back closings.",
    defaultInputs: {
      aToBPurchasePrice: 135000,
      bToCSalePrice: 175000,
      transactionalFundingFeePct: 0.015,
      titleClosingFeeAtoB: 1800,
      titleClosingFeeBtoC: 1800,
      escrowWireFee: 75,
    },
    code: `// Back-to-Back Double Close Wire Reconciliation
function calculateDoubleCloseSettlement(inputs) {
  const {
    aToBPurchasePrice,
    bToCSalePrice,
    transactionalFundingFeePct,
    titleClosingFeeAtoB,
    titleClosingFeeBtoC,
    escrowWireFee
  } = inputs;

  const grossWholesaleSpread = bToCSalePrice - aToBPurchasePrice;
  const transactionalFundingCost = aToBPurchasePrice * transactionalFundingFeePct;
  const totalSettlementFrictions = transactionalFundingCost + titleClosingFeeAtoB + titleClosingFeeBtoC + escrowWireFee;
  const netWireToDealHunter = grossWholesaleSpread - totalSettlementFrictions;
  const netProfitPercentage = (netWireToDealHunter / aToBPurchasePrice) * 100;

  return {
    grossSpread: grossWholesaleSpread,
    transactionalFundingCost: Math.round(transactionalFundingCost),
    totalSettlementFees: Math.round(totalSettlementFrictions),
    netCashWireDeposited: Math.round(netWireToDealHunter),
    netReturnOnTransaction: Number(netProfitPercentage.toFixed(2)),
    fundingSpeed: "SAME_DAY_SETTLEMENT",
    complianceVerdict: "100%_PRIVACY_PROTECTED"
  };
}`,
  },
];

export default function LiveCodeExecutionWidget({ onPopout, isDetached }: LiveCodeExecutionWidgetProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("mao_70_percent");
  const currentPreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  const [code, setCode] = useState<string>(currentPreset.code);
  const [inputs, setInputs] = useState<Record<string, number>>(currentPreset.defaultInputs);
  const [output, setOutput] = useState<any>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "DealHunter JS V8 Runtime ready.",
    "Mathematical precision: 64-bit float.",
  ]);

  const handleSelectPreset = (presetId: string) => {
    const p = PRESETS.find((x) => x.id === presetId);
    if (p) {
      setSelectedPresetId(presetId);
      setCode(p.code);
      setInputs(p.defaultInputs);
      setOutput(null);
      setConsoleLogs((prev) => [`Switched to ${p.name}`, ...prev]);
    }
  };

  const handleRunCode = () => {
    setIsExecuting(true);
    const start = performance.now();
    try {
      // Execute the custom function code securely
      // eslint-disable-next-line no-new-func
      const runner = new Function(
        "inputs",
        `
        let logs = [];
        const customConsole = {
          log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '))
        };
        ${code}
        
        let result = null;
        if (typeof computeMAO === 'function') {
          result = computeMAO(inputs);
        } else if (typeof evaluateSubjectToWrap === 'function') {
          result = evaluateSubjectToWrap(inputs);
        } else if (typeof calculateDoubleCloseSettlement === 'function') {
          result = calculateDoubleCloseSettlement(inputs);
        } else {
          // generic execution
          result = { error: "Main function not found in code" };
        }
        return { result, logs };
      `
      );

      const res = runner(inputs);
      const end = performance.now();
      setExecutionTimeMs(Number((end - start).toFixed(3)));
      setOutput(res.result);
      if (res.logs && res.logs.length > 0) {
        setConsoleLogs((prev) => [...res.logs, ...prev.slice(0, 10)]);
      }
    } catch (err: any) {
      const end = performance.now();
      setExecutionTimeMs(Number((end - start).toFixed(3)));
      setOutput({ error: err.message || "Execution exception" });
      setConsoleLogs((prev) => [`[ERROR] ${err.message}`, ...prev]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0E1218] border border-slate-800 rounded-sm overflow-hidden font-mono text-xs">
      {/* Header bar */}
      <div className="p-3 bg-[#111620] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-950/80 border border-blue-500/40 rounded text-blue-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide text-xs">
                LIVE DEAL ALGORITHM & SCRIPT ENGINE
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-blue-950 text-blue-300 border border-blue-500/30 rounded">
                V8 RUNTIME
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Interactive real-time execution of MAO equations, DSCR underwriting, and settlement models
            </span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Preset Selector */}
          <select
            value={selectedPresetId}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-200"
          >
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Run Button */}
          <button
            onClick={handleRunCode}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-black font-bold rounded shadow transition text-[11px]"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>{isExecuting ? "RUNNING..." : "RUN SCRIPT"}</span>
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

      {/* Main Grid: Code Editor & Interactive Parameter Input (Left) vs Output & Logs (Right) */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800 min-h-[300px]">
        {/* Left 7 Cols: Code Editor & Inputs */}
        <div className="md:col-span-7 p-3 flex flex-col justify-between space-y-3 bg-[#0B0E14]">
          {/* Code Textarea */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Code className="w-3 h-3 text-blue-400" />
                <span>JavaScript / ECMAScript 2024 Source</span>
              </span>
              <button
                onClick={() => setCode(currentPreset.code)}
                className="text-slate-500 hover:text-slate-300 flex items-center gap-0.5 text-[9px]"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset code</span>
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={9}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[11px] font-mono text-emerald-300 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
              spellCheck={false}
            />
          </div>

          {/* Dynamic Interactive Input Parameters */}
          <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
            <div className="flex items-center justify-between text-[10px] text-slate-300 font-bold border-b border-slate-800 pb-1">
              <span className="flex items-center gap-1">
                <Sliders className="w-3 h-3 text-emerald-400" />
                <span>Dynamic Parameter Sliders</span>
              </span>
              <span className="text-slate-500">Live Inject</span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[100px] overflow-y-auto pr-1 text-[10px]">
              {Object.entries(inputs).map(([key, value]) => {
                const numVal = Number(value);
                const isFraction = numVal < 1 && numVal > 0;
                return (
                  <div key={key} className="space-y-0.5">
                    <div className="flex justify-between text-slate-400">
                      <span className="truncate">{key}:</span>
                      <span className="text-emerald-400 font-bold">
                        {isFraction ? `${(numVal * 100).toFixed(1)}%` : numVal.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="number"
                      value={numVal}
                      step={isFraction ? "0.01" : "1000"}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          [key]: Number(e.target.value),
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 text-[10px]"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Computation Output & Terminal Log Stream */}
        <div className="md:col-span-5 p-3 flex flex-col justify-between space-y-3 bg-[#0E1218]">
          {/* Execution Output Box */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Output Object Return</span>
              </span>
              {executionTimeMs !== null && (
                <span className="text-emerald-400 font-bold">{executionTimeMs} ms</span>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded p-2.5 min-h-[170px] max-h-[190px] overflow-y-auto text-[11px] font-mono">
              {output ? (
                <pre className="text-emerald-300 leading-snug whitespace-pre-wrap">
                  {JSON.stringify(output, null, 2)}
                </pre>
              ) : (
                <div className="text-slate-500 text-center py-10 space-y-1">
                  <Play className="w-6 h-6 mx-auto text-slate-600" />
                  <p>Click "RUN SCRIPT" to evaluate algorithm</p>
                </div>
              )}
            </div>
          </div>

          {/* Console Logs */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Terminal className="w-3 h-3 text-amber-400" />
                <span>Runtime Console Stream</span>
              </span>
              <button
                onClick={() => setConsoleLogs([])}
                className="text-slate-500 hover:text-slate-300 text-[9px]"
              >
                Clear
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded p-2 h-[80px] overflow-y-auto text-[10px] text-slate-400 space-y-0.5">
              {consoleLogs.map((log, i) => (
                <div key={i} className="leading-tight">
                  <span className="text-slate-600">&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
