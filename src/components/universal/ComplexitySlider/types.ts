/**
 * TypeScript Types for Universal ComplexitySlider System
 * Comprehensive type definitions for mathematical complexity progression
 * with golden ratio-based calculations and accessibility features
 */

// ==========================================
// Mathematical Constants
// ==========================================

export const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2; // φ ≈ 1.618
export const FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89] as const;

// ==========================================
// Core Types
// ==========================================

export type ComplexityLevelId = 'foundation' | 'conceptual' | 'applied' | 'research';
export type ComplexityEmoji = '🌱' | '🌿' | '🌳' | '🎓';
export type ComplexityValue = 0 | 1 | 2 | 3;

export interface ComplexityLevel {
  /** Unique identifier for the complexity level */
  id: ComplexityLevelId;
  
  /** Visual emoji indicator */
  emoji: ComplexityEmoji;
  
  /** Human-readable label */
  label: string;
  
  /** Numerical value (0-3) */
  value: ComplexityValue;
  
  /** Mathematical complexity using golden ratio */
  mathComplexity: number;
  
  /** Description of what this level covers */
  description: string;
  
  /** Required mathematical background */
  mathLevel: string;
  
  /** Estimated time to complete content at this level */
  estimatedTime: string;
  
  /** Color theme for visual consistency */
  color: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
  };
  
  /** Prerequisites that must be completed */
  prerequisites: ComplexityLevelId[];
  
  /** Fibonacci index for spacing calculations */
  fibonacciIndex: number;
  
  /** Learning objectives for this level */
  objectives: string[];
  
  /** Difficulty rating (1-10) */
  difficulty: number;
}

// ==========================================
// Context State Types
// ==========================================

export interface ComplexityState {
  /** Currently selected complexity level */
  currentLevel: ComplexityLevel;
  
  /** Available complexity levels */
  availableLevels: ComplexityLevel[];
  
  /** Levels that have been unlocked/completed */
  unlockedLevels: ComplexityLevelId[];
  
  /** User's progress through each level */
  progress: Record<ComplexityLevelId, number>;
  
  /** User preferences */
  preferences: ComplexityPreferences;
  
  /** Session tracking */
  session: {
    startTime: number;
    timeSpentPerLevel: Record<ComplexityLevelId, number>;
    interactions: ComplexityInteraction[];
  };
}

export interface ComplexityPreferences {
  /** Remember last selected level */
  rememberLastLevel: boolean;
  
  /** Auto-advance when prerequisites are met */
  autoAdvance: boolean;
  
  /** Show detailed mathematical explanations */
  showMathDetails: boolean;
  
  /** Show time estimates */
  showTimeEstimates: boolean;
  
  /** Show prerequisite warnings */
  showPrerequisiteWarnings: boolean;
  
  /** Preferred animation speed */
  animationSpeed: 'slow' | 'normal' | 'fast' | 'none';
  
  /** High contrast mode */
  highContrast: boolean;
  
  /** Reduced motion */
  reducedMotion: boolean;
}

export interface ComplexityInteraction {
  /** Timestamp of interaction */
  timestamp: number;
  
  /** Type of interaction */
  type: 'level_change' | 'preview' | 'prerequisite_check' | 'help_view' | 'settings_change';
  
  /** Source level */
  fromLevel?: ComplexityLevelId;
  
  /** Target level */
  toLevel?: ComplexityLevelId;
  
  /** Additional context */
  context?: Record<string, unknown>;
}

// ==========================================
// Component Props Types
// ==========================================

export interface ComplexitySliderProps {
  /** Initial complexity level */
  initialLevel?: ComplexityLevelId;
  
  /** Callback when level changes */
  onLevelChange?: (level: ComplexityLevel, previousLevel: ComplexityLevel) => void;
  
  /** Callback when prerequisites are checked */
  onPrerequisiteCheck?: (level: ComplexityLevel, missingPrereqs: ComplexityLevelId[]) => void;
  
  /** Callback for interaction tracking */
  onInteraction?: (interaction: ComplexityInteraction) => void;
  
  /** Visual configuration */
  appearance: {
    orientation?: 'horizontal' | 'vertical';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    theme?: 'light' | 'dark' | 'auto';
    showLabels?: boolean;
    showTooltips?: boolean;
    showProgress?: boolean;
    compactMode?: boolean;
  };
  
  /** Behavior configuration */
  behavior: {
    allowJumping?: boolean;
    requirePrerequisites?: boolean;
    enablePreview?: boolean;
    persistSelection?: boolean;
    keyboardNavigation?: boolean;
  };
  
  /** Accessibility configuration */
  accessibility: {
    ariaLabel?: string;
    ariaDescription?: string;
    announceChanges?: boolean;
    keyboardInstructions?: boolean;
    screenReaderOptimized?: boolean;
  };
  
  /** Style overrides */
  className?: string;
  style?: React.CSSProperties;
  
  /** Disable the component */
  disabled?: boolean;
}

export interface ComplexityIndicatorProps {
  /** The complexity level to display */
  level: ComplexityLevel;
  
  /** Whether this level is currently selected */
  isSelected: boolean;
  
  /** Whether this level is being hovered */
  isHovered: boolean;
  
  /** Whether this level is unlocked */
  isUnlocked: boolean;
  
  /** Click handler */
  onClick: (level: ComplexityLevel) => void;
  
  /** Mouse enter handler */
  onMouseEnter: (level: ComplexityLevel) => void;
  
  /** Mouse leave handler */
  onMouseLeave: () => void;
  
  /** Size variant */
  size: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Show progress indicator */
  showProgress?: boolean;
  
  /** Progress value (0-1) */
  progress?: number;
  
  /** Additional CSS classes */
  className?: string;
}

export interface ComplexityTooltipProps {
  /** The complexity level being shown */
  level: ComplexityLevel;
  
  /** Whether to show the tooltip */
  show: boolean;
  
  /** Position of the tooltip */
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  
  /** Additional content sections to show */
  sections: {
    showDescription?: boolean;
    showMathLevel?: boolean;
    showTimeEstimate?: boolean;
    showPrerequisites?: boolean;
    showObjectives?: boolean;
    showDifficulty?: boolean;
  };
  
  /** Custom content */
  customContent?: React.ReactNode;
  
  /** Additional CSS classes */
  className?: string;
}

// ==========================================
// Context Types
// ==========================================

export interface ComplexityContextValue {
  /** Current state */
  state: ComplexityState;
  
  /** Actions */
  actions: {
    setLevel: (level: ComplexityLevelId) => void;
    advanceLevel: () => void;
    resetProgress: () => void;
    updatePreferences: (preferences: Partial<ComplexityPreferences>) => void;
    markLevelComplete: (level: ComplexityLevelId) => void;
    trackInteraction: (interaction: Omit<ComplexityInteraction, 'timestamp'>) => void;
  };
  
  /** Computed values */
  computed: {
    canAdvance: boolean;
    canGoBack: boolean;
    nextLevel: ComplexityLevel | null;
    previousLevel: ComplexityLevel | null;
    totalProgress: number;
    isLevelUnlocked: (level: ComplexityLevelId) => boolean;
    getMissingPrerequisites: (level: ComplexityLevelId) => ComplexityLevelId[];
    getTimeSpent: (level?: ComplexityLevelId) => number;
  };
}

export interface ComplexityProviderProps {
  /** Child components */
  children: React.ReactNode;
  
  /** Initial state configuration */
  initialState?: Partial<ComplexityState>;
  
  /** Custom complexity levels */
  customLevels?: ComplexityLevel[];
  
  /** Persistence configuration */
  persistence?: {
    enabled: boolean;
    storageKey?: string;
    version?: string;
  };
  
  /** Analytics configuration */
  analytics?: {
    enabled: boolean;
    trackProgress?: boolean;
    trackInteractions?: boolean;
    trackPerformance?: boolean;
  };
  
  /** Event handlers */
  onStateChange?: (state: ComplexityState) => void;
  onLevelChange?: (newLevel: ComplexityLevel, oldLevel: ComplexityLevel) => void;
  onProgressUpdate?: (level: ComplexityLevelId, progress: number) => void;
}

// ==========================================
// Hook Return Types
// ==========================================

export interface UseComplexityReturn extends ComplexityContextValue {
  /** Convenience methods */
  utils: {
    getLevelById: (id: ComplexityLevelId) => ComplexityLevel | undefined;
    getLevelByValue: (value: ComplexityValue) => ComplexityLevel | undefined;
    formatTime: (milliseconds: number) => string;
    calculateMathComplexity: (level: ComplexityValue) => number;
    getFibonacciSpacing: (index: number) => number;
    getGoldenRatioPosition: (level: ComplexityLevel, maxValue: number) => number;
  };
  
  /** Animation helpers */
  animations: {
    getTransitionDuration: (fromLevel: ComplexityValue, toLevel: ComplexityValue) => number;
    getStaggerDelay: (index: number) => number;
    getEasingFunction: (complexity: number) => string;
  };
  
  /** Additional utility methods */
  generatePattern: (type?: GeometricPattern['type']) => GeometricPattern;
  getViewportPositions: (containerWidth: number, containerHeight: number, orientation?: 'horizontal' | 'vertical') => Record<ComplexityLevelId, { x: number; y: number }>;
  validateLevelAccess: (levelId: ComplexityLevelId) => { isValid: boolean; missingPrerequisites: ComplexityLevelId[]; reason: string };
  getLearningAnalytics: () => { efficiency: number; optimalPath: boolean; suggestions: string[] };
}

// ==========================================
// Mathematical Calculation Types
// ==========================================

export interface MathematicalPosition {
  /** X coordinate (0-1) */
  x: number;
  
  /** Y coordinate (0-1) */
  y: number;
  
  /** Rotation angle in degrees */
  rotation: number;
  
  /** Scale factor */
  scale: number;
}

export interface GeometricPattern {
  /** Pattern type */
  type: 'spiral' | 'grid' | 'radial' | 'fibonacci';
  
  /** Pattern parameters */
  parameters: {
    segments: number;
    radius: number;
    spacing: number;
    rotation: number;
  };
  
  /** Generated points */
  points: MathematicalPosition[];
}

// ==========================================
// Performance Types
// ==========================================

export interface PerformanceMetrics {
  /** Rendering performance */
  renderTime: number;
  
  /** Animation performance */
  animationFrameRate: number;
  
  /** Memory usage */
  memoryUsage: number;
  
  /** Interaction latency */
  interactionLatency: number;
  
  /** Cache efficiency */
  cacheHitRate: number;
}

export interface PerformanceThresholds {
  /** Maximum acceptable render time (ms) */
  maxRenderTime: number;
  
  /** Minimum acceptable frame rate (fps) */
  minFrameRate: number;
  
  /** Maximum acceptable memory usage (MB) */
  maxMemoryUsage: number;
  
  /** Maximum acceptable interaction latency (ms) */
  maxInteractionLatency: number;
}

// ==========================================
// Error Types
// ==========================================

export class ComplexityError extends Error {
  constructor(
    message: string,
    public code: string,
    public level?: ComplexityLevelId,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ComplexityError';
  }
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

// ==========================================
// Storage Types
// ==========================================

export interface StorageData {
  version: string;
  timestamp: number;
  state: ComplexityState;
  checksum: string;
}

export interface MigrationScript {
  fromVersion: string;
  toVersion: string;
  migrate: (oldData: unknown) => StorageData;
}

// ==========================================
// Export All Types
// ==========================================

// All types are already exported above