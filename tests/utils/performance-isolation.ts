/**
 * Performance Test Isolation Framework
 * Ensures accurate performance measurements by isolating tests from system interference
 */

import { performance as nodePerformance } from 'perf_hooks';
import { cpus } from 'os';

export interface PerformanceTestConfig {
  name: string;
  category: 'mathematical' | 'rendering' | 'memory' | 'network' | 'storage';
  iterations: number;
  warmupIterations: number;
  cooldownMs: number;
  timeoutMs: number;
  memoryThresholdMB: number;
  cpuThresholdPercent: number;
  isolationLevel: 'none' | 'process' | 'worker' | 'container';
  baseline?: PerformanceMeasurement;
}

export interface PerformanceMeasurement {
  testName: string;
  startTime: number;
  endTime: number;
  duration: number;
  memoryBefore: NodeJS.MemoryUsage;
  memoryAfter: NodeJS.MemoryUsage;
  memoryDelta: number;
  cpuUsage: number;
  iterations: number;
  samples: number[];
  statistics: PerformanceStatistics;
  environment: EnvironmentSnapshot;
  interference: InterferenceMetrics;
}

export interface PerformanceStatistics {
  mean: number;
  median: number;
  min: number;
  max: number;
  standardDeviation: number;
  variance: number;
  percentile95: number;
  percentile99: number;
  outliers: number[];
  coefficientOfVariation: number;
}

export interface EnvironmentSnapshot {
  timestamp: number;
  nodeVersion: string;
  platform: string;
  cpuCount: number;
  totalMemoryMB: number;
  freeMemoryMB: number;
  loadAverage: number[];
  activeProcesses: number;
  systemUptime: number;
}

export interface InterferenceMetrics {
  backgroundCpuUsage: number;
  memoryPressure: number;
  networkActivity: number;
  diskActivity: number;
  garbageCollections: number;
  interruptionCount: number;
  stabilityScore: number; // 0-1, higher is better
}

/**
 * System resource monitor for detecting interference
 */
export class SystemResourceMonitor {
  private static instance: SystemResourceMonitor;
  private monitoring = false;
  private samples: Array<{
    timestamp: number;
    cpu: number;
    memory: number;
    load: number[];
  }> = [];
  private gcCount = 0;
  private lastGCTime = 0;

  static getInstance(): SystemResourceMonitor {
    if (!this.instance) {
      this.instance = new SystemResourceMonitor();
    }
    return this.instance;
  }

  startMonitoring(intervalMs: number = 1000): void {
    if (this.monitoring) return;

    this.monitoring = true;
    this.samples = [];
    this.gcCount = 0;

    // Monitor garbage collection
    if (typeof process.setMaxListeners === 'function') {
      process.setMaxListeners(0);
    }

    const sampleLoop = () => {
      if (!this.monitoring) return;

      const sample = {
        timestamp: Date.now(),
        cpu: process.cpuUsage().user / 1000, // Convert to ms
        memory: process.memoryUsage().heapUsed / (1024 * 1024), // Convert to MB
        load: require('os').loadavg()
      };

      this.samples.push(sample);

      // Keep only recent samples (last 5 minutes)
      const cutoff = Date.now() - 5 * 60 * 1000;
      this.samples = this.samples.filter(s => s.timestamp > cutoff);

      setTimeout(sampleLoop, intervalMs);
    };

    sampleLoop();
  }

  stopMonitoring(): void {
    this.monitoring = false;
  }

  getInterferenceMetrics(): InterferenceMetrics {
    if (this.samples.length < 2) {
      return {
        backgroundCpuUsage: 0,
        memoryPressure: 0,
        networkActivity: 0,
        diskActivity: 0,
        garbageCollections: this.gcCount,
        interruptionCount: 0,
        stabilityScore: 1.0
      };
    }

    const recentSamples = this.samples.slice(-60); // Last minute
    const cpuUsages = recentSamples.map(s => s.cpu);
    const memoryUsages = recentSamples.map(s => s.memory);
    const loadAverages = recentSamples.map(s => s.load[0]);

    const cpuStdDev = this.calculateStandardDeviation(cpuUsages);
    const memoryStdDev = this.calculateStandardDeviation(memoryUsages);
    const loadStdDev = this.calculateStandardDeviation(loadAverages);

    // Calculate stability score (lower variance = higher stability)
    const cpuStability = Math.max(0, 1 - (cpuStdDev / 100));
    const memoryStability = Math.max(0, 1 - (memoryStdDev / 100));
    const loadStability = Math.max(0, 1 - (loadStdDev / cpus().length));
    const stabilityScore = (cpuStability + memoryStability + loadStability) / 3;

    return {
      backgroundCpuUsage: cpuUsages[cpuUsages.length - 1] || 0,
      memoryPressure: Math.max(...memoryUsages) / 1024, // Convert to GB
      networkActivity: 0, // Would need system-specific implementation
      diskActivity: 0, // Would need system-specific implementation
      garbageCollections: this.gcCount,
      interruptionCount: Math.max(0, cpuUsages.length - this.countStableRuns(cpuUsages)),
      stabilityScore
    };
  }

  private calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private countStableRuns(values: number[], threshold: number = 10): number {
    let stableRuns = 0;
    for (let i = 1; i < values.length; i++) {
      if (Math.abs(values[i] - values[i - 1]) <= threshold) {
        stableRuns++;
      }
    }
    return stableRuns;
  }

  cleanup(): void {
    this.stopMonitoring();
    this.samples = [];
    this.gcCount = 0;
  }
}

/**
 * Performance measurement utilities
 */
export class PerformanceMeasurer {
  private static measurements: Map<string, PerformanceMeasurement[]> = new Map();

  static calculateStatistics(samples: number[]): PerformanceStatistics {
    if (samples.length === 0) {
      throw new Error('Cannot calculate statistics for empty sample set');
    }

    const sorted = [...samples].sort((a, b) => a - b);
    const mean = samples.reduce((sum, val) => sum + val, 0) / samples.length;
    const variance = samples.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / samples.length;
    const standardDeviation = Math.sqrt(variance);

    // Identify outliers using IQR method
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const outliers = samples.filter(val => val < lowerBound || val > upperBound);

    return {
      mean,
      median: sorted[Math.floor(sorted.length / 2)],
      min: Math.min(...samples),
      max: Math.max(...samples),
      standardDeviation,
      variance,
      percentile95: sorted[Math.floor(sorted.length * 0.95)],
      percentile99: sorted[Math.floor(sorted.length * 0.99)],
      outliers,
      coefficientOfVariation: standardDeviation / mean
    };
  }

  static async measureFunction<T>(
    testName: string,
    testFunction: () => Promise<T> | T,
    config: Partial<PerformanceTestConfig> = {}
  ): Promise<PerformanceMeasurement> {
    const fullConfig: PerformanceTestConfig = {
      name: testName,
      category: 'mathematical',
      iterations: 10,
      warmupIterations: 3,
      cooldownMs: 100,
      timeoutMs: 30000,
      memoryThresholdMB: 1024,
      cpuThresholdPercent: 80,
      isolationLevel: 'process',
      ...config
    };

    // Wait for system to stabilize
    await this.waitForStableSystem(fullConfig);

    // Warmup iterations
    for (let i = 0; i < fullConfig.warmupIterations; i++) {
      try {
        await testFunction();
      } catch (error) {
        console.warn(`Warmup iteration ${i + 1} failed:`, error);
      }
      await this.sleep(fullConfig.cooldownMs);
    }

    // Force garbage collection before measurement
    if (global.gc) {
      global.gc();
    }

    const samples: number[] = [];
    const startEnvironment = this.captureEnvironmentSnapshot();
    const memoryBefore = process.memoryUsage();
    const startTime = nodePerformance.now();

    // Actual measurement iterations
    for (let i = 0; i < fullConfig.iterations; i++) {
      const iterationStart = nodePerformance.now();
      
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Test iteration timed out')), fullConfig.timeoutMs);
        });

        await Promise.race([testFunction(), timeoutPromise]);
        
        const iterationEnd = nodePerformance.now();
        samples.push(iterationEnd - iterationStart);
      } catch (error) {
        console.warn(`Test iteration ${i + 1} failed:`, error);
        // Continue with other iterations
      }

      // Cooldown between iterations
      if (i < fullConfig.iterations - 1) {
        await this.sleep(fullConfig.cooldownMs);
      }
    }

    const endTime = nodePerformance.now();
    const memoryAfter = process.memoryUsage();
    const totalDuration = endTime - startTime;

    if (samples.length === 0) {
      throw new Error('All test iterations failed');
    }

    // Calculate memory delta
    const memoryDelta = (memoryAfter.heapUsed - memoryBefore.heapUsed) / (1024 * 1024);

    // Get interference metrics
    const monitor = SystemResourceMonitor.getInstance();
    const interference = monitor.getInterferenceMetrics();

    // Calculate statistics
    const statistics = this.calculateStatistics(samples);

    const measurement: PerformanceMeasurement = {
      testName,
      startTime,
      endTime,
      duration: totalDuration,
      memoryBefore,
      memoryAfter,
      memoryDelta,
      cpuUsage: process.cpuUsage().user / 1000,
      iterations: fullConfig.iterations,
      samples,
      statistics,
      environment: startEnvironment,
      interference
    };

    // Store measurement
    if (!this.measurements.has(testName)) {
      this.measurements.set(testName, []);
    }
    this.measurements.get(testName)!.push(measurement);

    return measurement;
  }

  static async waitForStableSystem(
    config: PerformanceTestConfig,
    maxWaitMs: number = 30000
  ): Promise<void> {
    const monitor = SystemResourceMonitor.getInstance();
    monitor.startMonitoring(500); // Check every 500ms

    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const interference = monitor.getInterferenceMetrics();
      
      if (interference.stabilityScore > 0.8 && // Good stability
          interference.backgroundCpuUsage < config.cpuThresholdPercent) {
        break;
      }

      await this.sleep(1000); // Wait 1 second before checking again
    }
  }

  static detectRegression(
    testName: string,
    currentMeasurement: PerformanceMeasurement,
    threshold: number = 0.2 // 20% slower is considered regression
  ): {
    isRegression: boolean;
    percentageChange: number;
    baseline: PerformanceMeasurement;
    significance: number;
  } | null {
    const measurements = this.measurements.get(testName);
    if (!measurements || measurements.length < 2) {
      return null;
    }

    // Use the measurement before current as baseline
    const baseline = measurements[measurements.length - 2];
    const currentMean = currentMeasurement.statistics.mean;
    const baselineMean = baseline.statistics.mean;

    const percentageChange = (currentMean - baselineMean) / baselineMean;
    const isRegression = percentageChange > threshold;

    // Calculate statistical significance using t-test approximation
    const pooledStdDev = Math.sqrt(
      (baseline.statistics.variance + currentMeasurement.statistics.variance) / 2
    );
    const standardError = pooledStdDev * Math.sqrt(
      1 / baseline.samples.length + 1 / currentMeasurement.samples.length
    );
    const tScore = Math.abs(currentMean - baselineMean) / standardError;
    const significance = tScore; // Simplified significance score

    return {
      isRegression,
      percentageChange,
      baseline,
      significance
    };
  }

  static generatePerformanceReport(testName?: string): {
    tests: string[];
    measurements: PerformanceMeasurement[];
    summary: {
      totalTests: number;
      averageDuration: number;
      memoryEfficiency: number;
      stabilityScore: number;
    };
    regressions: Array<{
      testName: string;
      percentageChange: number;
      significance: number;
    }>;
    recommendations: string[];
  } {
    const testsToReport = testName ? [testName] : Array.from(this.measurements.keys());
    const allMeasurements: PerformanceMeasurement[] = [];

    for (const test of testsToReport) {
      const measurements = this.measurements.get(test) || [];
      allMeasurements.push(...measurements);
    }

    if (allMeasurements.length === 0) {
      return {
        tests: [],
        measurements: [],
        summary: { totalTests: 0, averageDuration: 0, memoryEfficiency: 0, stabilityScore: 0 },
        regressions: [],
        recommendations: []
      };
    }

    // Calculate summary statistics
    const totalDurations = allMeasurements.map(m => m.statistics.mean);
    const averageDuration = totalDurations.reduce((sum, d) => sum + d, 0) / totalDurations.length;
    
    const memoryDeltas = allMeasurements.map(m => Math.abs(m.memoryDelta));
    const memoryEfficiency = 1 - (memoryDeltas.reduce((sum, d) => sum + d, 0) / memoryDeltas.length / 100);
    
    const stabilityScores = allMeasurements.map(m => m.interference.stabilityScore);
    const stabilityScore = stabilityScores.reduce((sum, s) => sum + s, 0) / stabilityScores.length;

    // Detect regressions
    const regressions: Array<{
      testName: string;
      percentageChange: number;
      significance: number;
    }> = [];

    for (const test of testsToReport) {
      const measurements = this.measurements.get(test) || [];
      if (measurements.length >= 2) {
        const latest = measurements[measurements.length - 1];
        const regression = this.detectRegression(test, latest);
        if (regression && regression.isRegression) {
          regressions.push({
            testName: test,
            percentageChange: regression.percentageChange,
            significance: regression.significance
          });
        }
      }
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(allMeasurements, averageDuration, memoryEfficiency, stabilityScore);

    return {
      tests: testsToReport,
      measurements: allMeasurements,
      summary: {
        totalTests: testsToReport.length,
        averageDuration,
        memoryEfficiency,
        stabilityScore
      },
      regressions,
      recommendations
    };
  }

  private static captureEnvironmentSnapshot(): EnvironmentSnapshot {
    const os = require('os');
    
    return {
      timestamp: Date.now(),
      nodeVersion: process.version,
      platform: os.platform(),
      cpuCount: os.cpus().length,
      totalMemoryMB: os.totalmem() / (1024 * 1024),
      freeMemoryMB: os.freemem() / (1024 * 1024),
      loadAverage: os.loadavg(),
      activeProcesses: 0, // Would need system-specific implementation
      systemUptime: os.uptime()
    };
  }

  private static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static generateRecommendations(
    measurements: PerformanceMeasurement[],
    averageDuration: number,
    memoryEfficiency: number,
    stabilityScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (averageDuration > 1000) {
      recommendations.push('Consider optimizing algorithms or reducing computational complexity for long-running tests');
    }

    if (memoryEfficiency < 0.7) {
      recommendations.push('High memory usage detected - review memory allocation and cleanup procedures');
    }

    if (stabilityScore < 0.6) {
      recommendations.push('System instability detected - consider running tests on a dedicated machine or during low-activity periods');
    }

    const highVariabilityTests = measurements.filter(m => m.statistics.coefficientOfVariation > 0.3);
    if (highVariabilityTests.length > 0) {
      recommendations.push('High performance variability detected - increase iteration count or improve test isolation');
    }

    const memoryLeaks = measurements.filter(m => m.memoryDelta > 100); // More than 100MB increase
    if (memoryLeaks.length > 0) {
      recommendations.push('Potential memory leaks detected in some tests - review cleanup procedures');
    }

    return recommendations;
  }

  static cleanup(): void {
    this.measurements.clear();
    SystemResourceMonitor.getInstance().cleanup();
  }
}

/**
 * Performance test isolation utilities
 */
export class PerformanceIsolation {
  static async withIsolation<T>(
    testName: string,
    testFunction: () => Promise<T> | T,
    config: Partial<PerformanceTestConfig> = {}
  ): Promise<{ result: T; measurement: PerformanceMeasurement }> {
    // Start system monitoring
    const monitor = SystemResourceMonitor.getInstance();
    monitor.startMonitoring();

    try {
      // Measure the test function
      const measurement = await PerformanceMeasurer.measureFunction(testName, testFunction, config);
      
      // Execute the function one more time to get the actual result
      const result = await testFunction();

      return { result, measurement };
    } finally {
      monitor.stopMonitoring();
    }
  }

  static async runParallelPerformanceTests(
    tests: Array<{
      name: string;
      function: () => Promise<any> | any;
      config?: Partial<PerformanceTestConfig>;
    }>
  ): Promise<PerformanceMeasurement[]> {
    // Run tests sequentially to avoid interference
    const measurements: PerformanceMeasurement[] = [];

    for (const test of tests) {
      try {
        const measurement = await PerformanceMeasurer.measureFunction(
          test.name,
          test.function,
          test.config
        );
        measurements.push(measurement);
      } catch (error) {
        console.error(`Performance test '${test.name}' failed:`, error);
      }

      // Cooldown between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return measurements;
  }
}

/**
 * Export performance isolation utilities
 */
export const PerformanceIsolationUtils = {
  SystemResourceMonitor,
  PerformanceMeasurer,
  PerformanceIsolation
};

export default PerformanceIsolationUtils;