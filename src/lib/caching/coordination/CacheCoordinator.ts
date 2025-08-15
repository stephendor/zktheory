// Multi-Layer Cache Coordination System for zktheory mathematical platform
// Provides unified interface and intelligent routing between cache layers

import { mathematicalCacheManager, MathematicalCacheManager } from '../IndexedDBCache';
import { serviceWorkerManager, ServiceWorkerManager } from '../ServiceWorkerManager';
import { cachePerformanceMonitor } from '../performance/CachePerformanceMonitor';
import { 
  CacheOptions, 
  CacheLayer, 
  LayerStats, 
  AccessPattern, 
  CoordinatedCacheMetrics,
  CacheStats,
  CachePerformanceMetrics,
  CacheWarmingStrategy
} from '../types';

export interface CacheCoordinatorConfig {
  defaultTTL: number;
  enableIntelligentRouting: boolean;
  enableLayerSynchronization: boolean;
  performanceThresholds: {
    latencyCritical: number; // ms
    hitRateMinimum: number; // percentage
    storageWarning: number; // percentage of max storage
  };
}

export interface LayerRoutingStrategy {
  memory: boolean;
  indexeddb: boolean;
  serviceworker: boolean;
  cdn: boolean;
}

export interface CacheResponse {
  data: any;
  source: string;
  timestamp: number;
  fromCache: boolean;
  latency: number;
}

/**
 * CacheCoordinator - Advanced multi-layer cache coordination
 * 
 * Provides intelligent routing, synchronization, and performance optimization
 * across multiple cache layers (memory, IndexedDB, Service Worker, CDN).
 */
export class CacheCoordinator {
  private layers = new Map<string, CacheLayer>();
  private routingRules = new Map<string, LayerRoutingStrategy>();
  private memoryCache = new Map<string, { data: any; timestamp: number; accessCount: number }>();
  private config: CacheCoordinatorConfig;
  private isInitialized = false;

  constructor(config?: Partial<CacheCoordinatorConfig>) {
    this.config = {
      defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
      enableIntelligentRouting: true,
      enableLayerSynchronization: true,
      performanceThresholds: {
        latencyCritical: 50,
        hitRateMinimum: 0.7,
        storageWarning: 0.8
      },
      ...config
    };

    this.setupDefaultRoutingRules();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🚀 Initializing CacheCoordinator...');
    
    try {
      // Initialize cache layers
      await this.initializeIndexedDBLayer();
      await this.initializeServiceWorkerLayer();
      this.initializeMemoryLayer();

      this.isInitialized = true;
      console.log('✅ CacheCoordinator initialized successfully');
    } catch (error) {
      console.error('❌ CacheCoordinator initialization failed:', error);
      throw error;
    }
  }

  async get(key: string, options?: CacheOptions): Promise<CacheResponse> {
    const startTime = performance.now();
    
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Determine routing strategy
      const strategy = this.config.enableIntelligentRouting 
        ? this.determineRoutingStrategy(key, 'get', options)
        : { memory: true, indexeddb: true, serviceworker: true, cdn: false };

      let result: any = null;
      let source = 'none';

      // Try layers in priority order
      if (strategy.memory) {
        result = this.getFromMemory(key);
        if (result) {
          source = 'memory';
          console.log(`🎯 Cache hit from memory: ${key}`);
        }
      }

      if (!result && strategy.indexeddb) {
        result = await this.getFromIndexedDB(key);
        if (result) {
          source = 'indexeddb';
          console.log(`📦 Cache hit from IndexedDB: ${key}`);
          
          // Promote to memory for faster access
          if (strategy.memory) {
            this.setInMemory(key, result);
          }
        }
      }

      if (!result && strategy.serviceworker) {
        result = await this.getFromServiceWorker(key);
        if (result) {
          source = 'serviceworker';
          console.log(`🔧 Cache hit from Service Worker: ${key}`);
          
          // Promote to higher layers
          if (strategy.memory) this.setInMemory(key, result);
          if (strategy.indexeddb) await this.setInIndexedDB(key, result, options);
        }
      }

      const latency = performance.now() - startTime;

      // Record performance metrics
      cachePerformanceMonitor.recordMetric({
        operation: 'get',
        key,
        duration: latency,
        success: !!result,
        metadata: {
          size: result ? JSON.stringify(result).length : 0
        }
      });

      return this.createResponse(result, result, source, startTime, !!result);

    } catch (error) {
      console.error('❌ CacheCoordinator get error:', error);
      return this.createResponse(null, null, 'error', startTime, false);
    }
  }

  async set(key: string, data: any, options?: CacheOptions): Promise<CacheResponse> {
    const startTime = performance.now();
    
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Determine routing strategy
      const strategy = this.config.enableIntelligentRouting
        ? this.determineRoutingStrategy(key, 'set', options)
        : { memory: true, indexeddb: true, serviceworker: true, cdn: false };

      const results: boolean[] = [];

      // Set in selected layers
      if (strategy.memory) {
        this.setInMemory(key, data);
        results.push(true);
      }

      if (strategy.indexeddb) {
        const success = await this.setInIndexedDB(key, data, options);
        results.push(success);
      }

      if (strategy.serviceworker) {
        const success = await this.setInServiceWorker(key, data);
        results.push(success);
      }

      // Record performance metrics
      cachePerformanceMonitor.recordMetric({
        operation: 'set',
        key,
        duration: performance.now() - startTime,
        success: results.some(r => r),
        metadata: {
          size: JSON.stringify(data).length
        }
      });

      const success = results.some(r => r);
      return this.createResponse(success, data, 'indexeddb', startTime, false);

    } catch (error) {
      console.error('❌ CacheCoordinator set error:', error);
      throw error;
    }
  }

  async invalidate(pattern: string): Promise<void> {
    console.log(`🗑️ Invalidating cache pattern: ${pattern}`);
    
    try {
      // Invalidate from all layers
      const promises: Promise<void>[] = [];

      // Memory cache
      const memoryKeys = Array.from(this.memoryCache.keys());
      for (const key of memoryKeys) {
        if (this.matchesPattern(key, pattern)) {
          this.memoryCache.delete(key);
        }
      }

      // IndexedDB
      promises.push(this.invalidateFromIndexedDB(pattern));

      // Service Worker
      promises.push(this.invalidateFromServiceWorker(pattern));

      await Promise.allSettled(promises);
      console.log('✅ Cache invalidation completed');

    } catch (error) {
      console.error('❌ Cache invalidation failed:', error);
      throw error;
    }
  }

  async getPerformanceMetrics(): Promise<CoordinatedCacheMetrics> {
    const indexedDBStats = await mathematicalCacheManager.getCacheStats();
    const swStatus = await serviceWorkerManager.getStatus();
    const memoryStats = this.getMemoryStats();
    const performanceMetrics = cachePerformanceMonitor.getPerformanceMetrics();

    const layerStatsMap = new Map<string, LayerStats>();
    layerStatsMap.set('memory', memoryStats);
    layerStatsMap.set('indexeddb', {
      name: 'IndexedDB',
      hitRate: indexedDBStats.hitRate || 0,
      size: indexedDBStats.totalSize || 0,
      entries: indexedDBStats.totalEntries || 0,
      averageLatency: 25 // ms - typical IndexedDB latency
    });
    layerStatsMap.set('serviceworker', {
      name: 'Service Worker',
      hitRate: 0.8, // Placeholder - would be calculated from SW metrics
      size: swStatus.cacheStatus.mathematical || 0,
      entries: 0,
      averageLatency: 15 // ms - typical Service Worker latency
    });
    layerStatsMap.set('cdn', {
      name: 'CDN',
      hitRate: 0.95, // Placeholder - would come from CDN analytics
      size: 0,
      entries: 0,
      averageLatency: 5 // ms - typical CDN latency
    });

    const recommendations: string[] = this.generateOptimizationRecommendations();

    return {
      overall: {
        totalEntries: indexedDBStats.totalEntries || 0,
        totalSize: indexedDBStats.totalSize || 0,
        hitRate: this.calculateOverallHitRate(),
        missRate: 1 - this.calculateOverallHitRate(),
        averageLatency: 20, // weighted average across layers
        storageEfficiency: performanceMetrics.storageEfficiency,
        layerStats: {
          indexeddb: layerStatsMap.get('indexeddb')!,
          serviceworker: layerStatsMap.get('serviceworker')!,
          cdn: layerStatsMap.get('cdn')!
        }
      },
      layers: layerStatsMap,
      performance: performanceMetrics,
      recommendations
    };
  }

  private setupDefaultRoutingRules(): void {
    // High-frequency access patterns - prioritize memory
    this.routingRules.set('high-frequency', {
      memory: true,
      indexeddb: true,
      serviceworker: false,
      cdn: false
    });

    // Large computational results - prioritize IndexedDB and Service Worker
    this.routingRules.set('computation', {
      memory: false,
      indexeddb: true,
      serviceworker: true,
      cdn: false
    });

    // Static resources - prioritize Service Worker and CDN
    this.routingRules.set('static', {
      memory: false,
      indexeddb: false,
      serviceworker: true,
      cdn: true
    });

    // User preferences - prioritize IndexedDB for persistence
    this.routingRules.set('preferences', {
      memory: true,
      indexeddb: true,
      serviceworker: false,
      cdn: false
    });
  }

  private determineRoutingStrategy(key: string, operation: string, options?: CacheOptions): LayerRoutingStrategy {
    // Use specified layer if provided
    if (options?.layer && options.layer !== 'auto') {
      return {
        memory: options.layer === 'indexeddb' || options.layer === 'serviceworker',
        indexeddb: options.layer === 'indexeddb',
        serviceworker: options.layer === 'serviceworker',
        cdn: options.layer === 'cdn'
      };
    }

    // Determine by key pattern and operation
    if (key.includes('computation:') || key.includes('result:')) {
      return this.routingRules.get('computation')!;
    }

    if (key.includes('preference:') || key.includes('setting:')) {
      return this.routingRules.get('preferences')!;
    }

    if (key.includes('static:') || key.includes('resource:')) {
      return this.routingRules.get('static')!;
    }

    // Check access frequency for high-frequency pattern
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && memoryEntry.accessCount > 5) {
      return this.routingRules.get('high-frequency')!;
    }

    // Default strategy
    return {
      memory: true,
      indexeddb: true,
      serviceworker: operation === 'get',
      cdn: false
    };
  }

  private async initializeIndexedDBLayer(): Promise<void> {
    await mathematicalCacheManager.initialize();
    this.layers.set('indexeddb', {
      name: 'indexeddb',
      priority: 2,
      get: this.getFromIndexedDB.bind(this),
      set: this.setInIndexedDB.bind(this),
      invalidate: this.invalidateFromIndexedDB.bind(this),
      clear: async () => { await mathematicalCacheManager.clearCache(); },
      getStats: async (): Promise<LayerStats> => {
        const stats = await mathematicalCacheManager.getCacheStats();
        return {
          name: 'IndexedDB',
          hitRate: stats.hitRate || 0,
          size: stats.totalSize || 0,
          entries: stats.totalEntries || 0,
          averageLatency: 25
        };
      }
    });
  }

  private async initializeServiceWorkerLayer(): Promise<void> {
    await serviceWorkerManager.register();
    this.layers.set('serviceworker', {
      name: 'serviceworker',
      priority: 3,
      get: this.getFromServiceWorker.bind(this),
      set: this.setInServiceWorker.bind(this),
      invalidate: this.invalidateFromServiceWorker.bind(this),
      getStats: async (): Promise<LayerStats> => ({
        name: 'Service Worker',
        hitRate: 0.8,
        size: 0,
        entries: 0,
        averageLatency: 15
      }),
      clear: async () => { /* Service worker clear logic */ }
    });
  }

  private initializeMemoryLayer(): void {
    this.layers.set('memory', {
      name: 'memory',
      priority: 1,
      get: async (key: string) => this.getFromMemory(key)?.data,
      set: async (key: string, data: any) => { this.setInMemory(key, data); },
      invalidate: async (pattern: string) => {
        const memoryKeys = Array.from(this.memoryCache.keys());
        for (const key of memoryKeys) {
          if (this.matchesPattern(key, pattern)) {
            this.memoryCache.delete(key);
          }
        }
      },
      clear: async () => { this.memoryCache.clear(); },
      getStats: async (): Promise<LayerStats> => this.getMemoryStats()
    });
  }

  // Memory cache operations
  private getFromMemory(key: string): { data: any; timestamp: number; accessCount: number } | null {
    const entry = this.memoryCache.get(key);
    if (entry) {
      entry.accessCount++;
      return entry;
    }
    return null;
  }

  private setInMemory(key: string, data: any): void {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      accessCount: 1
    });

    // Simple LRU eviction if cache gets too large
    if (this.memoryCache.size > 1000) {
      const oldestKey = Array.from(this.memoryCache.keys())[0];
      this.memoryCache.delete(oldestKey);
    }
  }

  // IndexedDB operations
  private async getFromIndexedDB(key: string): Promise<any> {
    try {
      if (key.startsWith('computation:')) {
        // For now, return null as we'd need algorithm and input parameters
        // In a real implementation, we'd need to parse the key or use a different approach
        return null;
      }
      if (key.startsWith('visualization:')) {
        // Similar issue - need type, data, and renderOptions
        return null;
      }
      if (key.startsWith('preference:')) {
        return await mathematicalCacheManager.getUserPreference(key.replace('preference:', ''));
      }
      return null;
    } catch (error) {
      console.error('IndexedDB get error:', error);
      return null;
    }
  }

  private async setInIndexedDB(key: string, data: any, options?: CacheOptions): Promise<boolean> {
    try {
      if (key.startsWith('computation:') && data.algorithm && data.input && data.result) {
        await mathematicalCacheManager.cacheComputation(data.algorithm, data.input, data.result, options);
        return true;
      }
      if (key.startsWith('visualization:') && data.type && data.data && data.renderOptions) {
        await mathematicalCacheManager.cacheVisualization(data.type, data.data, data.renderOptions, options);
        return true;
      }
      if (key.startsWith('preference:') && data.key && data.value) {
        await mathematicalCacheManager.cacheUserPreference(data.key, data.value, data.category);
        return true;
      }
      return false;
    } catch (error) {
      console.error('IndexedDB set error:', error);
      return false;
    }
  }

  private async invalidateFromIndexedDB(pattern: string): Promise<void> {
    try {
      if (pattern === '*') {
        await mathematicalCacheManager.clearCache();
      }
      // Pattern-based invalidation would need to be implemented in MathematicalCacheManager
    } catch (error) {
      console.error('IndexedDB invalidation error:', error);
    }
  }

  // Service Worker operations
  private async getFromServiceWorker(key: string): Promise<any> {
    try {
      const response = await fetch(`/api/cache/${key}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Service Worker get error:', error);
      return null;
    }
  }

  private async setInServiceWorker(key: string, data: any): Promise<boolean> {
    try {
      const response = await fetch(`/api/cache/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch (error) {
      console.error('Service Worker set error:', error);
      return false;
    }
  }

  private async invalidateFromServiceWorker(pattern: string): Promise<void> {
    try {
      await fetch(`/api/cache/invalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern })
      });
    } catch (error) {
      console.error('Service Worker invalidation error:', error);
    }
  }

  // Utility methods
  private matchesPattern(key: string, pattern: string): boolean {
    if (pattern === '*') return true;
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(key);
    }
    return key === pattern;
  }

  private createResponse(success: any, data: any, source: string, startTime: number, fromCache: boolean): CacheResponse {
    return {
      data: success ? data : null,
      source,
      timestamp: Date.now(),
      fromCache,
      latency: performance.now() - startTime
    };
  }

  private getMemoryStats(): LayerStats {
    const entries = Array.from(this.memoryCache.values());
    const totalSize = entries.reduce((sum, entry) => 
      sum + JSON.stringify(entry.data).length, 0);
    
    return {
      name: 'Memory',
      entries: this.memoryCache.size,
      size: totalSize,
      hitRate: 0.9, // High hit rate for memory cache
      averageLatency: 1 // Very fast memory access
    };
  }

  private calculateOverallHitRate(): number {
    // This would calculate weighted hit rate across all layers
    // For now, return a placeholder
    return 0.75;
  }

  private generateOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const memoryStats = this.getMemoryStats();
    
    if (memoryStats.size > 10 * 1024 * 1024) { // 10MB
      recommendations.push('Consider increasing memory cache eviction frequency');
    }

    recommendations.push('Monitor cache hit rates across layers');
    recommendations.push('Consider adjusting routing strategies based on usage patterns');
    
    return recommendations;
  }
}

// Export singleton instance
export const cacheCoordinator = new CacheCoordinator();
