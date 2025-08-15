# Performance Monitoring System

A comprehensive, real-time performance monitoring solution for mathematical platforms with intelligent alerting, optimization recommendations, and data export capabilities.

## 🚀 Features

### Core Monitoring

- **Real-time Metrics Collection**: Track computation, rendering, memory, and interaction performance
- **Efficient Buffering**: Smart data management with configurable buffer sizes and cleanup
- **Performance Hooks**: React hooks for easy integration into components
- **WASM Monitoring**: Built-in support for WebAssembly performance tracking

### Intelligent Alerting

- **Threshold-based Alerts**: Configurable performance thresholds with priority levels
- **ML-based Anomaly Detection**: Statistical analysis to detect performance anomalies
- **Smart Alert Management**: Alert history, resolution tracking, and statistics

### Optimization Engine

- **Performance Analysis**: Automatic bottleneck detection and trend analysis
- **Intelligent Recommendations**: AI-powered optimization suggestions
- **Performance Scoring**: Overall system performance scoring (0-100)

### Data Export & Analysis

- **Multiple Formats**: CSV and JSON export options
- **Comprehensive Reports**: Performance reports with trends and recommendations
- **Bottleneck Analysis**: Detailed analysis of performance bottlenecks
- **Component Analysis**: Per-component performance breakdown

### Production Ready

- **Environment Configuration**: Development, production, and testing configurations
- **Performance Overhead**: <1% overhead in production, <5% in development
- **Configurable Sampling**: Adjustable sampling rates for different environments
- **Memory Management**: Automatic cleanup and memory threshold monitoring

## 📦 Installation

The performance monitoring system is already integrated into the project. No additional installation required.

## 🎯 Quick Start

### Basic Usage

```typescript
import { usePerformanceMonitor, useMemoryTracking } from '@/lib/performance';

function MyComponent() {
  // Monitor rendering performance
  const { startTimer } = usePerformanceMonitor('my-component', 'rendering');

  // Track memory usage
  useMemoryTracking('my-component', 5000);

  const handleRender = () => {
    const stopTimer = startTimer();

    // Your rendering logic here
    renderSomething();

    stopTimer(); // Automatically records the performance metric
  };

  return <div>...</div>;
}
```

### Dashboard Integration

```typescript
import { PerformanceDashboard } from '@/components/performance';

function App() {
  return (
    <div>
      <PerformanceDashboard />
      {/* Your app content */}
    </div>
  );
}
```

## 🔧 Configuration

### Environment Variables

```bash
# Development
PERFORMANCE_MONITORING_ENABLED=true
PERFORMANCE_SAMPLE_RATE=1.0
PERFORMANCE_BUFFER_SIZE=50000

# Production
PERFORMANCE_MONITORING_ENABLED=false
PERFORMANCE_SAMPLE_RATE=0.01
PERFORMANCE_BUFFER_SIZE=5000
```

### Runtime Configuration

```typescript
import { performanceConfig } from '@/lib/performance';

// Update configuration at runtime
performanceConfig.updateConfig({
  monitoring: {
    sampleRate: 0.5,
    bufferSize: 20000
  }
});

// Get current configuration
const config = performanceConfig.getConfig();
```

## 📊 Dashboard Features

### Real-time Charts

- **Computation Performance**: Line charts showing computation times over time
- **Memory Usage**: Bar charts displaying memory consumption patterns
- **Performance Scores**: Doughnut charts for component performance comparison

### Metrics Display

- **Performance Score**: Overall system performance (0-100)
- **Category Breakdown**: Metrics count by performance category
- **Component Activity**: Active component monitoring status
- **System Information**: Platform and capability detection

### Alert System

- **Priority-based Alerts**: Critical, high, medium, and low priority alerts
- **Alert Types**: Threshold violations, anomalies, and warnings
- **Resolution Tracking**: Mark alerts as resolved with timestamps
- **Alert Statistics**: Summary of active and resolved alerts

### Dashboard Controls

- **Sampling Configuration**: Adjust data collection sampling rates
- **Buffer Management**: Configure buffer sizes and cleanup intervals
- **Data Export**: Export metrics in CSV or JSON format
- **System Status**: Monitor buffer usage and active hooks

## 🧠 Intelligent Features

### Anomaly Detection

The system uses multiple statistical methods to detect performance anomalies:

- **Z-Score Analysis**: Detects values that deviate significantly from the mean
- **IQR Method**: Identifies outliers using interquartile range analysis
- **Trend Analysis**: Detects performance degradation over time
- **Combined Scoring**: Multi-factor anomaly scoring for accurate detection

### Optimization Recommendations

Automatic generation of optimization suggestions based on:

- **Performance Bottlenecks**: Identification of slow operations
- **Memory Patterns**: Detection of memory leaks and high usage
- **Trend Analysis**: Performance degradation identification
- **Component Analysis**: Per-component optimization opportunities

## 📈 Data Export

### Available Export Types

1. **Performance Metrics**: Raw performance data in CSV/JSON
2. **Performance Reports**: Comprehensive analysis with trends and recommendations
3. **Bottleneck Analysis**: Detailed bottleneck identification and analysis
4. **Trend Analysis**: Performance trends over different time windows
5. **Component Analysis**: Per-component performance breakdown

### Export Example

```typescript
import { performanceDataExporter } from '@/lib/performance';

// Export raw metrics
performanceDataExporter.exportToCSV(metrics, 'my-metrics.csv');

// Generate and export performance report
performanceDataExporter.exportPerformanceReport(metrics, 'performance-report.json');

// Export bottleneck analysis
performanceDataExporter.exportBottleneckAnalysis(metrics, 'bottlenecks.json');
```

## 🔌 Integration Examples

### Mathematical Components

```typescript
// KaTeX rendering performance
const { startTimer } = usePerformanceMonitor('katex', 'rendering');

useEffect(() => {
  const stopTimer = startTimer();

  try {
    const rendered = katex.renderToString(math, options);
    setRenderedMath(rendered);
  } finally {
    stopTimer();
  }
}, [math]);
```

### 3D Visualizations

```typescript
// Cayley graph rendering performance
const { startTimer } = usePerformanceMonitor('cayley-3d', 'rendering');
useMemoryTracking('cayley-3d', 5000);

const renderGraph = useCallback(() => {
  const stopTimer = startTimer();

  // 3D rendering logic
  generateLayout();
  createNodes();
  createEdges();

  stopTimer();
}, [startTimer]);
```

### WASM Operations

```typescript
// WASM performance monitoring
const { wrapWASMFunction } = useWASMPerformance('matrix-multiplication', 'wasm');

const optimizedMatrixMultiply = wrapWASMFunction(originalMatrixMultiply);

// Use the wrapped function
const result = optimizedMatrixMultiply(matrixA, matrixB);
```

## 🧪 Testing

### Unit Tests

```bash
npm test -- --testPathPattern=PerformanceMetrics.test.ts
```

### Performance Tests

The system includes built-in performance testing to ensure monitoring overhead is minimal:

- **Monitoring Overhead**: <5% of computation time
- **Memory Usage**: <50MB for 24-hour operation
- **Dashboard Responsiveness**: Updates every second without impact

## 🚀 Production Deployment

### Environment Configuration

1. **Set Environment Variables**: Configure production settings
2. **Enable Monitoring**: Set appropriate sampling rates
3. **Configure Alerts**: Set up production alert thresholds
4. **Monitor Overhead**: Ensure performance impact is acceptable

### Performance Optimization

- **Sampling Rates**: Use 1% sampling in production
- **Buffer Sizes**: Smaller buffers for production environments
- **Alert Disabling**: Disable non-critical alerts in production
- **Auto-cleanup**: Enable automatic metric cleanup

## 📚 API Reference

### Core Classes

- `PerformanceMetricsCollector`: Main metrics collection system
- `MetricsBuffer`: Efficient data buffering and management
- `AlertManager`: Intelligent alert system
- `AnomalyDetector`: ML-based anomaly detection
- `OptimizationEngine`: Performance optimization recommendations
- `PerformanceDataExporter`: Data export and analysis
- `PerformanceConfigManager`: Configuration management

### React Hooks

- `usePerformanceMonitor`: Component performance monitoring
- `usePerformanceMetrics`: Real-time metrics access
- `usePerformanceToggle`: Enable/disable monitoring
- `useMemoryTracking`: Memory usage monitoring
- `usePerformanceOptimization`: Optimization suggestions
- `useWASMPerformance`: WASM operation monitoring

### Types

- `PerformanceMetric`: Core metric interface
- `Alert`: Alert system types
- `Recommendation`: Optimization recommendation types
- `PerformanceReport`: Comprehensive report interface
- `Bottleneck`: Performance bottleneck information

## 🤝 Contributing

### Adding New Metrics

```typescript
import { performanceMetrics } from '@/lib/performance';

// Collect custom metrics
performanceMetrics.collectMetric({
  id: 'custom-operation',
  timestamp: Date.now(),
  category: 'computation',
  value: 150,
  unit: 'ms',
  metadata: { operation: 'custom', parameters: { size: 1000 } }
});
```

### Custom Alert Rules

```typescript
import { thresholdManager } from '@/lib/performance';

// Add custom threshold
thresholdManager.createCustomThreshold('custom-metric', 'gt', 1000, true);
```

### Performance Hooks

```typescript
// Create custom performance hooks
export const useCustomPerformance = (componentId: string) => {
  const { startTimer } = usePerformanceMonitor(componentId, 'custom');

  const measureOperation = useCallback(
    (operation: () => void) => {
      const stopTimer = startTimer();
      operation();
      stopTimer();
    },
    [startTimer]
  );

  return { measureOperation };
};
```

## 📄 License

This performance monitoring system is part of the zktheory project and follows the same licensing terms.

## 🆘 Support

For issues, questions, or contributions:

1. Check the test files for usage examples
2. Review the configuration documentation
3. Examine the dashboard implementation
4. Run the performance test page at `/test/performance`

---

**Performance Monitoring System** - Empowering mathematical platforms with intelligent performance insights.
