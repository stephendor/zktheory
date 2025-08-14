'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import classNames from 'classnames';

// Mathematical input component types
export interface MathInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  variant?: 'formula' | 'parameter' | 'matrix' | 'vector' | 'standard';
  semantic?: 'variable' | 'constant' | 'operator' | 'result' | 'neutral';
  onMathChange?: (value: string, parsedValue?: number | null) => void;
  onValidation?: (isValid: boolean, errorMessage?: string) => void;
  mathExpression?: boolean;
  precision?: number;
  allowedOperators?: string[];
  showValidation?: boolean;
  latexPreview?: boolean;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
}

// Mathematical input validation
const validateMathExpression = (
  value: string, 
  allowedOperators: string[] = ['+', '-', '*', '/', '^', '(', ')', '.'],
  min?: number,
  max?: number
): { isValid: boolean; errorMessage?: string; parsedValue?: number | null } => {
  if (!value.trim()) {
    return { isValid: true, parsedValue: null };
  }

  // Basic mathematical expression validation
  const mathRegex = /^[0-9+\-*/^().e\s]*$/;
  const hasValidChars = mathRegex.test(value);
  
  if (!hasValidChars) {
    return { 
      isValid: false, 
      errorMessage: 'Invalid characters in mathematical expression',
      parsedValue: null 
    };
  }

  // Check balanced parentheses
  let parenthesesCount = 0;
  for (const char of value) {
    if (char === '(') parenthesesCount++;
    if (char === ')') parenthesesCount--;
    if (parenthesesCount < 0) {
      return { 
        isValid: false, 
        errorMessage: 'Unbalanced parentheses',
        parsedValue: null 
      };
    }
  }
  
  if (parenthesesCount !== 0) {
    return { 
      isValid: false, 
      errorMessage: 'Unbalanced parentheses',
      parsedValue: null 
    };
  }

  // Try to evaluate the expression safely
  let parsedValue: number | null = null;
  try {
    // Basic safe evaluation for simple expressions
    const sanitized = value.replace(/[^0-9+\-*/^().e\s]/g, '');
    if (sanitized !== value) {
      return { 
        isValid: false, 
        errorMessage: 'Expression contains invalid characters',
        parsedValue: null 
      };
    }
    
    // Simple numeric evaluation
    if (/^[-+]?\d*\.?\d+([eE][-+]?\d+)?$/.test(value.trim())) {
      parsedValue = parseFloat(value);
      
      // Check min/max bounds
      if (min !== undefined && parsedValue < min) {
        return {
          isValid: false,
          errorMessage: `Value must be at least ${min}`,
          parsedValue
        };
      }
      
      if (max !== undefined && parsedValue > max) {
        return {
          isValid: false,
          errorMessage: `Value must be at most ${max}`,
          parsedValue
        };
      }
    }
  } catch (error) {
    return { 
      isValid: false, 
      errorMessage: 'Invalid mathematical expression',
      parsedValue: null 
    };
  }

  return { isValid: true, parsedValue };
};

// Format mathematical expressions for display
const formatMathExpression = (value: string, precision?: number): string => {
  if (!value) return '';
  
  // If it's a simple number, format with precision
  const numericValue = parseFloat(value);
  if (!isNaN(numericValue) && precision !== undefined) {
    return numericValue.toFixed(precision);
  }
  
  return value;
};

export const MathInput = forwardRef<HTMLInputElement, MathInputProps>(({
  variant = 'standard',
  semantic = 'neutral',
  className,
  onMathChange,
  onValidation,
  mathExpression = false,
  precision,
  allowedOperators,
  showValidation = true,
  latexPreview = false,
  unit,
  min,
  max,
  step,
  onBlur,
  onFocus,
  ...props
}, ref) => {
  const [value, setValue] = useState<string>(props.defaultValue?.toString() || '');
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Combine refs
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(inputRef.current);
      } else {
        ref.current = inputRef.current;
      }
    }
  }, [ref]);

  // Validation effect
  useEffect(() => {
    if (mathExpression && value) {
      const validation = validateMathExpression(value, allowedOperators, min, max);
      setIsValid(validation.isValid);
      setErrorMessage(validation.errorMessage || '');
      
      if (onValidation) {
        onValidation(validation.isValid, validation.errorMessage);
      }
      
      if (onMathChange) {
        onMathChange(value, validation.parsedValue);
      }
    } else if (onMathChange) {
      const numericValue = value ? parseFloat(value) : null;
      onMathChange(value, numericValue);
    }
  }, [value, mathExpression, allowedOperators, min, max, onValidation, onMathChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (onMathChange) {
      onMathChange(newValue, parseFloat(newValue) || null);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    
    // Format value on blur if precision is specified
    if (precision !== undefined && value) {
      const formatted = formatMathExpression(value, precision);
      if (formatted !== value) {
        setValue(formatted);
      }
    }
    
    if (onBlur) onBlur(e);
  };

  // Determine CSS classes based on variant and semantic meaning
  const inputClasses = classNames(
    'math-input',
    {
      // Variant classes
      'math-input-formula': variant === 'formula',
      'math-input-parameter': variant === 'parameter',
      'math-input-matrix': variant === 'matrix',
      'math-input-vector': variant === 'vector',
      
      // Semantic classes
      'text-math-variable': semantic === 'variable',
      'text-math-constant': semantic === 'constant',
      'text-math-operator': semantic === 'operator',
      'text-math-result': semantic === 'result',
      
      // State classes
      'border-math-error': !isValid && showValidation,
      'border-math-accent': isValid && showValidation && value,
      'border-math-primary': isFocused,
      
      // Animation classes
      'transition-golden': true,
      'math-fade-in': isFocused,
    },
    className
  );

  const containerClasses = classNames('relative inline-block', {
    'w-full': variant !== 'parameter' && variant !== 'matrix' && variant !== 'vector',
  });

  return (
    <div className={containerClasses}>
      <input
        ref={inputRef}
        className={inputClasses}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        type={mathExpression ? 'text' : 'number'}
        min={min}
        max={max}
        step={step}
        {...props}
      />
      
      {/* Unit display */}
      {unit && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 font-math-code">
          {unit}
        </span>
      )}
      
      {/* Validation message */}
      {showValidation && !isValid && errorMessage && (
        <div className="absolute top-full left-0 mt-1 text-xs text-math-error bg-white border border-math-error rounded px-2 py-1 shadow-md z-10 math-fade-in">
          {errorMessage}
        </div>
      )}
      
      {/* Success indicator */}
      {showValidation && isValid && value && mathExpression && (
        <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 ml-2">
          <div className="w-2 h-2 bg-math-accent rounded-full math-scale-in"></div>
        </div>
      )}
      
      {/* LaTeX preview (placeholder for future implementation) */}
      {latexPreview && mathExpression && value && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-white border border-gray-200 rounded shadow-lg z-20 math-slide-up">
          <div className="text-xs text-gray-500 mb-1">Preview:</div>
          <div className="math-formula text-sm">{value}</div>
        </div>
      )}
    </div>
  );
});

MathInput.displayName = 'MathInput';

// Specialized mathematical input components
export const FormulaInput: React.FC<Omit<MathInputProps, 'variant'>> = (props) => (
  <MathInput variant="formula" mathExpression={true} latexPreview={true} {...props} />
);

export const ParameterInput: React.FC<Omit<MathInputProps, 'variant'>> = (props) => (
  <MathInput variant="parameter" showValidation={true} {...props} />
);

export const MatrixInput: React.FC<Omit<MathInputProps, 'variant'>> = (props) => (
  <MathInput variant="matrix" {...props} />
);

export const VectorInput: React.FC<Omit<MathInputProps, 'variant'>> = (props) => (
  <MathInput variant="vector" {...props} />
);

export default MathInput;