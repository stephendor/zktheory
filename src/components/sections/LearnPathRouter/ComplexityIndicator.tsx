/**
 * Complexity Indicator Component
 * Visual representation of learning complexity levels
 * Allows users to navigate between complexity levels within their path
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { ComplexityIndicatorProps } from './types';

export const ComplexityIndicator: React.FC<ComplexityIndicatorProps> = ({
  currentComplexity,
  availableLevels,
  allLevels,
  onComplexityChange,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredLevel, setHoveredLevel] = useState<string | null>(null);

  // Filter available levels for the current path
  const availableComplexityLevels = allLevels.filter(level => 
    availableLevels.includes(level.id)
  );

  // Find current level index for progress calculation
  const currentIndex = availableComplexityLevels.findIndex(level => 
    level.id === currentComplexity.id
  );

  const handleComplexityChange = useCallback((complexity: any) => {
    if (availableLevels.includes(complexity.id)) {
      onComplexityChange(complexity);
      setIsExpanded(false);
    }
  }, [availableLevels, onComplexityChange]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const containerClasses = classNames(
    'complexity-indicator',
    'relative',
    className
  );

  const progressBarClasses = classNames(
    'progress-bar',
    'w-full h-2 bg-slate-700 rounded-full overflow-hidden',
    'relative'
  );

  const progressFillClasses = classNames(
    'progress-fill',
    'h-full bg-gradient-to-r from-math-primary to-math-secondary',
    'transition-all duration-500 ease-out',
    'rounded-full'
  );

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Learning Complexity
        </h3>
        <button
          onClick={toggleExpanded}
          className="p-2 rounded-lg bg-math-primary/20 text-math-primary hover:bg-math-primary/30 transition-colors"
          aria-label={isExpanded ? 'Collapse complexity options' : 'Expand complexity options'}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {/* Current Level Display */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{currentComplexity.label.split(' ')[0]}</span>
          <div>
            <h4 className="font-medium text-white">
              {currentComplexity.label.split(' ').slice(1).join(' ')}
            </h4>
            <p className="text-sm text-math-muted">
              {currentComplexity.description}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-math-muted mb-1">
          <span>Progress</span>
          <span>{Math.round(((currentIndex + 1) / availableComplexityLevels.length) * 100)}%</span>
        </div>
        <div className={progressBarClasses}>
          <motion.div
            className={progressFillClasses}
            initial={{ width: 0 }}
            animate={{ 
              width: `${((currentIndex + 1) / availableComplexityLevels.length) * 100}%` 
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Expandable Complexity Options */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="space-y-2">
              {availableComplexityLevels.map((level, index) => {
                const isCurrent = level.id === currentComplexity.id;
                const isAvailable = index <= currentIndex + 1; // Allow moving forward by one level
                const isCompleted = index <= currentIndex;

                return (
                  <motion.button
                    key={level.id}
                    className={classNames(
                      'complexity-option',
                      'w-full p-3 rounded-lg border-2 transition-all duration-200',
                      'text-left flex items-center gap-3',
                      {
                        'border-math-primary bg-math-primary/20 text-white': isCurrent,
                        'border-slate-600 bg-slate-700/50 text-white hover:border-slate-500': !isCurrent && isAvailable,
                        'border-slate-800 bg-slate-800/30 text-slate-500 cursor-not-allowed': !isAvailable,
                        'border-green-600 bg-green-600/20 text-green-400': isCompleted && !isCurrent
                      }
                    )}
                    onClick={() => isAvailable && handleComplexityChange(level)}
                    disabled={!isAvailable}
                    onMouseEnter={() => setHoveredLevel(level.id)}
                    onMouseLeave={() => setHoveredLevel(null)}
                    whileHover={isAvailable ? { scale: 1.02 } : {}}
                    whileTap={isAvailable ? { scale: 0.98 } : {}}
                  >
                    {/* Level Icon */}
                    <span className="text-xl">
                      {level.label.split(' ')[0]}
                    </span>
                    
                    {/* Level Info */}
                    <div className="flex-1">
                      <h5 className="font-medium">
                        {level.label.split(' ').slice(1).join(' ')}
                      </h5>
                      <p className="text-xs text-math-muted">
                        {level.description}
                      </p>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="w-2 h-2 bg-math-primary rounded-full animate-pulse" />
                      )}
                      {isCompleted && !isCurrent && (
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                      {!isAvailable && (
                        <span className="w-2 h-2 bg-slate-600 rounded-full" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Help Text */}
            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
              <p className="text-xs text-math-muted">
                <strong>Tip:</strong> Progress through complexity levels sequentially to build a strong foundation. 
                You can always return to previous levels for review.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Navigation (Always Visible) */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700">
        <button
          onClick={() => {
            const prevIndex = Math.max(0, currentIndex - 1);
            const prevLevel = availableComplexityLevels[prevIndex];
            if (prevLevel && prevLevel.id !== currentComplexity.id) {
              handleComplexityChange(prevLevel);
            }
          }}
          disabled={currentIndex === 0}
          className={classNames(
            'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            {
              'bg-math-primary/20 text-math-primary hover:bg-math-primary/30': currentIndex > 0,
              'bg-slate-800/50 text-slate-500 cursor-not-allowed': currentIndex === 0
            }
          )}
        >
          ← Previous
        </button>

        <span className="text-xs text-math-muted">
          {currentIndex + 1} of {availableComplexityLevels.length}
        </span>

        <button
          onClick={() => {
            const nextIndex = Math.min(availableComplexityLevels.length - 1, currentIndex + 1);
            const nextLevel = availableComplexityLevels[nextIndex];
            if (nextLevel && nextLevel.id !== currentComplexity.id && nextIndex <= currentIndex + 1) {
              handleComplexityChange(nextLevel);
            }
          }}
          disabled={currentIndex >= availableComplexityLevels.length - 1 || currentIndex + 1 >= availableComplexityLevels.length}
          className={classNames(
            'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            {
              'bg-math-primary/20 text-math-primary hover:bg-math-primary/30': currentIndex < availableComplexityLevels.length - 1 && currentIndex + 1 < availableComplexityLevels.length,
              'bg-slate-800/50 text-slate-500 cursor-not-allowed': currentIndex >= availableComplexityLevels.length - 1 || currentIndex + 1 >= availableComplexityLevels.length
            }
          )}
        >
          Next →
        </button>
      </div>
    </div>
  );
};
