import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Performance Monitoring Test',
    description: 'Test page for performance monitoring dashboard and mathematical operations'
};

export default function PerformanceTestPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* No Performance Dashboard - Just Basic Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Performance Monitoring Test</h1>
                    <p className="text-gray-600 mb-6">
                        Basic page test - no performance components.
                        If this loads, the Next.js setup is working.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Test Page</h2>
                    <p className="text-gray-600">
                        This is a completely minimal page with no performance monitoring components.
                        If you can see this text, the basic Next.js routing and page structure is working.
                    </p>
                </div>
            </div>
        </div>
    );
}
