const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Enhanced Jest configuration for mathematical testing suite
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  
  // Module resolution for TypeScript and aliases
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Test file patterns with enhanced matching
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)',
    '**/__tests__/**/*.mathematical.(js|jsx|ts|tsx)', // Mathematical-specific tests
    '**/*.(perf|benchmark).(js|jsx|ts|tsx)', // Performance tests
  ],
  
  // Comprehensive coverage collection with 80% minimum threshold
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.config.{js,ts}',
    '!src/**/index.{js,ts}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
    // Exclude build/generated files
    '!src/.next/**',
    '!src/coverage/**',
  ],
  
  // Enhanced coverage thresholds for 80% minimum requirement
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Specific thresholds for mathematical components
    'src/lib/**/*.{js,ts}': {
      branches: 85,
      functions: 85,
      lines: 90,
      statements: 90,
    },
    // TDA components require high coverage due to mathematical complexity
    'src/components/TDAExplorer/**/*.{js,jsx,ts,tsx}': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Coverage reporting configuration
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
    'json-summary',
  ],
  
  coverageDirectory: '<rootDir>/coverage',
  
  // File extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'wasm'],
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { 
      presets: ['next/babel'],
      plugins: [
        // Enable additional mathematical computation support
        ['@babel/plugin-transform-numeric-separator'],
      ]
    }],
    // Handle WASM files for TDA testing
    '^.+\\.wasm$': 'jest-transform-stub',
  },
  
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))',
    // Don't transform WASM files
    '\\.wasm$',
  ],
  
  // Test environment options
  testEnvironmentOptions: {
    // Enable additional Web APIs for mathematical visualizations
    url: 'http://localhost:3000',
    userAgent: 'jsdom',
  },
  
  // Enhanced timeout for mathematical computations
  testTimeout: 15000,
  
  // Performance monitoring and memory management
  maxWorkers: '50%', // Use half of available cores for stability
  
  // Error handling and debugging
  verbose: true,
  bail: false, // Continue running tests even after failures
  
  // Cache configuration for better performance
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Watch plugins for development
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  
  // Test result processor for enhanced reporting
  testResultsProcessor: 'jest-sonar-reporter',
  
  // Global configuration for mathematical testing
  globals: {
    'ts-jest': {
      useESM: true,
    },
    // Mathematical constants and utilities available globally
    __MATHEMATICAL_TESTING__: true,
    __PERFORMANCE_THRESHOLD_MS__: 100,
    __MEMORY_THRESHOLD_MB__: 50,
  },
  
  // Setup for mathematical testing environment
  globalSetup: '<rootDir>/tests/global-setup.js',
  globalTeardown: '<rootDir>/tests/global-teardown.js',
  
  // Mock configuration
  clearMocks: true,
  resetMocks: false,
  restoreMocks: true,
  
  // Snapshot configuration
  snapshotSerializers: [
    'jest-serializer-html',
  ],
  
  // Error handling configuration
  errorOnDeprecated: true,
  
  // Additional reporters for CI/CD integration
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '<rootDir>/test-results',
      outputName: 'jest-results.xml',
      suiteName: 'ZK Theory Mathematical Tests',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      includeConsoleOutput: false,
    }],
    ['jest-html-reporter', {
      pageTitle: 'ZK Theory Test Results',
      outputPath: '<rootDir>/test-results/test-report.html',
      includeFailureMsg: true,
      includeSuiteFailure: true,
    }],
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)