# Mathematical Design Language
## ZKTheory Geometric Computing Platform

### Core Design Principles

#### 1. Mathematical Precision
- **Exact Measurements**: All spacing, sizing, and positioning based on mathematical ratios
- **Grid Systems**: Built on geometric progressions and mathematical constants
- **Alignment**: Pixel-perfect alignment using mathematical calculations
- **Proportions**: Golden ratio (φ = 1.618), Fibonacci sequences, and harmonic proportions

#### 2. Geometric Aesthetics
- **Clean Lines**: Sharp, precise geometric forms
- **Minimal Complexity**: Reduction to essential mathematical forms
- **Structural Harmony**: Visual relationships based on mathematical laws
- **Systematic Consistency**: Repeatable patterns and structures

#### 3. Visual Hierarchy for Mathematics
- **Content Priority**: Mathematical expressions > explanatory text > UI chrome
- **Size Relationships**: 1.2, 1.414 (√2), 1.618 (φ), 2.0 progression
- **Visual Weight**: Bold for theorems, regular for proofs, light for annotations
- **Color Coding**: Semantic mathematical meaning (variables, constants, operators)

### Color Theory for Mathematics

#### Scientific Visualization Palettes
```css
/* Primary Mathematical Colors */
--math-primary: #2563eb;     /* Mathematical blue for primary elements */
--math-secondary: #7c3aed;   /* Mathematical purple for secondary elements */
--math-accent: #059669;      /* Mathematical green for success/validation */
--math-warning: #d97706;     /* Mathematical orange for caution */
--math-error: #dc2626;       /* Mathematical red for errors */

/* Data Visualization Colors */
--viz-sequential: ['#f7fbff', '#c6dbef', '#6baed6', '#2171b5', '#08306b'];
--viz-diverging: ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850'];
--viz-categorical: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];

/* Mathematical Function Colors */
--function-primary: #2563eb;   /* f(x) - primary function */
--function-secondary: #dc2626; /* g(x) - secondary function */
--function-tertiary: #059669;  /* h(x) - tertiary function */
--derivative: #7c3aed;         /* f'(x) - derivatives */
--integral: #d97706;           /* ∫f(x)dx - integrals */
```

#### Semantic Color Mapping
- **Variables**: Blue spectrum (#2563eb to #60a5fa)
- **Constants**: Green spectrum (#059669 to #34d399)  
- **Operators**: Purple spectrum (#7c3aed to #a78bfa)
- **Results**: Amber spectrum (#d97706 to #fbbf24)
- **Errors**: Red spectrum (#dc2626 to #f87171)

### Typography System

#### Mathematical Font Stack
```css
/* Primary Mathematical Typography */
font-family: 'KaTeX_Main', 'Computer Modern', 'Latin Modern Math', 'Times New Roman', serif;

/* Code and Formulas */
font-family: 'Fira Code', 'JetBrains Mono', 'SF Mono', 'Monaco', monospace;

/* UI Text */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

#### Mathematical Typography Scale
Based on the perfect fourth (1.333) and major third (1.25) musical intervals:
- **Formula Display**: 2.488rem (φ²)
- **Theorem Headers**: 1.953rem (φ × 1.2)
- **Proof Steps**: 1.563rem (φ)
- **Explanatory Text**: 1.25rem (5/4)
- **Base Text**: 1rem
- **Annotations**: 0.8rem (4/5)
- **Subscripts**: 0.64rem (φ⁻¹)

### Spacing System

#### Mathematical Ratios
```css
/* Fibonacci-based spacing */
--space-1: 0.25rem;  /* 4px - φ⁻³ */
--space-2: 0.5rem;   /* 8px - φ⁻² */
--space-3: 0.75rem;  /* 12px - φ⁻¹ */
--space-4: 1rem;     /* 16px - base */
--space-5: 1.25rem;  /* 20px - φ⁰ */
--space-6: 1.618rem; /* 25.89px - φ¹ */
--space-8: 2rem;     /* 32px - φ × 1.236 */
--space-10: 2.618rem; /* 41.89px - φ² */
--space-12: 3rem;    /* 48px - φ × 1.854 */
--space-16: 4.236rem; /* 67.78px - φ³ */
```

#### Grid System
- **Base Unit**: 8px (2³)
- **Column Grid**: 12-column system with φ-based gutters
- **Baseline Grid**: 24px (3 × 8px) for mathematical line height
- **Mathematical Expressions**: 32px baseline for complex formulas

### Component Architecture

#### Mathematical Component Categories
1. **Input Components**: Formula inputs, parameter controls, mathematical keyboards
2. **Display Components**: Equation renderers, proof displayers, result showcases  
3. **Visualization Components**: Graphs, 3D models, geometric constructions
4. **Interactive Components**: Calculators, sliders, manipulation tools
5. **Layout Components**: Mathematical workspaces, theorem environments

#### Component Naming Convention
```
math-[category]-[element]-[variant]

Examples:
- math-input-formula-inline
- math-display-equation-block
- math-viz-graph-2d
- math-interactive-slider-parameter
- math-layout-workspace-split
```

### Geometric Layout Principles

#### Sacred Geometry in UI
- **Golden Rectangle**: Primary content areas use φ:1 ratio
- **Fibonacci Spiral**: Navigation and flow patterns
- **Triangular Grids**: For mathematical diagrams and proofs
- **Circular Harmony**: For radial menus and mathematical operations

#### Alignment Systems
- **Mathematical Center**: Precise centering using calculated positions
- **Baseline Alignment**: Mathematical expressions aligned to baseline grid
- **Modular Alignment**: Components snap to mathematical grid points
- **Optical Alignment**: Visual adjustments based on mathematical perception

### Accessibility for Mathematics

#### Screen Reader Support
- **MathML Generation**: Automatic conversion of visual math to MathML
- **Alt Text Patterns**: Descriptive text for mathematical graphics
- **Keyboard Navigation**: Tab order respects mathematical reading order
- **Contrast Ratios**: WCAG 2.1 AA compliance for all mathematical content

#### Multi-modal Input
- **Voice Commands**: For mathematical operations and navigation
- **Touch Gestures**: Intuitive manipulation of mathematical objects
- **Keyboard Shortcuts**: Efficient access to mathematical functions
- **Alternative Representations**: Multiple ways to display same information

### Animation and Motion

#### Mathematical Transitions
- **Morphing Equations**: Smooth transitions between mathematical expressions
- **Geometric Transformations**: Rotate, scale, translate with mathematical precision
- **Function Animations**: Visual representation of mathematical changes
- **Proof Step Animations**: Sequential revelation of proof steps

#### Timing Functions
```css
/* Mathematical easing functions */
--ease-golden: cubic-bezier(0.618, 0, 0.382, 1); /* Golden ratio */
--ease-fibonacci: cubic-bezier(0.236, 0, 0.764, 1); /* Fibonacci */
--ease-harmonic: cubic-bezier(0.25, 0, 0.25, 1); /* Musical harmony */
--ease-exponential: cubic-bezier(0.19, 1, 0.22, 1); /* Exponential decay */
```

This design language serves as the foundation for all mathematical interface components, ensuring consistency, precision, and mathematical authenticity throughout the zktheory platform.