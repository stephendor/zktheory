/**
 * Triple Path Hero Types
 * Mathematical precision meets practical pathways
 */

export interface HeroAnimationConfig {
  duration: number;
  easing: string;
  delay: number;
  stagger: number;
}

export interface GoldenSpiralConfig {
  segments: number;
  maxRotations: number;
  animationDuration: number;
  particleCount: number;
  colorScheme: 'mathematical' | 'business' | 'technical' | 'academic';
}

export interface PathwayMetrics {
  conversionRate: number;
  engagementTime: number;
  interactionDepth: number;
  bounceRate: number;
}

export interface BusinessPathConfig {
  roiCalculatorEnabled: boolean;
  trustIndicators: string[];
  caseStudyPreviews: Array<{
    title: string;
    metric: string;
    description: string;
    ctaText: string;
    ctaLink: string;
  }>;
  testimonials: Array<{
    quote: string;
    author: string;
    company: string;
    logo?: string;
  }>;
}

export interface TechnicalPathConfig {
  codeExamples: Array<{
    title: string;
    language: string;
    code: string;
    description: string;
    complexity: 'beginner' | 'intermediate' | 'advanced';
  }>;
  apiDocLinks: string[];
  playgroundPreview: {
    enabled: boolean;
    defaultExample: string;
  };
  githubIntegration: {
    repoUrl: string;
    starCount?: number;
    forkCount?: number;
  };
}

export interface AcademicPathConfig {
  researchPapers: Array<{
    title: string;
    authors: string[];
    abstract: string;
    pdfUrl: string;
    category: string;
  }>;
  mathematicalVisualizations: Array<{
    type: 'topology' | 'algebra' | 'geometry' | 'analysis';
    complexity: 'undergraduate' | 'graduate' | 'research';
    interactivity: boolean;
    description: string;
  }>;
  collaborationTools: {
    enabled: boolean;
    platforms: string[];
  };
}

export interface TriplePathHeroProps {
  className?: string;
  style?: React.CSSProperties;
  
  // Animation Configuration
  animationConfig?: Partial<HeroAnimationConfig>;
  spiralConfig?: Partial<GoldenSpiralConfig>;
  
  // Path Configurations
  businessConfig?: BusinessPathConfig;
  technicalConfig?: TechnicalPathConfig;
  academicConfig?: AcademicPathConfig;
  
  // Performance
  performanceMode?: 'high' | 'balanced' | 'conservative';
  
  // Interactivity
  enableParallax?: boolean;
  enableHoverPreview?: boolean;
  enablePathTransitions?: boolean;
  
  // Analytics
  onPathSelection?: (path: 'business' | 'technical' | 'academic') => void;
  onSpiralInteraction?: (event: string, data: any) => void;
  onPerformanceMetrics?: (metrics: PerformanceMetrics) => void;
  
  // Accessibility
  reduceMotion?: boolean;
  highContrast?: boolean;
  screenReaderOptimized?: boolean;
}

export interface PathComponentProps {
  isActive: boolean;
  isHovered: boolean;
  animationDelay: number;
  performanceMode: 'high' | 'balanced' | 'conservative';
  onPathSelect: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

export interface CentralSpiralProps {
  config: GoldenSpiralConfig;
  activePathway: 'business' | 'technical' | 'academic' | null;
  spiralPhase: number;
  onSpiralClick: () => void;
  performanceMode: 'high' | 'balanced' | 'conservative';
}

export interface MathematicalTransition {
  from: 'center' | 'business' | 'technical' | 'academic';
  to: 'center' | 'business' | 'technical' | 'academic';
  transformType: 'spiral' | 'geometric' | 'topological' | 'algebraic';
  duration: number;
  equation?: string;
}

export interface PathwayAnimationState {
  phase: 'idle' | 'hovering' | 'selected' | 'transitioning';
  progress: number;
  activeTransition?: MathematicalTransition;
}

export interface PerformanceMetrics {
  renderTime: number;
  animationFrameRate: number;
  memoryUsage: number;
  interactionLatency: number;
  spiralComplexity: number;
  pathwayResponsiveness: number;
  timestamp: number;
}

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  largeDesktop: number;
  ultrawide: number;
}

export interface ColorSchemeDefinition {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
  gradient: {
    start: string;
    end: string;
    direction: number;
  };
}

export interface AudienceColorSchemes {
  business: ColorSchemeDefinition;
  technical: ColorSchemeDefinition;
  academic: ColorSchemeDefinition;
  mathematical: ColorSchemeDefinition;
}

// ==========================================
// Progressive Disclosure Types
// ==========================================

export type DisclosureStage = 0 | 1 | 2 | 3;
export type ComplexityLevel = '🌱' | '🎯' | '🧠' | '🎓';

export interface DisclosureState {
  currentStage: DisclosureStage;
  timeInStage: number;
  totalTime: number;
  isUserControlled: boolean;
  isPaused: boolean;
  hasInteracted: boolean;
}

export interface ProgressiveDisclosureConfig {
  autoAdvance?: boolean;
  enableUserControl?: boolean;
  showComplexityIndicators?: boolean;
  showLoadingStates?: boolean;
  enableAccessibility?: boolean;
}

export interface StageContent {
  stage: DisclosureStage;
  complexity: ComplexityLevel;
  title: string;
  description: string;
  features: string[];
  estimatedTime: string;
  userBenefit: string;
}

export interface ProgressiveTriplePathHeroProps extends TriplePathHeroProps {
  // Progressive Disclosure Configuration
  progressiveDisclosure?: ProgressiveDisclosureConfig;
  
  // Stage-specific configurations
  stageConfigurations?: {
    [K in DisclosureStage]?: {
      businessConfig?: Partial<BusinessPathConfig>;
      technicalConfig?: Partial<TechnicalPathConfig>;
      academicConfig?: Partial<AcademicPathConfig>;
    };
  };
  
  // Progressive disclosure callbacks
  onStageChange?: (stage: DisclosureStage, previousStage: DisclosureStage) => void;
  onComplexityChange?: (complexity: ComplexityLevel) => void;
  onDisclosureInteraction?: (action: string, stage: DisclosureStage, timestamp: number) => void;
  onProgressiveMetrics?: (metrics: ProgressiveMetrics) => void;
}

export interface ProgressiveMetrics extends PerformanceMetrics {
  // Progressive disclosure specific metrics
  stageTransitionTime: number;
  userEngagementLevel: number;
  complexityPreference: ComplexityLevel;
  autoAdvancementOptOut: boolean;
  manualControlUsage: number;
  pathwayClarityScore: number; // Target: 90%+
  
  // UX improvement metrics
  timeToPathSelection: number;
  stageBounceRate: number;
  fullDisclosureReachRate: number;
  interactionDepthScore: number;
}