
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
    // Person: Stylized star with halo
    defs.append("symbol")
      .attr("id", "person-symbol")
      .attr("viewBox", "0 0 60 60")
      .append("path")
      .attr("d", "M30,0 L35,20 L55,20 L40,32 L45,55 L30,42 L15,55 L20,32 L5,20 L25,20 Z")
      .attr("fill", "url(#person-gradient)");
    // Add halo
    defs.select("#person-symbol")
      .append("circle")
      .attr("cx", 30)
      .attr("cy", 30)
      .attr("r", 35)
      .attr("fill", "none")
      .attr("stroke", "rgba(255, 215, 120, 0.3)")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "1,3");

    // Event: Cosmic explosion with radiating lines
    const eventSymbol = defs.append("symbol")
      .attr("id", "event-symbol")
      .attr("viewBox", "0 0 60 60");
    
    // Core explosion
    eventSymbol.append("path")
      .attr("d", "M30,5 L38,12 L52,6 L45,20 L60,25 L45,30 L52,44 L38,38 L30,50 L22,38 L8,44 L15,30 L0,25 L15,20 L8,6 L22,12 Z")
      .attr("fill", "url(#event-gradient)");
    
    // Radiating lines
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x1 = 30 + 25 * Math.cos(angle);
      const y1 = 30 + 25 * Math.sin(angle);
      const x2 = 30 + 35 * Math.cos(angle);
      const y2 = 30 + 35 * Math.sin(angle);
      
      eventSymbol.append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "#ff6655")
        .attr("stroke-width", 1.5);
    }

    // Place: Planet with ring system
    const placeSymbol = defs.append("symbol")
      .attr("id", "place-symbol")
      .attr("viewBox", "0 0 60 60");
    
    // Planet core
    placeSymbol.append("circle")
      .attr("cx", 30)
      .attr("cy", 30)
      .attr("r", 18)
      .attr("fill", "url(#place-gradient)");
    
    // Rings
    placeSymbol.append("ellipse")
      .attr("cx", 30)
      .attr("cy", 30)
      .attr("rx", 30)
      .attr("ry", 10)
      .attr("fill", "none")
      .attr("stroke", "#55ddbb")
      .attr("stroke-width", 1.5)
      .attr("transform", "rotate(-20, 30, 30)");
    
    placeSymbol.append("ellipse")
      .attr("cx", 30)
      .attr("cy", 30)
      .attr("rx", 25)
      .attr("ry", 8)
      .attr("fill", "none")
      .attr("stroke", "#66eebb")
      .attr("stroke-width", 1)
      .attr("transform", "rotate(-20, 30, 30)");

    // Concept: Abstract nebula with particles
    const conceptSymbol = defs.append("symbol")
      .attr("id", "concept-symbol")
      .attr("viewBox", "0 0 60 60");
    
    // Nebula cloud
    conceptSymbol.append("path")
      .attr("d", "M25,5 C40,5 48,20 40,35 C50,45 40,55 25,55 C10,55 5,40 15,30 C5,20 10,5 25,5 Z")
      .attr("fill", "url(#concept-gradient)")
      .attr("opacity", 0.8);
    
    // Particles
    for (let i = 0; i < 12; i++) {
      const x = 15 + Math.random() * 30;
      const y = 15 + Math.random() * 30;
      const r = 0.8 + Math.random() * 1.2;
      
      conceptSymbol.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", r)
        .attr("fill", "#ffffff");
    }

    // Period: Hourglass/clock-like symbol
    const periodSymbol = defs.append("symbol")
      .attr("id", "period-symbol")
      .attr("viewBox", "0 0 60 60");
    
    // Hourglass shape
    periodSymbol.append("path")
      .attr("d", "M15,10 L45,10 L45,15 L30,30 L45,45 L45,50 L15,50 L15,45 L30,30 L15,15 Z")
      .attr("fill", "url(#period-gradient)")
      .attr("stroke", "#5599ee")
      .attr("stroke-width", 1);
    
    // Clock face elements
    periodSymbol.append("circle")
      .attr("cx", 30)
      .attr("cy", 30)
      .attr("r", 20)
      .attr("fill", "none")
      .attr("stroke", "#5599ee")
      .attr("stroke-width", 0.8)
      .attr("stroke-dasharray", "1,2")
      .attr("opacity", 0.5);
    
    // Clock hands
    periodSymbol.append("line")
      .attr("x1", 30)
      .attr("y1", 30)
      .attr("x2", 30)
      .attr("y2", 15)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1);
    
    periodSymbol.append("line")
      .attr("x1", 30)
      .attr("y1", 30)
      .attr("x2", 40)
      .attr("y2", 30)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1);

    // Artwork: Abstract palette/canvas
    const artworkSymbol = defs.append("symbol")
      .attr("id", "artwork-symbol")
      .attr("viewBox", "0 0 60 60");
    
    // Canvas/frame
    artworkSymbol.append("rect")
      .attr("x", 10)
      .attr("y", 15)
      .attr("width", 40)
      .attr("height", 30)
      .attr("fill", "#f5f5f5")
      .attr("stroke", "#aa55cc")
      .attr("stroke-width", 2);
    
    // Palette
    artworkSymbol.append("path")
      .attr("d", "M20,45 C10,45 5,40 5,30 C5,20 15,15 25,20 C30,10 45,15 50,25 C55,35 50,45 45,45 Z")
      .attr("fill", "url(#artwork-gradient)")
      .attr("transform", "translate(5, 0) scale(0.8)");
    
    // Color dots on palette
    const colors = ["#ff5555", "#55ff55", "#5555ff", "#ffff55", "#ff55ff"];
    for (let i = 0; i < 5; i++) {
      artworkSymbol.append("circle")
        .attr("cx", 15 + i * 7)
        .attr("cy", 43)
        .attr("r", 2)
        .attr("fill", colors[i]);
    }

    // Document: Scroll/book representation
    const documentSymbol = defs.append("symbol")
      .attr("id", "document-symbol")
      .attr("viewBox", "0 0 60 60");
    
    // Book/scroll shape
    documentSymbol.append("path")
      .attr("d", "M15,10 C10,10 10,15 15,15 L45,15 C50,15 50,10 45,10 L15,10 Z")
      .attr("fill", "#d4af37");
    
    documentSymbol.append("path")
      .attr("d", "M15,15 L15,50 L45,50 L45,15 L15,15 Z")
      .attr("fill", "#f5f5dc")
      .attr("stroke", "#d4af37")
      .attr("stroke-width", 1);
    
    // Page lines
    for (let i = 0; i < 6; i++) {
      documentSymbol.append("line")
        .attr("x1", 20)
        .attr("y1", 20 + i * 5)
        .attr("x2", 40)
        .attr("y2", 20 + i * 5)
        .attr("stroke", "#aa9977")
        .attr("stroke-width", 0.5);
    }

    // Building: Architectural structure
    const buildingSymbol = defs.append("symbol")
      .attr("id", "building-symbol")
      .attr("viewBox", "0 0 60 60");
    
    // Main structure
    buildingSymbol.append("rect")
      .attr("x", 15)
      .attr("y", 20)
      .attr("width", 30)
      .attr("height", 35)
      .attr("fill", "url(#building-gradient)");
    
    // Roof
    buildingSymbol.append("path")
      .attr("d", "M10,20 L30,5 L50,20 Z")
      .attr("fill", "#7788aa");
    
    // Windows
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        buildingSymbol.append("rect")
          .attr("x", 20 + j * 8)
          .attr("y", 25 + i * 8)
          .attr("width", 5)
          .attr("height", 5)
          .attr("fill", "#aaccee");
      }
    }

    // Theory: Brain/neural network
    const theorySymbol = defs.append("symbol")
      .attr("id", "theory-symbol")
      .attr("viewBox", "0 0 60 60");
    
    // Brain outline
    theorySymbol.append("path")
      .attr("d", "M30,5 C45,5 55,15 55,30 C55,40 50,45 40,50 C35,55 25,55 20,50 C10,45 5,40 5,30 C5,15 15,5 30,5 Z")
      .attr("fill", "url(#theory-gradient)")
      .attr("stroke", "#cc55dd")
      .attr("stroke-width", 1);
    
    // Neural nodes and connections
    const nodes = [];
    for (let i = 0; i < 8; i++) {
      const x = 15 + Math.random() * 30;
      const y = 15 + Math.random() * 30;
      nodes.push({ x, y });
      
      theorySymbol.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 1.5)
        .attr("fill", "#ffffff");
    }
    
    // Connect some nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.6) {
          theorySymbol.append("line")
            .attr("x1", nodes[i].x)
            .attr("y1", nodes[i].y)
            .attr("x2", nodes[j].x)
            .attr("y2", nodes[j].y)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 0.5)
            .attr("opacity", 0.6);
        }
      }
    }

    // Invention: Light bulb/gear
    const inventionSymbol = defs.append("symbol")
      .attr("id", "invention-symbol")
      .attr("viewBox", "0 0 60 60");
    
    // Light bulb
    inventionSymbol.append("path")
      .attr("d", "M25,45 L35,45 L35,40 C45,35 45,15 30,15 C15,15 15,35 25,40 Z")
      .attr("fill", "url(#invention-gradient)")
      .attr("stroke", "#ffcc44")
      .attr("stroke-width", 1);
    
    // Base of bulb
    inventionSymbol.append("rect")
      .attr("x", 25)
      .attr("y", 45)
      .attr("width", 10)
      .attr("height", 3)
      .attr("fill", "#dddddd");
    
    inventionSymbol.append("rect")
      .attr("x", 27)
      .attr("y", 48)
      .attr("width", 6)
      .attr("height", 2)
      .attr("fill", "#bbbbbb");
    
    // Gear teeth around the bulb
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x1 = 30 + 15 * Math.cos(angle);
      const y1 = 30 + 15 * Math.sin(angle);
      const x2 = 30 + 20 * Math.cos(angle);
      const y2 = 30 + 20 * Math.sin(angle);
      
      inventionSymbol.append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "#ffcc44")
        .attr("stroke-width", 2);
    }

    // Process: Flowing diagram/cycle
    const processSymbol = defs.append("symbol")
      .attr("id", "process-symbol")
      .attr("viewBox", "0 0 60 60");
    
    // Circular flow
    processSymbol.append("circle")
      .attr("cx", 30)
      .attr("cy", 30)
      .attr("r", 20)
      .attr("fill", "none")
      .attr("stroke", "url(#process-gradient)")
      .attr("stroke-width", 5);
    
    // Directional arrows
    const arrowPoints = [
      { angle: 0, rotate: 90 },
      { angle: 120, rotate: 210 },
      { angle: 240, rotate: 330 }
    ];
    
    arrowPoints.forEach(point => {
      const angle = (point.angle * Math.PI) / 180;
      const x = 30 + 20 * Math.cos(angle);
      const y = 30 + 20 * Math.sin(angle);
      
      processSymbol.append("path")
        .attr("d", "M0,-5 L5,0 L0,5 Z")
        .attr("fill", "#55ccaa")
        .attr("transform", `translate(${x},${y}) rotate(${point.rotate})`);
    });

    // Play: Theatrical mask/stage
    const playSymbol = defs.append("symbol")
      .attr("id", "play-symbol")
      .attr("viewBox", "0 0 60 60");
    
    // Stage curtains
    playSymbol.append("path")
      .attr("d", "M5,15 Q30,0 55,15 L55,50 L5,50 Z")
      .attr("fill", "#aa3355")
      .attr("stroke", "#882244")
      .attr("stroke-width", 1);
    
    // Mask (tragedy and comedy combined)
    playSymbol.append("circle")
      .attr("cx", 20)
      .attr("cy", 30)
      .attr("r", 10)
      .attr("fill", "#f5f5dc")
      .attr("stroke", "#000000")
      .attr("stroke-width", 0.5);
    
    playSymbol.append("circle")
      .attr("cx", 40)
      .attr("cy", 30)
      .attr("r", 10)
      .attr("fill", "#f5f5dc")
      .attr("stroke", "#000000")
      .attr("stroke-width", 0.5);
    
    // Expressions
    // Tragedy (left)
    playSymbol.append("path")
      .attr("d", "M15,35 Q20,30 25,35")
      .attr("fill", "none")
      .attr("stroke", "#000000")
      .attr("stroke-width", 1);
    
    // Comedy (right)
    playSymbol.append("path")
      .attr("d", "M35,30 Q40,35 45,30")
      .attr("fill", "none")
      .attr("stroke", "#000000")
      .attr("stroke-width", 1);

    // Default: Abstract cosmic object
    defs.append("symbol")
      .attr("id", "default-symbol")
      .attr("viewBox", "0 0 60 60")
      .append("circle")
      .attr("cx", 30)
      .attr("cy", 30)
      .attr("r", 25)
      .attr("fill", "url(#default-gradient)");

    // Create gradients for each entity type
    // Person gradient (golden starlight)
    const personGradient = defs.append("linearGradient")
      .attr("id", "person-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    personGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ffee99");
      
    personGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#bb7700");

    // Event gradient (explosive red/orange)
    const eventGradient = defs.append("linearGradient")
      .attr("id", "event-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    eventGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ffcc66");
      
    eventGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#dd3333");

    // Place gradient (teal/blue planet)
    const placeGradient = defs.append("linearGradient")
      .attr("id", "place-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    placeGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#66ffee");
      
    placeGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#228899");

    // Concept gradient (nebula purple)
    const conceptGradient = defs.append("linearGradient")
      .attr("id", "concept-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    conceptGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#cc99ff");
      
    conceptGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#7733aa");

    // Period gradient (time blue)
    const periodGradient = defs.append("linearGradient")
      .attr("id", "period-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    periodGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#66aaff");
      
    periodGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#2244aa");

    // Artwork gradient (artistic colors)
    const artworkGradient = defs.append("linearGradient")
      .attr("id", "artwork-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    artworkGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ff99cc");
      
    artworkGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#aa55cc");

    // Building gradient (architectural stone)
    const buildingGradient = defs.append("linearGradient")
      .attr("id", "building-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    buildingGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#aabbcc");
      
    buildingGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#556677");

    // Theory gradient (brain purple)
    const theoryGradient = defs.append("linearGradient")
      .attr("id", "theory-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    theoryGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#dd99ff");
      
    theoryGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#9933cc");

    // Invention gradient (light bulb yellow)
    const inventionGradient = defs.append("linearGradient")
      .attr("id", "invention-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    inventionGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#ffff99");
      
    inventionGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ffcc44");

    // Process gradient (flowing teal)
    const processGradient = defs.append("linearGradient")
      .attr("id", "process-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    processGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#44ddbb");
      
    processGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#227755");

    // Default gradient (cosmic blue)
    const defaultGradient = defs.append("linearGradient")
      .attr("id", "default-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    defaultGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#aaccff");
      
    defaultGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#557799");

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
    const links: Array<{source: any, target: any, type: string, strength: number}> = [];
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
                type: relation.type || 'default',
                strength: relation.strength || 1
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

    // Create links with varying styles and strengths
    const link = visualizationContainer.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", d => relationTypes[d.type]?.color || "#aaaaaa")
      .attr("stroke-width", d => Math.max(1, d.strength || 1) * 1.5) // Use strength to determine width
      .attr("stroke-opacity", 0.8) // Increased opacity
      .attr("stroke-dasharray", d => {
        // Different patterns for different relation types
        switch(d.type) {
          case 'correlative': return "5,5";
          case 'conflicting': return "2,2";
          case 'evolutionary': return "10,5";
          default: return null;
        }
      });

    // Create entity groups
    const node = visualizationContainer.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(data)
      .join("g")
      .attr("class", d => `entity-node entity-type-${d.type.toLowerCase()}`)
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
        // Different aura colors based on type
        const type = d.type.toLowerCase();
        switch(type) {
          case 'person': return "rgba(255, 215, 0, 0.15)";
          case 'event': return "rgba(255, 100, 50, 0.15)";
          case 'place': return "rgba(100, 255, 200, 0.15)";
          case 'concept': return "rgba(200, 100, 255, 0.15)";
          case 'period': return "rgba(100, 150, 255, 0.15)";
          case 'artwork': return "rgba(255, 150, 200, 0.15)";
          case 'document': return "rgba(255, 230, 150, 0.15)";
          case 'building': return "rgba(150, 180, 220, 0.15)";
          case 'theory': return "rgba(220, 150, 255, 0.15)";
          case 'invention': return "rgba(255, 255, 150, 0.15)";
          case 'process': return "rgba(100, 220, 180, 0.15)";
          case 'play': return "rgba(255, 100, 150, 0.15)";
          default: return "rgba(200, 200, 220, 0.15)";
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
          case 'artwork': return "#artwork-symbol";
          case 'document': return "#document-symbol";
          case 'building': return "#building-symbol";
          case 'theory': return "#theory-symbol";
          case 'invention': return "#invention-symbol";
          case 'process': return "#process-symbol";
          case 'play': return "#play-symbol";
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
      .attr("pointer-events", "none")
      .attr("filter", "url(#glow)"); // Add subtle glow to text

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
        .attr("stroke-dasharray", type === 'correlative' ? "5,5" : type === 'conflicting' ? "2,2" : type === 'evolutionary' ? "10,5" : null);
        
      legendRow.append("text")
        .attr("x", 25)
        .attr("y", 5)
        .text(label)
        .attr("font-size", 10)
        .attr("fill", "white");
    });

    // Create a legend for entity types
    const entityTypeLegend = svg.append("g")
      .attr("class", "entity-legend")
      .attr("transform", `translate(${dimensions.width - 120}, 20)`);

    // Define the entity types to include in the legend
    const entityTypes = [
      { type: 'person', label: 'Person' },
      { type: 'event', label: 'Event' },
      { type: 'place', label: 'Place' },
      { type: 'concept', label: 'Concept' },
      { type: 'period', label: 'Period' }
    ];

    // Add a title to the legend
    entityTypeLegend.append("text")
      .attr("x", 0)
      .attr("y", -5)
      .text("Entity Types")
      .attr("font-size", 12)
      .attr("font-weight", "bold")
      .attr("fill", "white");

    // Create legend items
    entityTypes.forEach((item, i) => {
      const legendRow = entityTypeLegend.append("g")
        .attr("transform", `translate(0, ${i * 22 + 10})`);
        
      legendRow.append("use")
        .attr("href", `#${item.type}-symbol`)
        .attr("x", 0)
        .attr("y", -8)
        .attr("width", 16)
        .attr("height", 16);
        
      legendRow.append("text")
        .attr("x", 20)
        .attr("y", 0)
        .text(item.label)
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
