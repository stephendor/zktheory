/**
 * Touch-Optimized Mathematical Interactions
 * Mobile-first alternatives to hover states with gesture recognition
 * Implements mathematical precision in touch interactions
 */

'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion, PanInfo } from 'framer-motion';
import { 
  HandRaisedIcon, 
  CursorArrowRaysIcon, 
  DevicePhoneMobileIcon,
  HandThumbUpIcon
} from '@heroicons/react/24/outline';

// ==========================================
// Constants & Mathematical Configuration
// ==========================================

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2; // φ ≈ 1.618
const FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

// Touch gesture thresholds based on ergonomic research
const GESTURE_THRESHOLDS = {
  tap: { maxDistance: 10, maxDuration: 500 },
  longPress: { minDuration: 500, maxDistance: 15 },
  swipe: { minDistance: 50, maxVelocity: 300 },
  pinch: { minScaleDelta: 0.1, maxDuration: 1000 },
  rotate: { minAngleDelta: 15, maxDuration: 1000 }
} as const;

// Mathematical interaction types
const INTERACTION_TYPES = {
  explore: {
    gesture: 'tap',
    feedback: 'haptic-light',
    animation: 'scale-pulse',
    description: 'Tap to explore mathematical concepts'
  },
  manipulate: {
    gesture: 'drag',
    feedback: 'haptic-medium',
    animation: 'follow-finger',
    description: 'Drag to manipulate mathematical objects'
  },
  zoom: {
    gesture: 'pinch',
    feedback: 'haptic-heavy',
    animation: 'scale-smooth',
    description: 'Pinch to zoom into mathematical details'
  },
  rotate: {
    gesture: 'twist',
    feedback: 'haptic-light',
    animation: 'rotate-follow',
    description: 'Twist to rotate mathematical perspectives'
  },
  sequence: {
    gesture: 'swipe',
    feedback: 'haptic-medium',
    animation: 'slide-transition',
    description: 'Swipe to navigate through mathematical sequences'
  }
} as const;

// ==========================================
// Types
// ==========================================

interface TouchGesture {
  type: keyof typeof INTERACTION_TYPES;
  startTime: number;
  endTime?: number;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  velocity?: { x: number; y: number };
  distance?: number;
  scale?: number;
  rotation?: number;
}

interface TouchInteractionProps {
  onGesture?: (gesture: TouchGesture) => void;
  onInteraction?: (type: string, data: any) => void;
  enableHapticFeedback?: boolean;
  children: React.ReactNode;
  className?: string;
  // Mathematical content properties
  mathLevel?: 'foundation' | 'conceptual' | 'applied' | 'research';
  interactionType?: keyof typeof INTERACTION_TYPES;
  feedbackMode?: 'minimal' | 'normal' | 'rich';
  // Accessibility
  screenReaderDescription?: string;
  keyboardFallback?: () => void;
}

interface MathematicalElementProps {
  formula: string;
  complexity: number;
  visualizations: Array<{
    type: 'graph' | 'diagram' | '3d-model' | 'animation';
    data: any;
  }>;
  onTouch?: (interaction: TouchGesture) => void;
}

// ==========================================
// Haptic Feedback Utility
// ==========================================

const triggerHapticFeedback = (intensity: 'light' | 'medium' | 'heavy') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [50],
      heavy: [100, 50, 100]
    };
    navigator.vibrate(patterns[intensity]);
  }
};

// ==========================================
// Touch Gesture Recognition Hook
// ==========================================

const useTouchGestures = (
  onGesture?: (gesture: TouchGesture) => void,
  enableHaptic = true
) => {
  const [activeGesture, setActiveGesture] = useState<TouchGesture | null>(null);
  const gestureRef = useRef<TouchGesture | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    const startTime = Date.now();
    const startPosition = { x: touch.clientX, y: touch.clientY };
    
    touchStartRef.current = { 
      x: touch.clientX, 
      y: touch.clientY, 
      time: startTime 
    };
    
    const gesture: TouchGesture = {
      type: 'explore', // Default, will be determined by gesture pattern
      startTime,
      startPosition,
      currentPosition: startPosition
    };
    
    gestureRef.current = gesture;
    setActiveGesture(gesture);
    
    if (enableHaptic) {
      triggerHapticFeedback('light');
    }
  }, [enableHaptic]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!gestureRef.current || !touchStartRef.current) return;
    
    const touch = event.touches[0];
    const currentPosition = { x: touch.clientX, y: touch.clientY };
    const startPos = gestureRef.current.startPosition;
    
    const distance = Math.sqrt(
      Math.pow(currentPosition.x - startPos.x, 2) + 
      Math.pow(currentPosition.y - startPos.y, 2)
    );
    
    const duration = Date.now() - gestureRef.current.startTime;
    
    // Determine gesture type based on movement pattern
    let gestureType: keyof typeof INTERACTION_TYPES = 'explore';
    
    if (distance > GESTURE_THRESHOLDS.swipe.minDistance) {
      gestureType = 'sequence';
    } else if (duration > GESTURE_THRESHOLDS.longPress.minDuration && distance < GESTURE_THRESHOLDS.longPress.maxDistance) {
      gestureType = 'manipulate';
    } else if (distance > GESTURE_THRESHOLDS.tap.maxDistance) {
      gestureType = 'manipulate';
    }
    
    const updatedGesture: TouchGesture = {
      ...gestureRef.current,
      type: gestureType,
      currentPosition,
      distance
    };
    
    gestureRef.current = updatedGesture;
    setActiveGesture(updatedGesture);
  }, []);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (!gestureRef.current || !touchStartRef.current) return;
    
    const endTime = Date.now();
    const duration = endTime - gestureRef.current.startTime;
    const distance = gestureRef.current.distance || 0;
    
    // Final gesture classification
    let finalType: keyof typeof INTERACTION_TYPES = 'explore';
    
    if (duration <= GESTURE_THRESHOLDS.tap.maxDuration && distance <= GESTURE_THRESHOLDS.tap.maxDistance) {
      finalType = 'explore';
    } else if (duration >= GESTURE_THRESHOLDS.longPress.minDuration) {
      finalType = 'manipulate';
    } else if (distance >= GESTURE_THRESHOLDS.swipe.minDistance) {
      finalType = 'sequence';
    }
    
    const finalGesture: TouchGesture = {
      ...gestureRef.current,
      type: finalType,
      endTime
    };
    
    if (enableHaptic) {
      const feedbackType = INTERACTION_TYPES[finalType].feedback;
      triggerHapticFeedback(feedbackType.split('-')[1] as 'light' | 'medium' | 'heavy');
    }
    
    onGesture?.(finalGesture);
    
    // Reset
    setActiveGesture(null);
    gestureRef.current = null;
    touchStartRef.current = null;
  }, [onGesture, enableHaptic]);

  return {
    activeGesture,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
};

// ==========================================
// Touch Interaction Wrapper Component
// ==========================================

export const TouchInteraction: React.FC<TouchInteractionProps> = ({
  onGesture,
  onInteraction,
  enableHapticFeedback = true,
  children,
  className = '',
  mathLevel = 'foundation',
  interactionType = 'explore',
  feedbackMode = 'normal',
  screenReaderDescription,
  keyboardFallback
}) => {
  const prefersReducedMotion = useReducedMotion();
  
  // ==========================================
  // Touch Gesture Recognition
  // ==========================================
  
  const { activeGesture, touchHandlers } = useTouchGestures(
    useCallback((gesture: TouchGesture) => {
      onGesture?.(gesture);
      onInteraction?.(gesture.type, {
        gesture,
        mathLevel,
        timestamp: Date.now()
      });
    }, [onGesture, onInteraction, mathLevel]),
    enableHapticFeedback
  );

  // ==========================================
  // Visual Feedback Configuration
  // ==========================================
  
  const feedbackConfig = useMemo(() => {
    const configs = {
      minimal: {
        showRipple: false,
        showGlow: false,
        showTrail: false
      },
      normal: {
        showRipple: true,
        showGlow: false,
        showTrail: false
      },
      rich: {
        showRipple: true,
        showGlow: true,
        showTrail: true
      }
    };
    return configs[feedbackMode];
  }, [feedbackMode]);

  // ==========================================
  // Interaction Instructions
  // ==========================================
  
  const getInstructions = useCallback(() => {
    const baseInstruction = INTERACTION_TYPES[interactionType].description;
    const mathLevelInstruction = {
      foundation: 'Basic interactions unlock fundamental concepts',
      conceptual: 'Deeper interactions reveal mathematical relationships',
      applied: 'Complex gestures access advanced applications',
      research: 'Sophisticated interactions explore cutting-edge theory'
    }[mathLevel];
    
    return { baseInstruction, mathLevelInstruction };
  }, [interactionType, mathLevel]);

  // ==========================================
  // Animation Variants
  // ==========================================
  
  const containerVariants = {
    idle: {
      scale: 1,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    touching: {
      scale: feedbackConfig.showGlow ? 1.02 : 1,
      boxShadow: feedbackConfig.showGlow 
        ? '0 8px 24px rgba(59, 130, 246, 0.3)' 
        : '0 4px 12px rgba(0, 0, 0, 0.1)'
    }
  };

  // ==========================================
  // Render
  // ==========================================
  
  return (
    <motion.div
      className={`relative touch-interaction-container ${className}`}
      variants={containerVariants}
      animate={activeGesture ? 'touching' : 'idle'}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      {...touchHandlers}
      // Keyboard fallback
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          keyboardFallback?.();
        }
      }}
      role="button"
      aria-label={screenReaderDescription || getInstructions().baseInstruction}
    >
      {/* Touch Ripple Effect */}
      <AnimatePresence>
        {feedbackConfig.showRipple && activeGesture && (
          <motion.div
            className="absolute rounded-full bg-blue-500/20 pointer-events-none"
            style={{
              left: activeGesture.currentPosition.x - 25,
              top: activeGesture.currentPosition.y - 25,
              width: 50,
              height: 50
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Touch Trail */}
      <AnimatePresence>
        {feedbackConfig.showTrail && activeGesture && activeGesture.distance && activeGesture.distance > 20 && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              left: activeGesture.startPosition.x,
              top: activeGesture.startPosition.y,
              width: Math.abs(activeGesture.currentPosition.x - activeGesture.startPosition.x),
              height: Math.abs(activeGesture.currentPosition.y - activeGesture.startPosition.y),
              background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))',
              borderRadius: '4px'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      {children}

      {/* Touch Instructions Overlay */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200 text-sm"
        >
          <div className="flex items-center space-x-2 mb-1">
            <HandRaisedIcon className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-900">Touch Interaction</span>
          </div>
          
          <p className="text-gray-600 text-xs mb-2">
            {getInstructions().baseInstruction}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Level: {mathLevel}</span>
            <span>Type: {interactionType}</span>
          </div>
        </motion.div>
      </div>

      {/* Gesture Indicator */}
      <AnimatePresence>
        {activeGesture && (
          <motion.div
            className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {activeGesture.type}
            {activeGesture.distance && ` (${Math.round(activeGesture.distance)}px)`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessibility Enhancement */}
      <div className="sr-only">
        <p>{getInstructions().baseInstruction}</p>
        <p>{getInstructions().mathLevelInstruction}</p>
        <p>Current gesture: {activeGesture?.type || 'none'}</p>
      </div>
    </motion.div>
  );
};

// ==========================================
// Mathematical Element Component
// ==========================================

export const MathematicalElement: React.FC<MathematicalElementProps> = ({
  formula,
  complexity,
  visualizations,
  onTouch
}) => {
  const [currentVisualization, setCurrentVisualization] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGesture = useCallback((gesture: TouchGesture) => {
    switch (gesture.type) {
      case 'explore':
        setIsExpanded(!isExpanded);
        break;
      case 'sequence':
        if (gesture.distance && gesture.distance > 0) {
          const direction = (gesture.currentPosition.x - gesture.startPosition.x) > 0 ? 1 : -1;
          setCurrentVisualization(prev => 
            Math.max(0, Math.min(visualizations.length - 1, prev + direction))
          );
        }
        break;
      case 'manipulate':
        // Handle mathematical manipulation
        break;
    }
    
    onTouch?.(gesture);
  }, [isExpanded, visualizations.length, onTouch]);

  return (
    <TouchInteraction
      onGesture={handleGesture}
      mathLevel={complexity > 2 ? 'applied' : 'foundation'}
      interactionType="explore"
      feedbackMode="rich"
      className="math-element"
    >
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
        {/* Formula Display */}
        <motion.div
          className="text-center mb-4"
          animate={{ scale: isExpanded ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <div 
            className="text-2xl font-math-serif text-gray-800"
            dangerouslySetInnerHTML={{ __html: formula }}
          />
        </motion.div>

        {/* Visualization */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              key={currentVisualization}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-4"
            >
              <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <div className="text-lg font-medium mb-2">
                    {visualizations[currentVisualization]?.type || 'Visualization'}
                  </div>
                  <div className="text-sm">
                    Swipe to change • Tap to interact
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Complexity Indicator */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <span>Complexity: {complexity}/5</span>
          <span>{visualizations.length} visualizations</span>
        </div>
      </div>
    </TouchInteraction>
  );
};

export default TouchInteraction;