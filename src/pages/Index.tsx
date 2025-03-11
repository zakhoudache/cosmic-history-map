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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  ChevronDown, 
  Search, 
  RotateCcw, 
  Stars, 
  Network, 
  Clock, 
  BookOpen, 
  Map,
  SendHorizonal,
  Globe,
  Landmark,
  Navigation,
  FileText,
  Mountain,
  Tent,
  Database
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasVisualization, setHasVisualization] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<HistoricalEntity | null>(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [historicalEntities, setHistoricalEntities] = useState<SimulationNode[]>(
    prepareSimulationData(mockHistoricalData)
  );
  const [timelineData, setTimelineData] = useState<any>(null);
  const [useMockData, setUseMockData] = useState(false);

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
      
      if (analysisResult && analysisResult.length > 0) {
        // The analysis result is already in the expected format
        setHistoricalEntities(prepareSimulationData(analysisResult));
        
        // Create basic timeline data if not provided
        if (!timelineData) {
          const timelineData = {
            startYear: Math.min(...analysisResult.filter(e => e.startDate).map(e => parseInt(e.startDate.split('-')[0]))),
            endYear: Math.max(...analysisResult.filter(e => e.endDate).map(e => parseInt(e.endDate.split('-')[0]))),
            periods: []
          };
          setTimelineData(timelineData);
        }
        
        setHasVisualization(true);
        
        // Ensure the page scrolls to the visualization section
        setTimeout(() => {
          const visualizationSection = document.querySelector('.visualization-section');
          if (visualizationSection) {
            visualizationSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
        
        toast.success(`Visualization created with ${analysisResult.length} entities`);
      } else {
        // This should not happen because the TextInput component should filter this case
        console.error("No valid entities in analysis result:", analysisResult);
        toast.error("No historical entities were found in the text.");
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

  const toggleMockData = () => {
    if (!useMockData) {
      // Using the existing mockHistoricalData
      setHistoricalEntities(prepareSimulationData(mockHistoricalData));
      setHasVisualization(true);
      setUseMockData(true);
      
      // Create basic timeline data
      const timelineData = {
        startYear: Math.min(...mockHistoricalData.filter(e => e.startDate).map(e => parseInt(e.startDate.split('-')[0]))),
        endYear: Math.max(...mockHistoricalData.filter(e => e.endDate).map(e => parseInt(e.endDate.split('-')[0]))),
        periods: []
      };
      setTimelineData(timelineData);
      
      toast.success("Mock historical data loaded successfully");
      
      // Scroll to visualization section
      setTimeout(() => {
        const visualizationSection = document.querySelector('.visualization-section');
        if (visualizationSection) {
          visualizationSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    } else {
      // Toggle off mock data - this would typically clear the visualization
      setUseMockData(false);
      // In this case, since we want to keep the visualization, we'll just update the toast
      toast.info("Returned to user-provided data");
    }
  };

  const mapTypes = [
    {
      id: "historical",
      title: "Historical Maps",
      description: "Visualize how territories, borders, and civilizations have changed over time.",
      icon: Globe,
      color: "from-galaxy-nova to-galaxy-blue-giant",
      bgColor: "bg-black/30",
      details: "Historical maps show the geographical features, political boundaries, and cultural landscapes of the past. They help students visualize how territories have expanded and contracted, where ancient civilizations flourished, and how geography influenced historical events."
    },
    {
      id: "thematic",
      title: "Thematic Maps",
      description: "Illustrate specific themes or subjects across geographical areas.",
      icon: Landmark,
      color: "from-aurora-blue to-galaxy-blue-giant",
      bgColor: "bg-black/30",
      details: "Thematic maps focus on displaying specific data patterns across geographical areas. They can show population density, climate patterns, economic activity, resource distribution, or cultural diffusion. These maps help students understand complex concepts through visual spatial representation."
    },
    {
      id: "practice",
      title: "Outline Maps",
      description: "Blank or partially labeled maps for practice and assessment.",
      icon: FileText,
      color: "from-aurora-green to-galaxy-blue-giant",
      bgColor: "bg-black/30",
      details: "These blank or partially labeled maps allow students to practice identifying geographical features, political borders, and important locations. They're essential for active learning and self-assessment in geography education."
    },
    {
      id: "relief",
      title: "Relief Maps",
      description: "Three-dimensional representations of terrain and elevation.",
      icon: Mountain,
      color: "from-galaxy-star to-galaxy-nova",
      bgColor: "bg-black/30",
      details: "Relief maps provide tactile, three-dimensional representations of terrain and elevation. They help students understand how landforms like mountains, valleys, and plateaus affect human settlement, agriculture, and historical development."
    },
    {
      id: "interactive",
      title: "Interactive Maps",
      description: "Digital maps with layers of information and interactive features.",
      icon: Navigation,
      color: "from-aurora-purple to-galaxy-nova",
      bgColor: "bg-black/30",
      details: "Digital interactive maps allow students to explore multiple layers of geographic information. Students can toggle between different data sets, zoom in on specific regions, and observe how different factors interact across space and time."
    },
    {
      id: "concept",
      title: "Concept Maps",
      description: "Visual representations of relationships between concepts.",
      icon: Network,
      color: "from-aurora-pink to-galaxy-nova",
      bgColor: "bg-black/30",
      details: "Concept maps help organize and connect ideas in geography and history. They visualize how different historical events are connected, how geographical features influence societies, and how complex systems interact."
    }
  ];

  const [selectedMapType, setSelectedMapType] = useState(mapTypes[0].id);

  return (
    <MainLayout>
      {/* Hero section with cosmic theme styling */}
      <section className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-center py-16">
        {/* Cosmic Background Effects */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(91,33,182,0.15),rgba(0,0,0,0)_70%)]"></div>
        <div className="fixed inset-0 -z-10 bg-background"></div>
        <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9nPjwvc3ZnPg==')] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]"></div>
        
        {/* Star field effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
        
        {/* Glowing Orbs for cosmic effect */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-galaxy-nova/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-galaxy-blue-giant/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-3xl mx-auto text-center relative z-10 px-4">
          <div className="inline-block px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-galaxy-nova/30 text-xs font-medium mb-4 animate-fade-in opacity-0" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            Historical Data Visualization
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-galaxy-star via-galaxy-nova to-galaxy-blue-giant bg-clip-text text-transparent mb-6 animate-fade-in opacity-0" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
            Discover the cosmos of human history
          </h1>
          
          <p className="text-foreground/70 text-lg mb-12 max-w-2xl mx-auto animate-fade-in opacity-0" style={{ animationDelay: "600ms", animationFillMode: "forwards" }}>
            Enter any historical text and watch as ChronoMind transforms it into a beautiful interactive visualization revealing connections across time and space.
          </p>
          
          <div className="backdrop-blur-lg bg-black/30 border border-galaxy-nova/30 shadow-xl shadow-galaxy-nova/10 p-6 rounded-lg mb-8 animate-fade-in opacity-0" style={{ animationDelay: "800ms", animationFillMode: "forwards" }}>
            {/* Glowing Orbs */}
            <div className="absolute top-0 right-0 -m-10 w-40 h-40 bg-galaxy-nova/20 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -m-10 w-40 h-40 bg-galaxy-blue-giant/20 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="space-y-4">
              <TextInput onSubmit={handleTextSubmit} isLoading={isLoading} />
              
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMockData}
                  className={`border border-galaxy-nova/30 ${useMockData ? 'bg-galaxy-nova/20 text-galaxy-nova' : 'bg-black/30'}`}
                >
                  <Database className="w-4 h-4 mr-2" />
                  {useMockData ? 'Using Mock Data' : 'Use Mock Data'}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        {showScrollIndicator && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-foreground/50 animate-fade-in opacity-0" style={{ animationDelay: "1200ms", animationFillMode: "forwards" }}>
            <span className="text-xs mb-2">Scroll to explore</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </div>
        )}
      </section>
      
      {/* Visualization section */}
      {hasVisualization && (
        <section className="py-16 visualization-section backdrop-blur-lg bg-black/30 border border-galaxy-nova/30 rounded-lg shadow-xl shadow-galaxy-nova/10 mb-10" id="visualization">
          <Separator className="mb-16" />
          
          <div className="mb-12 text-center animate-on-scroll">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-galaxy-star via-galaxy-nova to-galaxy-blue-giant bg-clip-text text-transparent mb-4">Cosmic Visualization</h2>
            <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
              Explore historical entities and their relationships in an interactive cosmic map.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
            <div className="lg:col-span-2 animate-on-scroll border border-galaxy-nova/30 rounded-lg shadow-lg shadow-galaxy-nova/10 overflow-hidden">
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
                <div className="backdrop-blur-lg bg-black/30 rounded-lg p-6 h-full flex flex-col justify-center items-center text-center border border-galaxy-nova/30 shadow-lg shadow-galaxy-nova/10">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-galaxy-nova to-galaxy-blue-giant flex items-center justify-center mb-4">
                    <div className="h-5 w-5 rounded-full bg-background"></div>
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">Select an Element</h3>
                  <p className="text-foreground/70 text-sm">
                    Click on any element in the visualization to view detailed information.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-16 animate-on-scroll">
            <h3 className="text-xl font-medium text-galaxy-nova mb-4">Timeline View</h3>
            <div className="border border-galaxy-nova/30 rounded-lg shadow-lg shadow-galaxy-nova/10 overflow-hidden">
              <Timeline 
                onEntitySelect={handleEntitySelect} 
                entities={historicalEntities}
                timelineData={timelineData}
              />
            </div>
          </div>
          
          <div className="animate-on-scroll">
            <h3 className="text-xl font-medium text-galaxy-nova mb-4">Knowledge Graph</h3>
            <div className="border border-galaxy-nova/30 rounded-lg shadow-lg shadow-galaxy-nova/10 overflow-hidden">
              <KnowledgeGraph 
                onEntitySelect={handleEntitySelect} 
                entities={historicalEntities}
              />
            </div>
          </div>
        </section>
      )}
      
      {/* Maps section */}
      <section className="py-16">
        <Separator className="mb-16" />
        
        <div className="mb-12 text-center animate-on-scroll">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-galaxy-star via-galaxy-nova to-galaxy-blue-giant bg-clip-text text-transparent mb-4">Educational Maps</h2>
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
            Explore different types of maps essential for understanding history and geography.
          </p>
        </div>
        
        <div className="mb-10">
          <Tabs defaultValue={selectedMapType} onValueChange={setSelectedMapType} className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-2 bg-black/30 backdrop-blur-sm h-auto border border-galaxy-nova/20 p-1 rounded-lg">
              {mapTypes.map((mapType) => (
                <TabsTrigger
                  key={mapType.id}
                  value={mapType.id}
                  className="flex flex-col items-center gap-2 p-3 h-auto data-[state=active]:bg-galaxy-nova/20 data-[state=active]:backdrop-blur-md data-[state=active]:text-foreground data-[state=active]:border-galaxy-nova/30 border border-transparent"
                >
                  <mapType.icon className={`w-5 h-5 bg-gradient-to-r ${mapType.color} bg-clip-text text-transparent`} />
                  <span className="text-xs font-medium">{mapType.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {mapTypes.map((mapType) => (
              <TabsContent key={mapType.id} value={mapType.id} className="mt-6">
                <Card className="border border-galaxy-nova/30 backdrop-blur-lg bg-black/30 shadow-xl shadow-galaxy-nova/10 overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${mapType.bgColor} border border-galaxy-nova/30`}>
                        <mapType.icon className={`w-6 h-6 bg-gradient-to-r ${mapType.color} bg-clip-text text-transparent`} />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">{mapType.title}</CardTitle>
                        <CardDescription className="text-foreground/70">{mapType.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6 items-center">
                      <div className="space-y-4">
                        <p className="text-foreground/70">{mapType.details}</p>
                        <Button variant="galaxy" size="sm">
                          Explore {mapType.title}
                          <SendHorizonal className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className={`aspect-video rounded-lg ${mapType.bgColor} flex items-center justify-center border border-galaxy-nova/20 shadow-inner overflow-hidden`}>
                        <div className="relative w-full h-full">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <mapType.icon className={`w-16 h-16 opacity-20`} />
                          </div>
                          <div className="absolute bottom-4 right-4">
                            <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm border-galaxy-nova/30 text-foreground hover:text-galaxy-nova">
                              <FileText className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
        
        <div className="text-center">
          <Link 
            to="/maps" 
            className="bg-gradient-to-r from-galaxy-nova to-galaxy-blue-giant hover:from-galaxy-blue-giant hover:to-galaxy-nova text-white shadow-md shadow-galaxy-nova/20 hover:shadow-lg hover:shadow-galaxy-blue-giant/30 hover:-translate-y-0.5 transition-all duration-300 inline-block px-8 py-3 rounded-lg font-medium border border-galaxy-nova/30 relative overflow-hidden group"
          >
            Explore All Map Types
            <Map className="ml-2 h-4 w-4 inline transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-16">
        <Separator className="mb-16" />
        
        <div className="mb-12 text-center animate-on-scroll">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-galaxy-star via-galaxy-nova to-galaxy-blue-giant bg-clip-text text-transparent mb-4">Features</h2>
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
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
          <Link 
            to="/visualize" 
            className="bg-gradient-to-r from-galaxy-nova to-galaxy-blue-giant hover:from-galaxy-blue-giant hover:to-galaxy-nova text-white shadow-md shadow-galaxy-nova/20 hover:shadow-lg hover:shadow-galaxy-blue-giant/30 hover:-translate-y-0.5 transition-all duration-300 inline-block px-8 py-3 rounded-lg font-medium border border-galaxy-nova/30 relative overflow-hidden group"
          >
            Try Full Visualization Experience
            <SendHorizonal className="ml-2 h-4 w-4 inline transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
