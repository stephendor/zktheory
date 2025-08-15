/**
 * Voronoi Divider Component
 * 
 * Elegant section dividers using Voronoi diagrams to represent distributed trust
 * and spatial relationships. Integrates with the mathematical design system.
 */

'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { VoronoiPatternProps, VoronoiCell, AudienceColorSchemes, PatternPerformanceMetrics } from '../types/patterns';
import { VoronoiGenerator, PatternUtils } from '../core/PatternGenerator';

// ==========================================
// Component Implementation
// ==========================================

export const VoronoiDivider: React.FC<VoronoiPatternProps> = ({
  className,
  style,
  animate = true,
  complexity = 'intermediate',
  audience = 'business',
  performance = 'balanced',
  pointCount = 30,
  seedPattern = 'fibonacci',
  relaxationIterations = 0,
  showPoints = false,
  showEdges = true,
  colorMode = 'gradient',
  interactive = false,
  animateGrowth = false,
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
  const [cells, setCells] = useState<VoronoiCell[]>([]);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [growthProgress, setGrowthProgress] = useState(1);
  const [performanceMetrics, setPerformanceMetrics] = useState<PatternPerformanceMetrics | null>(null);

  // ==========================================
  // Color Schemes for Triple Audience
  // ==========================================
  
  const colorSchemes: AudienceColorSchemes = useMemo(() => ({
    business: {
      primary: '#2563eb',    // Trust blue
      secondary: '#f59e0b',  // Success gold
      accent: '#10b981',     // Growth green
      background: 'transparent',
      stroke: '#e2e8f0',     // Subtle boundaries
      highlight: '#fbbf24',  // Active gold
      gradient: {
        start: '#dbeafe',    // Light blue
        end: '#fef3c7',      // Light gold
        direction: 90
      }
    },
    technical: {
      primary: '#06b6d4',    // Cyan for data flow
      secondary: '#8b5cf6',  // Purple for systems
      accent: '#10b981',     // Success green
      background: 'transparent',
      stroke: '#374151',     // Technical precision
      highlight: '#06b6d4',  // Bright cyan
      gradient: {
        start: '#0f172a',    // Dark start
        end: '#1e293b',      // Lighter dark
        direction: 135
      }
    },
    academic: {
      primary: '#7c3aed',    // Academic purple
      secondary: '#059669',  // Research green
      accent: '#dc2626',     // Important red
      background: 'transparent',
      stroke: '#d1d5db',     // Scholarly lines
      highlight: '#f59e0b',  // Citation gold
      gradient: {
        start: '#f3f4f6',    // Light start
        end: '#e5e7eb',      // Subtle end
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

  const adjustedPointCount = useMemo(() => {
    const complexityMultipliers = {
      beginner: 0.6,
      intermediate: 1.0,
      advanced: 1.4,
      expert: 1.8,
      research: 2.2
    };
    
    const performanceMultipliers = {
      battery: 0.7,
      balanced: 1.0,
      performance: 1.5
    };
    
    return Math.floor(
      pointCount * 
      complexityMultipliers[complexity] * 
      performanceMultipliers[performance]
    );
  }, [pointCount, complexity, performance]);

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

    const startTime = performance.now();

    try {
      // Generate Voronoi diagram
      const bounds = {
        x: 0,
        y: 0,
        width: displayWidth,
        height: displayHeight
      };

      const generatedCells = VoronoiGenerator.generateDiagram(
        bounds,
        adjustedPointCount,
        seedPattern,
        complexity
      );

      setCells(generatedCells);

      // Clear canvas
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // Render Voronoi cells
      renderVoronoiCells(ctx, generatedCells, currentColorScheme, {
        showPoints,
        showEdges,
        colorMode,
        hoveredCell,
        growthProgress,
        interactive
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Update performance metrics
      const metrics: PatternPerformanceMetrics = {
        renderTime,
        frameRate: 1000 / renderTime,
        patternComplexity: calculateComplexityScore(generatedCells),
        elementCount: generatedCells.length,
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
      console.error('Error generating Voronoi pattern:', error);
    }
  }, [
    canvasRef,
    containerRef,
    adjustedPointCount,
    seedPattern,
    complexity,
    currentColorScheme,
    showPoints,
    showEdges,
    colorMode,
    hoveredCell,
    growthProgress,
    interactive,
    isLoaded,
    onPatternComplete,
    onPerformanceUpdate
  ]);

  // ==========================================
  // Voronoi Cell Rendering Function
  // ==========================================
  
  const renderVoronoiCells = useCallback((
    ctx: CanvasRenderingContext2D,
    cellsToRender: VoronoiCell[],
    colors: typeof currentColorScheme,
    options: {
      showPoints: boolean;
      showEdges: boolean;
      colorMode: string;
      hoveredCell: string | null;
      growthProgress: number;
      interactive: boolean;
    }
  ) => {
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    
    cellsToRender.forEach((cell, index) => {
      const { vertices, site, area, id } = cell;
      
      if (vertices.length < 3) return; // Skip invalid cells
      
      // Calculate colors based on mode and cell properties
      let fillColor = colors.primary;
      let strokeColor = colors.stroke;
      let alpha = 0.6;
      
      switch (options.colorMode) {
        case 'gradient':
          // Create radial gradient based on distance from center
          const centerX = ctx.canvas.width / (2 * window.devicePixelRatio);
          const centerY = ctx.canvas.height / (2 * window.devicePixelRatio);
          const distance = Math.sqrt(
            Math.pow(site[0] - centerX, 2) + Math.pow(site[1] - centerY, 2)
          );
          const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
          const t = distance / maxDistance;
          
          fillColor = PatternUtils.interpolateColor(
            colors.gradient?.start || colors.primary,
            colors.gradient?.end || colors.secondary,
            t,
            'golden'
          );
          break;
          
        case 'categorical':
          // Use different colors for different cells
          const colorIndex = index % 3;
          fillColor = [colors.primary, colors.secondary, colors.accent][colorIndex];
          break;
          
        case 'distance':
          // Color based on area size
          const maxArea = Math.max(...cellsToRender.map(c => c.area));
          const areaRatio = area / maxArea;
          fillColor = PatternUtils.interpolateColor(
            colors.accent,
            colors.primary,
            areaRatio,
            'fibonacci'
          );
          break;
          
        case 'mathematical':
          // Use mathematical function for coloring
          const mathValue = Math.sin(index / phi) * 0.5 + 0.5;
          fillColor = PatternUtils.interpolateColor(
            colors.primary,
            colors.secondary,
            mathValue,
            'golden'
          );
          break;
      }
      
      // Highlight hovered cell
      const isHovered = options.interactive && options.hoveredCell === id;
      if (isHovered) {
        alpha = 0.8;
        strokeColor = colors.highlight;
      }
      
      // Apply growth animation
      let currentVertices = vertices;
      if (animateGrowth && options.growthProgress < 1) {
        const centroid = cell.centroid;
        currentVertices = vertices.map(vertex => [
          centroid[0] + (vertex[0] - centroid[0]) * options.growthProgress,
          centroid[1] + (vertex[1] - centroid[1]) * options.growthProgress
        ]);
      }

      // Render cell fill
      ctx.save();
      
      ctx.beginPath();
      ctx.moveTo(currentVertices[0][0], currentVertices[0][1]);
      
      for (let i = 1; i < currentVertices.length; i++) {
        ctx.lineTo(currentVertices[i][0], currentVertices[i][1]);
      }
      
      ctx.closePath();

      // Fill with color
      ctx.fillStyle = fillColor;
      ctx.globalAlpha = alpha;
      ctx.fill();

      // Draw edges if enabled
      if (options.showEdges) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.stroke();
      }

      ctx.restore();
    });
    
    // Draw site points if enabled
    if (options.showPoints) {
      cellsToRender.forEach((cell) => {
        const { site, id } = cell;
        const isHovered = options.interactive && options.hoveredCell === id;
        
        ctx.save();
        
        ctx.beginPath();
        ctx.arc(site[0], site[1], isHovered ? 6 : 4, 0, 2 * Math.PI);
        
        ctx.fillStyle = colors.accent;
        ctx.globalAlpha = 0.8;
        ctx.fill();
        
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
      });
    }
  }, [animateGrowth]);

  // ==========================================
  // Animation Management
  // ==========================================
  
  const startGrowthAnimation = useCallback(() => {
    if (!animateGrowth) return;
    
    setGrowthProgress(0);
    setIsAnimating(true);
    
    const animationDuration = 2000; // 2 seconds
    const startTime = Date.now();
    
    const animateFrame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      // Use golden ratio easing
      const phi = (1 + Math.sqrt(5)) / 2;
      const easedProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      setGrowthProgress(easedProgress);
      generatePattern();
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateFrame);
      } else {
        setIsAnimating(false);
        setGrowthProgress(1);
      }
    };
    
    animationRef.current = requestAnimationFrame(animateFrame);
  }, [animateGrowth, generatePattern]);

  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
  }, []);

  // ==========================================
  // Interactive Hover Handling
  // ==========================================
  
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !canvasRef.current || cells.length === 0) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find the cell containing the mouse position
    let hoveredCellId: string | null = null;
    
    for (const cell of cells) {
      if (isPointInPolygon([x, y], cell.vertices)) {
        hoveredCellId = cell.id;
        break;
      }
    }
    
    if (hoveredCellId !== hoveredCell) {
      setHoveredCell(hoveredCellId);
    }
  }, [interactive, cells, hoveredCell]);

  const handleMouseLeave = useCallback(() => {
    if (hoveredCell) {
      setHoveredCell(null);
    }
  }, [hoveredCell]);

  // ==========================================
  // Effects
  // ==========================================
  
  useEffect(() => {
    generatePattern();
  }, [generatePattern]);

  useEffect(() => {
    if (animate && animateGrowth) {
      startGrowthAnimation();
    } else if (!animate) {
      stopAnimation();
    }
    
    return () => stopAnimation();
  }, [animate, animateGrowth, startGrowthAnimation, stopAnimation]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(generatePattern, 100); // Debounce resize
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [generatePattern]);

  // Regenerate pattern when hoveredCell changes
  useEffect(() => {
    if (interactive) {
      generatePattern();
    }
  }, [hoveredCell, interactive, generatePattern]);

  // ==========================================
  // Component Classes
  // ==========================================
  
  const containerClasses = classNames(
    'relative w-full overflow-hidden',
    'transition-golden duration-300',
    {
      'cursor-pointer': interactive,
    },
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
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
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
                Generating Voronoi diagram...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Overlay */}
      {performanceMetrics && process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs p-2 rounded font-mono">
          <div>Render: {performanceMetrics.renderTime.toFixed(1)}ms</div>
          <div>Cells: {performanceMetrics.elementCount}</div>
        </div>
      )}

      {/* Cell Info Tooltip */}
      {interactive && hoveredCell && (
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-lg">
          <div className="text-sm">
            <div className="font-semibold text-gray-800">Cell {hoveredCell}</div>
            {cells.find(c => c.id === hoveredCell) && (
              <div className="mt-1 text-gray-600">
                <div>Area: {cells.find(c => c.id === hoveredCell)?.area.toFixed(0)} px²</div>
                <div>Neighbors: {cells.find(c => c.id === hoveredCell)?.neighbors.length || 0}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// Helper Functions
// ==========================================

function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

function calculateComplexityScore(cells: VoronoiCell[]): number {
  if (cells.length === 0) return 0;
  
  const avgVertices = cells.reduce((sum, cell) => sum + cell.vertices.length, 0) / cells.length;
  const densityScore = Math.min(cells.length / 100, 1);
  const geometryScore = Math.min(avgVertices / 8, 1);
  
  return (densityScore + geometryScore) / 2;
}

export default VoronoiDivider;