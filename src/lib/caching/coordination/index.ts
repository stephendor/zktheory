// Multi-Layer Cache Coordination Module Export
// Provides unified access to the advanced caching coordination system

export { CacheCoordinator, cacheCoordinator } from './CacheCoordinator';
export type { 
  CacheCoordinatorConfig, 
  LayerRoutingStrategy, 
  CacheResponse 
} from './CacheCoordinator';
export { testCacheCoordinator } from './CacheCoordinator.test';
