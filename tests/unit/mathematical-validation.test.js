/**
 * Mathematical Content Validation Test Suite
 * Comprehensive testing for mathematical accuracy and consistency
 */

const { MathematicalValidator } = require('../utils/MathematicalValidator');

describe('Mathematical Content Validation Framework', () => {
    let validator;

    beforeEach(() => {
        validator = new MathematicalValidator();
    });

    afterEach(() => {
        validator.clearResults();
    });

    describe('Mathematical Computation Accuracy', () => {
        test('validates basic mathematical constants', () => {
            // Test fundamental mathematical constants
            expect(validator.validateComputationAccuracy('pi', Math.PI, 3.141592653589793)).toBe(true);
            expect(validator.validateComputationAccuracy('e', Math.E, 2.718281828459045)).toBe(true);
            expect(validator.validateComputationAccuracy('golden_ratio', (1 + Math.sqrt(5)) / 2, 1.618033988749895)).toBe(true);
            expect(validator.validateComputationAccuracy('sqrt_2', Math.sqrt(2), 1.4142135623730951)).toBe(true);
        });

        test('validates trigonometric computations', () => {
            const testCases = [
                { name: 'sin_pi_2', computed: Math.sin(Math.PI / 2), expected: 1 },
                { name: 'cos_pi', computed: Math.cos(Math.PI), expected: -1 },
                { name: 'tan_pi_4', computed: Math.tan(Math.PI / 4), expected: 1 },
                { name: 'sin_0', computed: Math.sin(0), expected: 0 }
            ];

            testCases.forEach(({ name, computed, expected }) => {
                expect(validator.validateComputationAccuracy(name, computed, expected, 1e-10)).toBe(true);
            });
        });

        test('validates logarithmic and exponential computations', () => {
            const testCases = [
                { name: 'ln_e', computed: Math.log(Math.E), expected: 1 },
                { name: 'log10_100', computed: Math.log10(100), expected: 2 },
                { name: 'exp_1', computed: Math.exp(1), expected: Math.E },
                { name: 'exp_0', computed: Math.exp(0), expected: 1 }
            ];

            testCases.forEach(({ name, computed, expected }) => {
                expect(validator.validateComputationAccuracy(name, computed, expected, 1e-10)).toBe(true);
            });
        });

        test('validates complex mathematical expressions', () => {
            // Test Euler's identity: e^(iπ) + 1 = 0
            const complex_result = Math.exp(1) ** (Math.PI * Math.sqrt(-1)); // Simplified for real computation
            const euler_approximation = Math.cos(Math.PI) + 1; // Real part of e^(iπ) + 1

            expect(validator.validateComputationAccuracy('euler_identity', euler_approximation, 0, 1e-10)).toBe(true);
        });
    });

    describe('LaTeX Mathematical Notation Validation', () => {
        test('validates basic LaTeX syntax', () => {
            const validLatex = [
                '\\sum_{i=1}^{n} x_i',
                '\\int_{-\\infty}^{\\infty} e^{-x^2} dx',
                '\\frac{\\partial^2 u}{\\partial t^2}',
                '\\alpha + \\beta = \\gamma'
            ];

            validLatex.forEach((latex) => {
                const result = validator.validateLatexRendering(latex, { elements: [latex], rendered: true });
                expect(result.syntaxValid).toBe(true);
                expect(result.mathematicalAccuracy).toBe(true);
            });
        });

        test('detects invalid LaTeX syntax', () => {
            const invalidLatex = [
                '\\sum_{i=1^{n} x_i', // Missing closing brace
                '\\int_{-\\infty}^{\\infty e^{-x^2} dx', // Missing closing brace
                '\\frac{\\partial^2 u{\\partial t^2}', // Missing opening brace
                '\\invalid{command}' // Invalid command
            ];

            invalidLatex.forEach((latex) => {
                const result = validator.validateLatexRendering(latex, { elements: [], rendered: false });
                expect(result.syntaxValid).toBe(false);
            });
        });

        test('validates complex mathematical expressions', () => {
            const complexExpressions = [
                '\\mathbb{H}_*(X; \\mathbb{F}_2) \\cong \\text{Tor}_{\\mathbb{Z}}(H_*(X), \\mathbb{F}_2)',
                '\\lim_{n \\to \\infty} \\sum_{k=1}^{n} \\frac{1}{k^2} = \\frac{\\pi^2}{6}',
                '\\nabla \\times \\vec{F} = \\left(\\frac{\\partial R}{\\partial y} - \\frac{\\partial Q}{\\partial z}\\right)\\hat{i}',
                '\\oint_{\\gamma} f(z) dz = 2\\pi i \\sum_{k} \\text{Res}(f, a_k)'
            ];

            complexExpressions.forEach((latex) => {
                const result = validator.validateLatexRendering(latex, {
                    elements: latex.match(/\\[a-zA-Z]+/g) || [],
                    rendered: true
                });
                expect(result.syntaxValid).toBe(true);
                expect(result.mathematicalAccuracy).toBe(true);
            });
        });
    });

    describe('Group Theory Validation', () => {
        test('validates group identity element', () => {
            // Mock cyclic group Z_4
            const mockGroup = {
                elements: [0, 1, 2, 3],
                multiply: (a, b) => (a + b) % 4
            };

            const rule = validator.validationRules.get('group_identity');
            expect(rule.test(mockGroup, 0)).toBe(true); // 0 is identity
            expect(rule.test(mockGroup, 1)).toBe(false); // 1 is not identity
        });

        test('validates group associativity', () => {
            // Mock cyclic group Z_4
            const mockGroup = {
                elements: [0, 1, 2, 3],
                multiply: (a, b) => (a + b) % 4
            };

            const rule = validator.validationRules.get('group_associativity');
            expect(rule.test(mockGroup)).toBe(true);

            // Mock non-associative structure
            const nonAssociativeGroup = {
                elements: [0, 1, 2],
                multiply: (a, b) => (a * b + 1) % 3 // Non-associative operation
            };

            expect(rule.test(nonAssociativeGroup)).toBe(false);
        });
    });

    describe('Topological Data Analysis Validation', () => {
        test('validates persistence diagrams', () => {
            const validDiagram = [
                [0, 0.5],
                [0.1, 0.8],
                [0.2, 1.0],
                [0.3, Infinity] // Essential class
            ];

            const rule = validator.validationRules.get('persistence_diagram_validity');
            expect(rule.test(validDiagram)).toBe(true);

            const invalidDiagram = [
                [0.5, 0.1], // Death before birth
                [0.1, 0.8],
                [-0.1, 0.5] // Negative birth time
            ];

            expect(rule.test(invalidDiagram)).toBe(false);
        });

        test('validates Betti numbers consistency', () => {
            const validBettiNumbers = [1, 0, 1]; // Sphere S^2
            const rule = validator.validationRules.get('betti_numbers_consistency');
            expect(rule.test(validBettiNumbers)).toBe(true);

            const anotherValidCase = [1, 2, 1]; // Torus T^2
            expect(rule.test(anotherValidCase)).toBe(true);
        });
    });

    describe('Elliptic Curve Validation', () => {
        test('validates points on elliptic curves', () => {
            // secp256k1 curve: y² = x³ + 7 (mod p)
            const curve = {
                a: 0n,
                b: 7n,
                p: BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f')
            };

            // Generator point on secp256k1
            const validPoint = {
                x: BigInt('0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'),
                y: BigInt('0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8')
            };

            const rule = validator.validationRules.get('elliptic_curve_point_validity');
            expect(rule.test(validPoint, curve)).toBe(true);

            // Invalid point
            const invalidPoint = {
                x: 1n,
                y: 1n
            };

            expect(rule.test(invalidPoint, curve)).toBe(false);
        });
    });

    describe('Graph Visualization Validation', () => {
        test('validates vertex and edge preservation', () => {
            const graphData = {
                vertices: [
                    { id: 0, label: 'A' },
                    { id: 1, label: 'B' },
                    { id: 2, label: 'C' }
                ],
                edges: [
                    { source: 0, target: 1 },
                    { source: 1, target: 2 },
                    { source: 2, target: 0 }
                ]
            };

            const visualizationOutput = {
                renderedVertices: 3,
                renderedEdges: 3,
                positions: [
                    [0, 0],
                    [1, 0],
                    [0.5, 1]
                ],
                adjacencyInfo: [
                    { source: 0, target: 1 },
                    { source: 1, target: 2 },
                    { source: 2, target: 0 }
                ]
            };

            const validation = validator.validateGraphVisualization(graphData, visualizationOutput);
            expect(validation.vertexCount).toBe(true);
            expect(validation.edgeCount).toBe(true);
            expect(validation.coordinatesValid).toBe(true);
            expect(validation.connectivityPreserved).toBe(true);
        });

        test('detects coordinate system errors', () => {
            const graphData = {
                vertices: [{ id: 0 }, { id: 1 }],
                edges: [{ source: 0, target: 1 }]
            };

            const invalidVisualization = {
                renderedVertices: 2,
                renderedEdges: 1,
                positions: [
                    [NaN, 0], // Invalid coordinate
                    [1, undefined] // Invalid coordinate
                ]
            };

            const validation = validator.validateGraphVisualization(graphData, invalidVisualization);
            expect(validation.coordinatesValid).toBe(false);
        });
    });

    describe('Mathematical Proof Validation', () => {
        test('validates proof logical structure', () => {
            const validProof = {
                name: 'Pythagorean Theorem',
                steps: [
                    {
                        type: 'hypothesis',
                        statement: 'Let ABC be a right triangle with right angle at C',
                        justification: 'Given'
                    },
                    {
                        type: 'step',
                        statement: 'Area of square on hypotenuse equals sum of areas of squares on other sides',
                        justification: 'Geometric construction'
                    },
                    {
                        type: 'conclusion',
                        statement: 'a² + b² = c²',
                        justification: 'QED'
                    }
                ],
                conclusion: 'a² + b² = c²'
            };

            const validation = validator.validateMathematicalProof(validProof);
            expect(validation.logicalStructure).toBe(true);
            expect(validation.mathematicalSteps).toBe(true);
            expect(validation.conclusion).toBe(true);
        });

        test('detects invalid proof structure', () => {
            const invalidProof = {
                name: 'Invalid Proof',
                steps: [
                    {
                        type: 'step',
                        statement: '', // Empty statement
                        justification: 'Invalid'
                    }
                ],
                conclusion: 'Invalid conclusion'
            };

            const validation = validator.validateMathematicalProof(invalidProof);
            expect(validation.logicalStructure).toBe(false);
            expect(validation.mathematicalSteps).toBe(false);
        });
    });

    describe('Test Suite Execution', () => {
        test('runs comprehensive mathematical test suite', () => {
            const testSuite = {
                name: 'Comprehensive Mathematical Validation',
                tests: [
                    {
                        name: 'Pi accuracy test',
                        type: 'computation_accuracy',
                        data: Math.PI,
                        expected: 3.141592653589793,
                        validator: function (data, expected) {
                            return this.validateComputationAccuracy('pi_test', data, expected);
                        }
                    },
                    {
                        name: 'LaTeX syntax test',
                        type: 'latex_rendering',
                        data: '\\sum_{i=1}^{n} x_i^2',
                        expected: { elements: ['\\sum', '\\x_i'], rendered: true },
                        validator: function (data, expected) {
                            const result = this.validateLatexRendering(data, expected);
                            return result.syntaxValid && result.mathematicalAccuracy;
                        }
                    }
                ]
            };

            const results = validator.runTestSuite(testSuite);
            expect(results.summary.total).toBe(2);
            expect(results.summary.passed).toBeGreaterThan(0);
            expect(results.tests).toHaveLength(2);
        });
    });

    describe('Validation Reporting', () => {
        test('generates comprehensive validation report', () => {
            // Run some validations first
            validator.validateComputationAccuracy('test_pi', Math.PI, 3.141592653589793);
            validator.validateLatexRendering('\\alpha + \\beta', { elements: ['\\alpha', '\\beta'], rendered: true });

            const report = validator.generateValidationReport();

            expect(report).toHaveProperty('timestamp');
            expect(report).toHaveProperty('totalValidations');
            expect(report).toHaveProperty('summary');
            expect(report).toHaveProperty('details');
            expect(report.totalValidations).toBeGreaterThan(0);
        });

        test('saves validation report to file', () => {
            validator.validateComputationAccuracy('test_save', 1, 1);

            const report = validator.generateValidationReport();
            const reportPath = validator.saveValidationReport(report, 'test-validation-report.json');

            expect(reportPath).toContain('test-validation-report.json');
        });
    });
});
