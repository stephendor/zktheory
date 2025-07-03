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
    model.fields.forEach((field) => {
        if (field.type === 'reference' || (field.type === 'list' && field.items?.type === 'reference')) {
            allReferenceFields[modelName + ':' + field.name] = true;
        }
    });
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
    let content = null;
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

    if (process.env.NODE_ENV === 'development' && modelName === 'Config') {
        console.log('Resolving references for Config, header field:', content.header);
        console.log('Is header field a reference?', isRefField(modelName, 'header'));
        console.log('Header field type:', typeof content.header);
    }

    for (const fieldName in content) {
        let fieldValue = content[fieldName];
        if (!fieldValue) continue;

        const isRef = isRefField(modelName, fieldName);
        
        if (process.env.NODE_ENV === 'development' && modelName === 'Config' && (fieldName === 'header' || fieldName === 'footer')) {
            console.log(`Processing field ${fieldName}, isRef: ${isRef}, fieldValue type: ${typeof fieldValue}`);
        }
        
        if (Array.isArray(fieldValue)) {
            if (fieldValue.length === 0) continue;
            if (isRef && typeof fieldValue[0] === 'string') {
                fieldValue = fieldValue.map((filename) => fileToContent[filename]);
                content[fieldName] = fieldValue;
            }
            if (typeof fieldValue[0] === 'object') {
                fieldValue.forEach((o) => resolveReferences(o, fileToContent));
            }
        } else {
            if (isRef && typeof fieldValue === 'string') {
                if (process.env.NODE_ENV === 'development' && modelName === 'Config' && (fieldName === 'header' || fieldName === 'footer')) {
                    console.log(`Resolving string reference ${fieldName}: ${fieldValue} -> `, fileToContent[fieldValue]?.__metadata);
                }
                fieldValue = fileToContent[fieldValue];
                content[fieldName] = fieldValue;
            }
            // Only recursively process objects that are NOT reference fields
            // If it's a reference field that's already an object, it means it was already resolved
            if (typeof fieldValue === 'object' && !isRef) {
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
    const fileToContent = Object.fromEntries(objects.map((e) => [e.__metadata.id, e]));
    objects.forEach((e) => resolveReferences(e, fileToContent));

    pages.forEach((page) => {
        page.__metadata.urlPath = getPageUrl(page);
    });

    const siteConfig = data.find((e) => e.__metadata.modelName === Config.name);

    // Debug logging to understand the structure
    if (process.env.NODE_ENV === 'development') {
        console.log('Site config after initial resolveReferences:', {
            header: siteConfig?.header?.__metadata || siteConfig?.header,
            footer: siteConfig?.footer?.__metadata || siteConfig?.footer
        });
    }

    return { objects, pages, props: { site: siteConfig } };
}
