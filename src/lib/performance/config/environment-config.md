# Performance Monitoring Environment Configuration

## Development Environment (.env.development)

```bash
# Development Environment Performance Monitoring Configuration

# Monitoring Settings
PERFORMANCE_MONITORING_ENABLED=true
PERFORMANCE_SAMPLE_RATE=1.0
PERFORMANCE_BUFFER_SIZE=50000

# Alert Settings
PERFORMANCE_ALERT_ENABLED=true
PERFORMANCE_ANOMALY_DETECTION=true

# Export Settings
PERFORMANCE_EXPORT_ENABLED=true
PERFORMANCE_AUTO_EXPORT=true
PERFORMANCE_EXPORT_INTERVAL=120000

# Optimization Settings
PERFORMANCE_AUTO_CLEANUP=true
PERFORMANCE_CLEANUP_INTERVAL=600000
PERFORMANCE_MEMORY_THRESHOLD=200
```

## Production Environment (.env.production)

```bash
# Production Environment Performance Monitoring Configuration

# Monitoring Settings
PERFORMANCE_MONITORING_ENABLED=false
PERFORMANCE_SAMPLE_RATE=0.01
PERFORMANCE_BUFFER_SIZE=5000

# Alert Settings
PERFORMANCE_ALERT_ENABLED=false
PERFORMANCE_ANOMALY_DETECTION=false

# Export Settings
PERFORMANCE_EXPORT_ENABLED=false
PERFORMANCE_AUTO_EXPORT=false

# Optimization Settings
PERFORMANCE_AUTO_CLEANUP=true
PERFORMANCE_CLEANUP_INTERVAL=300000
PERFORMANCE_MEMORY_THRESHOLD=100
```

## Environment Variables Reference

### Monitoring Configuration

- `PERFORMANCE_MONITORING_ENABLED`: Enable/disable performance monitoring (true/false)
- `PERFORMANCE_SAMPLE_RATE`: Sampling rate for metrics (0.0 to 1.0)
- `PERFORMANCE_BUFFER_SIZE`: Maximum number of metrics to store in memory
- `PERFORMANCE_MAX_AGE`: Maximum age of metrics in milliseconds

### Alert Configuration

- `PERFORMANCE_ALERT_ENABLED`: Enable/disable performance alerts (true/false)
- `PERFORMANCE_ANOMALY_DETECTION`: Enable/disable ML-based anomaly detection (true/false)
- `PERFORMANCE_THRESHOLD_CHECKING`: Enable/disable threshold-based alerts (true/false)

### Export Configuration

- `PERFORMANCE_EXPORT_ENABLED`: Enable/disable data export functionality (true/false)
- `PERFORMANCE_AUTO_EXPORT`: Enable/disable automatic data export (true/false)
- `PERFORMANCE_EXPORT_INTERVAL`: Interval between automatic exports in milliseconds

### Optimization Configuration

- `PERFORMANCE_AUTO_CLEANUP`: Enable/disable automatic cleanup of old metrics (true/false)
- `PERFORMANCE_CLEANUP_INTERVAL`: Interval between cleanup operations in milliseconds
- `PERFORMANCE_MEMORY_THRESHOLD`: Memory threshold for cleanup operations in MB

## Configuration Priority

1. Environment variables (highest priority)
2. Environment-specific defaults
3. General defaults (lowest priority)

## Usage Examples

### Development

```bash
# Enable full monitoring with 100% sampling
PERFORMANCE_MONITORING_ENABLED=true
PERFORMANCE_SAMPLE_RATE=1.0
PERFORMANCE_BUFFER_SIZE=50000
```

### Production

```bash
# Minimal monitoring with 1% sampling
PERFORMANCE_MONITORING_ENABLED=true
PERFORMANCE_SAMPLE_RATE=0.01
PERFORMANCE_BUFFER_SIZE=5000
```

### Testing

```bash
# Balanced monitoring for testing
PERFORMANCE_MONITORING_ENABLED=true
PERFORMANCE_SAMPLE_RATE=0.1
PERFORMANCE_BUFFER_SIZE=10000
```

## Performance Impact

- **Development**: Full monitoring with minimal performance impact
- **Production**: Minimal monitoring with <1% performance overhead
- **Testing**: Balanced monitoring with <5% performance overhead

## Security Considerations

- Performance data may contain sensitive information
- Export functionality should be disabled in production
- Alerts should not expose internal system details
- Memory thresholds should be set appropriately for the environment
