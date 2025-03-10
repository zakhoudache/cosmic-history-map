import React, { useState, useEffect } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import VisualizationControls from "@/components/VisualizationControls";
import MapDisplay from "@/components/MapDisplay";
import MapStyleEditor, { MapStyle } from "@/components/MapStyleEditor";
import { toast } from "@/hooks/use-toast";
import { 
  Globe, 
  Landmark, 
  FileText, 
  Mountain, 
  Navigation, 
  Network,
  History,
  BookOpen,
  Map as MapIcon,
  Info,
  Download,
  Palette
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Maps = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentView, setCurrentView] = useState<"historical" | "thematic" | "outline" | "relief" | "interactive" | "concept">("historical");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedMapExample, setSelectedMapExample] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [currentMapStyle, setCurrentMapStyle] = useState<MapStyle | undefined>(undefined);

  // Handle fullscreen toggle and map style change functions
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Handle map style change
  const handleStyleChange = (style: MapStyle) => {
    setCurrentMapStyle(style);
  };
  
  // Fetch generated content from Supabase
  useEffect(() => {
    const fetchGeneratedContent = async () => {
      try {
        // Try to fetch from Supabase
        const { data, error } = await supabase
          .from('generated_content')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error("Error fetching generated content:", error);
          return;
        }
        
        if (data && data.length > 0) {
          setGeneratedContent(data[0]);
        }
      } catch (error) {
        console.error("Error in content fetch:", error);
      }
    };
    
    fetchGeneratedContent();
  }, []);
  
  // Map data - definitions for different map types
  const mapTypes = [
    {
      id: "historical",
      title: "Historical Maps",
      description: "Visualize how territories, borders, and civilizations have changed over time.",
      icon: Globe,
      color: "from-galaxy-star via-galaxy-nova to-galaxy-blue-giant",
      bgColor: "bg-black/30",
      borderColor: "border-galaxy-nova/30",
      details: "Historical maps show the geographical features, political boundaries, and cultural landscapes of the past. They help students visualize how territories have expanded and contracted, where ancient civilizations flourished, and how geography influenced historical events.",
      examples: [
        { name: "Roman Empire (117 CE)", description: "Map showing the Roman Empire at its maximum extent under Emperor Trajan." },
        { name: "Ancient Mesopotamia", description: "Map of early civilizations in the Fertile Crescent region." },
        { name: "Medieval Trade Routes", description: "Silk Road and major trade routes across Asia, Africa, and Europe." }
      ]
    },
    {
      id: "thematic",
      title: "Thematic Maps",
      description: "Illustrate specific themes or subjects across geographical areas.",
      icon: Landmark,
      color: "from-aurora-blue to-galaxy-blue-giant",
      bgColor: "bg-black/30",
      borderColor: "border-galaxy-nova/30",
      details: "Thematic maps focus on displaying specific data patterns across geographical areas. They can show population density, climate patterns, economic activity, resource distribution, or cultural diffusion. These maps help students understand complex concepts through visual spatial representation.",
      examples: [
        { name: "World Population Density", description: "Heat map showing population concentration across continents." },
        { name: "Climate Zones", description: "Map displaying Köppen climate classification system worldwide." },
        { name: "Agricultural Production", description: "Map showing major crop production regions globally." }
      ]
    },
    {
      id: "outline",
      title: "Outline Maps",
      description: "Blank or partially labeled maps for practice and assessment.",
      icon: FileText,
      color: "from-aurora-green to-galaxy-blue-giant",
      bgColor: "bg-black/30",
      borderColor: "border-galaxy-nova/30",
      details: "These blank or partially labeled maps allow students to practice identifying geographical features, political borders, and important locations. They're essential for active learning and self-assessment in geography education.",
      examples: [
        { name: "World Countries Outline", description: "Blank map with country borders for labeling exercises." },
        { name: "U.S. States Outline", description: "Unlabeled map of the United States for state identification practice." },
        { name: "European Rivers Outline", description: "Map with major European rivers for labeling hydrological features." }
      ]
    },
    {
      id: "relief",
      title: "Relief Maps",
      description: "Three-dimensional representations of terrain and elevation.",
      icon: Mountain,
      color: "from-galaxy-star to-galaxy-nova",
      bgColor: "bg-black/30",
      borderColor: "border-galaxy-nova/30",
      details: "Relief maps provide tactile, three-dimensional representations of terrain and elevation. They help students understand how landforms like mountains, valleys, and plateaus affect human settlement, agriculture, and historical development.",
      examples: [
        { name: "Himalayan Mountain Range", description: "3D relief map showing the world's highest mountains." },
        { name: "Grand Canyon Relief", description: "Detailed topographical representation of erosion patterns." },
        { name: "Alps Mountain Relief", description: "Physical model showing Alpine passes and valleys." }
      ]
    },
    {
      id: "interactive",
      title: "Interactive Maps",
      description: "Digital maps with layers of information and interactive features.",
      icon: Navigation,
      color: "from-aurora-purple to-galaxy-nova",
      bgColor: "bg-black/30",
      borderColor: "border-galaxy-nova/30",
      details: "Digital interactive maps allow students to explore multiple layers of geographic information. Students can toggle between different data sets, zoom in on specific regions, and observe how different factors interact across space and time.",
      examples: [
        { name: "Historical Battles Explorer", description: "Interactive timeline with battle locations throughout history." },
        { name: "Climate Change Visualization", description: "Time-lapse map showing temperature and ice cap changes." },
        { name: "Cultural Diffusion Patterns", description: "Interactive map showing spread of languages and cultural practices." }
      ]
    },
    {
      id: "concept",
      title: "Concept Maps",
      description: "Visual representations of relationships between concepts.",
      icon: Network,
      color: "from-aurora-pink to-galaxy-nova",
      bgColor: "bg-black/30",
      borderColor: "border-galaxy-nova/30",
      details: "Concept maps help organize and connect ideas in geography and history. They visualize how different historical events are connected, how geographical features influence societies, and how complex systems interact.",
      examples: [
        { name: "Causes of World War I", description: "Concept map showing interrelated factors leading to global conflict." },
        { name: "Industrial Revolution Effects", description: "Map of interconnected social, economic, and political changes." },
        { name: "Climate Systems Interactions", description: "Concept map showing relationships between climate components." }
      ]
    }
  ];
  
  // Get the current map type data
  const currentMapType = mapTypes.find(type => type.id === currentView) || mapTypes[0];
  
  // Handle loading a specific map example
  const handleLoadMapExample = (exampleName: string) => {
    setSelectedMapExample(exampleName);
    setIsMapLoaded(true);
    
    toast({
      title: "Map Loaded",
      description: `${exampleName} has been loaded`,
    });
  };
  
  return (
    <MainLayout>
      <div className="container max-w-7xl py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-galaxy-star via-galaxy-nova to-galaxy-blue-giant bg-clip-text text-transparent mb-4">Educational Maps</h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Explore different types of maps essential for understanding history and geography.
          </p>
        </div>
        
        <Separator className="mb-10 bg-gradient-to-r from-galaxy-nova/20 via-galaxy-blue-giant/20 to-aurora-purple/20 h-0.5 rounded-full" />
        
        {/* Map Style Editor Button - Now more prominent in the main UI */}
        <div className="flex justify-end mb-4">
          <Button 
            onClick={() => setShowStyleEditor(!showStyleEditor)}
            className="relative flex items-center gap-2 group"
            variant="galaxy"
          >
            <Palette className="w-4 h-4" />
            {showStyleEditor ? "Hide Map Style Editor" : "Open Map Style Editor"}
            <span className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-galaxy-nova/0 via-galaxy-nova/50 to-galaxy-nova/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </Button>
        </div>
        
        {/* Map Explorer */}
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-background' : 'relative'}`}>
          <div className={`${isFullscreen ? 'h-full' : 'min-h-[600px]'} relative overflow-hidden rounded-xl backdrop-blur-sm border border-galaxy-nova/30 shadow-lg shadow-galaxy-nova/10 bg-gradient-to-b from-background to-background/70`}>
            {/* Visualization Controls */}
            <VisualizationControls 
              visualizationType="timeline"
              onToggleFullscreen={toggleFullscreen}
              isFullscreen={isFullscreen}
              onExport={() => toast({ title: "Success", description: "Map exported as SVG" })}
              onExportPDF={() => toast({ title: "Success", description: "Map exported as PDF" })}
            />
            
            {/* Map Content Area */}
            <div className="h-full p-6 pt-16">
              <Tabs 
                value={currentView} 
                onValueChange={(value) => {
                  setCurrentView(value as any);
                  setIsMapLoaded(false);
                  setSelectedMapExample(null);
                }} 
                className="h-full"
              >
                <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2 bg-black/30 backdrop-blur-sm h-auto p-1 rounded-xl border border-galaxy-nova/20">
                  {mapTypes.map((type) => (
                    <TabsTrigger 
                      key={type.id} 
                      value={type.id}
                      className="flex flex-col items-center gap-2 p-3 h-auto data-[state=active]:bg-galaxy-nova/20 data-[state=active]:backdrop-blur-md data-[state=active]:text-foreground data-[state=active]:border-galaxy-nova/30 border border-transparent"
                    >
                      <type.icon className={`w-5 h-5 bg-gradient-to-r ${type.color} bg-clip-text text-transparent`} />
                      <span className="text-xs font-medium text-foreground/90">{type.title}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {mapTypes.map((type) => (
                  <TabsContent key={type.id} value={type.id} className="mt-6 h-full">
                    <div className="grid md:grid-cols-7 gap-6 h-full">
                      {/* Map Display Area */}
                      <div className={`${showStyleEditor ? 'md:col-span-4' : 'md:col-span-5'} rounded-xl overflow-hidden relative min-h-[400px]`}>
                        {isMapLoaded ? (
                          <MapDisplay 
                            mapType={currentView}
                            mapTitle={selectedMapExample || type.title}
                            mapSubtitle={type.description}
                            regionData={generatedContent?.entities}
                            currentStyle={currentMapStyle}
                          />
                        ) : (
                          <div className="rounded-xl border border-galaxy-nova/20 bg-black/30 backdrop-blur-sm flex items-center justify-center relative overflow-hidden min-h-[400px] h-full">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(142,101,218,0.08)_0,_transparent_70%)]"></div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                              <type.icon className="w-32 h-32" />
                            </div>
                            <Button 
                              className="relative z-10 nebula-button"
                              onClick={() => {
                                setIsMapLoaded(true);
                                setSelectedMapExample(type.title);
                                toast({
                                  title: "Map Generated",
                                  description: `${type.title} has been loaded`,
                                });
                              }}
                            >
                              <MapIcon className="mr-2 h-4 w-4" />
                              Load {type.title} 
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Style Editor (when enabled) */}
                      {showStyleEditor && (
                        <div className="md:col-span-3 space-y-4">
                          <Card className="border border-galaxy-nova/30 bg-black/30 backdrop-blur-sm shadow-md shadow-galaxy-nova/10">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5 text-galaxy-nova" />
                                Map Style Editor
                              </CardTitle>
                              <CardDescription>
                                Customize the appearance of your historical map
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <MapStyleEditor 
                                onStyleChange={handleStyleChange}
                                currentMapType={currentView}
                              />
                            </CardContent>
                          </Card>
                        </div>
                      )}
                      
                      {/* Info Panel (smaller when style editor is shown) */}
                      <div className={`${showStyleEditor ? 'md:col-span-3' : 'md:col-span-2'} space-y-4`}>
                        <Card className="border border-galaxy-nova/30 bg-black/30 backdrop-blur-sm shadow-md shadow-galaxy-nova/10">
                          <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-foreground">
                              <type.icon className={`w-5 h-5 bg-gradient-to-r ${type.color} bg-clip-text text-transparent`} />
                              {type.title}
                            </CardTitle>
                            <CardDescription className="text-foreground/70">{type.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-foreground/70 leading-relaxed">{type.details}</p>
                          </CardContent>
                        </Card>
                        
                        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-galaxy-nova/20 p-4">
                          <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-foreground/90">
                            <BookOpen className="w-4 h-4 text-galaxy-nova" />
                            Examples
                          </h3>
                          <ul className="space-y-3">
                            {type.examples.map((example, index) => (
                              <li 
                                key={index} 
                                className={`text-sm p-2 rounded-lg hover:bg-galaxy-nova/10 transition-colors cursor-pointer ${selectedMapExample === example.name ? 'bg-galaxy-nova/20 border border-galaxy-nova/30' : ''}`}
                                onClick={() => handleLoadMapExample(example.name)}
                              >
                                <div className="font-medium text-foreground/90">{example.name}</div>
                                <div className="text-foreground/60 text-xs mt-1">{example.description}</div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start text-foreground/80 hover:text-foreground border-galaxy-nova/20 hover:border-galaxy-nova/40 hover:bg-galaxy-nova/5 transition-all"
                            onClick={() => {
                              toast({
                                title: "Map Details",
                                description: `Details for ${currentMapType.title} opened`,
                              });
                            }}
                          >
                            <Info className="mr-2 h-4 w-4 text-galaxy-nova" />
                            Map Details
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start text-foreground/80 hover:text-foreground border-galaxy-nova/20 hover:border-galaxy-nova/40 hover:bg-galaxy-nova/5 transition-all"
                            onClick={() => {
                              toast({
                                title: "Download Started",
                                description: `Downloading ${currentMapType.title}`,
                              });
                            }}
                          >
                            <Download className="mr-2 h-4 w-4 text-galaxy-nova" />
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start text-foreground/80 hover:text-foreground border-galaxy-nova/20 hover:border-galaxy-nova/40 hover:bg-galaxy-nova/5 transition-all"
                            onClick={() => {
                              toast({
                                title: "Historical Context",
                                description: `Context for ${currentMapType.title} opened`,
                              });
                            }}
                          >
                            <History className="mr-2 h-4 w-4 text-galaxy-nova" />
                            Historical Context
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </div>
        
        {/* Additional resources section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-foreground bg-gradient-to-r from-galaxy-star via-galaxy-nova to-galaxy-blue-giant bg-clip-text text-transparent">Additional Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-black/30 backdrop-blur-sm border border-galaxy-nova/20 shadow-lg shadow-galaxy-nova/5 hover:shadow-xl hover:shadow-galaxy-nova/10 hover:border-galaxy-nova/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-foreground/90">Teaching with Maps</CardTitle>
                <CardDescription className="text-foreground/70">Educational strategies for map-based learning</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 text-sm leading-relaxed">Discover effective methods for incorporating different map types into your history and geography curriculum.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full text-foreground/80 hover:text-foreground border-galaxy-nova/20 hover:border-galaxy-nova/40 hover:bg-galaxy-nova/5 transition-all">Learn More</Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-black/30 backdrop-blur-sm border border-galaxy-nova/20 shadow-lg shadow-galaxy-nova/5 hover:shadow-xl hover:shadow-galaxy-nova/10 hover:border-galaxy-nova/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-foreground/90">Map Creation Tools</CardTitle>
                <CardDescription className="text-foreground/70">Resources for creating custom educational maps</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 text-sm leading-relaxed">Explore software and online tools that help educators and students create customized maps for specific learning objectives.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full text-foreground/80 hover:text-foreground border-galaxy-nova/20 hover:border-galaxy-nova/40 hover:bg-galaxy-nova/5 transition-all">View Tools</Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-black/30 backdrop-blur-sm border border-galaxy-nova/20 shadow-lg shadow-galaxy-nova/5 hover:shadow-xl hover:shadow-galaxy-nova/10 hover:border-galaxy-nova/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-foreground/90">Map Analysis Workshop</CardTitle>
                <CardDescription className="text-foreground/70">Learn to interpret and analyze historical maps</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 text-sm leading-relaxed">Develop critical thinking skills by learning how to analyze and interpret various types of historical and geographical maps.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full text-foreground/80 hover:text-foreground border-galaxy-nova/20 hover:border-galaxy-nova/40 hover:bg-galaxy-nova/5 transition-all">Join Workshop</Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Maps;
