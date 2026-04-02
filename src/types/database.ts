export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
        };
      };
      spots: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          latitude: number;
          longitude: number;
          water_type: "lake" | "river" | "stream" | "reservoir" | "pond";
          access_notes: string | null;
          created_by: string;
          created_at: string;
          approved: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          latitude: number;
          longitude: number;
          water_type: "lake" | "river" | "stream" | "reservoir" | "pond";
          access_notes?: string | null;
          created_by: string;
          created_at?: string;
          approved?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          water_type?: "lake" | "river" | "stream" | "reservoir" | "pond";
          access_notes?: string | null;
          approved?: boolean;
        };
      };
      fish_species: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          image_url?: string | null;
        };
      };
      spot_fish: {
        Row: {
          spot_id: string;
          fish_id: string;
        };
        Insert: {
          spot_id: string;
          fish_id: string;
        };
        Update: Record<string, never>;
      };
      baits: {
        Row: {
          id: string;
          name: string;
          type: "lure" | "fly" | "live" | "powerBait" | "other";
          description: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          type: "lure" | "fly" | "live" | "powerBait" | "other";
          description?: string | null;
        };
        Update: {
          name?: string;
          type?: "lure" | "fly" | "live" | "powerBait" | "other";
          description?: string | null;
        };
      };
      catches: {
        Row: {
          id: string;
          user_id: string;
          spot_id: string;
          fish_id: string;
          bait_id: string | null;
          weight_lbs: number | null;
          length_in: number | null;
          caught_at: string;
          notes: string | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          spot_id: string;
          fish_id: string;
          bait_id?: string | null;
          weight_lbs?: number | null;
          length_in?: number | null;
          caught_at: string;
          notes?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          notes?: string | null;
          photo_url?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Spot = Database["public"]["Tables"]["spots"]["Row"];
export type FishSpecies = Database["public"]["Tables"]["fish_species"]["Row"];
export type Bait = Database["public"]["Tables"]["baits"]["Row"];
export type Catch = Database["public"]["Tables"]["catches"]["Row"];

export type SpotWithDetails = Spot & {
  fish_species: FishSpecies[];
  catch_count: number;
  top_baits: Bait[];
};
