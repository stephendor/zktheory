import React, { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { usePerformanceMonitor } from '../../../lib/performance';

interface KaTeXProps {
    math: string;
    display?: boolean; // true for block equations, false for inline
    className?: string;
    throwOnError?: boolean;
}

export default function KaTeX({ math, display = false, className = '', throwOnError = false }: KaTeXProps) {
    const mathRef = useRef<HTMLDivElement>(null);
    const [renderedMath, setRenderedMath] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    
    // Performance monitoring
    const { startTimer } = usePerformanceMonitor('katex', 'rendering');

    // Check if we're on the client side
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || !math) return;

        console.log('📚 KaTeX: Starting math rendering with performance monitoring');
        const stopTimer = startTimer();

        try {
            const cleanMath = typeof math === 'string' ? math.trim() : String(math || '').trim();

            if (!cleanMath) {
                setRenderedMath('');
                setError(null);
                console.log('⚠️ KaTeX: No math content, stopping timer early');
                stopTimer();
                return;
            }

            const rendered = katex.renderToString(cleanMath, {
                displayMode: display,
                throwOnError: throwOnError,
                errorColor: '#cc0000',
                strict: false,
                trust: false,
                macros: {
                    '\\RR': '\\mathbb{R}',
                    '\\CC': '\\mathbb{C}',
                    '\\ZZ': '\\mathbb{Z}',
                    '\\QQ': '\\mathbb{Q}',
                    '\\NN': '\\mathbb{N}',
                    '\\FF': '\\mathbb{F}',
                    '\\rank': '\\operatorname{rank}',
                    '\\dim': '\\operatorname{dim}',
                    '\\ker': '\\operatorname{ker}',
                    '\\im': '\\operatorname{im}',
                    '\\coker': '\\operatorname{coker}',
                    '\\Hom': '\\operatorname{Hom}',
                    '\\End': '\\operatorname{End}',
                    '\\Aut': '\\operatorname{Aut}',
                    '\\Gal': '\\operatorname{Gal}',
                    '\\tr': '\\operatorname{tr}',
                    '\\det': '\\operatorname{det}',
                    '\\lcm': '\\operatorname{lcm}',
                    '\\gcd': '\\operatorname{gcd}'
                }
            });

            setRenderedMath(rendered);
            setError(null);
            console.log('✅ KaTeX: Math rendered successfully, stopping timer');
            stopTimer();
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'KaTeX rendering error';
            // Safe environment check for development logging
            const isDevelopment = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';
            if (isDevelopment) {
                // eslint-disable-next-line no-console
                console.warn('KaTeX rendering error:', errorMsg, 'for math:', math);
            }

            if (throwOnError) {
                setError(errorMsg);
                setRenderedMath('');
            } else {
                // Fallback: display the raw math
                setRenderedMath(`<span class="math-error">${math}</span>`);
                setError(null);
            }
            console.log('❌ KaTeX: Error occurred, stopping timer');
            stopTimer();
        }
    }, [math, display, throwOnError, isClient, startTimer]);

    // Don't render on server side to prevent hydration mismatches
    if (!isClient) {
        return (
            <span className={`${display ? 'block text-center my-4 p-2' : 'inline'} ${className}`}>
                {/* Placeholder for server-side rendering */}
                <span className="sr-only">Loading math...</span>
            </span>
        );
    }

    if (error) {
        return (
            <span className={`${display ? 'block text-center my-4 p-2' : 'inline'} ${className}`}>
                <span className="math-error">Math Error: {error}</span>
            </span>
        );
    }

    return (
        <span
            ref={mathRef}
            className={`${display ? 'block text-center my-4 p-2' : 'inline'} ${className}`}
            dangerouslySetInnerHTML={{ __html: renderedMath }}
            aria-label={`Mathematical expression: ${math}`}
        />
    );
}
