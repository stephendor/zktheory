/* eslint-env node */
/* global module, process, require */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files
    dir: './'
});

// Enhanced Jest configuration for mathematical testing suite
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jsdom',

    // Module resolution for TypeScript and aliases
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.wasm$': '<rootDir>/__mocks__/wasmMock.js'
    },

    // Test file patterns with enhanced matching and categorization
    testMatch: [
        '**/__tests__/**/*.(js|jsx|ts|tsx)',
        '**/*.(test|spec).(js|jsx|ts|tsx)',
        '**/__tests__/**/*.mathematical.(js|jsx|ts|tsx)', // Mathematical-specific tests
        '**/*.(perf|benchmark).(js|jsx|ts|tsx)', // Performance tests
        '**/__tests__/**/*.unit.(js|jsx|ts|tsx)', // Unit tests
        '**/__tests__/**/*.integration.(js|jsx|ts|tsx)' // Integration tests
    ],

    // Test categorization through projects for better parallel execution
    projects: [
        {
            displayName: 'Unit Tests (@unit)',
            testMatch: [
                '<rootDir>/src/__tests__/**/*.test.(js|jsx|ts|tsx)',
                '<rootDir>/src/**/*.unit.(js|jsx|ts|tsx)',
                // Include workspace unit tests outside src
                '<rootDir>/tests/unit/**/*.test.(js|jsx|ts|tsx)'
            ],
            testPathIgnorePatterns: ['<rootDir>/src/__tests__/performance/', '<rootDir>/src/__tests__/integration/'],
            // Fast unit tests can use more workers
            maxWorkers: process.env.CI ? 2 : '100%',
            globals: {
                __TEST_CATEGORY__: 'unit'
            }
        },
        {
            displayName: 'Mathematical Tests (@mathematical)',
            testMatch: ['<rootDir>/src/__tests__/lib/*.test.(js|jsx|ts|tsx)', '<rootDir>/src/**/*.mathematical.(js|jsx|ts|tsx)'],
            // Mathematical tests need more memory per worker
            maxWorkers: process.env.CI ? 1 : '50%',
            globals: {
                __TEST_CATEGORY__: 'mathematical',
                __MATHEMATICAL_TESTING__: true,
                __PERFORMANCE_THRESHOLD_MS__: 100,
                __MEMORY_THRESHOLD_MB__: 50
            }
        },
        {
            displayName: 'Performance Tests (@performance)',
            testMatch: [
                '<rootDir>/src/__tests__/performance/*.test.(js|jsx|ts|tsx)',
                '<rootDir>/src/**/*.perf.(js|jsx|ts|tsx)',
                '<rootDir>/src/**/*.benchmark.(js|jsx|ts|tsx)',
                // Include workspace performance tests outside src
                '<rootDir>/tests/performance/**/*.test.(js|jsx|ts|tsx)'
            ],
            // Performance tests run sequentially to avoid interference
            maxWorkers: 1,
            // Longer timeout for performance tests is set via setupFilesAfterEnv
            setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/tests/performance/setup.js'],
            testEnvironment: 'jsdom',
            moduleNameMapper: {
                '^@/(.*)$': '<rootDir>/src/$1',
                '\\.wasm$': '<rootDir>/__mocks__/wasmMock.js'
            },
            moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'wasm'],
            transform: {
                '^.+\\\.(js|jsx|ts|tsx)$': [
                    'babel-jest',
                    {
                        presets: ['next/babel']
                    }
                ]
            },
            transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],
            testEnvironmentOptions: {
                url: 'http://localhost:3000',
                userAgent: 'jsdom'
            },
            testPathIgnorePatterns: [
                // Ignore TS performance tests under src that require TS-specific configs not in scope here
                '<rootDir>/src/__tests__/performance/.*\\.ts$'
            ],
            globals: {
                __TEST_CATEGORY__: 'performance',
                __PERFORMANCE_TESTING__: true
            }
        },
        {
            displayName: 'Integration Tests (@integration)',
            testMatch: ['<rootDir>/src/**/*.integration.(js|jsx|ts|tsx)'],
            // Integration tests need moderate parallelization
            maxWorkers: process.env.CI ? 1 : '25%',
            // Timeout for integration tests is set via setupFilesAfterEnv
            setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/tests/integration/setup.js'],
            testEnvironment: 'jsdom',
            moduleNameMapper: {
                '^@/(.*)$': '<rootDir>/src/$1',
                '\\.wasm$': '<rootDir>/__mocks__/wasmMock.js'
            },
            moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'wasm'],
            transform: {
                '^.+\\\.(js|jsx|ts|tsx)$': [
                    'babel-jest',
                    {
                        presets: ['next/babel']
                    }
                ]
            },
            transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],
            testEnvironmentOptions: {
                url: 'http://localhost:3000',
                userAgent: 'jsdom'
            },
            globals: {
                __TEST_CATEGORY__: 'integration'
            }
        },
        {
            displayName: 'Visual Tests (@visual)',
            testMatch: ['<rootDir>/src/__tests__/visual/*.test.(js|jsx|ts|tsx)', '<rootDir>/src/**/*.visual.(js|jsx|ts|tsx)'],
            // Visual tests run sequentially due to DOM/canvas dependencies
            maxWorkers: 1,
            testEnvironment: 'jsdom',
            setupFilesAfterEnv: ['<rootDir>/tests/visual-setup.js'],
            globals: {
                __TEST_CATEGORY__: 'visual'
            }
        }
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
        '!src/coverage/**'
    ],

    // Enhanced coverage thresholds for 80% minimum requirement
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        },
        // Specific thresholds for mathematical components
        'src/lib/**/*.{js,ts}': {
            branches: 85,
            functions: 85,
            lines: 90,
            statements: 90
        },
        // TDA components require high coverage due to mathematical complexity
        'src/components/TDAExplorer/**/*.{js,jsx,ts,tsx}': {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },

    // Coverage reporting configuration
    coverageReporters: ['text', 'text-summary', 'lcov', 'html', 'json', 'json-summary'],

    coverageDirectory: '<rootDir>/coverage',

    // File extensions
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'wasm'],

    // Transform configuration
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': [
            'babel-jest',
            {
                presets: ['next/babel']
            }
        ]
    },

    transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],

    // Test environment options
    testEnvironmentOptions: {
        // Enable additional Web APIs for mathematical visualizations
        url: 'http://localhost:3000',
        userAgent: 'jsdom'
    },

    // Note: Per-project timeouts are configured within each project block

    // Performance monitoring and memory management - Enhanced for parallel execution
    maxWorkers: process.env.CI ? 2 : '75%', // More aggressive parallelization locally, conservative in CI

    // Worker allocation for mathematical computations
    workerIdleMemoryLimit: '2GB', // Increase memory limit for mathematical operations

    // Enhanced parallel execution configuration
    testRunner: 'jest-circus/runner', // Better parallel support

    // Error handling and debugging
    verbose: true,
    bail: false, // Continue running tests even after failures

    // Cache configuration for better performance
    cache: true,
    cacheDirectory: '<rootDir>/.jest-cache',

    // Watch plugins for development
    // watchPlugins: [ // Commented out if not installed
    //   'jest-watch-typeahead/filename',
    //   'jest-watch-typeahead/testname',
    // ],

    // Test result processor for enhanced reporting
    // testResultsProcessor: 'jest-sonar-reporter', // Commented out if not installed

    // Global configuration for mathematical testing
    globals: {
        'ts-jest': {
            useESM: true
        },
        // Mathematical constants and utilities available globally
        __MATHEMATICAL_TESTING__: true,
        __PERFORMANCE_THRESHOLD_MS__: 100,
        __MEMORY_THRESHOLD_MB__: 50
    },

    // Setup for mathematical testing environment
    globalSetup: '<rootDir>/tests/global-setup.js',
    globalTeardown: '<rootDir>/tests/global-teardown.js',

    // Mock configuration
    clearMocks: true,
    resetMocks: false,
    restoreMocks: true,

    // Snapshot configuration
    // snapshotSerializers: [
    //   'jest-serializer-html', // Commented out if not installed
    // ],

    // Error handling configuration
    errorOnDeprecated: true,

    // Additional reporters for CI/CD integration
    reporters: [
        'default'
        // ['jest-junit', { // Commented out if not installed
        //   outputDirectory: '<rootDir>/test-results',
        //   outputName: 'jest-results.xml',
        //   suiteName: 'ZK Theory Mathematical Tests',
        //   classNameTemplate: '{classname}',
        //   titleTemplate: '{title}',
        //   includeConsoleOutput: false,
        // }],
        // ['jest-html-reporter', { // Commented out if not installed
        //   pageTitle: 'ZK Theory Test Results',
        //   outputPath: '<rootDir>/test-results/test-report.html',
        //   includeFailureMsg: true,
        //   includeSuiteFailure: true,
        // }],
    ]
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
