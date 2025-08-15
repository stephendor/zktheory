"use client";

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { usePerformanceMetrics } from '../../lib/performance';
import { ChartData } from '../../lib/performance/types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PerformanceCharts: React.FC = () => {
  const { metrics } = usePerformanceMetrics();
  const [chartData, setChartData] = useState<ChartData>({
    computation: { labels: [], datasets: [] },
    memory: { labels: [], datasets: [] },
    performance: { labels: [], datasets: [] }
  });

  useEffect(() => {
    if (metrics.length === 0) return;

    // Transform metrics to chart data
    const transformMetricsToChartData = (): ChartData => {
      const now = Date.now();
      const timeWindow = 5 * 60 * 1000; // 5 minutes
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
          memoryData.get(timeSlot)!.push(metric.value);
        }

        // Performance score calculation (inverse of computation time)
        const component = metric.id.split('_')[0];
        if (!performanceData.has(component)) {
          performanceData.set(component, 0);
        }
        if (metric.category === 'computation') {
          const score = Math.max(0, 1000 - metric.value) / 10; // Convert to 0-100 scale
          performanceData.set(component, Math.max(performanceData.get(component)!, score));
        }
      });

      // Create chart data
      const timeLabels = Array.from(computationData.keys())
        .sort((a, b) => a - b)
        .map(t => new Date(t).toLocaleTimeString());

      const computationDataset = {
        label: 'Computation Time (ms)',
        data: Array.from(computationData.values()).map(values => 
          values.reduce((sum, val) => sum + val, 0) / values.length
        ),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      };

      const memoryDataset = {
        label: 'Memory Usage (MB)',
        data: Array.from(memoryData.values()).map(values => 
          values.reduce((sum, val) => sum + val, 0) / values.length / (1024 * 1024)
        ),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ]
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

      return {
        computation: {
          labels: timeLabels,
          datasets: [computationDataset]
        },
        memory: {
          labels: Array.from(memoryData.keys())
            .sort((a, b) => a - b)
            .map(t => new Date(t).toLocaleTimeString()),
          datasets: [memoryDataset]
        },
        performance: {
          labels: Array.from(performanceData.keys()),
          datasets: [performanceDataset]
        }
      };
    };

    const newChartData = transformMetricsToChartData();
    setChartData(newChartData);
  }, [metrics]);

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
        }
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-blue-300 mb-6">Performance Charts</h2>
      
      <div className="space-y-6">
        {/* Computation Time Chart */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Computation Performance</h3>
          <div className="h-64">
            {chartData.computation.datasets.length > 0 && chartData.computation.labels.length > 0 ? (
              <Line data={chartData.computation} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No computation data available
              </div>
            )}
          </div>
        </div>

        {/* Memory Usage Chart */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Memory Usage</h3>
          <div className="h-64">
            {chartData.memory.datasets.length > 0 && chartData.memory.labels.length > 0 ? (
              <Bar data={chartData.memory} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No memory data available
              </div>
            )}
          </div>
        </div>

        {/* Performance Score Chart */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Component Performance Score</h3>
          <div className="h-64">
            {chartData.performance.datasets.length > 0 && chartData.performance.labels.length > 0 ? (
              <Doughnut data={chartData.performance} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No performance data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts;
