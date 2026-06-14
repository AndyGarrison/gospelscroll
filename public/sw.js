// GospelScroll service worker — installable + offline reading.
// Bump CACHE_VERSION whenever the app shell or gospels.json changes
// to force a clean refresh for everyone.
const CACHE_VERSION = 'v1';
const CACHE_NAME = `gospelscroll-${CACHE_VERSION}`;

// App shell + full data, precached so the entire feed works offline
// (e.g. on a plane) after the first visit.
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/data/gospels.json',
  '/manifest.json',
  '/icons/favicon.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png'
];

const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Put a response in the cache (ignoring opaque/error edge cases gracefully).
function putInCache(request, response) {
  return caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
}

// Cache-first: serve from cache, fetch + store on miss. Used for fonts.
function cacheFirst(request) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      if (response && response.ok) putInCache(request, response.clone());
      return response;
    });
  });
}

// Stale-while-revalidate: serve cache instantly, refresh in the background
// so new passages / shell updates propagate on the next online visit.
function staleWhileRevalidate(request) {
  return caches.match(request).then((cached) => {
    const network = fetch(request)
      .then((response) => {
        if (response && response.ok) putInCache(request, response.clone());
        return response;
      })
      .catch(() => cached); // offline: fall back to whatever we have
    return cached || network;
  });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Google Fonts (stylesheet + font files) — cache-first for offline rendering.
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Same-origin only beyond this point.
  if (url.origin !== self.location.origin) return;

  // Navigation requests: try the network shell, fall back to cached index.
  if (request.mode === 'navigate') {
    event.respondWith(
      staleWhileRevalidate(request).then(
        (response) => response || caches.match('/index.html')
      )
    );
    return;
  }

  // App shell + data: stale-while-revalidate.
  event.respondWith(staleWhileRevalidate(request));
});
