/**
 * useBridgeIntegration.ts
 * 
 * Task 7.3: Cross-Task Integration - React Hooks
 * 
 * Provides specialized hooks for integrating Bridge Transformations and Concept Mapping
 * components with the unified mathematical context.
 * 
 * Features:
 * - Bridge transformation integration hooks
 * - Concept mapping integration hooks  
 * - Cross-component communication utilities
 * - Synchronized state management helpers
 */

import { useEffect, useCallback, useRef } from 'react';
import { useMathematicalBridge } from './MathematicalBridgeContext';
import type { MathematicalConcept } from '../ConceptMapping/types';
import type { BridgeTransformation, TransformationType, BridgeTransformationState } from '../BridgeTransformations/types';

/**
 * Hook for Bridge Transformation components to integrate with the unified context
 * Provides automatic state synchronization and event handling
 */
export const useBridgeTransformationIntegration = () => {
  const context = useMathematicalBridge();
  const lastTransformationRef = useRef<string | null>(null);

  // Handle transformation state updates from the bridge orchestrator
  const handleTransformationUpdate = useCallback((transformation: BridgeTransformation | null, state: BridgeTransformationState) => {
    if (transformation && transformation.id !== lastTransformationRef.current) {
      lastTransformationRef.current = transformation.id;
      context.updateTransformationState(state);
    }
  }, [context]);

  // Handle concept selection events to trigger transformations
  useEffect(() => {
    if (!context.synchronizationEnabled) return;

    const unsubscribe = context.onConceptSelection((event) => {
      // Map concept categories to transformation types
      const categoryToTransformation: Record<string, TransformationType> = {
        'elliptic-curves': 'elliptic-to-algebra',
        'abstract-algebra': 'algebra-to-topology',
        'topology': 'topology-to-elliptic'
      };

      const transformationType = categoryToTransformation[event.concept.category];
      if (transformationType && context.autoTriggerAnimations) {
        context.triggerTransformation(transformationType, 'concept-trigger');
      }
    });

    return unsubscribe;
  }, [context]);

  return {
    // State
    currentTransformation: context.currentTransformation,
    transformationState: context.transformationState,
    isTransformationActive: context.isTransformationActive,
    selectedConcept: context.selectedConcept,
    synchronizationEnabled: context.synchronizationEnabled,
    
    // Actions
    handleTransformationUpdate,
    triggerTransformation: context.triggerTransformation,
    
    // Integration settings
    setSynchronizationEnabled: context.setSynchronizationEnabled,
    setAutoTriggerAnimations: context.setAutoTriggerAnimations
  };
};

/**
 * Hook for Concept Mapping components to integrate with the unified context
 * Provides automatic highlighting and selection synchronization
 */
export const useConceptMappingIntegration = () => {
  const context = useMathematicalBridge();

  // Handle concept selection with context integration
  const handleConceptSelect = useCallback((concept: MathematicalConcept | null) => {
    context.selectConcept(concept, 'concept-graph');
  }, [context]);

  // Handle learning path updates
  const handleLearningPath = useCallback((startId: string, endId: string) => {
    // For now, just highlight the path nodes
    context.highlightConcepts([startId, endId], 'concept-graph');
  }, [context]);

  // Listen for transformation events to update concept highlights
  useEffect(() => {
    if (!context.synchronizationEnabled || !context.crossHighlightingEnabled) return;

    const unsubscribe = context.onTransformationChange((event) => {
      // Update concept graph based on transformation state
      if (event.state.isAnimating) {
        // Highlight concepts related to the current transformation
        const relatedConcepts = getRelatedConceptsForTransformation(event.transformation);
        context.highlightConcepts(relatedConcepts, 'bridge-transformation');
      }
    });

    return unsubscribe;
  }, [context]);

  // Listen for domain changes to update focus
  useEffect(() => {
    const unsubscribe = context.onDomainChange((event) => {
      // Update concept graph focus based on domain
      console.log(`Domain changed from ${event.fromDomain} to ${event.toDomain}`);
    });

    return unsubscribe;
  }, [context]);

  return {
    // State
    selectedConcept: context.selectedConcept,
    highlightedConcepts: context.highlightedConcepts,
    activeDomain: context.activeDomain,
    synchronizationEnabled: context.synchronizationEnabled,
    crossHighlightingEnabled: context.crossHighlightingEnabled,
    
    // Actions
    handleConceptSelect,
    handleLearningPath,
    clearHighlights: context.clearHighlights,
    setActiveDomain: context.setActiveDomain,
    
    // Integration settings
    setSynchronizationEnabled: context.setSynchronizationEnabled,
    setCrossHighlightingEnabled: context.setCrossHighlightingEnabled
  };
};

/**
 * Hook for controlling the overall mathematical bridge integration
 * Provides master controls and monitoring capabilities
 */
export const useMathematicalBridgeControl = () => {
  const context = useMathematicalBridge();

  // Get integration status
  const getIntegrationStatus = useCallback(() => {
    return {
      isActive: context.synchronizationEnabled,
      hasActiveTransformation: context.isTransformationActive,
      hasSelectedConcept: context.selectedConcept !== null,
      highlightCount: context.highlightedConcepts.length,
      currentDomain: context.activeDomain
    };
  }, [context]);

  // Reset all states
  const resetIntegration = useCallback(() => {
    context.selectConcept(null);
    context.clearHighlights();
    // Note: We don't reset transformations as they might be mid-animation
  }, [context]);

  // Enable/disable all integration features
  const setIntegrationEnabled = useCallback((enabled: boolean) => {
    context.setSynchronizationEnabled(enabled);
    context.setAutoTriggerAnimations(enabled);
    context.setCrossHighlightingEnabled(enabled);
  }, [context]);

  return {
    // Status
    getIntegrationStatus,
    
    // Master controls
    resetIntegration,
    setIntegrationEnabled,
    
    // Individual controls
    setSynchronizationEnabled: context.setSynchronizationEnabled,
    setAutoTriggerAnimations: context.setAutoTriggerAnimations,
    setCrossHighlightingEnabled: context.setCrossHighlightingEnabled,
    
    // Event subscriptions
    onConceptSelection: context.onConceptSelection,
    onTransformationChange: context.onTransformationChange,
    onDomainChange: context.onDomainChange
  };
};

/**
 * Utility hook for debugging integration state
 * Provides logging and monitoring for development
 */
export const useBridgeIntegrationDebug = (componentName: string) => {
  const context = useMathematicalBridge();

  useEffect(() => {
    console.log(`[${componentName}] Bridge Integration Status:`, {
      synchronizationEnabled: context.synchronizationEnabled,
      autoTriggerAnimations: context.autoTriggerAnimations,
      crossHighlightingEnabled: context.crossHighlightingEnabled,
      activeDomain: context.activeDomain,
      selectedConcept: context.selectedConcept?.displayName || 'none',
      highlightedConcepts: context.highlightedConcepts.length,
      isTransformationActive: context.isTransformationActive
    });
  }, [
    componentName,
    context.synchronizationEnabled,
    context.autoTriggerAnimations, 
    context.crossHighlightingEnabled,
    context.activeDomain,
    context.selectedConcept,
    context.highlightedConcepts.length,
    context.isTransformationActive
  ]);

  // Subscribe to all events for debugging
  useEffect(() => {
    const unsubscribeConcept = context.onConceptSelection((event) => {
      console.log(`[${componentName}] Concept Selection:`, event);
    });

    const unsubscribeTransformation = context.onTransformationChange((event) => {
      console.log(`[${componentName}] Transformation Change:`, event);
    });

    const unsubscribeDomain = context.onDomainChange((event) => {
      console.log(`[${componentName}] Domain Change:`, event);
    });

    return () => {
      unsubscribeConcept();
      unsubscribeTransformation();
      unsubscribeDomain();
    };
  }, [componentName, context]);

  return {
    logState: () => console.log(`[${componentName}] Current State:`, context)
  };
};

// Helper function to get related concepts for a transformation
function getRelatedConceptsForTransformation(transformation: BridgeTransformation): string[] {
  const transformationToConceptIds: Record<string, string[]> = {
    'elliptic-to-algebra': ['elliptic-curves', 'groups', 'rings', 'fields'],
    'algebra-to-topology': ['groups', 'topology', 'homology', 'homotopy'],
    'topology-to-elliptic': ['topology', 'manifolds', 'elliptic-curves', 'differential-geometry']
  };

  return transformationToConceptIds[transformation.transformationType] || [];
}

// Export all hooks
export default {
  useBridgeTransformationIntegration,
  useConceptMappingIntegration,
  useMathematicalBridgeControl,
  useBridgeIntegrationDebug
};
