/**
 * Learning Progress Component
 * Visual representation of learning progress and current stage
 * Shows milestones and achievements within the learning path
 */

'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import { LearningProgressProps, LearningStage } from './types';

export const LearningProgress: React.FC<LearningProgressProps> = ({
  stage,
  path,
  complexity,
  onProgressUpdate,
  className
}) => {
  // Define learning stages with descriptions
  const learningStages: Array<{
    id: LearningStage;
    label: string;
    description: string;
    icon: string;
    color: string;
  }> = [
    {
      id: 'exploration',
      label: 'Exploration',
      description: 'Discovering your learning path',
      icon: '🔍',
      color: 'blue'
    },
    {
      id: 'foundation',
      label: 'Foundation',
      description: 'Building basic understanding',
      icon: '🌱',
      color: 'green'
    },
    {
      id: 'conceptual',
      label: 'Conceptual',
      description: 'Understanding relationships',
      icon: '🌿',
      color: 'emerald'
    },
    {
      id: 'applied',
      label: 'Applied',
      description: 'Practical applications',
      icon: '🌳',
      color: 'teal'
    },
    {
      id: 'advanced',
      label: 'Advanced',
      description: 'Complex implementations',
      icon: '🏔️',
      color: 'purple'
    },
    {
      id: 'research',
      label: 'Research',
      description: 'Cutting-edge exploration',
      icon: '🎓',
      color: 'indigo'
    },
    {
      id: 'completion',
      label: 'Completion',
      description: 'Path mastery achieved',
      icon: '🏆',
      color: 'yellow'
    }
  ];

  // Find current stage index
  const currentStageIndex = learningStages.findIndex(s => s.id === stage);
  
  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (currentStageIndex === -1) return 0;
    return Math.round(((currentStageIndex + 1) / learningStages.length) * 100);
  }, [currentStageIndex]);

  // Get relevant stages for the current path
  const relevantStages = useMemo(() => {
    const pathStages = learningStages.filter(s => {
      switch (path.id) {
        case 'business':
          return ['exploration', 'foundation', 'conceptual', 'applied', 'completion'].includes(s.id);
        case 'technical':
          return ['exploration', 'conceptual', 'applied', 'advanced', 'completion'].includes(s.id);
        case 'academic':
          return ['exploration', 'applied', 'advanced', 'research', 'completion'].includes(s.id);
        default:
          return true;
      }
    });
    return pathStages;
  }, [path.id]);

  const containerClasses = classNames(
    'learning-progress',
    'relative',
    className
  );

  const progressBarClasses = classNames(
    'progress-bar',
    'w-full h-3 bg-slate-700 rounded-full overflow-hidden',
    'relative'
  );

  const progressFillClasses = classNames(
    'progress-fill',
    'h-full bg-gradient-to-r from-math-primary via-math-secondary to-math-accent',
    'transition-all duration-700 ease-out',
    'rounded-full'
  );

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Learning Progress
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-math-muted">Stage:</span>
          <span className="text-sm font-medium text-white">
            {learningStages.find(s => s.id === stage)?.label || 'Unknown'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-math-muted mb-2">
          <span>Overall Progress</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className={progressBarClasses}>
          <motion.div
            className={progressFillClasses}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Stage Indicators */}
      <div className="relative">
        <div className="flex justify-between items-center">
          {relevantStages.map((stageInfo, index) => {
            const isCurrent = stageInfo.id === stage;
            const isCompleted = relevantStages.findIndex(s => s.id === stage) >= index;
            const isUpcoming = !isCompleted && !isCurrent;

            return (
              <div key={stageInfo.id} className="relative flex-1">
                {/* Stage Circle */}
                <motion.div
                  className={classNames(
                    'stage-circle',
                    'w-8 h-8 rounded-full mx-auto mb-2',
                    'flex items-center justify-center',
                    'text-sm font-medium',
                    'transition-all duration-300',
                    {
                      'bg-math-primary text-white shadow-lg shadow-math-primary/50': isCurrent,
                      'bg-green-600 text-white': isCompleted && !isCurrent,
                      'bg-slate-600 text-slate-300': isUpcoming
                    }
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  {isCompleted && !isCurrent ? '✓' : stageInfo.icon}
                </motion.div>

                {/* Stage Label */}
                <div className="text-center">
                  <h4 className={classNames(
                    'text-xs font-medium mb-1',
                    {
                      'text-white': isCurrent || isCompleted,
                      'text-slate-400': isUpcoming
                    }
                  )}>
                    {stageInfo.label}
                  </h4>
                  <p className={classNames(
                    'text-xs',
                    {
                      'text-math-secondary': isCurrent,
                      'text-green-400': isCompleted && !isCurrent,
                      'text-slate-500': isUpcoming
                    }
                  )}>
                    {stageInfo.description}
                  </p>
                </div>

                {/* Connection Line */}
                {index < relevantStages.length - 1 && (
                  <div className="absolute top-4 left-1/2 w-full h-0.5 bg-slate-700">
                    <motion.div
                      className={classNames(
                        'h-full transition-all duration-500',
                        {
                          'bg-math-primary': isCompleted,
                          'bg-slate-700': !isCompleted
                        }
                      )}
                      initial={{ width: 0 }}
                      animate={{ 
                        width: isCompleted ? '100%' : '0%' 
                      }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Stage Details */}
      <motion.div
        className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">
            {learningStages.find(s => s.id === stage)?.icon || '📚'}
          </span>
          <div className="flex-1">
            <h4 className="font-medium text-white mb-1">
              Current Stage: {learningStages.find(s => s.id === stage)?.label || 'Unknown'}
            </h4>
            <p className="text-sm text-math-muted mb-2">
              {learningStages.find(s => s.id === stage)?.description || 'Learning in progress'}
            </p>
            
            {/* Stage-specific guidance */}
            <div className="text-xs text-math-secondary">
              {stage === 'exploration' && (
                <p>Take your time to understand the different learning paths and choose the one that best fits your goals.</p>
              )}
              {stage === 'foundation' && (
                <p>Focus on building a solid understanding of basic concepts. Don't rush - strong foundations lead to better learning.</p>
              )}
              {stage === 'conceptual' && (
                <p>Explore how different concepts relate to each other. Look for patterns and connections.</p>
              )}
              {stage === 'applied' && (
                <p>Practice applying your knowledge through interactive examples and real-world scenarios.</p>
              )}
              {stage === 'advanced' && (
                <p>Dive deep into complex implementations and explore advanced features.</p>
              )}
              {stage === 'research' && (
                <p>Contribute to the field by exploring cutting-edge topics and collaborating with researchers.</p>
              )}
              {stage === 'completion' && (
                <p>Congratulations! You've mastered this learning path. Consider exploring other paths or sharing your knowledge.</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onProgressUpdate('exploration', 0)}
          className="px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          Reset Progress
        </button>
        <button
          onClick={() => {
            // Find next stage
            const currentIndex = relevantStages.findIndex(s => s.id === stage);
            if (currentIndex < relevantStages.length - 1) {
              const nextStage = relevantStages[currentIndex + 1];
              onProgressUpdate(nextStage.id, (currentIndex + 2) / relevantStages.length);
            }
          }}
          disabled={currentStageIndex >= relevantStages.length - 1}
          className={classNames(
            'px-3 py-2 text-xs rounded-lg transition-colors',
            {
              'bg-math-primary hover:bg-math-primary/80 text-white': currentStageIndex < relevantStages.length - 1,
              'bg-slate-800 text-slate-500 cursor-not-allowed': currentStageIndex >= relevantStages.length - 1
            }
          )}
        >
          Next Stage
        </button>
      </div>
    </div>
  );
};
