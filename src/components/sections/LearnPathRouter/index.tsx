/**
 * Learn Path Router Component
 * Progressive Educational Pathways for ZKTheory
 * Implements three-path audience routing with complexity-based disclosure
 * Based on ZKTheory Site Architecture specifications
 */

'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import classNames from 'classnames';

// Types
import { LearnPathRouterProps, AudiencePath, ComplexityLevel, LearningStage } from './types';

// Components
import { BusinessLearningPath } from './BusinessLearningPath';
import { TechnicalLearningPath } from './TechnicalLearningPath';
import { AcademicLearningPath } from './AcademicLearningPath';
import { ComplexityIndicator } from './ComplexityIndicator';
import { LearningProgress } from './LearningProgress';
import { PathTransition } from './PathTransition';

// ==========================================
// Default Configurations
// ==========================================

const DEFAULT_COMPLEXITY_LEVELS: ComplexityLevel[] = [
  { id: 'foundation', label: '🌱 Foundation', description: 'Basic concepts and visual introductions' },
  { id: 'conceptual', label: '🌿 Conceptual', description: 'Mathematical relationships and guided discovery' },
  { id: 'applied', label: '🌳 Applied', description: 'Interactive demonstrations and practical applications' },
  { id: 'advanced', label: '🏔️ Advanced', description: 'Complex tools and professional workflows' },
  { id: 'research', label: '🎓 Research', description: 'Cutting-edge mathematics and collaboration' }
];

const DEFAULT_AUDIENCE_PATHS: AudiencePath[] = [
  {
    id: 'business',
    label: 'Business Leaders',
    description: 'ROI, compliance, and implementation focus',
    icon: '💼',
    color: 'business',
    complexityRange: ['foundation', 'conceptual', 'applied'],
    focusAreas: ['roi', 'compliance', 'implementation'],
    timeCommitment: 'flexible'
  },
  {
    id: 'technical',
    label: 'Technical Developers',
    description: 'Code, protocols, and practical applications',
    icon: '⚙️',
    color: 'technical',
    complexityRange: ['conceptual', 'applied', 'advanced'],
    focusAreas: ['fundamentals', 'protocols', 'implementation'],
    timeCommitment: 'structured'
  },
  {
    id: 'academic',
    label: 'Academic Researchers',
    description: 'Theory, research, and collaboration',
    icon: '🎓',
    color: 'academic',
    complexityRange: ['applied', 'advanced', 'research'],
    focusAreas: ['theory', 'research', 'collaboration'],
    timeCommitment: 'deep-dive'
  }
];

// ==========================================
// Main Component
// ==========================================

export const LearnPathRouter: React.FC<LearnPathRouterProps> = ({
  enableProgressiveDisclosure = true,
  showComplexityIndicators = true,
  enablePathTransitions = true,
  performanceMode = 'balanced',
  accessibilityOptimized = true,
  businessConfig,
  technicalConfig,
  academicConfig,
  className,
  onPathSelection,
  onComplexityChange,
  onLearningProgress
}) => {
  // ==========================================
  // State Management
  // ==========================================
  
  const [selectedPath, setSelectedPath] = useState<AudiencePath | null>(null);
  const [currentComplexity, setCurrentComplexity] = useState<ComplexityLevel>(DEFAULT_COMPLEXITY_LEVELS[0]);
  const [learningStage, setLearningStage] = useState<LearningStage>('exploration');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // Configuration Merging
  // ==========================================
  
  const mergedPaths = useMemo(() => {
    return DEFAULT_AUDIENCE_PATHS.map(path => {
      switch (path.id) {
        case 'business':
          return { ...path, ...businessConfig };
        case 'technical':
          return { ...path, ...technicalConfig };
        case 'academic':
          return { ...path, ...academicConfig };
        default:
          return path;
      }
    });
  }, [businessConfig, technicalConfig, academicConfig]);

  // ==========================================
  // Event Handlers
  // ==========================================
  
  const handlePathSelection = useCallback((path: AudiencePath) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setSelectedPath(path);
    
    // Reset complexity to appropriate starting level for the path
    const startingComplexity = path.complexityRange[0];
    const complexityLevel = DEFAULT_COMPLEXITY_LEVELS.find(c => c.id === startingComplexity);
    if (complexityLevel) {
      setCurrentComplexity(complexityLevel);
    }
    
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'learning_path_selected', {
        event_category: 'learning_interaction',
        event_label: path.id,
        custom_parameter_1: path.focusAreas.join(','),
        custom_parameter_2: path.timeCommitment
      });
    }
    
    onPathSelection?.(path);
    
    // Transition animation timing
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, onPathSelection]);

  const handleComplexityChange = useCallback((complexity: ComplexityLevel) => {
    setCurrentComplexity(complexity);
    onComplexityChange?.(complexity);
    
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'complexity_level_changed', {
        event_category: 'learning_progression',
        event_label: complexity.id,
        custom_parameter_1: selectedPath?.id || 'none'
      });
    }
  }, [onComplexityChange, selectedPath]);

  const handleLearningProgress = useCallback((stage: LearningStage, progress: number) => {
    setLearningStage(stage);
    onLearningProgress?.(stage, progress);
  }, [onLearningProgress]);

  // ==========================================
  // Responsive Behavior
  // ==========================================
  
  useEffect(() => {
    const handleResize = () => {
      // Handle responsive behavior
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        if (width < 768) {
          // Mobile: single column layout
          setLearningStage('exploration');
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ==========================================
  // Component Classes
  // ==========================================
  
  const containerClasses = classNames(
    'learn-path-router',
    'relative w-full min-h-screen',
    'flex flex-col items-center justify-center',
    'p-4 md:p-8 lg:p-12',
    'transition-all duration-700 ease-out',
    {
      'opacity-50': isTransitioning,
      'pointer-events-none': isTransitioning
    },
    className
  );

  // ==========================================
  // Render
  // ==========================================
  
  return (
    <div ref={containerRef} className={containerClasses}>
      {/* Header Section */}
      <motion.header 
        className="text-center mb-8 md:mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-math-primary mb-4">
          Learn Zero-Knowledge Proofs
        </h1>
        <p className="text-lg md:text-xl text-math-secondary max-w-3xl mx-auto leading-relaxed">
          Choose your path and discover the mathematical elegance of ZK protocols through progressive learning
        </p>
      </motion.header>

      {/* Path Selection Section */}
      {!selectedPath && (
        <motion.section 
          className="w-full max-w-6xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {mergedPaths.map((path, index) => (
              <motion.div
                key={path.id}
                className={classNames(
                  'path-card',
                  'relative p-6 md:p-8 rounded-2xl',
                  'border-2 border-transparent',
                  'bg-gradient-to-br from-slate-800/50 to-slate-900/50',
                  'backdrop-blur-sm',
                  'cursor-pointer transition-all duration-300',
                  'hover:scale-105 hover:shadow-2xl',
                  'focus:outline-none focus:ring-4 focus:ring-math-primary/50',
                  {
                    'from-business-800/50 to-business-900/50': path.color === 'business',
                    'from-technical-800/50 to-technical-900/50': path.color === 'technical',
                    'from-academic-800/50 to-academic-900/50': path.color === 'academic'
                  }
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index, ease: 'easeOut' }}
                whileHover={{ y: -5 }}
                onClick={() => handlePathSelection(path)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePathSelection(path);
                  }
                }}
                aria-label={`Select ${path.label} learning path`}
              >
                {/* Path Icon */}
                <div className="text-4xl md:text-5xl mb-4 text-center">
                  {path.icon}
                </div>
                
                {/* Path Title */}
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 text-center">
                  {path.label}
                </h3>
                
                {/* Path Description */}
                <p className="text-math-muted text-center mb-4 leading-relaxed">
                  {path.description}
                </p>
                
                {/* Focus Areas */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-math-secondary mb-2 text-center">
                    Focus Areas:
                  </h4>
                  <div className="flex flex-wrap justify-center gap-2">
                    {path.focusAreas.map((area, areaIndex) => (
                      <span
                        key={areaIndex}
                        className="px-3 py-1 text-xs bg-math-primary/20 text-math-primary rounded-full"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Time Commitment */}
                <div className="text-center">
                  <span className="text-sm text-math-muted">
                    Time: {path.timeCommitment}
                  </span>
                </div>
                
                {/* Complexity Range */}
                {showComplexityIndicators && (
                  <div className="mt-4 text-center">
                    <div className="flex justify-center gap-1">
                      {path.complexityRange.map((level, levelIndex) => {
                        const complexityLevel = DEFAULT_COMPLEXITY_LEVELS.find(c => c.id === level);
                        return (
                          <span
                            key={levelIndex}
                            className="text-lg opacity-60"
                            title={complexityLevel?.description}
                          >
                            {complexityLevel?.label.split(' ')[0]}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Selected Path Learning Interface */}
      {selectedPath && (
        <AnimatePresence mode="wait">
          <motion.section
            key={selectedPath.id}
            className="w-full max-w-7xl"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            {/* Path Header */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <button
                  onClick={() => setSelectedPath(null)}
                  className="p-2 rounded-full bg-math-primary/20 text-math-primary hover:bg-math-primary/30 transition-colors"
                  aria-label="Back to path selection"
                >
                  ←
                </button>
                <span className="text-2xl">{selectedPath.icon}</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {selectedPath.label} Path
                </h2>
              </div>
              <p className="text-math-secondary max-w-2xl mx-auto">
                {selectedPath.description}
              </p>
            </motion.div>

            {/* Complexity Indicator */}
            {showComplexityIndicators && (
              <ComplexityIndicator
                currentComplexity={currentComplexity}
                availableLevels={selectedPath.complexityRange}
                allLevels={DEFAULT_COMPLEXITY_LEVELS}
                onComplexityChange={handleComplexityChange}
                className="mb-8"
              />
            )}

            {/* Learning Progress */}
            <LearningProgress
              stage={learningStage}
              path={selectedPath}
              complexity={currentComplexity}
              onProgressUpdate={handleLearningProgress}
              className="mb-8"
            />

            {/* Path-Specific Learning Content */}
            <div className="min-h-[600px]">
              {selectedPath.id === 'business' && (
                <BusinessLearningPath
                  complexity={currentComplexity}
                  config={businessConfig}
                  onProgress={handleLearningProgress}
                />
              )}
              {selectedPath.id === 'technical' && (
                <TechnicalLearningPath
                  complexity={currentComplexity}
                  config={technicalConfig}
                  onProgress={handleLearningProgress}
                />
              )}
              {selectedPath.id === 'academic' && (
                <AcademicLearningPath
                  complexity={currentComplexity}
                  config={academicConfig}
                  onProgress={handleLearningProgress}
                />
              )}
            </div>
          </motion.section>
        </AnimatePresence>
      )}

      {/* Path Transition Overlay */}
      {enablePathTransitions && isTransitioning && (
        <PathTransition
          fromPath={null}
          toPath={selectedPath}
          onTransitionComplete={() => setIsTransitioning(false)}
        />
      )}
    </div>
  );
};

export default LearnPathRouter;
