/**
 * Service Worker for Historical World Map
 * Provides offline caching and improved performance for GeoJSON data files
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE_NAME = `historical-map-static-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `historical-map-data-${CACHE_VERSION}`;

// Static assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/base.css',
    '/css/layout.css',
    '/css/components.css',
    '/css/map.css',
    '/css/responsive.css',
    '/js/constants.js',
    '/js/utils.js',
    '/js/validators.js',
    '/js/ErrorHandler.js',
    '/js/ConfigurationService.js',
    '/js/periodsConfig.js',
    '/js/EventBus.js',
    '/js/DataManager.js',
    '/js/MapRenderer.js',
    '/js/UIController.js',
    '/js/EventHandler.js',
    '/js/ErrorNotification.js',
    '/app.js'
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching static assets');
            // Use addAll with error handling
            return cache.addAll(STATIC_ASSETS).catch((error) => {
                console.warn('[Service Worker] Failed to cache some static assets:', error);
                // Continue even if some assets fail
                return Promise.resolve();
            });
        }).then(() => {
            console.log('[Service Worker] Installation complete');
            // Force immediate activation
            return self.skipWaiting();
        })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Activation complete');
            // Take control of all clients immediately
            return self.clients.claim();
        })
    );
});

/**
 * Fetch event - serve from cache when available
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle GeoJSON data files with Cache First strategy
    if (url.pathname.startsWith('/data/') && url.pathname.endsWith('.geojson')) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then((cache) => {
                return cache.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log('[Service Worker] Serving from cache:', url.pathname);
                        return cachedResponse;
                    }

                    // Not in cache, fetch from network
                    console.log('[Service Worker] Fetching from network:', url.pathname);
                    return fetch(request).then((networkResponse) => {
                        // Only cache successful responses
                        if (networkResponse && networkResponse.status === 200) {
                            // Clone response before caching
                            cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch((error) => {
                        console.error('[Service Worker] Fetch failed:', url.pathname, error);
                        // Return offline page or error response
                        return new Response(
                            JSON.stringify({
                                error: 'Network error',
                                message: 'Unable to fetch data. Please check your connection.'
                            }),
                            {
                                status: 503,
                                statusText: 'Service Unavailable',
                                headers: { 'Content-Type': 'application/json' }
                            }
                        );
                    });
                });
            })
        );
        return;
    }

    // Handle static assets with Cache First, fallback to Network
    if (STATIC_ASSETS.includes(url.pathname) || url.pathname === '/') {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request).then((networkResponse) => {
                    // Cache the new response
                    if (networkResponse && networkResponse.status === 200) {
                        return caches.open(STATIC_CACHE_NAME).then((cache) => {
                            cache.put(request, networkResponse.clone());
                            return networkResponse;
                        });
                    }
                    return networkResponse;
                }).catch((error) => {
                    console.error('[Service Worker] Failed to fetch static asset:', url.pathname);
                    return new Response('Offline', { status: 503 });
                });
            })
        );
        return;
    }

    // For all other requests (external resources, tiles, etc.), use Network First
    event.respondWith(
        fetch(request).catch(() => {
            return caches.match(request);
        })
    );
});

/**
 * Message event - handle cache management commands
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            }).then(() => {
                console.log('[Service Worker] All caches cleared');
                // Notify clients
                return self.clients.matchAll().then((clients) => {
                    clients.forEach((client) => {
                        client.postMessage({
                            type: 'CACHE_CLEARED',
                            message: 'All caches have been cleared'
                        });
                    });
                });
            })
        );
    }

    if (event.data && event.data.type === 'GET_CACHE_SIZE') {
        event.waitUntil(
            caches.open(DATA_CACHE_NAME).then((cache) => {
                return cache.keys();
            }).then((keys) => {
                // Send cache size back to client
                return self.clients.matchAll().then((clients) => {
                    clients.forEach((client) => {
                        client.postMessage({
                            type: 'CACHE_SIZE',
                            size: keys.length
                        });
                    });
                });
            })
        );
    }
});
