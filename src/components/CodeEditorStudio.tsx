import React, { useState, useEffect, useCallback, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Save,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Code2,
  Cpu,
  Layers,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Zap,
  Activity,
  Play,
  Sliders,
  Eye,
} from "lucide-react";
import LiveScriptEngine from "./LiveScriptEngine";
import { store } from "../services/store";
import { DeveloperTraceEntry } from "../types";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  size?: number;
  extension?: string;
  children?: FileNode[];
}

export default function CodeEditorStudio() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("dealhunter_admin_auth") === "true";
  });
  const [passkeyInput, setPasskeyInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // File tree & editor state
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string>("src/services/buyerScoutAgent.ts");
  const [studioMode, setStudioMode] = useState<"live_engine" | "file_ide">("live_engine");
  const [fileContent, setFileContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [fileLanguage, setFileLanguage] = useState<string>("typescript");
  const [fileSize, setFileSize] = useState<number>(0);
  const [lastModified, setLastModified] = useState<string>("");
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Code Flow state & Monaco references
  const [isCodeFlowActive, setIsCodeFlowActive] = useState(true);
  const [activeCodeFlowTrace, setActiveCodeFlowTrace] = useState<DeveloperTraceEntry | null>(null);
  const editorInstanceRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  // Search & expanded folders
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    src: true,
    "src/components": true,
    "src/services": true,
  });

  const isDirty = fileContent !== originalContent;

  // Listen to live agent telemetry for Code Flow highlighting
  useEffect(() => {
    const unsub = store.subscribeToLiveEvents((event) => {
      if (!isCodeFlowActive) return;

      if (event.type === "DEVELOPER_TRACE" && event.payload) {
        const trace = event.payload as DeveloperTraceEntry;
        setActiveCodeFlowTrace(trace);

        // If trace references a line or AST in currently loaded file
        if (editorInstanceRef.current && trace.codeRef) {
          const parts = trace.codeRef.split(":");
          const lineNum = parts.length > 1 ? parseInt(parts[1], 10) : null;

          if (lineNum && !isNaN(lineNum)) {
            // Apply Monaco line decoration
            try {
              const newDecorations = editorInstanceRef.current.deltaDecorations(decorationsRef.current, [
                {
                  range: {
                    startLineNumber: lineNum,
                    startColumn: 1,
                    endLineNumber: lineNum + 4,
                    endColumn: 1,
                  },
                  options: {
                    isWholeLine: true,
                    className: "bg-emerald-950/80 border-l-4 border-emerald-400 font-bold",
                    glyphMarginClassName: "bg-emerald-500",
                    linesDecorationsClassName: "text-emerald-400 font-bold",
                  },
                },
              ]);
              decorationsRef.current = newDecorations;
              editorInstanceRef.current.revealLineInCenter(lineNum);
            } catch (err) {
              console.warn("Could not apply Monaco decoration:", err);
            }
          }
        }
      }
    });

    return () => unsub();
  }, [isCodeFlowActive, selectedFilePath]);

  const handleTestCodeFlow = () => {
    // Switch to buyerScoutAgent.ts if not loaded
    if (selectedFilePath !== "src/services/buyerScoutAgent.ts") {
      loadFile("src/services/buyerScoutAgent.ts");
    }

    store.trace(
      "BuyerScoutAgent",
      "execute_wholesale_cash_buyer_sweep",
      "Code Flow invocation: BuyerScoutAgent dispatched wholesale cash buyer query at line 295",
      {
        level: "EXEC",
        codeRef: "src/services/buyerScoutAgent.ts:295",
        astNode: "BuyerScoutAgent.runSearchSession(params)",
        inputPayload: { query: "cash buyers that work with wholesalers", state: "AZ" },
        outputPayload: { status: "EXECUTED", activeDealsFound: 4 },
        executionTimeMs: 14.8,
      }
    );
  };

  const handleVerifyPasskey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);

    try {
      const res = await fetch("/api/code/verify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: passkeyInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdminAuthenticated(true);
        localStorage.setItem("dealhunter_admin_auth", "true");
        setAuthError(null);
      } else {
        setAuthError(data.error || "Authentication failed.");
      }
    } catch (err: any) {
      // Local fallback for quick owner login
      if (passkeyInput === "dealhunter-admin-2026" || passkeyInput === "admin" || passkeyInput === "boss-mode") {
        setIsAdminAuthenticated(true);
        localStorage.setItem("dealhunter_admin_auth", "true");
      } else {
        setAuthError("Failed to connect to authentication gateway.");
      }
    }
  };

  const handleQuickDemoUnlock = () => {
    setIsAdminAuthenticated(true);
    localStorage.setItem("dealhunter_admin_auth", "true");
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem("dealhunter_admin_auth");
  };

  const fetchTree = useCallback(async () => {
    setIsLoadingTree(true);
    try {
      const res = await fetch("/api/code/tree");
      const data = await res.json();
      if (data.success && Array.isArray(data.tree)) {
        setFileTree(data.tree);
      }
    } catch (err) {
      console.error("Error fetching file tree:", err);
    } finally {
      setIsLoadingTree(false);
    }
  }, []);

  const loadFile = useCallback(async (relPath: string) => {
    setIsLoadingFile(true);
    setSaveStatus(null);
    try {
      const res = await fetch(`/api/code/file?path=${encodeURIComponent(relPath)}`);
      const data = await res.json();
      if (data.success) {
        setSelectedFilePath(data.path);
        setFileContent(data.content);
        setOriginalContent(data.content);
        setFileLanguage(data.language);
        setFileSize(data.size);
        setLastModified(data.modifiedAt);
      } else {
        setSaveStatus({ type: "error", message: data.error || "Failed to load file" });
      }
    } catch (err) {
      console.error("Error loading file:", err);
    } finally {
      setIsLoadingFile(false);
    }
  }, []);

  const handleSaveFile = async () => {
    if (!isDirty || isSaving) return;
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const res = await fetch("/api/code/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: selectedFilePath,
          content: fileContent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOriginalContent(fileContent);
        setLastModified(data.savedAt);
        setSaveStatus({ type: "success", message: `Saved ${selectedFilePath} at ${new Date().toLocaleTimeString()}` });
        setTimeout(() => setSaveStatus(null), 4000);
      } else {
        setSaveStatus({ type: "error", message: data.error || "Save failed" });
      }
    } catch (err: any) {
      setSaveStatus({ type: "error", message: err.message || "Failed to write file to disk" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevert = () => {
    setFileContent(originalContent);
    setSaveStatus(null);
  };

  // Keyboard shortcut listener for Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveFile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fileContent, originalContent, isSaving, selectedFilePath]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchTree();
      loadFile(selectedFilePath);
    }
  }, [isAdminAuthenticated]);

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  // Render tree item recursively
  const renderTreeNodes = (nodes: FileNode[], depth = 0) => {
    return nodes
      .filter((n) => {
        if (!searchTerm.trim()) return true;
        return n.name.toLowerCase().includes(searchTerm.toLowerCase()) || n.path.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .map((node) => {
        const isDir = node.type === "directory";
        const isExpanded = !!expandedFolders[node.path];
        const isSelected = selectedFilePath === node.path;

        return (
          <div key={node.path} className="select-none font-mono text-xs">
            <div
              onClick={() => {
                if (isDir) {
                  toggleFolder(node.path);
                } else {
                  loadFile(node.path);
                }
              }}
              style={{ paddingLeft: `${depth * 14 + 10}px` }}
              className={`flex items-center space-x-2 py-1.5 px-2 cursor-pointer transition-colors border-l-2 ${
                isSelected
                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-500 font-semibold"
                  : "text-slate-300 hover:bg-[#161B22] border-transparent hover:text-white"
              }`}
            >
              {isDir ? (
                <>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                  {isExpanded ? (
                    <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <Folder className="w-4 h-4 text-amber-400/80 shrink-0" />
                  )}
                </>
              ) : (
                <>
                  <span className="w-3.5"></span>
                  {node.extension === ".ts" || node.extension === ".tsx" ? (
                    <FileCode className="w-4 h-4 text-blue-400 shrink-0" />
                  ) : node.extension === ".json" ? (
                    <FileCode className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </>
              )}
              <span className="truncate text-[11px]">{node.name}</span>
            </div>

            {isDir && isExpanded && node.children && node.children.length > 0 && (
              <div>{renderTreeNodes(node.children, depth + 1)}</div>
            )}
          </div>
        );
      });
  };

  // If not authenticated as Admin/Owner, show security lock screen
  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-[#0E1218] border border-slate-800 rounded p-8 shadow-xl text-slate-200 font-mono">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 px-2 py-0.5 rounded bg-amber-950 border border-amber-500/30 mb-1">
            Restricted Admin Area
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight font-sans mt-1">
            Application Source Code Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Direct codebase inspection, AST parsing, and file-write operations are restricted to the application owner.
          </p>
        </div>

        <form onSubmit={handleVerifyPasskey} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Admin Passkey / Owner PIN:
            </label>
            <input
              type="password"
              value={passkeyInput}
              onChange={(e) => setPasskeyInput(e.target.value)}
              placeholder="Enter owner passkey (e.g. dealhunter-admin-2026)"
              className="w-full bg-[#0B0E14] border border-slate-700 focus:border-emerald-500 rounded p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          {authError && (
            <div className="p-2.5 rounded bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded transition font-mono flex items-center justify-center space-x-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Authenticate & Access Code</span>
            </button>

            <button
              type="button"
              onClick={handleQuickDemoUnlock}
              className="w-full py-2 bg-[#161B22] hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-mono rounded border border-slate-800 transition"
            >
              Quick Owner Demo Unlock (DealHunter Founder)
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 text-center">
            Authorized Account: <span className="text-slate-400">emmaun40m@gmail.com</span> (Owner)
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Studio Header Bar */}
      <div className="bg-[#0E1218] border border-slate-800 rounded p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                Owner Studio v2.2
              </span>
              <span className="text-slate-500">• EXECUTIVE CONTACT: emmaun40m@gmail.com</span>
            </div>
            <h2 className="text-lg font-bold text-white font-sans tracking-tight mt-0.5">
              Live Script Execution Engine & Source Code Studio
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Studio Mode Selector */}
          <div className="flex items-center bg-[#161B22] p-0.5 rounded border border-slate-800">
            <button
              onClick={() => setStudioMode("live_engine")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
                studioMode === "live_engine"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>LIVE SCRIPT ENGINE</span>
            </button>

            <button
              onClick={() => setStudioMode("file_ide")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition ${
                studioMode === "file_ide"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>SOURCE IDE (FILES)</span>
            </button>
          </div>

          <div className="hidden lg:flex px-2.5 py-1 rounded bg-[#161B22] border border-slate-800 text-[11px] text-slate-400 items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Owner: emmaun40m@gmail.com</span>
          </div>

          <button
            onClick={handleLogout}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded border border-slate-700 transition"
          >
            Lock Studio
          </button>
        </div>
      </div>

      {/* Render selected mode */}
      {studioMode === "live_engine" ? (
        <LiveScriptEngine initialModuleId="script-underwrite-mao" />
      ) : (
        /* Main IDE Workspace Container */
        <div className="bg-[#0E1218] border border-slate-800 rounded shadow-lg grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[680px]">
        {/* Left Sidebar: File Tree */}
        <div className="md:col-span-3 border-r border-slate-800 bg-[#0B0E14] flex flex-col">
          {/* File Tree Header */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Workspace Explorer</span>
            </span>
            <button
              onClick={fetchTree}
              disabled={isLoadingTree}
              className="text-slate-500 hover:text-emerald-400 transition"
              title="Refresh tree"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTree ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Search Filter */}
          <div className="p-2 border-b border-slate-800">
            <div className="flex items-center bg-[#161B22] border border-slate-800 rounded px-2 py-1">
              <Search className="w-3 h-3 text-slate-500 shrink-0 mr-1.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search files..."
                className="w-full bg-transparent text-[11px] font-mono text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          {/* File List */}
          <div className="flex-1 overflow-y-auto py-2">
            {isLoadingTree ? (
              <div className="p-4 text-center text-slate-500 font-mono text-xs">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-emerald-500" />
                Loading workspace tree...
              </div>
            ) : fileTree.length === 0 ? (
              <div className="p-4 text-center text-slate-500 font-mono text-xs">No files found.</div>
            ) : (
              renderTreeNodes(fileTree)
            )}
          </div>

          {/* Quick Presets / Shortcuts */}
          <div className="p-3 border-t border-slate-800 bg-[#0E1218] text-[10px] font-mono">
            <span className="text-slate-500 block mb-1.5 font-bold uppercase">Quick Jump:</span>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => loadFile("src/App.tsx")}
                className="px-2 py-0.5 rounded bg-[#161B22] text-slate-300 hover:text-emerald-400 border border-slate-800"
              >
                App.tsx
              </button>
              <button
                onClick={() => loadFile("src/types.ts")}
                className="px-2 py-0.5 rounded bg-[#161B22] text-slate-300 hover:text-emerald-400 border border-slate-800"
              >
                types.ts
              </button>
              <button
                onClick={() => loadFile("src/services/store.ts")}
                className="px-2 py-0.5 rounded bg-[#161B22] text-slate-300 hover:text-emerald-400 border border-slate-800"
              >
                store.ts
              </button>
              <button
                onClick={() => loadFile("server.ts")}
                className="px-2 py-0.5 rounded bg-[#161B22] text-slate-300 hover:text-emerald-400 border border-slate-800"
              >
                server.ts
              </button>
              <button
                onClick={() => loadFile("src/services/buyerScoutAgent.ts")}
                className="px-2 py-0.5 rounded bg-[#161B22] text-slate-300 hover:text-emerald-400 border border-slate-800"
              >
                buyerScoutAgent.ts
              </button>
            </div>
          </div>
        </div>

        {/* Right Area: Code Editor & Controls */}
        <div className="md:col-span-9 flex flex-col bg-[#0B0E14]">
          {/* Editor Top Command Bar */}
          <div className="bg-[#0E1218] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center space-x-2 truncate">
              <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold text-white truncate text-xs">{selectedFilePath}</span>
              {isDirty && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                  UNSAVED CHANGES
                </span>
              )}
              {fileSize > 0 && (
                <span className="text-[10px] text-slate-500 hidden sm:inline">
                  ({(fileSize / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Code Flow Toggle Button */}
              <button
                type="button"
                id="btn-toggle-code-flow"
                onClick={() => setIsCodeFlowActive(!isCodeFlowActive)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono font-bold transition ${
                  isCodeFlowActive
                    ? "bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
                title="Toggle real-time visual code block highlighting during agent execution"
              >
                <Zap className={`w-3.5 h-3.5 ${isCodeFlowActive ? "text-emerald-400 animate-pulse" : "text-slate-500"}`} />
                <span>CODE FLOW: {isCodeFlowActive ? "ON" : "OFF"}</span>
              </button>

              {isCodeFlowActive && (
                <button
                  type="button"
                  id="btn-test-code-flow-sweep"
                  onClick={handleTestCodeFlow}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono hover:bg-cyan-900/60 transition"
                  title="Simulate BuyerScoutAgent invocation highlighting code lines in editor"
                >
                  <Play className="w-3 h-3 text-cyan-400" />
                  <span>Test Flow</span>
                </button>
              )}

              {saveStatus && (
                <span
                  className={`text-[11px] flex items-center space-x-1 ${
                    saveStatus.type === "success" ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {saveStatus.type === "success" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="truncate max-w-xs">{saveStatus.message}</span>
                </span>
              )}

              {isDirty && (
                <button
                  onClick={handleRevert}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Revert</span>
                </button>
              )}

              <button
                onClick={handleSaveFile}
                disabled={!isDirty || isSaving}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center space-x-1.5"
              >
                {isSaving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save to Disk</span>
              </button>
            </div>
          </div>

          {/* Active Code Flow Telemetry Live Banner */}
          {isCodeFlowActive && activeCodeFlowTrace && (
            <div className="bg-emerald-950/40 border-b border-emerald-500/30 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-emerald-300">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-emerald-400">CODE FLOW ACTIVE:</span>
                <span className="text-slate-300">{activeCodeFlowTrace.source}</span>
                <span className="text-slate-500">→</span>
                <span className="text-cyan-300 font-semibold truncate">{activeCodeFlowTrace.action}</span>
                {activeCodeFlowTrace.astNode && (
                  <span className="text-slate-400 hidden sm:inline font-sans">
                    AST: <code className="text-emerald-300 font-mono">{activeCodeFlowTrace.astNode}</code>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {activeCodeFlowTrace.codeRef && (
                  <span className="text-amber-300 bg-black/40 px-1.5 py-0.2 rounded border border-amber-500/30">
                    {activeCodeFlowTrace.codeRef}
                  </span>
                )}
                {activeCodeFlowTrace.executionTimeMs && (
                  <span className="text-emerald-400 font-bold">
                    +{activeCodeFlowTrace.executionTimeMs}ms
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Monaco Editor Container */}
          <div className="flex-1 relative min-h-[580px] bg-[#0E1218]">
            {isLoadingFile ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0E1218] text-slate-400 font-mono text-xs">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mb-2" />
                <span className="ml-2">Loading source stream...</span>
              </div>
            ) : (
              <Editor
                height="100%"
                path={selectedFilePath}
                language={fileLanguage}
                value={fileContent}
                onChange={(value) => setFileContent(value || "")}
                onMount={(editor) => {
                  editorInstanceRef.current = editor;
                }}
                theme="vs-dark"
                options={{
                  fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
                  fontSize: 13,
                  lineHeight: 20,
                  minimap: { enabled: true, scale: 0.8 },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: "on",
                  renderWhitespace: "selection",
                  bracketPairColorization: { enabled: true },
                }}
              />
            )}
          </div>

          {/* Editor Bottom Status Bar */}
          <div className="bg-[#0B0E14] border-t border-slate-800 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <div className="flex items-center space-x-4">
              <span className="text-emerald-400 font-bold uppercase">{fileLanguage}</span>
              <span>Lines: {fileContent.split("\n").length}</span>
              <span>Chars: {fileContent.length}</span>
              <span>Encoding: UTF-8</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Shortcut: Ctrl+S to save</span>
              {lastModified && <span>• Modified: {new Date(lastModified).toLocaleTimeString()}</span>}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
