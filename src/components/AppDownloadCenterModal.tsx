import { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  Download,
  Smartphone,
  Monitor,
  Apple,
  Chrome,
  CheckCircle2,
  X,
  Share,
  PlusSquare,
  ShieldCheck,
  Zap,
  Globe,
  WifiOff,
  Mail,
  HardDrive,
  Copy,
  Terminal,
  QrCode as QrIcon,
} from "lucide-react";

interface AppDownloadCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppDownloadCenterModal({
  isOpen,
  onClose,
}: AppDownloadCenterModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<"ios" | "android" | "windows" | "mac" | "linux" | "qrcode">("qrcode");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [currentAppUrl, setCurrentAppUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = window.location.href || window.location.origin;
      setCurrentAppUrl(url);
      QRCode.toDataURL(url, {
        width: 240,
        margin: 2,
        color: {
          dark: "#050811",
          light: "#FFFFFF",
        },
      })
        .then((dataUrl) => {
          setQrCodeDataUrl(dataUrl);
        })
        .catch((err) => {
          console.error("QR Code Generation Error:", err);
        });
    }
  }, [isOpen]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentAppUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Capture PWA beforeinstallprompt event if available
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if app is already running in standalone PWA mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instructions if prompt is handled by browser
      alert("To install DealHunter AI directly, click the Install App button in your browser's address bar or menu (or use the step-by-step guide below).");
    }
  };

  // Generate Windows .bat standalone launcher script
  const downloadWindowsLauncher = () => {
    const batContent = `@echo off
:: DealHunter AI - Windows Standalone Desktop App Launcher
title Launching DealHunter AI...
echo ========================================================
echo Starting DealHunter AI Desktop Instance...
echo Executive Contact: emmaun40m@gmail.com
echo ========================================================

start msedge --app=%~dp0..\\index.html 2>nul || start chrome --app=%~dp0..\\index.html 2>nul || start ${window.location.origin}
exit
`;
    const blob = new Blob([batContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DealHunter-AI-Desktop-Launcher.bat";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate Desktop Internet Shortcut (.url)
  const downloadDesktopShortcut = () => {
    const urlContent = `[InternetShortcut]
URL=${window.location.origin}
IconIndex=0
HotKey=0
IDList=
[{000214A0-0000-0000-C000-000000000046}]
Prop3=19,0
`;
    const blob = new Blob([urlContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DealHunter AI.url";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate Mac .command launcher script
  const downloadMacLauncher = () => {
    const commandContent = `#!/bin/bash
# DealHunter AI - macOS Standalone App Launcher
# Point of Contact: emmaun40m@gmail.com
echo "Opening DealHunter AI Desktop Application..."
open -a "Google Chrome" --args --app="${window.location.origin}" || open -a "Safari" "${window.location.origin}" || open "${window.location.origin}"
`;
    const blob = new Blob([commandContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DealHunter-AI-Mac-Launcher.command";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate Linux .desktop entry
  const downloadLinuxDesktop = () => {
    const desktopContent = `[Desktop Entry]
Version=1.0
Name=DealHunter AI
Comment=Autonomous Multi-Agent Real Estate Intelligence
Exec=google-chrome --app=${window.location.origin}
Terminal=false
Type=Application
Categories=Office;Finance;
`;
    const blob = new Blob([desktopContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dealhunter-ai.desktop";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0B0E14] border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="bg-[#0E131C] border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Download className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Download & Install DealHunter AI
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-semibold">
                  CROSS-PLATFORM PWA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Install as a native application on iPhone, Android, Windows, Mac, and Linux with full offline mode.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Direct Install Action Banner */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-[#0E1420] border-b border-slate-800 p-4 px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                1-Click Direct Browser Install & Scan
                {isInstalled && (
                  <span className="text-[10px] bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" /> CURRENTLY INSTALLED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Adds DealHunter AI directly to your dock, taskbar, or mobile home screen without an App Store account.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedPlatform("qrcode")}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-lg border border-slate-700 transition"
            >
              <QrIcon className="w-4 h-4 text-emerald-400" />
              <span>Mobile QR Code</span>
            </button>
            <button
              onClick={handleInstallPWA}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-xs font-mono transition shadow-lg hover:shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              <span>INSTALL APP NOW</span>
            </button>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-[#0E121A] overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setSelectedPlatform("qrcode")}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 transition whitespace-nowrap ${
              selectedPlatform === "qrcode"
                ? "border-emerald-400 text-white font-bold bg-slate-900/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <QrIcon className="w-4 h-4 text-emerald-400" />
            <span>Scan QR Code (Mobile)</span>
          </button>

          <button
            onClick={() => setSelectedPlatform("ios")}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 transition whitespace-nowrap ${
              selectedPlatform === "ios"
                ? "border-emerald-400 text-white font-bold bg-slate-900/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iOS (iPhone & iPad)</span>
          </button>

          <button
            onClick={() => setSelectedPlatform("android")}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 transition whitespace-nowrap ${
              selectedPlatform === "android"
                ? "border-emerald-400 text-white font-bold bg-slate-900/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Android Phone & Tablet</span>
          </button>

          <button
            onClick={() => setSelectedPlatform("windows")}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 transition whitespace-nowrap ${
              selectedPlatform === "windows"
                ? "border-emerald-400 text-white font-bold bg-slate-900/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Monitor className="w-4 h-4 text-blue-400" />
            <span>Windows (10 / 11 / PC)</span>
          </button>

          <button
            onClick={() => setSelectedPlatform("mac")}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 transition whitespace-nowrap ${
              selectedPlatform === "mac"
                ? "border-emerald-400 text-white font-bold bg-slate-900/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>macOS (MacBook & Mac)</span>
          </button>

          <button
            onClick={() => setSelectedPlatform("linux")}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 transition whitespace-nowrap ${
              selectedPlatform === "linux"
                ? "border-emerald-400 text-white font-bold bg-slate-900/60"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Linux & ChromeOS</span>
          </button>
        </div>

        {/* Platform Details & Step-by-Step Guide */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#090C12] space-y-6">
          {/* Dynamic QR Code View */}
          {selectedPlatform === "qrcode" && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 max-w-md text-left">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-400">
                    <QrIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Scan with Your Phone Camera
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Point your iPhone Camera or Android QR Scanner directly at this code to open and install DealHunter AI instantly on your mobile device.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Real-time sync with desktop instance</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Full offline mode enabled with local caching</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Instant push notifications for matched cash buyers</span>
                  </div>
                </div>

                {/* Direct App Link Display */}
                <div className="pt-2">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">
                    Direct App URL:
                  </span>
                  <div className="flex items-center gap-2 bg-[#0E121A] border border-slate-800 rounded p-2">
                    <span className="text-xs font-mono text-slate-300 truncate select-all flex-1">
                      {currentAppUrl || "https://dealhunter.ai"}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-mono flex items-center gap-1 shrink-0 transition"
                    >
                      {copiedLink ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Rendered QR Code */}
              <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-2xl border border-slate-700 shrink-0">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="DealHunter AI Mobile Installation QR Code"
                    className="w-52 h-52 object-contain"
                  />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center bg-slate-100 rounded text-slate-500 text-xs font-mono">
                    Generating QR Code...
                  </div>
                )}
                <span className="text-[11px] font-mono text-slate-900 font-bold mt-2 text-center uppercase tracking-wider">
                  SCAN TO INSTALL PWA
                </span>
              </div>
            </div>
          )}
          {/* iOS Guide */}
          {selectedPlatform === "ios" && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                  <Apple className="w-4 h-4 text-slate-200" />
                  How to Install on iPhone & iPad (Safari PWA)
                </h3>
                <p className="text-xs text-slate-300 mb-4">
                  Apple iOS allows any web app to be saved as a full-screen, standalone app on your Home Screen.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#0D111A] border border-slate-800 p-3.5 rounded-lg flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center mb-2 font-mono">
                      1
                    </div>
                    <Share className="w-5 h-5 text-blue-400 mb-1" />
                    <span className="font-semibold text-white mb-1">Tap Share Button</span>
                    <span className="text-slate-400 text-[11px]">
                      In Safari, tap the square Share icon at the bottom of your screen.
                    </span>
                  </div>

                  <div className="bg-[#0D111A] border border-slate-800 p-3.5 rounded-lg flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center mb-2 font-mono">
                      2
                    </div>
                    <PlusSquare className="w-5 h-5 text-emerald-400 mb-1" />
                    <span className="font-semibold text-white mb-1">"Add to Home Screen"</span>
                    <span className="text-slate-400 text-[11px]">
                      Scroll down the share sheet and tap the "Add to Home Screen" option.
                    </span>
                  </div>

                  <div className="bg-[#0D111A] border border-slate-800 p-3.5 rounded-lg flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center mb-2 font-mono">
                      3
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-purple-400 mb-1" />
                    <span className="font-semibold text-white mb-1">Launch Native Icon</span>
                    <span className="text-slate-400 text-[11px]">
                      Tap "Add" in top-right. Launch directly from your home screen icon anytime.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Android Guide */}
          {selectedPlatform === "android" && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  How to Install on Android (Chrome / Samsung Internet)
                </h3>
                <p className="text-xs text-slate-300 mb-4">
                  Android automatically packages DealHunter AI into a high-performance WebAPK with full offline support.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#0D111A] border border-slate-800 p-4 rounded-lg">
                    <span className="text-emerald-400 font-bold block mb-1">Option A: 1-Click Banner</span>
                    <p className="text-slate-300 text-xs mb-3">
                      Tap the "INSTALL APP NOW" button above or the browser banner at the bottom of Chrome.
                    </p>
                    <button
                      onClick={handleInstallPWA}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold"
                    >
                      Trigger Android Install
                    </button>
                  </div>

                  <div className="bg-[#0D111A] border border-slate-800 p-4 rounded-lg">
                    <span className="text-blue-400 font-bold block mb-1">Option B: Chrome Menu</span>
                    <p className="text-slate-300 text-xs">
                      Tap the 3 dots (⋮) in the top-right corner of Chrome, then select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Windows Guide */}
          {selectedPlatform === "windows" && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                  <Monitor className="w-4 h-4 text-blue-400" />
                  Windows 10 / 11 Desktop Installation
                </h3>
                <p className="text-xs text-slate-300 mb-4">
                  Run DealHunter AI in a dedicated, frameless window on your desktop with full keyboard shortcuts and multi-monitor support.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-[#0D111A] border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
                    <div>
                      <div className="text-blue-400 font-bold text-xs mb-1">1. Chrome / Edge PWA</div>
                      <p className="text-slate-400 text-xs mb-3">
                        Click the Install icon in the address bar (or menu &rarr; Apps &rarr; Install).
                      </p>
                    </div>
                    <button
                      onClick={handleInstallPWA}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-mono font-bold"
                    >
                      Install via Browser
                    </button>
                  </div>

                  <div className="bg-[#0D111A] border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
                    <div>
                      <div className="text-emerald-400 font-bold text-xs mb-1">2. Desktop Launcher (.bat)</div>
                      <p className="text-slate-400 text-xs mb-3">
                        Generates a double-clickable launcher script that starts the app in standalone mode.
                      </p>
                    </div>
                    <button
                      onClick={downloadWindowsLauncher}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Launcher (.bat)</span>
                    </button>
                  </div>

                  <div className="bg-[#0D111A] border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
                    <div>
                      <div className="text-purple-400 font-bold text-xs mb-1">3. Desktop Shortcut (.url)</div>
                      <p className="text-slate-400 text-xs mb-3">
                        Instant desktop internet shortcut you can pin to your Start Menu or Taskbar.
                      </p>
                    </div>
                    <button
                      onClick={downloadDesktopShortcut}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-mono font-bold flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Shortcut (.url)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mac Guide */}
          {selectedPlatform === "mac" && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                  <Apple className="w-4 h-4 text-slate-200" />
                  macOS Desktop Installation (Chrome / Safari PWA)
                </h3>
                <p className="text-xs text-slate-300 mb-4">
                  Install DealHunter AI into your Mac Applications folder and Dock.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-[#0D111A] border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
                    <div>
                      <div className="text-emerald-400 font-bold text-xs mb-1">Chrome / Safari Web App</div>
                      <p className="text-slate-400 text-xs mb-3">
                        In Safari (macOS Sonoma+), click File &rarr; "Add to Dock". In Chrome, click the Install icon in the address bar.
                      </p>
                    </div>
                    <button
                      onClick={handleInstallPWA}
                      className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold"
                    >
                      Install to Dock / Applications
                    </button>
                  </div>

                  <div className="bg-[#0D111A] border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
                    <div>
                      <div className="text-blue-400 font-bold text-xs mb-1">Mac Shell Launcher (.command)</div>
                      <p className="text-slate-400 text-xs mb-3">
                        Download an executable script to launch the app directly into a frameless window.
                      </p>
                    </div>
                    <button
                      onClick={downloadMacLauncher}
                      className="py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-mono font-bold flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .command Script</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Linux Guide */}
          {selectedPlatform === "linux" && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  Linux & ChromeOS Desktop Entry
                </h3>
                <p className="text-xs text-slate-300 mb-4">
                  Install as a Linux desktop launcher in `~/.local/share/applications/`.
                </p>

                <button
                  onClick={downloadLinuxDesktop}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded text-xs font-mono flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .desktop Launcher Entry</span>
                </button>
              </div>
            </div>
          )}

          {/* Offline Capabilities & Architecture Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0E131C] border border-slate-800 p-4 rounded-lg flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <WifiOff className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                  100% Offline Capable Storage
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Service workers cache all underwriting math engines, 50-state wholesale statutes, and contract generators so you can close deals in rural areas with zero cell signal.
                </p>
              </div>
            </div>

            <div className="bg-[#0E131C] border border-slate-800 p-4 rounded-lg flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Primary Executive Contact Point
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All transaction alerts, daily digests, buyer match notifications, and title escrow wire receipts route directly to:
                </p>
                <div className="mt-1 font-mono text-xs text-emerald-400 font-bold">
                  emmaun40m@gmail.com
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0E131C] border-t border-slate-800 px-6 py-3 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>DealHunter PWA v2.1.0 • TLS 1.3 Certified</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
