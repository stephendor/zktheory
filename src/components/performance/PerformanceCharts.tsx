"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { usePerformanceMetrics } from '../../lib/performance';
import { ChartData } from '../../lib/performance/types';

// Lazy-loaded chart components to avoid SSR import side effects
type ChartComponents = {
  Line: any;
  Bar: any;
  Doughnut: any;
};

const PerformanceCharts: React.FC = () => {
  const { metrics } = usePerformanceMetrics();
  const [chartData, setChartData] = useState<ChartData>({
    computation: { labels: [], datasets: [] },
    memory: { labels: [], datasets: [] },
    performance: { labels: [], datasets: [] }
  });
  const [charts, setCharts] = useState<ChartComponents | null>(null);
  // Controls
  const [timeWindowMs, setTimeWindowMs] = useState<number>(5 * 60 * 1000); // default 5m
  const [smoothing, setSmoothing] = useState<number>(1); // moving avg window in buckets
  const [paused, setPaused] = useState<boolean>(false);
  const [hasMemoryAPI, setHasMemoryAPI] = useState<boolean>(true);

  // Load chart libraries only on client after mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Auto-register all necessary chart.js components
        await import('chart.js/auto');
        const mod = await import('react-chartjs-2');
        if (mounted) {
          setCharts({ Line: mod.Line, Bar: mod.Bar, Doughnut: mod.Doughnut });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Chart libraries failed to load', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Detect memory API availability (Chrome-only)
  useEffect(() => {
    try {
      const anyPerf: any = typeof performance !== 'undefined' ? (performance as any) : undefined;
      const supported = !!(anyPerf && anyPerf.memory && typeof anyPerf.memory.usedJSHeapSize === 'number');
      setHasMemoryAPI(supported);
    } catch {
      setHasMemoryAPI(false);
    }
  }, []);

  // Moving average smoothing helper
  const smooth = (arr: number[], windowSize: number): number[] => {
    if (windowSize <= 1) return arr;
    const result: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const slice = arr.slice(start, i + 1);
      const avg = slice.reduce((s, v) => s + v, 0) / slice.length;
      result.push(avg);
    }
    return result;
  };

  useEffect(() => {
    if (metrics.length === 0) return;

    // Transform metrics to chart data
    const transformMetricsToChartData = (): ChartData => {
      const now = Date.now();
      const timeWindow = timeWindowMs; // configurable window
      const recentMetrics = metrics.filter(m => now - m.timestamp < timeWindow);

      // Group metrics by category and time
      const computationData = new Map<number, number[]>();
      const memoryData = new Map<number, number[]>();
      const performanceData = new Map<string, number>();

      recentMetrics.forEach(metric => {
        const timeSlot = Math.floor(metric.timestamp / 10000) * 10000; // 10-second buckets

        if (metric.category === 'computation') {
          if (!computationData.has(timeSlot)) {
            computationData.set(timeSlot, []);
          }
          computationData.get(timeSlot)!.push(metric.value);
        } else if (metric.category === 'memory') {
          if (!memoryData.has(timeSlot)) {
            memoryData.set(timeSlot, []);
          }
          // Normalize to MB: accept bytes or MB
          const unit: any = (metric as any).unit;
          const memMB = unit === 'bytes' ? metric.value / (1024 * 1024) : metric.value;
          memoryData.get(timeSlot)!.push(memMB);
        } else if (metric.category === 'rendering') {
          // Map FPS to frame time (ms) for computation-like line chart
          if ((metric.id || '').includes('client_fps')) {
            const fps = metric.value;
            const frameTimeMs = fps > 0 ? 1000 / fps : 0;
            if (!computationData.has(timeSlot)) {
              computationData.set(timeSlot, []);
            }
            computationData.get(timeSlot)!.push(frameTimeMs);
          }
        }

        // Performance score calculation from multiple sources
        const component = (metric.id || 'client').split('_')[0];
        if (!performanceData.has(component)) performanceData.set(component, 0);
        let scoreUpdate: number | null = null;

        if (metric.category === 'computation') {
          // Lower is better
          scoreUpdate = Math.max(0, 1000 - metric.value) / 10; // 0-100
        } else if (metric.category === 'rendering') {
          if ((metric.id || '').includes('client_fps')) {
            // Higher FPS is better (60 -> 100)
            const fpsScore = Math.max(0, Math.min(100, (metric.value / 60) * 100));
            scoreUpdate = fpsScore;
          } else {
            // Render times (ms), lower is better
            scoreUpdate = Math.max(0, 100 - metric.value / 5);
          }
        } else if (metric.category === 'memory') {
          const unit: any = (metric as any).unit;
          const memMB = unit === 'bytes' ? metric.value / (1024 * 1024) : metric.value;
          // Lower memory is better; 0MB -> 100, +2MB reduces 1 point
          scoreUpdate = Math.max(0, 100 - memMB / 2);
        }

        if (scoreUpdate !== null) {
          performanceData.set(component, Math.max(performanceData.get(component)!, scoreUpdate));
        }
      });

      // Create chart data
      const timeLabels = Array.from(computationData.keys())
        .sort((a, b) => a - b)
        .map(t => new Date(t).toLocaleTimeString());

      const computationAverages = Array.from(computationData.values()).map(values => 
        values.reduce((sum, val) => sum + val, 0) / values.length
      );
      const computationSmoothed = smooth(computationAverages, smoothing);
      const computationDataset = {
        label: 'Computation Time (ms)',
        data: computationSmoothed,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      };

      const memoryLabels = Array.from(memoryData.keys())
        .sort((a, b) => a - b)
        .map(t => new Date(t).toLocaleTimeString());
      const memoryAverages = Array.from(memoryData.values()).map(values => 
        values.reduce((sum, val) => sum + val, 0) / values.length
      );
      const memorySmoothed = smooth(memoryAverages, smoothing);
      const memoryDataset = {
        label: 'Memory Usage (MB)',
        data: memorySmoothed,
        backgroundColor: ['rgba(59, 130, 246, 0.15)'],
        borderColor: 'rgb(59, 130, 246)',
        type: 'line' as const
      };

      const performanceDataset = {
        data: Array.from(performanceData.values()),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ]
      };

      // Threshold reference lines
      const computationThreshold = 200; // ms
      const memoryThreshold = 100; // MB
      const computationThresholdDataset = {
        label: 'Threshold (200ms)',
        data: new Array(timeLabels.length).fill(computationThreshold),
        borderColor: 'rgba(239, 68, 68, 0.9)',
        backgroundColor: 'rgba(239, 68, 68, 0)',
        fill: false as const,
        tension: 0,
        borderDash: [6, 6],
        type: 'line' as const
      };
      const memoryThresholdDataset = {
        label: 'Threshold (100MB)',
        data: new Array(memoryLabels.length).fill(memoryThreshold),
        borderColor: 'rgba(239, 68, 68, 0.9)',
        borderDash: [6, 6],
        type: 'line' as const,
        // satisfy typing for memory datasets backgroundColor
        backgroundColor: new Array(Math.max(1, memoryLabels.length)).fill('rgba(239, 68, 68, 0)')
      };

      return {
        computation: {
          labels: timeLabels,
          datasets: [computationDataset, computationThresholdDataset]
        },
        memory: {
          labels: memoryLabels,
          datasets: [memoryDataset as any, memoryThresholdDataset as any]
        },
        performance: {
          labels: Array.from(performanceData.keys()),
          datasets: [performanceDataset]
        }
      };
    };

    const newChartData = transformMetricsToChartData();
    if (!paused) {
      setChartData(newChartData);
    }
  }, [metrics, timeWindowMs, smoothing, paused]);

  const cmpSuggestedMax = useMemo(() => {
    const arr = (chartData.computation.datasets[0]?.data as number[]) || [];
    const maxVal = arr.length ? Math.max(...arr) : 100;
    return Math.max(200, Math.ceil(maxVal * 1.2));
  }, [chartData.computation]);
  const memSuggestedMax = useMemo(() => {
    const arr = (chartData.memory.datasets[0]?.data as number[]) || [];
    const maxVal = arr.length ? Math.max(...arr) : 50;
    return Math.max(100, Math.ceil(maxVal * 1.2));
  }, [chartData.memory]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'white'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'white'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: 'white'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        min: 0
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-blue-300 mb-4">Performance Charts</h2>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-300">Window:</span>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              className={`px-3 py-1 border border-gray-600 bg-gray-700 text-gray-200 rounded-l ${timeWindowMs===60_000?'bg-indigo-600 text-white':''}`}
              onClick={() => setTimeWindowMs(60_000)}
            >1m</button>
            <button
              className={`px-3 py-1 border-t border-b border-gray-600 bg-gray-700 text-gray-200 ${timeWindowMs===300_000?'bg-indigo-600 text-white':''}`}
              onClick={() => setTimeWindowMs(300_000)}
            >5m</button>
            <button
              className={`px-3 py-1 border border-gray-600 bg-gray-700 text-gray-200 rounded-r ${timeWindowMs===900_000?'bg-indigo-600 text-white':''}`}
              onClick={() => setTimeWindowMs(900_000)}
            >15m</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-300">Smoothing:</span>
          <select
            value={smoothing}
            onChange={(e) => setSmoothing(parseInt(e.target.value, 10))}
            aria-label="Smoothing level"
            className="px-2 py-1 bg-gray-700 border border-gray-600 text-gray-200 rounded"
          >
            <option value={1}>Off</option>
            <option value={3}>x3</option>
            <option value={5}>x5</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused(p => !p)}
            className={`px-3 py-1 border border-gray-600 rounded ${paused ? 'bg-yellow-600 text-black' : 'bg-gray-700 text-gray-200'}`}
          >{paused ? 'Resume' : 'Pause'}</button>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Computation Time Chart */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Computation Performance</h3>
          <div className="h-64">
            {charts && chartData.computation.datasets.length > 0 && chartData.computation.labels.length > 0 ? (
              <charts.Line 
                data={chartData.computation as any} 
                options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    y: { ...(chartOptions as any).scales.y, suggestedMax: cmpSuggestedMax }
                  }
                } as any}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                {charts ? 'No computation data available' : 'Loading charts…'}
              </div>
            )}
          </div>
        </div>

        {/* Memory Usage Chart */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Memory Usage</h3>
          <div className="h-64">
            {charts && chartData.memory.datasets.length > 0 && chartData.memory.labels.length > 0 ? (
              <charts.Line 
                data={chartData.memory as any} 
                options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    y: { ...(chartOptions as any).scales.y, suggestedMax: memSuggestedMax }
                  }
                } as any}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                {charts ? 'No memory data available' : 'Loading charts…'}
              </div>
            )}
          </div>
          {!hasMemoryAPI && (
            <div className="mt-2 text-xs text-yellow-300">
              Memory metrics require Chrome (performance.memory).
            </div>
          )}
        </div>

        {/* Performance Score Chart */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Component Performance Score</h3>
          <div className="h-64">
            {charts && chartData.performance.datasets.length > 0 && chartData.performance.labels.length > 0 ? (
              <charts.Doughnut data={chartData.performance as any} options={chartOptions as any} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                {charts ? 'No performance data available' : 'Loading charts…'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts;
