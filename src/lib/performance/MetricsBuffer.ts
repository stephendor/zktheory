import { PerformanceMetric, TimeRange } from './types';

export class MetricsBuffer {
  private buffer: PerformanceMetric[] = [];
  private maxSize: number;
  private maxAge: number; // in milliseconds

  constructor(maxSize: number = 10000, maxAge: number = 24 * 60 * 60 * 1000) {
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  addMetric(metric: PerformanceMetric): void {
    // Add new metric
    this.buffer.push(metric);

    // Clean up old metrics
    this.cleanup();

    // Trim buffer if it exceeds max size
    if (this.buffer.length > this.maxSize) {
      this.buffer = this.buffer.slice(-this.maxSize);
    }
  }

  getMetrics(category?: string, timeRange?: TimeRange): PerformanceMetric[] {
    let filteredMetrics = this.buffer;

    // Filter by category
    if (category) {
      filteredMetrics = filteredMetrics.filter(metric => metric.category === category);
    }

    // Filter by time range
    if (timeRange) {
      filteredMetrics = filteredMetrics.filter(metric => 
        metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end
      );
    }

    return filteredMetrics;
  }

  getMetricsByComponent(componentId: string): PerformanceMetric[] {
    return this.buffer.filter(metric => metric.id.startsWith(componentId));
  }

  getLatestMetrics(limit: number = 100): PerformanceMetric[] {
    return this.buffer.slice(-limit);
  }

  getMetricsSummary(): {
    total: number;
    byCategory: Record<string, number>;
    byComponent: Record<string, number>;
  } {
    const byCategory: Record<string, number> = {};
    const byComponent: Record<string, number> = {};

    this.buffer.forEach(metric => {
      // Count by category
      byCategory[metric.category] = (byCategory[metric.category] || 0) + 1;

      // Count by component (extract component ID from metric ID)
      const componentId = metric.id.split('_')[0];
      byComponent[componentId] = (byComponent[componentId] || 0) + 1;
    });

    return {
      total: this.buffer.length,
      byCategory,
      byComponent
    };
  }

  clearMetrics(): void {
    this.buffer = [];
  }

  clearOldMetrics(ageThreshold: number = this.maxAge): void {
    const cutoffTime = Date.now() - ageThreshold;
    this.buffer = this.buffer.filter(metric => metric.timestamp > cutoffTime);
  }

  private cleanup(): void {
    const cutoffTime = Date.now() - this.maxAge;
    this.buffer = this.buffer.filter(metric => metric.timestamp > cutoffTime);
  }

  getBufferSize(): number {
    return this.buffer.length;
  }

  getBufferCapacity(): number {
    return this.maxSize;
  }

  isBufferFull(): boolean {
    return this.buffer.length >= this.maxSize;
  }
}
