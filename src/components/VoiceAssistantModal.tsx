import { useState, useEffect, useMemo } from "react";
import {
  Volume2,
  VolumeX,
  Mic,
  Play,
  Pause,
  Square,
  Check,
  X,
  Sliders,
  Sparkles,
  ShieldCheck,
  Radio,
  Bell,
  Cpu,
  AlertTriangle,
  ArrowRight,
  ListTodo,
  CheckCircle2,
  Terminal,
  Activity,
  RotateCcw,
  Gauge,
  History,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  PlayCircle,
  Zap,
} from "lucide-react";
import {
  voiceAssistant,
  VOICE_PERSONAS,
  VoiceSettings,
  DailyRundownData,
  DailyBriefingPayload,
  PlaybackState,
} from "../services/voiceAssistant";
import { voiceCommands, VoiceCommandLogItem } from "../services/voiceCommands";
import { ApprovalRequest, Deal, DashboardMetrics, Contract, Investor } from "../types";

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  approvals?: ApprovalRequest[];
  deals?: Deal[];
  metrics?: DashboardMetrics | null;
  contracts?: Contract[];
  investors?: Investor[];
  onNavigateTab?: (tab: string) => void;
}

type ModalTab = "BRIEFING" | "PERSONAS" | "CALIBRATION" | "COMMAND_LOGS";

export default function VoiceAssistantModal({
  isOpen,
  onClose,
  approvals = [],
  deals = [],
  metrics = null,
  contracts = [],
  investors = [],
  onNavigateTab,
}: VoiceAssistantModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>("BRIEFING");
  const [settings, setSettings] = useState<VoiceSettings>(() => voiceAssistant.getSettings());
  const [playbackState, setPlaybackState] = useState<PlaybackState>("IDLE");
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [commandLogs, setCommandLogs] = useState<VoiceCommandLogItem[]>([]);
  const [customTestPhrase, setCustomTestPhrase] = useState(
    "DealHunter AI voice calibration online. Audio output velocity and gain tuned for autonomous deal hunting."
  );
  const [isCalibrating, setIsCalibrating] = useState(false);

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

  const briefing = useMemo<DailyBriefingPayload>(() => {
    return voiceAssistant.buildDailyBriefing(rundownData);
  }, [rundownData]);

  useEffect(() => {
    if (isOpen) {
      setSettings(voiceAssistant.getSettings());
      setPlaybackState(voiceAssistant.getPlaybackState());
      setCommandLogs(voiceCommands.getCommandLogs());
    }
  }, [isOpen]);

  useEffect(() => {
    const unsubVoice = voiceAssistant.subscribe((st) => {
      setPlaybackState(st.playbackState);
    });
    const unsubCmd = voiceCommands.subscribe((st) => {
      if (st.logs) {
        setCommandLogs(st.logs);
      }
    });
    return () => {
      unsubVoice();
      unsubCmd();
    };
  }, []);

  if (!isOpen) return null;

  const handleUpdate = (partial: Partial<VoiceSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    voiceAssistant.updateSettings(partial);
  };

  const handleTestVoice = (personaId: string) => {
    voiceAssistant.updateSettings({ selectedPersonaId: personaId, enabled: true });
    const persona = VOICE_PERSONAS.find((p) => p.id === personaId);
    voiceAssistant.speak(
      `Hello. I am ${persona?.name}. Voice synthesis active for DealHunter Autonomous Engine. Ready for high-spread lead approvals.`,
      { chime: "alert", force: true }
    );
  };

  const handlePlayBriefing = () => {
    voiceAssistant.playDailyRundown(rundownData, (st) => setPlaybackState(st));
  };

  const handlePauseBriefing = () => {
    voiceAssistant.pauseSpeech();
  };

  const handleResumeBriefing = () => {
    voiceAssistant.resumeSpeech();
  };

  const handleStopBriefing = () => {
    voiceAssistant.stopSpeech();
  };

  const toggleTask = (id: string) => {
    setCompletedTasks((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleCalibrateTest = (phraseToSpeak?: string) => {
    setIsCalibrating(true);
    const phrase = phraseToSpeak || customTestPhrase;
    voiceAssistant.calibrateVoice(phrase);
    setTimeout(() => setIsCalibrating(false), 3000);
  };

  const handleResetCalibration = () => {
    handleUpdate({
      speechRate: 1.0,
      volume: 0.9,
      pitchOffset: 1.0,
    });
    voiceAssistant.speak("Voice calibration reset to normal factory baseline.", { chime: "startup" });
  };

  const handleReplayCommand = (cmdText: string) => {
    voiceCommands.executeSimulatedCommand(cmdText);
  };

  const handleClearLogs = () => {
    voiceCommands.clearCommandLogs();
    setCommandLogs([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono">
      <div className="bg-[#0E1218] border border-slate-700 w-full max-w-4xl rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-[#111620] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-950/80 border border-emerald-500/40 rounded text-emerald-400">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  AI VOICE SYNTHESIZER & COMMAND STUDIO
                </h2>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded">
                  WEB SPEECH + AUDIO ENGINE
                </span>
                {playbackState === "PLAYING" && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-500/30 rounded animate-pulse">
                    NARRATING RUNDOWN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Cognitive daily briefing, speech speed/volume calibration & voice command audit log
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Sub-Tabs */}
        <div className="flex items-center gap-1 px-4 bg-[#0B0E14] border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab("BRIEFING")}
            className={`px-3 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "BRIEFING"
                ? "border-emerald-500 text-emerald-400 bg-emerald-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>DAILY RUNDOWN & TASKS</span>
          </button>

          <button
            onClick={() => setActiveTab("CALIBRATION")}
            className={`px-3 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "CALIBRATION"
                ? "border-emerald-500 text-emerald-400 bg-emerald-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>VOICE CALIBRATION</span>
            <span className="text-[9px] px-1 bg-slate-800 text-emerald-300 rounded font-normal">
              {Math.round((settings.speechRate || 1.0) * 100)}% / {Math.round((settings.volume ?? 0.9) * 100)}%
            </span>
          </button>

          <button
            onClick={() => setActiveTab("COMMAND_LOGS")}
            className={`px-3 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "COMMAND_LOGS"
                ? "border-emerald-500 text-emerald-400 bg-emerald-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>COMMAND LOG & AUDIT</span>
            <span className="text-[9px] px-1 bg-slate-800 text-slate-300 rounded font-normal">
              {commandLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("PERSONAS")}
            className={`px-3 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === "PERSONAS"
                ? "border-emerald-500 text-emerald-400 bg-emerald-950/20"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>PERSONA STUDIO & TRIGGERS</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
          {/* TAB 1: DAILY RUNDOWN & TASKS */}
          {activeTab === "BRIEFING" && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 rounded space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-white text-xs tracking-wide">
                        TODAY'S OPERATIONAL RUNDOWN & REQUIRED TASKS
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      AI-synthesized morning briefing of active deals, human approval gates, and today's priority action items
                    </p>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center gap-2">
                    {playbackState === "PLAYING" ? (
                      <>
                        <button
                          onClick={handlePauseBriefing}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded flex items-center gap-1 text-xs transition shadow"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          <span>PAUSE</span>
                        </button>
                        <button
                          onClick={handleStopBriefing}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/30 rounded flex items-center gap-1 text-xs transition"
                        >
                          <Square className="w-3 h-3" />
                          <span>STOP</span>
                        </button>
                      </>
                    ) : playbackState === "PAUSED" ? (
                      <>
                        <button
                          onClick={handleResumeBriefing}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded flex items-center gap-1 text-xs transition shadow"
                        >
                          <Play className="w-3.5 h-3.5 fill-black" />
                          <span>RESUME</span>
                        </button>
                        <button
                          onClick={handleStopBriefing}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded flex items-center gap-1 text-xs transition"
                        >
                          <Square className="w-3 h-3" />
                          <span>STOP</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handlePlayBriefing}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded flex items-center gap-1.5 text-xs transition shadow"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>NARRATE TODAY'S RUNDOWN</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-900/90 border border-slate-800 rounded">
                    <span className="text-slate-400 text-[10px] block">APPROVAL GATE</span>
                    <span
                      className={`font-bold text-xs ${
                        rundownData.pendingApprovalsCount > 0 ? "text-amber-300" : "text-emerald-400"
                      }`}
                    >
                      {rundownData.pendingApprovalsCount} Items Pending
                    </span>
                  </div>

                  <div className="p-2 bg-slate-900/90 border border-slate-800 rounded">
                    <span className="text-slate-400 text-[10px] block">PROJECTED PROFIT</span>
                    <span className="font-bold text-emerald-400 text-xs">
                      ${rundownData.totalProjectedProfit.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2 bg-slate-900/90 border border-slate-800 rounded">
                    <span className="text-slate-400 text-[10px] block">ACTIVE CONTRACTS</span>
                    <span className="font-bold text-cyan-400 text-xs">
                      {rundownData.contractsPendingCount} Vault Items
                    </span>
                  </div>

                  <div className="p-2 bg-slate-900/90 border border-slate-800 rounded">
                    <span className="text-slate-400 text-[10px] block">OUTREACH TODAY</span>
                    <span className="font-bold text-slate-200 text-xs">
                      {rundownData.dailyOutreachCount} / {rundownData.dailyOutreachLimit}
                    </span>
                  </div>
                </div>

                {/* Summary Bullets */}
                <div className="p-3 bg-black/40 rounded border border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">
                    Key Morning Executive Takeaways
                  </span>
                  <ul className="space-y-1">
                    {briefing.summaryBullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Tasks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-slate-800 pb-1">
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-emerald-400" />
                    <span>PRIORITY ACTION ITEMS REQUIRING ATTENTION</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">
                    {completedTasks.length} OF {briefing.actionTasks.length} COMPLETED
                  </span>
                </div>

                <div className="space-y-2">
                  {briefing.actionTasks.map((task) => {
                    const isDone = completedTasks.includes(task.id);
                    return (
                      <div
                        key={task.id}
                        className={`p-3 rounded border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isDone
                            ? "bg-slate-900/40 border-slate-800/60 opacity-60"
                            : task.priority === "CRITICAL"
                            ? "bg-rose-950/20 border-rose-500/40"
                            : task.priority === "HIGH"
                            ? "bg-amber-950/20 border-amber-500/40"
                            : "bg-slate-900 border-slate-800"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`mt-0.5 p-0.5 rounded transition ${
                              isDone
                                ? "text-emerald-400 bg-emerald-950 border border-emerald-500/40"
                                : "text-slate-500 border border-slate-700 hover:border-slate-500"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold text-xs ${
                                  isDone ? "line-through text-slate-500" : "text-white"
                                }`}
                              >
                                {task.title}
                              </span>
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                  task.priority === "CRITICAL"
                                    ? "bg-rose-950 text-rose-300 border border-rose-500/30"
                                    : task.priority === "HIGH"
                                    ? "bg-amber-950 text-amber-300 border border-amber-500/30"
                                    : "bg-slate-800 text-slate-300"
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
                          </div>
                        </div>

                        {onNavigateTab && (
                          <button
                            onClick={() => {
                              onNavigateTab(task.targetTab);
                              onClose();
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded text-xs flex items-center justify-center gap-1 transition self-end sm:self-auto"
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
            </div>
          )}

          {/* TAB 2: VOICE CALIBRATION UTILITY */}
          {activeTab === "CALIBRATION" && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/40 rounded space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-white text-xs tracking-wide">
                        SPEECH SYNTHESIS CALIBRATION & GAIN UTILITY
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Fine-tune playback velocity, volume amplitude, and vocal pitch across all platform voice alerts
                    </p>
                  </div>

                  <button
                    onClick={handleResetCalibration}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[11px] flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span>Reset Defaults</span>
                  </button>
                </div>

                {/* Calibration Sliders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Speed (Rate) Control */}
                  <div className="p-3 bg-slate-900/90 border border-slate-800 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Speech Speed (Rate)</span>
                      </span>
                      <span className="text-emerald-400 font-bold text-xs">
                        {Math.round((settings.speechRate || 1.0) * 100)}% ({settings.speechRate || 1.0}x)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={settings.speechRate || 1.0}
                      onChange={(e) => handleUpdate({ speechRate: parseFloat(e.target.value) })}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex items-center justify-between gap-1 pt-1">
                      {[0.8, 1.0, 1.25, 1.5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleUpdate({ speechRate: val })}
                          className={`px-1.5 py-0.5 rounded text-[10px] transition ${
                            (settings.speechRate || 1.0) === val
                              ? "bg-emerald-500 text-black font-bold"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {val}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Volume Level Control */}
                  <div className="p-3 bg-slate-900/90 border border-slate-800 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Volume Gain</span>
                      </span>
                      <span className="text-emerald-400 font-bold text-xs">
                        {Math.round((settings.volume ?? 0.9) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="1.0"
                      step="0.05"
                      value={settings.volume ?? 0.9}
                      onChange={(e) => handleUpdate({ volume: parseFloat(e.target.value) })}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex items-center justify-between gap-1 pt-1">
                      {[0.3, 0.6, 0.9, 1.0].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleUpdate({ volume: val })}
                          className={`px-1.5 py-0.5 rounded text-[10px] transition ${
                            (settings.volume ?? 0.9) === val
                              ? "bg-emerald-500 text-black font-bold"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {Math.round(val * 100)}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pitch Offset Control */}
                  <div className="p-3 bg-slate-900/90 border border-slate-800 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Tone Pitch Offset</span>
                      </span>
                      <span className="text-cyan-400 font-bold text-xs">
                        {settings.pitchOffset || 1.0}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.7"
                      max="1.4"
                      step="0.05"
                      value={settings.pitchOffset || 1.0}
                      onChange={(e) => handleUpdate({ pitchOffset: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                    <div className="flex items-center justify-between gap-1 pt-1">
                      {[0.8, 1.0, 1.2].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleUpdate({ pitchOffset: val })}
                          className={`px-1.5 py-0.5 rounded text-[10px] transition ${
                            (settings.pitchOffset || 1.0) === val
                              ? "bg-cyan-500 text-black font-bold"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {val}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Calibration Test Workbench */}
                <div className="p-3 bg-black/50 border border-slate-800 rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-emerald-400" />
                      <span>REAL-TIME CALIBRATION TESTER</span>
                    </span>
                    {playbackState === "PLAYING" && (
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded flex items-center gap-1 animate-pulse">
                        <Activity className="w-3 h-3" />
                        <span>SYNTHESIZING AUDIO CLIP</span>
                      </span>
                    )}
                  </div>

                  {/* Custom Test Phrase Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 block">Custom Test Phrase:</label>
                    <input
                      type="text"
                      value={customTestPhrase}
                      onChange={(e) => setCustomTestPhrase(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Preset Test Triggers */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCalibrateTest()}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded flex items-center gap-1.5 text-xs transition shadow"
                    >
                      <Play className="w-3 h-3 fill-black" />
                      <span>TEST CUSTOM PHRASE</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleCalibrateTest(
                          "Attention: High yield property detected at 482 Timberland Trail. Return on investment is 38.4 percent, exceeding your target baseline."
                        )
                      }
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded text-xs flex items-center gap-1 transition"
                    >
                      <Bell className="w-3 h-3 text-amber-400" />
                      <span>Test High-ROI Alert</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleCalibrateTest(
                          "High performance milestone unlocked! DealFinder Agent achieved 15 Verified Land Contracts at 34% ROI."
                        )
                      }
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded text-xs flex items-center gap-1 transition"
                    >
                      <Zap className="w-3 h-3 text-cyan-400" />
                      <span>Test Milestone Praise</span>
                    </button>

                    {playbackState === "PLAYING" && (
                      <button
                        type="button"
                        onClick={handleStopBriefing}
                        className="px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/40 rounded text-xs flex items-center gap-1 transition"
                      >
                        <Square className="w-3 h-3" />
                        <span>Mute Audio</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMMAND LOG & AUDIT OVERLAY */}
          {activeTab === "COMMAND_LOGS" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-white text-xs tracking-wide">
                        VOICE COMMAND AUDIT LOG & RECOGNITION HISTORY
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Full audit trail of speech-to-text transcripts, intent classifications, pattern matches, and execution latencies
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearLogs}
                      disabled={commandLogs.length === 0}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 border border-slate-700 hover:border-rose-700/50 rounded text-xs flex items-center gap-1 transition disabled:opacity-40"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear History</span>
                    </button>
                  </div>
                </div>

                {/* Quick Simulated Command Dispatcher */}
                <div className="p-2.5 bg-black/40 border border-slate-800 rounded space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Test Voice Command Simulation:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "Focus on Land", cmd: "focus on land" },
                      { label: "Read Daily Digest", cmd: "play daily digest" },
                      { label: "Go to Dashboard", cmd: "go to dashboard" },
                      { label: "Open Approvals Gate", cmd: "open approvals" },
                      { label: "Open Virtual Closer", cmd: "go to closer" },
                      { label: "Explain Active Tab", cmd: "run down" },
                    ].map((item) => (
                      <button
                        key={item.cmd}
                        onClick={() => handleReplayCommand(item.cmd)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 border border-slate-700 rounded text-[11px] flex items-center gap-1 transition"
                      >
                        <Mic className="w-2.5 h-2.5 text-emerald-400" />
                        <span>"{item.label}"</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logs Stream Table */}
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {commandLogs.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded space-y-2">
                      <Terminal className="w-6 h-6 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400">No voice commands executed yet in this session.</p>
                      <p className="text-[10px] text-slate-500">
                        Say "Focus on land" into your microphone or click any quick trigger above.
                      </p>
                    </div>
                  ) : (
                    commandLogs.map((log) => {
                      const isSuccess = log.status === "SUCCESS" || log.status === "SIMULATED";
                      const isUnmatched = log.status === "UNMATCHED";
                      return (
                        <div
                          key={log.id}
                          className={`p-2.5 rounded border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] ${
                            isSuccess
                              ? "bg-slate-900/80 border-slate-800 hover:border-emerald-500/40"
                              : isUnmatched
                              ? "bg-amber-950/20 border-amber-500/30"
                              : "bg-rose-950/20 border-rose-500/30"
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                                  log.status === "SUCCESS"
                                    ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                                    : log.status === "SIMULATED"
                                    ? "bg-cyan-950 text-cyan-300 border border-cyan-500/40"
                                    : log.status === "UNMATCHED"
                                    ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                                    : "bg-rose-950 text-rose-300 border border-rose-500/40"
                                }`}
                              >
                                {log.status}
                              </span>

                              <span className="font-bold text-white font-mono">
                                "{log.transcript}"
                              </span>

                              {log.executionTimeMs !== undefined && (
                                <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  {log.executionTimeMs}ms
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] text-slate-400">
                              {log.commandDescription
                                ? `Action: ${log.commandDescription} (${log.matchedCommandId})`
                                : log.details || "No matching registered intent"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <span className="text-[9px] text-slate-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>

                            <button
                              onClick={() => handleReplayCommand(log.transcript)}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[10px] flex items-center gap-1 transition"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>Re-run</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PERSONAS STUDIO & EVENT TRIGGERS */}
          {activeTab === "PERSONAS" && (
            <div className="space-y-4">
              {/* Master Mute & Volume Bar */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleUpdate({ enabled: !settings.enabled })}
                    className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-2 text-xs ${
                      settings.enabled
                        ? "bg-emerald-500 text-black shadow"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {settings.enabled ? (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span>AUDIO SYSTEM ONLINE</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-4 h-4" />
                        <span>AUDIO SYSTEM MUTED</span>
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-slate-400">
                    {settings.enabled ? "Voice prompts active" : "Voice prompts disabled"}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-48">
                  <span className="text-[10px] text-slate-400">Volume:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settings.volume ?? 0.9}
                    onChange={(e) => handleUpdate({ volume: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-emerald-400 font-bold w-8">
                    {Math.round((settings.volume ?? 0.9) * 100)}%
                  </span>
                </div>
              </div>

              {/* AI Voice Personas Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold border-b border-slate-800 pb-1">
                  <span>SELECT PREFERRED AI VOICE PERSONA</span>
                  <span className="text-slate-500 text-[10px]">5 PROFILES AVAILABLE</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {VOICE_PERSONAS.map((persona) => {
                    const isSelected = settings.selectedPersonaId === persona.id;

                    return (
                      <div
                        key={persona.id}
                        onClick={() => handleUpdate({ selectedPersonaId: persona.id })}
                        className={`p-3 rounded border cursor-pointer transition relative flex flex-col justify-between ${
                          isSelected
                            ? "bg-emerald-950/40 border-emerald-500 shadow-md text-white"
                            : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-bold text-xs flex items-center gap-1.5">
                                <span>{persona.name}</span>
                                {isSelected && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                )}
                              </div>
                              <span className="text-[10px] text-emerald-400/90 font-mono">
                                {persona.category}
                              </span>
                            </div>

                            {isSelected && (
                              <div className="p-1 bg-emerald-500 text-black rounded-full">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed font-sans">
                            {persona.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[9px] text-slate-500">
                            Pitch: {persona.pitch}x • Speed: {persona.rate}x
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestVoice(persona.id);
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700 text-[10px] flex items-center gap-1 transition"
                          >
                            <Play className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" />
                            <span>Test Voice</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Event Triggers Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold border-b border-slate-800 pb-1">
                  <span>VOICE ANNOUNCEMENT EVENT TRIGGERS</span>
                  <span className="text-slate-500 text-[10px]">AUTO-CHIMES & SPOKEN ALARMS</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-start gap-2.5 p-2.5 bg-slate-900 border border-slate-800 rounded cursor-pointer hover:border-slate-700 transition">
                    <input
                      type="checkbox"
                      checked={settings.announceDailyRundownOnStart}
                      onChange={(e) => handleUpdate({ announceDailyRundownOnStart: e.target.checked })}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-white block">Auto-Announce Daily Briefing</span>
                      <span className="text-slate-400 text-[10px]">
                        Speaks daily operational rundown and required tasks upon launch
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 bg-slate-900 border border-slate-800 rounded cursor-pointer hover:border-slate-700 transition">
                    <input
                      type="checkbox"
                      checked={settings.announceOnStart}
                      onChange={(e) => handleUpdate({ announceOnStart: e.target.checked })}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-white block">System Turn-On Chime</span>
                      <span className="text-slate-400 text-[10px]">
                        Speaks when platform initializes and 4 cognitive agents boot up
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 bg-slate-900 border border-slate-800 rounded cursor-pointer hover:border-slate-700 transition">
                    <input
                      type="checkbox"
                      checked={settings.announceOnApprovals}
                      onChange={(e) => handleUpdate({ announceOnApprovals: e.target.checked })}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-white block">Approved Leads & High Spreads</span>
                      <span className="text-slate-400 text-[10px]">
                        Announces new qualified deal finds with target spread margins
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 bg-slate-900 border border-slate-800 rounded cursor-pointer hover:border-slate-700 transition">
                    <input
                      type="checkbox"
                      checked={settings.announceOnInvestorMatch}
                      onChange={(e) => handleUpdate({ announceOnInvestorMatch: e.target.checked })}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-white block">Cash Buyer / Investor Match</span>
                      <span className="text-slate-400 text-[10px]">
                        Announces when Tier-1 buyers match active wholesale inventory
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 bg-slate-900 border border-slate-800 rounded cursor-pointer hover:border-slate-700 transition">
                    <input
                      type="checkbox"
                      checked={settings.announceOnHighROI !== false}
                      onChange={(e) => handleUpdate({ announceOnHighROI: e.target.checked })}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-white block">High-ROI Property Alerts</span>
                      <span className="text-slate-400 text-[10px]">
                        Announces immediately when property exceeds target minROI
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2.5 bg-slate-900 border border-slate-800 rounded cursor-pointer hover:border-slate-700 transition">
                    <input
                      type="checkbox"
                      checked={settings.announceOnMilestones !== false}
                      onChange={(e) => handleUpdate({ announceOnMilestones: e.target.checked })}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-white block">Agent High-Performance Milestones</span>
                      <span className="text-slate-400 text-[10px]">
                        Speaks praises when cognitive agent hits weekly conversion milestone
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#111620] border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[10px]">
            Preferences & logs stored locally
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded shadow transition text-xs"
          >
            CONFIRM & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
