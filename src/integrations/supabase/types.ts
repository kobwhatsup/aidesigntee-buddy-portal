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
      email_ab_test_variants: {
        Row: {
          bounce_count: number | null
          clicked_count: number | null
          conversion_count: number | null
          created_at: string | null
          delivered_count: number | null
          id: string
          opened_count: number | null
          sent_count: number | null
          subject_line: string | null
          template_id: string | null
          test_id: string | null
          traffic_percentage: number | null
          updated_at: string | null
          variant_name: string
        }
        Insert: {
          bounce_count?: number | null
          clicked_count?: number | null
          conversion_count?: number | null
          created_at?: string | null
          delivered_count?: number | null
          id?: string
          opened_count?: number | null
          sent_count?: number | null
          subject_line?: string | null
          template_id?: string | null
          test_id?: string | null
          traffic_percentage?: number | null
          updated_at?: string | null
          variant_name: string
        }
        Update: {
          bounce_count?: number | null
          clicked_count?: number | null
          conversion_count?: number | null
          created_at?: string | null
          delivered_count?: number | null
          id?: string
          opened_count?: number | null
          sent_count?: number | null
          subject_line?: string | null
          template_id?: string | null
          test_id?: string | null
          traffic_percentage?: number | null
          updated_at?: string | null
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_ab_test_variants_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_ab_test_variants_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "email_ab_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      email_ab_tests: {
        Row: {
          campaign_id: string | null
          confidence_level: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          statistical_significance: number | null
          status: string | null
          test_type: string | null
          updated_at: string | null
          winner_variant: string | null
        }
        Insert: {
          campaign_id?: string | null
          confidence_level?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          statistical_significance?: number | null
          status?: string | null
          test_type?: string | null
          updated_at?: string | null
          winner_variant?: string | null
        }
        Update: {
          campaign_id?: string | null
          confidence_level?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          statistical_significance?: number | null
          status?: string | null
          test_type?: string | null
          updated_at?: string | null
          winner_variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_ab_tests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_automation_executions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          email_sent_id: string | null
          error_message: string | null
          executed_at: string | null
          execution_status: string | null
          id: string
          rule_id: string | null
          scheduled_at: string | null
          trigger_event: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          email_sent_id?: string | null
          error_message?: string | null
          executed_at?: string | null
          execution_status?: string | null
          id?: string
          rule_id?: string | null
          scheduled_at?: string | null
          trigger_event?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          email_sent_id?: string | null
          error_message?: string | null
          executed_at?: string | null
          execution_status?: string | null
          id?: string
          rule_id?: string | null
          scheduled_at?: string | null
          trigger_event?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_automation_executions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "email_automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      email_automation_rules: {
        Row: {
          created_at: string | null
          created_by: string | null
          delay_minutes: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          template_id: string | null
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          delay_minutes?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          template_id?: string | null
          trigger_conditions?: Json | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          delay_minutes?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          template_id?: string | null
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_automation_rules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          bounced_count: number | null
          clicked_count: number | null
          created_at: string | null
          created_by: string | null
          delivered_count: number | null
          description: string | null
          id: string
          name: string
          opened_count: number | null
          scheduled_at: string | null
          segment_id: string | null
          sent_at: string | null
          sent_count: number | null
          status: Database["public"]["Enums"]["email_campaign_status"] | null
          template_id: string | null
          total_recipients: number | null
          unsubscribed_count: number | null
          updated_at: string | null
        }
        Insert: {
          bounced_count?: number | null
          clicked_count?: number | null
          created_at?: string | null
          created_by?: string | null
          delivered_count?: number | null
          description?: string | null
          id?: string
          name: string
          opened_count?: number | null
          scheduled_at?: string | null
          segment_id?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: Database["public"]["Enums"]["email_campaign_status"] | null
          template_id?: string | null
          total_recipients?: number | null
          unsubscribed_count?: number | null
          updated_at?: string | null
        }
        Update: {
          bounced_count?: number | null
          clicked_count?: number | null
          created_at?: string | null
          created_by?: string | null
          delivered_count?: number | null
          description?: string | null
          id?: string
          name?: string
          opened_count?: number | null
          scheduled_at?: string | null
          segment_id?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: Database["public"]["Enums"]["email_campaign_status"] | null
          template_id?: string | null
          total_recipients?: number | null
          unsubscribed_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "user_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_performance_metrics: {
        Row: {
          id: string
          metric_data: Json | null
          metric_type: string
          metric_value: number
          recorded_at: string | null
        }
        Insert: {
          id?: string
          metric_data?: Json | null
          metric_type: string
          metric_value: number
          recorded_at?: string | null
        }
        Update: {
          id?: string
          metric_data?: Json | null
          metric_type?: string
          metric_value?: number
          recorded_at?: string | null
        }
        Relationships: []
      }
      email_sends: {
        Row: {
          bounced_at: string | null
          campaign_id: string | null
          clicked_at: string | null
          created_at: string | null
          delivered_at: string | null
          email: string
          error_message: string | null
          id: string
          opened_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["email_send_status"] | null
          tracking_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bounced_at?: string | null
          campaign_id?: string | null
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          email: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_send_status"] | null
          tracking_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bounced_at?: string | null
          campaign_id?: string | null
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          email?: string
          error_message?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_send_status"] | null
          tracking_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_sends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          html_content: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_type: Database["public"]["Enums"]["email_template_type"]
          text_content: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          html_content: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_type: Database["public"]["Enums"]["email_template_type"]
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_type?: Database["public"]["Enums"]["email_template_type"]
          text_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      email_tracking_events: {
        Row: {
          created_at: string | null
          email_send_id: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email_send_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email_send_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_tracking_events_email_send_id_fkey"
            columns: ["email_send_id"]
            isOneToOne: false
            referencedRelation: "email_sends"
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
          wechat_code_url: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
          wechat_code_url?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
          wechat_code_url?: string | null
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
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          phone: string | null
          real_name: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id: string
          phone?: string | null
          real_name?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          phone?: string | null
          real_name?: string | null
          updated_at?: string | null
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
      user_email_preferences: {
        Row: {
          created_at: string | null
          id: string
          marketing_emails: boolean | null
          newsletter: boolean | null
          notification_emails: boolean | null
          order_emails: boolean | null
          unsubscribed_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          marketing_emails?: boolean | null
          newsletter?: boolean | null
          notification_emails?: boolean | null
          order_emails?: boolean | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          marketing_emails?: boolean | null
          newsletter?: boolean | null
          notification_emails?: boolean | null
          order_emails?: boolean | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_email_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_segments: {
        Row: {
          conditions: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_dynamic: boolean | null
          name: string
          updated_at: string | null
          user_count: number | null
        }
        Insert: {
          conditions: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_dynamic?: boolean | null
          name: string
          updated_at?: string | null
          user_count?: number | null
        }
        Update: {
          conditions?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_dynamic?: boolean | null
          name?: string
          updated_at?: string | null
          user_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_ab_test_significance: {
        Args: { test_id: string; variant_a: string; variant_b: string }
        Returns: number
      }
      force_update_order_status: {
        Args: { order_id: string; new_status: string; paid_timestamp?: string }
        Returns: undefined
      }
    }
    Enums: {
      email_campaign_status:
        | "draft"
        | "scheduled"
        | "sending"
        | "sent"
        | "paused"
        | "cancelled"
      email_send_status:
        | "pending"
        | "sent"
        | "delivered"
        | "opened"
        | "clicked"
        | "bounced"
        | "failed"
        | "unsubscribed"
      email_template_type:
        | "welcome"
        | "promotional"
        | "notification"
        | "order_confirmation"
        | "order_shipped"
        | "newsletter"
        | "abandoned_cart"
        | "user_activation"
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
    Enums: {
      email_campaign_status: [
        "draft",
        "scheduled",
        "sending",
        "sent",
        "paused",
        "cancelled",
      ],
      email_send_status: [
        "pending",
        "sent",
        "delivered",
        "opened",
        "clicked",
        "bounced",
        "failed",
        "unsubscribed",
      ],
      email_template_type: [
        "welcome",
        "promotional",
        "notification",
        "order_confirmation",
        "order_shipped",
        "newsletter",
        "abandoned_cart",
        "user_activation",
      ],
      order_status: [
        "pending_payment",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "refund_requested",
        "refunded",
        "payment_timeout",
      ],
    },
  },
} as const
