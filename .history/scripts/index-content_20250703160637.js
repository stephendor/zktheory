const algoliasearch = require('algoliasearch');
const fs = require('fs');
const path = require('path');
const matter = require('front-matter');
const glob = require('glob');

// Load environment variables
require('dotenv').config();

const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);

const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME || 'zktheory_content');

function extractTextContent(markdown) {
    // Remove markdown syntax and return clean text
    return markdown
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links but keep text
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`([^`]+)`/g, '$1') // Remove inline code
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();
}

async function indexContent() {
    try {
        console.log('Loading content...');
        const { objects, pages } = allContent();

        const records = [];

        // Index pages
        pages.forEach((page) => {
            if (page.__metadata?.urlPath) {
                const record = {
                    objectID: page.__metadata.id,
                    title: page.title || 'Untitled',
                    description: page.excerpt || page.subtitle || '',
                    content: page.markdown_content ? extractTextContent(page.markdown_content) : '',
                    url: page.__metadata.urlPath,
                    type: 'page',
                    tags: page.tags || [],
                    slug: page.slug || ''
                };

                // Add first 500 characters of content for search
                if (record.content) {
                    record.excerpt = record.content.substring(0, 500);
                }

                records.push(record);
            }
        });

        // Index blog posts specifically
        const blogPosts = objects.filter((obj) => obj.__metadata?.modelName === 'PostLayout' && obj.__metadata?.id?.includes('blog/'));

        blogPosts.forEach((post) => {
            if (post.slug) {
                const record = {
                    objectID: post.__metadata.id + '_post',
                    title: post.title || 'Untitled Post',
                    description: post.excerpt || '',
                    content: post.markdown_content ? extractTextContent(post.markdown_content) : '',
                    url: `/blog/${post.slug}`,
                    type: 'blog-post',
                    tags: post.tags || [],
                    slug: post.slug,
                    date: post.date || '',
                    author: post.author || ''
                };

                if (record.content) {
                    record.excerpt = record.content.substring(0, 500);
                }

                records.push(record);
            }
        });

        // Index project pages
        const projectPages = objects.filter((obj) => obj.__metadata?.modelName === 'PostLayout' && obj.__metadata?.id?.includes('projects/'));

        projectPages.forEach((project) => {
            if (project.slug) {
                const record = {
                    objectID: project.__metadata.id + '_project',
                    title: project.title || 'Untitled Project',
                    description: project.excerpt || '',
                    content: project.markdown_content ? extractTextContent(project.markdown_content) : '',
                    url: `/projects/${project.slug}`,
                    type: 'project',
                    tags: project.tags || [],
                    slug: project.slug
                };

                if (record.content) {
                    record.excerpt = record.content.substring(0, 500);
                }

                records.push(record);
            }
        });

        console.log(`Indexing ${records.length} records...`);

        // Clear the index and add new records
        await index.clearObjects();
        await index.saveObjects(records);

        console.log('Content indexed successfully!');
        console.log('Records by type:');
        console.log(`- Pages: ${records.filter((r) => r.type === 'page').length}`);
        console.log(`- Blog posts: ${records.filter((r) => r.type === 'blog-post').length}`);
        console.log(`- Projects: ${records.filter((r) => r.type === 'project').length}`);
    } catch (error) {
        console.error('Error indexing content:', error);
        process.exit(1);
    }
}

// Configure index settings
async function configureIndex() {
    try {
        console.log('Configuring index settings...');

        await index.setSettings({
            searchableAttributes: ['title', 'description', 'content', 'tags', 'excerpt'],
            attributesForFaceting: ['type', 'tags'],
            customRanking: ['desc(date)'],
            highlightPreTag: '<mark>',
            highlightPostTag: '</mark>',
            snippetEllipsisText: '...',
            hitsPerPage: 10
        });

        console.log('Index settings configured successfully!');
    } catch (error) {
        console.error('Error configuring index:', error);
    }
}

async function main() {
    await configureIndex();
    await indexContent();
}

if (require.main === module) {
    main();
}

module.exports = { indexContent, configureIndex };
