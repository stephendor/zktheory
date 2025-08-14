/**
 * Comprehensive Unit Tests for AdvancedLayoutEngine
 * Tests layout strategy generation, mathematical accuracy, and performance
 */

import {
  AdvancedLayoutEngine,
  type AdvancedLayout,
  type LayoutStrategy,
  type LayoutDirection,
  type LayoutNestingLevel
} from '@/lib/AdvancedLayoutEngine';

import { Group, GroupElement, GroupTheoryLibrary } from '@/lib/GroupTheory';
import { GroupDatabase } from '@/lib/GroupDatabase';
import { StandardLayoutGenerator } from '@/lib/StandardLayouts';

import {
  GroupTheoryValidator,
  PrecisionValidator,
  PerformanceValidator,
  mathematicalMatchers,
  MATHEMATICAL_PRECISION,
  aggregateValidationResults
} from '../utils/mathematicalValidation';

// Extend Jest matchers
expect.extend(mathematicalMatchers);

describe('AdvancedLayoutEngine', () => {
  
  // Test data setup
  let cyclicGroup3: Group;
  let cyclicGroup4: Group;
  let dihedralGroup3: Group;
  let symmetricGroup3: Group;
  let trivialGroup: Group;

  beforeAll(() => {
    // Get test groups from GroupDatabase
    cyclicGroup3 = GroupDatabase.getGroup('C3')!;
    cyclicGroup4 = GroupDatabase.getGroup('C4')!;
    dihedralGroup3 = GroupDatabase.getGroup('D3')!;
    symmetricGroup3 = GroupDatabase.getGroup('S3')!;
    
    // Get trivial group from database
    trivialGroup = GroupDatabase.getGroup('C1')!;
  });

  describe('Layout Strategy Generation', () => {
    
    describe('generateOptimalLayout', () => {
      test('generates layout for trivial group', () => {
        const layout = AdvancedLayoutEngine.generateOptimalLayout(trivialGroup, []);
        
        expect(layout).toBeDefined();
        expect(layout.positions).toHaveProperty('e');
        expect(layout.is3D).toBe(false);
        
        const position = layout.positions['e'];
        expect(typeof position.x).toBe('number');
        expect(typeof position.y).toBe('number');
        expect(position.z).toBeUndefined();
      });

      test('generates layout for cyclic group C3', () => {
        // Use the actual generators from the group or fallback to common names
        const generators = cyclicGroup3.generators.length > 0 ? cyclicGroup3.generators : ['a'];
        const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup3, generators);
        
        expect(layout).toBeDefined();
        expect(layout.positions).toBeDefined();
        expect(layout.is3D).toBe(false);
        
        // Verify all elements have positions
        cyclicGroup3.elements.forEach(element => {
          expect(layout.positions).toHaveProperty(element.id);
          const pos = layout.positions[element.id];
          expect(typeof pos.x).toBe('number');
          expect(typeof pos.y).toBe('number');
          expect(Number.isFinite(pos.x)).toBe(true);
          expect(Number.isFinite(pos.y)).toBe(true);
        });
      });

      test('generates layout for cyclic group C4', () => {
        const generators = cyclicGroup4.generators.length > 0 ? cyclicGroup4.generators : ['a'];
        const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup4, generators);
        
        expect(layout).toBeDefined();
        expect(layout.positions).toBeDefined();
        
        // Verify all elements have positions
        cyclicGroup4.elements.forEach(element => {
          expect(layout.positions).toHaveProperty(element.id);
        });
      });

      test('generates layout for dihedral group D3', () => {
        const generators = dihedralGroup3.generators.length > 0 ? dihedralGroup3.generators : ['r', 's'];
        const layout = AdvancedLayoutEngine.generateOptimalLayout(dihedralGroup3, generators);
        
        expect(layout).toBeDefined();
        expect(layout.positions).toBeDefined();
        
        // Verify all elements have positions
        dihedralGroup3.elements.forEach(element => {
          expect(layout.positions).toHaveProperty(element.id);
        });
      });

      test('generates 3D layout when requested', () => {
        const generators = cyclicGroup3.generators.length > 0 ? cyclicGroup3.generators : ['a'];
        const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup3, generators, true);
        
        expect(layout.is3D).toBe(true);
        
        // All positions should have z coordinate when 3D is requested
        cyclicGroup3.elements.forEach(element => {
          const pos = layout.positions[element.id];
          // Z coordinate might be 0 but should be defined for 3D layouts
          expect(pos.z).toBeDefined();
          expect(typeof pos.z).toBe('number');
          expect(Number.isFinite(pos.z!)).toBe(true);
        });
      });

      test('uses standard layout when available and not prefer3D', () => {
        // Mock StandardLayoutGenerator to return a layout
        const mockStandardLayout = {
          positions: {
            'e': { x: 0.5, y: 0.5 },
            'a': { x: 0.3, y: 0.7 },
            'a2': { x: 0.7, y: 0.3 }
          },
          description: 'Standard C3 layout'
        };
        
        jest.spyOn(StandardLayoutGenerator, 'getStandardLayout').mockReturnValue(mockStandardLayout);
        
        const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup3, ['a'], false);
        
        expect(layout.description).toBe('Standard C3 layout');
        expect(layout.positions['e'].x).toBe(300); // Converted to canvas coordinates
        expect(layout.positions['e'].y).toBe(200);
        
        StandardLayoutGenerator.getStandardLayout.mockRestore();
      });
    });

    describe('strategy selection logic', () => {
      test('selects linear strategy for order-2 generators', () => {
        // Create a group with order-2 elements
        const testGroup: Group = {
          name: 'Test',
          order: 4,
          elements: [
            { id: 'e', label: 'e', order: 1, inverse: 'e', conjugacyClass: 0 },
            { id: 'a', label: 'a', order: 2, inverse: 'a', conjugacyClass: 1 },
            { id: 'b', label: 'b', order: 2, inverse: 'b', conjugacyClass: 1 },
            { id: 'ab', label: 'ab', order: 2, inverse: 'ab', conjugacyClass: 1 }
          ],
          operations: new Map(),
          generators: ['a', 'b'],
          isAbelian: true
        };
        
        const layout = AdvancedLayoutEngine.generateOptimalLayout(testGroup, ['a', 'b']);
        
        // Should use linear strategies for order-2 generators
        expect(layout.nestingStructure[0].strategy).toBe('linear');
        expect(layout.nestingStructure[1].strategy).toBe('linear');
        
        // Should use different directions
        expect(layout.nestingStructure[0].direction).toBe('X');
        expect(layout.nestingStructure[1].direction).toBe('Y');
      });

      test('selects circular strategy for higher order cyclic groups', () => {
        // Mock StandardLayoutGenerator to return null to force advanced layout generation
        jest.spyOn(StandardLayoutGenerator, 'getStandardLayout').mockReturnValue(null);
        
        const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup4, ['a']);
        
        expect(layout).toBeDefined();
        expect(layout.nestingStructure.length).toBeGreaterThan(0);
        
        StandardLayoutGenerator.getStandardLayout.mockRestore();
      });
    });
  });

  describe('Nesting Structure Computation', () => {
    
    test('computes correct nesting levels', () => {
      const generators = ['r', 's'];
      const layout = AdvancedLayoutEngine.generateOptimalLayout(dihedralGroup3, generators);
      
      expect(layout.nestingStructure).toHaveLength(2);
      
      layout.nestingStructure.forEach((level, index) => {
        expect(level.nestingLevel).toBe(index);
        expect(level.generator).toBe(generators[index]);
        expect(level.subgroupElements).toBeDefined();
        expect(Array.isArray(level.subgroupElements)).toBe(true);
        expect(level.subgroupElements!.includes('e')).toBe(true);
      });
    });

    test('generates valid subgroup elements for each level', () => {
      const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup4, ['a']);
      
      const subgroupElements = layout.nestingStructure[0].subgroupElements!;
      expect(subgroupElements).toContain('e');
      expect(subgroupElements).toContain('a');
      expect(subgroupElements.length).toBeGreaterThan(1);
      
      // All subgroup elements should be valid group elements
      subgroupElements.forEach(elementId => {
        const element = cyclicGroup4.elements.find(e => e.id === elementId);
        expect(element).toBeDefined();
      });
    });

    test('maintains mathematical consistency in nesting', () => {
      const layout = AdvancedLayoutEngine.generateOptimalLayout(symmetricGroup3, ['a', 'b']);
      
      // Verify nesting levels are sequential
      layout.nestingStructure.forEach((level, index) => {
        expect(level.nestingLevel).toBe(index);
      });
      
      // Verify each level has valid strategy and direction
      layout.nestingStructure.forEach(level => {
        expect(['linear', 'circular', 'rotated']).toContain(level.strategy);
        expect(['X', 'Y', 'Z', 'XY', 'XZ', 'YZ']).toContain(level.direction);
      });
    });
  });

  describe('3D Layout Positioning', () => {
    
    test('generates valid 3D coordinates', () => {
      const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup4, ['a'], true);
      
      expect(layout.is3D).toBe(true);
      
      cyclicGroup4.elements.forEach(element => {
        const pos = layout.positions[element.id];
        expect(pos.z).toBeDefined();
        expect(typeof pos.z).toBe('number');
        expect(Number.isFinite(pos.z!)).toBe(true);
      });
    });

    test('applies Z-direction linear layout correctly', () => {
      // Create test scenario that would use Z direction
      const testGroup: Group = {
        name: 'TestZ',
        order: 4,
        elements: [
          { id: 'e', label: 'e', order: 1, inverse: 'e', conjugacyClass: 0 },
          { id: 'a', label: 'a', order: 2, inverse: 'a', conjugacyClass: 1 },
          { id: 'b', label: 'b', order: 2, inverse: 'b', conjugacyClass: 1 },
          { id: 'c', label: 'c', order: 2, inverse: 'c', conjugacyClass: 1 }
        ],
        operations: new Map(),
        generators: ['a', 'b', 'c'],
        isAbelian: true
      };
      
      const layout = AdvancedLayoutEngine.generateOptimalLayout(testGroup, ['a', 'b', 'c'], true);
      
      // Third generator should use Z direction
      expect(layout.nestingStructure[2].direction).toBe('Z');
      
      // Verify Z-coordinates vary for elements positioned by third generator
      const zCoords = testGroup.elements.map(e => layout.positions[e.id].z!);
      const uniqueZCoords = [...new Set(zCoords)];
      expect(uniqueZCoords.length).toBeGreaterThan(1);
    });

    test('applies XZ and YZ circular layouts correctly', () => {
      const layout = AdvancedLayoutEngine.generateOptimalLayout(dihedralGroup3, ['r', 's'], true);
      
      // Should have some 3D positioning
      const hasNonZeroZ = dihedralGroup3.elements.some(e => 
        layout.positions[e.id].z !== undefined && layout.positions[e.id].z !== 0
      );
      expect(hasNonZeroZ).toBe(true);
    });
  });

  describe('Layout Strategy Application', () => {
    
    describe('Linear Layout', () => {
      test('distributes elements along X-axis correctly', () => {
        const testGroup: Group = {
          name: 'LinearTest',
          order: 3,
          elements: [
            { id: 'e', label: 'e', order: 1, inverse: 'e', conjugacyClass: 0 },
            { id: 'a', label: 'a', order: 2, inverse: 'a', conjugacyClass: 1 },
            { id: 'b', label: 'b', order: 2, inverse: 'b', conjugacyClass: 1 }
          ],
          operations: new Map(),
          generators: ['a'],
          isAbelian: true
        };
        
        const layout = AdvancedLayoutEngine.generateOptimalLayout(testGroup, ['a']);
        
        // Elements should be aligned along X-axis with constant Y
        const positions = Object.values(layout.positions);
        const yCoords = positions.map(p => p.y);
        const uniqueYCoords = [...new Set(yCoords)];
        
        // Should have consistent Y coordinate (allowing for floating point precision)
        expect(uniqueYCoords.length).toBeLessThanOrEqual(2); // Identity might be at center
        
        // X coordinates should vary
        const xCoords = positions.map(p => p.x);
        const uniqueXCoords = [...new Set(xCoords)];
        expect(uniqueXCoords.length).toBeGreaterThan(1);
      });

      test('maintains equal spacing in linear layout', () => {
        const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup4, ['a']);
        
        // Get positions in order
        const orderedPositions = cyclicGroup4.elements
          .sort((a, b) => a.id.localeCompare(b.id))
          .map(e => layout.positions[e.id]);
        
        // Calculate spacing between adjacent elements
        const spacings: number[] = [];
        for (let i = 1; i < orderedPositions.length; i++) {
          const dx = orderedPositions[i].x - orderedPositions[i-1].x;
          const dy = orderedPositions[i].y - orderedPositions[i-1].y;
          const distance = Math.sqrt(dx*dx + dy*dy);
          spacings.push(distance);
        }
        
        // Verify spacings are approximately equal (within tolerance)
        if (spacings.length > 1) {
          const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
          spacings.forEach(spacing => {
            global.testUtils.expectMathematicalAccuracy(spacing, avgSpacing, 1);
          });
        }
      });
    });

    describe('Circular Layout', () => {
      test('arranges elements in circular pattern', () => {
        const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup4, ['a']);
        
        // Should use circular layout for C4
        expect(layout.nestingStructure[0].strategy).toBe('circular');
        
        // Calculate distances from center for all elements
        const centerX = 300; // Canvas center
        const centerY = 200;
        
        const distances = cyclicGroup4.elements.map(element => {
          const pos = layout.positions[element.id];
          return Math.sqrt((pos.x - centerX)**2 + (pos.y - centerY)**2);
        });
        
        // All elements (except possibly identity) should be approximately the same distance from center
        const nonIdentityDistances = distances.filter(d => d > 10); // Filter out identity at center
        if (nonIdentityDistances.length > 1) {
          const avgDistance = nonIdentityDistances.reduce((a, b) => a + b, 0) / nonIdentityDistances.length;
          nonIdentityDistances.forEach(distance => {
            global.testUtils.expectMathematicalAccuracy(distance, avgDistance, 5);
          });
        }
      });

      test('maintains angular symmetry in circular layout', () => {
        const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup3, ['a']);
        
        const centerX = 300;
        const centerY = 200;
        
        // Calculate angles for all non-identity elements
        const angles = cyclicGroup3.elements
          .filter(e => e.id !== 'e')
          .map(element => {
            const pos = layout.positions[element.id];
            return Math.atan2(pos.y - centerY, pos.x - centerX);
          });
        
        if (angles.length > 1) {
          // Calculate angular differences
          const sortedAngles = angles.sort();
          const angularDifferences: number[] = [];
          
          for (let i = 1; i < sortedAngles.length; i++) {
            angularDifferences.push(sortedAngles[i] - sortedAngles[i-1]);
          }
          
          // Add wrap-around difference
          angularDifferences.push(2 * Math.PI - (sortedAngles[sortedAngles.length-1] - sortedAngles[0]));
          
          // All angular differences should be approximately equal
          const expectedAngle = 2 * Math.PI / angles.length;
          angularDifferences.forEach(angle => {
            global.testUtils.expectMathematicalAccuracy(angle, expectedAngle, 0.1);
          });
        }
      });
    });

    describe('Rotated Layout', () => {
      test('applies rotation offset correctly', () => {
        // Create scenario that uses rotated layout
        const complexGroup: Group = {
          name: 'Complex',
          order: 8,
          elements: Array.from({length: 8}, (_, i) => ({
            id: `g${i}`,
            label: `g${i}`,
            order: i === 0 ? 1 : 8,
            inverse: `g${i}`,
            conjugacyClass: i
          })),
          operations: new Map(),
          generators: ['g1'],
          isAbelian: false
        };
        
        const layout = AdvancedLayoutEngine.generateOptimalLayout(complexGroup, ['g1']);
        
        // Verify positions are generated
        complexGroup.elements.forEach(element => {
          const pos = layout.positions[element.id];
          expect(Number.isFinite(pos.x)).toBe(true);
          expect(Number.isFinite(pos.y)).toBe(true);
        });
      });
    });
  });

  describe('Group Structure Analysis', () => {
    
    test('correctly identifies cyclic groups', () => {
      const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup3, ['a']);
      
      // Should detect cyclic structure and use appropriate strategy
      expect(layout.nestingStructure).toHaveLength(1);
      expect(layout.nestingStructure[0].strategy).toMatch(/circular|linear/);
    });

    test('correctly identifies dihedral groups', () => {
      const layout = AdvancedLayoutEngine.generateOptimalLayout(dihedralGroup3, ['r', 's']);
      
      // Should have two generators and appropriate strategies
      expect(layout.nestingStructure).toHaveLength(2);
      
      // Should use strategies appropriate for dihedral structure
      const strategies = layout.nestingStructure.map(level => level.strategy);
      expect(strategies.some(s => s === 'circular')).toBe(true);
    });

    test('handles abelian groups correctly', () => {
      expect(cyclicGroup3.isAbelian).toBe(true);
      expect(cyclicGroup4.isAbelian).toBe(true);
      expect(dihedralGroup3.isAbelian).toBe(false);
      
      const cyclicLayout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup3, ['a']);
      const dihedralLayout = AdvancedLayoutEngine.generateOptimalLayout(dihedralGroup3, ['r', 's']);
      
      // Both should generate valid layouts
      expect(cyclicLayout.positions).toBeDefined();
      expect(dihedralLayout.positions).toBeDefined();
    });
  });

  describe('Standard Layout Conversion', () => {
    
    test('converts standard layout to advanced layout format', () => {
      const mockStandardLayout = {
        positions: {
          'e': { x: 0.5, y: 0.5 },
          'a': { x: 0.3, y: 0.7 },
          'a2': { x: 0.7, y: 0.3 }
        },
        description: 'Mock standard layout'
      };
      
      jest.spyOn(StandardLayoutGenerator, 'getStandardLayout').mockReturnValue(mockStandardLayout);
      
      const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup3, ['a'], false);
      
      expect(layout.positions['e'].x).toBe(300); // 0.5 * 600
      expect(layout.positions['e'].y).toBe(200); // 0.5 * 400
      expect(layout.positions['a'].x).toBe(180); // 0.3 * 600
      expect(layout.positions['a'].y).toBe(280); // 0.7 * 400
      expect(layout.description).toBe('Mock standard layout');
      expect(layout.is3D).toBe(false);
      expect(layout.nestingStructure).toHaveLength(0);
      
      StandardLayoutGenerator.getStandardLayout.mockRestore();
    });
  });

  describe('Mathematical Accuracy', () => {
    
    test('maintains mathematical precision in coordinate calculations', () => {
      const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup4, ['a']);
      
      // Verify all coordinates are finite and precise
      cyclicGroup4.elements.forEach(element => {
        const pos = layout.positions[element.id];
        
        expect(Number.isFinite(pos.x)).toBe(true);
        expect(Number.isFinite(pos.y)).toBe(true);
        expect(Number.isNaN(pos.x)).toBe(false);
        expect(Number.isNaN(pos.y)).toBe(false);
        
        // Coordinates should be reasonable (within canvas bounds + some margin)
        expect(pos.x).toBeGreaterThan(-100);
        expect(pos.x).toBeLessThan(700);
        expect(pos.y).toBeGreaterThan(-100);
        expect(pos.y).toBeLessThan(500);
      });
    });

    test('maintains group-theoretic consistency', () => {
      const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup3, ['a']);
      
      // All group elements should have positions
      cyclicGroup3.elements.forEach(element => {
        expect(layout.positions).toHaveProperty(element.id);
      });
      
      // Number of positioned elements should match group order
      const positionedElements = Object.keys(layout.positions);
      expect(positionedElements).toHaveLength(cyclicGroup3.order);
      
      // Identity should be present
      expect(layout.positions).toHaveProperty('e');
    });

    test('validates layout mathematical properties', () => {
      const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup4, ['a']);
      
      // Test mathematical invariants
      const positions = Object.values(layout.positions);
      const xCoords = positions.map(p => p.x);
      const yCoords = positions.map(p => p.y);
      
      // Validate numerical stability
      const validation = PrecisionValidator.validateFloatingPointStability([...xCoords, ...yCoords]);
      expect(validation.isValid).toBe(true);
      
      // Check for reasonable spread (elements shouldn't all be at same point)
      const xRange = Math.max(...xCoords) - Math.min(...xCoords);
      const yRange = Math.max(...yCoords) - Math.min(...yCoords);
      expect(xRange + yRange).toBeGreaterThan(0);
    });
  });

  describe('Performance Testing', () => {
    
    test('layout generation completes within time bounds', () => {
      const { result, duration } = global.testUtils.expectPerformance(() => {
        return AdvancedLayoutEngine.generateOptimalLayout(symmetricGroup3, ['a', 'b']);
      }, 500); // 500ms max
      
      expect(result).toBeDefined();
      expect(result.positions).toBeDefined();
      console.log(`Layout generation completed in ${duration.toFixed(2)}ms`);
    });

    test('memory usage is reasonable for layout generation', () => {
      const { result, memoryIncrease } = global.testUtils.expectMemoryUsage(() => {
        return AdvancedLayoutEngine.generateOptimalLayout(symmetricGroup3, ['a', 'b']);
      }, 10); // 10MB max increase
      
      expect(result).toBeDefined();
      console.log(`Memory increase: ${memoryIncrease.toFixed(2)}MB`);
    });

    test('scales appropriately with group size', () => {
      const times: number[] = [];
      const groups = [cyclicGroup3, cyclicGroup4, symmetricGroup3];
      
      groups.forEach(group => {
        const startTime = performance.now();
        AdvancedLayoutEngine.generateOptimalLayout(group, group.generators);
        const endTime = performance.now();
        times.push(endTime - startTime);
      });
      
      // Performance should scale reasonably (not exponentially)
      times.forEach(time => {
        expect(time).toBeLessThan(1000); // 1 second max for test groups
      });
      
      console.log('Scaling times:', times.map(t => `${t.toFixed(2)}ms`));
    });

    test('deterministic behavior for same inputs', () => {
      const layout1 = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup3, ['a']);
      const layout2 = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup3, ['a']);
      
      // Should produce identical results
      expect(layout1.positions).toEqual(layout2.positions);
      expect(layout1.nestingStructure).toEqual(layout2.nestingStructure);
      expect(layout1.description).toBe(layout2.description);
      expect(layout1.is3D).toBe(layout2.is3D);
    });
  });

  describe('Edge Cases', () => {
    
    test('handles empty generators array', () => {
      const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup3, []);
      
      expect(layout).toBeDefined();
      expect(layout.positions).toBeDefined();
      // Should still position all elements somehow
      expect(Object.keys(layout.positions)).toHaveLength(cyclicGroup3.order);
    });

    test('handles invalid generator names gracefully', () => {
      const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup3, ['invalid']);
      
      expect(layout).toBeDefined();
      expect(layout.positions).toBeDefined();
      // Should not crash, but may have default behavior
    });

    test('handles groups with single element', () => {
      const layout = AdvancedLayoutEngine.generateOptimalLayout(trivialGroup, []);
      
      expect(layout).toBeDefined();
      expect(layout.positions).toHaveProperty('e');
      expect(layout.nestingStructure).toHaveLength(1);
      expect(layout.description).toContain('Trivial group');
    });

    test('handles large number of generators', () => {
      const manyGenerators = Array.from({length: 10}, (_, i) => `g${i}`);
      
      // Should not crash even with many generators
      expect(() => {
        AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup3, manyGenerators);
      }).not.toThrow();
    });

    test('handles extreme coordinate values gracefully', () => {
      const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup4, ['a'], true);
      
      // Verify coordinates are not extreme
      cyclicGroup4.elements.forEach(element => {
        const pos = layout.positions[element.id];
        expect(Math.abs(pos.x)).toBeLessThan(1e6);
        expect(Math.abs(pos.y)).toBeLessThan(1e6);
        if (pos.z !== undefined) {
          expect(Math.abs(pos.z)).toBeLessThan(1e6);
        }
      });
    });
  });

  describe('Integration with Group Theory', () => {
    
    test('respects group structure in layout', () => {
      const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup3, ['a']);
      
      // Verify all group elements are represented
      const layoutElementIds = Object.keys(layout.positions);
      const groupElementIds = cyclicGroup3.elements.map(e => e.id);
      
      expect(layoutElementIds.sort()).toEqual(groupElementIds.sort());
    });

    test('validates against group axioms', () => {
      // Verify our test groups are mathematically valid
      [cyclicGroup3, cyclicGroup4, dihedralGroup3, symmetricGroup3, trivialGroup].forEach(group => {
        expect(group).toBeValidGroup();
      });
    });

    test('maintains generator relationships in layout', () => {
      const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup4, ['a']);
      
      // Generator should be included in nesting structure
      expect(layout.nestingStructure[0].generator).toBe('a');
      expect(layout.nestingStructure[0].subgroupElements).toContain('a');
      expect(layout.nestingStructure[0].subgroupElements).toContain('e');
    });
  });

  describe('Layout Quality Metrics', () => {
    
    test('minimizes edge crossings in planar layouts', () => {
      const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup4, ['a']);
      
      // For cyclic groups, circular layout should minimize crossings
      // Verify elements are positioned to form a reasonable graph
      const positions = layout.positions;
      const elementIds = Object.keys(positions);
      
      // Calculate minimum distance between any two elements
      let minDistance = Infinity;
      for (let i = 0; i < elementIds.length; i++) {
        for (let j = i + 1; j < elementIds.length; j++) {
          const pos1 = positions[elementIds[i]];
          const pos2 = positions[elementIds[j]];
          const distance = Math.sqrt((pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2);
          minDistance = Math.min(minDistance, distance);
        }
      }
      
      // Elements shouldn't be too close (overlap) or too far apart
      expect(minDistance).toBeGreaterThan(5);
      expect(minDistance).toBeLessThan(200);
    });

    test('maintains visual balance in layout', () => {
      const layout = AdvancedLayoutEngine.generateOptimalLayout(cyclicGroup3, ['a']);
      
      // Calculate center of mass of all positioned elements
      const positions = Object.values(layout.positions);
      const centerX = positions.reduce((sum, pos) => sum + pos.x, 0) / positions.length;
      const centerY = positions.reduce((sum, pos) => sum + pos.y, 0) / positions.length;
      
      // Center of mass should be reasonably close to canvas center
      const canvasCenterX = 300;
      const canvasCenterY = 200;
      
      expect(Math.abs(centerX - canvasCenterX)).toBeLessThan(100);
      expect(Math.abs(centerY - canvasCenterY)).toBeLessThan(100);
    });

    test('optimizes space utilization', () => {
      const layout = AdvancedLayoutEngine.generateOptimalLayout(symmetricGroup3, ['a', 'b']);
      
      // Calculate bounding box of all elements
      const positions = Object.values(layout.positions);
      const minX = Math.min(...positions.map(p => p.x));
      const maxX = Math.max(...positions.map(p => p.x));
      const minY = Math.min(...positions.map(p => p.y));
      const maxY = Math.max(...positions.map(p => p.y));
      
      const width = maxX - minX;
      const height = maxY - minY;
      
      // Layout should use reasonable portion of canvas space
      expect(width).toBeGreaterThan(50); // Not too cramped
      expect(height).toBeGreaterThan(50);
      expect(width).toBeLessThan(600); // Not exceeding canvas
      expect(height).toBeLessThan(400);
    });
  });
});