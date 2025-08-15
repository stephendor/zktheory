/**
 * Shared Mathematical Test Data and Fixtures
 * Comprehensive test data for mathematical operations, visualizations, and performance testing
 */

import type { Group, GroupElement } from '@/lib/GroupTheory';

/**
 * Mathematical constants for testing
 */
export const MathematicalConstants = {
  // Common mathematical values for precision testing
  PI: Math.PI,
  E: Math.E,
  GOLDEN_RATIO: (1 + Math.sqrt(5)) / 2,
  SQRT_2: Math.sqrt(2),
  SQRT_3: Math.sqrt(3),
  
  // Precision thresholds for floating-point comparisons
  EPSILON: 1e-10,
  FLOAT_EPSILON: 1e-6,
  DISPLAY_EPSILON: 1e-3,
  
  // Performance thresholds
  FAST_COMPUTATION_MS: 100,
  MEDIUM_COMPUTATION_MS: 500,
  SLOW_COMPUTATION_MS: 2000,
  
  // Memory thresholds (in MB)
  LOW_MEMORY_MB: 10,
  MEDIUM_MEMORY_MB: 50,
  HIGH_MEMORY_MB: 200
};

/**
 * Test group structures for group theory testing
 */
export class TestGroups {
  /**
   * Create a cyclic group of given order
   */
  static createCyclicGroup(order: number): Group {
    const elements: GroupElement[] = [];
    const operations = new Map<string, Map<string, string>>();

    // Create elements
    for (let i = 0; i < order; i++) {
      elements.push({
        id: i === 0 ? 'e' : `g${i}`,
        label: i === 0 ? 'e' : `g^${i}`,
        order: i === 0 ? 1 : order,
        inverse: i === 0 ? 'e' : `g${order - i}`,
        conjugacyClass: 0 // All elements in same conjugacy class for cyclic groups
      });
    }

    // Create operation table (addition modulo n)
    elements.forEach(a => {
      const aMap = new Map<string, string>();
      elements.forEach(b => {
        const aIndex = a.id === 'e' ? 0 : parseInt(a.id.substring(1));
        const bIndex = b.id === 'e' ? 0 : parseInt(b.id.substring(1));
        const resultIndex = (aIndex + bIndex) % order;
        const resultId = resultIndex === 0 ? 'e' : `g${resultIndex}`;
        aMap.set(b.id, resultId);
      });
      operations.set(a.id, aMap);
    });

    return {
      name: `Cyclic Group C${order}`,
      displayName: `Cyclic Group C${order}`,
      order,
      elements,
      operations,
      generators: order > 1 ? ['g1'] : ['e'],
      relations: order > 1 ? [`g1^${order} = e`] : [],
      isAbelian: true,
      center: elements.map(e => e.id),
      conjugacyClasses: elements.map(e => [e.id]),
      subgroups: this.generateSubgroups(elements, operations)
    };
  }

  /**
   * Create Klein four-group
   */
  static createKleinFourGroup(): Group {
    const elements: GroupElement[] = [
      { id: 'e', label: 'e', order: 1, inverse: 'e', conjugacyClass: 0 },
      { id: 'a', label: 'a', order: 2, inverse: 'a', conjugacyClass: 1 },
      { id: 'b', label: 'b', order: 2, inverse: 'b', conjugacyClass: 1 },
      { id: 'c', label: 'c', order: 2, inverse: 'c', conjugacyClass: 1 }
    ];

    const operations = new Map([
      ['e', new Map([['e', 'e'], ['a', 'a'], ['b', 'b'], ['c', 'c']])],
      ['a', new Map([['e', 'a'], ['a', 'e'], ['b', 'c'], ['c', 'b']])],
      ['b', new Map([['e', 'b'], ['a', 'c'], ['b', 'e'], ['c', 'a']])],
      ['c', new Map([['e', 'c'], ['a', 'b'], ['b', 'a'], ['c', 'e']])]
    ]);

    return {
      name: 'Klein Four-Group',
      displayName: 'Klein Four-Group',
      order: 4,
      elements,
      operations,
      generators: ['a', 'b'],
      relations: ['a^2 = e', 'b^2 = e', 'ab = ba'],
      isAbelian: true,
      center: ['e', 'a', 'b', 'c'],
      conjugacyClasses: [['e'], ['a'], ['b'], ['c']],
      subgroups: [
        { elements: ['e', 'a'], name: 'Subgroup A', isNormal: true },
        { elements: ['e', 'b'], name: 'Subgroup B', isNormal: true },
        { elements: ['e', 'c'], name: 'Subgroup C', isNormal: true }
      ]
    };
  }

  /**
   * Create symmetric group S3
   */
  static createSymmetricGroupS3(): Group {
    const elements: GroupElement[] = [
      { id: 'e', label: '()', order: 1, inverse: 'e', conjugacyClass: 0 },
      { id: 'a', label: '(12)', order: 2, inverse: 'a', conjugacyClass: 1 },
      { id: 'b', label: '(13)', order: 2, inverse: 'b', conjugacyClass: 1 },
      { id: 'c', label: '(23)', order: 2, inverse: 'c', conjugacyClass: 1 },
      { id: 'd', label: '(123)', order: 3, inverse: 'f', conjugacyClass: 2 },
      { id: 'f', label: '(132)', order: 3, inverse: 'd', conjugacyClass: 2 }
    ];

    const operations = new Map([
      ['e', new Map([['e', 'e'], ['a', 'a'], ['b', 'b'], ['c', 'c'], ['d', 'd'], ['f', 'f']])],
      ['a', new Map([['e', 'a'], ['a', 'e'], ['b', 'd'], ['c', 'f'], ['d', 'c'], ['f', 'b']])],
      ['b', new Map([['e', 'b'], ['a', 'f'], ['b', 'e'], ['c', 'd'], ['d', 'a'], ['f', 'c']])],
      ['c', new Map([['e', 'c'], ['a', 'd'], ['b', 'f'], ['c', 'e'], ['d', 'b'], ['f', 'a']])],
      ['d', new Map([['e', 'd'], ['a', 'b'], ['b', 'c'], ['c', 'a'], ['d', 'f'], ['f', 'e']])],
      ['f', new Map([['e', 'f'], ['a', 'c'], ['b', 'a'], ['c', 'b'], ['d', 'e'], ['f', 'd']])]
    ]);

    return {
      name: 'Symmetric Group S3',
      displayName: 'Symmetric Group S3',
      order: 6,
      elements,
      operations,
      generators: ['a', 'd'],
      relations: ['a^2 = e', 'd^3 = e', 'ad = da^2'],
      isAbelian: false,
      center: ['e'],
      conjugacyClasses: [['e'], ['a', 'b', 'c'], ['d', 'f']],
      subgroups: [
        { elements: ['e', 'a'], name: 'Subgroup A', isNormal: false },
        { elements: ['e', 'b'], name: 'Subgroup B', isNormal: false },
        { elements: ['e', 'c'], name: 'Subgroup C', isNormal: false },
        { elements: ['e', 'd', 'f'], name: 'Subgroup D', isNormal: true }
      ]
    };
  }

  /**
   * Generate subgroups for a given group
   */
  private static generateSubgroups(elements: GroupElement[], operations: Map<string, Map<string, string>>): { elements: string[]; name: string; isNormal: boolean }[] {
    const subgroups: { elements: string[]; name: string; isNormal: boolean }[] = [];
    
    // Add trivial subgroup
    subgroups.push({
      elements: ['e'],
      name: 'Trivial Subgroup',
      isNormal: true
    });
    
    // Add cyclic subgroups for each element
    elements.forEach(element => {
      if (element.id !== 'e') {
        const subgroupElements = [element.id];
        let current = element.id;
        
        // Generate the subgroup by repeated multiplication
        for (let i = 1; i < element.order; i++) {
          const next = operations.get(current)?.get(element.id);
          if (next && !subgroupElements.includes(next)) {
            subgroupElements.push(next);
            current = next;
          }
        }
        
        if (subgroupElements.length > 1) {
          subgroups.push({
            elements: subgroupElements,
            name: `Subgroup generated by ${element.id}`,
            isNormal: element.order === 2 // Order 2 elements generate normal subgroups in abelian groups
          });
        }
      }
    });
    
    return subgroups;
  }

  /**
   * Get a collection of standard test groups
   */
  static getStandardGroups(): Group[] {
    return [
      this.createCyclicGroup(1),
      this.createCyclicGroup(2),
      this.createCyclicGroup(3),
      this.createCyclicGroup(4),
      this.createCyclicGroup(5),
      this.createCyclicGroup(6),
      this.createCyclicGroup(8),
      this.createKleinFourGroup(),
      this.createSymmetricGroupS3()
    ];
  }

  /**
   * Get groups by order for testing
   */
  static getGroupsByOrder(order: number): Group[] {
    return this.getStandardGroups().filter(group => group.order === order);
  }
}

/**
 * Test data for Topological Data Analysis
 */
export class TDATestData {
  /**
   * Generate point cloud in various shapes for TDA testing
   */
  static generatePointCloud(shape: 'circle' | 'sphere' | 'torus' | 'random', size: number, dimensions: number = 2): number[][] {
    const points: number[][] = [];

    switch (shape) {
      case 'circle':
        for (let i = 0; i < size; i++) {
          const angle = (2 * Math.PI * i) / size;
          const radius = 1 + 0.1 * (Math.random() - 0.5); // Add small noise
          points.push([
            radius * Math.cos(angle),
            radius * Math.sin(angle)
          ]);
        }
        break;

      case 'sphere':
        for (let i = 0; i < size; i++) {
          // Generate points on unit sphere using spherical coordinates
          const theta = Math.random() * 2 * Math.PI; // Azimuthal angle
          const phi = Math.acos(2 * Math.random() - 1); // Polar angle
          const radius = 1 + 0.1 * (Math.random() - 0.5); // Add small noise
          
          points.push([
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
          ]);
        }
        break;

      case 'torus':
        const R = 2; // Major radius
        const r = 1; // Minor radius
        for (let i = 0; i < size; i++) {
          const u = Math.random() * 2 * Math.PI;
          const v = Math.random() * 2 * Math.PI;
          const noise = 0.1 * (Math.random() - 0.5);
          
          points.push([
            (R + r * Math.cos(v)) * Math.cos(u) + noise,
            (R + r * Math.cos(v)) * Math.sin(u) + noise,
            r * Math.sin(v) + noise
          ]);
        }
        break;

      case 'random':
      default:
        for (let i = 0; i < size; i++) {
          const point: number[] = [];
          for (let d = 0; d < dimensions; d++) {
            point.push(Math.random() * 10 - 5); // Random points in [-5, 5]
          }
          points.push(point);
        }
        break;
    }

    return points;
  }

  /**
   * Generate expected Betti numbers for standard shapes
   */
  static getExpectedBettiNumbers(shape: 'circle' | 'sphere' | 'torus' | 'random'): number[] {
    switch (shape) {
      case 'circle':
        return [1, 1, 0]; // b0=1, b1=1, b2=0
      case 'sphere':
        return [1, 0, 1]; // b0=1, b1=0, b2=1
      case 'torus':
        return [1, 2, 1]; // b0=1, b1=2, b2=1
      case 'random':
      default:
        return [1, 0, 0]; // Connected components, typically no higher homology
    }
  }

  /**
   * Generate test persistence intervals
   */
  static generatePersistenceIntervals(count: number): Array<{birth: number, death: number, dimension: number}> {
    const intervals: Array<{birth: number, death: number, dimension: number}> = [];
    
    for (let i = 0; i < count; i++) {
      const birth = Math.random() * 2;
      const death = birth + Math.random() * 3;
      const dimension = Math.floor(Math.random() * 3); // 0, 1, or 2
      
      intervals.push({ birth, death, dimension });
    }
    
    // Sort by birth time
    return intervals.sort((a, b) => a.birth - b.birth);
  }
}

/**
 * Test data for LaTeX rendering
 */
export class LaTeXTestData {
  static getBasicExpressions(): string[] {
    return [
      'x',
      'x^2',
      'x_i',
      'x_{ij}',
      '\\alpha',
      '\\beta',
      '\\gamma',
      '\\Delta',
      '\\Gamma',
      '\\sum',
      '\\int',
      '\\frac{1}{2}',
      '\\sqrt{x}',
      '\\sqrt[3]{x}'
    ];
  }

  static getIntermediateExpressions(): string[] {
    return [
      '\\frac{a}{b}',
      '\\frac{x^2 + y^2}{z}',
      '\\sum_{i=1}^{n} x_i',
      '\\int_{0}^{1} f(x) dx',
      '\\lim_{x \\to \\infty} f(x)',
      '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
      '\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}',
      'f: G \\to H',
      'x \\in \\mathbb{R}',
      '\\forall x \\in X',
      '\\exists y \\in Y',
      'A \\subseteq B',
      'A \\cup B',
      'A \\cap B'
    ];
  }

  static getComplexExpressions(): string[] {
    return [
      '\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}',
      '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
      '\\lim_{n \\to \\infty} \\left(1 + \\frac{1}{n}\\right)^n = e',
      '\\begin{align} E &= mc^2 \\\\ F &= ma \\end{align}',
      '\\begin{cases} x + y = 1 \\\\ x - y = 0 \\end{cases}',
      'H_n(X) \\cong \\bigoplus_{\\alpha} \\mathbb{Z}',
      '\\pi_1(S^1) \\cong \\mathbb{Z}',
      '\\text{Tor}(\\mathbb{Z}/n\\mathbb{Z}, \\mathbb{Z}/m\\mathbb{Z}) \\cong \\mathbb{Z}/\\gcd(n,m)\\mathbb{Z}',
      '\\sum_{k=0}^{n} \\binom{n}{k} x^k (1-x)^{n-k}',
      '\\oint_{\\partial D} \\omega = \\int_D d\\omega'
    ];
  }

  static getGroupTheoryExpressions(): string[] {
    return [
      'G = \\langle a, b \\mid a^n = b^m = 1, aba^{-1} = b^k \\rangle',
      '|G| = [G:H] \\cdot |H|',
      'G/N \\cong H',
      '\\text{Aut}(G)',
      '\\text{Inn}(G) \\triangleleft \\text{Aut}(G)',
      'Z(G) = \\{g \\in G \\mid gh = hg \\text{ for all } h \\in G\\}',
      'C_G(a) = \\{g \\in G \\mid ga = ag\\}',
      'N_G(H) = \\{g \\in G \\mid gHg^{-1} = H\\}',
      '\\text{Syl}_p(G)',
      'G \\cong H_1 \\times H_2 \\times \\cdots \\times H_k'
    ];
  }

  static getTDAExpressions(): string[] {
    return [
      'H_*(X; \\mathbb{F}) = \\bigoplus_{i=0}^{\\infty} H_i(X; \\mathbb{F})',
      '\\beta_i = \\dim H_i(X; \\mathbb{F})',
      'PD_i = \\{(x, y) \\in \\mathbb{R}^2 \\mid x < y\\}',
      '\\text{dgm}(f) = \\{(b_i, d_i)\\}_{i \\in I}',
      'W_p(\\text{dgm}_1, \\text{dgm}_2) = \\inf_{\\gamma} \\left(\\sum_{i} \\|p_i - \\gamma(p_i)\\|_\\infty^p\\right)^{1/p}',
      'VR_\\epsilon(X) = \\bigcup_{x \\in X} B_\\epsilon(x)',
      '\\check{C}(U) = \\bigoplus_{\\sigma \\in N(U)} \\mathbb{F}[\\sigma]',
      'H^*(X) = \\ker d^* / \\text{im } d^*',
      '\\chi(X) = \\sum_{i=0}^{\\infty} (-1)^i \\beta_i',
      'L(f) = \\sum_{x \\in \\text{Fix}(f)} (-1)^{\\text{ind}(x)}'
    ];
  }

  static getAllExpressions(): string[] {
    return [
      ...this.getBasicExpressions(),
      ...this.getIntermediateExpressions(),
      ...this.getComplexExpressions(),
      ...this.getGroupTheoryExpressions(),
      ...this.getTDAExpressions()
    ];
  }
}

/**
 * Performance test data and utilities
 */
export class PerformanceTestData {
  /**
   * Generate datasets of varying sizes for performance testing
   */
  static generateScalingDatasets(): Array<{size: number, data: any, expectedComplexity: string}> {
    return [
      {
        size: 10,
        data: TDATestData.generatePointCloud('random', 10, 2),
        expectedComplexity: 'O(n²)'
      },
      {
        size: 50,
        data: TDATestData.generatePointCloud('random', 50, 2),
        expectedComplexity: 'O(n²)'
      },
      {
        size: 100,
        data: TDATestData.generatePointCloud('random', 100, 2),
        expectedComplexity: 'O(n²)'
      },
      {
        size: 200,
        data: TDATestData.generatePointCloud('random', 200, 2),
        expectedComplexity: 'O(n²)'
      },
      {
        size: 500,
        data: TDATestData.generatePointCloud('random', 500, 2),
        expectedComplexity: 'O(n²)'
      }
    ];
  }

  /**
   * Generate performance thresholds for different operations
   */
  static getPerformanceThresholds(): Record<string, {fast: number, medium: number, slow: number}> {
    return {
      group_validation: { fast: 50, medium: 200, slow: 1000 },
      tda_persistence: { fast: 100, medium: 500, slow: 2000 },
      cayley_layout: { fast: 200, medium: 800, slow: 3000 },
      latex_rendering: { fast: 20, medium: 100, slow: 500 },
      canvas_drawing: { fast: 16.67, medium: 33.33, slow: 100 }, // 60fps, 30fps, 10fps
      matrix_multiplication: { fast: 10, medium: 50, slow: 200 },
      graph_traversal: { fast: 5, medium: 20, slow: 100 }
    };
  }

  /**
   * Generate memory usage expectations
   */
  static getMemoryThresholds(): Record<string, {low: number, medium: number, high: number}> {
    return {
      group_operations: { low: 1, medium: 10, high: 50 },
      tda_computations: { low: 5, medium: 50, high: 200 },
      visualization_rendering: { low: 2, medium: 20, high: 100 },
      latex_processing: { low: 0.5, medium: 5, high: 20 }
    };
  }
}

/**
 * Mock data generators for testing
 */
export class MockDataGenerators {
  /**
   * Generate mock WASM response for TDA operations
   */
  static mockTDAResponse(pointCount: number): any {
    const intervals = TDATestData.generatePersistenceIntervals(Math.floor(pointCount / 3));
    const betti = TDATestData.getExpectedBettiNumbers('random');
    
    return {
      intervals,
      betti,
      homology: intervals.map(interval => ({
        dimension: interval.dimension,
        generator: `h${interval.dimension}_${Math.random()}`
      })),
      computation_time: Math.random() * 1000,
      memory_usage: pointCount * 0.1
    };
  }

  /**
   * Generate mock Cayley graph data
   */
  static mockCayleyGraphData(groupOrder: number): any {
    const group = TestGroups.createCyclicGroup(groupOrder);
    
    return {
      nodes: group.elements.map((element, index) => ({
        id: element.id,
        label: element.label,
        x: Math.cos(2 * Math.PI * index / groupOrder) * 100,
        y: Math.sin(2 * Math.PI * index / groupOrder) * 100,
        order: element.order
      })),
      edges: group.elements.flatMap(element => 
        group.generators.map(gen => ({
          source: element.id,
          target: group.operations.get(element.id)?.get(gen) || element.id,
          generator: gen
        }))
      ),
      layout_time: Math.random() * 500,
      optimization_iterations: Math.floor(Math.random() * 100)
    };
  }

  /**
   * Generate mock performance metrics
   */
  static mockPerformanceMetrics(operation: string): any {
    const thresholds = PerformanceTestData.getPerformanceThresholds()[operation] || 
                     { fast: 100, medium: 300, slow: 1000 };
    
    return {
      operation,
      startTime: Date.now() - Math.random() * 1000,
      endTime: Date.now(),
      duration: Math.random() * thresholds.slow,
      memoryBefore: Math.random() * 100,
      memoryAfter: Math.random() * 100 + 10,
      cpuUsage: Math.random() * 100,
      success: Math.random() > 0.1, // 90% success rate
      error: Math.random() > 0.9 ? 'Mock error for testing' : null
    };
  }
}

/**
 * Export all test data utilities
 */
export const TestData = {
  MathematicalConstants,
  TestGroups,
  TDATestData,
  LaTeXTestData,
  PerformanceTestData,
  MockDataGenerators
};

export default TestData;