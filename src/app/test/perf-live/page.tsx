import React from 'react';
import ClientPerfPanel from '@/components/performance/ClientPerfPanel';
import ClientPerfHUD from '@/components/performance/ClientPerfHUD';
import PerformanceCharts from '@/components/performance/PerformanceCharts';
import PerformanceAlerts from '@/components/performance/PerformanceAlerts';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PerfLivePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-indigo-600">⚡ Perf Live</h1>
      <p className="text-gray-700 mb-4">This page forces dynamic rendering and mounts the client perf panel directly.</p>
      <ClientPerfPanel />
      <div className="my-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceCharts />
        <PerformanceAlerts />
      </div>
      <ClientPerfHUD />
    </div>
  );
}
