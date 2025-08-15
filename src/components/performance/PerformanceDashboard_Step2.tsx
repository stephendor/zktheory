"use client";

import React from 'react';
import { usePerformanceMonitor, usePerformanceToggle, usePerformanceMetrics } from '../../lib/performance';
import DashboardControls from './DashboardControls';

const PerformanceDashboard_Step2: React.FC = () => {
  // Test if hooks work
  try {
    const { isEnabled, toggle } = usePerformanceToggle();
    const { summary } = usePerformanceMetrics();
    const { startTimer } = usePerformanceMonitor('dashboard_test', 'testing');

    // Test function to generate performance metrics
    const runPerformanceTest = () => {
      console.log('🧪 Running performance test...');
      const stopTimer = startTimer();
      
      // Simulate some work
      const start = Date.now();
      let count = 0;
      while (Date.now() - start < 100) { // Run for 100ms
        count++;
      }
      
      stopTimer();
      console.log('✅ Performance test completed, count:', count);
    };

    // Debug logging
    React.useEffect(() => {
      console.log('🔍 Performance Dashboard Step 2 Debug Info:');
      console.log('  - Monitoring enabled:', isEnabled);
      console.log('  - Summary:', summary);
      console.log('  - Total metrics:', summary.total);
      
      // Auto-run a test on first mount if monitoring is enabled
      if (isEnabled && summary.total === 0) {
        console.log('🚀 Auto-running performance test on first mount...');
        setTimeout(() => runPerformanceTest(), 1000); // Wait 1 second after mount
      }
    }, [isEnabled, summary]);

    return (
      <div className="performance-dashboard bg-gray-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-400">Performance Dashboard - Step 2: + DashboardControls</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggle}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isEnabled 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isEnabled ? '🟢 Monitoring ON' : '🔴 Monitoring OFF'}
              </button>
              <button
                onClick={runPerformanceTest}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                🧪 Run Test
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total Metrics</h3>
              <div className="mt-2 text-3xl font-bold text-blue-400">{summary.total}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Categories</h3>
              <div className="mt-2 text-3xl font-bold text-green-400">{Object.keys(summary.byCategory).length}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Components</h3>
              <div className="mt-2 text-3xl font-bold text-yellow-400">{Object.keys(summary.byComponent).length}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Status</h3>
              <div className={`mt-2 text-xl font-bold ${isEnabled ? 'text-green-400' : 'text-red-400'}`}>
                {isEnabled ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>
          </div>

          {/* ADD DASHBOARD CONTROLS - Step 2 Test */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">Step 2: Testing DashboardControls Component</h2>
            <DashboardControls />
          </div>

          {/* Debug Info */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Debug Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Step:</span>
                <span className="ml-2 font-medium text-yellow-400">2 - Added DashboardControls</span>
              </div>
              <div>
                <span className="text-gray-400">Monitoring Enabled:</span>
                <span className={`ml-2 font-medium ${isEnabled ? 'text-green-400' : 'text-red-400'}`}>
                  {isEnabled ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Total Metrics:</span>
                <span className="ml-2 font-medium text-blue-400">{summary.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ Error in PerformanceDashboard Step 2:', error);
    return (
      <div className="performance-dashboard bg-red-900 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-red-400">Performance Dashboard Step 2 Error</h1>
          <div className="mt-4 text-red-200">
            Component that failed: DashboardControls
          </div>
          <div className="mt-2 text-red-200">
            Error: {error instanceof Error ? error.message : String(error)}
          </div>
        </div>
      </div>
    );
  }
};

export default PerformanceDashboard_Step2;
