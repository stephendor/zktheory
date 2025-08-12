import * as React from 'react';
import classNames from 'classnames';

export default function BlankBaseLayout(props: any) {
    const { page, site } = props;
    const { enableAnnotations = true } = site;
    const pageMeta = page?.__metadata || {};
    return (
        <div className={classNames('sb-page', pageMeta.pageCssClasses)} {...(enableAnnotations && { 'data-sb-object-id': pageMeta.id })}>
            {/* 
                Note: Head management moved to page-level generateMetadata() in App Router
                Title, description, and favicon are handled by the page's metadata export
            */}
            {props.children}
        </div>
    );
}
