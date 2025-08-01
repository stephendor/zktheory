// Advanced Layout Engine - Implementing Group Explorer's sophisticated layout strategies
// This replicates and modernizes the layout algorithms from Group Explorer

import { Group, GroupElement } from './GroupTheory';
import { StandardLayoutGenerator, LayoutPosition } from './StandardLayouts';

export type LayoutStrategy = 'linear' | 'circular' | 'rotated';
export type LayoutDirection = 'X' | 'Y' | 'Z' | 'XY' | 'XZ' | 'YZ';

export interface LayoutNestingLevel {
  generator: string;
  strategy: LayoutStrategy;
  direction: LayoutDirection;
  nestingLevel: number;
  subgroupElements?: string[];
}

export interface AdvancedLayout {
  positions: { [elementId: string]: { x: number, y: number, z?: number } };
  nestingStructure: LayoutNestingLevel[];
  description: string;
  is3D: boolean;
}

export class AdvancedLayoutEngine {
  
  /**
   * Main entry point - generates optimal layout for any group
   * Replicates Group Explorer's CayleyGeneratorFromStrategy logic
   */
  static generateOptimalLayout(
    group: Group, 
    generators: string[], 
    prefer3D: boolean = false
  ): AdvancedLayout {
    
    // First try standard layouts for well-known groups
    const standardLayout = StandardLayoutGenerator.getStandardLayout(group.name, group.order);
    if (standardLayout && !prefer3D) {
      console.log(`🎯 Using predefined standard layout for ${group.name}`);
      return this.convertStandardToAdvanced(standardLayout);
    }

    console.log(`🧠 Computing advanced layout for ${group.name} with generators:`, generators);
    
    // Analyze group structure to determine optimal strategy
    const analysis = this.analyzeGroupStructure(group, generators);
    console.log('Group analysis:', analysis);
    
    // Generate nesting strategy based on generators
    const nestingStrategy = this.generateNestingStrategy(group, generators, analysis);
    console.log('Nesting strategy:', nestingStrategy);
    
    // Apply the layout strategy
    const layout = this.applyNestingStrategy(group, nestingStrategy, prefer3D);
    
    return layout;
  }

  /**
   * Analyzes group structure to determine optimal layout approach
   * Similar to Group Explorer's strategy selection logic
   */
  private static analyzeGroupStructure(group: Group, generators: string[]) {
    const analysis = {
      isCyclic: this.isCyclic(group),
      isAbelian: group.isAbelian,
      isDihedral: this.isDihedral(group),
      generatorOrders: generators.map(gen => 
        group.elements.find(e => e.id === gen)?.order || 1
      ),
      subgroupChain: this.computeSubgroupChain(group, generators),
      symmetryType: this.detectSymmetryType(group)
    };

    return analysis;
  }

  /**
   * Generates hierarchical nesting strategy
   * Replicates Group Explorer's nesting level computation
   */
  private static generateNestingStrategy(
    group: Group, 
    generators: string[], 
    analysis: any
  ): LayoutNestingLevel[] {
    const strategy: LayoutNestingLevel[] = [];
    
    // Handle trivial group special case
    if (group.order === 1) {
      return [{
        generator: '',
        strategy: 'linear',
        direction: 'X',
        nestingLevel: 0,
        subgroupElements: ['e']
      }];
    }

    // For each generator, determine optimal layout strategy
    generators.forEach((generator, index) => {
      const generatorElement = group.elements.find(e => e.id === generator);
      const generatorOrder = generatorElement?.order || 1;
      
      let layoutStrategy: LayoutStrategy = 'linear';
      let direction: LayoutDirection = 'X';
      
      // Strategy selection logic (based on Group Explorer's approach)
      if (generatorOrder === 2) {
        layoutStrategy = 'linear';
        direction = index === 0 ? 'X' : (index === 1 ? 'Y' : 'Z');
      } else if (generatorOrder <= 4 && analysis.isCyclic) {
        layoutStrategy = 'circular';
        direction = 'XY';
      } else if (generatorOrder > 4 || analysis.isDihedral) {
        layoutStrategy = 'circular';
        direction = index === 0 ? 'XY' : 'XZ';
      } else {
        // For complex cases, use rotated layout
        layoutStrategy = 'rotated';
        direction = 'XY';
      }

      strategy.push({
        generator,
        strategy: layoutStrategy,
        direction,
        nestingLevel: index,
        subgroupElements: this.computeGeneratedSubgroup(group, generator)
      });
    });

    return strategy;
  }

  /**
   * Applies the nesting strategy to generate final positions
   * Implements Group Explorer's coordinate transformation system
   */
  private static applyNestingStrategy(
    group: Group, 
    strategy: LayoutNestingLevel[], 
    is3D: boolean
  ): AdvancedLayout {
    const positions: { [elementId: string]: { x: number, y: number, z?: number } } = {};
    
    // Base case: single element at origin
    if (group.order === 1) {
      positions['e'] = { x: 300, y: 200, z: is3D ? 0 : undefined };
      return {
        positions,
        nestingStructure: strategy,
        description: 'Trivial group - single point',
        is3D
      };
    }

    // For each nesting level, arrange elements according to strategy
    let currentElements = ['e']; // Start with identity
    const canvasWidth = 600;
    const canvasHeight = 400;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    // Initialize identity at center
    positions['e'] = { x: centerX, y: centerY, z: is3D ? 0 : undefined };

    strategy.forEach((level, levelIndex) => {
      const { generator, strategy: layoutStrategy, direction } = level;
      
      console.log(`Applying level ${levelIndex}: ${layoutStrategy} layout for generator ${generator}`);
      
      // Get all elements that will be positioned at this level
      const newElements = this.getElementsForLevel(group, currentElements, generator);
      
      // Apply the specific layout strategy
      switch (layoutStrategy) {
        case 'linear':
          this.applyLinearLayout(newElements, positions, direction, centerX, centerY, is3D);
          break;
        case 'circular':
          this.applyCircularLayout(newElements, positions, direction, centerX, centerY, is3D);
          break;
        case 'rotated':
          this.applyRotatedLayout(newElements, positions, direction, centerX, centerY, is3D);
          break;
      }
      
      currentElements = [...currentElements, ...newElements];
    });

    return {
      positions,
      nestingStructure: strategy,
      description: `Advanced layout with ${strategy.length} nesting levels`,
      is3D
    };
  }

  /**
   * Linear layout strategy - distributes elements along an axis
   */
  private static applyLinearLayout(
    elements: string[], 
    positions: any, 
    direction: LayoutDirection,
    centerX: number, 
    centerY: number, 
    is3D: boolean
  ) {
    const spacing = 80;
    const startOffset = -(elements.length - 1) * spacing / 2;
    
    elements.forEach((element, index) => {
      const offset = startOffset + index * spacing;
      
      switch (direction) {
        case 'X':
          positions[element] = { 
            x: centerX + offset, 
            y: centerY, 
            z: is3D ? 0 : undefined 
          };
          break;
        case 'Y':
          positions[element] = { 
            x: centerX, 
            y: centerY + offset, 
            z: is3D ? 0 : undefined 
          };
          break;
        case 'Z':
          positions[element] = { 
            x: centerX, 
            y: centerY, 
            z: is3D ? offset : undefined 
          };
          break;
      }
    });
  }

  /**
   * Circular layout strategy - arranges elements in a circle
   */
  private static applyCircularLayout(
    elements: string[], 
    positions: any, 
    direction: LayoutDirection,
    centerX: number, 
    centerY: number, 
    is3D: boolean
  ) {
    const radius = Math.min(centerX, centerY) * 0.6;
    
    elements.forEach((element, index) => {
      const angle = (2 * Math.PI * index) / elements.length;
      
      switch (direction) {
        case 'XY':
          positions[element] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
            z: is3D ? 0 : undefined
          };
          break;
        case 'XZ':
          positions[element] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY,
            z: is3D ? radius * Math.sin(angle) : undefined
          };
          break;
        case 'YZ':
          positions[element] = {
            x: centerX,
            y: centerY + radius * Math.cos(angle),
            z: is3D ? radius * Math.sin(angle) : undefined
          };
          break;
      }
    });
  }

  /**
   * Rotated layout strategy - creates rotational symmetry patterns
   */
  private static applyRotatedLayout(
    elements: string[], 
    positions: any, 
    direction: LayoutDirection,
    centerX: number, 
    centerY: number, 
    is3D: boolean
  ) {
    // Similar to circular but with rotation offset
    const radius = Math.min(centerX, centerY) * 0.7;
    const rotationOffset = Math.PI / 4; // 45-degree offset
    
    elements.forEach((element, index) => {
      const angle = (2 * Math.PI * index) / elements.length + rotationOffset;
      
      positions[element] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        z: is3D ? 20 * Math.sin(angle * 2) : undefined // Add some 3D variation
      };
    });
  }

  // Helper methods for group analysis
  private static isCyclic(group: Group): boolean {
    return group.generators.length === 1;
  }

  private static isDihedral(group: Group): boolean {
    return group.name.startsWith('D') && group.generators.length === 2;
  }

  private static detectSymmetryType(group: Group): string {
    if (group.name.startsWith('C')) return 'cyclic';
    if (group.name.startsWith('D')) return 'dihedral';
    if (group.name.startsWith('S')) return 'symmetric';
    if (group.name.startsWith('A')) return 'alternating';
    if (group.name.includes('x')) return 'product';
    return 'general';
  }

  private static computeSubgroupChain(group: Group, generators: string[]): string[][] {
    // Simplified subgroup chain computation
    const chain: string[][] = [['e']];
    
    generators.forEach(gen => {
      const subgroup = this.computeGeneratedSubgroup(group, gen);
      chain.push(subgroup);
    });
    
    return chain;
  }

  private static computeGeneratedSubgroup(group: Group, generator: string): string[] {
    const subgroup = new Set<string>(['e']);
    const generatorElement = group.elements.find(e => e.id === generator);
    
    if (!generatorElement) return ['e'];
    
    let current = generator;
    subgroup.add(current);
    
    // Generate powers of the generator
    for (let i = 2; i < generatorElement.order; i++) {
      const next = group.operations.get(current)?.get(generator);
      if (next && !subgroup.has(next)) {
        subgroup.add(next);
        current = next;
      } else {
        break;
      }
    }
    
    return Array.from(subgroup);
  }

  private static getElementsForLevel(
    group: Group, 
    currentElements: string[], 
    generator: string
  ): string[] {
    const newElements: string[] = [];
    
    currentElements.forEach(element => {
      const product = group.operations.get(element)?.get(generator);
      if (product && !currentElements.includes(product) && !newElements.includes(product)) {
        newElements.push(product);
      }
    });
    
    return newElements;
  }

  private static convertStandardToAdvanced(standardLayout: any): AdvancedLayout {
    const positions: { [elementId: string]: { x: number, y: number } } = {};
    
    Object.entries(standardLayout.positions).forEach(([elementId, pos]: [string, any]) => {
      positions[elementId] = {
        x: pos.x * 600,
        y: pos.y * 400
      };
    });

    return {
      positions,
      nestingStructure: [],
      description: standardLayout.description,
      is3D: false
    };
  }
}
