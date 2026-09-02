import { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Play,
  CheckCircle2,
  Sparkles,
  Command,
  Compass,
  Zap,
  Sliders,
  Layers,
  Search,
} from "lucide-react";
import { voiceCommands, VoiceCommandAction } from "../services/voiceCommands";
import { voiceAssistant } from "../services/voiceAssistant";

interface CommandCheatSheetOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand?: (cmdId: string) => void;
}

export default function CommandCheatSheetOverlay({
  isOpen,
  onClose,
  onExecuteCommand,
}: CommandCheatSheetOverlayProps) {
  const [commands, setCommands] = useState<VoiceCommandAction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState(() => voiceCommands.getStatus());
  const [activeTabFilter, setActiveTabFilter] = useState<"ALL" | "NAV" | "ACTIONS" | "BRIEFING">("ALL");

  useEffect(() => {
    setCommands(voiceCommands.getCommands());
    const unsub = voiceCommands.subscribe((newStatus) => {
      setStatus(newStatus);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const filteredCommands = commands.filter((cmd) => {
    const matchesSearch =
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.patterns.some((p) => String(p).toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTabFilter === "NAV") return cmd.id.startsWith("nav_");
    if (activeTabFilter === "BRIEFING") return cmd.id.includes("digest") || cmd.id.includes("rundown");
    if (activeTabFilter === "ACTIONS") return !cmd.id.startsWith("nav_");
    return true;
  });

  const handleTestCommand = (cmd: VoiceCommandAction) => {
    const triggerPhrase = typeof cmd.patterns[0] === "string" ? cmd.patterns[0] : cmd.id;
    voiceCommands.processTranscript(triggerPhrase, true);
    if (cmd.voiceFeedbackText) {
      voiceAssistant.speak(cmd.voiceFeedbackText, { chime: "portal" });
    }
    if (onExecuteCommand) {
      onExecuteCommand(cmd.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0B0E14] border border-slate-800 rounded-lg w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl font-mono text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0E1218] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Command className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-sans">
                  Voice Command Cheat Sheet
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  SPOKEN KEYWORD: "HELP"
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Speak any phrase below while microphone is active, or trigger directly via test actions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Mic Status Bar */}
        <div className="px-6 py-3 bg-[#121720] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  status.state === "LISTENING"
                    ? "bg-red-500 animate-ping"
                    : status.isSupported
                    ? "bg-emerald-500"
                    : "bg-slate-600"
                }`}
              />
              <span className="font-bold text-slate-300">
                MIC STATUS:{" "}
                <span
                  className={
                    status.state === "LISTENING"
                      ? "text-red-400"
                      : status.isSupported
                      ? "text-emerald-400"
                      : "text-slate-500"
                  }
                >
                  {status.state === "LISTENING" ? "LIVE LISTENING" : "READY (SPEECH-TO-TEXT)"}
                </span>
              </span>
            </div>

            {status.transcript && (
              <span className="text-amber-300 text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-700 max-w-xs truncate">
                "{status.transcript}"
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => voiceCommands.toggleListening()}
              className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition border ${
                status.state === "LISTENING"
                  ? "bg-red-500/20 text-red-300 border-red-500/50"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
              }`}
            >
              {status.state === "LISTENING" ? (
                <>
                  <MicOff className="w-3.5 h-3.5 text-red-400" />
                  <span>STOP MIC</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  <span>START MIC</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="p-4 border-b border-slate-800/80 bg-[#0B0E14] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-xs w-full sm:w-auto">
            {(
              [
                { id: "ALL", label: "ALL COMMANDS" },
                { id: "NAV", label: "NAVIGATION" },
                { id: "ACTIONS", label: "ACTIONS & FILTERS" },
                { id: "BRIEFING", label: "AUDIO BRIEFINGS" },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveTabFilter(filter.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition border ${
                  activeTabFilter === filter.id
                    ? "bg-slate-800 border-slate-600 text-white"
                    : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search voice commands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161B22] border border-slate-800 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
            />
          </div>
        </div>

        {/* Commands List Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No matching commands found for "{searchQuery}".
            </div>
          ) : (
            filteredCommands.map((cmd) => {
              const isHelp = cmd.id === "show_cheat_sheet";
              const isLand = cmd.id === "focus_land";

              return (
                <div
                  key={cmd.id}
                  className={`p-4 rounded border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isHelp
                      ? "bg-amber-950/20 border-amber-500/40 shadow-sm"
                      : isLand
                      ? "bg-emerald-950/20 border-emerald-500/40"
                      : "bg-[#161B22] border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-1.5 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-sans">{cmd.description}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-emerald-400 font-bold">
                        ACTIVE
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-slate-500">Say:</span>
                      {cmd.patterns.slice(0, 4).map((p, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-300 font-bold"
                        >
                          "{String(p)}"
                        </span>
                      ))}
                      {cmd.patterns.length > 4 && (
                        <span className="text-[9px] text-slate-500">
                          +{cmd.patterns.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleTestCommand(cmd)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs font-bold text-slate-200 flex items-center gap-1.5 transition"
                    >
                      <Play className="w-3 h-3 text-cyan-400" />
                      <span>SIMULATE</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0E1218] flex items-center justify-between text-[11px] text-slate-500">
          <span>Tip: Press "V" or click the microphone icon anywhere to trigger commands.</span>
          <button
            onClick={onClose}
            className="px-4 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-bold transition"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
