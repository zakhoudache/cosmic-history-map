import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HistoricalEntity } from '@/utils/mockData';
import { useAnimateOnMount } from '@/utils/animations';
import VisualizationPlaceholder from './VisualizationPlaceholder';
import VisualizationControls from './VisualizationControls';
import { Download } from 'lucide-react';
import { toast } from "sonner";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useAnimateOnMount(700);
  const [dimensions, setDimensions] = useState({ width: 800, height: 120 });
  const hasData = entities && entities.length > 0;
  
  // Zoom and fullscreen state
  const [scale, setScale] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [originalHeight, setOriginalHeight] = useState<number>(500);
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3;
  const SCALE_STEP = 0.2;

  // Filter entities that have start dates
  const timelineEntities = entities.filter(entity => entity.startDate);

  // Initialize layout and resize handling
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.parentElement?.getBoundingClientRect() || { width: 800, height: 120 };
        setDimensions({ width, height });
        
        // Store original height when first initialized
        if (!originalHeight || originalHeight === 500) {
          setOriginalHeight(height);
        }
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Effect for zoom
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    
    const containerElem = containerRef.current;
    
    // Set the transform based on scale
    if (containerElem) {
      const svg = d3.select(svgRef.current).select('g');
      svg.attr('transform', `scale(${scale})`);
    }
  }, [scale]);

  // Escape key handler for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Zoom handlers
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + SCALE_STEP, MAX_SCALE));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - SCALE_STEP, MIN_SCALE));
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Export as SVG
  const handleExport = () => {
    if (!svgRef.current) return;
    
    try {
      // Clone the SVG to avoid modifying the displayed one
      const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
      
      // Set proper attributes for standalone SVG
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgClone.setAttribute('width', dimensions.width.toString());
      svgClone.setAttribute('height', dimensions.height.toString());
      
      // Convert to string
      const svgData = new XMLSerializer().serializeToString(svgClone);
      
      // Create a Blob and URL
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      // Create a download link and trigger it
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = 'historical-timeline.svg';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast.success("Timeline exported as SVG");
    } catch (error) {
      console.error('Error exporting timeline:', error);
      toast.error("Failed to export timeline");
    }
  };

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
    
    // Add defs for patterns, filters, and custom shapes
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
    
    // Create custom markers for different entity types
    
    // Person - Stylized portrait
    defs.append("symbol")
      .attr("id", "timeline-person")
      .attr("viewBox", "0 0 32 32")
      .html(`
        <circle cx="16" cy="10" r="8" fill="hsl(280, 70%, 60%)" />
        <path d="M4,32 L4,26 C4,20 9,16 16,16 C23,16 28,20 28,26 L28,32" fill="hsl(280, 70%, 60%)" />
        <circle cx="16" cy="10" r="6" fill="white" opacity="0.3" />
      `);
    
    // Event - Starburst shape
    defs.append("symbol")
      .attr("id", "timeline-event")
      .attr("viewBox", "0 0 32 32")
      .html(`
        <path d="M16,2 L20,13 L30,13 L22,20 L25,31 L16,25 L7,31 L10,20 L2,13 L12,13 Z" fill="hsl(220, 70%, 60%)" />
        <circle cx="16" cy="16" r="6" fill="white" opacity="0.3" />
      `);
      
    // Place - Stylized location marker
    defs.append("symbol")
      .attr("id", "timeline-place")
      .attr("viewBox", "0 0 32 32")
      .html(`
        <path d="M16,2 C8,2 2,8 2,16 C2,24 16,30 16,30 C16,30 30,24 30,16 C30,8 24,2 16,2 Z M16,20 C12.7,20 10,17.3 10,14 C10,10.7 12.7,8 16,8 C19.3,8 22,10.7 22,14 C22,17.3 19.3,20 16,20 Z" fill="hsl(180, 70%, 60%)" />
        <circle cx="16" cy="14" r="5" fill="white" opacity="0.3" />
      `);
      
    // Concept - Abstract brain or idea symbol
    defs.append("symbol")
      .attr("id", "timeline-concept")
      .attr("viewBox", "0 0 32 32")
      .html(`
        <path d="M16,2 C22,2 26,6 26,12 C26,16 22,19 22,22 C22,25 25,26 25,26 L7,26 C7,26 10,25 10,22 C10,19 6,16 6,12 C6,6 10,2 16,2 Z" fill="hsl(320, 70%, 60%)" />
        <path d="M12,30 L20,30 L20,26 L12,26 Z" fill="hsl(320, 70%, 60%)" />
        <circle cx="16" cy="14" r="5" fill="white" opacity="0.3" />
      `);
    
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
    
    // Add events using custom symbols for each entity type
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
          if (d.type.toLowerCase() === "person") y = innerHeight / 4;
          if (d.type.toLowerCase() === "concept") y = (innerHeight / 4) * 3;
          
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
          if (entity.type.toLowerCase() === "person") y = innerHeight / 4;
          if (entity.type.toLowerCase() === "concept") y = (innerHeight / 4) * 3;
          
          // Create gradient for time span
          const spanGradient = defs.append("linearGradient")
            .attr("id", `span-gradient-${entity.id}`)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", startX)
            .attr("x2", endX);
            
          spanGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", d => {
              switch (entity.type.toLowerCase()) {
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
              switch (entity.type.toLowerCase()) {
                case "person": return "hsla(280, 70%, 50%, 0.3)";
                case "event": return "hsla(240, 70%, 50%, 0.3)";
                case "place": return "hsla(200, 70%, 50%, 0.3)";
                case "concept": return "hsla(320, 70%, 50%, 0.3)";
                default: return "hsla(240, 70%, 50%, 0.3)";
              }
            });
          
          // Draw arc instead of straight line
          const arcHeight = 6 + (entity.significance || 1);
          const pathData = `
            M ${startX} ${y}
            Q ${(startX + endX) / 2} ${y - arcHeight} ${endX} ${y}
          `;
          
          g.append("path")
            .attr("d", pathData)
            .attr("stroke", `url(#span-gradient-${entity.id})`)
            .attr("stroke-width", Math.max(2, entity.significance || 1))
            .attr("fill", "none")
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
    
    // Add custom symbols based on entity type
    events.each(function(d) {
      const entityGroup = d3.select(this);
      const symbolSize = 12 + (d.significance || 1) * 2;
      
      // Add appropriate symbol based on entity type
      switch(d.type.toLowerCase()) {
        case "person":
          entityGroup.append("use")
            .attr("href", "#timeline-person")
            .attr("width", symbolSize)
            .attr("height", symbolSize)
            .attr("x", -symbolSize/2)
            .attr("y", -symbolSize/2)
            .attr("filter", "url(#timeline-glow)")
            .attr("opacity", 0)
            .transition()
            .delay((_, i) => i * 100)
            .duration(500)
            .attr("opacity", 0.9);
          break;
        case "event":
          entityGroup.append("use")
            .attr("href", "#timeline-event")
            .attr("width", symbolSize)
            .attr("height", symbolSize)
            .attr("x", -symbolSize/2)
            .attr("y", -symbolSize/2)
            .attr("filter", "url(#timeline-glow)")
            .attr("opacity", 0)
            .transition()
            .delay((_, i) => i * 100)
            .duration(500)
            .attr("opacity", 0.9);
          break;
        case "place":
          entityGroup.append("use")
            .attr("href", "#timeline-place")
            .attr("width", symbolSize)
            .attr("height", symbolSize)
            .attr("x", -symbolSize/2)
            .attr("y", -symbolSize/2)
            .attr("filter", "url(#timeline-glow)")
            .attr("opacity", 0)
            .transition()
            .delay((_, i) => i * 100)
            .duration(500)
            .attr("opacity", 0.9);
          break;
        case "concept":
          entityGroup.append("use")
            .attr("href", "#timeline-concept")
            .attr("width", symbolSize)
            .attr("height", symbolSize)
            .attr("x", -symbolSize/2)
            .attr("y", -symbolSize/2)
            .attr("filter", "url(#timeline-glow)")
            .attr("opacity", 0)
            .transition()
            .delay((_, i) => i * 100)
            .duration(500)
            .attr("opacity", 0.9);
          break;
        default:
          // Fallback to circle for unknown types
          entityGroup.append("circle")
            .attr("r", 4 + (d.significance || 1))
            .attr("fill", "hsl(240, 70%, 50%)")
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("filter", "url(#timeline-glow)")
            .attr("opacity", 0)
            .transition()
            .delay((_, i) => i * 100)
            .duration(500)
            .attr("opacity", 0.8);
      }
    });
    
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
        
        if (d.type.toLowerCase() === "person") {
          y = innerHeight / 4;
          return baselineY - y;
        }
        if (d.type.toLowerCase() === "concept") {
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
    <div 
      ref={containerRef}
      className={`w-full relative glass rounded-lg overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-8' : ''
      }`}
      style={isFullscreen ? { height: 'auto' } : { height: '500px' }}
    >
      <VisualizationControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleFullscreen={toggleFullscreen}
        onExport={handleExport}
        isFullscreen={isFullscreen}
      />
      
      <svg
        ref={svgRef}
        width="100%"
        height={isFullscreen ? '80vh' : '100%'}
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }}
      />
    </div>
  );
};

export default Timeline;
