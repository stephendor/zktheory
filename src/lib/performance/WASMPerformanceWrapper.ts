/**
 * WASM Performance Wrapper
 * Specialized performance monitoring for WebAssembly mathematical computations
 * Handles TDA Rust core operations and other WASM-based mathematical functions
 */

import { mathematicalPerformanceMonitor, type MathematicalOperation } from './MathematicalPerformanceMonitor';

export interface WASMOperationContext {
  operation: string;
  wasmModule: string;
  functionName: string;
  inputSize: number;
  expectedComplexity: 'O(1)' | 'O(n)' | 'O(n²)' | 'O(n³)' | 'O(2^n)' | 'unknown';
  inputData?: any;
  validationFn?: (result: any) => number; // Accuracy validation
}

export interface WASMPerformanceMetrics {
  executionTime: number;
  memoryIncrease: number;
  wasmHeapSize?: number;
  jsHeapSize?: number;
  accuracy?: number;
  inputComplexity: number;
}

export class WASMPerformanceWrapper {
  private static instance: WASMPerformanceWrapper;
  private wasmModules: Map<string, any> = new Map();
  private performanceCache: Map<string, WASMPerformanceMetrics[]> = new Map();

  private constructor() {}

  static getInstance(): WASMPerformanceWrapper {
    if (!WASMPerformanceWrapper.instance) {
      WASMPerformanceWrapper.instance = new WASMPerformanceWrapper();
    }
    return WASMPerformanceWrapper.instance;
  }

  /**
   * Register a WASM module for performance monitoring
   */
  registerWASMModule(name: string, module: any): void {
    this.wasmModules.set(name, module);
  }

  /**
   * Wrap a WASM function call with performance monitoring
   */
  async wrapWASMOperation<T>(
    context: WASMOperationContext,
    wasmFunction: () => Promise<T> | T,
    options?: {
      environment?: 'development' | 'testing' | 'production';
      trackMemory?: boolean;
      cacheResults?: boolean;
    }
  ): Promise<T> {
    const operation: MathematicalOperation = {
      operation: `wasm_${context.operation}`,
      category: this.categorizeWASMOperation(context.operation),
      complexity: context.expectedComplexity,
      inputSize: context.inputSize,
      expectedTimeMs: this.estimateExecutionTime(context),
      maxAllowedTimeMs: this.getMaxAllowedTime(context)
    };

    return await mathematicalPerformanceMonitor.monitorMathematicalOperation(
      operation,
      async () => {
        const startMemory = options?.trackMemory ? this.getWASMMemoryUsage() : undefined;
        
        try {
          const result = await wasmFunction();
          
          // Store performance metrics in cache if requested
          if (options?.cacheResults) {
            this.cachePerformanceMetrics(context, startMemory);
          }
          
          return result;
        } catch (error) {
          console.error(`WASM operation ${context.operation} failed:`, error);
          throw error;
        }
      },
      {
        environment: options?.environment,
        trackMemory: options?.trackMemory,
        validateResult: context.validationFn
      }
    );
  }

  /**
   * Wrap synchronous WASM function calls
   */
  wrapSyncWASMOperation<T>(
    context: WASMOperationContext,
    wasmFunction: () => T,
    options?: {
      environment?: 'development' | 'testing' | 'production';
      trackMemory?: boolean;
      cacheResults?: boolean;
    }
  ): T {
    const operation: MathematicalOperation = {
      operation: `wasm_${context.operation}`,
      category: this.categorizeWASMOperation(context.operation),
      complexity: context.expectedComplexity,
      inputSize: context.inputSize,
      expectedTimeMs: this.estimateExecutionTime(context),
      maxAllowedTimeMs: this.getMaxAllowedTime(context)
    };

    return mathematicalPerformanceMonitor.monitorSyncMathematicalOperation(
      operation,
      () => {
        const startMemory = options?.trackMemory ? this.getWASMMemoryUsage() : undefined;
        
        try {
          const result = wasmFunction();
          
          // Store performance metrics in cache if requested
          if (options?.cacheResults) {
            this.cachePerformanceMetrics(context, startMemory);
          }
          
          return result;
        } catch (error) {
          console.error(`WASM operation ${context.operation} failed:`, error);
          throw error;
        }
      },
      {
        environment: options?.environment,
        trackMemory: options?.trackMemory,
        validateResult: context.validationFn
      }
    );
  }

  /**
   * Specific wrapper for TDA Rust core operations
   */
  async wrapTDAOperation<T>(
    operationName: string,
    inputData: any,
    wasmFunction: () => Promise<T> | T,
    options?: {
      validateTopology?: boolean;
      expectedBetti?: number[];
      environment?: 'development' | 'testing' | 'production';
    }
  ): Promise<T> {
    const inputSize = this.calculateTDAInputSize(inputData);
    
    const context: WASMOperationContext = {
      operation: `tda_${operationName}`,
      wasmModule: 'tda_rust_core',
      functionName: operationName,
      inputSize,
      expectedComplexity: this.getTDAComplexity(operationName, inputSize),
      inputData,
      validationFn: options?.validateTopology ? this.createTDAValidator(options.expectedBetti) : undefined
    };

    return await this.wrapWASMOperation(context, wasmFunction, {
      environment: options?.environment,
      trackMemory: true,
      cacheResults: true
    });
  }

  /**
   * Specific wrapper for Cayley graph operations
   */
  async wrapCayleyOperation<T>(
    operationName: string,
    groupOrder: number,
    wasmFunction: () => Promise<T> | T,
    options?: {
      validateGroupProperties?: boolean;
      environment?: 'development' | 'testing' | 'production';
    }
  ): Promise<T> {
    const context: WASMOperationContext = {
      operation: `cayley_${operationName}`,
      wasmModule: 'cayley_core',
      functionName: operationName,
      inputSize: groupOrder,
      expectedComplexity: this.getCayleyComplexity(operationName, groupOrder),
      validationFn: options?.validateGroupProperties ? this.createCayleyValidator(groupOrder) : undefined
    };

    return await this.wrapWASMOperation(context, wasmFunction, {
      environment: options?.environment,
      trackMemory: true,
      cacheResults: true
    });
  }

  private categorizeWASMOperation(operation: string): 'group_theory' | 'elliptic_curves' | 'tda' | 'visualization' | 'latex_rendering' {
    if (operation.includes('tda') || operation.includes('persistence') || operation.includes('homology')) {
      return 'tda';
    }
    if (operation.includes('cayley') || operation.includes('group') || operation.includes('algebra')) {
      return 'group_theory';
    }
    if (operation.includes('elliptic') || operation.includes('curve') || operation.includes('field')) {
      return 'elliptic_curves';
    }
    if (operation.includes('render') || operation.includes('draw') || operation.includes('canvas')) {
      return 'visualization';
    }
    if (operation.includes('latex') || operation.includes('math') || operation.includes('katex')) {
      return 'latex_rendering';
    }
    return 'tda'; // Default fallback
  }

  private estimateExecutionTime(context: WASMOperationContext): number {
    const { operation, inputSize, expectedComplexity } = context;
    
    // Base estimates in milliseconds
    const baseTime = {
      'tda_persistence': 100,
      'tda_homology': 500,
      'cayley_generation': 50,
      'cayley_layout': 200,
      'group_validation': 20,
      'default': 100
    };

    const base = baseTime[operation as keyof typeof baseTime] || baseTime.default;
    
    // Apply complexity scaling
    switch (expectedComplexity) {
      case 'O(1)': return base;
      case 'O(n)': return base * Math.log(inputSize + 1);
      case 'O(n²)': return base * Math.pow(Math.log(inputSize + 1), 2);
      case 'O(n³)': return base * Math.pow(Math.log(inputSize + 1), 3);
      case 'O(2^n)': return Math.min(base * Math.pow(2, Math.min(inputSize, 10)), 10000);
      default: return base * Math.log(inputSize + 1);
    }
  }

  private getMaxAllowedTime(context: WASMOperationContext): number {
    const estimated = this.estimateExecutionTime(context);
    // Allow 3x the estimated time as maximum
    return Math.max(estimated * 3, 1000); // Minimum 1 second
  }

  private calculateTDAInputSize(inputData: any): number {
    if (Array.isArray(inputData)) {
      return inputData.length;
    }
    if (inputData?.points && Array.isArray(inputData.points)) {
      return inputData.points.length;
    }
    if (typeof inputData === 'object' && inputData?.size) {
      return inputData.size;
    }
    return 100; // Default estimate
  }

  private getTDAComplexity(operationName: string, inputSize: number): 'O(1)' | 'O(n)' | 'O(n²)' | 'O(n³)' | 'O(2^n)' | 'unknown' {
    switch (operationName) {
      case 'persistence_diagram':
      case 'homology_computation':
        return inputSize < 50 ? 'O(n²)' : 'O(n³)';
      case 'filtration_construction':
        return 'O(n²)';
      case 'barcode_generation':
        return 'O(n)';
      case 'landscape_computation':
        return 'O(n²)';
      default:
        return 'O(n²)';
    }
  }

  private getCayleyComplexity(operationName: string, groupOrder: number): 'O(1)' | 'O(n)' | 'O(n²)' | 'O(n³)' | 'O(2^n)' | 'unknown' {
    switch (operationName) {
      case 'group_generation':
        return groupOrder < 20 ? 'O(n²)' : 'O(n³)';
      case 'layout_calculation':
        return 'O(n²)';
      case 'subgroup_detection':
        return 'O(n²)';
      case 'conjugacy_classes':
        return 'O(n²)';
      default:
        return 'O(n²)';
    }
  }

  private createTDAValidator(expectedBetti?: number[]) {
    return (result: any): number => {
      try {
        if (!result || !result.intervals) {
          return 0.0; // Invalid result
        }

        // Basic validation: check if we have reasonable intervals
        const intervals = result.intervals;
        if (!Array.isArray(intervals) || intervals.length === 0) {
          return 0.5; // Partially valid
        }

        // Check if intervals have expected structure
        const hasValidStructure = intervals.every(interval => 
          typeof interval.birth === 'number' && 
          typeof interval.death === 'number' &&
          interval.birth <= interval.death
        );

        if (!hasValidStructure) {
          return 0.3; // Poor structure
        }

        // If expected Betti numbers provided, validate against them
        if (expectedBetti) {
          const actualBetti = this.computeBettiNumbers(intervals);
          const bettiAccuracy = this.compareBettiNumbers(actualBetti, expectedBetti);
          return 0.7 + (0.3 * bettiAccuracy); // Base score + Betti accuracy
        }

        return 1.0; // Fully valid
      } catch (error) {
        console.warn('TDA validation failed:', error);
        return 0.0;
      }
    };
  }

  private createCayleyValidator(groupOrder: number) {
    return (result: any): number => {
      try {
        if (!result) return 0.0;

        // Validate group structure if applicable
        if (result.elements && Array.isArray(result.elements)) {
          if (result.elements.length !== groupOrder) {
            return 0.5; // Wrong number of elements
          }
          
          // Check for identity element
          const hasIdentity = result.elements.some((el: any) => el.id === 'e');
          if (!hasIdentity) {
            return 0.6; // Missing identity
          }
          
          return 1.0; // Valid group structure
        }

        // Validate visualization data
        if (result.nodes && result.edges) {
          const nodeCount = Array.isArray(result.nodes) ? result.nodes.length : 0;
          if (nodeCount !== groupOrder) {
            return 0.7; // Wrong number of nodes
          }
          return 1.0; // Valid visualization
        }

        return 0.8; // Generic valid result
      } catch (error) {
        console.warn('Cayley validation failed:', error);
        return 0.0;
      }
    };
  }

  private computeBettiNumbers(intervals: any[]): number[] {
    const dimensions = new Set(intervals.map(i => i.dimension));
    const maxDim = Math.max(...dimensions);
    const betti: number[] = [];

    for (let d = 0; d <= maxDim; d++) {
      const dimIntervals = intervals.filter(i => i.dimension === d && i.death > i.birth);
      betti[d] = dimIntervals.length;
    }

    return betti;
  }

  private compareBettiNumbers(actual: number[], expected: number[]): number {
    const maxLength = Math.max(actual.length, expected.length);
    let matches = 0;

    for (let i = 0; i < maxLength; i++) {
      const actualVal = actual[i] || 0;
      const expectedVal = expected[i] || 0;
      if (actualVal === expectedVal) matches++;
    }

    return matches / maxLength;
  }

  private getWASMMemoryUsage(): { wasmHeap: number; jsHeap: number } {
    let wasmHeap = 0;
    let jsHeap = 0;

    // Try to get WASM memory usage
    try {
      // This would need to be adapted based on the specific WASM module
      const wasmModule = this.wasmModules.get('tda_rust_core');
      if (wasmModule && wasmModule.memory) {
        wasmHeap = wasmModule.memory.buffer.byteLength;
      }
    } catch (error) {
      // Ignore WASM memory errors
    }

    // Get JS heap usage
    try {
      const performance = globalThis.performance as any;
      if (performance?.memory) {
        jsHeap = performance.memory.usedJSHeapSize || 0;
      }
    } catch (error) {
      // Ignore JS memory errors
    }

    return { wasmHeap, jsHeap };
  }

  private cachePerformanceMetrics(context: WASMOperationContext, startMemory?: any): void {
    const key = `${context.wasmModule}_${context.functionName}`;
    const existing = this.performanceCache.get(key) || [];
    
    // For now, just store the operation context
    // In a real implementation, we'd calculate and store actual metrics
    const metrics: WASMPerformanceMetrics = {
      executionTime: 0, // Would be filled by the monitoring system
      memoryIncrease: 0, // Would be calculated
      inputComplexity: context.inputSize
    };

    existing.push(metrics);
    
    // Keep only the last 100 measurements
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }
    
    this.performanceCache.set(key, existing);
  }

  /**
   * Get cached performance metrics for analysis
   */
  getCachedMetrics(wasmModule: string, functionName: string): WASMPerformanceMetrics[] {
    const key = `${wasmModule}_${functionName}`;
    return this.performanceCache.get(key) || [];
  }

  /**
   * Clear performance cache
   */
  clearCache(): void {
    this.performanceCache.clear();
  }

  /**
   * Generate WASM-specific performance report
   */
  generateWASMReport(): {
    modules: string[];
    operations: Record<string, { callCount: number; averageTime: number; }>;
    recommendations: string[];
  } {
    const modules = Array.from(this.wasmModules.keys());
    const operations: Record<string, { callCount: number; averageTime: number; }> = {};
    const recommendations: string[] = [];

    // Analyze cached metrics
    for (const [key, metrics] of this.performanceCache.entries()) {
      const callCount = metrics.length;
      const averageTime = callCount > 0 
        ? metrics.reduce((sum, m) => sum + m.executionTime, 0) / callCount 
        : 0;
      
      operations[key] = { callCount, averageTime };

      // Generate recommendations
      if (callCount > 50 && averageTime > 1000) {
        recommendations.push(`Consider optimizing ${key} - high frequency and slow execution`);
      }
    }

    return {
      modules,
      operations,
      recommendations
    };
  }
}

// Export singleton instance
export const wasmPerformanceWrapper = WASMPerformanceWrapper.getInstance();

// Helper functions for common WASM operations
export function withTDAPerformanceMonitoring<T>(
  operationName: string,
  inputData: any,
  wasmFunction: () => Promise<T> | T,
  options?: {
    validateTopology?: boolean;
    expectedBetti?: number[];
    environment?: 'development' | 'testing' | 'production';
  }
): Promise<T> {
  return wasmPerformanceWrapper.wrapTDAOperation(operationName, inputData, wasmFunction, options);
}

export function withCayleyPerformanceMonitoring<T>(
  operationName: string,
  groupOrder: number,
  wasmFunction: () => Promise<T> | T,
  options?: {
    validateGroupProperties?: boolean;
    environment?: 'development' | 'testing' | 'production';
  }
): Promise<T> {
  return wasmPerformanceWrapper.wrapCayleyOperation(operationName, groupOrder, wasmFunction, options);
}