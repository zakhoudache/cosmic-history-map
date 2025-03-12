import { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  user_id: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserProfile extends Profile {
  user: User | null;
}

export interface CustomSession {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

export type RelationType = 
  'influenced' | 
  'allied_with' | 
  'opposed_to' | 
  'succeeded' | 
  'preceded' | 
  'created' | 
  'destroyed' | 
  'participated_in' | 
  'led' | 
  'member_of' | 
  'located_in' | 
  'contemporary_of' | 
  'related_to' | 
  'descendant_of' | 
  'ancestor_of';

export type HistoricalRelation = {
  targetId: string;
  type: string;
  strength: number;
};

export interface FormattedHistoricalEntity {
  id: string;
  name: string;
  type: string;
  startDate?: string;
  endDate?: string;
  description: string;
  imageUrl?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  importance?: number;
  group?: string;
  url?: string;
  confidence?: number;
  index?: number;
  relations: HistoricalRelation[];
}

export interface HistoricalEntity {
  id: string;
  name: string;
  type: string;
  startDate?: string;
  endDate?: string;
  description: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  importance?: number;
  group?: string;
  url?: string;
  confidence?: number;
  index?: number;
  relations?: HistoricalRelation[];
}
