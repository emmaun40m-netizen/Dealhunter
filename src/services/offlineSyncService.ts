// DealHunter AI Offline Action Queue & Background Sync Manager
export type OfflineActionType =
  | "DEAL_APPROVAL"
  | "DEAL_REJECTION"
  | "CONTRACT_UPDATE"
  | "CONTRACT_DRAFT"
  | "CONTRACT_SIGN"
  | "CONTRACT_DISPATCH"
  | "OUTREACH_SEND"
  | "OUTREACH_DRAFT"
  | "SELLER_UPDATE"
  | "INSPECTION_UPDATE"
  | "DEAL_STAGE_UPDATE"
  | "DEAL_ANALYSIS"
  | "CONFIG_UPDATE"
  | "REALIZED_DEAL"
  | "CUSTOM_ACTION";

export interface OfflineAction {
  id: string;
  type: OfflineActionType;
  title: string;
  endpoint: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE" | "GET";
  body?: any;
  headers?: Record<string, string>;
  status: "PENDING" | "SYNCING" | "SYNCED" | "FAILED";
  createdAt: string;
  syncedAt?: string;
  retryCount: number;
  lastError?: string;
  metadata?: {
    entityId?: string;
    propertyName?: string;
    amount?: number;
    recipient?: string;
    [key: string]: any;
  };
}

export interface OfflineSyncState {
  isOnline: boolean;
  isPWAReady: boolean;
  isSyncing: boolean;
  hasBackgroundSync: boolean;
  lastSyncTimestamp: string | null;
  lastPrefetchTimestamp: string | null;
  actions: OfflineAction[];
  pendingCount: number;
  cachedEndpointsCount: number;
}

const STORAGE_KEY = "dealhunter_offline_actions_v2";
const DB_NAME = "dealhunter_offline_db";
const DB_VERSION = 1;
const STORE_NAME = "offline_actions";

class OfflineSyncService {
  private actions: OfflineAction[] = [];
  private isOnline: boolean = typeof navigator !== "undefined" ? navigator.onLine : true;
  private isPWAReady: boolean = false;
  private isSyncing: boolean = false;
  private hasBackgroundSync: boolean = false;
  private lastSyncTimestamp: string | null = null;
  private lastPrefetchTimestamp: string | null = null;
  private cachedEndpointsCount: number = 24;
  private listeners: Set<(state: OfflineSyncState) => void> = new Set();
  private db: IDBDatabase | null = null;
  private dbInitPromise: Promise<IDBDatabase | null> | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromLocalStorage();
      this.initIndexedDB().then(() => {
        this.syncActionsFromDB();
      });

      // Listen to window online/offline network changes
      window.addEventListener("online", this.handleNetworkOnline.bind(this));
      window.addEventListener("offline", this.handleNetworkOffline.bind(this));

      // Listen to Service Worker messages
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("message", this.handleServiceWorkerMessage.bind(this));

        // Check if PWA and ServiceWorker are ready
        navigator.serviceWorker.ready.then((reg) => {
          this.isPWAReady = true;
          this.hasBackgroundSync = "sync" in reg;
          this.notify();

          // Trigger background pre-fetch during idle time
          this.scheduleIdlePrefetch();
        });
      }

      // Check Background Sync support
      if (typeof window !== "undefined" && "SyncManager" in window) {
        this.hasBackgroundSync = true;
      }
    }
  }

  // --- IndexedDB Management ---
  private initIndexedDB(): Promise<IDBDatabase | null> {
    if (this.dbInitPromise) return this.dbInitPromise;

    this.dbInitPromise = new Promise((resolve) => {
      if (typeof indexedDB === "undefined") {
        resolve(null);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("status", "status", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = (err) => {
        console.warn("[OfflineSync] IndexedDB initialization warning:", err);
        resolve(null);
      };
    });

    return this.dbInitPromise;
  }

  private async syncActionsFromDB() {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return;

    try {
      const tx = this.db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const dbActions: OfflineAction[] = req.result || [];
        if (dbActions.length > 0) {
          // Merge with memory/localStorage
          const map = new Map<string, OfflineAction>();
          this.actions.forEach((a) => map.set(a.id, a));
          dbActions.forEach((a) => map.set(a.id, a));
          this.actions = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.saveToLocalStorage();
          this.notify();
        }
      };
    } catch (err) {
      console.warn("[OfflineSync] Error reading DB:", err);
    }
  }

  private async writeActionToDB(action: OfflineAction) {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return;

    try {
      const tx = this.db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(action);
    } catch (err) {
      console.warn("[OfflineSync] Error writing action to DB:", err);
    }
  }

  private async removeActionFromDB(id: string) {
    if (!this.db) await this.initIndexedDB();
    if (!this.db) return;

    try {
      const tx = this.db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
    } catch (err) {
      console.warn("[OfflineSync] Error removing action from DB:", err);
    }
  }

  // --- Local Storage Management ---
  private loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.actions = JSON.parse(raw);
      }
    } catch (e) {
      console.warn("[OfflineSync] Failed to read from localStorage:", e);
      this.actions = [];
    }
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.actions));
    } catch (e) {
      console.warn("[OfflineSync] Failed to write to localStorage:", e);
    }
  }

  // --- Service Worker Event Handlers ---
  private handleServiceWorkerMessage(event: MessageEvent) {
    const data = event.data;
    if (!data) return;

    if (data.type === "BACKGROUND_SYNC_TRIGGERED") {
      this.isSyncing = true;
      this.notify();
    } else if (data.type === "BACKGROUND_SYNC_COMPLETED") {
      this.isSyncing = false;
      this.lastSyncTimestamp = new Date().toISOString();
      this.syncActionsFromDB();
      this.notify();
    } else if (data.type === "CACHE_PREFETCH_COMPLETED") {
      this.lastPrefetchTimestamp = data.timestamp || new Date().toISOString();
      this.cachedEndpointsCount = data.cachedCount || 24;
      this.isPWAReady = true;
      this.notify();
    } else if (data.type === "SW_STATUS_RESPONSE") {
      this.isPWAReady = data.isPWAReady ?? true;
      this.hasBackgroundSync = data.hasBackgroundSync ?? this.hasBackgroundSync;
      this.notify();
    }
  }

  private handleNetworkOnline() {
    this.isOnline = true;
    console.log("[OfflineSync] Device is ONLINE. Triggering automatic background sync queue replay...");
    this.notify();
    this.processQueue();
    this.requestBackgroundSync();
  }

  private handleNetworkOffline() {
    this.isOnline = false;
    console.log("[OfflineSync] Device went OFFLINE. Actions will be queued in local storage.");
    this.notify();
  }

  // --- Registration of Background Sync API ---
  public async requestBackgroundSync(): Promise<boolean> {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      if ("sync" in registration) {
        // Register the background sync event tag
        await (registration as any).sync.register("dealhunter-sync-actions");
        console.log("[OfflineSync] Background Sync registered successfully (dealhunter-sync-actions)");
        this.hasBackgroundSync = true;
        this.notify();
        return true;
      }
    } catch (err) {
      console.warn("[OfflineSync] Background Sync registration warning:", err);
    }
    return false;
  }

  // --- Pre-fetch Strategy during Idle Time ---
  public scheduleIdlePrefetch() {
    if (typeof window === "undefined") return;

    const runPrefetch = () => {
      this.triggerPrefetch();
    };

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(runPrefetch, { timeout: 3000 });
    } else {
      setTimeout(runPrefetch, 1500);
    }
  }

  public triggerPrefetch() {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "TRIGGER_PREFETCH",
      });
      console.log("[OfflineSync] Dispatched TRIGGER_PREFETCH to Service Worker.");
    }
  }

  // --- Enqueue Action with Optimistic Execution or Offline Queuing ---
  public async enqueueAction(
    actionData: Omit<OfflineAction, "id" | "status" | "createdAt" | "retryCount">
  ): Promise<{ action: OfflineAction; executedOnline: boolean; response?: any }> {
    const actionId = `act-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const action: OfflineAction = {
      ...actionData,
      id: actionId,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };

    // If currently online, attempt immediate execution
    if (this.isOnline) {
      try {
        const fetchOptions: RequestInit = {
          method: action.method,
          headers: {
            "Content-Type": "application/json",
            ...(action.headers || {}),
          },
        };
        if (action.body && action.method !== "GET") {
          fetchOptions.body = typeof action.body === "string" ? action.body : JSON.stringify(action.body);
        }

        const res = await fetch(action.endpoint, fetchOptions);
        if (res.ok) {
          const data = await res.json();
          action.status = "SYNCED";
          action.syncedAt = new Date().toISOString();
          
          this.actions.unshift(action);
          this.saveToLocalStorage();
          this.writeActionToDB(action);
          this.notify();

          return { action, executedOnline: true, response: data };
        } else {
          // Non-200 response -> queue for retry
          action.status = "PENDING";
          action.lastError = `HTTP ${res.status}: ${res.statusText}`;
        }
      } catch (err: any) {
        console.warn("[OfflineSync] Online fetch failed, storing in offline queue:", err);
        action.status = "PENDING";
        action.lastError = err.message || "Network error";
      }
    }

    // Save to Offline Queue
    this.actions.unshift(action);
    this.saveToLocalStorage();
    this.writeActionToDB(action);
    this.notify();

    // Register Background Sync if available
    this.requestBackgroundSync();

    return { action, executedOnline: false };
  }

  // --- Process and Replay Pending Actions Queue ---
  public async processQueue(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) return { synced: 0, failed: 0 };
    if (!this.isOnline) {
      console.log("[OfflineSync] Cannot process queue while offline.");
      return { synced: 0, failed: 0 };
    }

    const pending = this.actions.filter((a) => a.status === "PENDING" || a.status === "FAILED");
    if (pending.length === 0) {
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.notify();

    let synced = 0;
    let failed = 0;

    for (const action of pending) {
      try {
        action.status = "SYNCING";
        this.saveToLocalStorage();
        this.writeActionToDB(action);
        this.notify();

        const fetchOptions: RequestInit = {
          method: action.method,
          headers: {
            "Content-Type": "application/json",
            "X-DealHunter-Offline-Sync": "true",
            ...(action.headers || {}),
          },
        };

        if (action.body && action.method !== "GET") {
          fetchOptions.body = typeof action.body === "string" ? action.body : JSON.stringify(action.body);
        }

        const res = await fetch(action.endpoint, fetchOptions);
        if (res.ok) {
          action.status = "SYNCED";
          action.syncedAt = new Date().toISOString();
          action.lastError = undefined;
          synced++;
        } else {
          action.status = "FAILED";
          action.retryCount = (action.retryCount || 0) + 1;
          action.lastError = `HTTP ${res.status}: ${res.statusText}`;
          failed++;
        }
      } catch (err: any) {
        action.status = "FAILED";
        action.retryCount = (action.retryCount || 0) + 1;
        action.lastError = err.message || "Network sync failed";
        failed++;
      }

      this.saveToLocalStorage();
      this.writeActionToDB(action);
      this.notify();
    }

    this.isSyncing = false;
    this.lastSyncTimestamp = new Date().toISOString();
    this.notify();

    // Trigger pre-fetch update of fresh data
    this.triggerPrefetch();

    return { synced, failed };
  }

  // --- Action Item Controls ---
  public async retryAction(id: string): Promise<boolean> {
    const action = this.actions.find((a) => a.id === id);
    if (!action) return false;

    action.status = "PENDING";
    this.saveToLocalStorage();
    this.writeActionToDB(action);
    this.notify();

    if (this.isOnline) {
      await this.processQueue();
      return true;
    } else {
      this.requestBackgroundSync();
      return false;
    }
  }

  public deleteAction(id: string) {
    this.actions = this.actions.filter((a) => a.id !== id);
    this.saveToLocalStorage();
    this.removeActionFromDB(id);
    this.notify();
  }

  public clearCompleted() {
    this.actions = this.actions.filter((a) => a.status !== "SYNCED");
    this.saveToLocalStorage();
    this.notify();
  }

  public clearAll() {
    this.actions = [];
    this.saveToLocalStorage();
    this.notify();
  }

  // --- Subscriptions & State ---
  public subscribe(listener: (state: OfflineSyncState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (e) {
        console.error("[OfflineSync] Listener error:", e);
      }
    });
  }

  public getState(): OfflineSyncState {
    const pendingCount = this.actions.filter(
      (a) => a.status === "PENDING" || a.status === "FAILED" || a.status === "SYNCING"
    ).length;

    return {
      isOnline: this.isOnline,
      isPWAReady: this.isPWAReady,
      isSyncing: this.isSyncing,
      hasBackgroundSync: this.hasBackgroundSync,
      lastSyncTimestamp: this.lastSyncTimestamp,
      lastPrefetchTimestamp: this.lastPrefetchTimestamp,
      actions: [...this.actions],
      pendingCount,
      cachedEndpointsCount: this.cachedEndpointsCount,
    };
  }
}

export const offlineSync = new OfflineSyncService();
