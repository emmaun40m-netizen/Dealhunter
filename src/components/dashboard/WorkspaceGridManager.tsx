import { useState, useEffect, type DragEvent } from "react";
import {
  GripVertical,
  Maximize2,
  Minimize2,
  ExternalLink,
  RotateCcw,
  Sliders,
  ChevronDown,
  Layers,
  ArrowRightLeft,
  X,
  Plus,
  Monitor,
  LayoutGrid,
  CheckCircle2,
} from "lucide-react";
import {
  multiMonitorSync,
  WorkspaceLayoutConfig,
  WorkspaceSlot,
  GridPreset,
} from "../../services/multiMonitorSync";
import LiveGraphsWidget from "./LiveGraphsWidget";
import LiveFeedsWidget from "./LiveFeedsWidget";
import LiveCodeExecutionWidget from "./LiveCodeExecutionWidget";
import GlobalTrafficMapWidget from "./GlobalTrafficMapWidget";
import SLAComplianceMonitorWidget from "./SLAComplianceMonitorWidget";
import AgentMaintenanceRoutineWidget from "./AgentMaintenanceRoutineWidget";
import DailyBriefingWidget from "./DailyBriefingWidget";
import PropertyInspectionsWidget from "./PropertyInspectionsWidget";
import ROIHeatmapWidget from "./ROIHeatmapWidget";
import LiveConsoleWidget from "./LiveConsoleWidget";
import RadarWidget from "./RadarWidget";
import { Deal, ApprovalRequest, DashboardMetrics, Contract, Investor } from "../../types";

interface WorkspaceGridManagerProps {
  deals: Deal[];
  approvals?: ApprovalRequest[];
  metrics?: DashboardMetrics | null;
  contracts?: Contract[];
  investors?: Investor[];
  onSelectDeal: (deal: Deal) => void;
  onNavigateTab: (tab: string) => void;
  onPopoutWidget: (widgetId: string, title: string) => void;
  detachedWidgets: string[];
  onRecallWidget: (widgetId: string) => void;
  onRecallAll: () => void;
  currentPreset: GridPreset;
  onChangePreset: (preset: GridPreset) => void;
  onOpenVoiceSettings?: () => void;
  onOpenConfig?: () => void;
}

const ALL_WIDGETS = [
  { id: "radar", title: "Autonomous Inventory Radar (Live Streaming & Auto-Scoring)" },
  { id: "daily_briefing", title: "Daily Executive Rundown & Action Tasks (AI Voice)" },
  { id: "live_console", title: "Live Console & Developer Trace Terminal" },
  { id: "inspections", title: "Property Inspections & Contingency Calendar" },
  { id: "roi_heatmap", title: "Real Estate ROI Heatmap & Submarket Matrix" },
  { id: "global_traffic", title: "Global Traffic Map & Load-Balancing Agent" },
  { id: "sla_monitor", title: "SLA Compliance & Response Monitor (15s Target)" },
  { id: "maintenance_routine", title: "Automated Maintenance & 5-Day Overnight Engine" },
  { id: "graphs", title: "Financial Yield & ARV Matrix" },
  { id: "live_feeds", title: "Live Telemetry & Auction Stream" },
  { id: "live_code", title: "Deal Algorithm & V8 Script Engine" },
  { id: "deals_spotlight", title: "Autonomous Underwriting Spotlight" },
  { id: "deals_matrix", title: "Underwritten Deals Matrix" },
];

export default function WorkspaceGridManager({
  deals,
  approvals = [],
  metrics = null,
  contracts = [],
  investors = [],
  onSelectDeal,
  onNavigateTab,
  onPopoutWidget,
  detachedWidgets,
  onRecallWidget,
  onRecallAll,
  currentPreset,
  onChangePreset,
  onOpenVoiceSettings,
  onOpenConfig,
}: WorkspaceGridManagerProps) {
  const [layout, setLayout] = useState<WorkspaceLayoutConfig>(() => multiMonitorSync.loadLayout());
  const [draggedSlotIndex, setDraggedSlotIndex] = useState<number | null>(null);
  const [isOverEdgeZone, setIsOverEdgeZone] = useState(false);
  const [fullscreenWidgetId, setFullscreenWidgetId] = useState<string | null>(null);

  // Sync state with layout config changes
  useEffect(() => {
    const unsub = multiMonitorSync.subscribe((msg) => {
      if (msg.type === "LAYOUT_CHANGED" && msg.payload) {
        setLayout(msg.payload);
      }
    });
    return () => unsub();
  }, []);

  // Update slots when preset changes
  useEffect(() => {
    let targetSlotCount = 4;
    if (currentPreset === "3/4") targetSlotCount = 2;
    if (currentPreset === "1x1") targetSlotCount = 1;
    if (currentPreset === "1x2") targetSlotCount = 2;
    if (currentPreset === "1x3") targetSlotCount = 3;
    if (currentPreset === "2x2") targetSlotCount = 4;
    if (currentPreset === "2x3") targetSlotCount = 6;

    setLayout((prev) => {
      let currentSlots = [...prev.slots];
      if (currentPreset === "3/4" && currentSlots.length >= 2) {
        currentSlots[0] = { ...currentSlots[0], widgetId: "live_code" };
      }
      if (currentSlots.length < targetSlotCount) {
        // add extra slots
        const nextWidgets = ["live_code", "deals_spotlight", "graphs", "live_feeds", "deals_matrix"];
        while (currentSlots.length < targetSlotCount) {
          const idx = currentSlots.length;
          currentSlots.push({
            slotId: `slot-${idx}`,
            widgetId: nextWidgets[idx % nextWidgets.length],
          });
        }
      } else if (currentSlots.length > targetSlotCount) {
        currentSlots = currentSlots.slice(0, targetSlotCount);
      }

      const updated = {
        ...prev,
        preset: currentPreset,
        slots: currentSlots,
      };
      multiMonitorSync.saveLayout(updated);
      return updated;
    });
  }, [currentPreset]);

  // Handle Drag and Drop reordering
  const handleDragStart = (e: DragEvent, index: number) => {
    setDraggedSlotIndex(index);
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnSlot = (e: DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedSlotIndex === null || draggedSlotIndex === targetIndex) return;

    setLayout((prev) => {
      const newSlots = [...prev.slots];
      const temp = newSlots[draggedSlotIndex];
      newSlots[draggedSlotIndex] = newSlots[targetIndex];
      newSlots[targetIndex] = temp;

      const updated = { ...prev, slots: newSlots };
      multiMonitorSync.saveLayout(updated);
      return updated;
    });
    setDraggedSlotIndex(null);
    setIsOverEdgeZone(false);
  };

  // Drop on edge overflow zone -> detach into secondary window!
  const handleDropOnEdgeOverflow = (e: DragEvent) => {
    e.preventDefault();
    setIsOverEdgeZone(false);
    if (draggedSlotIndex !== null && layout.slots[draggedSlotIndex]) {
      const targetSlot = layout.slots[draggedSlotIndex];
      const widgetInfo = ALL_WIDGETS.find((w) => w.id === targetSlot.widgetId) || {
        id: targetSlot.widgetId,
        title: "Workspace Portal",
      };
      onPopoutWidget(widgetInfo.id, widgetInfo.title);
    }
    setDraggedSlotIndex(null);
  };

  const handleSwapWidget = (slotIndex: number, newWidgetId: string) => {
    setLayout((prev) => {
      const newSlots = [...prev.slots];
      newSlots[slotIndex] = {
        ...newSlots[slotIndex],
        widgetId: newWidgetId,
      };
      const updated = { ...prev, slots: newSlots };
      multiMonitorSync.saveLayout(updated);
      return updated;
    });
  };

  // Render individual widget component by ID
  const renderWidgetContent = (widgetId: string, slotIndex: number) => {
    const isDetached = detachedWidgets.includes(widgetId);
    const widgetMeta = ALL_WIDGETS.find((w) => w.id === widgetId);

    if (isDetached) {
      return (
        <div className="h-full min-h-[280px] flex flex-col items-center justify-center p-6 bg-[#0E1218] border border-amber-500/30 rounded text-center space-y-3 font-mono">
          <div className="p-3 bg-amber-950/80 border border-amber-500/40 rounded-full text-amber-400">
            <Monitor className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs uppercase">{widgetMeta?.title || widgetId}</h4>
            <p className="text-[10px] text-amber-400/80 mt-1">
              Active on Secondary Monitor Display Window
            </p>
          </div>
          <button
            onClick={() => onRecallWidget(widgetId)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-[10px] shadow transition flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Return to Workspace Grid</span>
          </button>
        </div>
      );
    }

    switch (widgetId) {
      case "radar":
        return (
          <RadarWidget
            onPopout={() => onPopoutWidget("radar", "Autonomous Inventory Radar (Live Streaming & Auto-Scoring)")}
            onSelectDeal={() => onNavigateTab("properties")}
          />
        );
      case "daily_briefing":
        return (
          <DailyBriefingWidget
            deals={deals}
            approvals={approvals}
            metrics={metrics}
            contracts={contracts}
            investors={investors}
            onNavigateTab={onNavigateTab}
            onPopout={() => onPopoutWidget("daily_briefing", "Daily Executive Rundown & Action Tasks (AI Voice)")}
            onOpenVoiceSettings={onOpenVoiceSettings}
          />
        );
      case "global_traffic":
        return (
          <GlobalTrafficMapWidget
            onPopout={() => onPopoutWidget("global_traffic", "Global Traffic Map & Load-Balancing Agent")}
          />
        );
      case "sla_monitor":
        return (
          <SLAComplianceMonitorWidget
            onPopout={() => onPopoutWidget("sla_monitor", "SLA Compliance & Response Monitor (15s Target)")}
          />
        );
      case "maintenance_routine":
        return (
          <AgentMaintenanceRoutineWidget
            onPopout={() => onPopoutWidget("maintenance_routine", "Automated Maintenance & 5-Day Overnight Engine")}
          />
        );
      case "graphs":
        return (
          <LiveGraphsWidget
            deals={deals}
            onSelectDeal={onSelectDeal}
            onPopout={() => onPopoutWidget("graphs", "Financial Yield & ARV Matrix")}
          />
        );
      case "inspections":
        return (
          <PropertyInspectionsWidget
            deals={deals}
            onSelectDeal={onSelectDeal}
            onPopout={() => onPopoutWidget("inspections", "Property Inspections & Contingency Calendar")}
          />
        );
      case "roi_heatmap":
        return (
          <ROIHeatmapWidget
            onSelectDeal={(dealId) => {
              const d = deals.find((deal) => deal.id === dealId);
              if (d) onSelectDeal(d);
            }}
            onPopout={() => onPopoutWidget("roi_heatmap", "Real Estate ROI Heatmap & Submarket Matrix")}
          />
        );
      case "live_console":
        return (
          <LiveConsoleWidget
            onOpenCodeEditor={() => onNavigateTab("code")}
            onOpenConfig={onOpenConfig}
          />
        );
      case "live_feeds":
        return (
          <LiveFeedsWidget
            onPopout={() => onPopoutWidget("live_feeds", "Live Telemetry & Auction Stream")}
          />
        );
      case "live_code":
        return (
          <LiveCodeExecutionWidget
            onPopout={() => onPopoutWidget("live_code", "Deal Algorithm & V8 Script Engine")}
          />
        );
      case "deals_spotlight":
      default:
        return (
          <div className="h-full flex flex-col bg-[#0E1218] border border-slate-800 rounded p-4 font-mono text-xs justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-xs">AUTONOMOUS UNDERWRITING SPOTLIGHT</span>
              <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded text-[10px]">
                TOP DEAL
              </span>
            </div>
            {deals.length > 0 ? (
              <div className="space-y-2 py-2">
                <div className="font-bold text-slate-100">{deals[0].property.address}</div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-slate-500">Purchase Price:</span>
                    <div className="text-emerald-400 font-bold text-xs">
                      ${deals[0].financials?.purchasePrice.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-slate-500">Net Spread:</span>
                    <div className="text-emerald-400 font-bold text-xs">
                      ${deals[0].metrics?.projectedProfit.toLocaleString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onSelectDeal(deals[0])}
                  className="w-full py-2 bg-emerald-400 hover:bg-emerald-300 text-black font-bold rounded text-[11px] transition mt-2"
                >
                  INSPECT FULL UNDERWRITING & COMPS
                </button>
              </div>
            ) : (
              <p className="text-slate-500 py-6 text-center">No deals in pipeline</p>
            )}
            <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between">
              <span>Agent 2 MLS Verified</span>
              <span>Score: 94/100</span>
            </div>
          </div>
        );
    }
  };

  // Determine grid template classes
  const getGridClasses = () => {
    switch (currentPreset) {
      case "3/4":
        return "grid-cols-1 lg:grid-cols-12";
      case "1x1":
        return "grid-cols-1";
      case "1x2":
        return "grid-cols-1 lg:grid-cols-2";
      case "1x3":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case "2x2":
        return "grid-cols-1 lg:grid-cols-2";
      case "2x3":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      default:
        return "grid-cols-1 lg:grid-cols-2";
    }
  };

  return (
    <div className="space-y-3 font-mono">
      {/* Workspace Bar: Preset Switcher, Layout Info, and Drag Help */}
      <div className="bg-[#111620] border border-slate-800 rounded p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-900 border border-slate-700 rounded text-slate-300">
            <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide text-xs">
                PERSISTENT MULTI-MONITOR WORKSPACE
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded">
                AUTOSAVED
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Drag tiles by handle to reorder, or drag to the Edge Overflow Zone to detach to a secondary monitor
            </span>
          </div>
        </div>

        {/* Preset Selector Buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 mr-1 hidden sm:inline">GRID PRESET:</span>
          {(["3/4", "1x1", "1x2", "1x3", "2x2", "2x3"] as GridPreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => onChangePreset(preset)}
              className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                currentPreset === preset
                  ? "bg-emerald-950 text-emerald-300 border-emerald-500"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Canvas + Edge Overflow Drop Zone Container */}
      <div className="relative flex flex-col lg:flex-row gap-3">
        {/* Dynamic Grid of Tile Slots */}
        <div className={`flex-1 grid ${getGridClasses()} gap-3`}>
          {layout.slots.map((slot, idx) => {
            const widgetMeta = ALL_WIDGETS.find((w) => w.id === slot.widgetId) || {
              id: slot.widgetId,
              title: "Workspace Portal",
            };
            const isDetached = detachedWidgets.includes(slot.widgetId);
            const isThreeQuarterLayout = currentPreset === "3/4";
            const colSpanClass = isThreeQuarterLayout
              ? idx === 0
                ? "lg:col-span-9"
                : "lg:col-span-3"
              : "";

            return (
              <div
                key={slot.slotId || idx}
                draggable={!isDetached}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnSlot(e, idx)}
                className={`relative flex flex-col bg-[#0B0E14] border rounded-sm transition-all shadow-md group ${colSpanClass} ${
                  draggedSlotIndex === idx
                    ? "opacity-50 border-dashed border-emerald-500"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Tile Header Bar with Drag Handle & Portal Select Dropdown */}
                <div className="px-2.5 py-1.5 bg-[#111620] border-b border-slate-800/80 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300"
                      title="Drag to swap or drag to edge to pop out"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>

                    {/* Widget Slot Switcher */}
                    <select
                      value={slot.widgetId}
                      onChange={(e) => handleSwapWidget(idx, e.target.value)}
                      className="bg-slate-900 border border-slate-700/80 rounded px-1.5 py-0.5 text-slate-200 text-[10px] focus:outline-none"
                    >
                      {ALL_WIDGETS.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tile controls */}
                  <div className="flex items-center gap-1">
                    {!isDetached && (
                      <button
                        onClick={() => onPopoutWidget(slot.widgetId, widgetMeta.title)}
                        title="Detach to external display window"
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tile Component Content */}
                <div className="flex-1 min-h-[300px]">{renderWidgetContent(slot.widgetId, idx)}</div>
              </div>
            );
          })}
        </div>

        {/* Edge Overflow Drop Zone (Visible / Responsive on drag or toggle) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsOverEdgeZone(true);
          }}
          onDragLeave={() => setIsOverEdgeZone(false)}
          onDrop={handleDropOnEdgeOverflow}
          className={`lg:w-28 border-2 border-dashed rounded flex flex-col items-center justify-center p-3 text-center transition-all ${
            isOverEdgeZone
              ? "bg-emerald-950/70 border-emerald-400 text-emerald-300 scale-105"
              : "bg-slate-950/60 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400"
          }`}
        >
          <div className="space-y-2 pointer-events-none">
            <div className="p-2 bg-slate-900 rounded-full inline-block border border-slate-800">
              <ExternalLink className="w-5 h-5 mx-auto text-emerald-400" />
            </div>
            <div className="text-[10px] font-bold uppercase leading-tight">
              EDGE OVERFLOW POP-OUT
            </div>
            <div className="text-[9px] text-slate-500 leading-snug">
              Drop tile here to detach to secondary screen
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
