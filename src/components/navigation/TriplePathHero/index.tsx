/**
 * Triple Path Hero Component
 * Main orchestrator for the sophisticated landing page with three audience pathways
 * Mathematical precision meets practical pathways through golden ratio design
 */

'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import classNames from 'classnames';

// Component imports
import { CentralSpiral } from './CentralSpiral';
import { BusinessPath } from './BusinessPath';
import { TechnicalPath } from './TechnicalPath';
import { AcademicPath } from './AcademicPath';

// Types
import {
  TriplePathHeroProps,
  HeroAnimationConfig,
  GoldenSpiralConfig,
  PathwayAnimationState,
  PerformanceMetrics,
  ResponsiveBreakpoints,
  MathematicalTransition
} from './types';

// ==========================================
// Default Configurations
// ==========================================

const DEFAULT_ANIMATION_CONFIG: HeroAnimationConfig = {
  duration: 800,
  easing: 'cubic-bezier(0.618, 0, 0.382, 1)', // Golden ratio easing
  delay: 0,
  stagger: 100
};

const DEFAULT_SPIRAL_CONFIG: GoldenSpiralConfig = {
  segments: 144, // Fibonacci number for mathematical precision
  maxRotations: 3,
  animationDuration: 8000,
  particleCount: 21, // Fibonacci number
  colorScheme: 'mathematical'
};

const RESPONSIVE_BREAKPOINTS: ResponsiveBreakpoints = {
  mobile: 640,
  tablet: 768, 
  desktop: 1024,
  largeDesktop: 1280,
  ultrawide: 1536
};

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2; // φ ≈ 1.618

// ==========================================
// Performance Monitoring Hook
// ==========================================

const usePerformanceMonitoring = (
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void
) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const updateMetrics = useCallback((newMetrics: Partial<PerformanceMetrics>) => {
    const fullMetrics: PerformanceMetrics = {
      renderTime: 0,
      animationFrameRate: 60,
      memoryUsage: 0,
      interactionLatency: 0,
      spiralComplexity: 0,
      pathwayResponsiveness: 0,
      timestamp: Date.now(),
      ...metrics,
      ...newMetrics
    };

    setMetrics(fullMetrics);
    onPerformanceUpdate?.(fullMetrics);
  }, [metrics, onPerformanceUpdate]);

  return { metrics, updateMetrics };
};

// ==========================================
// Responsive Layout Hook
// ==========================================

const useResponsiveLayout = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  const [currentBreakpoint, setCurrentBreakpoint] = useState<keyof ResponsiveBreakpoints>('desktop');

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewport({ width, height });

      // Determine breakpoint
      if (width >= RESPONSIVE_BREAKPOINTS.ultrawide) {
        setCurrentBreakpoint('ultrawide');
      } else if (width >= RESPONSIVE_BREAKPOINTS.largeDesktop) {
        setCurrentBreakpoint('largeDesktop');
      } else if (width >= RESPONSIVE_BREAKPOINTS.desktop) {
        setCurrentBreakpoint('desktop');
      } else if (width >= RESPONSIVE_BREAKPOINTS.tablet) {
        setCurrentBreakpoint('tablet');
      } else {
        setCurrentBreakpoint('mobile');
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return { viewport, currentBreakpoint };
};

// ==========================================
// Main Triple Path Hero Component
// ==========================================

export const TriplePathHero: React.FC<TriplePathHeroProps> = ({
  className,
  style,
  animationConfig: configOverride = {},
  spiralConfig: spiralConfigOverride = {},
  businessConfig,
  technicalConfig,
  academicConfig,
  performanceMode = 'balanced',
  enableParallax = true,
  enableHoverPreview = true,
  enablePathTransitions = true,
  onPathSelection,
  onSpiralInteraction,
  onPerformanceMetrics,
  reduceMotion: reduceMotionProp,
  highContrast = false,
  screenReaderOptimized = false
}) => {
  // ==========================================
  // Motion Preferences
  // ==========================================
  
  const prefersReducedMotion = useReducedMotion();
  const shouldReduceMotion = reduceMotionProp ?? prefersReducedMotion;

  // ==========================================
  // State Management
  // ==========================================
  
  const [activePathway, setActivePathway] = useState<'business' | 'technical' | 'academic' | null>(null);
  const [hoveredPath, setHoveredPath] = useState<'business' | 'technical' | 'academic' | null>(null);
  const [spiralPhase, setSpiralPhase] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [pathwayStates, setPathwayStates] = useState<Record<string, PathwayAnimationState>>({
    business: { phase: 'idle', progress: 0 },
    technical: { phase: 'idle', progress: 0 },
    academic: { phase: 'idle', progress: 0 }
  });

  // ==========================================
  // Hooks
  // ==========================================
  
  const { viewport, currentBreakpoint } = useResponsiveLayout();
  const { metrics, updateMetrics } = usePerformanceMonitoring(onPerformanceMetrics);

  // ==========================================
  // Configurations
  // ==========================================
  
  const animationConfig = useMemo(() => ({
    ...DEFAULT_ANIMATION_CONFIG,
    ...configOverride,
    duration: shouldReduceMotion ? 0 : configOverride.duration ?? DEFAULT_ANIMATION_CONFIG.duration
  }), [configOverride, shouldReduceMotion]);

  const spiralConfig = useMemo(() => ({
    ...DEFAULT_SPIRAL_CONFIG,
    ...spiralConfigOverride,
    // Adjust for performance mode
    segments: performanceMode === 'conservative' 
      ? Math.floor(DEFAULT_SPIRAL_CONFIG.segments * 0.6)
      : performanceMode === 'balanced'
      ? Math.floor(DEFAULT_SPIRAL_CONFIG.segments * 0.8)
      : DEFAULT_SPIRAL_CONFIG.segments,
    particleCount: performanceMode === 'conservative'
      ? Math.floor(DEFAULT_SPIRAL_CONFIG.particleCount * 0.5)
      : performanceMode === 'balanced'
      ? Math.floor(DEFAULT_SPIRAL_CONFIG.particleCount * 0.7)
      : DEFAULT_SPIRAL_CONFIG.particleCount
  }), [spiralConfigOverride, performanceMode]);

  // ==========================================
  // Layout Calculations
  // ==========================================
  
  const layoutConfig = useMemo(() => {
    const isMobile = currentBreakpoint === 'mobile';
    const isTablet = currentBreakpoint === 'tablet';
    
    return {
      pathWidth: isMobile ? '100%' : isTablet ? '45%' : '30%',
      spiralSize: isMobile ? '60vw' : isTablet ? '40vw' : '25vw',
      stackVertically: isMobile || isTablet,
      enableParallax: enableParallax && !isMobile && !shouldReduceMotion,
      showAllPaths: currentBreakpoint !== 'mobile'
    };
  }, [currentBreakpoint, enableParallax, shouldReduceMotion]);

  // ==========================================
  // Animation Controls
  // ==========================================
  
  const handlePathSelection = useCallback((path: 'business' | 'technical' | 'academic') => {
    const startTime = performance.now();
    
    setActivePathway(activePathway === path ? null : path);
    
    // Update pathway state
    setPathwayStates(prev => ({
      ...prev,
      [path]: {
        phase: 'selected',
        progress: 1,
        activeTransition: {
          from: 'center',
          to: path,
          transformType: 'spiral',
          duration: animationConfig.duration,
          equation: `φ(t) = e^{i⋅t⋅${GOLDEN_RATIO}}`
        }
      }
    }));

    // Performance tracking
    const endTime = performance.now();
    updateMetrics({
      interactionLatency: endTime - startTime,
      pathwayResponsiveness: 1000 / (endTime - startTime)
    });

    onPathSelection?.(path);
  }, [activePathway, animationConfig.duration, updateMetrics, onPathSelection]);

  const handlePathHover = useCallback((path: 'business' | 'technical' | 'academic' | null, isHovering: boolean) => {
    if (!enableHoverPreview) return;

    setHoveredPath(isHovering ? path : null);
    
    if (path) {
      setPathwayStates(prev => ({
        ...prev,
        [path]: {
          ...prev[path],
          phase: isHovering ? 'hovering' : 'idle',
          progress: isHovering ? 0.3 : 0
        }
      }));
    }
  }, [enableHoverPreview]);

  const handleSpiralClick = useCallback(() => {
    setSpiralPhase(prev => prev + Math.PI / 4);
    onSpiralInteraction?.('click', { phase: spiralPhase, timestamp: Date.now() });
  }, [spiralPhase, onSpiralInteraction]);

  // ==========================================
  // Animation Variants
  // ==========================================
  
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        duration: animationConfig.duration / 1000,
        when: 'beforeChildren',
        staggerChildren: animationConfig.stagger / 1000
      }
    }
  };

  const pathVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.9
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: animationConfig.duration / 1000,
        delay: (animationConfig.delay + index * animationConfig.stagger) / 1000
      }
    })
  };

  // ==========================================
  // Effect: Spiral Animation
  // ==========================================
  
  useEffect(() => {
    if (shouldReduceMotion) return;

    const interval = setInterval(() => {
      setSpiralPhase(prev => prev + 0.02);
    }, 50);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  // ==========================================
  // Effect: Load State
  // ==========================================
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
      updateMetrics({
        renderTime: Date.now() - (metrics?.timestamp || Date.now())
      });
    }, animationConfig.duration);

    return () => clearTimeout(timer);
  }, [animationConfig.duration, metrics?.timestamp, updateMetrics]);

  // ==========================================
  // Component Classes
  // ==========================================
  
  const containerClasses = classNames(
    'relative w-full min-h-screen',
    'bg-gradient-to-br from-slate-50 via-white to-blue-50',
    'overflow-hidden',
    {
      'motion-reduce:transition-none': shouldReduceMotion,
      'contrast-more:bg-white': highContrast,
    },
    className
  );

  const gridClasses = classNames(
    'relative h-full',
    {
      // Mobile/Tablet: Stack vertically
      'flex flex-col': layoutConfig.stackVertically,
      // Desktop: Grid layout with golden ratio proportions
      'grid grid-cols-3 gap-8': !layoutConfig.stackVertically,
      'p-4': currentBreakpoint === 'mobile',
      'p-6': currentBreakpoint === 'tablet',
      'p-8': currentBreakpoint === 'desktop',
      'p-12': currentBreakpoint === 'largeDesktop' || currentBreakpoint === 'ultrawide'
    }
  );

  // ==========================================
  // Render
  // ==========================================
  
  return (
    <motion.div
      className={containerClasses}
      style={style}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="main"
      aria-label="ZKTheory mathematical pathways"
    >
      {/* Mathematical Grid Background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(99, 102, 241, 0.1) 25%, rgba(99, 102, 241, 0.1) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.1) 75%, rgba(99, 102, 241, 0.1) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(99, 102, 241, 0.1) 25%, rgba(99, 102, 241, 0.1) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.1) 75%, rgba(99, 102, 241, 0.1) 76%, transparent 77%, transparent)
          `,
          backgroundSize: `${GOLDEN_RATIO * 50}px ${50}px`
        }}
      />

      {/* Performance Overlay (Development) */}
      {process.env.NODE_ENV === 'development' && metrics && (
        <div className="absolute top-4 right-4 bg-black/75 text-white text-xs p-3 rounded font-mono z-50">
          <div>Render: {metrics.renderTime.toFixed(1)}ms</div>
          <div>FPS: {metrics.animationFrameRate.toFixed(0)}</div>
          <div>Latency: {metrics.interactionLatency.toFixed(1)}ms</div>
          <div>Viewport: {viewport.width}×{viewport.height}</div>
          <div>Breakpoint: {currentBreakpoint}</div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className={gridClasses}>
        {/* Business Leaders Path */}
        <motion.div
          className="h-full min-h-[600px]"
          variants={pathVariants}
          custom={0}
        >
          <BusinessPath
            isActive={activePathway === 'business'}
            isHovered={hoveredPath === 'business'}
            animationDelay={0}
            performanceMode={performanceMode}
            onPathSelect={() => handlePathSelection('business')}
            onHoverStart={() => handlePathHover('business', true)}
            onHoverEnd={() => handlePathHover('business', false)}
            config={businessConfig}
          />
        </motion.div>

        {/* Central Mathematical Spiral */}
        <motion.div
          className={classNames(
            'flex items-center justify-center',
            {
              'h-96': layoutConfig.stackVertically,
              'h-full': !layoutConfig.stackVertically
            }
          )}
          variants={pathVariants}
          custom={1}
        >
          <div 
            className={classNames('relative', {
              'w-full h-full': !layoutConfig.stackVertically,
              [`w-[${layoutConfig.spiralSize}] h-[${layoutConfig.spiralSize}]`]: layoutConfig.stackVertically
            })}
            style={{
              width: layoutConfig.stackVertically ? layoutConfig.spiralSize : '100%',
              height: layoutConfig.stackVertically ? layoutConfig.spiralSize : '100%'
            }}
          >
            <CentralSpiral
              config={spiralConfig}
              activePathway={activePathway}
              spiralPhase={spiralPhase}
              onSpiralClick={handleSpiralClick}
              performanceMode={performanceMode}
            />
          </div>
        </motion.div>

        {/* Technical Developers Path */}
        <motion.div
          className="h-full min-h-[600px]"
          variants={pathVariants}
          custom={1}
        >
          <TechnicalPath
            isActive={activePathway === 'technical'}
            isHovered={hoveredPath === 'technical'}
            animationDelay={animationConfig.stagger}
            performanceMode={performanceMode}
            onPathSelect={() => handlePathSelection('technical')}
            onHoverStart={() => handlePathHover('technical', true)}
            onHoverEnd={() => handlePathHover('technical', false)}
            config={technicalConfig}
          />
        </motion.div>

        {/* Academic Researchers Path (Mobile: Below grid) */}
        <motion.div
          className={classNames(
            'h-full min-h-[600px]',
            {
              'col-span-3 mt-8': layoutConfig.stackVertically
            }
          )}
          variants={pathVariants}
          custom={2}
        >
          <AcademicPath
            isActive={activePathway === 'academic'}
            isHovered={hoveredPath === 'academic'}
            animationDelay={animationConfig.stagger * 2}
            performanceMode={performanceMode}
            onPathSelect={() => handlePathSelection('academic')}
            onHoverStart={() => handlePathHover('academic', true)}
            onHoverEnd={() => handlePathHover('academic', false)}
            config={academicConfig}
          />
        </motion.div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm z-40"
          >
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-math-primary border-t-transparent rounded-full animate-golden mb-4" />
              <h2 className="text-xl font-mathematical text-math-primary mb-2">
                Initializing Mathematical Pathways
              </h2>
              <p className="text-math-secondary font-mathematical">
                Preparing φ-ratio precision interface...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessibility Enhancements */}
      {screenReaderOptimized && (
        <div className="sr-only">
          <h1>ZKTheory Mathematical Computing Platform</h1>
          <p>
            Choose your pathway: Business Leaders for ROI-focused solutions, 
            Technical Developers for code implementation, or Academic Researchers 
            for theoretical exploration.
          </p>
          <nav aria-label="Pathway navigation">
            <button
              type="button"
              onClick={() => handlePathSelection('business')}
              aria-pressed={activePathway === 'business'}
            >
              Business Leaders Pathway
            </button>
            <button
              type="button"
              onClick={() => handlePathSelection('technical')}
              aria-pressed={activePathway === 'technical'}
            >
              Technical Developers Pathway
            </button>
            <button
              type="button"
              onClick={() => handlePathSelection('academic')}
              aria-pressed={activePathway === 'academic'}
            >
              Academic Researchers Pathway
            </button>
          </nav>
        </div>
      )}

      {/* Mathematical Transition Indicators */}
      <AnimatePresence>
        {enablePathTransitions && activePathway && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 border border-math-primary/20">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-math-primary rounded-full animate-pulse" />
                <span className="font-mathematical text-math-primary">
                  Mathematical transformation active: {activePathway} pathway
                </span>
                <span className="font-math-code text-math-secondary">
                  φ = {GOLDEN_RATIO.toFixed(3)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TriplePathHero;