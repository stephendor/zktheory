/**
 * Global Teardown for Mathematical Testing Suite
 * Cleanup and performance reporting after test completion
 */

module.exports = async () => {
  console.log('\n🧹 Mathematical Testing Suite Teardown...\n');
  
  // Calculate total test execution time
  const endTime = Date.now();
  const totalDuration = endTime - (global.__PERFORMANCE_BASELINE__?.startTime || endTime);
  
  // Memory usage analysis
  const finalMemory = process.memoryUsage();
  const initialMemory = global.__PERFORMANCE_BASELINE__?.initialMemory || finalMemory;
  
  const memoryDelta = {
    rss: finalMemory.rss - initialMemory.rss,
    heapTotal: finalMemory.heapTotal - initialMemory.heapTotal,
    heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
    external: finalMemory.external - initialMemory.external,
    arrayBuffers: finalMemory.arrayBuffers - initialMemory.arrayBuffers
  };
  
  // Performance summary
  console.log('📈 Performance Summary:');
  console.log(`⏱️  Total execution time: ${totalDuration}ms`);
  console.log(`💾 Memory usage delta:`);
  console.log(`   RSS: ${Math.round(memoryDelta.rss / 1024 / 1024 * 100) / 100}MB`);
  console.log(`   Heap Total: ${Math.round(memoryDelta.heapTotal / 1024 / 1024 * 100) / 100}MB`);
  console.log(`   Heap Used: ${Math.round(memoryDelta.heapUsed / 1024 / 1024 * 100) / 100}MB`);
  
  // Check for memory leaks (basic heuristic)
  const heapUsedMB = memoryDelta.heapUsed / 1024 / 1024;
  if (heapUsedMB > 50) {
    console.warn(`⚠️  High memory usage detected: ${Math.round(heapUsedMB)}MB`);
    console.warn('   Consider checking for memory leaks in mathematical computations');
  }
  
  // Performance benchmarks
  if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
    try {
      performance.mark('test-suite-end');
      performance.measure('total-test-duration', 'test-suite-start', 'test-suite-end');
      
      const measures = performance.getEntriesByType('measure');
      if (measures.length > 0) {
        console.log('\n🎯 Detailed Performance Metrics:');
        measures.forEach(measure => {
          console.log(`   ${measure.name}: ${Math.round(measure.duration * 100) / 100}ms`);
        });
      }
    } catch (perfError) {
      // Performance API not available or failed
      console.log('📊 Performance metrics not available');
    }
  }
  
  // Save performance data for CI analysis
  try {
    const path = require('path');
    const fs = require('fs');
    
    const perfDataDir = path.join(process.cwd(), 'performance-data');
    if (!fs.existsSync(perfDataDir)) {
      fs.mkdirSync(perfDataDir, { recursive: true });
    }
    
    // Save performance summary for CI
    const performanceSummary = {
      timestamp: new Date().toISOString(),
      environment: 'test',
      totalDuration,
      memoryDelta,
      thresholds: {
        performanceMs: global.__PERFORMANCE_THRESHOLD_MS__ || 100,
        memoryMB: global.__MEMORY_THRESHOLD_MB__ || 50
      },
      passed: {
        performance: totalDuration < (global.__PERFORMANCE_THRESHOLD_MS__ || 100),
        memory: heapUsedMB < (global.__MEMORY_THRESHOLD_MB__ || 50)
      }
    };
    
    const summaryPath = path.join(perfDataDir, 'test-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(performanceSummary, null, 2));
    console.log(`📊 Performance summary saved to ${summaryPath}`);
    
    // Check for performance regressions
    if (!performanceSummary.passed.performance) {
      console.warn(`⚠️  Performance regression: ${totalDuration}ms exceeds threshold of ${performanceSummary.thresholds.performanceMs}ms`);
    }
    
    if (!performanceSummary.passed.memory) {
      console.warn(`⚠️  Memory usage regression: ${heapUsedMB}MB exceeds threshold of ${performanceSummary.thresholds.memoryMB}MB`);
    }
    
  } catch (saveError) {
    console.warn('⚠️  Error saving performance data:', saveError.message);
  }
  
  // Cleanup global variables
  try {
    delete global.__MATHEMATICAL_CONSTANTS__;
    delete global.__PERFORMANCE_BASELINE__;
    delete global.__MATHEMATICAL_PRECISION__;
    delete global.__TEST_DATA_GENERATORS__;
    delete global.__MATHEMATICAL_VALIDATORS__;
    delete global.__BENCHMARK_DATA__;
    delete global.__TEST_TIMEOUTS__;
    delete global.__STATISTICAL_UTILS__;
    delete global.__MATHEMATICAL_TESTING__;
    delete global.__PERFORMANCE_THRESHOLD_MS__;
    delete global.__MEMORY_THRESHOLD_MB__;
  } catch (cleanupError) {
    console.warn('⚠️  Error during cleanup:', cleanupError.message);
  }
  
  // Test quality metrics
  const testResults = global.__TEST_RESULTS__ || {};
  if (Object.keys(testResults).length > 0) {
    console.log('\n📊 Test Quality Metrics:');
    Object.entries(testResults).forEach(([category, metrics]) => {
      console.log(`   ${category}: ${JSON.stringify(metrics)}`);
    });
  }
  
  // Mathematical accuracy summary
  if (global.__MATHEMATICAL_ACCURACY_SUMMARY__) {
    console.log('\n🔬 Mathematical Accuracy Summary:');
    const summary = global.__MATHEMATICAL_ACCURACY_SUMMARY__;
    console.log(`   Tests with high precision: ${summary.highPrecision || 0}`);
    console.log(`   Tests with medium precision: ${summary.mediumPrecision || 0}`);
    console.log(`   Tests with low precision: ${summary.lowPrecision || 0}`);
    
    if (summary.failures && summary.failures.length > 0) {
      console.warn(`   ⚠️  Accuracy failures: ${summary.failures.length}`);
      summary.failures.forEach(failure => {
        console.warn(`      ${failure}`);
      });
    }
  }
  
  // Final recommendations
  console.log('\n💡 Performance Recommendations:');
  
  if (totalDuration > 60000) {
    console.log('   - Consider parallelizing slow mathematical computations');
  }
  
  if (heapUsedMB > 25) {
    console.log('   - Review mathematical algorithms for memory efficiency');
  }
  
  if (heapUsedMB < 5) {
    console.log('   ✅ Excellent memory efficiency');
  }
  
  if (totalDuration < 30000) {
    console.log('   ✅ Good test performance');
  }
  
  console.log('\n🏁 Mathematical testing suite completed successfully!\n');
};