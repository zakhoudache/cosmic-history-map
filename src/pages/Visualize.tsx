
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, Sparkles, History, SendHorizonal } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import KnowledgeGraph from '@/components/KnowledgeGraph';
import CosmicVisualization from '@/components/CosmicVisualization';
import Timeline from '@/components/Timeline';
import ElementCard from '@/components/ElementCard';
import VisualizationPlaceholder from '@/components/VisualizationPlaceholder';
import { HistoricalEntity, mockHistoricalData } from '@/utils/mockData';

const Visualize: React.FC = () => {
  const { toast } = useToast();
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedEntity, setSelectedEntity] = useState<HistoricalEntity | null>(null);
  const [entities, setEntities] = useState<HistoricalEntity[]>([]);
  const [activeTab, setActiveTab] = useState<string>('knowledge-graph');
  
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
      setEntities(mockHistoricalData);
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
    <div className="container mx-auto p-4 max-w-6xl space-y-6">
      <Card className="cosmic-gradient">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">ChronoMind Visualizer</CardTitle>
          <CardDescription>
            Analyze historical text to generate interactive knowledge graphs, cosmic visualizations, and timelines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Enter historical text to analyze... (e.g. 'The Renaissance was a period of European cultural, artistic, political, and scientific rebirth after the Middle Ages...')"
            className="min-h-32 glass border-primary/20"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleAnalyze} 
            disabled={loading || !text.trim()}
            className="cosmic-button"
          >
            {loading ? (
              <>Processing<span className="loading-dots"></span></>
            ) : (
              <>Analyze & Visualize <SendHorizonal className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
      
      <Card className="bg-muted/50">
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
    </div>
  );
};

export default Visualize;
