/**
 * Business Learning Path Component
 * Business-focused learning content for ROI, compliance, and implementation
 * Progressive complexity disclosure for business stakeholders
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { LearningPathProps, LearningStage, ComplexityLevel } from './types';

export const BusinessLearningPath: React.FC<LearningPathProps> = ({
  complexity,
  config,
  onProgress,
  className
}) => {
  const [currentModule, setCurrentModule] = useState(0);
  const [isModuleExpanded, setIsModuleExpanded] = useState(false);

  const businessModules = [
    {
      id: 'roi-overview',
      title: 'ROI Fundamentals',
      description: 'Understanding the business value of ZK protocols',
      complexity: 'foundation',
      duration: '15 min',
      content: {
        foundation: {
          title: 'What is ROI in ZK Context?',
          description: 'Basic understanding of return on investment for zero-knowledge proofs',
          points: [
            'Cost savings from reduced verification overhead',
            'Improved privacy compliance value',
            'Competitive advantage through innovation'
          ]
        },
        conceptual: {
          title: 'ROI Calculation Framework',
          description: 'Structured approach to measuring ZK protocol benefits',
          points: [
            'Direct cost savings quantification',
            'Indirect benefit measurement',
            'Risk mitigation value assessment'
          ]
        },
        applied: {
          title: 'ROI Calculator Implementation',
          description: 'Practical tools for business case development',
          points: [
            'Customizable ROI calculator',
            'Industry benchmark comparisons',
            'Scenario analysis tools'
          ]
        }
      }
    },
    {
      id: 'compliance-guide',
      title: 'Compliance & Regulatory',
      description: 'Navigating regulatory requirements with ZK technology',
      complexity: 'conceptual',
      duration: '20 min',
      content: {
        foundation: {
          title: 'Regulatory Landscape Overview',
          description: 'Understanding the compliance environment for ZK protocols',
          points: [
            'GDPR and privacy regulations',
            'Financial services compliance',
            'Industry-specific requirements'
          ]
        },
        conceptual: {
          title: 'ZK Compliance Benefits',
          description: 'How zero-knowledge proofs enhance regulatory compliance',
          points: [
            'Privacy-preserving verification',
            'Audit trail maintenance',
            'Regulatory reporting efficiency'
          ]
        },
        applied: {
          title: 'Compliance Implementation',
          description: 'Practical steps for achieving regulatory compliance',
          points: [
            'Compliance checklist development',
            'Audit preparation strategies',
            'Ongoing monitoring frameworks'
          ]
        }
      }
    },
    {
      id: 'implementation-roadmap',
      title: 'Implementation Roadmap',
      description: 'Strategic planning for ZK protocol adoption',
      complexity: 'applied',
      duration: '25 min',
      content: {
        foundation: {
          title: 'Implementation Planning Basics',
          description: 'Essential considerations for ZK protocol adoption',
          points: [
            'Stakeholder alignment',
            'Resource requirements',
            'Timeline planning'
          ]
        },
        conceptual: {
          title: 'Strategic Implementation Framework',
          description: 'Structured approach to ZK protocol deployment',
          points: [
            'Phase-based rollout strategy',
            'Risk mitigation planning',
            'Success metric definition'
          ]
        },
        applied: {
          title: 'Implementation Execution',
          description: 'Practical execution of ZK protocol implementation',
          points: [
            'Project management best practices',
            'Change management strategies',
            'Performance monitoring setup'
          ]
        }
      }
    }
  ];

  const handleModuleComplete = useCallback((moduleId: string) => {
    const progress = (currentModule + 1) / businessModules.length;
    onProgress('applied', progress);
    
    // Move to next module if available
    if (currentModule < businessModules.length - 1) {
      setCurrentModule(currentModule + 1);
    }
  }, [currentModule, onProgress]);

  const getContentForComplexity = (module: any, complexityId: string) => {
    switch (complexityId) {
      case 'foundation':
        return module.content.foundation;
      case 'conceptual':
        return module.content.conceptual;
      case 'applied':
        return module.content.applied;
      default:
        return module.content.foundation;
    }
  };

  const containerClasses = classNames(
    'business-learning-path',
    'w-full',
    className
  );

  const currentModuleData = businessModules[currentModule];
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
          Business Learning Path
        </h2>
        <p className="text-math-secondary max-w-2xl mx-auto">
          Master the business aspects of zero-knowledge proofs through practical, 
          ROI-focused learning modules designed for business stakeholders.
        </p>
      </motion.div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-math-muted">
            Module {currentModule + 1} of {businessModules.length}
          </span>
          <span className="text-sm text-math-secondary">
            {Math.round(((currentModule + 1) / businessModules.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-math-primary to-math-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentModule + 1) / businessModules.length) * 100}%` }}
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
              <span className="text-2xl">💼</span>
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

                {/* Interactive Elements */}
                <div className="space-y-4">
                  {complexity.id === 'applied' && (
                    <div className="p-4 bg-slate-700/50 rounded-lg">
                      <h5 className="font-medium text-white mb-2">Interactive Exercise</h5>
                      <p className="text-sm text-math-muted mb-3">
                        Practice what you've learned with this interactive scenario.
                      </p>
                      <button className="px-4 py-2 bg-math-primary text-white rounded-lg hover:bg-math-primary/80 transition-colors">
                        Start Exercise
                      </button>
                    </div>
                  )}

                  {complexity.id === 'conceptual' && (
                    <div className="p-4 bg-slate-700/50 rounded-lg">
                      <h5 className="font-medium text-white mb-2">Case Study</h5>
                      <p className="text-sm text-math-muted mb-3">
                        Review a real-world example of ZK protocol implementation.
                      </p>
                      <button className="px-4 py-2 bg-math-primary text-white rounded-lg hover:bg-math-primary/80 transition-colors">
                        View Case Study
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
            {currentModule === businessModules.length - 1 ? 'Complete Path' : 'Complete Module'}
          </button>

          <button
            onClick={() => setCurrentModule(Math.min(businessModules.length - 1, currentModule + 1))}
            disabled={currentModule === businessModules.length - 1}
            className={classNames(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              {
                'bg-slate-700 hover:bg-slate-600 text-white': currentModule < businessModules.length - 1,
                'bg-slate-800 text-slate-500 cursor-not-allowed': currentModule === businessModules.length - 1
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
          {businessModules.map((module, index) => (
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
                <span className="text-lg">💼</span>
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
    </div>
  );
};
