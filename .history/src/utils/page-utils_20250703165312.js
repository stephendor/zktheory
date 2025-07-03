function cssClassesFromUrlPath(urlPath) {
    const parts = urlPath
        .replace(/^\/|\/$/g, '')
        .split('/')
        .filter(Boolean);

    let css = 'page';
    return parts.map((part) => {
        css += `-${part}`;
        return css;
    });
}

function getPageUrl(page) {
    if (!page || !page.slug) {
        return null;
    }

    if (['PostLayout'].includes(page?.__metadata.modelName)) {
        // Check if this is a project page based on file path
        if (page.__metadata.id && page.__metadata.id.includes('content/pages/projects/')) {
            return `/projects${page.slug.startsWith('/') ? page.slug : `/${page.slug}`}`;
        }
        // Default to blog for other PostLayout pages
        return `/blog${page.slug.startsWith('/') ? page.slug : `/${page.slug}`}`;
    }

    return page.slug.startsWith('/') ? page.slug : `/${page.slug}`;
}

function setEnvironmentVariables() {
    return {
        ...(process?.env?.URL && { URL: process.env.URL })
    };
}

module.exports = {
    cssClassesFromUrlPath,
    getPageUrl,
    setEnvironmentVariables
};
