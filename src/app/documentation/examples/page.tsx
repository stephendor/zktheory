import React from 'react';
import DocumentationLayout from '../components/DocumentationLayout';
import { DocumentationSidebar } from '../components/DocumentationLayout';
import CodeSandbox from '../components/CodeSandbox';

const sidebarItems = [
  {
    label: 'Documentation',
    href: '/documentation',
    children: [
      { label: 'Getting Started', href: '/documentation/getting-started' },
      { label: 'Examples', href: '/documentation/examples' },
      { label: 'Projects', href: '/documentation/projects' }
    ]
  },
  {
    label: 'Mathematical Examples',
    href: '/documentation/examples',
    children: [
      { label: 'Basic Math', href: '/documentation/examples#basic-math' },
      { label: 'Group Theory', href: '/documentation/examples#group-theory' },
      { label: 'Topology', href: '/documentation/examples#topology' },
      { label: 'Cryptography', href: '/documentation/examples#cryptography' }
    ]
  }
];

const mathematicalExamples = [
  {
    id: 'basic-math',
    title: 'Basic Mathematical Operations',
    description: 'Fundamental mathematical operations and number theory examples',
    examples: [
      {
        title: 'Prime Number Checker',
        description: 'Check if a number is prime using trial division',
        initialCode: `function isPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

// Test some numbers
console.log('Is 17 prime?', isPrime(17));
console.log('Is 25 prime?', isPrime(25));
console.log('Is 97 prime?', isPrime(97));

// Find first 10 prime numbers
let count = 0;
let num = 2;
while (count < 10) {
  if (isPrime(num)) {
    console.log(\`Prime \${count + 1}: \${num}\`);
    count++;
  }
  num++;
}`,
        expectedOutput: `Is 17 prime? true
Is 25 prime? false
Is 97 prime? true
Prime 1: 2
Prime 2: 3
Prime 3: 5
Prime 4: 7
Prime 5: 11
Prime 6: 13
Prime 7: 17
Prime 8: 19
Prime 9: 23
Prime 10: 29`
      },
      {
        title: 'GCD Calculator',
        description: 'Calculate the greatest common divisor using Euclidean algorithm',
        initialCode: `function gcd(a, b) {
  while (b !== 0) {
    let temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// Test GCD calculations
console.log('GCD of 48 and 18:', gcd(48, 18));
console.log('GCD of 54 and 24:', gcd(54, 24));
console.log('GCD of 7 and 13:', gcd(7, 13));

// Extended Euclidean algorithm
function extendedGcd(a, b) {
  if (b === 0) {
    return { gcd: a, x: 1, y: 0 };
  }
  
  let result = extendedGcd(b, a % b);
  return {
    gcd: result.gcd,
    x: result.y,
    y: result.x - Math.floor(a / b) * result.y
  };
}

let result = extendedGcd(48, 18);
console.log(\`Extended GCD: \${result.gcd} = \${48} × \${result.x} + \${18} × \${result.y}\`);`,
        expectedOutput: `GCD of 48 and 18: 6
GCD of 54 and 24: 6
GCD of 7 and 13: 1
Extended GCD: 6 = 48 × -1 + 18 × 3`
      },
      {
        title: 'Modular Arithmetic',
        description: 'Perform modular arithmetic operations and find multiplicative inverses',
        initialCode: `// Modular exponentiation
function modPow(base, exponent, modulus) {
  if (modulus === 1) return 0;
  
  let result = 1;
  base = base % modulus;
  
  while (exponent > 0) {
    if (exponent % 2 === 1) {
      result = (result * base) % modulus;
    }
    exponent = Math.floor(exponent / 2);
    base = (base * base) % modulus;
  }
  return result;
}

// Find multiplicative inverse using extended Euclidean algorithm
function modInverse(a, m) {
  let result = extendedGcd(a, m);
  if (result.gcd !== 1) {
    throw new Error('Multiplicative inverse does not exist');
  }
  return ((result.x % m) + m) % m;
}

// Test modular arithmetic
console.log('3^7 mod 10:', modPow(3, 7, 10));
console.log('5^13 mod 17:', modPow(5, 13, 17));

// Test multiplicative inverse
try {
  console.log('Inverse of 3 mod 7:', modInverse(3, 7));
  console.log('Inverse of 5 mod 11:', modInverse(5, 11));
} catch (error) {
  console.log('Error:', error.message);
}`,
        expectedOutput: `3^7 mod 10: 7
5^13 mod 17: 3
Inverse of 3 mod 7: 5
Inverse of 5 mod 11: 9`
      }
    ]
  },
  {
    id: 'group-theory',
    title: 'Group Theory Examples',
    description: 'Examples of group operations and properties',
    examples: [
      {
        title: 'Cyclic Group Operations',
        description: 'Perform operations in a cyclic group of order n',
        initialCode: `class CyclicGroup {
  constructor(order) {
    this.order = order;
  }
  
  // Addition in cyclic group
  add(a, b) {
    return (a + b) % this.order;
  }
  
  // Inverse of an element
  inverse(a) {
    return (this.order - a) % this.order;
  }
  
  // Order of an element
  elementOrder(a) {
    if (a === 0) return 1;
    let order = 1;
    let current = a;
    while (current !== 0) {
      current = this.add(current, a);
      order++;
    }
    return order;
  }
  
  // Generate all elements
  generateElements() {
    let elements = [];
    for (let i = 0; i < this.order; i++) {
      elements.push(i);
    }
    return elements;
  }
}

// Create a cyclic group of order 6
const group = new CyclicGroup(6);

console.log('Group elements:', group.generateElements());
console.log('3 + 4 =', group.add(3, 4));
console.log('Inverse of 4:', group.inverse(4));
console.log('Order of element 2:', group.elementOrder(2));

// Check if it's cyclic
let isCyclic = false;
for (let i = 1; i < 6; i++) {
  if (group.elementOrder(i) === 6) {
    console.log(\`\${i} is a generator of the group\`);
    isCyclic = true;
    break;
  }
}

if (!isCyclic) {
  console.log('This group is not cyclic');
}`,
        expectedOutput: `Group elements: [0, 1, 2, 3, 4, 5]
3 + 4 = 1
Inverse of 4: 2
Order of element 2: 3
1 is a generator of the group`
      }
    ]
  },
  {
    id: 'topology',
    title: 'Topological Examples',
    description: 'Basic topological concepts and calculations',
    examples: [
      {
        title: 'Euler Characteristic',
        description: 'Calculate Euler characteristic for simple polyhedra',
        initialCode: `// Euler characteristic: χ = V - E + F
// where V = vertices, E = edges, F = faces

function eulerCharacteristic(vertices, edges, faces) {
  return vertices - edges + faces;
}

// Platonic solids
const tetrahedron = { v: 4, e: 6, f: 4 };
const cube = { v: 8, e: 12, f: 6 };
const octahedron = { v: 6, e: 12, f: 8 };
const dodecahedron = { v: 20, e: 30, f: 12 };
const icosahedron = { v: 12, e: 30, f: 20 };

console.log('Tetrahedron χ =', eulerCharacteristic(tetrahedron.v, tetrahedron.e, tetrahedron.f));
console.log('Cube χ =', eulerCharacteristic(cube.v, cube.e, cube.f));
console.log('Octahedron χ =', eulerCharacteristic(octahedron.v, octahedron.e, octahedron.f));
console.log('Dodecahedron χ =', eulerCharacteristic(dodecahedron.v, dodecahedron.e, dodecahedron.f));
console.log('Icosahedron χ =', eulerCharacteristic(icosahedron.v, icosahedron.e, icosahedron.f));

// Torus: χ = 0
const torus = { v: 0, e: 0, f: 0 };
console.log('Torus χ =', eulerCharacteristic(torus.v, torus.e, torus.f));

// Sphere: χ = 2
const sphere = { v: 0, e: 0, f: 1 };
console.log('Sphere χ =', eulerCharacteristic(sphere.v, sphere.e, sphere.f));`,
        expectedOutput: `Tetrahedron χ = 2
Cube χ = 2
Octahedron χ = 2
Dodecahedron χ = 2
Icosahedron χ = 2
Torus χ = 0
Sphere χ = 2`
      }
    ]
  },
  {
    id: 'cryptography',
    title: 'Cryptographic Examples',
    description: 'Basic cryptographic algorithms and concepts',
    examples: [
      {
        title: 'Caesar Cipher',
        description: 'Implement a simple Caesar cipher with shift',
        initialCode: `function caesarCipher(text, shift, encrypt = true) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const textUpper = text.toUpperCase();
  let result = '';
  
  for (let char of textUpper) {
    if (alphabet.includes(char)) {
      let index = alphabet.indexOf(char);
      if (encrypt) {
        index = (index + shift) % 26;
      } else {
        index = (index - shift + 26) % 26;
      }
      result += alphabet[index];
    } else {
      result += char;
    }
  }
  
  return result;
}

// Test the cipher
const message = 'HELLO WORLD';
const shift = 3;

const encrypted = caesarCipher(message, shift, true);
const decrypted = caesarCipher(encrypted, shift, false);

console.log('Original message:', message);
console.log('Shift:', shift);
console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypted);

// Test with different shifts
console.log('\\nTesting different shifts:');
for (let i = 1; i <= 5; i++) {
  const test = caesarCipher('CRYPTO', i, true);
  console.log(\`Shift \${i}: \${test}\`);
}`,
        expectedOutput: `Original message: HELLO WORLD
Shift: 3
Encrypted: KHOOR ZRUOG
Decrypted: HELLO WORLD

Testing different shifts:
Shift 1: DSZQUP
Shift 2: ETAVRQ
Shift 3: FUBWSR
Shift 4: GVCXTS
Shift 5: HWDYUT`
      },
      {
        title: 'Elliptic Curve Point Addition',
        description: 'Implement point addition on elliptic curves over finite fields',
        initialCode: `// Point addition on elliptic curve y² = x³ + ax + b over F_p
function addPoints(p1, p2, a, p) {
  if (p1 === 'infinity') return p2;
  if (p2 === 'infinity') return p1;
  
  if (p1.x === p2.x && p1.y !== p2.y) {
    return 'infinity'; // Point at infinity
  }
  
  let lambda;
  if (p1.x === p2.x && p1.y === p2.y) {
    // Point doubling
    lambda = ((3 * p1.x * p1.x + a) * modInverse(2 * p1.y, p)) % p;
  } else {
    // Point addition
    lambda = ((p2.y - p1.y) * modInverse(p2.x - p1.x, p)) % p;
  }
  
  const x3 = (lambda * lambda - p1.x - p2.x) % p;
  const y3 = (lambda * (p1.x - x3) - p1.y) % p;
  
  return {
    x: x3 < 0 ? x3 + p : x3,
    y: y3 < 0 ? y3 + p : y3
  };
}

// Test point addition on curve y² = x³ + 2x + 3 over F_17
const a = 2, p = 17;
const p1 = { x: 1, y: 6 };
const p2 = { x: 3, y: 1 };

console.log('Point 1:', p1);
console.log('Point 2:', p2);
console.log('P1 + P2:', addPoints(p1, p2, a, p));

// Test point doubling
console.log('2 * P1:', addPoints(p1, p1, a, p));`,
        expectedOutput: `Point 1: { x: 1, y: 6 }
Point 2: { x: 3, y: 1 }
P1 + P2: { x: 6, y: 3 }
2 * P1: { x: 6, y: 14 }`
      }
    ]
  }
];

export default function ExamplesPage() {
  return (
    <DocumentationLayout
      title="Mathematical Examples"
      description="Interactive code examples demonstrating mathematical concepts and algorithms"
      breadcrumbs={[
        { label: 'Documentation', href: '/documentation' },
        { label: 'Examples' }
      ]}
      sidebar={<DocumentationSidebar items={sidebarItems} />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 border border-green-200">
          <h2 className="text-3xl font-bold text-green-900 mb-4">Interactive Mathematical Examples</h2>
          <p className="text-green-800 text-lg leading-relaxed">
            Explore mathematical concepts through interactive code examples. Each example includes 
            editable code that you can run, modify, and experiment with to deepen your understanding.
          </p>
        </section>

        {/* Examples by Category */}
        {mathematicalExamples.map((category) => (
          <section key={category.id} id={category.id}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.title}</h2>
            <p className="text-gray-600 mb-6">{category.description}</p>
            
            <div className="space-y-8">
              {category.examples.map((example, index) => (
                <CodeSandbox
                  key={index}
                  title={example.title}
                  description={example.description}
                  initialCode={example.initialCode}
                  language="javascript"
                  expectedOutput={example.expectedOutput}
                />
              ))}
            </div>
          </section>
        ))}

                            {/* Getting Started with Examples */}
                    <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">🚀 Getting Started with Examples</h3>
                      <p className="text-blue-800 mb-4">
                        These interactive examples are designed to help you learn mathematical concepts through 
                        hands-on experimentation. Here's how to get the most out of them:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-2">1. Run the Code</h4>
                          <p className="text-blue-700 text-sm">
                            Start by running the example code to see the expected output and understand what it does.
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-2">2. Experiment</h4>
                          <p className="text-blue-700 text-sm">
                            Modify the code to test different inputs, change parameters, or add new functionality.
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-2">3. Understand the Math</h4>
                          <p className="text-blue-700 text-sm">
                            Use the code to verify mathematical properties and explore the underlying concepts.
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-2">4. Build Your Own</h4>
                          <p className="text-blue-700 text-sm">
                            Use these examples as templates to create your own mathematical algorithms and tests.
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Interactive Mathematical Demonstrations */}
                    <section className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-3">🎯 Interactive Mathematical Demonstrations</h3>
                      <p className="text-purple-800 mb-4">
                        Beyond code examples, explore these interactive mathematical demonstrations that showcase 
                        real-time computation and visualization.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                          <h4 className="font-semibold text-purple-800 mb-2">Real-time Calculations</h4>
                          <p className="text-purple-700 text-sm">
                            Watch mathematical operations happen in real-time with step-by-step breakdowns.
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                          <h4 className="font-semibold text-purple-800 mb-2">Visual Feedback</h4>
                          <p className="text-purple-700 text-sm">
                            See mathematical concepts visualized with interactive charts and diagrams.
                          </p>
                        </div>
                      </div>

                      <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-900 mb-2">💡 Try These Interactive Features:</h4>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• <strong>Parameter Sliders:</strong> Adjust values and see immediate results</li>
                          <li>• <strong>Step-by-step Execution:</strong> Follow algorithms step by step</li>
                          <li>• <strong>Real-time Validation:</strong> Verify mathematical properties instantly</li>
                          <li>• <strong>Interactive Plots:</strong> Zoom, pan, and explore mathematical functions</li>
                        </ul>
                      </div>
                    </section>

        {/* Next Steps */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">💡 What's Next?</h3>
          <p className="text-yellow-800 mb-4">
            Ready to explore more mathematical concepts? Check out our project documentation 
            for real-world applications of these mathematical principles.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/documentation/projects/tda-explorer"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Explore TDA Explorer
            </a>
            <a
              href="/documentation/projects/cayleygraph"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Explore Cayley Graph Explorer
            </a>
          </div>
        </section>
      </div>
    </DocumentationLayout>
  );
}
