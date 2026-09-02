import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  MapPin,
  Brain,
  Mail,
  Scale,
  ShieldCheck,
  Zap,
  Flame,
  Filter,
  Trees,
  Home,
  Building2,
  Layers,
  EyeOff,
  Eye,
  TrendingUp,
  Users,
  Calculator,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  LayoutGrid,
  Map as MapIcon,
  Columns,
} from "lucide-react";
import { Property, Deal, SearchProfile } from "../types";
import { getStateWholesaleInfo } from "../services/complianceData";
import PropertyGoogleMapView from "./PropertyGoogleMapView";

interface NationalPropertyFinderProps {
  properties: Property[];
  deals: Deal[];
  searchProfiles: SearchProfile[];
  configMinROI?: number;
  selectedTypeControlled?: string;
  onTypeChange?: (type: string) => void;
  onSelectProperty: (property: Property) => void;
  onAnalyzeProperty: (propertyId: string) => void;
  onDraftOutreach: (propertyId: string) => void;
  onMatchInvestors: (dealId: string) => void;
  onCloserUnderwrite?: (dealId: string) => void;
}

// Regional material & labor cost multipliers relative to national baseline
const REGIONAL_MATERIAL_COST_INDEX: Record<string, { multiplier: number; label: string; landClearingPerAcre: number; sfhCostPerSqFt: number }> = {
  MI: { multiplier: 1.02, label: "Great Lakes Regional (Moderate)", landClearingPerAcre: 3100, sfhCostPerSqFt: 28 },
  TN: { multiplier: 0.94, label: "Southeast Regional (Low-Moderate)", landClearingPerAcre: 2600, sfhCostPerSqFt: 24 },
  OH: { multiplier: 0.98, label: "Midwest Rustbelt (Economical)", landClearingPerAcre: 2800, sfhCostPerSqFt: 26 },
  FL: { multiplier: 1.12, label: "Florida Coastal/Windstorm", landClearingPerAcre: 3600, sfhCostPerSqFt: 34 },
  TX: { multiplier: 0.96, label: "Texas Sunbelt (High Volume)", landClearingPerAcre: 2700, sfhCostPerSqFt: 25 },
  AZ: { multiplier: 1.05, label: "Southwest Desert Grading", landClearingPerAcre: 3200, sfhCostPerSqFt: 30 },
  NY: { multiplier: 1.28, label: "Northeast Metro (High Union/Material)", landClearingPerAcre: 4500, sfhCostPerSqFt: 42 },
  MD: { multiplier: 1.15, label: "Mid-Atlantic Corridor", landClearingPerAcre: 3700, sfhCostPerSqFt: 33 },
  AL: { multiplier: 0.90, label: "Deep South (Low Cost)", landClearingPerAcre: 2400, sfhCostPerSqFt: 22 },
  MO: { multiplier: 0.95, label: "Central Midwest (Balanced)", landClearingPerAcre: 2650, sfhCostPerSqFt: 25 },
  IN: { multiplier: 0.97, label: "Midwest Sub-Market", landClearingPerAcre: 2750, sfhCostPerSqFt: 25 },
  OK: { multiplier: 0.92, label: "Southern Plains", landClearingPerAcre: 2500, sfhCostPerSqFt: 23 },
  IL: { multiplier: 1.10, label: "Illinois / Chicagoland", landClearingPerAcre: 3500, sfhCostPerSqFt: 32 },
};

// Mini Sparkline Generator component for ROI trend
function ROISparkline({ baseROI, propertyId, zip }: { baseROI: number; propertyId: string; zip: string }) {
  const points = useMemo(() => {
    // Deterministic pseudo-random seed based on property id
    let hash = 0;
    for (let i = 0; i < (propertyId + zip).length; i++) {
      hash = (hash << 5) - hash + (propertyId + zip).charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash) % 100;
    const delta1 = (seed % 5) - 3;
    const delta2 = ((seed * 3) % 6) - 2;
    const delta3 = ((seed * 7) % 5) - 1;
    const delta4 = ((seed * 11) % 4) + 1;

    const p0 = Math.max(12, baseROI - 6 + delta1);
    const p1 = Math.max(14, baseROI - 4 + delta2);
    const p2 = Math.max(15, baseROI - 3 + delta3);
    const p3 = Math.max(16, baseROI - 1 + delta4);
    const p4 = Math.max(18, baseROI + (delta1 > 0 ? 1 : 0));
    const p5 = baseROI;
    return [p0, p1, p2, p3, p4, p5];
  }, [baseROI, propertyId, zip]);

  const min = Math.min(...points) - 2;
  const max = Math.max(...points) + 2;
  const range = max - min || 1;
  const width = 84;
  const height = 26;

  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * (width - 6) + 3;
    const y = height - 4 - ((val - min) / range) * (height - 8);
    return { x, y, val };
  });

  const pathD = coords.reduce((acc, curr, i) => {
    return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, "");

  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;
  const yoyDelta = (points[5] - points[0]).toFixed(1);
  const isPositive = Number(yoyDelta) >= 0;

  return (
    <div className="flex items-center gap-2 bg-[#090C11] px-2 py-1 rounded border border-slate-800/80 font-mono text-[10px]" title={`Historical 6-Month ROI trend for Zip ${zip}: ${points.map(p => `${Math.round(p)}%`).join(" → ")}`}>
      <div className="relative">
        <svg width={width} height={height} className="overflow-visible">
          <defs>
            <linearGradient id={`grad-${propertyId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#grad-${propertyId})`} />
          <path d={pathD} fill="none" stroke="#10B981" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="2.5" fill="#34D399" className="animate-pulse" />
        </svg>
      </div>
      <div className="flex flex-col text-right">
        <span className={`font-bold flex items-center justify-end gap-0.5 ${isPositive ? "text-emerald-400" : "text-amber-400"}`}>
          <TrendingUp className="w-2.5 h-2.5 inline" />
          {isPositive ? `+${yoyDelta}%` : `${yoyDelta}%`}
        </span>
        <span className="text-[8px] text-slate-500 uppercase tracking-tighter">6M Trend</span>
      </div>
    </div>
  );
}

export default function NationalPropertyFinder({
  properties,
  deals,
  searchProfiles,
  configMinROI = 25,
  selectedTypeControlled,
  onTypeChange,
  onSelectProperty,
  onAnalyzeProperty,
  onDraftOutreach,
  onMatchInvestors,
  onCloserUnderwrite,
}: NationalPropertyFinderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>(selectedTypeControlled || "ALL");
  const [selectedLicenseFilter, setSelectedLicenseFilter] = useState<string>("ALL");
  const [onlyHighROI, setOnlyHighROI] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(500000);
  const [minProfit, setMinProfit] = useState<number>(20000);
  const [minROI, setMinROI] = useState<number>(configMinROI);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [viewLayout, setViewLayout] = useState<"CARDS" | "MAP" | "SPLIT">("SPLIT");
  const [selectedMapProperty, setSelectedMapProperty] = useState<Property | null>(null);

  // Dismiss / Hide session state
  const [dismissedPropertyIds, setDismissedPropertyIds] = useState<string[]>(() => {
    try {
      const saved = sessionStorage.getItem("dealhunter_dismissed_props");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync dismissed list to sessionStorage
  const handleDismissProperty = (propertyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedPropertyIds((prev) => {
      const updated = [...prev, propertyId];
      try {
        sessionStorage.setItem("dealhunter_dismissed_props", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleRestoreDismissed = () => {
    setDismissedPropertyIds([]);
    try {
      sessionStorage.removeItem("dealhunter_dismissed_props");
    } catch {}
  };

  // Sync if controlled type changes (e.g. from Voice Command "Focus on land")
  useEffect(() => {
    if (selectedTypeControlled) {
      setSelectedType(selectedTypeControlled);
    }
  }, [selectedTypeControlled]);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    if (onTypeChange) onTypeChange(type);
  };

  const availableStates = ["ALL", "MI", "TN", "OH", "MD", "AL", "MO", "IN", "NY", "OK", "IL", "TX", "FL", "AZ"];
  const propertyTypes = ["ALL", "land", "single_family", "multifamily", "townhouse", "condo"];

  const handleApplyProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    const prof = searchProfiles.find((p) => p.id === profileId);
    if (prof) {
      setMaxPrice(prof.maxPrice);
      setMinProfit(prof.minProfit);
      setMinROI(prof.minROI);
      if (prof.propertyTypes && prof.propertyTypes.length === 1) {
        handleTypeSelect(prof.propertyTypes[0]);
      } else {
        handleTypeSelect("ALL");
      }
      if (prof.states && prof.states.length > 0) {
        setSelectedState(prof.states[0]);
      } else {
        setSelectedState("ALL");
      }
    }
  };

  // Helper to render type visual indicator and badge
  const renderPropertyTypeBadge = (prop: Property) => {
    const type = prop.propertyType?.toLowerCase() || "";
    if (type.includes("land") || prop.lotSizeAcres) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold font-mono uppercase tracking-wide">
          <Trees className="w-3 h-3 text-emerald-400" />
          <span>Vacant Land</span>
        </span>
      );
    }
    if (type.includes("multi") || type.includes("quad") || type.includes("duplex")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/90 text-purple-300 border border-purple-500/50 text-[10px] font-bold font-mono uppercase tracking-wide">
          <Building2 className="w-3 h-3 text-purple-400" />
          <span>Multi-Unit</span>
        </span>
      );
    }
    if (type.includes("town") || type.includes("condo")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[10px] font-bold font-mono uppercase tracking-wide">
          <Layers className="w-3 h-3 text-slate-400" />
          <span>Townhouse</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold font-mono uppercase tracking-wide">
        <Home className="w-3 h-3 text-cyan-400" />
        <span>Single Family</span>
      </span>
    );
  };

  // Helper to calculate automated repair estimate
  const getEstimatedRepairsFromProfile = (prop: Property) => {
    const region = REGIONAL_MATERIAL_COST_INDEX[prop.state] || { multiplier: 1.0, landClearingPerAcre: 3000, sfhCostPerSqFt: 28 };
    if (prop.propertyType === "land" || prop.lotSizeAcres) {
      const acres = prop.lotSizeAcres || (prop.sqft ? prop.sqft / 43560 : 1.5);
      return Math.round(acres * region.landClearingPerAcre * region.multiplier);
    }
    const sqft = prop.sqft || 1800;
    return Math.round(sqft * region.sfhCostPerSqFt * region.multiplier);
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // Exclude dismissed listings for current session
      if (dismissedPropertyIds.includes(prop.id)) {
        return false;
      }

      // Query filter
      if (
        searchQuery &&
        !prop.address.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !prop.city.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !prop.state.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // State filter
      if (selectedState !== "ALL" && prop.state !== selectedState) {
        return false;
      }

      // State Licensing Policy filter
      const stateRule = getStateWholesaleInfo(prop.state);
      if (selectedLicenseFilter !== "ALL" && stateRule.licenseStatus !== selectedLicenseFilter) {
        return false;
      }

      // Type filter
      if (selectedType !== "ALL" && prop.propertyType !== selectedType) {
        return false;
      }

      // Price filter
      if (prop.askingPrice > maxPrice) {
        return false;
      }

      // Deal profit/roi filter
      const deal = deals.find((d) => d.propertyId === prop.id);
      if (deal) {
        if (deal.metrics.projectedProfit < minProfit) return false;
        if (deal.metrics.roi < minROI) return false;
        if (onlyHighROI && deal.metrics.roi < configMinROI) return false;
      } else if (onlyHighROI) {
        return false;
      }

      return true;
    });
  }, [properties, deals, dismissedPropertyIds, searchQuery, selectedState, selectedLicenseFilter, selectedType, maxPrice, minProfit, minROI, onlyHighROI, configMinROI]);

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls - Geometric Balance Layout */}
      <div className="bg-[#0E1218] border border-slate-800 rounded p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                MLS & WHOLESALER AGGREGATOR
              </span>
              <span className="text-xs text-slate-500 font-mono">USA 50-STATE COMPLIANT FEED</span>
            </div>
            <h2 className="text-2xl font-light text-white tracking-tight mt-1 font-sans">
              National Deep-Discount Property Scanner
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live automated scanning across all 50 states with explicit wholesale licensing mandates and closing strategy guidance.
            </p>
          </div>

          {/* Preset Profiles Dropdown */}
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-slate-500 text-[11px] uppercase">Search Profile:</span>
            <select
              value={selectedProfileId}
              onChange={(e) => handleApplyProfile(e.target.value)}
              className="bg-[#161B22] border border-slate-800 text-slate-200 text-xs rounded px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="">Custom Filter Criteria</option>
              {searchProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Max ${p.maxPrice / 1000}k)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search, Type & Licensing Policy Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, address, zip code, state (e.g. Detroit, Memphis, MI, OK)..."
              className="w-full bg-[#0B0E14] border border-slate-800 rounded pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-500 uppercase font-mono shrink-0">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-[#0B0E14] border border-slate-800 text-white text-xs rounded px-3 py-2 focus:outline-none focus:border-emerald-500 font-mono"
            >
              {propertyTypes.map((t) => (
                <option key={t} value={t}>
                  {t === "ALL" ? "ALL TYPES" : t.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Wholesale License Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-500 uppercase font-mono shrink-0">License:</span>
            <select
              value={selectedLicenseFilter}
              onChange={(e) => setSelectedLicenseFilter(e.target.value)}
              className="w-full bg-[#0B0E14] border border-slate-800 text-white text-xs rounded px-2.5 py-2 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="ALL">ALL JURISDICTIONS</option>
              <option value="DIRECT_ASSIGNMENT_ALLOWED">Direct Assignment (No License)</option>
              <option value="DISCLOSURE_REQUIRED">Disclosure Required (TX, FL)</option>
              <option value="LICENSE_REQUIRED">License Required (OK, IL)</option>
            </select>
          </div>
        </div>

        {/* State Badges & Quick Property Type Chips */}
        <div className="space-y-2 text-xs font-mono">
          {/* Property Type Quick Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 mr-1 flex items-center text-[10px] uppercase font-bold">
              <Filter className="w-3 h-3 mr-1 text-emerald-400" />
              Type Filter:
            </span>
            {propertyTypes.map((t) => {
              const isSelected = selectedType === t;
              const isLand = t === "land";
              return (
                <button
                  key={t}
                  onClick={() => handleTypeSelect(t)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition flex items-center gap-1 ${
                    isSelected
                      ? isLand
                        ? "bg-emerald-500 text-black font-bold ring-2 ring-emerald-400"
                        : "bg-emerald-600 text-white font-bold"
                      : isLand
                      ? "bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40"
                      : "bg-[#161B22] hover:bg-slate-800 text-slate-400 border border-slate-800"
                  }`}
                >
                  {isLand && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
                  <span>{t === "ALL" ? "ALL TYPES" : t === "land" ? "LAND & PARCELS (VOICE TARGET)" : t.replace("_", " ").toUpperCase()}</span>
                </button>
              );
            })}

            {/* Quick High ROI Toggle Button */}
            <button
              onClick={() => setOnlyHighROI(!onlyHighROI)}
              className={`ml-auto px-2.5 py-1 rounded text-xs font-mono transition flex items-center gap-1.5 ${
                onlyHighROI
                  ? "bg-amber-500 text-black font-bold ring-2 ring-amber-400 animate-pulse"
                  : "bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>≥ {configMinROI}% MIN ROI ONLY</span>
            </button>
          </div>

          {/* State Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 mr-1 flex items-center text-[10px] uppercase font-bold">
              <MapPin className="w-3 h-3 mr-1 text-emerald-400" />
              State:
            </span>
            {availableStates.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                  selectedState === st
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-[#161B22] hover:bg-slate-800 text-slate-400 border border-slate-800"
                }`}
              >
                {st === "ALL" ? "ALL STATES" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders for Max Price, Min Profit, Min ROI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs font-mono">
          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
              <span className="text-slate-500 uppercase">Max Asking Price:</span>
              <span className="font-bold text-white">${(maxPrice ?? 0).toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={10000}
              max={500000}
              step={10000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
              <span className="text-slate-500 uppercase">Min Projected Profit:</span>
              <span className="font-bold text-emerald-400">${(minProfit ?? 0).toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={10000}
              max={50000}
              step={2500}
              value={minProfit}
              onChange={(e) => setMinProfit(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
              <span className="text-slate-500 uppercase">Min Projected ROI:</span>
              <span className="font-bold text-emerald-300">{minROI}%</span>
            </div>
            <input
              type="range"
              min={15}
              max={60}
              step={5}
              value={minROI}
              onChange={(e) => setMinROI(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Results Header with View Switcher, Dismissed counter & Restore */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-mono px-1">
        <div className="flex flex-wrap items-center gap-2">
          <span>
            Showing <strong className="text-white">{filteredProperties.length}</strong> verified properties across America
          </span>
          {selectedType === "land" && (
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
              <Trees className="w-3 h-3 text-emerald-400" />
              FILTERED: LAND & ACREAGE
            </span>
          )}
          {dismissedPropertyIds.length > 0 && (
            <button
              onClick={handleRestoreDismissed}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded text-[10px] flex items-center gap-1 transition"
              title="Restore dismissed listings to view"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restore {dismissedPropertyIds.length} Hidden</span>
            </button>
          )}
        </div>

        {/* View Layout Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5">
            <button
              onClick={() => setViewLayout("SPLIT")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition ${
                viewLayout === "SPLIT"
                  ? "bg-emerald-500 text-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Split View: Live Google Map + Listing Cards"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>SPLIT MAP & LIST</span>
            </button>
            <button
              onClick={() => setViewLayout("MAP")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition ${
                viewLayout === "MAP"
                  ? "bg-emerald-500 text-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Full Live Google Map View"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>LIVE MAP</span>
            </button>
            <button
              onClick={() => setViewLayout("CARDS")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition ${
                viewLayout === "CARDS"
                  ? "bg-emerald-500 text-black shadow"
                  : "text-slate-400 hover:text-white"
              }`}
              title="3-Column Cards Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>GRID CARDS</span>
            </button>
          </div>

          <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-wider hidden lg:flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            50-State Verified
          </span>
        </div>
      </div>

      {/* Main Results Display: SPLIT vs FULL MAP vs GRID */}
      {viewLayout === "MAP" ? (
        <PropertyGoogleMapView
          properties={filteredProperties}
          deals={deals}
          configMinROI={configMinROI}
          selectedProperty={selectedMapProperty}
          onSelectProperty={(p) => {
            setSelectedMapProperty(p);
            onSelectProperty(p);
          }}
          onAnalyzeProperty={onAnalyzeProperty}
          onDraftOutreach={onDraftOutreach}
          onMatchInvestors={onMatchInvestors}
          heightClass="h-[720px]"
        />
      ) : viewLayout === "SPLIT" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Live Google Map (7 cols) */}
          <div className="lg:col-span-7">
            <PropertyGoogleMapView
              properties={filteredProperties}
              deals={deals}
              configMinROI={configMinROI}
              selectedProperty={selectedMapProperty}
              onSelectProperty={(p) => {
                setSelectedMapProperty(p);
                onSelectProperty(p);
              }}
              onAnalyzeProperty={onAnalyzeProperty}
              onDraftOutreach={onDraftOutreach}
              onMatchInvestors={onMatchInvestors}
              heightClass="h-[750px]"
            />
          </div>

          {/* Right Column: Scrollable Property Cards Feed (5 cols) */}
          <div className="lg:col-span-5 max-h-[750px] overflow-y-auto space-y-4 pr-1 custom-scrollbar font-mono">
            <div className="p-2.5 bg-[#0E1218] border border-slate-800 rounded text-xs text-slate-400 flex items-center justify-between sticky top-0 z-20 backdrop-blur">
              <span className="font-bold text-white uppercase tracking-wider">
                Matching Properties ({filteredProperties.length})
              </span>
              <span className="text-[10px] text-emerald-400">Click marker or card</span>
            </div>

            {filteredProperties.map((property) => {
              const deal = deals.find((d) => d.propertyId === property.id);
              const discountPct = Math.round(
                ((property.expectedSalePrice - property.askingPrice) / property.expectedSalePrice) * 100
              );
              const stateRule = getStateWholesaleInfo(property.state);
              const isStrictLicense = stateRule.licenseStatus === "LICENSE_REQUIRED";
              const isDisclosureReq = stateRule.licenseStatus === "DISCLOSURE_REQUIRED";
              const isLand = property.propertyType === "land" || !!property.lotSizeAcres;
              const meetsMinROI = deal && deal.metrics && deal.metrics.roi >= configMinROI;
              const regionalRepairCost = getEstimatedRepairsFromProfile(property);
              const isSelectedOnMap = selectedMapProperty?.id === property.id;

              return (
                <div
                  key={property.id}
                  onClick={() => {
                    setSelectedMapProperty(property);
                    onSelectProperty(property);
                  }}
                  className={`bg-[#0E1218] rounded overflow-hidden shadow-sm transition cursor-pointer flex flex-col justify-between group border-l-2 relative ${
                    isSelectedOnMap
                      ? "border-emerald-400 border-l-4 border-l-emerald-400 ring-2 ring-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      : meetsMinROI
                      ? "border-emerald-500/90 border-l-4 border-l-emerald-400 ring-1 ring-emerald-500/60"
                      : "border border-slate-800 hover:border-emerald-500/50 border-l-slate-700 hover:border-l-emerald-500"
                  }`}
                >
                  <div className="p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-bold text-white">
                            ${(property.askingPrice ?? 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                            {discountPct}% Below ARV
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-200 text-xs mt-0.5 truncate max-w-[220px]">
                          {property.address}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {property.city}, {property.state} {property.zip}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {renderPropertyTypeBadge(property)}
                        {deal && (
                          <span className="text-[10px] font-bold text-emerald-300">
                            +{deal.metrics.roi}% ROI
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] bg-[#080B10] p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 truncate">Est. Spread:</span>
                      <strong className="text-emerald-400">
                        +${(deal?.metrics?.projectedProfit ?? 25000).toLocaleString()}
                      </strong>
                    </div>

                    <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-800/80 text-[9px] font-bold">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAnalyzeProperty(property.id);
                        }}
                        className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-center"
                      >
                        A2 Audit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (deal) onMatchInvestors(deal.id);
                        }}
                        className="py-1 bg-blue-950 hover:bg-blue-900 text-blue-300 rounded text-center border border-blue-800/40"
                      >
                        Buyers
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDraftOutreach(property.id);
                        }}
                        className="py-1 bg-purple-950 hover:bg-purple-900 text-purple-300 rounded text-center border border-purple-800/40"
                      >
                        Offer
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onCloserUnderwrite && deal) onCloserUnderwrite(deal.id);
                        }}
                        className="py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 rounded text-center border border-amber-800/40"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Property Cards Grid (CARDS mode) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map((property) => {
            const deal = deals.find((d) => d.propertyId === property.id);
            const discountPct = Math.round(
              ((property.expectedSalePrice - property.askingPrice) / property.expectedSalePrice) * 100
            );
            const stateRule = getStateWholesaleInfo(property.state);
            const isStrictLicense = stateRule.licenseStatus === "LICENSE_REQUIRED";
            const isDisclosureReq = stateRule.licenseStatus === "DISCLOSURE_REQUIRED";
            const isLand = property.propertyType === "land" || !!property.lotSizeAcres;
            const meetsMinROI = deal && deal.metrics && deal.metrics.roi >= configMinROI;
            const regionalRepairCost = getEstimatedRepairsFromProfile(property);

            return (
              <div
                key={property.id}
                onClick={() => onSelectProperty(property)}
                className={`bg-[#0E1218] rounded overflow-hidden shadow-sm transition cursor-pointer flex flex-col justify-between group border-l-2 relative ${
                  meetsMinROI
                    ? "border-emerald-500/90 border-l-4 border-l-emerald-400 ring-1 ring-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.22)]"
                    : "border border-slate-800 hover:border-emerald-500/50 border-l-slate-700 hover:border-l-emerald-500"
                }`}
              >
                <div>
                  {/* Photo & Badges */}
                  <div className="relative aspect-video overflow-hidden bg-[#0B0E14]">
                    <img
                      src={property.imageUrl}
                      alt={property.address}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/90 backdrop-blur px-2.5 py-1 rounded text-xs font-bold text-white border border-slate-700 font-mono">
                      ${(property.askingPrice ?? 0).toLocaleString()}
                    </div>

                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <div className="bg-black/90 backdrop-blur px-2 py-1 rounded text-[11px] font-bold text-emerald-400 border border-emerald-500/40 font-mono">
                        {discountPct}% Below ARV
                      </div>
                      {/* Dismiss / Hide Button */}
                      <button
                        onClick={(e) => handleDismissProperty(property.id, e)}
                        className="p-1 bg-black/90 hover:bg-rose-950/90 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 rounded transition"
                        title="Hide listing from current session view"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Pulsating Indicator for meeting or exceeding defined Min ROI from config */}
                    {meetsMinROI && (
                      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 bg-emerald-950/95 border border-emerald-400 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold font-mono shadow-[0_0_15px_rgba(16,185,129,0.7)] flex items-center gap-1.5 z-20 animate-pulse">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="tracking-wide">≥ {configMinROI}% MIN ROI ({deal.metrics.roi}%)</span>
                      </div>
                    )}

                    {/* Property Type Badge Overlay */}
                    <div className="absolute top-10 left-2.5 z-10">
                      {renderPropertyTypeBadge(property)}
                    </div>

                    {/* State Wholesale License Requirement Badge */}
                    <div className="absolute bottom-2.5 left-2.5 bg-black/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold font-mono flex items-center gap-1 border border-slate-700">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isStrictLicense ? "bg-rose-400" : isDisclosureReq ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                      ></span>
                      <span
                        className={
                          isStrictLicense
                            ? "text-rose-300"
                            : isDisclosureReq
                            ? "text-amber-300"
                            : "text-emerald-300"
                        }
                      >
                        {isStrictLicense
                          ? `${property.state}: LICENSE REQ`
                          : isDisclosureReq
                          ? `${property.state}: DISCLOSURE REQ`
                          : `${property.state}: NO LICENSE REQ`}
                      </span>
                    </div>

                    {deal && (
                      <div className="absolute bottom-2.5 right-2.5 bg-black/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-blue-300 border border-blue-800 font-mono">
                        SCORE {deal.dealScore ?? 80}/100
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-emerald-400 transition font-sans truncate">
                          {property.address}
                        </h3>
                        {renderPropertyTypeBadge(property)}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        {property.city}, {property.state} {property.zip}
                      </p>
                    </div>

                    {/* Mini Sparkline Chart Row */}
                    <div className="flex items-center justify-between bg-[#080B10] p-2 rounded border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 font-mono">Historical ROI Trend:</span>
                      <ROISparkline baseROI={deal?.metrics?.roi || 22} propertyId={property.id} zip={property.zip} />
                    </div>

                    {/* State Statutory Strategy Note */}
                    <div className="text-[11px] font-mono text-slate-400 bg-[#080B10] p-2 rounded border border-slate-800/80 flex items-center justify-between">
                      <span className="text-slate-400 truncate">Strategy: {stateRule.recommendedStrategy}</span>
                      <span className="text-amber-300 font-bold shrink-0">$0 EMD Valid</span>
                    </div>

                    {/* Specs Pill row */}
                    {isLand ? (
                      <div className="flex items-center space-x-2 text-xs text-emerald-300 bg-[#161B22] p-2 rounded border border-emerald-900/40 font-mono">
                        <span className="font-bold">{property.lotSizeAcres ? `${property.lotSizeAcres} Acres` : `${property.sqft.toLocaleString()} SqFt`}</span>
                        <span className="text-slate-600">•</span>
                        <span className="truncate max-w-[130px]" title={property.zoning || "Vacant Land"}>
                          {property.zoning ? property.zoning.split('/')[0].trim() : "Vacant Land"}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span>{property.daysOnMarket} DOM</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-xs text-slate-300 bg-[#161B22] p-2 rounded border border-slate-800 font-mono">
                        <span>{property.bedrooms} Beds</span>
                        <span className="text-slate-600">•</span>
                        <span>{property.bathrooms} Baths</span>
                        <span className="text-slate-600">•</span>
                        <span>{property.sqft} SqFt</span>
                        <span className="text-slate-600">•</span>
                        <span>{property.daysOnMarket} DOM</span>
                      </div>
                    )}

                    {/* Profit Engine & Regional Repair Summary Block */}
                    {deal ? (
                      <div className="bg-[#161B22] border border-slate-800 rounded p-3 text-xs font-mono space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Projected Net Profit:</span>
                          <span className="font-bold text-emerald-400">
                            ${(deal.metrics?.projectedProfit ?? 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Projected ROI:</span>
                          <span className="font-bold text-emerald-300">
                            {deal.metrics?.roi ?? 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500 flex items-center gap-1" title="Estimated based on property size & regional material cost index">
                            <Calculator className="w-3 h-3 text-amber-400" />
                            {isLand ? "Site Prep / Clearing:" : "Regional Repairs:"}
                          </span>
                          <span className="font-medium text-amber-300">
                            ${(property.estimatedRepairs || regionalRepairCost).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#161B22] p-3 rounded border border-slate-800 text-xs text-slate-500 font-mono">
                        Click to trigger Agent 2 underwriting.
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 pt-0 border-t border-slate-800 mt-3 grid grid-cols-4 gap-1 font-mono text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAnalyzeProperty(property.id);
                    }}
                    className="px-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[9px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 transition border border-slate-700"
                    title="Run Agent 2 Deep Forensic Underwriting"
                  >
                    <Brain className="w-3 h-3 text-blue-400" />
                    <span>A2 Audit</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (deal) {
                        onMatchInvestors(deal.id);
                      } else {
                        onSelectProperty(property);
                      }
                    }}
                    className="px-1.5 py-2 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 rounded text-[9px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 transition border border-blue-800/60"
                    title="Quick Match: Automatically match property against Investor Database"
                  >
                    <Users className="w-3 h-3 text-blue-400" />
                    <span>Quick Match</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDraftOutreach(property.id);
                    }}
                    className="px-1.5 py-2 bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 rounded text-[9px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 transition border border-purple-800/60"
                    title="Draft Cash Offer Email via Agent 3"
                  >
                    <Mail className="w-3 h-3 text-purple-400" />
                    <span>A3 Offer</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onCloserUnderwrite && deal) {
                        onCloserUnderwrite(deal.id);
                      }
                    }}
                    className="px-1.5 py-2 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 rounded text-[9px] font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 transition border border-amber-800/60"
                    title="Agent 4 Desktop Underwriting & Virtual Closer"
                  >
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>A4 Closer</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

