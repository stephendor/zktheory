/**
 * Test Categorization System for ZK Theory Mathematical Platform
 * Provides comprehensive tagging and categorization for parallel test execution
 */

export type TestCategory = 
  | 'unit' 
  | 'integration' 
  | 'performance' 
  | 'visual' 
  | 'mathematical' 
  | 'smoke' 
  | 'regression' 
  | 'accessibility'
  | 'responsive';

export type TestDomain = 
  | 'group_theory' 
  | 'tda' 
  | 'cayley_graphs' 
  | 'latex_rendering' 
  | 'visualization' 
  | 'performance_monitoring'
  | 'user_interface'
  | 'api';

export type TestComplexity = 'low' | 'medium' | 'high' | 'critical';

export type TestPriority = 'p0' | 'p1' | 'p2' | 'p3';

export interface TestMetadata {
  category: TestCategory;
  domain: TestDomain;
  complexity: TestComplexity;
  priority: TestPriority;
  tags: string[];
  parallel: boolean;
  requiresWasm?: boolean;
  requiresWebGL?: boolean;
  requiresCanvas?: boolean;
  memoryIntensive?: boolean;
  computationIntensive?: boolean;
  visualRegression?: boolean;
  crossBrowser?: boolean;
  mobileCompatible?: boolean;
  timeout?: number;
  retries?: number;
  description?: string;
}

/**
 * Test decorator for Jest tests to add comprehensive metadata
 * Note: This function is a no-op in production builds
 */
export function testWithMetadata(
  name: string, 
  metadata: TestMetadata, 
  testFn: () => void | Promise<void>
) {
  // In production builds, just return the test function
  // In test environments, this would be replaced by Jest's it function
  return testFn;
}

/**
 * Test suite decorator for organizing related tests
 * Note: This function is a no-op in production builds
 */
export function testSuiteWithMetadata(
  name: string,
  metadata: Partial<TestMetadata>,
  suiteFn: () => void
) {
  // In production builds, just execute the suite function
  // In test environments, this would be replaced by Jest's describe function
  suiteFn();
}

/**
 * Performance test decorator with specific configurations
 */
export function performanceTest(
  name: string,
  options: {
    timeout?: number;
    iterations?: number;
    threshold?: number;
    memory?: boolean;
  } = {},
  testFn: () => void | Promise<void>
) {
  return testWithMetadata(
    name,
    {
      category: 'performance',
      domain: 'performance_monitoring',
      complexity: 'high',
      priority: 'p1',
      tags: ['performance', 'benchmark'],
      parallel: false, // Performance tests should not run in parallel
      timeout: options.timeout || 30000,
      retries: 1,
      memoryIntensive: options.memory || false,
      computationIntensive: true
    },
    testFn
  );
}

/**
 * Mathematical test decorator for mathematical computations
 */
export function mathematicalTest(
  name: string,
  domain: Extract<TestDomain, 'group_theory' | 'tda' | 'cayley_graphs'>,
  options: {
    complexity?: TestComplexity;
    requiresWasm?: boolean;
    timeout?: number;
    parallel?: boolean;
  } = {},
  testFn: () => void | Promise<void>
) {
  return testWithMetadata(
    name,
    {
      category: 'mathematical',
      domain,
      complexity: options.complexity || 'medium',
      priority: 'p1',
      tags: ['mathematical', domain.replace('_', '-')],
      parallel: options.parallel ?? true,
      requiresWasm: options.requiresWasm || false,
      timeout: options.timeout || 15000,
      retries: 2,
      computationIntensive: true
    },
    testFn
  );
}

/**
 * Visual test decorator for UI and visualization tests
 */
export function visualTest(
  name: string,
  options: {
    crossBrowser?: boolean;
    visualRegression?: boolean;
    timeout?: number;
    parallel?: boolean;
  } = {},
  testFn: () => void | Promise<void>
) {
  return testWithMetadata(
    name,
    {
      category: 'visual',
      domain: 'visualization',
      complexity: 'medium',
      priority: 'p1',
      tags: ['visual', 'ui', 'rendering'],
      parallel: options.parallel ?? false, // Visual tests often need sequential execution
      requiresCanvas: true,
      visualRegression: options.visualRegression ?? true,
      timeout: options.timeout || 20000,
      retries: 1
    },
    testFn
  );
}

/**
 * Integration test decorator for end-to-end workflows
 */
export function integrationTest(
  name: string,
  domain: TestDomain,
  options: {
    complexity?: TestComplexity;
    timeout?: number;
    parallel?: boolean;
    requiresWasm?: boolean;
  } = {},
  testFn: () => void | Promise<void>
) {
  return testWithMetadata(
    name,
    {
      category: 'integration',
      domain,
      complexity: options.complexity || 'high',
      priority: 'p0', // Integration tests are high priority
      tags: ['integration', 'e2e', domain.replace('_', '-')],
      parallel: options.parallel ?? false, // Integration tests usually sequential
      requiresWasm: options.requiresWasm || false,
      timeout: options.timeout || 45000,
      retries: 1
    },
    testFn
  );
}

/**
 * Unit test decorator for isolated component testing
 */
export function unitTest(
  name: string,
  domain: TestDomain,
  options: {
    complexity?: TestComplexity;
    timeout?: number;
    parallel?: boolean;
  } = {},
  testFn: () => void | Promise<void>
) {
  return testWithMetadata(
    name,
    {
      category: 'unit',
      domain,
      complexity: options.complexity || 'low',
      priority: 'p2',
      tags: ['unit', 'isolated', domain.replace('_', '-')],
      parallel: options.parallel ?? true, // Unit tests can run in parallel
      timeout: options.timeout || 10000,
      retries: 0
    },
    testFn
  );
}

/**
 * Accessibility test decorator for UI accessibility validation
 */
export function accessibilityTest(
  name: string,
  options: {
    timeout?: number;
    parallel?: boolean;
  } = {},
  testFn: () => void | Promise<void>
) {
  return testWithMetadata(
    name,
    {
      category: 'accessibility',
      domain: 'user_interface',
      complexity: 'medium',
      priority: 'p1',
      tags: ['accessibility', 'a11y', 'ui'],
      parallel: options.parallel ?? false,
      timeout: options.timeout || 15000,
      retries: 1
    },
    testFn
  );
}

/**
 * Responsive test decorator for mobile and responsive design testing
 */
export function responsiveTest(
  name: string,
  options: {
    viewports?: Array<{ width: number; height: number }>;
    timeout?: number;
    parallel?: boolean;
  } = {},
  testFn: () => void | Promise<void>
) {
  return testWithMetadata(
    name,
    {
      category: 'responsive',
      domain: 'user_interface',
      complexity: 'medium',
      priority: 'p2',
      tags: ['responsive', 'mobile', 'viewport'],
      parallel: options.parallel ?? false,
      mobileCompatible: true,
      timeout: options.timeout || 20000,
      retries: 1
    },
    testFn
  );
}

/**
 * Smoke test decorator for basic functionality validation
 */
export function smokeTest(
  name: string,
  options: {
    timeout?: number;
    parallel?: boolean;
  } = {},
  testFn: () => void | Promise<void>
) {
  return testWithMetadata(
    name,
    {
      category: 'smoke',
      domain: 'user_interface',
      complexity: 'low',
      priority: 'p0', // Smoke tests are highest priority
      tags: ['smoke', 'critical', 'basic'],
      parallel: options.parallel ?? true,
      timeout: options.timeout || 5000,
      retries: 0
    },
    testFn
  );
}

/**
 * Regression test decorator for preventing regressions
 */
export function regressionTest(
  name: string,
  domain: TestDomain,
  options: {
    complexity?: TestComplexity;
    timeout?: number;
    parallel?: boolean;
  } = {},
  testFn: () => void | Promise<void>
) {
  return testWithMetadata(
    name,
    {
      category: 'regression',
      domain,
      complexity: options.complexity || 'medium',
      priority: 'p1',
      tags: ['regression', 'prevention', domain.replace('_', '-')],
      parallel: options.parallel ?? false,
      timeout: options.timeout || 25000,
      retries: 1
    },
    testFn
  );
}