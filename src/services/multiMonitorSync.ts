// Multi-Monitor Synchronization and Window Management Service
// BroadcastChannel: host_multi_monitor_sync_v2

export interface MonitorDisplay {
  id: string;
  label: string;
  isPrimary: boolean;
  isInternal?: boolean;
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  left: number;
  top: number;
  colorDepth: number;
  pixelRatio: number;
}

export interface DetachedWindowInfo {
  widgetId: string;
  widgetTitle: string;
  windowRef: Window | null;
  targetDisplayId?: string;
  openedAt: number;
}

export interface SyncMessage {
  type:
    | "LAYOUT_CHANGED"
    | "WIDGET_POPOUT"
    | "WIDGET_RECALLED"
    | "ACTIVE_DEAL_CHANGED"
    | "EXECUTE_CODE_TRIGGER"
    | "VIEW_CHANGED"
    | "HEARTBEAT"
    | "PING_SCREENS";
  payload: any;
  senderId: string;
  timestamp: number;
}

export type GridPreset = "3/4" | "1x1" | "1x2" | "1x3" | "2x2" | "2x3" | "CUSTOM";

export interface WorkspaceSlot {
  slotId: string;
  widgetId: string;
  isDetached?: boolean;
}

export interface WorkspaceLayoutConfig {
  preset: GridPreset;
  slots: WorkspaceSlot[];
  pinnedWidgets: string[];
  lastSaved: number;
}

const STORAGE_KEY = "dealhunter_workspace_layout_v2";
const CHANNEL_NAME = "host_multi_monitor_sync_v2";

class MultiMonitorService {
  private channel: BroadcastChannel | null = null;
  private clientId: string = `client_${Math.random().toString(36).substring(2, 9)}`;
  private listeners: ((msg: SyncMessage) => void)[] = [];
  private openWindows: Map<string, DetachedWindowInfo> = new Map();
  private screenDetails: any = null;

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          const msg: SyncMessage = event.data;
          if (msg && msg.senderId !== this.clientId) {
            this.listeners.forEach((fn) => fn(msg));
          }
        };
      } catch (err) {
        console.warn("BroadcastChannel initialization warning:", err);
      }
    }
  }

  public getClientId(): string {
    return this.clientId;
  }

  // Subscribe to multi-monitor sync messages
  public subscribe(fn: (msg: SyncMessage) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  // Broadcast message to all active displays/windows
  public broadcast(type: SyncMessage["type"], payload: any = {}) {
    const msg: SyncMessage = {
      type,
      payload,
      senderId: this.clientId,
      timestamp: Date.now(),
    };
    try {
      this.channel?.postMessage(msg);
    } catch (e) {
      console.warn("Failed to broadcast message:", e);
    }
  }

  // Load layout from localStorage
  public loadLayout(): WorkspaceLayoutConfig {
    const defaultLayout: WorkspaceLayoutConfig = {
      preset: "2x2",
      slots: [
        { slotId: "slot-0", widgetId: "graphs" },
        { slotId: "slot-1", widgetId: "live_feeds" },
        { slotId: "slot-2", widgetId: "live_code" },
        { slotId: "slot-3", widgetId: "deals_spotlight" },
      ],
      pinnedWidgets: ["graphs", "live_code"],
      lastSaved: Date.now(),
    };

    if (typeof window === "undefined") return defaultLayout;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.slots && parsed.preset) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading saved layout:", e);
    }

    return defaultLayout;
  }

  // Save layout to localStorage and broadcast change
  public saveLayout(layout: WorkspaceLayoutConfig) {
    if (typeof window === "undefined") return;
    try {
      const config = { ...layout, lastSaved: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      this.broadcast("LAYOUT_CHANGED", config);
    } catch (e) {
      console.error("Error saving workspace layout:", e);
    }
  }

  // Push active portal view tab to main workspace window
  public pushView(viewId: string) {
    this.broadcast("VIEW_CHANGED", { view: viewId });
  }

  // Query Hardware Displays via Screen Details API or Screen fallback
  public async getConnectedMonitors(): Promise<MonitorDisplay[]> {
    if (typeof window === "undefined") return [];

    // Attempt Window Management API (window.getScreenDetails)
    if ("getScreenDetails" in window && typeof (window as any).getScreenDetails === "function") {
      try {
        const screenDetails = await (window as any).getScreenDetails();
        this.screenDetails = screenDetails;
        if (screenDetails && screenDetails.screens && screenDetails.screens.length > 0) {
          return screenDetails.screens.map((s: any, idx: number) => ({
            id: `display_${idx + 1}`,
            label: s.label || `Display ${idx + 1} (${s.width}x${s.height})`,
            isPrimary: s.isPrimary || idx === 0,
            isInternal: s.isInternal,
            width: s.width,
            height: s.height,
            availWidth: s.availWidth,
            availHeight: s.availHeight,
            left: s.left || 0,
            top: s.top || 0,
            colorDepth: s.colorDepth || 24,
            pixelRatio: s.devicePixelRatio || window.devicePixelRatio || 1,
          }));
        }
      } catch (err) {
        console.info("getScreenDetails requires user permission or not granted:", err);
      }
    }

    // Fallback: Detect primary window screen and simulate multi-screen coordinates
    const primaryWidth = window.screen.width || 1920;
    const primaryHeight = window.screen.height || 1080;
    const isUltraWide = primaryWidth >= 3440;

    const displays: MonitorDisplay[] = [
      {
        id: "display_1",
        label: isUltraWide ? "Display 1 (UltraWide Primary)" : "Display 1 (Primary Console)",
        isPrimary: true,
        isInternal: true,
        width: primaryWidth,
        height: primaryHeight,
        availWidth: window.screen.availWidth || primaryWidth,
        availHeight: window.screen.availHeight || primaryHeight,
        left: 0,
        top: 0,
        colorDepth: window.screen.colorDepth || 24,
        pixelRatio: window.devicePixelRatio || 1,
      },
    ];

    // Check if secondary display detected via screen.availLeft or wide geometry
    if ((window.screen as any).availLeft && (window.screen as any).availLeft > 0) {
      displays.push({
        id: "display_2",
        label: "Display 2 (Docked Extended Screen)",
        isPrimary: false,
        isInternal: false,
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1040,
        left: primaryWidth,
        top: 0,
        colorDepth: 24,
        pixelRatio: window.devicePixelRatio || 1,
      });
    } else {
      // Provide standard virtual display profile for docking stations / secondary monitors
      displays.push({
        id: "display_2",
        label: "Display 2 (Secondary / External Monitor)",
        isPrimary: false,
        isInternal: false,
        width: 1920,
        height: 1080,
        availWidth: 1920,
        availHeight: 1040,
        left: primaryWidth,
        top: 0,
        colorDepth: 24,
        pixelRatio: 1,
      });
    }

    return displays;
  }

  // Pop out a widget into a detached external browser window
  public popoutWidget(
    widgetId: string,
    widgetTitle: string,
    targetDisplay?: MonitorDisplay
  ): Window | null {
    if (typeof window === "undefined") return null;

    // Determine target positioning
    let left = targetDisplay ? targetDisplay.left + 50 : window.screenX + 100;
    let top = targetDisplay ? targetDisplay.top + 50 : window.screenY + 100;
    let width = targetDisplay ? Math.min(1200, targetDisplay.availWidth - 100) : 1100;
    let height = targetDisplay ? Math.min(800, targetDisplay.availHeight - 100) : 750;

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("popout", "true");
    currentUrl.searchParams.set("widget", widgetId);
    currentUrl.searchParams.set("title", encodeURIComponent(widgetTitle));

    const windowFeatures = `left=${left},top=${top},width=${width},height=${height},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`;

    const newWindow = window.open(currentUrl.toString(), `popout_${widgetId}`, windowFeatures);

    if (newWindow) {
      this.openWindows.set(widgetId, {
        widgetId,
        widgetTitle,
        windowRef: newWindow,
        targetDisplayId: targetDisplay?.id,
        openedAt: Date.now(),
      });

      // Track close event to recall widget automatically
      const checkTimer = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkTimer);
          this.recallWidget(widgetId);
        }
      }, 800);

      this.broadcast("WIDGET_POPOUT", {
        widgetId,
        widgetTitle,
        targetDisplayId: targetDisplay?.id,
      });
    }

    return newWindow;
  }

  // Recall a popped out widget back to main workspace
  public recallWidget(widgetId: string) {
    const winInfo = this.openWindows.get(widgetId);
    if (winInfo && winInfo.windowRef && !winInfo.windowRef.closed) {
      try {
        winInfo.windowRef.close();
      } catch (e) {
        console.warn("Could not close popup window:", e);
      }
    }
    this.openWindows.delete(widgetId);
    this.broadcast("WIDGET_RECALLED", { widgetId });
  }

  // Recall all open windows back to master screen
  public recallAllWidgets() {
    this.openWindows.forEach((info) => {
      if (info.windowRef && !info.windowRef.closed) {
        try {
          info.windowRef.close();
        } catch (e) {
          console.warn("Error closing window", e);
        }
      }
    });
    this.openWindows.clear();
    this.broadcast("WIDGET_RECALLED", { all: true });
  }

  // Get active detached windows
  public getDetachedWidgets(): string[] {
    const list: string[] = [];
    this.openWindows.forEach((info, key) => {
      if (info.windowRef && !info.windowRef.closed) {
        list.push(key);
      } else {
        this.openWindows.delete(key);
      }
    });
    return list;
  }
}

export const multiMonitorSync = new MultiMonitorService();
