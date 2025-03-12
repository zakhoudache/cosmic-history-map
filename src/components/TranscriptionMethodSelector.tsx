
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type TranscriptionMethod = "default" | "auto-caption" | "scrape" | "gemini";

interface TranscriptionMethodSelectorProps {
  selectedMethod: TranscriptionMethod;
  onChange: (method: TranscriptionMethod) => void;
  disabled?: boolean;
}

const TranscriptionMethodSelector: React.FC<TranscriptionMethodSelectorProps> = ({
  selectedMethod,
  onChange,
  disabled = false
}) => {
  return (
    <div className="w-full mb-4">
      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium">Transcription Method</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-80">
            <p>Choose how to retrieve the video transcription:</p>
            <ul className="list-disc pl-4 mt-1 text-xs">
              <li><strong>Default:</strong> Use Supadata API with manual captions (most accurate)</li>
              <li><strong>Auto-caption:</strong> Use Supadata API with auto-generated captions</li>
              <li><strong>Scrape:</strong> Scrape captions directly from YouTube (fallback)</li>
              <li><strong>Gemini:</strong> Use Gemini AI to analyze the video (experimental)</li>
            </ul>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) => onChange(value as TranscriptionMethod)}
        className="flex flex-col space-y-1"
        disabled={disabled}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="default" id="default" />
          <Label htmlFor="default" className="text-sm cursor-pointer">Default (Manual Captions)</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="auto-caption" id="auto-caption" />
          <Label htmlFor="auto-caption" className="text-sm cursor-pointer">Auto-generated Captions</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="scrape" id="scrape" />
          <Label htmlFor="scrape" className="text-sm cursor-pointer">Scrape from YouTube</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="gemini" id="gemini" />
          <Label htmlFor="gemini" className="text-sm cursor-pointer">Gemini AI (Experimental)</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default TranscriptionMethodSelector;
