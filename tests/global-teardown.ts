/**
 * Global teardown for mathematical testing environment
 * Cleans up performance data, saves metrics, and generates reports
 */

import { performanceBaselineManager } from '../src/lib/performance/PerformanceBaselineManager';
import { mathematicalPerformanceMonitor } from '../src/lib/performance/MathematicalPerformanceMonitor';
import * as fs from 'fs';
import * as path from 'path';

async function globalTeardown() {
  console.log('🧹 Cleaning up mathematical testing environment...');
  
  try {
    // Export performance data for CI analysis
    const performanceData = performanceBaselineManager.exportData();
    const performanceMetrics = mathematicalPerformanceMonitor.exportData();
    
    // Create performance data directory if it doesn't exist
    const perfDataDir = path.join(process.cwd(), 'performance-data');
    if (!fs.existsSync(perfDataDir)) {
      fs.mkdirSync(perfDataDir, { recursive: true });
    }
    
    // Save performance baselines
    const baselinesPath = path.join(perfDataDir, 'test-baselines.json');
    fs.writeFileSync(baselinesPath, JSON.stringify(performanceData, null, 2));
    console.log(`📊 Performance baselines saved to ${baselinesPath}`);
    
    // Save metrics data
    const metricsPath = path.join(perfDataDir, 'test-metrics.json');
    fs.writeFileSync(metricsPath, JSON.stringify(performanceMetrics, null, 2));
    console.log(`📈 Metrics data saved to ${metricsPath}`);
    
    // Generate performance summary
    const summary = {
      timestamp: new Date().toISOString(),
      environment: 'test',
      totalTests: Object.keys(performanceData.measurementSummary).length,
      baselines: Object.keys(performanceData.baselines).length,
      thresholds: {
        performanceMs: (global as any).__PERFORMANCE_THRESHOLD_MS__ || 100,
        memoryMB: (global as any).__MEMORY_THRESHOLD_MB__ || 50
      },
      metrics: {
        totalMeasurements: performanceMetrics.metrics.length || 0,
        averageExecutionTime: performanceMetrics.metrics.length > 0 
          ? performanceMetrics.metrics.reduce((sum, m) => sum + m.value, 0) / performanceMetrics.metrics.length 
          : 0
      }
    };
    
    const summaryPath = path.join(perfDataDir, 'test-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📋 Test summary saved to ${summaryPath}`);
    
    // Check for performance regressions
    let hasRegressions = false;
    const threshold = (global as any).__PERFORMANCE_THRESHOLD_MS__ || 100;
    
    performanceMetrics.metrics.forEach((metric, index) => {
      if (metric.value > threshold) {
        console.warn(`⚠️  Performance regression detected: Test ${index} took ${metric.value}ms (threshold: ${threshold}ms)`);
        hasRegressions = true;
      }
    });
    
    if (hasRegressions) {
      console.warn('⚠️  Performance regressions detected - review performance data');
    } else {
      console.log('✅ No performance regressions detected');
    }
    
    // Clear in-memory data
    performanceBaselineManager.reset();
    
    console.log('🏁 Mathematical testing environment cleanup completed');
    
  } catch (error) {
    console.error('❌ Error during teardown:', error);
    // Don't fail the tests due to teardown issues
  }
}

export default globalTeardown;