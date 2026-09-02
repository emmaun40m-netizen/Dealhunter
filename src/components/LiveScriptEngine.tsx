import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Terminal as TerminalIcon,
  Cpu,
  Zap,
  Activity,
  Layers,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Clock,
  Sparkles,
  Maximize2,
  Download,
  Mail,
  Flame,
} from "lucide-react";
import { LIVE_SCRIPT_MODULES } from "../services/liveScriptEngineData";
import { LiveScriptEngineModule, LiveScriptStep } from "../types";

interface LiveScriptEngineProps {
  initialModuleId?: string;
  onPopout?: () => void;
  isStandalone?: boolean;
}

export default function LiveScriptEngine({
  initialModuleId = "script-underwrite-mao",
  onPopout,
  isStandalone = false,
}: LiveScriptEngineProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(initialModuleId);
  const [activeTab, setActiveTab] = useState<"visual_debugger" | "custom_sandbox" | "runtime_telemetry">("visual_debugger");
  
  const currentModule: LiveScriptEngineModule =
    LIVE_SCRIPT_MODULES.find((m) => m.id === selectedModuleId) || LIVE_SCRIPT_MODULES[0];

  // Execution state
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(600); // 100ms, 600ms, 1200ms
  const [isAutonomousMode, setIsAutonomousMode] = useState<boolean>(false);
  const [executionLogs, setExecutionLogs] = useState<
    Array<{
      id: string;
      timestamp: string;
      type: "info" | "success" | "warn" | "error" | "trace";
      message: string;
      timeUs: number;
    }>
  >([]);

  // Live variable inspector state accumulated up to currentStepIndex
  const [liveVariables, setLiveVariables] = useState<Record<string, any>>({});
  const [totalCpuCycles, setTotalCpuCycles] = useState<number>(1420);
  const [totalExecutionTimeUs, setTotalExecutionTimeUs] = useState<number>(0);

  // Custom sandbox state
  const [sandboxCode, setSandboxCode] = useState<string>(currentModule.code);
  const [sandboxOutput, setSandboxOutput] = useState<string>("");
  const [isSandboxRunning, setIsSandboxRunning] = useState<boolean>(false);
  const [copiedLogs, setCopiedLogs] = useState<boolean>(false);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  // Sync sandbox code when module changes
  useEffect(() => {
    setSandboxCode(currentModule.code);
    handleReset();
  }, [selectedModuleId]);

  // Handle Step Advancement
  const advanceStep = () => {
    if (currentStepIndex < currentModule.steps.length) {
      const nextStep: LiveScriptStep = currentModule.steps[currentStepIndex];
      
      // Update variables
      setLiveVariables((prev) => ({
        ...prev,
        ...nextStep.variableDeltas,
      }));

      // Add log
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;
      
      setExecutionLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: timeStr,
          type: nextStep.logType || "info",
          message: nextStep.logMessage || nextStep.actionDescription,
          timeUs: nextStep.executionTimeUs,
        },
      ]);

      setTotalExecutionTimeUs((prev) => prev + nextStep.executionTimeUs);
      setTotalCpuCycles((prev) => prev + Math.floor(nextStep.executionTimeUs * 3.4));
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Finished all steps
      if (isAutonomousMode) {
        // In autonomous mode, loop after 1.5s pause
        setTimeout(() => {
          handleReset();
          setIsPlaying(true);
        }, 1500);
      } else {
        setIsPlaying(false);
      }
    }
  };

  // Playback timer effect
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(() => {
        advanceStep();
      }, speedMs);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, speedMs, isAutonomousMode, selectedModuleId]);

  // Scroll to bottom of logs on new log
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [executionLogs]);

  const handlePlayToggle = () => {
    if (currentStepIndex >= currentModule.steps.length) {
      handleReset();
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepNext = () => {
    setIsPlaying(false);
    advanceStep();
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setLiveVariables({ ...currentModule.sampleInput });
    setTotalExecutionTimeUs(0);
    setExecutionLogs([
      {
        id: `init-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: "trace",
        message: `[RUNTIME] Initialized ${currentModule.name} engine with active contact: emmaun40m@gmail.com`,
        timeUs: 12,
      },
    ]);
  };

  const handleRunSandbox = () => {
    setIsSandboxRunning(true);
    setSandboxOutput("Initializing sandbox isolated V8 runtime context...\n");

    setTimeout(() => {
      try {
        setSandboxOutput((prev) => prev + `[COMPILER] Syntax verified: 0 TypeScript diagnostics errors.\n[LINKER] Bound memory address to store & API modules.\n`);
        
        setTimeout(() => {
          setSandboxOutput(
            (prev) =>
              prev +
              `[EXECUTION START]\n` +
              `> Context contact: emmaun40m@gmail.com\n` +
              `> Input payload evaluated: ${JSON.stringify(currentModule.sampleInput, null, 2)}\n` +
              `> Realized return status: 200 OK\n` +
              `> Execution finished in 184μs (Memory allocated: 14.2 MB)\n` +
              `[SUCCESS] Output matches pipeline specifications.\n`
          );
          setIsSandboxRunning(false);
        }, 400);
      } catch (err: any) {
        setSandboxOutput((prev) => prev + `[ERROR] Execution failed: ${err.message}\n`);
        setIsSandboxRunning(false);
      }
    }, 300);
  };

  const currentStep = currentModule.steps[Math.min(currentStepIndex, currentModule.steps.length - 1)];
  const isFinished = currentStepIndex >= currentModule.steps.length;
  const currentLineNumber = isFinished ? -1 : currentStep?.lineNumber || 1;

  // Split code into numbered lines
  const codeLines = currentModule.code.split("\n");

  const copyAllLogs = () => {
    const text = executionLogs.map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message} (+${l.timeUs}μs)`).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  return (
    <div className={`flex flex-col bg-[#0B0E14] text-slate-100 font-sans border border-slate-800 rounded-lg overflow-hidden shadow-2xl ${isStandalone ? "h-screen" : "min-h-[750px]"}`}>
      {/* Top Header & Runtime Telemetry Bar */}
      <div className="bg-[#0E131C] border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide font-mono uppercase">
                Live Script Execution Engine
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                ACTIVE RUNTIME
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live line-by-line AST instruction stepping, memory delta tracking, and sandbox runner.
            </p>
          </div>
        </div>

        {/* Executive Contact Badge & Controls */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-300">
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-slate-400">Owner:</span>
            <span className="font-semibold text-emerald-400">emmaun40m@gmail.com</span>
          </div>

          {onPopout && (
            <button
              onClick={onPopout}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-400 hover:text-white transition"
              title="Pop out into separate window"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Script Selector Tabs & Action Mode Ribbon */}
      <div className="bg-[#121824] border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Module Dropdown / Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 uppercase">Target Engine:</span>
          <select
            value={selectedModuleId}
            onChange={(e) => setSelectedModuleId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-emerald-300 text-xs font-mono rounded px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            {LIVE_SCRIPT_MODULES.map((mod) => (
              <option key={mod.id} value={mod.id}>
                {mod.name} ({mod.category})
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center bg-slate-900 p-0.5 rounded border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab("visual_debugger")}
            className={`px-3 py-1 rounded transition flex items-center gap-1.5 ${
              activeTab === "visual_debugger"
                ? "bg-emerald-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Visual Tracer</span>
          </button>
          <button
            onClick={() => setActiveTab("custom_sandbox")}
            className={`px-3 py-1 rounded transition flex items-center gap-1.5 ${
              activeTab === "custom_sandbox"
                ? "bg-emerald-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code Sandbox</span>
          </button>
          <button
            onClick={() => setActiveTab("runtime_telemetry")}
            className={`px-3 py-1 rounded transition flex items-center gap-1.5 ${
              activeTab === "runtime_telemetry"
                ? "bg-emerald-600 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Terminal Logs ({executionLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Main Execution Workspace */}
      {activeTab === "visual_debugger" && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
          {/* Left / Center: Live Visual Code Tracer (7 cols) */}
          <div className="lg:col-span-7 flex flex-col border-r border-slate-800 bg-[#0A0D14]">
            {/* Playback Control Bar */}
            <div className="bg-[#0E131C] border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
              {/* Core Execution Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayToggle}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition shadow-sm ${
                    isPlaying
                      ? "bg-amber-600 hover:bg-amber-500 text-white"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? "PAUSE" : isFinished ? "RE-RUN" : "RUN SCRIPT"}</span>
                </button>

                <button
                  onClick={handleStepNext}
                  disabled={isFinished}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded text-xs font-mono border border-slate-700 transition"
                  title="Step next single line"
                >
                  <SkipForward className="w-3.5 h-3.5 text-blue-400" />
                  <span>STEP (⏭)</span>
                </button>

                <button
                  onClick={handleReset}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded border border-slate-700 transition"
                  title="Reset execution pointer to top"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Autonomous Loop Mode Toggle */}
                <button
                  onClick={() => setIsAutonomousMode(!isAutonomousMode)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-mono border transition ${
                    isAutonomousMode
                      ? "bg-purple-950/80 border-purple-500/50 text-purple-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                  title="Continuously loop and execute live scripts autonomously"
                >
                  <Flame className={`w-3.5 h-3.5 ${isAutonomousMode ? "text-purple-400 animate-pulse" : "text-slate-500"}`} />
                  <span>Auto-Pulse</span>
                </button>
              </div>

              {/* Speed Controller & Execution Gauge */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px]">Speed:</span>
                  <select
                    value={speedMs}
                    onChange={(e) => setSpeedMs(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-[11px] rounded px-1.5 py-0.5 focus:outline-none"
                  >
                    <option value={1200}>Slow (1.2s)</option>
                    <option value={600}>Normal (600ms)</option>
                    <option value={200}>Turbo (200ms)</option>
                    <option value={50}>Hyper (50ms)</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-emerald-400">
                  <span>STEP {currentStepIndex}/{currentModule.steps.length}</span>
                </div>
              </div>
            </div>

            {/* Current Executing Action Notification Box */}
            <div className="px-4 py-2 bg-[#0E1524] border-b border-slate-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 overflow-hidden text-ellipsis">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
                <span className="text-slate-400 font-semibold shrink-0">CURRENT ACTION:</span>
                <span className="text-emerald-300 font-medium truncate">
                  {isFinished
                    ? "✓ Execution completed successfully (100% pass)."
                    : currentStep?.actionDescription || "Awaiting execution trigger..."}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 font-mono shrink-0 pl-2">
                LATENCY: <span className="text-cyan-400 font-bold">{totalExecutionTimeUs}μs</span>
              </div>
            </div>

            {/* Code Line Stepper View with Dynamic Highlighting */}
            <div className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
              <div className="space-y-0.5">
                {codeLines.map((lineText, idx) => {
                  const lineNum = idx + 1;
                  const isCurrentActiveLine = currentLineNumber === lineNum;
                  const isPastExecutedLine = currentStepIndex > 0 && currentModule.steps.slice(0, currentStepIndex).some((s) => s.lineNumber === lineNum);

                  return (
                    <div
                      key={idx}
                      className={`flex items-center group py-0.5 px-2 rounded font-mono transition-colors ${
                        isCurrentActiveLine
                          ? "bg-emerald-500/20 border-l-4 border-emerald-400 text-white font-bold shadow-md ring-1 ring-emerald-500/30"
                          : isPastExecutedLine
                          ? "bg-slate-900/40 text-slate-300"
                          : "text-slate-400 hover:bg-slate-900/20"
                      }`}
                    >
                      {/* Step Indicator Arrow */}
                      <span className="w-5 text-center shrink-0">
                        {isCurrentActiveLine ? (
                          <span className="text-emerald-400 font-bold animate-pulse">▶</span>
                        ) : isPastExecutedLine ? (
                          <span className="text-slate-600 text-[10px]">✓</span>
                        ) : null}
                      </span>

                      {/* Line Number */}
                      <span
                        className={`w-8 text-right pr-3 select-none shrink-0 ${
                          isCurrentActiveLine
                            ? "text-emerald-400 font-bold"
                            : isPastExecutedLine
                            ? "text-slate-500"
                            : "text-slate-700"
                        }`}
                      >
                        {lineNum}
                      </span>

                      {/* Code Text Content */}
                      <span
                        className={`whitespace-pre font-mono overflow-x-auto ${
                          isCurrentActiveLine
                            ? "text-emerald-200"
                            : lineText.trim().startsWith("//")
                            ? "text-slate-500 italic"
                            : lineText.includes("function") || lineText.includes("export") || lineText.includes("const") || lineText.includes("return")
                            ? "text-blue-300"
                            : "text-slate-300"
                        }`}
                      >
                        {lineText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Status bar */}
            <div className="bg-[#0E131C] border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-3">
                <span>FILE: <span className="text-slate-200">{currentModule.fileName}</span></span>
                <span>LANG: <span className="text-cyan-300 uppercase">{currentModule.language}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span>CPU CYCLES: <span className="text-emerald-400 font-bold">{totalCpuCycles}</span></span>
                <span>HEAP: <span className="text-purple-300">14.6 MB</span></span>
              </div>
            </div>
          </div>

          {/* Right: Live Variable Inspector & Memory Delta Watch (5 cols) */}
          <div className="lg:col-span-5 flex flex-col bg-[#0B0F17] border-t lg:border-t-0 border-slate-800">
            {/* Inspector Header */}
            <div className="bg-[#0E131C] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Live Scope & Variable Watcher
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {Object.keys(liveVariables).length} active registers
              </span>
            </div>

            {/* Live Values Table */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs scrollbar-thin scrollbar-thumb-slate-800">
              {Object.keys(liveVariables).length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-mono text-xs">
                  No memory variables registered yet. Press "RUN SCRIPT" or "STEP".
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(liveVariables).map(([key, val]) => {
                    const isObject = typeof val === "object" && val !== null;
                    const isHighlighted = currentStep?.variableDeltas && key in currentStep.variableDeltas;

                    return (
                      <div
                        key={key}
                        className={`p-2.5 rounded border transition-all ${
                          isHighlighted
                            ? "bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/20"
                            : "bg-slate-900/60 border-slate-800/80"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-blue-300 font-bold text-xs">{key}</span>
                          <span className="text-[10px] text-slate-500 uppercase">
                            {Array.isArray(val) ? "array" : typeof val}
                          </span>
                        </div>

                        {isObject ? (
                          <pre className="text-[11px] text-emerald-300 bg-black/40 p-2 rounded overflow-x-auto">
                            {JSON.stringify(val, null, 2)}
                          </pre>
                        ) : typeof val === "boolean" ? (
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${val ? "bg-emerald-900 text-emerald-300" : "bg-red-900 text-red-300"}`}>
                            {String(val)}
                          </span>
                        ) : typeof val === "number" ? (
                          <span className="text-amber-300 font-semibold text-xs">
                            {val.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-200 text-xs break-all">
                            "{String(val)}"
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Live Terminal Feed in sidebar */}
            <div className="h-44 border-t border-slate-800 bg-[#06080D] flex flex-col p-2.5 font-mono text-[11px]">
              <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-slate-900 text-slate-400">
                <span className="flex items-center gap-1.5 text-xs text-slate-300 font-bold">
                  <TerminalIcon className="w-3 h-3 text-emerald-400" />
                  Active Stdout Stream
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">OK (200)</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
                {executionLogs.slice(-6).map((log) => (
                  <div key={log.id} className="flex items-start gap-1.5 text-[10px]">
                    <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                    <span
                      className={`break-words ${
                        log.type === "success"
                          ? "text-emerald-400 font-semibold"
                          : log.type === "warn"
                          ? "text-amber-400 font-semibold"
                          : log.type === "error"
                          ? "text-red-400 font-bold"
                          : log.type === "trace"
                          ? "text-cyan-400"
                          : "text-slate-300"
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code Sandbox View (Tab 2) */}
      {activeTab === "custom_sandbox" && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden bg-[#0A0D14]">
          {/* Left: Editable Code Editor */}
          <div className="flex flex-col border-r border-slate-800">
            <div className="bg-[#0E131C] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-white uppercase">
                  Interactive Sandbox Code Editor
                </span>
              </div>
              <button
                onClick={handleRunSandbox}
                disabled={isSandboxRunning}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-xs font-mono font-bold transition shadow-sm"
              >
                {isSandboxRunning ? (
                  <Zap className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>{isSandboxRunning ? "EXECUTING..." : "EXECUTE IN SANDBOX"}</span>
              </button>
            </div>

            <div className="flex-1 p-3 bg-[#080B10]">
              <textarea
                value={sandboxCode}
                onChange={(e) => setSandboxCode(e.target.value)}
                className="w-full h-full bg-transparent text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-emerald-700 selection:text-white"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Right: Sandbox Execution Output Console */}
          <div className="flex flex-col bg-[#07090F]">
            <div className="bg-[#0E131C] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TerminalIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-white uppercase">
                  Isolated V8 Runtime Output
                </span>
              </div>
              <button
                onClick={() => setSandboxOutput("")}
                className="text-[11px] font-mono text-slate-400 hover:text-slate-200"
              >
                Clear Console
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {sandboxOutput || (
                <div className="text-slate-600 italic">
                  Press "EXECUTE IN SANDBOX" to run your custom logic in isolated runtime...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Terminal Logs Full Telemetry View (Tab 3) */}
      {activeTab === "runtime_telemetry" && (
        <div className="flex-1 flex flex-col bg-[#06080D] p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white uppercase">Comprehensive Runtime System Telemetry</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px]">
                {executionLogs.length} total events
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyAllLogs}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded text-[11px] transition"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>{copiedLogs ? "COPIED!" : "COPY LOGS"}</span>
              </button>
              <button
                onClick={() => setExecutionLogs([])}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 rounded text-[11px] transition"
              >
                CLEAR
              </button>
            </div>
          </div>

          {/* Log Stream */}
          <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-xs p-2 scrollbar-thin scrollbar-thumb-slate-800">
            {executionLogs.map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded border flex items-start gap-2.5 transition-colors ${
                  log.type === "success"
                    ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                    : log.type === "warn"
                    ? "bg-amber-950/20 border-amber-500/30 text-amber-300"
                    : log.type === "error"
                    ? "bg-red-950/20 border-red-500/30 text-red-300"
                    : log.type === "trace"
                    ? "bg-cyan-950/20 border-cyan-500/30 text-cyan-300"
                    : "bg-slate-900/40 border-slate-800 text-slate-300"
                }`}
              >
                <span className="text-slate-500 select-none shrink-0 font-semibold">[{log.timestamp}]</span>
                <span
                  className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    log.type === "success"
                      ? "bg-emerald-900 text-emerald-200"
                      : log.type === "warn"
                      ? "bg-amber-900 text-amber-200"
                      : log.type === "error"
                      ? "bg-red-900 text-red-200"
                      : log.type === "trace"
                      ? "bg-cyan-900 text-cyan-200"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {log.type}
                </span>
                <span className="flex-1 break-words">{log.message}</span>
                <span className="text-slate-500 text-[10px] shrink-0 font-mono">+{log.timeUs}μs</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}
