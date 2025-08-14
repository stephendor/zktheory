/**
 * Specialized Visual Regression Tests for TDA (Topological Data Analysis) Visualizations
 * Tests specific mathematical accuracy of TDA rendering, persistence landscapes, and topological features
 */

import { test, expect, Page } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import * as fs from 'fs';
import * as path from 'path';

// Test configuration for TDA-specific visual tests
const TDA_BASELINE_DIR = path.join(__dirname, 'baselines', 'tda');
const TDA_OUTPUT_DIR = path.join(__dirname, 'output', 'tda');
const TDA_DIFF_DIR = path.join(__dirname, 'diffs', 'tda');

// Ensure directories exist
[TDA_BASELINE_DIR, TDA_OUTPUT_DIR, TDA_DIFF_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// TDA-specific visual comparison configuration
const TDA_VISUAL_CONFIG = {
  // More strict for 2D plots, more lenient for 3D visualizations
  persistenceDiagram: { threshold: 0.05, maxDiffPixels: 50 },
  persistenceLandscape3D: { threshold: 0.25, maxDiffPixels: 800 },
  filtrationAnimation: { threshold: 0.2, maxDiffPixels: 500 },
  pointCloud: { threshold: 0.1, maxDiffPixels: 200 },
  barcodes: { threshold: 0.03, maxDiffPixels: 30 },
};

/**
 * Helper to compare TDA-specific visualizations
 */
async function compareTDAVisualization(
  page: Page,
  testName: string,
  visualizationType: keyof typeof TDA_VISUAL_CONFIG,
  selector: string
): Promise<{ match: boolean; diffPixels: number; diffPercentage: number }> {
  const config = TDA_VISUAL_CONFIG[visualizationType];
  
  // Take screenshot of specific visualization
  const element = page.locator(selector);
  const screenshot = await element.screenshot();
  
  const outputPath = path.join(TDA_OUTPUT_DIR, `${testName}.png`);
  const baselinePath = path.join(TDA_BASELINE_DIR, `${testName}.png`);
  const diffPath = path.join(TDA_DIFF_DIR, `${testName}-diff.png`);
  
  fs.writeFileSync(outputPath, screenshot);
  
  // Create baseline if it doesn't exist
  if (!fs.existsSync(baselinePath)) {
    fs.writeFileSync(baselinePath, screenshot);
    console.log(`Created TDA baseline for ${testName}`);
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
      includeAA: false
    }
  );
  
  const totalPixels = baseline.width * baseline.height;
  const diffPercentage = (diffPixels / totalPixels) * 100;
  
  if (diffPixels > 0) {
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
  }
  
  const match = diffPixels <= config.maxDiffPixels;
  
  return { match, diffPixels, diffPercentage };
}

/**
 * Wait for TDA computations and visualizations to complete
 */
async function waitForTDAComputation(page: Page, timeout: number = 15000): Promise<void> {
  // Wait for computation to start
  await page.waitForSelector('[data-testid="computation-status"]', { timeout: 5000 });
  
  // Wait for computation to complete
  await page.waitForFunction(() => {
    const status = document.querySelector('[data-testid="computation-status"]')?.textContent;
    return status === 'Complete' || status === 'Ready';
  }, { timeout });
  
  // Wait for visualizations to render
  await page.waitForTimeout(2000);
  
  // Wait for 3D scenes to stabilize
  await page.waitForFunction(() => {
    const canvases = document.querySelectorAll('canvas');
    return Array.from(canvases).every(canvas => {
      const ctx = canvas.getContext('webgl') || canvas.getContext('webgl2');
      return !ctx || ctx.drawingBufferWidth > 0;
    });
  }, { timeout: 5000 });
}

test.describe('TDA Persistence Diagram Accuracy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tda-explorer');
    await page.waitForLoadState('networkidle');
  });

  test('Circle point cloud persistence diagram renders accurately', async ({ page }) => {
    // Load circle dataset
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'circle');
    await page.waitForTimeout(1000);
    
    // Set specific parameters for reproducible results
    await page.fill('[data-testid="filtration-max-input"]', '2.0');
    await page.fill('[data-testid="resolution-input"]', '100');
    
    // Compute persistence
    await page.click('[data-testid="compute-persistence-button"]');
    await waitForTDAComputation(page);
    
    // Switch to persistence diagram view
    await page.click('[data-testid="view-persistence-diagram"]');
    await page.waitForTimeout(1000);
    
    const result = await compareTDAVisualization(
      page,
      'circle-persistence-diagram',
      'persistenceDiagram',
      '[data-testid="persistence-diagram-canvas"]'
    );
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(2);
  });

  test('Torus point cloud persistence diagram shows correct H1 and H2 features', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'torus');
    await page.waitForTimeout(1000);
    
    await page.fill('[data-testid="point-count-input"]', '200');
    await page.fill('[data-testid="noise-level-input"]', '0.1');
    
    await page.click('[data-testid="compute-persistence-button"]');
    await waitForTDAComputation(page);
    
    await page.click('[data-testid="view-persistence-diagram"]');
    await page.waitForTimeout(1000);
    
    const result = await compareTDAVisualization(
      page,
      'torus-persistence-diagram-h1-h2',
      'persistenceDiagram',
      '[data-testid="persistence-diagram-canvas"]'
    );
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(3);
  });

  test('Klein bottle persistence diagram captures topological complexity', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'klein-bottle');
    await page.waitForTimeout(1000);
    
    await page.fill('[data-testid="point-count-input"]', '300');
    
    await page.click('[data-testid="compute-persistence-button"]');
    await waitForTDAComputation(page);
    
    await page.click('[data-testid="view-persistence-diagram"]');
    await page.waitForTimeout(1000);
    
    const result = await compareTDAVisualization(
      page,
      'klein-bottle-persistence-diagram',
      'persistenceDiagram',
      '[data-testid="persistence-diagram-canvas"]'
    );
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(4);
  });

  test('Multi-scale persistence diagram with different filtrations', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'clustered');
    await page.waitForTimeout(1000);
    
    // Test multiple filtration scales
    const filtrationValues = ['0.5', '1.0', '2.0'];
    
    for (const filtration of filtrationValues) {
      await page.fill('[data-testid="filtration-max-input"]', filtration);
      
      await page.click('[data-testid="compute-persistence-button"]');
      await waitForTDAComputation(page);
      
      await page.click('[data-testid="view-persistence-diagram"]');
      await page.waitForTimeout(1000);
      
      const result = await compareTDAVisualization(
        page,
        `clustered-persistence-diagram-filtration-${filtration}`,
        'persistenceDiagram',
        '[data-testid="persistence-diagram-canvas"]'
      );
      
      expect(result.match).toBe(true);
      expect(result.diffPercentage).toBeLessThan(3);
    }
  });
});

test.describe('TDA 3D Persistence Landscapes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tda-explorer');
    await page.waitForLoadState('networkidle');
  });

  test('Sphere persistence landscape 3D visualization accuracy', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'sphere');
    await page.waitForTimeout(1000);
    
    await page.fill('[data-testid="point-count-input"]', '150');
    
    await page.click('[data-testid="compute-persistence-button"]');
    await waitForTDAComputation(page);
    
    // Switch to 3D landscape view
    await page.click('[data-testid="view-3d-landscape"]');
    await page.waitForTimeout(3000); // Allow 3D rendering to stabilize
    
    // Set specific camera angle for consistent screenshots
    await page.evaluate(() => {
      const controls = window.threeJSControls;
      if (controls) {
        controls.reset();
        controls.object.position.set(5, 5, 5);
        controls.object.lookAt(0, 0, 0);
        controls.update();
      }
    });
    await page.waitForTimeout(1000);
    
    const result = await compareTDAVisualization(
      page,
      'sphere-persistence-landscape-3d',
      'persistenceLandscape3D',
      '[data-testid="persistence-landscape-3d-canvas"]'
    );
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(15);
  });

  test('Multiple landscape layers visualization', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'double-torus');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="compute-persistence-button"]');
    await waitForTDAComputation(page);
    
    await page.click('[data-testid="view-3d-landscape"]');
    await page.waitForTimeout(3000);
    
    // Enable multiple landscape layers
    await page.check('[data-testid="show-all-landscape-layers"]');
    await page.waitForTimeout(1000);
    
    // Set consistent camera position
    await page.evaluate(() => {
      const controls = window.threeJSControls;
      if (controls) {
        controls.reset();
        controls.object.position.set(8, 6, 8);
        controls.object.lookAt(0, 0, 0);
        controls.update();
      }
    });
    await page.waitForTimeout(1000);
    
    const result = await compareTDAVisualization(
      page,
      'double-torus-multi-layer-landscape',
      'persistenceLandscape3D',
      '[data-testid="persistence-landscape-3d-canvas"]'
    );
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(20);
  });

  test('Interactive 3D landscape with highlighting', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'figure-eight');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="compute-persistence-button"]');
    await waitForTDAComputation(page);
    
    await page.click('[data-testid="view-3d-landscape"]');
    await page.waitForTimeout(3000);
    
    // Hover over specific region to highlight features
    await page.hover('[data-testid="persistence-landscape-3d-canvas"]', {
      position: { x: 200, y: 150 }
    });
    await page.waitForTimeout(500);
    
    const result = await compareTDAVisualization(
      page,
      'figure-eight-landscape-highlighted',
      'persistenceLandscape3D',
      '[data-testid="persistence-landscape-3d-canvas"]'
    );
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(18);
  });
});

test.describe('TDA Filtration Visualization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tda-explorer');
    await page.waitForLoadState('networkidle');
  });

  test('Filtration animation frame consistency', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'circle');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="compute-persistence-button"]');
    await waitForTDAComputation(page);
    
    // Switch to filtration view
    await page.click('[data-testid="view-filtration"]');
    await page.waitForTimeout(1000);
    
    // Test specific filtration values
    const filtrationSteps = ['0.2', '0.5', '0.8', '1.2'];
    
    for (const step of filtrationSteps) {
      await page.fill('[data-testid="filtration-slider"]', step);
      await page.waitForTimeout(1000);
      
      const result = await compareTDAVisualization(
        page,
        `circle-filtration-step-${step}`,
        'filtrationAnimation',
        '[data-testid="filtration-visualization-canvas"]'
      );
      
      expect(result.match).toBe(true);
      expect(result.diffPercentage).toBeLessThan(12);
    }
  });

  test('Complex connectivity animation', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'clustered');
    await page.waitForTimeout(1000);
    
    await page.fill('[data-testid="cluster-count-input"]', '4');
    await page.fill('[data-testid="cluster-separation-input"]', '3.0');
    
    await page.click('[data-testid="compute-persistence-button"]');
    await waitForTDAComputation(page);
    
    await page.click('[data-testid="view-filtration"]');
    await page.waitForTimeout(1000);
    
    // Test critical filtration values where topology changes
    await page.fill('[data-testid="filtration-slider"]', '1.5'); // Intra-cluster connections
    await page.waitForTimeout(1000);
    
    const result1 = await compareTDAVisualization(
      page,
      'clustered-filtration-intra-cluster',
      'filtrationAnimation',
      '[data-testid="filtration-visualization-canvas"]'
    );
    
    await page.fill('[data-testid="filtration-slider"]', '3.5'); // Inter-cluster connections
    await page.waitForTimeout(1000);
    
    const result2 = await compareTDAVisualization(
      page,
      'clustered-filtration-inter-cluster',
      'filtrationAnimation',
      '[data-testid="filtration-visualization-canvas"]'
    );
    
    expect(result1.match).toBe(true);
    expect(result2.match).toBe(true);
    expect(result1.diffPercentage).toBeLessThan(10);
    expect(result2.diffPercentage).toBeLessThan(10);
  });
});

test.describe('TDA Point Cloud Visualizations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tda-explorer');
    await page.waitForLoadState('networkidle');
  });

  test('High-dimensional point cloud projection accuracy', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'high-dimensional');
    await page.waitForTimeout(1000);
    
    await page.fill('[data-testid="dimension-input"]', '10');
    await page.fill('[data-testid="point-count-input"]', '500');
    
    // Switch to point cloud view
    await page.click('[data-testid="view-point-cloud"]');
    await page.waitForTimeout(2000);
    
    // Test different projection methods
    const projections = ['pca', 'tsne', 'umap'];
    
    for (const projection of projections) {
      await page.selectOption('[data-testid="projection-method-selector"]', projection);
      await page.waitForTimeout(3000); // Allow projection computation
      
      const result = await compareTDAVisualization(
        page,
        `high-dim-point-cloud-${projection}`,
        'pointCloud',
        '[data-testid="point-cloud-canvas"]'
      );
      
      expect(result.match).toBe(true);
      expect(result.diffPercentage).toBeLessThan(8);
    }
  });

  test('Density-based coloring accuracy', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'mixed-density');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="view-point-cloud"]');
    await page.waitForTimeout(1000);
    
    // Enable density coloring
    await page.check('[data-testid="color-by-density-checkbox"]');
    await page.waitForTimeout(1000);
    
    // Adjust density parameters
    await page.fill('[data-testid="density-bandwidth-slider"]', '0.3');
    await page.waitForTimeout(1000);
    
    const result = await compareTDAVisualization(
      page,
      'mixed-density-point-cloud-colored',
      'pointCloud',
      '[data-testid="point-cloud-canvas"]'
    );
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(6);
  });

  test('Persistence-based point highlighting', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'noisy-circle');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="compute-persistence-button"]');
    await waitForTDAComputation(page);
    
    await page.click('[data-testid="view-point-cloud"]');
    await page.waitForTimeout(1000);
    
    // Enable persistence-based highlighting
    await page.check('[data-testid="highlight-persistent-features-checkbox"]');
    await page.waitForTimeout(1000);
    
    // Select specific persistence threshold
    await page.fill('[data-testid="persistence-threshold-slider"]', '0.5');
    await page.waitForTimeout(1000);
    
    const result = await compareTDAVisualization(
      page,
      'noisy-circle-persistence-highlighted',
      'pointCloud',
      '[data-testid="point-cloud-canvas"]'
    );
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(7);
  });
});

test.describe('TDA Barcode Diagrams', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tda-explorer');
    await page.waitForLoadState('networkidle');
  });

  test('Multi-dimensional barcode rendering accuracy', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'complex-manifold');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="compute-persistence-button"]');
    await waitForTDAComputation(page);
    
    // Switch to barcode view
    await page.click('[data-testid="view-barcodes"]');
    await page.waitForTimeout(1000);
    
    const result = await compareTDAVisualization(
      page,
      'complex-manifold-barcodes-multi-dim',
      'barcodes',
      '[data-testid="barcodes-canvas"]'
    );
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(2);
  });

  test('Barcode length sorting and filtering', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'noisy-torus');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="compute-persistence-button"]');
    await waitForTDAComputation(page);
    
    await page.click('[data-testid="view-barcodes"]');
    await page.waitForTimeout(1000);
    
    // Test different sorting options
    await page.selectOption('[data-testid="barcode-sort-selector"]', 'length-descending');
    await page.waitForTimeout(500);
    
    // Apply persistence threshold filter
    await page.fill('[data-testid="min-persistence-filter"]', '0.2');
    await page.waitForTimeout(500);
    
    const result = await compareTDAVisualization(
      page,
      'noisy-torus-barcodes-filtered-sorted',
      'barcodes',
      '[data-testid="barcodes-canvas"]'
    );
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(2);
  });

  test('Interactive barcode selection and highlighting', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'double-circle');
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="compute-persistence-button"]');
    await waitForTDAComputation(page);
    
    await page.click('[data-testid="view-barcodes"]');
    await page.waitForTimeout(1000);
    
    // Click on specific barcode to highlight
    await page.click('[data-testid="barcodes-canvas"]', {
      position: { x: 150, y: 50 }
    });
    await page.waitForTimeout(500);
    
    const result = await compareTDAVisualization(
      page,
      'double-circle-barcodes-selected',
      'barcodes',
      '[data-testid="barcodes-canvas"]'
    );
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(3);
  });
});

test.describe('TDA Statistical Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tda-explorer');
    await page.waitForLoadState('networkidle');
  });

  test('Bootstrap persistence confidence bands', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'circle');
    await page.waitForTimeout(1000);
    
    // Enable bootstrap analysis
    await page.check('[data-testid="enable-bootstrap-checkbox"]');
    await page.fill('[data-testid="bootstrap-samples-input"]', '50');
    
    await page.click('[data-testid="compute-persistence-button"]');
    await waitForTDAComputation(page, 30000); // Bootstrap takes longer
    
    await page.click('[data-testid="view-persistence-diagram"]');
    await page.waitForTimeout(1000);
    
    // Show confidence bands
    await page.check('[data-testid="show-confidence-bands-checkbox"]');
    await page.waitForTimeout(1000);
    
    const result = await compareTDAVisualization(
      page,
      'circle-persistence-diagram-confidence-bands',
      'persistenceDiagram',
      '[data-testid="persistence-diagram-canvas"]'
    );
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(8);
  });

  test('Persistence stability analysis visualization', async ({ page }) => {
    await page.click('[data-testid="sample-data-button"]');
    await page.selectOption('[data-testid="sample-data-selector"]', 'noisy-sphere');
    await page.waitForTimeout(1000);
    
    await page.fill('[data-testid="noise-level-input"]', '0.1');
    
    // Enable stability analysis
    await page.check('[data-testid="enable-stability-analysis-checkbox"]');
    await page.fill('[data-testid="perturbation-count-input"]', '20');
    
    await page.click('[data-testid="compute-persistence-button"]');
    await waitForTDAComputation(page, 45000);
    
    // Switch to stability view
    await page.click('[data-testid="view-stability-analysis"]');
    await page.waitForTimeout(2000);
    
    const result = await compareTDAVisualization(
      page,
      'noisy-sphere-stability-analysis',
      'persistenceDiagram',
      '[data-testid="stability-analysis-canvas"]'
    );
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(10);
  });
});