
import React, { useState, useRef } from "react";
import MainLayout from "@/layouts/MainLayout";
import TextInput from "@/components/TextInput";
import { FormattedHistoricalEntity } from "@/types/supabase";
import VisualizationPlaceholder from "@/components/VisualizationPlaceholder";
import CosmicVisualization from "@/components/CosmicVisualization";
import Timeline from "@/components/Timeline";
import VisualizationControls from "@/components/VisualizationControls";
import { useAuth } from "@/hooks/useAuth";
import StorytellingSection from "@/components/StorytellingSection";
import ElementCard from "@/components/ElementCard";
import { Card } from "@/components/ui/card";
import { exportToPDF } from "@/utils/pdfExport";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Database, BookText, Globe } from "lucide-react";
import { mockHistoricalData, arabicHistoricalData, prepareSimulationData } from "@/utils/mockData";

const Visualize = () => {
  const [inputText, setInputText] = useState<string>("");
  const [entities, setEntities] = useState<FormattedHistoricalEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [visualizationType, setVisualizationType] = useState<"graph" | "timeline" | "story">("graph");
  const [selectedEntity, setSelectedEntity] = useState<FormattedHistoricalEntity | null>(null);
  const [useMockData, setUseMockData] = useState<boolean>(false);
  const [useArabicData, setUseArabicData] = useState<boolean>(false);
  const { user } = useAuth();
  
  // Use refs for the visualization containers
  const cosmicVisualizationRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  const handleTextSubmit = (text: string, analyzedEntities: FormattedHistoricalEntity[]) => {
    setInputText(text);
    setEntities(analyzedEntities);
    setLoading(false);
  };

  const handleAnalysisStart = () => {
    setLoading(true);
  };

  const handleVisTypeChange = (type: "graph" | "timeline" | "story") => {
    setVisualizationType(type);
  };

  const handleEntitySelect = (entity: FormattedHistoricalEntity) => {
    setSelectedEntity(entity);
  };

  const closeDetailsCard = () => {
    setSelectedEntity(null);
  };

  const toggleMockData = () => {
    if (!useMockData) {
      // Switch to the default mockdata
      const formattedMockData = mockHistoricalData.map(item => ({
        ...item,
        id: item.id,
        name: item.name,
        type: item.type || "Unknown",
        description: item.description || "",
        startDate: item.startDate || "",
        endDate: item.endDate || "",
        significance: item.significance || 5,
        relations: item.relations || [],
        group: item.group || "Unknown",
        // Add these properties to fix TypeScript errors
        location: item.location || "",
        imageUrl: item.imageUrl || "",
      })) as FormattedHistoricalEntity[];
      
      setEntities(formattedMockData);
      setUseMockData(true);
      setUseArabicData(false);
      setInputText("Mock historical data for visualization demonstration");
      toast.success("English mock historical data loaded successfully");
    } else {
      setUseMockData(false);
      toast.info("Returned to user-provided data");
    }
  };

  const toggleArabicData = () => {
    if (!useArabicData) {
      // Switch to the Arabic mockdata
      const formattedArabicData = arabicHistoricalData.map(item => ({
        ...item,
        id: item.id,
        name: item.name,
        type: item.type || "Unknown",
        description: item.description || "",
        startDate: item.startDate || "",
        endDate: item.endDate || "",
        significance: item.significance || 5,
        relations: item.relations || [],
        group: item.group || "Unknown",
        // Add these properties to fix TypeScript errors
        location: item.location || "",
        imageUrl: item.imageUrl || "",
      })) as FormattedHistoricalEntity[];
      
      setEntities(formattedArabicData);
      setUseArabicData(true);
      setUseMockData(false);
      setInputText("بيانات تاريخية عربية للتمثيل البصري");
      toast.success("تم تحميل البيانات التاريخية العربية بنجاح");
    } else {
      setUseArabicData(false);
      toast.info("العودة إلى البيانات المقدمة من المستخدم");
    }
  };

  const handleExportPDF = () => {
    if (entities.length === 0) {
      toast.error("No data to export. Please analyze text first.");
      return;
    }
    
    let containerElement = null;
    let title = "";
    let description = "";
    
    // Choose the appropriate container element and titles based on visualization type
    switch (visualizationType) {
      case "graph":
        containerElement = cosmicVisualizationRef.current;
        title = "Cosmic Connections Network Analysis";
        description = `Network visualization of historical entities and their relationships based on the input text: ${inputText.substring(0, 150)}${inputText.length > 150 ? "..." : ""}`;
        break;
        
      case "timeline":
        containerElement = timelineRef.current;
        title = "Historical Timeline Analysis";
        description = `Chronological visualization of historical entities based on the input text: ${inputText.substring(0, 150)}${inputText.length > 150 ? "..." : ""}`;
        break;
        
      case "story":
        containerElement = storyRef.current;
        title = "Historical Narrative Analysis";
        description = `Storytelling analysis presenting historical connections in narrative form based on the input text: ${inputText.substring(0, 150)}${inputText.length > 150 ? "..." : ""}`;
        break;
    }
    
    // Generate PDF with the appropriate visualization container
    exportToPDF({
      entities,
      title,
      description,
      visualizationType,
      containerElement,
    });
  };

  const showPlaceholder = !inputText || entities.length === 0;

  return (
    <MainLayout>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(91,33,182,0.15),rgba(0,0,0,0)_70%)]"></div>
      <div className="fixed inset-0 -z-10 bg-background"></div>
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9nPjwvc3ZnPg==')] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-galaxy-star via-galaxy-nova to-galaxy-blue-giant bg-clip-text text-transparent mb-3">
            Visualize Historical Connections
          </h1>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Enter historical text to analyze and visualize connections between people, events, and concepts.
            {user ? " Your visualizations will be saved to your account." : " Sign in to save your visualizations."}
          </p>
        </div>

        <Card className="backdrop-blur-lg bg-black/30 border border-galaxy-nova/30 shadow-xl shadow-galaxy-nova/10 overflow-hidden p-6 mb-8">
          <div className="absolute top-0 right-0 -m-10 w-40 h-40 bg-galaxy-nova/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -m-10 w-40 h-40 bg-galaxy-blue-giant/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col space-y-4">
            <TextInput 
              onSubmit={handleTextSubmit} 
              isLoading={loading} 
              onStartAnalysis={handleAnalysisStart}
            />
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMockData}
                className={`border border-galaxy-nova/30 ${useMockData ? 'bg-galaxy-nova/20 text-galaxy-nova' : 'bg-black/30'}`}
              >
                <Database className="w-4 h-4 mr-2" />
                {useMockData ? 'Using English Data' : 'Use English Data'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleArabicData}
                className={`border border-galaxy-nova/30 ${useArabicData ? 'bg-galaxy-nova/20 text-galaxy-nova' : 'bg-black/30'}`}
              >
                <BookText className="w-4 h-4 mr-2" />
                {useArabicData ? 'استخدام البيانات العربية' : 'استخدام البيانات العربية'}
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-8 relative">
          {!showPlaceholder && (
            <Card className="backdrop-blur-lg bg-black/20 border border-galaxy-nova/20 shadow-lg p-4 mb-4">
              <VisualizationControls 
                visualizationType={visualizationType} 
                onVisTypeChange={handleVisTypeChange}
                entityCount={entities.length}
                onExportPDF={handleExportPDF}
              />
            </Card>
          )}
          
          <Card className="backdrop-blur-lg bg-black/30 border border-galaxy-nova/30 shadow-xl shadow-galaxy-nova/10 overflow-hidden relative min-h-[700px]">
            <div className="absolute top-0 right-0 -m-10 w-40 h-40 bg-galaxy-nova/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -m-10 w-40 h-40 bg-galaxy-blue-giant/10 rounded-full blur-2xl pointer-events-none"></div>
            
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-galaxy-nova border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-6 text-foreground/70">Analyzing and preparing visualization...</p>
                </div>
              </div>
            ) : showPlaceholder ? (
              <div className="p-6">
                <VisualizationPlaceholder />
              </div>
            ) : (
              <div className="p-2">
                {visualizationType === "graph" && (
                  <div ref={cosmicVisualizationRef} className="relative h-full">
                    <CosmicVisualization 
                      entities={entities}
                      visualizationType={visualizationType}
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
                  </div>
                )}
                {visualizationType === "timeline" && (
                  <div ref={timelineRef} className="relative h-full">
                    <Timeline 
                      entities={entities}
                      onEntitySelect={handleEntitySelect}
                    />
                  </div>
                )}
                {visualizationType === "story" && (
                  <div ref={storyRef} className="relative h-full">
                    <StorytellingSection 
                      entities={entities}
                      text={inputText}
                    />
                  </div>
                )}
                
                {visualizationType === "timeline" && selectedEntity && (
                  <div className="fixed bottom-4 right-4 w-72 z-50">
                    <ElementCard 
                      entity={selectedEntity} 
                      onClose={closeDetailsCard} 
                    />
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Visualize;

