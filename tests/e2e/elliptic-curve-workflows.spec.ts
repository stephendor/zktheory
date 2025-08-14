/**
 * End-to-End Tests for Elliptic Curve Group Workflows
 * Tests complete user journeys through elliptic curve group visualization and analysis
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const MATHEMATICAL_TIMEOUT = 20000;
const COMPUTATION_WAIT = 3000;
const ANIMATION_WAIT = 1000;

test.describe('Elliptic Curve Group Workflows', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Elliptic Curve Group Explorer Workflow', () => {
    test('complete elliptic curve group exploration journey', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      // Navigate to elliptic curve explorer
      await page.click('[data-testid="elliptic-curves-link"]');
      await page.waitForSelector('[data-testid="elliptic-curve-container"]', { timeout: 10000 });

      // Select predefined curve from dropdown
      await page.click('[data-testid="curve-selector"]');
      await page.click('text=E: y² = x³ + x + 1 (mod 5)');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Verify curve is generated with correct parameters
      const curveInfo = page.locator('[data-testid="curve-info-panel"]');
      await expect(curveInfo).toBeVisible();
      await expect(page.locator('text=Field: F₅')).toBeVisible();
      await expect(page.locator('text=Equation: y² = x³ + x + 1')).toBeVisible();

      // Check that curve points are rendered
      const curveVisualization = page.locator('[data-testid="curve-visualization"]');
      await expect(curveVisualization).toBeVisible();

      // Verify point list is populated
      const pointsList = page.locator('[data-testid="points-list"]');
      await expect(pointsList).toBeVisible();
      
      // Check for identity point (point at infinity)
      await expect(page.locator('text=O (Identity)')).toBeVisible();

      // Test point addition demonstration
      await page.click('[data-testid="point-addition-demo"]');
      await page.waitForTimeout(ANIMATION_WAIT);

      // Select two points for addition
      await page.click('[data-testid="point-selector-1"]');
      await page.click('[data-testid="point-option-0"]'); // First non-identity point
      
      await page.click('[data-testid="point-selector-2"]');
      await page.click('[data-testid="point-option-1"]'); // Second point

      // Trigger addition computation
      await page.click('[data-testid="compute-addition"]');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Verify addition result is displayed
      await expect(page.locator('[data-testid="addition-result"]')).toBeVisible();
      await expect(page.locator('[data-testid="addition-visualization"]')).toBeVisible();

      // Test point order calculation
      await page.click('[data-testid="point-analysis-tab"]');
      await page.click('[data-testid="calculate-orders"]');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Verify order calculations are displayed
      const ordersTable = page.locator('[data-testid="point-orders-table"]');
      await expect(ordersTable).toBeVisible();

      // Check that Lagrange's theorem is satisfied
      await expect(page.locator('[data-testid="lagrange-verification"]')).toBeVisible();
    });

    test('custom elliptic curve creation workflow', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('[data-testid="elliptic-curves-link"]');
      await page.waitForSelector('[data-testid="elliptic-curve-container"]');

      // Switch to custom curve creation
      await page.click('[data-testid="create-custom-curve"]');
      await expect(page.locator('[data-testid="curve-parameters-form"]')).toBeVisible();

      // Input curve parameters
      await page.fill('[data-testid="parameter-a-input"]', '2');
      await page.fill('[data-testid="parameter-b-input"]', '3');
      await page.fill('[data-testid="prime-p-input"]', '7');

      // Create the curve
      await page.click('[data-testid="create-curve-button"]');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Verify curve validation
      const validationStatus = page.locator('[data-testid="curve-validation-status"]');
      await expect(validationStatus).toBeVisible();

      // Check discriminant validation
      await expect(page.locator('[data-testid="discriminant-check"]')).toContainText('Non-singular');

      // Verify Hasse bound compliance
      await expect(page.locator('[data-testid="hasse-bound-check"]')).toBeVisible();

      // Test point generation
      await page.click('[data-testid="generate-points"]');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Verify points are generated and displayed
      const generatedPoints = page.locator('[data-testid="generated-points-count"]');
      await expect(generatedPoints).toBeVisible();

      // Test group properties
      await page.click('[data-testid="analyze-group-properties"]');
      await page.waitForTimeout(COMPUTATION_WAIT);

      await expect(page.locator('[data-testid="group-order"]')).toBeVisible();
      await expect(page.locator('[data-testid="group-generators"]')).toBeVisible();
    });

    test('elliptic curve point addition animation workflow', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('[data-testid="elliptic-curves-link"]');
      await page.waitForSelector('[data-testid="elliptic-curve-container"]');

      // Select a curve suitable for visualization
      await page.click('[data-testid="curve-selector"]');
      await page.click('text=E: y² = x³ + x + 6 (mod 7)');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Enable animation mode
      await page.click('[data-testid="animation-mode-toggle"]');
      await expect(page.locator('[data-testid="animation-controls"]')).toBeVisible();

      // Select points for animated addition
      await page.click('[data-testid="select-point-for-animation"]');
      await page.click('[data-testid="curve-point-1"]'); // Click directly on curve visualization
      
      await page.click('[data-testid="select-second-point-for-animation"]');
      await page.click('[data-testid="curve-point-2"]');

      // Start addition animation
      await page.click('[data-testid="start-addition-animation"]');
      await page.waitForTimeout(ANIMATION_WAIT);

      // Verify animation steps are shown
      await expect(page.locator('[data-testid="animation-step-line-drawing"]')).toBeVisible();
      
      // Wait for intersection step
      await page.waitForTimeout(ANIMATION_WAIT);
      await expect(page.locator('[data-testid="animation-step-intersection"]')).toBeVisible();

      // Wait for reflection step
      await page.waitForTimeout(ANIMATION_WAIT);
      await expect(page.locator('[data-testid="animation-step-reflection"]')).toBeVisible();

      // Verify final result
      await page.waitForTimeout(ANIMATION_WAIT);
      await expect(page.locator('[data-testid="animation-result-point"]')).toBeVisible();

      // Test animation controls
      await page.click('[data-testid="replay-animation"]');
      await page.waitForTimeout(500);
      
      await page.click('[data-testid="pause-animation"]');
      await expect(page.locator('[data-testid="animation-paused"]')).toBeVisible();

      await page.click('[data-testid="step-forward"]');
      await page.waitForTimeout(500);
      
      await page.click('[data-testid="step-backward"]');
      await page.waitForTimeout(500);
    });

    test('elliptic curve group comparison workflow', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('[data-testid="elliptic-curves-link"]');
      await page.waitForSelector('[data-testid="elliptic-curve-container"]');

      // Enable comparison mode
      await page.click('[data-testid="comparison-mode-toggle"]');
      await expect(page.locator('[data-testid="curve-comparison-panel"]')).toBeVisible();

      // Select first curve
      await page.click('[data-testid="curve-selector-1"]');
      await page.click('text=E: y² = x³ + x + 1 (mod 5)');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Select second curve  
      await page.click('[data-testid="curve-selector-2"]');
      await page.click('text=E: y² = x³ + 2x + 3 (mod 7)');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Verify both curves are displayed
      await expect(page.locator('[data-testid="curve-container-1"]')).toBeVisible();
      await expect(page.locator('[data-testid="curve-container-2"]')).toBeVisible();

      // Check comparison statistics
      await expect(page.locator('[data-testid="comparison-stats-panel"]')).toBeVisible();
      await expect(page.locator('[data-testid="curve-1-order"]')).toBeVisible();
      await expect(page.locator('[data-testid="curve-2-order"]')).toBeVisible();

      // Test isomorphism checking
      await page.click('[data-testid="check-group-isomorphism"]');
      await page.waitForTimeout(COMPUTATION_WAIT);
      
      await expect(page.locator('[data-testid="isomorphism-result"]')).toBeVisible();

      // Test parameter comparison
      await page.click('[data-testid="compare-parameters-tab"]');
      await expect(page.locator('[data-testid="parameters-comparison-table"]')).toBeVisible();

      // Test security comparison for cryptographic curves
      if (await page.locator('[data-testid="security-analysis-tab"]').isVisible()) {
        await page.click('[data-testid="security-analysis-tab"]');
        await expect(page.locator('[data-testid="security-comparison"]')).toBeVisible();
      }
    });
  });

  test.describe('Elliptic Curve Mathematical Properties Workflow', () => {
    test('comprehensive mathematical validation workflow', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('[data-testid="elliptic-curves-link"]');
      await page.waitForSelector('[data-testid="elliptic-curve-container"]');

      // Select a curve for detailed analysis
      await page.click('[data-testid="curve-selector"]');
      await page.click('text=E: y² = x³ + x + 1 (mod 11)');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Open mathematical properties panel
      await page.click('[data-testid="mathematical-properties-tab"]');
      await expect(page.locator('[data-testid="properties-panel"]')).toBeVisible();

      // Verify curve equation display
      await expect(page.locator('[data-testid="curve-equation-latex"]')).toBeVisible();

      // Check discriminant calculation
      await expect(page.locator('[data-testid="discriminant-value"]')).toBeVisible();
      await expect(page.locator('[data-testid="discriminant-non-zero"]')).toContainText('≠ 0');

      // Verify j-invariant if displayed
      if (await page.locator('[data-testid="j-invariant"]').isVisible()) {
        await expect(page.locator('[data-testid="j-invariant-value"]')).toBeVisible();
      }

      // Test group axiom verification
      await page.click('[data-testid="verify-group-axioms"]');
      await page.waitForTimeout(COMPUTATION_WAIT);

      await expect(page.locator('[data-testid="closure-check"]')).toContainText('✓');
      await expect(page.locator('[data-testid="associativity-check"]')).toContainText('✓');
      await expect(page.locator('[data-testid="identity-check"]')).toContainText('✓');
      await expect(page.locator('[data-testid="inverse-check"]')).toContainText('✓');

      // Test Hasse's theorem verification
      await page.click('[data-testid="verify-hasse-theorem"]');
      await page.waitForTimeout(COMPUTATION_WAIT);

      await expect(page.locator('[data-testid="hasse-bound-satisfied"]')).toBeVisible();
      await expect(page.locator('[data-testid="actual-vs-expected-order"]')).toBeVisible();

      // Test point order distribution
      await page.click('[data-testid="analyze-point-orders"]');
      await page.waitForTimeout(COMPUTATION_WAIT);

      await expect(page.locator('[data-testid="order-distribution-chart"]')).toBeVisible();
      await expect(page.locator('[data-testid="lagrange-theorem-verification"]')).toContainText('All orders divide group order');

      // Test generator analysis
      await page.click('[data-testid="find-generators"]');
      await page.waitForTimeout(COMPUTATION_WAIT);

      await expect(page.locator('[data-testid="generators-list"]')).toBeVisible();
      
      // Verify each generator actually generates the group
      const generators = await page.locator('[data-testid="generator-element"]').count();
      for (let i = 0; i < generators; i++) {
        const generator = page.locator('[data-testid="generator-element"]').nth(i);
        await generator.click();
        await expect(page.locator('[data-testid="generation-verification"]')).toContainText('Generates full group');
      }
    });

    test('cryptographic curve analysis workflow', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('[data-testid="elliptic-curves-link"]');
      await page.waitForSelector('[data-testid="elliptic-curve-container"]');

      // Navigate to cryptographic curves section if available
      if (await page.locator('[data-testid="cryptographic-curves-tab"]').isVisible()) {
        await page.click('[data-testid="cryptographic-curves-tab"]');
        await expect(page.locator('[data-testid="crypto-curves-container"]')).toBeVisible();

        // Select a standard cryptographic curve
        await page.click('[data-testid="standard-curve-selector"]');
        if (await page.locator('text=secp256k1').isVisible()) {
          await page.click('text=secp256k1');
        } else if (await page.locator('text=P-256').isVisible()) {
          await page.click('text=P-256');
        }
        await page.waitForTimeout(COMPUTATION_WAIT);

        // Verify cryptographic properties
        await expect(page.locator('[data-testid="curve-security-level"]')).toBeVisible();
        await expect(page.locator('[data-testid="cofactor-analysis"]')).toBeVisible();

        // Test point multiplication (scalar multiplication)
        await page.click('[data-testid="scalar-multiplication-demo"]');
        await page.fill('[data-testid="scalar-input"]', '23');
        await page.click('[data-testid="compute-scalar-mult"]');
        await page.waitForTimeout(COMPUTATION_WAIT);

        await expect(page.locator('[data-testid="scalar-mult-result"]')).toBeVisible();

        // Test cryptographic operations if available
        if (await page.locator('[data-testid="key-generation-demo"]').isVisible()) {
          await page.click('[data-testid="key-generation-demo"]');
          await page.waitForTimeout(COMPUTATION_WAIT);
          
          await expect(page.locator('[data-testid="private-key"]')).toBeVisible();
          await expect(page.locator('[data-testid="public-key"]')).toBeVisible();
        }
      }
    });
  });

  test.describe('Elliptic Curve Data Export and Import Workflow', () => {
    test('curve and computation data export workflow', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('[data-testid="elliptic-curves-link"]');
      await page.waitForSelector('[data-testid="elliptic-curve-container"]');

      // Generate a curve and its points
      await page.click('[data-testid="curve-selector"]');
      await page.click('text=E: y² = x³ + x + 6 (mod 7)');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Open export options
      await page.click('[data-testid="export-data"]');
      await expect(page.locator('[data-testid="export-options-panel"]')).toBeVisible();

      // Test curve parameters export
      await page.click('[data-testid="export-curve-params"]');
      
      const paramsDownloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-params-json"]');
      const paramsDownload = await paramsDownloadPromise;
      expect(paramsDownload.suggestedFilename()).toMatch(/curve-parameters.*\.json$/);

      // Test points export
      await page.click('[data-testid="export-points"]');
      
      const pointsDownloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-points-csv"]');
      const pointsDownload = await pointsDownloadPromise;
      expect(pointsDownload.suggestedFilename()).toMatch(/curve-points.*\.csv$/);

      // Test addition table export
      await page.click('[data-testid="export-addition-table"]');
      
      const tableDownloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-table-json"]');
      const tableDownload = await tableDownloadPromise;
      expect(tableDownload.suggestedFilename()).toMatch(/addition-table.*\.json$/);

      // Test LaTeX export for mathematical notation
      await page.click('[data-testid="export-latex"]');
      
      const latexDownloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="export-latex-document"]');
      const latexDownload = await latexDownloadPromise;
      expect(latexDownload.suggestedFilename()).toMatch(/curve-analysis.*\.tex$/);
    });

    test('curve data import and validation workflow', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('[data-testid="elliptic-curves-link"]');
      await page.waitForSelector('[data-testid="elliptic-curve-container"]');

      // Open import options
      await page.click('[data-testid="import-data"]');
      await expect(page.locator('[data-testid="import-options-panel"]')).toBeVisible();

      // Test curve parameters import
      const curveParamsContent = JSON.stringify({
        a: 1,
        b: 6,
        p: 7,
        name: 'imported_curve',
        description: 'Imported test curve'
      });

      const paramsFileInput = page.locator('[data-testid="curve-params-file-input"]');
      await paramsFileInput.setInputFiles({
        name: 'test-curve.json',
        mimeType: 'application/json',
        buffer: Buffer.from(curveParamsContent)
      });

      await page.waitForTimeout(COMPUTATION_WAIT);

      // Verify curve was imported successfully
      await expect(page.locator('[data-testid="import-success-message"]')).toBeVisible();
      await expect(page.locator('text=imported_curve')).toBeVisible();

      // Test point data import
      const pointsContent = 'x,y\n0,1\n1,2\n2,4\n3,2\n4,6\n5,1\n6,0';
      
      const pointsFileInput = page.locator('[data-testid="points-file-input"]');
      await pointsFileInput.setInputFiles({
        name: 'test-points.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from(pointsContent)
      });

      await page.waitForTimeout(COMPUTATION_WAIT);

      // Verify points were imported and validated
      await expect(page.locator('[data-testid="imported-points-count"]')).toContainText('7');
      await expect(page.locator('[data-testid="points-validation-status"]')).toContainText('Valid');

      // Test invalid data handling
      const invalidContent = 'invalid curve data';
      
      const invalidFileInput = page.locator('[data-testid="curve-params-file-input"]');
      await invalidFileInput.setInputFiles({
        name: 'invalid.json',
        mimeType: 'application/json',
        buffer: Buffer.from(invalidContent)
      });

      await page.waitForTimeout(1000);

      // Verify error handling
      await expect(page.locator('[data-testid="import-error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="error-details"]')).toContainText('Invalid format');
    });
  });

  test.describe('Elliptic Curve Error Handling and Edge Cases', () => {
    test('handles invalid curve parameters gracefully', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('[data-testid="elliptic-curves-link"]');
      await page.waitForSelector('[data-testid="elliptic-curve-container"]');

      // Try to create a singular curve (discriminant = 0)
      await page.click('[data-testid="create-custom-curve"]');
      
      // Input parameters that create a singular curve
      await page.fill('[data-testid="parameter-a-input"]', '0');
      await page.fill('[data-testid="parameter-b-input"]', '0');
      await page.fill('[data-testid="prime-p-input"]', '2');

      await page.click('[data-testid="create-curve-button"]');
      await page.waitForTimeout(1000);

      // Should show singular curve error
      await expect(page.locator('[data-testid="curve-validation-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="singular-curve-warning"]')).toContainText('singular');

      // Try with non-prime modulus
      await page.fill('[data-testid="prime-p-input"]', '4');
      await page.click('[data-testid="create-curve-button"]');
      await page.waitForTimeout(1000);

      await expect(page.locator('[data-testid="non-prime-error"]')).toBeVisible();

      // Try with extremely large parameters
      await page.fill('[data-testid="parameter-a-input"]', '999999');
      await page.fill('[data-testid="parameter-b-input"]', '999999');
      await page.fill('[data-testid="prime-p-input"]', '2');

      await page.click('[data-testid="create-curve-button"]');
      await page.waitForTimeout(1000);

      await expect(page.locator('[data-testid="parameter-range-error"]')).toBeVisible();
    });

    test('handles computation errors gracefully', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      await page.click('[data-testid="elliptic-curves-link"]');
      await page.waitForSelector('[data-testid="elliptic-curve-container"]');

      // Select a valid curve
      await page.click('[data-testid="curve-selector"]');
      await page.click('text=E: y² = x³ + x + 1 (mod 5)');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Try point addition with points not on the curve (if such interface exists)
      if (await page.locator('[data-testid="manual-point-addition"]').isVisible()) {
        await page.click('[data-testid="manual-point-addition"]');
        
        // Enter invalid point coordinates
        await page.fill('[data-testid="point1-x"]', '10');
        await page.fill('[data-testid="point1-y"]', '10');
        await page.fill('[data-testid="point2-x"]', '1');
        await page.fill('[data-testid="point2-y"]', '1');

        await page.click('[data-testid="compute-manual-addition"]');
        await page.waitForTimeout(1000);

        await expect(page.locator('[data-testid="point-validation-error"]')).toBeVisible();
      }

      // Test very large scalar multiplication
      if (await page.locator('[data-testid="scalar-multiplication-test"]').isVisible()) {
        await page.click('[data-testid="scalar-multiplication-test"]');
        await page.fill('[data-testid="large-scalar-input"]', '999999999');
        
        await page.click('[data-testid="compute-large-scalar"]');
        
        // Should either complete or show appropriate timeout/error handling
        try {
          await page.waitForSelector('[data-testid="scalar-mult-result"]', { timeout: 5000 });
        } catch {
          await expect(page.locator('[data-testid="computation-timeout-message"]')).toBeVisible();
        }
      }
    });

    test('browser compatibility and WebGL fallbacks', async () => {
      test.setTimeout(MATHEMATICAL_TIMEOUT);

      // Test WebGL availability for 3D curve visualization
      const webglSupported = await page.evaluate(() => {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      });

      await page.click('[data-testid="elliptic-curves-link"]');
      await page.waitForSelector('[data-testid="elliptic-curve-container"]');

      await page.click('[data-testid="curve-selector"]');
      await page.click('text=E: y² = x³ + x + 1 (mod 11)');
      await page.waitForTimeout(COMPUTATION_WAIT);

      // Try to enable 3D visualization if available
      if (await page.locator('[data-testid="3d-visualization-toggle"]').isVisible()) {
        await page.click('[data-testid="3d-visualization-toggle"]');

        if (!webglSupported) {
          // Should show fallback message or 2D alternative
          await expect(page.locator('[data-testid="webgl-fallback-message"]')).toBeVisible();
        } else {
          // Should render 3D visualization
          await expect(page.locator('[data-testid="curve-3d-canvas"]')).toBeVisible();
        }
      }

      // Test mathematical notation fallbacks
      const mathSupported = await page.evaluate(() => {
        return typeof (window as any).MathJax !== 'undefined' || 
               typeof (window as any).katex !== 'undefined';
      });

      if (!mathSupported) {
        // Should fall back to plain text or images
        await expect(page.locator('[data-testid="math-fallback"]')).toBeVisible();
      }
    });
  });
});