import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';
import React from 'react';

import { getComponent } from '../../components-registry';
import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
import { getDataAttrs } from '../../../utils/get-data-attrs';
import TitleBlock from '../../blocks/TitleBlock';
import Action from '../../atoms/Action';
import Badge from '../../atoms/Badge';

export default function FeaturedItem(props) {
    const {
        elementId,
        title,
        tagline,
        subtitle,
        text,
        image,
        actions = [],
        badge,
        colors = 'bg-light-fg-dark',
        styles = {},
        hasSectionTitle,
        hasAnnotations
    } = props;
    const FeaturedItemImage = getComponent('ImageBlock');

    return (
        <div
            id={elementId}
            className={classNames(
                'sb-component',
                'sb-component-item',
                'sb-component-featured-item',
                colors,
                'flex',
                'flex-col',
                'justify-start',
                'relative',
                'h-full',
                styles?.self?.margin ? mapStyles({ margin: styles?.self?.margin }) : undefined,
                styles?.self?.padding ? mapStyles({ padding: styles?.self?.padding }) : undefined,
                styles?.self?.borderWidth && styles?.self?.borderWidth !== 0 ? 'border' : undefined,
                styles?.self?.borderRadius ? mapStyles({ borderRadius: styles?.self?.borderRadius }) : undefined,
                styles?.self?.borderColor ? mapStyles({ borderColor: styles?.self?.borderColor }) : undefined,
                styles?.self?.boxShadow ? mapStyles({ boxShadow: styles?.self?.boxShadow }) : undefined
            )}
            {...getDataAttrs(props)}
        >
            {badge && (
                <Badge
                    {...badge}
                    className="absolute top-0 right-0 z-10 -mt-2 -mr-2"
                    {...(hasAnnotations && { 'data-sb-field-path': '.badge' })}
                />
            )}
            {image && (
                <div className="w-full" {...(hasAnnotations && { 'data-sb-field-path': '.image' })}>
                    <FeaturedItemImage {...image} />
                </div>
            )}
            <div
                className={classNames('w-full', 'flex', 'flex-col', 'flex-grow', 'p-6', {
                    'pt-6': hasSectionTitle
                })}
            >
                {tagline && (
                    <p
                        className={classNames(
                            'w-full',
                            styles?.tagline ? mapStyles(styles?.tagline) : undefined,
                            'text-sm',
                            'uppercase',
                            'tracking-wider',
                            'mb-2'
                        )}
                        {...(hasAnnotations && { 'data-sb-field-path': '.tagline' })}
                    >
                        {tagline}
                    </p>
                )}
                <TitleBlock
                    {...title}
                    className="w-full"
                    {...(hasAnnotations && { 'data-sb-field-path': '.title' })}
                />
                {subtitle && (
                    <p
                        className={classNames('w-full', styles?.subtitle ? mapStyles(styles?.subtitle) : undefined, 'text-lg', 'mt-2')}
                        {...(hasAnnotations && { 'data-sb-field-path': '.subtitle' })}
                    >
                        {subtitle}
                    </p>
                )}
                {text && (
                    <Markdown
                        options={{ forceBlock: true, forceWrapper: true }}
                        className={classNames('sb-markdown', 'w-full', 'text-base', 'mt-4', { 'flex-grow': actions.length === 0 })}
                        {...(hasAnnotations && { 'data-sb-field-path': '.text' })}
                    >
                        {text}
                    </Markdown>
                )}
                {actions.length > 0 && (
                    <div
                        className={classNames('w-full', 'flex', 'flex-wrap', 'items-center', 'mt-auto', 'pt-6', {
                            'justify-center': styles?.self?.textAlign === 'center',
                            'justify-end': styles?.self?.textAlign === 'right'
                        })}
                    >
                        {actions.map((action, index) => (
                            <Action
                                key={index}
                                {...action}
                                className="mb-2 mr-2 lg:whitespace-nowrap"
                                {...(hasAnnotations && { 'data-sb-field-path': `.actions.${index}` })}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}