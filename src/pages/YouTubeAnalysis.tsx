
import React, { useState, useRef } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import { Loader2, ExternalLink, Youtube, AlertTriangle, FileText, Info } from "lucide-react";
import { toast } from "sonner";
import { 
  fetchYoutubeTranscription, 
  fetchYoutubeCaptions, 
  fetchYoutubeApiCaptions, 
  fetchGeminiTranscription,
  fetchSupadataTranscription,
  analyzeTranscription,
  scrapeYoutubePage
} from "@/services/youtubeService";
import { FormattedHistoricalEntity } from "@/types/supabase";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";

const YouTubeAnalysis = () => {
  // States for the YouTube video and analysis
  const [url, setUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [transcription, setTranscription] = useState<string>("");
  const [entities, setEntities] = useState<FormattedHistoricalEntity[]>([]);
  const [activeTab, setActiveTab] = useState<"video" | "transcription" | "visualization" | "metadata">("video");
  const [error, setError] = useState<string | null>(null);
  const [transcriptionMethod, setTranscriptionMethod] = useState<"standard" | "alternative" | "api" | "gemini" | "scraping" | "supadata">("supadata");
  const [videoMetadata, setVideoMetadata] = useState<any>(null);
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
    setError(null);
    const id = extractVideoId(url);
    if (id) {
      setVideoId(id);
      setTranscription("");
      setEntities([]);
      setVideoMetadata(null);
      setActiveTab("video");
      // Set supadata as the default method
      setTranscriptionMethod("supadata");
      toast.success("YouTube video loaded successfully");
    } else {
      toast.error("Invalid YouTube URL");
      setError("Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=...)");
    }
  };

  // Fetch transcription from YouTube video using Supadata API
  const fetchTranscriptionWithSupadata = async () => {
    if (!videoId) return;
    
    setLoading(true);
    setError(null);
    try {
      const transcriptionText = await fetchSupadataTranscription(videoId);
      
      if (transcriptionText) {
        setTranscription(transcriptionText);
        setActiveTab("transcription");
        toast.success("Transcription fetched successfully using Supadata API");
      } else {
        throw new Error("No transcription received from Supadata API");
      }
    } catch (error) {
      console.error("Error fetching Supadata transcription:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to fetch transcription with Supadata: ${errorMessage}. Trying alternative methods...`);
      toast.error("Supadata transcription failed: " + errorMessage);
      
      // Try scraping instead
      await fetchTranscriptionWithScraping();
    } finally {
      setLoading(false);
    }
  };

  // Fetch transcription from YouTube video using web scraping
  const fetchTranscriptionWithScraping = async () => {
    if (!videoId) return;
    
    setLoading(true);
    setError(null);
    try {
      const scrapedData = await scrapeYoutubePage(videoId);
      
      setVideoMetadata({
        title: scrapedData.title,
        description: scrapedData.description,
        uploadDate: scrapedData.uploadDate,
        viewCount: scrapedData.viewCount,
        channelName: scrapedData.channelName,
        channelId: scrapedData.channelId,
        captionTracks: scrapedData.captionTracks
      });
      
      let transcriptionText = "";
      
      // If we have direct transcription data
      if (scrapedData.transcription && scrapedData.transcription.length > 0) {
        transcriptionText = scrapedData.transcription;
      } 
      // If we have caption tracks, show information about them
      else if (scrapedData.captionTracks && scrapedData.captionTracks.length > 0) {
        transcriptionText = `Available caption tracks:\n\n${
          scrapedData.captionTracks.map((track: any) => 
            `- ${track.name || track.languageCode} (${track.languageCode})${track.isAutoGenerated ? ' (Auto-generated)' : ''}`
          ).join('\n')
        }`;
        
        // If the video has captions, but we couldn't extract them directly,
        // try to fetch the first available caption track
        if (scrapedData.captionTracks[0].baseUrl) {
          try {
            toast.info("Attempting to fetch captions using the first available track...");
            const captionResponse = await fetch(scrapedData.captionTracks[0].baseUrl);
            if (captionResponse.ok) {
              const captionsXml = await captionResponse.text();
              transcriptionText = parseXmlCaptions(captionsXml);
            }
          } catch (captionError) {
            console.error("Error fetching captions from track:", captionError);
          }
        }
      } 
      // If no transcription or captions found, try Gemini as fallback
      else {
        toast.info("No transcription found in page, trying Gemini API...");
        setTranscriptionMethod("gemini");
        try {
          transcriptionText = await fetchGeminiTranscription(videoId);
        } catch (geminiError) {
          console.error("Gemini fallback also failed:", geminiError);
          throw new Error("Could not find or generate any transcription for this video");
        }
      }
      
      setTranscription(transcriptionText);
      setActiveTab("transcription");
      toast.success("Information fetched successfully");
    } catch (error) {
      console.error("Error scraping YouTube page:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to scrape YouTube page: ${errorMessage}. Trying alternative methods...`);
      toast.error("Scraping failed: " + errorMessage);
      
      // Try alternative methods
      await fetchTranscription();
    } finally {
      setLoading(false);
    }
  };

  // Fetch transcription from YouTube video using previous methods
  const fetchTranscription = async () => {
    if (!videoId) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log(`Fetching transcription for video ID: ${videoId}`);
      console.log(`Using ${transcriptionMethod} method`);
      
      let transcriptionText = "";
      
      switch (transcriptionMethod) {
        case "supadata":
          try {
            transcriptionText = await fetchSupadataTranscription(videoId);
          } catch (error) {
            console.error("Supadata method failed:", error);
            setTranscriptionMethod("scraping");
            toast.info("Supadata method failed, trying scraping method...");
            await fetchTranscriptionWithScraping();
            return;
          }
          break;
          
        case "scraping":
          await fetchTranscriptionWithScraping();
          return;
          
        case "gemini":
          try {
            transcriptionText = await fetchGeminiTranscription(videoId);
          } catch (error) {
            console.error("Gemini method failed:", error);
            // If Gemini fails, try the standard method
            setTranscriptionMethod("standard");
            toast.info("Gemini method failed, trying standard method...");
            try {
              transcriptionText = await fetchYoutubeTranscription(videoId);
            } catch (standardError) {
              console.error("Standard method also failed, trying alternative:", standardError);
              setTranscriptionMethod("alternative");
              toast.info("Trying alternative method for captions...");
              try {
                transcriptionText = await fetchYoutubeCaptions(videoId);
              } catch (altError) {
                console.error("Alternative method also failed, trying API:", altError);
                setTranscriptionMethod("api");
                toast.info("Trying API captions method as last resort...");
                
                const { data, error } = await supabase.functions.invoke("get-youtube-api-captions", {
                  body: { videoId }
                });
                
                if (error) throw new Error(`Function error: ${error.message}`);
                
                if (data && data.captions && data.captions.length > 0) {
                  transcriptionText = `Available caption tracks:\n\n${
                    data.captions.map((caption: any) => 
                      `- ${caption.name} (${caption.language})${caption.isAutoGenerated ? ' (Auto-generated)' : ''}`
                    ).join('\n')
                  }`;
                } else {
                  throw new Error("No captions found for this video");
                }
              }
            }
          }
          break;
          
        case "api":
          try {
            console.log("Using API captions method");
            const { data, error } = await supabase.functions.invoke("get-youtube-api-captions", {
              body: { videoId }
            });
            
            if (error) throw new Error(`Function error: ${error.message}`);
            
            console.log("Received captions data:", data);
            
            if (data && data.captions && data.captions.length > 0) {
              // For now, just display the captions info since we don't get full transcript
              transcriptionText = `Available caption tracks:\n\n${
                data.captions.map((caption: any) => 
                  `- ${caption.name} (${caption.language})${caption.isAutoGenerated ? ' (Auto-generated)' : ''}`
                ).join('\n')
              }`;
            } else {
              throw new Error("No captions found for this video");
            }
          } catch (apiError) {
            console.error("API captions method failed:", apiError);
            throw apiError;
          }
          break;
          
        case "alternative":
          // Use the alternative captions endpoint
          transcriptionText = await fetchYoutubeCaptions(videoId);
          break;
          
        case "standard":
        default:
          // Use the original transcription endpoint
          try {
            transcriptionText = await fetchYoutubeTranscription(videoId);
          } catch (mainError) {
            console.error("Error with main method, trying fallback:", mainError);
            setTranscriptionMethod("alternative");
            toast.info("Trying alternative method to fetch captions...");
            try {
              transcriptionText = await fetchYoutubeCaptions(videoId);
            } catch (fallbackError) {
              console.error("Fallback method also failed, trying Gemini:", fallbackError);
              setTranscriptionMethod("gemini");
              toast.info("Trying Gemini AI to extract transcription...");
              try {
                transcriptionText = await fetchGeminiTranscription(videoId);
              } catch (geminiError) {
                console.error("Gemini method also failed, trying API captions:", geminiError);
                setTranscriptionMethod("api");
                toast.info("Trying API captions method as last resort...");
                
                const { data, error } = await supabase.functions.invoke("get-youtube-api-captions", {
                  body: { videoId }
                });
                
                if (error) throw new Error(`Function error: ${error.message}`);
                
                if (data && data.captions && data.captions.length > 0) {
                  // For now, just display the captions info since we don't get full transcript
                  transcriptionText = `Available caption tracks:\n\n${
                    data.captions.map((caption: any) => 
                      `- ${caption.name} (${caption.language})${caption.isAutoGenerated ? ' (Auto-generated)' : ''}`
                    ).join('\n')
                  }`;
                } else {
                  throw new Error("No captions found for this video");
                }
              }
            }
          }
          break;
      }
      
      setTranscription(transcriptionText);
      setActiveTab("transcription");
      toast.success("Transcription fetched successfully");
    } catch (error) {
      console.error("Error fetching transcription:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to fetch transcription: ${errorMessage}. Please try another method or video.`);
      toast.error("Failed to fetch transcription: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Toggle between transcription methods
  const toggleTranscriptionMethod = () => {
    const methods = ["supadata", "scraping", "gemini", "standard", "alternative", "api"] as const;
    const currentIndex = methods.indexOf(transcriptionMethod as any);
    const nextIndex = (currentIndex + 1) % methods.length;
    const newMethod = methods[nextIndex] as any;
    
    setTranscriptionMethod(newMethod);
    toast.info(`Using ${newMethod} transcription method`);
  };

  // Analyze transcription to extract historical entities
  const handleAnalyzeTranscription = async () => {
    if (!transcription) {
      toast.error("No transcription to analyze");
      return;
    }
    
    setAnalyzing(true);
    setError(null);
    try {
      console.log(`Analyzing transcription of length: ${transcription.length}`);
      const extractedEntities = await analyzeTranscription(transcription);
      
      if (extractedEntities.length > 0) {
        setEntities(extractedEntities);
        setActiveTab("visualization");
        toast.success(`Analysis complete: ${extractedEntities.length} entities found`);
      } else {
        toast.warning("No significant entities found in the transcription");
        setError("No significant historical entities were found in this transcription.");
      }
    } catch (error) {
      console.error("Error analyzing transcription:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to analyze transcription: ${errorMessage}`);
      toast.error("Failed to analyze transcription: " + errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  // Parse XML captions to extract text
  const parseXmlCaptions = (xml: string): string => {
    const textSegments: string[] = [];
    const regex = /<text[^>]*>([\s\S]*?)<\/text>/g;
    let match;
    
    while ((match = regex.exec(xml)) !== null) {
      let text = match[1];
      
      // Replace HTML entities
      text = text.replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'");
      
      if (text.trim()) {
        textSegments.push(text.trim());
      }
    }
    
    return textSegments.join(' ');
  };

  return (
    <MainLayout>
      <div className="container max-w-7xl py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-galaxy-star via-galaxy-nova to-galaxy-blue-giant bg-clip-text text-transparent mb-4">YouTube Video Analysis</h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Extract historical knowledge and relationships from educational videos.
          </p>
        </div>

        <Separator className="mb-10 bg-gradient-to-r from-galaxy-nova/20 via-galaxy-blue-giant/20 to-aurora-purple/20 h-0.5 rounded-full" />
      
        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-4 border border-destructive/30 backdrop-blur-sm bg-destructive/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* URL Input Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="backdrop-blur-lg bg-black/30 border border-galaxy-nova/30 shadow-xl shadow-galaxy-nova/10 p-6 rounded-lg relative overflow-hidden">
            {/* Glowing Orb Top Right */}
            <div className="absolute top-0 right-0 -m-10 w-40 h-40 bg-galaxy-nova/20 rounded-full blur-2xl pointer-events-none"></div>
            {/* Glowing Orb Bottom Left */}
            <div className="absolute bottom-0 left-0 -m-10 w-40 h-40 bg-galaxy-blue-giant/20 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex gap-2 relative z-10">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
                className="flex-1 bg-black/50 border-galaxy-nova/30 focus:border-galaxy-nova/60 text-foreground"
                required
              />
              <Button 
                type="submit" 
                disabled={!url}
                className="nebula-button"
              >
                Load Video
              </Button>
            </div>
          </div>
        </form>
        
        {/* Tabs for Video, Transcription, and Visualization */}
        {videoId && (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-black/30 backdrop-blur-sm border border-galaxy-nova/20 p-1 rounded-lg">
              <TabsTrigger 
                value="video"
                className="data-[state=active]:bg-galaxy-nova/20 data-[state=active]:backdrop-blur-md data-[state=active]:text-foreground data-[state=active]:border-galaxy-nova/30 border border-transparent"
              >
                Video
              </TabsTrigger>
              <TabsTrigger 
                value="transcription"
                className="data-[state=active]:bg-galaxy-nova/20 data-[state=active]:backdrop-blur-md data-[state=active]:text-foreground data-[state=active]:border-galaxy-nova/30 border border-transparent"
              >
                Transcription
              </TabsTrigger>
              <TabsTrigger 
                value="visualization"
                className="data-[state=active]:bg-galaxy-nova/20 data-[state=active]:backdrop-blur-md data-[state=active]:text-foreground data-[state=active]:border-galaxy-nova/30 border border-transparent"
              >
                Visualization
              </TabsTrigger>
              <TabsTrigger 
                value="metadata"
                className="data-[state=active]:bg-galaxy-nova/20 data-[state=active]:backdrop-blur-md data-[state=active]:text-foreground data-[state=active]:border-galaxy-nova/30 border border-transparent"
              >
                Metadata
              </TabsTrigger>
            </TabsList>
            
            {/* Video Tab */}
            <TabsContent value="video" className="space-y-4">
              <Card className="bg-gradient-to-br from-background/90 to-background/60 backdrop-blur-sm border border-galaxy-nova/30 shadow-xl shadow-galaxy-nova/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Youtube className="h-5 w-5 text-galaxy-nova" /> YouTube Video
                  </CardTitle>
                  <CardDescription className="text-foreground/70">
                    Watch the video and then fetch its transcription for analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div ref={videoContainerRef} className="relative aspect-video w-full overflow-hidden rounded-md border border-galaxy-nova/20">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute top-0 left-0 w-full h-full"
                    ></iframe>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between flex-wrap gap-2">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')}
                      className="border-galaxy-nova/30 hover:border-galaxy-nova/60 text-foreground/90 hover:text-foreground hover:bg-galaxy-nova/5"
                    >
                      Open in YouTube <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={toggleTranscriptionMethod}
                      className="border-galaxy-nova/30 hover:border-galaxy-nova/60 text-foreground/90 hover:text-foreground hover:bg-galaxy-nova/5"
                    >
                      {`Using ${transcriptionMethod} method`}
                    </Button>
                  </div>
                  <Button 
                    onClick={
                      transcriptionMethod === "scraping" 
                        ? fetchTranscriptionWithScraping 
                        : transcriptionMethod === "supadata" 
                          ? fetchTranscriptionWithSupadata
                          : fetchTranscription
                    } 
                    disabled={loading}
                    className="nebula-button"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {transcriptionMethod === "scraping" 
                          ? "Scraping..." 
                          : transcriptionMethod === "supadata" 
                            ? "Fetching from Supadata..." 
                            : "Fetching..."}
                      </>
                    ) : (
                      transcriptionMethod === "scraping" 
                        ? "Scrape Video Info" 
                        : transcriptionMethod === "supadata" 
                          ? "Fetch with Supadata API" 
                          : "Fetch Transcription"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Transcription Tab */}
            <TabsContent value="transcription" className="space-y-4">
              <Card className="bg-gradient-to-br from-background/90 to-background/60 backdrop-blur-sm border border-galaxy-nova/30 shadow-xl shadow-galaxy-nova/10">
                <CardHeader>
                  <CardTitle className="text-foreground">Video Transcription</CardTitle>
                  <CardDescription className="text-foreground/70">
                    Review the transcription and analyze it to extract knowledge entities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 text-sm text-foreground/60">
                    Fetched using the <span className="font-semibold text-galaxy-nova">{transcriptionMethod}</span> method
                  </div>
                  <Textarea 
                    value={transcription} 
                    onChange={(e) => setTranscription(e.target.value)}
                    placeholder="Transcription will appear here..."
                    className="min-h-[300px] font-mono text-sm bg-black/50 border-galaxy-nova/30 focus:border-galaxy-nova/60"
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleAnalyzeTranscription} 
                    disabled={!transcription || analyzing} 
                    className="ml-auto nebula-button"
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
              <Card className="bg-gradient-to-br from-background/90 to-background/60 backdrop-blur-sm border border-galaxy-nova/30 shadow-xl shadow-galaxy-nova/10">
                <CardHeader>
                  <CardTitle className="text-foreground">Knowledge Graph</CardTitle>
                  <CardDescription className="text-foreground/70">
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
                    <div className="flex flex-col items-center justify-center h-[500px] text-foreground/50">
                      <p>No visualization data available yet.</p>
                      <p className="text-sm mt-2">Analyze the transcription to generate a knowledge graph.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Metadata Tab */}
            <TabsContent value="metadata" className="space-y-4">
              <Card className="bg-gradient-to-br from-background/90 to-background/60 backdrop-blur-sm border border-galaxy-nova/30 shadow-xl shadow-galaxy-nova/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <FileText className="h-5 w-5 text-galaxy-nova" /> Video Metadata
                  </CardTitle>
                  <CardDescription className="text-foreground/70">
                    Additional information scraped from the YouTube video page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {videoMetadata ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1 text-foreground">{videoMetadata.title}</h3>
                        <p className="text-sm text-foreground/60">
                          Uploaded by {videoMetadata.channelName} • {videoMetadata.uploadDate}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground/90">Description</h4>
                        <div className="bg-black/30 backdrop-blur-sm border border-galaxy-nova/20 rounded-md p-3 whitespace-pre-wrap text-sm text-foreground/70">
                          {videoMetadata.description || "No description available"}
                        </div>
                      </div>
                      
                      {videoMetadata.captionTracks && videoMetadata.captionTracks.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-foreground/90">Available Captions</h4>
                          <div className="bg-black/30 backdrop-blur-sm border border-galaxy-nova/20 rounded-md p-3">
                            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/70">
                              {videoMetadata.captionTracks.map((track: any, index: number) => (
                                <li key={index}>
                                  {track.name || track.languageCode} ({track.languageCode})
                                  {track.isAutoGenerated ? ' (Auto-generated)' : ''}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-foreground/50">
                      <Info className="h-12 w-12 mb-4 opacity-50" />
                      <p>No metadata available yet.</p>
                      <p className="text-sm mt-2">Use the scraping method to fetch video metadata.</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={fetchTranscriptionWithScraping} 
                    disabled={loading} 
                    variant="outline"
                    className="ml-auto border-galaxy-nova/30 hover:border-galaxy-nova/60 text-foreground/90 hover:text-foreground hover:bg-galaxy-nova/5"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      "Refresh Metadata"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
        
        {/* Initial state when no video is loaded */}
        {!videoId && (
          <Card className="mt-6 bg-gradient-to-br from-background/90 to-background/60 backdrop-blur-sm border border-galaxy-nova/30 shadow-xl shadow-galaxy-nova/10">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-galaxy-nova to-galaxy-blue-giant flex items-center justify-center mb-4">
                <Youtube className="h-8 w-8 text-background" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">No Video Loaded</h3>
              <p className="text-foreground/70 text-center max-w-md">
                Enter a YouTube URL above to start. The tool will use Supadata API to fetch the transcription
                and analyze it to create a knowledge graph of concepts and relationships.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default YouTubeAnalysis;
