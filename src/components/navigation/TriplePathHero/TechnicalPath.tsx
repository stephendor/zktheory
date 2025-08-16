/**
 * Technical Path Component
 * Code-focused pathway for developers and technical implementers
 * Interactive examples, API documentation, and live playground integration
 */

'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { PathComponentProps, TechnicalPathConfig } from './types';

// ==========================================
// Technical-Focused Content
// ==========================================

const DEFAULT_TECHNICAL_CONFIG: TechnicalPathConfig = {
  codeExamples: [
    {
      title: 'Zero-Knowledge Proof',
      language: 'rust',
      complexity: 'intermediate',
      description: 'Prove knowledge without revealing secrets',
      code: `use ark_std::rand::thread_rng;
use ark_groth16::{Groth16, Proof, ProvingKey};

// Generate zero-knowledge proof
fn generate_proof(
    pk: &ProvingKey<Bls12_381>,
    secret: u64,
    public_input: u64
) -> Result<Proof<Bls12_381>, SynthesisError> {
    let mut rng = thread_rng();
    
    // Create circuit with secret witness
    let circuit = SecretSquareCircuit {
        secret: Some(secret),
        public: public_input,
    };
    
    // Generate proof without revealing secret
    Groth16::prove(&pk, circuit, &mut rng)
}`
    },
    {
      title: 'Topological Data Analysis',
      language: 'python',
      complexity: 'advanced',
      description: 'Extract shape insights from complex datasets',
      code: `import numpy as np
from ripser import ripser
from persim import plot_diagrams

# Topological analysis of point cloud
def analyze_topology(data_points):
    # Compute persistent homology
    diagrams = ripser(data_points, maxdim=2)['dgms']
    
    # Extract topological features
    features = []
    for dim, dgm in enumerate(diagrams):
        # Compute persistence intervals
        persistence = dgm[:, 1] - dgm[:, 0]
        features.extend([
            f"H{dim}_count": len(dgm),
            f"H{dim}_max_persistence": np.max(persistence),
            f"H{dim}_total_persistence": np.sum(persistence)
        ])
    
    return features, diagrams`
    },
    {
      title: 'Elliptic Curve Cryptography',
      language: 'typescript',
      complexity: 'beginner',
      description: 'Secure key exchange with mathematical curves',
      code: `import { ec as EC } from 'elliptic';

// Initialize elliptic curve (secp256k1)
const ec = new EC('secp256k1');

class EllipticCurveKeyExchange {
  private keyPair: EC.KeyPair;
  
  constructor() {
    // Generate random private key
    this.keyPair = ec.genKeyPair();
  }
  
  // Get public key for sharing
  getPublicKey(): string {
    return this.keyPair.getPublic('hex');
  }
  
  // Compute shared secret with other party
  computeSharedSecret(otherPublicKey: string): string {
    const otherKey = ec.keyFromPublic(otherPublicKey, 'hex');
    const shared = this.keyPair.derive(otherKey.getPublic());
    return shared.toString(16);
  }
}`
    },
    {
      title: 'Homomorphic Encryption',
      language: 'cpp',
      complexity: 'advanced',
      description: 'Compute on encrypted data without decryption',
      code: `#include "seal/seal.h"
using namespace seal;

// Perform computation on encrypted integers
Ciphertext homomorphic_add(
    const Ciphertext& encrypted_a,
    const Ciphertext& encrypted_b,
    Evaluator& evaluator
) {
    Ciphertext result;
    
    // Add encrypted values without decrypting
    evaluator.add(encrypted_a, encrypted_b, result);
    
    // Result is sum of original plaintexts
    return result;
}

// Multiply encrypted value by plaintext
Ciphertext homomorphic_multiply_plain(
    const Ciphertext& encrypted_value,
    int64_t plaintext_multiplier,
    Evaluator& evaluator,
    CKKSEncoder& encoder
) {
    Plaintext plain_mult;
    encoder.encode(plaintext_multiplier, plain_mult);
    
    Ciphertext result;
    evaluator.multiply_plain(encrypted_value, plain_mult, result);
    
    return result;
}`
    }
  ],
  apiDocLinks: [
    '/docs/api/zkproofs',
    '/docs/api/topology',
    '/docs/api/encryption',
    '/docs/api/curves'
  ],
  playgroundPreview: {
    enabled: true,
    defaultExample: 'zkproof-basic'
  },
  githubIntegration: {
    repoUrl: 'https://github.com/zktheory/zktheory-core',
    starCount: 2847,
    forkCount: 421
  }
};

const TECHNICAL_FEATURES = [
  {
    icon: '🔧',
    title: 'Production Ready APIs',
    description: 'Battle-tested mathematical libraries with comprehensive documentation',
    features: ['Type-safe interfaces', 'Zero-copy operations', 'Memory efficient']
  },
  {
    icon: '⚡',
    title: 'High Performance',
    description: 'Optimized implementations using cutting-edge algorithms',
    features: ['SIMD vectorization', 'GPU acceleration', 'Parallel computing']
  },
  {
    icon: '🧪',
    title: 'Interactive Playground',
    description: 'Test mathematical concepts with live code execution',
    features: ['Real-time results', 'Visual debugging', 'Example library']
  },
  {
    icon: '📚',
    title: 'Comprehensive Docs',
    description: 'From basic tutorials to advanced mathematical theory',
    features: ['Code examples', 'Mathematical proofs', 'Best practices']
  }
];

const COMPLEXITY_COLORS = {
  beginner: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  advanced: 'bg-red-100 text-red-800 border-red-200'
};

// ==========================================
// Technical Path Component
// ==========================================

export const TechnicalPath: React.FC<PathComponentProps & { config?: Partial<TechnicalPathConfig> }> = ({
  isActive,
  isHovered,
  animationDelay,
  performanceMode,
  onPathSelect,
  onHoverStart,
  onHoverEnd,
  config: configOverride = {}
}) => {
  // ==========================================
  // State Management
  // ==========================================
  
  const [activeTab, setActiveTab] = useState<'overview' | 'examples' | 'playground' | 'docs'>('overview');
  const [selectedExample, setSelectedExample] = useState(0);
  const [codeOutput, setCodeOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  // ==========================================
  // Configuration
  // ==========================================
  
  const config = useMemo(() => ({
    ...DEFAULT_TECHNICAL_CONFIG,
    ...configOverride
  }), [configOverride]);

  // ==========================================
  // Code Execution Simulation
  // ==========================================
  
  const executeCode = useCallback(async () => {
    setIsExecuting(true);
    setCodeOutput('');
    
    // Simulate code execution with realistic delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const example = config.codeExamples[selectedExample];
    
    // Simulate different outputs based on example type
    const outputs = {
      'Zero-Knowledge Proof': `Proof generation successful!
✓ Circuit compilation: 847ms
✓ Witness generation: 123ms  
✓ Proof creation: 2.3s
✓ Verification: 45ms

Proof size: 192 bytes
Public inputs verified: ✓
Zero-knowledge property: ✓`,
      
      'Topological Data Analysis': `Topological analysis complete!
📊 Persistent homology computed
   H₀ features: 1 (connected components)
   H₁ features: 3 (loops/holes)  
   H₂ features: 0 (voids)

🔍 Significant features detected:
   • Prominent loop at scale 0.23
   • Secondary loop at scale 0.41
   • Noise threshold: 0.05`,
      
      'Elliptic Curve Cryptography': `Key exchange successful!
🔐 Keys generated on secp256k1
   Private key: [HIDDEN]
   Public key: 04a1b2c3...

🤝 Shared secret computed
   Secret: 7f9e8d7c6b5a4...
   Key derivation: ECDH-SHA256
   Security level: 128-bit`,
      
      'Homomorphic Encryption': `Homomorphic computation complete!
🔒 Encrypted arithmetic performed
   Operation: (a + b) * c
   Noise budget: 87% remaining
   
📈 Performance metrics:
   Addition: 0.12ms
   Multiplication: 4.7ms  
   Total time: 4.82ms`
    };
    
    setCodeOutput(outputs[example.title as keyof typeof outputs] || 'Execution completed successfully!');
    setIsExecuting(false);
  }, [config.codeExamples, selectedExample]);

  // ==========================================
  // Syntax Highlighting (Simplified)
  // ==========================================
  
  const highlightCode = useCallback((code: string, language: string) => {
    // Simple syntax highlighting - in production use a proper syntax highlighter
    const keywords = {
      rust: ['fn', 'let', 'mut', 'use', 'pub', 'impl', 'struct', 'enum', 'match', 'if', 'else'],
      python: ['def', 'import', 'from', 'class', 'if', 'else', 'elif', 'for', 'while', 'return'],
      typescript: ['function', 'const', 'let', 'var', 'class', 'interface', 'type', 'import', 'export'],
      cpp: ['#include', 'namespace', 'using', 'class', 'struct', 'template', 'const', 'auto']
    };
    
    let highlighted = code;
    
    // Highlight keywords (simplified)
    keywords[language as keyof typeof keywords]?.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="text-purple-600 font-semibold">${keyword}</span>`);
    });
    
    // Highlight strings
    highlighted = highlighted.replace(/"([^"]*)"/g, '<span class="text-green-600">"$1"</span>');
    highlighted = highlighted.replace(/'([^']*)'/g, '<span class="text-green-600">\'$1\'</span>');
    
    // Highlight comments  
    highlighted = highlighted.replace(/\/\/(.*)$/gm, '<span class="text-gray-500 italic">//$1</span>');
    highlighted = highlighted.replace(/\/\*([\s\S]*?)\*\//g, '<span class="text-gray-500 italic">/*$1*/</span>');
    highlighted = highlighted.replace(/#(.*)$/gm, '<span class="text-gray-500 italic">#$1</span>');
    
    return highlighted;
  }, []);

  // ==========================================
  // Animation Variants
  // ==========================================
  
  const containerVariants = {
    inactive: {
      scale: 0.95,
      opacity: 0.7,
      y: 20,
      transition: { duration: 0.4 }
    },
    active: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.5, 
        delay: animationDelay
      }
    },
    hovered: {
      scale: 1.02,
      y: -5,
      transition: { duration: 0.2 }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  // ==========================================
  // Component Classes
  // ==========================================
  
  const containerClasses = classNames(
    'relative h-full bg-gradient-to-br from-slate-900 to-gray-800',
    'border-2 border-slate-600 rounded-xl overflow-hidden',
    'cursor-pointer transition-golden duration-300',
    {
      'border-cyan-400 shadow-math-medium shadow-cyan-400/20': isActive,
      'border-slate-400 shadow-math-soft': isHovered && !isActive,
      'hover:border-slate-500': !isActive
    }
  );

  // ==========================================
  // Render Content Sections
  // ==========================================
  
  const renderOverview = () => (
    <motion.div variants={contentVariants} className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-cyan-400 mb-2">
          Mathematical Computing Platform
        </h3>
        <p className="text-slate-300 leading-relaxed">
          Production-ready implementations of advanced mathematical concepts.
          From zero-knowledge proofs to topological data analysis.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {TECHNICAL_FEATURES.map((feature, index) => (
          <motion.div
            key={feature.title}
            variants={contentVariants}
            className="bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 border border-slate-600"
          >
            <div className="text-2xl mb-2">{feature.icon}</div>
            <h4 className="font-semibold text-cyan-400 mb-2">{feature.title}</h4>
            <p className="text-sm text-slate-300 mb-3">{feature.description}</p>
            <div className="space-y-1">
              {feature.features.map((feat) => (
                <div key={feat} className="flex items-center text-xs text-slate-400">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full mr-2"></span>
                  {feat}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* GitHub Integration */}
      {config.githubIntegration && (
        <motion.div 
          variants={contentVariants}
          className="bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 border border-slate-600"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-cyan-400 mb-1">Open Source</h4>
              <p className="text-slate-300 text-sm">Contribute to the mathematical computing revolution</p>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-center">
                <div className="text-cyan-400 font-bold">{config.githubIntegration.starCount}</div>
                <div className="text-slate-400">Stars</div>
              </div>
              <div className="text-center">
                <div className="text-cyan-400 font-bold">{config.githubIntegration.forkCount}</div>
                <div className="text-slate-400">Forks</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  const renderCodeExamples = () => (
    <motion.div variants={contentVariants} className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-cyan-400">
          Live Code Examples
        </h3>
        <select
          value={selectedExample}
          onChange={(e) => setSelectedExample(Number(e.target.value))}
          className="bg-slate-700 text-slate-300 border border-slate-600 rounded px-2 py-1 text-sm"
        >
          {config.codeExamples.map((example, index) => (
            <option key={index} value={index}>
              {example.title}
            </option>
          ))}
        </select>
      </div>
      
      {config.codeExamples[selectedExample] && (
        <motion.div
          key={selectedExample}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-cyan-400">
                {config.codeExamples[selectedExample].title}
              </h4>
              <p className="text-slate-400 text-sm">
                {config.codeExamples[selectedExample].description}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={classNames(
                'px-2 py-1 rounded-full text-xs border',
                COMPLEXITY_COLORS[config.codeExamples[selectedExample].complexity]
              )}>
                {config.codeExamples[selectedExample].complexity}
              </span>
              <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                {config.codeExamples[selectedExample].language}
              </span>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-lg border border-slate-600 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-600">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  executeCode();
                }}
                disabled={isExecuting}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 
                          text-white text-xs rounded transition-colors"
              >
                {isExecuting ? 'Running...' : 'Run Code'}
              </button>
            </div>
            
            <pre 
              ref={codeRef}
              className="p-4 text-sm overflow-x-auto"
              style={{ fontSize: '13px', lineHeight: '1.4' }}
            >
              <code 
                className="text-slate-300"
                dangerouslySetInnerHTML={{ 
                  __html: highlightCode(
                    config.codeExamples[selectedExample].code,
                    config.codeExamples[selectedExample].language
                  )
                }}
              />
            </pre>
          </div>
          
          {/* Output */}
          <AnimatePresence>
            {(isExecuting || codeOutput) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-900 rounded-lg border border-slate-600 overflow-hidden"
              >
                <div className="px-4 py-2 bg-slate-800 border-b border-slate-600">
                  <span className="text-slate-400 text-sm">Output</span>
                </div>
                <div className="p-4">
                  {isExecuting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-400">Executing...</span>
                    </div>
                  ) : (
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                      {codeOutput}
                    </pre>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );

  const renderPlayground = () => (
    <motion.div variants={contentVariants} className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-cyan-400 mb-2">
          Interactive Playground
        </h3>
        <p className="text-slate-300 text-sm mb-4">
          Experiment with mathematical concepts in real-time
        </p>
      </div>
      
      <div className="bg-slate-800/70 backdrop-blur-sm rounded-lg p-6 border border-slate-600 text-center">
        <div className="text-6xl mb-4">🎮</div>
        <h4 className="text-cyan-400 font-semibold mb-2">Full Playground Experience</h4>
        <p className="text-slate-400 mb-4">
          Interactive mathematical environment with visual debugging, 
          step-by-step execution, and collaborative features.
        </p>
        <button
          type="button"
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Launch Playground →
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {[
          { name: 'ZK Proofs', icon: '🔐', status: 'ready' },
          { name: 'Topology', icon: '🕸️', status: 'ready' },
          { name: 'Curves', icon: '📈', status: 'ready' },
          { name: 'Encryption', icon: '🛡️', status: 'beta' },
          { name: 'Groups', icon: '🔗', status: 'beta' },
          { name: 'Categories', icon: '📊', status: 'soon' }
        ].map((module) => (
          <div 
            key={module.name}
            className="bg-slate-800/50 rounded-lg p-3 border border-slate-600 text-center"
          >
            <div className="text-2xl mb-1">{module.icon}</div>
            <div className="text-slate-300 text-sm font-medium">{module.name}</div>
            <div className={classNames(
              'text-xs mt-1 px-2 py-1 rounded-full',
              module.status === 'ready' ? 'bg-green-900 text-green-300' :
              module.status === 'beta' ? 'bg-yellow-900 text-yellow-300' :
              'bg-slate-700 text-slate-400'
            )}>
              {module.status}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderDocs = () => (
    <motion.div variants={contentVariants} className="space-y-4">
      <h3 className="text-xl font-bold text-cyan-400 text-center mb-4">
        Documentation & APIs
      </h3>
      
      <div className="space-y-3">
        {[
          { title: 'Quick Start Guide', desc: 'Get up and running in 5 minutes', icon: '🚀' },
          { title: 'API Reference', desc: 'Complete function documentation', icon: '📚' },
          { title: 'Mathematical Theory', desc: 'Deep dive into the mathematics', icon: '🧮' },
          { title: 'Performance Guide', desc: 'Optimization tips and benchmarks', icon: '⚡' },
          { title: 'Example Gallery', desc: 'Real-world implementation examples', icon: '🎨' },
          { title: 'Migration Guide', desc: 'Upgrade from other libraries', icon: '🔄' }
        ].map((doc) => (
          <motion.div
            key={doc.title}
            variants={contentVariants}
            className="bg-slate-800/70 backdrop-blur-sm rounded-lg p-4 border border-slate-600 
                       hover:border-cyan-500 transition-colors cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{doc.icon}</span>
              <div>
                <h4 className="font-semibold text-cyan-400">{doc.title}</h4>
                <p className="text-slate-400 text-sm">{doc.desc}</p>
              </div>
              <span className="text-slate-500 ml-auto">→</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  // ==========================================
  // Render
  // ==========================================
  
  return (
    <motion.div
      className={containerClasses}
      variants={containerVariants}
      initial="inactive"
      animate={isActive ? "active" : isHovered ? "hovered" : "inactive"}
      onClick={onPathSelect}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-600 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400">Technical Developers</h2>
            <p className="text-slate-300">Code & Implementation</p>
          </div>
          <div className="text-4xl">💻</div>
        </div>
        {/* Tab Navigation */}
        <div className="flex mt-4 space-x-1">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'examples', label: 'Code Examples' },
            { key: 'playground', label: 'Playground' },
            { key: 'docs', label: 'Documentation' }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab(tab.key as any);
              }}
              className={classNames(
                'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 h-full overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'examples' && renderCodeExamples()}
            {activeTab === 'playground' && renderPlayground()}
            {activeTab === 'docs' && renderDocs()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Call to Action */}
      <div className="p-4 border-t border-slate-600 bg-slate-800/50 backdrop-blur-sm">
        <button
          type="button"
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-lg font-semibold
                     hover:from-cyan-700 hover:to-blue-700 transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          onClick={(e) => {
            e.stopPropagation();
            // Navigate to technical documentation
          }}
        >
          Explore Technical Docs →
        </button>
      </div>

      {/* Performance Indicators */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-16 left-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-600"
        >
          <div className="text-xs text-slate-400 font-medium mb-2">Performance Metrics:</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-cyan-400 font-bold">2.3ms</div>
              <div className="text-slate-500">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-cyan-400 font-bold">99.9%</div>
              <div className="text-slate-500">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-cyan-400 font-bold">~0</div>
              <div className="text-slate-500">Memory Leaks</div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TechnicalPath;