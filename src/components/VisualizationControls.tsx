
import React from 'react';
import { ZoomIn, ZoomOut, Maximize, Download, Minimize } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface VisualizationControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFullscreen: () => void;
  onExport: () => void;
  isFullscreen: boolean;
  className?: string;
}

const VisualizationControls: React.FC<VisualizationControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
  onExport,
  isFullscreen,
  className = ""
}) => {
  return (
    <div className={`absolute top-3 right-3 flex space-x-2 z-10 opacity-70 hover:opacity-100 transition-opacity ${className}`}>
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
        <TooltipContent>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</TooltipContent>
      </Tooltip>
      
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
    </div>
  );
};

export default VisualizationControls;
