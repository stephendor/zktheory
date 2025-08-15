'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import useMathematicalAnimation from '../hooks/useMathematicalAnimation';
import styles from './UnifiedBridgeOrchestrator.module.css';
import EllipticCurveToAlgebraTransform from './EllipticCurveToAlgebraTransform';
import AlgebraToTopologyTransform from './AlgebraToTopologyTransform';
import TopologyToEllipticTransform from './TopologyToEllipticTransform';
import { 
  BridgeTransformation, 
  BridgeTransformationState, 
  BridgeAnimationControls,
  ELLIPTIC_CURVE_DOMAIN,
  ABSTRACT_ALGEBRA_DOMAIN,
  TOPOLOGY_DOMAIN,
  TransformationType
} from './types';

interface UnifiedBridgeOrchestratorProps {
  initialTransformation?: TransformationType;
  autoPlay?: boolean;
  showControls?: boolean;
  onTransformationChange?: (transformation: BridgeTransformation) => void;
  onStateChange?: (state: BridgeTransformationState) => void;
  className?: string;
}

export const UnifiedBridgeOrchestrator: React.FC<UnifiedBridgeOrchestratorProps> = ({
  initialTransformation = 'elliptic-to-algebra',
  autoPlay = false,
  showControls = true,
  onTransformationChange,
  onStateChange,
  className = ''
}) => {
  // State management
  const [currentTransformation, setCurrentTransformation] = useState<BridgeTransformation | null>(null);
  const [transformationState, setTransformationState] = useState<BridgeTransformationState>({
    currentTransformation: null,
    currentStep: 0,
    isAnimating: false,
    progress: 0,
    direction: 'forward',
    speed: 1.0,
    isPaused: false
  });

  // Animation hooks
  const { useStepByStepAnimation } = useMathematicalAnimation;
  const stepAnimation = useStepByStepAnimation(
    currentTransformation?.steps.map(step => ({
      expression: step.mathematicalExpression || step.name,
      explanation: step.description
    })) || [],
    {
      duration: currentTransformation?.duration || 3000,
      delay: 200
    }
  );

  // Refs for animation control
  const animationControlsRef = useRef<BridgeAnimationControls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Predefined transformations
  const transformations: Record<TransformationType, BridgeTransformation> = {
    'elliptic-to-algebra': {
      id: 'elliptic-to-algebra',
      fromDomain: ELLIPTIC_CURVE_DOMAIN,
      toDomain: ABSTRACT_ALGEBRA_DOMAIN,
      transformationType: 'elliptic-to-algebra',
      duration: 4000,
      easing: 'golden',
      steps: [
        {
          id: 'step-1',
          name: 'Curve Definition',
          description: 'Start with elliptic curve y² = x³ + ax + b',
          mathematicalExpression: 'y^2 = x^3 + ax + b',
          duration: 800,
          delay: 0,
          visualTransition: {
            type: 'morph',
            properties: {
              from: { position: [0, 0], scale: [1, 1], opacity: 1 },
              to: { position: [0, 0], scale: [1.2, 1.2], opacity: 0.9 }
            },
            interpolation: 'mathematical-spline'
          }
        },
        {
          id: 'step-2',
          name: 'Point Addition Law',
          description: 'Define group operation: P + Q = R',
          mathematicalExpression: 'P + Q = R',
          duration: 1000,
          delay: 200,
          visualTransition: {
            type: 'composite',
            properties: {
              from: { position: [0, 0], scale: [1.2, 1.2], opacity: 0.9 },
              to: { position: [2, 0], scale: [1, 1], opacity: 0.8 }
            },
            interpolation: 'bezier'
          }
        },
        {
          id: 'step-3',
          name: 'Group Structure',
          description: 'Transform to abstract group table',
          mathematicalExpression: '(E, +)',
          duration: 1200,
          delay: 300,
          visualTransition: {
            type: 'morph',
            properties: {
              from: { position: [2, 0], scale: [1, 1], opacity: 0.8 },
              to: { position: [4, 0], scale: [0.8, 0.8], opacity: 1 }
            },
            interpolation: 'catmull-rom'
          }
        },
        {
          id: 'step-4',
          name: 'Algebraic Properties',
          description: 'Reveal group axioms and structure',
          mathematicalExpression: '∀P,Q,R ∈ E: (P+Q)+R = P+(Q+R)',
          duration: 1000,
          delay: 400,
          visualTransition: {
            type: 'fade',
            properties: {
              from: { position: [4, 0], scale: [0.8, 0.8], opacity: 1 },
              to: { position: [4, 0], scale: [1, 1], opacity: 1 }
            },
            interpolation: 'linear'
          }
        }
      ]
    },
    'algebra-to-topology': {
      id: 'algebra-to-topology',
      fromDomain: ABSTRACT_ALGEBRA_DOMAIN,
      toDomain: TOPOLOGY_DOMAIN,
      transformationType: 'algebra-to-topology',
      duration: 4500,
      easing: 'fibonacci',
      steps: [
        {
          id: 'step-1',
          name: 'Group Structure',
          description: 'Start with abstract group (G, ∘)',
          mathematicalExpression: '(G, ∘)',
          duration: 900,
          delay: 0,
          visualTransition: {
            type: 'scale',
            properties: {
              from: { position: [0, 0], scale: [1, 1], opacity: 1 },
              to: { position: [0, 0], scale: [1.1, 1.1], opacity: 0.9 }
            },
            interpolation: 'mathematical-spline'
          }
        },
        {
          id: 'step-2',
          name: 'Topology Introduction',
          description: 'Introduce topological structure',
          mathematicalExpression: 'τ: G → Top(X)',
          duration: 1100,
          delay: 200,
          visualTransition: {
            type: 'morph',
            properties: {
              from: { position: [0, 0], scale: [1.1, 1.1], opacity: 0.9 },
              to: { position: [1, 1, 0], scale: [1, 1, 1], opacity: 0.8 }
            },
            interpolation: 'bezier'
          }
        },
        {
          id: 'step-3',
          name: 'Continuous Actions',
          description: 'Group acts continuously on topological space',
          mathematicalExpression: 'g · x ∈ X ∀g ∈ G, x ∈ X',
          duration: 1200,
          delay: 300,
          visualTransition: {
            type: 'rotate',
            properties: {
              from: { position: [1, 1, 0], rotation: [0, 0, 0], opacity: 0.8 },
              to: { position: [2, 2, 1], rotation: [0, 0, 45], opacity: 0.7 }
            },
            interpolation: 'catmull-rom'
          }
        },
        {
          id: 'step-4',
          name: 'Topological Space',
          description: 'Complete transformation to topology',
          mathematicalExpression: '(X, τ, G)',
          duration: 1300,
          delay: 400,
          visualTransition: {
            type: 'composite',
            properties: {
              from: { position: [2, 2, 1], scale: [1, 1, 1], opacity: 0.7 },
              to: { position: [3, 3, 2], scale: [0.9, 0.9, 0.9], opacity: 1 }
            },
            interpolation: 'mathematical-spline'
          }
        }
      ]
    },
    'topology-to-elliptic': {
      id: 'topology-to-elliptic',
      fromDomain: TOPOLOGY_DOMAIN,
      toDomain: ELLIPTIC_CURVE_DOMAIN,
      transformationType: 'topology-to-elliptic',
      duration: 4200,
      easing: 'harmonic',
      steps: [
        {
          id: 'step-1',
          name: 'Topological Space',
          description: 'Begin with topological space (X, τ)',
          mathematicalExpression: '(X, τ)',
          duration: 850,
          delay: 0,
          visualTransition: {
            type: 'translate',
            properties: {
              from: { position: [0, 0, 0], scale: [1, 1, 1], opacity: 1 },
              to: { position: [0.5, 0.5, 0], scale: [1.05, 1.05, 1], opacity: 0.95 }
            },
            interpolation: 'linear'
          }
        },
        {
          id: 'step-2',
          name: 'Geometric Structure',
          description: 'Introduce differential geometric structure',
          mathematicalExpression: '∇: TM → T*M ⊗ TM',
          duration: 1050,
          delay: 200,
          visualTransition: {
            type: 'morph',
            properties: {
              from: { position: [0.5, 0.5, 0], scale: [1.05, 1.05, 1], opacity: 0.95 },
              to: { position: [1, 0, 0], scale: [1, 1], opacity: 0.9 }
            },
            interpolation: 'bezier'
          }
        },
        {
          id: 'step-3',
          name: 'Curve Emergence',
          description: 'Algebraic curve emerges from geometry',
          mathematicalExpression: 'f(x,y) = 0',
          duration: 1150,
          delay: 300,
          visualTransition: {
            type: 'composite',
            properties: {
              from: { position: [1, 0, 0], scale: [1, 1], opacity: 0.9 },
              to: { position: [2, -1], scale: [0.95, 0.95], opacity: 0.85 }
            },
            interpolation: 'catmull-rom'
          }
        },
        {
          id: 'step-4',
          name: 'Elliptic Curve',
          description: 'Complete transformation to elliptic curve',
          mathematicalExpression: 'y^2 = x^3 + ax + b',
          duration: 1150,
          delay: 400,
          visualTransition: {
            type: 'morph',
            properties: {
              from: { position: [2, -1], scale: [0.95, 0.95], opacity: 0.85 },
              to: { position: [3, -2], scale: [1, 1], opacity: 1 }
            },
            interpolation: 'mathematical-spline'
          }
        }
      ]
    },
    'bidirectional': {
      id: 'bidirectional',
      fromDomain: ELLIPTIC_CURVE_DOMAIN,
      toDomain: ELLIPTIC_CURVE_DOMAIN,
      transformationType: 'bidirectional',
      duration: 12000,
      easing: 'golden',
      steps: [] // Will combine all other transformations
    }
  };

  // Animation controls implementation
  const createAnimationControls = useCallback((): BridgeAnimationControls => {
    return {
      play: () => {
        setTransformationState(prev => ({ ...prev, isAnimating: true, isPaused: false }));
        stepAnimation.play();
      },
      pause: () => {
        setTransformationState(prev => ({ ...prev, isPaused: true }));
        stepAnimation.pause();
      },
      stop: () => {
        setTransformationState(prev => ({ ...prev, isAnimating: false, isPaused: false, progress: 0 }));
        stepAnimation.reset();
      },
      reset: () => {
        setTransformationState(prev => ({ ...prev, currentStep: 0, progress: 0, isAnimating: false }));
        stepAnimation.reset();
      },
      goToStep: (stepIndex: number) => {
        stepAnimation.goToStep(stepIndex);
        setTransformationState(prev => ({ ...prev, currentStep: stepIndex }));
      },
      setSpeed: (speed: number) => {
        setTransformationState(prev => ({ ...prev, speed }));
      },
      reverse: () => {
        setTransformationState(prev => ({ 
          ...prev, 
          direction: prev.direction === 'forward' ? 'reverse' : 'forward' 
        }));
      },
      getCurrentState: () => transformationState
    };
  }, [stepAnimation, transformationState]);

  // Initialize transformation
  useEffect(() => {
    const transformation = transformations[initialTransformation];
    setCurrentTransformation(transformation);
    setTransformationState(prev => ({ 
      ...prev, 
      currentTransformation: transformation 
    }));
    
    if (onTransformationChange) {
      onTransformationChange(transformation);
    }
  }, [initialTransformation, onTransformationChange]);

  // Update animation controls
  useEffect(() => {
    animationControlsRef.current = createAnimationControls();
  }, [createAnimationControls]);

  // Sync step animation state
  useEffect(() => {
    setTransformationState(prev => ({
      ...prev,
      currentStep: stepAnimation.currentStep,
      isAnimating: stepAnimation.isPlaying,
      progress: stepAnimation.progress
    }));
    
    // Update progress bar width
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${stepAnimation.progress}%`;
    }
  }, [stepAnimation.currentStep, stepAnimation.isPlaying, stepAnimation.progress]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && currentTransformation && !transformationState.isAnimating) {
      animationControlsRef.current?.play();
    }
  }, [autoPlay, currentTransformation, transformationState.isAnimating]);

  // State change callback
  useEffect(() => {
    if (onStateChange) {
      onStateChange(transformationState);
    }
  }, [transformationState, onStateChange]);

  // Transformation type change handler
  const handleTransformationChange = useCallback((type: TransformationType) => {
    const newTransformation = transformations[type];
    setCurrentTransformation(newTransformation);
    setTransformationState(prev => ({ 
      ...prev, 
      currentTransformation: newTransformation,
      currentStep: 0,
      progress: 0,
      isAnimating: false
    }));
    
    if (onTransformationChange) {
      onTransformationChange(newTransformation);
    }
  }, [onTransformationChange]);

  return (
    <div 
      ref={containerRef}
      className={`${styles['unified-bridge-orchestrator']} ${className}`}
    >
      {/* Transformation Selector */}
      <div className={styles['transformation-selector']}>
        <label>
          Transformation Type:
        </label>
        <select
          value={currentTransformation?.transformationType || ''}
          onChange={(e) => handleTransformationChange(e.target.value as TransformationType)}
          title="Select transformation type"
        >
          <option value="elliptic-to-algebra">Elliptic Curves → Abstract Algebra</option>
          <option value="algebra-to-topology">Abstract Algebra → Topology</option>
          <option value="topology-to-elliptic">Topology → Elliptic Curves</option>
          <option value="bidirectional">Complete Cycle</option>
        </select>
      </div>

      {/* Current Step Display */}
      {stepAnimation.currentData && (
        <div className={styles['current-step-display']}>
          <h3>
            Step {stepAnimation.currentStep + 1}: {stepAnimation.currentData.expression}
          </h3>
          {stepAnimation.currentData.explanation && (
            <p>{stepAnimation.currentData.explanation}</p>
          )}
        </div>
      )}

      {/* Progress Indicator */}
      <div className={styles['progress-indicator']}>
        <div className={styles['progress-header']}>
          <span>Progress</span>
          <span>{Math.round(stepAnimation.progress)}%</span>
        </div>
        <div className={styles['progress-bar-container']}>
          <div 
            ref={progressBarRef}
            className={styles['progress-bar']}
          />
        </div>
      </div>

      {/* Transformation Component Renderer */}
      <div className={styles['transformation-display']}>
        {currentTransformation?.transformationType === 'elliptic-to-algebra' && (
          <EllipticCurveToAlgebraTransform
            curveParams={{ a: -1, b: 1 }}
            width={800}
            height={600}
            animationDuration={3600}
            onTransformationStep={(step, data) => {
              console.log('Elliptic to Algebra step:', step, data);
            }}
          />
        )}
        
        {currentTransformation?.transformationType === 'algebra-to-topology' && (
          <AlgebraToTopologyTransform
            groupSize={6}
            width={800}
            height={600}
            animationDuration={4000}
            onTransformationStep={(step, data) => {
              console.log('Algebra to Topology step:', step, data);
            }}
          />
        )}
        
        {currentTransformation?.transformationType === 'topology-to-elliptic' && (
          <TopologyToEllipticTransform
            manifoldComplexity={6}
            width={800}
            height={600}
            animationDuration={4200}
            onTransformationStep={(step, data) => {
              console.log('Topology to Elliptic step:', step, data);
            }}
          />
        )}
        
        {currentTransformation?.transformationType === 'bidirectional' && (
          <div className={styles['bidirectional-display']}>
            <div className={styles['cycle-component']}>
              <EllipticCurveToAlgebraTransform
                curveParams={{ a: -1, b: 1 }}
                width={600}
                height={400}
                animationDuration={3600}
              />
            </div>
            <div className={styles['cycle-component']}>
              <AlgebraToTopologyTransform
                groupSize={4}
                width={600}
                height={400}
                animationDuration={4000}
              />
            </div>
            <div className={styles['cycle-component']}>
              <TopologyToEllipticTransform
                manifoldComplexity={4}
                width={600}
                height={400}
                animationDuration={4200}
              />
            </div>
          </div>
        )}
      </div>

      {/* Animation Controls */}
      {showControls && (
        <div className={styles['animation-controls']}>
          <button
            onClick={() => animationControlsRef.current?.play()}
            disabled={stepAnimation.isPlaying}
            className={`${styles['control-button']} ${styles.play}`}
          >
            ▶️ Play
          </button>
          <button
            onClick={() => animationControlsRef.current?.pause()}
            disabled={!stepAnimation.isPlaying}
            className={`${styles['control-button']} ${styles.pause}`}
          >
            ⏸️ Pause
          </button>
          <button
            onClick={() => animationControlsRef.current?.stop()}
            className={`${styles['control-button']} ${styles.stop}`}
          >
            ⏹️ Stop
          </button>
          <button
            onClick={() => animationControlsRef.current?.reset()}
            className={`${styles['control-button']} ${styles.reset}`}
          >
            🔄 Reset
          </button>
        </div>
      )}

      {/* Step Navigation */}
      <div className={styles['step-navigation']}>
        <button
          onClick={() => stepAnimation.previousStep()}
          disabled={!stepAnimation.canGoPrevious}
          className={styles['step-nav-button']}
        >
          ← Previous
        </button>
        <span className={styles['step-counter']}>
          {stepAnimation.currentStep + 1} / {stepAnimation.totalSteps}
        </span>
        <button
          onClick={() => stepAnimation.nextStep()}
          disabled={!stepAnimation.canGoNext}
          className={styles['step-nav-button']}
        >
          Next →
        </button>
      </div>

      {/* Transformation Status */}
      <div className={styles['transformation-status']}>
        <div>Status: {transformationState.isAnimating ? 'Animating' : 'Stopped'}</div>
        <div>Direction: {transformationState.direction}</div>
        <div>Speed: {transformationState.speed}x</div>
      </div>
    </div>
  );
};

export default UnifiedBridgeOrchestrator;
