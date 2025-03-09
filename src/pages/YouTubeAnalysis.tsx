
import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import { Loader2, ExternalLink, Youtube } from "lucide-react";
import { toast } from "sonner";
import { fetchYoutubeTranscription, analyzeTranscription } from "@/services/youtubeService";
import { FormattedHistoricalEntity } from "@/types/supabase";

const YouTubeAnalysis = () => {
  // States for the YouTube video and analysis
  const [url, setUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<string>("");
  const [entities, setEntities] = useState<FormattedHistoricalEntity[]>([]);
  const [activeTab, setActiveTab] = useState<"video" | "transcription" | "visualization">("video");
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Function to extract video ID from YouTube URL
  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Handle URL submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(url);
    if (id) {
      setVideoId(id);
      setTranscription("");
      setEntities([]);
      setActiveTab("video");
      toast.success("YouTube video loaded successfully");
    } else {
      toast.error("Invalid YouTube URL");
    }
  };

  // Fetch transcription from YouTube video
  const fetchTranscription = async () => {
    if (!videoId) return;
    
    setLoading(true);
    try {
      const transcriptionText = await fetchYoutubeTranscription(videoId);
      setTranscription(transcriptionText);
      setActiveTab("transcription");
      toast.success("Transcription fetched successfully");
    } catch (error) {
      console.error("Error fetching transcription:", error);
      toast.error("Failed to fetch transcription: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Analyze transcription to extract historical entities
  const handleAnalyzeTranscription = async () => {
    if (!transcription) {
      toast.error("No transcription to analyze");
      return;
    }
    
    setAnalyzing(true);
    try {
      const extractedEntities = await analyzeTranscription(transcription);
      
      if (extractedEntities.length > 0) {
        setEntities(extractedEntities);
        setActiveTab("visualization");
        toast.success(`Analysis complete: ${extractedEntities.length} entities found`);
      } else {
        toast.warning("No significant entities found in the transcription");
      }
    } catch (error) {
      console.error("Error analyzing transcription:", error);
      toast.error("Failed to analyze transcription: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 text-white">YouTube Video Analysis</h1>
      
      {/* URL Input Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
          className="flex-1"
          required
        />
        <Button type="submit" disabled={!url}>Load Video</Button>
      </form>
      
      {/* Tabs for Video, Transcription, and Visualization */}
      {videoId && (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="transcription">Transcription</TabsTrigger>
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
          </TabsList>
          
          {/* Video Tab */}
          <TabsContent value="video" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Youtube className="h-5 w-5" /> YouTube Video
                </CardTitle>
                <CardDescription>
                  Watch the video and then fetch its transcription for analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div ref={videoContainerRef} className="relative aspect-video w-full overflow-hidden rounded-md">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full"
                  ></iframe>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}
                >
                  Open in YouTube <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  onClick={fetchTranscription} 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    "Fetch Transcription"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Transcription Tab */}
          <TabsContent value="transcription" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Video Transcription</CardTitle>
                <CardDescription>
                  Review the transcription and analyze it to extract knowledge entities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={transcription} 
                  onChange={(e) => setTranscription(e.target.value)}
                  placeholder="Transcription will appear here..."
                  className="min-h-[300px] font-mono text-sm"
                />
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleAnalyzeTranscription} 
                  disabled={!transcription || analyzing} 
                  className="ml-auto"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Transcription"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Visualization Tab */}
          <TabsContent value="visualization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Graph</CardTitle>
                <CardDescription>
                  Visual representation of entities and connections from the video
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[600px] relative">
                {entities.length > 0 ? (
                  <KnowledgeGraph 
                    entities={entities} 
                    onEntitySelect={(entity) => {
                      toast.info(`Selected: ${entity.name}`);
                    }} 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
                    <p>No visualization data available yet.</p>
                    <p className="text-sm mt-2">Analyze the transcription to generate a knowledge graph.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Initial state when no video is loaded */}
      {!videoId && (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Youtube className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Video Loaded</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Enter a YouTube URL above to start. The tool will extract the transcription
              and analyze it to create a knowledge graph of concepts and relationships.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default YouTubeAnalysis;
