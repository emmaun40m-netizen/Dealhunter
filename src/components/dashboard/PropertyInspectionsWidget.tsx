import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  User,
  Phone,
  Maximize2,
  CheckCircle2,
  XCircle,
  Calculator,
  Trees,
  Sparkles,
} from "lucide-react";
import { PropertyInspection, Deal } from "../../types";
import { store } from "../../services/store";

// Regional material & labor cost index table for inspection estimation
const REGIONAL_MATERIAL_COST_INDEX: Record<string, { multiplier: number; label: string; landClearingPerAcre: number; sfhCostPerSqFt: number }> = {
  MI: { multiplier: 1.02, label: "Great Lakes", landClearingPerAcre: 3100, sfhCostPerSqFt: 28 },
  TN: { multiplier: 0.94, label: "Southeast", landClearingPerAcre: 2600, sfhCostPerSqFt: 24 },
  OH: { multiplier: 0.98, label: "Midwest Rustbelt", landClearingPerAcre: 2800, sfhCostPerSqFt: 26 },
  FL: { multiplier: 1.12, label: "Florida Coastal", landClearingPerAcre: 3600, sfhCostPerSqFt: 34 },
  TX: { multiplier: 0.96, label: "Texas Sunbelt", landClearingPerAcre: 2700, sfhCostPerSqFt: 25 },
  AZ: { multiplier: 1.05, label: "Southwest Desert", landClearingPerAcre: 3200, sfhCostPerSqFt: 30 },
  NY: { multiplier: 1.28, label: "Northeast Metro", landClearingPerAcre: 4500, sfhCostPerSqFt: 42 },
  MD: { multiplier: 1.15, label: "Mid-Atlantic Corridor", landClearingPerAcre: 3700, sfhCostPerSqFt: 33 },
  AL: { multiplier: 0.90, label: "Deep South", landClearingPerAcre: 2400, sfhCostPerSqFt: 22 },
  MO: { multiplier: 0.95, label: "Central Midwest", landClearingPerAcre: 2650, sfhCostPerSqFt: 25 },
  IN: { multiplier: 0.97, label: "Midwest Sub-Market", landClearingPerAcre: 2750, sfhCostPerSqFt: 25 },
  OK: { multiplier: 0.92, label: "Southern Plains", landClearingPerAcre: 2500, sfhCostPerSqFt: 23 },
  IL: { multiplier: 1.10, label: "Illinois / Chicagoland", landClearingPerAcre: 3500, sfhCostPerSqFt: 32 },
};

interface PropertyInspectionsWidgetProps {
  deals?: Deal[];
  onPopout?: () => void;
  onSelectDeal?: (deal: Deal) => void;
}

export default function PropertyInspectionsWidget({
  deals = [],
  onPopout,
  onSelectDeal,
}: PropertyInspectionsWidgetProps) {
  const [inspections, setInspections] = useState<PropertyInspection[]>(() => store.getInspections());
  const [filterType, setFilterType] = useState<string>("ALL");
  const [selectedMonth, setSelectedMonth] = useState<string>("August 2026");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<PropertyInspection | null>(null);

  // Form for scheduling a new inspection
  const [form, setForm] = useState({
    dealId: deals[0]?.id || "deal-1",
    propertyAddress: deals[0]?.property.address || "742 Oak Street, Detroit, MI",
    city: deals[0]?.property.city || "Detroit",
    state: deals[0]?.property.state || "MI",
    inspectionType: "PHYSICAL_STRUCTURAL" as PropertyInspection["inspectionType"],
    scheduledDate: "2026-08-30",
    deadlineDate: "2026-09-06",
    inspectorName: "Metro Property Inspections LLC",
    inspectorPhone: "(555) 234-5678",
    cost: 400,
    estimatedRepairNeed: 18500,
    findingsSummary: "Standard buyer contingency physical walkthrough & foundation inspection.",
  });

  const selectedDeal = deals.find((d) => d.id === form.dealId) || deals[0];
  const region = REGIONAL_MATERIAL_COST_INDEX[form.state] || { multiplier: 1.0, label: "National", landClearingPerAcre: 3000, sfhCostPerSqFt: 28 };
  
  const handleAutoEstimateRepairs = () => {
    if (selectedDeal) {
      const isLand = selectedDeal.property.propertyType === "land" || !!selectedDeal.property.lotSizeAcres;
      const acres = selectedDeal.property.lotSizeAcres || (selectedDeal.property.sqft ? selectedDeal.property.sqft / 43560 : 1.5);
      const repairEst = isLand
        ? Math.round(acres * region.landClearingPerAcre * region.multiplier)
        : Math.round((selectedDeal.property.sqft || 1800) * region.sfhCostPerSqFt * region.multiplier);
      
      setForm((prev) => ({
        ...prev,
        estimatedRepairNeed: repairEst,
        findingsSummary: `${prev.findingsSummary} | Regional automated repair estimate based on ${isLand ? `${acres.toFixed(2)} acres` : `${selectedDeal.property.sqft} sqft`} in ${form.state} (${region.label}): $${repairEst.toLocaleString()}.`,
      }));
    }
  };

  const handleRefresh = () => {
    setInspections([...store.getInspections()]);
  };

  const handleUpdateStatus = (id: string, status: PropertyInspection["status"]) => {
    store.updateInspectionStatus(id, status);
    handleRefresh();
  };

  const handleCreateInspection = (e: React.FormEvent) => {
    e.preventDefault();
    store.addInspection({
      dealId: form.dealId,
      propertyId: "prop-custom",
      propertyAddress: form.propertyAddress,
      city: form.city,
      state: form.state,
      inspectionType: form.inspectionType,
      scheduledDate: form.scheduledDate,
      deadlineDate: form.deadlineDate,
      inspectorName: form.inspectorName,
      inspectorPhone: form.inspectorPhone,
      status: "SCHEDULED",
      contingencyDaysLeft: 7,
      cost: form.cost,
      findingsSummary: form.findingsSummary,
      criticalIssuesCount: 0,
    });
    setShowAddModal(false);
    handleRefresh();
  };

  const filteredInspections = inspections.filter((insp) => {
    if (filterType === "ALL") return true;
    if (filterType === "SCHEDULED") return insp.status === "SCHEDULED" || insp.status === "IN_PROGRESS";
    if (filterType === "PASSED") return insp.status === "PASSED" || insp.status === "COMPLETED";
    return insp.inspectionType === filterType;
  });

  const getStatusBadge = (status: PropertyInspection["status"]) => {
    switch (status) {
      case "PASSED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">PASSED</span>;
      case "SCHEDULED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-500/30">SCHEDULED</span>;
      case "IN_PROGRESS":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/30 animate-pulse">IN PROGRESS</span>;
      case "ISSUES_FOUND":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-500/30">ISSUES FOUND</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  const getTypeLabel = (type: PropertyInspection["inspectionType"]) => {
    switch (type) {
      case "PHYSICAL_STRUCTURAL": return "Physical & Structural";
      case "PEST_TERMITE": return "Pest & Termite (WDO)";
      case "SEWER_LATERAL": return "Sewer Lateral CCTV";
      case "SOIL_PERC": return "Soil & Perc Test";
      case "ENVIRONMENTAL_PHASE1": return "ESA Phase 1 Environmental";
      case "TITLE_SURVEY": return "Boundary & Title Survey";
      default: return type;
    }
  };

  // Calendar dates representation for August 2026
  const calendarDays = [
    { day: 24, hasInsp: true, type: "ESA Phase 1", status: "PASSED" },
    { day: 25, hasInsp: true, type: "Termite", status: "IN_PROGRESS" },
    { day: 26, hasInsp: true, type: "Sewer Scope", status: "SCHEDULED" },
    { day: 27, hasInsp: true, type: "Structural", status: "SCHEDULED" },
    { day: 28, hasInsp: true, type: "Soil / Perc", status: "SCHEDULED" },
    { day: 29, hasInsp: true, type: "Title Survey", status: "SCHEDULED" },
    { day: 30, hasInsp: false },
    { day: 31, hasInsp: false },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0E1218] border border-slate-800 rounded p-4 font-mono text-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white text-xs tracking-wider">PROPERTY INSPECTIONS CALENDAR</span>
          <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded text-[10px]">
            {inspections.filter((i) => i.status === "SCHEDULED" || i.status === "IN_PROGRESS").length} ACTIVE
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px] flex items-center space-x-1 transition"
          >
            <Plus className="w-3 h-3" />
            <span>Schedule</span>
          </button>
          {onPopout && (
            <button onClick={onPopout} className="text-slate-400 hover:text-white transition p-1" title="Popout Widget">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mini Calendar Strip */}
      <div className="bg-[#161B22] border border-slate-800 rounded p-2 mb-3">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 px-1 font-mono">
          <span className="font-bold text-white">{selectedMonth}</span>
          <span className="text-[9px] text-emerald-400">SYNCED WITH DEALS STATE</span>
        </div>
        <div className="grid grid-cols-8 gap-1 text-center">
          {calendarDays.map((d, i) => (
            <div
              key={i}
              className={`p-1.5 rounded text-[10px] border flex flex-col items-center justify-center ${
                d.hasInsp
                  ? d.status === "PASSED"
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : d.status === "IN_PROGRESS"
                    ? "bg-amber-950/40 border-amber-500/40 text-amber-300"
                    : "bg-blue-950/40 border-blue-500/40 text-blue-300 font-bold"
                  : "bg-slate-900/60 border-slate-800 text-slate-500"
              }`}
            >
              <span className="text-[11px] font-bold">{d.day}</span>
              {d.hasInsp && (
                <span className="text-[8px] truncate max-w-full block font-sans font-semibold">
                  {d.type}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 mb-2 overflow-x-auto pb-1 text-[10px]">
        {["ALL", "SCHEDULED", "PASSED", "PHYSICAL_STRUCTURAL", "SOIL_PERC"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-2 py-0.5 rounded whitespace-nowrap transition font-mono ${
              filterType === tab
                ? "bg-slate-700 text-white font-bold border border-slate-600"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {tab === "ALL" ? "All Inspections" : tab === "PHYSICAL_STRUCTURAL" ? "Physical" : tab === "SOIL_PERC" ? "Soil/Perc" : tab}
          </button>
        ))}
      </div>

      {/* Inspections List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredInspections.map((insp) => (
          <div
            key={insp.id}
            onClick={() => setSelectedInspection(insp)}
            className="p-2.5 bg-[#161B22] border border-slate-800 hover:border-slate-700 rounded transition cursor-pointer space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-white font-sans text-xs">{insp.propertyAddress}</span>
                <span className="text-slate-500 text-[10px]">({insp.city}, {insp.state})</span>
              </div>
              {getStatusBadge(insp.status)}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="text-emerald-400 font-semibold">{getTypeLabel(insp.inspectionType)}</span>
              <div className="flex items-center space-x-1 text-slate-300">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Date: <strong className="text-white">{insp.scheduledDate}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] border-t border-slate-800/80 pt-1.5">
              <div className="text-slate-400 flex items-center space-x-1 truncate max-w-[200px]">
                <User className="w-3 h-3 text-slate-500" />
                <span className="truncate">{insp.inspectorName || "Inspector Assigned"}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-500/20 text-[9px]">
                  {insp.contingencyDaysLeft}d Contingency Window
                </span>
                {insp.status === "SCHEDULED" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(insp.id, "PASSED");
                    }}
                    className="px-2 py-0.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/30 rounded text-[9px] font-bold"
                  >
                    Pass
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0E1218] border border-slate-800 rounded p-5 max-w-md w-full space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm">Schedule Property Inspection</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateInspection} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Deal / Property Address</label>
                <input
                  type="text"
                  value={form.propertyAddress}
                  onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Inspection Type</label>
                  <select
                    value={form.inspectionType}
                    onChange={(e) => setForm({ ...form, inspectionType: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  >
                    <option value="PHYSICAL_STRUCTURAL">Physical & Structural</option>
                    <option value="PEST_TERMITE">Pest & Termite (WDO)</option>
                    <option value="SEWER_LATERAL">Sewer Lateral CCTV</option>
                    <option value="SOIL_PERC">Soil & Perc Test</option>
                    <option value="ENVIRONMENTAL_PHASE1">ESA Phase 1</option>
                    <option value="TITLE_SURVEY">Boundary & Survey</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Inspection Date</label>
                  <input
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Inspector / Company</label>
                  <input
                    type="text"
                    value={form.inspectorName}
                    onChange={(e) => setForm({ ...form, inspectorName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase block mb-1">Inspection Fee ($)</label>
                  <input
                    type="number"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              {/* Regional Repair Estimator Trigger */}
              <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                    <Calculator className="w-3 h-3 text-amber-400" />
                    Regional Repair Estimation:
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoEstimateRepairs}
                    className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[9px] font-bold flex items-center gap-1 transition"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Auto-Calculate ({region.label})</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Estimated Scope / Need:</span>
                  <strong className="text-amber-300 font-mono">${form.estimatedRepairNeed.toLocaleString()}</strong>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase block mb-1">Scope & Contingency Instructions</label>
                <textarea
                  value={form.findingsSummary}
                  onChange={(e) => setForm({ ...form, findingsSummary: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs"
                >
                  Save & Sync to Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Inspection Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0E1218] border border-slate-800 rounded p-5 max-w-md w-full space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="font-bold text-white text-sm">{selectedInspection.propertyAddress}</h3>
                <span className="text-[10px] text-emerald-400">{getTypeLabel(selectedInspection.inspectionType)}</span>
              </div>
              <button onClick={() => setSelectedInspection(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 py-1">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px]">Scheduled Date:</span>
                  <div className="text-white font-bold">{selectedInspection.scheduledDate}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px]">Contingency Deadline:</span>
                  <div className="text-amber-300 font-bold">{selectedInspection.deadlineDate} ({selectedInspection.contingencyDaysLeft}d left)</div>
                </div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px]">Inspector Information:</span>
                <div className="text-white font-semibold">{selectedInspection.inspectorName}</div>
                <div className="text-slate-400 text-[10px] flex items-center space-x-2">
                  <span>{selectedInspection.inspectorCompany}</span>
                  {selectedInspection.inspectorPhone && <span>• {selectedInspection.inspectorPhone}</span>}
                </div>
              </div>

              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px]">Findings & Scope Summary:</span>
                <p className="text-slate-300 text-[11px] font-sans">{selectedInspection.findingsSummary || "No critical findings recorded."}</p>
              </div>

              {selectedInspection.reportUrl && (
                <a
                  href={selectedInspection.reportUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center space-x-1.5 w-full py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 font-bold rounded text-[11px] transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Full Inspection Report PDF</span>
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <div className="flex space-x-1.5">
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedInspection.id, "PASSED");
                    setSelectedInspection(null);
                  }}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[10px]"
                >
                  Mark Passed
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedInspection.id, "ISSUES_FOUND");
                    setSelectedInspection(null);
                  }}
                  className="px-2.5 py-1 bg-rose-900/80 hover:bg-rose-800 text-rose-300 border border-rose-500/30 rounded text-[10px]"
                >
                  Flag Issues
                </button>
              </div>

              <button
                onClick={() => setSelectedInspection(null)}
                className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-[10px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
