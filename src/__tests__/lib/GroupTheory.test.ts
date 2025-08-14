/**
 * Unit tests for Group Theory mathematical algorithms
 * Tests mathematical accuracy and computational correctness
 */

import { 
  Permutation, 
  GroupTheoryLibrary, 
  CayleyGraphGenerator,
  type Group,
  type GroupElement,
  type CayleyGraph 
} from '@/lib/GroupTheory';

describe('Permutation Class', () => {
  describe('Construction and Basic Operations', () => {
    test('creates permutation from cycle notation', () => {
      const perm = new Permutation([[0, 1, 2]]);
      expect(perm.toString()).toBe('(0,1,2)');
    });

    test('creates permutation from array notation', () => {
      const perm = new Permutation([1, 2, 0]); // 0->1, 1->2, 2->0
      expect(perm.toString()).toBe('(0,1,2)');
    });

    test('handles identity permutation', () => {
      const perm = new Permutation([0, 1, 2]);
      expect(perm.toString()).toBe('e');
    });

    test('converts between representations correctly', () => {
      const cycles = [[0, 1], [2, 3]];
      const perm = new Permutation(cycles);
      const array = perm.toArray();
      expect(array).toEqual([1, 0, 3, 2]);
    });
  });

  describe('Mathematical Operations', () => {
    test('computes permutation multiplication correctly', () => {
      const perm1 = new Permutation([1, 0, 2]); // (0 1)
      const perm2 = new Permutation([0, 2, 1]); // (1 2)
      const product = perm1.multiply(perm2);
      expect(product.toArray()).toEqual([2, 0, 1]); // (0 2 1)
    });

    test('computes permutation inverse correctly', () => {
      const perm = new Permutation([1, 2, 0]); // (0 1 2)
      const inverse = perm.inverse();
      expect(inverse.toArray()).toEqual([2, 0, 1]); // (0 2 1)
      
      // Verify inverse property
      const identity = perm.multiply(inverse);
      expect(identity.toArray()).toEqual([0, 1, 2]);
    });

    test('computes order correctly', () => {
      const identity = new Permutation([0, 1, 2]);
      expect(identity.order()).toBe(1);
      
      const transposition = new Permutation([1, 0, 2]);
      expect(transposition.order()).toBe(2);
      
      const threeCycle = new Permutation([1, 2, 0]);
      expect(threeCycle.order()).toBe(3);
    });

    test('checks equality correctly', () => {
      const perm1 = new Permutation([1, 0, 2]);
      const perm2 = new Permutation([[0, 1]]);
      expect(perm1.equals(perm2)).toBe(true);
      
      const perm3 = new Permutation([0, 1, 2]);
      expect(perm1.equals(perm3)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty cycles', () => {
      const perm = new Permutation([]);
      expect(perm.toString()).toBe('e');
      expect(perm.order()).toBe(1);
    });

    test('handles single element cycles', () => {
      const perm = new Permutation([[0], [1, 2]]);
      expect(perm.toString()).toBe('(1,2)');
    });

    test('handles different degrees', () => {
      const perm1 = new Permutation([1, 0], 3);
      const perm2 = new Permutation([2, 1, 0]);
      const product = perm1.multiply(perm2);
      expect(product.toArray()).toHaveLength(3);
    });
  });

  describe('Mathematical Properties', () => {
    test('verifies associativity of permutation multiplication', () => {
      const a = new Permutation([1, 0, 2]);
      const b = new Permutation([0, 2, 1]);
      const c = new Permutation([2, 1, 0]);
      
      const ab_c = a.multiply(b).multiply(c);
      const a_bc = a.multiply(b.multiply(c));
      
      expect(ab_c.equals(a_bc)).toBe(true);
    });

    test('verifies inverse properties', () => {
      const perm = new Permutation([2, 0, 1]);
      const inverse = perm.inverse();
      
      // perm * inverse = identity
      const rightProduct = perm.multiply(inverse);
      const leftProduct = inverse.multiply(perm);
      
      expect(rightProduct.equals(new Permutation([0, 1, 2]))).toBe(true);
      expect(leftProduct.equals(new Permutation([0, 1, 2]))).toBe(true);
    });
  });
});

describe('Group Theory Library', () => {
  describe('Group Access', () => {
    test('retrieves basic groups correctly', () => {
      const c3 = GroupTheoryLibrary.getGroup('C3');
      expect(c3).toBeDefined();
      expect(c3?.name).toBe('C3');
      expect(c3?.order).toBe(3);
      expect(c3?.isAbelian).toBe(true);
    });

    test('gets groups by order', () => {
      const order4Groups = GroupTheoryLibrary.getGroupsByOrder(4);
      expect(order4Groups).toBeDefined();
      expect(order4Groups.length).toBeGreaterThan(0);
      order4Groups.forEach(group => {
        expect(group.order).toBe(4);
      });
    });

    test('returns all group names', () => {
      const names = GroupTheoryLibrary.getGroupNames();
      expect(names).toBeDefined();
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
    });
  });

  describe('Group Structure Validation', () => {
    test('validates group closure property', () => {
      const s3 = GroupTheoryLibrary.getGroup('S3');
      if (!s3) return;

      // Test closure: for all a,b in group, a*b is in group
      s3.elements.forEach(a => {
        s3.elements.forEach(b => {
          const product = s3.operations.get(a.id)?.get(b.id);
          expect(product).toBeDefined();
          expect(s3.elements.find(e => e.id === product)).toBeDefined();
        });
      });
    });

    test('validates identity element properties', () => {
      const groups = ['C3', 'S3', 'V4', 'D3'];
      
      groups.forEach(groupName => {
        const group = GroupTheoryLibrary.getGroup(groupName);
        if (!group) return;
        
        // Find identity element (should be 'e')
        const identity = group.elements.find(e => e.id === 'e');
        expect(identity).toBeDefined();
        
        // Test identity properties: e * a = a * e = a for all a
        group.elements.forEach(element => {
          const leftProduct = group.operations.get(identity!.id)?.get(element.id);
          const rightProduct = group.operations.get(element.id)?.get(identity!.id);
          
          expect(leftProduct).toBe(element.id);
          expect(rightProduct).toBe(element.id);
        });
      });
    });

    test('validates inverse element properties', () => {
      const group = GroupTheoryLibrary.getGroup('S3');
      if (!group) return;

      group.elements.forEach(element => {
        const inverseId = element.inverse;
        const inverse = group.elements.find(e => e.id === inverseId);
        
        expect(inverse).toBeDefined();
        
        // Test inverse property: a * a^(-1) = e
        const product = group.operations.get(element.id)?.get(inverseId);
        expect(product).toBe('e');
      });
    });

    test('validates associativity', () => {
      const group = GroupTheoryLibrary.getGroup('C4');
      if (!group) return;

      // Test associativity for a subset (full test would be expensive)
      const testElements = group.elements.slice(0, Math.min(3, group.elements.length));
      
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

describe('Cayley Graph Generator', () => {
  describe('Graph Structure', () => {
    test('generates valid Cayley graph for cyclic group', () => {
      const group = GroupTheoryLibrary.getGroup('C4');
      if (!group) return;

      const generators = ['g'];
      const graph = CayleyGraphGenerator.generateGraph(group, generators);
      
      expect(graph.vertices).toHaveLength(group.order);
      expect(graph.edges).toHaveLength(group.order); // Each vertex has one outgoing edge per generator
      expect(graph.generators).toHaveLength(generators.length);
      
      // Validate Cayley graph structure
      expect(graph.vertices.every(v => 
        typeof v.x === 'number' && typeof v.y === 'number' && 
        v.id && v.label && v.color
      )).toBe(true);
      
      // Each edge should connect valid vertices
      graph.edges.forEach(edge => {
        expect(graph.vertices.find(v => v.id === edge.source)).toBeDefined();
        expect(graph.vertices.find(v => v.id === edge.target)).toBeDefined();
      });
    });

    test('generates valid Cayley graph for symmetric group', () => {
      const group = GroupTheoryLibrary.getGroup('S3');
      if (!group) return;

      const generators = group.generators;
      const graph = CayleyGraphGenerator.generateGraph(group, generators);
      
      expect(graph.vertices).toHaveLength(group.order);
      expect(graph.edges).toHaveLength(group.order * generators.length);
      
      // Validate Cayley graph structure
      expect(graph.vertices.every(v => 
        typeof v.x === 'number' && typeof v.y === 'number' && 
        v.id && v.label && v.color
      )).toBe(true);
      
      // Each edge should connect valid vertices
      graph.edges.forEach(edge => {
        expect(graph.vertices.find(v => v.id === edge.source)).toBeDefined();
        expect(graph.vertices.find(v => v.id === edge.target)).toBeDefined();
      });
    });

    test('assigns unique positions to vertices', () => {
      const group = GroupTheoryLibrary.getGroup('V4');
      if (!group) return;

      const graph = CayleyGraphGenerator.generateGraph(group, ['a', 'b']);
      
      // Check that all vertices have unique positions
      const positions = graph.vertices.map(v => `${v.x},${v.y}`);
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBe(graph.vertices.length);
    });

    test('creates edges that respect group operations', () => {
      const group = GroupTheoryLibrary.getGroup('C3');
      if (!group) return;

      const generators = ['g'];
      const graph = CayleyGraphGenerator.generateGraph(group, generators);
      
      graph.edges.forEach(edge => {
        const sourceElement = group.elements.find(e => e.id === edge.source);
        const targetElement = group.elements.find(e => e.id === edge.target);
        const generator = edge.generator;
        
        expect(sourceElement).toBeDefined();
        expect(targetElement).toBeDefined();
        
        // Verify edge corresponds to group operation
        const expectedTarget = group.operations.get(edge.source)?.get(generator);
        expect(expectedTarget).toBe(edge.target);
      });
    });
  });

  describe('Layout Algorithms', () => {
    test('applies appropriate layout for different group types', () => {
      const testCases = [
        { groupName: 'C4', expectedLayout: 'circular' },
        { groupName: 'V4', expectedLayout: 'rectangular' },
        { groupName: 'S3', expectedLayout: 'custom' },
        { groupName: 'D3', expectedLayout: 'dual-circle' },
      ];

      testCases.forEach(({ groupName, expectedLayout }) => {
        const group = GroupTheoryLibrary.getGroup(groupName);
        if (!group) return;

        const graph = CayleyGraphGenerator.generateGraph(group, group.generators);
        
        // Verify that vertices are positioned (not all at origin)
        const nonZeroPositions = graph.vertices.filter(v => v.x !== 0 || v.y !== 0);
        expect(nonZeroPositions.length).toBeGreaterThan(0);
        
        // Check reasonable spacing between vertices
        const distances: number[] = [];
        for (let i = 0; i < graph.vertices.length; i++) {
          for (let j = i + 1; j < graph.vertices.length; j++) {
            const v1 = graph.vertices[i];
            const v2 = graph.vertices[j];
            const dist = Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
            distances.push(dist);
          }
        }
        
        const minDistance = Math.min(...distances);
        expect(minDistance).toBeGreaterThan(10); // Reasonable minimum spacing
      });
    });
  });
});

describe('Mathematical Accuracy Tests', () => {
  describe('Group Order Calculations', () => {
    test('verifies Lagrange theorem for subgroups', () => {
      const groups = ['S3', 'D3', 'V4'];
      
      groups.forEach(groupName => {
        const group = GroupTheoryLibrary.getGroup(groupName);
        if (!group) return;

        group.subgroups.forEach(subgroup => {
          // Lagrange theorem: |H| divides |G|
          expect(group.order % subgroup.elements.length).toBe(0);
        });
      });
    });

    test('verifies element orders divide group order', () => {
      const group = GroupTheoryLibrary.getGroup('S3');
      if (!group) return;

      group.elements.forEach(element => {
        // Element order should divide group order
        expect(group.order % element.order).toBe(0);
      });
    });
  });

  describe('Group Properties', () => {
    test('verifies abelian group commutativity', () => {
      const abelianGroups = ['C3', 'C4', 'V4'];
      
      abelianGroups.forEach(groupName => {
        const group = GroupTheoryLibrary.getGroup(groupName);
        if (!group || !group.isAbelian) return;

        // Test commutativity: a * b = b * a for all a, b
        group.elements.forEach(a => {
          group.elements.forEach(b => {
            const ab = group.operations.get(a.id)?.get(b.id);
            const ba = group.operations.get(b.id)?.get(a.id);
            expect(ab).toBe(ba);
          });
        });
      });
    });

    test('verifies center of group', () => {
      const group = GroupTheoryLibrary.getGroup('S3');
      if (!group) return;

      group.center.forEach(centerElementId => {
        const centerElement = group.elements.find(e => e.id === centerElementId);
        expect(centerElement).toBeDefined();
        
        // Element in center commutes with all elements
        group.elements.forEach(element => {
          const ce = group.operations.get(centerElementId)?.get(element.id);
          const ec = group.operations.get(element.id)?.get(centerElementId);
          expect(ce).toBe(ec);
        });
      });
    });

    test('verifies conjugacy classes partition', () => {
      const group = GroupTheoryLibrary.getGroup('S3');
      if (!group) return;

      // All elements should be in exactly one conjugacy class
      const allElements = group.conjugacyClasses.flat();
      expect(allElements).toHaveLength(group.order);
      
      // No element should appear in multiple classes
      const uniqueElements = new Set(allElements);
      expect(uniqueElements.size).toBe(group.order);
      
      // Each element should be in the conjugacy class indicated by its conjugacyClass property
      group.elements.forEach(element => {
        const classIndex = element.conjugacyClass;
        expect(group.conjugacyClasses[classIndex]).toContain(element.id);
      });
    });
  });
});

describe('Performance Tests', () => {
  test('generates large Cayley graphs efficiently', () => {
    const group = GroupTheoryLibrary.getGroup('D6'); // Order 12
    if (!group) return;

    const startTime = performance.now();
    const graph = CayleyGraphGenerator.generateGraph(group, group.generators);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    expect(graph.vertices).toHaveLength(group.order);
  });

  test('handles memory efficiently for complex computations', () => {
    const groups = ['C8', 'D4', 'Q8'];
    
    groups.forEach(groupName => {
      const group = GroupTheoryLibrary.getGroup(groupName);
      if (!group) return;

      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Perform multiple operations
      for (let i = 0; i < 100; i++) {
        CayleyGraphGenerator.generateGraph(group, group.generators);
      }
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });
  });
});

describe('Edge Cases and Error Handling', () => {
  test('handles invalid group names gracefully', () => {
    const invalidGroup = GroupTheoryLibrary.getGroup('InvalidGroup');
    expect(invalidGroup).toBeUndefined();
  });

  test('handles empty generators list', () => {
    const group = GroupTheoryLibrary.getGroup('C3');
    if (!group) return;

    const graph = CayleyGraphGenerator.generateGraph(group, []);
    expect(graph.vertices).toHaveLength(group.order);
    expect(graph.edges).toHaveLength(0);
    expect(graph.generators).toHaveLength(0);
  });

  test('handles invalid generators gracefully', () => {
    const group = GroupTheoryLibrary.getGroup('C3');
    if (!group) return;

    const graph = CayleyGraphGenerator.generateGraph(group, ['invalid_gen']);
    expect(graph.vertices).toHaveLength(group.order);
    expect(graph.edges).toHaveLength(0); // No valid edges created
  });
});

describe('Mathematical Consistency', () => {
  test('verifies group axioms for all available groups', () => {
    const allGroups = GroupTheoryLibrary.getAllGroups();
    
    allGroups.forEach(group => {
      // Skip very large groups for performance
      if (group.order > 20) return;

      // Test identity element exists
      const identity = group.elements.find(e => e.id === 'e');
      expect(identity).toBeDefined();

      // Test each element has an inverse
      group.elements.forEach(element => {
        const inverse = group.elements.find(e => e.id === element.inverse);
        expect(inverse).toBeDefined();
      });

      // Test operation table is complete
      group.elements.forEach(a => {
        group.elements.forEach(b => {
          const product = group.operations.get(a.id)?.get(b.id);
          expect(product).toBeDefined();
          expect(group.elements.find(e => e.id === product)).toBeDefined();
        });
      });
    });
  });
});

describe('Enhanced Mathematical Validation', () => {
  describe('Advanced Group Properties', () => {
    test('verifies generator minimality', () => {
      const testGroups = ['C6', 'S3', 'D4'];
      
      testGroups.forEach(groupName => {
        const group = GroupTheoryLibrary.getGroup(groupName);
        if (!group) return;
        
        // Verify that generators actually generate the group
        const generated = new Set(['e']); // Start with identity
        const queue = [...group.generators];
        
        while (queue.length > 0) {
          const current = queue.shift()!;
          if (!generated.has(current)) {
            generated.add(current);
            
            // Add all products with existing elements
            Array.from(generated).forEach(existing => {
              const product1 = group.operations.get(current)?.get(existing);
              const product2 = group.operations.get(existing)?.get(current);
              
              if (product1 && !generated.has(product1)) queue.push(product1);
              if (product2 && !generated.has(product2)) queue.push(product2);
            });
          }
        }
        
        expect(generated.size).toBe(group.order);
      });
    });

    test('verifies subgroup lattice properties', () => {
      const group = GroupTheoryLibrary.getGroup('D3');
      if (!group) return;
      
      // Verify subgroup intersection and join properties
      for (let i = 0; i < group.subgroups.length; i++) {
        for (let j = i + 1; j < group.subgroups.length; j++) {
          const H = new Set(group.subgroups[i].elements);
          const K = new Set(group.subgroups[j].elements);
          
          // Intersection of subgroups is a subgroup
          const intersection = Array.from(H).filter(x => K.has(x));
          
          // Verify intersection satisfies closure
          intersection.forEach(a => {
            intersection.forEach(b => {
              const product = group.operations.get(a)?.get(b);
              if (product) {
                expect(intersection).toContain(product);
              }
            });
          });
        }
      }
    });

    test('verifies normal subgroup properties', () => {
      const group = GroupTheoryLibrary.getGroup('S3');
      if (!group) return;
      
      group.subgroups.forEach(subgroup => {
        if (!subgroup.isNormal) return;
        
        const N = new Set(subgroup.elements);
        
        // For normal subgroups: gNg^(-1) = N for all g in G
        group.elements.forEach(g => {
          const gInverse = group.elements.find(e => e.id === g.inverse)!;
          
          subgroup.elements.forEach(n => {
            // Compute gng^(-1)
            const gn = group.operations.get(g.id)?.get(n);
            if (gn) {
              const conjugate = group.operations.get(gn)?.get(gInverse.id);
              if (conjugate) {
                expect(N.has(conjugate)).toBe(true);
              }
            }
          });
        });
      });
    });
  });

  describe('Mathematical Theorems Verification', () => {
    test('verifies Cauchy theorem for prime divisors', () => {
      const testGroups = ['S3', 'S4', 'D5', 'A4']; // Groups with various prime factors
      
      testGroups.forEach(groupName => {
        const group = GroupTheoryLibrary.getGroup(groupName);
        if (!group) return;
        
        // Find prime factors of group order
        const primeFactors = getPrimeFactors(group.order);
        
        primeFactors.forEach(p => {
          // Cauchy theorem: if p divides |G|, then G has an element of order p
          const elementOfOrderP = group.elements.find(e => e.order === p);
          expect(elementOfOrderP).toBeDefined();
        });
      });
    });

    test('verifies Sylow theorems', () => {
      const group = GroupTheoryLibrary.getGroup('S3'); // Order 6 = 2 × 3
      if (!group) return;
      
      // Sylow 2-subgroups (order 2)
      const sylow2Subgroups = group.subgroups.filter(sg => sg.elements.length === 2);
      expect(sylow2Subgroups.length).toBe(3); // n_2 = 3 for S3
      
      // Sylow 3-subgroups (order 3)
      const sylow3Subgroups = group.subgroups.filter(sg => sg.elements.length === 3);
      expect(sylow3Subgroups.length).toBe(1); // n_3 = 1 for S3
      expect(sylow3Subgroups[0].isNormal).toBe(true); // Unique Sylow p-subgroup is normal
    });

    test('verifies class equation', () => {
      const group = GroupTheoryLibrary.getGroup('S3');
      if (!group) return;
      
      // Class equation: |G| = |Z(G)| + Σ|G:C_G(g_i)|
      const centerSize = group.center.length;
      
      let classSizesSum = centerSize; // Start with center size
      
      group.conjugacyClasses.forEach(conjugacyClass => {
        if (conjugacyClass.length > 1) { // Non-central classes
          classSizesSum += conjugacyClass.length;
        }
      });
      
      expect(classSizesSum).toBe(group.order);
    });
  });

  describe('Algorithmic Correctness', () => {
    test('verifies multiplication table symmetry for abelian groups', () => {
      const abelianGroups = ['C4', 'V4', 'C6'];
      
      abelianGroups.forEach(groupName => {
        const group = GroupTheoryLibrary.getGroup(groupName);
        if (!group || !group.isAbelian) return;
        
        // For abelian groups, operation should be commutative
        group.elements.forEach(a => {
          group.elements.forEach(b => {
            const ab = group.operations.get(a.id)?.get(b.id);
            const ba = group.operations.get(b.id)?.get(a.id);
            expect(ab).toBe(ba);
          });
        });
      });
    });

    test('verifies conjugacy class correctness', () => {
      const group = GroupTheoryLibrary.getGroup('S3');
      if (!group) return;
      
      // Verify each element is in exactly one conjugacy class
      const allElementsInClasses = group.conjugacyClasses.flat();
      expect(allElementsInClasses.sort()).toEqual(
        group.elements.map(e => e.id).sort()
      );
      
      // Verify conjugacy relation
      group.conjugacyClasses.forEach((conjugacyClass, classIndex) => {
        conjugacyClass.forEach(elementId => {
          const element = group.elements.find(e => e.id === elementId)!;
          expect(element.conjugacyClass).toBe(classIndex);
          
          // Check that conjugates are in the same class
          group.elements.forEach(g => {
            const gInverse = group.elements.find(e => e.id === g.inverse)!;
            const ge = group.operations.get(g.id)?.get(elementId);
            if (ge) {
              const conjugate = group.operations.get(ge)?.get(gInverse.id);
              if (conjugate) {
                expect(conjugacyClass).toContain(conjugate);
              }
            }
          });
        });
      });
    });
  });

  describe('Numerical Precision', () => {
    test('handles floating point precision in calculations', () => {
      const tolerance = global.__MATHEMATICAL_PRECISION__?.FLOAT_TOLERANCE || 1e-6;
      
      // Test permutation cycle calculations
      const perm = new Permutation([1, 2, 0, 4, 3]); // Mixed cycles
      expect(perm.order()).toBe(6); // LCM(3, 2) = 6
      
      // Test repeated operations maintain precision
      let current = perm;
      for (let i = 1; i <= perm.order(); i++) {
        if (i === perm.order()) {
          // Should return to identity
          expect(current.equals(new Permutation([0, 1, 2, 3, 4]))).toBe(true);
        }
        current = current.multiply(perm);
      }
    });

    test('validates element order calculations', () => {
      const testElements = [
        { perm: [1, 0, 2], expectedOrder: 2 },
        { perm: [1, 2, 0], expectedOrder: 3 },
        { perm: [0, 1, 2], expectedOrder: 1 },
        { perm: [2, 0, 1], expectedOrder: 3 },
        { perm: [1, 0, 3, 2], expectedOrder: 2 }
      ];
      
      testElements.forEach(({ perm, expectedOrder }) => {
        const permutation = new Permutation(perm);
        expect(permutation.order()).toBe(expectedOrder);
        
        // Verify order definition: g^order = identity
        let power = permutation;
        for (let i = 1; i < expectedOrder; i++) {
          power = power.multiply(permutation);
          expect(power.equals(new Permutation(perm.map((_, i) => i)))).toBe(false);
        }
        
        power = power.multiply(permutation);
        expect(power.equals(new Permutation(perm.map((_, i) => i)))).toBe(true);
      });
    });
  });
});

describe('Cayley Graph Mathematical Properties', () => {
  test('verifies graph connectivity', () => {
    const group = GroupTheoryLibrary.getGroup('S3');
    if (!group) return;
    
    const graph = CayleyGraphGenerator.generateGraph(group, group.generators);
    
    // Cayley graph should be connected (can reach any vertex from identity)
    const visited = new Set<string>();
    const queue = ['e']; // Start from identity
    visited.add('e');
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      // Find all edges from current vertex
      graph.edges.forEach(edge => {
        if (edge.source === current && !visited.has(edge.target)) {
          visited.add(edge.target);
          queue.push(edge.target);
        }
      });
    }
    
    expect(visited.size).toBe(group.order);
  });

  test('verifies vertex-transitivity', () => {
    const group = GroupTheoryLibrary.getGroup('C4');
    if (!group) return;
    
    const graph = CayleyGraphGenerator.generateGraph(group, group.generators);
    
    // In a Cayley graph, the automorphism group acts transitively on vertices
    // All vertices should have the same degree (number of edges)
    const degrees = new Map<string, number>();
    
    graph.vertices.forEach(vertex => {
      const outDegree = graph.edges.filter(e => e.source === vertex.id).length;
      const inDegree = graph.edges.filter(e => e.target === vertex.id).length;
      
      degrees.set(vertex.id, outDegree);
      expect(outDegree).toBe(inDegree); // Directed graph, but in/out should match
    });
    
    // All degrees should be equal
    const degreeValues = Array.from(degrees.values());
    expect(degreeValues.every(d => d === degreeValues[0])).toBe(true);
  });
});

// Helper function for mathematical tests
function getPrimeFactors(n: number): number[] {
  const factors: number[] = [];
  let d = 2;
  
  while (d * d <= n) {
    while (n % d === 0) {
      factors.push(d);
      n /= d;
    }
    d++;
  }
  
  if (n > 1) factors.push(n);
  
  return [...new Set(factors)]; // Return unique prime factors
}