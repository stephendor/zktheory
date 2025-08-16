/**
 * Triple Path Hero Section
 * Section wrapper component for the sophisticated triple-path hero
 * Integrates with the existing content management system
 */

'use client';

import React from 'react';
import TriplePathHero from '../navigation/TriplePathHero';

// ==========================================
// Section Props Interface
// ==========================================

interface TriplePathHeroSectionProps {
  // Content Management System fields
  title?: string;
  subtitle?: string;
  elementId?: string;
  className?: string;
  styles?: {
    self?: {
      height?: 'auto' | 'screen';
      width?: 'narrow' | 'wide' | 'full';
      margin?: string[];
      padding?: string[];
      alignItems?: 'start' | 'center' | 'end';
      justifyContent?: 'start' | 'center' | 'end';
      flexDirection?: 'row' | 'col';
      background?: any;
    };
  };
  
  // Triple Path Hero specific configuration
  performanceMode?: 'high' | 'balanced' | 'conservative';
  enableParallax?: boolean;
  enableHoverPreview?: boolean;
  enablePathTransitions?: boolean;
  
  // Analytics configuration
  trackingEnabled?: boolean;
  analyticsConfig?: {
    category?: string;
    action?: string;
    label?: string;
  };
  
  // Accessibility configuration
  reduceMotion?: boolean;
  highContrast?: boolean;
  screenReaderOptimized?: boolean;
}

// ==========================================
// Main Section Component
// ==========================================

const TriplePathHeroSection: React.FC<TriplePathHeroSectionProps> = ({
  title,
  subtitle,
  elementId,
  className = '',
  styles = {},
  performanceMode = 'balanced',
  enableParallax = true,
  enableHoverPreview = true,
  enablePathTransitions = true,
  trackingEnabled = true,
  analyticsConfig = {},
  reduceMotion = false,
  highContrast = false,
  screenReaderOptimized = false
}) => {
  
  // ==========================================
  // Event Handlers
  // ==========================================
  
  const handlePathSelection = React.useCallback((path: 'business' | 'technical' | 'academic') => {
    if (trackingEnabled && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', analyticsConfig.action || 'path_selection', {
        event_category: analyticsConfig.category || 'navigation',
        event_label: `${path}_pathway`,
        custom_parameter_1: analyticsConfig.label || 'triple_path_hero'
      });
    }
    
    // Console logging for development
    console.log('Path selected:', path);
  }, [trackingEnabled, analyticsConfig]);

  const handleSpiralInteraction = React.useCallback((type: string, data: any) => {
    if (trackingEnabled && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'spiral_interaction', {
        event_category: 'engagement',
        interaction_type: type,
        spiral_phase: data.phase,
        pathway: data.activePathway || 'center'
      });
    }
    
    // Console logging for development
    console.log('Spiral interaction:', type, data);
  }, [trackingEnabled]);

  const handlePerformanceMetrics = React.useCallback((metrics: any) => {
    // Performance monitoring for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Hero performance metrics:', metrics);
      
      // Warn if performance thresholds are exceeded
      if (metrics.renderTime > 100) {
        console.warn('Hero render time exceeded threshold:', metrics.renderTime);
      }
      
      if (metrics.animationFrameRate < 30) {
        console.warn('Hero animation frame rate below threshold:', metrics.animationFrameRate);
      }
    }
    
    // Send to analytics in production (if enabled)
    if (trackingEnabled && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metrics', {
        event_category: 'performance',
        render_time: metrics.renderTime,
        frame_rate: metrics.animationFrameRate,
        memory_usage: metrics.memoryUsage
      });
    }
  }, [trackingEnabled]);

  // ==========================================
  // Style Processing
  // ==========================================
  
  const sectionClasses = React.useMemo(() => {
    const baseClasses = 'relative overflow-hidden';
    const { self = {} } = styles;
    
    const classes = [baseClasses];
    
    // Height classes
    if (self.height === 'screen') {
      classes.push('min-h-screen');
    } else {
      classes.push('min-h-[600px]');
    }
    
    // Width classes
    if (self.width === 'narrow') {
      classes.push('max-w-4xl mx-auto');
    } else if (self.width === 'wide') {
      classes.push('max-w-7xl mx-auto');
    } else {
      classes.push('w-full');
    }
    
    // Flex direction
    if (self.flexDirection === 'col') {
      classes.push('flex flex-col');
    } else {
      classes.push('flex flex-row');
    }
    
    // Alignment
    if (self.alignItems === 'start') {
      classes.push('items-start');
    } else if (self.alignItems === 'end') {
      classes.push('items-end');
    } else {
      classes.push('items-center');
    }
    
    if (self.justifyContent === 'start') {
      classes.push('justify-start');
    } else if (self.justifyContent === 'end') {
      classes.push('justify-end');
    } else {
      classes.push('justify-center');
    }
    
    // Margin and padding from styles
    if (self.margin) {
      classes.push(...self.margin.map(m => `m-${m}`));
    }
    
    if (self.padding) {
      classes.push(...self.padding.map(p => `p-${p}`));
    }
    
    // Custom className
    if (className) {
      classes.push(className);
    }
    
    return classes.join(' ');
  }, [styles, className]);

  // ==========================================
  // Background Style Processing
  // ==========================================
  
  const backgroundStyle = React.useMemo(() => {
    const { self = {} } = styles;
    const { background } = self;
    
    if (!background) return {};
    
    const style: React.CSSProperties = {};
    
    if (background.color) {
      style.backgroundColor = background.color;
    }
    
    if (background.image) {
      style.backgroundImage = `url(${background.image})`;
      style.backgroundSize = background.size || 'cover';
      style.backgroundPosition = background.position || 'center';
      style.backgroundRepeat = background.repeat || 'no-repeat';
    }
    
    if (background.gradient) {
      style.background = background.gradient;
    }
    
    return style;
  }, [styles]);

  // ==========================================
  // Accessibility Props
  // ==========================================
  
  const accessibilityProps = React.useMemo(() => ({
    reduceMotion: reduceMotion || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches),
    highContrast: highContrast || (typeof window !== 'undefined' && window.matchMedia('(prefers-contrast: high)').matches),
    screenReaderOptimized
  }), [reduceMotion, highContrast, screenReaderOptimized]);

  // ==========================================
  // Render
  // ==========================================
  
  return (
    <section 
      id={elementId}
      className={sectionClasses}
      style={backgroundStyle}
      aria-label="Triple pathway navigation hero"
    >
      {/* Optional section header */}
      {(title || subtitle) && (
        <div className="absolute top-8 left-8 z-20 text-white">
          {title && (
            <h1 className="text-4xl font-bold font-mathematical mb-2">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xl font-mathematical opacity-90">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Triple Path Hero Component */}
      <TriplePathHero
        className="w-full h-full"
        performanceMode={performanceMode}
        enableParallax={enableParallax}
        enableHoverPreview={enableHoverPreview}
        enablePathTransitions={enablePathTransitions}
        onPathSelection={handlePathSelection}
        onSpiralInteraction={handleSpiralInteraction}
        onPerformanceMetrics={handlePerformanceMetrics}
        {...accessibilityProps}
      />

      {/* Schema.org JSON-LD for SEO (only if it's the main hero) */}
      {elementId === 'hero' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPageElement',
              '@id': '#hero',
              name: 'ZKTheory Triple Path Navigation',
              description: 'Interactive navigation system with three specialized pathways for business leaders, technical developers, and academic researchers',
              audience: [
                {
                  '@type': 'Audience',
                  audienceType: 'Business Professional',
                  description: 'ROI-focused solutions and enterprise implementations'
                },
                {
                  '@type': 'Audience',
                  audienceType: 'Software Developer',
                  description: 'Technical implementation guides and API documentation'
                },
                {
                  '@type': 'Audience',
                  audienceType: 'Academic Researcher',
                  description: 'Research papers and theoretical mathematical foundations'
                }
              ],
              mainEntity: {
                '@type': 'SoftwareApplication',
                name: 'ZKTheory Platform',
                applicationCategory: 'Mathematical Computing Platform',
                operatingSystem: 'Web Browser',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD'
                }
              }
            })
          }}
        />
      )}
    </section>
  );
};

export default TriplePathHeroSection;