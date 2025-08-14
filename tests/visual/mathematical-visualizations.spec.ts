/**
 * Visual Regression Tests for Mathematical Visualizations
 * Tests consistency of mathematical rendering across different browsers and viewport sizes
 * Uses Playwright with pixelmatch for pixel-perfect comparisons
 */

import { test, expect, Page } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import * as fs from 'fs';
import * as path from 'path';

// Test configuration
const BASELINE_DIR = path.join(__dirname, 'baselines');
const OUTPUT_DIR = path.join(__dirname, 'output');
const DIFF_DIR = path.join(__dirname, 'diffs');

// Ensure directories exist
[BASELINE_DIR, OUTPUT_DIR, DIFF_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Visual comparison configuration
const VISUAL_CONFIG = {
  threshold: 0.1, // 10% difference threshold
  maxDiffPixels: 100, // Maximum different pixels allowed
  includeAA: false, // Ignore anti-aliasing differences
};

/**
 * Helper function to compare screenshots with baselines
 */
async function compareScreenshot(
  page: Page, 
  testName: string, 
  options: {
    fullPage?: boolean;
    selector?: string;
    threshold?: number;
    maxDiffPixels?: number;
  } = {}
): Promise<{ match: boolean; diffPixels: number; diffPercentage: number }> {
  const config = { ...VISUAL_CONFIG, ...options };
  
  // Take screenshot
  const screenshot = await page.screenshot({
    fullPage: config.fullPage || false,
    ...(config.selector && { clip: await page.locator(config.selector).boundingBox() })
  });
  
  const outputPath = path.join(OUTPUT_DIR, `${testName}.png`);
  const baselinePath = path.join(BASELINE_DIR, `${testName}.png`);
  const diffPath = path.join(DIFF_DIR, `${testName}-diff.png`);
  
  // Save current screenshot
  fs.writeFileSync(outputPath, screenshot);
  
  // If no baseline exists, create it and pass the test
  if (!fs.existsSync(baselinePath)) {
    fs.writeFileSync(baselinePath, screenshot);
    console.log(`Created baseline for ${testName}`);
    return { match: true, diffPixels: 0, diffPercentage: 0 };
  }
  
  // Compare with baseline
  const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
  const current = PNG.sync.read(screenshot);
  const diff = new PNG({ width: baseline.width, height: baseline.height });
  
  const diffPixels = pixelmatch(
    baseline.data, 
    current.data, 
    diff.data,
    baseline.width, 
    baseline.height,
    {
      threshold: config.threshold,
      includeAA: config.includeAA
    }
  );
  
  const totalPixels = baseline.width * baseline.height;
  const diffPercentage = (diffPixels / totalPixels) * 100;
  
  // Save diff if there are differences
  if (diffPixels > 0) {
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
  }
  
  const match = diffPixels <= config.maxDiffPixels;
  
  return { match, diffPixels, diffPercentage };
}

/**
 * Wait for mathematical elements to render completely
 */
async function waitForMathematicalRender(page: Page, timeout: number = 5000): Promise<void> {
  // Wait for LaTeX/KaTeX to render
  await page.waitForFunction(() => {
    const katexElements = document.querySelectorAll('.katex');
    const mathElements = document.querySelectorAll('.math');
    return katexElements.length === 0 || Array.from(katexElements).every(el => 
      el.querySelector('.katex-mathml') || el.querySelector('.katex-html')
    );
  }, { timeout });
  
  // Wait for Three.js/WebGL to render
  await page.waitForFunction(() => {
    const canvases = document.querySelectorAll('canvas');
    return Array.from(canvases).every(canvas => {
      const ctx = canvas.getContext('webgl') || canvas.getContext('webgl2');
      return !ctx || ctx.drawingBufferWidth > 0;
    });
  }, { timeout });
  
  // Additional wait for animations to settle
  await page.waitForTimeout(1000);
}

test.describe('Cayley Graph Visualizations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Cayley graph C4 renders consistently', async ({ page }) => {
    // Navigate to group theory explorer
    await page.click('[data-testid="group-theory-link"]');
    await page.waitForLoadState('networkidle');
    
    // Select C4 group
    await page.selectOption('[data-testid="group-selector"]', 'C4');
    await page.waitForTimeout(2000);
    
    // Wait for mathematical rendering
    await waitForMathematicalRender(page);
    
    // Compare Cayley graph visualization
    const result = await compareScreenshot(page, 'cayley-graph-c4', {
      selector: '[data-testid="cayley-graph-container"]',
      threshold: 0.15, // Allow for minor WebGL differences
      maxDiffPixels: 200
    });
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(5);
  });

  test('Cayley graph S3 renders consistently', async ({ page }) => {
    await page.click('[data-testid="group-theory-link"]');
    await page.waitForLoadState('networkidle');
    
    await page.selectOption('[data-testid="group-selector"]', 'S3');
    await page.waitForTimeout(2000);
    
    await waitForMathematicalRender(page);
    
    const result = await compareScreenshot(page, 'cayley-graph-s3', {
      selector: '[data-testid="cayley-graph-container"]',
      threshold: 0.15,
      maxDiffPixels: 200
    });
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(5);
  });

  test('Cayley graph with different generators renders consistently', async ({ page }) => {
    await page.click('[data-testid="group-theory-link"]');
    await page.waitForLoadState('networkidle');
    
    await page.selectOption('[data-testid="group-selector"]', 'D3');
    await page.waitForTimeout(1000);
    
    // Change generators
    await page.click('[data-testid="generator-settings"]');
    await page.uncheck('[data-testid="generator-r"]');
    await page.waitForTimeout(1000);
    
    await waitForMathematicalRender(page);
    
    const result = await compareScreenshot(page, 'cayley-graph-d3-partial-generators', {
      selector: '[data-testid="cayley-graph-container"]',
      threshold: 0.15,
      maxDiffPixels: 200
    });
    
    expect(result.match).toBe(true);
  });

  test('Cayley graph layout algorithms render consistently', async ({ page }) => {
    await page.click('[data-testid="group-theory-link"]');
    await page.waitForLoadState('networkidle');
    
    await page.selectOption('[data-testid="group-selector"]', 'V4');
    await page.waitForTimeout(1000);
    
    // Test different layout algorithms
    const layouts = ['circular', 'rectangular', 'force-directed'];
    
    for (const layout of layouts) {
      await page.selectOption('[data-testid="layout-selector"]', layout);
      await page.waitForTimeout(2000);
      await waitForMathematicalRender(page);
      
      const result = await compareScreenshot(page, `cayley-graph-v4-${layout}`, {
        selector: '[data-testid="cayley-graph-container"]',
        threshold: 0.2, // More tolerance for layout differences
        maxDiffPixels: 300
      });
      
      expect(result.match).toBe(true);
    }
  });

  test('Cayley graph edge highlighting renders consistently', async ({ page }) => {
    await page.click('[data-testid="group-theory-link"]');
    await page.waitForLoadState('networkidle');
    
    await page.selectOption('[data-testid="group-selector"]', 'C3');
    await page.waitForTimeout(1000);
    
    // Hover over a vertex to highlight edges
    await page.hover('[data-testid="vertex-e"]');
    await page.waitForTimeout(500);
    
    await waitForMathematicalRender(page);
    
    const result = await compareScreenshot(page, 'cayley-graph-c3-highlighted', {
      selector: '[data-testid="cayley-graph-container"]',
      threshold: 0.1,
      maxDiffPixels: 150
    });
    
    expect(result.match).toBe(true);
  });
});

test.describe('TDA Persistence Landscape Visualizations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tda-explorer');
    await page.waitForLoadState('networkidle');
  });

  test('TDA persistence landscape 3D renders consistently', async ({ page }) => {
    // Upload or generate sample data
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'circle');
    await page.waitForTimeout(2000);
    
    // Compute persistence
    await page.click('[data-testid="compute-persistence-button"]');
    await page.waitForTimeout(3000);
    
    // Switch to 3D landscape view
    await page.click('[data-testid="view-3d-landscape"]');
    await page.waitForTimeout(2000);
    
    await waitForMathematicalRender(page);
    
    const result = await compareScreenshot(page, 'tda-persistence-landscape-3d-circle', {
      selector: '[data-testid="persistence-landscape-container"]',
      threshold: 0.2, // 3D rendering tolerance
      maxDiffPixels: 500
    });
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(10);
  });

  test('TDA persistence diagram renders consistently', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'torus');
    await page.waitForTimeout(2000);
    
    await page.click('[data-testid="compute-persistence-button"]');
    await page.waitForTimeout(3000);
    
    // Switch to persistence diagram view
    await page.click('[data-testid="view-persistence-diagram"]');
    await page.waitForTimeout(1000);
    
    await waitForMathematicalRender(page);
    
    const result = await compareScreenshot(page, 'tda-persistence-diagram-torus', {
      selector: '[data-testid="persistence-diagram-container"]',
      threshold: 0.1,
      maxDiffPixels: 100
    });
    
    expect(result.match).toBe(true);
  });

  test('TDA point cloud visualization renders consistently', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'klein-bottle');
    await page.waitForTimeout(2000);
    
    // Adjust density settings
    await page.fill('[data-testid="point-density-slider"]', '50');
    await page.waitForTimeout(1000);
    
    await waitForMathematicalRender(page);
    
    const result = await compareScreenshot(page, 'tda-point-cloud-klein-bottle', {
      selector: '[data-testid="point-cloud-container"]',
      threshold: 0.15,
      maxDiffPixels: 200
    });
    
    expect(result.match).toBe(true);
  });

  test('TDA filtration animation renders consistently', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'sphere');
    await page.waitForTimeout(2000);
    
    await page.click('[data-testid="compute-persistence-button"]');
    await page.waitForTimeout(3000);
    
    // Start filtration animation
    await page.click('[data-testid="animate-filtration-button"]');
    await page.waitForTimeout(1000);
    
    // Pause at specific frame
    await page.click('[data-testid="pause-animation-button"]');
    await page.waitForTimeout(500);
    
    await waitForMathematicalRender(page);
    
    const result = await compareScreenshot(page, 'tda-filtration-animation-paused', {
      selector: '[data-testid="filtration-visualization-container"]',
      threshold: 0.2,
      maxDiffPixels: 300
    });
    
    expect(result.match).toBe(true);
  });

  test('TDA density visualization renders consistently', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'clustered');
    await page.waitForTimeout(2000);
    
    // Enable density visualization
    await page.check('[data-testid="show-density-checkbox"]');
    await page.waitForTimeout(1000);
    
    // Adjust density parameters
    await page.fill('[data-testid="density-bandwidth-slider"]', '0.5');
    await page.waitForTimeout(500);
    
    await waitForMathematicalRender(page);
    
    const result = await compareScreenshot(page, 'tda-density-visualization-clustered', {
      selector: '[data-testid="density-visualization-container"]',
      threshold: 0.15,
      maxDiffPixels: 250
    });
    
    expect(result.match).toBe(true);
  });
});

test.describe('Mathematical Notation Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('LaTeX equations render consistently', async ({ page }) => {
    await page.goto('/mathematical-content');
    await page.waitForLoadState('networkidle');
    
    await waitForMathematicalRender(page);
    
    const result = await compareScreenshot(page, 'latex-equations-rendering', {
      selector: '[data-testid="mathematical-content-container"]',
      threshold: 0.05, // Very strict for text rendering
      maxDiffPixels: 50
    });
    
    expect(result.match).toBe(true);
  });

  test('Complex mathematical expressions render consistently', async ({ page }) => {
    await page.goto('/mathematical-content');
    await page.waitForLoadState('networkidle');
    
    // Navigate to specific complex expression
    await page.click('[data-testid="complex-expressions-section"]');
    await page.waitForTimeout(1000);
    
    await waitForMathematicalRender(page);
    
    const result = await compareScreenshot(page, 'complex-mathematical-expressions', {
      selector: '[data-testid="complex-expressions-container"]',
      threshold: 0.05,
      maxDiffPixels: 75
    });
    
    expect(result.match).toBe(true);
  });

  test('Mathematical symbols and operators render consistently', async ({ page }) => {
    await page.goto('/symbol-reference');
    await page.waitForLoadState('networkidle');
    
    await waitForMathematicalRender(page);
    
    const result = await compareScreenshot(page, 'mathematical-symbols-reference', {
      selector: '[data-testid="symbols-grid-container"]',
      threshold: 0.05,
      maxDiffPixels: 30
    });
    
    expect(result.match).toBe(true);
  });

  test('Inline vs display math rendering consistency', async ({ page }) => {
    await page.goto('/math-rendering-demo');
    await page.waitForLoadState('networkidle');
    
    await waitForMathematicalRender(page);
    
    const result = await compareScreenshot(page, 'inline-vs-display-math', {
      selector: '[data-testid="math-comparison-container"]',
      threshold: 0.05,
      maxDiffPixels: 50
    });
    
    expect(result.match).toBe(true);
  });
});

test.describe('Cross-Browser Compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`Mathematical visualizations render consistently in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
      // Skip if not testing the current browser
      if (currentBrowser !== browserName) {
        test.skip();
      }
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test key mathematical visualization
      await page.click('[data-testid="group-theory-link"]');
      await page.waitForLoadState('networkidle');
      
      await page.selectOption('[data-testid="group-selector"]', 'C6');
      await page.waitForTimeout(2000);
      
      await waitForMathematicalRender(page);
      
      const result = await compareScreenshot(page, `cayley-graph-c6-${browserName}`, {
        selector: '[data-testid="cayley-graph-container"]',
        threshold: 0.2, // More tolerance for browser differences
        maxDiffPixels: 400
      });
      
      expect(result.match).toBe(true);
      expect(result.diffPercentage).toBeLessThan(15);
    });
  });
});

test.describe('Responsive Design Consistency', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 }
  ];

  viewports.forEach(viewport => {
    test(`Mathematical visualizations render consistently at ${viewport.name} viewport`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await page.click('[data-testid="group-theory-link"]');
      await page.waitForLoadState('networkidle');
      
      await page.selectOption('[data-testid="group-selector"]', 'V4');
      await page.waitForTimeout(2000);
      
      await waitForMathematicalRender(page);
      
      const result = await compareScreenshot(page, `cayley-graph-v4-${viewport.name}`, {
        selector: '[data-testid="cayley-graph-container"]',
        threshold: 0.2,
        maxDiffPixels: 500 // More tolerance for layout changes
      });
      
      expect(result.match).toBe(true);
      expect(result.diffPercentage).toBeLessThan(20);
    });
  });
});

test.describe('Performance Visual Consistency', () => {
  test('Large dataset visualizations render consistently', async ({ page }) => {
    await page.goto('/tda-explorer');
    await page.waitForLoadState('networkidle');
    
    // Generate large dataset
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'large-random');
    await page.fill('[data-testid="point-count-input"]', '1000');
    await page.waitForTimeout(3000);
    
    await page.click('[data-testid="compute-persistence-button"]');
    await page.waitForTimeout(10000); // Allow time for computation
    
    await waitForMathematicalRender(page, 10000);
    
    const result = await compareScreenshot(page, 'tda-large-dataset-visualization', {
      selector: '[data-testid="persistence-landscape-container"]',
      threshold: 0.25, // More tolerance for complex visualizations
      maxDiffPixels: 1000
    });
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(25);
  });

  test('Animation frame consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.click('[data-testid="group-theory-link"]');
    await page.waitForLoadState('networkidle');
    
    await page.selectOption('[data-testid="group-selector"]', 'S4');
    await page.waitForTimeout(2000);
    
    // Start rotation animation
    await page.click('[data-testid="animate-rotation-button"]');
    await page.waitForTimeout(2000);
    
    // Pause at specific frame
    await page.click('[data-testid="pause-animation-button"]');
    await page.waitForTimeout(100);
    
    await waitForMathematicalRender(page);
    
    const result = await compareScreenshot(page, 'cayley-graph-s4-animation-frame', {
      selector: '[data-testid="cayley-graph-container"]',
      threshold: 0.3, // Animation frames may vary slightly
      maxDiffPixels: 600
    });
    
    expect(result.match).toBe(true);
  });
});

test.describe('Accessibility Visual Consistency', () => {
  test('High contrast mode renders consistently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Enable high contrast mode
    await page.evaluate(() => {
      document.documentElement.classList.add('high-contrast');
    });
    
    await page.click('[data-testid="group-theory-link"]');
    await page.waitForLoadState('networkidle');
    
    await page.selectOption('[data-testid="group-selector"]', 'D4');
    await page.waitForTimeout(2000);
    
    await waitForMathematicalRender(page);
    
    const result = await compareScreenshot(page, 'cayley-graph-d4-high-contrast', {
      selector: '[data-testid="cayley-graph-container"]',
      threshold: 0.15,
      maxDiffPixels: 300
    });
    
    expect(result.match).toBe(true);
  });

  test('Color blind friendly mode renders consistently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Enable color blind friendly mode
    await page.click('[data-testid="accessibility-settings"]');
    await page.check('[data-testid="color-blind-friendly-checkbox"]');
    await page.waitForTimeout(500);
    
    await page.click('[data-testid="group-theory-link"]');
    await page.waitForLoadState('networkidle');
    
    await page.selectOption('[data-testid="group-selector"]', 'A4');
    await page.waitForTimeout(2000);
    
    await waitForMathematicalRender(page);
    
    const result = await compareScreenshot(page, 'cayley-graph-a4-color-blind-friendly', {
      selector: '[data-testid="cayley-graph-container"]',
      threshold: 0.15,
      maxDiffPixels: 250
    });
    
    expect(result.match).toBe(true);
  });
});