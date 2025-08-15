"use client";

import React, { useState } from 'react';
import { usePerformanceMonitor, usePerformanceToggle, usePerformanceMetrics } from '../../lib/performance';
import DashboardControlsSimple from './DashboardControlsSimple';

const PerformanceDashboardStep2: React.FC = () => {
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

  return (
    <div className="performance-dashboard bg-gray-900 text-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Performance Monitoring Dashboard (Step 2)</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              className={`px-4 py-2 rounded-lg font-medium ${
                isEnabled 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-gray-200'
              }`}
            >
              {isEnabled ? '⏸️ Monitoring ON' : '▶️ Monitoring OFF'}
            </button>
            <button
              onClick={runPerformanceTest}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              🧪 Run Test
            </button>
          </div>
        </div>

        {/* Basic Metrics Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Status</h3>
            <p className="text-2xl font-bold text-green-400">
              {isEnabled ? 'ACTIVE' : 'DISABLED'}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Metrics</h3>
            <p className="text-2xl font-bold text-blue-400">{summary.total}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Categories</h3>
            <p className="text-2xl font-bold text-purple-400">
              {Object.keys(summary.byCategory).length}
            </p>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p><strong>Monitoring Enabled:</strong> {isEnabled.toString()}</p>
            <p><strong>Total Metrics:</strong> {summary.total}</p>
            <p><strong>Categories:</strong> {JSON.stringify(summary.byCategory, null, 2)}</p>
            <p><strong>Components:</strong> {JSON.stringify(summary.byComponent, null, 2)}</p>
          </div>
        </div>

        {/* Add Step 2: Simple Dashboard Controls */}
        <DashboardControlsSimple />
      </div>
    </div>
  );
};

export default PerformanceDashboardStep2;
