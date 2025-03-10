
import React, { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Globe, Clock, Map, ScrollText, Search, Sparkles, PenTool, History } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const Storytelling = () => {
  const [storyContext, setStoryContext] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyPeriod, setStoryPeriod] = useState("ancient");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState("");
  const [activeTab, setActiveTab] = useState("create");

  const handleGenerateStory = () => {
    if (!storyContext.trim()) {
      toast({
        title: "Context Required",
        description: "Please provide some historical context for your story.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate story generation
    setTimeout(() => {
      const periods = {
        "ancient": "Ancient World (3000 BCE - 500 CE)",
        "medieval": "Medieval Era (500 - 1400 CE)",
        "renaissance": "Renaissance (1400 - 1700 CE)",
        "earlyModern": "Early Modern (1700 - 1900 CE)",
        "modern": "Modern Era (1900 CE - Present)"
      };
      
      const periodName = periods[storyPeriod as keyof typeof periods];
      
      const exampleStory = `# ${storyTitle || "The Untold Chronicles"}

## ${periodName}

As the sun rose over the ancient horizon, casting long shadows across the landscape, the story of our civilization began to unfold. In this age of discovery and conquest, every step taken was a step into the unknown.

The air was thick with the scent of spices brought from distant lands, carried by merchant ships that braved treacherous waters. Markets bustled with activity as traders bartered goods and shared tales from far-off kingdoms.

In the palace, scribes meticulously recorded the events of the day, their quills scratching against parchment, preserving history for generations to come. The weight of governance rested heavily on the shoulders of rulers who sought to expand their influence while maintaining peace.

Outside the city walls, farmers tilled the fertile soil, their labor feeding the growing population. Innovations in agriculture allowed communities to flourish, creating surplus that fueled cultural advancement.

Artisans crafted wonders of beauty and function, their skills passed down through careful apprenticeship. Every object told a story of its maker's dedication and the society that valued their work.

As night fell, elders gathered the young around fires, recounting legends that explained the world and instilled values. These oral traditions bound communities together with shared identity and purpose.

Through seasons of plenty and hardship, the resilience of the human spirit prevailed, leaving behind a legacy that would inspire countless generations to come.`;
      
      setGeneratedStory(exampleStory);
      setIsGenerating(false);
      setActiveTab("view");
      
      toast({
        title: "Story Generated",
        description: "Your historical narrative has been created successfully.",
      });
    }, 3000);
  };

  return (
    <MainLayout>
      <div className="container max-w-7xl py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-galaxy-star via-galaxy-nova to-galaxy-blue-giant bg-clip-text text-transparent mb-4">
            Historical Storytelling
          </h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Explore and create immersive historical narratives
          </p>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="create" className="data-[state=active]:bg-galaxy-nova/20">
              <PenTool className="mr-2 h-4 w-4" />
              Create
            </TabsTrigger>
            <TabsTrigger value="view" className="data-[state=active]:bg-galaxy-nova/20">
              <ScrollText className="mr-2 h-4 w-4" />
              View
            </TabsTrigger>
            <TabsTrigger value="explore" className="data-[state=active]:bg-galaxy-nova/20">
              <Search className="mr-2 h-4 w-4" />
              Explore
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-6">
            <Card className="border border-galaxy-nova/30 bg-black/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-galaxy-nova" />
                  Create Historical Narrative
                </CardTitle>
                <CardDescription>
                  Generate immersive storytelling based on historical context and time periods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storyTitle">Title</Label>
                  <Input 
                    id="storyTitle" 
                    placeholder="Enter a title for your historical narrative" 
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storyPeriod">Historical Period</Label>
                  <Select value={storyPeriod} onValueChange={setStoryPeriod}>
                    <SelectTrigger id="storyPeriod">
                      <SelectValue placeholder="Select a historical period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ancient">Ancient World (3000 BCE - 500 CE)</SelectItem>
                      <SelectItem value="medieval">Medieval Era (500 - 1400 CE)</SelectItem>
                      <SelectItem value="renaissance">Renaissance (1400 - 1700 CE)</SelectItem>
                      <SelectItem value="earlyModern">Early Modern (1700 - 1900 CE)</SelectItem>
                      <SelectItem value="modern">Modern Era (1900 CE - Present)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storyContext">Historical Context</Label>
                  <Textarea 
                    id="storyContext" 
                    placeholder="Describe the historical events, figures, or settings you want to include in your narrative..." 
                    className="min-h-[150px]"
                    value={storyContext}
                    onChange={(e) => setStoryContext(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2 text-sm text-foreground/60 py-2">
                  <Clock className="h-4 w-4 text-galaxy-nova" />
                  <span>Generated stories are enhanced with appropriate historical details and imagery.</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleGenerateStory}
                  disabled={isGenerating}
                  className="w-full bg-galaxy-nova hover:bg-galaxy-nova/90 relative overflow-hidden group"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGenerating ? "Generating Narrative..." : "Generate Historical Narrative"}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </Button>
              </CardFooter>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-galaxy-nova/30 bg-black/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Map className="h-5 w-5 text-galaxy-nova" />
                    Map Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/70">
                    Connect your narrative to interactive maps to visualize historical locations and movements.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full border-galaxy-nova/20" asChild>
                    <a href="/maps">Explore Maps</a>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="border border-galaxy-nova/30 bg-black/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-galaxy-nova" />
                    Timeline Creation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/70">
                    Develop chronological storytelling with interactive timelines showing key historical events.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full border-galaxy-nova/20">
                    Create Timeline
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="border border-galaxy-nova/30 bg-black/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5 text-galaxy-nova" />
                    Cultural Context
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/70">
                    Add cultural, social, and economic context to enrich your historical narratives.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full border-galaxy-nova/20">
                    Add Context
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="view">
            {generatedStory ? (
              <Card className="border border-galaxy-nova/30 bg-black/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ScrollText className="h-5 w-5 text-galaxy-nova" />
                    {storyTitle || "Historical Narrative"}
                  </CardTitle>
                  <CardDescription>
                    An immersive journey through {storyPeriod === "ancient" ? "Ancient" : 
                                                storyPeriod === "medieval" ? "Medieval" : 
                                                storyPeriod === "renaissance" ? "Renaissance" : 
                                                storyPeriod === "earlyModern" ? "Early Modern" : "Modern"} history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none prose-invert">
                    {generatedStory.split('\n\n').map((paragraph, index) => {
                      if (paragraph.startsWith('# ')) {
                        return <h1 key={index} className="text-2xl font-bold mt-6 mb-4 text-foreground animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>{paragraph.substring(2)}</h1>;
                      } else if (paragraph.startsWith('## ')) {
                        return <h2 key={index} className="text-xl font-semibold mt-5 mb-3 text-foreground/90 animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>{paragraph.substring(3)}</h2>;
                      } else {
                        return <p key={index} className="my-3 text-foreground/80 leading-relaxed animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>{paragraph}</p>;
                      }
                    })}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-3">
                  <Button variant="default" className="w-full sm:w-auto bg-galaxy-nova hover:bg-galaxy-nova/90">
                    <Map className="mr-2 h-4 w-4" />
                    View on Map
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto border-galaxy-nova/20">
                    <History className="mr-2 h-4 w-4" />
                    Create Timeline
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto border-galaxy-nova/20">
                    <PenTool className="mr-2 h-4 w-4" />
                    Edit Narrative
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="border border-galaxy-nova/30 bg-black/30 backdrop-blur-sm text-center p-10">
                <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
                  <ScrollText className="h-16 w-16 text-galaxy-nova/30 mb-4" />
                  <h3 className="text-xl font-medium text-foreground/70 mb-2">No Narratives Yet</h3>
                  <p className="text-foreground/50 max-w-md mx-auto">
                    Generate your first historical narrative in the Create tab to see it displayed here.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-6 border-galaxy-nova/20"
                    onClick={() => setActiveTab("create")}
                  >
                    <PenTool className="mr-2 h-4 w-4" />
                    Create Your First Narrative
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="explore">
            <Card className="border border-galaxy-nova/30 bg-black/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-galaxy-nova" />
                  Explore Historical Narratives
                </CardTitle>
                <CardDescription>
                  Discover curated historical stories from different periods and regions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "The Rise and Fall of Rome",
                      period: "Ancient World",
                      excerpt: "From humble beginnings to empire, the story of Rome's ascent and eventual decline...",
                      image: "roman-empire"
                    },
                    {
                      title: "Life in Medieval Europe",
                      period: "Medieval Era",
                      excerpt: "Explore the daily routines, social structures, and cultural practices of medieval societies...",
                      image: "medieval-life"
                    },
                    {
                      title: "Age of Discovery",
                      period: "Renaissance",
                      excerpt: "Follow the journeys of explorers who mapped the globe and connected distant civilizations...",
                      image: "exploration"
                    },
                    {
                      title: "Industrial Revolution",
                      period: "Early Modern",
                      excerpt: "Witness the transformation of society through technological advancement and urban growth...",
                      image: "industrial"
                    }
                  ].map((story, index) => (
                    <div key={index} className="flex flex-col border border-galaxy-nova/20 rounded-lg overflow-hidden hover:border-galaxy-nova/40 transition-colors cursor-pointer group">
                      <div className="h-32 bg-gradient-to-r from-galaxy-nova/20 to-galaxy-blue-giant/20 flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-galaxy-nova/70 group-hover:text-galaxy-nova transition-colors" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-foreground group-hover:text-galaxy-nova transition-colors">{story.title}</h3>
                        <p className="text-xs text-galaxy-nova/70 mt-1">{story.period}</p>
                        <p className="text-sm text-foreground/70 mt-2">{story.excerpt}</p>
                        <div className="mt-3 text-sm text-foreground/60 group-hover:text-galaxy-nova transition-colors">Read more →</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full border-galaxy-nova/20">
                  Browse All Narratives
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Storytelling;
