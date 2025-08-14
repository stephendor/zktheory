/**
 * Elliptic Curve Groups Library
 * Implements elliptic curve groups over finite fields for Cayley graph visualization
 */

export interface EllipticCurvePoint {
  x: number | null; // null represents point at infinity
  y: number | null;
  isIdentity: boolean;
}

export interface EllipticCurve {
  a: number;
  b: number;
  p: number; // prime modulus
  name: string;
  displayName: string;
}

export interface EllipticCurveGroup {
  curve: EllipticCurve;
  points: EllipticCurvePoint[];
  order: number;
  name: string;
  displayName: string;
}

export class EllipticCurveArithmetic {
  /**
   * Modular inverse using extended Euclidean algorithm
   */
  static modInverse(a: number, m: number): number {
    if (m <= 0) throw new Error('Modulus must be positive');
    if (a === 0) throw new Error('Cannot find inverse of 0');
    
    a = ((a % m) + m) % m;
    
    let [oldR, r] = [a, m];
    let [oldS, s] = [1, 0];
    
    while (r !== 0) {
      const quotient = Math.floor(oldR / r);
      [oldR, r] = [r, oldR - quotient * r];
      [oldS, s] = [s, oldS - quotient * s];
    }
    
    if (oldR !== 1) {
      throw new Error(`Modular inverse of ${a} mod ${m} does not exist (gcd = ${oldR})`);
    }
    
    return ((oldS % m) + m) % m;
  }

  /**
   * Modular exponentiation
   */
  static modPow(base: number, exp: number, mod: number): number {
    let result = 1;
    base = base % mod;
    while (exp > 0) {
      if (exp % 2 === 1) {
        result = (result * base) % mod;
      }
      exp = Math.floor(exp / 2);
      base = (base * base) % mod;
    }
    return result;
  }

  /**
   * Check if a point is on the elliptic curve y² = x³ + ax + b (mod p)
   */
  static isOnCurve(point: EllipticCurvePoint, curve: EllipticCurve): boolean {
    if (point.isIdentity) return true;
    if (point.x === null || point.y === null) return point.isIdentity;
    
    const { a, b, p } = curve;
    const leftSide = (point.y * point.y) % p;
    const rightSide = (point.x * point.x * point.x + a * point.x + b) % p;
    
    return leftSide === ((rightSide % p + p) % p);
  }

  /**
   * Add two points on an elliptic curve
   */
  static addPoints(
    p1: EllipticCurvePoint, 
    p2: EllipticCurvePoint, 
    curve: EllipticCurve
  ): EllipticCurvePoint {
    // Handle identity element (point at infinity)
    if (p1.isIdentity) return { ...p2 };
    if (p2.isIdentity) return { ...p1 };

    const { p: prime } = curve;

    // Handle case where points are inverses of each other
    if (p1.x === p2.x && p1.y === (prime - p2.y!) % prime) {
      return { x: null, y: null, isIdentity: true };
    }

    let slope: number;

    if (p1.x === p2.x && p1.y === p2.y) {
      // Point doubling: slope = (3x₁² + a) / (2y₁)
      const numerator = (3 * p1.x! * p1.x! + curve.a) % prime;
      const denominator = (2 * p1.y!) % prime;
      
      if (denominator === 0) {
        // Point is its own inverse (vertical tangent)
        return { x: null, y: null, isIdentity: true };
      }
      
      slope = (numerator * this.modInverse(denominator, prime)) % prime;
    } else {
      // Point addition: slope = (y₂ - y₁) / (x₂ - x₁)
      const numerator = (p2.y! - p1.y! + prime) % prime;
      const denominator = (p2.x! - p1.x! + prime) % prime;
      
      if (denominator === 0) {
        // Vertical line case - points are inverses
        return { x: null, y: null, isIdentity: true };
      }
      
      slope = (numerator * this.modInverse(denominator, prime)) % prime;
    }

    // Calculate result point
    const x3 = (slope * slope - p1.x! - p2.x! + prime * 3) % prime;
    const y3 = (slope * (p1.x! - x3) - p1.y! + prime * 2) % prime;

    return {
      x: x3,
      y: y3,
      isIdentity: false
    };
  }

  /**
   * Scalar multiplication: multiply point by scalar
   */
  static scalarMultiply(
    point: EllipticCurvePoint, 
    scalar: number, 
    curve: EllipticCurve
  ): EllipticCurvePoint {
    if (scalar === 0 || point.isIdentity) {
      return { x: null, y: null, isIdentity: true };
    }

    if (scalar === 1) return { ...point };

    let result: EllipticCurvePoint = { x: null, y: null, isIdentity: true };
    let addend = { ...point };
    
    while (scalar > 0) {
      if (scalar % 2 === 1) {
        result = this.addPoints(result, addend, curve);
      }
      addend = this.addPoints(addend, addend, curve);
      scalar = Math.floor(scalar / 2);
    }

    return result;
  }

  /**
   * Find the order of a point (smallest positive integer n such that nP = O)
   */
  static getPointOrder(point: EllipticCurvePoint, curve: EllipticCurve): number {
    if (point.isIdentity) return 1;

    try {
      let current = { ...point };
      let order = 1;

      while (!current.isIdentity && order < 100) { // Safety limit
        current = this.addPoints(current, point, curve);
        order++;
      }

      return current.isIdentity ? order : -1; // -1 indicates order > 100
    } catch (error) {
      console.warn(`⚠️ Failed to calculate order for point (${point.x}, ${point.y}):`, error);
      return 1; // Return 1 as a safe default
    }
  }
}

export class EllipticCurveGroupGenerator {
  /**
   * Generate all points on an elliptic curve over a finite field
   */
  static generateCurvePoints(curve: EllipticCurve): EllipticCurvePoint[] {
    const points: EllipticCurvePoint[] = [];
    
    // Add point at infinity (identity element)
    points.push({ x: null, y: null, isIdentity: true });

    // Find all points (x, y) where y² ≡ x³ + ax + b (mod p)
    for (let x = 0; x < curve.p; x++) {
      const rhs = (x * x * x + curve.a * x + curve.b) % curve.p;
      
      for (let y = 0; y < curve.p; y++) {
        if ((y * y) % curve.p === rhs) {
          points.push({ x, y, isIdentity: false });
        }
      }
    }

    return points;
  }

  /**
   * Create an elliptic curve group structure
   */
  static createEllipticCurveGroup(curve: EllipticCurve): EllipticCurveGroup {
    const points = this.generateCurvePoints(curve);
    
    return {
      curve,
      points,
      order: points.length,
      name: `EC_${curve.name}`,
      displayName: `E: y² = x³ + ${curve.a}x + ${curve.b} (mod ${curve.p})`
    };
  }

  /**
   * Get predefined elliptic curves for demonstration
   */
  static getPredefinedCurves(): EllipticCurve[] {
    return [
      {
        a: 1, b: 1, p: 5,
        name: 'E_5_1_1',
        displayName: 'y² = x³ + x + 1 (mod 5)'
      },
      {
        a: 1, b: 6, p: 7,
        name: 'E_7_1_6', 
        displayName: 'y² = x³ + x + 6 (mod 7)'
      },
      {
        a: 2, b: 3, p: 7,
        name: 'E_7_2_3',
        displayName: 'y² = x³ + 2x + 3 (mod 7)'
      },
      {
        a: 0, b: 7, p: 11,
        name: 'E_11_0_7',
        displayName: 'y² = x³ + 7 (mod 11)'
      },
      {
        a: 1, b: 1, p: 11,
        name: 'E_11_1_1',
        displayName: 'y² = x³ + x + 1 (mod 11)'
      },
      {
        a: 1, b: 0, p: 13,
        name: 'E_13_1_0',
        displayName: 'y² = x³ + x (mod 13)'
      }
    ];
  }

  /**
   * Convert elliptic curve group to standard group format
   */
  static toStandardGroup(ecGroup: EllipticCurveGroup): any {
    const { points, curve } = ecGroup;
    
    // Create group elements
    const elements = points.map((point, index) => ({
      id: `P${index}`,
      label: point.isIdentity ? 'O' : `(${point.x},${point.y})`,
      latex: point.isIdentity ? '\\mathcal{O}' : `(${point.x},${point.y})`,
      order: EllipticCurveArithmetic.getPointOrder(point, curve),
      inverse: '', // Will be calculated below
      conjugacyClass: 0 // EC groups are abelian, so each element is its own conjugacy class
    }));

    // Calculate inverses
    elements.forEach((element, i) => {
      const point = points[i];
      if (point.isIdentity) {
        element.inverse = element.id;
      } else {
        // Find -P (same x, negated y)
        const inversePoint = points.find(p => 
          !p.isIdentity && 
          p.x === point.x && 
          p.y === (curve.p - point.y!) % curve.p
        );
        element.inverse = inversePoint ? 
          `P${points.indexOf(inversePoint)}` : 
          element.id;
      }
    });

    // Create operation table
    const operations = new Map<string, Map<string, string>>();
    elements.forEach((elem1, i) => {
      const operationMap = new Map<string, string>();
      elements.forEach((elem2, j) => {
        const result = EllipticCurveArithmetic.addPoints(
          points[i], 
          points[j], 
          curve
        );
        const resultIndex = points.findIndex(p => 
          p.isIdentity === result.isIdentity &&
          p.x === result.x && 
          p.y === result.y
        );
        operationMap.set(elem2.id, `P${resultIndex}`);
      });
      operations.set(elem1.id, operationMap);
    });

    // Find generators (elements that generate the whole group)
    const generators: string[] = [];
    for (let i = 1; i < elements.length; i++) { // Skip identity
      const element = elements[i];
      if (element.order === elements.length) {
        generators.push(element.id);
      }
    }

    // If no single generator found, use the first non-identity element
    if (generators.length === 0 && elements.length > 1) {
      generators.push(elements[1].id);
    }

    return {
      name: ecGroup.name,
      displayName: ecGroup.displayName,
      order: ecGroup.order,
      elements,
      operations,
      generators,
      relations: [], // Will be computed based on the structure
      isAbelian: true, // Elliptic curve groups are always abelian
      center: elements.map(e => e.id), // All elements (abelian group)
      conjugacyClasses: elements.map(e => [e.id]), // Each element is its own class
      subgroups: [] // Will be computed separately if needed
    };
  }
}

/**
 * Animation state for point addition visualization
 */
export interface PointAdditionAnimation {
  step: 'selecting' | 'drawing_line' | 'finding_intersection' | 'reflecting' | 'completed';
  point1?: EllipticCurvePoint;
  point2?: EllipticCurvePoint;
  result?: EllipticCurvePoint;
  linePoints?: { x: number; y: number }[];
  intersectionPoint?: { x: number; y: number };
  progress: number; // 0 to 1
}

export class EllipticCurveAnimator {
  /**
   * Generate animation frames for point addition
   */
  static generateAdditionAnimation(
    p1: EllipticCurvePoint,
    p2: EllipticCurvePoint,
    curve: EllipticCurve,
    canvasWidth: number = 800,
    canvasHeight: number = 600
  ): PointAdditionAnimation[] {
    const frames: PointAdditionAnimation[] = [];
    const result = EllipticCurveArithmetic.addPoints(p1, p2, curve);

    // Step 1: Point selection
    frames.push({
      step: 'selecting',
      point1: p1,
      point2: p2,
      progress: 0
    });

    // Step 2: Draw line through points
    if (!p1.isIdentity && !p2.isIdentity) {
      const linePoints = this.generateLinePoints(p1, p2, canvasWidth, canvasHeight);
      frames.push({
        step: 'drawing_line',
        point1: p1,
        point2: p2,
        linePoints,
        progress: 0.25
      });

      // Step 3: Find intersection point
      frames.push({
        step: 'finding_intersection',
        point1: p1,
        point2: p2,
        linePoints,
        intersectionPoint: { x: result.x || 0, y: result.y || 0 },
        progress: 0.5
      });

      // Step 4: Reflect across x-axis
      frames.push({
        step: 'reflecting',
        point1: p1,
        point2: p2,
        linePoints,
        intersectionPoint: { x: result.x || 0, y: result.y || 0 },
        result,
        progress: 0.75
      });
    }

    // Step 5: Completed
    frames.push({
      step: 'completed',
      point1: p1,
      point2: p2,
      result,
      progress: 1
    });

    return frames;
  }

  /**
   * Generate points along a line for visualization
   */
  private static generateLinePoints(
    p1: EllipticCurvePoint,
    p2: EllipticCurvePoint,
    width: number,
    height: number
  ): { x: number; y: number }[] {
    if (p1.isIdentity || p2.isIdentity || p1.x === null || p2.x === null) {
      return [];
    }

    const points: { x: number; y: number }[] = [];
    const steps = 50;

    if (p1.x === p2.x) {
      // Vertical line
      for (let i = 0; i <= steps; i++) {
        points.push({
          x: p1.x,
          y: (i / steps) * height
        });
      }
    } else {
      // Calculate slope and extend line
      const slope = (p2.y! - p1.y!) / (p2.x! - p1.x!);
      const intercept = p1.y! - slope * p1.x!;

      for (let x = 0; x <= width; x += width / steps) {
        const y = slope * x + intercept;
        if (y >= 0 && y <= height) {
          points.push({ x, y });
        }
      }
    }

    return points;
  }
}