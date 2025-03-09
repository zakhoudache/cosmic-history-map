
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, ArrowDown, ArrowUp, HistoryIcon, Sparkles } from 'lucide-react';
import VisualizationControls from '@/components/VisualizationControls';
import { toast } from "sonner";
import { cn } from '@/lib/utils';
import { useIntersectionObserver, useStaggeredAnimation } from '@/utils/animations';

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  impact: number; // 1-10
  category: string;
}

interface StoryPoint {
  id: string;
  title: string;
  description: string;
  events: TimelineEvent[];
  connections: string[]; // ids of connected points
}

const mockStoryData: StoryPoint[] = [
  {
    id: "p1",
    title: "Dawn of the Renaissance",
    description: "The early 15th century saw the rebirth of classical arts and learning in Italy.",
    events: [
      {
        id: "e1",
        title: "Fall of Constantinople",
        date: "1453",
        description: "Byzantine scholars fled to Italy, bringing ancient Greek texts.",
        impact: 8,
        category: "political"
      },
      {
        id: "e2",
        title: "Gutenberg's Printing Press",
        date: "1440",
        description: "The invention of the printing press revolutionized information sharing.",
        impact: 10,
        category: "technological"
      }
    ],
    connections: ["p2"]
  },
  {
    id: "p2",
    title: "Artistic Revolution",
    description: "New techniques in perspective, realism, and expression transformed visual arts.",
    events: [
      {
        id: "e3",
        title: "Brunelleschi's Dome",
        date: "1436",
        description: "The architectural marvel of Florence Cathedral's dome was completed.",
        impact: 7,
        category: "cultural"
      },
      {
        id: "e4",
        title: "Da Vinci's Workshop",
        date: "1470s",
        description: "Leonardo da Vinci began his career as an artist and inventor.",
        impact: 9,
        category: "cultural"
      }
    ],
    connections: ["p1", "p3"]
  },
  {
    id: "p3",
    title: "Scientific Advancement",
    description: "Observation and experimentation became foundations of the scientific method.",
    events: [
      {
        id: "e5",
        title: "Copernicus' Heliocentric Theory",
        date: "1543",
        description: "The revolutionary idea that the Earth orbits the Sun was published.",
        impact: 10,
        category: "scientific"
      },
      {
        id: "e6",
        title: "Vesalius' Anatomy Studies",
        date: "1543",
        description: "Modern anatomical study began with detailed human dissection illustrations.",
        impact: 8,
        category: "scientific"
      }
    ],
    connections: ["p2", "p4"]
  },
  {
    id: "p4",
    title: "Global Exploration",
    description: "European powers launched voyages of discovery, connecting continents.",
    events: [
      {
        id: "e7",
        title: "Columbus Reaches Americas",
        date: "1492",
        description: "The voyage initiated sustained European contact with the Americas.",
        impact: 10,
        category: "exploration"
      },
      {
        id: "e8",
        title: "Magellan's Circumnavigation",
        date: "1522",
        description: "The first expedition to circle the globe was completed.",
        impact: 9,
        category: "exploration"
      }
    ],
    connections: ["p3", "p5"]
  },
  {
    id: "p5",
    title: "Renaissance Legacy",
    description: "The ideas and achievements of the Renaissance shaped the modern world.",
    events: [
      {
        id: "e9",
        title: "Reformation Begins",
        date: "1517",
        description: "Martin Luther's 95 Theses sparked religious reform across Europe.",
        impact: 9,
        category: "religious"
      },
      {
        id: "e10",
        title: "Shakespeare's First Plays",
        date: "1590",
        description: "The Renaissance spirit lived on in literature and theater.",
        impact: 8,
        category: "cultural"
      }
    ],
    connections: ["p4"]
  }
];

interface StoryPointNodeProps {
  point: StoryPoint;
  isSelected: boolean;
  onSelect: (point: StoryPoint) => void;
  index: number;
  isVisible: boolean;
}

const StoryPointNode: React.FC<StoryPointNodeProps> = ({ point, isSelected, onSelect, index, isVisible }) => {
  return (
    <div 
      className={cn(
        "p-6 rounded-lg border transition-all duration-500 cursor-pointer relative z-10",
        isSelected 
          ? "border-galaxy-nova shadow-lg shadow-galaxy-nova/20 bg-galaxy-core/40" 
          : "border-galaxy-nova/30 hover:border-galaxy-nova/70 shadow-md hover:shadow-galaxy-nova/10 bg-galaxy-core/20",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
      onClick={() => onSelect(point)}
    >
      <h3 className="text-xl font-bold mb-2 text-galaxy-nova">{point.title}</h3>
      <p className="text-sm text-foreground/80 mb-4">{point.description}</p>
      
      {isSelected && (
        <div className="mt-4 space-y-4">
          <Separator className="bg-galaxy-nova/30" />
          <h4 className="text-sm font-semibold text-galaxy-star">Key Events:</h4>
          <div className="space-y-3">
            {point.events.map((event, eventIndex) => (
              <div 
                key={event.id} 
                className={cn(
                  "p-3 rounded-md bg-galaxy-core/30 border border-galaxy-nova/20 transition-all duration-300",
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
                )}
                style={{ transitionDelay: `${(index * 100) + (eventIndex * 50)}ms` }}
              >
                <div className="flex justify-between items-start">
                  <h5 className="font-medium text-galaxy-star">{event.title}</h5>
                  <span className="px-2 py-1 text-xs rounded-full bg-galaxy-nova/20 text-galaxy-star">{event.date}</span>
                </div>
                <p className="mt-1 text-xs text-foreground/70">{event.description}</p>
                <div className="mt-2 w-full bg-galaxy-core/40 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-galaxy-star to-galaxy-nova h-1.5 rounded-full transition-all duration-1000"
                    style={{ 
                      width: isVisible ? `${event.impact * 10}%` : '0%',
                      transitionDelay: `${(index * 100) + (eventIndex * 100) + 200}ms`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TimelineWalker: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [position, setPosition] = useState(0);
  
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setPosition(prev => {
        const newPos = prev + 1;
        return newPos > 100 ? 0 : newPos;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  return (
    <div 
      className="absolute h-4 w-4 rounded-full bg-galaxy-star shadow-lg shadow-galaxy-nova/50 z-20 transition-all duration-500"
      style={{ 
        left: `calc(${position}% - 8px)`,
        top: 'calc(50% - 8px)',
        opacity: isActive ? 1 : 0,
        filter: `blur(${isActive ? '0px' : '10px'})`,
        boxShadow: `0 0 15px 5px rgba(var(--galaxy-nova), ${isActive ? 0.7 : 0})`
      }}
    />
  );
};

const StorytellingSection: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState<StoryPoint | null>(null);
  const [activeTab, setActiveTab] = useState("vertical");
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sectionRef, isSectionVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [contentRef, isContentVisible] = useIntersectionObserver({ threshold: 0.2 });
  const [walkerActive, setWalkerActive] = useState(false);
  
  useEffect(() => {
    if (isSectionVisible) {
      // Delay the walker animation start
      const timer = setTimeout(() => {
        setWalkerActive(true);
      }, 800);
      
      return () => clearTimeout(timer);
    } else {
      setWalkerActive(false);
    }
  }, [isSectionVisible]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleExport = () => {
    try {
      if (!containerRef.current) return;
      
      // Create a temporary element to clone the visualization
      const clone = containerRef.current.cloneNode(true) as HTMLElement;
      const serializer = new XMLSerializer();
      const svgData = serializer.serializeToString(clone);
      
      // Create a Blob and download link
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = 'historical-story.svg';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast.success("Story visualization exported successfully");
    } catch (error) {
      console.error("Error exporting visualization:", error);
      toast.error("Failed to export visualization");
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setIsFullscreen(!isFullscreen);
  };

  const handleSelectPoint = (point: StoryPoint) => {
    setSelectedPoint(prev => prev?.id === point.id ? null : point);
  };

  return (
    <section ref={sectionRef as React.RefObject<HTMLDivElement>} className="mb-10">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-galaxy-star via-cosmic-light to-galaxy-nova bg-clip-text text-transparent mb-4">Historical Storyline</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Explore the narrative flow of historical events through an interactive visual storyline.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6 bg-secondary/80 border border-galaxy-nova/20 p-1 max-w-md mx-auto">
          <TabsTrigger 
            value="vertical" 
            className="flex items-center gap-2 data-[state=active]:bg-galaxy-nova/20 data-[state=active]:text-galaxy-nova"
          >
            <ArrowDown className="h-4 w-4" />
            Vertical Flow
          </TabsTrigger>
          <TabsTrigger 
            value="story" 
            className="flex items-center gap-2 data-[state=active]:bg-galaxy-nova/20 data-[state=active]:text-galaxy-nova"
          >
            <Book className="h-4 w-4" />
            Story Mode
          </TabsTrigger>
        </TabsList>
        
        <div className="relative w-full overflow-hidden border border-galaxy-nova/30 rounded-lg shadow-lg shadow-galaxy-core/10 bg-galaxy-core/5 backdrop-blur-sm">
          <VisualizationControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onToggleFullscreen={handleToggleFullscreen}
            onExport={handleExport}
            isFullscreen={isFullscreen}
          />
          
          <TabsContent value="vertical" className="mt-0">
            <div 
              ref={containerRef}
              className="overflow-auto transition-all"
              style={{ 
                height: "800px", 
                width: "100%", 
                maxWidth: "2000px", 
                margin: "0 auto",
                transform: `scale(${zoom})`,
                transformOrigin: "top center"
              }}
            >
              <div ref={contentRef as React.RefObject<HTMLDivElement>} className="py-10 px-6 w-full h-full flex flex-col items-center relative">
                {/* Timeline Path */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1.5 bg-gradient-to-b from-galaxy-nova/10 via-galaxy-nova/30 to-galaxy-nova/10 rounded-full z-0"></div>
                
                {/* Moving Walker */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 z-0 overflow-hidden">
                  <TimelineWalker isActive={walkerActive && isContentVisible} />
                </div>
                
                {/* Story points */}
                <div className="grid grid-cols-1 gap-28 w-full max-w-2xl relative z-10">
                  {mockStoryData.map((point, index) => (
                    <div key={point.id} className="relative">
                      {/* Timeline node */}
                      <div 
                        className={cn(
                          "absolute left-1/2 top-1/2 w-6 h-6 rounded-full -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-700",
                          isSectionVisible 
                            ? "scale-100 opacity-100" 
                            : "scale-0 opacity-0",
                          selectedPoint?.id === point.id 
                            ? "bg-galaxy-nova shadow-lg shadow-galaxy-nova/50" 
                            : "bg-galaxy-star/60 shadow-md shadow-galaxy-star/30"
                        )}
                        style={{ transitionDelay: `${index * 150}ms` }}
                      />
                      
                      {/* Content positioned to alternate sides */}
                      <div className={`ml-${index % 2 === 0 ? 'auto pr-16' : '16 pl-auto'} w-[calc(50%-40px)]`}>
                        <StoryPointNode 
                          point={point}
                          isSelected={selectedPoint?.id === point.id}
                          onSelect={handleSelectPoint}
                          index={index}
                          isVisible={isSectionVisible}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="story" className="mt-0">
            <div 
              ref={containerRef}
              className="overflow-auto transition-all"
              style={{ 
                height: "800px", 
                width: "100%", 
                maxWidth: "2000px", 
                margin: "0 auto",
                transform: `scale(${zoom})`,
                transformOrigin: "top center"
              }}
            >
              <div className="p-10 w-full h-full">
                <div className="max-w-4xl mx-auto glass rounded-lg border border-galaxy-nova/30 p-8 shadow-lg shadow-galaxy-core/10">
                  <h3 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-galaxy-star to-galaxy-nova bg-clip-text text-transparent">
                    The Renaissance: Europe's Rebirth
                  </h3>
                  
                  <div className="prose prose-invert max-w-none prose-headings:text-galaxy-nova prose-p:text-foreground/80">
                    <p className="lead text-lg">
                      The Renaissance marked a period of explosive growth in art, science, literature, and exploration that forever changed European civilization and laid foundations for the modern world.
                    </p>
                    
                    <div className="my-8 relative">
                      {/* Horizontal timeline */}
                      <div className="absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-galaxy-nova/10 via-galaxy-nova/40 to-galaxy-nova/10 -translate-y-1/2 rounded-full"></div>
                      
                      {/* Moving walker on horizontal timeline */}
                      <TimelineWalker isActive={walkerActive && isContentVisible} />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {mockStoryData.map((point, index) => (
                          <div 
                            key={point.id}
                            className={cn(
                              "p-4 rounded-lg border border-galaxy-nova/30 bg-galaxy-core/20 hover:bg-galaxy-core/30 transition-all duration-500 relative",
                              isSectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                            )}
                            style={{ transitionDelay: `${index * 150}ms` }}
                          >
                            {/* Timeline node */}
                            <div className={cn(
                              "absolute left-1/2 -top-4 w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 z-10 border-2 border-galaxy-core/80 transition-all duration-700",
                              isSectionVisible 
                                ? "scale-100 opacity-100" 
                                : "scale-0 opacity-0",
                              "bg-galaxy-nova shadow-sm shadow-galaxy-nova/50"
                            )} style={{ transitionDelay: `${index * 200}ms` }} />
                            
                            <h4 className="text-lg font-semibold text-galaxy-star mb-2">{point.title}</h4>
                            <p className="text-sm">{point.description}</p>
                            <div className="mt-3 text-xs text-galaxy-nova/70">
                              Key events: {point.events.length}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <p>
                      Beginning in 15th century Italy, the Renaissance represented a bridge between the Middle Ages and the Modern era. The period was characterized by a renewed interest in the classical learning of ancient Greece and Rome, as well as an emphasis on individual achievement and expression.
                    </p>
                    
                    <div className={cn(
                      "my-6 rounded-lg border border-galaxy-nova/20 p-4 bg-galaxy-core/10 transition-all duration-700",
                      isSectionVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
                    )}>
                      <h5 className="font-semibold text-galaxy-nova mb-2">Major Contributions</h5>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li className={cn(
                          "transition-all duration-500",
                          isSectionVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
                        )} style={{ transitionDelay: "100ms" }}>
                          <span className="text-galaxy-star">Art:</span> Perspective, realism, and emotional expression
                        </li>
                        <li className={cn(
                          "transition-all duration-500",
                          isSectionVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
                        )} style={{ transitionDelay: "200ms" }}>
                          <span className="text-galaxy-star">Science:</span> Observation-based research and the scientific method
                        </li>
                        <li className={cn(
                          "transition-all duration-500",
                          isSectionVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
                        )} style={{ transitionDelay: "300ms" }}>
                          <span className="text-galaxy-star">Technology:</span> Printing press, improved navigation tools
                        </li>
                        <li className={cn(
                          "transition-all duration-500",
                          isSectionVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
                        )} style={{ transitionDelay: "400ms" }}>
                          <span className="text-galaxy-star">Exploration:</span> Age of Discovery connecting continents
                        </li>
                        <li className={cn(
                          "transition-all duration-500",
                          isSectionVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
                        )} style={{ transitionDelay: "500ms" }}>
                          <span className="text-galaxy-star">Philosophy:</span> Humanism focusing on human potential
                        </li>
                      </ul>
                    </div>
                    
                    <p>
                      The Renaissance spirit of inquiry and innovation created a cultural environment where genius could flourish. Figures like Leonardo da Vinci, Michelangelo, Copernicus, and Shakespeare changed our understanding of art, science, and the human condition.
                    </p>
                    
                    <div className="mt-8 text-center">
                      <Button 
                        variant="galaxy" 
                        size="sm"
                        className="group"
                        onClick={() => setActiveTab("vertical")}
                      >
                        Explore Timeline 
                        <ArrowDown className="ml-1 h-4 w-4 transition-transform group-hover:translate-y-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
};

export default StorytellingSection;
