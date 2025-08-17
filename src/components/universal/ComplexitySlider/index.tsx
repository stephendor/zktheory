/**
 * Universal ComplexitySlider Component
 * Main component implementing mathematical complexity progression
 * with golden ratio design, accessibility features, and performance optimization
 */

'use client';

import React, { 
  useCallback, 
  useMemo, 
  useRef, 
  useEffect, 
  useState,
  forwardRef
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useComplexity, useComplexityAccessibility, useComplexityMath } from './useComplexity';
import type {
  ComplexitySliderProps,
  ComplexityLevel,
  ComplexityLevelId,
  MathematicalPosition
} from './types';
import styles from './ComplexitySlider.module.css';

// ==========================================
// Mathematical Constants
// ==========================================

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
const FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89] as const;

// ==========================================
// Sub-components
// ==========================================

interface ComplexityIndicatorProps {
  level: ComplexityLevel;
  isSelected: boolean;
  isHovered: boolean;
  isUnlocked: boolean;
  onClick: (level: ComplexityLevel) => void;
  onMouseEnter: (level: ComplexityLevel) => void;
  onMouseLeave: () => void;
  size: NonNullable<ComplexitySliderProps['appearance']['size']>;
  orientation: NonNullable<ComplexitySliderProps['appearance']['orientation']>;
  showProgress?: boolean;
  progress?: number;
  style?: React.CSSProperties;
}

const ComplexityIndicator: React.FC<ComplexityIndicatorProps> = ({
  level,
  isSelected,
  isHovered,
  isUnlocked,
  onClick,
  onMouseEnter,
  onMouseLeave,
  size,
  orientation,
  showProgress = false,
  progress = 0,
  style
}) => {
  const { getContrastColors } = useComplexityAccessibility();
  const prefersReducedMotion = useReducedMotion();
  
  const colors = getContrastColors(level);
  
  const handleClick = useCallback(() => {
    if (isUnlocked) {
      onClick(level);
    }
  }, [isUnlocked, onClick, level]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const progressAngle = showProgress ? progress * 360 : 0;

  return (
    <motion.button
      className={`
        ${styles.levelIndicator}
        ${styles[size]}
        ${styles[orientation]}
        ${styles[level.id]}
        ${isSelected ? styles.selected : ''}
        ${isUnlocked ? styles.unlocked : styles.locked}
      `}
      style={{
        ...style,
        borderColor: colors.border,
        color: isSelected ? colors.background : colors.foreground,
        backgroundColor: isSelected ? colors.border : colors.background,
        '--progress-angle': `${progressAngle}deg`
      } as React.CSSProperties}
      onClick={handleClick}
      onMouseEnter={() => onMouseEnter(level)}
      onMouseLeave={onMouseLeave}
      onKeyDown={handleKeyDown}
      disabled={!isUnlocked}
      aria-label={`${level.label} complexity level`}
      aria-description={`${level.description}. Mathematical complexity: ${level.mathComplexity.toFixed(2)}`}
      aria-pressed={isSelected}
      role="radio"
      tabIndex={isUnlocked ? 0 : -1}
      whileHover={!prefersReducedMotion && isUnlocked ? { scale: 1.1 } : undefined}
      whileTap={!prefersReducedMotion && isUnlocked ? { scale: 0.95 } : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Progress Ring */}
      {showProgress && progress > 0 && (
        <div 
          className={styles.progressRing}
          style={{ '--progress-angle': `${progressAngle}deg` } as React.CSSProperties}
        />
      )}
      
      {/* Emoji */}
      <span aria-hidden="true">
        {level.emoji}
      </span>
      
      {/* Label */}
      <div className={`${styles.levelLabel} ${styles[orientation]}`}>
        {level.label}
      </div>
    </motion.button>
  );
};

interface ComplexityTooltipProps {
  level: ComplexityLevel | null;
  show: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  sections: {
    showDescription?: boolean;
    showMathLevel?: boolean;
    showTimeEstimate?: boolean;
    showPrerequisites?: boolean;
    showObjectives?: boolean;
    showDifficulty?: boolean;
  };
}

const ComplexityTooltip: React.FC<ComplexityTooltipProps> = ({
  level,
  show,
  position,
  sections
}) => {
  if (!level || !show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`${styles.tooltip} ${styles[position]}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-2xl">{level.emoji}</span>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{level.label}</h3>
            <div className="text-xs text-gray-500">
              φ = {level.mathComplexity.toFixed(3)}
            </div>
          </div>
        </div>

        {/* Description */}
        {sections.showDescription && (
          <p className="text-sm text-gray-600 mb-3">
            {level.description}
          </p>
        )}

        {/* Math Level */}
        {sections.showMathLevel && (
          <div className="text-xs text-gray-500 mb-2">
            <strong>Math Level:</strong> {level.mathLevel}
          </div>
        )}

        {/* Time Estimate */}
        {sections.showTimeEstimate && (
          <div className="text-xs text-gray-500 mb-2">
            <strong>Time:</strong> {level.estimatedTime}
          </div>
        )}

        {/* Prerequisites */}
        {sections.showPrerequisites && level.prerequisites.length > 0 && (
          <div className="text-xs text-gray-500 mb-2">
            <strong>Prerequisites:</strong> {level.prerequisites.join(', ')}
          </div>
        )}

        {/* Objectives */}
        {sections.showObjectives && level.objectives.length > 0 && (
          <div className="text-xs text-gray-500 mb-2">
            <strong>Objectives:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {level.objectives.slice(0, 3).map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Difficulty */}
        {sections.showDifficulty && (
          <div className="text-xs text-gray-500">
            <strong>Difficulty:</strong> {level.difficulty}/10
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// ==========================================
// Main Component
// ==========================================

export const ComplexitySlider = forwardRef<HTMLDivElement, ComplexitySliderProps>(({
  initialLevel,
  onLevelChange,
  onPrerequisiteCheck,
  onInteraction,
  appearance = {},
  behavior = {},
  accessibility = {},
  className = '',
  style,
  disabled = false
}, ref) => {
  // ==========================================
  // Props with Defaults
  // ==========================================
  
  const {
    orientation = 'horizontal',
    size = 'md',
    theme = 'auto',
    showLabels = true,
    showTooltips = true,
    showProgress = false,
    compactMode = false
  } = appearance;

  const {
    allowJumping = true,
    requirePrerequisites = true,
    enablePreview = true,
    persistSelection = true,
    keyboardNavigation = true
  } = behavior;

  const {
    ariaLabel = 'Mathematical complexity level selector',
    ariaDescription = 'Choose your preferred level of mathematical complexity',
    announceChanges = true,
    keyboardInstructions = true,
    screenReaderOptimized = true
  } = accessibility;

  // ==========================================
  // Hooks
  // ==========================================
  
  const { 
    state, 
    actions, 
    computed,
    utils,
    animations,
    getViewportPositions 
  } = useComplexity();
  
  const { 
    getAriaLabel, 
    getAriaDescription, 
    handleKeyNavigation,
    announceChange 
  } = useComplexityAccessibility();
  
  const { 
    currentComplexity, 
    complexityRatio,
    getOptimalSpacing 
  } = useComplexityMath();

  const prefersReducedMotion = useReducedMotion();

  // ==========================================
  // Local State
  // ==========================================
  
  const [hoveredLevel, setHoveredLevel] = useState<ComplexityLevel | null>(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const previousLevelRef = useRef<ComplexityLevel>(state.currentLevel);

  // ==========================================
  // Effects
  // ==========================================
  
  // Initialize level if provided
  useEffect(() => {
    if (initialLevel && initialLevel !== state.currentLevel.id) {
      actions.setLevel(initialLevel);
    }
  }, [initialLevel, actions, state.currentLevel.id]);

  // Handle level changes
  useEffect(() => {
    if (state.currentLevel.id !== previousLevelRef.current.id) {
      onLevelChange?.(state.currentLevel, previousLevelRef.current);
      
      if (announceChanges) {
        announceChange(state.currentLevel);
      }
      
      onInteraction?.({
        type: 'level_change',
        timestamp: Date.now(),
        fromLevel: previousLevelRef.current.id,
        toLevel: state.currentLevel.id
      });
      
      previousLevelRef.current = state.currentLevel;
    }
  }, [state.currentLevel, onLevelChange, announceChanges, announceChange, onInteraction]);

  // Container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // ==========================================
  // Event Handlers
  // ==========================================
  
  const handleLevelClick = useCallback((level: ComplexityLevel) => {
    if (disabled) return;

    if (requirePrerequisites) {
      const validation = computed.getMissingPrerequisites(level.id);
      if (validation.length > 0) {
        onPrerequisiteCheck?.(level, validation);
        onInteraction?.({
          type: 'prerequisite_check',
          timestamp: Date.now(),
          toLevel: level.id,
          context: { missingPrerequisites: validation }
        });
        return;
      }
    }

    actions.setLevel(level.id);
  }, [disabled, requirePrerequisites, computed, onPrerequisiteCheck, onInteraction, actions]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!keyboardNavigation || disabled) return;
    
    // Show keyboard help on first focus
    if (event.key === 'Tab') {
      setShowKeyboardHelp(true);
      setTimeout(() => setShowKeyboardHelp(false), 3000);
    }
    
    handleKeyNavigation(event.nativeEvent);
  }, [keyboardNavigation, disabled, handleKeyNavigation]);

  const handleMouseEnter = useCallback((level: ComplexityLevel) => {
    if (!disabled) {
      setHoveredLevel(level);
      onInteraction?.({
        type: 'preview',
        timestamp: Date.now(),
        toLevel: level.id
      });
    }
  }, [disabled, onInteraction]);

  const handleMouseLeave = useCallback(() => {
    setHoveredLevel(null);
  }, []);

  // ==========================================
  // Calculations
  // ==========================================
  
  const progressPercentage = useMemo(() => {
    const maxComplexity = Math.max(...state.availableLevels.map(l => l.mathComplexity));
    return (state.currentLevel.mathComplexity / maxComplexity) * 100;
  }, [state.currentLevel.mathComplexity, state.availableLevels]);

  const levelPositions = useMemo(() => {
    if (containerDimensions.width === 0) return {};
    
    return getViewportPositions(
      containerDimensions.width,
      containerDimensions.height,
      orientation
    );
  }, [containerDimensions, orientation, getViewportPositions]);

  // ==========================================
  // Render
  // ==========================================
  
  const themeClass = theme === 'dark' ? styles.dark : '';
  
  return (
    <div
      ref={ref}
      className={`
        ${styles.complexitySlider}
        ${themeClass}
        ${compactMode ? styles.compact : ''}
        ${className}
      `}
      style={style}
    >
      {/* Main Slider Container */}
      <div
        ref={containerRef}
        className={`
          ${styles.sliderContainer}
          ${styles[orientation]}
          ${styles[size]}
        `}
        onKeyDown={handleKeyDown}
        tabIndex={keyboardNavigation ? 0 : -1}
        role="radiogroup"
        aria-label={ariaLabel}
        aria-description={ariaDescription}
        aria-orientation={orientation}
      >
        {/* Background Track */}
        <div className={`${styles.track} ${styles[orientation]}`} />
        
        {/* Progress Track */}
        <motion.div
          className={`${styles.progressTrack} ${styles[orientation]}`}
          style={{
            [orientation === 'horizontal' ? 'width' : 'height']: `${progressPercentage}%`
          }}
          animate={{ 
            [orientation === 'horizontal' ? 'width' : 'height']: `${progressPercentage}%` 
          }}
          transition={{ 
            duration: prefersReducedMotion ? 0 : animations.getTransitionDuration(0, state.currentLevel.value),
            ease: 'easeOut' 
          }}
        />

        {/* Level Indicators */}
        {state.availableLevels.map((level, index) => {
          const position = levelPositions[level.id];
          const isSelected = state.currentLevel.id === level.id;
          const isHovered = hoveredLevel?.id === level.id;
          const isUnlocked = computed.isLevelUnlocked(level.id);
          const progress = state.progress[level.id] || 0;

          return (
            <ComplexityIndicator
              key={level.id}
              level={level}
              isSelected={isSelected}
              isHovered={isHovered}
              isUnlocked={isUnlocked}
              onClick={handleLevelClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              size={size}
              orientation={orientation}
              showProgress={showProgress}
              progress={progress}
              style={position ? {
                [orientation === 'horizontal' ? 'left' : 'top']: 
                  `${(position[orientation === 'horizontal' ? 'x' : 'y'] / 
                    containerDimensions[orientation === 'horizontal' ? 'width' : 'height']) * 100}%`
              } : undefined}
            />
          );
        })}

        {/* Tooltip */}
        {showTooltips && (hoveredLevel || enablePreview) && (
          <ComplexityTooltip
            level={hoveredLevel || state.currentLevel}
            show={!!hoveredLevel || enablePreview}
            position={orientation === 'horizontal' ? 'top' : 'right'}
            sections={{
              showDescription: true,
              showMathLevel: true,
              showTimeEstimate: true,
              showPrerequisites: true,
              showObjectives: !compactMode,
              showDifficulty: !compactMode
            }}
          />
        )}
      </div>

      {/* Current Level Info */}
      {!compactMode && (
        <motion.div 
          className="mt-4 text-center"
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-2">
            <span className="text-3xl">{state.currentLevel.emoji}</span>
            <div>
              <h3 className="font-semibold text-gray-900">{state.currentLevel.label}</h3>
              <div className="text-sm text-gray-500">
                Mathematical Complexity: φ = {state.currentLevel.mathComplexity.toFixed(3)}
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 max-w-md">
            {state.currentLevel.description}
          </p>
          
          {state.currentLevel.mathLevel && (
            <div className="text-xs text-gray-500 mt-2">
              {state.currentLevel.mathLevel}
            </div>
          )}
        </motion.div>
      )}

      {/* Keyboard Instructions */}
      <AnimatePresence>
        {keyboardInstructions && showKeyboardHelp && (
          <motion.div
            className={styles.keyboardInstructions}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-sm font-medium mb-1">Keyboard Navigation</div>
            <div className="text-xs space-y-1">
              <div>← → / ↑ ↓: Navigate levels</div>
              <div>Enter/Space: Select level</div>
              <div>Home/End: Jump to first/last level</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Reader Content */}
      {screenReaderOptimized && (
        <div className={styles.screenReaderOnly}>
          <p>
            Mathematical complexity slider with {state.availableLevels.length} levels.
            Currently selected: {state.currentLevel.label} level.
            Mathematical value: {state.currentLevel.mathComplexity.toFixed(3)}.
            {state.currentLevel.description}
          </p>
        </div>
      )}
    </div>
  );
});

ComplexitySlider.displayName = 'ComplexitySlider';

export default ComplexitySlider;