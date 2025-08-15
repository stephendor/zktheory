export type PerformanceCategory = 'computation' | 'rendering' | 'memory' | 'interaction';

export interface PerformanceMetric {
  id: string;
  timestamp: number; // epoch ms
  category: PerformanceCategory;
  value: number;
  unit: string; // e.g., 'ms', 'MB', 'fps'
  metadata?: Record<string, any>;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface PerformanceHook {
  id: string;
  category: string;
  startTime: number;
  isActive: boolean;
}

export interface Alert {
  id: string;
  timestamp: number;
  type: 'threshold' | 'anomaly' | 'warning';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metricId?: string;
  metadata?: Record<string, any>;
}

export interface Threshold {
  id: string;
  metricId: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
  value: number;
  enabled: boolean;
}

export interface Recommendation {
  type: 'optimization' | 'investigation' | 'configuration';
  priority: 'low' | 'medium' | 'high';
  message: string;
  action: string;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  summary: {
    totalMetrics: number;
    averageComputationTime: number;
    averageMemoryUsage: number;
    performanceScore: number;
  };
  trends: {
    computationTrend: 'improving' | 'stable' | 'degrading';
    memoryTrend: 'stable' | 'increasing' | 'decreasing';
    renderingTrend: 'improving' | 'stable' | 'degrading';
  };
  recommendations: Recommendation[];
  timestamp: string;
}

export interface Bottleneck {
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  metadata?: Record<string, any>;
}

export interface ChartData {
  computation: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
  backgroundColor: string;
  fill?: boolean | string;
  tension?: number;
  type?: 'line' | 'bar';
  borderDash?: number[];
    }>;
  };
  memory: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
  type?: 'line' | 'bar';
  borderColor?: string;
  borderDash?: number[];
    }>;
  };
  performance: {
    labels: string[];
    datasets: Array<{
      data: number[];
      backgroundColor: string[];
    }>;
  };
}
