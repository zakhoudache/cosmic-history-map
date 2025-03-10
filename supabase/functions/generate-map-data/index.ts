import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define the structure for historical entities that we'll use in map generation
interface HistoricalEntity {
  id: string;
  name: string;
  type: string;
  startDate?: string;
  endDate?: string;
  description: string;
  significance: number;
  group?: string;
  domains?: string[];
  relations?: Array<{
    targetId: string;  // Ensure we consistently use targetId, not target
    type: string;
    strength: number;
  }>;
}

// Interface for map content that will be returned to the client
interface MapContent {
  mapType: string;
  title: string;
  regions: any[];
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
    sourceId?: string;
  };
}

// Create a color palette for map visualization
const colorPalette = [
  "#8E76DB", "#6A9CE2", "#76CCB9", "#EB6784", "#FFB572", 
  "#A3A1FB", "#5EC2CC", "#D5A5F8", "#F39C6B", "#61D095"
];

// Convert date string to year (handles various formats)
function extractYear(dateString: string | undefined): number | null {
  if (!dateString) return null;
  
  // Extract year from date formats like "1066" or "1066-10-14" or "1066 AD" etc.
  const yearMatch = dateString.match(/\b(\d{3,4})\b/);
  if (yearMatch) {
    return parseInt(yearMatch[1], 10);
  }
  return null;
}

// Calculate geographical coordinates from a historical entity
function calculateCoordinates(entity: HistoricalEntity): [number, number] {
  // In a real implementation, this would use a historical gazetteer or database
  // For demo purposes, we'll create deterministic but random-seeming coordinates
  
  // Create a simple hash of the entity name for deterministic positioning
  let hash = 0;
  for (let i = 0; i < entity.name.length; i++) {
    hash = ((hash << 5) - hash) + entity.name.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Generate latitude between -50 and 70 degrees
  const lat = (hash % 120) - 50;
  
  // Generate longitude between -180 and 180 degrees
  const lng = ((hash * 13) % 360) - 180;
  
  return [lng, lat];
}

// Generate a map type based on historical entities
function determineMapType(entities: HistoricalEntity[]): string {
  // Count entity types to determine map focus
  const typeCounts: Record<string, number> = {};
  
  entities.forEach(entity => {
    if (entity.type) {
      typeCounts[entity.type] = (typeCounts[entity.type] || 0) + 1;
    }
  });
  
  // Check if events/periods dominate (historical)
  if ((typeCounts.event || 0) + (typeCounts.period || 0) > entities.length * 0.4) {
    return "historical";
  }
  
  // Check if places dominate (outline or relief)
  if ((typeCounts.place || 0) > entities.length * 0.4) {
    return "outline";
  }
  
  // Check if concepts dominate (concept)
  if ((typeCounts.concept || 0) > entities.length * 0.3) {
    return "concept";
  }
  
  // Default to thematic for mixed content
  return "thematic";
}

// Store generated map in Supabase
async function storeMapInDatabase(
  mapContent: MapContent, 
  sourceType: string, 
  sourceId: string, 
  supabaseClient: any
): Promise<string | null> {
  try {
    // Insert map data
    const { data: mapData, error: mapError } = await supabaseClient
      .from('maps')
      .insert({
        type: mapContent.mapType,
        title: mapContent.title,
        content: mapContent
      })
      .select('id')
      .single();
    
    if (mapError) {
      console.error("Error storing map:", mapError);
      return null;
    }
    
    // If we have source information, create content-map link
    if (sourceId) {
      const { error: linkError } = await supabaseClient
        .from('content_maps')
        .insert({
          content_id: sourceId,
          map_id: mapData.id
        });
      
      if (linkError) {
        console.error("Error linking map to content:", linkError);
      }
    }
    
    return mapData.id;
  } catch (error) {
    console.error("Database error:", error);
    return null;
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { entities, mapType, sourceType, sourceId, storeMap } = requestData;
    
    // Validate input
    if (!entities || !Array.isArray(entities)) {
      return new Response(
        JSON.stringify({ error: 'Entities array is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Ensure consistent property naming for relationships
    const normalizedEntities = entities.map(entity => {
      if (entity.relations && Array.isArray(entity.relations)) {
        // Convert any 'target' properties to 'targetId' for consistency
        const normalizedRelations = entity.relations.map(relation => ({
          ...relation,
          targetId: relation.targetId || relation.target,  // Use targetId, fallback to target
          // Remove the target property if it exists
          ...(relation.target && { target: undefined })
        }));
        
        return {
          ...entity,
          relations: normalizedRelations
        };
      }
      return entity;
    });
    
    const determinedMapType = mapType || determineMapType(normalizedEntities);
    
    // Process entities to create map-compatible data
    let regions: any[] = [];
    let title = "Historical Map";
    let legendItems: Array<{label: string, color: string}> = [];
    
    // Find time range for historical content
    let startYear: number | null = null;
    let endYear: number | null = null;
    
    normalizedEntities.forEach((entity, index) => {
      const entityStartYear = extractYear(entity.startDate);
      const entityEndYear = extractYear(entity.endDate) || entityStartYear;
      
      if (entityStartYear !== null) {
        startYear = startYear === null ? entityStartYear : Math.min(startYear, entityStartYear);
      }
      
      if (entityEndYear !== null) {
        endYear = endYear === null ? entityEndYear : Math.max(endYear, entityEndYear);
      }
      
      // Calculate color index deterministically from entity id or name
      const colorIndex = index % colorPalette.length;
      const color = colorPalette[colorIndex];
      
      // Create map region based on entity type
      const coordinates = calculateCoordinates(entity);
      
      regions.push({
        id: entity.id,
        name: entity.name,
        description: entity.description,
        coordinates: coordinates,
        significance: entity.significance,
        color: color,
        startYear: entityStartYear,
        endYear: entityEndYear,
        type: entity.type
      });
      
      // Add to legend if significant
      if (entity.significance >= 7) {
        legendItems.push({
          label: entity.name,
          color: color
        });
      }
    });
    
    // Determine title based on content
    if (startYear && endYear) {
      title = `Historical Map (${startYear} - ${endYear})`;
    } else if (determinedMapType === "concept") {
      title = "Conceptual Relationship Map";
    } else if (determinedMapType === "thematic") {
      title = "Thematic Historical Analysis";
    }
    
    // Cap legend items
    if (legendItems.length > 7) {
      legendItems = legendItems.slice(0, 7);
    }
    
    // Determine map settings based on map type
    const mapSettings = {
      center: [0, 20], // Default center
      zoom: 2, // Default zoom
      style: determinedMapType === "historical" ? "satellite" : 
             determinedMapType === "concept" ? "dark" : 
             determinedMapType === "relief" ? "terrain" : "light"
    };
    
    // Create the map content response
    const mapContent: MapContent = {
      mapType: determinedMapType,
      title: title,
      regions: regions,
      settings: mapSettings,
      legend: {
        title: "Key Elements",
        items: legendItems
      },
      metadata: {
        generatedFrom: sourceType || "Historical Analysis",
        sourceId: sourceId,
        timeperiod: startYear && endYear ? {
          start: startYear.toString(),
          end: endYear.toString()
        } : undefined
      }
    };

    // Store map in database if requested
    let mapId = null;
    if (storeMap && sourceId) {
      // This is a placeholder - we would need to create a Supabase client here
      // In a real implementation, we'd use the supabase-js SDK
      console.log("Would store map with source ID:", sourceId);
      // mapId = await storeMapInDatabase(mapContent, sourceType, sourceId, supabaseClient);
    }

    // Return the generated map content
    return new Response(
      JSON.stringify({ 
        mapContent,
        mapId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error("Error in generate-map-data function:", error.message);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate map data", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
