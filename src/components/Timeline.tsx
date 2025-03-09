
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HistoricalEntity, mockHistoricalData } from '@/utils/mockData';
import { useAnimateOnMount } from '@/utils/animations';

interface TimelineProps {
  entities?: HistoricalEntity[];
  onEntitySelect?: (entity: HistoricalEntity) => void;
  timelineData?: any; // Add the timelineData prop to the interface
}

const Timeline: React.FC<TimelineProps> = ({ 
  entities = mockHistoricalData,
  onEntitySelect,
  timelineData
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const isVisible = useAnimateOnMount(700);
  const [dimensions, setDimensions] = useState({ width: 800, height: 120 });

  // Filter entities that have start dates
  const timelineEntities = entities.filter(entity => entity.startDate);

  // Initialize layout and resize handling
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.parentElement?.getBoundingClientRect() || { width: 800, height: 120 };
        setDimensions({ width, height });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Create and update visualization
  useEffect(() => {
    if (!svgRef.current || !isVisible || timelineEntities.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    // Set up the SVG
    const { width, height } = dimensions;
    const margin = { top: 40, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create a group for the chart content
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Parse dates and find min/max
    const parseDate = (dateStr: string | Date) => {
      if (dateStr instanceof Date) return dateStr;
      return new Date(dateStr);
    };
    
    // Use timelineData if provided, otherwise calculate from entities
    let minDate, maxDate;
    
    if (timelineData && timelineData.startYear && timelineData.endYear) {
      minDate = new Date(timelineData.startYear, 0, 1);
      maxDate = new Date(timelineData.endYear, 11, 31);
    } else {
      const dates = timelineEntities.map(d => parseDate(d.startDate!));
      minDate = d3.min(dates) || new Date(1400, 0, 1);
      maxDate = d3.max(timelineEntities.map(d => 
        d.endDate ? parseDate(d.endDate) : parseDate(d.startDate!)
      )) || new Date(1600, 0, 1);
    }
    
    // Create scales
    const xScale = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 3]) // Layers for different entity types
      .range([0, innerHeight]);
    
    // Create and append the x-axis
    const xAxis = d3.axisBottom(xScale);
    
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("font-size", 10)
      .attr("fill", "rgba(255, 255, 255, 0.7)");
    
    g.selectAll(".x-axis line")
      .attr("stroke", "rgba(255, 255, 255, 0.2)");
    
    g.selectAll(".x-axis path")
      .attr("stroke", "rgba(255, 255, 255, 0.2)");
    
    // Add background grid
    g.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(xScale.ticks())
      .enter()
      .append("line")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "rgba(255, 255, 255, 0.1)")
      .attr("stroke-dasharray", "2,2");

    // Add a baseline
    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", innerHeight / 2)
      .attr("y2", innerHeight / 2)
      .attr("stroke", "rgba(255, 255, 255, 0.3)")
      .attr("stroke-width", 1);
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .attr("fill", "white")
      .text("Historical Timeline");
    
    // Render timeline periods if available
    if (timelineData && timelineData.periods && timelineData.periods.length > 0) {
      const periods = g.selectAll(".period")
        .data(timelineData.periods)
        .enter()
        .append("g")
        .attr("class", "period");
      
      periods.append("rect")
        .attr("x", d => xScale(new Date(d.startYear, 0, 1)))
        .attr("width", d => xScale(new Date(d.endYear, 11, 31)) - xScale(new Date(d.startYear, 0, 1)))
        .attr("y", 0)
        .attr("height", innerHeight)
        .attr("fill", "rgba(100, 100, 255, 0.05)")
        .attr("stroke", "rgba(100, 100, 255, 0.2)")
        .attr("stroke-width", 1)
        .attr("rx", 4);
      
      periods.append("text")
        .attr("x", d => {
          const start = xScale(new Date(d.startYear, 0, 1));
          const end = xScale(new Date(d.endYear, 11, 31));
          return start + (end - start) / 2;
        })
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .attr("font-size", 8)
        .attr("fill", "rgba(255, 255, 255, 0.7)")
        .text(d => d.name);
    }
    
    // Add events
    const events = g.selectAll(".event")
      .data(timelineEntities)
      .enter()
      .append("g")
      .attr("class", "event")
      .attr("transform", d => {
        const x = xScale(parseDate(d.startDate!));
        
        // Place different entity types in different rows
        let y = innerHeight / 2;
        if (d.type === "person") y = innerHeight / 4;
        if (d.type === "concept") y = (innerHeight / 4) * 3;
        
        return `translate(${x}, ${y})`;
      })
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (onEntitySelect) {
          onEntitySelect(d);
        }
      });
    
    // Draw time spans for entities with both start and end dates
    timelineEntities
      .filter(d => d.startDate && d.endDate)
      .forEach(entity => {
        const startX = xScale(parseDate(entity.startDate!));
        const endX = xScale(parseDate(entity.endDate!));
        let y = innerHeight / 2;
        
        // Place different entity types in different rows
        if (entity.type === "person") y = innerHeight / 4;
        if (entity.type === "concept") y = (innerHeight / 4) * 3;
        
        g.append("line")
          .attr("x1", startX)
          .attr("x2", endX)
          .attr("y1", y)
          .attr("y2", y)
          .attr("stroke", d => {
            switch (entity.type) {
              case "person": return "hsl(280, 70%, 50%)";
              case "event": return "hsl(240, 70%, 50%)";
              case "place": return "hsl(200, 70%, 50%)";
              case "concept": return "hsl(320, 70%, 50%)";
              default: return "hsl(240, 70%, 50%)";
            }
          })
          .attr("stroke-width", 2)
          .attr("opacity", 0)
          .transition()
          .duration(1000)
          .attr("opacity", 0.5);
      });
    
    // Add circles for event points
    events.append("circle")
      .attr("r", d => 4 + (d.significance || 1))
      .attr("fill", d => {
        switch (d.type) {
          case "person": return "hsl(280, 70%, 50%)";
          case "event": return "hsl(240, 70%, 50%)";
          case "place": return "hsl(200, 70%, 50%)";
          case "concept": return "hsl(320, 70%, 50%)";
          default: return "hsl(240, 70%, 50%)";
        }
      })
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 100)
      .duration(500)
      .attr("opacity", 0.8);
    
    // Add labels
    events.append("text")
      .text(d => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", -10)
      .attr("font-size", 9)
      .attr("fill", "white")
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 100 + 300)
      .duration(500)
      .attr("opacity", 0.9);
    
    // Add indicator lines to the baseline
    events.append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 0)
      .attr("y2", d => {
        let baselineY = innerHeight / 2;
        let y = 0;
        
        if (d.type === "person") {
          y = innerHeight / 4;
          return baselineY - y;
        }
        if (d.type === "concept") {
          y = (innerHeight / 4) * 3;
          return y - baselineY;
        }
        
        return 0;
      })
      .attr("stroke", "rgba(255, 255, 255, 0.2)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 100 + 200)
      .duration(500)
      .attr("opacity", 0.5);
    
  }, [timelineEntities, isVisible, dimensions, onEntitySelect, timelineData]);

  return (
    <div className="w-full relative glass rounded-lg overflow-hidden">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }}
      />
    </div>
  );
};

export default Timeline;
