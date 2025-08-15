'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GroupTheoryLibrary, 
  Group, 
  CayleyGraphGenerator, 
  CayleyGraph
} from '../lib/GroupTheory';
import '../css/cayley-explorer.css';

const EnhancedCayleyGraphExplorer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedGroup, setSelectedGroup] = useState<string>('C1');
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentGraph, setCurrentGraph] = useState<CayleyGraph | null>(null);
  const [selectedGenerators, setSelectedGenerators] = useState<string[]>([]);
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>('full');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showArrows, setShowArrows] = useState<boolean>(true);
  const [visualizationMode, setVisualizationMode] = useState<'2d' | '3d'>('2d');
  const [layoutAlgorithm, setLayoutAlgorithm] = useState<string>('default');
  const [highlightedElement, setHighlightedElement] = useState<string | undefined>();
  const [secondaryHighlightedElement, setSecondaryHighlightedElement] = useState<string | undefined>();
  const [layoutInfo, setLayoutInfo] = useState<string>('Initializing...');
  
  // Visualization states
  const [highlightSubgroups, setHighlightSubgroups] = useState<boolean>(false);
  
  // Interactive demonstration states
  const [demoMode, setDemoMode] = useState<'off' | 'group_operations' | 'subgroup_structure'>('off');
  const [demoStep, setDemoStep] = useState<number>(0);
  const [demonstrationResult, setDemonstrationResult] = useState<string>('');
  
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<{
    basic: boolean;
    advanced: boolean;
    display: boolean;
    demonstrations: boolean;
    performance: boolean;
    export: boolean;
  }>({
    basic: false,
    advanced: false,
    display: false,
    demonstrations: false,
    performance: false,
    export: false
  });

  // Performance metrics state
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    frameRate: number;
    lastFrameTime: number;
    renderTime: number;
    memoryUsage: number;
  }>({
    frameRate: 0,
    lastFrameTime: 0,
    renderTime: 0,
    memoryUsage: 0
  });

  // Section toggle helper
  const toggleSection = useCallback((section: 'basic' | 'advanced' | 'display' | 'demonstrations' | 'performance' | 'export') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Performance monitoring
  const updatePerformanceMetrics = useCallback(() => {
    if ('performance' in window) {
      const now = performance.now();
      
      if (performanceMetrics.lastFrameTime) {
        const frameTime = now - performanceMetrics.lastFrameTime;
        const frameRate = frameTime > 0 ? Math.round(1000 / frameTime) : 0;
        setPerformanceMetrics(prev => ({
          ...prev,
          frameRate,
          lastFrameTime: now
        }));
      } else {
        setPerformanceMetrics(prev => ({
          ...prev,
          lastFrameTime: now
        }));
      }
      
      // Update memory usage if available
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        const usedMemory = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        setPerformanceMetrics(prev => ({
          ...prev,
          memoryUsage: usedMemory
        }));
      }
    }
  }, [performanceMetrics.lastFrameTime]);

  // Update performance metrics periodically
  useEffect(() => {
    const interval = setInterval(updatePerformanceMetrics, 1000);
    return () => clearInterval(interval);
  }, [updatePerformanceMetrics]);

  // Load group when selection changes
  useEffect(() => {
    const group = GroupTheoryLibrary.getGroup(selectedGroup);
    console.log('🔍 Loading group:', selectedGroup);
    
    if (group) {
      setCurrentGroup(group);
      
      // Reset states when group changes
      setSelectedSubgroup('full');
      
      // Auto-select first generator for non-trivial groups
      if (group.generators.length > 0) {
        setSelectedGenerators([group.generators[0]]);
      } else {
        setSelectedGenerators([]);
      }
      setIsLoading(false);
    }
  }, [selectedGroup]);

  // Generate graph when group, generators, or subgroup change
  useEffect(() => {
    if (currentGroup) {
      console.log('📊 SMART LAYOUT ENGINE - Generating Cayley graph for:', currentGroup.name);
      
      // Keep the full group; highlight subgroups visually instead of filtering
      const groupToVisualize = currentGroup;
      
      // Special case for trivial group C1 which has no generators
      const generatorsToUse = currentGroup.generators.length === 0 ? [] : selectedGenerators;
      
      const graph = CayleyGraphGenerator.generateGraph(
        groupToVisualize, 
        generatorsToUse, 
        '2d',
        layoutAlgorithm
      );
      
      console.log('✅ Graph generated with', graph.edges.length, 'edges');
      setLayoutInfo(`Layout: ${layoutAlgorithm} • ${groupToVisualize.name} • ${graph.edges.length} edges`);
      setCurrentGraph(graph);
    }
  }, [currentGroup, selectedGenerators, selectedSubgroup, layoutAlgorithm]);



  // Handle vertex clicks
  const handleVertexClick = useCallback((vertexId: string) => {
    setHighlightedElement(vertexId);
  }, []);

  // Interactive demonstration functions
  const startGroupOperationDemo = useCallback(() => {
    if (!currentGroup) return;
    
    setDemoMode('group_operations');
    setDemoStep(0);
    setDemonstrationResult('');
    const identity = currentGroup.elements.find(e => e.order === 1)?.id;
    setHighlightedElement(identity);
    setSecondaryHighlightedElement(undefined);
    
    const step = 'Identity element demonstration';
    setDemonstrationResult(`Step 1: ${step} - Click on elements to explore properties`);
  }, [currentGroup]);

  const startSubgroupDemo = useCallback(() => {
    if (!currentGroup || !currentGroup.subgroups) return;
    
    setDemoMode('subgroup_structure');
    setDemoStep(0);
    setDemonstrationResult('');
    setHighlightSubgroups(true);
    
    if (currentGroup.subgroups.length > 0) {
      const subgroup = currentGroup.subgroups[0];
      setSelectedSubgroup('0');
      setDemonstrationResult(`Demonstrating subgroup: ${subgroup.name} (Order ${subgroup.elements.length})`);
    }
  }, [currentGroup]);

  const advanceDemo = useCallback(() => {
    if (demoMode === 'off') return;
    
    if (demoMode === 'group_operations') {
      const steps = [
        'Identity element demonstration',
        'Inverse element demonstration',
        'Associativity demonstration', 
        'Closure demonstration'
      ];
      
      const nextStep = (demoStep + 1) % steps.length;
      setDemoStep(nextStep);
      setDemonstrationResult(`Step ${nextStep + 1}: ${steps[nextStep]} - Click on elements to explore`);
      if (currentGroup) {
        if (nextStep === 0) {
          const identity = currentGroup.elements.find(e => e.order === 1)?.id;
          setHighlightedElement(identity);
          setSecondaryHighlightedElement(undefined);
        } else if (nextStep === 1) {
          const base = highlightedElement && highlightedElement !== (currentGroup.elements.find(e => e.order === 1)?.id)
            ? highlightedElement
            : currentGroup.generators[0] || currentGroup.elements[1]?.id;
          const inv = currentGroup.elements.find(e => e.id === base)?.inverse;
          setHighlightedElement(base);
          setSecondaryHighlightedElement(inv);
        } else {
          setSecondaryHighlightedElement(undefined);
        }
      }
    } else if (demoMode === 'subgroup_structure' && currentGroup?.subgroups) {
      const nextStep = (demoStep + 1) % currentGroup.subgroups.length;
      setDemoStep(nextStep);
      
      const subgroup = currentGroup.subgroups[nextStep];
      setSelectedSubgroup(nextStep.toString());
      setDemonstrationResult(`Subgroup ${nextStep + 1}: ${subgroup.name} (Order ${subgroup.elements.length}) - ${subgroup.isNormal ? 'Normal' : 'Non-normal'}`);
    }
  }, [demoMode, demoStep, currentGroup, highlightedElement]);

  const stopDemo = useCallback(() => {
    setDemoMode('off');
    setDemoStep(0);
    setDemonstrationResult('');
    setHighlightSubgroups(false);
    setSelectedSubgroup('full');
    setHighlightedElement(undefined);
    setSecondaryHighlightedElement(undefined);
  }, []);

  // Enhanced vertex click handler for demonstrations
  const enhancedVertexClick = useCallback((vertexId: string) => {
    if (demoMode === 'group_operations' && currentGroup) {
      const element = currentGroup.elements.find(e => e.id === vertexId);
      if (!element) return;
      
      switch (demoStep) {
        case 0: // Identity
          const isIdentity = element.id === currentGroup.elements[0].id;
          setDemonstrationResult(`${element.label} ${isIdentity ? 'IS' : 'is NOT'} the identity element. ${isIdentity ? 'e ∘ a = a ∘ e = a for all a' : 'Try the first element!'}`);
          break;
        case 1: // Inverse
          setDemonstrationResult(`Inverse of ${element.label} is ${currentGroup.elements.find(e => e.id === element.inverse)?.label || 'unknown'} (order: ${element.order})`);
          break;
        case 2: // Associativity
          setDemonstrationResult(`Associativity: (a ∘ b) ∘ c = a ∘ (b ∘ c) for all elements. Selected: ${element.label}`);
          break;
        case 3: // Closure
          const operations = currentGroup.operations.get(element.id);
          if (operations) {
            const samples = Array.from(operations.entries()).slice(0, 3);
            setDemonstrationResult(`Closure for ${element.label}: ${samples.map(([b, result]) => `${element.label}∘${currentGroup.elements.find(e => e.id === b)?.label}=${currentGroup.elements.find(e => e.id === result)?.label}`).join(', ')}`);
          }
          break;
      }
    } else {
      handleVertexClick(vertexId);
    }
  }, [demoMode, demoStep, currentGroup, handleVertexClick]);



  // Drawing function for 2D canvas
  const drawGraph = useCallback(() => {
    if (visualizationMode !== '2d') return;
    
    const canvas = canvasRef.current;
    if (!canvas || !currentGraph) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startTime = performance.now();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle background grid
    ctx.strokeStyle = '#f0f8ff';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw edges
    currentGraph.edges.forEach(edge => {
      const sourceVertex = currentGraph.vertices.find(v => v.id === edge.source);
      const targetVertex = currentGraph.vertices.find(v => v.id === edge.target);
      
      if (!sourceVertex || !targetVertex) return;

      ctx.strokeStyle = edge.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      
      ctx.beginPath();
      ctx.moveTo(sourceVertex.x, sourceVertex.y);
      ctx.lineTo(targetVertex.x, targetVertex.y);
      ctx.stroke();

      // Draw arrow if enabled
      if (showArrows) {
        const angle = Math.atan2(targetVertex.y - sourceVertex.y, targetVertex.x - sourceVertex.x);
        const arrowLength = 12;
        const nodeRadius = 25;
        const arrowX = targetVertex.x - nodeRadius * Math.cos(angle);
        const arrowY = targetVertex.y - nodeRadius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - arrowLength * Math.cos(angle - Math.PI / 6), 
          arrowY - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - arrowLength * Math.cos(angle + Math.PI / 6), 
          arrowY - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    });

    ctx.globalAlpha = 1;

    // Draw vertices with enhanced styling
    currentGraph.vertices.forEach(vertex => {
      const isSelected = false; // No point selection in finite group mode
      const isHighlighted = highlightedElement === vertex.id || secondaryHighlightedElement === vertex.id;
      
      let isInSubgroup = false;
      let subgroupColor = vertex.color;
      
      if (highlightSubgroups && currentGroup && selectedSubgroup !== 'full') {
        const subgroupIndex = parseInt(selectedSubgroup);
        const subgroup = currentGroup.subgroups?.[subgroupIndex];
        if (subgroup) {
          const element = currentGroup.elements.find(e => e.id === vertex.id);
          isInSubgroup = element ? subgroup.elements.includes(element.id) : false;
          if (isInSubgroup) {
            subgroupColor = subgroup.isNormal ? '#8e44ad' : '#e67e22';
          }
        }
      }
      
      let orderHighlight = false;
      // Order highlighting removed with elliptic curve support
      
      const gradient = ctx.createRadialGradient(vertex.x - 5, vertex.y - 5, 0, vertex.x, vertex.y, 25);
      gradient.addColorStop(0, '#ffffff');
      
      let finalColor = vertex.color;
      if (isSelected) {
        finalColor = '#e74c3c';
      } else if (isInSubgroup || orderHighlight) {
        finalColor = subgroupColor;
      }
      
      gradient.addColorStop(0.4, finalColor);
      gradient.addColorStop(1, finalColor);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      const radius = isSelected || isHighlighted ? 26 : (isInSubgroup ? 24 : 22);
      ctx.arc(vertex.x, vertex.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = isSelected ? '#e74c3c' : (isInSubgroup ? subgroupColor : '#2c3e50');
      ctx.lineWidth = isSelected ? 4 : (isInSubgroup ? 3.5 : 3);
      ctx.stroke();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, radius - 4, 0, 2 * Math.PI);
      ctx.stroke();
      
      if (isInSubgroup && highlightSubgroups) {
        ctx.strokeStyle = subgroupColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, radius + 6, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (secondaryHighlightedElement === vertex.id) {
        ctx.strokeStyle = '#ff7f0e';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, radius + 10, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Elliptic curve specific highlighting removed

      if (showLabels) {
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 2;
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(vertex.label, vertex.x, vertex.y);
        ctx.shadowBlur = 0;
      }
    });
    
    // Update render time
    const renderTime = performance.now() - startTime;
    setPerformanceMetrics(prev => ({
      ...prev,
      renderTime
    }));
  }, [currentGraph, showLabels, showArrows, visualizationMode, highlightedElement, secondaryHighlightedElement, highlightSubgroups, selectedSubgroup]);

  // Canvas click handler
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentGraph) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedVertex = currentGraph.vertices.find(vertex => {
      const distance = Math.sqrt(Math.pow(x - vertex.x, 2) + Math.pow(y - vertex.y, 2));
      return distance <= 26;
    });

    if (clickedVertex) {
      enhancedVertexClick(clickedVertex.id);
    }
  }, [currentGraph, enhancedVertexClick]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      drawGraph();
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [drawGraph]);

  const availableGroups = GroupTheoryLibrary.getAllGroups();

  console.log('Current Group:', currentGroup);
  if (currentGroup) {
    console.log('Subgroups:', currentGroup.subgroups);
  }

  return (
    <div className="cayley-explorer">
      <div className="cayley-header">
        <h1>Cayley Graph Explorer</h1>
        <p>Interactive exploration of group structures and Cayley graphs</p>
      </div>
      
      <div className="cayley-content">
        {isLoading ? (
          <div className="loading-indicator">
            <p>Loading Interactive Explorer...</p>
          </div>
        ) : (
          <>
        {/* Left Control Panel - Group Selection & Basic Controls */}
        <div className="cayley-controls">
          <h3>Group Selection & Controls</h3>
          
          {/* Basic Group Selection - Always Visible */}
          <div className="control-section">
            <h4>Group Selection</h4>
            <div className="form-group">
              <label htmlFor="group-select">Select Group</label>
              <select 
                id="group-select"
                value={selectedGroup} 
                onChange={(e) => setSelectedGroup(e.target.value)}
                title="Select a group to visualize"
              >
                {availableGroups.map(group => (
                  <option key={group.name} value={group.name}>
                    {group.displayName} (Order {group.order})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Generator Selection - Collapsible */}
          {currentGroup && (
            <div className="control-section collapsible">
              <button 
                className="section-header"
                onClick={() => toggleSection('basic')}
              >
                <span>Generators & Subgroups</span>
                <span className={`expand-icon ${expandedSections.basic ? 'expanded' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedSections.basic && (
                <div className="section-content">
                  <div className="form-group">
                    <label>Generators</label>
                    <div className="checkbox-group">
                      {currentGroup.generators.map(generator => (
                        <div key={generator} className="checkbox-item">
                          <input
                            type="checkbox"
                            id={`gen-${generator}`}
                            checked={selectedGenerators.includes(generator)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGenerators(prev => [...prev, generator]);
                              } else {
                                setSelectedGenerators(prev => prev.filter(g => g !== generator));
                              }
                            }}
                          />
                          <label htmlFor={`gen-${generator}`}>
                            {currentGroup.elements.find(e => e.id === generator)?.label || generator}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {currentGroup.subgroups && currentGroup.subgroups.length > 1 && (
                    <div className="form-group">
                      <label htmlFor="subgroup-select">Explore Subgroups</label>
                      <select
                        id="subgroup-select"
                        value={selectedSubgroup}
                        onChange={(e) => setSelectedSubgroup(e.target.value)}
                        title="Select subgroup to visualize cosets and structure"
                      >
                        <option value="full">Full Group ({currentGroup.displayName})</option>
                        {currentGroup.subgroups.map((subgroup, index) => (
                          <option key={index} value={index.toString()}>
                            {subgroup.name} (Order {subgroup.elements.length})
                            {subgroup.isNormal ? ' - Normal' : ' - Subgroup'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Export/Import Controls - Collapsible */}
          <div className="control-section collapsible">
            <button 
              className="section-header"
              onClick={() => toggleSection('export')}
            >
              <span>Export & Import</span>
              <span className={`expand-icon ${expandedSections.export ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.export && (
              <div className="section-content">
                <div className="export-section">
                  <div className="button-grid">
                    <button 
                      onClick={() => {
                        if (!currentGraph) return;
                        const data = {
                          metadata: {
                            generated: new Date().toISOString(),
                            groupName: currentGroup?.name,
                            groupOrder: currentGroup?.order,
                            generators: selectedGenerators,
                            subgroup: selectedSubgroup
                          },
                          graph: {
                            vertices: currentGraph.vertices,
                            edges: currentGraph.edges
                          }
                        };
                        const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(jsonBlob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `cayley-graph-${currentGroup?.name}-${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="btn btn-secondary"
                      disabled={!currentGraph}
                    >
                      Export Graph (JSON)
                    </button>
                    <button 
                      onClick={() => {
                        if (!currentGraph) return;
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return;
                        
                        const scale = 2;
                        canvas.width = 1200 * scale;
                        canvas.height = 800 * scale;
                        ctx.scale(scale, scale);
                        
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, 1200, 800);
                        
                        ctx.fillStyle = '#1f2937';
                        ctx.font = 'bold 32px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('Cayley Graph Visualization', 600, 50);
                        
                        ctx.fillStyle = '#6b7280';
                        ctx.font = '18px Arial';
                        ctx.textAlign = 'left';
                        ctx.fillText(`Generated: ${new Date().toLocaleString()}`, 50, 100);
                        ctx.fillText(`Group: ${currentGroup?.displayName}`, 50, 130);
                        ctx.fillText(`Order: ${currentGroup?.order}`, 50, 160);
                        ctx.fillText(`Vertices: ${currentGraph.vertices.length}`, 50, 190);
                        ctx.fillText(`Edges: ${currentGraph.edges.length}`, 50, 220);
                        
                        const url = canvas.toDataURL('image/png');
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `cayley-graph-${currentGroup?.name}-${new Date().toISOString().split('T')[0]}.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                      className="btn btn-success"
                      disabled={!currentGraph}
                    >
                      Export Screenshot
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Group Information - Always Visible */}
          {currentGroup && (
            <div className="control-section">
              <h4>Group Properties</h4>
              <div className="status-info">
                <div className="status-item">
                  <span className="status-label">Order:</span>
                  <span className="status-value">{currentGroup.order}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Abelian:</span>
                  <span className="status-value">{currentGroup.isAbelian ? 'Yes' : 'No'}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Center:</span>
                  <span className="status-value">|{currentGroup.center.length}|</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Generators:</span>
                  <span className="status-value">{currentGroup.generators.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Elliptic Curve Information */}
          <div className="control-section">
            <h4>Elliptic Curves</h4>
            <div className="status-info">
              <p className="info-text">
                For specialized elliptic curve visualization and group operations, 
                please visit our dedicated <strong>Elliptic Curve Explorer</strong>.
              </p>
              <div className="status-item">
                <span className="status-label">Features:</span>
                <span className="status-value">Curve Geometry</span>
              </div>
              <div className="status-item">
                <span className="status-label"></span>
                <span className="status-value">Point Addition</span>
              </div>
              <div className="status-item">
                <span className="status-label"></span>
                <span className="status-value">Group Structure</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Center Visualization Area */}
        <div className="visualization-container">
          <div className="visualization-header">
            <h3>Cayley Graph Visualization</h3>
            <p>Interactive 2D visualization with enhanced layout engine</p>
          </div>
          
          <div className="canvas-container">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="cursor-pointer"
              onClick={handleCanvasClick}
            />
            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
              🚀 Enhanced 2D v2.1
            </div>
          </div>
          
          {currentGraph && (
            <div className="status-info">
              <div className="status-item">
                <span className="status-label">Edges:</span>
                <span className="status-value">{currentGraph.edges.length}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Vertices:</span>
                <span className="status-value">{currentGraph.vertices.length}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Layout:</span>
                <span className="status-value">{layoutInfo}</span>
              </div>
            </div>
          )}
          
          {/* Demonstration Results */}
          {demonstrationResult && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-800">Interactive Demonstration</span>
              </div>
              <div className="text-sm text-yellow-700">
                {demonstrationResult}
              </div>
              {demoMode !== 'off' && (
                <div className="text-xs text-yellow-600 mt-1">
                  Mode: {demoMode.replace('_', ' ')} | Step: {demoStep + 1}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Right Control Panel - Display Options & Advanced Features */}
        <div className="cayley-right-controls">
          <h3>Display & Advanced Options</h3>
          
          {/* Display Options - Collapsible */}
          <div className="control-section collapsible">
            <button 
              className="section-header"
              onClick={() => toggleSection('display')}
            >
              <span>Display Options</span>
              <span className={`expand-icon ${expandedSections.display ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.display && (
              <div className="section-content">
                <div className="checkbox-group">
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="show-labels"
                      checked={showLabels}
                      onChange={(e) => setShowLabels(e.target.checked)}
                    />
                    <label htmlFor="show-labels">Show Labels</label>
                  </div>
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="show-arrows"
                      checked={showArrows}
                      onChange={(e) => setShowArrows(e.target.checked)}
                    />
                    <label htmlFor="show-arrows">Show Arrows</label>
                  </div>
                  <div className="checkbox-item">
                    <input
                      type="checkbox"
                      id="highlight-subgroups"
                      checked={highlightSubgroups}
                      onChange={(e) => setHighlightSubgroups(e.target.checked)}
                    />
                    <label htmlFor="highlight-subgroups">Highlight Subgroups</label>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="visualization-mode">Visualization Mode</label>
                  <select
                    id="visualization-mode"
                    value={visualizationMode}
                    onChange={(e) => setVisualizationMode(e.target.value as '2d' | '3d')}
                  >
                    <option value="2d">2D Enhanced</option>
                    <option value="3d">3D Interactive (Coming Soon)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="layout-algorithm">Layout Algorithm</label>
                  <select
                    id="layout-algorithm"
                    value={layoutAlgorithm}
                    onChange={(e) => setLayoutAlgorithm(e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="circular">Circular</option>
                    <option value="grid">Grid</option>
                    <option value="force-directed">Force-Directed (soon)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          {/* Interactive Demonstrations - Collapsible */}
          <div className="control-section collapsible">
            <button 
              className="section-header"
              onClick={() => toggleSection('demonstrations')}
            >
              <span>Interactive Demonstrations</span>
              <span className={`expand-icon ${expandedSections.demonstrations ? 'expanded' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.demonstrations && (
              <div className="section-content">
                <div className="button-grid">
                  <button
                    onClick={startGroupOperationDemo}
                    disabled={!currentGroup || demoMode !== 'off'}
                    className="btn btn-primary"
                  >
                    🎓 Group Properties Demo
                  </button>
                  
                  {currentGroup?.subgroups && currentGroup.subgroups.length > 0 && (
                    <button
                      onClick={startSubgroupDemo}
                      disabled={demoMode !== 'off'}
                      className="btn btn-primary"
                    >
                      🔍 Subgroup Structure Demo
                    </button>
                  )}
                  
                  {demoMode !== 'off' && (
                    <>
                      <button
                        onClick={advanceDemo}
                        className="btn btn-success"
                      >
                        ▶️ Next Step
                      </button>
                      <button
                        onClick={stopDemo}
                        className="btn btn-secondary"
                      >
                        ⏹️ Stop Demo
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Enhanced Performance Monitoring Section - Compact Style */}
          <div className="control-section compact-info">
            <h4>Status & Performance</h4>
            <div className="compact-metrics">
              <div className="metric-row">
                <span className="metric-label">Vertices:</span>
                <span className="metric-value">{currentGraph?.vertices.length || 0}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Edges:</span>
                <span className="metric-value">{currentGraph?.edges.length || 0}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Group Order:</span>
                <span className="metric-value">{currentGroup?.order || 0}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Memory:</span>
                <span className="metric-value">{performanceMetrics.memoryUsage}MB</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Frame Rate:</span>
                <span className={`metric-value ${performanceMetrics.frameRate < 30 ? 'warning' : ''}`}>
                  {performanceMetrics.frameRate} FPS
                </span>
              </div>
              {performanceMetrics.renderTime > 0 && (
                <div className="metric-row">
                  <span className="metric-label">Render:</span>
                  <span className="metric-value">{performanceMetrics.renderTime.toFixed(0)}ms</span>
                </div>
              )}
            </div>
            
            {/* Performance Warnings */}
            {performanceMetrics.frameRate < 30 && performanceMetrics.frameRate > 0 && (
              <div className="performance-warning">
                <span className="warning-icon">⚠️</span>
                <span className="warning-text">Low frame rate detected</span>
              </div>
            )}
            {performanceMetrics.memoryUsage > 100 && (
              <div className="performance-warning">
                <span className="warning-icon">⚠️</span>
                <span className="warning-text">High memory usage</span>
              </div>
            )}
            
            {/* Performance Optimization Hints */}
            {currentGraph && currentGraph.edges.length > 50 && (
              <div className="performance-hint">
                <strong>Large Graph:</strong> Complex graph with {currentGraph.edges.length} edges may impact performance.
              </div>
            )}
            {performanceMetrics.renderTime > 16 && (
              <div className="performance-hint">
                <strong>Performance Tip:</strong> Consider reducing visual complexity for smoother rendering.
              </div>
            )}
          </div>
          
          {/* Compact Graph Legend */}
          <div className="control-section compact-legend">
            <h4>Visual Legend</h4>
            <div className="compact-legend-items">
              <div className="legend-row">
                <span className="legend-color legend-color-identity"></span>
                <span>Identity Element</span>
              </div>
              <div className="legend-row">
                <span className="legend-color legend-color-generator"></span>
                <span>Generator</span>
              </div>
              {highlightSubgroups && (
                <div className="legend-row">
                  <span className="legend-color legend-color-subgroup"></span>
                  <span>Subgroup Member</span>
                </div>
              )}
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default EnhancedCayleyGraphExplorer;
