// Service Worker for zktheory mathematical platform
// Implements offline-first caching for mathematical tools and content

const CACHE_NAME = 'zktheory-math-v1';
const STATIC_ASSETS = [
  '/tda_rust_core_bg.wasm',
  '/tda_rust_core.js',
  '/fonts/math-fonts.woff2',
  '/images/abstract-features/',
  '/images/abstract-background.svg',
  '/images/abstract-feature-cayley.svg',
  '/images/abstract-feature-tda.svg'
];

// Mathematical content cache names
const MATH_CACHE = 'zktheory-math-content-v1';
const DOCS_CACHE = 'zktheory-docs-v1';
const API_CACHE = 'zktheory-api-v1';

// Caching strategies for different content types
const strategies = {
  mathematical: 'cache-first',
  documentation: 'stale-while-revalidate',
  api: 'network-first',
  static: 'cache-first'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== MATH_CACHE && 
                cacheName !== DOCS_CACHE && 
                cacheName !== API_CACHE) {
              console.log(`🗑️ Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated and old caches cleaned');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Determine content type and strategy
  const contentType = getContentType(url);
  const strategy = strategies[contentType] || 'network-first';
  
  console.log(`🌐 Fetching: ${url.pathname} (${contentType} - ${strategy})`);

  switch (strategy) {
    case 'cache-first':
      event.respondWith(cacheFirst(request, contentType));
      break;
    case 'network-first':
      event.respondWith(networkFirst(request, contentType));
      break;
    case 'stale-while-revalidate':
      event.respondWith(staleWhileRevalidate(request, contentType));
      break;
    default:
      event.respondWith(networkFirst(request, contentType));
  }
});

// Cache-first strategy for mathematical tools and static assets
async function cacheFirst(request, contentType) {
  try {
    const cache = await caches.open(getCacheName(contentType));
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log(`✅ Cache hit: ${request.url}`);
      return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response for future use
      await cache.put(request, networkResponse.clone());
      console.log(`💾 Cached: ${request.url}`);
    }
    
    return networkResponse;
  } catch (error) {
    console.error(`❌ Cache-first strategy failed for ${request.url}:`, error);
    
    // Fallback to network
    try {
      return await fetch(request);
    } catch (networkError) {
      console.error(`❌ Network fallback also failed for ${request.url}:`, networkError);
      return new Response('Offline - Content not available', { status: 503 });
    }
  }
}

// Network-first strategy for API calls and dynamic content
async function networkFirst(request, contentType) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(getCacheName(contentType));
      await cache.put(request, networkResponse.clone());
      console.log(`💾 Cached API response: ${request.url}`);
      return networkResponse;
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`);
  } catch (error) {
    console.log(`🌐 Network failed for ${request.url}, trying cache...`);
    
    // Fallback to cache
    const cache = await caches.open(getCacheName(contentType));
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log(`✅ Cache fallback hit: ${request.url}`);
      return cachedResponse;
    }
    
    // No cache available, return offline response
    console.log(`❌ No cache available for ${request.url}`);
    return new Response('Offline - Content not available', { status: 503 });
  }
}

// Stale-while-revalidate strategy for documentation
async function staleWhileRevalidate(request, contentType) {
  try {
    const cache = await caches.open(getCacheName(contentType));
    const cachedResponse = await cache.match(request);
    
    // Return cached response immediately if available
    if (cachedResponse) {
      console.log(`✅ Returning stale content: ${request.url}`);
      
      // Update cache in background
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(request, networkResponse);
            console.log(`🔄 Updated cache in background: ${request.url}`);
          }
        })
        .catch((error) => {
          console.log(`⚠️ Background update failed for ${request.url}:`, error);
        });
      
      return cachedResponse;
    }
    
    // No cache, fetch and cache
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      console.log(`💾 Cached new content: ${request.url}`);
    }
    
    return networkResponse;
  } catch (error) {
    console.error(`❌ Stale-while-revalidate failed for ${request.url}:`, error);
    
    // Try cache as last resort
    const cache = await caches.open(getCacheName(contentType));
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline - Content not available', { status: 503 });
  }
}

// Background sync for mathematical computations
self.addEventListener('sync', (event) => {
  console.log(`🔄 Background sync triggered: ${event.tag}`);
  
  if (event.tag === 'math-computation-sync') {
    event.waitUntil(syncMathematicalComputations());
  } else if (event.tag === 'content-sync') {
    event.waitUntil(syncMathematicalContent());
  } else if (event.tag === 'cache-warming-sync') {
    event.waitUntil(syncCacheWarming());
  } else if (event.tag === 'performance-metrics-sync') {
    event.waitUntil(syncPerformanceMetrics());
  }
}

// Sync mathematical computations when connectivity is restored
async function syncMathematicalComputations() {
  try {
    console.log('🔄 Syncing mathematical computations...');
    
    // Get queued computations from IndexedDB
    const queuedComputations = await getQueuedComputations();
    
    for (const computation of queuedComputations) {
      try {
        // Process the queued computation
        await processQueuedComputation(computation);
        console.log(`✅ Synced computation: ${computation.id}`);
      } catch (error) {
        console.error(`❌ Failed to sync computation ${computation.id}:`, error);
      }
    }
    
    console.log(`✅ Mathematical computations sync completed: ${queuedComputations.length} processed`);
  } catch (error) {
    console.error('❌ Mathematical computations sync failed:', error);
  }
}

// Sync mathematical content when connectivity is restored
async function syncMathematicalContent() {
  try {
    console.log('🔄 Syncing mathematical content...');
    
    // Update cached content with fresh versions
    const contentToUpdate = await getContentToUpdate();
    
    for (const content of contentToUpdate) {
      try {
        await updateCachedContent(content);
        console.log(`✅ Updated content: ${content.url}`);
      } catch (error) {
        console.error(`❌ Failed to update content ${content.url}:`, error);
      }
    }
    
    console.log(`✅ Mathematical content sync completed: ${contentToUpdate.length} updated`);
  } catch (error) {
    console.error('❌ Mathematical content sync failed:', error);
  }
}

// Sync cache warming data
async function syncCacheWarming() {
  try {
    console.log('🔥 Syncing cache warming data...');
    
    // Get warming predictions and results from IndexedDB
    const warmingData = await getWarmingData();
    
    for (const data of warmingData) {
      try {
        await syncWarmingData(data);
        console.log(`✅ Synced warming data: ${data.id}`);
      } catch (error) {
        console.error(`❌ Failed to sync warming data ${data.id}:`, error);
      }
    }
    
    console.log(`✅ Cache warming sync completed: ${warmingData.length} items processed`);
  } catch (error) {
    console.error('❌ Cache warming sync failed:', error);
  }
}

// Sync performance metrics
async function syncPerformanceMetrics() {
  try {
    console.log('📊 Syncing performance metrics...');
    
    // Get performance metrics from IndexedDB
    const metrics = await getPerformanceMetrics();
    
    // Send metrics to analytics endpoint
    const response = await fetch('/api/performance/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metrics)
    });
    
    if (response.ok) {
      console.log(`✅ Performance metrics synced: ${metrics.length} metrics sent`);
      // Clear synced metrics from IndexedDB
      await clearSyncedMetrics(metrics.map(m => m.id));
    } else {
      throw new Error(`Failed to sync metrics: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Performance metrics sync failed:', error);
  }
}

// Helper functions
function getContentType(url) {
  const path = url.pathname;
  
  // Mathematical tools and WASM
  if (path.includes('.wasm') || path.includes('tda_rust_core') || path.includes('elliptic')) {
    return 'mathematical';
  }
  
  // Documentation
  if (path.includes('/docs/') || path.includes('/blog/') || path.includes('/projects/')) {
    return 'documentation';
  }
  
  // API calls
  if (path.includes('/api/') || path.includes('?') || path.includes('#')) {
    return 'api';
  }
  
  // Static assets
  if (path.includes('/images/') || path.includes('/fonts/') || path.includes('/css/') || path.includes('/js/')) {
    return 'static';
  }
  
  return 'api'; // Default to network-first
}

function getCacheName(contentType) {
  switch (contentType) {
    case 'mathematical':
      return MATH_CACHE;
    case 'documentation':
      return DOCS_CACHE;
    case 'api':
      return API_CACHE;
    default:
      return CACHE_NAME;
  }
}

// Placeholder functions for IndexedDB operations
// These would be implemented with actual IndexedDB access in a real implementation
async function getQueuedComputations() {
  // This would access IndexedDB to get queued computations
  console.log('📋 Getting queued computations from IndexedDB...');
  return []; // Placeholder
}

async function processQueuedComputation(computation) {
  // This would process a queued computation
  console.log(`⚙️ Processing queued computation: ${computation.id}`);
  // Implementation would depend on the specific computation type
}

async function getContentToUpdate() {
  // This would get content that needs updating
  console.log('📝 Getting content to update...');
  return []; // Placeholder
}

async function updateCachedContent(content) {
  // This would update cached content
  console.log(`🔄 Updating cached content: ${content.url}`);
  // Implementation would fetch and update the cache
}

// Cache warming sync functions
async function getWarmingData() {
  // This would get warming data from IndexedDB
  console.log('🔥 Getting warming data from IndexedDB...');
  return []; // Placeholder
}

async function syncWarmingData(data) {
  // This would sync warming data to the server
  console.log(`🔄 Syncing warming data: ${data.id}`);
  // Implementation would send data to server
}

// Performance metrics sync functions
async function getPerformanceMetrics() {
  // This would get performance metrics from IndexedDB
  console.log('📊 Getting performance metrics from IndexedDB...');
  return []; // Placeholder
}

async function clearSyncedMetrics(metricIds) {
  // This would clear synced metrics from IndexedDB
  console.log(`🧹 Clearing synced metrics: ${metricIds.length} metrics`);
  // Implementation would remove metrics from IndexedDB
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('📨 Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    event.ports[0].postMessage({
      type: 'CACHE_STATUS',
      caches: [CACHE_NAME, MATH_CACHE, DOCS_CACHE, API_CACHE]
    });
  }
});

console.log('🚀 zktheory Service Worker loaded successfully');
