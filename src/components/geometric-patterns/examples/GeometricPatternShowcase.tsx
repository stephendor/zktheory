/**
 * Geometric Pattern Showcase
 * 
 * Comprehensive demonstration of all geometric pattern components with
 * interactive controls and triple-audience examples.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';

import PenroseBackground from '../components/PenroseBackground';
import VoronoiDivider from '../components/VoronoiDivider';
import HexGrid from '../components/HexGrid';
import AlgebraicCurve from '../components/AlgebraicCurve';

import { useComplexityLevel } from '../hooks/useComplexityLevel';
import { usePatternAnimation } from '../hooks/usePatternAnimation';

import { 
  ComplexityLevel, 
  AudienceType, 
  PerformanceLevel,
  CurveType,
  PatternPerformanceMetrics 
} from '../types/patterns';

// ==========================================
// Component Interface
// ==========================================

interface GeometricPatternShowcaseProps {
  className?: string;
  initialComplexity?: ComplexityLevel;
  initialAudience?: AudienceType;
  initialPerformance?: PerformanceLevel;
  showControls?: boolean;
  autoRotate?: boolean;
}

interface PatternDemo {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<any>;
  props: any;
  audience: AudienceType[];
  complexity: ComplexityLevel[];
}

// ==========================================
// Pattern Demonstrations
// ==========================================

const PATTERN_DEMOS: PatternDemo[] = [
  {
    id: 'penrose-business',
    name: 'Penrose Tiling - Business',
    description: 'Non-repeating patterns symbolizing unique value propositions and trust-building mathematical precision.',
    component: PenroseBackground,
    props: {
      colorScheme: 'mathematical',
      showDeflation: true,
      interactiveZoom: true,
      animate: true,
      goldenRatio: true,
      exportable: true
    },
    audience: ['business'],
    complexity: ['intermediate', 'advanced']
  },
  {
    id: 'voronoi-trust',
    name: 'Voronoi Dividers - Trust Network',
    description: 'Spatial partitioning representing distributed trust and interconnected relationships in business ecosystems.',
    component: VoronoiDivider,
    props: {
      pointCount: 25,
      seedPattern: 'fibonacci',
      colorMode: 'gradient',
      showPoints: true,
      interactive: true,
      animateGrowth: true
    },
    audience: ['business', 'technical'],
    complexity: ['intermediate', 'advanced']
  },
  {
    id: 'hex-circuit',
    name: 'Hex Grid - Circuit Design',
    description: 'Technical hexagonal layouts with circuit-inspired aesthetics for implementation flows and system architecture.',
    component: HexGrid,
    props: {
      pattern: 'circuit',
      highlightPaths: true,
      interactiveHover: true,
      circuitAnimation: true,
      dataFlow: true
    },
    audience: ['technical'],
    complexity: ['advanced', 'expert']
  },
  {
    id: 'curve-academic',
    name: 'Algebraic Curves - Mathematical Elegance',
    description: 'Parametric mathematical curves showcasing theorem aesthetics and research-grade mathematical beauty.',
    component: AlgebraicCurve,
    props: {
      curveType: 'lemniscate' as CurveType,
      showGrid: true,
      showEquation: true,
      animateTrace: true,
      strokeWidth: 3
    },
    audience: ['academic'],
    complexity: ['advanced', 'expert', 'research']
  }
];

// ==========================================
// Main Component
// ==========================================

export const GeometricPatternShowcase: React.FC<GeometricPatternShowcaseProps> = ({
  className,
  initialComplexity = 'intermediate',
  initialAudience = 'business',
  initialPerformance = 'balanced',
  showControls = true,
  autoRotate = false
}) => {
  // ==========================================
  // State Management
  // ==========================================

  const [selectedPattern, setSelectedPattern] = useState(0);
  const [audience, setAudience] = useState<AudienceType>(initialAudience);
  const [performance, setPerformance] = useState<PerformanceLevel>(initialPerformance);
  const [performanceMetrics, setPerformanceMetrics] = useState<PatternPerformanceMetrics | null>(null);
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);

  const complexityHook = useComplexityLevel(initialComplexity);
  const rotationAnimation = usePatternAnimation({
    duration: 8000,
    repeat: true,
    easing: 'golden'
  });

  // ==========================================
  // Filtered Patterns
  // ==========================================

  const availablePatterns = PATTERN_DEMOS.filter(pattern => 
    pattern.audience.includes(audience) &&
    pattern.complexity.includes(complexityHook.currentLevel)
  );

  const currentPattern = availablePatterns[selectedPattern] || availablePatterns[0];

  // ==========================================
  // Event Handlers
  // ==========================================

  const handlePatternChange = useCallback((index: number) => {
    setSelectedPattern(index);
  }, []);

  const handlePerformanceUpdate = useCallback((metrics: PatternPerformanceMetrics) => {
    setPerformanceMetrics(metrics);
  }, []);

  const handleAudienceChange = useCallback((newAudience: AudienceType) => {
    setAudience(newAudience);
    setSelectedPattern(0); // Reset to first available pattern
  }, []);

  // ==========================================
  // Auto-rotation Effect
  // ==========================================

  React.useEffect(() => {
    if (autoRotate && availablePatterns.length > 1) {
      rotationAnimation.play();
      
      const interval = setInterval(() => {
        setSelectedPattern(prev => (prev + 1) % availablePatterns.length);
      }, 5000);
      
      return () => clearInterval(interval);
    }
    
    return () => {}; // Empty cleanup for when condition is not met
  }, [autoRotate, availablePatterns.length, rotationAnimation]);

  // ==========================================
  // Component Classes
  // ==========================================

  const containerClasses = classNames(
    'relative w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100',
    'transition-golden duration-500',
    className
  );

  const patternContainerClasses = classNames(
    'relative w-full',
    'transition-golden duration-500',
    {
      'h-96': showControls,
      'h-screen': !showControls
    }
  );

  // ==========================================
  // Render Pattern Component
  // ==========================================

  const renderCurrentPattern = () => {
    if (!currentPattern) return null;

    const PatternComponent = currentPattern.component;
    
    return (
      <PatternComponent
        {...currentPattern.props}
        complexity={complexityHook.currentLevel}
        audience={audience}
        performance={performance}
        onPerformanceUpdate={handlePerformanceUpdate}
        className="w-full h-full"
      />
    );
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className={containerClasses}>
      {/* Pattern Display Area */}
      <div className={patternContainerClasses}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedPattern}-${audience}-${complexityHook.currentLevel}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: [0.618, 0, 0.382, 1] }}
            className="w-full h-full"
          >
            {renderCurrentPattern()}
          </motion.div>
        </AnimatePresence>

        {/* Pattern Info Overlay */}
        {currentPattern && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {currentPattern.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {currentPattern.description}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-math-primary/10 text-math-primary rounded">
                {complexityHook.getLevelIcon()} {complexityHook.currentLevel}
              </span>
              <span className="px-2 py-1 bg-math-secondary/10 text-math-secondary rounded">
                {audience}
              </span>
              <span className="px-2 py-1 bg-math-accent/10 text-math-accent rounded">
                {performance}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      {showControls && (
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Pattern Selection */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  Pattern Selection
                </h4>
                <div className="space-y-2">
                  {availablePatterns.map((pattern, index) => (
                    <button
                      key={pattern.id}
                      type="button"
                      onClick={() => handlePatternChange(index)}
                      className={classNames(
                        'w-full text-left p-3 rounded-lg text-sm transition-colors',
                        {
                          'bg-math-primary text-white': index === selectedPattern,
                          'bg-gray-50 text-gray-700 hover:bg-gray-100': index !== selectedPattern
                        }
                      )}
                    >
                      {pattern.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audience & Complexity */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  Configuration
                </h4>
                <div className="space-y-4">
                  {/* Audience Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Target Audience
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['business', 'technical', 'academic'] as AudienceType[]).map(aud => (
                        <button
                          key={aud}
                          type="button"
                          onClick={() => handleAudienceChange(aud)}
                          className={classNames(
                            'px-3 py-2 text-xs rounded transition-colors',
                            {
                              'bg-math-primary text-white': audience === aud,
                              'bg-gray-100 text-gray-700 hover:bg-gray-200': audience !== aud
                            }
                          )}
                        >
                          {aud}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Complexity Level */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Complexity Level
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={complexityHook.decreaseLevel}
                        disabled={!complexityHook.canDecrease}
                        className="p-2 text-gray-600 hover:text-math-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-lg">{complexityHook.getLevelIcon()}</div>
                        <div className="text-xs text-gray-600">{complexityHook.currentLevel}</div>
                      </div>
                      <button
                        type="button"
                        onClick={complexityHook.increaseLevel}
                        disabled={!complexityHook.canIncrease}
                        className="p-2 text-gray-600 hover:text-math-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Performance Level */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Performance
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['battery', 'balanced', 'performance'] as PerformanceLevel[]).map(perf => (
                        <button
                          key={perf}
                          type="button"
                          onClick={() => setPerformance(perf)}
                          className={classNames(
                            'px-3 py-2 text-xs rounded transition-colors',
                            {
                              'bg-math-accent text-white': performance === perf,
                              'bg-gray-100 text-gray-700 hover:bg-gray-200': performance !== perf
                            }
                          )}
                        >
                          {perf}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-800">
                    Performance
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowPerformancePanel(!showPerformancePanel)}
                    className="text-xs text-math-primary hover:text-math-primary/80"
                  >
                    {showPerformancePanel ? 'Hide' : 'Show'} Details
                  </button>
                </div>

                {performanceMetrics && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-600">Render Time</div>
                        <div className="font-semibold">
                          {performanceMetrics.renderTime.toFixed(1)}ms
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-600">Frame Rate</div>
                        <div className="font-semibold">
                          {performanceMetrics.frameRate.toFixed(0)} FPS
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-600">Elements</div>
                        <div className="font-semibold">
                          {performanceMetrics.elementCount.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-600">Complexity</div>
                        <div className="font-semibold">
                          {performanceMetrics.patternComplexity.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {showPerformancePanel && (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-600 mb-2">Performance Timeline</div>
                        <div className="h-16 bg-gray-50 rounded flex items-end p-2">
                          {/* Simplified performance chart */}
                          <div 
                            className="bg-math-primary rounded-sm"
                            style={{ 
                              width: '4px', 
                              height: `${Math.min(performanceMetrics.frameRate / 60 * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!performanceMetrics && (
                  <div className="text-sm text-gray-500 italic">
                    Performance metrics will appear when patterns are rendered.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeometricPatternShowcase;