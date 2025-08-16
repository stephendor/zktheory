/**
 * ConceptMappingExample.tsx
 * 
 * Example usage of the MathematicalConceptGraph component
 * Demonstrates the educational mathematical bridge visualization
 */

'use client';

import React, { useState } from 'react';
import MathematicalConceptGraph from './MathematicalConceptGraph';
import { MathematicalConcept, ConceptCategory, DifficultyLevel } from './types';

export const ConceptMappingExample: React.FC = () => {
  const [selectedConcept, setSelectedConcept] = useState<MathematicalConcept | null>(null);
  const [learningPath, setLearningPath] = useState<string[]>([]);

  const handleConceptSelect = (concept: MathematicalConcept | null) => {
    setSelectedConcept(concept);
    console.log('Selected concept:', concept?.displayName);
  };

  const handleLearningPath = (startId: string, endId: string) => {
    console.log('Learning path requested:', startId, '->', endId);
    setLearningPath([startId, endId]);
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#1f2937', 
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>
          Mathematical Concept Mapping Interface
        </h1>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', opacity: 0.8 }}>
          Interactive visualization of mathematical bridges between elliptic curves, abstract algebra, and topology
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex' }}>
        {/* Main Visualization */}
        <div style={{ flex: 1 }}>
          <MathematicalConceptGraph
            width={1000}
            height={700}
            onConceptSelect={handleConceptSelect}
            onLearningPath={handleLearningPath}
            showControls={true}
            showStatistics={true}
            showLegend={true}
            maxDifficultyLevel={DifficultyLevel.RESEARCH}
            allowedCategories={[
              ConceptCategory.ELLIPTIC_CURVES,
              ConceptCategory.ABSTRACT_ALGEBRA,
              ConceptCategory.TOPOLOGY,
              ConceptCategory.NUMBER_THEORY,
              ConceptCategory.ALGEBRAIC_GEOMETRY
            ]}
          />
        </div>

        {/* Details Panel */}
        {selectedConcept && (
          <div style={{
            width: '350px',
            backgroundColor: '#f8fafc',
            borderLeft: '1px solid #e2e8f0',
            padding: '20px',
            overflow: 'auto'
          }}>
            <h2 style={{ 
              margin: '0 0 16px 0', 
              fontSize: '20px',
              color: '#1f2937'
            }}>
              {selectedConcept.displayName}
            </h2>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                display: 'inline-block',
                padding: '4px 8px',
                backgroundColor: '#e0e7ff',
                color: '#3730a3',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                marginRight: '8px'
              }}>
                {selectedConcept.category.replace('_', ' ')}
              </div>
              <div style={{ 
                display: 'inline-block',
                padding: '4px 8px',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {selectedConcept.difficulty}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                Definition
              </h3>
              <p style={{ fontSize: '14px', lineHeight: '1.5', margin: 0, color: '#4b5563' }}>
                {selectedConcept.definition}
              </p>
            </div>

            {selectedConcept.equation && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  Key Equation
                </h3>
                <div style={{ 
                  backgroundColor: '#f3f4f6',
                  padding: '12px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}>
                  {selectedConcept.equation}
                </div>
              </div>
            )}

            {selectedConcept.properties.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  Properties
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {selectedConcept.properties.map((prop, index) => (
                    <li key={index} style={{ fontSize: '14px', marginBottom: '4px' }}>
                      <strong>{prop.name}:</strong> {prop.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedConcept.examples.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  Examples
                </h3>
                {selectedConcept.examples.map((example, index) => (
                  <div key={index} style={{ 
                    backgroundColor: '#f9fafb',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                      {example.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {example.description}
                    </div>
                    {example.equation && (
                      <div style={{ 
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        marginTop: '4px',
                        color: '#374151'
                      }}>
                        {example.equation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedConcept.keywords.length > 0 && (
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  Keywords
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {selectedConcept.keywords.map((keyword, index) => (
                    <span key={index} style={{
                      padding: '2px 6px',
                      backgroundColor: '#e5e7eb',
                      color: '#374151',
                      borderRadius: '3px',
                      fontSize: '12px'
                    }}>
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div style={{ 
        padding: '8px 16px',
        backgroundColor: '#f3f4f6',
        borderTop: '1px solid #e5e7eb',
        fontSize: '12px',
        color: '#6b7280',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          Task 7.2: Mathematical Concept Mapping Interface - Interactive visualization of mathematical bridges
        </div>
        <div>
          {selectedConcept ? `Selected: ${selectedConcept.displayName}` : 'Click a concept to explore details'}
        </div>
      </div>
    </div>
  );
};

export default ConceptMappingExample;
