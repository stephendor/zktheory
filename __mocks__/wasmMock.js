// Mock TDA engine module for testing (pure JavaScript)
module.exports = function() {
  return {
    // Mock TDA engine functions
    set_points: () => {},
    compute_vietoris_rips: () => {},
    compute_persistence: () => [
      { birth: 0, death: 0.1, dimension: 0 },
      { birth: 0, death: 0.15, dimension: 0 },
      { birth: 0, death: 0.3, dimension: 1 },
      { birth: 0.05, death: 0.25, dimension: 1 },
    ],
    
    // Mock initialization functions
    initialize: () => Promise.resolve(true),
    isReady: () => true,
    
    // Mock mathematical computations
    computeHomology: () => ({
      bettiNumbers: [1, 1, 0],
      homologyGroups: ['Z', 'Z', '0'],
    }),
    
    // Mock performance metrics
    getPerformanceMetrics: () => ({
      computationTime: 150,
      memoryUsage: 2048,
      triangleCount: 1000,
    }),
  };
};