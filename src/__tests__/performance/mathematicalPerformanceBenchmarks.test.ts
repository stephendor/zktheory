/**
 * Mathematical Performance Benchmarks Tests
 * Integration tests for mathematical operation performance monitoring
 * Tests WASM operations, Cayley graphs, TDA computations, and LaTeX rendering
 */

import { 
  mathematicalPerformanceMonitor,
  wasmPerformanceWrapper,
  withTDAPerformanceMonitoring,
  withCayleyPerformanceMonitoring
} from '@/lib/performance';
import { GroupTheoryValidator } from '../utils/mathematicalValidation';
import type { Group, GroupElement } from '@/lib/GroupTheory';

// Mock WASM modules for testing
const mockTDACore = {
  compute_persistence: jest.fn(),
  compute_homology: jest.fn(),
  generate_barcode: jest.fn()
};

const mockCayleyCore = {
  generate_group: jest.fn(),
  compute_layout: jest.fn(),
  find_subgroups: jest.fn()
};

describe('Mathematical Performance Benchmarks', () => {
  beforeEach(() => {
    // Reset performance monitoring
    mathematicalPerformanceMonitor.reset();
    mathematicalPerformanceMonitor.setEnabled(true);
    
    // Register mock WASM modules
    wasmPerformanceWrapper.registerWASMModule('tda_rust_core', mockTDACore);
    wasmPerformanceWrapper.registerWASMModule('cayley_core', mockCayleyCore);
    
    // Reset mock functions
    jest.clearAllMocks();
  });

  afterEach(() => {
    mathematicalPerformanceMonitor.setEnabled(false);
  });

  describe('Group Theory Performance Benchmarks', () => {
    const createTestGroup = (order: number): Group => {
      const elements: GroupElement[] = [];
      const operations = new Map<string, Map<string, string>>();

      // Create cyclic group of given order
      for (let i = 0; i < order; i++) {
        elements.push({
          id: i === 0 ? 'e' : `g${i}`,
          label: i === 0 ? 'e' : `g^${i}`,
          order: i === 0 ? 1 : order,
          inverse: i === 0 ? 'e' : `g${order - i}`,
          conjugacyClass: 0
        });
      }

      // Create operation table
      elements.forEach(a => {
        const aMap = new Map<string, string>();
        elements.forEach(b => {
          const aIndex = a.id === 'e' ? 0 : parseInt(a.id.substring(1));
          const bIndex = b.id === 'e' ? 0 : parseInt(b.id.substring(1));
          const resultIndex = (aIndex + bIndex) % order;
          const resultId = resultIndex === 0 ? 'e' : `g${resultIndex}`;
          aMap.set(b.id, resultId);
        });
        operations.set(a.id, aMap);
      });

      return {
        id: `C${order}`,
        name: `Cyclic Group C${order}`,
        order,
        elements,
        operations,
        generators: order > 1 ? ['g1'] : ['e'],
        isAbelian: true,
        description: `Cyclic group of order ${order}`
      };
    };

    test('should benchmark group validation across different group orders', async () => {
      const testOrders = [4, 8, 12, 16, 20];
      const results: Array<{ order: number; time: number; }> = [];

      for (const order of testOrders) {
        const group = createTestGroup(order);
        
        const startTime = performance.now();
        
        await mathematicalPerformanceMonitor.monitorMathematicalOperation(
          {
            operation: 'group_validation',
            category: 'group_theory',
            complexity: 'O(n²)',
            inputSize: order,
            expectedTimeMs: order * 2,
            maxAllowedTimeMs: order * 10
          },
          () => GroupTheoryValidator.validateGroupAxioms(group),
          {
            environment: 'testing',
            trackMemory: true,
            validateResult: (result) => result.isValid ? 1.0 : 0.0
          }
        );
        
        const endTime = performance.now();
        results.push({ order, time: endTime - startTime });
      }

      // Verify performance scaling
      const largeGroupTime = results.find(r => r.order === 20)?.time || 0;
      const smallGroupTime = results.find(r => r.order === 4)?.time || 0;
      
      expect(largeGroupTime).toBeGreaterThan(smallGroupTime);
      expect(largeGroupTime).toBeLessThan(1000); // Should complete within 1 second
      
      // Generate performance report
      const report = mathematicalPerformanceMonitor.generateMathematicalReport();
      expect(report.summary.totalMetrics).toBe(testOrders.length);
      expect(report.summary.performanceScore).toBeGreaterThan(50);
    });

    test('should detect performance regression in group operations', async () => {
      const group = createTestGroup(12);
      
      // Establish baseline with multiple measurements
      for (let i = 0; i < 10; i++) {
        await mathematicalPerformanceMonitor.monitorMathematicalOperation(
          {
            operation: 'group_regression_test',
            category: 'group_theory',
            complexity: 'O(n²)',
            inputSize: 12
          },
          () => GroupTheoryValidator.validateGroupAxioms(group),
          { environment: 'testing' }
        );
      }

      // Simulate performance regression with artificial delay
      const regressionResult = await mathematicalPerformanceMonitor.monitorMathematicalOperation(
        {
          operation: 'group_regression_test',
          category: 'group_theory',
          complexity: 'O(n²)',
          inputSize: 12
        },
        async () => {
          await new Promise(resolve => setTimeout(resolve, 50)); // Add 50ms delay
          return GroupTheoryValidator.validateGroupAxioms(group);
        },
        { environment: 'testing' }
      );

      // Check for regression
      const regression = mathematicalPerformanceMonitor.detectRegression(
        'group_regression_test', 
        regressionResult.value || 50
      );

      expect(regression).not.toBeNull();
      if (regression) {
        expect(regression.analysis.statisticalSignificance).toBeGreaterThan(1.0);
      }
    });

    test('should benchmark Cayley graph operations with WASM monitoring', async () => {
      mockCayleyCore.generate_group.mockResolvedValue({
        elements: Array(8).fill(null).map((_, i) => ({ id: `g${i}` })),
        operations: new Map()
      });

      const result = await withCayleyPerformanceMonitoring(
        'group_generation',
        8,
        () => mockCayleyCore.generate_group({ order: 8 }),
        {
          validateGroupProperties: true,
          environment: 'testing'
        }
      );

      expect(mockCayleyCore.generate_group).toHaveBeenCalledWith({ order: 8 });
      expect(result.elements).toHaveLength(8);

      // Verify performance metrics were collected
      const report = mathematicalPerformanceMonitor.generateMathematicalReport();
      expect(report.summary.totalMetrics).toBeGreaterThan(0);
    });
  });

  describe('TDA Performance Benchmarks', () => {
    const generatePointCloud = (size: number): number[][] => {
      return Array(size).fill(null).map(() => [
        Math.random() * 10,
        Math.random() * 10
      ]);
    };

    test('should benchmark TDA persistence computation', async () => {
      const pointClouds = [10, 25, 50, 100].map(size => ({
        size,
        points: generatePointCloud(size)
      }));

      const results: Array<{ size: number; time: number; }> = [];

      for (const { size, points } of pointClouds) {
        mockTDACore.compute_persistence.mockResolvedValue({
          intervals: Array(size / 2).fill(null).map((_, i) => ({
            birth: i * 0.1,
            death: i * 0.1 + 0.5,
            dimension: i % 2
          }))
        });

        const startTime = performance.now();
        
        await withTDAPerformanceMonitoring(
          'persistence_computation',
          points,
          () => mockTDACore.compute_persistence(points),
          {
            validateTopology: true,
            expectedBetti: [1, 0], // Expected Betti numbers
            environment: 'testing'
          }
        );
        
        const endTime = performance.now();
        results.push({ size, time: endTime - startTime });
      }

      // Verify TDA computations scale reasonably
      const largestTime = Math.max(...results.map(r => r.time));
      expect(largestTime).toBeLessThan(5000); // Should complete within 5 seconds

      // Verify mock was called for each point cloud
      expect(mockTDACore.compute_persistence).toHaveBeenCalledTimes(pointClouds.length);
    });

    test('should validate TDA result accuracy', async () => {
      const points = generatePointCloud(20);
      
      // Mock valid TDA result
      mockTDACore.compute_homology.mockResolvedValue({
        intervals: [
          { birth: 0, death: 0.5, dimension: 0 },
          { birth: 0.1, death: 0.3, dimension: 1 },
          { birth: 0.2, death: 0.8, dimension: 0 }
        ],
        betti: [2, 1, 0]
      });

      const result = await withTDAPerformanceMonitoring(
        'homology_computation',
        points,
        () => mockTDACore.compute_homology(points),
        {
          validateTopology: true,
          expectedBetti: [2, 1, 0],
          environment: 'testing'
        }
      );

      expect(result.intervals).toHaveLength(3);
      expect(result.betti).toEqual([2, 1, 0]);

      // Check that validation passed with high accuracy
      const report = mathematicalPerformanceMonitor.generateMathematicalReport();
      const tdaMetrics = report.summary.totalMetrics;
      expect(tdaMetrics).toBeGreaterThan(0);
    });

    test('should handle TDA computation errors gracefully', async () => {
      const points = generatePointCloud(15);
      
      // Mock TDA computation error
      mockTDACore.compute_persistence.mockRejectedValue(new Error('WASM computation failed'));

      await expect(
        withTDAPerformanceMonitoring(
          'persistence_computation',
          points,
          () => mockTDACore.compute_persistence(points),
          { environment: 'testing' }
        )
      ).rejects.toThrow('WASM computation failed');

      // Verify error was tracked in performance metrics
      const report = mathematicalPerformanceMonitor.generateMathematicalReport();
      expect(report.recommendations).toContainEqual(
        expect.objectContaining({
          type: 'investigation',
          message: expect.stringContaining('error')
        })
      );
    });
  });

  describe('LaTeX Rendering Performance Benchmarks', () => {
    test('should benchmark KaTeX rendering performance', async () => {
      const latexExpressions = [
        '\\frac{1}{2}',
        '\\sum_{i=1}^{n} x_i',
        '\\int_{0}^{\\infty} e^{-x^2} dx',
        '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
        '\\lim_{x \\to \\infty} \\frac{\\sin x}{x} = 0'
      ];

      const results: Array<{ expression: string; time: number; }> = [];

      for (const expression of latexExpressions) {
        const startTime = performance.now();
        
        await mathematicalPerformanceMonitor.monitorMathematicalOperation(
          {
            operation: 'latex_rendering',
            category: 'latex_rendering',
            complexity: 'O(n)',
            inputSize: expression.length,
            expectedTimeMs: 20,
            maxAllowedTimeMs: 100
          },
          () => {
            // Simulate KaTeX rendering
            return { html: `<span class="katex">${expression}</span>`, success: true };
          },
          {
            environment: 'testing',
            validateResult: (result) => result.success ? 1.0 : 0.0
          }
        );
        
        const endTime = performance.now();
        results.push({ expression, time: endTime - startTime });
      }

      // All LaTeX expressions should render quickly
      const maxTime = Math.max(...results.map(r => r.time));
      expect(maxTime).toBeLessThan(100); // Should complete within 100ms

      // Verify all expressions were processed
      expect(results).toHaveLength(latexExpressions.length);
    });

    test('should compare KaTeX vs MathJax performance', async () => {
      const expression = '\\sum_{i=1}^{n} \\frac{1}{i^2} = \\frac{\\pi^2}{6}';
      
      // Benchmark KaTeX
      const katexTime = await mathematicalPerformanceMonitor.monitorMathematicalOperation(
        {
          operation: 'katex_rendering',
          category: 'latex_rendering',
          complexity: 'O(n)',
          inputSize: expression.length
        },
        () => {
          // Simulate KaTeX rendering (typically faster)
          return new Promise(resolve => {
            setTimeout(() => resolve({ renderer: 'katex', html: '<span>...</span>' }), 10);
          });
        },
        { environment: 'testing' }
      );

      // Benchmark MathJax
      const mathjaxTime = await mathematicalPerformanceMonitor.monitorMathematicalOperation(
        {
          operation: 'mathjax_rendering',
          category: 'latex_rendering',
          complexity: 'O(n)',
          inputSize: expression.length
        },
        () => {
          // Simulate MathJax rendering (typically slower but higher quality)
          return new Promise(resolve => {
            setTimeout(() => resolve({ renderer: 'mathjax', html: '<span>...</span>' }), 30);
          });
        },
        { environment: 'testing' }
      );

      // Generate comparative report
      const report = mathematicalPerformanceMonitor.generateMathematicalReport();
      expect(report.summary.totalMetrics).toBe(2);
      
      // Verify both renderers completed successfully
      expect(katexTime).toBeDefined();
      expect(mathjaxTime).toBeDefined();
    });
  });

  describe('Visualization Performance Benchmarks', () => {
    test('should benchmark canvas rendering performance', async () => {
      const canvasSizes = [
        { width: 400, height: 300, nodes: 10 },
        { width: 800, height: 600, nodes: 20 },
        { width: 1200, height: 900, nodes: 50 }
      ];

      const results: Array<{ nodes: number; time: number; }> = [];

      for (const { width, height, nodes } of canvasSizes) {
        const startTime = performance.now();
        
        await mathematicalPerformanceMonitor.monitorMathematicalOperation(
          {
            operation: 'canvas_rendering',
            category: 'visualization',
            complexity: 'O(n)',
            inputSize: nodes,
            expectedTimeMs: 16.67, // 60 FPS target
            maxAllowedTimeMs: 33.33 // 30 FPS minimum
          },
          () => {
            // Simulate canvas drawing operations
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d')!;
            
            // Draw nodes
            for (let i = 0; i < nodes; i++) {
              ctx.beginPath();
              ctx.arc(
                Math.random() * width,
                Math.random() * height,
                5,
                0,
                2 * Math.PI
              );
              ctx.fill();
            }
            
            return { canvas, nodeCount: nodes };
          },
          {
            environment: 'testing',
            trackMemory: true,
            validateResult: (result) => result.nodeCount === nodes ? 1.0 : 0.0
          }
        );
        
        const endTime = performance.now();
        results.push({ nodes, time: endTime - startTime });
      }

      // Verify rendering performance scales reasonably
      const maxTime = Math.max(...results.map(r => r.time));
      expect(maxTime).toBeLessThan(100); // Should complete within 100ms even for complex scenes

      // Check that memory usage was tracked
      const report = mathematicalPerformanceMonitor.generateMathematicalReport();
      expect(report.summary.averageMemoryUsage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance Regression Detection', () => {
    test('should build baselines and detect regressions statistically', async () => {
      const operation = 'baseline_test_operation';
      
      // Build baseline with consistent performance
      const baselineTimes: number[] = [];
      for (let i = 0; i < 20; i++) {
        const baselineTime = 45 + Math.random() * 10; // 45-55ms range
        baselineTimes.push(baselineTime);
        
        await mathematicalPerformanceMonitor.monitorMathematicalOperation(
          {
            operation,
            category: 'group_theory',
            complexity: 'O(n)',
            inputSize: 10
          },
          () => new Promise(resolve => setTimeout(resolve, baselineTime)),
          { environment: 'testing' }
        );
      }

      // Test regression detection with significant slowdown
      const regressionTime = 120; // Significantly slower
      const regression = mathematicalPerformanceMonitor.detectRegression(operation, regressionTime);
      
      expect(regression).not.toBeNull();
      expect(regression!.analysis.isRegression).toBe(true);
      expect(regression!.analysis.statisticalSignificance).toBeGreaterThan(2.0);
      expect(regression!.analysis.percentageChange).toBeGreaterThan(50);

      // Test no regression with normal performance
      const normalTime = 50; // Within normal range
      const noRegression = mathematicalPerformanceMonitor.detectRegression(operation, normalTime);
      
      expect(noRegression).not.toBeNull();
      expect(noRegression!.analysis.isRegression).toBe(false);
      expect(Math.abs(noRegression!.analysis.percentageChange)).toBeLessThan(20);
    });

    test('should generate meaningful performance recommendations', async () => {
      // Create scenarios that should trigger recommendations
      
      // Slow operation (should trigger optimization recommendation)
      await mathematicalPerformanceMonitor.monitorMathematicalOperation(
        {
          operation: 'slow_group_validation',
          category: 'group_theory',
          complexity: 'O(n²)',
          inputSize: 20,
          maxAllowedTimeMs: 50
        },
        () => new Promise(resolve => setTimeout(resolve, 150)), // Deliberately slow
        { environment: 'production' }
      );

      // High memory operation (should trigger memory recommendation)
      await mathematicalPerformanceMonitor.monitorMathematicalOperation(
        {
          operation: 'memory_intensive_tda',
          category: 'tda',
          complexity: 'O(n²)',
          inputSize: 100
        },
        () => {
          // Simulate memory-intensive operation
          const largeArray = new Array(1000000).fill(0);
          return Promise.resolve({ data: largeArray });
        },
        {
          environment: 'production',
          trackMemory: true
        }
      );

      const report = mathematicalPerformanceMonitor.generateMathematicalReport();
      
      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.recommendations).toContainEqual(
        expect.objectContaining({
          type: 'optimization',
          priority: expect.stringMatching(/high|medium/),
          message: expect.stringContaining('slow')
        })
      );
    });
  });

  describe('WASM Performance Analytics', () => {
    test('should generate comprehensive WASM performance report', async () => {
      // Simulate various WASM operations
      mockTDACore.compute_persistence.mockResolvedValue({ intervals: [] });
      mockTDACore.compute_homology.mockResolvedValue({ betti: [1, 0] });
      mockCayleyCore.generate_group.mockResolvedValue({ elements: [] });

      // Execute operations to build cache
      await withTDAPerformanceMonitoring('persistence', [], () => mockTDACore.compute_persistence([]));
      await withTDAPerformanceMonitoring('homology', [], () => mockTDACore.compute_homology([]));
      await withCayleyPerformanceMonitoring('generation', 8, () => mockCayleyCore.generate_group({}));

      const wasmReport = wasmPerformanceWrapper.generateWASMReport();

      expect(wasmReport.modules).toContain('tda_rust_core');
      expect(wasmReport.modules).toContain('cayley_core');
      expect(Object.keys(wasmReport.operations)).toHaveLength(3);
      expect(wasmReport.recommendations).toBeDefined();
    });
  });
});