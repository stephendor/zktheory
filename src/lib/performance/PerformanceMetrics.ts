import type { PerformanceMetric, PerformanceCategory, TimeRange } from './types';
import { MetricsBuffer } from './MetricsBuffer';

export class PerformanceMetricsCollector {
  private static instance: PerformanceMetricsCollector;
  private buffer: MetricsBuffer;
  private enabled: boolean;
  private sampleRate: number;

  private constructor() {
    this.buffer = new MetricsBuffer();
    this.enabled = true;
    this.sampleRate = 1.0;
  }

  static getInstance(): PerformanceMetricsCollector {
    if (!PerformanceMetricsCollector.instance) {
      PerformanceMetricsCollector.instance = new PerformanceMetricsCollector();
    }
    return PerformanceMetricsCollector.instance;
  }

  collectMetric(metric: PerformanceMetric): void {
    // Ensure timestamp exists
    if (!metric.timestamp) metric.timestamp = Date.now();
    if (this.enabled) {
      // Apply simple sampling based on configured sampleRate
      if (this.sampleRate < 1) {
        if (Math.random() > this.sampleRate) return;
      }
      this.buffer.addMetric(metric);
    }
  }

  // Overload: accept either a sinceMs number or an explicit time range
  getMetrics(category?: PerformanceCategory, time?: number | TimeRange): PerformanceMetric[] {
    let range: TimeRange | undefined;
    if (typeof time === 'number') {
      range = { start: time, end: Date.now() };
    } else if (time && typeof time === 'object') {
      range = time;
    }
    return this.buffer.getMetrics(category as any, range);
  }

  clearMetrics(): void {
    this.buffer.clearMetrics();
  }

  getMetricsByComponent(componentId: string): PerformanceMetric[] {
    return this.buffer.getMetricsByComponent(componentId);
  }

  getLatestMetrics(limit: number = 100): PerformanceMetric[] {
    return this.buffer.getLatestMetrics(limit);
  }

  getMetricsSummary(): {
    total: number;
    byCategory: Record<string, number>;
    byComponent: Record<string, number>;
  } {
    return this.buffer.getMetricsSummary();
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  trackMemoryUsage(componentId: string): void {
    if (typeof window === 'undefined') return;
    const anyPerf: any = performance as any;
    const mem = anyPerf?.memory;
    if (mem && typeof mem.usedJSHeapSize === 'number') {
      this.collectMetric({
        id: `${componentId}_memory`,
        timestamp: Date.now(),
        category: 'memory',
        value: mem.usedJSHeapSize, // bytes
        unit: 'bytes',
        metadata: { totalJSHeapSize: mem.totalJSHeapSize, jsHeapSizeLimit: mem.jsHeapSizeLimit }
      });
    }
  }

  startTimer(componentId: string, category: PerformanceCategory = 'computation') {
    const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    return () => {
      const end = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const duration = end - start;
      this.collectMetric({
        id: `${componentId}_${category}`,
        timestamp: Date.now(),
        category,
        value: duration,
        unit: 'ms'
      });
      return duration;
    };
  }

  withPerformanceMonitoring<T extends any[], R>(
    fn: (...args: T) => R,
    operationName: string,
    componentId: string = 'component'
  ): (...args: T) => R {
    return (...args: T) => {
      const end = this.startTimer(`${componentId}_${operationName}`, 'computation');
      try {
        return fn(...args);
      } finally {
        end();
      }
    };
  }

  // Sampling controls
  setSampleRate(rate: number): void {
    if (rate >= 0 && rate <= 1) {
      this.sampleRate = rate;
    }
  }

  getSampleRate(): number {
    return this.sampleRate;
  }

  // Buffer stats proxies for UI
  getBufferSize(): number {
    return this.buffer.getBufferSize();
  }

  getBufferCapacity(): number {
    return this.buffer.getBufferCapacity();
  }

  isBufferFull(): boolean {
    return this.buffer.isBufferFull();
  }
}

export const performanceMetrics = PerformanceMetricsCollector.getInstance();

export default PerformanceMetricsCollector;
