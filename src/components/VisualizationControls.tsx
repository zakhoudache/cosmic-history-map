import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, Download, Minimize, BarChart, Activity } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface VisualizationControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onToggleFullscreen?: () => void;
  onExport?: () => void;
  isFullscreen?: boolean;
  className?: string;
  // Add new props for visualization type
  visualizationType?: "graph" | "timeline";
  onVisTypeChange?: (type: "graph" | "timeline") => void;
  entityCount?: number;
}

const VisualizationControls: React.FC<VisualizationControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
  onExport,
  isFullscreen,
  className = "",
  visualizationType = "graph",
  onVisTypeChange,
  entityCount = 0
}) => {
  return (
    <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-2">
        {onVisTypeChange && (
          <ToggleGroup type="single" value={visualizationType} onValueChange={(value) => {
            if (value) onVisTypeChange(value as "graph" | "timeline");
          }}>
            <ToggleGroupItem value="graph" aria-label="Connection Graph" className="gap-1.5">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Graph</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="timeline" aria-label="Timeline View" className="gap-1.5">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Timeline</span>
            </ToggleGroupItem>
          </ToggleGroup>
        )}
        
        {entityCount > 0 && (
          <span className="text-sm text-muted-foreground ml-2">
            {entityCount} {entityCount === 1 ? 'entity' : 'entities'} found
          </span>
        )}
      </div>
      
      {/* We'll keep the original zoom controls, but they'll be used by CosmicVisualization internally */}
      {(onZoomIn || onZoomOut || onToggleFullscreen || onExport) && (
        <div className={`flex space-x-2 z-10 opacity-70 hover:opacity-100 transition-opacity ${className}`}>
          {onZoomIn && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={onZoomIn}
                  className="bg-background/10 backdrop-blur-sm border-galaxy-nova/20 hover:bg-galaxy-nova/20 h-8 w-8"
                >
                  <ZoomIn className="h-4 w-4" />
                  <span className="sr-only">Zoom In</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          )}
          
          {onZoomOut && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={onZoomOut}
                  className="bg-background/10 backdrop-blur-sm border-galaxy-nova/20 hover:bg-galaxy-nova/20 h-8 w-8"
                >
                  <ZoomOut className="h-4 w-4" />
                  <span className="sr-only">Zoom Out</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>
          )}
          
          {onToggleFullscreen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={onToggleFullscreen}
                  className="bg-background/10 backdrop-blur-sm border-galaxy-nova/20 hover:bg-galaxy-nova/20 h-8 w-8"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  <span className="sr-only">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"} </TooltipContent>
            </Tooltip>
          )}
          
          {onExport && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={onExport}
                  className="bg-background/10 backdrop-blur-sm border-galaxy-nova/20 hover:bg-galaxy-nova/20 h-8 w-8"
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Export</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export as SVG</TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
};

export default VisualizationControls;
