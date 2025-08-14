# Mathematical Design System
## ZKTheory Geometric Computing Platform

### Overview

The Mathematical Design System is a comprehensive component library specifically designed for mathematical interfaces and visualizations. Built on Tailwind CSS with mathematical precision, golden ratio proportions, and scientific visualization principles.

### 🎯 Core Principles

1. **Mathematical Precision**: All measurements based on mathematical constants (φ, √2, π)
2. **Geometric Aesthetics**: Clean lines, systematic proportions, harmonic relationships
3. **Scientific Visualization**: Purpose-built color schemes and data representation
4. **Accessibility First**: WCAG 2.1 AA compliance with mathematical content support
5. **Performance Optimized**: Efficient rendering for complex mathematical visualizations

### 📐 Design Language

#### Mathematical Constants
- **Golden Ratio (φ)**: 1.618 - Used for spacing, proportions, and layout
- **Fibonacci Sequence**: Used for spacing progression and visual hierarchy
- **Perfect Ratios**: Musical intervals (perfect fourth, major third) for typography scales

#### Color System
```css
/* Mathematical Semantic Colors */
--math-primary: #2563eb;    /* Mathematical blue */
--math-variable: #2563eb;   /* Variables (x, y, z) */
--math-constant: #059669;   /* Constants (π, e, φ) */
--math-operator: #7c3aed;   /* Operators (+, -, ×, ÷) */
--math-result: #d97706;     /* Results and outputs */
--math-error: #dc2626;      /* Errors and invalid states */
```

#### Typography Scale
```css
/* Mathematical Typography */
font-formula-display: 2.488rem;  /* φ² */
font-theorem: 1.953rem;          /* φ × 1.2 */
font-proof: 1.563rem;            /* φ */
font-base: 1rem;                 /* Base unit */
font-annotation: 0.8rem;         /* 4/5 ratio */
font-subscript: 0.64rem;         /* φ⁻¹ */
```

### 🧩 Component Categories

#### Input Components
- **MathInput**: Basic mathematical input with validation
- **FormulaInput**: LaTeX/mathematical expression input
- **ParameterInput**: Numeric parameter controls
- **MatrixInput**: Matrix element input
- **VectorInput**: Vector component input

#### Display Components  
- **MathDisplay**: Mathematical expression renderer
- **TheoremBlock**: Theorem presentation with proof support
- **ProofBlock**: Mathematical proof display
- **DefinitionBlock**: Mathematical definition cards
- **FormulaDisplay**: Large formula presentations

#### Interactive Components
- **MathButton**: Mathematical operation buttons
- **MathKeyboard**: Virtual mathematical keyboard
- **MathWorkspace**: Resizable mathematical workspace
- **MathVisualization**: 3D visualization containers

### 🎨 Usage Examples

#### Basic Mathematical Input
```tsx
import { MathInput, FormulaInput } from '@/components/mathematical';

// Simple parameter input
<MathInput 
  variant="parameter"
  semantic="variable"
  placeholder="Enter value for x"
  min={0}
  max={100}
  onMathChange={(value, parsed) => console.log(parsed)}
/>

// Formula input with LaTeX preview
<FormulaInput
  placeholder="Enter mathematical expression"
  mathExpression={true}
  latexPreview={true}
  showValidation={true}
/>
```

#### Mathematical Display
```tsx
import { MathDisplay, TheoremBlock, FormulaDisplay } from '@/components/mathematical';

// Inline mathematical expression
<MathDisplay variant="inline">
  ∫<sub>0</sub><sup>∞</sup> e<sup>-x²</sup> dx = √π/2
</MathDisplay>

// Block-level theorem
<TheoremBlock 
  title="Pythagorean Theorem"
  tags={['geometry', 'fundamental']}
  collapsible={true}
>
  For any right triangle with sides a, b and hypotenuse c:
  <FormulaDisplay>
    a² + b² = c²
  </FormulaDisplay>
</TheoremBlock>
```

#### Mathematical Workspace
```tsx
import { MathWorkspace, MathPanel, MathVisualization } from '@/components/mathematical';

<MathWorkspace layout="split" orientation="horizontal" resizable={true}>
  <MathPanel title="Input" collapsible={true}>
    <FormulaInput />
    <ParameterInput label="Amplitude" />
  </MathPanel>
  
  <MathPanel title="Visualization">
    <MathVisualization 
      title="Function Graph"
      exportable={true}
      fullscreen={true}
    >
      {/* Your visualization component */}
    </MathVisualization>
  </MathPanel>
</MathWorkspace>
```

### 🎭 Animation System

#### Mathematical Animations
```tsx
import { useMathematicalMorphing, useStepByStepAnimation } from '@/components/mathematical/hooks';

// Morphing between mathematical expressions
const { currentExpression, morphToNext } = useMathematicalMorphing([
  'f(x) = x²',
  'f(x) = x² + 2x + 1',
  'f(x) = (x + 1)²'
]);

// Step-by-step proof animation
const proof = useStepByStepAnimation([
  { expression: 'x² + 2x + 1', explanation: 'Starting expression' },
  { expression: '(x + 1)²', explanation: 'Factored form' },
  { expression: '(x + 1)(x + 1)', explanation: 'Expanded factors' }
]);
```

#### Mathematical Gestures
```tsx
import { useMathematicalZoomPan, useMathematicalDrag } from '@/components/mathematical/hooks';

// Zoom and pan for mathematical visualizations
const { zoom, pan, transform, zoomIn, zoomOut, panBy } = useMathematicalZoomPan(
  1.0,  // initial zoom
  { x: 0, y: 0 },  // initial pan
  { minZoom: 0.1, maxZoom: 10 }  // constraints
);

// Direct manipulation of mathematical objects
const { isDragging, dragDelta, dragHandlers } = useMathematicalDrag(
  (point, gesture) => {
    // Handle mathematical object dragging
    updateObjectPosition(point);
  }
);
```

### 🎨 Styling and Customization

#### CSS Custom Properties
```css
:root {
  /* Mathematical constants */
  --phi: 1.618;
  --phi-inverse: 0.618;
  --sqrt-2: 1.414;
  
  /* Mathematical grid */
  --math-baseline: 24px;
  --math-grid-base: 8px;
  
  /* Animation easing */
  --ease-golden: cubic-bezier(0.618, 0, 0.382, 1);
  --ease-fibonacci: cubic-bezier(0.236, 0, 0.764, 1);
}
```

#### Tailwind Utility Classes
```css
/* Mathematical spacing */
.space-phi { gap: calc(1rem * var(--phi)); }
.m-phi { margin: calc(1rem * var(--phi)); }
.p-phi { padding: calc(1rem * var(--phi)); }

/* Mathematical colors */
.text-math-variable { color: var(--math-variable); }
.text-math-constant { color: var(--math-constant); }
.bg-math-primary { background-color: var(--math-primary); }

/* Mathematical typography */
.font-mathematical { font-family: var(--font-mathematical); }
.font-math-code { font-family: var(--font-code); }

/* Mathematical layouts */
.grid-golden { grid-template-columns: 1fr 1.618fr; }
.aspect-golden { aspect-ratio: 1.618 / 1; }
```

#### Component Variants
```tsx
// Button variants
<MathButton variant="operator" symbol="+" />
<MathButton variant="function" symbol="sin" />
<MathButton variant="constant" symbol="π" />

// Display variants  
<MathDisplay variant="theorem" numbered={true} />
<MathDisplay variant="proof" collapsible={true} />
<MathDisplay variant="inline" copyable={true} />

// Workspace layouts
<MathWorkspace layout="split" orientation="horizontal" />
<MathWorkspace layout="grid" />
<MathWorkspace layout="tabs" />
```

### 📱 Responsive Design

#### Breakpoints
```css
/* Mathematical-specific breakpoints */
mathematical-workspace: 1400px;  /* Optimal for mathematical workspaces */
large-formula: 1600px;           /* Large mathematical expressions */
```

#### Mobile Adaptations
- Formula display automatically scales for mobile
- Mathematical keyboards adapt to screen size
- Touch gestures for mathematical object manipulation
- Simplified interfaces for complex mathematical operations

### ♿ Accessibility

#### Mathematical Content Accessibility
- Automatic MathML generation for screen readers
- Alt text for mathematical graphics and visualizations
- High contrast mode support for mathematical content
- Keyboard navigation for mathematical interfaces

#### Screen Reader Support
```tsx
// Mathematical expressions with screen reader support
<MathDisplay 
  aria-label="Quadratic formula: x equals negative b plus or minus square root of b squared minus 4ac, all over 2a"
>
  x = (-b ± √(b² - 4ac)) / 2a
</MathDisplay>
```

### 🚀 Performance

#### Optimization Features
- Lazy loading for complex mathematical visualizations
- Virtual scrolling for large datasets
- WebGL acceleration for 3D mathematical models
- Efficient re-rendering with mathematical precision

#### Performance Monitoring
```tsx
<MathVisualization 
  onPerformanceUpdate={(metrics) => {
    console.log(`Render time: ${metrics.renderTime}ms`);
    console.log(`Vertex count: ${metrics.vertexCount}`);
  }}
>
  {/* Your mathematical visualization */}
</MathVisualization>
```

### 🧪 Testing

The design system includes comprehensive testing:
- Visual regression tests for mathematical accuracy
- Accessibility tests for mathematical content
- Performance benchmarks for visualizations
- Cross-browser compatibility for mathematical rendering

### 📚 Integration Guide

#### Next.js Integration
```tsx
// app/layout.tsx
import '@/css/mathematical-design-system.css';

// Use mathematical components
import { MathInput, MathDisplay } from '@/components/mathematical';
```

#### Existing Component Migration
```tsx
// Before: Basic input
<input type="number" placeholder="Enter value" />

// After: Mathematical input
<MathInput 
  variant="parameter"
  semantic="variable"
  mathExpression={true}
  showValidation={true}
/>
```

### 🔧 Development

#### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build design system
npm run build

# Run tests
npm run test
```

#### Contributing
1. Follow mathematical precision principles
2. Maintain accessibility standards
3. Include comprehensive tests
4. Document all mathematical concepts
5. Use semantic versioning for mathematical accuracy changes

### 📖 Resources

- [Mathematical Design Language](./mathematical-design-language.md)
- [Component API Reference](./components/)
- [Animation Patterns](./animations/)
- [Accessibility Guidelines](./accessibility/)
- [Performance Best Practices](./performance/)

### 🆘 Support

- **Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Documentation**: Comprehensive guides and examples
- **Community**: Join the mathematical computing community

---

*Built with mathematical precision for the zktheory geometric computing platform*