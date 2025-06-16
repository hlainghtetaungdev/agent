// Enhanced Service Worker with Auto-Update and Cache Management
const CACHE_NAME = 'bp-portal-gold-v3.5';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/Betting Paradise Logo.png',
  '/Betting Paradise Logo PNG White.png',
  '/M2P Logo PNG White.png',
  '/YG Logo PNG White.png',
  '/handshake (1).png',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// ===== Installation Phase =====
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker version:', CACHE_NAME);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching core assets');
        return cache.addAll(ASSETS)
          .then(() => {
            console.log('[SW] All assets cached');
            return self.skipWaiting();
          })
          .catch(err => {
            console.error('[SW] Cache addAll error:', err);
          });
      })
  );
});

// ===== Activation Phase =====
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// ===== Fetch Strategy =====
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Skip non-GET requests and external URLs
  if (event.request.method !== 'GET' || 
      requestUrl.origin !== self.location.origin) {
    return;
  }

  // Network First for HTML
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetchAndCache(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache First for other assets
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        return cachedResponse || fetchAndCache(event.request);
      })
  );
});

// Helper function for network requests with caching
function fetchAndCache(request) {
  return fetch(request).then(networkResponse => {
    // Only cache successful responses
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(request, responseToCache);
        console.log('[SW] Cached new resource:', request.url);
      });
    }
    return networkResponse;
  });
}

// ===== Update Management =====
self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    console.log('[SW] Skipping waiting phase');
    self.skipWaiting();
  }
});

// Background sync example
self.addEventListener('sync', (event) => {
  if (event.tag === 'update-content') {
    console.log('[SW] Background sync triggered');
    // Add your background sync logic here
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() || { 
    title: 'New Update', 
    body: 'New content is available!' 
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/Betting Paradise Logo.png',
      badge: '/Betting Paradise Logo.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});