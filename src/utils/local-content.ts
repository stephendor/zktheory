import * as fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import frontmatter from 'front-matter';
import { allModels } from '../../sources/local/models';
import { Config } from '../../sources/local/models/Config';
import { getPageUrl } from './page-utils';

// TODO use types?

const pagesDir = 'content/pages';
const dataDir = 'content/data';

const allReferenceFields = {};
Object.entries(allModels).forEach(([modelName, model]) => {
    if (model.fields) {
        model.fields.forEach((field) => {
            if (field.type === 'reference' || (field.type === 'list' && field.items?.type === 'reference')) {
                allReferenceFields[modelName + ':' + field.name] = true;
            }
        });
    }
});

function isRefField(modelName: string, fieldName: string) {
    return !!allReferenceFields[modelName + ':' + fieldName];
}

const supportedFileTypes = ['md', 'json'];
function contentFilesInPath(dir: string) {
    const globPattern = `${dir}/**/*.{${supportedFileTypes.join(',')}}`;
    return globSync(globPattern);
}

function readContent(file: string) {
    const rawContent = fs.readFileSync(file, 'utf8');
    let content: any = null;
    switch (path.extname(file).substring(1)) {
        case 'md':
            const parsedMd = frontmatter<Record<string, any>>(rawContent);
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

    // Make Sourcebit-compatible
    content.__metadata = {
        id: file.replace(/\\/g, '/'), // Replace backslashes with forward slashes
        modelName: content.type
    };

    return content;
}

function resolveReferences(content, fileToContent) {
    if (!content || !content.type) return;

    const modelName = content.type;
    // Make Sourcebit-compatible
    if (!content.__metadata) content.__metadata = { modelName: content.type };

    for (const fieldName in content) {
        let fieldValue = content[fieldName];
        if (!fieldValue) continue;

        const isRef = isRefField(modelName, fieldName);
        
        if (Array.isArray(fieldValue)) {
            if (fieldValue.length === 0) continue;
            if (isRef && typeof fieldValue[0] === 'string') {
                // Resolve array of string references to array of objects
                fieldValue = fieldValue.map((filename) => {
                    const referencedObject = fileToContent[filename];
                    if (referencedObject && referencedObject.__metadata) {
                        return referencedObject;
                    }
                    return filename; // Keep as string if not found
                });
                content[fieldName] = fieldValue;
            }
            // Process array elements recursively if they are objects
            if (fieldValue.length > 0 && typeof fieldValue[0] === 'object') {
                fieldValue.forEach((o) => {
                    if (o && o.type) {
                        resolveReferences(o, fileToContent);
                    }
                });
            }
        } else {
            if (isRef && typeof fieldValue === 'string') {
                // Resolve string reference to object
                const referencedObject = fileToContent[fieldValue];
                if (referencedObject && referencedObject.__metadata) {
                    content[fieldName] = referencedObject;
                    fieldValue = referencedObject;
                }
            }
            // Process object recursively if it's an object with a type
            if (fieldValue && typeof fieldValue === 'object' && fieldValue.type) {
                resolveReferences(fieldValue, fileToContent);
            }
        }
    }
}

export function allContent() {
    const [data, pages] = [dataDir, pagesDir].map((dir) => {
        return contentFilesInPath(dir).map((file) => readContent(file));
    });
    const objects = [...pages, ...data];
    
    // Create fileToContent map for reference resolution
    const fileToContent = Object.fromEntries(objects.map((e) => [e.__metadata.id, e]));
    
    // Resolve references in all objects
    objects.forEach((e) => resolveReferences(e, fileToContent));

    // Filter pages for URL resolution
    const resolvedPages = objects.filter(obj => 
        obj.__metadata.modelName === 'PageLayout' || 
        obj.__metadata.modelName === 'PostLayout' || 
        obj.__metadata.modelName === 'PostFeedLayout'
    );
    
    resolvedPages.forEach((page) => {
        page.__metadata.urlPath = getPageUrl(page);
    });

    const siteConfig = objects.find((e) => e.__metadata.modelName === Config.name);

    return { objects, pages: resolvedPages, props: { site: siteConfig } };
}
