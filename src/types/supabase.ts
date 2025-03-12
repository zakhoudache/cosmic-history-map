
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

export interface EntityRelation {
  targetId: string;
  type: string;
  strength: number;
}

export interface HistoricalEntity {
  id: string;
  name: string;
  type: string;
  startDate?: string;
  endDate?: string;
  description: string;
  location?: string;
  coordinates?: [number, number];
  importance?: number;
  relations: EntityRelation[];
  category?: string;
  subcategory?: string;
  significance?: number;
  url?: string;
  image?: string;
  tags?: string[];
  creator?: string;
  createdAt?: string;
  updatedAt?: string;
  index?: number;
}

export interface FormattedHistoricalEntity {
  id: string;
  name: string;
  type: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  location?: string;
  coordinates?: [number, number];
  importance?: number;
  relations: EntityRelation[];
  category?: string;
  subcategory?: string;
  significance?: number;
  url?: string;
  image?: string;
  tags?: string[];
  creator?: string;
  createdAt?: string;
  updatedAt?: string;
  index?: number;
}
