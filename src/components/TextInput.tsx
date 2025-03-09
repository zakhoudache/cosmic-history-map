
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TextInputProps {
  onSubmit: (text: string, analysisResult: any) => void;
  isLoading?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({ onSubmit, isLoading = false }) => {
  const [text, setText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    try {
      setIsAnalyzing(true);
      
      // Call the Supabase Edge Function to analyze the text
      const { data, error } = await supabase.functions.invoke('analyze-historical-text', {
        body: { text },
      });
      
      if (error) {
        console.error("Error analyzing text:", error);
        toast.error("Failed to analyze text. Please try again.");
        return;
      }
      
      if (!data || !data.entities) {
        console.error("Invalid response format:", data);
        toast.error("Failed to analyze text. Response format is invalid.");
        return;
      }
      
      // Pass both the text and the analysis result to the parent component
      onSubmit(text, data);
      
      toast.success("Text analyzed successfully!");
    } catch (error) {
      console.error("Error analyzing text:", error);
      toast.error("Failed to analyze text. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exampleTexts = [
    "The Renaissance was a period in European history marking the transition from the Middle Ages to modernity and covering the 15th and 16th centuries.",
    "World War II was a global war that lasted from 1939 to 1945. It involved the vast majority of the world's countries—including all of the great powers.",
    "The Industrial Revolution was the transition to new manufacturing processes in Great Britain, continental Europe, and the United States, from 1760 to 1840."
  ];

  const handleExampleClick = (example: string) => {
    setText(example);
    setIsExpanded(true);
  };

  return (
    <div className="text-input-container">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">Enter historical text to visualize</h2>
      </div>
      
      <div className="text-input-wrapper">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter historical text or select an example below..."
            className="w-full resize-none bg-white/5 border-gray-700 focus:ring-cosmic-light text-base h-32"
            onFocus={() => setIsExpanded(true)}
          />
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setText("")}
                disabled={!text.length}
                className="text-xs"
              >
                Clear
              </Button>
              <span className="text-xs text-muted-foreground">
                {text.length} characters
              </span>
            </div>
            
            <Button 
              type="submit" 
              disabled={!text.trim() || isLoading || isAnalyzing}
              className="visualize-button"
            >
              {isLoading || isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              Visualize
            </Button>
          </div>
        </form>
        
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Examples</span>
          </div>
          
          <div className="grid gap-2">
            {exampleTexts.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="example-item"
              >
                {example.length > 100 ? `${example.substring(0, 100)}...` : example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextInput;
