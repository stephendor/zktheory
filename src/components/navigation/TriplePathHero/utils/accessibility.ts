/**
 * Accessibility Utilities
 * WCAG AA compliance and keyboard navigation for mathematical interfaces
 */

import React from 'react';

// ==========================================
// Keyboard Navigation
// ==========================================

export interface KeyboardNavigationConfig {
  enableArrowKeys: boolean;
  enableTabNavigation: boolean;
  enableSpacebarActivation: boolean;
  enableEscapeClose: boolean;
  wrapAround: boolean;
  announcementDelay: number;
}

export const DEFAULT_KEYBOARD_CONFIG: KeyboardNavigationConfig = {
  enableArrowKeys: true,
  enableTabNavigation: true,
  enableSpacebarActivation: true,
  enableEscapeClose: true,
  wrapAround: true,
  announcementDelay: 100
};

export class KeyboardNavigationManager {
  private focusableElements: HTMLElement[] = [];
  private currentIndex = -1;
  private config: KeyboardNavigationConfig;
  private announcer: HTMLElement | null = null;

  constructor(config: Partial<KeyboardNavigationConfig> = {}) {
    this.config = { ...DEFAULT_KEYBOARD_CONFIG, ...config };
    this.setupAnnouncer();
  }

  // Setup screen reader announcer
  private setupAnnouncer(): void {
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.className = 'sr-only';
    this.announcer.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    document.body.appendChild(this.announcer);
  }

  // Register focusable elements
  registerFocusableElements(elements: HTMLElement[]): void {
    this.focusableElements = elements.filter(el => !el.hasAttribute('disabled'));
    
    // Add keyboard event listeners
    elements.forEach((element, index) => {
      const keydownHandler = (e: KeyboardEvent) => this.handleKeyDown(e, index);
      const focusHandler = () => this.handleFocus(index);
      
      element.addEventListener('keydown', keydownHandler);
      element.addEventListener('focus', focusHandler);
      
      // Store handlers for cleanup
      element.setAttribute('data-keyboard-index', index.toString());
      
      // Ensure proper accessibility attributes
      if (!element.getAttribute('role')) {
        element.setAttribute('role', 'button');
      }
      if (!element.getAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
      }
    });
  }

  // Handle keyboard events
  private handleKeyDown(event: KeyboardEvent, elementIndex: number): void {
    const { key, shiftKey, ctrlKey, metaKey } = event;
    
    // Ignore if modifier keys are pressed (except shift for tab)
    if ((ctrlKey || metaKey) && key !== 'Tab') {
      return;
    }

    switch (key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        if (this.config.enableArrowKeys) {
          event.preventDefault();
          this.moveFocus(-1);
        }
        break;
        
      case 'ArrowDown':
      case 'ArrowRight':
        if (this.config.enableArrowKeys) {
          event.preventDefault();
          this.moveFocus(1);
        }
        break;
        
      case 'Home':
        if (this.config.enableArrowKeys) {
          event.preventDefault();
          this.focusElement(0);
        }
        break;
        
      case 'End':
        if (this.config.enableArrowKeys) {
          event.preventDefault();
          this.focusElement(this.focusableElements.length - 1);
        }
        break;
        
      case ' ':
      case 'Enter':
        if (this.config.enableSpacebarActivation) {
          event.preventDefault();
          this.activateElement(elementIndex);
        }
        break;
        
      case 'Escape':
        if (this.config.enableEscapeClose) {
          event.preventDefault();
          this.handleEscape();
        }
        break;
        
      case 'Tab':
        // Allow natural tab behavior but update tracking
        if (!shiftKey) {
          this.moveFocus(1, false);
        } else {
          this.moveFocus(-1, false);
        }
        break;
    }
  }

  // Handle focus events
  private handleFocus(index: number): void {
    this.currentIndex = index;
    this.announceElement(index);
  }

  // Move focus to next/previous element
  private moveFocus(direction: 1 | -1, preventDefault = true): void {
    if (this.focusableElements.length === 0) return;

    let newIndex = this.currentIndex + direction;

    if (this.config.wrapAround) {
      if (newIndex >= this.focusableElements.length) {
        newIndex = 0;
      } else if (newIndex < 0) {
        newIndex = this.focusableElements.length - 1;
      }
    } else {
      newIndex = Math.max(0, Math.min(this.focusableElements.length - 1, newIndex));
    }

    this.focusElement(newIndex);
  }

  // Focus specific element
  private focusElement(index: number): void {
    if (index >= 0 && index < this.focusableElements.length) {
      this.currentIndex = index;
      this.focusableElements[index].focus();
    }
  }

  // Activate element (click/select)
  private activateElement(index: number): void {
    if (index >= 0 && index < this.focusableElements.length) {
      const element = this.focusableElements[index];
      element.click();
      this.announce(`Activated ${this.getElementDescription(element)}`);
    }
  }

  // Handle escape key
  private handleEscape(): void {
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].blur();
      this.announce('Navigation closed');
    }
  }

  // Announce element to screen readers
  private announceElement(index: number): void {
    if (this.announcer && index >= 0 && index < this.focusableElements.length) {
      const element = this.focusableElements[index];
      const description = this.getElementDescription(element);
      const position = `${index + 1} of ${this.focusableElements.length}`;
      
      setTimeout(() => {
        this.announce(`${description}, ${position}`);
      }, this.config.announcementDelay);
    }
  }

  // Get accessible description of element
  private getElementDescription(element: HTMLElement): string {
    const ariaLabel = element.getAttribute('aria-label');
    const title = element.getAttribute('title');
    const textContent = element.textContent?.trim();
    
    return ariaLabel || title || textContent || 'Interactive element';
  }

  // Announce message to screen readers
  announce(message: string): void {
    if (this.announcer) {
      this.announcer.textContent = message;
    }
  }

  // Cleanup
  cleanup(): void {
    if (this.announcer && this.announcer.parentNode) {
      this.announcer.parentNode.removeChild(this.announcer);
    }
    
    // Clean up event listeners - this is simplified since we can't easily 
    // remove specific handlers without storing references
    this.focusableElements.forEach(element => {
      // Clone and replace to remove all event listeners
      const newElement = element.cloneNode(true) as HTMLElement;
      element.parentNode?.replaceChild(newElement, element);
    });
    
    this.focusableElements = [];
  }
}

// ==========================================
// Color Contrast Utilities
// ==========================================

export interface ColorContrastInfo {
  ratio: number;
  aa: boolean;
  aaa: boolean;
  level: 'fail' | 'aa' | 'aaa';
}

export class ColorContrastChecker {
  // Calculate relative luminance
  private static getRelativeLuminance(color: string): number {
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;

    const sRGB = [rgb.r, rgb.g, rgb.b].map(value => {
      const normalizedValue = value / 255;
      return normalizedValue <= 0.03928
        ? normalizedValue / 12.92
        : Math.pow((normalizedValue + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  }

  // Convert hex to RGB
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Calculate contrast ratio between two colors
  static getContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getRelativeLuminance(color1);
    const lum2 = this.getRelativeLuminance(color2);
    
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Check if colors meet WCAG guidelines
  static checkContrast(
    foreground: string, 
    background: string, 
    fontSize: number = 16,
    fontWeight: number = 400
  ): ColorContrastInfo {
    const ratio = this.getContrastRatio(foreground, background);
    
    // Large text: 18pt+ or 14pt+ bold (18pt = 24px, 14pt = ~18.7px)
    const isLargeText = fontSize >= 24 || (fontSize >= 18.7 && fontWeight >= 700);
    
    const aaThreshold = isLargeText ? 3.0 : 4.5;
    const aaaThreshold = isLargeText ? 4.5 : 7.0;
    
    const aa = ratio >= aaThreshold;
    const aaa = ratio >= aaaThreshold;
    
    let level: 'fail' | 'aa' | 'aaa' = 'fail';
    if (aaa) level = 'aaa';
    else if (aa) level = 'aa';
    
    return { ratio, aa, aaa, level };
  }

  // Generate accessible color palette
  static generateAccessiblePalette(baseColor: string): {
    primary: string;
    secondary: string;
    text: string;
    background: string;
    accent: string;
  } {
    // This is a simplified implementation
    // In practice, you'd want more sophisticated color theory
    return {
      primary: baseColor,
      secondary: '#6b7280', // Gray-500
      text: '#1f2937',      // Gray-800
      background: '#ffffff',
      accent: '#059669'     // Emerald-600
    };
  }
}

// ==========================================
// Focus Management
// ==========================================

export class FocusManager {
  private focusStack: HTMLElement[] = [];
  private trapContainer: HTMLElement | null = null;
  private firstFocusable: HTMLElement | null = null;
  private lastFocusable: HTMLElement | null = null;

  // Trap focus within container
  trapFocus(container: HTMLElement): void {
    this.trapContainer = container;
    
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return;
    
    this.firstFocusable = focusableElements[0];
    this.lastFocusable = focusableElements[focusableElements.length - 1];
    
    // Save current focus
    const currentFocus = document.activeElement as HTMLElement;
    if (currentFocus) {
      this.focusStack.push(currentFocus);
    }
    
    // Focus first element
    this.firstFocusable.focus();
    
    // Add trap listeners
    container.addEventListener('keydown', this.handleTrapKeyDown);
  }

  // Release focus trap
  releaseTrap(): void {
    if (this.trapContainer) {
      this.trapContainer.removeEventListener('keydown', this.handleTrapKeyDown);
      this.trapContainer = null;
    }
    
    // Restore previous focus
    const previousFocus = this.focusStack.pop();
    if (previousFocus) {
      previousFocus.focus();
    }
    
    this.firstFocusable = null;
    this.lastFocusable = null;
  }

  // Handle trap keyboard events
  private handleTrapKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;
    
    const { shiftKey } = event;
    const activeElement = document.activeElement as HTMLElement;
    
    if (shiftKey) {
      // Shift + Tab: moving backwards
      if (activeElement === this.firstFocusable) {
        event.preventDefault();
        this.lastFocusable?.focus();
      }
    } else {
      // Tab: moving forwards  
      if (activeElement === this.lastFocusable) {
        event.preventDefault();
        this.firstFocusable?.focus();
      }
    }
  };

  // Get all focusable elements in container
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');
    
    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }
}

// ==========================================
// Screen Reader Utilities
// ==========================================

export class ScreenReaderUtilities {
  private static announcer: HTMLElement | null = null;

  // Initialize screen reader announcer
  static initAnnouncer(): void {
    if (this.announcer) return;
    
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.className = 'sr-only';
    this.announcer.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    document.body.appendChild(this.announcer);
  }

  // Announce message to screen readers
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    this.initAnnouncer();
    
    if (this.announcer) {
      this.announcer.setAttribute('aria-live', priority);
      this.announcer.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (this.announcer) {
          this.announcer.textContent = '';
        }
      }, 1000);
    }
  }

  // Generate mathematical descriptions for screen readers
  static describeMathematicalContent(
    type: 'spiral' | 'equation' | 'graph' | 'visualization',
    data: any
  ): string {
    switch (type) {
      case 'spiral':
        return `Interactive golden ratio spiral animation with ${data.segments} segments. ` +
               `Currently showing ${data.activePathway || 'center'} pathway transformation.`;
               
      case 'equation':
        return `Mathematical equation: ${data.equation}. ${data.description || ''}`;
        
      case 'graph':
        return `Interactive graph with ${data.nodeCount} nodes and ${data.edgeCount} edges. ` +
               `${data.description || ''}`;
               
      case 'visualization':
        return `Mathematical visualization: ${data.title}. ` +
               `Complexity level: ${data.complexity}. ` +
               `${data.interactive ? 'Interactive' : 'Static'} display.`;
               
      default:
        return 'Mathematical content visualization';
    }
  }

  // Generate pathway descriptions
  static describePathway(pathway: 'business' | 'technical' | 'academic'): string {
    const descriptions = {
      business: 'Business leaders pathway focused on ROI, implementation timelines, and enterprise solutions. ' +
                'Includes ROI calculator, case studies, and trust indicators.',
      technical: 'Technical developers pathway with interactive code examples, API documentation, and playground access. ' +
                 'Features live code execution and performance metrics.',
      academic: 'Academic researchers pathway showcasing research papers, mathematical visualizations, and collaboration tools. ' +
                'Includes publication browser and theoretical explorations.'
    };
    
    return descriptions[pathway];
  }

  // Cleanup
  static cleanup(): void {
    if (this.announcer && this.announcer.parentNode) {
      this.announcer.parentNode.removeChild(this.announcer);
      this.announcer = null;
    }
  }
}

// ==========================================
// React Hooks
// ==========================================

export const useKeyboardNavigation = (
  config: Partial<KeyboardNavigationConfig> = {}
) => {
  const managerRef = React.useRef<KeyboardNavigationManager | null>(null);
  
  if (!managerRef.current) {
    managerRef.current = new KeyboardNavigationManager(config);
  }

  React.useEffect(() => {
    return () => {
      managerRef.current?.cleanup();
    };
  }, []);

  return managerRef.current;
};

export const useFocusManagement = () => {
  const managerRef = React.useRef<FocusManager | null>(null);
  
  if (!managerRef.current) {
    managerRef.current = new FocusManager();
  }

  React.useEffect(() => {
    return () => {
      managerRef.current?.releaseTrap();
    };
  }, []);

  return managerRef.current;
};

export const useScreenReader = () => {
  React.useEffect(() => {
    ScreenReaderUtilities.initAnnouncer();
    
    return () => {
      ScreenReaderUtilities.cleanup();
    };
  }, []);

  return {
    announce: ScreenReaderUtilities.announce,
    describeMathematicalContent: ScreenReaderUtilities.describeMathematicalContent,
    describePathway: ScreenReaderUtilities.describePathway
  };
};

// ==========================================
// Accessibility Testing Utilities
// ==========================================

export const runAccessibilityAudit = (container: HTMLElement) => {
  const issues: string[] = [];
  
  // Check for images without alt text
  const images = container.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.getAttribute('alt')) {
      issues.push(`Image ${index + 1} missing alt text`);
    }
  });
  
  // Check for buttons without accessible names
  const buttons = container.querySelectorAll('button');
  buttons.forEach((button, index) => {
    const hasText = button.textContent?.trim();
    const hasAriaLabel = button.getAttribute('aria-label');
    const hasTitle = button.getAttribute('title');
    
    if (!hasText && !hasAriaLabel && !hasTitle) {
      issues.push(`Button ${index + 1} missing accessible name`);
    }
  });
  
  // Check for proper heading hierarchy
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;
  headings.forEach((heading, index) => {
    const currentLevel = parseInt(heading.tagName.substring(1));
    if (index === 0 && currentLevel !== 1) {
      issues.push('First heading should be h1');
    } else if (currentLevel > lastLevel + 1) {
      issues.push(`Heading level skipped: ${heading.tagName} after h${lastLevel}`);
    }
    lastLevel = currentLevel;
  });
  
  // Check color contrast (simplified)
  const textElements = container.querySelectorAll('*');
  textElements.forEach((element, index) => {
    const style = window.getComputedStyle(element);
    const color = style.color;
    const backgroundColor = style.backgroundColor;
    
    if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
      const contrast = ColorContrastChecker.checkContrast(color, backgroundColor);
      if (!contrast.aa) {
        issues.push(`Element ${index + 1} has insufficient color contrast (${contrast.ratio.toFixed(2)}:1)`);
      }
    }
  });
  
  return {
    passed: issues.length === 0,
    issues,
    score: Math.max(0, 100 - (issues.length * 10))
  };
};