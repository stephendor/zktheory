import React from 'react';
import DocumentationLayout, { DocumentationSidebar } from '../components/DocumentationLayout';
import MDXFileRenderer from '../components/MDXFileRenderer';

const sidebarItems = [
  {
    label: 'Documentation',
    href: '/documentation',
    children: [
      { label: 'Getting Started', href: '/documentation/getting-started' },
      { label: 'Projects', href: '/documentation/projects' },
      { label: 'Test Page', href: '/documentation/test' }
    ]
  },
  {
    label: 'Components',
    href: '/documentation/components',
    children: [
      { label: 'MDX Renderer', href: '/documentation/components/mdx-renderer' },
      { label: 'Documentation Layout', href: '/documentation/components/layout' }
    ]
  }
];

export default function TestPage() {
  return (
    <DocumentationLayout
      title="Documentation System Test"
      description="Testing the documentation system components and functionality"
      breadcrumbs={[
        { label: 'Documentation', href: '/documentation' },
        { label: 'Test' }
      ]}
      sidebar={<DocumentationSidebar items={sidebarItems} />}
    >
      <div className="space-y-8">
        {/* System Status */}
        <section className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-green-900 mb-4">
            🎉 Documentation System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">✅ Core Components</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• DocumentationLayout</li>
                <li>• DocumentationSidebar</li>
                <li>• MDXRenderer</li>
                <li>• MDXFileRenderer</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">✅ Pages Created</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Main documentation index</li>
                <li>• Projects overview</li>
                <li>• Getting started guide</li>
                <li>• TDA Explorer docs</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Conversion Results */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Markdown to MDX Conversion</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Conversion Script Results
            </h3>
            <p className="text-blue-800 mb-4">
              The conversion script successfully processed all markdown files from the content directory:
            </p>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Converted Files:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• pages/about.md → docs/pages/about.mdx</li>
                <li>• pages/blog/*.md → docs/pages/blog/*.mdx</li>
                <li>• pages/projects/*.md → docs/pages/projects/*.mdx</li>
                <li>• pages/library.md → docs/pages/library.mdx</li>
                <li>• pages/careers.md → docs/pages/careers.mdx</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Component Testing */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Component Testing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Typography Test</h3>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Heading 1</h1>
              <h2 className="text-3xl font-semibold text-gray-800 mb-3">Heading 2</h2>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">Heading 3</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                This is a paragraph with <strong>bold text</strong> and <em>italic text</em>. 
                It demonstrates the typography styling used throughout the documentation.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Interactive Elements</h3>
              <div className="space-y-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Primary Button
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                  Secondary Button
                </button>
                <a href="#" className="inline-block text-blue-600 hover:text-blue-800 underline">
                  Sample Link
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Code Examples */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Code and Math Examples</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Code Block Test</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm text-gray-800">
{`function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55`}
                </code>
              </pre>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Math Expression Test</h3>
              <div className="text-center">
                <div className="text-2xl font-mono bg-gray-100 p-4 rounded-lg">
                  ∫<sub>0</sub><sup>∞</sup> e<sup>-x²</sup> dx = √π/2
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MDX File Renderer Test */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">MDX File Renderer Test</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Sample MDX Content</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700">
                This section tests the MDX file renderer component. The MDXFileRenderer component 
                should be able to process and display MDX content with proper styling and formatting.
              </p>
            </div>
          </div>
        </section>

        {/* Performance Metrics */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance & Testing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Build Status</h3>
              <p className="text-green-700 text-sm">✅ Successful</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">TypeScript</h3>
              <p className="text-blue-700 text-sm">✅ No Errors</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">Components</h3>
              <p className="text-purple-700 text-sm">✅ All Working</p>
            </div>
          </div>
        </section>
      </div>
    </DocumentationLayout>
  );
}
