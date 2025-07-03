import React, { useEffect, useRef } from 'react';
import { autocomplete } from '@algolia/autocomplete-js';
import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions';
import algoliasearch from 'algoliasearch';

interface AlgoliaSearchProps {
  appId: string;
  apiKey: string;
  indexName: string;
  placeholder?: string;
  className?: string;
}

export default function AlgoliaSearch({
  appId,
  apiKey,
  indexName,
  placeholder = 'Search documentation...',
  className = ''
}: AlgoliaSearchProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const searchClient = algoliasearch(appId, apiKey);

    const querySuggestionsPlugin = createQuerySuggestionsPlugin({
      searchClient,
      indexName: `${indexName}_query_suggestions`,
      getSearchParams() {
        return { hitsPerPage: 5 };
      },
    });

    const search = autocomplete({
      container: containerRef.current,
      placeholder,
      plugins: [querySuggestionsPlugin],
      openOnFocus: true,
      getSources({ query }) {
        return [
          {
            sourceId: 'pages',
            getItems() {
              return searchClient.search([
                {
                  indexName,
                  query,
                  params: {
                    hitsPerPage: 8,
                  },
                },
              ]).then(({ results }) => results[0].hits);
            },
            templates: {
              item({ item, html }) {
                return html`<div class="algolia-hit">
                  <div class="algolia-hit-title">${item.title}</div>
                  <div class="algolia-hit-description">${item.description || item.excerpt || ''}</div>
                  <div class="algolia-hit-url">${item.url || item.slug || ''}</div>
                </div>`;
              },
            },
            getItemUrl({ item }) {
              return item.url || item.slug || '#';
            },
          },
        ];
      },
    });

    return () => {
      search.destroy();
    };
  }, [appId, apiKey, indexName, placeholder]);

  return (
    <div className={`algolia-search-container ${className}`}>
      <div ref={containerRef} />
      <style jsx>{`
        .algolia-search-container {
          position: relative;
          width: 100%;
          max-width: 600px;
        }
        
        :global(.aa-Autocomplete) {
          width: 100%;
        }
        
        :global(.aa-Form) {
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          background: white;
        }
        
        :global(.aa-InputWrapper) {
          padding: 12px 16px;
        }
        
        :global(.aa-Input) {
          border: none;
          outline: none;
          font-size: 16px;
          width: 100%;
          color: #374151;
        }
        
        :global(.aa-Panel) {
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          background: white;
          margin-top: 4px;
          max-height: 400px;
          overflow-y: auto;
        }
        
        :global(.algolia-hit) {
          padding: 12px 16px;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }
        
        :global(.algolia-hit:hover) {
          background-color: #f9fafb;
        }
        
        :global(.algolia-hit-title) {
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }
        
        :global(.algolia-hit-description) {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        :global(.algolia-hit-url) {
          color: #9ca3af;
          font-size: 12px;
        }
        
        :global(.aa-Item[aria-selected="true"]) {
          background-color: #f3f4f6;
        }
      `}</style>
    </div>
  );
}
