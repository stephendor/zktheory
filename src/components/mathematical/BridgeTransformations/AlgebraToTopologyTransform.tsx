'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import useMathematicalAnimation from '../hooks/useMathematicalAnimation';

interface GroupElement {
  id: string;
  name: string;
  position: [number, number];
  color: string;
}

interface TopologySpace {
  id: string;
  name: string;
  vertices: Array<{ x: number; y: number; z: number; id: string }>;
  edges: Array<{ source: string; target: string }>;
  faces: Array<{ vertices: string[]; color: string }>;
}

interface AlgebraToTopologyTransformProps {
  groupSize?: number;
  width?: number;
  height?: number;
  animationDuration?: number;
  onTransformationStep?: (step: number, data: any) => void;
  className?: string;
}

export const AlgebraToTopologyTransform: React.FC<AlgebraToTopologyTransformProps> = ({
  groupSize = 4,
  width = 800,
  height = 600,
  animationDuration = 4500,
  onTransformationStep,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [groupElements, setGroupElements] = useState<GroupElement[]>([]);
  const [topologySpace, setTopologySpace] = useState<TopologySpace | null>(null);
  
  // Animation steps for transformation
  const transformationSteps = [
    {
      expression: '(G, ∘)',
      explanation: 'Start with abstract group structure'
    },
    {
      expression: 'τ: G → Top(X)',
      explanation: 'Introduce topological structure mapping'
    },
    {
      expression: 'g · x ∈ X ∀g ∈ G, x ∈ X',
      explanation: 'Group acts continuously on topological space'
    },
    {
      expression: '(X, τ, G)',
      explanation: 'Complete topological space with group action'
    }
  ];

  const { useStepByStepAnimation } = useMathematicalAnimation;
  const stepAnimation = useStepByStepAnimation(transformationSteps, {
    duration: animationDuration,
    delay: 250
  });

  // Generate cyclic group elements
  const generateGroupElements = (size: number): GroupElement[] => {
    const elements: GroupElement[] = [];
    const angleStep = (2 * Math.PI) / size;
    const radius = 80;
    const centerX = width / 3;
    const centerY = height / 2;

    for (let i = 0; i < size; i++) {
      const angle = i * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      elements.push({
        id: `g${i}`,
        name: i === 0 ? 'e' : `g^${i}`,
        position: [x, y],
        color: d3.schemeCategory10[i % 10]
      });
    }
    
    return elements;
  };

  // Generate topological space (torus-like structure for cyclic group)
  const generateTopologySpace = (groupSize: number): TopologySpace => {
    const vertices: Array<{ x: number; y: number; z: number; id: string }> = [];
    const edges: Array<{ source: string; target: string }> = [];
    const faces: Array<{ vertices: string[]; color: string }> = [];

    // Create vertices for torus
    const majorRadius = 60;
    const minorRadius = 20;
    const centerX = (2 * width) / 3;
    const centerY = height / 2;
    
    const steps = groupSize;
    const circles = 4;

    for (let i = 0; i < steps; i++) {
      for (let j = 0; j < circles; j++) {
        const u = (2 * Math.PI * i) / steps;
        const v = (2 * Math.PI * j) / circles;
        
        const x = centerX + (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
        const y = centerY + (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
        const z = minorRadius * Math.sin(v);
        
        const id = `v_${i}_${j}`;
        vertices.push({ x, y, z, id });
        
        // Create edges
        const nextI = (i + 1) % steps;
        const nextJ = (j + 1) % circles;
        
        edges.push({
          source: id,
          target: `v_${nextI}_${j}`
        });
        
        edges.push({
          source: id,
          target: `v_${i}_${nextJ}`
        });
      }
    }

    return {
      id: 'torus-space',
      name: 'Topological Space',
      vertices,
      edges,
      faces
    };
  };

  // Set up initial visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Generate group elements and topology space
    const elements = generateGroupElements(groupSize);
    const topology = generateTopologySpace(groupSize);
    
    setGroupElements(elements);
    setTopologySpace(topology);

    // Add title
    svg.append('text')
      .attr('class', 'main-title')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1f2937')
      .text('Abstract Algebra → Topology Transformation');

    // Add section labels
    svg.append('text')
      .attr('class', 'section-label')
      .attr('x', width / 3)
      .attr('y', 60)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#059669')
      .text('Group Structure');

    svg.append('text')
      .attr('class', 'section-label')
      .attr('x', (2 * width) / 3)
      .attr('y', 60)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#7c3aed')
      .text('Topological Space');

  }, [groupSize, width, height]);

  // Handle animation step changes
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const currentStep = stepAnimation.currentStep;

    switch (currentStep) {
      case 0:
        // Show group structure
        showGroupStructure(svg);
        break;

      case 1:
        // Introduce topological mapping
        introduceTopologicalMapping(svg);
        break;

      case 2:
        // Show group action on space
        showGroupAction(svg);
        break;

      case 3:
        // Complete transformation
        completeTransformation(svg);
        break;
    }

    if (onTransformationStep) {
      onTransformationStep(currentStep, {
        groupElements: groupElements,
        topologySpace: topologySpace,
        step: transformationSteps[currentStep]
      });
    }
  }, [stepAnimation.currentStep, onTransformationStep, groupElements, topologySpace]);

  const showGroupStructure = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    // Draw group elements as nodes
    svg.selectAll('.group-node')
      .data(groupElements)
      .enter()
      .append('circle')
      .attr('class', 'group-node')
      .attr('cx', d => d.position[0])
      .attr('cy', d => d.position[1])
      .attr('r', 0)
      .attr('fill', d => d.color)
      .attr('stroke', '#047857')
      .attr('stroke-width', 2)
      .transition()
      .duration(800)
      .delay((_, i) => i * 200)
      .attr('r', 15);

    // Add group element labels
    svg.selectAll('.group-label')
      .data(groupElements)
      .enter()
      .append('text')
      .attr('class', 'group-label')
      .attr('x', d => d.position[0])
      .attr('y', d => d.position[1] + 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .text(d => d.name)
      .attr('opacity', 0)
      .transition()
      .duration(600)
      .delay((_, i) => i * 200 + 400)
      .attr('opacity', 1);

    // Draw connections showing group operation
    const connections = groupElements.map((_, i) => ({
      source: groupElements[i],
      target: groupElements[(i + 1) % groupElements.length]
    }));

    svg.selectAll('.group-connection')
      .data(connections)
      .enter()
      .append('line')
      .attr('class', 'group-connection')
      .attr('x1', d => d.source.position[0])
      .attr('y1', d => d.source.position[1])
      .attr('x2', d => d.source.position[0])
      .attr('y2', d => d.source.position[1])
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .transition()
      .duration(1000)
      .delay(1200)
      .attr('x2', d => d.target.position[0])
      .attr('y2', d => d.target.position[1]);

    // Add group notation
    svg.append('text')
      .attr('class', 'group-notation')
      .attr('x', width / 3)
      .attr('y', height - 50)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#059669')
      .text(`ℤ/${groupSize}ℤ`)
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .delay(1500)
      .attr('opacity', 1);
  };

  const introduceTopologicalMapping = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    if (!topologySpace) return;

    // Draw topological space vertices
    svg.selectAll('.topo-vertex')
      .data(topologySpace.vertices)
      .enter()
      .append('circle')
      .attr('class', 'topo-vertex')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 0)
      .attr('fill', '#8b5cf6')
      .attr('stroke', '#7c3aed')
      .attr('stroke-width', 1)
      .transition()
      .duration(600)
      .delay((_, i) => i * 50)
      .attr('r', 3);

    // Draw edges
    setTimeout(() => {
      svg.selectAll('.topo-edge')
        .data(topologySpace.edges)
        .enter()
        .append('line')
        .attr('class', 'topo-edge')
        .attr('x1', d => {
          const source = topologySpace.vertices.find(v => v.id === d.source);
          return source ? source.x : 0;
        })
        .attr('y1', d => {
          const source = topologySpace.vertices.find(v => v.id === d.source);
          return source ? source.y : 0;
        })
        .attr('x2', d => {
          const source = topologySpace.vertices.find(v => v.id === d.source);
          return source ? source.x : 0;
        })
        .attr('y2', d => {
          const source = topologySpace.vertices.find(v => v.id === d.source);
          return source ? source.y : 0;
        })
        .attr('stroke', '#a855f7')
        .attr('stroke-width', 1)
        .attr('opacity', 0.6)
        .transition()
        .duration(800)
        .delay((_, i) => i * 20)
        .attr('x2', d => {
          const target = topologySpace.vertices.find(v => v.id === d.target);
          return target ? target.x : 0;
        })
        .attr('y2', d => {
          const target = topologySpace.vertices.find(v => v.id === d.target);
          return target ? target.y : 0;
        });
    }, 1000);

    // Add mapping arrows
    setTimeout(() => {
      const arrowData = groupElements.map((element, i) => ({
        start: element.position,
        end: [
          topologySpace.vertices[i * Math.floor(topologySpace.vertices.length / groupElements.length)]?.x || 0,
          topologySpace.vertices[i * Math.floor(topologySpace.vertices.length / groupElements.length)]?.y || 0
        ],
        id: element.id
      }));

      svg.selectAll('.mapping-arrow')
        .data(arrowData)
        .enter()
        .append('path')
        .attr('class', 'mapping-arrow')
        .attr('d', d => {
          const midX = (d.start[0] + d.end[0]) / 2;
          const midY = (d.start[1] + d.end[1]) / 2 - 30;
          return `M ${d.start[0]} ${d.start[1]} Q ${midX} ${midY} ${d.end[0]} ${d.end[1]}`;
        })
        .attr('fill', 'none')
        .attr('stroke', '#f59e0b')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#mapping-arrowhead)')
        .attr('opacity', 0)
        .transition()
        .duration(1000)
        .delay((_, i) => i * 300)
        .attr('opacity', 0.8);
    }, 2000);

    // Add arrow marker
    svg.select('defs').remove();
    svg.append('defs')
      .append('marker')
      .attr('id', 'mapping-arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#f59e0b');
  };

  const showGroupAction = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    // Animate group action on topological space
    svg.selectAll('.topo-vertex')
      .transition()
      .duration(2000)
      .delay((_, i) => (i % groupSize) * 400)
      .attr('fill', (_, i) => groupElements[i % groupElements.length]?.color || '#8b5cf6')
      .transition()
      .duration(1000)
      .attr('fill', '#8b5cf6');

    // Add action notation
    svg.append('text')
      .attr('class', 'action-notation')
      .attr('x', width / 2)
      .attr('y', height - 80)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#dc2626')
      .text('g · x ∈ X (Continuous Group Action)')
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .delay(1000)
      .attr('opacity', 1);

    // Show orbit visualization
    setTimeout(() => {
      const orbits = [0, 1, 2].map(orbitIndex => 
        Array.from({ length: groupSize }, (_, i) => ({
          angle: (2 * Math.PI * i) / groupSize,
          orbitIndex,
          groupElement: i
        }))
      );

      orbits.forEach((orbit, orbitIndex) => {
        svg.selectAll(`.orbit-${orbitIndex}`)
          .data(orbit)
          .enter()
          .append('circle')
          .attr('class', `orbit-${orbitIndex}`)
          .attr('cx', (2 * width) / 3)
          .attr('cy', height / 2)
          .attr('r', 2)
          .attr('fill', groupElements[0]?.color || '#8b5cf6')
          .attr('opacity', 0)
          .transition()
          .duration(1500)
          .delay((_, i) => i * 200)
          .attr('cx', d => (2 * width) / 3 + (30 + orbitIndex * 15) * Math.cos(d.angle))
          .attr('cy', d => height / 2 + (30 + orbitIndex * 15) * Math.sin(d.angle))
          .attr('opacity', 0.7);
      });
    }, 1500);
  };

  const completeTransformation = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    // Add final topological space notation
    svg.append('text')
      .attr('class', 'final-notation')
      .attr('x', (2 * width) / 3)
      .attr('y', height - 50)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#7c3aed')
      .text('(X, τ, G)')
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .attr('opacity', 1);

    // Add transformation summary
    svg.append('text')
      .attr('class', 'summary')
      .attr('x', width / 2)
      .attr('y', height - 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#6b7280')
      .text('Group structure induces topological space with continuous group action')
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .delay(500)
      .attr('opacity', 1);

    // Highlight the complete transformation
    svg.selectAll('.group-node, .topo-vertex')
      .transition()
      .duration(1000)
      .delay(1000)
      .attr('stroke-width', 3)
      .transition()
      .duration(1000)
      .attr('stroke-width', function() {
        return d3.select(this).classed('group-node') ? 2 : 1;
      });
  };

  return (
    <div className={`algebra-to-topology-transform ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          Abstract Algebra → Topology Transformation
        </h3>
        <p className="text-sm text-gray-600">
          Step {stepAnimation.currentStep + 1}: {stepAnimation.currentData?.explanation}
        </p>
      </div>
      
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-gray-300 rounded-lg bg-gray-50"
      />
      
      <div className="mt-4 flex gap-2">
        <button
          onClick={stepAnimation.nextStep}
          disabled={!stepAnimation.canGoNext}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Next Step
        </button>
        <button
          onClick={stepAnimation.previousStep}
          disabled={!stepAnimation.canGoPrevious}
          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
        >
          Previous Step
        </button>
        <button
          onClick={stepAnimation.reset}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default AlgebraToTopologyTransform;
