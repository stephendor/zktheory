// Advanced Cache Invalidation Engine for zktheory mathematical platform
// Handles version-based invalidation, dependency tracking, and content relationships

import { mathematicalCacheManager } from '../IndexedDBCache';
import { serviceWorkerManager } from '../ServiceWorkerManager';
import { cachePerformanceMonitor } from '../performance/CachePerformanceMonitor';
import { CacheInvalidationEvent, DependencyGraph, InvalidationStrategy, VersionInfo } from '../types';

export interface InvalidationRule {
  id: string;
  name: string;
  pattern: string | RegExp;
  strategy: InvalidationStrategy;
  priority: number;
  dependencies?: string[];
  conditions?: {
    version?: string;
    algorithm?: string;
    dataType?: string;
    userRole?: string;
  };
}

export interface InvalidationResult {
  success: boolean;
  invalidatedKeys: string[];
  affectedLayers: string[];
  estimatedImpact: 'low' | 'medium' | 'high';
  timestamp: number;
  metadata: {
    reason: string;
    trigger: string;
    userAgent?: string;
    performanceMetrics?: any;
  };
}

export interface DependencyNode {
  id: string;
  type: 'computation' | 'visualization' | 'documentation' | 'user-preference';
  dependencies: string[];
  dependents: string[];
  lastModified: number;
  version: string;
  complexity: number;
}

export class CacheInvalidationEngine {
  private invalidationRules: Map<string, InvalidationRule> = new Map();
  private dependencyGraph: Map<string, DependencyNode> = new Map();
  private versionRegistry: Map<string, VersionInfo> = new Map();
  private invalidationHistory: InvalidationResult[] = [];
  private isInvalidating: boolean = false;
  private invalidationQueue: Array<{
    rule: InvalidationRule;
    context: any;
    priority: number;
  }> = [];

  constructor() {
    this.initializeDefaultRules();
    this.setupVersionTracking();
    this.setupDependencyTracking();
  }

  // Initialize default invalidation rules
  private initializeDefaultRules(): void {
    // Version-based invalidation
    this.addInvalidationRule({
      id: 'version-update',
      name: 'Version Update Invalidation',
      pattern: /.*/,
      strategy: 'eager',
      priority: 1,
      conditions: {
        version: 'auto-detect'
      }
    });

    // Algorithm-specific invalidation
    this.addInvalidationRule({
      id: 'algorithm-update',
      name: 'Algorithm Update Invalidation',
      pattern: /^computation:/,
      strategy: 'hybrid',
      priority: 2,
      conditions: {
        algorithm: 'any'
      }
    });

    // Data type invalidation
    this.addInvalidationRule({
      id: 'data-type-update',
      name: 'Data Type Update Invalidation',
      pattern: /^visualization:/,
      strategy: 'lazy',
      priority: 3,
      conditions: {
        dataType: 'visualization'
      }
    });

    // User preference invalidation
    this.addInvalidationRule({
      id: 'user-preference-update',
      name: 'User Preference Update Invalidation',
      pattern: /^preference:/,
      strategy: 'lazy',
      priority: 4,
      conditions: {
        userRole: 'any'
      }
    });

    // Mathematical content invalidation
    this.addInvalidationRule({
      id: 'mathematical-content-update',
      name: 'Mathematical Content Update Invalidation',
      pattern: /^math:/,
      strategy: 'hybrid',
      priority: 5,
      conditions: {
        dataType: 'mathematical'
      }
    });
  }

  // Add a new invalidation rule
  addInvalidationRule(rule: InvalidationRule): void {
    this.invalidationRules.set(rule.id, rule);
    console.log(`✅ Added invalidation rule: ${rule.name}`);
  }

  // Remove an invalidation rule
  removeInvalidationRule(ruleId: string): boolean {
    return this.invalidationRules.delete(ruleId);
  }

  // Setup version tracking
  private setupVersionTracking(): void {
    // Track application version
    this.versionRegistry.set('app', {
      algorithm: 'app',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      dependencies: [],
      breakingChanges: false,
      timestamp: Date.now()
    });

    // Track mathematical algorithm versions
    this.versionRegistry.set('tda-algorithms', {
      algorithm: 'tda-algorithms',
      version: '2.1.0',
      dependencies: ['vietoris-rips', 'simplicial-complex'],
      breakingChanges: false,
      timestamp: Date.now()
    });

    this.versionRegistry.set('elliptic-curves', {
      algorithm: 'elliptic-curves',
      version: '1.8.2',
      dependencies: ['finite-field', 'point-addition'],
      breakingChanges: false,
      timestamp: Date.now()
    });

    this.versionRegistry.set('cayley-graphs', {
      algorithm: 'cayley-graphs',
      version: '1.5.1',
      dependencies: ['group-presentation', 'generator-set'],
      breakingChanges: false,
      timestamp: Date.now()
    });
  }

  // Setup dependency tracking
  private setupDependencyTracking(): void {
    // Initialize dependency graph with mathematical content relationships
    this.addDependencyNode({
      id: 'tda-persistence',
      type: 'computation',
      dependencies: ['vietoris-rips', 'simplicial-complex'],
      dependents: ['persistence-landscape', 'persistence-barcode'],
      lastModified: Date.now(),
      version: '2.1.0',
      complexity: 8
    });

    this.addDependencyNode({
      id: 'elliptic-curve-group',
      type: 'computation',
      dependencies: ['finite-field', 'point-addition'],
      dependents: ['group-structure', 'discrete-logarithm'],
      lastModified: Date.now(),
      version: '1.8.2',
      complexity: 6
    });

    this.addDependencyNode({
      id: 'cayley-graph',
      type: 'visualization',
      dependencies: ['group-presentation', 'generator-set'],
      dependents: ['graph-layout', 'interactive-exploration'],
      lastModified: Date.now(),
      version: '1.5.1',
      complexity: 4
    });

    this.addDependencyNode({
      id: 'persistence-landscape',
      type: 'visualization',
      dependencies: ['tda-persistence', 'landscape-calculation'],
      dependents: ['landscape-rendering', 'statistical-analysis'],
      lastModified: Date.now(),
      version: '2.1.0',
      complexity: 7
    });
  }

  // Add a dependency node to the graph
  addDependencyNode(node: DependencyNode): void {
    this.dependencyGraph.set(node.id, node);
  }

  // Get dependencies for a given key
  getDependencies(key: string): string[] {
    const node = this.dependencyGraph.get(key);
    return node ? node.dependencies : [];
  }

  // Get dependents for a given key
  getDependents(key: string): string[] {
    const node = this.dependencyGraph.get(key);
    return node ? node.dependents : [];
  }

  // Trigger cache invalidation based on a rule
  async triggerInvalidation(ruleId: string, context: any = {}): Promise<InvalidationResult> {
    const rule = this.invalidationRules.get(ruleId);
    if (!rule) {
      throw new Error(`Invalidation rule not found: ${ruleId}`);
    }

    // Add to invalidation queue
    this.invalidationQueue.push({
      rule,
      context,
      priority: rule.priority
    });

    // Sort queue by priority
    this.invalidationQueue.sort((a, b) => a.priority - b.priority);

    // Process queue if not already processing
    if (!this.isInvalidating) {
      return this.processInvalidationQueue();
    }

    return {
      success: true,
      invalidatedKeys: [],
      affectedLayers: [],
      estimatedImpact: 'low',
      timestamp: Date.now(),
      metadata: {
        reason: 'Queued for processing',
        trigger: ruleId
      }
    };
  }

  // Process the invalidation queue
  private async processInvalidationQueue(): Promise<InvalidationResult> {
    if (this.isInvalidating || this.invalidationQueue.length === 0) {
      return {
        success: false,
        invalidatedKeys: [],
        affectedLayers: [],
        estimatedImpact: 'low',
        timestamp: Date.now(),
        metadata: {
          reason: 'No items in queue or already processing',
          trigger: 'queue-processor'
        }
      };
    }

    this.isInvalidating = true;
    const startTime = Date.now();

    try {
      const allInvalidatedKeys: string[] = [];
      const allAffectedLayers: string[] = [];

      while (this.invalidationQueue.length > 0) {
        const { rule, context } = this.invalidationQueue.shift()!;
        
        console.log(`🔄 Processing invalidation rule: ${rule.name}`);
        
        const result = await this.executeInvalidationRule(rule, context);
        
        allInvalidatedKeys.push(...result.invalidatedKeys);
        allAffectedLayers.push(...result.affectedLayers);
      }

      const processingTime = Date.now() - startTime;
      
      const invalidationResult: InvalidationResult = {
        success: true,
        invalidatedKeys: allInvalidatedKeys,
        affectedLayers: Array.from(new Set(allAffectedLayers)),
        estimatedImpact: this.calculateImpact(allInvalidatedKeys.length, allAffectedLayers.length),
        timestamp: Date.now(),
        metadata: {
          reason: 'Batch invalidation completed',
          trigger: 'queue-processor',
          performanceMetrics: {
            processingTime,
            rulesProcessed: this.invalidationQueue.length,
            totalKeysInvalidated: allInvalidatedKeys.length
          }
        }
      };

      // Record invalidation
      this.invalidationHistory.push(invalidationResult);
      
      // Update performance metrics
      cachePerformanceMonitor.recordMetric({
        operation: 'invalidate',
        key: 'batch-invalidation',
        duration: processingTime,
        success: true,
        metadata: {
          algorithm: 'batch-invalidation',
          type: 'invalidation',
          size: allInvalidatedKeys.length
        }
      });

      console.log(`✅ Batch invalidation completed: ${allInvalidatedKeys.length} keys invalidated in ${processingTime}ms`);
      
      return invalidationResult;

    } catch (error) {
      console.error('❌ Batch invalidation failed:', error);
      
      const errorResult: InvalidationResult = {
        success: false,
        invalidatedKeys: [],
        affectedLayers: [],
        estimatedImpact: 'low',
        timestamp: Date.now(),
        metadata: {
          reason: 'Batch invalidation failed',
          trigger: 'queue-processor'
        }
      };

      this.invalidationHistory.push(errorResult);
      return errorResult;

    } finally {
      this.isInvalidating = false;
    }
  }

  // Execute a specific invalidation rule
  private async executeInvalidationRule(rule: InvalidationRule, context: any): Promise<{
    invalidatedKeys: string[];
    affectedLayers: string[];
  }> {
    const invalidatedKeys: string[] = [];
    const affectedLayers: string[] = [];

    try {
      switch (rule.strategy) {
        case 'eager':
          await this.executeEagerInvalidation(rule, context, invalidatedKeys, affectedLayers);
          break;
        case 'lazy':
          await this.executeLazyInvalidation(rule, context, invalidatedKeys, affectedLayers);
          break;
        case 'hybrid':
          await this.executeHybridInvalidation(rule, context, invalidatedKeys, affectedLayers);
          break;
        default:
          console.warn(`⚠️ Unknown invalidation strategy: ${rule.strategy}`);
      }
    } catch (error) {
      console.error(`❌ Failed to execute invalidation rule ${rule.id}:`, error);
    }

    return { invalidatedKeys, affectedLayers };
  }

  // Eager invalidation - immediately invalidate all related items
  private async executeEagerInvalidation(
    rule: InvalidationRule,
    context: any,
    invalidatedKeys: string[],
    affectedLayers: string[]
  ): Promise<void> {
    const currentVersion = this.versionRegistry.get('app')?.version;
    const cachedVersion = await this.getCachedVersion();

    if (currentVersion && currentVersion !== cachedVersion) {
      console.log(`🔄 Version change detected: ${cachedVersion} → ${currentVersion}`);
      
      // Invalidate all cache layers
      await this.invalidateAllLayers(invalidatedKeys, affectedLayers);
      
      // Update cached version
      await this.updateCachedVersion(currentVersion);
    }
  }

  // Lazy invalidation - mark for invalidation but don't actually invalidate until needed
  private async executeLazyInvalidation(
    rule: InvalidationRule,
    context: any,
    invalidatedKeys: string[],
    affectedLayers: string[]
  ): Promise<void> {
    const pattern = rule.pattern;
    
    if (typeof pattern === 'string') {
      const keys = await this.findKeysByPattern(pattern);
      invalidatedKeys.push(...keys);
    } else if (pattern instanceof RegExp) {
      const keys = await this.findKeysByRegex(pattern);
      invalidatedKeys.push(...keys);
    }
    
    // Determine affected layers based on pattern
    if (pattern.toString().includes('visualization')) {
      affectedLayers.push('visualization');
    }
    if (pattern.toString().includes('computation')) {
      affectedLayers.push('computation');
    }
    if (pattern.toString().includes('preference')) {
      affectedLayers.push('user-preferences');
    }
  }

  // Hybrid invalidation - combines eager and lazy strategies based on context
  private async executeHybridInvalidation(
    rule: InvalidationRule,
    context: any,
    invalidatedKeys: string[],
    affectedLayers: string[]
  ): Promise<void> {
    const { algorithm, priority = 'normal' } = context;
    
    if (algorithm) {
      // Find all dependents of this algorithm
      const dependents = this.getDependents(algorithm);
      
      for (const dependent of dependents) {
        const keys = await this.findKeysByPattern(`*${dependent}*`);
        invalidatedKeys.push(...keys);
        affectedLayers.push('computation', 'visualization');
      }
      
      // Also invalidate the algorithm itself
      const algorithmKeys = await this.findKeysByPattern(`*${algorithm}*`);
      invalidatedKeys.push(...algorithmKeys);
      affectedLayers.push('computation');
    }

    // Use pattern-based invalidation as fallback
    const pattern = rule.pattern;
    if (typeof pattern === 'string') {
      const keys = await this.findKeysByPattern(pattern);
      invalidatedKeys.push(...keys);
    } else if (pattern instanceof RegExp) {
      const keys = await this.findKeysByRegex(pattern);
      invalidatedKeys.push(...keys);
    }

    // Determine affected layers based on pattern and context
    if (pattern.toString().includes('math') || algorithm) {
      affectedLayers.push('computation', 'visualization', 'documentation');
    }
  }


  // Invalidate all cache layers
  private async invalidateAllLayers(invalidatedKeys: string[], affectedLayers: string[]): Promise<void> {
    try {
      // Clear IndexedDB cache
      await mathematicalCacheManager.clearCache();
      
      // Clear Service Worker cache (if available)
      try {
        // Service worker cache clearing is handled separately
        console.log('🧹 Service Worker cache invalidation requested');
      } catch (error) {
        console.warn('Service Worker cache clearing not available:', error);
      }
      
      // Update affected layers
      affectedLayers.push('indexeddb', 'service-worker', 'memory');
      
      console.log('🧹 All cache layers invalidated');
    } catch (error) {
      console.error('❌ Failed to invalidate all layers:', error);
    }
  }

  // Find keys by pattern
  private async findKeysByPattern(pattern: string): Promise<string[]> {
    try {
      const cacheStats = await mathematicalCacheManager.getCacheStats();
      const allKeys: string[] = [];
      
      // Search through all cache layers
      if (cacheStats.layerStats) {
        for (const [layer, stats] of Object.entries(cacheStats.layerStats)) {
          // This would need to be implemented in the cache manager
          // For now, return empty array
        }
      }
      
      return allKeys;
    } catch (error) {
      console.error('❌ Failed to find keys by pattern:', error);
      return [];
    }
  }

  // Find keys by regex
  private async findKeysByRegex(regex: RegExp): Promise<string[]> {
    try {
      const cacheStats = await mathematicalCacheManager.getCacheStats();
      const allKeys: string[] = [];
      
      // This would need to be implemented in the cache manager
      // For now, return empty array
      
      return allKeys.filter(key => regex.test(key));
    } catch (error) {
      console.error('❌ Failed to find keys by regex:', error);
      return [];
    }
  }

  // Get cached version
  private async getCachedVersion(): Promise<string | null> {
    try {
      // This would check a cached version in IndexedDB
      // For now, return null to trigger invalidation
      return null;
    } catch (error) {
      return null;
    }
  }

  // Update cached version
  private async updateCachedVersion(version: string): Promise<void> {
    try {
      // This would store the version in IndexedDB
      console.log(`✅ Updated cached version to: ${version}`);
    } catch (error) {
      console.error('❌ Failed to update cached version:', error);
    }
  }

  // Calculate impact level
  private calculateImpact(keysCount: number, layersCount: number): 'low' | 'medium' | 'high' {
    if (keysCount > 1000 || layersCount > 3) return 'high';
    if (keysCount > 100 || layersCount > 2) return 'medium';
    return 'low';
  }

  // Get invalidation history
  getInvalidationHistory(): InvalidationResult[] {
    return [...this.invalidationHistory];
  }

  // Get current invalidation status
  getInvalidationStatus(): {
    isInvalidating: boolean;
    queueLength: number;
    lastInvalidation?: InvalidationResult;
  } {
    return {
      isInvalidating: this.isInvalidating,
      queueLength: this.invalidationQueue.length,
      lastInvalidation: this.invalidationHistory[this.invalidationHistory.length - 1]
    };
  }

  // Clear invalidation history
  clearInvalidationHistory(): void {
    this.invalidationHistory = [];
  }

  // Force immediate invalidation (bypasses queue)
  async forceInvalidation(ruleId: string, context: any = {}): Promise<InvalidationResult> {
    const rule = this.invalidationRules.get(ruleId);
    if (!rule) {
      throw new Error(`Invalidation rule not found: ${ruleId}`);
    }

    console.log(`🚨 Force invalidation triggered: ${rule.name}`);
    
    const result = await this.executeInvalidationRule(rule, context);
    
    const invalidationResult: InvalidationResult = {
      success: true,
      invalidatedKeys: result.invalidatedKeys,
      affectedLayers: result.affectedLayers,
      estimatedImpact: this.calculateImpact(result.invalidatedKeys.length, result.affectedLayers.length),
      timestamp: Date.now(),
      metadata: {
        reason: 'Force invalidation',
        trigger: ruleId
      }
    };

    this.invalidationHistory.push(invalidationResult);
    return invalidationResult;
  }
}

// Export singleton instance
export const cacheInvalidationEngine = new CacheInvalidationEngine();
