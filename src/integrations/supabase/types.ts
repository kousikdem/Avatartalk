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
      avatar_settings: {
        Row: {
          avatar_mood: string | null
          avatar_type: string | null
          created_at: string | null
          head_movement: boolean | null
          id: string
          lip_sync: boolean | null
          updated_at: string | null
          user_id: string
          voice_type: string | null
        }
        Insert: {
          avatar_mood?: string | null
          avatar_type?: string | null
          created_at?: string | null
          head_movement?: boolean | null
          id?: string
          lip_sync?: boolean | null
          updated_at?: string | null
          user_id: string
          voice_type?: string | null
        }
        Update: {
          avatar_mood?: string | null
          avatar_type?: string | null
          created_at?: string | null
          head_movement?: boolean | null
          id?: string
          lip_sync?: boolean | null
          updated_at?: string | null
          user_id?: string
          voice_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avatar_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          attendees: Json | null
          created_at: string
          description: string | null
          end_time: string
          event_type: string | null
          id: string
          location: string | null
          start_time: string
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attendees?: Json | null
          created_at?: string
          description?: string | null
          end_time: string
          event_type?: string | null
          id?: string
          location?: string | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attendees?: Json | null
          created_at?: string
          description?: string | null
          end_time?: string
          event_type?: string | null
          id?: string
          location?: string | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string
          id: string
          is_paid: boolean | null
          likes_count: number | null
          media_type: string | null
          media_url: string | null
          metadata: Json | null
          post_type: string | null
          price: number | null
          updated_at: string
          user_id: string
          views_count: number | null
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string
          id?: string
          is_paid?: boolean | null
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          metadata?: Json | null
          post_type?: string | null
          price?: number | null
          updated_at?: string
          user_id: string
          views_count?: number | null
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string
          id?: string
          is_paid?: boolean | null
          likes_count?: number | null
          media_type?: string | null
          media_url?: string | null
          metadata?: Json | null
          post_type?: string | null
          price?: number | null
          updated_at?: string
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_visitors: {
        Row: {
          id: string
          ip_address: unknown | null
          user_agent: string | null
          visited_at: string
          visited_profile_id: string
          visitor_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          visited_at?: string
          visited_profile_id: string
          visitor_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          visited_at?: string
          visited_profile_id?: string
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_visitors_visited_profile_id_fkey"
            columns: ["visited_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_visitors_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          profile_pic_url: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          profile_pic_url?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          profile_pic_url?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string | null
          facebook: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          pinterest: string | null
          twitter: string | null
          updated_at: string | null
          user_id: string
          website: string | null
          youtube: string | null
        }
        Insert: {
          created_at?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          pinterest?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
          youtube?: string | null
        }
        Update: {
          created_at?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          pinterest?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
          youtube?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_analytics: {
        Row: {
          created_at: string
          date: string
          engagement_rate: number | null
          id: string
          new_followers: number | null
          post_comments: number | null
          post_likes: number | null
          post_views: number | null
          profile_views: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          engagement_rate?: number | null
          id?: string
          new_followers?: number | null
          post_comments?: number | null
          post_likes?: number | null
          post_views?: number | null
          profile_views?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          engagement_rate?: number | null
          id?: string
          new_followers?: number | null
          post_comments?: number | null
          post_likes?: number | null
          post_views?: number | null
          profile_views?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          created_at: string | null
          engagement_score: number | null
          followers_count: number | null
          id: string
          profile_views: number | null
          total_conversations: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          engagement_score?: number | null
          followers_count?: number | null
          id?: string
          profile_views?: number | null
          total_conversations?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          engagement_score?: number | null
          followers_count?: number | null
          id?: string
          profile_views?: number | null
          total_conversations?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
