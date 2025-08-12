'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { CrossReferences } from '../../atoms';
import classNames from 'classnames';

interface ContentWithCrossReferencesProps {
  children: React.ReactNode;
  showCrossReferences?: boolean;
  crossReferencesTitle?: string;
  crossReferencesPosition?: 'sidebar' | 'bottom';
  className?: string;
  enableAnnotations?: boolean;
}

export default function ContentWithCrossReferences({
  children,
  showCrossReferences = true,
  crossReferencesTitle = 'Related Content',
  crossReferencesPosition = 'sidebar',
  className = '',
  enableAnnotations = false
}: ContentWithCrossReferencesProps) {
  const pathname = usePathname();

  // Determine if we should show cross-references based on page type
  const shouldShowCrossReferences = showCrossReferences && pathname && (
    pathname.startsWith('/projects/') ||
    pathname.startsWith('/blog/') ||
    pathname.startsWith('/library/')
  );

  if (!shouldShowCrossReferences) {
    return <div className={className}>{children}</div>;
  }

  const isBottomPosition = crossReferencesPosition === 'bottom';
  const isSidebarPosition = crossReferencesPosition === 'sidebar';

  if (isBottomPosition) {
    return (
      <div className={classNames('w-full', className)}>
        <div className="w-full">
          {children}
        </div>
        <div className="mt-8 w-full">
          <CrossReferences 
            title={crossReferencesTitle}
            layout="grid"
            enableAnnotations={enableAnnotations}
          />
        </div>
      </div>
    );
  }

  if (isSidebarPosition) {
    return (
      <div className={classNames('grid grid-cols-1 xl:grid-cols-4 gap-8', className)}>
        <div className="xl:col-span-3">
          {children}
        </div>
        <aside className="xl:col-span-1">
          <div className="sticky top-8">
            <CrossReferences 
              title={crossReferencesTitle}
              layout="vertical"
              enableAnnotations={enableAnnotations}
            />
          </div>
        </aside>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}