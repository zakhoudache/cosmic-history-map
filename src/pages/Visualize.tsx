
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, Sparkles, History, SendHorizonal, ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import KnowledgeGraph from '@/components/KnowledgeGraph';
import CosmicVisualization from '@/components/CosmicVisualization';
import Timeline from '@/components/Timeline';
import ElementCard from '@/components/ElementCard';
import VisualizationPlaceholder from '@/components/VisualizationPlaceholder';
import FeaturesSection from '@/components/FeaturesSection';
import { HistoricalEntity, SimulationNode, prepareSimulationData, mockHistoricalData } from '@/utils/mockData';

const Visualize: React.FC = () => {
  const { toast } = useToast();
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedEntity, setSelectedEntity] = useState<HistoricalEntity | null>(null);
  const [entities, setEntities] = useState<SimulationNode[]>([]);
  const [activeTab, setActiveTab] = useState<string>('knowledge-graph');
  
  const exampleTexts = [
    "The Renaissance was a period in European history marking the transition from the Middle Ages to modernity and covering the 15th and 16th centuries.",
    "World War II was a global war that lasted from 1939 to 1945. It involved the vast majority of the world's countries—including all of the great powers.",
    "The Industrial Revolution was the transition to new manufacturing processes in Great Britain, continental Europe, and the United States, from 1760 to 1840."
  ];

  const handleExampleClick = (example: string) => {
    setText(example);
  };
  
  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: "Text Required",
        description: "Please enter some historical text to analyze.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // For demo, use mock data
      setEntities(prepareSimulationData(mockHistoricalData));
      setLoading(false);
      
      toast({
        title: "Analysis Complete",
        description: "Historical entities and relationships extracted successfully.",
      });
    }, 1500);
  };
  
  const handleEntitySelect = (entity: HistoricalEntity) => {
    setSelectedEntity(entity);
  };
  
  const closeEntityCard = () => {
    setSelectedEntity(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>
      </div>
      
      <Card className="cosmic-gradient mb-10">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">ChronoMind Visualizer</CardTitle>
          <CardDescription>
            Analyze historical text to generate interactive knowledge graphs, cosmic visualizations, and timelines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Enter historical text to visualize</h2>
          </div>
          
          <Textarea 
            placeholder="Enter historical text to analyze... (e.g. 'The Renaissance was a period of European cultural, artistic, political, and scientific rebirth after the Middle Ages...')"
            className="min-h-32 glass border-primary/20"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setText("")}
                disabled={!text.trim()}
              >
                Clear
              </Button>
              <span className="text-xs text-muted-foreground">{text.length} characters</span>
            </div>
            
            <Button 
              onClick={handleAnalyze} 
              disabled={loading || !text.trim()}
              className="visualize-button"
            >
              {loading ? (
                <>Processing<span className="loading-dots"></span></>
              ) : (
                <>Visualize <SendHorizonal className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Examples:</span>
            </div>
            <div className="space-y-2">
              {exampleTexts.map((example, index) => (
                <button
                  key={index}
                  className="example-item w-full"
                  onClick={() => handleExampleClick(example)}
                >
                  {example.length > 100 ? example.substring(0, 100) + '...' : example}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-10">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="knowledge-graph" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Knowledge Graph
          </TabsTrigger>
          <TabsTrigger value="cosmic" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Cosmic View
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`col-span-1 md:col-span-${selectedEntity ? 2 : 3} transition-all duration-300`}>
            <TabsContent value="knowledge-graph" className="mt-0 h-[500px]">
              {entities.length > 0 ? (
                <KnowledgeGraph entities={entities} onEntitySelect={handleEntitySelect} />
              ) : (
                <VisualizationPlaceholder 
                  type="knowledge-graph" 
                  message="Submit historical text to generate an interactive knowledge graph"
                />
              )}
            </TabsContent>
            
            <TabsContent value="cosmic" className="mt-0 h-[500px]">
              {entities.length > 0 ? (
                <CosmicVisualization entities={entities} onEntitySelect={handleEntitySelect} />
              ) : (
                <VisualizationPlaceholder 
                  type="cosmic" 
                  message="Submit historical text to generate a cosmic visualization"
                />
              )}
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-0 h-[500px]">
              {entities.length > 0 ? (
                <Timeline entities={entities} onEntitySelect={handleEntitySelect} />
              ) : (
                <VisualizationPlaceholder 
                  type="timeline" 
                  message="Submit historical text to generate a historical timeline"
                />
              )}
            </TabsContent>
          </div>
          
          {selectedEntity && (
            <div className="col-span-1 h-[500px] transition-all duration-300 overflow-auto">
              <ElementCard entity={selectedEntity} onClose={closeEntityCard} />
            </div>
          )}
        </div>
      </Tabs>
      
      <Card className="bg-muted/50 mb-10">
        <CardHeader>
          <CardTitle>Visualization Guide</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Knowledge Graph</h4>
              <p className="text-muted-foreground">Explore interconnected historical entities through a network visualization showing direct relationships and influence patterns.</p>
            </div>
            <div>
              <h4 className="font-medium">Cosmic Visualization</h4>
              <p className="text-muted-foreground">View historical elements as celestial bodies in a cosmic arrangement, with size representing significance and distance showing relation.</p>
            </div>
            <div>
              <h4 className="font-medium">Timeline</h4>
              <p className="text-muted-foreground">See historical events, people and concepts arranged chronologically to understand temporal relationships and periods.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <FeaturesSection />
    </div>
  );
};

export default Visualize;
