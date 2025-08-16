/**
 * Hex Grid Component
 * 
 * Interactive hexagonal grid layouts echoing circuit designs for technical audience
 * and honeycomb patterns for mathematical elegance. Supports data flow animations.
 */

'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { HexGridPatternProps, HexagonTile, AudienceColorSchemes, PatternPerformanceMetrics } from '../types/patterns';
import { HexGridGenerator, PatternUtils } from '../core/PatternGenerator';

// ==========================================
// Component Implementation
// ==========================================

export const HexGrid: React.FC<HexGridPatternProps> = ({
  className,
  style,
  animate = true,
  complexity = 'intermediate',
  audience = 'technical',
  performance = 'balanced',
  hexSize = 30,
  spacing = 2,
  layers = 5,
  pattern = 'circuit',
  highlightPaths = true,
  interactiveHover = true,
  circuitAnimation = true,
  dataFlow = false,
  onPatternComplete,
  onPerformanceUpdate,
}) => {
  // ==========================================
  // State Management
  // ==========================================
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hexagons, setHexagons] = useState<HexagonTile[]>([]);
  const [hoveredHex, setHoveredHex] = useState<string | null>(null);
  const [activePaths, setActivePaths] = useState<Set<string>>(new Set());
  const [flowProgress, setFlowProgress] = useState(0);
  const [performanceMetrics, setPerformanceMetrics] = useState<PatternPerformanceMetrics | null>(null);

  // ==========================================
  // Color Schemes for Triple Audience
  // ==========================================
  
  const colorSchemes: AudienceColorSchemes = useMemo(() => ({
    business: {
      primary: '#2563eb',    // Professional blue
      secondary: '#f59e0b',  // Success gold
      accent: '#10b981',     // Growth green
      background: '#f8fafc', // Clean background
      stroke: '#e2e8f0',     // Subtle borders
      highlight: '#fbbf24',  // Active highlight
      gradient: {
        start: '#dbeafe',
        end: '#ecfdf5',
        direction: 120
      }
    },
    technical: {
      primary: '#0f172a',    // Dark circuit base
      secondary: '#06b6d4',  // Cyan data flow
      accent: '#8b5cf6',     // Purple system
      background: '#020617', // Deep tech dark
      stroke: '#334155',     // Circuit lines
      highlight: '#06ffa5',  // Bright green active
      gradient: {
        start: '#0f172a',
        end: '#1e293b',
        direction: 45
      }
    },
    academic: {
      primary: '#7c3aed',    // Academic purple
      secondary: '#059669',  // Research green
      accent: '#dc2626',     // Important red
      background: '#fefbff', // Paper white
      stroke: '#d1d5db',     // Scholarly lines
      highlight: '#f59e0b',  // Citation gold
      gradient: {
        start: '#f3f4f6',
        end: '#e5e7eb',
        direction: 90
      }
    }
  }), []);

  // ==========================================
  // Derived Values
  // ==========================================
  
  const currentColorScheme = useMemo(() => {
    return colorSchemes[audience] || colorSchemes.technical;
  }, [colorSchemes, audience]);

  const adjustedHexSize = useMemo(() => {
    const complexityMultipliers = {
      beginner: 1.3,
      intermediate: 1.0,
      advanced: 0.8,
      expert: 0.65,
      research: 0.5
    };
    
    const performanceMultipliers = {
      battery: 1.2,
      balanced: 1.0,
      performance: 0.8
    };
    
    return hexSize * complexityMultipliers[complexity] * performanceMultipliers[performance];
  }, [hexSize, complexity, performance]);

  const maxLayers = useMemo(() => {
    const complexityLimits = {
      beginner: 3,
      intermediate: 5,
      advanced: 8,
      expert: 12,
      research: 16
    };
    return Math.min(layers, complexityLimits[complexity]);
  }, [layers, complexity]);

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

    const startTime = globalThis.performance.now();

    try {
      // Generate hexagonal grid
      const bounds = {
        x: 0,
        y: 0,
        width: displayWidth,
        height: displayHeight
      };

      // Map pattern to supported generator patterns
      const generatorPattern = pattern === 'mathematical' ? 'honeycomb' : pattern;
      
      const generatedHexagons = HexGridGenerator.generateGrid(
        bounds,
        adjustedHexSize,
        generatorPattern,
        complexity
      );

      setHexagons(generatedHexagons);

      // Clear canvas with background
      ctx.fillStyle = currentColorScheme.background;
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Render hexagonal grid
      renderHexGrid(ctx, generatedHexagons, currentColorScheme, {
        pattern,
        highlightPaths,
        circuitAnimation,
        dataFlow,
        hoveredHex,
        activePaths,
        flowProgress,
        isAnimating
      });

      const endTime = globalThis.performance.now();
      const renderTime = endTime - startTime;

      // Update performance metrics
      const metrics: PatternPerformanceMetrics = {
        renderTime,
        frameRate: 1000 / renderTime,
        patternComplexity: calculateComplexityScore(generatedHexagons),
        elementCount: generatedHexagons.length,
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
      console.error('Error generating hex grid pattern:', error);
    }
  }, [
    canvasRef,
    containerRef,
    adjustedHexSize,
    pattern,
    complexity,
    currentColorScheme,
    highlightPaths,
    circuitAnimation,
    dataFlow,
    hoveredHex,
    activePaths,
    flowProgress,
    isAnimating,
    isLoaded,
    onPatternComplete,
    onPerformanceUpdate
  ]);

  // ==========================================
  // Hex Grid Rendering Function
  // ==========================================
  
  const renderHexGrid = useCallback((
    ctx: CanvasRenderingContext2D,
    hexagonsToRender: HexagonTile[],
    colors: typeof currentColorScheme,
    options: {
      pattern: string;
      highlightPaths: boolean;
      circuitAnimation: boolean;
      dataFlow: boolean;
      hoveredHex: string | null;
      activePaths: Set<string>;
      flowProgress: number;
      isAnimating: boolean;
    }
  ) => {
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    const currentTime = Date.now() * 0.001; // Convert to seconds
    
    // Render hexagons
    hexagonsToRender.forEach((hex, index) => {
      const { center, vertices, layer, active, id } = hex;
      
      if (vertices.length !== 6) return; // Skip invalid hexagons
      
      const isHovered = options.hoveredHex === id;
      const isInActivePath = options.activePaths.has(id);
      
      // Calculate colors and styles based on pattern and state
      let fillColor = colors.background;
      let strokeColor = colors.stroke;
      let strokeWidth = 1;
      let alpha = 1;
      let glowEffect = false;
      
      switch (options.pattern) {
        case 'circuit':
          if (active) {
            fillColor = colors.primary;
            strokeColor = colors.secondary;
            alpha = 0.8;
            
            if (options.circuitAnimation && options.isAnimating) {
              const pulsePhase = (currentTime + index * 0.1) % 2;
              alpha = 0.6 + Math.sin(pulsePhase * Math.PI) * 0.3;
              glowEffect = pulsePhase < 1;
            }
          } else {
            fillColor = 'transparent';
            strokeColor = colors.stroke;
            alpha = 0.3;
          }
          break;
          
        case 'honeycomb':
          fillColor = layer % 2 === 0 ? colors.primary : colors.secondary;
          strokeColor = colors.accent;
          alpha = 0.4 + (maxLayers - layer) / maxLayers * 0.4;
          break;
          
        case 'mathematical':
          // Use mathematical function for coloring
          const mathValue = Math.sin(layer / phi + index * 0.1) * 0.5 + 0.5;
          fillColor = PatternUtils.interpolateColor(
            colors.primary,
            colors.secondary,
            mathValue,
            'golden'
          );
          alpha = 0.6;
          break;
          
        default:
          fillColor = colors.primary;
          alpha = 0.5;
      }
      
      // Enhance hovered hexagon
      if (isHovered) {
        strokeColor = colors.highlight;
        strokeWidth = 3;
        alpha = Math.min(alpha + 0.3, 1);
        glowEffect = true;
      }
      
      // Enhance active path hexagons
      if (isInActivePath) {
        strokeColor = colors.accent;
        strokeWidth = 2;
        glowEffect = true;
      }
      
      // Data flow animation
      if (options.dataFlow && active) {
        const flowPhase = (options.flowProgress + index * 0.05) % 1;
        const flowIntensity = Math.sin(flowPhase * Math.PI * 2) * 0.5 + 0.5;
        
        fillColor = PatternUtils.interpolateColor(
          fillColor,
          colors.highlight,
          flowIntensity,
          'fibonacci'
        );
      }

      // Render hexagon
      ctx.save();
      
      // Apply glow effect if needed
      if (glowEffect) {
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      
      // Draw hexagon path
      ctx.beginPath();
      ctx.moveTo(vertices[0][0], vertices[0][1]);
      
      for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i][0], vertices[i][1]);
      }
      
      ctx.closePath();

      // Fill hexagon
      if (fillColor !== 'transparent') {
        ctx.fillStyle = fillColor;
        ctx.globalAlpha = alpha;
        ctx.fill();
      }

      // Stroke hexagon
      ctx.globalAlpha = 1;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
      
      ctx.restore();
      
      // Add center dot for circuit pattern
      if (options.pattern === 'circuit' && active) {
        ctx.save();
        
        ctx.beginPath();
        ctx.arc(center[0], center[1], 3, 0, 2 * Math.PI);
        
        ctx.fillStyle = colors.accent;
        ctx.globalAlpha = 0.8;
        ctx.fill();
        
        ctx.restore();
      }
    });
    
    // Render connections for circuit pattern
    if (options.pattern === 'circuit' && options.highlightPaths) {
      renderCircuitConnections(ctx, hexagonsToRender, colors, options);
    }
    
    // Render flow paths for data flow animation
    if (options.dataFlow) {
      renderDataFlowPaths(ctx, hexagonsToRender, colors, options);
    }
  }, [maxLayers]);

  // ==========================================
  // Circuit Connections Rendering
  // ==========================================
  
  const renderCircuitConnections = useCallback((
    ctx: CanvasRenderingContext2D,
    hexagonsToRender: HexagonTile[],
    colors: typeof currentColorScheme,
    options: any
  ) => {
    const activeHexagons = hexagonsToRender.filter(hex => hex.active);
    
    activeHexagons.forEach((hex, index) => {
      const { center } = hex;
      
      // Find nearby active hexagons to connect
      const nearbyHexagons = activeHexagons.filter(otherHex => {
        if (otherHex.id === hex.id) return false;
        
        const distance = Math.sqrt(
          Math.pow(otherHex.center[0] - center[0], 2) +
          Math.pow(otherHex.center[1] - center[1], 2)
        );
        
        return distance < adjustedHexSize * 2.5; // Connect nearby hexagons
      });
      
      // Draw connections
      nearbyHexagons.forEach(nearbyHex => {
        ctx.save();
        
        ctx.beginPath();
        ctx.moveTo(center[0], center[1]);
        ctx.lineTo(nearbyHex.center[0], nearbyHex.center[1]);
        
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        
        if (options.circuitAnimation && options.isAnimating) {
          const pulsePhase = (Date.now() * 0.002 + index * 0.1) % 1;
          ctx.globalAlpha = 0.2 + Math.sin(pulsePhase * Math.PI * 2) * 0.3;
        }
        
        ctx.stroke();
        ctx.restore();
      });
    });
  }, [adjustedHexSize]);

  // ==========================================
  // Data Flow Paths Rendering
  // ==========================================
  
  const renderDataFlowPaths = useCallback((
    ctx: CanvasRenderingContext2D,
    hexagonsToRender: HexagonTile[],
    colors: typeof currentColorScheme,
    options: any
  ) => {
    const activeHexagons = hexagonsToRender.filter(hex => hex.active);
    
    activeHexagons.forEach((hex, index) => {
      if (index === activeHexagons.length - 1) return; // Skip last hexagon
      
      const nextHex = activeHexagons[index + 1];
      const progress = (options.flowProgress + index * 0.1) % 1;
      
      if (progress < 0.8) { // Only show flow for 80% of the cycle
        const flowX = hex.center[0] + (nextHex.center[0] - hex.center[0]) * progress;
        const flowY = hex.center[1] + (nextHex.center[1] - hex.center[1]) * progress;
        
        ctx.save();
        
        // Flow particle
        ctx.beginPath();
        ctx.arc(flowX, flowY, 4, 0, 2 * Math.PI);
        
        ctx.fillStyle = colors.highlight;
        ctx.shadowColor = colors.highlight;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = 0.9;
        ctx.fill();
        
        ctx.restore();
      }
    });
  }, []);

  // ==========================================
  // Animation Management
  // ==========================================
  
  const startAnimation = useCallback(() => {
    if (!animate) return;
    
    setIsAnimating(true);
    
    const animateFrame = () => {
      if (dataFlow) {
        setFlowProgress(prev => (prev + 0.01) % 1);
      }
      
      generatePattern();
      animationRef.current = requestAnimationFrame(animateFrame);
    };
    
    animationRef.current = requestAnimationFrame(animateFrame);
  }, [animate, dataFlow, generatePattern]);

  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
  }, []);

  // ==========================================
  // Interactive Hover Handling
  // ==========================================
  
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactiveHover || !canvasRef.current || hexagons.length === 0) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find the hexagon containing the mouse position
    let hoveredHexId: string | null = null;
    
    for (const hex of hexagons) {
      if (isPointInHexagon([x, y], hex.vertices)) {
        hoveredHexId = hex.id;
        break;
      }
    }
    
    if (hoveredHexId !== hoveredHex) {
      setHoveredHex(hoveredHexId);
      
      // Update active paths for highlighting
      if (hoveredHexId && highlightPaths) {
        const newActivePaths = new Set<string>();
        const hoveredHexagon = hexagons.find(h => h.id === hoveredHexId);
        
        if (hoveredHexagon) {
          newActivePaths.add(hoveredHexId);
          
          // Add neighboring hexagons to active paths
          hexagons.forEach(hex => {
            const distance = Math.sqrt(
              Math.pow(hex.center[0] - hoveredHexagon.center[0], 2) +
              Math.pow(hex.center[1] - hoveredHexagon.center[1], 2)
            );
            
            if (distance < adjustedHexSize * 2.2) {
              newActivePaths.add(hex.id);
            }
          });
        }
        
        setActivePaths(newActivePaths);
      }
    }
  }, [interactiveHover, hexagons, hoveredHex, highlightPaths, adjustedHexSize]);

  const handleMouseLeave = useCallback(() => {
    if (hoveredHex) {
      setHoveredHex(null);
      setActivePaths(new Set());
    }
  }, [hoveredHex]);

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

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(generatePattern, 100); // Debounce resize
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [generatePattern]);

  // Regenerate pattern when hover state changes
  useEffect(() => {
    if (interactiveHover && !isAnimating) {
      generatePattern();
    }
  }, [hoveredHex, activePaths, interactiveHover, isAnimating, generatePattern]);

  // ==========================================
  // Component Classes
  // ==========================================
  
  const containerClasses = classNames(
    'relative w-full overflow-hidden',
    'transition-golden duration-300',
    {
      'cursor-pointer': interactiveHover,
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
                Generating hex grid...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Overlay */}
      {performanceMetrics && process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs p-2 rounded font-mono">
          <div>Render: {performanceMetrics.renderTime.toFixed(1)}ms</div>
          <div>Hexagons: {performanceMetrics.elementCount}</div>
          <div>FPS: {performanceMetrics.frameRate.toFixed(0)}</div>
        </div>
      )}

      {/* Hex Info Tooltip */}
      {interactiveHover && hoveredHex && (
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-lg">
          <div className="text-sm">
            <div className="font-semibold text-gray-800">Hex {hoveredHex}</div>
            {hexagons.find(h => h.id === hoveredHex) && (
              <div className="mt-1 text-gray-600">
                <div>Layer: {hexagons.find(h => h.id === hoveredHex)?.layer}</div>
                <div>Active: {hexagons.find(h => h.id === hoveredHex)?.active ? 'Yes' : 'No'}</div>
                <div>Connections: {activePaths.size - 1}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pattern Controls */}
      {(circuitAnimation || dataFlow) && (
        <div className="absolute bottom-2 right-2 flex gap-2">
          {circuitAnimation && (
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="px-3 py-1 bg-math-primary text-white rounded text-sm hover:bg-math-primary/90 transition-colors"
            >
              {isAnimating ? 'Pause' : 'Animate'}
            </button>
          )}
          {dataFlow && (
            <button
              onClick={() => setFlowProgress(0)}
              className="px-3 py-1 bg-math-secondary text-white rounded text-sm hover:bg-math-secondary/90 transition-colors"
            >
              Reset Flow
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// Helper Functions
// ==========================================

function isPointInHexagon(point: [number, number], hexVertices: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;
  
  for (let i = 0, j = hexVertices.length - 1; i < hexVertices.length; j = i++) {
    const [xi, yi] = hexVertices[i];
    const [xj, yj] = hexVertices[j];
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

function calculateComplexityScore(hexagons: HexagonTile[]): number {
  if (hexagons.length === 0) return 0;
  
  const activeCount = hexagons.filter(hex => hex.active).length;
  const maxLayer = Math.max(...hexagons.map(hex => hex.layer));
  
  const densityScore = Math.min(hexagons.length / 200, 1);
  const activeScore = activeCount / hexagons.length;
  const layerScore = Math.min(maxLayer / 10, 1);
  
  return (densityScore + activeScore + layerScore) / 3;
}

export default HexGrid;