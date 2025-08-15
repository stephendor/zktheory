"use client";

import React, { useState } from 'react';
import { performanceMetrics } from '../../lib/performance';

const DashboardControls: React.FC = () => {
  const [sampleRate, setSampleRate] = useState(1.0);
  const [bufferSize, setBufferSize] = useState(10000);
  const [autoCleanup, setAutoCleanup] = useState(true);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  const handleSampleRateChange = (rate: number) => {
    setSampleRate(rate);
    performanceMetrics.setSampleRate(rate);
  };

  const handleBufferSizeChange = (size: number) => {
    setBufferSize(size);
    // Note: Buffer size change would require reinitializing the buffer
    // This is a simplified implementation
  };

  const handleClearMetrics = () => {
    if (confirm('Are you sure you want to clear all performance metrics? This action cannot be undone.')) {
      performanceMetrics.clearMetrics();
    }
  };

  const handleExportData = () => {
    const metrics = performanceMetrics.getMetrics();
    if (metrics.length === 0) {
      alert('No metrics available for export');
      return;
    }

    if (exportFormat === 'csv') {
      exportToCSV(metrics);
    } else {
      exportToJSON(metrics);
    }
  };

  const exportToCSV = (metrics: any[]) => {
    const headers = ['ID', 'Timestamp', 'Category', 'Value', 'Unit', 'Metadata'];
    const csvContent = [
      headers.join(','),
      ...metrics.map(metric => [
        metric.id,
        new Date(metric.timestamp).toISOString(),
        metric.category,
        metric.value,
        metric.unit,
        JSON.stringify(metric.metadata || {})
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = (metrics: any[]) => {
    const data = {
      exportDate: new Date().toISOString(),
      totalMetrics: metrics.length,
      metrics: metrics
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    const metrics = performanceMetrics.getMetrics();
    if (metrics.length === 0) {
      alert('No metrics available for report generation');
      return;
    }

    const report = {
      summary: {
        totalMetrics: metrics.length,
        averageComputationTime: 0,
        averageMemoryUsage: 0,
        performanceScore: 0
      },
      trends: {
        computationTrend: 'stable' as const,
        memoryTrend: 'stable' as const,
        renderingTrend: 'stable' as const
      },
      recommendations: [] as any[],
      timestamp: new Date().toISOString()
    };

    // Calculate averages
    const computationMetrics = metrics.filter(m => m.category === 'computation');
    const memoryMetrics = metrics.filter(m => m.category === 'memory');
    const renderingMetrics = metrics.filter(m => m.category === 'rendering');

    if (computationMetrics.length > 0) {
      report.summary.averageComputationTime = 
        computationMetrics.reduce((sum, m) => sum + m.value, 0) / computationMetrics.length;
    }

    if (memoryMetrics.length > 0) {
      report.summary.averageMemoryUsage = 
        memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length;
    }

    // Generate recommendations
    if (report.summary.averageComputationTime > 200) {
      report.recommendations.push({
        type: 'optimization',
        priority: 'medium',
        message: 'Average computation time is high',
        action: 'Consider implementing computation caching or optimization'
      });
    }

    if (report.summary.averageMemoryUsage > 50 * 1024 * 1024) { // 50MB
      report.recommendations.push({
        type: 'optimization',
        priority: 'high',
        message: 'Memory usage is high',
        action: 'Implement memory cleanup strategies'
      });
    }

    // Export report
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-blue-300 mb-6">Dashboard Controls</h2>
      
      <div className="space-y-6">
        {/* Sampling Configuration */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Sampling Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Sample Rate: {Math.round(sampleRate * 100)}%
              </label>
              <input
                type="range"
                min="0.01"
                max="1"
                step="0.01"
                value={sampleRate}
                onChange={(e) => handleSampleRateChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                aria-label="Sample rate"
                title="Sample rate"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Lower sample rates reduce overhead but provide less detailed data
            </div>
          </div>
        </div>

        {/* Buffer Configuration */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Buffer Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Buffer Size: {bufferSize.toLocaleString()} metrics
              </label>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={bufferSize}
                onChange={(e) => handleBufferSizeChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                aria-label="Buffer size"
                title="Buffer size"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1K</span>
                <span>50K</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoCleanup"
                checked={autoCleanup}
                onChange={(e) => setAutoCleanup(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                aria-label="Auto-cleanup old metrics"
                title="Auto-cleanup old metrics"
              />
              <label htmlFor="autoCleanup" className="text-sm text-gray-300">
                Auto-cleanup old metrics
              </label>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Data Management</h3>
          <div className="space-y-3">
            <button
              onClick={handleClearMetrics}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Clear All Metrics
            </button>
            <div className="text-xs text-gray-400 text-center">
              This will permanently delete all collected performance data
            </div>
          </div>
        </div>

        {/* Export Configuration */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Export Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Export Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                className="w-full bg-gray-600 border border-gray-500 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Export format"
                title="Export format"
              >
                <option value="csv">CSV (Excel compatible)</option>
                <option value="json">JSON (Full data)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportData}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Export Data
              </button>
              <button
                onClick={generateReport}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">System Status</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Buffer Usage:</span>
              <span className="text-white">
                {performanceMetrics.getBufferSize()} / {performanceMetrics.getBufferCapacity()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Buffer Status:</span>
              <span className={`font-medium ${performanceMetrics.isBufferFull() ? 'text-red-400' : 'text-green-400'}`}>
                {performanceMetrics.isBufferFull() ? 'Full' : 'OK'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active Hooks:</span>
              <span className="text-white">
                {performanceMetrics.getActiveHooks().length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardControls;
