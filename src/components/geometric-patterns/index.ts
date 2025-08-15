/**
 * Geometric Patterns Library - Main Index
 * 
 * Comprehensive geometric pattern library for mathematical visualizations.
 * Exports all components, hooks, utilities, and types for seamless integration.
 */

// ==========================================
// Core Components
// ==========================================

export { default as PenroseBackground } from './components/PenroseBackground';
export { default as VoronoiDivider } from './components/VoronoiDivider';
export { default as HexGrid } from './components/HexGrid';
export { default as AlgebraicCurve } from './components/AlgebraicCurve';

// ==========================================
// Hooks
// ==========================================

export { 
  usePatternAnimation,
  usePatternSequence,
  useSpiralAnimation,
  useCurveMorphing
} from './hooks/usePatternAnimation';

export { 
  useComplexityLevel,
  useAdaptiveComplexity
} from './hooks/useComplexityLevel';

// ==========================================
// Core Algorithms & Generators
// ==========================================

export { 
  PenroseTilingGenerator,
  VoronoiGenerator,
  HexGridGenerator,
  AlgebraicCurveGenerator,
  PatternUtils,
  PHI
} from './core/PatternGenerator';

// ==========================================
// Type Definitions
// ==========================================

export type {
  // Base Pattern Types
  BasePatternProps,
  PatternDimensions,
  PatternAnimationConfig,
  PatternPerformanceMetrics,
  PatternInteractionState,
  PatternExportOptions,
  PatternMetadata,
  
  // Pattern-Specific Props
  PenrosePatternProps,
  VoronoiPatternProps,
  HexGridPatternProps,
  AlgebraicCurveProps,
  
  // Mathematical Types
  PenroseTile,
  VoronoiCell,
  HexagonTile,
  CurveParameters,
  
  // Enums and Unions
  ComplexityLevel,
  AudienceType,
  PerformanceLevel,
  CurveType,
  
  // Color and Style Types
  PatternColorScheme,
  AudienceColorSchemes,
  
  // Animation Types
  AnimationSequence,
  AnimationKeyframe,
  
  // Hook Return Types
  UsePatternAnimationReturn,
  UseComplexityLevelReturn,
  
  // Utility Types
  Point2D,
  Point3D,
  Vector2D,
  Vector3D,
  BoundingBox,
  PatternBounds,
  RGBA
} from './types/patterns';

// ==========================================
// Utility Functions
// ==========================================

export const GeometricPatternUtils = {
  /**
   * Calculate optimal pattern density based on viewport and performance
   */
  calculateOptimalDensity: (
    bounds: { x: number; y: number; width: number; height: number },
    baseCount: number,
    performance: 'battery' | 'balanced' | 'performance' = 'balanced'
  ) => {
    const area = bounds.width * bounds.height;
    const baseArea = 800 * 600;
    const areaRatio = area / baseArea;
    
    const performanceMultipliers = {
      battery: 0.5,
      balanced: 1.0,
      performance: 2.0
    };
    
    return Math.floor(baseCount * Math.sqrt(areaRatio) * performanceMultipliers[performance]);
  },

  /**
   * Convert between different coordinate systems
   */
  screenToPatternCoords: (
    screenPoint: [number, number],
    bounds: { x: number; y: number; width: number; height: number },
    patternBounds: { minX: number; maxX: number; minY: number; maxY: number }
  ): [number, number] => {
    const scaleX = (patternBounds.maxX - patternBounds.minX) / bounds.width;
    const scaleY = (patternBounds.maxY - patternBounds.minY) / bounds.height;
    
    return [
      patternBounds.minX + (screenPoint[0] - bounds.x) * scaleX,
      patternBounds.minY + (screenPoint[1] - bounds.y) * scaleY
    ];
  },

  /**
   * Mathematical color interpolation with easing
   */
  interpolateColor: (
    color1: string,
    color2: string,
    t: number,
    easing: 'linear' | 'golden' | 'fibonacci' = 'golden'
  ): string => {
    const PHI = (1 + Math.sqrt(5)) / 2;
    
    let easedT = t;
    switch (easing) {
      case 'golden':
        easedT = t * PHI - Math.floor(t * PHI);
        break;
      case 'fibonacci':
        easedT = Math.sin(t * Math.PI / 2);
        break;
      default:
        easedT = t;
    }
    
    // Convert hex colors to RGB for interpolation
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return color1;
    
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * easedT);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * easedT);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * easedT);
    
    return `rgb(${r}, ${g}, ${b})`;
  },

  /**
   * Generate mathematical sequences
   */
  generateFibonacci: (count: number): number[] => {
    const sequence = [0, 1];
    for (let i = 2; i < count; i++) {
      sequence[i] = sequence[i - 1] + sequence[i - 2];
    }
    return sequence.slice(0, count);
  },

  /**
   * Golden ratio calculations
   */
  phi: (1 + Math.sqrt(5)) / 2,
  phiInverse: 2 / (1 + Math.sqrt(5)),
  phiSquared: Math.pow((1 + Math.sqrt(5)) / 2, 2),

  /**
   * Mathematical easing functions
   */
  easing: {
    golden: (t: number) => {
      const PHI = (1 + Math.sqrt(5)) / 2;
      if (t < 0.5) {
        return 2 * t * t * PHI / (PHI + 1);
      } else {
        return 1 - Math.pow(-2 * t + 2, 2) / 2;
      }
    },
    fibonacci: (t: number) => Math.sin(t * Math.PI / 2),
    harmonic: (t: number) => 1 - Math.cos(t * Math.PI / 2),
    exponential: (t: number) => {
      const PHI = (1 + Math.sqrt(5)) / 2;
      return t === 0 ? 0 : Math.pow(PHI, 10 * (t - 1));
    }
  }
};

// ==========================================
// Constants
// ==========================================

export const GEOMETRIC_PATTERN_CONSTANTS = {
  PHI: (1 + Math.sqrt(5)) / 2,
  PHI_INVERSE: 2 / (1 + Math.sqrt(5)),
  TWO_PI: 2 * Math.PI,
  SQRT_3: Math.sqrt(3),
  
  // Default color schemes for each audience
  DEFAULT_COLORS: {
    business: {
      primary: '#2563eb',
      secondary: '#f59e0b',
      accent: '#10b981',
      background: '#f8fafc',
      stroke: '#e2e8f0',
      highlight: '#fbbf24'
    },
    technical: {
      primary: '#0f172a',
      secondary: '#06b6d4',
      accent: '#8b5cf6',
      background: '#020617',
      stroke: '#334155',
      highlight: '#06ffa5'
    },
    academic: {
      primary: '#7c3aed',
      secondary: '#059669',
      accent: '#dc2626',
      background: '#fefbff',
      stroke: '#d1d5db',
      highlight: '#f59e0b'
    }
  },
  
  // Performance thresholds
  PERFORMANCE: {
    RENDER_TIME_THRESHOLD: 50, // ms
    MIN_FPS: 30,
    MAX_ELEMENTS: {
      battery: 500,
      balanced: 2000,
      performance: 5000
    }
  },
  
  // Complexity limits
  COMPLEXITY: {
    beginner: { maxElements: 100, maxGenerations: 3 },
    intermediate: { maxElements: 500, maxGenerations: 5 },
    advanced: { maxElements: 2000, maxGenerations: 7 },
    expert: { maxElements: 5000, maxGenerations: 9 },
    research: { maxElements: 10000, maxGenerations: 12 }
  }
};

// ==========================================
// Version Information
// ==========================================

export const GEOMETRIC_PATTERN_VERSION = '1.0.0';
export const GEOMETRIC_PATTERN_BUILD = new Date().toISOString();

// ==========================================
// Library Documentation
// ==========================================

export const LIBRARY_INFO = {
  name: 'ZK Theory Geometric Patterns',
  version: GEOMETRIC_PATTERN_VERSION,
  description: 'Advanced geometric pattern library for mathematical visualizations',
  features: [
    'Penrose tiling backgrounds with φ-based proportions',
    'Voronoi diagram dividers for spatial relationships',
    'Interactive hexagonal grids with circuit aesthetics',
    'Parametric algebraic curves for mathematical elegance',
    'Triple-audience visual language (Business/Technical/Academic)',
    'Progressive complexity indicators',
    'High-performance rendering with WebGL optimization',
    'Mathematical animation system with golden ratio easing',
    'Export capabilities (PNG/SVG/PDF)',
    'Accessibility compliance (WCAG AA)',
    'TypeScript support with comprehensive type definitions'
  ],
  dependencies: [
    'React 19+',
    'Framer Motion 12+',
    'Tailwind CSS 3+',
    'Canvas API (built-in)'
  ],
  performance: {
    targetLighthouseScore: 95,
    maxRenderTime: '50ms',
    minFrameRate: '30fps',
    memoryOptimized: true
  }
};