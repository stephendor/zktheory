'use client';

"use client";
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useState } from 'react';

interface CodeBlockProps {
  children: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
}

export default function CodeBlock({
  children,
  language = 'javascript',
  title,
  showLineNumbers = true,
  theme = 'dark',
  className = ''
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const selectedTheme = theme === 'dark' ? oneDark : oneLight;

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium flex items-center justify-between">
          <span>{title}</span>
          <span className="text-xs text-gray-400">{language}</span>
        </div>
      )}
      
      <div className="relative">
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded text-xs transition-colors duration-200"
          title="Copy code"
        >
          {copied ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          )}
        </button>

        <SyntaxHighlighter
          language={language}
          style={selectedTheme}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: theme === 'dark' ? '#1e1e1e' : '#f8f9fa'
          }}
          codeTagProps={{
            style: {
              fontSize: '14px',
              fontFamily: 'Fira Code, Monaco, Consolas, "Ubuntu Mono", monospace'
            }
          }}
        >
          {children}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
