import React from 'react';
import CodeBlock from '../components/blocks/CodeBlock';
import MathJax from '../components/blocks/MathJax';
import Chart from '../components/blocks/Chart';
import Mermaid from '../components/blocks/Mermaid';

// Custom components for markdown rendering
const CodeComponent = ({ children, className, ...props }: any) => {
  // Extract language from className (e.g., "language-javascript")
  const language = className?.replace('language-', '') || 'text';
  
  if (typeof children === 'string') {
    // Handle chart code blocks
    if (language === 'chart') {
      try {
        const chartConfig = JSON.parse(children);
        return (
          <Chart 
            type={chartConfig.type}
            data={chartConfig.data}
            options={chartConfig.options}
            title={chartConfig.title}
            description={chartConfig.description}
            {...props}
          />
        );
      } catch (error) {
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">Error parsing chart data: {error.message}</p>
          </div>
        );
      }
    }
    
    // Handle mermaid diagrams
    if (language === 'mermaid') {
      return <Mermaid chart={children} {...props} />;
    }
    
    // Handle regular code blocks
    return (
      <CodeBlock 
        language={language}
        showLineNumbers={true}
        {...props}
      >
        {children}
      </CodeBlock>
    );
  }
  
  return <code className={className} {...props}>{children}</code>;
};

// Math component for inline and block math
const MathComponent = ({ children, display, ...props }: any) => {
  // Extract text content from children
  const mathText = typeof children === 'string' ? children : 
                   React.isValidElement(children) ? (children.props as any)?.children || '' :
                   Array.isArray(children) ? children.join('') : 
                   String(children || '');
  
  return <MathJax math={mathText} display={display} {...props} />;
};

// Chart component wrapper
const ChartComponent = ({ data, type, options, title, description, ...props }: any) => {
  try {
    let chartConfig;
    
    console.log('ChartComponent received data:', typeof data, data);
    
    // Handle encoded data from preprocessMarkdown
    if (typeof data === 'string' && data.includes('%')) {
      const decodedData = decodeURIComponent(data);
      console.log('Decoded data:', decodedData);
      chartConfig = JSON.parse(decodedData);
    } else if (typeof data === 'string') {
      console.log('Parsing string data:', data.substring(0, 100) + '...');
      chartConfig = JSON.parse(data);
    } else {
      // Handle direct props
      chartConfig = {
        type: type || 'line',
        data: typeof data === 'string' ? JSON.parse(data) : data,
        options: typeof options === 'string' ? JSON.parse(options) : options,
        title,
        description
      };
    }
    
    console.log('Final chart config:', chartConfig);
    
    return (
      <Chart
        type={chartConfig.type}
        data={chartConfig.data}
        options={chartConfig.options}
        title={chartConfig.title}
        description={chartConfig.description}
        {...props}
      />
    );
  } catch (error) {
    console.error('ChartComponent error:', error);
    console.error('Received props:', { data, type, options, title, description });
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 text-sm">Error parsing chart data: {error.message}</p>
        <p className="text-xs text-red-600 mt-1">Data type: {typeof data}</p>
        <pre className="text-xs text-red-600 mt-1 overflow-auto">{String(data).substring(0, 200)}...</pre>
      </div>
    );
  }
};

// Mermaid component wrapper  
const MermaidComponent = ({ chart, children, ...props }: any) => {
  let diagramData = chart || children;
  
  console.log('MermaidComponent received:', typeof diagramData, diagramData);
  
  // Handle encoded data from preprocessMarkdown
  if (typeof diagramData === 'string' && diagramData.includes('%')) {
    diagramData = decodeURIComponent(diagramData);
    console.log('Decoded mermaid data:', diagramData);
  }
  
  return <Mermaid chart={diagramData} {...props} />;
};

// Enhanced markdown options with custom components
export const markdownOptions = {
  forceBlock: true,
  overrides: {
    // Code blocks
    code: CodeComponent,
    pre: {
      component: ({ children, ...props }: any) => {
        // Handle pre-wrapped code blocks
        if (React.isValidElement(children) && children.type === CodeComponent) {
          return children;
        }
        return <pre {...props}>{children}</pre>;
      }
    },
    
    // Math components
    Math: MathComponent,
    math: MathComponent,
    
    // Chart components
    Chart: ChartComponent,
    chart: ChartComponent,
    
    // Mermaid diagrams
    Mermaid: MermaidComponent,
    mermaid: MermaidComponent,
    
    // Enhanced blockquotes
    blockquote: {
      component: ({ children, ...props }: any) => (
        <blockquote 
          className="border-l-4 border-indigo-500 pl-4 py-2 my-4 bg-indigo-50 text-indigo-900 italic"
          {...props}
        >
          {children}
        </blockquote>
      )
    },
    
    // Enhanced tables
    table: {
      component: ({ children, ...props }: any) => (
        <div className="overflow-x-auto my-6">
          <table className="min-w-full divide-y divide-gray-200" {...props}>
            {children}
          </table>
        </div>
      )
    },
    
    thead: {
      component: ({ children, ...props }: any) => (
        <thead className="bg-gray-50" {...props}>
          {children}
        </thead>
      )
    },
    
    th: {
      component: ({ children, ...props }: any) => (
        <th 
          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          {...props}
        >
          {children}
        </th>
      )
    },
    
    td: {
      component: ({ children, ...props }: any) => (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" {...props}>
          {children}
        </td>
      )
    },
    
    // Enhanced links
    a: {
      component: ({ children, href, ...props }: any) => (
        <a 
          href={href}
          className="text-indigo-600 hover:text-indigo-800 underline"
          target={href?.startsWith('http') ? '_blank' : undefined}
          rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
          {...props}
        >
          {children}
        </a>
      )
    }
  }
};

// Preprocess markdown to handle math expressions, charts, and diagrams
export const preprocessMarkdown = (content: string): string => {
  console.log('Processing markdown content length:', content.length);
  
  // Replace chart code blocks with Chart components (handle different line endings)
  content = content.replace(/```chart\r?\n([\s\S]*?)\r?\n```/g, (match, chartData) => {
    try {
      // Validate JSON
      JSON.parse(chartData.trim());
      const encodedData = encodeURIComponent(chartData.trim());
      console.log('Generated Chart component with encoded data length:', encodedData.length);
      return `<Chart data="${encodedData}" />`;
    } catch (error) {
      return `<div class="p-4 bg-red-50 border border-red-200 rounded-lg"><p class="text-red-800 text-sm">Error parsing chart data: ${error.message}</p></div>`;
    }
  });
  
  // Replace mermaid code blocks with Mermaid components (handle different line endings)
  content = content.replace(/```mermaid\r?\n([\s\S]*?)\r?\n```/g, (match, diagramData) => {
    const encodedData = encodeURIComponent(diagramData.trim());
    console.log('Generated Mermaid component with encoded data length:', encodedData.length);
    return `<Mermaid chart="${encodedData}" />`;
  });
  
  // Replace block math $$...$$ with components
  content = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
    const mathContent = math.trim();
    return `<Math display={true}>${mathContent}</Math>`;
  });
  
  // Replace inline math $...$ with components (but not if it's part of $$)
  content = content.replace(/(?<!\$)\$([^$\n]+?)\$(?!\$)/g, (match, math) => {
    const mathContent = math.trim();
    return `<Math display={false}>${mathContent}</Math>`;
  });
  
  console.log('Final processed content length:', content.length);
  
  return content;
};
