/**
 * Mathematical Design System Component Tests
 * Tests for mathematical accuracy, accessibility, and visual consistency
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

import {
  MathInput,
  FormulaInput,
  MathDisplay,
  TheoremBlock,
  MathButton,
  MathWorkspace,
  MathVisualization,
} from '../../components/mathematical';

// Mock mathematical validation
vi.mock('../../components/mathematical/MathInput', async () => {
  const actual = await vi.importActual('../../components/mathematical/MathInput');
  return {
    ...actual,
    validateMathExpression: vi.fn().mockReturnValue({ isValid: true, parsedValue: 42 }),
  };
});

describe('Mathematical Input Components', () => {
  describe('MathInput', () => {
    it('renders basic mathematical input correctly', () => {
      render(
        <MathInput 
          placeholder="Enter value"
          semantic="variable"
          data-testid="math-input"
        />
      );
      
      const input = screen.getByTestId('math-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('math-input');
      expect(input).toHaveClass('text-math-variable');
    });

    it('validates mathematical expressions', async () => {
      const onMathChange = vi.fn();
      
      render(
        <MathInput 
          mathExpression={true}
          onMathChange={onMathChange}
          data-testid="math-input"
        />
      );
      
      const input = screen.getByTestId('math-input');
      fireEvent.change(input, { target: { value: '2 + 2' } });
      
      await waitFor(() => {
        expect(onMathChange).toHaveBeenCalledWith('2 + 2', 42);
      });
    });

    it('applies mathematical semantic styling', () => {
      const { rerender } = render(
        <MathInput semantic="variable" data-testid="math-input" />
      );
      
      let input = screen.getByTestId('math-input');
      expect(input).toHaveClass('text-math-variable');
      
      rerender(<MathInput semantic="constant" data-testid="math-input" />);
      input = screen.getByTestId('math-input');
      expect(input).toHaveClass('text-math-constant');
    });

    it('shows validation errors for invalid expressions', async () => {
      // Mock invalid expression
      vi.mocked(require('../src/components/mathematical/MathInput').validateMathExpression)
        .mockReturnValue({ isValid: false, errorMessage: 'Invalid expression' });
      
      render(
        <MathInput 
          mathExpression={true}
          showValidation={true}
          data-testid="math-input"
        />
      );
      
      const input = screen.getByTestId('math-input');
      fireEvent.change(input, { target: { value: '2 +' } });
      
      await waitFor(() => {
        expect(screen.getByText('Invalid expression')).toBeInTheDocument();
      });
    });
  });

  describe('FormulaInput', () => {
    it('renders with LaTeX preview capability', () => {
      render(
        <FormulaInput 
          latexPreview={true}
          placeholder="Enter formula"
          data-testid="formula-input"
        />
      );
      
      const input = screen.getByTestId('formula-input');
      expect(input).toHaveClass('math-input-formula');
    });
  });
});

describe('Mathematical Display Components', () => {
  describe('MathDisplay', () => {
    it('renders inline mathematical expressions', () => {
      render(
        <MathDisplay variant="inline" data-testid="math-display">
          x² + y² = z²
        </MathDisplay>
      );
      
      const display = screen.getByTestId('math-display');
      expect(display).toHaveClass('math-display-inline');
      expect(display).toHaveTextContent('x² + y² = z²');
    });

    it('renders block mathematical expressions', () => {
      render(
        <MathDisplay variant="block" centered={true} data-testid="math-display">
          ∫₀^∞ e^(-x²) dx = √π/2
        </MathDisplay>
      );
      
      const display = screen.getByTestId('math-display');
      expect(display).toHaveClass('math-display-block');
      expect(display).toHaveClass('text-center');
    });

    it('provides copy functionality', async () => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockImplementation(() => Promise.resolve()),
        },
      });

      render(
        <MathDisplay variant="block" copyable={true} data-testid="math-display">
          E = mc²
        </MathDisplay>
      );
      
      const display = screen.getByTestId('math-display');
      fireEvent.click(display);
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('E = mc²');
      });
    });

    it('supports equation numbering', () => {
      render(
        <MathDisplay variant="block" numbered={true} data-testid="math-display">
          F = ma
        </MathDisplay>
      );
      
      const display = screen.getByTestId('math-display');
      expect(display).toHaveAttribute('data-equation-numbered', 'true');
      expect(screen.getByText(/\(\d+\)/)).toBeInTheDocument();
    });
  });

  describe('TheoremBlock', () => {
    it('renders theorem with proper structure', () => {
      render(
        <TheoremBlock 
          title="Pythagorean Theorem"
          author="Pythagoras"
          tags={['geometry', 'fundamental']}
        >
          For a right triangle: a² + b² = c²
        </TheoremBlock>
      );
      
      expect(screen.getByText('Pythagorean Theorem')).toBeInTheDocument();
      expect(screen.getByText('by Pythagoras')).toBeInTheDocument();
      expect(screen.getByText('geometry')).toBeInTheDocument();
      expect(screen.getByText('fundamental')).toBeInTheDocument();
      expect(screen.getByText(/a² \+ b² = c²/)).toBeInTheDocument();
    });

    it('supports collapsible functionality', async () => {
      render(
        <TheoremBlock 
          title="Test Theorem"
          collapsible={true}
          defaultExpanded={false}
        >
          Theorem content
        </TheoremBlock>
      );
      
      // Should be collapsed initially
      expect(screen.queryByText('Theorem content')).not.toBeInTheDocument();
      
      // Click to expand
      fireEvent.click(screen.getByText('Test Theorem'));
      
      await waitFor(() => {
        expect(screen.getByText('Theorem content')).toBeInTheDocument();
      });
    });
  });
});

describe('Mathematical Interactive Components', () => {
  describe('MathButton', () => {
    it('renders mathematical symbols correctly', () => {
      render(
        <MathButton 
          variant="operator"
          symbol="+"
          tooltip="Addition"
          data-testid="math-button"
        />
      );
      
      const button = screen.getByTestId('math-button');
      expect(button).toHaveClass('math-btn-operator');
      expect(button).toHaveTextContent('+');
    });

    it('shows tooltip on hover', async () => {
      render(
        <MathButton 
          symbol="π"
          tooltip="Pi constant"
          data-testid="math-button"
        />
      );
      
      const button = screen.getByTestId('math-button');
      fireEvent.mouseEnter(button);
      
      await waitFor(() => {
        expect(screen.getByText('Pi constant')).toBeInTheDocument();
      });
    });

    it('handles click events with symbol data', () => {
      const onClick = vi.fn();
      
      render(
        <MathButton 
          symbol="sin"
          onClick={onClick}
          data-testid="math-button"
        />
      );
      
      fireEvent.click(screen.getByTestId('math-button'));
      expect(onClick).toHaveBeenCalledWith(expect.any(Object), 'sin');
    });
  });
});

describe('Mathematical Layout Components', () => {
  describe('MathWorkspace', () => {
    it('renders single layout correctly', () => {
      render(
        <MathWorkspace layout="single" data-testid="math-workspace">
          <div>Workspace content</div>
        </MathWorkspace>
      );
      
      const workspace = screen.getByTestId('math-workspace');
      expect(workspace).toHaveClass('math-workspace');
      expect(screen.getByText('Workspace content')).toBeInTheDocument();
    });

    it('renders split layout with panels', () => {
      render(
        <MathWorkspace layout="split" orientation="horizontal" data-testid="math-workspace">
          <div data-testid="panel-1">Panel 1</div>
          <div data-testid="panel-2">Panel 2</div>
        </MathWorkspace>
      );
      
      const workspace = screen.getByTestId('math-workspace');
      expect(workspace).toHaveClass('flex-row');
      expect(screen.getByTestId('panel-1')).toBeInTheDocument();
      expect(screen.getByTestId('panel-2')).toBeInTheDocument();
    });
  });

  describe('MathVisualization', () => {
    it('renders visualization container with controls', () => {
      render(
        <MathVisualization 
          title="Test Visualization"
          exportable={true}
          fullscreen={false}
          data-testid="math-viz"
        >
          <div>Visualization content</div>
        </MathVisualization>
      );
      
      expect(screen.getByText('Test Visualization')).toBeInTheDocument();
      expect(screen.getByTitle(/Export visualization/)).toBeInTheDocument();
      expect(screen.getByTitle(/Enter fullscreen/)).toBeInTheDocument();
      expect(screen.getByText('Visualization content')).toBeInTheDocument();
    });

    it('handles fullscreen toggle', () => {
      const onFullscreenToggle = vi.fn();
      
      render(
        <MathVisualization 
          onFullscreenToggle={onFullscreenToggle}
          data-testid="math-viz"
        >
          <div>Content</div>
        </MathVisualization>
      );
      
      fireEvent.click(screen.getByTitle(/Enter fullscreen/));
      expect(onFullscreenToggle).toHaveBeenCalledWith(true);
    });
  });
});

describe('Mathematical Design System Accessibility', () => {
  it('provides proper ARIA labels for mathematical content', () => {
    render(
      <MathDisplay 
        variant="block"
        aria-label="Quadratic formula: x equals negative b plus or minus square root of b squared minus 4ac, all over 2a"
        data-testid="accessible-math"
      >
        x = (-b ± √(b² - 4ac)) / 2a
      </MathDisplay>
    );
    
    const mathDisplay = screen.getByTestId('accessible-math');
    expect(mathDisplay).toHaveAccessibleName(/Quadratic formula/);
  });

  it('supports keyboard navigation', () => {
    render(
      <MathButton 
        symbol="+"
        data-testid="keyboard-button"
      />
    );
    
    const button = screen.getByTestId('keyboard-button');
    button.focus();
    expect(button).toHaveFocus();
    
    fireEvent.keyDown(button, { key: 'Enter' });
    // Should trigger click handler
  });
});

describe('Mathematical Accuracy', () => {
  it('maintains precision in mathematical calculations', () => {
    const testValue = Math.PI;
    const onMathChange = vi.fn();
    
    render(
      <MathInput 
        precision={6}
        onMathChange={onMathChange}
        data-testid="precision-input"
      />
    );
    
    const input = screen.getByTestId('precision-input');
    fireEvent.change(input, { target: { value: testValue.toString() } });
    fireEvent.blur(input);
    
    // Should format to specified precision
    expect(input).toHaveValue(testValue.toFixed(6));
  });

  it('validates mathematical expression syntax', () => {
    const expressions = [
      { input: '2 + 2', valid: true },
      { input: '(2 + 3) * 4', valid: true },
      { input: '2 + ', valid: false },
      { input: '((2 + 3)', valid: false },
    ];
    
    expressions.forEach(({ input, valid }) => {
      const result = require('../src/components/mathematical/MathInput').validateMathExpression(input);
      expect(result.isValid).toBe(valid);
    });
  });
});

describe('Mathematical Visual Regression', () => {
  it('maintains consistent mathematical styling', () => {
    render(
      <div data-testid="styling-test">
        <MathInput semantic="variable" className="test-variable" />
        <MathInput semantic="constant" className="test-constant" />
        <MathDisplay variant="theorem" className="test-theorem">Test theorem</MathDisplay>
      </div>
    );
    
    const container = screen.getByTestId('styling-test');
    
    // Check that mathematical semantic classes are applied
    const variableInput = container.querySelector('.test-variable');
    expect(variableInput).toHaveClass('text-math-variable');
    
    const constantInput = container.querySelector('.test-constant');
    expect(constantInput).toHaveClass('text-math-constant');
    
    const theoremDisplay = container.querySelector('.test-theorem');
    expect(theoremDisplay).toHaveClass('math-theorem-block');
  });
});

// Performance tests
describe('Mathematical Performance', () => {
  it('handles large datasets efficiently', async () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      x: i,
      y: Math.sin(i * 0.1),
    }));
    
    const startTime = performance.now();
    
    render(
      <MathVisualization data-testid="performance-test">
        {/* Mock large visualization */}
        {largeDataset.map((point, index) => (
          <div key={index} data-point={`${point.x},${point.y}`} />
        ))}
      </MathVisualization>
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within reasonable time (adjust threshold as needed)
    expect(renderTime).toBeLessThan(100);
  });
});

// Cleanup
afterEach(() => {
  vi.clearAllMocks();
});