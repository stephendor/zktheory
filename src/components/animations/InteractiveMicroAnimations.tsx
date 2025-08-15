import React, { useCallback, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { animated, useSpringValue } from '@react-spring/web';

interface MicroAnimationProps {
  children: React.ReactNode;
  animationType: 'point' | 'curve' | 'equation' | 'operation';
  onInteraction?: (type: string, data: any) => void;
  mathContext?: {
    isValid: boolean;
    significance: number;
    operation?: string;
  };
}

export const InteractiveMicroAnimations: React.FC<MicroAnimationProps> = ({
  children,
  animationType,
  onInteraction,
  mathContext = { isValid: true, significance: 1 }
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastInteraction, setLastInteraction] = useState<string>('');

  const elementRef = useRef<HTMLDivElement>(null);
  
  // Physics-based spring values for natural mathematical motion
  const springScale = useSpringValue(1);
  const springRotation = useSpringValue(0);
  const springGlow = useSpringValue(0);
  const springMagnetism = useSpringValue(0);

  // Motion values for gesture tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useTransform(x, [-100, 0, 100], [0.9, 1, 1.1]);
  const rotateZ = useTransform(y, [-100, 0, 100], [-5, 0, 5]);

  // Mathematical interaction styles based on type
  const getInteractionStyle = (type: string) => {
    switch (type) {
      case 'point':
        return {
          hover: {
            scale: 1.15,
            glow: 0.6,
            duration: 300,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Elastic out
          },
          press: {
            scale: 0.95,
            ripple: true,
            duration: 150,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Ease out
          },
          drag: {
            magnetism: mathContext.significance,
            trail: true,
            elastic: true
          }
        };

      case 'curve':
        return {
          hover: {
            liquidLight: true,
            flowSpeed: 1.5,
            duration: 500,
            easing: 'linear'
          },
          press: {
            wave: true,
            amplitude: 0.1,
            frequency: 2
          }
        };

      case 'equation':
        return {
          hover: {
            highlight: 'variable',
            pulse: true,
            frequency: 1.2
          },
          press: {
            emphasis: true,
            scale: 1.1
          }
        };

      case 'operation':
        return {
          hover: {
            preview: true,
            anticipation: 0.8
          },
          press: {
            execute: true,
            celebration: mathContext.isValid ? 'success' : 'gentle'
          }
        };

      default:
        return {
          hover: { scale: 1.05 },
          press: { scale: 0.98 }
        };
    }
  };

  const interactionStyle = getInteractionStyle(animationType);

  // Gesture handlers with mathematical physics
  const bind = useGesture({
    onHover: ({ hovering }) => {
      setIsHovered(hovering);
      
      if (hovering) {
        // Mathematical "breathing" animation for points
        if (animationType === 'point') {
          springScale.start(interactionStyle.hover.scale);
          springGlow.start(interactionStyle.hover.glow);
          
          // Gentle pulsing that feels alive
          const breathe = () => {
            springScale.start({
              to: [1.15, 1.05, 1.15],
              config: { duration: 2000 },
              loop: isHovered
            });
          };
          breathe();
        }

        // Liquid light flow for curves
        if (animationType === 'curve') {
          // Implementation would include SVG path animation
          onInteraction?.('curve-hover', { liquidLight: true });
        }

        onInteraction?.('hover', { type: animationType, significance: mathContext.significance });
      } else {
        springScale.start(1);
        springGlow.start(0);
      }
    },

    onPointerDown: ({ event }) => {
      setIsPressed(true);
      event.preventDefault();

      // Satisfying "snap" with ripple effect for points
      if (animationType === 'point') {
        springScale.start(0.95);
        
        // Create ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'mathematical-ripple';
        ripple.style.cssText = `
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(79, 172, 254, 0.6) 0%, transparent 70%);
          width: 0;
          height: 0;
          pointer-events: none;
          animation: mathematical-ripple 0.6s ease-out;
        `;
        
        if (elementRef.current) {
          elementRef.current.appendChild(ripple);
          setTimeout(() => ripple.remove(), 600);
        }

        onInteraction?.('press', { 
          type: 'point', 
          ripple: true, 
          force: mathContext.significance 
        });
      }

      // Mathematical operation execution
      if (animationType === 'operation') {
        if (mathContext.isValid) {
          springScale.start(1.1);
          springRotation.start(5);
          onInteraction?.('operation-execute', { 
            operation: mathContext.operation,
            celebration: 'success'
          });
        }
      }
    },

    onPointerUp: () => {
      setIsPressed(false);
      
      // Elastic bounce back
      springScale.start({
        to: isHovered ? 1.15 : 1,
        config: { tension: 300, friction: 10 }
      });
      springRotation.start(0);
    },

    onDrag: ({ movement: [mx, my], velocity: [vx, vy], down, direction: [dx, dy] }) => {
      setIsDragging(down);
      
      if (down) {
        x.set(mx);
        y.set(my);

        // Mathematical magnetism - points feel drawn to valid positions
        if (animationType === 'point') {
          const distance = Math.sqrt(mx * mx + my * my);
          const magneticForce = Math.max(0, 1 - distance / 100) * mathContext.significance;
          
          springMagnetism.start(magneticForce);
          
          // Trigger micro-celebration when approaching mathematically significant areas
          if (magneticForce > 0.7) {
            onInteraction?.('magnetic-attraction', {
              force: magneticForce,
              significance: mathContext.significance
            });
          }
        }

        // Parameter adjustment for curves feels like stretching elastic
        if (animationType === 'curve') {
          const deformation = Math.abs(mx) / 100;
          onInteraction?.('curve-deform', {
            deformation,
            direction: dx,
            naturalSettling: true
          });
        }
      } else {
        // Natural settling with mathematical physics
        x.set(0);
        y.set(0);
        springMagnetism.start(0);
        
        // Gentle bounce-back with elastic easing
        const settleAnimation = {
          to: 0,
          config: { 
            tension: 280, 
            friction: 60,
            mass: 1 + mathContext.significance * 0.5 // Heavier objects settle more slowly
          }
        };
        
        springScale.start(settleAnimation);
      }
    },

    // Mathematical gesture recognition
    onPinch: ({ offset: [scale], direction: [dx, dy] }) => {
      if (scale > 1.2) {
        onInteraction?.('mathematical-zoom', {
          scale,
          direction: 'deeper',
          revelation: true
        });
      }
    },

    onMove: ({ movement: [mx, my] }) => {
      // Gentle following motion for mathematical guidance
      if (animationType === 'equation' && !isDragging) {
        const followStrength = 0.1;
        springScale.start(1 + Math.abs(mx + my) * 0.001);
      }
    }
  });

  // Accessibility enhancements
  const accessibilityProps = {
    role: 'button',
    tabIndex: 0,
    'aria-label': `Interactive ${animationType} - ${mathContext.isValid ? 'valid' : 'requires adjustment'}`,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onInteraction?.('keyboard-activate', { type: animationType });
      }
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes mathematical-ripple {
          0% {
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            width: 100px;
            height: 100px;
            margin: -50px;
            opacity: 0;
          }
        }

        .mathematical-point {
          filter: drop-shadow(0 0 ${springGlow.get() * 10}px rgba(79, 172, 254, 0.8));
          transition: filter 0.3s ease;
        }

        .mathematical-curve {
          stroke-dasharray: 1000;
          stroke-dashoffset: ${isHovered ? 0 : 1000};
          animation: ${isHovered ? 'liquid-light 2s ease-in-out infinite' : 'none'};
        }

        @keyframes liquid-light {
          0%, 100% { stroke-dashoffset: 0; }
          50% { stroke-dashoffset: -500; }
        }

        .mathematical-equation {
          position: relative;
          overflow: hidden;
        }

        .mathematical-equation::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(79, 172, 254, 0.3), transparent);
          transition: left 0.5s ease;
        }

        .mathematical-equation:hover::before {
          left: 100%;
        }

        .reduced-motion {
          animation: none !important;
          transition: opacity 0.3s ease, transform 0.3s ease !important;
        }
      `}</style>

      <animated.div
        ref={elementRef}
        {...bind()}
        {...accessibilityProps}
        className={`mathematical-interactive ${animationType}`}
        style={{
          scale: springScale,
          rotate: springRotation,
          cursor: isDragging ? 'grabbing' : isHovered ? 'pointer' : 'grab',
          position: 'relative',
          display: 'inline-block',
          userSelect: 'none',
          outline: 'none'
        }}
      >
        <motion.div
          style={{
            x,
            y,
            scale,
            rotateZ,
          }}
          animate={{
            filter: isPressed 
              ? `drop-shadow(0 0 ${mathContext.significance * 15}px rgba(79, 172, 254, 0.9))` 
              : isHovered 
                ? `drop-shadow(0 0 ${mathContext.significance * 8}px rgba(79, 172, 254, 0.5))`
                : 'none'
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
            mass: 1 + mathContext.significance * 0.3
          }}
        >
          {children}
        </motion.div>

        {/* Mathematical significance indicator */}
        {mathContext.significance > 0.8 && (
          <motion.div
            className="significance-aura"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120%',
              height: '120%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(79, 172, 254, 0.2) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: -1
            }}
            animate={{
              scale: isHovered ? 1.3 : 1,
              opacity: isHovered ? 0.8 : 0.4
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
          />
        )}

        {/* Interaction feedback overlay */}
        {lastInteraction && (
          <motion.div
            className="interaction-feedback"
            style={{
              position: 'absolute',
              top: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '4px 8px',
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#ffffff',
              fontSize: '12px',
              borderRadius: '4px',
              pointerEvents: 'none',
              zIndex: 1000
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {lastInteraction}
          </motion.div>
        )}
      </animated.div>
    </>
  );
};

// Specialized micro-animations for different mathematical elements
export const MathematicalPoint: React.FC<{
  position: [number, number];
  significance?: number;
  onInteraction?: (type: string, data: any) => void;
}> = ({ position, significance = 1, onInteraction }) => (
  <InteractiveMicroAnimations
    animationType="point"
    mathContext={{ isValid: true, significance }}
    onInteraction={onInteraction}
  >
    <div
      style={{
        width: `${8 + significance * 4}px`,
        height: `${8 + significance * 4}px`,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(79, 172, 254, ${0.8 + significance * 0.2}) 0%, rgba(0, 242, 254, 0.6) 100%)`,
        transform: `translate(${position[0]}px, ${position[1]}px)`
      }}
    />
  </InteractiveMicroAnimations>
);

export const MathematicalCurve: React.FC<{
  path: string;
  onInteraction?: (type: string, data: any) => void;
}> = ({ path, onInteraction }) => (
  <InteractiveMicroAnimations
    animationType="curve"
    onInteraction={onInteraction}
  >
    <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
      <path
        d={path}
        fill="none"
        stroke="rgba(79, 172, 254, 0.8)"
        strokeWidth="2"
        className="mathematical-curve"
      />
    </svg>
  </InteractiveMicroAnimations>
);

export const MathematicalEquation: React.FC<{
  children: React.ReactNode;
  isValid?: boolean;
  onInteraction?: (type: string, data: any) => void;
}> = ({ children, isValid = true, onInteraction }) => (
  <InteractiveMicroAnimations
    animationType="equation"
    mathContext={{ isValid, significance: 0.7 }}
    onInteraction={onInteraction}
  >
    <div className="mathematical-equation">
      {children}
    </div>
  </InteractiveMicroAnimations>
);

export default InteractiveMicroAnimations;