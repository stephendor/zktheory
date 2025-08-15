/**
 * Cross-Browser Testing Utilities for Mathematical Visualizations
 * Ensures mathematical content renders consistently across all browsers
 */

import { Page, Browser, BrowserContext } from '@playwright/test';

export interface BrowserCapabilities {
  name: string;
  supportsWebGL: boolean;
  supportsWebGL2: boolean;
  supportsCanvas: boolean;
  supportsWASM: boolean;
  mathMLSupport: boolean;
  canvasBlendModes: string[];
  maxTextureSize: number;
  precision: 'high' | 'medium' | 'low';
  visualDifferenceTolerance: number;
}

export interface MathematicalRenderingTest {
  testName: string;
  category: 'latex' | 'canvas' | 'webgl' | 'svg' | 'mathml';
  content: string | (() => Promise<void>);
  expectedFeatures: string[];
  browserVariances: Record<string, { tolerance: number; fallback?: string }>;
  performance: { maxRenderTime: number; targetFPS?: number };
}

/**
 * Browser capability detection and configuration
 */
export class BrowserCapabilityDetector {
  static async detectCapabilities(page: Page): Promise<BrowserCapabilities> {
    const capabilities = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      const gl2 = canvas.getContext('webgl2');
      
      return {
        supportsWebGL: !!gl,
        supportsWebGL2: !!gl2,
        supportsCanvas: !!canvas.getContext('2d'),
        supportsWASM: typeof WebAssembly !== 'undefined',
        mathMLSupport: document.implementation.hasFeature('MathML', '2.0'),
        canvasBlendModes: (() => {
          const ctx = canvas.getContext('2d');
          if (!ctx) return [];
          
          const modes = [
            'source-over', 'source-in', 'source-out', 'source-atop',
            'destination-over', 'destination-in', 'destination-out', 'destination-atop',
            'lighter', 'copy', 'xor', 'multiply', 'screen', 'overlay',
            'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light',
            'soft-light', 'difference', 'exclusion', 'hue', 'saturation',
            'color', 'luminosity'
          ];
          
          return modes.filter(mode => {
            try {
              ctx.globalCompositeOperation = mode as GlobalCompositeOperation;
              return ctx.globalCompositeOperation === mode;
            } catch {
              return false;
            }
          });
        })(),
        maxTextureSize: (() => {
          if (!gl) return 0;
          return gl.getParameter(gl.MAX_TEXTURE_SIZE);
        })(),
        userAgent: navigator.userAgent,
        devicePixelRatio: window.devicePixelRatio || 1
      };
    });

    const browserName = await this.getBrowserName(page);
    
    return {
      name: browserName,
      ...capabilities,
      precision: this.determinePrecision(browserName),
      visualDifferenceTolerance: this.getToleranceForBrowser(browserName)
    };
  }

  public static async getBrowserName(page: Page): Promise<string> {
    return await page.evaluate(() => {
      const ua = navigator.userAgent;
      if (ua.includes('Chrome')) return 'chromium';
      if (ua.includes('Firefox')) return 'firefox';
      if (ua.includes('Safari')) return 'webkit';
      if (ua.includes('Edge')) return 'edge';
      return 'unknown';
    });
  }

  private static determinePrecision(browserName: string): 'high' | 'medium' | 'low' {
    switch (browserName) {
      case 'chromium':
      case 'edge':
        return 'high';
      case 'firefox':
        return 'medium';
      case 'webkit':
        return 'medium'; // Safari has some precision issues with canvas
      default:
        return 'low';
    }
  }

  private static getToleranceForBrowser(browserName: string): number {
    switch (browserName) {
      case 'chromium':
        return 0.1; // Strictest tolerance
      case 'firefox':
        return 0.15;
      case 'webkit':
        return 0.2; // More lenient due to rendering differences
      case 'edge':
        return 0.12;
      default:
        return 0.3;
    }
  }
}

/**
 * Mathematical rendering test suite for cross-browser validation
 */
export class MathematicalRenderingTestSuite {
  private static testDefinitions: MathematicalRenderingTest[] = [
    {
      testName: 'Basic LaTeX Fractions',
      category: 'latex',
      content: '\\frac{1}{2}',
      expectedFeatures: ['fraction-bar', 'numerator', 'denominator'],
      browserVariances: {
        webkit: { tolerance: 0.2 },
        firefox: { tolerance: 0.15 },
        chromium: { tolerance: 0.1 }
      },
      performance: { maxRenderTime: 100 }
    },
    
    {
      testName: 'Complex Group Theory Expression',
      category: 'latex',
      content: 'G = \\langle a, b \\mid a^n = b^m = 1, aba^{-1} = b^k \\rangle',
      expectedFeatures: ['angle-brackets', 'superscripts', 'separators'],
      browserVariances: {
        webkit: { tolerance: 0.25 },
        firefox: { tolerance: 0.2 },
        chromium: { tolerance: 0.15 }
      },
      performance: { maxRenderTime: 200 }
    },
    
    {
      testName: 'TDA Persistence Diagram',
      category: 'canvas',
      content: async () => {
        // This would be a function that draws a persistence diagram
        // For now, we'll use a placeholder
      },
      expectedFeatures: ['points', 'diagonal-line', 'axes', 'labels'],
      browserVariances: {
        webkit: { tolerance: 0.3 },
        firefox: { tolerance: 0.2 },
        chromium: { tolerance: 0.15 }
      },
      performance: { maxRenderTime: 500, targetFPS: 30 }
    },
    
    {
      testName: 'Cayley Graph Visualization',
      category: 'webgl',
      content: async () => {
        // WebGL-based Cayley graph rendering
      },
      expectedFeatures: ['nodes', 'edges', 'labels', 'lighting'],
      browserVariances: {
        webkit: { tolerance: 0.4, fallback: 'canvas' },
        firefox: { tolerance: 0.25 },
        chromium: { tolerance: 0.2 }
      },
      performance: { maxRenderTime: 1000, targetFPS: 60 }
    },
    
    {
      testName: 'Mathematical Matrix Display',
      category: 'latex',
      content: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
      expectedFeatures: ['parentheses', 'matrix-elements', 'alignment'],
      browserVariances: {
        webkit: { tolerance: 0.2 },
        firefox: { tolerance: 0.15 },
        chromium: { tolerance: 0.1 }
      },
      performance: { maxRenderTime: 150 }
    }
  ];

  static getTestsForCategory(category: MathematicalRenderingTest['category']): MathematicalRenderingTest[] {
    return this.testDefinitions.filter(test => test.category === category);
  }

  static getTestByName(name: string): MathematicalRenderingTest | undefined {
    return this.testDefinitions.find(test => test.testName === name);
  }

  static getAllTests(): MathematicalRenderingTest[] {
    return [...this.testDefinitions];
  }

  static addCustomTest(test: MathematicalRenderingTest): void {
    this.testDefinitions.push(test);
  }
}

/**
 * Cross-browser screenshot comparison utilities
 */
export class CrossBrowserScreenshotComparator {
  private static screenshots = new Map<string, Map<string, Buffer>>();

  static async captureScreenshot(
    page: Page,
    testName: string,
    browserName: string,
    options: { 
      element?: string; 
      fullPage?: boolean;
      clip?: { x: number; y: number; width: number; height: number };
    } = {}
  ): Promise<Buffer> {
    const screenshot = await page.screenshot({
      fullPage: options.fullPage || false,
      clip: options.clip,
      ...options
    });

    if (!this.screenshots.has(testName)) {
      this.screenshots.set(testName, new Map());
    }
    
    this.screenshots.get(testName)!.set(browserName, screenshot);
    return screenshot;
  }

  static async compareScreenshots(
    testName: string,
    referenceBrowser: string = 'chromium',
    tolerance: number = 0.1
  ): Promise<{
    browser: string;
    differences: number;
    passed: boolean;
  }[]> {
    const testScreenshots = this.screenshots.get(testName);
    if (!testScreenshots) {
      throw new Error(`No screenshots found for test: ${testName}`);
    }

    const referenceScreenshot = testScreenshots.get(referenceBrowser);
    if (!referenceScreenshot) {
      throw new Error(`No reference screenshot found for browser: ${referenceBrowser}`);
    }

    const results: { browser: string; differences: number; passed: boolean }[] = [];

    for (const [browserName, screenshot] of testScreenshots) {
      if (browserName === referenceBrowser) continue;

      const differences = await this.calculateDifferences(referenceScreenshot, screenshot);
      const passed = differences <= tolerance;

      results.push({
        browser: browserName,
        differences,
        passed
      });
    }

    return results;
  }

  private static async calculateDifferences(
    reference: Buffer,
    comparison: Buffer
  ): Promise<number> {
    // This is a placeholder implementation
    // In a real scenario, you'd use a library like pixelmatch or similar
    if (reference.length !== comparison.length) {
      return 1.0; // 100% different if sizes don't match
    }

    let differentPixels = 0;
    const totalPixels = Math.min(reference.length, comparison.length);

    for (let i = 0; i < totalPixels; i++) {
      if (reference[i] !== comparison[i]) {
        differentPixels++;
      }
    }

    return differentPixels / totalPixels;
  }

  static clearScreenshots(testName?: string): void {
    if (testName) {
      this.screenshots.delete(testName);
    } else {
      this.screenshots.clear();
    }
  }
}

/**
 * Performance testing across browsers for mathematical operations
 */
export class CrossBrowserPerformanceTester {
  private static performanceResults = new Map<string, Map<string, number[]>>();

  static async measureRenderingPerformance(
    page: Page,
    testName: string,
    renderFunction: () => Promise<void>,
    iterations: number = 10
  ): Promise<{
    average: number;
    min: number;
    max: number;
    standardDeviation: number;
  }> {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = await page.evaluate(() => performance.now());
      
      await renderFunction();
      
      const endTime = await page.evaluate(() => performance.now());
      times.push(endTime - startTime);
      
      // Clear any artifacts between iterations
      await page.evaluate(() => {
        // Clear canvas, remove elements, etc.
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
      });
    }

    const average = times.reduce((sum, time) => sum + time, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const variance = times.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) / times.length;
    const standardDeviation = Math.sqrt(variance);

    // Store results
    const browserName = await BrowserCapabilityDetector.getBrowserName(page);
    if (!this.performanceResults.has(testName)) {
      this.performanceResults.set(testName, new Map());
    }
    this.performanceResults.get(testName)!.set(browserName, times);

    return { average, min, max, standardDeviation };
  }

  static getPerformanceComparison(testName: string): {
    browser: string;
    average: number;
    relativePerformance: number;
  }[] {
    const testResults = this.performanceResults.get(testName);
    if (!testResults) return [];

    const results: { browser: string; average: number; relativePerformance: number }[] = [];
    let fastestAverage = Infinity;

    // Calculate averages
    for (const [browser, times] of testResults) {
      const average = times.reduce((sum, time) => sum + time, 0) / times.length;
      results.push({ browser, average, relativePerformance: 1 });
      fastestAverage = Math.min(fastestAverage, average);
    }

    // Calculate relative performance
    return results.map(result => ({
      ...result,
      relativePerformance: result.average / fastestAverage
    }));
  }

  static clearPerformanceResults(testName?: string): void {
    if (testName) {
      this.performanceResults.delete(testName);
    } else {
      this.performanceResults.clear();
    }
  }
}

/**
 * Mathematical feature compatibility checker
 */
export class MathematicalFeatureChecker {
  static async checkMathematicalFeatures(page: Page): Promise<{
    latex: boolean;
    mathml: boolean;
    canvas2d: boolean;
    webgl: boolean;
    webgl2: boolean;
    wasm: boolean;
    webWorkers: boolean;
    sharedArrayBuffer: boolean;
  }> {
    return await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      
      return {
        latex: typeof window.katex !== 'undefined' || typeof window.MathJax !== 'undefined',
        mathml: document.implementation.hasFeature('MathML', '2.0'),
        canvas2d: !!canvas.getContext('2d'),
        webgl: !!canvas.getContext('webgl'),
        webgl2: !!canvas.getContext('webgl2'),
        wasm: typeof WebAssembly !== 'undefined',
        webWorkers: typeof Worker !== 'undefined',
        sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined'
      };
    });
  }

  static async validateMathematicalAccuracy(
    page: Page,
    computation: string,
    expectedResult: number,
    tolerance: number = 1e-10
  ): Promise<boolean> {
    const result = await page.evaluate((comp) => {
      try {
        return eval(comp);
      } catch {
        return NaN;
      }
    }, computation);

    return Math.abs(result - expectedResult) < tolerance;
  }
}

/**
 * Main cross-browser test orchestrator
 */
export class CrossBrowserTestOrchestrator {
  static async runMathematicalTestSuite(
    browsers: { name: string; page: Page }[],
    testCategories: MathematicalRenderingTest['category'][] = ['latex', 'canvas', 'webgl']
  ): Promise<{
    browser: string;
    testName: string;
    category: string;
    passed: boolean;
    performance: number;
    capabilities: BrowserCapabilities;
    error?: string;
  }[]> {
    const results: any[] = [];

    for (const { name, page } of browsers) {
      const capabilities = await BrowserCapabilityDetector.detectCapabilities(page);
      
      for (const category of testCategories) {
        const tests = MathematicalRenderingTestSuite.getTestsForCategory(category);
        
        for (const test of tests) {
          try {
            // Check if browser supports required features
            const requiredFeatureSupport = await this.checkFeatureSupport(page, test);
            if (!requiredFeatureSupport) {
              results.push({
                browser: name,
                testName: test.testName,
                category: test.category,
                passed: false,
                performance: 0,
                capabilities,
                error: 'Required features not supported'
              });
              continue;
            }

            // Execute the test
            const startTime = Date.now();
            
            if (typeof test.content === 'string') {
              // LaTeX rendering test
              await this.executeLaTeXTest(page, test.content);
            } else {
              // Function-based test
              await test.content();
            }
            
            const performance = Date.now() - startTime;
            
            // Capture screenshot for comparison
            await CrossBrowserScreenshotComparator.captureScreenshot(
              page,
              test.testName,
              name
            );

            const passed = performance <= test.performance.maxRenderTime;

            results.push({
              browser: name,
              testName: test.testName,
              category: test.category,
              passed,
              performance,
              capabilities
            });

          } catch (error) {
            results.push({
              browser: name,
              testName: test.testName,
              category: test.category,
              passed: false,
              performance: 0,
              capabilities,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      }
    }

    return results;
  }

  private static async checkFeatureSupport(
    page: Page,
    test: MathematicalRenderingTest
  ): Promise<boolean> {
    const features = await MathematicalFeatureChecker.checkMathematicalFeatures(page);
    
    switch (test.category) {
      case 'latex':
        return features.latex;
      case 'canvas':
        return features.canvas2d;
      case 'webgl':
        return features.webgl;
      case 'mathml':
        return features.mathml;
      default:
        return true;
    }
  }

  private static async executeLaTeXTest(page: Page, latex: string): Promise<void> {
    await page.evaluate((tex) => {
      const container = document.createElement('div');
      container.innerHTML = `<div id="math-test">${tex}</div>`;
      document.body.appendChild(container);
      
      // If KaTeX is available, render the LaTeX
      if (typeof window.katex !== 'undefined') {
        const mathElement = document.getElementById('math-test');
        if (mathElement) {
          window.katex.render(tex, mathElement);
        }
      }
    }, latex);
  }
}

/**
 * Export all cross-browser utilities
 */
export const CrossBrowserUtils = {
  BrowserCapabilityDetector,
  MathematicalRenderingTestSuite,
  CrossBrowserScreenshotComparator,
  CrossBrowserPerformanceTester,
  MathematicalFeatureChecker,
  CrossBrowserTestOrchestrator
};

export default CrossBrowserUtils;