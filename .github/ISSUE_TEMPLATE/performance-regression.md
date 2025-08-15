---
name: Performance Regression
about: Report a performance regression detected by CI/CD pipeline
title: '[PERFORMANCE] Regression detected in [COMPONENT]'
labels: ['performance', 'regression', 'needs-investigation']
assignees: []
---

## Performance Regression Details

**Component:** [e.g., TDA computation, Cayley graph rendering, mathematical calculations]

**Detection Date:** [Date when regression was detected]

**CI/CD Run:** [Link to the CI/CD run that detected the regression]

## Performance Metrics

**Before (Baseline):**
- Execution Time: [X]ms
- Memory Usage: [X]MB
- Input Size: [X] data points/elements

**After (Current):**
- Execution Time: [X]ms
- Memory Usage: [X]MB
- Input Size: [X] data points/elements

**Regression Magnitude:**
- Performance degradation: [X]% slower
- Memory increase: [X]% more memory

## Mathematical Context

**Algorithm/Operation:** [Specific mathematical operation affected]

**Input Characteristics:**
- Data type: [e.g., point cloud, group elements, geometric data]
- Size range: [min-max elements]
- Complexity class: [O(n), O(n²), etc.]

**Expected Complexity:** [Theoretical complexity]

## Environment Details

**Node.js Version:** [18.x/20.x]
**Browser:** [Chromium/Firefox/WebKit, if applicable]
**Platform:** [ubuntu-latest/specific OS]

## Investigation Checklist

- [ ] Review recent commits affecting the component
- [ ] Check for algorithm changes or optimizations
- [ ] Validate mathematical correctness wasn't compromised
- [ ] Test with different input sizes
- [ ] Profile memory allocation patterns
- [ ] Check for dependency updates affecting performance
- [ ] Review WASM module changes (if applicable)

## Potential Causes

- [ ] Algorithm modification
- [ ] Dependency update
- [ ] Memory leak introduction
- [ ] Inefficient data structure usage
- [ ] Compilation/optimization changes
- [ ] WASM performance degradation

## Mathematical Validation

**Correctness Status:** [Verified/Needs verification]

**Test Cases Passing:** [All/Some/None]

**Mathematical Properties Preserved:** [Yes/No/Unknown]
- [ ] Numerical stability
- [ ] Convergence properties
- [ ] Precision requirements
- [ ] Topological invariants (for TDA)
- [ ] Group properties (for group theory)

## Performance Requirements

**Critical Threshold:** [X]ms execution time
**Memory Limit:** [X]MB maximum usage
**User Experience Impact:** [None/Minor/Significant/Critical]

## Additional Context

**Related Issues:** [Links to related performance issues]

**Mathematical References:** [Academic papers, algorithms, or mathematical context]

**Performance Artifacts:** [Links to performance data, profiling results]

---

**Auto-generated from CI/CD pipeline** ✨
**Investigation Priority:** [Low/Medium/High/Critical]