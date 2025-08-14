/**
 * Performance End-to-End Tests for Mathematical Components
 * Tests rendering performance, computation speed, and memory usage
 */

import { test, expect, Page } from '@playwright/test';

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  PAGE_LOAD: 3000,        // 3 seconds
  MATH_COMPUTATION: 5000, // 5 seconds
  GRAPH_RENDER: 2000,     // 2 seconds
  INTERACTION_RESPONSE: 500, // 500ms
  MEMORY_LIMIT: 100,      // 100MB
};

test.describe('Mathematical Components Performance', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
  });

  test.describe('Page Load Performance', () => {
    test('mathematical tools pages load within performance threshold', async () => {
      const pages = [
        '/',
        '/projects/cayleygraph',
        '/projects/tda-explorer',
        '/documentation/concepts'
      ];

      for (const url of pages) {
        const startTime = Date.now();
        
        await page.goto(url);
        await page.waitForLoadState('networkidle');
        
        const loadTime = Date.now() - startTime;
        
        console.log(`Page ${url} load time: ${loadTime}ms`);
        expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.PAGE_LOAD);

        // Check for Core Web Vitals
        const metrics = await page.evaluate(() => {
          return new Promise((resolve) => {
            new PerformanceObserver((entryList) => {
              const entries = entryList.getEntries();
              resolve(entries.map(entry => ({
                name: entry.name,
                startTime: entry.startTime,
                duration: entry.duration
              })));
            }).observe({ entryTypes: ['measure', 'navigation'] });
            
            // Fallback if no entries
            setTimeout(() => resolve([]), 1000);
          });
        });

        console.log(`Metrics for ${url}:`, metrics);
      }
    });

    test('mathematical assets load efficiently', async () => {
      await page.goto('/');
      
      // Monitor network requests for mathematical assets
      const mathAssets = [];
      page.on('response', response => {
        const url = response.url();
        if (url.includes('wasm') || url.includes('math') || url.includes('katex')) {
          mathAssets.push({
            url,
            status: response.status(),
            size: response.headers()['content-length'],
            timing: response.timing()
          });
        }
      });

      await page.click('text=TDA Explorer');
      await page.waitForLoadState('networkidle');

      // Verify mathematical assets loaded successfully
      mathAssets.forEach(asset => {
        expect(asset.status).toBe(200);
        console.log(`Mathematical asset: ${asset.url} - ${asset.size} bytes`);
      });
    });
  });

  test.describe('Computational Performance', () => {
    test('Cayley graph generation performance', async () => {
      await page.goto('/projects/cayleygraph');
      await page.waitForLoadState('networkidle');

      const groups = [
        { name: 'C4 - Cyclic Group', expectedVertices: 4 },
        { name: 'S3 - Symmetric Group', expectedVertices: 6 },
        { name: 'D4 - Dihedral Group', expectedVertices: 8 },
        { name: 'Q8 - Quaternion Group', expectedVertices: 8 }
      ];

      for (const group of groups) {
        const startTime = Date.now();
        
        await page.click('[data-testid="group-selector"]');
        await page.click(`text=${group.name}`);
        
        // Wait for graph to be fully rendered
        await page.waitForSelector('[data-testid="cayley-graph-svg"]');
        await page.waitForFunction(() => {
          const vertices = document.querySelectorAll('[data-testid="graph-vertex"]');
          return vertices.length > 0;
        });

        const renderTime = Date.now() - startTime;
        
        console.log(`${group.name} render time: ${renderTime}ms`);
        expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.GRAPH_RENDER);

        // Verify correct number of vertices rendered
        const vertices = await page.locator('[data-testid="graph-vertex"]').count();
        expect(vertices).toBe(group.expectedVertices);
      }
    });

    test('TDA computation performance', async () => {
      await page.goto('/projects/tda-explorer');
      await page.waitForLoadState('networkidle');

      const testCases = [
        { points: 10, pattern: 'Random', maxTime: 1000 },
        { points: 50, pattern: 'Circle', maxTime: 2000 },
        { points: 100, pattern: 'Grid', maxTime: 3000 },
        { points: 200, pattern: 'Clusters', maxTime: 5000 }
      ];

      for (const testCase of testCases) {
        // Set point count
        await page.fill('[data-testid="point-count-input"]', testCase.points.toString());
        
        // Select pattern
        await page.click(`[data-testid="pattern-${testCase.pattern.toLowerCase()}"]`);
        
        const startTime = Date.now();
        
        // Generate points and compute persistence
        await page.click('[data-testid="regenerate-points"]');
        
        // Wait for computation to complete
        await page.waitForSelector('[data-testid="persistence-diagram"]');
        await page.waitForFunction(() => {
          const intervals = document.querySelectorAll('[data-testid="persistence-interval"]');
          return intervals.length > 0;
        });

        const computationTime = Date.now() - startTime;
        
        console.log(`TDA computation (${testCase.points} points, ${testCase.pattern}): ${computationTime}ms`);
        expect(computationTime).toBeLessThan(testCase.maxTime);

        // Verify computation results
        const intervalCount = await page.locator('[data-testid="persistence-interval"]').count();
        expect(intervalCount).toBeGreaterThan(0);
      }
    });

    test('real-time interaction performance', async () => {
      await page.goto('/projects/tda-explorer');
      await page.waitForLoadState('networkidle');

      // Enable real-time mode
      await page.click('[data-testid="realtime-toggle"]');
      
      const canvas = page.locator('[data-testid="point-cloud-canvas"]');
      
      // Test multiple rapid interactions
      const interactions = [
        { x: 100, y: 100 },
        { x: 200, y: 150 },
        { x: 150, y: 200 },
        { x: 250, y: 100 },
        { x: 300, y: 200 }
      ];

      const interactionTimes = [];

      for (const interaction of interactions) {
        const startTime = Date.now();
        
        await canvas.click({ position: interaction });
        
        // Wait for persistence to update
        await page.waitForFunction(() => {
          const updateIndicator = document.querySelector('[data-testid="computation-status"]');
          return updateIndicator && updateIndicator.textContent !== 'Computing...';
        }, { timeout: 2000 });

        const responseTime = Date.now() - startTime;
        interactionTimes.push(responseTime);
        
        console.log(`Interaction ${interactions.indexOf(interaction) + 1} response time: ${responseTime}ms`);
        expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION_RESPONSE);
      }

      // Verify average response time
      const avgResponseTime = interactionTimes.reduce((sum, time) => sum + time, 0) / interactionTimes.length;
      console.log(`Average interaction response time: ${avgResponseTime}ms`);
      expect(avgResponseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.INTERACTION_RESPONSE);
    });
  });

  test.describe('Rendering Performance', () => {
    test('mathematical notation rendering performance', async () => {
      await page.goto('/documentation/concepts');
      await page.waitForLoadState('networkidle');

      // Measure LaTeX rendering time
      const startTime = Date.now();
      
      await page.waitForSelector('.katex', { timeout: 5000 });
      
      const renderTime = Date.now() - startTime;
      console.log(`LaTeX rendering time: ${renderTime}ms`);
      expect(renderTime).toBeLessThan(2000);

      // Count rendered equations
      const equationCount = await page.locator('.katex').count();
      console.log(`Rendered ${equationCount} mathematical equations`);
      expect(equationCount).toBeGreaterThan(0);

      // Test rendering quality
      const equations = page.locator('.katex');
      for (let i = 0; i < Math.min(5, equationCount); i++) {
        const equation = equations.nth(i);
        await expect(equation).toBeVisible();
        
        // Check that equation has proper dimensions
        const box = await equation.boundingBox();
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
      }
    });

    test('3D visualization rendering performance', async () => {
      await page.goto('/projects/tda-explorer');
      await page.waitForLoadState('networkidle');

      // Generate data for 3D visualization
      await page.fill('[data-testid="point-count-input"]', '50');
      await page.click('[data-testid="pattern-circle"]');
      await page.click('[data-testid="regenerate-points"]');
      await page.waitForSelector('[data-testid="persistence-diagram"]');

      // Switch to 3D landscape view
      const startTime = Date.now();
      
      await page.click('[data-testid="tab-landscape"]');
      await page.waitForSelector('[data-testid="landscape-3d"]');

      const renderTime = Date.now() - startTime;
      console.log(`3D landscape rendering time: ${renderTime}ms`);
      expect(renderTime).toBeLessThan(3000);

      // Test 3D interaction performance
      const landscape3d = page.locator('[data-testid="landscape-3d"]');
      
      // Simulate mouse interactions
      const interactionStartTime = Date.now();
      
      await landscape3d.hover();
      await page.mouse.down();
      await page.mouse.move(100, 100);
      await page.mouse.up();
      
      const interactionTime = Date.now() - interactionStartTime;
      console.log(`3D interaction time: ${interactionTime}ms`);
      expect(interactionTime).toBeLessThan(1000);
    });

    test('large dataset rendering performance', async () => {
      await page.goto('/projects/cayleygraph');
      await page.waitForLoadState('networkidle');

      // Test with larger groups
      const largeGroups = [
        'A4 - Alternating Group',
        'D6 - Dihedral Group',
        'C12 - Cyclic Group'
      ];

      for (const groupName of largeGroups) {
        const startTime = Date.now();
        
        await page.click('[data-testid="group-selector"]');
        
        // Check if group exists in dropdown
        const groupOption = page.locator(`text=${groupName}`);
        if (await groupOption.isVisible()) {
          await groupOption.click();
          
          await page.waitForSelector('[data-testid="cayley-graph-svg"]');
          await page.waitForFunction(() => {
            const vertices = document.querySelectorAll('[data-testid="graph-vertex"]');
            const edges = document.querySelectorAll('[data-testid="graph-edge"]');
            return vertices.length > 0 && edges.length > 0;
          });

          const renderTime = Date.now() - startTime;
          console.log(`${groupName} large graph render time: ${renderTime}ms`);
          expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.GRAPH_RENDER * 2); // Allow more time for larger graphs
        }
      }
    });
  });

  test.describe('Memory Performance', () => {
    test('memory usage stays within limits during mathematical computations', async () => {
      await page.goto('/projects/tda-explorer');
      await page.waitForLoadState('networkidle');

      // Monitor memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : null;
      });

      if (!initialMemory) {
        console.log('Memory API not available, skipping memory test');
        return;
      }

      console.log('Initial memory usage:', initialMemory);

      // Perform memory-intensive operations
      for (let i = 0; i < 5; i++) {
        await page.fill('[data-testid="point-count-input"]', '200');
        await page.click('[data-testid="pattern-random"]');
        await page.click('[data-testid="regenerate-points"]');
        await page.waitForSelector('[data-testid="persistence-diagram"]');
        
        // Force garbage collection if available
        await page.evaluate(() => {
          if ((window as any).gc) {
            (window as any).gc();
          }
        });
      }

      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
        } : null;
      });

      console.log('Final memory usage:', finalMemory);

      if (finalMemory) {
        const memoryIncreaseMB = (finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize) / (1024 * 1024);
        console.log(`Memory increase: ${memoryIncreaseMB.toFixed(2)}MB`);
        
        expect(memoryIncreaseMB).toBeLessThan(PERFORMANCE_THRESHOLDS.MEMORY_LIMIT);
      }
    });

    test('no memory leaks in repeated operations', async () => {
      await page.goto('/projects/cayleygraph');
      await page.waitForLoadState('networkidle');

      const getMemoryUsage = async () => {
        return await page.evaluate(() => {
          return (performance as any).memory ? 
            (performance as any).memory.usedJSHeapSize : 0;
        });
      };

      const initialMemory = await getMemoryUsage();
      
      // Perform repeated graph generations
      const groups = ['C4 - Cyclic Group', 'V4 - Klein Four Group', 'S3 - Symmetric Group'];
      
      for (let iteration = 0; iteration < 10; iteration++) {
        for (const group of groups) {
          await page.click('[data-testid="group-selector"]');
          await page.click(`text=${group}`);
          await page.waitForSelector('[data-testid="cayley-graph-svg"]');
          
          // Trigger layout changes to exercise memory
          await page.click('[data-testid="layout-selector"]');
          await page.click('text=Force Layout');
          await page.waitForTimeout(500);
        }
        
        // Force garbage collection every few iterations
        if (iteration % 3 === 0) {
          await page.evaluate(() => {
            if ((window as any).gc) {
              (window as any).gc();
            }
          });
        }
      }

      const finalMemory = await getMemoryUsage();
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncreaseMB = (finalMemory - initialMemory) / (1024 * 1024);
        console.log(`Memory increase after repeated operations: ${memoryIncreaseMB.toFixed(2)}MB`);
        
        // Should not leak more than 20MB over repeated operations
        expect(memoryIncreaseMB).toBeLessThan(20);
      }
    });
  });

  test.describe('Network Performance', () => {
    test('mathematical assets are cached efficiently', async () => {
      // First visit - assets should be downloaded
      await page.goto('/projects/tda-explorer');
      await page.waitForLoadState('networkidle');

      let networkRequests = [];
      
      // Monitor network requests on second visit
      page.on('response', response => {
        const url = response.url();
        if (url.includes('wasm') || url.includes('js') || url.includes('css')) {
          networkRequests.push({
            url,
            status: response.status(),
            fromCache: response.fromServiceWorker() || response.status() === 304
          });
        }
      });

      // Second visit - assets should be cached
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check that mathematical assets are served from cache
      const mathAssets = networkRequests.filter(req => 
        req.url.includes('wasm') || req.url.includes('tda') || req.url.includes('math')
      );

      mathAssets.forEach(asset => {
        console.log(`Asset: ${asset.url} - Status: ${asset.status} - Cached: ${asset.fromCache}`);
      });

      // Most assets should be cached or return 304
      const cachedAssets = mathAssets.filter(asset => asset.fromCache || asset.status === 304);
      const cacheHitRate = cachedAssets.length / mathAssets.length;
      
      console.log(`Cache hit rate: ${(cacheHitRate * 100).toFixed(1)}%`);
      expect(cacheHitRate).toBeGreaterThan(0.7); // At least 70% cache hit rate
    });

    test('lazy loading of mathematical components works efficiently', async () => {
      const loadTimes = {};

      // Monitor when different mathematical components load
      page.on('response', response => {
        const url = response.url();
        if (url.includes('chunk') && (url.includes('math') || url.includes('tda') || url.includes('cayley'))) {
          loadTimes[url] = Date.now();
        }
      });

      await page.goto('/');
      const homeLoadTime = Date.now();

      // Navigate to mathematical tools - should trigger lazy loading
      await page.click('text=TDA Explorer');
      const tdaLoadTime = Date.now();

      await page.click('text=Cayley Graphs');
      const cayleyLoadTime = Date.now();

      // Verify components loaded when needed
      console.log('Component load times:');
      Object.entries(loadTimes).forEach(([url, time]) => {
        console.log(`${url}: ${time - homeLoadTime}ms after home load`);
      });

      // TDA components should load after navigation to TDA
      const tdaChunks = Object.keys(loadTimes).filter(url => url.includes('tda'));
      if (tdaChunks.length > 0) {
        expect(loadTimes[tdaChunks[0]]).toBeGreaterThan(homeLoadTime);
      }
    });
  });

  test.describe('Responsive Performance', () => {
    test('mathematical visualizations adapt to different screen sizes efficiently', async () => {
      const viewports = [
        { width: 1920, height: 1080, name: 'Desktop' },
        { width: 1024, height: 768, name: 'Tablet' },
        { width: 375, height: 667, name: 'Mobile' }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        console.log(`Testing ${viewport.name} viewport: ${viewport.width}x${viewport.height}`);

        const startTime = Date.now();
        await page.goto('/projects/cayleygraph');
        await page.waitForLoadState('networkidle');

        await page.click('[data-testid="group-selector"]');
        await page.click('text=S3 - Symmetric Group');
        await page.waitForSelector('[data-testid="cayley-graph-svg"]');

        const renderTime = Date.now() - startTime;
        console.log(`${viewport.name} render time: ${renderTime}ms`);
        
        // Mobile should not be significantly slower
        const maxTime = viewport.name === 'Mobile' ? 
          PERFORMANCE_THRESHOLDS.GRAPH_RENDER * 1.5 : 
          PERFORMANCE_THRESHOLDS.GRAPH_RENDER;
        
        expect(renderTime).toBeLessThan(maxTime);

        // Verify graph is properly sized for viewport
        const graph = page.locator('[data-testid="cayley-graph-svg"]');
        const graphBox = await graph.boundingBox();
        
        expect(graphBox.width).toBeLessThanOrEqual(viewport.width);
        expect(graphBox.height).toBeLessThanOrEqual(viewport.height);
      }
    });
  });
});