'use client';

// React Hook for Tracking Mathematical Operations
// Automatically records operations in the real-time data connector

import { useEffect, useCallback, useRef } from 'react';
import { realTimeDataConnector } from '../real-time/RealTimeDataConnector';

export interface MathematicalOperation {
  id: string;
  algorithm: string;
  inputSize: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  cacheHit: boolean;
  metadata?: {
    inputType: string;
    outputType: string;
    complexity: string;
    parameters?: any;
  };
}

export interface VisualizationOperation {
  id: string;
  type: string;
  dataSize: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  cacheHit: boolean;
  metadata?: {
    renderer: string;
    dimensions: { width: number; height: number };
    dataType: string;
  };
}

export const useMathematicalTracking = () => {
  const operationsRef = useRef<Map<string, MathematicalOperation>>(new Map());
  const visualizationsRef = useRef<Map<string, VisualizationOperation>>(new Map());

  // Start tracking a mathematical computation
  const startComputation = useCallback((operation: Omit<MathematicalOperation, 'startTime' | 'success' | 'cacheHit'>) => {
    const id = operation.id;
    const computation: MathematicalOperation = {
      ...operation,
      startTime: performance.now(),
      success: false,
      cacheHit: false
    };

    operationsRef.current.set(id, computation);
    
    // Record in real-time connector
    realTimeDataConnector.recordOperation({
      operation: 'set',
      key: `computation:${id}`,
      duration: 0,
      success: true,
      metadata: {
        algorithm: operation.algorithm,
        inputSize: operation.inputSize,
        type: 'computation',
        status: 'started'
      }
    });

    return id;
  }, []);

  // Complete a mathematical computation
  const completeComputation = useCallback((id: string, result: { success: boolean; cacheHit: boolean; metadata?: any }) => {
    const operation = operationsRef.current.get(id);
    if (!operation) return;

    operation.endTime = performance.now();
    operation.duration = operation.endTime - operation.startTime;
    operation.success = result.success;
    operation.cacheHit = result.cacheHit;
    if (result.metadata) {
      operation.metadata = { ...operation.metadata, ...result.metadata };
    }

    // Record completion in real-time connector
    realTimeDataConnector.recordOperation({
      operation: 'get',
      key: `computation:${id}`,
      duration: operation.duration,
      success: result.success,
      metadata: {
        algorithm: operation.algorithm,
        inputSize: operation.inputSize,
        type: 'computation',
        status: 'completed',
        cacheHit: result.cacheHit,
        ...result.metadata
      }
    });

    // Clean up after a delay
    setTimeout(() => {
      operationsRef.current.delete(id);
    }, 60000); // Keep for 1 minute
  }, []);

  // Start tracking a visualization
  const startVisualization = useCallback((operation: Omit<VisualizationOperation, 'startTime' | 'success' | 'cacheHit'>) => {
    const id = operation.id;
    const visualization: VisualizationOperation = {
      ...operation,
      startTime: performance.now(),
      success: false,
      cacheHit: false
    };

    visualizationsRef.current.set(id, visualization);
    
    // Record in real-time connector
    realTimeDataConnector.recordOperation({
      operation: 'set',
      key: `viz:${id}`,
      duration: 0,
      success: true,
      metadata: {
        type: 'visualization',
        visualizationType: operation.type,
        dataSize: operation.dataSize,
        status: 'started'
      }
    });

    return id;
  }, []);

  // Complete a visualization
  const completeVisualization = useCallback((id: string, result: { success: boolean; cacheHit: boolean; metadata?: any }) => {
    const operation = visualizationsRef.current.get(id);
    if (!operation) return;

    operation.endTime = performance.now();
    operation.duration = operation.endTime - operation.startTime;
    operation.success = result.success;
    operation.cacheHit = result.cacheHit;
    if (result.metadata) {
      operation.metadata = { ...operation.metadata, ...result.metadata };
    }

    // Record completion in real-time connector
    realTimeDataConnector.recordOperation({
      operation: 'get',
      key: `viz:${id}`,
      duration: operation.duration,
      success: result.success,
      metadata: {
        type: 'visualization',
        visualizationType: operation.type,
        dataSize: operation.dataSize,
        status: 'completed',
        cacheHit: result.cacheHit,
        ...result.metadata
      }
    });

    // Clean up after a delay
    setTimeout(() => {
      visualizationsRef.current.delete(id);
    }, 60000); // Keep for 1 minute
  }, []);

  // Track cache operations
  const trackCacheOperation = useCallback((operation: 'get' | 'set' | 'update' | 'delete', key: string, duration: number, success: boolean, metadata?: any) => {
    realTimeDataConnector.recordOperation({
      operation,
      key,
      duration,
      success,
      metadata
    });
  }, []);

  // Get current operations
  const getCurrentOperations = useCallback(() => {
    return {
      computations: Array.from(operationsRef.current.values()),
      visualizations: Array.from(visualizationsRef.current.values())
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      operationsRef.current.clear();
      visualizationsRef.current.clear();
    };
  }, []);

  return {
    startComputation,
    completeComputation,
    startVisualization,
    completeVisualization,
    trackCacheOperation,
    getCurrentOperations
  };
};
