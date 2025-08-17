/**
 * Technical Learning Path Component
 * Technical learning content for developers and engineers
 * Code examples, protocol implementations, and practical applications
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { LearningPathProps, LearningStage, ComplexityLevel } from './types';

export const TechnicalLearningPath: React.FC<LearningPathProps> = ({
  complexity,
  config,
  onProgress,
  className
}) => {
  const [currentModule, setCurrentModule] = useState(0);
  const [isModuleExpanded, setIsModuleExpanded] = useState(false);
  const [codeExample, setCodeExample] = useState<string>('');

  const technicalModules = [
    {
      id: 'zk-fundamentals',
      title: 'ZK Protocol Fundamentals',
      description: 'Core concepts and mathematical foundations',
      complexity: 'conceptual',
      duration: '25 min',
      content: {
        conceptual: {
          title: 'Understanding Zero-Knowledge Proofs',
          description: 'Mathematical foundations and core concepts',
          points: [
            'Completeness, soundness, and zero-knowledge properties',
            'Interactive vs non-interactive proof systems',
            'Common ZK protocols and their applications'
          ],
          codeExample: `// Basic ZK proof structure
interface ZKProof {
  statement: string;
  witness: string;
  proof: string;
  verify(): boolean;
}

class SimpleZKProof implements ZKProof {
  constructor(
    public statement: string,
    public witness: string,
    public proof: string
  ) {}
  
  verify(): boolean {
    // Verification logic here
    return this.proof.length > 0;
  }
}`
        },
        applied: {
          title: 'ZK Protocol Implementation',
          description: 'Practical implementation of ZK protocols',
          points: [
            'Circuit design and constraint systems',
            'Proof generation and verification',
            'Performance optimization techniques'
          ],
          codeExample: `// ZK circuit implementation
class ZKCircuit {
  private constraints: Constraint[] = [];
  
  addConstraint(constraint: Constraint): void {
    this.constraints.push(constraint);
  }
  
  generateProof(inputs: any[]): Proof {
    // Proof generation logic
    return new Proof(this.constraints, inputs);
  }
  
  verifyProof(proof: Proof): boolean {
    return proof.verify(this.constraints);
  }
}`
        },
        advanced: {
          title: 'Advanced ZK Techniques',
          description: 'Advanced optimization and scaling techniques',
          points: [
            'Recursive proof composition',
            'Batch verification strategies',
            'Hardware acceleration approaches'
          ],
          codeExample: `// Recursive proof composition
class RecursiveZKProof {
  constructor(
    public innerProofs: ZKProof[],
    public aggregationProof: ZKProof
  ) {}
  
  verifyRecursively(): boolean {
    // Verify all inner proofs
    const innerValid = this.innerProofs.every(p => p.verify());
    
    // Verify aggregation proof
    const aggregationValid = this.aggregationProof.verify();
    
    return innerValid && aggregationValid;
  }
}`
        }
      }
    },
    {
      id: 'implementation-patterns',
      title: 'Implementation Patterns',
      description: 'Common patterns and best practices',
      complexity: 'applied',
      duration: '30 min',
      content: {
        applied: {
          title: 'ZK Implementation Patterns',
          description: 'Common patterns for ZK protocol implementation',
          points: [
            'Circuit design patterns',
            'Proof generation workflows',
            'Integration strategies'
          ],
          codeExample: `// Circuit design pattern
abstract class ZKCircuitPattern {
  protected abstract defineConstraints(): void;
  protected abstract generateWitness(inputs: any[]): any;
  
  compile(): CompiledCircuit {
    this.defineConstraints();
    return new CompiledCircuit(this.constraints);
  }
  
  prove(inputs: any[]): Proof {
    const circuit = this.compile();
    const witness = this.generateWitness(inputs);
    return circuit.generateProof(witness);
  }
}`
        },
        advanced: {
          title: 'Advanced Implementation Techniques',
          description: 'Advanced techniques for production systems',
          points: [
            'Multi-party computation integration',
            'Cross-chain proof verification',
            'Performance monitoring and optimization'
          ],
          codeExample: `// Performance monitoring
class ZKPerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  
  measureTime<T>(operation: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    this.metrics.set(operation, duration);
    return result;
  }
  
  getMetrics(): Map<string, number> {
    return new Map(this.metrics);
  }
}`
        }
      }
    },
    {
      id: 'real-world-applications',
      title: 'Real-World Applications',
      description: 'Practical applications and case studies',
      complexity: 'advanced',
      duration: '35 min',
      content: {
        applied: {
          title: 'ZK Application Examples',
          description: 'Real-world applications of ZK protocols',
          points: [
            'Privacy-preserving identity systems',
            'Scalable blockchain solutions',
            'Secure voting mechanisms'
          ],
          codeExample: `// Privacy-preserving identity
class ZKIdentity {
  constructor(
    private secret: string,
    private publicCommitment: string
  ) {}
  
  proveMembership(group: string[]): Proof {
    const circuit = new MembershipCircuit(group);
    return circuit.prove([this.secret, this.publicCommitment]);
  }
  
  verifyMembership(proof: Proof, group: string[]): boolean {
    const circuit = new MembershipCircuit(group);
    return circuit.verify(proof);
  }
}`
        },
        advanced: {
          title: 'Production Deployment',
          description: 'Deploying ZK systems in production',
          points: [
            'Security considerations and audits',
            'Scalability and performance requirements',
            'Monitoring and maintenance strategies'
          ],
          codeExample: `// Production deployment
class ZKProductionSystem {
  private proofGenerator: ProofGenerator;
  private verifier: ProofVerifier;
  private monitor: PerformanceMonitor;
  
  async processRequest(request: ZKRequest): Promise<ZKResponse> {
    try {
      const proof = await this.proofGenerator.generate(request);
      const isValid = await this.verifier.verify(proof);
      
      this.monitor.recordMetrics(request, proof, isValid);
      
      return { proof, isValid, timestamp: Date.now() };
    } catch (error) {
      this.monitor.recordError(error);
      throw error;
    }
  }
}`
        }
      }
    }
  ];

  const handleModuleComplete = useCallback((moduleId: string) => {
    const progress = (currentModule + 1) / technicalModules.length;
    onProgress('advanced', progress);
    
    // Move to next module if available
    if (currentModule < technicalModules.length - 1) {
      setCurrentModule(currentModule + 1);
    }
  }, [currentModule, onProgress]);

  const getContentForComplexity = (module: any, complexityId: string) => {
    switch (complexityId) {
      case 'conceptual':
        return module.content.conceptual;
      case 'applied':
        return module.content.applied;
      case 'advanced':
        return module.content.advanced;
      default:
        return module.content.conceptual;
    }
  };

  const containerClasses = classNames(
    'technical-learning-path',
    'w-full',
    className
  );

  const currentModuleData = technicalModules[currentModule];
  const currentContent = getContentForComplexity(currentModuleData, complexity.id);

  return (
    <div className={containerClasses}>
      {/* Module Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Technical Learning Path
        </h2>
        <p className="text-math-secondary max-w-2xl mx-auto">
          Master the technical implementation of zero-knowledge proofs through 
          hands-on code examples, protocol implementations, and practical applications.
        </p>
      </motion.div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-math-muted">
            Module {currentModule + 1} of {technicalModules.length}
          </span>
          <span className="text-sm text-math-secondary">
            {Math.round(((currentModule + 1) / technicalModules.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-math-primary to-math-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentModule + 1) / technicalModules.length) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Current Module */}
      <motion.div
        key={currentModule}
        className="bg-slate-800/50 rounded-2xl p-6 md:p-8 border border-slate-700"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.6 }}
      >
        {/* Module Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">⚙️</span>
              <h3 className="text-xl md:text-2xl font-bold text-white">
                {currentModuleData.title}
              </h3>
            </div>
            <p className="text-math-muted mb-2">
              {currentModuleData.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-math-secondary">
              <span>Duration: {currentModuleData.duration}</span>
              <span>Complexity: {currentModuleData.complexity}</span>
            </div>
          </div>
          
          <button
            onClick={() => setIsModuleExpanded(!isModuleExpanded)}
            className="p-2 rounded-lg bg-math-primary/20 text-math-primary hover:bg-math-primary/30 transition-colors"
            aria-label={isModuleExpanded ? 'Collapse module' : 'Expand module'}
          >
            {isModuleExpanded ? '−' : '+'}
          </button>
        </div>

        {/* Module Content */}
        <AnimatePresence>
          {isModuleExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border-t border-slate-700 pt-6">
                <h4 className="text-lg font-semibold text-white mb-3">
                  {currentContent.title}
                </h4>
                <p className="text-math-muted mb-4">
                  {currentContent.description}
                </p>
                
                <ul className="space-y-2 mb-6">
                  {currentContent.points.map((point, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-2 text-math-secondary"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <span className="text-math-primary mt-1">•</span>
                      <span>{point}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* Code Example */}
                {currentContent.codeExample && (
                  <div className="mb-6">
                    <h5 className="font-medium text-white mb-3">Code Example</h5>
                    <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-math-secondary">
                        <code>{currentContent.codeExample}</code>
                      </pre>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setCodeExample(currentContent.codeExample)}
                        className="px-3 py-1 text-xs bg-math-primary/20 text-math-primary rounded hover:bg-math-primary/30 transition-colors"
                      >
                        Copy Code
                      </button>
                      <button
                        onClick={() => window.open('https://github.com/zktheory/examples', '_blank')}
                        className="px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
                      >
                        View on GitHub
                      </button>
                    </div>
                  </div>
                )}

                {/* Interactive Elements */}
                <div className="space-y-4">
                  {complexity.id === 'advanced' && (
                    <div className="p-4 bg-slate-700/50 rounded-lg">
                      <h5 className="font-medium text-white mb-2">Interactive Playground</h5>
                      <p className="text-sm text-math-muted mb-3">
                        Experiment with the code examples in our interactive playground.
                      </p>
                      <button className="px-4 py-2 bg-math-primary text-white rounded-lg hover:bg-math-primary/80 transition-colors">
                        Open Playground
                      </button>
                    </div>
                  )}

                  {complexity.id === 'applied' && (
                    <div className="p-4 bg-slate-700/50 rounded-lg">
                      <h5 className="font-medium text-white mb-2">Implementation Challenge</h5>
                      <p className="text-sm text-math-muted mb-3">
                        Test your understanding with a practical implementation challenge.
                      </p>
                      <button className="px-4 py-2 bg-math-primary text-white rounded-lg hover:bg-math-primary/80 transition-colors">
                        Start Challenge
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Module Actions */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-700">
          <button
            onClick={() => setCurrentModule(Math.max(0, currentModule - 1))}
            disabled={currentModule === 0}
            className={classNames(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              {
                'bg-slate-700 hover:bg-slate-600 text-white': currentModule > 0,
                'bg-slate-800 text-slate-500 cursor-not-allowed': currentModule === 0
              }
            )}
          >
            ← Previous Module
          </button>

          <button
            onClick={() => handleModuleComplete(currentModuleData.id)}
            className="px-6 py-2 bg-math-primary text-white rounded-lg hover:bg-math-primary/80 transition-colors font-medium"
          >
            {currentModule === technicalModules.length - 1 ? 'Complete Path' : 'Complete Module'}
          </button>

          <button
            onClick={() => setCurrentModule(Math.min(technicalModules.length - 1, currentModule + 1))}
            disabled={currentModule === technicalModules.length - 1}
            className={classNames(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              {
                'bg-slate-700 hover:bg-slate-600 text-white': currentModule < technicalModules.length - 1,
                'bg-slate-800 text-slate-500 cursor-not-allowed': currentModule === technicalModules.length - 1
              }
            )}
          >
            Next Module →
          </button>
        </div>
      </motion.div>

      {/* Module Navigation */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-white mb-4">All Modules</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {technicalModules.map((module, index) => (
            <motion.button
              key={module.id}
              onClick={() => setCurrentModule(index)}
              className={classNames(
                'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                {
                  'border-math-primary bg-math-primary/20': index === currentModule,
                  'border-slate-600 bg-slate-700/50 hover:border-slate-500': index !== currentModule
                }
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⚙️</span>
                <h5 className="font-medium text-white">{module.title}</h5>
              </div>
              <p className="text-sm text-math-muted mb-2">
                {module.description}
              </p>
              <div className="flex justify-between items-center text-xs text-math-secondary">
                <span>{module.duration}</span>
                <span className="capitalize">{module.complexity}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <h4 className="font-medium text-white mb-3">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 text-xs bg-math-primary/20 text-math-primary rounded hover:bg-math-primary/30 transition-colors">
            View Documentation
          </button>
          <button className="px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">
            Join Community
          </button>
          <button className="px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">
            Report Issues
          </button>
        </div>
      </div>
    </div>
  );
};
