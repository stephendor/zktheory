'use client';

import React from 'react';
import { useNavigationStore } from '../../../stores/navigationStore';
import type { BreadcrumbItem } from '../../../stores/navigationStore';
import Link from '../Link';
import ChevronRightIcon from '../../svgs/chevron-right';
import classNames from 'classnames';

interface BreadcrumbProps {
  className?: string;
  showIcons?: boolean;
  maxItems?: number;
  enableAnnotations?: boolean;
}

export default function Breadcrumb({
  className = '',
  showIcons = true,
  maxItems = 5,
  enableAnnotations = false
}: BreadcrumbProps) {
  const { breadcrumbs, preferences } = useNavigationStore();

  // Don't render if breadcrumbs are disabled or empty
  if (!preferences.showBreadcrumbs || breadcrumbs.length <= 1) {
    return null;
  }

  // Truncate breadcrumbs if too many
  const displayBreadcrumbs = breadcrumbs.length > maxItems
    ? [
        breadcrumbs[0], // Always show home
        { title: '...', path: '', isCurrentPage: false },
        ...breadcrumbs.slice(-(maxItems - 2))
      ]
    : breadcrumbs;

  return (
    <nav 
      aria-label="Breadcrumb navigation"
      className={classNames(
        'flex items-center space-x-2 text-sm',
        'py-2 px-4 bg-neutral-50 border-b border-neutral-200',
        'dark:bg-neutral-900 dark:border-neutral-700',
        className
      )}
      {...(enableAnnotations && { 'data-sb-object-id': 'breadcrumb-nav' })}
    >
      <ol className="flex items-center space-x-2">
        {displayBreadcrumbs.map((crumb, index) => (
          <BreadcrumbItem
            key={`${crumb.path}-${index}`}
            crumb={crumb}
            isLast={index === displayBreadcrumbs.length - 1}
            showIcon={showIcons && index > 0}
            enableAnnotations={enableAnnotations}
          />
        ))}
      </ol>
    </nav>
  );
}

interface BreadcrumbItemProps {
  crumb: BreadcrumbItem;
  isLast: boolean;
  showIcon: boolean;
  enableAnnotations?: boolean;
}

function BreadcrumbItem({ crumb, isLast, showIcon, enableAnnotations }: BreadcrumbItemProps) {
  const isEllipsis = crumb.title === '...';
  const isCurrentPage = crumb.isCurrentPage || isLast;

  return (
    <li className="flex items-center space-x-2">
      {showIcon && (
        <ChevronRightIcon 
          className="w-4 h-4 text-neutral-400 dark:text-neutral-500 flex-shrink-0"
          aria-hidden="true"
        />
      )}
      
      {isEllipsis ? (
        <span 
          className="text-neutral-500 dark:text-neutral-400 select-none"
          aria-hidden="true"
        >
          ...
        </span>
      ) : isCurrentPage ? (
        <span 
          className={classNames(
            'font-medium text-neutral-900 dark:text-neutral-100',
            'truncate max-w-[200px]'
          )}
          aria-current="page"
          {...(enableAnnotations && { 'data-sb-field-path': 'current-page' })}
        >
          {crumb.title}
        </span>
      ) : (
        <Link
          href={crumb.path}
          className={classNames(
            'text-neutral-600 hover:text-primary-600 dark:text-neutral-300 dark:hover:text-primary-400',
            'transition-colors duration-200 truncate max-w-[200px]',
            'hover:underline focus:underline focus:outline-none'
          )}
          {...(enableAnnotations && { 'data-sb-field-path': `breadcrumb-${crumb.path}` })}
        >
          {crumb.title}
        </Link>
      )}
    </li>
  );
}

// Utility hook for managing breadcrumbs in pages
export function useBreadcrumbs() {
  const { updateBreadcrumbs } = useNavigationStore();

  const setBreadcrumbs = (breadcrumbs: BreadcrumbItem[]) => {
    updateBreadcrumbs(breadcrumbs);
  };

  const addBreadcrumb = (breadcrumb: BreadcrumbItem) => {
    const { breadcrumbs } = useNavigationStore.getState();
    const updated = [...breadcrumbs.filter(b => !b.isCurrentPage), breadcrumb];
    updateBreadcrumbs(updated);
  };

  return { setBreadcrumbs, addBreadcrumb };
}