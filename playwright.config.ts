import { defineConfig, devices } from '@playwright/test';

/**
 * Enhanced Playwright Configuration for Mathematical Platform Testing
 * Optimized for parallel execution of mathematical visualizations and cross-browser testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Enhanced parallel execution for mathematical visualizations */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry configuration with different strategies for test categories */
  retries: process.env.CI ? 2 : 0,
  
  /* Optimized worker allocation for mathematical computations */
  workers: process.env.CI ? 2 : Math.max(1, Math.floor(require('os').cpus().length * 0.75)),
  /* Enhanced reporting configuration */
  reporter: [
    ['html', { 
      outputFolder: 'test-results/html-report',
      open: 'never'
    }],
    ['junit', { 
      outputFile: 'test-results/results.xml',
      includeProjectInTestName: true 
    }],
    ['line'], // For better CI output
    ...(process.env.CI ? [] : [['list'] as const]) // Detailed local output
  ],
  
  /* Enhanced shared settings optimized for mathematical visualizations */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    
    /* Enhanced tracing for mathematical operations */
    trace: 'on-first-retry',
    
    /* Screenshot configuration for visual regression testing */
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },
    
    /* Video recording for complex mathematical workflows */
    video: {
      mode: 'retain-on-failure',
      size: { width: 1280, height: 720 }
    },
    
    /* Enhanced viewport for mathematical visualizations */
    viewport: { width: 1280, height: 720 },
    
    /* Ignore HTTPS errors for local development */
    ignoreHTTPSErrors: true,
    
    /* Longer action timeout for mathematical computations */
    actionTimeout: 10000,
    
    /* Navigation timeout for heavy mathematical pages */
    navigationTimeout: 30000,
    
    /* Additional context options for mathematical testing */
    contextOptions: {
      // Ensure proper canvas and WebGL support
      permissions: ['clipboard-read', 'clipboard-write'],
      // Reduce animations for consistent visual testing
      reducedMotion: 'reduce'
    }
  },

  /* Enhanced project configuration for mathematical visualization testing */
  projects: [
    // Core desktop browsers for mathematical visualizations
    {
      name: 'chromium-mathematical',
      testMatch: /.*mathematical.*\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        // Optimize for mathematical computations
        launchOptions: {
          args: [
            '--enable-experimental-web-platform-features',
            '--enable-webgl2-compute-context',
            '--enable-unsafe-webgpu',
            '--max_old_space_size=4096' // Increase memory for mathematical operations
          ]
        }
      },
      // Run mathematical tests sequentially due to computational intensity
      fullyParallel: false,
      retries: 3, // More retries for potentially flaky mathematical computations
    },

    {
      name: 'chromium-performance',
      testMatch: /.*performance.*\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--enable-precise-memory-info',
            '--max_old_space_size=4096'
          ]
        }
      },
      // Performance tests must run sequentially
      fullyParallel: false,
      workers: 1,
      retries: 1
    },

    {
      name: 'chromium-visual',
      testMatch: /.*visual.*\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        // Optimize for visual consistency
        launchOptions: {
          args: [
            '--disable-gpu-sandbox',
            '--disable-software-rasterizer',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ]
        }
      },
      // Visual tests can run in parallel but with limited workers
      fullyParallel: true,
      workers: 2
    },

    {
      name: 'chromium-integration',
      testMatch: /.*integration.*\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--max_old_space_size=2048']
        }
      },
      // Integration tests with moderate parallelization
      fullyParallel: true,
      workers: process.env.CI ? 1 : 2
    },

    // Cross-browser testing for mathematical visualizations
    {
      name: 'firefox-mathematical',
      testMatch: /.*mathematical.*\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
      fullyParallel: false,
      retries: 3
    },

    {
      name: 'webkit-mathematical',
      testMatch: /.*mathematical.*\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
      fullyParallel: false,
      retries: 3
    },

    // Mobile testing for responsive mathematical visualizations
    {
      name: 'mobile-chrome-responsive',
      testMatch: /.*responsive.*\.spec\.ts/,
      use: { 
        ...devices['Pixel 5'],
        // Mobile-specific optimizations
        launchOptions: {
          args: ['--max_old_space_size=1024']
        }
      },
      fullyParallel: true
    },

    {
      name: 'mobile-safari-responsive',
      testMatch: /.*responsive.*\.spec\.ts/,
      use: { ...devices['iPhone 12'] },
      fullyParallel: true
    },

    // Smoke tests - fast, parallel execution across all browsers
    {
      name: 'chromium-smoke',
      testMatch: /.*smoke.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      fullyParallel: true,
      retries: 1
    },

    {
      name: 'firefox-smoke',
      testMatch: /.*smoke.*\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
      fullyParallel: true,
      retries: 1
    },

    {
      name: 'webkit-smoke',
      testMatch: /.*smoke.*\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
      fullyParallel: true,
      retries: 1
    },

    // Fallback for uncategorized tests
    {
      name: 'chromium-default',
      testIgnore: [
        /.*mathematical.*\.spec\.ts/,
        /.*performance.*\.spec\.ts/,
        /.*visual.*\.spec\.ts/,
        /.*integration.*\.spec\.ts/,
        /.*responsive.*\.spec\.ts/,
        /.*smoke.*\.spec\.ts/
      ],
      use: { ...devices['Desktop Chrome'] },
      fullyParallel: true
    }
  ],

  /* Enhanced web server configuration for mathematical platform */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000, // Increased timeout for mathematical platform startup
    env: {
      // Optimize Node.js for mathematical computations
      NODE_OPTIONS: '--max-old-space-size=4096',
      // Enable mathematical testing mode
      MATHEMATICAL_TESTING: 'true'
    }
  },

  /* Enhanced timeout configuration for mathematical operations */
  timeout: process.env.CI ? 60 * 1000 : 45 * 1000, // Longer timeouts for mathematical computations
  
  expect: {
    /* Enhanced assertion timeout for mathematical operations */
    timeout: 10 * 1000, // Increased for mathematical computations and visualizations
    
    /* Visual comparison threshold for mathematical diagrams */
    toHaveScreenshot: {
      threshold: 0.2 // Allow some variance in mathematical renderings
    },
    
    /* Pixel comparison for mathematical visualizations */
    toMatchSnapshot: {
      threshold: 0.3 // More lenient for mathematical content
    }
  },

  /* Enhanced output directory structure */
  outputDir: 'test-results/playwright-artifacts/',
  
  /* Global setup and teardown for mathematical testing environment */
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),
  
  /* Test metadata configuration */
  metadata: {
    platform: 'Mathematical Platform',
    version: require('./package.json').version,
    features: [
      'Group Theory Visualizations',
      'TDA Computations', 
      'Cayley Graphs',
      'LaTeX Rendering',
      'Performance Monitoring'
    ]
  }
});