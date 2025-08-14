# zktheory Documentation System

This directory contains the integrated Next.js documentation system that transforms existing MkDocs content into interactive MDX pages with React components.

## Architecture

### Directory Structure

```
src/app/docs/
├── components/           # Reusable documentation components
│   ├── MDXRenderer.tsx  # MDX content renderer with KaTeX support
│   └── DocumentationLayout.tsx  # Consistent layout wrapper
├── projects/            # Project-specific documentation
│   └── tda-explorer/    # TDA Explorer docs
├── page.tsx             # Main documentation index
└── README.md            # This file
```

### Key Components

#### MDXRenderer

- Renders MDX content with custom React components
- Integrates KaTeX for mathematical notation
- Provides consistent styling for all documentation elements
- Supports custom component overrides

#### DocumentationLayout

- Provides consistent header and navigation
- Includes breadcrumb navigation
- Optional sidebar for section navigation
- Responsive design for all devices

## Features

### Mathematical Rendering

- **KaTeX Integration**: High-quality LaTeX math rendering
- **Inline Math**: Use `$...$` for inline mathematical expressions
- **Block Math**: Use `$$...$$` for displayed equations
- **Custom Math Components**: `<math>` and `<inlineMath>` components

### Interactive Elements

- **Next.js Link Components**: Automatic conversion of internal links
- **Custom React Components**: Embed interactive examples
- **Responsive Design**: Mobile-friendly documentation

### Content Organization

- **Hierarchical Navigation**: Breadcrumb and sidebar navigation
- **Section Grouping**: Logical organization by topic
- **Cross-references**: Easy navigation between related content

## Usage

### Writing Documentation

1. **Create a new page**: Add a new `.tsx` file in the appropriate directory
2. **Use DocumentationLayout**: Wrap content with the layout component
3. **Add navigation**: Include breadcrumbs and sidebar as needed
4. **Write content**: Use standard HTML/JSX with MDX support

### Example Page Structure

```tsx
import React from 'react';
import DocumentationLayout from '../components/DocumentationLayout';

export default function MyDocsPage() {
  return (
    <DocumentationLayout title="Page Title" description="Page description" breadcrumbs={[{ label: 'Section', href: '/docs/section' }, { label: 'Page Title' }]}>
      <div className="space-y-6">
        <h2>Section Heading</h2>
        <p>Your content here...</p>

        {/* Math example */}
        <p>Consider the equation: $E = mc^2$</p>

        {/* Code example */}
        <pre>
          <code>console.log('Hello, World!');</code>
        </pre>
      </div>
    </DocumentationLayout>
  );
}
```

### Converting Existing Markdown

Use the conversion script to transform existing markdown files:

```bash
node scripts/convert-markdown-to-mdx.js
```

This will:

- Convert `.md` files to MDX format
- Preserve frontmatter and content structure
- Convert internal links to Next.js Link components
- Maintain code block syntax highlighting

## Styling

### Tailwind CSS Classes

- **Typography**: Uses `prose` classes for consistent text styling
- **Layout**: Responsive grid and flexbox layouts
- **Components**: Consistent button, card, and form styling
- **Colors**: Semantic color scheme for different content types

### Custom Components

- **Math Blocks**: Styled mathematical expressions
- **Code Blocks**: Syntax-highlighted code with proper formatting
- **Callouts**: Highlighted information boxes
- **Navigation**: Consistent navigation patterns

## Dependencies

### Required Packages

- `next-mdx-remote`: MDX rendering support
- `react-katex`: Mathematical notation rendering
- `@heroicons/react`: Icon library for navigation

### Installation

```bash
npm install next-mdx-remote react-katex @heroicons/react
npm install -D @types/katex
```

## Migration from MkDocs

### Content Conversion

1. **Run conversion script**: Automatically converts markdown to MDX
2. **Review converted files**: Check for any formatting issues
3. **Update links**: Ensure internal navigation works correctly
4. **Test rendering**: Verify math and code blocks display properly

### Navigation Updates

1. **Update sidebar items**: Modify navigation structure as needed
2. **Add breadcrumbs**: Include proper navigation hierarchy
3. **Test navigation**: Ensure all links work correctly

### Styling Adjustments

1. **Review component styling**: Check if custom styling is needed
2. **Update color schemes**: Ensure consistency with design system
3. **Test responsiveness**: Verify mobile and desktop layouts

## Future Enhancements

### Planned Features

- **Search Integration**: Full-text search across documentation
- **Interactive Examples**: Embedded code execution
- **Version Control**: Documentation versioning system
- **API Documentation**: Automatic API reference generation
- **Tutorial System**: Step-by-step guided learning

### Performance Optimizations

- **Lazy Loading**: Load documentation sections on demand
- **Caching**: Implement documentation caching strategies
- **CDN Integration**: Serve static assets from CDN
- **Bundle Optimization**: Reduce JavaScript bundle sizes

## Contributing

### Adding New Documentation

1. **Follow the structure**: Use existing components and layouts
2. **Test thoroughly**: Ensure all features work correctly
3. **Update navigation**: Add new pages to appropriate sections
4. **Document changes**: Update this README as needed

### Component Development

1. **Reusable design**: Create components that can be used across pages
2. **Accessibility**: Ensure components meet accessibility standards
3. **Responsive design**: Test on various screen sizes
4. **Performance**: Optimize for fast rendering

## Support

For questions or issues with the documentation system:

1. Check this README for common solutions
2. Review existing component implementations
3. Check the conversion script for markdown issues
4. Test with simple content first

---

_This documentation system is designed to provide a modern, interactive experience for zktheory users while maintaining the mathematical rigor and educational value of the original content._
