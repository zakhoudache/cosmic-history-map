export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      entities: {
        Row: {
          created_at: string
          id: string
          relationships: Json | null
          text: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          relationships?: Json | null
          text: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          relationships?: Json | null
          text?: string
          type?: string
        }
        Relationships: []
      }
      historical_entities: {
        Row: {
          created_at: string | null
          description: string | null
          domains: string[] | null
          end_date: string | null
          group_name: string | null
          id: string
          name: string
          significance: number | null
          start_date: string | null
          type: Database["public"]["Enums"]["entity_type"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          domains?: string[] | null
          end_date?: string | null
          group_name?: string | null
          id?: string
          name: string
          significance?: number | null
          start_date?: string | null
          type: Database["public"]["Enums"]["entity_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          domains?: string[] | null
          end_date?: string | null
          group_name?: string | null
          id?: string
          name?: string
          significance?: number | null
          start_date?: string | null
          type?: Database["public"]["Enums"]["entity_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      historical_relations: {
        Row: {
          created_at: string | null
          id: string
          source_id: string
          strength: number | null
          target_id: string
          type: Database["public"]["Enums"]["relation_type"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          source_id: string
          strength?: number | null
          target_id: string
          type?: Database["public"]["Enums"]["relation_type"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          source_id?: string
          strength?: number | null
          target_id?: string
          type?: Database["public"]["Enums"]["relation_type"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historical_relations_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "historical_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_relations_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "historical_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_graph_edges: {
        Row: {
          created_at: string | null
          graph_id: string
          id: string
          relationship: string | null
          source_id: string
          target_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          graph_id: string
          id: string
          relationship?: string | null
          source_id: string
          target_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          graph_id?: string
          id?: string
          relationship?: string | null
          source_id?: string
          target_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_graph_edges_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "knowledge_graph_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_graph_edges_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "knowledge_graph_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_graph_nodes: {
        Row: {
          created_at: string | null
          date: string | null
          description: string | null
          graph_id: string
          id: string
          image: string | null
          label: string
          type: Database["public"]["Enums"]["node_type"]
          updated_at: string | null
          user_id: string
          x: number | null
          y: number | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          graph_id: string
          id: string
          image?: string | null
          label: string
          type: Database["public"]["Enums"]["node_type"]
          updated_at?: string | null
          user_id: string
          x?: number | null
          y?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          description?: string | null
          graph_id?: string
          id?: string
          image?: string | null
          label?: string
          type?: Database["public"]["Enums"]["node_type"]
          updated_at?: string | null
          user_id?: string
          x?: number | null
          y?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      entity_type:
        | "person"
        | "event"
        | "place"
        | "concept"
        | "period"
        | "artwork"
        | "document"
        | "building"
        | "theory"
        | "invention"
        | "process"
        | "play"
      node_type: "person" | "event" | "place" | "document" | "concept"
      relation_type:
        | "default"
        | "causal"
        | "correlative"
        | "conflicting"
        | "evolutionary"
        | "artist"
        | "painted"
        | "wrote"
        | "developed"
        | "authored"
        | "ledTo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
