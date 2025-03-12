
import React from "react";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface TranscriptionMethodSelectorProps {
  useAutoCaption: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}

const TranscriptionMethodSelector: React.FC<TranscriptionMethodSelectorProps> = ({
  useAutoCaption,
  onToggle,
  disabled = false
}) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="text-sm text-foreground/80">Captions:</div>
      <div className="flex border border-galaxy-nova/30 rounded-md overflow-hidden">
        <Toggle
          variant="outline"
          size="sm"
          pressed={!useAutoCaption}
          onClick={() => onToggle(false)}
          disabled={disabled}
          className={`rounded-none border-0 ${!useAutoCaption ? 'bg-galaxy-nova/20' : ''} px-2 py-1`}
        >
          Manual
        </Toggle>
        <Toggle
          variant="outline" 
          size="sm"
          pressed={useAutoCaption}
          onClick={() => onToggle(true)}
          disabled={disabled}
          className={`rounded-none border-0 ${useAutoCaption ? 'bg-galaxy-nova/20' : ''} px-2 py-1`}
        >
          Auto
        </Toggle>
      </div>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-foreground/60 cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p>Choose between manual captions (created by the video creator) or auto-generated captions (created by YouTube&apos;s speech recognition).</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default TranscriptionMethodSelector;
