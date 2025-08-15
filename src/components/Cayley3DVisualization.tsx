'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Group, GroupElement } from '@/lib/GroupTheory';
import { AdvancedLayoutEngine } from '@/lib/AdvancedLayoutEngine';
import { usePerformanceMonitor, useMemoryTracking } from '@/lib/performance';

interface NodeProps {
  position: [number, number, number];
  element: GroupElement;
  color: string;
  onClick: (element: GroupElement) => void;
  scale: number;
  highlighted: boolean;
}

function Node({ position, element, color, onClick, scale, highlighted }: NodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state: any) => {
    if (meshRef.current) {
      // Gentle rotation animation
      meshRef.current.rotation.y += 0.01;
      
      // Scale animation on hover or highlight
      const targetScale = (hovered || highlighted) ? scale * 1.3 : scale;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={() => onClick(element)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={highlighted ? '#ff6b6b' : color}
          emissive={hovered ? '#444444' : '#000000'}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.3}
        color={highlighted ? '#ff6b6b' : '#333333'}
        anchorX="center"
        anchorY="middle"
      >
        {element.label}
      </Text>
    </group>
  );
}

interface EdgeProps {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  width: number;
}

function Edge({ start, end, color, width }: EdgeProps) {
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end)
  ], [start, end]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={width}
      transparent
      opacity={0.6}
    />
  );
}

interface Cayley3DVisualizationProps {
  group: Group;
  selectedGenerator?: string;
  onElementClick?: (element: GroupElement) => void;
  highlightedElement?: string;
}

export default function Cayley3DVisualization({
  group,
  selectedGenerator,
  onElementClick = () => {},
  highlightedElement
}: Cayley3DVisualizationProps) {
  const [layout, setLayout] = useState<any>(null);
  const [cameraControls, setCameraControls] = useState(true);
  
  // Performance monitoring hooks
  const { startTimer } = usePerformanceMonitor('cayley_3d', 'rendering');
  useMemoryTracking('cayley_3d', 5000); // Track memory every 5 seconds

  // Generate 3D layout using Advanced Layout Engine
  useEffect(() => {
    console.log('🎯 Cayley3D: Starting layout generation with performance monitoring');
    const stopTimer = startTimer();
    
    const generators = group.generators.length > 0 ? group.generators : [];
    const advancedLayout = AdvancedLayoutEngine.generateOptimalLayout(group, generators, true);
    
    console.log('🚀 3D Advanced layout generated:', advancedLayout.description);
    setLayout(advancedLayout);
    
    console.log('⏱️ Cayley3D: Stopping timer for layout generation');
    stopTimer();
  }, [group, startTimer]);

  // Generate edges based on selected generator
  const edges = useMemo(() => {
    if (!selectedGenerator || !layout) return [];
    
    const stopTimer = startTimer();
    
    const edgeList: Array<{
      start: [number, number, number];
      end: [number, number, number];
      color: string;
    }> = [];

    group.elements.forEach(element => {
      const result = group.operations.get(element.label)?.get(selectedGenerator);
      if (result) {
        const startPos = layout.positions[element.id] || layout.positions[element.label];
        const endElement = group.elements.find(e => e.label === result);
        const endPos = endElement ? 
          (layout.positions[endElement.id] || layout.positions[endElement.label]) : 
          null;

        if (startPos && endPos) {
          // Scale positions for 3D space
          const scale = 5;
          edgeList.push({
            start: [startPos.x / 100 * scale, startPos.y / 100 * scale, (startPos.z || 0) / 100 * scale],
            end: [endPos.x / 100 * scale, endPos.y / 100 * scale, (endPos.z || 0) / 100 * scale],
            color: getGeneratorColor(selectedGenerator)
          });
        }
      }
    });

    stopTimer();
    return edgeList;
  }, [group, selectedGenerator, layout, startTimer]);

  // Generate node positions
  const nodes = useMemo(() => {
    if (!layout) return [];
    
    const stopTimer = startTimer();
    
    const scale = 5;
    const result = group.elements.map(element => {
      const pos = layout.positions[element.id] || layout.positions[element.label] || { x: 0, y: 0, z: 0 };
      return {
        element,
        position: [pos.x / 100 * scale, pos.y / 100 * scale, (pos.z || 0) / 100 * scale] as [number, number, number],
        color: getElementColor(element, group)
      };
    });
    
    stopTimer();
    return result;
  }, [group, layout, startTimer]);

  if (!layout) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-600">
          Generating 3D layout...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        {/* Controls */}
        {cameraControls && (
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxDistance={20}
            minDistance={3}
          />
        )}

        {/* Nodes */}
        {nodes.map((node, index) => (
          <Node
            key={`node-${node.element.id}`}
            position={node.position}
            element={node.element}
            color={node.color}
            onClick={onElementClick}
            scale={1}
            highlighted={highlightedElement === node.element.label}
          />
        ))}

        {/* Edges */}
        {edges.map((edge, index) => (
          <Edge
            key={`edge-${index}`}
            start={edge.start}
            end={edge.end}
            color={edge.color}
            width={2}
          />
        ))}

        {/* Grid helper for orientation */}
        <gridHelper args={[20, 20, '#cccccc', '#cccccc']} position={[0, -6, 0]} />
      </Canvas>
      
      {/* Controls UI */}
      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-sm font-medium text-gray-700 mb-2">3D Controls</div>
        <div className="space-y-1 text-xs text-gray-600">
          <div>🖱️ Drag to rotate</div>
          <div>🔍 Scroll to zoom</div>
          <div>📱 Right-click + drag to pan</div>
        </div>
        <button
          onClick={() => setCameraControls(!cameraControls)}
          className="mt-2 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {cameraControls ? 'Lock Camera' : 'Unlock Camera'}
        </button>
      </div>

      {/* Layout info */}
      {layout && (
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
          <div className="text-sm font-medium text-gray-700 mb-1">Layout Strategy</div>
          <div className="text-xs text-gray-600">{layout.description}</div>
          {layout.nestingStructure && (
            <div className="text-xs text-gray-500 mt-1">
              Nesting: {layout.nestingStructure.type} ({layout.nestingStructure.levels} levels)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper functions
function getGeneratorColor(generator: string): string {
  const colors = {
    'a': '#ff6b6b',
    'b': '#4ecdc4',
    'c': '#45b7d1',
    'r': '#96ceb4',
    's': '#ffa726',
    'x': '#ab47bc',
    'y': '#ef5350'
  };
  return colors[generator as keyof typeof colors] || '#666666';
}

function getElementColor(element: GroupElement, group: Group): string {
  // Color by order of element
  const order = getElementOrder(element, group);
  
  const orderColors = {
    1: '#e8f5e8',  // Identity - light green
    2: '#b3d9ff',  // Order 2 - light blue  
    3: '#ffccb3',  // Order 3 - light orange
    4: '#ffb3d9',  // Order 4 - light pink
    5: '#d9b3ff',  // Order 5 - light purple
    6: '#ffffb3',  // Order 6 - light yellow
  };
  
  return orderColors[order as keyof typeof orderColors] || '#f0f0f0';
}

function getElementOrder(element: GroupElement, group: Group): number {
  let current = element.label;
  let order = 1;
  
  while (true) {
    const next = group.operations.get(current)?.get(element.label);
    if (!next || next === group.elements.find(e => e.order === 1)?.label) break;
    current = next;
    order++;
    if (order > 10) break; // Safety check
  }
  
  return order;
}
