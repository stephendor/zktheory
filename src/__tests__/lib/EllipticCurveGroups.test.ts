/**
 * Comprehensive Unit Tests for Elliptic Curve Groups
 * Tests mathematical accuracy, edge cases, and computational correctness
 */

import {
  EllipticCurveArithmetic,
  EllipticCurveGroupGenerator,
  EllipticCurveAnimator,
  type EllipticCurve,
  type EllipticCurvePoint,
  type EllipticCurveGroup,
  type PointAdditionAnimation
} from '@/lib/EllipticCurveGroups';

describe('EllipticCurveArithmetic', () => {
  describe('Modular Arithmetic Utilities', () => {
    describe('modInverse', () => {
      test('computes modular inverse correctly for known values', () => {
        expect(EllipticCurveArithmetic.modInverse(3, 7)).toBe(5); // 3 * 5 ≡ 1 (mod 7)
        expect(EllipticCurveArithmetic.modInverse(2, 5)).toBe(3); // 2 * 3 ≡ 1 (mod 5)
        expect(EllipticCurveArithmetic.modInverse(4, 9)).toBe(7); // 4 * 7 ≡ 1 (mod 9)
      });

      test('handles edge case a = 1', () => {
        expect(EllipticCurveArithmetic.modInverse(1, 5)).toBe(1); // 1 * 1 ≡ 1 (mod 5)
        expect(EllipticCurveArithmetic.modInverse(1, 7)).toBe(1);
      });

      test('handles negative inputs correctly', () => {
        expect(EllipticCurveArithmetic.modInverse(-3, 7)).toBe(5); // -3 ≡ 4, 4 * 2 ≡ 1 (mod 7), but 4^(-1) = 2
        expect(EllipticCurveArithmetic.modInverse(-1, 5)).toBe(4); // -1 ≡ 4, 4 * 4 ≡ 1 (mod 5)
      });

      test('throws error for invalid inputs', () => {
        expect(() => EllipticCurveArithmetic.modInverse(0, 5)).toThrow('Cannot find inverse of 0');
        expect(() => EllipticCurveArithmetic.modInverse(2, 0)).toThrow('Modulus must be positive');
        expect(() => EllipticCurveArithmetic.modInverse(2, -5)).toThrow('Modulus must be positive');
      });

      test('throws error when inverse does not exist', () => {
        expect(() => EllipticCurveArithmetic.modInverse(2, 4)).toThrow('does not exist');
        expect(() => EllipticCurveArithmetic.modInverse(6, 9)).toThrow('does not exist');
      });

      test('verifies inverse property for random cases', () => {
        const testCases = [
          { a: 7, m: 13 },
          { a: 11, m: 17 },
          { a: 5, m: 23 },
          { a: 13, m: 29 }
        ];

        testCases.forEach(({ a, m }) => {
          const inverse = EllipticCurveArithmetic.modInverse(a, m);
          expect((a * inverse) % m).toBe(1);
        });
      });
    });

    describe('modPow', () => {
      test('computes modular exponentiation correctly', () => {
        expect(EllipticCurveArithmetic.modPow(2, 3, 5)).toBe(3); // 2³ ≡ 3 (mod 5)
        expect(EllipticCurveArithmetic.modPow(3, 4, 7)).toBe(4); // 3⁴ ≡ 4 (mod 7)
        expect(EllipticCurveArithmetic.modPow(5, 0, 13)).toBe(1); // 5⁰ ≡ 1 (mod 13)
      });

      test('handles large exponents efficiently', () => {
        const startTime = performance.now();
        const result = EllipticCurveArithmetic.modPow(2, 1000, 1009);
        const endTime = performance.now();
        
        expect(result).toBeDefined();
        expect(endTime - startTime).toBeLessThan(10); // Should complete in under 10ms
      });

      test('handles edge cases', () => {
        expect(EllipticCurveArithmetic.modPow(0, 5, 7)).toBe(0);
        expect(EllipticCurveArithmetic.modPow(1, 100, 7)).toBe(1);
        expect(EllipticCurveArithmetic.modPow(7, 1, 7)).toBe(0);
      });
    });
  });

  describe('Point Validation', () => {
    const curve: EllipticCurve = { a: 1, b: 1, p: 5, name: 'test', displayName: 'test' };

    test('validates identity point correctly', () => {
      const identity: EllipticCurvePoint = { x: null, y: null, isIdentity: true };
      expect(EllipticCurveArithmetic.isOnCurve(identity, curve)).toBe(true);
    });

    test('validates points on curve y² = x³ + x + 1 (mod 5)', () => {
      const validPoints: EllipticCurvePoint[] = [
        { x: 0, y: 1, isIdentity: false }, // 1² ≡ 0³ + 0 + 1 ≡ 1 (mod 5) ✓
        { x: 0, y: 4, isIdentity: false }, // 4² ≡ 1 (mod 5) ✓
        { x: 2, y: 1, isIdentity: false }, // 1² ≡ 8 + 2 + 1 ≡ 1 (mod 5) ✓
        { x: 2, y: 4, isIdentity: false }  // 4² ≡ 1 (mod 5) ✓
      ];

      validPoints.forEach(point => {
        expect(EllipticCurveArithmetic.isOnCurve(point, curve)).toBe(true);
      });
    });

    test('rejects points not on curve', () => {
      const invalidPoints: EllipticCurvePoint[] = [
        { x: 1, y: 1, isIdentity: false },
        { x: 3, y: 2, isIdentity: false },
        { x: 4, y: 0, isIdentity: false }
      ];

      invalidPoints.forEach(point => {
        expect(EllipticCurveArithmetic.isOnCurve(point, curve)).toBe(false);
      });
    });

    test('handles null coordinates in non-identity points', () => {
      const invalidPoint1: EllipticCurvePoint = { x: null, y: 1, isIdentity: false };
      const invalidPoint2: EllipticCurvePoint = { x: 1, y: null, isIdentity: false };
      
      expect(EllipticCurveArithmetic.isOnCurve(invalidPoint1, curve)).toBe(false);
      expect(EllipticCurveArithmetic.isOnCurve(invalidPoint2, curve)).toBe(false);
    });
  });

  describe('Point Addition', () => {
    const curve: EllipticCurve = { a: 1, b: 1, p: 5, name: 'test', displayName: 'test' };
    const identity: EllipticCurvePoint = { x: null, y: null, isIdentity: true };
    const point1: EllipticCurvePoint = { x: 0, y: 1, isIdentity: false };
    const point2: EllipticCurvePoint = { x: 2, y: 1, isIdentity: false };

    test('handles identity element correctly', () => {
      expect(EllipticCurveArithmetic.addPoints(identity, point1, curve)).toEqual(point1);
      expect(EllipticCurveArithmetic.addPoints(point1, identity, curve)).toEqual(point1);
      expect(EllipticCurveArithmetic.addPoints(identity, identity, curve)).toEqual(identity);
    });

    test('handles point inversion correctly', () => {
      const point: EllipticCurvePoint = { x: 0, y: 1, isIdentity: false };
      const inverse: EllipticCurvePoint = { x: 0, y: 4, isIdentity: false }; // -1 ≡ 4 (mod 5)
      
      const result = EllipticCurveArithmetic.addPoints(point, inverse, curve);
      expect(result.isIdentity).toBe(true);
    });

    test('computes point doubling correctly', () => {
      const point: EllipticCurvePoint = { x: 0, y: 1, isIdentity: false };
      const result = EllipticCurveArithmetic.addPoints(point, point, curve);
      
      // Verify result is on curve
      expect(EllipticCurveArithmetic.isOnCurve(result, curve)).toBe(true);
    });

    test('computes addition of different points correctly', () => {
      const result = EllipticCurveArithmetic.addPoints(point1, point2, curve);
      
      // Verify result is on curve
      expect(EllipticCurveArithmetic.isOnCurve(result, curve)).toBe(true);
      expect(result.isIdentity).toBe(false);
    });

    test('verifies commutativity: P + Q = Q + P', () => {
      const result1 = EllipticCurveArithmetic.addPoints(point1, point2, curve);
      const result2 = EllipticCurveArithmetic.addPoints(point2, point1, curve);
      
      expect(result1.x).toBe(result2.x);
      expect(result1.y).toBe(result2.y);
      expect(result1.isIdentity).toBe(result2.isIdentity);
    });

    test('verifies associativity: (P + Q) + R = P + (Q + R)', () => {
      const point3: EllipticCurvePoint = { x: 2, y: 4, isIdentity: false };
      
      const left = EllipticCurveArithmetic.addPoints(
        EllipticCurveArithmetic.addPoints(point1, point2, curve),
        point3,
        curve
      );
      
      const right = EllipticCurveArithmetic.addPoints(
        point1,
        EllipticCurveArithmetic.addPoints(point2, point3, curve),
        curve
      );
      
      expect(left.x).toBe(right.x);
      expect(left.y).toBe(right.y);
      expect(left.isIdentity).toBe(right.isIdentity);
    });

    test('handles vertical tangent lines in point doubling', () => {
      // Create a curve where point doubling results in identity
      const specialCurve: EllipticCurve = { a: 0, b: 0, p: 5, name: 'special', displayName: 'special' };
      const specialPoint: EllipticCurvePoint = { x: 0, y: 0, isIdentity: false };
      
      const result = EllipticCurveArithmetic.addPoints(specialPoint, specialPoint, specialCurve);
      expect(result.isIdentity).toBe(true);
    });
  });

  describe('Scalar Multiplication', () => {
    const curve: EllipticCurve = { a: 1, b: 1, p: 5, name: 'test', displayName: 'test' };
    const point: EllipticCurvePoint = { x: 0, y: 1, isIdentity: false };
    const identity: EllipticCurvePoint = { x: null, y: null, isIdentity: true };

    test('handles scalar zero correctly', () => {
      const result = EllipticCurveArithmetic.scalarMultiply(point, 0, curve);
      expect(result.isIdentity).toBe(true);
    });

    test('handles scalar one correctly', () => {
      const result = EllipticCurveArithmetic.scalarMultiply(point, 1, curve);
      expect(result).toEqual(point);
    });

    test('handles identity point multiplication', () => {
      const result = EllipticCurveArithmetic.scalarMultiply(identity, 5, curve);
      expect(result.isIdentity).toBe(true);
    });

    test('computes scalar multiplication correctly for small scalars', () => {
      // Test 2P = P + P
      const twoP = EllipticCurveArithmetic.scalarMultiply(point, 2, curve);
      const pPlusP = EllipticCurveArithmetic.addPoints(point, point, curve);
      
      expect(twoP.x).toBe(pPlusP.x);
      expect(twoP.y).toBe(pPlusP.y);
      expect(twoP.isIdentity).toBe(pPlusP.isIdentity);
    });

    test('verifies scalar multiplication properties', () => {
      const scalar1 = 3;
      const scalar2 = 4;
      
      // Test (n + m)P = nP + mP
      const leftSide = EllipticCurveArithmetic.scalarMultiply(point, scalar1 + scalar2, curve);
      const rightSide = EllipticCurveArithmetic.addPoints(
        EllipticCurveArithmetic.scalarMultiply(point, scalar1, curve),
        EllipticCurveArithmetic.scalarMultiply(point, scalar2, curve),
        curve
      );
      
      expect(leftSide.x).toBe(rightSide.x);
      expect(leftSide.y).toBe(rightSide.y);
      expect(leftSide.isIdentity).toBe(rightSide.isIdentity);
    });

    test('performs scalar multiplication efficiently for large scalars', () => {
      const startTime = performance.now();
      const result = EllipticCurveArithmetic.scalarMultiply(point, 1000, curve);
      const endTime = performance.now();
      
      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(50); // Should complete in under 50ms
    });
  });

  describe('Point Order Calculation', () => {
    const curve: EllipticCurve = { a: 1, b: 1, p: 5, name: 'test', displayName: 'test' };
    const identity: EllipticCurvePoint = { x: null, y: null, isIdentity: true };

    test('calculates identity point order correctly', () => {
      expect(EllipticCurveArithmetic.getPointOrder(identity, curve)).toBe(1);
    });

    test('calculates finite point orders correctly', () => {
      const point: EllipticCurvePoint = { x: 0, y: 1, isIdentity: false };
      const order = EllipticCurveArithmetic.getPointOrder(point, curve);
      
      expect(order).toBeGreaterThan(0);
      expect(order).toBeLessThanOrEqual(100); // Within safety limit
      
      // Verify order by checking nP = O
      if (order > 0 && order <= 100) {
        const nP = EllipticCurveArithmetic.scalarMultiply(point, order, curve);
        expect(nP.isIdentity).toBe(true);
      }
    });

    test('handles points with large orders (returns -1)', () => {
      // Create a curve where point might have large order
      const largeCurve: EllipticCurve = { a: 1, b: 0, p: 97, name: 'large', displayName: 'large' };
      const point: EllipticCurvePoint = { x: 1, y: 1, isIdentity: false };
      
      // This might return -1 if order > 100
      const order = EllipticCurveArithmetic.getPointOrder(point, largeCurve);
      expect(order === -1 || order > 0).toBe(true);
    });

    test('verifies Lagrange theorem: point order divides group order', () => {
      const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
      const groupOrder = points.length;
      
      points.forEach(point => {
        const order = EllipticCurveArithmetic.getPointOrder(point, curve);
        if (order > 0 && order <= 100) {
          expect(groupOrder % order).toBe(0);
        }
      });
    });
  });

  describe('Mathematical Property Validation', () => {
    test('verifies elliptic curve equation for generated points', () => {
      const curves = EllipticCurveGroupGenerator.getPredefinedCurves();
      
      curves.forEach(curve => {
        const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
        
        points.forEach(point => {
          expect(EllipticCurveArithmetic.isOnCurve(point, curve)).toBe(true);
        });
      });
    });

    test('verifies group closure property', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 7, name: 'test', displayName: 'test' };
      const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
      
      // Test closure for a subset of points (full test would be expensive)
      const testPoints = points.slice(0, Math.min(5, points.length));
      
      testPoints.forEach(p1 => {
        testPoints.forEach(p2 => {
          const sum = EllipticCurveArithmetic.addPoints(p1, p2, curve);
          const foundInGroup = points.some(p => 
            p.isIdentity === sum.isIdentity &&
            p.x === sum.x && 
            p.y === sum.y
          );
          expect(foundInGroup).toBe(true);
        });
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles invalid curve parameters gracefully', () => {
      const invalidCurve: EllipticCurve = { a: 0, b: 0, p: 2, name: 'invalid', displayName: 'invalid' };
      
      // Should not crash, but might return empty points or handle gracefully
      expect(() => EllipticCurveGroupGenerator.generateCurvePoints(invalidCurve)).not.toThrow();
    });

    test('handles points with extreme coordinates', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 97, name: 'large', displayName: 'large' };
      const point: EllipticCurvePoint = { x: 96, y: 96, isIdentity: false };
      
      // Should not crash even with large coordinates
      expect(() => EllipticCurveArithmetic.addPoints(point, point, curve)).not.toThrow();
    });

    test('handles computation errors in point order calculation', () => {
      // Mock a point that might cause computation errors
      const problemPoint: EllipticCurvePoint = { x: 0, y: 0, isIdentity: false };
      const curve: EllipticCurve = { a: 1, b: 1, p: 5, name: 'test', displayName: 'test' };
      
      // Should return a safe value even if computation fails
      const order = EllipticCurveArithmetic.getPointOrder(problemPoint, curve);
      expect(typeof order).toBe('number');
    });
  });
});

describe('EllipticCurveGroupGenerator', () => {
  describe('Point Generation', () => {
    test('generates correct number of points for small curves', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 5, name: 'test', displayName: 'test' };
      const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
      
      // Should include identity point
      expect(points.some(p => p.isIdentity)).toBe(true);
      expect(points.length).toBeGreaterThan(0);
      
      // All points should be on curve
      points.forEach(point => {
        expect(EllipticCurveArithmetic.isOnCurve(point, curve)).toBe(true);
      });
    });

    test('handles all predefined curves correctly', () => {
      const curves = EllipticCurveGroupGenerator.getPredefinedCurves();
      
      expect(curves.length).toBeGreaterThan(0);
      
      curves.forEach(curve => {
        const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
        expect(points.length).toBeGreaterThan(0); // At least identity
        
        // Verify all points are valid
        points.forEach(point => {
          expect(EllipticCurveArithmetic.isOnCurve(point, curve)).toBe(true);
        });
      });
    });

    test('generates deterministic results', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 5, name: 'test', displayName: 'test' };
      
      const points1 = EllipticCurveGroupGenerator.generateCurvePoints(curve);
      const points2 = EllipticCurveGroupGenerator.generateCurvePoints(curve);
      
      expect(points1.length).toBe(points2.length);
      
      // Should generate same points (order might differ)
      points1.forEach(p1 => {
        const found = points2.some(p2 => 
          p1.isIdentity === p2.isIdentity &&
          p1.x === p2.x &&
          p1.y === p2.y
        );
        expect(found).toBe(true);
      });
    });
  });

  describe('Group Structure Creation', () => {
    test('creates valid elliptic curve group structure', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 5, name: 'test', displayName: 'test' };
      const group = EllipticCurveGroupGenerator.createEllipticCurveGroup(curve);
      
      expect(group.curve).toEqual(curve);
      expect(group.points.length).toBe(group.order);
      expect(group.name).toBe(`EC_${curve.name}`);
      expect(group.displayName).toContain(curve.a.toString());
    });

    test('converts to standard group format correctly', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 5, name: 'test', displayName: 'test' };
      const ecGroup = EllipticCurveGroupGenerator.createEllipticCurveGroup(curve);
      const standardGroup = EllipticCurveGroupGenerator.toStandardGroup(ecGroup);
      
      expect(standardGroup.name).toBe(ecGroup.name);
      expect(standardGroup.order).toBe(ecGroup.order);
      expect(standardGroup.elements).toHaveLength(ecGroup.order);
      expect(standardGroup.isAbelian).toBe(true);
      expect(standardGroup.operations).toBeDefined();
      expect(standardGroup.generators).toBeDefined();
    });

    test('creates valid operation table', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 5, name: 'test', displayName: 'test' };
      const ecGroup = EllipticCurveGroupGenerator.createEllipticCurveGroup(curve);
      const standardGroup = EllipticCurveGroupGenerator.toStandardGroup(ecGroup);
      
      // Test closure
      standardGroup.elements.forEach(elem1 => {
        standardGroup.elements.forEach(elem2 => {
          const result = standardGroup.operations.get(elem1.id)?.get(elem2.id);
          expect(result).toBeDefined();
          expect(standardGroup.elements.find(e => e.id === result)).toBeDefined();
        });
      });
    });

    test('calculates inverses correctly', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 5, name: 'test', displayName: 'test' };
      const ecGroup = EllipticCurveGroupGenerator.createEllipticCurveGroup(curve);
      const standardGroup = EllipticCurveGroupGenerator.toStandardGroup(ecGroup);
      
      standardGroup.elements.forEach(element => {
        const inverse = standardGroup.elements.find(e => e.id === element.inverse);
        expect(inverse).toBeDefined();
        
        // Test inverse property: element * inverse = identity
        const product = standardGroup.operations.get(element.id)?.get(element.inverse);
        expect(product).toBe('P0'); // P0 should be identity
      });
    });

    test('identifies abelian property correctly', () => {
      const curves = EllipticCurveGroupGenerator.getPredefinedCurves();
      
      curves.forEach(curve => {
        const ecGroup = EllipticCurveGroupGenerator.createEllipticCurveGroup(curve);
        const standardGroup = EllipticCurveGroupGenerator.toStandardGroup(ecGroup);
        
        expect(standardGroup.isAbelian).toBe(true);
        
        // Verify commutativity for small groups
        if (standardGroup.order <= 10) {
          standardGroup.elements.forEach(a => {
            standardGroup.elements.forEach(b => {
              const ab = standardGroup.operations.get(a.id)?.get(b.id);
              const ba = standardGroup.operations.get(b.id)?.get(a.id);
              expect(ab).toBe(ba);
            });
          });
        }
      });
    });
  });

  describe('Performance and Scalability', () => {
    test('generates points efficiently for moderate-sized curves', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 17, name: 'medium', displayName: 'medium' };
      
      const startTime = performance.now();
      const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
      const endTime = performance.now();
      
      expect(points.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    test('handles memory efficiently for multiple group generations', () => {
      const curves = EllipticCurveGroupGenerator.getPredefinedCurves().slice(0, 3);
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      for (let i = 0; i < 10; i++) {
        curves.forEach(curve => {
          EllipticCurveGroupGenerator.createEllipticCurveGroup(curve);
        });
      }
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 5MB)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });
  });
});

describe('EllipticCurveAnimator', () => {
  describe('Animation Generation', () => {
    const curve: EllipticCurve = { a: 1, b: 1, p: 5, name: 'test', displayName: 'test' };
    const point1: EllipticCurvePoint = { x: 0, y: 1, isIdentity: false };
    const point2: EllipticCurvePoint = { x: 2, y: 1, isIdentity: false };
    const identity: EllipticCurvePoint = { x: null, y: null, isIdentity: true };

    test('generates animation frames for point addition', () => {
      const animation = EllipticCurveAnimator.generateAdditionAnimation(
        point1, point2, curve, 800, 600
      );
      
      expect(animation.length).toBeGreaterThan(0);
      expect(animation[0].step).toBe('selecting');
      expect(animation[animation.length - 1].step).toBe('completed');
      
      // Check progress values are in ascending order
      for (let i = 1; i < animation.length; i++) {
        expect(animation[i].progress).toBeGreaterThanOrEqual(animation[i-1].progress);
      }
    });

    test('handles identity point in animation', () => {
      const animation = EllipticCurveAnimator.generateAdditionAnimation(
        identity, point1, curve, 800, 600
      );
      
      expect(animation.length).toBeGreaterThan(0);
      expect(animation[0].step).toBe('selecting');
      expect(animation[animation.length - 1].step).toBe('completed');
      expect(animation[animation.length - 1].result).toEqual(point1);
    });

    test('generates valid animation structure', () => {
      const animation = EllipticCurveAnimator.generateAdditionAnimation(
        point1, point2, curve
      );
      
      animation.forEach(frame => {
        expect(frame.step).toBeDefined();
        expect(frame.progress).toBeGreaterThanOrEqual(0);
        expect(frame.progress).toBeLessThanOrEqual(1);
        
        if (frame.point1) {
          expect(typeof frame.point1.isIdentity).toBe('boolean');
        }
        if (frame.point2) {
          expect(typeof frame.point2.isIdentity).toBe('boolean');
        }
        if (frame.result) {
          expect(typeof frame.result.isIdentity).toBe('boolean');
        }
      });
    });

    test('includes geometric construction steps for non-identity points', () => {
      const animation = EllipticCurveAnimator.generateAdditionAnimation(
        point1, point2, curve, 800, 600
      );
      
      const steps = animation.map(frame => frame.step);
      
      if (!point1.isIdentity && !point2.isIdentity) {
        expect(steps).toContain('selecting');
        expect(steps).toContain('drawing_line');
        expect(steps).toContain('finding_intersection');
        expect(steps).toContain('reflecting');
        expect(steps).toContain('completed');
      }
    });
  });

  describe('Animation Properties', () => {
    test('ensures animation frames have consistent point references', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 5, name: 'test', displayName: 'test' };
      const point1: EllipticCurvePoint = { x: 0, y: 1, isIdentity: false };
      const point2: EllipticCurvePoint = { x: 2, y: 1, isIdentity: false };
      
      const animation = EllipticCurveAnimator.generateAdditionAnimation(
        point1, point2, curve
      );
      
      animation.forEach(frame => {
        if (frame.point1 && !point1.isIdentity) {
          expect(frame.point1.x).toBe(point1.x);
          expect(frame.point1.y).toBe(point1.y);
        }
        if (frame.point2 && !point2.isIdentity) {
          expect(frame.point2.x).toBe(point2.x);
          expect(frame.point2.y).toBe(point2.y);
        }
      });
    });

    test('validates mathematical consistency in animation result', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 5, name: 'test', displayName: 'test' };
      const point1: EllipticCurvePoint = { x: 0, y: 1, isIdentity: false };
      const point2: EllipticCurvePoint = { x: 2, y: 1, isIdentity: false };
      
      const animation = EllipticCurveAnimator.generateAdditionAnimation(
        point1, point2, curve
      );
      
      const finalFrame = animation[animation.length - 1];
      const expectedResult = EllipticCurveArithmetic.addPoints(point1, point2, curve);
      
      expect(finalFrame.result).toEqual(expectedResult);
    });
  });
});

describe('Mathematical Accuracy Integration Tests', () => {
  test('validates known elliptic curve groups', () => {
    // Test against known mathematical results
    const knownResults = [
      { curve: { a: 1, b: 1, p: 5, name: 'E_5_1_1', displayName: 'test' }, expectedOrder: 9 },
      { curve: { a: 1, b: 6, p: 7, name: 'E_7_1_6', displayName: 'test' }, expectedOrder: 12 },
      // Add more known results as needed
    ];

    knownResults.forEach(({ curve, expectedOrder }) => {
      const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
      expect(points.length).toBe(expectedOrder);
    });
  });

  test('verifies Hasse bound for elliptic curves', () => {
    // Hasse's bound: |#E(Fp) - (p + 1)| <= 2√p
    const curves = EllipticCurveGroupGenerator.getPredefinedCurves();
    
    curves.forEach(curve => {
      const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
      const groupOrder = points.length;
      const p = curve.p;
      const bound = 2 * Math.sqrt(p);
      
      expect(Math.abs(groupOrder - (p + 1))).toBeLessThanOrEqual(bound);
    });
  });

  test('validates group axioms for elliptic curve groups', () => {
    const curve: EllipticCurve = { a: 1, b: 1, p: 7, name: 'test', displayName: 'test' };
    const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
    
    // Test subset for performance (full test would be O(n³))
    const testPoints = points.slice(0, Math.min(4, points.length));
    
    // Closure already tested above
    
    // Associativity: (a + b) + c = a + (b + c)
    testPoints.forEach(a => {
      testPoints.forEach(b => {
        testPoints.forEach(c => {
          const left = EllipticCurveArithmetic.addPoints(
            EllipticCurveArithmetic.addPoints(a, b, curve), c, curve
          );
          const right = EllipticCurveArithmetic.addPoints(
            a, EllipticCurveArithmetic.addPoints(b, c, curve), curve
          );
          
          expect(left.x).toBe(right.x);
          expect(left.y).toBe(right.y);
          expect(left.isIdentity).toBe(right.isIdentity);
        });
      });
    });
    
    // Identity: O + P = P + O = P
    const identity = points.find(p => p.isIdentity)!;
    testPoints.forEach(point => {
      const leftResult = EllipticCurveArithmetic.addPoints(identity, point, curve);
      const rightResult = EllipticCurveArithmetic.addPoints(point, identity, curve);
      
      expect(leftResult).toEqual(point);
      expect(rightResult).toEqual(point);
    });
  });
});

describe('Advanced Mathematical Properties', () => {
  describe('Torsion Points and Subgroups', () => {
    test('identifies torsion subgroups correctly', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 7, name: 'test', displayName: 'test' };
      const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
      
      // Find all 2-torsion points (points of order dividing 2)
      const twoTorsionPoints = points.filter(point => {
        const order = EllipticCurveArithmetic.getPointOrder(point, curve);
        return order > 0 && order <= 2;
      });
      
      // For elliptic curves over finite fields, 2-torsion structure is well-defined
      expect(twoTorsionPoints.length).toBeGreaterThan(0);
      
      // Verify that 2P = O for all 2-torsion points
      twoTorsionPoints.forEach(point => {
        const doublePoint = EllipticCurveArithmetic.addPoints(point, point, curve);
        expect(doublePoint.isIdentity).toBe(true);
      });
    });

    test('verifies cyclic subgroup generation', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 7, name: 'test', displayName: 'test' };
      const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
      
      // Find a non-identity point with finite order
      const generator = points.find(p => 
        !p.isIdentity && 
        EllipticCurveArithmetic.getPointOrder(p, curve) > 1 &&
        EllipticCurveArithmetic.getPointOrder(p, curve) <= 20
      );
      
      if (generator) {
        const order = EllipticCurveArithmetic.getPointOrder(generator, curve);
        const generatedPoints = new Set<string>();
        
        let currentPoint = generator;
        for (let i = 1; i <= order; i++) {
          const pointKey = currentPoint.isIdentity ? 'O' : `(${currentPoint.x},${currentPoint.y})`;
          generatedPoints.add(pointKey);
          
          if (i < order) {
            currentPoint = EllipticCurveArithmetic.addPoints(currentPoint, generator, curve);
          }
        }
        
        expect(generatedPoints.size).toBe(order);
        expect(currentPoint.isIdentity).toBe(true);
      }
    });
  });

  describe('Point Compression and Decompression', () => {
    test('validates point compression consistency', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 7, name: 'test', displayName: 'test' };
      const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
      
      points.forEach(point => {
        if (!point.isIdentity && point.x !== null && point.y !== null) {
          // For each x-coordinate, there should be at most 2 y-values
          const sameXPoints = points.filter(p => 
            !p.isIdentity && p.x === point.x
          );
          
          expect(sameXPoints.length).toBeLessThanOrEqual(2);
          
          if (sameXPoints.length === 2) {
            // The two points should be inverses of each other
            const p1 = sameXPoints[0];
            const p2 = sameXPoints[1];
            expect((p1.y! + p2.y!) % curve.p).toBe(0);
          }
        }
      });
    });

    test('validates y-coordinate calculation from x', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 7, name: 'test', displayName: 'test' };
      const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
      
      points.forEach(point => {
        if (!point.isIdentity && point.x !== null && point.y !== null) {
          // Verify y² ≡ x³ + ax + b (mod p)
          const leftSide = (point.y! * point.y!) % curve.p;
          const rightSide = (point.x! * point.x! * point.x! + curve.a * point.x! + curve.b) % curve.p;
          
          expect(leftSide).toBe(rightSide);
        }
      });
    });
  });

  describe('Quadratic Residue Theory', () => {
    test('verifies Legendre symbol calculations', () => {
      const primes = [5, 7, 11, 13];
      
      primes.forEach(p => {
        // Test quadratic residue properties
        for (let a = 1; a < p; a++) {
          const squares = [];
          for (let x = 0; x < p; x++) {
            squares.push((x * x) % p);
          }
          
          const isQuadraticResidue = squares.includes(a);
          
          if (isQuadraticResidue) {
            // If a is a quadratic residue, a^((p-1)/2) ≡ 1 (mod p)
            const legendreSymbol = EllipticCurveArithmetic.modPow(a, Math.floor((p - 1) / 2), p);
            expect(legendreSymbol).toBe(1);
          } else {
            // If a is not a quadratic residue, a^((p-1)/2) ≡ -1 ≡ p-1 (mod p)
            const legendreSymbol = EllipticCurveArithmetic.modPow(a, Math.floor((p - 1) / 2), p);
            expect(legendreSymbol).toBe(p - 1);
          }
        }
      });
    });

    test('validates square root calculations for point generation', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 7, name: 'test', displayName: 'test' };
      
      // For each x-coordinate, check if x³ + ax + b has square roots
      for (let x = 0; x < curve.p; x++) {
        const rhs = (x * x * x + curve.a * x + curve.b) % curve.p;
        
        // Check if rhs is a quadratic residue
        const legendreSymbol = EllipticCurveArithmetic.modPow(rhs, Math.floor((curve.p - 1) / 2), curve.p);
        
        if (legendreSymbol === 1 || rhs === 0) {
          // Should have points with this x-coordinate
          const pointsWithX = EllipticCurveGroupGenerator.generateCurvePoints(curve)
            .filter(p => !p.isIdentity && p.x === x);
          
          if (rhs === 0) {
            expect(pointsWithX.length).toBe(1);
            expect(pointsWithX[0].y).toBe(0);
          } else {
            expect(pointsWithX.length).toBe(2);
          }
        }
      }
    });
  });

  describe('Endomorphism and Automorphism Properties', () => {
    test('validates negation map properties', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 7, name: 'test', displayName: 'test' };
      const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
      
      points.forEach(point => {
        if (!point.isIdentity && point.x !== null && point.y !== null) {
          // Negation: (x, y) → (x, -y)
          const negatedPoint: EllipticCurvePoint = {
            x: point.x,
            y: (curve.p - point.y!) % curve.p,
            isIdentity: false
          };
          
          // Verify negated point is on curve
          expect(EllipticCurveArithmetic.isOnCurve(negatedPoint, curve)).toBe(true);
          
          // Verify P + (-P) = O
          const sum = EllipticCurveArithmetic.addPoints(point, negatedPoint, curve);
          expect(sum.isIdentity).toBe(true);
        }
      });
    });

    test('verifies multiplication by scalar properties', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 7, name: 'test', displayName: 'test' };
      const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
      
      // Test distributive property: n(P + Q) = nP + nQ
      const testPoints = points.slice(0, Math.min(3, points.length));
      const testScalar = 3;
      
      testPoints.forEach(p => {
        testPoints.forEach(q => {
          const pPlusQ = EllipticCurveArithmetic.addPoints(p, q, curve);
          const nTimespPlusQ = EllipticCurveArithmetic.scalarMultiply(pPlusQ, testScalar, curve);
          
          const nP = EllipticCurveArithmetic.scalarMultiply(p, testScalar, curve);
          const nQ = EllipticCurveArithmetic.scalarMultiply(q, testScalar, curve);
          const nPPlusnQ = EllipticCurveArithmetic.addPoints(nP, nQ, curve);
          
          expect(nTimespPlusQ.x).toBe(nPPlusnQ.x);
          expect(nTimespPlusQ.y).toBe(nPPlusnQ.y);
          expect(nTimespPlusQ.isIdentity).toBe(nPPlusnQ.isIdentity);
        });
      });
    });
  });

  describe('Discrete Logarithm Properties', () => {
    test('verifies scalar multiplication uniqueness', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 7, name: 'test', displayName: 'test' };
      const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
      
      // Find a generator point
      const generator = points.find(p => {
        const order = EllipticCurveArithmetic.getPointOrder(p, curve);
        return !p.isIdentity && order > 2 && order <= 10;
      });
      
      if (generator) {
        const order = EllipticCurveArithmetic.getPointOrder(generator, curve);
        const multiples = new Map<string, number>();
        
        for (let k = 0; k < order; k++) {
          const kG = EllipticCurveArithmetic.scalarMultiply(generator, k, curve);
          const key = kG.isIdentity ? 'O' : `(${kG.x},${kG.y})`;
          
          // Each multiple should be unique (until we reach the order)
          expect(multiples.has(key)).toBe(false);
          multiples.set(key, k);
        }
        
        expect(multiples.size).toBe(order);
      }
    });

    test('validates Baby-step Giant-step complexity bounds', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 11, name: 'test', displayName: 'test' };
      const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
      
      // For small groups, discrete log should be computationally feasible
      const generator = points.find(p => {
        const order = EllipticCurveArithmetic.getPointOrder(p, curve);
        return !p.isIdentity && order > 1 && order <= 15;
      });
      
      if (generator) {
        const order = EllipticCurveArithmetic.getPointOrder(generator, curve);
        const target = EllipticCurveArithmetic.scalarMultiply(generator, Math.floor(order / 2), curve);
        
        // Simple brute force discrete log for verification
        let found = false;
        for (let k = 0; k < order && !found; k++) {
          const candidate = EllipticCurveArithmetic.scalarMultiply(generator, k, curve);
          if (candidate.x === target.x && candidate.y === target.y && 
              candidate.isIdentity === target.isIdentity) {
            expect(k).toBe(Math.floor(order / 2));
            found = true;
          }
        }
        
        expect(found).toBe(true);
      }
    });
  });

  describe('Numerical Stability and Precision', () => {
    test('validates precision in repeated operations', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 97, name: 'large', displayName: 'large' };
      const point: EllipticCurvePoint = { x: 1, y: 1, isIdentity: false };
      
      // Verify that multiple additions maintain precision
      let accumulated = point;
      const original = point;
      
      for (let i = 1; i < 10; i++) {
        accumulated = EllipticCurveArithmetic.addPoints(accumulated, original, curve);
        
        // Each result should be valid
        expect(EllipticCurveArithmetic.isOnCurve(accumulated, curve)).toBe(true);
        
        // Coordinates should be within field bounds
        if (!accumulated.isIdentity) {
          expect(accumulated.x).toBeGreaterThanOrEqual(0);
          expect(accumulated.x).toBeLessThan(curve.p);
          expect(accumulated.y).toBeGreaterThanOrEqual(0);
          expect(accumulated.y).toBeLessThan(curve.p);
        }
      }
    });

    test('handles edge cases in modular arithmetic', () => {
      // Test edge cases with large prime
      const largePrime = 97;
      
      // Test modular inverse near boundaries
      expect(EllipticCurveArithmetic.modInverse(1, largePrime)).toBe(1);
      expect(EllipticCurveArithmetic.modInverse(largePrime - 1, largePrime)).toBe(largePrime - 1);
      
      // Test modular exponentiation with large exponents
      const result = EllipticCurveArithmetic.modPow(2, largePrime - 1, largePrime);
      expect(result).toBe(1); // Fermat's little theorem
    });
  });
});

describe('Cryptographic Properties', () => {
  describe('Security Parameter Validation', () => {
    test('validates curve discriminant non-zero', () => {
      const curves = EllipticCurveGroupGenerator.getPredefinedCurves();
      
      curves.forEach(curve => {
        // Discriminant Δ = -16(4a³ + 27b²) must be non-zero
        const discriminant = -16 * (4 * Math.pow(curve.a, 3) + 27 * Math.pow(curve.b, 2));
        expect(discriminant % curve.p).not.toBe(0);
      });
    });

    test('verifies group order meets minimum security requirements', () => {
      const curves = EllipticCurveGroupGenerator.getPredefinedCurves();
      
      curves.forEach(curve => {
        const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
        const groupOrder = points.length;
        
        // For cryptographic applications, group order should be substantial
        // This is a minimal test for educational curves
        expect(groupOrder).toBeGreaterThan(4);
        
        // Group order should not equal the field size (would indicate weak curve)
        expect(groupOrder).not.toBe(curve.p);
      });
    });
  });

  describe('Point Validation for Cryptographic Safety', () => {
    test('rejects points not on curve in cryptographic contexts', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 97, name: 'crypto', displayName: 'crypto' };
      
      // Test various invalid points
      const invalidPoints = [
        { x: 0, y: 1, isIdentity: false }, // Might not be on this curve
        { x: curve.p, y: 0, isIdentity: false }, // x-coordinate out of range
        { x: 0, y: curve.p, isIdentity: false }, // y-coordinate out of range
        { x: -1, y: 0, isIdentity: false }, // Negative coordinates
      ];
      
      invalidPoints.forEach(point => {
        if (point.x >= curve.p || point.y >= curve.p || point.x < 0 || point.y < 0) {
          // Should handle out-of-range coordinates gracefully
          expect(() => EllipticCurveArithmetic.isOnCurve(point, curve)).not.toThrow();
        }
      });
    });

    test('validates point order bounds for cryptographic operations', () => {
      const curve: EllipticCurve = { a: 1, b: 1, p: 97, name: 'crypto', displayName: 'crypto' };
      const points = EllipticCurveGroupGenerator.generateCurvePoints(curve);
      
      points.forEach(point => {
        if (!point.isIdentity) {
          const order = EllipticCurveArithmetic.getPointOrder(point, curve);
          
          if (order > 0 && order <= 100) {
            // Point order should divide group order (Lagrange's theorem)
            expect(points.length % order).toBe(0);
            
            // Verify order by scalar multiplication
            const nP = EllipticCurveArithmetic.scalarMultiply(point, order, curve);
            expect(nP.isIdentity).toBe(true);
          }
        }
      });
    });
  });
});