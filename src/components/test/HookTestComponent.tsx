'use client';

import React from 'react';
import { usePerformanceToggle } from '@/lib/performance/PerformanceHooks';

/**
 * Phase 1.1: Test usePerformanceToggle Hook in Isolation
 * Minimal component to test if the usePerformanceToggle hook works without component errors
 */
export default function HookTestComponent() {
  try {
    const { isEnabled, toggle } = usePerformanceToggle();
    
    return (
      <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
        <h3>Phase 1.1: usePerformanceToggle Hook Test</h3>
        <p>Performance Monitoring: {isEnabled ? 'ENABLED' : 'DISABLED'}</p>
        <button onClick={toggle} style={{ padding: '8px 16px', marginTop: '10px' }}>
          Toggle Performance Monitoring
        </button>
        <p style={{ color: 'green', fontSize: '12px' }}>
          ✅ Hook loaded successfully - no React component errors
        </p>
      </div>
    );
  } catch (error) {
    return (
      <div style={{ padding: '20px', border: '1px solid red', margin: '10px' }}>
        <h3>Phase 1.1: usePerformanceToggle Hook Test</h3>
        <p style={{ color: 'red' }}>❌ Hook Error: {String(error)}</p>
      </div>
    );
  }
}
