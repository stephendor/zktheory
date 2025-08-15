"use client";

import React, { useState } from 'react';
import { usePerformanceMonitor, usePerformanceToggle, usePerformanceMetrics } from '../../lib/performance';
import PerformanceCharts from './PerformanceCharts';
import PerformanceMetrics from './PerformanceMetrics';
import PerformanceAlerts from './PerformanceAlerts';
import DashboardControls from './DashboardControls';

const PerformanceDashboard: React.FC = () => {
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

  // Debug logging and auto-test
  React.useEffect(() => {
    console.log('🔍 Performance Dashboard Debug Info:');
    console.log('  - Monitoring enabled:', isEnabled);
    console.log('  - Summary:', summary);
    console.log('  - Total metrics:', summary.total);
    console.log('  - By category:', summary.byCategory);
    console.log('  - By component:', summary.byComponent);
    
    // Auto-run a test on first mount if monitoring is enabled
    if (isEnabled && summary.total === 0) {
      console.log('🚀 Auto-running performance test on first mount...');
      setTimeout(() => runPerformanceTest(), 1000); // Wait 1 second after mount
    }
  }, [isEnabled, summary]);

  return (
    <div className="performance-dashboard bg-gray-900 text-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-400">
                Performance Monitoring Dashboard
              </h1>
              <p className="text-gray-300 mt-2">
                Real-time monitoring of mathematical computations, rendering performance, and memory usage
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={runPerformanceTest}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                🧪 Run Test
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">Monitoring:</span>
                <button
                  onClick={toggle}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isEnabled
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <div className="text-sm text-gray-400">
                Buffer: {summary.total} / {summary.total > 0 ? '∞' : '0'} metrics
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Charts */}
          <div className="lg:col-span-2">
            <PerformanceCharts />
          </div>

          {/* Performance Metrics */}
          <div>
            <PerformanceMetrics />
          </div>
        </div>

        {/* Alerts and Controls Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceAlerts />
          <DashboardControls />
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
