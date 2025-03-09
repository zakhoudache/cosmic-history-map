
import { HistoricalEntity } from './mockData';
import { SimulationEntity, EntityLink } from '@/types/simulation';

export function prepareSimulationData(entities: HistoricalEntity[]): SimulationEntity[] {
  return entities.map(entity => ({
    ...entity,
    // Add simulation properties
    x: undefined,
    y: undefined,
    fx: null,
    fy: null,
    vx: undefined,
    vy: undefined
  }));
}

export function getEntityConnections(entities: HistoricalEntity[], entity: HistoricalEntity): EntityLink[] {
  if (!entity.relations || !Array.isArray(entity.relations)) {
    return [];
  }
  
  return entity.relations
    .map(relation => {
      const targetId = relation.target;
      const target = entities.find(e => e.id === targetId);
      
      if (target) {
        return {
          source: entity as SimulationEntity,
          target: target as SimulationEntity,
          type: relation.type || 'connected to',
          strength: 1 // Default strength if not specified
        } as EntityLink;
      }
      return null;
    })
    .filter(Boolean) as EntityLink[]; // Remove null values
}
