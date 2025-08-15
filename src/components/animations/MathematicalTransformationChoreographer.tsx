import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { useSpring, animated } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';

interface MathematicalState {
  beat: number;
  curveType: 'familiar' | 'polynomial' | 'elliptic' | 'group' | 'topological' | 'torus';
  transformationProgress: number;
  discoveredConnections: string[];
}

interface TransformationProps {
  onBeatComplete: (beat: number) => void;
  onInsightDiscovered: (insight: string) => void;
  onCelebrationTrigger: (type: 'micro' | 'medium' | 'major') => void;
}

export const MathematicalTransformationChoreographer: React.FC<TransformationProps> = ({
  onBeatComplete,
  onInsightDiscovered,
  onCelebrationTrigger
}) => {
  const [mathState, setMathState] = useState<MathematicalState>({
    beat: 1,
    curveType: 'familiar',
    transformationProgress: 0,
    discoveredConnections: []
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useAnimation();
  const [isTransforming, setIsTransforming] = useState(false);

  // Mathematical transformation orchestrator
  const transformationSequence = {
    // Beat 1-2: Familiar → Polynomial Curves
    familiarToPolynomial: {
      duration: 3000,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Elastic out
      keyframes: [
        { progress: 0, curve: 'circle', sparkles: 0 },
        { progress: 0.3, curve: 'deforming', sparkles: 10 },
        { progress: 0.7, curve: 'polynomial-emerging', sparkles: 25 },
        { progress: 1, curve: 'polynomial', sparkles: 50 }
      ]
    },

    // Beat 3-4: Polynomial → Elliptic Curves
    polynomialToElliptic: {
      duration: 4000,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Ease out
      magicMoment: 0.6, // The moment of elliptic curve revelation
      keyframes: [
        { progress: 0, curve: 'polynomial', revelation: 0 },
        { progress: 0.4, curve: 'morphing', revelation: 0.2 },
        { progress: 0.6, curve: 'elliptic-emerging', revelation: 0.8, celebration: 'major' },
        { progress: 1, curve: 'elliptic', revelation: 1, stabilization: true }
      ]
    },

    // Beat 5-6: Elliptic Curves → Group Operations
    ellipticToGroup: {
      duration: 5000,
      choreography: 'mathematical-dance',
      keyframes: [
        { progress: 0, operation: 'none', dancers: 0 },
        { progress: 0.2, operation: 'point-introduction', dancers: 2 },
        { progress: 0.5, operation: 'magnetic-attraction', dancers: 2 },
        { progress: 0.8, operation: 'addition-dance', dancers: 3 },
        { progress: 1, operation: 'group-harmony', dancers: 'infinite' }
      ]
    },

    // Beat 7: Torus Revelation
    torusRevelation: {
      duration: 6000,
      zenMoment: 0.75,
      keyframes: [
        { progress: 0, topology: 'plane', understanding: 0 },
        { progress: 0.3, topology: 'wrapping-begins', understanding: 0.2 },
        { progress: 0.6, topology: 'surface-emerging', understanding: 0.5 },
        { progress: 0.75, topology: 'torus-revelation', understanding: 0.9, zenMoment: true },
        { progress: 1, topology: 'unified-understanding', understanding: 1 }
      ]
    }
  };

  // Physics-based curve morphing
  const useCurveMorphing = () => {
    const [springs, api] = useSpring(() => ({
      morphProgress: 0,
      elasticity: 1,
      magnetism: 0,
      harmony: 0,
      config: {
        tension: 280,
        friction: 120,
        mass: 1
      }
    }));

    const morphToNext = (targetState: string) => {
      api.start({
        morphProgress: 1,
        elasticity: targetState === 'elliptic' ? 1.2 : 1,
        magnetism: targetState === 'group' ? 1 : 0,
        harmony: targetState === 'torus' ? 1 : 0,
        onRest: () => {
          if (targetState === 'elliptic') onCelebrationTrigger('major');
          if (targetState === 'torus') onCelebrationTrigger('major');
        }
      });
    };

    return { springs, morphToNext };
  };

  // Gesture-responsive mathematical interactions
  const gestureHandlers = useGesture({
    onDrag: ({ movement: [mx, my], velocity: [vx, vy], down }) => {
      if (down) {
        // Mathematical manipulation feels like pulling taffy
        const mathematicalForce = Math.sqrt(mx * mx + my * my);
        const responsiveness = Math.min(mathematicalForce / 100, 1);
        
        // Trigger micro-celebrations for mathematical insights
        if (responsiveness > 0.7) {
          onCelebrationTrigger('micro');
        }
      }
    },

    onPinch: ({ offset: [scale] }) => {
      // Zooming feels like diving deeper into mathematical structure
      if (scale > 1.5) {
        onInsightDiscovered('deep-structure-revealed');
        onCelebrationTrigger('medium');
      }
    },

    onWheel: ({ direction: [dx, dy] }) => {
      // Scrolling through mathematical dimensions
      if (Math.abs(dy) > 5) {
        setIsTransforming(true);
        setTimeout(() => setIsTransforming(false), 200);
      }
    }
  });

  // Mathematical easing functions based on actual mathematical curves
  const mathematicalEasing = {
    elliptic: (t: number) => {
      // Based on elliptic curve y² = x³ + ax + b
      const x = t * 4 - 2; // Map to [-2, 2]
      const y = Math.sqrt(Math.abs(x * x * x - x + 1));
      return Math.min(y / 2, 1);
    },

    harmonic: (t: number) => {
      // Sinusoidal easing that feels musical
      return 0.5 * (1 + Math.sin(Math.PI * (t - 0.5)));
    },

    exponential: (t: number) => {
      // Mathematical growth curve
      return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
    },

    golden: (t: number) => {
      // Based on golden ratio spiral
      const phi = (1 + Math.sqrt(5)) / 2;
      return Math.pow(phi, t) / Math.pow(phi, 1);
    }
  };

  // Render mathematical transformations with D3 + WebGL
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('webgl2');
    
    if (!context) {
      console.warn('WebGL2 not supported, falling back to 2D canvas');
      return;
    }

    // GPU-accelerated mathematical curve rendering
    const renderMathematicalCurve = (state: MathematicalState) => {
      // Vertex shader for mathematical precision
      const vertexShaderSource = `#version 300 es
        in vec2 a_position;
        in float a_parameter;
        uniform float u_time;
        uniform float u_morphProgress;
        uniform int u_curveType;
        out vec3 v_color;
        
        // Mathematical curve functions
        vec2 ellipticCurve(float t) {
          float x = t * 4.0 - 2.0;
          float y = sqrt(abs(x * x * x - x + 1.0));
          return vec2(x, y) * 0.3;
        }
        
        vec2 polynomialCurve(float t) {
          float x = t * 4.0 - 2.0;
          float y = x * x * x - x;
          return vec2(x, y) * 0.2;
        }
        
        void main() {
          vec2 position = a_position;
          
          if (u_curveType == 1) { // Polynomial
            position = polynomialCurve(a_parameter);
          } else if (u_curveType == 2) { // Elliptic
            position = ellipticCurve(a_parameter);
          }
          
          // Smooth morphing between curve types
          position = mix(a_position, position, u_morphProgress);
          
          // Mathematical sparkle effects
          float sparkle = sin(u_time * 10.0 + a_parameter * 20.0) * 0.1;
          position += sparkle;
          
          gl_Position = vec4(position, 0.0, 1.0);
          gl_PointSize = 3.0 + sparkle * 5.0;
          
          // Color based on mathematical properties
          v_color = vec3(0.3 + sparkle, 0.6, 0.9);
        }
      `;

      // Fragment shader for visual beauty
      const fragmentShaderSource = `#version 300 es
        precision highp float;
        in vec3 v_color;
        out vec4 fragColor;
        
        void main() {
          vec2 coord = gl_PointCoord - 0.5;
          float dist = length(coord);
          
          // Soft, glowing mathematical points
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          
          fragColor = vec4(v_color, alpha);
        }
      `;

      // WebGL setup and rendering would continue here...
      // This is a simplified version showing the mathematical precision approach
    };

    renderMathematicalCurve(mathState);
  }, [mathState]);

  // Trigger transformations based on user progress
  const advanceNarrative = () => {
    const nextBeat = mathState.beat + 1;
    
    setIsTransforming(true);
    
    // Execute transformation with appropriate timing and easing
    setTimeout(() => {
      setMathState(prev => ({
        ...prev,
        beat: nextBeat,
        curveType: nextBeat <= 2 ? 'polynomial' : 
                  nextBeat <= 4 ? 'elliptic' :
                  nextBeat <= 6 ? 'group' : 'torus'
      }));
      
      onBeatComplete(nextBeat);
      setIsTransforming(false);
    }, transformationSequence.familiarToPolynomial.duration);
  };

  return (
    <div className="mathematical-transformation-stage" {...gestureHandlers()}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="mathematical-canvas"
        style={{
          background: 'radial-gradient(circle, #0a0a0a 0%, #1a1a2e 100%)',
          cursor: isTransforming ? 'wait' : 'grab'
        }}
      />
      
      {/* Mathematical State Indicator */}
      <motion.div
        className="mathematical-state-indicator"
        animate={{
          scale: isTransforming ? 1.1 : 1,
          opacity: isTransforming ? 0.8 : 1
        }}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          color: '#ffffff',
          fontSize: '14px',
          fontFamily: 'monospace'
        }}
      >
        Beat {mathState.beat}/7: {mathState.curveType}
        <br />
        Connections: {mathState.discoveredConnections.length}
      </motion.div>

      {/* Transformation Progress */}
      <motion.div
        className="transformation-progress"
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}
      >
        <motion.div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
            borderRadius: '2px'
          }}
          animate={{
            width: `${(mathState.beat / 7) * 100}%`
          }}
          transition={{
            duration: 1,
            ease: mathematicalEasing.harmonic
          }}
        />
      </motion.div>

      {/* Hidden mathematical beauty trigger */}
      <button
        onClick={advanceNarrative}
        style={{
          position: 'absolute',
          bottom: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '25px',
          color: '#ffffff',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
        }}
      >
        Advance Mathematical Journey
      </button>
    </div>
  );
};

export default MathematicalTransformationChoreographer;