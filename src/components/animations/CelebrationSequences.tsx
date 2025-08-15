/* eslint-disable react/forbid-dom-props */
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useSpring, animated, useSpringRef, useChain } from '@react-spring/web';
import confetti from 'canvas-confetti';

interface CelebrationProps {
  type: 'micro' | 'medium' | 'major' | 'achievement' | 'perfect-moment';
  trigger: boolean;
  onComplete?: () => void;
  mathContext?: {
    discovery: string;
    significance: number;
    insight: string;
  };
}

export const CelebrationSequences: React.FC<CelebrationProps> = ({
  type,
  trigger,
  onComplete,
  mathContext
}) => {
  const [isActive, setIsActive] = useState(false);
  const [particles, setParticles] = useState<Array<{id: string, x: number, y: number, symbol: string}>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Spring refs for chained animations
  const shimmerRef = useSpringRef();
  const burstRef = useSpringRef();
  const flowRef = useSpringRef();
  const harmonyRef = useSpringRef();

  // Mathematical celebration configurations
  const celebrations = {
    micro: {
      duration: 800,
      intensity: 0.3,
      particles: 3,
      sounds: ['gentle-chime'],
      visualEffects: ['shimmer', 'soft-pulse']
    },
    medium: {
      duration: 1500,
      intensity: 0.6,
      particles: 12,
      sounds: ['harmonic-chord', 'mathematical-chime'],
      visualEffects: ['wave-flow', 'synchronized-dance', 'color-bloom']
    },
    major: {
      duration: 3000,
      intensity: 1.0,
      particles: 50,
      sounds: ['orchestral-crescendo', 'mathematical-symphony'],
      visualEffects: ['confetti-burst', 'particle-symphony', 'light-rays', 'sacred-geometry']
    },
    achievement: {
      duration: 2000,
      intensity: 0.8,
      particles: 25,
      sounds: ['achievement-fanfare', 'crystalline-formation'],
      visualEffects: ['tool-materialization', 'knowledge-unlock', 'background-shift']
    },
    'perfect-moment': {
      duration: 5000,
      intensity: 1.2,
      particles: 100,
      sounds: ['transcendent-harmony', 'universal-resonance'],
      visualEffects: ['perfect-alignment', 'transcendent-glow', 'time-dilation', 'mathematical-revelation']
    }
  };

  // Micro-celebrations: Gentle acknowledgment of small insights
  const MicroCelebration = () => {
    const [sparkles, sparkleApi] = useSpring(() => ({
      opacity: 0,
      scale: 0.8,
      rotate: 0,
      config: { tension: 300, friction: 25 }
    }));

    useEffect(() => {
      if (trigger) {
        sparkleApi.start({
          opacity: 1,
          scale: 1.1,
          rotate: 5,
          onRest: () => {
            sparkleApi.start({
              opacity: 0,
              scale: 0.8,
              rotate: 0,
              delay: 400,
              onRest: onComplete
            });
          }
        });
      }
    }, [trigger]);

    return (
      <animated.div
        style={{
          ...sparkles,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79, 172, 254, 0.8) 0%, transparent 60%)',
            filter: 'blur(1px)'
          }}
        />
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              top: `${Math.random() * 20 - 10}px`,
              left: `${Math.random() * 20 - 10}px`
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
              y: [0, -10, -20]
            }}
            transition={{
              duration: 1,
              delay: i * 0.1,
              ease: 'easeOut'
            }}
          />
        ))}
      </animated.div>
    );
  };

  // Medium celebrations: Synchronized mathematical elements
  const MediumCelebration = () => {
    const [waveFlow] = useSpring(() => ({
      ref: flowRef,
      from: { progress: 0, intensity: 0 },
      to: { progress: 1, intensity: 1 },
      config: { duration: 1500, easing: t => Math.sin(t * Math.PI) }
    }));

    useEffect(() => {
      if (trigger) {
        // Create synchronized wave across mathematical elements
        const elements = document.querySelectorAll('.mathematical-element');
        elements.forEach((el, index) => {
          setTimeout(() => {
            (el as HTMLElement).style.animation = 'mathematical-wave 0.6s ease-out';
          }, index * 100);
        });

  setTimeout(() => onComplete?.(), 1500);
      }
    }, [trigger]);

    return (
      <animated.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          background: waveFlow.progress.to(p => 
            `radial-gradient(circle at 50% 50%, rgba(79, 172, 254, ${p * 0.3}) 0%, transparent 70%)`
          )
        }}
      >
        {/* Harmonic visual rhythm */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${(i + 1) * 40}px`,
              height: `${(i + 1) * 40}px`,
              border: '2px solid rgba(79, 172, 254, 0.3)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.9, 0.6]
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.1,
              repeat: 1,
              ease: 'easeInOut'
            }}
          />
        ))}
      </animated.div>
    );
  };

  // Major celebrations: Full visual symphony
  const MajorCelebration = () => {
    const [symphonyStage, setSymphonyStage] = useState(0);

    useEffect(() => {
      if (trigger) {
        // Stage 1: Confetti burst with mathematical symbols
        const shapes = ['○', '∞', '∑', '∫', 'π', 'φ', '∆', '√'];
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4facfe', '#00f2fe', '#ffffff', '#ffd700'],
          shapes: shapes.map(symbol => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.height = 20;
            if (ctx) {
              ctx.font = '16px serif';
              ctx.fillStyle = '#4facfe';
              ctx.textAlign = 'center';
              ctx.fillText(symbol, 10, 15);
            }
            return canvas;
          }) as any
        });

        setSymphonyStage(1);

        // Stage 2: Particle flow symphony
        setTimeout(() => {
          setSymphonyStage(2);
          createParticleFlow();
        }, 800);

        // Stage 3: Sacred geometry revelation
        setTimeout(() => {
          setSymphonyStage(3);
          revealSacredGeometry();
        }, 1600);

  setTimeout(() => onComplete?.(), 3000);
      }
    }, [trigger]);

    const createParticleFlow = () => {
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: `particle-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        symbol: ['●', '◆', '★', '▲'][Math.floor(Math.random() * 4)]
      }));
      setParticles(newParticles);
    };

    const revealSacredGeometry = () => {
      // Golden ratio spiral animation
      const phi = (1 + Math.sqrt(5)) / 2;
      // Implementation would create spiral particles following golden ratio
    };

    return (
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          overflow: 'hidden'
        }}
        animate={{
          background: symphonyStage >= 2 
            ? 'radial-gradient(circle, rgba(79, 172, 254, 0.4) 0%, rgba(0, 242, 254, 0.2) 50%, transparent 100%)'
            : 'transparent'
        }}
      >
        {/* Particle symphony */}
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              style={{
                position: 'absolute',
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                fontSize: '18px',
                color: '#4facfe',
                pointerEvents: 'none'
              }}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{ 
                opacity: [0, 1, 0], 
                scale: [0, 1.5, 0],
                rotate: 360,
                x: [0, (Math.random() - 0.5) * 200],
                y: [0, (Math.random() - 0.5) * 200]
              }}
              transition={{
                duration: 2,
                ease: 'easeOut'
              }}
              exit={{ opacity: 0 }}
            >
              {particle.symbol}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Sacred geometry overlay */}
        {symphonyStage >= 3 && (
          <motion.svg
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '300px',
              height: '300px'
            }}
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 0.6, rotate: 360 }}
            transition={{ duration: 2, ease: 'linear' }}
          >
            {/* Golden ratio spiral */}
            <path
              d="M150,150 Q150,100 200,100 Q250,100 250,150 Q250,200 200,200 Q150,200 150,150"
              fill="none"
              stroke="rgba(255, 215, 0, 0.8)"
              strokeWidth="2"
            />
            {/* Fibonacci squares */}
            {[1, 1, 2, 3, 5, 8].map((size, i) => (
              <rect
                key={i}
                x={150 - size * 5}
                y={150 - size * 5}
                width={size * 10}
                height={size * 10}
                fill="none"
                stroke="rgba(79, 172, 254, 0.4)"
                strokeWidth="1"
                style={{
                  animation: `sacred-geometry-reveal ${0.5 + i * 0.2}s ease-out ${i * 0.1}s both`
                }}
              />
            ))}
          </motion.svg>
        )}
      </motion.div>
    );
  };

  // Perfect moment celebration: Transcendent mathematical harmony
  const PerfectMomentCelebration = () => {
    const [isTranscendent, setIsTranscendent] = useState(false);

    useEffect(() => {
      if (trigger) {
        // Time dilation effect
        setIsTranscendent(true);
        
        // Universal mathematical resonance
        const resonanceInterval = setInterval(() => {
          // Pulse all mathematical elements in perfect harmony
          document.documentElement.style.filter = 'brightness(1.1) saturate(1.2)';
          setTimeout(() => {
            document.documentElement.style.filter = 'none';
          }, 200);
        }, 400);

        setTimeout(() => {
          clearInterval(resonanceInterval);
          setIsTranscendent(false);
          onComplete?.();
        }, 5000);
      }
    }, [trigger]);

    return (
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 9999
        }}
        animate={{
          background: isTranscendent 
            ? 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(79, 172, 254, 0.05) 50%, transparent 100%)'
            : 'transparent'
        }}
        transition={{ duration: 2 }}
      >
        {/* Mathematical unity visualization */}
        {isTranscendent && (
          <motion.div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '72px',
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
              fontFamily: 'serif'
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            ∞
            <motion.div
              style={{
                fontSize: '24px',
                marginTop: '20px',
                color: 'rgba(79, 172, 254, 0.8)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
            >
              Mathematical Unity Achieved
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Achievement unlock celebration
  const AchievementCelebration = () => {
    const [toolIcon, setToolIcon] = useState('');

    useEffect(() => {
      if (trigger && mathContext?.discovery) {
        // Crystalline formation of new mathematical tool
        setToolIcon(getToolIcon(mathContext.discovery));
        
        // Background shift to reflect new understanding
        setTimeout(() => {
          document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          setTimeout(() => {
            document.body.style.background = '';
          }, 2000);
        }, 500);

  setTimeout(() => onComplete?.(), 2000);
      }
    }, [trigger]);

    const getToolIcon = (discovery: string) => {
      const icons: Record<string, string> = {
        'group-operation': '⊕',
        'elliptic-curve': '∞',
        'topological-insight': '∮',
        'algebraic-structure': '⊗'
      };
      return icons[discovery] || '★';
    };

    return (
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none'
        }}
  initial={{ opacity: 0, scale: 0, rotate: -180 }}
  animate={{ opacity: 1, scale: [0, 1.3, 1], rotate: 0 }}
  transition={{ duration: 1.5, ease: 'backOut' }}
      >
        <div
          style={{
            fontSize: '48px',
            color: '#ffd700',
            filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))',
            animation: 'crystalline-formation 2s ease-out'
          }}
        >
          {toolIcon}
        </div>
        <motion.div
          style={{
            position: 'absolute',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '14px',
            color: '#ffffff',
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '8px 12px',
            borderRadius: '20px',
            whiteSpace: 'nowrap'
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          New Tool Unlocked: {mathContext?.discovery}
        </motion.div>
      </motion.div>
    );
  };

  // Render appropriate celebration based on type
  const renderCelebration = () => {
    switch (type) {
      case 'micro':
        return <MicroCelebration />;
      case 'medium':
        return <MediumCelebration />;
      case 'major':
        return <MajorCelebration />;
      case 'achievement':
        return <AchievementCelebration />;
      case 'perfect-moment':
        return <PerfectMomentCelebration />;
      default:
        return null;
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes mathematical-wave {
          0% { transform: scale(1) rotateY(0deg); }
          50% { transform: scale(1.1) rotateY(180deg); }
          100% { transform: scale(1) rotateY(360deg); }
        }

        @keyframes sacred-geometry-reveal {
          0% { 
            opacity: 0; 
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
          }
          100% { 
            opacity: 1; 
            stroke-dasharray: 100;
            stroke-dashoffset: 0;
          }
        }

        @keyframes crystalline-formation {
          0% { 
            filter: drop-shadow(0 0 0px transparent) brightness(1);
          }
          50% { 
            filter: drop-shadow(0 0 30px rgba(255, 215, 0, 1)) brightness(1.5);
          }
          100% { 
            filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)) brightness(1);
          }
        }

        .reduced-motion .celebration-container * {
          animation: none !important;
          transition: opacity 0.3s ease !important;
        }
      `}</style>

      <AnimatePresence>
        {trigger && (
          <motion.div
            ref={containerRef}
            className="celebration-container"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 1000
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderCelebration()}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CelebrationSequences;