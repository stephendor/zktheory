import React from 'react';
import Link from 'next/link';
import DocumentationLayout from '../components/DocumentationLayout';
import { DocumentationSidebar } from '../components/DocumentationLayout';
import { 
  ChartBarIcon, 
  BeakerIcon, 
  AcademicCapIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const sidebarItems = [
  {
    label: 'Documentation',
    href: '/documentation',
    children: [
      { label: 'Getting Started', href: '/documentation/getting-started' },
      { label: 'Research', href: '/documentation/research' },
      { label: 'Projects', href: '/documentation/projects' }
    ]
  },
  {
    label: 'Research Areas',
    href: '/documentation/research',
    children: [
      { label: 'APT Detection', href: '/documentation/research/apt-detection' },
      { label: 'Bubble Detection', href: '/documentation/research/bubble-detection' },
      { label: 'Performance Benchmarks', href: '/documentation/research/benchmarks' }
    ]
  }
];

const researchProjects = [
  {
    title: 'APT Detection',
    description: 'Advanced Persistent Threat detection using topological data analysis',
    icon: BeakerIcon,
    color: 'bg-red-500',
    status: 'research',
    href: '/documentation/research/apt-detection',
    features: [
      'Threat detection algorithms',
      'Real-time analysis capabilities',
      'Parameter optimization',
      'Comprehensive evaluation metrics'
    ]
  },
  {
    title: 'Bubble Detection',
    description: 'Financial market bubble detection with statistical validation',
    icon: ChartBarIcon,
    color: 'bg-green-500',
    status: 'research',
    href: '/documentation/research/bubble-detection',
    features: [
      'Market analysis algorithms',
      'Statistical validation',
      'Risk assessment models',
      'Real-time detection'
    ]
  },
  {
    title: 'Performance Benchmarks',
    description: 'Comprehensive performance analysis and optimization metrics',
    icon: CogIcon,
    color: 'bg-blue-500',
    accuracy: 'N/A',
    status: 'ongoing',
    href: '/documentation/research/benchmarks',
    features: [
      'Computation time analysis',
      'Memory usage optimization',
      'Scalability testing',
      'Cross-platform comparison'
    ]
  }
];

export default function ResearchPage() {
  return (
    <DocumentationLayout
      title="Research Demonstrations"
      description="Reproducible research results, performance benchmarks, and computational demonstrations"
      breadcrumbs={[
        { label: 'Documentation', href: '/documentation' },
        { label: 'Research' }
      ]}
      sidebar={<DocumentationSidebar items={sidebarItems} />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <section className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-8 border border-purple-200">
          <div className="flex items-center space-x-4 mb-4">
            <AcademicCapIcon className="h-8 w-8 text-purple-600" />
            <h2 className="text-3xl font-bold text-purple-900">Research Demonstrations</h2>
          </div>
          <p className="text-purple-800 text-lg leading-relaxed">
            Our research demonstrations showcase the practical applications of mathematical tools 
            in real-world scenarios. Each project includes reproducible results, detailed methodology, 
            and comprehensive performance analysis.
          </p>
        </section>

        {/* Research Projects */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Research Projects</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {researchProjects.map((project, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`${project.color} p-3 rounded-lg`}>
                    <project.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                      <div className="flex items-center space-x-2">
                        {project.accuracy !== 'N/A' && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {project.accuracy} accuracy
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          project.status === 'published' 
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'research'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {project.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Link
                  href={project.href}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View Research Details
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Research Methodology */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Research Methodology</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <DocumentTextIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reproducible</h3>
              <p className="text-gray-600 text-sm">
                All research results include complete methodology, datasets, and code for full reproducibility
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <PresentationChartLineIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Validated</h3>
              <p className="text-gray-600 text-sm">
                Results are validated using multiple approaches and cross-verified for accuracy
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <CogIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Optimized</h3>
              <p className="text-gray-600 text-sm">
                Performance is continuously monitored and optimized for real-world applications
              </p>
            </div>
          </div>
        </section>

        {/* Publications and Citations */}
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📚 Publications & Citations</h3>
          <p className="text-blue-800 mb-4">
            Our research has been presented at conferences and published in peer-reviewed journals. 
            We provide BibTeX citations and DOI links for all published work.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Conference Presentations</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Topology in Data Science Conference 2024</li>
                <li>• Applied Mathematics Symposium 2024</li>
                <li>• Computational Geometry Workshop 2024</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Journal Publications</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Journal of Topological Data Analysis</li>
                <li>• Computational Mathematics Quarterly</li>
                <li>• Applied Group Theory Review</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Getting Involved */}
        <section className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">🔬 Getting Involved</h3>
          <p className="text-green-800 mb-4">
            Interested in contributing to our research? We welcome collaborations, 
            code contributions, and feedback on our methodologies.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/documentation/research/collaboration"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Collaboration Guide
            </Link>
            <Link
              href="/documentation/research/reproduction"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reproduce Results
            </Link>
            <Link
              href="/documentation/research/feedback"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              Provide Feedback
            </Link>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">💡 What's Next?</h3>
          <p className="text-yellow-800 mb-4">
            Ready to explore our research in detail? Dive into specific projects or learn 
            how to reproduce our results.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/documentation/research/apt-detection"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Explore APT Detection
            </Link>
            <Link
              href="/documentation/research/bubble-detection"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Explore Bubble Detection
            </Link>
          </div>
        </section>
      </div>
    </DocumentationLayout>
  );
}
