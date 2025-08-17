/**
 * Types for LearnPathRouter Component
 * Progressive Educational Pathways Type Definitions
 */

// ==========================================
// Core Types
// ==========================================

export interface ComplexityLevel {
  id: string;
  label: string;
  description: string;
  icon?: string;
  color?: string;
}

export interface AudiencePath {
  id: 'business' | 'technical' | 'academic';
  label: string;
  description: string;
  icon: string;
  color: 'business' | 'technical' | 'academic';
  complexityRange: string[];
  focusAreas: string[];
  timeCommitment: 'flexible' | 'structured' | 'deep-dive';
}

export type LearningStage = 'exploration' | 'foundation' | 'conceptual' | 'applied' | 'advanced' | 'research' | 'completion';

// ==========================================
// Configuration Types
// ==========================================

export interface BusinessConfig {
  focusAreas?: string[];
  complexityRange?: string[];
  timeCommitment?: 'flexible' | 'structured' | 'deep-dive';
  roiCalculatorEnabled?: boolean;
  trustIndicators?: string[];
  caseStudies?: string[];
}

export interface TechnicalConfig {
  focusAreas?: string[];
  complexityRange?: string[];
  timeCommitment?: 'flexible' | 'structured' | 'deep-dive';
  playgroundEnabled?: boolean;
  githubRepoUrl?: string;
  codeExamples?: string[];
}

export interface AcademicConfig {
  focusAreas?: string[];
  complexityRange?: string[];
  timeCommitment?: 'flexible' | 'structured' | 'deep-dive';
  collaborationEnabled?: boolean;
  researchPortalUrl?: string;
  papers?: string[];
}

// ==========================================
// Component Props
// ==========================================

export interface LearnPathRouterProps {
  enableProgressiveDisclosure?: boolean;
  showComplexityIndicators?: boolean;
  enablePathTransitions?: boolean;
  performanceMode?: 'high' | 'balanced' | 'conservative';
  accessibilityOptimized?: boolean;
  businessConfig?: BusinessConfig;
  technicalConfig?: TechnicalConfig;
  academicConfig?: AcademicConfig;
  className?: string;
  onPathSelection?: (path: AudiencePath) => void;
  onComplexityChange?: (complexity: ComplexityLevel) => void;
  onLearningProgress?: (stage: LearningStage, progress: number) => void;
}

// ==========================================
// Learning Path Component Props
// ==========================================

export interface LearningPathProps {
  complexity: ComplexityLevel;
  config?: BusinessConfig | TechnicalConfig | AcademicConfig;
  onProgress: (stage: LearningStage, progress: number) => void;
  className?: string;
}

// ==========================================
// Complexity Indicator Props
// ==========================================

export interface ComplexityIndicatorProps {
  currentComplexity: ComplexityLevel;
  availableLevels: string[];
  allLevels: ComplexityLevel[];
  onComplexityChange: (complexity: ComplexityLevel) => void;
  className?: string;
}

// ==========================================
// Learning Progress Props
// ==========================================

export interface LearningProgressProps {
  stage: LearningStage;
  path: AudiencePath;
  complexity: ComplexityLevel;
  onProgressUpdate: (stage: LearningStage, progress: number) => void;
  className?: string;
}

// ==========================================
// Path Transition Props
// ==========================================

export interface PathTransitionProps {
  fromPath: AudiencePath | null;
  toPath: AudiencePath | null;
  onTransitionComplete: () => void;
  className?: string;
}

// ==========================================
// Analytics and Performance Types
// ==========================================

export interface LearningMetrics {
  pathSelectionTime: number;
  complexityProgression: string[];
  timeSpentPerLevel: Record<string, number>;
  completionRate: number;
  userSatisfaction: number;
}

export interface PerformanceMetrics {
  renderTime: number;
  animationFrameRate: number;
  memoryUsage: number;
  interactionLatency: number;
  complexityTransitionTime: number;
  pathSelectionResponsiveness: number;
  timestamp: number;
}

// ==========================================
// Accessibility Types
// ==========================================

export interface AccessibilityConfig {
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
  focusManagement: boolean;
}

// ==========================================
// Responsive Design Types
// ==========================================

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  largeDesktop: number;
  ultrawide: number;
}

export interface ResponsiveConfig {
  breakpoints: ResponsiveBreakpoints;
  mobileFirst: boolean;
  touchOptimized: boolean;
  gestureSupport: boolean;
}

// ==========================================
// Animation and Transition Types
// ==========================================

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay: number;
  stagger: number;
  reducedMotion: boolean;
}

export interface TransitionConfig {
  type: 'fade' | 'slide' | 'scale' | 'morph';
  direction: 'left' | 'right' | 'up' | 'down' | 'center';
  duration: number;
  easing: string;
}

// ==========================================
// Content and Data Types
// ==========================================

export interface LearningContent {
  id: string;
  title: string;
  description: string;
  complexity: string;
  type: 'text' | 'video' | 'interactive' | 'exercise' | 'assessment';
  duration: number;
  prerequisites: string[];
  tags: string[];
  content: any;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  complexity: string;
  contents: LearningContent[];
  estimatedTime: number;
  objectives: string[];
  assessment: {
    type: 'quiz' | 'project' | 'discussion' | 'presentation';
    criteria: string[];
  };
}

// ==========================================
// User Progress Types
// ==========================================

export interface UserProgress {
  userId: string;
  selectedPath: AudiencePath;
  currentComplexity: ComplexityLevel;
  completedModules: string[];
  inProgressModules: string[];
  timeSpent: Record<string, number>;
  achievements: string[];
  lastActivity: Date;
  preferences: {
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    pace: 'slow' | 'moderate' | 'fast';
    complexityPreference: 'progressive' | 'adaptive' | 'manual';
  };
}

// ==========================================
// Event Handler Types
// ==========================================

export interface EventHandlers {
  onPathSelection: (path: AudiencePath) => void;
  onComplexityChange: (complexity: ComplexityLevel) => void;
  onLearningProgress: (stage: LearningStage, progress: number) => void;
  onModuleComplete: (moduleId: string, score?: number) => void;
  onAchievementUnlocked: (achievementId: string) => void;
  onError: (error: Error, context: string) => void;
}
