import React from 'react';
import DocumentationLayout from '../../components/DocumentationLayout';
import { DocumentationSidebar } from '../../components/DocumentationLayout';
import { 
  BeakerIcon, 
  ChartBarIcon, 
  CogIcon,
  AcademicCapIcon,
  CodeBracketIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const sidebarItems = [
  {
    label: 'Documentation',
    href: '/documentation',
    children: [
      { label: 'Projects', href: '/documentation/projects' },
      { label: 'TDA Explorer', href: '/documentation/projects/tda-explorer' }
    ]
  },
  {
    label: 'TDA Explorer',
    href: '/documentation/projects/tda-explorer',
    children: [
      { label: 'Overview', href: '/documentation/projects/tda-explorer#overview' },
      { label: 'Getting Started', href: '/documentation/projects/tda-explorer#getting-started' },
      { label: 'Core Concepts', href: '/documentation/projects/tda-explorer#core-concepts' },
      { label: 'User Interface', href: '/documentation/projects/tda-explorer#user-interface' },
      { label: 'Advanced Features', href: '/documentation/projects/tda-explorer#advanced-features' },
      { label: 'API Reference', href: '/documentation/projects/tda-explorer#api-reference' },
      { label: 'Examples', href: '/documentation/projects/tda-explorer#examples' },
      { label: 'Troubleshooting', href: '/documentation/projects/tda-explorer#troubleshooting' }
    ]
  }
];

const coreConcepts = [
  {
    title: 'Persistent Homology',
    description: 'A method for computing topological features of a space at different spatial resolutions',
    details: `Persistent homology tracks how topological features (like holes, voids, and connected components) 
    appear and disappear as we vary a parameter, typically the radius of balls around data points. 
    This provides a multi-scale view of the data's topological structure.`,
    mathematicalBackground: 'Based on the theory of persistent modules and barcodes in algebraic topology.',
    applications: ['Point cloud analysis', 'Network structure', 'Time series data', 'Image analysis']
  },
  {
    title: 'Persistence Diagrams',
    description: 'Visual representation of persistent homology features',
    details: `A persistence diagram plots the birth and death times of topological features, where each point 
    represents a feature that appears at birth time and disappears at death time. The distance from the diagonal 
    indicates the persistence (stability) of the feature.`,
    mathematicalBackground: 'Represents the persistence module as a multiset of points in the plane.',
    applications: ['Feature stability analysis', 'Data comparison', 'Parameter selection', 'Statistical inference']
  },
  {
    title: 'Mapper Algorithm',
    description: 'A method for constructing a simplicial complex from a point cloud',
    details: `The Mapper algorithm uses a filter function to partition data into overlapping bins, then constructs 
    a simplicial complex based on the connectivity of these bins. This provides a simplified representation 
    that preserves important topological and geometric features.`,
    mathematicalBackground: 'Based on the Nerve Theorem and filter functions in algebraic topology.',
    applications: ['Data clustering', 'Feature extraction', 'Dimensionality reduction', 'Pattern recognition']
  }
];

const interfaceComponents = [
  {
    title: 'Point Cloud Input',
    description: 'Upload and visualize your data',
    features: ['File upload (CSV, JSON)', 'Real-time preview', 'Data validation', 'Coordinate system selection'],
    tips: 'Ensure your data is properly formatted with consistent dimensions and coordinate systems.'
  },
  {
    title: 'Parameter Controls',
    description: 'Adjust computation parameters',
    features: ['Epsilon slider', 'Maximum dimension', 'Algorithm selection', 'Filter function options'],
    tips: 'Start with default parameters and adjust based on your data characteristics and analysis goals.'
  },
  {
    title: 'Visualization Panels',
    description: 'Interactive result displays',
    features: ['Persistence diagram', 'Mapper network', 'Point cloud view', 'Statistics panel'],
    tips: 'Use zoom and pan controls to explore details, and hover over elements for additional information.'
  }
];

const advancedFeatures = [
  {
    title: 'Custom Filter Functions',
    description: 'Implement your own filter functions for specialized analysis',
    codeExample: `function customFilter(point, data) {
  // Example: distance from centroid
  const centroid = calculateCentroid(data);
  return euclideanDistance(point, centroid);
}`,
    useCases: ['Domain-specific analysis', 'Custom clustering', 'Feature engineering']
  },
  {
    title: 'Batch Processing',
    description: 'Process multiple datasets efficiently',
    codeExample: `const results = await Promise.all(
  datasets.map(dataset => 
    computePersistentHomology(dataset, config)
  )
);`,
    useCases: ['Parameter optimization', 'Dataset comparison', 'Reproducible research']
  },
  {
    title: 'Export and Integration',
    description: 'Export results for further analysis',
    codeExample: `// Export persistence diagram
const diagramData = exportPersistenceDiagram();
downloadJSON(diagramData, 'persistence_diagram.json');`,
    useCases: ['Publication figures', 'Further analysis', 'Integration with other tools']
  }
];

export default function TDAExplorerPage() {
  return (
    <DocumentationLayout
      title="TDA Explorer"
      description="Comprehensive guide to using the Topological Data Analysis Explorer for exploring persistent homology and topological features in data."
      breadcrumbs={[
        { label: 'Documentation', href: '/documentation' },
        { label: 'Projects', href: '/documentation/projects' },
        { label: 'TDA Explorer' }
      ]}
      sidebar={<DocumentationSidebar items={sidebarItems} />}
    >
      <div className="space-y-8">
        {/* Overview */}
        <section id="overview" className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
          <div className="flex items-center space-x-4 mb-4">
            <BeakerIcon className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-blue-900">TDA Explorer Overview</h2>
          </div>
          <p className="text-blue-800 text-lg leading-relaxed mb-4">
            The TDA Explorer is an interactive web application for performing topological data analysis on 
            point cloud data. It provides intuitive tools for computing persistent homology, generating 
            persistence diagrams, and constructing Mapper networks.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Real-time Analysis</h4>
              <p className="text-blue-700 text-sm">Interactive parameter adjustment with immediate visual feedback</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Multiple Algorithms</h4>
              <p className="text-blue-700 text-sm">Support for Rips, Alpha, and Čech complex computations</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Export Capabilities</h4>
              <p className="text-blue-700 text-sm">Save results in multiple formats for further analysis</p>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section id="getting-started" className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">Quick Start Guide</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-medium text-green-800">Prepare Your Data</h4>
                  <p className="text-green-700 text-sm">Ensure your point cloud data is in CSV or JSON format with consistent dimensions.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-medium text-green-800">Upload and Explore</h4>
                  <p className="text-green-700 text-sm">Upload your data and use the interactive controls to explore the visualization.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-medium text-green-800">Adjust Parameters</h4>
                  <p className="text-green-700 text-sm">Use the parameter controls to optimize your analysis and explore different scales.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <h4 className="font-medium text-green-800">Analyze Results</h4>
                  <p className="text-green-700 text-sm">Interpret the persistence diagram and Mapper network to understand your data's structure.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Concepts */}
        <section id="core-concepts" className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Core Concepts</h2>
          
          <div className="space-y-6">
            {coreConcepts.map((concept, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{concept.title}</h3>
                <p className="text-gray-600 mb-4">{concept.description}</p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Detailed Explanation</h4>
                  <p className="text-gray-700">{concept.details}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Mathematical Background</h4>
                    <p className="text-gray-700 text-sm">{concept.mathematicalBackground}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Applications</h4>
                    <ul className="text-gray-700 text-sm space-y-1">
                      {concept.applications.map((app, appIndex) => (
                        <li key={appIndex} className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                          {app}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* User Interface */}
        <section id="user-interface" className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">User Interface Guide</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {interfaceComponents.map((component, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{component.title}</h3>
                <p className="text-gray-600 mb-4">{component.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                  <ul className="space-y-1">
                    {component.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-medium text-blue-900 mb-1">💡 Tip</h4>
                  <p className="text-blue-800 text-sm">{component.tips}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Advanced Features */}
        <section id="advanced-features" className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Advanced Features</h2>
          
          <div className="space-y-6">
            {advancedFeatures.map((feature, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Code Example</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{feature.codeExample}</code>
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Use Cases</h4>
                  <div className="flex flex-wrap gap-2">
                    {feature.useCases.map((useCase, useCaseIndex) => (
                      <span 
                        key={useCaseIndex}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                      >
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Examples */}
        <section id="examples" className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Examples and Use Cases</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Point Cloud Analysis</h3>
              <p className="text-gray-600 mb-4">Analyze the topological structure of 3D point clouds from various sources.</p>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• <strong>3D Scans:</strong> Analyze architectural or archaeological scans</div>
                <div>• <strong>Molecular Data:</strong> Study protein structures and conformations</div>
                <div>• <strong>Geographic Data:</strong> Explore terrain and elevation patterns</div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Network Analysis</h3>
              <p className="text-gray-600 mb-4">Apply topological methods to network and graph data structures.</p>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• <strong>Social Networks:</strong> Identify community structures</div>
                <div>• <strong>Biological Networks:</strong> Analyze protein interaction networks</div>
                <div>• <strong>Infrastructure Networks:</strong> Study transportation or power grids</div>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 border border-green-200">
          <h3 className="text-2xl font-bold text-green-900 mb-4">Ready to Explore?</h3>
          <p className="text-green-800 mb-6">
            Now that you understand the TDA Explorer, try it out with your own data or explore our examples.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/projects/tda-explorer"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              Launch TDA Explorer
            </a>
            <a
              href="/documentation/examples"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Examples
            </a>
            <a
              href="/documentation/tutorials"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              Read Tutorials
            </a>
          </div>
        </section>
      </div>
    </DocumentationLayout>
  );
}
