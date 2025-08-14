/**
 * Enhanced Mathematical Validation Framework
 * Provides comprehensive validation utilities for mathematical computations
 * Used across all mathematical algorithm tests for consistency and accuracy
 */

import type { Group, GroupElement } from '@/lib/GroupTheory';
import type { EllipticCurve, EllipticCurvePoint } from '@/lib/EllipticCurveGroups';

// Interfaces for mathematical objects validation
export interface PersistenceInterval {
  birth: number;
  death: number;
  dimension: number;
}

export interface MathematicalPrecision {
  DEFAULT_TOLERANCE: number;
  FLOAT_TOLERANCE: number;
  STATISTICAL_TOLERANCE: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Mathematical Constants and Precision Settings
 */
export const MATHEMATICAL_PRECISION: MathematicalPrecision = {
  DEFAULT_TOLERANCE: 1e-10,
  FLOAT_TOLERANCE: 1e-6,
  STATISTICAL_TOLERANCE: 1e-3,
};

/**
 * Group Theory Validation Utilities
 */
export class GroupTheoryValidator {
  /**
   * Validates that an object is a valid group element
   */
  static validateGroupElement(element: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!element) {
      errors.push('Element is null or undefined');
    } else {
      if (typeof element.id !== 'string') {
        errors.push('Element must have a string id');
      }
      if (typeof element.label !== 'string') {
        warnings.push('Element should have a string label');
      }
      if (typeof element.order !== 'number' || element.order <= 0) {
        errors.push('Element must have a positive numeric order');
      }
      if (typeof element.inverse !== 'string') {
        errors.push('Element must have a string inverse reference');
      }
      if (typeof element.conjugacyClass !== 'number' || element.conjugacyClass < 0) {
        errors.push('Element must have a non-negative conjugacy class index');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates group axioms for a given group
   */
  static validateGroupAxioms(group: Group): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!group) {
      errors.push('Group is null or undefined');
      return { isValid: false, errors, warnings };
    }

    // 1. Closure: For all a,b in G, a*b is in G
    group.elements.forEach(a => {
      group.elements.forEach(b => {
        const product = group.operations.get(a.id)?.get(b.id);
        if (!product) {
          errors.push(`Missing operation result for ${a.id} * ${b.id}`);
        } else if (!group.elements.find(e => e.id === product)) {
          errors.push(`Operation ${a.id} * ${b.id} = ${product} not in group`);
        }
      });
    });

    // 2. Identity: Exists e such that e*a = a*e = a for all a
    const identity = group.elements.find(e => e.id === 'e');
    if (!identity) {
      errors.push('No identity element found (id should be "e")');
    } else {
      group.elements.forEach(element => {
        const leftProduct = group.operations.get(identity.id)?.get(element.id);
        const rightProduct = group.operations.get(element.id)?.get(identity.id);
        
        if (leftProduct !== element.id) {
          errors.push(`Identity law violation: e * ${element.id} ≠ ${element.id}`);
        }
        if (rightProduct !== element.id) {
          errors.push(`Identity law violation: ${element.id} * e ≠ ${element.id}`);
        }
      });
    }

    // 3. Inverse: For all a, exists a^(-1) such that a*a^(-1) = e
    group.elements.forEach(element => {
      const inverseId = element.inverse;
      const inverse = group.elements.find(e => e.id === inverseId);
      
      if (!inverse) {
        errors.push(`Inverse element ${inverseId} for ${element.id} not found in group`);
      } else {
        const product = group.operations.get(element.id)?.get(inverseId);
        if (product !== 'e') {
          errors.push(`Inverse law violation: ${element.id} * ${inverseId} ≠ e`);
        }
      }
    });

    // 4. Associativity: (a*b)*c = a*(b*c) for all a,b,c (test subset for performance)
    const testElements = group.elements.slice(0, Math.min(4, group.elements.length));
    testElements.forEach(a => {
      testElements.forEach(b => {
        testElements.forEach(c => {
          const ab = group.operations.get(a.id)?.get(b.id);
          const bc = group.operations.get(b.id)?.get(c.id);
          
          if (ab && bc) {
            const ab_c = group.operations.get(ab)?.get(c.id);
            const a_bc = group.operations.get(a.id)?.get(bc);
            
            if (ab_c !== a_bc) {
              errors.push(`Associativity violation: (${a.id}*${b.id})*${c.id} ≠ ${a.id}*(${b.id}*${c.id})`);
            }
          }
        });
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates Lagrange's theorem: element order divides group order
   */
  static validateLagrangeTheorem(group: Group): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    group.elements.forEach(element => {
      if (group.order % element.order !== 0) {
        errors.push(`Lagrange theorem violation: element ${element.id} has order ${element.order} which does not divide group order ${group.order}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates that generators actually generate the group
   */
  static validateGenerators(group: Group): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (group.generators.length === 0) {
      warnings.push('Group has no generators specified');
      return { isValid: true, errors, warnings };
    }

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

    if (generated.size !== group.order) {
      errors.push(`Generators do not generate full group: generated ${generated.size} elements, expected ${group.order}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Elliptic Curve Validation Utilities
 */
export class EllipticCurveValidator {
  /**
   * Validates elliptic curve parameters
   */
  static validateCurve(curve: EllipticCurve): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!curve) {
      errors.push('Curve is null or undefined');
      return { isValid: false, errors, warnings };
    }

    // Check discriminant: Δ = -16(4a³ + 27b²) ≠ 0 (mod p)
    const discriminant = -16 * (4 * Math.pow(curve.a, 3) + 27 * Math.pow(curve.b, 2));
    if (discriminant % curve.p === 0) {
      errors.push(`Curve is singular: discriminant ≡ 0 (mod ${curve.p})`);
    }

    // Check that p is a positive integer
    if (typeof curve.p !== 'number' || curve.p <= 0 || !Number.isInteger(curve.p)) {
      errors.push('Curve field characteristic p must be a positive integer');
    }

    // Check parameters are finite
    if (!Number.isFinite(curve.a) || !Number.isFinite(curve.b)) {
      errors.push('Curve parameters a and b must be finite numbers');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates that a point is on the curve
   */
  static validatePointOnCurve(point: EllipticCurvePoint, curve: EllipticCurve): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (point.isIdentity) {
      // Identity point is always valid
      if (point.x !== null || point.y !== null) {
        warnings.push('Identity point should have null coordinates');
      }
      return { isValid: true, errors, warnings };
    }

    if (point.x === null || point.y === null) {
      errors.push('Non-identity point cannot have null coordinates');
      return { isValid: false, errors, warnings };
    }

    // Check curve equation: y² ≡ x³ + ax + b (mod p)
    const leftSide = (point.y * point.y) % curve.p;
    const rightSide = (point.x * point.x * point.x + curve.a * point.x + curve.b) % curve.p;

    if (leftSide !== rightSide) {
      errors.push(`Point (${point.x}, ${point.y}) is not on curve y² ≡ x³ + ${curve.a}x + ${curve.b} (mod ${curve.p})`);
    }

    // Check coordinates are in field
    if (point.x < 0 || point.x >= curve.p || point.y < 0 || point.y >= curve.p) {
      errors.push(`Point coordinates must be in range [0, ${curve.p - 1}]`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates Hasse's bound for elliptic curves over finite fields
   */
  static validateHasseBound(groupOrder: number, fieldSize: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Hasse's bound: |#E(Fp) - (p + 1)| ≤ 2√p
    const bound = 2 * Math.sqrt(fieldSize);
    const difference = Math.abs(groupOrder - (fieldSize + 1));

    if (difference > bound) {
      errors.push(`Hasse bound violation: |${groupOrder} - ${fieldSize + 1}| = ${difference} > ${bound}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Topological Data Analysis Validation Utilities
 */
export class TDAValidator {
  /**
   * Validates persistence interval
   */
  static validatePersistenceInterval(interval: PersistenceInterval): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!interval) {
      errors.push('Interval is null or undefined');
      return { isValid: false, errors, warnings };
    }

    if (typeof interval.birth !== 'number') {
      errors.push('Birth time must be a number');
    }
    if (typeof interval.death !== 'number') {
      errors.push('Death time must be a number');
    }
    if (typeof interval.dimension !== 'number') {
      errors.push('Dimension must be a number');
    }

    if (!Number.isInteger(interval.dimension)) {
      errors.push('Dimension must be an integer');
    }
    if (interval.dimension < 0) {
      errors.push('Dimension must be non-negative');
    }

    if (interval.death < interval.birth) {
      errors.push(`Death time ${interval.death} must be ≥ birth time ${interval.birth}`);
    }

    if (!Number.isFinite(interval.birth) || !Number.isFinite(interval.death)) {
      errors.push('Birth and death times must be finite');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates that a set of intervals forms a valid persistence diagram
   */
  static validatePersistenceDiagram(intervals: PersistenceInterval[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(intervals)) {
      errors.push('Intervals must be an array');
      return { isValid: false, errors, warnings };
    }

    // Validate each interval
    intervals.forEach((interval, index) => {
      const result = this.validatePersistenceInterval(interval);
      if (!result.isValid) {
        errors.push(`Interval ${index}: ${result.errors.join(', ')}`);
      }
    });

    // Check for H0 intervals (dimension 0)
    const h0Intervals = intervals.filter(i => i.dimension === 0);
    if (h0Intervals.length === 0 && intervals.length > 0) {
      warnings.push('No H0 (connected component) intervals found - this may indicate issues with the computation');
    }

    // Check dimension constraints for Euclidean data
    const maxDimension = Math.max(...intervals.map(i => i.dimension));
    if (maxDimension > 2) {
      warnings.push(`High dimensional features (dim > 2) found - verify this is expected for your data`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates topological properties based on point cloud geometry
   */
  static validateTopologicalConsistency(
    intervals: PersistenceInterval[], 
    pointCloud: number[][], 
    filtrationRadius: number
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic consistency checks
    if (pointCloud.length === 0 && intervals.length > 0) {
      errors.push('Empty point cloud should not generate persistence intervals');
    }

    if (pointCloud.length === 1) {
      const h0Intervals = intervals.filter(i => i.dimension === 0);
      if (h0Intervals.length !== 1) {
        warnings.push('Single point should generate exactly one H0 interval');
      }
    }

    // Check that death times respect filtration radius
    intervals.forEach((interval, index) => {
      if (interval.death > filtrationRadius * 1.1) { // Small tolerance
        warnings.push(`Interval ${index} has death time ${interval.death} > filtration radius ${filtrationRadius}`);
      }
    });

    // Dimension constraints based on point cloud dimension
    if (pointCloud.length > 0) {
      const pointDimension = pointCloud[0].length;
      const maxHomologyDim = Math.max(...intervals.map(i => i.dimension));
      
      if (maxHomologyDim >= pointDimension) {
        warnings.push(`Homology dimension ${maxHomologyDim} ≥ point cloud dimension ${pointDimension} - may indicate computational issues`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Numerical Precision Validation Utilities
 */
export class PrecisionValidator {
  /**
   * Validates that a value is within expected numerical precision
   */
  static validateNumericalPrecision(
    actual: number, 
    expected: number, 
    tolerance: number = MATHEMATICAL_PRECISION.DEFAULT_TOLERANCE
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const difference = Math.abs(actual - expected);
    
    if (difference > tolerance) {
      errors.push(`Precision error: |${actual} - ${expected}| = ${difference} > tolerance ${tolerance}`);
    } else if (difference > tolerance * 0.1) {
      warnings.push(`Near precision limit: difference ${difference} approaching tolerance ${tolerance}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates floating point operations for stability
   */
  static validateFloatingPointStability(values: number[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    values.forEach((value, index) => {
      if (!Number.isFinite(value)) {
        errors.push(`Value at index ${index} is not finite: ${value}`);
      }
      if (Number.isNaN(value)) {
        errors.push(`Value at index ${index} is NaN`);
      }
      if (Math.abs(value) > 1e15) {
        warnings.push(`Very large value at index ${index}: ${value} may indicate numerical instability`);
      }
      if (Math.abs(value) < 1e-15 && value !== 0) {
        warnings.push(`Very small value at index ${index}: ${value} may indicate underflow`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Performance Validation Utilities
 */
export class PerformanceValidator {
  /**
   * Validates computational performance against expected bounds
   */
  static validatePerformanceBounds(
    actualTime: number,
    expectedBound: number,
    operation: string
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (actualTime > expectedBound) {
      errors.push(`Performance bound exceeded for ${operation}: ${actualTime}ms > ${expectedBound}ms`);
    } else if (actualTime > expectedBound * 0.8) {
      warnings.push(`Performance approaching bound for ${operation}: ${actualTime}ms near limit ${expectedBound}ms`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates memory usage patterns
   */
  static validateMemoryUsage(
    initialMemory: number,
    finalMemory: number,
    maxAllowedIncrease: number,
    operation: string
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const memoryIncrease = finalMemory - initialMemory;

    if (memoryIncrease > maxAllowedIncrease) {
      errors.push(`Memory usage exceeded for ${operation}: ${memoryIncrease} bytes > ${maxAllowedIncrease} bytes`);
    } else if (memoryIncrease > maxAllowedIncrease * 0.8) {
      warnings.push(`Memory usage approaching limit for ${operation}: ${memoryIncrease} bytes near ${maxAllowedIncrease} bytes`);
    }

    if (memoryIncrease < 0) {
      warnings.push(`Negative memory change detected for ${operation}: ${memoryIncrease} bytes - this may indicate measurement issues`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Utility function to aggregate multiple validation results
 */
export function aggregateValidationResults(results: ValidationResult[]): ValidationResult {
  const allErrors = results.flatMap(r => r.errors);
  const allWarnings = results.flatMap(r => r.warnings);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Utility function to log validation results with proper formatting
 */
export function logValidationResult(result: ValidationResult, context: string): void {
  if (!result.isValid) {
    console.error(`❌ Validation failed for ${context}:`);
    result.errors.forEach(error => console.error(`   Error: ${error}`));
  } else {
    console.log(`✅ Validation passed for ${context}`);
  }
  
  if (result.warnings.length > 0) {
    console.warn(`⚠️  Warnings for ${context}:`);
    result.warnings.forEach(warning => console.warn(`   Warning: ${warning}`));
  }
}

/**
 * Jest matcher extensions for mathematical validation
 */
export const mathematicalMatchers = {
  toBeValidGroup(received: Group) {
    const result = GroupTheoryValidator.validateGroupAxioms(received);
    
    return {
      message: () => result.isValid 
        ? `Expected group to be invalid, but it passed validation`
        : `Expected group to be valid: ${result.errors.join(', ')}`,
      pass: result.isValid
    };
  },

  toBeValidEllipticCurvePoint(received: EllipticCurvePoint, curve: EllipticCurve) {
    const result = EllipticCurveValidator.validatePointOnCurve(received, curve);
    
    return {
      message: () => result.isValid
        ? `Expected point to be invalid, but it passed validation`
        : `Expected point to be valid: ${result.errors.join(', ')}`,
      pass: result.isValid
    };
  },

  toBeValidPersistenceInterval(received: PersistenceInterval) {
    const result = TDAValidator.validatePersistenceInterval(received);
    
    return {
      message: () => result.isValid
        ? `Expected interval to be invalid, but it passed validation`
        : `Expected interval to be valid: ${result.errors.join(', ')}`,
      pass: result.isValid
    };
  },

  toBeWithinTolerance(received: number, expected: number, tolerance?: number) {
    const result = PrecisionValidator.validateNumericalPrecision(
      received, 
      expected, 
      tolerance || MATHEMATICAL_PRECISION.DEFAULT_TOLERANCE
    );
    
    return {
      message: () => result.isValid
        ? `Expected ${received} not to be within tolerance of ${expected}`
        : `Expected ${received} to be within tolerance of ${expected}: ${result.errors.join(', ')}`,
      pass: result.isValid
    };
  }
};

// Type augmentation for Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidGroup(): R;
      toBeValidEllipticCurvePoint(curve: EllipticCurve): R;
      toBeValidPersistenceInterval(): R;
      toBeWithinTolerance(expected: number, tolerance?: number): R;
    }
  }
}