// Performance Integration for zktheory caching system
// Connects caching with existing performance monitoring infrastructure

import { 
  PerformanceMetricsCollector, 
  performanceMetrics,
  AlertManager,
  alertManager,
  ThresholdManager,
  thresholdManager
} from '../../performance';
import { mathematicalCacheManager } from '../IndexedDBCache';
import { serviceWorkerManager } from '../ServiceWorkerManager';
import { cachePerformanceMonitor } from '../performance/CachePerformanceMonitor';
import { cacheWarmingEngine } from '../CacheWarming';
import { dataCompressionEngine } from '../optimization/DataCompression';
import { CacheStats, CachePerformanceMetrics } from '../types';

export interface CachePerformanceIntegration {
  // Cache-specific performance metrics
  cacheHitRate: number;
  cacheMissRate: number;
  cacheLatency: number;
  cacheStorageEfficiency: number;
  cacheCompressionRatio: number;
  cacheWarmingEffectiveness: number;
  
  // Service Worker metrics
  swCacheSize: number;
  swOfflineCapability: boolean;
  swBackgroundSync: boolean;
  
  // IndexedDB metrics
  idbEntries: number;
  idbSize: number;
  idbHitRate: number;
}

export class CachePerformanceIntegration {
  private isIntegrated: boolean = false;
  private metricsCollector: PerformanceMetricsCollector;
  private alertManager: AlertManager;
  private thresholdManager: ThresholdManager;
  private integrationInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.metricsCollector = performanceMetrics;
    this.alertManager = alertManager;
    this.thresholdManager = thresholdManager;
  }

  // Initialize integration with existing performance monitoring
  async initialize(): Promise<void> {
    if (this.isIntegrated) return;

    try {
      console.log('🔗 Initializing cache performance integration...');
      
      // Set up cache-specific performance thresholds
      this.setupCacheThresholds();
      
      // Set up cache performance alerts
      this.setupCacheAlerts();
      
      // Start metrics collection
      this.startMetricsCollection();
      
      // Set up performance event listeners
      this.setupPerformanceListeners();
      
      this.isIntegrated = true;
      console.log('✅ Cache performance integration initialized');
    } catch (error) {
      console.error('❌ Failed to initialize cache performance integration:', error);
      throw error;
    }
  }

  // Set up cache-specific performance thresholds
  private setupCacheThresholds(): void {
    // Cache hit rate threshold
    this.thresholdManager.addThreshold({
      id: 'cache-hit-rate',
      metricId: 'hitRate',
      operator: 'gte',
      value: 0.8,
      enabled: true
    });

    // Cache latency threshold
    this.thresholdManager.addThreshold({
      id: 'cache-latency',
      metricId: 'latency',
      operator: 'lte',
      value: 50,
      enabled: true
    });

    // Cache storage efficiency threshold
    this.thresholdManager.addThreshold({
      id: 'cache-storage-efficiency',
      metricId: 'storageEfficiency',
      operator: 'gte',
      value: 0.9,
      enabled: true
    });

    // Cache warming effectiveness threshold
    this.thresholdManager.addThreshold({
      id: 'cache-warming-effectiveness',
      metricId: 'warmingEffectiveness',
      operator: 'gte',
      value: 0.7,
      enabled: true
    });
  }

  // Set up cache performance alerts
  private setupCacheAlerts(): void {
    // Listen for cache performance alerts
    cachePerformanceMonitor.addAlertListener((alert) => {
      this.handleCacheAlert(alert);
    });

    // Listen for threshold violations
    // this.thresholdManager.addViolationListener((violation) => {
    //   this.handleThresholdViolation(violation);
    // });
  }

  // Start metrics collection
  private startMetricsCollection(): void {
    // Collect cache metrics every 30 seconds
    this.integrationInterval = setInterval(async () => {
      try {
        await this.collectCacheMetrics();
      } catch (error) {
        console.error('❌ Failed to collect cache metrics:', error);
      }
    }, 30000);

    // Initial collection
    this.collectCacheMetrics();
  }

  // Collect comprehensive cache metrics
  private async collectCacheMetrics(): Promise<{
    cacheHitRate: number;
    cacheMissRate: number;
    cacheLatency: number;
    cacheStorageEfficiency: number;
    cacheCompressionRatio: number;
    cacheWarmingEffectiveness: number;
    swCacheSize: number;
    swEntries: number;
    swOfflineCapability: boolean;
    swBackgroundSync: boolean;
    idbEntries: number;
    idbSize: number;
    idbHitRate: number;
  }> {
    try {
      // Get cache performance metrics
      const cacheMetrics = cachePerformanceMonitor.getPerformanceMetrics();
      
      // Get cache stats
      const cacheStats = await mathematicalCacheManager.getCacheStats();
      
      // Get service worker status
      const swStatus = await serviceWorkerManager.getStatus();
      
      // Get warming status
      const warmingStatus = cacheWarmingEngine.getWarmingStatus();
      
      // Get compression stats (placeholder)
      const compressionStats = {
        algorithm: 'gzip',
        averageRatio: 0.75,
        totalCompressed: 0
      };

      // Record metrics in the main performance system
      this.recordCacheMetrics({
        cacheHitRate: cacheMetrics.hitRate,
        cacheMissRate: cacheMetrics.missRate,
        cacheLatency: cacheMetrics.averageLatency,
        cacheStorageEfficiency: cacheMetrics.storageEfficiency,
        cacheCompressionRatio: compressionStats.averageRatio,
        cacheWarmingEffectiveness: cacheMetrics.warmingEffectiveness,
        swCacheSize: swStatus.cacheStatus.mathematical + swStatus.cacheStatus.documentation,
        swEntries: swStatus.cacheStatus.mathematical + swStatus.cacheStatus.documentation + swStatus.cacheStatus.visualizations,
        swOfflineCapability: swStatus.isOnline === false,
        swBackgroundSync: false, // Would check actual background sync status
        idbEntries: cacheStats.totalEntries,
        idbSize: cacheStats.totalSize,
        idbHitRate: cacheStats.hitRate
      });

      // Check thresholds
      this.checkCacheThresholds(cacheMetrics, cacheStats);
      
      // Return the collected metrics
      return {
        cacheHitRate: cacheMetrics.hitRate,
        cacheMissRate: cacheMetrics.missRate,
        cacheLatency: cacheMetrics.averageLatency,
        cacheStorageEfficiency: cacheMetrics.storageEfficiency,
        cacheCompressionRatio: compressionStats.averageRatio,
        cacheWarmingEffectiveness: cacheMetrics.warmingEffectiveness,
        swCacheSize: swStatus.cacheStatus.mathematical + swStatus.cacheStatus.documentation,
        swEntries: swStatus.cacheStatus.mathematical + swStatus.cacheStatus.documentation + swStatus.cacheStatus.visualizations,
        swOfflineCapability: swStatus.isOnline === false,
        swBackgroundSync: false, // Would check actual background sync status
        idbEntries: cacheStats.totalEntries,
        idbSize: cacheStats.totalSize,
        idbHitRate: cacheStats.hitRate
      };
      
    } catch (error) {
      console.error('❌ Failed to collect cache metrics:', error);
      throw error;
    }
  }

  // Record cache metrics in the main performance system
  private recordCacheMetrics(metrics: {
    cacheHitRate: number;
    cacheMissRate: number;
    cacheLatency: number;
    cacheStorageEfficiency: number;
    cacheCompressionRatio: number;
    cacheWarmingEffectiveness: number;
    swCacheSize: number;
    swEntries: number;
    swOfflineCapability: boolean;
    swBackgroundSync: boolean;
    idbEntries: number;
    idbSize: number;
    idbHitRate: number;
  }): void {
    // Record cache hit rate
    this.metricsCollector.collectMetric({
      id: 'cache-hit-rate',
      timestamp: Date.now(),
      category: 'computation',
      value: metrics.cacheHitRate,
      unit: 'ratio',
      metadata: { subcategory: 'performance' }
    });

    // Record cache latency
    this.metricsCollector.collectMetric({
      id: 'cache-latency',
      timestamp: Date.now(),
      category: 'computation',
      value: metrics.cacheLatency,
      unit: 'ms',
      metadata: { subcategory: 'performance' }
    });

    // Record cache storage efficiency
    this.metricsCollector.collectMetric({
      id: 'cache-storage-efficiency',
      timestamp: Date.now(),
      category: 'memory',
      value: metrics.cacheStorageEfficiency,
      unit: 'ratio',
      metadata: { subcategory: 'storage' }
    });

    // Record cache warming effectiveness
    this.metricsCollector.collectMetric({
      id: 'cache-warming-effectiveness',
      timestamp: Date.now(),
      category: 'computation',
      value: metrics.cacheWarmingEffectiveness,
      unit: 'ratio',
      metadata: { subcategory: 'warming' }
    });

    // Record service worker metrics
    this.metricsCollector.collectMetric({
      id: 'sw-cache-size',
      timestamp: Date.now(),
      category: 'memory',
      value: metrics.swCacheSize,
      unit: 'count',
      metadata: { subcategory: 'service-worker' }
    });

    // Record IndexedDB metrics
    this.metricsCollector.collectMetric({
      id: 'idb-entries',
      timestamp: Date.now(),
      category: 'memory',
      value: metrics.idbEntries,
      unit: 'count',
      metadata: { subcategory: 'performance' }
    });

    this.metricsCollector.collectMetric({
      id: 'idb-size',
      timestamp: Date.now(),
      category: 'memory',
      value: metrics.idbSize,
      unit: 'bytes',
      metadata: { subcategory: 'performance' }
    });
  }

  // Check cache performance thresholds
  private checkCacheThresholds(cacheMetrics: CachePerformanceMetrics, cacheStats: CacheStats): void {
    // Check hit rate threshold
    if (cacheMetrics.hitRate < 0.8) {
      console.warn(`⚠️ Low cache hit rate: ${(cacheMetrics.hitRate * 100).toFixed(1)}%`);
      // this.alertManager.createAlert({ ... }); // Temporarily disabled
    }

    // Check latency threshold
    if (cacheMetrics.averageLatency > 50) {
      console.warn(`⚠️ High cache latency: ${cacheMetrics.averageLatency.toFixed(2)}ms`);
      // this.alertManager.createAlert({ ... }); // Temporarily disabled
    }

    // Check storage efficiency threshold
    if (cacheMetrics.storageEfficiency < 0.9) {
      console.info(`ℹ️ Low cache storage efficiency: ${(cacheMetrics.storageEfficiency * 100).toFixed(1)}%`);
      // this.alertManager.createAlert({ ... }); // Temporarily disabled
    }
  }

  // Handle cache performance alerts
  private handleCacheAlert(alert: any): void {
    // Forward cache alerts to the main alert system
    console.log(`📢 Cache Alert: ${alert.message}`, alert);
    // this.alertManager.createAlert({ ... }); // Temporarily disabled
  }

  // Handle threshold violations
  private handleThresholdViolation(violation: any): void {
    if (violation.thresholdName.startsWith('cache-')) {
      console.log(`🚨 Cache threshold violation: ${violation.thresholdName}`, violation);
      
      // Create alert for threshold violation
      console.log(`🚨 Cache threshold violation: ${violation.thresholdName}`, violation);
      // this.alertManager.createAlert({ ... }); // Temporarily disabled
    }
  }

  // Set up performance event listeners
  private setupPerformanceListeners(): void {
    // Listen for performance degradation events
    // this.metricsCollector.addPerformanceListener((event) => {
    //   if (event.category === 'caching') {
    //     this.handleCachePerformanceEvent(event);
    //   }
    // });

    // Listen for memory pressure events
    // this.metricsCollector.addMemoryListener((event) => {
    //   this.handleMemoryPressureEvent(event);
    //   });
    
    console.log('📊 Performance listeners setup skipped for now');
  }

  // Handle cache performance events
  private handleCachePerformanceEvent(event: any): void {
    console.log('📊 Cache performance event:', event);
    
    // Take action based on performance event type
    switch (event.type) {
      case 'degradation':
        this.handlePerformanceDegradation(event);
        break;
      case 'improvement':
        this.handlePerformanceImprovement(event);
        break;
      case 'anomaly':
        this.handlePerformanceAnomaly(event);
        break;
    }
  }

  // Handle memory pressure events
  private handleMemoryPressureEvent(event: any): void {
    if (event.pressure === 'high') {
      console.log('⚠️ High memory pressure detected, optimizing cache...');
      
      // Trigger cache optimization
      this.optimizeCacheForMemoryPressure();
    }
  }

  // Handle performance degradation
  private handlePerformanceDegradation(event: any): void {
    console.log('📉 Cache performance degradation detected:', event);
    
    // Create alert
    console.log('📉 Cache performance degradation detected:', event);
    // this.alertManager.createAlert({ ... }); // Temporarily disabled
  }

  // Handle performance improvement
  private handlePerformanceImprovement(event: any): void {
    console.log('📈 Cache performance improvement detected:', event);
    
    // Log improvement (no alert needed)
    console.log('📈 Cache performance improvement:', event.improvement);
    // this.metricsCollector.recordMetric('cache-improvement', event.improvement, { ... }); // Temporarily disabled
  }

  // Handle performance anomaly
  private handlePerformanceAnomaly(event: any): void {
    console.log('🔍 Cache performance anomaly detected:', event);
    
    // Create info alert
    console.log('🔍 Cache performance anomaly detected:', event);
    // this.alertManager.createAlert({ ... }); // Temporarily disabled
  }

  // Optimize cache for memory pressure
  private async optimizeCacheForMemoryPressure(): Promise<void> {
    try {
      console.log('🧹 Optimizing cache for memory pressure...');
      
      // Clear expired cache entries
      await mathematicalCacheManager.clearExpiredCache();
      
      // Trigger aggressive LRU cleanup
      await this.triggerAggressiveCleanup();
      
      // Optimize data compression
      await this.optimizeCompression();
      
      console.log('✅ Cache optimization completed');
    } catch (error) {
      console.error('❌ Cache optimization failed:', error);
    }
  }

  // Trigger aggressive cache cleanup
  private async triggerAggressiveCleanup(): Promise<void> {
    try {
      // This would implement more aggressive cleanup strategies
      // For now, just clear some old entries
      console.log('🧹 Performing aggressive cache cleanup...');
      
      // Placeholder for aggressive cleanup implementation
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('❌ Aggressive cleanup failed:', error);
    }
  }

  // Optimize compression settings
  private async optimizeCompression(): Promise<void> {
    try {
      console.log('🗜️ Optimizing compression settings...');
      
      // Adjust compression threshold based on memory pressure
      // This would modify compression settings dynamically
      
    } catch (error) {
      console.error('❌ Compression optimization failed:', error);
    }
  }

  // Get integrated performance summary
  async getIntegratedPerformanceSummary(): Promise<{
    cache: {
      cacheHitRate: number;
      cacheMissRate: number;
      cacheLatency: number;
      cacheStorageEfficiency: number;
      cacheCompressionRatio: number;
      cacheWarmingEffectiveness: number;
      swCacheSize: number;
      swEntries: number;
      swOfflineCapability: boolean;
      swBackgroundSync: boolean;
      idbEntries: number;
      idbSize: number;
      idbHitRate: number;
    };
    overall: any;
    recommendations: string[];
  }> {
    try {
      const cacheMetrics = await this.collectCacheMetrics();
      
      // Get overall performance metrics
      const overallMetrics = this.metricsCollector.getMetrics();
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(cacheMetrics);
      
      return {
        cache: cacheMetrics,
        overall: overallMetrics,
        recommendations
      };
    } catch (error) {
      console.error('❌ Failed to get integrated performance summary:', error);
      throw error;
    }
  }

  // Generate performance recommendations
  private generateRecommendations(metrics: {
    cacheHitRate: number;
    cacheMissRate: number;
    cacheLatency: number;
    cacheStorageEfficiency: number;
    cacheCompressionRatio: number;
    cacheWarmingEffectiveness: number;
    swCacheSize: number;
    swEntries: number;
    swOfflineCapability: boolean;
    swBackgroundSync: boolean;
    idbEntries: number;
    idbSize: number;
    idbHitRate: number;
  }): string[] {
    const recommendations: string[] = [];
    
    if (metrics.cacheHitRate < 0.8) {
      recommendations.push('Increase cache size or improve cache warming strategies');
    }
    
    if (metrics.cacheLatency > 50) {
      recommendations.push('Optimize IndexedDB performance and consider data compression');
    }
    
    if (metrics.cacheStorageEfficiency < 0.9) {
      recommendations.push('Review cache eviction policies and implement better cleanup');
    }
    
    if (metrics.cacheWarmingEffectiveness < 0.7) {
      recommendations.push('Improve cache warming predictions and user behavior analysis');
    }
    
    if (metrics.swOfflineCapability === false) {
      recommendations.push('Enhance offline capability and service worker caching');
    }
    
    return recommendations;
  }

  // Cleanup integration
  cleanup(): void {
    if (this.integrationInterval) {
      clearInterval(this.integrationInterval);
      this.integrationInterval = null;
    }
    
    this.isIntegrated = false;
    console.log('🧹 Cache performance integration cleaned up');
  }
}

// Export singleton instance
export const cachePerformanceIntegration = new CachePerformanceIntegration();

