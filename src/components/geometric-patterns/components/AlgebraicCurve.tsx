/**
 * Algebraic Curve Component
 * 
 * Parametric mathematical curves (lemniscates, Cassini ovals, etc.) for decorative
 * mathematical elements. Supports animated curve tracing and interactive exploration.
 */

'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { AlgebraicCurveProps, CurveType, CurveParameters, AudienceColorSchemes, PatternPerformanceMetrics, Point2D } from '../types/patterns';
import { AlgebraicCurveGenerator, PatternUtils } from '../core/PatternGenerator';

// ==========================================
// Component Implementation
// ==========================================

export const AlgebraicCurve: React.FC<AlgebraicCurveProps> = ({
  className,
  style,
  animate = true,
  complexity = 'intermediate',
  audience = 'academic',
  performance = 'balanced',
  curveType = 'lemniscate',
  parameters = {},
  resolution = 1000,
  strokeWidth = 2,
  showGrid = false,
  showEquation = false,
  parametricRange = [0, 2 * Math.PI],
  animateTrace = true,
  onPatternComplete,
  onPerformanceUpdate,
}) => {
  // ==========================================
  // State Management
  // ==========================================
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [curvePoints, setCurvePoints] = useState<Point2D[]>([]);
  const [traceProgress, setTraceProgress] = useState(1);
  const [performanceMetrics, setPerformanceMetrics] = useState<PatternPerformanceMetrics | null>(null);

  // ==========================================
  // Color Schemes for Triple Audience
  // ==========================================
  
  const colorSchemes: AudienceColorSchemes = useMemo(() => ({
    business: {
      primary: '#2563eb',    // Professional blue
      secondary: '#f59e0b',  // Success gold
      accent: '#10b981',     // Growth green
      background: 'transparent',
      stroke: '#1e293b',     // Sharp definition
      highlight: '#fbbf24',  // Golden highlights
      gradient: {
        start: '#2563eb',
        end: '#f59e0b',
        direction: 0
      }
    },
    technical: {
      primary: '#06b6d4',    // Cyan precision
      secondary: '#8b5cf6',  // Purple functions
      accent: '#10b981',     // Success green
      background: 'transparent',
      stroke: '#374151',     // Technical lines
      highlight: '#06ffa5',  // Bright highlight
      gradient: {
        start: '#06b6d4',
        end: '#8b5cf6',
        direction: 45
      }
    },
    academic: {
      primary: '#7c3aed',    // Academic purple
      secondary: '#059669',  // Theorem green
      accent: '#dc2626',     // Important red
      background: 'transparent',
      stroke: '#374151',     // Scholarly precision
      highlight: '#f59e0b',  // Citation gold
      gradient: {
        start: '#7c3aed',
        end: '#059669',
        direction: 90
      }
    }
  }), []);

  // ==========================================
  // Derived Values
  // ==========================================
  
  const currentColorScheme = useMemo(() => {
    return colorSchemes[audience] || colorSchemes.academic;
  }, [colorSchemes, audience]);

  const adjustedResolution = useMemo(() => {
    const complexityMultipliers = {
      beginner: 0.5,
      intermediate: 1.0,
      advanced: 1.5,
      expert: 2.0,
      research: 2.5
    };
    
    const performanceMultipliers = {
      battery: 0.5,
      balanced: 1.0,
      performance: 1.5
    };
    
    return Math.floor(
      resolution * 
      complexityMultipliers[complexity] * 
      performanceMultipliers[performance]
    );
  }, [resolution, complexity, performance]);

  const curveEquation = useMemo(() => {
    const equations: Record<CurveType, string> = {
      lemniscate: '(x² + y²)² = a²(x² - y²)',
      'cassini-oval': '(x² + y²)² - 2a²(x² - y²) = b⁴ - a⁴',
      cardioid: 'r = a(1 - cos θ)',
      rose: 'r = a cos(nθ)',
      spiral: 'r = a + bθ',
      cycloid: 'x = r(t - sin t), y = r(1 - cos t)',
      parametric: 'x = f(t), y = g(t)',
      bezier: 'B(t) = Σ(binom(n,i) * (1-t)^(n-i) * t^i * P_i)',
      spline: 'S(t) = Σ(N_i(t) * P_i)'
    };
    return equations[curveType] || equations.lemniscate;
  }, [curveType]);

  // ==========================================
  // Pattern Generation
  // ==========================================
  
  const generatePattern = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Set canvas size with device pixel ratio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = rect.width;
    const displayHeight = rect.height;
    
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    const startTime = Date.now();

    try {
      // Generate curve points
      const bounds = {
        x: 0,
        y: 0,
        width: displayWidth,
        height: displayHeight
      };

      // Prepare curve parameters with defaults
      const curveParams: CurveParameters = {
        a: parameters.a || getDefaultParameter('a', curveType, displayWidth, displayHeight),
        b: parameters.b || getDefaultParameter('b', curveType, displayWidth, displayHeight),
        c: parameters.c || getDefaultParameter('c', curveType, displayWidth, displayHeight),
        n: parameters.n || getDefaultParameter('n', curveType, displayWidth, displayHeight),
        t_min: parameters.t_min || parametricRange[0],
        t_max: parameters.t_max || parametricRange[1],
        custom: parameters.custom
      };

      const generatedPoints = AlgebraicCurveGenerator.generateCurve(
        curveType,
        curveParams,
        bounds,
        adjustedResolution
      );

      setCurvePoints(generatedPoints);

      // Clear canvas
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // Draw grid if enabled
      if (showGrid) {
        drawGrid(ctx, bounds, currentColorScheme);
      }

      // Render algebraic curve
      renderCurve(ctx, generatedPoints, currentColorScheme, {
        strokeWidth,
        animateTrace,
        traceProgress,
        isAnimating
      });

      const endTime = Date.now();
      const renderTime = endTime - startTime;

      // Update performance metrics
      const metrics: PatternPerformanceMetrics = {
        renderTime,
        frameRate: 1000 / renderTime,
        patternComplexity: calculateComplexityScore(generatedPoints, curveType),
        elementCount: generatedPoints.length,
        canvasSize: { width: displayWidth, height: displayHeight },
        timestamp: Date.now()
      };

      setPerformanceMetrics(metrics);
      onPerformanceUpdate?.(metrics);

      if (!isLoaded) {
        setIsLoaded(true);
        onPatternComplete?.();
      }

    } catch (error) {
      console.error('Error generating algebraic curve:', error);
    }
  }, [
    canvasRef,
    containerRef,
    curveType,
    parameters,
    adjustedResolution,
    parametricRange,
    currentColorScheme,
    strokeWidth,
    showGrid,
    animateTrace,
    traceProgress,
    isAnimating,
    isLoaded,
    onPatternComplete,
    onPerformanceUpdate
  ]);

  // ==========================================
  // Curve Rendering Function
  // ==========================================
  
  const renderCurve = useCallback((
    ctx: CanvasRenderingContext2D,
    points: Point2D[],
    colors: typeof currentColorScheme,
    options: {
      strokeWidth: number;
      animateTrace: boolean;
      traceProgress: number;
      isAnimating: boolean;
    }
  ) => {
    if (points.length < 2) return;
    
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    const currentTime = Date.now() * 0.001;
    
    // Calculate how many points to draw based on trace progress
    const pointsToShow = options.animateTrace 
      ? Math.floor(points.length * options.traceProgress)
      : points.length;
    
    if (pointsToShow < 2) return;

    ctx.save();
    
    // Create gradient stroke for enhanced visual appeal
    const gradient = ctx.createLinearGradient(
      points[0][0], points[0][1],
      points[pointsToShow - 1][0], points[pointsToShow - 1][1]
    );
    
    gradient.addColorStop(0, colors.gradient?.start || colors.primary);
    gradient.addColorStop(0.5, colors.secondary);
    gradient.addColorStop(1, colors.gradient?.end || colors.accent);

    // Set line styles
    ctx.strokeStyle = gradient;
    ctx.lineWidth = options.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Add subtle glow effect
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = options.isAnimating ? 8 : 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw main curve
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    
    for (let i = 1; i < pointsToShow; i++) {
      // Add slight animation perturbation if animating
      let x = points[i][0];
      let y = points[i][1];
      
      if (options.isAnimating && options.animateTrace) {
        const perturbation = Math.sin(currentTime * 2 + i * 0.01) * 0.5;
        x += perturbation;
        y += perturbation;
      }
      
      // Use quadratic curves for smoother appearance
      if (i < pointsToShow - 1) {
        const nextPoint = points[i + 1];
        const cpX = (x + nextPoint[0]) / 2;
        const cpY = (y + nextPoint[1]) / 2;
        ctx.quadraticCurveTo(x, y, cpX, cpY);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Draw animated trace point if tracing
    if (options.animateTrace && pointsToShow < points.length) {
      const tracePoint = points[pointsToShow - 1];
      
      ctx.beginPath();
      ctx.arc(tracePoint[0], tracePoint[1], options.strokeWidth * 2, 0, 2 * Math.PI);
      
      ctx.fillStyle = colors.highlight;
      ctx.shadowBlur = 12;
      ctx.shadowColor = colors.highlight;
      ctx.fill();
      
      // Pulsing effect
      if (options.isAnimating) {
        const pulseRadius = options.strokeWidth * 3 + Math.sin(currentTime * 4) * 2;
        
        ctx.beginPath();
        ctx.arc(tracePoint[0], tracePoint[1], pulseRadius, 0, 2 * Math.PI);
        
        ctx.strokeStyle = colors.highlight;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
      }
    }
    
    // Draw curve endpoints
    if (!options.animateTrace || pointsToShow >= points.length) {
      [0, pointsToShow - 1].forEach(index => {
        if (index < points.length) {
          const point = points[index];
          
          ctx.beginPath();
          ctx.arc(point[0], point[1], options.strokeWidth * 1.5, 0, 2 * Math.PI);
          
          ctx.fillStyle = colors.accent;
          ctx.globalAlpha = 0.8;
          ctx.fill();
          
          ctx.strokeStyle = colors.primary;
          ctx.lineWidth = 1;
          ctx.globalAlpha = 1;
          ctx.stroke();
        }
      });
    }
    
    ctx.restore();
  }, []);

  // ==========================================
  // Grid Drawing Function
  // ==========================================
  
  const drawGrid = useCallback((
    ctx: CanvasRenderingContext2D,
    bounds: { x: number; y: number; width: number; height: number },
    colors: typeof currentColorScheme
  ) => {
    const gridSize = 20;
    const phi = (1 + Math.sqrt(5)) / 2;
    
    ctx.save();
    
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;
    
    // Draw vertical lines
    for (let x = 0; x <= bounds.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, bounds.height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= bounds.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(bounds.width, y);
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    
    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(bounds.width, centerY);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, bounds.height);
    ctx.stroke();
    
    ctx.restore();
  }, []);

  // ==========================================
  // Animation Management
  // ==========================================
  
  const startTraceAnimation = useCallback(() => {
    if (!animateTrace) return;
    
    setTraceProgress(0);
    setIsAnimating(true);
    
    const animationDuration = 3000; // 3 seconds
    const startTime = Date.now();
    
    const animateFrame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Use golden ratio easing for smooth animation
      const phi = (1 + Math.sqrt(5)) / 2;
      const easedProgress = progress * progress * (3 - 2 * progress); // Smoothstep
      
      setTraceProgress(easedProgress);
      generatePattern();
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateFrame);
      } else {
        setIsAnimating(false);
        setTraceProgress(1);
      }
    };
    
    animationRef.current = requestAnimationFrame(animateFrame);
  }, [animateTrace, generatePattern]);

  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
  }, []);

  // ==========================================
  // Effects
  // ==========================================
  
  useEffect(() => {
    generatePattern();
  }, [generatePattern]);

  useEffect(() => {
    if (animate && animateTrace) {
      startTraceAnimation();
    } else if (!animate) {
      stopAnimation();
    }
    
    return () => stopAnimation();
  }, [animate, animateTrace, startTraceAnimation, stopAnimation]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(generatePattern, 100); // Debounce resize
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [generatePattern]);

  // ==========================================
  // Component Classes
  // ==========================================
  
  const containerClasses = classNames(
    'relative w-full overflow-hidden',
    'transition-golden duration-300',
    className
  );

  const canvasClasses = classNames(
    'w-full block',
    'transition-golden duration-300'
  );

  // ==========================================
  // Render
  // ==========================================
  
  return (
    <div ref={containerRef} className={containerClasses} style={style}>
      <canvas 
        ref={canvasRef}
        className={canvasClasses}
        style={{ imageRendering: 'crisp-edges' }}
      />
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.618, 0, 0.382, 1] }}
            className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-math-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-math-primary font-mathematical">
                Generating {curveType} curve...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Equation Display */}
      {showEquation && (
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-lg">
          <div className="text-sm">
            <div className="font-semibold text-gray-800 mb-1">{curveType.charAt(0).toUpperCase() + curveType.slice(1)}</div>
            <div className="font-mathematical text-math-primary">{curveEquation}</div>
            {parameters.a && <div className="text-xs text-gray-600 mt-1">a = {parameters.a}</div>}
            {parameters.b && <div className="text-xs text-gray-600">b = {parameters.b}</div>}
            {parameters.n && <div className="text-xs text-gray-600">n = {parameters.n}</div>}
          </div>
        </div>
      )}

      {/* Performance Overlay */}
      {performanceMetrics && process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs p-2 rounded font-mono">
          <div>Render: {performanceMetrics.renderTime.toFixed(1)}ms</div>
          <div>Points: {performanceMetrics.elementCount}</div>
          <div>Complexity: {performanceMetrics.patternComplexity.toFixed(2)}</div>
        </div>
      )}

      {/* Animation Controls */}
      {animateTrace && (
        <div className="absolute bottom-2 right-2 flex gap-2">
          <button
            onClick={startTraceAnimation}
            className="px-3 py-1 bg-math-primary text-white rounded text-sm hover:bg-math-primary/90 transition-colors"
          >
            Trace Curve
          </button>
          <button
            onClick={() => { setTraceProgress(1); generatePattern(); }}
            className="px-3 py-1 bg-math-secondary text-white rounded text-sm hover:bg-math-secondary/90 transition-colors"
          >
            Show Complete
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// Helper Functions
// ==========================================

function getDefaultParameter(param: string, curveType: CurveType, width: number, height: number): number {
  const scale = Math.min(width, height) / 4;
  
  const defaults: Record<CurveType, Record<string, number>> = {
    lemniscate: { a: scale * 0.8, b: scale * 0.8, n: 2 },
    'cassini-oval': { a: scale * 0.6, b: scale * 0.8, n: 2 },
    cardioid: { a: scale * 0.8, b: scale * 0.8, n: 1 },
    rose: { a: scale * 0.8, b: scale * 0.8, n: 5 },
    spiral: { a: 5, b: 10, n: 1 },
    cycloid: { a: scale * 0.3, b: scale * 0.3, n: 1 },
    parametric: { a: scale * 0.8, b: scale * 0.8, n: 1 },
    bezier: { a: scale * 0.8, b: scale * 0.8, n: 3 },
    spline: { a: scale * 0.8, b: scale * 0.8, n: 4 }
  };
  
  return defaults[curveType]?.[param] || scale;
}

function calculateComplexityScore(points: Point2D[], curveType: CurveType): number {
  if (points.length === 0) return 0;
  
  // Calculate curve complexity based on point count and type
  const pointScore = Math.min(points.length / 1000, 1);
  
  const typeComplexity: Record<CurveType, number> = {
    lemniscate: 0.6,
    'cassini-oval': 0.7,
    cardioid: 0.4,
    rose: 0.8,
    spiral: 0.5,
    cycloid: 0.6,
    parametric: 0.9,
    bezier: 0.7,
    spline: 0.8
  };
  
  const typeScore = typeComplexity[curveType] || 0.5;
  
  return (pointScore + typeScore) / 2;
}

export default AlgebraicCurve;