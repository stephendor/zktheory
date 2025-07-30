#!/usr/bin/env node

/**
 * Convert Jupyter notebook to HTML for embedding in Next.js pages
 * Usage: node scripts/convert-notebook.js <notebook-path> [output-path]
 */

const fs = require('fs');
const path = require('path');

function convertNotebookToHTML(notebookPath, outputPath) {
    try {
        // Read the notebook file
        const notebook = JSON.parse(fs.readFileSync(notebookPath, 'utf8'));

        // Extract metadata
        const title = notebook.metadata?.title || 'Jupyter Notebook';
        const kernelName = notebook.metadata?.kernelspec?.display_name || 'Unknown';

        // Build HTML content
        let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .notebook-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .notebook-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .notebook-title {
            font-size: 2rem;
            margin: 0 0 10px 0;
            font-weight: 600;
        }
        .kernel-info {
            opacity: 0.9;
            font-size: 0.9rem;
        }
        .cell {
            border-bottom: 1px solid #e9ecef;
            padding: 20px;
        }
        .cell:last-child {
            border-bottom: none;
        }
        .cell-type {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        .cell-type.code {
            background-color: #e3f2fd;
            color: #1976d2;
        }
        .cell-type.markdown {
            background-color: #f3e5f5;
            color: #7b1fa2;
        }
        .cell-content {
            margin: 0;
        }
        .code-input {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
            font-size: 0.9rem;
            overflow-x: auto;
            white-space: pre-wrap;
            line-height: 1.4;
        }
        .code-output {
            background-color: #ffffff;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 15px;
            margin-top: 10px;
            font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
            font-size: 0.9rem;
        }
        .markdown-content h1, .markdown-content h2, .markdown-content h3 {
            color: #343a40;
            margin-top: 0;
        }
        .markdown-content p {
            margin-bottom: 1rem;
        }
        .markdown-content code {
            background-color: #f8f9fa;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
        }
        .markdown-content pre {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            overflow-x: auto;
        }
        .execution-count {
            color: #6c757d;
            font-size: 0.8rem;
            margin-bottom: 5px;
        }
        .interactive-warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        .download-links {
            background-color: #e9ecef;
            padding: 15px;
            text-align: center;
            border-top: 1px solid #dee2e6;
        }
        .download-links a {
            display: inline-block;
            margin: 0 10px;
            padding: 8px 16px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 0.9rem;
        }
        .download-links a:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="notebook-container">
        <div class="notebook-header">
            <h1 class="notebook-title">${title}</h1>
            <div class="kernel-info">Kernel: ${kernelName}</div>
        </div>
        
        <div class="interactive-warning">
            <strong>📝 Note:</strong> This is a static view of the Jupyter notebook. 
            For full interactivity, <a href="#download-section">download and run the notebook locally</a> 
            with SageMath or use the <a href="/projects/cayleygraph">web-based interactive tool</a>.
        </div>
`;

        // Process cells
        if (notebook.cells && Array.isArray(notebook.cells)) {
            notebook.cells.forEach((cell, index) => {
                html += `\n        <div class="cell">`;
                html += `\n            <div class="cell-type ${cell.cell_type}">${cell.cell_type}</div>`;

                if (cell.cell_type === 'code') {
                    // Handle code cells
                    if (cell.execution_count) {
                        html += `\n            <div class="execution-count">In [${cell.execution_count}]:</div>`;
                    }

                    const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
                    html += `\n            <pre class="code-input">${escapeHtml(source)}</pre>`;

                    // Handle outputs
                    if (cell.outputs && cell.outputs.length > 0) {
                        cell.outputs.forEach((output) => {
                            if (output.output_type === 'stream') {
                                const text = Array.isArray(output.text) ? output.text.join('') : output.text;
                                html += `\n            <pre class="code-output">${escapeHtml(text)}</pre>`;
                            } else if (output.output_type === 'execute_result' || output.output_type === 'display_data') {
                                if (output.data) {
                                    // Handle text output
                                    if (output.data['text/plain']) {
                                        const text = Array.isArray(output.data['text/plain']) ? output.data['text/plain'].join('') : output.data['text/plain'];
                                        html += `\n            <pre class="code-output">${escapeHtml(text)}</pre>`;
                                    }
                                    // Handle HTML output
                                    if (output.data['text/html']) {
                                        const htmlContent = Array.isArray(output.data['text/html'])
                                            ? output.data['text/html'].join('')
                                            : output.data['text/html'];
                                        html += `\n            <div class="code-output">${htmlContent}</div>`;
                                    }
                                    // Handle image output
                                    if (output.data['image/png']) {
                                        html += `\n            <div class="code-output"><img src="data:image/png;base64,${output.data['image/png']}" alt="Output ${index}" style="max-width: 100%; height: auto;"></div>`;
                                    }
                                }
                            } else if (output.output_type === 'error') {
                                const errorText = output.traceback ? output.traceback.join('\n') : `${output.ename}: ${output.evalue}`;
                                html += `\n            <pre class="code-output" style="color: #dc3545; background-color: #f8d7da;">${escapeHtml(errorText)}</pre>`;
                            }
                        });
                    }
                } else if (cell.cell_type === 'markdown') {
                    // Handle markdown cells
                    const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
                    html += `\n            <div class="markdown-content">${convertMarkdownToHTML(source)}</div>`;
                }

                html += `\n        </div>`;
            });
        }

        // Add download section
        html += `
        <div class="download-links" id="download-section">
            <strong>📥 Download Options:</strong><br><br>
            <a href="/InteractiveCayley.ipynb" download>Download Notebook (.ipynb)</a>
            <a href="/setup_cayley_explorer.sh" download>Download Setup Script</a>
            <a href="https://github.com/stephendor/zktheory" target="_blank">View Source Code</a>
        </div>
    </div>
</body>
</html>`;

        // Write output
        fs.writeFileSync(outputPath, html);
        console.log(`✅ Successfully converted notebook to HTML: ${outputPath}`);
    } catch (error) {
        console.error('❌ Error converting notebook:', error.message);
        process.exit(1);
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

function convertMarkdownToHTML(markdown) {
    // Simple markdown to HTML conversion
    // For production, you might want to use a proper markdown parser
    return markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/^\*(.*)\*/gim, '<em>$1</em>')
        .replace(/^```(.*?)```$/gims, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?!<[h|p|u|o|l|d])/gim, '<p>')
        .replace(/(?![h|p|u|o|l|d]>)$/gim, '</p>');
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.log('Usage: node scripts/convert-notebook.js <notebook-path> [output-path]');
        process.exit(1);
    }

    const notebookPath = args[0];
    const outputPath = args[1] || notebookPath.replace('.ipynb', '.html');

    if (!fs.existsSync(notebookPath)) {
        console.error(`❌ Notebook file not found: ${notebookPath}`);
        process.exit(1);
    }

    convertNotebookToHTML(notebookPath, outputPath);
}

module.exports = { convertNotebookToHTML };
