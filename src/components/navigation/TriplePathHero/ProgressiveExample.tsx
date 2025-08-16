/**
 * Progressive Triple Path Hero - Example Implementation
 * Demonstrates the enhanced progressive disclosure system
 * Shows optimal configuration for maximum UX improvement
 */

'use client';

import React, { useState, useCallback } from 'react';
import { ProgressiveTriplePathHero } from './ProgressiveTriplePathHero';
import type { 
  DisclosureStage, 
  ComplexityLevel, 
  ProgressiveMetrics,
  ProgressiveDisclosureConfig 
} from './types';

// ==========================================
// Example Configuration
// ==========================================

const OPTIMAL_PROGRESSIVE_CONFIG: ProgressiveDisclosureConfig = {
  autoAdvance: true,
  enableUserControl: true,
  showComplexityIndicators: true,
  showLoadingStates: true,
  enableAccessibility: true
};

// Stage-specific configurations for enhanced content
const STAGE_CONFIGURATIONS = {
  0: {
    // Foundation stage - minimal, trust-building content
    businessConfig: {
      roiCalculatorEnabled: false,
      trustIndicators: ['Enterprise Security', 'SOC 2 Compliant'],
      caseStudyPreviews: [],
      testimonials: []
    }
  },
  1: {
    // Value focus stage - quick trust signals and metrics
    businessConfig: {
      roiCalculatorEnabled: false,
      trustIndicators: [
        'Enterprise Security Standards',
        'SOC 2 Compliant', 
        'Fortune 500 Proven',
        '99.9% Uptime SLA'
      ],
      caseStudyPreviews: [
        {
          title: 'Quick Win: 35% Faster ROI',
          metric: '35% ROI Boost',
          description: 'Mathematical precision eliminates trial-and-error',
          ctaText: 'See How',
          ctaLink: '/quick-wins'
        }
      ],
      testimonials: []
    }
  },
  2: {
    // Pathway preview stage - interactive demos and examples
    businessConfig: {
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
        }
      ],
      testimonials: [
        {
          quote: "ZKTheory's mathematical approach delivered both security and performance gains we didn't think were possible.",
          author: 'Sarah Chen',
          company: 'TechCorp CISO'
        }
      ]
    }
  },
  3: {
    // Full complexity stage - complete feature set
    businessConfig: {
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
    }
  }
};

// ==========================================
// Example Component
// ==========================================

export const ProgressiveTriplePathHeroExample: React.FC = () => {
  // ==========================================
  // State for Analytics
  // ==========================================
  
  const [analyticsData, setAnalyticsData] = useState<{
    stageHistory: DisclosureStage[];
    complexityHistory: ComplexityLevel[];
    interactions: string[];
    metrics: ProgressiveMetrics | null;
    pathwayClarityProgress: number[];
  }>({
    stageHistory: [0],
    complexityHistory: ['🌱'],
    interactions: [],
    metrics: null,
    pathwayClarityProgress: [60]
  });

  // ==========================================
  // Event Handlers
  // ==========================================
  
  const handleStageChange = useCallback((stage: DisclosureStage, previousStage: DisclosureStage) => {
    console.log(`🎯 Stage transition: ${previousStage} → ${stage}`);
    
    setAnalyticsData(prev => ({
      ...prev,
      stageHistory: [...prev.stageHistory, stage]
    }));

    // Track pathway clarity improvement
    const clarityScore = 60 + (stage * 10); // 60% → 70% → 80% → 90%
    setAnalyticsData(prev => ({
      ...prev,
      pathwayClarityProgress: [...prev.pathwayClarityProgress, clarityScore]
    }));
  }, []);

  const handleComplexityChange = useCallback((complexity: ComplexityLevel) => {
    console.log(`🧠 Complexity level: ${complexity}`);
    
    setAnalyticsData(prev => ({
      ...prev,
      complexityHistory: [...prev.complexityHistory, complexity]
    }));
  }, []);

  const handleDisclosureInteraction = useCallback((action: string, stage: DisclosureStage, timestamp: number) => {
    console.log(`🎮 User interaction: ${action} at stage ${stage}`);
    
    setAnalyticsData(prev => ({
      ...prev,
      interactions: [...prev.interactions, `${action} (Stage ${stage})`]
    }));
  }, []);

  const handleProgressiveMetrics = useCallback((metrics: ProgressiveMetrics) => {
    console.log('📊 Progressive Metrics:', metrics);
    
    setAnalyticsData(prev => ({
      ...prev,
      metrics
    }));
  }, []);

  const handlePathSelection = useCallback((path: 'business' | 'technical' | 'academic') => {
    console.log(`🛤️ Path selected: ${path}`);
    
    // Track successful pathway selection
    setAnalyticsData(prev => ({
      ...prev,
      interactions: [...prev.interactions, `Path selected: ${path}`]
    }));
  }, []);

  // ==========================================
  // Performance Metrics Display
  // ==========================================
  
  const currentClarity = analyticsData.pathwayClarityProgress[analyticsData.pathwayClarityProgress.length - 1] || 60;
  const targetClarity = 90;
  const clarityImprovement = ((currentClarity - 60) / (targetClarity - 60)) * 100;

  // ==========================================
  // Render
  // ==========================================
  
  return (
    <div className="relative min-h-screen">
      {/* Enhanced Triple Path Hero */}
      <ProgressiveTriplePathHero
        // Progressive disclosure configuration
        progressiveDisclosure={OPTIMAL_PROGRESSIVE_CONFIG}
        stageConfigurations={STAGE_CONFIGURATIONS}
        
        // Progressive disclosure callbacks
        onStageChange={handleStageChange}
        onComplexityChange={handleComplexityChange}
        onDisclosureInteraction={handleDisclosureInteraction}
        onProgressiveMetrics={handleProgressiveMetrics}
        
        // Base component props
        onPathSelection={handlePathSelection}
        performanceMode="balanced"
        enableParallax={true}
        enableHoverPreview={true}
        enablePathTransitions={true}
        screenReaderOptimized={true}
        
        // Animation configuration
        animationConfig={{
          duration: 800,
          easing: 'cubic-bezier(0.618, 0, 0.382, 1)',
          delay: 0,
          stagger: 100
        }}
      />

      {/* Real-time Analytics Dashboard (Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border max-w-sm z-50">
          <h3 className="font-bold text-sm mb-3 text-gray-900">🎯 UX Analytics Dashboard</h3>
          
          {/* Pathway Clarity Progress */}
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-1">
              Pathway Clarity: {currentClarity}% (Target: {targetClarity}%)
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${clarityImprovement}%` }}
              />
            </div>
          </div>

          {/* Stage History */}
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-1">Stage Journey:</div>
            <div className="flex space-x-1">
              {analyticsData.stageHistory.map((stage, index) => (
                <span 
                  key={index}
                  className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center justify-center"
                >
                  {stage + 1}
                </span>
              ))}
            </div>
          </div>

          {/* Complexity Evolution */}
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-1">Complexity Evolution:</div>
            <div className="flex space-x-1">
              {analyticsData.complexityHistory.map((complexity, index) => (
                <span key={index} className="text-lg">
                  {complexity}
                </span>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          {analyticsData.metrics && (
            <div className="space-y-1 text-xs">
              <div>Engagement: {analyticsData.metrics.userEngagementLevel}%</div>
              <div>Manual Control: {analyticsData.metrics.manualControlUsage}</div>
              <div>Interaction Depth: {analyticsData.metrics.interactionDepthScore.toFixed(1)}%</div>
            </div>
          )}

          {/* Recent Interactions */}
          <div className="mt-3">
            <div className="text-xs text-gray-600 mb-1">Recent Interactions:</div>
            <div className="max-h-20 overflow-y-auto space-y-1">
              {analyticsData.interactions.slice(-3).map((interaction, index) => (
                <div key={index} className="text-xs text-gray-700 truncate">
                  {interaction}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressiveTriplePathHeroExample;