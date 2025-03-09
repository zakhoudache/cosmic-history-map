import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HistoricalEntity, getEntityConnections, mockHistoricalData } from '@/utils/mockData';
import { useAnimateOnMount } from '@/utils/animations';
import { Network, Star, Focus, Lightbulb, FileSpreadsheet } from 'lucide-react';
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
        setDimensions({ width, height: Math.max(height, 450) });
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
    if (!hasData || !svgRef.current || !isVisible) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    // Set up the SVG
    const { width, height } = dimensions;
    
    // Add a radial gradient for the background
    const defs = svg.append("defs");
    
    // Add radial gradient for background
    const bgGradient = defs.append("radialGradient")
      .attr("id", "graph-background")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
      
    bgGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "hsl(260, 40%, 15%)")
      .attr("stop-opacity", 1);
      
    bgGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "hsl(240, 30%, 10%)")
      .attr("stop-opacity", 1);
    
    // Add background rect
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#graph-background)");
    
    // Add decorative grid
    const gridSize = 30;
    const gridOpacity = 0.15;
    
    // Horizontal lines
    for (let y = 0; y < height; y += gridSize) {
      svg.append("line")
        .attr("x1", 0)
        .attr("y1", y)
        .attr("x2", width)
        .attr("y2", y)
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)
        .attr("opacity", gridOpacity);
    }
    
    // Vertical lines
    for (let x = 0; x < width; x += gridSize) {
      svg.append("line")
        .attr("x1", x)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", height)
        .attr("stroke", "white")
        .attr("stroke-width", 0.5)
        .attr("opacity", gridOpacity);
    }
    
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
                type: relation.type || 'connected to',
                strength: relation.strength || 1
              });
            }
          }
        }
      }
      
      return validLinks;
    };
    
    // Get valid links
    const validLinks = getValidLinks();
    
    // Skip rendering if no valid links, and display a grid layout instead
    if (validLinks.length === 0) {
      // Render nodes without links in a grid layout
      const nodeGroup = svg.append("g")
        .attr("class", "nodes")
        .selectAll(".node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
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

      // Add glowing orb effect
      nodeGroup.append("circle")
        .attr("r", d => (d.significance || 5) * 2 + 15)
        .attr("fill", "rgba(255, 255, 255, 0.03)")
        .attr("filter", "url(#glow)");
      
      // Add node icons based on entity type
      nodeGroup.append("g")
        .attr("class", "node-icon")
        .attr("transform", "translate(-10, -10)")
        .html(d => {
          const size = 20;
          const color = nodeColorByGroup(d);
          
          switch (d.type) {
            case "person":
              return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
                <circle cx="12" cy="8" r="5"/>
                <path d="M20 21a8 8 0 0 0-16 0"/>
              </svg>`;
            case "event":
              return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 10h18"/>
                <path d="M16 2v2"/>
                <path d="M8 2v2"/>
              </svg>`;
            case "place":
              return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>`;
            case "concept":
              return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
                <path d="M12 2a8 8 0 0 0-8 8c0 2.2.7 4.3 2 6l6 6 6-6c1.3-1.7 2-3.8 2-6a8 8 0 0 0-8-8Z"/>
              </svg>`;
            default:
              return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="m15 9-6 6"/>
                <path d="m9 9 6 6"/>
              </svg>`;
          }
        });
      
      // Add node backgrounds
      nodeGroup.append("circle")
        .attr("r", d => (d.significance || 5) * 1.2 + 10)
        .attr("fill", d => nodeColorByGroup(d))
        .attr("opacity", 0.2)
        .attr("stroke", d => nodeColorByGroup(d))
        .attr("stroke-width", 1)
        .attr("opacity", 0)
        .transition()
        .delay((_, i) => i * 50)
        .duration(500)
        .attr("opacity", 0.8);
      
      // Add labels
      nodeGroup.append("text")
        .text(d => d.name)
        .attr("dx", 0)
        .attr("dy", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .attr("fill", "white")
        .attr("opacity", 0)
        .transition()
        .delay((_, i) => i * 50 + 300)
        .duration(500)
        .attr("opacity", 0.9);
      
      return;
    }
    
    // Create filter for glowing effect
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "5")
      .attr("result", "blur");
      
    filter.append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");

    // Create gradients for links
    validLinks.forEach((link, i) => {
      const linkGradient = defs.append("linearGradient")
        .attr("id", `link-gradient-${i}`)
        .attr("gradientUnits", "userSpaceOnUse");
      
      const sourceEntity = entities.find(e => e.id === link.source);
      const targetEntity = entities.find(e => e.id === link.target);
      
      if (sourceEntity && targetEntity) {
        const sourceColor = nodeColorByGroup(sourceEntity);
        const targetColor = nodeColorByGroup(targetEntity);
        
        linkGradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", sourceColor);
          
        linkGradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", targetColor);
      }
    });
    
    // Create D3 compatible links (using entity indices)
    const indexedLinks = validLinks.map(link => ({
      ...link,
      source: nodes.findIndex(node => node.id === link.source),
      target: nodes.findIndex(node => node.id === link.target)
    }));
    
    // Create forces
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(indexedLinks).id((d, i) => i))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));
    
    // Create links
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("g")
      .data(indexedLinks)
      .enter()
      .append("g");
    
    // Add link paths with gradients
    link.append("path")
      .attr("class", "link-path")
      .attr("stroke", (d, i) => `url(#link-gradient-${i})`)
      .attr("stroke-width", d => Math.max(1, d.strength * 2))
      .attr("fill", "none")
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 30)
      .duration(800)
      .attr("opacity", 0.7);
    
    // Add link labels
    link.append("text")
      .attr("class", "link-label")
      .attr("dy", -5)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", 9)
      .attr("opacity", 0)
      .text(d => d.type)
      .transition()
      .delay((_, i) => i * 30 + 400)
      .duration(800)
      .attr("opacity", 0.7);
    
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
    
    // Add glowing orb effect
    node.append("circle")
      .attr("r", d => (d.significance || 5) * 2 + 15)
      .attr("fill", "rgba(255, 255, 255, 0.05)")
      .attr("filter", "url(#glow)");
    
    // Add node backgrounds
    node.append("circle")
      .attr("r", d => (d.significance || 5) * 1.2 + 15)
      .attr("fill", d => nodeColorByGroup(d))
      .attr("opacity", 0.2)
      .attr("stroke", d => nodeColorByGroup(d))
      .attr("stroke-width", 1)
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 50)
      .duration(500)
      .attr("opacity", 0.8);
    
    // Add node icons based on entity type
    node.append("g")
      .attr("class", "node-icon")
      .attr("transform", "translate(-10, -10)")
      .html(d => {
        const size = 20;
        const color = nodeColorByGroup(d);
        
        switch (d.type) {
          case "person":
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
              <circle cx="12" cy="8" r="5"/>
              <path d="M20 21a8 8 0 0 0-16 0"/>
            </svg>`;
          case "event":
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 10h18"/>
              <path d="M16 2v2"/>
              <path d="M8 2v2"/>
            </svg>`;
          case "place":
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>`;
          case "concept":
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
              <path d="M12 2a8 8 0 0 0-8 8c0 2.2.7 4.3 2 6l6 6 6-6c1.3-1.7 2-3.8 2-6a8 8 0 0 0-8-8Z"/>
            </svg>`;
          default:
            return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="m15 9-6 6"/>
              <path d="m9 9 6 6"/>
            </svg>`;
        }
      });
    
    // Add labels
    node.append("text")
      .text(d => d.name)
      .attr("dy", 30)
      .attr("text-anchor", "middle")
      .attr("font-size", d => 10 + (d.significance || 5) / 3)
      .attr("fill", "white")
      .attr("pointer-events", "none")
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 50 + 300)
      .duration(500)
      .attr("opacity", 0.9);
    
    // Add connection strength indicators
    node.append("circle")
      .attr("r", d => {
        // Calculate connections count
        let connectionCount = 0;
        validLinks.forEach(link => {
          if (link.source === d.id || link.target === d.id) {
            connectionCount++;
          }
        });
        return 3 + connectionCount;
      })
      .attr("fill", "white")
      .attr("opacity", 0.3)
      .attr("stroke", "white")
      .attr("stroke-width", 0.5);
    
    // Update positions on each simulation tick
    simulation.on("tick", () => {
      // Update link paths
      link.selectAll("path")
        .attr("d", d => {
          const sourceX = (d.source as any).x;
          const sourceY = (d.source as any).y;
          const targetX = (d.target as any).x;
          const targetY = (d.target as any).y;
          
          // Calculate path with slight curve
          const dx = targetX - sourceX;
          const dy = targetY - sourceY;
          const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
          
          // Arc path
          return `M${sourceX},${sourceY}A${dr},${dr} 0 0,1 ${targetX},${targetY}`;
        });
      
      // Update link labels
      link.selectAll("text")
        .attr("transform", d => {
          const sourceX = (d.source as any).x;
          const sourceY = (d.source as any).y;
          const targetX = (d.target as any).x;
          const targetY = (d.target as any).y;
          
          // Position text at midpoint with slight offset
          const midX = (sourceX + targetX) / 2;
          const midY = (sourceY + targetY) / 2 - 10;
          
          return `translate(${midX}, ${midY})`;
        });
      
      // Update node positions
      node.attr("transform", d => `translate(${d.x}, ${d.y})`);
    });
    
    // Add legend
    const legendData = [
      { type: "person", label: "Person", icon: "user", color: "hsl(280, 80%, 60%)" },
      { type: "event", label: "Event", icon: "calendar", color: "hsl(200, 70%, 50%)" },
      { type: "place", label: "Place", icon: "map-pin", color: "hsl(150, 70%, 50%)" },
      { type: "concept", label: "Concept", icon: "lightbulb", color: "hsl(320, 70%, 50%)" }
    ];
    
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(20, ${height - 110})`);
    
    legend.append("rect")
      .attr("width", 150)
      .attr("height", 110)
      .attr("fill", "rgba(0, 0, 0, 0.5)")
      .attr("rx", 5);
    
    legend.append("text")
      .text("Legend")
      .attr("x", 10)
      .attr("y", 20)
      .attr("fill", "white")
      .attr("font-weight", "bold");
    
    const legendItems = legend.selectAll(".legend-item")
      .data(legendData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(10, ${35 + i * 20})`);
    
    legendItems.append("circle")
      .attr("r", 6)
      .attr("fill", d => d.color);
    
    legendItems.append("text")
      .text(d => d.label)
      .attr("x", 15)
      .attr("y", 4)
      .attr("fill", "white")
      .attr("font-size", 12);
    
    // Stop simulation after a certain time to reduce CPU usage
    setTimeout(() => {
      simulation.stop();
    }, 5000);
    
    return () => {
      simulation.stop();
    };
  }, [entities, isVisible, dimensions, onEntitySelect]);
  
  // Helper function to get node color by group
  const nodeColorByGroup = (entity: HistoricalEntity) => {
    switch (entity.group) {
      case "cultural": return "hsl(300, 90%, 60%)";
      case "art": return "hsl(340, 90%, 60%)";
      case "politics": return "hsl(200, 90%, 60%)";
      case "technology": return "hsl(160, 90%, 60%)";
      case "geography": return "hsl(120, 90%, 60%)";
      case "philosophy": return "hsl(40, 90%, 70%)";
      case "history": return "hsl(20, 90%, 60%)";
      case "science": return "hsl(180, 90%, 60%)";
      case "religion": return "hsl(270, 90%, 60%)";
      case "military": return "hsl(350, 90%, 50%)";
      case "economics": return "hsl(80, 90%, 60%)";
      default: return "hsl(240, 90%, 60%)";
    }
  };

  if (!hasData) {
    return (
      <VisualizationPlaceholder 
        title="Knowledge Graph"
        description="Discover complex interconnections between historical entities with the Knowledge Graph visualization."
      />
    );
  }

  return (
    <div className="w-full h-full min-h-[500px] relative overflow-hidden rounded-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-cosmic-dark/30 to-cosmic/10 z-0"></div>
      <div className="absolute top-0 left-0 w-full p-4 flex items-center space-x-2 z-10">
        <Network className="h-5 w-5 text-cosmic-accent" />
        <h3 className="text-lg font-semibold text-white">Knowledge Network</h3>
      </div>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="knowledge-graph z-0"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }}
      />
    </div>
  );
};

export default KnowledgeGraph;
