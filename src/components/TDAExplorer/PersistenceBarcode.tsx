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

interface PersistenceBarcodeProps {
  persistenceData: PersistenceData | null;
  filtrationValue: number;
  width?: number;
  height?: number;
}

const PersistenceBarcode: React.FC<PersistenceBarcodeProps> = ({ 
  persistenceData, 
  filtrationValue,
  width = 600,
  height = 300
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const margin = { top: 40, right: 160, bottom: 50, left: 50 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

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

    // Sort intervals by persistence (death - birth) in descending order
    const sortedPairs = [...persistenceData.pairs]
      .sort((a, b) => (b.death - b.birth) - (a.death - a.birth));

    // Find the maximum value for scaling - be more conservative to ensure everything fits
    const dataMax = d3.max(sortedPairs, d => Math.max(d.birth, d.death)) || 0;
    const domainMax = Math.max(filtrationValue, dataMax, 1);
    
    // Set up scales - use the exact domain without padding to maximize use of available space
    const xScale = d3.scaleLinear()
      .domain([0, domainMax])
      .range([0, plotWidth]);

    const yScale = d3.scaleBand()
      .domain(sortedPairs.map((_, i) => i.toString()))
      .range([0, plotHeight])
      .padding(0.1);

    // Color scale for dimensions
    const colorScale = d3.scaleOrdinal()
      .domain(["0", "1", "2"])
      .range(["#3b82f6", "#ef4444", "#10b981"]);

    // Add clipping path to contain all elements
    svg.append("defs")
      .append("clipPath")
      .attr("id", "barcode-clip")
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", plotWidth)
      .attr("height", plotHeight);

    // Add background
    svg.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", plotWidth)
      .attr("height", plotHeight)
      .attr("fill", "#fafafa")
      .attr("stroke", "#e2e8f0");

    // Add filtration line (only if within bounds)
    const filtrationX = xScale(filtrationValue);
    if (filtrationX >= 0 && filtrationX <= plotWidth) {
      svg.append("line")
        .attr("x1", margin.left + filtrationX)
        .attr("y1", margin.top)
        .attr("x2", margin.left + filtrationX)
        .attr("y2", margin.top + plotHeight)
        .attr("stroke", "#dc2626")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.8);

      // Add filtration line label
      svg.append("text")
        .attr("x", margin.left + Math.min(filtrationX + 5, plotWidth - 100))
        .attr("y", margin.top + 15)
        .style("font-size", "12px")
        .style("fill", "#dc2626")
        .text(`Filtration: ${filtrationValue.toFixed(3)}`);
    }

    // Add barcode bars with clipping
    const barsGroup = svg.append("g")
      .attr("clip-path", "url(#barcode-clip)");

    const bars = barsGroup.selectAll(".barcode-bar")
      .data(sortedPairs)
      .enter()
      .append("g")
      .attr("class", "barcode-bar");

    bars.append("rect")
      .attr("x", d => margin.left + xScale(d.birth))
      .attr("y", (_, i) => margin.top + (yScale(i.toString()) || 0))
      .attr("width", d => xScale(d.death) - xScale(d.birth))
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(d.dimension.toString()) as string)
      .attr("opacity", 0.8)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .on("mouseover", function(event, d) {
        // Highlight bar
        d3.select(this).attr("opacity", 1).attr("stroke-width", 2);
        
        // Show tooltip
        const tooltip = svg.append("g")
          .attr("class", "tooltip");

        const persistence = d.death - d.birth;
        const tooltipText = `H${d.dimension}: Birth=${d.birth.toFixed(3)}, Death=${d.death.toFixed(3)}, Persistence=${persistence.toFixed(3)}`;
        
        const textElement = tooltip.append("text")
          .attr("x", margin.left + xScale(d.birth) + (xScale(d.death) - xScale(d.birth)) / 2)
          .attr("y", margin.top + (yScale(sortedPairs.indexOf(d).toString()) || 0) - 5)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .style("fill", "#1f2937")
          .style("font-weight", "bold")
          .text(tooltipText);

        // Add background for tooltip
        const bbox = textElement.node()?.getBBox();
        if (bbox) {
          tooltip.insert("rect", "text")
            .attr("x", bbox.x - 4)
            .attr("y", bbox.y - 2)
            .attr("width", bbox.width + 8)
            .attr("height", bbox.height + 4)
            .attr("fill", "rgba(255,255,255,0.9)")
            .attr("stroke", "#e2e8f0")
            .attr("rx", 4);
        }
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 0.8).attr("stroke-width", 1);
        svg.select(".tooltip").remove();
      });

    // Add birth markers (small circles at the start of bars)
    bars.append("circle")
      .attr("cx", d => margin.left + xScale(d.birth))
      .attr("cy", (_, i) => margin.top + (yScale(i.toString()) || 0) + yScale.bandwidth() / 2)
      .attr("r", 3)
      .attr("fill", "#374151")
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    // Add persistence values as text (positioned inside the bars)
    bars.append("text")
      .attr("x", d => margin.left + xScale(d.birth) + 5)
      .attr("y", (_, i) => margin.top + (yScale(i.toString()) || 0) + yScale.bandwidth() / 2 + 4)
      .style("font-size", "10px")
      .style("fill", "white")
      .style("font-weight", "bold")
      .text(d => `H${d.dimension}: ${(d.death - d.birth).toFixed(3)}`);

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(8)
      .tickFormat(d3.format(".2f"));

    svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top + plotHeight})`)
      .call(xAxis)
      .style("color", "#64748b");

    // Add axis labels
    svg.append("text")
      .attr("transform", `translate(${width / 2}, ${height - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#374151")
      .text("Filtration Parameter");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 20)
      .attr("x", -height / 2)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#374151")
      .text("Persistence Intervals");

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#1f2937")
      .text("Persistence Barcode");

    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${margin.left + plotWidth + 20}, ${margin.top})`);

    const legendData = [
      { dim: 0, label: "H₀", color: colorScale("0") },
      { dim: 1, label: "H₁", color: colorScale("1") },
      { dim: 2, label: "H₂", color: colorScale("2") }
    ];

    legendData.forEach((item, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendItem.append("rect")
        .attr("width", 15)
        .attr("height", 10)
        .attr("fill", item.color as string);

      legendItem.append("text")
        .attr("x", 20)
        .attr("y", 8)
        .style("font-size", "12px")
        .style("fill", "#374151")
        .text(item.label);
    });

  }, [persistenceData, filtrationValue, width, height]);

  return (
    <div className="persistence-barcode-container">
      <svg 
        ref={svgRef} 
        width={width} 
        height={height}
        className="persistence-barcode-svg"
      />
    </div>
  );
};

export default PersistenceBarcode;