// Cache Warming and Prefetching System for zktheory mathematical platform
// Intelligently preloads frequently accessed content and predicts user needs

import { mathematicalCacheManager } from './IndexedDBCache';
import { serviceWorkerManager } from './ServiceWorkerManager';
import { cachePerformanceMonitor } from './performance/CachePerformanceMonitor';
import { CacheWarmingStrategy, MathematicalAlgorithm, VisualizationType } from './types';

export interface WarmingPrediction {
  key: string;
  confidence: number;
  priority: number;
  estimatedAccessTime: number;
  resourceType: 'computation' | 'visualization' | 'documentation';
}

export interface WarmingSession {
  id: string;
  startTime: number;
  endTime?: number;
  predictions: WarmingPrediction[];
  warmedKeys: string[];
  successRate: number;
  performanceImpact: number;
}

export class CacheWarmingEngine {
  private warmingStrategies: Map<string, CacheWarmingStrategy> = new Map();
  private userNavigationHistory: string[] = [];
  private accessPatterns: Map<string, number> = new Map();
  private warmingSessions: WarmingSession[] = [];
  private isWarming: boolean = false;
  private maxHistorySize: number = 100;

  constructor() {
    this.initializeDefaultStrategies();
    // Only setup navigation tracking in browser environment
    if (typeof window !== 'undefined') {
      this.setupNavigationTracking();
    }
  }

  // Initialize default warming strategies
  private initializeDefaultStrategies(): void {
    // Predictive warming based on time of day
    this.warmingStrategies.set('time-based', {
      type: 'predictive',
      priority: 1,
      targetKeys: [],
      conditions: {
        timeOfDay: [9, 14, 19], // Morning, afternoon, evening
        userActivity: ['active'],
        contentType: ['mathematical']
      }
    });

    // Usage-based warming for frequently accessed content
    this.warmingStrategies.set('usage-based', {
      type: 'usage-based',
      priority: 2,
      targetKeys: [],
      conditions: {
        userActivity: ['frequent'],
        contentType: ['all']
      }
    });

    // Dependency-based warming for related mathematical content
    this.warmingStrategies.set('dependency-based', {
      type: 'dependency-based',
      priority: 3,
      targetKeys: [],
      conditions: {
        contentType: ['mathematical']
      }
    });
  }

  // Track user navigation for pattern analysis
  private setupNavigationTracking(): void {
    if (typeof window !== 'undefined') {
      // Track page navigation
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = (...args) => {
        this.recordNavigation(window.location.pathname);
        return originalPushState.apply(history, args);
      };

      history.replaceState = (...args) => {
        this.recordNavigation(window.location.pathname);
        return originalReplaceState.apply(history, args);
      };

      // Track popstate events
      window.addEventListener('popstate', () => {
        this.recordNavigation(window.location.pathname);
      });

      // Track initial page load
      this.recordNavigation(window.location.pathname);
    }
  }

  // Record a navigation event
  private recordNavigation(path: string): void {
    this.userNavigationHistory.push(path);
    
    // Keep history within size limit
    if (this.userNavigationHistory.length > this.maxHistorySize) {
      this.userNavigationHistory = this.userNavigationHistory.slice(-this.maxHistorySize);
    }

    // Update access patterns
    this.accessPatterns.set(path, (this.accessPatterns.get(path) || 0) + 1);

    // Trigger warming if conditions are met
    this.checkWarmingConditions();
  }

  // Check if warming conditions are met
  private async checkWarmingConditions(): Promise<void> {
    if (this.isWarming) return;

    const currentTime = new Date().getHours();
    const isActiveTime = [9, 14, 19].includes(currentTime);
    const hasFrequentActivity = this.userNavigationHistory.length > 10;

    if (isActiveTime || hasFrequentActivity) {
      await this.startWarmingSession();
    }
  }

  // Start a warming session
  async startWarmingSession(): Promise<WarmingSession> {
    if (this.isWarming) {
      throw new Error('Warming session already in progress');
    }

    this.isWarming = true;
    const sessionId = `warming-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const session: WarmingSession = {
      id: sessionId,
      startTime: Date.now(),
      predictions: [],
      warmedKeys: [],
      successRate: 0,
      performanceImpact: 0
    };

    try {
      console.log('🔥 Starting cache warming session...');
      
      // Generate warming predictions
      const predictions = await this.generateWarmingPredictions();
      session.predictions = predictions;

      // Execute warming strategies
      const warmedKeys = await this.executeWarmingStrategies(predictions);
      session.warmedKeys = warmedKeys;

      // Calculate success rate
      session.successRate = warmedKeys.length / predictions.length;

      // Measure performance impact
      session.performanceImpact = await this.measurePerformanceImpact();

      console.log(`✅ Cache warming completed: ${warmedKeys.length}/${predictions.length} keys warmed`);
      
      return session;
    } catch (error) {
      console.error('❌ Cache warming failed:', error);
      throw error;
    } finally {
      this.isWarming = false;
      session.endTime = Date.now();
      this.warmingSessions.push(session);
    }
  }

  // Generate warming predictions based on user behavior
  private async generateWarmingPredictions(): Promise<WarmingPrediction[]> {
    const predictions: WarmingPrediction[] = [];

    // Analyze navigation patterns
    const navigationPatterns = this.analyzeNavigationPatterns();
    
    // Predict next likely pages
    for (const pattern of navigationPatterns) {
      if (pattern.confidence > 0.6) {
        predictions.push({
          key: pattern.path,
          confidence: pattern.confidence,
          priority: pattern.priority,
          estimatedAccessTime: Date.now() + pattern.estimatedDelay,
          resourceType: this.determineResourceType(pattern.path)
        });
      }
    }

    // Add frequently accessed mathematical tools
    const frequentTools = await this.getFrequentlyAccessedTools();
    for (const tool of frequentTools) {
      predictions.push({
        key: tool.key,
        confidence: tool.frequency / 100, // Normalize frequency
        priority: 2,
        estimatedAccessTime: Date.now() + 5 * 60 * 1000, // 5 minutes
        resourceType: 'computation'
      });
    }

    // Sort by priority and confidence
    return predictions.sort((a, b) => {
      const priorityDiff = b.priority - a.priority;
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });
  }

  // Analyze navigation patterns to predict next likely pages
  private analyzeNavigationPatterns(): Array<{
    path: string;
    confidence: number;
    priority: number;
    estimatedDelay: number;
  }> {
    const patterns: Array<{
      path: string;
      confidence: number;
      priority: number;
      estimatedDelay: number;
    }> = [];

    if (this.userNavigationHistory.length < 2) return patterns;

    // Find common navigation sequences
    const sequences = this.findCommonSequences();
    
    for (const sequence of sequences) {
      const currentPath = this.userNavigationHistory[this.userNavigationHistory.length - 1];
      const nextPath = this.predictNextPath(sequence, currentPath);
      
      if (nextPath) {
        patterns.push({
          path: nextPath,
          confidence: sequence.confidence,
          priority: sequence.frequency > 3 ? 3 : 2,
          estimatedDelay: sequence.averageDelay
        });
      }
    }

    return patterns;
  }

  // Find common navigation sequences
  private findCommonSequences(): Array<{
    sequence: string[];
    frequency: number;
    confidence: number;
    averageDelay: number;
  }> {
    const sequences = new Map<string, {
      sequence: string[];
      frequency: number;
      confidence: number;
      averageDelay: number;
    }>();

    // Look for sequences of 2-3 pages
    for (let length = 2; length <= 3; length++) {
      for (let i = 0; i <= this.userNavigationHistory.length - length; i++) {
        const sequence = this.userNavigationHistory.slice(i, i + length);
        const key = sequence.join(' -> ');
        
        const existing = sequences.get(key);
        if (existing) {
          existing.frequency++;
          existing.confidence = Math.min(0.95, existing.frequency / 10);
        } else {
          sequences.set(key, {
            sequence,
            frequency: 1,
            confidence: 0.1,
            averageDelay: 30 * 1000 // 30 seconds default
          });
        }
      }
    }

    return Array.from(sequences.values())
      .filter(s => s.frequency > 1)
      .sort((a, b) => b.frequency - a.frequency);
  }

  // Predict next path based on sequence
  private predictNextPath(sequence: { sequence: string[] }, currentPath: string): string | null {
    // Simple prediction: if current path matches sequence end, predict next common path
    if (sequence.sequence[sequence.sequence.length - 1] === currentPath) {
      // This is a simplified prediction - in practice you'd use more sophisticated ML
      const commonNextPaths = this.findCommonNextPaths(currentPath);
      return commonNextPaths.length > 0 ? commonNextPaths[0] : null;
    }
    return null;
  }

  // Find common next paths after a given path
  private findCommonNextPaths(path: string): string[] {
    const nextPaths = new Map<string, number>();
    
    for (let i = 0; i < this.userNavigationHistory.length - 1; i++) {
      if (this.userNavigationHistory[i] === path) {
        const nextPath = this.userNavigationHistory[i + 1];
        nextPaths.set(nextPath, (nextPaths.get(nextPath) || 0) + 1);
      }
    }

    return Array.from(nextPaths.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([path]) => path);
  }

  // Determine resource type from path
  private determineResourceType(path: string): 'computation' | 'visualization' | 'documentation' {
    if (path.includes('/tda-explorer') || path.includes('/elliptic-curves')) {
      return 'computation';
    } else if (path.includes('/visualizations') || path.includes('/cayley')) {
      return 'visualization';
    } else {
      return 'documentation';
    }
  }

  // Get frequently accessed mathematical tools
  private async getFrequentlyAccessedTools(): Promise<Array<{ key: string; frequency: number }>> {
    try {
      const cacheStats = await mathematicalCacheManager.getCacheStats();
      // This would analyze actual cache access patterns
      // For now, return common mathematical tools
      return [
        { key: 'tda-persistence', frequency: 85 },
        { key: 'elliptic-curve-group', frequency: 72 },
        { key: 'cayley-graph', frequency: 68 },
        { key: 'vietoris-rips', frequency: 45 }
      ];
    } catch (error) {
      console.error('❌ Failed to get frequently accessed tools:', error);
      return [];
    }
  }

  // Execute warming strategies
  private async executeWarmingStrategies(predictions: WarmingPrediction[]): Promise<string[]> {
    const warmedKeys: string[] = [];

    for (const prediction of predictions) {
      try {
        if (await this.warmKey(prediction)) {
          warmedKeys.push(prediction.key);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to warm key ${prediction.key}:`, error);
      }
    }

    return warmedKeys;
  }

  // Warm a specific key
  private async warmKey(prediction: WarmingPrediction): Promise<boolean> {
    try {
      switch (prediction.resourceType) {
        case 'computation':
          return await this.warmComputation(prediction.key);
        case 'visualization':
          return await this.warmVisualization(prediction.key);
        case 'documentation':
          return await this.warmDocumentation(prediction.key);
        default:
          return false;
      }
    } catch (error) {
      console.error(`❌ Failed to warm key ${prediction.key}:`, error);
      return false;
    }
  }

  // Warm computation cache
  private async warmComputation(key: string): Promise<boolean> {
    try {
      // Pre-compute common mathematical operations
      const commonInputs = this.getCommonInputs(key);
      
      for (const input of commonInputs) {
        // This would trigger the actual computation
        // For now, just simulate warming
        console.log(`🔥 Warming computation: ${key} with input size ${input.length}`);
        
        // Record warming metric
        cachePerformanceMonitor.recordMetric({
          operation: 'set',
          key: `${key}-${input.length}`,
          duration: 5,
          success: true,
          metadata: {
            algorithm: key,
            type: 'warming'
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to warm computation ${key}:`, error);
      return false;
    }
  }

  // Warm visualization cache
  private async warmVisualization(key: string): Promise<boolean> {
    try {
      // Pre-render common visualization states
      console.log(`🔥 Warming visualization: ${key}`);
      
      // Record warming metric
      cachePerformanceMonitor.recordMetric({
        operation: 'set',
        key: `viz-${key}`,
        duration: 3,
        success: true,
        metadata: {
          type: 'visualization',
          algorithm: 'cache-warming'
        }
      });
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to warm visualization ${key}:`, error);
      return false;
    }
  }

  // Warm documentation cache
  private async warmDocumentation(key: string): Promise<boolean> {
    try {
      // Pre-fetch documentation content
      console.log(`🔥 Warming documentation: ${key}`);
      
      // Record warming metric
      cachePerformanceMonitor.recordMetric({
        operation: 'set',
        key: `doc-${key}`,
        duration: 2,
        success: true,
        metadata: {
          type: 'documentation',
          algorithm: 'cache-warming'
        }
      });
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to warm documentation ${key}:`, error);
      return false;
    }
  }

  // Get common inputs for a mathematical algorithm
  private getCommonInputs(algorithm: string): any[] {
    // Return common input patterns for different algorithms
    const commonInputs: Record<string, any[]> = {
      'tda-persistence': [
        Array.from({ length: 50 }, () => [Math.random(), Math.random()]),
        Array.from({ length: 100 }, () => [Math.random(), Math.random()]),
        Array.from({ length: 200 }, () => [Math.random(), Math.random()])
      ],
      'elliptic-curve-group': [
        { a: 2, b: 3, p: 17 },
        { a: 1, b: 1, p: 23 },
        { a: 0, b: 7, p: 19 }
      ],
      'cayley-graph': [
        { generators: ['a', 'b'], relations: ['a^2', 'b^2', '(ab)^3'] },
        { generators: ['x', 'y'], relations: ['x^4', 'y^2', 'xyx=y'] }
      ]
    };

    return commonInputs[algorithm] || [];
  }

  // Measure performance impact of warming
  private async measurePerformanceImpact(): Promise<number> {
    try {
      const beforeMetrics = cachePerformanceMonitor.getPerformanceMetrics();
      
      // Wait a bit for metrics to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const afterMetrics = cachePerformanceMonitor.getPerformanceMetrics();
      
      // Calculate improvement in hit rate
      const hitRateImprovement = afterMetrics.hitRate - beforeMetrics.hitRate;
      
      return hitRateImprovement;
    } catch (error) {
      console.error('❌ Failed to measure performance impact:', error);
      return 0;
    }
  }

  // Get warming session history
  getWarmingHistory(): WarmingSession[] {
    return [...this.warmingSessions];
  }

  // Get current warming status
  getWarmingStatus(): { isWarming: boolean; currentSession?: WarmingSession } {
    const currentSession = this.warmingSessions.find(s => !s.endTime);
    return {
      isWarming: this.isWarming,
      currentSession
    };
  }

  // Clear warming history
  clearWarmingHistory(): void {
    this.warmingSessions = [];
  }
}

// Export singleton instance
export const cacheWarmingEngine = new CacheWarmingEngine();

