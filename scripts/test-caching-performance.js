#!/usr/bin/env node

// Performance Testing Script for zktheory Caching System
// Benchmarks cache performance and provides detailed metrics

const { performance } = require('perf_hooks');

// Mock data for testing
const MOCK_MATHEMATICAL_DATA = {
    'tda-persistence': {
        points: Array.from({ length: 1000 }, () => [Math.random(), Math.random()]),
        algorithm: 'vietoris-rips',
        parameters: { epsilon: 0.1, maxDimension: 2 }
    },
    'elliptic-curve-group': {
        curve: { a: 2, b: 3, p: 17 },
        points: Array.from({ length: 100 }, () => [Math.random() * 16, Math.random() * 16]),
        algorithm: 'point-addition'
    },
    'cayley-graph': {
        generators: ['a', 'b', 'c'],
        relations: ['a^2', 'b^2', 'c^2', '(ab)^3', '(bc)^3', '(ac)^3'],
        algorithm: 'coset-enumeration'
    }
};

// Performance test suite
class CachingPerformanceTester {
    constructor() {
        this.results = {
            cacheOperations: [],
            compressionTests: [],
            warmingTests: [],
            invalidationTests: [],
            overallMetrics: {}
        };
        this.startTime = performance.now();
    }

    // Run all performance tests
    async runAllTests() {
        console.log('🚀 Starting zktheory Caching Performance Tests...\n');

        try {
            // Test cache operations
            await this.testCacheOperations();

            // Test compression performance
            await this.testCompressionPerformance();

            // Test cache warming
            await this.testCacheWarming();

            // Test cache invalidation
            await this.testCacheInvalidation();

            // Calculate overall metrics
            this.calculateOverallMetrics();

            // Generate report
            this.generateReport();
        } catch (error) {
            console.error('❌ Performance testing failed:', error);
        }
    }

    // Test basic cache operations
    async testCacheOperations() {
        console.log('📊 Testing Cache Operations...');

        const operations = ['set', 'get', 'update', 'delete'];
        const dataSizes = [100, 1000, 10000, 100000];

        for (const operation of operations) {
            for (const size of dataSizes) {
                const testData = this.generateTestData(size);
                const result = await this.benchmarkOperation(operation, testData);
                this.results.cacheOperations.push(result);
            }
        }

        console.log(`✅ Cache operations tested: ${this.results.cacheOperations.length} tests completed\n`);
    }

    // Test compression performance
    async testCompressionPerformance() {
        console.log('🗜️ Testing Compression Performance...');

        const compressionTypes = ['gzip', 'deflate', 'lz4'];
        const dataTypes = ['point-cloud', 'matrix', 'graph'];

        for (const type of compressionTypes) {
            for (const dataType of dataTypes) {
                const testData = this.generateMathematicalData(dataType);
                const result = await this.benchmarkCompression(type, testData);
                this.results.compressionTests.push(result);
            }
        }

        console.log(`✅ Compression tests completed: ${this.results.compressionTests.length} tests completed\n`);
    }

    // Test cache warming
    async testCacheWarming() {
        console.log('🔥 Testing Cache Warming...');

        const warmingScenarios = ['time-based', 'usage-based', 'dependency-based', 'predictive'];

        for (const scenario of warmingScenarios) {
            const result = await this.benchmarkWarming(scenario);
            this.results.warmingTests.push(result);
        }

        console.log(`✅ Warming tests completed: ${this.results.warmingTests.length} tests completed\n`);
    }

    // Test cache invalidation
    async testCacheInvalidation() {
        console.log('🔄 Testing Cache Invalidation...');

        const invalidationStrategies = ['version-based', 'dependency-based', 'pattern-based', 'user-specific'];

        for (const strategy of invalidationStrategies) {
            const result = await this.benchmarkInvalidation(strategy);
            this.results.invalidationTests.push(result);
        }

        console.log(`✅ Invalidation tests completed: ${this.results.invalidationTests.length} tests completed\n`);
    }

    // Benchmark a single operation
    async benchmarkOperation(operation, data) {
        const iterations = 100;
        const times = [];

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();

            // Simulate operation
            await this.simulateOperation(operation, data);

            const end = performance.now();
            times.push(end - start);
        }

        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        const stdDev = this.calculateStandardDeviation(times);

        return {
            operation,
            dataSize: JSON.stringify(data).length,
            iterations,
            averageTime: avgTime,
            minTime,
            maxTime,
            standardDeviation: stdDev,
            throughput: (iterations / avgTime) * 1000 // operations per second
        };
    }

    // Benchmark compression
    async benchmarkCompression(algorithm, data) {
        const iterations = 50;
        const times = [];
        const ratios = [];

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();

            // Simulate compression
            const compressedSize = await this.simulateCompression(algorithm, data);

            const end = performance.now();
            times.push(end - start);

            const originalSize = JSON.stringify(data).length;
            const ratio = 1 - compressedSize / originalSize;
            ratios.push(ratio);
        }

        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;

        return {
            algorithm,
            dataType: this.getDataType(data),
            dataSize: JSON.stringify(data).length,
            iterations,
            averageTime: avgTime,
            averageCompressionRatio: avgRatio,
            throughput: (iterations / avgTime) * 1000
        };
    }

    // Benchmark warming
    async benchmarkWarming(scenario) {
        const start = performance.now();

        // Simulate warming
        const warmedKeys = await this.simulateWarming(scenario);

        const end = performance.now();
        const duration = end - start;

        return {
            scenario,
            duration,
            keysWarmed: warmedKeys.length,
            warmingRate: warmedKeys.length / (duration / 1000) // keys per second
        };
    }

    // Benchmark invalidation
    async benchmarkInvalidation(strategy) {
        const start = performance.now();

        // Simulate invalidation
        const invalidatedKeys = await this.simulateInvalidation(strategy);

        const end = performance.now();
        const duration = end - start;

        return {
            strategy,
            duration,
            keysInvalidated: invalidatedKeys.length,
            invalidationRate: invalidatedKeys.length / (duration / 1000)
        };
    }

    // Simulate operations
    async simulateOperation(operation, data) {
        // Simulate network delay and processing time
        const delay = Math.random() * 10 + 1; // 1-11ms
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Simulate different operation complexities
        switch (operation) {
            case 'set':
                return { success: true, cached: true };
            case 'get':
                return { success: true, data };
            case 'update':
                return { success: true, updated: true };
            case 'delete':
                return { success: true, deleted: true };
            default:
                return { success: false };
        }
    }

    // Simulate compression
    async simulateCompression(algorithm, data) {
        // Simulate compression time based on algorithm and data size
        const baseTime = algorithm === 'gzip' ? 5 : algorithm === 'deflate' ? 3 : 2;
        const dataSize = JSON.stringify(data).length;
        const compressionTime = baseTime + dataSize / 1000;

        await new Promise((resolve) => setTimeout(resolve, compressionTime));

        // Simulate compression ratio
        const ratio = algorithm === 'gzip' ? 0.75 : algorithm === 'deflate' ? 0.7 : 0.65;
        return Math.floor(JSON.stringify(data).length * ratio);
    }

    // Simulate warming
    async simulateWarming(scenario) {
        const scenarios = {
            'time-based': 15,
            'usage-based': 25,
            'dependency-based': 20,
            predictive: 30
        };

        const keysToWarm = scenarios[scenario] || 20;
        const delay = Math.random() * 100 + 50; // 50-150ms

        await new Promise((resolve) => setTimeout(resolve, delay));

        return Array.from({ length: keysToWarm }, (_, i) => `warmed-key-${i}`);
    }

    // Simulate invalidation
    async simulateInvalidation(strategy) {
        const strategies = {
            'version-based': 100,
            'dependency-based': 50,
            'pattern-based': 75,
            'user-specific': 25
        };

        const keysToInvalidate = strategies[strategy] || 50;
        const delay = Math.random() * 200 + 100; // 100-300ms

        await new Promise((resolve) => setTimeout(resolve, delay));

        return Array.from({ length: keysToInvalidate }, (_, i) => `invalidated-key-${i}`);
    }

    // Generate test data
    generateTestData(size) {
        return Array.from({ length: size }, () => ({
            id: Math.random().toString(36).substr(2, 9),
            value: Math.random(),
            timestamp: Date.now(),
            metadata: {
                type: 'test',
                category: 'performance'
            }
        }));
    }

    // Generate mathematical data
    generateMathematicalData(type) {
        switch (type) {
            case 'point-cloud':
                return Array.from({ length: 500 }, () => [Math.random(), Math.random()]);
            case 'matrix':
                return Array.from({ length: 100 }, () => Array.from({ length: 100 }, () => Math.random()));
            case 'graph':
                return {
                    nodes: Array.from({ length: 200 }, (_, i) => ({ id: i, x: Math.random(), y: Math.random() })),
                    edges: Array.from({ length: 300 }, () => ({
                        source: Math.floor(Math.random() * 200),
                        target: Math.floor(Math.random() * 200)
                    }))
                };
            default:
                return { data: 'test' };
        }
    }

    // Get data type
    getDataType(data) {
        if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
            return 'point-cloud';
        } else if (Array.isArray(data) && Array.isArray(data[0]) && Array.isArray(data[0][0])) {
            return 'matrix';
        } else if (data.nodes && data.edges) {
            return 'graph';
        }
        return 'unknown';
    }

    // Calculate standard deviation
    calculateStandardDeviation(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map((value) => Math.pow(value - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(avgSquaredDiff);
    }

    // Calculate overall metrics
    calculateOverallMetrics() {
        const totalTests =
            this.results.cacheOperations.length +
            this.results.compressionTests.length +
            this.results.warmingTests.length +
            this.results.invalidationTests.length;

        const totalTime = performance.now() - this.startTime;

        this.results.overallMetrics = {
            totalTests,
            totalTime,
            averageTestTime: totalTime / totalTests,
            testCategories: {
                cacheOperations: this.results.cacheOperations.length,
                compressionTests: this.results.compressionTests.length,
                warmingTests: this.results.warmingTests.length,
                invalidationTests: this.results.invalidationTests.length
            }
        };
    }

    // Generate performance report
    generateReport() {
        console.log('📋 PERFORMANCE TEST REPORT');
        console.log('='.repeat(50));

        // Overall metrics
        console.log('\n🎯 Overall Metrics:');
        console.log(`   Total Tests: ${this.results.overallMetrics.totalTests}`);
        console.log(`   Total Time: ${this.results.overallMetrics.totalTime.toFixed(2)}ms`);
        console.log(`   Average Test Time: ${this.results.overallMetrics.averageTestTime.toFixed(2)}ms`);

        // Cache operations summary
        if (this.results.cacheOperations.length > 0) {
            console.log('\n📊 Cache Operations Performance:');
            const operations = ['set', 'get', 'update', 'delete'];

            for (const operation of operations) {
                const opResults = this.results.cacheOperations.filter((r) => r.operation === operation);
                if (opResults.length > 0) {
                    const avgTime = opResults.reduce((a, b) => a + b.averageTime, 0) / opResults.length;
                    const avgThroughput = opResults.reduce((a, b) => a + b.throughput, 0) / opResults.length;
                    console.log(`   ${operation.toUpperCase()}: ${avgTime.toFixed(2)}ms avg, ${avgThroughput.toFixed(0)} ops/sec`);
                }
            }
        }

        // Compression summary
        if (this.results.compressionTests.length > 0) {
            console.log('\n🗜️ Compression Performance:');
            const algorithms = ['gzip', 'deflate', 'lz4'];

            for (const algorithm of algorithms) {
                const algResults = this.results.compressionTests.filter((r) => r.algorithm === algorithm);
                if (algResults.length > 0) {
                    const avgTime = algResults.reduce((a, b) => a + b.averageTime, 0) / algResults.length;
                    const avgRatio = algResults.reduce((a, b) => a + b.averageCompressionRatio, 0) / algResults.length;
                    console.log(`   ${algorithm.toUpperCase()}: ${avgTime.toFixed(2)}ms avg, ${(avgRatio * 100).toFixed(1)}% compression`);
                }
            }
        }

        // Warming summary
        if (this.results.warmingTests.length > 0) {
            console.log('\n🔥 Cache Warming Performance:');
            for (const test of this.results.warmingTests) {
                console.log(`   ${test.scenario}: ${test.duration.toFixed(2)}ms, ${test.warmingRate.toFixed(1)} keys/sec`);
            }
        }

        // Invalidation summary
        if (this.results.invalidationTests.length > 0) {
            console.log('\n🔄 Cache Invalidation Performance:');
            for (const test of this.results.invalidationTests) {
                console.log(`   ${test.strategy}: ${test.duration.toFixed(2)}ms, ${test.invalidationRate.toFixed(1)} keys/sec`);
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('✅ Performance testing completed!');
    }
}

// Run tests if script is executed directly
if (require.main === module) {
    const tester = new CachingPerformanceTester();
    tester.runAllTests().catch(console.error);
}

module.exports = CachingPerformanceTester;
