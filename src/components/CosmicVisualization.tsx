
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HistoricalEntity, prepareVisualizationData } from '@/utils/mockData';
import { useAnimateOnMount } from '@/utils/animations';

interface CosmicVisualizationProps {
  entities?: HistoricalEntity[];
  onEntitySelect?: (entity: HistoricalEntity) => void;
}

const CosmicVisualization: React.FC<CosmicVisualizationProps> = ({ 
  entities,
  onEntitySelect
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const visualizationData = entities || prepareVisualizationData();
  const isVisible = useAnimateOnMount(300);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Initialize layout and resize handling
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.parentElement?.getBoundingClientRect() || { width: 800, height: 600 };
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
    if (!svgRef.current || !isVisible) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    // Set up the SVG
    const { width, height } = dimensions;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create a background
    const defs = svg.append("defs");
    
    // Add a radial gradient for the background
    const gradient = defs.append("radialGradient")
      .attr("id", "cosmic-background")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
      
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "hsl(240, 60%, 20%)")
      .attr("stop-opacity", 0.1);
      
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "transparent");
    
    // Add the background
    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", Math.min(width, height) * 0.4)
      .attr("fill", "url(#cosmic-background)")
      .attr("class", "animate-pulse-subtle");
    
    // Add some ambient stars
    const starsCount = 100;
    const starData = Array.from({ length: starsCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5,
      opacity: Math.random() * 0.8 + 0.2
    }));
    
    svg.selectAll(".star")
      .data(starData)
      .enter()
      .append("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", d => d.r)
      .attr("fill", "white")
      .attr("opacity", d => d.opacity)
      .attr("class", "animate-pulse-subtle");
    
    // Set up force simulation
    const simulation = d3.forceSimulation()
      .nodes(visualizationData as d3.SimulationNodeDatum[])
      .force("center", d3.forceCenter(centerX, centerY))
      .force("charge", d3.forceManyBody().strength(d => d.significance * -50))
      .force("collision", d3.forceCollide().radius(d => (d as HistoricalEntity).significance * 5 + 20))
      .force("x", d3.forceX(centerX).strength(0.05))
      .force("y", d3.forceY(centerY).strength(0.05));
    
    // Create entity links
    const links = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(visualizationData.flatMap(entity => 
        entity.connections.map(connId => ({
          source: entity,
          target: visualizationData.find(e => e.id === connId)
        })).filter(link => link.target) // Filter out any undefined targets
      ))
      .enter()
      .append("line")
      .attr("stroke", "rgba(255, 255, 255, 0.1)")
      .attr("stroke-width", 1)
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 20)
      .duration(1000)
      .attr("opacity", 0.3);
    
    // Create entity nodes
    const nodeGroups = svg.append("g")
      .attr("class", "nodes")
      .selectAll(".node")
      .data(visualizationData)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (onEntitySelect) {
          onEntitySelect(d as HistoricalEntity);
        }
      })
      .call(d3.drag<SVGGElement, HistoricalEntity>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any);
    
    // Add circles for each entity
    nodeGroups.append("circle")
      .attr("r", d => d.significance * 4 + 8)
      .attr("fill", d => {
        // Color based on entity type
        switch(d.type) {
          case "person": return "hsl(280, 80%, 60%)";
          case "event": return "hsl(240, 70%, 50%)";
          case "place": return "hsl(200, 70%, 50%)";
          case "concept": return "hsl(320, 70%, 50%)";
          default: return "hsl(240, 70%, 50%)";
        }
      })
      .attr("stroke", "rgba(255, 255, 255, 0.3)")
      .attr("stroke-width", 1)
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 100)
      .duration(1000)
      .attr("opacity", 0.8);

    // Add ripple effect
    nodeGroups.append("circle")
      .attr("r", d => d.significance * 4 + 8)
      .attr("fill", "none")
      .attr("stroke", d => {
        // Color based on entity type
        switch(d.type) {
          case "person": return "hsl(280, 80%, 60%)";
          case "event": return "hsl(240, 70%, 50%)";
          case "place": return "hsl(200, 70%, 50%)";
          case "concept": return "hsl(320, 70%, 50%)";
          default: return "hsl(240, 70%, 50%)";
        }
      })
      .attr("stroke-width", 1)
      .attr("opacity", 0.5)
      .attr("class", d => `ripple-effect-${d.id}`)
      .style("pointer-events", "none");
    
    // Animate ripple effects
    visualizationData.forEach(entity => {
      const ripple = svg.select(`.ripple-effect-${entity.id}`);
      
      function animateRipple() {
        ripple
          .attr("r", entity.significance * 4 + 8)
          .attr("opacity", 0.5)
          .transition()
          .duration(2000)
          .attr("r", entity.significance * 8 + 16)
          .attr("opacity", 0)
          .on("end", animateRipple);
      }
      
      // Start animation with delay based on significance
      setTimeout(animateRipple, entity.significance * 300);
    });
    
    // Add labels
    nodeGroups.append("text")
      .text(d => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", d => -d.significance * 4 - 12)
      .attr("fill", "white")
      .attr("font-size", d => 10 + d.significance / 2)
      .attr("pointer-events", "none")
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 100 + 500)
      .duration(1000)
      .attr("opacity", 0.9);
    
    // Add type indicator
    nodeGroups.append("text")
      .text(d => {
        switch(d.type) {
          case "person": return "👤";
          case "event": return "📅";
          case "place": return "📍";
          case "concept": return "💡";
          default: return "•";
        }
      })
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("font-size", d => 10 + d.significance / 2)
      .attr("pointer-events", "none")
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 100 + 800)
      .duration(1000)
      .attr("opacity", 1);
    
    // Update positions on each simulation tick
    simulation.on("tick", () => {
      links
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);
      
      nodeGroups.attr("transform", d => `translate(${d.x}, ${d.y})`);
    });
    
    // Stop simulation after a certain time to reduce CPU usage
    setTimeout(() => {
      simulation.stop();
    }, 10000);
    
    return () => {
      simulation.stop();
    };
  }, [visualizationData, isVisible, dimensions, onEntitySelect]);
  
  return (
    <div className="w-full h-full min-h-[500px] relative overflow-hidden rounded-lg glass">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="cosmic-background"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 1s ease-in-out'
        }}
      />
    </div>
  );
};

export default CosmicVisualization;
