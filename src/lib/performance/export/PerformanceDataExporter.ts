import { PerformanceMetric, PerformanceReport, Bottleneck } from '../types';
import { optimizationEngine } from '../recommendations/OptimizationEngine';

export class PerformanceDataExporter {
  private static instance: PerformanceDataExporter;

  private constructor() {}

  static getInstance(): PerformanceDataExporter {
    if (!PerformanceDataExporter.instance) {
      PerformanceDataExporter.instance = new PerformanceDataExporter();
    }
    return PerformanceDataExporter.instance;
  }

  exportToCSV(metrics: PerformanceMetric[], filename?: string): void {
    const csvContent = this.convertToCSV(metrics);
    const defaultFilename = `performance-metrics-${new Date().toISOString().split('T')[0]}.csv`;
    this.downloadFile(csvContent, filename || defaultFilename, 'text/csv');
  }

  exportToJSON(metrics: PerformanceMetric[], filename?: string): void {
    const jsonContent = JSON.stringify(metrics, null, 2);
    const defaultFilename = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`;
    this.downloadFile(jsonContent, filename || defaultFilename, 'application/json');
  }

  generatePerformanceReport(metrics: PerformanceMetric[]): PerformanceReport {
    if (metrics.length === 0) {
      return this.createEmptyReport();
    }

    const summary = this.generateSummary(metrics);
    const trends = this.analyzeTrends(metrics);
    const recommendations = optimizationEngine.analyzePerformance(metrics);

    return {
      summary,
      trends,
      recommendations,
      timestamp: new Date().toISOString()
    };
  }

  exportPerformanceReport(metrics: PerformanceMetric[], filename?: string): void {
    const report = this.generatePerformanceReport(metrics);
    const jsonContent = JSON.stringify(report, null, 2);
    const defaultFilename = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    this.downloadFile(jsonContent, filename || defaultFilename, 'application/json');
  }

  exportBottleneckAnalysis(metrics: PerformanceMetric[], filename?: string): void {
    const bottlenecks = this.findBottlenecks(metrics);
    const analysis = {
      exportDate: new Date().toISOString(),
      totalMetrics: metrics.length,
      bottlenecks,
      summary: this.generateBottleneckSummary(bottlenecks)
    };

    const jsonContent = JSON.stringify(analysis, null, 2);
    const defaultFilename = `bottleneck-analysis-${new Date().toISOString().split('T')[0]}.json`;
    this.downloadFile(jsonContent, filename || defaultFilename, 'application/json');
  }

  exportTrendAnalysis(metrics: PerformanceMetric[], filename?: string): void {
    const trends = this.analyzeDetailedTrends(metrics);
    const analysis = {
      exportDate: new Date().toISOString(),
      totalMetrics: metrics.length,
      trends,
      insights: this.generateTrendInsights(trends)
    };

    const jsonContent = JSON.stringify(analysis, null, 2);
    const defaultFilename = `trend-analysis-${new Date().toISOString().split('T')[0]}.json`;
    this.downloadFile(jsonContent, filename || defaultFilename, 'application/json');
  }

  exportComponentAnalysis(metrics: PerformanceMetric[], filename?: string): void {
    const componentAnalysis = this.analyzeComponents(metrics);
    const analysis = {
      exportDate: new Date().toISOString(),
      totalMetrics: metrics.length,
      components: componentAnalysis,
      recommendations: this.generateComponentRecommendations(componentAnalysis)
    };

    const jsonContent = JSON.stringify(analysis, null, 2);
    const defaultFilename = `component-analysis-${new Date().toISOString().split('T')[0]}.json`;
    this.downloadFile(jsonContent, filename || defaultFilename, 'application/json');
  }

  private convertToCSV(metrics: PerformanceMetric[]): string {
    const headers = ['ID', 'Timestamp', 'Category', 'Value', 'Unit', 'Metadata'];
    const rows = metrics.map(metric => [
      metric.id,
      new Date(metric.timestamp).toISOString(),
      metric.category,
      metric.value,
      metric.unit,
      JSON.stringify(metric.metadata || {})
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private createEmptyReport(): PerformanceReport {
    return {
      summary: {
        totalMetrics: 0,
        averageComputationTime: 0,
        averageMemoryUsage: 0,
        performanceScore: 100
      },
      trends: {
        computationTrend: 'stable',
        memoryTrend: 'stable',
        renderingTrend: 'stable'
      },
      recommendations: [],
      timestamp: new Date().toISOString()
    };
  }

  private generateSummary(metrics: PerformanceMetric[]): PerformanceReport['summary'] {
    const computationMetrics = metrics.filter(m => m.category === 'computation');
    const memoryMetrics = metrics.filter(m => m.category === 'memory');

    const averageComputationTime = computationMetrics.length > 0
      ? computationMetrics.reduce((sum, m) => sum + m.value, 0) / computationMetrics.length
      : 0;

    const averageMemoryUsage = memoryMetrics.length > 0
      ? memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length
      : 0;

    const performanceScore = this.calculatePerformanceScore(metrics);

    return {
      totalMetrics: metrics.length,
      averageComputationTime,
      averageMemoryUsage,
      performanceScore
    };
  }

  private analyzeTrends(metrics: PerformanceMetric[]): PerformanceReport['trends'] {
    const now = Date.now();
    const timeWindow = 5 * 60 * 1000; // 5 minutes
    const recentMetrics = metrics.filter(m => now - m.timestamp < timeWindow);
    const olderMetrics = metrics.filter(m => now - m.timestamp >= timeWindow && now - m.timestamp < timeWindow * 2);

    const getTrend = (category: string): 'improving' | 'stable' | 'degrading' => {
      const recent = recentMetrics.filter(m => m.category === category);
      const older = olderMetrics.filter(m => m.category === category);

      if (recent.length === 0 || older.length === 0) return 'stable';

      const recentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
      const olderAvg = older.reduce((sum, m) => sum + m.value, 0) / older.length;

      const change = ((olderAvg - recentAvg) / olderAvg) * 100;
      
      if (change > 10) return 'improving';
      if (change < -10) return 'degrading';
      return 'stable';
    };

    return {
      computationTrend: getTrend('computation'),
      memoryTrend: getTrend('memory') as 'stable' | 'increasing' | 'decreasing',
      renderingTrend: getTrend('rendering')
    };
  }

  private calculatePerformanceScore(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 100;

    let totalScore = 0;
    let weightSum = 0;

    // Computation performance (40% weight)
    const computationMetrics = metrics.filter(m => m.category === 'computation');
    if (computationMetrics.length > 0) {
      const avgTime = computationMetrics.reduce((sum, m) => sum + m.value, 0) / computationMetrics.length;
      const computationScore = Math.max(0, 100 - (avgTime / 10));
      totalScore += computationScore * 0.4;
      weightSum += 0.4;
    }

    // Memory efficiency (30% weight)
    const memoryMetrics = metrics.filter(m => m.category === 'memory');
    if (memoryMetrics.length > 0) {
      const latestMemory = memoryMetrics[memoryMetrics.length - 1];
      const memoryMB = latestMemory.value / (1024 * 1024);
      const memoryScore = Math.max(0, 100 - (memoryMB / 2));
      totalScore += memoryScore * 0.3;
      weightSum += 0.3;
    }

    // Rendering performance (20% weight)
    const renderingMetrics = metrics.filter(m => m.category === 'rendering');
    if (renderingMetrics.length > 0) {
      const avgTime = renderingMetrics.reduce((sum, m) => sum + m.value, 0) / renderingMetrics.length;
      const renderingScore = avgTime <= 16.67 ? 100 : Math.max(0, 100 - ((avgTime - 16.67) * 5));
      totalScore += renderingScore * 0.2;
      weightSum += 0.2;
    }

    // Interaction responsiveness (10% weight)
    const interactionMetrics = metrics.filter(m => m.category === 'interaction');
    if (interactionMetrics.length > 0) {
      const avgTime = interactionMetrics.reduce((sum, m) => sum + m.value, 0) / interactionMetrics.length;
      const interactionScore = Math.max(0, 100 - (avgTime / 2));
      totalScore += interactionScore * 0.1;
      weightSum += 0.1;
    }

    return weightSum > 0 ? Math.round(totalScore / weightSum) : 100;
  }

  private findBottlenecks(metrics: PerformanceMetric[]): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];
    
    // Group metrics by component
    const componentMetrics = new Map<string, PerformanceMetric[]>();
    metrics.forEach(metric => {
      const component = metric.id.split('_')[0];
      if (!componentMetrics.has(component)) {
        componentMetrics.set(component, []);
      }
      componentMetrics.get(component)!.push(metric);
    });

    componentMetrics.forEach((componentMetrics, component) => {
      const computationMetrics = componentMetrics.filter(m => m.category === 'computation');
      const memoryMetrics = componentMetrics.filter(m => m.category === 'memory');

      // Check for computation bottlenecks
      if (computationMetrics.length > 0) {
        const avgTime = computationMetrics.reduce((sum, m) => sum + m.value, 0) / computationMetrics.length;
        const maxTime = Math.max(...computationMetrics.map(m => m.value));
        
        if (avgTime > 200) {
          bottlenecks.push({
            component,
            severity: avgTime > 500 ? 'critical' : avgTime > 300 ? 'high' : 'medium',
            description: `High average computation time: ${avgTime.toFixed(2)}ms`,
            recommendation: 'Consider algorithm optimization, caching, or parallel processing'
          });
        }

        if (maxTime > 1000) {
          bottlenecks.push({
            component,
            severity: 'critical',
            description: `Very slow operations detected: ${maxTime.toFixed(2)}ms`,
            recommendation: 'Investigate and optimize the slowest operations'
          });
        }
      }

      // Check for memory bottlenecks
      if (memoryMetrics.length > 0) {
        const latestMemory = memoryMetrics[memoryMetrics.length - 1];
        const memoryMB = latestMemory.value / (1024 * 1024);
        
        if (memoryMB > 100) {
          bottlenecks.push({
            component,
            severity: memoryMB > 200 ? 'critical' : 'high',
            description: `High memory usage: ${memoryMB.toFixed(2)}MB`,
            recommendation: 'Implement memory cleanup strategies and efficient data structures'
          });
        }
      }
    });

    return bottlenecks;
  }

  private generateBottleneckSummary(bottlenecks: Bottleneck[]): {
    total: number;
    bySeverity: Record<string, number>;
    criticalComponents: string[];
  } {
    const bySeverity: Record<string, number> = {};
    const criticalComponents: string[] = [];

    bottlenecks.forEach(bottleneck => {
      bySeverity[bottleneck.severity] = (bySeverity[bottleneck.severity] || 0) + 1;
      if (bottleneck.severity === 'critical') {
        criticalComponents.push(bottleneck.component);
      }
    });

    return {
      total: bottlenecks.length,
      bySeverity,
      criticalComponents: [...new Set(criticalComponents)]
    };
  }

  private analyzeDetailedTrends(metrics: PerformanceMetric[]): any {
    const now = Date.now();
    const timeWindows = [1, 5, 15, 30]; // minutes
    const trends: any = {};

    timeWindows.forEach(windowMinutes => {
      const timeWindow = windowMinutes * 60 * 1000;
      const recentMetrics = metrics.filter(m => now - m.timestamp < timeWindow);
      
      trends[`${windowMinutes}min`] = {
        computation: this.calculateTrendForCategory(recentMetrics, 'computation'),
        memory: this.calculateTrendForCategory(recentMetrics, 'memory'),
        rendering: this.calculateTrendForCategory(recentMetrics, 'rendering'),
        interaction: this.calculateTrendForCategory(recentMetrics, 'interaction')
      };
    });

    return trends;
  }

  private calculateTrendForCategory(metrics: PerformanceMetric[], category: string): any {
    const categoryMetrics = metrics.filter(m => m.category === category);
    
    if (categoryMetrics.length === 0) {
      return { count: 0, average: 0, trend: 'stable' };
    }

    const values = categoryMetrics.map(m => m.value);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const count = categoryMetrics.length;

    // Simple trend calculation
    const sortedMetrics = categoryMetrics.sort((a, b) => a.timestamp - b.timestamp);
    const firstHalf = sortedMetrics.slice(0, Math.floor(sortedMetrics.length / 2));
    const secondHalf = sortedMetrics.slice(Math.floor(sortedMetrics.length / 2));

    let trend = 'stable';
    if (firstHalf.length > 0 && secondHalf.length > 0) {
      const firstAvg = firstHalf.reduce((sum, m) => sum + m.value, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, m) => sum + m.value, 0) / secondHalf.length;
      const change = ((firstAvg - secondAvg) / firstAvg) * 100;
      
      if (change > 10) trend = 'improving';
      else if (change < -10) trend = 'degrading';
    }

    return { count, average, trend };
  }

  private generateTrendInsights(trends: any): string[] {
    const insights: string[] = [];

    Object.entries(trends).forEach(([window, data]: [string, any]) => {
      Object.entries(data).forEach(([category, metrics]: [string, any]) => {
        if (metrics.count > 0) {
          if (metrics.trend === 'degrading') {
            insights.push(`${window} ${category} trend is degrading - investigate recent changes`);
          } else if (metrics.trend === 'improving') {
            insights.push(`${window} ${category} trend is improving - optimizations may be working`);
          }
        }
      });
    });

    return insights;
  }

  private analyzeComponents(metrics: PerformanceMetric[]): any {
    const componentAnalysis: any = {};

    // Group metrics by component
    const componentMetrics = new Map<string, PerformanceMetric[]>();
    metrics.forEach(metric => {
      const component = metric.id.split('_')[0];
      if (!componentMetrics.has(component)) {
        componentMetrics.set(component, []);
      }
      componentMetrics.get(component)!.push(metric);
    });

    componentMetrics.forEach((componentMetrics, component) => {
      const categories = ['computation', 'memory', 'rendering', 'interaction'];
      const analysis: any = {};

      categories.forEach(category => {
        const categoryMetrics = componentMetrics.filter(m => m.category === category);
        if (categoryMetrics.length > 0) {
          const values = categoryMetrics.map(m => m.value);
          analysis[category] = {
            count: categoryMetrics.length,
            average: values.reduce((sum, val) => sum + val, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            latest: categoryMetrics[categoryMetrics.length - 1].value
          };
        }
      });

      componentAnalysis[component] = analysis;
    });

    return componentAnalysis;
  }

  private generateComponentRecommendations(componentAnalysis: any): any {
    const recommendations: any = {};

    Object.entries(componentAnalysis).forEach(([component, analysis]: [string, any]) => {
      const componentRecs: any[] = [];

      if (analysis.computation) {
        const { average, max } = analysis.computation;
        if (average > 200) {
          componentRecs.push(`Optimize computation performance (avg: ${average.toFixed(2)}ms)`);
        }
        if (max > 1000) {
          componentRecs.push(`Address very slow operations (max: ${max.toFixed(2)}ms)`);
        }
      }

      if (analysis.memory) {
        const { latest } = analysis.memory;
        const memoryMB = latest / (1024 * 1024);
        if (memoryMB > 100) {
          componentRecs.push(`Reduce memory usage (${memoryMB.toFixed(2)}MB)`);
        }
      }

      if (analysis.rendering) {
        const { average } = analysis.rendering;
        if (average > 16.67) {
          componentRecs.push(`Improve rendering performance (${average.toFixed(2)}ms)`);
        }
      }

      if (componentRecs.length > 0) {
        recommendations[component] = componentRecs;
      }
    });

    return recommendations;
  }
}

export const performanceDataExporter = PerformanceDataExporter.getInstance();
