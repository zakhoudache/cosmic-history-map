
import { supabase } from "@/integrations/supabase/client";

// Define interfaces for map data
export interface MapRegion {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number];
  significance: number;
  color: string;
  startYear?: number;
  endYear?: number;
  type: string;
}

export interface MapContent {
  mapType: string;
  title: string;
  regions: MapRegion[];
  settings: {
    center: number[];
    zoom: number;
    style: string;
  };
  legend: {
    title: string;
    items: Array<{
      label: string;
      color: string;
    }>;
  };
  metadata: {
    generatedFrom: string;
    timeperiod?: {
      start: string;
      end: string;
    };
  };
}

// Service functions for map-related operations
const mapService = {
  /**
   * Generate map data from historical entities
   */
  generateMapData: async (entities: any[], mapType?: string): Promise<MapContent> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-map-data', {
        body: { entities, mapType },
      });
      
      if (error) {
        console.error("Error generating map data:", error);
        throw new Error(error.message);
      }
      
      return data as MapContent;
    } catch (error) {
      console.error("Map generation failed:", error);
      // Return fallback map data
      return createFallbackMapData(mapType || "historical");
    }
  },
  
  /**
   * Save generated map to Supabase
   */
  saveMap: async (mapContent: MapContent): Promise<{ id: string }> => {
    try {
      const { data, error } = await supabase
        .from('maps')
        .insert({
          type: mapContent.mapType,
          title: mapContent.title,
          content: mapContent,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (error) {
        console.error("Error saving map:", error);
        throw new Error(error.message);
      }
      
      return { id: data.id };
    } catch (error) {
      console.error("Map save failed:", error);
      return { id: `temp-${Date.now()}` };
    }
  },
  
  /**
   * Get a map by ID
   */
  getMapById: async (id: string): Promise<MapContent | null> => {
    try {
      const { data, error } = await supabase
        .from('maps')
        .select('content')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching map:", error);
        return null;
      }
      
      return data.content as MapContent;
    } catch (error) {
      console.error("Map fetch failed:", error);
      return null;
    }
  },
  
  /**
   * Get maps by type
   */
  getMapsByType: async (type: string): Promise<MapContent[]> => {
    try {
      const { data, error } = await supabase
        .from('maps')
        .select('content')
        .eq('type', type);
      
      if (error) {
        console.error("Error fetching maps by type:", error);
        return [];
      }
      
      return data.map(item => item.content as MapContent);
    } catch (error) {
      console.error("Maps fetch failed:", error);
      return [];
    }
  }
};

/**
 * Create fallback map data when API calls fail
 */
function createFallbackMapData(mapType: string): MapContent {
  // Sample regions for fallback map
  const sampleRegions: MapRegion[] = [
    {
      id: "region1",
      name: "Sample Region 1",
      description: "This is a sample region for demonstration purposes.",
      coordinates: [0, 20],
      significance: 8,
      color: "#8E76DB",
      type: "place"
    },
    {
      id: "region2",
      name: "Sample Region 2",
      description: "This is another sample region.",
      coordinates: [30, 40],
      significance: 6,
      color: "#6A9CE2",
      type: "place"
    },
    {
      id: "region3",
      name: "Sample Region 3",
      description: "This is a third sample region.",
      coordinates: [-30, 10],
      significance: 7,
      color: "#76CCB9",
      type: "place"
    }
  ];
  
  // Return a simple fallback map
  return {
    mapType: mapType,
    title: `${mapType.charAt(0).toUpperCase() + mapType.slice(1)} Map`,
    regions: sampleRegions,
    settings: {
      center: [0, 20],
      zoom: 2,
      style: mapType === "historical" ? "satellite" : "light"
    },
    legend: {
      title: "Sample Regions",
      items: sampleRegions.map(region => ({
        label: region.name,
        color: region.color
      }))
    },
    metadata: {
      generatedFrom: "Fallback Generator"
    }
  };
}

export default mapService;
