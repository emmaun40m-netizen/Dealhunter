import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import {
  MapPin,
  Flame,
  Brain,
  Mail,
  Users,
  Maximize2,
  Minimize2,
  Navigation,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building2,
  Home,
  Trees,
  Layers,
  Activity,
  Sliders,
  DollarSign,
} from "lucide-react";
import { Property, Deal } from "../types";
import { getStateWholesaleInfo } from "../services/complianceData";

interface PropertyGoogleMapViewProps {
  properties: Property[];
  deals: Deal[];
  configMinROI?: number;
  selectedProperty?: Property | null;
  onSelectProperty: (property: Property) => void;
  onAnalyzeProperty: (propertyId: string) => void;
  onDraftOutreach: (propertyId: string) => void;
  onMatchInvestors: (dealId: string) => void;
  heightClass?: string;
}

// Google Maps Heatmap Layer subcomponent
function GoogleMapsHeatmapLayer({
  points,
  mode,
  radius,
  opacity,
}: {
  points: { lat: number; lng: number; weight: number }[];
  mode: "DENSITY" | "PRICE";
  radius: number;
  opacity: number;
}) {
  const map = useMap();
  const visualizationLib = useMapsLibrary("visualization");
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    if (!map || !visualizationLib) return;

    try {
      const data = points.map((p) => ({
        location: new (google.maps as any).LatLng(p.lat, p.lng),
        weight: mode === "PRICE" ? Math.max(1, Math.round(p.weight / 10000)) : 1,
      }));

      const densityGradient = [
        "rgba(0, 255, 255, 0)",
        "rgba(0, 255, 255, 0.7)",
        "rgba(0, 191, 255, 0.8)",
        "rgba(0, 128, 255, 0.85)",
        "rgba(0, 255, 128, 0.9)",
        "rgba(0, 255, 0, 0.95)",
        "rgba(255, 255, 0, 0.95)",
        "rgba(255, 128, 0, 1)",
        "rgba(255, 0, 0, 1)",
      ];

      const priceGradient = [
        "rgba(16, 185, 129, 0)",
        "rgba(16, 185, 129, 0.7)",
        "rgba(59, 130, 246, 0.8)",
        "rgba(168, 85, 247, 0.85)",
        "rgba(245, 158, 11, 0.95)",
        "rgba(239, 68, 68, 1)",
      ];

      if (!heatmapRef.current) {
        heatmapRef.current = new (visualizationLib as any).HeatmapLayer({
          data,
          map,
          radius,
          opacity,
          gradient: mode === "PRICE" ? priceGradient : densityGradient,
        });
      } else {
        heatmapRef.current.setData(data as any);
        heatmapRef.current.set("radius", radius);
        heatmapRef.current.set("opacity", opacity);
        heatmapRef.current.set("gradient", mode === "PRICE" ? priceGradient : densityGradient);
        heatmapRef.current.setMap(map);
      }
    } catch (e) {
      console.warn("Could not instantiate HeatmapLayer:", e);
    }

    return () => {
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
      }
    };
  }, [map, visualizationLib, points, mode, radius, opacity]);

  return null;
}

// Pre-defined regional US bounding centers
const REGIONAL_CENTERS: Record<string, { lat: number; lng: number; zoom: number; label: string }> = {
  ALL_USA: { lat: 39.5, lng: -98.35, zoom: 4, label: "All USA (Continental)" },
  MIDWEST: { lat: 42.33, lng: -83.04, zoom: 7, label: "Midwest / Great Lakes" },
  FLORIDA: { lat: 28.53, lng: -81.37, zoom: 7, label: "Florida Sunbelt" },
  TEXAS: { lat: 31.96, lng: -99.9, zoom: 6, label: "Texas Metro Hub" },
  SOUTHEAST: { lat: 35.5, lng: -86.5, zoom: 6, label: "Southeast / TN Corridor" },
};

export default function PropertyGoogleMapView({
  properties,
  deals,
  configMinROI = 25,
  selectedProperty,
  onSelectProperty,
  onAnalyzeProperty,
  onDraftOutreach,
  onMatchInvestors,
  heightClass = "h-[620px]",
}: PropertyGoogleMapViewProps) {
  const [activePropertyId, setActivePropertyId] = useState<string | null>(
    selectedProperty?.id || null
  );
  const [activeRegion, setActiveRegion] = useState<string>("ALL_USA");
  const [heatmapMode, setHeatmapMode] = useState<"OFF" | "DENSITY" | "PRICE">("OFF");
  const [heatmapRadius, setHeatmapRadius] = useState<number>(32);
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.75);
  const [showHeatmapControls, setShowHeatmapControls] = useState<boolean>(false);

  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 39.5,
    lng: -98.35,
  });
  const [mapZoom, setMapZoom] = useState<number>(4);

  // Property data mapping with coordinates fallback
  const validLocationProperties = useMemo(() => {
    return properties.map((prop, idx) => {
      let lat = prop.latitude;
      let lng = prop.longitude;
      if (!lat || !lng || (lat === 0 && lng === 0)) {
        if (prop.state === "MI") {
          lat = 42.3314 + (idx * 0.04 - 0.1);
          lng = -83.0458 + (idx * 0.05 - 0.1);
        } else if (prop.state === "FL") {
          lat = 28.5383 + (idx * 0.03 - 0.08);
          lng = -81.3792 + (idx * 0.04 - 0.08);
        } else if (prop.state === "TN") {
          lat = 36.1627 + (idx * 0.03 - 0.06);
          lng = -86.7816 + (idx * 0.03 - 0.06);
        } else if (prop.state === "TX") {
          lat = 32.7767 + (idx * 0.04 - 0.08);
          lng = -96.7970 + (idx * 0.04 - 0.08);
        } else {
          lat = 37.0902 + (idx * 0.6 - 1.8);
          lng = -95.7129 + (idx * 1.2 - 3.6);
        }
      }
      return { ...prop, computedLat: lat, computedLng: lng };
    });
  }, [properties]);

  // Heatmap points for density & pricing
  const heatmapPoints = useMemo(() => {
    return validLocationProperties.map((p) => ({
      lat: p.computedLat,
      lng: p.computedLng,
      weight: p.askingPrice || 50000,
    }));
  }, [validLocationProperties]);

  const avgPrice = useMemo(() => {
    if (validLocationProperties.length === 0) return 0;
    const sum = validLocationProperties.reduce((acc, p) => acc + (p.askingPrice || 0), 0);
    return Math.round(sum / validLocationProperties.length);
  }, [validLocationProperties]);

  const activeProperty = validLocationProperties.find((p) => p.id === activePropertyId);
  const activeDeal = deals.find((d) => d.propertyId === activePropertyId);

  const handleSelectRegion = (key: string) => {
    setActiveRegion(key);
    const target = REGIONAL_CENTERS[key];
    if (target) {
      setMapCenter({ lat: target.lat, lng: target.lng });
      setMapZoom(target.zoom);
    }
  };

  const handleMarkerClick = (prop: typeof validLocationProperties[0]) => {
    setActivePropertyId(prop.id);
    onSelectProperty(prop);
  };

  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || "";

  return (
    <div className="bg-[#0E1218] border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col font-mono">
      {/* Top Map Action & Submarket Bar */}
      <div className="p-3 bg-[#121720] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase tracking-wider text-xs">
                Google Maps Live Property Radar
              </span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                {validLocationProperties.length} LOCATIONS
              </span>
              {heatmapMode !== "OFF" && (
                <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/40 text-[9px] font-bold animate-pulse">
                  HEATMAP: {heatmapMode}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Advanced markers with real-time ARV discount & heatmap density visualizer
            </p>
          </div>
        </div>

        {/* Heatmap Overlay Controls & Region Quick Center */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Heatmap Mode Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5 text-[10px]">
            <span className="px-2 text-slate-500 font-bold uppercase flex items-center gap-1">
              <Layers className="w-3 h-3 text-amber-400" />
              <span>Heatmap:</span>
            </span>
            <button
              onClick={() => setHeatmapMode("OFF")}
              className={`px-2 py-1 rounded font-bold transition ${
                heatmapMode === "OFF"
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              OFF
            </button>
            <button
              onClick={() => setHeatmapMode("DENSITY")}
              className={`px-2 py-1 rounded font-bold transition ${
                heatmapMode === "DENSITY"
                  ? "bg-cyan-500 text-black shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              DENSITY
            </button>
            <button
              onClick={() => setHeatmapMode("PRICE")}
              className={`px-2 py-1 rounded font-bold transition ${
                heatmapMode === "PRICE"
                  ? "bg-amber-500 text-black shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              PRICE POINTS
            </button>

            {heatmapMode !== "OFF" && (
              <button
                onClick={() => setShowHeatmapControls(!showHeatmapControls)}
                className="px-1.5 py-1 text-slate-400 hover:text-white"
                title="Heatmap Settings"
              >
                <Sliders className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Region Quick Center Buttons */}
          <div className="flex flex-wrap items-center gap-1">
            {Object.entries(REGIONAL_CENTERS).map(([key, reg]) => (
              <button
                key={key}
                onClick={() => handleSelectRegion(key)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition border ${
                  activeRegion === key
                    ? "bg-emerald-500 text-black border-emerald-400 shadow-sm"
                    : "bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700"
                }`}
              >
                {reg.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Sliders Drawer if open */}
      {showHeatmapControls && heatmapMode !== "OFF" && (
        <div className="bg-[#0B0E14] border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-300">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 uppercase text-[10px]">Radius:</span>
              <input
                type="range"
                min="10"
                max="60"
                value={heatmapRadius}
                onChange={(e) => setHeatmapRadius(Number(e.target.value))}
                className="w-24 accent-amber-400"
              />
              <span className="font-mono text-amber-400 text-[10px]">{heatmapRadius}px</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 uppercase text-[10px]">Opacity:</span>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={heatmapOpacity}
                onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
                className="w-24 accent-amber-400"
              />
              <span className="font-mono text-amber-400 text-[10px]">{Math.round(heatmapOpacity * 100)}%</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span>Avg Asking Price: <strong className="text-emerald-400">${avgPrice.toLocaleString()}</strong></span>
            <span>Locations Sampled: <strong className="text-white">{validLocationProperties.length}</strong></span>
          </div>
        </div>
      )}

      {/* Main Google Maps Canvas Viewport */}
      <div className={`relative w-full ${heightClass} bg-[#0A0D13]`}>
        <APIProvider apiKey={apiKey} libraries={["places", "marker", "visualization"]}>
          <Map
            mapId="dealhunter_national_map"
            center={mapCenter}
            zoom={mapZoom}
            onCenterChanged={(ev) => setMapCenter(ev.detail.center)}
            onZoomChanged={(ev) => setMapZoom(ev.detail.zoom)}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapTypeId="roadmap"
            internalUsageAttributionIds={["gmp_git_agentskills_v1"]}
            style={{ width: "100%", height: "100%" }}
          >
            {/* Heatmap Layer */}
            {heatmapMode !== "OFF" && (
              <GoogleMapsHeatmapLayer
                points={heatmapPoints}
                mode={heatmapMode}
                radius={heatmapRadius}
                opacity={heatmapOpacity}
              />
            )}

            {/* Markers */}
            {validLocationProperties.map((prop) => {
              const deal = deals.find((d) => d.propertyId === prop.id);
              const isHighROI = (deal?.metrics?.roi ?? 0) >= configMinROI;
              const isSelected = activePropertyId === prop.id;

              return (
                <AdvancedMarker
                  key={prop.id}
                  position={{ lat: prop.computedLat, lng: prop.computedLng }}
                  title={`${prop.address} - $${(prop.askingPrice || 0).toLocaleString()}`}
                  onClick={() => handleMarkerClick(prop)}
                >
                  <div
                    className={`group cursor-pointer transition transform hover:scale-110 ${
                      isSelected ? "scale-110 z-30" : "z-10"
                    } ${heatmapMode !== "OFF" ? "opacity-80 hover:opacity-100" : "opacity-100"}`}
                  >
                    {isHighROI ? (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-950/95 border-2 border-emerald-400 text-emerald-300 font-mono text-[10px] font-bold shadow-[0_0_15px_rgba(16,185,129,0.7)] animate-pulse">
                        <Flame className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>${Math.round((prop.askingPrice || 0) / 1000)}k</span>
                      </div>
                    ) : (
                      <div
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-md ${
                          prop.propertyType === "MULTI_FAMILY"
                            ? "bg-blue-950/95 border border-blue-400 text-blue-300"
                            : prop.propertyType === "land"
                            ? "bg-amber-950/95 border border-amber-400 text-amber-300"
                            : "bg-slate-900/95 border border-slate-600 text-slate-200"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>${Math.round((prop.askingPrice || 0) / 1000)}k</span>
                      </div>
                    )}
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Interactive InfoWindow for selected Marker */}
            {activeProperty && (
              <InfoWindow
                position={{
                  lat: activeProperty.computedLat,
                  lng: activeProperty.computedLng,
                }}
                onCloseClick={() => setActivePropertyId(null)}
                maxWidth={320}
              >
                <div className="p-1 font-mono text-xs text-slate-900 space-y-2">
                  <div className="relative aspect-video rounded overflow-hidden bg-slate-100">
                    <img
                      src={activeProperty.imageUrl}
                      alt={activeProperty.address}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 bg-black/80 text-white font-bold text-[10px] px-1.5 py-0.5 rounded">
                      ${(activeProperty.askingPrice ?? 0).toLocaleString()}
                    </div>
                    {activeDeal && (
                      <div className="absolute top-1 right-1 bg-emerald-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Flame className="w-3 h-3 text-amber-300" />
                        {activeDeal.metrics.roi}% ROI
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs truncate">
                      {activeProperty.address}
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      {activeProperty.city}, {activeProperty.state} {activeProperty.zip}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[10px] bg-slate-100 p-1.5 rounded">
                    <div>
                      <span className="text-slate-500">Est. ARV:</span>{" "}
                      <strong>${(activeProperty.expectedSalePrice ?? 0).toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Est. Profit:</span>{" "}
                      <strong className="text-emerald-700">
                        +${(activeDeal?.metrics?.projectedProfit ?? 35000).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {/* Fast Action Buttons in Popup */}
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    <button
                      onClick={() => onAnalyzeProperty(activeProperty.id)}
                      className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1"
                      title="Underwrite deal"
                    >
                      <Brain className="w-3 h-3" />
                      <span>Audit</span>
                    </button>
                    <button
                      onClick={() => onDraftOutreach(activeProperty.id)}
                      className="p-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1"
                      title="Draft outreach email"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Reach</span>
                    </button>
                    <button
                      onClick={() => activeDeal && onMatchInvestors(activeDeal.id)}
                      className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1"
                      title="Match cash buyers"
                    >
                      <Users className="w-3 h-3" />
                      <span>Buyers</span>
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Legend Overlay at bottom left */}
        <div className="absolute bottom-4 left-4 bg-[#0E1218]/90 backdrop-blur border border-slate-800 rounded-lg p-2.5 text-[10px] font-mono space-y-2 shadow-lg">
          <div className="font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between gap-3">
            <span>Map Layers</span>
            {heatmapMode !== "OFF" && (
              <span className="text-[9px] text-amber-400 font-bold">{heatmapMode} ACTIVE</span>
            )}
          </div>

          {heatmapMode === "DENSITY" ? (
            <div className="space-y-1">
              <div className="text-slate-400 text-[9px]">PROPERTY DENSITY GRADIENT</div>
              <div className="h-2 w-36 rounded-full bg-gradient-to-r from-cyan-500 via-emerald-400 via-amber-400 to-red-500"></div>
              <div className="flex justify-between text-[8px] text-slate-500">
                <span>Low Density</span>
                <span>High Clustering</span>
              </div>
            </div>
          ) : heatmapMode === "PRICE" ? (
            <div className="space-y-1">
              <div className="text-slate-400 text-[9px]">PRICE INTENSITY GRADIENT</div>
              <div className="h-2 w-36 rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 via-purple-500 via-amber-500 to-red-600"></div>
              <div className="flex justify-between text-[8px] text-slate-500">
                <span>&lt; $50k</span>
                <span>$100k - $200k+</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]"></span>
                <span className="text-slate-300">≥ {configMinROI}% Min ROI Target</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                <span className="text-slate-400">Multi-Family / Sub-To</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="text-slate-400">Acreage & Land</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
