const algoliasearch = require('algoliasearch');
const fs = require('fs');
const path = require('path');
const matter = require('front-matter');
const { globSync } = require('glob');

// Load environment variables
require('dotenv').config();

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_API_KEY
);

const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME || 'zktheory_content');

// Content directories
const pagesDir = 'content/pages';
const dataDir = 'content/data';

function contentFilesInPath(dir) {
  const globPattern = `${dir}/**/*.{md,json}`;
  return globSync(globPattern);
}

function readContent(file) {
  const rawContent = fs.readFileSync(file, 'utf8');
  let content = null;
  const ext = path.extname(file).substring(1);
  
  switch (ext) {
    case 'md':
      const parsedMd = matter(rawContent);
      content = {
        ...parsedMd.attributes,
        markdown_content: parsedMd.body
      };
      break;
    case 'json':
      content = JSON.parse(rawContent);
      break;
    default:
      throw Error(`Unhandled file type: ${file}`);
  }

  // Add metadata
  content.__metadata = {
    id: file.replace(/\\/g, '/'), // Replace backslashes with forward slashes
    modelName: content.type
  };

  return content;
}

function getPageUrl(page) {
  if (!page || !page.slug) {
    return null;
  }

  if (['PostLayout'].includes(page.type)) {
    // Check if this is a project page based on file path
    if (page.__metadata.id && page.__metadata.id.includes('content/pages/projects/')) {
      return `/projects${page.slug.startsWith('/') ? page.slug : `/${page.slug}`}`;
    }
    // Default to blog for other PostLayout pages
    return `/blog${page.slug.startsWith('/') ? page.slug : `/${page.slug}`}`;
  }

  return page.slug.startsWith('/') ? page.slug : `/${page.slug}`;
}

function extractTextContent(markdown) {
  if (!markdown) return '';
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

function loadAllContent() {
  const [dataFiles, pageFiles] = [dataDir, pagesDir].map((dir) => {
    return contentFilesInPath(dir).map((file) => readContent(file));
  });
  
  const objects = [...pageFiles, ...dataFiles];
  
  // Filter pages for URL resolution
  const pages = objects.filter(obj => 
    obj.type === 'PageLayout' || 
    obj.type === 'PostLayout' || 
    obj.type === 'PostFeedLayout'
  );
  
  // Add URLs to pages
  pages.forEach((page) => {
    page.__metadata.urlPath = getPageUrl(page);
  });

  return { objects, pages };
}

async function indexContent() {
  try {
    console.log('Loading content...');
    const { objects, pages } = loadAllContent();
    
    const records = [];
    
    // Index pages
    pages.forEach((page) => {
      if (page.__metadata?.urlPath && page.title) {
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
    
    // Separate blog posts and project pages for better categorization
    const blogPosts = records.filter(r => r.url && r.url.startsWith('/blog/'));
    const projectPages = records.filter(r => r.url && r.url.startsWith('/projects/'));
    const otherPages = records.filter(r => r.url && !r.url.startsWith('/blog/') && !r.url.startsWith('/projects/'));
    
    // Update types for better search filtering
    blogPosts.forEach(record => { record.type = 'blog-post'; });
    projectPages.forEach(record => { record.type = 'project'; });
    
    console.log(`Indexing ${records.length} records...`);
    
    // Clear the index and add new records
    await index.clearObjects();
    await index.saveObjects(records);
    
    console.log('Content indexed successfully!');
    console.log('Records by type:');
    console.log(`- Pages: ${otherPages.length}`);
    console.log(`- Blog posts: ${blogPosts.length}`);
    console.log(`- Projects: ${projectPages.length}`);
    
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
      searchableAttributes: [
        'title',
        'description',
        'content',
        'tags',
        'excerpt'
      ],
      attributesForFaceting: [
        'type',
        'tags'
      ],
      customRanking: [
        'desc(date)'
      ],
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
  // Check for required environment variables
  if (!process.env.ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_API_KEY) {
    console.error('Missing required environment variables:');
    console.error('- ALGOLIA_APP_ID');
    console.error('- ALGOLIA_ADMIN_API_KEY');
    console.error('Please check your .env.local file');
    process.exit(1);
  }

  await configureIndex();
  await indexContent();
}

if (require.main === module) {
  main();
}

module.exports = { indexContent, configureIndex };
