import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';

interface CreatureProps {
  type: 'dot' | 'curvy' | 'professor-hoot' | 'morphie';
  position: { x: number; y: number };
  behavior: 'guide' | 'demonstrate' | 'celebrate' | 'encourage' | 'hint';
  mathContext?: {
    operation?: string;
    difficulty?: number;
    userProgress?: number;
    errorState?: boolean;
  };
  onInteraction?: (creature: string, action: string) => void;
}

interface CreatureState {
  mood: 'curious' | 'excited' | 'patient' | 'encouraging' | 'wise';
  energy: number;
  lastAction: string;
  isVisible: boolean;
}

export const MathematicalCreatures: React.FC<CreatureProps> = ({
  type,
  position,
  behavior,
  mathContext = {},
  onInteraction
}) => {
  const [creatureState, setCreatureState] = useState<CreatureState>({
    mood: 'curious',
    energy: 0.7,
    lastAction: 'idle',
    isVisible: true
  });

  const controls = useAnimation();
  const creatureRef = useRef<HTMLDivElement>(null);

  // Physics-based creature movement
  const [springs, api] = useSpring(() => ({
    x: position.x,
    y: position.y,
    scale: 1,
    rotate: 0,
    opacity: 1,
    glow: 0,
    config: {
      tension: 300,
      friction: 30,
      mass: 1
    }
  }));

  // Creature personalities and behaviors
  const creaturePersonalities = {
    dot: {
      baseSize: 12,
      personality: 'curious and eager',
      idleAnimation: 'gentle-bounce',
      colors: ['#4facfe', '#00f2fe', '#ffffff'],
      sounds: ['gentle-chime', 'soft-ping'],
      specialMoves: ['magnetic-attraction', 'point-dance', 'sparkle-trail']
    },
    curvy: {
      baseSize: 16,
      personality: 'wise and flowing',
      idleAnimation: 'flowing-motion',
      colors: ['#667eea', '#764ba2', '#9575cd'],
      sounds: ['flowing-tone', 'gentle-whoosh'],
      specialMoves: ['curve-riding', 'property-highlight', 'mathematical-surf']
    },
    'professor-hoot': {
      baseSize: 20,
      personality: 'scholarly but approachable',
      idleAnimation: 'head-tilt',
      colors: ['#ffd700', '#ff6b6b', '#4ecdc4'],
      sounds: ['soft-hoot', 'scholarly-chime'],
      specialMoves: ['equation-point', 'celebration-dance', 'thinking-pose']
    },
    morphie: {
      baseSize: 18,
      personality: 'playful and transformative',
      idleAnimation: 'shape-shift',
      colors: ['#ff9a9e', '#fecfef', '#fecfef'],
      sounds: ['transformation-chord', 'playful-morph'],
      specialMoves: ['topology-demo', 'shape-transformation', 'equivalence-show']
    }
  };

  const personality = creaturePersonalities[type];

  // Dot Sprite: Curious point that demonstrates mathematical operations
  const DotSprite = () => {
    const [isDemonstrating, setIsDemonstrating] = useState(false);
    const [trailParticles, setTrailParticles] = useState<Array<{id: string, x: number, y: number, age: number}>>([]);

    useEffect(() => {
      // Gentle bounce when idle
      const idleBounce = setInterval(() => {
        if (!isDemonstrating && behavior === 'guide') {
          api.start({
            y: position.y - 3,
            onRest: () => api.start({ y: position.y })
          });
        }
      }, 2000);

      return () => clearInterval(idleBounce);
    }, []);

    const demonstratePointAddition = () => {
      setIsDemonstrating(true);
      // Dance sequence: approach, attraction, result, return
      // Dance sequence: approach, dance, result
      api.start({
        x: position.x + 20,
        y: position.y - 5,
        scale: 1.2,
        glow: 0.8,
        config: { duration: 800 },
        onRest: () => {
          // Magnetic attraction effect
          api.start({
            x: position.x + 30,
            y: position.y,
            scale: 1.5,
            glow: 1,
            config: { duration: 600 },
            onRest: () => {
              // Result celebration
              api.start({
                x: position.x + 35,
                y: position.y - 10,
                scale: 1.1,
                glow: 0.6,
                rotate: 360,
                config: { duration: 400 },
                onRest: () => {
                  // Return to position
                  api.start({
                    x: position.x,
                    y: position.y,
                    scale: 1,
                    glow: 0,
                    rotate: 0
                  });
                  setIsDemonstrating(false);
                }
              });
            }
          });
        }
      });

      onInteraction?.(type, 'point-addition-demo');
    };

    return (
      <animated.div
        ref={creatureRef}
        style={{
          ...springs,
          position: 'absolute',
          width: `${personality.baseSize}px`,
          height: `${personality.baseSize}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${personality.colors[0]} 0%, ${personality.colors[1]} 100%)`,
          cursor: 'pointer',
          filter: springs.glow.to(g => `drop-shadow(0 0 ${g * 15}px ${personality.colors[0]})`),
          zIndex: 100
        }}
        onClick={demonstratePointAddition}
        onMouseEnter={() => {
          api.start({ scale: 1.1, glow: 0.4 });
          setCreatureState(prev => ({ ...prev, mood: 'excited' }));
        }}
        onMouseLeave={() => {
          api.start({ scale: 1, glow: 0 });
          setCreatureState(prev => ({ ...prev, mood: 'curious' }));
        }}
      >
        {/* Dot's eye-like sparkle */}
        <motion.div
          style={{
            position: 'absolute',
            top: '30%',
            left: '30%',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
            pointerEvents: 'none'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.9, 1, 0.9]
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </animated.div>
    );
  };

  // Curve Companion: Follows along curves with flowing motion
  const CurveCompanion = () => {
    const [isRiding, setIsRiding] = useState(false);

    const rideAlongCurve = (curveId: string) => {
      if (isRiding) return;
      setIsRiding(true);

      const duration = 3000;
      const steps = 20;

      for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const delay = (duration / steps) * i;

        setTimeout(() => {
          const curveX = position.x + Math.sin(progress * Math.PI * 2) * 50;
          const curveY = position.y + Math.cos(progress * Math.PI) * 20;

          api.start({
            x: curveX,
            y: curveY,
            rotate: progress * 360,
            glow: Math.max(0, Math.sin(progress * Math.PI)) * 0.8,
            config: { tension: 200, friction: 20 }
          });
        }, delay);
      }

      setTimeout(() => {
        setIsRiding(false);
        api.start({ x: position.x, y: position.y, rotate: 0, glow: 0 });
        onInteraction?.(type, 'curve-ride-demo');
      }, duration + 50);
    };

    return (
      <animated.div
        style={{
          ...springs,
          position: 'absolute',
          width: `${personality.baseSize}px`,
          height: `${personality.baseSize * 0.6}px`,
          borderRadius: '50% 50% 20% 20%',
          background: `linear-gradient(135deg, ${personality.colors[0]} 0%, ${personality.colors[1]} 100%)`,
          cursor: 'pointer',
          filter: springs.glow.to(g => `drop-shadow(0 0 ${g * 12}px ${personality.colors[0]})`),
          zIndex: 100
        }}
        onClick={() => rideAlongCurve('sample-curve')}
      >
        {/* Flowing motion indicator */}
        <motion.div
          style={{
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            right: '-2px',
            bottom: '-2px',
            borderRadius: '50% 50% 20% 20%',
            border: `2px solid ${personality.colors[2]}`,
            opacity: 0.6
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Wisdom emanation */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              borderRadius: '50%',
              background: personality.colors[2],
              top: `${20 + i * 10}%`,
              left: `${30 + i * 15}%`
            }}
            animate={{ opacity: [0, 1, 0], y: [0, -10, -20] }}
            transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
      </animated.div>
    );
  };

  // Professor Hoot: Scholarly owl that provides equation guidance
  const ProfessorHoot = () => {
    const [isPointing, setIsPointing] = useState(false);
    const [celebration, setCelebration] = useState(false);

    const pointToEquation = (elementSelector: string) => {
      setIsPointing(true);
      
      // Head tilt and point gesture
      api.start({
        rotate: mathContext.errorState ? -15 : 15,
        scale: 1.1,
        glow: 0.5,
        config: { duration: 400 },
        onRest: () => {
          // Return to normal position
          api.start({ rotate: 0, scale: 1, glow: 0 });
          setIsPointing(false);
        }
      });

      onInteraction?.(type, 'equation-guidance');
    };

    const celebrateSolution = () => {
      setCelebration(true);
      
      // Victory dance
      const danceSequence = [
        { rotate: 15, scale: 1.2, y: position.y - 5 },
        { rotate: -15, scale: 1.3, y: position.y - 8 },
        { rotate: 0, scale: 1.1, y: position.y - 3 },
        { rotate: 0, scale: 1, y: position.y }
      ];

      danceSequence.forEach((pose, i) => {
        setTimeout(() => {
          api.start({
            ...pose,
            glow: 0.8,
            config: { duration: 200 }
          });
        }, i * 200);
      });

      setTimeout(() => {
        setCelebration(false);
        api.start({ glow: 0 });
      }, 1000);

      onInteraction?.(type, 'solution-celebration');
    };

    useEffect(() => {
      if (mathContext.userProgress === 1) {
        celebrateSolution();
      }
    }, [mathContext.userProgress]);

    return (
      <animated.div
        style={{
          ...springs,
          position: 'absolute',
          width: `${personality.baseSize}px`,
          height: `${personality.baseSize}px`,
          borderRadius: '50% 50% 40% 40%',
          background: `linear-gradient(135deg, ${personality.colors[0]} 0%, ${personality.colors[1]} 100%)`,
          cursor: 'pointer',
          filter: springs.glow.to(g => `drop-shadow(0 0 ${g * 10}px ${personality.colors[0]})`),
          zIndex: 100
        }}
        onClick={() => pointToEquation('.equation-element')}
      >
        {/* Owl eyes */}
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: '20%',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '3px',
              height: '3px',
              borderRadius: '50%',
              background: 'white'
            }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            top: '25%',
            right: '20%',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '3px',
              height: '3px',
              borderRadius: '50%',
              background: 'white'
            }}
          />
        </div>

        {/* Mathematical symbol "feathers" */}
        {['∑', '∫', 'π'].map((symbol, i) => (
          <motion.div
            key={symbol}
            style={{
              position: 'absolute',
              fontSize: '6px',
              color: personality.colors[2],
              top: `${60 + i * 8}%`,
              left: `${30 + i * 10}%`,
              opacity: 0.7
            }}
            animate={{
              rotate: [0, 5, 0],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1 + i * 0.3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {symbol}
          </motion.div>
        ))}

        {/* Celebration particles */}
        {celebration && [...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: '3px',
              height: '3px',
              borderRadius: '50%',
              background: personality.colors[2],
              top: '50%',
              left: '50%'
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 40],
              y: [0, (Math.random() - 0.5) * 40],
              opacity: [1, 0],
              scale: [1, 0.5]
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

  // Morphie: Shape-shifting topology guide
  const TopologyGuide = () => {
    const [currentShape, setCurrentShape] = useState('circle');
    const [isMorphing, setIsMorphing] = useState(false);

    const shapes = ['circle', 'square', 'triangle', 'torus', 'mobius'];
    const shapeStyles = {
      circle: { borderRadius: '50%', transform: 'rotate(0deg)' },
      square: { borderRadius: '10%', transform: 'rotate(45deg)' },
      triangle: { borderRadius: '20%', transform: 'rotate(60deg)' },
      torus: { borderRadius: '50% 50% 20% 20%', transform: 'rotate(0deg)' },
      mobius: { borderRadius: '30% 70% 70% 30%', transform: 'rotate(0deg)' }
    };

    const morphToNext = () => {
      if (isMorphing) return;
      
      setIsMorphing(true);
      const currentIndex = shapes.indexOf(currentShape);
      const nextShape = shapes[(currentIndex + 1) % shapes.length];
      
      // Morphing animation
      api.start({
        scale: 1.3,
        rotate: 180,
        glow: 1,
        config: { duration: 600 },
        onRest: () => {
          setCurrentShape(nextShape);
          api.start({
            scale: 1,
            rotate: 0,
            glow: 0.3,
            config: { duration: 400 },
            onRest: () => setIsMorphing(false)
          });
        }
      });

      onInteraction?.(type, `morph-to-${nextShape}`);
    };

    useEffect(() => {
      // Continuous gentle shape shifting when idle
      const morphInterval = setInterval(() => {
        if (!isMorphing && Math.random() > 0.7) {
          morphToNext();
        }
      }, 3000);

      return () => clearInterval(morphInterval);
    }, [currentShape, isMorphing]);

    return (
      <animated.div
        style={{
          ...springs,
          position: 'absolute',
          width: `${personality.baseSize}px`,
          height: `${personality.baseSize}px`,
          background: `radial-gradient(circle, ${personality.colors[0]} 0%, ${personality.colors[1]} 100%)`,
          cursor: 'pointer',
          filter: springs.glow.to(g => `drop-shadow(0 0 ${g * 12}px ${personality.colors[0]})`),
          zIndex: 100,
          transition: 'border-radius 0.6s ease, transform 0.6s ease',
          ...shapeStyles[currentShape as keyof typeof shapeStyles]
        }}
        onClick={morphToNext}
      >
        {/* Topological flow lines */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              top: `${20 + i * 20}%`,
              left: '10%',
              right: '10%',
              height: '1px',
              background: personality.colors[2],
              opacity: 0.6
            }}
            animate={{
              scaleX: [0.5, 1, 0.5],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}

        {/* Transformation indicator */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '8px',
            color: personality.colors[2],
            fontWeight: 'bold'
          }}
          animate={{
            opacity: isMorphing ? 1 : 0,
            scale: isMorphing ? 1.2 : 0.8
          }}
        >
          ∼
        </motion.div>
      </animated.div>
    );
  };

  // Render appropriate creature based on type
  const renderCreature = () => {
    switch (type) {
      case 'dot':
        return <DotSprite />;
      case 'curvy':
        return <CurveCompanion />;
      case 'professor-hoot':
        return <ProfessorHoot />;
      case 'morphie':
        return <TopologyGuide />;
      default:
        return null;
    }
  };

  // Handle behavior changes
  useEffect(() => {
    switch (behavior) {
      case 'encourage':
        setCreatureState(prev => ({ ...prev, mood: 'encouraging' }));
        api.start({
          scale: 1.1,
          glow: 0.5,
          y: position.y - 5,
          config: { duration: 800 }
        });
        break;
      case 'hint':
        setCreatureState(prev => ({ ...prev, mood: 'wise' }));
        // Gentle pulsing to draw attention
        api.start({
          glow: 0.6,
          scale: 1.05,
          config: { duration: 500 },
          onRest: () => {
            api.start({ glow: 0, scale: 1, config: { duration: 500 } });
          }
        });
        break;
    }
  }, [behavior]);

  return (
    <AnimatePresence>
      {creatureState.isVisible && (
        <motion.div
          style={{
            position: 'absolute',
            zIndex: 99
          }}
          initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
          transition={{
            duration: 0.8,
            ease: 'backOut'
          }}
        >
          {renderCreature()}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Creature manager for orchestrating multiple creatures
type CreatureSpec = {
  type: 'dot' | 'curvy' | 'professor-hoot' | 'morphie';
  position: { x: number; y: number };
  behavior: 'guide' | 'demonstrate' | 'celebrate' | 'encourage' | 'hint';
};
export const CreatureManager: React.FC<{
  activeBehavior: string;
  mathContext: any;
  onCreatureInteraction?: (creature: string, action: string) => void;
}> = ({ activeBehavior, mathContext, onCreatureInteraction }) => {
  const [activeCreatures, setActiveCreatures] = useState<CreatureSpec[]>([]);

  useEffect(() => {
  // Activate appropriate creatures based on math context
  const newCreatures: CreatureSpec[] = [];

    if (mathContext.operation === 'point-addition') {
      newCreatures.push({
        type: 'dot' as const,
        position: { x: 100, y: 100 },
        behavior: 'demonstrate' as const
      });
    }

    if (mathContext.curveType === 'elliptic') {
      newCreatures.push({
        type: 'curvy' as const,
        position: { x: 200, y: 150 },
        behavior: 'guide' as const
      });
    }

    if (mathContext.hasEquation) {
      newCreatures.push({
        type: 'professor-hoot' as const,
        position: { x: 50, y: 50 },
        behavior: mathContext.errorState ? 'encourage' : 'hint' as const
      });
    }

    if (mathContext.topologyVisible) {
      newCreatures.push({
        type: 'morphie' as const,
        position: { x: 300, y: 200 },
        behavior: 'demonstrate' as const
      });
    }

    setActiveCreatures(newCreatures);
  }, [mathContext]);

  return (
    <div className="creature-manager">
      {activeCreatures.map((creature, index) => (
        <MathematicalCreatures
          key={`${creature.type}-${index}`}
          type={creature.type}
          position={creature.position}
          behavior={creature.behavior}
          mathContext={mathContext}
          onInteraction={onCreatureInteraction}
        />
      ))}
    </div>
  );
};

export default MathematicalCreatures;