import React, { useState, useCallback, useMemo } from 'react';
import KaTeX from '../KaTeX/KaTeX';
import MathJax from '../MathJax/MathJax';

interface MathProps {
    children: string;
    display?: boolean; // true for block equations, false for inline
    className?: string;
    forceEngine?: 'katex' | 'mathjax'; // Allow manual override
}

// List of LaTeX features that require MathJax (KaTeX doesn't support these)
const MATHJAX_REQUIRED_FEATURES = [
    // Advanced environments
    '\\begin{align}',
    '\\begin{alignat}',
    '\\begin{gather}',
    '\\begin{multline}',
    '\\begin{subequations}',
    '\\begin{split}',
    '\\begin{cases*}',

    // Advanced math constructs
    '\\require{',
    '\\newcommand{',
    '\\DeclareMathOperator{',
    '\\def\\',
    '\\gdef\\',
    '\\edef\\',
    '\\xdef\\',

    // Complex symbols and extensions
    '\\unicode{',
    '\\char"',
    '\\mathchoice{',

    // Chemistry and physics
    '\\ce{',
    '\\pu{',
    '\\mhchem{',

    // Advanced spacing and formatting
    '\\phantom{',
    '\\hphantom{',
    '\\vphantom{',
    '\\smash{',
    '\\raisebox{',
    '\\makebox{',
    '\\framebox{',

    // References and labels
    '\\label{',
    '\\ref{',
    '\\eqref{',
    '\\pageref{',

    // Advanced arrays and tables
    '\\begin{array}',
    '\\begin{matrix*}',
    '\\begin{pmatrix*}',
    '\\begin{bmatrix*}',
    '\\begin{Bmatrix*}',
    '\\begin{vmatrix*}',

    // TikZ and complex diagrams
    '\\begin{tikz',
    '\\tikz{',
    '\\begin{pgfpicture}',

    // Color with complex syntax
    '\\textcolor{',
    '\\colorbox{',
    '\\fcolorbox{',

    // Advanced font commands
    '\\mathrm{',
    '\\mathit{',
    '\\mathbf{',
    '\\mathsf{',
    '\\mathtt{',
    '\\mathfrak{',
    '\\mathcal{',
    '\\mathscr{',
    '\\mathbb{'
];

// Features that suggest using MathJax but aren't strictly required
const PREFER_MATHJAX_FEATURES = [
    // Complex fractions and stacking
    '\\atop',
    '\\choose',
    '\\brace',
    '\\brack',

    // Advanced symbols that KaTeX might not render perfectly
    '\\mathscr{',
    '\\mathfrak{',
    '\\mathbb{',

    // Complex spacing
    '\\!',
    '\\,',
    '\\:',
    '\\;',
    '\\quad',
    '\\qquad'

    // Multiple equations or very long expressions (heuristic)
];

/**
 * Determines if the math expression requires MathJax or can use KaTeX
 */
function shouldUseMathJax(math: string, display: boolean = false): boolean {
    // Check for features that absolutely require MathJax
    for (const feature of MATHJAX_REQUIRED_FEATURES) {
        if (math.includes(feature)) {
            return true;
        }
    }

    // For display mode, prefer MathJax for complex expressions
    if (display) {
        // Check for features that suggest MathJax
        for (const feature of PREFER_MATHJAX_FEATURES) {
            if (math.includes(feature)) {
                return true;
            }
        }

        // Use MathJax for very long expressions (>200 chars) in display mode
        if (math.length > 200) {
            return true;
        }

        // Use MathJax if there are multiple lines or complex structures
        if (math.includes('\\\\') || math.includes('&')) {
            return true;
        }
    }

    // For inline math, prefer KaTeX for performance unless complex features are needed
    return false;
}

export default function Math({ children, display = false, className = '', forceEngine }: MathProps) {
    const [katexFailed, setKatexFailed] = useState(false);

    const math = typeof children === 'string' ? children.trim() : String(children || '').trim();

    // Determine which engine to use (moved before early return to satisfy hooks rule)
    const useKatex = useMemo(() => {
        if (!math) return false; // Handle empty math case
        if (forceEngine === 'mathjax') return false;
        if (forceEngine === 'katex') return true;
        if (katexFailed) return false; // Fallback to MathJax if KaTeX failed
        return !shouldUseMathJax(math, display);
    }, [math, display, forceEngine, katexFailed]);

    // Callback to handle KaTeX failures
    const handleKatexError = useCallback(() => {
        // Use console.error for production debugging without ESLint warning
        if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.warn('KaTeX failed to render, falling back to MathJax for:', math);
        }
        setKatexFailed(true);
    }, [math]);

    // Custom KaTeX component with error handling
    const KaTeXWithFallback = useCallback(() => {
        try {
            return <KaTeX math={math} display={display} className={className} throwOnError={true} />;
        } catch {
            handleKatexError();
            return null;
        }
    }, [math, display, className, handleKatexError]);

    // Handle empty math after hooks to satisfy React rules
    if (!math) {
        return <span className={className} aria-hidden="true"></span>;
    }

    if (useKatex && !katexFailed) {
        return <KaTeXWithFallback />;
    } else {
        return <MathJax math={math} display={display} className={className} />;
    }
}

// Export the decision function for testing
export { shouldUseMathJax };
