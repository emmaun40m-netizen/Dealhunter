import { useState } from "react";
import {
  FileText,
  CheckCircle,
  Copy,
  PenTool,
  RefreshCw,
  Download,
  ShieldCheck,
  Archive,
  Sparkles,
  Lock,
} from "lucide-react";
import { Contract, Deal } from "../types";
import { store } from "../services/store";

interface ContractsVaultProps {
  contracts: Contract[];
  deals: Deal[];
  onDraftContract: (params: {
    dealId: string;
    type: Contract["type"];
    sellerName: string;
    buyerName: string;
  }) => Promise<void>;
  onSignContract: (contractId: string) => Promise<void>;
  onRefresh: () => void;
}

export default function ContractsVault({
  contracts,
  deals,
  onDraftContract,
  onSignContract,
  onRefresh,
}: ContractsVaultProps) {
  const [selectedDealId, setSelectedDealId] = useState<string>(deals[0]?.id || "");
  const [contractType, setContractType] = useState<Contract["type"]>("PURCHASE_AND_SALE");
  const [buyerName, setBuyerName] = useState("DealHunter Capital LLC (and/or Assigns)");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeContract, setActiveContract] = useState<Contract | null>(
    contracts[0] || null
  );
  const [copied, setCopied] = useState(false);
  const [lastExportMessage, setLastExportMessage] = useState<string | null>(null);

  const selectedDeal = deals.find((d) => d.id === selectedDealId) || deals[0];

  const handleGenerate = async () => {
    if (!selectedDeal) return;
    setIsGenerating(true);
    try {
      await onDraftContract({
        dealId: selectedDeal.id,
        type: contractType,
        sellerName: selectedDeal.property?.listingAgent?.name || "Property Owner of Record",
        buyerName,
      });
      onRefresh();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!activeContract) return;
    navigator.clipboard.writeText(activeContract.content || activeContract.documentText || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportSnapshot = () => {
    const snapshot = store.exportContractsVaultSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Contracts-Vault-Snapshot-${snapshot.snapshotId}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setLastExportMessage(
      `Snapshot ${snapshot.snapshotId.slice(0, 16)}... exported (${snapshot.totalContracts} contracts, $${snapshot.totalTransactionVolume.toLocaleString()} vol)`
    );
    setTimeout(() => setLastExportMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0E1218] border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Rule 5 Legal Suite
              </span>
              <span className="text-xs text-slate-500 font-mono">CONTRACTS & LOIs</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Daily Snapshot Active
              </span>
            </div>
            <h2 className="text-2xl font-light text-white tracking-tight mt-1 font-sans">
              Contracts, Assignments & Letter of Intent (LOI) Generator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enforces jurisdiction-appropriate real estate contracts (Purchase and Sale, Wholesale Assignment, Non-Binding LOI) with standard inspection and financing contingencies.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-export-vault-snapshot"
              onClick={handleExportSnapshot}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 font-mono text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Export Vault Snapshot (JSON)</span>
            </button>
          </div>
        </div>

        {lastExportMessage && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{lastExportMessage}</span>
          </div>
        )}
      </div>

      {/* Generator & Contract Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Draft New Contract (5 cols) */}
        <div className="lg:col-span-5 bg-[#0E1218] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center space-x-2">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Generate Legal Document</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Bilingual Escrow Ready</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="block text-slate-500 text-[10px] uppercase mb-1">Target Deal Property:</label>
              <select
                value={selectedDealId}
                onChange={(e) => setSelectedDealId(e.target.value)}
                className="w-full bg-[#0B0E14] border border-slate-800 text-white rounded p-2 focus:outline-none focus:border-emerald-500 font-mono text-xs"
              >
                {deals.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.property?.address} ({d.property?.city}, {d.property?.state}) - ${(d.financials?.purchasePrice ?? 0).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 text-[10px] uppercase mb-1">Contract Type:</label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as any)}
                className="w-full bg-[#0B0E14] border border-slate-800 text-white rounded p-2 focus:outline-none focus:border-emerald-500 font-mono text-xs"
              >
                <option value="PURCHASE_AND_SALE">Purchase and Sale Agreement</option>
                <option value="ASSIGNMENT">Wholesale Assignment of Contract</option>
                <option value="LETTER_OF_INTENT">Letter of Intent (LOI)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 text-[10px] uppercase mb-1">Buyer Legal Entity:</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full bg-[#0B0E14] border border-slate-800 text-white rounded p-2 focus:outline-none focus:border-emerald-500 font-mono text-xs"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition flex items-center justify-center space-x-2 font-mono shadow-sm"
            >
              {isGenerating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span>Draft Legal Agreement</span>
            </button>
          </div>

          {/* Existing Vault List */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
                Vault Documents ({contracts.length})
              </h4>
              <button
                type="button"
                onClick={handleExportSnapshot}
                className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Archive className="w-3 h-3" />
                <span>Export JSON</span>
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs custom-scrollbar">
              {contracts.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setActiveContract(c)}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    activeContract?.id === c.id
                      ? "bg-[#161B22] border-emerald-500/50 border-l-4 border-l-emerald-500"
                      : "bg-[#0B0E14] border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white truncate text-xs">
                      {c.type.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                        c.status === "EXECUTED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    Deal: {c.dealId} • {new Date(c.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Contract Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-[#0E1218] border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          {activeContract ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-base font-sans">
                    {activeContract.type.replace(/_/g, " ")}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Jurisdiction: State of Michigan/National • Deal #{activeContract.dealId}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded bg-[#161B22] hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center space-x-1 uppercase"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                  {activeContract.status !== "EXECUTED" && (
                    <button
                      onClick={() => onSignContract(activeContract.id)}
                      className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 uppercase"
                    >
                      <PenTool className="w-3 h-3" />
                      <span>Execute</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Document Text Box */}
              <div className="bg-[#0B0E14] p-5 rounded-lg border border-slate-800 text-slate-300 font-mono text-xs whitespace-pre-line leading-relaxed max-h-[500px] overflow-y-auto">
                {activeContract.content || activeContract.documentText}
              </div>

              {/* Status footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-slate-500 text-[11px]">
                <span>Contingency Period: 10 Days Inspection / Financing</span>
                <span className="text-emerald-400 font-bold uppercase flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Legal Template Rule 5 Verified
                </span>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-mono text-xs">
              <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p>Select a contract from the vault or generate a new document.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
