'use client';

import React from 'react';

/**
 * Phase 1.1a: Test WITHOUT performance hook - control test
 * Testing if the error comes from the hook itself or component structure
 */
export default function SimpleTestComponent() {
  const [testState, setTestState] = React.useState(false);
  
  return (
    <div className="p-4 border border-gray-300 m-2">
      <h3>Phase 1.1a: Simple Component Test (No Performance Hook)</h3>
      <p>Test State: {testState ? 'TRUE' : 'FALSE'}</p>
      <button 
        onClick={() => setTestState(!testState)}
        className="px-4 py-2 bg-blue-500 text-white rounded mt-2"
      >
        Toggle Test State
      </button>
      <p className="text-green-600 text-sm mt-2">
        ✅ Simple React component works - no performance hook
      </p>
    </div>
  );
}
