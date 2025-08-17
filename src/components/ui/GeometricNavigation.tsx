/**
 * Geometric Navigation System
 * Pattern-based section identifiers with smooth transitions
 * Uses Penrose, Voronoi, HexGrid, and Algebraic curves for mathematical precision
 */

'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

// ==========================================
// Constants & Mathematical Patterns
// ==========================================

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2; // φ ≈ 1.618
const FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

// Pattern definitions with mathematical precision
const GEOMETRIC_PATTERNS = {
  penrose: {
    name: 'Penrose Tiling',
    equation: 'τ = (1+√5)/2',
    complexity: 4,
    angles: [36, 72, 108, 144],
    symmetry: 5,
    generator: (size: number) => {
      const angles = [0, 72, 144, 216, 288].map(a => a * Math.PI / 180);
      return angles.map(angle => ({
        x: Math.cos(angle) * size,
        y: Math.sin(angle) * size
      }));
    }
  },
  voronoi: {
    name: 'Voronoi Diagram',
    equation: 'd(p,qi) ≤ d(p,qj)',
    complexity: 3,
    angles: [120, 240, 360],
    symmetry: 6,
    generator: (size: number) => {
      const points: Array<{ x: number; y: number }> = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * 2 * Math.PI;
        points.push({
          x: Math.cos(angle) * size,
          y: Math.sin(angle) * size
        });
      }
      return points;
    }
  },
  hexgrid: {
    name: 'Hexagonal Grid',
    equation: 'hex(q,r,s) = q+r+s=0',
    complexity: 2,
    angles: [60, 120, 180, 240, 300, 360],
    symmetry: 6,
    generator: (size: number) => {
      const points: Array<{ x: number; y: number }> = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * 2 * Math.PI;
        points.push({
          x: Math.cos(angle) * size,
          y: Math.sin(angle) * size
        });
      }
      return points;
    }
  },
  algebraic: {
    name: 'Algebraic Curve',
    equation: 'f(x,y) = x³ + y³ - 3xy',
    complexity: 5,
    angles: [0, 45, 90, 135, 180, 225, 270, 315],
    symmetry: 8,
    generator: (size: number) => {
      const points: Array<{ x: number; y: number }> = [];
      for (let t = 0; t < 2 * Math.PI; t += Math.PI / 16) {
        points.push({
          x: Math.cos(t) * size * (1 + 0.3 * Math.cos(3 * t)),
          y: Math.sin(t) * size * (1 + 0.3 * Math.sin(3 * t))
        });
      }
      return points;
    }
  }
} as const;

// Navigation sections with geometric patterns
const NAVIGATION_SECTIONS = [
  {
    id: 'home',
    title: 'Home',
    pattern: 'penrose',
    description: 'Mathematical computing platform overview',
    path: '/',
    audience: 'universal',
    complexity: 1,
    color: '#3b82f6', // blue-500
    accent: '#1d4ed8' // blue-700
  },
  {
    id: 'foundations',
    title: 'Foundations',
    pattern: 'hexgrid',
    description: 'Core mathematical principles and building blocks',
    path: '/foundations',
    audience: 'all',
    complexity: 2,
    color: '#10b981', // emerald-500
    accent: '#047857' // emerald-700
  },
  {
    id: 'applications',
    title: 'Applications',
    pattern: 'voronoi',
    description: 'Real-world implementations and use cases',
    path: '/applications',
    audience: 'business-technical',
    complexity: 3,
    color: '#f59e0b', // amber-500
    accent: '#d97706' // amber-600
  },
  {
    id: 'research',
    title: 'Research',
    pattern: 'algebraic',
    description: 'Cutting-edge developments and academic papers',
    path: '/research',
    audience: 'academic',
    complexity: 4,
    color: '#8b5cf6', // violet-500
    accent: '#7c3aed' // violet-600
  },
  {
    id: 'playground',
    title: 'Playground',
    pattern: 'penrose',
    description: 'Interactive tools and experimentation space',
    path: '/playground',
    audience: 'technical',
    complexity: 3,
    color: '#ef4444', // red-500
    accent: '#dc2626' // red-600
  }
] as const;

// ==========================================
// Types
// ==========================================

interface NavigationSection {
  id: string;
  title: string;
  pattern: keyof typeof GEOMETRIC_PATTERNS;
  description: string;
  path: string;
  audience: string;
  complexity: number;
  color: string;
  accent: string;
}

interface GeometricNavigationProps {
  currentSection?: string;
  onSectionChange?: (section: NavigationSection) => void;
  showBreadcrumbs?: boolean;
  showPatternInfo?: boolean;
  enableTransitions?: boolean;
  layout?: 'horizontal' | 'vertical' | 'grid' | 'radial';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface PatternSVGProps {
  pattern: keyof typeof GEOMETRIC_PATTERNS;
  size: number;
  color: string;
  accent: string;
  isActive?: boolean;
  isHovered?: boolean;
  animationPhase?: number;
}

// ==========================================
// Pattern Generators
// ==========================================

const PatternSVG: React.FC<PatternSVGProps> = ({
  pattern,
  size,
  color,
  accent,
  isActive = false,
  isHovered = false,
  animationPhase = 0
}) => {
  const patternDef = GEOMETRIC_PATTERNS[pattern];
  const points = patternDef.generator(size * 0.4);
  const center = size / 2;
  
  const strokeWidth = isActive ? 3 : isHovered ? 2 : 1.5;
  const opacity = isActive ? 1 : isHovered ? 0.8 : 0.6;
  
  switch (pattern) {
    case 'penrose':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <radialGradient id={`penrose-${color}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.3" />
            </radialGradient>
          </defs>
          
          {/* Golden ratio spiral */}
          <g transform={`translate(${center}, ${center}) rotate(${animationPhase * 10})`}>
            {points.map((point, index) => (
              <motion.polygon
                key={index}
                points={`0,0 ${point.x},${point.y} ${points[(index + 1) % points.length].x},${points[(index + 1) % points.length].y}`}
                fill={`url(#penrose-${color})`}
                stroke={color}
                strokeWidth={strokeWidth}
                opacity={opacity}
                initial={{ scale: 0, rotate: 0 }}
                animate={{ 
                  scale: 1, 
                  rotate: animationPhase * (index + 1) * 2,
                  opacity: opacity + Math.sin(animationPhase + index) * 0.2
                }}
                transition={{ 
                  duration: 2,
                  delay: index * 0.1,
                  ease: [0.618, 0, 0.382, 1]
                }}
              />
            ))}
          </g>
        </svg>
      );
      
    case 'voronoi':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <pattern id={`voronoi-${color}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="2" fill={color} opacity="0.3" />
            </pattern>
          </defs>
          
          <g transform={`translate(${center}, ${center})`}>
            {points.map((point, index) => (
              <motion.circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={8 + Math.sin(animationPhase + index) * 3}
                fill={`url(#voronoi-${color})`}
                stroke={color}
                strokeWidth={strokeWidth}
                opacity={opacity}
                initial={{ r: 0 }}
                animate={{ 
                  r: 8 + Math.sin(animationPhase + index) * 3,
                  opacity: opacity
                }}
                transition={{ 
                  duration: 1.5,
                  delay: index * 0.15,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              />
            ))}
            
            {/* Connecting lines */}
            {points.map((point, index) => (
              <motion.line
                key={`line-${index}`}
                x1={0}
                y1={0}
                x2={point.x}
                y2={point.y}
                stroke={accent}
                strokeWidth={strokeWidth * 0.5}
                opacity={opacity * 0.5}
                strokeDasharray={`${animationPhase % 10} 5`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: index * 0.1 }}
              />
            ))}
          </g>
        </svg>
      );
      
    case 'hexgrid':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <g transform={`translate(${center}, ${center})`}>
            <motion.polygon
              points={points.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={opacity}
              initial={{ pathLength: 0, rotate: 0 }}
              animate={{ 
                pathLength: 1, 
                rotate: animationPhase * 5,
                strokeWidth: strokeWidth + Math.sin(animationPhase) * 0.5
              }}
              transition={{ 
                duration: 3,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            />
            
            {/* Inner hexagons */}
            {[0.6, 0.3].map((scale, scaleIndex) => (
              <motion.polygon
                key={scaleIndex}
                points={points.map(p => `${p.x * scale},${p.y * scale}`).join(' ')}
                fill="none"
                stroke={accent}
                strokeWidth={strokeWidth * 0.7}
                opacity={opacity * 0.7}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: 1,
                  rotate: -animationPhase * (scaleIndex + 1) * 3
                }}
                transition={{ 
                  duration: 2 + scaleIndex,
                  delay: scaleIndex * 0.3,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              />
            ))}
          </g>
        </svg>
      );
      
    case 'algebraic':
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id={`algebraic-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={accent} />
            </linearGradient>
          </defs>
          
          <g transform={`translate(${center}, ${center})`}>
            <motion.path
              d={`M ${points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} Z`}
              fill={`url(#algebraic-${color})`}
              fillOpacity={0.3}
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={opacity}
              initial={{ pathLength: 0, scale: 0 }}
              animate={{ 
                pathLength: 1, 
                scale: 1,
                rotate: animationPhase * 2
              }}
              transition={{ 
                duration: 4,
                ease: [0.25, 0.1, 0.25, 1]
              }}
            />
          </g>
        </svg>
      );
      
    default:
      return <div>Unknown pattern</div>;
  }
};

// ==========================================
// Main Component
// ==========================================

export const GeometricNavigation: React.FC<GeometricNavigationProps> = ({
  currentSection = 'home',
  onSectionChange,
  showBreadcrumbs = true,
  showPatternInfo = true,
  enableTransitions = true,
  layout = 'horizontal',
  size = 'md',
  className = ''
}) => {
  const prefersReducedMotion = useReducedMotion();
  
  // ==========================================
  // State Management
  // ==========================================
  
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [breadcrumbPath, setBreadcrumbPath] = useState<NavigationSection[]>([]);
  
  // ==========================================
  // Animation Timer
  // ==========================================
  
  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      setAnimationPhase(prev => prev + 0.1);
    }, 100);
    
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  // ==========================================
  // Size Configuration
  // ==========================================
  
  const sizeConfig = useMemo(() => {
    const configs = {
      sm: { iconSize: 48, spacing: 12, fontSize: 'text-sm' },
      md: { iconSize: 64, spacing: 16, fontSize: 'text-base' },
      lg: { iconSize: 80, spacing: 24, fontSize: 'text-lg' }
    };
    return configs[size];
  }, [size]);

  // ==========================================
  // Layout Configuration
  // ==========================================
  
  const layoutClasses = useMemo(() => {
    const layouts = {
      horizontal: 'flex flex-row space-x-4 items-center',
      vertical: 'flex flex-col space-y-4 items-start',
      grid: 'grid grid-cols-3 gap-4',
      radial: 'relative w-64 h-64 mx-auto'
    };
    return layouts[layout];
  }, [layout]);

  // ==========================================
  // Event Handlers
  // ==========================================
  
  const handleSectionClick = useCallback((section: NavigationSection) => {
    // Update breadcrumb path
    setBreadcrumbPath(prev => {
      const newPath = [...prev, section];
      return newPath.slice(-3); // Keep last 3 for space
    });
    
    onSectionChange?.(section);
  }, [onSectionChange]);

  // ==========================================
  // Radial Layout Positioning
  // ==========================================
  
  const getRadialPosition = useCallback((index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = 100; // Distance from center
    return {
      left: `calc(50% + ${Math.cos(angle) * radius}px)`,
      top: `calc(50% + ${Math.sin(angle) * radius}px)`,
      transform: 'translate(-50%, -50%)'
    };
  }, []);

  // ==========================================
  // Render Functions
  // ==========================================
  
  const renderSectionItem = (section: NavigationSection, index: number) => {
    const isActive = currentSection === section.id;
    const isHovered = hoveredSection === section.id;
    const patternDef = GEOMETRIC_PATTERNS[section.pattern];
    
    const itemStyle = layout === 'radial' 
      ? getRadialPosition(index, NAVIGATION_SECTIONS.length)
      : {};
    
    return (
      <motion.div
        key={section.id}
        className={`relative cursor-pointer ${layout === 'radial' ? 'absolute' : ''}`}
        style={itemStyle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setHoveredSection(section.id)}
        onMouseLeave={() => setHoveredSection(null)}
        onClick={() => handleSectionClick(section)}
      >
        {/* Pattern Icon */}
        <div className="relative">
          <PatternSVG
            pattern={section.pattern}
            size={sizeConfig.iconSize}
            color={section.color}
            accent={section.accent}
            isActive={isActive}
            isHovered={isHovered}
            animationPhase={animationPhase}
          />
          
          {/* Active Indicator */}
          {isActive && (
            <motion.div
              className="absolute -inset-2 border-2 rounded-full"
              style={{ borderColor: section.accent }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>
        
        {/* Section Label */}
        <div className={`mt-2 text-center ${sizeConfig.fontSize}`}>
          <div className="font-semibold" style={{ color: section.color }}>
            {section.title}
          </div>
          
          {showPatternInfo && (
            <div className="text-xs text-gray-500 mt-1">
              {patternDef.name}
            </div>
          )}
        </div>
        
        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-48"
              style={{
                top: layout === 'radial' ? 'auto' : '100%',
                bottom: layout === 'radial' ? '100%' : 'auto',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: layout === 'radial' ? 0 : '0.5rem',
                marginBottom: layout === 'radial' ? '0.5rem' : 0
              }}
            >
              <h4 className="font-semibold text-gray-900 mb-1">{section.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{section.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Complexity: {section.complexity}/5</span>
                <span>{patternDef.equation}</span>
              </div>
              
              <div className="mt-2 text-xs text-gray-400">
                Audience: {section.audience}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderBreadcrumbs = () => {
    if (!showBreadcrumbs || breadcrumbPath.length === 0) return null;
    
    return (
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center space-x-2 text-sm text-gray-600"
        aria-label="Breadcrumb navigation"
      >
        <HomeIcon className="w-4 h-4" />
        {breadcrumbPath.map((section, index) => (
          <React.Fragment key={section.id}>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            <button
              className="hover:text-gray-900 transition-colors"
              style={{ color: section.color }}
              onClick={() => handleSectionClick(section)}
            >
              {section.title}
            </button>
          </React.Fragment>
        ))}
      </motion.nav>
    );
  };

  // ==========================================
  // Main Render
  // ==========================================
  
  return (
    <div className={`geometric-navigation ${className}`}>
      {renderBreadcrumbs()}
      
      <nav 
        className={layoutClasses}
        aria-label="Geometric section navigation"
        role="navigation"
      >
        {NAVIGATION_SECTIONS.map(renderSectionItem)}
      </nav>
      
      {/* Mathematical Info Panel */}
      {showPatternInfo && hoveredSection && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <h3 className="font-semibold text-gray-900 mb-2">Pattern Mathematics</h3>
          {(() => {
            const section = NAVIGATION_SECTIONS.find(s => s.id === hoveredSection);
            const pattern = section ? GEOMETRIC_PATTERNS[section.pattern] : null;
            
            if (!pattern) return null;
            
            return (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Equation:</span> {pattern.equation}
                </div>
                <div>
                  <span className="font-medium">Symmetry:</span> {pattern.symmetry}-fold
                </div>
                <div>
                  <span className="font-medium">Complexity:</span> {pattern.complexity}/5
                </div>
                <div>
                  <span className="font-medium">Key Angles:</span> {pattern.angles.join('°, ')}°
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
      
      {/* Accessibility Info */}
      <div className="sr-only">
        <p>
          Geometric navigation with {NAVIGATION_SECTIONS.length} sections. 
          Currently viewing: {NAVIGATION_SECTIONS.find(s => s.id === currentSection)?.title || 'Unknown'}. 
          Use arrow keys to navigate between sections.
        </p>
      </div>
    </div>
  );
};

export default GeometricNavigation;