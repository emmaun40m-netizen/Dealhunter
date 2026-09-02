import { useState, useEffect, useMemo } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Square,
  Mic,
  MicOff,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Sliders,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { voiceAssistant, PlaybackState } from "../services/voiceAssistant";
import { voiceCommands, VoiceCommandStatus } from "../services/voiceCommands";
import { Deal, ApprovalRequest, DashboardMetrics, Contract } from "../types";

interface TabVoiceRundownProps {
  activeTab: string;
  deals?: Deal[];
  approvals?: ApprovalRequest[];
  contracts?: Contract[];
  metrics?: DashboardMetrics | null;
  configMinROI?: number;
  onOpenVoiceSettings?: () => void;
  onSelectPropertyType?: (type: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export default function TabVoiceRundown({
  activeTab,
  deals = [],
  approvals = [],
  contracts = [],
  metrics = null,
  configMinROI = 25,
  onOpenVoiceSettings,
  onSelectPropertyType,
  onNavigateTab,
}: TabVoiceRundownProps) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>(() =>
    voiceAssistant.getPlaybackState()
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [commandStatus, setCommandStatus] = useState<VoiceCommandStatus>(() =>
    voiceCommands.getStatus()
  );
  const [quickCommandOpen, setQuickCommandOpen] = useState(false);

  // Subscribe to voice assistant state
  useEffect(() => {
    const unsub = voiceAssistant.subscribe((st) => {
      setPlaybackState(st.playbackState);
    });
    return () => unsub();
  }, []);

  // Subscribe to voice command listener state
  useEffect(() => {
    const unsub = voiceCommands.subscribe((status) => {
      setCommandStatus(status);
      setIsListening(status.state === "LISTENING");
    });
    return () => unsub();
  }, []);

  // Calculate live context
  const tabContext = useMemo(() => {
    const totalProfit =
      metrics?.projected?.totalProfit ||
      deals.reduce((sum, d) => sum + (d.metrics?.projectedProfit || 0), 0) ||
      184500;
    const pendingApprovalsCount = approvals.filter((a) => a.status === "PENDING").length;

    return {
      dealsCount: deals.length || 8,
      projectedProfit: totalProfit,
      pendingApprovals: pendingApprovalsCount,
      contractsCount: contracts.length || 3,
      minROI: configMinROI,
    };
  }, [deals, approvals, contracts, metrics, configMinROI]);

  const speechInfo = useMemo(() => {
    return voiceAssistant.getTabRundownSpeech(activeTab, tabContext);
  }, [activeTab, tabContext]);

  const handlePlay = () => {
    voiceAssistant.playTabRundown(activeTab, tabContext, (st) => setPlaybackState(st));
  };

  const handlePause = () => {
    voiceAssistant.pauseSpeech();
  };

  const handleResume = () => {
    voiceAssistant.resumeSpeech();
  };

  const handleReplay = () => {
    voiceAssistant.stopSpeech();
    setTimeout(() => {
      voiceAssistant.playTabRundown(activeTab, tabContext, (st) => setPlaybackState(st));
    }, 100);
  };

  const handleStop = () => {
    voiceAssistant.stopSpeech();
  };

  const handleToggleMic = () => {
    voiceCommands.toggleListening();
  };

  const handleSimulateCommand = (cmdText: string) => {
    voiceCommands.executeSimulatedCommand(cmdText);
    setQuickCommandOpen(false);
  };

  return (
    <div className="bg-[#0E1218] border border-slate-800 rounded-sm mb-5 font-mono overflow-hidden transition-all shadow-md">
      {/* Top Bar Header */}
      <div className="p-3 bg-gradient-to-r from-[#111620] to-[#0E1218] flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
        {/* Left: Tab Audio Title & Waveform */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Radio className={`w-4 h-4 ${playbackState === "PLAYING" ? "animate-spin text-emerald-300" : ""}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                VOICE RUNDOWN: {speechInfo.title.toUpperCase()}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                LIVE AUDIO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              {speechInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Center/Right: Audio Playback Controls & Voice Command Mic */}
        <div className="flex items-center gap-2">
          {/* Waveform visualizer */}
          <div className="hidden sm:flex items-center gap-0.5 h-6 px-2 bg-black/40 border border-slate-800 rounded">
            <span
              className={`w-0.5 rounded-full bg-emerald-400 transition-all duration-200 ${
                playbackState === "PLAYING" ? "h-4 animate-pulse" : "h-1.5 opacity-30"
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-emerald-400 transition-all duration-300 ${
                playbackState === "PLAYING" ? "h-2.5 animate-pulse delay-75" : "h-1 opacity-30"
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-emerald-400 transition-all duration-150 ${
                playbackState === "PLAYING" ? "h-5 animate-pulse delay-150" : "h-2 opacity-30"
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-emerald-400 transition-all duration-250 ${
                playbackState === "PLAYING" ? "h-3 animate-pulse delay-100" : "h-1 opacity-30"
              }`}
            />
          </div>

          {/* Play / Pause Button */}
          {playbackState === "PLAYING" ? (
            <button
              onClick={handlePause}
              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-[11px] flex items-center gap-1.5 transition"
              title="Pause spoken audio"
            >
              <Pause className="w-3.5 h-3.5 fill-black" />
              <span>PAUSE</span>
            </button>
          ) : playbackState === "PAUSED" ? (
            <button
              onClick={handleResume}
              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded text-[11px] flex items-center gap-1.5 transition"
              title="Resume spoken audio"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>RESUME</span>
            </button>
          ) : (
            <button
              onClick={handlePlay}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded text-[11px] flex items-center gap-1.5 transition"
              title="Play tab rundown audio"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>LISTEN TO RUNDOWN</span>
            </button>
          )}

          {/* Replay Button */}
          <button
            onClick={handleReplay}
            className="p-1.5 bg-[#161B22] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded transition"
            title="Replay from start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Mute / Stop Button */}
          <button
            onClick={handleStop}
            className="p-1.5 bg-[#161B22] hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 rounded transition"
            title="Stop / Mute playback"
          >
            <VolumeX className="w-3.5 h-3.5" />
          </button>

          {/* Voice Command Microphone Button */}
          <button
            onClick={handleToggleMic}
            className={`px-2.5 py-1.5 text-[11px] font-bold rounded border flex items-center gap-1.5 transition relative ${
              isListening
                ? "bg-rose-500 text-white border-rose-400 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                : "bg-[#161B22] hover:bg-slate-800 text-emerald-300 border-slate-700"
            }`}
            title="Voice Commands: Say 'Focus on land', 'Show dashboard', or 'Read digest'"
          >
            {isListening ? <Mic className="w-3.5 h-3.5 animate-bounce" /> : <Mic className="w-3.5 h-3.5" />}
            <span>{isListening ? "LISTENING..." : "VOICE CMD"}</span>
          </button>

          {/* Quick Voice Command Simulation Menu */}
          <button
            onClick={() => setQuickCommandOpen(!quickCommandOpen)}
            className="p-1.5 bg-[#161B22] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 rounded transition"
            title="Quick voice commands list"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Voice Settings Button */}
          {onOpenVoiceSettings && (
            <button
              onClick={onOpenVoiceSettings}
              className="p-1.5 bg-[#161B22] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 rounded transition"
              title="Voice Persona & Volume Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Expand / Collapse Transcript Drawer */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-[#161B22] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 rounded transition flex items-center gap-1 text-[11px]"
            title={isExpanded ? "Collapse read-along transcript" : "Read along transcript"}
          >
            <span className="hidden md:inline">{isExpanded ? "HIDE TEXT" : "READ ALONG"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Voice Command Feedback / Live Transcription Indicator */}
      {(isListening || commandStatus.transcript || commandStatus.feedbackMessage) && (
        <div className="px-3 py-2 bg-black/60 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isListening ? "bg-rose-500 animate-ping" : "bg-emerald-400"}`} />
            <span className="text-slate-400">Voice Status:</span>
            <span className="text-emerald-300 font-medium">
              {commandStatus.transcript ? `"${commandStatus.transcript}"` : commandStatus.feedbackMessage || "Listening for 'Focus on land'..."}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSimulateCommand("Focus on land")}
              className="text-[10px] px-2 py-0.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded transition"
            >
              Say "Focus on land"
            </button>
          </div>
        </div>
      )}

      {/* Quick Voice Command Dropdown Popover */}
      {quickCommandOpen && (
        <div className="p-3 bg-[#0B0E14] border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold border-b border-slate-800/80 pb-1">
            <span>QUICK VOICE COMMAND SHORTCUTS (CLICK OR SPEAK)</span>
            <span className="text-[10px] text-emerald-400">WEB SPEECH ENGINE</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              onClick={() => handleSimulateCommand("Focus on land")}
              className="p-2 bg-[#141922] hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/50 rounded text-left transition text-emerald-300 font-mono"
            >
              <div className="font-bold text-[11px]">"Focus on land"</div>
              <div className="text-[10px] text-slate-400">Filters property scanner for land only</div>
            </button>

            <button
              onClick={() => handleSimulateCommand("Show all properties")}
              className="p-2 bg-[#141922] hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded text-left transition text-slate-200 font-mono"
            >
              <div className="font-bold text-[11px]">"Show all properties"</div>
              <div className="text-[10px] text-slate-400">Resets property type filter to ALL</div>
            </button>

            <button
              onClick={() => handleSimulateCommand("Open dashboard")}
              className="p-2 bg-[#141922] hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded text-left transition text-slate-200 font-mono"
            >
              <div className="font-bold text-[11px]">"Open dashboard"</div>
              <div className="text-[10px] text-slate-400">Navigates to Executive Dashboard</div>
            </button>

            <button
              onClick={() => handleSimulateCommand("Read daily digest")}
              className="p-2 bg-[#141922] hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded text-left transition text-amber-300 font-mono"
            >
              <div className="font-bold text-[11px]">"Read daily digest"</div>
              <div className="text-[10px] text-slate-400">Plays morning digest briefing</div>
            </button>
          </div>
        </div>
      )}

      {/* Expandable Read-Along Transcript & Key Highlights */}
      {isExpanded && (
        <div className="p-3.5 bg-black/40 border-t border-slate-800/80 space-y-3">
          {/* Read Along Text Box */}
          <div className="p-3 bg-[#0B0E14] border border-slate-800/90 rounded text-xs leading-relaxed text-slate-300 font-sans">
            <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>SPOKEN NARRATIVE (READ ALONG)</span>
              <span className="text-slate-500">
                Persona: {voiceAssistant.getSettings().selectedPersonaId}
              </span>
            </div>
            <p className="text-slate-200 font-mono text-[11px] leading-relaxed italic">
              "{speechInfo.narrative}"
            </p>
          </div>

          {/* Tab Capabilities Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
            {speechInfo.bullets.map((bullet, idx) => (
              <div
                key={idx}
                className="p-2 bg-[#141922] border border-slate-800/80 rounded flex items-start gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 font-sans leading-tight">{bullet}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
