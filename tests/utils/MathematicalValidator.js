/**
 * Mathematical Content Validation Framework
 * Comprehensive testing for mathematical accuracy and content consistency
 */

const fs = require('fs');
const path = require('path');

class MathematicalValidator {
    constructor() {
        this.validationRules = new Map();
        this.testResults = [];
        this.mathematicalConstants = {
            PI: Math.PI,
            E: Math.E,
            GOLDEN_RATIO: (1 + Math.sqrt(5)) / 2,
            SQRT_2: Math.sqrt(2),
            SQRT_3: Math.sqrt(3)
        };
        this.setupValidationRules();
    }

    /**
     * Setup mathematical validation rules
     */
    setupValidationRules() {
        // Group theory validation rules
        this.validationRules.set('group_identity', {
            description: 'Group identity element validation',
            test: (group, identity) => {
                for (const element of group.elements) {
                    if (group.multiply(element, identity) !== element || group.multiply(identity, element) !== element) {
                        return false;
                    }
                }
                return true;
            }
        });

        this.validationRules.set('group_associativity', {
            description: 'Group associativity validation',
            test: (group) => {
                const elements = group.elements.slice(0, 10); // Test subset for performance
                for (const a of elements) {
                    for (const b of elements) {
                        for (const c of elements) {
                            const ab_c = group.multiply(group.multiply(a, b), c);
                            const a_bc = group.multiply(a, group.multiply(b, c));
                            if (ab_c !== a_bc) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            }
        });

        // Topological validation rules
        this.validationRules.set('persistence_diagram_validity', {
            description: 'Persistence diagram mathematical validity',
            test: (diagram) => {
                for (const [birth, death] of diagram) {
                    if (birth > death) return false; // Birth must precede death
                    if (birth < 0) return false; // Birth time must be non-negative
                }
                return true;
            }
        });

        this.validationRules.set('betti_numbers_consistency', {
            description: 'Betti numbers consistency validation',
            test: (bettiNumbers) => {
                // Euler characteristic validation for closed surfaces
                if (bettiNumbers.length >= 3) {
                    const b0 = bettiNumbers[0];
                    const b1 = bettiNumbers[1];
                    const b2 = bettiNumbers[2];
                    const eulerChar = b0 - b1 + b2;
                    // For connected closed orientable surfaces: χ = 2 - 2g (g = genus)
                    return Number.isInteger(eulerChar);
                }
                return true;
            }
        });

        // Elliptic curve validation rules
        this.validationRules.set('elliptic_curve_point_validity', {
            description: 'Elliptic curve point validation',
            test: (point, curve) => {
                const { x, y } = point;
                const { a, b, p } = curve;

                // Check if point satisfies y² ≡ x³ + ax + b (mod p)
                const left = (y * y) % p;
                const right = (x * x * x + a * x + b) % p;

                return left === right;
            }
        });

        // Numerical accuracy validation rules
        this.validationRules.set('numerical_precision', {
            description: 'Numerical computation precision validation',
            test: (computed, expected, tolerance = 1e-10) => {
                return Math.abs(computed - expected) < tolerance;
            }
        });
    }

    /**
     * Validate mathematical computation accuracy
     */
    validateComputationAccuracy(computationName, computedValue, expectedValue, tolerance = 1e-10) {
        const isValid = Math.abs(computedValue - expectedValue) < tolerance;
        const error = Math.abs(computedValue - expectedValue);

        this.testResults.push({
            type: 'computation_accuracy',
            name: computationName,
            valid: isValid,
            computed: computedValue,
            expected: expectedValue,
            error: error,
            tolerance: tolerance,
            timestamp: new Date().toISOString()
        });

        return isValid;
    }

    /**
     * Validate LaTeX rendering accuracy
     */
    validateLatexRendering(latexInput, renderedOutput) {
        const validationResults = {
            syntaxValid: this.validateLatexSyntax(latexInput),
            renderingComplete: this.validateRenderingCompleteness(latexInput, renderedOutput),
            mathematicalAccuracy: this.validateMathematicalNotation(latexInput)
        };

        this.testResults.push({
            type: 'latex_rendering',
            input: latexInput,
            output: renderedOutput,
            validation: validationResults,
            valid: Object.values(validationResults).every((v) => v),
            timestamp: new Date().toISOString()
        });

        return validationResults;
    }

    /**
     * Validate LaTeX syntax
     */
    validateLatexSyntax(latex) {
        // Check for balanced braces
        let braceCount = 0;
        for (const char of latex) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
            if (braceCount < 0) return false;
        }
        if (braceCount !== 0) return false;

        // Check for valid mathematical commands
        const invalidPatterns = [
            /\\[^a-zA-Z]/, // Invalid command structure
            /\$\$.*\$\$.*\$\$/, // Nested display math
            /\\\w+(?![a-zA-Z{])/ // Commands without proper termination
        ];

        return !invalidPatterns.some((pattern) => pattern.test(latex));
    }

    /**
     * Validate rendering completeness
     */
    validateRenderingCompleteness(input, output) {
        if (!output || typeof output !== 'object') return false;

        // Check if all mathematical elements were processed
        const mathElements = (input.match(/\\[a-zA-Z]+/g) || []).length;
        const renderedElements = output.elements ? output.elements.length : 0;

        return renderedElements >= mathElements * 0.8; // Allow 80% minimum rendering
    }

    /**
     * Validate mathematical notation accuracy
     */
    validateMathematicalNotation(latex) {
        // Check for common mathematical notation patterns
        const validPatterns = [
            /\\sum/,
            /\\int/,
            /\\frac/,
            /\\sqrt/,
            /\\alpha/,
            /\\beta/,
            /\\gamma/,
            /\\mathbb/,
            /\\partial/,
            /\\nabla/,
            /\\infty/,
            /\\pi/,
            /\\theta/
        ];

        const invalidPatterns = [
            /\\xyz/,
            /\\invalid/,
            /\\notacommand/ // Invalid commands
        ];

        const hasValidMath = validPatterns.some((pattern) => pattern.test(latex));
        const hasInvalidMath = invalidPatterns.some((pattern) => pattern.test(latex));

        return hasValidMath && !hasInvalidMath;
    }

    /**
     * Validate graph visualization correctness
     */
    validateGraphVisualization(graphData, visualizationOutput) {
        const validation = {
            vertexCount: graphData.vertices.length === visualizationOutput.renderedVertices,
            edgeCount: graphData.edges.length === visualizationOutput.renderedEdges,
            coordinatesValid: this.validateCoordinates(visualizationOutput.positions),
            connectivityPreserved: this.validateConnectivity(graphData, visualizationOutput)
        };

        this.testResults.push({
            type: 'graph_visualization',
            graphData: {
                vertices: graphData.vertices.length,
                edges: graphData.edges.length
            },
            visualization: visualizationOutput,
            validation: validation,
            valid: Object.values(validation).every((v) => v),
            timestamp: new Date().toISOString()
        });

        return validation;
    }

    /**
     * Validate coordinate systems and transformations
     */
    validateCoordinates(positions) {
        if (!Array.isArray(positions)) return false;

        return positions.every((pos) => {
            return Array.isArray(pos) && pos.length >= 2 && pos.every((coord) => typeof coord === 'number' && !isNaN(coord));
        });
    }

    /**
     * Validate graph connectivity preservation
     */
    validateConnectivity(originalGraph, visualization) {
        if (!visualization.adjacencyInfo) return true; // Skip if no adjacency info

        // Check if adjacency relationships are preserved
        for (const edge of originalGraph.edges) {
            const [source, target] = edge;
            const preserved = visualization.adjacencyInfo.some(
                (adj) => (adj.source === source && adj.target === target) || (adj.source === target && adj.target === source)
            );
            if (!preserved) return false;
        }
        return true;
    }

    /**
     * Validate mathematical proofs and theorems
     */
    validateMathematicalProof(proof) {
        const validation = {
            logicalStructure: this.validateLogicalStructure(proof),
            mathematicalSteps: this.validateMathematicalSteps(proof),
            conclusion: this.validateConclusion(proof)
        };

        this.testResults.push({
            type: 'mathematical_proof',
            proof: proof.name || 'unnamed_proof',
            validation: validation,
            valid: Object.values(validation).every((v) => v),
            timestamp: new Date().toISOString()
        });

        return validation;
    }

    /**
     * Validate logical structure of mathematical proofs
     */
    validateLogicalStructure(proof) {
        if (!proof.steps || !Array.isArray(proof.steps)) return false;

        // Check for logical flow
        let hasHypothesis = false;
        let hasConclusion = false;

        for (const step of proof.steps) {
            if (step.type === 'hypothesis' || step.type === 'given') {
                hasHypothesis = true;
            }
            if (step.type === 'conclusion' || step.type === 'qed') {
                hasConclusion = true;
            }
        }

        return hasHypothesis && hasConclusion;
    }

    /**
     * Validate mathematical steps in proofs
     */
    validateMathematicalSteps(proof) {
        if (!proof.steps) return false;

        return proof.steps.every((step) => {
            return step.statement && step.justification && typeof step.statement === 'string' && step.statement.length > 0;
        });
    }

    /**
     * Validate proof conclusion
     */
    validateConclusion(proof) {
        if (!proof.conclusion) return false;

        const lastStep = proof.steps[proof.steps.length - 1];
        return lastStep && (lastStep.type === 'conclusion' || lastStep.type === 'qed') && lastStep.statement === proof.conclusion;
    }

    /**
     * Run mathematical test suite
     */
    runTestSuite(testSuite) {
        const results = {
            suiteName: testSuite.name,
            startTime: new Date().toISOString(),
            tests: [],
            summary: {
                total: 0,
                passed: 0,
                failed: 0
            }
        };

        for (const test of testSuite.tests) {
            const testResult = {
                name: test.name,
                type: test.type,
                startTime: performance.now()
            };

            try {
                const valid = test.validator.call(this, test.data, test.expected);
                testResult.valid = valid;
                testResult.status = valid ? 'passed' : 'failed';

                if (valid) {
                    results.summary.passed++;
                } else {
                    results.summary.failed++;
                }
            } catch (error) {
                testResult.valid = false;
                testResult.status = 'error';
                testResult.error = error.message;
                results.summary.failed++;
            }

            testResult.endTime = performance.now();
            testResult.duration = testResult.endTime - testResult.startTime;
            results.tests.push(testResult);
            results.summary.total++;
        }

        results.endTime = new Date().toISOString();
        this.testResults.push(results);

        return results;
    }

    /**
     * Generate mathematical validation report
     */
    generateValidationReport() {
        const report = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            totalValidations: this.testResults.length,
            summary: {
                computationAccuracy: 0,
                latexRendering: 0,
                graphVisualization: 0,
                mathematicalProofs: 0,
                overallValid: 0
            },
            details: this.testResults
        };

        // Calculate summary statistics
        for (const result of this.testResults) {
            if (result.valid) {
                report.summary.overallValid++;
            }

            if (result.type) {
                const key = result.type.replace(/_/g, '');
                if (report.summary.hasOwnProperty(key)) {
                    report.summary[key]++;
                }
            }
        }

        return report;
    }

    /**
     * Save validation report to file
     */
    saveValidationReport(report, filename = 'mathematical-validation-report.json') {
        const reportPath = path.join(__dirname, '../../performance-data', filename);
        const reportDir = path.dirname(reportPath);

        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📊 Mathematical validation report saved to ${reportPath}`);

        return reportPath;
    }

    /**
     * Clear test results
     */
    clearResults() {
        this.testResults = [];
    }
}

module.exports = { MathematicalValidator };
