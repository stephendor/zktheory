/**
 * Business Path Component
 * ROI-focused pathway for business leaders and decision makers
 * Transforms mathematical complexity into business value propositions
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import { PathComponentProps, BusinessPathConfig } from './types';

// ==========================================
// Business-Focused Content
// ==========================================

const DEFAULT_BUSINESS_CONFIG: BusinessPathConfig = {
  roiCalculatorEnabled: true,
  trustIndicators: [
    'Enterprise Security Standards',
    'Compliance Ready Architecture', 
    'Proven Implementation Track Record',
    'Fortune 500 Deployment Experience'
  ],
  caseStudyPreviews: [
    {
      title: 'Financial Services Privacy',
      metric: '94% Faster Compliance',
      description: 'Zero-knowledge proofs reduced audit time from weeks to hours',
      ctaText: 'View Case Study',
      ctaLink: '/projects/financial-privacy'
    },
    {
      title: 'Healthcare Data Protection',
      metric: '$2.3M Cost Savings',
      description: 'Homomorphic encryption eliminated data breach risks',
      ctaText: 'Read Success Story',
      ctaLink: '/projects/healthcare-encryption'
    },
    {
      title: 'Supply Chain Transparency',
      metric: '40% Efficiency Gain',
      description: 'Topological data analysis optimized logistics networks',
      ctaText: 'Explore Solution',
      ctaLink: '/projects/supply-chain-tda'
    }
  ],
  testimonials: [
    {
      quote: "ZKTheory's mathematical approach delivered both security and performance gains we didn't think were possible.",
      author: 'Sarah Chen',
      company: 'TechCorp CISO'
    },
    {
      quote: "The ROI was immediate. Complex compliance became a competitive advantage.",
      author: 'Michael Rodriguez',
      company: 'FinanceFlow CEO'
    },
    {
      quote: "Their team bridges the gap between cutting-edge math and practical business results.",
      author: 'Dr. Emily Watson',
      company: 'DataSecure CTO'
    }
  ]
};

const VALUE_PROPOSITIONS = [
  {
    icon: '🛡️',
    title: 'Enterprise Security',
    description: 'Zero-knowledge proofs provide mathematically guaranteed privacy',
    metrics: ['99.9% Uptime', 'SOC 2 Compliant', 'GDPR Ready']
  },
  {
    icon: '⚡',
    title: 'Performance Optimization',
    description: 'Topology-based algorithms optimize system architecture',
    metrics: ['40% Faster', '60% Less Memory', '80% Fewer Bugs']
  },
  {
    icon: '💰',
    title: 'Cost Reduction',
    description: 'Mathematical precision eliminates expensive trial-and-error',
    metrics: ['50% Dev Time', '70% Testing', '90% Maintenance']
  },
  {
    icon: '📈',
    title: 'Competitive Advantage',
    description: 'Advanced mathematics creates sustainable moats',
    metrics: ['First to Market', 'Patent Protection', 'Technical Leadership']
  }
];

const ROI_CALCULATOR_INPUTS = [
  {
    label: 'Annual Development Budget',
    key: 'devBudget',
    type: 'currency',
    placeholder: '$500,000'
  },
  {
    label: 'Security Incident Costs',
    key: 'securityCosts',
    type: 'currency', 
    placeholder: '$100,000'
  },
  {
    label: 'Compliance Hours/Year',
    key: 'complianceHours',
    type: 'number',
    placeholder: '240'
  },
  {
    label: 'Team Size',
    key: 'teamSize',
    type: 'number',
    placeholder: '12'
  }
];

// ==========================================
// Business Path Component
// ==========================================

export const BusinessPath: React.FC<PathComponentProps & { config?: Partial<BusinessPathConfig> }> = ({
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
  
  const [activeTab, setActiveTab] = useState<'overview' | 'roi' | 'cases' | 'testimonials'>('overview');
  const [roiInputs, setRoiInputs] = useState<Record<string, string>>({
    devBudget: '',
    securityCosts: '',
    complianceHours: '',
    teamSize: ''
  });
  const [showROIResult, setShowROIResult] = useState(false);

  // ==========================================
  // Configuration
  // ==========================================
  
  const config = useMemo(() => ({
    ...DEFAULT_BUSINESS_CONFIG,
    ...configOverride
  }), [configOverride]);

  // ==========================================
  // ROI Calculation
  // ==========================================
  
  const calculateROI = useCallback(() => {
    const devBudget = parseFloat(roiInputs.devBudget.replace(/[^0-9.]/g, '')) || 0;
    const securityCosts = parseFloat(roiInputs.securityCosts.replace(/[^0-9.]/g, '')) || 0;
    const complianceHours = parseFloat(roiInputs.complianceHours) || 0;
    const teamSize = parseFloat(roiInputs.teamSize) || 0;
    
    if (devBudget === 0) return null;
    
    // Business math for ROI calculation
    const averageHourlyRate = 150; // $150/hour for technical team
    const complianceCostPerYear = complianceHours * averageHourlyRate * teamSize;
    const totalCurrentCosts = devBudget + securityCosts + complianceCostPerYear;
    
    // ZKTheory efficiency gains (conservative estimates)
    const devEfficiencyGain = 0.35; // 35% faster development
    const securityReduction = 0.80; // 80% reduction in security incidents
    const complianceReduction = 0.60; // 60% reduction in compliance overhead
    
    const newDevCosts = devBudget * (1 - devEfficiencyGain);
    const newSecurityCosts = securityCosts * (1 - securityReduction);
    const newComplianceCosts = complianceCostPerYear * (1 - complianceReduction);
    const implementationCost = devBudget * 0.15; // 15% implementation cost
    
    const totalNewCosts = newDevCosts + newSecurityCosts + newComplianceCosts + implementationCost;
    const annualSavings = totalCurrentCosts - totalNewCosts;
    const roiPercentage = ((annualSavings - implementationCost) / implementationCost) * 100;
    const paybackMonths = implementationCost / (annualSavings / 12);
    
    return {
      currentCosts: totalCurrentCosts,
      newCosts: totalNewCosts,
      annualSavings: annualSavings,
      roiPercentage: roiPercentage,
      paybackMonths: paybackMonths,
      implementationCost: implementationCost
    };
  }, [roiInputs]);

  const roiResult = useMemo(calculateROI, [calculateROI]);

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
  // Event Handlers
  // ==========================================
  
  const handleROIInputChange = useCallback((key: string, value: string) => {
    setRoiInputs(prev => ({ ...prev, [key]: value }));
    setShowROIResult(false);
  }, []);

  const handleCalculateROI = useCallback(() => {
    if (roiResult) {
      setShowROIResult(true);
    }
  }, [roiResult]);

  // ==========================================
  // Component Classes
  // ==========================================
  
  const containerClasses = classNames(
    'relative h-full bg-gradient-to-br from-blue-50 to-indigo-100',
    'border-2 border-blue-200 rounded-xl overflow-hidden',
    'cursor-pointer transition-golden duration-300',
    {
      'border-blue-500 shadow-math-medium': isActive,
      'border-blue-300 shadow-math-soft': isHovered && !isActive,
      'hover:border-blue-400': !isActive
    }
  );

  // ==========================================
  // Render Content Sections
  // ==========================================
  
  const renderOverview = () => (
    <motion.div variants={contentVariants} className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-blue-900 mb-2">
          Mathematical Excellence for Business Success
        </h3>
        <p className="text-blue-700 leading-relaxed">
          Transform complex mathematical concepts into measurable business outcomes.
          Our proven frameworks deliver security, performance, and competitive advantages.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {VALUE_PROPOSITIONS.map((prop, index) => (
          <motion.div
            key={prop.title}
            variants={contentVariants}
            className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-blue-200"
          >
            <div className="text-2xl mb-2">{prop.icon}</div>
            <h4 className="font-semibold text-blue-900 mb-2">{prop.title}</h4>
            <p className="text-sm text-blue-700 mb-3">{prop.description}</p>
            <div className="flex flex-wrap gap-1">
              {prop.metrics.map((metric) => (
                <span 
                  key={metric}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {metric}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderROICalculator = () => (
    <motion.div variants={contentVariants} className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-blue-900 mb-2">
          ROI Calculator
        </h3>
        <p className="text-blue-700 text-sm">
          Estimate your potential savings with ZKTheory's mathematical solutions
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {ROI_CALCULATOR_INPUTS.map((input) => (
          <div key={input.key}>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              {input.label}
            </label>
            <input
              type="text"
              placeholder={input.placeholder}
              value={roiInputs[input.key]}
              onChange={(e) => handleROIInputChange(input.key, e.target.value)}
              className="w-full px-3 py-2 border border-blue-200 rounded-md bg-white/70 backdrop-blur-sm
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
            />
          </div>
        ))}
      </div>
      
      <button
        type="button"
        onClick={handleCalculateROI}
        disabled={!roiResult}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold 
                   hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed
                   transition-colors duration-200"
      >
        Calculate ROI
      </button>
      
      <AnimatePresence>
        {showROIResult && roiResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <h4 className="font-semibold text-green-900 mb-3">Your ROI Projection</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700">Annual Savings:</span>
                <span className="font-bold text-green-900 ml-2">
                  ${roiResult.annualSavings.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-green-700">ROI:</span>
                <span className="font-bold text-green-900 ml-2">
                  {roiResult.roiPercentage.toFixed(0)}%
                </span>
              </div>
              <div>
                <span className="text-green-700">Payback Period:</span>
                <span className="font-bold text-green-900 ml-2">
                  {roiResult.paybackMonths.toFixed(1)} months
                </span>
              </div>
              <div>
                <span className="text-green-700">Implementation:</span>
                <span className="font-bold text-green-900 ml-2">
                  ${roiResult.implementationCost.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderCaseStudies = () => (
    <motion.div variants={contentVariants} className="space-y-4">
      <h3 className="text-xl font-bold text-blue-900 text-center mb-4">
        Proven Success Stories
      </h3>
      
      {config.caseStudyPreviews.map((caseStudy, index) => (
        <motion.div
          key={caseStudy.title}
          variants={contentVariants}
          className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-blue-200 hover:border-blue-400 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-blue-900">{caseStudy.title}</h4>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
              {caseStudy.metric}
            </span>
          </div>
          <p className="text-blue-700 text-sm mb-3">{caseStudy.description}</p>
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            {caseStudy.ctaText} →
          </button>
        </motion.div>
      ))}
    </motion.div>
  );

  const renderTestimonials = () => (
    <motion.div variants={contentVariants} className="space-y-4">
      <h3 className="text-xl font-bold text-blue-900 text-center mb-4">
        What Leaders Say
      </h3>
      
      {config.testimonials.map((testimonial, index) => (
        <motion.div
          key={testimonial.author}
          variants={contentVariants}
          className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-blue-200"
        >
          <blockquote className="text-blue-800 italic mb-3">
            "{testimonial.quote}"
          </blockquote>
          <div className="text-right">
            <div className="font-semibold text-blue-900">{testimonial.author}</div>
            <div className="text-blue-600 text-sm">{testimonial.company}</div>
          </div>
        </motion.div>
      ))}
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
      <div className="p-6 border-b border-blue-200 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-blue-900">Business Leaders</h2>
            <p className="text-blue-700">ROI-Focused Solutions</p>
          </div>
          <div className="text-4xl">📊</div>
        </div>
        {/* Tab Navigation */}
        <div className="flex mt-4 space-x-1">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'roi', label: 'ROI Calculator' },
            { key: 'cases', label: 'Case Studies' },
            { key: 'testimonials', label: 'Testimonials' }
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
                  ? 'bg-blue-600 text-white'
                  : 'text-blue-700 hover:bg-blue-200'
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
            {activeTab === 'roi' && renderROICalculator()}
            {activeTab === 'cases' && renderCaseStudies()}
            {activeTab === 'testimonials' && renderTestimonials()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Call to Action */}
      <div className="p-4 border-t border-blue-200 bg-white/50 backdrop-blur-sm">
        <button
          type="button"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold
                     hover:from-blue-700 hover:to-indigo-700 transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={(e) => {
            e.stopPropagation();
            // Navigate to business-focused landing page
          }}
        >
          Explore Business Solutions →
        </button>
      </div>

      {/* Trust Indicators */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-16 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-blue-200"
        >
          <div className="text-xs text-blue-700 font-medium mb-2">Trust Indicators:</div>
          <div className="flex flex-wrap gap-1">
            {config.trustIndicators.map((indicator) => (
              <span
                key={indicator}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {indicator}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BusinessPath;