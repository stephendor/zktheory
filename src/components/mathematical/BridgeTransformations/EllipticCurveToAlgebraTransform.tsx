'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import useMathematicalAnimation from '../hooks/useMathematicalAnimation';

interface Point {
  x: number;
  y: number;
  id?: string;
  label?: string;
}

interface EllipticCurveParams {
  a: number;
  b: number;
}

interface EllipticCurveToAlgebraTransformProps {
  curveParams?: EllipticCurveParams;
  width?: number;
  height?: number;
  animationDuration?: number;
  onTransformationStep?: (step: number, data: any) => void;
  className?: string;
}

export const EllipticCurveToAlgebraTransform: React.FC<EllipticCurveToAlgebraTransformProps> = ({
  curveParams = { a: -1, b: 1 }, // Default to y² = x³ - x + 1
  width = 800,
  height = 600,
  animationDuration = 4000,
  onTransformationStep,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [groupElements, setGroupElements] = useState<string[]>([]);
  
  // Animation steps for transformation
  const transformationSteps = [
    {
      expression: `y² = x³ + ${curveParams.a}x + ${curveParams.b}`,
      explanation: 'Start with the elliptic curve equation'
    },
    {
      expression: 'P + Q = R',
      explanation: 'Define the group operation: point addition'
    },
    {
      expression: '(E(ℝ), +)',
      explanation: 'Recognize the group structure of curve points'
    },
    {
      expression: 'G = {e, g₁, g₂, ...}',
      explanation: 'Abstract the points to group elements'
    }
  ];

  const { useStepByStepAnimation } = useMathematicalAnimation;
  const stepAnimation = useStepByStepAnimation(transformationSteps, {
    duration: animationDuration,
    delay: 200
  });

  // Generate points on the elliptic curve
  const generateCurvePoints = (a: number, b: number): Point[] => {
    const points: Point[] = [];
    const step = 0.1;
    
    for (let x = -3; x <= 3; x += step) {
      const y_squared = x * x * x + a * x + b;
      if (y_squared >= 0) {
        const y = Math.sqrt(y_squared);
        if (Math.abs(y) <= 3) {
          points.push({ x, y, id: `point-${points.length}` });
          if (y !== 0) {
            points.push({ x, y: -y, id: `point-${points.length}` });
          }
        }
      }
    }
    return points;
  };

  // Set up D3 visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([-4, 4])
      .range([50, width - 50]);

    const yScale = d3.scaleLinear()
      .domain([-4, 4])
      .range([height - 50, 50]);

    // Add axes
    const xAxis = d3.axisBottom(xScale).ticks(8);
    const yAxis = d3.axisLeft(yScale).ticks(8);

    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${yScale(0)})`)
      .call(xAxis);

    svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${xScale(0)}, 0)`)
      .call(yAxis);

    // Generate and add curve points
    const curvePoints = generateCurvePoints(curveParams.a, curveParams.b);
    setCurrentPoints(curvePoints);

    // Create curve path
    const line = d3.line<Point>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveCatmullRom);

    // Sort points by x coordinate for proper curve drawing
    const sortedPoints = curvePoints
      .filter(p => p.y >= 0)
      .sort((a, b) => a.x - b.x);
    
    const sortedPointsNeg = curvePoints
      .filter(p => p.y < 0)
      .sort((a, b) => a.x - b.x);

    // Draw positive branch
    svg.append('path')
      .datum(sortedPoints)
      .attr('class', 'curve-positive')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .attr('opacity', 1);

    // Draw negative branch
    svg.append('path')
      .datum(sortedPointsNeg)
      .attr('class', 'curve-negative')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('opacity', 0)
      .transition()
      .duration(1000)
      .delay(500)
      .attr('opacity', 1);

    // Add special points (like points of inflection, torsion points)
    const specialPoints = [
      { x: 0, y: Math.sqrt(curveParams.b), label: 'P₁' },
      { x: 0, y: -Math.sqrt(curveParams.b), label: 'P₂' },
      { x: 1, y: Math.sqrt(1 + curveParams.a + curveParams.b), label: 'P₃' }
    ].filter(p => !isNaN(p.y) && Math.abs(p.y) <= 3);

    svg.selectAll('.special-point')
      .data(specialPoints)
      .enter()
      .append('circle')
      .attr('class', 'special-point')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 0)
      .attr('fill', '#ef4444')
      .attr('stroke', '#dc2626')
      .attr('stroke-width', 2)
      .transition()
      .duration(800)
      .delay(1500)
      .attr('r', 5);

    // Add point labels
    svg.selectAll('.point-label')
      .data(specialPoints)
      .enter()
      .append('text')
      .attr('class', 'point-label')
      .attr('x', d => xScale(d.x) + 10)
      .attr('y', d => yScale(d.y) - 10)
      .text(d => d.label)
      .attr('font-size', '12px')
      .attr('fill', '#374151')
      .attr('opacity', 0)
      .transition()
      .duration(600)
      .delay(2000)
      .attr('opacity', 1);

  }, [curveParams, width, height]);

  // Handle animation step changes
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const currentStep = stepAnimation.currentStep;

    switch (currentStep) {
      case 0:
        // Show curve equation
        svg.select('.equation').remove();
        svg.append('text')
          .attr('class', 'equation')
          .attr('x', width / 2)
          .attr('y', 30)
          .attr('text-anchor', 'middle')
          .attr('font-size', '16px')
          .attr('font-weight', 'bold')
          .attr('fill', '#1f2937')
          .text(`y² = x³ + ${curveParams.a}x + ${curveParams.b}`)
          .attr('opacity', 0)
          .transition()
          .duration(800)
          .attr('opacity', 1);
        break;

      case 1:
        // Demonstrate point addition
        animatePointAddition(svg);
        break;

      case 2:
        // Show group structure
        showGroupStructure(svg);
        break;

      case 3:
        // Transform to abstract elements
        transformToAbstractElements(svg);
        break;
    }

    if (onTransformationStep) {
      onTransformationStep(currentStep, {
        points: currentPoints,
        groupElements: groupElements,
        equation: `y² = x³ + ${curveParams.a}x + ${curveParams.b}`
      });
    }
  }, [stepAnimation.currentStep, onTransformationStep, curveParams, currentPoints, groupElements, width]);

  const animatePointAddition = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    // Create visual demonstration of P + Q = R
    const xScale = d3.scaleLinear().domain([-4, 4]).range([50, width - 50]);
    const yScale = d3.scaleLinear().domain([-4, 4]).range([height - 50, 50]);

    // Example points for addition
    const P = { x: -1, y: 1.732, label: 'P' };
    const Q = { x: 2, y: -2.646, label: 'Q' };

    // Add P and Q
    svg.selectAll('.addition-point')
      .data([P, Q])
      .enter()
      .append('circle')
      .attr('class', 'addition-point')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 6)
      .attr('fill', '#10b981')
      .attr('stroke', '#047857')
      .attr('stroke-width', 2)
      .attr('opacity', 0)
      .transition()
      .duration(600)
      .attr('opacity', 1);

    // Add line through P and Q
    setTimeout(() => {
      svg.append('line')
        .attr('class', 'addition-line')
        .attr('x1', xScale(P.x))
        .attr('y1', yScale(P.y))
        .attr('x2', xScale(P.x))
        .attr('y2', yScale(P.y))
        .attr('stroke', '#059669')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .transition()
        .duration(1000)
        .attr('x2', xScale(Q.x))
        .attr('y2', yScale(Q.y));
    }, 800);

    // Show result point R
    setTimeout(() => {
      const R = { x: 0.5, y: 2.179, label: 'R = P + Q' };
      svg.append('circle')
        .attr('class', 'result-point')
        .attr('cx', xScale(R.x))
        .attr('cy', yScale(-R.y)) // Reflected point
        .attr('r', 6)
        .attr('fill', '#8b5cf6')
        .attr('stroke', '#7c3aed')
        .attr('stroke-width', 2)
        .attr('opacity', 0)
        .transition()
        .duration(600)
        .attr('opacity', 1);

      svg.append('text')
        .attr('class', 'result-label')
        .attr('x', xScale(R.x) + 10)
        .attr('y', yScale(-R.y) - 10)
        .text(R.label)
        .attr('font-size', '12px')
        .attr('fill', '#7c3aed')
        .attr('opacity', 0)
        .transition()
        .duration(600)
        .delay(300)
        .attr('opacity', 1);
    }, 2000);
  };

  const showGroupStructure = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    // Add group notation
    svg.append('text')
      .attr('class', 'group-notation')
      .attr('x', width - 100)
      .attr('y', 50)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#374151')
      .text('(E(ℝ), +)')
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .attr('opacity', 1);

    // Add group properties
    const properties = [
      'Closure: P + Q ∈ E',
      'Identity: O (point at ∞)',
      'Inverse: P + (-P) = O',
      'Associativity: (P+Q)+R = P+(Q+R)'
    ];

    svg.selectAll('.group-property')
      .data(properties)
      .enter()
      .append('text')
      .attr('class', 'group-property')
      .attr('x', width - 200)
      .attr('y', (_, i) => 80 + i * 20)
      .attr('font-size', '11px')
      .attr('fill', '#6b7280')
      .text(d => d)
      .attr('opacity', 0)
      .transition()
      .duration(600)
      .delay((_, i) => i * 200)
      .attr('opacity', 1);
  };

  const transformToAbstractElements = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => {
    // Generate abstract group elements
    const elements = ['e', 'g₁', 'g₂', 'g₃', 'g₄', 'g₅'];
    setGroupElements(elements);

    // Create transformation animation from points to abstract elements
    svg.selectAll('.special-point')
      .transition()
      .duration(1500)
      .attr('opacity', 0.3)
      .attr('r', 8);

    // Add abstract element labels
    setTimeout(() => {
      svg.selectAll('.abstract-element')
        .data(elements.slice(0, 3)) // Show first few elements
        .enter()
        .append('text')
        .attr('class', 'abstract-element')
        .attr('x', (_, i) => 100 + i * 80)
        .attr('y', height - 80)
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .attr('fill', '#8b5cf6')
        .text(d => d)
        .attr('opacity', 0)
        .transition()
        .duration(800)
        .delay((_, i) => i * 300)
        .attr('opacity', 1);

      // Add connecting arrows
      svg.selectAll('.transform-arrow')
        .data(elements.slice(0, 3))
        .enter()
        .append('path')
        .attr('class', 'transform-arrow')
        .attr('d', (_, i) => {
          const startY = height / 2;
          const endY = height - 100;
          const x = 100 + i * 80;
          return `M ${x} ${startY} Q ${x + 20} ${(startY + endY) / 2} ${x} ${endY}`;
        })
        .attr('fill', 'none')
        .attr('stroke', '#8b5cf6')
        .attr('stroke-width', 2)
        .attr('marker-end', 'url(#arrowhead)')
        .attr('opacity', 0)
        .transition()
        .duration(1000)
        .delay((_, i) => i * 300 + 500)
        .attr('opacity', 0.7);
    }, 800);

    // Add arrow marker definition
    svg.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#8b5cf6');
  };

  return (
    <div className={`elliptic-curve-to-algebra-transform ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          Elliptic Curve → Abstract Algebra Transformation
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

export default EllipticCurveToAlgebraTransform;
