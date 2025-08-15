// Demo page for testing the real-time caching dashboard
// Allows users to trigger mathematical operations and see live data

'use client';

import React, { useState, useEffect } from 'react';
import { useMathematicalTracking } from '../../lib/caching';
import { CachePerformanceDashboard } from '../../components/performance/CachePerformanceDashboard';

export default function TestCachingDashboardPage() {
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const [generatedOperations, setGeneratedOperations] = useState(0);
  const { startComputation, completeComputation, startVisualization, completeVisualization } = useMathematicalTracking();

  // Generate mock mathematical operations
  const generateMockOperations = async () => {
    setIsGeneratingData(true);
    let operations = 0;

    // Generate TDA computations
    for (let i = 0; i < 5; i++) {
      const id = `tda-${Date.now()}-${i}`;
      startComputation({
        id,
        algorithm: 'vietoris-rips',
        inputSize: Math.floor(Math.random() * 1000) + 100,
        metadata: {
          inputType: 'point-cloud',
          outputType: 'persistence-diagram',
          complexity: 'O(n³)',
          parameters: { epsilon: 0.1 + Math.random() * 0.2, maxDimension: 2 }
        }
      });

      // Simulate computation time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
      
      completeComputation(id, {
        success: Math.random() > 0.1, // 90% success rate
        cacheHit: Math.random() > 0.3, // 70% cache hit rate
        metadata: {
          outputSize: Math.floor(Math.random() * 500) + 50,
          memoryUsage: Math.floor(Math.random() * 100) + 10
        }
      });
      operations++;
    }

    // Generate elliptic curve computations
    for (let i = 0; i < 3; i++) {
      const id = `ec-${Date.now()}-${i}`;
      startComputation({
        id,
        algorithm: 'point-addition',
        inputSize: Math.floor(Math.random() * 100) + 20,
        metadata: {
          inputType: 'elliptic-curve',
          outputType: 'group-element',
          complexity: 'O(log n)',
          parameters: { curve: 'secp256k1', field: 'prime' }
        }
      });

      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 200));
      
      completeComputation(id, {
        success: Math.random() > 0.05, // 95% success rate
        cacheHit: Math.random() > 0.5, // 50% cache hit rate
        metadata: {
          outputSize: Math.floor(Math.random() * 200) + 20,
          memoryUsage: Math.floor(Math.random() * 50) + 5
        }
      });
      operations++;
    }

    // Generate Cayley graph visualizations
    for (let i = 0; i < 4; i++) {
      const id = `cg-${Date.now()}-${i}`;
      startVisualization({
        id,
        type: 'cayley-graph',
        dataSize: Math.floor(Math.random() * 500) + 100,
        metadata: {
          renderer: 'three.js',
          dimensions: { width: 800, height: 600 },
          dataType: 'group-presentation'
        }
      });

      await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 300));
      
      completeVisualization(id, {
        success: Math.random() > 0.1, // 90% success rate
        cacheHit: Math.random() > 0.4, // 60% cache hit rate
        metadata: {
          renderTime: Math.floor(Math.random() * 1000) + 100,
          triangles: Math.floor(Math.random() * 10000) + 1000
        }
      });
      operations++;
    }

    // Generate persistence landscape visualizations
    for (let i = 0; i < 3; i++) {
      const id = `pl-${Date.now()}-${i}`;
      startVisualization({
        id,
        type: 'persistence-landscape',
        dataSize: Math.floor(Math.random() * 300) + 50,
        metadata: {
          renderer: 'd3.js',
          dimensions: { width: 600, height: 400 },
          dataType: 'persistence-diagram'
        }
      });

      await new Promise(resolve => setTimeout(resolve, Math.random() * 1200 + 200));
      
      completeVisualization(id, {
        success: Math.random() > 0.1, // 90% success rate
        cacheHit: Math.random() > 0.3, // 70% cache hit rate
        metadata: {
          renderTime: Math.floor(Math.random() * 800) + 100,
          dataPoints: Math.floor(Math.random() * 500) + 50
        }
      });
      operations++;
    }

    setGeneratedOperations(prev => prev + operations);
    setIsGeneratingData(false);
  };

  // Auto-generate operations every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isGeneratingData) {
        generateMockOperations();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isGeneratingData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 Caching Dashboard Test Page
          </h1>
          <p className="text-gray-600 mb-6">
            This page demonstrates the real-time caching dashboard by generating mock mathematical operations.
            Watch the dashboard update in real-time as operations are performed.
          </p>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Test Controls</h2>
                <p className="text-sm text-gray-600">
                  Generate mock mathematical operations to test the dashboard
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Operations</p>
                <p className="text-2xl font-bold text-blue-600">{generatedOperations}</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={generateMockOperations}
                disabled={isGeneratingData}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isGeneratingData
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isGeneratingData ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Generating...
                  </>
                ) : (
                  '🚀 Generate Mock Operations'
                )}
              </button>
              
              <div className="text-sm text-gray-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Auto-generating every 30 seconds
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-900">TDA Computations</p>
                <p className="text-blue-700">Vietoris-Rips algorithm with random point clouds</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="font-medium text-green-900">Elliptic Curves</p>
                <p className="text-green-700">Point addition on secp256k1 curve</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="font-medium text-purple-900">Visualizations</p>
                <p className="text-purple-700">Cayley graphs and persistence landscapes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Dashboard */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📊 Real-Time Caching Dashboard
          </h2>
          <CachePerformanceDashboard />
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Test</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Click "Generate Mock Operations" to create test data</li>
            <li>Watch the dashboard update in real-time (every 2 seconds)</li>
            <li>Navigate between dashboard tabs to see different metrics</li>
            <li>Operations will auto-generate every 30 seconds</li>
            <li>Try interacting with TDA Explorer or Cayley Graph tools</li>
          </ol>
          
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This demo uses simulated data. In production, the dashboard would show 
              real mathematical computations and cache operations from your actual tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
