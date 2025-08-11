'use client';

import React, { useState, useEffect } from 'react';

interface NotebookEmbedProps {
  notebookPath: string;
  title?: string;
  height?: string;
  showDownloadLinks?: boolean;
  className?: string;
}

interface NotebookViewerProps {
  notebookData: any;
  className?: string;
}

// Component to display a static version of the notebook
export const NotebookViewer: React.FC<NotebookViewerProps> = ({ 
  notebookData, 
  className = '' 
}) => {
  if (!notebookData || !notebookData.cells) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-red-700">Error: Invalid notebook data</p>
      </div>
    );
  }

  const kernelName = notebookData.metadata?.kernelspec?.display_name || 'Unknown';
  const title = notebookData.metadata?.title || 'Jupyter Notebook';

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-blue-100">Kernel: {kernelName}</p>
      </div>

      {/* Interactive Warning */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>📝 Note:</strong> This is a static view of the Jupyter notebook. 
              For the best experience, use our <a href="/projects/cayleygraph" className="underline hover:text-yellow-900 font-semibold">web-based interactive tool</a> which requires no setup.
              Advanced users can also download and run this notebook locally with SageMath.
            </p>
          </div>
        </div>
      </div>

      {/* Cells */}
      <div className="divide-y divide-gray-200">
        {notebookData.cells.map((cell: any, index: number) => (
          <NotebookCell key={index} cell={cell} index={index} />
        ))}
      </div>

      {/* Download Links */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">
            <strong>📥 Download Options:</strong>
          </p>
          <div className="space-x-4">
            <a
              href="/InteractiveCayley.ipynb"
              download
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Download Notebook (.ipynb)
            </a>
            <a
              href="/setup_cayley_explorer.sh"
              download
              className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Setup Script
            </a>
            <a
              href="https://github.com/stephendor/zktheory"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Source Code
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component to display individual notebook cells
const NotebookCell: React.FC<{ cell: any; index: number }> = ({ cell, index }) => {
  const renderCellContent = () => {
    if (cell.cell_type === 'code') {
      const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
      
      return (
        <div>
          {/* Execution count */}
          {cell.execution_count && (
            <div className="text-sm text-gray-500 mb-2">
              In [{cell.execution_count}]:
            </div>
          )}
          
          {/* Code input */}
          <pre className="bg-gray-50 border border-gray-200 rounded-md p-4 overflow-x-auto text-sm font-mono">
            <code>{source}</code>
          </pre>
          
          {/* Code output */}
          {cell.outputs && cell.outputs.length > 0 && (
            <div className="mt-3">
              {cell.outputs.map((output: any, outputIndex: number) => (
                <div key={outputIndex} className="mb-2">
                  {output.output_type === 'stream' && (
                    <pre className="bg-white border border-gray-200 rounded-md p-4 text-sm font-mono">
                      {Array.isArray(output.text) ? output.text.join('') : output.text}
                    </pre>
                  )}
                  
                  {(output.output_type === 'execute_result' || output.output_type === 'display_data') && output.data && (
                    <div>
                      {output.data['text/plain'] && (
                        <pre className="bg-white border border-gray-200 rounded-md p-4 text-sm font-mono">
                          {Array.isArray(output.data['text/plain']) 
                            ? output.data['text/plain'].join('') 
                            : output.data['text/plain']}
                        </pre>
                      )}
                      
                      {output.data['text/html'] && (
                        <div 
                          className="bg-white border border-gray-200 rounded-md p-4"
                          dangerouslySetInnerHTML={{ 
                            __html: Array.isArray(output.data['text/html']) 
                              ? output.data['text/html'].join('') 
                              : output.data['text/html'] 
                          }} 
                        />
                      )}
                      
                      {output.data['image/png'] && (
                        <div className="bg-white border border-gray-200 rounded-md p-4">
                          <img 
                            src={`data:image/png;base64,${output.data['image/png']}`} 
                            alt={`Output ${outputIndex}`}
                            className="max-w-full h-auto"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {output.output_type === 'error' && (
                    <pre className="bg-red-50 border border-red-200 rounded-md p-4 text-sm font-mono text-red-700">
                      {output.traceback 
                        ? output.traceback.join('\n') 
                        : `${output.ename}: ${output.evalue}`}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (cell.cell_type === 'markdown') {
      const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
      
      return (
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(source) }}
        />
      );
    }
    
    return null;
  };

  return (
    <div className="p-6">
      {/* Cell type indicator */}
      <div className="flex items-center mb-4">
        <span className={`
          inline-block px-2 py-1 text-xs font-semibold rounded uppercase tracking-wide
          ${cell.cell_type === 'code' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-purple-100 text-purple-800'}
        `}>
          {cell.cell_type}
        </span>
      </div>
      
      {/* Cell content */}
      <div>
        {renderCellContent()}
      </div>
    </div>
  );
};

// Simple markdown to HTML converter
function convertMarkdownToHTML(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```(.*?)```/gs, '<pre class="bg-gray-50 border rounded p-3 my-3 overflow-x-auto"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(?!<)/gm, '<p class="mb-4">')
    .replace(/(?<!>)$/gm, '</p>');
}

// Main embed component that can load notebooks from different sources
export const NotebookEmbed: React.FC<NotebookEmbedProps> = ({ 
  notebookPath, 
  title,
  height = '600px',
  showDownloadLinks = true,
  className = '' 
}) => {
  const [notebookData, setNotebookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNotebook = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch the notebook data
        const response = await fetch(notebookPath);
        if (!response.ok) {
          throw new Error(`Failed to load notebook: ${response.statusText}`);
        }
        
        const data = await response.json();
        setNotebookData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notebook');
      } finally {
        setLoading(false);
      }
    };

    loadNotebook();
  }, [notebookPath]);

  if (loading) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading notebook...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-red-700">Error loading notebook: {error}</p>
        <div className="mt-4">
          <a 
            href={notebookPath}
            className="text-blue-600 hover:text-blue-800 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            View raw notebook file
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <NotebookViewer notebookData={notebookData} />
    </div>
  );
};

export default NotebookEmbed;
