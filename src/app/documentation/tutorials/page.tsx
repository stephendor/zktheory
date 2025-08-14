import React from 'react';
import DocumentationLayout from '../components/DocumentationLayout';
import { DocumentationSidebar } from '../components/DocumentationLayout';
import { 
  AcademicCapIcon, 
  BeakerIcon, 
  ChartBarIcon,
  CodeBracketIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const tutorialCategories = [
  {
    title: 'Getting Started',
    description: 'Essential tutorials for new users',
    icon: AcademicCapIcon,
    color: 'bg-green-500',
    tutorials: [
      {
        title: 'First Steps with TDA Explorer',
        description: 'Learn the basics of topological data analysis through hands-on exploration',
        duration: '15-20 minutes',
        difficulty: 'Beginner',
        steps: [
          'Understanding the interface',
          'Loading your first dataset',
          'Generating persistence diagrams',
          'Interpreting results'
        ],
        href: '/documentation/tutorials/tda-explorer-basics'
      },
      {
        title: 'Introduction to Cayley Graphs',
        description: 'Visualize group theory concepts with interactive graphs',
        duration: '20-25 minutes',
        difficulty: 'Beginner',
        steps: [
          'What are Cayley graphs?',
          'Exploring group structures',
          'Customizing visualizations',
          'Analyzing subgroups'
        ],
        href: '/documentation/tutorials/cayley-graphs-intro'
      }
    ]
  },
  {
    title: 'Data Analysis Workflows',
    description: 'Complete workflows for real-world analysis',
    icon: BeakerIcon,
    color: 'bg-blue-500',
    tutorials: [
      {
        title: 'Point Cloud Analysis Pipeline',
        description: 'Complete workflow from raw data to topological insights',
        duration: '45-60 minutes',
        difficulty: 'Intermediate',
        steps: [
          'Data preprocessing and cleaning',
          'Parameter selection strategies',
          'Computing persistent homology',
          'Result interpretation and validation'
        ],
        href: '/documentation/tutorials/point-cloud-pipeline'
      },
      {
        title: 'Network Structure Analysis',
        description: 'Analyze complex networks using topological methods',
        duration: '30-40 minutes',
        difficulty: 'Intermediate',
        steps: [
          'Network representation',
          'Filter function selection',
          'Mapper construction',
          'Community detection'
        ],
        href: '/documentation/tutorials/network-analysis'
      }
    ]
  },
  {
    title: 'Advanced Techniques',
    description: 'Expert-level tutorials and optimizations',
    icon: ChartBarIcon,
    color: 'bg-purple-500',
    tutorials: [
      {
        title: 'Custom Filter Functions',
        description: 'Design and implement custom filter functions for specific applications',
        duration: '60-90 minutes',
        difficulty: 'Advanced',
        steps: [
          'Understanding filter functions',
          'Designing custom filters',
          'Implementation in JavaScript',
          'Testing and validation'
        ],
        href: '/documentation/tutorials/custom-filters'
      },
      {
        title: 'Performance Optimization',
        description: 'Optimize your analysis for large datasets and real-time applications',
        duration: '45-60 minutes',
        difficulty: 'Advanced',
        steps: [
          'Algorithm complexity analysis',
          'Memory management strategies',
          'Parallel processing techniques',
          'Benchmarking and profiling'
        ],
        href: '/documentation/tutorials/performance-optimization'
      }
    ]
  },
  {
    title: 'Integration & Deployment',
    description: 'Integrate tools into your own projects',
    icon: CodeBracketIcon,
    color: 'bg-yellow-500',
    tutorials: [
      {
        title: 'Embedding in Web Applications',
        description: 'Integrate zktheory tools into your own web applications',
        duration: '30-45 minutes',
        difficulty: 'Intermediate',
        steps: [
          'Component integration',
          'API usage patterns',
          'Custom styling and theming',
          'Event handling and callbacks'
        ],
        href: '/documentation/tutorials/web-integration'
      },
      {
        title: 'Building Custom Visualizations',
        description: 'Create custom visualization components using our framework',
        duration: '60-90 minutes',
        difficulty: 'Advanced',
        steps: [
          'Understanding the visualization framework',
          'Creating custom renderers',
          'Handling user interactions',
          'Performance considerations'
        ],
        href: '/documentation/tutorials/custom-visualizations'
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
    label: 'Tutorial Categories',
    href: '/documentation/tutorials',
    children: [
      { label: 'Getting Started', href: '/documentation/tutorials#getting-started' },
      { label: 'Data Analysis Workflows', href: '/documentation/tutorials#data-analysis-workflows' },
      { label: 'Advanced Techniques', href: '/documentation/tutorials#advanced-techniques' },
      { label: 'Integration & Deployment', href: '/documentation/tutorials#integration--deployment' }
    ]
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function TutorialsPage() {
  return (
    <DocumentationLayout
      title="Tutorials"
      description="Step-by-step guides and examples for using zktheory mathematical tools and concepts."
      breadcrumbs={[
        { label: 'Documentation', href: '/documentation' },
        { label: 'Tutorials' }
      ]}
      sidebar={<DocumentationSidebar items={sidebarItems} />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Learn by Doing</h2>
          <p className="text-blue-800 text-lg leading-relaxed">
            Master mathematical concepts and tools through hands-on tutorials. From beginner-friendly introductions 
            to advanced optimization techniques, these step-by-step guides will help you build practical skills.
          </p>
        </div>

        {/* Tutorial Categories */}
        {tutorialCategories.map((category, categoryIndex) => (
          <section key={categoryIndex} id={category.title.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}>
            <div className="flex items-center space-x-3 mb-6">
              <div className={`${category.color} p-3 rounded-lg`}>
                <category.icon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">{category.title}</h2>
            </div>
            
            <p className="text-gray-600 text-lg mb-8">{category.description}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {category.tutorials.map((tutorial, tutorialIndex) => (
                <div key={tutorialIndex} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{tutorial.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(tutorial.difficulty)}`}>
                      {tutorial.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{tutorial.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <PlayIcon className="h-4 w-4 mr-1" />
                    {tutorial.duration}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-gray-900 text-sm">What you'll learn:</h4>
                    {tutorial.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-center text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                        {step}
                      </div>
                    ))}
                  </div>
                  
                  <a
                    href={tutorial.href}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Start Tutorial
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Learning Path */}
        <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 border border-green-200">
          <h3 className="text-2xl font-bold text-green-900 mb-4">Recommended Learning Path</h3>
          <p className="text-green-800 mb-6">
            New to zktheory? Follow this recommended sequence to build your skills progressively.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div>
                <h4 className="font-semibold text-green-900">Start with Basics</h4>
                <p className="text-green-700 text-sm">Complete the "Getting Started" tutorials to understand fundamental concepts</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div>
                <h4 className="font-semibold text-blue-900">Practice with Workflows</h4>
                <p className="text-blue-700 text-sm">Work through data analysis workflows to apply concepts to real problems</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div>
                <h4 className="font-semibold text-purple-900">Master Advanced Techniques</h4>
                <p className="text-purple-700 text-sm">Learn advanced optimization and customization techniques</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <div>
                <h4 className="font-semibold text-yellow-900">Integrate and Deploy</h4>
                <p className="text-yellow-700 text-sm">Integrate tools into your own projects and applications</p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Learning Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/documentation/examples"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
            >
              → Interactive Code Examples
            </a>
            <a
              href="/documentation/concepts"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
            >
              → Mathematical Concepts Deep Dive
            </a>
            <a
              href="/documentation/api"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
            >
              → API Reference Documentation
            </a>
            <a
              href="/documentation/projects"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
            >
              → Project Documentation
            </a>
          </div>
        </section>
      </div>
    </DocumentationLayout>
  );
}
