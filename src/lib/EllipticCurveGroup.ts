/**
 * Elliptic Curve Group Theory Implementation
 * Supports elliptic curves of the form y² = x³ + ax + b over finite fields Fp
 */

import { Group, GroupElement } from './GroupTheory';

export interface EllipticCurvePoint {
  x: number;
  y: number;
  isInfinity: boolean;
}

export interface EllipticCurveParameters {
  a: number;  // Coefficient for x term
  b: number;  // Constant term  
  p: number;  // Prime modulus for finite field Fp
}

/**
 * Finite Field arithmetic operations for Fp
 */
export class FiniteField {
  constructor(public readonly p: number) {
    if (!this.isPrime(p)) {
      throw new Error(`${p} is not a prime number`);
    }
  }

  private isPrime(n: number): boolean {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }

  /**
   * Modular addition: (a + b) mod p
   */
  add(a: number, b: number): number {
    return ((a + b) % this.p + this.p) % this.p;
  }

  /**
   * Modular subtraction: (a - b) mod p
   */
  subtract(a: number, b: number): number {
    return ((a - b) % this.p + this.p) % this.p;
  }

  /**
   * Modular multiplication: (a * b) mod p
   */
  multiply(a: number, b: number): number {
    return ((a * b) % this.p + this.p) % this.p;
  }

  /**
   * Modular exponentiation: a^b mod p using fast exponentiation
   */
  power(a: number, b: number): number {
    if (b === 0) return 1;
    
    let result = 1;
    a = ((a % this.p) + this.p) % this.p;
    
    while (b > 0) {
      if (b % 2 === 1) {
        result = this.multiply(result, a);
      }
      b = Math.floor(b / 2);
      a = this.multiply(a, a);
    }
    
    return result;
  }

  /**
   * Modular multiplicative inverse using Extended Euclidean Algorithm
   */
  inverse(a: number): number {
    if (a === 0) {
      throw new Error('Cannot find inverse of 0');
    }

    let [oldR, r] = [a, this.p];
    let [oldS, s] = [1, 0];

    while (r !== 0) {
      const quotient = Math.floor(oldR / r);
      [oldR, r] = [r, oldR - quotient * r];
      [oldS, s] = [s, oldS - quotient * s];
    }

    if (oldR > 1) {
      throw new Error(`${a} is not invertible modulo ${this.p}`);
    }

    return ((oldS % this.p) + this.p) % this.p;
  }

  /**
   * Check if a number is a quadratic residue (has square root) mod p
   */
  isQuadraticResidue(a: number): boolean {
    if (a === 0) return true;
    return this.power(a, (this.p - 1) / 2) === 1;
  }

  /**
   * Compute square root mod p using Tonelli-Shanks algorithm (simplified for small primes)
   */
  sqrt(a: number): number[] {
    if (!this.isQuadraticResidue(a)) {
      return [];
    }

    if (a === 0) return [0];

    // For p ≡ 3 (mod 4), we can use the simple formula
    if (this.p % 4 === 3) {
      const result = this.power(a, (this.p + 1) / 4);
      return [result, this.subtract(0, result)];
    }

    // For other cases, use trial method for small primes
    for (let x = 0; x < this.p; x++) {
      if (this.multiply(x, x) === a) {
        return x === 0 ? [0] : [x, this.subtract(0, x)];
      }
    }

    return [];
  }

  /**
   * Normalize a number to the range [0, p)
   */
  normalize(a: number): number {
    return ((a % this.p) + this.p) % this.p;
  }
}

/**
 * Elliptic Curve Point operations
 */
export class EllipticCurve {
  private field: FiniteField;

  constructor(public readonly params: EllipticCurveParameters) {
    this.field = new FiniteField(params.p);
    
    // Check curve is non-singular: 4a³ + 27b² ≠ 0 mod p
    const discriminant = this.field.add(
      this.field.multiply(4, this.field.power(params.a, 3)),
      this.field.multiply(27, this.field.power(params.b, 2))
    );
    
    if (discriminant === 0) {
      throw new Error('Curve is singular (discriminant = 0)');
    }
  }

  /**
   * Create the point at infinity (identity element)
   */
  infinity(): EllipticCurvePoint {
    return { x: 0, y: 0, isInfinity: true };
  }

  /**
   * Create a finite point
   */
  point(x: number, y: number): EllipticCurvePoint {
    x = this.field.normalize(x);
    y = this.field.normalize(y);
    
    if (!this.isOnCurve({ x, y, isInfinity: false })) {
      throw new Error(`Point (${x}, ${y}) is not on the curve`);
    }
    
    return { x, y, isInfinity: false };
  }

  /**
   * Check if a point lies on the curve: y² = x³ + ax + b
   */
  isOnCurve(point: EllipticCurvePoint): boolean {
    if (point.isInfinity) return true;

    const { x, y } = point;
    const { a, b } = this.params;

    // Compute y²
    const leftSide = this.field.multiply(y, y);

    // Compute x³ + ax + b
    const rightSide = this.field.add(
      this.field.add(
        this.field.power(x, 3),
        this.field.multiply(a, x)
      ),
      b
    );

    return leftSide === rightSide;
  }

  /**
   * Point addition: P + Q
   */
  add(P: EllipticCurvePoint, Q: EllipticCurvePoint): EllipticCurvePoint {
    // P + O = P
    if (Q.isInfinity) return P;
    // O + P = P  
    if (P.isInfinity) return Q;

    const { x: x1, y: y1 } = P;
    const { x: x2, y: y2 } = Q;

    // P + (-P) = O
    if (x1 === x2 && this.field.add(y1, y2) === 0) {
      return this.infinity();
    }

    let slope: number;

    if (x1 === x2 && y1 === y2) {
      // Point doubling: P + P
      // slope = (3x₁² + a) / (2y₁)
      const numerator = this.field.add(
        this.field.multiply(3, this.field.multiply(x1, x1)),
        this.params.a
      );
      const denominator = this.field.multiply(2, y1);
      slope = this.field.multiply(numerator, this.field.inverse(denominator));
    } else {
      // Point addition: P + Q where P ≠ Q
      // slope = (y₂ - y₁) / (x₂ - x₁)
      const numerator = this.field.subtract(y2, y1);
      const denominator = this.field.subtract(x2, x1);
      slope = this.field.multiply(numerator, this.field.inverse(denominator));
    }

    // x₃ = slope² - x₁ - x₂
    const x3 = this.field.subtract(
      this.field.subtract(
        this.field.multiply(slope, slope),
        x1
      ),
      x2
    );

    // y₃ = slope(x₁ - x₃) - y₁
    const y3 = this.field.subtract(
      this.field.multiply(slope, this.field.subtract(x1, x3)),
      y1
    );

    return { x: x3, y: y3, isInfinity: false };
  }

  /**
   * Point negation: -P
   */
  negate(point: EllipticCurvePoint): EllipticCurvePoint {
    if (point.isInfinity) return point;
    
    return {
      x: point.x,
      y: this.field.subtract(0, point.y),
      isInfinity: false
    };
  }

  /**
   * Scalar multiplication: k * P using double-and-add algorithm
   */
  multiply(k: number, P: EllipticCurvePoint): EllipticCurvePoint {
    if (k === 0) return this.infinity();
    if (k === 1) return P;
    if (k < 0) return this.multiply(-k, this.negate(P));

    let result = this.infinity();
    let addend = P;

    while (k > 0) {
      if (k % 2 === 1) {
        result = this.add(result, addend);
      }
      addend = this.add(addend, addend); // Double
      k = Math.floor(k / 2);
    }

    return result;
  }

  /**
   * Find all points on the curve
   */
  getAllPoints(): EllipticCurvePoint[] {
    const points: EllipticCurvePoint[] = [this.infinity()];

    for (let x = 0; x < this.params.p; x++) {
      // Compute y² = x³ + ax + b
      const ySquared = this.field.add(
        this.field.add(
          this.field.power(x, 3),
          this.field.multiply(this.params.a, x)
        ),
        this.params.b
      );

      // Find square roots of y²
      const yValues = this.field.sqrt(ySquared);
      for (const y of yValues) {
        points.push({ x, y, isInfinity: false });
      }
    }

    return points;
  }

  /**
   * Compute the order of a point (smallest positive k such that k*P = O)
   */
  pointOrder(P: EllipticCurvePoint): number {
    if (P.isInfinity) return 1;

    let current = P;
    let order = 1;

    while (!current.isInfinity) {
      current = this.add(current, P);
      order++;
      
      // Safety check to prevent infinite loops - use Hasse bound: |#E(Fp) - (p+1)| <= 2√p
      // So point order can be at most the group order, which is at most p+1+2√p
      const maxOrder = this.params.p + 1 + 2 * Math.ceil(Math.sqrt(this.params.p));
      if (order > maxOrder) {
        throw new Error(`Point order calculation exceeded Hasse bound (${maxOrder})`);
      }
    }

    return order;
  }

  /**
   * Get curve equation as LaTeX string
   */
  getEquationLatex(): string {
    const { a, b, p } = this.params;
    let equation = 'y^2 = x^3';
    
    if (a !== 0) {
      equation += a > 0 ? ` + ${a}x` : ` - ${Math.abs(a)}x`;
    }
    
    if (b !== 0) {
      equation += b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`;
    }
    
    equation += ` \\pmod{${p}}`;
    
    return equation;
  }

  /**
   * Format point as string
   */
  pointToString(point: EllipticCurvePoint): string {
    if (point.isInfinity) return '∞';
    return `(${point.x}, ${point.y})`;
  }

  /**
   * Format point as LaTeX
   */
  pointToLatex(point: EllipticCurvePoint): string {
    if (point.isInfinity) return '\\mathcal{O}';
    return `(${point.x}, ${point.y})`;
  }
}

/**
 * Elliptic Curve Group - integrates with the existing Group interface
 */
export class EllipticCurveGroup {
  private curve: EllipticCurve;
  private points: EllipticCurvePoint[];
  private group: Group;

  constructor(params: EllipticCurveParameters) {
    this.curve = new EllipticCurve(params);
    this.points = this.curve.getAllPoints();
    this.group = this.createGroupStructure();
  }

  private createGroupStructure(): Group {
    const elements: GroupElement[] = [];
    const operations = new Map<string, Map<string, string>>();

    // Create group elements
    for (let i = 0; i < this.points.length; i++) {
      const point = this.points[i];
      const id = `P${i}`;
      const label = this.curve.pointToString(point);
      const latex = this.curve.pointToLatex(point);
      
      elements.push({
        id,
        label,
        latex,
        order: this.curve.pointOrder(point),
        inverse: '', // Will be filled later
        conjugacyClass: 0 // All elements in same class for abelian group
      });

      operations.set(id, new Map());
    }

    // Fill in operations table and inverses
    for (let i = 0; i < this.points.length; i++) {
      const P = this.points[i];
      const idP = `P${i}`;
      
      // Find inverse
      const negP = this.curve.negate(P);
      const inverseIndex = this.points.findIndex(point => 
        point.isInfinity === negP.isInfinity && 
        point.x === negP.x && 
        point.y === negP.y
      );
      elements[i].inverse = `P${inverseIndex}`;

      // Fill operation table
      for (let j = 0; j < this.points.length; j++) {
        const Q = this.points[j];
        const idQ = `P${j}`;
        const sum = this.curve.add(P, Q);
        
        const resultIndex = this.points.findIndex(point =>
          point.isInfinity === sum.isInfinity &&
          point.x === sum.x &&
          point.y === sum.y
        );
        
        operations.get(idP)!.set(idQ, `P${resultIndex}`);
      }
    }

    // Find generators (points that generate the group)
    const generators: string[] = [];
    for (let i = 0; i < elements.length; i++) {
      const elementOrder = elements[i].order;
      if (elementOrder === this.points.length) {
        generators.push(elements[i].id);
      }
    }

    // If no single generator, find a minimal generating set
    if (generators.length === 0) {
      // For now, use the first non-identity element as generator
      // In practice, we'd want to find a proper generating set
      for (let i = 1; i < elements.length; i++) {
        generators.push(elements[i].id);
        break;
      }
    }

    const { a, b, p } = this.curve.params;
    const name = `E(${a},${b})/${p}`;
    const displayName = `E: y² = x³ + ${a}x + ${b} (mod ${p})`;

    return {
      name,
      displayName,
      order: this.points.length,
      elements,
      operations,
      generators,
      relations: [], // Could add curve-specific relations
      isAbelian: true, // Elliptic curves always form abelian groups
      center: elements.map(e => e.id), // Entire group is the center (abelian)
      conjugacyClasses: elements.map(e => [e.id]), // Each element is its own class
      subgroups: [] // Could compute subgroups if needed
    };
  }

  /**
   * Get the Group interface representation
   */
  getGroup(): Group {
    return this.group;
  }

  /**
   * Get the underlying elliptic curve
   */
  getCurve(): EllipticCurve {
    return this.curve;
  }

  /**
   * Get all points on the curve
   */
  getPoints(): EllipticCurvePoint[] {
    return [...this.points];
  }

  /**
   * Convert point ID to actual point
   */
  getPointById(id: string): EllipticCurvePoint | undefined {
    const index = parseInt(id.substring(1)); // Remove 'P' prefix
    return this.points[index];
  }

  /**
   * Convert point to point ID
   */
  getIdByPoint(point: EllipticCurvePoint): string | undefined {
    const index = this.points.findIndex(p =>
      p.isInfinity === point.isInfinity &&
      p.x === point.x &&
      p.y === point.y
    );
    return index >= 0 ? `P${index}` : undefined;
  }

  /**
   * Create some common elliptic curves for educational purposes
   */
  static createExampleCurves(): { [name: string]: EllipticCurveParameters } {
    return {
      // Simple curves over small fields for demonstration
      'E1': { a: 0, b: 1, p: 5 },    // y² = x³ + 1 (mod 5) - 6 points
      'E2': { a: 1, b: 1, p: 7 },    // y² = x³ + x + 1 (mod 7) - 5 points  
      'E3': { a: 1, b: 1, p: 5 },    // y² = x³ + x + 1 (mod 5) - 5 points
      'E4': { a: 2, b: 2, p: 7 },    // y² = x³ + 2x + 2 (mod 7) - 8 points
      'E5': { a: 1, b: 0, p: 7 },    // y² = x³ + x (mod 7) - 8 points
      'E6': { a: 3, b: 8, p: 13 },   // y² = x³ + 3x + 8 (mod 13) - 9 points
      'E7': { a: 0, b: 7, p: 11 },   // y² = x³ + 7 (mod 11) - 12 points
      'E8': { a: 1, b: 3, p: 11 },   // y² = x³ + x + 3 (mod 11) - 16 points
    };
  }
}