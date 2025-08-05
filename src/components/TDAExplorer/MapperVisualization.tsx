import React, { useRef, useEffect } from 'react';
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

    // Add background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#fafafa")
      .attr("stroke", "#e2e8f0")
      .attr("rx", 8);

    // Create force simulation with proper bounds
    const boundsMargin = 60;
    const simulation = d3.forceSimulation(mapperData.nodes)
      .force("link", d3.forceLink(mapperData.links)
        .id((d: any) => d.id)
        .distance(80)
        .strength(0.4))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => d.radius + 10))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1))
      .force("bounds", () => {
        mapperData.nodes.forEach(node => {
          node.x = Math.max(boundsMargin + node.radius, Math.min(width - boundsMargin - node.radius, node.x || width / 2));
          node.y = Math.max(boundsMargin + node.radius, Math.min(height - boundsMargin - node.radius, node.y || height / 2));
        });
      });

    // Add links
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(mapperData.links)
      .enter()
      .append("line")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d: MapperLink) => Math.sqrt(d.weight) * 3);

    // Add nodes
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(mapperData.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer");

    // Add node circles
    node.append("circle")
      .attr("r", (d: MapperNode) => d.radius)
      .attr("fill", (d: MapperNode) => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", function(event, d) {
        // Highlight node
        d3.select(this)
          .attr("stroke", "#1f2937")
          .attr("stroke-width", 3);

        // Show tooltip
        const tooltip = svg.append("g")
          .attr("class", "tooltip")
          .attr("transform", `translate(${d.x + d.radius + 10}, ${d.y - 20})`);

        const tooltipRect = tooltip.append("rect")
          .attr("fill", "rgba(0,0,0,0.8)")
          .attr("rx", 4)
          .attr("ry", 4);

        const tooltipText = tooltip.append("text")
          .attr("fill", "white")
          .attr("font-size", "12px")
          .attr("x", 8)
          .attr("y", 16);

        tooltipText.append("tspan")
          .attr("x", 8)
          .attr("dy", 0)
          .text(`Cluster ${d.label}`);

        tooltipText.append("tspan")
          .attr("x", 8)
          .attr("dy", 14)
          .text(`Size: ${d.size} points`);

        tooltipText.append("tspan")
          .attr("x", 8)
          .attr("dy", 14)
          .text(`Position: (${d.x.toFixed(1)}, ${d.y.toFixed(1)})`);

        const bbox = tooltipText.node()?.getBBox();
        if (bbox) {
          tooltipRect
            .attr("width", bbox.width + 16)
            .attr("height", bbox.height + 8);
        }

        // Highlight connected links
        link.attr("stroke", (l: MapperLink) => 
          l.source === d.id || l.target === d.id ? "#ef4444" : "#94a3b8")
          .attr("stroke-width", (l: MapperLink) => 
            l.source === d.id || l.target === d.id ? Math.sqrt(l.weight) * 5 : Math.sqrt(l.weight) * 3);
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("stroke", "#fff")
          .attr("stroke-width", 2);

        svg.select(".tooltip").remove();

        // Reset link highlighting
        link.attr("stroke", "#94a3b8")
          .attr("stroke-width", (d: MapperLink) => Math.sqrt(d.weight) * 3);
      });

    // Add node labels
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#fff")
      .style("pointer-events", "none")
      .text((d: MapperNode) => d.label);

    // Add drag behavior
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

      node
        .attr("transform", (d: MapperNode) => `translate(${d.x},${d.y})`);
    });

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", "#1f2937")
      .text("Mapper Network Visualization");

    // Add instructions
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#64748b")
      .text("Drag nodes to explore • Hover for details • Node size reflects cluster size");

    // Add network statistics
    const stats = svg.append("g")
      .attr("class", "stats")
      .attr("transform", `translate(${margin}, ${margin})`);

    stats.append("rect")
      .attr("width", 200)
      .attr("height", 80)
      .attr("fill", "rgba(255,255,255,0.9)")
      .attr("stroke", "#e2e8f0")
      .attr("rx", 4);

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

    // Cleanup
    return () => {
      simulation.stop();
    };

  }, [mapperData, width, height]);

  return (
    <div className="mapper-visualization-container">
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