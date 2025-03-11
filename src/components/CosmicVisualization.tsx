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
