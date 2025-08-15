'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import useMathematicalAnimation from '../hooks/useMathematicalAnimation';

interface TopologyVertex {
  id: string;
  x: number;
  y: number;
  z: number;
  manifoldPoint?: boolean;
}

interface ManifoldPoint {
  x: number;
  y: number;
  curveParam?: number;
}

interface TopologyToEllipticTransformProps {
  manifoldComplexity?: number;
  width?: number;
  height?: number;
  animationDuration?: number;
  onTransformationStep?: (step: number, data: any) => void;
  className?: string;
}

export const TopologyToEllipticTransform: React.FC<TopologyToEllipticTransformProps> = ({
  manifoldComplexity = 6,
  width = 800,
  height = 600,
  animationDuration = 4200,
  onTransformationStep,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [topologyVertices, setTopologyVertices] = useState<TopologyVertex[]>([]);
  const [manifoldPoints, setManifoldPoints] = useState<ManifoldPoint[]>([]);
  
  // Animation steps for transformation
  const transformationSteps = [
    {
      expression: '(X, τ)',
      explanation: 'Begin with topological space and topology'
    },
    {
      expression: '∇: TM → T*M ⊗ TM',
      explanation: 'Introduce differential geometric structure'
    },
    {
      expression: 'f(x,y) = 0',
      explanation: 'Algebraic curve emerges from geometry'
    },
    {
      expression: 'y² = x³ + ax + b',
      explanation: 'Complete transformation to elliptic curve'
    }
  ];

  const { useStepByStepAnimation } = useMathematicalAnimation;
  const stepAnimation = useStepByStepAnimation(transformationSteps, {
    duration: animationDuration,
    delay: 300
  });

  // Generate topological space (manifold-like structure)
  const generateTopologySpace = (complexity: number): TopologyVertex[] => {
    const vertices: TopologyVertex[] = [];
    const centerX = width / 3;
    const centerY = height / 2;
    
    // Create a manifold-like structure
    for (let i = 0; i < complexity; i++) {
      for (let j = 0; j < complexity; j++) {
        const u = (2 * Math.PI * i) / complexity;
        const v = (Math.PI * j) / (complexity - 1);
        
        // Create a torus-like manifold
        const majorRadius = 60;
        const minorRadius = 25;
        
        const x = centerX + (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
        const y = centerY + (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
        const z = minorRadius * Math.sin(v);
        
        vertices.push({
          id: `topo_${i}_${j}`,
          x,
          y,
          z,
          manifoldPoint: true
        });
      }
    }
    
    return vertices;
  };

  // Generate elliptic curve points from manifold
  const generateEllipticCurvePoints = (): ManifoldPoint[] => {
    const points: ManifoldPoint[] = [];
    const centerX = (2 * width) / 3;
    const centerY = height / 2;
    
    // Parameters for elliptic curve y² = x³ - x + 1
    const a = -1;
    const b = 1;
    
    for (let x = -2.5; x <= 2.5; x += 0.1) {
      const y_squared = x * x * x + a * x + b;
      if (y_squared >= 0) {
        const y = Math.sqrt(y_squared);
        if (Math.abs(y) <= 3) {
          points.push({ 
            x: centerX + x * 40, 
            y: centerY - y * 40,
            curveParam: x
          });
          if (y !== 0) {
            points.push({ 
              x: centerX + x * 40, 
              y: centerY + y * 40,
              curveParam: x
            });
          }
        }
      }
    }
    
    return points;
  };

  // Set up initial visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Generate topology and curve data
    const topoVertices = generateTopologySpace(manifoldComplexity);
    const curvePoints = generateEllipticCurvePoints();
    
    setTopologyVertices(topoVertices);
    setManifoldPoints(curvePoints);

    // Add title
    svg.append('text')
      .attr('class', 'main-title')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1f2937')
      .text('Topology → Elliptic Curve Transformation');

    // Add section labels
    svg.append('text')
      .attr('class', 'section-label')
      .attr('x', width / 3)
      .attr('y', 60)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#7c3aed')
      .text('Topological Manifold');

    svg.append('text')
      .attr('class', 'section-label')
      .attr('x', (2 * width) / 3)
      .attr('y', 60)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#3b82f6')
      .text('Elliptic Curve');

  }, [manifoldComplexity, width, height]);

  // Handle animation step changes
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const currentStep = stepAnimation.currentStep;

    switch (currentStep) {
      case 0:
        // Show topological space
        showTopologicalSpace(svg);
        break;

      case 1:
        // Introduce differential structure
        introduceDifferentialStructure(svg);
        break;

      case 2:
        // Show algebraic curve emergence
        showAlgebraicCurve(svg);
        break;

      case 3:
        // Complete elliptic curve transformation
        completeEllipticTransformation(svg);
        break;
    }

    if (onTransformationStep) {
      onTransformationStep(currentStep, {
        topologyVertices: topologyVertices,
        manifoldPoints: manifoldPoints,
        step: transformationSteps[currentStep]
      });
    }
  }, [stepAnimation.currentStep, onTransformationStep, topologyVertices, manifoldPoints]);

  const showTopologicalSpace = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    // Draw manifold vertices
    svg.selectAll('.manifold-vertex')
      .data(topologyVertices)
      .enter()
      .append('circle')
      .attr('class', 'manifold-vertex')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 0)
      .attr('fill', d => {
        // Color based on z-coordinate for 3D effect
        const intensity = (d.z + 25) / 50; // Normalize z to [0,1]
        return d3.interpolateViridis(intensity);
      })
      .attr('stroke', '#7c3aed')
      .attr('stroke-width', 1)
      .transition()
      .duration(600)
      .delay((_, i) => i * 30)
      .attr('r', 3);

    // Add grid lines to show manifold structure
    setTimeout(() => {
      const gridLines: Array<{start: TopologyVertex, end: TopologyVertex}> = [];
      
      for (let i = 0; i < manifoldComplexity; i++) {
        for (let j = 0; j < manifoldComplexity - 1; j++) {
          const current = topologyVertices[i * manifoldComplexity + j];
          const next = topologyVertices[i * manifoldComplexity + j + 1];
          if (current && next) {
            gridLines.push({ start: current, end: next });
          }
        }
      }
      
      for (let i = 0; i < manifoldComplexity - 1; i++) {
        for (let j = 0; j < manifoldComplexity; j++) {
          const current = topologyVertices[i * manifoldComplexity + j];
          const next = topologyVertices[(i + 1) * manifoldComplexity + j];
          if (current && next) {
            gridLines.push({ start: current, end: next });
          }
        }
      }

      svg.selectAll('.manifold-edge')
        .data(gridLines)
        .enter()
        .append('line')
        .attr('class', 'manifold-edge')
        .attr('x1', d => d.start.x)
        .attr('y1', d => d.start.y)
        .attr('x2', d => d.start.x)
        .attr('y2', d => d.start.y)
        .attr('stroke', '#a855f7')
        .attr('stroke-width', 1)
        .attr('opacity', 0.4)
        .transition()
        .duration(800)
        .delay((_, i) => i * 20)
        .attr('x2', d => d.end.x)
        .attr('y2', d => d.end.y);
    }, 1000);

    // Add topology notation
    svg.append('text')
      .attr('class', 'topology-notation')
      .attr('x', width / 3)
      .attr('y', height - 50)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#7c3aed')
      .text('M (Manifold)')
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .delay(1500)
      .attr('opacity', 1);
  };

  const introduceDifferentialStructure = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    // Add tangent vectors to show differential structure
    const sampleVertices = topologyVertices.filter((_, i) => i % 3 === 0);
    
    svg.selectAll('.tangent-vector')
      .data(sampleVertices)
      .enter()
      .append('line')
      .attr('class', 'tangent-vector')
      .attr('x1', d => d.x)
      .attr('y1', d => d.y)
      .attr('x2', d => d.x)
      .attr('y2', d => d.y)
      .attr('stroke', '#f59e0b')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#tangent-arrowhead)')
      .transition()
      .duration(1000)
      .delay((_, i) => i * 150)
      .attr('x2', d => d.x + 20 * Math.cos(d.z / 10))
      .attr('y2', d => d.y + 20 * Math.sin(d.z / 10));

    // Add differential structure notation
    svg.append('text')
      .attr('class', 'differential-notation')
      .attr('x', width / 3)
      .attr('y', height - 80)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('fill', '#f59e0b')
      .text('TM (Tangent Bundle)')
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .delay(1000)
      .attr('opacity', 1);

    // Add arrow marker for tangent vectors
    svg.select('defs').remove();
    svg.append('defs')
      .append('marker')
      .attr('id', 'tangent-arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#f59e0b');

    // Show coordinate charts
    setTimeout(() => {
      const chartRegions = [
        { x: width / 3 - 40, y: height / 2 - 40, width: 80, height: 80 },
        { x: width / 3 - 20, y: height / 2 + 20, width: 60, height: 60 }
      ];

      svg.selectAll('.coordinate-chart')
        .data(chartRegions)
        .enter()
        .append('rect')
        .attr('class', 'coordinate-chart')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('width', 0)
        .attr('height', 0)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '8,4')
        .attr('opacity', 0.7)
        .transition()
        .duration(1000)
        .delay((_, i) => i * 500 + 1500)
        .attr('width', d => d.width)
        .attr('height', d => d.height);
    }, 1500);
  };

  const showAlgebraicCurve = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    // Start showing curve points emerging from the manifold
    const curvePath = d3.line<ManifoldPoint>()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveCatmullRom);

    // Separate positive and negative y branches
    const positivePoints = manifoldPoints.filter(p => p.y <= height / 2).sort((a, b) => a.curveParam! - b.curveParam!);
    const negativePoints = manifoldPoints.filter(p => p.y > height / 2).sort((a, b) => a.curveParam! - b.curveParam!);

    // Draw emerging curve - positive branch
    svg.append('path')
      .datum(positivePoints)
      .attr('class', 'emerging-curve-pos')
      .attr('d', curvePath)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3)
      .attr('opacity', 0)
      .transition()
      .duration(1500)
      .attr('opacity', 0.8);

    // Draw emerging curve - negative branch
    setTimeout(() => {
      svg.append('path')
        .datum(negativePoints)
        .attr('class', 'emerging-curve-neg')
        .attr('d', curvePath)
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 3)
        .attr('opacity', 0)
        .transition()
        .duration(1500)
        .attr('opacity', 0.8);
    }, 500);

    // Add transformation arrows showing flow from manifold to curve
    setTimeout(() => {
      const flowArrows = topologyVertices.filter((_, i) => i % 8 === 0).map(vertex => {
        // Find closest curve point
        const closestCurvePoint = manifoldPoints.reduce((closest, point) => {
          const distToCurrent = Math.abs(point.x - ((2 * width) / 3)) + Math.abs(point.y - (height / 2));
          const distToClosest = Math.abs(closest.x - ((2 * width) / 3)) + Math.abs(closest.y - (height / 2));
          return distToCurrent < distToClosest ? point : closest;
        });

        return {
          start: [vertex.x, vertex.y],
          end: [closestCurvePoint.x, closestCurvePoint.y],
          id: vertex.id
        };
      });

      svg.selectAll('.transformation-flow')
        .data(flowArrows)
        .enter()
        .append('path')
        .attr('class', 'transformation-flow')
        .attr('d', d => {
          const midX = (d.start[0] + d.end[0]) / 2;
          const midY = (d.start[1] + d.end[1]) / 2 - 20;
          return `M ${d.start[0]} ${d.start[1]} Q ${midX} ${midY} ${d.end[0]} ${d.end[1]}`;
        })
        .attr('fill', 'none')
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#flow-arrowhead)')
        .attr('opacity', 0)
        .transition()
        .duration(1200)
        .delay((_, i) => i * 200)
        .attr('opacity', 0.6);
    }, 1000);

    // Add flow arrow marker
    svg.select('defs').select('#flow-arrowhead').remove();
    svg.select('defs')
      .append('marker')
      .attr('id', 'flow-arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#ef4444');

    // Add algebraic equation
    svg.append('text')
      .attr('class', 'algebraic-notation')
      .attr('x', (2 * width) / 3)
      .attr('y', height - 80)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('fill', '#ef4444')
      .text('f(x,y) = 0')
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .delay(2000)
      .attr('opacity', 1);
  };

  const completeEllipticTransformation = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    // Add coordinate axes for the elliptic curve
    const centerX = (2 * width) / 3;
    const centerY = height / 2;

    // X-axis
    svg.append('line')
      .attr('class', 'x-axis')
      .attr('x1', centerX - 120)
      .attr('y1', centerY)
      .attr('x2', centerX - 120)
      .attr('y2', centerY)
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 1)
      .transition()
      .duration(800)
      .attr('x2', centerX + 120);

    // Y-axis
    svg.append('line')
      .attr('class', 'y-axis')
      .attr('x1', centerX)
      .attr('y1', centerY + 120)
      .attr('x2', centerX)
      .attr('y2', centerY + 120)
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 1)
      .transition()
      .duration(800)
      .delay(200)
      .attr('y2', centerY - 120);

    // Add axis labels
    setTimeout(() => {
      svg.append('text')
        .attr('x', centerX + 130)
        .attr('y', centerY + 5)
        .attr('font-size', '12px')
        .attr('fill', '#6b7280')
        .text('x')
        .attr('opacity', 0)
        .transition()
        .duration(400)
        .attr('opacity', 1);

      svg.append('text')
        .attr('x', centerX - 10)
        .attr('y', centerY - 130)
        .attr('font-size', '12px')
        .attr('fill', '#6b7280')
        .text('y')
        .attr('opacity', 0)
        .transition()
        .duration(400)
        .delay(200)
        .attr('opacity', 1);
    }, 1000);

    // Highlight special points on the curve
    setTimeout(() => {
      const specialPoints = [
        { x: centerX, y: centerY - 40, label: '(0, 1)' },
        { x: centerX, y: centerY + 40, label: '(0, -1)' },
        { x: centerX + 40, y: centerY - 60, label: '(1, √3)' }
      ];

      svg.selectAll('.special-curve-point')
        .data(specialPoints)
        .enter()
        .append('circle')
        .attr('class', 'special-curve-point')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 0)
        .attr('fill', '#ef4444')
        .attr('stroke', '#dc2626')
        .attr('stroke-width', 2)
        .transition()
        .duration(600)
        .delay((_, i) => i * 300)
        .attr('r', 4);

      svg.selectAll('.special-point-label')
        .data(specialPoints)
        .enter()
        .append('text')
        .attr('class', 'special-point-label')
        .attr('x', d => d.x + 15)
        .attr('y', d => d.y - 10)
        .attr('font-size', '10px')
        .attr('fill', '#dc2626')
        .text(d => d.label)
        .attr('opacity', 0)
        .transition()
        .duration(600)
        .delay((_, i) => i * 300 + 300)
        .attr('opacity', 1);
    }, 1500);

    // Add final elliptic curve equation
    svg.append('text')
      .attr('class', 'elliptic-equation')
      .attr('x', (2 * width) / 3)
      .attr('y', height - 50)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#3b82f6')
      .text('y² = x³ - x + 1')
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .delay(2000)
      .attr('opacity', 1);

    // Add transformation summary
    svg.append('text')
      .attr('class', 'transformation-summary')
      .attr('x', width / 2)
      .attr('y', height - 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#6b7280')
      .text('Topological manifold → Differential geometry → Algebraic curve')
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .delay(2500)
      .attr('opacity', 1);

    // Final highlight animation
    setTimeout(() => {
      svg.selectAll('.emerging-curve-pos, .emerging-curve-neg')
        .transition()
        .duration(1000)
        .attr('stroke-width', 4)
        .transition()
        .duration(1000)
        .attr('stroke-width', 3);
    }, 3000);
  };

  return (
    <div className={`topology-to-elliptic-transform ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          Topology → Elliptic Curve Transformation
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

export default TopologyToEllipticTransform;
