import React, { useEffect, useRef, useState } from 'react';

interface MathJaxProps {
  math: string;
  display?: boolean; // true for block equations, false for inline
  className?: string;
}

declare global {
  interface Window {
    MathJax: any;
  }
}

export default function MathJax({ math, display = false, className = '' }: MathJaxProps) {
  const mathRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load MathJax if not already loaded
    if (!window.MathJax) {
      // Configure MathJax before loading
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
          processEnvironments: true,
          processRefs: true
        },
        options: {
          ignoreHtmlClass: 'tex2jax_ignore',
          processHtmlClass: 'tex2jax_process'
        },
        startup: {
          ready: () => {
            console.log('MathJax is loaded and ready');
            window.MathJax.startup.defaultReady();
            setIsLoaded(true);
            renderMath();
          }
        }
      };

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
      renderMath();
    }

    function renderMath() {
      if (window.MathJax && window.MathJax.typesetPromise && mathRef.current) {
        window.MathJax.typesetPromise([mathRef.current]).catch((err: any) => {
          console.error('MathJax rendering error:', err);
        });
      }
    }
  }, [math]);

  useEffect(() => {
    if (isLoaded && window.MathJax && mathRef.current) {
      window.MathJax.typesetPromise([mathRef.current]).catch((err: any) => {
        console.error('MathJax rendering error:', err);
      });
    }
  }, [math, display, isLoaded]);

  // Don't add extra $ symbols if they're already present
  const formattedMath = (() => {
    // Ensure math is a string and handle edge cases
    const mathString = typeof math === 'string' ? math : String(math || '');
    const trimmed = mathString.trim();
    
    if (!trimmed) {
      return display ? '$$$$' : '$$'; // Empty math expression
    }
    
    if (display) {
      return trimmed.startsWith('$$') && trimmed.endsWith('$$') ? trimmed : `$$${trimmed}$$`;
    } else {
      return trimmed.startsWith('$') && trimmed.endsWith('$') ? trimmed : `$${trimmed}$`;
    }
  })();

  return (
    <div
      ref={mathRef}
      className={`tex2jax_process ${display ? 'block text-center my-4 p-2' : 'inline'} ${className}`}
    >
      {formattedMath}
    </div>
  );
}
