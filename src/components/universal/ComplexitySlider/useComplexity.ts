/**
 * useComplexity Hook
 * Enhanced hook for accessing complexity state with utility functions,
 * mathematical calculations, and animation helpers
 */

import { useMemo, useCallback } from 'react';
import { useComplexityContext } from './ComplexityProvider';
import type {
  UseComplexityReturn,
  ComplexityLevel,
  ComplexityLevelId,
  ComplexityValue,
  MathematicalPosition,
  GeometricPattern,
  GOLDEN_RATIO,
  FIBONACCI_SEQUENCE
} from './types';

// ==========================================
// Mathematical Constants
// ==========================================

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2; // φ ≈ 1.618
const FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89] as const;

// Mathematical easing functions
const EASING_FUNCTIONS = {
  linear: 'linear',
  golden: `cubic-bezier(${1/GOLDEN_RATIO}, 0, ${1-1/GOLDEN_RATIO}, 1)`,
  fibonacci: 'cubic-bezier(0.236, 0.000, 0.236, 1.000)',
  exponential: 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
  natural: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)'
} as const;

// ==========================================
// Utility Functions
// ==========================================

/**
 * Calculate mathematical complexity using golden ratio progression
 */
const calculateMathComplexity = (level: ComplexityValue): number => {
  return Math.pow(GOLDEN_RATIO, level);
};

/**
 * Get Fibonacci spacing for animations and layouts
 */
const getFibonacciSpacing = (index: number): number => {
  const fibIndex = Math.min(Math.max(0, index), FIBONACCI_SEQUENCE.length - 1);
  return FIBONACCI_SEQUENCE[fibIndex];
};

/**
 * Calculate golden ratio position for geometric layouts
 */
const getGoldenRatioPosition = (level: ComplexityLevel, maxValue: number): number => {
  const ratio = level.mathComplexity / (maxValue || GOLDEN_RATIO ** 3);
  return Math.min(1, ratio / GOLDEN_RATIO);
};

/**
 * Format time in human-readable format
 */
const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Calculate transition duration based on complexity difference
 */
const getTransitionDuration = (fromLevel: ComplexityValue, toLevel: ComplexityValue): number => {
  const complexityDifference = Math.abs(toLevel - fromLevel);
  const baseDuration = 300; // Base duration in milliseconds
  
  // Use Fibonacci sequence to determine duration scaling
  const fibonacciMultiplier = getFibonacciSpacing(complexityDifference);
  return baseDuration + (fibonacciMultiplier * 50);
};

/**
 * Calculate stagger delay for animations
 */
const getStaggerDelay = (index: number): number => {
  const fibonacciValue = getFibonacciSpacing(index);
  return fibonacciValue * 100; // Convert to milliseconds
};

/**
 * Get easing function based on complexity level
 */
const getEasingFunction = (complexity: number): string => {
  if (complexity <= 1) return EASING_FUNCTIONS.linear;
  if (complexity <= GOLDEN_RATIO) return EASING_FUNCTIONS.golden;
  if (complexity <= GOLDEN_RATIO ** 2) return EASING_FUNCTIONS.fibonacci;
  if (complexity <= GOLDEN_RATIO ** 3) return EASING_FUNCTIONS.exponential;
  return EASING_FUNCTIONS.natural;
};

/**
 * Generate geometric pattern based on complexity level
 */
const generateGeometricPattern = (
  level: ComplexityLevel, 
  type: GeometricPattern['type'] = 'spiral'
): GeometricPattern => {
  const segments = getFibonacciSpacing(level.fibonacciIndex) * 4;
  const radius = level.mathComplexity * 50;
  const spacing = GOLDEN_RATIO * 10;
  const rotation = level.value * 90;

  const points: MathematicalPosition[] = [];

  switch (type) {
    case 'spiral': {
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2 * GOLDEN_RATIO;
        const r = radius * (i / segments);
        points.push({
          x: Math.cos(angle) * r,
          y: Math.sin(angle) * r,
          rotation: angle * (180 / Math.PI),
          scale: 1 + (i / segments) * 0.5
        });
      }
      break;
    }

    case 'fibonacci': {
      for (let i = 0; i < segments; i++) {
        const fibIndex = i % FIBONACCI_SEQUENCE.length;
        const fibValue = FIBONACCI_SEQUENCE[fibIndex];
        const angle = (fibValue / 89) * Math.PI * 2; // 89 is a large Fibonacci number
        const r = radius * (fibValue / 89);
        points.push({
          x: Math.cos(angle) * r,
          y: Math.sin(angle) * r,
          rotation: angle * (180 / Math.PI),
          scale: 1 + (fibValue / 89) * 0.5
        });
      }
      break;
    }

    case 'grid': {
      const gridSize = Math.ceil(Math.sqrt(segments));
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          if (points.length >= segments) break;
          points.push({
            x: (i - gridSize / 2) * spacing,
            y: (j - gridSize / 2) * spacing,
            rotation: 0,
            scale: 1
          });
        }
        if (points.length >= segments) break;
      }
      break;
    }

    case 'radial': {
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          rotation: angle * (180 / Math.PI),
          scale: 1
        });
      }
      break;
    }
  }

  return {
    type,
    parameters: {
      segments,
      radius,
      spacing,
      rotation
    },
    points
  };
};

/**
 * Calculate optimal viewport positions for complexity indicators
 */
const calculateViewportPositions = (
  levels: ComplexityLevel[],
  containerWidth: number,
  containerHeight: number,
  orientation: 'horizontal' | 'vertical' = 'horizontal'
): Record<ComplexityLevelId, { x: number; y: number }> => {
  const positions: Record<string, { x: number; y: number }> = {};
  const maxComplexity = Math.max(...levels.map(level => level.mathComplexity));

  levels.forEach((level) => {
    const ratio = getGoldenRatioPosition(level, maxComplexity);
    
    if (orientation === 'horizontal') {
      positions[level.id] = {
        x: ratio * containerWidth,
        y: containerHeight / 2
      };
    } else {
      positions[level.id] = {
        x: containerWidth / 2,
        y: (1 - ratio) * containerHeight
      };
    }
  });

  return positions;
};

/**
 * Validate complexity level prerequisites
 */
const validatePrerequisites = (
  targetLevel: ComplexityLevel,
  unlockedLevels: ComplexityLevelId[]
): { isValid: boolean; missingPrerequisites: ComplexityLevelId[] } => {
  const missingPrerequisites = targetLevel.prerequisites.filter(
    prereq => !unlockedLevels.includes(prereq)
  );

  return {
    isValid: missingPrerequisites.length === 0,
    missingPrerequisites
  };
};

/**
 * Calculate learning path efficiency
 */
const calculateLearningEfficiency = (
  interactions: any[],
  timeSpent: Record<ComplexityLevelId, number>
): {
  efficiency: number;
  optimalPath: boolean;
  suggestions: string[];
} => {
  const totalTime = Object.values(timeSpent).reduce((sum, time) => sum + time, 0);
  const levelChanges = interactions.filter(i => i.type === 'level_change').length;
  
  // Calculate efficiency based on time per level and number of level changes
  const efficiency = levelChanges > 0 ? totalTime / levelChanges : 0;
  const optimalPath = levelChanges <= 4; // Assuming 4 levels maximum
  
  const suggestions: string[] = [];
  if (levelChanges > 6) {
    suggestions.push('Consider spending more time at each level before advancing');
  }
  if (efficiency < 300000) { // Less than 5 minutes per level
    suggestions.push('You might benefit from taking more time to understand each level');
  }
  if (efficiency > 1800000) { // More than 30 minutes per level
    suggestions.push('You might be ready to advance more quickly');
  }

  return {
    efficiency: Math.min(1, 300000 / efficiency), // Normalize to 0-1
    optimalPath,
    suggestions
  };
};

// ==========================================
// Main Hook
// ==========================================

export const useComplexity = (): UseComplexityReturn => {
  const context = useComplexityContext();

  // ==========================================
  // Utility Functions
  // ==========================================

  const utils = useMemo(() => ({
    getLevelById: (id: ComplexityLevelId): ComplexityLevel | undefined => {
      return context.state.availableLevels.find(level => level.id === id);
    },

    getLevelByValue: (value: ComplexityValue): ComplexityLevel | undefined => {
      return context.state.availableLevels.find(level => level.value === value);
    },

    formatTime,

    calculateMathComplexity,

    getFibonacciSpacing,

    getGoldenRatioPosition: (level: ComplexityLevel, maxValue?: number): number => {
      const max = maxValue || Math.max(...context.state.availableLevels.map(l => l.mathComplexity));
      return getGoldenRatioPosition(level, max);
    }
  }), [context.state.availableLevels]);

  // ==========================================
  // Animation Helpers
  // ==========================================

  const animations = useMemo(() => ({
    getTransitionDuration,
    getStaggerDelay,
    getEasingFunction
  }), []);

  // ==========================================
  // Advanced Utilities
  // ==========================================

  const generatePattern = useCallback((type: GeometricPattern['type'] = 'spiral'): GeometricPattern => {
    return generateGeometricPattern(context.state.currentLevel, type);
  }, [context.state.currentLevel]);

  const getViewportPositions = useCallback((
    containerWidth: number,
    containerHeight: number,
    orientation: 'horizontal' | 'vertical' = 'horizontal'
  ) => {
    return calculateViewportPositions(
      context.state.availableLevels,
      containerWidth,
      containerHeight,
      orientation
    );
  }, [context.state.availableLevels]);

  const validateLevelAccess = useCallback((levelId: ComplexityLevelId) => {
    const level = utils.getLevelById(levelId);
    if (!level) return { isValid: false, missingPrerequisites: [], reason: 'Level not found' };

    const validation = validatePrerequisites(level, context.state.unlockedLevels);
    return {
      ...validation,
      reason: validation.isValid ? 'Access granted' : 'Missing prerequisites'
    };
  }, [utils, context.state.unlockedLevels]);

  const getLearningAnalytics = useCallback(() => {
    return calculateLearningEfficiency(
      context.state.session.interactions,
      context.state.session.timeSpentPerLevel
    );
  }, [context.state.session.interactions, context.state.session.timeSpentPerLevel]);

  // ==========================================
  // Enhanced Context Value
  // ==========================================

  return useMemo((): UseComplexityReturn => ({
    ...context,
    utils,
    animations,
    
    // Additional utility methods
    generatePattern,
    getViewportPositions,
    validateLevelAccess,
    getLearningAnalytics
  }), [
    context,
    utils,
    animations,
    generatePattern,
    getViewportPositions,
    validateLevelAccess,
    getLearningAnalytics
  ]);
};

// ==========================================
// Additional Hooks
// ==========================================

/**
 * Hook for mathematical calculations specific to current level
 */
export const useComplexityMath = () => {
  const { state } = useComplexity();
  
  return useMemo(() => ({
    currentComplexity: state.currentLevel.mathComplexity,
    fibonacciIndex: state.currentLevel.fibonacciIndex,
    goldenRatioStep: state.currentLevel.mathComplexity / GOLDEN_RATIO,
    nextComplexity: state.currentLevel.mathComplexity * GOLDEN_RATIO,
    complexityRatio: state.currentLevel.mathComplexity / (GOLDEN_RATIO ** 3), // Normalized to research level
    
    // Mathematical functions
    calculateSpiral: (segments: number) => {
      const points = [];
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2 * state.currentLevel.mathComplexity;
        const radius = state.currentLevel.mathComplexity * (i / segments);
        points.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          angle
        });
      }
      return points;
    },
    
    getOptimalSpacing: () => getFibonacciSpacing(state.currentLevel.fibonacciIndex),
    getComplexityColor: () => state.currentLevel.color.primary
  }), [state.currentLevel]);
};

/**
 * Hook for accessibility features
 */
export const useComplexityAccessibility = () => {
  const { state, actions } = useComplexity();
  
  return useMemo(() => ({
    // ARIA attributes
    getAriaLabel: (level: ComplexityLevel) => 
      `${level.label} complexity level, ${level.description}. Mathematical complexity: ${level.mathComplexity.toFixed(2)}`,
    
    getAriaDescription: (level: ComplexityLevel) =>
      `${level.mathLevel}. Estimated time: ${level.estimatedTime}. Prerequisites: ${level.prerequisites.join(', ') || 'None'}`,
    
    // Keyboard navigation
    handleKeyNavigation: (event: KeyboardEvent) => {
      const currentIndex = state.availableLevels.findIndex(l => l.id === state.currentLevel.id);
      
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          event.preventDefault();
          if (currentIndex < state.availableLevels.length - 1) {
            actions.setLevel(state.availableLevels[currentIndex + 1].id);
          }
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          event.preventDefault();
          if (currentIndex > 0) {
            actions.setLevel(state.availableLevels[currentIndex - 1].id);
          }
          break;
        case 'Home':
          event.preventDefault();
          actions.setLevel(state.availableLevels[0].id);
          break;
        case 'End':
          event.preventDefault();
          actions.setLevel(state.availableLevels[state.availableLevels.length - 1].id);
          break;
      }
    },
    
    // Screen reader announcements
    announceChange: (level: ComplexityLevel) => {
      const announcement = `Complexity level changed to ${level.label}. ${level.description}`;
      // This would integrate with a screen reader announcement system
      return announcement;
    },
    
    // High contrast support
    getContrastColors: (level: ComplexityLevel) => ({
      foreground: state.preferences.highContrast ? '#000000' : level.color.text,
      background: state.preferences.highContrast ? '#FFFFFF' : level.color.background,
      border: state.preferences.highContrast ? '#000000' : level.color.primary
    })
  }), [state, actions]);
};

export default useComplexity;