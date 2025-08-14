'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
// Temporarily disable 3D component due to import issues
// import dynamic from 'next/dynamic';
import { 
  GroupTheoryLibrary, 
  Group, 
  CayleyGraphGenerator, 
  CayleyGraph,
  EllipticCurveGroupGenerator,
  EllipticCurveArithmetic,
  EllipticCurveAnimator,
  EllipticCurvePoint,
  PointAdditionAnimation
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
  
  // Animation states
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animationFrame, setAnimationFrame] = useState<number>(0);
  const [currentAnimation, setCurrentAnimation] = useState<PointAdditionAnimation[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState<number>(1);
  
  // Elliptic curve specific states
  const [isEllipticCurve, setIsEllipticCurve] = useState<boolean>(false);
  const [showCurve, setShowCurve] = useState<boolean>(true);
  const [highlightSubgroups, setHighlightSubgroups] = useState<boolean>(false);
  
  // Interactive demonstration states
  const [demoMode, setDemoMode] = useState<'off' | 'group_operations' | 'subgroup_structure'>('off');
  const [demoStep, setDemoStep] = useState<number>(0);
  const [demonstrationResult, setDemonstrationResult] = useState<string>('');
  
  // Export states
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'latex'>('png');

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
      
      // Check if this is an elliptic curve group
      const isEC = group.name.startsWith('EC_');
      setIsEllipticCurve(isEC);
      
      // Reset states when group changes
      setSelectedSubgroup('full');
      setSelectedPoints([]);
      setIsAnimating(false);
      setAnimationFrame(0);
      setCurrentAnimation([]);
      
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

  // Animation functions
  const startPointAdditionAnimation = useCallback((point1Id: string, point2Id: string) => {
    if (!currentGroup || !isEllipticCurve) return;
    
    const point1Element = currentGroup.elements.find(e => e.id === point1Id);
    const point2Element = currentGroup.elements.find(e => e.id === point2Id);
    
    if (!point1Element || !point2Element) return;
    
    // Convert group elements to elliptic curve points
    const point1: EllipticCurvePoint = parseECPoint(point1Element.label);
    const point2: EllipticCurvePoint = parseECPoint(point2Element.label);
    
    // Generate animation frames
    const animation = EllipticCurveAnimator.generateAdditionAnimation(
      point1, point2, 
      { a: 1, b: 1, p: 5, name: 'EC_E_5_1_1', displayName: 'EC(5,1,1)' }, // This should be extracted from group name
      800, 600
    );
    
    setCurrentAnimation(animation);
    setAnimationFrame(0);
    setIsAnimating(true);
  }, [currentGroup, isEllipticCurve]);

  const parseECPoint = (label: string): EllipticCurvePoint => {
    if (label === 'O') {
      return { x: null, y: null, isIdentity: true };
    }
    
    const match = label.match(/\((\d+),(\d+)\)/);
    if (match) {
      return {
        x: parseInt(match[1]),
        y: parseInt(match[2]),
        isIdentity: false
      };
    }
    
    return { x: null, y: null, isIdentity: true };
  };

  // Animation timer
  useEffect(() => {
    if (isAnimating && currentAnimation.length > 0) {
      const timer = setTimeout(() => {
        if (animationFrame < currentAnimation.length - 1) {
          setAnimationFrame(prev => prev + 1);
        } else {
          setIsAnimating(false);
        }
      }, 2000 / animationSpeed);
      
      return () => clearTimeout(timer);
    }
    return undefined; // Return undefined for the case when not animating
  }, [isAnimating, animationFrame, currentAnimation.length, animationSpeed]);

  // Handle vertex clicks for point selection
  const handleVertexClick = useCallback((vertexId: string) => {
    if (isEllipticCurve && !isAnimating) {
      setSelectedPoints(prev => {
        if (prev.includes(vertexId)) {
          return prev.filter(id => id !== vertexId);
        } else if (prev.length < 2) {
          const newSelection = [...prev, vertexId];
          if (newSelection.length === 2) {
            // Start animation when two points are selected
            setTimeout(() => {
              startPointAdditionAnimation(newSelection[0], newSelection[1]);
            }, 100);
          }
          return newSelection;
        } else {
          // Replace first point if already have 2
          return [prev[1], vertexId];
        }
      });
    } else {
      setHighlightedElement(vertexId);
    }
  }, [isEllipticCurve, isAnimating, startPointAdditionAnimation]);

  // Interactive demonstration functions
  const startGroupOperationDemo = useCallback(() => {
    if (!currentGroup) return;
    
    setDemoMode('group_operations');
    setDemoStep(0);
    setDemonstrationResult('');
    
    // Demonstrate group operations step by step
    const demoSteps = [
      'Identity element demonstration',
      'Inverse element demonstration', 
      'Associativity demonstration',
      'Closure demonstration'
    ];
    
    const step = demoSteps[0];
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
    } else if (demoMode === 'subgroup_structure' && currentGroup?.subgroups) {
      const nextStep = (demoStep + 1) % currentGroup.subgroups.length;
      setDemoStep(nextStep);
      
      const subgroup = currentGroup.subgroups[nextStep];
      setSelectedSubgroup(nextStep.toString());
      setDemonstrationResult(`Subgroup ${nextStep + 1}: ${subgroup.name} (Order ${subgroup.elements.length}) - ${subgroup.isNormal ? 'Normal' : 'Non-normal'}`);
    }
  }, [demoMode, demoStep, currentGroup]);

  const stopDemo = useCallback(() => {
    setDemoMode('off');
    setDemoStep(0);
    setDemonstrationResult('');
    setHighlightSubgroups(false);
    setSelectedSubgroup('full');
  }, []);

  // Enhanced vertex click handler for demonstrations
  const enhancedVertexClick = useCallback((vertexId: string) => {
    if (demoMode === 'group_operations' && currentGroup) {
      const element = currentGroup.elements.find(e => e.id === vertexId);
      if (!element) return;
      
      switch (demoStep) {
        case 0: // Identity
          const isIdentity = element.id === currentGroup.elements[0].id; // Assuming first element is identity
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

  // Export functions
  const exportToPNG = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create download link
    const link = document.createElement('a');
    link.download = `cayley-graph-${currentGroup?.name || 'graph'}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentGroup]);

  const exportToSVG = useCallback(() => {
    if (!currentGraph || !currentGroup) return;

    // Create SVG string
    const width = 800;
    const height = 600;
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    
    // Add background
    svgContent += `<rect width="${width}" height="${height}" fill="#f8fafc"/>`;
    
    // Add edges
    currentGraph.edges.forEach(edge => {
      const sourceVertex = currentGraph.vertices.find(v => v.id === edge.source);
      const targetVertex = currentGraph.vertices.find(v => v.id === edge.target);
      
      if (sourceVertex && targetVertex) {
        svgContent += `<line x1="${sourceVertex.x}" y1="${sourceVertex.y}" x2="${targetVertex.x}" y2="${targetVertex.y}" stroke="${edge.color}" stroke-width="2" opacity="0.8"/>`;
        
        // Add arrow
        if (showArrows) {
          const angle = Math.atan2(targetVertex.y - sourceVertex.y, targetVertex.x - sourceVertex.x);
          const arrowLength = 12;
          const nodeRadius = 25;
          const arrowX = targetVertex.x - nodeRadius * Math.cos(angle);
          const arrowY = targetVertex.y - nodeRadius * Math.sin(angle);
          
          const arrowPath = `M ${arrowX} ${arrowY} L ${arrowX - arrowLength * Math.cos(angle - Math.PI / 6)} ${arrowY - arrowLength * Math.sin(angle - Math.PI / 6)} M ${arrowX} ${arrowY} L ${arrowX - arrowLength * Math.cos(angle + Math.PI / 6)} ${arrowY - arrowLength * Math.sin(angle + Math.PI / 6)}`;
          svgContent += `<path d="${arrowPath}" stroke="${edge.color}" stroke-width="2" fill="none"/>`;
        }
      }
    });
    
    // Add vertices
    currentGraph.vertices.forEach(vertex => {
      svgContent += `<circle cx="${vertex.x}" cy="${vertex.y}" r="22" fill="${vertex.color}" stroke="#2c3e50" stroke-width="3"/>`;
      svgContent += `<circle cx="${vertex.x}" cy="${vertex.y}" r="18" fill="none" stroke="#ffffff" stroke-width="1"/>`;
      
      if (showLabels) {
        svgContent += `<text x="${vertex.x}" y="${vertex.y}" text-anchor="middle" dominant-baseline="middle" fill="#2c3e50" font-family="Arial, sans-serif" font-size="16" font-weight="bold">${vertex.label}</text>`;
      }
    });
    
    svgContent += `</svg>`;
    
    // Create download link
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = `cayley-graph-${currentGroup.name}.svg`;
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, [currentGraph, currentGroup, showArrows, showLabels]);

  const generateLaTeX = useCallback(() => {
    if (!currentGraph || !currentGroup) return '';

    let latex = `\\documentclass{article}
\\usepackage{tikz}
\\usepackage{amsmath}
\\begin{document}

\\title{Cayley Graph of ${currentGroup.displayName}}
\\maketitle

\\begin{center}
\\begin{tikzpicture}[scale=0.01]
`;

    // Add vertices
    currentGraph.vertices.forEach((vertex, index) => {
      latex += `\\node[circle, draw, fill=blue!20, minimum size=20pt] (v${index}) at (${vertex.x}, ${-vertex.y}) {$${vertex.label}$};\n`;
    });

    // Add edges
    currentGraph.edges.forEach(edge => {
      const sourceIndex = currentGraph.vertices.findIndex(v => v.id === edge.source);
      const targetIndex = currentGraph.vertices.findIndex(v => v.id === edge.target);
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        const generator = currentGroup.elements.find(e => e.id === edge.generator);
        latex += `\\draw[->, thick] (v${sourceIndex}) -- (v${targetIndex}) node[midway, above] {$${generator?.label || edge.generator}$};\n`;
      }
    });

    latex += `\\end{tikzpicture}
\\end{center}

\\section{Group Properties}
\\begin{itemize}
\\item Order: ${currentGroup.order}
\\item Abelian: ${currentGroup.isAbelian ? 'Yes' : 'No'}
\\item Generators: ${currentGroup.generators.map(g => {
      const elem = currentGroup.elements.find(e => e.id === g);
      return `$${elem?.label || g}$`;
    }).join(', ')}
\\item Center size: ${currentGroup.center.length}
\\end{itemize}

`;

    // Add group table if small enough
    if (currentGroup.order <= 8) {
      latex += `\\section{Group Operation Table}
\\begin{center}
\\begin{tabular}{|c|${'c|'.repeat(currentGroup.order)}}
\\hline
$\\cdot$ & ${currentGroup.elements.map(e => `$${e.label}$`).join(' & ')} \\\\
\\hline
`;

      currentGroup.elements.forEach(row => {
        const operations = currentGroup.operations.get(row.id);
        if (operations) {
          latex += `$${row.label}$ & `;
          const results = currentGroup.elements.map(col => {
            const result = operations.get(col.id);
            const resultElement = currentGroup.elements.find(e => e.id === result);
            return `$${resultElement?.label || result}$`;
          }).join(' & ');
          latex += results + ' \\\\\n\\hline\n';
        }
      });

      latex += `\\end{tabular}
\\end{center}
`;
    }

    // Add subgroup information
    if (currentGroup.subgroups && currentGroup.subgroups.length > 1) {
      latex += `\\section{Subgroups}
\\begin{itemize}
`;
      currentGroup.subgroups.forEach(subgroup => {
        latex += `\\item ${subgroup.name} (Order ${subgroup.elements.length})${subgroup.isNormal ? ' - Normal' : ''}\n`;
      });
      latex += `\\end{itemize}
`;
    }

    latex += `\\end{document}`;

    return latex;
  }, [currentGraph, currentGroup]);

  const exportToLaTeX = useCallback(() => {
    const latex = generateLaTeX();
    if (!latex) return;

    const blob = new Blob([latex], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `cayley-graph-${currentGroup?.name || 'graph'}.tex`;
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, [generateLaTeX, currentGroup]);

  const handleExport = useCallback(() => {
    switch (exportFormat) {
      case 'png':
        exportToPNG();
        break;
      case 'svg':
        exportToSVG();
        break;
      case 'latex':
        exportToLaTeX();
        break;
    }
  }, [exportFormat, exportToPNG, exportToSVG, exportToLaTeX]);

  // Function to draw elliptic curve
  const drawEllipticCurve = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // This is a simplified visualization - in practice, you'd extract curve parameters from the group
    const a = 1, b = 1, p = 5; // Example parameters
    
    ctx.strokeStyle = '#8e44ad';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    
    // Draw a representative curve shape (not mathematically accurate for finite fields)
    ctx.beginPath();
    for (let x = 0; x < width; x += 2) {
      const normalizedX = (x / width) * 6 - 3;
      const y = Math.pow(normalizedX, 3) + a * normalizedX + b;
      const canvasY = height / 2 - y * 50;
      
      if (x === 0) {
        ctx.moveTo(x, canvasY);
      } else {
        ctx.lineTo(x, canvasY);
      }
    }
    ctx.stroke();
    
    ctx.globalAlpha = 1;
  }, []);

  // Function to draw animation elements
  const drawAnimationElements = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!isAnimating || currentAnimation.length === 0) return;
    
    const currentFrame = currentAnimation[animationFrame];
    if (!currentFrame) return;
    
    // Draw animation line if present
    if (currentFrame.linePoints && currentFrame.linePoints.length > 0) {
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.7;
      
      ctx.beginPath();
      currentFrame.linePoints.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    
    // Draw intersection point if present
    if (currentFrame.intersectionPoint) {
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(currentFrame.intersectionPoint.x, currentFrame.intersectionPoint.y, 8, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Draw step indicator
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Step: ${currentFrame.step}`, 10, 30);
    ctx.fillText(`Progress: ${Math.round(currentFrame.progress * 100)}%`, 10, 50);
  }, [isAnimating, currentAnimation, animationFrame]);

  // Drawing function for 2D canvas
  const drawGraph = useCallback(() => {
    if (visualizationMode !== '2d') return; // Only draw in 2D mode
    
    const canvas = canvasRef.current;
    if (!canvas || !currentGraph) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw elliptic curve if applicable
    if (isEllipticCurve && showCurve) {
      drawEllipticCurve(ctx, canvas.width, canvas.height);
    }
    
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
      // Check if this vertex is selected for animation
      const isSelected = selectedPoints.includes(vertex.id);
      const isHighlighted = highlightedElement === vertex.id;
      
      // Check if vertex belongs to highlighted subgroup
      let isInSubgroup = false;
      let subgroupColor = vertex.color;
      
      if (highlightSubgroups && currentGroup && selectedSubgroup !== 'full') {
        const subgroupIndex = parseInt(selectedSubgroup);
        const subgroup = currentGroup.subgroups?.[subgroupIndex];
        if (subgroup) {
          const element = currentGroup.elements.find(e => e.id === vertex.id);
          isInSubgroup = element ? subgroup.elements.includes(element.id) : false;
          if (isInSubgroup) {
            subgroupColor = subgroup.isNormal ? '#8e44ad' : '#e67e22'; // Purple for normal, orange for non-normal
          }
        }
      }
      
      // Apply order-based highlighting for elliptic curves
      let orderHighlight = false;
      if (isEllipticCurve && highlightSubgroups && currentGroup) {
        const element = currentGroup.elements.find(e => e.id === vertex.id);
        if (element && element.order > 1) {
          orderHighlight = true;
          // Color by order: order 2 = red, order 3 = green, order 4 = blue, etc.
          const orderColors = ['#95a5a6', '#e74c3c', '#27ae60', '#3498db', '#f39c12', '#9b59b6'];
          subgroupColor = orderColors[Math.min(element.order, orderColors.length - 1)];
        }
      }
      
      // Create gradient for enhanced 3D effect
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
      
      // Enhanced border with double outline
      ctx.strokeStyle = isSelected ? '#e74c3c' : (isInSubgroup ? subgroupColor : '#2c3e50');
      ctx.lineWidth = isSelected ? 4 : (isInSubgroup ? 3.5 : 3);
      ctx.stroke();
      
      // Inner highlight ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, radius - 4, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Subgroup indicator
      if (isInSubgroup && highlightSubgroups) {
        ctx.strokeStyle = subgroupColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, radius + 6, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Selection indicator for elliptic curves
      if (isSelected && isEllipticCurve) {
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, radius + 8, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Order indicator for elliptic curve points
      if (isEllipticCurve && highlightSubgroups && currentGroup) {
        const element = currentGroup.elements.find(e => e.id === vertex.id);
        if (element && element.order > 1) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(element.order.toString(), vertex.x + radius - 5, vertex.y - radius + 8);
        }
      }

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
    
    // Draw animation elements last so they appear on top
    drawAnimationElements(ctx);
  }, [currentGraph, showLabels, showArrows, visualizationMode, selectedPoints, highlightedElement, isEllipticCurve, highlightSubgroups, selectedSubgroup, drawAnimationElements]);

  // Canvas click handler
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentGraph) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find the clicked vertex
    const clickedVertex = currentGraph.vertices.find(vertex => {
      const distance = Math.sqrt(Math.pow(x - vertex.x, 2) + Math.pow(y - vertex.y, 2));
      return distance <= 26; // Click radius
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
                  {isEllipticCurve && (
                    <>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={showCurve}
                          onChange={(e) => setShowCurve(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Show Curve</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={highlightSubgroups}
                          onChange={(e) => setHighlightSubgroups(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">Highlight Subgroups</span>
                      </label>
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Animation Speed
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="3"
                          step="0.5"
                          value={animationSpeed}
                          onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Speed: {animationSpeed}x
                        </div>
                      </div>
                      {selectedPoints.length > 0 && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                          <div className="font-medium text-blue-800">
                            Selected Points: {selectedPoints.length}/2
                          </div>
                          {selectedPoints.length === 2 && !isAnimating && (
                            <button
                              onClick={() => startPointAdditionAnimation(selectedPoints[0], selectedPoints[1])}
                              className="mt-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                            >
                              Animate Addition
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedPoints([])}
                            className="mt-1 ml-2 px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                          >
                            Clear Selection
                          </button>
                        </div>
                      )}
                      {isAnimating && (
                        <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                          <div className="font-medium text-green-800">
                            Animation in Progress...
                          </div>
                          <div className="text-green-600">
                            Frame {animationFrame + 1} of {currentAnimation.length}
                          </div>
                          <button
                            onClick={() => {
                              setIsAnimating(false);
                              setAnimationFrame(0);
                            }}
                            className="mt-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                          >
                            Stop Animation
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Interactive Demonstrations */}
                  <div className="mt-4 border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interactive Demonstrations
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={startGroupOperationDemo}
                        disabled={!currentGroup || demoMode !== 'off'}
                        className="w-full px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        🎓 Group Properties Demo
                      </button>
                      
                      {currentGroup?.subgroups && currentGroup.subgroups.length > 0 && (
                        <button
                          onClick={startSubgroupDemo}
                          disabled={demoMode !== 'off'}
                          className="w-full px-3 py-2 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          🔍 Subgroup Structure Demo
                        </button>
                      )}
                      
                      {demoMode !== 'off' && (
                        <div className="space-y-1">
                          <button
                            onClick={advanceDemo}
                            className="w-full px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            ▶️ Next Step
                          </button>
                          <button
                            onClick={stopDemo}
                            className="w-full px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            ⏹️ Stop Demo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Export Controls */}
                  <div className="mt-4 border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Export & Share
                    </label>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Export Format
                        </label>
                        <select
                          value={exportFormat}
                          onChange={(e) => setExportFormat(e.target.value as 'png' | 'svg' | 'latex')}
                          className="w-full p-1 text-xs border border-gray-300 rounded"
                        >
                          <option value="png">PNG Image</option>
                          <option value="svg">SVG Vector</option>
                          <option value="latex">LaTeX Document</option>
                        </select>
                      </div>
                      
                      <button
                        onClick={handleExport}
                        disabled={!currentGraph}
                        className="w-full px-3 py-2 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        📥 Export {exportFormat.toUpperCase()}
                      </button>
                      
                      {exportFormat === 'latex' && (
                        <div className="text-xs text-gray-500 mt-1">
                          Includes: Graph diagram, group properties, operation table (if ≤8 elements), and subgroup information
                        </div>
                      )}
                    </div>
                  </div>
                  
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
              className="border border-blue-300 rounded-md bg-gradient-to-br from-blue-50 to-white cursor-pointer"
              onClick={handleCanvasClick}
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
            
            {/* Demonstration Results */}
            {demonstrationResult && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
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
