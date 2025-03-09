import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HistoricalEntity, prepareVisualizationData } from '@/utils/mockData';
import { useAnimateOnMount } from '@/utils/animations';
import VisualizationPlaceholder from './VisualizationPlaceholder';

interface CosmicVisualizationProps {
  entities?: HistoricalEntity[];
  onEntitySelect?: (entity: HistoricalEntity) => void;
}

const CosmicVisualization: React.FC<CosmicVisualizationProps> = ({ 
  entities,
  onEntitySelect
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const visualizationData = entities && entities.length > 0 ? entities : [];
  const isVisible = useAnimateOnMount(300);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const hasData = entities && entities.length > 0;
  
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
  
  // Create and update visualization only if we have data
  useEffect(() => {
    if (!svgRef.current || !isVisible || !hasData) return;
    
    
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
    
    // Add glow filter
    const glowFilter = defs.append("filter")
      .attr("id", "cosmic-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
      
    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", "5")
      .attr("result", "blur");
      
    glowFilter.append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");
    
    // Add the background
    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", Math.min(width, height) * 0.4)
      .attr("fill", "url(#cosmic-background)")
      .attr("class", "animate-pulse-subtle");
    
    // Add some ambient stars
    const starsCount = 150;
    const starData = Array.from({ length: starsCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5,
      opacity: Math.random() * 0.8 + 0.2,
      pulsate: Math.random() > 0.7
    }));
    
    const stars = svg.selectAll(".star")
      .data(starData)
      .enter()
      .append("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", d => d.r)
      .attr("fill", "white")
      .attr("opacity", d => d.opacity);
    
    // Add pulsating animation to some stars
    stars.filter(d => d.pulsate)
      .attr("class", "animate-pulse-subtle");
    
    // Add nebula clouds
    const nebulaCount = 5;
    for (let i = 0; i < nebulaCount; i++) {
      const x = width * 0.2 + Math.random() * width * 0.6;
      const y = height * 0.2 + Math.random() * height * 0.6;
      const size = 50 + Math.random() * 100;
      const hue = Math.random() * 360;
      
      svg.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", size)
        .attr("fill", `hsla(${hue}, 70%, 50%, 0.05)`)
        .attr("filter", "url(#cosmic-glow)")
        .attr("class", "animate-pulse-subtle")
        .style("animation-duration", `${5 + Math.random() * 5}s`)
        .style("animation-delay", `${Math.random() * 2}s`);
    }
    
    // Set up force simulation
    const simulation = d3.forceSimulation()
      .nodes(visualizationData as d3.SimulationNodeDatum[])
      .force("center", d3.forceCenter(centerX, centerY))
      .force("charge", d3.forceManyBody().strength(d => (d as HistoricalEntity).significance ? (d as HistoricalEntity).significance * -50 : -150))
      .force("collision", d3.forceCollide().radius(d => {
        const entity = d as HistoricalEntity;
        return (entity.significance || 5) * 5 + 20;
      }))
      .force("x", d3.forceX(centerX).strength(0.05))
      .force("y", d3.forceY(centerY).strength(0.05));
    
    // Extract entity connections
    const getEntityConnections = (entity: HistoricalEntity) => {
      if (entity.relations && Array.isArray(entity.relations)) {
        return entity.relations
          .map(relation => {
            const targetId = relation.targetId;
            const target = visualizationData.find(e => e.id === targetId);
            if (target) {
              return { source: entity, target };
            }
            return null;
          })
          .filter(Boolean); // Remove null values
      } 
      return [];
    };
    
    // Get all valid links
    const allLinks = visualizationData
      .flatMap(entity => getEntityConnections(entity))
      .filter(link => link !== null);
    
    // Create entity links with gradient effects
    const links = svg.append("g")
      .attr("class", "links")
      .selectAll(".link-path")
      .data(allLinks)
      .enter()
      .append("path")
      .attr("class", "link-path")
      .attr("stroke", (d: any) => {
        // Determine link color based on entity types
        const sourceType = d.source.type;
        const targetType = d.target.type;
        
        if (sourceType === targetType) {
          switch(sourceType) {
            case "person": return "rgba(200, 100, 255, 0.2)";
            case "event": return "rgba(100, 200, 255, 0.2)";
            case "place": return "rgba(100, 255, 200, 0.2)";
            case "concept": return "rgba(255, 200, 100, 0.2)";
            default: return "rgba(200, 200, 200, 0.2)";
          }
        } else {
          return "rgba(200, 200, 255, 0.15)";
        }
      })
      .attr("stroke-width", 1)
      .attr("fill", "none")
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
    
    // Add auras for each entity
    nodeGroups.append("circle")
      .attr("class", "entity-aura")
      .attr("r", d => (d.significance || 5) * 6 + 15)
      .attr("fill", d => {
        // Color based on entity type with more cosmic feel
        switch(d.type) {
          case "person": return "hsla(280, 90%, 60%, 0.1)";
          case "event": return "hsla(220, 90%, 60%, 0.1)";
          case "place": return "hsla(180, 90%, 60%, 0.1)";
          case "concept": return "hsla(320, 90%, 60%, 0.1)";
          default: return "hsla(240, 90%, 60%, 0.1)";
        }
      })
      .attr("filter", "url(#cosmic-glow)")
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 100)
      .duration(1000)
      .attr("opacity", 0.8);
    
    // Add glowing core for each entity
    nodeGroups.append("circle")
      .attr("class", "entity-core")
      .attr("r", d => (d.significance || 5) * 4 + 8)
      .attr("fill", d => {
        // Color based on entity type
        switch(d.type) {
          case "person": return "hsl(280, 90%, 60%)";
          case "event": return "hsl(220, 90%, 60%)";
          case "place": return "hsl(180, 90%, 60%)";
          case "concept": return "hsl(320, 90%, 60%)";
          default: return "hsl(240, 90%, 60%)";
        }
      })
      .attr("stroke", "rgba(255, 255, 255, 0.5)")
      .attr("stroke-width", 1)
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 100)
      .duration(1000)
      .attr("opacity", 0.8);

    // Add ripple effect
    nodeGroups.append("circle")
      .attr("class", "entity-ripple")
      .attr("r", d => (d.significance || 5) * 4 + 8)
      .attr("fill", "none")
      .attr("stroke", d => {
        // Color based on entity type
        switch(d.type) {
          case "person": return "hsla(280, 90%, 60%, 0.5)";
          case "event": return "hsla(220, 90%, 60%, 0.5)";
          case "place": return "hsla(180, 90%, 60%, 0.5)";
          case "concept": return "hsla(320, 90%, 60%, 0.5)";
          default: return "hsla(240, 90%, 60%, 0.5)";
        }
      })
      .attr("stroke-width", 1)
      .attr("opacity", 0.5);
    
    // Animate ripple effects
    visualizationData.forEach((entity, i) => {
      const node = nodeGroups.filter((d, j) => j === i);
      const ripple = node.select(".entity-ripple");
      
      function animateRipple() {
        ripple
          .attr("r", (entity.significance || 5) * 4 + 8)
          .attr("opacity", 0.5)
          .transition()
          .duration(2000)
          .attr("r", (entity.significance || 5) * 8 + 16)
          .attr("opacity", 0)
          .on("end", animateRipple);
      }
      
      // Start animation with delay based on significance
      setTimeout(animateRipple, (entity.significance || 5) * 300);
    });
    
    // Add entity type indicators
    nodeGroups.append("text")
      .attr("class", "entity-type")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("font-size", d => 10 + (d.significance || 5) / 2)
      .attr("fill", "white")
      .attr("pointer-events", "none")
      .text(d => {
        switch(d.type) {
          case "person": return "👤";
          case "event": return "📅";
          case "place": return "📍";
          case "concept": return "💡";
          default: return "•";
        }
      })
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 100 + 800)
      .duration(1000)
      .attr("opacity", 1);
    
    // Add labels
    nodeGroups.append("text")
      .attr("class", "entity-label")
      .attr("text-anchor", "middle")
      .attr("dy", d => (d.significance || 5) * 4 + 20)
      .attr("fill", "white")
      .attr("font-size", d => 10 + (d.significance || 5) / 2)
      .attr("pointer-events", "none")
      .text(d => d.name)
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 100 + 500)
      .duration(1000)
      .attr("opacity", 0.9);
    
    // Add temporal indicators for entities with dates
    nodeGroups.filter(d => d.startDate)
      .append("text")
      .attr("class", "temporal-indicator")
      .attr("text-anchor", "middle")
      .attr("dy", d => (d.significance || 5) * 4 + 35)
      .attr("fill", "rgba(255, 255, 255, 0.7)")
      .attr("font-size", 9)
      .attr("pointer-events", "none")
      .text(d => {
        const startYear = new Date(d.startDate as string).getFullYear();
        const endYear = d.endDate ? new Date(d.endDate as string).getFullYear() : null;
        return endYear ? `${startYear}-${endYear}` : `${startYear}`;
      })
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 100 + 600)
      .duration(1000)
      .attr("opacity", 0.7);
    
    // Update positions on each simulation tick
    simulation.on("tick", () => {
      links
        .attr("d", (d: any) => {
          if (!d.source.x || !d.target.x) return "";
          
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
          
          return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
        });
      
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
  
  // If no data, render placeholder
  if (!hasData) {
    return <VisualizationPlaceholder type="cosmic" />;
  }
  
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
