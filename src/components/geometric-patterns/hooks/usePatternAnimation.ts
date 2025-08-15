/**
 * Pattern Animation Hook
 * 
 * Custom hook for managing sophisticated pattern animations using golden ratio
 * and Fibonacci-based easing functions. Provides precise control over complex
 * mathematical animations.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { UsePatternAnimationReturn, AnimationSequence, PatternAnimationConfig } from '../types/patterns';

const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio

// ==========================================
// Mathematical Easing Functions
// ==========================================

const easingFunctions = {
  linear: (t: number) => t,
  
  golden: (t: number) => {
    // Golden ratio-based easing
    if (t < 0.5) {
      return 2 * t * t * PHI / (PHI + 1);
    } else {
      return 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
  },
  
  fibonacci: (t: number) => {
    // Fibonacci sequence-inspired easing
    const fib = (n: number): number => n <= 1 ? n : fib(n - 1) + fib(n - 2);
    const normalized = Math.min(Math.floor(t * 10), 9);
    return fib(normalized) / fib(9); // Normalize to fib(9) = 34
  },
  
  harmonic: (t: number) => {
    // Harmonic series-based easing
    return Math.sin(t * Math.PI / 2);
  },
  
  exponential: (t: number) => {
    // Exponential easing with golden ratio
    return t === 0 ? 0 : Math.pow(PHI, 10 * (t - 1));
  },
  
  elastic: (t: number) => {
    // Elastic easing with mathematical precision
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  
  bounce: (t: number) => {
    // Bounce easing with phi-based parameters
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }
};

// ==========================================
// Main Hook Implementation
// ==========================================

export const usePatternAnimation = (
  config: PatternAnimationConfig = {}
): UsePatternAnimationReturn => {
  const {
    duration = 1000,
    easing = 'golden',
    delay = 0,
    repeat = false,
    reverse = false,
    onComplete
  } = config;

  // State management
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentKeyframe, setCurrentKeyframe] = useState(0);
  
  // Refs for animation control
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const pausedTimeRef = useRef<number>(0);
  const directionRef = useRef<1 | -1>(1);
  const cycleCountRef = useRef<number>(0);

  // ==========================================
  // Animation Control Functions
  // ==========================================

  const play = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    startTimeRef.current = performance.now() - pausedTimeRef.current;
    
    const animate = (currentTime: number) => {
      if (!startTimeRef.current) return;
      
      const elapsed = currentTime - startTimeRef.current - delay;
      
      if (elapsed < 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      let rawProgress = Math.min(elapsed / duration, 1);
      
      // Apply direction (for reverse animation)
      if (directionRef.current === -1) {
        rawProgress = 1 - rawProgress;
      }
      
      // Apply easing function
      const easingFn = easingFunctions[easing] || easingFunctions.golden;
      const easedProgress = easingFn(rawProgress);
      
      setProgress(easedProgress);
      
      // Calculate current keyframe (if using keyframe-based animation)
      const keyframeCount = 10; // Default keyframe count
      setCurrentKeyframe(Math.floor(easedProgress * (keyframeCount - 1)));
      
      if (rawProgress >= 1) {
        // Animation cycle complete
        cycleCountRef.current++;
        
        const shouldContinue = repeat === true || 
          (typeof repeat === 'number' && cycleCountRef.current < repeat);
        
        if (shouldContinue) {
          if (reverse) {
            // Reverse direction for ping-pong effect
            directionRef.current *= -1;
          }
          
          // Reset for next cycle
          startTimeRef.current = currentTime;
          pausedTimeRef.current = 0;
          
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Animation complete
          setIsAnimating(false);
          setProgress(directionRef.current === 1 ? 1 : 0);
          onComplete?.();
        }
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [isAnimating, duration, easing, delay, repeat, reverse, onComplete]);

  const pause = useCallback(() => {
    if (!isAnimating) return;
    
    setIsAnimating(false);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    
    // Store paused time for resuming
    if (startTimeRef.current) {
      pausedTimeRef.current = performance.now() - startTimeRef.current;
    }
  }, [isAnimating]);

  const stop = useCallback(() => {
    setIsAnimating(false);
    setProgress(0);
    setCurrentKeyframe(0);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    
    startTimeRef.current = undefined;
    pausedTimeRef.current = 0;
    directionRef.current = 1;
    cycleCountRef.current = 0;
  }, []);

  const restart = useCallback(() => {
    stop();
    setTimeout(play, 0); // Use setTimeout to ensure stop completes first
  }, [stop, play]);

  const setProgressDirectly = useCallback((newProgress: number) => {
    const clampedProgress = Math.max(0, Math.min(1, newProgress));
    setProgress(clampedProgress);
    
    const keyframeCount = 10;
    setCurrentKeyframe(Math.floor(clampedProgress * (keyframeCount - 1)));
    
    // Update internal timing to match the new progress
    if (startTimeRef.current) {
      const targetElapsed = clampedProgress * duration;
      startTimeRef.current = performance.now() - targetElapsed - delay;
      pausedTimeRef.current = 0;
    }
  }, [duration, delay]);

  // ==========================================
  // Cleanup Effect
  // ==========================================

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // ==========================================
  // Return Hook Interface
  // ==========================================

  return {
    isAnimating,
    progress,
    currentKeyframe,
    play,
    pause,
    stop,
    restart,
    setProgress: setProgressDirectly
  };
};

// ==========================================
// Specialized Animation Hooks
// ==========================================

/**
 * Hook for creating sophisticated sequence animations
 */
export const usePatternSequence = (sequences: AnimationSequence[]) => {
  const [currentSequence, setCurrentSequence] = useState(0);
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  
  const currentSequenceConfig = sequences[currentSequence];
  
  const animationHook = usePatternAnimation({
    duration: currentSequenceConfig?.duration || 1000,
    easing: currentSequenceConfig?.easing as any || 'golden',
    repeat: currentSequenceConfig?.loop || false,
    onComplete: () => {
      if (currentSequence < sequences.length - 1) {
        setCurrentSequence(prev => prev + 1);
      } else {
        setIsSequencePlaying(false);
        setCurrentSequence(0);
      }
    }
  });

  const playSequence = useCallback(() => {
    setIsSequencePlaying(true);
    setCurrentSequence(0);
    animationHook.play();
  }, [animationHook]);

  const stopSequence = useCallback(() => {
    setIsSequencePlaying(false);
    setCurrentSequence(0);
    animationHook.stop();
  }, [animationHook]);

  return {
    ...animationHook,
    currentSequence,
    sequenceCount: sequences.length,
    isSequencePlaying,
    playSequence,
    stopSequence
  };
};

/**
 * Hook for mathematical spiral animations
 */
export const useSpiralAnimation = (config: {
  spiralType?: 'golden' | 'fibonacci' | 'archimedes';
  revolutions?: number;
  duration?: number;
}) => {
  const { spiralType = 'golden', revolutions = 2, duration = 3000 } = config;
  
  const getSpiralPosition = useCallback((t: number) => {
    const angle = t * revolutions * 2 * Math.PI;
    
    switch (spiralType) {
      case 'golden': {
        const radius = t * 100 * PHI;
        return {
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle),
          angle,
          radius
        };
      }
      
      case 'fibonacci': {
        const fibValue = Math.floor(t * 13); // Fibonacci sequence up to 13
        const fib = (n: number): number => n <= 1 ? n : fib(n - 1) + fib(n - 2);
        const radius = fib(fibValue) * 5;
        return {
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle),
          angle,
          radius
        };
      }
      
      case 'archimedes':
      default: {
        const radius = t * 100;
        return {
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle),
          angle,
          radius
        };
      }
    }
  }, [spiralType, revolutions]);

  const animationHook = usePatternAnimation({
    duration,
    easing: 'golden'
  });

  const spiralPosition = getSpiralPosition(animationHook.progress);

  return {
    ...animationHook,
    spiralPosition,
    getSpiralPosition
  };
};

/**
 * Hook for morphing between different mathematical curves
 */
export const useCurveMorphing = (curves: Array<(t: number) => [number, number]>) => {
  const [currentCurveIndex, setCurrentCurveIndex] = useState(0);
  const [morphProgress, setMorphProgress] = useState(0);

  const animationHook = usePatternAnimation({
    duration: 2000,
    easing: 'golden',
    onComplete: () => {
      setCurrentCurveIndex(prev => (prev + 1) % curves.length);
    }
  });

  const getMorphedPoint = useCallback((t: number) => {
    if (curves.length < 2) {
      return curves[0]?.(t) || [0, 0];
    }

    const currentCurve = curves[currentCurveIndex];
    const nextCurve = curves[(currentCurveIndex + 1) % curves.length];

    const point1 = currentCurve(t);
    const point2 = nextCurve(t);

    // Interpolate between curves using golden ratio easing
    const easingFn = easingFunctions.golden;
    const morphFactor = easingFn(animationHook.progress);

    return [
      point1[0] + (point2[0] - point1[0]) * morphFactor,
      point1[1] + (point2[1] - point1[1]) * morphFactor
    ] as [number, number];
  }, [curves, currentCurveIndex, animationHook.progress]);

  return {
    ...animationHook,
    currentCurveIndex,
    morphProgress: animationHook.progress,
    getMorphedPoint
  };
};

export default usePatternAnimation;