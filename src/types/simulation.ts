
import * as d3 from 'd3';
import { HistoricalEntity } from '@/utils/mockData';

// Extended entity type for D3 simulation
export interface SimulationEntity extends HistoricalEntity, d3.SimulationNodeDatum {
  // Allow for D3 to add coordinates
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
}

// Link type for visualization
export interface EntityLink {
  source: SimulationEntity;
  target: SimulationEntity;
  type?: string;
  strength: number;
}

// Helper function to parse entity relations properly
export function parseEntityRelations(entity: HistoricalEntity): EntityLink[] {
  if (!entity.relations || !Array.isArray(entity.relations)) {
    return [];
  }
  
  return entity.relations
    .map(relation => {
      const targetId = relation.target;
      // Note: This needs to be completed in the actual implementation
      // where you have access to all entities to find the target
      return {
        source: entity as SimulationEntity,
        target: { id: targetId } as SimulationEntity, // This is just a placeholder
        type: relation.type || 'connected to',
        strength: 1 // Default strength when not specified
      } as EntityLink;
    });
}
