
export type EntityType = 
  | 'person' 
  | 'event' 
  | 'place' 
  | 'concept' 
  | 'period' 
  | 'artwork' 
  | 'document' 
  | 'building' 
  | 'theory' 
  | 'invention' 
  | 'process' 
  | 'play';

export type RelationType = 
  | 'default' 
  | 'causal' 
  | 'correlative' 
  | 'conflicting' 
  | 'evolutionary' 
  | 'artist' 
  | 'painted' 
  | 'wrote' 
  | 'developed' 
  | 'authored' 
  | 'ledTo';

export interface HistoricalEntity {
  id: string;
  name: string;
  type: EntityType;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
  significance: number;
  group_name?: string | null;
  domains?: string[];
  created_at: string;
  updated_at: string;
  user_id?: string | null;
}

export interface HistoricalRelation {
  id: string;
  source_id: string;
  target_id: string;
  type: RelationType;
  strength: number;
  created_at: string;
  updated_at: string;
  user_id?: string | null;
}

// Interface that matches the format used by existing components
export interface FormattedHistoricalEntity {
  id: string;
  name: string;
  type: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  significance?: number;
  group?: string;
  relations?: {
    target?: string;
    targetId?: string;
    type?: string;
    strength?: number;
  }[];
  connections?: string[];
  // Fields needed for D3 simulation
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  index?: number;
}
