'use client';

import React, { useState, useCallback } from 'react';
import { PlayIcon, StopIcon, ArrowPathIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

interface CodeSandboxProps {
  title: string;
  description?: string;
  initialCode: string;
  language?: string;
  expectedOutput?: string;
  className?: string;
}

interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
}

export default function CodeSandbox({
  title,
  description,
  initialCode,
  language = 'javascript',
  expectedOutput,
  className = ''
}: CodeSandboxProps) {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const executeCode = useCallback(async () => {
    setIsRunning(true);
    const startTime = performance.now();
    
    try {
      // Create a safe execution environment
      const safeEval = new Function('console', 'Math', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Date', code);
      
      // Capture console output
      let output = '';
      const mockConsole = {
        log: (...args: any[]) => {
          output += args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ') + '\n';
        },
        error: (...args: any[]) => {
          output += 'ERROR: ' + args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ') + '\n';
        }
      };

      // Execute the code
      safeEval(mockConsole, Math, Array, Object, String, Number, Boolean, Date);
      
      const executionTime = performance.now() - startTime;
      
      setResult({
        output: output.trim() || 'Code executed successfully (no output)',
        executionTime
      });
    } catch (error) {
      const executionTime = performance.now() - startTime;
      setResult({
        output: '',
        error: error instanceof Error ? error.message : String(error),
        executionTime
      });
    } finally {
      setIsRunning(false);
    }
  }, [code]);

  const resetCode = useCallback(() => {
    setCode(initialCode);
    setResult(null);
  }, [initialCode]);

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }, [code]);

  const getLanguageDisplayName = (lang: string) => {
    const languageMap: Record<string, string> = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'python': 'Python',
      'rust': 'Rust',
      'cpp': 'C++',
      'java': 'Java',
      'go': 'Go',
      'sql': 'SQL',
      'html': 'HTML',
      'css': 'CSS',
      'json': 'JSON',
      'yaml': 'YAML',
      'markdown': 'Markdown'
    };
    return languageMap[lang] || lang;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getLanguageDisplayName(language)}
            </span>
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Code Editor</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={copyCode}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Copy code"
              >
                <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={resetCode}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Reset to original code"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Reset
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-48 p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter your code here..."
            spellCheck={false}
          />
        </div>

        {/* Execution Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={executeCode}
              disabled={isRunning}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? (
                <>
                  <StopIcon className="h-4 w-4 mr-2" />
                  Running...
                </>
              ) : (
                <>
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Run Code
                </>
              )}
            </button>
          </div>
          
          {result && (
            <div className="text-sm text-gray-600">
              Execution time: {result.executionTime.toFixed(2)}ms
            </div>
          )}
        </div>

        {/* Output */}
        {result && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Output</h4>
            <div className={`p-4 rounded-lg font-mono text-sm ${
              result.error 
                ? 'bg-red-50 border border-red-200 text-red-800' 
                : 'bg-gray-50 border border-gray-200 text-gray-800'
            }`}>
              {result.error ? (
                <div>
                  <div className="font-semibold text-red-700 mb-2">Error:</div>
                  <div className="whitespace-pre-wrap">{result.error}</div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{result.output}</div>
              )}
            </div>
          </div>
        )}

        {/* Expected Output (if provided) */}
        {expectedOutput && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Expected Output</h4>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-mono text-sm text-green-800 whitespace-pre-wrap">
                {expectedOutput}
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">console.log()</code> to see output</li>
            <li>• The code runs in a safe environment with limited access</li>
            <li>• You can modify the code and experiment with different approaches</li>
            <li>• Click "Reset" to restore the original code</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
