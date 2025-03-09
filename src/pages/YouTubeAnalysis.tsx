
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import { FormattedHistoricalEntity } from "@/types/supabase";
import { extractYoutubeVideoId, fetchTranscript, getVideoDetails } from "@/services/youtubeService";
import { analyzeHistoricalText } from "@/services/historicalDataService";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Youtube, Search } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ElementCard from "@/components/ElementCard";
import VisualizationPlaceholder from "@/components/VisualizationPlaceholder";

const YouTubeAnalysis = () => {
  const [url, setUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoDetails, setVideoDetails] = useState<any>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [isLoadingTranscript, setIsLoadingTranscript] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [entities, setEntities] = useState<FormattedHistoricalEntity[]>([]);
  const [activeTab, setActiveTab] = useState<string>("video");
  const [selectedEntity, setSelectedEntity] = useState<FormattedHistoricalEntity | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    // Clear previous data when URL changes
    if (videoId) {
      setVideoId(null);
      setVideoDetails(null);
      setTranscript("");
    }
  };

  const fetchVideoTranscript = async () => {
    const extractedId = extractYoutubeVideoId(url);
    
    if (!extractedId) {
      toast.error("Invalid YouTube URL. Please enter a valid YouTube video URL.");
      return;
    }

    setIsLoadingTranscript(true);
    setVideoId(extractedId);
    
    try {
      // Get video details (title, thumbnail, etc.)
      const details = await getVideoDetails(extractedId);
      setVideoDetails(details);
      
      // Get transcript
      const transcriptText = await fetchTranscript(extractedId);
      setTranscript(transcriptText);
      
      if (transcriptText) {
        toast.success("Transcript fetched successfully!");
        setActiveTab("transcript");
      } else {
        toast.error("Could not retrieve transcript. The video might not have captions.");
      }
    } catch (error) {
      console.error("Error processing video:", error);
      toast.error("Failed to process video.");
    } finally {
      setIsLoadingTranscript(false);
    }
  };

  const analyzeTranscript = async () => {
    if (!transcript) {
      toast.error("No transcript to analyze. Please fetch a video transcript first.");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Use existing historical data service to analyze text
      const analysisResult = await analyzeHistoricalText(transcript);
      setEntities(analysisResult);
      toast.success(`Analysis complete! Found ${analysisResult.length} entities.`);
      setActiveTab("visualization");
    } catch (error) {
      console.error("Error analyzing transcript:", error);
      toast.error("Failed to analyze transcript.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEntitySelect = (entity: FormattedHistoricalEntity) => {
    setSelectedEntity(entity);
    
    // Highlight mentions in transcript
    if (transcriptRef.current && entity.name) {
      const content = transcriptRef.current.innerHTML;
      const regex = new RegExp(`(${entity.name})`, 'gi');
      transcriptRef.current.innerHTML = content.replace(
        regex, 
        '<span class="bg-primary/20 rounded px-1">$1</span>'
      );
    }
  };

  const closeDetailsCard = () => {
    setSelectedEntity(null);
    
    // Remove highlights
    if (transcriptRef.current) {
      const content = transcriptRef.current.innerHTML;
      transcriptRef.current.innerHTML = content.replace(
        /<span class="bg-primary\/20 rounded px-1">(.*?)<\/span>/g, 
        '$1'
      );
    }
  };

  const visualizeInFullPage = () => {
    if (entities.length > 0) {
      // Store entities in sessionStorage to access them in the Visualize page
      sessionStorage.setItem('analyzedEntities', JSON.stringify(entities));
      sessionStorage.setItem('analyzedText', transcript);
      navigate('/visualize');
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">YouTube Video Analysis</h1>
          <p className="text-muted-foreground">
            Enter a YouTube video URL to extract its transcript and analyze the content for historical connections.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-grow">
            <Input
              placeholder="Enter YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
              value={url}
              onChange={handleUrlChange}
              className="border-galaxy-nova/20 focus:border-galaxy-nova/50"
            />
          </div>
          <Button 
            onClick={fetchVideoTranscript} 
            disabled={isLoadingTranscript || !url}
            className="cosmic-button group"
          >
            {isLoadingTranscript ? (
              <>Loading<span className="loading-dots"></span></>
            ) : (
              <>
                <Youtube className="mr-2 h-4 w-4" />
                Get Transcript
              </>
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="transcript" disabled={!transcript}>Transcript</TabsTrigger>
            <TabsTrigger value="visualization" disabled={entities.length === 0}>Visualization</TabsTrigger>
          </TabsList>

          <TabsContent value="video" className="mt-4">
            <Card className="p-4 border-galaxy-nova/20">
              {videoId ? (
                <div className="flex flex-col space-y-4">
                  <h2 className="text-xl font-medium">
                    {videoDetails?.title || "Loading video details..."}
                  </h2>
                  <div className="aspect-video w-full overflow-hidden rounded-lg">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  {videoDetails && (
                    <div className="text-sm text-muted-foreground">
                      <p>Channel: {videoDetails.channelTitle}</p>
                      <p>Published: {new Date(videoDetails.publishedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              ) : (
                <VisualizationPlaceholder type="video" />
              )}
            </Card>
          </TabsContent>

          <TabsContent value="transcript" className="mt-4">
            <Card className="p-4 border-galaxy-nova/20">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-medium">Video Transcript</h2>
                <Button 
                  onClick={analyzeTranscript} 
                  disabled={isAnalyzing || !transcript}
                  className="cosmic-button group"
                >
                  {isAnalyzing ? (
                    <>Analyzing<span className="loading-dots"></span></>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Analyze Content
                    </>
                  )}
                </Button>
              </div>
              
              {isLoadingTranscript ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[95%]" />
                  <Skeleton className="h-4 w-[85%]" />
                </div>
              ) : transcript ? (
                <div 
                  ref={transcriptRef}
                  className="max-h-[500px] overflow-y-auto p-4 border border-galaxy-nova/10 rounded-md bg-background/50"
                >
                  {transcript.split('\n').map((line, index) => (
                    <p key={index} className="mb-2">{line}</p>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed rounded-md border-galaxy-nova/20">
                  <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p>No transcript available. Please enter a YouTube URL and click "Get Transcript".</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="visualization" className="mt-4">
            <Card className="p-4 border-galaxy-nova/20">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-medium">Knowledge Graph</h2>
                <Button 
                  onClick={visualizeInFullPage} 
                  disabled={entities.length === 0}
                  variant="outline"
                  className="border-galaxy-nova/30 hover:border-galaxy-nova/60"
                >
                  Open in Full Visualizer
                </Button>
              </div>
              
              <div className="min-h-[600px] relative">
                {entities.length > 0 ? (
                  <>
                    <KnowledgeGraph
                      entities={entities}
                      onEntitySelect={handleEntitySelect}
                    />
                    
                    {selectedEntity && (
                      <div className="absolute bottom-4 right-4 w-72 z-20">
                        <ElementCard 
                          entity={selectedEntity} 
                          onClose={closeDetailsCard} 
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 text-center border border-dashed rounded-md border-galaxy-nova/20">
                    <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p>No visualization data available. Please analyze the transcript first.</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default YouTubeAnalysis;
