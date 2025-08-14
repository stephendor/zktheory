import React from 'react';
import DocumentationLayout from '../components/DocumentationLayout';
import { DocumentationSidebar } from '../components/DocumentationLayout';
import { 
  AcademicCapIcon, 
  BeakerIcon, 
  ChartBarIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

const conceptCategories = [
  {
    title: 'Topological Data Analysis',
    description: 'Understanding the shape and structure of data through topology',
    icon: BeakerIcon,
    color: 'bg-blue-500',
    concepts: [
      {
        title: 'Persistent Homology',
        description: 'A method for computing topological features of a space at different spatial resolutions',
        details: 'Persistent homology tracks how topological features (like holes, voids, and connected components) appear and disappear as we vary a parameter, typically the radius of balls around data points.',
        examples: ['Point cloud analysis', 'Network structure', 'Time series data']
      },
      {
        title: 'Persistence Diagrams',
        description: 'Visual representation of persistent homology features',
        details: 'A persistence diagram plots the birth and death times of topological features, where each point represents a feature that appears at birth time and disappears at death time.',
        examples: ['Feature stability analysis', 'Data comparison', 'Parameter selection']
      },
      {
        title: 'Mapper Algorithm',
        description: 'A method for constructing a simplicial complex from a point cloud',
        details: 'The Mapper algorithm uses a filter function to partition data into overlapping bins, then constructs a simplicial complex based on the connectivity of these bins.',
        examples: ['Data clustering', 'Feature extraction', 'Dimensionality reduction']
      }
    ]
  },
  {
    title: 'Group Theory',
    description: 'Study of algebraic structures called groups',
    icon: AcademicCapIcon,
    color: 'bg-green-500',
    concepts: [
      {
        title: 'Group Operations',
        description: 'Binary operations that satisfy group axioms',
        details: 'A group is a set equipped with a binary operation that satisfies closure, associativity, identity, and inverse properties. Common examples include addition modulo n and matrix multiplication.',
        examples: ['Cyclic groups', 'Symmetric groups', 'Matrix groups']
      },
      {
        title: 'Cayley Graphs',
        description: 'Graphical representation of group structure',
        details: 'A Cayley graph represents a group by showing each group element as a vertex and each generator as a directed edge, providing visual insight into group structure and relationships.',
        examples: ['Group visualization', 'Subgroup analysis', 'Symmetry patterns']
      },
      {
        title: 'Group Homomorphisms',
        description: 'Structure-preserving maps between groups',
        details: 'A homomorphism is a function between groups that preserves the group operation, allowing us to study relationships between different groups and their properties.',
        examples: ['Quotient groups', 'Kernel analysis', 'Group classification']
      }
    ]
  },
  {
    title: 'Elliptic Curves',
    description: 'Algebraic curves with applications in cryptography',
    icon: ChartBarIcon,
    color: 'bg-purple-500',
    concepts: [
      {
        title: 'Curve Operations',
        description: 'Point addition and scalar multiplication on elliptic curves',
        details: 'Elliptic curves form an abelian group under point addition, with the point at infinity serving as the identity element. This structure enables efficient cryptographic operations.',
        examples: ['Digital signatures', 'Key exchange', 'Public key encryption']
      },
      {
        title: 'Discrete Logarithm Problem',
        description: 'Computational hardness assumption in elliptic curve cryptography',
        details: 'The difficulty of computing the discrete logarithm on elliptic curves provides the security foundation for many cryptographic protocols, including ECDSA and ECDH.',
        examples: ['Bitcoin signatures', 'TLS key exchange', 'Secure messaging']
      },
      {
        title: 'Pairing-Based Cryptography',
        description: 'Advanced cryptographic constructions using bilinear pairings',
        details: 'Bilinear pairings on elliptic curves enable sophisticated cryptographic protocols like identity-based encryption, attribute-based encryption, and functional encryption.',
        examples: ['Identity-based systems', 'Attribute-based access control', 'Functional encryption']
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
    label: 'Mathematical Concepts',
    href: '/documentation/concepts',
    children: [
      { label: 'Topological Data Analysis', href: '/documentation/concepts#topological-data-analysis' },
      { label: 'Group Theory', href: '/documentation/concepts#group-theory' },
      { label: 'Elliptic Curves', href: '/documentation/concepts#elliptic-curves' }
    ]
  }
];

export default function ConceptsPage() {
  return (
    <DocumentationLayout
      title="Mathematical Concepts"
      description="Deep dives into mathematical theory and applications used in zktheory tools and research."
      breadcrumbs={[
        { label: 'Documentation', href: '/documentation' },
        { label: 'Concepts' }
      ]}
      sidebar={<DocumentationSidebar items={sidebarItems} />}
    >
      <div className="space-y-8">
        {/* Introduction */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-8 border border-purple-200">
          <h2 className="text-3xl font-bold text-purple-900 mb-4">Mathematical Foundations</h2>
          <p className="text-purple-800 text-lg leading-relaxed">
            Explore the mathematical concepts that power zktheory's tools and research. From topology to group theory, 
            these concepts provide the theoretical foundation for understanding complex data structures and cryptographic systems.
          </p>
        </div>

        {/* Concept Categories */}
        {conceptCategories.map((category, categoryIndex) => (
          <section key={categoryIndex} id={category.title.toLowerCase().replace(/\s+/g, '-')}>
            <div className="flex items-center space-x-3 mb-6">
              <div className={`${category.color} p-3 rounded-lg`}>
                <category.icon className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">{category.title}</h2>
            </div>
            
            <p className="text-gray-600 text-lg mb-8">{category.description}</p>
            
            <div className="space-y-8">
              {category.concepts.map((concept, conceptIndex) => (
                <div key={conceptIndex} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{concept.title}</h3>
                  <p className="text-gray-600 mb-4 text-lg">{concept.description}</p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Detailed Explanation</h4>
                    <p className="text-gray-700">{concept.details}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Applications & Examples</h4>
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
        ))}

        {/* Further Learning */}
        <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 border border-green-200">
          <h3 className="text-2xl font-bold text-green-900 mb-4">Continue Your Learning Journey</h3>
          <p className="text-green-800 mb-6">
            Ready to put these concepts into practice? Explore our interactive tools and tutorials to deepen your understanding.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/documentation/examples"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors text-center"
            >
              Interactive Examples
            </a>
            <a
              href="/documentation/tutorials"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
            >
              Step-by-Step Tutorials
            </a>
            <a
              href="/documentation/projects"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors text-center"
            >
              Explore Projects
            </a>
          </div>
        </section>
      </div>
    </DocumentationLayout>
  );
}
