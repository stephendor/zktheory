import React from 'react';
import Link from 'next/link';
import {
  BookOpenIcon,
  CodeBracketIcon,
  ChartBarIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import DocumentationLayout from './components/DocumentationLayout';
import Sitemap from './components/Sitemap';

const documentationSections = [
  {
    title: 'Getting Started',
    description: 'Quick start guides and basic concepts',
    icon: BookOpenIcon,
    href: '/documentation/getting-started',
    color: 'bg-blue-500',
    items: [
      'Introduction to zktheory',
      'Installation and setup',
      'Basic concepts overview'
    ]
  },
  {
    title: 'Mathematical Tools',
    description: 'Interactive tools and visualizations',
    icon: BeakerIcon,
    href: '/documentation/tools',
    color: 'bg-green-500',
    items: [
      'TDA Explorer',
      'Cayley Graph Explorer',
      'Interactive notebooks'
    ]
  },
  {
    title: 'Research Demonstrations',
    description: 'Reproducible research results and examples',
    icon: ChartBarIcon,
    href: '/documentation/research',
    color: 'bg-purple-500',
    items: [
      'APT Detection (98.42%)',
      'Bubble Detection (60%)',
      'Performance benchmarks'
    ]
  },
  {
    title: 'Mathematical Concepts',
    description: 'Deep dives into mathematical theory',
    icon: AcademicCapIcon,
    href: '/documentation/concepts',
    color: 'bg-red-500',
    items: [
      'Topological Data Analysis',
      'Group Theory',
      'Elliptic Curves'
    ]
  },
  {
    title: 'API Reference',
    description: 'Technical documentation and code examples',
    icon: CodeBracketIcon,
    href: '/documentation/api',
    color: 'bg-yellow-500',
    items: [
      'Component API',
      'Mathematical functions',
      'Configuration options'
    ]
  },
                {
                title: 'Interactive Examples',
                description: 'Hands-on code examples and mathematical demonstrations',
                icon: DocumentTextIcon,
                href: '/documentation/examples',
                color: 'bg-indigo-500',
                items: [
                  'Basic mathematical operations',
                  'Group theory examples',
                  'Topological calculations',
                  'Cryptographic algorithms'
                ]
              },
              {
                title: 'Tutorials',
                description: 'Step-by-step guides and examples',
                icon: DocumentTextIcon,
                href: '/documentation/tutorials',
                color: 'bg-purple-500',
                items: [
                  'Building visualizations',
                  'Data analysis workflows',
                  'Custom implementations'
                ]
              }
];

export default function DocumentationPage() {
  return (
    <DocumentationLayout
      title="Documentation"
      description="Comprehensive guides, tutorials, and reference materials for zktheory mathematical tools and research demonstrations."
    >
      <div className="space-y-8">
        {/* Introduction */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Welcome to zktheory Documentation
          </h2>
          <p className="text-blue-800 leading-relaxed">
            This documentation covers everything you need to understand and use our mathematical tools, 
            from basic concepts to advanced research demonstrations. Whether you're a student learning 
            group theory, a researcher exploring topological data analysis, or a developer building 
            mathematical visualizations, you'll find comprehensive guides here.
          </p>
        </div>

        {/* Documentation Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documentationSections.map((section, index) => (
            <Link
              key={index}
              href={section.href}
              className="group block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className={`${section.color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                  <section.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {section.description}
                  </p>
                  <ul className="mt-3 space-y-1">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-xs text-gray-500 flex items-center">
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/projects/tda-explorer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
            >
              → TDA Explorer Tool
            </Link>
            <Link
              href="/projects/cayleygraph"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
            >
              → Cayley Graph Explorer
            </Link>
            <Link
              href="/projects/cayley-notebook"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
            >
              → Jupyter Notebook
            </Link>
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
            >
              → Blog & Updates
            </Link>
          </div>
        </div>

        {/* Getting Help */}
        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Need Help?</h3>
          <p className="text-yellow-800 text-sm">
            Can't find what you're looking for? Check our{' '}
            <Link href="/documentation/faq" className="underline hover:no-underline">
              FAQ section
            </Link>
            {' '}or{' '}
            <Link href="/documentation/contact" className="underline hover:no-underline">
              contact us
            </Link>
            {' '}for support.
          </p>
        </div>

        {/* Sitemap */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Documentation Structure</h2>
          <Sitemap />
        </section>
      </div>
    </DocumentationLayout>
  );
}
