# Jupyter Notebook Integration Guide

This guide explains how to embed and serve Jupyter notebooks in your zktheory Next.js website.

## Overview

We've implemented multiple ways to display Jupyter notebooks:

1. **Static HTML Conversion** - Convert notebooks to standalone HTML files
2. **React Component Embedding** - Embed notebooks directly in React pages
3. **Static Notebook Viewer** - Iframe-based embedding with download options
4. **Direct File Downloads** - Allow users to download notebooks for local execution

## Implementation Details

### 1. Static HTML Conversion

**Script**: `scripts/convert-notebook.js`

Converts Jupyter notebooks to styled HTML files:

```bash
# Convert a single notebook
node scripts/convert-notebook.js InteractiveCayley.ipynb public/notebooks/InteractiveCayley.html

# Use npm script
npm run convert-notebook
```

**Features**:

- ✅ Preserves all cell content and outputs
- ✅ Adds styled formatting and syntax highlighting
- ✅ Includes download links
- ✅ Works without JavaScript
- ❌ No interactivity

### 2. React Component Embedding

**Component**: `src/components/NotebookEmbed/NotebookEmbed.tsx`

Direct React rendering of notebook JSON:

```tsx
import { NotebookEmbed } from '../components/NotebookEmbed';

<NotebookEmbed notebookPath="/InteractiveCayley.ipynb" title="Interactive Cayley Graph Explorer" height="800px" />;
```

**Features**:

- ✅ Full React integration
- ✅ Tailwind CSS styling
- ✅ Cell-by-cell rendering
- ❌ Requires client-side JSON parsing
- ❌ Limited output format support

### 3. Static Notebook Viewer

**Component**: `src/components/NotebookEmbed/StaticNotebookViewer.tsx`

Iframe-based embedding of converted HTML:

```tsx
import { StaticNotebookViewer } from '../components/NotebookEmbed';

<StaticNotebookViewer htmlPath="/notebooks/InteractiveCayley.html" title="Interactive Cayley Graph Explorer" height="800px" />;
```

**Features**:

- ✅ Reliable rendering
- ✅ Isolated styles
- ✅ Fast loading
- ✅ Download integration
- ❌ Iframe limitations

### 4. Page Integration

**GenericSection Integration**: Automatic detection based on `elementId`:

```markdown
- type: GenericSection
  elementId: notebook-viewer # Triggers notebook embedding
  text: |
    <div id="notebook-embed-container"></div>
```

## File Structure

```
zktheory/
├── scripts/
│   └── convert-notebook.js           # Conversion utility
├── src/components/NotebookEmbed/
│   ├── NotebookEmbed.tsx            # React component embedding
│   ├── StaticNotebookViewer.tsx     # Iframe-based viewer
│   └── index.ts                     # Exports
├── public/
│   ├── InteractiveCayley.ipynb      # Original notebook
│   ├── setup_cayley_explorer.sh     # Setup script
│   └── notebooks/
│       └── InteractiveCayley.html   # Converted HTML
└── content/pages/projects/
    ├── cayleygraph.md               # Main interactive page
    └── cayley-notebook.md           # Notebook-focused page
```

## Usage Examples

### Basic Page Setup

```markdown
---
type: PageLayout
title: My Notebook Page
sections:
  - type: GenericSection
    elementId: notebook-viewer
    title:
      text: 'Jupyter Notebook'
    text: |
      <div id="notebook-embed-container"></div>

      Additional content goes here...
---
```

### Custom React Usage

```tsx
import { StaticNotebookViewer, NotebookEmbed } from '../components/NotebookEmbed';

// Option 1: Static HTML viewer (recommended)
<StaticNotebookViewer
  htmlPath="/notebooks/InteractiveCayley.html"
  title="My Notebook"
  height="600px"
/>

// Option 2: Direct JSON embedding
<NotebookEmbed
  notebookPath="/MyNotebook.ipynb"
  title="My Notebook"
  showDownloadLinks={true}
/>
```

## Build Process

Add notebook processing to your build pipeline:

```json
// package.json
{
  "scripts": {
    "build-notebooks": "npm run convert-notebook && cp *.ipynb public/ && cp *.sh public/",
    "convert-notebook": "node scripts/convert-notebook.js InteractiveCayley.ipynb public/notebooks/InteractiveCayley.html"
  }
}
```

## Best Practices

### For Educational Content

- Use `StaticNotebookViewer` for reliability
- Include download links for full interactivity
- Provide setup instructions
- Add educational context around the notebook

### For Documentation

- Convert to HTML for better SEO
- Include code snippets in markdown when possible
- Use static conversion for archival purposes

### For Interactive Features

- Link to full Jupyter environment (CoCalc, local setup, etc.)
- Provide local setup instructions
- Consider web-based alternatives (React components)

## Troubleshooting

### Common Issues

1. **Notebook not loading**: Check file paths and ensure files are in `public/`
2. **Styling conflicts**: Use `StaticNotebookViewer` with iframe isolation
3. **Build errors**: Run `npm run build-notebooks` before building
4. **Mobile display**: Set appropriate height and responsive design

### Performance Optimization

- Use static HTML conversion for better loading times
- Lazy load notebook content
- Compress large notebooks
- Consider notebook chunking for very large files

## Future Enhancements

- **WebAssembly SageMath**: True browser-based computation
- **Notebook Diff Viewer**: Compare notebook versions
- **Interactive Widgets**: Port IPython widgets to React
- **Real-time Collaboration**: Shared notebook editing
- **Notebook Search**: Full-text search within notebooks
