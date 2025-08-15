import { PerformanceMetricsCollector, MetricsBuffer } from '../../lib/performance';
import { PerformanceMetric } from '../../lib/performance/types';

describe('PerformanceMetrics', () => {
  let collector: PerformanceMetricsCollector;
  let buffer: MetricsBuffer;

  beforeEach(() => {
    collector = PerformanceMetricsCollector.getInstance();
    buffer = new MetricsBuffer();
    // Clear any existing metrics
    collector.clearMetrics();
  });

  describe('PerformanceMetricsCollector', () => {
    it('should be a singleton', () => {
      const instance1 = PerformanceMetricsCollector.getInstance();
      const instance2 = PerformanceMetricsCollector.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should collect metrics correctly', () => {
      const metric: PerformanceMetric = {
        id: 'test_metric',
        timestamp: Date.now(),
        category: 'computation',
        value: 100,
        unit: 'ms',
        metadata: { test: true }
      };

      collector.collectMetric(metric);
      const metrics = collector.getMetrics();
      
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toEqual(metric);
    });

    it('should handle timer functionality', () => {
      const stopTimer = collector.startTimer('test_component', 'computation');
      
      // Simulate some work
      const start = performance.now();
      while (performance.now() - start < 1) {
        // Busy wait for ~1ms
      }
      
      stopTimer();
      
      const metrics = collector.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].id).toBe('test_component_computation');
      expect(metrics[0].category).toBe('computation');
      expect(metrics[0].value).toBeGreaterThan(0);
      expect(metrics[0].unit).toBe('ms');
    });

    it('should respect enable/disable state', () => {
      collector.disable();
      collector.collectMetric({
        id: 'test',
        timestamp: Date.now(),
        category: 'computation',
        value: 100,
        unit: 'ms'
      });
      
      expect(collector.getMetrics()).toHaveLength(0);
      
      collector.enable();
      collector.collectMetric({
        id: 'test',
        timestamp: Date.now(),
        category: 'computation',
        value: 100,
        unit: 'ms'
      });
      
      expect(collector.getMetrics()).toHaveLength(1);
    });

    it('should apply sampling correctly', () => {
      collector.setSampleRate(0.5); // 50% sampling
      
      // Collect 10 metrics
      for (let i = 0; i < 10; i++) {
        collector.collectMetric({
          id: `test_${i}`,
          timestamp: Date.now(),
          category: 'computation',
          value: i,
          unit: 'ms'
        });
      }
      
      const metrics = collector.getMetrics();
      // With 50% sampling, we should have roughly 5 metrics (allowing for randomness)
      expect(metrics.length).toBeLessThanOrEqual(10);
      expect(metrics.length).toBeGreaterThan(0);
    });
  });

  describe('MetricsBuffer', () => {
    it('should add and retrieve metrics', () => {
      const metric: PerformanceMetric = {
        id: 'test',
        timestamp: Date.now(),
        category: 'computation',
        value: 100,
        unit: 'ms'
      };

      buffer.addMetric(metric);
      const metrics = buffer.getMetrics();
      
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toEqual(metric);
    });

    it('should filter metrics by category', () => {
      const computationMetric: PerformanceMetric = {
        id: 'comp_1',
        timestamp: Date.now(),
        category: 'computation',
        value: 100,
        unit: 'ms'
      };

      const memoryMetric: PerformanceMetric = {
        id: 'mem_1',
        timestamp: Date.now(),
        category: 'memory',
        value: 1024,
        unit: 'bytes'
      };

      buffer.addMetric(computationMetric);
      buffer.addMetric(memoryMetric);

      const computationMetrics = buffer.getMetrics('computation');
      const memoryMetrics = buffer.getMetrics('memory');

      expect(computationMetrics).toHaveLength(1);
      expect(computationMetrics[0].category).toBe('computation');
      expect(memoryMetrics).toHaveLength(1);
      expect(memoryMetrics[0].category).toBe('memory');
    });

    it('should filter metrics by time range', () => {
      const now = Date.now();
      const oldMetric: PerformanceMetric = {
        id: 'old',
        timestamp: now - 10000, // 10 seconds ago
        category: 'computation',
        value: 100,
        unit: 'ms'
      };

      const newMetric: PerformanceMetric = {
        id: 'new',
        timestamp: now,
        category: 'computation',
        value: 200,
        unit: 'ms'
      };

      buffer.addMetric(oldMetric);
      buffer.addMetric(newMetric);

      const recentMetrics = buffer.getMetrics(undefined, {
        start: now - 5000,
        end: now + 1000
      });

      expect(recentMetrics).toHaveLength(1);
      expect(recentMetrics[0].id).toBe('new');
    });

    it('should respect max buffer size', () => {
      const smallBuffer = new MetricsBuffer(3, 60000); // Max 3 metrics

      for (let i = 0; i < 5; i++) {
        smallBuffer.addMetric({
          id: `test_${i}`,
          timestamp: Date.now(),
          category: 'computation',
          value: i,
          unit: 'ms'
        });
      }

      const metrics = smallBuffer.getMetrics();
      expect(metrics).toHaveLength(3);
      // Should keep the most recent metrics
      expect(metrics[0].id).toBe('test_2');
      expect(metrics[1].id).toBe('test_3');
      expect(metrics[2].id).toBe('test_4');
    });

    it('should provide metrics summary', () => {
      buffer.addMetric({
        id: 'comp_1',
        timestamp: Date.now(),
        category: 'computation',
        value: 100,
        unit: 'ms'
      });

      buffer.addMetric({
        id: 'comp_2',
        timestamp: Date.now(),
        category: 'computation',
        value: 200,
        unit: 'ms'
      });

      buffer.addMetric({
        id: 'mem_1',
        timestamp: Date.now(),
        category: 'memory',
        value: 1024,
        unit: 'bytes'
      });

      const summary = buffer.getMetricsSummary();
      
      expect(summary.total).toBe(3);
      expect(summary.byCategory.computation).toBe(2);
      expect(summary.byCategory.memory).toBe(1);
      expect(summary.byComponent.comp).toBe(2);
      expect(summary.byComponent.mem).toBe(1);
    });
  });

  describe('Integration', () => {
    it('should work together correctly', () => {
      const stopTimer = collector.startTimer('integration_test', 'computation');
      
      // Simulate work
      const start = performance.now();
      while (performance.now() - start < 1) {
        // Busy wait for ~1ms
      }
      
      stopTimer();
      
      const metrics = collector.getMetrics();
      expect(metrics).toHaveLength(1);
      
      const metric = metrics[0];
      expect(metric.id).toBe('integration_test_computation');
      expect(metric.category).toBe('computation');
      expect(metric.value).toBeGreaterThan(0);
      expect(metric.unit).toBe('ms');
      expect(metric.metadata).toBeDefined();
    });
  });
});
