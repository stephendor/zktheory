import React, { useEffect, useRef, useState } from 'react';

interface MermaidProps {
  chart: string;
  className?: string;
  id?: string;
}

export default function Mermaid({ chart, className = '', id }: MermaidProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

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

        if (elementRef.current) {
          const uniqueId = id || `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          elementRef.current.id = uniqueId;
          
          try {
            const { svg } = await mermaid.render(uniqueId, chart);
            elementRef.current.innerHTML = svg;
            setIsLoaded(true);
          } catch (error) {
            console.error('Mermaid rendering error:', error);
            elementRef.current.innerHTML = `
              <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-800 text-sm">Error rendering diagram</p>
                <pre class="text-xs text-red-600 mt-2 overflow-auto">${error}</pre>
              </div>
            `;
          }
        }
      } catch (error) {
        console.error('Failed to load Mermaid:', error);
      }
    };

    loadMermaid();
  }, [chart, id]);

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
