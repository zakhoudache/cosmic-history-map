
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HistoricalEntity, getEntityConnections, mockHistoricalData } from '@/utils/mockData';
import { useAnimateOnMount } from '@/utils/animations';

interface KnowledgeGraphProps {
  entities?: HistoricalEntity[];
  onEntitySelect?: (entity: HistoricalEntity) => void;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ 
  entities = mockHistoricalData, 
  onEntitySelect 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const isVisible = useAnimateOnMount(500);
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });

  // Initialize layout and resize handling
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.parentElement?.getBoundingClientRect() || { width: 500, height: 400 };
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
    
    // Prepare data
    const nodes = entities.map(entity => ({ ...entity }));
    const links = getEntityConnections().map(link => ({
      ...link,
      source: nodes.findIndex(node => node.id === link.source),
      target: nodes.findIndex(node => node.id === link.target)
    }));
    
    // Create forces
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink<d3.SimulationNodeDatum, d3.SimulationLinkDatum<d3.SimulationNodeDatum>>(links).id(d => (d as HistoricalEntity).id))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));
    
    // Create links
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "rgba(255, 255, 255, 0.2)")
      .attr("stroke-width", 1)
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 30)
      .duration(800)
      .attr("opacity", 0.5);
    
    // Create nodes
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (onEntitySelect) {
          onEntitySelect(d as HistoricalEntity);
        }
      })
      .call(d3.drag<SVGGElement, any>()
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
    
    // Add shapes based on entity type
    node.append("path")
      .attr("d", d => {
        const size = 20;
        
        switch (d.type) {
          case "person":
            return d3.symbol().type(d3.symbolCircle).size(size * size)();
          case "event":
            return d3.symbol().type(d3.symbolSquare).size(size * size)();
          case "place":
            return d3.symbol().type(d3.symbolTriangle).size(size * size)();
          case "concept":
            return d3.symbol().type(d3.symbolDiamond).size(size * size)();
          default:
            return d3.symbol().type(d3.symbolCircle).size(size * size)();
        }
      })
      .attr("fill", d => {
        switch (d.group) {
          case "cultural": return "hsl(280, 70%, 50%)";
          case "art": return "hsl(340, 70%, 50%)";
          case "politics": return "hsl(200, 70%, 50%)";
          case "technology": return "hsl(150, 70%, 50%)";
          case "geography": return "hsl(100, 70%, 50%)";
          case "philosophy": return "hsl(50, 70%, 50%)";
          default: return "hsl(240, 70%, 50%)";
        }
      })
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 50)
      .duration(500)
      .attr("opacity", 0.8);
    
    // Add labels
    node.append("text")
      .text(d => d.name)
      .attr("dx", 12)
      .attr("dy", 4)
      .attr("font-size", 10)
      .attr("fill", "white")
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 50 + 300)
      .duration(500)
      .attr("opacity", 0.9);
    
    // Update positions
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
      
      node.attr("transform", d => `translate(${d.x}, ${d.y})`);
    });
    
    // Stop simulation after a certain time to reduce CPU usage
    setTimeout(() => {
      simulation.stop();
    }, 5000);
    
    return () => {
      simulation.stop();
    };
  }, [entities, isVisible, dimensions, onEntitySelect]);

  return (
    <div className="w-full h-full min-h-[300px] relative glass rounded-lg overflow-hidden">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="knowledge-graph"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }}
      />
    </div>
  );
};

export default KnowledgeGraph;
