import { PerformanceMetric, PerformanceHook } from './types';
import { MetricsBuffer } from './MetricsBuffer';

export class PerformanceMetricsCollector {
  private static instance: PerformanceMetricsCollector;
  private buffer: MetricsBuffer;
  private hooks: Map<string, PerformanceHook>;
  private isEnabled: boolean = true;
  private sampleRate: number = 1.0; // 100% sampling by default

  private constructor() {
    this.buffer = new MetricsBuffer();
    this.hooks = new Map();
  }

  static getInstance(): PerformanceMetricsCollector {
    if (!PerformanceMetricsCollector.instance) {
      PerformanceMetricsCollector.instance = new PerformanceMetricsCollector();
    }
    return PerformanceMetricsCollector.instance;
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  setSampleRate(rate: number): void {
    if (rate >= 0 && rate <= 1) {
      this.sampleRate = rate;
    }
  }

  collectMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;

    // Apply sampling for high-frequency operations
    if (Math.random() > this.sampleRate) return;

    // Add timestamp if not provided
    if (!metric.timestamp) {
      metric.timestamp = Date.now();
    }

    this.buffer.addMetric(metric);
  }

  startTimer(componentId: string, category: string): () => void {
    if (!this.isEnabled) {
      return () => {}; // No-op function
    }

    const hookId = `${componentId}_${category}`;
    const startTime = performance.now();

    const hook: PerformanceHook = {
      id: hookId,
      category,
      startTime,
      isActive: true
    };

    this.hooks.set(hookId, hook);

    // Return stop function
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Remove the hook
      this.hooks.delete(hookId);

      // Collect the metric
      this.collectMetric({
        id: hookId,
        timestamp: Date.now(),
        category: category as any,
        value: duration,
        unit: 'ms',
        metadata: { componentId, category }
      });
    };
  }

  getMetrics(category?: string, timeRange?: { start: number; end: number }): PerformanceMetric[] {
    return this.buffer.getMetrics(category, timeRange);
  }

  getMetricsByComponent(componentId: string): PerformanceMetric[] {
    return this.buffer.getMetricsByComponent(componentId);
  }

  getLatestMetrics(limit: number = 100): PerformanceMetric[] {
    return this.buffer.getLatestMetrics(limit);
  }

  getMetricsSummary() {
    return this.buffer.getMetricsSummary();
  }

  clearMetrics(): void {
    this.buffer.clearMetrics();
  }

  clearOldMetrics(ageThreshold: number): void {
    this.buffer.clearOldMetrics(ageThreshold);
  }

  getActiveHooks(): PerformanceHook[] {
    return Array.from(this.hooks.values());
  }

  getBufferSize(): number {
    return this.buffer.getBufferSize();
  }

  getBufferCapacity(): number {
    return this.buffer.getBufferCapacity();
  }

  isBufferFull(): boolean {
    return this.buffer.isBufferFull();
  }

  // Utility method for memory usage tracking
  trackMemoryUsage(componentId: string, memoryInfo?: PerformanceMemory): void {
    if (!this.isEnabled) return;

    const memory = memoryInfo || (performance as any).memory;
    if (memory) {
      this.collectMetric({
        id: `${componentId}_memory`,
        timestamp: Date.now(),
        category: 'memory',
        value: memory.usedJSHeapSize,
        unit: 'bytes',
        metadata: {
          componentId,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        }
      });
    }
  }

  // Utility method for WASM performance monitoring
  withPerformanceMonitoring<T extends any[], R>(
    fn: (...args: T) => R,
    operationName: string,
    componentId: string = 'wasm'
  ): (...args: T) => R {
    return (...args: T): R => {
      const stopTimer = this.startTimer(componentId, operationName);
      
      try {
        const result = fn(...args);
        stopTimer();
        return result;
      } catch (error) {
        stopTimer();
        
        // Log error metric
        this.collectMetric({
          id: `${componentId}_${operationName}_error`,
          timestamp: Date.now(),
          category: 'computation',
          value: 0,
          unit: 'ms',
          metadata: { operation: operationName, error: true, args: args.length }
        });
        
        throw error;
      }
    };
  }
}

// Export singleton instance
export const performanceMetrics = PerformanceMetricsCollector.getInstance();

// Type for performance memory (if available)
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}
