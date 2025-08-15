import React from 'react';
import type { Metadata } from 'next';
import PerformanceDashboard from '../../../components/performance/PerformanceDashboard';
import Cayley3DVisualization from '../../../components/Cayley3DVisualization';
import Math from '../../../components/blocks/Math';
import { Group, GroupElement } from '../../../lib/GroupTheory';

export const metadata: Metadata = {
    title: 'Performance Monitoring Test',
    description: 'Test page for performance monitoring dashboard and mathematical operations'
};

// Create a sample group for testing
const createSampleGroup = (): Group => {
    const elements: GroupElement[] = [
        { id: '1', label: 'e', order: 1, inverse: 'e', conjugacyClass: 0 },
        { id: '2', label: 'a', order: 2, inverse: 'a', conjugacyClass: 1 },
        { id: '3', label: 'b', order: 2, inverse: 'b', conjugacyClass: 1 },
        { id: '4', label: 'ab', order: 2, inverse: 'ab', conjugacyClass: 1 }
    ];

    const operations = new Map();
    elements.forEach(element => {
        operations.set(element.label, new Map());
        elements.forEach(otherElement => {
            let result: string;
            if (element.label === 'e') {
                result = otherElement.label;
            } else if (otherElement.label === 'e') {
                result = element.label;
            } else if (element.label === otherElement.label) {
                result = 'e';
            } else if (element.label === 'a' && otherElement.label === 'b') {
                result = 'ab';
            } else if (element.label === 'b' && otherElement.label === 'a') {
                result = 'ab';
            } else if (element.label === 'ab' && otherElement.label === 'a') {
                result = 'b';
            } else if (element.label === 'ab' && otherElement.label === 'b') {
                result = 'a';
            } else {
                result = 'e';
            }
            operations.get(element.label).set(otherElement.label, result);
        });
    });

    return {
        name: 'Klein Four Group',
        displayName: 'Klein Four Group',
        order: elements.length,
        elements,
        operations,
        generators: ['a', 'b'],
        relations: ['a^2 = e', 'b^2 = e', 'ab = ba'],
        isAbelian: true,
        center: ['e', 'a', 'b', 'ab'],
        conjugacyClasses: [['e'], ['a'], ['b'], ['ab']],
        subgroups: [
            { elements: ['e', 'a'], name: 'Subgroup A', isNormal: true },
            { elements: ['e', 'b'], name: 'Subgroup B', isNormal: true },
            { elements: ['e', 'ab'], name: 'Subgroup AB', isNormal: true }
        ]
    };
};

export default function PerformanceTestPage() {
    const sampleGroup = createSampleGroup();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Performance Dashboard */}
            <PerformanceDashboard />
            
            {/* Test Controls */}
            <div className="fixed bottom-4 right-4 z-50">
                <div className="bg-white rounded-lg shadow-lg p-4 border">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Performance Test Controls</h3>
                    <div className="text-xs text-gray-600">
                        <p>• Dashboard updates every second</p>
                        <p>• Mathematical operations are monitored</p>
                        <p>• Memory usage is tracked</p>
                        <p>• Alerts trigger on thresholds</p>
                    </div>
                </div>
            </div>

            {/* Test Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Performance Monitoring Test</h1>
                    <p className="text-gray-600 mb-6">
                        This page demonstrates the performance monitoring dashboard by running various mathematical operations.
                        The dashboard above shows real-time performance metrics for all operations on this page.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Mathematical Expressions */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Mathematical Rendering Test</h2>
                        <div className="space-y-4">
                            <p>
                                Quadratic formula: <Math>ax^2 + bx + c = 0</Math>
                            </p>
                            <p>
                                Solutions: <Math display>{'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'}</Math>
                            </p>
                            <p>
                                Euler's identity: <Math display>{'e^{i\\pi} + 1 = 0'}</Math>
                            </p>
                            <p>
                                Basel problem: <Math display>{'\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}'}</Math>
                            </p>
                        </div>
                    </div>

                    {/* Cayley Graph Visualization */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Cayley Graph Visualization</h2>
                        <div className="h-96">
                            <Cayley3DVisualization 
                                group={sampleGroup}
                                selectedGenerator="a"
                                highlightedElement="a"
                            />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            This 3D visualization generates performance metrics for layout computation and rendering.
                        </p>
                    </div>
                </div>

                {/* Performance Information */}
                <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">What's Being Monitored</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="font-medium text-gray-700 mb-2">Mathematical Rendering</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• KaTeX rendering time</li>
                                <li>• MathJax fallback performance</li>
                                <li>• Error handling overhead</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-700 mb-2">3D Visualization</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Layout computation time</li>
                                <li>• Edge generation performance</li>
                                <li>• Node positioning calculations</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-700 mb-2">System Resources</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Memory usage tracking</li>
                                <li>• Buffer management</li>
                                <li>• Performance overhead</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h2 className="text-xl font-semibold text-blue-800 mb-4">How to Test Performance</h2>
                    <div className="text-blue-700 space-y-2">
                        <p>1. <strong>Watch the Dashboard:</strong> The performance dashboard above shows real-time metrics</p>
                        <p>2. <strong>Interact with Components:</strong> Click on the 3D visualization or scroll to trigger re-renders</p>
                        <p>3. <strong>Monitor Alerts:</strong> Performance alerts will appear when thresholds are exceeded</p>
                        <p>4. <strong>Export Data:</strong> Use the dashboard controls to export performance data</p>
                        <p>5. <strong>Adjust Settings:</strong> Modify sampling rates and buffer sizes in real-time</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
