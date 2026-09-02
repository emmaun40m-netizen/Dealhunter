import { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import DashboardOverview from "./components/DashboardOverview";
import AgentControlCenter from "./components/AgentControlCenter";
import NationalPropertyFinder from "./components/NationalPropertyFinder";
import ApprovalQueue from "./components/ApprovalQueue";
import OutreachHub from "./components/OutreachHub";
import InvestorMatching from "./components/InvestorMatching";
import ContractsVault from "./components/ContractsVault";
import ProfitAnalytics from "./components/ProfitAnalytics";
import DealAnalysisModal from "./components/DealAnalysisModal";
import CriticalRulesModal from "./components/CriticalRulesModal";
import ConfigModal from "./components/ConfigModal";
import ContractTemplatesStudio from "./components/ContractTemplatesStudio";
import RealEstateLiveChat from "./components/RealEstateLiveChat";
import DesktopUnderwritingCloser from "./components/DesktopUnderwritingCloser";
import PaymentPortal from "./components/PaymentPortal";
import CodeEditorStudio from "./components/CodeEditorStudio";
import DatabaseMaintenance from "./components/DatabaseMaintenance";
import FloatingDisplayController from "./components/FloatingDisplayController";
import LiveGraphsWidget from "./components/dashboard/LiveGraphsWidget";
import LiveFeedsWidget from "./components/dashboard/LiveFeedsWidget";
import LiveCodeExecutionWidget from "./components/dashboard/LiveCodeExecutionWidget";
import RadarWidget from "./components/dashboard/RadarWidget";
import GlobalTrafficMapWidget from "./components/dashboard/GlobalTrafficMapWidget";
import SLAComplianceMonitorWidget from "./components/dashboard/SLAComplianceMonitorWidget";
import AgentMaintenanceRoutineWidget from "./components/dashboard/AgentMaintenanceRoutineWidget";
import DailyBriefingWidget from "./components/dashboard/DailyBriefingWidget";
import VoiceAssistantModal from "./components/VoiceAssistantModal";
import CommandCheatSheetOverlay from "./components/CommandCheatSheetOverlay";
import AppDownloadCenterModal from "./components/AppDownloadCenterModal";
import { voiceAssistant } from "./services/voiceAssistant";
import { voiceCommands } from "./services/voiceCommands";
import { offlineSync } from "./services/offlineSyncService";
import TabVoiceRundown from "./components/TabVoiceRundown";
import SystemHeartbeatIndicator from "./components/SystemHeartbeatIndicator";
import {
  multiMonitorSync,
  GridPreset,
  MonitorDisplay,
} from "./services/multiMonitorSync";

import {
  Property,
  Deal,
  ApprovalRequest,
  OutreachMessage,
  Investor,
  Contract,
  ProfitSnapshot,
  RealizedDeal,
  SearchProfile,
  DashboardMetrics,
  AppConfig,
  DealInput,
} from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [outreachMessages, setOutreachMessages] = useState<OutreachMessage[]>([]);
  const [sentToday, setSentToday] = useState<number>(2);
  const [dailyLimit, setDailyLimit] = useState<number>(10);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [snapshots, setSnapshots] = useState<ProfitSnapshot[]>([]);
  const [realizedDeals, setRealizedDeals] = useState<RealizedDeal[]>([]);
  const [searchProfiles, setSearchProfiles] = useState<SearchProfile[]>([]);
  const [config, setConfig] = useState<AppConfig>({
    dailyOutreachLimit: 10,
    minProfit: 20000,
    minROI: 25,
    defaultMaxPrice: 50000,
    humanApprovalRequired: true,
  });
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>("ALL");

  // Multi-monitor detached state
  const [detachedWidgets, setDetachedWidgets] = useState<string[]>(() =>
    multiMonitorSync.getDetachedWidgets()
  );
  const [currentPreset, setCurrentPreset] = useState<GridPreset>(
    () => multiMonitorSync.loadLayout().preset || "2x2"
  );

  // Check if current window instance is a popped out standalone display
  const [isPopoutWindow, setIsPopoutWindow] = useState(false);
  const [popoutWidgetId, setPopoutWidgetId] = useState<string | null>(null);
  const [popoutTitle, setPopoutTitle] = useState<string>("");

  // Voice Cheat Sheet Modal state
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);

  // Register Global Voice Commands Handlers
  useEffect(() => {
    voiceCommands.registerAction("show_cheat_sheet", () => {
      setIsCheatSheetOpen(true);
    });

    voiceCommands.registerAction("focus_land", () => {
      setActiveTab("properties");
      setSelectedPropertyType("LAND");
      voiceAssistant.speak("Switching to National Property Finder and filtering for land properties.", { chime: "portal" });
    });

    voiceCommands.registerAction("navigate_tab", (payload) => {
      if (payload?.tab) {
        handleTabChange(payload.tab);
      }
    });

    voiceCommands.registerAction("play_digest", () => {
      voiceAssistant.playDailyDigest(null, {
        pendingApprovalsCount: approvals.filter((a) => a.status === "PENDING").length,
        totalProjectedProfit: metrics?.projected?.totalProfit || 184500,
        activeDealsCount: deals.length || 8,
        contractsPendingCount: contracts.length || 3,
        matchedInvestorsCount: investors.length || 6,
        dailyOutreachCount: metrics?.dailyOutreachCount || 14,
        dailyOutreachLimit: metrics?.dailyOutreachLimit || 50,
        agentSLACompliance: 99.2,
        activeAgentsCount: 4,
      });
    });

    voiceCommands.registerAction("play_tab_rundown", (payload) => {
      const targetTab = payload?.tab || activeTab;
      voiceAssistant.playTabRundown(targetTab, {
        deals,
        approvals,
        contracts,
        metrics,
        configMinROI: config?.minROI ?? 25,
      });
    });

    voiceCommands.registerAction("stop_speech", () => {
      voiceAssistant.stopSpeech();
    });
  }, [approvals, metrics, deals, contracts, investors, activeTab, config]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("popout") === "true") {
        setIsPopoutWindow(true);
        setPopoutWidgetId(params.get("widget"));
        setPopoutTitle(decodeURIComponent(params.get("title") || "Detached Display"));
      }
    }
  }, []);

  // Multi-monitor broadcast subscription
  useEffect(() => {
    const unsub = multiMonitorSync.subscribe((msg) => {
      if (msg.type === "WIDGET_POPOUT" || msg.type === "WIDGET_RECALLED") {
        setDetachedWidgets(multiMonitorSync.getDetachedWidgets());
      }
      if (msg.type === "LAYOUT_CHANGED" && msg.payload?.preset) {
        setCurrentPreset(msg.payload.preset);
      }
      if (msg.type === "VIEW_CHANGED" && msg.payload?.view) {
        setActiveTab(msg.payload.view);
      }
    });
    return () => unsub();
  }, []);

  // Modal states
  const [selectedDealForAnalysis, setSelectedDealForAnalysis] = useState<Deal | null>(null);
  const [selectedInvestorDealId, setSelectedInvestorDealId] = useState<string | undefined>(undefined);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Announce startup or daily rundown once on system initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      const settings = voiceAssistant.getSettings();
      if (settings.announceDailyRundownOnStart) {
        voiceAssistant.playDailyRundown({
          pendingApprovalsCount: approvals.filter((a) => a.status === "PENDING").length,
          totalProjectedProfit: metrics?.projected?.totalProfit || 184500,
          activeDealsCount: deals.length || 8,
          contractsPendingCount: contracts.length || 3,
          matchedInvestorsCount: investors.length || 6,
          dailyOutreachCount: metrics?.dailyOutreachCount || 14,
          dailyOutreachLimit: metrics?.dailyOutreachLimit || 50,
          agentSLACompliance: 99.2,
          activeAgentsCount: 4,
        });
      } else {
        voiceAssistant.announceStartup();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const tabLabels: Record<string, string> = {
      dashboard: "Executive Dashboard",
      agents: "Autonomous Agent Workforce",
      closer: "Agent 4 Virtual Closer",
      templates: "Contract Templates Studio",
      payments: "ACH Payment & Cashout Portal",
      chat: "Real Estate Live AI Chat",
      properties: "National Property Finder",
      approvals: "Human Approval Gate",
      outreach: "Outreach Hub",
      investors: "Investor Matching Engine",
      contracts: "Contracts Vault",
      profits: "Profit Snapshots",
    };
    voiceAssistant.announcePortalChange(tabLabels[newTab] || newTab);
  };

  const fetchAllData = useCallback(async () => {
    try {
      const [
        dashboardRes,
        dealsRes,
        propsRes,
        approvalsRes,
        outreachRes,
        investorsRes,
        contractsRes,
        profitsRes,
        profilesRes,
        configRes,
      ] = await Promise.all([
        fetch("/api/dashboard").then((r) => r.json()),
        fetch("/api/deals").then((r) => r.json()),
        fetch("/api/properties/search").then((r) => r.json()),
        fetch("/api/approvals").then((r) => r.json()),
        fetch("/api/outreach").then((r) => r.json()),
        fetch("/api/investors").then((r) => r.json()),
        fetch("/api/contracts").then((r) => r.json()),
        fetch("/api/profits").then((r) => r.json()),
        fetch("/api/search-profiles").then((r) => r.json()),
        fetch("/api/config").then((r) => r.json()),
      ]);

      if (dashboardRes.success) setMetrics(dashboardRes);
      if (dealsRes.success && dealsRes.deals) setDeals(dealsRes.deals);
      if (propsRes.success && propsRes.results) setProperties(propsRes.results);
      if (approvalsRes.success && approvalsRes.approvals) setApprovals(approvalsRes.approvals);
      if (outreachRes.success) {
        setOutreachMessages(outreachRes.messages || []);
        setSentToday(outreachRes.sentToday || 0);
        setDailyLimit(outreachRes.dailyLimit || 10);
      }
      if (investorsRes.success && investorsRes.investors) setInvestors(investorsRes.investors);
      if (contractsRes.success && contractsRes.contracts) setContracts(contractsRes.contracts);
      if (profitsRes.success) {
        setSnapshots(profitsRes.snapshots || []);
        setRealizedDeals(profitsRes.realizedDeals || []);
      }
      if (profilesRes.success && profilesRes.data) setSearchProfiles(profilesRes.data);
      if (configRes.success && configRes.config) setConfig(configRes.config);
    } catch (err) {
      console.error("Failed to load DealHunter data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Deal Analysis Actions
  const handleSaveAnalysis = async (propertyId: string, customFinancials: DealInput) => {
    try {
      const res = await fetch(`/api/deals/${propertyId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ financials: customFinancials }),
      });
      const data = await res.json();
      if (data.success && data.deal) {
        setSelectedDealForAnalysis(data.deal);
        fetchAllData();
      }
    } catch (err) {
      console.error("Save analysis error:", err);
    }
  };

  const handleAdvanceDealStage = async (dealId: string, stage: Deal["status"]) => {
    try {
      // Optimistic update
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, status: stage } : d))
      );
      if (selectedDealForAnalysis && selectedDealForAnalysis.id === dealId) {
        setSelectedDealForAnalysis({
          ...selectedDealForAnalysis,
          status: stage,
        });
      }

      await offlineSync.enqueueAction({
        type: "DEAL_STAGE_UPDATE",
        title: `Advance Deal #${dealId} to ${stage}`,
        endpoint: `/api/deals/${dealId}/stage`,
        method: "POST",
        body: { stage, notes: `Advanced to ${stage} stage.` },
        metadata: { entityId: dealId, stage },
      });

      fetchAllData();
    } catch (err) {
      console.error("Stage update error:", err);
    }
  };

  // Human Approval Actions
  const handleApproveRequest = async (id: string, notes?: string) => {
    const req = approvals.find((a) => a.id === id);
    if (req) {
      voiceAssistant.announceLeadApproval(
        req.property?.address || "Selected Property",
        req.dealMetrics?.projectedProfit || 25000
      );
    }

    // Optimistic local update
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "APPROVED",
              resolvedAt: new Date().toISOString(),
              humanNotes: notes || "Authorized by Human Executive",
            }
          : a
      )
    );

    await offlineSync.enqueueAction({
      type: "DEAL_APPROVAL",
      title: `Approve Deal Offer — ${req?.property?.address || id}`,
      endpoint: `/api/approvals/${id}/approve`,
      method: "POST",
      body: { notes: notes || "Authorized by Human Executive" },
      metadata: {
        entityId: id,
        propertyName: req?.property?.address,
        amount: req?.dealMetrics?.projectedProfit,
      },
    });

    fetchAllData();
  };

  const handleRejectRequest = async (id: string, notes?: string) => {
    const req = approvals.find((a) => a.id === id);

    // Optimistic local update
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "REJECTED",
              resolvedAt: new Date().toISOString(),
              humanNotes: notes || "Rejected during human review",
            }
          : a
      )
    );

    await offlineSync.enqueueAction({
      type: "DEAL_REJECTION",
      title: `Reject Deal Request — ${req?.property?.address || id}`,
      endpoint: `/api/approvals/${id}/reject`,
      method: "POST",
      body: { notes: notes || "Rejected during human review" },
      metadata: {
        entityId: id,
        propertyName: req?.property?.address,
      },
    });

    fetchAllData();
  };

  // Outreach Actions
  const handleDraftOutreach = async (
    propertyId: string,
    tone: "cash_buyer" | "direct" | "relationship" = "cash_buyer"
  ) => {
    await offlineSync.enqueueAction({
      type: "OUTREACH_DRAFT",
      title: `Generate Outreach Draft — Property #${propertyId}`,
      endpoint: "/api/outreach/draft",
      method: "POST",
      body: { propertyId, tone },
      metadata: { entityId: propertyId, tone },
    });

    setActiveTab("outreach");
    fetchAllData();
  };

  const handleSendOutreach = async (messageId: string) => {
    // Optimistic update
    setOutreachMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, status: "SENT", sentAt: new Date().toISOString() }
          : m
      )
    );
    setSentToday((prev) => prev + 1);

    await offlineSync.enqueueAction({
      type: "OUTREACH_SEND",
      title: `Send Outreach Message #${messageId}`,
      endpoint: `/api/outreach/${messageId}/send`,
      method: "POST",
      metadata: { entityId: messageId },
    });

    fetchAllData();
  };

  // Contracts Actions
  const handleDraftContract = async (params: {
    dealId: string;
    type: Contract["type"];
    sellerName: string;
    buyerName: string;
  }) => {
    await offlineSync.enqueueAction({
      type: "CONTRACT_DRAFT",
      title: `Draft ${params.type} Contract for Deal #${params.dealId}`,
      endpoint: "/api/contracts/draft",
      method: "POST",
      body: params,
      metadata: { entityId: params.dealId, contractType: params.type },
    });

    setActiveTab("contracts");
    fetchAllData();
  };

  const handleSignContract = async (contractId: string) => {
    // Optimistic update
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? { ...c, status: "EXECUTED", updatedAt: new Date().toISOString() }
          : c
      )
    );

    await offlineSync.enqueueAction({
      type: "CONTRACT_SIGN",
      title: `Execute Contract #${contractId}`,
      endpoint: `/api/contracts/${contractId}/sign`,
      method: "POST",
      metadata: { entityId: contractId },
    });

    fetchAllData();
  };

  // Realized Profit Actions
  const handleRecordRealized = async (params: any) => {
    await fetch(`/api/deals/${params.dealId}/realized`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    fetchAllData();
  };

  // Config Actions
  const handleSaveConfig = async (newConfig: AppConfig) => {
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newConfig),
    });
    setConfig(newConfig);
    fetchAllData();
  };

  const handleSelectPropertyForInspection = (property: Property) => {
    const d = deals.find((x) => x.propertyId === property.id);
    if (d) {
      setSelectedDealForAnalysis(d);
    } else {
      // Trigger analyze
      handleSaveAnalysis(property.id, {
        purchasePrice: property.askingPrice,
        repairs: property.estimatedRepairs,
        closingCosts: 2500,
        holdingCosts: 1800,
        financingCosts: 0,
        taxes: 1200,
        insurance: 800,
        utilities: 500,
        otherCosts: 0,
        expectedSalePrice: property.expectedSalePrice,
        sellingCosts: Math.round(property.expectedSalePrice * 0.03),
        commissions: Math.round(property.expectedSalePrice * 0.05),
        concessions: 0,
      });
    }
  };

  const handlePopoutWidget = (widgetId: string, title: string, targetDisplay?: MonitorDisplay) => {
    multiMonitorSync.popoutWidget(widgetId, title, targetDisplay);
    setDetachedWidgets(multiMonitorSync.getDetachedWidgets());
  };

  const handleRecallWidget = (widgetId: string) => {
    multiMonitorSync.recallWidget(widgetId);
    setDetachedWidgets(multiMonitorSync.getDetachedWidgets());
  };

  const handleRecallAll = () => {
    multiMonitorSync.recallAllWidgets();
    setDetachedWidgets([]);
  };

  const handleSelectPreset = (preset: GridPreset) => {
    setCurrentPreset(preset);
    const layout = multiMonitorSync.loadLayout();
    multiMonitorSync.saveLayout({ ...layout, preset });
  };

  // If this is a detached secondary monitor window
  if (isPopoutWindow) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-slate-200 flex flex-col font-mono selection:bg-emerald-500 selection:text-black">
        {/* Detached Window Top Bar */}
        <div className="h-10 px-4 bg-[#111620] border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white uppercase">{popoutTitle || "Detached Display"}</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-900 text-slate-400 border border-slate-700 rounded">
              BROADCAST: host_multi_monitor_sync_v2
            </span>
          </div>
          <button
            onClick={() => window.close()}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-[10px] transition"
          >
            RETURN & CLOSE WINDOW
          </button>
        </div>

        {/* Detached Fullscreen Content */}
        <div className="flex-1 p-4 overflow-auto">
          {popoutWidgetId === "daily_briefing" && (
            <DailyBriefingWidget
              deals={deals}
              approvals={approvals}
              metrics={metrics}
              contracts={contracts}
              investors={investors}
              onNavigateTab={(tab) => {
                multiMonitorSync.pushView(tab);
                window.close();
              }}
              onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
              isDetached={true}
            />
          )}
          {popoutWidgetId === "global_traffic" && (
            <GlobalTrafficMapWidget isDetached={true} />
          )}
          {popoutWidgetId === "sla_monitor" && (
            <SLAComplianceMonitorWidget isDetached={true} />
          )}
          {popoutWidgetId === "maintenance_routine" && (
            <AgentMaintenanceRoutineWidget isDetached={true} />
          )}
          {popoutWidgetId === "graphs" && (
            <LiveGraphsWidget deals={deals} onSelectDeal={(d) => setSelectedDealForAnalysis(d)} isDetached={true} />
          )}
          {popoutWidgetId === "live_feeds" && (
            <LiveFeedsWidget isDetached={true} />
          )}
          {popoutWidgetId === "live_code" && (
            <LiveCodeExecutionWidget isDetached={true} />
          )}
          {popoutWidgetId === "radar" && (
            <RadarWidget isDetached={true} />
          )}
          {popoutWidgetId === "closer_studio" && (
            <DesktopUnderwritingCloser />
          )}
          {popoutWidgetId === "payment_portal" && (
            <PaymentPortal />
          )}
          {!["daily_briefing", "global_traffic", "sla_monitor", "maintenance_routine", "graphs", "live_feeds", "live_code", "radar", "closer_studio", "payment_portal"].includes(popoutWidgetId || "") && (
            <LiveGraphsWidget deals={deals} onSelectDeal={(d) => setSelectedDealForAnalysis(d)} isDetached={true} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Main Navigation */}
      <Navbar
        metrics={metrics}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onRefreshData={fetchAllData}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400 font-mono">Initializing DealHunter AI Agents & Store...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <DashboardOverview
                metrics={metrics}
                deals={deals}
                approvals={approvals}
                contracts={contracts}
                investors={investors}
                configMinROI={config.minROI}
                onSelectDeal={(deal) => setSelectedDealForAnalysis(deal)}
                onNavigateTab={(tab) => handleTabChange(tab)}
                onPopoutWidget={handlePopoutWidget}
                detachedWidgets={detachedWidgets}
                onRecallWidget={handleRecallWidget}
                onRecallAll={handleRecallAll}
                currentPreset={currentPreset}
                onChangePreset={handleSelectPreset}
                onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
              />
            )}

            {activeTab === "agents" && (
              <div className="space-y-4">
                <TabVoiceRundown
                  activeTab="agents"
                  deals={deals}
                  approvals={approvals}
                  contracts={contracts}
                  metrics={metrics}
                  configMinROI={config.minROI}
                  onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
                  onNavigateTab={handleTabChange}
                />
                <AgentControlCenter
                  onDealSelect={(deal) => setSelectedDealForAnalysis(deal)}
                  onRefreshData={fetchAllData}
                />
              </div>
            )}

            {activeTab === "closer" && (
              <div className="space-y-4">
                <TabVoiceRundown
                  activeTab="closer"
                  deals={deals}
                  approvals={approvals}
                  contracts={contracts}
                  metrics={metrics}
                  configMinROI={config.minROI}
                  onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
                  onNavigateTab={handleTabChange}
                />
                <DesktopUnderwritingCloser />
              </div>
            )}

            {activeTab === "templates" && (
              <div className="space-y-4">
                <TabVoiceRundown
                  activeTab="templates"
                  deals={deals}
                  approvals={approvals}
                  contracts={contracts}
                  metrics={metrics}
                  configMinROI={config.minROI}
                  onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
                  onNavigateTab={handleTabChange}
                />
                <ContractTemplatesStudio
                  onNavigateToVault={() => handleTabChange("contracts")}
                  onNavigateToPayments={() => handleTabChange("payments")}
                />
              </div>
            )}

            {activeTab === "payments" && (
              <div className="space-y-4">
                <TabVoiceRundown
                  activeTab="payments"
                  deals={deals}
                  approvals={approvals}
                  contracts={contracts}
                  metrics={metrics}
                  configMinROI={config.minROI}
                  onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
                  onNavigateTab={handleTabChange}
                />
                <PaymentPortal />
              </div>
            )}

            {activeTab === "chat" && (
              <div className="space-y-4">
                <TabVoiceRundown
                  activeTab="chat"
                  deals={deals}
                  approvals={approvals}
                  contracts={contracts}
                  metrics={metrics}
                  configMinROI={config.minROI}
                  onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
                  onNavigateTab={handleTabChange}
                />
                <RealEstateLiveChat />
              </div>
            )}

            {activeTab === "properties" && (
              <div className="space-y-4">
                <TabVoiceRundown
                  activeTab="properties"
                  deals={deals}
                  approvals={approvals}
                  contracts={contracts}
                  metrics={metrics}
                  configMinROI={config.minROI}
                  onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
                  onNavigateTab={handleTabChange}
                />
                <NationalPropertyFinder
                  properties={properties}
                  deals={deals}
                  searchProfiles={searchProfiles}
                  configMinROI={config.minROI}
                  selectedTypeControlled={selectedPropertyType}
                  onTypeChange={setSelectedPropertyType}
                  onSelectProperty={handleSelectPropertyForInspection}
                  onAnalyzeProperty={(propId) => {
                    const d = deals.find((x) => x.propertyId === propId);
                    if (d) setSelectedDealForAnalysis(d);
                  }}
                  onDraftOutreach={(propId) => handleDraftOutreach(propId, "cash_buyer")}
                  onCloserUnderwrite={(_dealId) => {
                    handleTabChange("closer");
                  }}
                  onMatchInvestors={(dealId) => {
                    setSelectedInvestorDealId(dealId);
                    handleTabChange("investors");
                  }}
                />
              </div>
            )}

            {activeTab === "approvals" && (
              <div className="space-y-4">
                <TabVoiceRundown
                  activeTab="approvals"
                  deals={deals}
                  approvals={approvals}
                  contracts={contracts}
                  metrics={metrics}
                  configMinROI={config.minROI}
                  onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
                  onNavigateTab={handleTabChange}
                />
                <ApprovalQueue
                  approvals={approvals}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                  onRefresh={fetchAllData}
                />
              </div>
            )}

            {activeTab === "outreach" && (
              <div className="space-y-4">
                <TabVoiceRundown
                  activeTab="outreach"
                  deals={deals}
                  approvals={approvals}
                  contracts={contracts}
                  metrics={metrics}
                  configMinROI={config.minROI}
                  onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
                  onNavigateTab={handleTabChange}
                />
                <OutreachHub
                  messages={outreachMessages}
                  properties={properties}
                  sentToday={sentToday}
                  dailyLimit={dailyLimit}
                  onDraftOutreach={handleDraftOutreach}
                  onSendMessage={handleSendOutreach}
                  onRefresh={fetchAllData}
                />
              </div>
            )}

            {activeTab === "investors" && (
              <div className="space-y-4">
                <TabVoiceRundown
                  activeTab="investors"
                  deals={deals}
                  approvals={approvals}
                  contracts={contracts}
                  metrics={metrics}
                  configMinROI={config.minROI}
                  onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
                  onNavigateTab={handleTabChange}
                />
                <InvestorMatching
                  investors={investors}
                  deals={deals}
                  selectedDealId={selectedInvestorDealId}
                  onSendDealPacket={(_invId, _dealId) => {
                    fetchAllData();
                  }}
                />
              </div>
            )}

            {activeTab === "contracts" && (
              <div className="space-y-4">
                <TabVoiceRundown
                  activeTab="contracts"
                  deals={deals}
                  approvals={approvals}
                  contracts={contracts}
                  metrics={metrics}
                  configMinROI={config.minROI}
                  onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
                  onNavigateTab={handleTabChange}
                />
                <ContractsVault
                  contracts={contracts}
                  deals={deals}
                  onDraftContract={handleDraftContract}
                  onSignContract={handleSignContract}
                  onRefresh={fetchAllData}
                />
              </div>
            )}

            {activeTab === "profits" && (
              <div className="space-y-4">
                <TabVoiceRundown
                  activeTab="profits"
                  deals={deals}
                  approvals={approvals}
                  contracts={contracts}
                  metrics={metrics}
                  configMinROI={config.minROI}
                  onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
                  onNavigateTab={handleTabChange}
                />
                <ProfitAnalytics
                  snapshots={snapshots}
                  realizedDeals={realizedDeals}
                  deals={deals}
                  metrics={metrics}
                  onRecordRealized={handleRecordRealized}
                  onRefresh={fetchAllData}
                />
              </div>
            )}

            {activeTab === "code" && (
              <div className="space-y-4">
                <TabVoiceRundown
                  activeTab="code"
                  deals={deals}
                  approvals={approvals}
                  contracts={contracts}
                  metrics={metrics}
                  configMinROI={config.minROI}
                  onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
                  onNavigateTab={handleTabChange}
                />
                <CodeEditorStudio />
              </div>
            )}

            {activeTab === "db_maintenance" && (
              <div className="space-y-4">
                <TabVoiceRundown
                  activeTab="db_maintenance"
                  deals={deals}
                  approvals={approvals}
                  contracts={contracts}
                  metrics={metrics}
                  configMinROI={config.minROI}
                  onOpenVoiceSettings={() => setIsVoiceModalOpen(true)}
                  onNavigateTab={handleTabChange}
                />
                <DatabaseMaintenance
                  deals={deals}
                  contracts={contracts}
                  properties={properties}
                  onRefreshData={fetchAllData}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* System Telemetry & Heartbeat Footer */}
      <footer className="min-h-12 py-2 border-t border-slate-800 bg-[#0B0E14] px-4 sm:px-8 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-auto">
        <div className="flex items-center gap-3">
          <SystemHeartbeatIndicator
            onOpenConsole={() => {
              setActiveTab("dashboard");
            }}
            onOpenCodeFlow={() => {
              setActiveTab("code");
            }}
          />
          <span className="hidden lg:inline text-slate-600">|</span>
          <div className="hidden lg:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>v2.2.0 — SYSTEM_STABLE</span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-emerald-400 font-semibold lowercase">contact: emmaun40m@gmail.com</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-slate-400">
          <span>V8 ENGINE: ONLINE</span>
          <span className="text-slate-600">|</span>
          <span>AUTONOMOUS AGENTS: 4/4</span>
        </div>
        <div>
          © 2026 DealHunter AI Properties
        </div>
      </footer>

      {/* Cross-Platform App Download & PWA Install Center Modal */}
      <AppDownloadCenterModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

      {/* Underwriting Modal */}
      {selectedDealForAnalysis && (
        <DealAnalysisModal
          deal={selectedDealForAnalysis}
          onClose={() => setSelectedDealForAnalysis(null)}
          onSaveAnalysis={handleSaveAnalysis}
          onAdvanceStage={handleAdvanceDealStage}
          onDraftOutreach={(propId) => {
            setSelectedDealForAnalysis(null);
            handleDraftOutreach(propId, "cash_buyer");
          }}
          onDraftContract={(dealId) => {
            setSelectedDealForAnalysis(null);
            const d = deals.find((x) => x.id === dealId);
            if (d) {
              handleDraftContract({
                dealId: d.id,
                type: "PURCHASE_AND_SALE",
                sellerName: d.property.listingAgent?.name || "Property Owner",
                buyerName: "DealHunter Capital LLC (and/or Assigns)",
              });
            }
          }}
          onMatchInvestors={(dealId) => {
            setSelectedDealForAnalysis(null);
            setSelectedInvestorDealId(dealId);
            setActiveTab("investors");
          }}
        />
      )}

      {/* Critical Rules Audit Modal */}
      <CriticalRulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* Config Settings Modal */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      {/* Voice Assistant & Audio Announcer Configuration Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        approvals={approvals}
        deals={deals}
        metrics={metrics}
        contracts={contracts}
        investors={investors}
        onNavigateTab={handleTabChange}
      />

      {/* Voice Command Cheat Sheet Overlay */}
      <CommandCheatSheetOverlay
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
        onExecuteCommand={(cmdId) => {
          if (cmdId === "focus_land") {
            setActiveTab("properties");
            setSelectedPropertyType("LAND");
          }
        }}
      />

      {/* Persistent Floating Display Controller HUD */}
      <FloatingDisplayController
        currentPreset={currentPreset}
        onSelectPreset={handleSelectPreset}
        onPopoutWidget={handlePopoutWidget}
        detachedWidgets={detachedWidgets}
        onRecallAll={handleRecallAll}
        onRecallWidget={handleRecallWidget}
      />
    </div>
  );
}
