"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { performanceMetrics } from './PerformanceMetrics';
import { PerformanceMetric } from './types';

// Safe environment detection for client-side
const getNodeEnv = (): string => {
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
    return process.env.NODE_ENV;
  }
  return 'production';
};

export const usePerformanceMonitor = (componentId: string, category: string) => {
  const startTimer = useCallback(() => {
    return performanceMetrics.startTimer(componentId, category);
  }, [componentId, category]);

  return { startTimer };
};

export const usePerformanceMetrics = (
  category?: string,
  timeRange?: { start: number; end: number },
  updateInterval: number = 1000
) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [summary, setSummary] = useState(performanceMetrics.getMetricsSummary());
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const updateMetrics = () => {
      const newMetrics = performanceMetrics.getMetrics(category, timeRange);
      const newSummary = performanceMetrics.getMetricsSummary();
      setMetrics(newMetrics);
      setSummary(newSummary);
    };

    // Initial update
    updateMetrics();

    // Set up interval for updates
    if (updateInterval > 0) {
      intervalRef.current = setInterval(updateMetrics, updateInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [category, timeRange, updateInterval]);

  return { metrics, summary };
};

export const usePerformanceToggle = () => {
  const [isEnabled, setIsEnabled] = useState(() => {
    // Safe environment detection for client-side
    return getNodeEnv() === 'development';
  });

  useEffect(() => {
    if (isEnabled) {
      performanceMetrics.enable();
    } else {
      performanceMetrics.disable();
    }
  }, [isEnabled]);

  const toggle = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  return { isEnabled, toggle };
};

export const useMemoryTracking = (componentId: string, trackInterval: number = 5000) => {
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const trackMemory = () => {
      performanceMetrics.trackMemoryUsage(componentId);
    };

    // Initial tracking
    trackMemory();

    // Set up interval for memory tracking
    if (trackInterval > 0) {
      intervalRef.current = setInterval(trackMemory, trackInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [componentId, trackInterval]);

  return { trackMemory: () => performanceMetrics.trackMemoryUsage(componentId) };
};

export const usePerformanceOptimization = (componentId: string) => {
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const analyzePerformance = () => {
      const componentMetrics = performanceMetrics.getMetricsByComponent(componentId);
      const suggestions: string[] = [];

      if (componentMetrics.length === 0) return;

      // Analyze computation performance
      const computationMetrics = componentMetrics.filter(m => m.category === 'computation');
      if (computationMetrics.length > 0) {
        const avgTime = computationMetrics.reduce((sum, m) => sum + m.value, 0) / computationMetrics.length;
        const maxTime = Math.max(...computationMetrics.map(m => m.value));
        
        if (avgTime > 100) {
          suggestions.push('Consider implementing computation caching for repeated operations');
        }
        if (maxTime > 500) {
          suggestions.push('Some operations are taking >500ms - investigate optimization opportunities');
        }
      }

      // Analyze memory usage
      const memoryMetrics = componentMetrics.filter(m => m.category === 'memory');
      if (memoryMetrics.length > 0) {
        const latestMemory = memoryMetrics[memoryMetrics.length - 1];
        if (latestMemory.value > 50 * 1024 * 1024) { // 50MB
          suggestions.push('Memory usage is high - consider implementing cleanup strategies');
        }
      }

      setOptimizationSuggestions(suggestions);
    };

    // Analyze every 10 seconds
    const interval = setInterval(analyzePerformance, 10000);
    analyzePerformance(); // Initial analysis

    return () => clearInterval(interval);
  }, [componentId]);

  return { optimizationSuggestions };
};

export const useWASMPerformance = (operationName: string, componentId: string = 'wasm') => {
  const [operationMetrics, setOperationMetrics] = useState<PerformanceMetric[]>([]);
  const [averageTime, setAverageTime] = useState<number>(0);

  useEffect(() => {
    const updateMetrics = () => {
      const metrics = performanceMetrics.getMetricsByComponent(componentId);
      const operationMetrics = metrics.filter(m => m.id.includes(operationName));
      
      setOperationMetrics(operationMetrics);
      
      if (operationMetrics.length > 0) {
        const avgTime = operationMetrics.reduce((sum, m) => sum + m.value, 0) / operationMetrics.length;
        setAverageTime(avgTime);
      }
    };

    // Update every second
    const interval = setInterval(updateMetrics, 1000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, [operationName, componentId]);

  const wrapWASMFunction = useCallback(<T extends any[], R>(
    fn: (...args: T) => R
  ): ((...args: T) => R) => {
    return performanceMetrics.withPerformanceMonitoring(fn, operationName, componentId);
  }, [operationName, componentId]);

  return {
    operationMetrics,
    averageTime,
    wrapWASMFunction
  };
};
