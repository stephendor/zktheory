/**
 * Concept Mapping Interface - Index
 * 
 * Task 7.2: Build Concept Mapping Interface
 * 
 * Exports all components for the mathematical concept mapping visualization system.
 * This interface provides force-directed graph layouts using D3.js to visualize 
 * connections between elliptic curves, algebraic structures, and topological spaces.
 */

// Core types and interfaces
export * from './types';

// Sample data for demonstration
export * from './sampleData';

// D3.js force simulation engine
export { ConceptForceSimulation, DEFAULT_CONCEPT_SIMULATION_CONFIG } from './ConceptForceSimulation';
export type { ConceptNode, ConceptLink, ConceptSimulationConfig } from './ConceptForceSimulation';

// Main React component
export { default as MathematicalConceptGraph } from './MathematicalConceptGraph';

// Example usage component
export { default as ConceptMappingExample } from './ConceptMappingExample';

// CSS module for styling
export { default as styles } from './MathematicalConceptGraph.module.css';
