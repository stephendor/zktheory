/**
 * Mathematical Bridge Integration - Index
 * 
 * Task 7.3: Cross-Task Integration
 * 
 * Exports all components for the integrated mathematical bridge system that connects
 * Bridge Transformations (Task 7.1) with Concept Mapping Interface (Task 7.2).
 * 
 * This integration provides:
 * - Unified context management across mathematical domains
 * - Synchronized state between bridge transformations and concept mapping
 * - Cross-component communication via event-driven architecture
 * - Orchestrated visualization combining both systems
 */

// Core integration context and provider
export { 
  MathematicalBridgeProvider,
  useMathematicalBridge
} from './MathematicalBridgeContext';

// Integration hooks for component-specific functionality
export {
  useBridgeTransformationIntegration,
  useConceptMappingIntegration,
  useMathematicalBridgeControl,
  useBridgeIntegrationDebug
} from './useBridgeIntegration';

// Main integrated component
export { default as IntegratedMathematicalBridge } from './IntegratedMathematicalBridge';

// Type exports
export type {
  MathematicalDomain,
  ConceptSelectionEvent,
  TransformationEvent,
  DomainChangeEvent,
  MathematicalBridgeState,
  MathematicalBridgeActions,
  MathematicalBridgeContextType,
  MathematicalBridgeProviderProps
} from './MathematicalBridgeContext';
