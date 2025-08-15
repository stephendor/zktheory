"use client";

import React from 'react';
import { usePerformanceMetrics } from '../../lib/performance';

const PerformanceMetrics: React.FC = () => {
  const { summary } = usePerformanceMetrics();

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    if (ms < 1) return '< 1ms';
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getMetricsByCategory = () => {
    const { byCategory } = summary;
    return Object.entries(byCategory).map(([category, count]) => ({
      category,
      count,
      color: getCategoryColor(category),
      icon: getCategoryIcon(category)
    }));
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'computation':
        return 'text-blue-400';
      case 'rendering':
        return 'text-green-400';
      case 'memory':
        return 'text-yellow-400';
      case 'interaction':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'computation':
        return '⚡';
      case 'rendering':
        return '🎨';
      case 'memory':
        return '💾';
      case 'interaction':
        return '🖱️';
      default:
        return '📊';
    }
  };

  const getPerformanceScore = (): number => {
    // Calculate a simple performance score based on metrics
    const totalMetrics = summary.total;
    if (totalMetrics === 0) return 100;

    const computationCount = summary.byCategory.computation || 0;
    const memoryCount = summary.byCategory.memory || 0;
    
    // Higher score for more computation metrics (indicating active monitoring)
    // Lower score for high memory usage
    let score = Math.min(100, (computationCount / totalMetrics) * 100);
    
    if (memoryCount > totalMetrics * 0.5) {
      score = Math.max(0, score - 20); // Penalize high memory usage
    }
    
    return Math.round(score);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreEmoji = (score: number): string => {
    if (score >= 80) return '🚀';
    if (score >= 60) return '✅';
    if (score >= 40) return '⚠️';
    return '❌';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-blue-300 mb-6">Real-time Metrics</h2>
      
      <div className="space-y-6">
        {/* Performance Score */}
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-4xl mb-2">
            {getScoreEmoji(getPerformanceScore())}
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(getPerformanceScore())}`}>
            {getPerformanceScore()}/100
          </div>
          <div className="text-sm text-gray-400">Performance Score</div>
        </div>

        {/* Metrics Summary */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Metrics Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Metrics:</span>
              <span className="text-white font-semibold">{summary.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Buffer Usage:</span>
              <span className="text-white font-semibold">
                {summary.total > 0 ? 'Active' : 'Empty'}
              </span>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {getMetricsByCategory().map(({ category, count, color, icon }) => (
              <div key={category} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{icon}</span>
                  <span className="text-gray-300 capitalize">{category}:</span>
                </div>
                <span className={`font-semibold ${color}`}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Component Activity */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Component Activity</h3>
          <div className="space-y-3">
            {Object.entries(summary.byComponent || {}).slice(0, 5).map(([component, count]) => (
              <div key={component} className="flex justify-between items-center">
                <span className="text-gray-300 text-sm truncate">{component}</span>
                <span className="text-white font-semibold text-sm">{count}</span>
              </div>
            ))}
            {Object.keys(summary.byComponent || {}).length === 0 && (
              <div className="text-gray-400 text-sm text-center py-2">
                No component data available
              </div>
            )}
          </div>
        </div>

        {/* System Info */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">System Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Platform:</span>
              <span className="text-gray-300">{navigator.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">User Agent:</span>
              <span className="text-gray-300 truncate max-w-32">
                {navigator.userAgent.split(' ')[0]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Memory:</span>
              <span className="text-gray-300">
                {(performance as any).memory ? 'Available' : 'Not Available'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
