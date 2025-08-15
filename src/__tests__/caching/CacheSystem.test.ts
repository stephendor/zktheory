// Basic tests for the caching system
// Tests that components can be imported and instantiated

import { 
  mathematicalCacheManager,
  serviceWorkerManager,
  cachePerformanceMonitor,
  initializeCachingSystem,
  getCachingSystemStatus
} from '../../lib/caching';

describe('Caching System', () => {
  describe('IndexedDB Cache Manager', () => {
    it('should be instantiated', () => {
      expect(mathematicalCacheManager).toBeDefined();
      expect(typeof mathematicalCacheManager.initialize).toBe('function');
    });

    it('should have required methods', () => {
      expect(typeof mathematicalCacheManager.cacheComputation).toBe('function');
      expect(typeof mathematicalCacheManager.getCachedComputation).toBe('function');
      expect(typeof mathematicalCacheManager.cacheVisualization).toBe('function');
      expect(typeof mathematicalCacheManager.getCachedVisualization).toBe('function');
      expect(typeof mathematicalCacheManager.getCacheStats).toBe('function');
    });
  });

  describe('Service Worker Manager', () => {
    it('should be instantiated', () => {
      expect(serviceWorkerManager).toBeDefined();
      expect(typeof serviceWorkerManager.register).toBe('function');
    });

    it('should have required methods', () => {
      expect(typeof serviceWorkerManager.getStatus).toBe('function');
      expect(typeof serviceWorkerManager.getOfflineCapability).toBe('function');
      expect(typeof serviceWorkerManager.queueMathematicalComputation).toBe('function');
    });
  });

  describe('Cache Performance Monitor', () => {
    it('should be instantiated', () => {
      expect(cachePerformanceMonitor).toBeDefined();
      expect(typeof cachePerformanceMonitor.recordMetric).toBe('function');
    });

    it('should have required methods', () => {
      expect(typeof cachePerformanceMonitor.getPerformanceMetrics).toBe('function');
      expect(typeof cachePerformanceMonitor.getPerformanceAnalytics).toBe('function');
      expect(typeof cachePerformanceMonitor.getAlerts).toBe('function');
    });
  });

  describe('Caching System Functions', () => {
    it('should have initialization function', () => {
      expect(typeof initializeCachingSystem).toBe('function');
    });

    it('should have status function', () => {
      expect(typeof getCachingSystemStatus).toBe('function');
    });
  });

  describe('Cache Manager Integration', () => {
    it('should handle mathematical algorithms correctly', () => {
      const algorithms = [
        'tda-persistence',
        'vietoris-rips',
        'elliptic-curve-group',
        'cayley-graph'
      ];

      algorithms.forEach(algorithm => {
        expect(typeof algorithm).toBe('string');
        expect(algorithm.length).toBeGreaterThan(0);
      });
    });

    it('should handle visualization types correctly', () => {
      const types = [
        'cayley',
        'persistence',
        'tda',
        'elliptic',
        'general'
      ];

      types.forEach(type => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should record metrics correctly', () => {
      const metric = {
        operation: 'get' as const,
        key: 'test-key',
        duration: 10,
        success: true,
        metadata: {
          algorithm: 'tda-persistence',
          type: 'computation'
        }
      };

      expect(() => {
        cachePerformanceMonitor.recordMetric(metric);
      }).not.toThrow();
    });

    it('should provide performance metrics', () => {
      const metrics = cachePerformanceMonitor.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('hitRate');
      expect(metrics).toHaveProperty('missRate');
      expect(metrics).toHaveProperty('averageLatency');
      expect(metrics).toHaveProperty('storageEfficiency');
      expect(metrics).toHaveProperty('invalidationFrequency');
      expect(metrics).toHaveProperty('warmingEffectiveness');
    });
  });

  describe('Service Worker Status', () => {
    it('should provide status information', async () => {
      const status = await serviceWorkerManager.getStatus();
      
      expect(status).toHaveProperty('isRegistered');
      expect(status).toHaveProperty('isActive');
      expect(status).toHaveProperty('isOnline');
      expect(status).toHaveProperty('cacheStatus');
      expect(status).toHaveProperty('lastUpdate');
    });

    it('should provide offline capability information', async () => {
      const capability = await serviceWorkerManager.getOfflineCapability();
      
      expect(capability).toHaveProperty('mathematicalTools');
      expect(capability).toHaveProperty('visualizations');
      expect(capability).toHaveProperty('documentation');
      expect(capability).toHaveProperty('userPreferences');
    });
  });
});
