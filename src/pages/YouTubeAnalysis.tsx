
import React, { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Play, 
  Search, 
  Clock, 
  Calendar, 
  User, 
  Eye, 
  Loader2,
  ListChecks,
  BookOpen,
  MessageSquare,
  Languages,
  Subtitles,
  Edit,
  Check,
  X
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HistoricalEntity, FormattedHistoricalEntity } from "@/types/supabase";
import { fetchVideoInfo, fetchTranscription, analyzeYouTubeContent } from "@/services/youtubeService";
import { getYouTubeIdFromUrl } from "@/utils/utils";
import CosmicVisualization from "@/components/CosmicVisualization";
import Timeline from "@/components/Timeline";
import HistoricalFactsList from "@/components/HistoricalFactsList";
import StorytellingSection from "@/components/StorytellingSection";
import ElementCard from "@/components/ElementCard";
import ThemeList from "@/components/ThemeList";
import KeyPointsList from "@/components/KeyPointsList";
import { useAuth } from "@/hooks/useAuth";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TranscriptionOptions } from "@/types/supabase";

interface TranscriptionMethodSelectorProps {
  useAutoCaption: boolean;
  onChange: (useAuto: boolean) => void;
}

const TranscriptionMethodSelector: React.FC<TranscriptionMethodSelectorProps> = ({ 
  useAutoCaption, 
  onChange 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id="use-auto-caption" 
        checked={useAutoCaption}
        onCheckedChange={(checked) => onChange(checked as boolean)}
      />
      <Label 
        htmlFor="use-auto-caption" 
        className="text-sm cursor-pointer flex items-center gap-1.5"
      >
        <Subtitles className="h-4 w-4" /> 
        Use auto-generated captions
      </Label>
    </div>
  );
};

const YouTubeAnalysis: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<string>("");
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [isLoadingTranscription, setIsLoadingTranscription] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [entities, setEntities] = useState<FormattedHistoricalEntity[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [themes, setThemes] = useState<string[]>([]);
  const [keyPoints, setKeyPoints] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<FormattedHistoricalEntity | null>(null);
  const [visualizationType, setVisualizationType] = useState<"graph" | "timeline" | "story">("graph");
  const [transcriptionMethod, setTranscriptionMethod] = useState<string>("supadata");
  const [captionLanguage, setCaptionLanguage] = useState<string>("");
  const [isAutoGeneratedCaption, setIsAutoGeneratedCaption] = useState<boolean>(false);
  const [useAutoCaption, setUseAutoCaption] = useState<boolean>(false);
  const { user } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(e.target.value);
  };

  const fetchVideoDetails = async () => {
    const extractedId = getYouTubeIdFromUrl(youtubeUrl);
    
    if (!extractedId) {
      toast.error("Invalid YouTube URL. Please enter a valid YouTube video URL.");
      return;
    }

    setVideoId(extractedId);
    setIsLoadingTranscription(true);
    setVideoInfo(null);
    setTranscription("");
    setEntities([]);
    setSummary("");
    setThemes([]);
    
    try {
      // Fetch video info
      const info = await fetchVideoInfo(extractedId);
      if (!info) {
        toast.error("Failed to fetch video information. Please try again.");
        setIsLoadingTranscription(false);
        return;
      }
      setVideoInfo(info);
      
      // Fetch transcription
      const options: TranscriptionOptions = { useAutoCaption };
      const transcriptionData = await fetchTranscription(extractedId, options);
      
      if (transcriptionData.error) {
        toast.error(`Transcription error: ${transcriptionData.error}`);
        setIsLoadingTranscription(false);
        return;
      }
      
      if (!transcriptionData.transcription) {
        toast.error("No transcription available for this video.");
        setIsLoadingTranscription(false);
        return;
      }
      
      setTranscription(transcriptionData.transcription);
      setCaptionLanguage(transcriptionData.language || "unknown");
      setIsAutoGeneratedCaption(transcriptionData.isAutoGenerated || false);
      
      toast.success(`Transcription loaded${transcriptionData.isAutoGenerated ? " (auto-generated)" : ""}`);
    } catch (error) {
      console.error("Error fetching video details:", error);
      toast.error(`Failed to load video: ${error}`);
    } finally {
      setIsLoadingTranscription(false);
    }
  };

  const analyzeContent = async () => {
    if (!videoId || !transcription) {
      toast.error("Please fetch a video transcription first.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await analyzeYouTubeContent(videoId, transcription);
      
      if (result.error) {
        toast.error(`Analysis error: ${result.error}`);
        setIsAnalyzing(false);
        return;
      }
      
      if (result.entities) {
        setEntities(result.entities as FormattedHistoricalEntity[]);
      }
      
      if (result.summary) {
        setSummary(result.summary);
      }
      
      if (result.themes) {
        setThemes(result.themes);
      }
      
      if (result.keyPoints) {
        setKeyPoints(result.keyPoints);
      }
      
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(`Failed to analyze content: ${error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEntitySelect = (entity: FormattedHistoricalEntity) => {
    setSelectedEntity(entity);
  };

  const closeEntityDetails = () => {
    setSelectedEntity(null);
  };

  const updateEntities = (updatedEntities: FormattedHistoricalEntity[]) => {
    setEntities(updatedEntities);
  };

  const deleteEntity = (entityId: string) => {
    const updatedEntities = entities.filter(e => e.id !== entityId);
    setEntities(updatedEntities);
    setSelectedEntity(null);
    toast.success("Entity deleted");
  };

  const refreshTranscription = async () => {
    if (!videoId) return;
    
    setIsLoadingTranscription(true);
    
    try {
      const options: TranscriptionOptions = { useAutoCaption };
      const transcriptionData = await fetchTranscription(videoId, options);
      
      if (transcriptionData.error) {
        toast.error(`Transcription error: ${transcriptionData.error}`);
        return;
      }
      
      if (transcriptionData.transcription) {
        setTranscription(transcriptionData.transcription);
        setCaptionLanguage(transcriptionData.language || "unknown");
        setIsAutoGeneratedCaption(transcriptionData.isAutoGeneratedCaption || false);
        toast.success("Transcription refreshed");
      } else {
        toast.error("No transcription found");
      }
    } catch (error) {
      toast.error(`Failed to refresh transcription: ${error}`);
    } finally {
      setIsLoadingTranscription(false);
    }
  };

  const changeTranscriptionMethod = async (method: string) => {
    if (!videoId) return;
    
    setTranscriptionMethod(method);
    setIsLoadingTranscription(true);
    
    try {
      let transcriptionData;
      
      if (method === "supadata") {
        const options: TranscriptionOptions = { useAutoCaption };
        transcriptionData = await fetchTranscription(videoId, options);
      } else {
        // Legacy method (direct scraping)
        transcriptionData = { transcription: "", error: "Method no longer supported" };
      }
      
      if (transcriptionData.error) {
        toast.error(`Transcription error: ${transcriptionData.error}`);
        return;
      }
      
      if (transcriptionData.transcription) {
        setTranscription(transcriptionData.transcription);
        setCaptionLanguage(transcriptionData.language || "unknown");
        setIsAutoGeneratedCaption(transcriptionData.isAutoGeneratedCaption || false);
        toast.success(`Switched to ${method} transcription`);
      } else {
        toast.error("No transcription found with this method");
      }
    } catch (error) {
      toast.error(`Failed to change transcription method: ${error}`);
    } finally {
      setIsLoadingTranscription(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-galaxy-star via-galaxy-nova to-galaxy-blue-giant bg-clip-text text-transparent mb-3">
            YouTube History Analysis
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Analyze historical content in YouTube videos. Enter a YouTube URL to extract and analyze the transcription.
          </p>
        </div>

        <Card className="mb-8 overflow-hidden border-galaxy-nova/20 shadow-xl shadow-galaxy-nova/5 bg-black/30 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle>Video Analysis</CardTitle>
            <CardDescription>
              Enter a YouTube video URL to extract and analyze its historical content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
                    className="pl-9"
                    value={youtubeUrl}
                    onChange={handleInputChange}
                  />
                </div>
                <Button 
                  onClick={fetchVideoDetails} 
                  disabled={isLoadingTranscription || !youtubeUrl}
                  className="min-w-[120px]"
                >
                  {isLoadingTranscription ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Get Video
                    </>
                  )}
                </Button>
              </div>
              
              <TranscriptionMethodSelector
                useAutoCaption={useAutoCaption}
                onChange={setUseAutoCaption}
              />
            </div>
          </CardContent>
        </Card>

        {videoInfo && (
          <Card className="mb-8 overflow-hidden border-galaxy-nova/20 shadow-xl shadow-galaxy-nova/5 bg-black/30 backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-[300px,1fr] gap-0">
              <div className="aspect-video overflow-hidden relative">
                <img
                  src={videoInfo.thumbnails?.high?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                  alt={videoInfo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank")}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Watch on YouTube
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{videoInfo.title}</h2>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="mr-1 h-4 w-4" />
                    {videoInfo.channelTitle}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    {new Date(videoInfo.publishedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    {videoInfo.duration}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Eye className="mr-1 h-4 w-4" />
                    {parseInt(videoInfo.viewCount).toLocaleString()} views
                  </div>
                </div>
                
                {transcription && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex gap-1 items-center">
                          <Languages className="h-3 w-3" />
                          Language: {captionLanguage || "Unknown"}
                        </Badge>
                        <Badge variant="outline" className="flex gap-1 items-center">
                          <Subtitles className="h-3 w-3" />
                          {isAutoGeneratedCaption ? "Auto-generated" : "Manual captions"}
                        </Badge>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={refreshTranscription}
                        disabled={isLoadingTranscription}
                      >
                        {isLoadingTranscription ? <Loader2 className="h-3 w-3 animate-spin" /> : <Clock className="h-3 w-3" />}
                        <span className="ml-1">Refresh</span>
                      </Button>
                    </div>
                    
                    <div className="h-32 overflow-y-auto border border-border/20 rounded-md bg-black/20 p-2 text-xs text-muted-foreground">
                      {transcription.split("\n").map((line, index) => (
                        <div key={index} className="mb-1">{line}</div>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button 
                        onClick={analyzeContent} 
                        disabled={isAnalyzing}
                        className="min-w-[150px]"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" />
                            Analyze Content
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {entities.length > 0 && summary && (
          <div className="space-y-8">
            <Card className="overflow-hidden border-galaxy-nova/20 shadow-xl shadow-galaxy-nova/5 bg-black/30 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                  Historical content extracted from "{videoInfo?.title}"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-black/20 rounded-md p-4 border border-galaxy-nova/10">
                  <h3 className="text-base font-medium mb-2 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-galaxy-nova" />
                    <span>Summary</span>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
                </div>
                
                {themes.length > 0 && (
                  <div className="bg-black/20 rounded-md p-4 border border-galaxy-nova/10">
                    <h3 className="text-base font-medium mb-2 flex items-center gap-1.5">
                      <ListChecks className="h-4 w-4 text-galaxy-nova" />
                      <span>Key Themes</span>
                    </h3>
                    <ThemeList themes={themes} />
                  </div>
                )}
                
                {keyPoints.length > 0 && (
                  <div className="bg-black/20 rounded-md p-4 border border-galaxy-nova/10">
                    <h3 className="text-base font-medium mb-2 flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-galaxy-nova" />
                      <span>Key Points</span>
                    </h3>
                    <KeyPointsList points={keyPoints} />
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-4">
              <Card className="overflow-hidden border-galaxy-nova/20 shadow-xl shadow-galaxy-nova/5 bg-black/30 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Historical Entities
                  </CardTitle>
                  <CardDescription>
                    {entities.length} entities found
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <HistoricalFactsList 
                    entities={entities} 
                    onEntitySelect={handleEntitySelect}
                  />
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden border-galaxy-nova/20 shadow-xl shadow-galaxy-nova/5 bg-black/30 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">
                      Visualization
                    </CardTitle>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant={visualizationType === "graph" ? "default" : "outline"} 
                        onClick={() => setVisualizationType("graph")}
                        className="h-8"
                      >
                        Network
                      </Button>
                      <Button 
                        size="sm" 
                        variant={visualizationType === "timeline" ? "default" : "outline"} 
                        onClick={() => setVisualizationType("timeline")}
                        className="h-8"
                      >
                        Timeline
                      </Button>
                      <Button 
                        size="sm" 
                        variant={visualizationType === "story" ? "default" : "outline"} 
                        onClick={() => setVisualizationType("story")}
                        className="h-8"
                      >
                        Story
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="bg-black/20 rounded-md h-[500px] overflow-hidden">
                    {visualizationType === "graph" && (
                      <CosmicVisualization 
                        entities={entities}
                        onEntitySelect={handleEntitySelect}
                      />
                    )}
                    
                    {visualizationType === "timeline" && (
                      <Timeline 
                        entities={entities}
                        onEntitySelect={handleEntitySelect}
                      />
                    )}
                    
                    {visualizationType === "story" && (
                      <div className="p-4 h-full overflow-y-auto">
                        <StorytellingSection 
                          entities={entities}
                          onEntitySelect={handleEntitySelect}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      
      {/* Entity Details Modal */}
      {selectedEntity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto animate-in fade-in">
          <div className="relative bg-black/80 border border-galaxy-nova/30 rounded-lg shadow-xl shadow-galaxy-nova/10 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <ElementCard 
              entity={selectedEntity} 
              onClose={closeEntityDetails}
              onUpdate={updateEntities}
              entities={entities}
              onDelete={deleteEntity}
            />
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default YouTubeAnalysis;
