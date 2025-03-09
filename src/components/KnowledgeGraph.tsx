import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HistoricalEntity, getEntityConnections, mockHistoricalData } from '@/utils/mockData';
import { useAnimateOnMount } from '@/utils/animations';
import VisualizationPlaceholder from './VisualizationPlaceholder';

interface KnowledgeGraphProps {
  entities?: HistoricalEntity[];
  onEntitySelect?: (entity: HistoricalEntity) => void;
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ 
  entities = [], 
  onEntitySelect 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const isVisible = useAnimateOnMount(500);
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });
  const hasData = entities && entities.length > 0;

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

  // Only create and update visualization if we have data
  useEffect(() => {
    if (!svgRef.current || !isVisible || !hasData) return;
    
    // ... keep existing code (visualization creation with D3) but with the following enhancements:
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    // Set up the SVG
    const { width, height } = dimensions;
    
    // Create defs for patterns and filters
    const defs = svg.append("defs");
    
    // Add glow filter
    const glowFilter = defs.append("filter")
      .attr("id", "entity-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
      
    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "blur");
      
    glowFilter.append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");
    
    // Add patterns for different entity types
    const patternTypes = [
      { id: "pattern-person", color: "hsl(280, 70%, 50%)" },
      { id: "pattern-event", color: "hsl(200, 70%, 50%)" },
      { id: "pattern-place", color: "hsl(100, 70%, 50%)" },
      { id: "pattern-concept", color: "hsl(50, 70%, 50%)" }
    ];
    
    patternTypes.forEach(pattern => {
      // Create pattern
      const pat = defs.append("pattern")
        .attr("id", pattern.id)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 10)
        .attr("height", 10)
        .attr("patternTransform", "rotate(45)");
        
      pat.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", pattern.color)
        .attr("opacity", 0.2);
        
      pat.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", 10)
        .attr("stroke", pattern.color)
        .attr("stroke-width", 1);
    });
    
    // Create background pattern
    const bgPattern = defs.append("pattern")
      .attr("id", "bg-pattern")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 50)
      .attr("height", 50);
      
    bgPattern.append("rect")
      .attr("width", 50)
      .attr("height", 50)
      .attr("fill", "#121220");
      
    bgPattern.append("circle")
      .attr("cx", 25)
      .attr("cy", 25)
      .attr("r", 1)
      .attr("fill", "#ffffff")
      .attr("opacity", 0.3);
    
    // Add background 
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#bg-pattern)")
      .attr("opacity", 0.2);
    
    // Prepare data
    const nodes = entities.map(entity => ({ ...entity }));
    
    // Get all connections with valid source and target from relations
    const getValidLinks = () => {
      const validLinks = [];
      
      for (const entity of entities) {
        if (entity.relations && Array.isArray(entity.relations)) {
          for (const relation of entity.relations) {
            const targetEntity = entities.find(e => e.id === relation.targetId);
            if (targetEntity) {
              validLinks.push({
                source: entity.id,
                target: targetEntity.id,
                type: relation.type || 'default',
                strength: relation.strength || 1
              });
            }
          }
        }
      }
      
      return validLinks;
    };
    
    const validLinks = getValidLinks();
    
    // Skip rendering if no valid links
    if (validLinks.length === 0) {
      renderGridLayout(svg, nodes, width, height, onEntitySelect);
      return;
    }
    
    // Create D3 compatible links (using entity indices)
    const indexedLinks = validLinks.map(link => ({
      ...link,
      source: nodes.findIndex(node => node.id === link.source),
      target: nodes.findIndex(node => node.id === link.target)
    }));
    
    // Create forces
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(indexedLinks).id((d: any, i) => i))
      .force("charge", d3.forceManyBody().strength(d => (d as any).significance ? (d as any).significance * -250 : -300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => ((d as any).significance || 1) * 8 + 20));
    
    // Create link groups
    const linkGroups = svg.append("g")
      .attr("class", "links")
      .selectAll("g")
      .data(indexedLinks)
      .enter()
      .append("g")
      .attr("class", d => `link-group link-type-${d.type}`);
    
    // Create links with different visual styling based on type
    linkGroups.each(function(d) {
      const linkElem = d3.select(this);
      
      // Base link
      linkElem.append("path")
        .attr("class", "link-path")
        .attr("stroke", d => {
          switch(d.type) {
            case "causal": return "rgba(255, 100, 100, 0.4)";
            case "correlative": return "rgba(100, 100, 255, 0.4)";
            case "conflicting": return "rgba(255, 200, 0, 0.4)";
            case "evolutionary": return "rgba(100, 255, 100, 0.4)";
            default: return "rgba(200, 200, 200, 0.3)";
          }
        })
        .attr("stroke-width", d => Math.max(1, d.strength)) 
        .attr("fill", "none")
        .attr("stroke-dasharray", d => {
          switch(d.type) {
            case "correlative": return "5,5";
            case "conflicting": return "2,2";
            case "evolutionary": return "10,5";
            default: return null;
          }
        })
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .delay((_, i) => i * 10)
        .attr("opacity", 0.8);
      
      // Add directional flow for causal relationships
      if (d.type === "causal" || d.type === "evolutionary") {
        linkElem.append("circle")
          .attr("r", 2)
          .attr("fill", "white")
          .attr("opacity", 0)
          .attr("class", "flow-particle")
          .transition()
          .duration(500)
          .delay(1000)
          .attr("opacity", 0.8);
      }
    });
    
    // Create node groups
    const nodeGroups = svg.append("g")
      .attr("class", "nodes")
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", d => `node node-type-${d.type}`)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (onEntitySelect) {
          onEntitySelect(d);
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
    
    // Add contextual membranes
    nodeGroups.append("circle")
      .attr("class", "contextual-membrane")
      .attr("r", d => ((d.significance || 1) * 8 + 25))
      .attr("fill", d => {
        switch (d.type) {
          case "person": return "hsla(280, 70%, 40%, 0.1)";
          case "event": return "hsla(200, 70%, 40%, 0.1)";
          case "place": return "hsla(100, 70%, 40%, 0.1)";
          case "concept": return "hsla(50, 70%, 40%, 0.1)";
          default: return "hsla(240, 70%, 40%, 0.1)";
        }
      })
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .delay((_, i) => i * 100)
      .attr("opacity", 1);
    
    // Add attribute rings for significant entities
    nodeGroups.filter(d => (d.significance || 0) > 5)
      .append("circle")
      .attr("class", "attribute-ring")
      .attr("r", d => ((d.significance || 1) * 8 + 15))
      .attr("fill", "none")
      .attr("stroke", d => {
        switch (d.type) {
          case "person": return "hsla(280, 70%, 50%, 0.3)";
          case "event": return "hsla(200, 70%, 50%, 0.3)";
          case "place": return "hsla(100, 70%, 50%, 0.3)";
          case "concept": return "hsla(50, 70%, 50%, 0.3)";
          default: return "hsla(240, 70%, 50%, 0.3)";
        }
      })
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", d => {
        // Create segments based on the entity's domains of influence
        const domains = d.domains || ["political", "cultural", "scientific"];
        const circumference = 2 * Math.PI * ((d.significance || 1) * 8 + 15);
        const segmentLength = circumference / domains.length;
        return `${segmentLength * 0.7},${segmentLength * 0.3}`;
      })
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .delay((_, i) => i * 100 + 300)
      .attr("opacity", 1);
    
    // Add identity cores
    nodeGroups.append("circle")
      .attr("class", "identity-core")
      .attr("r", d => (d.significance || 1) * 8)
      .attr("fill", d => {
        switch (d.type) {
          case "person": return "url(#pattern-person)";
          case "event": return "url(#pattern-event)";
          case "place": return "url(#pattern-place)";
          case "concept": return "url(#pattern-concept)";
          default: return "hsl(240, 70%, 50%)";
        }
      })
      .attr("stroke", d => {
        switch (d.type) {
          case "person": return "hsl(280, 70%, 50%)";
          case "event": return "hsl(200, 70%, 50%)";
          case "place": return "hsl(100, 70%, 50%)";
          case "concept": return "hsl(50, 70%, 50%)";
          default: return "hsl(240, 70%, 50%)";
        }
      })
      .attr("stroke-width", 2)
      .attr("filter", "url(#entity-glow)")
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay((_, i) => i * 100 + 200)
      .attr("opacity", 0.9);
    
    // Add temporal signatures
    nodeGroups.filter(d => d.startDate && d.endDate)
      .append("path")
      .attr("class", "temporal-signature")
      .attr("d", d => {
        // Create age rings that show duration
        const radius = (d.significance || 1) * 8;
        const startAngle = 0;
        const endAngle = 2 * Math.PI;
        
        return d3.arc()({
          innerRadius: radius - 3,
          outerRadius: radius,
          startAngle,
          endAngle
        });
      })
      .attr("fill", d => {
        // Older entities get more "aged" appearance
        const startYear = new Date(d.startDate || "2000").getFullYear();
        const currentYear = new Date().getFullYear();
        const age = currentYear - startYear;
        const opacity = Math.min(0.8, Math.max(0.2, age / 1000));
        
        return `rgba(255, 200, 150, ${opacity})`;
      })
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .delay((_, i) => i * 100 + 500)
      .attr("opacity", 1);
    
    // Add labels
    nodeGroups.append("text")
      .attr("dy", d => (d.significance || 1) * 8 + 20)
      .attr("text-anchor", "middle")
      .attr("font-size", d => 10 + Math.min(3, (d.significance || 1) / 2))
      .attr("fill", "white")
      .attr("pointer-events", "none")
      .text(d => d.name)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay((_, i) => i * 100 + 400)
      .attr("opacity", 0.9);
    
    // Update positions
    simulation.on("tick", () => {
      // Update link paths
      linkGroups.selectAll(".link-path")
        .attr("d", d => {
          const sourceNode = nodes[d.source as any];
          const targetNode = nodes[d.target as any];
          
          if (!sourceNode.x || !targetNode.x) return "";
          
          // Calculate path with curve
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
          
          return d.type === "conflicting" 
            ? `M${sourceNode.x},${sourceNode.y} A${dr},${dr} 0 0,1 ${targetNode.x},${targetNode.y} A${dr * 0.8},${dr * 0.8} 0 0,0 ${sourceNode.x},${sourceNode.y}`
            : `M${sourceNode.x},${sourceNode.y} A${dr},${dr} 0 0,1 ${targetNode.x},${targetNode.y}`;
        });
      
      // Update flow particles for directional links
      linkGroups.selectAll(".flow-particle").each(function(d: any) {
        const sourceNode = nodes[d.source];
        const targetNode = nodes[d.target];
        
        if (!sourceNode.x || !targetNode.x) return;
        
        // Calculate position along path
        const offset = (Date.now() % 3000) / 3000; // Moves along path over time
        const interpolate = d3.interpolate(
          [sourceNode.x, sourceNode.y],
          [targetNode.x, targetNode.y]
        );
        const pos = interpolate(offset);
        
        d3.select(this)
          .attr("cx", pos[0])
          .attr("cy", pos[1]);
      });
      
      // Update node positions
      nodeGroups.attr("transform", d => `translate(${d.x || 0},${d.y || 0})`);
    });
    
    // Stop simulation after a certain time
    setTimeout(() => {
      simulation.stop();
    }, 5000);
    
    // Cleanup on unmount
    return () => {
      simulation.stop();
    };
  }, [entities, isVisible, dimensions, onEntitySelect]);

  // Helper function to render a grid layout when no links are available
  function renderGridLayout(svg, nodes, width, height, onEntitySelect) {
    const nodeGroup = svg.append("g")
      .attr("class", "nodes")
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", d => `node node-type-${d.type}`)
      .attr("transform", (d, i) => {
        const cols = Math.ceil(Math.sqrt(nodes.length));
        const row = Math.floor(i / cols);
        const col = i % cols;
        const xSpacing = width / (cols + 1);
        const ySpacing = height / (Math.ceil(nodes.length / cols) + 1);
        return `translate(${(col + 1) * xSpacing}, ${(row + 1) * ySpacing})`;
      })
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (onEntitySelect) {
          onEntitySelect(d);
        }
      });
    
    // Add identity cores
    nodeGroup.append("circle")
      .attr("r", d => (d.significance || 1) * 8)
      .attr("fill", d => {
        switch (d.type) {
          case "person": return "url(#pattern-person)";
          case "event": return "url(#pattern-event)";
          case "place": return "url(#pattern-place)";
          case "concept": return "url(#pattern-concept)";
          default: return "hsl(240, 70%, 50%)";
        }
      })
      .attr("stroke", d => {
        switch (d.type) {
          case "person": return "hsl(280, 70%, 50%)";
          case "event": return "hsl(200, 70%, 50%)";
          case "place": return "hsl(100, 70%, 50%)";
          case "concept": return "hsl(50, 70%, 50%)";
          default: return "hsl(240, 70%, 50%)";
        }
      })
      .attr("stroke-width", 2)
      .attr("filter", "url(#entity-glow)")
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 50)
      .duration(500)
      .attr("opacity", 0.9);
    
    // Add labels
    nodeGroup.append("text")
      .attr("dy", d => (d.significance || 1) * 8 + 20)
      .attr("text-anchor", "middle")
      .attr("font-size", d => 10 + Math.min(3, (d.significance || 1) / 2))
      .attr("fill", "white")
      .text(d => d.name)
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 50 + 300)
      .duration(500)
      .attr("opacity", 0.9);
  }

  // If no data, render placeholder
  if (!hasData) {
    return <VisualizationPlaceholder type="knowledge-graph" />;
  }

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
