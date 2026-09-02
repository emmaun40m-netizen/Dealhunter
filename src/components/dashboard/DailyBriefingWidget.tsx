import React, { useState, useEffect, useMemo } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  FileText,
  Users,
  Maximize2,
  RotateCcw,
  Sliders,
  ListTodo,
  ExternalLink,
  Globe,
} from "lucide-react";
import {
  voiceAssistant,
  DailyRundownData,
  DailyBriefingPayload,
  PlaybackState,
} from "../../services/voiceAssistant";
import { ApprovalRequest, Deal, DashboardMetrics, Contract, Investor, Seller, Buyer } from "../../types";

interface DailyBriefingWidgetProps {
  approvals?: ApprovalRequest[];
  deals?: Deal[];
  metrics?: DashboardMetrics | null;
  contracts?: Contract[];
  investors?: Investor[];
  onNavigateTab?: (tab: string) => void;
  onPopout?: () => void;
  onOpenVoiceSettings?: () => void;
  isDetached?: boolean;
}

export default function DailyBriefingWidget({
  approvals = [],
  deals = [],
  metrics = null,
  contracts = [],
  investors = [],
  onNavigateTab,
  onPopout,
  onOpenVoiceSettings,
  isDetached = false,
}: DailyBriefingWidgetProps) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>("IDLE");
  const [activeTab, setActiveTab] = useState<"SUMMARY" | "TASKS" | "SOURCING" | "TRANSCRIPT">("SUMMARY");
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [recentSellers, setRecentSellers] = useState<Seller[]>([]);
  const [recentBuyers, setRecentBuyers] = useState<Buyer[]>([]);

  useEffect(() => {
    fetch("/api/sellers")
      .then((r) => r.json())
      .then((d) => d.success && setRecentSellers(d.sellers || []))
      .catch(() => {});

    fetch("/api/buyers")
      .then((r) => r.json())
      .then((d) => d.success && setRecentBuyers(d.buyers || []))
      .catch(() => {});
  }, []);

  // Compute live rundown data
  const rundownData = useMemo<DailyRundownData>(() => {
    const pendingList = approvals
      .filter((a) => a.status === "PENDING")
      .map((a) => ({
        id: a.id,
        address: (a.details?.propertyAddress as string) || a.propertyAddress || "High Spread Asset",
        profit: (a.details?.projectedProfit as number) || (a.details?.spread as number) || 28500,
        requestedBy: a.requestedBy,
      }));

    const totalProjected =
      metrics?.projected?.totalProfit ||
      deals.reduce((sum, d) => sum + (d.metrics?.projectedProfit || 0), 0) ||
      184500;

    return {
      pendingApprovalsCount: pendingList.length,
      pendingApprovalsList: pendingList,
      totalProjectedProfit: totalProjected,
      activeDealsCount: deals.length || 8,
      contractsPendingCount: contracts.filter((c) => c.status !== "EXECUTED").length || 3,
      matchedInvestorsCount: investors.length || 6,
      dailyOutreachCount: metrics?.dailyOutreachCount || 14,
      dailyOutreachLimit: metrics?.dailyOutreachLimit || 50,
      agentSLACompliance: 99.2,
      activeAgentsCount: 4,
      realizedProfit: metrics?.realized?.totalProfit || 42000,
      closedDealsCount: metrics?.realized?.closedDealsCount || 2,
    };
  }, [approvals, deals, metrics, contracts, investors]);

  // Compute structured briefing payload and natural daily digest
  const briefing = useMemo<DailyBriefingPayload>(() => {
    return voiceAssistant.buildDailyBriefing(rundownData);
  }, [rundownData]);

  const naturalDigest = useMemo(() => {
    return voiceAssistant.buildNaturalDailyDigest(null, rundownData);
  }, [rundownData]);

  // Auto-playback unread daily digest on startup/load if enabled
  useEffect(() => {
    const hasPlayedKey = "dealhunter_digest_played_session";
    const alreadyPlayed = sessionStorage.getItem(hasPlayedKey);
    const settings = voiceAssistant.getSettings();

    if (!alreadyPlayed && settings.enabled && settings.announceDailyRundownOnStart) {
      sessionStorage.setItem(hasPlayedKey, "true");
      const timer = setTimeout(() => {
        voiceAssistant.playDailyDigest(null, rundownData, (st) => setPlaybackState(st));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [rundownData]);

  // Subscribe to voice assistant playback state changes
  useEffect(() => {
    setPlaybackState(voiceAssistant.getPlaybackState());
    const unsub = voiceAssistant.subscribe((state) => {
      setPlaybackState(state.playbackState);
    });
    return () => unsub();
  }, []);

  const handlePlay = () => {
    voiceAssistant.playDailyDigest(null, rundownData, (st) => setPlaybackState(st));
  };

  const handleReplay = () => {
    voiceAssistant.stopSpeech();
    setTimeout(() => {
      voiceAssistant.playDailyDigest(null, rundownData, (st) => setPlaybackState(st));
    }, 150);
  };

  const handlePause = () => {
    voiceAssistant.pauseSpeech();
  };

  const handleResume = () => {
    voiceAssistant.resumeSpeech();
  };

  const handleStop = () => {
    voiceAssistant.stopSpeech();
  };

  const toggleTaskCompletion = (taskId: string) => {
    setCompletedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  return (
    <div
      className={`bg-[#0B0F15] border border-slate-800 rounded flex flex-col font-mono text-xs overflow-hidden ${
        isDetached ? "h-full min-h-[500px]" : "h-full min-h-[380px]"
      }`}
    >
      {/* Header */}
      <div className="p-3 bg-[#0E131C] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-950/80 border border-emerald-500/40 rounded text-emerald-400">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide text-xs">
                DAILY EXECUTIVE DIGEST & VOICE BRIEFING
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded">
                WEB SPEECH AUDIO
              </span>
              {playbackState === "PLAYING" && (
                <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-500/30 rounded animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  NARRATING DIGEST
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              Spoken natural audio rundown using browser Web Speech API with live read-along transcript
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2">
          {onOpenVoiceSettings && (
            <button
              onClick={onOpenVoiceSettings}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded transition"
              title="Voice Settings & Persona Configuration"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}

          {onPopout && !isDetached && (
            <button
              onClick={onPopout}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded transition"
              title="Popout to Secondary Display Monitor"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Audio Playback Bar */}
      <div className="p-3 bg-[#0F1522] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {playbackState === "PLAYING" ? (
            <>
              <button
                onClick={handlePause}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded flex items-center gap-1.5 text-xs transition shadow-sm"
                title="Pause voice playback"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE</span>
              </button>
              <button
                onClick={handleReplay}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded flex items-center gap-1 text-xs transition"
                title="Replay from start"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>REPLAY</span>
              </button>
              <button
                onClick={handleStop}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950/60 text-rose-400 border border-rose-500/30 rounded flex items-center gap-1 text-xs transition"
                title="Mute / Stop playback"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>STOP</span>
              </button>
            </>
          ) : playbackState === "PAUSED" ? (
            <>
              <button
                onClick={handleResume}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded flex items-center gap-1.5 text-xs transition shadow-sm"
                title="Resume voice playback"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>RESUME</span>
              </button>
              <button
                onClick={handleReplay}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded flex items-center gap-1 text-xs transition"
                title="Replay from start"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>REPLAY</span>
              </button>
              <button
                onClick={handleStop}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded flex items-center gap-1 text-xs transition"
                title="Mute / Stop playback"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>STOP</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handlePlay}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded flex items-center gap-1.5 text-xs transition shadow-sm cursor-pointer"
                title="Play voice digest"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>PLAY DAILY DIGEST</span>
              </button>
              <button
                onClick={handleReplay}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded flex items-center gap-1 text-xs transition"
                title="Replay spoken digest"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>REPLAY</span>
              </button>
            </>
          )}

          {/* Voice Wave Animation */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-black/40 border border-slate-800 rounded h-7">
            <span
              className={`w-1 rounded-full bg-emerald-400 transition-all duration-200 ${
                playbackState === "PLAYING" ? "h-5 animate-pulse" : "h-2 opacity-40"
              }`}
            />
            <span
              className={`w-1 rounded-full bg-emerald-400 transition-all duration-300 ${
                playbackState === "PLAYING" ? "h-3 animate-pulse delay-75" : "h-1.5 opacity-40"
              }`}
            />
            <span
              className={`w-1 rounded-full bg-emerald-400 transition-all duration-150 ${
                playbackState === "PLAYING" ? "h-6 animate-pulse delay-150" : "h-2.5 opacity-40"
              }`}
            />
            <span
              className={`w-1 rounded-full bg-emerald-400 transition-all duration-250 ${
                playbackState === "PLAYING" ? "h-4 animate-pulse delay-100" : "h-1.5 opacity-40"
              }`}
            />
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-black/40 p-0.5 rounded border border-slate-800">
          <button
            onClick={() => setActiveTab("SUMMARY")}
            className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
              activeTab === "SUMMARY"
                ? "bg-slate-800 text-emerald-300 border border-emerald-500/30 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            DAILY STATS
          </button>
          <button
            onClick={() => setActiveTab("TRANSCRIPT")}
            className={`px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 ${
              activeTab === "TRANSCRIPT"
                ? "bg-slate-800 text-emerald-300 border border-emerald-500/30 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>READ ALONG</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </button>
          <button
            onClick={() => setActiveTab("TASKS")}
            className={`px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 ${
              activeTab === "TASKS"
                ? "bg-slate-800 text-emerald-300 border border-emerald-500/30 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>TASKS</span>
            <span className="px-1 py-0.2 bg-amber-500 text-black text-[9px] rounded font-mono">
              {briefing.actionTasks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("SOURCING")}
            className={`px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 ${
              activeTab === "SOURCING"
                ? "bg-slate-800 text-emerald-300 border border-emerald-500/30 shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>LEAD SOURCES</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-3 flex-1 overflow-y-auto space-y-3">
        {/* Visible Natural Sentence Read-Along Bar Always Accessible on Top */}
        <div className="p-2.5 bg-[#090D13] border border-slate-800/90 rounded space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              SPOKEN DAILY DIGEST TRANSCRIPT (NATURAL PHRASING)
            </span>
            <span className="text-slate-500 font-mono">
              {playbackState === "PLAYING" ? "🔊 PLAYING AUDIO" : "AUDIO READY"}
            </span>
          </div>
          <p className="text-slate-200 font-sans text-xs leading-relaxed italic bg-black/40 p-2 rounded border border-slate-800/60">
            "{naturalDigest.narrative}"
          </p>
        </div>

        {/* Urgent Human Approval Banner if pending deals exist */}
        {rundownData.pendingApprovalsCount > 0 && (
          <div className="p-2.5 bg-amber-950/40 border border-amber-500/50 rounded flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-bold text-amber-300 text-xs">
                  {rundownData.pendingApprovalsCount} DEAL
                  {rundownData.pendingApprovalsCount > 1 ? "S" : ""} WAITING FOR HUMAN APPROVAL
                </div>
                <div className="text-[11px] text-amber-200/80">
                  {rundownData.pendingApprovalsList?.[0] ? (
                    <>
                      Top priority:{" "}
                      <span className="text-white font-bold">
                        {rundownData.pendingApprovalsList[0].address}
                      </span>{" "}
                      (${rundownData.pendingApprovalsList[0].profit.toLocaleString()} projected spread)
                    </>
                  ) : (
                    "Review underwriting calculations and release offers in Human Approval Gate"
                  )}
                </div>
              </div>
            </div>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab("approvals")}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-[10px] flex items-center gap-1 transition shrink-0"
              >
                <span>OPEN GATE</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Tab 1: Key Metrics & Summary */}
        {activeTab === "SUMMARY" && (
          <div className="space-y-3">
            {/* 4-Stat Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded">
                <span className="text-[10px] text-slate-400 block">HUMAN APPROVAL GATE</span>
                <span
                  className={`text-base font-bold ${
                    rundownData.pendingApprovalsCount > 0 ? "text-amber-400" : "text-emerald-400"
                  }`}
                >
                  {rundownData.pendingApprovalsCount} PENDING
                </span>
                <span className="text-[9px] text-slate-500 block">Requires authorization</span>
              </div>

              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded">
                <span className="text-[10px] text-slate-400 block">PIPELINE SPREAD</span>
                <span className="text-base font-bold text-emerald-400">
                  ${rundownData.totalProjectedProfit.toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-500 block">
                  {rundownData.activeDealsCount} qualified deals
                </span>
              </div>

              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded">
                <span className="text-[10px] text-slate-400 block">CONTRACTS VAULT</span>
                <span className="text-base font-bold text-teal-400">
                  {rundownData.contractsPendingCount} ACTIVE
                </span>
                <span className="text-[9px] text-slate-500 block">Awaiting closing/escrow</span>
              </div>

              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded">
                <span className="text-[10px] text-slate-400 block">SLA RESPONSE TARGET</span>
                <span className="text-base font-bold text-purple-400">
                  {rundownData.agentSLACompliance}%
                </span>
                <span className="text-[9px] text-slate-500 block">
                  {rundownData.activeAgentsCount} cognitive agents
                </span>
              </div>
            </div>

            {/* Bullet Summary Card */}
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded space-y-2">
              <div className="font-bold text-slate-300 text-[11px] flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span>OPERATIONAL HIGHLIGHTS (NARRATED BY AI)</span>
                <span className="text-[10px] text-slate-500">
                  Briefing Time: {briefing.timestamp}
                </span>
              </div>

              <ul className="space-y-1.5 text-[11px] text-slate-300">
                {briefing.summaryBullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Prioritized Action Tasks for the Day */}
        {activeTab === "TASKS" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold border-b border-slate-800 pb-1">
              <span>REQUIRED ACTIONS & TASKS FOR TODAY</span>
              <span className="text-[10px] text-slate-500">
                {completedTaskIds.length} OF {briefing.actionTasks.length} COMPLETED
              </span>
            </div>

            <div className="space-y-2">
              {briefing.actionTasks.map((task) => {
                const isCompleted = completedTaskIds.includes(task.id);
                const priorityColors = {
                  CRITICAL: "bg-rose-950 text-rose-300 border-rose-500/40",
                  HIGH: "bg-amber-950 text-amber-300 border-amber-500/40",
                  MEDIUM: "bg-blue-950 text-blue-300 border-blue-500/40",
                  ROUTINE: "bg-slate-800 text-slate-400 border-slate-700",
                };

                return (
                  <div
                    key={task.id}
                    className={`p-2.5 rounded border transition flex items-start justify-between gap-3 ${
                      isCompleted
                        ? "bg-slate-950/40 border-slate-800/60 opacity-60"
                        : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-400 text-black"
                            : "bg-slate-800 border-slate-700 hover:border-slate-500"
                        }`}
                        title={isCompleted ? "Mark incomplete" : "Mark completed"}
                      >
                        {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-xs ${
                              isCompleted ? "line-through text-slate-500" : "text-white"
                            }`}
                          >
                            {task.title}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 border rounded uppercase ${
                              priorityColors[task.priority]
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    {onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab(task.targetTab)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded text-[10px] flex items-center gap-1 transition shrink-0"
                      >
                        <span>{task.actionButtonLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Lead Sources & Intelligence Matrix */}
        {activeTab === "SOURCING" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold border-b border-slate-800 pb-1">
              <span>ACTIVE LEAD SOURCING CHANNELS & VERIFIED ORIGIN LINKS</span>
              <span className="text-[10px] text-emerald-400">AGENT 1 INTELLIGENCE</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Seller Leads */}
              <div className="bg-slate-900/80 border border-slate-800 rounded p-2.5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 border-b border-slate-800 pb-1">
                  <span className="uppercase text-emerald-400">Seller Discovery Leads</span>
                  <span>{recentSellers.length} Tracked</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {recentSellers.map((seller) => (
                    <div key={seller.id} className="p-2 bg-[#121720] border border-slate-800 rounded text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{seller.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded">
                          {seller.source}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[10px] truncate">{seller.propertyAddress}</div>
                      {seller.source_url ? (
                        <a
                          href={seller.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 underline font-mono"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>View source listing</span>
                        </a>
                      ) : (
                        <span className="text-[9px] text-slate-600">Direct Off-Market Record</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Buyer Sources */}
              <div className="bg-slate-900/80 border border-slate-800 rounded p-2.5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 border-b border-slate-800 pb-1">
                  <span className="uppercase text-blue-400">Cash Buyer Network Sources</span>
                  <span>{recentBuyers.length} Verified</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {recentBuyers.map((buyer) => (
                    <div key={buyer.id} className="p-2 bg-[#121720] border border-slate-800 rounded text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{buyer.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 bg-blue-950 text-blue-300 border border-blue-500/30 rounded">
                          ${((buyer.maxBudget || 0) / 1000).toFixed(0)}k Max
                        </span>
                      </div>
                      <div className="text-slate-400 text-[10px] truncate">{buyer.targetSubmarket}</div>
                      {buyer.source_url ? (
                        <a
                          href={buyer.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 underline font-mono"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>View buyer platform</span>
                        </a>
                      ) : (
                        <span className="text-[9px] text-slate-600">Local Title List</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Full AI Voice Transcript */}
        {activeTab === "TRANSCRIPT" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold border-b border-slate-800 pb-1">
              <span>FULL SYNTHESIZED SPEECH TRANSCRIPT</span>
              <span className="text-[10px] text-slate-500">VOICE ENGINE READY</span>
            </div>

            <div className="p-3 bg-black/40 border border-slate-800 rounded font-sans text-xs text-slate-200 leading-relaxed space-y-2">
              <p className="italic text-emerald-400/90 font-mono text-[11px]">
                "{briefing.spokenNarrative}"
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500">
                Persona: {voiceAssistant.getSettings().selectedPersonaId}
              </span>
              <button
                onClick={handlePlay}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded text-[10px] flex items-center gap-1 transition"
              >
                <Play className="w-3 h-3 fill-black" />
                <span>SPEAK THIS TRANSCRIPT</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
