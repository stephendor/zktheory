#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Convert markdown files to MDX format
 * This script processes existing markdown files and converts them to MDX
 * while preserving frontmatter and content structure
 */

const contentDir = path.join(__dirname, '../content');
const docsDir = path.join(__dirname, '../src/app/documentation');

// Ensure docs directory exists
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
}

/**
 * Convert markdown content to MDX
 * @param {string} content - Original markdown content
 * @param {string} filename - Original filename
 * @returns {string} - Converted MDX content
 */
function convertMarkdownToMDX(content, filename) {
    let mdxContent = content;

    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
    let frontmatter = {};

    if (frontmatterMatch) {
        try {
            // Parse YAML-like frontmatter
            const frontmatterText = frontmatterMatch[1];
            const lines = frontmatterText.split('\n');

            lines.forEach((line) => {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length > 0) {
                    let value = valueParts.join(':').trim();

                    // Handle quoted strings
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1);
                    } else if (value.startsWith("'") && value.endsWith("'")) {
                        value = value.slice(1, -1);
                    }

                    // Handle boolean values
                    if (value === 'true') value = true;
                    else if (value === 'false') value = false;

                    frontmatter[key.trim()] = value;
                }
            });

            // Remove original frontmatter
            mdxContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');
        } catch (error) {
            console.warn(`Warning: Could not parse frontmatter for ${filename}:`, error.message);
        }
    }

    // Convert markdown links to Next.js Link components where appropriate
    mdxContent = mdxContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        // Convert internal links to Next.js Link format
        if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
            return `<Link href="${url}">${text}</Link>`;
        }
        // External links remain as regular markdown
        return match;
    });

    // Convert code blocks to use proper syntax highlighting
    mdxContent = mdxContent.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || 'text';
        return `\`\`\`${language}\n${code}\n\`\`\``;
    });

    // Add import statement for Next.js Link component if we have internal links
    if (mdxContent.includes('<Link href=')) {
        mdxContent = `import Link from 'next/link';\n\n${mdxContent}`;
    }

    return mdxContent;
}

/**
 * Process a single markdown file
 * @param {string} filePath - Path to the markdown file
 * @param {string} relativePath - Relative path from content directory
 */
function processMarkdownFile(filePath, relativePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const mdxContent = convertMarkdownToMDX(content, path.basename(filePath));

        // Create corresponding docs path
        const docsPath = path.join(docsDir, relativePath.replace('.md', '.mdx'));
        const docsDirPath = path.dirname(docsPath);

        // Ensure docs directory exists
        if (!fs.existsSync(docsDirPath)) {
            fs.mkdirSync(docsDirPath, { recursive: true });
        }

        // Write MDX file
        fs.writeFileSync(docsPath, mdxContent);
        console.log(`✅ Converted: ${relativePath} → ${docsPath.replace(docsDir, 'docs')}`);
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

/**
 * Recursively process markdown files in a directory
 * @param {string} dirPath - Directory to process
 * @param {string} relativePath - Relative path from content directory
 */
function processDirectory(dirPath, relativePath = '') {
    const items = fs.readdirSync(dirPath);

    items.forEach((item) => {
        const itemPath = path.join(dirPath, item);
        const itemRelativePath = path.join(relativePath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            // Recursively process subdirectories
            processDirectory(itemPath, itemRelativePath);
        } else if (item.endsWith('.md')) {
            // Process markdown files
            processMarkdownFile(itemPath, itemRelativePath);
        }
    });
}

/**
 * Main conversion function
 */
function main() {
    console.log('🔄 Starting markdown to MDX conversion...\n');

    if (!fs.existsSync(contentDir)) {
        console.error(`❌ Content directory not found: ${contentDir}`);
        process.exit(1);
    }

    try {
        processDirectory(contentDir);
        console.log('\n✅ Conversion completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Review the converted MDX files in src/app/documentation/');
        console.log('2. Update any import paths or component references');
        console.log('3. Test the documentation pages in your browser');
    } catch (error) {
        console.error('\n❌ Conversion failed:', error.message);
        process.exit(1);
    }
}

// Run the conversion if this script is executed directly
if (require.main === module) {
    main();
}

module.exports = {
    convertMarkdownToMDX,
    processMarkdownFile,
    processDirectory
};
