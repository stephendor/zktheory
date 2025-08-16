/**
 * Triple Path Hero Section
 * Content-managed wrapper for the sophisticated ZKTheory landing page
 * Integrates with existing CMS while providing mathematical pathway navigation
 */

'use client';

import React from 'react';
import classNames from 'classnames';
import { TriplePathHero } from '../../navigation/TriplePathHero';

// ==========================================
// Section Props Interface
// ==========================================

interface TriplePathHeroSectionProps {
  title?: {
    text?: string;
    color?: string;
    type?: string;
  };
  subtitle?: string;
  text?: string;
  badge?: {
    label?: string;
    color?: string;
  };
  elementId?: string;
  colors?: string;
  styles?: {
    self?: {
      height?: string;
      alignItems?: string;
      flexDirection?: string;
      justifyContent?: string;
      padding?: string[];
    };
  };
  
  // TriplePathHero specific configuration
  performanceMode?: 'high' | 'balanced' | 'conservative';
  enableParallax?: boolean;
  enableHoverPreview?: boolean;
  enablePathTransitions?: boolean;
  reduceMotion?: boolean;
  highContrast?: boolean;
  screenReaderOptimized?: boolean;
  
  // Business path configuration
  businessConfig?: Partial<{
    roiCalculatorEnabled: boolean;
    trustIndicators: string[];
  }>;
  
  // Technical path configuration  
  technicalConfig?: Partial<{
    playgroundEnabled: boolean;
    githubRepoUrl: string;
  }>;
  
  // Academic path configuration
  academicConfig?: Partial<{
    collaborationEnabled: boolean;
    researchPortalUrl: string;
  }>;
}

// ==========================================
// Section Component
// ==========================================

export const TriplePathHeroSection: React.FC<TriplePathHeroSectionProps> = ({
  title,
  subtitle,
  text,
  badge,
  elementId,
  colors = 'bg-light-fg-dark',
  styles,
  performanceMode = 'balanced',
  enableParallax = true,
  enableHoverPreview = true,
  enablePathTransitions = true,
  reduceMotion,
  highContrast,
  screenReaderOptimized,
  businessConfig,
  technicalConfig, 
  academicConfig
}) => {
  // ==========================================
  // Handle Analytics
  // ==========================================
  
  const handlePathSelection = (path: 'business' | 'technical' | 'academic') => {
    // Analytics tracking for path selection
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'pathway_selected', {
        event_category: 'hero_interaction',
        event_label: path,
        custom_parameter_1: 'triple_path_hero'
      });
    }
    
    console.log(`Pathway selected: ${path}`);
  };

  const handleSpiralInteraction = (event: string, data: any) => {
    // Analytics tracking for spiral interactions
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'spiral_interaction', {
        event_category: 'hero_interaction',
        event_label: event,
        custom_parameter_1: 'mathematical_spiral'
      });
    }
    
    console.log(`Spiral interaction: ${event}`, data);
  };

  const handlePerformanceMetrics = (metrics: any) => {
    // Performance monitoring for optimization
    if (process.env.NODE_ENV === 'development') {
      console.log('Hero Performance Metrics:', metrics);
    }
  };

  // ==========================================
  // Component Classes
  // ==========================================
  
  const sectionClasses = classNames(
    'relative',
    'triple-path-hero-section',
    colors,
    styles?.self?.height && `h-${styles.self.height}`,
    styles?.self?.alignItems && `items-${styles.self.alignItems}`,
    styles?.self?.justifyContent && `justify-${styles.self.justifyContent}`,
    styles?.self?.flexDirection && styles.self.flexDirection === 'col' ? 'flex-col' : 'flex-row',
    styles?.self?.padding && styles.self.padding.map(p => p.replace('-', '-')).join(' ')
  );

  // ==========================================
  // Render
  // ==========================================
  
  return (
    <section 
      id={elementId}
      className={sectionClasses}
      aria-label="ZKTheory Mathematical Pathways"
    >
      {/* Optional header content from CMS */}
      {(title?.text || subtitle || text || badge?.label) && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20 text-center">
          {badge?.label && (
            <div className={classNames(
              'inline-block px-4 py-2 rounded-full text-sm font-medium mb-4',
              badge.color || 'bg-math-primary text-white'
            )}>
              {badge.label}
            </div>
          )}
          
          {title?.text && (
            <h1 className={classNames(
              'text-4xl md:text-5xl lg:text-6xl font-bold mb-4',
              title.color || 'text-math-primary'
            )}>
              {title.text}
            </h1>
          )}
          
          {subtitle && (
            <h2 className="text-xl md:text-2xl text-math-secondary font-mathematical mb-4">
              {subtitle}
            </h2>
          )}
          
          {text && (
            <p className="text-lg text-math-muted max-w-2xl mx-auto leading-relaxed">
              {text}
            </p>
          )}
        </div>
      )}

      {/* Main Triple Path Hero Component */}
      <TriplePathHero
        className="w-full h-full"
        performanceMode={performanceMode}
        enableParallax={enableParallax}
        enableHoverPreview={enableHoverPreview}
        enablePathTransitions={enablePathTransitions}
        onPathSelection={handlePathSelection}
        onSpiralInteraction={handleSpiralInteraction}
        onPerformanceMetrics={handlePerformanceMetrics}
        reduceMotion={reduceMotion}
        highContrast={highContrast}
        screenReaderOptimized={screenReaderOptimized}
        businessConfig={businessConfig as any}
        technicalConfig={technicalConfig as any}
        academicConfig={academicConfig as any}
      />
    </section>
  );
};

export default TriplePathHeroSection;