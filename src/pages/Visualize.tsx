
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
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-6xl relative bg-background/80 backdrop-blur-sm rounded-xl shadow-lg border border-galaxy-nova/10 overflow-hidden">
      {/* Background galaxy effect */}
      <div className="absolute inset-0 bg-galaxy-gradient opacity-20 animate-galaxy-spin pointer-events-none"></div>
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className={`star absolute ${i % 4 === 0 ? 'star-large twinkle-slow' : i % 3 === 0 ? 'star-medium twinkle-medium' : 'star-small twinkle-fast'}`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-galaxy-nova transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
        
        <Card className="cosmic-gradient mb-10 border-galaxy-nova/30 shadow-lg shadow-galaxy-core/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-galaxy-star via-cosmic-light to-galaxy-nova bg-clip-text text-transparent">ChronoMind Visualizer</CardTitle>
            <CardDescription className="text-foreground/90">
              Analyze historical text to generate interactive knowledge graphs, cosmic visualizations, and timelines.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Enter historical text to visualize</h2>
            </div>
            
            <Textarea 
              placeholder="Enter historical text to analyze... (e.g. 'The Renaissance was a period of European cultural, artistic, political, and scientific rebirth after the Middle Ages...')"
              className="min-h-32 glass border-galaxy-nova/20 focus:border-galaxy-nova/50 transition-all shadow-inner shadow-galaxy-nova/5"
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
                  className="border-galaxy-nova/30 hover:border-galaxy-nova/60"
                >
                  Clear
                </Button>
                <span className="text-xs text-muted-foreground">{text.length} characters</span>
              </div>
              
              <Button 
                onClick={handleAnalyze} 
                disabled={loading || !text.trim()}
                variant="galaxy"
                className="relative group"
              >
                {loading ? (
                  <>Processing<span className="loading-dots"></span></>
                ) : (
                  <>
                    Visualize 
                    <SendHorizonal className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-foreground/90">Examples:</span>
              </div>
              <div className="space-y-2">
                {exampleTexts.map((example, index) => (
                  <button
                    key={index}
                    className="example-item w-full group border border-transparent hover:border-galaxy-nova/30 shadow-sm hover:shadow-galaxy-nova/10 transition-all duration-300"
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
          <TabsList className="grid grid-cols-3 mb-6 bg-secondary/80 border border-galaxy-nova/20 p-1">
            <TabsTrigger 
              value="knowledge-graph" 
              className="flex items-center gap-2 data-[state=active]:bg-galaxy-nova/20 data-[state=active]:text-galaxy-nova"
            >
              <Network className="h-4 w-4" />
              Knowledge Graph
            </TabsTrigger>
            <TabsTrigger 
              value="cosmic" 
              className="flex items-center gap-2 data-[state=active]:bg-galaxy-nova/20 data-[state=active]:text-galaxy-nova"
            >
              <Sparkles className="h-4 w-4" />
              Cosmic View
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="flex items-center gap-2 data-[state=active]:bg-galaxy-nova/20 data-[state=active]:text-galaxy-nova"
            >
              <History className="h-4 w-4" />
              Timeline
            </TabsTrigger>
          </TabsList>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`col-span-1 md:col-span-${selectedEntity ? 2 : 3} transition-all duration-300`}>
              <TabsContent value="knowledge-graph" className="mt-0 h-[500px] border border-galaxy-nova/20 rounded-lg shadow-lg shadow-galaxy-core/10 overflow-hidden">
                {entities.length > 0 ? (
                  <KnowledgeGraph entities={entities} onEntitySelect={handleEntitySelect} />
                ) : (
                  <VisualizationPlaceholder 
                    type="knowledge-graph" 
                    message="Submit historical text to generate an interactive knowledge graph"
                  />
                )}
              </TabsContent>
              
              <TabsContent value="cosmic" className="mt-0 h-[500px] border border-galaxy-nova/20 rounded-lg shadow-lg shadow-galaxy-core/10 overflow-hidden">
                {entities.length > 0 ? (
                  <CosmicVisualization entities={entities} onEntitySelect={handleEntitySelect} />
                ) : (
                  <VisualizationPlaceholder 
                    type="cosmic" 
                    message="Submit historical text to generate a cosmic visualization"
                  />
                )}
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-0 h-[500px] border border-galaxy-nova/20 rounded-lg shadow-lg shadow-galaxy-core/10 overflow-hidden">
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
              <div className="col-span-1 h-[500px] transition-all duration-300 overflow-auto border border-galaxy-nova/20 rounded-lg shadow-lg shadow-galaxy-core/10 glass backdrop-blur-sm">
                <ElementCard entity={selectedEntity} onClose={closeEntityCard} />
              </div>
            )}
          </div>
        </Tabs>
        
        <Card className="bg-muted/40 backdrop-blur-sm mb-10 border-galaxy-nova/20 shadow-lg shadow-galaxy-core/10">
          <CardHeader>
            <CardTitle className="text-foreground/90">Visualization Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-galaxy-core/10 border border-galaxy-nova/20 backdrop-blur-sm transition-all duration-300 hover:bg-galaxy-core/20">
                <h4 className="font-medium text-galaxy-nova mb-2">Knowledge Graph</h4>
                <p className="text-foreground/80">Explore interconnected historical entities through a network visualization showing direct relationships and influence patterns.</p>
              </div>
              <div className="p-4 rounded-lg bg-galaxy-core/10 border border-galaxy-nova/20 backdrop-blur-sm transition-all duration-300 hover:bg-galaxy-core/20">
                <h4 className="font-medium text-galaxy-nova mb-2">Cosmic Visualization</h4>
                <p className="text-foreground/80">View historical elements as celestial bodies in a cosmic arrangement, with size representing significance and distance showing relation.</p>
              </div>
              <div className="p-4 rounded-lg bg-galaxy-core/10 border border-galaxy-nova/20 backdrop-blur-sm transition-all duration-300 hover:bg-galaxy-core/20">
                <h4 className="font-medium text-galaxy-nova mb-2">Timeline</h4>
                <p className="text-foreground/80">See historical events, people and concepts arranged chronologically to understand temporal relationships and periods.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <FeaturesSection />
      </div>
    </div>
  );
};

export default Visualize;
