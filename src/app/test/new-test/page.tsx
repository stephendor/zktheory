import React from 'react';
import ClientPerfPanel from '@/components/performance/ClientPerfPanel';

export default function TestNewPage() {
  const timestamp = new Date().toISOString();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-purple-600">
        🚀 BRAND NEW TEST PAGE 🚀
      </h1>
      <div className="bg-purple-50 p-6 rounded-lg shadow-lg border-2 border-purple-300">
        <h2 className="text-2xl font-semibold mb-4 text-purple-800">
          ✨ This is a completely new route!
        </h2>
        <p className="text-purple-600 font-medium text-lg">
          🎯 If you can see this, the routing works!
        </p>
        <p className="text-blue-600 font-mono text-sm mt-4">
          🕒 Created at: {timestamp}
        </p>
        <div className="mt-4 p-4 bg-green-100 border-2 border-green-300 rounded-lg">
          <p className="text-green-800 font-bold text-xl">
            ✅ SUCCESS: New route is working!
          </p>
        </div>
      </div>
      <div className="mt-6">
        <a href="/test/perf-live" className="text-purple-700 underline font-medium">Go to Perf Live page</a>
      </div>
      <div className="mt-6">
        <ClientPerfPanel />
      </div>
    </div>
  );
}
