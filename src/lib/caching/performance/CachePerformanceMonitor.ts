// Cache Performance Monitor for zktheory mathematical platform
// Tracks cache performance metrics and provides analytics

import {
  CachePerformanceMetrics,
  CacheInvalidationEvent,
  CacheAnalytics,
  InvalidationAnalytics,
  CacheStats
} from '../types';

export interface PerformanceMetric {
  timestamp: number;
  operation: 'get' | 'set' | 'invalidate' | 'clear';
  key: string;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: {
    algorithm?: string;
    type?: string;
    size?: number;
    layer?: string;
  };
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
  metrics: Partial<CachePerformanceMetrics>;
  recommendations: string[];
}

export class CachePerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private maxMetricsHistory: number = 1000;
  private alertThresholds = {
    hitRate: 0.7, // Alert if hit rate drops below 70%
    latency: 50, // Alert if latency exceeds 50ms
    invalidationFrequency: 0.1, // Alert if invalidation rate exceeds 10%
    storageEfficiency: 0.8 // Alert if storage efficiency drops below 80%
  };
  private listeners: ((alert: PerformanceAlert) => void)[] = [];

  constructor() {
    this.setupPeriodicMonitoring();
  }

  // Record a performance metric
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now()
    };

    this.metrics.push(fullMetric);

    // Keep metrics history within limit
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }

    // Check for performance issues
    this.checkPerformanceIssues();
  }

  // Get current performance metrics
  getPerformanceMetrics(): CachePerformanceMetrics {
    const recentMetrics = this.getRecentMetrics(5 * 60 * 1000); // Last 5 minutes
    
    if (recentMetrics.length === 0) {
      return this.getDefaultMetrics();
    }

    const totalOperations = recentMetrics.length;
    const successfulOperations = recentMetrics.filter(m => m.success).length;
    const getOperations = recentMetrics.filter(m => m.operation === 'get');
    const setOperations = recentMetrics.filter(m => m.operation === 'set');
    const invalidateOperations = recentMetrics.filter(m => m.operation === 'invalidate');

    // Calculate hit rate (successful gets / total gets)
    const hitRate = getOperations.length > 0 ? 
      getOperations.filter(m => m.success).length / getOperations.length : 0;
    
    const missRate = 1 - hitRate;

    // Calculate average latency
    const averageLatency = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations;

    // Calculate invalidation frequency
    const invalidationFrequency = invalidateOperations.length / totalOperations;

    // Calculate storage efficiency (placeholder - would need actual storage metrics)
    const storageEfficiency = 0.85; // Placeholder

    // Calculate warming effectiveness (placeholder)
    const warmingEffectiveness = 0.75; // Placeholder

    return {
      hitRate,
      missRate,
      averageLatency,
      storageEfficiency,
      invalidationFrequency,
      warmingEffectiveness
    };
  }

  // Get performance analytics
  getPerformanceAnalytics(): CacheAnalytics {
    const metrics = this.getPerformanceMetrics();
    const allMetrics = this.metrics;
    
    // Analyze user behavior patterns
    const frequentlyAccessed = this.getFrequentlyAccessedKeys();
    const rarelyAccessed = this.getRarelyAccessedKeys();
    const accessPatterns = this.analyzeAccessPatterns();

    return {
      ...metrics,
      userBehavior: {
        frequentlyAccessed,
        rarelyAccessed,
        accessPatterns
      }
    };
  }

  // Get invalidation analytics
  getInvalidationAnalytics(): InvalidationAnalytics {
    const recentMetrics = this.getRecentMetrics(24 * 60 * 60 * 1000); // Last 24 hours
    const invalidateOperations = recentMetrics.filter(m => m.operation === 'invalidate');
    
    const invalidationByType = new Map<string, number>();
    const cascadeEffects = new Map<string, string[]>();
    
    // Analyze invalidation patterns
    invalidateOperations.forEach(metric => {
      const type = metric.metadata?.type || 'unknown';
      invalidationByType.set(type, (invalidationByType.get(type) || 0) + 1);
    });

    // Calculate performance impact
    const beforeMetrics = this.getPerformanceMetrics();
    const afterMetrics = this.getPerformanceMetrics(); // In real implementation, this would be different

    return {
      totalInvalidations: invalidateOperations.length,
      invalidationByType,
      cascadeEffects,
      performanceImpact: {
        before: beforeMetrics,
        after: afterMetrics
      }
    };
  }

  // Add performance alert listener
  addAlertListener(listener: (alert: PerformanceAlert) => void): void {
    this.listeners.push(listener);
  }

  // Remove performance alert listener
  removeAlertListener(listener: (alert: PerformanceAlert) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Get all alerts
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  // Clear old alerts
  clearOldAlerts(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);
  }

  // Get performance trends
  getPerformanceTrends(timeRange: number = 60 * 60 * 1000): {
    hitRate: number[];
    latency: number[];
    timestamps: number[];
  } {
    const recentMetrics = this.getRecentMetrics(timeRange);
    const timeBuckets = new Map<number, { hits: number; misses: number; totalLatency: number; count: number }>();
    
    // Group metrics by time buckets (1-minute intervals)
    recentMetrics.forEach(metric => {
      if (metric.operation === 'get') {
        const bucket = Math.floor(metric.timestamp / (60 * 1000)) * 60 * 1000;
        const bucketData = timeBuckets.get(bucket) || { hits: 0, misses: 0, totalLatency: 0, count: 0 };
        
        if (metric.success) {
          bucketData.hits++;
        } else {
          bucketData.misses++;
        }
        
        bucketData.totalLatency += metric.duration;
        bucketData.count++;
        timeBuckets.set(bucket, bucketData);
      }
    });

    // Convert to arrays
    const timestamps: number[] = [];
    const hitRates: number[] = [];
    const latencies: number[] = [];

    Array.from(timeBuckets.entries())
      .sort(([a], [b]) => a - b)
      .forEach(([timestamp, data]) => {
        timestamps.push(timestamp);
        hitRates.push(data.hits / (data.hits + data.misses));
        latencies.push(data.totalLatency / data.count);
      });

    return {
      hitRate: hitRates,
      latency: latencies,
      timestamps
    };
  }

  // Export performance data
  exportPerformanceData(): string {
    const data = {
      metrics: this.metrics,
      alerts: this.alerts,
      summary: this.getPerformanceMetrics(),
      trends: this.getPerformanceTrends(),
      exportDate: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  // Private methods
  private getRecentMetrics(timeRange: number): PerformanceMetric[] {
    const cutoff = Date.now() - timeRange;
    return this.metrics.filter(metric => metric.timestamp > cutoff);
  }

  private getDefaultMetrics(): CachePerformanceMetrics {
    return {
      hitRate: 0,
      missRate: 1,
      averageLatency: 0,
      storageEfficiency: 0,
      invalidationFrequency: 0,
      warmingEffectiveness: 0
    };
  }

  private getFrequentlyAccessedKeys(): string[] {
    const keyCounts = new Map<string, number>();
    
    this.metrics
      .filter(m => m.operation === 'get')
      .forEach(m => {
        keyCounts.set(m.key, (keyCounts.get(m.key) || 0) + 1);
      });

    return Array.from(keyCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([key]) => key);
  }

  private getRarelyAccessedKeys(): string[] {
    const keyCounts = new Map<string, number>();
    
    this.metrics
      .filter(m => m.operation === 'get')
      .forEach(m => {
        keyCounts.set(m.key, (keyCounts.get(m.key) || 0) + 1);
      });

    return Array.from(keyCounts.entries())
      .filter(([, count]) => count <= 1)
      .map(([key]) => key);
  }

  private analyzeAccessPatterns(): Map<string, any> {
    const patterns = new Map<string, any>();
    
    // Analyze access patterns by algorithm type
    const algorithmMetrics = this.metrics.filter(m => m.metadata?.algorithm);
    
    algorithmMetrics.forEach(metric => {
      const algorithm = metric.metadata!.algorithm!;
      const pattern = patterns.get(algorithm) || {
        totalAccesses: 0,
        successfulAccesses: 0,
        averageLatency: 0,
        totalLatency: 0
      };
      
      pattern.totalAccesses++;
      if (metric.success) pattern.successfulAccesses++;
      pattern.totalLatency += metric.duration;
      pattern.averageLatency = pattern.totalLatency / pattern.totalAccesses;
      
      patterns.set(algorithm, pattern);
    });

    return patterns;
  }

  private checkPerformanceIssues(): void {
    const metrics = this.getPerformanceMetrics();
    
    // Check hit rate
    if (metrics.hitRate < this.alertThresholds.hitRate) {
      this.createAlert('warning', 'Low cache hit rate', metrics, [
        'Consider increasing cache size',
        'Review cache invalidation strategy',
        'Analyze frequently missed keys'
      ]);
    }

    // Check latency
    if (metrics.averageLatency > this.alertThresholds.latency) {
      this.createAlert('warning', 'High cache latency', metrics, [
        'Check IndexedDB performance',
        'Review cache key generation',
        'Consider data compression'
      ]);
    }

    // Check invalidation frequency
    if (metrics.invalidationFrequency > this.alertThresholds.invalidationFrequency) {
      this.createAlert('info', 'High cache invalidation rate', metrics, [
        'Review invalidation strategy',
        'Check for unnecessary invalidations',
        'Consider lazy invalidation'
      ]);
    }

    // Check storage efficiency
    if (metrics.storageEfficiency < this.alertThresholds.storageEfficiency) {
      this.createAlert('warning', 'Low storage efficiency', metrics, [
        'Review cache eviction policy',
        'Consider data compression',
        'Analyze cache size distribution'
      ]);
    }
  }

  private createAlert(
    type: 'warning' | 'error' | 'info',
    message: string,
    metrics: Partial<CachePerformanceMetrics>,
    recommendations: string[]
  ): void {
    const alert: PerformanceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: Date.now(),
      metrics,
      recommendations
    };

    this.alerts.push(alert);
    
    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(alert);
      } catch (error) {
        console.error('❌ Error in alert listener:', error);
      }
    });

    console.log(`🚨 Performance alert: ${message}`, alert);
  }

  private setupPeriodicMonitoring(): void {
    // Monitor performance every 5 minutes
    setInterval(() => {
      this.checkPerformanceIssues();
      this.clearOldAlerts();
    }, 5 * 60 * 1000);
  }
}

// Export singleton instance
export const cachePerformanceMonitor = new CachePerformanceMonitor();
