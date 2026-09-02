import { useState } from "react";
import {
  Mail,
  Send,
  Zap,
  CheckCircle2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { OutreachMessage, Property } from "../types";

interface OutreachHubProps {
  messages: OutreachMessage[];
  properties: Property[];
  sentToday: number;
  dailyLimit: number;
  onDraftOutreach: (propertyId: string, tone: "cash_buyer" | "direct" | "relationship") => Promise<void>;
  onSendMessage: (messageId: string) => Promise<void>;
  onRefresh: () => void;
}

export default function OutreachHub({
  messages,
  properties,
  sentToday,
  dailyLimit,
  onDraftOutreach,
  onSendMessage,
  onRefresh,
}: OutreachHubProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    properties[0]?.id || ""
  );
  const [selectedTone, setSelectedTone] = useState<"cash_buyer" | "direct" | "relationship">(
    "cash_buyer"
  );
  const [isDrafting, setIsDrafting] = useState(false);
  const [activeMessage, setActiveMessage] = useState<OutreachMessage | null>(
    messages[0] || null
  );

  const handleGenerateDraft = async () => {
    if (!selectedPropertyId) return;
    setIsDrafting(true);
    try {
      await onDraftOutreach(selectedPropertyId, selectedTone);
      onRefresh();
    } finally {
      setIsDrafting(false);
    }
  };

  const pctLimitUsed = Math.min(100, Math.round((sentToday / dailyLimit) * 100));

  return (
    <div className="space-y-6">
      {/* Header & Daily Rate Limiter Gauge */}
      <div className="bg-[#0E1218] border border-slate-800 rounded p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-purple-500/10 text-purple-400 border border-purple-500/30">
                Agent 3 Communications
              </span>
              <span className="text-xs text-slate-500 font-mono">OUTREACH SUITE</span>
            </div>
            <h2 className="text-2xl font-light text-white tracking-tight mt-1 font-sans">
              Contact Safety Gates & Listing Outreach Hub
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enforces strict contact safety gates, 48-hour cooldowns, and daily rate caps before sending outreach.
            </p>
          </div>

          {/* Daily Rate Limiter Card */}
          <div className="bg-[#161B22] p-4 rounded border border-slate-800 shrink-0 min-w-[240px] font-mono">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-500 uppercase text-[10px] font-bold flex items-center">
                <Zap className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Daily Send Cap:
              </span>
              <span className="font-bold text-amber-300">
                {sentToday} / {dailyLimit}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  pctLimitUsed >= 90
                    ? "bg-rose-500"
                    : pctLimitUsed >= 50
                    ? "bg-amber-400"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${pctLimitUsed}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1 uppercase">
              {dailyLimit - sentToday} sends remaining today
            </span>
          </div>
        </div>
      </div>

      {/* Safety Gate Checklist Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0E1218] p-4 rounded border border-slate-800 text-xs font-mono">
        <div className="flex items-center space-x-2 text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Email Verified</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>DNC Cleared</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Max 3 Touches</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>48h Cooldown</span>
        </div>
      </div>

      {/* Main Workspace Grid: Draft Studio on Left, Message List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Outreach Generator (5 cols) */}
        <div className="lg:col-span-5 bg-[#0E1218] border border-slate-800 rounded p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Generate Outreach Draft</span>
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="block text-slate-500 text-[10px] uppercase mb-1">Target Property:</label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full bg-[#0B0E14] border border-slate-800 text-white rounded p-2 focus:outline-none focus:border-emerald-500 font-mono text-xs"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.address} (${(p.askingPrice ?? 0).toLocaleString()} - {p.city}, {p.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 text-[10px] uppercase mb-1">Outreach Tone Strategy:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "cash_buyer", label: "Cash Buyer" },
                  { id: "direct", label: "Direct Offer" },
                  { id: "relationship", label: "Partner" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTone(t.id as any)}
                    className={`py-2 px-2 rounded text-center text-xs uppercase font-bold tracking-wider transition font-mono ${
                      selectedTone === t.id
                        ? "bg-purple-600 text-white"
                        : "bg-[#161B22] hover:bg-slate-800 text-slate-400 border border-slate-800"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateDraft}
              disabled={isDrafting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest rounded transition flex items-center justify-center space-x-2 font-mono"
            >
              {isDrafting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Draft via Agent 3</span>
            </button>
          </div>

          {/* Active Messages Mini Feed */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
              Outreach Queue ({messages.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => setActiveMessage(msg)}
                  className={`p-3 rounded border text-xs cursor-pointer transition font-mono ${
                    activeMessage?.id === msg.id
                      ? "bg-[#161B22] border-emerald-500/50 border-l-2 border-l-emerald-500"
                      : "bg-[#0B0E14] border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white truncate">
                      {msg.recipientName || msg.contactName || "Contact"}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                        msg.status === "SENT"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : msg.status === "APPROVED"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {msg.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{msg.subject}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Message Inspector & Action Suite (7 cols) */}
        <div className="lg:col-span-7 bg-[#0E1218] border border-slate-800 rounded p-5 shadow-sm space-y-4">
          {activeMessage ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-base font-sans">{activeMessage.subject}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    To: <strong className="text-slate-200">{activeMessage.recipientName || activeMessage.contactName || "Contact"}</strong> ({activeMessage.recipientEmail || activeMessage.contactEmail || "Email on file"})
                  </p>
                </div>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                    activeMessage.status === "SENT"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {activeMessage.status}
                </span>
              </div>

              {/* Email Content Box */}
              <div className="bg-[#0B0E14] p-4 rounded border border-slate-800 font-sans text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                {activeMessage.body}
              </div>

              {/* Seller Reply Box if any */}
              {activeMessage.replyReceived && (
                <div className="bg-[#161B22] border border-emerald-500/40 p-3.5 rounded text-xs space-y-1 font-mono">
                  <div className="font-bold text-emerald-400 flex items-center space-x-1.5 uppercase text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Seller / Agent Reply Received</span>
                  </div>
                  <p className="text-slate-300 italic font-sans">
                    "{activeMessage.replyText || "Yes, the seller is open to a cash offer with proof of funds."}"
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800 font-mono text-xs">
                <span className="text-[11px] text-slate-500">
                  Tone: <strong className="text-purple-400 uppercase">{activeMessage.tone}</strong>
                </span>

                <div className="flex items-center space-x-2">
                  {activeMessage.status === "DRAFT" || activeMessage.status === "APPROVED" ? (
                    <button
                      onClick={() => onSendMessage(activeMessage.id)}
                      disabled={sentToday >= dailyLimit}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center space-x-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send via Agent 3</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1 uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Dispatched & Audited</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-mono text-xs">
              <Mail className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p>Select a message or generate a new draft above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
