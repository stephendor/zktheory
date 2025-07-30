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
    if (group.isAbelian && group.elements.length <= 8) {
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
    } else if (group.isAbelian && group.elements.length > 8) {
      // Spiral layout for larger abelian groups to avoid overcrowding
      console.log(`🌀 Using spiral layout for large abelian group`);
      const baseRadius = 80;
      const spiralSpacing = 25;
      
      for (let i = 0; i < group.elements.length; i++) {
        const angle = (2 * Math.PI * i * 2.5) / group.elements.length; // More turns for spacing
        const radius = baseRadius + (i * spiralSpacing) / group.elements.length;
        positions.push({
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          z: layout === '3d' ? 0 : undefined
        });
      }
    } else if (group.name.startsWith('D')) {
      // Special layout for dihedral groups - adaptive based on size
      const n = Math.floor(group.elements.length / 2); // D_n has 2n elements
      let innerRadius, outerRadius;
      
      if (n <= 6) {
        // Small dihedral groups - tight dual circle
        innerRadius = 100;
        outerRadius = 180;
        console.log(`🔺 Using small dihedral layout (n=${n}, inner: ${innerRadius}, outer: ${outerRadius})`);
      } else {
        // Large dihedral groups - more spacing needed
        innerRadius = 120;
        outerRadius = 220;
        console.log(`🔺 Using large dihedral layout (n=${n}, inner: ${innerRadius}, outer: ${outerRadius})`);
      }
      
      const rotations: number[] = [];
      const reflections: number[] = [];
      
      // Separate rotations and reflections
      for (let i = 0; i < group.elements.length; i++) {
        const element = group.elements[i];
        if (element.id.startsWith('r')) {
          rotations.push(i);
        } else {
          reflections.push(i);
        }
      }
      
      // Position rotations on inner circle
      for (let i = 0; i < rotations.length; i++) {
        const angle = (2 * Math.PI * i) / rotations.length;
        positions[rotations[i]] = {
          x: centerX + innerRadius * Math.cos(angle),
          y: centerY + innerRadius * Math.sin(angle),
          z: layout === '3d' ? 0 : undefined
        };
      }
      
      // Position reflections on outer circle - aligned with polygon vertices when possible
      for (let i = 0; i < reflections.length; i++) {
        const angle = (2 * Math.PI * i) / reflections.length;
        positions[reflections[i]] = {
          x: centerX + outerRadius * Math.cos(angle),
          y: centerY + outerRadius * Math.sin(angle),
          z: layout === '3d' ? 50 : undefined
        };
      }
    } else if (group.name === 'V4' || group.name === 'K4') {
      // Klein Four Group - rectangular layout (Group Explorer style)
      console.log(`⬜ Using Klein Four rectangular layout`);
      const spacingX = 140;
      const spacingY = 100;
      
      // Standard V4 layout: e at center, a,b,ab around it
      const positions_v4 = [
        { x: centerX, y: centerY - spacingY/2 },           // e (identity) at top center
        { x: centerX - spacingX/2, y: centerY + spacingY/2 }, // a (left)
        { x: centerX + spacingX/2, y: centerY + spacingY/2 }, // b (right)
        { x: centerX, y: centerY + spacingY }               // ab (bottom)
      ];
      
      for (let i = 0; i < Math.min(4, group.elements.length); i++) {
        positions.push({
          x: positions_v4[i].x,
          y: positions_v4[i].y,
          z: layout === '3d' ? 0 : undefined
        });
      }
    } else if (group.name === 'S3') {
      // Symmetric group S3 - Group Explorer style layout
      console.log(`🔺 Using S3 Group Explorer layout`);
      
      // S3 standard layout: identity at center, transpositions around it, 3-cycles at outer positions
      const radius1 = 100; // Inner circle for transpositions
      const radius2 = 160; // Outer circle for 3-cycles
      
      // Elements: e, (1 2), (1 3), (2 3), (1 2 3), (1 3 2)
      // Layout: e in center, transpositions in inner triangle, 3-cycles in outer positions
      const s3_positions = [
        { x: centerX, y: centerY },                                    // e (identity) at center
        { x: centerX, y: centerY - radius1 },                         // (1 2) - top
        { x: centerX - radius1 * Math.cos(Math.PI/6), y: centerY + radius1/2 }, // (1 3) - bottom left
        { x: centerX + radius1 * Math.cos(Math.PI/6), y: centerY + radius1/2 }, // (2 3) - bottom right
        { x: centerX - radius2 * Math.cos(Math.PI/6), y: centerY - radius2/2 }, // (1 2 3) - outer left
        { x: centerX + radius2 * Math.cos(Math.PI/6), y: centerY - radius2/2 }  // (1 3 2) - outer right
      ];
      
      for (let i = 0; i < group.elements.length; i++) {
        positions.push({
          x: s3_positions[i].x,
          y: s3_positions[i].y,
          z: layout === '3d' ? 0 : undefined
        });
      }
    } else if (group.name === 'Q8') {
      // Quaternion group - 3D cube-like layout
      console.log(`🧊 Using Quaternion group cube layout`);
      
      // Q8 elements: 1, -1, i, -i, j, -j, k, -k
      // Arrange as vertices of a cube with ±1 at center, i,j,k pairs at opposite corners
      const spacing = 120;
      const q8_positions = [
        { x: centerX, y: centerY },                                    // 1 (identity) at center
        { x: centerX, y: centerY + 30 },                              // -1 slightly offset from center
        { x: centerX - spacing, y: centerY - spacing },               // i - top left
        { x: centerX + spacing, y: centerY + spacing },               // -i - bottom right
        { x: centerX + spacing, y: centerY - spacing },               // j - top right
        { x: centerX - spacing, y: centerY + spacing },               // -j - bottom left
        { x: centerX, y: centerY - spacing },                         // k - top center
        { x: centerX, y: centerY + spacing }                          // -k - bottom center
      ];
      
      for (let i = 0; i < group.elements.length; i++) {
        positions.push({
          x: q8_positions[i].x,
          y: q8_positions[i].y,
          z: layout === '3d' ? 0 : undefined
        });
      }
    } else if (group.name.includes('xC') || group.name.includes('×')) {
      // Direct product groups - rectangular grid layout
      console.log(`📐 Using direct product grid layout`);
      const sqrtOrder = Math.sqrt(group.elements.length);
      const cols = Math.ceil(sqrtOrder);
      const rows = Math.ceil(group.elements.length / cols);
      const spacingX = Math.min(100, 500 / cols);
      const spacingY = Math.min(80, 400 / rows);
      
      for (let i = 0; i < group.elements.length; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        positions.push({
          x: centerX - (cols - 1) * spacingX / 2 + col * spacingX,
          y: centerY - (rows - 1) * spacingY / 2 + row * spacingY,
          z: layout === '3d' ? 0 : undefined
        });
      }
    } else if (group.name.startsWith('(C2)') || group.name === 'C2xC2xC2') {
      // Elementary abelian groups - symmetric layout
      console.log(`⚡ Using elementary abelian layout`);
      if (group.elements.length === 8) {
        // Cube vertices layout for (C2)^3
        const cubeSize = 120;
        const cubePositions = [
          { x: -cubeSize/2, y: -cubeSize/2 }, // 000
          { x: cubeSize/2, y: -cubeSize/2 },  // 001
          { x: -cubeSize/2, y: cubeSize/2 },  // 010
          { x: cubeSize/2, y: cubeSize/2 },   // 011
          { x: -cubeSize/2, y: -cubeSize/4 }, // 100
          { x: cubeSize/2, y: -cubeSize/4 },  // 101
          { x: -cubeSize/2, y: cubeSize/4 },  // 110
          { x: cubeSize/2, y: cubeSize/4 }    // 111
        ];
        
        for (let i = 0; i < Math.min(8, group.elements.length); i++) {
          positions.push({
            x: centerX + cubePositions[i].x,
            y: centerY + cubePositions[i].y,
            z: layout === '3d' ? 0 : undefined
          });
        }
      } else {
        // Default grid for other elementary abelian groups
        const cols = Math.ceil(Math.sqrt(group.elements.length));
        const rows = Math.ceil(group.elements.length / cols);
        const spacingX = 80;
        const spacingY = 80;
        
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
