'use client';

import React, { useState, useEffect } from 'react';
import { mathematicalCacheManager, serviceWorkerManager, cachePerformanceMonitor } from '../../lib/caching';

export default function TestCachingSimplePage() {
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [swStatus, setSwStatus] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // Test basic cache operations
  const testBasicCache = async () => {
    try {
      addTestResult('🧪 Testing basic cache operations...');
      
      // Test cache stats
      const stats = await mathematicalCacheManager.getCacheStats();
      addTestResult(`📊 Cache stats: ${JSON.stringify(stats, null, 2)}`);
      setCacheStats(stats);
      
      // Test service worker status
      const sw = await serviceWorkerManager.getStatus();
      addTestResult(`🔧 Service Worker status: ${JSON.stringify(sw, null, 2)}`);
      setSwStatus(sw);
      
      // Test performance metrics
      const metrics = cachePerformanceMonitor.getPerformanceMetrics();
      addTestResult(`⚡ Performance metrics: ${JSON.stringify(metrics, null, 2)}`);
      setPerformanceMetrics(metrics);
      
      addTestResult('✅ Basic cache test completed');
    } catch (error) {
      addTestResult(`❌ Basic cache test failed: ${error}`);
    }
  };

  // Test cache operations
  const testCacheOperations = async () => {
    try {
      addTestResult('🧪 Testing cache operations...');
      
      // Test setting a cache entry
      const testData = { test: 'data', timestamp: Date.now() };
      await mathematicalCacheManager.cacheComputation('tda-persistence', 'test-input', testData);
      addTestResult('✅ Cached test computation');
      
      // Test getting the cache entry
      const retrieved = await mathematicalCacheManager.getCachedComputation('tda-persistence', 'test-input');
      addTestResult(`📥 Retrieved: ${JSON.stringify(retrieved)}`);
      
      // Test cache stats again
      const newStats = await mathematicalCacheManager.getCacheStats();
      addTestResult(`📊 New cache stats: ${JSON.stringify(newStats, null, 2)}`);
      setCacheStats(newStats);
      
      addTestResult('✅ Cache operations test completed');
    } catch (error) {
      addTestResult(`❌ Cache operations test failed: ${error}`);
    }
  };

  // Test performance monitoring
  const testPerformanceMonitoring = async () => {
    try {
      addTestResult('🧪 Testing performance monitoring...');
      
      // Record some test metrics
      cachePerformanceMonitor.recordMetric({
        operation: 'get',
        key: 'test-key',
        duration: 50,
        success: true,
        metadata: { algorithm: 'tda-persistence', type: 'computation' }
      });
      
      cachePerformanceMonitor.recordMetric({
        operation: 'set',
        key: 'test-key',
        duration: 25,
        success: true,
        metadata: { algorithm: 'tda-persistence', type: 'computation' }
      });
      
      // Get updated metrics
      const updatedMetrics = cachePerformanceMonitor.getPerformanceMetrics();
      addTestResult(`⚡ Updated performance metrics: ${JSON.stringify(updatedMetrics, null, 2)}`);
      setPerformanceMetrics(updatedMetrics);
      
      addTestResult('✅ Performance monitoring test completed');
    } catch (error) {
      addTestResult(`❌ Performance monitoring test failed: ${error}`);
    }
  };

  // Clear test results
  const clearTestResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Simple Caching System Test
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Test Controls */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            <div className="space-y-4">
              <button
                onClick={testBasicCache}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🧪 Test Basic Cache
              </button>
              
              <button
                onClick={testCacheOperations}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                📝 Test Cache Operations
              </button>
              
              <button
                onClick={testPerformanceMonitoring}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                ⚡ Test Performance Monitoring
              </button>
              
              <button
                onClick={clearTestResults}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                🗑️ Clear Results
              </button>
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Current Status</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">Cache Stats</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {cacheStats ? JSON.stringify(cacheStats, null, 2) : 'Not loaded'}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Service Worker Status</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {swStatus ? JSON.stringify(swStatus, null, 2) : 'Not loaded'}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Performance Metrics</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {performanceMetrics ? JSON.stringify(performanceMetrics, null, 2) : 'Not loaded'}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet. Run a test to see results.</p>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
