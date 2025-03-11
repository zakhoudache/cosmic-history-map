import React, { useState, useRef } from "react";
import MainLayout from "@/layouts/MainLayout";
import TextInput from "@/components/TextInput";
import VisualizationPlaceholder from "@/components/VisualizationPlaceholder";
import CosmicVisualization from "@/components/CosmicVisualization";
import Timeline from "@/components/Timeline";
import VisualizationControls from "@/components/VisualizationControls";
import { useAuth } from "@/hooks/useAuth";
import StorytellingSection from "@/components/StorytellingSection";
import ElementCard from "@/components/ElementCard";
import { Card } from "@/components/ui/card";
import { exportToPDF } from "@/utils/pdfExport";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Database, BookText, Globe, Play, ViewVertical, Download, CalendarDays } from "lucide-react";
import { mockHistoricalData, arabicHistoricalData, arabicHistoricalSubjects, prepareSimulationData, generateEntitiesFromSubject, HistoricalEntity } from "@/utils/mockData";
import HistoricalVerticalCards from "@/components/HistoricalVerticalCards";

const Visualize = () => {
  const [inputText, setInputText] = useState<string>("");
  const [entities, setEntities] = useState<HistoricalEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [visualizationType, setVisualizationType] = useState<"graph" | "timeline" | "story" | "cards">("graph");
  const [selectedEntity, setSelectedEntity] = useState<HistoricalEntity | null>(null);
  const [useMockData, setUseMockData] = useState<boolean>(false);
  const [useArabicData, setUseArabicData] = useState<boolean>(false);
  const [showArabicSubjects, setShowArabicSubjects] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const { user } = useAuth();
  
  // Use refs for the visualization containers
  const cosmicVisualizationRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const handleTextSubmit = (text: string, analyzedEntities: HistoricalEntity[]) => {
    setInputText(text);
    setEntities(analyzedEntities);
    setLoading(false);
  };

  const handleAnalysisStart = () => {
    setLoading(true);
  };

  const handleVisTypeChange = (type: "graph" | "timeline" | "story" | "cards") => {
    setVisualizationType(type);
  };

  const handleEntitySelect = (entity: HistoricalEntity) => {
    setSelectedEntity(entity);
  };

  const closeDetailsCard = () => {
    setSelectedEntity(null);
  };

  const handleUpdateEntities = (updatedEntities: HistoricalEntity[]) => {
    setEntities(updatedEntities);
  };

  const handleDeleteEntity = (entityId: string) => {
    // Remove the entity
    const updatedEntities = entities.filter(entity => entity.id !== entityId);
    
    // Also remove all relations to this entity
    const entitiesWithUpdatedRelations = updatedEntities.map(entity => {
      if (entity.relations) {
        return {
          ...entity,
          relations: entity.relations.filter(relation => relation.targetId !== entityId)
        };
      }
      return entity;
    });
    
    setEntities(entitiesWithUpdatedRelations);
    toast.success("Entity deleted successfully");
  };

  const toggleMockData = () => {
    if (!useMockData) {
      // Switch to the default mockdata
      const formattedMockData = mockHistoricalData.map(item => ({
        ...item,
        id: item.id,
        name: item.name,
        type: item.type || "Unknown",
        description: item.description || "",
        startDate: item.startDate || "",
        endDate: item.endDate || "",
        significance: item.significance || 5,
        relations: item.relations || [],
        group: item.group || "Unknown",
        location: item.location || "",
        imageUrl: item.imageUrl || "",
      }));
      
      setEntities(formattedMockData);
      setUseMockData(true);
      setUseArabicData(false);
      setShowArabicSubjects(false);
      setSelectedSubject(null);
      setInputText("Mock historical data for visualization demonstration");
      toast.success("English mock historical data loaded successfully");
    } else {
      setUseMockData(false);
      toast.info("Returned to user-provided data");
    }
  };

  const toggleArabicData = () => {
    if (!useArabicData) {
      setEntities(arabicHistoricalData);
      setUseArabicData(true);
      setUseMockData(false);
      setShowArabicSubjects(false);
      setSelectedSubject(null);
      setInputText("بيانات تاريخية عربية للتمثيل البصري");
      toast.success("تم تحميل البيانات التاريخية العربية بنجاح");
    } else {
      setUseArabicData(false);
      toast.info("العودة إلى البيانات المقدمة من المستخدم");
    }
  };

  const toggleArabicSubjects = () => {
    if (!showArabicSubjects) {
      // Just show the subjects as text
      setShowArabicSubjects(true);
      setUseArabicData(false);
      setUseMockData(false);
      setEntities([]);
      setSelectedSubject(null);
      setInputText(arabicHistoricalSubjects.map(subject => 
        `${subject.title}:\n${subject.originalText.substring(0, 200)}...`
      ).join('\n\n'));
      toast.success("تم تحميل المواضيع التاريخية العربية بنجاح");
    } else {
      setShowArabicSubjects(false);
      setInputText("");
      toast.info("العودة إلى البيانات المقدمة من المستخدم");
    }
  };

  const handleSelectSubject = (index: number) => {
    setSelectedSubject(index);
    setLoading(true);
    
    // Simulate loading for a more natural feel
    setTimeout(() => {
      const subject = arabicHistoricalSubjects[index];
      const generatedEntities = generateEntitiesFromSubject(subject);
      
      setEntities(generatedEntities);
      setLoading(false);
      setInputText(`${subject.title}: ${subject.originalText.substring(0, 100)}...`);
      toast.success(`تم إنشاء التمثيل البصري لموضوع "${subject.title}" بنجاح`);
      
      // Automatically switch to cards view when an Arabic subject is selected
      setVisualizationType("cards");
    }, 1000);
  };

  const handleExportPDF = () => {
    if (entities.length === 0) {
      toast.error("No data to export. Please analyze text first.");
      return;
    }
    
    let containerElement = null;
    let title = "";
    let description = "";
    
    // Choose the appropriate container element and titles based on visualization type
    switch (visualizationType) {
      case "graph":
        containerElement = cosmicVisualizationRef.current;
        title = "Cosmic Connections Network Analysis";
        description = `Network visualization of historical entities and their relationships based on the input text: ${inputText.substring(0, 150)}${inputText.length > 150 ? "..." : ""}`;
        break;
        
      case "timeline":
        containerElement = timelineRef.current;
        title = "Historical Timeline Analysis";
        description = `Chronological visualization of historical entities based on the input text: ${inputText.substring(0, 150)}${inputText.length > 150 ? "..." : ""}`;
        break;
        
      case "story":
        containerElement = storyRef.current;
        title = "Historical Narrative Analysis";
        description = `Storytelling analysis presenting historical connections in narrative form based on the input text: ${inputText.substring(0, 150)}${inputText.length > 150 ? "..." : ""}`;
        break;
        
      case "cards":
        containerElement = cardsRef.current;
        title = "العناصر التاريخية المرتبطة بالموضوع";
        description = `بطاقات تفصيلية للعناصر التاريخية المستخرجة من النص: ${inputText.substring(0, 150)}${inputText.length > 150 ? "..." : ""}`;
        break;
    }
    
    // Generate PDF with the appropriate visualization container
    exportToPDF({
      entities,
      title,
      description,
      visualizationType,
      containerElement,
    });
  };

  const showPlaceholder = !inputText || entities.length === 0;

  // Custom controls for the visualization type
  const renderVisualizationTypeSelector = () => (
    <div className="flex space-x-2">
      <Button 
        variant={visualizationType === "graph" ? "secondary" : "outline"} 
        size="sm"
        onClick={() => handleVisTypeChange("graph")}
        className="flex items-center gap-1"
      >
        <Database className="h-4 w-4" />
        Network
      </Button>
      
      <Button 
        variant={visualizationType === "timeline" ? "secondary" : "outline"} 
        size="sm"
        onClick={() => handleVisTypeChange("timeline")}
        className="flex items-center gap-1"
      >
        <CalendarDays className="h-4 w-4" />
        Timeline
      </Button>
      
      <Button 
        variant={visualizationType === "story" ? "secondary" : "outline"} 
        size="sm"
        onClick={() => handleVisTypeChange("story")}
        className="flex items-center gap-1"
      >
        <BookText className="h-4 w-4" />
        Story
      </Button>
      
      <Button 
        variant={visualizationType === "cards" ? "secondary" : "outline"} 
        size="sm"
        onClick={() => handleVisTypeChange("cards")}
        className="flex items-center gap-1"
      >
        <ViewVertical className="h-4 w-4" />
        Cards
      </Button>
    </div>
  );

  return (
    <MainLayout>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(91,33,182,0.15),rgba(0,0,0,0)_70%)]"></div>
      <div className="fixed inset-0 -z-10 bg-background"></div>
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9nPjwvc3ZnPg==')] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-galaxy-star via-galaxy-nova to-galaxy-blue-giant bg-clip-text text-transparent mb-3">
            Visualize Historical Connections
          </h1>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Enter historical text to analyze and visualize connections between people, events, and concepts.
            {user ? " Your visualizations will be saved to your account." : " Sign in to save your visualizations."}
          </p>
        </div>

        <Card className="backdrop-blur-lg bg-black/30 border border-galaxy-nova/30 shadow-xl shadow-galaxy-nova/10 overflow-hidden p-6 mb-8">
          <div className="absolute top-0 right-0 -m-10 w-40 h-40 bg-galaxy-nova/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -m-10 w-40 h-40 bg-galaxy-blue-giant/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col space-y-4">
            <TextInput 
              onSubmit={handleTextSubmit} 
              isLoading={loading} 
              onStartAnalysis={handleAnalysisStart}
            />
            
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMockData}
                className={`border border-galaxy-nova/30 ${useMockData ? 'bg-galaxy-nova/20 text-galaxy-nova' : 'bg-black/30'}`}
              >
                <Database className="w-4 h-4 mr-2" />
                {useMockData ? 'Using English Data' : 'Use English Data'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleArabicData}
                className={`border border-galaxy-nova/30 ${useArabicData ? 'bg-galaxy-nova/20 text-galaxy-nova' : 'bg-black/30'}`}
              >
                <BookText className="w-4 h-4 mr-2" />
                {useArabicData ? 'استخدام البيانات العربية' : 'استخدام البيانات العربية'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleArabicSubjects}
                className={`border border-galaxy-nova/30 ${showArabicSubjects ? 'bg-galaxy-nova/20 text-galaxy-nova' : 'bg-black/30'}`}
              >
                <Globe className="w-4 h-4 mr-2" />
                {showArabicSubjects ? 'عرض المواضيع العربية' : 'عرض المواضيع العربية'}
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-8 relative">
          {!showPlaceholder && (
            <Card className="backdrop-blur-lg bg-black/20 border border-galaxy-nova/20 shadow-lg p-4 mb-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {renderVisualizationTypeSelector()}
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleExportPDF}
                    className="border border-galaxy-nova/30 bg-black/30"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
          <Card className="backdrop-blur-lg bg-black/30 border border-galaxy-nova/30 shadow-xl shadow-galaxy-nova/10 overflow-hidden relative min-h-[700px]">
            <div className="absolute top-0 right-0 -m-10 w-40 h-40 bg-galaxy-nova/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -m-10 w-40 h-40 bg-galaxy-blue-giant/10 rounded-full blur-2xl pointer-events-none"></div>
            
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-galaxy-nova border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-6 text-foreground/70">Analyzing and preparing visualization...</p>
                </div>
              </div>
            ) : showPlaceholder ? (
              <div className="p-6">
                {showArabicSubjects ? (
                  <div className="p-6 max-h-[600px] overflow-y-auto">
                    <h2 className="text-2xl font-bold text-center mb-6">المواضيع التاريخية العربية</h2>
                    {arabicHistoricalSubjects.map((subject, index) => (
                      <div key={subject.id} className="mb-8 border border-galaxy-nova/20 rounded-lg p-4">
                        <h3 className="text-xl font-bold mb-2 text-galaxy-nova">{subject.title}</h3>
                        <p className="text-sm whitespace-pre-line mb-4" dir="rtl">{subject.originalText}</p>
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSelectSubject(index)}
                            className="border border-galaxy-nova/30 bg-black/30 hover:bg-galaxy-nova/20"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            إنشاء التمثيل البصري
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <VisualizationPlaceholder />
                )}
              </div>
            ) : (
              <div className="p-2">
                {visualizationType === "graph" && (
                  <div ref={cosmicVisualizationRef} className="relative h-full">
                    <CosmicVisualization 
                      entities={entities}
                      visualizationType={visualizationType}
                      onEntitySelect={handleEntitySelect}
                    />
                    
                    {selectedEntity && (
                      <div className="absolute bottom-4 right-4 w-72 z-20">
                        <ElementCard 
                          entity={selectedEntity} 
                          onClose={closeDetailsCard} 
                          onEdit={(updatedEntity) => {
                            const updatedEntities = entities.map(e => 
                              e.id === updatedEntity.id ? updatedEntity : e
                            );
                            setEntities(updatedEntities);
                          }}
                          onDelete={handleDeleteEntity}
                          onAddRelated={(parentEntity) => {
                            // This will be handled inside ElementCard with the new implementation
                          }}
                          onExportPDF={handleExportPDF}
                          allEntities={entities}
                          onUpdateEntities={handleUpdateEntities}
                        />
                      </div>
                    )}
                  </div>
                )}
                {visualizationType === "timeline" && (
                  <div ref={timelineRef} className="relative h-full">
                    <Timeline 
                      entities={entities}
                      onEntitySelect={handleEntitySelect}
                    />
                  </div>
                )}
                {visualizationType === "story" && (
                  <div ref={storyRef} className="relative h-full">
                    <StorytellingSection 
                      entities={entities}
                      text={inputText}
                    />
                  </div>
                )}
                {visualizationType === "cards" && (
                  <div ref={cardsRef} className="relative min-h-[700px] overflow-y-auto">
                    <HistoricalVerticalCards
                      entities={entities}
                      onSelectEntity={handleEntitySelect}
                      title={
                        selectedSubject !== null 
                          ? `العناصر التاريخية في ${arabicHistoricalSubjects[selectedSubject].title}` 
                          : "العناصر التاريخية الرئيسية"
                      }
                    />
                  </div>
                )}
                
                {(visualizationType === "timeline" || visualizationType === "cards") && selectedEntity && (
                  <div className="fixed bottom-4 right-4 w-72 z-50">
                    <ElementCard 
                      entity={selectedEntity} 
                      onClose={closeDetailsCard} 
                      onEdit={(updatedEntity) => {
                        const updatedEntities = entities.map(e => 
                          e.id === updatedEntity.id ? updatedEntity : e
                        );
                        setEntities(updatedEntities);
                      }}
                      onDelete={handleDeleteEntity}
                      onAddRelated={(parentEntity) => {
                        // This will be handled inside ElementCard with the new implementation
                      }}
                      onExportPDF={handleExportPDF}
                      allEntities={entities}
                      onUpdateEntities={handleUpdateEntities}
                    />
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Visualize;
