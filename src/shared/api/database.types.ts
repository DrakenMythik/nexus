export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      adherence_events: {
        Row: {
          created_at: string
          event_date: string
          id: string
          notes: string | null
          smart_rest_commitment: string | null
          source: string
          status: Database["public"]["Enums"]["daily_status"]
          updated_at: string
          user_id: string
          workout_log_id: string | null
        }
        Insert: {
          created_at?: string
          event_date: string
          id?: string
          notes?: string | null
          smart_rest_commitment?: string | null
          source?: string
          status?: Database["public"]["Enums"]["daily_status"]
          updated_at?: string
          user_id: string
          workout_log_id?: string | null
        }
        Update: {
          created_at?: string
          event_date?: string
          id?: string
          notes?: string | null
          smart_rest_commitment?: string | null
          source?: string
          status?: Database["public"]["Enums"]["daily_status"]
          updated_at?: string
          user_id?: string
          workout_log_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adherence_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adherence_events_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_biometrics: {
        Row: {
          body_weight: number | null
          calories: number | null
          id: string
          log_date: string
          protein_g: number | null
          readiness_score: number | null
          sleep_hours: number | null
          status: Database["public"]["Enums"]["daily_status"] | null
          steps: number | null
          streak_count: number | null
          user_id: string
        }
        Insert: {
          body_weight?: number | null
          calories?: number | null
          id?: string
          log_date: string
          protein_g?: number | null
          readiness_score?: number | null
          sleep_hours?: number | null
          status?: Database["public"]["Enums"]["daily_status"] | null
          steps?: number | null
          streak_count?: number | null
          user_id: string
        }
        Update: {
          body_weight?: number | null
          calories?: number | null
          id?: string
          log_date?: string
          protein_g?: number | null
          readiness_score?: number | null
          sleep_hours?: number | null
          status?: Database["public"]["Enums"]["daily_status"] | null
          steps?: number | null
          streak_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_biometrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          id: string
          instructions: string | null
          muscle_group: string
          name: string
        }
        Insert: {
          id?: string
          instructions?: string | null
          muscle_group: string
          name: string
        }
        Update: {
          id?: string
          instructions?: string | null
          muscle_group?: string
          name?: string
        }
        Relationships: []
      }
      exercise_progressions: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          increment_weight: number
          last_completed_at: string | null
          target_weight: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          increment_weight?: number
          last_completed_at?: string | null
          target_weight: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          increment_weight?: number
          last_completed_at?: string | null
          target_weight?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_progressions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_progressions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_nudges: {
        Row: {
          category: Database["public"]["Enums"]["nudge_category"]
          content: string
          id: string
          source_citation: string | null
          title: string
        }
        Insert: {
          category: Database["public"]["Enums"]["nudge_category"]
          content: string
          id?: string
          source_citation?: string | null
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["nudge_category"]
          content?: string
          id?: string
          source_citation?: string | null
          title?: string
        }
        Relationships: []
      }
      offline_mutations: {
        Row: {
          client_mutation_id: string
          created_at: string
          error_message: string | null
          id: string
          mutation_type: string
          payload: Json
          status: string
          synced_at: string | null
          user_id: string
        }
        Insert: {
          client_mutation_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          mutation_type: string
          payload?: Json
          status?: string
          synced_at?: string | null
          user_id: string
        }
        Update: {
          client_mutation_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          mutation_type?: string
          payload?: Json
          status?: string
          synced_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offline_mutations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          days_per_week: number
          description: string | null
          id: string
          level: Database["public"]["Enums"]["program_level"] | null
          name: string
          specialty: Database["public"]["Enums"]["program_specialty"] | null
          weeks_duration: number
        }
        Insert: {
          days_per_week: number
          description?: string | null
          id?: string
          level?: Database["public"]["Enums"]["program_level"] | null
          name: string
          specialty?: Database["public"]["Enums"]["program_specialty"] | null
          weeks_duration: number
        }
        Update: {
          days_per_week?: number
          description?: string | null
          id?: string
          level?: Database["public"]["Enums"]["program_level"] | null
          name?: string
          specialty?: Database["public"]["Enums"]["program_specialty"] | null
          weeks_duration?: number
        }
        Relationships: []
      }
      set_logs: {
        Row: {
          client_mutation_id: string | null
          exercise_id: string
          id: string
          reps_completed: number
          rpe: number | null
          set_number: number
          weight: number
          workout_log_id: string
        }
        Insert: {
          client_mutation_id?: string | null
          exercise_id: string
          id?: string
          reps_completed: number
          rpe?: number | null
          set_number: number
          weight: number
          workout_log_id: string
        }
        Update: {
          client_mutation_id?: string | null
          exercise_id?: string
          id?: string
          reps_completed?: number
          rpe?: number | null
          set_number?: number
          weight?: number
          workout_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "set_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "set_logs_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_nudge_history: {
        Row: {
          id: string
          nudge_id: string | null
          seen_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          nudge_id?: string | null
          seen_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          nudge_id?: string | null
          seen_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_nudge_history_nudge_id_fkey"
            columns: ["nudge_id"]
            isOneToOne: false
            referencedRelation: "knowledge_nudges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_nudge_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_program_enrollments: {
        Row: {
          active: boolean
          created_at: string
          current_day_number: number
          current_week_number: number
          id: string
          program_id: string
          pushed_until: string | null
          started_on: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          current_day_number?: number
          current_week_number?: number
          id?: string
          program_id: string
          pushed_until?: string | null
          started_on?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          current_day_number?: number
          current_week_number?: number
          id?: string
          program_id?: string
          pushed_until?: string | null
          started_on?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_program_enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_program_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          birthdate: string | null
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          sex: Database["public"]["Enums"]["user_sex"] | null
        }
        Insert: {
          birthdate?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id: string
          sex?: Database["public"]["Enums"]["user_sex"] | null
        }
        Update: {
          birthdate?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          sex?: Database["public"]["Enums"]["user_sex"] | null
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          block_type: Database["public"]["Enums"]["block_type"]
          exercise_id: string
          id: string
          order_index: number
          rest_seconds: number | null
          superset_group: string | null
          target_reps_max: number | null
          target_reps_min: number | null
          target_sets: number
          target_time_seconds: number | null
          tempo: string | null
          workout_id: string
        }
        Insert: {
          block_type: Database["public"]["Enums"]["block_type"]
          exercise_id: string
          id?: string
          order_index: number
          rest_seconds?: number | null
          superset_group?: string | null
          target_reps_max?: number | null
          target_reps_min?: number | null
          target_sets: number
          target_time_seconds?: number | null
          tempo?: string | null
          workout_id: string
        }
        Update: {
          block_type?: Database["public"]["Enums"]["block_type"]
          exercise_id?: string
          id?: string
          order_index?: number
          rest_seconds?: number | null
          superset_group?: string | null
          target_reps_max?: number | null
          target_reps_min?: number | null
          target_sets?: number
          target_time_seconds?: number | null
          tempo?: string | null
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          client_mutation_id: string | null
          completed_at: string | null
          ended_at: string | null
          id: string
          started_at: string
          status: string
          user_id: string
          workout_id: string | null
        }
        Insert: {
          client_mutation_id?: string | null
          completed_at?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: string
          user_id: string
          workout_id?: string | null
        }
        Update: {
          client_mutation_id?: string | null
          completed_at?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: string
          user_id?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          day_number: number
          description: string | null
          id: string
          name: string
          program_id: string
          week_number: number
        }
        Insert: {
          day_number: number
          description?: string | null
          id?: string
          name: string
          program_id: string
          week_number: number
        }
        Update: {
          day_number?: number
          description?: string | null
          id?: string
          name?: string
          program_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "workouts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
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
      block_type: "Warmup" | "Main" | "Cooldown"
      daily_status:
        | "trained"
        | "programmed_rest"
        | "smart_rest"
        | "missed"
        | "pending"
      nudge_category:
        | "Hypertrophy"
        | "Strength"
        | "Weight Loss"
        | "Sleep"
        | "Recovery"
        | "Nutrition"
        | "Biomechanics"
      program_level: "Beginner" | "Intermediate" | "Advanced"
      program_specialty: "Hypertrophy" | "Strength" | "Weight Loss"
      user_sex: "Male" | "Female" | "Other" | "Prefer Not to Say"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      block_type: ["Warmup", "Main", "Cooldown"],
      daily_status: [
        "trained",
        "programmed_rest",
        "smart_rest",
        "missed",
        "pending",
      ],
      nudge_category: [
        "Hypertrophy",
        "Strength",
        "Weight Loss",
        "Sleep",
        "Recovery",
        "Nutrition",
        "Biomechanics",
      ],
      program_level: ["Beginner", "Intermediate", "Advanced"],
      program_specialty: ["Hypertrophy", "Strength", "Weight Loss"],
      user_sex: ["Male", "Female", "Other", "Prefer Not to Say"],
    },
  },
} as const

