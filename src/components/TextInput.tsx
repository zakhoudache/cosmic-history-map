
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendHorizonal, AlertCircle, Scissors } from "lucide-react";
import { analyzeHistoricalText } from "@/services/historicalDataService";
import { toast } from "sonner";
import { FormattedHistoricalEntity } from "@/types/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TextInputProps {
  onSubmit: (text: string, analysisResult: FormattedHistoricalEntity[]) => void;
  isLoading: boolean;
  onStartAnalysis?: () => void;
  defaultMethod?: "text" | "youtube";
}

const TextInput: React.FC<TextInputProps> = ({ 
  onSubmit, 
  isLoading: externalLoading, 
  onStartAnalysis,
  defaultMethod = "text" 
}) => {
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inputMethod, setInputMethod] = useState<"standard" | "long">("standard");
  const [longText, setLongText] = useState<string>("");
  const [summarizing, setSummarizing] = useState<boolean>(false);
  const { user } = useAuth();
  
  const handleSubmit = async () => {
    const textToAnalyze = inputMethod === "standard" ? text : longText;
    
    if (!textToAnalyze.trim()) {
      toast.error("Please enter some historical text to analyze.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Notify parent component that analysis is starting
      if (onStartAnalysis) {
        onStartAnalysis();
      }
      
      // Let the user know about authentication status
      if (!user) {
        console.log("Using in-memory processing without database storage (not authenticated)");
      }
      
      // Use the real analysis function
      const analysisResult = await analyzeHistoricalText(textToAnalyze);
      onSubmit(textToAnalyze, analysisResult);
      toast.success(`Analysis complete! Found ${analysisResult.length} historical entities.`);
    } catch (error) {
      console.error("Error analyzing text:", error);
      setError("Failed to analyze text. Please try again with different content or shorter text.");
      toast.error("Analysis failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSummarize = async () => {
    if (!longText.trim()) {
      toast.error("Please enter text to summarize first.");
      return;
    }
    
    try {
      setSummarizing(true);
      
      // Call the edge function for summarization
      const { data, error } = await supabase.functions.invoke('analyze-historical-text', {
        body: { 
          text: longText,
          action: "summarize"
        }
      });
      
      if (error) throw new Error(error.message);
      
      if (data && data.summary) {
        setText(data.summary);
        setInputMethod("standard");
        toast.success("Text has been summarized! You can now analyze it.");
      } else {
        throw new Error("No summary returned from the service");
      }
    } catch (error) {
      console.error("Error summarizing text:", error);
      toast.error("Failed to summarize text. Please try again with different content.");
    } finally {
      setSummarizing(false);
    }
  };
  
  // Combine external and internal loading states
  const isLoading = externalLoading || loading || summarizing;
  
  return (
    <div className="text-input-container">
      <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as "standard" | "long")} className="w-full mb-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="standard">Standard Input</TabsTrigger>
          <TabsTrigger value="long">Long Text (with Summarization)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="standard" className="pt-4">
          <Textarea
            placeholder="Enter historical text to analyze... (e.g. 'The Renaissance was a period of European cultural, artistic, political, and scientific rebirth after the Middle Ages...')"
            className="min-h-32 glass border-galaxy-nova/20 focus:border-galaxy-nova/50 transition-all shadow-inner shadow-galaxy-nova/5 mb-4"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </TabsContent>
        
        <TabsContent value="long" className="pt-4">
          <div className="space-y-4">
            <Textarea
              placeholder="Enter very long historical text here... The system will summarize it for analysis."
              className="min-h-60 glass border-galaxy-nova/20 focus:border-galaxy-nova/50 transition-all shadow-inner shadow-galaxy-nova/5"
              value={longText}
              onChange={(e) => setLongText(e.target.value)}
            />
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSummarize} 
                disabled={summarizing || !longText.trim()}
                variant="outline"
                className="border-galaxy-nova/30 hover:border-galaxy-nova/60"
              >
                {summarizing ? (
                  <>Summarizing<span className="loading-dots"></span></>
                ) : (
                  <>
                    Summarize for Analysis
                    <Scissors className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-md text-red-700 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Analysis Error</p>
            <p className="text-sm">{error}</p>
            <p className="text-sm mt-1">
              Try using shorter text, different content, or check if the text contains unsupported languages.
            </p>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => inputMethod === "standard" ? setText("") : setLongText("")}
            disabled={!(inputMethod === "standard" ? text.trim() : longText.trim()) || isLoading}
            className="border-galaxy-nova/30 hover:border-galaxy-nova/60"
          >
            Clear
          </Button>
          <span className="text-xs text-muted-foreground">
            {inputMethod === "standard" ? text.length : longText.length} characters
          </span>
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || !(inputMethod === "standard" ? text.trim() : longText.trim())}
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
      
      {!user && (
        <div className="mt-4 p-2 border border-galaxy-nova/20 rounded-md bg-galaxy-core/10 text-xs text-foreground/80">
          <strong>Note:</strong> You are not currently signed in. Analyzed data will be processed in-memory only and not saved to your account.
          Sign in to save your visualizations.
        </div>
      )}
    </div>
  );
};

export default TextInput;
