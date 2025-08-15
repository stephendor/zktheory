// Core types for the mathematical caching system

export interface MathematicalCacheSchema {
  computations: MathematicalComputation;
  visualizations: MathematicalVisualization;
  userPreferences: UserPreference;
}

export interface MathematicalComputation {
  id: string;
  algorithm: string;
  inputHash: string;
  result: any;
  complexity: number;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  metadata?: {
    inputSize: number;
    computationTime: number;
    memoryUsage?: number;
    accuracy?: number;
  };
}

export interface MathematicalVisualization {
  id: string;
  type: VisualizationType;
  data: any;
  renderOptions: any;
  timestamp: number;
  accessCount: number;
  metadata?: {
    dataSize: number;
    renderTime: number;
    viewport?: { width: number; height: number };
    zoomLevel?: number;
  };
}

export interface UserPreference {
  key: string;
  value: any;
  timestamp: number;
  category?: 'visualization' | 'computation' | 'interface' | 'performance';
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  averageLatency: number;
  storageEfficiency: number;
  layerStats: {
    indexeddb: LayerStats;
    serviceworker: LayerStats;
    cdn: LayerStats;
  };
}

export interface LayerStats {
  name: string;
  entries: number;
  size: number;
  hitRate: number;
  averageLatency: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  priority?: 'high' | 'medium' | 'low';
  layer?: 'indexeddb' | 'serviceworker' | 'cdn' | 'auto';
  compress?: boolean;
  encrypt?: boolean;
}

export interface CachePerformanceMetrics {
  hitRate: number;
  missRate: number;
  averageLatency: number;
  storageEfficiency: number;
  invalidationFrequency: number;
  warmingEffectiveness: number;
}

export interface CacheInvalidationEvent {
  type: 'version' | 'dependency' | 'manual' | 'expiration';
  target: string;
  timestamp: number;
  reason: string;
  affectedKeys: string[];
}

export interface MathematicalVersion {
  algorithm: string;
  version: string;
  dependencies: string[];
  breakingChanges: boolean;
  timestamp: number;
  changelog?: string;
}

// Export VersionInfo as alias for backward compatibility
export type VersionInfo = MathematicalVersion;

// Export InvalidationStrategy type
export type InvalidationStrategy = 'lazy' | 'eager' | 'hybrid';

export interface DependencyGraph {
  nodes: Map<string, Set<string>>;
  reverseNodes: Map<string, Set<string>>;
}

export interface CacheLayer {
  name: string;
  priority: number;
  get(key: string): Promise<any>;
  set(key: string, value: any, options?: CacheOptions): Promise<void>;
  invalidate(pattern: string): Promise<void>;
  getStats(): Promise<LayerStats>;
  clear(): Promise<void>;
}

export interface CoordinatedCacheMetrics {
  overall: CacheStats;
  layers: Map<string, LayerStats>;
  performance: CachePerformanceMetrics;
  recommendations: string[];
}

export interface AccessPattern {
  frequency: 'high' | 'medium' | 'low';
  latency: 'critical' | 'important' | 'normal';
  offline: boolean;
  global: boolean;
  size: 'small' | 'medium' | 'large';
}

export interface CacheWarmingStrategy {
  type: 'predictive' | 'usage-based' | 'dependency-based';
  priority: number;
  targetKeys: string[];
  conditions: {
    timeOfDay?: number[];
    userActivity?: string[];
    contentType?: string[];
  };
}

export interface CacheAnalytics {
  hitRate: number;
  invalidationFrequency: number;
  warmingEffectiveness: number;
  storageEfficiency: number;
  userBehavior: {
    frequentlyAccessed: string[];
    rarelyAccessed: string[];
    accessPatterns: Map<string, AccessPattern>;
  };
}

export interface InvalidationAnalytics {
  totalInvalidations: number;
  invalidationByType: Map<string, number>;
  cascadeEffects: Map<string, string[]>;
  performanceImpact: {
    before: CachePerformanceMetrics;
    after: CachePerformanceMetrics;
  };
}

// Utility types for mathematical operations
export type MathematicalAlgorithm = 
  | 'tda-persistence'
  | 'vietoris-rips'
  | 'elliptic-curve-group'
  | 'cayley-graph'
  | 'persistence-landscape'
  | 'mapper-construction'
  | 'point-cloud-analysis';

export type VisualizationType = 
  | 'cayley'
  | 'persistence'
  | 'tda'
  | 'elliptic'
  | 'general'
  | '3d-scatter'
  | 'persistence-diagram'
  | 'mapper-graph';

// Cache configuration types
export interface CacheConfig {
  maxSize: number; // in bytes
  defaultTTL: number; // in milliseconds
  compressionThreshold: number; // in bytes
  warmingEnabled: boolean;
  invalidationStrategy: 'lazy' | 'eager' | 'hybrid';
  layers: {
    indexeddb: IndexedDBConfig;
    serviceworker: ServiceWorkerConfig;
    cdn: CDNConfig;
  };
}

export interface IndexedDBConfig {
  enabled: boolean;
  maxSize: number;
  version: number;
  stores: string[];
  compression: boolean;
}

export interface ServiceWorkerConfig {
  enabled: boolean;
  cacheName: string;
  strategies: Map<string, string>;
  backgroundSync: boolean;
}

export interface CDNConfig {
  enabled: boolean;
  provider: string;
  cacheHeaders: Map<string, string>;
  preloading: boolean;
}
