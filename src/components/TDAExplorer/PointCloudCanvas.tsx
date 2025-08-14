import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface Point {
  x: number;
  y: number;
  id: number;
  density?: number;
  color?: string;
  label?: string;
}

interface PointCloudCanvasProps {
  points: Point[];
  onPointsChange: (points: Point[]) => void;
  filtrationValue?: number;
  width?: number;
  height?: number;
}

const PointCloudCanvas: React.FC<PointCloudCanvasProps> = ({ 
  points, 
  onPointsChange, 
  filtrationValue = 0.5,
  width = 600,
  height = 400
}) => {
  // Use container dimensions if not specified
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(width);
  const [containerHeight, setContainerHeight] = useState(height);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const margin = 50;

    // Clear existing content
    svg.selectAll("*").remove();

    // Set up scales
    const xScale = d3.scaleLinear().domain([0, 1]).range([margin, width - margin]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([height - margin, margin]);

    // Add background rectangle for click handling
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 2)
      .attr("rx", 8)
      .style("cursor", isDrawing ? "crosshair" : "default")
      .on("click", (event) => {
        if (!isDrawing) return;
        
        const [mouseX, mouseY] = d3.pointer(event);
        const newPoint: Point = {
          x: xScale.invert(mouseX),
          y: yScale.invert(mouseY),
          id: Date.now()
        };
        
        onPointsChange([...points, newPoint]);
      });

    // Draw edges based on filtration value
    const edges: Array<{ source: Point; target: Point; distance: number }> = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dist = Math.sqrt(
          Math.pow(points[i].x - points[j].x, 2) + 
          Math.pow(points[i].y - points[j].y, 2)
        );
        if (dist <= filtrationValue) {
          edges.push({
            source: points[i],
            target: points[j],
            distance: dist
          });
        }
      }
    }

    // Draw edges
    svg.selectAll(".edge")
      .data(edges)
      .enter()
      .append("line")
      .attr("class", "edge")
      .attr("x1", d => xScale(d.source.x))
      .attr("y1", d => yScale(d.source.y))
      .attr("x2", d => xScale(d.target.x))
      .attr("y2", d => yScale(d.target.y))
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.6);

    // Draw points with enhanced properties
    svg.selectAll(".point")
      .data(points)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 6)
      .attr("fill", d => d.color || "#3b82f6")
      .attr("stroke", d => d.color ? d3.color(d.color)?.darker(0.3)?.toString() || "#1e40af" : "#1e40af")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        if (event.shiftKey) {
          // Remove point on shift+click
          onPointsChange(points.filter(p => p.id !== d.id));
        }
      })
      .on("mouseover", function(event, d) {
        d3.select(this).attr("r", 8);
        
        // Show tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "point-tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "8px 12px")
          .style("border-radius", "6px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("z-index", "1000");
        
        const tooltipContent = [
          `Point ${d.id}`,
          `Position: (${d.x.toFixed(3)}, ${d.y.toFixed(3)})`,
          ...(d.density !== undefined ? [`Density: ${d.density.toFixed(3)}`] : []),
          ...(d.label ? [d.label] : [])
        ].join('<br/>');
        
        tooltip.html(tooltipContent);
        
        // Position tooltip near mouse
        const [mouseX, mouseY] = d3.pointer(event);
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("r", 6);
        // Remove tooltip
        d3.selectAll(".point-tooltip").remove();
      });

    // Add axes
    const xAxis = d3.axisBottom(xScale).ticks(5);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    svg.append("g")
      .attr("transform", `translate(0, ${height - margin})`)
      .call(xAxis)
      .style("color", "#64748b");

    svg.append("g")
      .attr("transform", `translate(${margin}, 0)`)
      .call(yAxis)
      .style("color", "#64748b");

    // Add axis labels
    svg.append("text")
      .attr("transform", `translate(${width / 2}, ${height - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#64748b")
      .text("X Coordinate");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 15)
      .attr("x", -height / 2)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#64748b")
      .text("Y Coordinate");

  }, [points, filtrationValue, isDrawing, onPointsChange, width, height]);

  return (
    <div className="point-cloud-container">
      <div className="point-cloud-controls">
        <button 
          onClick={() => setIsDrawing(!isDrawing)}
          className={`btn ${isDrawing ? 'btn-success' : 'btn-primary'}`}
        >
          {isDrawing ? 'Stop Drawing' : 'Draw Points'}
        </button>
        <button 
          onClick={() => onPointsChange([])}
          className="btn btn-secondary"
        >
          Clear All
        </button>
      </div>
      <div className="instructions">
        {isDrawing 
          ? 'Click to add points, Shift+Click to remove points' 
          : 'Enable drawing mode to interact with points'
        }
      </div>
      <svg 
        ref={svgRef} 
        width={width} 
        height={height}
        className="point-cloud-svg"
      />
    </div>
  );
};

export default PointCloudCanvas;