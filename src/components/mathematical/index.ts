// Mathematical Design System Components
// Core mathematical interface components for the zktheory platform

// Mathematical Input Components
export { 
  MathInput, 
  FormulaInput, 
  ParameterInput, 
  MatrixInput, 
  VectorInput 
} from './MathInput';
export type { MathInputProps } from './MathInput';

// Mathematical Display Components
export {
  MathDisplay,
  TheoremBlock,
  ProofBlock,
  DefinitionBlock,
  FormulaDisplay
} from './MathDisplay';
export type { MathDisplayProps, MathBlockProps } from './MathDisplay';

// Mathematical Button Components
export {
  MathButton,
} from './MathButton';
export type { MathButtonProps } from './MathButton';

// Mathematical Workspace Components
export {
  MathWorkspace,
  MathPanel,
  MathToolbar
} from './MathWorkspace';
export type { 
  MathWorkspaceProps, 
  MathPanelProps, 
  MathToolbarProps 
} from './MathWorkspace';

// ==========================================
// Mathematical Bridge and Concept Systems
// ==========================================

// Bridge Transformations (Task 7.1)
export { 
  EllipticCurveToAlgebraTransform,
  AlgebraToTopologyTransform,
  TopologyToEllipticTransform,
  UnifiedBridgeOrchestrator
} from './BridgeTransformations';

// Concept Mapping Interface (Task 7.2)
export {
  MathematicalConceptGraph,
  ConceptMappingExample,
  ConceptForceSimulation
} from './ConceptMapping';

// Cross-Task Integration (Task 7.3)
export { IntegratedMathematicalBridge } from './Integration/IntegratedMathematicalBridge';

// Mathematical Visualization Components
export {
  MathVisualization,
  MathChart
} from './MathVisualization';
export type { 
  MathVisualizationProps, 
  MathChartProps, 
  PerformanceMetrics 
} from './MathVisualization';

// ==========================================
// Geometric Pattern Library
// ==========================================

// Core Geometric Pattern Components
export {
  PenroseBackground,
  VoronoiDivider,
  HexGrid,
  AlgebraicCurve
} from '../geometric-patterns';

// Pattern Generators and Utilities
export {
  PenroseTilingGenerator,
  VoronoiGenerator,
  HexGridGenerator,
  AlgebraicCurveGenerator,
  PatternUtils,
  GeometricPatternUtils,
  PHI,
  GEOMETRIC_PATTERN_CONSTANTS
} from '../geometric-patterns';

// Pattern Hooks
export {
  usePatternAnimation,
  usePatternSequence,
  useSpiralAnimation,
  useCurveMorphing,
  useComplexityLevel,
  useAdaptiveComplexity
} from '../geometric-patterns';

// Pattern Types
export type {
  // Base Pattern Types
  BasePatternProps,
  PatternDimensions,
  PatternAnimationConfig,
  PatternPerformanceMetrics,
  PatternExportOptions,
  
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
  
  // Enums and Configuration
  ComplexityLevel,
  AudienceType,
  PerformanceLevel,
  CurveType,
  PatternColorScheme,
  AudienceColorSchemes,
  
  // Animation and Interaction
  AnimationSequence,
  PatternInteractionState,
  UsePatternAnimationReturn,
  UseComplexityLevelReturn,
  
  // Utility Types
  Point2D,
  Point3D,
  BoundingBox,
  PatternBounds
} from '../geometric-patterns';

// ==========================================
// Examples and Showcases
// ==========================================

export { default as GeometricPatternShowcase } from '../geometric-patterns/examples/GeometricPatternShowcase';

