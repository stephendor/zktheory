# ZK Theory Mathematical Platform CI/CD Pipeline

This directory contains GitHub Actions workflows for the ZK Theory mathematical platform, providing comprehensive testing, security, and deployment automation.

## Workflows Overview

### 🔄 Main CI/CD Pipeline (`ci.yml`)

The primary continuous integration and deployment pipeline that runs on every push and pull request.

**Triggers:**
- Push to `main`, `major-rewrite`, `develop` branches
- Pull requests to `main`, `major-rewrite`
- Daily scheduled run at 2 AM UTC for baseline updates

**Jobs:**
1. **Code Quality & Static Analysis** - TypeScript, ESLint, Prettier validation
2. **Unit Testing Matrix** - Jest tests across Node.js 18.x and 20.x
3. **Mathematical Performance Testing** - Performance benchmarks and baseline validation
4. **E2E Testing** - Playwright tests across Chromium, Firefox, WebKit
5. **Visual Regression Testing** - Mathematical visualizations and UI components
6. **Security & Dependency Scanning** - Vulnerability and license compliance
7. **Build & Bundle Analysis** - Bundle size optimization and analysis
8. **Integration Testing** - End-to-end system validation
9. **Test Aggregation** - Results compilation and reporting
10. **Performance Baseline Updates** - Scheduled baseline maintenance

### 🔒 Security Pipeline (`security.yml`)

Dedicated security and dependency management workflow.

**Triggers:**
- Weekly schedule (Sundays at 3 AM UTC)
- Changes to `package.json` or `package-lock.json`
- Pull requests affecting dependencies

**Jobs:**
1. **Security Vulnerability Scan** - npm audit and mathematical library validation
2. **Static Application Security Testing (SAST)** - ESLint security rules, Semgrep, CodeQL
3. **Mathematical Computation Security** - Input validation and WASM security checks
4. **Dependency Update Analysis** - Automated update recommendations

## Performance Monitoring Integration

The CI/CD pipeline integrates with the existing mathematical performance monitoring framework:

### Performance Baselines
- **Automatic Baseline Creation**: Performance baselines are created and updated using the `PerformanceBaselineManager`
- **Regression Detection**: Statistical tests (Mann-Whitney, Welch's t-test, Kolmogorov-Smirnov) detect performance regressions
- **Threshold Enforcement**: Configurable performance gates fail builds on regressions

### Mathematical Validation
- **Computation Accuracy**: Validates mathematical computation correctness
- **Algorithm Performance**: Benchmarks TDA, group theory, and visualization algorithms
- **Memory Efficiency**: Monitors memory usage and detects leaks in mathematical operations

### Performance Gates
```yaml
Performance Thresholds:
  - Execution Time: 100ms (configurable via PERFORMANCE_THRESHOLD_MS)
  - Memory Usage: 50MB (configurable via MEMORY_THRESHOLD_MB)
  - Mathematical Precision: 1e-10 tolerance
  - Bundle Size: 50MB maximum
```

## Test Categories

### 🧪 Unit Tests (`npm run test`)
- **Mathematical Libraries**: Group theory, TDA engine, elliptic curves
- **React Components**: TDA Explorer, Cayley Graph visualizations
- **Performance Utilities**: Metrics collection, baseline management
- **Coverage Requirement**: 80% minimum across all metrics

### 🌐 End-to-End Tests (`npm run test:e2e`)
- **Mathematical Workflows**: Complete user interactions with mathematical tools
- **Cross-Browser Testing**: Chromium, Firefox, WebKit, Mobile Chrome/Safari
- **Visual Regression**: Mathematical visualizations, LaTeX rendering
- **Performance Integration**: Real-world performance validation

### 📊 Performance Tests (`npm run test:performance`)
- **Mathematical Benchmarks**: Algorithm performance across input sizes
- **Visualization Rendering**: Canvas and WebGL performance
- **WASM Integration**: WebAssembly module performance
- **Memory Profiling**: Heap usage and garbage collection analysis

## Artifact Management

### Test Results
- **Unit Test Reports**: JUnit XML, coverage reports (LCOV, HTML)
- **E2E Test Results**: Playwright HTML reports, screenshots, videos
- **Performance Data**: Baseline comparisons, regression analysis
- **Visual Regression**: Screenshot comparisons, diff images

### Security Artifacts
- **Vulnerability Reports**: npm audit results, dependency analysis
- **License Compliance**: License checker reports
- **SAST Results**: Static analysis findings, CodeQL reports

### Build Artifacts
- **Bundle Analysis**: Webpack bundle analyzer reports
- **Performance Budgets**: Size and performance budget validation
- **Mathematical Assets**: WASM files, mathematical visualization resources

## Environment Configuration

### Environment Variables
```yaml
NODE_VERSION_MATRIX: '["18.x", "20.x"]'
PERFORMANCE_THRESHOLD_MS: 100
MEMORY_THRESHOLD_MB: 50
MATHEMATICAL_TESTING: true
```

### Secrets Required
- `GITHUB_TOKEN`: Automatic (for CodeQL, issue creation)
- `CODECOV_TOKEN`: Optional (for coverage reporting)

### Cache Strategy
- **Node.js Dependencies**: npm cache across jobs
- **Build Cache**: Next.js build cache for faster builds
- **Test Cache**: Jest cache for faster test execution
- **Browser Cache**: Playwright browser installations

## Performance Optimization

### Parallel Execution
- **Matrix Strategy**: Multiple Node.js versions tested simultaneously
- **Browser Testing**: Cross-browser E2E tests run in parallel
- **Independent Jobs**: Code quality, security, and performance tests run concurrently

### Caching Strategy
```yaml
Cache Hierarchy:
  1. Node.js dependencies (npm cache)
  2. Build artifacts (.next/cache)
  3. Test cache (.jest-cache)
  4. Browser installations (Playwright)
  5. Visual regression baselines
```

### Resource Management
- **Timeout Configuration**: Job-specific timeouts (5-30 minutes)
- **Worker Allocation**: Optimal worker count for stability
- **Artifact Retention**: Configurable retention periods (7-30 days)

## Mathematical Library Specific Features

### WASM Integration
- **Security Validation**: WASM file integrity and size checks
- **Performance Monitoring**: WebAssembly execution performance
- **Browser Compatibility**: Cross-browser WASM support validation

### Mathematical Visualization
- **Rendering Tests**: Canvas, WebGL, and SVG rendering validation
- **Visual Regression**: Automated screenshot comparison for mathematical plots
- **Performance Profiling**: Frame rate and rendering performance monitoring

### TDA (Topological Data Analysis)
- **Algorithm Validation**: Persistence computation correctness
- **Performance Benchmarks**: TDA algorithm performance across data sizes
- **Visualization Tests**: Persistence diagrams, barcodes, and landscapes

## Failure Handling

### Error Recovery
- **Graceful Degradation**: Continue tests even when individual components fail
- **Retry Strategy**: Automatic retries for flaky tests (CI only)
- **Fallback Mechanisms**: Alternative tools when primary options fail

### Debugging Support
- **Detailed Logging**: Comprehensive logging for mathematical computations
- **Artifact Preservation**: Test artifacts saved on failure
- **Environment Recreation**: Complete environment information for debugging

## Monitoring and Alerting

### Performance Monitoring
- **Baseline Tracking**: Historical performance trend analysis
- **Regression Alerts**: Automatic alerts on performance degradation
- **Resource Usage**: Memory and CPU usage monitoring

### Quality Gates
- **Coverage Enforcement**: Minimum 80% code coverage requirement
- **Security Compliance**: Vulnerability scanning and license validation
- **Performance Budgets**: Bundle size and execution time limits

## Usage Examples

### Running Tests Locally
```bash
# Full test suite
npm run test:all

# Performance tests only
npm run test:performance

# E2E tests with specific browser
npm run test:e2e -- --project=chromium

# Visual regression tests
npm run test:visual
```

### CI/CD Customization
```yaml
# Override performance thresholds
env:
  PERFORMANCE_THRESHOLD_MS: 150
  MEMORY_THRESHOLD_MB: 75

# Add custom test environments
strategy:
  matrix:
    node-version: [16.x, 18.x, 20.x]
    browser: [chromium, firefox, webkit, edge]
```

### Performance Baseline Management
```bash
# Update baselines (runs automatically on schedule)
npm run test:performance -- --updateBaselines=true

# Export performance data
npm run test:performance -- --exportData=performance-report.json
```

## Troubleshooting

### Common Issues

**Performance Test Failures:**
- Check `performance-data/` directory for detailed metrics
- Review baseline comparisons in test artifacts
- Validate mathematical computation accuracy

**E2E Test Failures:**
- Check Playwright HTML reports for detailed failure information
- Review screenshots and videos in test artifacts
- Validate mathematical visualization rendering

**Security Scan Failures:**
- Review `security-audit.json` for vulnerability details
- Check mathematical library versions against known secure versions
- Validate WASM file integrity

### Debug Commands
```bash
# Run specific test with debug info
npm test -- --testNamePattern="mathematical" --verbose

# Debug E2E tests with headed browser
npm run test:e2e -- --headed --project=chromium

# Performance analysis with detailed metrics
npm run test:performance -- --verbose --collectMetrics
```

## Contributing

When adding new mathematical features:

1. **Add Performance Tests**: Include benchmarks for new algorithms
2. **Update Baselines**: Run baseline update after performance improvements
3. **Visual Tests**: Add visual regression tests for new visualizations
4. **Security Review**: Validate mathematical library security implications

## Architecture Decisions

### Why This Approach?

1. **Mathematical Focus**: Specialized testing for mathematical computations and visualizations
2. **Performance First**: Built-in performance monitoring and regression detection
3. **Cross-Platform**: Comprehensive browser and Node.js version coverage
4. **Security Conscious**: Dedicated security pipeline for mathematical libraries
5. **Scalable**: Parallel execution and caching for large mathematical codebases

### Technology Choices

- **GitHub Actions**: Native GitHub integration, excellent matrix support
- **Jest**: Comprehensive JavaScript testing with mathematical utilities
- **Playwright**: Modern E2E testing with excellent mathematical visualization support
- **CodeQL**: Industry-standard SAST for security analysis
- **Semgrep**: Fast pattern-based security scanning

This CI/CD pipeline provides production-ready automation for mathematical software development, ensuring correctness, performance, and security at every stage of development.