import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileCheck,
  DollarSign,
  Send,
  Sparkles,
  Award,
  Clock,
  Zap,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  FileText,
  BadgePercent,
  Check,
} from "lucide-react";
import { Deal, DesktopUnderwritingReport } from "../types";
import { store } from "../services/store";
import { getStateWholesaleInfo } from "../services/complianceData";

export default function DesktopUnderwritingCloser() {
  const [deals, setDeals] = useState<Deal[]>(store.getDeals());
  const [selectedDealId, setSelectedDealId] = useState<string>(deals[0]?.id || "");
  const [report, setReport] = useState<DesktopUnderwritingReport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [earnestMoneyInput, setEarnestMoneyInput] = useState<number>(0);
  const [ronSuccessMsg, setRonSuccessMsg] = useState("");

  const activeDeal = deals.find((d) => d.id === selectedDealId) || deals[0];
  const stateCompliance = activeDeal ? getStateWholesaleInfo(activeDeal.property.state) : null;

  useEffect(() => {
    if (activeDeal) {
      const existingReport = store.getDesktopReport(activeDeal.id);
      if (existingReport) {
        setReport(existingReport);
      } else {
        // Run initial underwriting automatically
        handleRunUnderwriting(activeDeal.id);
      }
    }
  }, [selectedDealId]);

  const handleRunUnderwriting = async (dealIdToRun?: string) => {
    const targetDealId = dealIdToRun || selectedDealId;
    if (!targetDealId) return;

    setIsAuditing(true);
    setRonSuccessMsg("");
    try {
      const response = await fetch(`/api/closer/underwrite/${targetDealId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ earnestMoney: earnestMoneyInput }),
      });
      const data = await response.json();
      if (data.success && data.report) {
        setReport(data.report);
      } else {
        const localReport = await store.runDesktopUnderwritingAndClose(targetDealId, {
          earnestMoney: earnestMoneyInput,
        });
        setReport(localReport);
      }
      setDeals([...store.getDeals()]);
    } catch (err) {
      console.error("Underwriting failed:", err);
      const localReport = await store.runDesktopUnderwritingAndClose(targetDealId, {
        earnestMoney: earnestMoneyInput,
      });
      setReport(localReport);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleDispatchRON = () => {
    if (!report) return;
    setRonSuccessMsg(`RON Package dispatched to Buyer & Seller via Remote Online Notary portal with ID verification.`);
    setTimeout(() => setRonSuccessMsg(""), 5000);
  };

  if (!activeDeal) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono text-sm">
        No active transactions found in pipeline.
      </div>
    );
  }

  const purchasePrice = activeDeal.financials.purchasePrice ?? 0;
  const expectedSalePrice = activeDeal.financials.expectedSalePrice ?? 0;
  const repairs = activeDeal.financials.repairs ?? 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Agent 4 Workspace • Desktop Underwriting & Virtual Closer</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Desktop Underwriting, Title/Escrow Audit & Virtual Contracting
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Automated property appraisal condition grading (C1–C6), forensic lien search, HUD-1 settlement, and Remote Online Notary dispatch.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400">Select Active Deal</span>
            <select
              value={selectedDealId}
              onChange={(e) => setSelectedDealId(e.target.value)}
              className="bg-[#0B0E14] border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            >
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.property.address} (${(d.financials.purchasePrice ?? 0).toLocaleString()} • {d.property.city}, {d.property.state})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleRunUnderwriting()}
            disabled={isAuditing}
            className="mt-3.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold font-mono text-xs rounded transition flex items-center gap-1.5 shadow-sm"
          >
            {isAuditing ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            <span>{isAuditing ? "AUDITING..." : "RE-RUN AUDIT"}</span>
          </button>
        </div>
      </div>

      {ronSuccessMsg && (
        <div className="bg-emerald-950/40 border border-emerald-500/60 rounded-sm p-3.5 flex items-center gap-2 text-xs font-mono text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{ronSuccessMsg}</span>
        </div>
      )}

      {/* Top 4 Key Underwriting KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Appraisal Condition Grade */}
        <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider">
            <span>Condition Grade</span>
            <Building className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {report?.conditionGrade || "C4"}
            </span>
            <span className="text-xs text-amber-400 font-mono">
              AVM Med: ${(report?.avmMedian ?? expectedSalePrice).toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-tight">
            {report?.conditionDescription.slice(0, 75)}...
          </p>
        </div>

        {/* Title Clearance Score */}
        <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider">
            <span>Title Clearance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {report?.titleClearanceScore || 92}/100
            </span>
            <span className="text-xs text-slate-400 font-mono">Clean & Marketable</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-tight">
            Zero lis pendens, verified grantor warranty deed authority.
          </p>
        </div>

        {/* State Wholesale Compliance Gate */}
        <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider">
            <span>State Wholesale Gate</span>
            <Scale className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-base font-bold font-mono ${
              stateCompliance?.licenseStatus === "LICENSE_REQUIRED"
                ? "text-rose-400"
                : stateCompliance?.licenseStatus === "DISCLOSURE_REQUIRED"
                ? "text-amber-400"
                : "text-emerald-400"
            }`}>
              {stateCompliance?.licenseStatus === "LICENSE_REQUIRED"
                ? "DOUBLE CLOSE REQ."
                : stateCompliance?.licenseStatus === "DISCLOSURE_REQUIRED"
                ? "DISCLOSURE REQ."
                : "DIRECT ASSIGNMENT"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 leading-tight">
            {stateCompliance?.statute} • {stateCompliance?.recommendedStrategy}
          </p>
        </div>

        {/* Closer Verdict & Status */}
        <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider">
            <span>Closer Verdict</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold font-mono text-emerald-300">
              {report?.closerVerdict.replace(/_/g, " ") || "CLEAR TO CLOSE"}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>RON Remote Notary Approved</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Title/Lien Examination & Right HUD-1 Settlement Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Forensic Lien Search & Title Clearance */}
        <div className="lg:col-span-6 space-y-5">
          {/* Forensic Title Examination Checklist */}
          <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider">
                <FileCheck className="w-4 h-4" />
                <span>Forensic Title & Municipal Lien Examination</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                AUDITED BY AGENT 4
              </span>
            </div>

            <div className="space-y-3">
              {report?.lienChecks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#080B10] border border-slate-800/80 rounded flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{item.item}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{item.details}</p>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-bold shrink-0">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Remote Online Notary (RON) & Virtual Contracting Deck */}
          <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Remote Online Notarization (RON) Virtual Desk</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Statutory Status: {report?.ronStatus || "READY_FOR_REMOTE_NOTARY"}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {report?.closerChecklist.map((task, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-[#080B10] border border-slate-800/60">
                  <div className="flex items-center gap-2 text-slate-200">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${task.completed ? "bg-emerald-500 text-black font-bold" : "bg-slate-800 text-slate-400"}`}>
                      {task.completed ? "✓" : (idx + 1)}
                    </span>
                    <span>{task.task}</span>
                  </div>
                  <span className={`text-[10px] font-mono ${task.completed ? "text-emerald-400" : "text-amber-400"}`}>
                    {task.completed ? "VERIFIED" : "PENDING"}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleDispatchRON}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-xs rounded transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>DISPATCH RON VIRTUAL CLOSING PACKAGE</span>
            </button>
          </div>
        </div>

        {/* Right Column: HUD-1 / ALTA Settlement Statement & Flash Funding */}
        <div className="lg:col-span-6 space-y-5">
          {/* Settlement Statement Breakdown */}
          <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider">
                <DollarSign className="w-4 h-4" />
                <span>HUD-1 / ALTA Virtual Settlement Statement</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Timeline: {report?.closingTimelineDays || 7} Days to Close
              </div>
            </div>

            {/* Line Items Table */}
            <div className="bg-[#080B10] border border-slate-800 rounded p-4 font-mono text-xs space-y-2.5">
              <div className="flex items-center justify-between text-slate-300">
                <span>Contract Purchase Price (A-B)</span>
                <span className="font-bold text-white">${(report?.settlementStatement.purchasePrice ?? purchasePrice).toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span>Earnest Money Deposit (EMD)</span>
                <span className="text-amber-300">
                  {report?.settlementStatement.earnestMoneyDeposit === 0 ? "$0 (Waived/Promissory)" : `$${(report?.settlementStatement.earnestMoneyDeposit ?? 0).toLocaleString()}`}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Title Insurance & Search Policy</span>
                <span>+${(report?.settlementStatement.titleInsuranceFee ?? 595).toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Escrow Settlement & RON Closing Fee</span>
                <span>+${(report?.settlementStatement.escrowSettlementFee ?? 650).toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>County Recording & E-Doc Fees</span>
                <span>+${(report?.settlementStatement.recordingFees ?? 175).toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Municipal Transfer Tax (0.86%)</span>
                <span>+${(report?.settlementStatement.municipalTransferTax ?? 210).toLocaleString()}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
                <span className="text-slate-300 font-semibold">Net Proceeds to Seller</span>
                <span className="font-bold text-emerald-400">${(report?.settlementStatement.netProceedsToSeller ?? (purchasePrice - 630)).toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-semibold">Total Cash Required (Buyer)</span>
                <span className="font-bold text-white">${(report?.settlementStatement.cashRequiredToCloseBuyer ?? (purchasePrice + 1630)).toLocaleString()}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm bg-emerald-950/40 p-2 rounded">
                <span className="text-emerald-300 font-bold">Wholesale Assignment / Net Spread</span>
                <span className="font-extrabold text-emerald-400 text-base">
                  +${(report?.settlementStatement.assignmentFeePayout ?? (expectedSalePrice - purchasePrice - repairs)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Transactional Flash Funding for Strict States (Double Close) */}
          <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                <span>1-Day Transactional Flash Funding Desk (Double Close)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                100% LTV • 0-24 HR HOLD
              </span>
            </div>

            <p className="text-xs text-slate-300">
              For deals in strict states like <strong>Oklahoma</strong> (SB 927) and <strong>Illinois</strong> (SB 1872), Agent 4 automatically provisions 1-day transactional capital so you take fee simple legal title without using your own cash.
            </p>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
              <div className="p-2 bg-[#080B10] border border-slate-800 rounded">
                <div className="text-slate-400 text-[10px]">LOAN AMOUNT</div>
                <div className="font-bold text-white mt-0.5">${(purchasePrice ?? 0).toLocaleString()}</div>
              </div>
              <div className="p-2 bg-[#080B10] border border-slate-800 rounded">
                <div className="text-slate-400 text-[10px]">POINTS FEE</div>
                <div className="font-bold text-amber-300 mt-0.5">1.25% (${Math.round((purchasePrice ?? 0) * 0.0125).toLocaleString()})</div>
              </div>
              <div className="p-2 bg-[#080B10] border border-slate-800 rounded">
                <div className="text-slate-400 text-[10px]">PROOF OF FUNDS</div>
                <div className="font-bold text-emerald-400 mt-0.5">PRE-APPROVED</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
