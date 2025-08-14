'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon, ChevronRightIcon, DocumentTextIcon, FolderIcon } from '@heroicons/react/24/outline';

interface SitemapItem {
  label: string;
  href?: string;
  children?: SitemapItem[];
  type: 'page' | 'section' | 'tool';
}

const sitemapData: SitemapItem[] = [
  {
    label: 'Getting Started',
    href: '/documentation/getting-started',
    type: 'section',
    children: [
      { label: 'Introduction', href: '/documentation/getting-started', type: 'page' },
      { label: 'Installation', href: '/documentation/getting-started/installation', type: 'page' },
      { label: 'First Steps', href: '/documentation/getting-started/first-steps', type: 'page' },
      { label: 'Basic Concepts', href: '/documentation/getting-started/basic-concepts', type: 'page' }
    ]
  },
  {
    label: 'Mathematical Tools',
    href: '/documentation/tools',
    type: 'section',
    children: [
      { label: 'TDA Explorer', href: '/documentation/projects/tda-explorer', type: 'tool' },
      { label: 'Cayley Graph Explorer', href: '/documentation/projects/cayleygraph', type: 'tool' },
      { label: 'Interactive Notebooks', href: '/documentation/projects/notebooks', type: 'tool' }
    ]
  },
  {
    label: 'Research Demonstrations',
    href: '/documentation/research',
    type: 'section',
    children: [
      { label: 'APT Detection', href: '/documentation/research/apt-detection', type: 'tool' },
      { label: 'Bubble Detection', href: '/documentation/research/bubble-detection', type: 'tool' },
      { label: 'Performance Benchmarks', href: '/documentation/research/benchmarks', type: 'tool' }
    ]
  },
  {
    label: 'Projects',
    href: '/documentation/projects',
    type: 'section',
    children: [
      { label: 'TDA Explorer', href: '/documentation/projects/tda-explorer', type: 'tool' },
      { label: 'Cayley Graph Explorer', href: '/documentation/projects/cayleygraph', type: 'tool' },
      { label: 'Interactive Notebooks', href: '/documentation/projects/notebooks', type: 'tool' }
    ]
  },
  {
    label: 'Mathematical Concepts',
    href: '/documentation/concepts',
    type: 'section',
    children: [
      { label: 'Topological Data Analysis', href: '/documentation/concepts/tda', type: 'section' },
      { label: 'Group Theory', href: '/documentation/concepts/group-theory', type: 'section' },
      { label: 'Elliptic Curves', href: '/documentation/concepts/elliptic-curves', type: 'section' }
    ]
  },
  {
    label: 'API Reference',
    href: '/documentation/api',
    type: 'section',
    children: [
      { label: 'Component API', href: '/documentation/api/components', type: 'page' },
      { label: 'Mathematical Functions', href: '/documentation/api/math', type: 'page' },
      { label: 'Configuration Options', href: '/documentation/api/config', type: 'page' }
    ]
  },
  {
    label: 'Interactive Examples',
    href: '/documentation/examples',
    type: 'section',
    children: [
      { label: 'Basic Math', href: '/documentation/examples#basic-math', type: 'page' },
      { label: 'Group Theory', href: '/documentation/examples#group-theory', type: 'page' },
      { label: 'Topology', href: '/documentation/examples#topology', type: 'page' },
      { label: 'Cryptography', href: '/documentation/examples#cryptography', type: 'page' }
    ]
  },
  {
    label: 'Tutorials',
    href: '/documentation/tutorials',
    type: 'section',
    children: [
      { label: 'Building Visualizations', href: '/documentation/tutorials/visualizations', type: 'page' },
      { label: 'Data Analysis Workflows', href: '/documentation/tutorials/workflows', type: 'page' },
      { label: 'Custom Implementations', href: '/documentation/tutorials/custom', type: 'page' }
    ]
  }
];

interface SitemapNodeProps {
  item: SitemapItem;
  level?: number;
}

function SitemapNode({ item, level = 0 }: SitemapNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = item.children && item.children.length > 0;

  const toggleExpanded = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const getIcon = () => {
    if (item.type === 'tool') {
      return <DocumentTextIcon className="h-4 w-4 text-blue-500" />;
    }
    if (hasChildren) {
      return <FolderIcon className="h-4 w-4 text-yellow-500" />;
    }
    return <DocumentTextIcon className="h-4 w-4 text-gray-500" />;
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'tool':
        return 'text-blue-600 hover:text-blue-800';
      case 'section':
        return 'text-gray-900 hover:text-gray-700';
      default:
        return 'text-gray-700 hover:text-gray-900';
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        {hasChildren && (
          <button
            onClick={toggleExpanded}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-3 w-3 text-gray-500" />
            ) : (
              <ChevronRightIcon className="h-3 w-3 text-gray-500" />
            )}
          </button>
        )}
        
        {getIcon()}
        
        {item.href ? (
          <Link
            href={item.href}
            className={`text-sm font-medium transition-colors ${getTypeColor()}`}
          >
            {item.label}
          </Link>
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {item.label}
          </span>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-6 space-y-1 border-l border-gray-200 pl-4">
          {item.children!.map((child, index) => (
            <SitemapNode key={index} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sitemap() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Documentation Sitemap</h2>
        <p className="text-gray-600">
          Complete overview of all documentation pages and their organization
        </p>
      </div>
      
      <div className="space-y-4">
        {sitemapData.map((item, index) => (
          <SitemapNode key={index} item={item} />
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          Use the search bar above to quickly find specific content, or browse through the sitemap to explore the full documentation structure.
        </p>
      </div>
    </div>
  );
}
