import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HistoricalEntity } from '@/utils/mockData';
import { useAnimateOnMount } from '@/utils/animations';
import VisualizationPlaceholder from './VisualizationPlaceholder';

interface TimelineProps {
  entities?: HistoricalEntity[];
  onEntitySelect?: (entity: HistoricalEntity) => void;
  timelineData?: any;
}

const Timeline: React.FC<TimelineProps> = ({ 
  entities = [],
  onEntitySelect,
  timelineData
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const isVisible = useAnimateOnMount(700);
  const [dimensions, setDimensions] = useState({ width: 800, height: 120 });
  const hasData = entities && entities.length > 0;

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

  // Create and update visualization only if we have data
  useEffect(() => {
    if (!svgRef.current || !isVisible || !timelineEntities.length) return;
    
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
    
    // Add defs for patterns and filters
    const defs = svg.append("defs");
    
    // Add glow filter
    const glowFilter = defs.append("filter")
      .attr("id", "timeline-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
      
    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", "2")
      .attr("result", "blur");
      
    glowFilter.append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");
    
    // Parse dates and find min/max
    const parseDate = (dateStr: string | Date) => {
      if (!dateStr) return new Date();
      if (dateStr instanceof Date) return dateStr;
      
      // Handle year-only dates
      if (/^\d{1,4}$/.test(dateStr)) {
        return new Date(parseInt(dateStr, 10), 0, 1);
      }
      
      return new Date(dateStr);
    };
    
    // Use timelineData if provided, otherwise calculate from entities
    let minDate, maxDate;
    
    if (timelineData && timelineData.startYear && timelineData.endYear) {
      minDate = new Date(timelineData.startYear, 0, 1);
      maxDate = new Date(timelineData.endYear, 11, 31);
    } else {
      // Add fallback if no dates are available
      const dates = timelineEntities.map(d => parseDate(d.startDate!)).filter(d => !isNaN(d.getTime()));
      minDate = d3.min(dates) || new Date(1700, 0, 1);
      
      const endDates = timelineEntities
        .map(d => d.endDate ? parseDate(d.endDate) : parseDate(d.startDate!))
        .filter(d => !isNaN(d.getTime()));
      
      maxDate = d3.max(endDates) || new Date(1900, 0, 1);
    }
    
    // Add buffer to min and max dates
    const timeRange = maxDate.getTime() - minDate.getTime();
    const buffer = timeRange * 0.05; // 5% buffer
    minDate = new Date(minDate.getTime() - buffer);
    maxDate = new Date(maxDate.getTime() + buffer);
    
    // Create scales
    const xScale = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 3]) // Layers for different entity types
      .range([0, innerHeight]);
    
    // Add background gradient
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#cosmic-background)")
      .attr("opacity", 0.1);
    
    // Create and append the x-axis
    const xAxis = d3.axisBottom(xScale).tickSize(-innerHeight).tickPadding(10);
    
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("font-size", 10)
      .attr("fill", "rgba(255, 255, 255, 0.7)")
      .attr("filter", "url(#timeline-glow)");
    
    g.selectAll(".x-axis line")
      .attr("stroke", "rgba(255, 255, 255, 0.2)");
    
    g.selectAll(".x-axis path")
      .attr("stroke", "rgba(255, 255, 255, 0.2)");
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", 14)
      .attr("fill", "white")
      .attr("filter", "url(#timeline-glow)")
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
        .attr("width", d => {
          const endDate = new Date(d.endYear, 11, 31);
          const startDate = new Date(d.startYear, 0, 1);
          return Math.max(0, xScale(endDate) - xScale(startDate));
        })
        .attr("y", 0)
        .attr("height", innerHeight)
        .attr("fill", (_, i) => `rgba(100, 100, ${200 + i * 20}, 0.05)`)
        .attr("stroke", (_, i) => `rgba(100, 100, ${200 + i * 20}, 0.2)`)
        .attr("stroke-width", 1)
        .attr("rx", 4)
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .delay((_, i) => i * 200)
        .attr("opacity", 1);
      
      periods.append("text")
        .attr("x", d => {
          const start = xScale(new Date(d.startYear, 0, 1));
          const end = xScale(new Date(d.endYear, 11, 31));
          return start + (end - start) / 2;
        })
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .attr("font-size", 11)
        .attr("fill", "rgba(255, 255, 255, 0.8)")
        .attr("filter", "url(#timeline-glow)")
        .text(d => d.name)
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .delay((_, i) => i * 200 + 200)
        .attr("opacity", 1);
    }
    
    // Add events
    const events = g.selectAll(".event")
      .data(timelineEntities)
      .enter()
      .append("g")
      .attr("class", "event")
      .attr("transform", d => {
        try {
          const parsedDate = parseDate(d.startDate!);
          if (isNaN(parsedDate.getTime())) {
            return `translate(-100, -100)`;
          }
          
          const x = xScale(parsedDate);
          
          // Place different entity types in different rows
          let y = innerHeight / 2;
          if (d.type === "person") y = innerHeight / 4;
          if (d.type === "concept") y = (innerHeight / 4) * 3;
          
          return `translate(${x}, ${y})`;
        } catch (error) {
          console.error("Error parsing date for entity:", d.name, d.startDate, error);
          return `translate(-100, -100)`;
        }
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
        try {
          const startDate = parseDate(entity.startDate!);
          const endDate = parseDate(entity.endDate!);
          
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return;
          }
          
          const startX = xScale(startDate);
          const endX = xScale(endDate);
          let y = innerHeight / 2;
          
          // Place different entity types in different rows
          if (entity.type === "person") y = innerHeight / 4;
          if (entity.type === "concept") y = (innerHeight / 4) * 3;
          
          // Create gradient for time span
          const spanGradient = defs.append("linearGradient")
            .attr("id", `span-gradient-${entity.id}`)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", startX)
            .attr("x2", endX);
            
          spanGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", d => {
              switch (entity.type) {
                case "person": return "hsla(280, 70%, 50%, 0.7)";
                case "event": return "hsla(240, 70%, 50%, 0.7)";
                case "place": return "hsla(200, 70%, 50%, 0.7)";
                case "concept": return "hsla(320, 70%, 50%, 0.7)";
                default: return "hsla(240, 70%, 50%, 0.7)";
              }
            });
            
          spanGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", d => {
              switch (entity.type) {
                case "person": return "hsla(280, 70%, 50%, 0.3)";
                case "event": return "hsla(240, 70%, 50%, 0.3)";
                case "place": return "hsla(200, 70%, 50%, 0.3)";
                case "concept": return "hsla(320, 70%, 50%, 0.3)";
                default: return "hsla(240, 70%, 50%, 0.3)";
              }
            });
          
          g.append("line")
            .attr("x1", startX)
            .attr("x2", endX)
            .attr("y1", y)
            .attr("y2", y)
            .attr("stroke", `url(#span-gradient-${entity.id})`)
            .attr("stroke-width", Math.max(2, entity.significance || 1))
            .attr("filter", "url(#timeline-glow)")
            .attr("opacity", 0)
            .transition()
            .duration(1000)
            .delay(500)
            .attr("opacity", 0.8);
        } catch (error) {
          console.error("Error creating timeline span for entity:", entity.name, error);
        }
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
      .attr("filter", "url(#timeline-glow)")
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
      .attr("filter", "url(#timeline-glow)")
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
      .attr("stroke", "rgba(255, 255, 255, 0.3)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 100 + 200)
      .duration(500)
      .attr("opacity", 0.5);
  }, [timelineEntities, isVisible, dimensions, onEntitySelect, timelineData]);

  // If no data, render placeholder
  if (!hasData) {
    return <VisualizationPlaceholder type="timeline" />;
  }

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
