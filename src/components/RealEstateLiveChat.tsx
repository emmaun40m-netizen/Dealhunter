import { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Scale,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Search,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import { RealEstateChatMessage, StateWholesaleRule, RealEstateMarketNews } from "../types";
import { STATE_WHOLESALE_RULES, LIVE_REAL_ESTATE_NEWS } from "../services/complianceData";
import { store } from "../services/store";

export default function RealEstateLiveChat() {
  const [messages, setMessages] = useState<RealEstateChatMessage[]>(store.chatMessages);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [news, setNews] = useState<RealEstateMarketNews[]>(LIVE_REAL_ESTATE_NEWS);
  const [activeTab, setActiveTab] = useState<"CHAT" | "MATRIX">("CHAT");
  const [matrixSearch, setMatrixSearch] = useState("");
  const [matrixFilter, setMatrixFilter] = useState<"ALL" | "LICENSE_REQUIRED" | "DISCLOSURE_REQUIRED" | "DIRECT_ASSIGNMENT_ALLOWED">("ALL");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    fetch("/api/chat/messages")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.messages) {
          setMessages(data.messages);
        }
      })
      .catch(console.error);

    fetch("/api/compliance/news")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.news) {
          setNews(data.news);
        }
      })
      .catch(console.error);
  }, []);

  const handleSendMessage = async (queryToSend?: string) => {
    const text = queryToSend || inputQuery;
    if (!text.trim() || isLoading) return;

    setInputQuery("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = await response.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
      } else {
        // Fallback directly to store
        const aiReply = await store.askLegalAdvisor(text);
        setMessages([...store.chatMessages]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const aiReply = await store.askLegalAdvisor(text);
      setMessages([...store.chatMessages]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Which states require a real estate license to wholesale?",
    "How do I wholesale legally in Oklahoma without a license?",
    "What are the contract rules in Illinois under SB 1872?",
    "Can I put $0 down earnest money on a purchase agreement?",
    "Texas TREC equitable interest disclosure rules",
    "Explain Double Closing with transactional funding vs Assignment",
  ];

  const stateRulesArray = Object.values(STATE_WHOLESALE_RULES);
  const filteredStates = stateRulesArray.filter((rule) => {
    const matchesSearch =
      rule.stateName.toLowerCase().includes(matrixSearch.toLowerCase()) ||
      rule.stateCode.toLowerCase().includes(matrixSearch.toLowerCase()) ||
      rule.statute.toLowerCase().includes(matrixSearch.toLowerCase());
    const matchesFilter = matrixFilter === "ALL" || rule.licenseStatus === matrixFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Live Market & Regulatory News Ticker */}
      <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold uppercase tracking-wider">LIVE REAL ESTATE & REGULATORY FEED</span>
        </div>

        <div className="flex-1 overflow-x-auto scrollbar-none flex items-center gap-4 text-xs font-mono">
          {news.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 bg-[#0B0E14] border border-slate-800/80 px-2.5 py-1 rounded whitespace-nowrap"
            >
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                item.impactLevel === "HIGH"
                  ? "bg-rose-950/60 text-rose-300 border border-rose-500/30"
                  : item.impactLevel === "MEDIUM"
                  ? "bg-amber-950/60 text-amber-300 border border-amber-500/30"
                  : "bg-blue-950/60 text-blue-300 border border-blue-500/30"
              }`}>
                {item.category}
              </span>
              <span className="text-slate-200 font-medium">{item.headline}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-[#080B10] p-1 rounded border border-slate-800 shrink-0 text-xs font-mono">
          <button
            onClick={() => setActiveTab("CHAT")}
            className={`px-3 py-1 rounded transition ${activeTab === "CHAT" ? "bg-emerald-600 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
          >
            AI LEGAL ADVISOR
          </button>
          <button
            onClick={() => setActiveTab("MATRIX")}
            className={`px-3 py-1 rounded transition ${activeTab === "MATRIX" ? "bg-emerald-600 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
          >
            50-STATE MATRIX
          </button>
        </div>
      </div>

      {activeTab === "CHAT" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chat Box */}
          <div className="lg:col-span-8 flex flex-col bg-[#0E1218] border border-slate-800 rounded-sm h-[680px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span>Live Real Estate AI Legal & Wholesale Advisor</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                      GEMINI GROUNDED
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Real-time intelligence on 50-state licensing rules, $0 down earnest money, and contract structures.
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Statute Codex 2026</span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm">
              {messages.map((msg) => {
                const isAi = msg.sender === "ai";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isAi ? "justify-start" : "justify-end"}`}
                  >
                    {isAi && (
                      <div className="w-7 h-7 rounded bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-sm p-4 text-xs leading-relaxed ${
                        isAi
                          ? "bg-[#080B10] border border-slate-800 text-slate-200"
                          : "bg-emerald-950/80 border border-emerald-500/40 text-white font-medium"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>

                      {/* State References Chips */}
                      {isAi && msg.stateReferences && msg.stateReferences.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                          <span className="text-slate-400">Referenced States:</span>
                          {msg.stateReferences.map((st) => (
                            <span
                              key={st}
                              className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-300 font-bold"
                            >
                              {st}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        {isAi && msg.sources && (
                          <span className="text-slate-400">Sources: {msg.sources.join(" • ")}</span>
                        )}
                      </div>
                    </div>

                    {!isAi && (
                      <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-[#080B10] border border-slate-800 rounded-sm p-3 text-xs font-mono text-emerald-400 animate-pulse">
                    Consulting 50-state wholesale statutes and contract case law...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Carousel */}
            <div className="p-2.5 bg-[#080B10] border-t border-slate-800/80 overflow-x-auto scrollbar-none flex gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-2.5 py-1 rounded bg-[#0E1218] hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white transition flex items-center gap-1 shrink-0"
                >
                  <ArrowRight className="w-3 h-3 text-emerald-400" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="p-3 border-t border-slate-800 flex items-center gap-2 bg-[#0E1218]">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask anything about wholesale licensing, state laws, $0 earnest money, double closing..."
                className="flex-1 bg-[#080B10] border border-slate-700 rounded px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputQuery.trim()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold font-mono text-xs rounded transition flex items-center gap-1.5"
              >
                <span>SEND</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Sidebar: Key Statutory Highlights & Quick State Lookups */}
          <div className="lg:col-span-4 space-y-4">
            {/* Quick State Licensing Summary Card */}
            <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider">
                <Scale className="w-4 h-4" />
                <span>Statutory Wholesaling Cheat Sheet</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Oklahoma */}
                <div className="p-2.5 bg-[#080B10] border border-rose-500/30 rounded">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-white">Oklahoma (OK)</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                      LICENSE REQUIRED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    <strong>SB 927</strong>: Unlicensed marketing of equitable interest is prohibited.
                  </p>
                  <p className="text-[11px] text-emerald-400 mt-0.5">
                    <strong>Legal Strategy</strong>: Double Close with 1-day transactional funding.
                  </p>
                </div>

                {/* Illinois */}
                <div className="p-2.5 bg-[#080B10] border border-amber-500/30 rounded">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-white">Illinois (IL)</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                      1 DEAL / YR LIMIT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    <strong>SB 1872 / 225 ILCS 454</strong>: 1 contract assignment per rolling 12 months allowed without license.
                  </p>
                  <p className="text-[11px] text-emerald-400 mt-0.5">
                    <strong>Legal Strategy</strong>: Double Close or entity novation for deal #2+.
                  </p>
                </div>

                {/* Texas */}
                <div className="p-2.5 bg-[#080B10] border border-blue-500/30 rounded">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-white">Texas (TX)</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/40">
                      DISCLOSURE MANDATE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    <strong>TREC § 1101.0045 & SB 2212</strong>: No license needed, but mandatory written disclosure of equitable interest.
                  </p>
                </div>

                {/* Michigan / Ohio / Tennessee */}
                <div className="p-2.5 bg-[#080B10] border border-emerald-500/30 rounded">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-white">MI, OH, TN, IN, MO, AL</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      DIRECT ASSIGNMENT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Full standard contract assignment freedom with $0 down EMD enforceable.
                  </p>
                </div>
              </div>
            </div>

            {/* Zero Down Earnest Money Rules Card */}
            <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>$0 Earnest Money Rule Guide</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Not every deal requires cash down. In all 50 US jurisdictions:
              </p>
              <ul className="space-y-1 text-[11px] text-slate-400 list-disc pl-4">
                <li>Mutual promise to buy & sell constitutes sufficient legal consideration.</li>
                <li>Buyer’s expenditure on inspections forms promissory reliance consideration.</li>
                <li>When sellers request token deposits, $10 or $100 promissory notes satisfy title company escrow protocols.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* 50-State Licensing Compliance Interactive Matrix */
        <div className="bg-[#0E1218] border border-slate-800 rounded-sm p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                50-State Real Estate Wholesale Licensing Index
              </h2>
              <p className="text-xs text-slate-400">
                Complete statutory breakdown of real estate licensing laws, disclosure mandates, and recommended closing strategies.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search state, code, or statute..."
                  value={matrixSearch}
                  onChange={(e) => setMatrixSearch(e.target.value)}
                  className="bg-[#0B0E14] border border-slate-700 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={matrixFilter}
                onChange={(e: any) => setMatrixFilter(e.target.value)}
                className="bg-[#0B0E14] border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All States ({stateRulesArray.length})</option>
                <option value="LICENSE_REQUIRED">License Required (e.g. OK, IL, SC)</option>
                <option value="DISCLOSURE_REQUIRED">Disclosure Required (e.g. TX, AZ, FL)</option>
                <option value="DIRECT_ASSIGNMENT_ALLOWED">Direct Assignment Allowed</option>
              </select>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredStates.map((rule) => {
              const isStrict = rule.licenseStatus === "LICENSE_REQUIRED";
              const isDisclosure = rule.licenseStatus === "DISCLOSURE_REQUIRED";

              return (
                <div
                  key={rule.stateCode}
                  className={`p-4 rounded-sm border transition bg-[#080B10] ${
                    isStrict
                      ? "border-rose-500/40 hover:border-rose-400"
                      : isDisclosure
                      ? "border-amber-500/40 hover:border-amber-400"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">{rule.stateName}</span>
                      <span className="text-xs font-mono text-slate-400 font-bold">({rule.stateCode})</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        isStrict
                          ? "bg-rose-950 text-rose-300 border border-rose-500/40"
                          : isDisclosure
                          ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                      }`}
                    >
                      {isStrict ? "LICENSE REQ." : isDisclosure ? "DISCLOSURE REQ." : "ASSIGNMENT OK"}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-mono text-emerald-400 font-semibold">
                    Statute: {rule.statute}
                  </div>

                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {rule.summary}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1 text-[11px] font-mono">
                    <div className="text-slate-400">
                      <span className="text-slate-400">Strategy: </span>
                      <span className="text-white font-medium">{rule.recommendedStrategy}</span>
                    </div>
                    <div className="text-slate-400">
                      <span className="text-slate-400">Earnest Money: </span>
                      <span className="text-amber-300">{rule.earnestMoneyStandard}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab("CHAT");
                      handleSendMessage(`Explain the real estate wholesaling and licensing rules in ${rule.stateName} (${rule.stateCode}) under ${rule.statute}`);
                    }}
                    className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-center text-[11px] font-mono text-slate-300 hover:text-white transition flex items-center justify-center gap-1"
                  >
                    <span>Ask AI Legal Advisor</span>
                    <ChevronRight className="w-3 h-3 text-emerald-400" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
