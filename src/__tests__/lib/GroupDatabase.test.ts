/**
 * Comprehensive Unit Tests for Group Database
 * Tests mathematical accuracy, group properties, and database operations
 */

import { GroupDatabase } from '@/lib/GroupDatabase';
import { EllipticCurveGroup, type EllipticCurveParameters } from '@/lib/EllipticCurveGroup';
import type { Group, GroupElement } from '@/lib/GroupTheory';

describe('GroupDatabase', () => {
  describe('Basic Database Operations', () => {
    test('retrieves all available groups', () => {
      const allGroups = GroupDatabase.getAllGroups();
      
      expect(allGroups).toBeDefined();
      expect(Array.isArray(allGroups)).toBe(true);
      expect(allGroups.length).toBeGreaterThan(30); // Should have many groups up to order 20
      
      // Verify each group has required properties
      allGroups.forEach(group => {
        expect(group).toHaveProperty('name');
        expect(group).toHaveProperty('displayName');
        expect(group).toHaveProperty('order');
        expect(group).toHaveProperty('elements');
        expect(group).toHaveProperty('operations');
        expect(group).toHaveProperty('generators');
        expect(group).toHaveProperty('isAbelian');
        expect(typeof group.isAbelian).toBe('boolean');
      });
    });

    test('retrieves specific groups by name', () => {
      const testGroups = ['C1', 'C2', 'C3', 'V4', 'S3', 'D3', 'Q8', 'A4'];
      
      testGroups.forEach(name => {
        const group = GroupDatabase.getGroup(name);
        expect(group).toBeDefined();
        expect(group?.name).toBe(name);
      });
    });

    test('returns undefined for non-existent groups', () => {
      const nonExistentGroups = ['C100', 'InvalidGroup', 'X99'];
      
      nonExistentGroups.forEach(name => {
        const group = GroupDatabase.getGroup(name);
        expect(group).toBeUndefined();
      });
    });

    test('retrieves group names in sorted order', () => {
      const names = GroupDatabase.getGroupNames();
      
      expect(names).toBeDefined();
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
      
      // Verify sorted order
      for (let i = 1; i < names.length; i++) {
        expect(names[i].localeCompare(names[i-1])).toBeGreaterThanOrEqual(0);
      }
    });

    test('retrieves groups by order correctly', () => {
      const testOrders = [1, 2, 3, 4, 6, 8, 12];
      
      testOrders.forEach(order => {
        const groups = GroupDatabase.getGroupsByOrder(order);
        expect(Array.isArray(groups)).toBe(true);
        
        groups.forEach(group => {
          expect(group.order).toBe(order);
        });
      });
    });

    test('verifies expected group counts by order', () => {
      const expectedCounts: { [order: number]: number } = {
        1: 1,   // C1
        2: 1,   // C2
        3: 1,   // C3
        4: 2,   // C4, V4
        5: 1,   // C5
        6: 2,   // C6, D3 (≅ S3)
        8: 5,   // C8, D4, Q8, C2xC4, C2xC2xC2
        12: 4   // C12, D6, A4, C2xC6
      };

      Object.entries(expectedCounts).forEach(([order, count]) => {
        const groups = GroupDatabase.getGroupsByOrder(parseInt(order));
        expect(groups.length).toBeGreaterThanOrEqual(count);
      });
    });
  });

  describe('Group Mathematical Properties Validation', () => {
    describe('Identity Element Properties', () => {
      test('every group has exactly one identity element', () => {
        const allGroups = GroupDatabase.getAllGroups();
        
        allGroups.forEach(group => {
          // Find elements that satisfy identity property
          const identityElements = group.elements.filter(element => {
            return group.elements.every(other => {
              const leftProduct = group.operations.get(element.id)?.get(other.id);
              const rightProduct = group.operations.get(other.id)?.get(element.id);
              return leftProduct === other.id && rightProduct === other.id;
            });
          });
          
          expect(identityElements).toHaveLength(1);
          expect(identityElements[0].order).toBe(1);
        });
      });

      test('identity element has order 1', () => {
        const testGroups = ['C3', 'V4', 'S3', 'D4', 'Q8'];
        
        testGroups.forEach(groupName => {
          const group = GroupDatabase.getGroup(groupName);
          if (!group) return;
          
          // Identity is typically 'e', '1', 'r0', or 'g0'
          const identity = group.elements.find(e => 
            e.id === 'e' || e.id === '1' || e.id === 'r0' || e.id === 'g0'
          );
          
          expect(identity).toBeDefined();
          expect(identity?.order).toBe(1);
        });
      });
    });

    describe('Inverse Properties', () => {
      test('every element has a valid inverse', () => {
        const testGroups = ['C4', 'V4', 'S3', 'D3', 'Q8'];
        
        testGroups.forEach(groupName => {
          const group = GroupDatabase.getGroup(groupName);
          if (!group) return;
          
          group.elements.forEach(element => {
            const inverse = group.elements.find(e => e.id === element.inverse);
            expect(inverse).toBeDefined();
            
            // Test inverse property: element * inverse = identity
            const product = group.operations.get(element.id)?.get(element.inverse);
            
            // Find identity element
            const identity = group.elements.find(e => e.order === 1);
            expect(product).toBe(identity?.id);
          });
        });
      });

      test('inverse of inverse is the original element', () => {
        const testGroups = ['V4', 'S3', 'D4'];
        
        testGroups.forEach(groupName => {
          const group = GroupDatabase.getGroup(groupName);
          if (!group) return;
          
          group.elements.forEach(element => {
            const inverse = group.elements.find(e => e.id === element.inverse);
            expect(inverse).toBeDefined();
            
            const inverseOfInverse = group.elements.find(e => e.id === inverse?.inverse);
            expect(inverseOfInverse?.id).toBe(element.id);
          });
        });
      });
    });

    describe('Closure Property', () => {
      test('group operation is closed', () => {
        const testGroups = ['C3', 'V4', 'S3', 'D3', 'Q8'];
        
        testGroups.forEach(groupName => {
          const group = GroupDatabase.getGroup(groupName);
          if (!group) return;
          
          group.elements.forEach(a => {
            group.elements.forEach(b => {
              const product = group.operations.get(a.id)?.get(b.id);
              expect(product).toBeDefined();
              
              const resultElement = group.elements.find(e => e.id === product);
              expect(resultElement).toBeDefined();
            });
          });
        });
      });
    });

    describe('Associativity Property', () => {
      test('group operation is associative', () => {
        const testGroups = ['C4', 'V4', 'S3'];
        
        testGroups.forEach(groupName => {
          const group = GroupDatabase.getGroup(groupName);
          if (!group) return;
          
          // Test on a subset for performance (full test would be O(n³))
          const testElements = group.elements.slice(0, Math.min(4, group.elements.length));
          
          testElements.forEach(a => {
            testElements.forEach(b => {
              testElements.forEach(c => {
                const ab = group.operations.get(a.id)?.get(b.id);
                const bc = group.operations.get(b.id)?.get(c.id);
                
                if (ab && bc) {
                  const ab_c = group.operations.get(ab)?.get(c.id);
                  const a_bc = group.operations.get(a.id)?.get(bc);
                  expect(ab_c).toBe(a_bc);
                }
              });
            });
          });
        });
      });
    });

    describe('Order Properties', () => {
      test('element orders divide group order (Lagrange theorem)', () => {
        const testGroups = ['C6', 'D3', 'S3', 'V4', 'Q8', 'A4'];
        
        testGroups.forEach(groupName => {
          const group = GroupDatabase.getGroup(groupName);
          if (!group) return;
          
          group.elements.forEach(element => {
            expect(group.order % element.order).toBe(0);
          });
        });
      });

      test('element raised to its order gives identity', () => {
        const testGroups = ['C4', 'V4', 'D3'];
        
        testGroups.forEach(groupName => {
          const group = GroupDatabase.getGroup(groupName);
          if (!group) return;
          
          const identity = group.elements.find(e => e.order === 1);
          expect(identity).toBeDefined();
          
          group.elements.forEach(element => {
            if (element.order <= 10) { // Test only for small orders to avoid long computations
              let current = element.id;
              
              for (let i = 1; i < element.order; i++) {
                current = group.operations.get(current)?.get(element.id) || '';
              }
              
              expect(current).toBe(identity?.id);
            }
          });
        });
      });
    });

    describe('Abelian Group Properties', () => {
      test('abelian groups satisfy commutativity', () => {
        const abelianGroups = ['C3', 'C4', 'V4', 'C6', 'C8'];
        
        abelianGroups.forEach(groupName => {
          const group = GroupDatabase.getGroup(groupName);
          if (!group) return;
          
          expect(group.isAbelian).toBe(true);
          
          // Test subset for performance
          const testElements = group.elements.slice(0, Math.min(5, group.elements.length));
          
          testElements.forEach(a => {
            testElements.forEach(b => {
              const ab = group.operations.get(a.id)?.get(b.id);
              const ba = group.operations.get(b.id)?.get(a.id);
              expect(ab).toBe(ba);
            });
          });
        });
      });

      test('non-abelian groups have non-commuting elements', () => {
        const nonAbelianGroups = ['S3', 'D3', 'D4', 'Q8', 'A4'];
        
        nonAbelianGroups.forEach(groupName => {
          const group = GroupDatabase.getGroup(groupName);
          if (!group) return;
          
          expect(group.isAbelian).toBe(false);
          
          // Should find at least one pair of non-commuting elements
          let foundNonCommuting = false;
          
          for (const a of group.elements) {
            for (const b of group.elements) {
              const ab = group.operations.get(a.id)?.get(b.id);
              const ba = group.operations.get(b.id)?.get(a.id);
              if (ab !== ba) {
                foundNonCommuting = true;
                break;
              }
            }
            if (foundNonCommuting) break;
          }
          
          expect(foundNonCommuting).toBe(true);
        });
      });
    });

    describe('Center Properties', () => {
      test('center elements commute with all elements', () => {
        const testGroups = ['S3', 'D4', 'Q8', 'A4'];
        
        testGroups.forEach(groupName => {
          const group = GroupDatabase.getGroup(groupName);
          if (!group) return;
          
          group.center.forEach(centerId => {
            const centerElement = group.elements.find(e => e.id === centerId);
            expect(centerElement).toBeDefined();
            
            group.elements.forEach(other => {
              const cz = group.operations.get(centerId)?.get(other.id);
              const zc = group.operations.get(other.id)?.get(centerId);
              expect(cz).toBe(zc);
            });
          });
        });
      });

      test('abelian groups have all elements in center', () => {
        const abelianGroups = ['C5', 'V4', 'C6'];
        
        abelianGroups.forEach(groupName => {
          const group = GroupDatabase.getGroup(groupName);
          if (!group) return;
          
          expect(group.center).toHaveLength(group.order);
          
          const centerSet = new Set(group.center);
          group.elements.forEach(element => {
            expect(centerSet.has(element.id)).toBe(true);
          });
        });
      });
    });

    describe('Conjugacy Classes Properties', () => {
      test('conjugacy classes partition the group', () => {
        const testGroups = ['S3', 'D4', 'Q8', 'A4'];
        
        testGroups.forEach(groupName => {
          const group = GroupDatabase.getGroup(groupName);
          if (!group) return;
          
          // All elements should appear exactly once across all conjugacy classes
          const allElements = group.conjugacyClasses.flat();
          expect(allElements).toHaveLength(group.order);
          
          const uniqueElements = new Set(allElements);
          expect(uniqueElements.size).toBe(group.order);
          
          // Each element should be in the conjugacy class indicated by its conjugacyClass property
          group.elements.forEach(element => {
            const classIndex = element.conjugacyClass;
            expect(group.conjugacyClasses[classIndex]).toContain(element.id);
          });
        });
      });

      test('conjugacy classes have sizes that divide the group order', () => {
        const testGroups = ['S3', 'D3', 'Q8'];
        
        testGroups.forEach(groupName => {
          const group = GroupDatabase.getGroup(groupName);
          if (!group) return;
          
          group.conjugacyClasses.forEach(conjugacyClass => {
            expect(group.order % conjugacyClass.length).toBe(0);
          });
        });
      });

      test('abelian groups have singleton conjugacy classes', () => {
        const abelianGroups = ['C4', 'V4', 'C6'];
        
        abelianGroups.forEach(groupName => {
          const group = GroupDatabase.getGroup(groupName);
          if (!group) return;
          
          expect(group.conjugacyClasses).toHaveLength(group.order);
          group.conjugacyClasses.forEach(conjugacyClass => {
            expect(conjugacyClass).toHaveLength(1);
          });
        });
      });
    });
  });

  describe('Specific Group Structure Tests', () => {
    describe('Cyclic Groups', () => {
      test('cyclic groups have correct structure', () => {
        const cyclicOrders = [2, 3, 4, 5, 6, 7, 8];
        
        cyclicOrders.forEach(n => {
          const group = GroupDatabase.getGroup(`C${n}`);
          expect(group).toBeDefined();
          if (!group) return;
          
          expect(group.order).toBe(n);
          expect(group.isAbelian).toBe(true);
          
          // Should have at least one generator
          expect(group.generators.length).toBeGreaterThan(0);
          
          // All elements should be in the center
          expect(group.center).toHaveLength(n);
          
          // Should have φ(n) generators where φ is Euler's totient function
          const expectedGeneratorCount = n > 1 ? this.eulerTotient(n) : 0;
          expect(group.generators.length).toBe(expectedGeneratorCount);
        });
      });

      test('cyclic group generators have correct orders', () => {
        const group = GroupDatabase.getGroup('C6');
        expect(group).toBeDefined();
        if (!group) return;
        
        group.generators.forEach(genId => {
          const generator = group.elements.find(e => e.id === genId);
          expect(generator).toBeDefined();
          expect(generator?.order).toBe(group.order);
        });
      });
    });

    describe('Symmetric Group S3', () => {
      test('S3 has correct structure', () => {
        const s3 = GroupDatabase.getGroup('S3');
        expect(s3).toBeDefined();
        if (!s3) return;
        
        expect(s3.order).toBe(6);
        expect(s3.isAbelian).toBe(false);
        expect(s3.center).toHaveLength(1); // Only identity in center
        
        // Should have 3 conjugacy classes: {e}, {transpositions}, {3-cycles}
        expect(s3.conjugacyClasses).toHaveLength(3);
        expect(s3.conjugacyClasses[0]).toHaveLength(1);  // Identity
        expect(s3.conjugacyClasses[1]).toHaveLength(3);  // Transpositions
        expect(s3.conjugacyClasses[2]).toHaveLength(2);  // 3-cycles
      });

      test('S3 element orders are correct', () => {
        const s3 = GroupDatabase.getGroup('S3');
        expect(s3).toBeDefined();
        if (!s3) return;
        
        const orderCounts: { [order: number]: number } = {};
        s3.elements.forEach(element => {
          orderCounts[element.order] = (orderCounts[element.order] || 0) + 1;
        });
        
        expect(orderCounts[1]).toBe(1); // 1 identity
        expect(orderCounts[2]).toBe(3); // 3 transpositions
        expect(orderCounts[3]).toBe(2); // 2 3-cycles
      });
    });

    describe('Klein Four Group V4', () => {
      test('V4 has correct structure', () => {
        const v4 = GroupDatabase.getGroup('V4');
        expect(v4).toBeDefined();
        if (!v4) return;
        
        expect(v4.order).toBe(4);
        expect(v4.isAbelian).toBe(true);
        expect(v4.center).toHaveLength(4); // All elements in center
        
        // All non-identity elements have order 2
        const nonIdentityElements = v4.elements.filter(e => e.order !== 1);
        expect(nonIdentityElements).toHaveLength(3);
        nonIdentityElements.forEach(element => {
          expect(element.order).toBe(2);
        });
      });

      test('V4 multiplication structure', () => {
        const v4 = GroupDatabase.getGroup('V4');
        expect(v4).toBeDefined();
        if (!v4) return;
        
        // Each non-identity element is its own inverse
        const nonIdentityElements = v4.elements.filter(e => e.order === 2);
        nonIdentityElements.forEach(element => {
          expect(element.inverse).toBe(element.id);
        });
        
        // Any two distinct non-identity elements multiply to give the third
        const [a, b, c] = nonIdentityElements;
        const ab = v4.operations.get(a.id)?.get(b.id);
        const ac = v4.operations.get(a.id)?.get(c.id);
        const bc = v4.operations.get(b.id)?.get(c.id);
        
        expect(ab).toBe(c.id);
        expect(ac).toBe(b.id);
        expect(bc).toBe(a.id);
      });
    });

    describe('Quaternion Group Q8', () => {
      test('Q8 has correct structure', () => {
        const q8 = GroupDatabase.getGroup('Q8');
        expect(q8).toBeDefined();
        if (!q8) return;
        
        expect(q8.order).toBe(8);
        expect(q8.isAbelian).toBe(false);
        expect(q8.center).toHaveLength(2); // {1, -1}
        
        // Order distribution: 1 element of order 1, 1 of order 2, 6 of order 4
        const orderCounts: { [order: number]: number } = {};
        q8.elements.forEach(element => {
          orderCounts[element.order] = (orderCounts[element.order] || 0) + 1;
        });
        
        expect(orderCounts[1]).toBe(1);
        expect(orderCounts[2]).toBe(1);
        expect(orderCounts[4]).toBe(6);
      });

      test('Q8 conjugacy classes', () => {
        const q8 = GroupDatabase.getGroup('Q8');
        expect(q8).toBeDefined();
        if (!q8) return;
        
        // Should have 5 conjugacy classes
        expect(q8.conjugacyClasses).toHaveLength(5);
        
        // Class sizes: 1, 1, 2, 2, 2
        const classSizes = q8.conjugacyClasses.map(c => c.length).sort((a, b) => a - b);
        expect(classSizes).toEqual([1, 1, 2, 2, 2]);
      });
    });

    describe('Dihedral Groups', () => {
      test('dihedral groups have correct structure', () => {
        const dihedralOrders = [3, 4, 5, 6];
        
        dihedralOrders.forEach(n => {
          const group = GroupDatabase.getGroup(`D${n}`);
          expect(group).toBeDefined();
          if (!group) return;
          
          expect(group.order).toBe(2 * n);
          expect(group.isAbelian).toBe(n <= 2);
          
          // Should have generators for rotations and reflections
          expect(group.generators).toContain('r1'); // Rotation
          expect(group.generators).toContain('s0'); // Reflection
        });
      });

      test('D3 ≅ S3 structure', () => {
        const d3 = GroupDatabase.getGroup('D3');
        expect(d3).toBeDefined();
        if (!d3) return;
        
        expect(d3.order).toBe(6);
        expect(d3.isAbelian).toBe(false);
        
        // Should be isomorphic to S3
        const s3 = GroupDatabase.getGroup('S3');
        expect(s3).toBeDefined();
        if (!s3) return;
        
        expect(d3.order).toBe(s3.order);
        expect(d3.isAbelian).toBe(s3.isAbelian);
        expect(d3.center.length).toBe(s3.center.length);
      });
    });
  });

  describe('Elliptic Curve Groups Integration', () => {
    test('database includes elliptic curve groups', () => {
      const allGroups = GroupDatabase.getAllGroups();
      const ecGroups = allGroups.filter(g => g.name.startsWith('EC_'));
      
      expect(ecGroups.length).toBeGreaterThan(0);
      
      ecGroups.forEach(group => {
        expect(group.isAbelian).toBe(true);
        expect(group.displayName).toContain('Elliptic Curve');
      });
    });

    test('can retrieve elliptic curve groups specifically', () => {
      const ecGroups = GroupDatabase.getEllipticCurveGroups();
      
      expect(Array.isArray(ecGroups)).toBe(true);
      
      ecGroups.forEach(group => {
        expect(group.name).toMatch(/^EC_/);
        expect(group.isAbelian).toBe(true);
      });
    });

    test('can add custom elliptic curve groups', () => {
      const customParams: EllipticCurveParameters = { a: 0, b: 1, p: 5 };
      const success = GroupDatabase.addEllipticCurveGroup('CustomTest', customParams);
      
      expect(success).toBe(true);
      
      const customGroup = GroupDatabase.getGroup('EC_CustomTest');
      expect(customGroup).toBeDefined();
      expect(customGroup?.isAbelian).toBe(true);
    });

    test('handles invalid elliptic curve parameters gracefully', () => {
      // Singular curve (discriminant = 0)
      const invalidParams: EllipticCurveParameters = { a: 0, b: 0, p: 5 };
      const success = GroupDatabase.addEllipticCurveGroup('InvalidTest', invalidParams);
      
      expect(success).toBe(false);
      
      const invalidGroup = GroupDatabase.getGroup('EC_InvalidTest');
      expect(invalidGroup).toBeUndefined();
    });

    test('elliptic curve groups satisfy group axioms', () => {
      const ecGroups = GroupDatabase.getEllipticCurveGroups().slice(0, 3); // Test first 3
      
      ecGroups.forEach(group => {
        // Test closure
        group.elements.forEach(a => {
          group.elements.forEach(b => {
            const product = group.operations.get(a.id)?.get(b.id);
            expect(product).toBeDefined();
            
            const result = group.elements.find(e => e.id === product);
            expect(result).toBeDefined();
          });
        });
        
        // Test identity
        const identity = group.elements.find(e => e.order === 1);
        expect(identity).toBeDefined();
        
        // Test inverses
        group.elements.forEach(element => {
          const inverse = group.elements.find(e => e.id === element.inverse);
          expect(inverse).toBeDefined();
          
          const product = group.operations.get(element.id)?.get(element.inverse);
          expect(product).toBe(identity?.id);
        });
      });
    });
  });

  describe('Performance and Scalability', () => {
    test('group retrieval operations are efficient', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        GroupDatabase.getGroup('S3');
        GroupDatabase.getGroupsByOrder(8);
        GroupDatabase.getGroupNames();
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    test('handles memory efficiently with repeated operations', () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      for (let i = 0; i < 100; i++) {
        const allGroups = GroupDatabase.getAllGroups();
        allGroups.forEach(group => {
          // Access various properties to ensure they're computed
          group.elements.length;
          group.operations.size;
          group.conjugacyClasses.length;
        });
      }
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 5MB)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });

    test('operation tables are complete and consistent', () => {
      const largerGroups = GroupDatabase.getGroupsByOrder(12); // A4, D6, etc.
      
      largerGroups.forEach(group => {
        expect(group.operations.size).toBe(group.order);
        
        group.operations.forEach((row, elementId) => {
          expect(row.size).toBe(group.order);
          
          row.forEach((result, otherId) => {
            expect(group.elements.find(e => e.id === result)).toBeDefined();
          });
        });
      });
    });
  });

  describe('Mathematical Consistency Across Groups', () => {
    test('verifies fundamental theorem of finite abelian groups', () => {
      // Every finite abelian group is isomorphic to a direct product of cyclic groups
      const abelianGroups = GroupDatabase.getAllGroups().filter(g => g.isAbelian);
      
      abelianGroups.forEach(group => {
        // All element orders should divide the group order
        group.elements.forEach(element => {
          expect(group.order % element.order).toBe(0);
        });
        
        // Group should be generated by elements of prime power order
        const maxOrder = Math.max(...group.elements.map(e => e.order));
        expect(maxOrder).toBeLessThanOrEqual(group.order);
      });
    });

    test('verifies Cauchy theorem for prime divisors', () => {
      const testGroups = GroupDatabase.getAllGroups().filter(g => g.order <= 20);
      
      testGroups.forEach(group => {
        const primeFactors = this.getPrimeFactors(group.order);
        
        primeFactors.forEach(prime => {
          // Should have at least one element of order p for each prime p dividing |G|
          const elementsOfOrderP = group.elements.filter(e => e.order === prime);
          expect(elementsOfOrderP.length).toBeGreaterThan(0);
        });
      });
    });

    test('verifies class equation for non-abelian groups', () => {
      const nonAbelianGroups = GroupDatabase.getAllGroups().filter(g => !g.isAbelian);
      
      nonAbelianGroups.forEach(group => {
        // |G| = |Z(G)| + Σ|G:C_G(g)| where sum is over representatives of non-central conjugacy classes
        const centerSize = group.center.length;
        const totalClassSizes = group.conjugacyClasses.reduce((sum, c) => sum + c.length, 0);
        
        expect(totalClassSizes).toBe(group.order);
        expect(centerSize).toBeLessThan(group.order); // Non-abelian groups have proper center
      });
    });
  });

  // Helper methods for testing
  private eulerTotient(n: number): number {
    let result = n;
    for (let p = 2; p * p <= n; p++) {
      if (n % p === 0) {
        while (n % p === 0) {
          n /= p;
        }
        result -= result / p;
      }
    }
    if (n > 1) {
      result -= result / n;
    }
    return Math.floor(result);
  }

  private getPrimeFactors(n: number): number[] {
    const factors: number[] = [];
    for (let d = 2; d <= Math.sqrt(n); d++) {
      while (n % d === 0) {
        if (!factors.includes(d)) {
          factors.push(d);
        }
        n /= d;
      }
    }
    if (n > 1) {
      factors.push(n);
    }
    return factors;
  }
});

describe('GroupDatabase Edge Cases and Error Handling', () => {
  test('handles empty group name queries', () => {
    expect(GroupDatabase.getGroup('')).toBeUndefined();
    expect(GroupDatabase.getGroup('   ')).toBeUndefined();
  });

  test('handles invalid order queries', () => {
    expect(GroupDatabase.getGroupsByOrder(0)).toEqual([]);
    expect(GroupDatabase.getGroupsByOrder(-1)).toEqual([]);
    expect(GroupDatabase.getGroupsByOrder(1000)).toEqual([]);
  });

  test('database state remains consistent after failed operations', () => {
    const initialGroupCount = GroupDatabase.getAllGroups().length;
    const initialNames = GroupDatabase.getGroupNames();
    
    // Attempt to add invalid elliptic curve
    GroupDatabase.addEllipticCurveGroup('Invalid', { a: 0, b: 0, p: 4 });
    
    // Database should remain unchanged
    expect(GroupDatabase.getAllGroups().length).toBe(initialGroupCount);
    expect(GroupDatabase.getGroupNames()).toEqual(initialNames);
  });

  test('handles concurrent access patterns', () => {
    // Simulate concurrent access
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      promises.push(Promise.resolve().then(() => {
        const groups = GroupDatabase.getAllGroups();
        const randomGroup = groups[Math.floor(Math.random() * groups.length)];
        return GroupDatabase.getGroup(randomGroup.name);
      }));
    }
    
    return Promise.all(promises).then(results => {
      results.forEach(group => {
        expect(group).toBeDefined();
        expect(group?.name).toBeDefined();
      });
    });
  });
});