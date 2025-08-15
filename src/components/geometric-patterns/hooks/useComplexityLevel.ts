/**
 * Complexity Level Hook
 * 
 * Manages progressive complexity indicators for the geometric pattern system.
 * Provides smooth transitions between complexity levels with mathematical precision.
 */

import { useState, useCallback, useMemo } from 'react';
import { ComplexityLevel, UseComplexityLevelReturn } from '../types/patterns';

// ==========================================
// Complexity Level Configuration
// ==========================================

interface ComplexityConfig {
  level: ComplexityLevel;
  icon: string;
  emoji: string;
  description: string;
  shortDescription: string;
  mathematicalFeatures: string[];
  performanceImpact: 'low' | 'medium' | 'high' | 'very-high';
  targetAudience: string[];
  examples: string[];
  technicalDetails: {
    maxElements: number;
    maxGenerations: number;
    renderComplexity: number; // 1-10 scale
    memoryUsage: 'minimal' | 'low' | 'moderate' | 'high' | 'intensive';
  };
}

const COMPLEXITY_LEVELS: ComplexityConfig[] = [
  {
    level: 'beginner',
    icon: '🌱',
    emoji: '🌱',
    description: 'Simple geometric shapes with basic mathematical relationships. Perfect for educational introduction to mathematical patterns.',
    shortDescription: 'Basic geometric shapes',
    mathematicalFeatures: [
      'Simple circles and polygons',
      'Basic symmetry',
      'Elementary proportions',
      'Linear relationships'
    ],
    performanceImpact: 'low',
    targetAudience: ['Students', 'Beginners', 'Educational contexts'],
    examples: [
      'Regular polygons',
      'Simple grids',
      'Basic spirals',
      'Elementary curves'
    ],
    technicalDetails: {
      maxElements: 100,
      maxGenerations: 3,
      renderComplexity: 2,
      memoryUsage: 'minimal'
    }
  },
  {
    level: 'intermediate',
    icon: '🌿',
    emoji: '🌿',
    description: 'Interconnected patterns showing mathematical relationships. Demonstrates pattern emergence and geometric harmony.',
    shortDescription: 'Interconnected patterns',
    mathematicalFeatures: [
      'Pattern interconnections',
      'Golden ratio proportions',
      'Fibonacci sequences',
      'Moderate algorithmic depth'
    ],
    performanceImpact: 'medium',
    targetAudience: ['General users', 'Math enthusiasts', 'Design professionals'],
    examples: [
      'Connected Voronoi cells',
      'Basic Penrose tilings',
      'Hexagonal networks',
      'Simple algebraic curves'
    ],
    technicalDetails: {
      maxElements: 500,
      maxGenerations: 5,
      renderComplexity: 4,
      memoryUsage: 'low'
    }
  },
  {
    level: 'advanced',
    icon: '🌳',
    emoji: '🌳',
    description: 'Complex mathematical structures with sophisticated algorithmic generation. Showcases advanced mathematical concepts.',
    shortDescription: 'Complex mathematical structures',
    mathematicalFeatures: [
      'Advanced geometric algorithms',
      'Multi-layered pattern generation',
      'Complex curve families',
      'Sophisticated symmetries'
    ],
    performanceImpact: 'high',
    targetAudience: ['Professionals', 'Researchers', 'Advanced users'],
    examples: [
      'Multi-generation Penrose tilings',
      'Complex Voronoi relaxation',
      'Circuit-like hex grids',
      'Parametric curve families'
    ],
    technicalDetails: {
      maxElements: 2000,
      maxGenerations: 7,
      renderComplexity: 6,
      memoryUsage: 'moderate'
    }
  },
  {
    level: 'expert',
    icon: '🏔️',
    emoji: '🏔️',
    description: 'Research-level visualizations with cutting-edge mathematical algorithms. Pushes the boundaries of pattern complexity.',
    shortDescription: 'Research-level visualizations',
    mathematicalFeatures: [
      'Research-grade algorithms',
      'High-order mathematical functions',
      'Complex topological relationships',
      'Advanced computational geometry'
    ],
    performanceImpact: 'very-high',
    targetAudience: ['Researchers', 'Mathematicians', 'Advanced professionals'],
    examples: [
      'High-order Penrose variants',
      'Lloyds relaxation Voronoi',
      'Multi-layer hex circuits',
      'Higher-order algebraic curves'
    ],
    technicalDetails: {
      maxElements: 5000,
      maxGenerations: 9,
      renderComplexity: 8,
      memoryUsage: 'high'
    }
  },
  {
    level: 'research',
    icon: '🎓',
    emoji: '🎓',
    description: 'Cutting-edge mathematical concepts at the forefront of research. Experimental algorithms and novel mathematical visualizations.',
    shortDescription: 'Cutting-edge research concepts',
    mathematicalFeatures: [
      'Experimental algorithms',
      'Novel mathematical concepts',
      'Topological transformations',
      'Computational mathematics frontiers'
    ],
    performanceImpact: 'very-high',
    targetAudience: ['Research mathematicians', 'Academic researchers', 'PhD students'],
    examples: [
      'Experimental tiling variants',
      'Advanced geometric algorithms',
      'Research-grade curve generation',
      'Novel pattern discovery'
    ],
    technicalDetails: {
      maxElements: 10000,
      maxGenerations: 12,
      renderComplexity: 10,
      memoryUsage: 'intensive'
    }
  }
];

// ==========================================
// Helper Functions
// ==========================================

const getComplexityIndex = (level: ComplexityLevel): number => {
  return COMPLEXITY_LEVELS.findIndex(config => config.level === level);
};

const getComplexityConfig = (level: ComplexityLevel): ComplexityConfig => {
  return COMPLEXITY_LEVELS.find(config => config.level === level) || COMPLEXITY_LEVELS[1];
};

// ==========================================
// Main Hook Implementation
// ==========================================

export const useComplexityLevel = (
  initialLevel: ComplexityLevel = 'intermediate'
): UseComplexityLevelReturn => {
  const [currentLevel, setCurrentLevel] = useState<ComplexityLevel>(initialLevel);

  // ==========================================
  // Derived Values
  // ==========================================

  const currentIndex = useMemo(() => getComplexityIndex(currentLevel), [currentLevel]);
  const currentConfig = useMemo(() => getComplexityConfig(currentLevel), [currentLevel]);

  const canIncrease = useMemo(() => currentIndex < COMPLEXITY_LEVELS.length - 1, [currentIndex]);
  const canDecrease = useMemo(() => currentIndex > 0, [currentIndex]);

  // ==========================================
  // Level Management Functions
  // ==========================================

  const setLevel = useCallback((level: ComplexityLevel) => {
    const config = getComplexityConfig(level);
    if (config) {
      setCurrentLevel(level);
    }
  }, []);

  const increaseLevel = useCallback(() => {
    if (canIncrease) {
      const nextIndex = currentIndex + 1;
      setCurrentLevel(COMPLEXITY_LEVELS[nextIndex].level);
    }
  }, [canIncrease, currentIndex]);

  const decreaseLevel = useCallback(() => {
    if (canDecrease) {
      const prevIndex = currentIndex - 1;
      setCurrentLevel(COMPLEXITY_LEVELS[prevIndex].level);
    }
  }, [canDecrease, currentIndex]);

  // ==========================================
  // Information Functions
  // ==========================================

  const getLevelIcon = useCallback((level?: ComplexityLevel): string => {
    const targetLevel = level || currentLevel;
    const config = getComplexityConfig(targetLevel);
    return config.icon;
  }, [currentLevel]);

  const getLevelDescription = useCallback((level?: ComplexityLevel): string => {
    const targetLevel = level || currentLevel;
    const config = getComplexityConfig(targetLevel);
    return config.description;
  }, [currentLevel]);

  const getLevelShortDescription = useCallback((level?: ComplexityLevel): string => {
    const targetLevel = level || currentLevel;
    const config = getComplexityConfig(targetLevel);
    return config.shortDescription;
  }, [currentLevel]);

  const getLevelFeatures = useCallback((level?: ComplexityLevel): string[] => {
    const targetLevel = level || currentLevel;
    const config = getComplexityConfig(targetLevel);
    return config.mathematicalFeatures;
  }, [currentLevel]);

  const getLevelExamples = useCallback((level?: ComplexityLevel): string[] => {
    const targetLevel = level || currentLevel;
    const config = getComplexityConfig(targetLevel);
    return config.examples;
  }, [currentLevel]);

  const getPerformanceImpact = useCallback((level?: ComplexityLevel): string => {
    const targetLevel = level || currentLevel;
    const config = getComplexityConfig(targetLevel);
    return config.performanceImpact;
  }, [currentLevel]);

  const getTechnicalDetails = useCallback((level?: ComplexityLevel) => {
    const targetLevel = level || currentLevel;
    const config = getComplexityConfig(targetLevel);
    return config.technicalDetails;
  }, [currentLevel]);

  // ==========================================
  // Advanced Functions
  // ==========================================

  const getOptimalLevel = useCallback((
    deviceCapability: 'low' | 'medium' | 'high',
    userExperience: 'beginner' | 'intermediate' | 'expert',
    performancePreference: 'battery' | 'balanced' | 'performance'
  ): ComplexityLevel => {
    // Algorithm to determine optimal complexity level based on factors
    let baseScore = 1; // Start with intermediate (index 1)

    // Adjust for device capability
    switch (deviceCapability) {
      case 'low':
        baseScore -= 1;
        break;
      case 'high':
        baseScore += 1;
        break;
      default:
        break;
    }

    // Adjust for user experience
    switch (userExperience) {
      case 'beginner':
        baseScore -= 1;
        break;
      case 'expert':
        baseScore += 2;
        break;
      default:
        break;
    }

    // Adjust for performance preference
    switch (performancePreference) {
      case 'battery':
        baseScore -= 1;
        break;
      case 'performance':
        baseScore += 1;
        break;
      default:
        break;
    }

    // Clamp to valid range
    const clampedIndex = Math.max(0, Math.min(COMPLEXITY_LEVELS.length - 1, baseScore));
    return COMPLEXITY_LEVELS[clampedIndex].level;
  }, []);

  const getComplexityTransition = useCallback((
    fromLevel: ComplexityLevel,
    toLevel: ComplexityLevel,
    progress: number // 0-1
  ) => {
    const fromIndex = getComplexityIndex(fromLevel);
    const toIndex = getComplexityIndex(toLevel);
    
    const fromConfig = COMPLEXITY_LEVELS[fromIndex];
    const toConfig = COMPLEXITY_LEVELS[toIndex];
    
    // Interpolate technical parameters
    const interpolatedElements = Math.round(
      fromConfig.technicalDetails.maxElements + 
      (toConfig.technicalDetails.maxElements - fromConfig.technicalDetails.maxElements) * progress
    );
    
    const interpolatedGenerations = Math.round(
      fromConfig.technicalDetails.maxGenerations + 
      (toConfig.technicalDetails.maxGenerations - fromConfig.technicalDetails.maxGenerations) * progress
    );
    
    const interpolatedComplexity = 
      fromConfig.technicalDetails.renderComplexity + 
      (toConfig.technicalDetails.renderComplexity - fromConfig.technicalDetails.renderComplexity) * progress;

    return {
      maxElements: interpolatedElements,
      maxGenerations: interpolatedGenerations,
      renderComplexity: interpolatedComplexity,
      transitionProgress: progress
    };
  }, []);

  const getAllLevels = useCallback(() => {
    return COMPLEXITY_LEVELS.map(config => ({
      level: config.level,
      icon: config.icon,
      shortDescription: config.shortDescription,
      performanceImpact: config.performanceImpact
    }));
  }, []);

  // ==========================================
  // Performance Calculations
  // ==========================================

  const getExpectedPerformance = useCallback((level?: ComplexityLevel) => {
    const targetLevel = level || currentLevel;
    const config = getComplexityConfig(targetLevel);
    const details = config.technicalDetails;
    
    // Estimate performance metrics based on complexity
    const estimatedRenderTime = details.renderComplexity * 10; // ms
    const estimatedFrameRate = Math.max(15, 60 - details.renderComplexity * 5);
    const estimatedMemoryUsage = details.maxElements * 0.1; // KB estimate
    
    return {
      renderTime: estimatedRenderTime,
      frameRate: estimatedFrameRate,
      memoryUsage: estimatedMemoryUsage,
      complexity: details.renderComplexity
    };
  }, [currentLevel]);

  // ==========================================
  // Return Hook Interface
  // ==========================================

  return {
    currentLevel,
    setLevel,
    canIncrease,
    canDecrease,
    increaseLevel,
    decreaseLevel,
    getLevelIcon,
    getLevelDescription: getLevelDescription,
    
    // Extended functionality
    getLevelShortDescription,
    getLevelFeatures,
    getLevelExamples,
    getPerformanceImpact,
    getTechnicalDetails,
    getOptimalLevel,
    getComplexityTransition,
    getAllLevels,
    getExpectedPerformance,
    
    // Current level information
    currentConfig,
    currentIndex,
    totalLevels: COMPLEXITY_LEVELS.length
  };
};

// ==========================================
// Additional Utility Hooks
// ==========================================

/**
 * Hook for adaptive complexity based on performance monitoring
 */
export const useAdaptiveComplexity = (
  initialLevel: ComplexityLevel = 'intermediate',
  performanceThreshold = { minFPS: 30, maxRenderTime: 50 }
) => {
  const complexityHook = useComplexityLevel(initialLevel);
  const [performanceHistory, setPerformanceHistory] = useState<number[]>([]);
  const [adaptiveMode, setAdaptiveMode] = useState(false);

  const updatePerformance = useCallback((renderTime: number, frameRate: number) => {
    if (!adaptiveMode) return;

    setPerformanceHistory(prev => {
      const newHistory = [...prev, renderTime].slice(-10); // Keep last 10 measurements
      
      const avgRenderTime = newHistory.reduce((sum, time) => sum + time, 0) / newHistory.length;
      
      // Adaptive logic
      if (avgRenderTime > performanceThreshold.maxRenderTime && complexityHook.canDecrease) {
        complexityHook.decreaseLevel();
      } else if (avgRenderTime < performanceThreshold.maxRenderTime * 0.5 && complexityHook.canIncrease) {
        complexityHook.increaseLevel();
      }
      
      return newHistory;
    });
  }, [adaptiveMode, complexityHook, performanceThreshold]);

  const enableAdaptiveMode = useCallback(() => {
    setAdaptiveMode(true);
    setPerformanceHistory([]);
  }, []);

  const disableAdaptiveMode = useCallback(() => {
    setAdaptiveMode(false);
    setPerformanceHistory([]);
  }, []);

  return {
    ...complexityHook,
    updatePerformance,
    enableAdaptiveMode,
    disableAdaptiveMode,
    adaptiveMode,
    performanceHistory
  };
};

export default useComplexityLevel;