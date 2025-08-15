/**
 * Advanced Performance Baseline Management System
 * Provides sophisticated statistical analysis for performance baseline creation,
 * regression detection, and performance trend analysis
 */

import { mathematicalPerformanceMonitor, type MathematicalMetric } from './MathematicalPerformanceMonitor';

export interface BaselineConfiguration {
  minSampleSize: number;
  confidenceLevel: number;
  outlierThreshold: number; // Standard deviations for outlier detection
  updateFrequency: 'continuous' | 'daily' | 'weekly' | 'monthly';
  environments: string[];
  retentionPeriodDays: number;
}

export interface PerformanceBaseline {
  operation: string;
  environment: string;
  createdAt: number;
  updatedAt: number;
  sampleSize: number;
  
  // Central tendency measures
  meanTime: number;
  medianTime: number;
  modeTime: number;
  
  // Dispersion measures
  standardDeviation: number;
  variance: number;
  interquartileRange: number;
  
  // Distribution shape
  skewness: number;
  kurtosis: number;
  
  // Percentiles
  percentiles: {
    p5: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  };
  
  // Confidence intervals
  confidenceIntervals: {
    level: number;
    lower: number;
    upper: number;
  };
  
  // Quality metrics
  normalityTest: {
    testName: string;
    pValue: number;
    isNormal: boolean;
  };
  
  // Historical trend
  trend: {
    direction: 'improving' | 'stable' | 'degrading';
    slope: number;
    correlation: number;
  };
  
  // Metadata
  metadata: {
    platform: string;
    nodeVersion?: string;
    browserVersion?: string;
    inputSizeRange: [number, number];
    complexityClass: string;
  };
}

export interface RegressionTest {
  testType: 'mann_whitney' | 'kolmogorov_smirnov' | 'welch_t_test' | 'bootstrap';
  pValue: number;
  effectSize: number;
  confidenceLevel: number;
  criticalValue: number;
  isSignificant: boolean;
  recommendation: string;
}

export interface PerformanceTrend {
  operation: string;
  timespan: number; // days
  dataPoints: Array<{
    timestamp: number;
    value: number;
    environment: string;
  }>;
  analysis: {
    direction: 'improving' | 'stable' | 'degrading';
    slope: number;
    rSquared: number;
    seasonality: boolean;
    changePoints: number[];
  };
  forecast: {
    nextWeek: { mean: number; confidence: [number, number] };
    nextMonth: { mean: number; confidence: [number, number] };
  };
}

export class PerformanceBaselineManager {
  private baselines: Map<string, PerformanceBaseline> = new Map();
  private measurements: Map<string, MathematicalMetric[]> = new Map();
  private config: BaselineConfiguration;
  
  constructor(config?: Partial<BaselineConfiguration>) {
    this.config = {
      minSampleSize: 30,
      confidenceLevel: 0.95,
      outlierThreshold: 2.5,
      updateFrequency: 'daily',
      environments: ['development', 'testing', 'staging', 'production'],
      retentionPeriodDays: 90,
      ...config
    };
  }

  /**
   * Create or update a performance baseline with comprehensive statistical analysis
   */
  async createBaseline(
    operation: string,
    environment: string,
    customMetrics?: MathematicalMetric[]
  ): Promise<PerformanceBaseline | null> {
    const key = `${operation}_${environment}`;
    const metrics = customMetrics || this.getMeasurements(operation, environment);
    
    if (metrics.length < this.config.minSampleSize) {
      console.warn(`Insufficient data for baseline creation: ${metrics.length} < ${this.config.minSampleSize}`);
      return null;
    }

    // Extract execution times and remove outliers
    const rawTimes = metrics.map(m => m.value);
    const cleanTimes = this.removeOutliers(rawTimes);
    
    if (cleanTimes.length < this.config.minSampleSize * 0.7) {
      console.warn(`Too many outliers removed: ${cleanTimes.length} remaining from ${rawTimes.length}`);
      return null;
    }

    // Calculate comprehensive statistics
    const stats = this.calculateComprehensiveStatistics(cleanTimes);
    const normalityTest = this.performNormalityTest(cleanTimes);
    const confidenceInterval = this.calculateConfidenceInterval(cleanTimes, this.config.confidenceLevel);
    const trend = this.calculateTrend(metrics);
    
    // Create baseline
    const baseline: PerformanceBaseline = {
      operation,
      environment,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sampleSize: cleanTimes.length,
      
      meanTime: stats.mean,
      medianTime: stats.median,
      modeTime: stats.mode,
      
      standardDeviation: stats.standardDeviation,
      variance: stats.variance,
      interquartileRange: stats.iqr,
      
      skewness: stats.skewness,
      kurtosis: stats.kurtosis,
      
      percentiles: stats.percentiles,
      
      confidenceIntervals: {
        level: this.config.confidenceLevel,
        lower: confidenceInterval.lower,
        upper: confidenceInterval.upper
      },
      
      normalityTest,
      trend,
      
      metadata: {
        platform: this.detectPlatform(),
        nodeVersion: this.getNodeVersion(),
        browserVersion: this.getBrowserVersion(),
        inputSizeRange: this.getInputSizeRange(metrics),
        complexityClass: this.getComplexityClass(metrics)
      }
    };

    this.baselines.set(key, baseline);
    
    // Clean up old measurements to maintain performance
    this.cleanupOldMeasurements(operation, environment);
    
    return baseline;
  }

  /**
   * Detect performance regression using multiple statistical tests
   */
  async detectRegression(
    operation: string,
    environment: string,
    newMeasurements: number[],
    testType: 'auto' | 'mann_whitney' | 'kolmogorov_smirnov' | 'welch_t_test' | 'bootstrap' = 'auto'
  ): Promise<RegressionTest | null> {
    const key = `${operation}_${environment}`;
    const baseline = this.baselines.get(key);
    
    if (!baseline) {
      console.warn(`No baseline found for ${key}`);
      return null;
    }

    const baselineMeasurements = this.getMeasurements(operation, environment)
      .map(m => m.value)
      .slice(-baseline.sampleSize); // Use recent baseline data

    if (newMeasurements.length < 5) {
      console.warn(`Insufficient new measurements for regression detection: ${newMeasurements.length}`);
      return null;
    }

    // Auto-select test based on data characteristics
    if (testType === 'auto') {
      testType = this.selectOptimalTest(baselineMeasurements, newMeasurements, baseline);
    }

    // Perform the selected statistical test
    switch (testType) {
      case 'mann_whitney':
        return this.performMannWhitneyTest(baselineMeasurements, newMeasurements);
      case 'kolmogorov_smirnov':
        return this.performKolmogorovSmirnovTest(baselineMeasurements, newMeasurements);
      case 'welch_t_test':
        return this.performWelchTTest(baselineMeasurements, newMeasurements);
      case 'bootstrap':
        return this.performBootstrapTest(baselineMeasurements, newMeasurements);
      default:
        return this.performMannWhitneyTest(baselineMeasurements, newMeasurements);
    }
  }

  /**
   * Generate performance trend analysis
   */
  generateTrendAnalysis(
    operation: string,
    environment: string,
    timespanDays: number = 30
  ): PerformanceTrend | null {
    const metrics = this.getMeasurements(operation, environment);
    const cutoffTime = Date.now() - (timespanDays * 24 * 60 * 60 * 1000);
    const recentMetrics = metrics.filter(m => m.timestamp >= cutoffTime);
    
    if (recentMetrics.length < 10) {
      return null;
    }

    const dataPoints = recentMetrics.map(m => ({
      timestamp: m.timestamp,
      value: m.value,
      environment: environment
    }));

    // Perform trend analysis
    const trendAnalysis = this.performTrendAnalysis(dataPoints);
    const forecast = this.generateForecast(dataPoints);
    
    return {
      operation,
      timespan: timespanDays,
      dataPoints,
      analysis: trendAnalysis,
      forecast
    };
  }

  private calculateComprehensiveStatistics(values: number[]) {
    const sorted = [...values].sort((a, b) => a - b);
    const n = values.length;
    
    // Central tendency
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const median = n % 2 === 0 
      ? (sorted[n/2 - 1] + sorted[n/2]) / 2 
      : sorted[Math.floor(n/2)];
    
    // Mode calculation (most frequent value)
    const frequencyMap = new Map<number, number>();
    values.forEach(val => {
      const rounded = Math.round(val * 100) / 100; // Round to avoid floating point issues
      frequencyMap.set(rounded, (frequencyMap.get(rounded) || 0) + 1);
    });
    const mode = Array.from(frequencyMap.entries())
      .reduce((a, b) => b[1] > a[1] ? b : a)[0];
    
    // Dispersion
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const standardDeviation = Math.sqrt(variance);
    
    // Percentiles
    const getPercentile = (p: number) => {
      const index = Math.ceil((p / 100) * n) - 1;
      return sorted[Math.max(0, Math.min(index, n - 1))];
    };
    
    const percentiles = {
      p5: getPercentile(5),
      p10: getPercentile(10),
      p25: getPercentile(25),
      p50: median,
      p75: getPercentile(75),
      p90: getPercentile(90),
      p95: getPercentile(95),
      p99: getPercentile(99)
    };
    
    const iqr = percentiles.p75 - percentiles.p25;
    
    // Skewness and Kurtosis
    const skewness = this.calculateSkewness(values, mean, standardDeviation);
    const kurtosis = this.calculateKurtosis(values, mean, standardDeviation);
    
    return {
      mean,
      median,
      mode,
      variance,
      standardDeviation,
      iqr,
      percentiles,
      skewness,
      kurtosis
    };
  }

  private calculateSkewness(values: number[], mean: number, stdDev: number): number {
    const n = values.length;
    const skewnessSum = values.reduce((sum, val) => {
      return sum + Math.pow((val - mean) / stdDev, 3);
    }, 0);
    
    return (n / ((n - 1) * (n - 2))) * skewnessSum;
  }

  private calculateKurtosis(values: number[], mean: number, stdDev: number): number {
    const n = values.length;
    const kurtosisSum = values.reduce((sum, val) => {
      return sum + Math.pow((val - mean) / stdDev, 4);
    }, 0);
    
    return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * kurtosisSum - 
           (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
  }

  private removeOutliers(values: number[]): number[] {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - this.config.outlierThreshold * iqr;
    const upperBound = q3 + this.config.outlierThreshold * iqr;
    
    return values.filter(val => val >= lowerBound && val <= upperBound);
  }

  private performNormalityTest(values: number[]): { testName: string; pValue: number; isNormal: boolean } {
    // Simplified Shapiro-Wilk test approximation
    // In production, use a proper statistical library
    const n = values.length;
    const sorted = [...values].sort((a, b) => a - b);
    
    if (n < 3) {
      return { testName: 'insufficient_data', pValue: 1, isNormal: false };
    }
    
    // Calculate test statistic (simplified)
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    
    // Very simplified normality check based on skewness and kurtosis
    const stats = this.calculateComprehensiveStatistics(values);
    const skewnessTest = Math.abs(stats.skewness) < 2;
    const kurtosisTest = Math.abs(stats.kurtosis) < 7;
    
    const isNormal = skewnessTest && kurtosisTest;
    const pValue = isNormal ? 0.8 : 0.02; // Simplified p-value
    
    return {
      testName: 'shapiro_wilk_approximation',
      pValue,
      isNormal
    };
  }

  private calculateConfidenceInterval(
    values: number[], 
    confidenceLevel: number
  ): { lower: number; upper: number } {
    const n = values.length;
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
    const stdError = Math.sqrt(variance / n);
    
    // t-distribution critical value (approximation for large n)
    const alpha = 1 - confidenceLevel;
    const tCritical = this.getTCriticalValue(n - 1, alpha / 2);
    
    const marginOfError = tCritical * stdError;
    
    return {
      lower: mean - marginOfError,
      upper: mean + marginOfError
    };
  }

  private getTCriticalValue(degreesOfFreedom: number, alpha: number): number {
    // Simplified t-distribution critical values
    // In production, use a proper statistical library
    if (degreesOfFreedom >= 30) {
      // Use normal distribution approximation for large df
      if (alpha <= 0.025) return 1.96; // 95% CI
      if (alpha <= 0.05) return 1.645;  // 90% CI
      return 1.282; // 80% CI
    }
    
    // Rough approximation for smaller df
    return 2.0 + (30 - degreesOfFreedom) * 0.1;
  }

  private calculateTrend(metrics: MathematicalMetric[]): {
    direction: 'improving' | 'stable' | 'degrading';
    slope: number;
    correlation: number;
  } {
    if (metrics.length < 5) {
      return { direction: 'stable', slope: 0, correlation: 0 };
    }

    // Simple linear regression
    const n = metrics.length;
    const x = metrics.map((_, i) => i); // Time index
    const y = metrics.map(m => m.value);
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    let direction: 'improving' | 'stable' | 'degrading';
    if (Math.abs(slope) < 0.1) {
      direction = 'stable';
    } else if (slope < 0) {
      direction = 'improving'; // Lower execution time is better
    } else {
      direction = 'degrading';
    }
    
    return { direction, slope, correlation };
  }

  private performMannWhitneyTest(baseline: number[], current: number[]): RegressionTest {
    // Simplified Mann-Whitney U test
    const n1 = baseline.length;
    const n2 = current.length;
    
    // Combine and rank all values
    const combined = [...baseline.map(v => ({ value: v, group: 1 })), 
                      ...current.map(v => ({ value: v, group: 2 }))];
    combined.sort((a, b) => a.value - b.value);
    
    // Assign ranks
    let rank1Sum = 0;
    combined.forEach((item, index) => {
      if (item.group === 1) {
        rank1Sum += index + 1;
      }
    });
    
    const u1 = rank1Sum - (n1 * (n1 + 1)) / 2;
    const u2 = n1 * n2 - u1;
    const u = Math.min(u1, u2);
    
    // Calculate z-score for large samples
    const meanU = (n1 * n2) / 2;
    const stdU = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
    const z = (u - meanU) / stdU;
    
    // Approximate p-value
    const pValue = 2 * (1 - this.normalCDF(Math.abs(z)));
    const isSignificant = pValue < 0.05;
    
    // Effect size (rank-biserial correlation)
    const effectSize = 1 - (2 * u) / (n1 * n2);
    
    return {
      testType: 'mann_whitney',
      pValue,
      effectSize,
      confidenceLevel: 0.95,
      criticalValue: 1.96,
      isSignificant,
      recommendation: this.generateRecommendation('mann_whitney', isSignificant, effectSize)
    };
  }

  private performWelchTTest(baseline: number[], current: number[]): RegressionTest {
    const n1 = baseline.length;
    const n2 = current.length;
    
    const mean1 = baseline.reduce((sum, val) => sum + val, 0) / n1;
    const mean2 = current.reduce((sum, val) => sum + val, 0) / n2;
    
    const var1 = baseline.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (n1 - 1);
    const var2 = current.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (n2 - 1);
    
    const se = Math.sqrt(var1/n1 + var2/n2);
    const t = (mean2 - mean1) / se;
    
    // Degrees of freedom (Welch-Satterthwaite equation)
    const df = Math.pow(var1/n1 + var2/n2, 2) / 
               (Math.pow(var1/n1, 2)/(n1-1) + Math.pow(var2/n2, 2)/(n2-1));
    
    // Approximate p-value
    const pValue = 2 * (1 - this.tCDF(Math.abs(t), df));
    const isSignificant = pValue < 0.05;
    
    // Cohen's d effect size
    const pooledStd = Math.sqrt(((n1-1)*var1 + (n2-1)*var2) / (n1+n2-2));
    const effectSize = (mean2 - mean1) / pooledStd;
    
    return {
      testType: 'welch_t_test',
      pValue,
      effectSize,
      confidenceLevel: 0.95,
      criticalValue: 1.96,
      isSignificant,
      recommendation: this.generateRecommendation('welch_t_test', isSignificant, effectSize)
    };
  }

  private performKolmogorovSmirnovTest(baseline: number[], current: number[]): RegressionTest {
    // Simplified KS test implementation
    const sorted1 = [...baseline].sort((a, b) => a - b);
    const sorted2 = [...current].sort((a, b) => a - b);
    
    const n1 = sorted1.length;
    const n2 = sorted2.length;
    
    // Calculate empirical CDFs and find maximum difference
    let maxDiff = 0;
    const allValues = [...new Set([...sorted1, ...sorted2])].sort((a, b) => a - b);
    
    for (const value of allValues) {
      const cdf1 = sorted1.filter(x => x <= value).length / n1;
      const cdf2 = sorted2.filter(x => x <= value).length / n2;
      maxDiff = Math.max(maxDiff, Math.abs(cdf1 - cdf2));
    }
    
    // Calculate critical value and p-value
    const criticalValue = 1.36 * Math.sqrt((n1 + n2) / (n1 * n2));
    const isSignificant = maxDiff > criticalValue;
    
    // Approximate p-value
    const pValue = isSignificant ? 0.02 : 0.8;
    
    return {
      testType: 'kolmogorov_smirnov',
      pValue,
      effectSize: maxDiff,
      confidenceLevel: 0.95,
      criticalValue,
      isSignificant,
      recommendation: this.generateRecommendation('kolmogorov_smirnov', isSignificant, maxDiff)
    };
  }

  private performBootstrapTest(baseline: number[], current: number[]): RegressionTest {
    const nBootstrap = 1000;
    const meanDiffs: number[] = [];
    
    const baseMean = baseline.reduce((sum, val) => sum + val, 0) / baseline.length;
    const currentMean = current.reduce((sum, val) => sum + val, 0) / current.length;
    const observedDiff = currentMean - baseMean;
    
    // Bootstrap resampling
    for (let i = 0; i < nBootstrap; i++) {
      const bootBaseline = this.bootstrapSample(baseline);
      const bootCurrent = this.bootstrapSample(current);
      
      const bootBaseMean = bootBaseline.reduce((sum, val) => sum + val, 0) / bootBaseline.length;
      const bootCurrentMean = bootCurrent.reduce((sum, val) => sum + val, 0) / bootCurrent.length;
      
      meanDiffs.push(bootCurrentMean - bootBaseMean);
    }
    
    // Calculate p-value
    const extremeCount = meanDiffs.filter(diff => Math.abs(diff) >= Math.abs(observedDiff)).length;
    const pValue = extremeCount / nBootstrap;
    const isSignificant = pValue < 0.05;
    
    return {
      testType: 'bootstrap',
      pValue,
      effectSize: Math.abs(observedDiff),
      confidenceLevel: 0.95,
      criticalValue: 0.05,
      isSignificant,
      recommendation: this.generateRecommendation('bootstrap', isSignificant, Math.abs(observedDiff))
    };
  }

  private bootstrapSample(data: number[]): number[] {
    const sample: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const randomIndex = Math.floor(Math.random() * data.length);
      sample.push(data[randomIndex]);
    }
    return sample;
  }

  private normalCDF(z: number): number {
    // Approximation of normal CDF
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - prob : prob;
  }

  private tCDF(t: number, df: number): number {
    // Very simplified t-distribution CDF
    // In production, use a proper statistical library
    if (df >= 30) {
      return this.normalCDF(t);
    }
    
    // Rough approximation
    const z = t / Math.sqrt(1 + t*t/df);
    return this.normalCDF(z);
  }

  private selectOptimalTest(
    baseline: number[], 
    current: number[], 
    baselineStats: PerformanceBaseline
  ): 'mann_whitney' | 'kolmogorov_smirnov' | 'welch_t_test' | 'bootstrap' {
    // Decision tree for test selection
    if (baselineStats.normalityTest.isNormal && current.length >= 30) {
      return 'welch_t_test'; // Parametric test for normal data
    }
    
    if (baseline.length >= 20 && current.length >= 20) {
      return 'mann_whitney'; // Non-parametric test for larger samples
    }
    
    if (baseline.length < 10 || current.length < 10) {
      return 'bootstrap'; // Robust for small samples
    }
    
    return 'kolmogorov_smirnov'; // Distribution comparison
  }

  private generateRecommendation(testType: string, isSignificant: boolean, effectSize: number): string {
    if (!isSignificant) {
      return 'No significant performance change detected. Continue monitoring.';
    }
    
    if (effectSize < 0.2) {
      return 'Small performance change detected. Monitor closely for trends.';
    } else if (effectSize < 0.5) {
      return 'Medium performance change detected. Consider investigation.';
    } else {
      return 'Large performance change detected. Immediate investigation recommended.';
    }
  }

  private performTrendAnalysis(dataPoints: Array<{ timestamp: number; value: number; environment: string }>) {
    // Implement trend analysis logic
    const values = dataPoints.map(dp => dp.value);
    const times = dataPoints.map(dp => dp.timestamp);
    
    // Linear regression for trend
    const n = values.length;
    const sumX = times.reduce((sum, val) => sum + val, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = times.reduce((sum, val, i) => sum + val * values[i], 0);
    const sumXX = times.reduce((sum, val) => sum + val * val, 0);
    const sumYY = values.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const rSquared = Math.pow((n * sumXY - sumX * sumY), 2) / 
                     ((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    let direction: 'improving' | 'stable' | 'degrading';
    if (Math.abs(slope) < 0.01) {
      direction = 'stable';
    } else if (slope < 0) {
      direction = 'improving';
    } else {
      direction = 'degrading';
    }
    
    return {
      direction,
      slope,
      rSquared,
      seasonality: false, // Simplified - would need more sophisticated analysis
      changePoints: [] // Simplified - would need change point detection algorithm
    };
  }

  private generateForecast(dataPoints: Array<{ timestamp: number; value: number; environment: string }>) {
    // Simple linear extrapolation
    const trend = this.performTrendAnalysis(dataPoints);
    const lastValue = dataPoints[dataPoints.length - 1].value;
    const lastTime = dataPoints[dataPoints.length - 1].timestamp;
    
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    
    const weekPrediction = lastValue + trend.slope * oneWeek;
    const monthPrediction = lastValue + trend.slope * oneMonth;
    
    // Simple confidence intervals (in production, use proper forecasting methods)
    const std = Math.sqrt(dataPoints.reduce((sum, dp) => 
      sum + Math.pow(dp.value - lastValue, 2), 0) / dataPoints.length);
    
    return {
      nextWeek: {
        mean: weekPrediction,
        confidence: [weekPrediction - 1.96 * std, weekPrediction + 1.96 * std] as [number, number]
      },
      nextMonth: {
        mean: monthPrediction,
        confidence: [monthPrediction - 1.96 * std, monthPrediction + 1.96 * std] as [number, number]
      }
    };
  }

  // Utility methods
  private getMeasurements(operation: string, environment: string): MathematicalMetric[] {
    const key = `${operation}_${environment}`;
    return this.measurements.get(key) || [];
  }

  private detectPlatform(): string {
    if (typeof window !== 'undefined') return 'browser';
    if (typeof process !== 'undefined') return 'node';
    return 'unknown';
  }

  private getNodeVersion(): string | undefined {
    return typeof process !== 'undefined' ? process.version : undefined;
  }

  private getBrowserVersion(): string | undefined {
    if (typeof navigator !== 'undefined') {
      return navigator.userAgent;
    }
    return undefined;
  }

  private getInputSizeRange(metrics: MathematicalMetric[]): [number, number] {
    const sizes = metrics
      .map(m => m.mathematicalContext.inputSize)
      .filter(size => size !== undefined) as number[];
    
    if (sizes.length === 0) return [0, 0];
    return [Math.min(...sizes), Math.max(...sizes)];
  }

  private getComplexityClass(metrics: MathematicalMetric[]): string {
    const complexities = metrics.map(m => m.mathematicalContext.complexity);
    const mostCommon = complexities.reduce((acc, complexity) => {
      acc[complexity] = (acc[complexity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(mostCommon)
      .reduce((a, b) => b[1] > a[1] ? b : a)[0];
  }

  private cleanupOldMeasurements(operation: string, environment: string): void {
    const key = `${operation}_${environment}`;
    const measurements = this.measurements.get(key);
    
    if (!measurements) return;
    
    const cutoffTime = Date.now() - (this.config.retentionPeriodDays * 24 * 60 * 60 * 1000);
    const filtered = measurements.filter(m => m.timestamp >= cutoffTime);
    
    this.measurements.set(key, filtered);
  }

  // Public API methods
  addMeasurement(metric: MathematicalMetric): void {
    const key = `${metric.mathematicalContext.operation}_${metric.metadata?.environment || 'default'}`;
    const existing = this.measurements.get(key) || [];
    existing.push(metric);
    this.measurements.set(key, existing);
  }

  getBaseline(operation: string, environment: string): PerformanceBaseline | undefined {
    return this.baselines.get(`${operation}_${environment}`);
  }

  getAllBaselines(): Map<string, PerformanceBaseline> {
    return new Map(this.baselines);
  }

  updateConfiguration(newConfig: Partial<BaselineConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
  }

  exportData(): {
    baselines: Record<string, PerformanceBaseline>;
    config: BaselineConfiguration;
    measurementSummary: Record<string, number>;
  } {
    return {
      baselines: Object.fromEntries(this.baselines),
      config: this.config,
      measurementSummary: Object.fromEntries(
        Array.from(this.measurements.entries()).map(([key, measurements]) => [
          key, 
          measurements.length
        ])
      )
    };
  }

  reset(): void {
    this.baselines.clear();
    this.measurements.clear();
  }
}

// Export singleton instance
export const performanceBaselineManager = new PerformanceBaselineManager();