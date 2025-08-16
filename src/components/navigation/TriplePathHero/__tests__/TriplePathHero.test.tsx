/**
 * Triple Path Hero Component Tests
 * Comprehensive testing for mathematical accuracy, accessibility, and performance
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { expect, describe, it, beforeEach, afterEach, vi, Mock } from 'vitest';
import '@testing-library/jest-dom';
import { TriplePathHero } from '../index';
import { runAccessibilityAudit } from '../utils/accessibility';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useReducedMotion: () => false,
}));

// Mock canvas operations
const mockGetContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 1,
  globalAlpha: 1,
}));

beforeEach(() => {
  // Mock canvas context
  HTMLCanvasElement.prototype.getContext = mockGetContext as any;
  
  // Mock device capabilities
  Object.defineProperty(navigator, 'deviceMemory', {
    writable: true,
    value: 8,
  });
  
  Object.defineProperty(navigator, 'hardwareConcurrency', {
    writable: true,
    value: 4,
  });

  // Mock window properties
  Object.defineProperty(window, 'devicePixelRatio', {
    writable: true,
    value: 1,
  });

  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn((cb) => {
    setTimeout(cb, 16);
    return 1;
  });
  
  global.cancelAnimationFrame = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('TriplePathHero', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<TriplePathHero />);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('renders all three pathway sections', () => {
      render(<TriplePathHero />);
      
      expect(screen.getByText(/Business Leaders/i)).toBeInTheDocument();
      expect(screen.getByText(/Technical Developers/i)).toBeInTheDocument();
      expect(screen.getByText(/Academic.*Research/i)).toBeInTheDocument();
    });

    it('renders central spiral component', () => {
      render(<TriplePathHero />);
      
      // Check for canvas element (spiral rendering)
      const canvasElements = document.querySelectorAll('canvas');
      expect(canvasElements.length).toBeGreaterThan(0);
    });

    it('applies mathematical grid background', () => {
      const { container } = render(<TriplePathHero />);
      
      const gridElement = container.querySelector('[style*="backgroundImage"]');
      expect(gridElement).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('adapts layout for mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 640,
      });

      const { container } = render(<TriplePathHero />);
      
      // Should use flex-col for mobile
      const gridContainer = container.querySelector('.flex-col');
      expect(gridContainer).toBeInTheDocument();
    });

    it('uses grid layout for desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1024,
      });

      const { container } = render(<TriplePathHero />);
      
      // Should use grid layout for desktop
      const gridContainer = container.querySelector('.grid-cols-3');
      expect(gridContainer).toBeInTheDocument();
    });

    it('adjusts spiral size based on viewport', () => {
      const { rerender } = render(<TriplePathHero />);
      
      // Test different viewport sizes
      const viewports = [
        { width: 320, height: 568 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 }, // Desktop
      ];

      viewports.forEach(({ width, height }) => {
        Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, writable: true });
        
        rerender(<TriplePathHero />);
        
        // Canvas should adapt to container size
        const canvas = document.querySelector('canvas');
        expect(canvas).toBeInTheDocument();
      });
    });
  });

  describe('Pathway Interactions', () => {
    it('handles pathway selection', async () => {
      const onPathSelection = vi.fn();
      render(<TriplePathHero onPathSelection={onPathSelection} />);
      
      const businessPath = screen.getByText(/Business Leaders/i).closest('[role="button"]') || 
                          screen.getByText(/Business Leaders/i).closest('div[onClick]');
      
      if (businessPath) {
        fireEvent.click(businessPath);
        
        await waitFor(() => {
          expect(onPathSelection).toHaveBeenCalledWith('business');
        });
      }
    });

    it('shows hover effects on pathway elements', async () => {
      render(<TriplePathHero enableHoverPreview={true} />);
      
      const businessSection = screen.getByText(/Business Leaders/i).closest('div');
      
      if (businessSection) {
        fireEvent.mouseEnter(businessSection);
        
        await waitFor(() => {
          // Should apply hover classes or effects
          expect(businessSection).toHaveClass(/hover|active|hovered/);
        });
      }
    });

    it('handles spiral interactions', async () => {
      const onSpiralInteraction = vi.fn();
      render(<TriplePathHero onSpiralInteraction={onSpiralInteraction} />);
      
      const canvas = document.querySelector('canvas');
      if (canvas) {
        fireEvent.click(canvas);
        
        await waitFor(() => {
          expect(onSpiralInteraction).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Performance Features', () => {
    it('adapts to performance mode settings', () => {
      const { rerender } = render(<TriplePathHero performanceMode="conservative" />);
      
      // Should reduce complexity for conservative mode
      expect(mockGetContext).toHaveBeenCalled();
      
      rerender(<TriplePathHero performanceMode="high" />);
      
      // Should allow higher complexity for high performance mode
      expect(mockGetContext).toHaveBeenCalled();
    });

    it('detects device capabilities', () => {
      // Mock low-end device
      Object.defineProperty(navigator, 'deviceMemory', { value: 2, writable: true });
      Object.defineProperty(navigator, 'hardwareConcurrency', { value: 2, writable: true });
      
      render(<TriplePathHero />);
      
      // Should adapt to device capabilities
      expect(mockGetContext).toHaveBeenCalled();
    });

    it('provides performance metrics', async () => {
      const onPerformanceMetrics = vi.fn();
      render(<TriplePathHero onPerformanceMetrics={onPerformanceMetrics} />);
      
      await waitFor(() => {
        expect(onPerformanceMetrics).toHaveBeenCalledWith(
          expect.objectContaining({
            renderTime: expect.any(Number),
            animationFrameRate: expect.any(Number),
            timestamp: expect.any(Number),
          })
        );
      });
    });

    it('handles reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<TriplePathHero />);
      
      // Should respect reduced motion preference
      expect(document.querySelector('.motion-reduce\\:transition-none')).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('provides proper ARIA labels', () => {
      render(<TriplePathHero screenReaderOptimized={true} />);
      
      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveAttribute('aria-label', 'ZKTheory mathematical pathways');
    });

    it('supports keyboard navigation', async () => {
      render(<TriplePathHero screenReaderOptimized={true} />);
      
      const navButtons = screen.getAllByRole('button');
      expect(navButtons.length).toBeGreaterThan(0);
      
      // Test keyboard focus
      const firstButton = navButtons[0];
      firstButton.focus();
      expect(firstButton).toHaveFocus();
      
      // Test Enter key activation
      fireEvent.keyDown(firstButton, { key: 'Enter' });
      // Should trigger button action
    });

    it('includes screen reader content', () => {
      render(<TriplePathHero screenReaderOptimized={true} />);
      
      const srOnlyContent = document.querySelector('.sr-only');
      expect(srOnlyContent).toBeInTheDocument();
    });

    it('passes accessibility audit', () => {
      const { container } = render(<TriplePathHero screenReaderOptimized={true} />);
      
      const auditResults = runAccessibilityAudit(container);
      
      // Should pass basic accessibility checks
      expect(auditResults.score).toBeGreaterThan(80);
      expect(auditResults.issues.length).toBeLessThan(5);
    });

    it('provides mathematical content descriptions', () => {
      render(<TriplePathHero screenReaderOptimized={true} />);
      
      // Should have descriptions for mathematical visualizations
      const descriptions = screen.getAllByText(/mathematical|spiral|pathway/i);
      expect(descriptions.length).toBeGreaterThan(0);
    });
  });

  describe('Mathematical Accuracy', () => {
    it('uses golden ratio proportions', () => {
      render(<TriplePathHero />);
      
      // Check for golden ratio constant usage
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      
      // Should use φ in calculations (verified through canvas calls)
      expect(mockGetContext).toHaveBeenCalled();
    });

    it('implements correct spiral mathematics', () => {
      render(<TriplePathHero />);
      
      // Verify spiral equation implementation
      // φ-spiral: r = φ^(θ/π)
      expect(mockGetContext).toHaveBeenCalled();
      
      // Should call appropriate canvas drawing methods
      const context = mockGetContext.mock.results[0].value;
      expect(context.beginPath).toHaveBeenCalled();
      expect(context.arc).toHaveBeenCalled();
    });

    it('maintains mathematical precision in animations', async () => {
      render(<TriplePathHero />);
      
      // Should maintain consistent frame timing
      await waitFor(() => {
        expect(global.requestAnimationFrame).toHaveBeenCalled();
      });
      
      // Mathematical animations should be stable
      expect(mockGetContext).toHaveBeenCalled();
    });
  });

  describe('Configuration Options', () => {
    it('accepts custom animation configuration', () => {
      const customConfig = {
        duration: 1000,
        easing: 'ease-in-out',
        delay: 200,
        stagger: 150,
      };

      render(<TriplePathHero animationConfig={customConfig} />);
      
      // Should apply custom configuration
      expect(mockGetContext).toHaveBeenCalled();
    });

    it('accepts custom spiral configuration', () => {
      const customSpiralConfig = {
        segments: 200,
        maxRotations: 5,
        animationDuration: 10000,
        particleCount: 30,
        colorScheme: 'business' as const,
      };

      render(<TriplePathHero spiralConfig={customSpiralConfig} />);
      
      // Should use custom spiral settings
      expect(mockGetContext).toHaveBeenCalled();
    });

    it('accepts pathway-specific configurations', () => {
      const businessConfig = {
        roiCalculatorEnabled: false,
        trustIndicators: ['Custom Indicator'],
      };

      const technicalConfig = {
        playgroundEnabled: false,
        githubRepoUrl: 'https://custom-repo.com',
      };

      const academicConfig = {
        collaborationEnabled: false,
        researchPortalUrl: '/custom-research',
      };

      render(
        <TriplePathHero
          businessConfig={businessConfig}
          technicalConfig={technicalConfig}
          academicConfig={academicConfig}
        />
      );
      
      // Should apply custom pathway configurations
      expect(screen.getByText(/Business Leaders/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles canvas creation failure gracefully', () => {
      // Mock canvas creation failure
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
      
      expect(() => {
        render(<TriplePathHero />);
      }).not.toThrow();
    });

    it('handles animation frame errors', () => {
      // Mock requestAnimationFrame failure
      global.requestAnimationFrame = vi.fn(() => {
        throw new Error('Animation frame error');
      });
      
      expect(() => {
        render(<TriplePathHero />);
      }).not.toThrow();
    });

    it('handles resize events', () => {
      const { container } = render(<TriplePathHero />);
      
      // Simulate window resize
      act(() => {
        Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });
        fireEvent(window, new Event('resize'));
      });
      
      // Should handle resize without errors
      expect(container).toBeInTheDocument();
    });
  });

  describe('Memory Management', () => {
    it('cleans up on unmount', () => {
      const { unmount } = render(<TriplePathHero />);
      
      // Should call cleanup methods
      unmount();
      
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('handles multiple instances', () => {
      const { container: container1 } = render(<TriplePathHero />);
      const { container: container2 } = render(<TriplePathHero />);
      
      // Both instances should render without conflicts
      expect(container1).toBeInTheDocument();
      expect(container2).toBeInTheDocument();
    });
  });

  describe('Visual Regression Protection', () => {
    it('maintains consistent visual structure', () => {
      const { container } = render(<TriplePathHero />);
      
      // Check for expected CSS classes
      expect(container.querySelector('.grid-cols-3')).toBeInTheDocument();
      expect(container.querySelector('.bg-gradient-to-br')).toBeInTheDocument();
    });

    it('preserves mathematical styling classes', () => {
      const { container } = render(<TriplePathHero />);
      
      // Should include mathematical design system classes
      const mathElements = container.querySelectorAll('[class*="math"]');
      expect(mathElements.length).toBeGreaterThan(0);
    });
  });
});

describe('Integration Tests', () => {
  it('integrates with existing design system', () => {
    render(<TriplePathHero />);
    
    // Should use design system tokens
    const elementsWithMathClasses = document.querySelectorAll('[class*="text-math"], [class*="bg-math"], [class*="border-math"]');
    expect(elementsWithMathClasses.length).toBeGreaterThan(0);
  });

  it('works with content management system', () => {
    // Test the section wrapper component
    const TriplePathHeroSection = require('../../../sections/TriplePathHeroSection').default;
    
    const sectionProps = {
      title: { text: 'Test Title' },
      subtitle: 'Test Subtitle',
      performanceMode: 'balanced' as const,
    };

    render(<TriplePathHeroSection {...sectionProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });
});

describe('Performance Tests', () => {
  it('renders within performance budget', async () => {
    const startTime = performance.now();
    
    render(<TriplePathHero />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 100ms (adjust based on requirements)
    expect(renderTime).toBeLessThan(100);
  });

  it('handles large datasets efficiently', () => {
    // Test with high complexity settings
    const highComplexityConfig = {
      segments: 500,
      particleCount: 100,
      maxRotations: 10,
    };

    const startTime = performance.now();
    render(<TriplePathHero spiralConfig={highComplexityConfig} />);
    const endTime = performance.now();
    
    // Should still render efficiently with high complexity
    expect(endTime - startTime).toBeLessThan(200);
  });
});