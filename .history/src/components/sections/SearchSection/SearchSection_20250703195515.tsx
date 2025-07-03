import * as React from 'react';
import classNames from 'classnames';

import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';

export default function SearchSection(props) {
    const {
        title,
        subtitle,
        colors = 'bg-light-fg-dark',
        styles = {},
        enableAnnotations = false
    } = props;

    return (
        <section
            className={classNames(
                'sb-component',
                'sb-component-search-section',
                colors,
                'flex',
                'flex-col',
                'justify-center',
                'relative',
                styles?.self?.margin ? mapStyles({ margin: styles?.self?.margin }) : undefined,
                styles?.self?.padding ? mapStyles({ padding: styles?.self?.padding }) : 'py-12 px-4',
                styles?.self?.alignItems ? mapStyles({ alignItems: styles?.self?.alignItems }) : 'items-center',
                styles?.self?.justifyContent ? mapStyles({ justifyContent: styles?.self?.justifyContent }) : 'justify-center',
                styles?.self?.flexDirection ? mapStyles({ flexDirection: styles?.self?.flexDirection }) : 'flex-col'
            )}
            {...(enableAnnotations && { 'data-sb-object-id': props?.__metadata?.id })}
        >
            <div className="w-full max-w-7xl">
                {title && (
                    <h2
                        className={classNames(
                            'text-3xl',
                            'sm:text-4xl',
                            'mb-4',
                            'text-center',
                            colors === 'bg-light-fg-dark' ? 'text-current' : 'text-current'
                        )}
                        {...(enableAnnotations && { 'data-sb-field-path': 'title' })}
                    >
                        {title}
                    </h2>
                )}
                {subtitle && (
                    <p
                        className={classNames(
                            'text-lg',
                            'mb-8',
                            'text-center',
                            colors === 'bg-light-fg-dark' ? 'text-gray-600' : 'text-gray-400'
                        )}
                        {...(enableAnnotations && { 'data-sb-field-path': 'subtitle' })}
                    >
                        {subtitle}
                    </p>
                )}
                <div className="flex justify-center">
                    {/* Netlify-Algolia Search Container */}
                    <div 
                        id="search" 
                        className="w-full max-w-2xl"
                        style={{ minHeight: '60px' }}
                    ></div>
                    {/* Fallback search message */}
                    <div className="w-full max-w-2xl text-center mt-4">
                        <p className="text-sm text-gray-500">
                            Search powered by Algolia • 
                            <a 
                                href="https://docs.zktheory.org" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-2 text-indigo-600 hover:text-indigo-800 underline"
                            >
                                Browse Documentation →
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
