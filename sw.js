// FleetFinanzas Service Worker — network-first con fallback a cache
const CACHE_VERSION = 'fleet-v4';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/supabase-config.js',
  '/manifest.json',
  '/icon.svg',
  '/fleetcost/',
  '/fleetcost/index.html',
  '/fleetcost/css/styles.css',
  '/fleetcost/js/app.js'
];

// Instalar y precachear assets críticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache =>
      cache.addAll(CORE_ASSETS).catch(err => console.warn('SW precache parcial:', err))
    )
  );
  self.skipWaiting();
});

// Limpiar caches viejos al activar
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia: network-first, cache como fallback
// Esto asegura que siempre que haya internet, el usuario reciba la última versión.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // No interceptar Supabase ni APIs externas
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then(response => {
        // Solo cachear respuestas exitosas
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(req, clone));
        }
        return response;
      })
      .catch(() => caches.match(req).then(cached => cached || caches.match('/index.html')))
  );
});
