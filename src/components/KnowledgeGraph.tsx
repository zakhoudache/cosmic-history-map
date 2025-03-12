
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { FormattedHistoricalEntity } from "@/types/supabase";
import { SimulationNodeDatum } from 'd3';
import { toast } from "sonner";

// Custom node type for the simulation
interface CustomNode extends SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
  color: string;
  radius: number;
  group?: string;
  significance?: number;
  startDate?: string;
  endDate?: string;
  category?: string;
}

// Custom link type for the simulation
interface CustomLink {
  source: string | CustomNode;
  target: string | CustomNode;
  type: string;
  strength: number;
}

// Main component props
interface KnowledgeGraphProps {
  entities: FormattedHistoricalEntity[];
  onEntitySelect?: (entity: FormattedHistoricalEntity) => void;
  height?: number;
  width?: number;
  isInteractive?: boolean;
}

// Helper function to get a color based on entity type
const getEntityColor = (type: string): string => {
  const colors: Record<string, string> = {
    "person": "#4299E1", // Blue
    "event": "#F56565", // Red
    "location": "#48BB78", // Green
    "organization": "#9F7AEA", // Purple
    "concept": "#ED8936", // Orange
    "object": "#667EEA", // Indigo
    "document": "#F687B3", // Pink
    "time_period": "#D69E2E", // Yellow
    "culture": "#805AD5", // Purple
    "discovery": "#38B2AC", // Teal
    "technology": "#34D399", // Emerald
    "conflict": "#EF4444", // Red
    "agreement": "#3B82F6", // Blue
    "movement": "#EC4899", // Pink
    "artifact": "#10B981", // Green
    "work": "#8B5CF6", // Violet
    "law": "#6366F1", // Indigo
    "subject_area": "#F59E0B", // Amber
    "dynasty": "#7C3AED", // Violet
  };
  
  return colors[type.toLowerCase()] || "#A0AEC0"; // Default to gray
};

// Component definition
const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ 
  entities, 
  onEntitySelect, 
  height = 600, 
  width = 800,
  isInteractive = true,
}) => {
  const d3Container = useRef<HTMLDivElement>(null);
  const [selectedEntity, setSelectedEntity] = useState<FormattedHistoricalEntity | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Process entities into nodes and links for the graph
  const processGraphData = () => {
    if (!entities || entities.length === 0) return { nodes: [], links: [] };
    
    const nodeMap = new Map<string, CustomNode>();
    const links: CustomLink[] = [];
    
    // Create nodes from entities
    entities.forEach(entity => {
      nodeMap.set(entity.id, {
        id: entity.id,
        name: entity.name || "Unknown",
        type: entity.type || "unknown",
        color: getEntityColor(entity.type || "unknown"),
        radius: entity.importance ? 5 + (entity.importance * 3) : 8,
        startDate: entity.startDate,
        endDate: entity.endDate,
        category: entity.category,
        significance: entity.significance,
      });
      
      // Create links from entity relationships
      if (entity.relations && entity.relations.length > 0) {
        entity.relations.forEach(relation => {
          // Only add links to entities that exist in our data
          if (entities.some(e => e.id === relation.targetId)) {
            links.push({
              source: entity.id,
              target: relation.targetId,
              type: relation.type || "related",
              strength: relation.strength || 1,
            });
          }
        });
      }
    });
    
    return {
      nodes: Array.from(nodeMap.values()),
      links,
    };
  };
  
  // Render the graph
  useEffect(() => {
    if (!d3Container.current || !entities || entities.length === 0) return;
    
    // Clear previous graph
    d3.select(d3Container.current).selectAll("*").remove();
    
    const { nodes, links } = processGraphData();
    
    if (nodes.length === 0) return;
    
    // Calculate responsive dimensions
    const containerWidth = d3Container.current.clientWidth;
    const containerHeight = height;
    const actualWidth = Math.min(containerWidth, width);
    
    // Create SVG container
    const svg = d3.select(d3Container.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", containerHeight)
      .attr("viewBox", `0 0 ${actualWidth} ${containerHeight}`)
      .append("g");
    
    // Add zoom functionality
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        svg.attr("transform", event.transform);
      });
    
    d3.select(d3Container.current).select("svg")
      .call(zoom as any);
    
    // Create tooltip
    if (!tooltipRef.current) {
      const tooltipDiv = document.createElement("div");
      tooltipDiv.className = "absolute hidden px-2 py-1 text-sm bg-black/80 text-white rounded shadow-lg z-50 pointer-events-none";
      d3Container.current.appendChild(tooltipDiv);
      tooltipRef.current = tooltipDiv;
    }
    
    // Create simulation
    const simulation = d3.forceSimulation<CustomNode, CustomLink>(nodes)
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(actualWidth / 2, containerHeight / 2))
      .force("link", d3.forceLink<CustomNode, CustomLink>(links)
        .id(d => d.id)
        .distance(d => 100 - Math.min(d.strength * 20, 70))
      )
      .force("collide", d3.forceCollide().radius(d => d.radius + 5));
    
    // Create links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.max(1, d.strength));
    
    // Create nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", d => d.radius)
      .attr("fill", d => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer");
    
    // Add node labels
    const labels = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text(d => d.name)
      .attr("font-size", "10px")
      .attr("dx", d => d.radius + 5)
      .attr("dy", 4)
      .style("pointer-events", "none");
    
    // Add interactivity if enabled
    if (isInteractive) {
      // Node dragging
      node.call(d3.drag<SVGCircleElement, CustomNode>()
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
        }) as any
      );
      
      // Hover effects
      node.on("mouseover", (event, d) => {
        const tooltip = tooltipRef.current;
        if (!tooltip) return;
        
        // Find the original entity for more details
        const entity = entities.find(e => e.id === d.id);
        
        // Create tooltip content
        let content = `<div class="font-bold">${d.name}</div>`;
        content += `<div class="text-xs">${d.type}</div>`;
        
        if (entity?.startDate || entity?.endDate) {
          content += `<div class="text-xs">${entity.startDate || ''} ${entity.endDate ? `- ${entity.endDate}` : ''}</div>`;
        }
        
        tooltip.innerHTML = content;
        tooltip.style.display = "block";
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;
        
        // Highlight connected nodes
        const connectedNodeIds = new Set<string>();
        connectedNodeIds.add(d.id);
        
        links.forEach(link => {
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
          const targetId = typeof link.target === 'string' ? link.target : link.target.id;
          
          if (sourceId === d.id) connectedNodeIds.add(targetId);
          if (targetId === d.id) connectedNodeIds.add(sourceId);
        });
        
        node.attr("opacity", node => connectedNodeIds.has(node.id) ? 1 : 0.2);
        labels.attr("opacity", label => connectedNodeIds.has(label.id) ? 1 : 0.2);
        link.attr("stroke-opacity", link => {
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
          const targetId = typeof link.target === 'string' ? link.target : link.target.id;
          return (sourceId === d.id || targetId === d.id) ? 1 : 0.1;
        });
      })
      .on("mouseout", () => {
        const tooltip = tooltipRef.current;
        if (tooltip) tooltip.style.display = "none";
        
        node.attr("opacity", 1);
        labels.attr("opacity", 1);
        link.attr("stroke-opacity", 0.6);
      })
      .on("click", (event, d) => {
        // Find the original entity with full data
        const entity = entities.find(e => e.id === d.id);
        if (entity && onEntitySelect) {
          setSelectedEntity(entity);
          onEntitySelect(entity);
        }
      });
    }
    
    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => typeof d.source === 'string' ? 0 : (d.source as CustomNode).x || 0)
        .attr("y1", d => typeof d.source === 'string' ? 0 : (d.source as CustomNode).y || 0)
        .attr("x2", d => typeof d.target === 'string' ? 0 : (d.target as CustomNode).x || 0)
        .attr("y2", d => typeof d.target === 'string' ? 0 : (d.target as CustomNode).y || 0);
      
      node
        .attr("cx", d => d.x || 0)
        .attr("cy", d => d.y || 0);
      
      labels
        .attr("x", d => d.x || 0)
        .attr("y", d => d.y || 0);
    });
    
    // Helper function for screenshots (can be used with html2canvas)
    (window as any).takeKnowledgeGraphScreenshot = () => {
      try {
        const svgNode = d3Container.current?.querySelector('svg');
        if (svgNode) {
          const serializer = new XMLSerializer();
          let source = serializer.serializeToString(svgNode);
          source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
          const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
          const link = document.createElement("a");
          link.download = "knowledge-graph.svg";
          link.href = url;
          link.click();
          toast.success("Graph downloaded as SVG");
        }
      } catch (error) {
        console.error("Error saving graph:", error);
        toast.error("Failed to download graph");
      }
    };
    
    return () => {
      simulation.stop();
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
    };
  }, [entities, height, width, isInteractive, onEntitySelect]);
  
  return (
    <div className="w-full h-full relative">
      <div ref={d3Container} className="w-full h-full" />
    </div>
  );
};

export default KnowledgeGraph;
