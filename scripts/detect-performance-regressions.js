#!/usr/bin/env node

/**
 * Performance Regression Detection Script
 * Analyzes performance metrics and detects regressions against baselines
 */

const fs = require('fs');
const path = require('path');

class PerformanceRegressionDetector {
    constructor() {
        this.performanceDataDir = path.join(__dirname, '../performance-data');
        this.thresholds = {
            warningThreshold: 0.1, // 10% performance degradation warning
            criticalThreshold: 0.2, // 20% performance degradation critical
            memoryThreshold: 0.15, // 15% memory usage increase threshold
            significanceLevel: 0.05 // Statistical significance level
        };
        this.baselineFile = path.join(this.performanceDataDir, 'baselines.json');
        this.reportFile = path.join(this.performanceDataDir, 'regression-report.json');
    }

    /**
     * Load performance baselines
     */
    loadBaselines() {
        try {
            if (fs.existsSync(this.baselineFile)) {
                const data = fs.readFileSync(this.baselineFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.warn('⚠️ Could not load performance baselines:', error.message);
        }
        return {};
    }

    /**
     * Load current performance results
     */
    loadCurrentResults() {
        const results = [];
        const performanceFiles = ['performance-report.json', 'wasm-performance-report.json', 'test-summary.json'];

        for (const filename of performanceFiles) {
            const filePath = path.join(this.performanceDataDir, filename);
            try {
                if (fs.existsSync(filePath)) {
                    const data = fs.readFileSync(filePath, 'utf8');
                    const parsed = JSON.parse(data);
                    results.push({ source: filename, data: parsed });
                }
            } catch (error) {
                console.warn(`⚠️ Could not load ${filename}:`, error.message);
            }
        }

        return results;
    }

    /**
     * Calculate statistical significance using t-test approximation
     */
    calculateTTestSignificance(baseline, current) {
        if (!baseline.measurements || !current.measurements) {
            return { significant: false, pValue: 1.0 };
        }

        const n1 = baseline.measurements.length;
        const n2 = current.measurements.length;

        if (n1 < 2 || n2 < 2) {
            return { significant: false, pValue: 1.0 };
        }

        const mean1 = baseline.mean || baseline.measurements.reduce((a, b) => a + b, 0) / n1;
        const mean2 = current.mean || current.measurements.reduce((a, b) => a + b, 0) / n2;

        // Simplified variance calculation
        const var1 = baseline.measurements.reduce((sum, x) => sum + Math.pow(x - mean1, 2), 0) / (n1 - 1);
        const var2 = current.measurements.reduce((sum, x) => sum + Math.pow(x - mean2, 2), 0) / (n2 - 1);

        // Welch's t-test approximation
        const pooledVar = var1 / n1 + var2 / n2;
        const tStat = Math.abs(mean2 - mean1) / Math.sqrt(pooledVar);

        // Simplified p-value approximation (assuming normal distribution)
        const pValue = 2 * (1 - this.approximateNormalCDF(tStat));

        return {
            significant: pValue < this.thresholds.significanceLevel,
            pValue: pValue,
            tStat: tStat,
            meanDifference: mean2 - mean1,
            relativeDifference: (mean2 - mean1) / mean1
        };
    }

    /**
     * Approximate normal CDF for p-value calculation
     */
    approximateNormalCDF(z) {
        // Approximation using error function
        const sign = z >= 0 ? 1 : -1;
        z = Math.abs(z);

        const a1 = 0.254829592;
        const a2 = -0.284496736;
        const a3 = 1.421413741;
        const a4 = -1.453152027;
        const a5 = 1.061405429;
        const p = 0.3275911;

        const t = 1.0 / (1.0 + p * z);
        const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

        return 0.5 * (1.0 + sign * y);
    }

    /**
     * Detect performance regressions
     */
    detectRegressions() {
        console.log('🔍 Starting performance regression detection...');

        const baselines = this.loadBaselines();
        const currentResults = this.loadCurrentResults();

        const regressions = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            commit: process.env.GITHUB_SHA || 'unknown',
            branch: process.env.GITHUB_REF_NAME || 'unknown',
            summary: {
                totalTests: 0,
                warnings: 0,
                critical: 0,
                improvements: 0
            },
            regressions: [],
            improvements: [],
            newBaselines: []
        };

        // Analyze each performance result file
        for (const { source, data } of currentResults) {
            console.log(`📊 Analyzing ${source}...`);

            if (data.results) {
                // Handle performance test results format
                for (const result of data.results) {
                    this.analyzeTestResult(result, baselines, regressions, source);
                }
            } else if (data.testResults) {
                // Handle Jest test results format
                for (const testResult of data.testResults) {
                    this.analyzeJestTestResult(testResult, baselines, regressions, source);
                }
            } else if (data.totalDuration !== undefined) {
                // Handle summary format
                this.analyzeSummaryResult(data, baselines, regressions, source);
            }
        }

        // Generate final report
        const severity = this.determineSeverity(regressions);
        regressions.severity = severity;

        console.log('\n📋 Performance Regression Detection Summary:');
        console.log('='.repeat(50));
        console.log(`🔍 Total tests analyzed: ${regressions.summary.totalTests}`);
        console.log(`⚠️  Performance warnings: ${regressions.summary.warnings}`);
        console.log(`🚨 Critical regressions: ${regressions.summary.critical}`);
        console.log(`✨ Performance improvements: ${regressions.summary.improvements}`);
        console.log(`📊 New baselines established: ${regressions.summary.newBaselines || 0}`);

        if (regressions.summary.critical > 0) {
            console.log('\n🚨 CRITICAL PERFORMANCE REGRESSIONS DETECTED:');
            regressions.regressions
                .filter((r) => r.severity === 'critical')
                .forEach((r) => {
                    console.log(`  - ${r.testName}: ${(r.relativeDifference * 100).toFixed(1)}% slower`);
                });
        }

        if (regressions.summary.warnings > 0) {
            console.log('\n⚠️ Performance warnings:');
            regressions.regressions
                .filter((r) => r.severity === 'warning')
                .forEach((r) => {
                    console.log(`  - ${r.testName}: ${(r.relativeDifference * 100).toFixed(1)}% slower`);
                });
        }

        if (regressions.summary.improvements > 0) {
            console.log('\n✨ Performance improvements detected:');
            regressions.improvements.forEach((imp) => {
                console.log(`  - ${imp.testName}: ${Math.abs(imp.relativeDifference * 100).toFixed(1)}% faster`);
            });
        }

        // Save regression report
        this.saveRegressionReport(regressions);

        return regressions;
    }

    /**
     * Analyze individual test result
     */
    analyzeTestResult(result, baselines, regressions, source) {
        const testName = result.name;
        const baseline = baselines[testName];

        regressions.summary.totalTests++;

        if (!baseline) {
            // No baseline exists, establish new one
            console.log(`📊 Establishing new baseline for ${testName}`);
            regressions.newBaselines.push({
                testName,
                source,
                baseline: result.statistics
            });
            regressions.summary.newBaselines = (regressions.summary.newBaselines || 0) + 1;
            return;
        }

        // Compare performance metrics
        const durationAnalysis = this.calculateTTestSignificance(baseline.duration, result.statistics.duration);

        const memoryAnalysis = this.calculateTTestSignificance(baseline.memory, result.statistics.memory);

        // Check for regressions
        if (durationAnalysis.significant) {
            const relativeChange = durationAnalysis.relativeDifference;

            if (relativeChange > this.thresholds.criticalThreshold) {
                // Critical regression
                regressions.regressions.push({
                    testName,
                    source,
                    type: 'duration',
                    severity: 'critical',
                    relativeDifference: relativeChange,
                    absoluteDifference: durationAnalysis.meanDifference,
                    statistical: durationAnalysis,
                    baseline: baseline.duration,
                    current: result.statistics.duration
                });
                regressions.summary.critical++;
            } else if (relativeChange > this.thresholds.warningThreshold) {
                // Warning level regression
                regressions.regressions.push({
                    testName,
                    source,
                    type: 'duration',
                    severity: 'warning',
                    relativeDifference: relativeChange,
                    absoluteDifference: durationAnalysis.meanDifference,
                    statistical: durationAnalysis,
                    baseline: baseline.duration,
                    current: result.statistics.duration
                });
                regressions.summary.warnings++;
            } else if (relativeChange < -this.thresholds.warningThreshold) {
                // Performance improvement
                regressions.improvements.push({
                    testName,
                    source,
                    type: 'duration',
                    relativeDifference: relativeChange,
                    absoluteDifference: durationAnalysis.meanDifference,
                    statistical: durationAnalysis
                });
                regressions.summary.improvements++;
            }
        }

        // Check memory regressions
        if (memoryAnalysis.significant && memoryAnalysis.relativeDifference > this.thresholds.memoryThreshold) {
            regressions.regressions.push({
                testName,
                source,
                type: 'memory',
                severity: 'warning',
                relativeDifference: memoryAnalysis.relativeDifference,
                absoluteDifference: memoryAnalysis.meanDifference,
                statistical: memoryAnalysis,
                baseline: baseline.memory,
                current: result.statistics.memory
            });
            regressions.summary.warnings++;
        }
    }

    /**
     * Analyze Jest test result format
     */
    analyzeJestTestResult(testResult, baselines, regressions, source) {
        // Handle Jest-specific test result format
        regressions.summary.totalTests++;

        if (testResult.duration) {
            const testName = `${source}_${testResult.title}`;
            const baseline = baselines[testName];

            if (!baseline) {
                regressions.newBaselines.push({
                    testName,
                    source,
                    baseline: { duration: testResult.duration }
                });
                return;
            }

            const relativeChange = (testResult.duration - baseline.duration) / baseline.duration;

            if (relativeChange > this.thresholds.criticalThreshold) {
                regressions.regressions.push({
                    testName,
                    source,
                    type: 'duration',
                    severity: 'critical',
                    relativeDifference: relativeChange,
                    absoluteDifference: testResult.duration - baseline.duration,
                    baseline: { duration: baseline.duration },
                    current: { duration: testResult.duration }
                });
                regressions.summary.critical++;
            }
        }
    }

    /**
     * Analyze summary result format
     */
    analyzeSummaryResult(data, baselines, regressions, source) {
        regressions.summary.totalTests++;

        const testName = `${source}_summary`;
        const baseline = baselines[testName];

        if (!baseline) {
            regressions.newBaselines.push({
                testName,
                source,
                baseline: {
                    totalDuration: data.totalDuration,
                    memoryDelta: data.memoryDelta
                }
            });
            return;
        }

        // Check duration regression
        if (data.totalDuration && baseline.totalDuration) {
            const relativeChange = (data.totalDuration - baseline.totalDuration) / baseline.totalDuration;

            if (relativeChange > this.thresholds.warningThreshold) {
                regressions.regressions.push({
                    testName,
                    source,
                    type: 'total_duration',
                    severity: relativeChange > this.thresholds.criticalThreshold ? 'critical' : 'warning',
                    relativeDifference: relativeChange,
                    absoluteDifference: data.totalDuration - baseline.totalDuration,
                    baseline: { totalDuration: baseline.totalDuration },
                    current: { totalDuration: data.totalDuration }
                });

                if (relativeChange > this.thresholds.criticalThreshold) {
                    regressions.summary.critical++;
                } else {
                    regressions.summary.warnings++;
                }
            }
        }
    }

    /**
     * Determine overall severity
     */
    determineSeverity(regressions) {
        if (regressions.summary.critical > 0) {
            return 'critical';
        } else if (regressions.summary.warnings > 0) {
            return 'warning';
        } else {
            return 'pass';
        }
    }

    /**
     * Save regression report
     */
    saveRegressionReport(regressions) {
        try {
            if (!fs.existsSync(this.performanceDataDir)) {
                fs.mkdirSync(this.performanceDataDir, { recursive: true });
            }

            fs.writeFileSync(this.reportFile, JSON.stringify(regressions, null, 2));
            console.log(`📄 Regression report saved to ${this.reportFile}`);
        } catch (error) {
            console.error('❌ Could not save regression report:', error.message);
        }
    }
}

// Run regression detection if called directly
if (require.main === module) {
    const detector = new PerformanceRegressionDetector();
    const regressions = detector.detectRegressions();

    // Exit with appropriate code
    if (regressions.severity === 'critical') {
        console.log('\n💥 Exiting with error due to critical performance regressions');
        process.exit(1);
    } else if (regressions.severity === 'warning') {
        console.log('\n⚠️ Performance warnings detected, but continuing');
        process.exit(0);
    } else {
        console.log('\n✅ No significant performance regressions detected');
        process.exit(0);
    }
}

module.exports = { PerformanceRegressionDetector };
