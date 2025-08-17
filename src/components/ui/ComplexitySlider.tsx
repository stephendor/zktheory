/**
 * Universal Complexity Slider Component
 * Visual indicators for 🌱Foundation → 🌿Conceptual → 🌳Applied → 🎓Research levels
 * with mathematical precision and accessibility
 */

'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { InformationCircleIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

// ==========================================
// Constants & Configuration
// ==========================================

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2; // φ ≈ 1.618
const FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

// Complexity levels with mathematical progression
const COMPLEXITY_LEVELS = [
  {
    id: 'foundation',
    emoji: '🌱',
    label: 'Foundation',
    value: 0,
    mathLevel: 'Basic algebra and arithmetic',
    description: 'Fundamental concepts with visual explanations',
    color: '#10b981', // emerald-500
    prerequisites: [],
    estimatedTime: '5-10 minutes',
    fibonacciIndex: 0
  },
  {
    id: 'conceptual',
    emoji: '🌿',
    label: 'Conceptual',
    value: 1 / GOLDEN_RATIO, // ~0.618
    mathLevel: 'Linear algebra and basic calculus',
    description: 'Core mathematical principles and relationships',
    color: '#059669', // emerald-600
    prerequisites: ['foundation'],
    estimatedTime: '15-25 minutes',
    fibonacciIndex: 1
  },
  {
    id: 'applied',
    emoji: '🌳',
    label: 'Applied',
    value: 1, // Golden ratio normalized
    mathLevel: 'Advanced calculus and abstract algebra',
    description: 'Practical implementations and real-world applications',
    color: '#047857', // emerald-700
    prerequisites: ['foundation', 'conceptual'],
    estimatedTime: '30-45 minutes',
    fibonacciIndex: 2
  },
  {
    id: 'research',
    emoji: '🎓',
    label: 'Research',
    value: GOLDEN_RATIO, // φ
    mathLevel: 'Graduate-level mathematics',
    description: 'Cutting-edge theory and ongoing research',
    color: '#065f46', // emerald-800
    prerequisites: ['foundation', 'conceptual', 'applied'],
    estimatedTime: '60+ minutes',
    fibonacciIndex: 3
  }
];

// ==========================================
// Types
// ==========================================

interface ComplexityLevel {
  id: string;
  emoji: string;
  label: string;
  value: number;
  mathLevel: string;
  description: string;
  color: string;
  prerequisites: string[];
  estimatedTime: string;
  fibonacciIndex: number;
}

interface ComplexitySliderProps {
  initialLevel?: string;
  onLevelChange?: (level: ComplexityLevel) => void;
  onPrerequisiteCheck?: (missingPrereqs: string[]) => void;
  showTooltips?: boolean;
  showMathLevel?: boolean;
  showTimeEstimate?: boolean;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  // Accessibility
  ariaLabel?: string;
  showKeyboardInstructions?: boolean;
}

// ==========================================
// Utility Functions
// ==========================================

const calculatePosition = (level: ComplexityLevel, orientation: 'horizontal' | 'vertical') => {
  // Use golden ratio for natural positioning
  const ratio = level.value / GOLDEN_RATIO;
  const normalizedRatio = Math.min(1, ratio);
  
  if (orientation === 'vertical') {
    return { top: `${(1 - normalizedRatio) * 100}%` };
  }
  return { left: `${normalizedRatio * 100}%` };
};

const getFibonacciSpacing = (index: number) => {
  return FIBONACCI_SEQUENCE[index] || 1;
};

// ==========================================
// Main Component
// ==========================================

export const ComplexitySlider: React.FC<ComplexitySliderProps> = ({
  initialLevel = 'foundation',
  onLevelChange,
  onPrerequisiteCheck,
  showTooltips = true,
  showMathLevel = true,
  showTimeEstimate = true,
  orientation = 'horizontal',
  size = 'md',
  disabled = false,
  className = '',
  ariaLabel = 'Complexity level selector',
  showKeyboardInstructions = true
}) => {
  const prefersReducedMotion = useReducedMotion();
  
  // ==========================================
  // State Management
  // ==========================================
  
  const [selectedLevel, setSelectedLevel] = useState<ComplexityLevel>(
    () => COMPLEXITY_LEVELS.find(level => level.id === initialLevel) || COMPLEXITY_LEVELS[0]
  );
  
  const [hoveredLevel, setHoveredLevel] = useState<ComplexityLevel | null>(null);
  const [showPrerequisites, setShowPrerequisites] = useState(false);
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // ==========================================
  // Size Configuration
  // ==========================================
  
  const sizeConfig = useMemo(() => {
    const configs = {
      sm: {
        height: orientation === 'horizontal' ? '3rem' : '12rem',
        width: orientation === 'horizontal' ? '12rem' : '3rem',
        indicatorSize: '2rem',
        trackThickness: '0.5rem',
        fontSize: 'text-sm',
        emojiSize: 'text-lg'
      },
      md: {
        height: orientation === 'horizontal' ? '4rem' : '16rem',
        width: orientation === 'horizontal' ? '16rem' : '4rem',
        indicatorSize: '2.5rem',
        trackThickness: '0.75rem',
        fontSize: 'text-base',
        emojiSize: 'text-xl'
      },
      lg: {
        height: orientation === 'horizontal' ? '5rem' : '20rem',
        width: orientation === 'horizontal' ? '20rem' : '5rem',
        indicatorSize: '3rem',
        trackThickness: '1rem',
        fontSize: 'text-lg',
        emojiSize: 'text-2xl'
      }
    };
    
    return configs[size];
  }, [size, orientation]);

  // ==========================================
  // Event Handlers
  // ==========================================
  
  const handleLevelSelect = useCallback((level: ComplexityLevel) => {
    if (disabled) return;
    
    // Check prerequisites
    const missingPrereqs = level.prerequisites.filter(
      prereq => !COMPLEXITY_LEVELS.find(l => l.id === prereq && COMPLEXITY_LEVELS.indexOf(l) <= COMPLEXITY_LEVELS.indexOf(selectedLevel))
    );
    
    if (missingPrereqs.length > 0) {
      onPrerequisiteCheck?.(missingPrereqs);
      setShowPrerequisites(true);
      setTimeout(() => setShowPrerequisites(false), 3000);
      return;
    }
    
    setSelectedLevel(level);
    onLevelChange?.(level);
  }, [disabled, selectedLevel, onLevelChange, onPrerequisiteCheck]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;
    
    const currentIndex = COMPLEXITY_LEVELS.indexOf(selectedLevel);
    let nextIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = Math.min(COMPLEXITY_LEVELS.length - 1, currentIndex + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = Math.max(0, currentIndex - 1);
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = COMPLEXITY_LEVELS.length - 1;
        break;
      default:
        return;
    }
    
    if (nextIndex !== currentIndex) {
      handleLevelSelect(COMPLEXITY_LEVELS[nextIndex]);
    }
  }, [disabled, selectedLevel, handleLevelSelect]);

  // ==========================================
  // Animation Variants
  // ==========================================
  
  const indicatorVariants = {
    idle: {
      scale: 1,
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
    },
    hover: {
      scale: 1.1,
      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
    },
    selected: {
      scale: 1.2,
      boxShadow: '0 12px 32px rgba(16, 185, 129, 0.4)'
    }
  };

  const trackVariants = {
    idle: { opacity: 0.3 },
    active: { opacity: 0.6 }
  };

  // ==========================================
  // Mathematical Progress Calculation
  // ==========================================
  
  const progressPercentage = useMemo(() => {
    const maxValue = Math.max(...COMPLEXITY_LEVELS.map(l => l.value));
    return (selectedLevel.value / maxValue) * 100;
  }, [selectedLevel]);

  // ==========================================
  // Render Functions
  // ==========================================
  
  const renderLevelIndicator = (level: ComplexityLevel, index: number) => {
    const isSelected = selectedLevel.id === level.id;
    const isHovered = hoveredLevel?.id === level.id;
    const position = calculatePosition(level, orientation);
    const spacing = getFibonacciSpacing(level.fibonacciIndex);
    
    return (
      <motion.button
        key={level.id}
        className={`absolute flex items-center justify-center rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 ${sizeConfig.emojiSize}`}
        style={{
          ...position,
          width: sizeConfig.indicatorSize,
          height: sizeConfig.indicatorSize,
          backgroundColor: isSelected ? level.color : 'white',
          borderColor: level.color,
          color: isSelected ? 'white' : level.color,
          transform: orientation === 'horizontal' 
            ? 'translateX(-50%)' 
            : 'translateY(-50%)',
          zIndex: isSelected ? 30 : 20
        }}
        variants={indicatorVariants}
        animate={isSelected ? 'selected' : isHovered ? 'hover' : 'idle'}
        onClick={() => handleLevelSelect(level)}
        onMouseEnter={() => setHoveredLevel(level)}
        onMouseLeave={() => setHoveredLevel(null)}
        onFocus={() => setIsKeyboardFocused(true)}
        onBlur={() => setIsKeyboardFocused(false)}
        disabled={disabled}
        aria-label={`${level.label} complexity level: ${level.description}`}
        aria-pressed={isSelected}
        role="radio"
      >
        <span className="font-medium">
          {level.emoji}
        </span>
        
        {/* Level Label */}
        <div 
          className={`absolute ${orientation === 'horizontal' ? 'top-full mt-2' : 'left-full ml-2'} text-xs font-medium whitespace-nowrap`}
          style={{ color: level.color }}
        >
          {level.label}
        </div>
      </motion.button>
    );
  };

  const renderTooltip = () => {
    const level = hoveredLevel || selectedLevel;
    if (!showTooltips || !level) return null;
    
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm"
          style={{
            [orientation === 'horizontal' ? 'bottom' : 'right']: '100%',
            [orientation === 'horizontal' ? 'marginBottom' : 'marginRight']: '0.5rem'
          }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl">{level.emoji}</span>
            <h3 className="font-semibold text-gray-900">{level.label}</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            {level.description}
          </p>
          
          {showMathLevel && (
            <div className="text-xs text-gray-500 mb-2">
              <strong>Math Level:</strong> {level.mathLevel}
            </div>
          )}
          
          {showTimeEstimate && (
            <div className="text-xs text-gray-500 mb-2">
              <strong>Estimated Time:</strong> {level.estimatedTime}
            </div>
          )}
          
          {level.prerequisites.length > 0 && (
            <div className="text-xs text-gray-500">
              <strong>Prerequisites:</strong> {level.prerequisites.join(', ')}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  // ==========================================
  // Main Render
  // ==========================================
  
  return (
    <div className={`relative ${className}`}>
      {/* Slider Container */}
      <div
        ref={sliderRef}
        className="relative focus:outline-none"
        style={{
          width: sizeConfig.width,
          height: sizeConfig.height
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="radiogroup"
        aria-label={ariaLabel}
        aria-orientation={orientation}
      >
        {/* Track Background */}
        <motion.div
          className="absolute bg-gray-200 rounded-full"
          style={{
            [orientation === 'horizontal' ? 'width' : 'height']: '100%',
            [orientation === 'horizontal' ? 'height' : 'width']: sizeConfig.trackThickness,
            [orientation === 'horizontal' ? 'top' : 'left']: '50%',
            transform: orientation === 'horizontal' ? 'translateY(-50%)' : 'translateX(-50%)'
          }}
          variants={trackVariants}
          animate="idle"
        />
        
        {/* Progress Track */}
        <motion.div
          className="absolute bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
          style={{
            [orientation === 'horizontal' ? 'width' : 'height']: `${progressPercentage}%`,
            [orientation === 'horizontal' ? 'height' : 'width']: sizeConfig.trackThickness,
            [orientation === 'horizontal' ? 'top' : 'left']: '50%',
            transform: orientation === 'horizontal' ? 'translateY(-50%)' : 'translateX(-50%)'
          }}
          variants={trackVariants}
          animate="active"
        />
        
        {/* Level Indicators */}
        {COMPLEXITY_LEVELS.map((level, index) => 
          renderLevelIndicator(level, index)
        )}
        
        {/* Tooltip */}
        {renderTooltip()}
      </div>
      
      {/* Current Level Info */}
      <div className={`mt-4 ${sizeConfig.fontSize}`}>
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl">{selectedLevel.emoji}</span>
          <h3 className="font-semibold text-gray-900">{selectedLevel.label}</h3>
          <div className="text-sm text-gray-500">
            φ = {selectedLevel.value.toFixed(3)}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">
          {selectedLevel.description}
        </p>
        
        {showMathLevel && (
          <div className="text-xs text-gray-500">
            {selectedLevel.mathLevel}
          </div>
        )}
      </div>
      
      {/* Keyboard Instructions */}
      {showKeyboardInstructions && isKeyboardFocused && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
        >
          <div className="flex items-center space-x-2 mb-2">
            <InformationCircleIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Keyboard Navigation</span>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <div>Arrow keys: Navigate levels</div>
            <div>Home/End: Jump to first/last level</div>
            <div>Tab: Move to next component</div>
          </div>
        </motion.div>
      )}
      
      {/* Prerequisite Warning */}
      <AnimatePresence>
        {showPrerequisites && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-full left-0 right-0 mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <div className="flex items-center space-x-2 text-amber-800">
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Prerequisites Required</span>
            </div>
            <p className="text-xs text-amber-700 mt-1">
              Complete the earlier levels first to unlock this complexity level.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Screen Reader Information */}
      <div className="sr-only">
        <p>
          Complexity slider with {COMPLEXITY_LEVELS.length} levels. 
          Currently selected: {selectedLevel.label} level. 
          Mathematical value: {selectedLevel.value.toFixed(3)}. 
          {selectedLevel.description}
        </p>
      </div>
    </div>
  );
};

export default ComplexitySlider;