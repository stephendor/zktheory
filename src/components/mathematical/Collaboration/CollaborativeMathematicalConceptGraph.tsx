/**
 * Collaborative Mathematical Concept Graph
 * 
 * This component extends the MathematicalConceptGraph with real-time collaboration
 * features, enabling multiple users to explore mathematical concepts together with
 * synchronized views, shared annotations, and collaborative interactions.
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  MathematicalConcept, 
  ConceptRelationship,
  ConceptCategory,
  DifficultyLevel
} from '../ConceptMapping/types';
import {
  CollaborationManager,
  getCollaborationManager,
  defaultCollaborationConfig
} from './CollaborationManager';
import {
  CollaborativeAction,
  CollaborativeActionType,
  SessionParticipant,
  SharedMathematicalState,
  UserId,
  SessionId,
  CollaborativeUser,
  createCollaborativeUser
} from './types';
import { ConceptForceSimulation, ConceptNode } from '../ConceptMapping/ConceptForceSimulation';
import { sampleConcepts, sampleRelationships } from '../ConceptMapping/sampleData';
import styles from './CollaborativeMathematicalConceptGraph.module.css';

// ============================================================================
// Component Props and State
// ============================================================================

interface CollaborativeMathematicalConceptGraphProps {
  /** Initial concepts to display */
  concepts?: MathematicalConcept[];
  /** Initial relationships between concepts */
  relationships?: ConceptRelationship[];
  /** Collaboration session ID to join */
  sessionId?: SessionId;
  /** Current user information */
  currentUser: CollaborativeUser;
  /** Width of the visualization */
  width?: number;
  /** Height of the visualization */
  height?: number;
  /** Enable real-time cursor tracking */
  showCollaboratorCursors?: boolean;
  /** Enable collaborative annotations */
  enableCollaborativeAnnotations?: boolean;
  /** Callback when collaboration state changes */
  onCollaborationStateChange?: (state: SharedMathematicalState) => void;
  /** Callback when participants change */
  onParticipantsChange?: (participants: SessionParticipant[]) => void;
}

interface CollaborationState {
  isConnected: boolean;
  participants: SessionParticipant[];
  sharedState: SharedMathematicalState | null;
  syncStatus: 'synced' | 'syncing' | 'conflict' | 'disconnected';
}

// ============================================================================
// Main Component
// ============================================================================

export const CollaborativeMathematicalConceptGraph: React.FC<CollaborativeMathematicalConceptGraphProps> = ({
  concepts = sampleConcepts,
  relationships = sampleRelationships,
  sessionId,
  currentUser,
  width = 1200,
  height = 800,
  showCollaboratorCursors = true,
  enableCollaborativeAnnotations = true,
  onCollaborationStateChange,
  onParticipantsChange
}) => {
  // ============================================================================
  // Refs and State
  // ============================================================================
  
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<ConceptForceSimulation | null>(null);
  const collaborationManagerRef = useRef<CollaborationManager | null>(null);
  const cursorUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [filteredConcepts, setFilteredConcepts] = useState<MathematicalConcept[]>(concepts);
  const [filteredRelationships, setFilteredRelationships] = useState<ConceptRelationship[]>(relationships);
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<ConceptCategory[]>([]);
  const [maxDifficulty, setMaxDifficulty] = useState<DifficultyLevel>(DifficultyLevel.RESEARCH);
  const [showPaths, setShowPaths] = useState(false);
  const [showClusters, setShowClusters] = useState(true);
  
  // Collaboration state
  const [collaborationState, setCollaborationState] = useState<CollaborationState>({
    isConnected: false,
    participants: [],
    sharedState: null,
    syncStatus: 'disconnected'
  });
  
  const [collaboratorCursors, setCollaboratorCursors] = useState<Record<UserId, { x: number; y: number; visible: boolean }>>({});

  // ============================================================================
  // Collaboration Setup
  // ============================================================================

  useEffect(() => {
    const initializeCollaboration = async () => {
      try {
        const manager = getCollaborationManager(defaultCollaborationConfig);
        collaborationManagerRef.current = manager;

        // Set up event handlers
        manager.setEventHandlers({
          onConnectionChange: (connected) => {
            setCollaborationState(prev => ({
              ...prev,
              isConnected: connected,
              syncStatus: connected ? 'synced' : 'disconnected'
            }));
          },
          
          onAction: handleCollaborativeAction,
          
          onStateSync: (state) => {
            setCollaborationState(prev => ({
              ...prev,
              sharedState: state,
              syncStatus: 'synced'
            }));
            applySynchronizedState(state);
            onCollaborationStateChange?.(state);
          },
          
          onSessionUpdate: (session) => {
            const participants = Object.values(session.participants);
            setCollaborationState(prev => ({
              ...prev,
              participants
            }));
            onParticipantsChange?.(participants);
          },
          
          onError: (error) => {
            console.error('Collaboration error:', error);
            setCollaborationState(prev => ({
              ...prev,
              syncStatus: 'conflict'
            }));
          }
        });

        // Connect to collaboration server
        await manager.connect(currentUser.id);
        
        // Join session if provided
        if (sessionId) {
          await manager.joinSession(sessionId);
        }
      } catch (error) {
        console.error('Failed to initialize collaboration:', error);
      }
    };

    initializeCollaboration();

    return () => {
      collaborationManagerRef.current?.disconnect();
    };
  }, [currentUser.id, sessionId, onCollaborationStateChange, onParticipantsChange]);

  // ============================================================================
  // Collaborative Action Handlers
  // ============================================================================

  const handleCollaborativeAction = useCallback((action: CollaborativeAction) => {
    switch (action.type) {
      case CollaborativeActionType.VIEW_CHANGE:
        handleRemoteViewChange(action.payload);
        break;
        
      case CollaborativeActionType.CONCEPT_SELECT:
        handleRemoteConceptSelect(action.payload);
        break;
        
      case CollaborativeActionType.CURSOR_MOVE:
        handleRemoteCursorMove(action.userId, action.payload);
        break;
        
      case CollaborativeActionType.CONCEPT_HIGHLIGHT:
        handleRemoteConceptHighlight(action.payload);
        break;
        
      default:
        console.log('Unhandled collaborative action:', action.type);
    }
  }, []);

  const handleRemoteViewChange = useCallback((payload: any) => {
    if (!simulationRef.current) return;
    
    const { center, zoom, animated, duration = 500 } = payload;
    const svg = d3.select(svgRef.current);
    
    if (animated) {
      const zoomBehavior = d3.zoom<SVGSVGElement, unknown>();
      const transform = d3.zoomIdentity.translate(center.x, center.y).scale(zoom);
      
      svg.transition()
        .duration(duration)
        .call(zoomBehavior.transform as any, transform);
    } else {
      const zoomBehavior = d3.zoom<SVGSVGElement, unknown>();
      const transform = d3.zoomIdentity.translate(center.x, center.y).scale(zoom);
      
      svg.call(zoomBehavior.transform as any, transform);
    }
  }, []);

  const handleRemoteConceptSelect = useCallback((payload: any) => {
    const { conceptIds, mode } = payload;
    
    setSelectedConcepts(prev => {
      switch (mode) {
        case 'replace':
          return conceptIds;
        case 'add':
          return [...new Set([...prev, ...conceptIds])];
        case 'toggle':
          return prev.filter(id => !conceptIds.includes(id))
            .concat(conceptIds.filter(id => !prev.includes(id)));
        default:
          return conceptIds;
      }
    });
  }, []);

  const handleRemoteCursorMove = useCallback((userId: UserId, payload: any) => {
    if (userId === currentUser.id) return; // Don't show our own cursor
    
    setCollaboratorCursors(prev => ({
      ...prev,
      [userId]: {
        x: payload.x,
        y: payload.y,
        visible: payload.visible
      }
    }));
  }, [currentUser.id]);

  const handleRemoteConceptHighlight = useCallback((payload: any) => {
    const { conceptId, highlight } = payload;
    
    if (!simulationRef.current) return;
    
    // Apply temporary highlighting to the concept
    const svg = d3.select(svgRef.current);
    const nodeSelection = svg.selectAll('.concept-node')
      .filter((d: any) => d.id === conceptId);
    
    if (highlight) {
      nodeSelection
        .transition()
        .duration(200)
        .attr('stroke', '#ff6b6b')
        .attr('stroke-width', 3);
    } else {
      nodeSelection
        .transition()
        .duration(200)
        .attr('stroke', null)
        .attr('stroke-width', null);
    }
  }, []);

  // ============================================================================
  // Local Action Broadcasting
  // ============================================================================

  const broadcastViewChange = useCallback((center: { x: number; y: number }, zoom: number, animated = true) => {
    collaborationManagerRef.current?.broadcastViewChange(center, zoom, animated);
  }, []);

  const broadcastConceptSelect = useCallback((conceptIds: string[], mode: 'replace' | 'add' | 'toggle' = 'replace') => {
    collaborationManagerRef.current?.broadcastConceptSelect(conceptIds, mode);
  }, []);

  const broadcastCursorMove = useCallback((x: number, y: number, visible = true) => {
    // Throttle cursor updates to avoid overwhelming the network
    if (cursorUpdateTimeoutRef.current) {
      clearTimeout(cursorUpdateTimeoutRef.current);
    }
    
    cursorUpdateTimeoutRef.current = setTimeout(() => {
      collaborationManagerRef.current?.broadcastCursorMove(x, y, visible);
    }, 50); // 20 FPS max for cursor updates
  }, []);

  // ============================================================================
  // Synchronized State Management
  // ============================================================================

  const applySynchronizedState = useCallback((state: SharedMathematicalState) => {
    // Apply view state
    if (state.currentView && simulationRef.current) {
      const { center, zoom } = state.currentView;
      const svg = d3.select(svgRef.current);
      const zoomBehavior = d3.zoom<SVGSVGElement, unknown>();
      const transform = d3.zoomIdentity.translate(center.x, center.y).scale(zoom);
      
      svg.call(zoomBehavior.transform as any, transform);
    }
    
    // Apply selections
    if (state.selectedConcepts) {
      setSelectedConcepts(state.selectedConcepts);
    }
    
    // Apply filters from shared state
    if (state.currentView?.activeFilters) {
      // Parse and apply filters based on shared state
      // This would involve updating local filter state
    }
  }, []);

  // ============================================================================
  // Mouse and Interaction Handlers
  // ============================================================================

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!showCollaboratorCursors || !collaborationState.isConnected) return;
    
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    broadcastCursorMove(x, y, true);
  }, [showCollaboratorCursors, collaborationState.isConnected, broadcastCursorMove]);

  const handleMouseLeave = useCallback(() => {
    if (showCollaboratorCursors && collaborationState.isConnected) {
      broadcastCursorMove(0, 0, false);
    }
  }, [showCollaboratorCursors, collaborationState.isConnected, broadcastCursorMove]);

  // ============================================================================
  // D3.js Visualization Setup
  // ============================================================================

  useEffect(() => {
    if (!svgRef.current) return;

    // Initialize D3 force simulation
    const simulation = new ConceptForceSimulation({
      width,
      height,
      linkDistance: 100,
      chargeStrength: -300,
      centerStrength: 0.1,
      collisionRadius: 30,
      velocityDecay: 0.4,
      boundsMargin: 50
    });
    simulationRef.current = simulation;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Set up zoom behavior with collaboration broadcast
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        const { transform } = event;
        svg.select('.main-group').attr('transform', transform);
        
        // Broadcast view changes to collaborators
        if (collaborationState.isConnected) {
          broadcastViewChange(
            { x: transform.x, y: transform.y },
            transform.k,
            false
          );
        }
      });

    svg.call(zoom);

    // Create main group for all elements
    const mainGroup = svg.append('g').attr('class', 'main-group');

    // Update simulation with filtered data
    simulation.updateData(filteredConcepts, filteredRelationships);

    // Render the graph using D3.js
    const renderGraph = () => {
      const nodes = simulation.getNodes();
      const links = simulation.getLinks();

      // Remove existing elements
      mainGroup.selectAll('*').remove();

      // Create links
      const linkSelection = mainGroup.selectAll('.concept-link')
        .data(links)
        .enter()
        .append('line')
        .attr('class', 'concept-link')
        .attr('stroke', d => d.strokeColor)
        .attr('stroke-width', d => d.strokeWidth)
        .attr('stroke-dasharray', d => d.strokeDasharray || null);

      // Create nodes
      const nodeSelection = mainGroup.selectAll('.concept-node')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('class', 'concept-node')
        .attr('r', d => d.radius)
        .attr('fill', d => d.color)
        .attr('stroke', d => selectedConcepts.includes(d.id) ? '#000' : 'none')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
          const newSelection = selectedConcepts.includes(d.id)
            ? selectedConcepts.filter(id => id !== d.id)
            : [...selectedConcepts, d.id];
          
          setSelectedConcepts(newSelection);
          broadcastConceptSelect(newSelection, 'replace');
        })
        .on('mouseenter', (event, d) => {
          // Broadcast concept highlighting
          collaborationManagerRef.current?.broadcastAction({
            type: CollaborativeActionType.CONCEPT_HIGHLIGHT,
            payload: {
              conceptId: d.id,
              highlight: true
            }
          });
        })
        .on('mouseleave', (event, d) => {
          // Broadcast concept highlighting off
          collaborationManagerRef.current?.broadcastAction({
            type: CollaborativeActionType.CONCEPT_HIGHLIGHT,
            payload: {
              conceptId: d.id,
              highlight: false
            }
          });
        });

      // Add node labels
      const labelSelection = mainGroup.selectAll('.concept-label')
        .data(nodes)
        .enter()
        .append('text')
        .attr('class', 'concept-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .style('pointer-events', 'none')
        .text(d => d.concept.displayName);

      // Update positions on simulation tick
      simulation.onTick(() => {
        linkSelection
          .attr('x1', d => (d.source as ConceptNode).x!)
          .attr('y1', d => (d.source as ConceptNode).y!)
          .attr('x2', d => (d.target as ConceptNode).x!)
          .attr('y2', d => (d.target as ConceptNode).y!);

        nodeSelection
          .attr('cx', d => d.x!)
          .attr('cy', d => d.y!);

        labelSelection
          .attr('x', d => d.x!)
          .attr('y', d => d.y!);
      });

      // Start simulation
      simulation.start();
    };

    renderGraph();

    return () => {
      simulation.destroy();
    };
  }, [
    width,
    height,
    filteredConcepts,
    filteredRelationships,
    selectedConcepts,
    searchTerm,
    showPaths,
    showClusters,
    collaborationState.isConnected,
    broadcastViewChange,
    broadcastConceptSelect
  ]);

  // ============================================================================
  // Render Collaborator Cursors
  // ============================================================================

  const renderCollaboratorCursors = useMemo(() => {
    if (!showCollaboratorCursors || !collaborationState.isConnected) return null;

    return Object.entries(collaboratorCursors)
      .filter(([userId, cursor]) => cursor.visible && userId !== currentUser.id)
      .map(([userId, cursor]) => {
        const participant = collaborationState.participants.find(p => p.id === userId);
        if (!participant) return null;

        return (
          <div
            key={userId}
            className={styles.collaboratorCursor}
            style={{
              left: cursor.x,
              top: cursor.y,
              '--cursor-color': participant.color,
            } as React.CSSProperties}
          >
            <div 
              className={styles.cursorLabel} 
              style={{ '--cursor-color': participant.color } as React.CSSProperties}
            >
              {participant.name}
            </div>
          </div>
        );
      });
  }, [showCollaboratorCursors, collaborationState.isConnected, collaboratorCursors, collaborationState.participants, currentUser.id]);

  // ============================================================================
  // Filter Management
  // ============================================================================

  useEffect(() => {
    let filtered = concepts;

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(concept =>
        concept.name.toLowerCase().includes(lowerSearchTerm) ||
        concept.definition.toLowerCase().includes(lowerSearchTerm) ||
        (concept.examples && concept.examples.some(ex => 
          ex.description.toLowerCase().includes(lowerSearchTerm)
        ))
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(concept =>
        selectedCategories.includes(concept.category)
      );
    }

    // Apply difficulty filter
    filtered = filtered.filter(concept =>
      concept.difficulty <= maxDifficulty
    );

    setFilteredConcepts(filtered);

    // Filter relationships to only include those between filtered concepts
    const filteredConceptIds = new Set(filtered.map(c => c.id));
    const filteredRels = relationships.filter(rel =>
      filteredConceptIds.has(rel.source) && filteredConceptIds.has(rel.target)
    );
    setFilteredRelationships(filteredRels);
  }, [concepts, relationships, searchTerm, selectedCategories, maxDifficulty]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={styles.collaborativeConceptGraph}>
      {/* Collaboration Status Bar */}
      <div className={styles.collaborationStatus}>
        <div className={styles.connectionStatus}>
          <div className={`${styles.statusIndicator} ${collaborationState.isConnected ? styles.connected : styles.disconnected}`} />
          <span>{collaborationState.isConnected ? 'Connected' : 'Disconnected'}</span>
          <span className={styles.syncStatus}>({collaborationState.syncStatus})</span>
        </div>
        
        <div className={styles.participants}>
          <span>Participants ({collaborationState.participants.length}):</span>
          {collaborationState.participants.map(participant => (
            <div key={participant.id} className={styles.participant}>
              <div 
                className={styles.participantIndicator}
                style={{ '--participant-color': participant.color } as React.CSSProperties}
              />
              <span className={styles.participantName}>{participant.name}</span>
              {participant.id === currentUser.id && <span className={styles.youLabel}>(You)</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Controls Panel */}
      <div className={styles.controlsPanel}>
        <div className={styles.controlGroup}>
          <label>Search:</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search concepts..."
            className={styles.searchInput}
          />
        </div>

        <div className={styles.controlGroup}>
          <label>Categories:</label>
          {Object.values(ConceptCategory).map(category => (
            <label key={category} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCategories([...selectedCategories, category]);
                  } else {
                    setSelectedCategories(selectedCategories.filter(c => c !== category));
                  }
                }}
              />
              {category}
            </label>
          ))}
        </div>

        <div className={styles.controlGroup}>
          <label>Max Difficulty:</label>
          <select
            value={maxDifficulty}
            onChange={(e) => setMaxDifficulty(e.target.value as DifficultyLevel)}
            className={styles.difficultySelect}
            title="Select maximum difficulty level to display"
            aria-label="Maximum difficulty level"
          >
            {Object.values(DifficultyLevel).map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showPaths}
              onChange={(e) => setShowPaths(e.target.checked)}
            />
            Show Learning Paths
          </label>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showClusters}
              onChange={(e) => setShowClusters(e.target.checked)}
            />
            Show Clusters
          </label>
        </div>
      </div>

      {/* Main Visualization */}
      <div className={styles.visualizationContainer}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className={styles.conceptGraphSvg}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        
        {/* Collaborator Cursors Overlay */}
        {renderCollaboratorCursors}
        
        {/* Info Panel */}
        <div className={styles.infoPanel}>
          <div className={styles.networkStats}>
            <h4>Network Statistics</h4>
            <div>Concepts: {filteredConcepts.length}</div>
            <div>Relationships: {filteredRelationships.length}</div>
            <div>Selected: {selectedConcepts.length}</div>
          </div>
          
          <div className={styles.legend}>
            <h4>Legend</h4>
            <div className={styles.colorCodeSection}>🔵 Elliptic Curves</div>
            <div className={styles.colorCodeSection}>🟢 Topology</div>
            <div className={styles.colorCodeSection}>🟡 Number Theory</div>
            <div className={styles.colorCodeSection}>🟠 Abstract Algebra</div>
            <div className={styles.colorCodeSection}>🔴 Algebraic Geometry</div>
            <div className={styles.colorCodeFooter}>
              Collaborative features: Real-time cursor tracking, synchronized views, shared annotations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeMathematicalConceptGraph;
