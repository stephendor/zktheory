/**
 * Complexity Indicators Component
 * Visual progression markers using mathematical precision and emoji semantics
 * 🌱 → 🎯 → 🧠 → 🎓 progression for clarity and accessibility
 */

'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { useProgressiveDisclosure, type DisclosureStage, type ComplexityLevel } from './ProgressiveDisclosureProvider';

// ==========================================
// Mathematical Constants
// ==========================================

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2; // φ ≈ 1.618
const GOLDEN_EASING = 'cubic-bezier(0.618, 0, 0.382, 1)';

// ==========================================
// Complexity Level Definitions
// ==========================================

interface ComplexityDefinition {
  level: ComplexityLevel;
  stage: DisclosureStage;
  title: string;
  description: string;
  features: string[];
  mathematicalConcept: string;
  userBenefit: string;
  estimatedTime: string;
  color: {
    primary: string;
    secondary: string;
    background: string;
  };
}

const COMPLEXITY_DEFINITIONS: ComplexityDefinition[] = [
  {
    level: '🌱',
    stage: 0,
    title: 'Foundation',
    description: 'Basic structure and initial value proposition',
    features: ['Clean layout', 'Trust signals', 'Quick orientation'],
    mathematicalConcept: 'Set theory basics',
    userBenefit: 'Immediate understanding',
    estimatedTime: '< 5 seconds',
    color: {
      primary: '#10B981', // Green-500
      secondary: '#059669', // Green-600
      background: '#ECFDF5' // Green-50
    }
  },
  {
    level: '🎯',
    stage: 1,
    title: 'Value Focus',
    description: 'Clear value propositions with trust indicators',
    features: ['ROI metrics', 'Trust badges', 'Social proof'],
    mathematicalConcept: 'Function composition',
    userBenefit: 'Builds confidence',
    estimatedTime: '5-15 seconds',
    color: {
      primary: '#3B82F6', // Blue-500
      secondary: '#2563EB', // Blue-600
      background: '#EFF6FF' // Blue-50
    }
  },
  {
    level: '🧠',
    stage: 2,
    title: 'Pathway Preview',
    description: 'Detailed previews with quick wins and examples',
    features: ['Interactive demos', 'Code samples', 'Case studies'],
    mathematicalConcept: 'Topology fundamentals',
    userBenefit: 'Hands-on understanding',
    estimatedTime: '15-60 seconds',
    color: {
      primary: '#8B5CF6', // Violet-500
      secondary: '#7C3AED', // Violet-600
      background: '#F5F3FF' // Violet-50
    }
  },
  {
    level: '🎓',
    stage: 3,
    title: 'Full Complexity',
    description: 'Complete access to tools, documentation, and features',
    features: ['Full toolset', 'Advanced docs', 'Expert features'],
    mathematicalConcept: 'Advanced mathematical frameworks',
    userBenefit: 'Expert-level capabilities',
    estimatedTime: '60+ seconds',
    color: {
      primary: '#F59E0B', // Amber-500
      secondary: '#D97706', // Amber-600
      background: '#FFFBEB' // Amber-50
    }
  }
];

// ==========================================
// Types
// ==========================================

interface ComplexityIndicatorsProps {
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'compact';
  showLabels?: boolean;
  showProgress?: boolean;
  showEstimatedTime?: boolean;
  interactive?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

// ==========================================
// Complexity Indicators Component
// ==========================================

export const ComplexityIndicators: React.FC<ComplexityIndicatorsProps> = ({
  className = '',
  variant = 'horizontal',
  showLabels = true,
  showProgress = true,
  showEstimatedTime = false,
  interactive = true,
  position = 'top-right'
}) => {
  const { 
    disclosureState, 
    jumpToStage, 
    getStageProgress, 
    trackInteraction,
    isStageActive 
  } = useProgressiveDisclosure();

  // ==========================================
  // Position Styles
  // ==========================================
  
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };

  // ==========================================
  // Animation Variants
  // ==========================================
  
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.4,
        ease: GOLDEN_EASING,
        staggerChildren: 0.1
      }
    }
  };

  const indicatorVariants = {
    inactive: { 
      scale: 1, 
      opacity: 0.6,
      y: 0,
      transition: { duration: 0.3, ease: GOLDEN_EASING }
    },
    active: { 
      scale: 1.1, 
      opacity: 1,
      y: -2,
      transition: { duration: 0.3, ease: GOLDEN_EASING }
    },
    completed: { 
      scale: 1, 
      opacity: 0.8,
      y: 0,
      transition: { duration: 0.3, ease: GOLDEN_EASING }
    }
  };

  // ==========================================
  // Event Handlers
  // ==========================================
  
  const handleIndicatorClick = (stage: DisclosureStage) => {
    if (!interactive) return;
    
    trackInteraction(`complexity_indicator_click_stage_${stage}`, disclosureState.currentStage);
    jumpToStage(stage);
  };

  // ==========================================
  // Render Helpers
  // ==========================================
  
  const renderIndicator = (definition: ComplexityDefinition, index: number) => {
    const isCurrentStage = disclosureState.currentStage === definition.stage;
    const isCompletedStage = disclosureState.currentStage > definition.stage;
    const progress = getStageProgress(definition.stage);
    
    const animationState = isCurrentStage ? 'active' : isCompletedStage ? 'completed' : 'inactive';
    
    return (
      <motion.div
        key={definition.stage}
        variants={indicatorVariants}
        animate={animationState}
        className={classNames(
          'relative cursor-pointer group',
          {
            'pointer-events-none': !interactive
          }
        )}
        onClick={() => handleIndicatorClick(definition.stage)}
      >
        {/* Main Indicator */}
        <div
          className={classNames(
            'relative w-12 h-12 rounded-full flex items-center justify-center text-xl',
            'transition-all duration-300 border-2',
            {
              'bg-white border-gray-300': !isStageActive(definition.stage),
              'border-2': isCurrentStage,
              'shadow-lg': isCurrentStage || isCompletedStage
            }
          )}
          style={{
            backgroundColor: isStageActive(definition.stage) ? definition.color.background : 'white',
            borderColor: isStageActive(definition.stage) ? definition.color.primary : '#D1D5DB'
          }}
        >
          <span className="relative z-10">{definition.level}</span>
          
          {/* Progress Ring */}
          {isCurrentStage && showProgress && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${definition.color.primary} ${progress * 360}deg, transparent 0deg)`,
                padding: '2px'
              }}
              initial={{ rotate: -90 }}
              animate={{ rotate: -90 }}
            >
              <div className="w-full h-full rounded-full bg-white" />
            </motion.div>
          )}
          
          {/* Completion Checkmark */}
          {isCompletedStage && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
            >
              <span className="text-white text-xs">✓</span>
            </motion.div>
          )}
        </div>

        {/* Tooltip/Label */}
        {showLabels && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              className={classNames(
                'absolute z-20 p-3 rounded-lg shadow-lg border min-w-48',
                'bg-white/95 backdrop-blur-sm',
                {
                  // Position based on variant
                  'top-14 left-1/2 transform -translate-x-1/2': variant === 'horizontal',
                  'left-14 top-1/2 transform -translate-y-1/2': variant === 'vertical',
                  'top-14 left-0': variant === 'compact'
                }
              )}
              style={{ borderColor: definition.color.primary }}
            >
              {/* Arrow pointer */}
              <div
                className="absolute w-3 h-3 transform rotate-45 border"
                style={{
                  backgroundColor: 'white',
                  borderColor: definition.color.primary,
                  top: variant === 'horizontal' ? '-6px' : undefined,
                  left: variant === 'horizontal' ? '50%' : variant === 'vertical' ? '-6px' : undefined,
                  transform: variant === 'horizontal' 
                    ? 'translateX(-50%) rotate(45deg)' 
                    : variant === 'vertical'
                    ? 'translateY(-50%) rotate(45deg)'
                    : 'rotate(45deg)'
                }}
              />
              
              <div className="relative z-10">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">{definition.level}</span>
                  <span 
                    className="font-semibold text-sm"
                    style={{ color: definition.color.primary }}
                  >
                    {definition.title}
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 mb-2">
                  {definition.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  {definition.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: definition.color.background,
                        color: definition.color.secondary
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                {showEstimatedTime && (
                  <div className="text-xs text-gray-500 font-mono">
                    ⏱️ {definition.estimatedTime}
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-1">
                  💡 {definition.userBenefit}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Connection Line */}
        {index < COMPLEXITY_DEFINITIONS.length - 1 && variant !== 'compact' && (
          <div
            className={classNames(
              'absolute',
              {
                'top-1/2 left-12 w-8 h-0.5 transform -translate-y-1/2': variant === 'horizontal',
                'left-1/2 top-12 w-0.5 h-8 transform -translate-x-1/2': variant === 'vertical'
              }
            )}
            style={{
              backgroundColor: isCompletedStage ? definition.color.primary : '#E5E7EB'
            }}
          />
        )}
      </motion.div>
    );
  };

  // ==========================================
  // Main Render
  // ==========================================
  
  return (
    <motion.div
      className={classNames(
        'fixed z-40',
        positionClasses[position],
        {
          'flex space-x-4': variant === 'horizontal',
          'flex flex-col space-y-4': variant === 'vertical',
          'grid grid-cols-2 gap-2': variant === 'compact'
        },
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {COMPLEXITY_DEFINITIONS.map((definition, index) => renderIndicator(definition, index))}
      
      {/* Current Stage Info */}
      <motion.div
        className={classNames(
          'mt-4 p-3 rounded-lg bg-white/90 backdrop-blur-sm border border-gray-200',
          {
            'hidden': variant === 'compact'
          }
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: GOLDEN_EASING }}
      >
        <div className="text-sm font-medium text-gray-900 mb-1">
          Current: {COMPLEXITY_DEFINITIONS[disclosureState.currentStage].title}
        </div>
        <div className="text-xs text-gray-600">
          {COMPLEXITY_DEFINITIONS[disclosureState.currentStage].userBenefit}
        </div>
        
        {/* Progress Bar */}
        {showProgress && (
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <motion.div
              className="h-1.5 rounded-full"
              style={{ 
                backgroundColor: COMPLEXITY_DEFINITIONS[disclosureState.currentStage].color.primary 
              }}
              initial={{ width: 0 }}
              animate={{ 
                width: `${(disclosureState.currentStage + 1) / COMPLEXITY_DEFINITIONS.length * 100}%` 
              }}
              transition={{ duration: 0.5, ease: GOLDEN_EASING }}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ComplexityIndicators;