/**
 * Mathematical Performance Monitoring System
 * Specialized performance monitoring for mathematical computations and visualizations
 * Extends the existing performance framework with mathematical-specific metrics
 */

import { PerformanceMetricsCollector } from './PerformanceMetrics';
import type { PerformanceMetric, PerformanceReport, Recommendation } from './types';

export interface MathematicalOperation {
  operation: string;
  category: 'group_theory' | 'elliptic_curves' | 'tda' | 'visualization' | 'latex_rendering';
  complexity: 'O(1)' | 'O(n)' | 'O(n²)' | 'O(n³)' | 'O(2^n)' | 'unknown';
  inputSize?: number;
  expectedTimeMs?: number;
  maxAllowedTimeMs?: number;
}

export interface MathematicalMetric extends PerformanceMetric {
  category: 'computation' | 'rendering' | 'memory' | 'interaction';
  mathematicalContext: {
    operation: string;
    algorithm: string;
    inputSize: number;
    complexity: string;
    accuracy?: number;
    memoryFootprint?: number;
  };
}

export interface MathematicalPerformanceThreshold {
  operation: string;
  environment: 'development' | 'testing' | 'production';
  maxExecutionTime: number;
  maxMemoryIncrease: number;
  minAccuracy?: number;
  severity: 'warning' | 'error' | 'critical';
}

export interface RegressionAnalysis {
  baseline: {
    mean: number;
    standardDeviation: number;
    sampleSize: number;
    timestamp: number;
  };
  current: {
    value: number;
    timestamp: number;
  };
  analysis: {
    isRegression: boolean;
    confidenceLevel: number;
    percentageChange: number;
    statisticalSignificance: number;
  };
}

export class MathematicalPerformanceMonitor {
  private static instance: MathematicalPerformanceMonitor;
  private metricsCollector: PerformanceMetricsCollector;
  private thresholds: Map<string, MathematicalPerformanceThreshold[]> = new Map();
  private baselines: Map<string, RegressionAnalysis['baseline']> = new Map();
  private enabled: boolean = true;

  private constructor() {
    this.metricsCollector = PerformanceMetricsCollector.getInstance();
    this.initializeDefaultThresholds();
  }

  static getInstance(): MathematicalPerformanceMonitor {
    if (!MathematicalPerformanceMonitor.instance) {
      MathematicalPerformanceMonitor.instance = new MathematicalPerformanceMonitor();
    }
    return MathematicalPerformanceMonitor.instance;
  }

  private initializeDefaultThresholds(): void {
    const defaultThresholds: MathematicalPerformanceThreshold[] = [
      // Group Theory Operations
      {
        operation: 'group_validation',
        environment: 'development',
        maxExecutionTime: 100,
        maxMemoryIncrease: 10 * 1024 * 1024, // 10MB
        minAccuracy: 1.0,
        severity: 'warning'
      },
      {
        operation: 'group_validation',
        environment: 'production',
        maxExecutionTime: 50,
        maxMemoryIncrease: 5 * 1024 * 1024, // 5MB
        minAccuracy: 1.0,
        severity: 'error'
      },
      // TDA Operations
      {
        operation: 'tda_computation',
        environment: 'development',
        maxExecutionTime: 1000,
        maxMemoryIncrease: 50 * 1024 * 1024, // 50MB
        severity: 'warning'
      },
      {
        operation: 'tda_computation',
        environment: 'production',
        maxExecutionTime: 500,
        maxMemoryIncrease: 25 * 1024 * 1024, // 25MB
        severity: 'error'
      },
      // Visualization Operations
      {
        operation: 'cayley_rendering',
        environment: 'development',
        maxExecutionTime: 200,
        maxMemoryIncrease: 20 * 1024 * 1024, // 20MB
        severity: 'warning'
      },
      {
        operation: 'cayley_rendering',
        environment: 'production',
        maxExecutionTime: 100,
        maxMemoryIncrease: 10 * 1024 * 1024, // 10MB
        severity: 'error'
      },
      // LaTeX Rendering
      {
        operation: 'latex_rendering',
        environment: 'development',
        maxExecutionTime: 50,
        maxMemoryIncrease: 5 * 1024 * 1024, // 5MB
        severity: 'warning'
      },
      {
        operation: 'latex_rendering',
        environment: 'production',
        maxExecutionTime: 25,
        maxMemoryIncrease: 2 * 1024 * 1024, // 2MB
        severity: 'error'
      },
      // Canvas Rendering (Critical for UI responsiveness)
      {
        operation: 'canvas_rendering',
        environment: 'development',
        maxExecutionTime: 16.67, // 60 FPS
        maxMemoryIncrease: 2 * 1024 * 1024, // 2MB
        severity: 'warning'
      },
      {
        operation: 'canvas_rendering',
        environment: 'production',
        maxExecutionTime: 16.67, // 60 FPS
        maxMemoryIncrease: 1 * 1024 * 1024, // 1MB
        severity: 'critical'
      }
    ];

    defaultThresholds.forEach(threshold => {
      const key = `${threshold.operation}_${threshold.environment}`;
      const existing = this.thresholds.get(key) || [];
      this.thresholds.set(key, [...existing, threshold]);
    });
  }

  /**
   * Monitor a mathematical operation with automatic performance tracking
   */
  async monitorMathematicalOperation<T>(
    operation: MathematicalOperation,
    fn: () => Promise<T> | T,
    options?: {
      environment?: 'development' | 'testing' | 'production';
      trackMemory?: boolean;
      validateResult?: (result: T) => number; // Return accuracy score 0-1
    }
  ): Promise<T> {
    if (!this.enabled) {
      return await fn();
    }

    const environment = options?.environment || 'development';
    const startTime = performance.now();
    const startMemory = options?.trackMemory ? this.getMemoryUsage() : undefined;

    let result: T | undefined;
    let error: Error | undefined;

    try {
      result = await fn();
    } catch (e) {
      error = e as Error;
      throw e;
    } finally {
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      const endMemory = options?.trackMemory ? this.getMemoryUsage() : undefined;
      const memoryIncrease = startMemory && endMemory ? endMemory.heapUsed - startMemory.heapUsed : 0;

      // Calculate accuracy if validator provided
      let accuracy: number | undefined;
      if (!error && options?.validateResult && result !== undefined) {
        try {
          accuracy = options.validateResult(result);
        } catch (validationError) {
          console.warn('Accuracy validation failed:', validationError);
        }
      }

      // Create mathematical metric
      const metric: MathematicalMetric = {
        id: `${operation.operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        category: 'computation',
        value: executionTime,
        unit: 'ms',
        mathematicalContext: {
          operation: operation.operation,
          algorithm: operation.category,
          inputSize: operation.inputSize || 0,
          complexity: operation.complexity,
          accuracy,
          memoryFootprint: memoryIncrease
        },
        metadata: {
          environment,
          error: error?.message,
          memoryIncrease,
          expectedTime: operation.expectedTimeMs,
          maxAllowedTime: operation.maxAllowedTimeMs
        }
      };

      // Store the metric
      this.metricsCollector.collectMetric(metric);

      // Check thresholds and generate alerts
      this.checkMathematicalThresholds(metric, environment);

      // Update baselines for regression detection
      this.updateBaselines(operation.operation, executionTime);
    }

    return result!;
  }

  /**
   * Monitor synchronous mathematical operations
   */
  monitorSyncMathematicalOperation<T>(
    operation: MathematicalOperation,
    fn: () => T,
    options?: {
      environment?: 'development' | 'testing' | 'production';
      trackMemory?: boolean;
      validateResult?: (result: T) => number;
    }
  ): T {
    if (!this.enabled) {
      return fn();
    }

    const environment = options?.environment || 'development';
    const startTime = performance.now();
    const startMemory = options?.trackMemory ? this.getMemoryUsage() : undefined;

    let result: T | undefined;
    let error: Error | undefined;

    try {
      result = fn();
    } catch (e) {
      error = e as Error;
      throw e;
    } finally {
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      const endMemory = options?.trackMemory ? this.getMemoryUsage() : undefined;
      const memoryIncrease = startMemory && endMemory ? endMemory.heapUsed - startMemory.heapUsed : 0;

      // Calculate accuracy if validator provided
      let accuracy: number | undefined;
      if (!error && options?.validateResult && result !== undefined) {
        try {
          accuracy = options.validateResult(result);
        } catch (validationError) {
          console.warn('Accuracy validation failed:', validationError);
        }
      }

      // Create mathematical metric
      const metric: MathematicalMetric = {
        id: `${operation.operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        category: 'computation',
        value: executionTime,
        unit: 'ms',
        mathematicalContext: {
          operation: operation.operation,
          algorithm: operation.category,
          inputSize: operation.inputSize || 0,
          complexity: operation.complexity,
          accuracy,
          memoryFootprint: memoryIncrease
        },
        metadata: {
          environment,
          error: error?.message,
          memoryIncrease,
          expectedTime: operation.expectedTimeMs,
          maxAllowedTime: operation.maxAllowedTimeMs
        }
      };

      // Store the metric
      this.metricsCollector.collectMetric(metric);

      // Check thresholds and generate alerts
      this.checkMathematicalThresholds(metric, environment);

      // Update baselines for regression detection
      this.updateBaselines(operation.operation, executionTime);
    }

    return result!;
  }

  private checkMathematicalThresholds(
    metric: MathematicalMetric,
    environment: 'development' | 'testing' | 'production'
  ): void {
    const key = `${metric.mathematicalContext.operation}_${environment}`;
    const thresholds = this.thresholds.get(key) || [];

    thresholds.forEach(threshold => {
      // Check execution time threshold
      if (metric.value > threshold.maxExecutionTime) {
        console.warn(`🚨 Performance Alert: ${metric.mathematicalContext.operation} exceeded time threshold`, {
          actual: metric.value,
          threshold: threshold.maxExecutionTime,
          severity: threshold.severity,
          environment
        });
      }

      // Check memory threshold
      if (metric.mathematicalContext.memoryFootprint && 
          metric.mathematicalContext.memoryFootprint > threshold.maxMemoryIncrease) {
        console.warn(`🚨 Memory Alert: ${metric.mathematicalContext.operation} exceeded memory threshold`, {
          actual: metric.mathematicalContext.memoryFootprint,
          threshold: threshold.maxMemoryIncrease,
          severity: threshold.severity,
          environment
        });
      }

      // Check accuracy threshold
      if (threshold.minAccuracy && 
          metric.mathematicalContext.accuracy !== undefined &&
          metric.mathematicalContext.accuracy < threshold.minAccuracy) {
        console.error(`🚨 Accuracy Alert: ${metric.mathematicalContext.operation} below accuracy threshold`, {
          actual: metric.mathematicalContext.accuracy,
          threshold: threshold.minAccuracy,
          severity: threshold.severity,
          environment
        });
      }
    });
  }

  private updateBaselines(operation: string, executionTime: number): void {
    const existing = this.baselines.get(operation);
    
    if (!existing) {
      // Create initial baseline
      this.baselines.set(operation, {
        mean: executionTime,
        standardDeviation: 0,
        sampleSize: 1,
        timestamp: Date.now()
      });
    } else {
      // Update baseline using moving average and variance
      const newSampleSize = existing.sampleSize + 1;
      const newMean = (existing.mean * existing.sampleSize + executionTime) / newSampleSize;
      
      // Calculate running standard deviation
      const variance = ((existing.standardDeviation ** 2) * (existing.sampleSize - 1) + 
                       ((executionTime - newMean) ** 2)) / newSampleSize;
      const newStandardDeviation = Math.sqrt(variance);

      this.baselines.set(operation, {
        mean: newMean,
        standardDeviation: newStandardDeviation,
        sampleSize: newSampleSize,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Detect performance regression for a given operation
   */
  detectRegression(operation: string, currentTime: number): RegressionAnalysis | null {
    const baseline = this.baselines.get(operation);
    if (!baseline || baseline.sampleSize < 5) {
      return null; // Need sufficient baseline data
    }

    // Calculate z-score for statistical significance
    const zScore = (currentTime - baseline.mean) / baseline.standardDeviation;
    const isRegression = zScore > 2.0; // 95% confidence level
    const percentageChange = ((currentTime - baseline.mean) / baseline.mean) * 100;

    return {
      baseline,
      current: {
        value: currentTime,
        timestamp: Date.now()
      },
      analysis: {
        isRegression,
        confidenceLevel: 0.95,
        percentageChange,
        statisticalSignificance: Math.abs(zScore)
      }
    };
  }

  /**
   * Generate mathematical performance report
   */
  generateMathematicalReport(timeRange?: { start: number; end: number }): PerformanceReport {
    const metrics = this.metricsCollector.getMetrics('computation', timeRange);
    const mathematicalMetrics = metrics.filter(m => 
      (m as MathematicalMetric).mathematicalContext !== undefined
    ) as MathematicalMetric[];

    // Calculate summary statistics
    const totalMetrics = mathematicalMetrics.length;
    const averageComputationTime = totalMetrics > 0 
      ? mathematicalMetrics.reduce((sum, m) => sum + m.value, 0) / totalMetrics 
      : 0;

    const averageMemoryUsage = mathematicalMetrics
      .filter(m => m.mathematicalContext.memoryFootprint !== undefined)
      .reduce((sum, m, _, arr) => sum + (m.mathematicalContext.memoryFootprint! / arr.length), 0);

    // Calculate performance score (0-100)
    const performanceScore = this.calculatePerformanceScore(mathematicalMetrics);

    // Generate recommendations
    const recommendations = this.generateRecommendations(mathematicalMetrics);

    return {
      summary: {
        totalMetrics,
        averageComputationTime,
        averageMemoryUsage,
        performanceScore
      },
      trends: {
        computationTrend: this.analyzeTrend(mathematicalMetrics, 'computation'),
        memoryTrend: this.analyzeMemoryTrend(mathematicalMetrics),
        renderingTrend: this.analyzeTrend(mathematicalMetrics, 'rendering')
      },
      recommendations,
      timestamp: new Date().toISOString()
    };
  }

  private calculatePerformanceScore(metrics: MathematicalMetric[]): number {
    if (metrics.length === 0) return 100;

    let score = 100;
    let penaltyCount = 0;

    metrics.forEach(metric => {
      const operation = metric.mathematicalContext.operation;
      const threshold = this.getThresholdForOperation(operation, 'production');
      
      if (threshold) {
        // Penalize based on how much over threshold
        if (metric.value > threshold.maxExecutionTime) {
          const overage = (metric.value - threshold.maxExecutionTime) / threshold.maxExecutionTime;
          score -= Math.min(overage * 10, 20); // Max 20 points penalty per violation
          penaltyCount++;
        }

        if (metric.mathematicalContext.memoryFootprint && 
            metric.mathematicalContext.memoryFootprint > threshold.maxMemoryIncrease) {
          const overage = (metric.mathematicalContext.memoryFootprint - threshold.maxMemoryIncrease) / threshold.maxMemoryIncrease;
          score -= Math.min(overage * 5, 10); // Max 10 points penalty per violation
          penaltyCount++;
        }
      }
    });

    // Apply diminishing returns for multiple violations
    if (penaltyCount > 5) {
      score -= (penaltyCount - 5) * 2;
    }

    return Math.max(0, Math.min(100, score));
  }

  private analyzeTrend(metrics: MathematicalMetric[], type: string): 'improving' | 'stable' | 'degrading' {
    if (metrics.length < 10) return 'stable';

    const recent = metrics.slice(-5);
    const previous = metrics.slice(-10, -5);

    const recentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
    const previousAvg = previous.reduce((sum, m) => sum + m.value, 0) / previous.length;

    const change = (recentAvg - previousAvg) / previousAvg;

    if (change > 0.1) return 'degrading';
    if (change < -0.1) return 'improving';
    return 'stable';
  }

  private analyzeMemoryTrend(metrics: MathematicalMetric[]): 'stable' | 'increasing' | 'decreasing' {
    if (metrics.length < 10) return 'stable';

    const recent = metrics.slice(-5);
    const previous = metrics.slice(-10, -5);

    const recentAvg = recent.reduce((sum, m) => sum + (m.mathematicalContext.memoryFootprint || 0), 0) / recent.length;
    const previousAvg = previous.reduce((sum, m) => sum + (m.mathematicalContext.memoryFootprint || 0), 0) / previous.length;

    const change = (recentAvg - previousAvg) / previousAvg;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private generateRecommendations(metrics: MathematicalMetric[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Analyze slow operations
    const slowOperations = metrics.filter(m => {
      const threshold = this.getThresholdForOperation(m.mathematicalContext.operation, 'production');
      return threshold && m.value > threshold.maxExecutionTime;
    });

    if (slowOperations.length > 0) {
      const operationCounts = slowOperations.reduce((acc, m) => {
        acc[m.mathematicalContext.operation] = (acc[m.mathematicalContext.operation] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(operationCounts).forEach(([operation, count]) => {
        recommendations.push({
          type: 'optimization',
          priority: count > 5 ? 'high' : 'medium',
          message: `${operation} has ${count} slow executions`,
          action: `Consider optimizing ${operation} algorithm or adding caching`,
          metadata: { operation, slowCount: count }
        });
      });
    }

    // Analyze memory usage
    const highMemoryOperations = metrics.filter(m => {
      const threshold = this.getThresholdForOperation(m.mathematicalContext.operation, 'production');
      return threshold && m.mathematicalContext.memoryFootprint && 
             m.mathematicalContext.memoryFootprint > threshold.maxMemoryIncrease;
    });

    if (highMemoryOperations.length > 0) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        message: `${highMemoryOperations.length} operations exceeded memory thresholds`,
        action: 'Review memory allocation patterns and implement cleanup strategies',
        metadata: { highMemoryCount: highMemoryOperations.length }
      });
    }

    return recommendations;
  }

  private getThresholdForOperation(operation: string, environment: string): MathematicalPerformanceThreshold | undefined {
    const key = `${operation}_${environment}`;
    const thresholds = this.thresholds.get(key);
    return thresholds ? thresholds[0] : undefined;
  }

  private getMemoryUsage(): { heapUsed: number; heapTotal: number; external: number; rss: number } {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage();
    }
    
    // Browser fallback
    const performance = globalThis.performance as any;
    if (performance?.memory) {
      return {
        heapUsed: performance.memory.usedJSHeapSize || 0,
        heapTotal: performance.memory.totalJSHeapSize || 0,
        external: 0,
        rss: 0
      };
    }

    return { heapUsed: 0, heapTotal: 0, external: 0, rss: 0 };
  }

  /**
   * Enable or disable mathematical performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Get current enablement status
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Clear all baselines and metrics
   */
  reset(): void {
    this.baselines.clear();
    this.metricsCollector.clearMetrics();
  }

  /**
   * Export performance data for analysis
   */
  exportData(): {
    baselines: Record<string, RegressionAnalysis['baseline']>;
    thresholds: Record<string, MathematicalPerformanceThreshold[]>;
    metrics: MathematicalMetric[];
  } {
    return {
      baselines: Object.fromEntries(this.baselines),
      thresholds: Object.fromEntries(this.thresholds),
      metrics: this.metricsCollector.getMetrics('computation') as MathematicalMetric[]
    };
  }
}

// Export singleton instance
export const mathematicalPerformanceMonitor = MathematicalPerformanceMonitor.getInstance();