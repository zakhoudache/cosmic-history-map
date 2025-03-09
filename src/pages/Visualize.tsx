
import React, { useState, useRef, useEffect } from "react";
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
import { exportToPDF } from "@/utils/pdfExport";
import { toast } from "sonner";

const Visualize = () => {
  const [inputText, setInputText] = useState<string>("");
  const [entities, setEntities] = useState<FormattedHistoricalEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [visualizationType, setVisualizationType] = useState<"graph" | "timeline" | "story">("graph");
  const [selectedEntity, setSelectedEntity] = useState<FormattedHistoricalEntity | null>(null);
  const { user } = useAuth();
  const cosmicVisualizationRef = useRef<SVGSVGElement>(null);
  const timelineRef = useRef<SVGSVGElement>(null);

  // Check for entities in sessionStorage (from YouTube analysis)
  useEffect(() => {
    const storedEntities = sessionStorage.getItem('analyzedEntities');
    const storedText = sessionStorage.getItem('analyzedText');
    
    if (storedEntities && storedText) {
      try {
        const parsedEntities = JSON.parse(storedEntities);
        setEntities(parsedEntities);
        setInputText(storedText);
        
        // Clear session storage after loading
        sessionStorage.removeItem('analyzedEntities');
        sessionStorage.removeItem('analyzedText');
        
        toast.success(`Loaded ${parsedEntities.length} entities from YouTube analysis`);
      } catch (error) {
        console.error("Error parsing stored entities:", error);
      }
    }
  }, []);

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

  const handleExportPDF = () => {
    if (entities.length === 0) {
      toast.error("No data to export. Please analyze text first.");
      return;
    }
    
    let svgElement = null;
    let title = "";
    let description = "";
    
    // Choose the appropriate SVG element and titles based on visualization type
    switch (visualizationType) {
      case "graph":
        // Find the SVG element in the CosmicVisualization component
        svgElement = document.querySelector(".visualization-container")?.closest("svg");
        title = "Cosmic Connections Network Analysis";
        description = `Network visualization of historical entities and their relationships based on the input text: ${inputText.substring(0, 150)}${inputText.length > 150 ? "..." : ""}`;
        break;
        
      case "timeline":
        // Find the SVG element in the Timeline component
        svgElement = document.getElementById("timeline-visualization");
        title = "Historical Timeline Analysis";
        description = `Chronological visualization of historical entities based on the input text: ${inputText.substring(0, 150)}${inputText.length > 150 ? "..." : ""}`;
        break;
        
      case "story":
        // Story view (no SVG)
        title = "Historical Narrative Analysis";
        description = `Storytelling analysis presenting historical connections in narrative form based on the input text: ${inputText.substring(0, 150)}${inputText.length > 150 ? "..." : ""}`;
        break;
    }
    
    // Generate PDF with the appropriate visualization and content
    exportToPDF({
      entities,
      title,
      description,
      visualizationType,
      svgElement: svgElement as SVGSVGElement,
    });
  };

  const showPlaceholder = !inputText || entities.length === 0;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Visualize Historical Connections</h1>
          <p className="text-muted-foreground">
            Enter historical text to analyze and visualize connections between people, events, and concepts.
            {user ? " Your visualizations will be saved to your account." : " Sign in to save your visualizations."}
          </p>
        </div>

        <TextInput 
          onSubmit={handleTextSubmit} 
          isLoading={loading} 
          onStartAnalysis={handleAnalysisStart}
        />

        <div className="mt-8 relative">
          {!showPlaceholder && (
            <VisualizationControls 
              visualizationType={visualizationType} 
              onVisTypeChange={handleVisTypeChange}
              entityCount={entities.length}
              onExportPDF={handleExportPDF}
            />
          )}
          
          <div className="mt-4 bg-background/50 backdrop-blur-sm rounded-lg border border-galaxy-nova/20 shadow-xl p-4 min-h-[700px] relative overflow-hidden">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-4 text-muted-foreground">Analyzing and preparing visualization...</p>
                </div>
              </div>
            ) : showPlaceholder ? (
              <VisualizationPlaceholder />
            ) : (
              <>
                {visualizationType === "graph" && (
                  <div className="relative h-full">
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
                  <div className="relative h-full">
                    <Timeline 
                      entities={entities}
                      onEntitySelect={handleEntitySelect}
                    />
                  </div>
                )}
                {visualizationType === "story" && (
                  <StorytellingSection 
                    entities={entities}
                    text={inputText}
                  />
                )}
                
                {/* Show details card in timeline view too */}
                {visualizationType === "timeline" && selectedEntity && (
                  <div className="fixed bottom-4 right-4 w-72 z-50">
                    <ElementCard 
                      entity={selectedEntity} 
                      onClose={closeDetailsCard} 
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Visualize;
