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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      app_sessions: {
        Row: {
          created_at: string
          token: string
          username: string
        }
        Insert: {
          created_at?: string
          token: string
          username: string
        }
        Update: {
          created_at?: string
          token?: string
          username?: string
        }
        Relationships: []
      }
      app_users: {
        Row: {
          bidang: string
          created_at: string
          nama: string
          password: string
          role: string
          urutan: number
          username: string
        }
        Insert: {
          bidang?: string
          created_at?: string
          nama: string
          password: string
          role?: string
          urutan?: number
          username: string
        }
        Update: {
          bidang?: string
          created_at?: string
          nama?: string
          password?: string
          role?: string
          urutan?: number
          username?: string
        }
        Relationships: []
      }
      driver: {
        Row: {
          created_at: string
          nama: string
          urutan: number
          wilayah: string
        }
        Insert: {
          created_at?: string
          nama: string
          urutan?: number
          wilayah?: string
        }
        Update: {
          created_at?: string
          nama?: string
          urutan?: number
          wilayah?: string
        }
        Relationships: []
      }
      kendaraan: {
        Row: {
          admin: string
          area: string
          driver: string
          kml: number | null
          merk: string
          nopol: string
          odo: number | null
          status: string
          updated_at: string
          urutan: number
        }
        Insert: {
          admin?: string
          area?: string
          driver?: string
          kml?: number | null
          merk?: string
          nopol: string
          odo?: number | null
          status?: string
          updated_at?: string
          urutan?: number
        }
        Update: {
          admin?: string
          area?: string
          driver?: string
          kml?: number | null
          merk?: string
          nopol?: string
          odo?: number | null
          status?: string
          updated_at?: string
          urutan?: number
        }
        Relationships: []
      }
      trips: {
        Row: {
          bidang: string | null
          driver: string
          foto_in: string[] | null
          foto_odo_in: string | null
          foto_odo_out: string | null
          foto_out: string[]
          id: number
          in_at: number | null
          kondisi: string | null
          lokasi: string | null
          nopol: string
          odo_in: number | null
          odo_out: number
          out_at: number
          pengguna: string | null
          satpam_in: string | null
          satpam_out: string
          tipe: string
          tujuan: string
          updated_at: string
        }
        Insert: {
          bidang?: string | null
          driver?: string
          foto_in?: string[] | null
          foto_odo_in?: string | null
          foto_odo_out?: string | null
          foto_out?: string[]
          id: number
          in_at?: number | null
          kondisi?: string | null
          lokasi?: string | null
          nopol: string
          odo_in?: number | null
          odo_out?: number
          out_at: number
          pengguna?: string | null
          satpam_in?: string | null
          satpam_out?: string
          tipe?: string
          tujuan?: string
          updated_at?: string
        }
        Update: {
          bidang?: string | null
          driver?: string
          foto_in?: string[] | null
          foto_odo_in?: string | null
          foto_odo_out?: string | null
          foto_out?: string[]
          id?: number
          in_at?: number | null
          kondisi?: string | null
          lokasi?: string | null
          nopol?: string
          odo_in?: number | null
          odo_out?: number
          out_at?: number
          pengguna?: string | null
          satpam_in?: string | null
          satpam_out?: string
          tipe?: string
          tujuan?: string
          updated_at?: string
        }
        Relationships: []
      }
      wilayah_kerja: {
        Row: {
          created_at: string
          nama: string
          urutan: number
        }
        Insert: {
          created_at?: string
          nama: string
          urutan?: number
        }
        Update: {
          created_at?: string
          nama?: string
          urutan?: number
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
