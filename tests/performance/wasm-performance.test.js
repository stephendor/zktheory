/* eslint-env node, jest */
/* global test, expect, describe, beforeAll, afterAll, console, performance, require */
/**
 * WASM Performance Testing for TDA Core
 * Specialized performance tests for WebAssembly mathematical computations
 */

const { MathematicalPerformanceTester } = require('./MathematicalPerformanceTester');

describe('WASM TDA Core Performance Tests', () => {
    let performanceTester;
    let wasmModule;

    beforeAll(async () => {
        performanceTester = new MathematicalPerformanceTester();

        // Mock WASM module loading - replace with actual WASM module
        wasmModule = {
            compute_persistence: (points) => {
                // Simulate WASM computation
                return {
                    barcode: points.slice(0, 10),
                    diagram: points.map((_, i) => [i, i + 0.1])
                };
            },
            compute_distances: (points) => {
                const distances = [];
                for (let i = 0; i < points.length; i++) {
                    for (let j = i + 1; j < points.length; j++) {
                        const dx = points[i][0] - points[j][0];
                        const dy = points[i][1] - points[j][1];
                        distances.push(Math.sqrt(dx * dx + dy * dy));
                    }
                }
                return distances;
            },
            build_rips_complex: (points, threshold) => {
                const edges = [];
                for (let i = 0; i < points.length; i++) {
                    for (let j = i + 1; j < points.length; j++) {
                        const dx = points[i][0] - points[j][0];
                        const dy = points[i][1] - points[j][1];
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < threshold) {
                            edges.push([i, j]);
                        }
                    }
                }
                return edges;
            }
        };
    });

    describe('WASM Memory Management', () => {
        test('Large Point Cloud Processing', async () => {
            const largePointCloudTest = async () => {
                const numPoints = 1000;
                const points = [];

                // Generate large point cloud
                for (let i = 0; i < numPoints; i++) {
                    points.push([Math.random() * 100, Math.random() * 100, Math.random() * 100]);
                }

                // Process with WASM
                const distances = wasmModule.compute_distances(points);

                return {
                    pointCount: numPoints,
                    distanceCount: distances.length,
                    memoryUsed: points.length * 3 * 8 // 3 coordinates * 8 bytes per double
                };
            };

            const results = await performanceTester.benchmark('wasm_large_point_cloud', largePointCloudTest, 10);

            // Should handle 1000 points efficiently
            expect(results.statistics.duration.mean).toBeLessThan(500); // 500ms threshold
            expect(results.statistics.memory.mean).toBeLessThan(50 * 1024 * 1024); // 50MB threshold
        });

        test('Memory Allocation/Deallocation Performance', async () => {
            const memoryTest = async () => {
                const allocations = [];

                // Simulate multiple WASM memory allocations
                for (let i = 0; i < 60; i++) {
                    // Keep sizes modest to avoid O(n^2) explosion in mock distance calc
                    const size = Math.floor(Math.random() * 120) + 40;
                    const points = new Array(size).fill(0).map(() => [Math.random(), Math.random()]);

                    // Process and immediately release
                    const result = wasmModule.compute_distances(points);
                    allocations.push(result.length);
                }

                return {
                    allocations: allocations.length,
                    totalProcessed: allocations.reduce((a, b) => a + b, 0)
                };
            };

            // Fewer iterations to reduce total runtime while preserving signal
            const results = await performanceTester.benchmark('wasm_memory_management', memoryTest, 8);

            expect(results.statistics.duration.mean).toBeLessThan(120); // Slightly relaxed threshold
        });
    });

    describe('WASM Computational Intensity', () => {
        test('Persistent Homology Computation Scaling', async () => {
            const scalingTest = async () => {
                const testSizes = [50, 100, 200];
                const results = [];

                for (const size of testSizes) {
                    const points = new Array(size).fill(0).map(() => [Math.random(), Math.random()]);

                    const startTime = performance.now();
                    const persistence = wasmModule.compute_persistence(points);
                    const endTime = performance.now();

                    results.push({
                        size,
                        duration: endTime - startTime,
                        barcodeLength: persistence.barcode.length
                    });
                }

                return results;
            };

            const results = await performanceTester.benchmark('wasm_scaling_test', scalingTest, 20);

            // Should scale reasonably with input size
            expect(results.statistics.duration.mean).toBeLessThan(200); // 200ms threshold
        });

        test('Rips Complex Construction Performance', async () => {
            const ripsComplexTest = async () => {
                const numPoints = 100;
                const threshold = 0.2;

                const points = new Array(numPoints).fill(0).map(() => [Math.random(), Math.random()]);

                const edges = wasmModule.build_rips_complex(points, threshold);

                return {
                    points: numPoints,
                    edges: edges.length,
                    density: edges.length / ((numPoints * (numPoints - 1)) / 2)
                };
            };

            const results = await performanceTester.benchmark('wasm_rips_complex', ripsComplexTest, 100);

            expect(results.statistics.duration.mean).toBeLessThan(50); // 50ms threshold
        });
    });

    describe('WASM Data Transfer Performance', () => {
        test('JavaScript to WASM Data Transfer', async () => {
            const dataTransferTest = async () => {
                const dataTypes = [
                    { name: 'small', size: 100 },
                    { name: 'medium', size: 250 },
                    { name: 'large', size: 500 }
                ];

                const transferResults = [];

                for (const { name, size } of dataTypes) {
                    const data = new Array(size).fill(0).map(() => Math.random());

                    const startTime = performance.now();
                    // Simulate data transfer to WASM
                    const processedData = wasmModule.compute_distances(data.map((val, i) => [val, data[(i + 1) % size]]));
                    const endTime = performance.now();

                    transferResults.push({
                        type: name,
                        size,
                        transferTime: endTime - startTime,
                        resultSize: processedData.length
                    });
                }

                return transferResults;
            };

            // Reduce iterations; data sizes already provide variance
            const results = await performanceTester.benchmark('wasm_data_transfer', dataTransferTest, 10);

            expect(results.statistics.duration.mean).toBeLessThan(75); // 75ms threshold
        });

        test('WASM to JavaScript Result Transfer', async () => {
            const resultTransferTest = async () => {
                const numPoints = 200;
                const points = new Array(numPoints).fill(0).map(() => [Math.random(), Math.random()]);

                // Generate large result set
                const startTime = performance.now();
                const distances = wasmModule.compute_distances(points);
                const persistence = wasmModule.compute_persistence(points);
                const endTime = performance.now();

                return {
                    inputSize: numPoints,
                    distancesReturned: distances.length,
                    persistenceReturned: persistence.barcode.length,
                    transferTime: endTime - startTime
                };
            };

            const results = await performanceTester.benchmark('wasm_result_transfer', resultTransferTest, 100);

            expect(results.statistics.duration.mean).toBeLessThan(30); // 30ms threshold
        });
    });

    describe('WASM Optimization Verification', () => {
        test('Optimized vs Unoptimized Performance', async () => {
            const optimizationTest = async () => {
                const points = new Array(150).fill(0).map(() => [Math.random(), Math.random()]);

                // Test optimized WASM path
                const optimizedStart = performance.now();
                const optimizedResult = wasmModule.compute_persistence(points);
                const optimizedEnd = performance.now();

                // Test JavaScript fallback (simulated)
                const jsStart = performance.now();
                const jsResult = {
                    barcode: points.slice(0, 10),
                    diagram: points.map((_, i) => [i, i + 0.1])
                };
                const jsEnd = performance.now();

                return {
                    optimizedTime: optimizedEnd - optimizedStart,
                    jsTime: jsEnd - jsStart,
                    speedup: (jsEnd - jsStart) / (optimizedEnd - optimizedStart),
                    resultsMatch: optimizedResult.barcode.length === jsResult.barcode.length
                };
            };

            const results = await performanceTester.benchmark('wasm_optimization_verification', optimizationTest, 50);

            // WASM should show performance improvement
            expect(results.statistics.duration.mean).toBeLessThan(40); // 40ms threshold

            // Verify speedup in individual measurements
            const avgSpeedup = results.measurements.reduce((sum, m) => sum + m.result.speedup, 0) / results.measurements.length;
            expect(avgSpeedup).toBeGreaterThan(1.5); // At least 1.5x speedup expected
        });
    });

    afterAll(() => {
        // Generate WASM-specific performance report
        const report = performanceTester.generateReport();
        const wasmReportPath = performanceTester.saveReport(report, 'wasm-performance-report.json');
        performanceTester.saveBaselines();

        console.log('\n🚀 WASM Performance Test Summary:');
        console.log('='.repeat(50));
        console.log(`✅ Tests Passed: ${report.summary.passed}`);
        console.log(`❌ Tests Failed: ${report.summary.failed}`);
        console.log(`🔄 Regressions: ${report.summary.regressions.length}`);
        console.log(`📄 Report: ${wasmReportPath}`);
    });
});
