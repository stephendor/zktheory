/**
 * Progressive Disclosure Provider
 * Context provider for managing disclosure states with mathematical precision
 * Uses golden ratio timing and Fibonacci sequences for optimal UX flow
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// Mathematical Constants
// ==========================================

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2; // φ ≈ 1.618
const FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]; // Fibonacci numbers for timing

// Golden ratio timing intervals (in milliseconds)
const DISCLOSURE_TIMINGS = {
  // Stage 0: Immediate (0ms) - Basic structure appears
  immediate: 0,
  
  // Stage 1: 5-second teaser (φ^2 * 1000 ≈ 2618ms, but adjusted for UX)
  valueProposition: 5000,
  
  // Stage 2: 15-second preview (φ^3 * 1000 ≈ 4236ms + stage1)
  pathwayPreview: 15000,
  
  // Stage 3: 60+ second full disclosure (manual or automatic after 1 minute)
  fullComplexity: 60000
} as const;

// Mathematical easing function using golden ratio
const GOLDEN_EASING = 'cubic-bezier(0.618, 0, 0.382, 1)';

// ==========================================
// Types
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

export interface DisclosureContent {
  stage: DisclosureStage;
  complexity: ComplexityLevel;
  content?: React.ReactNode; // Made optional since component uses children
  duration?: number;
  staggerDelay?: number;
}

export interface ProgressiveDisclosureContextType {
  // State
  disclosureState: DisclosureState;
  
  // Controls
  advanceStage: () => void;
  jumpToStage: (stage: DisclosureStage) => void;
  pauseProgression: () => void;
  resumeProgression: () => void;
  enableUserControl: () => void;
  
  // Helpers
  isStageActive: (stage: DisclosureStage) => boolean;
  getStageProgress: (stage: DisclosureStage) => number;
  getComplexityLevel: (stage: DisclosureStage) => ComplexityLevel;
  
  // Animation helpers
  getStageTimingDelay: (stage: DisclosureStage) => number;
  getFibonacciStagger: (index: number) => number;
  
  // Performance tracking
  trackInteraction: (action: string, stage: DisclosureStage) => void;
}

// ==========================================
// Context Creation
// ==========================================

const ProgressiveDisclosureContext = createContext<ProgressiveDisclosureContextType | null>(null);

export const useProgressiveDisclosure = (): ProgressiveDisclosureContextType => {
  const context = useContext(ProgressiveDisclosureContext);
  if (!context) {
    throw new Error('useProgressiveDisclosure must be used within a ProgressiveDisclosureProvider');
  }
  return context;
};

// ==========================================
// Complexity Level Mapping
// ==========================================

const COMPLEXITY_LEVELS: Record<DisclosureStage, ComplexityLevel> = {
  0: '🌱', // Basic structure
  1: '🎯', // Value proposition
  2: '🧠', // Pathway previews
  3: '🎓'  // Full complexity
};

// ==========================================
// Provider Component
// ==========================================

interface ProgressiveDisclosureProviderProps {
  children: React.ReactNode;
  autoAdvance?: boolean;
  enableUserControl?: boolean;
  onStageChange?: (stage: DisclosureStage, previousStage: DisclosureStage) => void;
  onInteraction?: (action: string, stage: DisclosureStage, timestamp: number) => void;
}

export const ProgressiveDisclosureProvider: React.FC<ProgressiveDisclosureProviderProps> = ({
  children,
  autoAdvance = true,
  enableUserControl: enableUserControlProp = false,
  onStageChange,
  onInteraction
}) => {
  // ==========================================
  // State Management
  // ==========================================
  
  const [disclosureState, setDisclosureState] = useState<DisclosureState>({
    currentStage: 0,
    timeInStage: 0,
    totalTime: 0,
    isUserControlled: enableUserControlProp,
    isPaused: false,
    hasInteracted: false
  });

  const [startTime] = useState(Date.now());

  // ==========================================
  // Stage Management
  // ==========================================
  
  const advanceStage = useCallback(() => {
    setDisclosureState(prev => {
      const nextStage = Math.min(3, prev.currentStage + 1) as DisclosureStage;
      const previousStage = prev.currentStage;
      
      // Call stage change callback
      if (nextStage !== previousStage) {
        onStageChange?.(nextStage, previousStage);
      }
      
      return {
        ...prev,
        currentStage: nextStage,
        timeInStage: 0,
        hasInteracted: true
      };
    });
  }, [onStageChange]);

  const jumpToStage = useCallback((stage: DisclosureStage) => {
    setDisclosureState(prev => {
      const previousStage = prev.currentStage;
      
      // Call stage change callback
      if (stage !== previousStage) {
        onStageChange?.(stage, previousStage);
      }
      
      return {
        ...prev,
        currentStage: stage,
        timeInStage: 0,
        isUserControlled: true,
        hasInteracted: true
      };
    });
  }, [onStageChange]);

  const pauseProgression = useCallback(() => {
    setDisclosureState(prev => ({
      ...prev,
      isPaused: true
    }));
  }, []);

  const resumeProgression = useCallback(() => {
    setDisclosureState(prev => ({
      ...prev,
      isPaused: false
    }));
  }, []);

  const enableUserControl = useCallback(() => {
    setDisclosureState(prev => ({
      ...prev,
      isUserControlled: true
    }));
  }, []);

  // ==========================================
  // Helper Functions
  // ==========================================
  
  const isStageActive = useCallback((stage: DisclosureStage): boolean => {
    return disclosureState.currentStage >= stage;
  }, [disclosureState.currentStage]);

  const getStageProgress = useCallback((stage: DisclosureStage): number => {
    if (disclosureState.currentStage > stage) return 1;
    if (disclosureState.currentStage < stage) return 0;
    
    // Calculate progress within current stage
    const stageKeys = Object.keys(DISCLOSURE_TIMINGS) as (keyof typeof DISCLOSURE_TIMINGS)[];
    const stageDuration = stage < stageKeys.length - 1 
      ? DISCLOSURE_TIMINGS[stageKeys[stage + 1]] - DISCLOSURE_TIMINGS[stageKeys[stage]]
      : 10000; // Default duration for final stage
    
    return Math.min(1, disclosureState.timeInStage / stageDuration);
  }, [disclosureState.currentStage, disclosureState.timeInStage]);

  const getComplexityLevel = useCallback((stage: DisclosureStage): ComplexityLevel => {
    return COMPLEXITY_LEVELS[stage];
  }, []);

  const getStageTimingDelay = useCallback((stage: DisclosureStage): number => {
    const stageKeys = Object.keys(DISCLOSURE_TIMINGS) as (keyof typeof DISCLOSURE_TIMINGS)[];
    return DISCLOSURE_TIMINGS[stageKeys[stage]] || 0;
  }, []);

  const getFibonacciStagger = useCallback((index: number): number => {
    const fibIndex = Math.min(index, FIBONACCI_SEQUENCE.length - 1);
    return FIBONACCI_SEQUENCE[fibIndex] * 100; // Convert to milliseconds
  }, []);

  const trackInteraction = useCallback((action: string, stage: DisclosureStage) => {
    const timestamp = Date.now();
    onInteraction?.(action, stage, timestamp);
    
    // Mark as interacted
    setDisclosureState(prev => ({
      ...prev,
      hasInteracted: true
    }));
  }, [onInteraction]);

  // ==========================================
  // Auto-advancement Effect
  // ==========================================
  
  useEffect(() => {
    if (!autoAdvance || disclosureState.isUserControlled || disclosureState.isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setDisclosureState(prev => {
        const newTimeInStage = prev.timeInStage + 100;
        const newTotalTime = Date.now() - startTime;
        
        // Determine if we should advance to the next stage
        let shouldAdvance = false;
        const currentStage = prev.currentStage;
        
        switch (currentStage) {
          case 0:
            shouldAdvance = newTotalTime >= DISCLOSURE_TIMINGS.valueProposition;
            break;
          case 1:
            shouldAdvance = newTotalTime >= DISCLOSURE_TIMINGS.pathwayPreview;
            break;
          case 2:
            shouldAdvance = newTotalTime >= DISCLOSURE_TIMINGS.fullComplexity;
            break;
          case 3:
            // Final stage, no auto-advancement
            break;
        }
        
        if (shouldAdvance && currentStage < 3) {
          const nextStage = (currentStage + 1) as DisclosureStage;
          onStageChange?.(nextStage, currentStage);
          
          return {
            ...prev,
            currentStage: nextStage,
            timeInStage: 0,
            totalTime: newTotalTime
          };
        }
        
        return {
          ...prev,
          timeInStage: newTimeInStage,
          totalTime: newTotalTime
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [autoAdvance, disclosureState.isUserControlled, disclosureState.isPaused, onStageChange, startTime]);

  // ==========================================
  // Context Value
  // ==========================================
  
  const contextValue = useMemo((): ProgressiveDisclosureContextType => ({
    disclosureState,
    advanceStage,
    jumpToStage,
    pauseProgression,
    resumeProgression,
    enableUserControl,
    isStageActive,
    getStageProgress,
    getComplexityLevel,
    getStageTimingDelay,
    getFibonacciStagger,
    trackInteraction
  }), [
    disclosureState,
    advanceStage,
    jumpToStage,
    pauseProgression,
    resumeProgression,
    enableUserControl,
    isStageActive,
    getStageProgress,
    getComplexityLevel,
    getStageTimingDelay,
    getFibonacciStagger,
    trackInteraction
  ]);

  // ==========================================
  // Render
  // ==========================================
  
  return (
    <ProgressiveDisclosureContext.Provider value={contextValue}>
      {children}
    </ProgressiveDisclosureContext.Provider>
  );
};

// ==========================================
// Disclosure Content Component
// ==========================================

interface DisclosureContentProps extends DisclosureContent {
  children: React.ReactNode;
  className?: string;
}

export const DisclosureContent: React.FC<DisclosureContentProps> = ({
  stage,
  complexity,
  children,
  className = '',
  duration = 500,
  staggerDelay = 0
}) => {
  const { isStageActive, getFibonacciStagger } = useProgressiveDisclosure();
  
  const isVisible = isStageActive(stage);
  const fibonacciDelay = getFibonacciStagger(stage);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ 
            opacity: 0, 
            y: 20, 
            scale: 0.95 
          }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1 
          }}
          exit={{ 
            opacity: 0, 
            y: -10, 
            scale: 0.98 
          }}
          transition={{
            duration: duration / 1000,
            delay: (staggerDelay + fibonacciDelay) / 1000,
            ease: "easeOut"
          }}
          className={className}
          data-disclosure-stage={stage}
          data-complexity={complexity}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// Disclosure Controls Component
// ==========================================

interface DisclosureControlsProps {
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showProgress?: boolean;
  showComplexity?: boolean;
}

export const DisclosureControls: React.FC<DisclosureControlsProps> = ({
  className = '',
  position = 'bottom',
  showProgress = true,
  showComplexity = true
}) => {
  const { 
    disclosureState, 
    advanceStage, 
    jumpToStage, 
    pauseProgression, 
    resumeProgression,
    enableUserControl,
    getComplexityLevel,
    trackInteraction 
  } = useProgressiveDisclosure();

  const handleAdvance = useCallback(() => {
    trackInteraction('manual_advance', disclosureState.currentStage);
    enableUserControl();
    advanceStage();
  }, [trackInteraction, disclosureState.currentStage, enableUserControl, advanceStage]);

  const handleJumpToStage = useCallback((stage: DisclosureStage) => {
    trackInteraction(`jump_to_stage_${stage}`, disclosureState.currentStage);
    jumpToStage(stage);
  }, [trackInteraction, disclosureState.currentStage, jumpToStage]);

  const handlePause = useCallback(() => {
    trackInteraction('pause_progression', disclosureState.currentStage);
    pauseProgression();
  }, [trackInteraction, disclosureState.currentStage, pauseProgression]);

  const handleResume = useCallback(() => {
    trackInteraction('resume_progression', disclosureState.currentStage);
    resumeProgression();
  }, [trackInteraction, disclosureState.currentStage, resumeProgression]);

  const positionClasses = {
    top: 'top-4 left-1/2 transform -translate-x-1/2',
    bottom: 'bottom-4 left-1/2 transform -translate-x-1/2',
    left: 'left-4 top-1/2 transform -translate-y-1/2',
    right: 'right-4 top-1/2 transform -translate-y-1/2'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        fixed ${positionClasses[position]} z-50
        bg-white/90 backdrop-blur-sm rounded-full px-4 py-2
        border border-gray-200 shadow-lg
        ${className}
      `}
    >
      <div className="flex items-center space-x-3">
        {/* Stage Indicators */}
        <div className="flex space-x-1">
          {[0, 1, 2, 3].map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => handleJumpToStage(stage as DisclosureStage)}
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${disclosureState.currentStage >= stage 
                  ? 'bg-blue-500 scale-110' 
                  : 'bg-gray-300 hover:bg-gray-400'
                }
              `}
              aria-label={`Jump to stage ${stage + 1}`}
            />
          ))}
        </div>

        {/* Complexity Indicator */}
        {showComplexity && (
          <div className="text-lg" title={`Complexity: ${getComplexityLevel(disclosureState.currentStage)}`}>
            {getComplexityLevel(disclosureState.currentStage)}
          </div>
        )}

        {/* Progress Display */}
        {showProgress && (
          <div className="text-xs text-gray-600 font-mono">
            Stage {disclosureState.currentStage + 1}/4
          </div>
        )}

        {/* Controls */}
        <div className="flex space-x-1">
          {!disclosureState.isPaused ? (
            <button
              type="button"
              onClick={handlePause}
              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="Pause progression"
            >
              ⏸️
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResume}
              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
              aria-label="Resume progression"
            >
              ▶️
            </button>
          )}
          
          {disclosureState.currentStage < 3 && (
            <button
              type="button"
              onClick={handleAdvance}
              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
              aria-label="Advance to next stage"
            >
              ⏭️
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressiveDisclosureProvider;