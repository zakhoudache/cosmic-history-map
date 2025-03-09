import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";

interface TextInputProps {
  onSubmit: (text: string, analysisResult: any) => void;
  isLoading: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState<string>("");
  
  const handleSubmit = async () => {
    if (!text.trim()) return;
    
    // Mock analysis result - in a real app this would come from an API
    const mockAnalysisResult = {
      entities: [
        // Mock data format would match what your API returns
      ],
      timeline: {
        // Mock timeline data
      }
    };
    
    onSubmit(text, mockAnalysisResult);
  };
  
  return (
    <div className="text-input-container">
      <div className="text-input-wrapper">
        <Textarea
          placeholder="Enter historical text to analyze... (e.g. 'The Renaissance was a period of European cultural, artistic, political, and scientific rebirth after the Middle Ages...')"
          className="min-h-32 glass border-galaxy-nova/20 focus:border-galaxy-nova/50 transition-all shadow-inner shadow-galaxy-nova/5 mb-4"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setText("")}
              disabled={!text.trim() || isLoading}
              className="border-galaxy-nova/30 hover:border-galaxy-nova/60"
            >
              Clear
            </Button>
            <span className="text-xs text-muted-foreground">{text.length} characters</span>
          </div>
          
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !text.trim()}
            className="cosmic-button group"
          >
            {isLoading ? (
              <>Processing<span className="loading-dots"></span></>
            ) : (
              <>
                Visualize 
                <SendHorizonal className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TextInput;
