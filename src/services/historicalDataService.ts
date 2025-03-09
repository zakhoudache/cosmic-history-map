
import { supabase } from "@/integrations/supabase/client";
import { HistoricalEntity, HistoricalRelation, FormattedHistoricalEntity } from "@/types/supabase";
import { toast } from "sonner";

// Function to fetch all historical entities and their relations
export const fetchHistoricalData = async (): Promise<FormattedHistoricalEntity[]> => {
  try {
    // Fetch entities
    const { data: entities, error: entitiesError } = await supabase
      .from('historical_entities')
      .select('*');

    if (entitiesError) {
      throw new Error(entitiesError.message);
    }

    // Fetch relations
    const { data: relations, error: relationsError } = await supabase
      .from('historical_relations')
      .select('*');

    if (relationsError) {
      throw new Error(relationsError.message);
    }

    // Format data to match the existing component expectations
    return formatHistoricalData(entities as HistoricalEntity[], relations as HistoricalRelation[]);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    toast.error('Failed to fetch historical data. Please try again later.');
    return [];
  }
};

// Function to transform data from database format to component format
export const formatHistoricalData = (
  entities: HistoricalEntity[],
  relations: HistoricalRelation[]
): FormattedHistoricalEntity[] => {
  return entities.map(entity => {
    // Find all relations where this entity is the source
    const entityRelations = relations
      .filter(relation => relation.source_id === entity.id)
      .map(relation => ({
        targetId: relation.target_id,
        type: relation.type,
        strength: relation.strength
      }));

    // Find all connections (target IDs) for this entity
    const connections = entityRelations.map(relation => relation.targetId);

    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      startDate: entity.start_date || undefined,
      endDate: entity.end_date || undefined,
      description: entity.description || undefined,
      significance: entity.significance,
      group: entity.group_name || undefined,
      relations: entityRelations,
      connections
    };
  });
};

// Function to analyze text and extract historical entities using the Supabase edge function
export const analyzeHistoricalText = async (text: string): Promise<FormattedHistoricalEntity[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-historical-text', {
      body: { text }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data || !data.entities) {
      throw new Error('No data returned from analysis');
    }

    // If we get a successful response, store the entities in the database
    const entitiesToInsert = await storeAnalyzedEntities(data.entities);
    
    return entitiesToInsert;
  } catch (error) {
    console.error('Error analyzing historical text:', error);
    toast.error('Failed to analyze text. Please try again later.');
    throw error;
  }
};

// Function to store analyzed entities and their relations in the database
const storeAnalyzedEntities = async (analyzedEntities: any[]): Promise<FormattedHistoricalEntity[]> => {
  try {
    const formattedEntities: Partial<HistoricalEntity>[] = analyzedEntities.map(entity => ({
      name: entity.name,
      type: entity.type,
      start_date: entity.startDate,
      end_date: entity.endDate,
      description: entity.description,
      significance: entity.significance,
      group_name: entity.group,
      domains: entity.domains || []
    }));

    // Insert entities to the database
    const { data: insertedEntities, error: insertEntitiesError } = await supabase
      .from('historical_entities')
      .insert(formattedEntities)
      .select();

    if (insertEntitiesError) {
      throw new Error(insertEntitiesError.message);
    }

    // Create a map of original entity IDs to new database IDs
    const idMapping = {};
    insertedEntities.forEach((entity, index) => {
      idMapping[analyzedEntities[index].id] = entity.id;
    });

    // Format relations for insertion
    const relations: Partial<HistoricalRelation>[] = [];
    
    analyzedEntities.forEach(entity => {
      if (entity.relations && Array.isArray(entity.relations)) {
        entity.relations.forEach(relation => {
          const sourceId = idMapping[entity.id];
          const targetId = idMapping[relation.targetId];
          
          if (sourceId && targetId) {
            relations.push({
              source_id: sourceId,
              target_id: targetId,
              type: relation.type as RelationType || 'default',
              strength: relation.strength || 5
            });
          }
        });
      }
    });

    // Insert relations if there are any
    if (relations.length > 0) {
      const { error: insertRelationsError } = await supabase
        .from('historical_relations')
        .insert(relations);

      if (insertRelationsError) {
        console.error('Error inserting relations:', insertRelationsError);
      }
    }

    // Return formatted entities to match component expectations
    return insertedEntities.map((entity, index) => ({
      ...entity,
      id: entity.id,
      name: entity.name,
      type: entity.type,
      startDate: entity.start_date,
      endDate: entity.end_date,
      description: entity.description,
      significance: entity.significance,
      group: entity.group_name,
      // Map relations using the new IDs
      relations: (analyzedEntities[index].relations || []).map(relation => ({
        targetId: idMapping[relation.targetId],
        type: relation.type,
        strength: relation.strength
      })),
      connections: (analyzedEntities[index].relations || [])
        .map(relation => idMapping[relation.targetId])
        .filter(Boolean)
    }));
  } catch (error) {
    console.error('Error storing analyzed entities:', error);
    toast.error('Failed to store analyzed entities.');
    throw error;
  }
};
