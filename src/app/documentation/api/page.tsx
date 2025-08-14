import React from 'react';
import DocumentationLayout from '../components/DocumentationLayout';
import { DocumentationSidebar } from '../components/DocumentationLayout';
import { 
  CodeBracketIcon, 
  BeakerIcon, 
  ChartBarIcon,
  AcademicCapIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const apiCategories = [
  {
    title: 'Core Components',
    description: 'Main React components and their props',
    icon: CodeBracketIcon,
    color: 'bg-blue-500',
    apis: [
      {
        name: 'TDAExplorer',
        description: 'Main TDA Explorer component',
        props: [
          { name: 'data', type: 'PointCloudData', required: true, description: 'Input point cloud data' },
          { name: 'config', type: 'TDAConfig', required: false, description: 'Configuration options' },
          { name: 'onResult', type: 'function', required: false, description: 'Callback for computation results' }
        ],
        example: `import { TDAExplorer } from '@zktheory/tda-explorer';

<TDAExplorer 
  data={pointCloudData}
  config={{ epsilon: 0.5, maxDimension: 2 }}
  onResult={(result) => console.log(result)}
/>`
      },
      {
        name: 'CayleyGraphExplorer',
        description: 'Interactive Cayley graph visualization',
        props: [
          { name: 'group', type: 'Group', required: true, description: 'Group to visualize' },
          { name: 'generators', type: 'string[]', required: false, description: 'Group generators' },
          { name: 'layout', type: 'LayoutType', required: false, description: 'Graph layout algorithm' }
        ],
        example: `import { CayleyGraphExplorer } from '@zktheory/cayley-graph';

<CayleyGraphExplorer 
  group={cyclicGroup}
  generators={['a', 'b']}
  layout="force-directed"
/>`
      }
    ]
  },
  {
    title: 'Mathematical Functions',
    description: 'Core mathematical computation functions',
    icon: BeakerIcon,
    color: 'bg-green-500',
    apis: [
      {
        name: 'computePersistentHomology',
        description: 'Compute persistent homology of a point cloud',
        params: [
          { name: 'points', type: 'number[][]', required: true, description: 'Array of 2D/3D points' },
          { name: 'epsilon', type: 'number', required: true, description: 'Maximum distance parameter' },
          { name: 'maxDimension', type: 'number', required: false, description: 'Maximum homology dimension' }
        ],
        returns: 'PersistentHomologyResult',
        example: `import { computePersistentHomology } from '@zktheory/tda-core';

const result = computePersistentHomology(points, 0.5, 2);
console.log('Persistence diagram:', result.diagram);`
      },
      {
        name: 'constructMapper',
        description: 'Construct Mapper graph from point cloud',
        params: [
          { name: 'points', type: 'number[][]', required: true, description: 'Input point cloud' },
          { name: 'filter', type: 'FilterFunction', required: true, description: 'Filter function' },
          { name: 'numBins', type: 'number', required: false, description: 'Number of bins for partitioning' }
        ],
        returns: 'MapperGraph',
        example: `import { constructMapper } from '@zktheory/tda-core';

const mapper = constructMapper(points, distanceFilter, 10);
console.log('Mapper nodes:', mapper.nodes);`
      }
    ]
  },
  {
    title: 'Data Types',
    description: 'TypeScript interfaces and data structures',
    icon: DocumentTextIcon,
    color: 'bg-purple-500',
    apis: [
      {
        name: 'PointCloudData',
        description: 'Structure for point cloud data',
        properties: [
          { name: 'points', type: 'number[][]', description: 'Array of coordinate arrays' },
          { name: 'metadata', type: 'DataMetadata', description: 'Additional data information' },
          { name: 'labels', type: 'string[]', description: 'Optional point labels' }
        ],
        example: `interface PointCloudData {
  points: number[][];
  metadata: {
    dimension: number;
    source: string;
    timestamp: Date;
  };
  labels?: string[];
}`
      },
      {
        name: 'PersistentHomologyResult',
        description: 'Result of persistent homology computation',
        properties: [
          { name: 'diagram', type: 'PersistenceDiagram', description: 'Persistence diagram' },
          { name: 'bettiNumbers', type: 'number[]', description: 'Betti numbers for each dimension' },
          { name: 'computationTime', type: 'number', description: 'Time taken for computation' }
        ],
        example: `interface PersistentHomologyResult {
  diagram: PersistenceDiagram;
  bettiNumbers: number[];
  computationTime: number;
}`
      }
    ]
  },
  {
    title: 'Configuration Options',
    description: 'Configurable parameters and settings',
    icon: ChartBarIcon,
    color: 'bg-yellow-500',
    apis: [
      {
        name: 'TDAConfig',
        description: 'Configuration for TDA computations',
        properties: [
          { name: 'epsilon', type: 'number', description: 'Maximum distance parameter' },
          { name: 'maxDimension', type: 'number', description: 'Maximum homology dimension' },
          { name: 'algorithm', type: 'AlgorithmType', description: 'Computation algorithm' }
        ],
        example: `interface TDAConfig {
  epsilon: number;
  maxDimension: number;
  algorithm: 'rips' | 'alpha' | 'cech';
  parallel: boolean;
  cacheResults: boolean;
}`
      },
      {
        name: 'VisualizationConfig',
        description: 'Configuration for visualizations',
        properties: [
          { name: 'theme', type: 'Theme', description: 'Visual theme' },
          { name: 'interactive', type: 'boolean', description: 'Enable interactions' },
          { name: 'animations', type: 'boolean', description: 'Enable animations' }
        ],
        example: `interface VisualizationConfig {
  theme: 'light' | 'dark' | 'auto';
  interactive: boolean;
  animations: boolean;
  colorScheme: ColorScheme;
}`
      }
    ]
  }
];

const sidebarItems = [
  {
    label: 'Documentation',
    href: '/documentation',
    children: [
      { label: 'Getting Started', href: '/documentation/getting-started' },
      { label: 'Projects', href: '/documentation/projects' },
      { label: 'Concepts', href: '/documentation/concepts' },
      { label: 'Tutorials', href: '/documentation/tutorials' },
      { label: 'API Reference', href: '/documentation/api' }
    ]
  },
  {
    label: 'API Categories',
    href: '/documentation/api',
    children: [
      { label: 'Core Components', href: '/documentation/api#core-components' },
      { label: 'Mathematical Functions', href: '/documentation/api#mathematical-functions' },
      { label: 'Data Types', href: '/documentation/api#data-types' },
      { label: 'Configuration Options', href: '/documentation/api#configuration-options' }
    ]
  }
];

export default function APIPage() {
  return (
    <DocumentationLayout
      title="API Reference"
      description="Complete API documentation for zktheory mathematical tools, components, and functions."
      breadcrumbs={[
        { label: 'Documentation', href: '/documentation' },
        { label: 'API Reference' }
      ]}
      sidebar={<DocumentationSidebar items={sidebarItems} />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-8 border border-indigo-200">
          <h2 className="text-3xl font-bold text-indigo-900 mb-4">API Reference</h2>
          <p className="text-indigo-800 text-lg leading-relaxed">
            Comprehensive documentation for all zktheory APIs, components, and data structures. 
            Use this reference to integrate our mathematical tools into your own applications.
          </p>
        </div>

        {/* API Categories */}
        {apiCategories.map((category, categoryIndex) => (
          <section key={categoryIndex} id={category.title.toLowerCase().replace(/\s+/g, '-')}>
            <div className="flex items-center space-x-3 mb-6">
              <div className={`${category.color} p-3 rounded-lg`}>
                <category.icon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">{category.title}</h2>
            </div>
            
            <p className="text-gray-600 text-lg mb-8">{category.description}</p>
            
            <div className="space-y-8">
              {category.apis.map((api, apiIndex) => (
                <div key={apiIndex} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{api.name}</h3>
                  <p className="text-gray-600 mb-4">{api.description}</p>
                  
                  {/* Props/Parameters */}
                  {api.props && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Props/Parameters</h4>
                      <div className="space-y-2">
                        {api.props.map((prop, propIndex) => (
                          <div key={propIndex} className="flex items-start space-x-3 text-sm">
                            <code className="bg-gray-100 px-2 py-1 rounded font-mono text-blue-600">
                              {prop.name}
                            </code>
                            <span className="text-gray-500">:</span>
                            <code className="bg-gray-100 px-2 py-1 rounded font-mono text-green-600">
                              {prop.type}
                            </code>
                            {prop.required && (
                              <span className="text-red-600 text-xs font-medium">required</span>
                            )}
                            <span className="text-gray-600 flex-1">- {prop.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Properties */}
                  {api.properties && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Properties</h4>
                      <div className="space-y-2">
                        {api.properties.map((prop, propIndex) => (
                          <div key={propIndex} className="flex items-start space-x-3 text-sm">
                            <code className="bg-gray-100 px-2 py-1 rounded font-mono text-blue-600">
                              {prop.name}
                            </code>
                            <span className="text-gray-500">:</span>
                            <code className="bg-gray-100 px-2 py-1 rounded font-mono text-green-600">
                              {prop.type}
                            </code>
                            <span className="text-gray-600 flex-1">- {prop.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Returns */}
                  {api.returns && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Returns</h4>
                      <code className="bg-gray-100 px-2 py-1 rounded font-mono text-green-600">
                        {api.returns}
                      </code>
                    </div>
                  )}
                  
                  {/* Example */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Example</h4>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{api.example}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Usage Guidelines */}
        <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 border border-green-200">
          <h3 className="text-2xl font-bold text-green-900 mb-4">Usage Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Best Practices</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Always handle errors in async operations</li>
                <li>• Use TypeScript for better type safety</li>
                <li>• Implement proper cleanup in React components</li>
                <li>• Cache results for expensive computations</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Performance Tips</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Use Web Workers for heavy computations</li>
                <li>• Implement virtual scrolling for large datasets</li>
                <li>• Debounce user input for real-time updates</li>
                <li>• Use appropriate data structures</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Ready to Build?</h3>
          <p className="text-yellow-800 mb-4">
            Now that you understand the API, explore our tutorials and examples to see these concepts in action.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/documentation/tutorials"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              View Tutorials
            </a>
            <a
              href="/documentation/examples"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Interactive Examples
            </a>
          </div>
        </section>
      </div>
    </DocumentationLayout>
  );
}
