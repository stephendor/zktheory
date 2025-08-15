// Test file for CacheCoordinator functionality
// This demonstrates the integration and usage of the multi-layer cache coordination

import { cacheCoordinator } from '../coordination/CacheCoordinator';

/**
 * Simple test to verify CacheCoordinator functionality
 */
async function testCacheCoordinator() {
  console.log('🧪 Testing CacheCoordinator...');
  
  try {
    // Initialize the coordinator
    await cacheCoordinator.initialize();
    console.log('✅ CacheCoordinator initialized');

    // Test memory cache with user preference
    const prefData = { key: 'theme', value: 'dark', category: 'interface' };
    const setResponse = await cacheCoordinator.set('preference:theme', prefData);
    console.log('📝 Set preference:', setResponse.source);

    // Test retrieval
    const getResponse = await cacheCoordinator.get('preference:theme');
    console.log('📖 Get preference:', getResponse.source, getResponse.fromCache);

    // Test performance metrics
    const metrics = await cacheCoordinator.getPerformanceMetrics();
    console.log('📊 Performance metrics:', {
      hitRate: metrics.overall.hitRate,
      layerCount: metrics.layers.size,
      recommendations: metrics.recommendations.length
    });

    // Test invalidation
    await cacheCoordinator.invalidate('preference:*');
    console.log('🗑️ Cache invalidated');

    console.log('✅ CacheCoordinator test completed successfully');
    return true;

  } catch (error) {
    console.error('❌ CacheCoordinator test failed:', error);
    return false;
  }
}

// Export for use in other tests
export { testCacheCoordinator };

// Run test if this file is executed directly
if (typeof window !== 'undefined' && (window as any).__TEST_MODE__) {
  testCacheCoordinator();
}
