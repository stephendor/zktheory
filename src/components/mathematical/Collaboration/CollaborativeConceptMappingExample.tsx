/**
 * CollaborativeConceptMappingExample.tsx
 * 
 * Example usage of the CollaborativeMathematicalConceptGraph component
 * demonstrating real-time collaborative mathematical exploration features.
 */

import React, { useState, useEffect } from 'react';
import { CollaborativeMathematicalConceptGraph } from './CollaborativeMathematicalConceptGraph';
import { createCollaborativeUser, SessionParticipant, SharedMathematicalState } from './types';
import { sampleConcepts, sampleRelationships } from '../ConceptMapping/sampleData';
import styles from './CollaborativeConceptMappingExample.module.css';

export const CollaborativeConceptMappingExample: React.FC = () => {
  // Simulate current user
  const [currentUser] = useState(() => 
    createCollaborativeUser('user_123', 'Dr. Alice Chen', 'alice.chen@university.edu')
  );
  
  // Session management
  const [sessionId, setSessionId] = useState<string>('session_demo_001');
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [collaborationState, setCollaborationState] = useState<SharedMathematicalState | null>(null);
  
  // Component configuration
  const [showCursors, setShowCursors] = useState(true);
  const [enableAnnotations, setEnableAnnotations] = useState(true);
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('collaboration-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        setWidth(Math.max(800, rect.width - 32));
        setHeight(Math.max(600, rect.height - 200));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle collaboration state changes
  const handleCollaborationStateChange = (state: SharedMathematicalState) => {
    setCollaborationState(state);
    console.log('Collaboration state updated:', state);
  };

  // Handle participants changes
  const handleParticipantsChange = (newParticipants: SessionParticipant[]) => {
    setParticipants(newParticipants);
    console.log('Participants updated:', newParticipants);
  };

  // Session management functions
  const createNewSession = () => {
    const newSessionId = `session_${Date.now()}`;
    setSessionId(newSessionId);
    console.log('Created new session:', newSessionId);
  };

  const joinSession = () => {
    const sessionToJoin = prompt('Enter session ID to join:');
    if (sessionToJoin) {
      setSessionId(sessionToJoin);
      console.log('Joining session:', sessionToJoin);
    }
  };

  return (
    <div className={styles.exampleContainer} id="collaboration-container">
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Collaborative Mathematical Concept Mapping</h1>
        <p className={styles.subtitle}>
          Real-time collaborative exploration of mathematical concepts with synchronized views,
          shared annotations, and live cursor tracking.
        </p>
      </div>

      {/* Session Controls */}
      <div className={styles.sessionControls}>
        <div className={styles.sessionInfo}>
          <h3>Session Management</h3>
          <div className={styles.sessionDetails}>
            <span className={styles.sessionLabel}>Current Session:</span>
            <code className={styles.sessionId}>{sessionId}</code>
          </div>
        </div>

        <div className={styles.sessionActions}>
          <button onClick={createNewSession} className={styles.button}>
            Create New Session
          </button>
          <button onClick={joinSession} className={styles.button}>
            Join Session
          </button>
        </div>

        <div className={styles.settings}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showCursors}
              onChange={(e) => setShowCursors(e.target.checked)}
            />
            Show Collaborator Cursors
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={enableAnnotations}
              onChange={(e) => setEnableAnnotations(e.target.checked)}
            />
            Enable Collaborative Annotations
          </label>
        </div>
      </div>

      {/* Main Collaborative Interface */}
      <div className={styles.collaborationInterface}>
        <CollaborativeMathematicalConceptGraph
          concepts={sampleConcepts}
          relationships={sampleRelationships}
          sessionId={sessionId}
          currentUser={currentUser}
          width={width}
          height={height}
          showCollaboratorCursors={showCursors}
          enableCollaborativeAnnotations={enableAnnotations}
          onCollaborationStateChange={handleCollaborationStateChange}
          onParticipantsChange={handleParticipantsChange}
        />
      </div>

      {/* Collaboration Info Panel */}
      <div className={styles.infoPanel}>
        <div className={styles.infoSection}>
          <h4>Current User</h4>
          <div className={styles.userInfo}>
            <div 
              className={styles.userIndicator}
              style={{ '--user-color': currentUser.color } as React.CSSProperties}
            />
            <span className={styles.userName}>{currentUser.name}</span>
            <span className={styles.userEmail}>{currentUser.email}</span>
          </div>
        </div>

        <div className={styles.infoSection}>
          <h4>Active Participants ({participants.length})</h4>
          <div className={styles.participantsList}>
            {participants.length === 0 ? (
              <div className={styles.noParticipants}>No other participants connected</div>
            ) : (
              participants.map(participant => (
                <div key={participant.id} className={styles.participantItem}>
                  <div 
                    className={styles.participantIndicator}
                    style={{ '--participant-color': participant.color } as React.CSSProperties}
                  />
                  <span className={styles.participantName}>{participant.name}</span>
                  <span className={styles.participantRole}>({participant.role})</span>
                  {participant.isActive ? (
                    <span className={styles.activeStatus}>Active</span>
                  ) : (
                    <span className={styles.inactiveStatus}>Away</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {collaborationState && (
          <div className={styles.infoSection}>
            <h4>Collaboration State</h4>
            <div className={styles.stateInfo}>
              <div>Version: {collaborationState.version}</div>
              <div>Selected Concepts: {collaborationState.selectedConcepts.length}</div>
              <div>Annotations: {collaborationState.annotations.length}</div>
              <div>View: {collaborationState.currentView.type}</div>
              <div>Zoom: {collaborationState.currentView.zoom.toFixed(2)}x</div>
            </div>
          </div>
        )}

        <div className={styles.infoSection}>
          <h4>Features Demonstrated</h4>
          <ul className={styles.featuresList}>
            <li>✅ Real-time cursor tracking</li>
            <li>✅ Synchronized view changes</li>
            <li>✅ Collaborative concept selection</li>
            <li>✅ Shared mathematical state</li>
            <li>✅ Live participant presence</li>
            <li>✅ Conflict resolution</li>
            <li>✅ Session management</li>
            <li>✅ WebSocket communication</li>
          </ul>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className={styles.instructions}>
        <h3>How to Use Collaborative Features</h3>
        <div className={styles.instructionsList}>
          <div className={styles.instruction}>
            <strong>1. Session Management:</strong>
            <p>Create a new session or join an existing one using the session ID. Share the session ID with collaborators.</p>
          </div>
          <div className={styles.instruction}>
            <strong>2. Real-time Interaction:</strong>
            <p>Move your mouse to see live cursor tracking. Click and drag to pan the view - changes are synchronized.</p>
          </div>
          <div className={styles.instruction}>
            <strong>3. Concept Selection:</strong>
            <p>Click on mathematical concepts to select them. Selections are shared with all participants in real-time.</p>
          </div>
          <div className={styles.instruction}>
            <strong>4. Collaborative Exploration:</strong>
            <p>Use filters and search to explore concepts together. All view changes are synchronized across participants.</p>
          </div>
          <div className={styles.instruction}>
            <strong>5. Mathematical Annotations:</strong>
            <p>Add shared annotations and notes to concepts (feature enabled in collaborative mode).</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeConceptMappingExample;
