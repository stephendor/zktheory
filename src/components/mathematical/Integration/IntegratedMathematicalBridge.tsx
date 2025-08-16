/**
 * IntegratedMathematicalBridge.tsx
 * 
 * Task 7.3: Cross-Task Integration - Unified Interface Component
 * 
 * Orchestrates both Task 7.1 (Bridge Transformations) and Task 7.2 (Concept Mapping)
 * components into a synchronized, interactive mathematical visualization system.
 * 
 * Features:
 * - Unified layout with both visualization systems
 * - Synchronized state management and cross-communication
 * - Integrated control panel for both systems
 * - Real-time coordination between transformations and concept mapping
 * - Educational progression and learning pathway integration
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { MathematicalBridgeProvider, useMathematicalBridge } from './MathematicalBridgeContext';
import { useBridgeTransformationIntegration, useConceptMappingIntegration, useMathematicalBridgeControl } from './useBridgeIntegration';
import UnifiedBridgeOrchestrator from '../BridgeTransformations/UnifiedBridgeOrchestrator';
import MathematicalConceptGraph from '../ConceptMapping/MathematicalConceptGraph';
import { MathematicalConcept } from '../ConceptMapping/types';
import { BridgeTransformation, TransformationType } from '../BridgeTransformations/types';
import styles from './IntegratedMathematicalBridge.module.css';

// Interface for the main integrated component
export interface IntegratedMathematicalBridgeProps {
  /** Initial layout configuration */
  layout?: 'side-by-side' | 'stacked' | 'tabbed';
  /** Show integration controls */
  showIntegrationControls?: boolean;
  /** Enable automatic synchronization between components */
  enableSynchronization?: boolean;
  /** Component dimensions */
  width?: number;
  height?: number;
  /** Custom CSS class */
  className?: string;
}

// Internal component that uses the context (must be inside provider)
const IntegratedMathematicalBridgeContent: React.FC<IntegratedMathematicalBridgeProps> = ({
  layout = 'side-by-side',
  showIntegrationControls = true,
  enableSynchronization = true,
  width = 1400,
  height = 800,
  className = ''
}) => {
  // Integration hooks
  const bridgeIntegration = useBridgeTransformationIntegration();
  const conceptIntegration = useConceptMappingIntegration();
  const bridgeControl = useMathematicalBridgeControl();

  // Local state for UI
  const [activeTab, setActiveTab] = useState<'bridge' | 'concept' | 'both'>('both');
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Initialize synchronization setting
  useEffect(() => {
    bridgeControl.setSynchronizationEnabled(enableSynchronization);
  }, [enableSynchronization, bridgeControl]);

  // Handle bridge transformation updates
  const handleBridgeTransformationChange = useCallback((transformation: BridgeTransformation) => {
    console.log('Bridge transformation changed:', transformation);
    // The integration hook will handle the context update automatically
  }, []);

  // Handle concept selection from either component
  const handleConceptSelect = useCallback((concept: MathematicalConcept | null) => {
    conceptIntegration.handleConceptSelect(concept);
  }, [conceptIntegration]);

  // Handle learning path creation
  const handleLearningPath = useCallback((startId: string, endId: string) => {
    conceptIntegration.handleLearningPath(startId, endId);
  }, [conceptIntegration]);

  // Handle manual transformation trigger
  const handleTriggerTransformation = useCallback((type: TransformationType) => {
    bridgeIntegration.triggerTransformation(type, 'user-interaction');
  }, [bridgeIntegration]);

  // Get layout-specific dimensions
  const getComponentDimensions = () => {
    switch (layout) {
      case 'side-by-side':
        // Bridge:Concept ≈ 1:3 (bridge narrower)
        return {
          bridge: { width: width * 0.25 - 20, height: height - 100 },
          concept: { width: width * 0.75 - 20, height: height - 100 }
        };
      case 'stacked':
        return {
          bridge: { width: width - 40, height: height * 0.5 - 50 },
          concept: { width: width - 40, height: height * 0.5 - 50 }
        };
      case 'tabbed':
        return {
          bridge: { width: width - 40, height: height - 100 },
          concept: { width: width - 40, height: height - 100 }
        };
      default:
        return {
          bridge: { width: width * 0.5, height: height },
          concept: { width: width * 0.5, height: height }
        };
    }
  };

  const dimensions = getComponentDimensions();

  // Integration status for debugging
  const integrationStatus = bridgeControl.getIntegrationStatus();

  return (
    <div className={`${styles.integratedBridge} ${className}`}>
      {/* Header with integration controls */}
      {showIntegrationControls && (
        <div className={styles.integrationHeader}>
          <div className={styles.headerTitle}>
            <h2>Mathematical Bridge Integration</h2>
            <span className={styles.subtitle}>
              Interactive visualization of mathematical connections and transformations
            </span>
          </div>
          
          <div className={styles.integrationControls}>
            {/* Layout Controls */}
            <div className={styles.controlGroup}>
              <label htmlFor="layout-select">Layout:</label>
              <select 
                id="layout-select"
                value={layout} 
                onChange={(e) => setActiveTab('both')}
                className={styles.select}
                title="Select layout mode"
              >
                <option value="side-by-side">Side by Side</option>
                <option value="stacked">Stacked</option>
                <option value="tabbed">Tabbed</option>
              </select>
            </div>

            {/* Tab Controls for tabbed layout */}
            {layout === 'tabbed' && (
              <div className={styles.controlGroup}>
                <div className={styles.tabControls}>
                  <button 
                    className={`${styles.tab} ${activeTab === 'bridge' ? styles.active : ''}`}
                    onClick={() => setActiveTab('bridge')}
                  >
                    Bridge Transformations
                  </button>
                  <button 
                    className={`${styles.tab} ${activeTab === 'concept' ? styles.active : ''}`}
                    onClick={() => setActiveTab('concept')}
                  >
                    Concept Mapping
                  </button>
                  <button 
                    className={`${styles.tab} ${activeTab === 'both' ? styles.active : ''}`}
                    onClick={() => setActiveTab('both')}
                  >
                    Integrated View
                  </button>
                </div>
              </div>
            )}

            {/* Integration Settings */}
            <div className={styles.controlGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={bridgeIntegration.synchronizationEnabled}
                  onChange={(e) => bridgeControl.setSynchronizationEnabled(e.target.checked)}
                />
                Synchronization
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={conceptIntegration.crossHighlightingEnabled}
                  onChange={(e) => bridgeControl.setCrossHighlightingEnabled(e.target.checked)}
                />
                Cross-highlighting
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={showDebugInfo}
                  onChange={(e) => setShowDebugInfo(e.target.checked)}
                />
                Debug Info
              </label>
            </div>

            {/* Quick Actions */}
            <div className={styles.controlGroup}>
              <button 
                className={styles.actionButton}
                onClick={() => handleTriggerTransformation('elliptic-to-algebra')}
              >
                EC → Algebra
              </button>
              <button 
                className={styles.actionButton}
                onClick={() => handleTriggerTransformation('algebra-to-topology')}
              >
                Algebra → Topology
              </button>
              <button 
                className={styles.actionButton}
                onClick={() => bridgeControl.resetIntegration()}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Information */}
      {showDebugInfo && (
        <div className={styles.debugPanel}>
          <h4>Integration Status</h4>
          <div className={styles.debugInfo}>
            <span>Domain: {integrationStatus.currentDomain}</span>
            <span>Active Transformation: {integrationStatus.hasActiveTransformation ? 'Yes' : 'No'}</span>
            <span>Selected Concept: {integrationStatus.hasSelectedConcept ? 'Yes' : 'No'}</span>
            <span>Highlighted: {integrationStatus.highlightCount}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`${styles.contentArea} ${styles[layout]}`}>
        {/* Bridge Transformations Component */}
        {(layout !== 'tabbed' || activeTab === 'bridge' || activeTab === 'both') && (
          <div className={styles.bridgeContainer}>
            <div className={styles.componentHeader}>
              <h3>Mathematical Bridge Transformations</h3>
              <span className={styles.componentSubtitle}>
                Animated morphisms between mathematical domains
              </span>
            </div>
            <UnifiedBridgeOrchestrator
              autoPlay={false}
              showControls={true}
              onTransformationChange={handleBridgeTransformationChange}
              className={styles.bridgeComponent}
            />
          </div>
        )}

        {/* Concept Mapping Component */}
        {(layout !== 'tabbed' || activeTab === 'concept' || activeTab === 'both') && (
          <div className={styles.conceptContainer}>
            <div className={styles.componentHeader}>
              <h3>Mathematical Concept Mapping</h3>
              <span className={styles.componentSubtitle}>
                Interactive relationship visualization
              </span>
            </div>
            <MathematicalConceptGraph
              width={dimensions.concept.width}
              height={dimensions.concept.height}
              onConceptSelect={handleConceptSelect}
              onLearningPath={handleLearningPath}
            />
          </div>
        )}
      </div>

      {/* Integration Status Bar */}
      <div className={styles.statusBar}>
        <div className={styles.statusIndicators}>
          <div className={`${styles.indicator} ${integrationStatus.isActive ? styles.active : styles.inactive}`}>
            <span className={styles.dot}></span>
            Integration {integrationStatus.isActive ? 'Active' : 'Inactive'}
          </div>
          {integrationStatus.hasActiveTransformation && (
            <div className={`${styles.indicator} ${styles.active}`}>
              <span className={styles.dot}></span>
              Transformation Running
            </div>
          )}
          {integrationStatus.hasSelectedConcept && (
            <div className={`${styles.indicator} ${styles.active}`}>
              <span className={styles.dot}></span>
              Concept Selected
            </div>
          )}
        </div>
        <div className={styles.currentDomain}>
          Current Domain: <strong>{integrationStatus.currentDomain.replace('-', ' ')}</strong>
        </div>
      </div>
    </div>
  );
};

// Main exported component with provider wrapper
export const IntegratedMathematicalBridge: React.FC<IntegratedMathematicalBridgeProps> = (props) => {
  return (
    <MathematicalBridgeProvider
      initialDomain="elliptic-curves"
      synchronizationEnabled={props.enableSynchronization !== false}
    >
      <IntegratedMathematicalBridgeContent {...props} />
    </MathematicalBridgeProvider>
  );
};

export default IntegratedMathematicalBridge;
