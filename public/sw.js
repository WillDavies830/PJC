const CACHE_VERSION = 'v5';
const CACHE_NAME = `race-control-${CACHE_VERSION}`;
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/timer.js',
  '/offline.js',
  '/manifest.json',
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app assets');
        return cache.addAll(ASSETS_TO_CACHE);
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('race-control-') &&
                 cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Deleting outdated cache:', cacheName);
          return caches.delete(cacheName);
        }),
      );
    }),
  );
});

// Fetch event - network-first for JS/CSS/HTML, cache-first for other resources
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For API requests, try network first, then fallback to offline handling
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If it's a GET request, we might have cached the response
          if (event.request.method === 'GET') {
            return caches.match(event.request);
          }

          // For other methods (POST, PUT), we can't really handle them offline
          // Just return a simple JSON indicating we're offline
          return new Response(
            JSON.stringify({
              error: 'You are currently offline',
              offline: true,
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }),
    );
  // For JavaScript, CSS, and HTML files, use network-first approach
  } else if (event.request.url.endsWith('.js') ||
           event.request.url.endsWith('.css') ||
           event.request.url.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Update the cache with the new version
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fall back to cache if offline
          return caches.match(event.request);
        }),
    );
  // For other resources, use cache-first strategy
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request)
            .then(fetchResponse => {
              // Cache other resources too
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
              return fetchResponse;
            });
        }),
    );
  }
});

// Handle messages from the client
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
