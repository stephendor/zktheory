/**
 * Sample Mathematical Concept Data
 * Provides initial concept data for the mathematical concept mapping interface
 * Covers elliptic curves, abstract algebra, and topology relationships
 */

import {
  MathematicalConcept,
  ConceptRelationship,
  ConceptCategory,
  DifficultyLevel,
  RelationshipType,
  ConceptGraphData,
  ConceptUtils
} from './types';

// Sample concepts covering the three main domains
export const sampleConcepts: MathematicalConcept[] = [
  // Elliptic Curve Concepts
  {
    id: 'elliptic-curve',
    name: 'Elliptic Curve',
    displayName: 'Elliptic Curves',
    category: ConceptCategory.ELLIPTIC_CURVES,
    difficulty: DifficultyLevel.INTERMEDIATE,
    definition: 'A smooth curve defined by a cubic equation in two variables, with applications in cryptography and number theory.',
    equation: 'y² = x³ + ax + b',
    properties: [
      { name: 'Genus', value: 1, description: 'Topological invariant' },
      { name: 'Group Law', value: true, description: 'Points form an abelian group' },
      { name: 'Discriminant', value: '4a³ + 27b²', description: 'Must be non-zero for smoothness' }
    ],
    examples: [
      {
        name: 'Secp256k1',
        description: 'Curve used in Bitcoin',
        equation: 'y² = x³ + 7',
        properties: [
          { name: 'Field', value: 'GF(p)', description: 'Prime field with p = 2²⁵⁶ - 2³² - 977' }
        ]
      }
    ],
    prerequisites: ['group-theory', 'field-theory'],
    applications: ['ecdsa', 'point-addition'],
    keywords: ['curve', 'cubic', 'cryptography', 'group'],
    visualizationType: 'curve'
  },

  {
    id: 'point-addition',
    name: 'Point Addition',
    displayName: 'Elliptic Curve Point Addition',
    category: ConceptCategory.ELLIPTIC_CURVES,
    difficulty: DifficultyLevel.INTERMEDIATE,
    definition: 'The group operation on elliptic curve points, defined geometrically by drawing lines.',
    properties: [
      { name: 'Associative', value: true, description: '(P + Q) + R = P + (Q + R)' },
      { name: 'Commutative', value: true, description: 'P + Q = Q + P' },
      { name: 'Identity', value: 'O', description: 'Point at infinity' }
    ],
    examples: [
      {
        name: 'Geometric Construction',
        description: 'Draw line through P and Q, find third intersection, reflect over x-axis'
      }
    ],
    prerequisites: ['elliptic-curve', 'group-theory'],
    applications: ['ecdsa', 'elliptic-curve-group'],
    keywords: ['addition', 'group operation', 'geometry'],
    visualizationType: 'diagram'
  },

  {
    id: 'ecdsa',
    name: 'ECDSA',
    displayName: 'Elliptic Curve Digital Signature Algorithm',
    category: ConceptCategory.ELLIPTIC_CURVES,
    difficulty: DifficultyLevel.ADVANCED,
    definition: 'A cryptographic signature scheme based on the discrete logarithm problem in elliptic curve groups.',
    properties: [
      { name: 'Security', value: 'ECDLP', description: 'Based on elliptic curve discrete logarithm problem' },
      { name: 'Key Size', value: '256 bits', description: 'Equivalent to 3072-bit RSA' }
    ],
    examples: [
      {
        name: 'Bitcoin Signatures',
        description: 'Used to prove ownership of bitcoin addresses'
      }
    ],
    prerequisites: ['elliptic-curve', 'point-addition', 'discrete-log'],
    applications: [],
    keywords: ['cryptography', 'signature', 'digital', 'security'],
    visualizationType: 'diagram'
  },

  // Abstract Algebra Concepts
  {
    id: 'group-theory',
    name: 'Group Theory',
    displayName: 'Group Theory',
    category: ConceptCategory.ABSTRACT_ALGEBRA,
    difficulty: DifficultyLevel.INTERMEDIATE,
    definition: 'The study of algebraic structures known as groups.',
    properties: [
      { name: 'Closure', value: true, description: 'a * b is in G for all a, b in G' },
      { name: 'Associativity', value: true, description: '(a * b) * c = a * (b * c)' },
      { name: 'Identity', value: true, description: 'There exists e such that a * e = a' },
      { name: 'Inverse', value: true, description: 'For each a, there exists a⁻¹' }
    ],
    examples: [
      {
        name: 'Integers under addition',
        description: '(ℤ, +) forms a group'
      },
      {
        name: 'Symmetric group',
        description: 'Permutations of n elements'
      }
    ],
    prerequisites: ['set-theory'],
    applications: ['elliptic-curve', 'cayley-graph', 'abelian-group'],
    keywords: ['algebra', 'structure', 'operation', 'symmetry'],
    visualizationType: 'table'
  },

  {
    id: 'abelian-group',
    name: 'Abelian Group',
    displayName: 'Abelian Groups',
    category: ConceptCategory.ABSTRACT_ALGEBRA,
    difficulty: DifficultyLevel.INTERMEDIATE,
    definition: 'A group where the group operation is commutative.',
    properties: [
      { name: 'Commutative', value: true, description: 'a * b = b * a for all a, b' },
      { name: 'All group axioms', value: true, description: 'Inherits closure, associativity, identity, inverse' }
    ],
    examples: [
      {
        name: 'Elliptic curve points',
        description: 'Points on an elliptic curve form an abelian group'
      },
      {
        name: 'Cyclic groups',
        description: 'Generated by a single element'
      }
    ],
    prerequisites: ['group-theory'],
    applications: ['elliptic-curve-group', 'homomorphism'],
    keywords: ['commutative', 'algebra', 'structure'],
    visualizationType: 'table'
  },

  {
    id: 'elliptic-curve-group',
    name: 'Elliptic Curve Group',
    displayName: 'Elliptic Curve as Group',
    category: ConceptCategory.ABSTRACT_ALGEBRA,
    difficulty: DifficultyLevel.ADVANCED,
    definition: 'The abelian group structure on the points of an elliptic curve.',
    properties: [
      { name: 'Abelian', value: true, description: 'Point addition is commutative' },
      { name: 'Identity', value: 'O', description: 'Point at infinity' },
      { name: 'Finite over finite fields', value: true, description: 'Has finite order over finite fields' }
    ],
    examples: [
      {
        name: 'E(𝔽p)',
        description: 'Elliptic curve over finite field'
      }
    ],
    prerequisites: ['elliptic-curve', 'abelian-group', 'point-addition'],
    applications: ['ecdsa', 'torsion-points'],
    keywords: ['elliptic', 'group', 'abelian', 'cryptography'],
    visualizationType: 'graph'
  },

  {
    id: 'cayley-graph',
    name: 'Cayley Graph',
    displayName: 'Cayley Graphs',
    category: ConceptCategory.ABSTRACT_ALGEBRA,
    difficulty: DifficultyLevel.ADVANCED,
    definition: 'A graph that represents the structure of a group with respect to a generating set.',
    properties: [
      { name: 'Vertex set', value: 'Group elements', description: 'Each vertex is a group element' },
      { name: 'Edge set', value: 'Generator actions', description: 'Edges represent multiplication by generators' },
      { name: 'Regular', value: true, description: 'All vertices have same degree' }
    ],
    examples: [
      {
        name: 'Cyclic group C₆',
        description: 'Forms a hexagon when generated by single element'
      }
    ],
    prerequisites: ['group-theory', 'graph-theory'],
    applications: ['group-visualization', 'topology'],
    keywords: ['graph', 'group', 'visualization', 'structure'],
    visualizationType: 'graph'
  },

  {
    id: 'homomorphism',
    name: 'Group Homomorphism',
    displayName: 'Group Homomorphisms',
    category: ConceptCategory.ABSTRACT_ALGEBRA,
    difficulty: DifficultyLevel.ADVANCED,
    definition: 'A structure-preserving map between two groups.',
    equation: 'φ(ab) = φ(a)φ(b)',
    properties: [
      { name: 'Structure preserving', value: true, description: 'Preserves group operation' },
      { name: 'Maps identity to identity', value: true, description: 'φ(e₁) = e₂' },
      { name: 'Maps inverses to inverses', value: true, description: 'φ(a⁻¹) = φ(a)⁻¹' }
    ],
    examples: [
      {
        name: 'Determinant map',
        description: 'det: GL(n) → ℝ*'
      }
    ],
    prerequisites: ['group-theory', 'abelian-group'],
    applications: ['isomorphism', 'quotient-group'],
    keywords: ['homomorphism', 'structure', 'map', 'preservation'],
    visualizationType: 'diagram'
  },

  // Topology Concepts
  {
    id: 'topology',
    name: 'Topology',
    displayName: 'Topology',
    category: ConceptCategory.TOPOLOGY,
    difficulty: DifficultyLevel.INTERMEDIATE,
    definition: 'The study of properties preserved under continuous deformations.',
    properties: [
      { name: 'Open sets', value: 'Define topology', description: 'Collection of open subsets' },
      { name: 'Continuity', value: 'Central concept', description: 'Preservation of structure' },
      { name: 'Invariants', value: 'Topological properties', description: 'Properties preserved under homeomorphism' }
    ],
    examples: [
      {
        name: 'Euclidean topology',
        description: 'Standard topology on ℝⁿ'
      },
      {
        name: 'Discrete topology',
        description: 'All subsets are open'
      }
    ],
    prerequisites: ['set-theory'],
    applications: ['continuous-map', 'homeomorphism', 'homotopy'],
    keywords: ['continuous', 'deformation', 'space', 'open'],
    visualizationType: 'space'
  },

  {
    id: 'continuous-map',
    name: 'Continuous Map',
    displayName: 'Continuous Maps',
    category: ConceptCategory.TOPOLOGY,
    difficulty: DifficultyLevel.INTERMEDIATE,
    definition: 'A function between topological spaces that preserves the topological structure.',
    properties: [
      { name: 'Preimage property', value: true, description: 'Preimage of open set is open' },
      { name: 'Composition', value: 'Preserved', description: 'Composition of continuous maps is continuous' }
    ],
    examples: [
      {
        name: 'Polynomial functions',
        description: 'ℝ → ℝ continuous everywhere'
      }
    ],
    prerequisites: ['topology'],
    applications: ['homeomorphism', 'homotopy', 'covering-space'],
    keywords: ['continuous', 'function', 'map', 'topology'],
    visualizationType: 'diagram'
  },

  {
    id: 'homeomorphism',
    name: 'Homeomorphism',
    displayName: 'Homeomorphisms',
    category: ConceptCategory.TOPOLOGY,
    difficulty: DifficultyLevel.ADVANCED,
    definition: 'A bijective continuous map with continuous inverse.',
    properties: [
      { name: 'Bijective', value: true, description: 'One-to-one and onto' },
      { name: 'Continuous', value: true, description: 'Both directions continuous' },
      { name: 'Topological equivalence', value: true, description: 'Preserves all topological properties' }
    ],
    examples: [
      {
        name: 'Open interval to real line',
        description: '(0,1) ≅ ℝ via tan(πx - π/2)'
      }
    ],
    prerequisites: ['continuous-map', 'topology'],
    applications: ['classification', 'invariants'],
    keywords: ['homeomorphism', 'equivalence', 'bijective', 'continuous'],
    visualizationType: 'diagram'
  },

  {
    id: 'homotopy',
    name: 'Homotopy',
    displayName: 'Homotopy',
    category: ConceptCategory.TOPOLOGY,
    difficulty: DifficultyLevel.ADVANCED,
    definition: 'A continuous deformation between two continuous maps.',
    equation: 'H: X × [0,1] → Y',
    properties: [
      { name: 'Continuous deformation', value: true, description: 'Parametrized by [0,1]' },
      { name: 'Equivalence relation', value: true, description: 'Reflexive, symmetric, transitive' },
      { name: 'Algebraic invariant', value: true, description: 'Leads to homotopy groups' }
    ],
    examples: [
      {
        name: 'Loop contraction',
        description: 'Contract a loop to a point'
      }
    ],
    prerequisites: ['continuous-map', 'topology'],
    applications: ['fundamental-group', 'covering-space'],
    keywords: ['homotopy', 'deformation', 'continuous', 'invariant'],
    visualizationType: 'space'
  },

  {
    id: 'fundamental-group',
    name: 'Fundamental Group',
    displayName: 'Fundamental Group',
    category: ConceptCategory.TOPOLOGY,
    difficulty: DifficultyLevel.ADVANCED,
    definition: 'The group of homotopy classes of loops based at a point.',
    equation: 'π₁(X, x₀)',
    properties: [
      { name: 'Group structure', value: true, description: 'Loop concatenation gives group operation' },
      { name: 'Topological invariant', value: true, description: 'Preserved under homeomorphism' },
      { name: 'Homotopy invariant', value: true, description: 'Preserved under homotopy equivalence' }
    ],
    examples: [
      {
        name: 'Circle', 
        description: 'π₁(S¹) ≅ ℤ'
      },
      {
        name: 'Sphere',
        description: 'π₁(S²) = {1}'
      }
    ],
    prerequisites: ['group-theory', 'homotopy', 'topology'],
    applications: ['covering-space', 'classification'],
    keywords: ['fundamental', 'group', 'loop', 'homotopy'],
    visualizationType: 'space'
  },

  // Supporting concepts
  {
    id: 'field-theory',
    name: 'Field Theory',
    displayName: 'Field Theory',
    category: ConceptCategory.ABSTRACT_ALGEBRA,
    difficulty: DifficultyLevel.INTERMEDIATE,
    definition: 'The study of algebraic structures called fields.',
    properties: [
      { name: 'Addition and multiplication', value: true, description: 'Two operations' },
      { name: 'Division possible', value: true, description: 'Every non-zero element has inverse' }
    ],
    examples: [
      { name: 'Rational numbers', description: 'ℚ under +, ×' },
      { name: 'Finite fields', description: 'GF(p) for prime p' }
    ],
    prerequisites: ['group-theory'],
    applications: ['elliptic-curve'],
    keywords: ['field', 'division', 'algebra'],
    visualizationType: 'table'
  },

  {
    id: 'discrete-log',
    name: 'Discrete Logarithm',
    displayName: 'Discrete Logarithm Problem',
    category: ConceptCategory.NUMBER_THEORY,
    difficulty: DifficultyLevel.ADVANCED,
    definition: 'The problem of finding the exponent in a discrete group.',
    equation: 'Given g^x = h, find x',
    properties: [
      { name: 'Computationally hard', value: true, description: 'No known efficient algorithm' },
      { name: 'Cryptographic basis', value: true, description: 'Foundation for many cryptosystems' }
    ],
    examples: [
      { name: 'Elliptic curve DLP', description: 'kP = Q, find k' }
    ],
    prerequisites: ['group-theory'],
    applications: ['ecdsa'],
    keywords: ['discrete', 'logarithm', 'cryptography', 'hard problem'],
    visualizationType: 'diagram'
  },

  {
    id: 'set-theory',
    name: 'Set Theory',
    displayName: 'Set Theory',
    category: ConceptCategory.ABSTRACT_ALGEBRA,
    difficulty: DifficultyLevel.INTRODUCTORY,
    definition: 'The study of collections of objects.',
    properties: [
      { name: 'Membership', value: '∈', description: 'Element belongs to set' },
      { name: 'Operations', value: '∪, ∩, \\', description: 'Union, intersection, complement' }
    ],
    examples: [
      { name: 'Natural numbers', description: 'ℕ = {1, 2, 3, ...}' }
    ],
    prerequisites: [],
    applications: ['group-theory', 'topology'],
    keywords: ['set', 'collection', 'membership', 'foundation'],
    visualizationType: 'diagram'
  },

  {
    id: 'graph-theory',
    name: 'Graph Theory',
    displayName: 'Graph Theory',
    category: ConceptCategory.ABSTRACT_ALGEBRA,
    difficulty: DifficultyLevel.INTERMEDIATE,
    definition: 'The study of graphs as mathematical structures.',
    properties: [
      { name: 'Vertices', value: 'V', description: 'Set of nodes' },
      { name: 'Edges', value: 'E', description: 'Set of connections' }
    ],
    examples: [
      { name: 'Complete graph', description: 'Every pair of vertices connected' }
    ],
    prerequisites: ['set-theory'],
    applications: ['cayley-graph'],
    keywords: ['graph', 'vertex', 'edge', 'network'],
    visualizationType: 'graph'
  }
];

// Define relationships between concepts
export const sampleRelationships: ConceptRelationship[] = [
  // Elliptic curve relationships
  {
    id: 'elliptic-curve-to-group',
    source: 'elliptic-curve',
    target: 'elliptic-curve-group',
    type: RelationshipType.SPECIALIZATION,
    strength: 0.9,
    bidirectional: false,
    description: 'An elliptic curve naturally carries the structure of an abelian group',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.SPECIALIZATION)
  },
  
  {
    id: 'point-addition-enables-group',
    source: 'point-addition',
    target: 'elliptic-curve-group',
    type: RelationshipType.APPLICATION,
    strength: 0.8,
    bidirectional: false,
    description: 'Point addition provides the group operation',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.APPLICATION)
  },

  {
    id: 'group-theory-to-elliptic',
    source: 'group-theory',
    target: 'elliptic-curve',
    type: RelationshipType.PREREQUISITE,
    strength: 0.7,
    bidirectional: false,
    description: 'Group theory concepts are essential for understanding elliptic curves',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.PREREQUISITE)
  },

  {
    id: 'abelian-to-ec-group',
    source: 'abelian-group',
    target: 'elliptic-curve-group',
    type: RelationshipType.GENERALIZATION,
    strength: 0.8,
    bidirectional: false,
    description: 'Elliptic curve groups are examples of abelian groups',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.GENERALIZATION)
  },

  {
    id: 'ec-group-to-ecdsa',
    source: 'elliptic-curve-group',
    target: 'ecdsa',
    type: RelationshipType.APPLICATION,
    strength: 0.9,
    bidirectional: false,
    description: 'ECDSA relies on the group structure of elliptic curves',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.APPLICATION)
  },

  // Abstract algebra relationships
  {
    id: 'group-to-abelian',
    source: 'group-theory',
    target: 'abelian-group',
    type: RelationshipType.SPECIALIZATION,
    strength: 0.8,
    bidirectional: false,
    description: 'Abelian groups are commutative groups',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.SPECIALIZATION)
  },

  {
    id: 'group-to-homomorphism',
    source: 'group-theory',
    target: 'homomorphism',
    type: RelationshipType.SPECIALIZATION,
    strength: 0.7,
    bidirectional: false,
    description: 'Homomorphisms are structure-preserving maps between groups',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.SPECIALIZATION)
  },

  {
    id: 'group-to-cayley',
    source: 'group-theory',
    target: 'cayley-graph',
    type: RelationshipType.APPLICATION,
    strength: 0.6,
    bidirectional: false,
    description: 'Cayley graphs visualize group structure',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.APPLICATION)
  },

  // Topology relationships
  {
    id: 'topology-to-continuous',
    source: 'topology',
    target: 'continuous-map',
    type: RelationshipType.SPECIALIZATION,
    strength: 0.8,
    bidirectional: false,
    description: 'Continuous maps are central objects in topology',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.SPECIALIZATION)
  },

  {
    id: 'continuous-to-homeomorphism',
    source: 'continuous-map',
    target: 'homeomorphism',
    type: RelationshipType.SPECIALIZATION,
    strength: 0.8,
    bidirectional: false,
    description: 'Homeomorphisms are bijective continuous maps with continuous inverse',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.SPECIALIZATION)
  },

  {
    id: 'continuous-to-homotopy',
    source: 'continuous-map',
    target: 'homotopy',
    type: RelationshipType.APPLICATION,
    strength: 0.7,
    bidirectional: false,
    description: 'Homotopy studies continuous deformations of continuous maps',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.APPLICATION)
  },

  {
    id: 'homotopy-to-fundamental',
    source: 'homotopy',
    target: 'fundamental-group',
    type: RelationshipType.APPLICATION,
    strength: 0.9,
    bidirectional: false,
    description: 'Fundamental group is defined using homotopy classes of loops',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.APPLICATION)
  },

  // Cross-domain bridges
  {
    id: 'fundamental-group-algebra',
    source: 'fundamental-group',
    target: 'group-theory',
    type: RelationshipType.EXAMPLE_OF,
    strength: 0.9,
    bidirectional: false,
    description: 'Fundamental groups are important examples in group theory',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.EXAMPLE_OF)
  },

  {
    id: 'cayley-topology-bridge',
    source: 'cayley-graph',
    target: 'topology',
    type: RelationshipType.APPLICATION,
    strength: 0.5,
    bidirectional: false,
    description: 'Cayley graphs can be studied as topological spaces',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.APPLICATION)
  },

  {
    id: 'ec-topology-bridge',
    source: 'elliptic-curve',
    target: 'topology',
    type: RelationshipType.APPLICATION,
    strength: 0.6,
    bidirectional: false,
    description: 'Elliptic curves are topological spaces (genus 1)',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.APPLICATION)
  },

  // Prerequisites
  {
    id: 'set-to-group',
    source: 'set-theory',
    target: 'group-theory',
    type: RelationshipType.PREREQUISITE,
    strength: 0.9,
    bidirectional: false,
    description: 'Set theory provides the foundation for group theory',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.PREREQUISITE)
  },

  {
    id: 'set-to-topology',
    source: 'set-theory',
    target: 'topology',
    type: RelationshipType.PREREQUISITE,
    strength: 0.9,
    bidirectional: false,
    description: 'Topology is built on set-theoretic foundations',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.PREREQUISITE)
  },

  {
    id: 'field-to-elliptic',
    source: 'field-theory',
    target: 'elliptic-curve',
    type: RelationshipType.PREREQUISITE,
    strength: 0.8,
    bidirectional: false,
    description: 'Elliptic curves are defined over fields',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.PREREQUISITE)
  },

  {
    id: 'discrete-log-ecdsa',
    source: 'discrete-log',
    target: 'ecdsa',
    type: RelationshipType.PREREQUISITE,
    strength: 0.9,
    bidirectional: false,
    description: 'ECDSA security relies on the discrete logarithm problem',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.PREREQUISITE)
  },

  {
    id: 'graph-to-cayley',
    source: 'graph-theory',
    target: 'cayley-graph',
    type: RelationshipType.PREREQUISITE,
    strength: 0.7,
    bidirectional: false,
    description: 'Graph theory concepts are needed to understand Cayley graphs',
    style: ConceptUtils.getRelationshipStyle(RelationshipType.PREREQUISITE)
  }
];

// Combine into complete graph data
export const sampleConceptGraph: ConceptGraphData = {
  concepts: sampleConcepts,
  relationships: sampleRelationships
};

// Export utility functions for working with the sample data
export const SampleDataUtils = {
  /**
   * Get concepts by category
   */
  getConceptsByCategory: (category: ConceptCategory): MathematicalConcept[] => {
    return sampleConcepts.filter(concept => concept.category === category);
  },

  /**
   * Get concepts by difficulty level
   */
  getConceptsByDifficulty: (difficulty: DifficultyLevel): MathematicalConcept[] => {
    return sampleConcepts.filter(concept => concept.difficulty === difficulty);
  },

  /**
   * Get relationships for a concept
   */
  getConceptRelationships: (conceptId: string): ConceptRelationship[] => {
    return sampleRelationships.filter(rel => 
      rel.source === conceptId || rel.target === conceptId
    );
  },

  /**
   * Get connected concepts
   */
  getConnectedConcepts: (conceptId: string): string[] => {
    const relationships = SampleDataUtils.getConceptRelationships(conceptId);
    return relationships.map(rel => 
      rel.source === conceptId ? rel.target : rel.source
    );
  },

  /**
   * Calculate concept centrality (number of connections)
   */
  getConceptCentrality: (conceptId: string): number => {
    return SampleDataUtils.getConceptRelationships(conceptId).length;
  },

  /**
   * Get learning path suggestions
   */
  suggestLearningPath: (targetConceptId: string): string[] => {
    const target = sampleConcepts.find(c => c.id === targetConceptId);
    if (!target) return [];

    const path: string[] = [];
    const visited = new Set<string>();
    
    const addPrerequisites = (conceptId: string) => {
      if (visited.has(conceptId)) return;
      visited.add(conceptId);
      
      const concept = sampleConcepts.find(c => c.id === conceptId);
      if (!concept) return;
      
      // Add prerequisites first
      concept.prerequisites.forEach(prereqId => {
        addPrerequisites(prereqId);
      });
      
      // Then add the concept itself
      if (!path.includes(conceptId)) {
        path.push(conceptId);
      }
    };

    addPrerequisites(targetConceptId);
    return path;
  }
};
