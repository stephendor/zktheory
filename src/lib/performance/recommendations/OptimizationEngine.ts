import { PerformanceMetric, Recommendation } from '../types';

interface PerformanceAnalysis {
  computationMetrics: PerformanceMetric[];
  memoryMetrics: PerformanceMetric[];
  renderingMetrics: PerformanceMetric[];
  interactionMetrics: PerformanceMetric[];
  overallScore: number;
  bottlenecks: string[];
  trends: {
    computation: 'improving' | 'stable' | 'degrading';
    memory: 'stable' | 'increasing' | 'decreasing';
    rendering: 'improving' | 'stable' | 'degrading';
  };
}

export class OptimizationEngine {
  private static instance: OptimizationEngine;
  private recommendationTemplates: Map<string, Recommendation> = new Map();

  private constructor() {
    this.initializeRecommendationTemplates();
  }

  static getInstance(): OptimizationEngine {
    if (!OptimizationEngine.instance) {
      OptimizationEngine.instance = new OptimizationEngine();
    }
    return OptimizationEngine.instance;
  }

  private initializeRecommendationTemplates(): void {
    // Computation optimization recommendations
    this.recommendationTemplates.set('computation_slow', {
      type: 'optimization',
      priority: 'high',
      message: 'Computation performance is below optimal levels',
      action: 'Consider implementing computation caching, algorithm optimization, or parallel processing',
      metadata: { category: 'computation', impact: 'high' }
    });

    this.recommendationTemplates.set('computation_variance', {
      type: 'optimization',
      priority: 'medium',
      message: 'High variance in computation times detected',
      action: 'Investigate performance consistency and implement deterministic algorithms where possible',
      metadata: { category: 'computation', impact: 'medium' }
    });

    this.recommendationTemplates.set('memory_leak', {
      type: 'optimization',
      priority: 'high',
      message: 'Potential memory leak detected',
      action: 'Implement memory cleanup strategies, review object lifecycle management, and add memory monitoring',
      metadata: { category: 'memory', impact: 'critical' }
    });

    this.recommendationTemplates.set('memory_high', {
      type: 'optimization',
      priority: 'high',
      message: 'Memory usage is consistently high',
      action: 'Consider implementing object pooling, lazy loading, or memory-efficient data structures',
      metadata: { category: 'memory', impact: 'high' }
    });

    this.recommendationTemplates.set('rendering_slow', {
      type: 'optimization',
      priority: 'medium',
      message: 'Rendering performance below 60 FPS target',
      action: 'Optimize rendering pipeline, implement level-of-detail, or use WebGL optimizations',
      metadata: { category: 'rendering', impact: 'medium' }
    });

    this.recommendationTemplates.set('interaction_lag', {
      type: 'optimization',
      priority: 'high',
      message: 'User interaction lag detected',
      action: 'Implement debouncing, optimize event handlers, or use Web Workers for heavy computations',
      metadata: { category: 'interaction', impact: 'high' }
    });

    this.recommendationTemplates.set('wasm_optimization', {
      type: 'optimization',
      priority: 'medium',
      message: 'WASM operations could be optimized',
      action: 'Review WASM implementation, consider SIMD optimizations, or implement operation batching',
      metadata: { category: 'wasm', impact: 'medium' }
    });
  }

  analyzePerformance(metrics: PerformanceMetric[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    if (metrics.length === 0) return recommendations;

    const analysis = this.performAnalysis(metrics);
    
    // Generate recommendations based on analysis
    recommendations.push(...this.generateComputationRecommendations(analysis));
    recommendations.push(...this.generateMemoryRecommendations(analysis));
    recommendations.push(...this.generateRenderingRecommendations(analysis));
    recommendations.push(...this.generateInteractionRecommendations(analysis));
    recommendations.push(...this.generateGeneralRecommendations(analysis));

    // Sort by priority and impact
    return this.sortRecommendations(recommendations);
  }

  private performAnalysis(metrics: PerformanceMetric[]): PerformanceAnalysis {
    const computationMetrics = metrics.filter(m => m.category === 'computation');
    const memoryMetrics = metrics.filter(m => m.category === 'memory');
    const renderingMetrics = metrics.filter(m => m.category === 'rendering');
    const interactionMetrics = metrics.filter(m => m.category === 'interaction');

    const trends = this.analyzeTrends(metrics);
    const bottlenecks = this.identifyBottlenecks(metrics);
    const overallScore = this.calculateOverallScore(metrics);

    return {
      computationMetrics,
      memoryMetrics,
      renderingMetrics,
      interactionMetrics,
      overallScore,
      bottlenecks,
      trends
    };
  }

  private analyzeTrends(metrics: PerformanceMetric[]): PerformanceAnalysis['trends'] {
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
      computation: getTrend('computation'),
      memory: getTrend('memory') as 'stable' | 'increasing' | 'decreasing',
      rendering: getTrend('rendering')
    };
  }

  private identifyBottlenecks(metrics: PerformanceMetric[]): string[] {
    const bottlenecks: string[] = [];
    
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
          bottlenecks.push(`${component}: High average computation time (${avgTime.toFixed(2)}ms)`);
        }
        if (maxTime > 1000) {
          bottlenecks.push(`${component}: Very slow operations detected (${maxTime.toFixed(2)}ms)`);
        }
      }

      // Check for memory bottlenecks
      if (memoryMetrics.length > 0) {
        const latestMemory = memoryMetrics[memoryMetrics.length - 1];
        const memoryMB = latestMemory.value / (1024 * 1024);
        
        if (memoryMB > 100) {
          bottlenecks.push(`${component}: High memory usage (${memoryMB.toFixed(2)}MB)`);
        }
      }
    });

    return bottlenecks;
  }

  private calculateOverallScore(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 100;

    let totalScore = 0;
    let weightSum = 0;

    // Computation performance (40% weight)
    const computationMetrics = metrics.filter(m => m.category === 'computation');
    if (computationMetrics.length > 0) {
      const avgTime = computationMetrics.reduce((sum, m) => sum + m.value, 0) / computationMetrics.length;
      const computationScore = Math.max(0, 100 - (avgTime / 10)); // 0ms = 100, 1000ms = 0
      totalScore += computationScore * 0.4;
      weightSum += 0.4;
    }

    // Memory efficiency (30% weight)
    const memoryMetrics = metrics.filter(m => m.category === 'memory');
    if (memoryMetrics.length > 0) {
      const latestMemory = memoryMetrics[memoryMetrics.length - 1];
      const memoryMB = latestMemory.value / (1024 * 1024);
      const memoryScore = Math.max(0, 100 - (memoryMB / 2)); // 0MB = 100, 200MB = 0
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
      const interactionScore = Math.max(0, 100 - (avgTime / 2)); // 0ms = 100, 200ms = 0
      totalScore += interactionScore * 0.1;
      weightSum += 0.1;
    }

    return weightSum > 0 ? Math.round(totalScore / weightSum) : 100;
  }

  private generateComputationRecommendations(analysis: PerformanceAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (analysis.computationMetrics.length === 0) return recommendations;

    const avgTime = analysis.computationMetrics.reduce((sum, m) => sum + m.value, 0) / analysis.computationMetrics.length;
    const maxTime = Math.max(...analysis.computationMetrics.map(m => m.value));

    if (avgTime > 200) {
      recommendations.push({
        ...this.recommendationTemplates.get('computation_slow')!,
        message: `Average computation time is ${avgTime.toFixed(2)}ms - consider optimization`,
        metadata: { ...this.recommendationTemplates.get('computation_slow')!.metadata, actualValue: avgTime }
      });
    }

    if (maxTime > 1000) {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        message: `Some computations are taking ${maxTime.toFixed(2)}ms`,
        action: 'Investigate and optimize the slowest operations, consider breaking them into smaller tasks',
        metadata: { category: 'computation', impact: 'critical', maxTime }
      });
    }

    // Check for variance
    const times = analysis.computationMetrics.map(m => m.value);
    const variance = this.calculateVariance(times);
    if (variance > Math.pow(avgTime * 0.5, 2)) {
      recommendations.push({
        ...this.recommendationTemplates.get('computation_variance')!,
        metadata: { ...this.recommendationTemplates.get('computation_variance')!.metadata, variance, avgTime }
      });
    }

    return recommendations;
  }

  private generateMemoryRecommendations(analysis: PerformanceAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (analysis.memoryMetrics.length === 0) return recommendations;

    const latestMemory = analysis.memoryMetrics[analysis.memoryMetrics.length - 1];
    const memoryMB = latestMemory.value / (1024 * 1024);

    if (memoryMB > 100) {
      recommendations.push({
        ...this.recommendationTemplates.get('memory_high')!,
        message: `Memory usage is ${memoryMB.toFixed(2)}MB - consider cleanup strategies`,
        metadata: { ...this.recommendationTemplates.get('memory_high')!.metadata, actualMemory: memoryMB }
      });
    }

    // Check for potential memory leaks
    if (analysis.memoryMetrics.length > 10) {
      const recentMemory = analysis.memoryMetrics.slice(-5);
      const olderMemory = analysis.memoryMetrics.slice(-10, -5);
      
      const recentAvg = recentMemory.reduce((sum, m) => sum + m.value, 0) / recentMemory.length;
      const olderAvg = olderMemory.reduce((sum, m) => sum + m.value, 0) / olderMemory.length;
      
      if (recentAvg > olderAvg * 1.2) { // 20% increase
        recommendations.push({
          ...this.recommendationTemplates.get('memory_leak')!,
          message: 'Memory usage is increasing over time - potential memory leak detected',
          metadata: { ...this.recommendationTemplates.get('memory_leak')!.metadata, growthRate: ((recentAvg - olderAvg) / olderAvg * 100).toFixed(1) }
        });
      }
    }

    return recommendations;
  }

  private generateRenderingRecommendations(analysis: PerformanceAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (analysis.renderingMetrics.length === 0) return recommendations;

    const avgTime = analysis.renderingMetrics.reduce((sum, m) => sum + m.value, 0) / analysis.renderingMetrics.length;
    
    if (avgTime > 16.67) {
      recommendations.push({
        ...this.recommendationTemplates.get('rendering_slow')!,
        message: `Rendering time ${avgTime.toFixed(2)}ms - below 60 FPS target`,
        metadata: { ...this.recommendationTemplates.get('rendering_slow')!.metadata, actualTime: avgTime }
      });
    }

    return recommendations;
  }

  private generateInteractionRecommendations(analysis: PerformanceAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (analysis.interactionMetrics.length === 0) return recommendations;

    const avgTime = analysis.interactionMetrics.reduce((sum, m) => sum + m.value, 0) / analysis.interactionMetrics.length;
    
    if (avgTime > 100) {
      recommendations.push({
        ...this.recommendationTemplates.get('interaction_lag')!,
        message: `Interaction lag detected: ${avgTime.toFixed(2)}ms`,
        metadata: { ...this.recommendationTemplates.get('interaction_lag')!.metadata, actualTime: avgTime }
      });
    }

    return recommendations;
  }

  private generateGeneralRecommendations(analysis: PerformanceAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Overall performance score recommendations
    if (analysis.overallScore < 50) {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        message: 'Overall performance score is critically low',
        action: 'Comprehensive performance review required - focus on major bottlenecks first',
        metadata: { category: 'general', impact: 'critical', score: analysis.overallScore }
      });
    } else if (analysis.overallScore < 70) {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        message: 'Performance score indicates significant room for improvement',
        action: 'Address high-priority bottlenecks and implement systematic optimizations',
        metadata: { category: 'general', impact: 'high', score: analysis.overallScore }
      });
    }

    // Trend-based recommendations
    if (analysis.trends.computation === 'degrading') {
      recommendations.push({
        type: 'investigation',
        priority: 'medium',
        message: 'Computation performance is degrading over time',
        action: 'Investigate recent changes that may have introduced performance regressions',
        metadata: { category: 'trend', impact: 'medium', trend: 'degrading' }
      });
    }

    if (analysis.trends.memory === 'increasing') {
      recommendations.push({
        type: 'investigation',
        priority: 'high',
        message: 'Memory usage is increasing over time',
        action: 'Investigate potential memory leaks or inefficient memory management',
        metadata: { category: 'trend', impact: 'high', trend: 'increasing' }
      });
    }

    return recommendations;
  }

  private sortRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };

    return recommendations.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      const impactDiff = impactOrder[b.metadata?.impact || 'medium'] - impactOrder[a.metadata?.impact || 'medium'];
      return impactDiff;
    });
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  getRecommendationTemplates(): Map<string, Recommendation> {
    return new Map(this.recommendationTemplates);
  }

  addRecommendationTemplate(id: string, recommendation: Recommendation): void {
    this.recommendationTemplates.set(id, recommendation);
  }

  removeRecommendationTemplate(id: string): boolean {
    return this.recommendationTemplates.delete(id);
  }
}

export const optimizationEngine = OptimizationEngine.getInstance();
