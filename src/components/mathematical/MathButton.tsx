'use client';

import React, { useState, useRef } from 'react';
import classNames from 'classnames';

// Mathematical button component types
export interface MathButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  variant?: 'primary' | 'secondary' | 'operator' | 'function' | 'constant' | 'variable';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'rectangular' | 'circular' | 'rounded';
  mathematical?: boolean;
  symbol?: string;
  subscript?: string;
  superscript?: string;
  tooltip?: string;
  shortcut?: string;
  active?: boolean;
  pulsing?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>, symbol?: string) => void;
}

export const MathButton: React.FC<MathButtonProps> = ({
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  mathematical = false,
  symbol,
  subscript,
  superscript,
  tooltip,
  shortcut,
  active = false,
  pulsing = false,
  loading = false,
  children,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (tooltip) setShowTooltip(true);
    if (onMouseEnter) onMouseEnter(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowTooltip(false);
    if (onMouseLeave) onMouseLeave(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e, symbol);
    }
  };

  // Determine button classes
  const buttonClasses = classNames(
    'math-btn',
    {
      // Variant classes
      'math-btn-primary': variant === 'primary',
      'math-btn-secondary': variant === 'secondary',
      'math-btn-operator': variant === 'operator',
      'math-btn-function': variant === 'function',
      'math-btn-constant': variant === 'constant',
      
      // Size classes
      'px-2 py-1 text-sm': size === 'sm',
      'px-4 py-2 text-base': size === 'md',
      'px-6 py-3 text-lg': size === 'lg',
      'px-8 py-4 text-xl': size === 'xl',
      
      // Shape classes
      'rounded-none': shape === 'rectangular',
      'rounded-full': shape === 'circular',
      'rounded-lg': shape === 'rounded',
      
      // State classes
      'ring-2 ring-math-primary ring-opacity-50': active,
      'transform scale-95': isPressed,
      'animate-pulse': pulsing,
      'opacity-50 cursor-not-allowed': props.disabled,
      
      // Mathematical styling
      'font-mathematical': mathematical || symbol,
      'font-math-code': variant === 'function',
    },
    className
  );

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        className={buttonClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onClick={handleClick}
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <span className="relative inline-flex items-center">
            {symbol && (
              <span className="relative">
                {symbol}
                {subscript && (
                  <span className="absolute -bottom-1 -right-2 text-xs">
                    {subscript}
                  </span>
                )}
                {superscript && (
                  <span className="absolute -top-1 -right-2 text-xs">
                    {superscript}
                  </span>
                )}
              </span>
            )}
            {children}
          </span>
        )}
      </button>
      
      {/* Tooltip */}
      {showTooltip && tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap z-50 math-fade-in">
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default MathButton;