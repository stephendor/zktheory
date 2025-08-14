'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, HomeIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import EnhancedSearch from './EnhancedSearch';

interface DocumentationLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  sidebar?: React.ReactNode;
  className?: string;
}

export default function DocumentationLayout({
  children,
  title,
  description,
  breadcrumbs = [],
  sidebar,
  className = '',
}: DocumentationLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <HomeIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Home</span>
            </Link>
            
            <ChevronLeftIcon className="h-4 w-4 text-gray-400" />
            
            <Link 
              href="/documentation" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <BookOpenIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Documentation</span>
            </Link>
            
            {breadcrumbs.length > 0 && (
              <>
                <ChevronLeftIcon className="h-4 w-4 text-gray-400" />
                <nav className="flex items-center space-x-2">
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      {crumb.href ? (
                        <Link
                          href={crumb.href}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {crumb.label}
                        </span>
                      )}
                      {index < breadcrumbs.length - 1 && (
                        <ChevronLeftIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              </>
            )}
          </div>
          
          {/* Search Bar */}
          <div className="w-80">
            <EnhancedSearch />
          </div>
        </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          {sidebar && (
            <aside className="w-64 flex-shrink-0">
              <div className="sticky top-8">
                {sidebar}
              </div>
            </aside>
          )}
          
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {title}
                </h1>
                {description && (
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              
              {/* Content */}
              <div className="prose prose-lg max-w-none">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Sidebar component for navigation
export function DocumentationSidebar({ 
  items 
}: { 
  items: Array<{ label: string; href: string; children?: Array<{ label: string; href: string }> }> 
}) {
  return (
    <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index}>
            <Link
              href={item.href}
              className="block text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
            {item.children && (
              <ul className="ml-4 mt-2 space-y-1">
                {item.children.map((child, childIndex) => (
                  <li key={childIndex}>
                    <Link
                      href={child.href}
                      className="block text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md px-3 py-2 text-sm transition-colors"
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
