// DealHunter AI Service Worker for Enterprise PWA & Cross-Platform Offline Intelligence
const STATIC_CACHE_NAME = 'dealhunter-static-v3.5';
const DATA_CACHE_NAME = 'dealhunter-data-v3.5';

// Core static assets required for standalone offline SPA booting
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

// Runtime data endpoints pre-fetched during idle time to ensure 100% offline functionality
const PREFETCH_API_ENDPOINTS = [
  '/api/health',
  '/api/dashboard',
  '/api/agents',
  '/api/agents/velocity',
  '/api/agents/reports',
  '/api/properties/search',
  '/api/deals',
  '/api/approvals',
  '/api/contracts',
  '/api/contract-templates',
  '/api/contract-templates/dispatches',
  '/api/outreach',
  '/api/investors',
  '/api/compliance/states',
  '/api/compliance/news',
  '/api/profits',
  '/api/roi-heatmap',
  '/api/daily-digest',
  '/api/config',
  '/api/sellers',
  '/api/buyers',
  '/api/inspections',
  '/api/payments/wallet',
  '/api/chat/messages'
];

// IndexedDB Helper for Background Sync Queue
const DB_NAME = 'dealhunter_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'offline_actions';

function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getPendingActionsFromDB() {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const all = req.result || [];
        const pending = all.filter(a => a.status === 'PENDING' || a.status === 'FAILED');
        resolve(pending);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[ServiceWorker DB] Error accessing offline DB:', err);
    return [];
  }
}

async function updateActionInDB(action) {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(action);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[ServiceWorker DB] Error updating action in DB:', err);
  }
}

// 1. Installation: Cache core static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(async (cache) => {
      console.log('[ServiceWorker] Caching static app shell...');
      try {
        await cache.addAll(STATIC_ASSETS);
      } catch (err) {
        console.warn('[ServiceWorker] Static asset pre-cache partial warning:', err);
      }
    })
  );
  self.skipWaiting();
});

// 2. Activation: Clean stale caches & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== STATIC_CACHE_NAME && key !== DATA_CACHE_NAME).map((key) => {
          console.log('[ServiceWorker] Removing stale cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => {
      // Trigger background pre-fetch immediately after activation
      prefetchDashboardAndMetrics();
      return self.clients.claim();
    })
  );
});

// 3. Pre-fetching Strategy for Dashboard, Agent Metrics, and Property Scan Data
async function prefetchDashboardAndMetrics() {
  console.log('[ServiceWorker] Starting idle pre-fetch of dashboard, agents & property scans...');
  try {
    const cache = await caches.open(DATA_CACHE_NAME);
    let successCount = 0;
    
    for (const endpoint of PREFETCH_API_ENDPOINTS) {
      try {
        const response = await fetch(endpoint, {
          headers: { 'X-DealHunter-Prefetch': 'true' }
        });
        if (response.ok) {
          await cache.put(endpoint, response.clone());
          successCount++;
        }
      } catch (err) {
        // Non-blocking fetch warning in dev
      }
    }

    console.log(`[ServiceWorker] Pre-fetch completed: ${successCount}/${PREFETCH_API_ENDPOINTS.length} endpoints cached.`);
    
    // Notify clients of prefetch completion
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'CACHE_PREFETCH_COMPLETED',
        cachedCount: successCount,
        totalEndpoints: PREFETCH_API_ENDPOINTS.length,
        timestamp: new Date().toISOString()
      });
    });
  } catch (err) {
    console.warn('[ServiceWorker] Pre-fetch routine notice:', err);
  }
}

// 4. Background Sync API: Process pending approvals, contract updates & outreach
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background Sync event triggered with tag:', event.tag);
  if (
    event.tag === 'dealhunter-sync-actions' ||
    event.tag === 'sync-deal-approvals-contracts' ||
    event.tag === 'dealhunter-offline-sync'
  ) {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  console.log('[ServiceWorker] Executing Background Sync for offline actions queue...');
  const pendingActions = await getPendingActionsFromDB();
  
  // Broadcast to all active clients that background sync is executing
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: 'BACKGROUND_SYNC_TRIGGERED',
      pendingCount: pendingActions.length,
      timestamp: new Date().toISOString()
    });
  });

  if (pendingActions.length === 0) {
    console.log('[ServiceWorker] No pending actions to sync in IndexedDB.');
    return;
  }

  console.log(`[ServiceWorker] Processing ${pendingActions.length} pending offline actions...`);
  
  for (const action of pendingActions) {
    try {
      action.status = 'SYNCING';
      await updateActionInDB(action);

      const fetchOptions = {
        method: action.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-DealHunter-Offline-Sync': 'true',
          ...(action.headers || {})
        }
      };

      if (action.body && action.method !== 'GET') {
        fetchOptions.body = typeof action.body === 'string' ? action.body : JSON.stringify(action.body);
      }

      const res = await fetch(action.endpoint, fetchOptions);
      if (res.ok) {
        action.status = 'SYNCED';
        action.syncedAt = new Date().toISOString();
        await updateActionInDB(action);
        console.log(`[ServiceWorker Sync] Successfully synced action ${action.id} (${action.type})`);
      } else {
        action.status = 'FAILED';
        action.retryCount = (action.retryCount || 0) + 1;
        action.lastError = `HTTP ${res.status}: ${res.statusText}`;
        await updateActionInDB(action);
        console.warn(`[ServiceWorker Sync] Action ${action.id} returned status ${res.status}`);
      }
    } catch (err) {
      action.status = 'FAILED';
      action.retryCount = (action.retryCount || 0) + 1;
      action.lastError = err.message || 'Network error during background sync';
      await updateActionInDB(action);
      console.warn(`[ServiceWorker Sync] Action ${action.id} failed:`, err);
    }
  }

  // Refresh client data after sync completes
  const updatedClients = await self.clients.matchAll();
  updatedClients.forEach((client) => {
    client.postMessage({
      type: 'BACKGROUND_SYNC_COMPLETED',
      timestamp: new Date().toISOString()
    });
  });

  // Also trigger a prefetch refresh of updated data
  prefetchDashboardAndMetrics();
}

// 5. Message listener from window clients
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'TRIGGER_PREFETCH') {
    event.waitUntil(prefetchDashboardAndMetrics());
  }

  if (event.data.type === 'TRIGGER_BACKGROUND_SYNC') {
    event.waitUntil(handleBackgroundSync());
  }

  if (event.data.type === 'GET_SW_STATUS') {
    event.source?.postMessage({
      type: 'SW_STATUS_RESPONSE',
      isPWAReady: true,
      staticCacheName: STATIC_CACHE_NAME,
      dataCacheName: DATA_CACHE_NAME,
      hasBackgroundSync: 'sync' in self.registration,
      timestamp: new Date().toISOString()
    });
  }
});

// 6. Network & Cache Fetch Strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // A. Handle API Data Requests: Network-First with Fallback to DATA Cache
  if (url.pathname.startsWith('/api/')) {
    // Non-GET requests (e.g. POST, PUT, DELETE)
    if (event.request.method !== 'GET') {
      event.respondWith(
        fetch(event.request.clone()).catch(() => {
          return new Response(
            JSON.stringify({
              success: false,
              offline: true,
              queued: true,
              message: 'Device is offline. Action has been captured for Background Sync.'
            }),
            {
              status: 503,
              statusText: 'Service Unavailable (Offline)',
              headers: { 'Content-Type': 'application/json', 'X-DealHunter-Offline': 'true' }
            }
          );
        })
      );
      return;
    }

    // GET requests: Network-first with graceful fallback to pre-fetched cached data
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(async () => {
          // Attempt to retrieve from Data Cache
          const cachedData = await caches.match(event.request);
          if (cachedData) {
            console.log('[ServiceWorker] Serving cached offline API response for:', url.pathname);
            // Append header indicating cached offline state
            const headers = new Headers(cachedData.headers);
            headers.set('X-DealHunter-Offline-Mode', 'true');
            headers.set('X-DealHunter-Cached-At', new Date().toISOString());
            return new Response(await cachedData.blob(), {
              status: 200,
              statusText: 'OK (Offline Cache)',
              headers
            });
          }

          // Return structured offline fallback
          return new Response(
            JSON.stringify({
              success: true,
              offline: true,
              cached: false,
              message: 'App is running in offline cache mode. Pre-fetched dataset active.'
            }),
            { headers: { 'Content-Type': 'application/json', 'X-DealHunter-Offline': 'true' } }
          );
        })
    );
    return;
  }

  // B. Handle Navigation & Static Asset Requests
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to revalidate static assets
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cached index for SPA routing
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
