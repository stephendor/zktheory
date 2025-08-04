import React from 'react';

interface StaticNotebookViewerProps {
  htmlPath: string;
  title?: string;
  height?: string;
  className?: string;
}

export const StaticNotebookViewer: React.FC<StaticNotebookViewerProps> = ({
  htmlPath,
  title = "Jupyter Notebook",
  height = "800px",
  className = ""
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-blue-100 text-sm">Static view of Jupyter notebook</p>
      </div>

      {/* Interactive Warning */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>💡 Recommended:</strong> Try our <a href="/projects/cayleygraph" className="underline hover:text-yellow-900 font-semibold">enhanced web-based explorer</a> instead! 
              No installation needed and works better for learning. Advanced users can also <a href="/InteractiveCayley.ipynb" className="underline hover:text-yellow-900 ml-1" download>
                download the notebook
              </a> for local usage.
            </p>
          </div>
        </div>
      </div>

      {/* Embedded HTML */}
      <div className="relative" style={{ height }}>
        <iframe
          src={htmlPath}
          width="100%"
          height="100%"
          frameBorder="0"
          className="border-0"
          title={title}
          sandbox="allow-same-origin allow-scripts"
        />
      </div>

      {/* Download Links */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">
            <strong>📥 Get the Full Experience:</strong>
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

export default StaticNotebookViewer;
