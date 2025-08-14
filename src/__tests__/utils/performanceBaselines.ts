/**
 * Performance Baselines and Alerting System
 * Manages performance baselines, thresholds, and regression alerts
 */

import { BenchmarkResult, PerformanceBaseline, RegressionDetectionResult } from './performanceBenchmark';

export interface PerformanceThreshold {
  operation: string;
  maxExecutionTime: number;
  maxMemoryIncrease?: number;
  environment: string;
  severity: 'warning' | 'error' | 'critical';
  description: string;
}

export interface PerformanceAlert {
  id: string;
  operation: string;
  severity: 'warning' | 'error' | 'critical';
  message: string;
  currentValue: number;
  thresholdValue: number;
  timestamp: number;
  environment: string;
  metadata?: Record<string, any>;
}

export interface BaselineConfiguration {
  minSampleSize: number;
  confidenceLevel: number;
  outlierThreshold: number;
  updateFrequency: 'daily' | 'weekly' | 'manual';
  environments: string[];
}

/**
 * Performance Baseline Manager
 */
export class PerformanceBaselineManager {
  private baselines: Map<string, PerformanceBaseline> = new Map();
  private thresholds: Map<string, PerformanceThreshold> = new Map();
  private alerts: PerformanceAlert[] = [];
  private config: BaselineConfiguration;

  constructor(config?: Partial<BaselineConfiguration>) {
    this.config = {
      minSampleSize: 20,
      confidenceLevel: 0.95,
      outlierThreshold: 2.0, // Standard deviations
      updateFrequency: 'weekly',
      environments: ['development', 'testing', 'production'],
      ...config
    };

    this.initializeDefaultThresholds();
  }

  /**
   * Initialize default performance thresholds for mathematical operations
   */
  private initializeDefaultThresholds(): void {
    const defaultThresholds: PerformanceThreshold[] = [
      {
        operation: 'group_validation',
        maxExecutionTime: 100, // 100ms
        environment: 'development',
        severity: 'warning',
        description: 'Group axiom validation should complete within 100ms'
      },
      {
        operation: 'group_validation',
        maxExecutionTime: 50, // 50ms in production
        environment: 'production',
        severity: 'error',
        description: 'Group axiom validation must complete within 50ms in production'
      },
      {
        operation: 'elliptic_curve_validation',
        maxExecutionTime: 25,
        environment: 'development',
        severity: 'warning',
        description: 'Elliptic curve validation should be fast'
      },
      {
        operation: 'tda_computation',
        maxExecutionTime: 1000,
        maxMemoryIncrease: 50 * 1024 * 1024, // 50MB
        environment: 'development',
        severity: 'error',
        description: 'TDA computations should complete within 1 second'
      },
      {
        operation: 'canvas_rendering',
        maxExecutionTime: 16.67, // 60fps target
        environment: 'production',
        severity: 'critical',
        description: 'Canvas rendering must maintain 60fps for smooth interaction'
      },
      {
        operation: 'webgl_rendering',
        maxExecutionTime: 8.33, // 120fps target for 3D
        environment: 'production',
        severity: 'warning',
        description: 'WebGL rendering should target 120fps for smooth 3D interaction'
      },
      {
        operation: 'svg_rendering',
        maxExecutionTime: 50,
        environment: 'development',
        severity: 'warning',
        description: 'SVG rendering should be responsive'
      },
      {
        operation: 'wasm_initialization',
        maxExecutionTime: 500,
        environment: 'production',
        severity: 'error',
        description: 'WASM modules should initialize quickly'
      },
      {
        operation: 'distance_matrix',
        maxExecutionTime: 2000,
        maxMemoryIncrease: 100 * 1024 * 1024, // 100MB
        environment: 'development',
        severity: 'warning',
        description: 'Distance matrix computation for large datasets'
      },
      {
        operation: 'mathematical_validation',
        maxExecutionTime: 200,
        environment: 'testing',
        severity: 'error',
        description: 'Mathematical validation should be efficient in tests'
      }
    ];

    defaultThresholds.forEach(threshold => {
      this.setThreshold(threshold);
    });
  }

  /**
   * Set performance threshold for an operation
   */
  setThreshold(threshold: PerformanceThreshold): void {
    const key = `${threshold.operation}_${threshold.environment}`;
    this.thresholds.set(key, threshold);
  }

  /**
   * Get performance threshold for an operation
   */
  getThreshold(operation: string, environment: string): PerformanceThreshold | undefined {
    const key = `${operation}_${environment}`;
    return this.thresholds.get(key) || this.thresholds.get(`${operation}_development`);
  }

  /**
   * Check benchmark result against thresholds and generate alerts
   */
  checkThresholds(
    result: BenchmarkResult, 
    environment: string = 'development'
  ): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];
    const threshold = this.getThreshold(result.operation, environment);

    if (!threshold) {
      return alerts;
    }

    // Check execution time threshold
    if (result.executionTime > threshold.maxExecutionTime) {
      alerts.push({
        id: `${result.operation}_${environment}_${Date.now()}`,
        operation: result.operation,
        severity: threshold.severity,
        message: `Execution time exceeded threshold: ${result.executionTime.toFixed(2)}ms > ${threshold.maxExecutionTime}ms`,
        currentValue: result.executionTime,
        thresholdValue: threshold.maxExecutionTime,
        timestamp: result.timestamp,
        environment,
        metadata: {
          iterations: result.iterations,
          description: threshold.description
        }
      });
    }

    // Check memory usage threshold if available
    if (threshold.maxMemoryIncrease && result.memoryUsage) {
      const memoryIncrease = result.memoryUsage.heapUsed;
      if (memoryIncrease > threshold.maxMemoryIncrease) {
        alerts.push({
          id: `${result.operation}_memory_${environment}_${Date.now()}`,
          operation: result.operation,
          severity: threshold.severity,
          message: `Memory usage exceeded threshold: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB > ${(threshold.maxMemoryIncrease / 1024 / 1024).toFixed(2)}MB`,
          currentValue: memoryIncrease,
          thresholdValue: threshold.maxMemoryIncrease,
          timestamp: result.timestamp,
          environment,
          metadata: {
            memoryUsage: result.memoryUsage,
            description: threshold.description
          }
        });
      }
    }

    // Store alerts
    alerts.forEach(alert => this.alerts.push(alert));

    return alerts;
  }

  /**
   * Create or update baseline from measurement data
   */
  createBaseline(
    operation: string,
    measurements: BenchmarkResult[],
    environment: string = 'development'
  ): PerformanceBaseline | null {
    if (measurements.length < this.config.minSampleSize) {
      console.warn(`Insufficient measurements for baseline: ${measurements.length} < ${this.config.minSampleSize}`);
      return null;
    }

    const times = measurements.map(m => m.executionTime);
    const cleanedTimes = this.removeOutliers(times);

    if (cleanedTimes.length < this.config.minSampleSize * 0.8) {
      console.warn(`Too many outliers removed for reliable baseline`);
      return null;
    }

    const stats = this.calculateStatistics(cleanedTimes);
    
    const baseline: PerformanceBaseline = {
      operation,
      meanTime: stats.mean,
      standardDeviation: stats.standardDeviation,
      percentiles: {
        p50: stats.percentiles[50],
        p90: stats.percentiles[90],
        p95: stats.percentiles[95],
        p99: stats.percentiles[99]
      },
      sampleSize: cleanedTimes.length,
      environment
    };

    const key = `${operation}_${environment}`;
    this.baselines.set(key, baseline);

    return baseline;
  }

  /**
   * Remove statistical outliers from measurements
   */
  private removeOutliers(values: number[]): number[] {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = this.getPercentile(sorted, 25);
    const q3 = this.getPercentile(sorted, 75);
    const iqr = q3 - q1;
    
    const lowerBound = q1 - this.config.outlierThreshold * iqr;
    const upperBound = q3 + this.config.outlierThreshold * iqr;
    
    return values.filter(val => val >= lowerBound && val <= upperBound);
  }

  /**
   * Calculate percentile from sorted array
   */
  private getPercentile(sorted: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }

  /**
   * Calculate comprehensive statistics
   */
  private calculateStatistics(values: number[]): {
    mean: number;
    standardDeviation: number;
    percentiles: Record<number, number>;
  } {
    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    const percentiles: Record<number, number> = {};
    [10, 25, 50, 75, 90, 95, 99].forEach(p => {
      percentiles[p] = this.getPercentile(sorted, p);
    });

    return { mean, standardDeviation, percentiles };
  }

  /**
   * Check if current measurement represents a regression
   */
  checkForRegression(
    operation: string,
    currentMeasurement: BenchmarkResult,
    environment: string = 'development'
  ): RegressionDetectionResult | null {
    const key = `${operation}_${environment}`;
    const baseline = this.baselines.get(key);

    if (!baseline) {
      return null;
    }

    // Simple regression detection based on standard deviations
    const deviation = (currentMeasurement.executionTime - baseline.meanTime) / baseline.standardDeviation;
    const isRegression = deviation > 2.0; // 2 sigma threshold
    const improvementThreshold = -1.0; // 1 sigma improvement

    let effect: 'improvement' | 'regression' | 'no_change';
    if (deviation > 2.0) {
      effect = 'regression';
    } else if (deviation < improvementThreshold) {
      effect = 'improvement';
    } else {
      effect = 'no_change';
    }

    const percentageChange = ((currentMeasurement.executionTime - baseline.meanTime) / baseline.meanTime) * 100;

    return {
      isRegression,
      confidenceLevel: this.config.confidenceLevel,
      significanceTest: 'standard_deviation_threshold',
      pValue: deviation > 0 ? 0.05 : 0.95, // Simplified p-value
      effect,
      magnitude: Math.abs(percentageChange)
    };
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(maxAge: number = 24 * 60 * 60 * 1000): PerformanceAlert[] {
    const cutoff = Date.now() - maxAge;
    return this.alerts.filter(alert => alert.timestamp > cutoff);
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: 'warning' | 'error' | 'critical'): PerformanceAlert[] {
    return this.alerts.filter(alert => alert.severity === severity);
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(maxAge: number = 7 * 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - maxAge;
    const initialCount = this.alerts.length;
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoff);
    return initialCount - this.alerts.length;
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(environment: string = 'development'): {
    baselines: PerformanceBaseline[];
    thresholds: PerformanceThreshold[];
    recentAlerts: PerformanceAlert[];
    summary: {
      totalBaselines: number;
      totalThresholds: number;
      criticalAlerts: number;
      errorAlerts: number;
      warningAlerts: number;
      environment: string;
      generatedAt: string;
    };
  } {
    const envBaselines = Array.from(this.baselines.values())
      .filter(b => b.environment === environment);
    
    const envThresholds = Array.from(this.thresholds.values())
      .filter(t => t.environment === environment);
    
    const recentAlerts = this.getActiveAlerts();
    const criticalAlerts = recentAlerts.filter(a => a.severity === 'critical').length;
    const errorAlerts = recentAlerts.filter(a => a.severity === 'error').length;
    const warningAlerts = recentAlerts.filter(a => a.severity === 'warning').length;

    return {
      baselines: envBaselines,
      thresholds: envThresholds,
      recentAlerts,
      summary: {
        totalBaselines: envBaselines.length,
        totalThresholds: envThresholds.length,
        criticalAlerts,
        errorAlerts,
        warningAlerts,
        environment,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Export baseline data for storage
   */
  exportBaselines(): Record<string, PerformanceBaseline> {
    return Object.fromEntries(this.baselines);
  }

  /**
   * Import baseline data from storage
   */
  importBaselines(baselines: Record<string, PerformanceBaseline>): void {
    Object.entries(baselines).forEach(([key, baseline]) => {
      this.baselines.set(key, baseline);
    });
  }

  /**
   * Update configuration
   */
  updateConfiguration(config: Partial<BaselineConfiguration>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfiguration(): BaselineConfiguration {
    return { ...this.config };
  }

  /**
   * Reset all baselines and alerts
   */
  reset(): void {
    this.baselines.clear();
    this.alerts = [];
    this.initializeDefaultThresholds();
  }
}

/**
 * Performance Alert Handler
 */
export class PerformanceAlertHandler {
  private handlers: Map<string, (alert: PerformanceAlert) => void> = new Map();

  /**
   * Register alert handler for specific severity
   */
  registerHandler(severity: 'warning' | 'error' | 'critical', handler: (alert: PerformanceAlert) => void): void {
    this.handlers.set(severity, handler);
  }

  /**
   * Process alert through appropriate handler
   */
  handleAlert(alert: PerformanceAlert): void {
    const handler = this.handlers.get(alert.severity);
    if (handler) {
      handler(alert);
    } else {
      // Default console logging
      this.defaultHandler(alert);
    }
  }

  /**
   * Process multiple alerts
   */
  handleAlerts(alerts: PerformanceAlert[]): void {
    alerts.forEach(alert => this.handleAlert(alert));
  }

  /**
   * Default alert handler
   */
  private defaultHandler(alert: PerformanceAlert): void {
    const icon = {
      warning: '⚠️',
      error: '❌',
      critical: '🚨'
    }[alert.severity];

    console.log(`${icon} Performance Alert [${alert.severity.toUpperCase()}]`);
    console.log(`  Operation: ${alert.operation}`);
    console.log(`  Message: ${alert.message}`);
    console.log(`  Environment: ${alert.environment}`);
    console.log(`  Timestamp: ${new Date(alert.timestamp).toISOString()}`);
    
    if (alert.metadata) {
      console.log(`  Metadata:`, alert.metadata);
    }
  }
}

// Global baseline manager instance
export const globalBaselineManager = new PerformanceBaselineManager();
export const globalAlertHandler = new PerformanceAlertHandler();

// Set up default alert handlers
globalAlertHandler.registerHandler('critical', (alert) => {
  console.error(`🚨 CRITICAL PERFORMANCE ALERT: ${alert.message}`);
  // In production, this could send notifications, log to monitoring systems, etc.
});

globalAlertHandler.registerHandler('error', (alert) => {
  console.error(`❌ Performance Error: ${alert.message}`);
});

globalAlertHandler.registerHandler('warning', (alert) => {
  console.warn(`⚠️ Performance Warning: ${alert.message}`);
});