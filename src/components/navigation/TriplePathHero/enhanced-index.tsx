/**
 * Enhanced Triple Path Hero - Entry Point
 * Exports both original and progressive disclosure versions
 * Maintains backward compatibility while providing advanced UX features
 */

// Original component (backward compatible)
export { TriplePathHero } from './index';

// Progressive disclosure enhanced version
export { ProgressiveTriplePathHero } from './ProgressiveTriplePathHero';

// Progressive disclosure system components
export { 
  ProgressiveDisclosureProvider, 
  DisclosureContent, 
  DisclosureControls,
  useProgressiveDisclosure 
} from './ProgressiveDisclosureProvider';

export { ComplexityIndicators } from './ComplexityIndicators';

export { 
  MathematicalLoadingStates, 
  StageLoadingIndicator 
} from './MathematicalLoadingStates';

// Enhanced pathway components (with progressive disclosure)
export { BusinessPath } from './BusinessPath';
export { TechnicalPath } from './TechnicalPath';
export { AcademicPath } from './AcademicPath';
export { CentralSpiral } from './CentralSpiral';

// Types
export type {
  // Original types
  TriplePathHeroProps,
  PathComponentProps,
  BusinessPathConfig,
  TechnicalPathConfig,
  AcademicPathConfig,
  HeroAnimationConfig,
  GoldenSpiralConfig,
  PerformanceMetrics,
  
  // Progressive disclosure types
  ProgressiveTriplePathHeroProps,
  DisclosureStage,
  ComplexityLevel,
  DisclosureState,
  ProgressiveDisclosureConfig,
  ProgressiveMetrics,
  StageContent
} from './types';

// ==========================================
// Convenience Exports
// ==========================================

// Default export is the progressive version for new implementations
export { ProgressiveTriplePathHero as default } from './ProgressiveTriplePathHero';

// Easy migration path
export const EnhancedTriplePathHero = ProgressiveTriplePathHero;

// Version information
export const VERSION = {
  original: '1.0.0',
  progressive: '2.0.0',
  current: '2.0.0'
};

// ==========================================
// Usage Examples (for documentation)
// ==========================================

/*
// Basic usage (original component)
import { TriplePathHero } from './enhanced-index';

<TriplePathHero 
  onPathSelection={(path) => console.log(path)}
  performanceMode="balanced"
/>

// Enhanced usage (progressive disclosure)
import { ProgressiveTriplePathHero } from './enhanced-index';

<ProgressiveTriplePathHero
  progressiveDisclosure={{
    autoAdvance: true,
    enableUserControl: true,
    showComplexityIndicators: true,
    showLoadingStates: true
  }}
  onStageChange={(stage, prev) => console.log(`Stage ${prev} → ${stage}`)}
  onProgressiveMetrics={(metrics) => console.log('UX Metrics:', metrics)}
/>

// Custom progressive disclosure provider
import { 
  ProgressiveDisclosureProvider, 
  TriplePathHero,
  ComplexityIndicators 
} from './enhanced-index';

<ProgressiveDisclosureProvider autoAdvance={false}>
  <TriplePathHero />
  <ComplexityIndicators position="top-right" />
</ProgressiveDisclosureProvider>
*/