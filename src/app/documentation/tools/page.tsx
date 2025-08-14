import React from 'react';
import Link from 'next/link';
import DocumentationLayout from '../components/DocumentationLayout';
import { DocumentationSidebar } from '../components/DocumentationLayout';
import { 
  BeakerIcon, 
  ChartBarIcon, 
  CodeBracketIcon, 
  AcademicCapIcon,
  RocketLaunchIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const sidebarItems = [
  {
    label: 'Documentation',
    href: '/documentation',
    children: [
      { label: 'Getting Started', href: '/documentation/getting-started' },
      { label: 'Tools', href: '/documentation/tools' },
      { label: 'Projects', href: '/documentation/projects' }
    ]
  },
  {
    label: 'Mathematical Tools',
    href: '/documentation/tools',
    children: [
      { label: 'TDA Explorer', href: '/documentation/projects/tda-explorer' },
      { label: 'Cayley Graph Explorer', href: '/documentation/projects/cayleygraph' },
      { label: 'Interactive Notebooks', href: '/documentation/projects/notebooks' }
    ]
  }
];

const tools = [
  {
    title: 'TDA Explorer',
    description: 'Interactive exploration of persistent homology and topological features in data',
    icon: BeakerIcon,
    color: 'bg-blue-500',
    href: '/documentation/projects/tda-explorer',
    features: [
      'Point cloud generation and visualization',
      'Real-time persistence analysis',
      'Mapper network visualization',
      'WASM-powered computation'
    ],
    status: 'active'
  },
  {
    title: 'Cayley Graph Explorer',
    description: 'Interactive visualization of group theory concepts and Cayley graphs',
    icon: ChartBarIcon,
    color: 'bg-green-500',
    href: '/documentation/projects/cayleygraph',
    features: [
      'Complete group database (up to order 20)',
      'Interactive graph manipulation',
      'Educational features and explanations',
      'Advanced layout algorithms'
    ],
    status: 'active'
  },
  {
    title: 'Interactive Notebooks',
    description: 'Jupyter-style notebooks for mathematical exploration and learning',
    icon: CodeBracketIcon,
    color: 'bg-purple-500',
    href: '/documentation/projects/notebooks',
    features: [
      'Code execution environment',
      'Mathematical notation rendering',
      'Export capabilities',
      'Collaborative features'
    ],
    status: 'active'
  }
];

export default function ToolsPage() {
  return (
    <DocumentationLayout
      title="Mathematical Tools"
      description="Comprehensive collection of interactive mathematical tools for exploration, learning, and research"
      breadcrumbs={[
        { label: 'Documentation', href: '/documentation' },
        { label: 'Tools' }
      ]}
      sidebar={<DocumentationSidebar items={sidebarItems} />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
          <div className="flex items-center space-x-4 mb-4">
            <RocketLaunchIcon className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-blue-900">Mathematical Tools</h2>
          </div>
          <p className="text-blue-800 text-lg leading-relaxed">
            Our collection of interactive mathematical tools is designed to make complex concepts 
            accessible and engaging. Each tool combines modern web technologies with mathematical rigor 
            to provide an intuitive learning experience.
          </p>
        </section>

        {/* Tools Grid */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Tools</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {tools.map((tool, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`${tool.color} p-3 rounded-lg`}>
                    <tool.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{tool.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        tool.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tool.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{tool.description}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {tool.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Link
                  href={tool.href}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Documentation
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Getting Started */}
        <section className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">🚀 Getting Started</h3>
          <p className="text-green-800 mb-4">
            New to these tools? Start with our getting started guide to learn the basics and 
            understand how to use each tool effectively.
          </p>
          <Link
            href="/documentation/getting-started"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Read Getting Started Guide
          </Link>
        </section>

        {/* Use Cases */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <AcademicCapIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Education</h3>
              <p className="text-gray-600 text-sm">
                Perfect for students learning group theory, topology, and data analysis concepts
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <BeakerIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Research</h3>
              <p className="text-gray-600 text-sm">
                Ideal for researchers exploring topological data analysis and group theory applications
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <LightBulbIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Exploration</h3>
              <p className="text-gray-600 text-sm">
                Great for anyone curious about mathematical concepts and their visual representations
              </p>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">💡 What's Next?</h3>
          <p className="text-yellow-800 mb-4">
            Ready to dive deeper? Explore our project documentation for detailed guides, 
            tutorials, and advanced usage examples.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/documentation/projects"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Browse All Projects
            </Link>
            <Link
              href="/documentation/tutorials"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              View Tutorials
            </Link>
          </div>
        </section>
      </div>
    </DocumentationLayout>
  );
}
