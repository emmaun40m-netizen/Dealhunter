import React, { useState, useEffect, useRef } from "react";
import {
  Radio,
  Zap,
  Play,
  Pause,
  Maximize2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Building,
  Target,
  Flame,
  UserCheck,
  TrendingUp,
  DollarSign,
  Compass,
  Volume2,
  VolumeX,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { voiceAssistant } from "../../services/voiceAssistant";

export interface RadarSignal {
  id: string;
  address: string;
  city: string;
  state: string;
  propertyType: "SINGLE_FAMILY" | "MULTI_FAMILY" | "LAND" | "COMMERCIAL";
  price: number;
  arv: number;
  estProfit: number;
  motivationSignal: "PROBATE" | "TAX_DELINQUENT" | "CODE_VIOLATION" | "FORECLOSURE" | "VACANT_TIRED_LANDLORD";
  matchedInvestorName: string;
  matchedInvestorCriteria: string;
  scores: {
    market: number; // /25
    priceRange: number; // /25
    propertyType: number; // /20
    cashReady: number; // /15
    motivation: number; // /15
    total: number; // 0-100%
  };
  timestamp: string;
  isAlert: boolean;
  angle: number; // 0-360 for radar canvas
  distance: number; // 0.1 to 0.95 for radar canvas
}

interface RadarWidgetProps {
  onPopout?: () => void;
  isDetached?: boolean;
  onSelectDeal?: (signal: RadarSignal) => void;
}

const CITIES = [
  { city: "Detroit", state: "MI", marketWeight: 25 },
  { city: "Atlanta", state: "GA", marketWeight: 24 },
  { city: "Cleveland", state: "OH", marketWeight: 23 },
  { city: "Memphis", state: "TN", marketWeight: 22 },
  { city: "Phoenix", state: "AZ", marketWeight: 24 },
  { city: "Tampa", state: "FL", marketWeight: 23 },
  { city: "Dallas", state: "TX", marketWeight: 25 },
  { city: "Indianapolis", state: "IN", marketWeight: 22 },
];

const STREETS = [
  "8422 Artesian St",
  "1402 Woodward Ave",
  "3948 Peachtree Rd",
  "7210 Euclid Ave",
  "512 Beale St",
  "883 Camelback Rd",
  "2204 Ybor St",
  "4501 Elm Fork Rd",
  "1920 Meridian St",
  "6334 Grand River Ave",
];

const INVESTORS = [
  { name: "Apex Horizon Capital LLC", target: "Midwest SFH / Detroit & Cleveland", maxPrice: 180000 },
  { name: "Sunbelt Turnkey Partners", target: "Atlanta & Tampa SFR / Buy & Hold", maxPrice: 260000 },
  { name: "Lonestar Yield Syndicate", target: "DFW Infill Lots & Rehab Flips", maxPrice: 320000 },
  { name: "Buckeye Fortress Holdings", target: "Deep Distressed / Tax Lien Probate", maxPrice: 140000 },
  { name: "Highland Cash Fund IV", target: "100% Cash Ready / Immediate EMD", maxPrice: 400000 },
];

export default function RadarWidget({ onPopout, isDetached, onSelectDeal }: RadarWidgetProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [threshold, setThreshold] = useState(78);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [signals, setSignals] = useState<RadarSignal[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<RadarSignal | null>(null);
  const [latestAlert, setLatestAlert] = useState<RadarSignal | null>(null);
  const [radarAngle, setRadarAngle] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate initial signals
  useEffect(() => {
    const initSignals: RadarSignal[] = [
      generateSignal(true, 88),
      generateSignal(false, 72),
      generateSignal(false, 64),
      generateSignal(true, 81),
    ];
    setSignals(initSignals);
    setSelectedSignal(initSignals[0]);
  }, []);

  // Radar sweep animation
  useEffect(() => {
    let animId: number;
    const animate = () => {
      if (isScanning) {
        setRadarAngle((prev) => (prev + 2) % 360);
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isScanning]);

  // Periodic streaming listing generator
  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      const isForcedHot = Math.random() > 0.65;
      const targetScore = isForcedHot
        ? Math.floor(Math.random() * 20) + 79
        : Math.floor(Math.random() * 40) + 40;

      const newSig = generateSignal(targetScore >= threshold, targetScore);
      handleNewSignal(newSig);
    }, 4500);

    return () => clearInterval(interval);
  }, [isScanning, threshold, soundEnabled]);

  const handleNewSignal = (sig: RadarSignal) => {
    setSignals((prev) => [sig, ...prev.slice(0, 19)]);

    if (sig.isAlert && sig.scores.total >= threshold) {
      setLatestAlert(sig);
      if (soundEnabled) {
        voiceAssistant.speak(
          `Radar Match: ${sig.scores.total}% match on ${sig.address}, ${sig.city}. Buyer: ${sig.matchedInvestorName}.`,
          { chime: "portal" }
        );
      }
    }
  };

  function generateSignal(forceAlert: boolean, forceScore?: number): RadarSignal {
    const loc = CITIES[Math.floor(Math.random() * CITIES.length)];
    const street = STREETS[Math.floor(Math.random() * STREETS.length)];
    const types: RadarSignal["propertyType"][] = ["SINGLE_FAMILY", "MULTI_FAMILY", "LAND", "COMMERCIAL"];
    const motivations: RadarSignal["motivationSignal"][] = [
      "PROBATE",
      "TAX_DELINQUENT",
      "CODE_VIOLATION",
      "FORECLOSURE",
      "VACANT_TIRED_LANDLORD",
    ];

    const propType = types[Math.floor(Math.random() * types.length)];
    const mot = motivations[Math.floor(Math.random() * motivations.length)];
    const investor = INVESTORS[Math.floor(Math.random() * INVESTORS.length)];

    const price = Math.round((Math.random() * 90000 + 45000) / 1000) * 1000;
    const arv = Math.round(price * (1.6 + Math.random() * 0.8) / 1000) * 1000;
    const estProfit = Math.round((arv * 0.7 - price - 20000) / 1000) * 1000;

    let marketScore = loc.marketWeight;
    let priceScore = price <= investor.maxPrice ? 25 : 12;
    let typeScore = propType === "SINGLE_FAMILY" ? 20 : 15;
    let cashReadyScore = 15;
    let motivationScore = mot === "PROBATE" || mot === "TAX_DELINQUENT" ? 15 : 10;

    let total = marketScore + priceScore + typeScore + cashReadyScore + motivationScore;

    if (forceScore !== undefined) {
      total = forceScore;
      marketScore = Math.round(total * 0.25);
      priceScore = Math.round(total * 0.25);
      typeScore = Math.round(total * 0.2);
      cashReadyScore = Math.round(total * 0.15);
      motivationScore = total - (marketScore + priceScore + typeScore + cashReadyScore);
    }

    const angle = Math.floor(Math.random() * 360);
    // Higher match distance closer to center
    const distance = Math.max(0.15, Math.min(0.9, 1 - total / 115));

    return {
      id: "rad-" + Math.random().toString(36).substring(2, 9),
      address: street,
      city: loc.city,
      state: loc.state,
      propertyType: propType,
      price,
      arv,
      estProfit: Math.max(15000, estProfit),
      motivationSignal: mot,
      matchedInvestorName: investor.name,
      matchedInvestorCriteria: investor.target,
      scores: {
        market: marketScore,
        priceRange: priceScore,
        propertyType: typeScore,
        cashReady: cashReadyScore,
        motivation: motivationScore,
        total,
      },
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      isAlert: total >= threshold,
      angle,
      distance,
    };
  }

  const handleInjectTestSignal = () => {
    const hotScore = Math.floor(Math.random() * 10) + 88; // 88% - 97%
    const hotSig = generateSignal(true, hotScore);
    hotSig.address = "8422 Artesian St";
    hotSig.city = "Detroit";
    hotSig.state = "MI";
    hotSig.motivationSignal = "PROBATE";
    hotSig.matchedInvestorName = "Apex Horizon Capital LLC";
    hotSig.isAlert = true;
    handleNewSignal(hotSig);
    setSelectedSignal(hotSig);
  };

  // Draw Radar Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 10;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#090D14";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#1E293B";
    ctx.stroke();

    // Concentric Range Rings
    const rings = [0.25, 0.5, 0.75, 1.0];
    rings.forEach((ring) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * ring, 0, Math.PI * 2);
      ctx.strokeStyle = ring === 1.0 ? "#334155" : "#1E293B";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Sweep Ray
    const sweepRad = (radarAngle * Math.PI) / 180;
    const sweepX = cx + Math.cos(sweepRad) * radius;
    const sweepY = cy + Math.sin(sweepRad) * radius;

    // Gradient Sweep Cone
    const coneAngle = 0.4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, sweepRad - coneAngle, sweepRad);
    ctx.closePath();
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, "rgba(16, 185, 129, 0)");
    grad.addColorStop(1, "rgba(16, 185, 129, 0.18)");
    ctx.fillStyle = grad;
    ctx.fill();

    // Sweep leading line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sweepX, sweepY);
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Signal Blips
    signals.slice(0, 14).forEach((sig) => {
      const rad = (sig.angle * Math.PI) / 180;
      const bx = cx + Math.cos(rad) * (radius * sig.distance);
      const by = cy + Math.sin(rad) * (radius * sig.distance);

      const isHot = sig.scores.total >= threshold;
      const isSelected = selectedSignal?.id === sig.id;

      ctx.beginPath();
      ctx.arc(bx, by, isSelected ? 6 : isHot ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = isHot ? "#10B981" : sig.scores.total >= 60 ? "#F59E0B" : "#64748B";
      ctx.fill();

      if (isHot || isSelected) {
        ctx.beginPath();
        ctx.arc(bx, by, isSelected ? 10 : 7, 0, Math.PI * 2);
        ctx.strokeStyle = isHot ? "rgba(16, 185, 129, 0.6)" : "rgba(245, 158, 11, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });
  }, [radarAngle, signals, threshold, selectedSignal]);

  return (
    <div className="bg-[#0B0E14] border border-slate-800 rounded-lg overflow-hidden shadow-xl text-slate-200 font-mono">
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#0E1218] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wider font-sans">
                AUTONOMOUS INVENTORY RADAR
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                STREAMING LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Auto-scoring national off-market signals against VIP buyer database in real time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Inject Test Signal Button */}
          <button
            onClick={handleInjectTestSignal}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition border border-emerald-400/30"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>INJECT TEST SIGNAL</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded border transition ${
              soundEnabled
                ? "bg-slate-800 text-slate-200 border-slate-700 hover:text-white"
                : "bg-slate-900 text-slate-500 border-slate-800"
            }`}
            title={soundEnabled ? "Voice Chimes Enabled" : "Voice Chimes Muted"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Pause / Play */}
          <button
            onClick={() => setIsScanning(!isScanning)}
            className="p-1.5 bg-slate-800 text-slate-200 border border-slate-700 hover:text-white rounded transition"
          >
            {isScanning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>

          {onPopout && (
            <button
              onClick={onPopout}
              className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded transition border border-slate-700"
              title="Pop out radar display"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Threshold & Status Sub-bar */}
      <div className="px-5 py-2 bg-[#121720] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">ALERT THRESHOLD:</span>
            <span className="text-emerald-400 font-bold">&gt;{threshold}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">Sensitivity:</span>
            <input
              type="range"
              min={60}
              max={90}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
            RADAR ACTIVE ({signals.length} PROCESSED)
          </span>
        </div>
      </div>

      {/* Main Grid: Radar Screen (Left) + Signals Feed & Match Breakdown (Right) */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Radar Visual Scanner */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#070A0F] p-4 rounded-lg border border-slate-800 relative">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="w-full max-w-[280px] h-auto aspect-square"
          />

          <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              &gt;{threshold}% Match
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              60-77% Moderate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block"></span>
              &lt;60% Passive
            </span>
          </div>
        </div>

        {/* Right: Real-time Live Stream & Selected Signal Inspector */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Latest Hot Alert Banner if active */}
          {latestAlert && latestAlert.scores.total >= threshold && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/50 rounded-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-emerald-500/20 text-emerald-300">
                  <Flame className="w-5 h-5 text-emerald-400 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-sans">
                      {latestAlert.address}, {latestAlert.city}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded">
                      {latestAlert.scores.total}% MATCH
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-300/80">
                    Buyer: <span className="font-bold text-white">{latestAlert.matchedInvestorName}</span> • Spread: ${latestAlert.estProfit.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedSignal(latestAlert);
                  if (onSelectDeal) onSelectDeal(latestAlert);
                }}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded transition"
              >
                INSPECT
              </button>
            </div>
          )}

          {/* Selected Signal Detail Breakdown */}
          {selectedSignal && (
            <div className="p-4 bg-[#121720] border border-slate-700/70 rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-sans">
                      {selectedSignal.address}, {selectedSignal.city}, {selectedSignal.state}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        selectedSignal.scores.total >= threshold
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {selectedSignal.scores.total}% COMPOSITE SCORE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Signal Type: <span className="text-amber-400 font-bold">{selectedSignal.motivationSignal}</span> • Price: ${selectedSignal.price.toLocaleString()} • ARV: ${selectedSignal.arv.toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500">PROJ. MARGIN</span>
                  <div className="text-sm font-bold text-emerald-400">
                    +${selectedSignal.estProfit.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* 5-Factor Scoring Bars */}
              <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-800 text-[10px]">
                <div>
                  <span className="text-slate-500 block">Market ({selectedSignal.scores.market}/25)</span>
                  <div className="h-1.5 bg-slate-800 rounded mt-1 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400"
                      style={{ width: `${(selectedSignal.scores.market / 25) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block">Price ({selectedSignal.scores.priceRange}/25)</span>
                  <div className="h-1.5 bg-slate-800 rounded mt-1 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400"
                      style={{ width: `${(selectedSignal.scores.priceRange / 25) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block">Type ({selectedSignal.scores.propertyType}/20)</span>
                  <div className="h-1.5 bg-slate-800 rounded mt-1 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400"
                      style={{ width: `${(selectedSignal.scores.propertyType / 20) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block">Cash Ready ({selectedSignal.scores.cashReady}/15)</span>
                  <div className="h-1.5 bg-slate-800 rounded mt-1 overflow-hidden">
                    <div
                      className="h-full bg-indigo-400"
                      style={{ width: `${(selectedSignal.scores.cashReady / 15) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block">Distress ({selectedSignal.scores.motivation}/15)</span>
                  <div className="h-1.5 bg-slate-800 rounded mt-1 overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${(selectedSignal.scores.motivation / 15) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Matched Investor Box */}
              <div className="p-2.5 bg-slate-900/90 rounded border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-slate-300 font-bold">{selectedSignal.matchedInvestorName}</span>
                    <span className="text-[10px] text-slate-500 block">{selectedSignal.matchedInvestorCriteria}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onSelectDeal) onSelectDeal(selectedSignal);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded border border-slate-700 transition"
                >
                  DISPATCH OUTREACH
                </button>
              </div>
            </div>
          )}

          {/* Real-time Listing Stream List */}
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
              Live Inbound Signals Stream
            </span>
            {signals.map((sig) => {
              const isHot = sig.scores.total >= threshold;
              const isSelected = selectedSignal?.id === sig.id;

              return (
                <div
                  key={sig.id}
                  onClick={() => setSelectedSignal(sig)}
                  className={`px-3 py-2 rounded cursor-pointer transition flex items-center justify-between text-xs border ${
                    isSelected
                      ? "bg-slate-800 border-slate-600 text-white"
                      : isHot
                      ? "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60 text-slate-200"
                      : "bg-[#141922] border-slate-800/80 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isHot ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
                      }`}
                    />
                    <span className="font-bold text-white font-sans">{sig.address}</span>
                    <span className="text-[10px] text-slate-400">
                      {sig.city}, {sig.state}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-amber-300 border border-slate-800">
                      {sig.motivationSignal}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500">{sig.timestamp}</span>
                    <span
                      className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                        isHot
                          ? "bg-emerald-500 text-slate-950 font-bold"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {sig.scores.total}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
