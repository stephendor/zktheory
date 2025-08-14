/**
 * End-to-End Tests for Mathematical Workflows
 * Tests complete user journeys through mathematical tools and visualizations
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const MATHEMATICAL_TIMEOUT = 15000;
const ANIMATION_WAIT = 1000;
const COMPUTATION_WAIT = 2000;

test.describe('Mathematical Workflows - Core User Journeys', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Cayley Graph Explorer Workflow', () => {
    test('complete Cayley graph exploration journey', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      // Navigate to Cayley graph explorer
      await page.click('text=Cayley Graphs');
      await page.waitForSelector('[data-testid="cayley-graph-container"]', { timeout: 10000 });

      // Select a group from the dropdown
      await page.click('[data-testid="group-selector"]');
      await page.click('text=S3 - Symmetric Group');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Verify graph is generated
      const graphSvg = page.locator('[data-testid="cayley-graph-svg"]');
      await expect(graphSvg).toBeVisible();

      // Check that vertices are rendered
      const vertices = page.locator('[data-testid="graph-vertex"]');
      await expect(vertices).toHaveCount(6); // S3 has 6 elements

      // Check that edges are rendered
      const edges = page.locator('[data-testid="graph-edge"]');
      await expect(edges.first()).toBeVisible();

      // Test interactive features - click on a vertex
      await vertices.first().click();
      await page.waitForTimeout(ANIMATION_WAIT);

      // Verify vertex selection UI appears
      await expect(page.locator('[data-testid="vertex-info-panel"]')).toBeVisible();

      // Test generator selection
      await page.click('[data-testid="generator-checkbox-a"]');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Verify graph updates with new generator set
      await expect(graphSvg).toBeVisible();

      // Test layout change
      await page.click('[data-testid="layout-selector"]');
      await page.click('text=Force Layout');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Verify layout animation completes
      await expect(graphSvg).toBeVisible();

      // Test export functionality
      await page.click('[data-testid="export-button"]');
      await page.click('text=Export as SVG');
      
      // Verify download is triggered (check for download event)
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="confirm-export"]');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/cayley.*\.svg$/);
    });

    test('group comparison workflow', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('text=Cayley Graphs');
      await page.waitForSelector('[data-testid="cayley-graph-container"]');

      // Enable comparison mode
      await page.click('[data-testid="comparison-mode-toggle"]');
      await expect(page.locator('[data-testid="comparison-panel"]')).toBeVisible();

      // Select first group
      await page.click('[data-testid="group-selector-1"]');
      await page.click('text=V4 - Klein Four Group');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Select second group
      await page.click('[data-testid="group-selector-2"]');
      await page.click('text=C4 - Cyclic Group');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Verify both graphs are displayed
      await expect(page.locator('[data-testid="graph-container-1"]')).toBeVisible();
      await expect(page.locator('[data-testid="graph-container-2"]')).toBeVisible();

      // Check comparison statistics
      await expect(page.locator('[data-testid="comparison-stats"]')).toBeVisible();
      await expect(page.locator('text=Both groups have order 4')).toBeVisible();

      // Test isomorphism checking
      await page.click('[data-testid="check-isomorphism"]');
      await page.waitForTimeout(COMPUTATION_WAIT);
      await expect(page.locator('[data-testid="isomorphism-result"]')).toBeVisible();
    });

    test('Cayley graph mathematical properties verification', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('text=Cayley Graphs');
      await page.waitForSelector('[data-testid="cayley-graph-container"]');

      // Select dihedral group for rich structure
      await page.click('[data-testid="group-selector"]');
      await page.click('text=D3 - Dihedral Group');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Open properties panel
      await page.click('[data-testid="properties-panel-toggle"]');
      await expect(page.locator('[data-testid="properties-panel"]')).toBeVisible();

      // Verify mathematical properties are displayed
      await expect(page.locator('text=Order: 6')).toBeVisible();
      await expect(page.locator('text=Abelian: No')).toBeVisible();
      await expect(page.locator('text=Generators: 2')).toBeVisible();

      // Test conjugacy class highlighting
      await page.click('[data-testid="conjugacy-class-toggle"]');
      await page.waitForTimeout(ANIMATION_WAIT);

      // Verify vertices are colored by conjugacy class
      const coloredVertices = page.locator('[data-testid="graph-vertex"][data-conjugacy-class]');
      await expect(coloredVertices.first()).toBeVisible();

      // Test subgroup highlighting
      await page.click('[data-testid="subgroup-selector"]');
      await page.click('text=Cyclic Subgroup ⟨r⟩');
      await page.waitForTimeout(ANIMATION_WAIT);

      // Verify subgroup vertices are highlighted
      const highlightedVertices = page.locator('[data-testid="graph-vertex"][data-highlighted="true"]');
      await expect(highlightedVertices).toHaveCount(3); // Cyclic subgroup of order 3
    });
  });

  test.describe('TDA Explorer Workflow', () => {
    test('complete topological data analysis journey', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      // Navigate to TDA Explorer
      await page.click('text=TDA Explorer');
      await page.waitForSelector('[data-testid="tda-explorer-container"]', { timeout: 10000 });

      // Generate point cloud data
      await page.click('[data-testid="data-generation-panel"]');
      await page.click('[data-testid="pattern-circle"]');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Verify point cloud is rendered
      const pointCloud = page.locator('[data-testid="point-cloud-canvas"]');
      await expect(pointCloud).toBeVisible();

      // Adjust point count
      await page.fill('[data-testid="point-count-input"]', '50');
      await page.click('[data-testid="regenerate-points"]');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Verify point count updated
      await expect(page.locator('text=Points: 50')).toBeVisible();

      // Adjust filtration parameter
      const filtrationSlider = page.locator('[data-testid="filtration-slider"]');
      await filtrationSlider.fill('0.3');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Verify persistence computation
      await expect(page.locator('[data-testid="persistence-diagram"]')).toBeVisible();
      await expect(page.locator('[data-testid="persistence-barcode"]')).toBeVisible();

      // Switch to different visualization tabs
      await page.click('[data-testid="tab-mapper"]');
      await page.waitForTimeout(ANIMATION_WAIT);
      await expect(page.locator('[data-testid="mapper-visualization"]')).toBeVisible();

      await page.click('[data-testid="tab-landscape"]');
      await page.waitForTimeout(ANIMATION_WAIT);
      await expect(page.locator('[data-testid="landscape-3d"]')).toBeVisible();

      // Test advanced features
      await page.click('[data-testid="tab-persistence"]');
      await page.click('[data-testid="advanced-settings"]');
      await expect(page.locator('[data-testid="advanced-panel"]')).toBeVisible();

      // Adjust homology dimension
      await page.click('[data-testid="dimension-h1"]');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Verify H1 features are computed
      const h1Intervals = page.locator('[data-testid="h1-interval"]');
      await expect(h1Intervals.first()).toBeVisible();
    });

    test('data import and export workflow', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('text=TDA Explorer');
      await page.waitForSelector('[data-testid="tda-explorer-container"]');

      // Test CSV file upload
      await page.click('[data-testid="data-import-export"]');
      await expect(page.locator('[data-testid="import-export-panel"]')).toBeVisible();

      // Create a test CSV content
      const csvContent = 'x,y\n0,0\n1,0\n0.5,0.866\n0,0\n';
      
      // Simulate file upload
      const fileInput = page.locator('[data-testid="file-input"]');
      await fileInput.setInputFiles({
        name: 'test-points.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from(csvContent)
      });

      await page.waitForTimeout(COMPUTATION_WAIT);

      // Verify points were imported
      await expect(page.locator('text=Points: 4')).toBeVisible();

      // Test data export
      await page.click('[data-testid="export-points"]');
      
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-json"]');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/points.*\.json$/);

      // Test persistence export
      await page.click('[data-testid="export-persistence"]');
      
      const persistenceDownloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-persistence-csv"]');
      const persistenceDownload = await persistenceDownloadPromise;
      expect(persistenceDownload.suggestedFilename()).toMatch(/persistence.*\.csv$/);
    });

    test('real-time computation workflow', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('text=TDA Explorer');
      await page.waitForSelector('[data-testid="tda-explorer-container"]');

      // Enable real-time mode
      await page.click('[data-testid="realtime-toggle"]');
      await expect(page.locator('[data-testid="realtime-indicator"]')).toBeVisible();

      // Add points by clicking on canvas
      const canvas = page.locator('[data-testid="point-cloud-canvas"]');
      
      // Click at different positions to add points
      await canvas.click({ position: { x: 100, y: 100 } });
      await page.waitForTimeout(500);
      await canvas.click({ position: { x: 200, y: 100 } });
      await page.waitForTimeout(500);
      await canvas.click({ position: { x: 150, y: 200 } });
      await page.waitForTimeout(500);

      // Verify points were added and persistence updated
      await expect(page.locator('text=Points: 3')).toBeVisible();
      await expect(page.locator('[data-testid="persistence-diagram"]')).toBeVisible();

      // Test drag to move points
      await canvas.hover({ position: { x: 100, y: 100 } });
      await page.mouse.down();
      await page.mouse.move(120, 120);
      await page.mouse.up();
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Verify persistence updated after point movement
      await expect(page.locator('[data-testid="persistence-diagram"]')).toBeVisible();
    });

    test('performance monitoring workflow', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('text=TDA Explorer');
      await page.waitForSelector('[data-testid="tda-explorer-container"]');

      // Enable performance monitoring
      await page.click('[data-testid="performance-panel"]');
      await expect(page.locator('[data-testid="performance-metrics"]')).toBeVisible();

      // Generate large dataset to test performance
      await page.fill('[data-testid="point-count-input"]', '200');
      await page.click('[data-testid="pattern-random"]');
      await page.click('[data-testid="regenerate-points"]');

      // Monitor computation time
      const computationStart = Date.now();
      await page.waitForSelector('[data-testid="computation-complete"]', { timeout: 10000 });
      const computationTime = Date.now() - computationStart;

      // Verify performance metrics are displayed
      await expect(page.locator('[data-testid="computation-time"]')).toBeVisible();
      await expect(page.locator('[data-testid="memory-usage"]')).toBeVisible();
      await expect(page.locator('[data-testid="frame-rate"]')).toBeVisible();

      // Performance should be reasonable (less than 5 seconds for 200 points)
      expect(computationTime).toBeLessThan(5000);

      // Check for performance warnings
      const warningElement = page.locator('[data-testid="performance-warning"]');
      if (await warningElement.isVisible()) {
        const warningText = await warningElement.textContent();
        console.warn('Performance warning detected:', warningText);
      }
    });
  });

  test.describe('Mathematical Notation and LaTeX Workflow', () => {
    test('LaTeX rendering and editing workflow', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      // Navigate to a page with mathematical content
      await page.goto('/documentation/concepts');
      await page.waitForLoadState('networkidle');

      // Verify LaTeX equations are rendered
      const mathEquations = page.locator('.katex');
      await expect(mathEquations.first()).toBeVisible();

      // Test inline math rendering
      const inlineMath = page.locator('.katex-inline');
      if (await inlineMath.count() > 0) {
        await expect(inlineMath.first()).toBeVisible();
      }

      // Test display math rendering
      const displayMath = page.locator('.katex-display');
      if (await displayMath.count() > 0) {
        await expect(displayMath.first()).toBeVisible();
      }

      // Navigate to interactive math editor if available
      const mathEditor = page.locator('[data-testid="math-editor"]');
      if (await mathEditor.isVisible()) {
        await mathEditor.click();

        // Test equation input
        await page.fill('[data-testid="latex-input"]', '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}');
        await page.waitForTimeout(1000);

        // Verify live preview
        await expect(page.locator('[data-testid="latex-preview"]')).toBeVisible();

        // Test equation insertion
        await page.click('[data-testid="insert-equation"]');
        await expect(page.locator('[data-testid="inserted-equation"]')).toBeVisible();
      }
    });

    test('mathematical symbol palette workflow', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.goto('/tools/math-editor');
      await page.waitForLoadState('networkidle');

      // Open symbol palette
      if (await page.locator('[data-testid="symbol-palette-toggle"]').isVisible()) {
        await page.click('[data-testid="symbol-palette-toggle"]');
        await expect(page.locator('[data-testid="symbol-palette"]')).toBeVisible();

        // Test different symbol categories
        await page.click('[data-testid="category-greek"]');
        await expect(page.locator('[data-testid="symbol-alpha"]')).toBeVisible();

        await page.click('[data-testid="category-operators"]');
        await expect(page.locator('[data-testid="symbol-integral"]')).toBeVisible();

        await page.click('[data-testid="category-relations"]');
        await expect(page.locator('[data-testid="symbol-leq"]')).toBeVisible();

        // Test symbol insertion
        await page.click('[data-testid="symbol-sum"]');
        const editor = page.locator('[data-testid="latex-input"]');
        const editorValue = await editor.inputValue();
        expect(editorValue).toContain('\\sum');
      }
    });
  });

  test.describe('Cross-Component Integration Workflow', () => {
    test('navigation between mathematical tools', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      // Start with Cayley graphs
      await page.click('text=Cayley Graphs');
      await page.waitForSelector('[data-testid="cayley-graph-container"]');

      // Select a group and explore
      await page.click('[data-testid="group-selector"]');
      await page.click('text=S3 - Symmetric Group');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Navigate to TDA while preserving context
      await page.click('text=TDA Explorer');
      await page.waitForSelector('[data-testid="tda-explorer-container"]');

      // Check if navigation preserved any relevant state
      const backButton = page.locator('[data-testid="back-to-cayley"]');
      if (await backButton.isVisible()) {
        await backButton.click();
        await page.waitForSelector('[data-testid="cayley-graph-container"]');
        // Verify previous state was restored
        await expect(page.locator('text=S3')).toBeVisible();
      }

      // Test breadcrumb navigation
      const breadcrumb = page.locator('[data-testid="breadcrumb"]');
      if (await breadcrumb.isVisible()) {
        await expect(breadcrumb).toContainText('Mathematical Tools');
      }
    });

    test('data sharing between components', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      // Generate data in TDA Explorer
      await page.click('text=TDA Explorer');
      await page.waitForSelector('[data-testid="tda-explorer-container"]');

      await page.click('[data-testid="pattern-circle"]');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Export data
      await page.click('[data-testid="data-import-export"]');
      const exportData = page.locator('[data-testid="export-for-analysis"]');
      
      if (await exportData.isVisible()) {
        await exportData.click();
        
        // Navigate to analysis tool
        await page.click('text=Data Analysis');
        if (await page.locator('[data-testid="analysis-container"]').isVisible()) {
          // Verify data was imported
          await expect(page.locator('[data-testid="imported-data-preview"]')).toBeVisible();
        }
      }
    });

    test('mathematical computation consistency across tools', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      // Test that mathematical computations are consistent
      // between different tools using the same underlying algorithms

      // Generate the same group in different contexts
      const groupOrder = '6';
      
      // Check in Cayley graph explorer
      await page.click('text=Cayley Graphs');
      await page.waitForSelector('[data-testid="cayley-graph-container"]');
      
      await page.click('[data-testid="group-selector"]');
      await page.click('text=S3 - Symmetric Group');
      
      const cayleyOrder = page.locator('[data-testid="group-order"]');
      if (await cayleyOrder.isVisible()) {
        const cayleyOrderText = await cayleyOrder.textContent();
        expect(cayleyOrderText).toContain(groupOrder);
      }

      // Check in group theory explorer if available
      const groupTheoryLink = page.locator('text=Group Theory');
      if (await groupTheoryLink.isVisible()) {
        await groupTheoryLink.click();
        await page.waitForSelector('[data-testid="group-theory-container"]');
        
        await page.click('[data-testid="group-selector"]');
        await page.click('text=S3 - Symmetric Group');
        
        const theoryOrder = page.locator('[data-testid="group-order"]');
        if (await theoryOrder.isVisible()) {
          const theoryOrderText = await theoryOrder.textContent();
          expect(theoryOrderText).toContain(groupOrder);
        }
      }
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('handles invalid mathematical input gracefully', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('text=TDA Explorer');
      await page.waitForSelector('[data-testid="tda-explorer-container"]');

      // Test with empty point set
      await page.click('[data-testid="clear-points"]');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Should show appropriate message
      const emptyMessage = page.locator('[data-testid="empty-data-message"]');
      await expect(emptyMessage).toBeVisible();

      // Test with invalid file upload
      await page.click('[data-testid="data-import-export"]');
      
      const fileInput = page.locator('[data-testid="file-input"]');
      await fileInput.setInputFiles({
        name: 'invalid.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('invalid data format')
      });

      await page.waitForTimeout(1000);

      // Should show error message
      const errorMessage = page.locator('[data-testid="import-error"]');
      await expect(errorMessage).toBeVisible();
    });

    test('handles computation errors gracefully', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('text=TDA Explorer');
      await page.waitForSelector('[data-testid="tda-explorer-container"]');

      // Try to trigger computation error with extreme parameters
      await page.fill('[data-testid="point-count-input"]', '10000'); // Very large
      
      // Monitor for error handling
      const errorIndicator = page.locator('[data-testid="computation-error"]');
      const loadingIndicator = page.locator('[data-testid="computation-loading"]');

      await page.click('[data-testid="regenerate-points"]');
      
      // Either computation succeeds or error is handled gracefully
      try {
        await page.waitForSelector('[data-testid="computation-complete"]', { timeout: 8000 });
      } catch {
        // If computation fails, verify error is handled
        if (await errorIndicator.isVisible()) {
          await expect(errorIndicator).toContainText('computation');
        }
      }

      // Should not leave interface in broken state
      await expect(page.locator('[data-testid="tda-explorer-container"]')).toBeVisible();
    });

    test('handles browser compatibility issues', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      // Test WebGL availability for 3D visualizations
      const webglSupported = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      });

      await page.click('text=TDA Explorer');
      await page.waitForSelector('[data-testid="tda-explorer-container"]');
      
      await page.click('[data-testid="tab-landscape"]');
      
      if (!webglSupported) {
        // Should show fallback message
        const fallbackMessage = page.locator('[data-testid="webgl-fallback"]');
        await expect(fallbackMessage).toBeVisible();
      } else {
        // Should render 3D visualization
        await expect(page.locator('[data-testid="landscape-3d"]')).toBeVisible();
      }
    });
  });
});

  test.describe('Advanced Mathematical Validation Workflows', () => {
    test('mathematical proof verification workflow', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      // Navigate to a mathematical proof interface if available
      if (await page.locator('[data-testid="proof-verification-link"]').isVisible()) {
        await page.click('[data-testid="proof-verification-link"]');
        await page.waitForSelector('[data-testid="proof-container"]');

        // Test step-by-step proof validation
        await page.click('[data-testid="proof-template-selector"]');
        await page.click('text=Lagrange Theorem Proof');
        await page.waitForTimeout(COMPUTATION_WAIT);

        // Verify proof steps are displayed
        await expect(page.locator('[data-testid="proof-steps"]')).toBeVisible();
        
        // Validate each step
        const steps = await page.locator('[data-testid="proof-step"]').count();
        for (let i = 0; i < steps; i++) {
          const step = page.locator('[data-testid="proof-step"]').nth(i);
          await step.click();
          await page.waitForTimeout(500);
          
          // Each step should have validation
          await expect(page.locator('[data-testid="step-validation"]')).toBeVisible();
        }

        // Test proof completion
        await page.click('[data-testid="verify-complete-proof"]');
        await page.waitForTimeout(COMPUTATION_WAIT);
        await expect(page.locator('[data-testid="proof-verification-result"]')).toContainText('Valid');
      }
    });

    test('mathematical conjecture testing workflow', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('text=TDA Explorer');
      await page.waitForSelector('[data-testid="tda-explorer-container"]');

      // Test mathematical conjectures with data
      if (await page.locator('[data-testid="conjecture-testing"]').isVisible()) {
        await page.click('[data-testid="conjecture-testing"]');
        
        // Select a conjecture to test
        await page.click('[data-testid="conjecture-selector"]');
        await page.click('text=Persistent Homology Stability');
        await page.waitForTimeout(COMPUTATION_WAIT);

        // Generate test cases
        await page.click('[data-testid="generate-test-cases"]');
        await page.waitForTimeout(COMPUTATION_WAIT);

        // Run conjecture tests
        await page.click('[data-testid="run-conjecture-tests"]');
        await page.waitForTimeout(COMPUTATION_WAIT * 2);

        // Verify test results
        await expect(page.locator('[data-testid="test-results-summary"]')).toBeVisible();
        await expect(page.locator('[data-testid="passed-tests-count"]')).toBeVisible();
        
        if (await page.locator('[data-testid="failed-tests-count"]').isVisible()) {
          const failedCount = await page.locator('[data-testid="failed-tests-count"]').textContent();
          console.log('Conjecture test failures:', failedCount);
        }
      }
    });

    test('mathematical optimization workflow', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('text=Cayley Graphs');
      await page.waitForSelector('[data-testid="cayley-graph-container"]');

      // Test graph layout optimization
      await page.click('[data-testid="group-selector"]');
      await page.click('text=S4 - Symmetric Group');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Access layout optimization if available
      if (await page.locator('[data-testid="layout-optimization"]').isVisible()) {
        await page.click('[data-testid="layout-optimization"]');
        await expect(page.locator('[data-testid="optimization-panel"]')).toBeVisible();

        // Test different optimization objectives
        await page.click('[data-testid="minimize-edge-crossings"]');
        await page.click('[data-testid="start-optimization"]');
        await page.waitForTimeout(COMPUTATION_WAIT);

        const initialCrossings = await page.locator('[data-testid="edge-crossings-count"]').textContent();

        // Try force-directed optimization
        await page.click('[data-testid="force-directed-optimization"]');
        await page.waitForTimeout(COMPUTATION_WAIT);

        const optimizedCrossings = await page.locator('[data-testid="edge-crossings-count"]').textContent();
        console.log(`Edge crossings: ${initialCrossings} → ${optimizedCrossings}`);

        // Test convergence
        await expect(page.locator('[data-testid="optimization-converged"]')).toBeVisible();
      }
    });
  });

  test.describe('Mathematical Collaboration and Sharing Workflows', () => {
    test('mathematical workspace sharing workflow', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('text=TDA Explorer');
      await page.waitForSelector('[data-testid="tda-explorer-container"]');

      // Create a workspace with mathematical content
      await page.click('[data-testid="pattern-circle"]');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Add annotations and analysis
      if (await page.locator('[data-testid="add-annotation"]').isVisible()) {
        await page.click('[data-testid="add-annotation"]');
        await page.fill('[data-testid="annotation-text"]', 'This circle shows clear H1 persistence');
        await page.click('[data-testid="save-annotation"]');
        await page.waitForTimeout(500);
      }

      // Test workspace export for sharing
      if (await page.locator('[data-testid="share-workspace"]').isVisible()) {
        await page.click('[data-testid="share-workspace"]');
        await expect(page.locator('[data-testid="sharing-options"]')).toBeVisible();

        // Generate shareable link
        await page.click('[data-testid="generate-share-link"]');
        await page.waitForTimeout(1000);

        const shareLink = await page.locator('[data-testid="share-link"]').textContent();
        expect(shareLink).toMatch(/^https?:\/\//);

        // Test workspace export
        await page.click('[data-testid="export-workspace"]');
        const downloadPromise = page.waitForEvent('download');
        await page.click('[data-testid="export-json"]');
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/workspace.*\.json$/);
      }
    });

    test('mathematical publication workflow', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('text=Cayley Graphs');
      await page.waitForSelector('[data-testid="cayley-graph-container"]');

      // Create content suitable for publication
      await page.click('[data-testid="group-selector"]');
      await page.click('text=A4 - Alternating Group');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Generate publication-ready exports
      if (await page.locator('[data-testid="publication-export"]').isVisible()) {
        await page.click('[data-testid="publication-export"]');
        await expect(page.locator('[data-testid="publication-panel"]')).toBeVisible();

        // Test high-resolution figure export
        await page.click('[data-testid="export-figure"]');
        await page.selectOption('[data-testid="resolution-selector"]', '300dpi');
        
        const figureDownloadPromise = page.waitForEvent('download');
        await page.click('[data-testid="export-png"]');
        const figureDownload = await figureDownloadPromise;
        expect(figureDownload.suggestedFilename()).toMatch(/figure.*\.png$/);

        // Test LaTeX table export
        await page.click('[data-testid="export-latex-table"]');
        
        const latexDownloadPromise = page.waitForEvent('download');
        await page.click('[data-testid="export-table"]');
        const latexDownload = await latexDownloadPromise;
        expect(latexDownload.suggestedFilename()).toMatch(/table.*\.tex$/);

        // Test bibliography entry generation
        if (await page.locator('[data-testid="generate-citation"]').isVisible()) {
          await page.click('[data-testid="generate-citation"]');
          await expect(page.locator('[data-testid="bibtex-entry"]')).toBeVisible();
          await expect(page.locator('[data-testid="apa-citation"]')).toBeVisible();
        }
      }
    });
  });

test.describe('Mathematical Workflows - Accessibility', () => {
  test('keyboard navigation works correctly', async ({ page }) => {
    test.setTimeout(MATHEMATICAL_TIMEOUT);

    await page.goto('/');
    
    // Test keyboard navigation through mathematical tools
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should navigate to mathematical tool
    await page.waitForLoadState('networkidle');
    
    // Test within mathematical interface
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('screen reader compatibility', async ({ page }) => {
    test.setTimeout(MATHEMATICAL_TIMEOUT);

    await page.goto('/');
    
    // Check for proper ARIA labels
    const mathElements = page.locator('[role="math"]');
    if (await mathElements.count() > 0) {
      await expect(mathElements.first()).toHaveAttribute('aria-label');
    }
    
    // Check for descriptive alt text on mathematical visualizations
    const mathImages = page.locator('[data-testid*="math"], [data-testid*="graph"], [data-testid*="diagram"]');
    for (let i = 0; i < await mathImages.count(); i++) {
      const element = mathImages.nth(i);
      if (await element.getAttribute('role') === 'img') {
        await expect(element).toHaveAttribute('aria-label');
      }
    }
  });

  test('high contrast mode compatibility', async ({ page }) => {
    test.setTimeout(MATHEMATICAL_TIMEOUT);

    // Simulate high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * { 
            background: black !important; 
            color: white !important; 
          }
        }
      `
    });

    await page.goto('/');
    await page.click('text=Cayley Graphs');
    await page.waitForSelector('[data-testid="cayley-graph-container"]');

    // Verify mathematical content is still visible
    const graphContainer = page.locator('[data-testid="cayley-graph-container"]');
    await expect(graphContainer).toBeVisible();
  });
});