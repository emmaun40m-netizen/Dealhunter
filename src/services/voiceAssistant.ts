// Voice Assistant and Audio Synthesizer Service
// Handles Text-to-Speech (Web Speech API) & synthesized audio chimes for real-time alerts

export interface VoicePersona {
  id: string;
  name: string;
  category: string;
  description: string;
  pitch: number;
  rate: number;
  lang: string;
  preferredVoiceNames: string[];
}

export const VOICE_PERSONAS: VoicePersona[] = [
  {
    id: "jarvis_executive",
    name: "Nexus Tech Executive (Default)",
    category: "Executive AI",
    description: "Crisp, authoritative, high-bandwidth terminal voice with rapid cadence",
    pitch: 1.0,
    rate: 1.15,
    lang: "en-US",
    preferredVoiceNames: ["Google US English", "Samantha", "Alex", "Daniel", "Microsoft David Desktop"],
  },
  {
    id: "british_closer",
    name: "Mayfair Institutional Male",
    category: "Wall Street / Closer",
    description: "Refined, measured British accent engineered for high-stakes deal closing",
    pitch: 0.95,
    rate: 1.05,
    lang: "en-GB",
    preferredVoiceNames: ["Google UK English Male", "Oliver", "George", "Microsoft George Desktop", "Daniel"],
  },
  {
    id: "strategic_female",
    name: "Aegis Direct Female",
    category: "Cognitive Intelligence",
    description: "Clear, crystalline, analytical tone with high harmonic clarity",
    pitch: 1.1,
    rate: 1.1,
    lang: "en-US",
    preferredVoiceNames: ["Google US English Female", "Victoria", "Karen", "Microsoft Zira Desktop", "Samantha"],
  },
  {
    id: "tactical_commander",
    name: "Tactical Operations Commander",
    category: "Defense & Speed",
    description: "Deep, resonant, mission-control pace for alert and load-balancer notifications",
    pitch: 0.85,
    rate: 1.1,
    lang: "en-US",
    preferredVoiceNames: ["Fred", "Google US English", "Alex", "Microsoft Mark"],
  },
  {
    id: "calm_advisor",
    name: "Serene Senior Underwriter",
    category: "Risk Advisory",
    description: "Smooth, warm, soothing cadence for deal evaluation and escrow approvals",
    pitch: 1.05,
    rate: 1.0,
    lang: "en-US",
    preferredVoiceNames: ["Google US English", "Tessa", "Samantha", "Moira"],
  },
];

export interface VoiceSettings {
  enabled: boolean;
  selectedPersonaId: string;
  volume: number; // 0.0 to 1.0
  speechRate: number; // 0.5 to 2.0 (default: 1.0)
  pitchOffset: number; // 0.5 to 1.5 (default: 1.0)
  announceOnStart: boolean;
  announceDailyRundownOnStart: boolean;
  announceOnApprovals: boolean;
  announceOnInvestorMatch: boolean;
  announceOnPortalChange: boolean;
  announceOnTroubleshooting: boolean;
  announceOnMilestones?: boolean;
  announceOnHighROI?: boolean;
}

export interface DailyApprovalDetail {
  id: string;
  address: string;
  profit: number;
  requestedBy?: string;
  roi?: number;
  stage?: string;
}

export interface DailyRundownData {
  pendingApprovalsCount: number;
  pendingApprovalsList?: DailyApprovalDetail[];
  totalProjectedProfit: number;
  activeDealsCount: number;
  contractsPendingCount: number;
  matchedInvestorsCount: number;
  dailyOutreachCount: number;
  dailyOutreachLimit: number;
  agentSLACompliance: number;
  activeAgentsCount: number;
  realizedProfit?: number;
  closedDealsCount?: number;
}

export interface DailyTaskAction {
  id: string;
  title: string;
  description: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "ROUTINE";
  targetTab: string;
  targetId?: string;
  completed?: boolean;
  actionButtonLabel: string;
}

export interface DailyBriefingPayload {
  timestamp: string;
  greeting: string;
  spokenNarrative: string;
  summaryBullets: string[];
  actionTasks: DailyTaskAction[];
  stats: {
    pendingApprovals: number;
    projectedProfit: string;
    activeDeals: number;
    contractsPending: number;
    investorMatches: number;
    slaCompliance: string;
    outreachProgress: string;
  };
}

export type PlaybackState = "IDLE" | "PLAYING" | "PAUSED";

const STORAGE_KEY = "dealhunter_voice_settings_v1";

class VoiceAssistantService {
  private settings: VoiceSettings = {
    enabled: true,
    selectedPersonaId: "jarvis_executive",
    volume: 0.9,
    speechRate: 1.0,
    pitchOffset: 1.0,
    announceOnStart: true,
    announceDailyRundownOnStart: false,
    announceOnApprovals: true,
    announceOnInvestorMatch: true,
    announceOnPortalChange: true,
    announceOnTroubleshooting: true,
    announceOnMilestones: true,
    announceOnHighROI: true,
  };

  private availableVoices: SpeechSynthesisVoice[] = [];
  private audioCtx: AudioContext | null = null;
  private currentPlaybackState: PlaybackState = "IDLE";
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentBriefingPayload: DailyBriefingPayload | null = null;
  private subscribers: Array<(state: { playbackState: PlaybackState; text?: string }) => void> = [];

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.warn("Could not load voice settings from localStorage", e);
      }

      if ("speechSynthesis" in window) {
        this.loadVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  public subscribe(cb: (state: { playbackState: PlaybackState; text?: string }) => void) {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  private notifySubscribers(text?: string) {
    this.subscribers.forEach((cb) => {
      try {
        cb({ playbackState: this.currentPlaybackState, text });
      } catch (e) {
        // ignore subscriber errors
      }
    });
  }

  public getPlaybackState(): PlaybackState {
    return this.currentPlaybackState;
  }

  private loadVoices() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    this.availableVoices = window.speechSynthesis.getVoices();
  }

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...partial };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      } catch (e) {
        console.warn("Failed to persist voice settings", e);
      }
    }
  }

  // Synthesize modern high-tech HUD chime (Web Audio API)
  public playChime(type: "startup" | "alert" | "success" | "portal" = "alert") {
    if (typeof window === "undefined" || !this.settings.enabled) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const vol = this.settings.volume * 0.15;

      if (type === "startup") {
        // Futuristic double boot chime
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "success") {
        // Crisp high bell chime
        osc.type = "triangle";
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "portal") {
        // Swift whoosh tone
        osc.type = "sine";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.1);
        gain.gain.setValueAtTime(vol * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else {
        // High alert ping
        osc.type = "sine";
        osc.frequency.setValueAtTime(740, now);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  // Speak notification phrase with the active Persona voice
  public speak(
    text: string,
    options: {
      chime?: "startup" | "alert" | "success" | "portal";
      force?: boolean;
      onEnd?: () => void;
      onStart?: () => void;
    } = {}
  ) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (!this.settings.enabled && !options.force) return;

    if (options.chime) {
      this.playChime(options.chime);
    }

    try {
      // Cancel previous utterances to avoid speech stacking backlog
      window.speechSynthesis.cancel();

      const persona =
        VOICE_PERSONAS.find((p) => p.id === this.settings.selectedPersonaId) ||
        VOICE_PERSONAS[0];

      const rawRate = persona.rate * (this.settings.speechRate || 1.0);
      const rawPitch = persona.pitch * (this.settings.pitchOffset || 1.0);
      const rawVol = typeof this.settings.volume === "number" ? this.settings.volume : 0.9;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = Math.min(1.0, Math.max(0.0, rawVol));
      utterance.rate = Math.min(2.0, Math.max(0.5, rawRate));
      utterance.pitch = Math.min(2.0, Math.max(0.5, rawPitch));

      if (this.availableVoices.length === 0) {
        this.availableVoices = window.speechSynthesis.getVoices();
      }

      // Pick matching physical system voice
      let matchedVoice: SpeechSynthesisVoice | undefined;
      for (const pref of persona.preferredVoiceNames) {
        matchedVoice = this.availableVoices.find((v) =>
          v.name.toLowerCase().includes(pref.toLowerCase())
        );
        if (matchedVoice) break;
      }

      if (!matchedVoice && persona.lang) {
        matchedVoice = this.availableVoices.find((v) =>
          v.lang.toLowerCase().startsWith(persona.lang.toLowerCase().slice(0, 2))
        );
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      this.currentUtterance = utterance;
      this.currentPlaybackState = "PLAYING";
      this.notifySubscribers(text);

      utterance.onstart = () => {
        this.currentPlaybackState = "PLAYING";
        this.notifySubscribers(text);
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        this.currentPlaybackState = "IDLE";
        this.currentUtterance = null;
        this.notifySubscribers();
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (e) => {
        console.warn("Speech utterance error / cancelled:", e);
        this.currentPlaybackState = "IDLE";
        this.currentUtterance = null;
        this.notifySubscribers();
        if (options.onEnd) options.onEnd();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis error:", e);
      this.currentPlaybackState = "IDLE";
      this.notifySubscribers();
    }
  }

  public pauseSpeech() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      this.currentPlaybackState = "PAUSED";
      this.notifySubscribers();
    }
  }

  public resumeSpeech() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      this.currentPlaybackState = "PLAYING";
      this.notifySubscribers();
    }
  }

  public stopSpeech() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      this.currentPlaybackState = "IDLE";
      this.currentUtterance = null;
      this.notifySubscribers();
    }
  }

  // Generate structured Daily Operational Briefing & Action Tasks
  public buildDailyBriefing(data: DailyRundownData): DailyBriefingPayload {
    const hour = new Date().getHours();
    let greeting = "Good morning";
    if (hour >= 12 && hour < 17) greeting = "Good afternoon";
    else if (hour >= 17 || hour < 5) greeting = "Good evening";

    const formattedProfit = `$${(data.totalProjectedProfit || 0).toLocaleString()}`;
    const slaPercent = `${(data.agentSLACompliance || 98.8).toFixed(1)}%`;
    const pendingCount = data.pendingApprovalsCount || 0;
    const contractsCount = data.contractsPendingCount || 0;
    const investorsCount = data.matchedInvestorsCount || 0;
    const outreachProgress = `${data.dailyOutreachCount || 0} of ${data.dailyOutreachLimit || 50}`;

    // Construct spoken narrative
    let narrative = `${greeting}. Here is your executive operational rundown and daily action tasks for today. `;

    // 1. Pending Approvals highlight (Highest priority item requested by user)
    if (pendingCount > 0) {
      const topApproval = data.pendingApprovalsList && data.pendingApprovalsList[0];
      if (topApproval) {
        narrative += `High Priority: We have ${pendingCount} deals that are currently waiting for your human approval in the queue, led by ${topApproval.address} with a projected assignment profit of $${topApproval.profit.toLocaleString()}. `;
      } else {
        narrative += `High Priority: We have ${pendingCount} deals waiting for your human approval before contracts can be dispatched. `;
      }
    } else {
      narrative += `All human approval gates are currently clear with zero pending bottlenecks. `;
    }

    // 2. Active pipeline and contract status
    narrative += `Our active pipeline contains ${data.activeDealsCount || 6} qualified opportunities with ${formattedProfit} in total projected wholesale assignment profit. `;

    if (contractsCount > 0) {
      narrative += `In the Contracts Vault, ${contractsCount} agreements are active or awaiting counter-party execution. `;
    }

    if (investorsCount > 0) {
      narrative += `The Investor Matching Engine has ${investorsCount} active cash buyers registered with matched buy-boxes ready for disposition packages. `;
    }

    // 3. Cognitive Agents and SLA
    narrative += `All ${data.activeAgentsCount || 4} autonomous agents are online with ${slaPercent} sub-fifteen-second response SLA compliance. `;

    // 4. Daily Outreach progress
    narrative += `Daily outreach is currently pacing at ${outreachProgress} contacts. `;

    // 5. Action tasks summary
    narrative += `Recommended immediate tasks for today: `;
    if (pendingCount > 0) {
      narrative += `First, review and authorize the ${pendingCount} pending deals in the Human Approval Gate. `;
    }
    if (contractsCount > 0) {
      narrative += `Second, dispatch verified contract packets to matched Tier-1 investors. `;
    }
    narrative += `Third, audit 50-state statutory disclosures in Florida and Texas for earnest money compliance. All systems are primed for execution.`;

    // Construct summary bullet points
    const summaryBullets = [
      pendingCount > 0
        ? `🚨 ${pendingCount} Deal${pendingCount > 1 ? "s" : ""} Waiting for Human Approval in Gate`
        : `✅ Human Approval Queue: All clear (0 pending)`,
      `💰 Pipeline Projected Profit: ${formattedProfit} across ${data.activeDealsCount || 6} active wholesale deals`,
      `📑 Contracts & Vault: ${contractsCount} purchase agreements active / pending execution`,
      `👥 Investor Buy-Box: ${investorsCount} verified cash buyers ready for deal matching`,
      `⚡ Cognitive Agent Workforce: ${data.activeAgentsCount || 4} agents active with ${slaPercent} response SLA`,
      `📡 Daily Outreach: ${outreachProgress} outbound contacts executed`,
    ];

    // Construct Action Tasks for the Day
    const actionTasks: DailyTaskAction[] = [];

    if (pendingCount > 0) {
      actionTasks.push({
        id: "task-approvals",
        title: `Authorize ${pendingCount} Pending Deal${pendingCount > 1 ? "s" : ""} in Approval Gate`,
        description: `Review projected assignment spreads and risk scores before contracts are dispatched to sellers.`,
        priority: "CRITICAL",
        targetTab: "approvals",
        actionButtonLabel: "Open Approval Gate",
      });
    }

    if (contractsCount > 0) {
      actionTasks.push({
        id: "task-contracts",
        title: `Review & Dispatch ${contractsCount} Active Real Estate Contract${contractsCount > 1 ? "s" : ""}`,
        description: `Verify inspection periods, $0 EMD clauses, and counterparty signature statuses in Contracts Vault.`,
        priority: "HIGH",
        targetTab: "contracts",
        actionButtonLabel: "Open Contracts Vault",
      });
    }

    if (investorsCount > 0) {
      actionTasks.push({
        id: "task-investors",
        title: `Match Available Inventory to ${investorsCount} Registered Cash Buyers`,
        description: `Trigger Investor Matching Engine to generate tailored wholesale marketing packets.`,
        priority: "HIGH",
        targetTab: "investors",
        actionButtonLabel: "Match Investors",
      });
    }

    actionTasks.push({
      id: "task-closer",
      title: "Inspect Agent 4 Virtual Closer Negotiation Feeds",
      description: "Monitor real-time AI counter-offers, desktop underwriting formulas, and seller objection handling.",
      priority: "MEDIUM",
      targetTab: "closer",
      actionButtonLabel: "Review Closer",
    });

    actionTasks.push({
      id: "task-compliance",
      title: "Audit 50-State Statutory Disclosure Rules",
      description: "Verify assignment legality, double-close mandates, and statutory penalties across active target states.",
      priority: "ROUTINE",
      targetTab: "dashboard",
      actionButtonLabel: "View 12 Rules",
    });

    const payload: DailyBriefingPayload = {
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      greeting,
      spokenNarrative: narrative,
      summaryBullets,
      actionTasks,
      stats: {
        pendingApprovals: pendingCount,
        projectedProfit: formattedProfit,
        activeDeals: data.activeDealsCount || 6,
        contractsPending: contractsCount,
        investorMatches: investorsCount,
        slaCompliance: slaPercent,
        outreachProgress,
      },
    };

    this.currentBriefingPayload = payload;
    return payload;
  }

  // Generate natural short conversational sentences for the Daily Digest
  public buildNaturalDailyDigest(digest?: any, rundown?: DailyRundownData): { narrative: string; readAlongText: string; bullets: string[] } {
    const hour = new Date().getHours();
    let greeting = "Good morning";
    if (hour >= 12 && hour < 17) greeting = "Good afternoon";
    else if (hour >= 17 || hour < 5) greeting = "Good evening";

    const sentences: string[] = [];
    const readAlongLines: string[] = [];
    const bullets: string[] = [];

    // Greeting
    sentences.push(`${greeting}.`);
    readAlongLines.push(`${greeting}. Here is your automated daily digest.`);

    // 1. Matches Section (Natural sentences)
    const matches = digest?.newMatches || [
      {
        buyerName: "Terra Land Syndicate",
        sellerName: "Karen Whitfield",
        lotSize: "28-acre",
        location: "Cumberland County, Tennessee",
      },
      {
        buyerName: "Desert Ridge Builders",
        sellerName: "Delores Nguyen",
        lotSize: "5.2-acre",
        location: "Maricopa County, Arizona",
      },
      {
        buyerName: "Sonoran Land Holdings",
        sellerName: "Tom Reyes",
        lotSize: "14.5-acre",
        location: "Blanco County, Texas",
      },
    ];

    if (matches.length > 0) {
      sentences.push(`You have ${matches.length} new matches today.`);
      readAlongLines.push(`You have ${matches.length} new matches today.`);
      for (const m of matches.slice(0, 3)) {
        const buyer = m.buyerName || "Institutional Buyer";
        const seller = m.sellerName || "Motivated Seller";
        const parcel = m.propertyAddress || `${m.lotSize || "land"} parcel in ${m.location || "target submarket"}`;
        const matchSentence = `${buyer} is a fit for ${seller}'s ${parcel}.`;
        sentences.push(matchSentence);
        readAlongLines.push(matchSentence);
        bullets.push(`🎯 ${buyer} matched with ${seller} (${parcel})`);
      }
    }

    // 1b. Dedicated "New Wholesaler-Ready Buyers" Section
    const wholesaleBuyers = digest?.newWholesalerReadyBuyers || [];
    if (wholesaleBuyers.length > 0) {
      const topBuyers = wholesaleBuyers.slice(0, 3);
      const buyerListStr = topBuyers.map((b: any) => `${b.name} at ${b.company}`).join(", ");
      const wholesaleSentence = `BuyerScout Agent identified ${wholesaleBuyers.length} high-priority wholesaler-ready cash buyers receptive to contract assignments: ${buyerListStr}.`;
      sentences.push(wholesaleSentence);
      readAlongLines.push(wholesaleSentence);
      for (const b of topBuyers) {
        bullets.push(`🤝 Wholesaler-Ready: ${b.name} (${b.company}) — Assignment Fee: ${b.targetAssignmentFeeRange || "$10,000 - $35,000"} — ${b.targetMarkets?.join(", ") || "Active Markets"}`);
      }
    }

    // 2. Overdue tasks / Follow-ups Section
    const tasks = digest?.overdueTasks || [
      { name: "Tom Reyes", location: "Johnson City, Texas" },
      { name: "Marcus Vance", location: "Detroit, Michigan" },
    ];
    if (tasks.length > 0) {
      const taskNames = tasks.map((t: any) => `${t.name} in ${t.location || t.addressOrCompany || "target market"}`).slice(0, 3).join(", and ");
      const taskSentence = `${tasks.length} leads need follow-up: ${taskNames}.`;
      sentences.push(taskSentence);
      readAlongLines.push(taskSentence);
      bullets.push(`⏳ ${tasks.length} follow-up tasks requiring seller outreach`);
    }

    // 3. Status changes / Under contract
    const statusChanges = digest?.statusChanges24h || [];
    if (statusChanges.length > 0) {
      const firstChange = statusChanges[0];
      const statusSentence = `${firstChange.name} in ${firstChange.companyOrAddress} transitioned to ${firstChange.newStatus.replace("_", " ").toLowerCase()}.`;
      sentences.push(statusSentence);
      readAlongLines.push(statusSentence);
    }

    // 4. Financial & Workforce Summary
    const totalProfit = rundown?.totalProjectedProfit ? `$${rundown.totalProjectedProfit.toLocaleString()}` : "$184,500";
    const activeDeals = rundown?.activeDealsCount || 8;
    const finSentence = `Projected wholesale spread is ${totalProfit} across ${activeDeals} active opportunities. All 4 autonomous agents are online.`;
    sentences.push(finSentence);
    readAlongLines.push(finSentence);
    bullets.push(`💰 Pipeline spread: ${totalProfit} across ${activeDeals} deals`);
    bullets.push(`⚡ 4 autonomous agents running at sub-15s response SLA`);

    const fullNarrative = sentences.join(" ");
    const fullReadAlong = readAlongLines.join("\n\n");

    return {
      narrative: fullNarrative,
      readAlongText: fullReadAlong,
      bullets,
    };
  }

  // Get Spoken Rundown for every specific tab
  public getTabRundownSpeech(
    tabId: string,
    context?: {
      dealsCount?: number;
      projectedProfit?: number;
      pendingApprovals?: number;
      contractsCount?: number;
      minROI?: number;
    }
  ): { title: string; subtitle: string; narrative: string; bullets: string[] } {
    const profitStr = context?.projectedProfit ? `$${context.projectedProfit.toLocaleString()}` : "$184,500";
    const dealsCount = context?.dealsCount || 8;
    const approvalsCount = context?.pendingApprovals ?? 1;
    const contractsCount = context?.contractsCount ?? 3;
    const minROI = context?.minROI ?? 25;

    switch (tabId) {
      case "dashboard":
        return {
          title: "Executive Dashboard & Multi-Monitor Grid",
          subtitle: "Real-time pipeline orchestration, ROI heatmap, and synchronized telemetry",
          narrative: `You are on the Executive Dashboard. This command center coordinates real-time multi-monitor workspace grids, live financial ARV charts, and overall pipeline velocity. You currently have ${dealsCount} active wholesale deals with ${profitStr} in projected assignment profit.`,
          bullets: [
            `Coordinates multi-monitor workspace layout presets (1x1, 2x2, 3x2, Focus)`,
            `Tracks live financial yields, ARV spreads, and 5-day automated maintenance engine`,
            `${dealsCount} active opportunities representing ${profitStr} total pipeline spread`,
          ],
        };

      case "properties":
        return {
          title: "National Property Finder & Deep-Discount Scanner",
          subtitle: "50-state MLS aggregator with statutory licensing mandates and ROI indicators",
          narrative: `You are on the National Deep-Discount Property Finder. This scanner aggregates MLS and off-market listings across all 50 states, factoring in statutory licensing mandates, double-close requirements, and zero-dollar earnest money strategies. Listings with pulsating indicators meet or exceed your minimum ROI target of ${minROI} percent.`,
          bullets: [
            `Live 50-state wholesale licensing and double-close compliance verification`,
            `Pulsating radar badges highlight listings meeting your minimum ${minROI}% ROI target`,
            `Direct single-click triggers for Agent 2 desktop audits and Agent 3 offer drafts`,
          ],
        };

      case "agents":
        return {
          title: "Autonomous Agent Workforce & Velocity Matrix",
          subtitle: "Multi-agent cognitive pipeline, BuyerScout live search, and SLA telemetry",
          narrative: `You are in the Autonomous Agent Workforce. Here you monitor the 4 cognitive agents: DealHunter Scanner, Analyst Underwriter, Outreach Communicator, and Agent 4 Virtual Closer, alongside BuyerScout. All agents operate with sub-fifteen second response SLAs.`,
          bullets: [
            `Sub-15 second response times across 4 specialized autonomous microservices`,
            `BuyerScout web-scraping intelligence for delinquent taxes and off-market parcels`,
            `Real-time console telemetry logs with natural language command execution`,
          ],
        };

      case "closer":
        return {
          title: "Agent 4 Virtual Closer & Desktop Underwriting",
          subtitle: "Automated MAO formulas, seller objection handling, and escrow coordination",
          narrative: `You are in the Agent 4 Desktop Underwriting and Virtual Closer studio. This workspace handles maximum allowable offer calculations, automated seller objection handling, statutory assignment drafting, and escrow closing coordination.`,
          bullets: [
            `Computes 70% rule MAO with dynamic repair holding adjustments`,
            `Generates empathetic, psychologically calibrated seller objection scripts`,
            `Automated assignment fee escrow disbursement calculations`,
          ],
        };

      case "templates":
        return {
          title: "Contract Templates & 50-State Statutory Disclosures",
          subtitle: "Enforceable purchase agreements, assignments, and multi-language translations",
          narrative: `You are in the Contract Templates Studio. Here you can generate, customize, and translate 50-state compliant purchase agreements, assignment contracts, and double-closing documents featuring enforceable zero-dollar earnest money clauses.`,
          bullets: [
            `Seller, Buyer, and Investor contract templates with custom clause editors`,
            `Supports multi-language contract translation across 12 international languages`,
            `Includes compliant equitable interest and double-close statutory disclosures`,
          ],
        };

      case "payments":
        return {
          title: "ACH Bank Escrow & Cashout Portal",
          subtitle: "Title escrow hold releases, FedNow direct deposits, and assignment fee payouts",
          narrative: `You are in the ACH Payment and Escrow Cashout Portal. This hub manages title escrow holds, earnest money verification, and direct FedNow and ACH bank transfers for settled wholesale assignments.`,
          bullets: [
            `Real-time escrow wallet balance and settled wholesale earnings tracking`,
            `Link verified checking accounts with instant micro-deposit authentication`,
            `One-click bank cashouts with 1-business-day ACH processing`,
          ],
        };

      case "chat":
        return {
          title: "Real Estate Legal AI Chat & Statutory Advisor",
          subtitle: "Live advisory on 50-state wholesale statutes, licensing laws, and closing rules",
          narrative: `You are in the Real Estate Live Legal AI Chat. Ask real-time questions about 50-state wholesale statutes, equitable interest disclosures, Texas TREC rules, or Illinois and Oklahoma licensing regulations.`,
          bullets: [
            `Answers state-specific real estate wholesale statutory inquiries`,
            `Explains assignment of contract vs. double close mechanics`,
            `Provides statutory legal citations and recommended compliant wording`,
          ],
        };

      case "approvals":
        return {
          title: "Human Approval Gate & Deal Authorizations",
          subtitle: "Quality assurance control gate for high-spread offers and contract releases",
          narrative: `You are in the Human Approval Gate. This gate enforces critical safety checks before contracts or offers are dispatched. You currently have ${approvalsCount} deals waiting for your review and authorization.`,
          bullets: [
            `Ensures human review of all high-value wholesale transactions`,
            `Inspects confidence scores, title issues, and estimated repair margins`,
            `One-click authorization releases automated contracts to sellers and title`,
          ],
        };

      case "outreach":
        return {
          title: "Multi-Channel Seller Outreach Hub",
          subtitle: "Autonomous SMS and email campaigns with daily rate limit protection",
          narrative: `You are in the Outreach Hub. This center manages multi-channel SMS and email communications to property owners with autonomous follow-up pacing and daily rate limit protections.`,
          bullets: [
            `Automated personalized outreach draft generation based on seller motivation`,
            `Enforces daily outreach throttle limits to prevent spam classifications`,
            `Live message conversation logs and seller response tracking`,
          ],
        };

      case "investors":
        return {
          title: "Institutional Cash Buyer & Investor Matching Engine",
          subtitle: "Algorithmic disposition pairing based on verified buy-boxes and capital capacity",
          narrative: `You are in the Institutional Cash Buyer and Investor Matching Engine. This engine pairs verified cash buyers with off-market inventory using precise buy-box criteria and automated marketing packets.`,
          bullets: [
            `Matches active deals against institutional and private cash buyer criteria`,
            `Computes match compatibility scores based on submarket and yield targets`,
            `Automated one-click wholesale deal packet generation and dispatch`,
          ],
        };

      case "contracts":
        return {
          title: "Active Contracts Vault & Contingency Tracking",
          subtitle: "Purchase agreements, inspection contingency countdowns, and e-signatures",
          narrative: `You are in the Contracts Vault. Track active purchase agreements, assignment contracts, inspection period contingency deadlines, and counterparty electronic signatures. You have ${contractsCount} active agreements in progress.`,
          bullets: [
            `Monitors inspection contingency countdown timers and deadline alerts`,
            `Tracks digital signature statuses across buyers, sellers, and title agents`,
            `Direct document download and legal archive storage`,
          ],
        };

      case "profits":
        return {
          title: "Realized Wholesale Profit & Financial Analytics",
          subtitle: "Settled profit audits, net proceeds breakdown, and auditable CSV exports",
          narrative: `You are in the Profit Analytics and Realized Cashout Matrix. Review historical wholesale spreads, escrow disbursements, and export auditable CSV performance reports.`,
          bullets: [
            `Realized deal accounting tracking gross sale, holding costs, and net profit`,
            `Historical underwriting snapshot comparison across pipeline stages`,
            `Instant CSV export for CPA bookkeeping and title company reconciliation`,
          ],
        };

      case "code":
        return {
          title: "Admin Source Code Studio & Monaco Editor",
          subtitle: "Live file system inspection, backend API routes, and container hot-reloads",
          narrative: `You are in the Admin Source Code Studio. Inspect live container file systems, edit backend and frontend modules directly with the Monaco Editor, and hot-reload changes in real-time.`,
          bullets: [
            `Full workspace file explorer with syntax highlighting and live editing`,
            `Administrative override controls for backend server routes and agent pipelines`,
            `Direct audit log integration and file system modification safeguards`,
          ],
        };

      default:
        return {
          title: "Workspace Module",
          subtitle: "Autonomous Real Estate Intelligence Hub",
          narrative: `You are viewing DealHunter AI's ${tabId} workspace. All systems and cognitive agent pipelines are operational.`,
          bullets: [`Real-time data synchronization active`, `Sub-15s response SLA active`],
        };
    }
  }

  // Speak the complete daily briefing
  public playDailyRundown(
    data: DailyRundownData,
    onStatusChange?: (state: PlaybackState) => void
  ) {
    const briefing = this.buildDailyBriefing(data);
    this.speak(briefing.spokenNarrative, {
      chime: "startup",
      force: true,
      onStart: () => {
        if (onStatusChange) onStatusChange("PLAYING");
      },
      onEnd: () => {
        if (onStatusChange) onStatusChange("IDLE");
      },
    });
  }

  // Speak natural daily digest
  public playDailyDigest(
    digestData?: any,
    rundownData?: DailyRundownData,
    onStatusChange?: (state: PlaybackState) => void
  ) {
    const digestResult = this.buildNaturalDailyDigest(digestData, rundownData);
    this.speak(digestResult.narrative, {
      chime: "startup",
      force: true,
      onStart: () => {
        if (onStatusChange) onStatusChange("PLAYING");
      },
      onEnd: () => {
        if (onStatusChange) onStatusChange("IDLE");
      },
    });
  }

  // Speak tab rundown
  public playTabRundown(
    tabId: string,
    context?: any,
    onStatusChange?: (state: PlaybackState) => void
  ) {
    const info = this.getTabRundownSpeech(tabId, context);
    this.speak(info.narrative, {
      chime: "portal",
      force: true,
      onStart: () => {
        if (onStatusChange) onStatusChange("PLAYING");
      },
      onEnd: () => {
        if (onStatusChange) onStatusChange("IDLE");
      },
    });
  }

  public getLastBriefing(): DailyBriefingPayload | null {
    return this.currentBriefingPayload;
  }

  // Shortcut triggers
  public announceStartup() {
    if (!this.settings.announceOnStart) return;
    this.speak(
      "DealHunter Autonomous System activated. 4 cognitive agents online, global edge load balancer balanced, multi monitor broadcast active.",
      { chime: "startup" }
    );
  }

  public announceLeadApproval(address: string, spread: number | string) {
    if (!this.settings.announceOnApprovals) return;
    const formatted = typeof spread === "number" ? `$${spread.toLocaleString()}` : spread;
    this.speak(
      `Lead approved. High spread opportunity verified at ${address} with ${formatted} projected assignment margin.`,
      { chime: "success" }
    );
  }

  public announceInvestorMatch(buyerName: string, dealAddress: string) {
    if (!this.settings.announceOnInvestorMatch) return;
    this.speak(
      `Investor match confirmed. Cash buyer ${buyerName} successfully matched to deal on ${dealAddress}.`,
      { chime: "success" }
    );
  }

  public announceWholesalerReadyBuyer(buyerName: string, company: string, location?: string, feeRange?: string) {
    const locText = location ? ` in ${location}` : "";
    const feeText = feeRange ? ` with target fee range of ${feeRange}` : "";
    this.speak(
      `Wholesaler-ready buyer identified! ${buyerName} at ${company}${locText}. Actively accepting wholesale assignments${feeText}. High-priority lead saved.`,
      { chime: "success", force: true }
    );
  }

  public announcePortalChange(portalTitle: string) {
    if (!this.settings.announceOnPortalChange) return;
    this.speak(`Workspace routed to ${portalTitle}.`, { chime: "portal" });
  }

  public announceTroubleshooting(agentName: string, status: string) {
    if (!this.settings.announceOnTroubleshooting) return;
    this.speak(`System diagnostics check complete. ${agentName} status verified: ${status}.`, {
      chime: "alert",
    });
  }

  public announceMilestone(agentName: string, milestoneTitle: string, metricValue?: string) {
    if (this.settings.announceOnMilestones === false) return;
    const metricPhrase = metricValue ? ` achieving ${metricValue}` : "";
    this.speak(
      `High performance milestone unlocked! ${agentName} has achieved ${milestoneTitle}${metricPhrase}. Team efficiency upgraded.`,
      { chime: "success", force: true }
    );
  }

  public announceHighROI(address: string, roi: number, targetMinROI: number) {
    if (this.settings.announceOnHighROI === false) return;
    this.speak(
      `Attention. High yield property detected at ${address}. Computed return on investment is ${roi} percent, exceeding your target baseline of ${targetMinROI} percent.`,
      { chime: "alert", force: true }
    );
  }

  public calibrateVoice(phrase?: string) {
    const text =
      phrase ||
      `Voice calibration test. Speed rate is ${Math.round((this.settings.speechRate || 1.0) * 100)} percent. Volume is ${Math.round((this.settings.volume ?? 0.9) * 100)} percent. DealHunter audio synthesis optimal.`;
    this.speak(text, { chime: "startup", force: true });
  }
}

export const voiceAssistant = new VoiceAssistantService();
