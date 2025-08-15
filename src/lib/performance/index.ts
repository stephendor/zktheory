// Core performance monitoring classes
export { PerformanceMetricsCollector, performanceMetrics } from './PerformanceMetrics';
export { MetricsBuffer } from './MetricsBuffer';

// React hooks for performance monitoring
export {
  usePerformanceMonitor,
  usePerformanceMetrics,
  usePerformanceToggle,
  useMemoryTracking,
  usePerformanceOptimization,
  useWASMPerformance
} from './PerformanceHooks';

// Alert system and optimization
export {
  AlertManager,
  alertManager,
  ThresholdManager,
  thresholdManager,
  AnomalyDetector,
  anomalyDetector,
  OptimizationEngine,
  optimizationEngine
} from './alerts';

// Data export and analysis
export { PerformanceDataExporter, performanceDataExporter } from './export/PerformanceDataExporter';

// Configuration management
export { PerformanceConfigManager, performanceConfig } from './config/PerformanceConfig';
export type { PerformanceConfig } from './config/PerformanceConfig';

// Types
export type {
  PerformanceMetric,
  TimeRange,
  PerformanceHook,
  Alert,
  Threshold,
  Recommendation,
  PerformanceReport,
  Bottleneck,
  ChartData
} from './types';

// Mathematical performance types
export type {
  MathematicalOperation,
  MathematicalMetric,
  MathematicalPerformanceThreshold,
  RegressionAnalysis
} from './MathematicalPerformanceMonitor';

// WASM performance types
export type {
  WASMOperationContext,
  WASMPerformanceMetrics
} from './WASMPerformanceWrapper';

// Baseline management types
export type {
  BaselineConfiguration,
  PerformanceBaseline,
  RegressionTest,
  PerformanceTrend
} from './PerformanceBaselineManager';
