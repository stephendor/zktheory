/**
 * ConceptForceSimulation.ts
 * 
 * D3.js force simulation for mathematical concept mapping visualization.
 * Adapted from MapperVisualization.tsx patterns for educational concept relationships.
 */

import * as d3 from 'd3';
import { MathematicalConcept, ConceptRelationship, ConceptCategory, DifficultyLevel, RelationshipType } from './types';

export interface ConceptNode extends d3.SimulationNodeDatum {
  id: string;
  concept: MathematicalConcept;
  radius: number;
  color: string;
  fx?: number | null;
  fy?: number | null;
}

export interface ConceptLink extends d3.SimulationLinkDatum<ConceptNode> {
  id: string;
  relationship: ConceptRelationship;
  strokeWidth: number;
  strokeColor: string;
  strokeDasharray?: string;
}

export interface ConceptSimulationConfig {
  width: number;
  height: number;
  linkDistance: number;
  chargeStrength: number;
  centerStrength: number;
  collisionRadius: number;
  velocityDecay: number;
  boundsMargin: number;
}

export class ConceptForceSimulation {
  private simulation: d3.Simulation<ConceptNode, ConceptLink>;
  private nodes: ConceptNode[] = [];
  private links: ConceptLink[] = [];
  private config: ConceptSimulationConfig;
  private isRunning = false;

  constructor(config: ConceptSimulationConfig) {
    this.config = config;
    this.simulation = this.createSimulation();
  }

  private createSimulation(): d3.Simulation<ConceptNode, ConceptLink> {
    const { width, height, linkDistance, chargeStrength, centerStrength, collisionRadius, velocityDecay, boundsMargin } = this.config;

    return d3.forceSimulation<ConceptNode>()
      .velocityDecay(velocityDecay)
      .force("link", d3.forceLink<ConceptNode, ConceptLink>()
        .id(d => d.id)
        .distance(linkDistance)
        .strength(this.calculateLinkStrength.bind(this)))
      .force("charge", d3.forceManyBody()
        .strength(chargeStrength)
        .distanceMin(30)
        .distanceMax(300))
      .force("center", d3.forceCenter(width / 2, height / 2)
        .strength(centerStrength))
      .force("collision", d3.forceCollide<ConceptNode>()
        .radius(d => d.radius + collisionRadius)
        .iterations(2))
      .force("x", d3.forceX<ConceptNode>(width / 2)
        .strength(0.02))
      .force("y", d3.forceY<ConceptNode>(height / 2)
        .strength(0.02))
      .force("bounds", this.createBoundsForce(boundsMargin));
  }

  private createBoundsForce(margin: number) {
    return () => {
      const { width, height } = this.config;
      this.nodes.forEach(node => {
        const minX = margin + node.radius;
        const maxX = width - margin - node.radius;
        const minY = margin + node.radius;
        const maxY = height - margin - node.radius;

        if (node.x !== undefined) {
          node.x = Math.max(minX, Math.min(maxX, node.x));
        }
        if (node.y !== undefined) {
          node.y = Math.max(minY, Math.min(maxY, node.y));
        }
      });
    };
  }

  private calculateLinkStrength(link: ConceptLink): number {
    const strengthMap = {
      [RelationshipType.PREREQUISITE]: 0.8,
      [RelationshipType.APPLICATION]: 0.6,
      [RelationshipType.GENERALIZATION]: 0.7,
      [RelationshipType.SPECIALIZATION]: 0.7,
      [RelationshipType.HOMOMORPHISM]: 0.9,
      [RelationshipType.ISOMORPHISM]: 0.9,
      [RelationshipType.EMBEDDING]: 0.8,
      [RelationshipType.EXAMPLE_OF]: 0.5
    };
    return strengthMap[link.relationship.type] || 0.5;
  }

  public updateData(concepts: MathematicalConcept[], relationships: ConceptRelationship[]): void {
    // Create nodes with enhanced styling
    this.nodes = concepts.map(concept => ({
      id: concept.id,
      concept,
      radius: this.calculateNodeRadius(concept),
      color: this.getNodeColor(concept),
      x: Math.random() * this.config.width,
      y: Math.random() * this.config.height
    }));

    // Create links with styling
    this.links = relationships.map(relationship => {
      const sourceNode = this.nodes.find(n => n.id === relationship.source);
      const targetNode = this.nodes.find(n => n.id === relationship.target);
      
      if (!sourceNode || !targetNode) {
        throw new Error(`Invalid relationship: ${relationship.source} -> ${relationship.target}`);
      }

      return {
        id: `${relationship.source}-${relationship.target}`,
        source: sourceNode,
        target: targetNode,
        relationship,
        strokeWidth: this.calculateLinkWidth(relationship),
        strokeColor: this.getLinkColor(relationship),
        strokeDasharray: this.getLinkDashPattern(relationship)
      };
    });

    // Update simulation
    this.simulation.nodes(this.nodes);
    this.simulation.force<d3.ForceLink<ConceptNode, ConceptLink>>("link")?.links(this.links);
  }

  private calculateNodeRadius(concept: MathematicalConcept): number {
    const baseRadius = 25;
    const difficultyMultiplier = {
      [DifficultyLevel.INTRODUCTORY]: 0.8,
      [DifficultyLevel.INTERMEDIATE]: 1.0,
      [DifficultyLevel.ADVANCED]: 1.2,
      [DifficultyLevel.RESEARCH]: 1.4
    };
    
    const categoryMultiplier = {
      [ConceptCategory.ELLIPTIC_CURVES]: 1.1,
      [ConceptCategory.ABSTRACT_ALGEBRA]: 1.0,
      [ConceptCategory.TOPOLOGY]: 1.0,
      [ConceptCategory.NUMBER_THEORY]: 0.9,
      [ConceptCategory.ALGEBRAIC_GEOMETRY]: 1.1
    };

    return baseRadius * 
           difficultyMultiplier[concept.difficulty] * 
           categoryMultiplier[concept.category];
  }

  private getNodeColor(concept: MathematicalConcept): string {
    const categoryColors = {
      [ConceptCategory.ELLIPTIC_CURVES]: '#8b5cf6',   // Purple
      [ConceptCategory.ABSTRACT_ALGEBRA]: '#3b82f6',  // Blue  
      [ConceptCategory.TOPOLOGY]: '#10b981',          // Green
      [ConceptCategory.NUMBER_THEORY]: '#f59e0b',     // Amber
      [ConceptCategory.ALGEBRAIC_GEOMETRY]: '#ef4444' // Red
    };

    const baseColor = categoryColors[concept.category];
    
    // Adjust opacity based on difficulty
    const difficultyOpacity = {
      [DifficultyLevel.INTRODUCTORY]: '0.7',
      [DifficultyLevel.INTERMEDIATE]: '0.8',
      [DifficultyLevel.ADVANCED]: '0.9',
      [DifficultyLevel.RESEARCH]: '1.0'
    };

    return baseColor + Math.round(255 * parseFloat(difficultyOpacity[concept.difficulty])).toString(16).padStart(2, '0');
  }

  private calculateLinkWidth(relationship: ConceptRelationship): number {
    const baseWidth = 2;
    const strengthMultiplier = {
      [RelationshipType.PREREQUISITE]: 1.5,
      [RelationshipType.APPLICATION]: 1.2,
      [RelationshipType.GENERALIZATION]: 1.3,
      [RelationshipType.SPECIALIZATION]: 1.3,
      [RelationshipType.HOMOMORPHISM]: 2.0,
      [RelationshipType.ISOMORPHISM]: 2.0,
      [RelationshipType.EMBEDDING]: 1.8,
      [RelationshipType.EXAMPLE_OF]: 0.8
    };
    
    return baseWidth * (strengthMultiplier[relationship.type] || 1.0) * relationship.strength;
  }

  private getLinkColor(relationship: ConceptRelationship): string {
    const typeColors = {
      [RelationshipType.PREREQUISITE]: '#dc2626',      // Red - important dependencies
      [RelationshipType.APPLICATION]: '#059669',       // Green - practical use
      [RelationshipType.GENERALIZATION]: '#2563eb',    // Blue - broader concepts
      [RelationshipType.SPECIALIZATION]: '#1d4ed8',    // Dark blue - specific cases
      [RelationshipType.HOMOMORPHISM]: '#be185d',      // Pink - structure preserving
      [RelationshipType.ISOMORPHISM]: '#7c3aed',       // Purple - bijective homomorphism
      [RelationshipType.EMBEDDING]: '#ea580c',         // Orange - injective homomorphism
      [RelationshipType.EXAMPLE_OF]: '#10b981'         // Teal - concrete instances
    };
    
    return typeColors[relationship.type] || '#6b7280';
  }

  private getLinkDashPattern(relationship: ConceptRelationship): string | undefined {
    // Use dashed lines for weaker or conceptual relationships
    if (relationship.strength < 0.5) {
      return '5,5';
    }
    if (relationship.type === RelationshipType.EXAMPLE_OF) {
      return '10,5,2,5';
    }
    return undefined; // Solid line
  }

  public start(): void {
    if (!this.isRunning) {
      this.simulation.alpha(1).restart();
      this.isRunning = true;
    }
  }

  public stop(): void {
    if (this.isRunning) {
      this.simulation.stop();
      this.isRunning = false;
    }
  }

  public restart(): void {
    this.simulation.alpha(0.3).restart();
  }

  public onTick(callback: () => void): void {
    this.simulation.on('tick', callback);
  }

  public onEnd(callback: () => void): void {
    this.simulation.on('end', callback);
  }

  public getNodes(): ConceptNode[] {
    return this.nodes;
  }

  public getLinks(): ConceptLink[] {
    return this.links;
  }

  public pinNode(nodeId: string, x: number, y: number): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      node.fx = x;
      node.fy = y;
    }
  }

  public unpinNode(nodeId: string): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (node) {
      node.fx = null;
      node.fy = null;
    }
  }

  public updateConfig(newConfig: Partial<ConceptSimulationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update simulation forces
    const { width, height, linkDistance, chargeStrength, centerStrength, collisionRadius } = this.config;
    
    this.simulation
      .force("center", d3.forceCenter(width / 2, height / 2).strength(centerStrength))
      .force("collision", d3.forceCollide<ConceptNode>().radius(d => d.radius + collisionRadius))
      .force("charge", d3.forceManyBody().strength(chargeStrength));
      
    const linkForce = this.simulation.force<d3.ForceLink<ConceptNode, ConceptLink>>("link");
    if (linkForce) {
      linkForce.distance(linkDistance);
    }
  }

  public highlightConnections(nodeId: string): { nodes: Set<string>, links: Set<string> } {
    const connectedNodes = new Set<string>([nodeId]);
    const connectedLinks = new Set<string>();

    this.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : String(link.source);
      const targetId = typeof link.target === 'object' ? link.target.id : String(link.target);
      
      if (sourceId === nodeId || targetId === nodeId) {
        connectedNodes.add(sourceId);
        connectedNodes.add(targetId);
        connectedLinks.add(link.id);
      }
    });

    return { nodes: connectedNodes, links: connectedLinks };
  }

  public filterByCategory(categories: ConceptCategory[]): { nodes: ConceptNode[], links: ConceptLink[] } {
    const filteredNodes = this.nodes.filter(node => 
      categories.includes(node.concept.category)
    );
    
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = this.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : String(link.source);
      const targetId = typeof link.target === 'object' ? link.target.id : String(link.target);
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });

    return { nodes: filteredNodes, links: filteredLinks };
  }

  public filterByDifficulty(maxDifficulty: DifficultyLevel): { nodes: ConceptNode[], links: ConceptLink[] } {
    const difficultyOrder = [
      DifficultyLevel.INTRODUCTORY,
      DifficultyLevel.INTERMEDIATE, 
      DifficultyLevel.ADVANCED,
      DifficultyLevel.RESEARCH
    ];
    
    const maxIndex = difficultyOrder.indexOf(maxDifficulty);
    const allowedDifficulties = difficultyOrder.slice(0, maxIndex + 1);
    
    const filteredNodes = this.nodes.filter(node => 
      allowedDifficulties.includes(node.concept.difficulty)
    );
    
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = this.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : String(link.source);
      const targetId = typeof link.target === 'object' ? link.target.id : String(link.target);
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });

    return { nodes: filteredNodes, links: filteredLinks };
  }

  public findShortestPath(startId: string, endId: string): ConceptNode[] | null {
    // Simple BFS for shortest path in concept graph
    const queue: { node: ConceptNode, path: ConceptNode[] }[] = [];
    const visited = new Set<string>();
    
    const startNode = this.nodes.find(n => n.id === startId);
    if (!startNode) return null;
    
    queue.push({ node: startNode, path: [startNode] });
    visited.add(startId);
    
    while (queue.length > 0) {
      const { node, path } = queue.shift()!;
      
      if (node.id === endId) {
        return path;
      }
      
      // Find connected nodes
      const connectedNodeIds = this.links
        .filter(link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : String(link.source);
          const targetId = typeof link.target === 'object' ? link.target.id : String(link.target);
          return sourceId === node.id || targetId === node.id;
        })
        .map(link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : String(link.source);
          const targetId = typeof link.target === 'object' ? link.target.id : String(link.target);
          return sourceId === node.id ? targetId : sourceId;
        });
      
      for (const connectedId of connectedNodeIds) {
        if (!visited.has(connectedId)) {
          const connectedNode = this.nodes.find(n => n.id === connectedId);
          if (connectedNode) {
            visited.add(connectedId);
            queue.push({ 
              node: connectedNode, 
              path: [...path, connectedNode] 
            });
          }
        }
      }
    }
    
    return null; // No path found
  }

  public destroy(): void {
    this.stop();
    this.simulation.on('tick', null);
    this.simulation.on('end', null);
  }
}

// Default configuration for mathematical concept mapping
export const DEFAULT_CONCEPT_SIMULATION_CONFIG: ConceptSimulationConfig = {
  width: 800,
  height: 600,
  linkDistance: 120,
  chargeStrength: -300,
  centerStrength: 0.1,
  collisionRadius: 10,
  velocityDecay: 0.4,
  boundsMargin: 60
};
