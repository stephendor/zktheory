/**
 * MathematicalBridgeContext.tsx
 * 
 * Task 7.3: Cross-Task Integration - Unified Context Provider
 * 
 * Provides shared state and communication layer between:
 * - Task 7.1: Bridge Transformations (UnifiedBridgeOrchestrator)
 * - Task 7.2: Concept Mapping (MathematicalConceptGraph)
 * 
 * Features:
 * - Synchronized mathematical domain state
 * - Cross-component event communication
 * - Shared concept highlighting and animation triggers
 * - Unified mathematical context management
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { MathematicalConcept, ConceptCategory } from '../ConceptMapping/types';
import { BridgeTransformation, TransformationType, BridgeTransformationState } from '../BridgeTransformations/types';

// Mathematical Domain Types
export type MathematicalDomain = 'elliptic-curves' | 'abstract-algebra' | 'topology';

// Integration Event Types
export interface ConceptSelectionEvent {
  concept: MathematicalConcept;
  source: 'concept-graph' | 'bridge-transformation';
  timestamp: number;
}

export interface TransformationEvent {
  transformation: BridgeTransformation;
  state: BridgeTransformationState;
  source: 'bridge-orchestrator' | 'concept-trigger';
  timestamp: number;
}

export interface DomainChangeEvent {
  fromDomain: MathematicalDomain;
  toDomain: MathematicalDomain;
  source: 'user-interaction' | 'animation-sequence';
  timestamp: number;
}

// Context State Interface
export interface MathematicalBridgeState {
  // Current Mathematical Context
  activeDomain: MathematicalDomain;
  selectedConcept: MathematicalConcept | null;
  highlightedConcepts: string[]; // concept IDs
  
  // Bridge Transformation State
  currentTransformation: BridgeTransformation | null;
  transformationState: BridgeTransformationState | null;
  isTransformationActive: boolean;
  
  // Concept Graph State
  focusedConceptCategory: ConceptCategory | null;
  learningPathActive: boolean;
  learningPathNodes: string[];
  
  // Integration State
  synchronizationEnabled: boolean;
  autoTriggerAnimations: boolean;
  crossHighlightingEnabled: boolean;
}

// Context Actions Interface  
export interface MathematicalBridgeActions {
  // Domain Management
  setActiveDomain: (domain: MathematicalDomain) => void;
  
  // Concept Management
  selectConcept: (concept: MathematicalConcept | null, source?: string) => void;
  highlightConcepts: (conceptIds: string[], source?: string) => void;
  clearHighlights: () => void;
  
  // Bridge Transformation Management
  triggerTransformation: (type: TransformationType, source?: string) => void;
  updateTransformationState: (state: BridgeTransformationState) => void;
  
  // Integration Control
  setSynchronizationEnabled: (enabled: boolean) => void;
  setAutoTriggerAnimations: (enabled: boolean) => void;
  setCrossHighlightingEnabled: (enabled: boolean) => void;
  
  // Event Handlers
  onConceptSelection: (handler: (event: ConceptSelectionEvent) => void) => () => void;
  onTransformationChange: (handler: (event: TransformationEvent) => void) => () => void;
  onDomainChange: (handler: (event: DomainChangeEvent) => void) => () => void;
}

// Complete Context Interface
export interface MathematicalBridgeContextType extends MathematicalBridgeState, MathematicalBridgeActions {}

// Create Context
const MathematicalBridgeContext = createContext<MathematicalBridgeContextType | null>(null);

// Context Provider Props
export interface MathematicalBridgeProviderProps {
  children: React.ReactNode;
  initialDomain?: MathematicalDomain;
  synchronizationEnabled?: boolean;
}

// Context Provider Component
export const MathematicalBridgeProvider: React.FC<MathematicalBridgeProviderProps> = ({
  children,
  initialDomain = 'elliptic-curves',
  synchronizationEnabled = true
}) => {
  // State Management
  const [state, setState] = useState<MathematicalBridgeState>({
    activeDomain: initialDomain,
    selectedConcept: null,
    highlightedConcepts: [],
    currentTransformation: null,
    transformationState: null,
    isTransformationActive: false,
    focusedConceptCategory: null,
    learningPathActive: false,
    learningPathNodes: [],
    synchronizationEnabled,
    autoTriggerAnimations: true,
    crossHighlightingEnabled: true
  });

  // Event Handler Management
  const conceptSelectionHandlers = useRef<((event: ConceptSelectionEvent) => void)[]>([]);
  const transformationHandlers = useRef<((event: TransformationEvent) => void)[]>([]);
  const domainChangeHandlers = useRef<((event: DomainChangeEvent) => void)[]>([]);

  // Domain Management
  const setActiveDomain = useCallback((domain: MathematicalDomain) => {
    const previousDomain = state.activeDomain;
    setState(prev => ({ ...prev, activeDomain: domain }));

    // Emit domain change event
    const event: DomainChangeEvent = {
      fromDomain: previousDomain,
      toDomain: domain,
      source: 'user-interaction',
      timestamp: Date.now()
    };

    domainChangeHandlers.current.forEach(handler => handler(event));
  }, [state.activeDomain]);

  // Concept Management
  const selectConcept = useCallback((concept: MathematicalConcept | null, source = 'user-interaction') => {
    setState(prev => ({ ...prev, selectedConcept: concept }));

    if (concept) {
      const event: ConceptSelectionEvent = {
        concept,
        source: source as 'concept-graph' | 'bridge-transformation',
        timestamp: Date.now()
      };

      conceptSelectionHandlers.current.forEach(handler => handler(event));

      // Auto-trigger related transformations if enabled
      if (state.autoTriggerAnimations && state.synchronizationEnabled) {
        triggerRelatedTransformation(concept);
      }
    }
  }, [state.autoTriggerAnimations, state.synchronizationEnabled]);

  const highlightConcepts = useCallback((conceptIds: string[], source = 'user-interaction') => {
    setState(prev => ({ ...prev, highlightedConcepts: conceptIds }));
  }, []);

  const clearHighlights = useCallback(() => {
    setState(prev => ({ ...prev, highlightedConcepts: [] }));
  }, []);

  // Bridge Transformation Management
  const triggerTransformation = useCallback((type: TransformationType, source = 'user-interaction') => {
    // This will be handled by the Bridge Orchestrator component
    // We just update the state to indicate a transformation was requested
    setState(prev => ({ 
      ...prev, 
      isTransformationActive: true 
    }));

    console.log(`Transformation triggered: ${type} from ${source}`);
  }, []);

  const updateTransformationState = useCallback((transformationState: BridgeTransformationState) => {
    setState(prev => ({ 
      ...prev, 
      transformationState,
      isTransformationActive: transformationState.isAnimating
    }));

    // Emit transformation event
    if (transformationState.currentTransformation) {
      const event: TransformationEvent = {
        transformation: transformationState.currentTransformation,
        state: transformationState,
        source: 'bridge-orchestrator',
        timestamp: Date.now()
      };

      transformationHandlers.current.forEach(handler => handler(event));

      // Update highlighted concepts based on transformation
      if (state.crossHighlightingEnabled && state.synchronizationEnabled) {
        updateConceptHighlightsFromTransformation(transformationState.currentTransformation);
      }
    }
  }, [state.crossHighlightingEnabled, state.synchronizationEnabled]);

  // Integration Control
  const setSynchronizationEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, synchronizationEnabled: enabled }));
  }, []);

  const setAutoTriggerAnimations = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, autoTriggerAnimations: enabled }));
  }, []);

  const setCrossHighlightingEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, crossHighlightingEnabled: enabled }));
  }, []);

  // Event Handler Registration
  const onConceptSelection = useCallback((handler: (event: ConceptSelectionEvent) => void) => {
    conceptSelectionHandlers.current.push(handler);
    return () => {
      const index = conceptSelectionHandlers.current.indexOf(handler);
      if (index > -1) {
        conceptSelectionHandlers.current.splice(index, 1);
      }
    };
  }, []);

  const onTransformationChange = useCallback((handler: (event: TransformationEvent) => void) => {
    transformationHandlers.current.push(handler);
    return () => {
      const index = transformationHandlers.current.indexOf(handler);
      if (index > -1) {
        transformationHandlers.current.splice(index, 1);
      }
    };
  }, []);

  const onDomainChange = useCallback((handler: (event: DomainChangeEvent) => void) => {
    domainChangeHandlers.current.push(handler);
    return () => {
      const index = domainChangeHandlers.current.indexOf(handler);
      if (index > -1) {
        domainChangeHandlers.current.splice(index, 1);
      }
    };
  }, []);

  // Helper Functions
  const triggerRelatedTransformation = useCallback((concept: MathematicalConcept) => {
    // Map concept categories to transformation types
    const categoryToTransformation: Record<string, TransformationType> = {
      'elliptic-curves': 'elliptic-to-algebra',
      'abstract-algebra': 'algebra-to-topology',
      'topology': 'topology-to-elliptic'
    };

    const transformationType = categoryToTransformation[concept.category];
    if (transformationType) {
      triggerTransformation(transformationType, 'concept-trigger');
    }
  }, [triggerTransformation]);

  const updateConceptHighlightsFromTransformation = useCallback((transformation: BridgeTransformation) => {
    // This would map transformation domains to relevant concept IDs
    // For now, we'll use a simple mapping based on transformation type
    const transformationToConceptIds: Record<string, string[]> = {
      'elliptic-to-algebra': ['elliptic-curves', 'groups', 'rings'],
      'algebra-to-topology': ['groups', 'topology', 'homology'],
      'topology-to-elliptic': ['topology', 'manifolds', 'elliptic-curves']
    };

    const conceptIds = transformationToConceptIds[transformation.transformationType] || [];
    highlightConcepts(conceptIds, 'bridge-transformation');
  }, [highlightConcepts]);

  // Context Value
  const contextValue: MathematicalBridgeContextType = {
    // State
    ...state,
    
    // Actions
    setActiveDomain,
    selectConcept,
    highlightConcepts,
    clearHighlights,
    triggerTransformation,
    updateTransformationState,
    setSynchronizationEnabled,
    setAutoTriggerAnimations,
    setCrossHighlightingEnabled,
    onConceptSelection,
    onTransformationChange,
    onDomainChange
  };

  return (
    <MathematicalBridgeContext.Provider value={contextValue}>
      {children}
    </MathematicalBridgeContext.Provider>
  );
};

// Context Hook
export const useMathematicalBridge = (): MathematicalBridgeContextType => {
  const context = useContext(MathematicalBridgeContext);
  if (!context) {
    throw new Error('useMathematicalBridge must be used within a MathematicalBridgeProvider');
  }
  return context;
};

// Export default
export default MathematicalBridgeContext;
