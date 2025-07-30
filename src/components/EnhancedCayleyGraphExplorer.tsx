'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GroupTheoryLibrary, 
  Group, 
  CayleyGraphGenerator, 
  CayleyGraph 
} from '../lib/GroupTheory';

const EnhancedCayleyGraphExplorer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedGroup, setSelectedGroup] = useState<string>('C1');
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [currentGraph, setCurrentGraph] = useState<CayleyGraph | null>(null);
  const [selectedGenerators, setSelectedGenerators] = useState<string[]>([]);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showArrows, setShowArrows] = useState<boolean>(true);

  // Load group when selection changes
  useEffect(() => {
    const group = GroupTheoryLibrary.getGroup(selectedGroup);
    if (group) {
      setCurrentGroup(group);
      setSelectedGenerators(group.generators.slice(0, 2));
    }
  }, [selectedGroup]);

  // Generate graph when group or generators change
  useEffect(() => {
    if (currentGroup) {
      console.log('Generating Cayley graph for:', currentGroup.name);
      console.log('Generators:', selectedGenerators);
      
      // Special case for trivial group C1 which has no generators
      const generatorsToUse = currentGroup.generators.length === 0 ? [] : selectedGenerators;
      
      const graph = CayleyGraphGenerator.generateGraph(
        currentGroup, 
        generatorsToUse, 
        '2d'
      );
      
      console.log('Graph edges:', graph.edges.length, 'Expected:', currentGroup.order * selectedGenerators.length);
      setCurrentGraph(graph);
    }
  }, [currentGroup, selectedGenerators]);

  // Drawing function
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

    // Draw vertices
    currentGraph.vertices.forEach(vertex => {
      ctx.fillStyle = vertex.color;
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 20, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (showLabels) {
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(vertex.label, vertex.x, vertex.y);
      }
    });
  }, [currentGraph, showLabels, showArrows]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      drawGraph();
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [drawGraph]);

  const availableGroups = GroupTheoryLibrary.getAllGroups();

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6 bg-gray-50 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Group
            </label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedGroup} 
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              {availableGroups.map(group => (
                <option key={group.name} value={group.name}>
                  {group.displayName} (Order {group.order})
                </option>
              ))}
            </select>
          </div>

          {currentGroup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generators
              </label>
              <div className="space-y-2">
                {currentGroup.generators.map(generator => (
                  <label key={generator} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedGenerators.includes(generator)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGenerators(prev => [...prev, generator]);
                        } else {
                          setSelectedGenerators(prev => prev.filter(g => g !== generator));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {currentGroup.elements.find(e => e.id === generator)?.label || generator}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Show Labels</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showArrows}
                  onChange={(e) => setShowArrows(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Show Arrows</span>
              </label>
            </div>
          </div>
        </div>

        {currentGroup && (
          <div className="mt-6 p-4 bg-white rounded-md border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {currentGroup.displayName}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className="font-medium">Order:</span> {currentGroup.order}</div>
              <div><span className="font-medium">Abelian:</span> {currentGroup.isAbelian ? 'Yes' : 'No'}</div>
              <div><span className="font-medium">Center:</span> |{currentGroup.center.length}|</div>
              <div><span className="font-medium">Generators:</span> {currentGroup.generators.length}</div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-gray-300 rounded-md"
        />
        
        {currentGraph && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Displaying {currentGraph.edges.length} edges for {selectedGenerators.length} generator(s)
            {currentGroup && (
              <span className="ml-2">
                (Expected: {currentGroup.order * selectedGenerators.length})
              </span>
            )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCayleyGraphExplorer;
