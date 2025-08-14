import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';

interface Point {
  x: number;
  y: number;
  id: number;
}

interface MapperNode {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  size: number;
  color: string;
  points: Point[];
  fx?: number | null;
  fy?: number | null;
}

interface MapperLink {
  source: string;
  target: string;
  weight: number;
  distance: number;
}

interface MapperData {
  nodes: MapperNode[];
  links: MapperLink[];
}

interface MapperVisualizationProps {
  mapperData: MapperData | null;
  width?: number;
  height?: number;
}

const MapperVisualization: React.FC<MapperVisualizationProps> = ({ 
  mapperData,
  width = 800,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showEdgeWeights, setShowEdgeWeights] = useState(true);
  const [showNodeDetails, setShowNodeDetails] = useState(true);

  // Enhanced color scale for better cluster visualization
  const getClusterColor = useCallback((node: MapperNode) => {
    // Use a more sophisticated color scheme based on cluster properties
    const hue = (parseInt(node.id) * 137.5) % 360; // Golden angle for good distribution
    const saturation = 70 + (node.size % 30); // Vary saturation by size
    const lightness = 45 + (node.size % 20); // Vary lightness by size
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }, []);

  // Calculate edge thickness based on weight
  const getEdgeThickness = useCallback((link: MapperLink) => {
    const baseThickness = 2;
    const weightFactor = Math.sqrt(link.weight) * 4;
    return Math.max(baseThickness, Math.min(weightFactor, 12)); // Cap at 12px
  }, []);

  // Enhanced tooltip content
  const getTooltipContent = useCallback((node: MapperNode) => {
    const avgX = d3.mean(node.points, p => p.x) || 0;
    const avgY = d3.mean(node.points, p => p.y) || 0;
    const stdDevX = d3.deviation(node.points, p => p.x) || 0;
    const stdDevY = d3.deviation(node.points, p => p.y) || 0;
    
    return [
      `Cluster ${node.label}`,
      `Size: ${node.size} points`,
      `Position: (${node.x.toFixed(1)}, ${node.y.toFixed(1)})`,
      `Center: (${avgX.toFixed(2)}, ${avgY.toFixed(2)})`,
      `Spread: ±${stdDevX.toFixed(2)}, ±${stdDevY.toFixed(2)}`,
      `Density: ${(node.size / (Math.PI * node.radius * node.radius)).toFixed(2)}`
    ];
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const margin = 40;

    // Clear existing content
    svg.selectAll("*").remove();

    if (!mapperData || mapperData.nodes.length === 0) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#64748b")
        .text("No mapper data - generate points and compute network");
      return;
    }

    // Create main group for zoom/pan transformations
    const mainGroup = svg.append("g")
      .attr("class", "main-group");

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

    // Create force simulation with enhanced bounds
    const boundsMargin = 80;
    const simulation = d3.forceSimulation(mapperData.nodes)
      .force("link", d3.forceLink(mapperData.links)
        .id((d: any) => d.id)
        .distance(100)
        .strength(0.3))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => d.radius + 15))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05))
      .force("bounds", () => {
        mapperData.nodes.forEach(node => {
          node.x = Math.max(boundsMargin + node.radius, Math.min(width - boundsMargin - node.radius, node.x || width / 2));
          node.y = Math.max(boundsMargin + node.radius, Math.min(height - boundsMargin - node.radius, node.y || height / 2));
        });
      });

    // Add links with enhanced visualization
    const link = mainGroup.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(mapperData.links)
      .enter()
      .append("line")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.7)
      .attr("stroke-width", (d: MapperLink) => getEdgeThickness(d))
      .attr("stroke-linecap", "round");

    // Add edge weight labels if enabled
    if (showEdgeWeights) {
      mainGroup.append("g")
        .attr("class", "edge-labels")
        .selectAll("text")
        .data(mapperData.links)
        .enter()
        .append("text")
        .attr("class", "edge-label")
        .style("font-size", "10px")
        .style("fill", "#64748b")
        .style("pointer-events", "none")
        .text((d: MapperLink) => d.weight.toFixed(2));
    }

    // Add nodes with enhanced interactivity
    const node = mainGroup.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(mapperData.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer");

    // Add node circles with enhanced styling
    node.append("circle")
      .attr("r", (d: MapperNode) => d.radius)
      .attr("fill", (d: MapperNode) => getClusterColor(d))
      .attr("stroke", (d: MapperNode) => selectedNode === d.id ? "#1f2937" : "#fff")
      .attr("stroke-width", (d: MapperNode) => selectedNode === d.id ? 4 : 2)
      .attr("opacity", (d: MapperNode) => selectedNode === null || selectedNode === d.id ? 1 : 0.8)
      .on("mouseover", function(event, d) {
        if (selectedNode !== d.id) {
          d3.select(this)
            .attr("stroke", "#3b82f6")
            .attr("stroke-width", 3)
            .attr("opacity", 1);
        }

        // Enhanced tooltip
        const tooltip = mainGroup.append("g")
          .attr("class", "tooltip")
          .attr("transform", `translate(${d.x + d.radius + 15}, ${d.y - 25})`);

        const tooltipRect = tooltip.append("rect")
          .attr("fill", "rgba(0,0,0,0.9)")
          .attr("rx", 6)
          .attr("ry", 6);

        const tooltipText = tooltip.append("g");
        const tooltipContent = getTooltipContent(d);
        
        tooltipContent.forEach((text, i) => {
          tooltipText.append("text")
            .attr("fill", "white")
            .attr("font-size", "11px")
            .attr("x", 8)
            .attr("y", 16 + i * 14)
            .text(text);
        });

        const bbox = tooltipText.node()?.getBBox();
        if (bbox) {
          tooltipRect
            .attr("x", bbox.x - 8)
            .attr("y", bbox.y - 4)
            .attr("width", bbox.width + 16)
            .attr("height", bbox.height + 8);
        }

        // Highlight connected links
        link.attr("stroke", (l: MapperLink) => 
          l.source === d.id || l.target === d.id ? "#ef4444" : "#94a3b8")
          .attr("stroke-width", (l: MapperLink) => 
            l.source === d.id || l.target === d.id ? getEdgeThickness(l) + 2 : getEdgeThickness(l))
          .attr("stroke-opacity", (l: MapperLink) => 
            l.source === d.id || l.target === d.id ? 1 : 0.7);
      })
      .on("mouseout", function(event, d) {
        if (selectedNode !== d.id) {
          d3.select(this)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .attr("opacity", 0.8);
        }

        mainGroup.select(".tooltip").remove();

        // Reset link highlighting
        link.attr("stroke", "#94a3b8")
          .attr("stroke-width", (d: MapperLink) => getEdgeThickness(d))
          .attr("stroke-opacity", 0.7);
      })
      .on("click", function(event, d) {
        // Toggle node selection
        if (selectedNode === d.id) {
          setSelectedNode(null);
          d3.select(this)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .attr("opacity", 0.8);
        } else {
          setSelectedNode(d.id);
          d3.select(this)
            .attr("stroke", "#1f2937")
            .attr("stroke-width", 4)
            .attr("opacity", 1);
        }
      });

    // Add node labels with enhanced visibility
    if (showNodeDetails) {
      node.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .style("fill", "#fff")
        .style("pointer-events", "none")
        .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
        .text((d: MapperNode) => d.label);

      // Add point count labels
      node.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1.2em")
        .style("font-size", "9px")
        .style("fill", "#fff")
        .style("pointer-events", "none")
        .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
        .text((d: MapperNode) => `${d.size}`);
    }

    // Enhanced drag behavior
    const drag = d3.drag<SVGGElement, MapperNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag);

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      // Update edge labels if enabled
      if (showEdgeWeights) {
        mainGroup.selectAll(".edge-label")
          .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
          .attr("y", (d: any) => (d.source.y + d.target.y) / 2);
      }

      node
        .attr("transform", (d: MapperNode) => `translate(${d.x},${d.y})`);
    });

    // Enhanced title with zoom level
    mainGroup.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", "#1f2937")
      .text("Mapper Network Visualization");

    // Enhanced instructions
    mainGroup.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#64748b")
      .text("Drag to move • Scroll to zoom • Click to select • Hover for details");

    // Enhanced network statistics
    const stats = mainGroup.append("g")
      .attr("class", "stats")
      .attr("transform", `translate(${margin}, ${margin})`);

    stats.append("rect")
      .attr("width", 220)
      .attr("height", 100)
      .attr("fill", "rgba(255,255,255,0.95)")
      .attr("stroke", "#e2e8f0")
      .attr("rx", 6);

    stats.append("text")
      .attr("x", 10)
      .attr("y", 20)
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#1f2937")
      .text("Network Statistics");

    stats.append("text")
      .attr("x", 10)
      .attr("y", 40)
      .style("font-size", "12px")
      .style("fill", "#374151")
      .text(`Nodes: ${mapperData.nodes.length}`);

    stats.append("text")
      .attr("x", 10)
      .attr("y", 55)
      .style("font-size", "12px")
      .style("fill", "#374151")
      .text(`Edges: ${mapperData.links.length}`);

    const avgDegree = mapperData.links.length > 0 
      ? (2 * mapperData.links.length / mapperData.nodes.length).toFixed(1)
      : "0";

    stats.append("text")
      .attr("x", 10)
      .attr("y", 70)
      .style("font-size", "12px")
      .style("fill", "#374151")
      .text(`Avg Degree: ${avgDegree}`);

    const totalPoints = mapperData.nodes.reduce((sum, node) => sum + node.size, 0);
    stats.append("text")
      .attr("x", 10)
      .attr("y", 85)
      .style("font-size", "12px")
      .style("fill", "#374151")
      .text(`Total Points: ${totalPoints}`);

    // Add zoom controls
    const zoomControls = mainGroup.append("g")
      .attr("class", "zoom-controls")
      .attr("transform", `translate(${width - 80}, ${margin})`);

    // Zoom in button
    zoomControls.append("circle")
      .attr("r", 15)
      .attr("fill", "rgba(255,255,255,0.9)")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("click", () => {
        svg.transition().call(zoom.scaleBy, 1.5);
      });

    zoomControls.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#374151")
      .style("pointer-events", "none")
      .text("+");

    // Zoom out button
    zoomControls.append("circle")
      .attr("r", 15)
      .attr("transform", "translate(0, 35)")
      .attr("fill", "rgba(255,255,255,0.9)")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("click", () => {
        svg.transition().call(zoom.scaleBy, 0.67);
      });

    zoomControls.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("transform", "translate(0, 35)")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#374151")
      .style("pointer-events", "none")
      .text("−");

    // Reset zoom button
    zoomControls.append("circle")
      .attr("r", 15)
      .attr("transform", "translate(0, 70)")
      .attr("fill", "rgba(255,255,255,0.9)")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("click", () => {
        svg.transition().call(zoom.transform, d3.zoomIdentity);
      });

    zoomControls.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("transform", "translate(0, 70)")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#374151")
      .style("pointer-events", "none")
      .text("⌂");

    // Cleanup
    return () => {
      simulation.stop();
    };

  }, [mapperData, width, height, selectedNode, showEdgeWeights, showNodeDetails, getClusterColor, getEdgeThickness, getTooltipContent]);

  return (
    <div className="mapper-visualization-container">
      {/* Enhanced Control Panel */}
      <div className="mapper-controls">
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={showEdgeWeights}
              onChange={(e) => setShowEdgeWeights(e.target.checked)}
            />
            Show Edge Weights
          </label>
        </div>
        
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={showNodeDetails}
              onChange={(e) => setShowNodeDetails(e.target.checked)}
            />
            Show Node Details
          </label>
        </div>
        
        {selectedNode && (
          <div className="selection-info">
            <span>Selected: {selectedNode}</span>
            <button 
              onClick={() => setSelectedNode(null)}
              className="clear-selection-btn"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <svg 
        ref={svgRef} 
        width={width} 
        height={height}
        className="mapper-visualization-svg"
      />
    </div>
  );
};

export default MapperVisualization;