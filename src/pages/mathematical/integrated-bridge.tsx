/**
 * Integrated Mathematical Bridge - Demo Page
 * 
 * Task 7.3: Cross-Task Integration
 * 
 * This page demonstrates the unified mathematical bridge interface that combines
 * Bridge Transformations (Task 7.1) with Concept Mapping Interface (Task 7.2).
 * 
 * Features demonstrated:
 * - Synchronized bridge transformations and concept mapping
 * - Cross-component communication and state sharing  
 * - Multiple layout modes (side-by-side, stacked, tabbed)
 * - Real-time integration status monitoring
 * - Event-driven interaction between mathematical domains
 */

import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import IntegratedMathematicalBridge from '@/components/mathematical/Integration/IntegratedMathematicalBridge';
import { MathematicalBridgeProvider } from '@/components/mathematical/Integration/MathematicalBridgeContext';
import styles from './integrated-bridge.module.css';

const IntegratedBridgePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Integrated Mathematical Bridge - ZKTheory</title>
        <meta
          name="description"
          content="Unified mathematical visualization combining bridge transformations and concept mapping for exploring connections between elliptic curves, abstract algebra, and topology."
        />
        <meta name="keywords" content="mathematical bridge, concept mapping, transformations, elliptic curves, topology" />
      </Head>

      <main className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Integrated Mathematical Bridge</h1>
          <p className={styles.description}>
            Explore the deep connections between mathematical domains through interactive
            bridge transformations and concept mapping. This unified interface combines
            visual transformations with relationship graphs to provide a comprehensive
            understanding of mathematical structures.
          </p>
        </div>

        <div className={styles.content}>
          <MathematicalBridgeProvider>
            <IntegratedMathematicalBridge
              width={1200}
              height={800}
              layout="side-by-side"
              showIntegrationControls={true}
              className={styles.bridgeInterface}
            />
          </MathematicalBridgeProvider>
        </div>

        <div className={styles.features}>
          <h2>Integration Features</h2>
          <div className={styles.featureGrid}>
            <div className={styles.feature}>
              <h3>🔄 Bridge Transformations</h3>
              <p>
                Interactive morphisms between elliptic curves, abstract algebra,
                and topology with smooth animations and mathematical precision.
              </p>
            </div>
            <div className={styles.feature}>
              <h3>🕸️ Concept Mapping</h3>
              <p>
                Force-directed graph visualization showing relationships and
                connections between mathematical concepts and structures.
              </p>
            </div>
            <div className={styles.feature}>
              <h3>🔗 Synchronized State</h3>
              <p>
                Real-time synchronization between transformations and concept
                selection with cross-component communication.
              </p>
            </div>
            <div className={styles.feature}>
              <h3>📐 Multiple Layouts</h3>
              <p>
                Flexible viewing options including side-by-side, stacked, and
                tabbed layouts for optimal exploration.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.usage}>
          <h2>How to Use</h2>
          <ol className={styles.instructions}>
            <li>
              <strong>Select a Domain:</strong> Choose between elliptic curves, abstract algebra,
              or topology to focus your exploration.
            </li>
            <li>
              <strong>Trigger Transformations:</strong> Click on transformation buttons to see
              animated morphisms between mathematical domains.
            </li>
            <li>
              <strong>Explore Concepts:</strong> Select concepts in the graph to highlight
              related transformations and see connections.
            </li>
            <li>
              <strong>Switch Layouts:</strong> Use the layout controls to find the best
              viewing mode for your learning style.
            </li>
            <li>
              <strong>Monitor Integration:</strong> Watch the status bar to see real-time
              synchronization between components.
            </li>
          </ol>
        </div>
      </main>
    </>
  );
};

export default IntegratedBridgePage;
