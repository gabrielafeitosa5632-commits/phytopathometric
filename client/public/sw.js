/**
 * PhytoPathometric — Service Worker
 * Offline-first caching strategy:
 * - App shell (HTML, JS, CSS): Cache First
 * - API calls: Network First with offline fallback
 * - Images: Cache First with network fallback
 * - Weather / external APIs: Network Only (graceful fail)
 */

const CACHE_NAME = 'phyto-v1';
const STATIC_CACHE = 'phyto-static-v1';
const IMAGE_CACHE  = 'phyto-images-v1';

// App shell assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
];

// ─── Install: pre-cache app shell ─────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Ignore pre-cache errors (some assets may not exist at install time)
      });
    }).then(() => self.skipWaiting())
  );
});

// ─── Activate: clean old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const validCaches = [CACHE_NAME, STATIC_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => !validCaches.includes(name))
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch: routing strategy ──────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET, chrome-extension, and manus debug requests
  if (event.request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.pathname.startsWith('/__manus__')) return;

  // API calls: Network First → offline fallback JSON
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstApi(event.request));
    return;
  }

  // External APIs (weather, maps): Network Only — graceful fail
  if (!url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
    event.respondWith(networkOnlyExternal(event.request));
    return;
  }

  // JS/CSS/fonts: Cache First (static assets with hash)
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|eot)(\?|$)/) ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(cacheFirstStatic(event.request));
    return;
  }

  // Images: Cache First
  if (url.pathname.match(/\.(png|jpe?g|webp|gif|svg|ico)(\?|$)/)) {
    event.respondWith(cacheFirstImages(event.request));
    return;
  }

  // HTML / navigation: Network First → cached index.html (SPA fallback)
  event.respondWith(networkFirstHtml(event.request));
});

// ─── Strategy: Network First for API ─────────────────────────────────────────
async function networkFirstApi(request) {
  try {
    const response = await fetch(request.clone(), { signal: AbortSignal.timeout(8000) });
    return response;
  } catch {
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'You are offline. AI analysis requires internet connection.',
        fallback_available: true,
        offline: true,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ─── Strategy: Network Only for external ──────────────────────────────────────
async function networkOnlyExternal(request) {
  try {
    return await fetch(request.clone(), { signal: AbortSignal.timeout(6000) });
  } catch {
    return new Response('', { status: 408 });
  }
}

// ─── Strategy: Cache First for static assets ─────────────────────────────────
async function cacheFirstStatic(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request.clone());
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 404 });
  }
}

// ─── Strategy: Cache First for images ────────────────────────────────────────
async function cacheFirstImages(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request.clone());
    if (response.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 404 });
  }
}

// ─── Strategy: Network First for HTML / SPA navigation ───────────────────────
async function networkFirstHtml(request) {
  try {
    const response = await fetch(request.clone(), { signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline → serve cached page or index.html (SPA shell)
    const cached =
      (await caches.match(request)) ||
      (await caches.match('/index.html')) ||
      (await caches.match('/'));

    if (cached) return cached;
    return new Response('<h1>Offline</h1><p>Please reconnect.</p>', {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
