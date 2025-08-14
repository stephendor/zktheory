/**
 * Comprehensive Group Theory Library
 * Implements finite groups up to order 20 without external dependencies
 */

import { StandardLayoutGenerator } from './StandardLayouts';
import { AdvancedLayoutEngine } from './AdvancedLayoutEngine';

// Export elliptic curve types and functions
export * from './EllipticCurveGroups';

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
 * Group Theory Library with database integration and elliptic curve support
 */
import { GroupDatabase } from './GroupDatabase';
import { 
  EllipticCurveGroupGenerator, 
  EllipticCurveGroup,
  EllipticCurve 
} from './EllipticCurveGroups';

export class GroupTheoryLibrary {
  private static ellipticCurveGroups: Map<string, Group> = new Map();

  static getGroup(name: string): Group | undefined {
    // Check if it's an elliptic curve group
    if (name.startsWith('EC_')) {
      return this.ellipticCurveGroups.get(name);
    }
    return GroupDatabase.getGroup(name);
  }

  static getAllGroups(): Group[] {
    const standardGroups = GroupDatabase.getAllGroups();
    const ecGroups = Array.from(this.ellipticCurveGroups.values());
    return [...standardGroups, ...ecGroups];
  }

  static getGroupsByOrder(order: number): Group[] {
    const standardGroups = GroupDatabase.getGroupsByOrder(order);
    const ecGroups = Array.from(this.ellipticCurveGroups.values())
      .filter(group => group.order === order);
    return [...standardGroups, ...ecGroups];
  }

  static getGroupNames(): string[] {
    const standardNames = GroupDatabase.getGroupNames();
    const ecNames = Array.from(this.ellipticCurveGroups.keys());
    return [...standardNames, ...ecNames];
  }

  /**
   * Initialize elliptic curve groups
   */
  static initializeEllipticCurveGroups(): void {
    try {
      const curves = EllipticCurveGroupGenerator.getPredefinedCurves();
      
      curves.forEach(curve => {
        try {
          const ecGroup = EllipticCurveGroupGenerator.createEllipticCurveGroup(curve);
          const standardGroup = EllipticCurveGroupGenerator.toStandardGroup(ecGroup);
          this.ellipticCurveGroups.set(standardGroup.name, standardGroup);
          console.log(`✓ Successfully initialized elliptic curve group: ${standardGroup.name}`);
        } catch (error) {
          console.warn(`⚠️ Failed to initialize elliptic curve ${curve.name}:`, error);
          // Continue with other curves even if one fails
        }
      });
    } catch (error) {
      console.error('❌ Failed to initialize elliptic curve groups:', error);
      // Don't let elliptic curve failures break the entire system
    }
  }

  /**
   * Get all available elliptic curves
   */
  static getEllipticCurves(): EllipticCurve[] {
    return EllipticCurveGroupGenerator.getPredefinedCurves();
  }

  /**
   * Get elliptic curve group by curve parameters
   */
  static getEllipticCurveGroup(a: number, b: number, p: number): Group | undefined {
    const curveName = `E_${p}_${a}_${b}`;
    return this.ellipticCurveGroups.get(`EC_${curveName}`);
  }
}

// Initialize elliptic curve groups on module load (with error handling)
try {
  GroupTheoryLibrary.initializeEllipticCurveGroups();
} catch (error) {
  console.error('❌ Failed to initialize elliptic curve system:', error);
  console.log('📋 Continuing with standard groups only');
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
    if (group.name.includes('xC') || group.name.includes('×') || group.name.startsWith('(C2)') || group.name === 'C2xC2xC2') {
      // Direct product and elementary abelian groups - check first before general abelian
      if (group.name.startsWith('(C2)') || group.name === 'C2xC2xC2') {
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
          const spacingX = 90;
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
        // Direct product groups - rectangular grid layout
        console.log(`📐 Using direct product grid layout for ${group.name}`);
        
        // Extract the component orders for better grid arrangement
        let cols, rows;
        if (group.name === 'C2xC4') {
          cols = 2; rows = 4;
        } else if (group.name === 'C3xC3') {
          cols = 3; rows = 3;
        } else if (group.name === 'C2xC6') {
          cols = 2; rows = 6;
        } else if (group.name === 'C4xC4') {
          cols = 4; rows = 4;
        } else if (group.name === 'C4xC5') {
          cols = 4; rows = 5;
        } else if (group.name === 'C2xC10') {
          cols = 2; rows = 10;
        } else {
          // Default square-ish arrangement
          const sqrtOrder = Math.sqrt(group.elements.length);
          cols = Math.ceil(sqrtOrder);
          rows = Math.ceil(group.elements.length / cols);
        }
        
        const spacingX = Math.min(120, 600 / cols);
        const spacingY = Math.min(100, 500 / rows);
        
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
    } else if (group.isAbelian && group.elements.length <= 8) {
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
    } else if (group.isAbelian && group.elements.length > 8 && group.elements.length <= 16) {
      // Enhanced spacing layout for medium abelian groups
      console.log(`🌀 Using enhanced spacing layout for medium abelian group`);
      const baseRadius = 150; // Increased from 140 for more starting space
      const radiusIncrement = 30; // Increased from 25 for better separation
      const angleIncrement = (2 * Math.PI) / 5; // Reduced from 6 to 5 elements per turn for more space
      
      for (let i = 0; i < group.elements.length; i++) {
        const angle = i * angleIncrement;
        const radius = baseRadius + Math.floor(i / 5) * radiusIncrement; // Every 5 elements instead of 6
        positions.push({
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          z: layout === '3d' ? 0 : undefined
        });
      }
    } else if (group.isAbelian && group.elements.length > 16) {
      // Concentric circles layout for very large abelian groups
      console.log(`⭕ Using concentric circles layout for large abelian group`);
      const elementsPerRing = 8;
      const baseRadius = 100;
      const ringSpacing = 60;
      
      for (let i = 0; i < group.elements.length; i++) {
        const ring = Math.floor(i / elementsPerRing);
        const positionInRing = i % elementsPerRing;
        const radius = baseRadius + ring * ringSpacing;
        const angle = (2 * Math.PI * positionInRing) / elementsPerRing;
        
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
    } else if (group.name === 'A4' || group.name === 'T') {
      // Alternating Group A4 - Using canonical tetrahedral structure
      console.log(`🔺 A4 layout - canonical tetrahedral structure from mathematical literature`);
      
      // A4 canonical structure: 
      // - Identity: e
      // - 8 three-cycles: (123), (132), (124), (142), (134), (143), (234), (243)  
      // - 3 double transpositions: (12)(34), (13)(24), (14)(23)
      
      // Standard tetrahedral arrangement - 4 triangular faces
      // Each face is a triangle of 3 elements
      const tetrahedralFaces = [
        ['e', '12)(34', '13)(24'],      // Face 1: identity + 2 double transpositions
        ['123', '142', '134'],          // Face 2: 3-cycles involving vertex 1
        ['132', '124', '143'],          // Face 3: inverse 3-cycles  
        ['234', '243', '14)(23']        // Face 4: 3-cycles + remaining double transposition
      ];
      
      console.log(`Tetrahedral faces:`, tetrahedralFaces);
      
      // Initialize positions array
      for (let i = 0; i < group.elements.length; i++) {
        positions.push({ x: centerX, y: centerY, z: layout === '3d' ? 0 : undefined });
      }
      
      // Arrange the 4 tetrahedral faces in a tetrahedral pattern
      // Face positions: top, bottom-left, bottom-right, back
      const facePositions = [
        { centerX: centerX, centerY: centerY - 120 },           // Face 1: top
        { centerX: centerX - 100, centerY: centerY + 60 },      // Face 2: bottom-left  
        { centerX: centerX + 100, centerY: centerY + 60 },      // Face 3: bottom-right
        { centerX: centerX, centerY: centerY + 120 }            // Face 4: bottom
      ];
      
      const faceRadius = 50;
      
      // Place each tetrahedral face as a triangle
      for (let faceIndex = 0; faceIndex < tetrahedralFaces.length; faceIndex++) {
        const face = tetrahedralFaces[faceIndex];
        const faceCenter = facePositions[faceIndex];
        
        // Triangle vertices for this face
        const triangleVertices = [
          { x: faceCenter.centerX, y: faceCenter.centerY - faceRadius },                           // top vertex
          { x: faceCenter.centerX + faceRadius * Math.cos(Math.PI/6), y: faceCenter.centerY + faceRadius/2 }, // bottom-right vertex
          { x: faceCenter.centerX - faceRadius * Math.cos(Math.PI/6), y: faceCenter.centerY + faceRadius/2 }  // bottom-left vertex
        ];
        
        // Place elements in this face
        for (let i = 0; i < face.length && i < 3; i++) {
          const elementId = face[i];
          const elementIndex = group.elements.findIndex(e => e.id === elementId);
          if (elementIndex !== -1) {
            positions[elementIndex] = {
              x: triangleVertices[i].x,
              y: triangleVertices[i].y,
              z: layout === '3d' ? 0 : undefined
            };
          }
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
