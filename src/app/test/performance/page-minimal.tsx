import React from 'react';
import type { Metadata } from 'next';
import PerformanceDashboardStep2 from '../../../components/performance/PerformanceDashboardStep2';

export const metadata: Metadata = {
    title: 'Performance Monitoring Test',
    description: 'Test page for performance monitoring dashboard and mathematical operations'
};

export default function PerformanceTestPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Performance Dashboard Only */}
            <PerformanceDashboardStep2 />
            
            {/* Simple Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Performance Monitoring Test</h1>
                    <p className="text-gray-600 mb-6">
                        This page demonstrates the performance monitoring dashboard.
                        The dashboard above shows real-time performance metrics.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Testing Performance Dashboard</h2>
                    <p className="text-gray-600">
                        The performance dashboard is loaded above this content.
                        If you can see this text, the basic page structure is working.
                    </p>
                </div>
            </div>
        </div>
    );
}
