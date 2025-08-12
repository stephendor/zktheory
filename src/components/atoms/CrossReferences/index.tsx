'use client';

import React from 'react';
import { useNavigationStore, CrossReference } from '../../../stores/navigationStore';
import Link from '../Link';
import classNames from 'classnames';

interface CrossReferencesProps {
  className?: string;
  title?: string;
  showReasons?: boolean;
  layout?: 'vertical' | 'horizontal' | 'grid';
  enableAnnotations?: boolean;
}

export default function CrossReferences({
  className = '',
  title = 'Related Content',
  showReasons = true,
  layout = 'vertical',
  enableAnnotations = false
}: CrossReferencesProps) {
  const { crossReferences, preferences } = useNavigationStore();

  // Don't render if cross-references are disabled or empty
  if (!preferences.showCrossReferences || crossReferences.length === 0) {
    return null;
  }

  const layoutClasses = {
    vertical: 'flex flex-col space-y-3',
    horizontal: 'flex flex-row space-x-4 overflow-x-auto',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-3'
  };

  return (
    <aside 
      className={classNames(
        'bg-neutral-50 dark:bg-neutral-900',
        'border border-neutral-200 dark:border-neutral-700',
        'rounded-lg p-4',
        className
      )}
      aria-labelledby="cross-references-title"
      {...(enableAnnotations && { 'data-sb-object-id': 'cross-references' })}
    >
      <h3 
        id="cross-references-title"
        className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3"
        {...(enableAnnotations && { 'data-sb-field-path': 'title' })}
      >
        {title}
      </h3>
      
      <div className={layoutClasses[layout]}>
        {crossReferences.map((reference, index) => (
          <CrossReferenceItem
            key={reference.id}
            reference={reference}
            showReason={showReasons}
            layout={layout}
            enableAnnotations={enableAnnotations}
            index={index}
          />
        ))}
      </div>
    </aside>
  );
}

interface CrossReferenceItemProps {
  reference: CrossReference;
  showReason: boolean;
  layout: 'vertical' | 'horizontal' | 'grid';
  enableAnnotations?: boolean;
  index: number;
}

function CrossReferenceItem({ 
  reference, 
  showReason, 
  layout, 
  enableAnnotations,
  index 
}: CrossReferenceItemProps) {
  const isCompact = layout === 'horizontal';

  const typeStyles = {
    related: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    prerequisite: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    'next-step': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    application: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  };

  const typeLabels = {
    related: 'Related',
    prerequisite: 'Prerequisites',
    'next-step': 'Next Steps',
    application: 'Applications'
  };

  return (
    <div 
      className={classNames(
        'border border-neutral-200 dark:border-neutral-700',
        'rounded-md p-3 transition-all duration-200',
        'hover:border-primary-300 dark:hover:border-primary-600',
        'hover:shadow-sm',
        isCompact ? 'min-w-[250px] flex-shrink-0' : 'w-full'
      )}
      {...(enableAnnotations && { 'data-sb-field-path': `reference-${index}` })}
    >
      <div className="flex items-start justify-between mb-2">
        <span 
          className={classNames(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            typeStyles[reference.type]
          )}
          {...(enableAnnotations && { 'data-sb-field-path': `type-${index}` })}
        >
          {typeLabels[reference.type]}
        </span>
        
        <div 
          className="text-xs text-neutral-500 dark:text-neutral-400"
          title={`Relevance Score: ${reference.relevanceScore}`}
        >
          {Array.from({ length: Math.min(5, Math.ceil(reference.relevanceScore / 2)) }, (_, i) => (
            <span key={i}>●</span>
          ))}
        </div>
      </div>

      <Link
        href={reference.path}
        className={classNames(
          'block font-medium text-neutral-900 dark:text-neutral-100',
          'hover:text-primary-600 dark:hover:text-primary-400',
          'transition-colors duration-200 mb-1',
          isCompact ? 'text-sm' : 'text-base'
        )}
        {...(enableAnnotations && { 'data-sb-field-path': `link-${index}` })}
      >
        {reference.title}
      </Link>

      {showReason && reference.reason && (
        <p 
          className={classNames(
            'text-neutral-600 dark:text-neutral-300',
            isCompact ? 'text-xs' : 'text-sm',
            'line-clamp-2'
          )}
          title={reference.reason}
          {...(enableAnnotations && { 'data-sb-field-path': `reason-${index}` })}
        >
          {reference.reason}
        </p>
      )}
    </div>
  );
}

// Hook for adding cross-reference tooltips to content
export function useCrossReferenceTooltip() {
  const { findRelatedItems } = useNavigationStore();

  const getRelatedItems = (conceptOrTag: string) => {
    const { navigationItems } = useNavigationStore.getState();
    return navigationItems.filter(item => 
      item.relatedConcepts?.includes(conceptOrTag) ||
      item.tags?.includes(conceptOrTag)
    );
  };

  return { getRelatedItems, findRelatedItems };
}

// Inline cross-reference component for use within content
export function InlineCrossReference({ 
  concept, 
  children, 
  className = '' 
}: { 
  concept: string; 
  children: React.ReactNode;
  className?: string;
}) {
  const { getRelatedItems } = useCrossReferenceTooltip();
  const relatedItems = getRelatedItems(concept);

  if (relatedItems.length === 0) {
    return <>{children}</>;
  }

  return (
    <span 
      className={classNames(
        'relative inline-block cursor-help',
        'border-b border-dotted border-primary-400',
        'hover:border-primary-600 transition-colors',
        className
      )}
      title={`Related: ${relatedItems.map(item => item.title).join(', ')}`}
    >
      {children}
    </span>
  );
}