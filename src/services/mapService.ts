
import { supabase } from "@/integrations/supabase/client";
import { FormattedHistoricalEntity } from "@/types/supabase";
import { toast } from "sonner";

// Interface for map data
export interface MapData {
  id?: string;
  type: string;
  title: string;
  content: any;
}

/**
 * Generate a map from historical entities
 */
export const generateMapFromEntities = async (
  entities: FormattedHistoricalEntity[],
  mapType: string,
  sourceType?: string,
  sourceId?: string
): Promise<MapData | null> => {
  try {
    console.log(`Generating ${mapType} map for ${entities.length} entities`);
    
    const { data, error } = await supabase.functions.invoke('generate-map-data', {
      body: {
        entities,
        mapType,
        sourceType,
        sourceId,
        storeMap: true
      }
    });
    
    if (error) {
      console.error("Error generating map:", error);
      toast.error("Failed to generate map. Please try again.");
      return null;
    }
    
    console.log("Map generated successfully:", data);
    return {
      id: data.mapId,
      type: mapType,
      title: data.mapContent.title,
      content: data.mapContent
    };
  } catch (error) {
    console.error("Error in map generation:", error);
    toast.error("Error generating map");
    return null;
  }
};

/**
 * Fetch maps from the database
 */
export const fetchMaps = async (limit: number = 10): Promise<MapData[]> => {
  try {
    const { data, error } = await supabase
      .from('maps')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error fetching maps:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Error in fetchMaps:", error);
    return [];
  }
};

/**
 * Get maps related to a specific content ID
 */
export const getMapsForContent = async (contentId: string): Promise<MapData[]> => {
  try {
    // First get the map IDs linked to this content
    const { data: links, error: linkError } = await supabase
      .from('content_maps')
      .select('map_id')
      .eq('content_id', contentId);
    
    if (linkError || !links || links.length === 0) {
      return [];
    }
    
    // Then fetch the actual maps
    const mapIds = links.map(link => link.map_id);
    const { data: maps, error: mapsError } = await supabase
      .from('maps')
      .select('*')
      .in('id', mapIds);
    
    if (mapsError) {
      console.error("Error fetching content maps:", mapsError);
      return [];
    }
    
    return maps;
  } catch (error) {
    console.error("Error in getMapsForContent:", error);
    return [];
  }
};

/**
 * Store a map in the database and link it to content
 */
export const storeMap = async (
  mapData: Omit<MapData, 'id'>,
  contentId?: string
): Promise<string | null> => {
  try {
    // Insert the map
    const { data: map, error: mapError } = await supabase
      .from('maps')
      .insert(mapData)
      .select('id')
      .single();
    
    if (mapError) {
      console.error("Error storing map:", mapError);
      return null;
    }
    
    // If we have content ID, link the map to it
    if (contentId) {
      const { error: linkError } = await supabase
        .from('content_maps')
        .insert({
          content_id: contentId,
          map_id: map.id
        });
      
      if (linkError) {
        console.error("Error linking map to content:", linkError);
      }
    }
    
    return map.id;
  } catch (error) {
    console.error("Error in storeMap:", error);
    return null;
  }
};

/**
 * Delete a map and its content links
 */
export const deleteMap = async (mapId: string): Promise<boolean> => {
  try {
    // First delete any links to this map
    const { error: linkError } = await supabase
      .from('content_maps')
      .delete()
      .eq('map_id', mapId);
    
    if (linkError) {
      console.error("Error deleting map links:", linkError);
    }
    
    // Then delete the map itself
    const { error: mapError } = await supabase
      .from('maps')
      .delete()
      .eq('id', mapId);
    
    if (mapError) {
      console.error("Error deleting map:", mapError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteMap:", error);
    return false;
  }
};
