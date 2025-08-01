// Standard layouts based on Group Explorer patterns
// This module provides canonical visual representations for well-known finite groups

export interface LayoutPosition {
  x: number;
  y: number;
}

export interface StandardLayout {
  positions: { [elementId: string]: LayoutPosition };
  description: string;
  generators?: string[];
}

export class StandardLayoutGenerator {
  
  // Klein Four Group (V4) - Square layout
  static getKleinFourLayout(): StandardLayout {
    return {
      positions: {
        'e': { x: 0.5, y: 0.5 },     // Identity at center
        'a': { x: 0.2, y: 0.5 },     // Left
        'b': { x: 0.8, y: 0.5 },     // Right  
        'c': { x: 0.5, y: 0.2 }      // Top (ab element)
      },
      description: "Klein Four Group - Square arrangement",
      generators: ['a', 'b']
    };
  }

  // Quaternion Q8 - Cube projection layout
  static getQuaternionLayout(): StandardLayout {
    return {
      positions: {
        '1': { x: 0.5, y: 0.5 },     // Identity at center
        '-1': { x: 0.5, y: 0.2 },    // Opposite identity
        'i': { x: 0.2, y: 0.4 },     // i
        '-i': { x: 0.8, y: 0.6 },    // -i opposite
        'j': { x: 0.4, y: 0.8 },     // j
        '-j': { x: 0.6, y: 0.2 },    // -j opposite
        'k': { x: 0.8, y: 0.4 },     // k
        '-k': { x: 0.2, y: 0.6 }     // -k opposite
      },
      description: "Quaternion Group Q8 - Cube projection",
      generators: ['i', 'j']
    };
  }

  // Dihedral D3 (S3) - Triangle with reflections
  static getDihedral3Layout(): StandardLayout {
    return {
      positions: {
        'e': { x: 0.5, y: 0.5 },     // Identity at center
        'r': { x: 0.5, y: 0.2 },     // Rotation 120°
        'r²': { x: 0.5, y: 0.8 },    // Rotation 240°
        's': { x: 0.2, y: 0.35 },    // Reflection 1
        'sr': { x: 0.8, y: 0.35 },   // Reflection 2
        'sr²': { x: 0.5, y: 0.65 }   // Reflection 3
      },
      description: "Dihedral D3 (S3) - Triangular symmetry",
      generators: ['r', 's']
    };
  }

  // Dihedral D4 - Square with reflections
  static getDihedral4Layout(): StandardLayout {
    return {
      positions: {
        'e': { x: 0.5, y: 0.5 },     // Identity at center
        'r': { x: 0.3, y: 0.3 },     // 90° rotation
        'r²': { x: 0.7, y: 0.3 },    // 180° rotation
        'r³': { x: 0.7, y: 0.7 },    // 270° rotation
        's': { x: 0.3, y: 0.7 },     // Reflection
        'sr': { x: 0.1, y: 0.5 },    // Reflection composition
        'sr²': { x: 0.9, y: 0.5 },   // Reflection composition
        'sr³': { x: 0.5, y: 0.1 }    // Reflection composition
      },
      description: "Dihedral D4 - Square symmetry",
      generators: ['r', 's']
    };
  }

  // Alternating A4 - Tetrahedral layout
  static getAlternating4Layout(): StandardLayout {
    const sqrt3 = Math.sqrt(3);
    return {
      positions: {
        'e': { x: 0.5, y: 0.5 },                    // Identity
        '(123)': { x: 0.5, y: 0.2 },               // 3-cycle
        '(132)': { x: 0.5, y: 0.8 },               // 3-cycle
        '(124)': { x: 0.2, y: 0.35 },              // 3-cycle
        '(142)': { x: 0.8, y: 0.35 },              // 3-cycle
        '(134)': { x: 0.35, y: 0.65 },             // 3-cycle
        '(143)': { x: 0.65, y: 0.65 },             // 3-cycle
        '(234)': { x: 0.2, y: 0.65 },              // 3-cycle
        '(243)': { x: 0.8, y: 0.65 },              // 3-cycle
        '(12)(34)': { x: 0.35, y: 0.35 },          // Double transposition
        '(13)(24)': { x: 0.65, y: 0.35 },          // Double transposition  
        '(14)(23)': { x: 0.5, y: 0.65 }            // Double transposition
      },
      description: "Alternating A4 - Tetrahedral arrangement",
      generators: ['(123)', '(12)(34)']
    };
  }

  // Cyclic groups - circular arrangement
  static getCyclicLayout(n: number): StandardLayout {
    const positions: { [key: string]: LayoutPosition } = {};
    const radius = 0.35;
    const centerX = 0.5;
    const centerY = 0.5;

    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2; // Start from top
      positions[i.toString()] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    }

    return {
      positions,
      description: `Cyclic C${n} - Circular arrangement`,
      generators: ['1']
    };
  }

  // Direct product layouts - grid arrangement
  static getDirectProductLayout(m: number, n: number): StandardLayout {
    const positions: { [key: string]: LayoutPosition } = {};
    const marginX = 0.1;
    const marginY = 0.1;
    const availableWidth = 1 - 2 * marginX;
    const availableHeight = 1 - 2 * marginY;
    
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        const x = marginX + (availableWidth * i) / (m - 1 || 1);
        const y = marginY + (availableHeight * j) / (n - 1 || 1);
        positions[`(${i},${j})`] = { x, y };
      }
    }

    return {
      positions,
      description: `Direct Product C${m} × C${n} - Grid arrangement`,
      generators: ['(1,0)', '(0,1)']
    };
  }

  // Get standard layout for a group by name
  static getStandardLayout(groupName: string, order: number): StandardLayout | null {
    // Special cases first
    switch (groupName) {
      case 'C1':
        return {
          positions: { 'e': { x: 0.5, y: 0.5 } },
          description: "Trivial Group - Single point",
          generators: []
        };
      
      case 'V4':
      case 'Klein4':
        return this.getKleinFourLayout();
      
      case 'Q8':
      case 'Q4':
        return this.getQuaternionLayout();
      
      case 'D3':
      case 'S3':
        return this.getDihedral3Layout();
      
      case 'D4':
        return this.getDihedral4Layout();
      
      case 'A4':
        return this.getAlternating4Layout();
    }

    // Pattern matching
    if (groupName.startsWith('C') && /^C\d+$/.test(groupName)) {
      const n = parseInt(groupName.substring(1));
      if (n <= 20) {
        return this.getCyclicLayout(n);
      }
    }

    // Dihedral groups
    if (groupName.startsWith('D') && /^D\d+$/.test(groupName)) {
      const n = parseInt(groupName.substring(1));
      if (n === 3) return this.getDihedral3Layout();
      if (n === 4) return this.getDihedral4Layout();
      // For other dihedral groups, use a more generic symmetric layout
    }

    // Direct products
    const productMatch = groupName.match(/^C(\d+)xC(\d+)$/);
    if (productMatch) {
      const m = parseInt(productMatch[1]);
      const n = parseInt(productMatch[2]);
      return this.getDirectProductLayout(m, n);
    }

    return null;
  }
}
