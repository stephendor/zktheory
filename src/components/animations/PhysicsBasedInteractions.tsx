import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { animated, useSpringValue } from '@react-spring/web';

interface PhysicsProps {
  children: React.ReactNode;
  physicsType: 'magnetic' | 'elastic' | 'fluid' | 'gravitational' | 'harmonic';
  mathContext: {
    significance: number;
    isValid: boolean;
    operation?: string;
    relationships?: string[];
  };
  onPhysicsInteraction?: (type: string, data: any) => void;
}

interface PhysicsState {
  mass: number;
  charge: number;
  elasticity: number;
  viscosity: number;
  resonance: number;
}

export const PhysicsBasedInteractions: React.FC<PhysicsProps> = ({
  children,
  physicsType,
  mathContext,
  onPhysicsInteraction
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [physicsState, setPhysicsState] = useState<PhysicsState>({
    mass: 1 + mathContext.significance,
    charge: mathContext.isValid ? 1 : -0.5,
    elasticity: 0.8,
    viscosity: 0.3,
    resonance: mathContext.significance
  });

  // Physics simulation values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useSpringValue(1);
  const rotation = useSpringValue(0);
  const magneticField = useSpringValue(0);
  const harmonicOscillation = useSpringValue(0);

  // Mathematical physics constants
  const physicsConstants = {
    magnetic: {
      attractionStrength: mathContext.significance * 2,
      fieldDecay: 0.95,
      snapDistance: 30,
      resonanceFrequency: 1.2
    },
    elastic: {
      tension: 280,
      friction: 60,
      mass: physicsState.mass,
      dampening: 0.8
    },
    fluid: {
      viscosity: physicsState.viscosity,
      density: 1.2,
      flowResistance: 0.3,
      buoyancy: mathContext.significance * 0.5
    },
    gravitational: {
      gravitationalConstant: 6.67,
      mass: physicsState.mass,
      attractionRadius: 100,
      orbitalVelocity: 0.5
    },
    harmonic: {
      frequency: physicsState.resonance * 2,
      amplitude: 10,
      dampening: 0.95,
      phase: 0
    }
  };

  // Magnetic point interactions
  const MagneticPhysics = () => {
    const [magneticSources, setMagneticSources] = useState<Array<{
      x: number;
      y: number;
      charge: number;
      strength: number;
    }>>([]);

    const calculateMagneticForce = useCallback((mouseX: number, mouseY: number, elementX: number, elementY: number) => {
      const dx = mouseX - elementX;
      const dy = mouseY - elementY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance === 0) return { fx: 0, fy: 0, field: 0 };
      
      const force = (physicsConstants.magnetic.attractionStrength * physicsState.charge) / (distance * distance);
      const fieldStrength = Math.max(0, 1 - distance / physicsConstants.magnetic.snapDistance);
      
      return {
        fx: (dx / distance) * force,
        fy: (dy / distance) * force,
        field: fieldStrength
      };
    }, [physicsState.charge]);

    const gestures = useGesture({
      onMove: ({ xy: [mouseX, mouseY] }) => {
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const elementX = rect.left + rect.width / 2;
        const elementY = rect.top + rect.height / 2;
        
        const { fx, fy, field } = calculateMagneticForce(mouseX, mouseY, elementX, elementY);
        
        // Apply magnetic attraction
        x.set(x.get() + fx * 0.1);
        y.set(y.get() + fy * 0.1);
        magneticField.start(field);
        
        // Visual feedback for magnetic field strength
        if (field > 0.7) {
          onPhysicsInteraction?.('magnetic-attraction', {
            strength: field,
            isSnapping: field > 0.9
          });
        }
      },

      onDrag: ({ movement: [mx, my], velocity: [vx, vy], down }) => {
        if (down) {
          // Point feels "connected" during drag
          x.set(mx * physicsState.elasticity);
          y.set(my * physicsState.elasticity);
          scale.start(1.1);
          
          // Magnetic trail effect
          if (Math.abs(vx) > 50 || Math.abs(vy) > 50) {
            createMagneticTrail(mx, my);
          }
        } else {
          // Elastic snap back with mathematical precision
          x.set(0);
          y.set(0);
          scale.start(1);
          magneticField.start(0);
        }
      }
    });

    const createMagneticTrail = (x: number, y: number) => {
      // Implementation would create visual trail particles
      onPhysicsInteraction?.('magnetic-trail', { x, y, velocity: Math.sqrt(x*x + y*y) });
    };

    return gestures;
  };

  // Elastic curve deformations
  const ElasticPhysics = () => {
    const [tension, setTension] = useState(physicsConstants.elastic.tension);
    const [deformation, setDeformation] = useState({ x: 0, y: 0 });

    const gestures = useGesture({
      onDrag: ({ movement: [mx, my], velocity: [vx, vy], down, force }) => {
        if (down) {
          // Calculate elastic resistance based on distance
          const distance = Math.sqrt(mx * mx + my * my);
          const resistance = Math.min(distance / 100, 1);
          const elasticForce = resistance * resistance; // Quadratic resistance
          
          // Apply deformation with resistance
          const dampedX = mx * (1 - elasticForce * 0.5);
          const dampedY = my * (1 - elasticForce * 0.5);
          
          x.set(dampedX);
          y.set(dampedY);
          setDeformation({ x: dampedX, y: dampedY });
          
          // Visual feedback for elastic strain
          scale.start(1 + resistance * 0.2);
          
          // Elastic strain visualization
          if (resistance > 0.8) {
            onPhysicsInteraction?.('elastic-strain', {
              resistance,
              approaching_limit: resistance > 0.9
            });
          }
        } else {
          // Natural elastic settling with overshoot
          const settleX = -deformation.x * 0.1;
          const settleY = -deformation.y * 0.1;
          
          x.set(settleX);
          y.set(settleY);
          
          // Gradual return to equilibrium
          setTimeout(() => {
            x.set(0);
            y.set(0);
            scale.start(1);
            setDeformation({ x: 0, y: 0 });
          }, 200);
        }
      },

      onPinch: ({ offset: [scale], direction: [dx, dy] }) => {
        // Elastic scaling feels like stretching material
        const elasticScale = 1 + (scale - 1) * physicsState.elasticity;
        setTension(physicsConstants.elastic.tension * elasticScale);
        
        onPhysicsInteraction?.('elastic-scaling', {
          scale: elasticScale,
          tension: tension
        });
      }
    });

    return gestures;
  };

  // Fluid mathematical flows
  const FluidPhysics = () => {
    const [flowVelocity, setFlowVelocity] = useState({ vx: 0, vy: 0 });
    const [turbulence, setTurbulence] = useState(0);

    const gestures = useGesture({
      onDrag: ({ movement: [mx, my], velocity: [vx, vy], down }) => {
        if (down) {
          // Fluid resistance based on velocity
          const speed = Math.sqrt(vx * vx + vy * vy);
          const dragForce = speed * physicsConstants.fluid.viscosity;
          
          // Apply fluid motion with drag
          const fluidX = mx * (1 - dragForce * 0.01);
          const fluidY = my * (1 - dragForce * 0.01);
          
          x.set(fluidX);
          y.set(fluidY);
          setFlowVelocity({ vx, vy });
          
          // Turbulence based on rapid direction changes
          if (speed > 100) {
            setTurbulence(Math.min(speed / 200, 1));
            createFluidTurbulence(mx, my, vx, vy);
          }
        } else {
          // Fluid settling with momentum conservation
          const momentum = Math.sqrt(flowVelocity.vx * flowVelocity.vx + flowVelocity.vy * flowVelocity.vy);
          const settleDistance = momentum * 0.1;
          
          x.set(flowVelocity.vx * settleDistance * 0.01);
          y.set(flowVelocity.vy * settleDistance * 0.01);
          
          // Gradual dissipation
          setTimeout(() => {
            x.set(0);
            y.set(0);
            setFlowVelocity({ vx: 0, vy: 0 });
            setTurbulence(0);
          }, 500);
        }
      }
    });

    const createFluidTurbulence = (x: number, y: number, vx: number, vy: number) => {
      onPhysicsInteraction?.('fluid-turbulence', {
        position: { x, y },
        velocity: { vx, vy },
        intensity: turbulence
      });
    };

    return gestures;
  };

  // Gravitational mathematical structures
  const GravitationalPhysics = () => {
    const [orbitalElements, setOrbitalElements] = useState<Array<{
      id: string;
      distance: number;
      angle: number;
      velocity: number;
    }>>([]);

    useEffect(() => {
      // Create gravitational field around mathematically significant elements
      if (mathContext.significance > 0.7) {
        const orbits = mathContext.relationships?.map((rel, i) => ({
          id: `orbit-${i}`,
          distance: 50 + i * 20,
          angle: (i * 60) * (Math.PI / 180),
          velocity: physicsConstants.gravitational.orbitalVelocity / (1 + i * 0.3)
        })) || [];
        
        setOrbitalElements(orbits);
      }
    }, [mathContext.significance, mathContext.relationships]);

    const gestures = useGesture({
      onMove: ({ xy: [mouseX, mouseY] }) => {
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Gravitational attraction (inverse square law)
        if (distance < physicsConstants.gravitational.attractionRadius) {
          const gravitationalForce = (physicsConstants.gravitational.gravitationalConstant * physicsState.mass) / (distance * distance);
          const pullX = (dx / distance) * gravitationalForce * 0.1;
          const pullY = (dy / distance) * gravitationalForce * 0.1;
          
          x.set(x.get() + pullX);
          y.set(y.get() + pullY);
          
          onPhysicsInteraction?.('gravitational-pull', {
            force: gravitationalForce,
            distance: distance
          });
        }
      },

      onDrag: ({ down, movement: [mx, my] }) => {
        if (down) {
          // Massive objects resist movement
          const inertialX = mx / physicsState.mass;
          const inertialY = my / physicsState.mass;
          
          x.set(inertialX);
          y.set(inertialY);
          scale.start(1 + physicsState.mass * 0.1);
        } else {
          // Return to gravitational equilibrium
          x.set(0);
          y.set(0);
          scale.start(1);
        }
      }
    });

    return gestures;
  };

  // Harmonic mathematical resonance
  const HarmonicPhysics = () => {
    const [resonancePhase, setResonancePhase] = useState(0);
    const [harmonics, setHarmonics] = useState<number[]>([]);

    useEffect(() => {
      // Set up harmonic oscillation
      const interval = setInterval(() => {
        const newPhase = (resonancePhase + 0.1) % (2 * Math.PI);
        setResonancePhase(newPhase);
        
        // Calculate harmonic position
        const oscillation = Math.sin(newPhase * physicsConstants.harmonic.frequency) * physicsConstants.harmonic.amplitude;
        harmonicOscillation.start(oscillation);
        
        // Generate harmonic series for mathematical relationships
        if (mathContext.relationships && mathContext.relationships.length > 0) {
          const newHarmonics = mathContext.relationships.map((_, i) => 
            Math.sin(newPhase * (i + 1)) * (physicsConstants.harmonic.amplitude / (i + 1))
          );
          setHarmonics(newHarmonics);
        }
      }, 50);

      return () => clearInterval(interval);
    }, [resonancePhase, mathContext.relationships]);

    const gestures = useGesture({
      onDrag: ({ movement: [mx, my], down }) => {
        if (down) {
          // Driving frequency affects resonance
          const drivingFreq = Math.sqrt(mx * mx + my * my) * 0.01;
          const resonanceRatio = drivingFreq / physicsConstants.harmonic.frequency;
          
          // Maximum amplitude at resonance
          if (Math.abs(resonanceRatio - 1) < 0.1) {
            scale.start(1.5);
            onPhysicsInteraction?.('harmonic-resonance', {
              resonanceRatio,
              amplitude: 'maximum'
            });
          } else {
            scale.start(1 + Math.abs(mx + my) * 0.001);
          }
          
          x.set(mx * 0.5);
          y.set(my * 0.5);
        } else {
          // Return to natural harmonic motion
          scale.start(1);
          x.set(0);
          y.set(0);
        }
      },

      onMove: ({ movement: [mx, my] }) => {
        // Sympathetic vibration from nearby motion
        const disturbance = Math.sqrt(mx * mx + my * my) * 0.001;
        const sympatheticOscillation = Math.sin(resonancePhase * 2) * disturbance;
        
        y.set(sympatheticOscillation);
      }
    });

    return gestures;
  };

  // Get appropriate physics handler
  const getPhysicsHandler = () => {
    switch (physicsType) {
      case 'magnetic':
        return MagneticPhysics();
      case 'elastic':
        return ElasticPhysics();
      case 'fluid':
        return FluidPhysics();
      case 'gravitational':
        return GravitationalPhysics();
      case 'harmonic':
        return HarmonicPhysics();
      default:
        return {};
    }
  };

  const physicsHandlers = getPhysicsHandler();

  // Visual effects based on physics type
  const getPhysicsVisualization = () => {
    const visualizations = {
      magnetic: {
        filter: `drop-shadow(0 0 ${magneticField.get() * 15}px rgba(79, 172, 254, 0.8))`,
        background: `radial-gradient(circle, rgba(79, 172, 254, ${magneticField.get() * 0.3}) 0%, transparent 70%)`
      },
      elastic: {
        filter: `blur(${Math.abs(x.get()) * 0.01}px)`,
        borderRadius: `${50 + Math.abs(x.get() + y.get()) * 0.1}%`
      },
      fluid: {
        filter: `blur(${Math.min(Math.abs(x.get()) * 0.005, 2)}px)`,
        background: `linear-gradient(${Math.atan2(y.get(), x.get()) * 180 / Math.PI}deg, rgba(79, 172, 254, 0.3) 0%, transparent 70%)`
      },
      gravitational: {
        filter: `drop-shadow(0 0 ${physicsState.mass * 5}px rgba(255, 215, 0, 0.6))`,
        transform: `scale(${1 + physicsState.mass * 0.1})`
      },
      harmonic: {
        filter: `hue-rotate(${resonancePhase * 180 / Math.PI}deg)`,
        transform: `translateY(${harmonicOscillation.get()}px)`
      }
    };

    return visualizations[physicsType] || {};
  };

  return (
    <div
      ref={containerRef}
      {...physicsHandlers}
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor: 'grab',
        touchAction: 'none'
      }}
    >
      <motion.div
        style={{
          x,
          y,
          scale,
          rotate: rotation,
          ...getPhysicsVisualization()
        }}
        transition={{
          type: 'spring',
          stiffness: physicsConstants[physicsType]?.tension || 300,
          damping: physicsConstants[physicsType]?.friction || 30,
          mass: physicsState.mass
        }}
      >
        {children}
      </motion.div>

      {/* Physics field visualization overlay */}
      {physicsType === 'magnetic' && (
        <animated.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            border: '2px solid rgba(79, 172, 254, 0.3)',
            pointerEvents: 'none',
            opacity: magneticField.to(field => field * 0.8),
            scale: magneticField.to(field => 1 + field * 0.5)
          }}
        />
      )}

      {/* Harmonic visualization */}
      {physicsType === 'harmonic' && harmonics.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)' }}>
          {harmonics.map((amplitude, i) => (
            <motion.div
              key={i}
              style={{
                width: '2px',
                height: `${Math.abs(amplitude) * 2}px`,
                background: `hsl(${200 + i * 30}, 70%, 60%)`,
                margin: '0 2px',
                display: 'inline-block'
              }}
              animate={{
                height: `${Math.abs(amplitude) * 2}px`,
                opacity: 0.7 + Math.abs(amplitude) * 0.03
              }}
            />
          ))}
        </div>
      )}

      {/* Physics state indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            left: '0',
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.7)',
            pointerEvents: 'none'
          }}
        >
          {physicsType}: m={physicsState.mass.toFixed(1)} q={physicsState.charge.toFixed(1)}
        </div>
      )}
    </div>
  );
};

// Specialized physics components for different mathematical elements
export const MagneticPoint: React.FC<{
  children: React.ReactNode;
  significance: number;
  onMagneticInteraction?: (data: any) => void;
}> = ({ children, significance, onMagneticInteraction }) => (
  <PhysicsBasedInteractions
    physicsType="magnetic"
    mathContext={{
      significance,
      isValid: true,
      operation: 'point-interaction'
    }}
    onPhysicsInteraction={onMagneticInteraction}
  >
    {children}
  </PhysicsBasedInteractions>
);

export const ElasticCurve: React.FC<{
  children: React.ReactNode;
  flexibility: number;
  onElasticInteraction?: (data: any) => void;
}> = ({ children, flexibility, onElasticInteraction }) => (
  <PhysicsBasedInteractions
    physicsType="elastic"
    mathContext={{
      significance: flexibility,
      isValid: true,
      operation: 'curve-deformation'
    }}
    onPhysicsInteraction={onElasticInteraction}
  >
    {children}
  </PhysicsBasedInteractions>
);

export const FluidEquation: React.FC<{
  children: React.ReactNode;
  viscosity: number;
  onFluidInteraction?: (data: any) => void;
}> = ({ children, viscosity, onFluidInteraction }) => (
  <PhysicsBasedInteractions
    physicsType="fluid"
    mathContext={{
      significance: 1 - viscosity,
      isValid: true,
      operation: 'equation-flow'
    }}
    onPhysicsInteraction={onFluidInteraction}
  >
    {children}
  </PhysicsBasedInteractions>
);

export const GravitationalStructure: React.FC<{
  children: React.ReactNode;
  mass: number;
  relationships: string[];
  onGravitationalInteraction?: (data: any) => void;
}> = ({ children, mass, relationships, onGravitationalInteraction }) => (
  <PhysicsBasedInteractions
    physicsType="gravitational"
    mathContext={{
      significance: mass,
      isValid: true,
      operation: 'structural-gravity',
      relationships
    }}
    onPhysicsInteraction={onGravitationalInteraction}
  >
    {children}
  </PhysicsBasedInteractions>
);

export const HarmonicResonance: React.FC<{
  children: React.ReactNode;
  frequency: number;
  relationships: string[];
  onHarmonicInteraction?: (data: any) => void;
}> = ({ children, frequency, relationships, onHarmonicInteraction }) => (
  <PhysicsBasedInteractions
    physicsType="harmonic"
    mathContext={{
      significance: frequency,
      isValid: true,
      operation: 'harmonic-resonance',
      relationships
    }}
    onPhysicsInteraction={onHarmonicInteraction}
  >
    {children}
  </PhysicsBasedInteractions>
);

export default PhysicsBasedInteractions;