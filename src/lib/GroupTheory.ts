/**
 * Comprehensive Group Theory Library
 * Implements finite groups up to order 20 without external dependencies
 */

import { StandardLayoutGenerator } from './StandardLayouts';

export interface GroupElement {
  id: string;
  label: string;
  latex?: string;
  order: number;
  inverse: string;
  conjugacyClass: number;
}

export interface GroupOperation {
  left: string;
  right: string;
  result: string;
}

export interface Group {
  name: string;
  displayName: string;
  order: number;
  elements: GroupElement[];
  operations: Map<string, Map<string, string>>;
  generators: string[];
  relations: string[];
  isAbelian: boolean;
  center: string[];
  conjugacyClasses: string[][];
  subgroups: { elements: string[]; name: string; isNormal: boolean }[];
}

export interface CayleyGraphVertex {
  id: string;
  label: string;
  x: number;
  y: number;
  z?: number;
  color: string;
  highlighted?: boolean;
  size?: number;
}

export interface CayleyGraphEdge {
  source: string;
  target: string;
  generator: string;
  color: string;
  highlighted?: boolean;
  width?: number;
}

export interface CayleyGraph {
  vertices: CayleyGraphVertex[];
  edges: CayleyGraphEdge[];
  generators: { id: string; label: string; color: string }[];
}

/**
 * Permutation class for representing group elements
 */
export class Permutation {
  private cycles: number[][];
  private degree: number;

  constructor(cycles: number[][] | number[], degree?: number) {
    if (typeof cycles[0] === 'number') {
      // Array representation [1,2,0] means 0->1, 1->2, 2->0
      const arr = cycles as number[];
      this.degree = degree || arr.length;
      this.cycles = this.arrayToCycles(arr);
    } else {
      // Cycle notation [[0,1,2]] means (0 1 2)
      this.cycles = cycles as number[][];
      this.degree = degree || Math.max(...this.cycles.flat()) + 1;
    }
  }

  private arrayToCycles(arr: number[]): number[][] {
    const visited = new Set<number>();
    const cycles: number[][] = [];

    for (let i = 0; i < arr.length; i++) {
      if (!visited.has(i)) {
        const cycle: number[] = [];
        let current = i;
        
        do {
          cycle.push(current);
          visited.add(current);
          current = arr[current];
        } while (current !== i && !visited.has(current));
        
        if (cycle.length > 1) {
          cycles.push(cycle);
        }
      }
    }
    
    return cycles;
  }

  toArray(): number[] {
    const result = Array.from({ length: this.degree }, (_, i) => i);
    
    for (const cycle of this.cycles) {
      for (let i = 0; i < cycle.length; i++) {
        const next = (i + 1) % cycle.length;
        result[cycle[i]] = cycle[next];
      }
    }
    
    return result;
  }

  toString(): string {
    if (this.cycles.length === 0) return 'e';
    return this.cycles.map(cycle => `(${cycle.join(',')})`).join('');
  }

  multiply(other: Permutation): Permutation {
    const thisArray = this.toArray();
    const otherArray = other.toArray();
    const result = Array.from({ length: Math.max(this.degree, other.degree) }, (_, i) => i);
    
    for (let i = 0; i < result.length; i++) {
      const intermediate = i < otherArray.length ? otherArray[i] : i;
      result[i] = intermediate < thisArray.length ? thisArray[intermediate] : intermediate;
    }
    
    return new Permutation(result);
  }

  inverse(): Permutation {
    const arr = this.toArray();
    const result = Array.from({ length: this.degree }, (_, i) => i);
    
    for (let i = 0; i < arr.length; i++) {
      result[arr[i]] = i;
    }
    
    return new Permutation(result);
  }

  order(): number {
    return this.cycles.reduce((lcm, cycle) => this.lcm(lcm, cycle.length), 1);
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  private lcm(a: number, b: number): number {
    return (a * b) / this.gcd(a, b);
  }

  equals(other: Permutation): boolean {
    const thisArray = this.toArray();
    const otherArray = other.toArray();
    const maxLength = Math.max(thisArray.length, otherArray.length);
    
    for (let i = 0; i < maxLength; i++) {
      const thisVal = i < thisArray.length ? thisArray[i] : i;
      const otherVal = i < otherArray.length ? otherArray[i] : i;
      if (thisVal !== otherVal) return false;
    }
    
    return true;
  }
}

/**
 * Group Theory Library with database integration
 */
import { GroupDatabase } from './GroupDatabase';

export class GroupTheoryLibrary {
  static getGroup(name: string): Group | undefined {
    return GroupDatabase.getGroup(name);
  }

  static getAllGroups(): Group[] {
    return GroupDatabase.getAllGroups();
  }

  static getGroupsByOrder(order: number): Group[] {
    return GroupDatabase.getGroupsByOrder(order);
  }

  static getGroupNames(): string[] {
    return GroupDatabase.getGroupNames();
  }
}

/**
 * Cayley Graph Generator
 */
export class CayleyGraphGenerator {
  static generateGraph(
    group: Group, 
    generators: string[],
    layout: '2d' | '3d' = '2d'
  ): CayleyGraph {
    const vertices: CayleyGraphVertex[] = [];
    const edges: CayleyGraphEdge[] = [];
    
    // Create vertices
    const positions = this.generateLayout(group, layout);
    for (let i = 0; i < group.elements.length; i++) {
      const element = group.elements[i];
      vertices.push({
        id: element.id,
        label: element.label,
        x: positions[i].x,
        y: positions[i].y,
        z: positions[i].z,
        color: this.getElementColor(element, group),
        size: 20
      });
    }

    // Create edges
    const generatorColors = ['#e74c3c', '#27ae60', '#3498db', '#f39c12', '#9b59b6'];
    const genInfo = generators.map((gen, i) => ({
      id: gen,
      label: group.elements.find(e => e.id === gen)?.label || gen,
      color: generatorColors[i % generatorColors.length]
    }));

    console.log('Creating edges for generators:', generators);
    let edgeCount = 0;

    for (const vertex of vertices) {
      for (let i = 0; i < generators.length; i++) {
        const generator = generators[i];
        const target = group.operations.get(vertex.id)?.get(generator);
        
        if (target) {
          edges.push({
            source: vertex.id,
            target: target,
            generator,
            color: generatorColors[i % generatorColors.length],
            width: 2
          });
          edgeCount++;
          console.log(`Edge ${edgeCount}: ${vertex.id} --${generator}--> ${target}`);
        } else {
          console.warn(`No target found for ${vertex.id} * ${generator}`);
        }
      }
    }

    console.log(`Total edges created: ${edgeCount}, Expected: ${group.elements.length * generators.length}`);

    return {
      vertices,
      edges,
      generators: genInfo
    };
  }

  private static generateLayout(
    group: Group, 
    layout: '2d' | '3d'
  ): Array<{x: number, y: number, z?: number}> {
    const positions: Array<{x: number, y: number, z?: number}> = [];
    
    if (layout === '2d') {
      // Try to get standard layout first
      const standardLayout = StandardLayoutGenerator.getStandardLayout(group.name, group.order);
      
      if (standardLayout) {
        console.log(`🎯 Using standard layout for ${group.name}:`, standardLayout.description);
        console.log('Standard positions:', standardLayout.positions);
        
        // Map element IDs to standard positions
        for (const element of group.elements) {
          const standardPos = standardLayout.positions[element.id] || 
                            standardLayout.positions[element.label] ||
                            { x: 0.5, y: 0.5 }; // Fallback to center
          
          console.log(`📍 Element ${element.id}/${element.label} -> (${standardPos.x}, ${standardPos.y})`);
          
          positions.push({
            x: standardPos.x * 600, // Scale to canvas size
            y: standardPos.y * 400,
          });
        }
        
        return positions;
      }
      
      // Fallback to algorithmic layout
      console.log(`⚠️  No standard layout found for ${group.name}, using algorithmic layout`);
      const width = 600;
      const height = 400;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Use circular layout for better edge visibility
      if (group.elements.length <= 8) {
        // For small groups, use circular layout
        const radius = Math.min(width, height) * 0.3;
        for (let i = 0; i < group.elements.length; i++) {
          const angle = (2 * Math.PI * i) / group.elements.length;
          positions.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          });
        }
      } else {
        // For larger groups, use grid layout
        const cols = Math.ceil(Math.sqrt(group.elements.length));
        const rows = Math.ceil(group.elements.length / cols);
        const cellWidth = width * 0.8 / cols;
        const cellHeight = height * 0.8 / rows;
        const startX = centerX - (cols - 1) * cellWidth / 2;
        const startY = centerY - (rows - 1) * cellHeight / 2;
        
        for (let i = 0; i < group.elements.length; i++) {
          const row = Math.floor(i / cols);
          const col = i % cols;
          positions.push({
            x: startX + col * cellWidth,
            y: startY + row * cellHeight
          });
        }
      }
    } else {
      // 3D layout
      for (let i = 0; i < group.elements.length; i++) {
        const theta = (2 * Math.PI * i) / group.elements.length;
        const phi = Math.acos(1 - 2 * (i / group.elements.length));
        const radius = 200;
        
        positions.push({
          x: radius * Math.sin(phi) * Math.cos(theta) + 300,
          y: radius * Math.sin(phi) * Math.sin(theta) + 200,
          z: radius * Math.cos(phi)
        });
      }
    }
    
    return positions;
  }

  private static getElementColor(element: GroupElement, group: Group): string {
    // Color by conjugacy class
    const colors = ['#3498db', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6', '#e67e22', '#1abc9c', '#34495e'];
    return colors[element.conjugacyClass % colors.length];
  }
}
