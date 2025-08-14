// Mock TDA engine module for testing (pure JavaScript)
export default {
  // Mock TDA engine functions
  set_points: jest.fn(),
  compute_vietoris_rips: jest.fn(),
  compute_persistence: jest.fn().mockReturnValue([
    { birth: 0, death: 0.1, dimension: 0 },
    { birth: 0, death: 0.15, dimension: 0 },
    { birth: 0, death: 0.3, dimension: 1 },
    { birth: 0.05, death: 0.25, dimension: 1 },
  ]),
  
  // Mock initialization functions
  initialize: jest.fn().mockResolvedValue(true),
  isReady: jest.fn().mockReturnValue(true),
  
  // Mock mathematical computations
  computeHomology: jest.fn().mockReturnValue({
    bettiNumbers: [1, 1, 0],
    homologyGroups: ['Z', 'Z', '0'],
  }),
  
  // Mock performance metrics
  getPerformanceMetrics: jest.fn().mockReturnValue({
    computationTime: 150,
    memoryUsage: 2048,
    triangleCount: 1000,
  }),
}