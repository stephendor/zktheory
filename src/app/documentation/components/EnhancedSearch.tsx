'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, DocumentTextIcon, FolderIcon, BeakerIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import FlexSearch from 'flexsearch';

interface SearchDocument {
  id: string;
  title: string;
  description: string;
  content: string;
  href: string;
  type: 'page' | 'section' | 'tool' | 'example';
  category: string;
  tags: string[];
}

interface SearchResult {
  document: SearchDocument;
  score: number;
  highlights: string[];
}

// Sample search documents - in a real implementation, this would come from your content
const searchDocuments: SearchDocument[] = [
  {
    id: 'tda-explorer',
    title: 'TDA Explorer',
    description: 'Interactive exploration of persistent homology and topological features in data',
    content: 'Topological Data Analysis Explorer tool for exploring persistent homology, point clouds, persistence diagrams, and mapper visualizations. Features WASM-powered computation, real-time analysis, and interactive visualizations.',
    href: '/documentation/projects/tda-explorer',
    type: 'tool',
    category: 'Mathematical Tools',
    tags: ['topology', 'persistent homology', 'data analysis', 'visualization']
  },
  {
    id: 'cayley-graph',
    title: 'Cayley Graph Explorer',
    description: 'Interactive visualization of group theory concepts and Cayley graphs',
    content: 'Cayley Graph Explorer for visualizing group theory concepts, complete group database up to order 20, interactive graph manipulation, educational features, and advanced layout algorithms.',
    href: '/documentation/projects/cayleygraph',
    type: 'tool',
    category: 'Mathematical Tools',
    tags: ['group theory', 'cayley graphs', 'algebra', 'visualization']
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Welcome guide and quick start instructions',
    content: 'Getting started guide for zktheory mathematical tools. Learn basic concepts, installation, first steps, and basic mathematical concepts. Perfect for beginners.',
    href: '/documentation/getting-started',
    type: 'page',
    category: 'Documentation',
    tags: ['beginner', 'guide', 'introduction', 'setup']
  },
  {
    id: 'examples',
    title: 'Interactive Examples',
    description: 'Hands-on code examples and mathematical demonstrations',
    content: 'Interactive mathematical examples including basic operations, group theory, topology, cryptography. Code sandbox with live execution, syntax highlighting, and error handling.',
    href: '/documentation/examples',
    type: 'page',
    category: 'Documentation',
    tags: ['examples', 'code', 'interactive', 'mathematics']
  },
  {
    id: 'prime-checker',
    title: 'Prime Number Checker',
    description: 'Check if a number is prime using trial division',
    content: 'JavaScript implementation of prime number checking using trial division algorithm. Includes testing and finding first N prime numbers.',
    href: '/documentation/examples#basic-math',
    type: 'example',
    category: 'Basic Math',
    tags: ['prime numbers', 'algorithms', 'number theory', 'javascript']
  },
  {
    id: 'gcd-calculator',
    title: 'GCD Calculator',
    description: 'Calculate the greatest common divisor using Euclidean algorithm',
    content: 'Greatest Common Divisor calculator using Euclidean algorithm. Includes extended Euclidean algorithm for finding Bézout coefficients.',
    href: '/documentation/examples#basic-math',
    type: 'example',
    category: 'Basic Math',
    tags: ['gcd', 'euclidean algorithm', 'number theory', 'javascript']
  },
  {
    id: 'cyclic-group',
    title: 'Cyclic Group Operations',
    description: 'Perform operations in a cyclic group of order n',
    content: 'Cyclic group implementation with addition, inverse, element order, and generator finding. Demonstrates group theory concepts.',
    href: '/documentation/examples#group-theory',
    type: 'example',
    category: 'Group Theory',
    tags: ['group theory', 'cyclic groups', 'algebra', 'javascript']
  },
  {
    id: 'euler-characteristic',
    title: 'Euler Characteristic',
    description: 'Calculate Euler characteristic for simple polyhedra',
    content: 'Euler characteristic calculation for Platonic solids and topological surfaces. Demonstrates V - E + F formula.',
    href: '/documentation/examples#topology',
    type: 'example',
    category: 'Topology',
    tags: ['topology', 'euler characteristic', 'polyhedra', 'javascript']
  },
  {
    id: 'caesar-cipher',
    title: 'Caesar Cipher',
    description: 'Implement a simple Caesar cipher with shift',
    content: 'Caesar cipher implementation with encryption and decryption. Demonstrates basic cryptographic concepts and modular arithmetic.',
    href: '/documentation/examples#cryptography',
    type: 'example',
    category: 'Cryptography',
    tags: ['cryptography', 'caesar cipher', 'encryption', 'javascript']
  }
];

export default function EnhancedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Flexsearch index
  const searchIndex = useMemo(() => {
    const index = new FlexSearch.Index({
      tokenize: 'forward',
      resolution: 9
    });

    // Add documents to the index
    searchDocuments.forEach((doc, idx) => {
      const searchableText = `${doc.title} ${doc.description} ${doc.content} ${doc.tags.join(' ')} ${doc.category}`.toLowerCase();
      index.add(idx, searchableText);
    });

    return index;
  }, []);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim() === '') {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Perform search with Flexsearch
      const searchResults = await searchIndex.search(searchQuery, {
        limit: 10,
        suggest: true
      });

      // Map results back to documents and calculate relevance scores
      const mappedResults = searchResults
        .map((result: any) => {
          const doc = searchDocuments[result];
          if (!doc) return null;

          // Calculate relevance score based on match position and type
          let score = 0;
          const queryLower = searchQuery.toLowerCase();
          
          // Title matches get highest score
          if (doc.title.toLowerCase().includes(queryLower)) score += 100;
          if (doc.description.toLowerCase().includes(queryLower)) score += 50;
          if (doc.content.toLowerCase().includes(queryLower)) score += 25;
          if (doc.tags.some(tag => tag.toLowerCase().includes(queryLower))) score += 30;
          if (doc.category.toLowerCase().includes(queryLower)) score += 20;

          // Generate highlights
          const highlights: string[] = [];
          const words = queryLower.split(' ').filter(w => w.length > 2);
          
          words.forEach(word => {
            if (doc.title.toLowerCase().includes(word)) {
              highlights.push(`Title: ${doc.title}`);
            }
            if (doc.description.toLowerCase().includes(word)) {
              highlights.push(`Description: ${doc.description}`);
            }
            if (doc.tags.some(tag => tag.toLowerCase().includes(word))) {
              highlights.push(`Tags: ${doc.tags.filter(tag => tag.toLowerCase().includes(word)).join(', ')}`);
            }
          });

          return {
            document: doc,
            score,
            highlights: highlights.slice(0, 3) // Limit highlights
          };
        })
        .filter((result): result is SearchResult => result !== null)
        .sort((a, b) => b.score - a.score);

      setResults(mappedResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    performSearch(value);
    setIsOpen(value.length > 0);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tool':
        return <BeakerIcon className="h-4 w-4 text-blue-500" />;
      case 'section':
        return <FolderIcon className="h-4 w-4 text-yellow-500" />;
      case 'example':
        return <DocumentTextIcon className="h-4 w-4 text-green-500" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tool':
        return 'bg-blue-100 text-blue-800';
      case 'section':
        return 'bg-yellow-100 text-yellow-800';
      case 'example':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search documentation..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query.length > 0 && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear search"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((result, index) => (
              <Link
                key={index}
                href={result.document.href}
                onClick={handleResultClick}
                className="block p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(result.document.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {result.document.title}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.document.type)}`}>
                        {result.document.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {result.document.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {result.document.category}
                      </span>
                      {result.highlights.length > 0 && (
                        <div className="text-xs text-blue-600">
                          {result.highlights[0]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : query.length > 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No results found for "{query}"</p>
              <p className="text-sm text-gray-400 mt-1">Try different keywords or browse the documentation</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
