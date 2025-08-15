import { Alert, PerformanceMetric, Threshold } from '../types';
import { ThresholdManager } from './ThresholdManager';
import { AnomalyDetector } from './AnomalyDetector';

export class AlertManager {
  private static instance: AlertManager;
  private thresholds: Map<string, Threshold>;
  private anomalyDetector: AnomalyDetector;
  private alertHistory: Alert[] = [];
  private maxHistorySize: number = 1000;

  private constructor() {
    this.thresholds = new Map();
    this.anomalyDetector = AnomalyDetector.getInstance();
    this.initializeDefaultThresholds();
  }

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  private initializeDefaultThresholds(): void {
    // Default thresholds for common performance issues
    this.addThreshold({
      id: 'computation_slow',
      metricId: 'computation_time',
      operator: 'gt',
      value: 200, // 200ms
      enabled: true
    });

    this.addThreshold({
      id: 'computation_very_slow',
      metricId: 'computation_time',
      operator: 'gt',
      value: 1000, // 1 second
      enabled: true
    });

    this.addThreshold({
      id: 'memory_high',
      metricId: 'memory_usage',
      operator: 'gt',
      value: 100 * 1024 * 1024, // 100MB
      enabled: true
    });

    this.addThreshold({
      id: 'rendering_slow',
      metricId: 'rendering_time',
      operator: 'gt',
      value: 16.67, // 60 FPS threshold
      enabled: true
    });

    this.addThreshold({
      id: 'interaction_lag',
      metricId: 'interaction_time',
      operator: 'gt',
      value: 100, // 100ms
      enabled: true
    });
  }

  addThreshold(threshold: Threshold): void {
    this.thresholds.set(threshold.id, threshold);
  }

  removeThreshold(thresholdId: string): boolean {
    return this.thresholds.delete(thresholdId);
  }

  getThresholds(): Threshold[] {
    return Array.from(this.thresholds.values());
  }

  updateThreshold(thresholdId: string, updates: Partial<Threshold>): boolean {
    const threshold = this.thresholds.get(thresholdId);
    if (!threshold) return false;

    this.thresholds.set(thresholdId, { ...threshold, ...updates });
    return true;
  }

  checkMetrics(metrics: PerformanceMetric[]): Alert[] {
    const alerts: Alert[] = [];

    // Check threshold violations
    metrics.forEach((metric) => {
      const thresholdAlerts = this.checkThresholdViolations(metric);
      alerts.push(...thresholdAlerts);
    });

    // Check for anomalies using ML-based detection
    const anomalyAlerts = this.anomalyDetector.detectAnomalies(metrics);
    alerts.push(...anomalyAlerts);

    // Add alerts to history
    this.addAlertsToHistory(alerts);

    return alerts;
  }

  private checkThresholdViolations(metric: PerformanceMetric): Alert[] {
    const alerts: Alert[] = [];

    // Find applicable thresholds for this metric
    this.thresholds.forEach((threshold) => {
      if (!threshold.enabled) return;

      // Check if threshold applies to this metric
      if (this.isThresholdApplicable(threshold, metric)) {
        const isViolated = this.isThresholdViolated(metric, threshold);
        
        if (isViolated) {
          const alert = this.createThresholdAlert(metric, threshold);
          alerts.push(alert);
        }
      }
    });

    return alerts;
  }

  private isThresholdApplicable(threshold: Threshold, metric: PerformanceMetric): boolean {
    // Check if threshold applies to this metric type
    if (threshold.metricId === 'computation_time' && metric.category === 'computation') {
      return true;
    }
    if (threshold.metricId === 'memory_usage' && metric.category === 'memory') {
      return true;
    }
    if (threshold.metricId === 'rendering_time' && metric.category === 'rendering') {
      return true;
    }
    if (threshold.metricId === 'interaction_time' && metric.category === 'interaction') {
      return true;
    }
    
    // Generic check for component-specific thresholds
    if (threshold.metricId.startsWith(metric.id.split('_')[0])) {
      return true;
    }

    return false;
  }

  private isThresholdViolated(metric: PerformanceMetric, threshold: Threshold): boolean {
    const value = metric.value;
    const thresholdValue = threshold.value;

    switch (threshold.operator) {
      case 'gt':
        return value > thresholdValue;
      case 'gte':
        return value >= thresholdValue;
      case 'lt':
        return value < thresholdValue;
      case 'lte':
        return value <= thresholdValue;
      case 'eq':
        return Math.abs(value - thresholdValue) < 0.001; // Small tolerance for floating point
      default:
        return false;
    }
  }

  private createThresholdAlert(metric: PerformanceMetric, threshold: Threshold): Alert {
    const priority = this.calculateAlertPriority(metric, threshold);
    
    return {
      id: `threshold_${threshold.id}_${Date.now()}`,
      timestamp: Date.now(),
      type: 'threshold',
      priority,
      message: this.generateThresholdMessage(metric, threshold),
      metricId: metric.id,
      metadata: {
        thresholdId: threshold.id,
        thresholdValue: threshold.value,
        thresholdOperator: threshold.operator,
        actualValue: metric.value,
        component: metric.id.split('_')[0],
        category: metric.category
      }
    };
  }

  private calculateAlertPriority(metric: PerformanceMetric, threshold: Threshold): Alert['priority'] {
    const value = metric.value;
    const thresholdValue = threshold.value;
    const ratio = value / thresholdValue;

    if (ratio > 5) return 'critical';
    if (ratio > 3) return 'high';
    if (ratio > 2) return 'medium';
    return 'low';
  }

  private generateThresholdMessage(metric: PerformanceMetric, threshold: Threshold): string {
    const component = metric.id.split('_')[0];
    const value = metric.value;
    const thresholdValue = threshold.value;
    const unit = metric.unit;

    let operatorText: string;
    switch (threshold.operator) {
      case 'gt':
        operatorText = 'exceeded';
        break;
      case 'gte':
        operatorText = 'reached or exceeded';
        break;
      case 'lt':
        operatorText = 'fell below';
        break;
      case 'lte':
        operatorText = 'reached or fell below';
        break;
      case 'eq':
        operatorText = 'deviated from';
        break;
      default:
        operatorText = 'violated';
    }

    return `${component} ${metric.category} ${operatorText} threshold: ${value.toFixed(2)}${unit} (threshold: ${thresholdValue}${unit})`;
  }

  private addAlertsToHistory(alerts: Alert[]): void {
    this.alertHistory.push(...alerts);
    
    // Maintain history size limit
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory = this.alertHistory.slice(-this.maxHistorySize);
    }
  }

  getAlertHistory(limit?: number): Alert[] {
    if (limit) {
      return this.alertHistory.slice(-limit);
    }
    return [...this.alertHistory];
  }

  getActiveAlerts(): Alert[] {
    return this.alertHistory.filter(alert => !(alert as any).resolved);
  }

  getCriticalAlerts(): Alert[] {
    return this.alertHistory.filter(alert => 
      alert.priority === 'critical' && !(alert as any).resolved
    );
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alertHistory.find(a => a.id === alertId);
    if (!alert) return false;

    (alert as any).resolved = true;
    (alert as any).resolvedAt = Date.now();
    return true;
  }

  clearResolvedAlerts(): void {
    this.alertHistory = this.alertHistory.filter(alert => !(alert as any).resolved);
  }

  getAlertStatistics(): {
    total: number;
    active: number;
    resolved: number;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
  } {
    const byPriority: Record<string, number> = {};
    const byType: Record<string, number> = {};

    this.alertHistory.forEach(alert => {
      byPriority[alert.priority] = (byPriority[alert.priority] || 0) + 1;
      byType[alert.type] = (byType[alert.type] || 0) + 1;
    });

    return {
      total: this.alertHistory.length,
      active: this.getActiveAlerts().length,
      resolved: this.alertHistory.length - this.getActiveAlerts().length,
      byPriority,
      byType
    };
  }
}

export const alertManager = AlertManager.getInstance();
