/**
 * Academic Learning Path Component
 * Academic learning content for researchers and students
 * Theoretical foundations, research papers, and collaboration opportunities
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { LearningPathProps, LearningStage, ComplexityLevel } from './types';

export const AcademicLearningPath: React.FC<LearningPathProps> = ({
  complexity,
  config,
  onProgress,
  className
}) => {
  const [currentModule, setCurrentModule] = useState(0);
  const [isModuleExpanded, setIsModuleExpanded] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<string>('');

  const academicModules = [
    {
      id: 'theoretical-foundations',
      title: 'Theoretical Foundations',
      description: 'Mathematical foundations and theoretical frameworks',
      complexity: 'applied',
      duration: '40 min',
      content: {
        applied: {
          title: 'Mathematical Foundations of ZK Proofs',
          description: 'Deep dive into the mathematical theory behind zero-knowledge proofs',
          points: [
            'Complexity theory and computational hardness',
            'Interactive proof systems and their properties',
            'Cryptographic assumptions and security models'
          ],
          papers: [
            'Goldwasser, Micali, and Rackoff (1985): "The Knowledge Complexity of Interactive Proof Systems"',
            'Blum, Feldman, and Micali (1988): "Non-Interactive Zero-Knowledge and Its Applications"',
            'Ben-Or, Goldreich, Goldwasser, Håstad, Kilian, Micali, and Rogaway (1990): "Everything Provable is Provable in Zero-Knowledge"'
          ]
        },
        advanced: {
          title: 'Advanced Theoretical Concepts',
          description: 'Advanced theoretical developments and open problems',
          points: [
            'Quantum-resistant ZK protocols',
            'Post-quantum cryptographic assumptions',
            'Quantum complexity theory implications'
          ],
          papers: [
            'Boneh and Dagdelen (2010): "Cryptographic Schemes Resilient to Continual Leakage"',
            'Gentry (2009): "Fully Homomorphic Encryption Using Ideal Lattices"',
            'Regev (2005): "On Lattices, Learning with Errors, Random Linear Codes, and Cryptography"'
          ]
        },
        research: {
          title: 'Research Frontiers and Open Problems',
          description: 'Cutting-edge research areas and unsolved problems',
          points: [
            'Scalability of ZK proof systems',
            'Quantum-secure ZK protocols',
            'Cross-domain ZK applications'
          ],
          papers: [
            'Bünz, Bootle, Boneh, Poelstra, Wuille, and Maxwell (2018): "Bulletproofs: Short Proofs for Confidential Transactions and More"',
            'Katz and Lindell (2014): "Introduction to Modern Cryptography"',
            'Goldreich (2001): "Foundations of Cryptography: Basic Tools"'
          ]
        }
      }
    },
    {
      id: 'research-methodology',
      title: 'Research Methodology',
      description: 'Research methods and academic writing',
      complexity: 'advanced',
      duration: '35 min',
      content: {
        advanced: {
          title: 'ZK Research Methodology',
          description: 'Systematic approach to ZK protocol research',
          points: [
            'Literature review and gap analysis',
            'Experimental design and validation',
            'Academic writing and publication strategies'
          ],
          papers: [
            'Kitchenham and Charters (2007): "Guidelines for Performing Systematic Literature Reviews in Software Engineering"',
            'Wohlin, Runeson, Höst, Ohlsson, Regnell, and Wesslén (2012): "Experimentation in Software Engineering"'
          ]
        },
        research: {
          title: 'Advanced Research Techniques',
          description: 'Advanced research methodologies for ZK protocols',
          points: [
            'Formal verification and proof assistants',
            'Performance benchmarking and analysis',
            'Security analysis and threat modeling'
          ],
          papers: [
            'Barthe, Grégoire, and Zanella-Béguelin (2009): "Formal Certification of Code-Based Cryptographic Proofs"',
            'Blanchet (2001): "An Efficient Cryptographic Protocol Verifier Based on Prolog Rules"'
          ]
        }
      }
    },
    {
      id: 'collaboration-opportunities',
      title: 'Collaboration & Community',
      description: 'Academic collaboration and community engagement',
      complexity: 'research',
      duration: '30 min',
      content: {
        advanced: {
          title: 'Academic Collaboration Networks',
          description: 'Building research partnerships and collaborations',
          points: [
            'Identifying potential collaborators',
            'Establishing research partnerships',
            'Managing collaborative research projects'
          ],
          papers: [
            'Wuchty, Jones, and Uzzi (2007): "The Increasing Dominance of Teams in Production of Knowledge"',
            'Newman (2001): "The Structure of Scientific Collaboration Networks"'
          ]
        },
        research: {
          title: 'Community Engagement and Outreach',
          description: 'Engaging with the broader ZK research community',
          points: [
            'Conference participation and presentation',
            'Open source contribution and collaboration',
            'Educational outreach and knowledge sharing'
          ],
          papers: [
            'Raymond (1999): "The Cathedral and the Bazaar"',
            'Stallman (1985): "The GNU Manifesto"'
          ]
        }
      }
    }
  ];

  const handleModuleComplete = useCallback((moduleId: string) => {
    const progress = (currentModule + 1) / academicModules.length;
    onProgress('research', progress);
    
    // Move to next module if available
    if (currentModule < academicModules.length - 1) {
      setCurrentModule(currentModule + 1);
    }
  }, [currentModule, onProgress]);

  const getContentForComplexity = (module: any, complexityId: string) => {
    switch (complexityId) {
      case 'applied':
        return module.content.applied;
      case 'advanced':
        return module.content.advanced;
      case 'research':
        return module.content.research;
      default:
        return module.content.applied;
    }
  };

  const containerClasses = classNames(
    'academic-learning-path',
    'w-full',
    className
  );

  const currentModuleData = academicModules[currentModule];
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
          Academic Learning Path
        </h2>
        <p className="text-math-secondary max-w-2xl mx-auto">
          Explore the theoretical foundations of zero-knowledge proofs through 
          rigorous academic content, research papers, and collaboration opportunities.
        </p>
      </motion.div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-math-muted">
            Module {currentModule + 1} of {academicModules.length}
          </span>
          <span className="text-sm text-math-secondary">
            {Math.round(((currentModule + 1) / academicModules.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-math-primary to-math-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentModule + 1) / academicModules.length) * 100}%` }}
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
              <span className="text-2xl">🎓</span>
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

                {/* Research Papers */}
                {currentContent.papers && (
                  <div className="mb-6">
                    <h5 className="font-medium text-white mb-3">Key Research Papers</h5>
                    <div className="space-y-3">
                      {currentContent.papers.map((paper, index) => (
                        <motion.div
                          key={index}
                          className="p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <p className="text-sm text-math-secondary mb-2">
                            {paper}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedPaper(paper)}
                              className="px-3 py-1 text-xs bg-math-primary/20 text-math-primary rounded hover:bg-math-primary/30 transition-colors"
                            >
                              View Abstract
                            </button>
                            <button
                              onClick={() => window.open('https://scholar.google.com', '_blank')}
                              className="px-3 py-1 text-xs bg-slate-600 text-white rounded hover:bg-slate-500 transition-colors"
                            >
                              Find on Scholar
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Elements */}
                <div className="space-y-4">
                  {complexity.id === 'research' && (
                    <div className="p-4 bg-slate-700/50 rounded-lg">
                      <h5 className="font-medium text-white mb-2">Research Collaboration</h5>
                      <p className="text-sm text-math-muted mb-3">
                        Connect with other researchers working on similar topics.
                      </p>
                      <button className="px-4 py-2 bg-math-primary text-white rounded-lg hover:bg-math-primary/80 transition-colors">
                        Find Collaborators
                      </button>
                    </div>
                  )}

                  {complexity.id === 'advanced' && (
                    <div className="p-4 bg-slate-700/50 rounded-lg">
                      <h5 className="font-medium text-white mb-2">Research Discussion</h5>
                      <p className="text-sm text-math-muted mb-3">
                        Join academic discussions and peer review processes.
                      </p>
                      <button className="px-4 py-2 bg-math-primary text-white rounded-lg hover:bg-math-primary/80 transition-colors">
                        Join Discussion
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
            {currentModule === academicModules.length - 1 ? 'Complete Path' : 'Complete Module'}
          </button>

          <button
            onClick={() => setCurrentModule(Math.min(academicModules.length - 1, currentModule + 1))}
            disabled={currentModule === academicModules.length - 1}
            className={classNames(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              {
                'bg-slate-700 hover:bg-slate-600 text-white': currentModule < academicModules.length - 1,
                'bg-slate-800 text-slate-500 cursor-not-allowed': currentModule === academicModules.length - 1
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
          {academicModules.map((module, index) => (
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
                <span className="text-lg">🎓</span>
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

      {/* Academic Resources */}
      <div className="mt-8 p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
        <h4 className="text-lg font-semibold text-white mb-4">Academic Resources</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <h5 className="font-medium text-white mb-2">Research Database</h5>
            <p className="text-sm text-math-muted mb-3">
              Access our curated collection of ZK research papers and publications.
            </p>
            <button className="px-4 py-2 bg-math-primary text-white rounded-lg hover:bg-math-primary/80 transition-colors text-sm">
              Browse Papers
            </button>
          </div>
          
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <h5 className="font-medium text-white mb-2">Collaboration Network</h5>
            <p className="text-sm text-math-muted mb-3">
              Connect with researchers and institutions working on ZK protocols.
            </p>
            <button className="px-4 py-2 bg-math-primary text-white rounded-lg hover:bg-math-primary/80 transition-colors text-sm">
              Join Network
            </button>
          </div>
          
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <h5 className="font-medium text-white mb-2">Conference Calendar</h5>
            <p className="text-sm text-math-muted mb-3">
              Stay updated on upcoming ZK and cryptography conferences.
            </p>
            <button className="px-4 py-2 bg-math-primary text-white rounded-lg hover:bg-math-primary/80 transition-colors text-sm">
              View Calendar
            </button>
          </div>
          
          <div className="p-4 bg-slate-700/50 rounded-lg">
            <h5 className="font-medium text-white mb-2">Research Funding</h5>
            <p className="text-sm text-math-muted mb-3">
              Discover funding opportunities for ZK protocol research.
            </p>
            <button className="px-4 py-2 bg-math-primary text-white rounded-lg hover:bg-math-primary/80 transition-colors text-sm">
              Find Grants
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <h4 className="font-medium text-white mb-3">Quick Actions</h4>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 text-xs bg-math-primary/20 text-math-primary rounded hover:bg-math-primary/30 transition-colors">
            Submit Paper
          </button>
          <button className="px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">
            Request Review
          </button>
          <button className="px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors">
            Join Research Group
          </button>
        </div>
      </div>
    </div>
  );
};
