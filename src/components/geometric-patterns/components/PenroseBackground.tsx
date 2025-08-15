/**
 * Penrose Background Component
 * 
 * Stunning non-repeating Penrose tiling background that symbolizes uniqueness of mathematical proofs.
 * Integrates seamlessly with the mathematical design system using φ-based proportions.
 */

'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { PenrosePatternProps, PenroseTile, AudienceColorSchemes, PatternPerformanceMetrics } from '../types/patterns';
import { PenroseTilingGenerator, PatternUtils } from '../core/PatternGenerator';

// ==========================================
// Component Implementation
// ==========================================

export const PenroseBackground: React.FC<PenrosePatternProps> = ({
  className,
  style,
  animate = true,
  complexity = 'intermediate',
  audience = 'business',
  performance = 'balanced',
  tileSize = 40,
  generations = 5,
  colorScheme = 'mathematical',
  showDeflation = false,
  interactiveZoom = false,
  density = 'medium',
  goldenRatio = true,
  exportable = false,
  onPatternComplete,
  onPerformanceUpdate,
}) => {
  // ==========================================
  // State Management
  // ==========================================
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState<[number, number]>([0, 0]);
  const [tiles, setTiles] = useState<PenroseTile[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PatternPerformanceMetrics | null>(null);

  // ==========================================
  // Color Schemes for Triple Audience
  // ==========================================
  
  const colorSchemes: AudienceColorSchemes = useMemo(() => ({
    business: {
      primary: '#2563eb',    // Trust-building blue
      secondary: '#f59e0b',  // Gold for success/ROI
      accent: '#10b981',     // Growth green
      background: '#f8fafc', // Clean professional
      stroke: '#1e293b',     // Sharp definition
      highlight: '#fbbf24',  // Golden highlights
      gradient: {
        start: '#2563eb',
        end: '#7c3aed',
        direction: 135
      }
    },
    technical: {
      primary: '#0f172a',    // Code-like precision
      secondary: '#06b6d4',  // Cyan for data flow
      accent: '#8b5cf6',     // Purple for functions
      background: '#0f172a', // Dark technical
      stroke: '#64748b',     // Subtle circuit lines
      highlight: '#06b6d4',  // Bright accents
      gradient: {
        start: '#0f172a',
        end: '#1e293b',
        direction: 90
      }
    },
    academic: {
      primary: '#7c3aed',    // Academic purple
      secondary: '#059669',  // Theorem green
      accent: '#dc2626',     // Important red
      background: '#fefbff', // Paper white
      stroke: '#374151',     // Scholarly precision
      highlight: '#f59e0b',  // Citation gold
      gradient: {
        start: '#7c3aed',
        end: '#059669',
        direction: 45
      }
    }
  }), []);

  // ==========================================
  // Derived Values
  // ==========================================
  
  const currentColorScheme = useMemo(() => {
    return colorSchemes[audience] || colorSchemes.business;
  }, [colorSchemes, audience]);

  const densityMultiplier = useMemo(() => {
    const densityMap = { sparse: 0.7, medium: 1.0, dense: 1.4 };
    return densityMap[density];
  }, [density]);

  const maxGenerations = useMemo(() => {
    const complexityMap = {
      beginner: 3,
      intermediate: 5,
      advanced: 7,
      expert: 9,
      research: 12
    };
    return Math.min(generations, complexityMap[complexity]);
  }, [generations, complexity]);

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

    // Calculate optimal tile size based on performance and density
    const optimalTileSize = PatternUtils.calculateOptimalDensity(
      { x: 0, y: 0, width: displayWidth, height: displayHeight },
      tileSize * densityMultiplier,
      performance
    );

    const startTime = performance.now();

    try {
      // Generate Penrose tiling
      const bounds = {
        x: -panOffset[0] / zoomLevel,
        y: -panOffset[1] / zoomLevel,
        width: displayWidth / zoomLevel,
        height: displayHeight / zoomLevel
      };

      const generatedTiles = PenroseTilingGenerator.generateTiling(
        bounds,
        maxGenerations,
        complexity
      );

      setTiles(generatedTiles);

      // Clear canvas with background
      ctx.fillStyle = currentColorScheme.background;
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Apply zoom and pan transformations
      ctx.save();
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(panOffset[0], panOffset[1]);

      // Render tiles with mathematical precision
      renderTiles(ctx, generatedTiles, currentColorScheme, {
        showDeflation,
        animate: isAnimating,
        goldenRatio
      });

      ctx.restore();

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Update performance metrics
      const metrics: PatternPerformanceMetrics = {
        renderTime,
        frameRate: 1000 / renderTime,
        patternComplexity: calculateComplexityScore(generatedTiles, maxGenerations),
        elementCount: generatedTiles.length,
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
      console.error('Error generating Penrose pattern:', error);
    }
  }, [
    canvasRef,
    containerRef,
    tileSize,
    densityMultiplier,
    performance,
    maxGenerations,
    complexity,
    panOffset,
    zoomLevel,
    currentColorScheme,
    showDeflation,
    isAnimating,
    goldenRatio,
    isLoaded,
    onPatternComplete,
    onPerformanceUpdate
  ]);

  // ==========================================
  // Tile Rendering Function
  // ==========================================
  
  const renderTiles = useCallback((
    ctx: CanvasRenderingContext2D,
    tilesToRender: PenroseTile[],
    colors: typeof currentColorScheme,
    options: {
      showDeflation: boolean;
      animate: boolean;
      goldenRatio: boolean;
    }
  ) => {
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    
    tilesToRender.forEach((tile, index) => {
      const { vertices, type, generation } = tile;
      
      // Calculate generation-based styling
      const alpha = options.showDeflation 
        ? Math.max(0.3, 1 - generation * 0.15)
        : 0.8;
      
      // Choose colors based on tile type and audience
      const fillColor = type === 'kite' ? colors.primary : colors.secondary;
      const strokeColor = colors.stroke;
      
      // Animate tile appearance if enabled
      let animationScale = 1;
      let animationRotation = 0;
      
      if (options.animate && isAnimating) {
        const animationPhase = (Date.now() * 0.001 + index * 0.1) % (2 * Math.PI);
        animationScale = 1 + Math.sin(animationPhase) * 0.05;
        
        if (options.goldenRatio) {
          animationRotation = Math.sin(animationPhase / phi) * 0.1;
        }
      }

      // Render tile
      ctx.save();
      
      // Apply animation transformations
      if (animationScale !== 1 || animationRotation !== 0) {
        const centerX = vertices.reduce((sum, v) => sum + v[0], 0) / vertices.length;
        const centerY = vertices.reduce((sum, v) => sum + v[1], 0) / vertices.length;
        
        ctx.translate(centerX, centerY);
        ctx.scale(animationScale, animationScale);
        ctx.rotate(animationRotation);
        ctx.translate(-centerX, -centerY);
      }

      // Draw tile path
      ctx.beginPath();
      ctx.moveTo(vertices[0][0], vertices[0][1]);
      
      for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i][0], vertices[i][1]);
      }
      
      ctx.closePath();

      // Fill with gradient for enhanced visual appeal
      if (colors.gradient) {
        const bounds = calculateTileBounds(vertices);
        const gradient = ctx.createLinearGradient(
          bounds.minX, bounds.minY,
          bounds.maxX, bounds.maxY
        );
        
        gradient.addColorStop(0, colors.gradient.start);
        gradient.addColorStop(1, colors.gradient.end);
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = alpha * 0.6;
        ctx.fill();
      } else {
        ctx.fillStyle = fillColor;
        ctx.globalAlpha = alpha * 0.4;
        ctx.fill();
      }

      // Stroke with precision
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1 / zoomLevel;
      ctx.stroke();

      ctx.restore();
    });
  }, [zoomLevel, isAnimating]);

  // ==========================================
  // Animation Management
  // ==========================================
  
  const startAnimation = useCallback(() => {
    if (!animate) return;
    
    setIsAnimating(true);
    
    const animateFrame = () => {
      generatePattern();
      animationRef.current = requestAnimationFrame(animateFrame);
    };
    
    animationRef.current = requestAnimationFrame(animateFrame);
  }, [animate, generatePattern]);

  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
  }, []);

  // ==========================================
  // Interactive Zoom and Pan
  // ==========================================
  
  const handleWheel = useCallback((event: WheelEvent) => {
    if (!interactiveZoom) return;
    
    event.preventDefault();
    
    const delta = -event.deltaY * 0.001;
    const newZoom = Math.max(0.1, Math.min(5, zoomLevel + delta));
    
    setZoomLevel(newZoom);
  }, [interactiveZoom, zoomLevel]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!interactiveZoom || !event.buttons) return;
    
    const deltaX = event.movementX;
    const deltaY = event.movementY;
    
    setPanOffset(prev => [prev[0] + deltaX, prev[1] + deltaY]);
  }, [interactiveZoom]);

  // ==========================================
  // Effects
  // ==========================================
  
  useEffect(() => {
    generatePattern();
  }, [generatePattern]);

  useEffect(() => {
    if (animate) {
      startAnimation();
    } else {
      stopAnimation();
    }
    
    return () => stopAnimation();
  }, [animate, startAnimation, stopAnimation]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !interactiveZoom) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleWheel, handleMouseMove, interactiveZoom]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(generatePattern, 100); // Debounce resize
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [generatePattern]);

  // ==========================================
  // Export Functionality
  // ==========================================
  
  const exportPattern = useCallback((format: 'png' | 'svg' | 'pdf') => {
    if (!exportable || !canvasRef.current) return;
    
    try {
      switch (format) {
        case 'png':
          const dataURL = canvasRef.current.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `penrose-pattern-${Date.now()}.png`;
          link.href = dataURL;
          link.click();
          break;
          
        case 'svg':
          // SVG export would require recreating the pattern as SVG
          console.log('SVG export not yet implemented');
          break;
          
        case 'pdf':
          // PDF export would require a PDF library
          console.log('PDF export not yet implemented');
          break;
      }
    } catch (error) {
      console.error('Error exporting pattern:', error);
    }
  }, [exportable]);

  // ==========================================
  // Component Classes
  // ==========================================
  
  const containerClasses = classNames(
    'relative w-full h-full overflow-hidden',
    'transition-golden duration-300',
    {
      'cursor-grab': interactiveZoom && !isAnimating,
      'cursor-grabbing': interactiveZoom && isAnimating,
      'opacity-75': !isLoaded,
    },
    className
  );

  const canvasClasses = classNames(
    'w-full h-full',
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
            className="absolute inset-0 flex items-center justify-center bg-math-primary/5 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-math-primary border-t-transparent rounded-full animate-golden" />
              <p className="text-sm text-math-primary font-mathematical">
                Generating {complexity} Penrose tiling...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Overlay */}
      {performanceMetrics && process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-black/75 text-white text-xs p-2 rounded font-mono">
          <div>Render: {performanceMetrics.renderTime.toFixed(1)}ms</div>
          <div>Elements: {performanceMetrics.elementCount}</div>
          <div>Complexity: {performanceMetrics.patternComplexity.toFixed(2)}</div>
        </div>
      )}

      {/* Interactive Controls */}
      {interactiveZoom && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 border border-gray-200">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setZoomLevel(z => Math.min(5, z * 1.2))}
              className="p-1 text-gray-600 hover:text-math-primary transition-colors"
              title="Zoom in"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button
              onClick={() => setZoomLevel(z => Math.max(0.1, z * 0.8))}
              className="p-1 text-gray-600 hover:text-math-primary transition-colors"
              title="Zoom out"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            </button>
            <button
              onClick={() => { setZoomLevel(1); setPanOffset([0, 0]); }}
              className="p-1 text-gray-600 hover:text-math-primary transition-colors"
              title="Reset view"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Export Button */}
      {exportable && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={() => exportPattern('png')}
            className="bg-math-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-math-primary/90 transition-colors"
          >
            Export PNG
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// Helper Functions
// ==========================================

function calculateTileBounds(vertices: [number, number][]) {
  const xs = vertices.map(v => v[0]);
  const ys = vertices.map(v => v[1]);
  
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys)
  };
}

function calculateComplexityScore(tiles: PenroseTile[], maxGenerations: number): number {
  if (tiles.length === 0) return 0;
  
  const avgGeneration = tiles.reduce((sum, tile) => sum + tile.generation, 0) / tiles.length;
  const densityScore = Math.min(tiles.length / 1000, 1);
  const generationScore = avgGeneration / maxGenerations;
  
  return (densityScore + generationScore) / 2;
}

export default PenroseBackground;