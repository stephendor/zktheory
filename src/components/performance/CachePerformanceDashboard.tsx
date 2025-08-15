// Cache Performance Dashboard Component
// Displays comprehensive caching performance metrics and controls

import React, { useState, useEffect } from 'react';
import { realTimeDataConnector, RealTimeCacheData } from '../../lib/caching/real-time/RealTimeDataConnector';

interface CacheDashboardState {
  data: RealTimeCacheData | null;
  isConnected: boolean;
  isRefreshing: boolean;
  lastUpdate: Date;
}

export const CachePerformanceDashboard: React.FC = () => {
  const [state, setState] = useState<CacheDashboardState>({
    data: null,
    isConnected: false,
    isRefreshing: false,
    lastUpdate: new Date()
  });

  const [selectedTab, setSelectedTab] = useState<'overview' | 'performance' | 'warming' | 'compression' | 'controls'>('overview');

  useEffect(() => {
    // Connect to real-time data
    const connectToData = async () => {
      try {
        console.log('🔌 Dashboard connecting to real-time data...');
        await realTimeDataConnector.connect();
        console.log('✅ Dashboard connected to real-time data');
        setState(prev => ({ ...prev, isConnected: true }));
      } catch (error) {
        console.error('❌ Dashboard failed to connect to real-time data:', error);
      }
    };

    connectToData();
    
    // Subscribe to real-time updates
    const unsubscribe = realTimeDataConnector.subscribe((data) => {
      console.log('📊 Dashboard received real-time data:', data);
      setState(prev => ({
        ...prev,
        data,
        lastUpdate: new Date()
      }));
    });
    
    return () => {
      unsubscribe();
      realTimeDataConnector.disconnect();
    };
  }, []);

  const refreshData = async () => {
    setState(prev => ({ ...prev, isRefreshing: true }));
    
    try {
      // Force a data refresh from the real-time connector
      await realTimeDataConnector.connect();
    } catch (error) {
      console.error('❌ Failed to refresh cache data:', error);
    } finally {
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  };

  const handleCacheClear = async () => {
    if (confirm('Are you sure you want to clear all cache? This will remove all cached mathematical computations and visualizations.')) {
      try {
        // This would clear the actual cache in a real implementation
        // For now, just refresh the data
        await refreshData();
        alert('Cache cleared successfully (demo mode)');
      } catch (error) {
        console.error('❌ Failed to clear cache:', error);
        alert('Failed to clear cache');
      }
    }
  };

  const handleWarmingStart = async () => {
    try {
      // This would start actual cache warming in a real implementation
      // For now, just refresh the data
      await refreshData();
      alert('Cache warming started (demo mode)');
    } catch (error) {
      console.error('❌ Failed to start warming:', error);
      alert('Failed to start cache warming');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value: number): string => {
    return (value * 100).toFixed(1) + '%';
  };

  const formatLatency = (ms: number): string => {
    if (ms < 1) return (ms * 1000).toFixed(2) + 'μs';
    if (ms < 1000) return ms.toFixed(2) + 'ms';
    return (ms / 1000).toFixed(2) + 's';
  };

  if (!state.data || !state.isConnected) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {!state.isConnected ? 'Connecting to caching system...' : 'Loading cache performance data...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cache Performance Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring of mathematical caching system</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={refreshData}
            disabled={state.isRefreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {state.isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <span className="text-sm text-gray-500">
            Last update: {state.lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'performance', label: 'Performance', icon: '⚡' },
            { id: 'warming', label: 'Cache Warming', icon: '🔥' },
            { id: 'compression', icon: '🗜️', label: 'Compression' },
            { id: 'controls', label: 'Controls', icon: '🎛️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cache Hit Rate */}
            <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm opacity-90">Hit Rate</p>
                  <p className="text-2xl font-bold">
                    {formatPercentage(state.data.performanceMetrics.hitRate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Cache Latency */}
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm opacity-90">Avg Latency</p>
                  <p className="text-2xl font-bold">
                    {formatLatency(state.data.performanceMetrics.averageLatency)}
                  </p>
                </div>
              </div>
            </div>

            {/* Storage Efficiency */}
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <span className="text-2xl">💾</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm opacity-90">Storage Efficiency</p>
                  <p className="text-2xl font-bold">
                    {formatPercentage(state.data.cacheStats.storageEfficiency)}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Entries */}
            <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg p-6 text-white">
              <div className="flex items-center">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm opacity-90">Total Entries</p>
                  <p className="text-2xl font-bold">
                    {state.data.cacheStats.totalEntries}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'performance' && (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Hit Rate</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatPercentage(state.data.performanceMetrics.hitRate)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Miss Rate</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatPercentage(state.data.performanceMetrics.missRate)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Avg Latency</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatLatency(state.data.performanceMetrics.averageLatency)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Storage Efficiency</p>
                  <p className="text-xl font-bold text-purple-600">
                    {formatPercentage(state.data.performanceMetrics.storageEfficiency)}
                  </p>
                </div>
              </div>
            </div>

            {/* Cache Layer Stats */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Cache Layer Performance</h3>
              <div className="space-y-4">
                {Object.entries(state.data.layerStats).map(([layer, stats]: [string, any]) => (
                  <div key={layer} className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{layer}</p>
                      <p className="text-sm text-gray-600">
                        {stats.entries} entries, {formatBytes(stats.size)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPercentage(stats.hitRate)}</p>
                      <p className="text-sm text-gray-600">{formatLatency(stats.averageLatency)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'warming' && (
          <div className="space-y-6">
            {/* Warming Status */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Cache Warming Status</h3>
                <button
                  onClick={handleWarmingStart}
                  disabled={state.data?.warmingStatus?.isWarming}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  {state.data?.warmingStatus?.isWarming ? 'Warming...' : 'Start Warming'}
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`text-lg font-bold ${state.data.warmingStatus.isWarming ? 'text-orange-600' : 'text-green-600'}`}>
                    {state.data.warmingStatus.isWarming ? 'Active' : 'Idle'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Effectiveness</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatPercentage(state.data.performanceMetrics.warmingEffectiveness)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Predictions</p>
                  <p className="text-lg font-bold text-purple-600">
                    {state.data.warmingStatus.currentSession?.predictions || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Warmed Keys</p>
                  <p className="text-lg font-bold text-green-600">
                    {state.data.warmingStatus.currentSession?.warmedKeys || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Warming History */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Warming History</h3>
              <div className="space-y-3">
                {state.data.warmingStatus.lastWarmingSession ? (
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Session {state.data.warmingStatus.lastWarmingSession.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">
                          {state.data.warmingStatus.lastWarmingSession.startTime.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Success Rate</p>
                        <p className="font-medium text-green-600">
                          {formatPercentage(state.data.warmingStatus.lastWarmingSession.successRate)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {state.data.warmingStatus.lastWarmingSession.keysWarmed} keys warmed, 
                      {formatLatency(state.data.warmingStatus.lastWarmingSession.endTime.getTime() - state.data.warmingStatus.lastWarmingSession.startTime.getTime())} duration
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-4 text-center text-gray-500">
                    No warming sessions yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'compression' && (
          <div className="space-y-6">
            {/* Compression Stats */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Data Compression</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Algorithm</p>
                  <p className="text-lg font-bold text-blue-600">gzip</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Avg Ratio</p>
                  <p className="text-lg font-bold text-green-600">75%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Threshold</p>
                  <p className="text-lg font-bold text-purple-600">1KB</p>
                </div>
              </div>
            </div>

            {/* Mathematical Data Optimization */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Mathematical Data Optimization</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <p className="font-medium">Point Cloud Optimization</p>
                  <p className="text-sm text-gray-600">
                    Removes duplicate points, sorts for better compression
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="font-medium">Matrix Optimization</p>
                  <p className="text-sm text-gray-600">
                    Converts sparse matrices to efficient format
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="font-medium">Graph Data Optimization</p>
                  <p className="text-sm text-gray-600">
                    Sorts nodes and edges for better compression
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'controls' && (
          <div className="space-y-6">
            {/* Cache Management */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Cache Management</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Clear All Cache</p>
                    <p className="text-sm text-gray-600">
                      Remove all cached computations and visualizations
                    </p>
                  </div>
                  <button
                    onClick={handleCacheClear}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Clear Cache
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Clear Expired Cache</p>
                    <p className="text-sm text-gray-600">
                      Remove expired cache entries automatically
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      // This would clear expired cache in a real implementation
                      // For now, just refresh the data
                      await refreshData();
                      alert('Expired cache cleared (demo mode)');
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Clear Expired
                  </button>
                </div>
              </div>
            </div>

            {/* Service Worker Controls */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Service Worker</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Status</p>
                    <p className="text-sm text-gray-600">
                      {state.data.serviceWorkerStatus.isRegistered ? 'Registered' : 'Not Registered'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    state.data.serviceWorkerStatus.isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {state.data.serviceWorkerStatus.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Update Service Worker</p>
                    <p className="text-sm text-gray-600">
                      Check for and install updates
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      // This would update the service worker in a real implementation
                      // For now, just refresh the data
                      await refreshData();
                      alert('Service Worker updated (demo mode)');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

