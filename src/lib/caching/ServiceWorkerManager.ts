// Service Worker Manager for zktheory mathematical platform
// Handles registration, communication, and offline status management

export interface ServiceWorkerStatus {
  isRegistered: boolean;
  isActive: boolean;
  isOnline: boolean;
  cacheStatus: CacheStatus;
  lastUpdate: number;
}

export interface CacheStatus {
  mathematical: number;
  visualizations: number;
  documentation: number;
  api: number;
  static: number;
}

export interface OfflineCapability {
  mathematicalTools: boolean;
  visualizations: boolean;
  documentation: boolean;
  userPreferences: boolean;
}

export class ServiceWorkerManager {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isOnline: boolean = navigator.onLine;
  private offlineCapability: OfflineCapability = {
    mathematicalTools: false,
    visualizations: false,
    documentation: false,
    userPreferences: false
  };
  private statusListeners: ((status: ServiceWorkerStatus) => void)[] = [];

  constructor() {
    // Only setup event listeners in browser environment
    if (typeof window !== 'undefined') {
      this.setupEventListeners();
    }
  }

  async register(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service Worker not supported in this browser');
        return false;
      }

      console.log('🚀 Registering Service Worker...');
      
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('✅ Service Worker registered successfully');

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      
      // Check if there's an update available
      if (this.swRegistration.waiting) {
        console.log('🔄 Service Worker update available');
        this.notifyUpdateAvailable();
      }

      // Listen for updates
      this.setupUpdateListeners();
      
      // Update offline capability
      await this.updateOfflineCapability();
      
      return true;
    } catch (error) {
      console.error('❌ Failed to register Service Worker:', error);
      return false;
    }
  }

  async unregister(): Promise<boolean> {
    try {
      if (this.swRegistration) {
        await this.swRegistration.unregister();
        this.swRegistration = null;
        console.log('✅ Service Worker unregistered successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to unregister Service Worker:', error);
      return false;
    }
  }

  async update(): Promise<boolean> {
    try {
      if (!this.swRegistration) {
        console.warn('⚠️ No Service Worker registered');
        return false;
      }

      console.log('🔄 Checking for Service Worker updates...');
      
      await this.swRegistration.update();
      
      if (this.swRegistration.waiting) {
        // Send skip waiting message
        this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Wait for the new service worker to activate
        await new Promise<void>((resolve) => {
          const handleControllerChange = () => {
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
            resolve();
          };
          navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
        });
        
        console.log('✅ Service Worker updated successfully');
        return true;
      } else {
        console.log('ℹ️ No Service Worker updates available');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to update Service Worker:', error);
      return false;
    }
  }

  async getStatus(): Promise<ServiceWorkerStatus> {
    try {
      const cacheStatus = await this.getCacheStatus();
      
      const status: ServiceWorkerStatus = {
        isRegistered: !!this.swRegistration,
        isActive: !!this.swRegistration?.active,
        isOnline: this.isOnline,
        cacheStatus,
        lastUpdate: this.swRegistration?.installing?.state === 'installed' ? Date.now() : 0
      };

      return status;
    } catch (error) {
      console.error('❌ Failed to get Service Worker status:', error);
      throw error;
    }
  }

  async getOfflineCapability(): Promise<OfflineCapability> {
    return this.offlineCapability;
  }

  async queueMathematicalComputation(computation: any): Promise<boolean> {
    try {
      if (!this.isOnline) {
        console.log('📋 Queueing mathematical computation for offline processing...');
        
        // Store computation in IndexedDB for later sync
        await this.storeQueuedComputation(computation);
        
        // Request background sync when online
        if ('serviceWorker' in navigator && 'sync' in (window.ServiceWorkerRegistration?.prototype || {})) {
          const registration = await navigator.serviceWorker.ready;
          if ('sync' in registration) {
            await (registration as any).sync.register('math-computation-sync');
            console.log('🔄 Background sync registered for mathematical computation');
          }
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to queue mathematical computation:', error);
      return false;
    }
  }

  async queueContentUpdate(content: any): Promise<boolean> {
    try {
      if (!this.isOnline) {
        console.log('📋 Queueing content update for offline processing...');
        
        // Store content update in IndexedDB for later sync
        await this.storeQueuedContentUpdate(content);
        
        // Request background sync when online
        if ('serviceWorker' in navigator && 'sync' in (window.ServiceWorkerRegistration?.prototype || {})) {
          const registration = await navigator.serviceWorker.ready;
          if ('sync' in registration) {
            await (registration as any).sync.register('content-sync');
            console.log('🔄 Background sync registered for content update');
          }
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to queue content update:', error);
      return false;
    }
  }

  addStatusListener(listener: (status: ServiceWorkerStatus) => void): void {
    this.statusListeners.push(listener);
  }

  removeStatusListener(listener: (status: ServiceWorkerStatus) => void): void {
    const index = this.statusListeners.indexOf(listener);
    if (index > -1) {
      this.statusListeners.splice(index, 1);
    }
  }

  private setupEventListeners(): void {
    // Only setup event listeners in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyStatusChange();
      console.log('🌐 Application is online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyStatusChange();
      console.log('📴 Application is offline');
    });

    // Service Worker events
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker controller changed');
        this.notifyStatusChange();
      });

      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event);
      });
    }
  }

  private setupUpdateListeners(): void {
    if (!this.swRegistration) return;

    this.swRegistration.addEventListener('updatefound', () => {
      console.log('🔄 Service Worker update found');
      
      const newWorker = this.swRegistration!.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔄 New Service Worker installed, update available');
            this.notifyUpdateAvailable();
          }
        });
      }
    });
  }

  private async updateOfflineCapability(): Promise<void> {
    try {
      // Check what's available offline by examining cached content
      const cacheStatus = await this.getCacheStatus();
      
      this.offlineCapability = {
        mathematicalTools: cacheStatus.mathematical > 0,
        visualizations: cacheStatus.visualizations > 0,
        documentation: cacheStatus.documentation > 0,
        userPreferences: true // Always available via IndexedDB
      };

      console.log('📱 Offline capability updated:', this.offlineCapability);
    } catch (error) {
      console.error('❌ Failed to update offline capability:', error);
    }
  }

  private async getCacheStatus(): Promise<CacheStatus> {
    try {
      if (!('caches' in window)) {
        return { mathematical: 0, visualizations: 0, documentation: 0, api: 0, static: 0 };
      }

      const cacheNames = [
        'zktheory-math-content-v1',
        'zktheory-visualizations-v1',
        'zktheory-docs-v1',
        'zktheory-api-v1',
        'zktheory-math-v1'
      ];

      const cacheStatus: CacheStatus = {
        mathematical: 0,
        visualizations: 0,
        documentation: 0,
        api: 0,
        static: 0
      };

      for (const cacheName of cacheNames) {
        try {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          
          if (cacheName.includes('math-content')) {
            cacheStatus.mathematical = keys.length;
          } else if (cacheName.includes('visualizations')) {
            cacheStatus.visualizations = keys.length;
          } else if (cacheName.includes('docs')) {
            cacheStatus.documentation = keys.length;
          } else if (cacheName.includes('api')) {
            cacheStatus.api = keys.length;
          } else {
            cacheStatus.static = keys.length;
          }
        } catch (error) {
          console.warn(`⚠️ Failed to check cache ${cacheName}:`, error);
        }
      }

      return cacheStatus;
    } catch (error) {
      console.error('❌ Failed to get cache status:', error);
      return { mathematical: 0, visualizations: 0, documentation: 0, api: 0, static: 0 };
    }
  }

  private async storeQueuedComputation(computation: any): Promise<void> {
    try {
      // This would store the computation in IndexedDB
      // Implementation depends on the IndexedDB cache manager
      console.log('💾 Storing queued computation in IndexedDB:', computation.id);
      
      // Placeholder implementation
      const queuedComputations = JSON.parse(localStorage.getItem('queuedComputations') || '[]');
      queuedComputations.push({
        ...computation,
        timestamp: Date.now(),
        status: 'queued'
      });
      localStorage.setItem('queuedComputations', JSON.stringify(queuedComputations));
    } catch (error) {
      console.error('❌ Failed to store queued computation:', error);
      throw error;
    }
  }

  private async storeQueuedContentUpdate(content: any): Promise<void> {
    try {
      // This would store the content update in IndexedDB
      console.log('💾 Storing queued content update in IndexedDB:', content.url);
      
      // Placeholder implementation
      const queuedContentUpdates = JSON.parse(localStorage.getItem('queuedContentUpdates') || '[]');
      queuedContentUpdates.push({
        ...content,
        timestamp: Date.now(),
        status: 'queued'
      });
      localStorage.setItem('queuedContentUpdates', JSON.stringify(queuedContentUpdates));
    } catch (error) {
      console.error('❌ Failed to store queued content update:', error);
      throw error;
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    console.log('📨 Received message from Service Worker:', event.data);
    
    if (event.data.type === 'CACHE_STATUS') {
      // Handle cache status updates
      this.notifyStatusChange();
    }
  }

  private notifyStatusChange(): void {
    this.getStatus().then(status => {
      this.statusListeners.forEach(listener => {
        try {
          listener(status);
        } catch (error) {
          console.error('❌ Error in status listener:', error);
        }
      });
    });
  }

  private notifyUpdateAvailable(): void {
    // Notify the application that a Service Worker update is available
    const event = new CustomEvent('serviceWorkerUpdateAvailable', {
      detail: { registration: this.swRegistration }
    });
    window.dispatchEvent(event);
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();
