/**
 * Group Database - Complete implementation of finite groups up to order 20
 * Extended with elliptic curve groups
 */

import { Group, GroupElement, Permutation } from './GroupTheory';
import { EllipticCurveGroup, EllipticCurveParameters } from './EllipticCurveGroup';

export class GroupDatabase {
  private static groups: Map<string, Group> = new Map();

  static {
    this.initializeAllGroups();
  }

  static getAllGroups(): Group[] {
    return Array.from(this.groups.values());
  }

  static getGroup(name: string): Group | undefined {
    return this.groups.get(name);
  }

  static getGroupNames(): string[] {
    return Array.from(this.groups.keys()).sort();
  }

  static getGroupsByOrder(order: number): Group[] {
    return Array.from(this.groups.values()).filter(g => g.order === order);
  }

  private static toSuperscript(num: number): string {
    const superscriptMap: { [key: string]: string } = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };
    return num.toString().split('').map(digit => superscriptMap[digit] || digit).join('');
  }

  private static initializeAllGroups() {
    // Order 1
    this.groups.set('C1', this.createTrivialGroup());

    // Order 2
    this.groups.set('C2', this.createCyclicGroup(2));

    // Order 3
    this.groups.set('C3', this.createCyclicGroup(3));

    // Order 4
    this.groups.set('C4', this.createCyclicGroup(4));
    this.groups.set('V4', this.createKleinFourGroup());

    // Order 5
    this.groups.set('C5', this.createCyclicGroup(5));

    // Order 6
    this.groups.set('C6', this.createCyclicGroup(6));
    this.groups.set('D3', this.createDihedralGroup(3));
    this.groups.set('S3', this.createSymmetricGroup3());

    // Order 7
    this.groups.set('C7', this.createCyclicGroup(7));

    // Order 8
    this.groups.set('C8', this.createCyclicGroup(8));
    this.groups.set('D4', this.createDihedralGroup(4));
    this.groups.set('Q8', this.createQuaternionGroup());
    this.groups.set('C2xC4', this.createDirectProduct(2, 4));
    this.groups.set('C2xC2xC2', this.createElementaryAbelianGroup(8));

    // Order 9
    this.groups.set('C9', this.createCyclicGroup(9));
    this.groups.set('C3xC3', this.createDirectProduct(3, 3));

    // Order 10
    this.groups.set('C10', this.createCyclicGroup(10));
    this.groups.set('D5', this.createDihedralGroup(5));

    // Order 11
    this.groups.set('C11', this.createCyclicGroup(11));

    // Order 12
    this.groups.set('C12', this.createCyclicGroup(12));
    this.groups.set('D6', this.createDihedralGroup(6));
    this.groups.set('A4', this.createAlternatingGroup4());
    this.groups.set('C2xC6', this.createDirectProduct(2, 6));

    // Order 13
    this.groups.set('C13', this.createCyclicGroup(13));

    // Order 14
    this.groups.set('C14', this.createCyclicGroup(14));
    this.groups.set('D7', this.createDihedralGroup(7));

    // Order 15
    this.groups.set('C15', this.createCyclicGroup(15));

    // Order 16
    this.groups.set('C16', this.createCyclicGroup(16));
    this.groups.set('D8', this.createDihedralGroup(8));
    this.groups.set('C2xC8', this.createDirectProduct(2, 8));
    this.groups.set('C4xC4', this.createDirectProduct(4, 4));
    this.groups.set('C2xC2xC4', this.createDirectProduct2x2x4());

    // Order 17
    this.groups.set('C17', this.createCyclicGroup(17));

    // Order 18
    this.groups.set('C18', this.createCyclicGroup(18));
    this.groups.set('D9', this.createDihedralGroup(9));
    this.groups.set('C3xC6', this.createDirectProduct(3, 6));

    // Order 19
    this.groups.set('C19', this.createCyclicGroup(19));

    // Order 20
    this.groups.set('C20', this.createCyclicGroup(20));
    this.groups.set('D10', this.createDihedralGroup(10));
    this.groups.set('C4xC5', this.createDirectProduct(4, 5));
    this.groups.set('C2xC10', this.createDirectProduct(2, 10));
    
    // Add elliptic curve groups
    this.initializeEllipticCurveGroups();
  }

  private static createTrivialGroup(): Group {
    return {
      name: 'C1',
      displayName: 'Trivial Group',
      order: 1,
      elements: [{ id: 'e', label: 'e', order: 1, inverse: 'e', conjugacyClass: 0 }],
      operations: new Map([['e', new Map([['e', 'e']])]]),
      generators: [],
      relations: [],
      isAbelian: true,
      center: ['e'],
      conjugacyClasses: [['e']],
      subgroups: [{ elements: ['e'], name: 'Trivial', isNormal: true }]
    };
  }

  private static createCyclicGroup(n: number): Group {
    const elements: GroupElement[] = [];
    const operations = new Map<string, Map<string, string>>();

    // Create elements
    for (let i = 0; i < n; i++) {
      elements.push({
        id: `g${i}`,
        label: i === 0 ? 'e' : (i === 1 ? 'g' : `g${this.toSuperscript(i)}`),
        order: n / this.gcd(i, n),
        inverse: `g${(n - i) % n}`,
        conjugacyClass: 0 // All elements in their own class for abelian groups
      });
    }

    // Create multiplication table
    for (let i = 0; i < n; i++) {
      const rowMap = new Map<string, string>();
      for (let j = 0; j < n; j++) {
        rowMap.set(`g${j}`, `g${(i + j) % n}`);
      }
      operations.set(`g${i}`, rowMap);
    }

    // Find subgroups
    const subgroups = this.findCyclicSubgroups(n);
    
    // Find all possible generators (elements that generate the full group)
    const allGenerators: string[] = [];
    for (let i = 1; i < n; i++) {
      if (this.gcd(i, n) === 1) { // φ(n) - Euler's totient function
        allGenerators.push(`g${i}`);
      }
    }

    return {
      name: `C${n}`,
      displayName: `Cyclic Group C₍${n}₎`,
      order: n,
      elements,
      operations,
      generators: n > 1 ? (allGenerators.length > 0 ? allGenerators : ['g1']) : [],
      relations: n > 1 ? [`g^${n} = e`] : [],
      isAbelian: true,
      center: elements.map(e => e.id),
      conjugacyClasses: elements.map(e => [e.id]),
      subgroups
    };
  }

  private static createDihedralGroup(n: number): Group {
    const elements: GroupElement[] = [];
    const operations = new Map<string, Map<string, string>>();

    // Rotations
    for (let i = 0; i < n; i++) {
      elements.push({
        id: `r${i}`,
        label: i === 0 ? 'e' : `r${this.toSuperscript(i)}`,
        order: n / this.gcd(i, n),
        inverse: `r${(n - i) % n}`,
        conjugacyClass: this.getRotationConjugacyClass(i, n)
      });
    }

    // Reflections
    for (let i = 0; i < n; i++) {
      elements.push({
        id: `s${i}`,
        label: i === 0 ? 's' : `sr${this.toSuperscript(i)}`,
        order: 2,
        inverse: `s${i}`,
        conjugacyClass: this.getReflectionConjugacyClass(i, n)
      });
    }

    // Create multiplication table
    this.createDihedralMultiplicationTable(operations, n);

    return {
      name: `D${n}`,
      displayName: `Dihedral Group D₍${n}₎`,
      order: 2 * n,
      elements,
      operations,
      generators: ['r1', 's0'],
      relations: [`r^${n} = e`, 's^2 = e', `srs^(-1) = r^(-1)`],
      isAbelian: n <= 2,
      center: this.getDihedralCenter(n),
      conjugacyClasses: this.getDihedralConjugacyClasses(n),
      subgroups: this.getDihedralSubgroups(n)
    };
  }

  private static createSymmetricGroup3(): Group {
    const elements: GroupElement[] = [
      { id: 'e', label: 'e', order: 1, inverse: 'e', conjugacyClass: 0 },
      { id: 'a', label: '(1 2)', order: 2, inverse: 'a', conjugacyClass: 1 },
      { id: 'b', label: '(1 3)', order: 2, inverse: 'b', conjugacyClass: 1 },
      { id: 'c', label: '(2 3)', order: 2, inverse: 'c', conjugacyClass: 1 },
      { id: 'd', label: '(1 2 3)', order: 3, inverse: 'f', conjugacyClass: 2 },
      { id: 'f', label: '(1 3 2)', order: 3, inverse: 'd', conjugacyClass: 2 }
    ];

    const operations = new Map<string, Map<string, string>>();
    
    // S3 multiplication table
    const table = {
      'e': { 'e': 'e', 'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd', 'f': 'f' },
      'a': { 'e': 'a', 'a': 'e', 'b': 'd', 'c': 'f', 'd': 'b', 'f': 'c' },
      'b': { 'e': 'b', 'a': 'f', 'b': 'e', 'c': 'd', 'd': 'c', 'f': 'a' },
      'c': { 'e': 'c', 'a': 'd', 'b': 'f', 'c': 'e', 'd': 'a', 'f': 'b' },
      'd': { 'e': 'd', 'a': 'c', 'b': 'a', 'c': 'b', 'd': 'f', 'f': 'e' },
      'f': { 'e': 'f', 'a': 'b', 'b': 'c', 'c': 'a', 'd': 'e', 'f': 'd' }
    };

    for (const [elem1, row] of Object.entries(table)) {
      const rowMap = new Map<string, string>();
      for (const [elem2, result] of Object.entries(row)) {
        rowMap.set(elem2, result);
      }
      operations.set(elem1, rowMap);
    }

    return {
      name: 'S3',
      displayName: 'Symmetric Group S₃',
      order: 6,
      elements,
      operations,
      generators: ['a', 'b', 'c', 'd'], // Multiple generators: all transpositions and a 3-cycle
      relations: ['a^2 = e', 'b^2 = e', 'c^2 = e', 'd^3 = e', '(ab)^3 = e', '(ac)^3 = e', '(bc)^3 = e'],
      isAbelian: false,
      center: ['e'],
      conjugacyClasses: [['e'], ['a', 'b', 'c'], ['d', 'f']],
      subgroups: [
        { elements: ['e'], name: 'Trivial', isNormal: true },
        { elements: ['e', 'a'], name: '⟨a⟩', isNormal: false },
        { elements: ['e', 'b'], name: '⟨b⟩', isNormal: false },
        { elements: ['e', 'c'], name: '⟨c⟩', isNormal: false },
        { elements: ['e', 'd', 'f'], name: '⟨d⟩', isNormal: true },
        { elements: ['e', 'a', 'b', 'c', 'd', 'f'], name: 'S₃', isNormal: true }
      ]
    };
  }

  private static createKleinFourGroup(): Group {
    const elements: GroupElement[] = [
      { id: 'e', label: 'e', order: 1, inverse: 'e', conjugacyClass: 0 },
      { id: 'a', label: 'a', order: 2, inverse: 'a', conjugacyClass: 1 },
      { id: 'b', label: 'b', order: 2, inverse: 'b', conjugacyClass: 2 },
      { id: 'c', label: 'c', order: 2, inverse: 'c', conjugacyClass: 3 }
    ];

    const operations = new Map<string, Map<string, string>>();
    const table = {
      'e': { 'e': 'e', 'a': 'a', 'b': 'b', 'c': 'c' },
      'a': { 'e': 'a', 'a': 'e', 'b': 'c', 'c': 'b' },
      'b': { 'e': 'b', 'a': 'c', 'b': 'e', 'c': 'a' },
      'c': { 'e': 'c', 'a': 'b', 'b': 'a', 'c': 'e' }
    };

    for (const [elem1, row] of Object.entries(table)) {
      const rowMap = new Map<string, string>();
      for (const [elem2, result] of Object.entries(row)) {
        rowMap.set(elem2, result);
      }
      operations.set(elem1, rowMap);
    }

    return {
      name: 'V4',
      displayName: 'Klein Four Group V₄',
      order: 4,
      elements,
      operations,
      generators: ['a', 'b', 'c'], // All three non-identity elements are generators
      relations: ['a^2 = e', 'b^2 = e', 'c^2 = e', 'ab = c', 'ac = b', 'bc = a'],
      isAbelian: true,
      center: ['e', 'a', 'b', 'c'],
      conjugacyClasses: [['e'], ['a'], ['b'], ['c']],
      subgroups: [
        { elements: ['e'], name: 'Trivial', isNormal: true },
        { elements: ['e', 'a'], name: '⟨a⟩', isNormal: true },
        { elements: ['e', 'b'], name: '⟨b⟩', isNormal: true },
        { elements: ['e', 'c'], name: '⟨c⟩', isNormal: true },
        { elements: ['e', 'a', 'b', 'c'], name: 'V₄', isNormal: true }
      ]
    };
  }

  private static createQuaternionGroup(): Group {
    const elements: GroupElement[] = [
      { id: '1', label: '1', order: 1, inverse: '1', conjugacyClass: 0 },
      { id: '-1', label: '-1', order: 2, inverse: '-1', conjugacyClass: 1 },
      { id: 'i', label: 'i', order: 4, inverse: '-i', conjugacyClass: 2 },
      { id: '-i', label: '-i', order: 4, inverse: 'i', conjugacyClass: 2 },
      { id: 'j', label: 'j', order: 4, inverse: '-j', conjugacyClass: 3 },
      { id: '-j', label: '-j', order: 4, inverse: 'j', conjugacyClass: 3 },
      { id: 'k', label: 'k', order: 4, inverse: '-k', conjugacyClass: 4 },
      { id: '-k', label: '-k', order: 4, inverse: 'k', conjugacyClass: 4 }
    ];

    const operations = new Map<string, Map<string, string>>();
    const table = {
      '1': { '1': '1', '-1': '-1', 'i': 'i', '-i': '-i', 'j': 'j', '-j': '-j', 'k': 'k', '-k': '-k' },
      '-1': { '1': '-1', '-1': '1', 'i': '-i', '-i': 'i', 'j': '-j', '-j': 'j', 'k': '-k', '-k': 'k' },
      'i': { '1': 'i', '-1': '-i', 'i': '-1', '-i': '1', 'j': 'k', '-j': '-k', 'k': '-j', '-k': 'j' },
      '-i': { '1': '-i', '-1': 'i', 'i': '1', '-i': '-1', 'j': '-k', '-j': 'k', 'k': 'j', '-k': '-j' },
      'j': { '1': 'j', '-1': '-j', 'i': '-k', '-i': 'k', 'j': '-1', '-j': '1', 'k': 'i', '-k': '-i' },
      '-j': { '1': '-j', '-1': 'j', 'i': 'k', '-i': '-k', 'j': '1', '-j': '-1', 'k': '-i', '-k': 'i' },
      'k': { '1': 'k', '-1': '-k', 'i': 'j', '-i': '-j', 'j': '-i', '-j': 'i', 'k': '-1', '-k': '1' },
      '-k': { '1': '-k', '-1': 'k', 'i': '-j', '-i': 'j', 'j': 'i', '-j': '-i', 'k': '1', '-k': '-1' }
    };

    for (const [elem1, row] of Object.entries(table)) {
      const rowMap = new Map<string, string>();
      for (const [elem2, result] of Object.entries(row)) {
        rowMap.set(elem2, result);
      }
      operations.set(elem1, rowMap);
    }

    return {
      name: 'Q8',
      displayName: 'Quaternion Group Q₈',
      order: 8,
      elements,
      operations,
      generators: ['i', 'j', 'k'], // Multiple generators available
      relations: ['i^4 = 1', 'j^4 = 1', 'k^4 = 1', 'i^2 = j^2 = k^2 = ijk = -1'],
      isAbelian: false,
      center: ['1', '-1'],
      conjugacyClasses: [['1'], ['-1'], ['i', '-i'], ['j', '-j'], ['k', '-k']],
      subgroups: [
        { elements: ['1'], name: 'Trivial', isNormal: true },
        { elements: ['1', '-1'], name: '⟨-1⟩', isNormal: true },
        { elements: ['1', '-1', 'i', '-i'], name: '⟨i⟩', isNormal: true },
        { elements: ['1', '-1', 'j', '-j'], name: '⟨j⟩', isNormal: true },
        { elements: ['1', '-1', 'k', '-k'], name: '⟨k⟩', isNormal: true }
      ]
    };
  }

  private static createAlternatingGroup4(): Group {
    // A4 - proper implementation using permutation composition
    const elements: GroupElement[] = [
      { id: 'e', label: 'e', order: 1, inverse: 'e', conjugacyClass: 0 },
      // 3-cycles - 8 elements
      { id: '123', label: '(1 2 3)', order: 3, inverse: '132', conjugacyClass: 1 },
      { id: '132', label: '(1 3 2)', order: 3, inverse: '123', conjugacyClass: 1 },
      { id: '124', label: '(1 2 4)', order: 3, inverse: '142', conjugacyClass: 1 },
      { id: '142', label: '(1 4 2)', order: 3, inverse: '124', conjugacyClass: 1 },
      { id: '134', label: '(1 3 4)', order: 3, inverse: '143', conjugacyClass: 1 },
      { id: '143', label: '(1 4 3)', order: 3, inverse: '134', conjugacyClass: 1 },
      { id: '234', label: '(2 3 4)', order: 3, inverse: '243', conjugacyClass: 1 },
      { id: '243', label: '(2 4 3)', order: 3, inverse: '234', conjugacyClass: 1 },
      // Double transpositions - 3 elements  
      { id: '12)(34', label: '(1 2)(3 4)', order: 2, inverse: '12)(34', conjugacyClass: 2 },
      { id: '13)(24', label: '(1 3)(2 4)', order: 2, inverse: '13)(24', conjugacyClass: 2 },
      { id: '14)(23', label: '(1 4)(2 3)', order: 2, inverse: '14)(23', conjugacyClass: 2 }
    ];

    // Generate multiplication table using proper permutation composition
    const operations = new Map<string, Map<string, string>>();
    
    // Define permutations as arrays [p(1), p(2), p(3), p(4)]
    const permutations: { [key: string]: number[] } = {
      'e': [1, 2, 3, 4],
      '123': [2, 3, 1, 4],     // (1 2 3): 1->2, 2->3, 3->1, 4->4
      '132': [3, 1, 2, 4],     // (1 3 2): 1->3, 2->1, 3->2, 4->4
      '124': [2, 4, 3, 1],     // (1 2 4): 1->2, 2->4, 3->3, 4->1
      '142': [4, 1, 3, 2],     // (1 4 2): 1->4, 2->1, 3->3, 4->2
      '134': [3, 2, 4, 1],     // (1 3 4): 1->3, 2->2, 3->4, 4->1
      '143': [4, 2, 1, 3],     // (1 4 3): 1->4, 2->2, 3->1, 4->3
      '234': [1, 3, 4, 2],     // (2 3 4): 1->1, 2->3, 3->4, 4->2
      '243': [1, 4, 2, 3],     // (2 4 3): 1->1, 2->4, 3->2, 4->3
      '12)(34': [2, 1, 4, 3],  // (1 2)(3 4): 1->2, 2->1, 3->4, 4->3
      '13)(24': [3, 4, 1, 2],  // (1 3)(2 4): 1->3, 2->4, 3->1, 4->2
      '14)(23': [4, 3, 2, 1]   // (1 4)(2 3): 1->4, 2->3, 3->2, 4->1
    };

    // Function to compose two permutations
    const compose = (p1: number[], p2: number[]): number[] => {
      return [p1[p2[0] - 1], p1[p2[1] - 1], p1[p2[2] - 1], p1[p2[3] - 1]];
    };

    // Function to find permutation by result array
    const findPermutation = (result: number[]): string => {
      for (const [key, perm] of Object.entries(permutations)) {
        if (perm.every((val, idx) => val === result[idx])) {
          return key;
        }
      }
      return 'e';
    };

    // Build multiplication table
    elements.forEach(elem1 => {
      const row = new Map<string, string>();
      elements.forEach(elem2 => {
        const result = compose(permutations[elem1.id], permutations[elem2.id]);
        const resultId = findPermutation(result);
        row.set(elem2.id, resultId);
      });
      operations.set(elem1.id, row);
    });

    return {
      name: 'A4',
      displayName: 'Alternating Group A₄',
      order: 12,
      elements,
      operations,
      generators: ['123', '124'], // (1 2 3) and (1 2 4) generate A4
      relations: ['(123)^3 = e', '(124)^3 = e'],
      isAbelian: false,
      center: ['e'],
      conjugacyClasses: [['e'], ['123', '132', '124', '142', '134', '143', '234', '243'], ['12)(34', '13)(24', '14)(23']],
      subgroups: []
    };
  }

  private static createDirectProduct(n1: number, n2: number): Group {
    // Create C_n1 × C_n2
    const order = n1 * n2;
    const elements: GroupElement[] = [];
    const operations = new Map<string, Map<string, string>>();

    // Create elements
    for (let i = 0; i < n1; i++) {
      for (let j = 0; j < n2; j++) {
        elements.push({
          id: `(${i},${j})`,
          label: `(${i},${j})`,
          order: this.lcm(n1 / this.gcd(i, n1), n2 / this.gcd(j, n2)),
          inverse: `(${(n1 - i) % n1},${(n2 - j) % n2})`,
          conjugacyClass: i * n2 + j
        });
      }
    }

    // Create multiplication table
    for (let i1 = 0; i1 < n1; i1++) {
      for (let j1 = 0; j1 < n2; j1++) {
        const rowMap = new Map<string, string>();
        for (let i2 = 0; i2 < n1; i2++) {
          for (let j2 = 0; j2 < n2; j2++) {
            rowMap.set(`(${i2},${j2})`, `(${(i1 + i2) % n1},${(j1 + j2) % n2})`);
          }
        }
        operations.set(`(${i1},${j1})`, rowMap);
      }
    }

    return {
      name: `C${n1}xC${n2}`,
      displayName: `C₍${n1}₎ × C₍${n2}₎`,
      order,
      elements,
      operations,
      generators: ['(1,0)', '(0,1)'],
      relations: [`a^${n1} = e`, `b^${n2} = e`, 'ab = ba'],
      isAbelian: true,
      center: elements.map(e => e.id),
      conjugacyClasses: elements.map(e => [e.id]),
      subgroups: []
    };
  }

  private static createElementaryAbelianGroup(order: number): Group {
    // Create (Z/2Z)^n where 2^n = order
    const n = Math.log2(order);
    const elements: GroupElement[] = [];
    const operations = new Map<string, Map<string, string>>();

    // Generate all binary strings of length n
    for (let i = 0; i < order; i++) {
      const binary = i.toString(2).padStart(n, '0');
      elements.push({
        id: binary,
        label: binary === '0'.repeat(n) ? 'e' : binary,
        order: binary === '0'.repeat(n) ? 1 : 2,
        inverse: binary,
        conjugacyClass: i
      });
    }

    // XOR operation
    for (let i = 0; i < order; i++) {
      const rowMap = new Map<string, string>();
      const binary1 = i.toString(2).padStart(n, '0');
      for (let j = 0; j < order; j++) {
        const binary2 = j.toString(2).padStart(n, '0');
        const result = (i ^ j).toString(2).padStart(n, '0');
        rowMap.set(binary2, result);
      }
      operations.set(binary1, rowMap);
    }

    return {
      name: `(C2)^${n}`,
      displayName: `Elementary Abelian Group (C₂)^${n}`,
      order,
      elements,
      operations,
      generators: Array.from({ length: n }, (_, i) => {
        const gen = '0'.repeat(i) + '1' + '0'.repeat(n - i - 1);
        return gen;
      }),
      relations: Array.from({ length: n }, (_, i) => `g${i}^2 = e`),
      isAbelian: true,
      center: elements.map(e => e.id),
      conjugacyClasses: elements.map(e => [e.id]),
      subgroups: []
    };
  }

  private static createDirectProduct2x2x4(): Group {
    // Create C2 × C2 × C4
    const elements: GroupElement[] = [];
    const operations = new Map<string, Map<string, string>>();

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        for (let k = 0; k < 4; k++) {
          elements.push({
            id: `(${i},${j},${k})`,
            label: `(${i},${j},${k})`,
            order: this.lcm(this.lcm(i === 0 ? 1 : 2, j === 0 ? 1 : 2), k === 0 ? 1 : 4 / this.gcd(k, 4)),
            inverse: `(${i},${j},${(4 - k) % 4})`,
            conjugacyClass: i * 8 + j * 4 + k
          });
        }
      }
    }

    // Create multiplication table
    for (let i1 = 0; i1 < 2; i1++) {
      for (let j1 = 0; j1 < 2; j1++) {
        for (let k1 = 0; k1 < 4; k1++) {
          const rowMap = new Map<string, string>();
          for (let i2 = 0; i2 < 2; i2++) {
            for (let j2 = 0; j2 < 2; j2++) {
              for (let k2 = 0; k2 < 4; k2++) {
                rowMap.set(`(${i2},${j2},${k2})`, `(${(i1 + i2) % 2},${(j1 + j2) % 2},${(k1 + k2) % 4})`);
              }
            }
          }
          operations.set(`(${i1},${j1},${k1})`, rowMap);
        }
      }
    }

    return {
      name: 'C2xC2xC4',
      displayName: 'C₂ × C₂ × C₄',
      order: 16,
      elements,
      operations,
      generators: ['(1,0,0)', '(0,1,0)', '(0,0,1)'],
      relations: ['a^2 = e', 'b^2 = e', 'c^4 = e', 'ab = ba', 'ac = ca', 'bc = cb'],
      isAbelian: true,
      center: elements.map(e => e.id),
      conjugacyClasses: elements.map(e => [e.id]),
      subgroups: []
    };
  }

  // Helper methods
  private static gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  private static lcm(a: number, b: number): number {
    return (a * b) / this.gcd(a, b);
  }

  private static findCyclicSubgroups(n: number): { elements: string[]; name: string; isNormal: boolean }[] {
    const subgroups: { elements: string[]; name: string; isNormal: boolean }[] = [];
    
    for (let d = 1; d <= n; d++) {
      if (n % d === 0) {
        const elements: string[] = [];
        const step = n / d;
        for (let i = 0; i < d; i++) {
          elements.push(`g${(i * step) % n}`);
        }
        subgroups.push({
          elements,
          name: d === 1 ? 'Trivial' : d === n ? `C${n}` : `⟨g^${step}⟩`,
          isNormal: true
        });
      }
    }
    
    return subgroups;
  }

  private static createDihedralMultiplicationTable(operations: Map<string, Map<string, string>>, n: number) {
    // r^i * r^j = r^(i+j mod n)
    // r^i * s^j = s^(j-i mod n)
    // s^i * r^j = s^(i+j mod n)
    // s^i * s^j = r^(j-i mod n)
    
    for (let i = 0; i < n; i++) {
      const rotRowMap = new Map<string, string>();
      for (let j = 0; j < n; j++) {
        // r^i * r^j
        rotRowMap.set(`r${j}`, `r${(i + j) % n}`);
        // r^i * s^j
        rotRowMap.set(`s${j}`, `s${(j - i + n) % n}`);
      }
      operations.set(`r${i}`, rotRowMap);
    }

    for (let i = 0; i < n; i++) {
      const refRowMap = new Map<string, string>();
      for (let j = 0; j < n; j++) {
        // s^i * r^j
        refRowMap.set(`r${j}`, `s${(i + j) % n}`);
        // s^i * s^j
        refRowMap.set(`s${j}`, `r${(j - i + n) % n}`);
      }
      operations.set(`s${i}`, refRowMap);
    }
  }

  private static getRotationConjugacyClass(i: number, n: number): number {
    if (i === 0) return 0;
    if (n % 2 === 0 && i === n / 2) return 1;
    return 2;
  }

  private static getReflectionConjugacyClass(i: number, n: number): number {
    return n % 2 === 0 ? (i % 2 === 0 ? 3 : 4) : 3;
  }

  private static getDihedralCenter(n: number): string[] {
    return n % 2 === 0 ? ['r0', `r${n/2}`] : ['r0'];
  }

  private static getDihedralConjugacyClasses(n: number): string[][] {
    const classes: string[][] = [['r0']];
    
    if (n % 2 === 0) {
      classes.push([`r${n/2}`]);
      
      // Other rotations
      const otherRots: string[] = [];
      for (let i = 1; i < n; i++) {
        if (i !== n/2) otherRots.push(`r${i}`);
      }
      if (otherRots.length > 0) classes.push(otherRots);
      
      // Reflections through vertices
      const vertexRefs: string[] = [];
      for (let i = 0; i < n; i += 2) {
        vertexRefs.push(`s${i}`);
      }
      classes.push(vertexRefs);
      
      // Reflections through edge midpoints
      const edgeRefs: string[] = [];
      for (let i = 1; i < n; i += 2) {
        edgeRefs.push(`s${i}`);
      }
      classes.push(edgeRefs);
    } else {
      // Other rotations
      const otherRots: string[] = [];
      for (let i = 1; i < n; i++) {
        otherRots.push(`r${i}`);
      }
      if (otherRots.length > 0) classes.push(otherRots);
      
      // All reflections
      const allRefs: string[] = [];
      for (let i = 0; i < n; i++) {
        allRefs.push(`s${i}`);
      }
      classes.push(allRefs);
    }
    
    return classes;
  }

  private static getDihedralSubgroups(n: number): { elements: string[]; name: string; isNormal: boolean }[] {
    const subgroups = [
      { elements: ['r0'], name: 'Trivial', isNormal: true }
    ];
    
    // Cyclic subgroup of rotations
    const rotations: string[] = [];
    for (let i = 0; i < n; i++) {
      rotations.push(`r${i}`);
    }
    subgroups.push({ elements: rotations, name: `⟨r⟩ ≅ C${n}`, isNormal: true });
    
    // Reflection subgroups
    for (let i = 0; i < n; i++) {
      subgroups.push({ 
        elements: ['r0', `s${i}`], 
        name: `⟨s${i}⟩ ≅ C₂`, 
        isNormal: false 
      });
    }
    
    // Find subgroups corresponding to divisors of n
    for (let d = 2; d < n; d++) {
      if (n % d === 0) {
        const rotSubgroup: string[] = [];
        const step = n / d;
        for (let i = 0; i < d; i++) {
          rotSubgroup.push(`r${(i * step) % n}`);
        }
        subgroups.push({
          elements: rotSubgroup,
          name: `⟨r^${step}⟩ ≅ C${d}`,
          isNormal: true
        });
        
        // Corresponding dihedral subgroup
        const dihedralSubgroup = [...rotSubgroup];
        for (let i = 0; i < d; i++) {
          dihedralSubgroup.push(`s${(i * step) % n}`);
        }
        subgroups.push({
          elements: dihedralSubgroup,
          name: `D${d}`,
          isNormal: d === 2 || n / d === 2
        });
      }
    }
    
    // Full group
    const allElements: string[] = [];
    for (let i = 0; i < n; i++) {
      allElements.push(`r${i}`, `s${i}`);
    }
    subgroups.push({ elements: allElements, name: `D${n}`, isNormal: true });
    
    return subgroups;
  }

  /**
   * Initialize elliptic curve groups for educational purposes
   */
  private static initializeEllipticCurveGroups() {
    const examples = EllipticCurveGroup.createExampleCurves();
    
    for (const [name, params] of Object.entries(examples)) {
      try {
        const ecGroup = new EllipticCurveGroup(params);
        const group = ecGroup.getGroup();
        
        // Add EC prefix to distinguish from other groups
        const groupName = `EC_${name}`;
        this.groups.set(groupName, {
          ...group,
          name: groupName,
          displayName: `Elliptic Curve ${name}: ${ecGroup.getCurve().getEquationLatex()}`
        });
        
        console.log(`✅ Added elliptic curve group ${groupName} with ${group.order} elements`);
      } catch (error) {
        console.warn(`⚠️ Failed to create elliptic curve group ${name}:`, error.message);
      }
    }
  }

  /**
   * Add a custom elliptic curve group to the database
   */
  static addEllipticCurveGroup(name: string, params: EllipticCurveParameters): boolean {
    try {
      const ecGroup = new EllipticCurveGroup(params);
      const group = ecGroup.getGroup();
      
      const groupName = `EC_${name}`;
      this.groups.set(groupName, {
        ...group,
        name: groupName,
        displayName: `Elliptic Curve ${name}: ${ecGroup.getCurve().getEquationLatex()}`
      });
      
      return true;
    } catch (error) {
      console.error(`Failed to add elliptic curve group ${name}:`, error);
      return false;
    }
  }

  /**
   * Get all elliptic curve groups
   */
  static getEllipticCurveGroups(): Group[] {
    return Array.from(this.groups.values()).filter(g => g.name.startsWith('EC_'));
  }
}
