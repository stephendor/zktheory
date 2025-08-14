'use client';

import React, { useRef, useEffect, useState } from 'react';
import classNames from 'classnames';

// Mathematical display component types
export interface MathDisplayProps {
  children: React.ReactNode;
  variant?: 'inline' | 'block' | 'theorem' | 'proof' | 'definition';
  semantic?: 'formula' | 'equation' | 'expression' | 'result' | 'statement';
  centered?: boolean;
  numbered?: boolean;
  label?: string;
  copyable?: boolean;
  expandable?: boolean;
  highlight?: boolean;
  animation?: 'fade-in' | 'slide-up' | 'scale-in' | 'bounce-in' | 'none';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  id?: string;
}

// Mathematical theorem/proof block types
export interface MathBlockProps extends Omit<MathDisplayProps, 'variant'> {
  title?: string;
  author?: string;
  date?: string;
  tags?: string[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// Copy to clipboard functionality
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    }
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

// Extract text content from React nodes
const extractTextContent = (children: React.ReactNode): string => {
  if (typeof children === 'string') {
    return children;
  }
  if (typeof children === 'number') {
    return children.toString();
  }
  if (React.isValidElement(children)) {
    return extractTextContent((children.props as any).children);
  }
  if (Array.isArray(children)) {
    return children.map(extractTextContent).join('');
  }
  return '';
};

export const MathDisplay: React.FC<MathDisplayProps> = ({
  children,
  variant = 'inline',
  semantic = 'expression',
  centered = false,
  numbered = false,
  label,
  copyable = false,
  expandable = false,
  highlight = false,
  animation = 'none',
  fontSize = 'base',
  className,
  id,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!expandable);
  const [isHighlighted, setIsHighlighted] = useState(highlight);
  const displayRef = useRef<HTMLDivElement>(null);
  const [equationNumber, setEquationNumber] = useState<number>(0);

  // Auto-increment equation numbering (simplified)
  useEffect(() => {
    if (numbered && variant === 'block') {
      // In a real implementation, this would be managed by a context provider
      const currentCount = document.querySelectorAll('[data-equation-numbered="true"]').length;
      setEquationNumber(currentCount + 1);
    }
  }, [numbered, variant]);

  // Handle copy functionality
  const handleCopy = async () => {
    if (!copyable) return;
    
    const textContent = extractTextContent(children);
    const success = await copyToClipboard(textContent);
    
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Handle expand/collapse
  const toggleExpanded = () => {
    if (expandable) {
      setIsExpanded(!isExpanded);
    }
  };

  // Determine container classes
  const containerClasses = classNames(
    {
      // Base variant classes
      'math-display-inline': variant === 'inline',
      'math-display-block': variant === 'block' || variant === 'theorem' || variant === 'proof' || variant === 'definition',
      'math-theorem-block': variant === 'theorem',
      'math-proof-block': variant === 'proof',
      'math-definition-block': variant === 'definition',
      
      // Semantic classes
      'text-math-primary': semantic === 'formula' || semantic === 'equation',
      'text-math-result': semantic === 'result',
      'text-math-secondary': semantic === 'statement',
      
      // Layout classes
      'text-center': centered,
      'text-left': !centered && variant === 'block',
      
      // Size classes
      'text-math-sm': fontSize === 'sm',
      'text-base': fontSize === 'base',
      'text-proof': fontSize === 'lg',
      'text-theorem': fontSize === 'xl',
      'text-formula-xl': fontSize === '2xl',
      'text-formula-3xl': fontSize === '3xl',
      
      // State classes
      'bg-yellow-100 border-yellow-300': isHighlighted,
      'cursor-pointer hover:shadow-md': expandable,
      'shadow-math-hover': copyable,
      
      // Animation classes
      'math-fade-in': animation === 'fade-in',
      'math-slide-up': animation === 'slide-up',
      'math-scale-in': animation === 'scale-in',
      'math-bounce-in': animation === 'bounce-in',
      
      // Transition classes
      'transition-golden': true,
    },
    className
  );

  // Special handling for inline display
  if (variant === 'inline') {
    return (
      <span 
        className={containerClasses}
        onClick={copyable ? handleCopy : undefined}
        ref={displayRef}
        id={id}
      >
        {children}
        {copyable && (
          <span className="ml-1 text-xs opacity-50 hover:opacity-100 transition-opacity">
            {isCopied ? '✓' : '📋'}
          </span>
        )}
      </span>
    );
  }

  return (
    <div 
      className={classNames('relative group', {
        'mb-6': variant === 'block',
        'mb-8': variant === 'theorem' || variant === 'proof' || variant === 'definition'
      })}
      ref={displayRef}
      id={id}
      data-equation-numbered={numbered ? 'true' : 'false'}
    >
      {/* Block content */}
      <div 
        className={containerClasses}
        onClick={expandable ? toggleExpanded : undefined}
      >
        {/* Expandable indicator */}
        {expandable && (
          <div className="absolute top-2 right-2 text-gray-400 group-hover:text-gray-600 transition-colors">
            <svg 
              className={classNames('w-4 h-4 transition-transform', {
                'rotate-180': isExpanded
              })} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
        
        {/* Content */}
        <div className={classNames({ 'hidden': expandable && !isExpanded })}>
          {children}
        </div>
        
        {/* Collapsed preview */}
        {expandable && !isExpanded && (
          <div className="text-gray-500 italic">
            Click to expand {semantic}...
          </div>
        )}
        
        {/* Equation number */}
        {numbered && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 font-mono">
            ({equationNumber})
          </div>
        )}
        
        {/* Label */}
        {label && (
          <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
            {label}
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        {copyable && (
          <button
            onClick={handleCopy}
            className="p-1 bg-white border border-gray-200 rounded shadow-sm hover:shadow-md text-xs transition-shadow"
            title="Copy to clipboard"
          >
            {isCopied ? (
              <span className="text-math-accent">✓</span>
            ) : (
              <span className="text-gray-600">📋</span>
            )}
          </button>
        )}
        
        {variant === 'block' && (
          <button
            onClick={() => setIsHighlighted(!isHighlighted)}
            className="p-1 bg-white border border-gray-200 rounded shadow-sm hover:shadow-md text-xs transition-shadow"
            title="Highlight"
          >
            <span className={classNames('transition-colors', {
              'text-yellow-500': isHighlighted,
              'text-gray-600': !isHighlighted
            })}>
              ✨
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

// Specialized mathematical block components
export const TheoremBlock: React.FC<MathBlockProps> = ({ 
  title = 'Theorem', 
  author,
  date,
  tags,
  collapsible = false,
  defaultExpanded = true,
  children,
  ...props 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="math-theorem-block relative">
      {/* Header */}
      <div 
        className={classNames('flex items-center justify-between mb-4', {
          'cursor-pointer': collapsible
        })}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-theorem font-semibold text-math-accent">{title}</h3>
          {author && (
            <span className="text-sm text-gray-600">by {author}</span>
          )}
          {date && (
            <span className="text-xs text-gray-500">({date})</span>
          )}
        </div>
        
        {collapsible && (
          <svg 
            className={classNames('w-5 h-5 text-gray-400 transition-transform', {
              'rotate-180': isExpanded
            })} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
      
      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex gap-2 mb-4">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Content */}
      <div className={classNames('transition-all duration-300', {
        'hidden': collapsible && !isExpanded,
        'math-fade-in': isExpanded
      })}>
        <MathDisplay variant="theorem" {...props}>
          {children}
        </MathDisplay>
      </div>
    </div>
  );
};

export const ProofBlock: React.FC<MathBlockProps> = ({ 
  title = 'Proof',
  collapsible = true,
  defaultExpanded = false,
  children, 
  ...props 
}) => {
  return (
    <TheoremBlock 
      title={title}
      collapsible={collapsible}
      defaultExpanded={defaultExpanded}
      {...props}
    >
      <MathDisplay variant="proof">
        {children}
      </MathDisplay>
    </TheoremBlock>
  );
};

export const DefinitionBlock: React.FC<MathBlockProps> = ({ 
  title = 'Definition',
  children, 
  ...props 
}) => {
  return (
    <MathDisplay variant="definition" {...props}>
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-math-warning mb-2">{title}</h4>
        {children}
      </div>
    </MathDisplay>
  );
};

// Formula display with LaTeX-like styling
export const FormulaDisplay: React.FC<Omit<MathDisplayProps, 'variant'>> = ({
  centered = true,
  numbered = false,
  fontSize = '2xl',
  ...props
}) => (
  <MathDisplay 
    variant="block" 
    semantic="formula"
    centered={centered}
    numbered={numbered}
    fontSize={fontSize}
    copyable={true}
    animation="scale-in"
    {...props} 
  />
);

export default MathDisplay;