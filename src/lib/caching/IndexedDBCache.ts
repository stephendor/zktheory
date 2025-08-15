import Dexie, { Table } from 'dexie';
import {
  MathematicalComputation,
  MathematicalVisualization,
  UserPreference,
  CacheStats,
  CacheOptions,
  LayerStats,
  MathematicalAlgorithm,
  VisualizationType
} from './types';

// Mathematical Cache Database using Dexie
export class MathematicalCacheDB extends Dexie {
  computations!: Table<MathematicalComputation>;
  visualizations!: Table<MathematicalVisualization>;
  userPreferences!: Table<UserPreference>;

  constructor() {
    super('MathematicalCacheDB');
    
    this.version(1).stores({
      computations: 'id, algorithm, inputHash, timestamp, accessCount, lastAccessed, complexity',
      visualizations: 'id, type, timestamp, accessCount',
      userPreferences: 'key, category, timestamp'
    });

    // Add indexes for better query performance
    this.version(2).stores({
      computations: 'id, algorithm, inputHash, timestamp, accessCount, lastAccessed, complexity, *metadata.inputSize',
      visualizations: 'id, type, timestamp, accessCount, *metadata.dataSize',
      userPreferences: 'key, category, timestamp'
    });
  }
}

// Cache Manager for IndexedDB operations
export class MathematicalCacheManager {
  private db: MathematicalCacheDB;
  private maxSize: number;
  private compressionThreshold: number;
  private isInitialized: boolean = false;

  constructor(maxSize: number = 100 * 1024 * 1024, compressionThreshold: number = 10 * 1024) {
    this.maxSize = maxSize;
    this.compressionThreshold = compressionThreshold;
    this.db = new MathematicalCacheDB();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.db.open();
      await this.clearExpiredCache();
      this.isInitialized = true;
      console.log('✅ Mathematical Cache Manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Mathematical Cache Manager:', error);
      throw error;
    }
  }

  async cacheComputation(
    algorithm: MathematicalAlgorithm,
    input: any,
    result: any,
    options?: CacheOptions
  ): Promise<void> {
    try {
      const inputHash = this.generateInputHash(input);
      const complexity = this.calculateComplexity(algorithm, input);
      
      const computation: MathematicalComputation = {
        id: `${algorithm}-${inputHash}`,
        algorithm,
        inputHash,
        result,
        complexity,
        timestamp: Date.now(),
        accessCount: 0,
        lastAccessed: Date.now(),
        metadata: {
          inputSize: this.estimateInputSize(input),
          computationTime: performance.now(),
          memoryUsage: this.estimateMemoryUsage(result)
        }
      };

      await this.db.computations.put(computation);
      await this.ensureStorageLimit();
      
      console.log(`✅ Cached computation: ${algorithm} (${inputHash})`);
    } catch (error) {
      console.error('❌ Failed to cache computation:', error);
      throw error;
    }
  }

  async getCachedComputation(
    algorithm: MathematicalAlgorithm,
    input: any
  ): Promise<any | null> {
    try {
      const inputHash = this.generateInputHash(input);
      const computation = await this.db.computations
        .where('id')
        .equals(`${algorithm}-${inputHash}`)
        .first();

      if (computation) {
        // Update access statistics
        await this.db.computations.update(computation.id, {
          accessCount: computation.accessCount + 1,
          lastAccessed: Date.now()
        });

        console.log(`✅ Cache hit: ${algorithm} (${inputHash})`);
        return computation.result;
      }

      console.log(`❌ Cache miss: ${algorithm} (${inputHash})`);
      return null;
    } catch (error) {
      console.error('❌ Failed to retrieve cached computation:', error);
      return null;
    }
  }

  async cacheVisualization(
    type: VisualizationType,
    data: any,
    renderOptions: any,
    options?: CacheOptions
  ): Promise<void> {
    try {
      const dataHash = this.generateDataHash(data, renderOptions);
      
      const visualization: MathematicalVisualization = {
        id: `${type}-${dataHash}`,
        type,
        data,
        renderOptions,
        timestamp: Date.now(),
        accessCount: 0,
        metadata: {
          dataSize: this.estimateDataSize(data),
          renderTime: performance.now()
        }
      };

      await this.db.visualizations.put(visualization);
      await this.ensureStorageLimit();
      
      console.log(`✅ Cached visualization: ${type} (${dataHash})`);
    } catch (error) {
      console.error('❌ Failed to cache visualization:', error);
      throw error;
    }
  }

  async getCachedVisualization(
    type: VisualizationType,
    data: any,
    renderOptions: any
  ): Promise<any | null> {
    try {
      const dataHash = this.generateDataHash(data, renderOptions);
      const visualization = await this.db.visualizations
        .where('id')
        .equals(`${type}-${dataHash}`)
        .first();

      if (visualization) {
        // Update access statistics
        await this.db.visualizations.update(visualization.id, {
          accessCount: visualization.accessCount + 1
        });

        console.log(`✅ Cache hit: ${type} (${dataHash})`);
        return {
          data: visualization.data,
          renderOptions: visualization.renderOptions
        };
      }

      console.log(`❌ Cache miss: ${type} (${dataHash})`);
      return null;
    } catch (error) {
      console.error('❌ Failed to retrieve cached visualization:', error);
      return null;
    }
  }

  async cacheUserPreference(
    key: string,
    value: any,
    category: string = 'interface'
  ): Promise<void> {
    try {
      const preference: UserPreference = {
        key,
        value,
        timestamp: Date.now(),
        category: category as any
      };

      await this.db.userPreferences.put(preference);
      console.log(`✅ Cached user preference: ${key}`);
    } catch (error) {
      console.error('❌ Failed to cache user preference:', error);
      throw error;
    }
  }

  async getUserPreference(key: string): Promise<any | null> {
    try {
      const preference = await this.db.userPreferences
        .where('key')
        .equals(key)
        .first();

      return preference?.value || null;
    } catch (error) {
      console.error('❌ Failed to retrieve user preference:', error);
      return null;
    }
  }

  async clearExpiredCache(): Promise<void> {
    try {
      const now = Date.now();
      const defaultTTL = 24 * 60 * 60 * 1000; // 24 hours

      // Clear expired computations
      await this.db.computations
        .where('timestamp')
        .below(now - defaultTTL)
        .delete();

      // Clear expired visualizations
      await this.db.visualizations
        .where('timestamp')
        .below(now - defaultTTL)
        .delete();

      console.log('🧹 Expired cache entries cleared');
    } catch (error) {
      console.error('❌ Failed to clear expired cache:', error);
    }
  }

  async getCacheStats(): Promise<CacheStats> {
    try {
      const computations = await this.db.computations.count();
      const visualizations = await this.db.visualizations.count();
      const userPreferences = await this.db.userPreferences.count();

      const totalEntries = computations + visualizations + userPreferences;
      
      // Calculate approximate size (rough estimation)
      const totalSize = await this.estimateTotalSize();
      
      // Calculate hit rate (this would need to be tracked separately in a real implementation)
      const hitRate = 0.75; // Placeholder - implement actual tracking
      const missRate = 1 - hitRate;
      
      // Calculate average latency (placeholder)
      const averageLatency = 5; // 5ms placeholder
      
      // Calculate storage efficiency
      const storageEfficiency = totalSize / this.maxSize;

      return {
        totalEntries,
        totalSize,
        hitRate,
        missRate,
        averageLatency,
        storageEfficiency,
        layerStats: {
          indexeddb: {
            name: 'IndexedDB',
            entries: totalEntries,
            size: totalSize,
            hitRate,
            averageLatency
          },
          serviceworker: {
            name: 'Service Worker',
            entries: 0,
            size: 0,
            hitRate: 0,
            averageLatency: 0
          },
          cdn: {
            name: 'CDN',
            entries: 0,
            size: 0,
            hitRate: 0,
            averageLatency: 0
          }
        }
      };
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error);
      throw error;
    }
  }

  async clearCache(): Promise<void> {
    try {
      await this.db.computations.clear();
      await this.db.visualizations.clear();
      await this.db.userPreferences.clear();
      console.log('🧹 Cache cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      await this.db.close();
      this.isInitialized = false;
      console.log('🔒 Cache database closed');
    } catch (error) {
      console.error('❌ Failed to close cache database:', error);
    }
  }

  // Private helper methods
  private generateInputHash(input: any): string {
    // Simple hash function for input data
    const inputStr = JSON.stringify(input);
    let hash = 0;
    for (let i = 0; i < inputStr.length; i++) {
      const char = inputStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private generateDataHash(data: any, renderOptions: any): string {
    const combined = { data, renderOptions };
    return this.generateInputHash(combined);
  }

  private calculateComplexity(algorithm: string, input: any): number {
    // Calculate complexity based on algorithm type and input size
    const baseComplexity = this.getAlgorithmBaseComplexity(algorithm);
    const inputSize = this.estimateInputSize(input);
    
    return baseComplexity * Math.log(inputSize + 1);
  }

  private getAlgorithmBaseComplexity(algorithm: string): number {
    const complexities: Record<string, number> = {
      'tda-persistence': 10,
      'vietoris-rips': 8,
      'elliptic-curve-group': 6,
      'cayley-graph': 4,
      'persistence-landscape': 7,
      'mapper-construction': 9,
      'point-cloud-analysis': 5
    };
    
    return complexities[algorithm] || 5;
  }

  private estimateInputSize(input: any): number {
    // Estimate input size in bytes
    const inputStr = JSON.stringify(input);
    return new Blob([inputStr]).size;
  }

  private estimateDataSize(data: any): number {
    // Estimate data size in bytes
    const dataStr = JSON.stringify(data);
    return new Blob([dataStr]).size;
  }

  private estimateMemoryUsage(result: any): number {
    // Estimate memory usage of result in bytes
    const resultStr = JSON.stringify(result);
    return new Blob([resultStr]).size;
  }

  private async estimateTotalSize(): Promise<number> {
    try {
      // This is a rough estimation - in production you'd want more accurate tracking
      const computations = await this.db.computations.toArray();
      const visualizations = await this.db.visualizations.toArray();
      const userPreferences = await this.db.userPreferences.toArray();

      let totalSize = 0;
      
      computations.forEach(comp => {
        totalSize += this.estimateMemoryUsage(comp.result);
        totalSize += this.estimateInputSize(comp);
      });

      visualizations.forEach(viz => {
        totalSize += this.estimateDataSize(viz.data);
        totalSize += this.estimateInputSize(viz.renderOptions);
      });

      userPreferences.forEach(pref => {
        totalSize += this.estimateInputSize(pref.value);
      });

      return totalSize;
    } catch (error) {
      console.error('❌ Failed to estimate total size:', error);
      return 0;
    }
  }

  private async ensureStorageLimit(): Promise<void> {
    try {
      const currentSize = await this.estimateTotalSize();
      
      if (currentSize > this.maxSize) {
        console.log(`⚠️ Storage limit exceeded (${currentSize} > ${this.maxSize}), cleaning up...`);
        await this.performLRUCleanup();
      }
    } catch (error) {
      console.error('❌ Failed to ensure storage limit:', error);
    }
  }

  private async performLRUCleanup(): Promise<void> {
    try {
      // Get least recently used entries
      const oldComputations = await this.db.computations
        .orderBy('lastAccessed')
        .limit(10)
        .toArray();

      const oldVisualizations = await this.db.visualizations
        .orderBy('lastAccessed')
        .limit(10)
        .toArray();

      // Delete oldest entries
      for (const comp of oldComputations) {
        await this.db.computations.delete(comp.id);
      }

      for (const viz of oldVisualizations) {
        await this.db.visualizations.delete(viz.id);
      }

      console.log(`🧹 Cleaned up ${oldComputations.length + oldVisualizations.length} old entries`);
    } catch (error) {
      console.error('❌ Failed to perform LRU cleanup:', error);
    }
  }
}

// Export singleton instance
export const mathematicalCacheManager = new MathematicalCacheManager();
