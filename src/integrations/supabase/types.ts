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
      admin_audit_logs: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          target_id: string | null
          target_table: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      ai_chat_history: {
        Row: {
          created_at: string
          id: string
          message: string
          profile_id: string
          rich_data: Json | null
          sender: string
          visitor_id: string | null
          visitor_session_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          profile_id: string
          rich_data?: Json | null
          sender: string
          visitor_id?: string | null
          visitor_session_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          profile_id?: string
          rich_data?: Json | null
          sender?: string
          visitor_id?: string | null
          visitor_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_history_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_history_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_memory: {
        Row: {
          created_at: string
          engagement_score: number | null
          first_visit_at: string | null
          follow_ups_completed: number | null
          follow_ups_shown: number | null
          id: string
          last_topics: Json | null
          last_visit_at: string | null
          preferences: Json | null
          profile_id: string
          session_count: number | null
          total_messages: number | null
          updated_at: string
          visitor_email: string | null
          visitor_id: string
          visitor_metadata: Json | null
          visitor_name: string | null
          welcome_shown: boolean | null
        }
        Insert: {
          created_at?: string
          engagement_score?: number | null
          first_visit_at?: string | null
          follow_ups_completed?: number | null
          follow_ups_shown?: number | null
          id?: string
          last_topics?: Json | null
          last_visit_at?: string | null
          preferences?: Json | null
          profile_id: string
          session_count?: number | null
          total_messages?: number | null
          updated_at?: string
          visitor_email?: string | null
          visitor_id: string
          visitor_metadata?: Json | null
          visitor_name?: string | null
          welcome_shown?: boolean | null
        }
        Update: {
          created_at?: string
          engagement_score?: number | null
          first_visit_at?: string | null
          follow_ups_completed?: number | null
          follow_ups_shown?: number | null
          id?: string
          last_topics?: Json | null
          last_visit_at?: string | null
          preferences?: Json | null
          profile_id?: string
          session_count?: number | null
          total_messages?: number | null
          updated_at?: string
          visitor_email?: string | null
          visitor_id?: string
          visitor_metadata?: Json | null
          visitor_name?: string | null
          welcome_shown?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_memory_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_memory_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_follow_ups: {
        Row: {
          always_ask: boolean | null
          analytics_description: string | null
          analytics_id: string | null
          choices: Json | null
          conditions: Json | null
          cooldown_seconds: number | null
          created_at: string
          id: string
          is_active: boolean | null
          max_per_session: number | null
          presentation: string | null
          probability_pct: number | null
          question_text: string
          question_type: string | null
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          always_ask?: boolean | null
          analytics_description?: string | null
          analytics_id?: string | null
          choices?: Json | null
          conditions?: Json | null
          cooldown_seconds?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_per_session?: number | null
          presentation?: string | null
          probability_pct?: number | null
          question_text: string
          question_type?: string | null
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          always_ask?: boolean | null
          analytics_description?: string | null
          analytics_id?: string | null
          choices?: Json | null
          conditions?: Json | null
          cooldown_seconds?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_per_session?: number | null
          presentation?: string | null
          probability_pct?: number | null
          question_text?: string
          question_type?: string | null
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_follow_ups_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_system_limits: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          limit_key: string
          limit_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          limit_key: string
          limit_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          limit_key?: string
          limit_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      ai_topics: {
        Row: {
          authority: string | null
          avoid_rules: Json | null
          created_at: string
          describe_history: Json | null
          describe_priority: boolean | null
          describe_text: string | null
          do_rules: Json | null
          id: string
          is_active: boolean | null
          keywords: Json | null
          sample_prompts: Json | null
          topic_name: string
          topic_priority: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          authority?: string | null
          avoid_rules?: Json | null
          created_at?: string
          describe_history?: Json | null
          describe_priority?: boolean | null
          describe_text?: string | null
          do_rules?: Json | null
          id?: string
          is_active?: boolean | null
          keywords?: Json | null
          sample_prompts?: Json | null
          topic_name: string
          topic_priority?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          authority?: string | null
          avoid_rules?: Json | null
          created_at?: string
          describe_history?: Json | null
          describe_priority?: boolean | null
          describe_text?: string | null
          do_rules?: Json | null
          id?: string
          is_active?: boolean | null
          keywords?: Json | null
          sample_prompts?: Json | null
          topic_name?: string
          topic_priority?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_training_settings: {
        Row: {
          created_at: string
          custom_variables: Json | null
          engagement_score_weight: Json | null
          global_describe_priority: boolean | null
          global_describe_text: string | null
          id: string
          updated_at: string
          user_id: string
          welcome_message_enabled: boolean | null
          welcome_message_language: string | null
          welcome_message_text: string | null
          welcome_message_trigger: string | null
        }
        Insert: {
          created_at?: string
          custom_variables?: Json | null
          engagement_score_weight?: Json | null
          global_describe_priority?: boolean | null
          global_describe_text?: string | null
          id?: string
          updated_at?: string
          user_id: string
          welcome_message_enabled?: boolean | null
          welcome_message_language?: string | null
          welcome_message_text?: string | null
          welcome_message_trigger?: string | null
        }
        Update: {
          created_at?: string
          custom_variables?: Json | null
          engagement_score_weight?: Json | null
          global_describe_priority?: boolean | null
          global_describe_text?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          welcome_message_enabled?: boolean | null
          welcome_message_language?: string | null
          welcome_message_text?: string | null
          welcome_message_trigger?: string | null
        }
        Relationships: []
      }
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
          compressed_gif_url: string | null
          compressed_glb_url: string | null
          compressed_json_url: string | null
          compression_ratio: number | null
          configuration_data: Json | null
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
          fbx_export_url: string | null
          gender: string
          gif_export_url: string | null
          glb_export_url: string | null
          gltf_export_url: string | null
          hair_color: string
          hair_length: number
          hair_style: string
          head_shape: string
          head_size: number
          height: number
          id: string
          is_active: boolean
          jawline: number
          json_export_url: string | null
          last_export_date: string | null
          last_export_format: string | null
          lip_shape: string
          lip_thickness: number
          model_url: string | null
          mouth_width: number
          muscle_definition: number
          nose_shape: string
          nose_size: number
          nose_width: number
          obj_export_url: string | null
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
          compressed_gif_url?: string | null
          compressed_glb_url?: string | null
          compressed_json_url?: string | null
          compression_ratio?: number | null
          configuration_data?: Json | null
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
          fbx_export_url?: string | null
          gender?: string
          gif_export_url?: string | null
          glb_export_url?: string | null
          gltf_export_url?: string | null
          hair_color?: string
          hair_length?: number
          hair_style?: string
          head_shape?: string
          head_size?: number
          height?: number
          id?: string
          is_active?: boolean
          jawline?: number
          json_export_url?: string | null
          last_export_date?: string | null
          last_export_format?: string | null
          lip_shape?: string
          lip_thickness?: number
          model_url?: string | null
          mouth_width?: number
          muscle_definition?: number
          nose_shape?: string
          nose_size?: number
          nose_width?: number
          obj_export_url?: string | null
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
          compressed_gif_url?: string | null
          compressed_glb_url?: string | null
          compressed_json_url?: string | null
          compression_ratio?: number | null
          configuration_data?: Json | null
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
          fbx_export_url?: string | null
          gender?: string
          gif_export_url?: string | null
          glb_export_url?: string | null
          gltf_export_url?: string | null
          hair_color?: string
          hair_length?: number
          hair_style?: string
          head_shape?: string
          head_size?: number
          height?: number
          id?: string
          is_active?: boolean
          jawline?: number
          json_export_url?: string | null
          last_export_date?: string | null
          last_export_format?: string | null
          lip_shape?: string
          lip_thickness?: number
          model_url?: string | null
          mouth_width?: number
          muscle_definition?: number
          nose_shape?: string
          nose_size?: number
          nose_width?: number
          obj_export_url?: string | null
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
          {
            foreignKeyName: "avatar_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
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
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          other_user_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          other_user_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          other_user_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
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
          parent_comment_id: string | null
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
          parent_comment_id?: string | null
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
          parent_comment_id?: string | null
          post_id?: string | null
          profile_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "comments_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      country_payment_rules: {
        Row: {
          allowed_methods: Json | null
          country_code: string
          country_name: string
          created_at: string | null
          currency: string
          id: string
          max_order_amount: number | null
          min_order_amount: number | null
          notes: string | null
          payment_enabled: boolean | null
          requires_kyc: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_methods?: Json | null
          country_code: string
          country_name: string
          created_at?: string | null
          currency: string
          id?: string
          max_order_amount?: number | null
          min_order_amount?: number | null
          notes?: string | null
          payment_enabled?: boolean | null
          requires_kyc?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_methods?: Json | null
          country_code?: string
          country_name?: string
          created_at?: string | null
          currency?: string
          id?: string
          max_order_amount?: number | null
          min_order_amount?: number | null
          notes?: string | null
          payment_enabled?: boolean | null
          requires_kyc?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_token_purchases: {
        Row: {
          amount_inr: number
          amount_usd: number | null
          completed_at: string | null
          created_at: string | null
          id: string
          price_per_million_tokens: number | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string | null
          tokens_requested: number
          user_id: string
        }
        Insert: {
          amount_inr: number
          amount_usd?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          price_per_million_tokens?: number | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string | null
          tokens_requested: number
          user_id: string
        }
        Update: {
          amount_inr?: number
          amount_usd?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          price_per_million_tokens?: number | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string | null
          tokens_requested?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_token_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_token_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_token_usage: {
        Row: {
          created_at: string | null
          day: string
          id: string
          input_tokens: number | null
          message_count: number | null
          output_tokens: number | null
          total_tokens: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day: string
          id?: string
          input_tokens?: number | null
          message_count?: number | null
          output_tokens?: number | null
          total_tokens?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          day?: string
          id?: string
          input_tokens?: number | null
          message_count?: number | null
          output_tokens?: number | null
          total_tokens?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_token_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_token_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          active: boolean | null
          analytics_data: Json | null
          applicable_product_ids: string[] | null
          auto_apply: boolean | null
          code: string
          combinable: boolean | null
          created_at: string
          created_by_type: string | null
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          flash_sale: boolean | null
          fraud_flags: Json | null
          free_shipping: boolean | null
          id: string
          max_uses: number | null
          max_uses_per_user: number | null
          min_order_value: number | null
          min_quantity: number | null
          priority: number | null
          recurring_schedule: Json | null
          scope: string
          seller_id: string
          starts_at: string | null
          target_buyer_type: string | null
          target_product_type: string | null
          targeting_rules: Json | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          analytics_data?: Json | null
          applicable_product_ids?: string[] | null
          auto_apply?: boolean | null
          code: string
          combinable?: boolean | null
          created_at?: string
          created_by_type?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          flash_sale?: boolean | null
          fraud_flags?: Json | null
          free_shipping?: boolean | null
          id?: string
          max_uses?: number | null
          max_uses_per_user?: number | null
          min_order_value?: number | null
          min_quantity?: number | null
          priority?: number | null
          recurring_schedule?: Json | null
          scope?: string
          seller_id: string
          starts_at?: string | null
          target_buyer_type?: string | null
          target_product_type?: string | null
          targeting_rules?: Json | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          analytics_data?: Json | null
          applicable_product_ids?: string[] | null
          auto_apply?: boolean | null
          code?: string
          combinable?: boolean | null
          created_at?: string
          created_by_type?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          flash_sale?: boolean | null
          fraud_flags?: Json | null
          free_shipping?: boolean | null
          id?: string
          max_uses?: number | null
          max_uses_per_user?: number | null
          min_order_value?: number | null
          min_quantity?: number | null
          priority?: number | null
          recurring_schedule?: Json | null
          scope?: string
          seller_id?: string
          starts_at?: string | null
          target_buyer_type?: string | null
          target_product_type?: string | null
          targeting_rules?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      discount_usage: {
        Row: {
          buyer_type: string | null
          discount_amount: number | null
          discount_code_id: string
          id: string
          order_amount: number | null
          order_id: string | null
          used_at: string
          user_id: string
        }
        Insert: {
          buyer_type?: string | null
          discount_amount?: number | null
          discount_code_id: string
          id?: string
          order_amount?: number | null
          order_id?: string | null
          used_at?: string
          user_id: string
        }
        Update: {
          buyer_type?: string | null
          discount_amount?: number | null
          discount_code_id?: string
          id?: string
          order_amount?: number | null
          order_id?: string | null
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_usage_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "seller_orders_safe"
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
      feature_flags: {
        Row: {
          affected_roles: string[] | null
          created_at: string | null
          description: string | null
          flag_name: string
          id: string
          is_enabled: boolean | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          affected_roles?: string[] | null
          created_at?: string | null
          description?: string | null
          flag_name: string
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          affected_roles?: string[] | null
          created_at?: string | null
          description?: string | null
          flag_name?: string
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      follower_analytics: {
        Row: {
          created_at: string | null
          date: string
          followers_gained: number | null
          followers_lost: number | null
          id: string
          net_growth: number | null
          total_followers: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          followers_gained?: number | null
          followers_lost?: number | null
          id?: string
          net_growth?: number | null
          total_followers?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          followers_gained?: number | null
          followers_lost?: number | null
          id?: string
          net_growth?: number | null
          total_followers?: number | null
          user_id?: string
        }
        Relationships: []
      }
      follower_categories: {
        Row: {
          category_name: string
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_name: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_name?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      follower_category_assignments: {
        Row: {
          category_id: string
          created_at: string | null
          following_id: string
          id: string
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          following_id: string
          id?: string
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          following_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follower_category_assignments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "follower_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      follower_engagement: {
        Row: {
          chat_interactions: number | null
          created_at: string | null
          engagement_score: number | null
          follower_id: string
          id: string
          last_interaction_at: string | null
          link_clicks: number | null
          post_comments: number | null
          post_likes: number | null
          product_purchases: number | null
          profile_visits: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chat_interactions?: number | null
          created_at?: string | null
          engagement_score?: number | null
          follower_id: string
          id?: string
          last_interaction_at?: string | null
          link_clicks?: number | null
          post_comments?: number | null
          post_likes?: number | null
          product_purchases?: number | null
          profile_visits?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chat_interactions?: number | null
          created_at?: string | null
          engagement_score?: number | null
          follower_id?: string
          id?: string
          last_interaction_at?: string | null
          link_clicks?: number | null
          post_comments?: number | null
          post_likes?: number | null
          product_purchases?: number | null
          profile_visits?: number | null
          updated_at?: string | null
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
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      host_integrations: {
        Row: {
          calendar_sync_enabled: boolean | null
          created_at: string
          google_access_token: string | null
          google_connected: boolean | null
          google_email: string | null
          google_refresh_token: string | null
          google_scopes: string[] | null
          google_token_expires_at: string | null
          id: string
          last_sync_at: string | null
          updated_at: string
          user_id: string
          zoom_access_token: string | null
          zoom_connected: boolean | null
          zoom_email: string | null
          zoom_refresh_token: string | null
          zoom_token_expires_at: string | null
          zoom_user_id: string | null
        }
        Insert: {
          calendar_sync_enabled?: boolean | null
          created_at?: string
          google_access_token?: string | null
          google_connected?: boolean | null
          google_email?: string | null
          google_refresh_token?: string | null
          google_scopes?: string[] | null
          google_token_expires_at?: string | null
          id?: string
          last_sync_at?: string | null
          updated_at?: string
          user_id: string
          zoom_access_token?: string | null
          zoom_connected?: boolean | null
          zoom_email?: string | null
          zoom_refresh_token?: string | null
          zoom_token_expires_at?: string | null
          zoom_user_id?: string | null
        }
        Update: {
          calendar_sync_enabled?: boolean | null
          created_at?: string
          google_access_token?: string | null
          google_connected?: boolean | null
          google_email?: string | null
          google_refresh_token?: string | null
          google_scopes?: string[] | null
          google_token_expires_at?: string | null
          id?: string
          last_sync_at?: string | null
          updated_at?: string
          user_id?: string
          zoom_access_token?: string | null
          zoom_connected?: boolean | null
          zoom_email?: string | null
          zoom_refresh_token?: string | null
          zoom_token_expires_at?: string | null
          zoom_user_id?: string | null
        }
        Relationships: []
      }
      integration_auth: {
        Row: {
          created_at: string | null
          encrypted_access_token: string | null
          encrypted_refresh_token: string | null
          expires_at: string | null
          id: string
          integration_id: string
          token_metadata: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          encrypted_access_token?: string | null
          encrypted_refresh_token?: string | null
          expires_at?: string | null
          id?: string
          integration_id: string
          token_metadata?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          encrypted_access_token?: string | null
          encrypted_refresh_token?: string | null
          expires_at?: string | null
          id?: string
          integration_id?: string
          token_metadata?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_auth_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_logs: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          integration_id: string
          payload: Json | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          integration_id: string
          payload?: Json | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          integration_id?: string
          payload?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_settings: {
        Row: {
          created_at: string | null
          id: string
          integration_id: string
          settings_json: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          integration_id: string
          settings_json?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          integration_id?: string
          settings_json?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_settings_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          connected: boolean | null
          connection_data: Json | null
          created_at: string | null
          id: string
          provider: string
          scopes: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connected?: boolean | null
          connection_data?: Json | null
          created_at?: string | null
          id?: string
          provider: string
          scopes?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connected?: boolean | null
          connection_data?: Json | null
          created_at?: string | null
          id?: string
          provider?: string
          scopes?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          buyer_id: string
          completed_at: string | null
          created_at: string
          currency: string
          discount_amount: number | null
          fulfillment_status: string | null
          id: string
          metadata: Json | null
          order_notes: string | null
          order_status: string
          payment_method: string
          payment_status: string
          platform_fee: number | null
          product_id: string | null
          quantity: number
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          seller_earnings: number | null
          seller_id: string
          shipping_address: Json | null
          shipping_amount: number | null
          shipping_method: string | null
          tax_amount: number | null
          total_amount: number
          tracking_number: string | null
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          amount: number
          buyer_id: string
          completed_at?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number | null
          fulfillment_status?: string | null
          id?: string
          metadata?: Json | null
          order_notes?: string | null
          order_status?: string
          payment_method?: string
          payment_status?: string
          platform_fee?: number | null
          product_id?: string | null
          quantity?: number
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          seller_earnings?: number | null
          seller_id: string
          shipping_address?: Json | null
          shipping_amount?: number | null
          shipping_method?: string | null
          tax_amount?: number | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          completed_at?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number | null
          fulfillment_status?: string | null
          id?: string
          metadata?: Json | null
          order_notes?: string | null
          order_status?: string
          payment_method?: string
          payment_status?: string
          platform_fee?: number | null
          product_id?: string | null
          quantity?: number
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          seller_earnings?: number | null
          seller_id?: string
          shipping_address?: Json | null
          shipping_amount?: number | null
          shipping_method?: string | null
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_failure_logs: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          error_code: string | null
          error_description: string | null
          failure_reason: string | null
          id: string
          metadata: Json | null
          order_id: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          seller_id: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          error_code?: string | null
          error_description?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          seller_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          error_code?: string | null
          error_description?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          seller_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_failure_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_failure_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "seller_orders_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          allowed_currencies: Json | null
          created_at: string | null
          currency: string
          default_plan_id: string | null
          enabled: boolean | null
          id: string
          platform_commission_percent: number | null
          profile_id: string
          refund_policy: string | null
          require_follow: boolean | null
          taxes: Json | null
          updated_at: string | null
        }
        Insert: {
          allowed_currencies?: Json | null
          created_at?: string | null
          currency?: string
          default_plan_id?: string | null
          enabled?: boolean | null
          id?: string
          platform_commission_percent?: number | null
          profile_id: string
          refund_policy?: string | null
          require_follow?: boolean | null
          taxes?: Json | null
          updated_at?: string | null
        }
        Update: {
          allowed_currencies?: Json | null
          created_at?: string | null
          currency?: string
          default_plan_id?: string | null
          enabled?: boolean | null
          id?: string
          platform_commission_percent?: number | null
          profile_id?: string
          refund_policy?: string | null
          require_follow?: boolean | null
          taxes?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_settings_default_plan_id_fkey"
            columns: ["default_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_settings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_settings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
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
      platform_integration_secrets: {
        Row: {
          created_at: string | null
          environment: string
          id: string
          integration_name: string
          is_active: boolean | null
          last_verified_at: string | null
          secret_key: string
          secret_value: string | null
          updated_at: string | null
          updated_by: string | null
          verification_status: string | null
        }
        Insert: {
          created_at?: string | null
          environment?: string
          id?: string
          integration_name: string
          is_active?: boolean | null
          last_verified_at?: string | null
          secret_key: string
          secret_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
          verification_status?: string | null
        }
        Update: {
          created_at?: string | null
          environment?: string
          id?: string
          integration_name?: string
          is_active?: boolean | null
          last_verified_at?: string | null
          secret_key?: string
          secret_value?: string | null
          updated_at?: string | null
          updated_by?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      platform_plan_transactions: {
        Row: {
          amount: number
          billing_cycle_months: number | null
          created_at: string
          currency: string | null
          id: string
          metadata: Json | null
          plan_id: string | null
          plan_key: string
          previous_plan_key: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string
          transaction_type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle_months?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          plan_key: string
          previous_plan_key?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          transaction_type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle_months?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          plan_key?: string
          previous_plan_key?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          transaction_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_plan_transactions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "platform_pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_pricing_plans: {
        Row: {
          advanced_analytics: boolean | null
          ai_tokens_monthly: number | null
          api_access: boolean | null
          avatar_type: string | null
          basic_analytics: boolean | null
          billing_cycle: string
          brand_collaborations: boolean | null
          created_at: string
          custom_voice_enabled: boolean | null
          digital_products_enabled: boolean | null
          discount_12_month: number | null
          discount_3_month: number | null
          discount_6_month: number | null
          display_order: number | null
          doc_upload_enabled: boolean | null
          earnings_analytics: boolean | null
          events_enabled: boolean | null
          features_list: Json | null
          google_calendar_full: boolean | null
          google_calendar_readonly: boolean | null
          google_meet_integration: boolean | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          max_avatars: number | null
          max_team_members: number | null
          multi_currency_enabled: boolean | null
          multilingual_ai: boolean | null
          multiple_admins: boolean | null
          multiple_avatars_per_profile: boolean | null
          offer_badge: string | null
          offer_expires_at: string | null
          offer_text: string | null
          paid_events_enabled: boolean | null
          payments_enabled: boolean | null
          physical_products_enabled: boolean | null
          plan_key: string
          plan_name: string
          price_12_month_inr: number | null
          price_12_month_usd: number | null
          price_3_month_inr: number | null
          price_3_month_usd: number | null
          price_6_month_inr: number | null
          price_6_month_usd: number | null
          price_inr: number
          price_usd: number
          priority_ai_processing: boolean | null
          promo_codes_enabled: boolean | null
          qa_training_enabled: boolean | null
          shopify_integration: boolean | null
          subscription_button_enabled: boolean | null
          tagline: string | null
          team_enabled: boolean | null
          training_storage_mb: number | null
          unlimited_training_sources: boolean | null
          updated_at: string
          virtual_meetings_enabled: boolean | null
          voice_clone_enabled: boolean | null
          voice_minutes_monthly: number | null
          web_training_enabled: boolean | null
          zoom_integration: boolean | null
        }
        Insert: {
          advanced_analytics?: boolean | null
          ai_tokens_monthly?: number | null
          api_access?: boolean | null
          avatar_type?: string | null
          basic_analytics?: boolean | null
          billing_cycle?: string
          brand_collaborations?: boolean | null
          created_at?: string
          custom_voice_enabled?: boolean | null
          digital_products_enabled?: boolean | null
          discount_12_month?: number | null
          discount_3_month?: number | null
          discount_6_month?: number | null
          display_order?: number | null
          doc_upload_enabled?: boolean | null
          earnings_analytics?: boolean | null
          events_enabled?: boolean | null
          features_list?: Json | null
          google_calendar_full?: boolean | null
          google_calendar_readonly?: boolean | null
          google_meet_integration?: boolean | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          max_avatars?: number | null
          max_team_members?: number | null
          multi_currency_enabled?: boolean | null
          multilingual_ai?: boolean | null
          multiple_admins?: boolean | null
          multiple_avatars_per_profile?: boolean | null
          offer_badge?: string | null
          offer_expires_at?: string | null
          offer_text?: string | null
          paid_events_enabled?: boolean | null
          payments_enabled?: boolean | null
          physical_products_enabled?: boolean | null
          plan_key: string
          plan_name: string
          price_12_month_inr?: number | null
          price_12_month_usd?: number | null
          price_3_month_inr?: number | null
          price_3_month_usd?: number | null
          price_6_month_inr?: number | null
          price_6_month_usd?: number | null
          price_inr?: number
          price_usd?: number
          priority_ai_processing?: boolean | null
          promo_codes_enabled?: boolean | null
          qa_training_enabled?: boolean | null
          shopify_integration?: boolean | null
          subscription_button_enabled?: boolean | null
          tagline?: string | null
          team_enabled?: boolean | null
          training_storage_mb?: number | null
          unlimited_training_sources?: boolean | null
          updated_at?: string
          virtual_meetings_enabled?: boolean | null
          voice_clone_enabled?: boolean | null
          voice_minutes_monthly?: number | null
          web_training_enabled?: boolean | null
          zoom_integration?: boolean | null
        }
        Update: {
          advanced_analytics?: boolean | null
          ai_tokens_monthly?: number | null
          api_access?: boolean | null
          avatar_type?: string | null
          basic_analytics?: boolean | null
          billing_cycle?: string
          brand_collaborations?: boolean | null
          created_at?: string
          custom_voice_enabled?: boolean | null
          digital_products_enabled?: boolean | null
          discount_12_month?: number | null
          discount_3_month?: number | null
          discount_6_month?: number | null
          display_order?: number | null
          doc_upload_enabled?: boolean | null
          earnings_analytics?: boolean | null
          events_enabled?: boolean | null
          features_list?: Json | null
          google_calendar_full?: boolean | null
          google_calendar_readonly?: boolean | null
          google_meet_integration?: boolean | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          max_avatars?: number | null
          max_team_members?: number | null
          multi_currency_enabled?: boolean | null
          multilingual_ai?: boolean | null
          multiple_admins?: boolean | null
          multiple_avatars_per_profile?: boolean | null
          offer_badge?: string | null
          offer_expires_at?: string | null
          offer_text?: string | null
          paid_events_enabled?: boolean | null
          payments_enabled?: boolean | null
          physical_products_enabled?: boolean | null
          plan_key?: string
          plan_name?: string
          price_12_month_inr?: number | null
          price_12_month_usd?: number | null
          price_3_month_inr?: number | null
          price_3_month_usd?: number | null
          price_6_month_inr?: number | null
          price_6_month_usd?: number | null
          price_inr?: number
          price_usd?: number
          priority_ai_processing?: boolean | null
          promo_codes_enabled?: boolean | null
          qa_training_enabled?: boolean | null
          shopify_integration?: boolean | null
          subscription_button_enabled?: boolean | null
          tagline?: string | null
          team_enabled?: boolean | null
          training_storage_mb?: number | null
          unlimited_training_sources?: boolean | null
          updated_at?: string
          virtual_meetings_enabled?: boolean | null
          voice_clone_enabled?: boolean | null
          voice_minutes_monthly?: number | null
          web_training_enabled?: boolean | null
          zoom_integration?: boolean | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      post_link_clicks: {
        Row: {
          clicked_at: string
          id: string
          link_url: string | null
          post_id: string
          user_id: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          link_url?: string | null
          post_id: string
          user_id?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          link_url?: string | null
          post_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_link_clicks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_unlocks: {
        Row: {
          id: string
          payment_amount: number | null
          payment_currency: string | null
          post_id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          id?: string
          payment_amount?: number | null
          payment_currency?: string | null
          post_id: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          id?: string
          payment_amount?: number | null
          payment_currency?: string | null
          post_id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_unlocks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string
          currency: string | null
          id: string
          is_paid: boolean | null
          is_subscriber_only: boolean | null
          likes_count: number | null
          link_button_text: string | null
          link_button_url: string | null
          link_clicks: number | null
          link_thumbnail_url: string | null
          media_type: string | null
          media_url: string | null
          metadata: Json | null
          poll_options: Json | null
          poll_votes: Json | null
          post_type: string | null
          price: number | null
          subscription_plan_id: string | null
          title: string | null
          updated_at: string
          user_id: string
          views_count: number | null
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          is_paid?: boolean | null
          is_subscriber_only?: boolean | null
          likes_count?: number | null
          link_button_text?: string | null
          link_button_url?: string | null
          link_clicks?: number | null
          link_thumbnail_url?: string | null
          media_type?: string | null
          media_url?: string | null
          metadata?: Json | null
          poll_options?: Json | null
          poll_votes?: Json | null
          post_type?: string | null
          price?: number | null
          subscription_plan_id?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          views_count?: number | null
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          is_paid?: boolean | null
          is_subscriber_only?: boolean | null
          likes_count?: number | null
          link_button_text?: string | null
          link_button_url?: string | null
          link_clicks?: number | null
          link_thumbnail_url?: string | null
          media_type?: string | null
          media_url?: string | null
          metadata?: Json | null
          poll_options?: Json | null
          poll_votes?: Json | null
          post_type?: string | null
          price?: number | null
          subscription_plan_id?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          buyer_id: string
          created_at: string | null
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          order_id: string | null
          product_id: string
          rating: number
          review_photos: Json | null
          review_text: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id: string
          rating: number
          review_photos?: Json | null
          review_text?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string
          rating?: number
          review_photos?: Json | null
          review_text?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "seller_orders_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          average_rating: number | null
          base_currency: string | null
          brand: string | null
          cod_enabled: boolean | null
          compare_at_price: number | null
          created_at: string
          description: string | null
          digital_assets: Json | null
          download_limit: number | null
          free_for_subscribers: boolean | null
          id: string
          inventory_quantity: number | null
          is_free: boolean | null
          license_type: string | null
          low_stock_threshold: number | null
          media_type: string | null
          media_url: string | null
          price: number | null
          product_category: string | null
          product_type: string
          seo_description: string | null
          seo_title: string | null
          shipping_cost: number | null
          shipping_dimensions: Json | null
          shipping_enabled: boolean | null
          shipping_weight: number | null
          shopify_product_id: string | null
          shopify_sync_enabled: boolean | null
          sku: string | null
          slug: string | null
          status: string | null
          tags: string[] | null
          tax_class: string | null
          taxable: boolean | null
          thumbnail_url: string | null
          title: string
          total_reviews: number | null
          track_inventory: boolean | null
          updated_at: string
          user_id: string
          variants: Json | null
          variants_enabled: boolean | null
          views_count: number | null
        }
        Insert: {
          average_rating?: number | null
          base_currency?: string | null
          brand?: string | null
          cod_enabled?: boolean | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          digital_assets?: Json | null
          download_limit?: number | null
          free_for_subscribers?: boolean | null
          id?: string
          inventory_quantity?: number | null
          is_free?: boolean | null
          license_type?: string | null
          low_stock_threshold?: number | null
          media_type?: string | null
          media_url?: string | null
          price?: number | null
          product_category?: string | null
          product_type: string
          seo_description?: string | null
          seo_title?: string | null
          shipping_cost?: number | null
          shipping_dimensions?: Json | null
          shipping_enabled?: boolean | null
          shipping_weight?: number | null
          shopify_product_id?: string | null
          shopify_sync_enabled?: boolean | null
          sku?: string | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          tax_class?: string | null
          taxable?: boolean | null
          thumbnail_url?: string | null
          title: string
          total_reviews?: number | null
          track_inventory?: boolean | null
          updated_at?: string
          user_id: string
          variants?: Json | null
          variants_enabled?: boolean | null
          views_count?: number | null
        }
        Update: {
          average_rating?: number | null
          base_currency?: string | null
          brand?: string | null
          cod_enabled?: boolean | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          digital_assets?: Json | null
          download_limit?: number | null
          free_for_subscribers?: boolean | null
          id?: string
          inventory_quantity?: number | null
          is_free?: boolean | null
          license_type?: string | null
          low_stock_threshold?: number | null
          media_type?: string | null
          media_url?: string | null
          price?: number | null
          product_category?: string | null
          product_type?: string
          seo_description?: string | null
          seo_title?: string | null
          shipping_cost?: number | null
          shipping_dimensions?: Json | null
          shipping_enabled?: boolean | null
          shipping_weight?: number | null
          shopify_product_id?: string | null
          shopify_sync_enabled?: boolean | null
          sku?: string | null
          slug?: string | null
          status?: string | null
          tags?: string[] | null
          tax_class?: string | null
          taxable?: boolean | null
          thumbnail_url?: string | null
          title?: string
          total_reviews?: number | null
          track_inventory?: boolean | null
          updated_at?: string
          user_id?: string
          variants?: Json | null
          variants_enabled?: boolean | null
          views_count?: number | null
        }
        Relationships: []
      }
      profile_visitors: {
        Row: {
          id: string
          is_anonymous: boolean | null
          visit_count: number | null
          visited_at: string
          visited_profile_id: string
          visitor_id: string | null
        }
        Insert: {
          id?: string
          is_anonymous?: boolean | null
          visit_count?: number | null
          visited_at?: string
          visited_profile_id: string
          visitor_id?: string | null
        }
        Update: {
          id?: string
          is_anonymous?: boolean | null
          visit_count?: number | null
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
            foreignKeyName: "profile_visitors_visited_profile_id_fkey"
            columns: ["visited_profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_visitors_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_visitors_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          gender: string | null
          id: string
          monthly_token_quota: number | null
          profession: string | null
          profile_pic_url: string | null
          token_balance: number | null
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
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          gender?: string | null
          id: string
          monthly_token_quota?: number | null
          profession?: string | null
          profile_pic_url?: string | null
          token_balance?: number | null
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
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          gender?: string | null
          id?: string
          monthly_token_quota?: number | null
          profession?: string | null
          profile_pic_url?: string | null
          token_balance?: number | null
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
          custom_link_button_name: string | null
          custom_link_url: string | null
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
          custom_link_button_name?: string | null
          custom_link_url?: string | null
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
          custom_link_button_name?: string | null
          custom_link_url?: string | null
          id?: string
          question?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      refund_overrides: {
        Row: {
          approved_by: string | null
          created_at: string | null
          id: string
          initiated_by: string
          order_id: string | null
          original_amount: number
          override_reason: string
          processed_at: string | null
          razorpay_payment_id: string | null
          razorpay_refund_id: string | null
          refund_amount: number
          refund_reason: string | null
          status: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          id?: string
          initiated_by: string
          order_id?: string | null
          original_amount: number
          override_reason: string
          processed_at?: string | null
          razorpay_payment_id?: string | null
          razorpay_refund_id?: string | null
          refund_amount: number
          refund_reason?: string | null
          status?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          id?: string
          initiated_by?: string
          order_id?: string | null
          original_amount?: number
          override_reason?: string
          processed_at?: string | null
          razorpay_payment_id?: string | null
          razorpay_refund_id?: string | null
          refund_amount?: number
          refund_reason?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refund_overrides_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_overrides_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "seller_orders_safe"
            referencedColumns: ["id"]
          },
        ]
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
      sensitive_data_access_log: {
        Row: {
          access_type: string
          accessed_at: string
          data_type: string
          id: string
          ip_address: string | null
          record_id: string | null
          table_name: string
          user_id: string
        }
        Insert: {
          access_type: string
          accessed_at?: string
          data_type: string
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name: string
          user_id: string
        }
        Update: {
          access_type?: string
          accessed_at?: string
          data_type?: string
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      settlement_logs: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          fees: number | null
          id: string
          metadata: Json | null
          net_amount: number | null
          settlement_date: string | null
          settlement_id: string | null
          settlement_type: string | null
          status: string | null
          tax: number | null
          utr: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          fees?: number | null
          id?: string
          metadata?: Json | null
          net_amount?: number | null
          settlement_date?: string | null
          settlement_id?: string | null
          settlement_type?: string | null
          status?: string | null
          tax?: number | null
          utr?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          fees?: number | null
          id?: string
          metadata?: Json | null
          net_amount?: number | null
          settlement_date?: string | null
          settlement_id?: string | null
          settlement_type?: string | null
          status?: string | null
          tax?: number | null
          utr?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          setting_category: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_category: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_category?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
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
          {
            foreignKeyName: "social_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          active: boolean | null
          badge: Json | null
          benefits: Json | null
          billing_cycle: string
          created_at: string | null
          currency: string
          description: string | null
          id: string
          price_amount: number
          profile_id: string
          proration_policy: string | null
          require_follow: boolean | null
          title: string
          trial_days: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          badge?: Json | null
          benefits?: Json | null
          billing_cycle?: string
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          price_amount: number
          profile_id: string
          proration_policy?: string | null
          require_follow?: boolean | null
          title: string
          trial_days?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          badge?: Json | null
          benefits?: Json | null
          billing_cycle?: string
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          price_amount?: number
          profile_id?: string
          proration_policy?: string | null
          require_follow?: boolean | null
          title?: string
          trial_days?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_plans_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_plans_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string
          ends_at: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          next_billing_at: string | null
          plan_id: string | null
          price: number
          razorpay_payment_id: string | null
          razorpay_subscription_id: string | null
          starts_at: string | null
          status: string
          subscribed_to_id: string | null
          subscriber_id: string
          subscription_type: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string
          ends_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          next_billing_at?: string | null
          plan_id?: string | null
          price?: number
          razorpay_payment_id?: string | null
          razorpay_subscription_id?: string | null
          starts_at?: string | null
          status?: string
          subscribed_to_id?: string | null
          subscriber_id: string
          subscription_type?: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string
          ends_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          next_billing_at?: string | null
          plan_id?: string | null
          price?: number
          razorpay_payment_id?: string | null
          razorpay_subscription_id?: string | null
          starts_at?: string | null
          status?: string
          subscribed_to_id?: string | null
          subscriber_id?: string
          subscription_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_subscribed_to_id_fkey"
            columns: ["subscribed_to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_subscribed_to_id_fkey"
            columns: ["subscribed_to_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_configurations: {
        Row: {
          country_code: string
          country_name: string
          created_at: string | null
          effective_from: string | null
          effective_until: string | null
          id: string
          is_active: boolean | null
          is_inclusive: boolean | null
          tax_name: string
          tax_rate: number
          tax_type: string
          updated_at: string | null
        }
        Insert: {
          country_code: string
          country_name: string
          created_at?: string | null
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          is_active?: boolean | null
          is_inclusive?: boolean | null
          tax_name: string
          tax_rate: number
          tax_type: string
          updated_at?: string | null
        }
        Update: {
          country_code?: string
          country_name?: string
          created_at?: string | null
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          is_active?: boolean | null
          is_inclusive?: boolean | null
          tax_name?: string
          tax_rate?: number
          tax_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      token_configuration: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      token_events: {
        Row: {
          balance_after: number
          change: number
          created_at: string | null
          id: string
          input_tokens: number | null
          message_id: string | null
          metadata: Json | null
          model: string | null
          output_tokens: number | null
          reason: string
          user_id: string
        }
        Insert: {
          balance_after: number
          change: number
          created_at?: string | null
          id?: string
          input_tokens?: number | null
          message_id?: string | null
          metadata?: Json | null
          model?: string | null
          output_tokens?: number | null
          reason: string
          user_id: string
        }
        Update: {
          balance_after?: number
          change?: number
          created_at?: string | null
          id?: string
          input_tokens?: number | null
          message_id?: string | null
          metadata?: Json | null
          model?: string | null
          output_tokens?: number | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      token_gifts: {
        Row: {
          amount: number
          amount_paid: number
          completed_at: string | null
          created_at: string
          currency: string
          id: string
          message: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          receiver_id: string
          sender_id: string
          status: string
        }
        Insert: {
          amount: number
          amount_paid: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          message?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          receiver_id: string
          sender_id: string
          status?: string
        }
        Update: {
          amount?: number
          amount_paid?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          message?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          receiver_id?: string
          sender_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_gifts_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_gifts_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_gifts_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_gifts_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      token_packages: {
        Row: {
          bonus_tokens: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          price_inr: number
          price_usd: number | null
          tokens: number
        }
        Insert: {
          bonus_tokens?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          price_inr: number
          price_usd?: number | null
          tokens: number
        }
        Update: {
          bonus_tokens?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          price_inr?: number
          price_usd?: number | null
          tokens?: number
        }
        Relationships: []
      }
      token_purchases: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          package_id: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string | null
          tokens_purchased: number
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          package_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string | null
          tokens_purchased: number
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          package_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string | null
          tokens_purchased?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "token_purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "token_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          metadata: Json | null
          profile_id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          refund_id: string | null
          status: string
          subscriber_id: string
          subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency: string
          id?: string
          metadata?: Json | null
          profile_id: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          refund_id?: string | null
          status?: string
          subscriber_id: string
          subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          metadata?: Json | null
          profile_id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          refund_id?: string | null
          status?: string
          subscriber_id?: string
          subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
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
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_chat_settings: {
        Row: {
          ai_responses_enabled: boolean | null
          allow_direct_chat: boolean | null
          created_at: string | null
          direct_chat_free: boolean | null
          enable_daily_limit: boolean | null
          enable_gift_popup: boolean | null
          enable_rich_responses: boolean | null
          enable_voice_responses: boolean | null
          free_messages_per_day: number | null
          gift_popup_after_messages: number | null
          gift_popup_message: string | null
          id: string
          max_message_length: number | null
          pause_ai_until: string | null
          show_gift_button: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_responses_enabled?: boolean | null
          allow_direct_chat?: boolean | null
          created_at?: string | null
          direct_chat_free?: boolean | null
          enable_daily_limit?: boolean | null
          enable_gift_popup?: boolean | null
          enable_rich_responses?: boolean | null
          enable_voice_responses?: boolean | null
          free_messages_per_day?: number | null
          gift_popup_after_messages?: number | null
          gift_popup_message?: string | null
          id?: string
          max_message_length?: number | null
          pause_ai_until?: string | null
          show_gift_button?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_responses_enabled?: boolean | null
          allow_direct_chat?: boolean | null
          created_at?: string | null
          direct_chat_free?: boolean | null
          enable_daily_limit?: boolean | null
          enable_gift_popup?: boolean | null
          enable_rich_responses?: boolean | null
          enable_voice_responses?: boolean | null
          free_messages_per_day?: number | null
          gift_popup_after_messages?: number | null
          gift_popup_message?: string | null
          id?: string
          max_message_length?: number | null
          pause_ai_until?: string | null
          show_gift_button?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_platform_subscriptions: {
        Row: {
          auto_renew: boolean | null
          billing_cycle_months: number | null
          created_at: string
          currency: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          plan_id: string | null
          plan_key: string
          price_paid: number | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          razorpay_subscription_id: string | null
          starts_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          billing_cycle_months?: number | null
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          plan_key?: string
          price_paid?: number | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          razorpay_subscription_id?: string | null
          starts_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          billing_cycle_months?: number | null
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          plan_key?: string
          price_paid?: number | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          razorpay_subscription_id?: string | null
          starts_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_platform_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "platform_pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string | null
          engagement_score: number | null
          first_visit_at: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          is_new_user: boolean | null
          profile_views: number | null
          total_chats_received: number | null
          total_chats_sent: number | null
          total_conversations: number | null
          total_products_sold: number | null
          total_revenue: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          engagement_score?: number | null
          first_visit_at?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_new_user?: boolean | null
          profile_views?: number | null
          total_chats_received?: number | null
          total_chats_sent?: number | null
          total_conversations?: number | null
          total_products_sold?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          engagement_score?: number | null
          first_visit_at?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_new_user?: boolean | null
          profile_views?: number | null
          total_chats_received?: number | null
          total_chats_sent?: number | null
          total_conversations?: number | null
          total_products_sold?: number | null
          total_revenue?: number | null
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
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      virtual_bookings: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          amount: number
          booking_form_data: Json | null
          booking_status: string
          buyer_id: string
          calendar_event_id: string | null
          created_at: string
          currency: string
          discount_amount: number | null
          id: string
          join_url: string | null
          meeting_id: string | null
          meeting_provider: string | null
          password: string | null
          payment_status: string
          platform_fee: number | null
          promo_code_id: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          seller_earnings: number | null
          seller_id: string
          slot_id: string | null
          tax_amount: number | null
          total_amount: number
          updated_at: string
          virtual_product_id: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          amount?: number
          booking_form_data?: Json | null
          booking_status?: string
          buyer_id: string
          calendar_event_id?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number | null
          id?: string
          join_url?: string | null
          meeting_id?: string | null
          meeting_provider?: string | null
          password?: string | null
          payment_status?: string
          platform_fee?: number | null
          promo_code_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          seller_earnings?: number | null
          seller_id: string
          slot_id?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          virtual_product_id: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          amount?: number
          booking_form_data?: Json | null
          booking_status?: string
          buyer_id?: string
          calendar_event_id?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number | null
          id?: string
          join_url?: string | null
          meeting_id?: string | null
          meeting_provider?: string | null
          password?: string | null
          payment_status?: string
          platform_fee?: number | null
          promo_code_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          seller_earnings?: number | null
          seller_id?: string
          slot_id?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          virtual_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "virtual_bookings_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "virtual_product_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "virtual_bookings_virtual_product_id_fkey"
            columns: ["virtual_product_id"]
            isOneToOne: false
            referencedRelation: "virtual_products"
            referencedColumns: ["id"]
          },
        ]
      }
      virtual_product_slots: {
        Row: {
          booked_count: number
          capacity: number
          created_at: string
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
          updated_at: string
          virtual_product_id: string
        }
        Insert: {
          booked_count?: number
          capacity?: number
          created_at?: string
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
          updated_at?: string
          virtual_product_id: string
        }
        Update: {
          booked_count?: number
          capacity?: number
          created_at?: string
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
          updated_at?: string
          virtual_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "virtual_product_slots_virtual_product_id_fkey"
            columns: ["virtual_product_id"]
            isOneToOne: false
            referencedRelation: "virtual_products"
            referencedColumns: ["id"]
          },
        ]
      }
      virtual_products: {
        Row: {
          auto_generate_meeting_link: boolean | null
          booking_form_fields: Json | null
          buffer_time_mins: number | null
          capacity: number
          created_at: string
          currency: string
          description: string | null
          duration_mins: number
          id: string
          join_link_visibility: string | null
          max_bookings_per_user: number | null
          meeting_provider: string
          min_booking_notice_hours: number | null
          notify_host_on_booking: boolean | null
          price: number
          price_model: string
          product_type: string
          promo_codes_enabled: boolean | null
          recording_allowed: boolean | null
          refund_policy: string | null
          reminder_1h: boolean | null
          reminder_24h: boolean | null
          require_marketing_consent: boolean | null
          require_recording_consent: boolean | null
          require_terms_consent: boolean | null
          scheduling_mode: string
          send_calendar_invite: boolean | null
          status: string
          tagline: string | null
          tax_inclusive: boolean | null
          tax_rate: number | null
          thumbnail_url: string | null
          timezone: string
          title: string
          updated_at: string
          user_id: string
          visibility: string
          waitlist_enabled: boolean | null
          waitlist_limit: number | null
        }
        Insert: {
          auto_generate_meeting_link?: boolean | null
          booking_form_fields?: Json | null
          buffer_time_mins?: number | null
          capacity?: number
          created_at?: string
          currency?: string
          description?: string | null
          duration_mins?: number
          id?: string
          join_link_visibility?: string | null
          max_bookings_per_user?: number | null
          meeting_provider?: string
          min_booking_notice_hours?: number | null
          notify_host_on_booking?: boolean | null
          price?: number
          price_model?: string
          product_type?: string
          promo_codes_enabled?: boolean | null
          recording_allowed?: boolean | null
          refund_policy?: string | null
          reminder_1h?: boolean | null
          reminder_24h?: boolean | null
          require_marketing_consent?: boolean | null
          require_recording_consent?: boolean | null
          require_terms_consent?: boolean | null
          scheduling_mode?: string
          send_calendar_invite?: boolean | null
          status?: string
          tagline?: string | null
          tax_inclusive?: boolean | null
          tax_rate?: number | null
          thumbnail_url?: string | null
          timezone?: string
          title: string
          updated_at?: string
          user_id: string
          visibility?: string
          waitlist_enabled?: boolean | null
          waitlist_limit?: number | null
        }
        Update: {
          auto_generate_meeting_link?: boolean | null
          booking_form_fields?: Json | null
          buffer_time_mins?: number | null
          capacity?: number
          created_at?: string
          currency?: string
          description?: string | null
          duration_mins?: number
          id?: string
          join_link_visibility?: string | null
          max_bookings_per_user?: number | null
          meeting_provider?: string
          min_booking_notice_hours?: number | null
          notify_host_on_booking?: boolean | null
          price?: number
          price_model?: string
          product_type?: string
          promo_codes_enabled?: boolean | null
          recording_allowed?: boolean | null
          refund_policy?: string | null
          reminder_1h?: boolean | null
          reminder_24h?: boolean | null
          require_marketing_consent?: boolean | null
          require_recording_consent?: boolean | null
          require_terms_consent?: boolean | null
          scheduling_mode?: string
          send_calendar_invite?: boolean | null
          status?: string
          tagline?: string | null
          tax_inclusive?: boolean | null
          tax_rate?: number | null
          thumbnail_url?: string | null
          timezone?: string
          title?: string
          updated_at?: string
          user_id?: string
          visibility?: string
          waitlist_enabled?: boolean | null
          waitlist_limit?: number | null
        }
        Relationships: []
      }
      visitor_chat_usage: {
        Row: {
          created_at: string | null
          gift_popup_shown: boolean | null
          gift_popup_shown_at: string | null
          id: string
          last_message_at: string | null
          message_count: number | null
          profile_id: string
          session_id: string | null
          usage_date: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string | null
          gift_popup_shown?: boolean | null
          gift_popup_shown_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          profile_id: string
          session_id?: string | null
          usage_date?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string | null
          gift_popup_shown?: boolean | null
          gift_popup_shown_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          profile_id?: string
          session_id?: string | null
          usage_date?: string | null
          visitor_id?: string | null
        }
        Relationships: []
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
      web_training_data: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          scraped_content: string | null
          scraping_status: string | null
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          scraped_content?: string | null
          scraping_status?: string | null
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          scraped_content?: string | null
          scraping_status?: string | null
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          integration_name: string
          max_retries: number | null
          next_retry_at: string | null
          payload: Json | null
          processed_at: string | null
          response_body: string | null
          response_status: number | null
          retry_count: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          integration_name: string
          max_retries?: number | null
          next_retry_at?: string | null
          payload?: Json | null
          processed_at?: string | null
          response_body?: string | null
          response_status?: number | null
          retry_count?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          integration_name?: string
          max_retries?: number | null
          next_retry_at?: string | null
          payload?: Json | null
          processed_at?: string | null
          response_body?: string | null
          response_status?: number | null
          retry_count?: number | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_chat_settings: {
        Row: {
          ai_responses_enabled: boolean | null
          allow_direct_chat: boolean | null
          direct_chat_free: boolean | null
          enable_daily_limit: boolean | null
          enable_gift_popup: boolean | null
          enable_rich_responses: boolean | null
          enable_voice_responses: boolean | null
          free_messages_per_day: number | null
          gift_popup_after_messages: number | null
          max_message_length: number | null
          show_gift_button: boolean | null
          user_id: string | null
        }
        Insert: {
          ai_responses_enabled?: boolean | null
          allow_direct_chat?: boolean | null
          direct_chat_free?: boolean | null
          enable_daily_limit?: boolean | null
          enable_gift_popup?: boolean | null
          enable_rich_responses?: boolean | null
          enable_voice_responses?: boolean | null
          free_messages_per_day?: number | null
          gift_popup_after_messages?: number | null
          max_message_length?: number | null
          show_gift_button?: boolean | null
          user_id?: string | null
        }
        Update: {
          ai_responses_enabled?: boolean | null
          allow_direct_chat?: boolean | null
          direct_chat_free?: boolean | null
          enable_daily_limit?: boolean | null
          enable_gift_popup?: boolean | null
          enable_rich_responses?: boolean | null
          enable_voice_responses?: boolean | null
          free_messages_per_day?: number | null
          gift_popup_after_messages?: number | null
          max_message_length?: number | null
          show_gift_button?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          followers_count: number | null
          following_count: number | null
          id: string | null
          profession: string | null
          profile_pic_url: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string | null
          profession?: string | null
          profile_pic_url?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string | null
          profession?: string | null
          profile_pic_url?: string | null
          username?: string | null
        }
        Relationships: []
      }
      safe_chat_memory: {
        Row: {
          created_at: string | null
          engagement_score: number | null
          first_visit_at: string | null
          id: string | null
          last_topics: Json | null
          last_visit_at: string | null
          preferences: Json | null
          profile_id: string | null
          session_count: number | null
          total_messages: number | null
          updated_at: string | null
          visitor_email: string | null
          visitor_id: string | null
          visitor_name: string | null
          welcome_shown: boolean | null
        }
        Insert: {
          created_at?: string | null
          engagement_score?: number | null
          first_visit_at?: string | null
          id?: string | null
          last_topics?: Json | null
          last_visit_at?: string | null
          preferences?: Json | null
          profile_id?: string | null
          session_count?: number | null
          total_messages?: number | null
          updated_at?: string | null
          visitor_email?: never
          visitor_id?: string | null
          visitor_name?: never
          welcome_shown?: boolean | null
        }
        Update: {
          created_at?: string | null
          engagement_score?: number | null
          first_visit_at?: string | null
          id?: string | null
          last_topics?: Json | null
          last_visit_at?: string | null
          preferences?: Json | null
          profile_id?: string | null
          session_count?: number | null
          total_messages?: number | null
          updated_at?: string | null
          visitor_email?: never
          visitor_id?: string | null
          visitor_name?: never
          welcome_shown?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_memory_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_memory_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_orders_safe: {
        Row: {
          amount: number | null
          buyer_id: string | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          discount_amount: number | null
          fulfillment_status: string | null
          id: string | null
          order_notes: string | null
          order_status: string | null
          payment_method: string | null
          payment_status: string | null
          platform_fee: number | null
          product_id: string | null
          quantity: number | null
          seller_earnings: number | null
          seller_id: string | null
          shipping_address: Json | null
          shipping_amount: number | null
          shipping_method: string | null
          tax_amount: number | null
          total_amount: number | null
          tracking_number: string | null
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          amount?: number | null
          buyer_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          discount_amount?: number | null
          fulfillment_status?: string | null
          id?: string | null
          order_notes?: string | null
          order_status?: string | null
          payment_method?: string | null
          payment_status?: string | null
          platform_fee?: number | null
          product_id?: string | null
          quantity?: number | null
          seller_earnings?: number | null
          seller_id?: string | null
          shipping_address?: never
          shipping_amount?: number | null
          shipping_method?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          tracking_number?: string | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          amount?: number | null
          buyer_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          discount_amount?: number | null
          fulfillment_status?: string | null
          id?: string | null
          order_notes?: string | null
          order_status?: string | null
          payment_method?: string | null
          payment_status?: string | null
          platform_fee?: number | null
          product_id?: string | null
          quantity?: number | null
          seller_earnings?: number | null
          seller_id?: string | null
          shipping_address?: never
          shipping_amount?: number | null
          shipping_method?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          tracking_number?: string | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_user_engagement_score: {
        Args: { p_user_id: string }
        Returns: number
      }
      credit_user_tokens: {
        Args: { p_reason: string; p_tokens: number; p_user_id: string }
        Returns: Json
      }
      debit_user_tokens: {
        Args: {
          p_input_tokens?: number
          p_message_id?: string
          p_model?: string
          p_output_tokens?: number
          p_reason: string
          p_tokens: number
          p_user_id: string
        }
        Returns: Json
      }
      decrement_product_inventory: {
        Args: { p_product_id: string; p_quantity: number; p_variant_id: string }
        Returns: boolean
      }
      get_product_rating: {
        Args: { p_product_id: string }
        Returns: {
          average_rating: number
          rating_distribution: Json
          total_reviews: number
        }[]
      }
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_post_link_clicks: {
        Args: { post_id_param: string }
        Returns: undefined
      }
      is_own_profile: { Args: { profile_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      log_admin_action: {
        Args: {
          p_action_type: string
          p_new_value?: Json
          p_old_value?: Json
          p_target_id?: string
          p_target_table?: string
        }
        Returns: string
      }
      mask_shipping_address: { Args: { address: Json }; Returns: Json }
      process_token_gift: {
        Args: {
          p_gift_id: string
          p_razorpay_payment_id: string
          p_razorpay_signature: string
        }
        Returns: Json
      }
      transfer_tokens: {
        Args: {
          p_amount: number
          p_message?: string
          p_receiver_id: string
          p_sender_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "super_admin"
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
    Enums: {
      app_role: ["admin", "moderator", "user", "super_admin"],
    },
  },
} as const
