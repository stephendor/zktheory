"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePerformanceMetrics } from '../../lib/performance';
import { Alert } from '../../lib/performance/types';

const PerformanceAlerts: React.FC = () => {
  const { metrics } = usePerformanceMetrics();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showResolved, setShowResolved] = useState(false);
  const [muted, setMuted] = useState(false);
  const [windowMs, setWindowMs] = useState<number>(5 * 60 * 1000); // default 5m
  const [maxAlerts, setMaxAlerts] = useState<number>(50);
  const lastEmittedRef = useRef<Map<string, number>>(new Map());
  const ANOMALY_COOLDOWN_MS = 45000; // 45 seconds per metric-id

  // Persist controls to localStorage and hydrate on mount
  useEffect(() => {
    try {
      const lsMuted = localStorage.getItem('perfAlerts.muted');
      const lsWindow = localStorage.getItem('perfAlerts.windowMs');
      const lsMax = localStorage.getItem('perfAlerts.maxAlerts');
      if (lsMuted !== null) setMuted(lsMuted === '1');
      if (lsWindow !== null) {
        const v = parseInt(lsWindow, 10);
        if (!Number.isNaN(v)) setWindowMs(v);
      }
      if (lsMax !== null) {
        const v = parseInt(lsMax, 10);
        if (!Number.isNaN(v)) setMaxAlerts(v);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('perfAlerts.muted', muted ? '1' : '0'); } catch {}
  }, [muted]);
  useEffect(() => {
    try { localStorage.setItem('perfAlerts.windowMs', String(windowMs)); } catch {}
  }, [windowMs]);
  useEffect(() => {
    try { localStorage.setItem('perfAlerts.maxAlerts', String(maxAlerts)); } catch {}
  }, [maxAlerts]);

  useEffect(() => {
    if (metrics.length === 0 || muted) return;

    const generateAlerts = (): Alert[] => {
      const newAlerts: Alert[] = [];
      const now = Date.now();
      const timeWindow = windowMs; // configurable window
      const recentMetrics = metrics.filter(m => now - m.timestamp < timeWindow);

      // Check for performance issues
      const computationMetrics = recentMetrics.filter(m => m.category === 'computation');
      if (computationMetrics.length > 0) {
        const avgTime = computationMetrics.reduce((sum, m) => sum + m.value, 0) / computationMetrics.length;
        const maxTime = Math.max(...computationMetrics.map(m => m.value));

        if (avgTime > 200) {
          newAlerts.push({
            id: `slow_computation_${now}`,
            timestamp: now,
            type: 'warning',
            priority: 'medium',
            message: `Average computation time is ${avgTime.toFixed(2)}ms - consider optimization`,
            metricId: 'computation_avg',
            metadata: { averageTime: avgTime, maxTime }
          });
        }

        if (maxTime > 1000) {
          newAlerts.push({
            id: `very_slow_computation_${now}`,
            timestamp: now,
            type: 'threshold',
            priority: 'high',
            message: `Some computations are taking >1s - investigate bottlenecks`,
            metricId: 'computation_max',
            metadata: { maxTime }
          });
        }
      }

      // Check for memory issues
      const memoryMetrics = recentMetrics.filter(m => m.category === 'memory');
      if (memoryMetrics.length > 0) {
        const latestMemory = memoryMetrics[memoryMetrics.length - 1];
        const memoryMB = latestMemory.value / (1024 * 1024);

        if (memoryMB > 100) {
          newAlerts.push({
            id: `high_memory_${now}`,
            timestamp: now,
            type: 'threshold',
            priority: 'high',
            message: `Memory usage is ${memoryMB.toFixed(2)}MB - consider cleanup`,
            metricId: 'memory_usage',
            metadata: { memoryMB }
          });
        }
      }

      // Check for rendering issues
      const renderingMetrics = recentMetrics.filter(m => m.category === 'rendering');
      if (renderingMetrics.length > 0) {
        const avgRenderingTime = renderingMetrics.reduce((sum, m) => sum + m.value, 0) / renderingMetrics.length;
        
        if (avgRenderingTime > 16.67) { // 60 FPS threshold
          newAlerts.push({
            id: `slow_rendering_${now}`,
            timestamp: now,
            type: 'warning',
            priority: 'medium',
            message: `Rendering time ${avgRenderingTime.toFixed(2)}ms - below 60 FPS target`,
            metricId: 'rendering_avg',
            metadata: { avgRenderingTime }
          });
        }
      }

      // Check for anomalies (sudden spikes)
      const allMetrics = recentMetrics.filter(m => m.category === 'computation' || m.category === 'rendering');
      if (allMetrics.length > 10) {
        const values = allMetrics.map(m => m.value);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        allMetrics.forEach(metric => {
          if (Math.abs(metric.value - mean) > stdDev * 2) { // 2 standard deviations
            const key = `anomaly:${metric.id}`;
            const last = lastEmittedRef.current.get(key) || 0;
            if (now - last >= ANOMALY_COOLDOWN_MS) {
              newAlerts.push({
                id: `anomaly_${metric.id}_${now}`,
                timestamp: now,
                type: 'anomaly',
                priority: 'medium',
                message: `Performance anomaly detected: ${metric.value.toFixed(2)}ms (expected ~${mean.toFixed(2)}ms)`,
                metricId: metric.id,
                metadata: { 
                  actualValue: metric.value, 
                  expectedValue: mean, 
                  category: metric.category 
                }
              });
              lastEmittedRef.current.set(key, now);
            }
          }
        });
      }

      return newAlerts;
    };

    const newAlerts = generateAlerts();
    setAlerts(prevAlerts => {
      // Drop expired alerts outside the window unless resolved
      const cutoff = Date.now() - windowMs;
      const activeWithinWindow = prevAlerts.filter(a => (a as any).resolved || a.timestamp >= cutoff);
      // Merge new alerts with existing ones, avoiding duplicates
      const existingIds = new Set(activeWithinWindow.map(a => a.id));
      const uniqueNewAlerts = newAlerts.filter(a => !existingIds.has(a.id));
      const merged = [...activeWithinWindow, ...uniqueNewAlerts];
      // Constrain list to maxAlerts (keep most recent)
      const sorted = merged.sort((a, b) => a.timestamp - b.timestamp);
      const capped = sorted.slice(Math.max(0, sorted.length - maxAlerts));
      return capped;
    });
  }, [metrics, muted, windowMs, maxAlerts]);

  const resolveAlert = (alertId: string) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, resolved: true, resolvedAt: Date.now() }
          : alert
      )
    );
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-900/20';
      case 'high':
        return 'border-orange-500 bg-orange-900/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-900/20';
      case 'low':
        return 'border-blue-500 bg-blue-900/20';
      default:
        return 'border-gray-500 bg-gray-900/20';
    }
  };

  const getPriorityIcon = (priority: string): string => {
    switch (priority) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return 'ℹ️';
      default:
        return '📊';
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'threshold':
        return 'text-red-400';
      case 'anomaly':
        return 'text-yellow-400';
      case 'warning':
        return 'text-orange-400';
      default:
        return 'text-blue-400';
    }
  };

  const filteredAlerts = showResolved 
    ? alerts 
    : alerts.filter(alert => !(alert as any).resolved);

  const activeAlerts = alerts.filter(alert => !(alert as any).resolved);
  const criticalAlerts = activeAlerts.filter(alert => alert.priority === 'critical');

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-blue-300">Performance Alerts</h2>
        <div className="flex items-center space-x-2">
          {criticalAlerts.length > 0 && (
            <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
              {criticalAlerts.length} Critical
            </div>
          )}
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {showResolved ? 'Hide Resolved' : 'Show Resolved'}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMuted(m => !m)}
            className={`px-3 py-1 border border-gray-600 rounded ${muted ? 'bg-yellow-600 text-black' : 'bg-gray-700 text-gray-200'}`}
          >{muted ? 'Enable Alerts' : 'Mute Alerts'}</button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-300">Window:</span>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              className={`px-3 py-1 border border-gray-600 bg-gray-700 text-gray-200 rounded-l ${windowMs===60_000?'bg-indigo-600 text-white':''}`}
              onClick={() => setWindowMs(60_000)}
            >1m</button>
            <button
              className={`px-3 py-1 border-t border-b border-gray-600 bg-gray-700 text-gray-200 ${windowMs===300_000?'bg-indigo-600 text-white':''}`}
              onClick={() => setWindowMs(300_000)}
            >5m</button>
            <button
              className={`px-3 py-1 border border-gray-600 bg-gray-700 text-gray-200 rounded-r ${windowMs===900_000?'bg-indigo-600 text-white':''}`}
              onClick={() => setWindowMs(900_000)}
            >15m</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="maxAlerts" className="text-gray-300">Max:</label>
          <select
            id="maxAlerts"
            value={maxAlerts}
            onChange={(e) => setMaxAlerts(parseInt(e.target.value, 10))}
            className="px-2 py-1 bg-gray-700 border border-gray-600 text-gray-200 rounded"
            aria-label="Maximum alerts to keep"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        {!muted && (
          <button
            onClick={() => setAlerts([])}
            className="px-3 py-1 border border-gray-600 bg-gray-700 text-gray-200 rounded"
          >Clear</button>
        )}
      </div>

      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">✅</div>
            <div>No performance alerts</div>
            <div className="text-sm">System is running smoothly</div>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(alert.priority)} ${
                (alert as any).resolved ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">{getPriorityIcon(alert.priority)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-sm font-medium ${getTypeColor(alert.type)}`}>
                        {alert.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-white text-sm">{alert.message}</p>
                    {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-gray-400">
                        {Object.entries(alert.metadata).map(([key, value]) => (
                          <span key={key} className="mr-3">
                            {key}: {typeof value === 'number' ? value.toFixed(2) : String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {!(alert as any).resolved && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    ✓ Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alert Summary */}
      {alerts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-white font-semibold">{activeAlerts.length}</div>
              <div className="text-gray-400">Active</div>
            </div>
            <div>
              <div className="text-white font-semibold">{criticalAlerts.length}</div>
              <div className="text-gray-400">Critical</div>
            </div>
            <div>
              <div className="text-white font-semibold">
                {alerts.filter(a => (a as any).resolved).length}
              </div>
              <div className="text-gray-400">Resolved</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceAlerts;
