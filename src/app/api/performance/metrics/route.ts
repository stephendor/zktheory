// Performance Metrics API Endpoint
// Handles collection and analysis of caching performance data

import { NextRequest, NextResponse } from 'next/server';
import { CachePerformanceMonitor } from '../../../../lib/caching';

export async function POST(request: NextRequest) {
  try {
    const metrics = await request.json();
    
    if (!Array.isArray(metrics)) {
      return NextResponse.json(
        { error: 'Invalid metrics format. Expected array.' },
        { status: 400 }
      );
    }

    console.log(`📊 Received ${metrics.length} performance metrics`);

    // Process and store metrics
    const processedMetrics = await processPerformanceMetrics(metrics);
    
    // Generate performance insights
    const insights = await generatePerformanceInsights(processedMetrics);
    
    // Store in database or analytics service (placeholder)
    await storeMetrics(processedMetrics);
    
    return NextResponse.json({
      success: true,
      message: `Processed ${metrics.length} metrics`,
      insights,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Performance metrics API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Create a temporary instance for this request
    const performanceMonitor = new CachePerformanceMonitor();
    
    // Get current performance metrics
    const currentMetrics = performanceMonitor.getPerformanceMetrics();
    
    // Get performance analytics
    const analytics = performanceMonitor.getPerformanceAnalytics();
    
    // Get recent alerts
    const alerts = performanceMonitor.getAlerts();
    
    return NextResponse.json({
      success: true,
      currentMetrics,
      analytics,
      alerts,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to get performance metrics:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Process incoming performance metrics
async function processPerformanceMetrics(metrics: any[]): Promise<any[]> {
  const processed: any[] = [];
  
  for (const metric of metrics) {
    try {
      // Validate metric structure
      if (!isValidMetric(metric)) {
        console.warn(`⚠️ Skipping invalid metric:`, metric);
        continue;
      }
      
      // Add processing timestamp
      const processedMetric = {
        ...metric,
        processedAt: new Date().toISOString(),
        id: generateMetricId(metric)
      };
      
      processed.push(processedMetric);
      
    } catch (error) {
      console.error(`❌ Failed to process metric:`, metric, error);
    }
  }
  
  return processed;
}

// Generate performance insights
async function generatePerformanceInsights(metrics: any[]): Promise<any> {
  if (metrics.length === 0) {
    return { message: 'No metrics available for analysis' };
  }
  
  // Calculate basic statistics
  const durations = metrics.map(m => m.duration).filter(d => typeof d === 'number');
  const successRates = metrics.map(m => m.success ? 1 : 0);
  
  const insights = {
    totalMetrics: metrics.length,
    averageDuration: durations.length > 0 ? 
      durations.reduce((a, b) => a + b, 0) / durations.length : 0,
    successRate: successRates.length > 0 ? 
      successRates.reduce((a, b) => a + b, 0) / successRates.length : 0,
    performanceTrends: analyzePerformanceTrends(metrics),
    recommendations: generateRecommendations(metrics)
  };
  
  return insights;
}

// Analyze performance trends
function analyzePerformanceTrends(metrics: any[]): any {
  // Group metrics by time (hourly)
  const hourlyGroups = new Map<number, any[]>();
  
  for (const metric of metrics) {
    const timestamp = new Date(metric.timestamp || metric.processedAt);
    const hour = timestamp.getHours();
    
    if (!hourlyGroups.has(hour)) {
      hourlyGroups.set(hour, []);
    }
    hourlyGroups.get(hour)!.push(metric);
  }
  
  // Calculate hourly averages
  const hourlyTrends: any[] = [];
  
  for (const [hour, hourMetrics] of hourlyGroups) {
    const durations = hourMetrics.map(m => m.duration).filter(d => typeof d === 'number');
    const successRates = hourMetrics.map(m => m.success ? 1 : 0);
    
    hourlyTrends.push({
      hour,
      averageDuration: durations.length > 0 ? 
        durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      successRate: successRates.length > 0 ? 
        successRates.reduce((a, b) => a + b, 0) / successRates.length : 0,
      metricCount: hourMetrics.length
    });
  }
  
  return {
    hourlyTrends: hourlyTrends.sort((a, b) => a.hour - b.hour),
    peakHours: findPeakHours(hourlyTrends),
    performancePatterns: identifyPerformancePatterns(metrics)
  };
}

// Find peak performance hours
function findPeakHours(hourlyTrends: any[]): any[] {
  if (hourlyTrends.length === 0) return [];
  
  // Sort by success rate and duration
  const sorted = [...hourlyTrends].sort((a, b) => {
    const aScore = a.successRate - a.averageDuration / 1000; // Normalize duration
    const bScore = b.successRate - b.averageDuration / 1000;
    return bScore - aScore;
  });
  
  return sorted.slice(0, 3); // Top 3 hours
}

// Identify performance patterns
function identifyPerformancePatterns(metrics: any[]): any {
  const patterns = {
    slowOperations: metrics.filter(m => m.duration > 1000), // > 1 second
    failedOperations: metrics.filter(m => !m.success),
    fastOperations: metrics.filter(m => m.duration < 100), // < 100ms
    operationTypes: new Map<string, number>()
  };
  
  // Count operation types
  for (const metric of metrics) {
    const type = metric.operation || 'unknown';
    patterns.operationTypes.set(type, (patterns.operationTypes.get(type) || 0) + 1);
  }
  
  return patterns;
}

// Generate performance recommendations
function generateRecommendations(metrics: any[]): string[] {
  const recommendations: string[] = [];
  
  // Analyze slow operations
  const slowOps = metrics.filter(m => m.duration > 1000);
  if (slowOps.length > metrics.length * 0.1) { // More than 10% slow
    recommendations.push('Consider optimizing slow operations - more than 10% of operations take over 1 second');
  }
  
  // Analyze failure rates
  const failedOps = metrics.filter(m => !m.success);
  if (failedOps.length > metrics.length * 0.05) { // More than 5% failed
    recommendations.push('High failure rate detected - investigate error patterns and improve error handling');
  }
  
  // Analyze operation distribution
  const operationTypes = new Map<string, number>();
  for (const metric of metrics) {
    const type = metric.operation || 'unknown';
    operationTypes.set(type, (operationTypes.get(type) || 0) + 1);
  }
  
  // Check for operation bottlenecks
  for (const [type, count] of operationTypes) {
    if (count > metrics.length * 0.3) { // More than 30% of operations
      recommendations.push(`Operation '${type}' represents ${((count / metrics.length) * 100).toFixed(1)}% of all operations - consider optimization`);
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Performance looks good! No immediate optimizations needed.');
  }
  
  return recommendations;
}

// Validate metric structure
function isValidMetric(metric: any): boolean {
  return (
    metric &&
    typeof metric === 'object' &&
    typeof metric.operation === 'string' &&
    typeof metric.key === 'string' &&
    typeof metric.duration === 'number' &&
    typeof metric.success === 'boolean' &&
    metric.timestamp
  );
}

// Generate unique metric ID
function generateMetricId(metric: any): string {
  const timestamp = new Date(metric.timestamp || Date.now()).getTime();
  const random = Math.random().toString(36).substr(2, 9);
  return `${timestamp}-${random}`;
}

// Store metrics (placeholder implementation)
async function storeMetrics(metrics: any[]): Promise<void> {
  // This would store metrics in a database or analytics service
  // For now, just log the storage
  console.log(`💾 Storing ${metrics.length} processed metrics`);
  
  // In a real implementation, you might:
  // - Store in PostgreSQL/MySQL
  // - Send to analytics service (Google Analytics, Mixpanel, etc.)
  // - Store in time-series database (InfluxDB, TimescaleDB)
  // - Archive to data warehouse
}
