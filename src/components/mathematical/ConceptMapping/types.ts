/**
 * Mathematical Concept Types for Concept Mapping Interface
 * Defines the data structures for representing mathematical concepts and their relationships
 * Used in Task 7.2: Build Concept Mapping Interface
 */

export enum ConceptCategory {
  ELLIPTIC_CURVES = 'elliptic_curves',
  ABSTRACT_ALGEBRA = 'abstract_algebra',
  TOPOLOGY = 'topology',
  NUMBER_THEORY = 'number_theory',
  ALGEBRAIC_GEOMETRY = 'algebraic_geometry'
}

export enum DifficultyLevel {
  INTRODUCTORY = 'introductory',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  RESEARCH = 'research'
}

export enum RelationshipType {
  HOMOMORPHISM = 'homomorphism',
  ISOMORPHISM = 'isomorphism',
  EMBEDDING = 'embedding',
  GENERALIZATION = 'generalization',
  SPECIALIZATION = 'specialization',
  EXAMPLE_OF = 'example_of',
  APPLICATION = 'application',
  PREREQUISITE = 'prerequisite'
}

export interface MathematicalProperty {
  name: string;
  value: string | number | boolean;
  description: string;
  isKey?: boolean;
}

export interface MathematicalExample {
  name: string;
  description: string;
  equation?: string;
  visualization?: string;
  properties?: MathematicalProperty[];
}

export interface MathematicalConcept {
  id: string;
  name: string;
  displayName: string;
  category: ConceptCategory;
  difficulty: DifficultyLevel;
  
  // Mathematical content
  definition: string;
  equation?: string;
  properties: MathematicalProperty[];
  examples: MathematicalExample[];
  
  // Educational metadata
  prerequisites: string[]; // IDs of prerequisite concepts
  applications: string[]; // IDs of concepts that use this one
  keywords: string[];
  
  // Visualization data
  visualizationType: 'curve' | 'table' | 'graph' | 'space' | 'diagram';
  visualizationData?: any;
  
  // UI positioning (for force-directed layout)
  x?: number;
  y?: number;
  fx?: number; // fixed x position
  fy?: number; // fixed y position
  
  // D3 simulation data
  vx?: number; // velocity x
  vy?: number; // velocity y
  index?: number;
}

export interface ConceptRelationship {
  id: string;
  source: string; // concept ID
  target: string; // concept ID
  type: RelationshipType;
  
  // Relationship strength and properties
  strength: number; // 0-1, affects link force
  bidirectional: boolean;
  
  // Mathematical content
  description: string;
  formalDefinition?: string;
  examples?: string[];
  
  // Visual properties
  style: {
    strokeWidth: number;
    strokeDasharray?: string;
    color: string;
    opacity: number;
  };
  
  // D3 simulation data
  source_concept?: MathematicalConcept;
  target_concept?: MathematicalConcept;
  index?: number;
}

export interface ConceptGraphData {
  concepts: MathematicalConcept[];
  relationships: ConceptRelationship[];
}

export interface ConceptFilterState {
  categories: ConceptCategory[];
  difficulties: DifficultyLevel[];
  relationshipTypes: RelationshipType[];
  searchTerm: string;
  showOnlyConnected: boolean;
  minConnections: number;
}

export interface ConceptVisualizationState {
  selectedConcept?: string;
  hoveredConcept?: string;
  selectedRelationship?: string;
  highlightedPath: string[];
  focusedNeighborhood?: string;
  learningPath: string[];
}

// Default filter state
export const defaultFilterState: ConceptFilterState = {
  categories: Object.values(ConceptCategory),
  difficulties: Object.values(DifficultyLevel),
  relationshipTypes: Object.values(RelationshipType),
  searchTerm: '',
  showOnlyConnected: false,
  minConnections: 0
};

// Utility functions for concept management
export const ConceptUtils = {
  /**
   * Check if a concept matches the current filter criteria
   */
  matchesFilter: (concept: MathematicalConcept, filter: ConceptFilterState): boolean => {
    // Category filter
    if (!filter.categories.includes(concept.category)) {
      return false;
    }
    
    // Difficulty filter
    if (!filter.difficulties.includes(concept.difficulty)) {
      return false;
    }
    
    // Search term filter
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      const matchesName = concept.name.toLowerCase().includes(searchLower);
      const matchesDisplayName = concept.displayName.toLowerCase().includes(searchLower);
      const matchesKeywords = concept.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchLower)
      );
      const matchesDefinition = concept.definition.toLowerCase().includes(searchLower);
      
      if (!matchesName && !matchesDisplayName && !matchesKeywords && !matchesDefinition) {
        return false;
      }
    }
    
    return true;
  },

  /**
   * Get the color for a concept category
   */
  getCategoryColor: (category: ConceptCategory): string => {
    const colors = {
      [ConceptCategory.ELLIPTIC_CURVES]: '#3B82F6', // blue
      [ConceptCategory.ABSTRACT_ALGEBRA]: '#10B981', // green
      [ConceptCategory.TOPOLOGY]: '#F59E0B', // yellow
      [ConceptCategory.NUMBER_THEORY]: '#EF4444', // red
      [ConceptCategory.ALGEBRAIC_GEOMETRY]: '#8B5CF6' // purple
    };
    return colors[category] || '#6B7280';
  },

  /**
   * Get the style for a relationship type
   */
  getRelationshipStyle: (type: RelationshipType): ConceptRelationship['style'] => {
    const styles = {
      [RelationshipType.HOMOMORPHISM]: {
        strokeWidth: 2,
        color: '#3B82F6',
        strokeDasharray: undefined,
        opacity: 0.8
      },
      [RelationshipType.ISOMORPHISM]: {
        strokeWidth: 4,
        color: '#10B981',
        strokeDasharray: undefined,
        opacity: 0.8
      },
      [RelationshipType.EMBEDDING]: {
        strokeWidth: 2,
        color: '#F59E0B',
        strokeDasharray: '5,5',
        opacity: 0.8
      },
      [RelationshipType.GENERALIZATION]: {
        strokeWidth: 3,
        color: '#EF4444',
        strokeDasharray: undefined,
        opacity: 0.8
      },
      [RelationshipType.SPECIALIZATION]: {
        strokeWidth: 2,
        color: '#EF4444',
        strokeDasharray: '2,2',
        opacity: 0.8
      },
      [RelationshipType.EXAMPLE_OF]: {
        strokeWidth: 1,
        color: '#6B7280',
        strokeDasharray: '3,3',
        opacity: 0.8
      },
      [RelationshipType.APPLICATION]: {
        strokeWidth: 2,
        color: '#8B5CF6',
        strokeDasharray: undefined,
        opacity: 0.8
      },
      [RelationshipType.PREREQUISITE]: {
        strokeWidth: 2,
        color: '#F97316',
        strokeDasharray: '8,2',
        opacity: 0.8
      }
    };
    return styles[type] || { strokeWidth: 1, color: '#6B7280', opacity: 0.8 };
  },

  /**
   * Calculate concept dependencies
   */
  calculateDependencies: (concept: MathematicalConcept, allConcepts: MathematicalConcept[]): {
    prerequisites: MathematicalConcept[];
    dependents: MathematicalConcept[];
  } => {
    const prerequisites = allConcepts.filter(c => 
      concept.prerequisites.includes(c.id)
    );
    
    const dependents = allConcepts.filter(c => 
      c.prerequisites.includes(concept.id)
    );
    
    return { prerequisites, dependents };
  }
};
