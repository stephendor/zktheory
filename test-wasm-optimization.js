// Test script for WASM TDA Engine Optimization
// Run this in the browser console to test the optimization features

console.log('🧪 Testing WASM TDA Engine Optimization...');

// Test data generation
function generateTestPoints(count, type = 'random') {
    const points = [];

    switch (type) {
        case 'circle':
            for (let i = 0; i < count; i++) {
                const angle = (2 * Math.PI * i) / count;
                const radius = 0.3 + (Math.random() - 0.5) * 0.1;
                points.push([0.5 + radius * Math.cos(angle), 0.5 + radius * Math.sin(angle)]);
            }
            break;

        case 'clusters':
            const clusters = [
                { center: [0.2, 0.2], radius: 0.1, count: Math.floor(count / 3) },
                { center: [0.8, 0.8], radius: 0.1, count: Math.floor(count / 3) },
                { center: [0.5, 0.5], radius: 0.15, count: count - 2 * Math.floor(count / 3) }
            ];

            clusters.forEach(({ center, radius, count: clusterCount }) => {
                for (let i = 0; i < clusterCount; i++) {
                    const angle = Math.random() * 2 * Math.PI;
                    const r = Math.random() * radius;
                    points.push([center[0] + r * Math.cos(angle), center[1] + r * Math.sin(angle)]);
                }
            });
            break;

        default: // random
            for (let i = 0; i < count; i++) {
                points.push([Math.random(), Math.random()]);
            }
    }

    return points;
}

// Performance test function
async function testPerformance() {
    console.log('\n📊 Performance Test Results:');
    console.log('='.repeat(60));

    const testScenarios = [
        { name: 'Small Dataset', points: 20, type: 'random' },
        { name: 'Medium Dataset', points: 50, type: 'clusters' },
        { name: 'Large Dataset', points: 100, type: 'circle' },
        { name: 'Extra Large', points: 200, type: 'clusters' }
    ];

    for (const scenario of testScenarios) {
        console.log(`\n🔍 Testing: ${scenario.name}`);
        console.log(`   Points: ${scenario.points}, Type: ${scenario.type}`);

        const points = generateTestPoints(scenario.points, scenario.type);
        const maxEpsilon = 0.8;
        const maxDimension = 2;

        try {
            // Test 1: First computation (should be slower)
            const start1 = performance.now();
            const result1 = await window.computePersistenceParallel(points, maxEpsilon, maxDimension);
            const time1 = performance.now() - start1;

            // Test 2: Cached computation (should be faster)
            const start2 = performance.now();
            const result2 = await window.computePersistenceParallel(points, maxEpsilon, maxDimension);
            const time2 = performance.now() - start2;

            // Test 3: Third computation (should be fastest)
            const start3 = performance.now();
            const result3 = await window.computePersistenceParallel(points, maxEpsilon, maxDimension);
            const time3 = performance.now() - start3;

            console.log(`   First run: ${time1.toFixed(2)}ms`);
            console.log(`   Cached: ${time2.toFixed(2)}ms`);
            console.log(`   Third run: ${time3.toFixed(2)}ms`);
            console.log(`   Speedup: ${(time1 / time3).toFixed(2)}x`);
            console.log(`   Target met: ${time3 <= 100 ? '✅' : '❌'} (< 100ms)`);
            console.log(`   Results: ${result3.length} persistence intervals`);
        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
        }
    }
}

// Cache performance test
async function testCachePerformance() {
    console.log('\n💾 Cache Performance Test:');
    console.log('='.repeat(60));

    try {
        const cacheStats = window.getCacheStats();
        console.log(`Memory Cache: ${cacheStats.size} entries, ${(cacheStats.hitRate * 100).toFixed(1)}% hit rate`);

        // Test cache clearing
        console.log('\n🧹 Testing cache management...');
        window.clearCache();

        const statsAfterClear = window.getCacheStats();
        console.log(`After clear: ${statsAfterClear.size} entries, ${(statsAfterClear.hitRate * 100).toFixed(1)}% hit rate`);
    } catch (error) {
        console.error(`Cache test error: ${error.message}`);
    }
}

// Worker performance test
async function testWorkerPerformance() {
    console.log('\n👥 Worker Performance Test:');
    console.log('='.repeat(60));

    try {
        const metrics = window.getPerformanceMetrics();
        console.log(`Active Workers: ${metrics.workerCount}`);
        console.log(`WASM Load Time: ${metrics.wasmLoadTime.toFixed(2)}ms`);
        console.log(`Memory Usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)} MB`);

        // Test parallel vs sequential
        const largePoints = generateTestPoints(300, 'clusters');
        const maxEpsilon = 1.0;
        const maxDimension = 2;

        console.log('\n🔄 Testing parallel vs sequential computation...');

        // Sequential test (if available)
        const startSeq = performance.now();
        try {
            const engine = window.createTDAEngine();
            if (engine) {
                engine.set_points(largePoints);
                const result = engine.compute_persistence();
                const timeSeq = performance.now() - startSeq;
                console.log(`Sequential: ${timeSeq.toFixed(2)}ms`);

                // Parallel test
                const startPar = performance.now();
                const resultPar = await window.computePersistenceParallel(largePoints, maxEpsilon, maxDimension);
                const timePar = performance.now() - startPar;

                console.log(`Parallel: ${timePar.toFixed(2)}ms`);
                console.log(`Speedup: ${(timeSeq / timePar).toFixed(2)}x`);
                console.log(`Target met: ${timePar <= 100 ? '✅' : '❌'} (< 100ms)`);
            }
        } catch (error) {
            console.log('Sequential computation not available');
        }
    } catch (error) {
        console.error(`Worker test error: ${error.message}`);
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting comprehensive WASM optimization tests...\n');

    try {
        // Test 1: Basic performance
        await testPerformance();

        // Test 2: Cache performance
        await testCachePerformance();

        // Test 3: Worker performance
        await testWorkerPerformance();

        console.log('\n🎉 All tests completed!');
        console.log('\n📋 Summary:');
        console.log('- Check the performance dashboard for real-time metrics');
        console.log('- Monitor cache hit rates and worker utilization');
        console.log('- Verify sub-100ms targets are being met');
    } catch (error) {
        console.error('❌ Test suite failed:', error);
    }
}

// Export functions for console use
window.testWasmOptimization = {
    runAllTests,
    testPerformance,
    testCachePerformance,
    testWorkerPerformance,
    generateTestPoints
};

console.log('✅ Test functions loaded! Use:');
console.log('- window.testWasmOptimization.runAllTests() - Run all tests');
console.log('- window.testWasmOptimization.testPerformance() - Test performance');
console.log('- window.testWasmOptimization.testCachePerformance() - Test caching');
console.log('- window.testWasmOptimization.testWorkerPerformance() - Test workers');
