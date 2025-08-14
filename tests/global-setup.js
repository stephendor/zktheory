/**
 * Global Setup for Mathematical Testing Suite
 * Configures environment for mathematical computation testing
 */

module.exports = async () => {
  console.log('\n🧮 Setting up Mathematical Testing Environment...\n');
  
  // Set up mathematical constants
  global.__MATHEMATICAL_CONSTANTS__ = {
    PI: Math.PI,
    E: Math.E,
    GOLDEN_RATIO: (1 + Math.sqrt(5)) / 2,
    EULER_GAMMA: 0.5772156649015329,
  };
  
  // Set up performance monitoring
  global.__PERFORMANCE_BASELINE__ = {
    startTime: Date.now(),
    initialMemory: process.memoryUsage(),
  };
  
  // Configure mathematical precision
  global.__MATHEMATICAL_PRECISION__ = {
    DEFAULT_TOLERANCE: 1e-10,
    FLOAT_TOLERANCE: 1e-6,
    STATISTICAL_TOLERANCE: 1e-3,
  };
  
  // Set up test data generators
  global.__TEST_DATA_GENERATORS__ = {
    randomPoints: (count, bounds = { xMin: 0, xMax: 10, yMin: 0, yMax: 10 }) => {
      return Array.from({ length: count }, () => [
        Math.random() * (bounds.xMax - bounds.xMin) + bounds.xMin,
        Math.random() * (bounds.yMax - bounds.yMin) + bounds.yMin
      ]);
    },
    
    circularPoints: (count, radius = 1, center = [0, 0]) => {
      return Array.from({ length: count }, (_, i) => {
        const angle = (2 * Math.PI * i) / count;
        return [
          center[0] + radius * Math.cos(angle),
          center[1] + radius * Math.sin(angle)
        ];
      });
    },
    
    gridPoints: (rows, cols, spacing = 1) => {
      const points = [];
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          points.push([i * spacing, j * spacing]);
        }
      }
      return points;
    },
    
    clusteredPoints: (numClusters, pointsPerCluster, clusterRadius = 1) => {
      const points = [];
      for (let c = 0; c < numClusters; c++) {
        const centerX = Math.random() * 20 - 10;
        const centerY = Math.random() * 20 - 10;
        
        for (let p = 0; p < pointsPerCluster; p++) {
          const angle = Math.random() * 2 * Math.PI;
          const distance = Math.random() * clusterRadius;
          points.push([
            centerX + distance * Math.cos(angle),
            centerY + distance * Math.sin(angle)
          ]);
        }
      }
      return points;
    }
  };
  
  // Set up mathematical validation functions
  global.__MATHEMATICAL_VALIDATORS__ = {
    isValidGroup: (group) => {
      if (!group || typeof group !== 'object') return false;
      if (!group.elements || !Array.isArray(group.elements)) return false;
      if (!group.operations || !(group.operations instanceof Map)) return false;
      if (typeof group.order !== 'number' || group.order <= 0) return false;
      if (group.elements.length !== group.order) return false;
      return true;
    },
    
    isValidPersistenceInterval: (interval) => {
      if (!interval || typeof interval !== 'object') return false;
      if (typeof interval.birth !== 'number' || typeof interval.death !== 'number') return false;
      if (typeof interval.dimension !== 'number' || !Number.isInteger(interval.dimension)) return false;
      if (interval.birth > interval.death) return false;
      if (interval.dimension < 0) return false;
      return true;
    },
    
    hasValidTopology: (intervals) => {
      if (!Array.isArray(intervals)) return false;
      
      // Check for at least one H0 component
      const h0Intervals = intervals.filter(i => i.dimension === 0);
      if (h0Intervals.length === 0) return false;
      
      // Check that all intervals are valid
      return intervals.every(global.__MATHEMATICAL_VALIDATORS__.isValidPersistenceInterval);
    }
  };
  
  // Set up benchmark data
  global.__BENCHMARK_DATA__ = {
    smallPointCloud: global.__TEST_DATA_GENERATORS__.randomPoints(10),
    mediumPointCloud: global.__TEST_DATA_GENERATORS__.randomPoints(50),
    largePointCloud: global.__TEST_DATA_GENERATORS__.randomPoints(200),
    circularData: global.__TEST_DATA_GENERATORS__.circularPoints(20, 2),
    gridData: global.__TEST_DATA_GENERATORS__.gridPoints(5, 5),
    clusteredData: global.__TEST_DATA_GENERATORS__.clusteredPoints(3, 10, 1.5)
  };
  
  // Configure test timeouts based on operation complexity
  global.__TEST_TIMEOUTS__ = {
    UNIT_TEST: 5000,
    INTEGRATION_TEST: 10000,
    PERFORMANCE_TEST: 15000,
    E2E_TEST: 30000
  };
  
  // Set up statistical testing utilities
  global.__STATISTICAL_UTILS__ = {
    mean: (values) => values.reduce((sum, val) => sum + val, 0) / values.length,
    
    variance: (values) => {
      const mean = global.__STATISTICAL_UTILS__.mean(values);
      return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    },
    
    standardDeviation: (values) => Math.sqrt(global.__STATISTICAL_UTILS__.variance(values)),
    
    chiSquaredTest: (observed, expected, alpha = 0.05) => {
      if (observed.length !== expected.length) return false;
      
      let chiSquared = 0;
      for (let i = 0; i < observed.length; i++) {
        if (expected[i] === 0) continue;
        chiSquared += Math.pow(observed[i] - expected[i], 2) / expected[i];
      }
      
      // Simplified: assume degrees of freedom = length - 1
      // Critical value for α = 0.05 and df = length - 1 (approximation)
      const criticalValue = 3.84 * (observed.length - 1); // Very rough approximation
      return chiSquared < criticalValue;
    }
  };
  
  // Set up performance monitoring
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark('test-suite-start');
  }
  
  console.log('✅ Mathematical testing environment configured');
  console.log(`📊 Benchmark datasets: ${Object.keys(global.__BENCHMARK_DATA__).length} prepared`);
  console.log(`🎯 Mathematical precision: ${global.__MATHEMATICAL_PRECISION__.DEFAULT_TOLERANCE}`);
  console.log(`⏱️  Performance monitoring: enabled\n`);
};