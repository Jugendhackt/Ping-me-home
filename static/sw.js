const CACHE_NAME = 'jhcgn-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json'
];

// Install event - cache only essential static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching essential static assets only');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - minimal caching strategy
self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  
  // Only cache specific static assets, not application routes
  const isStaticAsset = url.pathname === '/' || 
                       url.pathname === '/manifest.json' ||
                       url.pathname.startsWith('/favicon') ||
                       url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/);
  
  // For application routes (/app, /login, /register, /api/*), always fetch fresh
  const isAppRoute = url.pathname.startsWith('/app') || 
                    url.pathname.startsWith('/login') || 
                    url.pathname.startsWith('/register') ||
                    url.pathname.startsWith('/api/');

  if (isAppRoute) {
    // Always fetch application routes fresh (no caching)
    console.log('Service Worker: Fetching app route fresh (no cache):', event.request.url);
    event.respondWith(fetch(event.request));
    return;
  }

  // Only use cache-first strategy for static assets
  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            console.log('Service Worker: Serving static asset from cache:', event.request.url);
            return response;
          }

          console.log('Service Worker: Fetching static asset from network:', event.request.url);
          return fetch(event.request)
            .then((response) => {
              // Only cache successful responses for static assets
              if (response && response.status === 200 && response.type === 'basic') {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return response;
            });
        })
        .catch((error) => {
          console.error('Service Worker: Static asset fetch failed:', error);
          throw error;
        })
    );
  }
});
