/**
 * Comprehensive Group Theory Library
 * Implements finite groups up to order 20 without external dependencies
 */

import { StandardLayoutGenerator } from './StandardLayouts';
import { AdvancedLayoutEngine } from './AdvancedLayoutEngine';

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
    console.log('Available operations keys:', Array.from(group.operations.keys()));
    let edgeCount = 0;

    for (const vertex of vertices) {
      for (let i = 0; i < generators.length; i++) {
        const generator = generators[i];
        console.log(`Looking for operation: ${vertex.id} * ${generator}`);
        
        const vertexOps = group.operations.get(vertex.id);
        if (!vertexOps) {
          console.log(`❌ No operations found for vertex ${vertex.id}`);
          continue;
        }
        
        const target = vertexOps.get(generator);
        console.log(`   Result: ${vertex.id} * ${generator} = ${target}`);
        
        if (target) {
          edges.push({
            source: vertex.id,
            target: target,
            generator,
            color: generatorColors[i % generatorColors.length],
            width: 2
          });
          edgeCount++;
          console.log(`✅ Edge ${edgeCount}: ${vertex.id} --${generator}--> ${target}`);
        } else {
          console.log(`❌ No target found for ${vertex.id} * ${generator}`);
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
    
    console.log(`🎯 Generating optimized layout for ${group.name} (${group.elements.length} elements)`);
    
    const centerX = 400;
    const centerY = 300;
    
    // Choose layout strategy based on group structure
    if (group.isAbelian && group.elements.length <= 12) {
      // Circular layout for small abelian groups
      const radius = Math.min(250, 100 + group.elements.length * 15);
      console.log(`🔄 Using circular layout with radius ${radius}`);
      
      for (let i = 0; i < group.elements.length; i++) {
        const angle = (2 * Math.PI * i) / group.elements.length;
        positions.push({
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          z: layout === '3d' ? 0 : undefined
        });
      }
    } else if (group.name.startsWith('D')) {
      // Special layout for dihedral groups - inner circle for rotations, outer for reflections
      const innerRadius = 120;
      const outerRadius = 200;
      console.log(`� Using dihedral layout (inner: ${innerRadius}, outer: ${outerRadius})`);
      
      const n = Math.floor(group.elements.length / 2); // D_n has 2n elements
      for (let i = 0; i < group.elements.length; i++) {
        const element = group.elements[i];
        const isRotation = element.id.startsWith('r');
        const radius = isRotation ? innerRadius : outerRadius;
        const index = isRotation ? parseInt(element.id.slice(1)) : parseInt(element.id.slice(1));
        const angle = (2 * Math.PI * index) / n;
        
        positions.push({
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          z: layout === '3d' ? (isRotation ? 0 : 50) : undefined
        });
      }
    } else {
      // Grid layout for larger or non-abelian groups
      const cols = Math.ceil(Math.sqrt(group.elements.length));
      const rows = Math.ceil(group.elements.length / cols);
      const spacingX = 80;
      const spacingY = 80;
      console.log(`📐 Using grid layout (${cols}x${rows})`);
      
      for (let i = 0; i < group.elements.length; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        positions.push({
          x: centerX - (cols - 1) * spacingX / 2 + col * spacingX,
          y: centerY - (rows - 1) * spacingY / 2 + row * spacingY,
          z: layout === '3d' ? 0 : undefined
        });
      }
    }
    
    console.log(`📍 Generated ${positions.length} positions`);
    return positions;
  }

  private static getElementColor(element: GroupElement, group: Group): string {
    // Color by conjugacy class
    const colors = ['#3498db', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6', '#e67e22', '#1abc9c', '#34495e'];
    return colors[element.conjugacyClass % colors.length];
  }
}
