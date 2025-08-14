import React, { useRef, useEffect, useState } from 'react';
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
  const [filteredData, setFilteredData] = useState<PersistenceInterval[]>([]);
  const [selectedDimension, setSelectedDimension] = useState<number | null>(null);

  // Filter data based on dimension selection
  useEffect(() => {
    if (!persistenceData?.pairs) {
      setFilteredData([]);
      return;
    }

    if (selectedDimension === null) {
      setFilteredData(persistenceData.pairs);
    } else {
      setFilteredData(persistenceData.pairs.filter(d => d.dimension === selectedDimension));
    }
  }, [persistenceData, selectedDimension]);

  // Main rendering effect
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const margin = 60;
    const plotWidth = width - 2 * margin;
    const plotHeight = height - 2 * margin;

    // Clear existing content
    svg.selectAll("*").remove();

    if (!persistenceData || filteredData.length === 0) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#64748b")
        .text(filteredData.length === 0 ? "No data matches filters" : "No persistence data");
      return;
    }

    const maxValue = Math.max(
      filtrationValue,
      d3.max(filteredData, d => Math.max(d.birth, d.death)) || 1
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
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("class", "persistence-point")
      .attr("cx", d => xScale(d.birth))
      .attr("cy", d => yScale(d.death))
      .attr("r", 5)
      .attr("fill", d => colorScale(d.dimension.toString()) as string)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("opacity", 0.9)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        // Enhanced tooltip
        const tooltip = svg.append("g")
          .attr("class", "tooltip")
          .attr("transform", `translate(${xScale(d.birth) + 15}, ${yScale(d.death) - 15}`);

        const tooltipRect = tooltip.append("rect")
          .attr("fill", "rgba(0,0,0,0.9)")
          .attr("rx", 6)
          .attr("ry", 6);

        const tooltipContent = [
          `H${d.dimension}: (${d.birth.toFixed(3)}, ${d.death.toFixed(3)})`,
          `Persistence: ${(d.death - d.birth).toFixed(3)}`,
          `Dimension: ${d.dimension === 0 ? 'Connected Components' : d.dimension === 1 ? 'Loops' : 'Voids'}`
        ];

        const tooltipTexts = tooltip.append("g");
        tooltipContent.forEach((text, i) => {
          tooltipTexts.append("text")
            .attr("fill", "white")
            .attr("font-size", "11px")
            .attr("x", 8)
            .attr("y", 16 + i * 14)
            .text(text);
        });

        const bbox = tooltipTexts.node()?.getBBox();
        if (bbox) {
          tooltipRect
            .attr("width", bbox.width + 16)
            .attr("height", bbox.height + 12);
        }

        d3.select(this).attr("r", 7).attr("stroke-width", 3);
      })
      .on("mouseout", function() {
        svg.select(".tooltip").remove();
        d3.select(this).attr("r", 5).attr("stroke-width", 2);
      })
      .on("click", function(event, d) {
        // Toggle dimension selection
        setSelectedDimension(selectedDimension === d.dimension ? null : d.dimension);
      });

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(8)
      .tickFormat(d3.format(".2f"));

    const yAxis = d3.axisLeft(yScale)
      .ticks(8)
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
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text("Birth Value");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 20)
      .attr("x", -height / 2)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text("Death Value");

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#1f2937")
      .text(`Persistence Diagram (${filteredData.length} features)`);

    // Add legend with filtering
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 140}, ${margin + 20})`);

    const legendData = [
      { dim: 0, label: "H₀ (Components)", color: colorScale("0") },
      { dim: 1, label: "H₁ (Loops)", color: colorScale("1") },
      { dim: 2, label: "H₂ (Voids)", color: colorScale("2") }
    ];

    legendData.forEach((item, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`)
        .style("cursor", "pointer")
        .on("click", () => setSelectedDimension(selectedDimension === item.dim ? null : item.dim));

      const isSelected = selectedDimension === null || selectedDimension === item.dim;
      const opacity = isSelected ? 1 : 0.3;

      legendItem.append("circle")
        .attr("r", 5)
        .attr("fill", item.color as string)
        .attr("opacity", opacity);

      legendItem.append("text")
        .attr("x", 12)
        .attr("y", 4)
        .style("font-size", "11px")
        .style("fill", isSelected ? "#374151" : "#9ca3af")
        .text(item.label);

      // Add selection indicator
      if (selectedDimension === item.dim) {
        legendItem.append("circle")
          .attr("r", 8)
          .attr("fill", "none")
          .attr("stroke", "#3b82f6")
          .attr("stroke-width", 2);
      }
    });

  }, [persistenceData, filteredData, filtrationValue, width, height, selectedDimension]);

  return (
    <div className="persistence-diagram-container">
      {/* Simple Filter Controls */}
      <div className="diagram-controls">
        <div className="control-group">
          <label>Dimension Filter:</label>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${selectedDimension === null ? 'active' : ''}`}
              onClick={() => setSelectedDimension(null)}
            >
              All
            </button>
            <button 
              className={`filter-btn ${selectedDimension === 0 ? 'active' : ''}`}
              onClick={() => setSelectedDimension(0)}
            >
              H₀
            </button>
            <button 
              className={`filter-btn ${selectedDimension === 1 ? 'active' : ''}`}
              onClick={() => setSelectedDimension(1)}
            >
              H₁
            </button>
            <button 
              className={`filter-btn ${selectedDimension === 2 ? 'active' : ''}`}
              onClick={() => setSelectedDimension(2)}
            >
              H₂
            </button>
          </div>
        </div>
      </div>

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

