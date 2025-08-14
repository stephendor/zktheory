import '@testing-library/jest-dom'

// Import and register mathematical validation matchers
import { mathematicalMatchers } from './src/__tests__/utils/mathematicalValidation.ts'
expect.extend(mathematicalMatchers)

// Mock TDA engine for testing (pure JavaScript implementation)
global.mockTDAEngine = {
  set_points: jest.fn(),
  compute_vietoris_rips: jest.fn(),
  compute_persistence: jest.fn().mockReturnValue([
    { birth: 0, death: 0.1, dimension: 0 },
    { birth: 0, death: 0.15, dimension: 0 },
    { birth: 0, death: 0.3, dimension: 1 },
    { birth: 0.05, death: 0.25, dimension: 1 },
  ]),
}

// Mock ResizeObserver for mathematical visualizations
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver for performance optimizations
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock performance API for mathematical performance tests
Object.defineProperty(global.performance, 'memory', {
  value: {
    usedJSHeapSize: 1024 * 1024, // 1MB
    totalJSHeapSize: 2048 * 1024, // 2MB
    jsHeapSizeLimit: 4096 * 1024, // 4MB
  },
  writable: false,
})

// Mock canvas for 3D rendering tests
HTMLCanvasElement.prototype.getContext = jest.fn().mockImplementation((contextType) => {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return {
      // Mock WebGL context for Three.js tests
      createShader: jest.fn(),
      shaderSource: jest.fn(),
      compileShader: jest.fn(),
      getShaderParameter: jest.fn().mockReturnValue(true),
      createProgram: jest.fn(),
      attachShader: jest.fn(),
      linkProgram: jest.fn(),
      getProgramParameter: jest.fn().mockReturnValue(true),
      useProgram: jest.fn(),
      createBuffer: jest.fn(),
      bindBuffer: jest.fn(),
      bufferData: jest.fn(),
      enable: jest.fn(),
      viewport: jest.fn(),
      clear: jest.fn(),
      clearColor: jest.fn(),
      drawArrays: jest.fn(),
      drawElements: jest.fn(),
    }
  }
  
  if (contextType === '2d') {
    return {
      // Mock 2D context for mathematical visualizations
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      strokeRect: jest.fn(),
      fillText: jest.fn(),
      measureText: jest.fn().mockReturnValue({ width: 100 }),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      arc: jest.fn(),
      scale: jest.fn(),
      translate: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
    }
  }
  
  return null
})

// Mock URL.createObjectURL for file export tests
global.URL.createObjectURL = jest.fn().mockReturnValue('mock-url')
global.URL.revokeObjectURL = jest.fn()

// Mock file reader for data import tests
global.FileReader = jest.fn().mockImplementation(() => ({
  readAsText: jest.fn(),
  readAsDataURL: jest.fn(),
  onload: null,
  onerror: null,
  result: null,
}))

// Mock clipboard API for mathematical expression copying
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue(''),
  },
})

// Enhanced mathematical test utilities for comprehensive testing
global.testUtils = {
  // Helper for testing mathematical accuracy with configurable tolerance
  expectMathematicalAccuracy: (computed, expected, tolerance = 1e-10) => {
    if (typeof computed !== 'number' || typeof expected !== 'number') {
      throw new Error('Both computed and expected values must be numbers')
    }
    if (isNaN(computed) || isNaN(expected)) {
      throw new Error('Computed or expected value is NaN')
    }
    expect(Math.abs(computed - expected)).toBeLessThan(tolerance)
  },
  
  // Enhanced helper for testing persistence intervals
  expectValidPersistenceInterval: (interval) => {
    expect(interval).toHaveProperty('birth')
    expect(interval).toHaveProperty('death')
    expect(interval).toHaveProperty('dimension')
    
    expect(typeof interval.birth).toBe('number')
    expect(typeof interval.death).toBe('number')
    expect(typeof interval.dimension).toBe('number')
    
    expect(isFinite(interval.birth)).toBe(true)
    expect(isFinite(interval.death)).toBe(true)
    expect(Number.isInteger(interval.dimension)).toBe(true)
    
    expect(interval.birth).toBeLessThanOrEqual(interval.death)
    expect(interval.dimension).toBeGreaterThanOrEqual(0)
    expect(interval.dimension).toBeLessThanOrEqual(10) // Reasonable upper bound
  },
  
  // Enhanced helper for testing Cayley graph structure
  expectValidCayleyGraph: (graph) => {
    expect(graph).toHaveProperty('vertices')
    expect(graph).toHaveProperty('edges')
    expect(graph).toHaveProperty('generators')
    
    expect(Array.isArray(graph.vertices)).toBe(true)
    expect(Array.isArray(graph.edges)).toBe(true)
    expect(Array.isArray(graph.generators)).toBe(true)
    
    // Validate vertices
    graph.vertices.forEach(vertex => {
      expect(vertex).toHaveProperty('id')
      expect(vertex).toHaveProperty('x')
      expect(vertex).toHaveProperty('y')
      expect(typeof vertex.id).toBe('string')
      expect(typeof vertex.x).toBe('number')
      expect(typeof vertex.y).toBe('number')
      expect(isFinite(vertex.x)).toBe(true)
      expect(isFinite(vertex.y)).toBe(true)
    })
    
    // Validate edges
    graph.edges.forEach(edge => {
      expect(edge).toHaveProperty('source')
      expect(edge).toHaveProperty('target')
      expect(typeof edge.source).toBe('string')
      expect(typeof edge.target).toBe('string')
    })
  },
  
  // Helper for testing group theory properties
  expectValidGroup: (group) => {
    expect(group).toHaveProperty('name')
    expect(group).toHaveProperty('order')
    expect(group).toHaveProperty('elements')
    expect(group).toHaveProperty('operations')
    expect(group).toHaveProperty('isAbelian')
    
    expect(typeof group.name).toBe('string')
    expect(typeof group.order).toBe('number')
    expect(typeof group.isAbelian).toBe('boolean')
    expect(Array.isArray(group.elements)).toBe(true)
    expect(group.elements.length).toBe(group.order)
    
    // Validate elements
    group.elements.forEach(element => {
      expect(element).toHaveProperty('id')
      expect(element).toHaveProperty('order')
      expect(element).toHaveProperty('inverse')
      expect(typeof element.id).toBe('string')
      expect(typeof element.order).toBe('number')
      expect(typeof element.inverse).toBe('string')
      expect(element.order).toBeGreaterThan(0)
    })
    
    // Validate operations map
    expect(group.operations instanceof Map).toBe(true)
    expect(group.operations.size).toBe(group.order)
  },
  
  // Helper for testing elliptic curve points
  expectValidEllipticCurvePoint: (point, curve) => {
    expect(point).toHaveProperty('x')
    expect(point).toHaveProperty('y')
    expect(point).toHaveProperty('isIdentity')
    
    expect(typeof point.isIdentity).toBe('boolean')
    
    if (!point.isIdentity) {
      expect(typeof point.x).toBe('number')
      expect(typeof point.y).toBe('number')
      expect(Number.isInteger(point.x)).toBe(true)
      expect(Number.isInteger(point.y)).toBe(true)
      expect(point.x).toBeGreaterThanOrEqual(0)
      expect(point.y).toBeGreaterThanOrEqual(0)
      
      if (curve) {
        expect(point.x).toBeLessThan(curve.p)
        expect(point.y).toBeLessThan(curve.p)
      }
    }
  },
  
  // Helper for performance testing
  expectPerformance: (operation, maxTimeMs = 100) => {
    const startTime = performance.now()
    const result = operation()
    const endTime = performance.now()
    const duration = endTime - startTime
    
    expect(duration).toBeLessThan(maxTimeMs)
    return { result, duration }
  },
  
  // Helper for memory usage testing
  expectMemoryUsage: (operation, maxMemoryMB = 50) => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0
    const result = operation()
    const finalMemory = performance.memory?.usedJSHeapSize || 0
    const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024)
    
    expect(memoryIncrease).toBeLessThan(maxMemoryMB)
    return { result, memoryIncrease }
  },
  
  // Helper for testing statistical properties
  expectStatisticalProperties: (values, expectedMean, tolerance = 0.1) => {
    expect(Array.isArray(values)).toBe(true)
    expect(values.length).toBeGreaterThan(0)
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    
    if (expectedMean !== undefined) {
      expect(Math.abs(mean - expectedMean)).toBeLessThan(tolerance)
    }
    
    return { mean, variance, stdDev }
  },
  
  // Helper for testing deterministic behavior
  expectDeterministicBehavior: (operation, iterations = 5) => {
    const results = []
    for (let i = 0; i < iterations; i++) {
      results.push(operation())
    }
    
    // All results should be identical for deterministic operations
    const firstResult = JSON.stringify(results[0])
    results.forEach((result, index) => {
      expect(JSON.stringify(result)).toBe(firstResult)
    })
    
    return results[0]
  },
  
  // Helper for testing mathematical invariants
  expectMathematicalInvariant: (values, invariantFunction, tolerance = 1e-10) => {
    expect(Array.isArray(values)).toBe(true)
    expect(typeof invariantFunction).toBe('function')
    
    const invariantValues = values.map(invariantFunction)
    const firstInvariant = invariantValues[0]
    
    invariantValues.forEach(invariant => {
      expect(Math.abs(invariant - firstInvariant)).toBeLessThan(tolerance)
    })
    
    return firstInvariant
  },
  
  // Helper for testing numerical stability
  expectNumericalStability: (operation, perturbation = 1e-8, tolerance = 1e-6) => {
    const originalResult = operation(0)
    const perturbedResult = operation(perturbation)
    
    if (typeof originalResult === 'number' && typeof perturbedResult === 'number') {
      const relativeDifference = Math.abs((perturbedResult - originalResult) / originalResult)
      expect(relativeDifference).toBeLessThan(tolerance)
    }
    
    return { originalResult, perturbedResult }
  },
  
  // Helper for testing matrix properties (for future linear algebra needs)
  expectValidMatrix: (matrix, rows, cols) => {
    expect(Array.isArray(matrix)).toBe(true)
    expect(matrix.length).toBe(rows)
    
    matrix.forEach(row => {
      expect(Array.isArray(row)).toBe(true)
      expect(row.length).toBe(cols)
      row.forEach(element => {
        expect(typeof element).toBe('number')
        expect(isFinite(element)).toBe(true)
      })
    })
  },
  
  // Helper for testing complex numbers (for future use)
  expectValidComplexNumber: (complex) => {
    expect(complex).toHaveProperty('real')
    expect(complex).toHaveProperty('imag')
    expect(typeof complex.real).toBe('number')
    expect(typeof complex.imag).toBe('number')
    expect(isFinite(complex.real)).toBe(true)
    expect(isFinite(complex.imag)).toBe(true)
  },
  
  // Helper for testing function continuity
  expectContinuity: (func, points, tolerance = 1e-6) => {
    expect(typeof func).toBe('function')
    expect(Array.isArray(points)).toBe(true)
    
    points.forEach(point => {
      const epsilon = 1e-8
      const leftLimit = func(point - epsilon)
      const rightLimit = func(point + epsilon)
      const functionValue = func(point)
      
      expect(Math.abs(leftLimit - functionValue)).toBeLessThan(tolerance)
      expect(Math.abs(rightLimit - functionValue)).toBeLessThan(tolerance)
    })
  },
}

// Increase timeout for mathematical computation tests
jest.setTimeout(15000)