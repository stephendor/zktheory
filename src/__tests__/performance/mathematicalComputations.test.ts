/**
 * Performance Tests for Mathematical Computations
 * Tests execution time benchmarks, regression detection, and performance baselines
 */

import { PerformanceBenchmark, WASMPerformanceBenchmark, globalBenchmark } from '../utils/performanceBenchmark';
import { GroupTheoryValidator, TDAValidator, EllipticCurveValidator } from '../utils/mathematicalValidation';
import type { Group, GroupElement } from '@/lib/GroupTheory';
import type { EllipticCurve, EllipticCurvePoint } from '@/lib/EllipticCurveGroups';

describe('Mathematical Computation Performance', () => {
  let benchmark: PerformanceBenchmark;

  beforeEach(() => {
    benchmark = new PerformanceBenchmark();
  });

  afterEach(() => {
    benchmark.reset();
  });

  describe('Group Theory Performance', () => {
    const createTestGroup = (order: number): Group => {
      // Create a cyclic group of given order for testing
      const elements: GroupElement[] = [];
      const operations = new Map<string, Map<string, string>>();

      for (let i = 0; i < order; i++) {
        elements.push({
          id: `g${i}`,
          label: `g^${i}`,
          order: i === 0 ? 1 : order,
          inverse: `g${(order - i) % order}`,
          conjugacyClass: 0
        });
      }

      // Create multiplication table for cyclic group
      elements.forEach(a => {
        const aMap = new Map<string, string>();
        elements.forEach(b => {
          const aIndex = parseInt(a.id.substring(1));
          const bIndex = parseInt(b.id.substring(1));
          const resultIndex = (aIndex + bIndex) % order;
          aMap.set(b.id, `g${resultIndex}`);
        });
        operations.set(a.id, aMap);
      });

      return {
        id: `C${order}`,
        name: `Cyclic Group C${order}`,
        order,
        elements,
        operations,
        generators: ['g1'],
        isAbelian: true,
        description: `Cyclic group of order ${order}`
      };
    };

    test('should benchmark group validation performance', async () => {
      const testSizes = [4, 8, 12, 16, 20];
      const results = new Map<number, number>();

      for (const size of testSizes) {
        const group = createTestGroup(size);
        const result = await benchmark.measureExecutionTime(
          `group_validation_${size}`,
          () => GroupTheoryValidator.validateGroupAxioms(group),
          50
        );

        results.set(size, result.executionTime);
        
        // Performance should be reasonable (< 100ms for groups up to order 20)
        expect(result.executionTime).toBeLessThan(100);
        
        console.log(`Group validation (order ${size}): ${result.executionTime.toFixed(2)}ms`);
      }

      // Check that performance scales reasonably with group size
      const smallGroupTime = results.get(4)!;
      const largeGroupTime = results.get(20)!;
      const scalingFactor = largeGroupTime / smallGroupTime;
      
      // Should not scale worse than O(n³) for group operations
      expect(scalingFactor).toBeLessThan(Math.pow(20/4, 3));
    });

    test('should benchmark group operation performance', async () => {
      const group = createTestGroup(12);
      
      const result = await benchmark.benchmarkGroupOperations(group);
      
      // Verify all benchmark operations completed
      expect(result.has('group_multiplication')).toBe(true);
      expect(result.has('group_validation')).toBe(true);
      expect(result.has('generator_validation')).toBe(true);
      expect(result.has('lagrange_validation')).toBe(true);

      // Performance thresholds
      expect(result.get('group_multiplication')!.executionTime).toBeLessThan(50);
      expect(result.get('group_validation')!.executionTime).toBeLessThan(100);
      expect(result.get('generator_validation')!.executionTime).toBeLessThan(200);
      expect(result.get('lagrange_validation')!.executionTime).toBeLessThan(50);

      console.log('Group operation benchmarks:');
      result.forEach((benchmark, operation) => {
        console.log(`  ${operation}: ${benchmark.executionTime.toFixed(2)}ms`);
      });
    });

    test('should detect performance regressions in group operations', async () => {
      const group = createTestGroup(8);
      
      // Create baseline measurements
      const baselineTimes: number[] = [];
      for (let i = 0; i < 30; i++) {
        const start = performance.now();
        GroupTheoryValidator.validateGroupAxioms(group);
        const end = performance.now();
        baselineTimes.push(end - start);
      }

      // Create "current" measurements (simulate slight performance degradation)
      const currentTimes = baselineTimes.map(time => time * 1.1 + Math.random() * 0.5);

      const regressionResult = benchmark.detectRegression(baselineTimes, currentTimes);
      
      expect(regressionResult.isRegression).toBe(true);
      expect(regressionResult.effect).toBe('regression');
      expect(regressionResult.magnitude).toBeGreaterThan(5); // Should detect >5% degradation
      
      console.log(`Regression detection: ${regressionResult.effect} (${regressionResult.magnitude.toFixed(1)}% change)`);
    });
  });

  describe('Elliptic Curve Performance', () => {
    const createTestCurve = (): EllipticCurve => ({
      a: 2,
      b: 3,
      p: 97 // Small prime for testing
    });

    const createTestPoints = (curve: EllipticCurve, count: number): EllipticCurvePoint[] => {
      const points: EllipticCurvePoint[] = [];
      
      // Add identity point
      points.push({ x: null, y: null, isIdentity: true });
      
      // Generate points on the curve
      for (let x = 0; x < curve.p && points.length < count; x++) {
        const rightSide = (x * x * x + curve.a * x + curve.b) % curve.p;
        
        // Check if rightSide is a quadratic residue
        for (let y = 0; y < curve.p; y++) {
          if ((y * y) % curve.p === rightSide) {
            points.push({ x, y, isIdentity: false });
            if (points.length >= count) break;
          }
        }
      }
      
      return points.slice(0, count);
    };

    test('should benchmark elliptic curve validation performance', async () => {
      const curve = createTestCurve();
      const pointCounts = [5, 10, 20, 50];
      
      for (const count of pointCounts) {
        const points = createTestPoints(curve, count);
        
        const result = await benchmark.measureExecutionTime(
          `ec_point_validation_${count}`,
          () => {
            points.forEach(point => 
              EllipticCurveValidator.validatePointOnCurve(point, curve)
            );
          },
          100
        );

        // Performance should be linear in number of points
        expect(result.executionTime).toBeLessThan(count * 2); // 2ms per point max
        
        console.log(`EC point validation (${count} points): ${result.executionTime.toFixed(2)}ms`);
      }
    });

    test('should benchmark elliptic curve operations', async () => {
      const curve = createTestCurve();
      const points = createTestPoints(curve, 20);
      
      const results = await benchmark.benchmarkEllipticCurveOperations(curve, points);
      
      expect(results.has('point_validation')).toBe(true);
      expect(results.has('curve_validation')).toBe(true);

      // Performance thresholds
      expect(results.get('point_validation')!.executionTime).toBeLessThan(100);
      expect(results.get('curve_validation')!.executionTime).toBeLessThan(10);

      console.log('Elliptic curve benchmarks:');
      results.forEach((benchmark, operation) => {
        console.log(`  ${operation}: ${benchmark.executionTime.toFixed(2)}ms`);
      });
    });
  });

  describe('TDA Computation Performance', () => {
    const generatePointCloud = (size: number, dimension: number = 2): number[][] => {
      const points: number[][] = [];
      for (let i = 0; i < size; i++) {
        const point: number[] = [];
        for (let j = 0; j < dimension; j++) {
          point.push(Math.random());
        }
        points.push(point);
      }
      return points;
    };

    test('should benchmark TDA computation performance', async () => {
      const pointCloudSizes = [10, 25, 50, 100];
      const pointClouds = pointCloudSizes.map(size => generatePointCloud(size));
      
      const results = await benchmark.benchmarkTDAOperations(pointClouds);
      
      expect(results.has('distance_matrix')).toBe(true);
      expect(results.has('vr_complex')).toBe(true);

      // Performance should scale quadratically for distance matrix
      // (since we're computing O(n²) pairwise distances)
      const distanceResult = results.get('distance_matrix')!;
      expect(distanceResult.executionTime).toBeLessThan(1000); // 1 second max

      console.log('TDA computation benchmarks:');
      results.forEach((benchmark, operation) => {
        console.log(`  ${operation}: ${benchmark.executionTime.toFixed(2)}ms`);
      });
    });

    test('should benchmark scaling behavior of TDA algorithms', async () => {
      const sizes = [10, 20, 30, 40];
      const scalingResults = new Map<number, number>();

      for (const size of sizes) {
        const pointCloud = generatePointCloud(size);
        
        const result = await benchmark.measureExecutionTime(
          `tda_scaling_${size}`,
          () => {
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
          },
          20
        );

        scalingResults.set(size, result.executionTime);
        
        console.log(`TDA scaling (${size} points): ${result.executionTime.toFixed(2)}ms`);
      }

      // Verify quadratic scaling behavior
      const time10 = scalingResults.get(10)!;
      const time40 = scalingResults.get(40)!;
      const expectedRatio = Math.pow(40/10, 2); // O(n²) scaling
      const actualRatio = time40 / time10;

      // Allow some deviation from perfect quadratic scaling
      expect(actualRatio).toBeLessThan(expectedRatio * 2);
      expect(actualRatio).toBeGreaterThan(expectedRatio * 0.5);
    });
  });

  describe('Memory Performance', () => {
    test('should track memory usage during computations', async () => {
      const group = createTestGroup(16);
      
      const result = await benchmark.measureExecutionTime(
        'memory_tracking_test',
        () => {
          // Perform memory-intensive operations
          const validationResults = [];
          for (let i = 0; i < 100; i++) {
            validationResults.push(GroupTheoryValidator.validateGroupAxioms(group));
          }
          return validationResults;
        },
        10
      );

      expect(result.memoryUsage).toBeDefined();
      
      // Memory usage should be reasonable (this is environment-dependent)
      if (result.memoryUsage!.heapUsed > 0) {
        expect(result.memoryUsage!.heapUsed).toBeLessThan(50 * 1024 * 1024); // 50MB max
        console.log(`Memory usage: ${(result.memoryUsage!.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      }
    });
  });

  describe('Statistical Analysis', () => {
    test('should calculate accurate statistical measures', () => {
      const times = [10, 12, 11, 13, 9, 14, 10, 11, 12, 13];
      const stats = benchmark.calculateStatistics(times);

      expect(stats.mean).toBeCloseTo(11.5, 1);
      expect(stats.median).toBe(11.5);
      expect(stats.min).toBe(9);
      expect(stats.max).toBe(14);
      expect(stats.standardDeviation).toBeGreaterThan(0);
      expect(stats.percentiles[50]).toBe(stats.median);
      expect(stats.percentiles[90]).toBeGreaterThanOrEqual(stats.percentiles[50]);
    });

    test('should create and validate performance baselines', async () => {
      const group = createTestGroup(8);
      
      // Generate enough measurements for baseline
      for (let i = 0; i < 15; i++) {
        await benchmark.measureExecutionTime(
          'baseline_test',
          () => GroupTheoryValidator.validateGroupAxioms(group),
          5
        );
      }

      const baseline = benchmark.createBaseline('baseline_test');
      
      expect(baseline).not.toBeNull();
      expect(baseline!.meanTime).toBeGreaterThan(0);
      expect(baseline!.standardDeviation).toBeGreaterThan(0);
      expect(baseline!.sampleSize).toBe(15);
      expect(baseline!.percentiles.p50).toBeLessThanOrEqual(baseline!.percentiles.p90);
      expect(baseline!.percentiles.p90).toBeLessThanOrEqual(baseline!.percentiles.p95);
    });
  });

  describe('Performance Reporting', () => {
    test('should export comprehensive performance reports', async () => {
      const group = createTestGroup(6);
      
      // Generate some measurements
      await benchmark.measureExecutionTime(
        'report_test_1',
        () => GroupTheoryValidator.validateGroupAxioms(group),
        10
      );
      
      await benchmark.measureExecutionTime(
        'report_test_2',
        () => GroupTheoryValidator.validateLagrangeTheorem(group),
        10
      );

      const report = benchmark.exportPerformanceReport();
      
      expect(report.measurements).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.summary.totalOperations).toBe(2);
      expect(report.summary.totalMeasurements).toBe(2);
      expect(report.summary.generatedAt).toBeDefined();
      
      // Verify measurement data structure
      expect(report.measurements['report_test_1']).toBeDefined();
      expect(report.measurements['report_test_1'][0].executionTime).toBeGreaterThan(0);
      expect(report.measurements['report_test_1'][0].iterations).toBe(10);
    });
  });

  describe('Integration with Global Benchmark', () => {
    test('should work with global benchmark instance', async () => {
      const group = createTestGroup(4);
      
      const result = await globalBenchmark.measureExecutionTime(
        'global_test',
        () => GroupTheoryValidator.validateGroupAxioms(group),
        5
      );

      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.operation).toBe('global_test');
      
      // Should persist in global instance
      const report = globalBenchmark.exportPerformanceReport();
      expect(report.measurements['global_test']).toBeDefined();
    });
  });
});

describe('WASM Performance Benchmarking', () => {
  let wasmBenchmark: WASMPerformanceBenchmark;

  beforeEach(() => {
    wasmBenchmark = new WASMPerformanceBenchmark();
  });

  test('should benchmark WASM vs JavaScript performance comparison', async () => {
    // Mock WASM and JS functions for testing
    const mockWasmFunction = () => {
      // Simulate WASM computation (typically faster)
      let result = 0;
      for (let i = 0; i < 1000; i++) {
        result += Math.sqrt(i);
      }
      return result;
    };

    const mockJsFunction = () => {
      // Simulate JS computation (typically slower for intensive math)
      let result = 0;
      for (let i = 0; i < 1000; i++) {
        result += Math.sqrt(i);
      }
      return result;
    };

    const comparison = await wasmBenchmark.benchmarkWASMvsJS(
      'sqrt_computation',
      mockWasmFunction,
      mockJsFunction,
      50
    );

    expect(comparison.wasmResult.executionTime).toBeGreaterThan(0);
    expect(comparison.jsResult.executionTime).toBeGreaterThan(0);
    expect(comparison.speedup).toBeGreaterThan(0);
    expect(comparison.recommendation).toBeDefined();

    console.log(`WASM vs JS Comparison:`);
    console.log(`  WASM: ${comparison.wasmResult.executionTime.toFixed(2)}ms`);
    console.log(`  JS: ${comparison.jsResult.executionTime.toFixed(2)}ms`);
    console.log(`  Speedup: ${comparison.speedup.toFixed(2)}x`);
    console.log(`  Recommendation: ${comparison.recommendation}`);
  });
});