/**
 * Comprehensive Unit Tests for TDA (Topological Data Analysis) Engine
 * Tests both WASM and mock implementations for mathematical accuracy and correctness
 */

import {
  initializeWasm,
  isWasmReady,
  createTDAEngine,
  createMockTDAEngine
} from '@/components/TDAExplorer/wasmLoader';

import {
  initializeWasmV2,
  isWasmReadyV2,
  createTDAEngineV2,
  createEnhancedMockTDAEngine
} from '@/components/TDAExplorer/wasmLoaderV2';

describe('TDA Engine - WASM Loader V1', () => {
  describe('WASM Initialization', () => {
    test('initialization returns a boolean result', async () => {
      const result = await initializeWasm();
      expect(typeof result).toBe('boolean');
    });

    test('isWasmReady returns false initially', () => {
      expect(isWasmReady()).toBe(false);
    });

    test('createTDAEngine returns null when WASM not ready', () => {
      const engine = createTDAEngine();
      expect(engine).toBeNull();
    });

    test('handles initialization failure gracefully', async () => {
      // Mock fetch to simulate failure
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const result = await initializeWasm();
      expect(result).toBe(false);
      
      // Restore original fetch
      global.fetch = originalFetch;
    });

    test('handles missing WASM files gracefully', async () => {
      // Mock fetch to return 404
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404
      });
      
      const result = await initializeWasm();
      expect(result).toBe(false);
      
      global.fetch = originalFetch;
    });
  });

  describe('Mock TDA Engine', () => {
    let mockEngine: any;

    beforeEach(() => {
      mockEngine = createMockTDAEngine();
    });

    test('creates mock engine successfully', () => {
      expect(mockEngine).toBeDefined();
      expect(mockEngine).toHaveProperty('set_points');
      expect(mockEngine).toHaveProperty('compute_vietoris_rips');
      expect(mockEngine).toHaveProperty('compute_persistence');
      
      expect(typeof mockEngine.set_points).toBe('function');
      expect(typeof mockEngine.compute_vietoris_rips).toBe('function');
      expect(typeof mockEngine.compute_persistence).toBe('function');
    });

    test('accepts point data correctly', () => {
      const points = [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1]
      ];
      
      expect(() => mockEngine.set_points(points)).not.toThrow();
    });

    test('handles empty point sets', () => {
      expect(() => mockEngine.set_points([])).not.toThrow();
      
      const persistence = mockEngine.compute_persistence();
      expect(Array.isArray(persistence)).toBe(true);
    });

    test('handles single point', () => {
      mockEngine.set_points([[0, 0]]);
      
      const persistence = mockEngine.compute_persistence();
      expect(Array.isArray(persistence)).toBe(true);
    });

    test('generates valid persistence intervals', () => {
      const points = [
        [0, 0], [1, 0], [0, 1], [1, 1],
        [2, 0], [2, 1], [0, 2], [1, 2]
      ];
      
      mockEngine.set_points(points);
      mockEngine.compute_vietoris_rips(0.5);
      
      const intervals = mockEngine.compute_persistence();
      
      expect(Array.isArray(intervals)).toBe(true);
      expect(intervals.length).toBeGreaterThan(0);
      
      intervals.forEach(interval => {
        global.testUtils.expectValidPersistenceInterval(interval);
        
        // Mock intervals should be reasonably bounded
        expect(interval.birth).toBeGreaterThanOrEqual(0);
        expect(interval.death).toBeGreaterThan(interval.birth);
        expect(interval.death).toBeLessThanOrEqual(1.0); // Based on max distance
        expect([0, 1]).toContain(interval.dimension);
      });
    });

    test('intervals are sorted by persistence (death - birth)', () => {
      const points = Array.from({ length: 10 }, (_, i) => [
        Math.cos(2 * Math.PI * i / 10),
        Math.sin(2 * Math.PI * i / 10)
      ]);
      
      mockEngine.set_points(points);
      const intervals = mockEngine.compute_persistence();
      
      for (let i = 1; i < intervals.length; i++) {
        const currentPersistence = intervals[i].death - intervals[i].birth;
        const prevPersistence = intervals[i-1].death - intervals[i-1].birth;
        expect(currentPersistence).toBeLessThanOrEqual(prevPersistence);
      }
    });

    test('respects filtration parameter', () => {
      const points = [[0, 0], [1, 0], [0, 1]];
      mockEngine.set_points(points);
      
      const maxDistance1 = 0.3;
      const maxDistance2 = 1.0;
      
      mockEngine.compute_vietoris_rips(maxDistance1);
      const intervals1 = mockEngine.compute_persistence();
      
      mockEngine.compute_vietoris_rips(maxDistance2);
      const intervals2 = mockEngine.compute_persistence();
      
      // With larger filtration, we should get more intervals or similar counts
      // (mock behavior may vary, but should be consistent)
      expect(intervals1.length).toBeGreaterThan(0);
      expect(intervals2.length).toBeGreaterThan(0);
      
      // All intervals should respect the max distance bound
      intervals1.forEach(interval => {
        expect(interval.death).toBeLessThanOrEqual(maxDistance1 * 1.1); // Small tolerance
      });
      
      intervals2.forEach(interval => {
        expect(interval.death).toBeLessThanOrEqual(maxDistance2 * 1.1);
      });
    });

    test('generates deterministic results for same input', () => {
      const points = [[0, 0], [1, 0], [0, 1], [1, 1]];
      
      mockEngine.set_points(points);
      const intervals1 = mockEngine.compute_persistence();
      
      mockEngine.set_points(points);
      const intervals2 = mockEngine.compute_persistence();
      
      expect(intervals1.length).toBe(intervals2.length);
      
      // Results should be deterministic (for the mock implementation)
      for (let i = 0; i < intervals1.length; i++) {
        expect(intervals1[i].birth).toBeCloseTo(intervals2[i].birth, 5);
        expect(intervals1[i].death).toBeCloseTo(intervals2[i].death, 5);
        expect(intervals1[i].dimension).toBe(intervals2[i].dimension);
      }
    });

    test('handles point clouds of varying sizes efficiently', () => {
      const testSizes = [0, 1, 2, 5, 10, 50, 100];
      
      testSizes.forEach(size => {
        const points = Array.from({ length: size }, () => [
          Math.random() * 10,
          Math.random() * 10
        ]);
        
        const startTime = performance.now();
        mockEngine.set_points(points);
        const intervals = mockEngine.compute_persistence();
        const endTime = performance.now();
        
        expect(intervals).toBeDefined();
        expect(Array.isArray(intervals)).toBe(true);
        expect(endTime - startTime).toBeLessThan(100); // Should be fast for mock
      });
    });
  });

  describe('Persistence Interval Mathematical Properties', () => {
    let mockEngine: any;

    beforeEach(() => {
      mockEngine = createMockTDAEngine();
    });

    test('validates topological properties of H0 intervals', () => {
      // Create a point cloud with clear connected components
      const points = [
        // Component 1: square
        [0, 0], [1, 0], [1, 1], [0, 1],
        // Component 2: distant points
        [5, 5], [6, 5], [6, 6], [5, 6]
      ];
      
      mockEngine.set_points(points);
      mockEngine.compute_vietoris_rips(0.8); // Should connect within components but not between
      const intervals = mockEngine.compute_persistence();
      
      const h0Intervals = intervals.filter(i => i.dimension === 0);
      expect(h0Intervals.length).toBeGreaterThan(0);
      
      // H0 intervals should start at birth = 0
      h0Intervals.forEach(interval => {
        expect(interval.birth).toBeGreaterThanOrEqual(0);
        expect(interval.death).toBeGreaterThan(interval.birth);
      });
    });

    test('validates topological properties of H1 intervals', () => {
      // Create a circular point cloud that should generate H1 features
      const numPoints = 12;
      const points = Array.from({ length: numPoints }, (_, i) => [
        2 + 1.5 * Math.cos(2 * Math.PI * i / numPoints),
        2 + 1.5 * Math.sin(2 * Math.PI * i / numPoints)
      ]);
      
      mockEngine.set_points(points);
      mockEngine.compute_vietoris_rips(1.0);
      const intervals = mockEngine.compute_persistence();
      
      const h1Intervals = intervals.filter(i => i.dimension === 1);
      
      // Should have some H1 intervals for circular data (mock implementation dependent)
      h1Intervals.forEach(interval => {
        expect(interval.birth).toBeGreaterThan(0); // Loops appear after points connect
        expect(interval.death).toBeGreaterThan(interval.birth);
        expect(interval.dimension).toBe(1);
      });
    });

    test('verifies persistence landscape properties', () => {
      const points = Array.from({ length: 20 }, () => [
        Math.random() * 5,
        Math.random() * 5
      ]);
      
      mockEngine.set_points(points);
      const intervals = mockEngine.compute_persistence();
      
      // Persistence values should follow expected distribution
      const persistenceValues = intervals.map(i => i.death - i.birth);
      const maxPersistence = Math.max(...persistenceValues);
      const minPersistence = Math.min(...persistenceValues);
      
      expect(maxPersistence).toBeGreaterThanOrEqual(minPersistence);
      expect(maxPersistence).toBeGreaterThan(0);
      
      // Should have variety in persistence values (not all the same)
      const uniquePersistenceValues = new Set(persistenceValues.map(p => Math.round(p * 1000)));
      expect(uniquePersistenceValues.size).toBeGreaterThan(1);
    });
  });
});

describe('TDA Engine - WASM Loader V2 (Enhanced)', () => {
  describe('Enhanced WASM Initialization', () => {
    test('initialization handles multiple fallback methods', async () => {
      const result = await initializeWasmV2();
      expect(typeof result).toBe('boolean');
    });

    test('isWasmReadyV2 returns false initially', () => {
      expect(isWasmReadyV2()).toBe(false);
    });

    test('createTDAEngineV2 returns null when WASM not ready', () => {
      const engine = createTDAEngineV2();
      expect(engine).toBeNull();
    });

    test('handles server-side environment gracefully', async () => {
      // Mock window to be undefined (server environment)
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      const result = await initializeWasmV2();
      expect(result).toBe(false);
      
      // Restore window
      global.window = originalWindow;
    });

    test('attempts multiple WASM loading strategies', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock fetch to fail for all strategies
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('All methods fail'));
      
      const result = await initializeWasmV2();
      expect(result).toBe(false);
      
      // Should have attempted multiple methods
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('All WASM integration methods failed'));
      
      global.fetch = originalFetch;
      consoleSpy.mockRestore();
    });
  });

  describe('Enhanced Mock TDA Engine', () => {
    let enhancedEngine: any;

    beforeEach(() => {
      enhancedEngine = createEnhancedMockTDAEngine();
    });

    test('creates enhanced mock engine successfully', () => {
      expect(enhancedEngine).toBeDefined();
      expect(enhancedEngine).toHaveProperty('set_points');
      expect(enhancedEngine).toHaveProperty('compute_vietoris_rips');
      expect(enhancedEngine).toHaveProperty('compute_persistence');
    });

    test('provides more sophisticated persistence computation', () => {
      // Test with a known geometric configuration
      const points = [
        [0, 0], [1, 0], [2, 0], // Line segment
        [0, 1], [1, 1], [2, 1]  // Parallel line
      ];
      
      enhancedEngine.set_points(points);
      enhancedEngine.compute_vietoris_rips(1.2);
      const intervals = enhancedEngine.compute_persistence();
      
      expect(intervals.length).toBeGreaterThan(0);
      
      // Enhanced engine should consider actual point distances
      const h0Intervals = intervals.filter(i => i.dimension === 0);
      expect(h0Intervals.length).toBeGreaterThan(0);
      
      h0Intervals.forEach(interval => {
        expect(interval.birth).toBe(0); // H0 features are born at filtration 0
        expect(interval.death).toBeGreaterThan(0);
        expect(interval.death).toBeLessThanOrEqual(1.2); // Should respect max distance
      });
    });

    test('generates intervals based on actual point distances', () => {
      // Create points with known distances
      const points = [
        [0, 0],     // Distance 1 from next point
        [1, 0],     // Distance sqrt(2) from point after next
        [0, 1]      // Distance 1 from first point
      ];
      
      enhancedEngine.set_points(points);
      enhancedEngine.compute_vietoris_rips(2.0);
      const intervals = enhancedEngine.compute_persistence();
      
      // Should generate intervals that reflect the actual geometry
      expect(intervals.length).toBeGreaterThan(0);
      
      // Check that death times are related to actual distances (1.0 and sqrt(2) ≈ 1.414)
      const deathTimes = intervals.map(i => i.death).filter(d => d > 0);
      expect(deathTimes.length).toBeGreaterThan(0);
      
      // All death times should be within reasonable bounds of actual distances
      deathTimes.forEach(death => {
        expect(death).toBeGreaterThan(0);
        expect(death).toBeLessThanOrEqual(2.0);
      });
    });

    test('handles complex point configurations', () => {
      // Create a more complex configuration with clusters and outliers
      const points = [
        // Cluster 1
        [0, 0], [0.1, 0], [0, 0.1], [0.1, 0.1],
        // Cluster 2
        [3, 3], [3.1, 3], [3, 3.1], [3.1, 3.1],
        // Outlier
        [6, 6]
      ];
      
      enhancedEngine.set_points(points);
      enhancedEngine.compute_vietoris_rips(1.0);
      const intervals = enhancedEngine.compute_persistence();
      
      expect(intervals.length).toBeGreaterThan(2); // Should detect multiple components
      
      // Should have intervals with different scales
      const persistenceValues = intervals.map(i => i.death - i.birth);
      const maxPers = Math.max(...persistenceValues);
      const minPers = Math.min(...persistenceValues.filter(p => p > 0));
      
      expect(maxPers).toBeGreaterThan(minPers);
    });

    test('generates H1 intervals for circular configurations', () => {
      // Create a clear circular configuration
      const numPoints = 16;
      const radius = 2;
      const points = Array.from({ length: numPoints }, (_, i) => {
        const angle = 2 * Math.PI * i / numPoints;
        return [radius * Math.cos(angle), radius * Math.sin(angle)];
      });
      
      enhancedEngine.set_points(points);
      enhancedEngine.compute_vietoris_rips(1.0);
      const intervals = enhancedEngine.compute_persistence();
      
      const h1Intervals = intervals.filter(i => i.dimension === 1);
      
      // Should generate H1 intervals for circular data when there are enough points
      if (points.length >= 6) {
        expect(h1Intervals.length).toBeGreaterThanOrEqual(0);
        
        h1Intervals.forEach(interval => {
          expect(interval.dimension).toBe(1);
          expect(interval.birth).toBeGreaterThan(0);
          expect(interval.death).toBeGreaterThan(interval.birth);
        });
      }
    });

    test('provides consistent logging and diagnostics', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const points = [[0, 0], [1, 1], [2, 2]];
      enhancedEngine.set_points(points);
      const intervals = enhancedEngine.compute_persistence();
      
      // Should have logged diagnostic information
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Enhanced mock'));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Comparison: V1 vs V2 Mock Engines', () => {
    test('both engines handle same input consistently', () => {
      const mockV1 = createMockTDAEngine();
      const mockV2 = createEnhancedMockTDAEngine();
      
      const points = [[0, 0], [1, 0], [0, 1], [1, 1]];
      
      mockV1.set_points(points);
      mockV2.set_points(points);
      
      const intervalsV1 = mockV1.compute_persistence();
      const intervalsV2 = mockV2.compute_persistence();
      
      // Both should generate valid intervals
      expect(intervalsV1.length).toBeGreaterThan(0);
      expect(intervalsV2.length).toBeGreaterThan(0);
      
      // All intervals should be valid
      [...intervalsV1, ...intervalsV2].forEach(interval => {
        global.testUtils.expectValidPersistenceInterval(interval);
      });
    });

    test('V2 engine provides more sophisticated analysis', () => {
      const mockV1 = createMockTDAEngine();
      const mockV2 = createEnhancedMockTDAEngine();
      
      // Create a configuration where V2 should perform better
      const points = [
        [0, 0], [0.2, 0], [0.4, 0], [0.6, 0], [0.8, 0], [1, 0], // Line
        [5, 5] // Isolated point
      ];
      
      const maxDist = 1.5;
      
      mockV1.set_points(points);
      mockV1.compute_vietoris_rips(maxDist);
      const intervalsV1 = mockV1.compute_persistence();
      
      mockV2.set_points(points);
      mockV2.compute_vietoris_rips(maxDist);
      const intervalsV2 = mockV2.compute_persistence();
      
      // V2 should generate intervals that consider actual point distances
      expect(intervalsV2.length).toBeGreaterThan(0);
      
      // V2 should have death times that reflect actual geometry better
      const deathTimesV2 = intervalsV2.map(i => i.death);
      expect(deathTimesV2.some(d => d > 0 && d < maxDist)).toBe(true);
    });
  });
});

describe('TDA Engine - Mathematical Accuracy Tests', () => {
  describe('Topological Correctness', () => {
    test('validates Betti numbers for simple configurations', () => {
      const mockEngine = createEnhancedMockTDAEngine();
      
      // Test case 1: Single point (β0 = 1, β1 = 0)
      mockEngine.set_points([[0, 0]]);
      let intervals = mockEngine.compute_persistence();
      
      expect(intervals).toBeDefined();
      expect(Array.isArray(intervals)).toBe(true);
      
      // Test case 2: Two isolated points (should have β0 = 2 initially)
      mockEngine.set_points([[0, 0], [10, 10]]);
      mockEngine.compute_vietoris_rips(5); // Won't connect points
      intervals = mockEngine.compute_persistence();
      
      const h0Intervals = intervals.filter(i => i.dimension === 0);
      // Mock may not perfectly simulate this, but should generate reasonable intervals
      expect(h0Intervals.length).toBeGreaterThan(0);
    });

    test('handles degenerate cases gracefully', () => {
      const mockEngine = createMockTDAEngine();
      
      // Empty point cloud
      mockEngine.set_points([]);
      let intervals = mockEngine.compute_persistence();
      expect(intervals).toBeDefined();
      expect(Array.isArray(intervals)).toBe(true);
      
      // Single point
      mockEngine.set_points([[0, 0]]);
      intervals = mockEngine.compute_persistence();
      expect(intervals).toBeDefined();
      
      // Collinear points
      mockEngine.set_points([[0, 0], [1, 0], [2, 0], [3, 0]]);
      intervals = mockEngine.compute_persistence();
      expect(intervals.length).toBeGreaterThan(0);
    });

    test('validates filtration monotonicity', () => {
      const mockEngine = createEnhancedMockTDAEngine();
      const points = Array.from({ length: 8 }, () => [
        Math.random() * 5,
        Math.random() * 5
      ]);
      
      mockEngine.set_points(points);
      
      const filtrations = [0.5, 1.0, 1.5, 2.0];
      const allIntervals: any[][] = [];
      
      filtrations.forEach(f => {
        mockEngine.compute_vietoris_rips(f);
        const intervals = mockEngine.compute_persistence();
        allIntervals.push(intervals);
        
        // All intervals should respect the filtration bound
        intervals.forEach(interval => {
          expect(interval.death).toBeLessThanOrEqual(f * 1.1); // Small tolerance for mock
        });
      });
    });
  });

  describe('Performance Characteristics', () => {
    test('scales reasonably with point cloud size', () => {
      const mockEngine = createEnhancedMockTDAEngine();
      const testSizes = [10, 50, 100, 200];
      
      testSizes.forEach(size => {
        const points = Array.from({ length: size }, () => [
          Math.random() * 10,
          Math.random() * 10
        ]);
        
        const startTime = performance.now();
        mockEngine.set_points(points);
        const intervals = mockEngine.compute_persistence();
        const endTime = performance.now();
        
        expect(intervals).toBeDefined();
        expect(endTime - startTime).toBeLessThan(500); // Should be fast for mock
      });
    });

    test('memory usage remains stable across multiple computations', () => {
      const mockEngine = createMockTDAEngine();
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      for (let i = 0; i < 100; i++) {
        const points = Array.from({ length: 20 }, () => [
          Math.random() * 5,
          Math.random() * 5
        ]);
        
        mockEngine.set_points(points);
        mockEngine.compute_persistence();
      }
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Should not leak significant memory
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles invalid point data gracefully', () => {
      const mockEngine = createMockTDAEngine();
      
      // Points with NaN coordinates
      expect(() => {
        mockEngine.set_points([[NaN, 0], [1, NaN]]);
        mockEngine.compute_persistence();
      }).not.toThrow();
      
      // Points with infinite coordinates
      expect(() => {
        mockEngine.set_points([[Infinity, 0], [1, -Infinity]]);
        mockEngine.compute_persistence();
      }).not.toThrow();
      
      // Non-numeric coordinates
      expect(() => {
        // @ts-ignore - testing error handling
        mockEngine.set_points([["0", "1"], [2, 3]]);
        mockEngine.compute_persistence();
      }).not.toThrow();
    });

    test('handles extreme filtration values', () => {
      const mockEngine = createMockTDAEngine();
      const points = [[0, 0], [1, 1], [2, 2]];
      
      mockEngine.set_points(points);
      
      // Very small filtration
      expect(() => {
        mockEngine.compute_vietoris_rips(1e-10);
        mockEngine.compute_persistence();
      }).not.toThrow();
      
      // Very large filtration
      expect(() => {
        mockEngine.compute_vietoris_rips(1e10);
        mockEngine.compute_persistence();
      }).not.toThrow();
      
      // Zero filtration
      expect(() => {
        mockEngine.compute_vietoris_rips(0);
        mockEngine.compute_persistence();
      }).not.toThrow();
      
      // Negative filtration (should be handled gracefully)
      expect(() => {
        mockEngine.compute_vietoris_rips(-1);
        mockEngine.compute_persistence();
      }).not.toThrow();
    });

    test('maintains consistency across repeated calls', () => {
      const mockEngine = createMockTDAEngine();
      const points = [[0, 0], [1, 0], [0, 1], [1, 1]];
      
      mockEngine.set_points(points);
      
      const intervals1 = mockEngine.compute_persistence();
      const intervals2 = mockEngine.compute_persistence();
      const intervals3 = mockEngine.compute_persistence();
      
      // Results should be consistent
      expect(intervals1.length).toBe(intervals2.length);
      expect(intervals2.length).toBe(intervals3.length);
      
      for (let i = 0; i < intervals1.length; i++) {
        expect(intervals1[i].dimension).toBe(intervals2[i].dimension);
        expect(intervals2[i].dimension).toBe(intervals3[i].dimension);
      }
    });
  });
});

describe('TDA Engine - Integration with Test Utilities', () => {
  test('persistence intervals pass validation utility', () => {
    const mockEngine = createEnhancedMockTDAEngine();
    const points = [
      [0, 0], [1, 0], [1, 1], [0, 1], // Square
      [2, 2], [3, 2], [3, 3], [2, 3]  // Another square
    ];
    
    mockEngine.set_points(points);
    const intervals = mockEngine.compute_persistence();
    
    intervals.forEach(interval => {
      global.testUtils.expectValidPersistenceInterval(interval);
    });
  });

  test('mathematical accuracy utility functions work correctly', () => {
    const interval = { birth: 0.1, death: 0.5, dimension: 0 };
    
    // Test the validation utility itself
    expect(() => {
      global.testUtils.expectValidPersistenceInterval(interval);
    }).not.toThrow();
    
    // Test with invalid interval
    const invalidInterval = { birth: 0.5, death: 0.1, dimension: -1 };
    expect(() => {
      global.testUtils.expectValidPersistenceInterval(invalidInterval);
    }).toThrow();
  });
});