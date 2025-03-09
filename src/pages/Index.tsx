import React, { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import TextInput from "@/components/TextInput";
import CosmicVisualization from "@/components/CosmicVisualization";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import Timeline from "@/components/Timeline";
import ElementCard from "@/components/ElementCard";
import FeatureCard from "@/components/FeatureCard";
import { HistoricalEntity, SimulationNode, prepareSimulationData, mockHistoricalData } from "@/utils/mockData";
import { initScrollAnimations } from "@/utils/animations";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { 
  ChevronDown, 
  Search, 
  RotateCcw, 
  Stars, 
  Network, 
  Clock, 
  BookOpen, 
  Map
} from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasVisualization, setHasVisualization] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<HistoricalEntity | null>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [historicalEntities, setHistoricalEntities] = useState<SimulationNode[]>(
    prepareSimulationData(mockHistoricalData)
  );
  const [timelineData, setTimelineData] = useState<any>(null);

  // Initialize scroll animations
  useEffect(() => {
    initScrollAnimations();
    
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowScrollIndicator(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        
        setHistoricalEntities(prepareSimulationData(entities));
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
      {/* Hero section */}
      <section className="min-h-[calc(100vh-5rem)] flex flex-col justify-center relative pb-16">
        <div className="max-w-3xl mx-auto text-center relative z-10 px-4">
          <div className="inline-block px-3 py-1 rounded-full bg-secondary text-xs font-medium mb-4 animate-fade-in opacity-0" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            Historical Data Visualization
          </div>
          
          <h1 className="cosmic-text mb-6 animate-fade-in opacity-0" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
            Discover the cosmos of human history
          </h1>
          
          <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto animate-fade-in opacity-0" style={{ animationDelay: "600ms", animationFillMode: "forwards" }}>
            Enter any historical text and watch as ChronoMind transforms it into a beautiful interactive visualization revealing connections across time and space.
          </p>
          
          <div className="animate-fade-in opacity-0" style={{ animationDelay: "800ms", animationFillMode: "forwards" }}>
            <TextInput onSubmit={handleTextSubmit} isLoading={isLoading} />
          </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-cosmic/5 blur-3xl animate-pulse-subtle"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cosmic-accent/5 blur-3xl animate-pulse-subtle"></div>
        </div>
        
        {/* Scroll indicator */}
        {showScrollIndicator && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-muted-foreground animate-fade-in opacity-0" style={{ animationDelay: "1200ms", animationFillMode: "forwards" }}>
            <span className="text-xs mb-2">Scroll to explore</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </div>
        )}
      </section>
      
      {/* Visualization section */}
      {hasVisualization && (
        <section className="py-16 visualization-section" id="visualization">
          <Separator className="mb-16" />
          
          <div className="mb-12 text-center animate-on-scroll">
            <h2 className="mb-4">Cosmic Visualization</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore historical entities and their relationships in an interactive cosmic map.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
            <div className="lg:col-span-2 animate-on-scroll">
              <CosmicVisualization 
                onEntitySelect={handleEntitySelect} 
                entities={historicalEntities}
              />
            </div>
            
            <div className="animate-on-scroll">
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
          
          <div className="mb-16 animate-on-scroll">
            <h3 className="text-xl mb-4">Timeline View</h3>
            <Timeline 
              onEntitySelect={handleEntitySelect} 
              entities={historicalEntities}
              timelineData={timelineData}
            />
          </div>
          
          <div className="animate-on-scroll">
            <h3 className="text-xl mb-4">Knowledge Graph</h3>
            <KnowledgeGraph 
              onEntitySelect={handleEntitySelect} 
              entities={historicalEntities}
            />
          </div>
        </section>
      )}
      
      {/* Features section */}
      <section className="py-16">
        <Separator className="mb-16" />
        
        <div className="mb-12 text-center animate-on-scroll">
          <h2 className="text-3xl font-bold mb-4">Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover the power of ChronoMind's historical data visualization capabilities.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            title="AI-Powered Analysis"
            description="Advanced AI analyzes any historical text to extract entities, events, and relationships."
            icon={RotateCcw}
          />
          
          <FeatureCard
            title="Cosmic Visualization"
            description="Stunning interactive cosmic map where historical elements appear as celestial bodies."
            icon={Stars}
          />
          
          <FeatureCard
            title="Knowledge Graph"
            description="Visual network representation of historical connections and influences."
            icon={Network}
          />
          
          <FeatureCard
            title="Timeline View"
            description="Chronological representation that adjusts based on temporal range of identified elements."
            icon={Clock}
          />
          
          <FeatureCard
            title="Semantic Search"
            description="AI-powered search that understands queries beyond exact keyword matching."
            icon={Search}
          />
          
          <FeatureCard
            title="Historical Maps"
            description="Multiple map types generated from historical text analysis."
            icon={Map}
          />
        </div>
      </section>
      
      <section className="py-8 mb-16">
        <div className="text-center">
          <Link to="/visualize" className="visualize-button inline-block px-8 py-3">
            Try Full Visualization Experience
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
