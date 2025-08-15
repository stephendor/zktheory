// Performance Monitor Validation Script
// This script helps validate that the performance monitoring system is working

console.log('🔧 Performance Monitor Validation Starting...');

// Test 1: Check if performance monitoring is available
try {
    const { performanceMetrics } = require('../src/lib/performance/PerformanceMetrics');
    console.log('✅ Performance metrics module loaded successfully');

    // Test 2: Check initial state
    const initialSummary = performanceMetrics.getMetricsSummary();
    console.log('📊 Initial metrics summary:', initialSummary);

    // Test 3: Start and stop a timer
    console.log('⏱️ Testing timer functionality...');
    const stopTimer = performanceMetrics.startTimer('test_validation', 'validation');

    // Simulate some work
    setTimeout(() => {
        stopTimer();

        // Check if metric was recorded
        const finalSummary = performanceMetrics.getMetricsSummary();
        console.log('📊 Final metrics summary:', finalSummary);

        if (finalSummary.total > initialSummary.total) {
            console.log('✅ SUCCESS: Performance metric was recorded!');
            console.log(`📈 Metrics increased from ${initialSummary.total} to ${finalSummary.total}`);
        } else {
            console.log('❌ FAILURE: No new metrics were recorded');
        }
    }, 100);
} catch (error) {
    console.error('❌ Error loading performance monitoring:', error.message);
}
