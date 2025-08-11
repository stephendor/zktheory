'use client';

"use client";
import React, { useEffect, useRef, useState } from 'react';

interface MermaidProps {
  chart: string;
  className?: string;
  id?: string;
}

export default function Mermaid({ chart, className = '', id }: MermaidProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMermaid = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const mermaid = (await import('mermaid')).default;
        
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'Fira Code, Monaco, Consolas, monospace'
        });

        if (elementRef.current && chart) {
          const uniqueId = id || `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          elementRef.current.id = uniqueId;
          
          try {
            const { svg } = await mermaid.render(uniqueId, chart);
            if (elementRef.current) {
              elementRef.current.innerHTML = svg;
              setIsLoaded(true);
            }
          } catch (renderError) {
            setError(`Rendering error: ${renderError}`);
            if (elementRef.current) {
              elementRef.current.innerHTML = `
                <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-red-800 text-sm">Error rendering diagram</p>
                  <pre class="text-xs text-red-600 mt-2 overflow-auto">${renderError}</pre>
                </div>
              `;
            }
          }
        }
      } catch (loadError) {
        setError(`Failed to load Mermaid: ${loadError}`);
        if (elementRef.current) {
          elementRef.current.innerHTML = `
            <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-red-800 text-sm">Failed to load Mermaid library</p>
            </div>
          `;
        }
      }
    };

    if (chart) {
      loadMermaid();
    }
  }, [chart, id]);

  if (error) {
    return (
      <div className={`mermaid-error ${className}`}>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">Mermaid Error</p>
          <p className="text-xs text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!chart) {
    return (
      <div className={`mermaid-placeholder ${className}`}>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-600 text-sm">No diagram data provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`mermaid-container ${className}`}>
      {!isLoaded && (
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">Loading diagram...</span>
        </div>
      )}
      <div 
        ref={elementRef} 
        className={`mermaid-chart ${isLoaded ? 'block' : 'hidden'}`}
        style={{ textAlign: 'center' }}
      />
    </div>
  );
}
