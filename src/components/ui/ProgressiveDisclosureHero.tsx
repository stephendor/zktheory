/**
 * Progressive Disclosure Hero Component
 * Implements 5-second → 15-second → 60+ second disclosure stages
 * with mathematical precision timing based on golden ratio
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDownIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';

// ==========================================
// Constants & Configuration
// ==========================================

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2; // φ ≈ 1.618
const FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

// Progressive timing based on golden ratio and Fibonacci
const DISCLOSURE_STAGES = {
  INITIAL: {
    duration: 5000, // 5 seconds - immediate attention
    content: 'hero_title_only',
    complexity: 0.2
  },
  INTERMEDIATE: {
    duration: 15000, // 15 seconds total - exploration phase
    content: 'pathways_preview',
    complexity: 0.6
  },
  FULL: {
    duration: 60000, // 60+ seconds - deep engagement
    content: 'complete_interface',
    complexity: 1.0
  }
} as const;

// ==========================================
// Types
// ==========================================

interface DisclosureStage {
  stage: keyof typeof DISCLOSURE_STAGES;
  timeElapsed: number;
  userEngaged: boolean;
  interactionCount: number;
}

interface ProgressiveDisclosureProps {
  onStageChange?: (stage: DisclosureStage) => void;
  enableAutoProgression?: boolean;
  userControlled?: boolean;
  className?: string;
}

// ==========================================
// Mathematical Timing Functions
// ==========================================

const useGoldenTiming = (duration: number) => {
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawProgress = elapsed / duration;
      
      // Apply golden ratio easing curve
      const easedProgress = Math.min(1, rawProgress ** (1 / GOLDEN_RATIO));
      setProgress(easedProgress);

      if (rawProgress >= 1) {
        setIsActive(false);
        clearInterval(interval);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isActive, duration]);

  return { progress, isActive, setIsActive };
};

// ==========================================
// Geometric Reveal Animations
// ==========================================

const spiralReveal = (index: number, total: number) => {
  const angle = (index / total) * 2 * Math.PI * GOLDEN_RATIO;
  const radius = (index / total) * 100;
  
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    rotate: angle * (180 / Math.PI),
    delay: (index * FIBONACCI_SEQUENCE[index % FIBONACCI_SEQUENCE.length]) / 1000
  };
};

const voronoiCell = (index: number, isRevealed: boolean) => ({
  clipPath: isRevealed 
    ? `polygon(${Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * 2 * Math.PI;
        const x = 50 + 40 * Math.cos(angle);
        const y = 50 + 40 * Math.sin(angle);
        return `${x}% ${y}%`;
      }).join(', ')})`
    : 'polygon(50% 50%, 50% 50%, 50% 50%)',
  transition: `clip-path ${800 * (1 + index * 0.1)}ms cubic-bezier(0.618, 0, 0.382, 1)`
});

// ==========================================
// Main Component
// ==========================================

export const ProgressiveDisclosureHero: React.FC<ProgressiveDisclosureProps> = ({
  onStageChange,
  enableAutoProgression = true,
  userControlled = false,
  className = ''
}) => {
  const prefersReducedMotion = useReducedMotion();
  
  // ==========================================
  // State Management
  // ==========================================
  
  const [currentStage, setCurrentStage] = useState<keyof typeof DISCLOSURE_STAGES>('INITIAL');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);
  const [userEngaged, setUserEngaged] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [revealedElements, setRevealedElements] = useState<Set<string>>(new Set(['hero-title']));

  // ==========================================
  // Golden Timing Hook
  // ==========================================
  
  const stageConfig = DISCLOSURE_STAGES[currentStage];
  const { progress, isActive, setIsActive } = useGoldenTiming(stageConfig.duration);

  // ==========================================
  // Stage Progression Logic
  // ==========================================
  
  useEffect(() => {
    if (!enableAutoProgression || isPaused || prefersReducedMotion) return;

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 100);
    }, 100);

    return () => clearInterval(timer);
  }, [enableAutoProgression, isPaused, prefersReducedMotion]);

  useEffect(() => {
    if (!enableAutoProgression) return;

    const stageTransitions = {
      INITIAL: () => timeElapsed >= DISCLOSURE_STAGES.INITIAL.duration || interactionCount >= 2,
      INTERMEDIATE: () => timeElapsed >= DISCLOSURE_STAGES.INTERMEDIATE.duration || interactionCount >= 5,
      FULL: () => false // Terminal stage
    };

    const shouldProgress = stageTransitions[currentStage]?.();
    
    if (shouldProgress && currentStage !== 'FULL') {
      const nextStage = currentStage === 'INITIAL' ? 'INTERMEDIATE' : 'FULL';
      progressToStage(nextStage);
    }
  }, [timeElapsed, interactionCount, currentStage, enableAutoProgression]);

  // ==========================================
  // Interaction Handlers
  // ==========================================
  
  const handleInteraction = useCallback((elementId: string) => {
    setInteractionCount(prev => prev + 1);
    setUserEngaged(true);
    
    // Reveal element immediately on interaction
    setRevealedElements(prev => new Set([...prev, elementId]));
    
    // Track interaction for analytics
    onStageChange?.({
      stage: currentStage,
      timeElapsed,
      userEngaged: true,
      interactionCount: interactionCount + 1
    });
  }, [currentStage, timeElapsed, interactionCount, onStageChange]);

  const progressToStage = useCallback((stage: keyof typeof DISCLOSURE_STAGES) => {
    setCurrentStage(stage);
    setIsActive(true);
    
    // Reveal elements based on stage
    const stageElements = {
      INITIAL: new Set(['hero-title']),
      INTERMEDIATE: new Set(['hero-title', 'pathway-previews', 'central-spiral']),
      FULL: new Set(['hero-title', 'pathway-previews', 'central-spiral', 'detailed-content', 'navigation'])
    };
    
    setRevealedElements(stageElements[stage]);
    
    onStageChange?.({
      stage,
      timeElapsed,
      userEngaged,
      interactionCount
    });
  }, [timeElapsed, userEngaged, interactionCount, onStageChange]);

  const handleUserControl = useCallback((action: 'play' | 'pause' | 'next' | 'prev') => {
    switch (action) {
      case 'play':
        setIsPaused(false);
        setIsActive(true);
        break;
      case 'pause':
        setIsPaused(true);
        setIsActive(false);
        break;
      case 'next':
        if (currentStage === 'INITIAL') progressToStage('INTERMEDIATE');
        else if (currentStage === 'INTERMEDIATE') progressToStage('FULL');
        break;
      case 'prev':
        if (currentStage === 'FULL') progressToStage('INTERMEDIATE');
        else if (currentStage === 'INTERMEDIATE') progressToStage('INITIAL');
        break;
    }
  }, [currentStage, progressToStage]);

  // ==========================================
  // Element Visibility Logic
  // ==========================================
  
  const isElementRevealed = useCallback((elementId: string) => {
    return revealedElements.has(elementId) || 
           (!enableAutoProgression && userEngaged) ||
           prefersReducedMotion;
  }, [revealedElements, enableAutoProgression, userEngaged, prefersReducedMotion]);

  // ==========================================
  // Animation Variants
  // ==========================================
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1.2,
        staggerChildren: 0.2
      }
    }
  };

  const elementVariants = {
    hidden: (custom: any) => ({
      opacity: 0,
      scale: 0.8,
      y: 30,
      ...spiralReveal(custom.index || 0, custom.total || 1)
    }),
    visible: (custom: any) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      rotate: 0,
      transition: {
        duration: 0.8,
        delay: custom.delay || 0,
        ease: [0.618, 0, 0.382, 1] // Golden ratio easing
      }
    })
  };

  // ==========================================
  // Progress Indicator
  // ==========================================
  
  const ProgressRing = ({ progress: ringProgress, size = 60 }: { progress: number; size?: number }) => {
    const radius = (size - 8) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (ringProgress * circumference);
    
    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="2"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-blue-600 transition-all duration-300"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  // ==========================================
  // Render
  // ==========================================
  
  return (
    <motion.div
      className={`relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Mathematical Grid Background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
            linear-gradient(45deg, transparent 48%, rgba(99, 102, 241, 0.03) 49%, rgba(99, 102, 241, 0.03) 51%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, rgba(99, 102, 241, 0.03) 49%, rgba(99, 102, 241, 0.03) 51%, transparent 52%)
          `,
          backgroundSize: `${GOLDEN_RATIO * 100}px ${100}px, ${GOLDEN_RATIO * 50}px ${50}px, ${GOLDEN_RATIO * 50}px ${50}px`
        }}
      />

      {/* User Controls */}
      {userControlled && (
        <div className="absolute top-6 right-6 z-50 flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
            <ProgressRing progress={progress} size={40} />
            <span className="text-sm font-medium text-gray-700">
              Stage {currentStage === 'INITIAL' ? '1' : currentStage === 'INTERMEDIATE' ? '2' : '3'}/3
            </span>
          </div>
          
          <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full p-2 border border-gray-200">
            <button
              onClick={() => handleUserControl(isPaused ? 'play' : 'pause')}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={isPaused ? 'Resume progression' : 'Pause progression'}
            >
              {isPaused ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => handleUserControl('prev')}
              disabled={currentStage === 'INITIAL'}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous stage"
            >
              <ChevronDownIcon className="w-4 h-4 rotate-90" />
            </button>
            
            <button
              onClick={() => handleUserControl('next')}
              disabled={currentStage === 'FULL'}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next stage"
            >
              <ChevronDownIcon className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        </div>
      )}

      {/* Stage 1: Hero Title Only */}
      <AnimatePresence>
        {isElementRevealed('hero-title') && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-20"
            variants={elementVariants}
            custom={{ index: 0, total: 1 }}
            initial="hidden"
            animate="visible"
            onClick={() => handleInteraction('hero-title')}
          >
            <div className="text-center space-y-6">
              <motion.h1 
                className="text-6xl md:text-8xl font-bold tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                ZKTheory
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Mathematical Computing Platform
              </motion.p>

              {/* Mathematical Equation */}
              <motion.div
                className="text-lg text-gray-500 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                φ = {GOLDEN_RATIO.toFixed(8)}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage 2: Pathway Previews */}
      <AnimatePresence>
        {isElementRevealed('pathway-previews') && (
          <motion.div
            className="absolute bottom-20 left-0 right-0 z-30"
            variants={elementVariants}
            custom={{ index: 1, total: 3, delay: 0.3 }}
            initial="hidden"
            animate="visible"
          >
            <div className="flex justify-center space-x-8 px-8">
              {['Business', 'Technical', 'Academic'].map((pathway, index) => (
                <motion.button
                  key={pathway}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:scale-105"
                  style={voronoiCell(index, true)}
                  onClick={() => handleInteraction(`pathway-${pathway.toLowerCase()}`)}
                  whileHover={{ y: -8 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {pathway[0]}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {pathway}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {pathway === 'Business' && 'ROI-focused solutions'}
                      {pathway === 'Technical' && 'Implementation guides'}
                      {pathway === 'Academic' && 'Research foundations'}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage 3: Full Interface - Central Spiral */}
      <AnimatePresence>
        {isElementRevealed('central-spiral') && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-25"
            variants={elementVariants}
            custom={{ index: 2, total: 5, delay: 0.6 }}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="w-32 h-32 border-2 border-blue-300 rounded-full flex items-center justify-center cursor-pointer"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              onClick={() => handleInteraction('central-spiral')}
              whileHover={{ scale: 1.1 }}
            >
              <div className="text-blue-600 font-mono text-sm">φ</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessibility Enhancements */}
      <div className="sr-only">
        <p>Progressive disclosure interface revealing content in stages:</p>
        <ul>
          <li>Stage 1: Main title and mathematical identity</li>
          <li>Stage 2: Three pathway previews for different audiences</li>
          <li>Stage 3: Full interactive interface with central navigation</li>
        </ul>
        <p>Current stage: {currentStage}</p>
        <p>Time elapsed: {Math.round(timeElapsed / 1000)} seconds</p>
      </div>

      {/* Mathematical Stage Indicator */}
      <div className="absolute bottom-6 left-6 text-xs font-mono text-gray-500 space-y-1">
        <div>Stage: {currentStage}</div>
        <div>φ-progress: {(progress * 100).toFixed(1)}%</div>
        <div>Interactions: {interactionCount}</div>
        <div>Time: {Math.round(timeElapsed / 1000)}s</div>
      </div>
    </motion.div>
  );
};

export default ProgressiveDisclosureHero;