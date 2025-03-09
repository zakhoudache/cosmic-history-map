
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FormattedHistoricalEntity } from '@/types/supabase';
import { useAnimateOnMount } from '@/utils/animations';
import VisualizationPlaceholder from './VisualizationPlaceholder';
import { Separator } from './ui/separator';
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface TimelineProps {
  entities?: FormattedHistoricalEntity[];
  onEntitySelect?: (entity: FormattedHistoricalEntity) => void;
}

const Timeline: React.FC<TimelineProps> = ({ entities = [], onEntitySelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useAnimateOnMount(300);
  const [timeRange, setTimeRange] = useState<[Date, Date] | null>(null);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [hoveredEntity, setHoveredEntity] = useState<FormattedHistoricalEntity | null>(null);

  // Helper to format dates consistently
  const formatDate = (date: Date | string): string => {
    if (!date) return 'Unknown';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Sort entities by start date to ensure consistent display
  const sortedEntities = entities.sort((a, b) => {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

  // Function to navigate through time periods
  const navigateTimeline = (direction: 'forward' | 'backward') => {
    if (!timeRange) return;
    
    const [start, end] = timeRange;
    const timeSpan = end.getTime() - start.getTime();
    
    if (direction === 'forward') {
      const newStart = new Date(start.getTime() + timeSpan * 0.5);
      const newEnd = new Date(end.getTime() + timeSpan * 0.5);
      setTimeRange([newStart, newEnd]);
    } else {
      const newStart = new Date(start.getTime() - timeSpan * 0.5);
      const newEnd = new Date(end.getTime() - timeSpan * 0.5);
      setTimeRange([newStart, newEnd]);
    }
  };

  // Adjust zoom level
  const adjustZoom = (factor: number) => {
    const newZoom = Math.max(0.5, Math.min(5, currentZoom * factor));
    setCurrentZoom(newZoom);
    
    if (timeRange) {
      const [start, end] = timeRange;
      const middle = new Date((start.getTime() + end.getTime()) / 2);
      const timeSpan = end.getTime() - start.getTime();
      const newTimeSpan = timeSpan / factor;
      
      const newStart = new Date(middle.getTime() - newTimeSpan / 2);
      const newEnd = new Date(middle.getTime() + newTimeSpan / 2);
      setTimeRange([newStart, newEnd]);
    }
  };

  // Reset to show full timeline
  const resetZoom = () => {
    setCurrentZoom(1);
    setTimeRange(null);
  };

  useEffect(() => {
    if (!svgRef.current || !isVisible || !entities || entities.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 50, right: 50, bottom: 70, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Find min and max dates
    let minDate = d3.min(sortedEntities, d => new Date(d.startDate));
    let maxDate = d3.max(sortedEntities, d => new Date(d.endDate || d.startDate));

    if (!minDate || !maxDate) return;

    // Add some padding to date range
    minDate = new Date(minDate.getTime() - 86400000 * 365); // 1 year before
    maxDate = new Date(maxDate.getTime() + 86400000 * 365); // 1 year after

    // Use timeRange state if available, otherwise use min/max
    const effectiveRange = timeRange || [minDate, maxDate];

    // Create scales
    const xScale = d3.scaleTime()
      .domain(effectiveRange)
      .range([margin.left, width - margin.right]);

    // Create a separate scale for y positions for better visualization
    const uniqueTypes = Array.from(new Set(sortedEntities.map(e => e.type)));
    const typeColors = {
      person: '#8B5CF6',  // Purple
      event: '#F97316',   // Orange
      place: '#10B981',   // Green
      concept: '#0EA5E9', // Blue
      default: '#9b87f5'  // Default purple
    };

    // Map entity types to rows
    const typeToRow = new Map();
    uniqueTypes.forEach((type, index) => {
      typeToRow.set(type, index);
    });
    
    // Calculate y position based on entity type
    const getYPosition = (entity: FormattedHistoricalEntity) => {
      const rowIndex = typeToRow.get(entity.type) || 0;
      // Space rows evenly but leave room at top and bottom
      return margin.top + (innerHeight * (rowIndex + 1)) / (uniqueTypes.length + 1);
    };

    // Draw timeline axis with grid
    const xAxis = d3.axisBottom(xScale)
      .ticks(10)
      .tickSize(-innerHeight)
      .tickFormat(d => {
        const date = d as Date;
        return date.getFullYear().toString();
      });

    // Create main timeline axis
    const axisGroup = svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis);
    
    // Style axis and grid lines
    axisGroup.selectAll(".domain").attr("stroke", "#4B5563");
    axisGroup.selectAll(".tick line")
      .attr("stroke", "#374151")
      .attr("stroke-dasharray", "2,2");
    axisGroup.selectAll(".tick text")
      .attr("fill", "#D1D5DB")
      .attr("font-size", "12px");

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("fill", "#F9FAFB")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Historical Timeline");

    // Create a group for the timeline content
    const timelineGroup = svg.append("g")
      .attr("class", "timeline-content");

    // Draw type labels on the left
    uniqueTypes.forEach(type => {
      const y = getYPosition({ type } as FormattedHistoricalEntity);
      
      // Type label
      svg.append("text")
        .attr("x", 10)
        .attr("y", y)
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "middle")
        .attr("fill", typeColors[type as keyof typeof typeColors] || typeColors.default)
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(type.charAt(0).toUpperCase() + type.slice(1));
    });

    // Draw timeline events (dots and labels)
    sortedEntities.forEach((entity, i) => {
      const startDate = new Date(entity.startDate);
      const endDate = entity.endDate ? new Date(entity.endDate) : startDate;
      const startX = xScale(startDate);
      const endX = xScale(endDate);
      const y = getYPosition(entity);
      
      // Get color based on entity type
      const color = typeColors[entity.type as keyof typeof typeColors] || typeColors.default;
      
      // Draw line for entities that span a period
      if (entity.endDate && endX > startX + 10) {
        timelineGroup.append("line")
          .attr("x1", startX)
          .attr("y1", y)
          .attr("x2", endX)
          .attr("y2", y)
          .attr("stroke", color)
          .attr("stroke-width", 3)
          .attr("stroke-opacity", 0.6);
      }

      // Draw circle for start date
      const circle = timelineGroup.append("circle")
        .attr("cx", startX)
        .attr("cy", y)
        .attr("r", 8)
        .attr("fill", color)
        .attr("stroke", "#1F2937")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("click", () => {
          if (onEntitySelect) {
            onEntitySelect(entity);
          }
        })
        .on("mouseover", () => {
          setHoveredEntity(entity);
          d3.select(d3.event.currentTarget)
            .transition()
            .duration(200)
            .attr("r", 12);
        })
        .on("mouseout", () => {
          setHoveredEntity(null);
          d3.select(d3.event.currentTarget)
            .transition()
            .duration(200)
            .attr("r", 8);
        });

      // Add hover effect
      const pulse = circle.append("animate")
        .attr("attributeName", "r")
        .attr("values", "8;10;8")
        .attr("dur", "2s")
        .attr("repeatCount", "indefinite");
      
      // Add entity name as small label
      if (i % 2 === 0) {
        // Place labels alternating above and below the timeline to avoid overlap
        timelineGroup.append("text")
          .attr("x", startX)
          .attr("y", y - 15)
          .attr("text-anchor", "middle")
          .attr("fill", "#E5E7EB")
          .attr("font-size", "12px")
          .attr("font-weight", "500")
          .text(entity.name.length > 20 ? entity.name.substring(0, 18) + "..." : entity.name);
      } else {
        timelineGroup.append("text")
          .attr("x", startX)
          .attr("y", y + 20)
          .attr("text-anchor", "middle")
          .attr("fill", "#E5E7EB")
          .attr("font-size", "12px")
          .attr("font-weight", "500")
          .text(entity.name.length > 20 ? entity.name.substring(0, 18) + "..." : entity.name);
      }
    });

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", () => {
        timelineGroup.attr("transform", d3.event.transform);
        
        // Update the axis with the new transform
        const newXScale = d3.event.transform.rescaleX(xScale);
        axisGroup.call(xAxis.scale(newXScale));
        
        // Update current visible time range
        const newDomain = newXScale.domain();
        setTimeRange([newDomain[0], newDomain[1]]);
        setCurrentZoom(d3.event.transform.k);
      });

    svg.call(zoom);

  }, [entities, isVisible, timeRange, currentZoom]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      {entities && entities.length > 0 ? (
        <>
          <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => adjustZoom(1.2)}
              className="flex items-center gap-1 h-8 px-2"
            >
              <span>+</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => adjustZoom(0.8)}
              className="flex items-center gap-1 h-8 px-2"
            >
              <span>-</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetZoom}
              className="flex items-center gap-1 h-8 px-3"
            >
              <CalendarRange className="h-4 w-4" />
              <span>Reset</span>
            </Button>
          </div>
          
          <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateTimeline('backward')}
              className="flex items-center gap-1 h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Earlier</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateTimeline('forward')}
              className="flex items-center gap-1 h-8 px-2"
            >
              <span>Later</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {hoveredEntity && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm p-3 rounded-md border border-primary/30 z-20 max-w-md">
              <h3 className="text-primary text-sm font-bold">{hoveredEntity.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {hoveredEntity.startDate && formatDate(hoveredEntity.startDate)}
                {hoveredEntity.endDate && ` - ${formatDate(hoveredEntity.endDate)}`}
              </p>
              {hoveredEntity.description && (
                <p className="text-xs text-foreground/80 mt-1 line-clamp-2">
                  {hoveredEntity.description}
                </p>
              )}
            </div>
          )}
          
          <svg ref={svgRef} className="w-full h-full" id="timeline-visualization" />
          
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-md flex items-center gap-4 border border-primary/20">
            {/* Timeline Legend */}
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#8B5CF6]"></span>
              <span className="text-xs text-gray-300">Person</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#F97316]"></span>
              <span className="text-xs text-gray-300">Event</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
              <span className="text-xs text-gray-300">Place</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#0EA5E9]"></span>
              <span className="text-xs text-gray-300">Concept</span>
            </div>
          </div>
        </>
      ) : (
        <VisualizationPlaceholder />
      )}
    </div>
  );
};

export default Timeline;
