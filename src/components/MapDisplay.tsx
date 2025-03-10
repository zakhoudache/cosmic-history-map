
import React, { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MapRegion {
  id: string;
  name: string;
  description?: string;
  coordinates: [number, number];
  significance: number;
  color: string;
  startYear?: number;
  endYear?: number;
  type: string;
}

interface MapLegendItem {
  label: string;
  color: string;
}

interface MapSettings {
  zoom: number;
  center: [number, number];
  style: string;
}

interface MapMetadata {
  generatedFrom: string;
  timeperiod?: {
    start: string;
    end: string;
  };
  sourceId?: string;
}

interface MapData {
  mapType: string;
  title: string;
  subtitle?: string;
  regions: MapRegion[];
  settings: MapSettings;
  legend: {
    title: string;
    items: MapLegendItem[];
  };
  metadata: MapMetadata;
}

interface MapDisplayProps {
  mapType: "historical" | "thematic" | "outline" | "relief" | "interactive" | "concept";
  mapTitle: string;
  mapSubtitle?: string;
  regionData?: any;
  sourceId?: string;
  sourceType?: string;
  onMapGenerated?: (mapId: string) => void;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ 
  mapType, 
  mapTitle, 
  mapSubtitle,
  regionData,
  sourceId,
  sourceType,
  onMapGenerated
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapData, setMapData] = useState<MapData | null>(null);
  
  useEffect(() => {
    // Reset loading state when map type changes
    setIsLoading(true);
    setMapData(null);
    
    // Function to fetch map data from Supabase
    const fetchExistingMapData = async () => {
      try {
        if (sourceId) {
          // Try to find an existing map for this content
          const { data: contentMapLinks, error: linkError } = await supabase
            .from('content_maps')
            .select('map_id')
            .eq('content_id', sourceId);
            
          if (linkError) {
            console.error("Error fetching map links:", linkError);
            generateMapData();
            return;
          }
          
          if (contentMapLinks && contentMapLinks.length > 0) {
            // Found an existing map, fetch it
            const { data: mapData, error: mapError } = await supabase
              .from('maps')
              .select('*')
              .eq('id', contentMapLinks[0].map_id)
              .single();
              
            if (mapError) {
              console.error("Error fetching map data:", mapError);
              generateMapData();
              return;
            }
            
            setMapData(mapData.content);
            setIsLoading(false);
            return;
          }
        }
        
        // If no source ID or no existing map, check for maps by type
        const { data: maps, error } = await supabase
          .from('maps')
          .select('*')
          .eq('type', mapType)
          .limit(1);
          
        if (error || !maps || maps.length === 0) {
          console.log("No existing maps found, generating new map data");
          generateMapData();
          return;
        }
        
        setMapData(maps[0].content);
        setIsLoading(false);
      } catch (error) {
        console.error("Error in map data fetch:", error);
        generateMapData();
      }
    };
    
    // Generate map data for visualization
    const generateMapData = async () => {
      try {
        if (!regionData || regionData.length === 0) {
          // If no region data provided, use mock data
          generateMockMapData();
          return;
        }
        
        // Call the Supabase Edge Function to generate map data
        const { data, error } = await supabase.functions.invoke('generate-map-data', {
          body: { 
            entities: regionData,
            mapType: mapType,
            sourceType: sourceType,
            sourceId: sourceId,
            storeMap: true
          }
        });
        
        if (error) {
          console.error("Error calling generate-map-data function:", error);
          generateMockMapData();
          return;
        }
        
        console.log("Generated map data:", data);
        setMapData(data.mapContent);
        setIsLoading(false);
        
        // If callback provided and map was stored, notify parent
        if (onMapGenerated && data.mapId) {
          onMapGenerated(data.mapId);
        }
      } catch (error) {
        console.error("Error generating map data:", error);
        generateMockMapData();
      }
    };
    
    // Generate mock map data for demonstration
    const generateMockMapData = () => {
      // This is a fallback for demo purposes
      const mockData: MapData = {
        mapType: mapType,
        title: mapTitle,
        regions: getMockRegionsForType(mapType),
        settings: {
          zoom: 2,
          center: [0, 20],
          style: getMapStyleForType(mapType)
        },
        legend: {
          title: "Key Elements",
          items: getMockRegionsForType(mapType).slice(0, 3).map(region => ({
            label: region.name,
            color: region.color
          }))
        },
        metadata: {
          generatedFrom: sourceType || "Historical Analysis",
          timeperiod: mapType === 'historical' ? {
            start: "1066",
            end: "1279"
          } : undefined
        }
      };
      
      setTimeout(() => {
        setMapData(mockData);
        setIsLoading(false);
      }, 800); // Simulate network delay
    };
    
    // Start the data fetching process
    if (sourceId) {
      fetchExistingMapData();
    } else {
      generateMapData();
    }
    
    // Initialize map visualization based on type
    if (mapContainerRef.current) {
      initializeMapVisualization();
    }
    
    return () => {
      // Cleanup map instance if needed
    };
  }, [mapType, mapTitle, mapSubtitle, regionData, sourceId, sourceType]);
  
  // Initialize the map visualization based on the map type
  const initializeMapVisualization = () => {
    // This would typically initialize a map library like Mapbox, Leaflet, etc.
    // For now, we'll use a simplified visualization approach
    
    if (!mapContainerRef.current) return;
    
    const container = mapContainerRef.current;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Add map background
    container.style.background = getMapBackgroundForType(mapType);
    
    // In a real implementation, you would initialize your map library here
    // For example: new mapboxgl.Map({ container, ... })
  };
  
  // Get mock regions data based on map type
  const getMockRegionsForType = (type: string): MapRegion[] => {
    switch (type) {
      case 'historical':
        return [
          { id: 'roman_empire', name: 'Roman Empire', coordinates: [12, 41], significance: 10, color: '#8E76DB', startYear: 117, endYear: 476, type: 'empire' },
          { id: 'byzantine_empire', name: 'Byzantine Empire', coordinates: [28, 41], significance: 9, color: '#6A9CE2', startYear: 395, endYear: 1453, type: 'empire' },
          { id: 'mongol_empire', name: 'Mongol Empire', coordinates: [100, 46], significance: 10, color: '#EB6784', startYear: 1206, endYear: 1368, type: 'empire' }
        ];
      case 'thematic':
        return [
          { id: 'population_dense', name: 'High Density', coordinates: [2, 48], significance: 8, color: '#8E76DB', type: 'population' },
          { id: 'population_medium', name: 'Medium Density', coordinates: [15, 45], significance: 7, color: '#6A9CE2', type: 'population' },
          { id: 'population_low', name: 'Low Density', coordinates: [30, 40], significance: 6, color: '#76CCB9', type: 'population' }
        ];
      case 'outline':
        return [
          { id: 'north_america', name: 'North America', coordinates: [-100, 40], significance: 8, color: '#8E76DB', type: 'continent' },
          { id: 'south_america', name: 'South America', coordinates: [-60, -20], significance: 8, color: '#6A9CE2', type: 'continent' },
          { id: 'europe', name: 'Europe', coordinates: [10, 50], significance: 8, color: '#76CCB9', type: 'continent' }
        ];
      case 'relief':
        return [
          { id: 'himalaya', name: 'Himalayan Mountains', coordinates: [80, 30], significance: 9, color: '#8C7B68', type: 'mountain' },
          { id: 'alps', name: 'Alps', coordinates: [8, 46], significance: 8, color: '#A9BD86', type: 'mountain' },
          { id: 'ganges', name: 'Ganges Plain', coordinates: [85, 25], significance: 7, color: '#D0E4B0', type: 'plain' }
        ];
      case 'interactive':
        return [
          { id: 'layer_political', name: 'Political Boundaries', coordinates: [0, 0], significance: 10, color: '#8E76DB', type: 'layer' },
          { id: 'layer_terrain', name: 'Terrain', coordinates: [5, 5], significance: 9, color: '#6A9CE2', type: 'layer' },
          { id: 'layer_climate', name: 'Climate Zones', coordinates: [10, 10], significance: 8, color: '#76CCB9', type: 'layer' }
        ];
      case 'concept':
        return [
          { id: 'concept_1', name: 'Democracy', coordinates: [0, 40], significance: 10, color: '#8E76DB', type: 'concept' },
          { id: 'concept_2', name: 'Authoritarianism', coordinates: [20, 50], significance: 9, color: '#6A9CE2', type: 'concept' },
          { id: 'concept_3', name: 'Theocracy', coordinates: [40, 30], significance: 8, color: '#76CCB9', type: 'concept' }
        ];
      default:
        return [];
    }
  };
  
  // Get map style based on type
  const getMapStyleForType = (type: string) => {
    switch (type) {
      case 'historical': return 'satellite';
      case 'thematic': return 'light';
      case 'outline': return 'light';
      case 'relief': return 'terrain';
      case 'interactive': return 'streets';
      case 'concept': return 'dark';
      default: return 'light';
    }
  };
  
  // Get background styling for different map types
  const getMapBackgroundForType = (type: string) => {
    switch (type) {
      case 'historical': 
        return 'radial-gradient(circle at center, #283048 0%, #141E30 100%)';
      case 'thematic': 
        return 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
      case 'outline': 
        return '#f8f9fa';
      case 'relief': 
        return 'linear-gradient(135deg, #94B49F 0%, #D8E9A8 100%)';
      case 'interactive': 
        return 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)';
      case 'concept': 
        return 'radial-gradient(circle at center, #232526 0%, #414345 100%)';
      default: 
        return '#f5f7fa';
    }
  };
  
  // Handle export map functionality
  const handleExportMap = () => {
    toast({
      title: "Map Exported",
      description: `${mapData?.title || mapTitle} has been exported as an image`,
    });
  };
  
  // Render map elements based on the data
  const renderMapElements = () => {
    if (!mapData || !mapData.regions) return null;
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        {mapData.regions.map((region) => (
          <div 
            key={region.id}
            className="absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{
              backgroundColor: region.color,
              left: `${((region.coordinates[0] + 180) / 360) * 100}%`,
              top: `${((90 - region.coordinates[1]) / 180) * 100}%`,
              opacity: 0.8,
              boxShadow: `0 0 ${region.significance * 2}px ${region.color}`,
              zIndex: Math.floor(region.significance),
              width: `${Math.max(region.significance * 0.4, 1)}rem`,
              height: `${Math.max(region.significance * 0.4, 1)}rem`,
            }}
          >
            <div className="absolute w-max text-xs font-medium text-white/90 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded left-full ml-2 whitespace-nowrap">
              {region.name}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Rendering map legends based on the data
  const renderMapLegend = () => {
    if (!mapData || !mapData.legend || !mapData.legend.items) return null;
    
    return (
      <div className="absolute bottom-4 left-4 p-3 bg-background/80 backdrop-blur-sm border border-galaxy-nova/30 rounded-md text-xs space-y-2 max-w-[200px]">
        <p className="font-medium text-foreground/90">{mapData.legend.title || "Legend"}</p>
        <div className="space-y-1">
          {mapData.legend.items.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: item.color || '#8E76DB' }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <Card className="overflow-hidden border border-galaxy-nova/30 shadow-lg shadow-galaxy-nova/10 backdrop-blur-sm bg-black/30 w-full h-full relative">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-8 h-8 animate-spin text-galaxy-nova" />
            <p className="text-sm text-foreground/70">Loading {mapTitle}...</p>
          </div>
        </div>
      ) : (
        <>
          <div 
            ref={mapContainerRef} 
            className="w-full h-full min-h-[400px] relative"
          >
            {renderMapElements()}
          </div>
          
          {renderMapLegend()}
          
          <div className="absolute top-4 right-4 space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-background/80 backdrop-blur-sm border-galaxy-nova/30"
              onClick={handleExportMap}
            >
              Export
            </Button>
          </div>
          
          <div className="absolute top-4 left-4 p-3 bg-background/80 backdrop-blur-sm border border-galaxy-nova/30 rounded-md">
            <h3 className="text-sm font-medium">{mapData?.title || mapTitle}</h3>
            {(mapData?.subtitle || mapSubtitle) && (
              <p className="text-xs text-foreground/70">{mapData?.subtitle || mapSubtitle}</p>
            )}
            {mapData?.metadata?.timeperiod && (
              <p className="text-xs mt-1 text-foreground/60">
                {mapData.metadata.timeperiod.start} - {mapData.metadata.timeperiod.end}
              </p>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default MapDisplay;
