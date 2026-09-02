// Voice Command Recognition & Dispatch Service
// Supports Web SpeechRecognition (Speech-to-Text) with continuous listening, simulated fallback, and action dispatch

import { voiceAssistant } from "./voiceAssistant";

export interface VoiceCommandAction {
  id: string;
  patterns: (string | RegExp)[];
  description: string;
  execute: (matchText: string) => void;
  voiceFeedbackText: string;
}

export interface VoiceCommandLogItem {
  id: string;
  timestamp: string;
  transcript: string;
  matchedCommandId?: string;
  commandDescription?: string;
  status: "SUCCESS" | "UNMATCHED" | "SIMULATED" | "ERROR";
  executionTimeMs?: number;
  details?: string;
}

export type ListeningState = "INACTIVE" | "LISTENING" | "PROCESSING" | "ERROR" | "UNSUPPORTED";

export interface VoiceCommandStatus {
  state: ListeningState;
  transcript: string;
  lastExecutedCommand?: string;
  feedbackMessage?: string;
  isSupported: boolean;
  logs?: VoiceCommandLogItem[];
}

type CommandListener = (status: VoiceCommandStatus) => void;

const COMMAND_LOGS_KEY = "dealhunter_voice_command_logs_v1";

class VoiceCommandsService {
  private recognition: any = null;
  private isSupported: boolean = false;
  private state: ListeningState = "INACTIVE";
  private currentTranscript: string = "";
  private lastExecutedCommand: string = "";
  private feedbackMessage: string = "";
  private listeners: CommandListener[] = [];
  private commands: VoiceCommandAction[] = [];
  private autoRestart: boolean = false;
  private commandLogs: VoiceCommandLogItem[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(COMMAND_LOGS_KEY);
        if (stored) {
          this.commandLogs = JSON.parse(stored);
        }
      } catch (e) {
        console.warn("Could not load voice command logs:", e);
      }

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition ||
        (window as any).mozSpeechRecognition ||
        (window as any).msSpeechRecognition;

      if (SpeechRecognition) {
        this.isSupported = true;
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = true;
          this.recognition.lang = "en-US";

          this.recognition.onstart = () => {
            this.state = "LISTENING";
            this.feedbackMessage = "Listening... say 'Focus on land' or other commands";
            this.notify();
          };

          this.recognition.onresult = (event: any) => {
            let interim = "";
            let final = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const transcriptPiece = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                final += transcriptPiece;
              } else {
                interim += transcriptPiece;
              }
            }

            const current = (final || interim).trim();
            this.currentTranscript = current;
            this.notify();

            if (final) {
              this.state = "PROCESSING";
              this.notify();
              this.processTranscript(final);
            }
          };

          this.recognition.onerror = (event: any) => {
            console.warn("SpeechRecognition error:", event.error);
            if (event.error === "not-allowed" || event.error === "service-not-allowed") {
              this.feedbackMessage = "Microphone access blocked. Click quick command buttons below.";
            } else if (event.error === "no-speech") {
              this.feedbackMessage = "No speech detected. Ready for next command.";
            } else {
              this.feedbackMessage = `Voice recognition note: ${event.error}`;
            }
            this.state = "INACTIVE";
            this.notify();
          };

          this.recognition.onend = () => {
            if (this.autoRestart && this.state === "LISTENING") {
              try {
                this.recognition.start();
              } catch {
                this.state = "INACTIVE";
                this.notify();
              }
            } else {
              if (this.state !== "PROCESSING") {
                this.state = "INACTIVE";
              }
              this.notify();
            }
          };
        } catch (e) {
          console.warn("Failed to initialize SpeechRecognition:", e);
          this.isSupported = false;
          this.state = "UNSUPPORTED";
        }
      } else {
        this.isSupported = false;
        this.state = "UNSUPPORTED";
      }
    }

    this.initDefaultCommands();
  }

  private initDefaultCommands() {
    this.registerCommand({
      id: "show_cheat_sheet",
      patterns: ["help", "voice commands", "command cheat sheet", "cheat sheet", "commands", "what can i say", "show commands", "help me"],
      description: "Open Command Cheat Sheet overlay with all voice commands and status",
      voiceFeedbackText: "Opening Command Cheat Sheet overlay.",
      execute: () => {
        this.dispatchAction("show_cheat_sheet");
      },
    });

    this.registerCommand({
      id: "focus_land",
      patterns: ["focus on land", "land properties", "show land", "filter by land", "filter land", "only land", "land only", "focus land"],
      description: "Switch to National Property Finder and show only land properties",
      voiceFeedbackText: "Focusing on land properties in National Property Finder.",
      execute: () => {
        this.dispatchAction("focus_land");
      },
    });

    this.registerCommand({
      id: "play_digest",
      patterns: ["play daily digest", "read daily digest", "daily digest", "play digest", "read digest", "brief me", "play briefing", "morning digest"],
      description: "Play conversational daily digest voice summary",
      voiceFeedbackText: "",
      execute: () => {
        this.dispatchAction("play_digest");
      },
    });

    this.registerCommand({
      id: "play_tab_rundown",
      patterns: ["run down", "rundown", "tab rundown", "summarize tab", "what is this tab", "explain tab", "tell me about this tab"],
      description: "Play voice overview and metrics for the current active tab",
      voiceFeedbackText: "",
      execute: () => {
        this.dispatchAction("play_tab_rundown");
      },
    });

    this.registerCommand({
      id: "stop_speech",
      patterns: ["stop audio", "stop voice", "mute audio", "stop speaking", "pause voice", "quiet", "silence", "stop playback"],
      description: "Stop or mute speech playback",
      voiceFeedbackText: "",
      execute: () => {
        this.dispatchAction("stop_speech");
      },
    });

    this.registerCommand({
      id: "nav_dashboard",
      patterns: ["go to dashboard", "open dashboard", "show dashboard", "dashboard view"],
      description: "Navigate to Executive Dashboard",
      voiceFeedbackText: "Navigating to Executive Dashboard.",
      execute: () => {
        this.dispatchAction("navigate_tab", { tab: "dashboard" });
      },
    });

    this.registerCommand({
      id: "nav_properties",
      patterns: ["go to properties", "open properties", "national property finder", "property finder", "show properties"],
      description: "Navigate to National Property Finder",
      voiceFeedbackText: "Navigating to National Property Finder.",
      execute: () => {
        this.dispatchAction("navigate_tab", { tab: "properties" });
      },
    });

    this.registerCommand({
      id: "nav_approvals",
      patterns: ["go to approvals", "open approvals", "approval gate", "human approvals", "pending approvals"],
      description: "Navigate to Human Approval Gate",
      voiceFeedbackText: "Opening Human Approval Gate.",
      execute: () => {
        this.dispatchAction("navigate_tab", { tab: "approvals" });
      },
    });

    this.registerCommand({
      id: "nav_closer",
      patterns: ["go to closer", "open closer", "virtual closer", "underwriting closer"],
      description: "Navigate to Desktop Underwriting Closer",
      voiceFeedbackText: "Opening Virtual Closer.",
      execute: () => {
        this.dispatchAction("navigate_tab", { tab: "closer" });
      },
    });

    this.registerCommand({
      id: "nav_contracts",
      patterns: ["go to contracts", "open contracts", "contracts vault", "show contracts", "executed contracts"],
      description: "Navigate to Contracts Vault",
      voiceFeedbackText: "Opening Contracts Vault.",
      execute: () => {
        this.dispatchAction("navigate_tab", { tab: "contracts" });
      },
    });

    this.registerCommand({
      id: "nav_templates",
      patterns: ["go to templates", "contract templates", "legal templates", "presentation packets"],
      description: "Navigate to Legal Contract Templates & Presentation Packets",
      voiceFeedbackText: "Opening Contract Templates Portal.",
      execute: () => {
        this.dispatchAction("navigate_tab", { tab: "templates" });
      },
    });

    this.registerCommand({
      id: "nav_db_maintenance",
      patterns: ["database maintenance", "db maintenance", "retention policies", "cleanup database", "data retention"],
      description: "Navigate to Database Maintenance & Archival Engine",
      voiceFeedbackText: "Opening Database Maintenance and Archival Engine.",
      execute: () => {
        this.dispatchAction("navigate_tab", { tab: "db_maintenance" });
      },
    });

    this.registerCommand({
      id: "nav_investors",
      patterns: ["go to investors", "investor matching", "buyer network", "vip buyers", "show investors"],
      description: "Navigate to VIP Investor Matching Engine",
      voiceFeedbackText: "Opening Investor Matching Engine.",
      execute: () => {
        this.dispatchAction("navigate_tab", { tab: "investors" });
      },
    });

    this.registerCommand({
      id: "nav_code",
      patterns: ["code editor", "script engine", "python scripts", "developer studio", "open code"],
      description: "Navigate to Script Execution Engine",
      voiceFeedbackText: "Opening Script Execution Engine.",
      execute: () => {
        this.dispatchAction("navigate_tab", { tab: "code" });
      },
    });
  }

  private actionHandlers: Map<string, (payload?: any) => void> = new Map();

  public registerAction(actionId: string, handler: (payload?: any) => void) {
    this.actionHandlers.set(actionId, handler);
  }

  public dispatchAction(actionId: string, payload?: any) {
    const handler = this.actionHandlers.get(actionId);
    if (handler) {
      handler(payload);
    }
  }

  public registerCommand(command: VoiceCommandAction) {
    // Replace if exists
    this.commands = this.commands.filter((c) => c.id !== command.id);
    this.commands.push(command);
  }

  public registerCommands(commandsList: VoiceCommandAction[]) {
    for (const cmd of commandsList) {
      this.registerCommand(cmd);
    }
  }

  public getCommands(): VoiceCommandAction[] {
    return this.commands;
  }

  public startListening(continuous: boolean = false) {
    if (!this.isSupported || !this.recognition) {
      this.state = "UNSUPPORTED";
      this.feedbackMessage = "Web Speech API not supported in this browser. Use quick command simulation.";
      this.notify();
      return;
    }

    try {
      this.autoRestart = continuous;
      this.currentTranscript = "";
      this.state = "LISTENING";
      this.recognition.start();
    } catch (e: any) {
      // If already started
      if (e.name === "InvalidStateError") {
        this.recognition.stop();
        setTimeout(() => {
          try {
            this.recognition.start();
          } catch {}
        }, 150);
      } else {
        console.warn("startListening error:", e);
        this.state = "ERROR";
        this.feedbackMessage = "Could not activate microphone.";
        this.notify();
      }
    }
  }

  public stopListening() {
    this.autoRestart = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.state = "INACTIVE";
    this.notify();
  }

  public toggleListening() {
    if (this.state === "LISTENING") {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  public processTranscript(text: string, isSimulated = false): boolean {
    const cleanText = text.trim().toLowerCase();
    this.currentTranscript = text;
    const startTime = Date.now();

    for (const cmd of this.commands) {
      for (const pattern of cmd.patterns) {
        let matched = false;
        if (typeof pattern === "string") {
          if (cleanText.includes(pattern.toLowerCase())) {
            matched = true;
          }
        } else if (pattern instanceof RegExp) {
          if (pattern.test(cleanText)) {
            matched = true;
          }
        }

        if (matched) {
          this.lastExecutedCommand = cmd.id;
          this.feedbackMessage = `Executed: "${cmd.description}"`;
          this.state = "INACTIVE";

          // Log command execution
          this.addLog({
            id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            timestamp: new Date().toISOString(),
            transcript: text,
            matchedCommandId: cmd.id,
            commandDescription: cmd.description,
            status: isSimulated ? "SIMULATED" : "SUCCESS",
            executionTimeMs: Date.now() - startTime,
            details: `Matched pattern: "${typeof pattern === "string" ? pattern : pattern.source}"`,
          });

          this.notify();

          // Execute action
          try {
            cmd.execute(text);
          } catch (err: any) {
            console.error("Command execution error:", err);
            this.addLog({
              id: `err_${Date.now()}`,
              timestamp: new Date().toISOString(),
              transcript: text,
              matchedCommandId: cmd.id,
              commandDescription: cmd.description,
              status: "ERROR",
              details: err?.message || String(err),
            });
          }

          // Spoken feedback confirmation
          if (cmd.voiceFeedbackText) {
            voiceAssistant.speak(cmd.voiceFeedbackText, { chime: "portal" });
          }

          return true;
        }
      }
    }

    // If no match found
    this.feedbackMessage = `No match for "${text}". Try: "Focus on land", "Show dashboard", or "Read daily digest".`;
    this.state = "INACTIVE";

    this.addLog({
      id: `unmatch_${Date.now()}`,
      timestamp: new Date().toISOString(),
      transcript: text,
      status: "UNMATCHED",
      executionTimeMs: Date.now() - startTime,
      details: "No registered intent patterns matched this transcript",
    });

    this.notify();
    return false;
  }

  private addLog(log: VoiceCommandLogItem) {
    this.commandLogs = [log, ...this.commandLogs].slice(0, 50);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(COMMAND_LOGS_KEY, JSON.stringify(this.commandLogs));
      } catch (e) {
        console.warn("Failed to persist command logs:", e);
      }
    }
  }

  public getCommandLogs(): VoiceCommandLogItem[] {
    return [...this.commandLogs];
  }

  public clearCommandLogs() {
    this.commandLogs = [];
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(COMMAND_LOGS_KEY);
      } catch {}
    }
    this.notify();
  }

  // Simulate command directly (useful for UI buttons & tests)
  public executeSimulatedCommand(text: string) {
    this.currentTranscript = text;
    this.state = "PROCESSING";
    this.notify();
    setTimeout(() => {
      this.processTranscript(text, true);
    }, 100);
  }

  public getStatus(): VoiceCommandStatus {
    return {
      state: this.state,
      transcript: this.currentTranscript,
      lastExecutedCommand: this.lastExecutedCommand,
      feedbackMessage: this.feedbackMessage,
      isSupported: this.isSupported,
      logs: this.commandLogs,
    };
  }

  public subscribe(listener: CommandListener): () => void {
    this.listeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const status = this.getStatus();
    for (const listener of this.listeners) {
      listener(status);
    }
  }
}

export const voiceCommands = new VoiceCommandsService();
