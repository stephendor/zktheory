import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  const [filteredData, setFilteredData] = useState<PersistenceInterval[]>([]);
  const [selectedDimension, setSelectedDimension] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'persistence' | 'birth' | 'dimension'>('persistence');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [highlightedBar, setHighlightedBar] = useState<number | null>(null);
  const [showStatistics, setShowStatistics] = useState(true);

  // Calculate persistence statistics
  const calculateStats = useCallback((data: PersistenceInterval[]) => {
    if (!data.length) return null;
    
    const persistenceLengths = data.map(d => d.death - d.birth);
    const byDimension = {
      0: data.filter(d => d.dimension === 0),
      1: data.filter(d => d.dimension === 1),
      2: data.filter(d => d.dimension === 2)
    };

    return {
      total: data.length,
      byDimension: {
        0: byDimension[0].length,
        1: byDimension[1].length,
        2: byDimension[2].length
      },
      averagePersistence: d3.mean(persistenceLengths) || 0,
      maxPersistence: d3.max(persistenceLengths) || 0,
      minPersistence: d3.min(persistenceLengths) || 0,
      stdDev: d3.deviation(persistenceLengths) || 0,
      totalPersistence: d3.sum(persistenceLengths) || 0
    };
  }, []);

  // Filter and sort data
  useEffect(() => {
    if (!persistenceData?.pairs) {
      setFilteredData([]);
      return;
    }

    let filtered = persistenceData.pairs;
    
    // Apply dimension filter
    if (selectedDimension !== null) {
      filtered = filtered.filter(d => d.dimension === selectedDimension);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'persistence':
          aValue = a.death - a.birth;
          bValue = b.death - b.birth;
          break;
        case 'birth':
          aValue = a.birth;
          bValue = b.birth;
          break;
        case 'dimension':
          aValue = a.dimension;
          bValue = b.dimension;
          break;
        default:
          aValue = a.death - a.birth;
          bValue = b.death - b.birth;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredData(filtered);
  }, [persistenceData, selectedDimension, sortBy, sortOrder]);

  // Main rendering effect
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const margin = { top: 40, right: 200, bottom: 50, left: 50 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

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

    const stats = calculateStats(filteredData);

    // Find the maximum value for scaling
    const dataMax = d3.max(filteredData, d => Math.max(d.birth, d.death)) || 0;
    const domainMax = Math.max(filtrationValue, dataMax, 1);
    
    // Set up scales
    const xScale = d3.scaleLinear()
      .domain([0, domainMax])
      .range([0, plotWidth]);

    const yScale = d3.scaleBand()
      .domain(filteredData.map((_, i) => i.toString()))
      .range([0, plotHeight])
      .padding(0.15);

    // Enhanced color scale for dimensions
    const colorScale = d3.scaleOrdinal()
      .domain(["0", "1", "2"])
      .range(["#3b82f6", "#ef4444", "#10b981"]);

    // Add clipping path
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

    // Add filtration line
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

      svg.append("text")
        .attr("x", margin.left + Math.min(filtrationX + 5, plotWidth - 100))
        .attr("y", margin.top + 15)
        .style("font-size", "12px")
        .style("fill", "#dc2626")
        .style("font-weight", "600")
        .text(`Filtration: ${filtrationValue.toFixed(3)}`);
    }

    // Add barcode bars with enhanced interactivity
    const barsGroup = svg.append("g")
      .attr("clip-path", "url(#barcode-clip)");

    const bars = barsGroup.selectAll(".barcode-bar")
      .data(filteredData)
      .enter()
      .append("g")
      .attr("class", "barcode-bar")
      .style("cursor", "pointer");

    // Enhanced bars with better visual feedback
    bars.append("rect")
      .attr("x", d => margin.left + xScale(d.birth))
      .attr("y", (_, i) => margin.top + (yScale(i.toString()) || 0))
      .attr("width", d => Math.max(1, xScale(d.death) - xScale(d.birth)))
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(d.dimension.toString()) as string)
      .attr("opacity", (_, i) => highlightedBar === i ? 1 : 0.8)
      .attr("stroke", (_, i) => highlightedBar === i ? "#1f2937" : "white")
      .attr("stroke-width", (_, i) => highlightedBar === i ? 3 : 1)
      .attr("rx", 2)
      .on("mouseover", function(event, d) {
        const i = bars.data().indexOf(d);
        setHighlightedBar(i);
        d3.select(this).attr("opacity", 1).attr("stroke-width", 3);
        
        // Enhanced tooltip
        const tooltip = svg.append("g")
          .attr("class", "tooltip");

        const persistence = d.death - d.birth;
        const tooltipContent = [
          `H${d.dimension}: ${d.dimension === 0 ? 'Connected Components' : d.dimension === 1 ? 'Loops' : 'Voids'}`,
          `Birth: ${d.birth.toFixed(3)}`,
          `Death: ${d.death.toFixed(3)}`,
          `Persistence: ${persistence.toFixed(3)}`
        ];
        
        const tooltipGroup = tooltip.append("g")
          .attr("transform", `translate(${margin.left + xScale(d.birth) + (xScale(d.death) - xScale(d.birth)) / 2}, ${margin.top + (yScale(i.toString()) || 0) - 10})`);

        const tooltipRect = tooltipGroup.append("rect")
          .attr("fill", "rgba(0,0,0,0.9)")
          .attr("rx", 6)
          .attr("ry", 6);

        const tooltipTexts = tooltipGroup.append("g");
        tooltipContent.forEach((text, j) => {
          tooltipTexts.append("text")
            .attr("fill", "white")
            .attr("font-size", "11px")
            .attr("x", 0)
            .attr("y", j * 14)
            .attr("text-anchor", "middle")
            .text(text);
        });

        const bbox = tooltipTexts.node()?.getBBox();
        if (bbox) {
          tooltipRect
            .attr("x", bbox.x - 8)
            .attr("y", bbox.y - 4)
            .attr("width", bbox.width + 16)
            .attr("height", bbox.height + 8);
        }
      })
      .on("mouseout", function(event, d) {
        const i = bars.data().indexOf(d);
        setHighlightedBar(null);
        d3.select(this).attr("opacity", 0.8).attr("stroke-width", 1);
        svg.select(".tooltip").remove();
      })
      .on("click", function(event, d) {
        const i = bars.data().indexOf(d);
        // Toggle highlight on click
        if (highlightedBar === i) {
          setHighlightedBar(null);
          d3.select(this).attr("opacity", 0.8).attr("stroke-width", 1);
        } else {
          setHighlightedBar(i);
          d3.select(this).attr("opacity", 1).attr("stroke-width", 3);
        }
      });

    // Enhanced dimension labels on bars
    bars.append("text")
      .attr("x", d => margin.left + xScale(d.birth) + 8)
      .attr("y", (_, i) => margin.top + (yScale(i.toString()) || 0) + yScale.bandwidth() / 2 + 4)
      .style("font-size", "11px")
      .style("fill", "white")
      .style("font-weight", "bold")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
      .text(d => `H${d.dimension}`);

    // Add persistence values
    bars.append("text")
      .attr("x", d => margin.left + xScale(d.birth) + (xScale(d.death) - xScale(d.birth)) / 2)
      .attr("y", (_, i) => margin.top + (yScale(i.toString()) || 0) + yScale.bandwidth() / 2 + 4)
      .style("font-size", "10px")
      .style("fill", "white")
      .style("font-weight", "bold")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
      .style("text-anchor", "middle")
      .text(d => `${(d.death - d.birth).toFixed(3)}`);

    // Add birth markers
    bars.append("circle")
      .attr("cx", d => margin.left + xScale(d.birth))
      .attr("cy", (_, i) => margin.top + (yScale(i.toString()) || 0) + yScale.bandwidth() / 2)
      .attr("r", 3)
      .attr("fill", "#374151")
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(8)
      .tickFormat(d3.format(".2f"));

    svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top + plotHeight})`)
      .call(xAxis)
      .style("color", "#64748b");

    // Enhanced axis labels
    svg.append("text")
      .attr("transform", `translate(${width / 2}, ${height - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text("Filtration Parameter");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 20)
      .attr("x", -height / 2)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .text("Persistence Intervals");

    // Enhanced title with count
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "#1f2937")
      .text(`Persistence Barcode (${filteredData.length} features)`);

    // Enhanced legend with filtering
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${margin.left + plotWidth + 20}, ${margin.top})`);

    const legendData = [
      { dim: 0, label: "H₀ (Components)", color: colorScale("0"), count: stats?.byDimension[0] || 0 },
      { dim: 1, label: "H₁ (Loops)", color: colorScale("1"), count: stats?.byDimension[1] || 0 },
      { dim: 2, label: "H₂ (Voids)", color: colorScale("2"), count: stats?.byDimension[2] || 0 }
    ];

    legendData.forEach((item, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`)
        .style("cursor", "pointer")
        .on("click", () => setSelectedDimension(selectedDimension === item.dim ? null : item.dim));

      const isSelected = selectedDimension === null || selectedDimension === item.dim;
      const opacity = isSelected ? 1 : 0.3;

      legendItem.append("rect")
        .attr("width", 15)
        .attr("height", 10)
        .attr("fill", item.color as string)
        .attr("opacity", opacity)
        .attr("rx", 2);

      legendItem.append("text")
        .attr("x", 20)
        .attr("y", 8)
        .style("font-size", "11px")
        .style("fill", isSelected ? "#374151" : "#9ca3af")
        .text(`${item.label} (${item.count})`);

      // Add selection indicator
      if (selectedDimension === item.dim) {
        legendItem.append("circle")
          .attr("r", 8)
          .attr("fill", "none")
          .attr("stroke", "#3b82f6")
          .attr("stroke-width", 2);
      }
    });

    // Add statistics panel
    if (stats && showStatistics) {
      const statsPanel = svg.append("g")
        .attr("class", "stats-panel")
        .attr("transform", `translate(${margin.left + plotWidth + 20}, ${margin.top + 100})`);

      statsPanel.append("rect")
        .attr("width", 180)
        .attr("height", 120)
        .attr("fill", "rgba(255,255,255,0.95)")
        .attr("stroke", "#e2e8f0")
        .attr("rx", 6);

      const statsText = [
        `Total: ${stats.total}`,
        `H₀: ${stats.byDimension[0]}`,
        `H₁: ${stats.byDimension[1]}`,
        `H₂: ${stats.byDimension[2]}`,
        `Avg: ${stats.averagePersistence.toFixed(3)}`,
        `Max: ${stats.maxPersistence.toFixed(3)}`,
        `Total: ${stats.totalPersistence.toFixed(3)}`
      ];

      statsText.forEach((text, i) => {
        statsPanel.append("text")
          .attr("x", 8)
          .attr("y", 20 + i * 15)
          .style("font-size", "10px")
          .style("fill", "#374151")
          .text(text);
      });
    }

  }, [persistenceData, filteredData, filtrationValue, width, height, selectedDimension, sortBy, sortOrder, highlightedBar, showStatistics, calculateStats]);

  return (
    <div className="persistence-barcode-container">
      {/* Enhanced Control Panel */}
      <div className="barcode-controls">
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

        <div className="control-group">
          <label>Sort By:</label>
          <div className="sort-controls">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'persistence' | 'birth' | 'dimension')}
              className="sort-select"
            >
              <option value="persistence">Persistence</option>
              <option value="birth">Birth Value</option>
              <option value="dimension">Dimension</option>
            </select>
            <button 
              className={`sort-btn ${sortOrder === 'desc' ? 'active' : ''}`}
              onClick={() => setSortOrder('desc')}
            >
              ↓ Desc
            </button>
            <button 
              className={`sort-btn ${sortOrder === 'asc' ? 'active' : ''}`}
              onClick={() => setSortOrder('asc')}
            >
              ↑ Asc
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={showStatistics}
              onChange={(e) => setShowStatistics(e.target.checked)}
            />
            Show Statistics
          </label>
        </div>
      </div>

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