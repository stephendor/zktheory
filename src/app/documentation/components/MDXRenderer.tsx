'use client';

import React from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { serialize } from 'next-mdx-remote/serialize';
import KaTeX from 'react-katex';
import 'katex/dist/katex.min.css';

// Custom components for MDX
const components = {
  // Math rendering with KaTeX
  math: ({ children, display }: { children: string; display?: boolean }) => (
    <KaTeX math={children} block={display} />
  ),
  
  // Inline math
  inlineMath: ({ children }: { children: string }) => (
    <KaTeX math={children} />
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
  
  h4: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-xl font-medium text-gray-600 mb-2 mt-4" {...props}>
      {children}
    </h4>
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
  
  // Blockquotes
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 mb-4" {...props}>
      {children}
    </blockquote>
  ),
  
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

interface MDXRendererProps {
  source: string;
  className?: string;
}

export default function MDXRenderer({ source, className = '' }: MDXRendererProps) {
  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <MDXRemote source={source} components={components} />
    </div>
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
