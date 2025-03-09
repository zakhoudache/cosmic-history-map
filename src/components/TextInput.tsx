
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";
import { analyzeHistoricalText } from "@/services/historicalDataService";
import { toast } from "sonner";
import { FormattedHistoricalEntity } from "@/types/supabase";

interface TextInputProps {
  onSubmit: (text: string, analysisResult: FormattedHistoricalEntity[]) => void;
  isLoading: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ onSubmit, isLoading }) => {
  const [text, setText] = useState<string>("");
  
  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error("Please enter some historical text to analyze.");
      return;
    }
    
    try {
      // Use the real analysis function
      const analysisResult = await analyzeHistoricalText(text);
      onSubmit(text, analysisResult);
      toast.success(`Analysis complete! Found ${analysisResult.length} historical entities.`);
    } catch (error) {
      console.error("Error analyzing text:", error);
      toast.error("Failed to analyze text. Please try again later.");
    }
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
