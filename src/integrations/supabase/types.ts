export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      api_training_data: {
        Row: {
          api_endpoint: string
          api_headers: Json | null
          api_method: string | null
          created_at: string
          id: string
          response_data: Json | null
          training_context: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_endpoint: string
          api_headers?: Json | null
          api_method?: string | null
          created_at?: string
          id?: string
          response_data?: Json | null
          training_context?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_endpoint?: string
          api_headers?: Json | null
          api_method?: string | null
          created_at?: string
          id?: string
          response_data?: Json | null
          training_context?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      avatar_configurations: {
        Row: {
          accessories: Json | null
          age_category: string
          avatar_name: string
          body_fat: number
          cheekbones: number
          clothing_bottom: string | null
          clothing_top: string | null
          created_at: string
          current_expression: string
          current_pose: string
          ear_position: number
          ear_shape: string
          ear_size: number
          eye_color: string
          eye_distance: number
          eye_shape: string
          eye_size: number
          face_width: number
          gender: string
          hair_color: string
          hair_length: number
          hair_style: string
          head_shape: string
          head_size: number
          height: number
          id: string
          is_active: boolean
          jawline: number
          lip_shape: string
          lip_thickness: number
          model_url: string | null
          mouth_width: number
          muscle_definition: number
          nose_shape: string
          nose_size: number
          nose_width: number
          shoes: string | null
          skin_texture: string
          skin_tone: string
          thumbnail_url: string | null
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          accessories?: Json | null
          age_category?: string
          avatar_name?: string
          body_fat?: number
          cheekbones?: number
          clothing_bottom?: string | null
          clothing_top?: string | null
          created_at?: string
          current_expression?: string
          current_pose?: string
          ear_position?: number
          ear_shape?: string
          ear_size?: number
          eye_color?: string
          eye_distance?: number
          eye_shape?: string
          eye_size?: number
          face_width?: number
          gender?: string
          hair_color?: string
          hair_length?: number
          hair_style?: string
          head_shape?: string
          head_size?: number
          height?: number
          id?: string
          is_active?: boolean
          jawline?: number
          lip_shape?: string
          lip_thickness?: number
          model_url?: string | null
          mouth_width?: number
          muscle_definition?: number
          nose_shape?: string
          nose_size?: number
          nose_width?: number
          shoes?: string | null
          skin_texture?: string
          skin_tone?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
          weight?: number
        }
        Update: {
          accessories?: Json | null
          age_category?: string
          avatar_name?: string
          body_fat?: number
          cheekbones?: number
          clothing_bottom?: string | null
          clothing_top?: string | null
          created_at?: string
          current_expression?: string
          current_pose?: string
          ear_position?: number
          ear_shape?: string
          ear_size?: number
          eye_color?: string
          eye_distance?: number
          eye_shape?: string
          eye_size?: number
          face_width?: number
          gender?: string
          hair_color?: string
          hair_length?: number
          hair_style?: string
          head_shape?: string
          head_size?: number
          height?: number
          id?: string
          is_active?: boolean
          jawline?: number
          lip_shape?: string
          lip_thickness?: number
          model_url?: string | null
          mouth_width?: number
          muscle_definition?: number
          nose_shape?: string
          nose_size?: number
          nose_width?: number
          shoes?: string | null
          skin_texture?: string
          skin_tone?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
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
      behavior_learning_data: {
        Row: {
          ai_response: string | null
          context_data: Json | null
          created_at: string
          feedback_score: number | null
          id: string
          interaction_type: string
          learning_enabled: boolean | null
          personality_impact: Json | null
          session_id: string | null
          user_id: string
          user_input: string | null
        }
        Insert: {
          ai_response?: string | null
          context_data?: Json | null
          created_at?: string
          feedback_score?: number | null
          id?: string
          interaction_type: string
          learning_enabled?: boolean | null
          personality_impact?: Json | null
          session_id?: string | null
          user_id: string
          user_input?: string | null
        }
        Update: {
          ai_response?: string | null
          context_data?: Json | null
          created_at?: string
          feedback_score?: number | null
          id?: string
          interaction_type?: string
          learning_enabled?: boolean | null
          personality_impact?: Json | null
          session_id?: string | null
          user_id?: string
          user_input?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "behavior_learning_data_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
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
      collaborations: {
        Row: {
          collaboration_type: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          participants: Json | null
          start_date: string | null
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          collaboration_type?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          participants?: Json | null
          start_date?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          collaboration_type?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          participants?: Json | null
          start_date?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          comment_type: string
          content: string
          created_at: string
          id: string
          post_id: string | null
          profile_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment_type: string
          content: string
          created_at?: string
          id?: string
          post_id?: string | null
          profile_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment_type?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string | null
          profile_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
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
          thumbnail_url: string | null
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
          thumbnail_url?: string | null
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
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      likes: {
        Row: {
          created_at: string
          id: string
          like_type: string
          post_id: string | null
          profile_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          like_type: string
          post_id?: string | null
          profile_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          like_type?: string
          post_id?: string | null
          profile_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_profile_id_fkey"
            columns: ["profile_id"]
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
      personalized_ai_training: {
        Row: {
          created_at: string
          id: string
          model_status: string | null
          personality_settings: Json | null
          scenario_template: string | null
          training_data: Json | null
          training_name: string
          training_progress: number | null
          updated_at: string
          user_id: string
          voice_model_id: string | null
          voice_settings: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          model_status?: string | null
          personality_settings?: Json | null
          scenario_template?: string | null
          training_data?: Json | null
          training_name: string
          training_progress?: number | null
          updated_at?: string
          user_id: string
          voice_model_id?: string | null
          voice_settings?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          model_status?: string | null
          personality_settings?: Json | null
          scenario_template?: string | null
          training_data?: Json | null
          training_name?: string
          training_progress?: number | null
          updated_at?: string
          user_id?: string
          voice_model_id?: string | null
          voice_settings?: Json | null
        }
        Relationships: []
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
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_free: boolean | null
          media_type: string | null
          media_url: string | null
          price: number | null
          product_type: string
          status: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          views_count: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean | null
          media_type?: string | null
          media_url?: string | null
          price?: number | null
          product_type: string
          status?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          views_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean | null
          media_type?: string | null
          media_url?: string | null
          price?: number | null
          product_type?: string
          status?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      profile_visitors: {
        Row: {
          id: string
          is_anonymous: boolean | null
          visited_at: string
          visited_profile_id: string
          visitor_id: string | null
        }
        Insert: {
          id?: string
          is_anonymous?: boolean | null
          visited_at?: string
          visited_profile_id: string
          visitor_id?: string | null
        }
        Update: {
          id?: string
          is_anonymous?: boolean | null
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
          age: number | null
          avatar_id: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          profession: string | null
          profile_pic_url: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          age?: number | null
          avatar_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          profession?: string | null
          profile_pic_url?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          age?: number | null
          avatar_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          profession?: string | null
          profile_pic_url?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "avatar_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_pairs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          question: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          question: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          question?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scenario_templates: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          personality_preset: Json
          template_name: string
          template_type: string
          training_prompts: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          personality_preset: Json
          template_name: string
          template_type: string
          training_prompts?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          personality_preset?: Json
          template_name?: string
          template_type?: string
          training_prompts?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string | null
          discord: string | null
          facebook: string | null
          github: string | null
          id: string
          instagram: string | null
          linkedin: string | null
          pinterest: string | null
          tiktok: string | null
          twitch: string | null
          twitter: string | null
          updated_at: string | null
          user_id: string
          website: string | null
          youtube: string | null
        }
        Insert: {
          created_at?: string | null
          discord?: string | null
          facebook?: string | null
          github?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          pinterest?: string | null
          tiktok?: string | null
          twitch?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
          youtube?: string | null
        }
        Update: {
          created_at?: string | null
          discord?: string | null
          facebook?: string | null
          github?: string | null
          id?: string
          instagram?: string | null
          linkedin?: string | null
          pinterest?: string | null
          tiktok?: string | null
          twitch?: string | null
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
      subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          price: number
          status: string
          subscribed_to_id: string | null
          subscriber_id: string
          subscription_type: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          price?: number
          status?: string
          subscribed_to_id?: string | null
          subscriber_id: string
          subscription_type?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          price?: number
          status?: string
          subscribed_to_id?: string | null
          subscriber_id?: string
          subscription_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_subscribed_to_id_fkey"
            columns: ["subscribed_to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_documents: {
        Row: {
          created_at: string
          extracted_content: string | null
          file_path: string
          file_size: number
          file_type: string
          filename: string
          id: string
          processing_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          extracted_content?: string | null
          file_path: string
          file_size: number
          file_type: string
          filename: string
          id?: string
          processing_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          extracted_content?: string | null
          file_path?: string
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          processing_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          created_at: string
          id: string
          personality_settings: Json | null
          progress: number | null
          session_name: string
          status: string | null
          training_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          personality_settings?: Json | null
          progress?: number | null
          session_name: string
          status?: string | null
          training_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          personality_settings?: Json | null
          progress?: number | null
          session_name?: string
          status?: string | null
          training_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          following_count: number | null
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
          following_count?: number | null
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
          following_count?: number | null
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
      voice_cloning: {
        Row: {
          clone_status: string | null
          cloned_voice_path: string | null
          created_at: string
          id: string
          original_voice_path: string
          updated_at: string
          user_id: string
          voice_model_id: string | null
          voice_settings: Json | null
        }
        Insert: {
          clone_status?: string | null
          cloned_voice_path?: string | null
          created_at?: string
          id?: string
          original_voice_path: string
          updated_at?: string
          user_id: string
          voice_model_id?: string | null
          voice_settings?: Json | null
        }
        Update: {
          clone_status?: string | null
          cloned_voice_path?: string | null
          created_at?: string
          id?: string
          original_voice_path?: string
          updated_at?: string
          user_id?: string
          voice_model_id?: string | null
          voice_settings?: Json | null
        }
        Relationships: []
      }
      voice_profiles: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          profile_name: string
          updated_at: string
          user_id: string
          voice_settings: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          profile_name: string
          updated_at?: string
          user_id: string
          voice_settings?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          profile_name?: string
          updated_at?: string
          user_id?: string
          voice_settings?: Json | null
        }
        Relationships: []
      }
      voice_recordings: {
        Row: {
          created_at: string
          duration: number | null
          file_path: string
          filename: string
          id: string
          transcription: string | null
          updated_at: string
          user_id: string
          voice_profile_id: string | null
        }
        Insert: {
          created_at?: string
          duration?: number | null
          file_path: string
          filename: string
          id?: string
          transcription?: string | null
          updated_at?: string
          user_id: string
          voice_profile_id?: string | null
        }
        Update: {
          created_at?: string
          duration?: number | null
          file_path?: string
          filename?: string
          id?: string
          transcription?: string | null
          updated_at?: string
          user_id?: string
          voice_profile_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_profile: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          display_name: string
          full_name: string
          id: string
          profession: string
          profile_pic_url: string
          updated_at: string
          username: string
        }[]
      }
      get_safe_profile_fields: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          display_name: string
          id: string
          profession: string
          profile_pic_url: string
          username: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
