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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      devices: {
        Row: {
          hardware_device_id: string
          id: string
          is_active: boolean
          paired_at: string
          serial_number: string | null
          user_id: string
        }
        Insert: {
          hardware_device_id: string
          id?: string
          is_active?: boolean
          paired_at?: string
          serial_number?: string | null
          user_id: string
        }
        Update: {
          hardware_device_id?: string
          id?: string
          is_active?: boolean
          paired_at?: string
          serial_number?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          message: string
          sent_at: string
          sent_by: string
          sent_to_count: number
          title: string
          url: string | null
        }
        Insert: {
          id?: string
          message: string
          sent_at?: string
          sent_by: string
          sent_to_count?: number
          title: string
          url?: string | null
        }
        Update: {
          id?: string
          message?: string
          sent_at?: string
          sent_by?: string
          sent_to_count?: number
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      product_submissions: {
        Row: {
          barcode: string | null
          brand: string | null
          carbs_per_100g: number
          created_at: string
          fat_per_100g: number
          fiber_per_100g: number
          id: string
          image_url: string | null
          kcal_per_100g: number
          name: string
          protein_per_100g: number
          reviewed_by: string | null
          salt_per_100g: number
          status: string
          user_id: string
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          carbs_per_100g?: number
          created_at?: string
          fat_per_100g?: number
          fiber_per_100g?: number
          id?: string
          image_url?: string | null
          kcal_per_100g?: number
          name: string
          protein_per_100g?: number
          reviewed_by?: string | null
          salt_per_100g?: number
          status?: string
          user_id: string
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          carbs_per_100g?: number
          created_at?: string
          fat_per_100g?: number
          fiber_per_100g?: number
          id?: string
          image_url?: string | null
          kcal_per_100g?: number
          name?: string
          protein_per_100g?: number
          reviewed_by?: string | null
          salt_per_100g?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          brand: string | null
          carbs_per_100g: number
          created_at: string
          fat_per_100g: number
          fiber_per_100g: number
          id: string
          image_url: string | null
          kcal_per_100g: number
          name: string
          protein_per_100g: number
          salt_per_100g: number
          source: string
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          carbs_per_100g?: number
          created_at?: string
          fat_per_100g?: number
          fiber_per_100g?: number
          id?: string
          image_url?: string | null
          kcal_per_100g?: number
          name: string
          protein_per_100g?: number
          salt_per_100g?: number
          source?: string
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          carbs_per_100g?: number
          created_at?: string
          fat_per_100g?: number
          fiber_per_100g?: number
          id?: string
          image_url?: string | null
          kcal_per_100g?: number
          name?: string
          protein_per_100g?: number
          salt_per_100g?: number
          source?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          avatar_url: string | null
          created_at: string
          current_weight: number | null
          date_of_birth: string | null
          first_name: string | null
          height: number | null
          id: string
          last_name: string | null
          onboarding_completed: boolean
          sex: string | null
          target_carbs: number | null
          target_fat: number | null
          target_kcal: number | null
          target_protein: number | null
          target_weight: number | null
          theme: string
          updated_at: string
          water_goal_ml: number
        }
        Insert: {
          activity_level?: string | null
          avatar_url?: string | null
          created_at?: string
          current_weight?: number | null
          date_of_birth?: string | null
          first_name?: string | null
          height?: number | null
          id: string
          last_name?: string | null
          onboarding_completed?: boolean
          sex?: string | null
          target_carbs?: number | null
          target_fat?: number | null
          target_kcal?: number | null
          target_protein?: number | null
          target_weight?: number | null
          theme?: string
          updated_at?: string
          water_goal_ml?: number
        }
        Update: {
          activity_level?: string | null
          avatar_url?: string | null
          created_at?: string
          current_weight?: number | null
          date_of_birth?: string | null
          first_name?: string | null
          height?: number | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean
          sex?: string | null
          target_carbs?: number | null
          target_fat?: number | null
          target_kcal?: number | null
          target_protein?: number | null
          target_weight?: number | null
          theme?: string
          updated_at?: string
          water_goal_ml?: number
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          carbs: number
          created_at: string
          fat: number
          grams: number
          id: string
          kcal: number
          product_id: string | null
          product_name: string
          protein: number
          recipe_id: string
          user_product_id: string | null
        }
        Insert: {
          carbs?: number
          created_at?: string
          fat?: number
          grams?: number
          id?: string
          kcal?: number
          product_id?: string | null
          product_name: string
          protein?: number
          recipe_id: string
          user_product_id?: string | null
        }
        Update: {
          carbs?: number
          created_at?: string
          fat?: number
          grams?: number
          id?: string
          kcal?: number
          product_id?: string | null
          product_name?: string
          protein?: number
          recipe_id?: string
          user_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_user_product_id_fkey"
            columns: ["user_product_id"]
            isOneToOne: false
            referencedRelation: "user_products"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          notes: string | null
          servings: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          servings?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          servings?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_products: {
        Row: {
          barcode: string | null
          brand: string | null
          carbs_per_100g: number
          created_at: string
          fat_per_100g: number
          fiber_per_100g: number
          id: string
          image_url: string | null
          kcal_per_100g: number
          name: string
          protein_per_100g: number
          salt_per_100g: number
          updated_at: string
          user_id: string
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          carbs_per_100g?: number
          created_at?: string
          fat_per_100g?: number
          fiber_per_100g?: number
          id?: string
          image_url?: string | null
          kcal_per_100g?: number
          name: string
          protein_per_100g?: number
          salt_per_100g?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          carbs_per_100g?: number
          created_at?: string
          fat_per_100g?: number
          fiber_per_100g?: number
          id?: string
          image_url?: string | null
          kcal_per_100g?: number
          name?: string
          protein_per_100g?: number
          salt_per_100g?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          amount_ml: number
          created_at: string
          id: string
          logged_at: string
          user_id: string
        }
        Insert: {
          amount_ml?: number
          created_at?: string
          id?: string
          logged_at?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string
          id?: string
          logged_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weighings: {
        Row: {
          carbs: number
          created_at: string
          fat: number
          grams: number
          id: string
          kcal: number
          logged_at: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          product_id: string | null
          product_name: string
          protein: number
          user_id: string
          user_product_id: string | null
        }
        Insert: {
          carbs?: number
          created_at?: string
          fat?: number
          grams: number
          id?: string
          kcal?: number
          logged_at?: string
          meal_type: Database["public"]["Enums"]["meal_type"]
          product_id?: string | null
          product_name: string
          protein?: number
          user_id: string
          user_product_id?: string | null
        }
        Update: {
          carbs?: number
          created_at?: string
          fat?: number
          grams?: number
          id?: string
          kcal?: number
          logged_at?: string
          meal_type?: Database["public"]["Enums"]["meal_type"]
          product_id?: string | null
          product_name?: string
          protein?: number
          user_id?: string
          user_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weighings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weighings_user_product_id_fkey"
            columns: ["user_product_id"]
            isOneToOne: false
            referencedRelation: "user_products"
            referencedColumns: ["id"]
          },
        ]
      }
      weight_logs: {
        Row: {
          created_at: string
          id: string
          logged_at: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          id?: string
          logged_at?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          id?: string
          logged_at?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      meal_type: "breakfast" | "lunch" | "dinner" | "snack"
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
      app_role: ["admin", "moderator", "user"],
      meal_type: ["breakfast", "lunch", "dinner", "snack"],
    },
  },
} as const
