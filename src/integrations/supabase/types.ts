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
      admin_users: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          design_back: string | null
          design_front: string | null
          id: string
          preview_back: string | null
          preview_front: string | null
          quantity: number
          tshirt_color: string
          tshirt_gender: string
          tshirt_size: string
          tshirt_style: string
          user_id: string
        }
        Insert: {
          created_at?: string
          design_back?: string | null
          design_front?: string | null
          id?: string
          preview_back?: string | null
          preview_front?: string | null
          quantity?: number
          tshirt_color: string
          tshirt_gender: string
          tshirt_size?: string
          tshirt_style: string
          user_id: string
        }
        Update: {
          created_at?: string
          design_back?: string | null
          design_front?: string | null
          id?: string
          preview_back?: string | null
          preview_front?: string | null
          quantity?: number
          tshirt_color?: string
          tshirt_gender?: string
          tshirt_size?: string
          tshirt_style?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      design_drafts: {
        Row: {
          created_at: string
          description: string | null
          design_back: string | null
          design_front: string | null
          id: string
          is_deleted: boolean | null
          is_public: boolean | null
          preview_back: string | null
          preview_front: string | null
          prompt_back: string | null
          prompt_front: string | null
          reward_percentage: number | null
          sales_amount: number | null
          title: string | null
          total_earnings: number | null
          use_count: number | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          design_back?: string | null
          design_front?: string | null
          id?: string
          is_deleted?: boolean | null
          is_public?: boolean | null
          preview_back?: string | null
          preview_front?: string | null
          prompt_back?: string | null
          prompt_front?: string | null
          reward_percentage?: number | null
          sales_amount?: number | null
          title?: string | null
          total_earnings?: number | null
          use_count?: number | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          design_back?: string | null
          design_front?: string | null
          id?: string
          is_deleted?: boolean | null
          is_public?: boolean | null
          preview_back?: string | null
          preview_front?: string | null
          prompt_back?: string | null
          prompt_front?: string | null
          reward_percentage?: number | null
          sales_amount?: number | null
          title?: string | null
          total_earnings?: number | null
          use_count?: number | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      design_projects: {
        Row: {
          back_design_settings: Json | null
          created_at: string
          description: string | null
          design_back: string | null
          design_front: string | null
          front_design_settings: Json | null
          id: string
          is_public: boolean | null
          preview_back: string | null
          preview_front: string | null
          prompt_back: string | null
          prompt_front: string | null
          title: string | null
          tshirt_color: string
          tshirt_gender: string
          tshirt_material: string
          tshirt_size: string
          tshirt_style: string
          updated_at: string
          user_id: string
        }
        Insert: {
          back_design_settings?: Json | null
          created_at?: string
          description?: string | null
          design_back?: string | null
          design_front?: string | null
          front_design_settings?: Json | null
          id?: string
          is_public?: boolean | null
          preview_back?: string | null
          preview_front?: string | null
          prompt_back?: string | null
          prompt_front?: string | null
          title?: string | null
          tshirt_color: string
          tshirt_gender: string
          tshirt_material: string
          tshirt_size: string
          tshirt_style: string
          updated_at?: string
          user_id: string
        }
        Update: {
          back_design_settings?: Json | null
          created_at?: string
          description?: string | null
          design_back?: string | null
          design_front?: string | null
          front_design_settings?: Json | null
          id?: string
          is_public?: boolean | null
          preview_back?: string | null
          preview_front?: string | null
          prompt_back?: string | null
          prompt_front?: string | null
          title?: string | null
          tshirt_color?: string
          tshirt_gender?: string
          tshirt_material?: string
          tshirt_size?: string
          tshirt_style?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      design_purchases: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          design_id: string | null
          designer_id: string | null
          id: string
          purchase_amount: number
          reward_amount: number
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          design_id?: string | null
          designer_id?: string | null
          id?: string
          purchase_amount: number
          reward_amount: number
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          design_id?: string | null
          designer_id?: string | null
          id?: string
          purchase_amount?: number
          reward_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "design_purchases_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "design_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          design_back: string | null
          design_front: string | null
          id: string
          order_id: string
          preview_back: string | null
          preview_front: string | null
          quantity: number
          tshirt_color: string
          tshirt_gender: string
          tshirt_size: string
          tshirt_style: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          design_back?: string | null
          design_front?: string | null
          id?: string
          order_id: string
          preview_back?: string | null
          preview_front?: string | null
          quantity?: number
          tshirt_color: string
          tshirt_gender: string
          tshirt_size: string
          tshirt_style: string
          unit_price: number
        }
        Update: {
          created_at?: string
          design_back?: string | null
          design_front?: string | null
          id?: string
          order_id?: string
          preview_back?: string | null
          preview_front?: string | null
          quantity?: number
          tshirt_color?: string
          tshirt_gender?: string
          tshirt_size?: string
          tshirt_style?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivered_at: string | null
          id: string
          is_deleted: boolean | null
          order_number: string
          paid_at: string | null
          recipient_name: string | null
          recipient_phone: string | null
          refund_completed_at: string | null
          refund_reason: string | null
          refund_requested_at: string | null
          shipped_at: string | null
          shipping_address: string | null
          shipping_company: string | null
          shipping_status: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          id?: string
          is_deleted?: boolean | null
          order_number: string
          paid_at?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          refund_completed_at?: string | null
          refund_reason?: string | null
          refund_requested_at?: string | null
          shipped_at?: string | null
          shipping_address?: string | null
          shipping_company?: string | null
          shipping_status?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          id?: string
          is_deleted?: boolean | null
          order_number?: string
          paid_at?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          refund_completed_at?: string | null
          refund_reason?: string | null
          refund_requested_at?: string | null
          shipped_at?: string | null
          shipping_address?: string | null
          shipping_company?: string | null
          shipping_status?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_records: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_records_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_id: string
          product_id: string
        }
        Insert: {
          category_id: string
          product_id: string
        }
        Update: {
          category_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          stock: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          stock?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          username?: string | null
        }
        Relationships: []
      }
      shipping_addresses: {
        Row: {
          address: string
          created_at: string
          id: string
          is_default: boolean | null
          phone: string
          recipient_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          phone: string
          recipient_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          phone?: string
          recipient_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: string | null
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
      order_status:
        | "pending_payment"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "refund_requested"
        | "refunded"
        | "payment_timeout"
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
