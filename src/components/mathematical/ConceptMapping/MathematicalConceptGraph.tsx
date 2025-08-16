/**
 * MathematicalConceptGraph.tsx
 * 
 * Main React component for interactive mathematical concept mapping visualization.
 * Implements Task 7.2: Build Concept Mapping Interface
 * 
 * Features:
 * - Force-directed graph layout using D3.js to visualize mathematical concepts
 * - Interactive controls for filtering by category and difficulty
 * - Hover and click interactions with detailed concept tooltips
 * - Pan, zoom, and drag functionality for exploration
 * - Educational pathways and learning progression visualization
 */

'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  ConceptForceSimulation, 
  ConceptNode, 
  ConceptLink,
  DEFAULT_CONCEPT_SIMULATION_CONFIG,
  ConceptSimulationConfig
} from './ConceptForceSimulation';
import { 
  MathematicalConcept, 
  ConceptRelationship, 
  ConceptCategory, 
  DifficultyLevel,
  RelationshipType
} from './types';
import { sampleConcepts, sampleRelationships } from './sampleData';

interface MathematicalConceptGraphProps {
  /** Custom concepts to display (optional, defaults to sample data) */
  concepts?: MathematicalConcept[];
  /** Custom relationships between concepts (optional, defaults to sample data) */
  relationships?: ConceptRelationship[];
  /** Width of the visualization container */
  width?: number;
  /** Height of the visualization container */
  height?: number;
  /** Custom simulation configuration */
  simulationConfig?: Partial<ConceptSimulationConfig>;
  /** Callback when concept is selected */
  onConceptSelect?: (concept: MathematicalConcept | null) => void;
  /** Callback when learning path is requested */
  onLearningPath?: (startConcept: string, endConcept: string) => void;
  /** Show/hide various UI elements */
  showControls?: boolean;
  showStatistics?: boolean;
  showLegend?: boolean;
  /** Educational mode settings */
  maxDifficultyLevel?: DifficultyLevel;
  allowedCategories?: ConceptCategory[];
}

interface FilterState {
  categories: Set<ConceptCategory>;
  maxDifficulty: DifficultyLevel;
  searchText: string;
}

interface ViewState {
  selectedConceptId: string | null;
  highlightedNodes: Set<string>;
  highlightedLinks: Set<string>;
  showNodeLabels: boolean;
  showRelationshipLabels: boolean;
  animationSpeed: number;
}

export const MathematicalConceptGraph: React.FC<MathematicalConceptGraphProps> = ({
  concepts = sampleConcepts,
  relationships = sampleRelationships,
  width = 1000,
  height = 700,
  simulationConfig = {},
  onConceptSelect,
  onLearningPath,
  showControls = true,
  showStatistics = true,
  showLegend = true,
  maxDifficultyLevel = DifficultyLevel.RESEARCH,
  allowedCategories = Object.values(ConceptCategory)
}) => {
  // Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<ConceptForceSimulation | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [filterState, setFilterState] = useState<FilterState>({
    categories: new Set(allowedCategories),
    maxDifficulty: maxDifficultyLevel,
    searchText: ''
  });

  const [viewState, setViewState] = useState<ViewState>({
    selectedConceptId: null,
    highlightedNodes: new Set(),
    highlightedLinks: new Set(),
    showNodeLabels: true,
    showRelationshipLabels: false,
    animationSpeed: 1.0
  });

  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  // Memoized simulation configuration
  const config = useMemo((): ConceptSimulationConfig => ({
    ...DEFAULT_CONCEPT_SIMULATION_CONFIG,
    width,
    height,
    ...simulationConfig
  }), [width, height, simulationConfig]);

  // Filtered data based on current filter state
  const filteredData = useMemo(() => {
    let filteredConcepts = concepts.filter(concept => 
      filterState.categories.has(concept.category) &&
      getDifficultyOrder().indexOf(concept.difficulty) <= getDifficultyOrder().indexOf(filterState.maxDifficulty)
    );

    if (filterState.searchText) {
      const searchLower = filterState.searchText.toLowerCase();
      filteredConcepts = filteredConcepts.filter(concept =>
        concept.name.toLowerCase().includes(searchLower) ||
        concept.displayName.toLowerCase().includes(searchLower) ||
        concept.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
      );
    }

    const conceptIds = new Set(filteredConcepts.map(c => c.id));
    const filteredRelationships = relationships.filter(rel =>
      conceptIds.has(rel.source) && conceptIds.has(rel.target)
    );

    return { concepts: filteredConcepts, relationships: filteredRelationships };
  }, [concepts, relationships, filterState]);

  // Utility function for difficulty ordering
  const getDifficultyOrder = () => [
    DifficultyLevel.INTRODUCTORY,
    DifficultyLevel.INTERMEDIATE,
    DifficultyLevel.ADVANCED,
    DifficultyLevel.RESEARCH
  ];

  // Initialize simulation
  useEffect(() => {
    if (!svgRef.current) return;

    simulationRef.current = new ConceptForceSimulation(config);
    simulationRef.current.updateData(filteredData.concepts, filteredData.relationships);

    return () => {
      simulationRef.current?.destroy();
      simulationRef.current = null;
    };
  }, [config]);

  // Update simulation data when filtered data changes
  useEffect(() => {
    if (!simulationRef.current) return;
    
    simulationRef.current.updateData(filteredData.concepts, filteredData.relationships);
    setIsSimulationRunning(true);
    simulationRef.current.start();

    const timeout = setTimeout(() => {
      setIsSimulationRunning(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [filteredData]);

  // D3 visualization effect
  useEffect(() => {
    if (!svgRef.current || !simulationRef.current) return;

    const svg = d3.select(svgRef.current);
    const simulation = simulationRef.current;
    
    // Clear previous content
    svg.selectAll("*").remove();

    // Create main group for zoom/pan
    const mainGroup = svg.append("g").attr("class", "main-group");

    // Add background
    mainGroup.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#fafafa")
      .attr("stroke", "#e2e8f0")
      .attr("rx", 8);

    // Set up zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on("zoom", (event) => {
        mainGroup.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    // Get nodes and links from simulation
    const nodes = simulation.getNodes();
    const links = simulation.getLinks();

    // Create links
    const linkGroup = mainGroup.append("g").attr("class", "links");
    const link = linkGroup.selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", d => d.strokeColor)
      .attr("stroke-width", d => d.strokeWidth)
      .attr("stroke-opacity", 0.7)
      .attr("stroke-dasharray", d => d.strokeDasharray || null)
      .attr("stroke-linecap", "round");

    // Add relationship labels if enabled
    let relationshipLabels: d3.Selection<SVGTextElement, ConceptLink, SVGGElement, unknown>;
    if (viewState.showRelationshipLabels) {
      relationshipLabels = mainGroup.append("g")
        .attr("class", "relationship-labels")
        .selectAll("text")
        .data(links)
        .enter()
        .append("text")
        .attr("class", "relationship-label")
        .style("font-size", "10px")
        .style("fill", "#64748b")
        .style("pointer-events", "none")
        .style("text-anchor", "middle")
        .text(d => d.relationship.type);
    }

    // Create nodes
    const nodeGroup = mainGroup.append("g").attr("class", "nodes");
    const node = nodeGroup.selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer");

    // Add node circles
    node.append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => d.color)
      .attr("stroke", d => viewState.selectedConceptId === d.id ? "#1f2937" : "#fff")
      .attr("stroke-width", d => viewState.selectedConceptId === d.id ? 4 : 2)
      .attr("opacity", d => {
        if (viewState.highlightedNodes.size === 0) return 1;
        return viewState.highlightedNodes.has(d.id) ? 1 : 0.3;
      });

    // Add node labels if enabled
    if (viewState.showNodeLabels) {
      node.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .style("fill", "#fff")
        .style("pointer-events", "none")
        .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
        .text(d => d.concept.displayName);
    }

    // Add interaction behaviors
    const drag = d3.drag<SVGGElement, ConceptNode>()
      .on("start", (event, d) => {
        if (!event.active && simulationRef.current) {
          simulationRef.current.restart();
          setIsSimulationRunning(true);
        }
        simulation.pinNode(d.id, d.x!, d.y!);
      })
      .on("drag", (event, d) => {
        simulation.pinNode(d.id, event.x, event.y);
      })
      .on("end", (event, d) => {
        if (!event.active) {
          setIsSimulationRunning(false);
        }
        simulation.unpinNode(d.id);
      });

    node.call(drag);

    // Mouse interactions
    node
      .on("mouseover", function(event, d) {
        // Highlight connections
        const { nodes: connectedNodes, links: connectedLinks } = simulation.highlightConnections(d.id);
        setViewState(prev => ({
          ...prev,
          highlightedNodes: connectedNodes,
          highlightedLinks: connectedLinks
        }));

        // Show enhanced tooltip
        showTooltip(event, d);
      })
      .on("mouseout", function() {
        setViewState(prev => ({
          ...prev,
          highlightedNodes: new Set(),
          highlightedLinks: new Set()
        }));
        hideTooltip();
      })
      .on("click", function(event, d) {
        event.stopPropagation();
        const newSelectedId = viewState.selectedConceptId === d.id ? null : d.id;
        setViewState(prev => ({ ...prev, selectedConceptId: newSelectedId }));
        onConceptSelect?.(newSelectedId ? d.concept : null);
      });

    // Background click to deselect
    svg.on("click", () => {
      setViewState(prev => ({ ...prev, selectedConceptId: null }));
      onConceptSelect?.(null);
    });

    // Update positions on simulation tick
    simulation.onTick(() => {
      link
        .attr("x1", d => (d.source as ConceptNode).x!)
        .attr("y1", d => (d.source as ConceptNode).y!)
        .attr("x2", d => (d.target as ConceptNode).x!)
        .attr("y2", d => (d.target as ConceptNode).y!);

      if (viewState.showRelationshipLabels && relationshipLabels) {
        relationshipLabels
          .attr("x", d => ((d.source as ConceptNode).x! + (d.target as ConceptNode).x!) / 2)
          .attr("y", d => ((d.source as ConceptNode).y! + (d.target as ConceptNode).y!) / 2);
      }

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    simulation.onEnd(() => {
      setIsSimulationRunning(false);
    });

    // Add zoom controls
    const zoomControls = mainGroup.append("g")
      .attr("class", "zoom-controls")
      .attr("transform", `translate(${width - 80}, 20)`);

    // Zoom in button
    const zoomInButton = zoomControls.append("g")
      .style("cursor", "pointer")
      .on("click", () => svg.transition().call(zoom.scaleBy, 1.5));

    zoomInButton.append("circle")
      .attr("r", 18)
      .attr("fill", "rgba(255,255,255,0.9)")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 2);

    zoomInButton.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#374151")
      .style("pointer-events", "none")
      .text("+");

    // Zoom out button  
    const zoomOutButton = zoomControls.append("g")
      .attr("transform", "translate(0, 45)")
      .style("cursor", "pointer")
      .on("click", () => svg.transition().call(zoom.scaleBy, 0.67));

    zoomOutButton.append("circle")
      .attr("r", 18)
      .attr("fill", "rgba(255,255,255,0.9)")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 2);

    zoomOutButton.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#374151")
      .style("pointer-events", "none")
      .text("−");

    // Reset zoom button
    const resetButton = zoomControls.append("g")
      .attr("transform", "translate(0, 90)")
      .style("cursor", "pointer")
      .on("click", () => svg.transition().call(zoom.transform, d3.zoomIdentity));

    resetButton.append("circle")
      .attr("r", 18)
      .attr("fill", "rgba(255,255,255,0.9)")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 2);

    resetButton.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#374151")
      .style("pointer-events", "none")
      .text("⌂");

    return () => {
      simulation.stop();
    };

  }, [filteredData, viewState, width, height]);

  // Tooltip functions
  const showTooltip = useCallback((event: MouseEvent, node: ConceptNode) => {
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "concept-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.9)")
      .style("color", "white")
      .style("padding", "12px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    tooltip.html(`
      <div style="font-weight: bold; margin-bottom: 8px;">${node.concept.displayName}</div>
      <div style="margin-bottom: 4px;"><strong>Category:</strong> ${node.concept.category}</div>
      <div style="margin-bottom: 4px;"><strong>Difficulty:</strong> ${node.concept.difficulty}</div>
      <div style="margin-bottom: 8px;"><strong>Definition:</strong></div>
      <div style="margin-bottom: 8px; max-width: 300px;">${node.concept.definition}</div>
      <div style="font-size: 10px; color: #ccc;">Click for details • Drag to move</div>
    `);

    tooltip.transition()
      .duration(200)
      .style("opacity", 1)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 10) + "px");
  }, []);

  const hideTooltip = useCallback(() => {
    d3.selectAll(".concept-tooltip").remove();
  }, []);

  // Category filter handlers
  const handleCategoryToggle = useCallback((category: ConceptCategory) => {
    setFilterState(prev => {
      const newCategories = new Set(prev.categories);
      if (newCategories.has(category)) {
        newCategories.delete(category);
      } else {
        newCategories.add(category);
      }
      return { ...prev, categories: newCategories };
    });
  }, []);

  // Difficulty filter handler
  const handleDifficultyChange = useCallback((difficulty: DifficultyLevel) => {
    setFilterState(prev => ({ ...prev, maxDifficulty: difficulty }));
  }, []);

  // Search handler
  const handleSearchChange = useCallback((searchText: string) => {
    setFilterState(prev => ({ ...prev, searchText }));
  }, []);

  // Learning path finder
  const findLearningPath = useCallback((startId: string, endId: string) => {
    if (!simulationRef.current) return;
    
    const path = simulationRef.current.findShortestPath(startId, endId);
    if (path) {
      console.log('Learning path found:', path.map(n => n.concept.displayName));
      onLearningPath?.(startId, endId);
    } else {
      console.log('No learning path found between concepts');
    }
  }, [onLearningPath]);

  return (
    <div 
      ref={containerRef}
      className="mathematical-concept-graph"
      style={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Control Panel */}
      {showControls && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center'
        }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Search:</label>
            <input
              type="text"
              value={filterState.searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search concepts..."
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Category Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Categories:</label>
            {Object.values(ConceptCategory).map(category => (
              <label key={category} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <input
                  type="checkbox"
                  checked={filterState.categories.has(category)}
                  onChange={() => handleCategoryToggle(category)}
                />
                {category.replace('_', ' ')}
              </label>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Max Difficulty:</label>
            <select
              value={filterState.maxDifficulty}
              onChange={(e) => handleDifficultyChange(e.target.value as DifficultyLevel)}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              {getDifficultyOrder().map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* View Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={viewState.showNodeLabels}
                onChange={(e) => setViewState(prev => ({ ...prev, showNodeLabels: e.target.checked }))}
              />
              Node Labels
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
              <input
                type="checkbox"
                checked={viewState.showRelationshipLabels}
                onChange={(e) => setViewState(prev => ({ ...prev, showRelationshipLabels: e.target.checked }))}
              />
              Relationship Labels
            </label>
          </div>
        </div>
      )}

      {/* Main Visualization */}
      <div style={{ flex: 1, position: 'relative' }}>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{ display: 'block' }}
        />

        {/* Statistics Panel */}
        {showStatistics && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            backgroundColor: 'rgba(255,255,255,0.95)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
            minWidth: '200px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Network Statistics</div>
            <div>Concepts: {filteredData.concepts.length}</div>
            <div>Relationships: {filteredData.relationships.length}</div>
            <div>Zoom Level: {zoomLevel.toFixed(1)}x</div>
            <div>Status: {isSimulationRunning ? 'Running' : 'Stable'}</div>
          </div>
        )}

        {/* Legend */}
        {showLegend && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            backgroundColor: 'rgba(255,255,255,0.95)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Legend</div>
            <div style={{ marginBottom: '4px' }}>🔵 Elliptic Curves</div>
            <div style={{ marginBottom: '4px' }}>🟢 Topology</div>
            <div style={{ marginBottom: '4px' }}>🟡 Number Theory</div>
            <div style={{ marginBottom: '4px' }}>🟠 Abstract Algebra</div>
            <div style={{ marginBottom: '4px' }}>🔴 Algebraic Geometry</div>
            <div style={{ marginTop: '8px', fontSize: '10px', color: '#666' }}>
              Drag nodes • Scroll to zoom • Click to select
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathematicalConceptGraph;
