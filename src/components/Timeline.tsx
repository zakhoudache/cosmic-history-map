
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HistoricalEntity, mockHistoricalData } from '@/utils/mockData';
import { useAnimateOnMount } from '@/utils/animations';
import { Clock, CalendarDays, Users, MapPin, Lightbulb } from 'lucide-react';

interface TimelineProps {
  entities?: HistoricalEntity[];
  onEntitySelect?: (entity: HistoricalEntity) => void;
  timelineData?: any;
}

const Timeline: React.FC<TimelineProps> = ({ 
  entities = mockHistoricalData,
  onEntitySelect,
  timelineData
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const isVisible = useAnimateOnMount(700);
  const [dimensions, setDimensions] = useState({ width: 800, height: 180 });

  // Filter entities that have start dates
  const timelineEntities = entities.filter(entity => entity.startDate);

  // Initialize layout and resize handling
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.parentElement?.getBoundingClientRect() || { width: 800, height: 180 };
        setDimensions({ width, height: Math.max(height, 180) });
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
    if (!svgRef.current || !isVisible || !timelineEntities || timelineEntities.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    // Set up the SVG
    const { width, height } = dimensions;
    const margin = { top: 50, right: 20, bottom: 30, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Add defs for filter effects
    const defs = svg.append("defs");
    
    // Add glow effect filter
    const filter = defs.append("filter")
      .attr("id", "timeline-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "blur");
    
    filter.append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");
    
    // Add a background gradient
    const bgGradient = defs.append("linearGradient")
      .attr("id", "timeline-bg-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
      
    bgGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "hsl(240, 30%, 20%)")
      .attr("stop-opacity", 0.6);
      
    bgGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "hsl(260, 40%, 10%)")
      .attr("stop-opacity", 1);
    
    // Add background rect
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#timeline-bg-gradient)");
    
    // Create a group for the chart content
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
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
      
      // Add padding to timeline
      const timeRange = maxDate.getTime() - minDate.getTime();
      minDate = new Date(minDate.getTime() - timeRange * 0.05);
      maxDate = new Date(maxDate.getTime() + timeRange * 0.05);
    }
    
    // Create scales
    const xScale = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, 3]) // Layers for different entity types
      .range([0, innerHeight]);
    
    // Create and append the x-axis with custom styling
    const xAxis = d3.axisBottom(xScale)
      .tickSize(6)
      .tickPadding(8)
      .ticks(10);
    
    // Style axis
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis)
      .call(g => {
        g.select(".domain")
          .attr("stroke", "rgba(255, 255, 255, 0.3)")
          .attr("stroke-width", 2)
          .attr("stroke-linecap", "round");
        
        g.selectAll(".tick line")
          .attr("stroke", "rgba(255, 255, 255, 0.3)")
          .attr("stroke-width", 2)
          .attr("y1", -5)
          .attr("y2", 5);
        
        g.selectAll(".tick text")
          .attr("fill", "rgba(255, 255, 255, 0.7)")
          .attr("font-size", 10)
          .attr("font-weight", "bold")
          .attr("dy", 15);
      });
    
    // Add decorative grid lines with glow effect
    for (let x = 0; x <= innerWidth; x += innerWidth / 20) {
      g.append("line")
        .attr("class", "grid-line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "rgba(200, 200, 255, 0.2)")
        .attr("stroke-width", 0.5)
        .attr("stroke-dasharray", "4,4");
    }
    
    // Add a glowing baseline
    g.append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", innerHeight / 2)
      .attr("y2", innerHeight / 2)
      .attr("stroke", "rgba(180, 180, 255, 0.4)")
      .attr("stroke-width", 2)
      .attr("filter", "url(#timeline-glow)");
    
    // Add title
    svg.append("g")
      .attr("class", "timeline-title")
      .attr("transform", `translate(${width / 2}, 25)`)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", 16)
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .text("Historical Timeline")
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .attr("opacity", 1);
    
    // Add title decoration
    svg.select(".timeline-title")
      .append("line")
      .attr("x1", -80)
      .attr("x2", 80)
      .attr("y1", 8)
      .attr("y2", 8)
      .attr("stroke", "rgba(255, 255, 255, 0.4)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "1,3")
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay(300)
      .attr("opacity", 1);
    
    // Function to get color by entity type
    const getColorByType = (type: string) => {
      switch (type) {
        case "person": return "hsl(300, 90%, 65%)";
        case "event": return "hsl(220, 90%, 65%)";
        case "place": return "hsl(180, 90%, 65%)";
        case "concept": return "hsl(340, 90%, 65%)";
        default: return "hsl(240, 90%, 65%)";
      }
    };
    
    // Function to get icon by entity type
    const getIconByType = (type: string) => {
      switch (type) {
        case "person": 
          return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="5"/>
            <path d="M20 21a8 8 0 0 0-16 0"/>
          </svg>`;
        case "event": 
          return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 10h18"/>
            <path d="M16 2v2"/>
            <path d="M8 2v2"/>
          </svg>`;
        case "place": 
          return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>`;
        case "concept": 
          return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a8 8 0 0 0-8 8c0 2.2.7 4.3 2 6l6 6 6-6c1.3-1.7 2-3.8 2-6a8 8 0 0 0-8-8Z"/>
          </svg>`;
        default: 
          return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
          </svg>`;
      }
    };
    
    // Render timeline periods if available
    if (timelineData && timelineData.periods && timelineData.periods.length > 0) {
      const periods = g.selectAll(".period")
        .data(timelineData.periods)
        .enter()
        .append("g")
        .attr("class", "period");
      
      // Add glowing period backgrounds
      periods.append("rect")
        .attr("x", d => xScale(new Date(d.startYear, 0, 1)))
        .attr("width", d => {
          const endDate = new Date(d.endYear, 11, 31);
          const startDate = new Date(d.startYear, 0, 1);
          return Math.max(0, xScale(endDate) - xScale(startDate));
        })
        .attr("y", 0)
        .attr("height", innerHeight)
        .attr("fill", (_, i) => `hsla(${220 + i * 30}, 70%, 50%, 0.15)`)
        .attr("stroke", (_, i) => `hsla(${220 + i * 30}, 70%, 60%, 0.4)`)
        .attr("stroke-width", 1)
        .attr("rx", 4)
        .attr("filter", "url(#timeline-glow)")
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .delay((_, i) => i * 200)
        .attr("opacity", 1);
      
      // Add period names with background capsules
      periods.each(function(d, i) {
        const period = d3.select(this);
        const startX = xScale(new Date(d.startYear, 0, 1));
        const endX = xScale(new Date(d.endYear, 11, 31));
        const midX = startX + (endX - startX) / 2;
        
        // Add period container at the top
        const container = period.append("g")
          .attr("transform", `translate(${midX}, -20)`)
          .style("cursor", "pointer");
        
        // Add background capsule
        container.append("rect")
          .attr("x", -50)
          .attr("y", -12)
          .attr("width", 100)
          .attr("height", 22)
          .attr("rx", 11)
          .attr("fill", `hsla(${220 + i * 30}, 70%, 50%, 0.3)`)
          .attr("stroke", `hsla(${220 + i * 30}, 70%, 60%, 0.6)`)
          .attr("stroke-width", 1)
          .attr("opacity", 0)
          .transition()
          .duration(800)
          .delay(i * 200 + 500)
          .attr("opacity", 1);
        
        // Add period name  
        container.append("text")
          .attr("text-anchor", "middle")
          .attr("font-size", 11)
          .attr("font-weight", "bold")
          .attr("fill", "white")
          .attr("y", 5)
          .text(d.name)
          .attr("opacity", 0)
          .transition()
          .duration(800)
          .delay(i * 200 + 700)
          .attr("opacity", 1);
          
        // Add connecting line
        period.append("line")
          .attr("x1", midX)
          .attr("y1", -10)
          .attr("x2", midX)
          .attr("y2", 0)
          .attr("stroke", `hsla(${220 + i * 30}, 70%, 60%, 0.6)`)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "3,2")
          .attr("opacity", 0)
          .transition()
          .duration(500)
          .delay(i * 200 + 900)
          .attr("opacity", 0.6);
      });
    }
    
    // Create lanes for different entity types
    const lanes = {
      person: innerHeight / 5,
      event: innerHeight / 2,
      place: innerHeight / 5 * 3,
      concept: innerHeight / 5 * 4
    };
    
    // Add lane labels
    const laneLabels = [
      { type: "person", y: lanes.person, label: "People" },
      { type: "event", y: lanes.event, label: "Events" },
      { type: "place", y: lanes.place, label: "Places" },
      { type: "concept", y: lanes.concept, label: "Concepts" }
    ];
    
    laneLabels.forEach((lane, i) => {
      const laneGroup = g.append("g")
        .attr("transform", `translate(-5, ${lane.y})`)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay(i * 150)
        .attr("opacity", 1);
      
      laneGroup.append("text")
        .attr("text-anchor", "end")
        .attr("font-size", 9)
        .attr("font-weight", "bold")
        .attr("fill", getColorByType(lane.type))
        .text(lane.label);
      
      // Add lane line
      g.append("line")
        .attr("x1", 0)
        .attr("x2", innerWidth)
        .attr("y1", lane.y)
        .attr("y2", lane.y)
        .attr("stroke", getColorByType(lane.type))
        .attr("stroke-width", 0.5)
        .attr("stroke-dasharray", "2,4")
        .attr("opacity", 0)
        .transition()
        .duration(1000)
        .delay(i * 150 + 200)
        .attr("opacity", 0.3);
    });
    
    // Add time spans for entities with both start and end dates
    timelineEntities
      .filter(d => d.startDate && d.endDate)
      .forEach((entity, i) => {
        try {
          const startDate = parseDate(entity.startDate!);
          const endDate = parseDate(entity.endDate!);
          
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return;
          }
          
          const startX = xScale(startDate);
          const endX = xScale(endDate);
          
          // Get y position based on entity type
          let y = lanes.event; // default
          if (entity.type === "person") y = lanes.person;
          if (entity.type === "place") y = lanes.place;
          if (entity.type === "concept") y = lanes.concept;
          
          const timeSpanGroup = g.append("g")
            .attr("class", "time-span")
            .style("cursor", "pointer")
            .on("click", () => {
              if (onEntitySelect) {
                onEntitySelect(entity);
              }
            });
          
          // Add time span bar
          timeSpanGroup.append("rect")
            .attr("x", startX)
            .attr("y", y - 2)
            .attr("width", Math.max(endX - startX, 4))
            .attr("height", 4)
            .attr("rx", 2)
            .attr("fill", getColorByType(entity.type))
            .attr("opacity", 0)
            .transition()
            .duration(800)
            .delay(i * 50 + 300)
            .attr("opacity", 0.7);
          
          // Add pulse effect for important entities
          if (entity.significance && entity.significance > 7) {
            timeSpanGroup.append("rect")
              .attr("x", startX - 2)
              .attr("y", y - 4)
              .attr("width", Math.max(endX - startX + 4, 8))
              .attr("height", 8)
              .attr("rx", 4)
              .attr("fill", "none")
              .attr("stroke", getColorByType(entity.type))
              .attr("opacity", 0.5)
              .attr("filter", "url(#timeline-glow)")
              .attr("class", "pulse-effect");
            
            // Add pulse animation
            const pulseRect = timeSpanGroup.select(".pulse-effect").node();
            if (pulseRect) {
              function animatePulse() {
                d3.select(pulseRect)
                  .transition()
                  .duration(1500)
                  .attr("opacity", 0.8)
                  .attr("x", startX - 4)
                  .attr("y", y - 6)
                  .attr("width", Math.max(endX - startX + 8, 12))
                  .attr("height", 12)
                  .transition()
                  .duration(1500)
                  .attr("opacity", 0.2)
                  .attr("x", startX - 2)
                  .attr("y", y - 4)
                  .attr("width", Math.max(endX - startX + 4, 8))
                  .attr("height", 8)
                  .on("end", animatePulse);
              }
              
              setTimeout(animatePulse, i * 200 + 1000);
            }
          }
        } catch (error) {
          console.error("Error creating timeline span for entity:", entity.name, error);
        }
      });
    
    // Create event points for all entities
    const events = g.selectAll(".event-point")
      .data(timelineEntities)
      .enter()
      .append("g")
      .attr("class", "event-point")
      .attr("transform", d => {
        try {
          const parsedDate = parseDate(d.startDate!);
          if (isNaN(parsedDate.getTime())) {
            return `translate(-100, -100)`;
          }
          
          const x = xScale(parsedDate);
          
          // Get y position based on entity type
          let y = lanes.event; // default
          if (d.type === "person") y = lanes.person;
          if (d.type === "place") y = lanes.place;
          if (d.type === "concept") y = lanes.concept;
          
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
    
    // Add glow circle for events
    events.append("circle")
      .attr("r", d => 4 + (d.significance || 1))
      .attr("fill", "rgba(255, 255, 255, 0.1)")
      .attr("filter", "url(#timeline-glow)");
    
    // Add entity circles
    events.append("circle")
      .attr("r", d => 3 + (d.significance || 1))
      .attr("fill", d => getColorByType(d.type))
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 50)
      .duration(500)
      .attr("opacity", 0.9);
    
    // Add entity icons
    events.append("g")
      .attr("transform", "translate(-10, -10)")
      .attr("opacity", 0)
      .html(d => {
        // Set color to white for better visibility
        return getIconByType(d.type).replace('currentColor', 'white');
      })
      .transition()
      .delay((_, i) => i * 50 + 200)
      .duration(500)
      .attr("opacity", 0.8);
    
    // Add entity labels with background for better readability
    events.each(function(d) {
      const event = d3.select(this);
      const significance = d.significance || 1;
      
      // Determine label position based on entity type
      let labelY = -15;
      if (d.type === "person") labelY = -15;
      if (d.type === "event") labelY = -15;
      if (d.type === "place") labelY = -15;
      if (d.type === "concept") labelY = -15;
      
      // Create label group
      const labelGroup = event.append("g")
        .attr("transform", `translate(0, ${labelY})`)
        .attr("opacity", 0)
        .transition()
        .delay((_, i) => 500 + significance * 50)
        .duration(500)
        .attr("opacity", 1);
      
      // Calculate label width based on name length
      const labelWidth = Math.max(d.name.length * 5, 30);
      
      // Add label background
      event.append("rect")
        .attr("x", -labelWidth / 2 - 4)
        .attr("y", labelY - 10)
        .attr("width", labelWidth + 8)
        .attr("height", 16)
        .attr("rx", 8)
        .attr("fill", "rgba(0, 0, 0, 0.5)")
        .attr("stroke", getColorByType(d.type))
        .attr("stroke-width", 1)
        .attr("opacity", 0)
        .transition()
        .delay((_, i) => 500 + significance * 50)
        .duration(500)
        .attr("opacity", 0.9);
      
      // Add label text
      event.append("text")
        .text(d.name)
        .attr("text-anchor", "middle")
        .attr("dy", labelY + 2)
        .attr("font-size", 9)
        .attr("font-weight", "bold")
        .attr("fill", "white")
        .attr("opacity", 0)
        .transition()
        .delay((_, i) => 700 + significance * 50)
        .duration(500)
        .attr("opacity", 1);
    });
    
    // Add vertical date indicator lines
    events.append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", 0)
      .attr("y2", d => {
        let baselineY = innerHeight / 2;
        let eventY = 0;
        
        if (d.type === "person") eventY = lanes.person;
        if (d.type === "event") eventY = lanes.event;
        if (d.type === "place") eventY = lanes.place;
        if (d.type === "concept") eventY = lanes.concept;
        
        // Calculate direction and length based on position relative to baseline
        if (eventY < baselineY) {
          return baselineY - eventY;
        } else {
          return baselineY - eventY;
        }
      })
      .attr("stroke", d => getColorByType(d.type))
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 30 + 400)
      .duration(500)
      .attr("opacity", 0.5);
    
  }, [timelineEntities, isVisible, dimensions, onEntitySelect, timelineData]);

  return (
    <div className="w-full relative overflow-hidden rounded-lg" style={{minHeight: '300px'}}>
      {/* Background with cosmic gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cosmic-dark via-cosmic to-cosmic-accent/20 opacity-30"></div>
      
      {/* Title area */}
      <div className="absolute top-0 left-0 w-full p-4 flex items-center space-x-2 z-10">
        <CalendarDays className="h-5 w-5 text-cosmic-accent" />
        <h3 className="text-lg font-semibold text-white">Chronological Timeline</h3>
      </div>
      
      {/* SVG Container */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }}
      />
      
      {/* Empty state */}
      {(!timelineEntities || timelineEntities.length === 0) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
          <CalendarDays className="h-12 w-12 mb-4 opacity-50" />
          <p>No timeline data to display</p>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-black/50 p-2 rounded text-xs z-10 flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-[hsl(300,90%,65%)]"></div>
          <span className="text-white/80">People</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-[hsl(220,90%,65%)]"></div>
          <span className="text-white/80">Events</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-[hsl(180,90%,65%)]"></div>
          <span className="text-white/80">Places</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-[hsl(340,90%,65%)]"></div>
          <span className="text-white/80">Concepts</span>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
