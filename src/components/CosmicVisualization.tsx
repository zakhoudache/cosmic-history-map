
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HistoricalEntity, prepareSimulationData } from '@/utils/mockData';
import { useAnimateOnMount } from '@/utils/animations';
import VisualizationPlaceholder from './VisualizationPlaceholder';
import { ZoomIn, ZoomOut, Maximize, Minimize, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface CosmicVisualizationProps {
  entities?: HistoricalEntity[];
  onEntitySelect?: (entity: HistoricalEntity) => void;
  visualizationType?: "graph" | "timeline"; // Add this prop
}

const CosmicVisualization: React.FC<CosmicVisualizationProps> = ({ 
  entities,
  onEntitySelect,
  visualizationType = "graph" // Default to graph view
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const visualizationData = entities && entities.length > 0 ? entities : [];
  const isVisible = useAnimateOnMount(300);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const hasData = entities && entities.length > 0;
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform | null>(null);
  
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
  
  // Initialize zoom behavior
  useEffect(() => {
    if (!svgRef.current || !hasData) return;
    
    const svg = d3.select(svgRef.current);
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 3]) // Zoom scale limits (min, max)
      .on("zoom", (event) => {
        const { transform } = event;
        setZoomTransform(transform);
        setZoomLevel(transform.k);
        
        // Apply zoom to the main container
        svg.select("g.visualization-container")
          .attr("transform", transform.toString());
      });
    
    svg.call(zoomBehavior);
    
    // Reset zoom on double-click
    svg.on("dblclick.zoom", () => {
      svg.transition()
        .duration(750)
        .call(zoomBehavior.transform, d3.zoomIdentity);
      setZoomLevel(1);
    });
    
    return () => {
      // Cleanup
      svg.on(".zoom", null);
    };
  }, [hasData, dimensions]);
  
  // Handle manual zoom controls
  const handleZoomIn = () => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 3]);
    
    const currentTransform = zoomTransform || d3.zoomIdentity;
    const newScale = Math.min(currentTransform.k * 1.3, 3);
    
    svg.transition()
      .duration(300)
      .call(
        zoomBehavior.transform,
        currentTransform.scale(newScale / currentTransform.k)
      );
      
    setZoomLevel(newScale);
  };
  
  const handleZoomOut = () => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 3]);
    
    const currentTransform = zoomTransform || d3.zoomIdentity;
    const newScale = Math.max(currentTransform.k * 0.7, 0.25);
    
    svg.transition()
      .duration(300)
      .call(
        zoomBehavior.transform,
        currentTransform.scale(newScale / currentTransform.k)
      );
      
    setZoomLevel(newScale);
  };
  
  const handleZoomReset = () => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>();
    
    svg.transition()
      .duration(500)
      .call(zoomBehavior.transform, d3.zoomIdentity);
      
    setZoomLevel(1);
  };
  
  // Create visualization function that we can reuse for both main and fullscreen view
  const createVisualization = (svgElement: SVGSVGElement | null, width: number, height: number) => {
    if (!svgElement || !hasData) return;
    
    // Clear the SVG
    const svg = d3.select(svgElement);
    svg.selectAll("*").remove();
    
    // Create main container for zoom transformations
    const container = svg.append("g")
      .attr("class", "visualization-container");
    
    // Set up the SVG
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create a background
    const defs = container.append("defs");
    
    // Add a radial gradient for the background
    const gradient = defs.append("radialGradient")
      .attr("id", `cosmic-background-${isFullScreen ? 'fullscreen' : 'main'}`)
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
      .attr("id", `cosmic-glow-${isFullScreen ? 'fullscreen' : 'main'}`)
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
    
    // Create custom symbols for different entity types
    
    // Person - Stylized star with halo
    defs.append("symbol")
      .attr("id", `cosmic-person-${isFullScreen ? 'fullscreen' : 'main'}`)
      .attr("viewBox", "0 0 100 100")
      .html(`
        <circle cx="50" cy="50" r="40" fill="url(#person-gradient-${isFullScreen ? 'fullscreen' : 'main'})" />
        <circle cx="50" cy="50" r="35" fill="hsla(280, 90%, 60%, 0.8)" />
        <path d="M50,15 L52,44 L82,44 L58,62 L67,89 L50,73 L33,89 L42,62 L18,44 L48,44 Z" fill="white" opacity="0.6" />
      `);
    
    // Event - Cosmic explosion
    defs.append("symbol")
      .attr("id", `cosmic-event-${isFullScreen ? 'fullscreen' : 'main'}`)
      .attr("viewBox", "0 0 100 100")
      .html(`
        <circle cx="50" cy="50" r="30" fill="hsla(220, 90%, 60%, 0.8)" />
        <g opacity="0.7">
          ${Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const length = 20 + Math.random() * 20;
            const x2 = 50 + Math.cos(angle) * length;
            const y2 = 50 + Math.sin(angle) * length;
            return `<line x1="50" y1="50" x2="${x2}" y2="${y2}" stroke="white" stroke-width="2" />`;
          }).join('')}
        </g>
        <circle cx="50" cy="50" r="15" fill="white" opacity="0.6" />
      `);
    
    // Place - Planetary ring system
    defs.append("symbol")
      .attr("id", `cosmic-place-${isFullScreen ? 'fullscreen' : 'main'}`)
      .attr("viewBox", "0 0 100 100")
      .html(`
        <circle cx="50" cy="50" r="30" fill="hsla(180, 90%, 60%, 0.8)" />
        <ellipse cx="50" cy="50" rx="45" ry="15" fill="none" stroke="hsla(180, 90%, 80%, 0.6)" stroke-width="2" />
        <ellipse cx="50" cy="50" rx="40" ry="12" fill="none" stroke="hsla(180, 90%, 80%, 0.4)" stroke-width="1.5" />
        <ellipse cx="50" cy="50" rx="35" ry="9" fill="none" stroke="hsla(180, 90%, 80%, 0.3)" stroke-width="1" />
        <circle cx="50" cy="50" r="20" fill="hsla(180, 90%, 70%, 0.8)" />
      `);
    
    // Concept - Cosmic nebula
    defs.append("symbol")
      .attr("id", `cosmic-concept-${isFullScreen ? 'fullscreen' : 'main'}`)
      .attr("viewBox", "0 0 100 100")
      .html(`
        <radialGradient id="concept-gradient-${isFullScreen ? 'fullscreen' : 'main'}" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stop-color="hsla(320, 90%, 70%, 0.9)" />
          <stop offset="70%" stop-color="hsla(320, 90%, 50%, 0.7)" />
          <stop offset="100%" stop-color="hsla(320, 90%, 30%, 0.5)" />
        </radialGradient>
        <g opacity="0.9">
          <path d="M50,10 C75,15 85,40 80,65 C75,85 40,85 25,70 C10,55 15,25 35,15 C40,12 45,10 50,10 Z" fill="url(#concept-gradient-${isFullScreen ? 'fullscreen' : 'main'})" />
          ${Array.from({ length: 15 }).map(() => {
            const x = 20 + Math.random() * 60;
            const y = 20 + Math.random() * 60;
            const r = 1 + Math.random() * 2;
            return `<circle cx="${x}" cy="${y}" r="${r}" fill="white" opacity="${0.3 + Math.random() * 0.7}" />`;
          }).join('')}
        </g>
      `);
    
    // Create animated connection marker for edges
    defs.append("marker")
      .attr("id", `connection-arrow-${isFullScreen ? 'fullscreen' : 'main'}`)
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 5)
      .attr("refY", 5)
      .attr("markerWidth", 4)
      .attr("markerHeight", 4)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "rgba(255, 255, 255, 0.6)");
    
    // Add gradients for entity types
    defs.append("radialGradient")
      .attr("id", `person-gradient-${isFullScreen ? 'fullscreen' : 'main'}`)
      .html(`
        <stop offset="0%" stop-color="hsla(280, 90%, 80%, 1)" />
        <stop offset="100%" stop-color="hsla(280, 90%, 40%, 0.5)" />
      `);
    
    // Add the background
    container.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", Math.min(width, height) * 0.4)
      .attr("fill", `url(#cosmic-background-${isFullScreen ? 'fullscreen' : 'main'})`)
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
    
    const stars = container.selectAll(".star")
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
      
      container.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", size)
        .attr("fill", `hsla(${hue}, 70%, 50%, 0.05)`)
        .attr("filter", `url(#cosmic-glow-${isFullScreen ? 'fullscreen' : 'main'})`)
        .attr("class", "animate-pulse-subtle")
        .style("animation-duration", `${5 + Math.random() * 5}s`)
        .style("animation-delay", `${Math.random() * 2}s`);
    }
    
    // Set up force simulation with SimulationNode typed data
    const typedData = prepareSimulationData(visualizationData);
    
    const simulation = d3.forceSimulation(typedData)
      .force("center", d3.forceCenter(centerX, centerY))
      .force("charge", d3.forceManyBody().strength(d => d.significance ? d.significance * -50 : -150))
      .force("collision", d3.forceCollide().radius(d => {
        return (d.significance || 5) * 5 + 20;
      }))
      .force("x", d3.forceX(centerX).strength(0.05))
      .force("y", d3.forceY(centerY).strength(0.05));
    
    // Extract entity connections
    const getEntityConnections = (entity: HistoricalEntity) => {
      if (entity.relations && Array.isArray(entity.relations)) {
        return entity.relations
          .map(relation => {
            // Fix: Use targetId consistently (the property used in backend responses)
            const targetId = relation.targetId;
            const target = visualizationData.find(e => e.id === targetId);
            if (target) {
              return { source: entity, target, type: relation.type || "default", strength: relation.strength || 1 };
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
    
    // Create entity links group
    const linkGroup = container.append("g")
      .attr("class", "links");
    
    // Create cosmic link paths with animated flows
    allLinks.forEach((link: any, i) => {
      const linkId = `link-${link.source.id}-${link.target.id}-${isFullScreen ? 'fullscreen' : 'main'}`;
      
      // Create a gradient for this link
      const linkGradient = defs.append("linearGradient")
        .attr("id", linkId)
        .attr("gradientUnits", "userSpaceOnUse");
        
      linkGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", () => {
          // Determine color based on source entity type
          switch(link.source.type.toLowerCase()) {
            case "person": return "rgba(200, 100, 255, 0.8)";
            case "event": return "rgba(100, 200, 255, 0.8)";
            case "place": return "rgba(100, 255, 200, 0.8)";
            case "concept": return "rgba(255, 200, 100, 0.8)";
            default: return "rgba(200, 200, 200, 0.8)";
          }
        });
        
      linkGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", () => {
          // Determine color based on target entity type
          switch(link.target.type.toLowerCase()) {
            case "person": return "rgba(200, 100, 255, 0.8)";
            case "event": return "rgba(100, 200, 255, 0.8)";
            case "place": return "rgba(100, 255, 200, 0.8)";
            case "concept": return "rgba(255, 200, 100, 0.8)";
            default: return "rgba(200, 200, 200, 0.8)";
          }
        });
      
      // Create the main path
      const path = linkGroup.append("path")
        .attr("class", "link-path")
        .attr("id", linkId)
        .attr("stroke", `url(#${linkId})`)
        .attr("stroke-width", link.strength * 1.5 || 1.5)
        .attr("fill", "none")
        .attr("opacity", 0)
        .attr("marker-end", `url(#connection-arrow-${isFullScreen ? 'fullscreen' : 'main'})`)
        .transition()
        .delay(i * 50)
        .duration(1000)
        .attr("opacity", 0.6);
      
      // Create animated particles flowing along the path
      const flowCount = Math.max(1, Math.round((link.strength || 1) * 2));
      
      for (let j = 0; j < flowCount; j++) {
        linkGroup.append("circle")
          .attr("class", "link-particle")
          .attr("r", 2)
          .attr("fill", "white")
          .attr("opacity", 0.8)
          .attr("filter", `url(#cosmic-glow-${isFullScreen ? 'fullscreen' : 'main'})`)
          .append("animateMotion")
          .attr("dur", `${6 - Math.min(4, (link.strength || 1))}s`)
          .attr("repeatCount", "indefinite")
          .attr("path", "") // Path will be set on simulation tick
          .attr("begin", `${j * 1.5}s`);
      }
    });
    
    // Create entity nodes
    const nodeGroups = container.append("g")
      .attr("class", "nodes")
      .selectAll(".node")
      .data(typedData)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (onEntitySelect && !isFullScreen) {
          onEntitySelect(d);
        }
      })
      .call(d3.drag<SVGGElement, d3.SimulationNodeDatum>()
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
        switch(d.type.toLowerCase()) {
          case "person": return "hsla(280, 90%, 60%, 0.1)";
          case "event": return "hsla(220, 90%, 60%, 0.1)";
          case "place": return "hsla(180, 90%, 60%, 0.1)";
          case "concept": return "hsla(320, 90%, 60%, 0.1)";
          default: return "hsla(240, 90%, 60%, 0.1)";
        }
      })
      .attr("filter", `url(#cosmic-glow-${isFullScreen ? 'fullscreen' : 'main'})`)
      .attr("opacity", 0)
      .transition()
      .delay((_, i) => i * 100)
      .duration(1000)
      .attr("opacity", 0.8);
    
    // Add custom entity representations based on type
    nodeGroups.each(function(d) {
      const node = d3.select(this);
      const size = (d.significance || 5) * 4 + 12;
      
      switch(d.type.toLowerCase()) {
        case "person":
          node.append("use")
            .attr("href", `#cosmic-person-${isFullScreen ? 'fullscreen' : 'main'}`)
            .attr("width", size * 2)
            .attr("height", size * 2)
            .attr("x", -size)
            .attr("y", -size)
            .attr("opacity", 0)
            .transition()
            .delay((_, i) => i * 100)
            .duration(1000)
            .attr("opacity", 0.9);
          break;
        case "event":
          node.append("use")
            .attr("href", `#cosmic-event-${isFullScreen ? 'fullscreen' : 'main'}`)
            .attr("width", size * 2)
            .attr("height", size * 2)
            .attr("x", -size)
            .attr("y", -size)
            .attr("opacity", 0)
            .transition()
            .delay((_, i) => i * 100)
            .duration(1000)
            .attr("opacity", 0.9);
          break;
        case "place":
          node.append("use")
            .attr("href", `#cosmic-place-${isFullScreen ? 'fullscreen' : 'main'}`)
            .attr("width", size * 2)
            .attr("height", size * 2)
            .attr("x", -size)
            .attr("y", -size)
            .attr("opacity", 0)
            .transition()
            .delay((_, i) => i * 100)
            .duration(1000)
            .attr("opacity", 0.9);
          break;
        case "concept":
          node.append("use")
            .attr("href", `#cosmic-concept-${isFullScreen ? 'fullscreen' : 'main'}`)
            .attr("width", size * 2)
            .attr("height", size * 2)
            .attr("x", -size)
            .attr("y", -size)
            .attr("opacity", 0)
            .transition()
            .delay((_, i) => i * 100)
            .duration(1000)
            .attr("opacity", 0.9);
          break;
        default:
          // Fallback for unknown entity types
          node.append("circle")
            .attr("class", "entity-core")
            .attr("r", (d.significance || 5) * 4 + 8)
            .attr("fill", "hsl(240, 90%, 60%)")
            .attr("stroke", "rgba(255, 255, 255, 0.5)")
            .attr("stroke-width", 1)
            .attr("opacity", 0)
            .transition()
            .delay((_, i) => i * 100)
            .duration(1000)
            .attr("opacity", 0.8);
      }
    });

    // Add ripple effect
    nodeGroups.append("circle")
      .attr("class", "entity-ripple")
      .attr("r", d => (d.significance || 5) * 4 + 8)
      .attr("fill", "none")
      .attr("stroke", d => {
        // Color based on entity type
        switch(d.type.toLowerCase()) {
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
      // Update links
      allLinks.forEach((link: any, i) => {
        if (!link.source.x || !link.target.x) return;
        
        const sourceX = link.source.x;
        const sourceY = link.source.y;
        const targetX = link.target.x;
        const targetY = link.target.y;
        
        // Calculate curved path
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
        
        // Create curved SVG path
        const path = `M${sourceX},${sourceY}A${dr},${dr} 0 0,1 ${targetX},${targetY}`;
        
        // Update link path
        linkGroup.select(`#link-${link.source.id}-${link.target.id}-${isFullScreen ? 'fullscreen' : 'main'}`)
          .attr("d", path);
          
        // Update animated particles path
        linkGroup.selectAll(`.link-particle`)
          .filter((d, j) => j === i)
          .selectAll("animateMotion")
          .attr("path", path);
      });
      
      // Update node positions
      nodeGroups.attr("transform", d => `translate(${d.x}, ${d.y})`);
    });
    
    // Return the simulation for cleanup
    return simulation;
  };
  
  // Handle fullscreen visualization rendering
  useEffect(() => {
    if (isFullScreen && fullscreenContainerRef.current) {
      const fullscreenSvg = fullscreenContainerRef.current.querySelector('svg');
      if (fullscreenSvg) {
        const rect = fullscreenContainerRef.current.getBoundingClientRect();
        const simulation = createVisualization(fullscreenSvg as SVGSVGElement, rect.width, rect.height);
        
        return () => {
          if (simulation) simulation.stop();
        };
      }
    }
  }, [isFullScreen, entities, hasData]);
  
  // Handle main view visualization rendering
  useEffect(() => {
    if (!svgRef.current || !isVisible || !hasData) return;
    
    const simulation = createVisualization(svgRef.current, dimensions.width, dimensions.height);
    
    // Cleanup simulation on component unmount or data change
    return () => {
      if (simulation) simulation.stop();
    };
  }, [dimensions, entities, hasData, isVisible]);
  
  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  
  // Download visualization as SVG
  const downloadSVG = () => {
    if (!svgRef.current) return;
    
    try {
      // Clone the SVG element to avoid modifying the original
      const svgClone = svgRef.current.cloneNode(true) as SVGElement;
      
      // Add any necessary attributes for a standalone SVG
      svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svgClone.setAttribute("version", "1.1");
      
      // Convert to string
      const svgString = new XMLSerializer().serializeToString(svgClone);
      
      // Create a blob
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = "historical-visualization.svg";
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success("Visualization downloaded as SVG");
    } catch (error) {
      console.error("Error downloading SVG:", error);
      toast.error("Failed to download visualization");
    }
  };
  
  // No data state - show placeholder
  if (!hasData && !isVisible) {
    return <VisualizationPlaceholder />;
  }
  
  return (
    <>
      <div className="relative w-full h-[600px] overflow-hidden bg-black/20 rounded-lg" ref={containerRef}>
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <ZoomIn size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <ZoomOut size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullScreen}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={downloadSVG}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <Download size={18} />
          </Button>
        </div>
        
        {/* Main visualization SVG */}
        <svg 
          ref={svgRef} 
          width="100%" 
          height="100%" 
          className="text-foreground"
          style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}
        />
      </div>
      
      {/* Fullscreen Modal */}
      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-screen max-h-screen p-0 border-none bg-black w-[98vw] h-[98vh]">
          <DialogTitle className="absolute top-2 left-4 z-10 text-white bg-black/30 px-3 py-1 rounded-md">
            Cosmic Visualization
          </DialogTitle>
          <div className="w-full h-full relative" ref={fullscreenContainerRef}>
            <svg 
              width="100%" 
              height="100%" 
              className="text-foreground"
            />
            
            {/* Fullscreen Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                className="bg-black/50 hover:bg-black/70 text-white"
              >
                <ZoomIn size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                className="bg-black/50 hover:bg-black/70 text-white"
              >
                <ZoomOut size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullScreen}
                className="bg-black/50 hover:bg-black/70 text-white"
              >
                <Minimize size={18} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CosmicVisualization;
