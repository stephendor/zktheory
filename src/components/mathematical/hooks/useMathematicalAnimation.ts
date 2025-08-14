'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Mathematical animation types
export interface MathAnimationConfig {
  duration?: number;
  easing?: 'linear' | 'golden' | 'fibonacci' | 'harmonic' | 'exponential';
  delay?: number;
  iterations?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

export interface MathTransformConfig {
  from: {
    x?: number;
    y?: number;
    scale?: number;
    rotate?: number;
    opacity?: number;
  };
  to: {
    x?: number;
    y?: number;
    scale?: number;
    rotate?: number;
    opacity?: number;
  };
}

// Easing functions based on mathematical constants
const EASING_FUNCTIONS = {
  linear: 'linear',
  golden: 'cubic-bezier(0.618, 0, 0.382, 1)',
  fibonacci: 'cubic-bezier(0.236, 0, 0.764, 1)',
  harmonic: 'cubic-bezier(0.25, 0, 0.25, 1)',
  exponential: 'cubic-bezier(0.19, 1, 0.22, 1)',
};

// Mathematical morphing between expressions
export const useMathematicalMorphing = (
  expressions: string[],
  config: MathAnimationConfig = {}
) => {
  const [currentExpression, setCurrentExpression] = useState(expressions[0] || '');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const {
    duration = 2000,
    easing = 'golden',
    delay = 0,
    iterations = 'infinite',
    direction = 'normal',
  } = config;

  const morphToNext = useCallback(() => {
    if (expressions.length <= 1) return;
    
    setIsAnimating(true);
    
    setTimeout(() => {
      const nextIndex = (currentIndex + 1) % expressions.length;
      setCurrentIndex(nextIndex);
      setCurrentExpression(expressions[nextIndex]);
      setIsAnimating(false);
    }, 300); // Quick transition
  }, [currentIndex, expressions]);

  const morphTo = useCallback((index: number) => {
    if (index >= 0 && index < expressions.length && index !== currentIndex) {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentIndex(index);
        setCurrentExpression(expressions[index]);
        setIsAnimating(false);
      }, 300);
    }
  }, [currentIndex, expressions]);

  // Auto-morphing
  useEffect(() => {
    if (iterations === 'infinite' || typeof iterations === 'number') {
      timeoutRef.current = setTimeout(() => {
        morphToNext();
      }, duration + delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, duration, delay, iterations, morphToNext]);

  return {
    currentExpression,
    currentIndex,
    isAnimating,
    morphToNext,
    morphTo,
    expressionCount: expressions.length,
  };
};

// Mathematical step-by-step animations
export const useStepByStepAnimation = (
  steps: Array<{ expression: string; explanation?: string }>,
  config: MathAnimationConfig = {}
) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const { duration = 3000, delay = 500 } = config;

  const play = useCallback(() => {
    setIsPlaying(true);
    setCurrentStep(0);
    setIsComplete(false);

    const stepDuration = duration / steps.length;
    
    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next >= steps.length) {
          setIsPlaying(false);
          setIsComplete(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return steps.length - 1;
        }
        return next;
      });
    }, stepDuration + delay);
  }, [steps.length, duration, delay]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    setIsComplete(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
      setIsComplete(step === steps.length - 1);
    }
  }, [steps.length]);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, steps.length - 1);
      setIsComplete(next === steps.length - 1);
      return next;
    });
  }, [steps.length]);

  const previousStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = Math.max(prev - 1, 0);
      setIsComplete(false);
      return next;
    });
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    currentStep,
    currentData: steps[currentStep],
    isPlaying,
    isComplete,
    progress: ((currentStep + 1) / steps.length) * 100,
    play,
    pause,
    reset,
    goToStep,
    nextStep,
    previousStep,
    canGoNext: currentStep < steps.length - 1,
    canGoPrevious: currentStep > 0,
    totalSteps: steps.length,
  };
};

// Mathematical function graphing animation
export const useFunctionAnimation = (
  func: (x: number) => number,
  domain: [number, number] = [-10, 10],
  config: MathAnimationConfig = {}
) => {
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { duration = 2000, easing = 'golden' } = config;
  const animationRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  const animate = useCallback(() => {
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    const elapsed = Date.now() - startTimeRef.current;
    const progressValue = Math.min(elapsed / duration, 1);
    
    // Apply easing
    let easedProgress = progressValue;
    switch (easing) {
      case 'golden':
        // Golden ratio easing approximation
        easedProgress = progressValue * progressValue * (3.0 - 2.0 * progressValue);
        break;
      case 'fibonacci':
        // Fibonacci-inspired easing
        easedProgress = Math.pow(progressValue, 1.618);
        break;
      case 'harmonic':
        // Harmonic oscillation
        easedProgress = (1 - Math.cos(progressValue * Math.PI)) / 2;
        break;
      case 'exponential':
        // Exponential decay
        easedProgress = 1 - Math.exp(-5 * progressValue);
        break;
    }
    
    setProgress(easedProgress);
    
    // Generate points up to current progress
    const [minX, maxX] = domain;
    const range = maxX - minX;
    const currentMaxX = minX + (range * easedProgress);
    
    const stepSize = range / 200; // High resolution
    const newPoints: Array<{ x: number; y: number }> = [];
    
    for (let x = minX; x <= currentMaxX; x += stepSize) {
      try {
        const y = func(x);
        if (isFinite(y)) {
          newPoints.push({ x, y });
        }
      } catch (error) {
        // Skip invalid points
      }
    }
    
    setPoints(newPoints);
    
    if (progressValue < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsAnimating(false);
      startTimeRef.current = undefined;
    }
  }, [func, domain, duration, easing]);

  const start = useCallback(() => {
    setIsAnimating(true);
    setProgress(0);
    setPoints([]);
    startTimeRef.current = undefined;
    animate();
  }, [animate]);

  const stop = useCallback(() => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    startTimeRef.current = undefined;
  }, []);

  const reset = useCallback(() => {
    stop();
    setProgress(0);
    setPoints([]);
  }, [stop]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    points,
    progress,
    isAnimating,
    start,
    stop,
    reset,
  };
};

// Mathematical transform animations
export const useTransformAnimation = (
  config: MathTransformConfig,
  animationConfig: MathAnimationConfig = {}
) => {
  const [transform, setTransform] = useState(config.from);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const { duration = 1000, easing = 'golden', delay = 0 } = animationConfig;
  
  const animate = useCallback(() => {
    setIsAnimating(true);
    
    const startTime = Date.now() + delay;
    const startTransform = { ...config.from };
    const endTransform = { ...config.to };
    
    const step = () => {
      const now = Date.now();
      if (now < startTime) {
        requestAnimationFrame(step);
        return;
      }
      
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apply easing (simplified)
      let easedProgress = progress;
      if (easing === 'golden') {
        easedProgress = progress * progress * (3.0 - 2.0 * progress);
      }
      
      // Interpolate each transform property
      const currentTransform = {
        x: startTransform.x !== undefined && endTransform.x !== undefined 
          ? startTransform.x + (endTransform.x - startTransform.x) * easedProgress
          : startTransform.x ?? endTransform.x,
        y: startTransform.y !== undefined && endTransform.y !== undefined
          ? startTransform.y + (endTransform.y - startTransform.y) * easedProgress  
          : startTransform.y ?? endTransform.y,
        scale: startTransform.scale !== undefined && endTransform.scale !== undefined
          ? startTransform.scale + (endTransform.scale - startTransform.scale) * easedProgress
          : startTransform.scale ?? endTransform.scale,
        rotate: startTransform.rotate !== undefined && endTransform.rotate !== undefined
          ? startTransform.rotate + (endTransform.rotate - startTransform.rotate) * easedProgress
          : startTransform.rotate ?? endTransform.rotate,
        opacity: startTransform.opacity !== undefined && endTransform.opacity !== undefined
          ? startTransform.opacity + (endTransform.opacity - startTransform.opacity) * easedProgress
          : startTransform.opacity ?? endTransform.opacity,
      };
      
      setTransform(currentTransform);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(step);
  }, [config, duration, easing, delay]);

  const reset = useCallback(() => {
    setTransform(config.from);
    setIsAnimating(false);
  }, [config.from]);

  // Generate CSS transform string
  const transformString = [
    transform.x !== undefined || transform.y !== undefined 
      ? `translate(${transform.x || 0}px, ${transform.y || 0}px)` 
      : '',
    transform.scale !== undefined ? `scale(${transform.scale})` : '',
    transform.rotate !== undefined ? `rotate(${transform.rotate}deg)` : '',
  ].filter(Boolean).join(' ');

  return {
    transform,
    transformString,
    opacity: transform.opacity,
    isAnimating,
    animate,
    reset,
  };
};

export default {
  useMathematicalMorphing,
  useStepByStepAnimation,
  useFunctionAnimation,
  useTransformAnimation,
};