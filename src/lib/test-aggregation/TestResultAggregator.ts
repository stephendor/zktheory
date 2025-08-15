/**
 * Comprehensive Test Result Aggregation System
 * Collects, analyzes, and reports test results from all test categories
 * with mathematical-specific metrics and intelligent failure analysis
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

export interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration: number;
  category: 'unit' | 'mathematical' | 'performance' | 'visual' | 'integration' | 'e2e';
  timestamp: number;
  error?: {
    message: string;
    stack?: string;
    type: string;
  };
  metadata?: {
    browser?: string;
    nodeVersion?: string;
    component?: string;
    operation?: string;
    threshold?: number;
    actual?: number;
    baseline?: number;
    [key: string]: any;
  };
}

export interface AggregatedResults {
  summary: TestSummary;
  categories: CategoryResults;
  performance: PerformanceAnalysis;
  mathematical: MathematicalAnalysis;
  visual: VisualAnalysis;
  failures: FailureAnalysis;
  trends: TrendAnalysis;
  recommendations: string[];
}

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  passRate: number;
  timestamp: number;
  commit?: string;
  branch?: string;
}

export interface CategoryResults {
  [category: string]: {
    summary: TestSummary;
    results: TestResult[];
    coverage?: CoverageReport;
    artifacts?: string[];
  };
}

export interface PerformanceAnalysis {
  thresholds: {
    execution: number;
    memory: number;
    rendering: number;
  };
  violations: Array<{
    test: string;
    metric: string;
    threshold: number;
    actual: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  baselines: {
    updated: boolean;
    comparisons: Array<{
      operation: string;
      baseline: number;
      current: number;
      regression: number;
    }>;
  };
  trends: {
    improving: string[];
    degrading: string[];
    stable: string[];
  };
}

export interface MathematicalAnalysis {
  groupTheory: {
    operations: number;
    validations: number;
    accuracy: number;
    failures: Array<{
      operation: string;
      expected: any;
      actual: any;
      tolerance: number;
    }>;
  };
  tda: {
    computations: number;
    accuracy: number;
    memoryUsage: number;
    processingTime: number;
    errors: string[];
  };
  latex: {
    renderings: number;
    successful: number;
    failed: number;
    renderTime: number;
    compatibility: {
      katex: number;
      mathjax: number;
    };
  };
  numerical: {
    precision: number;
    errors: number;
    overflow: number;
    underflow: number;
  };
}

export interface VisualAnalysis {
  screenshots: {
    total: number;
    passed: number;
    failed: number;
    updated: number;
  };
  regressions: Array<{
    component: string;
    threshold: number;
    difference: number;
    severity: 'minor' | 'major' | 'critical';
    screenshotPath: string;
    diffPath?: string;
  }>;
  components: {
    [component: string]: {
      status: 'stable' | 'changed' | 'failed';
      lastUpdate: number;
      changeHistory: number[];
    };
  };
}

export interface FailureAnalysis {
  patterns: Array<{
    pattern: string;
    count: number;
    tests: string[];
    category: string;
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
  }>;
  correlations: Array<{
    primary: string;
    secondary: string;
    correlation: number;
    description: string;
  }>;
  hotspots: Array<{
    component: string;
    failures: number;
    categories: string[];
    risk: 'low' | 'medium' | 'high';
  }>;
}

export interface TrendAnalysis {
  historical: {
    passRates: Array<{ date: string; rate: number; category: string }>;
    performance: Array<{ date: string; metric: string; value: number }>;
    coverage: Array<{ date: string; percentage: number; lines: number }>;
  };
  predictions: {
    passRateWeek: number;
    performanceTrend: 'improving' | 'stable' | 'degrading';
    riskAreas: string[];
  };
}

export interface CoverageReport {
  lines: { total: number; covered: number; percentage: number };
  functions: { total: number; covered: number; percentage: number };
  branches: { total: number; covered: number; percentage: number };
  statements: { total: number; covered: number; percentage: number };
  files: Array<{
    path: string;
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  }>;
}

export class TestResultAggregator {
  private results: TestResult[] = [];
  private artifacts: Map<string, string[]> = new Map();
  private historicalData: Map<string, any[]> = new Map();
  
  constructor(
    private config: {
      dataDir: string;
      retentionDays: number;
      thresholds: {
        performance: number;
        memory: number;
        passRate: number;
        coverage: number;
      };
    }
  ) {
    this.ensureDirectoryStructure();
    this.loadHistoricalData();
  }

  /**
   * Collect test results from various sources
   */
  async collectResults(sourcePaths: string[]): Promise<void> {
    this.results = [];
    
    for (const sourcePath of sourcePaths) {
      await this.collectFromPath(sourcePath);
    }
    
    console.log(`Collected ${this.results.length} test results from ${sourcePaths.length} sources`);
  }

  /**
   * Collect test results from a specific path
   */
  private async collectFromPath(sourcePath: string): Promise<void> {
    try {
      if (!fs.existsSync(sourcePath)) {
        console.warn(`Source path does not exist: ${sourcePath}`);
        return;
      }

      const stats = fs.statSync(sourcePath);
      
      if (stats.isDirectory()) {
        await this.collectFromDirectory(sourcePath);
      } else if (stats.isFile()) {
        await this.collectFromFile(sourcePath);
      }
    } catch (error) {
      console.error(`Error collecting from ${sourcePath}:`, error);
    }
  }

  /**
   * Collect test results from a directory
   */
  private async collectFromDirectory(dirPath: string): Promise<void> {
    // Jest results
    const jestFiles = await glob('**/test-results.json', { cwd: dirPath });
    for (const file of jestFiles) {
      await this.parseJestResults(path.join(dirPath, file));
    }

    // Playwright results
    const playwrightFiles = await glob('**/results.json', { cwd: dirPath });
    for (const file of playwrightFiles) {
      await this.parsePlaywrightResults(path.join(dirPath, file));
    }

    // Performance results
    const performanceFiles = await glob('**/performance-*.json', { cwd: dirPath });
    for (const file of performanceFiles) {
      await this.parsePerformanceResults(path.join(dirPath, file));
    }

    // Coverage reports
    const coverageFiles = await glob('**/coverage-final.json', { cwd: dirPath });
    for (const file of coverageFiles) {
      await this.parseCoverageResults(path.join(dirPath, file));
    }

    // Visual test results
    const visualFiles = await glob('**/visual-results.json', { cwd: dirPath });
    for (const file of visualFiles) {
      await this.parseVisualResults(path.join(dirPath, file));
    }
  }

  /**
   * Collect test results from a single file
   */
  private async collectFromFile(filePath: string): Promise<void> {
    const extension = path.extname(filePath);
    const basename = path.basename(filePath, extension);

    try {
      switch (true) {
        case basename.includes('jest') || basename.includes('unit'):
          await this.parseJestResults(filePath);
          break;
        case basename.includes('playwright') || basename.includes('e2e'):
          await this.parsePlaywrightResults(filePath);
          break;
        case basename.includes('performance'):
          await this.parsePerformanceResults(filePath);
          break;
        case basename.includes('coverage'):
          await this.parseCoverageResults(filePath);
          break;
        case basename.includes('visual'):
          await this.parseVisualResults(filePath);
          break;
        default:
          // Try to auto-detect format
          await this.parseGenericResults(filePath);
      }
    } catch (error) {
      console.error(`Error parsing file ${filePath}:`, error);
    }
  }

  /**
   * Parse Jest test results
   */
  private async parseJestResults(filePath: string): Promise<void> {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (data.testResults) {
        for (const testFile of data.testResults) {
          for (const result of testFile.assertionResults) {
            this.results.push({
              id: `jest-${testFile.name}-${result.title}`,
              name: result.title,
              status: result.status === 'passed' ? 'passed' : 
                      result.status === 'failed' ? 'failed' : 'skipped',
              duration: result.duration || 0,
              category: this.detectCategory(testFile.name, result.title),
              timestamp: Date.now(),
              error: result.failureMessages?.length > 0 ? {
                message: result.failureMessages[0],
                stack: result.failureDetails?.[0]?.stack,
                type: 'assertion'
              } : undefined,
              metadata: {
                file: testFile.name,
                suite: result.ancestorTitles?.join(' > '),
                nodeVersion: process.version
              }
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error parsing Jest results from ${filePath}:`, error);
    }
  }

  /**
   * Parse Playwright test results
   */
  private async parsePlaywrightResults(filePath: string): Promise<void> {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (data.suites) {
        for (const suite of data.suites) {
          await this.parsePlaywrightSuite(suite, '');
        }
      }
    } catch (error) {
      console.error(`Error parsing Playwright results from ${filePath}:`, error);
    }
  }

  /**
   * Parse Playwright test suite recursively
   */
  private async parsePlaywrightSuite(suite: any, parentTitle: string): Promise<void> {
    const fullTitle = parentTitle ? `${parentTitle} > ${suite.title}` : suite.title;
    
    if (suite.tests) {
      for (const test of suite.tests) {
        const lastResult = test.results?.[test.results.length - 1];
        if (lastResult) {
          this.results.push({
            id: `playwright-${test.id}`,
            name: test.title,
            status: lastResult.status === 'passed' ? 'passed' :
                    lastResult.status === 'failed' ? 'failed' : 'skipped',
            duration: lastResult.duration || 0,
            category: this.detectCategory(suite.file || '', test.title),
            timestamp: Date.now(),
            error: lastResult.error ? {
              message: lastResult.error.message,
              stack: lastResult.error.stack,
              type: 'playwright'
            } : undefined,
            metadata: {
              file: suite.file,
              suite: fullTitle,
              browser: test.project,
              retries: test.results.length - 1,
              screenshots: lastResult.attachments?.filter((a: any) => a.name === 'screenshot').length || 0
            }
          });
        }
      }
    }
    
    if (suite.suites) {
      for (const subSuite of suite.suites) {
        await this.parsePlaywrightSuite(subSuite, fullTitle);
      }
    }
  }

  /**
   * Parse performance test results
   */
  private async parsePerformanceResults(filePath: string): Promise<void> {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (data.benchmarks) {
        for (const benchmark of data.benchmarks) {
          this.results.push({
            id: `performance-${benchmark.name}`,
            name: benchmark.name,
            status: benchmark.status || (benchmark.duration < this.config.thresholds.performance ? 'passed' : 'failed'),
            duration: benchmark.duration,
            category: 'performance',
            timestamp: Date.now(),
            metadata: {
              operation: benchmark.operation,
              threshold: benchmark.threshold || this.config.thresholds.performance,
              actual: benchmark.duration,
              baseline: benchmark.baseline,
              memory: benchmark.memory,
              iterations: benchmark.iterations
            }
          });
        }
      }
    } catch (error) {
      console.error(`Error parsing performance results from ${filePath}:`, error);
    }
  }

  /**
   * Parse coverage results
   */
  private async parseCoverageResults(filePath: string): Promise<void> {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Store coverage data for later analysis
      this.artifacts.set('coverage', [filePath]);
      
      // Create coverage summary result
      if (data.total) {
        const coverage = data.total;
        this.results.push({
          id: 'coverage-summary',
          name: 'Code Coverage Summary',
          status: coverage.lines.pct >= this.config.thresholds.coverage ? 'passed' : 'failed',
          duration: 0,
          category: 'unit',
          timestamp: Date.now(),
          metadata: {
            lines: coverage.lines.pct,
            functions: coverage.functions.pct,
            branches: coverage.branches.pct,
            statements: coverage.statements.pct,
            threshold: this.config.thresholds.coverage
          }
        });
      }
    } catch (error) {
      console.error(`Error parsing coverage results from ${filePath}:`, error);
    }
  }

  /**
   * Parse visual test results
   */
  private async parseVisualResults(filePath: string): Promise<void> {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (data.screenshots) {
        for (const screenshot of data.screenshots) {
          this.results.push({
            id: `visual-${screenshot.name}`,
            name: screenshot.name,
            status: screenshot.status || (screenshot.diff < 0.2 ? 'passed' : 'failed'),
            duration: 0,
            category: 'visual',
            timestamp: Date.now(),
            metadata: {
              component: screenshot.component,
              threshold: screenshot.threshold || 0.2,
              actual: screenshot.diff,
              screenshotPath: screenshot.path,
              diffPath: screenshot.diffPath
            }
          });
        }
      }
    } catch (error) {
      console.error(`Error parsing visual results from ${filePath}:`, error);
    }
  }

  /**
   * Parse generic test results
   */
  private async parseGenericResults(filePath: string): Promise<void> {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Try to detect format and parse accordingly
      if (data.testResults) {
        await this.parseJestResults(filePath);
      } else if (data.suites) {
        await this.parsePlaywrightResults(filePath);
      } else if (data.benchmarks) {
        await this.parsePerformanceResults(filePath);
      }
    } catch (error) {
      // Not a JSON file or unknown format, skip silently
    }
  }

  /**
   * Detect test category from file path and test name
   */
  private detectCategory(filePath: string, testName: string): TestResult['category'] {
    const path = filePath.toLowerCase();
    const name = testName.toLowerCase();
    
    if (path.includes('performance') || name.includes('performance') || name.includes('benchmark')) {
      return 'performance';
    }
    if (path.includes('visual') || name.includes('visual') || name.includes('screenshot')) {
      return 'visual';
    }
    if (path.includes('e2e') || path.includes('end-to-end') || name.includes('e2e')) {
      return 'e2e';
    }
    if (path.includes('integration') || name.includes('integration')) {
      return 'integration';
    }
    if (path.includes('mathematical') || name.includes('mathematical') || 
        name.includes('group theory') || name.includes('tda') || name.includes('cayley')) {
      return 'mathematical';
    }
    
    return 'unit';
  }

  /**
   * Aggregate all collected results into comprehensive analysis
   */
  async aggregateResults(): Promise<AggregatedResults> {
    const summary = this.generateSummary();
    const categories = this.generateCategoryResults();
    const performance = await this.analyzePerformance();
    const mathematical = await this.analyzeMathematical();
    const visual = await this.analyzeVisual();
    const failures = await this.analyzeFailures();
    const trends = await this.analyzeTrends();
    const recommendations = this.generateRecommendations(summary, performance, mathematical, visual, failures);

    const aggregated: AggregatedResults = {
      summary,
      categories,
      performance,
      mathematical,
      visual,
      failures,
      trends,
      recommendations
    };

    // Save results for historical tracking
    await this.saveHistoricalData(aggregated);

    return aggregated;
  }

  /**
   * Generate overall test summary
   */
  private generateSummary(): TestSummary {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const duration = this.results.reduce((sum, r) => sum + r.duration, 0);
    
    return {
      total,
      passed,
      failed,
      skipped,
      duration,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      timestamp: Date.now(),
      commit: process.env.GITHUB_SHA,
      branch: process.env.GITHUB_REF_NAME
    };
  }

  /**
   * Generate results by category
   */
  private generateCategoryResults(): CategoryResults {
    const categories: CategoryResults = {};
    const categoryGroups = this.groupByCategory();
    
    for (const [category, results] of categoryGroups.entries()) {
      const passed = results.filter(r => r.status === 'passed').length;
      const failed = results.filter(r => r.status === 'failed').length;
      const skipped = results.filter(r => r.status === 'skipped').length;
      const duration = results.reduce((sum, r) => sum + r.duration, 0);
      
      categories[category] = {
        summary: {
          total: results.length,
          passed,
          failed,
          skipped,
          duration,
          passRate: results.length > 0 ? (passed / results.length) * 100 : 0,
          timestamp: Date.now()
        },
        results,
        artifacts: this.artifacts.get(category) || []
      };
    }
    
    return categories;
  }

  /**
   * Group results by category
   */
  private groupByCategory(): Map<string, TestResult[]> {
    const groups = new Map<string, TestResult[]>();
    
    for (const result of this.results) {
      if (!groups.has(result.category)) {
        groups.set(result.category, []);
      }
      groups.get(result.category)!.push(result);
    }
    
    return groups;
  }

  /**
   * Analyze performance test results
   */
  private async analyzePerformance(): Promise<PerformanceAnalysis> {
    const performanceResults = this.results.filter(r => r.category === 'performance');
    
    const violations = performanceResults
      .filter(r => r.metadata?.threshold !== undefined && r.metadata?.actual !== undefined && r.metadata.actual > r.metadata.threshold)
      .map(r => ({
        test: r.name,
        metric: 'execution_time',
        threshold: r.metadata!.threshold!,
        actual: r.metadata!.actual!,
        severity: this.calculateSeverity(r.metadata!.actual!, r.metadata!.threshold!)
      }));

    // Load historical performance data for baseline comparison
    const baselines = await this.compareBaselines(performanceResults);
    
    // Analyze trends
    const trends = this.analyzePerformanceTrends(performanceResults);

    return {
      thresholds: {
        execution: this.config.thresholds.performance,
        memory: this.config.thresholds.memory,
        rendering: 5000 // 5 seconds for rendering operations
      },
      violations,
      baselines,
      trends
    };
  }

  /**
   * Analyze mathematical computation results
   */
  private async analyzeMathematical(): Promise<MathematicalAnalysis> {
    const mathematicalResults = this.results.filter(r => r.category === 'mathematical');
    
    // Group theory analysis
    const groupTheoryResults = mathematicalResults.filter(r => 
      r.name.toLowerCase().includes('group') || 
      r.name.toLowerCase().includes('cayley')
    );
    
    // TDA analysis
    const tdaResults = mathematicalResults.filter(r => 
      r.name.toLowerCase().includes('tda') || 
      r.name.toLowerCase().includes('persistence')
    );
    
    // LaTeX rendering analysis
    const latexResults = mathematicalResults.filter(r => 
      r.name.toLowerCase().includes('latex') || 
      r.name.toLowerCase().includes('katex') ||
      r.name.toLowerCase().includes('math')
    );

    return {
      groupTheory: {
        operations: groupTheoryResults.length,
        validations: groupTheoryResults.filter(r => r.status === 'passed').length,
        accuracy: groupTheoryResults.length > 0 ? 
          (groupTheoryResults.filter(r => r.status === 'passed').length / groupTheoryResults.length) * 100 : 0,
        failures: groupTheoryResults
          .filter(r => r.status === 'failed')
          .map(r => ({
            operation: r.name,
            expected: r.metadata?.expected,
            actual: r.metadata?.actual,
            tolerance: r.metadata?.tolerance || 0.001
          }))
      },
      tda: {
        computations: tdaResults.length,
        accuracy: tdaResults.length > 0 ? 
          (tdaResults.filter(r => r.status === 'passed').length / tdaResults.length) * 100 : 0,
        memoryUsage: this.calculateAverageMemory(tdaResults),
        processingTime: this.calculateAverageTime(tdaResults),
        errors: tdaResults.filter(r => r.status === 'failed').map(r => r.error?.message || 'Unknown error')
      },
      latex: {
        renderings: latexResults.length,
        successful: latexResults.filter(r => r.status === 'passed').length,
        failed: latexResults.filter(r => r.status === 'failed').length,
        renderTime: this.calculateAverageTime(latexResults),
        compatibility: {
          katex: latexResults.filter(r => r.name.includes('katex')).length,
          mathjax: latexResults.filter(r => r.name.includes('mathjax')).length
        }
      },
      numerical: {
        precision: this.calculateNumericalPrecision(mathematicalResults),
        errors: mathematicalResults.filter(r => r.error?.type === 'numerical').length,
        overflow: mathematicalResults.filter(r => r.error?.message?.includes('overflow')).length,
        underflow: mathematicalResults.filter(r => r.error?.message?.includes('underflow')).length
      }
    };
  }

  /**
   * Analyze visual test results
   */
  private async analyzeVisual(): Promise<VisualAnalysis> {
    const visualResults = this.results.filter(r => r.category === 'visual');
    
    const screenshots = {
      total: visualResults.length,
      passed: visualResults.filter(r => r.status === 'passed').length,
      failed: visualResults.filter(r => r.status === 'failed').length,
      updated: visualResults.filter(r => r.metadata?.updated).length
    };

    const regressions = visualResults
      .filter(r => r.status === 'failed' && r.metadata?.actual !== undefined && r.metadata?.threshold !== undefined && r.metadata.actual > r.metadata.threshold)
      .map(r => ({
        component: r.metadata?.component || 'Unknown',
        threshold: r.metadata?.threshold || 0.2,
        difference: r.metadata?.actual || 0,
        severity: this.calculateVisualSeverity(r.metadata?.actual || 0, r.metadata?.threshold || 0.2),
        screenshotPath: r.metadata?.screenshotPath || '',
        diffPath: r.metadata?.diffPath
      }));

    // Analyze component stability
    const components: VisualAnalysis['components'] = {};
    const componentGroups = this.groupBy(visualResults, r => r.metadata?.component || 'Unknown');
    
    for (const [component, results] of componentGroups.entries()) {
      const failedCount = results.filter(r => r.status === 'failed').length;
      components[component] = {
        status: failedCount === 0 ? 'stable' : failedCount < results.length ? 'changed' : 'failed',
        lastUpdate: Math.max(...results.map(r => r.timestamp)),
        changeHistory: results.map(r => r.metadata?.actual || 0)
      };
    }

    return {
      screenshots,
      regressions,
      components
    };
  }

  /**
   * Analyze failure patterns and correlations
   */
  private async analyzeFailures(): Promise<FailureAnalysis> {
    const failedResults = this.results.filter(r => r.status === 'failed');
    
    // Identify common failure patterns
    const patterns = this.identifyFailurePatterns(failedResults);
    
    // Find correlations between different types of failures
    const correlations = this.findFailureCorrelations(failedResults);
    
    // Identify failure hotspots
    const hotspots = this.identifyFailureHotspots(failedResults);

    return {
      patterns,
      correlations,
      hotspots
    };
  }

  /**
   * Analyze trends over time
   */
  private async analyzeTrends(): Promise<TrendAnalysis> {
    const historical = await this.loadHistoricalTrends();
    const predictions = this.generatePredictions(historical);

    return {
      historical,
      predictions
    };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    summary: TestSummary,
    performance: PerformanceAnalysis,
    mathematical: MathematicalAnalysis,
    visual: VisualAnalysis,
    failures: FailureAnalysis
  ): string[] {
    const recommendations: string[] = [];

    // Pass rate recommendations
    if (summary.passRate < this.config.thresholds.passRate) {
      recommendations.push(`Pass rate (${summary.passRate.toFixed(1)}%) is below threshold (${this.config.thresholds.passRate}%). Focus on fixing failing tests.`);
    }

    // Performance recommendations
    if (performance.violations.length > 0) {
      recommendations.push(`${performance.violations.length} performance threshold violations detected. Optimize slow operations.`);
    }

    // Mathematical accuracy recommendations
    if (mathematical.groupTheory.accuracy < 95) {
      recommendations.push(`Group theory accuracy (${mathematical.groupTheory.accuracy.toFixed(1)}%) needs improvement. Review mathematical implementations.`);
    }

    // Visual regression recommendations
    if (visual.regressions.length > 0) {
      recommendations.push(`${visual.regressions.length} visual regressions detected. Review UI changes and update baselines if needed.`);
    }

    // Failure pattern recommendations
    for (const pattern of failures.patterns) {
      if (pattern.severity === 'high' && pattern.count > 3) {
        recommendations.push(`High frequency failure pattern detected: ${pattern.pattern}. ${pattern.recommendation}`);
      }
    }

    return recommendations;
  }

  // Helper methods for calculations and analysis

  private calculateSeverity(actual: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = actual / threshold;
    if (ratio < 1.2) return 'low';
    if (ratio < 1.5) return 'medium';
    if (ratio < 2.0) return 'high';
    return 'critical';
  }

  private calculateVisualSeverity(actual: number, threshold: number): 'minor' | 'major' | 'critical' {
    const ratio = actual / threshold;
    if (ratio < 2) return 'minor';
    if (ratio < 5) return 'major';
    return 'critical';
  }

  private calculateAverageMemory(results: TestResult[]): number {
    const memoryResults = results.filter(r => r.metadata?.memory);
    return memoryResults.length > 0 ? 
      memoryResults.reduce((sum, r) => sum + (r.metadata!.memory || 0), 0) / memoryResults.length : 0;
  }

  private calculateAverageTime(results: TestResult[]): number {
    return results.length > 0 ? 
      results.reduce((sum, r) => sum + r.duration, 0) / results.length : 0;
  }

  private calculateNumericalPrecision(results: TestResult[]): number {
    const precisionResults = results.filter(r => r.metadata?.precision);
    return precisionResults.length > 0 ? 
      precisionResults.reduce((sum, r) => sum + (r.metadata!.precision || 0), 0) / precisionResults.length : 0;
  }

  private groupBy<T, K>(array: T[], keyFn: (item: T) => K): Map<K, T[]> {
    const map = new Map<K, T[]>();
    for (const item of array) {
      const key = keyFn(item);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    }
    return map;
  }

  private async compareBaselines(results: TestResult[]): Promise<PerformanceAnalysis['baselines']> {
    // Implementation for baseline comparison
    return {
      updated: false,
      comparisons: []
    };
  }

  private analyzePerformanceTrends(results: TestResult[]): PerformanceAnalysis['trends'] {
    // Implementation for performance trend analysis
    return {
      improving: [],
      degrading: [],
      stable: []
    };
  }

  private identifyFailurePatterns(results: TestResult[]): FailureAnalysis['patterns'] {
    // Implementation for failure pattern identification
    return [];
  }

  private findFailureCorrelations(results: TestResult[]): FailureAnalysis['correlations'] {
    // Implementation for failure correlation analysis
    return [];
  }

  private identifyFailureHotspots(results: TestResult[]): FailureAnalysis['hotspots'] {
    // Implementation for failure hotspot identification
    return [];
  }

  private async loadHistoricalTrends(): Promise<TrendAnalysis['historical']> {
    // Implementation for loading historical trend data
    return {
      passRates: [],
      performance: [],
      coverage: []
    };
  }

  private generatePredictions(historical: TrendAnalysis['historical']): TrendAnalysis['predictions'] {
    // Implementation for trend prediction
    return {
      passRateWeek: 0,
      performanceTrend: 'stable',
      riskAreas: []
    };
  }

  private ensureDirectoryStructure(): void {
    const dirs = [
      this.config.dataDir,
      path.join(this.config.dataDir, 'historical'),
      path.join(this.config.dataDir, 'reports'),
      path.join(this.config.dataDir, 'artifacts')
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  private loadHistoricalData(): void {
    // Load historical data for trend analysis
    try {
      const historicalDir = path.join(this.config.dataDir, 'historical');
      if (fs.existsSync(historicalDir)) {
        const files = fs.readdirSync(historicalDir);
        for (const file of files) {
          const filePath = path.join(historicalDir, file);
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const key = path.basename(file, '.json');
          this.historicalData.set(key, data);
        }
      }
    } catch (error) {
      console.warn('Could not load historical data:', error);
    }
  }

  private async saveHistoricalData(results: AggregatedResults): Promise<void> {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `aggregated-${timestamp}.json`;
      const filePath = path.join(this.config.dataDir, 'historical', filename);
      
      fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
      
      // Clean up old files beyond retention period
      this.cleanupOldFiles();
    } catch (error) {
      console.error('Error saving historical data:', error);
    }
  }

  private cleanupOldFiles(): void {
    try {
      const historicalDir = path.join(this.config.dataDir, 'historical');
      const files = fs.readdirSync(historicalDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

      for (const file of files) {
        const filePath = path.join(historicalDir, file);
        const stats = fs.statSync(filePath);
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.warn('Error cleaning up old files:', error);
    }
  }
}