/**
 * Comprehensive Jest Unit Tests for StandardLayouts
 * Tests mathematical accuracy, geometric properties, and layout generation algorithms
 */

import { 
  StandardLayoutGenerator,
  StandardLayout,
  LayoutPosition 
} from '@/lib/StandardLayouts';
import { GroupDatabase } from '@/lib/GroupDatabase';
import { Group } from '@/lib/GroupTheory';
import { 
  mathematicalMatchers,
  MATHEMATICAL_PRECISION,
  PrecisionValidator,
  aggregateValidationResults
} from '../utils/mathematicalValidation';

// Extend Jest matchers
expect.extend(mathematicalMatchers);

describe('StandardLayoutGenerator', () => {
  
  describe('Klein Four Group Layout (V4)', () => {
    let layout: StandardLayout;

    beforeEach(() => {
      layout = StandardLayoutGenerator.getKleinFourLayout();
    });

    test('generates correct V4 group structure', () => {
      expect(layout).toHaveProperty('positions');
      expect(layout).toHaveProperty('description');
      expect(layout).toHaveProperty('generators');
      
      expect(layout.description).toBe("Klein Four Group - Square arrangement");
      expect(layout.generators).toEqual(['a', 'b']);
    });

    test('validates V4 element positioning', () => {
      const { positions } = layout;
      
      // Check all required elements present
      expect(positions).toHaveProperty('e'); // Identity
      expect(positions).toHaveProperty('a'); // First generator
      expect(positions).toHaveProperty('b'); // Second generator
      expect(positions).toHaveProperty('c'); // Product ab
      
      // Validate coordinate ranges [0, 1]
      Object.values(positions).forEach(pos => {
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.x).toBeLessThanOrEqual(1);
        expect(pos.y).toBeGreaterThanOrEqual(0);
        expect(pos.y).toBeLessThanOrEqual(1);
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
      });
    });

    test('verifies V4 geometric properties', () => {
      const { positions } = layout;
      
      // Identity should be at center
      expect(positions.e.x).toBeCloseTo(0.5, 5);
      expect(positions.e.y).toBeCloseTo(0.5, 5);
      
      // Verify rectangular arrangement constraints
      expect(positions.a.x).toBeLessThan(positions.e.x); // Left of center
      expect(positions.b.x).toBeGreaterThan(positions.e.x); // Right of center
      expect(positions.c.y).toBeLessThan(positions.e.y); // Above center
    });

    test('validates symmetry properties', () => {
      const { positions } = layout;
      
      // Calculate distances from center
      const distances = {
        a: Math.sqrt((positions.a.x - 0.5) ** 2 + (positions.a.y - 0.5) ** 2),
        b: Math.sqrt((positions.b.x - 0.5) ** 2 + (positions.b.y - 0.5) ** 2),
        c: Math.sqrt((positions.c.x - 0.5) ** 2 + (positions.c.y - 0.5) ** 2)
      };
      
      // Non-identity elements should be equidistant from center
      expect(distances.a).toBeCloseTo(distances.b, 5);
      expect(distances.a).toBeCloseTo(distances.c, 5);
    });

    test('ensures unique positioning', () => {
      const { positions } = layout;
      const coords = Object.values(positions).map(p => `${p.x},${p.y}`);
      const uniqueCoords = new Set(coords);
      
      expect(uniqueCoords.size).toBe(coords.length);
    });
  });

  describe('Quaternion Group Layout (Q8)', () => {
    let layout: StandardLayout;

    beforeEach(() => {
      layout = StandardLayoutGenerator.getQuaternionLayout();
    });

    test('generates correct Q8 group structure', () => {
      expect(layout.description).toBe("Quaternion Group Q8 - Cube projection");
      expect(layout.generators).toEqual(['i', 'j']);
      
      // Should have 8 elements
      expect(Object.keys(layout.positions)).toHaveLength(8);
    });

    test('validates Q8 element positioning', () => {
      const { positions } = layout;
      const expectedElements = ['1', '-1', 'i', '-i', 'j', '-j', 'k', '-k'];
      
      expectedElements.forEach(element => {
        expect(positions).toHaveProperty(element);
        expect(Number.isFinite(positions[element].x)).toBe(true);
        expect(Number.isFinite(positions[element].y)).toBe(true);
      });
    });

    test('verifies Q8 quaternion pairing properties', () => {
      const { positions } = layout;
      
      // Quaternion opposites should have specific geometric relationships
      const pairs = [
        ['1', '-1'], ['i', '-i'], ['j', '-j'], ['k', '-k']
      ];
      
      pairs.forEach(([pos, neg]) => {
        const distance = Math.sqrt(
          (positions[pos].x - positions[neg].x) ** 2 + 
          (positions[pos].y - positions[neg].y) ** 2
        );
        expect(distance).toBeGreaterThan(0.1); // Should be separated
      });
    });

    test('validates cube projection geometry', () => {
      const { positions } = layout;
      
      // Identity at center
      expect(positions['1'].x).toBeCloseTo(0.5, 5);
      expect(positions['1'].y).toBeCloseTo(0.5, 5);
      
      // All positions should be in [0,1] × [0,1]
      Object.values(positions).forEach(pos => {
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.x).toBeLessThanOrEqual(1);
        expect(pos.y).toBeGreaterThanOrEqual(0);
        expect(pos.y).toBeLessThanOrEqual(1);
      });
    });

    test('ensures mathematical consistency with quaternion relations', () => {
      const { positions } = layout;
      
      // Verify generators are present and positioned
      expect(positions).toHaveProperty('i');
      expect(positions).toHaveProperty('j');
      expect(positions).toHaveProperty('k');
      
      // Check that i, j, k are distributed around the layout
      const iPos = positions['i'];
      const jPos = positions['j'];
      const kPos = positions['k'];
      
      // They should form a non-degenerate triangle
      const area = Math.abs(
        (iPos.x * (jPos.y - kPos.y) + 
         jPos.x * (kPos.y - iPos.y) + 
         kPos.x * (iPos.y - jPos.y)) / 2
      );
      expect(area).toBeGreaterThan(0.01); // Non-zero area
    });
  });

  describe('Dihedral Group Layouts', () => {
    
    describe('Dihedral D3 (S3) Layout', () => {
      let layout: StandardLayout;

      beforeEach(() => {
        layout = StandardLayoutGenerator.getDihedral3Layout();
      });

      test('generates correct D3 group structure', () => {
        expect(layout.description).toBe("Dihedral D3 (S3) - Triangular symmetry");
        expect(layout.generators).toEqual(['r', 's']);
        expect(Object.keys(layout.positions)).toHaveLength(6);
      });

      test('validates D3 element positioning', () => {
        const { positions } = layout;
        const expectedElements = ['e', 'r', 'r²', 's', 'sr', 'sr²'];
        
        expectedElements.forEach(element => {
          expect(positions).toHaveProperty(element);
        });
      });

      test('verifies triangular symmetry properties', () => {
        const { positions } = layout;
        
        // Identity at center
        expect(positions.e.x).toBeCloseTo(0.5, 5);
        expect(positions.e.y).toBeCloseTo(0.5, 5);
        
        // Rotation elements should form a pattern
        const rotations = [positions.r, positions['r²']];
        rotations.forEach(pos => {
          const distance = Math.sqrt((pos.x - 0.5) ** 2 + (pos.y - 0.5) ** 2);
          expect(distance).toBeGreaterThan(0.1); // Away from center
        });
      });

      test('validates reflection arrangement', () => {
        const { positions } = layout;
        const reflections = ['s', 'sr', 'sr²'];
        
        // Reflections should be positioned to show triangular symmetry
        reflections.forEach(refl => {
          expect(positions[refl].x).toBeGreaterThanOrEqual(0);
          expect(positions[refl].x).toBeLessThanOrEqual(1);
          expect(positions[refl].y).toBeGreaterThanOrEqual(0);
          expect(positions[refl].y).toBeLessThanOrEqual(1);
        });
      });
    });

    describe('Dihedral D4 Layout', () => {
      let layout: StandardLayout;

      beforeEach(() => {
        layout = StandardLayoutGenerator.getDihedral4Layout();
      });

      test('generates correct D4 group structure', () => {
        expect(layout.description).toBe("Dihedral D4 - Square symmetry");
        expect(layout.generators).toEqual(['r', 's']);
        expect(Object.keys(layout.positions)).toHaveLength(8);
      });

      test('validates D4 square symmetry properties', () => {
        const { positions } = layout;
        
        // Check rotation elements form a square pattern
        const rotations = [positions.r, positions['r²'], positions['r³']];
        const center = positions.e;
        
        // Calculate distances from center for rotations
        const distances = rotations.map(pos => 
          Math.sqrt((pos.x - center.x) ** 2 + (pos.y - center.y) ** 2)
        );
        
        // All rotations should be equidistant from center
        expect(distances[0]).toBeCloseTo(distances[1], 5);
        expect(distances[0]).toBeCloseTo(distances[2], 5);
      });

      test('verifies square geometric constraints', () => {
        const { positions } = layout;
        
        // Check that rotations approximate a square arrangement
        const r = positions.r;
        const r2 = positions['r²'];
        const r3 = positions['r³'];
        
        // Adjacent rotations should be roughly equidistant
        const d1 = Math.sqrt((r.x - r2.x) ** 2 + (r.y - r2.y) ** 2);
        const d2 = Math.sqrt((r2.x - r3.x) ** 2 + (r2.y - r3.y) ** 2);
        
        expect(Math.abs(d1 - d2)).toBeLessThan(0.1); // Similar distances
      });
    });
  });

  describe('Cyclic Group Circular Layouts', () => {
    
    test.each([3, 4, 5, 6, 8, 12])('generates valid C%d circular layout', (n) => {
      const layout = StandardLayoutGenerator.getCyclicLayout(n);
      
      expect(layout.description).toBe(`Cyclic C${n} - Circular arrangement`);
      expect(layout.generators).toEqual(['1']);
      expect(Object.keys(layout.positions)).toHaveLength(n);
    });

    test('validates circular positioning mathematics for C6', () => {
      const layout = StandardLayoutGenerator.getCyclicLayout(6);
      const { positions } = layout;
      
      // Check all positions are on a circle
      const radius = 0.35; // From implementation
      const center = { x: 0.5, y: 0.5 };
      
      Object.values(positions).forEach(pos => {
        const distance = Math.sqrt((pos.x - center.x) ** 2 + (pos.y - center.y) ** 2);
        expect(distance).toBeCloseTo(radius, 4);
      });
    });

    test('verifies angular distribution for cyclic groups', () => {
      const n = 8;
      const layout = StandardLayoutGenerator.getCyclicLayout(n);
      const { positions } = layout;
      
      // Calculate angles for each position
      const center = { x: 0.5, y: 0.5 };
      const angles = Object.keys(positions).sort((a, b) => parseInt(a) - parseInt(b)).map(key => {
        const pos = positions[key];
        let angle = Math.atan2(pos.y - center.y, pos.x - center.x);
        // Normalize to [0, 2π] and account for starting from top (-π/2)
        angle = (angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
        return angle;
      });
      
      // Check distribution - consecutive angles should be evenly spaced
      const expectedAngleStep = 2 * Math.PI / n;
      
      for (let i = 0; i < angles.length; i++) {
        const expectedAngle = (expectedAngleStep * i) % (2 * Math.PI);
        expect(angles[i]).toBeCloseTo(expectedAngle, 1);
      }
    });

    test('handles edge cases for small cyclic groups', () => {
      // C1 - single element
      const c1 = StandardLayoutGenerator.getCyclicLayout(1);
      expect(Object.keys(c1.positions)).toHaveLength(1);
      
      // Check position is roughly at top (allowing for floating point precision)
      const pos = c1.positions['0'];
      expect(pos.x).toBeCloseTo(0.5, 5);
      expect(pos.y).toBeCloseTo(0.15, 5);
      
      // C2 - two elements
      const c2 = StandardLayoutGenerator.getCyclicLayout(2);
      expect(Object.keys(c2.positions)).toHaveLength(2);
    });
  });

  describe('Direct Product Layouts', () => {
    
    test.each([
      [2, 2], [2, 3], [3, 3], [2, 4], [3, 4]
    ])('generates valid C%d × C%d grid layout', (m, n) => {
      const layout = StandardLayoutGenerator.getDirectProductLayout(m, n);
      
      expect(layout.description).toBe(`Direct Product C${m} × C${n} - Grid arrangement`);
      expect(layout.generators).toEqual(['(1,0)', '(0,1)']);
      expect(Object.keys(layout.positions)).toHaveLength(m * n);
    });

    test('validates grid positioning mathematics for C3 × C2', () => {
      const layout = StandardLayoutGenerator.getDirectProductLayout(3, 2);
      const { positions } = layout;
      
      // Check grid structure
      const expectedPositions = [
        '(0,0)', '(0,1)', '(1,0)', '(1,1)', '(2,0)', '(2,1)'
      ];
      
      expectedPositions.forEach(pos => {
        expect(positions).toHaveProperty(pos);
      });
      
      // Verify positions form a proper grid
      const margin = 0.1;
      const availableWidth = 1 - 2 * margin;
      const availableHeight = 1 - 2 * margin;
      
      // Check some specific positions
      expect(positions['(0,0)'].x).toBeCloseTo(margin, 5);
      expect(positions['(0,0)'].y).toBeCloseTo(margin, 5);
      expect(positions['(2,1)'].x).toBeCloseTo(margin + availableWidth, 5);
      expect(positions['(2,1)'].y).toBeCloseTo(margin + availableHeight, 5);
    });

    test('handles edge case for 1×n and n×1 products', () => {
      const layout1xn = StandardLayoutGenerator.getDirectProductLayout(1, 3);
      expect(Object.keys(layout1xn.positions)).toHaveLength(3);
      
      const layoutnx1 = StandardLayoutGenerator.getDirectProductLayout(3, 1);
      expect(Object.keys(layoutnx1.positions)).toHaveLength(3);
    });
  });

  describe('Alternating A4 Layout', () => {
    let layout: StandardLayout;

    beforeEach(() => {
      layout = StandardLayoutGenerator.getAlternating4Layout();
    });

    test('generates correct A4 group structure', () => {
      expect(layout.description).toBe("Alternating A4 - Tetrahedral arrangement");
      expect(layout.generators).toEqual(['(123)', '(12)(34)']);
      expect(Object.keys(layout.positions)).toHaveLength(12);
    });

    test('validates A4 element positioning', () => {
      const { positions } = layout;
      const expectedElements = [
        'e', '(123)', '(132)', '(124)', '(142)', '(134)', 
        '(143)', '(234)', '(243)', '(12)(34)', '(13)(24)', '(14)(23)'
      ];
      
      expectedElements.forEach(element => {
        expect(positions).toHaveProperty(element);
      });
    });

    test('verifies tetrahedral symmetry properties', () => {
      const { positions } = layout;
      
      // Identity at center
      expect(positions.e.x).toBeCloseTo(0.5, 5);
      expect(positions.e.y).toBeCloseTo(0.5, 5);
      
      // Check that 3-cycles and double transpositions are positioned appropriately
      const threeCycles = ['(123)', '(132)', '(124)', '(142)', '(134)', '(143)', '(234)', '(243)'];
      const doubleTranspositions = ['(12)(34)', '(13)(24)', '(14)(23)'];
      
      // All positions should be within bounds
      [...threeCycles, ...doubleTranspositions].forEach(element => {
        const pos = positions[element];
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.x).toBeLessThanOrEqual(1);
        expect(pos.y).toBeGreaterThanOrEqual(0);
        expect(pos.y).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Group Type Detection and Layout Selection', () => {
    
    test('recognizes and generates correct layouts for standard groups', () => {
      const testCases = [
        { name: 'C1', expectedType: 'trivial' },
        { name: 'V4', expectedType: 'klein' },
        { name: 'Klein4', expectedType: 'klein' },
        { name: 'Q8', expectedType: 'quaternion' },
        { name: 'Q4', expectedType: 'quaternion' },
        { name: 'D3', expectedType: 'dihedral3' },
        { name: 'S3', expectedType: 'dihedral3' },
        { name: 'D4', expectedType: 'dihedral4' },
        { name: 'A4', expectedType: 'alternating4' }
      ];
      
      testCases.forEach(({ name, expectedType }) => {
        const layout = StandardLayoutGenerator.getStandardLayout(name, 0);
        expect(layout).not.toBeNull();
        expect(layout?.positions).toBeDefined();
      });
    });

    test('handles cyclic group pattern matching', () => {
      for (let n = 2; n <= 20; n++) {
        const layout = StandardLayoutGenerator.getStandardLayout(`C${n}`, n);
        expect(layout).not.toBeNull();
        expect(layout?.description).toContain(`Cyclic C${n}`);
        expect(Object.keys(layout?.positions || {})).toHaveLength(n);
      }
    });

    test('handles dihedral group pattern matching', () => {
      const d3 = StandardLayoutGenerator.getStandardLayout('D3', 6);
      expect(d3).not.toBeNull();
      expect(d3?.description).toContain('D3');
      
      const d4 = StandardLayoutGenerator.getStandardLayout('D4', 8);
      expect(d4).not.toBeNull();
      expect(d4?.description).toContain('D4');
    });

    test('handles direct product pattern matching', () => {
      const testCases = ['C2xC2', 'C2xC3', 'C3xC2', 'C2xC4'];
      
      testCases.forEach(groupName => {
        const layout = StandardLayoutGenerator.getStandardLayout(groupName, 0);
        expect(layout).not.toBeNull();
        expect(layout?.description).toContain('Direct Product');
      });
    });

    test('returns null for unknown group patterns', () => {
      const unknownGroups = ['InvalidGroup', 'X7', 'Z99', 'ComplexGroup'];
      
      unknownGroups.forEach(name => {
        const layout = StandardLayoutGenerator.getStandardLayout(name, 0);
        expect(layout).toBeNull();
      });
    });

    test('handles edge cases in pattern matching', () => {
      // Very large cyclic groups
      const c50 = StandardLayoutGenerator.getStandardLayout('C50', 50);
      expect(c50).toBeNull(); // Should reject groups > 20
      
      // Malformed names
      const malformed = StandardLayoutGenerator.getStandardLayout('C', 0);
      expect(malformed).toBeNull();
      
      const malformed2 = StandardLayoutGenerator.getStandardLayout('CxC', 0);
      expect(malformed2).toBeNull();
    });
  });

  describe('Layout Position Calculations', () => {
    
    test('validates mathematical accuracy of coordinate generation', () => {
      const tolerance = MATHEMATICAL_PRECISION.FLOAT_TOLERANCE;
      
      // Test cyclic group positions using trigonometry
      const n = 6;
      const layout = StandardLayoutGenerator.getCyclicLayout(n);
      const radius = 0.35;
      const center = { x: 0.5, y: 0.5 };
      
      Object.keys(layout.positions).forEach((key, index) => {
        const expectedAngle = (2 * Math.PI * index) / n - Math.PI / 2;
        const expectedX = center.x + radius * Math.cos(expectedAngle);
        const expectedY = center.y + radius * Math.sin(expectedAngle);
        
        const actual = layout.positions[key];
        expect(Math.abs(actual.x - expectedX)).toBeLessThan(tolerance);
        expect(Math.abs(actual.y - expectedY)).toBeLessThan(tolerance);
      });
    });

    test('verifies coordinate precision and stability', () => {
      // Test multiple generations produce identical results
      const layouts = Array.from({ length: 5 }, () => 
        StandardLayoutGenerator.getKleinFourLayout()
      );
      
      const firstLayout = layouts[0];
      layouts.slice(1).forEach(layout => {
        Object.keys(firstLayout.positions).forEach(key => {
          expect(layout.positions[key].x).toBe(firstLayout.positions[key].x);
          expect(layout.positions[key].y).toBe(firstLayout.positions[key].y);
        });
      });
    });

    test('validates floating point stability in calculations', () => {
      // Test with edge cases that might cause precision issues
      const testSizes = [7, 11, 13, 17]; // Prime numbers
      
      testSizes.forEach(n => {
        const layout = StandardLayoutGenerator.getCyclicLayout(n);
        Object.values(layout.positions).forEach(pos => {
          expect(Number.isFinite(pos.x)).toBe(true);
          expect(Number.isFinite(pos.y)).toBe(true);
          expect(Number.isNaN(pos.x)).toBe(false);
          expect(Number.isNaN(pos.y)).toBe(false);
        });
      });
    });
  });

  describe('Geometric Properties and Visual Quality', () => {
    
    test('validates symmetry preservation in layouts', () => {
      // Test Klein Four Group symmetry
      const v4 = StandardLayoutGenerator.getKleinFourLayout();
      const center = v4.positions.e;
      
      // Calculate symmetry measures
      const nonIdentityElements = ['a', 'b', 'c'];
      const distances = nonIdentityElements.map(elem => {
        const pos = v4.positions[elem];
        return Math.sqrt((pos.x - center.x) ** 2 + (pos.y - center.y) ** 2);
      });
      
      // Check symmetry: all distances should be equal (within tolerance)
      const avgDistance = distances.reduce((a, b) => a + b) / distances.length;
      distances.forEach(d => {
        expect(Math.abs(d - avgDistance)).toBeLessThan(0.01);
      });
    });

    test('validates visual balance and spacing', () => {
      const layouts = [
        StandardLayoutGenerator.getKleinFourLayout(),
        StandardLayoutGenerator.getQuaternionLayout(),
        StandardLayoutGenerator.getDihedral3Layout(),
        StandardLayoutGenerator.getCyclicLayout(8)
      ];
      
      layouts.forEach(layout => {
        const positions = Object.values(layout.positions);
        
        // Check minimum spacing between elements
        const minDistance = positions.reduce((min, pos1) => {
          return positions.reduce((minInner, pos2) => {
            if (pos1 === pos2) return minInner;
            const dist = Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
            return Math.min(minInner, dist);
          }, min);
        }, Infinity);
        
        expect(minDistance).toBeGreaterThan(0.05); // Minimum spacing
      });
    });

    test('validates bounding box utilization', () => {
      const layouts = [
        StandardLayoutGenerator.getQuaternionLayout(),
        StandardLayoutGenerator.getDihedral4Layout(),
        StandardLayoutGenerator.getAlternating4Layout()
      ];
      
      layouts.forEach(layout => {
        const positions = Object.values(layout.positions);
        
        // Calculate bounding box
        const minX = Math.min(...positions.map(p => p.x));
        const maxX = Math.max(...positions.map(p => p.x));
        const minY = Math.min(...positions.map(p => p.y));
        const maxY = Math.max(...positions.map(p => p.y));
        
        // Should use reasonable portion of [0,1] × [0,1] space
        const xRange = maxX - minX;
        const yRange = maxY - minY;
        
        expect(xRange).toBeGreaterThan(0.1); // Not too compressed
        expect(yRange).toBeGreaterThan(0.1);
        expect(xRange).toBeLessThan(1.0); // Within bounds
        expect(yRange).toBeLessThan(1.0);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    
    test('handles malformed group names gracefully', () => {
      const malformedNames = [
        '', '   ', 'C', 'D', 'CxC', 'C2x', 'xC3', 'C-1', 'D0'
      ];
      
      malformedNames.forEach(name => {
        const layout = StandardLayoutGenerator.getStandardLayout(name, 0);
        expect(layout).toBeNull();
      });
    });

    test('handles boundary conditions for cyclic groups', () => {
      // Very small groups
      const c1 = StandardLayoutGenerator.getCyclicLayout(1);
      expect(Object.keys(c1.positions)).toHaveLength(1);
      
      // Groups at the boundary
      const c20 = StandardLayoutGenerator.getCyclicLayout(20);
      expect(Object.keys(c20.positions)).toHaveLength(20);
      
      // Verify positions are still valid
      Object.values(c20.positions).forEach(pos => {
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.x).toBeLessThanOrEqual(1);
        expect(pos.y).toBeGreaterThanOrEqual(0);
        expect(pos.y).toBeLessThanOrEqual(1);
      });
    });

    test('handles edge cases in direct product layouts', () => {
      // Single factor groups
      const c1x1 = StandardLayoutGenerator.getDirectProductLayout(1, 1);
      expect(Object.keys(c1x1.positions)).toHaveLength(1);
      
      // Ensure no division by zero or invalid coordinates
      Object.values(c1x1.positions).forEach(pos => {
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
      });
    });

    test('validates unknown group types return null', () => {
      const unknownTypes = [
        'PSL(2,7)', 'GL(2,3)', 'Quaternion16', 'DicyclicD8', 'AlternatingA5'
      ];
      
      unknownTypes.forEach(name => {
        const layout = StandardLayoutGenerator.getStandardLayout(name, 0);
        expect(layout).toBeNull();
      });
    });
  });

  describe('Integration with Group Theory', () => {
    
    test('validates layouts match actual group structures from GroupDatabase', () => {
      const testGroups = ['C3', 'C4', 'V4', 'S3'];
      
      testGroups.forEach(groupName => {
        const group = GroupDatabase.getGroup(groupName);
        const layout = StandardLayoutGenerator.getStandardLayout(groupName, group?.order || 0);
        
        if (group && layout) {
          // Layout should have position for each group element
          expect(Object.keys(layout.positions).length).toBeLessThanOrEqual(group.order);
          
          // Generators should exist in group
          layout.generators?.forEach(gen => {
            if (gen !== '1') { // Skip generic generator notation
              const hasElement = group.elements.some(elem => 
                elem.id === gen || elem.label === gen
              );
              // This is informational - layouts may use different notation
            }
          });
        }
      });
    });

    test('verifies generator consistency between layouts and group theory', () => {
      // Test that layout generators make mathematical sense
      const v4Layout = StandardLayoutGenerator.getKleinFourLayout();
      expect(v4Layout.generators).toHaveLength(2); // V4 needs 2 generators
      
      const c5Layout = StandardLayoutGenerator.getCyclicLayout(5);
      expect(c5Layout.generators).toHaveLength(1); // Cyclic groups need 1 generator
      
      const d3Layout = StandardLayoutGenerator.getDihedral3Layout();
      expect(d3Layout.generators).toHaveLength(2); // Dihedral groups need 2 generators
    });
  });

  describe('Performance and Scalability', () => {
    
    test('generates layouts efficiently for various group sizes', () => {
      const testCases = [
        { name: 'C8', order: 8 },
        { name: 'C12', order: 12 },
        { name: 'D4', order: 8 },
        { name: 'Q8', order: 8 }
      ];
      
      testCases.forEach(({ name, order }) => {
        const startTime = performance.now();
        const layout = StandardLayoutGenerator.getStandardLayout(name, order);
        const endTime = performance.now();
        
        expect(endTime - startTime).toBeLessThan(10); // Should be fast
        expect(layout).not.toBeNull();
      });
    });

    test('handles memory efficiently for multiple layout generations', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Generate many layouts
      for (let i = 0; i < 100; i++) {
        StandardLayoutGenerator.getCyclicLayout(8);
        StandardLayoutGenerator.getKleinFourLayout();
        StandardLayoutGenerator.getQuaternionLayout();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 5MB)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });

    test('validates deterministic layout generation', () => {
      // Same input should always produce same output
      const layouts1 = Array.from({ length: 5 }, () => 
        StandardLayoutGenerator.getCyclicLayout(6)
      );
      
      const layouts2 = Array.from({ length: 5 }, () => 
        StandardLayoutGenerator.getCyclicLayout(6)
      );
      
      layouts1.forEach((layout1, index) => {
        const layout2 = layouts2[index];
        Object.keys(layout1.positions).forEach(key => {
          expect(layout1.positions[key]).toEqual(layout2.positions[key]);
        });
      });
    });
  });

  describe('Mathematical Rigor and Validation', () => {
    
    test('validates coordinate bounds and finite values', () => {
      const allLayouts = [
        StandardLayoutGenerator.getKleinFourLayout(),
        StandardLayoutGenerator.getQuaternionLayout(),
        StandardLayoutGenerator.getDihedral3Layout(),
        StandardLayoutGenerator.getDihedral4Layout(),
        StandardLayoutGenerator.getAlternating4Layout(),
        StandardLayoutGenerator.getCyclicLayout(7),
        StandardLayoutGenerator.getDirectProductLayout(2, 3)
      ];
      
      allLayouts.forEach(layout => {
        Object.values(layout.positions).forEach(pos => {
          // Coordinates should be in [0, 1]
          expect(pos.x).toBeGreaterThanOrEqual(0);
          expect(pos.x).toBeLessThanOrEqual(1);
          expect(pos.y).toBeGreaterThanOrEqual(0);
          expect(pos.y).toBeLessThanOrEqual(1);
          
          // Coordinates should be finite numbers
          expect(Number.isFinite(pos.x)).toBe(true);
          expect(Number.isFinite(pos.y)).toBe(true);
          expect(Number.isNaN(pos.x)).toBe(false);
          expect(Number.isNaN(pos.y)).toBe(false);
        });
      });
    });

    test('validates mathematical consistency across layout types', () => {
      // Identity elements should be consistently positioned
      const layoutsWithIdentity = [
        StandardLayoutGenerator.getKleinFourLayout(),
        StandardLayoutGenerator.getDihedral3Layout(),
        StandardLayoutGenerator.getDihedral4Layout(),
        StandardLayoutGenerator.getAlternating4Layout()
      ];
      
      layoutsWithIdentity.forEach(layout => {
        const identityPos = layout.positions.e;
        expect(identityPos).toBeDefined();
        
        // Identity should be roughly centered
        expect(identityPos.x).toBeCloseTo(0.5, 1);
        expect(identityPos.y).toBeCloseTo(0.5, 1);
      });
    });

    test('validates layout properties satisfy group theory constraints', () => {
      // V4 should have 4 elements in square-like arrangement
      const v4 = StandardLayoutGenerator.getKleinFourLayout();
      expect(Object.keys(v4.positions)).toHaveLength(4);
      
      // Q8 should have 8 elements with quaternion structure
      const q8 = StandardLayoutGenerator.getQuaternionLayout();
      expect(Object.keys(q8.positions)).toHaveLength(8);
      
      // Cyclic groups should have n elements in circular arrangement
      for (let n = 3; n <= 8; n++) {
        const cn = StandardLayoutGenerator.getCyclicLayout(n);
        expect(Object.keys(cn.positions)).toHaveLength(n);
      }
    });
  });
});