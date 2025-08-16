/**
 * Central Spiral Component
 * Mathematical golden ratio spiral that serves as the hub for all three pathways
 * Transforms mathematical concepts into practical applications through animated visualization
 */

'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { CentralSpiralProps, GoldenSpiralConfig, AudienceColorSchemes } from './types';

// ==========================================
// Mathematical Constants & Utilities
// ==========================================

const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio: φ ≈ 1.618
const TWO_PI = 2 * Math.PI;
const SPIRAL_EQUATION = (t: number) => ({
  r: Math.pow(PHI, t / Math.PI),
  theta: t
});

// Mathematical concepts that transform through the spiral
const TRANSFORMATION_CONCEPTS = {
  business: [
    { concept: 'Zero-Knowledge Proofs', application: 'Privacy-First Analytics', equation: 'π(x) = y ∧ ¬reveal(x)' },
    { concept: 'Topological Invariants', application: 'Robust Data Structures', equation: 'H₁(X) ≅ Z^b' },
    { concept: 'Elliptic Curves', application: 'Secure Transactions', equation: 'y² = x³ + ax + b' },
    { concept: 'Group Theory', application: 'Access Control', equation: 'G/H ≅ K' },
    { concept: 'Category Theory', application: 'System Architecture', equation: 'F: C → D' }
  ],
  technical: [
    { concept: 'Homomorphic Operations', application: 'Encrypted Computing', equation: '∀x,y: E(x⊕y) = E(x)⊗E(y)' },
    { concept: 'Persistence Diagrams', application: 'Data Shape Analysis', equation: 'dgm(f) = {(b,d) ∈ ℝ²}' },
    { concept: 'Galois Fields', application: 'Error Correction', equation: 'GF(2^n) = F₂[x]/(p(x))' },
    { concept: 'Fiber Bundles', application: 'Distributed Systems', equation: 'π: E → B' },
    { concept: 'Cohomology', application: 'Network Topology', equation: 'H^n(X;G)' }
  ],
  academic: [
    { concept: 'Spectral Sequences', application: 'Convergence Analysis', equation: 'E₂^{p,q} ⇒ H^{p+q}(X)' },
    { concept: 'Derived Categories', application: 'Abstract Frameworks', equation: 'D^b(Coh(X))' },
    { concept: 'Motivic Cohomology', application: 'Universal Invariants', equation: 'H^p(X, ℤ(q))' },
    { concept: 'Quantum Groups', application: 'Symmetry Breaking', equation: 'U_q(𝔤)' },
    { concept: 'Modular Forms', application: 'Number Theoretic Tools', equation: 'f(τ) = ∑ a_n q^n' }
  ]
};

// ==========================================
// Color Schemes for Each Audience
// ==========================================

const AUDIENCE_COLORS: AudienceColorSchemes = {
  business: {
    primary: '#2563eb',
    secondary: '#f59e0b', 
    accent: '#10b981',
    background: '#f8fafc',
    foreground: '#1e293b',
    muted: '#64748b',
    border: '#e2e8f0',
    gradient: { start: '#2563eb', end: '#7c3aed', direction: 135 }
  },
  technical: {
    primary: '#0f172a',
    secondary: '#06b6d4',
    accent: '#8b5cf6',
    background: '#0f172a',
    foreground: '#f1f5f9',
    muted: '#64748b',
    border: '#334155',
    gradient: { start: '#0f172a', end: '#1e293b', direction: 90 }
  },
  academic: {
    primary: '#7c3aed',
    secondary: '#059669',
    accent: '#dc2626',
    background: '#fefbff',
    foreground: '#374151',
    muted: '#6b7280',
    border: '#d1d5db',
    gradient: { start: '#7c3aed', end: '#059669', direction: 45 }
  },
  mathematical: {
    primary: '#1e40af',
    secondary: '#7c2d12',
    accent: '#059669',
    background: '#ffffff',
    foreground: '#1f2937',
    muted: '#9ca3af',
    border: '#e5e7eb',
    gradient: { start: '#1e40af', end: '#7c2d12', direction: 180 }
  }
};

// ==========================================
// Main Central Spiral Component
// ==========================================

export const CentralSpiral: React.FC<CentralSpiralProps> = ({
  config,
  activePathway,
  spiralPhase,
  onSpiralClick,
  performanceMode = 'balanced'
}) => {
  // ==========================================
  // State Management
  // ==========================================
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTransform, setCurrentTransform] = useState(0);
  const [spiralPoints, setSpiralPoints] = useState<Array<{x: number, y: number, t: number}>>([]);
  const [conceptIndex, setConceptIndex] = useState(0);

  // ==========================================
  // Performance-based Configuration
  // ==========================================
  
  const adjustedConfig = useMemo(() => {
    const performanceMultipliers = {
      high: { segments: 1.0, particles: 1.0, quality: 1.0 },
      balanced: { segments: 0.7, particles: 0.6, quality: 0.8 },
      conservative: { segments: 0.5, particles: 0.4, quality: 0.6 }
    };
    
    const multiplier = performanceMultipliers[performanceMode];
    
    return {
      segments: Math.floor(config.segments * multiplier.segments),
      maxRotations: config.maxRotations,
      animationDuration: config.animationDuration,
      particleCount: Math.floor(config.particleCount * multiplier.particles),
      colorScheme: config.colorScheme,
      quality: multiplier.quality
    };
  }, [config, performanceMode]);

  // ==========================================
  // Current Color Scheme
  // ==========================================
  
  const currentColors = useMemo(() => {
    return AUDIENCE_COLORS[activePathway || 'mathematical'];
  }, [activePathway]);

  // ==========================================
  // Current Transformation Concepts
  // ==========================================
  
  const currentConcepts = useMemo(() => {
    return TRANSFORMATION_CONCEPTS[activePathway || 'business'];
  }, [activePathway]);

  // ==========================================
  // Generate Spiral Points
  // ==========================================
  
  const generateSpiralPoints = useCallback(() => {
    const points: Array<{x: number, y: number, t: number}> = [];
    const stepSize = (adjustedConfig.maxRotations * TWO_PI) / adjustedConfig.segments;
    
    for (let i = 0; i <= adjustedConfig.segments; i++) {
      const t = i * stepSize;
      const { r, theta } = SPIRAL_EQUATION(t + spiralPhase);
      
      // Convert polar to cartesian coordinates
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      
      points.push({ x, y, t });
    }
    
    setSpiralPoints(points);
  }, [adjustedConfig.segments, adjustedConfig.maxRotations, spiralPhase]);

  // ==========================================
  // Render Spiral Animation
  // ==========================================
  
  const renderSpiral = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Set canvas size with device pixel ratio
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
    
    // Clear canvas
    ctx.fillStyle = currentColors.background;
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Center the spiral
    const centerX = displayWidth / 2;
    const centerY = displayHeight / 2;
    const scale = Math.min(displayWidth, displayHeight) / 8; // Adjust spiral size

    ctx.save();
    ctx.translate(centerX, centerY);

    // Draw background gradient
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, scale * 3);
    gradient.addColorStop(0, currentColors.gradient.start + '20');
    gradient.addColorStop(0.7, currentColors.gradient.end + '10');
    gradient.addColorStop(1, currentColors.background);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(-centerX, -centerY, displayWidth, displayHeight);

    // Draw the golden spiral
    if (spiralPoints.length > 1) {
      // Main spiral path
      ctx.beginPath();
      ctx.strokeStyle = currentColors.primary;
      ctx.lineWidth = 3 * adjustedConfig.quality;
      ctx.lineCap = 'round';
      
      const scaledPoints = spiralPoints.map(point => ({
        x: point.x * scale,
        y: point.y * scale,
        t: point.t
      }));

      ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
      
      for (let i = 1; i < scaledPoints.length; i++) {
        const point = scaledPoints[i];
        const alpha = 1 - (i / scaledPoints.length) * 0.7; // Fade out towards center
        ctx.globalAlpha = alpha;
        ctx.lineTo(point.x, point.y);
        // Add golden ratio markers at key points
        if (i % Math.floor(adjustedConfig.segments / 5) === 0) {
          ctx.save();
          ctx.fillStyle = currentColors.accent;
          ctx.globalAlpha = alpha * 0.8;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4 * adjustedConfig.quality, 0, TWO_PI);
          ctx.fill();
          ctx.restore();
        }
      }
      
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Draw transformation particles
      if (adjustedConfig.particleCount > 0) {
        for (let i = 0; i < adjustedConfig.particleCount; i++) {
          const progress = (i / adjustedConfig.particleCount);
          const pointIndex = Math.floor(progress * (scaledPoints.length - 1));
          const point = scaledPoints[pointIndex];
          
          if (point) {
            const particlePhase = (spiralPhase + i * 0.1) % TWO_PI;
            const size = 2 + Math.sin(particlePhase) * 1;
            const alpha = 0.6 + Math.cos(particlePhase * 1.5) * 0.3;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = currentColors.secondary;
            ctx.beginPath();
            ctx.arc(
              point.x + Math.cos(particlePhase) * 5,
              point.y + Math.sin(particlePhase) * 5,
              size,
              0,
              TWO_PI
            );
            ctx.fill();
            ctx.restore();
          }
        }
      }
    }

    // Draw central mathematical concept transformation
    const currentConcept = currentConcepts[conceptIndex];
    if (currentConcept) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Concept text
      ctx.fillStyle = currentColors.foreground;
      ctx.font = `${12 * adjustedConfig.quality}px "font-mathematical", serif`;
      ctx.globalAlpha = 0.9;
      ctx.fillText(currentConcept.concept, 0, -20);
      
      // Arrow transformation
      ctx.strokeStyle = currentColors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.lineTo(20, 0);
      ctx.moveTo(15, -5);
      ctx.lineTo(20, 0);
      ctx.lineTo(15, 5);
      ctx.stroke();
      
      // Application text
      ctx.fillStyle = currentColors.primary;
      ctx.font = `${14 * adjustedConfig.quality}px "font-mathematical", serif`;
      ctx.fillText(currentConcept.application, 0, 20);
      
      // Mathematical equation (smaller)
      ctx.fillStyle = currentColors.muted;
      ctx.font = `${10 * adjustedConfig.quality}px "font-math-code", monospace`;
      ctx.globalAlpha = 0.7;
      ctx.fillText(currentConcept.equation, 0, 40);
      
      ctx.restore();
    }

    ctx.restore();
  }, [
    spiralPoints,
    currentColors,
    adjustedConfig,
    currentConcepts,
    conceptIndex,
    spiralPhase
  ]);

  // ==========================================
  // Animation Loop
  // ==========================================
  
  const animate = useCallback(() => {
    const now = Date.now();
    const newTransform = (now / adjustedConfig.animationDuration) % TWO_PI;
    const newConceptIndex = Math.floor((now / 3000) % currentConcepts.length);
    
    setCurrentTransform(newTransform);
    setConceptIndex(newConceptIndex);
    
    generateSpiralPoints();
    renderSpiral();
    
    animationRef.current = requestAnimationFrame(animate);
  }, [adjustedConfig.animationDuration, currentConcepts.length, generateSpiralPoints, renderSpiral]);

  // ==========================================
  // Effects
  // ==========================================
  
  useEffect(() => {
    generateSpiralPoints();
  }, [generateSpiralPoints]);

  useEffect(() => {
    renderSpiral();
  }, [renderSpiral]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    setIsLoaded(true);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        generateSpiralPoints();
        renderSpiral();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [generateSpiralPoints, renderSpiral]);

  // ==========================================
  // Click Handler
  // ==========================================
  
  const handleSpiralClick = useCallback((event: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const distance = Math.sqrt(x * x + y * y);
    
    // Only trigger if click is near the spiral
    if (distance < 100) {
      onSpiralClick();
    }
  }, [onSpiralClick]);

  // ==========================================
  // Component Classes
  // ==========================================
  
  const containerClasses = classNames(
    'relative w-full h-full',
    'flex items-center justify-center',
    'transition-golden duration-500',
    {
      'cursor-pointer': true,
      'opacity-90': !isLoaded,
    }
  );

  const canvasClasses = classNames(
    'w-full h-full',
    'transition-golden duration-300'
  );

  // ==========================================
  // Render
  // ==========================================
  
  return (
    <div ref={containerRef} className={containerClasses}>
      <canvas 
        ref={canvasRef}
        className={canvasClasses}
        onClick={handleSpiralClick}
        style={{ imageRendering: 'crisp-edges' }}
      />
      
      {/* Loading State */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-6 h-6 border-2 border-math-primary border-t-transparent rounded-full animate-golden" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pathway Labels */}
      <AnimatePresence>
        {activePathway && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          >
            <div 
              className="px-3 py-1 rounded-full text-xs font-mathematical text-white backdrop-blur-sm"
              style={{ backgroundColor: currentColors.primary + 'CC' }}
            >
              {activePathway.charAt(0).toUpperCase() + activePathway.slice(1)} Pathway Active
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mathematical Transform Indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <div className="text-xs text-math-muted font-math-code opacity-60">
          φ-spiral: θ = {(spiralPhase % TWO_PI).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default CentralSpiral;