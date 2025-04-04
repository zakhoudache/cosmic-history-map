
import { supabase } from "@/lib/supabase";
import { FormattedHistoricalEntity, HistoricalRelation, HistoricalDataResponse } from "@/types/supabase";

/**
 * Fetches historical data from the AI service
 * @param text The input text to analyze
 */
export const getHistoricalData = async (text: string): Promise<HistoricalDataResponse> => {
  try {
    // Call the Supabase Edge Function for historical data analysis
    const { data, error } = await supabase.functions.invoke("analyze-historical-text", {
      body: { text }
    });

    if (error) {
      console.error("Error from Supabase Edge Function:", error);
      return { 
        entities: [],
        error: `Failed to analyze text: ${error.message}`
      };
    }

    if (!data || !data.entities) {
      console.error("Invalid response format:", data);
      return { 
        entities: [],
        error: "Invalid response from the analysis service."
      };
    }

    // Format the received entities according to our application's schema
    const formattedEntities = formatHistoricalEntities(data.entities);

    return {
      entities: formattedEntities,
      summary: data.summary,
      themes: data.themes,
      timeline: data.timeline
    };
  } catch (error) {
    console.error("Error in getHistoricalData:", error);
    return { 
      entities: [],
      error: `An unexpected error occurred: ${error}`
    };
  }
};

/**
 * Formats historical entities to match the application's schema
 * @param entities The entities to format
 */
export const formatHistoricalEntities = (entities: any[]): FormattedHistoricalEntity[] => {
  return entities.map((entity, index) => {
    // Format relations
    const formattedRelations: HistoricalRelation[] = (entity.relations || []).map((relation: any) => ({
      targetId: relation.targetId || relation.target_id || "",
      type: relation.type || "related",
      strength: relation.strength || 5
    }));

    // Return the formatted entity
    return {
      id: entity.id || `entity-${index}`,
      name: entity.name || "Unknown Entity",
      type: entity.type || "unknown",
      description: entity.description || "",
      startDate: entity.startDate || entity.start_date || "",
      endDate: entity.endDate || entity.end_date || "",
      significance: entity.significance || 5,
      location: entity.location || "",
      group: entity.group || entity.group_name || "",
      imageUrl: entity.imageUrl || entity.image_url || "",
      source: entity.source || "",
      url: entity.url || "",
      tags: entity.tags || [],
      metadata: entity.metadata || {},
      relations: formattedRelations,
      // Additional properties for visualization
      color: entity.color || "",
      index: index
    };
  });
};

/**
 * Saves historical analysis to the database
 * @param title The title of the analysis
 * @param text The original text that was analyzed
 * @param entities The extracted historical entities
 * @param summary The summary of the historical text
 */
export const saveHistoricalAnalysis = async (
  title: string,
  text: string,
  entities: FormattedHistoricalEntity[],
  summary?: string
) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.user) {
      throw new Error("You must be logged in to save analyses");
    }

    // First save the analysis metadata
    const { data: analysisData, error: analysisError } = await supabase
      .from('historical_analyses')
      .insert({
        user_id: user.user.id,
        title,
        original_text: text,
        summary,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (analysisError) {
      throw analysisError;
    }

    const analysisId = analysisData.id;

    // Prepare entities for insertion
    const formattedEntities = entities.map(entity => ({
      analysis_id: analysisId,
      entity_id: entity.id,
      name: entity.name,
      type: entity.type,
      description: entity.description,
      start_date: entity.startDate,
      end_date: entity.endDate,
      significance: entity.significance,
      location: entity.location,
      group_name: entity.group,
      image_url: entity.imageUrl,
      source: entity.source,
      url: entity.url,
      tags: entity.tags,
      metadata: entity.metadata
    }));

    // Save entities
    const { error: entitiesError } = await supabase
      .from('historical_entities')
      .insert(formattedEntities);

    if (entitiesError) {
      throw entitiesError;
    }

    // Prepare relations for insertion
    const relations = entities.flatMap(entity => 
      entity.relations.map(relation => ({
        analysis_id: analysisId,
        source_id: entity.id,
        target_id: relation.targetId,
        relation_type: relation.type,
        strength: relation.strength
      }))
    );

    // Save relations if there are any
    if (relations.length > 0) {
      const { error: relationsError } = await supabase
        .from('historical_relations')
        .insert(relations);

      if (relationsError) {
        throw relationsError;
      }
    }

    return { success: true, analysisId };
  } catch (error) {
    console.error("Error saving historical analysis:", error);
    throw error;
  }
};

/**
 * Fetches saved historical analyses for a user
 */
export const getUserHistoricalAnalyses = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.user) {
      throw new Error("You must be logged in to view saved analyses");
    }

    const { data, error } = await supabase
      .from('historical_analyses')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching historical analyses:", error);
    throw error;
  }
};

/**
 * Fetches a specific historical analysis with its entities and relations
 * @param analysisId The ID of the analysis to fetch
 */
export const getHistoricalAnalysisById = async (analysisId: string) => {
  try {
    // Fetch the analysis metadata
    const { data: analysisData, error: analysisError } = await supabase
      .from('historical_analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError) {
      throw analysisError;
    }

    // Fetch the entities for this analysis
    const { data: entitiesData, error: entitiesError } = await supabase
      .from('historical_entities')
      .select('*')
      .eq('analysis_id', analysisId);

    if (entitiesError) {
      throw entitiesError;
    }

    // Fetch the relations for this analysis
    const { data: relationsData, error: relationsError } = await supabase
      .from('historical_relations')
      .select('*')
      .eq('analysis_id', analysisId);

    if (relationsError) {
      throw relationsError;
    }

    // Format entities with their relations
    const formattedEntities = entitiesData.map(entity => {
      const entityRelations = relationsData
        .filter(relation => relation.source_id === entity.entity_id)
        .map(relation => ({
          targetId: relation.target_id,
          type: relation.relation_type,
          strength: relation.strength
        }));

      return {
        id: entity.entity_id,
        name: entity.name,
        type: entity.type,
        description: entity.description,
        startDate: entity.start_date,
        endDate: entity.end_date,
        significance: entity.significance,
        location: entity.location,
        group: entity.group_name,
        imageUrl: entity.image_url,
        source: entity.source,
        url: entity.url,
        tags: entity.tags,
        metadata: entity.metadata,
        relations: entityRelations
      };
    });

    return {
      ...analysisData,
      entities: formattedEntities
    };
  } catch (error) {
    console.error("Error fetching historical analysis by ID:", error);
    throw error;
  }
};

/**
 * Deletes a historical analysis and its associated entities and relations
 * @param analysisId The ID of the analysis to delete
 */
export const deleteHistoricalAnalysis = async (analysisId: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.user) {
      throw new Error("You must be logged in to delete analyses");
    }

    // First verify that this analysis belongs to the user
    const { data: analysisData, error: analysisError } = await supabase
      .from('historical_analyses')
      .select('user_id')
      .eq('id', analysisId)
      .single();

    if (analysisError) {
      throw analysisError;
    }

    if (analysisData.user_id !== user.user.id) {
      throw new Error("You do not have permission to delete this analysis");
    }

    // Delete the analysis (cascade deletes should handle entities and relations)
    const { error: deleteError } = await supabase
      .from('historical_analyses')
      .delete()
      .eq('id', analysisId);

    if (deleteError) {
      throw deleteError;
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting historical analysis:", error);
    throw error;
  }
};
