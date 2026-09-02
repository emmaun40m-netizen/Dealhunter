import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  UserCheck,
  Send,
  FileText,
  Mail,
  RefreshCw,
  CheckSquare,
  Square,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { ApprovalRequest } from "../types";
import { store } from "../services/store";

interface ApprovalQueueProps {
  approvals: ApprovalRequest[];
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, notes?: string) => Promise<void>;
  onRefresh: () => void;
}

export default function ApprovalQueue({
  approvals,
  onApprove,
  onReject,
  onRefresh,
}: ApprovalQueueProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkNote, setBulkNote] = useState("");

  const pendingApprovals = approvals.filter((a) => a.status === "PENDING");
  const completedApprovals = approvals.filter((a) => a.status !== "PENDING");

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await onApprove(id, actionNotes[id] || "Authorized by Human Executive");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await onReject(id, actionNotes[id] || "Rejected during human review");
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === pendingApprovals.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingApprovals.map((p) => p.id));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      store.bulkApproveRequests(
        selectedIds,
        bulkNote || `Bulk authorized batch of ${selectedIds.length} requests`
      );
      setSelectedIds([]);
      setBulkNote("");
      onRefresh();
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      store.bulkRejectRequests(
        selectedIds,
        bulkNote || `Bulk rejected batch of ${selectedIds.length} requests`
      );
      setSelectedIds([]);
      setBulkNote("");
      onRefresh();
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const allSelected =
    pendingApprovals.length > 0 && selectedIds.length === pendingApprovals.length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0E1218] border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Rule 8 Consequence Gate
              </span>
              <span className="text-xs text-slate-500 font-mono">HUMAN-IN-THE-LOOP</span>
            </div>
            <h2 className="text-2xl font-light text-white tracking-tight mt-1 font-sans">
              Human-in-the-Loop Approval Queue
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Consequential transaction actions (submitting legally binding offers, executing contracts, or dispatching external outreach) require configured human sign-off.
            </p>
          </div>

          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="px-3 py-1.5 rounded bg-[#161B22] border border-slate-800 text-slate-300">
              PENDING: <strong className="text-amber-400">{pendingApprovals.length}</strong>
            </span>
            <button
              onClick={onRefresh}
              className="p-2 rounded bg-[#161B22] hover:bg-slate-800 text-slate-300 transition border border-slate-800"
              title="Refresh Approval Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Processing Action Bar */}
      {pendingApprovals.length > 0 && (
        <div className="bg-[#121722] border border-amber-500/30 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              type="button"
              id="btn-select-all-approvals"
              onClick={handleSelectAll}
              className="flex items-center space-x-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>{allSelected ? "Deselect All" : "Select All Pending"}</span>
            </button>

            <span className="text-xs font-mono text-slate-400">
              Selected: <strong className="text-amber-400">{selectedIds.length}</strong> of {pendingApprovals.length}
            </span>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
              <input
                type="text"
                value={bulkNote}
                onChange={(e) => setBulkNote(e.target.value)}
                placeholder="Bulk review reason..."
                className="bg-[#0B0E14] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-mono w-44 sm:w-60"
              />
              <button
                type="button"
                id="btn-bulk-reject"
                disabled={isBulkProcessing}
                onClick={handleBulkReject}
                className="px-3.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold uppercase tracking-wider text-xs rounded border border-rose-800/60 transition flex items-center space-x-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject ({selectedIds.length})</span>
              </button>
              <button
                type="button"
                id="btn-bulk-approve"
                disabled={isBulkProcessing}
                onClick={handleBulkApprove}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider text-xs rounded transition flex items-center space-x-1.5 shadow-sm"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approve ({selectedIds.length})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pending Action Cards */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
          Awaiting Executive Authorization ({pendingApprovals.length})
        </h3>

        {pendingApprovals.length === 0 ? (
          <div className="bg-[#0E1218] border border-slate-800 rounded p-8 text-center text-slate-400">
            <UserCheck className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-80" />
            <p className="font-semibold text-white font-sans">All Consequential Actions Authorized</p>
            <p className="text-xs mt-1 font-mono text-slate-500">No pending outbound emails, binding contracts, or offers in queue.</p>
          </div>
        ) : (
          pendingApprovals.map((req) => {
            const isWorking = processingId === req.id;
            const isSelected = selectedIds.includes(req.id);

            return (
              <div
                key={req.id}
                id={`approval-card-${req.id}`}
                className={`bg-[#0E1218] border rounded-xl p-5 shadow-sm space-y-4 transition-all ${
                  isSelected
                    ? "border-amber-500/70 bg-[#121722]"
                    : "border-slate-800 border-l-4 border-l-amber-500"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    {/* Checkbox for bulk actions */}
                    <button
                      type="button"
                      onClick={() => handleToggleSelect(req.id)}
                      className="text-slate-400 hover:text-white transition"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                      )}
                    </button>

                    <div className="p-2 rounded bg-amber-500/10 text-amber-400">
                      {req.type === "SEND_OUTREACH" ? (
                        <Mail className="w-5 h-5" />
                      ) : req.type === "SUBMIT_OFFER" ? (
                        <Send className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm font-sans">{req.action}</h4>
                      <p className="text-xs text-slate-400 font-mono">
                        Requested by <strong className="text-emerald-400">{req.requestedBy}</strong> •{" "}
                        {new Date(req.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 self-start sm:self-auto uppercase tracking-wider">
                    AWAITING SIGN-OFF
                  </span>
                </div>

                {/* Details Breakdown */}
                <div className="bg-[#161B22] p-3.5 rounded border border-slate-800 text-xs space-y-2 font-mono">
                  <div className="font-semibold text-slate-400 text-[11px] uppercase">Transaction Parameters:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(req.details).map(([k, v]) => (
                      <div key={k} className="bg-[#0B0E14] p-2 rounded border border-slate-800">
                        <span className="text-slate-500 text-[10px] uppercase block">{k}:</span>
                        <span className="text-slate-200 font-semibold truncate block">
                          {typeof v === "object" ? JSON.stringify(v) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Optional Note & Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  <input
                    type="text"
                    value={actionNotes[req.id] || ""}
                    onChange={(e) => setActionNotes({ ...actionNotes, [req.id]: e.target.value })}
                    placeholder="Optional reviewer notes / stipulations..."
                    className="flex-1 bg-[#0B0E14] border border-slate-800 rounded px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={isWorking}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold uppercase tracking-wider rounded border border-slate-700 transition flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={isWorking}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider rounded transition flex items-center space-x-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{isWorking ? "Processing..." : "Approve & Execute"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Completed History List */}
      {completedApprovals.length > 0 && (
        <div className="bg-[#0E1218] border border-slate-800 rounded-xl p-5 space-y-3 font-mono text-xs">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Audit Trail History ({completedApprovals.length})
          </h4>
          <div className="divide-y divide-slate-800">
            {completedApprovals.map((req) => (
              <div key={req.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white">{req.action}</span>
                  <span className="text-slate-500 ml-2">
                    {req.decisionBy || "Operator"} at {new Date(req.decidedAt || req.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    req.status === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
