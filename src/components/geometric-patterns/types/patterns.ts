/**
 * Geometric Pattern Library - Type Definitions
 * 
 * Comprehensive TypeScript interfaces for the mathematical geometric pattern system.
 * Integrates with existing mathematical design tokens and visualization architecture.
 */

import { CSSProperties } from 'react';

// ==========================================
// Base Pattern Interfaces
// ==========================================

export interface BasePatternProps {
  className?: string;
  style?: CSSProperties;
  animate?: boolean;
  complexity?: ComplexityLevel;
  audience?: AudienceType;
  performance?: PerformanceLevel;
  onPatternComplete?: () => void;
  onPerformanceUpdate?: (metrics: PatternPerformanceMetrics) => void;
}

export interface PatternDimensions {
  width: number;
  height: number;
  scaleFactor?: number;
  aspectRatio?: 'golden' | 'square' | 'widescreen' | number;
}

export interface PatternAnimationConfig {
  duration?: number;
  easing?: 'golden' | 'fibonacci' | 'harmonic' | 'exponential';
  delay?: number;
  repeat?: boolean | number;
  reverse?: boolean;
  onComplete?: () => void;
}

// ==========================================
// Pattern-Specific Interfaces
// ==========================================

export interface PenrosePatternProps extends BasePatternProps {
  tileSize?: number;
  generations?: number;
  colorScheme?: 'mathematical' | 'business' | 'technical' | 'academic';
  showDeflation?: boolean;
  interactiveZoom?: boolean;
  density?: 'sparse' | 'medium' | 'dense';
  goldenRatio?: boolean;
  exportable?: boolean;
}

export interface VoronoiPatternProps extends BasePatternProps {
  pointCount?: number;
  seedPattern?: 'random' | 'fibonacci' | 'golden-spiral' | 'grid';
  relaxationIterations?: number;
  showPoints?: boolean;
  showEdges?: boolean;
  colorMode?: 'gradient' | 'categorical' | 'distance' | 'mathematical';
  interactive?: boolean;
  animateGrowth?: boolean;
}

export interface HexGridPatternProps extends BasePatternProps {
  hexSize?: number;
  spacing?: number;
  layers?: number;
  pattern?: 'regular' | 'circuit' | 'honeycomb' | 'mathematical';
  highlightPaths?: boolean;
  interactiveHover?: boolean;
  circuitAnimation?: boolean;
  dataFlow?: boolean;
}

export interface AlgebraicCurveProps extends BasePatternProps {
  curveType?: CurveType;
  parameters?: CurveParameters;
  resolution?: number;
  strokeWidth?: number;
  showGrid?: boolean;
  showEquation?: boolean;
  parametricRange?: [number, number];
  animateTrace?: boolean;
}

// ==========================================
// Enums and Union Types
// ==========================================

export type ComplexityLevel = 
  | 'beginner'     // 🌱 Simple geometric shapes
  | 'intermediate' // 🌿 Interconnected patterns  
  | 'advanced'     // 🌳 Complex mathematical structures
  | 'expert'       // 🏔️ Research-level visualizations
  | 'research';    // 🎓 Cutting-edge mathematical concepts

export type AudienceType = 
  | 'business'     // Clean forms, trust indicators, ROI visualizations
  | 'technical'    // Circuit patterns, code integration, implementation flows
  | 'academic';    // Theorem aesthetics, proof visualizations, research elements

export type PerformanceLevel = 
  | 'battery'      // Minimal animations, simple patterns
  | 'balanced'     // Standard quality, moderate complexity
  | 'performance'; // High quality, maximum complexity

export type CurveType =
  | 'lemniscate'      // Figure-8 curves
  | 'cassini-oval'    // Cassini ovals
  | 'cardioid'        // Heart-shaped curves
  | 'rose'            // Rose curves
  | 'spiral'          // Various spiral types
  | 'cycloid'         // Cycloid family
  | 'parametric'      // Custom parametric curves
  | 'bezier'          // Bezier curves
  | 'spline';         // Spline curves

// ==========================================
// Mathematical Configuration
// ==========================================

export interface CurveParameters {
  a?: number;      // Primary parameter
  b?: number;      // Secondary parameter  
  c?: number;      // Tertiary parameter
  n?: number;      // Integer parameter (for rose curves, etc.)
  t_min?: number;  // Parametric range minimum
  t_max?: number;  // Parametric range maximum
  custom?: {       // Custom parametric equations
    x: (t: number, params: any) => number;
    y: (t: number, params: any) => number;
  };
}

export interface PenroseTile {
  type: 'kite' | 'dart';
  vertices: [number, number][];
  generation: number;
  phi_angle: number;
  id: string;
}

export interface VoronoiCell {
  site: [number, number];
  vertices: [number, number][];
  neighbors: string[];
  area: number;
  centroid: [number, number];
  id: string;
}

export interface HexagonTile {
  center: [number, number];
  vertices: [number, number][];
  neighbors: string[];
  layer: number;
  active: boolean;
  id: string;
}

// ==========================================
// Color and Style Configuration
// ==========================================

export interface PatternColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  stroke: string;
  highlight: string;
  gradient?: {
    start: string;
    end: string;
    direction: number; // degrees
  };
}

export interface AudienceColorSchemes {
  business: PatternColorScheme;
  technical: PatternColorScheme;
  academic: PatternColorScheme;
}

// ==========================================
// Performance and Analytics
// ==========================================

export interface PatternPerformanceMetrics {
  renderTime: number;           // Total render time in ms
  frameRate: number;           // Current FPS
  patternComplexity: number;   // Computed complexity score
  elementCount: number;        // Number of pattern elements
  memoryUsage?: number;        // Memory usage in MB
  canvasSize: {                // Canvas dimensions
    width: number;
    height: number;
  };
  timestamp: number;           // Performance measurement timestamp
}

export interface OptimizationSettings {
  levelOfDetail: boolean;      // Use LOD for distant elements
  culling: boolean;           // Cull off-screen elements
  batching: boolean;          // Batch similar elements
  caching: boolean;           // Cache computed patterns
  adaptiveQuality: boolean;   // Adjust quality based on performance
  maxElements: number;        // Maximum pattern elements
}

// ==========================================
// Animation and Interaction
// ==========================================

export interface PatternInteractionState {
  isHovered: boolean;
  isClicked: boolean;
  isFocused: boolean;
  hoveredElement?: string;
  clickedElement?: string;
  zoomLevel: number;
  panOffset: [number, number];
}

export interface AnimationSequence {
  name: string;
  keyframes: AnimationKeyframe[];
  duration: number;
  easing: string;
  loop?: boolean;
}

export interface AnimationKeyframe {
  time: number;        // 0-1 normalized time
  properties: {
    opacity?: number;
    scale?: number;
    rotation?: number;
    translation?: [number, number];
    color?: string;
    strokeWidth?: number;
  };
}

// ==========================================
// Export and Sharing
// ==========================================

export interface PatternExportOptions {
  format: 'png' | 'svg' | 'pdf' | 'json';
  quality?: number;        // For raster formats
  scale?: number;          // Export scale multiplier
  background?: string;     // Background color
  transparent?: boolean;   // Transparent background
  metadata?: boolean;      // Include pattern metadata
}

export interface PatternMetadata {
  name: string;
  type: string;
  complexity: ComplexityLevel;
  audience: AudienceType;
  parameters: Record<string, any>;
  generated: Date;
  version: string;
  author?: string;
}

// ==========================================
// Hook Return Types
// ==========================================

export interface UsePatternAnimationReturn {
  isAnimating: boolean;
  progress: number;
  currentKeyframe: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  restart: () => void;
  setProgress: (progress: number) => void;
}

export interface UseComplexityLevelReturn {
  currentLevel: ComplexityLevel;
  setLevel: (level: ComplexityLevel) => void;
  canIncrease: boolean;
  canDecrease: boolean;
  increaseLevel: () => void;
  decreaseLevel: () => void;
  getLevelIcon: (level?: ComplexityLevel) => string;
  getLevelDescription: (level?: ComplexityLevel) => string;
}

// ==========================================
// Context Types
// ==========================================

export interface GeometricPatternContextType {
  globalComplexity: ComplexityLevel;
  globalAudience: AudienceType;
  globalPerformance: PerformanceLevel;
  colorSchemes: AudienceColorSchemes;
  optimizationSettings: OptimizationSettings;
  setGlobalComplexity: (level: ComplexityLevel) => void;
  setGlobalAudience: (audience: AudienceType) => void;
  setGlobalPerformance: (level: PerformanceLevel) => void;
  updateOptimizationSettings: (settings: Partial<OptimizationSettings>) => void;
}

// ==========================================
// Utility Types
// ==========================================

export type Point2D = [number, number];
export type Point3D = [number, number, number];
export type Vector2D = [number, number];
export type Vector3D = [number, number, number];
export type Matrix2D = [number, number, number, number];
export type RGBA = [number, number, number, number];

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PatternBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}