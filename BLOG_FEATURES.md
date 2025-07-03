# Enhanced Blog Features Documentation

## Overview

Your blog now supports advanced features for technical writing, including:

- **Code blocks** with syntax highlighting
- **Mathematical equations** with MathJax
- **Interactive charts** with Chart.js
- **Diagrams** with Mermaid
- **Enhanced styling** for better readability

## Usage Guide

### 1. Code Blocks

Use fenced code blocks with language specification:

```markdown
```javascript
function example() {
    console.log("Hello, World!");
}
```
```

**Supported languages:** JavaScript, TypeScript, Python, Java, C#, Go, Rust, SQL, HTML, CSS, JSON, YAML, Markdown, and 150+ more.

**Features:**
- Syntax highlighting
- Line numbers
- Copy-to-clipboard button
- Language indicator
- Dark/light themes

### 2. Mathematical Equations

#### Inline Math
Use single dollar signs for inline equations:
```markdown
The formula is $E = mc^2$ where...
```

#### Block Math
Use double dollar signs for block equations:
```markdown
$$
\frac{d}{dx}\left( \int_{a}^{x} f(t) dt\right) = f(x)
$$
```

**Supported:**
- LaTeX syntax
- Complex equations
- Greek letters, symbols
- Matrices, integrals, summations
- Fractions, roots, exponents

### 3. Charts and Data Visualization

#### Line Charts
```markdown
<Chart 
  type="line"
  title="Chart Title"
  description="Chart description"
  data='{
    "labels": ["Jan", "Feb", "Mar"],
    "datasets": [{
      "label": "Data",
      "data": [10, 20, 30],
      "borderColor": "rgb(99, 102, 241)"
    }]
  }'
/>
```

#### Bar Charts
```markdown
<Chart 
  type="bar"
  title="Bar Chart"
  data='{
    "labels": ["A", "B", "C"],
    "datasets": [{
      "label": "Values",
      "data": [12, 19, 8],
      "backgroundColor": "rgba(54, 162, 235, 0.8)"
    }]
  }'
/>
```

#### Pie Charts
```markdown
<Chart 
  type="pie"
  title="Distribution"
  data='{
    "labels": ["Red", "Blue", "Yellow"],
    "datasets": [{
      "data": [300, 50, 100],
      "backgroundColor": ["#FF6384", "#36A2EB", "#FFCE56"]
    }]
  }'
/>
```

### 4. Diagrams with Mermaid

#### Flowcharts
```markdown
<Mermaid>
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
</Mermaid>
```

#### System Architecture
```markdown
<Mermaid>
graph LR
    A[Frontend] --> B[API Gateway]
    B --> C[Microservice 1]
    B --> D[Microservice 2]
    C --> E[Database]
    D --> E
</Mermaid>
```

#### Sequence Diagrams
```markdown
<Mermaid>
sequenceDiagram
    participant A as Client
    participant B as Server
    participant C as Database
    
    A->>B: Request
    B->>C: Query
    C-->>B: Result
    B-->>A: Response
</Mermaid>
```

## Enhanced Markdown Features

### Tables
```markdown
| Feature | Status | Notes |
|---------|--------|-------|
| Highlighting | ✅ | Working |
| Math | ✅ | LaTeX support |
| Charts | ✅ | Interactive |
```

### Blockquotes
```markdown
> Important information or quotes
> can be highlighted like this.
```

### Lists
```markdown
**Features:**
- ✅ Syntax highlighting
- ✅ Mathematical equations
- ✅ Interactive charts
- ✅ Responsive design

**Steps:**
1. First step
2. Second step
3. Final step
```

## Best Practices

### Code Blocks
- Always specify the language for proper highlighting
- Keep code examples concise and relevant
- Add comments to explain complex logic
- Use descriptive variable names

### Mathematical Equations
- Use block equations for important formulas
- Break complex equations into multiple lines
- Define variables before using them
- Consider adding explanatory text

### Charts
- Choose appropriate chart types for your data
- Use consistent color schemes
- Add meaningful titles and descriptions
- Keep data sets reasonably sized

### Diagrams
- Keep diagrams simple and focused
- Use consistent naming conventions
- Add descriptive labels
- Consider the reading flow

## File Structure

```
src/
├── components/
│   └── blocks/
│       ├── CodeBlock/          # Syntax highlighting
│       ├── Chart/              # Data visualization
│       ├── MathJax/            # Mathematical equations
│       └── Mermaid/            # Diagrams
├── utils/
│   └── markdown-options.tsx   # Enhanced markdown config
└── css/
    └── blog-enhancements.css  # Additional styling
```

## Dependencies

The following packages have been added:

**Code Highlighting:**
- `prismjs` - Syntax highlighting engine
- `react-syntax-highlighter` - React wrapper

**Mathematics:**
- `katex` - Math rendering engine
- `rehype-katex` - Rehype plugin
- `remark-math` - Remark plugin

**Charts:**
- `chart.js` - Chart library
- `react-chartjs-2` - React wrapper

**Diagrams:**
- `mermaid` - Diagram generation

**Data Visualization:**
- `d3` - Data manipulation
- `plotly.js` - Advanced plotting
- `react-plotly.js` - React wrapper

## Performance Considerations

- Components are dynamically imported to reduce bundle size
- MathJax loads only when needed
- Charts render only when visible
- Mermaid diagrams are generated client-side

## Browser Support

- Modern browsers (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Mobile responsive design
- Progressive enhancement for older browsers

## Troubleshooting

### Code blocks not highlighting
- Verify language name is correct
- Check if language is supported
- Ensure proper fencing with backticks

### Math not rendering
- Check LaTeX syntax
- Verify dollar sign escaping
- Allow time for MathJax to load

### Charts not displaying
- Validate JSON data format
- Check chart type spelling
- Ensure data structure matches chart type

### Diagrams not showing
- Verify Mermaid syntax
- Check for syntax errors in diagram code
- Allow time for client-side rendering
