/**
 * Academic Path Component
 * Research-focused pathway for academics, mathematicians, and theoretical researchers
 * Complex mathematical visualizations, papers, and collaboration tools
 */

'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { PathComponentProps, AcademicPathConfig } from './types';

// ==========================================
// Academic-Focused Content
// ==========================================

const DEFAULT_ACADEMIC_CONFIG: AcademicPathConfig = {
  researchPapers: [
    {
      title: 'Topological Methods in Zero-Knowledge Protocol Design',
      authors: ['Dr. Elena Vasquez', 'Prof. Michael Chen', 'Dr. Sarah Kim'],
      abstract: 'We present novel applications of persistent homology to the construction of zero-knowledge proofs, demonstrating how topological invariants can provide both security guarantees and computational efficiency improvements.',
      pdfUrl: '/papers/topology-zk-2024.pdf',
      category: 'Cryptography & Topology'
    },
    {
      title: 'Categorical Semantics for Homomorphic Encryption Schemes',
      authors: ['Prof. David Rodriguez', 'Dr. Lisa Wong'],
      abstract: 'This work establishes a categorical framework for reasoning about homomorphic encryption, providing new insights into the algebraic structure of encrypted computation and enabling formal verification of cryptographic protocols.',
      pdfUrl: '/papers/categorical-homomorphic-2024.pdf',
      category: 'Category Theory & Cryptography'
    },
    {
      title: 'Geometric Deep Learning on Elliptic Curve Manifolds',
      authors: ['Dr. James Liu', 'Prof. Maria Santos', 'Dr. Alex Thompson'],
      abstract: 'We explore the application of geometric deep learning techniques to problems defined on elliptic curve manifolds, with applications to cryptanalysis and the discrete logarithm problem.',
      pdfUrl: '/papers/geometric-dl-curves-2024.pdf',
      category: 'Geometry & Machine Learning'
    },
    {
      title: 'Homotopy Type Theory for Distributed Consensus Protocols',
      authors: ['Prof. Robert Taylor', 'Dr. Anna Petrov'],
      abstract: 'Using homotopy type theory, we provide a foundation for reasoning about distributed consensus that captures both the computational and topological aspects of network protocols.',
      pdfUrl: '/papers/htt-consensus-2024.pdf',
      category: 'Type Theory & Distributed Systems'
    }
  ],
  mathematicalVisualizations: [
    {
      type: 'topology',
      complexity: 'graduate',
      interactivity: true,
      description: 'Interactive exploration of persistent homology and barcode diagrams'
    },
    {
      type: 'algebra',
      complexity: 'research',
      interactivity: true,
      description: 'Galois field operations and elliptic curve group law visualization'
    },
    {
      type: 'geometry',
      complexity: 'undergraduate',
      interactivity: true,
      description: 'Geometric constructions in cryptographic protocols'
    },
    {
      type: 'analysis',
      complexity: 'graduate',
      interactivity: false,
      description: 'Spectral analysis of cryptographic primitives'
    }
  ],
  collaborationTools: {
    enabled: true,
    platforms: ['arXiv integration', 'Collaborative LaTeX', 'Proof assistant', 'Discussion forums']
  }
};

const RESEARCH_AREAS = [
  {
    icon: '🕸️',
    title: 'Algebraic Topology',
    description: 'Persistent homology, spectral sequences, and topological data analysis',
    papers: 23,
    citations: 847,
    collaborators: 12
  },
  {
    icon: '🔐',
    title: 'Cryptographic Mathematics',
    description: 'Zero-knowledge proofs, elliptic curves, and lattice-based cryptography',
    papers: 31,
    citations: 1203,
    collaborators: 18
  },
  {
    icon: '📊',
    title: 'Category Theory',
    description: 'Categorical semantics, type theory, and formal verification',
    papers: 19,
    citations: 623,
    collaborators: 9
  },
  {
    icon: '🌐',
    title: 'Geometric Analysis',
    description: 'Manifold learning, differential geometry, and complex analysis',
    papers: 15,
    citations: 412,
    collaborators: 14
  }
];

const COMPLEXITY_STYLES = {
  undergraduate: 'bg-green-50 text-green-800 border-green-200',
  graduate: 'bg-blue-50 text-blue-800 border-blue-200',
  research: 'bg-purple-50 text-purple-800 border-purple-200'
};

const VISUALIZATION_ICONS = {
  topology: '🕸️',
  algebra: '🔢',
  geometry: '📐',
  analysis: '📈'
};

// ==========================================
// Mathematical Visualization Component
// ==========================================

const MathVisualization: React.FC<{
  type: string;
  title: string;
  complexity: 'undergraduate' | 'graduate' | 'research';
  interactive: boolean;
}> = ({ type, title, complexity, interactive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = 200;
    const height = canvas.height = 150;

    // Clear canvas
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Render different visualizations based on type
    switch (type) {
      case 'topology':
        // Draw a simple persistence diagram
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        // Axes
        ctx.beginPath();
        ctx.moveTo(30, height - 30);
        ctx.lineTo(width - 30, height - 30);
        ctx.moveTo(30, height - 30);
        ctx.lineTo(30, 30);
        ctx.stroke();
        // Points representing persistence pairs
        const points = [
          [50, 120], [80, 100], [120, 90], [160, 110], [100, 70]
        ];
        ctx.fillStyle = '#6366f1';
        points.forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fill();
        });
        // Diagonal line
        ctx.strokeStyle = '#e2e8f0';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(30, height - 30);
        ctx.lineTo(width - 30, 30);
        ctx.stroke();
        ctx.setLineDash([]);
        break;

      case 'algebra':
        // Draw elliptic curve
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = -2; x <= 2; x += 0.1) {
          const y1 = Math.sqrt(Math.abs(x * x * x - x + 1));
          const y2 = -y1;
          
          const screenX = (x + 2) * (width - 60) / 4 + 30;
          const screenY1 = height / 2 - y1 * 20;
          const screenY2 = height / 2 - y2 * 20;
          
          if (x === -2) {
            ctx.moveTo(screenX, screenY1);
          } else {
            ctx.lineTo(screenX, screenY1);
          }
        }
        ctx.stroke();
        ctx.beginPath();
        for (let x = -2; x <= 2; x += 0.1) {
          const y2 = -Math.sqrt(Math.abs(x * x * x - x + 1));
          
          const screenX = (x + 2) * (width - 60) / 4 + 30;
          const screenY2 = height / 2 - y2 * 20;
          
          if (x === -2) {
            ctx.moveTo(screenX, screenY2);
          } else {
            ctx.lineTo(screenX, screenY2);
          }
        }
        ctx.stroke();
        break;

      case 'geometry':
        // Draw geometric construction
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 2;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 40;
        // Circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        // Pentagon inscribed
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
        break;

      case 'analysis':
        // Draw function plot
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const t = (x / width) * 4 * Math.PI;
          const y = height / 2 + Math.sin(t) * Math.exp(-t / 10) * 30;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        break;
    }

    // Add labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, height - 10);

  }, [type, title]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <canvas 
        ref={canvasRef}
        className="w-full cursor-pointer"
        onClick={() => interactive && setIsAnimating(!isAnimating)}
      />
      <div className="p-3">
        <div className="flex items-center justify-between">
          <span className={classNames(
            'px-2 py-1 rounded-full text-xs border font-medium',
            COMPLEXITY_STYLES[complexity]
          )}>
            {complexity}
          </span>
          {interactive && (
            <span className="text-xs text-gray-500">Click to interact</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Academic Path Component
// ==========================================

export const AcademicPath: React.FC<PathComponentProps & { config?: Partial<AcademicPathConfig> }> = ({
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
  
  const [activeTab, setActiveTab] = useState<'overview' | 'papers' | 'visualizations' | 'collaboration'>('overview');
  const [selectedPaper, setSelectedPaper] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ==========================================
  // Configuration
  // ==========================================
  
  const config = useMemo(() => ({
    ...DEFAULT_ACADEMIC_CONFIG,
    ...configOverride
  }), [configOverride]);

  // ==========================================
  // Filtered Papers
  // ==========================================
  
  const filteredPapers = useMemo(() => {
    if (!searchQuery) return config.researchPapers;
    
    return config.researchPapers.filter(paper => 
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      paper.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [config.researchPapers, searchQuery]);

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
    'relative h-full bg-gradient-to-br from-purple-50 to-indigo-100',
    'border-2 border-purple-200 rounded-xl overflow-hidden',
    'cursor-pointer transition-golden duration-300',
    {
      'border-purple-500 shadow-math-medium': isActive,
      'border-purple-300 shadow-math-soft': isHovered && !isActive,
      'hover:border-purple-400': !isActive
    }
  );

  // ==========================================
  // Render Content Sections
  // ==========================================
  
  const renderOverview = () => (
    <motion.div variants={contentVariants} className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-purple-900 mb-2">
          Mathematical Research Platform
        </h3>
        <p className="text-purple-700 leading-relaxed">
          Advancing the frontiers of mathematical knowledge through collaborative research,
          rigorous theory development, and innovative applications.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {RESEARCH_AREAS.map((area, index) => (
          <motion.div
            key={area.title}
            variants={contentVariants}
            className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-purple-200"
          >
            <div className="text-2xl mb-2">{area.icon}</div>
            <h4 className="font-semibold text-purple-900 mb-2">{area.title}</h4>
            <p className="text-sm text-purple-700 mb-3">{area.description}</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-bold text-purple-900">{area.papers}</div>
                <div className="text-purple-600">Papers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-purple-900">{area.citations}</div>
                <div className="text-purple-600">Citations</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-purple-900">{area.collaborators}</div>
                <div className="text-purple-600">Collaborators</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Research Metrics */}
      <motion.div 
        variants={contentVariants}
        className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-purple-200"
      >
        <h4 className="font-semibold text-purple-900 mb-3">Research Impact</h4>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-900">88</div>
            <div className="text-sm text-purple-700">Total Papers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-900">3,085</div>
            <div className="text-sm text-purple-700">Citations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-900">23</div>
            <div className="text-sm text-purple-700">h-index</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-900">47</div>
            <div className="text-sm text-purple-700">Collaborators</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderPapers = () => (
    <motion.div variants={contentVariants} className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-purple-900">
          Recent Publications
        </h3>
        <input
          type="text"
          placeholder="Search papers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-1 border border-purple-200 rounded-md bg-white/70 backdrop-blur-sm text-sm
                     focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
        />
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredPapers.map((paper, index) => (
          <motion.div
            key={paper.title}
            variants={contentVariants}
            className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-purple-200 
                       hover:border-purple-400 transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPaper(selectedPaper === index ? null : index);
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-purple-900 text-sm leading-tight pr-2">
                {paper.title}
              </h4>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                {paper.category}
              </span>
            </div>
            
            <div className="text-xs text-purple-700 mb-2">
              {paper.authors.join(', ')}
            </div>
            
            <AnimatePresence>
              {selectedPaper === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-purple-800 mb-3 leading-relaxed">
                    {paper.abstract}
                  </p>
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors"
                    >
                      Download PDF →
                    </button>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs rounded transition-colors"
                      >
                        Cite
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs rounded transition-colors"
                      >
                        Discuss
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderVisualizations = () => (
    <motion.div variants={contentVariants} className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-purple-900 mb-2">
          Mathematical Visualizations
        </h3>
        <p className="text-purple-700 text-sm">
          Interactive explorations of advanced mathematical concepts
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {config.mathematicalVisualizations.map((viz, index) => (
          <motion.div
            key={index}
            variants={contentVariants}
          >
            <MathVisualization
              type={viz.type}
              title={`${VISUALIZATION_ICONS[viz.type]} ${viz.type.charAt(0).toUpperCase() + viz.type.slice(1)}`}
              complexity={viz.complexity}
              interactive={viz.interactivity}
            />
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        variants={contentVariants}
        className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-purple-200 text-center"
      >
        <div className="text-4xl mb-2">🧮</div>
        <h4 className="font-semibold text-purple-900 mb-2">Advanced Visualization Suite</h4>
        <p className="text-purple-700 text-sm mb-3">
          Explore higher-dimensional mathematical objects with our specialized visualization tools
        </p>
        <button
          type="button"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Launch Full Suite →
        </button>
      </motion.div>
    </motion.div>
  );

  const renderCollaboration = () => (
    <motion.div variants={contentVariants} className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-purple-900 mb-2">
          Research Collaboration
        </h3>
        <p className="text-purple-700 text-sm">
          Connect with researchers worldwide and advance mathematical knowledge together
        </p>
      </div>
      
      <div className="space-y-3">
        {config.collaborationTools.platforms.map((platform) => (
          <motion.div
            key={platform}
            variants={contentVariants}
            className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-purple-200 
                       hover:border-purple-400 transition-colors cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-purple-900">{platform}</h4>
                <p className="text-purple-700 text-sm">
                  {platform === 'arXiv integration' && 'Seamless preprint submission and tracking'}
                  {platform === 'Collaborative LaTeX' && 'Real-time collaborative document editing'}
                  {platform === 'Proof assistant' && 'Formal verification and theorem proving'}
                  {platform === 'Discussion forums' && 'Community discussions and peer review'}
                </p>
              </div>
              <span className="text-purple-500">→</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active Collaborations */}
      <motion.div 
        variants={contentVariants}
        className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-purple-200"
      >
        <h4 className="font-semibold text-purple-900 mb-3">Active Collaborations</h4>
        <div className="space-y-2">
          {[
            { title: 'Quantum Error Correction via Topology', participants: 7, institution: 'MIT & Stanford' },
            { title: 'Categorical Foundations of ML Theory', participants: 4, institution: 'Oxford & CMU' },
            { title: 'Homological Methods in Cryptography', participants: 12, institution: 'INRIA & ETH' }
          ].map((collab) => (
            <div key={collab.title} className="flex items-center justify-between text-sm">
              <div>
                <div className="font-medium text-purple-900">{collab.title}</div>
                <div className="text-purple-600">{collab.institution}</div>
              </div>
              <div className="text-purple-700">{collab.participants} researchers</div>
            </div>
          ))}
        </div>
      </motion.div>
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
      <div className="p-6 border-b border-purple-200 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-purple-900">Academic & Research</h2>
            <p className="text-purple-700">Theoretical Exploration</p>
          </div>
          <div className="text-4xl">🎓</div>
        </div>
        {/* Tab Navigation */}
        <div className="flex mt-4 space-x-1">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'papers', label: 'Publications' },
            { key: 'visualizations', label: 'Visualizations' },
            { key: 'collaboration', label: 'Collaboration' }
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
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-700 hover:bg-purple-200'
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
            {activeTab === 'papers' && renderPapers()}
            {activeTab === 'visualizations' && renderVisualizations()}
            {activeTab === 'collaboration' && renderCollaboration()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Call to Action */}
      <div className="p-4 border-t border-purple-200 bg-white/50 backdrop-blur-sm">
        <button
          type="button"
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold
                     hover:from-purple-700 hover:to-indigo-700 transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          onClick={(e) => {
            e.stopPropagation();
            // Navigate to research portal
          }}
        >
          Explore Research Portal →
        </button>
      </div>

      {/* Research Metrics */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-16 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-purple-200"
        >
          <div className="text-xs text-purple-700 font-medium mb-2">Current Research Activity:</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-purple-900 font-bold">5</div>
              <div className="text-purple-600">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-purple-900 font-bold">23</div>
              <div className="text-purple-600">Collaborators</div>
            </div>
            <div className="text-center">
              <div className="text-purple-900 font-bold">8</div>
              <div className="text-purple-600">Papers in Review</div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AcademicPath;