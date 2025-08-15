import { Threshold } from '../types';

export class ThresholdManager {
  private static instance: ThresholdManager;
  private thresholds: Map<string, Threshold> = new Map();
  private thresholdGroups: Map<string, string[]> = new Map();
  private defaultThresholds: Map<string, Threshold> = new Map();

  private constructor() {
    this.initializeDefaultThresholds();
  }

  static getInstance(): ThresholdManager {
    if (!ThresholdManager.instance) {
      ThresholdManager.instance = new ThresholdManager();
    }
    return ThresholdManager.instance;
  }

  private initializeDefaultThresholds(): void {
    // Performance thresholds
    this.addDefaultThreshold({
      id: 'performance_excellent',
      metricId: 'computation_time',
      operator: 'lte',
      value: 50, // 50ms
      enabled: true
    });

    this.addDefaultThreshold({
      id: 'performance_good',
      metricId: 'computation_time',
      operator: 'lte',
      value: 100, // 100ms
      enabled: true
    });

    this.addDefaultThreshold({
      id: 'performance_acceptable',
      metricId: 'computation_time',
      operator: 'lte',
      value: 200, // 200ms
      enabled: true
    });

    this.addDefaultThreshold({
      id: 'performance_poor',
      metricId: 'computation_time',
      operator: 'gt',
      value: 200, // 200ms
      enabled: true
    });

    // Memory thresholds
    this.addDefaultThreshold({
      id: 'memory_low',
      metricId: 'memory_usage',
      operator: 'lte',
      value: 50 * 1024 * 1024, // 50MB
      enabled: true
    });

    this.addDefaultThreshold({
      id: 'memory_medium',
      metricId: 'memory_usage',
      operator: 'lte',
      value: 100 * 1024 * 1024, // 100MB
      enabled: true
    });

    this.addDefaultThreshold({
      id: 'memory_high',
      metricId: 'memory_usage',
      operator: 'gt',
      value: 100 * 1024 * 1024, // 100MB
      enabled: true
    });

    // Rendering thresholds
    this.addDefaultThreshold({
      id: 'rendering_60fps',
      metricId: 'rendering_time',
      operator: 'lte',
      value: 16.67, // 60 FPS
      enabled: true
    });

    this.addDefaultThreshold({
      id: 'rendering_30fps',
      metricId: 'rendering_time',
      operator: 'lte',
      value: 33.33, // 30 FPS
      enabled: true
    });

    this.addDefaultThreshold({
      id: 'rendering_slow',
      metricId: 'rendering_time',
      operator: 'gt',
      value: 33.33, // 30 FPS
      enabled: true
    });

    // Interaction thresholds
    this.addDefaultThreshold({
      id: 'interaction_responsive',
      metricId: 'interaction_time',
      operator: 'lte',
      value: 50, // 50ms
      enabled: true
    });

    this.addDefaultThreshold({
      id: 'interaction_acceptable',
      metricId: 'interaction_time',
      operator: 'lte',
      value: 100, // 100ms
      enabled: true
    });

    this.addDefaultThreshold({
      id: 'interaction_slow',
      metricId: 'interaction_time',
      operator: 'gt',
      value: 100, // 100ms
      enabled: true
    });

    // Group thresholds by category
    this.thresholdGroups.set('performance', [
      'performance_excellent',
      'performance_good', 
      'performance_acceptable',
      'performance_poor'
    ]);

    this.thresholdGroups.set('memory', [
      'memory_low',
      'memory_medium',
      'memory_high'
    ]);

    this.thresholdGroups.set('rendering', [
      'rendering_60fps',
      'rendering_30fps',
      'rendering_slow'
    ]);

    this.thresholdGroups.set('interaction', [
      'interaction_responsive',
      'interaction_acceptable',
      'interaction_slow'
    ]);
  }

  private addDefaultThreshold(threshold: Threshold): void {
    this.defaultThresholds.set(threshold.id, threshold);
    this.thresholds.set(threshold.id, { ...threshold });
  }

  addThreshold(threshold: Threshold): void {
    this.thresholds.set(threshold.id, threshold);
  }

  removeThreshold(thresholdId: string): boolean {
    return this.thresholds.delete(thresholdId);
  }

  getThreshold(thresholdId: string): Threshold | undefined {
    return this.thresholds.get(thresholdId);
  }

  getAllThresholds(): Threshold[] {
    return Array.from(this.thresholds.values());
  }

  getThresholdsByGroup(group: string): Threshold[] {
    const thresholdIds = this.thresholdGroups.get(group) || [];
    return thresholdIds
      .map(id => this.thresholds.get(id))
      .filter((t): t is Threshold => t !== undefined);
  }

  getThresholdGroups(): string[] {
    return Array.from(this.thresholdGroups.keys());
  }

  updateThreshold(thresholdId: string, updates: Partial<Threshold>): boolean {
    const threshold = this.thresholds.get(thresholdId);
    if (!threshold) return false;

    this.thresholds.set(thresholdId, { ...threshold, ...updates });
    return true;
  }

  enableThreshold(thresholdId: string): boolean {
    return this.updateThreshold(thresholdId, { enabled: true });
  }

  disableThreshold(thresholdId: string): boolean {
    return this.updateThreshold(thresholdId, { enabled: true });
  }

  resetToDefaults(): void {
    this.thresholds.clear();
    this.defaultThresholds.forEach((threshold, id) => {
      this.thresholds.set(id, { ...threshold });
    });
  }

  createCustomThreshold(
    metricId: string,
    operator: Threshold['operator'],
    value: number,
    enabled: boolean = true
  ): Threshold {
    const id = `custom_${metricId}_${operator}_${Date.now()}`;
    const threshold: Threshold = {
      id,
      metricId,
      operator,
      value,
      enabled
    };

    this.addThreshold(threshold);
    return threshold;
  }

  getThresholdsForMetric(metricId: string): Threshold[] {
    return Array.from(this.thresholds.values()).filter(
      threshold => threshold.metricId === metricId || 
                  threshold.metricId.startsWith(metricId.split('_')[0])
    );
  }

  getEnabledThresholds(): Threshold[] {
    return Array.from(this.thresholds.values()).filter(threshold => threshold.enabled);
  }

  getDisabledThresholds(): Threshold[] {
    return Array.from(this.thresholds.values()).filter(threshold => !threshold.enabled);
  }

  exportThresholds(): string {
    const data = {
      exportDate: new Date().toISOString(),
      thresholds: Array.from(this.thresholds.values()),
      groups: Object.fromEntries(this.thresholdGroups)
    };

    return JSON.stringify(data, null, 2);
  }

  importThresholds(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.thresholds && Array.isArray(data.thresholds)) {
        // Clear existing thresholds
        this.thresholds.clear();
        
        // Import new thresholds
        data.thresholds.forEach((threshold: Threshold) => {
          this.addThreshold(threshold);
        });

        // Import groups if available
        if (data.groups) {
          this.thresholdGroups.clear();
          Object.entries(data.groups).forEach(([group, thresholdIds]) => {
            this.thresholdGroups.set(group, thresholdIds as string[]);
          });
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import thresholds:', error);
      return false;
    }
  }

  getThresholdStatistics(): {
    total: number;
    enabled: number;
    disabled: number;
    byGroup: Record<string, number>;
    byMetric: Record<string, number>;
  } {
    const byGroup: Record<string, number> = {};
    const byMetric: Record<string, number> = {};

    this.thresholds.forEach(threshold => {
      // Count by group
      for (const [group, thresholdIds] of this.thresholdGroups.entries()) {
        if (thresholdIds.includes(threshold.id)) {
          byGroup[group] = (byGroup[group] || 0) + 1;
          break;
        }
      }

      // Count by metric
      byMetric[threshold.metricId] = (byMetric[threshold.metricId] || 0) + 1;
    });

    return {
      total: this.thresholds.size,
      enabled: this.getEnabledThresholds().length,
      disabled: this.getDisabledThresholds().length,
      byGroup,
      byMetric
    };
  }
}

export const thresholdManager = ThresholdManager.getInstance();
