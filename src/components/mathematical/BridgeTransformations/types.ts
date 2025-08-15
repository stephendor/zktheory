/**
 * Bridge Transformation Types
 * Core type definitions for mathematical domain transformations
 */

export interface MathematicalDomain {
  id: string;
  name: string;
  displayName: string;
  coordinateSystem: CoordinateSystem;
  visualizationStyle: VisualizationStyle;
}

export interface CoordinateSystem {
  type: 'weierstrass' | 'group-table' | 'simplicial' | 'parametric';
  dimensions: number;
  bounds?: {
    min: number[];
    max: number[];
  };
  units?: string[];
}

export interface VisualizationStyle {
  primaryColor: string;
  secondaryColor: string;
  strokeWidth: number;
  opacity: number;
  renderType: 'svg' | 'canvas' | 'webgl';
}

// Bridge transformation configuration
export interface BridgeTransformation {
  id: string;
  fromDomain: MathematicalDomain;
  toDomain: MathematicalDomain;
  transformationType: TransformationType;
  steps: TransformationStep[];
  duration: number;
  easing: 'linear' | 'golden' | 'fibonacci' | 'harmonic';
}

export type TransformationType = 
  | 'elliptic-to-algebra'
  | 'algebra-to-topology' 
  | 'topology-to-elliptic'
  | 'bidirectional';

export interface TransformationStep {
  id: string;
  name: string;
  description: string;
  mathematicalExpression?: string;
  visualTransition: VisualTransition;
  duration: number;
  delay: number;
}

export interface VisualTransition {
  type: 'morph' | 'fade' | 'scale' | 'rotate' | 'translate' | 'composite';
  properties: TransitionProperties;
  interpolation: InterpolationFunction;
}

export interface TransitionProperties {
  from: {
    position?: [number, number, number?];
    scale?: [number, number, number?];
    rotation?: [number, number, number?];
    opacity?: number;
    color?: string;
    strokeWidth?: number;
  };
  to: {
    position?: [number, number, number?];
    scale?: [number, number, number?];
    rotation?: [number, number, number?];
    opacity?: number;
    color?: string;
    strokeWidth?: number;
  };
}

export type InterpolationFunction = 
  | 'linear'
  | 'bezier'
  | 'catmull-rom'
  | 'mathematical-spline';

// Mathematical domain definitions
export const ELLIPTIC_CURVE_DOMAIN: MathematicalDomain = {
  id: 'elliptic-curves',
  name: 'EllipticCurves',
  displayName: 'Elliptic Curves',
  coordinateSystem: {
    type: 'weierstrass',
    dimensions: 2,
    bounds: {
      min: [-10, -10],
      max: [10, 10]
    },
    units: ['x', 'y']
  },
  visualizationStyle: {
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    strokeWidth: 2,
    opacity: 0.8,
    renderType: 'svg'
  }
};

export const ABSTRACT_ALGEBRA_DOMAIN: MathematicalDomain = {
  id: 'abstract-algebra',
  name: 'AbstractAlgebra',
  displayName: 'Abstract Algebra',
  coordinateSystem: {
    type: 'group-table',
    dimensions: 2,
    bounds: {
      min: [0, 0],
      max: [1, 1]
    },
    units: ['group-element', 'operation']
  },
  visualizationStyle: {
    primaryColor: '#10B981',
    secondaryColor: '#047857',
    strokeWidth: 1,
    opacity: 0.9,
    renderType: 'svg'
  }
};

export const TOPOLOGY_DOMAIN: MathematicalDomain = {
  id: 'topology',
  name: 'Topology',
  displayName: 'Topology',
  coordinateSystem: {
    type: 'simplicial',
    dimensions: 3,
    bounds: {
      min: [-5, -5, -5],
      max: [5, 5, 5]
    },
    units: ['x', 'y', 'z']
  },
  visualizationStyle: {
    primaryColor: '#8B5CF6',
    secondaryColor: '#6D28D9',
    strokeWidth: 1.5,
    opacity: 0.7,
    renderType: 'webgl'
  }
};

// Bridge transformation state
export interface BridgeTransformationState {
  currentTransformation: BridgeTransformation | null;
  currentStep: number;
  isAnimating: boolean;
  progress: number;
  direction: 'forward' | 'reverse';
  speed: number;
  isPaused: boolean;
}

// Animation control interface
export interface BridgeAnimationControls {
  play: () => void;
  pause: () => void;
  stop: () => void;
  reset: () => void;
  goToStep: (stepIndex: number) => void;
  setSpeed: (speed: number) => void;
  reverse: () => void;
  getCurrentState: () => BridgeTransformationState;
}

// Mathematical transformation functions
export interface MathematicalTransformFunction {
  (input: MathematicalPoint): MathematicalPoint;
}

export interface MathematicalPoint {
  coordinates: number[];
  domain: MathematicalDomain;
  properties?: Record<string, any>;
  metadata?: {
    label?: string;
    description?: string;
    mathematicalSignificance?: string;
  };
}

// Bridge sequence definition
export interface BridgeSequence {
  id: string;
  name: string;
  description: string;
  transformations: BridgeTransformation[];
  totalDuration: number;
  isLoop: boolean;
}

// Predefined sequences
export const COMPLETE_BRIDGE_SEQUENCE: BridgeSequence = {
  id: 'complete-mathematical-bridge',
  name: 'Complete Mathematical Bridge',
  description: 'Full transformation cycle through elliptic curves, abstract algebra, and topology',
  transformations: [], // Will be populated by components
  totalDuration: 15000, // 15 seconds
  isLoop: true
};
