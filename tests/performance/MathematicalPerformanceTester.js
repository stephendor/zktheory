/* eslint-env node, jest */
/* global require, module, __dirname, process, console */
/**
 * Performance Testing Framework for Mathematical Computations
 * Implements comprehensive benchmarking and regression detection
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class MathematicalPerformanceTester {
    constructor() {
        this.results = [];
        this.baselines = new Map();
        this.thresholds = {
            performanceMs: 100,
            memoryMB: 50,
            regressionThreshold: 0.2, // 20% performance degradation threshold
            // Memory regression stability controls
            memoryNoiseFloorMB: 1, // Ignore regressions below this noise floor
            memoryRegressionAbsoluteMB: 5, // Also flag if absolute increase exceeds this
            // Duration regression stability controls
            durationNoiseFloorMs: 10, // Ignore relative changes when baseline below this
            durationRegressionAbsoluteMs: 20 // Also flag if absolute increase exceeds this
        };
        this.baselineFile = path.join(__dirname, '../../performance-data/baselines.json');
        this.loadBaselines();
    }

    /**
     * Load performance baselines from disk
     */
    loadBaselines() {
        try {
            if (fs.existsSync(this.baselineFile)) {
                const data = fs.readFileSync(this.baselineFile, 'utf8');
                const baselines = JSON.parse(data);
                this.baselines = new Map(Object.entries(baselines));
                console.log(`📊 Loaded ${this.baselines.size} performance baselines`);
            }
        } catch (error) {
            console.warn('⚠️ Could not load performance baselines:', error.message);
        }
    }

    /**
     * Save performance baselines to disk
     */
    saveBaselines() {
        try {
            const baselineDir = path.dirname(this.baselineFile);
            if (!fs.existsSync(baselineDir)) {
                fs.mkdirSync(baselineDir, { recursive: true });
            }

            const data = JSON.stringify(Object.fromEntries(this.baselines), null, 2);
            fs.writeFileSync(this.baselineFile, data);
            console.log(`💾 Saved ${this.baselines.size} performance baselines`);
        } catch (error) {
            console.error('❌ Could not save performance baselines:', error.message);
        }
    }

    /**
     * Measure memory usage before and after a function
     */
    measureMemory() {
        const used = process.memoryUsage();
        return {
            rss: used.rss,
            heapTotal: used.heapTotal,
            heapUsed: used.heapUsed,
            external: used.external,
            arrayBuffers: used.arrayBuffers
        };
    }

    /**
     * Calculate memory delta between two measurements
     */
    calculateMemoryDelta(before, after) {
        return {
            rss: after.rss - before.rss,
            heapTotal: after.heapTotal - before.heapTotal,
            heapUsed: after.heapUsed - before.heapUsed,
            external: after.external - before.external,
            arrayBuffers: after.arrayBuffers - before.arrayBuffers
        };
    }

    /**
     * Benchmark a mathematical function with performance and memory tracking
     */
    async benchmark(name, testFunction, iterations = 1000) {
        console.log(`🧮 Benchmarking ${name}...`);

        const results = {
            name,
            iterations,
            startTime: new Date().toISOString(),
            measurements: []
        };

        // Warmup iterations
        const warmupIterations = Math.min(10, iterations);
        for (let i = 0; i < warmupIterations; i++) {
            await testFunction();
        }

        // Main benchmark iterations
        for (let i = 0; i < iterations; i++) {
            const memoryBefore = this.measureMemory();
            const startTime = performance.now();

            const result = await testFunction();

            const endTime = performance.now();
            const memoryAfter = this.measureMemory();

            const measurement = {
                iteration: i,
                duration: endTime - startTime,
                memoryDelta: this.calculateMemoryDelta(memoryBefore, memoryAfter),
                result: result // Store result for accuracy validation
            };

            results.measurements.push(measurement);
        }

        // Calculate statistics
        const durations = results.measurements.map((m) => m.duration);
        const memoryUsages = results.measurements.map((m) => m.memoryDelta.heapUsed);

        results.statistics = {
            duration: {
                min: Math.min(...durations),
                max: Math.max(...durations),
                mean: durations.reduce((a, b) => a + b, 0) / durations.length,
                median: this.calculateMedian(durations),
                p95: this.calculatePercentile(durations, 95),
                p99: this.calculatePercentile(durations, 99)
            },
            memory: {
                min: Math.min(...memoryUsages),
                max: Math.max(...memoryUsages),
                mean: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
                median: this.calculateMedian(memoryUsages)
            }
        };

        this.results.push(results);
        return results;
    }

    /**
     * Calculate median of an array
     */
    calculateMedian(arr) {
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    /**
     * Calculate percentile of an array
     */
    calculatePercentile(arr, percentile) {
        const sorted = [...arr].sort((a, b) => a - b);
        const index = (percentile / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);

        if (lower === upper) {
            return sorted[lower];
        }

        return sorted[lower] * (upper - index) + sorted[upper] * (index - lower);
    }

    /**
     * Check for performance regressions against baselines
     */
    checkForRegressions(results) {
        const regressions = [];

        for (const result of results) {
            const baseline = this.baselines.get(result.name);
            if (!baseline) {
                console.log(`📊 No baseline found for ${result.name}, establishing new baseline`);
                this.baselines.set(result.name, {
                    duration: result.statistics.duration,
                    memory: result.statistics.memory,
                    timestamp: new Date().toISOString()
                });
                continue;
            }

            // Check for duration regression with noise floor and absolute threshold
            const currentMs = result.statistics.duration.mean;
            const baselineMs = baseline.duration.mean || 0;
            const deltaMs = currentMs - baselineMs;
            const relativeDur = baselineMs > 0 ? deltaMs / baselineMs : 0;
            const aboveNoise = baselineMs >= this.thresholds.durationNoiseFloorMs;
            const isAbsSpike = deltaMs > this.thresholds.durationRegressionAbsoluteMs;
            const isRelSpike = aboveNoise && relativeDur > this.thresholds.regressionThreshold;
            if (isAbsSpike || isRelSpike) {
                regressions.push({
                    name: result.name,
                    type: 'duration',
                    regression: relativeDur || 0,
                    currentMs,
                    baselineMs,
                    deltaMs,
                    thresholds: {
                        relative: this.thresholds.regressionThreshold,
                        noiseFloorMs: this.thresholds.durationNoiseFloorMs,
                        absoluteMs: this.thresholds.durationRegressionAbsoluteMs
                    }
                });
            }

            // Check for memory regression with noise floor and absolute threshold (values in MB)
            const toMB = (bytes) => Math.abs(bytes) / (1024 * 1024);
            const baselineMB = toMB(baseline.memory.mean || 0);
            const currentMB = toMB(result.statistics.memory.mean || 0);
            const deltaMB = currentMB - baselineMB;

            // Ignore tiny fluctuations below noise floor on both baseline and current
            if (!(baselineMB < this.thresholds.memoryNoiseFloorMB && currentMB < this.thresholds.memoryNoiseFloorMB)) {
                const relative = baselineMB > 0 ? deltaMB / baselineMB : 0;
                const isAbsoluteSpike = deltaMB > this.thresholds.memoryRegressionAbsoluteMB;
                const isRelativeSpike = baselineMB >= this.thresholds.memoryNoiseFloorMB && relative > this.thresholds.regressionThreshold;

                if (isAbsoluteSpike || isRelativeSpike) {
                    regressions.push({
                        name: result.name,
                        type: 'memory',
                        regression: relative || 0,
                        currentMB,
                        baselineMB,
                        deltaMB,
                        thresholds: {
                            relative: this.thresholds.regressionThreshold,
                            noiseFloorMB: this.thresholds.memoryNoiseFloorMB,
                            absoluteMB: this.thresholds.memoryRegressionAbsoluteMB
                        }
                    });
                }
            }
        }

        return regressions;
    }

    /**
     * Generate comprehensive performance report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            thresholds: this.thresholds,
            totalTests: this.results.length,
            summary: {
                passed: 0,
                failed: 0,
                regressions: []
            },
            results: this.results
        };

        // Check results against thresholds and regressions
        const regressions = this.checkForRegressions(this.results);
        report.summary.regressions = regressions;

        for (const result of this.results) {
            const duration = result.statistics.duration.mean;
            const memory = Math.abs(result.statistics.memory.mean) / (1024 * 1024); // Convert to MB

            if (duration <= this.thresholds.performanceMs && memory <= this.thresholds.memoryMB) {
                report.summary.passed++;
            } else {
                report.summary.failed++;
            }
        }

        return report;
    }

    /**
     * Save performance report to file
     */
    saveReport(report, filename = 'performance-report.json') {
        const reportPath = path.join(__dirname, '../../performance-data', filename);
        const reportDir = path.dirname(reportPath);

        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        // Ensure JSON serialization handles BigInt values in results
        const replacer = (_key, value) => (typeof value === 'bigint' ? value.toString() : value);
        fs.writeFileSync(reportPath, JSON.stringify(report, replacer, 2));
        console.log(`📄 Performance report saved to ${reportPath}`);

        return reportPath;
    }
}

module.exports = { MathematicalPerformanceTester };
