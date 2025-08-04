'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
// Temporarily disable 3D component due to import issues
// import dynamic from 'next/dynamic';
import { 
  GroupTheoryLibrary, 
  Group, 
  CayleyGraphGenerator, 
  CayleyGraph 
} from '../lib/GroupTheory';

// Dynamically import 3D component to avoid SSR issues
// const Cayley3DVisualization = dynamic(
//   () => import('./Cayley3DVisualization'),
//   { 
//     ssr: false,
//     loading: () => <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">Loading 3D visualization...</div>
//   }
// );

const EnhancedCayleyGraphExplorer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedGroup, setSelectedGroup] = useState<string>('C1');
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [currentGraph, setCurrentGraph] = useState<CayleyGraph | null>(null);
  const [selectedGenerators, setSelectedGenerators] = useState<string[]>([]);
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>('full'); // 'full' or subgroup index
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showArrows, setShowArrows] = useState<boolean>(true);
  const [visualizationMode, setVisualizationMode] = useState<'2d' | '3d'>('2d');
  const [highlightedElement, setHighlightedElement] = useState<string | undefined>();
  const [layoutInfo, setLayoutInfo] = useState<string>('Initializing...');

    // Load group when selection changes
  useEffect(() => {
    const group = GroupTheoryLibrary.getGroup(selectedGroup);
    console.log('🔍 Loading group:', selectedGroup);
    console.log('📋 Group details:', {
      name: group?.name,
      order: group?.order,
      elements: group?.elements?.map(e => ({id: e.id, label: e.label})),
      generators: group?.generators,
      isAbelian: group?.isAbelian
    });
    
    if (group) {
      setCurrentGroup(group);
      
      // Reset subgroup selection when group changes
      setSelectedSubgroup('full');
      
      // Auto-select first generator for non-trivial groups
      if (group.generators.length > 0) {
        setSelectedGenerators([group.generators[0]]);
      } else {
        setSelectedGenerators([]);
      }
    }
  }, [selectedGroup]);

  // Generate graph when group, generators, or subgroup change
  useEffect(() => {
    if (currentGroup) {
      console.log('📊 SMART LAYOUT ENGINE - Generating Cayley graph for:', currentGroup.name);
      console.log('🔧 Using generators:', selectedGenerators);
      console.log('📂 Selected subgroup:', selectedSubgroup);
      
      // Determine which group/subgroup to visualize
      let groupToVisualize = currentGroup;
      let elementsToShow = currentGroup.elements;
      
      if (selectedSubgroup !== 'full' && currentGroup.subgroups) {
        const subgroupIndex = parseInt(selectedSubgroup);
        const subgroup = currentGroup.subgroups[subgroupIndex];
        if (subgroup) {
          console.log('🎯 Visualizing subgroup:', subgroup.name, 'with elements:', subgroup.elements);
          elementsToShow = currentGroup.elements.filter(e => subgroup.elements.includes(e.id));
          
          // Create a filtered group for the subgroup
          groupToVisualize = {
            ...currentGroup,
            name: subgroup.name,
            displayName: subgroup.name,
            order: subgroup.elements.length,
            elements: elementsToShow
          };
        }
      }
      
      console.log('🎯 Group order:', groupToVisualize.order, 'isAbelian:', groupToVisualize.isAbelian);
      console.log('🧮 Group operations map size:', groupToVisualize.operations.size);
      console.log('🔍 Sample operations:', Array.from(groupToVisualize.operations.entries()).slice(0, 3));
      
      // TEST: Verify operations work for specific examples
      if (currentGroup.name === 'C3') {
        console.log('🧪 TESTING C3 operations:');
        console.log('  g0 * g1 =', currentGroup.operations.get('g0')?.get('g1'));
        console.log('  g1 * g1 =', currentGroup.operations.get('g1')?.get('g1')); 
        console.log('  g2 * g1 =', currentGroup.operations.get('g2')?.get('g1'));
        console.log('  Full g0 operations:', Array.from(currentGroup.operations.get('g0')?.entries() || []));
      }
      
      // Special case for trivial group C1 which has no generators
      const generatorsToUse = currentGroup.generators.length === 0 ? [] : selectedGenerators;
      console.log('⚙️ Generators to use:', generatorsToUse);
      
      const graph = CayleyGraphGenerator.generateGraph(
        groupToVisualize, 
        generatorsToUse, 
        '2d'
      );
      
      console.log('✅ Graph generated with', graph.edges.length, 'edges (Expected:', groupToVisualize.order * selectedGenerators.length, ')');
      console.log('📍 Vertices:', graph.vertices.length, 'Elements:', groupToVisualize.elements.length);
      console.log('🔗 First 5 edges:', graph.edges.slice(0, 5));
      setLayoutInfo(`Smart Layout: ${groupToVisualize.name} (${graph.edges.length} edges)`);
      setCurrentGraph(graph);
    }
  }, [currentGroup, selectedGenerators, selectedSubgroup]);

  // Drawing function for 2D canvas
  const drawGraph = useCallback(() => {
    if (visualizationMode !== '2d') return; // Only draw in 2D mode
    
    const canvas = canvasRef.current;
    if (!canvas || !currentGraph) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle background grid for enhanced visualization
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

    // Draw vertices
    // Draw vertices with enhanced styling
    currentGraph.vertices.forEach(vertex => {
      // Create gradient for enhanced 3D effect
      const gradient = ctx.createRadialGradient(vertex.x - 5, vertex.y - 5, 0, vertex.x, vertex.y, 25);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.4, vertex.color);
      gradient.addColorStop(1, vertex.color);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 22, 0, 2 * Math.PI);
      ctx.fill();
      
      // Enhanced border with double outline
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Inner highlight ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 18, 0, 2 * Math.PI);
      ctx.stroke();

      if (showLabels) {
        // Enhanced text with shadow
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
  }, [currentGraph, showLabels, showArrows, visualizationMode]);

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
              title="Select a group to visualize"
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

          {currentGroup && currentGroup.subgroups && currentGroup.subgroups.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explore Subgroups & Cosets
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedSubgroup}
                onChange={(e) => setSelectedSubgroup(e.target.value)}
                title="Select subgroup to visualize cosets and structure"
              >
                <option value="full">Full Group ({currentGroup.displayName})</option>
                {currentGroup.subgroups.map((subgroup, index) => (
                  <option key={index} value={index.toString()}>
                    {subgroup.name} (Order {subgroup.elements.length})
                    {subgroup.isNormal ? ' - Normal Subgroup' : ' - Subgroup'}
                  </option>
                ))}
              </select>
              
              {selectedSubgroup !== 'full' && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <div className="font-medium text-blue-800 mb-1">
                    📚 Learning: {currentGroup.subgroups[parseInt(selectedSubgroup)]?.isNormal ? 'Normal Subgroups' : 'Subgroups'}
                  </div>
                  <div className="text-blue-700">
                    {currentGroup.subgroups[parseInt(selectedSubgroup)]?.isNormal ? (
                      <>
                        <strong>Normal subgroups</strong> are special: their left and right cosets are identical. 
                        This subgroup partitions the group into equal-sized cosets of {currentGroup.subgroups[parseInt(selectedSubgroup)]?.elements.length} elements each.
                      </>
                    ) : (
                      <>
                        This <strong>subgroup</strong> breaks the group into cosets - disjoint sets that partition all group elements. 
                        Each coset has {currentGroup.subgroups[parseInt(selectedSubgroup)]?.elements.length} elements.
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Options
            </label>
            <div className="space-y-2">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Visualization Mode
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setVisualizationMode('2d')}
                    className={`px-3 py-1 text-sm rounded ${
                      visualizationMode === '2d' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    2D Enhanced
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('3D mode coming soon! The Smart Layout Engine is currently improving 2D layouts.')}
                    className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-400 cursor-not-allowed"
                  >
                    3D Interactive (Coming Soon)
                  </button>
                </div>
              </div>
              
              {visualizationMode === '2d' && (
                <>
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
                  <button
                    type="button"
                    onClick={() => {
                      console.log('🎯 DEMO: Current group:', currentGroup?.name, 'Layout improvements active!');
                      if (currentGroup) {
                        console.log('🔍 DETAILED GROUP DEBUG:');
                        console.log('Elements:', currentGroup.elements.map(e => `${e.id}(${e.label})`));
                        console.log('Generators:', currentGroup.generators);
                        console.log('Operations sample:');
                        for (let i = 0; i < Math.min(3, currentGroup.elements.length); i++) {
                          const element = currentGroup.elements[i];
                          const ops = currentGroup.operations.get(element.id);
                          if (ops && currentGroup.generators.length > 0) {
                            const gen = currentGroup.generators[0];
                            const result = ops.get(gen);
                            console.log(`  ${element.id} * ${gen} = ${result}`);
                          }
                        }
                      }
                    }}
                    className="mt-2 px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    🔍 Debug Group Operations
                  </button>
                </>
              )}
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
        {visualizationMode === '2d' ? (
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="border border-blue-300 rounded-md bg-gradient-to-br from-blue-50 to-white"
            />
            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
              🚀 Enhanced 2D v2.1
            </div>
          </div>
        ) : (
          <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-600 mb-2">3D Visualization Coming Soon</div>
              <div className="text-sm text-gray-500">React Three Fiber integration in progress</div>
            </div>
          </div>
        )}
        
        {currentGraph && (
          <div className="mt-4 space-y-2">
            <div className="text-sm text-gray-600">
              <p>Displaying {currentGraph.edges.length} edges for {selectedGenerators.length} generator(s)
              {currentGroup && (
                <span className="ml-2">
                  (Expected: {currentGroup.order * selectedGenerators.length})
                </span>
              )}
              </p>
            </div>
            
            {/* Smart Layout Engine Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-800">Optimized Layout Engine Active</span>
              </div>
              <div className="text-xs text-blue-600">
                {layoutInfo}
              </div>
              <div className="text-xs text-blue-500 mt-1">
                Using structure-aware positioning: circular for abelian groups, specialized layouts for dihedral groups
              </div>
            </div>
            
            {visualizationMode === '3d' && (
              <p className="mt-2 text-blue-600">
                🌟 3D Mode: Drag to rotate, scroll to zoom, right-click to pan
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCayleyGraphExplorer;
