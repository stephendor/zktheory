/**
 * Performance Benchmarking Framework for Mathematical Computations
 * Provides comprehensive benchmarking utilities for execution time analysis,
 * statistical performance regression detection, and performance baseline management
 */

import { performance } from 'perf_hooks';
import { GroupTheoryValidator, TDAValidator, PrecisionValidator } from './mathematicalValidation';
import type { Group } from '@/lib/GroupTheory';
import type { EllipticCurvePoint, EllipticCurve } from '@/lib/EllipticCurveGroups';

// Performance measurement interfaces
export interface BenchmarkResult {
  operation: string;
  executionTime: number;
  memoryUsage?: MemoryUsage;
  iterations: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface MemoryUsage {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

export interface PerformanceBaseline {
  operation: string;
  meanTime: number;
  standardDeviation: number;
  percentiles: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };
  sampleSize: number;
  environment: string;
}

export interface StatisticalAnalysis {
  mean: number;
  median: number;
  standardDeviation: number;
  variance: number;
  min: number;
  max: number;
  percentiles: Record<number, number>;
  outliers: number[];
}

export interface RegressionDetectionResult {
  isRegression: boolean;
  confidenceLevel: number;
  significanceTest: string;
  pValue: number;
  effect: 'improvement' | 'regression' | 'no_change';
  magnitude: number;
}

/**
 * Performance Benchmarking Framework
 */
export class PerformanceBenchmark {
  private baselines: Map<string, PerformanceBaseline> = new Map();
  private measurements: Map<string, BenchmarkResult[]> = new Map();
  
  /**
   * Measure execution time of a function with multiple iterations
   */
  async measureExecutionTime<T>(
    operation: string,
    fn: () => T | Promise<T>,
    iterations: number = 100,
    warmupIterations: number = 10
  ): Promise<BenchmarkResult> {
    // Warmup runs to stabilize JIT compilation
    for (let i = 0; i < warmupIterations; i++) {
      await fn();
    }

    const times: number[] = [];
    const initialMemory = this.getMemoryUsage();
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      await fn();
      const endTime = performance.now();
      times.push(endTime - startTime);
    }

    const finalMemory = this.getMemoryUsage();
    const meanTime = times.reduce((sum, time) => sum + time, 0) / times.length;

    const result: BenchmarkResult = {
      operation,
      executionTime: meanTime,
      memoryUsage: {
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
        external: finalMemory.external - initialMemory.external,
        rss: finalMemory.rss - initialMemory.rss,
      },
      iterations,
      timestamp: Date.now(),
      metadata: {
        times,
        statistics: this.calculateStatistics(times)
      }
    };

    // Store measurement
    if (!this.measurements.has(operation)) {
      this.measurements.set(operation, []);
    }
    this.measurements.get(operation)!.push(result);

    return result;
  }

  /**
   * Benchmark group theory operations
   */
  async benchmarkGroupOperations(group: Group): Promise<Map<string, BenchmarkResult>> {
    const results = new Map<string, BenchmarkResult>();

    // Benchmark group multiplication
    const elements = group.elements.slice(0, Math.min(10, group.elements.length));
    results.set('group_multiplication', await this.measureExecutionTime(
      'group_multiplication',
      () => {
        for (const a of elements) {
          for (const b of elements) {
            group.operations.get(a.id)?.get(b.id);
          }
        }
      },
      50
    ));

    // Benchmark group validation
    results.set('group_validation', await this.measureExecutionTime(
      'group_validation',
      () => GroupTheoryValidator.validateGroupAxioms(group),
      20
    ));

    // Benchmark generator validation
    results.set('generator_validation', await this.measureExecutionTime(
      'generator_validation',
      () => GroupTheoryValidator.validateGenerators(group),
      10
    ));

    // Benchmark Lagrange theorem check
    results.set('lagrange_validation', await this.measureExecutionTime(
      'lagrange_validation',
      () => GroupTheoryValidator.validateLagrangeTheorem(group),
      30
    ));

    return results;
  }

  /**
   * Benchmark elliptic curve operations
   */
  async benchmarkEllipticCurveOperations(
    curve: EllipticCurve,
    points: EllipticCurvePoint[]
  ): Promise<Map<string, BenchmarkResult>> {
    const results = new Map<string, BenchmarkResult>();

    // Benchmark point validation
    results.set('point_validation', await this.measureExecutionTime(
      'point_validation',
      () => {
        points.forEach(point => 
          EllipticCurveValidator.validatePointOnCurve(point, curve)
        );
      },
      100
    ));

    // Benchmark curve validation
    results.set('curve_validation', await this.measureExecutionTime(
      'curve_validation',
      () => EllipticCurveValidator.validateCurve(curve),
      200
    ));

    return results;
  }

  /**
   * Benchmark TDA computations
   */
  async benchmarkTDAOperations(
    pointClouds: number[][][], // Array of point clouds
    maxRadius: number = 1.0
  ): Promise<Map<string, BenchmarkResult>> {
    const results = new Map<string, BenchmarkResult>();

    // Note: These benchmarks assume TDA functions exist in the TDAEngine
    // They serve as templates for when the actual TDA implementation is available

    // Benchmark distance matrix computation
    results.set('distance_matrix', await this.measureExecutionTime(
      'distance_matrix',
      () => {
        pointClouds.forEach(pointCloud => {
          // Simulate distance matrix computation
          for (let i = 0; i < pointCloud.length; i++) {
            for (let j = i + 1; j < pointCloud.length; j++) {
              const dist = Math.sqrt(
                pointCloud[i].reduce((sum, coord, k) => 
                  sum + Math.pow(coord - pointCloud[j][k], 2), 0
                )
              );
            }
          }
        });
      },
      20
    ));

    // Benchmark Vietoris-Rips complex construction
    results.set('vr_complex', await this.measureExecutionTime(
      'vr_complex',
      () => {
        pointClouds.forEach(pointCloud => {
          // Simulate VR complex construction
          const edges = [];
          for (let i = 0; i < pointCloud.length; i++) {
            for (let j = i + 1; j < pointCloud.length; j++) {
              const dist = Math.sqrt(
                pointCloud[i].reduce((sum, coord, k) => 
                  sum + Math.pow(coord - pointCloud[j][k], 2), 0
                )
              );
              if (dist <= maxRadius) {
                edges.push([i, j]);
              }
            }
          }
        });
      },
      10
    ));

    return results;
  }

  /**
   * Perform statistical analysis on execution times
   */
  calculateStatistics(values: number[]): StatisticalAnalysis {
    const sorted = [...values].sort((a, b) => a - b);
    const n = values.length;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const standardDeviation = Math.sqrt(variance);
    
    const getPercentile = (p: number) => {
      const index = Math.ceil((p / 100) * n) - 1;
      return sorted[Math.max(0, Math.min(index, n - 1))];
    };

    // Detect outliers using IQR method
    const q1 = getPercentile(25);
    const q3 = getPercentile(75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const outliers = values.filter(val => val < lowerBound || val > upperBound);

    return {
      mean,
      median: getPercentile(50),
      standardDeviation,
      variance,
      min: sorted[0],
      max: sorted[n - 1],
      percentiles: {
        10: getPercentile(10),
        25: getPercentile(25),
        50: getPercentile(50),
        75: getPercentile(75),
        90: getPercentile(90),
        95: getPercentile(95),
        99: getPercentile(99)
      },
      outliers
    };
  }

  /**
   * Detect performance regressions using statistical analysis
   */
  detectRegression(
    baseline: number[],
    current: number[],
    significanceLevel: number = 0.05
  ): RegressionDetectionResult {
    const baselineStats = this.calculateStatistics(baseline);
    const currentStats = this.calculateStatistics(current);

    // Perform two-sample t-test
    const tTest = this.performTTest(baseline, current);
    
    // Calculate effect size (Cohen's d)
    const pooledStd = Math.sqrt(
      ((baseline.length - 1) * Math.pow(baselineStats.standardDeviation, 2) +
       (current.length - 1) * Math.pow(currentStats.standardDeviation, 2)) /
      (baseline.length + current.length - 2)
    );
    
    const cohensD = (currentStats.mean - baselineStats.mean) / pooledStd;
    
    const isSignificant = tTest.pValue < significanceLevel;
    const percentageChange = ((currentStats.mean - baselineStats.mean) / baselineStats.mean) * 100;
    
    let effect: 'improvement' | 'regression' | 'no_change';
    if (!isSignificant) {
      effect = 'no_change';
    } else if (currentStats.mean > baselineStats.mean) {
      effect = 'regression';
    } else {
      effect = 'improvement';
    }

    return {
      isRegression: isSignificant && effect === 'regression',
      confidenceLevel: 1 - significanceLevel,
      significanceTest: 'two_sample_t_test',
      pValue: tTest.pValue,
      effect,
      magnitude: Math.abs(percentageChange)
    };
  }

  /**
   * Perform two-sample t-test
   */
  private performTTest(sample1: number[], sample2: number[]): { tStatistic: number; pValue: number } {
    const n1 = sample1.length;
    const n2 = sample2.length;
    
    const mean1 = sample1.reduce((sum, val) => sum + val, 0) / n1;
    const mean2 = sample2.reduce((sum, val) => sum + val, 0) / n2;
    
    const var1 = sample1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (n1 - 1);
    const var2 = sample2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (n2 - 1);
    
    const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
    const standardError = Math.sqrt(pooledVar * (1/n1 + 1/n2));
    
    const tStatistic = (mean1 - mean2) / standardError;
    const degreesOfFreedom = n1 + n2 - 2;
    
    // Approximate p-value calculation (simplified)
    const pValue = this.approximateTTestPValue(tStatistic, degreesOfFreedom);
    
    return { tStatistic, pValue };
  }

  /**
   * Approximate p-value for t-test (simplified implementation)
   */
  private approximateTTestPValue(t: number, df: number): number {
    const absT = Math.abs(t);
    
    // Very rough approximation - in production, use a proper statistical library
    if (absT > 3) return 0.001;
    if (absT > 2.5) return 0.01;
    if (absT > 2) return 0.05;
    if (absT > 1.5) return 0.1;
    return 0.5;
  }

  /**
   * Create performance baseline from historical measurements
   */
  createBaseline(operation: string, environment: string = 'default'): PerformanceBaseline | null {
    const measurements = this.measurements.get(operation);
    if (!measurements || measurements.length < 10) {
      return null; // Need at least 10 measurements for reliable baseline
    }

    const times = measurements.map(m => m.executionTime);
    const stats = this.calculateStatistics(times);

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
      sampleSize: measurements.length,
      environment
    };

    this.baselines.set(`${operation}_${environment}`, baseline);
    return baseline;
  }

  /**
   * Check current performance against baseline
   */
  checkAgainstBaseline(
    operation: string,
    currentMeasurements: number[],
    environment: string = 'default'
  ): RegressionDetectionResult | null {
    const baseline = this.baselines.get(`${operation}_${environment}`);
    if (!baseline) {
      return null;
    }

    const baselineMeasurements = this.measurements.get(operation);
    if (!baselineMeasurements) {
      return null;
    }

    const baselineTimes = baselineMeasurements.map(m => m.executionTime);
    return this.detectRegression(baselineTimes, currentMeasurements);
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): MemoryUsage {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        external: usage.external,
        rss: usage.rss
      };
    }
    
    // Browser environment fallback
    return {
      heapUsed: 0,
      heapTotal: 0,
      external: 0,
      rss: 0
    };
  }

  /**
   * Export performance data for reporting
   */
  exportPerformanceReport(): {
    measurements: Record<string, BenchmarkResult[]>;
    baselines: Record<string, PerformanceBaseline>;
    summary: Record<string, any>;
  } {
    const measurementObj = Object.fromEntries(this.measurements);
    const baselineObj = Object.fromEntries(this.baselines);
    
    const summary = {
      totalOperations: this.measurements.size,
      totalMeasurements: Array.from(this.measurements.values()).reduce((sum, arr) => sum + arr.length, 0),
      availableBaselines: this.baselines.size,
      generatedAt: new Date().toISOString()
    };

    return {
      measurements: measurementObj,
      baselines: baselineObj,
      summary
    };
  }

  /**
   * Load performance baselines from external data
   */
  loadBaselines(baselines: Record<string, PerformanceBaseline>): void {
    Object.entries(baselines).forEach(([key, baseline]) => {
      this.baselines.set(key, baseline);
    });
  }

  /**
   * Clear all measurements and baselines
   */
  reset(): void {
    this.measurements.clear();
    this.baselines.clear();
  }
}

/**
 * WASM Performance Benchmarking Utilities
 */
export class WASMPerformanceBenchmark extends PerformanceBenchmark {
  /**
   * Benchmark WASM module loading and initialization
   */
  async benchmarkWASMInitialization(wasmModuleLoader: () => Promise<any>): Promise<BenchmarkResult> {
    return await this.measureExecutionTime(
      'wasm_initialization',
      wasmModuleLoader,
      5, // Fewer iterations for initialization
      1   // Single warmup
    );
  }

  /**
   * Benchmark WASM vs JavaScript performance comparison
   */
  async benchmarkWASMvsJS<T>(
    operation: string,
    wasmFunction: () => T,
    jsFunction: () => T,
    iterations: number = 100
  ): Promise<{
    wasmResult: BenchmarkResult;
    jsResult: BenchmarkResult;
    speedup: number;
    recommendation: string;
  }> {
    const wasmResult = await this.measureExecutionTime(
      `${operation}_wasm`,
      wasmFunction,
      iterations
    );

    const jsResult = await this.measureExecutionTime(
      `${operation}_js`,
      jsFunction,
      iterations
    );

    const speedup = jsResult.executionTime / wasmResult.executionTime;
    
    let recommendation: string;
    if (speedup > 2) {
      recommendation = 'WASM shows significant performance improvement';
    } else if (speedup > 1.2) {
      recommendation = 'WASM shows moderate performance improvement';
    } else if (speedup > 0.8) {
      recommendation = 'Performance is similar between WASM and JS';
    } else {
      recommendation = 'JavaScript shows better performance than WASM';
    }

    return {
      wasmResult,
      jsResult,
      speedup,
      recommendation
    };
  }
}

/**
 * Visualization Performance Benchmark
 */
export class VisualizationPerformanceBenchmark extends PerformanceBenchmark {
  /**
   * Benchmark canvas rendering performance
   */
  async benchmarkCanvasRendering(
    canvas: HTMLCanvasElement,
    renderFunction: (ctx: CanvasRenderingContext2D) => void,
    iterations: number = 50
  ): Promise<BenchmarkResult> {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context not available');
    }

    return await this.measureExecutionTime(
      'canvas_rendering',
      () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderFunction(ctx);
      },
      iterations
    );
  }

  /**
   * Benchmark WebGL rendering performance
   */
  async benchmarkWebGLRendering(
    canvas: HTMLCanvasElement,
    renderFunction: (gl: WebGLRenderingContext) => void,
    iterations: number = 50
  ): Promise<BenchmarkResult> {
    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error('WebGL context not available');
    }

    return await this.measureExecutionTime(
      'webgl_rendering',
      () => {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        renderFunction(gl);
      },
      iterations
    );
  }

  /**
   * Benchmark SVG rendering performance
   */
  async benchmarkSVGRendering(
    svgElement: SVGElement,
    renderFunction: () => void,
    iterations: number = 30
  ): Promise<BenchmarkResult> {
    return await this.measureExecutionTime(
      'svg_rendering',
      () => {
        // Clear SVG content
        while (svgElement.firstChild) {
          svgElement.removeChild(svgElement.firstChild);
        }
        renderFunction();
      },
      iterations
    );
  }
}

// Global benchmark instance for easy access in tests
export const globalBenchmark = new PerformanceBenchmark();
export const wasmBenchmark = new WASMPerformanceBenchmark();
export const visualizationBenchmark = new VisualizationPerformanceBenchmark();