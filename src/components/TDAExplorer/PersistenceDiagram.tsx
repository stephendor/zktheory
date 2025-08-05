import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface PersistenceInterval {
  birth: number;
  death: number;
  dimension: number;
}

interface PersistenceData {
  pairs: PersistenceInterval[];
  filtrationValue: number;
}

interface PersistenceDiagramProps {
  persistenceData: PersistenceData | null;
  filtrationValue: number;
  width?: number;
  height?: number;
}

const PersistenceDiagram: React.FC<PersistenceDiagramProps> = ({ 
  persistenceData, 
  filtrationValue,
  width = 400,
  height = 400
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const margin = 60;
    const plotWidth = width - 2 * margin;
    const plotHeight = height - 2 * margin;

    // Clear existing content
    svg.selectAll("*").remove();

    if (!persistenceData || persistenceData.pairs.length === 0) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#64748b")
        .text("No persistence data");
      return;
    }

    // Find the maximum value for scaling
    const maxValue = Math.max(
      filtrationValue,
      d3.max(persistenceData.pairs, d => Math.max(d.birth, d.death)) || 1
    );

    // Set up scales
    const xScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([margin, margin + plotWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([margin + plotHeight, margin]);

    // Add background
    svg.append("rect")
      .attr("x", margin)
      .attr("y", margin)
      .attr("width", plotWidth)
      .attr("height", plotHeight)
      .attr("fill", "#fafafa")
      .attr("stroke", "#e2e8f0");

    // Add diagonal line (birth = death)
    svg.append("line")
      .attr("x1", margin)
      .attr("y1", margin + plotHeight)
      .attr("x2", margin + plotWidth)
      .attr("y2", margin)
      .attr("stroke", "#94a3b8")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Color scale for dimensions
    const colorScale = d3.scaleOrdinal()
      .domain(["0", "1", "2"])
      .range(["#3b82f6", "#ef4444", "#10b981"]);

    // Add persistence points
    svg.selectAll(".persistence-point")
      .data(persistenceData.pairs)
      .enter()
      .append("circle")
      .attr("class", "persistence-point")
      .attr("cx", d => xScale(d.birth))
      .attr("cy", d => yScale(d.death))
      .attr("r", 4)
      .attr("fill", d => colorScale(d.dimension.toString()) as string)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("opacity", 0.8)
      .on("mouseover", function(event, d) {
        // Show tooltip
        const tooltip = svg.append("g")
          .attr("class", "tooltip")
          .attr("transform", `translate(${xScale(d.birth) + 10}, ${yScale(d.death) - 10})`);

        const tooltipRect = tooltip.append("rect")
          .attr("fill", "rgba(0,0,0,0.8)")
          .attr("rx", 4)
          .attr("ry", 4);

        const tooltipText = tooltip.append("text")
          .attr("fill", "white")
          .attr("font-size", "12px")
          .attr("x", 8)
          .attr("y", 16)
          .text(`H${d.dimension}: (${d.birth.toFixed(3)}, ${d.death.toFixed(3)})`);

        const bbox = tooltipText.node()?.getBBox();
        if (bbox) {
          tooltipRect
            .attr("width", bbox.width + 16)
            .attr("height", bbox.height + 8);
        }

        d3.select(this).attr("r", 6);
      })
      .on("mouseout", function() {
        svg.select(".tooltip").remove();
        d3.select(this).attr("r", 4);
      });

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(6)
      .tickFormat(d3.format(".2f"));

    const yAxis = d3.axisLeft(yScale)
      .ticks(6)
      .tickFormat(d3.format(".2f"));

    svg.append("g")
      .attr("transform", `translate(0, ${margin + plotHeight})`)
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
      .style("font-size", "14px")
      .style("fill", "#374151")
      .text("Birth");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 20)
      .attr("x", -height / 2)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#374151")
      .text("Death");

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#1f2937")
      .text("Persistence Diagram");

    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 120}, ${margin + 20})`);

    const legendData = [
      { dim: 0, label: "H₀ (Connected Components)", color: colorScale("0") },
      { dim: 1, label: "H₁ (Loops)", color: colorScale("1") },
      { dim: 2, label: "H₂ (Voids)", color: colorScale("2") }
    ];

    legendData.forEach((item, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendItem.append("circle")
        .attr("r", 4)
        .attr("fill", item.color as string);

      legendItem.append("text")
        .attr("x", 10)
        .attr("y", 4)
        .style("font-size", "12px")
        .style("fill", "#374151")
        .text(item.label);
    });

  }, [persistenceData, filtrationValue, width, height]);

  return (
    <div className="persistence-diagram-container">
      <svg 
        ref={svgRef} 
        width={width} 
        height={height}
        className="persistence-diagram-svg"
      />
    </div>
  );
};

export default PersistenceDiagram;