'use client';

import React, { useState, useCallback } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface SearchResult {
  title: string;
  description: string;
  href: string;
  type: 'page' | 'concept' | 'tool';
}

// Mock search data - in a real implementation, this would come from a search index
const searchData: SearchResult[] = [
  {
    title: 'TDA Explorer',
    description: 'Interactive exploration of persistent homology and topological features',
    href: '/documentation/projects/tda-explorer',
    type: 'tool'
  },
  {
    title: 'Cayley Graph Explorer',
    description: 'Interactive visualization of group theory concepts',
    href: '/documentation/projects/cayleygraph',
    type: 'tool'
  },
  {
    title: 'Getting Started',
    description: 'Welcome guide and quick start instructions',
    href: '/documentation/getting-started',
    type: 'page'
  },
  {
    title: 'Persistent Homology',
    description: 'Mathematical concept for analyzing topological features',
    href: '/documentation/concepts/persistent-homology',
    type: 'concept'
  },
  {
    title: 'Group Theory',
    description: 'Study of algebraic structures and symmetries',
    href: '/documentation/concepts/group-theory',
    type: 'concept'
  },
  {
    title: 'Interactive Examples',
    description: 'Hands-on mathematical code examples and demonstrations',
    href: '/documentation/examples',
    type: 'page'
  },
  {
    title: 'APT Detection',
    description: 'Research on threat detection using TDA',
    href: '/documentation/research/apt-detection',
    type: 'tool'
  }
];

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim() === '') {
      setResults([]);
      return;
    }

    const filtered = searchData.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setResults(filtered);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
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
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <Link
              key={index}
              href={result.href}
              onClick={handleResultClick}
              className="block p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                  result.type === 'tool' ? 'bg-blue-500' :
                  result.type === 'concept' ? 'bg-green-500' :
                  'bg-purple-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {result.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {result.description}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      result.type === 'tool' ? 'bg-blue-100 text-blue-800' :
                      result.type === 'concept' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {result.type === 'tool' ? 'Tool' :
                       result.type === 'concept' ? 'Concept' :
                       'Page'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length > 0 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <p className="text-gray-500 text-center">No results found for "{query}"</p>
          <p className="text-gray-400 text-sm text-center mt-1">Try different keywords or browse the documentation</p>
        </div>
      )}
    </div>
  );
}
