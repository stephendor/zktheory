import React from 'react';
import DocumentationLayout from '../components/DocumentationLayout';
import { DocumentationSidebar } from '../components/DocumentationLayout';
import { 
  BookOpenIcon, 
  BeakerIcon, 
  AcademicCapIcon,
  CodeBracketIcon,
  PlayIcon,
  LightBulbIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const sidebarItems = [
  {
    label: 'Documentation',
    href: '/documentation',
    children: [
      { label: 'Getting Started', href: '/documentation/getting-started' },
      { label: 'Projects', href: '/documentation/projects' },
      { label: 'Concepts', href: '/documentation/concepts' },
      { label: 'Tutorials', href: '/documentation/tutorials' },
      { label: 'Examples', href: '/documentation/examples' }
    ]
  },
  {
    label: 'Getting Started',
    href: '/documentation/getting-started',
    children: [
      { label: 'Introduction', href: '/documentation/getting-started#introduction' },
      { label: 'First Steps', href: '/documentation/getting-started#first-steps' },
      { label: 'Basic Concepts', href: '/documentation/getting-started#basic-concepts' },
      { label: 'Your First Analysis', href: '/documentation/getting-started#first-analysis' },
      { label: 'Next Steps', href: '/documentation/getting-started#next-steps' }
    ]
  }
];

const basicConcepts = [
  {
    title: 'Topological Data Analysis (TDA)',
    description: 'A mathematical approach to understanding the shape and structure of data',
    explanation: 'TDA studies the "shape" of data by examining its topological properties - things like connectedness, holes, voids, and higher-dimensional features that persist across different scales.',
    analogy: 'Think of TDA as studying the "geography" of your data - finding mountains, valleys, and tunnels rather than just individual points.',
    examples: ['Finding clusters in high-dimensional data', 'Detecting holes in network structures', 'Understanding the shape of molecular conformations']
  },
  {
    title: 'Group Theory',
    description: 'The study of algebraic structures called groups',
    explanation: 'Groups are mathematical objects that capture the idea of symmetry and transformation. They provide a framework for understanding how objects can be transformed while preserving certain properties.',
    analogy: 'Think of group theory as studying the "rules of the game" - like how you can rotate a cube and it still looks the same, or how you can shuffle cards and still have a valid deck.',
    examples: ['Cryptography and security', 'Molecular symmetry', 'Crystal structures', 'Particle physics']
  },
  {
    title: 'Elliptic Curves',
    description: 'Special curves with applications in cryptography and number theory',
    explanation: 'Elliptic curves are smooth curves defined by cubic equations. They form groups under point addition, making them useful for cryptographic protocols and studying number theory problems.',
    analogy: 'Think of elliptic curves as "mathematical roller coasters" - they have special properties that make them perfect for secure communication and solving complex mathematical problems.',
    examples: ['Bitcoin and cryptocurrency', 'Secure web communication (HTTPS)', 'Digital signatures', 'Identity-based encryption']
  }
];

const firstAnalysisSteps = [
  {
    step: 1,
    title: 'Choose Your Tool',
    description: 'Select the appropriate mathematical tool for your analysis',
    details: 'Start with the TDA Explorer for data analysis, Cayley Graph Explorer for group theory, or Interactive Examples for learning concepts.',
    tip: 'If you\'re new to mathematics, start with the Interactive Examples to build intuition.'
  },
  {
    step: 2,
    title: 'Prepare Your Data',
    description: 'Ensure your data is in the correct format',
    details: 'For TDA analysis, prepare point cloud data in CSV or JSON format. For group theory, identify the group structure you want to explore.',
    tip: 'Start with small, simple datasets to understand the tools before moving to complex data.'
  },
  {
    step: 3,
    title: 'Set Parameters',
    description: 'Configure analysis parameters appropriately',
    details: 'Use default parameters initially, then adjust based on your data characteristics and analysis goals.',
    tip: 'Small changes in parameters can have significant effects on results - experiment systematically.'
  },
  {
    step: 4,
    title: 'Interpret Results',
    description: 'Understand what the visualizations and outputs mean',
    details: 'Learn to read persistence diagrams, understand group structures, and recognize patterns in your data.',
    tip: 'Don\'t worry if you don\'t understand everything immediately - mathematical intuition develops with practice.'
  }
];

const commonPitfalls = [
  {
    issue: 'Overwhelming Complexity',
    solution: 'Start with simple examples and gradually increase complexity. Use the interactive examples to build intuition.',
    prevention: 'Begin with 2D data and small datasets before moving to 3D or high-dimensional data.'
  },
  {
    issue: 'Parameter Confusion',
    solution: 'Use the default parameters first, then make small adjustments. Read the tool documentation for parameter explanations.',
    prevention: 'Keep a log of parameter changes and their effects on your results.'
  },
  {
    issue: 'Misinterpreting Results',
    solution: 'Compare your results with known examples. Use the mathematical concepts guide to understand what you\'re seeing.',
    prevention: 'Validate your understanding with simple, well-understood datasets first.'
  },
  {
    issue: 'Performance Issues',
    solution: 'Start with smaller datasets and gradually increase size. Use the performance optimization tips in the documentation.',
    prevention: 'Monitor computation time and memory usage as you scale up your analysis.'
  }
];

export default function GettingStartedPage() {
  return (
    <DocumentationLayout
      title="Getting Started"
      description="Welcome to zktheory! Learn the basics of mathematical tools and concepts to begin your journey."
      breadcrumbs={[
        { label: 'Documentation', href: '/documentation' },
        { label: 'Getting Started' }
      ]}
      sidebar={<DocumentationSidebar items={sidebarItems} />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <section id="introduction" className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
          <div className="flex items-center space-x-4 mb-4">
            <BookOpenIcon className="h-8 w-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-blue-900">Welcome to zktheory</h2>
          </div>
          <p className="text-blue-800 text-lg leading-relaxed mb-4">
            zktheory provides interactive mathematical tools and visualizations to help you explore 
            complex mathematical concepts, perform topological data analysis, and understand group theory. 
            Whether you're a student, researcher, or enthusiast, this guide will help you get started.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">🎯 Interactive Learning</h4>
              <p className="text-blue-700 text-sm">Learn by doing with hands-on examples and real-time visualizations</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">🔬 Research Tools</h4>
              <p className="text-blue-700 text-sm">Professional-grade tools for serious mathematical analysis</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">📚 Comprehensive Documentation</h4>
              <p className="text-blue-700 text-sm">Detailed guides, tutorials, and examples for every concept</p>
            </div>
          </div>
        </section>

        {/* First Steps */}
        <section id="first-steps" className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your First Steps</h2>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">🚀 Quick Start Path</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-medium text-green-800">Explore Interactive Examples</h4>
                  <p className="text-green-700 text-sm">Start with our interactive code examples to build mathematical intuition.</p>
                  <a href="/documentation/examples" className="text-green-600 hover:text-green-800 text-sm font-medium hover:underline">
                    → Go to Examples
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-medium text-green-800">Try the TDA Explorer</h4>
                  <p className="text-green-700 text-sm">Experiment with topological data analysis using sample data.</p>
                  <a href="/projects/tda-explorer" className="text-green-600 hover:text-green-800 text-sm font-medium hover:underline">
                    → Launch TDA Explorer
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-medium text-green-800">Read the Concepts Guide</h4>
                  <p className="text-green-700 text-sm">Deepen your understanding of the mathematical foundations.</p>
                  <a href="/documentation/concepts" className="text-green-600 hover:text-green-800 text-sm font-medium hover:underline">
                    → Read Concepts
                  </a>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <h4 className="font-medium text-green-800">Follow Tutorials</h4>
                  <p className="text-green-700 text-sm">Work through step-by-step tutorials for hands-on learning.</p>
                  <a href="/documentation/tutorials" className="text-green-600 hover:text-green-800 text-sm font-medium hover:underline">
                    → View Tutorials
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Basic Concepts */}
        <section id="basic-concepts" className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Basic Mathematical Concepts</h2>
          <p className="text-gray-600">
            Before diving into the tools, it's helpful to understand the fundamental concepts that power zktheory.
          </p>
          
          <div className="space-y-6">
            {basicConcepts.map((concept, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{concept.title}</h3>
                <p className="text-gray-600 mb-4">{concept.description}</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">What It Is</h4>
                    <p className="text-gray-700 text-sm">{concept.explanation}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Simple Analogy</h4>
                    <p className="text-gray-700 text-sm">{concept.analogy}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Real-World Applications</h4>
                  <div className="flex flex-wrap gap-2">
                    {concept.examples.map((example, exampleIndex) => (
                      <span 
                        key={exampleIndex}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Your First Analysis */}
        <section id="first-analysis" className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Your First Mathematical Analysis</h2>
          
          <div className="space-y-6">
            {firstAnalysisSteps.map((step) => (
              <div key={step.step} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 mb-3">{step.description}</p>
                    <p className="text-gray-700 mb-3">{step.details}</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <LightBulbIcon className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Pro Tip:</span>
                      </div>
                      <p className="text-blue-800 text-sm mt-1">{step.tip}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Common Pitfalls */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">
            <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
            Common Pitfalls and How to Avoid Them
          </h3>
          <div className="space-y-4">
            {commonPitfalls.map((pitfall, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-2">{pitfall.issue}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-yellow-800 mb-1">Solution:</h5>
                    <p className="text-yellow-700 text-sm">{pitfall.solution}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-yellow-800 mb-1">Prevention:</h5>
                    <p className="text-yellow-700 text-sm">{pitfall.prevention}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Next Steps */}
        <section id="next-steps" className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 border border-green-200">
          <h3 className="text-2xl font-bold text-green-900 mb-4">Ready for More?</h3>
          <p className="text-green-800 mb-6">
            Now that you understand the basics, explore more advanced topics and tools.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">For Beginners</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Work through interactive examples</li>
                <li>• Read the concepts guide</li>
                <li>• Try simple analyses with sample data</li>
                <li>• Follow step-by-step tutorials</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">For Advanced Users</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Explore advanced features</li>
                <li>• Customize algorithms and parameters</li>
                <li>• Integrate tools into your workflow</li>
                <li>• Contribute to the project</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/documentation/examples"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              Try Interactive Examples
            </a>
            <a
              href="/documentation/tutorials"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Follow Tutorials
            </a>
            <a
              href="/documentation/projects"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              Explore Projects
            </a>
          </div>
        </section>
      </div>
    </DocumentationLayout>
  );
}
