export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      documents: {
        Row: {
          file_path: string;
          file_size: number | null;
          id: string;
          mime_type: string | null;
          original_filename: string;
          stored_filename: string | null;
          uploaded_at: string | null;
          user_id: string | null;
        };
        Insert: {
          file_path: string;
          file_size?: number | null;
          id?: string;
          mime_type?: string | null;
          original_filename: string;
          stored_filename?: string | null;
          uploaded_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          file_path?: string;
          file_size?: number | null;
          id?: string;
          mime_type?: string | null;
          original_filename?: string;
          stored_filename?: string | null;
          uploaded_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          assigned_to: string | null;
          check_type: string | null;
          created_at: string | null;
          document_id: string | null;
          id: string;
          options: Json | null;
          status: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          assigned_to?: string | null;
          check_type?: string | null;
          created_at?: string | null;
          document_id?: string | null;
          id?: string;
          options?: Json | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          assigned_to?: string | null;
          check_type?: string | null;
          created_at?: string | null;
          document_id?: string | null;
          id?: string;
          options?: Json | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount: number | null;
          bank_code: string | null;
          created_at: string | null;
          credits_added: number | null;
          currency: string | null;
          id: string;
          method: string | null;
          paid_at: string | null;
          status: string | null;
          transaction_id: string | null;
          transaction_no: string | null;
          user_id: string | null;
          vnp_response_code: string | null;
        };
        Insert: {
          amount?: number | null;
          bank_code?: string | null;
          created_at?: string | null;
          credits_added?: number | null;
          currency?: string | null;
          id?: string;
          method?: string | null;
          paid_at?: string | null;
          status?: string | null;
          transaction_id?: string | null;
          transaction_no?: string | null;
          user_id?: string | null;
          vnp_response_code?: string | null;
        };
        Update: {
          amount?: number | null;
          bank_code?: string | null;
          created_at?: string | null;
          credits_added?: number | null;
          currency?: string | null;
          id?: string;
          method?: string | null;
          paid_at?: string | null;
          status?: string | null;
          transaction_id?: string | null;
          transaction_no?: string | null;
          user_id?: string | null;
          vnp_response_code?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string | null;
          credits: number | null;
          id: string;
          name: string | null;
          role: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          credits?: number | null;
          id: string;
          name?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          credits?: number | null;
          id?: string;
          name?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      promo_codes: {
        Row: {
          active: boolean;
          banner_message: string | null;
          bonus_credits: number | null;
          code: string;
          created_at: string;
          discount_percentage: number | null;
          expires_at: string | null;
          id: string;
          show_banner: boolean;
        };
        Insert: {
          active?: boolean;
          banner_message?: string | null;
          bonus_credits?: number | null;
          code: string;
          created_at?: string;
          discount_percentage?: number | null;
          expires_at?: string | null;
          id?: string;
          show_banner?: boolean;
        };
        Update: {
          active?: boolean;
          banner_message?: string | null;
          bonus_credits?: number | null;
          code?: string;
          created_at?: string;
          discount_percentage?: number | null;
          expires_at?: string | null;
          id?: string;
          show_banner?: boolean;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          ai_score: number | null;
          completed_at: string | null;
          details: Json | null;
          id: string;
          order_id: string | null;
          similarity_score: number | null;
        };
        Insert: {
          ai_score?: number | null;
          completed_at?: string | null;
          details?: Json | null;
          id?: string;
          order_id?: string | null;
          similarity_score?: number | null;
        };
        Update: {
          ai_score?: number | null;
          completed_at?: string | null;
          details?: Json | null;
          id?: string;
          order_id?: string | null;
          similarity_score?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "reports_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: true;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      system_settings: {
        Row: {
          ai_credit_cost: number;
          announcement_active: boolean;
          announcement_text: string | null;
          combo_credit_cost: number;
          created_at: string | null;
          credit_price: number;
          id: string;
          similarity_credit_cost: number;
          updated_at: string | null;
        };
        Insert: {
          ai_credit_cost?: number;
          announcement_active?: boolean;
          announcement_text?: string | null;
          combo_credit_cost?: number;
          created_at?: string | null;
          credit_price?: number;
          id?: string;
          similarity_credit_cost?: number;
          updated_at?: string | null;
        };
        Update: {
          ai_credit_cost?: number;
          announcement_active?: boolean;
          announcement_text?: string | null;
          combo_credit_cost?: number;
          created_at?: string | null;
          credit_price?: number;
          id?: string;
          similarity_credit_cost?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_order_securely:
        | {
            Args: {
              p_check_type: string;
              p_file_name: string;
              p_file_path: string;
              p_file_size: number;
              p_mime_type: string;
            };
            Returns: Json;
          }
        | {
            Args: {
              p_check_type: string;
              p_file_name: string;
              p_file_path: string;
              p_file_size: number;
              p_mime_type: string;
              p_options?: Json;
            };
            Returns: Json;
          };
      get_revenue_by_period: {
        Args: { end_date: string; p_period: string; start_date: string };
        Returns: {
          period_date: string;
          total_amount: number;
        }[];
      };
      get_revenue_sum: {
        Args: { end_date: string; start_date: string };
        Returns: number;
      };
      is_admin: { Args: never; Returns: boolean };
      is_employee: { Args: never; Returns: boolean };
      process_vnpay_success: {
        Args: {
          p_bank_code: string;
          p_expected_amount: number;
          p_transaction_id: string;
          p_transaction_no: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
