/**
 * Mathematical Loading States
 * Beautiful loading transitions with mathematical precision
 * Uses golden ratio, Fibonacci sequences, and mathematical animations
 */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { useProgressiveDisclosure, type DisclosureStage } from './ProgressiveDisclosureProvider';

// ==========================================
// Mathematical Constants
// ==========================================

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2; // φ ≈ 1.618
const FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
const GOLDEN_EASING = 'cubic-bezier(0.618, 0, 0.382, 1)';

// Mathematical equations for visual representation
const MATHEMATICAL_EQUATIONS = {
  0: 'S = {x ∈ ℝ | x > 0}', // Basic sets
  1: 'f: A → B, f(x) = φx', // Functions with golden ratio
  2: 'τ(X) = ∫ κ(x) dx', // Topology fundamentals
  3: '∇²φ + λφ = 0' // Advanced differential equations
};

// ==========================================
// Types
// ==========================================

interface LoadingStateProps {
  stage: DisclosureStage;
  isVisible: boolean;
  duration?: number;
  showEquation?: boolean;
  showProgress?: boolean;
  onComplete?: () => void;
}

interface MathematicalLoadingStatesProps {
  className?: string;
  variant?: 'spiral' | 'fibonacci' | 'geometric' | 'minimal';
  showEquations?: boolean;
  showProgress?: boolean;
  position?: 'center' | 'top' | 'bottom';
}

// ==========================================
// Individual Loading Components
// ==========================================

const SpiralLoader: React.FC<{ stage: DisclosureStage; isActive: boolean }> = ({ stage, isActive }) => {
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setRotation(prev => prev + GOLDEN_RATIO);
    }, 50);
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  const spiralPoints = useMemo(() => {
    const points: string[] = [];
    const segments = FIBONACCI_SEQUENCE[stage + 4] || 21; // Use Fibonacci number based on stage
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 4; // Two full rotations
      const radius = 20 + (i / segments) * 30 * GOLDEN_RATIO;
      const x = 50 + radius * Math.cos(angle);
      const y = 50 + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    
    return points.join(' ');
  }, [stage]);
  
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="overflow-visible">
      <motion.polyline
        points={spiralPoints}
        fill="none"
        stroke="url(#spiralGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: 1, 
          opacity: 1,
          rotate: rotation
        }}
        transition={{
          pathLength: { duration: 2, ease: "easeOut" },
          opacity: { duration: 0.5 },
          rotate: { duration: 0.05, ease: 'linear' }
        }}
        style={{ transformOrigin: '50px 50px' }}
      />
      
      <defs>
        <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0.4" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const FibonacciLoader: React.FC<{ stage: DisclosureStage; isActive: boolean }> = ({ stage, isActive }) => {
  const fibonacciBoxes = useMemo(() => {
    const count = Math.min(stage + 3, FIBONACCI_SEQUENCE.length - 1);
    return FIBONACCI_SEQUENCE.slice(0, count).map((num, index) => ({
      size: Math.min(num * 3, 30),
      delay: index * 0.1,
      fibonacci: num
    }));
  }, [stage]);
  
  return (
    <div className="flex items-center justify-center space-x-1">
      {fibonacciBoxes.map((box, index) => (
        <motion.div
          key={index}
          className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm"
          style={{
            width: `${box.size}px`,
            height: `${box.size}px`
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={isActive ? { 
            scale: [0, 1.2, 1], 
            opacity: [0, 1, 0.8],
            rotate: [0, 180, 360]
          } : { scale: 0, opacity: 0 }}
          transition={{
            duration: 1 + box.delay,
            delay: box.delay,
            ease: "easeOut",
            repeat: isActive ? Infinity : 0,
            repeatDelay: FIBONACCI_SEQUENCE[stage] * 0.1
          }}
        />
      ))}
    </div>
  );
};

const GeometricLoader: React.FC<{ stage: DisclosureStage; isActive: boolean }> = ({ stage, isActive }) => {
  const shapes = ['circle', 'triangle', 'square', 'pentagon'];
  const currentShape = shapes[stage] || 'circle';
  
  const renderShape = () => {
    const size = 40;
    const strokeWidth = 3;
    
    switch (currentShape) {
      case 'triangle':
        return (
          <polygon
            points="20,5 5,35 35,35"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        );
      case 'square':
        return (
          <rect
            x="10"
            y="10"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        );
      case 'pentagon':
        return (
          <polygon
            points="20,5 32,15 27,30 13,30 8,15"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        );
      default: // circle
        return (
          <circle
            cx="20"
            cy="20"
            r="15"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        );
    }
  };
  
  return (
    <motion.svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      className="text-blue-500"
      animate={isActive ? {
        rotate: 360,
        scale: [1, 1.1, 1]
      } : {}}
      transition={{
        rotate: { duration: 2, ease: 'linear', repeat: Infinity },
                    scale: { duration: 1, ease: "easeOut", repeat: Infinity }
      }}
    >
      <motion.g
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        {renderShape()}
      </motion.g>
    </motion.svg>
  );
};

const MinimalLoader: React.FC<{ stage: DisclosureStage; isActive: boolean }> = ({ stage, isActive }) => {
  const dots = Array.from({ length: stage + 1 }, (_, i) => i);
  
  return (
    <div className="flex space-x-2">
      {dots.map((dot, index) => (
        <motion.div
          key={dot}
          className="w-3 h-3 bg-blue-500 rounded-full"
          animate={isActive ? {
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          } : {}}
          transition={{
            duration: 0.8,
            delay: index * 0.2,
            ease: "easeOut",
            repeat: Infinity
          }}
        />
      ))}
    </div>
  );
};

// ==========================================
// Mathematical Loading States Component
// ==========================================

export const MathematicalLoadingStates: React.FC<MathematicalLoadingStatesProps> = ({
  className = '',
  variant = 'spiral',
  showEquations = true,
  showProgress = true,
  position = 'center'
}) => {
  const { disclosureState, getStageProgress } = useProgressiveDisclosure();
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const currentStage = disclosureState.currentStage;
  const stageProgress = getStageProgress(currentStage);
  
  // Detect stage transitions
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 1000);
    return () => clearTimeout(timer);
  }, [currentStage]);
  
  const positionClasses = {
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    top: 'top-8 left-1/2 transform -translate-x-1/2',
    bottom: 'bottom-8 left-1/2 transform -translate-x-1/2'
  };
  
  const renderLoader = () => {
    switch (variant) {
      case 'fibonacci':
        return <FibonacciLoader stage={currentStage} isActive={isTransitioning} />;
      case 'geometric':
        return <GeometricLoader stage={currentStage} isActive={isTransitioning} />;
      case 'minimal':
        return <MinimalLoader stage={currentStage} isActive={isTransitioning} />;
      default: // spiral
        return <SpiralLoader stage={currentStage} isActive={isTransitioning} />;
    }
  };
  
  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          className={classNames(
            'fixed z-50 pointer-events-none',
            positionClasses[position],
            className
          )}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-xl">
            {/* Mathematical Equation */}
            {showEquations && (
              <motion.div
                className="text-center mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <div className="text-sm font-mono text-gray-600 mb-1">
                  Stage {currentStage + 1} Mathematical Foundation:
                </div>
                <div className="text-lg font-mathematical text-blue-600">
                  {MATHEMATICAL_EQUATIONS[currentStage]}
                </div>
              </motion.div>
            )}
            
            {/* Loader Animation */}
            <div className="flex justify-center mb-4">
              {renderLoader()}
            </div>
            
            {/* Progress Information */}
            {showProgress && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <div className="text-sm text-gray-600 mb-2">
                  Transitioning to complexity level {currentStage + 1}
                </div>
                
                {/* Progress Bar */}
                <div className="w-40 bg-gray-200 rounded-full h-2 mb-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStage + 1) / 4) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                
                {/* Mathematical Progress */}
                <div className="text-xs font-mono text-gray-500">
                  φ × {currentStage + 1} = {(GOLDEN_RATIO * (currentStage + 1)).toFixed(3)}
                </div>
              </motion.div>
            )}
            
            {/* Stage Description */}
            <motion.div
              className="text-center text-sm text-gray-600 mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              {currentStage === 0 && 'Establishing mathematical foundation...'}
              {currentStage === 1 && 'Loading value propositions...'}
              {currentStage === 2 && 'Preparing interactive demos...'}
              {currentStage === 3 && 'Unlocking full complexity...'}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// Stage-Specific Loading Indicators
// ==========================================

export const StageLoadingIndicator: React.FC<LoadingStateProps> = ({
  stage,
  isVisible,
  duration = 1000,
  showEquation = true,
  showProgress = true,
  onComplete
}) => {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
    return undefined; // Explicit return for when condition is not met
  }, [isVisible, duration, onComplete]);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 max-w-md mx-4"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {showEquation && (
              <div className="text-center mb-6">
                <div className="text-lg font-mathematical text-blue-600 mb-2">
                  {MATHEMATICAL_EQUATIONS[stage]}
                </div>
                <div className="text-sm text-gray-600">
                  Stage {stage + 1} Mathematical Framework
                </div>
              </div>
            )}
            
            <div className="flex justify-center mb-6">
              <SpiralLoader stage={stage} isActive={isVisible} />
            </div>
            
            {showProgress && (
              <div className="space-y-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: duration / 1000, ease: 'linear' }}
                  />
                </div>
                
                <div className="text-center text-sm text-gray-600">
                  Preparing complexity level {stage + 1}...
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MathematicalLoadingStates;