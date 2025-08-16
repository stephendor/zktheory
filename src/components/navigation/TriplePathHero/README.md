# Triple Path Hero Component

A sophisticated, mathematically-precise landing page component that provides three distinct pathways for different audience segments: Business Leaders, Technical Developers, and Academic Researchers. Features a central golden ratio spiral animation that serves as a mathematical hub connecting all pathways.

## Features

### 🎯 **Triple Audience Pathways**
- **Business Leaders**: ROI calculators, case studies, trust indicators, implementation timelines
- **Technical Developers**: Interactive code examples, API documentation, live playground integration
- **Academic Researchers**: Research papers, mathematical visualizations, collaboration tools

### 🌀 **Mathematical Central Hub**
- Golden ratio spiral animation (φ ≈ 1.618)
- Real-time mathematical concept transformations
- Interactive particle systems with mathematical precision
- Adaptive complexity based on performance mode

### 📱 **Responsive & Accessible**
- Mobile-first design with φ-based proportions
- WCAG AA compliance with screen reader optimization
- Keyboard navigation with mathematical content descriptions
- High contrast mode support

### ⚡ **Performance Optimized**
- Lazy loading with intersection observers
- Canvas pooling and memory management
- Device capability detection and optimization
- 60fps animations with performance monitoring

## Installation

The component is part of the ZKTheory design system and automatically available through the component registry.

```tsx
import { TriplePathHero } from '@/components/navigation/TriplePathHero';
```

## Basic Usage

### Standalone Component

```tsx
import { TriplePathHero } from '@/components/navigation/TriplePathHero';

function LandingPage() {
  return (
    <TriplePathHero
      performanceMode="balanced"
      enableParallax={true}
      onPathSelection={(path) => {
        console.log(`User selected: ${path} pathway`);
      }}
    />
  );
}
```

### Content Management Integration

```yaml
# content/pages/index.md
sections:
  - type: TriplePathHeroSection
    title:
      text: 'Mathematical Excellence Meets Practical Innovation'
      color: text-math-primary
    subtitle: 'Zero-Knowledge Proofs • Topological Data Analysis • Advanced Cryptography'
    performanceMode: balanced
    enableParallax: true
    businessConfig:
      roiCalculatorEnabled: true
      trustIndicators:
        - 'Enterprise Security Standards'
        - 'Compliance Ready Architecture'
```

## Configuration

### Animation Configuration

```tsx
const animationConfig = {
  duration: 800,           // Animation duration in ms
  easing: 'cubic-bezier(0.618, 0, 0.382, 1)', // Golden ratio easing
  delay: 0,                // Initial delay
  stagger: 100            // Stagger between pathway animations
};

<TriplePathHero animationConfig={animationConfig} />
```

### Spiral Configuration

```tsx
const spiralConfig = {
  segments: 144,           // Number of spiral segments (Fibonacci)
  maxRotations: 3,         // Maximum spiral rotations
  animationDuration: 8000, // Spiral animation cycle time
  particleCount: 21,       // Number of transformation particles
  colorScheme: 'mathematical' // Color theme
};

<TriplePathHero spiralConfig={spiralConfig} />
```

### Performance Modes

```tsx
// Conservative: Optimized for low-end devices
<TriplePathHero performanceMode="conservative" />

// Balanced: Adaptive based on device capabilities
<TriplePathHero performanceMode="balanced" />

// High: Full visual fidelity for powerful devices
<TriplePathHero performanceMode="high" />
```

### Pathway Customization

```tsx
const pathwayConfigs = {
  businessConfig: {
    roiCalculatorEnabled: true,
    trustIndicators: [
      'SOC 2 Type II Certified',
      'GDPR Compliant',
      'Fortune 500 Trusted'
    ],
    caseStudyPreviews: [
      {
        title: 'Financial Privacy Transformation',
        metric: '94% Faster Compliance',
        description: 'Zero-knowledge proofs revolutionized audit processes',
        ctaText: 'View Case Study',
        ctaLink: '/case-studies/financial-privacy'
      }
    ]
  },
  
  technicalConfig: {
    codeExamples: [
      {
        title: 'Zero-Knowledge Proof Generation',
        language: 'rust',
        complexity: 'intermediate',
        code: `// Advanced ZK proof implementation...`,
        description: 'Generate cryptographic proofs without revealing secrets'
      }
    ],
    playgroundPreview: {
      enabled: true,
      defaultExample: 'zkproof-basic'
    },
    githubIntegration: {
      repoUrl: 'https://github.com/zktheory/zktheory-core',
      starCount: 2847,
      forkCount: 421
    }
  },
  
  academicConfig: {
    researchPapers: [
      {
        title: 'Topological Methods in Zero-Knowledge Protocol Design',
        authors: ['Dr. Elena Vasquez', 'Prof. Michael Chen'],
        abstract: 'Novel applications of persistent homology...',
        pdfUrl: '/papers/topology-zk-2024.pdf',
        category: 'Cryptography & Topology'
      }
    ],
    collaborationTools: {
      enabled: true,
      platforms: ['arXiv integration', 'Collaborative LaTeX', 'Proof assistant']
    }
  }
};

<TriplePathHero {...pathwayConfigs} />
```

## Accessibility

### WCAG AA Compliance

```tsx
<TriplePathHero
  screenReaderOptimized={true}
  highContrast={false}
  reduceMotion={false}
  onPathSelection={(path) => {
    // Analytics tracking
    gtag('event', 'pathway_selected', {
      event_category: 'accessibility',
      event_label: path
    });
  }}
/>
```

### Keyboard Navigation

The component supports comprehensive keyboard navigation:

- **Arrow Keys**: Navigate between pathways
- **Tab**: Natural tab order through interactive elements  
- **Enter/Space**: Activate pathways and controls
- **Escape**: Close overlays and return to main navigation
- **Home/End**: Jump to first/last pathway

### Screen Reader Support

```tsx
import { useScreenReader } from './utils/accessibility';

function CustomImplementation() {
  const { announce, describeMathematicalContent } = useScreenReader();
  
  const handleMathInteraction = (data) => {
    const description = describeMathematicalContent('spiral', {
      segments: 144,
      activePathway: 'business'
    });
    announce(description);
  };
  
  return <TriplePathHero onSpiralInteraction={handleMathInteraction} />;
}
```

## Performance Optimization

### Device Capability Detection

```tsx
import { detectDeviceCapabilities } from './utils/performance';

function OptimizedLanding() {
  const capabilities = detectDeviceCapabilities();
  
  return (
    <TriplePathHero
      performanceMode={capabilities.recommendedMode}
      enableParallax={!capabilities.isMobile}
      spiralConfig={{
        segments: capabilities.isLowEndDevice ? 72 : 144,
        particleCount: capabilities.cores >= 4 ? 21 : 13
      }}
    />
  );
}
```

### Memory Management

```tsx
import { useMemoryManager } from './utils/performance';

function MemoryOptimizedHero() {
  const memoryManager = useMemoryManager();
  
  useEffect(() => {
    const memoryUsage = memoryManager.getMemoryUsage();
    
    if (memoryUsage > 100) { // MB threshold
      console.warn('High memory usage detected, switching to conservative mode');
    }
  }, []);
  
  return <TriplePathHero performanceMode="conservative" />;
}
```

### Performance Monitoring

```tsx
<TriplePathHero
  onPerformanceMetrics={(metrics) => {
    if (metrics.animationFrameRate < 30) {
      console.warn('Low frame rate detected:', metrics);
    }
    
    // Analytics tracking
    analytics.track('hero_performance', {
      renderTime: metrics.renderTime,
      frameRate: metrics.animationFrameRate,
      memoryUsage: metrics.memoryUsage
    });
  }}
/>
```

## Mathematical Implementation

### Golden Ratio Mathematics

The component implements precise mathematical relationships:

```typescript
const PHI = (1 + Math.sqrt(5)) / 2; // φ ≈ 1.618033988749

// Spiral equation: r = φ^(θ/π)
const spiralEquation = (t: number) => ({
  r: Math.pow(PHI, t / Math.PI),
  theta: t
});

// φ-based spacing and proportions
const goldenSpacing = {
  section: `${PHI}rem`,
  subsection: `${PHI * PHI}rem`,
  element: `${1 / PHI}rem`
};
```

### Mathematical Transformations

Each pathway demonstrates mathematical concept transformations:

```typescript
const transformations = {
  business: [
    {
      concept: 'Zero-Knowledge Proofs',
      application: 'Privacy-First Analytics',
      equation: 'π(x) = y ∧ ¬reveal(x)'
    },
    {
      concept: 'Topological Invariants', 
      application: 'Robust Data Structures',
      equation: 'H₁(X) ≅ Z^b'
    }
  ]
};
```

## Testing

### Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests  
npm run test:integration

# Accessibility tests
npm run test:a11y

# Performance tests
npm run test:performance

# Visual regression tests
npm run test:visual
```

### Performance Benchmarks

The component maintains these performance targets:

- **Initial Render**: < 100ms
- **Animation Frame Rate**: 60fps (desktop), 30fps (mobile)
- **Memory Usage**: < 50MB sustained
- **Bundle Size**: < 200KB gzipped
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)

### Accessibility Compliance

- **WCAG AA**: Full compliance
- **Screen Reader**: Comprehensive support (NVDA, JAWS, VoiceOver)
- **Keyboard Navigation**: Complete implementation
- **Color Contrast**: 4.5:1 minimum ratio
- **Focus Management**: Proper focus trapping and restoration

## Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Mobile Support**: iOS 13+, Android 8+
- **Canvas Support**: Required for spiral animations
- **WebGL**: Optional enhancement for advanced visualizations

## Design System Integration

The component integrates seamlessly with the ZKTheory design system:

```scss
// Uses mathematical design tokens
.triple-path-hero {
  --golden-ratio: 1.618033988749;
  --space-phi: calc(var(--space-base) * var(--golden-ratio));
  --color-mathematical: var(--color-indigo-600);
  --easing-golden: cubic-bezier(0.618, 0, 0.382, 1);
  --transition-phi: calc(var(--duration-base) * var(--golden-ratio));
}
```

## Advanced Usage

### Custom Mathematical Animations

```tsx
import { useAnimationOptimizer } from './utils/performance';

function CustomMathematicalHero() {
  const optimizer = useAnimationOptimizer();
  
  const customSpiralConfig = {
    ...defaultSpiralConfig,
    equation: (t: number) => ({
      r: Math.pow(Math.E, t * 0.1), // Exponential spiral
      theta: t * Math.PI / 4
    })
  };
  
  return (
    <TriplePathHero
      spiralConfig={customSpiralConfig}
      onSpiralInteraction={(event, data) => {
        if (event === 'equation_change') {
          optimizer.requestOptimizedFrame('spiral-update', () => {
            // Custom animation logic
          });
        }
      }}
    />
  );
}
```

### Multi-Language Support

```tsx
const pathwayLabels = {
  en: {
    business: 'Business Leaders',
    technical: 'Technical Developers', 
    academic: 'Academic Researchers'
  },
  es: {
    business: 'Líderes Empresariales',
    technical: 'Desarrolladores Técnicos',
    academic: 'Investigadores Académicos'
  }
};

<TriplePathHero
  pathwayLabels={pathwayLabels[currentLanguage]}
  screenReaderOptimized={true}
/>
```

## Contributing

See [CONTRIBUTING.md](../../../../CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](../../../../LICENSE) for details.

---

**ZKTheory Design System** | Mathematical precision meets practical innovation