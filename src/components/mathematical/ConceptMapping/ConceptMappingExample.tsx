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
import styles from './ConceptMappingExample.module.css';

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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>
          Mathematical Concept Mapping Interface
        </h1>
        <p className={styles.headerDesc}>
          Interactive visualization of mathematical bridges between elliptic curves, abstract algebra, and topology
        </p>
      </div>

      <div className={styles.mainRow}>
        {/* Main Visualization */}
        <div className={styles.mainVisualization}>
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
          <div className={styles.detailsPanel}>
            <h2 className={styles.detailsTitle}>
              {selectedConcept.displayName}
            </h2>

            <div className={styles.badgeRow}>
              <div className={styles.badge}>{selectedConcept.category.replace('_', ' ')}</div>
              <div className={styles.badgeWarning}>{selectedConcept.difficulty}</div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Definition</h3>
              <p className={styles.definitionText}>{selectedConcept.definition}</p>
            </div>

            {selectedConcept.equation && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Key Equation</h3>
                <div className={styles.codeBox}>{selectedConcept.equation}</div>
              </div>
            )}

            {selectedConcept.properties.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Properties</h3>
                <ul className={styles.propertyList}>
                  {selectedConcept.properties.map((prop, index) => (
                    <li key={index} className={styles.propertyItem}>
                      <strong>{prop.name}:</strong> {prop.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedConcept.examples.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Examples</h3>
                {selectedConcept.examples.map((example, index) => (
                  <div key={index} className={styles.exampleBox}>
                    <div className={styles.exampleTitle}>{example.name}</div>
                    <div className={styles.exampleDesc}>{example.description}</div>
                    {example.equation && (
                      <div className={styles.exampleCode}>{example.equation}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedConcept.keywords.length > 0 && (
              <div>
                <h3 className={styles.sectionTitle}>Keywords</h3>
                <div className={styles.keywordRow}>
                  {selectedConcept.keywords.map((keyword, index) => (
                    <span key={index} className={styles.keyword}>{keyword}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className={styles.statusBar}>
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
