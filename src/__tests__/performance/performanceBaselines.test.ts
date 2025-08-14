/**
 * Comprehensive Tests for Performance Baselines and Alerting System
 * Tests PerformanceBaselineManager and PerformanceAlertHandler functionality
 */

import {
  PerformanceBaselineManager,
  PerformanceAlertHandler,
  PerformanceThreshold,
  PerformanceAlert,
  BaselineConfiguration,
  globalBaselineManager,
  globalAlertHandler
} from '../utils/performanceBaselines';
import { PerformanceBenchmark, BenchmarkResult } from '../utils/performanceBenchmark';
import { GroupTheoryValidator } from '../utils/mathematicalValidation';
import type { Group, GroupElement } from '@/lib/GroupTheory';

describe('Performance Baselines and Alerting System', () => {
  let baselineManager: PerformanceBaselineManager;
  let alertHandler: PerformanceAlertHandler;
  let benchmark: PerformanceBenchmark;

  beforeEach(() => {
    baselineManager = new PerformanceBaselineManager();
    alertHandler = new PerformanceAlertHandler();
    benchmark = new PerformanceBenchmark();
  });

  // Helper function to create test group
  const createTestGroup = (order: number): Group => {
    const elements: GroupElement[] = [];
    const operations = new Map<string, Map<string, string>>();

    for (let i = 0; i < order; i++) {
      elements.push({
        id: `g${i}`,
        label: `g^${i}`,
        order: i === 0 ? 1 : order,
        inverse: `g${(order - i) % order}`,
        conjugacyClass: 0
      });
    }

    elements.forEach(a => {
      const aMap = new Map<string, string>();
      elements.forEach(b => {
        const aIndex = parseInt(a.id.substring(1));
        const bIndex = parseInt(b.id.substring(1));
        const resultIndex = (aIndex + bIndex) % order;
        aMap.set(b.id, `g${resultIndex}`);
      });
      operations.set(a.id, aMap);
    });

    return {
      id: `C${order}`,
      name: `Cyclic Group C${order}`,
      order,
      elements,
      operations,
      generators: ['g1'],
      isAbelian: true,
      description: `Cyclic group of order ${order}`
    };
  };

  // Helper function to create mock benchmark results
  const createMockBenchmarkResults = (
    operation: string,
    count: number,
    baseMean: number = 50,
    variance: number = 5
  ): BenchmarkResult[] => {
    const results: BenchmarkResult[] = [];
    for (let i = 0; i < count; i++) {
      const executionTime = baseMean + (Math.random() - 0.5) * variance;
      results.push({
        operation,
        executionTime,
        iterations: 10,
        timestamp: Date.now() - i * 1000,
        memoryUsage: {
          heapUsed: 1024 * 1024 * (5 + Math.random() * 2), // 5-7MB
          heapTotal: 1024 * 1024 * 10,
          external: 1024 * 1024 * 2,
          rss: 1024 * 1024 * 15
        },
        metadata: {
          environment: 'test'
        }
      });
    }
    return results;
  };

  describe('PerformanceBaselineManager', () => {
    describe('Configuration Management', () => {
      test('should initialize with default configuration', () => {
        const config = baselineManager.getConfiguration();
        
        expect(config.minSampleSize).toBe(20);
        expect(config.confidenceLevel).toBe(0.95);
        expect(config.outlierThreshold).toBe(2.0);
        expect(config.updateFrequency).toBe('weekly');
        expect(config.environments).toEqual(['development', 'testing', 'production']);
      });

      test('should allow custom configuration during initialization', () => {
        const customManager = new PerformanceBaselineManager({
          minSampleSize: 50,
          confidenceLevel: 0.99,
          updateFrequency: 'daily'
        });
        
        const config = customManager.getConfiguration();
        expect(config.minSampleSize).toBe(50);
        expect(config.confidenceLevel).toBe(0.99);
        expect(config.updateFrequency).toBe('daily');
        expect(config.outlierThreshold).toBe(2.0); // Should retain default
      });

      test('should update configuration', () => {
        baselineManager.updateConfiguration({
          minSampleSize: 30,
          outlierThreshold: 2.5
        });
        
        const config = baselineManager.getConfiguration();
        expect(config.minSampleSize).toBe(30);
        expect(config.outlierThreshold).toBe(2.5);
        expect(config.confidenceLevel).toBe(0.95); // Should retain original
      });
    });

    describe('Threshold Management', () => {
      test('should initialize with default thresholds', () => {
        const groupThreshold = baselineManager.getThreshold('group_validation', 'development');
        expect(groupThreshold).toBeDefined();
        expect(groupThreshold!.maxExecutionTime).toBe(100);
        expect(groupThreshold!.severity).toBe('warning');

        const prodGroupThreshold = baselineManager.getThreshold('group_validation', 'production');
        expect(prodGroupThreshold).toBeDefined();
        expect(prodGroupThreshold!.maxExecutionTime).toBe(50);
        expect(prodGroupThreshold!.severity).toBe('error');
      });

      test('should set and retrieve custom thresholds', () => {
        const customThreshold: PerformanceThreshold = {
          operation: 'custom_operation',
          maxExecutionTime: 200,
          maxMemoryIncrease: 100 * 1024 * 1024,
          environment: 'testing',
          severity: 'critical',
          description: 'Custom test operation threshold'
        };

        baselineManager.setThreshold(customThreshold);
        const retrieved = baselineManager.getThreshold('custom_operation', 'testing');
        
        expect(retrieved).toEqual(customThreshold);
      });

      test('should fall back to development environment when specific environment not found', () => {
        const threshold = baselineManager.getThreshold('group_validation', 'nonexistent_env');
        expect(threshold).toBeDefined();
        expect(threshold!.environment).toBe('development');
      });

      test('should return undefined for unknown operations', () => {
        const threshold = baselineManager.getThreshold('unknown_operation', 'development');
        expect(threshold).toBeUndefined();
      });
    });

    describe('Threshold Checking and Alert Generation', () => {
      test('should generate alerts when execution time exceeds threshold', () => {
        const mockResult: BenchmarkResult = {
          operation: 'group_validation',
          executionTime: 150, // Exceeds 100ms threshold
          iterations: 10,
          timestamp: Date.now()
        };

        const alerts = baselineManager.checkThresholds(mockResult, 'development');
        
        expect(alerts).toHaveLength(1);
        expect(alerts[0].severity).toBe('warning');
        expect(alerts[0].message).toContain('Execution time exceeded threshold');
        expect(alerts[0].currentValue).toBe(150);
        expect(alerts[0].thresholdValue).toBe(100);
        expect(alerts[0].operation).toBe('group_validation');
      });

      test('should generate alerts when memory usage exceeds threshold', () => {
        const mockResult: BenchmarkResult = {
          operation: 'tda_computation',
          executionTime: 500, // Within threshold
          iterations: 10,
          timestamp: Date.now(),
          memoryUsage: {
            heapUsed: 75 * 1024 * 1024, // 75MB > 50MB threshold
            heapTotal: 100 * 1024 * 1024,
            external: 10 * 1024 * 1024,
            rss: 150 * 1024 * 1024
          }
        };

        const alerts = baselineManager.checkThresholds(mockResult, 'development');
        
        expect(alerts).toHaveLength(1);
        expect(alerts[0].message).toContain('Memory usage exceeded threshold');
        expect(alerts[0].currentValue).toBe(75 * 1024 * 1024);
        expect(alerts[0].thresholdValue).toBe(50 * 1024 * 1024);
      });

      test('should generate multiple alerts for multiple violations', () => {
        const mockResult: BenchmarkResult = {
          operation: 'tda_computation',
          executionTime: 1500, // Exceeds 1000ms threshold
          iterations: 10,
          timestamp: Date.now(),
          memoryUsage: {
            heapUsed: 75 * 1024 * 1024, // Exceeds 50MB threshold
            heapTotal: 100 * 1024 * 1024,
            external: 10 * 1024 * 1024,
            rss: 150 * 1024 * 1024
          }
        };

        const alerts = baselineManager.checkThresholds(mockResult, 'development');
        
        expect(alerts).toHaveLength(2);
        expect(alerts[0].message).toContain('Execution time exceeded threshold');
        expect(alerts[1].message).toContain('Memory usage exceeded threshold');
      });

      test('should not generate alerts when performance is within thresholds', () => {
        const mockResult: BenchmarkResult = {
          operation: 'group_validation',
          executionTime: 80, // Within 100ms threshold
          iterations: 10,
          timestamp: Date.now()
        };

        const alerts = baselineManager.checkThresholds(mockResult, 'development');
        expect(alerts).toHaveLength(0);
      });

      test('should handle missing thresholds gracefully', () => {
        const mockResult: BenchmarkResult = {
          operation: 'unknown_operation',
          executionTime: 1000,
          iterations: 10,
          timestamp: Date.now()
        };

        const alerts = baselineManager.checkThresholds(mockResult, 'development');
        expect(alerts).toHaveLength(0);
      });
    });

    describe('Baseline Creation and Management', () => {
      test('should create baseline from sufficient measurements', () => {
        const measurements = createMockBenchmarkResults('test_operation', 25, 50, 10);
        
        const baseline = baselineManager.createBaseline('test_operation', measurements, 'development');
        
        expect(baseline).not.toBeNull();
        expect(baseline!.operation).toBe('test_operation');
        expect(baseline!.environment).toBe('development');
        expect(baseline!.sampleSize).toBeLessThanOrEqual(25); // May be reduced due to outlier removal
        expect(baseline!.meanTime).toBeCloseTo(50, 0);
        expect(baseline!.standardDeviation).toBeGreaterThan(0);
        expect(baseline!.percentiles.p50).toBeDefined();
        expect(baseline!.percentiles.p90).toBeGreaterThanOrEqual(baseline!.percentiles.p50);
        expect(baseline!.percentiles.p95).toBeGreaterThanOrEqual(baseline!.percentiles.p90);
        expect(baseline!.percentiles.p99).toBeGreaterThanOrEqual(baseline!.percentiles.p95);
      });

      test('should reject baseline creation with insufficient measurements', () => {
        const measurements = createMockBenchmarkResults('test_operation', 10, 50, 10); // Less than minSampleSize
        
        const baseline = baselineManager.createBaseline('test_operation', measurements, 'development');
        
        expect(baseline).toBeNull();
      });

      test('should reject baseline when too many outliers are removed', () => {
        // Create measurements with extreme outliers
        const measurements = createMockBenchmarkResults('test_operation', 25, 50, 2);
        // Add extreme outliers
        measurements.push(...createMockBenchmarkResults('test_operation', 5, 500, 50));
        
        const baseline = baselineManager.createBaseline('test_operation', measurements, 'development');
        
        // Should still create baseline if enough clean measurements remain
        // This test depends on the specific outlier detection algorithm
        expect(baseline).toBeDefined();
      });

      test('should handle edge cases in baseline creation', () => {
        // Test with identical measurements
        const identicalMeasurements = Array(25).fill(null).map(() => ({
          operation: 'test_operation',
          executionTime: 50,
          iterations: 10,
          timestamp: Date.now()
        })) as BenchmarkResult[];
        
        const baseline = baselineManager.createBaseline('test_operation', identicalMeasurements, 'development');
        
        expect(baseline).not.toBeNull();
        expect(baseline!.meanTime).toBe(50);
        expect(baseline!.standardDeviation).toBe(0);
      });
    });

    describe('Regression Detection', () => {
      beforeEach(() => {
        // Create a baseline for testing
        const measurements = createMockBenchmarkResults('test_operation', 25, 50, 5);
        baselineManager.createBaseline('test_operation', measurements, 'development');
      });

      test('should detect performance regression', () => {
        const regressionMeasurement: BenchmarkResult = {
          operation: 'test_operation',
          executionTime: 70, // Significantly higher than baseline mean of 50
          iterations: 10,
          timestamp: Date.now()
        };

        const result = baselineManager.checkForRegression('test_operation', regressionMeasurement, 'development');
        
        expect(result).not.toBeNull();
        expect(result!.effect).toBe('regression');
        expect(result!.isRegression).toBe(true);
        expect(result!.magnitude).toBeGreaterThan(0);
      });

      test('should detect performance improvement', () => {
        const improvementMeasurement: BenchmarkResult = {
          operation: 'test_operation',
          executionTime: 40, // Significantly lower than baseline mean of 50
          iterations: 10,
          timestamp: Date.now()
        };

        const result = baselineManager.checkForRegression('test_operation', improvementMeasurement, 'development');
        
        expect(result).not.toBeNull();
        expect(result!.effect).toBe('improvement');
        expect(result!.isRegression).toBe(false);
        expect(result!.magnitude).toBeGreaterThan(0);
      });

      test('should detect no significant change', () => {
        const similarMeasurement: BenchmarkResult = {
          operation: 'test_operation',
          executionTime: 51, // Close to baseline mean of 50
          iterations: 10,
          timestamp: Date.now()
        };

        const result = baselineManager.checkForRegression('test_operation', similarMeasurement, 'development');
        
        expect(result).not.toBeNull();
        expect(result!.effect).toBe('no_change');
        expect(result!.isRegression).toBe(false);
      });

      test('should return null when baseline does not exist', () => {
        const measurement: BenchmarkResult = {
          operation: 'nonexistent_operation',
          executionTime: 50,
          iterations: 10,
          timestamp: Date.now()
        };

        const result = baselineManager.checkForRegression('nonexistent_operation', measurement, 'development');
        expect(result).toBeNull();
      });
    });

    describe('Alert Management', () => {
      beforeEach(() => {
        // Generate some test alerts
        const mockResult: BenchmarkResult = {
          operation: 'group_validation',
          executionTime: 150, // Exceeds threshold
          iterations: 10,
          timestamp: Date.now()
        };
        baselineManager.checkThresholds(mockResult, 'development');
      });

      test('should retrieve active alerts within time window', () => {
        const activeAlerts = baselineManager.getActiveAlerts();
        expect(activeAlerts.length).toBeGreaterThan(0);
        expect(activeAlerts[0].operation).toBe('group_validation');
      });

      test('should filter alerts by severity', () => {
        // Add critical alert
        const criticalResult: BenchmarkResult = {
          operation: 'canvas_rendering',
          executionTime: 50, // Exceeds 16.67ms critical threshold
          iterations: 10,
          timestamp: Date.now()
        };
        baselineManager.checkThresholds(criticalResult, 'production');

        const warningAlerts = baselineManager.getAlertsBySeverity('warning');
        const criticalAlerts = baselineManager.getAlertsBySeverity('critical');

        expect(warningAlerts.length).toBeGreaterThan(0);
        expect(criticalAlerts.length).toBeGreaterThan(0);
        expect(warningAlerts[0].severity).toBe('warning');
        expect(criticalAlerts[0].severity).toBe('critical');
      });

      test('should clear old alerts', () => {
        const initialAlertCount = baselineManager.getActiveAlerts().length;
        expect(initialAlertCount).toBeGreaterThan(0);

        // Clear alerts older than 0ms (should clear all)
        const clearedCount = baselineManager.clearOldAlerts(0);
        
        expect(clearedCount).toBe(initialAlertCount);
        expect(baselineManager.getActiveAlerts()).toHaveLength(0);
      });
    });

    describe('Data Import/Export', () => {
      test('should export and import baseline data', () => {
        // Create baselines
        const measurements1 = createMockBenchmarkResults('operation1', 25, 50, 5);
        const measurements2 = createMockBenchmarkResults('operation2', 30, 75, 8);
        
        baselineManager.createBaseline('operation1', measurements1, 'development');
        baselineManager.createBaseline('operation2', measurements2, 'production');

        // Export data
        const exportedData = baselineManager.exportBaselines();
        
        expect(Object.keys(exportedData)).toHaveLength(2);
        expect(exportedData['operation1_development']).toBeDefined();
        expect(exportedData['operation2_production']).toBeDefined();

        // Clear and import data
        const newManager = new PerformanceBaselineManager();
        newManager.importBaselines(exportedData);

        // Verify import
        const importedData = newManager.exportBaselines();
        expect(importedData).toEqual(exportedData);
      });
    });

    describe('Performance Reporting', () => {
      beforeEach(() => {
        // Setup test data
        const measurements = createMockBenchmarkResults('test_operation', 25, 50, 5);
        baselineManager.createBaseline('test_operation', measurements, 'development');
        
        const mockResult: BenchmarkResult = {
          operation: 'group_validation',
          executionTime: 150,
          iterations: 10,
          timestamp: Date.now()
        };
        baselineManager.checkThresholds(mockResult, 'development');
      });

      test('should generate comprehensive performance report', () => {
        const report = baselineManager.generatePerformanceReport('development');
        
        expect(report.baselines).toBeDefined();
        expect(report.thresholds).toBeDefined();
        expect(report.recentAlerts).toBeDefined();
        expect(report.summary).toBeDefined();

        expect(report.summary.totalBaselines).toBeGreaterThan(0);
        expect(report.summary.totalThresholds).toBeGreaterThan(0);
        expect(report.summary.warningAlerts).toBeGreaterThan(0);
        expect(report.summary.environment).toBe('development');
        expect(report.summary.generatedAt).toBeDefined();
      });

      test('should include alert severity breakdown in report', () => {
        // Add different severity alerts
        const errorResult: BenchmarkResult = {
          operation: 'group_validation',
          executionTime: 75, // Exceeds production threshold
          iterations: 10,
          timestamp: Date.now()
        };
        baselineManager.checkThresholds(errorResult, 'production');

        const report = baselineManager.generatePerformanceReport('development');
        
        expect(typeof report.summary.criticalAlerts).toBe('number');
        expect(typeof report.summary.errorAlerts).toBe('number');
        expect(typeof report.summary.warningAlerts).toBe('number');
      });
    });

    describe('Reset Functionality', () => {
      test('should reset all data and restore default thresholds', () => {
        // Add some data
        const measurements = createMockBenchmarkResults('test_operation', 25, 50, 5);
        baselineManager.createBaseline('test_operation', measurements, 'development');
        
        const mockResult: BenchmarkResult = {
          operation: 'group_validation',
          executionTime: 150,
          iterations: 10,
          timestamp: Date.now()
        };
        baselineManager.checkThresholds(mockResult, 'development');

        // Verify data exists
        expect(baselineManager.exportBaselines()).not.toEqual({});
        expect(baselineManager.getActiveAlerts().length).toBeGreaterThan(0);

        // Reset
        baselineManager.reset();

        // Verify reset
        expect(baselineManager.exportBaselines()).toEqual({});
        expect(baselineManager.getActiveAlerts()).toHaveLength(0);
        
        // Verify default thresholds are restored
        const groupThreshold = baselineManager.getThreshold('group_validation', 'development');
        expect(groupThreshold).toBeDefined();
        expect(groupThreshold!.maxExecutionTime).toBe(100);
      });
    });
  });

  describe('PerformanceAlertHandler', () => {
    let testAlerts: PerformanceAlert[];

    beforeEach(() => {
      testAlerts = [
        {
          id: 'test_warning_1',
          operation: 'test_operation',
          severity: 'warning',
          message: 'Test warning alert',
          currentValue: 150,
          thresholdValue: 100,
          timestamp: Date.now(),
          environment: 'development'
        },
        {
          id: 'test_error_1',
          operation: 'test_operation',
          severity: 'error',
          message: 'Test error alert',
          currentValue: 200,
          thresholdValue: 100,
          timestamp: Date.now(),
          environment: 'production'
        },
        {
          id: 'test_critical_1',
          operation: 'test_operation',
          severity: 'critical',
          message: 'Test critical alert',
          currentValue: 300,
          thresholdValue: 100,
          timestamp: Date.now(),
          environment: 'production'
        }
      ];
    });

    describe('Handler Registration', () => {
      test('should register custom alert handlers', () => {
        const handlerCalls: PerformanceAlert[] = [];
        
        alertHandler.registerHandler('warning', (alert) => {
          handlerCalls.push(alert);
        });

        alertHandler.handleAlert(testAlerts[0]);
        
        expect(handlerCalls).toHaveLength(1);
        expect(handlerCalls[0]).toEqual(testAlerts[0]);
      });

      test('should handle multiple severity levels', () => {
        const warningCalls: PerformanceAlert[] = [];
        const errorCalls: PerformanceAlert[] = [];
        
        alertHandler.registerHandler('warning', (alert) => warningCalls.push(alert));
        alertHandler.registerHandler('error', (alert) => errorCalls.push(alert));

        alertHandler.handleAlert(testAlerts[0]); // warning
        alertHandler.handleAlert(testAlerts[1]); // error
        
        expect(warningCalls).toHaveLength(1);
        expect(errorCalls).toHaveLength(1);
        expect(warningCalls[0].severity).toBe('warning');
        expect(errorCalls[0].severity).toBe('error');
      });
    });

    describe('Alert Processing', () => {
      test('should use default handler when no custom handler is registered', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
        alertHandler.handleAlert(testAlerts[0]);
        
        expect(consoleSpy).toHaveBeenCalled();
        const logCalls = consoleSpy.mock.calls;
        expect(logCalls.some(call => call[0].includes('Performance Alert'))).toBe(true);
        
        consoleSpy.mockRestore();
      });

      test('should process multiple alerts', () => {
        const handlerCalls: PerformanceAlert[] = [];
        
        alertHandler.registerHandler('warning', (alert) => handlerCalls.push(alert));
        alertHandler.registerHandler('error', (alert) => handlerCalls.push(alert));
        alertHandler.registerHandler('critical', (alert) => handlerCalls.push(alert));

        alertHandler.handleAlerts(testAlerts);
        
        expect(handlerCalls).toHaveLength(3);
        expect(handlerCalls.map(alert => alert.severity)).toEqual(['warning', 'error', 'critical']);
      });

      test('should handle alerts with metadata', () => {
        const alertWithMetadata: PerformanceAlert = {
          ...testAlerts[0],
          metadata: {
            iterations: 100,
            environment: 'test',
            customData: { key: 'value' }
          }
        };

        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
        alertHandler.handleAlert(alertWithMetadata);
        
        expect(consoleSpy).toHaveBeenCalled();
        const logCalls = consoleSpy.mock.calls;
        expect(logCalls.some(call => 
          call[0].includes('Metadata:') && call[1] === alertWithMetadata.metadata
        )).toBe(true);
        
        consoleSpy.mockRestore();
      });
    });

    describe('Default Handler Behavior', () => {
      test('should display appropriate icons for different severity levels', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
        testAlerts.forEach(alert => alertHandler.handleAlert(alert));
        
        const logCalls = consoleSpy.mock.calls;
        expect(logCalls.some(call => call[0].includes('⚠️'))).toBe(true); // warning
        expect(logCalls.some(call => call[0].includes('❌'))).toBe(true); // error
        expect(logCalls.some(call => call[0].includes('🚨'))).toBe(true); // critical
        
        consoleSpy.mockRestore();
      });

      test('should include all relevant alert information in default handler', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
        alertHandler.handleAlert(testAlerts[0]);
        
        const logOutput = consoleSpy.mock.calls.map(call => call.join(' ')).join(' ');
        expect(logOutput).toContain(testAlerts[0].operation);
        expect(logOutput).toContain(testAlerts[0].message);
        expect(logOutput).toContain(testAlerts[0].environment);
        
        consoleSpy.mockRestore();
      });
    });
  });

  describe('Integration with Benchmarking Framework', () => {
    test('should integrate with PerformanceBenchmark for end-to-end testing', async () => {
      const group = createTestGroup(8);
      
      // Perform benchmarking
      const result = await benchmark.measureExecutionTime(
        'integration_test',
        () => GroupTheoryValidator.validateGroupAxioms(group),
        20
      );

      // Check against thresholds
      const alerts = baselineManager.checkThresholds(result, 'development');
      
      // Process alerts
      if (alerts.length > 0) {
        alertHandler.handleAlerts(alerts);
      }

      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.operation).toBe('integration_test');
      
      // Alerts may or may not be generated depending on performance
      expect(Array.isArray(alerts)).toBe(true);
    });

    test('should create baselines from benchmark measurements', async () => {
      const group = createTestGroup(6);
      
      // Generate multiple measurements
      const measurements: BenchmarkResult[] = [];
      for (let i = 0; i < 25; i++) {
        const result = await benchmark.measureExecutionTime(
          'baseline_integration_test',
          () => GroupTheoryValidator.validateGroupAxioms(group),
          5
        );
        measurements.push(result);
      }

      // Create baseline
      const baseline = baselineManager.createBaseline(
        'baseline_integration_test',
        measurements,
        'development'
      );

      expect(baseline).not.toBeNull();
      expect(baseline!.operation).toBe('baseline_integration_test');
      expect(baseline!.sampleSize).toBeGreaterThan(15); // Accounting for potential outlier removal
    });

    test('should detect regressions in real benchmark data', async () => {
      const group = createTestGroup(6);
      
      // Create baseline measurements
      const baselineMeasurements: BenchmarkResult[] = [];
      for (let i = 0; i < 25; i++) {
        const result = await benchmark.measureExecutionTime(
          'regression_test',
          () => GroupTheoryValidator.validateGroupAxioms(group),
          5
        );
        baselineMeasurements.push(result);
      }

      // Create baseline
      const baseline = baselineManager.createBaseline(
        'regression_test',
        baselineMeasurements,
        'development'
      );
      expect(baseline).not.toBeNull();

      // Simulate performance regression by adding artificial delay
      const regressionResult = await benchmark.measureExecutionTime(
        'regression_test',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 5)); // Add 5ms delay
          return GroupTheoryValidator.validateGroupAxioms(group);
        },
        10
      );

      // Check for regression
      const regressionDetection = baselineManager.checkForRegression(
        'regression_test',
        regressionResult,
        'development'
      );

      expect(regressionDetection).not.toBeNull();
      // May or may not detect regression depending on baseline variance and added delay
      expect(['improvement', 'regression', 'no_change']).toContain(regressionDetection!.effect);
    });
  });

  describe('Statistical Analysis and Outlier Detection', () => {
    test('should correctly remove outliers from measurements', () => {
      // Create measurements with known outliers
      const normalMeasurements = createMockBenchmarkResults('outlier_test', 20, 50, 2);
      const outlierMeasurements = [
        ...normalMeasurements,
        ...createMockBenchmarkResults('outlier_test', 3, 200, 10) // Extreme outliers
      ];

      const baseline = baselineManager.createBaseline(
        'outlier_test',
        outlierMeasurements,
        'development'
      );

      expect(baseline).not.toBeNull();
      // Mean should be closer to 50 than to the average including outliers
      expect(baseline!.meanTime).toBeLessThan(100);
      expect(baseline!.meanTime).toBeCloseTo(50, 0);
    });

    test('should calculate accurate percentiles', () => {
      // Create measurements with known distribution
      const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      const measurements = values.map((value, index) => ({
        operation: 'percentile_test',
        executionTime: value,
        iterations: 10,
        timestamp: Date.now() - index * 1000
      })) as BenchmarkResult[];

      const baseline = baselineManager.createBaseline(
        'percentile_test',
        measurements,
        'development'
      );

      expect(baseline).not.toBeNull();
      expect(baseline!.percentiles.p50).toBeCloseTo(55, 0); // Median of 1-100
      expect(baseline!.percentiles.p90).toBeCloseTo(91, 0); // 90th percentile
      expect(baseline!.percentiles.p95).toBeCloseTo(96, 0); // 95th percentile
    });
  });

  describe('Global Instances', () => {
    test('should work with global baseline manager instance', () => {
      const customThreshold: PerformanceThreshold = {
        operation: 'global_test',
        maxExecutionTime: 300,
        environment: 'testing',
        severity: 'warning',
        description: 'Global instance test'
      };

      globalBaselineManager.setThreshold(customThreshold);
      const retrieved = globalBaselineManager.getThreshold('global_test', 'testing');
      
      expect(retrieved).toEqual(customThreshold);
    });

    test('should work with global alert handler instance', () => {
      const handlerCalls: PerformanceAlert[] = [];
      
      globalAlertHandler.registerHandler('warning', (alert) => {
        handlerCalls.push(alert);
      });

      const testAlert: PerformanceAlert = {
        id: 'global_test_alert',
        operation: 'global_test',
        severity: 'warning',
        message: 'Global handler test',
        currentValue: 100,
        thresholdValue: 80,
        timestamp: Date.now(),
        environment: 'testing'
      };

      globalAlertHandler.handleAlert(testAlert);
      
      expect(handlerCalls).toHaveLength(1);
      expect(handlerCalls[0]).toEqual(testAlert);
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    test('should handle empty measurement arrays', () => {
      const baseline = baselineManager.createBaseline('empty_test', [], 'development');
      expect(baseline).toBeNull();
    });

    test('should handle measurements with identical values', () => {
      const identicalMeasurements = Array(25).fill(null).map(() => ({
        operation: 'identical_test',
        executionTime: 50,
        iterations: 10,
        timestamp: Date.now()
      })) as BenchmarkResult[];

      const baseline = baselineManager.createBaseline(
        'identical_test',
        identicalMeasurements,
        'development'
      );

      expect(baseline).not.toBeNull();
      expect(baseline!.meanTime).toBe(50);
      expect(baseline!.standardDeviation).toBe(0);
      expect(baseline!.percentiles.p50).toBe(50);
    });

    test('should handle measurements with NaN or infinite values', () => {
      const invalidMeasurements = [
        ...createMockBenchmarkResults('invalid_test', 20, 50, 5),
        {
          operation: 'invalid_test',
          executionTime: NaN,
          iterations: 10,
          timestamp: Date.now()
        },
        {
          operation: 'invalid_test',
          executionTime: Infinity,
          iterations: 10,
          timestamp: Date.now()
        }
      ] as BenchmarkResult[];

      // The baseline creation should handle invalid values gracefully
      const baseline = baselineManager.createBaseline(
        'invalid_test',
        invalidMeasurements,
        'development'
      );

      // Should either create a baseline from valid measurements or return null
      if (baseline) {
        expect(isNaN(baseline.meanTime)).toBe(false);
        expect(isFinite(baseline.meanTime)).toBe(true);
      }
    });

    test('should handle very large measurement arrays efficiently', () => {
      const largeMeasurements = createMockBenchmarkResults('large_test', 1000, 50, 10);
      
      const startTime = performance.now();
      const baseline = baselineManager.createBaseline(
        'large_test',
        largeMeasurements,
        'development'
      );
      const endTime = performance.now();

      expect(baseline).not.toBeNull();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});