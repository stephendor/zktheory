/**
 * Global setup for mathematical testing environment
 * Initializes performance monitoring, baselines, and test infrastructure
 */

import { performanceBaselineManager } from '../src/lib/performance/PerformanceBaselineManager';
import { mathematicalPerformanceMonitor } from '../src/lib/performance/MathematicalPerformanceMonitor';

async function globalSetup() {
  console.log('🔧 Setting up mathematical testing environment...');
  
  // Initialize performance monitoring
  console.log('📊 Initializing performance monitoring...');
  
  // Set global test configuration
  (global as any).__MATHEMATICAL_TESTING__ = true;
  (global as any).__PERFORMANCE_THRESHOLD_MS__ = parseInt(process.env.PERFORMANCE_THRESHOLD_MS || '100');
  (global as any).__MEMORY_THRESHOLD_MB__ = parseInt(process.env.MEMORY_THRESHOLD_MB || '50');
  
  // Initialize performance baseline manager
  await performanceBaselineManager.updateConfiguration({
    minSampleSize: 10, // Reduced for CI
    confidenceLevel: 0.95,
    outlierThreshold: 2.5,
    updateFrequency: 'continuous',
    environments: ['test', 'ci'],
    retentionPeriodDays: 30
  });
  
  console.log('✅ Mathematical testing environment ready');
  
  // Set up mathematical constants for testing
  (global as any).__MATH_CONSTANTS__ = {
    PI: Math.PI,
    E: Math.E,
    GOLDEN_RATIO: (1 + Math.sqrt(5)) / 2,
    EULER_GAMMA: 0.5772156649015329
  };
  
  // Initialize WASM testing environment
  if (typeof globalThis !== 'undefined') {
    // Mock WebAssembly for Node.js testing environment
    if (typeof globalThis.WebAssembly === 'undefined') {
      (globalThis as any).WebAssembly = {
        instantiate: () => Promise.resolve({ instance: { exports: {} } }),
        compile: () => Promise.resolve({}),
        Module: class MockWasmModule {}
      };
    }
  }
  
  console.log('🧮 Mathematical testing environment initialized successfully');
}

export default globalSetup;