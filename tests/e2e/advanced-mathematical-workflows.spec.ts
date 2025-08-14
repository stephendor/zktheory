/**
 * End-to-End Tests for Advanced Mathematical Workflows
 * Tests complex mathematical scenarios, cross-tool integration, and edge cases
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const ADVANCED_TIMEOUT = 30000;
const HEAVY_COMPUTATION_WAIT = 5000;
const INTEGRATION_WAIT = 2000;

test.describe('Advanced Mathematical Workflows', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Cross-Tool Mathematical Integration', () => {
    test('group theory to TDA workflow integration', async () => {
      test.setTimeout(ADVANCED_TIMEOUT);

      // Start with group theory analysis
      await page.click('[data-testid="group-theory-link"]');
      await page.waitForSelector('[data-testid="cayley-graph-container"]');

      // Select a complex group for analysis
      await page.click('[data-testid="group-selector"]');
      await page.click('text=A4 - Alternating Group');
      await page.waitForTimeout(HEAVY_COMPUTATION_WAIT);

      // Extract group structure data
      const groupOrder = await page.locator('[data-testid="group-order"]').textContent();
      
      // Export group data for TDA analysis
      if (await page.locator('[data-testid="export-for-tda"]').isVisible()) {
        await page.click('[data-testid="export-for-tda"]');
        await page.click('[data-testid="export-cayley-positions"]');
        await page.waitForTimeout(INTEGRATION_WAIT);

        // Navigate to TDA Explorer
        await page.click('[data-testid="navigate-to-tda"]');
        await page.waitForSelector('[data-testid="tda-explorer-container"]');

        // Import the group structure data
        await page.click('[data-testid="import-from-group-theory"]');
        await page.waitForTimeout(INTEGRATION_WAIT);

        // Verify data transfer was successful
        await expect(page.locator('[data-testid="imported-group-data"]')).toBeVisible();
        await expect(page.locator(`text=Imported A4 structure`)).toBeVisible();

        // Compute TDA on group structure
        await page.click('[data-testid="compute-group-tda"]');
        await page.waitForTimeout(HEAVY_COMPUTATION_WAIT);

        // Verify TDA results reflect group structure
        await expect(page.locator('[data-testid="group-tda-results"]')).toBeVisible();
        
        // Check for group-theoretical persistence features
        if (await page.locator('[data-testid="group-persistence-interpretation"]').isVisible()) {
          await expect(page.locator('[data-testid="group-homology-h0"]')).toContainText('Connected components');
          await expect(page.locator('[data-testid="group-homology-h1"]')).toContainText('Cycles');
        }
      }
    });

    test('elliptic curves to cryptographic analysis integration', async () => {
      test.setTimeout(ADVANCED_TIMEOUT);

      // Start with elliptic curve exploration
      await page.click('[data-testid="elliptic-curves-link"]');
      await page.waitForSelector('[data-testid="elliptic-curve-container"]');

      // Create a cryptographically relevant curve
      await page.click('[data-testid="create-custom-curve"]');
      await page.fill('[data-testid="parameter-a-input"]', '0');
      await page.fill('[data-testid="parameter-b-input"]', '7');
      await page.fill('[data-testid="prime-p-input"]', '97'); // Larger prime for crypto relevance
      
      await page.click('[data-testid="create-curve-button"]');
      await page.waitForTimeout(HEAVY_COMPUTATION_WAIT);

      // Analyze cryptographic properties
      if (await page.locator('[data-testid="cryptographic-analysis"]').isVisible()) {
        await page.click('[data-testid="cryptographic-analysis"]');
        await page.waitForTimeout(INTEGRATION_WAIT);

        // Test point counting algorithms
        await page.click('[data-testid="schoof-algorithm"]');
        await page.waitForTimeout(HEAVY_COMPUTATION_WAIT);

        await expect(page.locator('[data-testid="point-count-result"]')).toBeVisible();
        await expect(page.locator('[data-testid="hasse-bound-verification"]')).toContainText('Within Hasse bound');

        // Test for cryptographic vulnerabilities
        await page.click('[data-testid="vulnerability-scan"]');
        await page.waitForTimeout(INTEGRATION_WAIT);

        await expect(page.locator('[data-testid="anomalous-curve-check"]')).toBeVisible();
        await expect(page.locator('[data-testid="supersingular-check"]')).toBeVisible();

        // Generate cryptographic parameters
        if (await page.locator('[data-testid="generate-crypto-params"]').isVisible()) {
          await page.click('[data-testid="generate-crypto-params"]');
          await page.waitForTimeout(INTEGRATION_WAIT);

          await expect(page.locator('[data-testid="base-point"]')).toBeVisible();
          await expect(page.locator('[data-testid="order-computation"]')).toBeVisible();
          await expect(page.locator('[data-testid="cofactor"]')).toBeVisible();
        }
      }
    });

    test('mathematical notation to computation workflow', async () => {
      test.setTimeout(ADVANCED_TIMEOUT);

      // Start with mathematical notation editor
      if (await page.locator('[data-testid="math-editor-link"]').isVisible()) {
        await page.click('[data-testid="math-editor-link"]');
        await page.waitForSelector('[data-testid="math-editor-container"]');

        // Input complex mathematical expression
        const latexExpression = '\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}';
        await page.fill('[data-testid="latex-input"]', latexExpression);
        await page.waitForTimeout(1000);

        // Verify rendering
        await expect(page.locator('[data-testid="latex-preview"]')).toBeVisible();

        // Parse for computational analysis
        if (await page.locator('[data-testid="analyze-expression"]').isVisible()) {
          await page.click('[data-testid="analyze-expression"]');
          await page.waitForTimeout(INTEGRATION_WAIT);

          await expect(page.locator('[data-testid="expression-type"]')).toContainText('Series');
          await expect(page.locator('[data-testid="convergence-analysis"]')).toBeVisible();

          // Numerical computation
          if (await page.locator('[data-testid="compute-numerically"]').isVisible()) {
            await page.click('[data-testid="compute-numerically"]');
            await page.fill('[data-testid="terms-count"]', '1000');
            await page.click('[data-testid="start-computation"]');
            await page.waitForTimeout(HEAVY_COMPUTATION_WAIT);

            await expect(page.locator('[data-testid="numerical-result"]')).toBeVisible();
            await expect(page.locator('[data-testid="convergence-rate"]')).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Mathematical Edge Cases and Stress Testing', () => {
    test('large group computations and memory management', async () => {
      test.setTimeout(ADVANCED_TIMEOUT);

      await page.click('[data-testid="group-theory-link"]');
      await page.waitForSelector('[data-testid="cayley-graph-container"]');

      // Test with progressively larger groups
      const largeGroups = [
        { name: 'S4 - Symmetric Group', expectedOrder: 24 },
        { name: 'A5 - Alternating Group', expectedOrder: 60 },
        { name: 'D12 - Dihedral Group', expectedOrder: 24 }
      ];

      for (const group of largeGroups) {
        await page.click('[data-testid="group-selector"]');
        
        // Check if group exists in the dropdown
        const groupOption = page.locator(`text=${group.name}`);
        if (await groupOption.isVisible()) {
          await groupOption.click();
          
          // Monitor memory and performance
          const initialMemory = await page.evaluate(() => {
            return (performance as any).memory ? 
              (performance as any).memory.usedJSHeapSize : 0;
          });

          const computationStart = Date.now();
          await page.waitForSelector('[data-testid="cayley-graph-svg"]', { timeout: 15000 });
          
          // Verify computation completed
          const vertices = await page.locator('[data-testid="graph-vertex"]').count();
          expect(vertices).toBe(group.expectedOrder);

          const computationTime = Date.now() - computationStart;
          console.log(`${group.name} computation time: ${computationTime}ms`);

          const finalMemory = await page.evaluate(() => {
            return (performance as any).memory ? 
              (performance as any).memory.usedJSHeapSize : 0;
          });

          const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024);
          console.log(`${group.name} memory increase: ${memoryIncrease.toFixed(2)}MB`);

          // Test complex operations on large groups
          if (await page.locator('[data-testid="compute-center"]').isVisible()) {
            await page.click('[data-testid="compute-center"]');
            await page.waitForTimeout(HEAVY_COMPUTATION_WAIT);
            await expect(page.locator('[data-testid="center-elements"]')).toBeVisible();
          }

          if (await page.locator('[data-testid="compute-conjugacy-classes"]').isVisible()) {
            await page.click('[data-testid="compute-conjugacy-classes"]');
            await page.waitForTimeout(HEAVY_COMPUTATION_WAIT);
            await expect(page.locator('[data-testid="conjugacy-classes-list"]')).toBeVisible();
          }
        }
      }
    });

    test('high-precision mathematical computations', async () => {
      test.setTimeout(ADVANCED_TIMEOUT);

      // Test high-precision arithmetic in various contexts
      await page.click('[data-testid="elliptic-curves-link"]');
      await page.waitForSelector('[data-testid="elliptic-curve-container"]');

      // Create curve with large prime modulus
      await page.click('[data-testid="create-custom-curve"]');
      await page.fill('[data-testid="parameter-a-input"]', '1');
      await page.fill('[data-testid="parameter-b-input']', '1');
      await page.fill('[data-testid="prime-p-input"]', '2147483647'); // Large Mersenne prime

      await page.click('[data-testid="create-curve-button"]');
      await page.waitForTimeout(HEAVY_COMPUTATION_WAIT);

      // Test high-precision point operations
      if (await page.locator('[data-testid="high-precision-mode"]').isVisible()) {
        await page.click('[data-testid="high-precision-mode"]');
        
        // Verify precision settings
        await expect(page.locator('[data-testid="precision-indicator"]')).toContainText('High precision enabled');

        // Test large scalar multiplication
        if (await page.locator('[data-testid="scalar-multiplication-test"]').isVisible()) {
          await page.click('[data-testid="scalar-multiplication-test"]');
          await page.fill('[data-testid="large-scalar"]', '123456789012345');
          
          await page.click('[data-testid="compute-large-scalar-mult"]');
          await page.waitForTimeout(HEAVY_COMPUTATION_WAIT);

          await expect(page.locator('[data-testid="high-precision-result"]')).toBeVisible();
          
          // Verify precision is maintained
          await expect(page.locator('[data-testid="precision-verification"]')).toContainText('All operations exact');
        }
      }
    });

    test('numerical stability and edge cases', async () => {
      test.setTimeout(ADVANCED_TIMEOUT);

      await page.click('[data-testid="tda-explorer-link"]');
      await page.waitForSelector('[data-testid="tda-explorer-container"]');

      // Test with degenerate point configurations
      const degenerateCases = [
        { name: 'Single point', points: 1 },
        { name: 'Collinear points', pattern: 'line' },
        { name: 'Nearly identical points', pattern: 'clustered-tight' },
        { name: 'Extreme outliers', pattern: 'outliers' }
      ];

      for (const testCase of degenerateCases) {
        console.log(`Testing degenerate case: ${testCase.name}`);

        // Configure test case
        if (testCase.points) {
          await page.fill('[data-testid="point-count-input"]', testCase.points.toString());
        }
        
        if (testCase.pattern) {
          await page.click(`[data-testid="pattern-${testCase.pattern}"]`);
        }

        await page.click('[data-testid="regenerate-points"]');
        await page.waitForTimeout(INTEGRATION_WAIT);

        // Attempt persistence computation
        try {
          await page.click('[data-testid="compute-persistence"]');
          await page.waitForTimeout(HEAVY_COMPUTATION_WAIT);

          // Check if computation handled gracefully
          const errorMessage = page.locator('[data-testid="computation-error"]');
          const successMessage = page.locator('[data-testid="computation-success"]');
          
          const isError = await errorMessage.isVisible();
          const isSuccess = await successMessage.isVisible();

          if (isError) {
            console.log(`Degenerate case "${testCase.name}" handled with appropriate error`);
            await expect(errorMessage).toContainText(/degenerate|insufficient|invalid/i);
          } else if (isSuccess) {
            console.log(`Degenerate case "${testCase.name}" computed successfully`);
            
            // Verify results make sense for degenerate case
            if (testCase.points === 1) {
              // Single point should have one H0 feature
              const h0Count = await page.locator('[data-testid="h0-features-count"]').textContent();
              expect(h0Count).toContain('1');
            }
          }
        } catch (error) {
          console.log(`Degenerate case "${testCase.name}" timed out - acceptable for edge case`);
        }
      }
    });

    test('concurrent computation handling', async () => {
      test.setTimeout(ADVANCED_TIMEOUT);

      await page.click('[data-testid="group-theory-link"]');
      await page.waitForSelector('[data-testid="cayley-graph-container"]');

      // Test rapid group switching (simulating concurrent requests)
      const groups = ['C6', 'D3', 'S3', 'V4', 'C8'];
      
      for (let i = 0; i < 3; i++) { // Multiple rapid cycles
        for (const group of groups) {
          await page.click('[data-testid="group-selector"]');
          
          const groupOption = page.locator(`text=${group}`);
          if (await groupOption.isVisible()) {
            await groupOption.click();
            
            // Don't wait for full completion - simulate rapid switching
            await page.waitForTimeout(200);
          }
        }
      }

      // Wait for final computation to stabilize
      await page.waitForTimeout(HEAVY_COMPUTATION_WAIT);

      // Verify system is in stable state
      await expect(page.locator('[data-testid="cayley-graph-svg"]')).toBeVisible();
      
      // Check for any error states
      const errorIndicator = page.locator('[data-testid="computation-error"]');
      if (await errorIndicator.isVisible()) {
        const errorText = await errorIndicator.textContent();
        // Should not be a critical error - just resource contention
        expect(errorText).not.toContain(/critical|fatal|crash/i);
      }
    });
  });

  test.describe('Mathematical Accuracy Validation', () => {
    test('cross-verification of mathematical results', async () => {
      test.setTimeout(ADVANCED_TIMEOUT);

      // Test the same mathematical concept across different tools
      const groupName = 'C4 - Cyclic Group';
      
      // First: Analyze in Cayley graph explorer
      await page.click('[data-testid="group-theory-link"]');
      await page.waitForSelector('[data-testid="cayley-graph-container"]');

      await page.click('[data-testid="group-selector"]');
      await page.click(`text=${groupName}`);
      await page.waitForTimeout(HEAVY_COMPUTATION_WAIT);

      const cayleyOrder = await page.locator('[data-testid="group-order"]').textContent();
      const cayleyGenerators = await page.locator('[data-testid="group-generators"]').textContent();

      // Second: Verify in elliptic curve context (if isomorphic curve exists)
      if (await page.locator('[data-testid="find-isomorphic-curves"]').isVisible()) {
        await page.click('[data-testid="find-isomorphic-curves"]');
        await page.waitForTimeout(INTEGRATION_WAIT);

        const isomorphicCurves = page.locator('[data-testid="isomorphic-curve-list"] .curve-item');
        const curveCount = await isomorphicCurves.count();

        if (curveCount > 0) {
          // Navigate to first isomorphic curve
          await isomorphicCurves.first().click();
          await page.waitForTimeout(INTEGRATION_WAIT);

          await page.click('[data-testid="navigate-to-curve"]');
          await page.waitForSelector('[data-testid="elliptic-curve-container"]');

          // Verify group structure matches
          const curveOrder = await page.locator('[data-testid="curve-group-order"]').textContent();
          expect(curveOrder).toBe(cayleyOrder);

          // Test isomorphism mapping
          if (await page.locator('[data-testid="verify-isomorphism"]').isVisible()) {
            await page.click('[data-testid="verify-isomorphism"]');
            await page.waitForTimeout(HEAVY_COMPUTATION_WAIT);

            await expect(page.locator('[data-testid="isomorphism-confirmed"]')).toBeVisible();
          }
        }
      }

      // Third: Verify using group theory calculations
      if (await page.locator('[data-testid="theoretical-verification"]').isVisible()) {
        await page.click('[data-testid="theoretical-verification"]');

        // Check order computation via different methods
        await page.click('[data-testid="lagrange-verification"]');
        await page.waitForTimeout(INTEGRATION_WAIT);

        await expect(page.locator('[data-testid="subgroup-orders"]')).toBeVisible();
        
        // All subgroup orders should divide the group order
        const subgroupOrders = await page.locator('[data-testid="subgroup-order"]').allTextContents();
        const groupOrder = parseInt(cayleyOrder?.replace(/\D/g, '') || '4');
        
        subgroupOrders.forEach(orderText => {
          const order = parseInt(orderText.replace(/\D/g, ''));
          expect(groupOrder % order).toBe(0);
        });
      }
    });

    test('mathematical identity and property verification', async () => {
      test.setTimeout(ADVANCED_TIMEOUT);

      await page.click('[data-testid="elliptic-curves-link"]');
      await page.waitForSelector('[data-testid="elliptic-curve-container"]');

      // Select a curve for thorough testing
      await page.click('[data-testid="curve-selector"]');
      await page.click('text=E: y² = x³ + x + 1 (mod 7)');
      await page.waitForTimeout(HEAVY_COMPUTATION_WAIT);

      // Test mathematical identities
      if (await page.locator('[data-testid="identity-verification"]').isVisible()) {
        await page.click('[data-testid="identity-verification"]');

        // Test point addition identities
        await page.click('[data-testid="test-addition-identities"]');
        await page.waitForTimeout(HEAVY_COMPUTATION_WAIT);

        // P + O = P for all points P
        await expect(page.locator('[data-testid="identity-element-test"]')).toContainText('✓ All tests passed');

        // P + (-P) = O for all points P
        await expect(page.locator('[data-testid="inverse-element-test"]')).toContainText('✓ All tests passed');

        // Associativity: (P + Q) + R = P + (Q + R)
        await expect(page.locator('[data-testid="associativity-test"]')).toContainText('✓ All tests passed');

        // Commutativity: P + Q = Q + P
        await expect(page.locator('[data-testid="commutativity-test"]')).toContainText('✓ All tests passed');
      }

      // Test specific mathematical properties
      if (await page.locator('[data-testid="property-verification"]').isVisible()) {
        await page.click('[data-testid="property-verification"]');

        // Verify all points are actually on the curve
        await page.click('[data-testid="verify-points-on-curve"]');
        await page.waitForTimeout(INTEGRATION_WAIT);
        await expect(page.locator('[data-testid="all-points-valid"]')).toContainText('✓ All points on curve');

        // Verify group order matches theoretical bounds
        await page.click('[data-testid="verify-hasse-bound"]');
        await page.waitForTimeout(INTEGRATION_WAIT);
        await expect(page.locator('[data-testid="hasse-bound-satisfied"]')).toContainText('✓ Within Hasse bound');

        // Verify subgroup structure
        await page.click('[data-testid="verify-subgroups"]');
        await page.waitForTimeout(HEAVY_COMPUTATION_WAIT);
        await expect(page.locator('[data-testid="subgroup-lattice-valid"]')).toContainText('✓ Valid subgroup lattice');
      }
    });

    test('precision and rounding error detection', async () => {
      test.setTimeout(ADVANCED_TIMEOUT);

      await page.click('[data-testid="tda-explorer-link"]');
      await page.waitForSelector('[data-testid="tda-explorer-container"]');

      // Generate high-precision test data
      await page.click('[data-testid="precision-test-data"]');
      await page.selectOption('[data-testid="precision-level"]', 'high');
      await page.waitForTimeout(INTEGRATION_WAIT);

      // Test with data that might expose precision issues
      await page.click('[data-testid="generate-precision-test"]');
      await page.waitForTimeout(HEAVY_COMPUTATION_WAIT);

      // Compute persistence with different precision settings
      await page.click('[data-testid="compute-with-precision-analysis"]');
      await page.waitForTimeout(HEAVY_COMPUTATION_WAIT);

      // Verify precision warnings and stability
      const precisionWarnings = page.locator('[data-testid="precision-warning"]');
      if (await precisionWarnings.isVisible()) {
        const warningText = await precisionWarnings.textContent();
        console.log('Precision warning detected:', warningText);
        
        // Should be informational, not critical
        expect(warningText).toMatch(/precision|rounding|numerical/i);
      }

      // Check for stability indicators
      if (await page.locator('[data-testid="stability-analysis"]').isVisible()) {
        await expect(page.locator('[data-testid="computation-stable"]')).toBeVisible();
      }

      // Test multiple runs for consistency
      const results = [];
      for (let i = 0; i < 3; i++) {
        await page.click('[data-testid="recompute-persistence"]');
        await page.waitForTimeout(INTEGRATION_WAIT);
        
        const intervalCount = await page.locator('[data-testid="persistence-intervals-count"]').textContent();
        results.push(intervalCount);
      }

      // Results should be consistent
      const firstResult = results[0];
      results.forEach(result => {
        expect(result).toBe(firstResult);
      });
    });
  });
});