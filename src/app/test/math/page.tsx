import React from 'react';
import type { Metadata } from 'next';
import Math from '../../../components/blocks/Math';

export const metadata: Metadata = {
    title: 'Mathematical Rendering Test',
    description: 'Test page for KaTeX and MathJax rendering capabilities'
};

// Sanitized expressions to avoid Prettier parse errors with raw LaTeX
const expr = {
    quadraticEq: String.raw`ax^2 + bx + c = 0`,
    quadraticSolutions: String.raw`x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}`,
    euler: String.raw`e^{i\\pi} + 1 = 0`,
    simple: String.raw`E = mc^2`,
    basel: String.raw`\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}`,
    groupTuple: String.raw`(G, \\cdot)`,
    groupOrder: String.raw`|G| = \\sum_{g \\in G} 1`
};

export default function MathTestPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Mathematical Rendering Test</h1>
                <p className="text-gray-600 mb-6">Testing KaTeX and MathJax integration with intelligent fallback.</p>
            </div>

            <div className="space-y-8">
                <section className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Inline Mathematics</h2>
                    <p className="mb-4">
                        The quadratic formula is <Math>{expr.quadraticEq}</Math>, and its solutions are <Math>{expr.quadraticSolutions}</Math>.
                    </p>
                    <p>
                        Euler&apos;s identity: <Math>{expr.euler}</Math> is beautiful.
                    </p>
                </section>

                <section className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Display Mathematics</h2>
                    <h3 className="font-medium text-gray-600 mb-2">Simple:</h3>
                    <Math display>{expr.simple}</Math>
                    <h3 className="font-medium text-gray-600 mb-2 mt-6">Complex:</h3>
                    <Math display>{expr.basel}</Math>
                </section>

                <section className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Group Theory</h2>
                    <p className="mb-4">
                        A group <Math>{expr.groupTuple}</Math> has identity <Math>e</Math>.
                    </p>
                    <Math display>{expr.groupOrder}</Math>
                </section>
            </div>
        </div>
    );
}
