/**
 * Service Worker for MediVerse PWA
 * Handles caching of Unity builds and offline support
 */

const CACHE_VERSION = "v1.0.0";
const UNITY_CACHE = `unity-builds-${CACHE_VERSION}`;
const STATIC_CACHE = `static-assets-${CACHE_VERSION}`;
const API_CACHE = `api-responses-${CACHE_VERSION}`;

// Files to cache immediately on install
const STATIC_ASSETS = ["/", "/index.html", "/favicon.ico", "/manifest.json"];

// Unity build files (large, cache on first request)
const UNITY_FILES_PATTERNS = [
  /\/unity\/.*\/Build\/.*\.js$/,
  /\/unity\/.*\/Build\/.*\.unityweb$/,
  /\/unity\/.*\/Build\/.*\.wasm$/,
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== UNITY_CACHE &&
              cacheName !== STATIC_CACHE &&
              cacheName !== API_CACHE
            ) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests
  if (request.method !== "GET") return;

  // Ignore chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith("http")) return;

  // Strategy 1: Unity files - Cache First (for offline support)
  if (isUnityFile(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, UNITY_CACHE));
    return;
  }

  // Strategy 2: API calls - Network First with cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Strategy 3: Static assets - Cache First
  event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
});

/**
 * Check if URL is a Unity build file
 */
function isUnityFile(pathname) {
  return UNITY_FILES_PATTERNS.some((pattern) => pattern.test(pathname));
}

/**
 * Cache First Strategy
 * Try cache first, fallback to network, then cache the response
 */
async function cacheFirstStrategy(request, cacheName) {
  try {
    // Try to get from cache
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      console.log("[SW] Cache hit:", request.url);
      return cachedResponse;
    }

    // Cache miss - fetch from network
    console.log("[SW] Cache miss, fetching:", request.url);
    const networkResponse = await fetch(request);

    // Cache the response if successful
    if (networkResponse.ok) {
      // Clone the response as it can only be consumed once
      cache.put(request, networkResponse.clone());
      console.log("[SW] Cached:", request.url);
    }

    return networkResponse;
  } catch (error) {
    console.error("[SW] Fetch failed:", request.url, error);
    // Return offline fallback if available
    return new Response("Offline - content not available", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

/**
 * Network First Strategy
 * Try network first, fallback to cache if offline
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed - try cache
    console.log("[SW] Network failed, trying cache:", request.url);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      console.log("[SW] Serving from cache:", request.url);
      return cachedResponse;
    }

    // Both failed
    return new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Message handler for cache management
 */
self.addEventListener("message", (event) => {
  if (event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(cacheNames.map((name) => caches.delete(name)))
        )
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
    );
  }

  if (event.data.type === "GET_CACHE_SIZE") {
    event.waitUntil(
      getCacheSize().then((size) => {
        event.ports[0].postMessage({ size });
      })
    );
  }

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/**
 * Calculate total cache size
 */
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}

/**
 * Background sync for updates (future enhancement)
 */
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-unity-build") {
    event.waitUntil(syncUnityBuild());
  }
});

async function syncUnityBuild() {
  console.log("[SW] Syncing Unity build in background...");
  // Implement background update logic here
}

