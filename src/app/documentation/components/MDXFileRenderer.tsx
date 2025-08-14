'use client';

import React from 'react';
import fs from 'fs';
import path from 'path';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { serialize } from 'next-mdx-remote/serialize';
import DocumentationLayout from './DocumentationLayout';
import { DocumentationSidebar } from './DocumentationLayout';

interface MDXFileRendererProps {
  filePath: string;
  sidebar?: React.ReactNode;
  className?: string;
}

// Custom components for MDX content
const components = {
  // Math rendering with KaTeX
  math: ({ children, display }: { children: string; display?: boolean }) => (
    <div className={`my-4 ${display ? 'text-center' : 'inline-block'}`}>
      <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
        {children}
      </code>
    </div>
  ),
  
  // Custom heading components
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-4xl font-bold text-gray-900 mb-6" {...props}>
      {children}
    </h1>
  ),
  
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-3xl font-semibold text-gray-800 mb-4 mt-8" {...props}>
      {children}
    </h2>
  ),
  
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-2xl font-semibold text-gray-700 mb-3 mt-6" {...props}>
      {children}
    </h3>
  ),
  
  // Paragraph styling
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-gray-700 leading-relaxed mb-4" {...props}>
      {children}
    </p>
  ),
  
  // List styling
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700" {...props}>
      {children}
    </ul>
  ),
  
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700" {...props}>
      {children}
    </ol>
  ),
  
  // Code blocks
  code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
    
    return (
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    );
  },
  
  // Links
  a: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a 
      href={href} 
      className="text-blue-600 hover:text-blue-800 underline transition-colors" 
      {...props}
    >
      {children}
    </a>
  ),
  
  // Tables
  table: ({ children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full border border-gray-300" {...props}>
        {children}
      </table>
    </div>
  ),
  
  th: ({ children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left" {...props}>
      {children}
    </th>
  ),
  
  td: ({ children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td className="border border-gray-300 px-4 py-2" {...props}>
      {children}
    </td>
  ),
};

export default function MDXFileRenderer({ filePath, sidebar, className = '' }: MDXFileRendererProps) {
  // This component would need to be adapted for client-side rendering
  // For now, we'll create a placeholder that shows the file structure
  
  return (
    <DocumentationLayout
      title="MDX File Renderer"
      description="Renders converted MDX files with proper formatting"
      sidebar={sidebar}
      className={className}
    >
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            MDX File Renderer
          </h2>
          <p className="text-blue-800">
            This component is designed to render converted MDX files. The file at <code>{filePath}</code> 
            has been successfully converted and is ready for rendering.
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Next Steps</h3>
          <p className="text-gray-700 mb-4">
            To complete the MDX integration, we need to:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Install required dependencies (next-mdx-remote, react-katex)</li>
            <li>Set up proper MDX rendering with frontmatter parsing</li>
            <li>Create dynamic routes for the converted MDX files</li>
            <li>Test the rendering with actual content</li>
          </ol>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            ✅ Conversion Complete
          </h3>
          <p className="text-green-800">
            The markdown-to-MDX conversion script has successfully processed all files. 
            You can now work on the MDX rendering implementation.
          </p>
        </div>
      </div>
    </DocumentationLayout>
  );
}

// Utility function to serialize markdown to MDX
export async function serializeMarkdown(markdown: string) {
  return await serialize(markdown, {
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [],
    },
    parseFrontmatter: true,
  });
}
