
import React, { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import TextInput from "@/components/TextInput";
import { FormattedHistoricalEntity } from "@/types/supabase";
import VisualizationPlaceholder from "@/components/VisualizationPlaceholder";
import CosmicVisualization from "@/components/CosmicVisualization";
import Timeline from "@/components/Timeline";
import VisualizationControls from "@/components/VisualizationControls";
import { useAuth } from "@/hooks/useAuth";

const Visualize = () => {
  const [inputText, setInputText] = useState<string>("");
  const [entities, setEntities] = useState<FormattedHistoricalEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [visualizationType, setVisualizationType] = useState<"graph" | "timeline">("graph");
  const { user } = useAuth();

  const handleTextSubmit = (text: string, analyzedEntities: FormattedHistoricalEntity[]) => {
    setInputText(text);
    setEntities(analyzedEntities);
    setLoading(false);
  };

  const handleVisTypeChange = (type: "graph" | "timeline") => {
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
        />

        <div className="mt-8">
          {!showPlaceholder && (
            <VisualizationControls 
              visualizationType={visualizationType} 
              onVisTypeChange={handleVisTypeChange}
              entityCount={entities.length}
            />
          )}
          
          <div className="mt-4 bg-background/50 backdrop-blur-sm rounded-lg border border-galaxy-nova/20 shadow-xl p-4 min-h-[500px] relative overflow-hidden">
            {showPlaceholder ? (
              <VisualizationPlaceholder />
            ) : (
              <>
                {visualizationType === "graph" ? (
                  <CosmicVisualization 
                    entities={entities}
                    visualizationType={visualizationType}
                  />
                ) : (
                  <Timeline 
                    entities={entities}
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
