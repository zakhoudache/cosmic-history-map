
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FormattedHistoricalEntity } from '@/types/supabase';
import { useAnimateOnMount } from '@/utils/animations';
import VisualizationPlaceholder from './VisualizationPlaceholder';
import { Separator } from './ui/separator';
import { CalendarRange, ChevronLeft, ChevronRight, Filter, ZoomIn, ZoomOut, X, Layers } from 'lucide-react';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";

interface TimelineProps {
  entities?: FormattedHistoricalEntity[];
  onEntitySelect?: (entity: FormattedHistoricalEntity) => void;
  timelineData?: any; // Add timelineData prop to fix the type error
}

const Timeline: React.FC<TimelineProps> = ({ entities = [], onEntitySelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useAnimateOnMount(300);
  const [timeRange, setTimeRange] = useState<[Date, Date] | null>(null);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [hoveredEntity, setHoveredEntity] = useState<FormattedHistoricalEntity | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({
    person: true,
    event: true,
    place: true,
    concept: true
  });
  const [groupingMode, setGroupingMode] = useState<'type' | 'chronology' | 'significance'>('type');
  const [layoutDensity, setLayoutDensity] = useState<'compact' | 'spread' | 'balanced'>('balanced');
  
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

  // Filter entities based on active filters
  const filteredEntities = entities.filter(entity => 
    entity.type && activeFilters[entity.type.toLowerCase() as keyof typeof activeFilters]
  );

  // Sort entities based on grouping mode
  const sortedEntities = [...filteredEntities].sort((a, b) => {
    if (groupingMode === 'chronology') {
      return new Date(a.startDate || '').getTime() - new Date(b.startDate || '').getTime();
    } else if (groupingMode === 'significance') {
      return (b.significance || 0) - (a.significance || 0);
    } else {
      // Default to type grouping
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      return new Date(a.startDate || '').getTime() - new Date(b.startDate || '').getTime();
    }
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

  // Toggle a filter
  const toggleFilter = (type: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: !prev[type as keyof typeof prev]
    }));
  };

  // Calculate layout density multiplier
  const getDensityMultiplier = () => {
    switch (layoutDensity) {
      case 'compact': return 0.7;
      case 'spread': return 1.3;
      case 'balanced': default: return 1;
    }
  };

  // Handle focus on specific entity
  const focusOnEntity = (entity: FormattedHistoricalEntity) => {
    if (!svgRef.current) return;
    
    const startDate = new Date(entity.startDate || '');
    const endDate = entity.endDate ? new Date(entity.endDate) : new Date(startDate);
    
    // Add padding to the time range
    const paddingTime = (endDate.getTime() - startDate.getTime()) * 2;
    const newStart = new Date(startDate.getTime() - paddingTime);
    const newEnd = new Date(endDate.getTime() + paddingTime);
    
    setTimeRange([newStart, newEnd]);
    
    // Also select the entity
    if (onEntitySelect) {
      onEntitySelect(entity);
    }
  };

  useEffect(() => {
    if (!svgRef.current || !isVisible || !entities || entities.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 50, right: 50, bottom: 70, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Find min and max dates from filtered entities
    let minDate = d3.min(sortedEntities, d => new Date(d.startDate || new Date()));
    let maxDate = d3.max(sortedEntities, d => new Date(d.endDate || d.startDate || new Date()));

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

    // Configure grouping and layout based on selected mode
    let rowCount = 0;
    let typeToRow: Map<string, number>;
    
    if (groupingMode === 'type') {
      // Group by entity type
      const uniqueTypes = Array.from(new Set(sortedEntities.map(e => e.type)));
      rowCount = uniqueTypes.length;
      
      // Map entity types to rows
      typeToRow = new Map();
      uniqueTypes.forEach((type, index) => {
        typeToRow.set(type, index);
      });
    } else if (groupingMode === 'significance') {
      // Group into significance tiers
      rowCount = 4; // Low, Medium, High, Very High
      typeToRow = new Map();
      
      sortedEntities.forEach(entity => {
        const significance = entity.significance || 0;
        let row = 0;
        if (significance > 7) row = 0; // Very High
        else if (significance > 5) row = 1; // High
        else if (significance > 3) row = 2; // Medium
        else row = 3; // Low
        typeToRow.set(entity.id, row);
      });
    } else {
      // Chronology - use evenly distributed rows
      rowCount = 5;
      typeToRow = new Map();
      
      // Assign entities to rows to minimize overlap
      sortedEntities.forEach((entity, i) => {
        typeToRow.set(entity.id, i % rowCount);
      });
    }
    
    // Calculate y position based on grouping strategy
    const getYPosition = (entity: FormattedHistoricalEntity) => {
      const densityMult = getDensityMultiplier();
      let rowIndex = 0;
      
      if (groupingMode === 'type') {
        rowIndex = typeToRow.get(entity.type) || 0;
      } else if (groupingMode === 'significance') {
        rowIndex = typeToRow.get(entity.id) || 0;
      } else {
        // For chronology, assign a row that minimizes overlap
        rowIndex = typeToRow.get(entity.id) || 0;
      }
      
      // Space rows evenly based on density setting
      return margin.top + (innerHeight * (rowIndex + 1) * densityMult) / (rowCount + 1);
    };

    // Set up entity colors based on type
    const typeColors = {
      person: '#8B5CF6',  // Purple
      event: '#F97316',   // Orange
      place: '#10B981',   // Green
      concept: '#0EA5E9', // Blue
      period: '#EC4899',  // Pink
      artwork: '#F43F5E', // Rose
      document: '#6366F1', // Indigo
      building: '#4338CA', // Blue
      theory: '#8B5CF6',  // Purple
      invention: '#F97316', // Orange
      process: '#10B981', // Green
      play: '#0EA5E9',    // Blue
      default: '#9b87f5'  // Default purple
    };

    // Draw timeline axis with grid
    const xAxis = d3.axisBottom(xScale)
      .ticks(10)
      .tickSize(-innerHeight)
      .tickFormat(d => {
        const date = d as Date;
        return date.getFullYear().toString();
      });

    // Create timeline background
    svg.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "#1a1a2e")
      .attr("opacity", 0.3)
      .attr("rx", 8);

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

    // Add title with current visualization settings
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("fill", "#F9FAFB")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text(`Historical Timeline - Grouped by ${groupingMode.charAt(0).toUpperCase() + groupingMode.slice(1)}`);

    // Create a group for the timeline content
    const timelineGroup = svg.append("g")
      .attr("class", "timeline-content");

    // Draw row labels based on grouping mode
    if (groupingMode === 'type') {
      const uniqueTypes = Array.from(new Set(sortedEntities.map(e => e.type)));
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
    } else if (groupingMode === 'significance') {
      const significanceLabels = ['Very High', 'High', 'Medium', 'Low'];
      
      for (let i = 0; i < significanceLabels.length; i++) {
        const y = margin.top + (innerHeight * (i + 1) * getDensityMultiplier()) / (rowCount + 1);
        
        svg.append("text")
          .attr("x", 10)
          .attr("y", y)
          .attr("text-anchor", "start")
          .attr("alignment-baseline", "middle")
          .attr("fill", "#D1D5DB")
          .attr("font-size", "14px")
          .attr("font-weight", "bold")
          .text(significanceLabels[i]);
      }
    }

    // Add time period highlights if there are notable clusters
    const timePeriods = [
      // Example periods - in a real app, these could be detected or user-defined
      // { name: "Renaissance", start: new Date("1400"), end: new Date("1600"), color: "rgba(139, 92, 246, 0.1)" },
      // { name: "Industrial Revolution", start: new Date("1760"), end: new Date("1840"), color: "rgba(249, 115, 22, 0.1)" }
    ];
    
    // Calculate periods based on entity distribution
    if (sortedEntities.length > 0 && groupingMode === 'chronology') {
      // Simple algorithm to detect periods with many events
      const dateCountMap = new Map<string, number>();
      
      // Count entities per century
      sortedEntities.forEach(entity => {
        if (!entity.startDate) return;
        const year = new Date(entity.startDate).getFullYear();
        const century = Math.floor(year / 100) * 100;
        const key = century.toString();
        
        dateCountMap.set(key, (dateCountMap.get(key) || 0) + 1);
      });
      
      // Find centuries with high entity counts
      const avgCount = Array.from(dateCountMap.values()).reduce((sum, count) => sum + count, 0) / dateCountMap.size;
      const significantCenturies = Array.from(dateCountMap.entries())
        .filter(([_, count]) => count > avgCount * 1.5) // Threshold for "significant"
        .map(([century]) => parseInt(century));
      
      // Add these as time periods
      significantCenturies.forEach((century, i) => {
        timePeriods.push({
          name: `${century}s`,
          start: new Date(century, 0, 1),
          end: new Date(century + 100, 0, 1),
          color: `rgba(${50 + i * 70}, ${100 + i * 20}, ${150 + i * 30}, 0.15)`
        });
      });
    }
    
    // Draw time period highlights
    timePeriods.forEach(period => {
      if (period.start && period.end) {
        const periodStartX = xScale(period.start);
        const periodEndX = xScale(period.end);
        const periodWidth = periodEndX - periodStartX;
        
        // Period background
        timelineGroup.append("rect")
          .attr("x", periodStartX)
          .attr("y", margin.top)
          .attr("width", periodWidth)
          .attr("height", innerHeight)
          .attr("fill", period.color)
          .attr("rx", 4);
        
        // Period label
        timelineGroup.append("text")
          .attr("x", periodStartX + periodWidth / 2)
          .attr("y", margin.top - 10)
          .attr("text-anchor", "middle")
          .attr("fill", "#9CA3AF")
          .attr("font-size", "12px")
          .text(period.name);
      }
    });

    // Draw connections between related entities
    const connections: { source: FormattedHistoricalEntity, target: FormattedHistoricalEntity }[] = [];
    
    sortedEntities.forEach(entity => {
      if (entity.relations) {
        entity.relations.forEach(relation => {
          const targetId = relation.targetId;
          const target = sortedEntities.find(e => e.id === targetId);
          
          if (target) {
            connections.push({
              source: entity,
              target
            });
          }
        });
      }
    });
    
    // Draw connection lines
    connections.forEach(connection => {
      const sourceX = xScale(new Date(connection.source.startDate || ''));
      const sourceY = getYPosition(connection.source);
      const targetX = xScale(new Date(connection.target.startDate || ''));
      const targetY = getYPosition(connection.target);
      
      // Draw curved connection line
      const linkPath = d3.linkHorizontal()
        .x(d => d[0])
        .y(d => d[1])
        .source([sourceX, sourceY])
        .target([targetX, targetY]);
      
      timelineGroup.append("path")
        .attr("d", linkPath)
        .attr("stroke", "#6B7280")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3")
        .attr("fill", "none")
        .attr("opacity", 0.4);
    });

    // Draw timeline events (dots and labels)
    sortedEntities.forEach((entity, i) => {
      if (!entity.startDate) return;
      
      const startDate = new Date(entity.startDate);
      const endDate = entity.endDate ? new Date(entity.endDate) : startDate;
      const startX = xScale(startDate);
      const endX = xScale(endDate);
      const y = getYPosition(entity);
      
      // Get color based on entity type
      const color = typeColors[entity.type as keyof typeof typeColors] || typeColors.default;
      
      // Calculate size based on significance
      const significance = entity.significance || 5;
      const dotSize = 5 + significance;
      
      // Draw line for entities that span a period
      if (entity.endDate && endX > startX + 10) {
        // Draw a period bar
        timelineGroup.append("line")
          .attr("x1", startX)
          .attr("y1", y)
          .attr("x2", endX)
          .attr("y2", y)
          .attr("stroke", color)
          .attr("stroke-width", 3)
          .attr("stroke-opacity", 0.6);
        
        // Add decorative end caps
        timelineGroup.append("circle")
          .attr("cx", startX)
          .attr("cy", y)
          .attr("r", 4)
          .attr("fill", color)
          .attr("stroke", "#1F2937")
          .attr("stroke-width", 1);
        
        timelineGroup.append("circle")
          .attr("cx", endX)
          .attr("cy", y)
          .attr("r", 4)
          .attr("fill", color)
          .attr("stroke", "#1F2937")
          .attr("stroke-width", 1);
      }

      // Draw circle for start date
      const circle = timelineGroup.append("circle")
        .attr("cx", startX)
        .attr("cy", y)
        .attr("r", dotSize)
        .attr("fill", color)
        .attr("stroke", "#1F2937")
        .attr("stroke-width", 2)
        .style("cursor", "pointer")
        .on("click", () => {
          focusOnEntity(entity);
        })
        .on("mouseover", () => {
          setHoveredEntity(entity);
          d3.select(d3.event.currentTarget)
            .transition()
            .duration(200)
            .attr("r", dotSize * 1.5);
        })
        .on("mouseout", () => {
          setHoveredEntity(null);
          d3.select(d3.event.currentTarget)
            .transition()
            .duration(200)
            .attr("r", dotSize);
        });

      // Add hover effect with animation
      const pulseAnimation = circle.append("animate")
        .attr("attributeName", "r")
        .attr("values", `${dotSize};${dotSize * 1.2};${dotSize}`)
        .attr("dur", "2s")
        .attr("repeatCount", "indefinite");
      
      // Add entity name as small label
      // Alternate label positions to avoid overlap
      const verticalOffset = i % 2 === 0 ? -15 : 20;
      timelineGroup.append("text")
        .attr("x", startX)
        .attr("y", y + verticalOffset)
        .attr("text-anchor", "middle")
        .attr("fill", "#E5E7EB")
        .attr("font-size", "12px")
        .attr("font-weight", "500")
        .text(entity.name.length > 20 ? entity.name.substring(0, 18) + "..." : entity.name);
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

  }, [entities, isVisible, timeRange, currentZoom, activeFilters, groupingMode, layoutDensity, sortedEntities]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      {entities && entities.length > 0 ? (
        <>
          <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
            {/* Zoom Controls */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => adjustZoom(1.2)}
              className="flex items-center gap-1 h-8 px-2"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => adjustZoom(0.8)}
              className="flex items-center gap-1 h-8 px-2"
            >
              <ZoomOut className="h-4 w-4" />
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
            
            {/* Filter Controls */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1 h-8 px-3">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Filter Entities</h4>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-person" 
                        checked={activeFilters.person} 
                        onCheckedChange={() => toggleFilter('person')} 
                      />
                      <Label htmlFor="filter-person" className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#8B5CF6]"></span>
                        Person
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-event" 
                        checked={activeFilters.event} 
                        onCheckedChange={() => toggleFilter('event')} 
                      />
                      <Label htmlFor="filter-event" className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#F97316]"></span>
                        Event
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-place" 
                        checked={activeFilters.place} 
                        onCheckedChange={() => toggleFilter('place')} 
                      />
                      <Label htmlFor="filter-place" className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
                        Place
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="filter-concept" 
                        checked={activeFilters.concept} 
                        onCheckedChange={() => toggleFilter('concept')} 
                      />
                      <Label htmlFor="filter-concept" className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#0EA5E9]"></span>
                        Concept
                      </Label>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Grouping Controls */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1 h-8 px-3">
                  <Layers className="h-4 w-4" />
                  <span>Layout</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Timeline Layout</h4>
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="grouping-mode">Grouping</Label>
                    <Select 
                      value={groupingMode} 
                      onValueChange={(value) => setGroupingMode(value as 'type' | 'chronology' | 'significance')}
                    >
                      <SelectTrigger id="grouping-mode" className="w-full">
                        <SelectValue placeholder="Group by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="type">By Type</SelectItem>
                        <SelectItem value="chronology">Chronological</SelectItem>
                        <SelectItem value="significance">By Significance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="density-mode">Density</Label>
                    <Select 
                      value={layoutDensity} 
                      onValueChange={(value) => setLayoutDensity(value as 'compact' | 'spread' | 'balanced')}
                    >
                      <SelectTrigger id="density-mode" className="w-full">
                        <SelectValue placeholder="Layout Density" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="spread">Spread Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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
              <div className="flex justify-between items-start">
                <h3 className="text-primary text-sm font-bold">{hoveredEntity.name}</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary-foreground">
                  {hoveredEntity.type}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {hoveredEntity.startDate && formatDate(hoveredEntity.startDate)}
                {hoveredEntity.endDate && ` - ${formatDate(hoveredEntity.endDate)}`}
              </p>
              {hoveredEntity.description && (
                <p className="text-xs text-foreground/80 mt-1 max-h-20 overflow-y-auto">
                  {hoveredEntity.description}
                </p>
              )}
              <div className="mt-2 text-xs text-muted-foreground">
                <span>Click to focus on this entity</span>
              </div>
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
