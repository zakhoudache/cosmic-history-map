
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FormattedHistoricalEntity } from '@/types/supabase';
import { useAnimateOnMount } from '@/utils/animations';
import VisualizationPlaceholder from './VisualizationPlaceholder';

interface TimelineProps {
  entities?: FormattedHistoricalEntity[];
  onEntitySelect?: (entity: FormattedHistoricalEntity) => void;
  // Remove timelineData prop as it's not needed
}

const Timeline: React.FC<TimelineProps> = ({ entities = [], onEntitySelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const isVisible = useAnimateOnMount(300);

  useEffect(() => {
    if (!svgRef.current || !isVisible || !entities) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Sort entities by start date
    const sortedEntities = entities.sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    // Define scales
    const minDate = d3.min(sortedEntities, d => new Date(d.startDate));
    const maxDate = d3.max(sortedEntities, d => new Date(d.endDate || d.startDate));

    if (!minDate || !maxDate) return;

    const xScale = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([50, width - 50]);

    const yScale = d3.scaleLinear()
      .domain([0, sortedEntities.length])
      .range([50, height - 50]);

    // Create timeline axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickSizeOuter(0);

    svg.append("g")
      .attr("transform", `translate(0, ${height - 50})`)
      .call(xAxis);

    // Draw timeline lines and circles
    sortedEntities.forEach((entity, i) => {
      const startX = xScale(new Date(entity.startDate));
      const endX = entity.endDate ? xScale(new Date(entity.endDate)) : startX;
      const y = yScale(i);

      // Draw line
      svg.append("line")
        .attr("x1", startX)
        .attr("y1", y)
        .attr("x2", endX)
        .attr("y2", y)
        .attr("stroke", "gray")
        .attr("stroke-width", 2);

      // Draw circle
      svg.append("circle")
        .attr("cx", startX)
        .attr("cy", y)
        .attr("r", 6)
        .attr("fill", "steelblue")
        .style("cursor", "pointer")
        .on("click", () => handleEntityClick(entity)); // Attach click handler
    });

  }, [entities, isVisible]);

  // Update the entity click handler
  const handleEntityClick = (entity: FormattedHistoricalEntity) => {
    if (onEntitySelect) {
      onEntitySelect(entity);
    }
  };

  return (
    <div className="w-full h-full">
      {entities && entities.length > 0 ? (
        <svg ref={svgRef} className="w-full h-full" />
      ) : (
        <VisualizationPlaceholder />
      )}
    </div>
  );
};

export default Timeline;
