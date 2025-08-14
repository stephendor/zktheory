'use client';

import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';

// Mathematical visualization container types
export interface MathVisualizationProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  controls?: React.ReactNode;
  toolbar?: React.ReactNode;
  fullscreen?: boolean;
  exportable?: boolean;
  resizable?: boolean;
  loading?: boolean;
  error?: string;
  width?: string | number;
  height?: string | number;
  aspectRatio?: 'square' | 'golden' | 'widescreen' | 'custom';
  customRatio?: number;
  className?: string;
  onFullscreenToggle?: (isFullscreen: boolean) => void;
  onExport?: (format: 'png' | 'svg' | 'pdf') => void;
  onResize?: (width: number, height: number) => void;
}

// Mathematical chart/graph wrapper types
export interface MathChartProps extends MathVisualizationProps {
  type?: 'line' | 'scatter' | 'bar' | 'histogram' | 'heatmap' | 'surface' | '3d';
  data?: any;
  config?: any;
  interactive?: boolean;
  zoomable?: boolean;
  pannable?: boolean;
  brushable?: boolean;
}

// Performance monitoring for visualizations
export interface PerformanceMetrics {
  renderTime: number;
  frameRate: number;
  memoryUsage?: number;
  triangleCount?: number;
  vertexCount?: number;
}

export const MathVisualization: React.FC<MathVisualizationProps> = ({
  children,
  title,
  description,
  controls,
  toolbar,
  fullscreen = false,
  exportable = false,
  resizable = false,
  loading = false,
  error,
  width,
  height,
  aspectRatio = 'golden',
  customRatio,
  className,
  onFullscreenToggle,
  onExport,
  onResize,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(fullscreen);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    onFullscreenToggle?.(newFullscreenState);
  };

  // Handle export
  const handleExport = (format: 'png' | 'svg' | 'pdf') => {
    setShowExportMenu(false);
    onExport?.(format);
  };

  // Set up resize observer
  useEffect(() => {
    if (!resizable || !containerRef.current) return;

    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
        onResize?.(width, height);
      }
    });

    resizeObserverRef.current.observe(containerRef.current);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [resizable, onResize]);

  // Calculate aspect ratio
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'golden':
        return 'aspect-golden';
      case 'widescreen':
        return 'aspect-video';
      case 'custom':
        return '';
      default:
        return 'aspect-golden';
    }
  };

  const containerClasses = classNames(
    'math-viz-container relative',
    {
      // Fullscreen classes
      'fixed inset-0 z-50 bg-white': isFullscreen,
      'rounded-lg shadow-lg': !isFullscreen,
      
      // Aspect ratio classes
      [getAspectRatioClass()]: aspectRatio !== 'custom',
      
      // State classes
      'opacity-50 pointer-events-none': loading,
      'border-red-300 bg-red-50': error,
    },
    className
  );

  const contentClasses = classNames('relative w-full h-full', {
    'p-4': isFullscreen,
  });

  return (
    <div 
      ref={containerRef}
      className={containerClasses}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        aspectRatio: aspectRatio === 'custom' && customRatio ? `${customRatio}` : undefined,
      }}
    >
      {/* Header */}
      {(title || toolbar || exportable || isFullscreen) && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {title && (
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              )}
              {description && (
                <p className="text-sm text-gray-600">{description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Custom toolbar */}
              {toolbar}
              
              {/* Export menu */}
              {exportable && (
                <div className="relative">
                  <button
                    className="p-2 text-gray-600 hover:text-math-primary hover:bg-gray-100 rounded transition-colors"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    title="Export visualization"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  </button>
                  
                  {showExportMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-20 min-w-[120px]">
                      <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                        onClick={() => handleExport('png')}
                      >
                        Export PNG
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                        onClick={() => handleExport('svg')}
                      >
                        Export SVG
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
                        onClick={() => handleExport('pdf')}
                      >
                        Export PDF
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Fullscreen toggle */}
              <button
                className="p-2 text-gray-600 hover:text-math-primary hover:bg-gray-100 rounded transition-colors"
                onClick={handleFullscreenToggle}
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9V4.5M15 9h4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15v4.5M15 15h4.5M15 15l5.5 5.5" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
                  </svg>
                )}
              </button>
              
              {/* Close button (fullscreen only) */}
              {isFullscreen && (
                <button
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  onClick={handleFullscreenToggle}
                  title="Close fullscreen"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Controls sidebar */}
      {controls && (
        <div className="absolute top-0 right-0 bottom-0 w-80 bg-white/95 backdrop-blur-sm border-l border-gray-200 p-4 overflow-y-auto">
          {controls}
        </div>
      )}
      
      {/* Main content area */}
      <div className={contentClasses} style={{ paddingTop: title || toolbar ? '64px' : 0 }}>
        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-math-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600">Loading visualization...</p>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50/80 z-20">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-red-800 mb-2">Visualization Error</h4>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}
        
        {/* Visualization content */}
        {!loading && !error && children}
      </div>
      
      {/* Performance overlay */}
      {performance && (
        <div className="absolute bottom-4 left-4 bg-black/75 text-white text-xs p-2 rounded font-mono">
          <div>Render: {performance.renderTime.toFixed(1)}ms</div>
          <div>FPS: {performance.frameRate.toFixed(0)}</div>
          {performance.vertexCount && (
            <div>Vertices: {performance.vertexCount.toLocaleString()}</div>
          )}
        </div>
      )}
      
      {/* Resize indicator */}
      {resizable && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 font-mono">
          {Math.round(containerSize.width)} × {Math.round(containerSize.height)}
        </div>
      )}
    </div>
  );
};

// Mathematical chart wrapper component
export const MathChart: React.FC<MathChartProps> = ({
  type = 'line',
  data,
  config,
  interactive = true,
  zoomable = false,
  pannable = false,
  brushable = false,
  ...props
}) => {
  const chartControls = (
    <div className="space-y-4">
      <div className="border-b pb-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Chart Type</h4>
        <select 
          className="w-full p-2 border border-gray-300 rounded text-sm"
          value={type}
          onChange={() => {/* Handle chart type change */}}
        >
          <option value="line">Line Chart</option>
          <option value="scatter">Scatter Plot</option>
          <option value="bar">Bar Chart</option>
          <option value="histogram">Histogram</option>
          <option value="heatmap">Heatmap</option>
          <option value="surface">Surface Plot</option>
          <option value="3d">3D Visualization</option>
        </select>
      </div>
      
      <div className="border-b pb-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Interactions</h4>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" checked={interactive} className="mr-2" />
            <span className="text-sm">Interactive</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" checked={zoomable} className="mr-2" />
            <span className="text-sm">Zoomable</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" checked={pannable} className="mr-2" />
            <span className="text-sm">Pannable</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" checked={brushable} className="mr-2" />
            <span className="text-sm">Brushable</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <MathVisualization 
      controls={chartControls}
      {...props}
    >
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>Mathematical {type} chart visualization</p>
          <p className="text-sm mt-1">Chart implementation would go here</p>
        </div>
      </div>
    </MathVisualization>
  );
};

export default MathVisualization;