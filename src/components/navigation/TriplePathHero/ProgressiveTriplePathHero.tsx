/**
 * Progressive Triple Path Hero Component
 * Enhanced version with progressive disclosure system
 * Maintains backward compatibility while adding sophisticated UX improvements
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';

// Component imports
import { TriplePathHero } from './index';
import { ProgressiveDisclosureProvider, DisclosureControls } from './ProgressiveDisclosureProvider';
import { ComplexityIndicators } from './ComplexityIndicators';
import { MathematicalLoadingStates } from './MathematicalLoadingStates';

// Types
import { 
  ProgressiveTriplePathHeroProps, 
  ProgressiveMetrics,
  DisclosureStage,
  ComplexityLevel 
} from './types';

// ==========================================
// Mathematical Constants
// ==========================================

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2; // φ ≈ 1.618
const GOLDEN_EASING = 'cubic-bezier(0.618, 0, 0.382, 1)';

// Default progressive disclosure configuration
const DEFAULT_PROGRESSIVE_CONFIG = {
  autoAdvance: true,
  enableUserControl: false,
  showComplexityIndicators: true,
  showLoadingStates: true,
  enableAccessibility: true
};

// ==========================================
// Progressive Metrics Hook
// ==========================================

const useProgressiveMetrics = (
  onProgressiveMetrics?: (metrics: ProgressiveMetrics) => void
) => {
  const [metrics, setMetrics] = useState<Partial<ProgressiveMetrics>>({});
  const [startTime] = useState(Date.now());
  const [stageTransitionTimes, setStageTransitionTimes] = useState<number[]>([]);

  const updateProgressiveMetrics = useCallback((newMetrics: Partial<ProgressiveMetrics>) => {
    const fullMetrics: ProgressiveMetrics = {
      // Base performance metrics
      renderTime: 0,
      animationFrameRate: 60,
      memoryUsage: 0,
      interactionLatency: 0,
      spiralComplexity: 0,
      pathwayResponsiveness: 0,
      timestamp: Date.now(),
      
      // Progressive disclosure metrics
      stageTransitionTime: 0,
      userEngagementLevel: 0,
      complexityPreference: '🌱',
      autoAdvancementOptOut: false,
      manualControlUsage: 0,
      pathwayClarityScore: 0,
      timeToPathSelection: 0,
      stageBounceRate: 0,
      fullDisclosureReachRate: 0,
      interactionDepthScore: 0,
      
      ...metrics,
      ...newMetrics
    };

    setMetrics(fullMetrics);
    onProgressiveMetrics?.(fullMetrics);
  }, [metrics, onProgressiveMetrics]);

  return { metrics, updateProgressiveMetrics, stageTransitionTimes, setStageTransitionTimes };
};

// ==========================================
// Accessibility Announcements
// ==========================================

const useAccessibilityAnnouncements = (enableAccessibility: boolean) => {
  const announceStageChange = useCallback((stage: DisclosureStage, complexity: ComplexityLevel) => {
    if (!enableAccessibility) return;
    
    const messages = {
      0: `Foundation stage activated. Basic structure now visible. Complexity level: ${complexity}`,
      1: `Value focus stage activated. Trust signals and quick benefits now shown. Complexity level: ${complexity}`,
      2: `Pathway preview stage activated. Interactive demos and detailed information now available. Complexity level: ${complexity}`,
      3: `Full complexity stage activated. All features and tools now accessible. Complexity level: ${complexity}`
    };

    // Create and announce via screen reader
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = messages[stage];
    
    document.body.appendChild(announcement);
    
    // Clean up after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [enableAccessibility]);

  return { announceStageChange };
};

// ==========================================
// Progressive Triple Path Hero Component
// ==========================================

export const ProgressiveTriplePathHero: React.FC<ProgressiveTriplePathHeroProps> = ({
  // Progressive disclosure props
  progressiveDisclosure = DEFAULT_PROGRESSIVE_CONFIG,
  stageConfigurations = {},
  onStageChange,
  onComplexityChange,
  onDisclosureInteraction,
  onProgressiveMetrics,
  
  // Base props (pass through to TriplePathHero)
  ...baseProps
}) => {
  // ==========================================
  // State Management
  // ==========================================
  
  const [currentStage, setCurrentStage] = useState<DisclosureStage>(0);
  const [currentComplexity, setCurrentComplexity] = useState<ComplexityLevel>('🌱');
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [pathwayClarityScore, setPathwayClarityScore] = useState(60); // Start at 60%, target 90%+

  // ==========================================
  // Hooks
  // ==========================================
  
  const { metrics, updateProgressiveMetrics, stageTransitionTimes, setStageTransitionTimes } = 
    useProgressiveMetrics(onProgressiveMetrics);
  
  const { announceStageChange } = useAccessibilityAnnouncements(
    progressiveDisclosure.enableAccessibility ?? true
  );

  // ==========================================
  // Configuration Merging
  // ==========================================
  
  const progressiveConfig = useMemo(() => ({
    ...DEFAULT_PROGRESSIVE_CONFIG,
    ...progressiveDisclosure
  }), [progressiveDisclosure]);

  // Get stage-specific configurations
  const currentStageConfig = useMemo(() => 
    stageConfigurations[currentStage] || {}, 
    [stageConfigurations, currentStage]
  );

  // ==========================================
  // Stage Management
  // ==========================================
  
  const handleStageChange = useCallback((stage: DisclosureStage, previousStage: DisclosureStage) => {
    const transitionTime = Date.now();
    
    setCurrentStage(stage);
    
    // Update complexity level
    const complexityLevels: Record<DisclosureStage, ComplexityLevel> = {
      0: '🌱',
      1: '🎯', 
      2: '🧠',
      3: '🎓'
    };
    
    const newComplexity = complexityLevels[stage];
    setCurrentComplexity(newComplexity);
    
    // Track stage transition time
    setStageTransitionTimes(prev => [...prev, transitionTime]);
    
    // Calculate pathway clarity improvement
    const clarityImprovement = stage === 0 ? 60 : 60 + (stage * 10); // 60% → 70% → 80% → 90%
    setPathwayClarityScore(clarityImprovement);
    
    // Update metrics
    updateProgressiveMetrics({
      stageTransitionTime: transitionTime,
      userEngagementLevel: Math.min(100, (stage + 1) * 25),
      complexityPreference: newComplexity,
      pathwayClarityScore: clarityImprovement,
      interactionDepthScore: Math.min(100, stage * 33.33)
    });
    
    // Accessibility announcement
    announceStageChange(stage, newComplexity);
    
    // External callbacks
    onStageChange?.(stage, previousStage);
    onComplexityChange?.(newComplexity);
  }, [updateProgressiveMetrics, announceStageChange, onStageChange, onComplexityChange, setStageTransitionTimes]);

  const handleDisclosureInteraction = useCallback((action: string, stage: DisclosureStage, timestamp: number) => {
    setUserHasInteracted(true);
    
    // Track manual control usage
    if (action.includes('manual') || action.includes('jump') || action.includes('pause')) {
      updateProgressiveMetrics({
        manualControlUsage: (metrics.manualControlUsage || 0) + 1,
        autoAdvancementOptOut: action.includes('pause') || action.includes('manual')
      });
    }
    
    onDisclosureInteraction?.(action, stage, timestamp);
  }, [metrics.manualControlUsage, updateProgressiveMetrics, onDisclosureInteraction]);

  // ==========================================
  // Performance Tracking
  // ==========================================
  
  useEffect(() => {
    // Track time to full disclosure reach
    if (currentStage === 3) {
      const timeToFullDisclosure = Date.now() - (stageTransitionTimes[0] || Date.now());
      updateProgressiveMetrics({
        fullDisclosureReachRate: 100,
        timeToPathSelection: timeToFullDisclosure
      });
    }
  }, [currentStage, stageTransitionTimes, updateProgressiveMetrics]);

  // ==========================================
  // Enhanced Props for Base Component
  // ==========================================
  
  const enhancedProps = useMemo(() => ({
    ...baseProps,
    // Merge stage-specific configurations with defaults
    businessConfig: {
      roiCalculatorEnabled: true,
      trustIndicators: [],
      caseStudyPreviews: [],
      testimonials: [],
      ...baseProps.businessConfig,
      ...currentStageConfig.businessConfig
    },
    technicalConfig: {
      codeExamples: [],
      apiDocLinks: [],
      playgroundPreview: {
        enabled: true,
        defaultExample: 'basic'
      },
      githubIntegration: {
        repoUrl: 'https://github.com/zktheory/zktheory',
        starCount: 0,
        forkCount: 0
      },
      ...baseProps.technicalConfig,
      ...currentStageConfig.technicalConfig
    },
    academicConfig: {
      researchPapers: [],
      mathematicalVisualizations: [],
      collaborationTools: {
        enabled: true,
        platforms: []
      },
      ...baseProps.academicConfig,
      ...currentStageConfig.academicConfig
    },
    // Enhanced performance metrics
    onPerformanceMetrics: (performanceMetrics: any) => {
      updateProgressiveMetrics(performanceMetrics);
      baseProps.onPerformanceMetrics?.(performanceMetrics);
    }
  }), [baseProps, currentStageConfig, updateProgressiveMetrics]);

  // ==========================================
  // Render
  // ==========================================
  
  return (
    <ProgressiveDisclosureProvider
      autoAdvance={progressiveConfig.autoAdvance}
      enableUserControl={progressiveConfig.enableUserControl}
      onStageChange={handleStageChange}
      onInteraction={handleDisclosureInteraction}
    >
      <div className="relative">
        {/* Base Triple Path Hero Component */}
        <TriplePathHero {...enhancedProps} />
        
        {/* Progressive Disclosure Enhancements */}
        {progressiveConfig.showComplexityIndicators && (
          <ComplexityIndicators
            variant="horizontal"
            position="top-right"
            showLabels={true}
            showProgress={true}
            showEstimatedTime={true}
            interactive={progressiveConfig.enableUserControl}
          />
        )}
        
        {/* User Controls */}
        {progressiveConfig.enableUserControl && (
          <DisclosureControls
            position="bottom"
            showProgress={true}
            showComplexity={true}
          />
        )}
        
        {/* Mathematical Loading States */}
        {progressiveConfig.showLoadingStates && (
          <MathematicalLoadingStates
            variant="spiral"
            showEquations={true}
            showProgress={true}
            position="center"
          />
        )}
        
        {/* Accessibility Enhancement */}
        {progressiveConfig.enableAccessibility && (
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            <p>
              Current complexity level: {currentComplexity}. 
              Stage {currentStage + 1} of 4. 
              Pathway clarity: {pathwayClarityScore}%.
            </p>
          </div>
        )}
        
        {/* Development Metrics Overlay */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed top-20 right-4 bg-black/90 text-white text-xs p-4 rounded-lg font-mono z-50 max-w-xs"
          >
            <div className="text-yellow-400 font-bold mb-2">Progressive Disclosure Metrics</div>
            <div>Stage: {currentStage + 1}/4 ({currentComplexity})</div>
            <div>Clarity: {pathwayClarityScore}%</div>
            <div>Engagement: {Math.min(100, (currentStage + 1) * 25)}%</div>
            <div>Manual Control: {metrics.manualControlUsage || 0}</div>
            <div>User Interacted: {userHasInteracted ? 'Yes' : 'No'}</div>
            <div>Auto-advance: {progressiveConfig.autoAdvance ? 'On' : 'Off'}</div>
            {metrics.timeToPathSelection && (
              <div>Time to Full: {(metrics.timeToPathSelection / 1000).toFixed(1)}s</div>
            )}
          </motion.div>
        )}
      </div>
    </ProgressiveDisclosureProvider>
  );
};

// ==========================================
// Export Enhanced Component as Default
// ==========================================

export default ProgressiveTriplePathHero;