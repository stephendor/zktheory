import React, { useEffect, useRef } from 'react';

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

  useEffect(() => {
    // Load MathJax if not already loaded
    if (!window.MathJax) {
      const script = document.createElement('script');
      script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6';
      script.onload = () => {
        const mathJaxScript = document.createElement('script');
        mathJaxScript.id = 'MathJax-script';
        mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        mathJaxScript.onload = () => {
          window.MathJax = {
            tex: {
              inlineMath: [['$', '$'], ['\\(', '\\)']],
              displayMath: [['$$', '$$'], ['\\[', '\\]']],
              processEscapes: true,
              processEnvironments: true
            },
            options: {
              ignoreHtmlClass: 'tex2jax_ignore',
              processHtmlClass: 'tex2jax_process'
            }
          };
          renderMath();
        };
        document.head.appendChild(mathJaxScript);
      };
      document.head.appendChild(script);
    } else {
      renderMath();
    }

    function renderMath() {
      if (window.MathJax && mathRef.current) {
        window.MathJax.typesetPromise([mathRef.current]).catch((err: any) => {
          console.error('MathJax rendering error:', err);
        });
      }
    }
  }, [math, display]);

  const formattedMath = display ? `$$${math}$$` : `$${math}$`;

  return (
    <div
      ref={mathRef}
      className={`tex2jax_process ${display ? 'block text-center my-4' : 'inline'} ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedMath }}
    />
  );
}
