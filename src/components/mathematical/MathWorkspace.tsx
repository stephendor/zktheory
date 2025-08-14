'use client';

import React, { useState, useRef, useCallback } from 'react';
import classNames from 'classnames';

// Mathematical workspace component types
export interface MathWorkspaceProps {
  children?: React.ReactNode;
  layout?: 'single' | 'split' | 'grid' | 'tabs';
  orientation?: 'horizontal' | 'vertical';
  resizable?: boolean;
  collapsible?: boolean;
  defaultSizes?: number[];
  minSizes?: number[];
  maxSizes?: number[];
  className?: string;
  onLayoutChange?: (sizes: number[]) => void;
}

// Mathematical workspace panel types
export interface MathPanelProps {
  title?: string;
  icon?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  size?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
  children: React.ReactNode;
}

// Mathematical toolbar types
export interface MathToolbarProps {
  tools?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    separator?: boolean;
  }>;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MathPanel: React.FC<MathPanelProps> = ({
  title,
  icon,
  collapsible = false,
  defaultCollapsed = false,
  className,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapsed = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const panelClasses = classNames(
    'math-panel bg-white border border-gray-200 rounded-lg overflow-hidden',
    'transition-all duration-300',
    {
      'h-auto': !isCollapsed,
      'h-12': isCollapsed,
    },
    className
  );

  return (
    <div className={panelClasses}>
      {/* Panel header */}
      {(title || collapsible) && (
        <div 
          className={classNames(
            'flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200',
            {
              'cursor-pointer hover:bg-gray-100': collapsible,
              'border-b-0': isCollapsed,
            }
          )}
          onClick={toggleCollapsed}
        >
          <div className="flex items-center gap-2">
            {icon && <div className="text-math-primary">{icon}</div>}
            {title && (
              <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
            )}
          </div>
          
          {collapsible && (
            <svg 
              className={classNames('w-4 h-4 text-gray-500 transition-transform', {
                'rotate-180': isCollapsed
              })} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      )}
      
      {/* Panel content */}
      <div className={classNames('transition-all duration-300', {
        'opacity-0 h-0 overflow-hidden': isCollapsed,
        'opacity-100': !isCollapsed,
      })}>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export const MathToolbar: React.FC<MathToolbarProps> = ({
  tools = [],
  orientation = 'horizontal',
  size = 'md',
  className,
}) => {
  const toolbarClasses = classNames(
    'math-toolbar bg-white border border-gray-200 rounded-lg p-2',
    'flex gap-1',
    {
      'flex-row': orientation === 'horizontal',
      'flex-col': orientation === 'vertical',
      'h-fit': orientation === 'horizontal',
      'w-fit': orientation === 'vertical',
    },
    className
  );

  const getButtonClasses = (tool: any) => classNames(
    'flex items-center justify-center transition-colors rounded',
    'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-math-primary focus:ring-opacity-50',
    {
      // Size classes
      'w-8 h-8': size === 'sm',
      'w-10 h-10': size === 'md', 
      'w-12 h-12': size === 'lg',
      
      // State classes
      'bg-math-primary text-white hover:bg-blue-600': tool.active,
      'text-gray-600': !tool.active,
      'opacity-50 cursor-not-allowed': tool.disabled,
    }
  );

  return (
    <div className={toolbarClasses}>
      {tools.map((tool, index) => (
        <React.Fragment key={tool.id}>
          {tool.separator && index > 0 && (
            <div className={classNames('bg-gray-300', {
              'w-px h-6 my-auto': orientation === 'horizontal',
              'h-px w-6 mx-auto': orientation === 'vertical',
            })} />
          )}
          
          <button
            className={getButtonClasses(tool)}
            onClick={tool.onClick}
            disabled={tool.disabled}
            title={tool.label}
          >
            {tool.icon || (
              <span className="text-xs font-medium">
                {tool.label.charAt(0).toUpperCase()}
              </span>
            )}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export const MathWorkspace: React.FC<MathWorkspaceProps> = ({
  children,
  layout = 'single',
  orientation = 'horizontal',
  resizable = false,
  collapsible = false,
  defaultSizes = [],
  className,
  onLayoutChange,
}) => {
  const [sizes, setSizes] = useState<number[]>(defaultSizes);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number>(-1);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((index: number) => (e: React.MouseEvent) => {
    if (!resizable) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragIndex(index);
  }, [resizable]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || dragIndex === -1 || !workspaceRef.current) return;

    const rect = workspaceRef.current.getBoundingClientRect();
    const total = orientation === 'horizontal' ? rect.width : rect.height;
    const position = orientation === 'horizontal' 
      ? e.clientX - rect.left 
      : e.clientY - rect.top;
    
    const percentage = (position / total) * 100;
    
    // Update sizes based on drag
    const newSizes = [...sizes];
    // Simplified resize logic - in a real implementation, this would be more sophisticated
    newSizes[dragIndex] = Math.max(10, Math.min(90, percentage));
    
    setSizes(newSizes);
    onLayoutChange?.(newSizes);
  }, [isDragging, dragIndex, orientation, sizes, onLayoutChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragIndex(-1);
  }, []);

  // Add event listeners for drag functionality
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    
    // Return undefined when not dragging (no cleanup needed)
    return undefined;
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const workspaceClasses = classNames(
    'math-workspace',
    {
      // Layout classes
      'flex': layout === 'split',
      'grid': layout === 'grid',
      'flex-row': layout === 'split' && orientation === 'horizontal',
      'flex-col': layout === 'split' && orientation === 'vertical',
      'grid-cols-2': layout === 'grid',
      
      // State classes
      'select-none': isDragging,
    },
    className
  );

  const childrenArray = React.Children.toArray(children);

  if (layout === 'single') {
    return (
      <div className={classNames('math-workspace', className)} ref={workspaceRef}>
        {children}
      </div>
    );
  }

  if (layout === 'split') {
    return (
      <div className={workspaceClasses} ref={workspaceRef}>
        {childrenArray.map((child, index) => (
          <React.Fragment key={index}>
            <div 
              className="flex-1 min-w-0 min-h-0"
              style={{
                flexBasis: sizes[index] ? `${sizes[index]}%` : 'auto',
              }}
            >
              {child}
            </div>
            
            {/* Resize handle */}
            {resizable && index < childrenArray.length - 1 && (
              <div 
                className={classNames(
                  'bg-gray-300 hover:bg-math-primary transition-colors cursor-col-resize',
                  {
                    'w-1 cursor-col-resize': orientation === 'horizontal',
                    'h-1 cursor-row-resize': orientation === 'vertical',
                  }
                )}
                onMouseDown={handleMouseDown(index)}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className={workspaceClasses} ref={workspaceRef}>
        {children}
      </div>
    );
  }

  if (layout === 'tabs') {
    const [activeTab, setActiveTab] = useState(0);
    
    return (
      <div className={classNames('math-workspace', className)} ref={workspaceRef}>
        {/* Tab headers */}
        <div className="flex border-b border-gray-200 mb-4">
          {childrenArray.map((child, index) => {
            const title = React.isValidElement(child) && (child.props as any).title 
              ? (child.props as any).title 
              : `Tab ${index + 1}`;
              
            return (
              <button
                key={index}
                className={classNames(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  'border-b-2 border-transparent hover:text-math-primary',
                  {
                    'text-math-primary border-math-primary': activeTab === index,
                    'text-gray-600': activeTab !== index,
                  }
                )}
                onClick={() => setActiveTab(index)}
              >
                {title}
              </button>
            );
          })}
        </div>
        
        {/* Tab content */}
        <div className="flex-1">
          {childrenArray[activeTab]}
        </div>
      </div>
    );
  }

  return <div className={workspaceClasses}>{children}</div>;
};

export default MathWorkspace;