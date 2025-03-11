import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { HistoricalEntity, prepareSimulationData } from '@/utils/mockData';
import { useAnimateOnMount } from '@/utils/animations';
import VisualizationPlaceholder from './VisualizationPlaceholder';
import { ZoomIn, ZoomOut, Maximize, Minimize, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FormattedHistoricalEntity } from '@/types/supabase';

interface CosmicVisualizationProps {
  entities?: HistoricalEntity[] | FormattedHistoricalEntity[];
  onEntitySelect?: (entity: HistoricalEntity | FormattedHistoricalEntity) => void;
  visualizationType?: "graph" | "timeline";
}

const CosmicVisualization: React.FC<CosmicVisualizationProps> = ({ 
  entities = [],
  onEntitySelect,
  visualizationType = "graph"
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
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);
  const [connectionTypes, setConnectionTypes] = useState<{[key: string]: {color: string, label: string}}>({});

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
      .scaleExtent([0.25, 3])
      .on("zoom", (event) => {
        const { transform } = event;
        setZoomTransform(transform);
        setZoomLevel(transform.k);
        
        svg.select("g.visualization-container")
          .attr("transform", transform.toString());
      });
    
    svg.call(zoomBehavior);
    
    svg.on("dblclick.zoom", () => {
      svg.transition()
        .duration(750)
        .call(zoomBehavior.transform, d3.zoomIdentity);
      setZoomLevel(1);
    });
    
    return () => {
      svg.on(".zoom", null);
    };
  }, [hasData, dimensions]);

  // Handle zoom in/out/reset functions
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

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const downloadSVG = () => {
    if (!svgRef.current) return;
    
    try {
      const svgClone = svgRef.current.cloneNode(true) as SVGElement;
      svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svgClone.setAttribute("version", "1.1");
      
      const svgString = new XMLSerializer().serializeToString(svgClone);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = "historical-visualization.svg";
      document.body.appendChild(link);
      link.click();
      
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success("Visualization downloaded as SVG");
    } catch (error) {
      console.error("Error downloading SVG:", error);
      toast.error("Failed to download visualization");
    }
  };

  // Visualization effect for creating and updating the visualization
  useEffect(() => {
    if (!svgRef.current || !hasData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create a main container for the visualization
    const visualizationContainer = svg.append("g")
      .attr("class", "visualization-container");

    // Add a filter for glow effects
    const defs = svg.append("defs");
    
    // Create glow filter
    const filter = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-40%")
      .attr("y", "-40%")
      .attr("width", "180%")
      .attr("height", "180%");
      
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "blur");
      
    filter.append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");

    // Add shape definitions for different entity types
    // Person: Star shape
    defs.append("symbol")
      .attr("id", "person-symbol")
      .attr("viewBox", "0 0 40 40")
      .append("path")
      .attr("d", "M20,0 L23,17 L40,17 L26,27 L32,43 L20,34 L8,43 L14,27 L0,17 L17,17 Z")
      .attr("fill", "url(#person-gradient)");

    // Event: Explosion shape
    defs.append("symbol")
      .attr("id", "event-symbol")
      .attr("viewBox", "0 0 60 60")
      .append("path")
      .attr("d", "M30,0 L38,12 L52,6 L45,20 L60,25 L45,30 L52,44 L38,38 L30,50 L22,38 L8,44 L15,30 L0,25 L15,20 L8,6 L22,12 Z")
      .attr("fill", "url(#event-gradient)");

    // Place: Planet shape with ring
    const placeSymbol = defs.append("symbol")
      .attr("id", "place-symbol")
      .attr("viewBox", "0 0 50 50");
    
    placeSymbol.append("circle")
      .attr("cx", 25)
      .attr("cy", 25)
      .attr("r", 15)
      .attr("fill", "url(#place-gradient)");
      
    placeSymbol.append("ellipse")
      .attr("cx", 25)
      .attr("cy", 25)
      .attr("rx", 22)
      .attr("ry", 6)
      .attr("fill", "none")
      .attr("stroke", "#83a0ff")
      .attr("stroke-width", 1.5)
      .attr("transform", "rotate(-20, 25, 25)");

    // Concept: Abstract cosmic energy shape
    defs.append("symbol")
      .attr("id", "concept-symbol")
      .attr("viewBox", "0 0 50 50")
      .append("path")
      .attr("d", "M25,5 C35,5 43,15 40,25 C45,32 40,45 30,45 C20,45 15,32 20,25 C17,15 15,5 25,5 Z")
      .attr("fill", "url(#concept-gradient)");

    // Period: Hourglass shape
    defs.append("symbol")
      .attr("id", "period-symbol")
      .attr("viewBox", "0 0 40 50")
      .append("path")
      .attr("d", "M5,5 L35,5 L35,10 L20,25 L35,40 L35,45 L5,45 L5,40 L20,25 L5,10 Z")
      .attr("fill", "url(#period-gradient)");

    // Default: Nebula-like shape
    defs.append("symbol")
      .attr("id", "default-symbol")
      .attr("viewBox", "0 0 40 40")
      .append("circle")
      .attr("cx", 20)
      .attr("cy", 20)
      .attr("r", 18)
      .attr("fill", "url(#default-gradient)");

    // Create gradients for each entity type
    // Person gradient (bluish-purple)
    const personGradient = defs.append("linearGradient")
      .attr("id", "person-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    personGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#9966ff");
      
    personGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#6633cc");

    // Event gradient (red)
    const eventGradient = defs.append("linearGradient")
      .attr("id", "event-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    eventGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ff6666");
      
    eventGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#cc3333");

    // Place gradient (green)
    const placeGradient = defs.append("linearGradient")
      .attr("id", "place-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    placeGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#66ffcc");
      
    placeGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#33cc99");

    // Concept gradient (yellow)
    const conceptGradient = defs.append("linearGradient")
      .attr("id", "concept-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    conceptGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ffdd66");
      
    conceptGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ffaa00");

    // Period gradient (blue)
    const periodGradient = defs.append("linearGradient")
      .attr("id", "period-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    periodGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#66ccff");
      
    periodGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3399cc");

    // Default gradient (white/gray)
    const defaultGradient = defs.append("linearGradient")
      .attr("id", "default-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    defaultGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ffffff");
      
    defaultGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#cccccc");

    // Prepare data for D3
    const data = prepareSimulationData(visualizationData as HistoricalEntity[]);
    
    // Extract all unique relation types to track connections
    const relationTypes: {[key: string]: {color: string, label: string}} = {};
    data.forEach(entity => {
      if (entity.relations) {
        entity.relations.forEach(relation => {
          const type = relation.type || 'default';
          if (!relationTypes[type]) {
            let color;
            let label;
            
            switch(type) {
              case 'causal':
                color = "#ff5555";
                label = "Caused";
                break;
              case 'correlative':
                color = "#5555ff"; 
                label = "Related to";
                break;
              case 'conflicting':
                color = "#ffaa00";
                label = "Conflicted with";
                break;
              case 'evolutionary':
                color = "#55cc55";
                label = "Evolved into";
                break;
              case 'artist':
                color = "#cc66cc";
                label = "Created by";
                break;
              case 'painted':
              case 'wrote':
              case 'authored':
              case 'developed':
                color = "#aa55ff";
                label = "Created";
                break;
              case 'ledTo':
                color = "#ff55aa";
                label = "Led to";
                break;
              default:
                color = "#aaaaaa";
                label = "Connected to";
            }
            
            relationTypes[type] = { color, label };
          }
        });
      }
    });
    
    // Store connection types for legend
    setConnectionTypes(relationTypes);

    // Create links array from relations
    const links: Array<{source: any, target: any, type: string}> = [];
    data.forEach(entity => {
      if (entity.relations) {
        entity.relations.forEach(relation => {
          const targetId = relation.target || relation.targetId;
          if (targetId) {
            const target = data.find(e => e.id === targetId);
            if (target) {
              links.push({
                source: entity,
                target,
                type: relation.type || 'default'
              });
            }
          }
        });
      }
    });

    // Create the D3 force simulation
    const simulation = d3.forceSimulation(data)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(200))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force("collision", d3.forceCollide().radius(50));

    // Create links
    const link = visualizationContainer.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", d => relationTypes[d.type]?.color || "#aaaaaa")
      .attr("stroke-width", 3)
      .attr("stroke-opacity", 0.6)
      .attr("stroke-dasharray", d => d.type === 'correlative' ? "5,5" : d.type === 'conflicting' ? "2,2" : null);

    // Create entity groups
    const node = visualizationContainer.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(data)
      .join("g")
      .attr("class", "entity-node")
      .on("click", (event, d) => {
        if (onEntitySelect) onEntitySelect(d);
      })
      .call(d3.drag<SVGGElement, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    // Add aura/glow circle
    node.append("circle")
      .attr("class", "entity-aura")
      .attr("r", d => ((d.significance || 5) / 5) * 35)
      .attr("fill", d => {
        switch(d.type.toLowerCase()) {
          case 'person': return "rgba(153, 102, 255, 0.2)";
          case 'event': return "rgba(255, 102, 102, 0.2)";
          case 'place': return "rgba(102, 255, 204, 0.2)";
          case 'concept': return "rgba(255, 204, 102, 0.2)";
          case 'period': return "rgba(102, 204, 255, 0.2)";
          default: return "rgba(200, 200, 200, 0.2)";
        }
      })
      .attr("filter", "url(#glow)");

    // Add node symbols based on entity type
    node.append("use")
      .attr("href", d => {
        const type = d.type.toLowerCase();
        switch(type) {
          case 'person': return "#person-symbol";
          case 'event': return "#event-symbol";
          case 'place': return "#place-symbol";
          case 'concept': return "#concept-symbol";
          case 'period': return "#period-symbol";
          default: return "#default-symbol";
        }
      })
      .attr("x", d => -((d.significance || 5) / 5) * 15)
      .attr("y", d => -((d.significance || 5) / 5) * 15)
      .attr("width", d => ((d.significance || 5) / 5) * 30)
      .attr("height", d => ((d.significance || 5) / 5) * 30)
      .attr("class", "entity-symbol");

    // Add labels
    node.append("text")
      .attr("dy", d => ((d.significance || 5) / 5) * 30)
      .attr("text-anchor", "middle")
      .text(d => d.name)
      .attr("fill", "white")
      .attr("font-size", d => 10 + ((d.significance || 5) / 5) * 2)
      .attr("pointer-events", "none");

    // Add orbit paths for entities with dates
    node.filter(d => d.startDate && d.endDate)
      .append("circle")
      .attr("class", "temporal-orbit")
      .attr("r", d => ((d.significance || 5) / 5) * 20)
      .attr("fill", "none")
      .attr("stroke", "rgba(255, 255, 255, 0.3)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");

    // Create a legend for connection types
    const legendG = svg.append("g")
      .attr("class", "connection-legend")
      .attr("transform", `translate(20, ${dimensions.height - 20 - (Object.keys(relationTypes).length * 20)})`);

    Object.entries(relationTypes).forEach(([type, {color, label}], i) => {
      const legendRow = legendG.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
        
      legendRow.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 20)
        .attr("y2", 0)
        .attr("stroke", color)
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", type === 'correlative' ? "5,5" : type === 'conflicting' ? "2,2" : null);
        
      legendRow.append("text")
        .attr("x", 25)
        .attr("y", 5)
        .text(label)
        .attr("font-size", 10)
        .attr("fill", "white");
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, any, any>, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, any, any>, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, any, any>, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node.attr("transform", d => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [entities, hasData, dimensions, onEntitySelect]);

  if (!hasData && !isVisible) {
    return <VisualizationPlaceholder />;
  }

  return (
    <>
      <div className="relative w-full h-[600px] overflow-hidden bg-black/20 rounded-lg" ref={containerRef}>
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
        
        <svg 
          ref={svgRef} 
          width="100%" 
          height="100%" 
          className="text-foreground"
          style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}
        />
      </div>
      
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
