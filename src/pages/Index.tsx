
import React, { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { HistoricalEntity, FormattedHistoricalEntity } from "@/types/supabase";
import { mockHistoricalData } from "@/utils/mockData";
import CosmicVisualization from "@/components/CosmicVisualization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, BookOpen, Network, History, BarChart2, GlobeCog, Youtube, Coffee, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import GalaxyBackground from "@/components/GalaxyBackground";

const Index = () => {
  const [showDemo, setShowDemo] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<FormattedHistoricalEntity | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleEntitySelect = (entity: FormattedHistoricalEntity) => {
    setSelectedEntity(entity);
  };

  const clearEntity = () => {
    setSelectedEntity(null);
  };

  useEffect(() => {
    // Auto-show demo after a delay on first load
    const timer = setTimeout(() => {
      setShowDemo(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const navigateToVisualizer = () => {
    navigate("/visualize");
  };

  const navigateToYouTube = () => {
    navigate("/youtube-analysis");
  };

  const navigateToMaps = () => {
    navigate("/maps");
  };

  const features = [
    {
      title: "Historical Text Analysis",
      description: "Upload your historical documents to extract entities, events, and connections.",
      icon: <BookOpen className="h-5 w-5" />,
      action: navigateToVisualizer
    },
    {
      title: "Knowledge Graph Visualization",
      description: "Map complex relationships between historical entities with interactive 3D networks.",
      icon: <Network className="h-5 w-5" />,
      action: navigateToVisualizer
    },
    {
      title: "Timeline Generation",
      description: "Automatically create interactive timelines from your historical content.",
      icon: <History className="h-5 w-5" />,
      action: navigateToVisualizer
    },
    {
      title: "YouTube Video Analysis",
      description: "Extract and analyze historical content from YouTube videos.",
      icon: <Youtube className="h-5 w-5" />,
      action: navigateToYouTube
    },
    {
      title: "Historical Maps",
      description: "Visualize geographical aspects of historical events and movements.",
      icon: <GlobeCog className="h-5 w-5" />,
      action: navigateToMaps
    },
    {
      title: "Data-Driven Insights",
      description: "Discover patterns and connections in historical data using AI.",
      icon: <BarChart2 className="h-5 w-5" />,
      action: navigateToVisualizer
    }
  ];

  return (
    <MainLayout>
      <GalaxyBackground className="fixed inset-0 -z-10" />
      
      <div className="min-h-[60vh] relative flex flex-col items-center justify-center py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="flex justify-center items-center mb-4">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-galaxy-nova/20 to-galaxy-blue-giant/20 blur-lg opacity-70"></div>
              <CircleDashed className="h-10 w-10 text-galaxy-nova animate-pulse-subtle" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tighter mb-4">
            <span className="bg-gradient-to-r from-galaxy-star via-galaxy-nova to-galaxy-blue-giant bg-clip-text text-transparent">
              Visualize the Cosmos of
            </span>
            <br />
            <span className="text-white">Human History</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Unlock profound connections through time with our AI-powered historical visualization platform. Transform documents, videos, and data into immersive interactive experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={navigateToVisualizer} className="px-8">
              Start Exploring
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="lg" onClick={() => navigate("/about")}>
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>
      
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Unlock History's Hidden Connections</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines advanced AI technology with interactive visualizations to help researchers, educators, and history enthusiasts discover new perspectives.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card 
                  className="h-full border border-muted/20 transition-colors hover:border-primary/20 bg-black/30 backdrop-blur-sm" 
                  onClick={feature.action}
                >
                  <CardHeader>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      Explore
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {showDemo && (
        <section className="py-20 px-4 bg-black/40">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Interactive Demo</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore this sample visualization of major historical connections. Click on entities to see details.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className="bg-black/20 rounded-xl overflow-hidden border border-muted/20"
              >
                <CosmicVisualization 
                  entities={mockHistoricalData as FormattedHistoricalEntity[]} 
                  onEntitySelect={handleEntitySelect}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-muted/20 bg-black/30 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Historical Connections</CardTitle>
                    <CardDescription>
                      {selectedEntity ? 
                        `Details about ${selectedEntity.name}` : 
                        "Click on any entity in the visualization to see details."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedEntity ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-bold">{selectedEntity.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedEntity.type} • {selectedEntity.startDate && `${selectedEntity.startDate}${selectedEntity.endDate ? ` - ${selectedEntity.endDate}` : ''}`}
                          </p>
                        </div>
                        
                        <p className="text-sm">
                          {selectedEntity.description}
                        </p>
                        
                        {selectedEntity.relations && selectedEntity.relations.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Connections:</h4>
                            <ScrollArea className="h-32">
                              <ul className="space-y-2">
                                {selectedEntity.relations.map((relation, index) => {
                                  const targetEntity = mockHistoricalData.find(e => e.id === relation.targetId);
                                  return (
                                    <li key={index} className="text-xs p-2 bg-white/5 rounded flex justify-between items-center">
                                      <span>
                                        {targetEntity?.name || 'Unknown'} 
                                        <span className="text-muted-foreground ml-1">({relation.type})</span>
                                      </span>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6" 
                                        onClick={() => {
                                          if (targetEntity) {
                                            handleEntitySelect(targetEntity as FormattedHistoricalEntity);
                                          }
                                        }}
                                      >
                                        <ChevronRight className="h-3 w-3" />
                                      </Button>
                                    </li>
                                  );
                                })}
                              </ul>
                            </ScrollArea>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 text-center">
                        <Network className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <p className="text-muted-foreground">
                          Interact with the visualization to explore historical connections
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className={cn(selectedEntity ? 'justify-between' : 'justify-center')}>
                    {selectedEntity ? (
                      <>
                        <Button variant="outline" size="sm" onClick={clearEntity}>
                          Clear Selection
                        </Button>
                        <Button size="sm" onClick={navigateToVisualizer}>
                          Explore More
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button onClick={navigateToVisualizer}>
                        Build Your Own Visualization
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      )}
      
      <section className="py-20 px-4 relative">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Explore History?</h2>
            <p className="text-muted-foreground mb-8">
              Start uncovering connections and visualizing historical data in ways never before possible.
              {!user && " Create an account to save your visualizations."}
            </p>
            
            <Button size="lg" onClick={navigateToVisualizer} className="px-8">
              Get Started
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>
      
      <div className="absolute bottom-40 left-10 w-20 h-20 bg-galaxy-nova/10 rounded-full filter blur-xl opacity-30 animate-pulse-slow"></div>
      <div className="absolute bottom-60 right-20 w-32 h-32 bg-galaxy-blue-giant/10 rounded-full filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
    </MainLayout>
  );
};

export default Index;
