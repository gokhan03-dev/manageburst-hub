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
      calendar_events: {
        Row: {
          attendees: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string
          id: string
          is_online: boolean | null
          location: string | null
          microsoft_event_id: string | null
          start_time: string
          task_id: string | null
          title: string
          updated_at: string | null
          zoom_join_url: string | null
          zoom_meeting_id: string | null
        }
        Insert: {
          attendees?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time: string
          id?: string
          is_online?: boolean | null
          location?: string | null
          microsoft_event_id?: string | null
          start_time: string
          task_id?: string | null
          title: string
          updated_at?: string | null
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
        }
        Update: {
          attendees?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string
          id?: string
          is_online?: boolean | null
          location?: string | null
          microsoft_event_id?: string | null
          start_time?: string
          task_id?: string | null
          title?: string
          updated_at?: string | null
          zoom_join_url?: string | null
          zoom_meeting_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      integration_settings: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          integration_type: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string | null
          id?: string
          integration_type: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      list_members: {
        Row: {
          created_at: string | null
          id: string
          list_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          list_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          list_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "list_members_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
        ]
      }
      lists: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_shared: boolean | null
          name: string
          owner_id: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_shared?: boolean | null
          name: string
          owner_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_shared?: boolean | null
          name?: string
          owner_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          in_app_notifications: boolean | null
          push_notifications: boolean | null
          reminder_default_times: Json | null
          sound_enabled: boolean | null
          updated_at: string | null
          user_id: string
          vibration_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          in_app_notifications?: boolean | null
          push_notifications?: boolean | null
          reminder_default_times?: Json | null
          sound_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          vibration_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          in_app_notifications?: boolean | null
          push_notifications?: boolean | null
          reminder_default_times?: Json | null
          sound_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          vibration_enabled?: boolean | null
        }
        Relationships: []
      }
      scheduled_tasks: {
        Row: {
          created_at: string | null
          id: string
          integration_config: Json | null
          integration_type: string | null
          is_active: boolean | null
          schedule: string
          task_details: Json
          task_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          integration_config?: Json | null
          integration_type?: string | null
          is_active?: boolean | null
          schedule: string
          task_details: Json
          task_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          integration_config?: Json | null
          integration_type?: string | null
          is_active?: boolean | null
          schedule?: string
          task_details?: Json
          task_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      task_collaborators: {
        Row: {
          created_at: string | null
          id: string
          role: string
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_collaborators_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          created_at: string | null
          dependency_task_id: string
          dependent_task_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          dependency_task_id: string
          dependent_task_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          dependency_task_id?: string
          dependent_task_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_dependency_task_id_fkey"
            columns: ["dependency_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_dependent_task_id_fkey"
            columns: ["dependent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_relationships: {
        Row: {
          created_at: string | null
          from_task_id: string
          id: string
          relationship_type: string
          to_task_id: string
        }
        Insert: {
          created_at?: string | null
          from_task_id: string
          id?: string
          relationship_type: string
          to_task_id: string
        }
        Update: {
          created_at?: string | null
          from_task_id?: string
          id?: string
          relationship_type?: string
          to_task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_relationships_from_task_id_fkey"
            columns: ["from_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_relationships_to_task_id_fkey"
            columns: ["to_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_reminders: {
        Row: {
          created_at: string | null
          id: string
          is_sent: boolean | null
          reminder_time: string
          reminder_type: string
          task_id: string
          time_before_due: unknown | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          reminder_time: string
          reminder_type: string
          task_id: string
          time_before_due?: unknown | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          reminder_time?: string
          reminder_type?: string
          task_id?: string
          time_before_due?: unknown | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_reminders_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          category_ids: string[] | null
          created_at: string | null
          description: string | null
          id: string
          is_preset: boolean
          name: string
          priority: string
          tags: string[] | null
          task_type: string
          template_data: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_ids?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_preset?: boolean
          name: string
          priority?: string
          tags?: string[] | null
          task_type?: string
          template_data?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_ids?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_preset?: boolean
          name?: string
          priority?: string
          tags?: string[] | null
          task_type?: string
          template_data?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category_ids: string[] | null
          created_at: string | null
          description: string | null
          due_date: string | null
          goal_deadline: string | null
          goal_target: string | null
          habit_frequency: string | null
          habit_streak: number | null
          id: string
          is_completed: boolean | null
          parent_id: string | null
          priority: string
          progress: number | null
          status: string
          tags: string[] | null
          task_type: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_ids?: string[] | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          goal_deadline?: string | null
          goal_target?: string | null
          habit_frequency?: string | null
          habit_streak?: number | null
          id?: string
          is_completed?: boolean | null
          parent_id?: string | null
          priority?: string
          progress?: number | null
          status?: string
          tags?: string[] | null
          task_type?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_ids?: string[] | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          goal_deadline?: string | null
          goal_target?: string | null
          habit_frequency?: string | null
          habit_streak?: number | null
          id?: string
          is_completed?: boolean | null
          parent_id?: string | null
          priority?: string
          progress?: number | null
          status?: string
          tags?: string[] | null
          task_type?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          microsoft_refresh_token: string | null
          notification_settings: Json | null
          theme_preference: string | null
          timezone: string | null
          updated_at: string | null
          zoom_credentials: Json | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          microsoft_refresh_token?: string | null
          notification_settings?: Json | null
          theme_preference?: string | null
          timezone?: string | null
          updated_at?: string | null
          zoom_credentials?: Json | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          microsoft_refresh_token?: string | null
          notification_settings?: Json | null
          theme_preference?: string | null
          timezone?: string | null
          updated_at?: string | null
          zoom_credentials?: Json | null
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
      [_ in never]: never
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
