'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GroupTheoryLibrary, 
  Group, 
  CayleyGraphGenerator, 
  CayleyGraph, 
  CayleyGraphVertex, 
  CayleyGraphEdge 
} from '../lib/GroupTheory';

interface VisualizationSettings {
  layout: '2d' | '3d';
  showLabels: boolean;
  showArrows: boolean;
  nodeSize: number;
  edgeWidth: number;
  highlightConjugacyClasses: boolean;
  highlightSubgroups: boolean;
  animateMultiplication: boolean;
}

interface MultiplicationState {
  element1: string | null;
  element2: string | null;
  result: string | null;
  isAnimating: boolean;
}

const EnhancedCayleyGraphExplorer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  
  // State
  const [selectedGroup, setSelectedGroup] = useState<string>('S3');
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [currentGraph, setCurrentGraph] = useState<CayleyGraph | null>(null);
  const [selectedGenerators, setSelectedGenerators] = useState<string[]>([]);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [multiplicationState, setMultiplicationState] = useState<MultiplicationState>({
    element1: null,
    element2: null,
    result: null,
    isAnimating: false
  });
  
  const [settings, setSettings] = useState<VisualizationSettings>({
    layout: '2d',
    showLabels: true,
    showArrows: true,
    nodeSize: 20,
    edgeWidth: 2,
    highlightConjugacyClasses: false,
    highlightSubgroups: false,
    animateMultiplication: false
  });

  // Initialize group when selection changes
  useEffect(() => {
    const group = GroupTheoryLibrary.getGroup(selectedGroup);
    if (group) {
      setCurrentGroup(group);
      setSelectedGenerators(group.generators.slice(0, 2)); // Start with first 2 generators
      setSelectedElement(null);
      setMultiplicationState({
        element1: null,
        element2: null,
        result: null,
        isAnimating: false
      });
    }
  }, [selectedGroup]);

  // Generate graph when group or generators change
  useEffect(() => {
    if (currentGroup && selectedGenerators.length > 0) {
      console.log('=== Generating Cayley graph ===');
      console.log('Group:', currentGroup.name, 'Order:', currentGroup.order);
      console.log('Elements:', currentGroup.elements.map(e => `${e.id}(${e.label})`));
      console.log('Selected generators:', selectedGenerators);
      
      // Test multiplication table for generators
      console.log('Testing generator operations:');
      for (const gen of selectedGenerators) {
        console.log(`Generator ${gen}:`);
        for (const elem of currentGroup.elements) {
          const result = currentGroup.operations.get(elem.id)?.get(gen);
          console.log(`  ${elem.id} * ${gen} = ${result}`);
        }
      }
      
      const graph = CayleyGraphGenerator.generateGraph(
        currentGroup, 
        selectedGenerators, 
        settings.layout
      );
      
      console.log('Generated graph:');
      console.log('Vertices:', graph.vertices.length);
      console.log('Edges:', graph.edges.length);
      console.log('All edges:', graph.edges);
      
      setCurrentGraph(graph);
    } else {
      console.log('Cannot generate graph:', {
        hasGroup: !!currentGroup,
        hasGenerators: selectedGenerators.length > 0,
        generators: selectedGenerators
      });
    }
  }, [currentGroup, selectedGenerators, settings.layout]);

  // Drawing functions
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentGraph) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    currentGraph.edges.forEach(edge => {
      const sourceVertex = currentGraph.vertices.find(v => v.id === edge.source);
      const targetVertex = currentGraph.vertices.find(v => v.id === edge.target);
      
      if (!sourceVertex || !targetVertex) return;

      // Edge styling
      ctx.strokeStyle = edge.highlighted ? '#f39c12' : edge.color;
      ctx.lineWidth = edge.highlighted ? settings.edgeWidth * 2 : settings.edgeWidth;
      ctx.globalAlpha = edge.highlighted ? 1 : 0.8;
      
      // Draw edge
      ctx.beginPath();
      ctx.moveTo(sourceVertex.x, sourceVertex.y);
      ctx.lineTo(targetVertex.x, targetVertex.y);
      ctx.stroke();

      // Draw arrow if enabled
      if (settings.showArrows) {
        const angle = Math.atan2(targetVertex.y - sourceVertex.y, targetVertex.x - sourceVertex.x);
        const arrowLength = 12;
        const nodeRadius = (targetVertex.size || settings.nodeSize) + 5;
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

    // Draw vertices
    currentGraph.vertices.forEach(vertex => {
      const isHovered = hoveredElement === vertex.id;
      const isSelected = selectedElement === vertex.id;
      const isInMultiplication = multiplicationState.element1 === vertex.id || 
                                multiplicationState.element2 === vertex.id ||
                                multiplicationState.result === vertex.id;
      
      // Vertex styling
      let fillColor = vertex.color;
      let strokeColor = '#2c3e50';
      let radius = vertex.size || settings.nodeSize;
      
      if (isSelected) {
        strokeColor = '#e74c3c';
        radius *= 1.2;
      } else if (isHovered) {
        fillColor = '#f39c12';
        radius *= 1.1;
      } else if (isInMultiplication) {
        strokeColor = '#8e44ad';
        radius *= 1.15;
      }

      // Draw vertex
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = isSelected ? 4 : 2;
      
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Draw label if enabled
      if (settings.showLabels) {
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.max(12, radius * 0.6)}px 'Courier New', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 0.5;
        ctx.strokeText(vertex.label, vertex.x, vertex.y);
        ctx.fillText(vertex.label, vertex.x, vertex.y);
      }
    });

    // Draw multiplication visualization
    if (multiplicationState.isAnimating && multiplicationState.element1 && multiplicationState.element2) {
      drawMultiplicationVisualization(ctx);
    }
  }, [currentGraph, hoveredElement, selectedElement, multiplicationState, settings]);

  const drawMultiplicationVisualization = (ctx: CanvasRenderingContext2D) => {
    // Implementation for animated multiplication visualization
    // This would show the path from element1 through element2 to result
  };

  // Event handlers
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentGraph) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked vertex
    const clickedVertex = currentGraph.vertices.find(vertex => {
      const distance = Math.sqrt((x - vertex.x) ** 2 + (y - vertex.y) ** 2);
      return distance <= (vertex.size || settings.nodeSize);
    });

    if (clickedVertex) {
      if (event.shiftKey && currentGroup) {
        // Shift+click for multiplication
        handleMultiplicationClick(clickedVertex.id);
      } else {
        setSelectedElement(selectedElement === clickedVertex.id ? null : clickedVertex.id);
        highlightConnectedEdges(clickedVertex.id);
      }
    } else {
      setSelectedElement(null);
      clearHighlights();
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentGraph) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find hovered vertex
    const hoveredVertex = currentGraph.vertices.find(vertex => {
      const distance = Math.sqrt((x - vertex.x) ** 2 + (y - vertex.y) ** 2);
      return distance <= (vertex.size || settings.nodeSize);
    });

    setHoveredElement(hoveredVertex?.id || null);
  };

  const handleMultiplicationClick = (elementId: string) => {
    if (!multiplicationState.element1) {
      setMultiplicationState(prev => ({ ...prev, element1: elementId }));
    } else if (!multiplicationState.element2) {
      setMultiplicationState(prev => ({ ...prev, element2: elementId }));
      // Calculate result
      if (currentGroup) {
        const result = currentGroup.operations.get(multiplicationState.element1)?.get(elementId);
        if (result) {
          setMultiplicationState(prev => ({ ...prev, result, isAnimating: settings.animateMultiplication }));
        }
      }
    } else {
      // Reset
      setMultiplicationState({
        element1: elementId,
        element2: null,
        result: null,
        isAnimating: false
      });
    }
  };

  const highlightConnectedEdges = (elementId: string) => {
    if (!currentGraph) return;
    
    // Highlight edges connected to the selected element
    const updatedGraph = {
      ...currentGraph,
      edges: currentGraph.edges.map(edge => ({
        ...edge,
        highlighted: edge.source === elementId || edge.target === elementId
      }))
    };
    setCurrentGraph(updatedGraph);
  };

  const clearHighlights = () => {
    if (!currentGraph) return;
    
    const updatedGraph = {
      ...currentGraph,
      edges: currentGraph.edges.map(edge => ({
        ...edge,
        highlighted: false
      }))
    };
    setCurrentGraph(updatedGraph);
  };

  const handleGeneratorToggle = (generator: string) => {
    setSelectedGenerators(prev => 
      prev.includes(generator) 
        ? prev.filter(g => g !== generator)
        : [...prev, generator]
    );
  };

  // Animation loop
  useEffect(() => {
    const animate = () => {
      drawGraph();
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawGraph]);

  // Get available groups
  const availableGroups = GroupTheoryLibrary.getGroupNames();

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Interactive Cayley Graph Explorer</h2>
        <p className="text-gray-600 mb-4">
          Explore finite groups up to order 20 with interactive Cayley graphs. 
          Click elements to highlight connections, Shift+click for multiplication.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {/* Group Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
            <select 
              value={selectedGroup} 
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableGroups.map(groupName => {
                const group = GroupTheoryLibrary.getGroup(groupName);
                return (
                  <option key={groupName} value={groupName}>
                    {group?.displayName || groupName} (Order {group?.order})
                  </option>
                );
              })}
            </select>
          </div>
          
          {/* Generator Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Generators</label>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {currentGroup?.generators.map((generator, index) => {
                const element = currentGroup.elements.find(e => e.id === generator);
                const color = currentGraph?.generators.find(g => g.id === generator)?.color || '#666';
                return (
                  <label key={generator} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={selectedGenerators.includes(generator)}
                      onChange={() => handleGeneratorToggle(generator)}
                      className="mr-2"
                    />
                    <span className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: color }}></span>
                    <span>{element?.label || generator}</span>
                  </label>
                );
              })}
            </div>
          </div>
          
          {/* Visualization Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visualization</label>
            <div className="space-y-1">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={settings.showLabels}
                  onChange={(e) => setSettings(prev => ({ ...prev, showLabels: e.target.checked }))}
                  className="mr-2"
                />
                Show Labels
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={settings.showArrows}
                  onChange={(e) => setSettings(prev => ({ ...prev, showArrows: e.target.checked }))}
                  className="mr-2"
                />
                Show Arrows
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={settings.highlightConjugacyClasses}
                  onChange={(e) => setSettings(prev => ({ ...prev, highlightConjugacyClasses: e.target.checked }))}
                  className="mr-2"
                />
                Color by Conjugacy Class
              </label>
            </div>
          </div>
          
          {/* Group Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group Properties</label>
            {currentGroup && (
              <div className="text-sm space-y-1">
                <div>Order: {currentGroup.order}</div>
                <div>Abelian: {currentGroup.isAbelian ? 'Yes' : 'No'}</div>
                <div>Center: |{currentGroup.center.length}|</div>
                <div>Classes: {currentGroup.conjugacyClasses.length}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          className="cursor-pointer bg-gray-50"
        />
      </div>

      {/* Information Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Instructions</h3>
          <ul className="text-gray-600 space-y-1">
            <li>• Click elements to highlight their connections</li>
            <li>• Shift+click for group multiplication</li>
            <li>• Toggle generators to show/hide edges</li>
            <li>• Hover over elements for details</li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Current State</h3>
          <div className="text-gray-600 space-y-1">
            {hoveredElement && currentGroup && (
              <div>
                <strong>Hovered:</strong> {currentGroup.elements.find(e => e.id === hoveredElement)?.label}
              </div>
            )}
            {selectedElement && currentGroup && (
              <div>
                <strong>Selected:</strong> {currentGroup.elements.find(e => e.id === selectedElement)?.label}
              </div>
            )}
            {multiplicationState.element1 && (
              <div>
                <strong>Multiplication:</strong> {multiplicationState.element1}
                {multiplicationState.element2 && ` × ${multiplicationState.element2}`}
                {multiplicationState.result && ` = ${multiplicationState.result}`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCayleyGraphExplorer;
