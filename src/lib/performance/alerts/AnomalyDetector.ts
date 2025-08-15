import { Alert, PerformanceMetric } from '../types';

interface AnomalyDetectionResult {
  metric: PerformanceMetric;
  anomalyScore: number;
  expectedValue: number;
  deviation: number;
  isAnomaly: boolean;
}

export class AnomalyDetector {
  private static instance: AnomalyDetector;
  private historicalData: Map<string, PerformanceMetric[]> = new Map();
  private anomalyThreshold: number = 2.5; // Standard deviations for anomaly detection
  private minDataPoints: number = 10; // Minimum data points needed for analysis
  private maxHistorySize: number = 1000; // Maximum history per metric type

  private constructor() {}

  static getInstance(): AnomalyDetector {
    if (!AnomalyDetector.instance) {
      AnomalyDetector.instance = new AnomalyDetector();
    }
    return AnomalyDetector.instance;
  }

  detectAnomalies(metrics: PerformanceMetric[]): Alert[] {
    const alerts: Alert[] = [];

    // Group metrics by component and category for analysis
    const groupedMetrics = this.groupMetrics(metrics);

    groupedMetrics.forEach((componentMetrics, key) => {
      if (componentMetrics.length >= this.minDataPoints) {
        const anomalies = this.detectAnomaliesForComponent(componentMetrics);
        anomalies.forEach(anomaly => {
          if (anomaly.isAnomaly) {
            const alert = this.createAnomalyAlert(anomaly);
            alerts.push(alert);
          }
        });
      }

      // Update historical data
      this.updateHistoricalData(key, componentMetrics);
    });

    return alerts;
  }

  private groupMetrics(metrics: PerformanceMetric[]): Map<string, PerformanceMetric[]> {
    const grouped = new Map<string, PerformanceMetric[]>();

    metrics.forEach(metric => {
      const key = `${metric.category}_${metric.id.split('_')[0]}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(metric);
    });

    return grouped;
  }

  private detectAnomaliesForComponent(metrics: PerformanceMetric[]): AnomalyDetectionResult[] {
    const results: AnomalyDetectionResult[] = [];
    
    // Sort by timestamp to get chronological order
    const sortedMetrics = metrics.sort((a, b) => a.timestamp - b.timestamp);
    
    // Use sliding window approach for real-time detection
    const windowSize = Math.min(20, sortedMetrics.length);
    const recentMetrics = sortedMetrics.slice(-windowSize);
    
    if (recentMetrics.length < this.minDataPoints) {
      return results;
    }

    // Calculate baseline statistics from historical data
    const baselineStats = this.calculateBaselineStatistics(recentMetrics);
    
    // Check each recent metric for anomalies
    recentMetrics.forEach(metric => {
      const result = this.analyzeMetric(metric, baselineStats);
      results.push(result);
    });

    return results;
  }

  private calculateBaselineStatistics(metrics: PerformanceMetric[]): {
    mean: number;
    stdDev: number;
    median: number;
    q1: number;
    q3: number;
    iqr: number;
  } {
    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const n = values.length;

    // Calculate mean
    const mean = values.reduce((sum, val) => sum + val, 0) / n;

    // Calculate standard deviation
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // Calculate quartiles
    const median = this.calculatePercentile(values, 50);
    const q1 = this.calculatePercentile(values, 25);
    const q3 = this.calculatePercentile(values, 75);
    const iqr = q3 - q1;

    return { mean, stdDev, median, q1, q3, iqr };
  }

  private calculatePercentile(sortedValues: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;

    if (lower === upper) {
      return sortedValues[lower];
    }

    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }

  private analyzeMetric(
    metric: PerformanceMetric, 
    baselineStats: ReturnType<typeof this.calculateBaselineStatistics>
  ): AnomalyDetectionResult {
    const { mean, stdDev, q1, q3, iqr } = baselineStats;
    const value = metric.value;

    // Calculate deviation from mean
    const deviation = Math.abs(value - mean);
    const zScore = stdDev > 0 ? deviation / stdDev : 0;

    // Multiple anomaly detection methods
    const isZScoreAnomaly = zScore > this.anomalyThreshold;
    const isIQRAnomaly = value < (q1 - 1.5 * iqr) || value > (q3 + 1.5 * iqr);
    
    // Trend-based anomaly detection
    const isTrendAnomaly = this.detectTrendAnomaly(metric, baselineStats);
    
    // Combined anomaly score
    const anomalyScore = this.calculateAnomalyScore({
      zScore,
      isIQRAnomaly,
      isTrendAnomaly,
      deviation,
      baselineStats
    });

    const isAnomaly = anomalyScore > 0.7; // Threshold for anomaly detection

    return {
      metric,
      anomalyScore,
      expectedValue: mean,
      deviation,
      isAnomaly
    };
  }

  private detectTrendAnomaly(
    metric: PerformanceMetric,
    baselineStats: ReturnType<typeof this.calculateBaselineStatistics>
  ): boolean {
    // Get recent metrics for trend analysis
    const key = `${metric.category}_${metric.id.split('_')[0]}`;
    const historicalMetrics = this.historicalData.get(key) || [];
    
    if (historicalMetrics.length < 5) return false;

    // Calculate trend using linear regression
    const recentMetrics = historicalMetrics.slice(-10);
    const trend = this.calculateTrend(recentMetrics);
    
    // Check if current value deviates significantly from trend
    const expectedTrendValue = trend.slope * recentMetrics.length + trend.intercept;
    const trendDeviation = Math.abs(metric.value - expectedTrendValue);
    const trendThreshold = baselineStats.stdDev * 2;

    return trendDeviation > trendThreshold;
  }

  private calculateTrend(metrics: PerformanceMetric[]): { slope: number; intercept: number } {
    const n = metrics.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    const yValues = metrics.map(m => m.value);

    // Simple linear regression
    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = yValues.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  private calculateAnomalyScore(params: {
    zScore: number;
    isIQRAnomaly: boolean;
    isTrendAnomaly: boolean;
    deviation: number;
    baselineStats: ReturnType<typeof this.calculateBaselineStatistics>;
  }): number {
    const { zScore, isIQRAnomaly, isTrendAnomaly, deviation, baselineStats } = params;
    
    let score = 0;

    // Z-score contribution (0-0.4)
    score += Math.min(zScore / this.anomalyThreshold, 1) * 0.4;

    // IQR contribution (0-0.3)
    if (isIQRAnomaly) {
      score += 0.3;
    }

    // Trend contribution (0-0.2)
    if (isTrendAnomaly) {
      score += 0.2;
    }

    // Deviation magnitude contribution (0-0.1)
    const relativeDeviation = deviation / baselineStats.mean;
    score += Math.min(relativeDeviation, 1) * 0.1;

    return Math.min(score, 1);
  }

  private createAnomalyAlert(anomaly: AnomalyDetectionResult): Alert {
    const { metric, anomalyScore, expectedValue, deviation } = anomaly;
    const component = metric.id.split('_')[0];

    let priority: Alert['priority'] = 'low';
    if (anomalyScore > 0.9) priority = 'critical';
    else if (anomalyScore > 0.7) priority = 'high';
    else if (anomalyScore > 0.5) priority = 'medium';

    const message = `Performance anomaly detected in ${component}: ${metric.value.toFixed(2)}${metric.unit} (expected ~${expectedValue.toFixed(2)}${metric.unit}, deviation: ${deviation.toFixed(2)}${metric.unit})`;

    return {
      id: `anomaly_${metric.id}_${Date.now()}`,
      timestamp: Date.now(),
      type: 'anomaly',
      priority,
      message,
      metricId: metric.id,
      metadata: {
        anomalyScore: anomalyScore.toFixed(3),
        expectedValue: expectedValue.toFixed(2),
        deviation: deviation.toFixed(2),
        component,
        category: metric.category,
        detectionMethod: 'ML-based statistical analysis'
      }
    };
  }

  private updateHistoricalData(key: string, metrics: PerformanceMetric[]): void {
    if (!this.historicalData.has(key)) {
      this.historicalData.set(key, []);
    }

    const historical = this.historicalData.get(key)!;
    historical.push(...metrics);

    // Maintain history size limit
    if (historical.length > this.maxHistorySize) {
      this.historicalData.set(key, historical.slice(-this.maxHistorySize));
    }
  }

  setAnomalyThreshold(threshold: number): void {
    this.anomalyThreshold = Math.max(1.0, threshold);
  }

  setMinDataPoints(minPoints: number): void {
    this.minDataPoints = Math.max(5, minPoints);
  }

  getDetectionParameters(): {
    anomalyThreshold: number;
    minDataPoints: number;
    maxHistorySize: number;
  } {
    return {
      anomalyThreshold: this.anomalyThreshold,
      minDataPoints: this.minDataPoints,
      maxHistorySize: this.maxHistorySize
    };
  }

  clearHistoricalData(): void {
    this.historicalData.clear();
  }

  getHistoricalDataSize(): number {
    let totalSize = 0;
    this.historicalData.forEach(metrics => {
      totalSize += metrics.length;
    });
    return totalSize;
  }
}

export const anomalyDetector = AnomalyDetector.getInstance();
