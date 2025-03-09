
import React, { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import TextInput from "@/components/TextInput";
import { FormattedHistoricalEntity } from "@/types/supabase";
import VisualizationPlaceholder from "@/components/VisualizationPlaceholder";
import CosmicVisualization from "@/components/CosmicVisualization";
import Timeline from "@/components/Timeline";
import VisualizationControls from "@/components/VisualizationControls";
import { useAuth } from "@/hooks/useAuth";
import StorytellingSection from "@/components/StorytellingSection";

const Visualize = () => {
  const [inputText, setInputText] = useState<string>("");
  const [entities, setEntities] = useState<FormattedHistoricalEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [visualizationType, setVisualizationType] = useState<"graph" | "timeline" | "story">("graph");
  const { user } = useAuth();

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

        <div className="mt-8">
          {!showPlaceholder && (
            <VisualizationControls 
              visualizationType={visualizationType} 
              onVisTypeChange={handleVisTypeChange}
              entityCount={entities.length}
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
                  <CosmicVisualization 
                    entities={entities}
                    visualizationType={visualizationType}
                  />
                )}
                {visualizationType === "timeline" && (
                  <Timeline 
                    entities={entities}
                  />
                )}
                {visualizationType === "story" && (
                  <StorytellingSection 
                    entities={entities}
                    text={inputText}
                  />
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
