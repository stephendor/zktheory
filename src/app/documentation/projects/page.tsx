import React from 'react';
import Link from 'next/link';
import DocumentationLayout from '../components/DocumentationLayout';
import { DocumentationSidebar } from '../components/DocumentationLayout';
import { 
  BeakerIcon, 
  ChartBarIcon, 
  CodeBracketIcon, 
  AcademicCapIcon,
  DocumentTextIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const projectCategories = [
  {
    title: 'Mathematical Tools',
    description: 'Interactive tools and visualizations for mathematical concepts',
    icon: BeakerIcon,
    color: 'bg-green-500',
    projects: [
      {
        title: 'TDA Explorer',
        description: 'Interactive exploration of persistent homology and topological features',
        href: '/documentation/projects/tda-explorer',
        status: 'active',
        features: ['Point cloud generation', 'Persistence diagrams', 'Mapper networks', 'Real-time computation']
      },
      {
        title: 'Cayley Graph Explorer',
        description: 'Interactive visualization of group theory concepts',
        href: '/documentation/projects/cayleygraph',
        status: 'active',
        features: ['Group database', 'Interactive graphs', 'Educational features', 'Advanced layouts']
      },
      {
        title: 'Interactive Notebooks',
        description: 'Jupyter-style notebooks for mathematical exploration',
        href: '/documentation/projects/notebooks',
        status: 'active',
        features: ['Code execution', 'Mathematical rendering', 'Export capabilities', 'Collaborative features']
      }
    ]
  },
  {
    title: 'Research Demonstrations',
    description: 'Reproducible research results and performance benchmarks',
    icon: ChartBarIcon,
    color: 'bg-purple-500',
    projects: [
      {
        title: 'APT Detection',
        description: 'Advanced Persistent Threat detection using topological methods',
        href: '/documentation/projects/apt-detection',
        status: 'research',
        features: ['Threat detection algorithms', 'Parameter tuning', 'Performance metrics', 'Dataset analysis']
      },
      {
        title: 'Bubble Detection',
        description: 'Financial bubble detection using statistical methods',
        href: '/documentation/projects/bubble-detection',
        status: 'research',
        features: ['Market analysis', 'Statistical models', 'Real-time detection', 'Risk assessment']
      }
    ]
  },
  {
    title: 'Educational Resources',
    description: 'Learning materials and tutorials for mathematical concepts',
    icon: AcademicCapIcon,
    color: 'bg-blue-500',
    projects: [
      {
        title: 'Mathematical Concepts',
        description: 'Deep dives into mathematical theory and applications',
        href: '/documentation/concepts',
        status: 'active',
        features: ['Theory explanations', 'Practical examples', 'Interactive diagrams', 'Problem sets']
      },
      {
        title: 'Tutorials',
        description: 'Step-by-step guides for using mathematical tools',
        href: '/documentation/tutorials',
        status: 'active',
        features: ['Beginner guides', 'Advanced techniques', 'Video content', 'Practice exercises']
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
    label: 'Mathematical Tools',
    href: '/documentation/tools',
    children: [
      { label: 'TDA Explorer', href: '/documentation/projects/tda-explorer' },
      { label: 'Cayley Graph Explorer', href: '/documentation/projects/cayleygraph' },
      { label: 'Interactive Notebooks', href: '/documentation/projects/notebooks' }
    ]
  }
];

export default function ProjectsDocsPage() {
  return (
    <DocumentationLayout
      title="Project Documentation"
      description="Comprehensive documentation for all zktheory mathematical tools, research demonstrations, and educational resources."
      breadcrumbs={[
        { label: 'Documentation', href: '/documentation' },
        { label: 'Projects' }
      ]}
      sidebar={<DocumentationSidebar items={sidebarItems} />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Explore zktheory Projects
          </h2>
          <p className="text-blue-800 leading-relaxed">
            Discover our collection of interactive mathematical tools, research demonstrations, and educational resources. 
            Each project is designed to make complex mathematical concepts accessible and engaging through modern web technologies.
          </p>
        </div>

        {/* Project Categories */}
        {projectCategories.map((category, categoryIndex) => (
          <section key={categoryIndex} className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className={`${category.color} p-2 rounded-lg`}>
                <category.icon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
            </div>
            
            <p className="text-gray-600 text-lg">{category.description}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {category.projects.map((project, projectIndex) => (
                <div key={projectIndex} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {project.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {project.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    href={project.href}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    View Documentation
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Quick Access */}
        <section className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/projects/tda-explorer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
            >
              → Launch TDA Explorer
            </Link>
            <Link
              href="/projects/cayleygraph"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
            >
              → Launch Cayley Graph Explorer
            </Link>
            <Link
              href="/projects/cayley-notebook"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
            >
              → View Jupyter Notebook
            </Link>
            <Link
              href="/documentation/getting-started"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
            >
              → Getting Started Guide
            </Link>
          </div>
        </section>

        {/* Contributing */}
        <section className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Want to Contribute?</h3>
          <p className="text-yellow-800 text-sm mb-3">
            We welcome contributions to improve our mathematical tools and documentation. 
            Whether you're a mathematician, developer, or educator, there are many ways to help.
          </p>
          <div className="space-y-2 text-sm text-yellow-800">
            <div>• <strong>Report bugs</strong> or suggest improvements</div>
            <div>• <strong>Add new features</strong> to existing tools</div>
            <div>• <strong>Improve documentation</strong> and tutorials</div>
            <div>• <strong>Create new mathematical visualizations</strong></div>
          </div>
        </section>
      </div>
    </DocumentationLayout>
  );
}
