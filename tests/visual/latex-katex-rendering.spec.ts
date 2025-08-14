/**
 * Visual Regression Tests for LaTeX/KaTeX Mathematical Notation Rendering
 * Tests pixel-perfect accuracy of mathematical formula rendering across different contexts
 */

import { test, expect, Page } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import * as fs from 'fs';
import * as path from 'path';

// Test configuration for LaTeX/KaTeX rendering
const LATEX_BASELINE_DIR = path.join(__dirname, 'baselines', 'latex');
const LATEX_OUTPUT_DIR = path.join(__dirname, 'output', 'latex');
const LATEX_DIFF_DIR = path.join(__dirname, 'diffs', 'latex');

// Ensure directories exist
[LATEX_BASELINE_DIR, LATEX_OUTPUT_DIR, LATEX_DIFF_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// LaTeX/KaTeX specific visual comparison configuration
const LATEX_VISUAL_CONFIG = {
  // Very strict for text rendering - mathematical notation must be pixel-perfect
  inlineFormulas: { threshold: 0.02, maxDiffPixels: 20 },
  displayFormulas: { threshold: 0.03, maxDiffPixels: 30 },
  complexFormulas: { threshold: 0.05, maxDiffPixels: 50 },
  matrices: { threshold: 0.03, maxDiffPixels: 40 },
  integrals: { threshold: 0.04, maxDiffPixels: 35 },
  fractions: { threshold: 0.02, maxDiffPixels: 25 },
  symbols: { threshold: 0.01, maxDiffPixels: 10 },
};

/**
 * Helper to compare LaTeX/KaTeX rendering
 */
async function compareLatexRendering(
  page: Page,
  testName: string,
  renderingType: keyof typeof LATEX_VISUAL_CONFIG,
  selector: string
): Promise<{ match: boolean; diffPixels: number; diffPercentage: number }> {
  const config = LATEX_VISUAL_CONFIG[renderingType];
  
  // Wait for KaTeX to fully render
  await page.waitForFunction(() => {
    const katexElements = document.querySelectorAll('.katex');
    return Array.from(katexElements).every(el => 
      el.querySelector('.katex-mathml') || el.querySelector('.katex-html')
    );
  }, { timeout: 5000 });
  
  // Additional wait for font loading
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Take screenshot of specific LaTeX element
  const element = page.locator(selector);
  const screenshot = await element.screenshot();
  
  const outputPath = path.join(LATEX_OUTPUT_DIR, `${testName}.png`);
  const baselinePath = path.join(LATEX_BASELINE_DIR, `${testName}.png`);
  const diffPath = path.join(LATEX_DIFF_DIR, `${testName}-diff.png`);
  
  fs.writeFileSync(outputPath, screenshot);
  
  // Create baseline if it doesn't exist
  if (!fs.existsSync(baselinePath)) {
    fs.writeFileSync(baselinePath, screenshot);
    console.log(`Created LaTeX baseline for ${testName}`);
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
 * Helper to insert LaTeX content and test rendering
 */
async function testLatexFormula(
  page: Page,
  formula: string,
  testName: string,
  renderingType: keyof typeof LATEX_VISUAL_CONFIG,
  displayMode: boolean = false
): Promise<void> {
  // Create a test container with the formula
  await page.evaluate(({ formula, displayMode }) => {
    const container = document.createElement('div');
    container.setAttribute('data-testid', 'latex-test-container');
    container.style.cssText = `
      padding: 20px;
      background: white;
      border: 1px solid #ccc;
      margin: 10px;
      font-size: 16px;
      line-height: 1.4;
    `;
    
    if (displayMode) {
      container.innerHTML = `$$${formula}$$`;
    } else {
      container.innerHTML = `$${formula}$`;
    }
    
    document.body.appendChild(container);
  }, { formula, displayMode });
  
  // Wait for KaTeX to render
  await page.waitForTimeout(1000);
  
  const result = await compareLatexRendering(
    page,
    testName,
    renderingType,
    '[data-testid="latex-test-container"]'
  );
  
  expect(result.match).toBe(true);
  expect(result.diffPercentage).toBeLessThan(1);
  
  // Clean up
  await page.evaluate(() => {
    const container = document.querySelector('[data-testid="latex-test-container"]');
    if (container) container.remove();
  });
}

test.describe('LaTeX Basic Formulas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/math-test-page'); // Assumes a test page with KaTeX loaded
    await page.waitForLoadState('networkidle');
  });

  test('Inline mathematical expressions render correctly', async ({ page }) => {
    const inlineFormulas = [
      { formula: 'x^2 + y^2 = z^2', name: 'pythagorean-theorem' },
      { formula: '\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}', name: 'fraction-addition' },
      { formula: '\\sqrt{x^2 + y^2}', name: 'square-root' },
      { formula: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}', name: 'sum-formula' },
      { formula: '\\alpha + \\beta = \\gamma', name: 'greek-letters' },
    ];

    for (const { formula, name } of inlineFormulas) {
      await testLatexFormula(page, formula, `inline-${name}`, 'inlineFormulas', false);
    }
  });

  test('Display mathematical expressions render correctly', async ({ page }) => {
    const displayFormulas = [
      { formula: 'E = mc^2', name: 'einstein-equation' },
      { formula: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}', name: 'gaussian-integral' },
      { formula: '\\lim_{x \\to \\infty} \\frac{1}{x} = 0', name: 'limit-infinity' },
      { formula: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n', name: 'taylor-series' },
    ];

    for (const { formula, name } of displayFormulas) {
      await testLatexFormula(page, formula, `display-${name}`, 'displayFormulas', true);
    }
  });

  test('Mathematical symbols render consistently', async ({ page }) => {
    const symbols = [
      { formula: '\\forall x \\in \\mathbb{R}, \\exists y \\in \\mathbb{C}', name: 'quantifiers-sets' },
      { formula: '\\nabla \\cdot \\vec{F} = \\partial_x F_x + \\partial_y F_y + \\partial_z F_z', name: 'vector-calculus' },
      { formula: '\\mathcal{L}\\{f(t)\\} = \\int_0^\\infty f(t)e^{-st}dt', name: 'laplace-transform' },
      { formula: '\\aleph_0 < \\aleph_1 < \\aleph_2', name: 'cardinality-symbols' },
    ];

    for (const { formula, name } of symbols) {
      await testLatexFormula(page, formula, `symbols-${name}`, 'symbols', true);
    }
  });
});

test.describe('LaTeX Complex Mathematical Structures', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/math-test-page');
    await page.waitForLoadState('networkidle');
  });

  test('Matrix expressions render correctly', async ({ page }) => {
    const matrices = [
      {
        formula: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
        name: '2x2-matrix'
      },
      {
        formula: '\\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}',
        name: 'identity-matrix'
      },
      {
        formula: '\\det\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc',
        name: 'determinant'
      },
      {
        formula: '\\begin{cases} x + y = 1 \\\\ x - y = 3 \\end{cases}',
        name: 'system-equations'
      },
    ];

    for (const { formula, name } of matrices) {
      await testLatexFormula(page, formula, `matrix-${name}`, 'matrices', true);
    }
  });

  test('Integral and differential expressions render correctly', async ({ page }) => {
    const integrals = [
      {
        formula: '\\int_a^b f(x) dx = F(b) - F(a)',
        name: 'fundamental-theorem'
      },
      {
        formula: '\\oint_C \\vec{F} \\cdot d\\vec{r} = \\iint_S (\\nabla \\times \\vec{F}) \\cdot d\\vec{S}',
        name: 'stokes-theorem'
      },
      {
        formula: '\\frac{\\partial^2 u}{\\partial t^2} = c^2 \\nabla^2 u',
        name: 'wave-equation'
      },
      {
        formula: '\\int_{-\\infty}^{\\infty} \\int_{-\\infty}^{\\infty} e^{-(x^2+y^2)} dx dy = \\pi',
        name: 'double-integral'
      },
    ];

    for (const { formula, name } of integrals) {
      await testLatexFormula(page, formula, `integral-${name}`, 'integrals', true);
    }
  });

  test('Complex fraction expressions render correctly', async ({ page }) => {
    const fractions = [
      {
        formula: '\\frac{a + \\frac{b}{c}}{d + \\frac{e}{f}}',
        name: 'nested-fractions'
      },
      {
        formula: '\\cfrac{1}{2 + \\cfrac{1}{3 + \\cfrac{1}{4 + \\cfrac{1}{5}}}}',
        name: 'continued-fraction'
      },
      {
        formula: '\\binom{n}{k} = \\frac{n!}{k!(n-k)!}',
        name: 'binomial-coefficient'
      },
      {
        formula: '\\frac{d}{dx}\\left(\\frac{f(x)}{g(x)}\\right) = \\frac{f\'(x)g(x) - f(x)g\'(x)}{[g(x)]^2}',
        name: 'quotient-rule'
      },
    ];

    for (const { formula, name } of fractions) {
      await testLatexFormula(page, formula, `fraction-${name}`, 'fractions', true);
    }
  });
});

test.describe('LaTeX Group Theory Specific Notation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/math-test-page');
    await page.waitForLoadState('networkidle');
  });

  test('Group theory notation renders correctly', async ({ page }) => {
    const groupTheoryFormulas = [
      {
        formula: '\\langle g \\rangle = \\{e, g, g^2, \\ldots, g^{n-1}\\}',
        name: 'cyclic-group-generation'
      },
      {
        formula: '|G| = |H| \\cdot [G:H]',
        name: 'lagrange-theorem'
      },
      {
        formula: 'G/N = \\{gN : g \\in G\\}',
        name: 'quotient-group'
      },
      {
        formula: '\\text{Ker}(\\phi) = \\{g \\in G : \\phi(g) = e_H\\}',
        name: 'kernel-homomorphism'
      },
      {
        formula: 'S_n = \\{\\sigma : \\{1,2,\\ldots,n\\} \\to \\{1,2,\\ldots,n\\} \\text{ bijective}\\}',
        name: 'symmetric-group'
      },
    ];

    for (const { formula, name } of groupTheoryFormulas) {
      await testLatexFormula(page, formula, `group-theory-${name}`, 'complexFormulas', true);
    }
  });

  test('Topology and TDA notation renders correctly', async ({ page }) => {
    const topologyFormulas = [
      {
        formula: 'H_p(X) = \\text{Ker}(\\partial_p) / \\text{Im}(\\partial_{p+1})',
        name: 'homology-definition'
      },
      {
        formula: '\\beta_p = \\dim H_p(X) = \\text{rank}(H_p(X))',
        name: 'betti-numbers'
      },
      {
        formula: '\\chi(X) = \\sum_{p=0}^{\\infty} (-1)^p \\beta_p',
        name: 'euler-characteristic'
      },
      {
        formula: '\\text{Pers}_p(f) = \\{(b,d) : \\text{feature born at } b, \\text{ dies at } d\\}',
        name: 'persistence-pairs'
      },
      {
        formula: 'VR_\\epsilon(X) = \\bigcup_{x \\in X} B(x, \\epsilon)',
        name: 'vietoris-rips-complex'
      },
    ];

    for (const { formula, name } of topologyFormulas) {
      await testLatexFormula(page, formula, `topology-${name}`, 'complexFormulas', true);
    }
  });

  test('Elliptic curve notation renders correctly', async ({ page }) => {
    const ellipticCurveFormulas = [
      {
        formula: 'E: y^2 = x^3 + ax + b',
        name: 'weierstrass-form'
      },
      {
        formula: 'P + Q = R \\text{ where } P, Q, R \\in E(\\mathbb{F}_p)',
        name: 'point-addition'
      },
      {
        formula: '\\lambda = \\frac{y_2 - y_1}{x_2 - x_1} \\pmod{p}',
        name: 'chord-slope'
      },
      {
        formula: '[n]P = \\underbrace{P + P + \\cdots + P}_{n \\text{ times}}',
        name: 'scalar-multiplication'
      },
      {
        formula: '\\#E(\\mathbb{F}_p) = p + 1 - t \\text{ where } |t| \\leq 2\\sqrt{p}',
        name: 'hasse-bound'
      },
    ];

    for (const { formula, name } of ellipticCurveFormulas) {
      await testLatexFormula(page, formula, `elliptic-curve-${name}`, 'complexFormulas', true);
    }
  });
});

test.describe('LaTeX Rendering in Different Contexts', () => {
  test('Mathematics in article content renders consistently', async ({ page }) => {
    await page.goto('/mathematical-content/group-theory-fundamentals');
    await page.waitForLoadState('networkidle');
    
    // Wait for all LaTeX to render
    await page.waitForFunction(() => {
      const katexElements = document.querySelectorAll('.katex');
      return katexElements.length > 0 && Array.from(katexElements).every(el => 
        el.querySelector('.katex-mathml') || el.querySelector('.katex-html')
      );
    }, { timeout: 10000 });
    
    const result = await compareLatexRendering(
      page,
      'article-group-theory-content',
      'complexFormulas',
      '[data-testid="article-content"]'
    );
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(3);
  });

  test('Mathematics in tooltips and popups renders consistently', async ({ page }) => {
    await page.goto('/interactive-group-explorer');
    await page.waitForLoadState('networkidle');
    
    // Hover over an element to show mathematical tooltip
    await page.hover('[data-testid="group-element-g"]');
    await page.waitForTimeout(1000);
    
    // Wait for tooltip LaTeX to render
    await page.waitForSelector('[data-testid="math-tooltip"]', { state: 'visible' });
    await page.waitForTimeout(500);
    
    const result = await compareLatexRendering(
      page,
      'tooltip-mathematical-content',
      'inlineFormulas',
      '[data-testid="math-tooltip"]'
    );
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(2);
  });

  test('Mathematics in interactive cards renders consistently', async ({ page }) => {
    await page.goto('/mathematical-concepts');
    await page.waitForLoadState('networkidle');
    
    // Click on a concept card to expand it
    await page.click('[data-testid="concept-card-homomorphism"]');
    await page.waitForTimeout(1000);
    
    const result = await compareLatexRendering(
      page,
      'concept-card-mathematical-content',
      'complexFormulas',
      '[data-testid="expanded-concept-card"]'
    );
    
    expect(result.match).toBe(true);
    expect(result.diffPercentage).toBeLessThan(3);
  });
});

test.describe('LaTeX Font and Size Consistency', () => {
  test('Different font sizes render proportionally', async ({ page }) => {
    await page.goto('/math-test-page');
    await page.waitForLoadState('networkidle');
    
    const fontSizes = [
      { size: '12px', name: 'small' },
      { size: '16px', name: 'normal' },
      { size: '20px', name: 'large' },
      { size: '24px', name: 'xl' }
    ];
    
    for (const { size, name } of fontSizes) {
      await page.evaluate(({ size }) => {
        const container = document.createElement('div');
        container.setAttribute('data-testid', 'latex-size-test-container');
        container.style.cssText = `
          padding: 20px;
          background: white;
          border: 1px solid #ccc;
          margin: 10px;
          font-size: ${size};
        `;
        container.innerHTML = `$$\\frac{d}{dx}\\int_a^x f(t)dt = f(x)$$`;
        document.body.appendChild(container);
      }, { size });
      
      await page.waitForTimeout(1000);
      
      const result = await compareLatexRendering(
        page,
        `font-size-${name}`,
        'displayFormulas',
        '[data-testid="latex-size-test-container"]'
      );
      
      expect(result.match).toBe(true);
      expect(result.diffPercentage).toBeLessThan(2);
      
      await page.evaluate(() => {
        const container = document.querySelector('[data-testid="latex-size-test-container"]');
        if (container) container.remove();
      });
    }
  });

  test('Color variations render consistently', async ({ page }) => {
    await page.goto('/math-test-page');
    await page.waitForLoadState('networkidle');
    
    const colorFormulas = [
      { formula: '\\textcolor{red}{f(x)} = \\textcolor{blue}{x^2} + \\textcolor{green}{2x} + \\textcolor{orange}{1}', name: 'colored-polynomial' },
      { formula: '\\colorbox{yellow}{$E = mc^2$}', name: 'highlighted-equation' },
      { formula: '\\color{purple}{\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}}', name: 'purple-sum' },
    ];
    
    for (const { formula, name } of colorFormulas) {
      await testLatexFormula(page, formula, `color-${name}`, 'complexFormulas', true);
    }
  });
});

test.describe('LaTeX Cross-Browser Rendering', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`LaTeX renders consistently in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
      if (currentBrowser !== browserName) {
        test.skip();
      }
      
      await page.goto('/math-test-page');
      await page.waitForLoadState('networkidle');
      
      // Test a complex formula that might render differently across browsers
      const complexFormula = '\\begin{align} \\nabla \\times \\vec{F} &= \\begin{vmatrix} \\vec{i} & \\vec{j} & \\vec{k} \\\\ \\frac{\\partial}{\\partial x} & \\frac{\\partial}{\\partial y} & \\frac{\\partial}{\\partial z} \\\\ F_x & F_y & F_z \\end{vmatrix} \\\\ &= \\left(\\frac{\\partial F_z}{\\partial y} - \\frac{\\partial F_y}{\\partial z}\\right)\\vec{i} + \\left(\\frac{\\partial F_x}{\\partial z} - \\frac{\\partial F_z}{\\partial x}\\right)\\vec{j} + \\left(\\frac{\\partial F_y}{\\partial x} - \\frac{\\partial F_x}{\\partial y}\\right)\\vec{k} \\end{align}';
      
      await testLatexFormula(page, complexFormula, `curl-formula-${browserName}`, 'complexFormulas', true);
    });
  });
});

test.describe('LaTeX Accessibility Rendering', () => {
  test('High contrast mode preserves mathematical clarity', async ({ page }) => {
    await page.goto('/math-test-page');
    await page.waitForLoadState('networkidle');
    
    // Enable high contrast mode
    await page.addStyleTag({
      content: `
        .katex { 
          color: #ffffff !important; 
          background: #000000 !important; 
        }
        .katex .base { 
          color: #ffffff !important; 
        }
      `
    });
    
    await testLatexFormula(
      page, 
      '\\int_0^\\pi \\sin(x) dx = 2', 
      'high-contrast-integral', 
      'displayFormulas', 
      true
    );
  });

  test('Large text mode scales mathematical formulas correctly', async ({ page }) => {
    await page.goto('/math-test-page');
    await page.waitForLoadState('networkidle');
    
    // Simulate large text accessibility setting
    await page.addStyleTag({
      content: `
        html { font-size: 150% !important; }
        .katex { font-size: 1.5em !important; }
      `
    });
    
    await testLatexFormula(
      page, 
      '\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}}{n} = \\ln(2)', 
      'large-text-series', 
      'displayFormulas', 
      true
    );
  });
});