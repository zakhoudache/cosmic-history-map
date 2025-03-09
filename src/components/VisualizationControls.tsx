
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Maximize, Minimize, Plus, Minus, Network, Activity, Book } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface VisualizationControlsProps {
  visualizationType?: "graph" | "timeline" | "story";
  onVisTypeChange?: (type: "graph" | "timeline" | "story") => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onToggleFullscreen?: () => void;
  onExport?: () => void;
  isFullscreen?: boolean;
  entityCount?: number;
}

const VisualizationControls: React.FC<VisualizationControlsProps> = ({
  visualizationType = "graph",
  onVisTypeChange,
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
  onExport,
  isFullscreen = false,
  entityCount,
}) => {
  return (
    <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
      {/* Visualization Type Controls */}
      {onVisTypeChange && (
        <div className="flex items-center mr-2 bg-background/40 backdrop-blur-sm p-1 rounded-md border border-galaxy-nova/20">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={visualizationType === "graph" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onVisTypeChange("graph")}
                aria-label="Graph view"
              >
                <Network className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Graph View</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={visualizationType === "timeline" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onVisTypeChange("timeline")}
                aria-label="Timeline view"
              >
                <Activity className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Timeline View</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={visualizationType === "story" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onVisTypeChange("story")}
                aria-label="Story view"
              >
                <Book className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Story View</TooltipContent>
          </Tooltip>

          {entityCount && (
            <span className="ml-2 text-xs px-2 py-1 bg-muted rounded-full">
              {entityCount} entities
            </span>
          )}
        </div>
      )}

      {/* Zoom Controls */}
      {onZoomIn && onZoomOut && (
        <div className="flex items-center mr-2 bg-background/40 backdrop-blur-sm p-1 rounded-md border border-galaxy-nova/20">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onZoomIn}
                aria-label="Zoom in"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onZoomOut}
                aria-label="Zoom out"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Fullscreen and Export Controls */}
      <div className="flex items-center bg-background/40 backdrop-blur-sm p-1 rounded-md border border-galaxy-nova/20">
        {onToggleFullscreen && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleFullscreen}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </TooltipContent>
          </Tooltip>
        )}

        {onExport && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onExport}
                aria-label="Export visualization"
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default VisualizationControls;
