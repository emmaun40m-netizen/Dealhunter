import { useState, useEffect } from "react";
import {
  Radio,
  Pause,
  Play,
  Filter,
  Maximize2,
  ExternalLink,
  Zap,
  Building,
  AlertTriangle,
  DollarSign,
  Send,
  Cpu,
  Landmark,
  Layers,
  Search,
} from "lucide-react";

export interface LiveFeedItem {
  id: string;
  category: "MLS_AUCTION" | "AGENT_COGNITIVE" | "ESCROW_WIRE" | "SELLER_REPLY";
  title: string;
  source: string;
  message: string;
  timestamp: string;
  badge: string;
  badgeColor: string;
  dataPayload?: any;
}

interface LiveFeedsWidgetProps {
  onPopout?: () => void;
  isDetached?: boolean;
}

export default function LiveFeedsWidget({ onPopout, isDetached }: LiveFeedsWidgetProps) {
  const [isStreaming, setIsStreaming] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [feeds, setFeeds] = useState<LiveFeedItem[]>([
    {
      id: "feed-1",
      category: "AGENT_COGNITIVE",
      title: "Agent 4 (Virtual Closer)",
      source: "Statutory Contract Generator",
      message: "Generated 50-State Statutory Double Close & Assignment Agreement with $0 Down clause for 8422 Artesian St.",
      timestamp: "12s ago",
      badge: "AGENT 4",
      badgeColor: "bg-indigo-950 text-indigo-300 border-indigo-500/40",
      dataPayload: {
        property: "8422 Artesian St, Detroit, MI",
        contractType: "DOUBLE_CLOSE_A_B",
        earnestMoney: "$0 (Waived per Clause 4b)",
        spread: "$35,000",
      },
    },
    {
      id: "feed-2",
      category: "MLS_AUCTION",
      title: "County Tax Lien Auction Notice",
      source: "Wayne County Public Records",
      message: "New pre-foreclosure tax lien filed on 14209 Promenade Ave. Redemption deadline 60 days.",
      timestamp: "45s ago",
      badge: "TAX LIEN",
      badgeColor: "bg-amber-950 text-amber-300 border-amber-500/40",
      dataPayload: {
        parcelId: "22-094-182",
        delinquentAmount: "$3,420.50",
        assessedARV: "$195,000",
        equitySpread: "78.4%",
      },
    },
    {
      id: "feed-3",
      category: "ESCROW_WIRE",
      title: "FedNow Settlement Received",
      source: "JPMorgan Escrow Settlement",
      message: "Direct deposit of $20,000 assignment fee cleared from Apex Turnkey Rentals into Operating Account.",
      timestamp: "2m ago",
      badge: "WIRE SETTLED",
      badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-500/40",
      dataPayload: {
        txRef: "ACH-FEDNOW-98421",
        amount: "$20,000.00",
        clearedBank: "JPMorgan Chase •••• 4192",
      },
    },
    {
      id: "feed-4",
      category: "AGENT_COGNITIVE",
      title: "Agent 2 (Automated Underwriter)",
      source: "MLS Comps Multi-Regression",
      message: "MAO computed at $138,400 with 37.2% ROI against 4 verified MLS comp sales.",
      timestamp: "4m ago",
      badge: "AGENT 2",
      badgeColor: "bg-blue-950 text-blue-300 border-blue-500/40",
      dataPayload: {
        arv: "$240,000",
        rehabEst: "$25,000",
        ruleOf70MAO: "$138,400",
        confidence: "98.7%",
      },
    },
    {
      id: "feed-5",
      category: "SELLER_REPLY",
      title: "Agent 3 Inbound Seller Message",
      source: "SMS Direct / Email Gateway",
      message: "Marcus Vance responded: 'We are willing to consider cash offers with a 14-day close.'",
      timestamp: "8m ago",
      badge: "INBOUND LEAD",
      badgeColor: "bg-teal-950 text-teal-300 border-teal-500/40",
    },
  ]);

  // Simulated live event ticker stream
  useEffect(() => {
    if (!isStreaming) return;

    const streamEvents = [
      {
        category: "MLS_AUCTION" as const,
        title: "MLS Immediate Price Drop Alert",
        source: "Realcomp MLS Gateway",
        message: "Listing price cut by $18,000 on 3291 Virginia Park St. Days on market: 42.",
        badge: "PRICE CUT",
        badgeColor: "bg-rose-950 text-rose-300 border-rose-500/40",
        dataPayload: { newPrice: "$62,000", oldPrice: "$80,000", arv: "$165,000" },
      },
      {
        category: "AGENT_COGNITIVE" as const,
        title: "Agent 1 (National Scanner)",
        source: "Multivariate Distressed Query",
        message: "Scanned 144 new parcels in Fulton County, GA. 8 properties flagged with >40% equity.",
        badge: "AGENT 1",
        badgeColor: "bg-purple-950 text-purple-300 border-purple-500/40",
        dataPayload: { zipCode: "30318", avgDiscount: "46.2%", topLead: "921 Bankhead Hwy" },
      },
      {
        category: "ESCROW_WIRE" as const,
        title: "EMD Deposit Held in Escrow",
        source: "First American Title Agency",
        message: "Buyer earnest money deposit of $5,000 received for 8422 Artesian St escrow file.",
        badge: "EMD LOCKED",
        badgeColor: "bg-amber-950 text-amber-300 border-amber-500/40",
        dataPayload: { fileNo: "FAT-DET-9921", emdAmount: "$5,000", inspectionDaysLeft: 7 },
      },
    ];

    let eventIdx = 0;
    const interval = setInterval(() => {
      const template = streamEvents[eventIdx % streamEvents.length];
      eventIdx++;

      const newFeedItem: LiveFeedItem = {
        id: `feed-stream-${Date.now()}`,
        ...template,
        timestamp: "Just now",
      };

      setFeeds((prev) => [newFeedItem, ...prev.slice(0, 19)]);
    }, 9000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const filteredFeeds = feeds.filter((f) => {
    if (filterCategory === "ALL") return true;
    return f.category === filterCategory;
  });

  return (
    <div className="h-full flex flex-col bg-[#0E1218] border border-slate-800 rounded-sm overflow-hidden font-mono text-xs">
      {/* Header bar */}
      <div className="p-3 bg-[#111620] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-950/80 border border-indigo-500/40 rounded text-indigo-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide text-xs">
                LIVE TELEMETRY & AUCTION TICK STREAM
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded border flex items-center gap-1 ${
                  isStreaming
                    ? "bg-emerald-950 text-emerald-400 border-emerald-500/30"
                    : "bg-slate-900 text-slate-400 border-slate-700"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? "bg-emerald-400 animate-ping" : "bg-slate-500"}`} />
                {isStreaming ? "STREAMING" : "PAUSED"}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Autonomous cognitive trace, MLS price changes, and FedNow wire settlement audit
            </span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded transition"
            title={isStreaming ? "Pause Live Stream" : "Resume Live Stream"}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
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

      {/* Category filter tabs */}
      <div className="px-3 py-1.5 bg-[#0B0E14] border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto text-[10px]">
        {[
          { id: "ALL", label: "ALL EVENTS" },
          { id: "AGENT_COGNITIVE", label: "AI AGENT LOGS" },
          { id: "MLS_AUCTION", label: "MLS & AUCTIONS" },
          { id: "ESCROW_WIRE", label: "WIRES & ESCROW" },
          { id: "SELLER_REPLY", label: "LEAD RESPONSES" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`px-2 py-0.5 rounded font-bold transition whitespace-nowrap ${
              filterCategory === tab.id
                ? "bg-slate-800 text-emerald-300 border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feed items list */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 max-h-[340px] divide-y divide-slate-800/50">
        {filteredFeeds.map((feed) => {
          const isExpanded = expandedId === feed.id;
          return (
            <div key={feed.id} className="pt-2 first:pt-0 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${feed.badgeColor}`}>
                    {feed.badge}
                  </span>
                  <span className="font-bold text-slate-200 text-xs">{feed.title}</span>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">{feed.timestamp}</span>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug pl-1">{feed.message}</p>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pl-1">
                <span>Source: {feed.source}</span>
                {feed.dataPayload && (
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : feed.id)}
                    className="text-blue-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>{isExpanded ? "Hide Payload" : "Inspect Payload"}</span>
                  </button>
                )}
              </div>

              {isExpanded && feed.dataPayload && (
                <div className="mt-1.5 p-2 bg-slate-950 rounded border border-slate-800 text-[10px] font-mono text-emerald-400 overflow-x-auto">
                  <pre>{JSON.stringify(feed.dataPayload, null, 2)}</pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer bar */}
      <div className="px-3 py-1.5 bg-[#111620] border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
        <span>Channel: host_multi_monitor_sync_v2</span>
        <span>Events buffered: {feeds.length}</span>
      </div>
    </div>
  );
}
