
import React, { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import VisualizationControls from "@/components/VisualizationControls";
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
  Download
} from "lucide-react";

const Maps = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentView, setCurrentView] = useState<"historical" | "thematic" | "outline" | "relief" | "interactive" | "concept">("historical");
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const mapTypes = [
    {
      id: "historical",
      title: "Historical Maps",
      description: "Visualize how territories, borders, and civilizations have changed over time.",
      icon: Globe,
      color: "from-amber-400 to-orange-600",
      bgColor: "bg-amber-50",
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
      color: "from-sky-400 to-blue-600",
      bgColor: "bg-sky-50",
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
      color: "from-emerald-400 to-green-600",
      bgColor: "bg-emerald-50",
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
      color: "from-stone-400 to-stone-600",
      bgColor: "bg-stone-50",
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
      color: "from-violet-400 to-purple-600",
      bgColor: "bg-violet-50",
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
      color: "from-rose-400 to-pink-600",
      bgColor: "bg-rose-50",
      details: "Concept maps help organize and connect ideas in geography and history. They visualize how different historical events are connected, how geographical features influence societies, and how complex systems interact.",
      examples: [
        { name: "Causes of World War I", description: "Concept map showing interrelated factors leading to global conflict." },
        { name: "Industrial Revolution Effects", description: "Map of interconnected social, economic, and political changes." },
        { name: "Climate Systems Interactions", description: "Concept map showing relationships between climate components." }
      ]
    }
  ];
  
  return (
    <MainLayout>
      <div className="container max-w-7xl py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-galaxy-star via-cosmic-light to-galaxy-nova bg-clip-text text-transparent mb-6">Educational Maps</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore different types of maps essential for understanding history and geography.
          </p>
        </div>
        
        <Separator className="mb-16" />
        
        {/* Map Explorer */}
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-background' : 'relative'}`}>
          <div className={`${isFullscreen ? 'h-full' : 'min-h-[600px]'} relative overflow-hidden rounded-lg border border-galaxy-nova/30 shadow-lg shadow-galaxy-core/10`}>
            {/* Visualization Controls */}
            <VisualizationControls 
              visualizationType="graph"
              onToggleFullscreen={toggleFullscreen}
              isFullscreen={isFullscreen}
              onExport={() => toast.success("Map exported as SVG")}
              onExportPDF={() => toast.success("Map exported as PDF")}
            />
            
            {/* Map Content Area */}
            <div className="h-full p-6 pt-16 cosmic-gradient">
              <Tabs 
                value={currentView} 
                onValueChange={(value) => setCurrentView(value as any)} 
                className="h-full"
              >
                <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2 bg-transparent h-auto">
                  {mapTypes.map((type) => (
                    <TabsTrigger 
                      key={type.id} 
                      value={type.id}
                      className={`flex flex-col items-center gap-2 p-3 h-auto data-[state=active]:${type.bgColor} border data-[state=active]:border-galaxy-nova/30`}
                    >
                      <type.icon className={`w-5 h-5 bg-gradient-to-r ${type.color} bg-clip-text text-transparent`} />
                      <span className="text-xs font-medium">{type.title}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {mapTypes.map((type) => (
                  <TabsContent key={type.id} value={type.id} className="mt-6 h-full">
                    <div className="grid md:grid-cols-7 gap-6 h-full">
                      {/* Map Placeholder */}
                      <div className="md:col-span-5 rounded-lg border border-galaxy-nova/20 bg-black/5 flex items-center justify-center relative overflow-hidden min-h-[400px]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0,_transparent_70%)]"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                          <type.icon className="w-32 h-32" />
                        </div>
                        <Button variant="galaxy" className="relative z-10">
                          <MapIcon className="mr-2 h-4 w-4" />
                          Load {type.title} 
                        </Button>
                      </div>
                      
                      {/* Info Panel */}
                      <div className="md:col-span-2 space-y-4">
                        <Card className="border border-galaxy-nova/30 cosmic-gradient shadow-md">
                          <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2">
                              <type.icon className={`w-5 h-5 bg-gradient-to-r ${type.color} bg-clip-text text-transparent`} />
                              {type.title}
                            </CardTitle>
                            <CardDescription>{type.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{type.details}</p>
                          </CardContent>
                        </Card>
                        
                        <div className="bg-background/50 backdrop-blur-sm rounded-lg border border-galaxy-nova/30 p-4">
                          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Examples
                          </h3>
                          <ul className="space-y-3">
                            {type.examples.map((example, index) => (
                              <li key={index} className="text-sm">
                                <div className="font-medium">{example.name}</div>
                                <div className="text-muted-foreground text-xs">{example.description}</div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button variant="outline" className="w-full justify-start">
                            <Info className="mr-2 h-4 w-4" />
                            Map Details
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <History className="mr-2 h-4 w-4" />
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
          <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Teaching with Maps</CardTitle>
                <CardDescription>Educational strategies for map-based learning</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Discover effective methods for incorporating different map types into your history and geography curriculum.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Learn More</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Map Creation Tools</CardTitle>
                <CardDescription>Resources for creating custom educational maps</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Explore software and online tools that help educators and students create customized maps for specific learning objectives.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Tools</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Map Analysis Workshop</CardTitle>
                <CardDescription>Learn to interpret and analyze historical maps</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Develop critical thinking skills by learning how to analyze and interpret various types of historical and geographical maps.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Join Workshop</Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Maps;
