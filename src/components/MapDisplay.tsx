
import React, { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MapDisplayProps {
  mapType: "historical" | "thematic" | "outline" | "relief" | "interactive" | "concept";
  mapTitle: string;
  mapSubtitle?: string;
  regionData?: any;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ 
  mapType, 
  mapTitle, 
  mapSubtitle,
  regionData
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapData, setMapData] = useState<any>(null);
  
  useEffect(() => {
    // Reset loading state when map type changes
    setIsLoading(true);
    setMapData(null);
    
    // Function to fetch map data from Supabase
    const fetchMapData = async () => {
      try {
        const { data, error } = await supabase
          .from('maps')
          .select('*')
          .eq('type', mapType)
          .limit(1)
          .single();
          
        if (error) {
          console.error("Error fetching map data:", error);
          
          // For demo purposes, use mock data if no data in Supabase
          generateMockMapData();
          return;
        }
        
        setMapData(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error in map data fetch:", error);
        
        // For demo purposes, use mock data if fetch fails
        generateMockMapData();
      }
    };
    
    // Generate mock map data for demonstration
    const generateMockMapData = () => {
      // This is a fallback for demo purposes
      const mockData = {
        type: mapType,
        title: mapTitle,
        subtitle: mapSubtitle || "Interactive map visualization",
        content: {
          regions: regionData || getMockRegionsForType(mapType),
          settings: {
            zoom: 2,
            center: [0, 20],
            style: getMapStyleForType(mapType)
          }
        }
      };
      
      setTimeout(() => {
        setMapData(mockData);
        setIsLoading(false);
      }, 800); // Simulate network delay
    };
    
    fetchMapData();
    
    // Initialize map visualization based on type
    if (mapContainerRef.current) {
      initializeMapVisualization();
    }
    
    return () => {
      // Cleanup map instance if needed
    };
  }, [mapType, mapTitle, mapSubtitle, regionData]);
  
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
  const getMockRegionsForType = (type: string) => {
    switch (type) {
      case 'historical':
        return [
          { id: 'roman_empire', name: 'Roman Empire', year: 117, color: '#8E76DB' },
          { id: 'byzantine_empire', name: 'Byzantine Empire', year: 555, color: '#6A9CE2' },
          { id: 'mongol_empire', name: 'Mongol Empire', year: 1279, color: '#EB6784' }
        ];
      case 'thematic':
        return [
          { id: 'population_dense', name: 'High Density', value: 'high', color: '#8E76DB' },
          { id: 'population_medium', name: 'Medium Density', value: 'medium', color: '#6A9CE2' },
          { id: 'population_low', name: 'Low Density', value: 'low', color: '#76CCB9' }
        ];
      case 'outline':
        return [
          { id: 'north_america', name: 'North America', borders: true, fill: false },
          { id: 'south_america', name: 'South America', borders: true, fill: false },
          { id: 'europe', name: 'Europe', borders: true, fill: false }
        ];
      case 'relief':
        return [
          { id: 'mountain', name: 'Mountains', elevation: 'high', color: '#8C7B68' },
          { id: 'hills', name: 'Hills', elevation: 'medium', color: '#A9BD86' },
          { id: 'plains', name: 'Plains', elevation: 'low', color: '#D0E4B0' }
        ];
      case 'interactive':
        return [
          { id: 'layer_political', name: 'Political Boundaries', active: true },
          { id: 'layer_terrain', name: 'Terrain', active: false },
          { id: 'layer_climate', name: 'Climate Zones', active: false }
        ];
      case 'concept':
        return [
          { id: 'concept_1', name: 'Primary Concept', connections: 5, color: '#8E76DB' },
          { id: 'concept_2', name: 'Secondary Concept', connections: 3, color: '#6A9CE2' },
          { id: 'concept_3', name: 'Tertiary Concept', connections: 2, color: '#76CCB9' }
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
      description: `${mapTitle} has been exported as an image`,
    });
  };
  
  // Rendering map legends based on the data
  const renderMapLegend = () => {
    if (!mapData || !mapData.content || !mapData.content.regions) return null;
    
    return (
      <div className="absolute bottom-4 left-4 p-3 bg-background/80 backdrop-blur-sm border border-galaxy-nova/30 rounded-md text-xs space-y-2 max-w-[200px]">
        <p className="font-medium text-foreground/90">Legend</p>
        <div className="space-y-1">
          {mapData.content.regions.map((region: any) => (
            <div key={region.id} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: region.color || '#8E76DB' }}
              />
              <span>{region.name}</span>
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
            className="w-full h-full min-h-[400px]"
          />
          
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
          
          <div className="absolute top-4 left-4 p-2 bg-background/80 backdrop-blur-sm border border-galaxy-nova/30 rounded-md">
            <h3 className="text-sm font-medium">{mapData?.title}</h3>
            {mapData?.subtitle && (
              <p className="text-xs text-foreground/70">{mapData.subtitle}</p>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default MapDisplay;
