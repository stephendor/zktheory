const algoliasearch = require('algoliasearch');
const fs = require('fs');
const path = require('path');
const matter = require('front-matter');
const glob = require('glob');

// Load environment variables
require('dotenv').config();

const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_API_KEY);

const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME || 'zktheory_content');

// Simple content loader for indexing
function loadContent() {
    const pagesDir = 'content/pages';
    const contentFiles = glob.sync(`${pagesDir}/**/*.md`);

    const pages = contentFiles.map((file) => {
        const content = fs.readFileSync(file, 'utf8');
        const parsed = matter(content);

        return {
            ...parsed.attributes,
            markdown_content: parsed.body,
            __metadata: {
                id: file.replace(/\\/g, '/'),
                modelName: parsed.attributes.type || 'Page'
            }
        };
    });

    return { pages };
}

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
        const { pages } = loadContent();

        const records = [];

        // Index pages with URL generation
        pages.forEach((page) => {
            if (page.slug && page.type) {
                let url;
                if (page.type === 'PostLayout') {
                    // Check if this is a project page
                    if (page.__metadata.id.includes('content/pages/projects/')) {
                        url = `/projects/${page.slug}`;
                    } else if (page.__metadata.id.includes('content/pages/blog/')) {
                        url = `/blog/${page.slug}`;
                    } else {
                        url = `/blog/${page.slug}`; // Default to blog
                    }
                } else {
                    url = `/${page.slug}`;
                }

                const record = {
                    objectID: page.__metadata.id,
                    title: page.title || 'Untitled',
                    description: page.excerpt || page.subtitle || '',
                    content: page.markdown_content ? extractTextContent(page.markdown_content) : '',
                    url: url,
                    type: page.type === 'PostLayout' ? (page.__metadata.id.includes('projects') ? 'project' : 'blog-post') : 'page',
                    tags: page.tags || [],
                    slug: page.slug
                };

                // Add first 500 characters of content for search
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
