
import React from "react";
import MainLayout from "@/layouts/MainLayout";
import TextInput from "@/components/TextInput";
import { useState } from "react";
import CosmicVisualization from "@/components/CosmicVisualization";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import Timeline from "@/components/Timeline";
import ElementCard from "@/components/ElementCard";
import { HistoricalEntity } from "@/utils/mockData";
import { toast } from "sonner";

const Visualize = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasVisualization, setHasVisualization] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<HistoricalEntity | null>(null);
  const [historicalEntities, setHistoricalEntities] = useState<HistoricalEntity[]>([]);
  const [timelineData, setTimelineData] = useState<any>(null);

  const handleTextSubmit = (text: string, analysisResult: any) => {
    setIsLoading(true);
    
    try {
      console.log("Analysis result:", analysisResult);
      
      if (analysisResult && analysisResult.entities && analysisResult.entities.length > 0) {
        // Convert the Gemini API response to our HistoricalEntity format
        const entities = analysisResult.entities.map((entity: any) => ({
          id: entity.id,
          name: entity.name,
          type: entity.type,
          startDate: entity.startDate,
          endDate: entity.endDate,
          description: entity.description,
          significance: entity.significance || 5, // Default value if missing
          group: entity.group,
          relations: entity.relations || [] // Ensure relations exists
        }));
        
        console.log("Processed entities:", entities);
        
        setHistoricalEntities(entities);
        setTimelineData(analysisResult.timeline);
        setHasVisualization(true);
        
        // Ensure the page scrolls to the visualization section
        setTimeout(() => {
          const visualizationSection = document.querySelector('.visualization-section');
          if (visualizationSection) {
            visualizationSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
        
        toast.success("Visualization created successfully");
      } else {
        // If no entities were found, show a more specific error
        console.error("No entities found in analysis result:", analysisResult);
        toast.error("No historical entities were found in the text. Please try a different text with clearer historical references.");
      }
    } catch (error) {
      console.error("Error processing analysis result:", error);
      toast.error("An error occurred while creating the visualization");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEntitySelect = (entity: HistoricalEntity) => {
    setSelectedEntity(entity);
  };

  const handleCloseEntityCard = () => {
    setSelectedEntity(null);
  };

  return (
    <MainLayout>
      <section className="container py-16">
        <div className="mb-8 text-center">
          <h1 className="cosmic-text mb-4">Historical Text Visualizer</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Enter any historical text to generate interactive visualizations that reveal connections and relationships across time.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto mb-16">
          <TextInput onSubmit={handleTextSubmit} isLoading={isLoading} />
        </div>
        
        {/* Visualization section */}
        {hasVisualization && (
          <div className="visualization-section mt-16">
            <div className="mb-12 text-center">
              <h2 className="mb-4">Generated Visualizations</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore the generated visualizations based on your historical text.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
              <div className="lg:col-span-2">
                <CosmicVisualization 
                  onEntitySelect={handleEntitySelect} 
                  entities={historicalEntities}
                />
              </div>
              
              <div>
                {selectedEntity ? (
                  <ElementCard 
                    entity={selectedEntity} 
                    onClose={handleCloseEntityCard} 
                  />
                ) : (
                  <div className="glass rounded-lg p-6 h-full flex flex-col justify-center items-center text-center">
                    <div className="h-12 w-12 rounded-full cosmic-gradient flex items-center justify-center mb-4">
                      <div className="h-5 w-5 rounded-full bg-background"></div>
                    </div>
                    <h3 className="text-lg font-medium mb-2">Select an Element</h3>
                    <p className="text-muted-foreground text-sm">
                      Click on any element in the visualization to view detailed information.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-16">
              <h3 className="text-xl mb-4">Timeline View</h3>
              <Timeline 
                onEntitySelect={handleEntitySelect} 
                entities={historicalEntities}
                timelineData={timelineData}
              />
            </div>
            
            <div>
              <h3 className="text-xl mb-4">Knowledge Graph</h3>
              <KnowledgeGraph 
                onEntitySelect={handleEntitySelect} 
                entities={historicalEntities}
              />
            </div>
          </div>
        )}
      </section>
    </MainLayout>
  );
};

export default Visualize;
