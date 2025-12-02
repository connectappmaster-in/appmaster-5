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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_published: boolean | null
          organisation_id: string
          priority: string | null
          published_at: string | null
          published_by: string
          target_roles: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_published?: boolean | null
          organisation_id: string
          priority?: string | null
          published_at?: string | null
          published_by: string
          target_roles?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_published?: boolean | null
          organisation_id?: string
          priority?: string | null
          published_at?: string | null
          published_by?: string
          target_roles?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      antivirus_updates: {
        Row: {
          antivirus_name: string
          created_at: string | null
          definition_version: string
          id: number
          last_update: string
          machine_id: number | null
          organisation_id: string | null
          scan_status: string | null
          tenant_id: number
          threats_detected: number | null
          updated_at: string | null
        }
        Insert: {
          antivirus_name: string
          created_at?: string | null
          definition_version: string
          id?: number
          last_update: string
          machine_id?: number | null
          organisation_id?: string | null
          scan_status?: string | null
          tenant_id: number
          threats_detected?: number | null
          updated_at?: string | null
        }
        Update: {
          antivirus_name?: string
          created_at?: string | null
          definition_version?: string
          id?: number
          last_update?: string
          machine_id?: number | null
          organisation_id?: string | null
          scan_status?: string | null
          tenant_id?: number
          threats_detected?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "antivirus_updates_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "monitored_machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "antivirus_updates_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "antivirus_updates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      appmaster_admins: {
        Row: {
          admin_role: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_role: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_role?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      asset_assignments: {
        Row: {
          asset_id: number
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string
          condition_at_assignment: string | null
          condition_at_return: string | null
          created_at: string | null
          id: number
          notes: string | null
          organisation_id: string | null
          returned_at: string | null
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          asset_id: number
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to: string
          condition_at_assignment?: string | null
          condition_at_return?: string | null
          created_at?: string | null
          id?: number
          notes?: string | null
          organisation_id?: string | null
          returned_at?: string | null
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          asset_id?: number
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string
          condition_at_assignment?: string | null
          condition_at_return?: string | null
          created_at?: string | null
          id?: number
          notes?: string | null
          organisation_id?: string | null
          returned_at?: string | null
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_assignments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_contracts: {
        Row: {
          asset_id: number
          contract_end: string | null
          contract_start: string | null
          contract_type: string | null
          cost: number | null
          created_at: string | null
          document_url: string | null
          id: string
          notes: string | null
          tenant_id: number
          updated_at: string | null
          vendor_id: number | null
        }
        Insert: {
          asset_id: number
          contract_end?: string | null
          contract_start?: string | null
          contract_type?: string | null
          cost?: number | null
          created_at?: string | null
          document_url?: string | null
          id?: string
          notes?: string | null
          tenant_id: number
          updated_at?: string | null
          vendor_id?: number | null
        }
        Update: {
          asset_id?: number
          contract_end?: string | null
          contract_start?: string | null
          contract_type?: string | null
          cost?: number | null
          created_at?: string | null
          document_url?: string | null
          id?: string
          notes?: string | null
          tenant_id?: number
          updated_at?: string | null
          vendor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_contracts_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "itam_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_contracts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "itam_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_depreciation_profiles: {
        Row: {
          asset_id: number
          cost_basis: number
          created_at: string | null
          created_by: string | null
          depreciation_start_date: string
          frequency: string
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          method_id: string
          prorate_first_period: boolean | null
          prorate_last_period: boolean | null
          salvage_value: number | null
          switch_to_sl_threshold: boolean | null
          tenant_id: number
          updated_at: string | null
          updated_by: string | null
          useful_life_periods: number
          useful_life_years: number
        }
        Insert: {
          asset_id: number
          cost_basis: number
          created_at?: string | null
          created_by?: string | null
          depreciation_start_date: string
          frequency: string
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          method_id: string
          prorate_first_period?: boolean | null
          prorate_last_period?: boolean | null
          salvage_value?: number | null
          switch_to_sl_threshold?: boolean | null
          tenant_id: number
          updated_at?: string | null
          updated_by?: string | null
          useful_life_periods: number
          useful_life_years: number
        }
        Update: {
          asset_id?: number
          cost_basis?: number
          created_at?: string | null
          created_by?: string | null
          depreciation_start_date?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          method_id?: string
          prorate_first_period?: boolean | null
          prorate_last_period?: boolean | null
          salvage_value?: number | null
          switch_to_sl_threshold?: boolean | null
          tenant_id?: number
          updated_at?: string | null
          updated_by?: string | null
          useful_life_periods?: number
          useful_life_years?: number
        }
        Relationships: []
      }
      asset_documents: {
        Row: {
          asset_id: number
          created_at: string | null
          document_name: string
          document_type: string | null
          document_url: string
          id: string
          tenant_id: number
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          asset_id: number
          created_at?: string | null
          document_name: string
          document_type?: string | null
          document_url: string
          id?: string
          tenant_id: number
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          asset_id?: number
          created_at?: string | null
          document_name?: string
          document_type?: string | null
          document_url?: string
          id?: string
          tenant_id?: number
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_documents_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "itam_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_events: {
        Row: {
          asset_id: number
          created_at: string | null
          event_description: string | null
          event_type: string
          id: string
          metadata: Json | null
          performed_at: string | null
          performed_by: string | null
          tenant_id: number
        }
        Insert: {
          asset_id: number
          created_at?: string | null
          event_description?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          tenant_id: number
        }
        Update: {
          asset_id?: number
          created_at?: string | null
          event_description?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          performed_at?: string | null
          performed_by?: string | null
          tenant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "asset_events_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "itam_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_licenses: {
        Row: {
          cost: number | null
          created_at: string | null
          created_by: string | null
          expiry_date: string | null
          id: number
          license_key: string | null
          license_type: string | null
          name: string
          notes: string | null
          organisation_id: string | null
          purchase_date: string | null
          seats_total: number
          seats_used: number
          software_name: string
          status: string | null
          tenant_id: number
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string | null
          id?: number
          license_key?: string | null
          license_type?: string | null
          name: string
          notes?: string | null
          organisation_id?: string | null
          purchase_date?: string | null
          seats_total?: number
          seats_used?: number
          software_name: string
          status?: string | null
          tenant_id: number
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string | null
          id?: number
          license_key?: string | null
          license_type?: string | null
          name?: string
          notes?: string | null
          organisation_id?: string | null
          purchase_date?: string | null
          seats_total?: number
          seats_used?: number
          software_name?: string
          status?: string | null
          tenant_id?: number
          updated_at?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_licenses_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_licenses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_linked_items: {
        Row: {
          asset_id: number
          created_at: string | null
          id: string
          link_type: string | null
          linked_asset_id: number | null
          tenant_id: number
        }
        Insert: {
          asset_id: number
          created_at?: string | null
          id?: string
          link_type?: string | null
          linked_asset_id?: number | null
          tenant_id: number
        }
        Update: {
          asset_id?: number
          created_at?: string | null
          id?: string
          link_type?: string | null
          linked_asset_id?: number | null
          tenant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "asset_linked_items_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "itam_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_linked_items_linked_asset_id_fkey"
            columns: ["linked_asset_id"]
            isOneToOne: false
            referencedRelation: "itam_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_maintenance: {
        Row: {
          asset_id: number
          cost: number | null
          created_at: string | null
          created_by: string | null
          id: string
          issue_description: string
          notes: string | null
          resolved_at: string | null
          status: string | null
          tenant_id: number
          updated_at: string | null
          vendor_id: number | null
        }
        Insert: {
          asset_id: number
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          issue_description: string
          notes?: string | null
          resolved_at?: string | null
          status?: string | null
          tenant_id: number
          updated_at?: string | null
          vendor_id?: number | null
        }
        Update: {
          asset_id?: number
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          issue_description?: string
          notes?: string | null
          resolved_at?: string | null
          status?: string | null
          tenant_id?: number
          updated_at?: string | null
          vendor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_maintenance_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "itam_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_maintenance_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "itam_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_photos: {
        Row: {
          asset_id: number
          created_at: string | null
          id: string
          is_primary: boolean | null
          photo_url: string
          tenant_id: number
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          asset_id: number
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          photo_url: string
          tenant_id: number
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          asset_id?: number
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          photo_url?: string
          tenant_id?: number
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_photos_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "itam_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_reservations: {
        Row: {
          asset_id: number
          created_at: string | null
          id: string
          purpose: string | null
          reserved_by: string
          reserved_from: string
          reserved_to: string
          status: string | null
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          asset_id: number
          created_at?: string | null
          id?: string
          purpose?: string | null
          reserved_by: string
          reserved_from: string
          reserved_to: string
          status?: string | null
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          asset_id?: number
          created_at?: string | null
          id?: string
          purpose?: string | null
          reserved_by?: string
          reserved_from?: string
          reserved_to?: string
          status?: string | null
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_reservations_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "itam_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_warranties: {
        Row: {
          amc_end: string | null
          amc_start: string | null
          asset_id: number
          created_at: string | null
          id: string
          notes: string | null
          tenant_id: number
          updated_at: string | null
          warranty_end: string | null
          warranty_start: string | null
        }
        Insert: {
          amc_end?: string | null
          amc_start?: string | null
          asset_id: number
          created_at?: string | null
          id?: string
          notes?: string | null
          tenant_id: number
          updated_at?: string | null
          warranty_end?: string | null
          warranty_start?: string | null
        }
        Update: {
          amc_end?: string | null
          amc_start?: string | null
          asset_id?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          tenant_id?: number
          updated_at?: string | null
          warranty_end?: string | null
          warranty_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_warranties_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "itam_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_type: string | null
          created_at: string | null
          created_by: string | null
          current_value: number | null
          depreciation_method: string | null
          id: number
          name: string
          organisation_id: string | null
          purchase_date: string
          purchase_price: number
          salvage_value: number | null
          status: string | null
          tenant_id: number
          updated_at: string | null
          useful_life_years: number | null
        }
        Insert: {
          asset_type?: string | null
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          depreciation_method?: string | null
          id?: never
          name: string
          organisation_id?: string | null
          purchase_date: string
          purchase_price: number
          salvage_value?: number | null
          status?: string | null
          tenant_id: number
          updated_at?: string | null
          useful_life_years?: number | null
        }
        Update: {
          asset_type?: string | null
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          depreciation_method?: string | null
          id?: never
          name?: string
          organisation_id?: string | null
          purchase_date?: string
          purchase_price?: number
          salvage_value?: number | null
          status?: string | null
          tenant_id?: number
          updated_at?: string | null
          useful_life_years?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "individual_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_type: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          organisation_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organisation_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organisation_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "individual_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_providers: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          provider: string
          provider_user_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          provider: string
          provider_user_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string
          provider_user_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      broadcast_dismissals: {
        Row: {
          broadcast_id: string
          dismissed_at: string
          id: string
          user_id: string
        }
        Insert: {
          broadcast_id: string
          dismissed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          broadcast_id?: string
          dismissed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_dismissals_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          created_at: string
          created_by: string
          description: string
          expires_at: string | null
          id: string
          is_active: boolean
          scheduled_for: string | null
          target_audience: Database["public"]["Enums"]["broadcast_target_audience"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          scheduled_for?: string | null
          target_audience: Database["public"]["Enums"]["broadcast_target_audience"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          scheduled_for?: string | null
          target_audience?: Database["public"]["Enums"]["broadcast_target_audience"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      category_tag_formats: {
        Row: {
          category_id: number
          created_at: string | null
          current_number: number
          id: string
          organisation_id: string | null
          prefix: string
          tenant_id: number
          updated_at: string | null
          zero_padding: number
        }
        Insert: {
          category_id: number
          created_at?: string | null
          current_number?: number
          id?: string
          organisation_id?: string | null
          prefix: string
          tenant_id: number
          updated_at?: string | null
          zero_padding?: number
        }
        Update: {
          category_id?: number
          created_at?: string | null
          current_number?: number
          id?: string
          organisation_id?: string | null
          prefix?: string
          tenant_id?: number
          updated_at?: string | null
          zero_padding?: number
        }
        Relationships: [
          {
            foreignKeyName: "category_tag_formats_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "itam_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_tag_formats_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      critical_systems: {
        Row: {
          alert_threshold: number | null
          created_at: string | null
          description: string | null
          id: number
          last_check: string | null
          organisation_id: string | null
          status: string | null
          system_name: string
          system_type: string
          tenant_id: number
          updated_at: string | null
          uptime_percentage: number | null
        }
        Insert: {
          alert_threshold?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          last_check?: string | null
          organisation_id?: string | null
          status?: string | null
          system_name: string
          system_type: string
          tenant_id: number
          updated_at?: string | null
          uptime_percentage?: number | null
        }
        Update: {
          alert_threshold?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          last_check?: string | null
          organisation_id?: string | null
          status?: string | null
          system_name?: string
          system_type?: string
          tenant_id?: number
          updated_at?: string | null
          uptime_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "critical_systems_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "critical_systems_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          company: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: number
          name: string
          organisation_id: string | null
          phone: string | null
          status: string | null
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: never
          name: string
          organisation_id?: string | null
          phone?: string | null
          status?: string | null
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: never
          name?: string
          organisation_id?: string | null
          phone?: string | null
          status?: string | null
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "individual_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          amount: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          expected_close_date: string | null
          id: number
          lead_id: number | null
          organisation_id: string | null
          owner_id: string | null
          stage: string | null
          tenant_id: number
          title: string
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          expected_close_date?: string | null
          id?: never
          lead_id?: number | null
          organisation_id?: string | null
          owner_id?: string | null
          stage?: string | null
          tenant_id: number
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          expected_close_date?: string | null
          id?: never
          lead_id?: number | null
          organisation_id?: string | null
          owner_id?: string | null
          stage?: string | null
          tenant_id?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "individual_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_leads: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string | null
          created_by: string
          email: string | null
          id: number
          name: string
          organisation_id: string | null
          phone: string | null
          source: string | null
          status: string | null
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string | null
          created_by: string
          email?: string | null
          id?: never
          name: string
          organisation_id?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string | null
          created_by?: string
          email?: string | null
          id?: never
          name?: string
          organisation_id?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      currencies: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          symbol: string
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          symbol: string
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      depreciation_entries: {
        Row: {
          accumulated_depreciation: number
          asset_id: number
          book_value: number
          created_at: string | null
          created_by: string | null
          depreciation_amount: number
          entry_type: string
          id: string
          notes: string | null
          period_end: string
          period_start: string
          posted: boolean | null
          profile_id: string
          tenant_id: number
        }
        Insert: {
          accumulated_depreciation: number
          asset_id: number
          book_value: number
          created_at?: string | null
          created_by?: string | null
          depreciation_amount: number
          entry_type: string
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          posted?: boolean | null
          profile_id: string
          tenant_id: number
        }
        Update: {
          accumulated_depreciation?: number
          asset_id?: number
          book_value?: number
          created_at?: string | null
          created_by?: string | null
          depreciation_amount?: number
          entry_type?: string
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          posted?: boolean | null
          profile_id?: string
          tenant_id?: number
        }
        Relationships: []
      }
      depreciation_methods: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          parameters: Json | null
          tenant_id: number
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parameters?: Json | null
          tenant_id: number
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parameters?: Json | null
          tenant_id?: number
        }
        Relationships: []
      }
      depreciation_run_logs: {
        Row: {
          created_at: string | null
          entries_created: number | null
          errors: Json | null
          id: string
          period_end: string
          period_start: string
          run_date: string | null
          status: string
          tenant_id: number
        }
        Insert: {
          created_at?: string | null
          entries_created?: number | null
          errors?: Json | null
          id?: string
          period_end: string
          period_start: string
          run_date?: string | null
          status: string
          tenant_id: number
        }
        Update: {
          created_at?: string | null
          entries_created?: number | null
          errors?: Json | null
          id?: string
          period_end?: string
          period_start?: string
          run_date?: string | null
          status?: string
          tenant_id?: number
        }
        Relationships: []
      }
      helpdesk_automation_logs: {
        Row: {
          error_message: string | null
          executed_at: string | null
          id: number
          rule_id: number
          status: string | null
          ticket_id: number | null
          trigger_data: Json | null
        }
        Insert: {
          error_message?: string | null
          executed_at?: string | null
          id?: number
          rule_id: number
          status?: string | null
          ticket_id?: number | null
          trigger_data?: Json | null
        }
        Update: {
          error_message?: string | null
          executed_at?: string | null
          id?: number
          rule_id?: number
          status?: string | null
          ticket_id?: number | null
          trigger_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_automation_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_automation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_automation_logs_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      helpdesk_automation_rules: {
        Row: {
          actions: Json | null
          conditions: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          execution_count: number | null
          execution_order: number | null
          id: number
          is_active: boolean | null
          last_executed_at: string | null
          name: string
          organisation_id: string | null
          tenant_id: number
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          execution_order?: number | null
          id?: number
          is_active?: boolean | null
          last_executed_at?: string | null
          name: string
          organisation_id?: string | null
          tenant_id: number
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json | null
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          execution_order?: number | null
          id?: number
          is_active?: boolean | null
          last_executed_at?: string | null
          name?: string
          organisation_id?: string | null
          tenant_id?: number
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_automation_rules_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_automation_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      helpdesk_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          is_active: boolean | null
          is_deleted: boolean | null
          name: string
          organisation_id: string | null
          parent_id: number | null
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          is_deleted?: boolean | null
          name: string
          organisation_id?: string | null
          parent_id?: number | null
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          is_deleted?: boolean | null
          name?: string
          organisation_id?: string | null
          parent_id?: number | null
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_categories_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      helpdesk_change_approvals: {
        Row: {
          approved_at: string | null
          approver_id: string
          change_id: number
          comments: string | null
          created_at: string | null
          id: number
          status: string | null
        }
        Insert: {
          approved_at?: string | null
          approver_id: string
          change_id: number
          comments?: string | null
          created_at?: string | null
          id?: number
          status?: string | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string
          change_id?: number
          comments?: string | null
          created_at?: string | null
          id?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_change_approvals_change_id_fkey"
            columns: ["change_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_changes"
            referencedColumns: ["id"]
          },
        ]
      }
      helpdesk_changes: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          approval_status: string | null
          assigned_to: string | null
          category_id: number | null
          change_number: string
          created_at: string | null
          description: string
          id: number
          impact: string | null
          implementation_plan: string | null
          organisation_id: string | null
          priority: string | null
          requested_by: string | null
          requires_approval: boolean | null
          risk_level: string | null
          rollback_plan: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          status: string | null
          tenant_id: number
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          approval_status?: string | null
          assigned_to?: string | null
          category_id?: number | null
          change_number: string
          created_at?: string | null
          description: string
          id?: number
          impact?: string | null
          implementation_plan?: string | null
          organisation_id?: string | null
          priority?: string | null
          requested_by?: string | null
          requires_approval?: boolean | null
          risk_level?: string | null
          rollback_plan?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: string | null
          tenant_id: number
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          approval_status?: string | null
          assigned_to?: string | null
          category_id?: number | null
          change_number?: string
          created_at?: string | null
          description?: string
          id?: number
          impact?: string | null
          implementation_plan?: string | null
          organisation_id?: string | null
          priority?: string | null
          requested_by?: string | null
          requires_approval?: boolean | null
          risk_level?: string | null
          rollback_plan?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          status?: string | null
          tenant_id?: number
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_changes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_changes_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_changes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      helpdesk_kb_article_feedback: {
        Row: {
          article_id: number
          comment: string | null
          created_at: string | null
          id: number
          is_helpful: boolean
          user_id: string | null
        }
        Insert: {
          article_id: number
          comment?: string | null
          created_at?: string | null
          id?: number
          is_helpful: boolean
          user_id?: string | null
        }
        Update: {
          article_id?: number
          comment?: string | null
          created_at?: string | null
          id?: number
          is_helpful?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_kb_article_feedback_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_kb_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      helpdesk_kb_articles: {
        Row: {
          attachments: Json | null
          author_id: string | null
          category_id: number | null
          content: string
          created_at: string | null
          helpful_count: number | null
          id: number
          not_helpful_count: number | null
          organisation_id: string | null
          published_at: string | null
          status: string | null
          summary: string | null
          tags: string[] | null
          tenant_id: number
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          attachments?: Json | null
          author_id?: string | null
          category_id?: number | null
          content: string
          created_at?: string | null
          helpful_count?: number | null
          id?: number
          not_helpful_count?: number | null
          organisation_id?: string | null
          published_at?: string | null
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          tenant_id: number
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          attachments?: Json | null
          author_id?: string | null
          category_id?: number | null
          content?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: number
          not_helpful_count?: number | null
          organisation_id?: string | null
          published_at?: string | null
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          tenant_id?: number
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_kb_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_kb_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_kb_articles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_kb_articles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      helpdesk_kb_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
          organisation_id: string | null
          parent_id: number | null
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          organisation_id?: string | null
          parent_id?: number | null
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          organisation_id?: string | null
          parent_id?: number | null
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_kb_categories_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_kb_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_kb_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_kb_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      helpdesk_problem_tickets: {
        Row: {
          created_at: string | null
          id: number
          problem_id: number
          ticket_id: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          problem_id: number
          ticket_id: number
        }
        Update: {
          created_at?: string | null
          id?: number
          problem_id?: number
          ticket_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_problem_tickets_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_problem_tickets_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      helpdesk_problems: {
        Row: {
          assigned_to: string | null
          category_id: number | null
          closed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string
          id: number
          is_deleted: boolean | null
          linked_ticket_ids: string[] | null
          organisation_id: string | null
          permanent_fix: string | null
          priority: string | null
          problem_number: string
          problem_title: string | null
          resolved_at: string | null
          root_cause: string | null
          solution: string | null
          status: string | null
          tenant_id: number
          title: string
          updated_at: string | null
          updated_by: string | null
          workaround: string | null
        }
        Insert: {
          assigned_to?: string | null
          category_id?: number | null
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: number
          is_deleted?: boolean | null
          linked_ticket_ids?: string[] | null
          organisation_id?: string | null
          permanent_fix?: string | null
          priority?: string | null
          problem_number: string
          problem_title?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          solution?: string | null
          status?: string | null
          tenant_id: number
          title: string
          updated_at?: string | null
          updated_by?: string | null
          workaround?: string | null
        }
        Update: {
          assigned_to?: string | null
          category_id?: number | null
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: number
          is_deleted?: boolean | null
          linked_ticket_ids?: string[] | null
          organisation_id?: string | null
          permanent_fix?: string | null
          priority?: string | null
          problem_number?: string
          problem_title?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          solution?: string | null
          status?: string | null
          tenant_id?: number
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          workaround?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_problems_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_problems_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_problems_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      helpdesk_queue_members: {
        Row: {
          agent_id: string
          created_at: string | null
          id: number
          is_active: boolean | null
          max_concurrent_tickets: number | null
          queue_id: number
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          max_concurrent_tickets?: number | null
          queue_id: number
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          max_concurrent_tickets?: number | null
          queue_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_queue_members_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_queues"
            referencedColumns: ["id"]
          },
        ]
      }
      helpdesk_queues: {
        Row: {
          assignment_method: string | null
          auto_assign: boolean | null
          created_at: string | null
          description: string | null
          email_address: string | null
          id: number
          is_active: boolean | null
          name: string
          organisation_id: string | null
          sla_policy_id: number | null
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          assignment_method?: string | null
          auto_assign?: boolean | null
          created_at?: string | null
          description?: string | null
          email_address?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          organisation_id?: string | null
          sla_policy_id?: number | null
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          assignment_method?: string | null
          auto_assign?: boolean | null
          created_at?: string | null
          description?: string | null
          email_address?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          organisation_id?: string | null
          sla_policy_id?: number | null
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_queues_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_queues_sla_policy_id_fkey"
            columns: ["sla_policy_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_sla_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_queues_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      helpdesk_sla_policies: {
        Row: {
          created_at: string | null
          escalation_rule: Json | null
          id: number
          is_active: boolean | null
          name: string
          organisation_id: string | null
          priority: string
          resolution_time_hours: number
          resolution_time_minutes: number | null
          response_time_hours: number
          response_time_minutes: number | null
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          escalation_rule?: Json | null
          id?: number
          is_active?: boolean | null
          name: string
          organisation_id?: string | null
          priority: string
          resolution_time_hours: number
          resolution_time_minutes?: number | null
          response_time_hours: number
          response_time_minutes?: number | null
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          escalation_rule?: Json | null
          id?: number
          is_active?: boolean | null
          name?: string
          organisation_id?: string | null
          priority?: string
          resolution_time_hours?: number
          resolution_time_minutes?: number | null
          response_time_hours?: number
          response_time_minutes?: number | null
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_sla_policies_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_sla_policies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      helpdesk_ticket_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: number
          tenant_id: number
          ticket_id: number
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: number
          tenant_id: number
          ticket_id: number
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: number
          tenant_id?: number
          ticket_id?: number
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_ticket_attachments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_ticket_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "individual_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_ticket_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_ticket_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      helpdesk_ticket_comments: {
        Row: {
          attachments: Json | null
          comment: string
          created_at: string | null
          id: number
          is_internal: boolean | null
          tenant_id: number
          ticket_id: number
          updated_at: string | null
          updated_by: string | null
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          comment: string
          created_at?: string | null
          id?: number
          is_internal?: boolean | null
          tenant_id: number
          ticket_id: number
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
        }
        Update: {
          attachments?: Json | null
          comment?: string
          created_at?: string | null
          id?: number
          is_internal?: boolean | null
          tenant_id?: number
          ticket_id?: number
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_ticket_comments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "individual_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_ticket_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      helpdesk_ticket_history: {
        Row: {
          created_at: string | null
          field_name: string
          id: number
          new_value: string | null
          old_value: string | null
          tenant_id: number
          ticket_id: number
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          field_name: string
          id?: number
          new_value?: string | null
          old_value?: string | null
          tenant_id: number
          ticket_id: number
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          field_name?: string
          id?: number
          new_value?: string | null
          old_value?: string | null
          tenant_id?: number
          ticket_id?: number
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_ticket_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_ticket_history_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_ticket_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "individual_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_ticket_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_ticket_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      helpdesk_tickets: {
        Row: {
          additional_notes: string | null
          assignee_id: string | null
          attachments: Json | null
          catalog_item_id: number | null
          category_id: number | null
          closed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string
          form_data: Json | null
          fulfilled_at: string | null
          id: number
          is_deleted: boolean | null
          organisation_id: string | null
          priority: string
          queue_id: number | null
          rejected_at: string | null
          rejection_reason: string | null
          request_type: Database["public"]["Enums"]["request_type"] | null
          requester_id: string | null
          resolution_comments: string | null
          resolved_at: string | null
          sla_breached: boolean | null
          sla_due_date: string | null
          sla_policy_id: number | null
          status: string
          subcategory: string | null
          tags: string[] | null
          team: string | null
          tenant_id: number
          ticket_number: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          additional_notes?: string | null
          assignee_id?: string | null
          attachments?: Json | null
          catalog_item_id?: number | null
          category_id?: number | null
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          form_data?: Json | null
          fulfilled_at?: string | null
          id?: number
          is_deleted?: boolean | null
          organisation_id?: string | null
          priority?: string
          queue_id?: number | null
          rejected_at?: string | null
          rejection_reason?: string | null
          request_type?: Database["public"]["Enums"]["request_type"] | null
          requester_id?: string | null
          resolution_comments?: string | null
          resolved_at?: string | null
          sla_breached?: boolean | null
          sla_due_date?: string | null
          sla_policy_id?: number | null
          status?: string
          subcategory?: string | null
          tags?: string[] | null
          team?: string | null
          tenant_id: number
          ticket_number: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          additional_notes?: string | null
          assignee_id?: string | null
          attachments?: Json | null
          catalog_item_id?: number | null
          category_id?: number | null
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          form_data?: Json | null
          fulfilled_at?: string | null
          id?: number
          is_deleted?: boolean | null
          organisation_id?: string | null
          priority?: string
          queue_id?: number | null
          rejected_at?: string | null
          rejection_reason?: string | null
          request_type?: Database["public"]["Enums"]["request_type"] | null
          requester_id?: string | null
          resolution_comments?: string | null
          resolved_at?: string | null
          sla_breached?: boolean | null
          sla_due_date?: string | null
          sla_policy_id?: number | null
          status?: string
          subcategory?: string | null
          tags?: string[] | null
          team?: string | null
          tenant_id?: number
          ticket_number?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "helpdesk_tickets_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "individual_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_tickets_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_tickets_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_tickets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "individual_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_tickets_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_tickets_queue_id_fkey"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_queues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_tickets_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "individual_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_tickets_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_tickets_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_tickets_sla_policy_id_fkey"
            columns: ["sla_policy_id"]
            isOneToOne: false
            referencedRelation: "helpdesk_sla_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "helpdesk_tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: number
          name: string
          organisation_id: string | null
          quantity_on_hand: number | null
          reorder_level: number | null
          sku: string | null
          tenant_id: number
          unit_cost: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: never
          name: string
          organisation_id?: string | null
          quantity_on_hand?: number | null
          reorder_level?: number | null
          sku?: string | null
          tenant_id: number
          unit_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: never
          name?: string
          organisation_id?: string | null
          quantity_on_hand?: number | null
          reorder_level?: number | null
          sku?: string | null
          tenant_id?: number
          unit_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "individual_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_stock: {
        Row: {
          id: number
          item_id: number
          last_counted: string | null
          organisation_id: string | null
          quantity: number | null
          tenant_id: number
          warehouse_id: number
        }
        Insert: {
          id?: never
          item_id: number
          last_counted?: string | null
          organisation_id?: string | null
          quantity?: number | null
          tenant_id: number
          warehouse_id: number
        }
        Update: {
          id?: never
          item_id?: number
          last_counted?: string | null
          organisation_id?: string | null
          quantity?: number | null
          tenant_id?: number
          warehouse_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_stock_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "inventory_warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_warehouses: {
        Row: {
          created_at: string | null
          id: number
          location: string | null
          name: string
          organisation_id: string | null
          tenant_id: number
        }
        Insert: {
          created_at?: string | null
          id?: never
          location?: string | null
          name: string
          organisation_id?: string | null
          tenant_id: number
        }
        Update: {
          created_at?: string | null
          id?: never
          location?: string | null
          name?: string
          organisation_id?: string | null
          tenant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_warehouses_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_warehouses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          metadata: Json | null
          organisation_id: string
          role_id: string | null
          status: string
          token: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          metadata?: Json | null
          organisation_id: string
          role_id?: string | null
          status?: string
          token: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          metadata?: Json | null
          organisation_id?: string
          role_id?: string | null
          status?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          organisation_id: string | null
          period_end: string
          period_start: string
          tenant_id: number | null
          tool_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          organisation_id?: string | null
          period_end: string
          period_start: string
          tenant_id?: number | null
          tool_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          organisation_id?: string | null
          period_end?: string
          period_start?: string
          tenant_id?: number | null
          tool_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_reports: {
        Row: {
          created_at: string | null
          description: string
          email: string | null
          id: string
          phone: string | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          email?: string | null
          id?: string
          phone?: string | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          email?: string | null
          id?: string
          phone?: string | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      itam_asset_assignments: {
        Row: {
          asset_id: number
          assigned_at: string | null
          assigned_by: string | null
          created_at: string | null
          expected_return_at: string | null
          id: number
          is_deleted: boolean | null
          notes: string | null
          return_condition: string | null
          returned_at: string | null
          tenant_id: number
          user_id: string
        }
        Insert: {
          asset_id: number
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          expected_return_at?: string | null
          id?: number
          is_deleted?: boolean | null
          notes?: string | null
          return_condition?: string | null
          returned_at?: string | null
          tenant_id: number
          user_id: string
        }
        Update: {
          asset_id?: number
          assigned_at?: string | null
          assigned_by?: string | null
          created_at?: string | null
          expected_return_at?: string | null
          id?: number
          is_deleted?: boolean | null
          notes?: string | null
          return_condition?: string | null
          returned_at?: string | null
          tenant_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itam_asset_assignments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "itam_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      itam_asset_history: {
        Row: {
          action: string
          asset_id: number
          details: Json | null
          id: number
          performed_at: string | null
          performed_by: string | null
          tenant_id: number
        }
        Insert: {
          action: string
          asset_id: number
          details?: Json | null
          id?: number
          performed_at?: string | null
          performed_by?: string | null
          tenant_id: number
        }
        Update: {
          action?: string
          asset_id?: number
          details?: Json | null
          id?: number
          performed_at?: string | null
          performed_by?: string | null
          tenant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "itam_asset_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "itam_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      itam_asset_tags: {
        Row: {
          asset_id: number
          created_at: string | null
          id: number
          tag_type: string
          tag_value: string
          tenant_id: number
        }
        Insert: {
          asset_id: number
          created_at?: string | null
          id?: number
          tag_type: string
          tag_value: string
          tenant_id: number
        }
        Update: {
          asset_id?: number
          created_at?: string | null
          id?: number
          tag_type?: string
          tag_value?: string
          tenant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "itam_asset_tags_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "itam_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      itam_assets: {
        Row: {
          accumulated_depreciation: number | null
          amc_end: string | null
          asset_configuration: string | null
          asset_id: string | null
          asset_tag: string
          assigned_date: string | null
          assigned_to: string | null
          attachments: string[] | null
          book_value: number | null
          brand: string | null
          category: string | null
          checkout_date: string | null
          checkout_notes: string | null
          classification: string | null
          cost: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          current_depreciation_profile_id: string | null
          department: string | null
          depreciation_status: string | null
          description: string | null
          due_date: string | null
          expected_return_date: string | null
          hostname: string | null
          id: number
          is_deleted: boolean | null
          location: string | null
          mac_address: string | null
          metadata: Json | null
          model: string | null
          name: string
          organisation_id: string | null
          photo_url: string | null
          purchase_date: string | null
          purchase_order_id: number | null
          purchase_price: number | null
          purchased_from: string | null
          serial_number: string | null
          site: string | null
          status: string | null
          tenant_id: number
          type: string
          updated_at: string | null
          updated_by: string | null
          vendor_id: number | null
          warranty_end: string | null
        }
        Insert: {
          accumulated_depreciation?: number | null
          amc_end?: string | null
          asset_configuration?: string | null
          asset_id?: string | null
          asset_tag: string
          assigned_date?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          book_value?: number | null
          brand?: string | null
          category?: string | null
          checkout_date?: string | null
          checkout_notes?: string | null
          classification?: string | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          current_depreciation_profile_id?: string | null
          department?: string | null
          depreciation_status?: string | null
          description?: string | null
          due_date?: string | null
          expected_return_date?: string | null
          hostname?: string | null
          id?: number
          is_deleted?: boolean | null
          location?: string | null
          mac_address?: string | null
          metadata?: Json | null
          model?: string | null
          name: string
          organisation_id?: string | null
          photo_url?: string | null
          purchase_date?: string | null
          purchase_order_id?: number | null
          purchase_price?: number | null
          purchased_from?: string | null
          serial_number?: string | null
          site?: string | null
          status?: string | null
          tenant_id: number
          type: string
          updated_at?: string | null
          updated_by?: string | null
          vendor_id?: number | null
          warranty_end?: string | null
        }
        Update: {
          accumulated_depreciation?: number | null
          amc_end?: string | null
          asset_configuration?: string | null
          asset_id?: string | null
          asset_tag?: string
          assigned_date?: string | null
          assigned_to?: string | null
          attachments?: string[] | null
          book_value?: number | null
          brand?: string | null
          category?: string | null
          checkout_date?: string | null
          checkout_notes?: string | null
          classification?: string | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          current_depreciation_profile_id?: string | null
          department?: string | null
          depreciation_status?: string | null
          description?: string | null
          due_date?: string | null
          expected_return_date?: string | null
          hostname?: string | null
          id?: number
          is_deleted?: boolean | null
          location?: string | null
          mac_address?: string | null
          metadata?: Json | null
          model?: string | null
          name?: string
          organisation_id?: string | null
          photo_url?: string | null
          purchase_date?: string | null
          purchase_order_id?: number | null
          purchase_price?: number | null
          purchased_from?: string | null
          serial_number?: string | null
          site?: string | null
          status?: string | null
          tenant_id?: number
          type?: string
          updated_at?: string | null
          updated_by?: string | null
          vendor_id?: number | null
          warranty_end?: string | null
        }
        Relationships: []
      }
      itam_categories: {
        Row: {
          code: string
          created_at: string | null
          id: number
          is_active: boolean | null
          name: string
          organisation_id: string | null
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          organisation_id?: string | null
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          organisation_id?: string | null
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itam_categories_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itam_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      itam_company_info: {
        Row: {
          address: string | null
          company_code: string | null
          company_name: string
          created_at: string | null
          email: string | null
          id: string
          organisation_id: string | null
          phone: string | null
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company_code?: string | null
          company_name: string
          created_at?: string | null
          email?: string | null
          id?: string
          organisation_id?: string | null
          phone?: string | null
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company_code?: string | null
          company_name?: string
          created_at?: string | null
          email?: string | null
          id?: string
          organisation_id?: string | null
          phone?: string | null
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itam_company_info_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itam_company_info_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      itam_departments: {
        Row: {
          code: string
          created_at: string | null
          id: number
          is_active: boolean | null
          name: string
          organisation_id: string | null
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          organisation_id?: string | null
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          organisation_id?: string | null
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itam_departments_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itam_departments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      itam_license_allocations: {
        Row: {
          allocated_at: string | null
          asset_id: number | null
          created_by: string | null
          id: number
          is_deleted: boolean | null
          license_id: number
          released_at: string | null
          tenant_id: number
          user_id: string | null
        }
        Insert: {
          allocated_at?: string | null
          asset_id?: number | null
          created_by?: string | null
          id?: number
          is_deleted?: boolean | null
          license_id: number
          released_at?: string | null
          tenant_id: number
          user_id?: string | null
        }
        Update: {
          allocated_at?: string | null
          asset_id?: number | null
          created_by?: string | null
          id?: number
          is_deleted?: boolean | null
          license_id?: number
          released_at?: string | null
          tenant_id?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itam_license_allocations_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "itam_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itam_license_allocations_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "itam_licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      itam_licenses: {
        Row: {
          attachments: string[] | null
          created_at: string | null
          expiry_date: string | null
          id: number
          is_deleted: boolean | null
          license_key: string | null
          name: string
          notes: string | null
          organisation_id: string | null
          purchase_date: string | null
          seats_allocated: number
          seats_total: number
          tenant_id: number
          updated_at: string | null
          vendor_id: number | null
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string | null
          expiry_date?: string | null
          id?: number
          is_deleted?: boolean | null
          license_key?: string | null
          name: string
          notes?: string | null
          organisation_id?: string | null
          purchase_date?: string | null
          seats_allocated?: number
          seats_total?: number
          tenant_id: number
          updated_at?: string | null
          vendor_id?: number | null
        }
        Update: {
          attachments?: string[] | null
          created_at?: string | null
          expiry_date?: string | null
          id?: number
          is_deleted?: boolean | null
          license_key?: string | null
          name?: string
          notes?: string | null
          organisation_id?: string | null
          purchase_date?: string | null
          seats_allocated?: number
          seats_total?: number
          tenant_id?: number
          updated_at?: string | null
          vendor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "itam_licenses_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "itam_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      itam_locations: {
        Row: {
          created_at: string | null
          floor: string | null
          id: number
          is_active: boolean | null
          name: string
          organisation_id: string | null
          site_id: number | null
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          floor?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          organisation_id?: string | null
          site_id?: number | null
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          floor?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          organisation_id?: string | null
          site_id?: number | null
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itam_locations_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itam_locations_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "itam_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itam_locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      itam_makes: {
        Row: {
          code: string | null
          created_at: string
          id: number
          is_active: boolean
          name: string
          organisation_id: string | null
          tenant_id: number
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: number
          is_active?: boolean
          name: string
          organisation_id?: string | null
          tenant_id: number
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: number
          is_active?: boolean
          name?: string
          organisation_id?: string | null
          tenant_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "itam_makes_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itam_makes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      itam_purchase_orders: {
        Row: {
          attachments: string[] | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          id: number
          is_deleted: boolean | null
          items: Json | null
          ordered_date: string | null
          organisation_id: string | null
          po_number: string
          received_date: string | null
          status: string | null
          tenant_id: number
          total_amount: number | null
          updated_at: string | null
          updated_by: string | null
          vendor_id: number | null
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: number
          is_deleted?: boolean | null
          items?: Json | null
          ordered_date?: string | null
          organisation_id?: string | null
          po_number: string
          received_date?: string | null
          status?: string | null
          tenant_id: number
          total_amount?: number | null
          updated_at?: string | null
          updated_by?: string | null
          vendor_id?: number | null
        }
        Update: {
          attachments?: string[] | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: number
          is_deleted?: boolean | null
          items?: Json | null
          ordered_date?: string | null
          organisation_id?: string | null
          po_number?: string
          received_date?: string | null
          status?: string | null
          tenant_id?: number
          total_amount?: number | null
          updated_at?: string | null
          updated_by?: string | null
          vendor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "itam_purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "itam_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      itam_repairs: {
        Row: {
          actual_cost: number | null
          asset_id: number
          attachments: string[] | null
          created_by: string | null
          estimated_cost: number | null
          id: number
          is_deleted: boolean | null
          issue_description: string
          opened_at: string | null
          resolved_at: string | null
          status: string | null
          tenant_id: number
          ticket_number: string | null
          updated_at: string | null
          vendor_id: number | null
        }
        Insert: {
          actual_cost?: number | null
          asset_id: number
          attachments?: string[] | null
          created_by?: string | null
          estimated_cost?: number | null
          id?: number
          is_deleted?: boolean | null
          issue_description: string
          opened_at?: string | null
          resolved_at?: string | null
          status?: string | null
          tenant_id: number
          ticket_number?: string | null
          updated_at?: string | null
          vendor_id?: number | null
        }
        Update: {
          actual_cost?: number | null
          asset_id?: number
          attachments?: string[] | null
          created_by?: string | null
          estimated_cost?: number | null
          id?: number
          is_deleted?: boolean | null
          issue_description?: string
          opened_at?: string | null
          resolved_at?: string | null
          status?: string | null
          tenant_id?: number
          ticket_number?: string | null
          updated_at?: string | null
          vendor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "itam_repairs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "itam_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itam_repairs_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "itam_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      itam_settings: {
        Row: {
          id: number
          key: string
          tenant_id: number
          value: Json | null
        }
        Insert: {
          id?: number
          key: string
          tenant_id: number
          value?: Json | null
        }
        Update: {
          id?: number
          key?: string
          tenant_id?: number
          value?: Json | null
        }
        Relationships: []
      }
      itam_sites: {
        Row: {
          address: string | null
          code: string
          created_at: string | null
          id: number
          is_active: boolean | null
          name: string
          organisation_id: string | null
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          organisation_id?: string | null
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          organisation_id?: string | null
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itam_sites_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itam_sites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      itam_tag_format: {
        Row: {
          auto_increment: boolean
          created_at: string | null
          id: string
          organisation_id: string | null
          padding_length: number
          prefix: string
          start_number: string
          updated_at: string | null
        }
        Insert: {
          auto_increment?: boolean
          created_at?: string | null
          id?: string
          organisation_id?: string | null
          padding_length?: number
          prefix?: string
          start_number?: string
          updated_at?: string | null
        }
        Update: {
          auto_increment?: boolean
          created_at?: string | null
          id?: string
          organisation_id?: string | null
          padding_length?: number
          prefix?: string
          start_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itam_tag_format_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      itam_tag_series: {
        Row: {
          category_name: string
          created_at: string | null
          current_number: number | null
          id: string
          is_active: boolean | null
          organisation_id: string | null
          padding_length: number | null
          prefix: string
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          category_name: string
          created_at?: string | null
          current_number?: number | null
          id?: string
          is_active?: boolean | null
          organisation_id?: string | null
          padding_length?: number | null
          prefix: string
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          category_name?: string
          created_at?: string | null
          current_number?: number | null
          id?: string
          is_active?: boolean | null
          organisation_id?: string | null
          padding_length?: number | null
          prefix?: string
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itam_tag_series_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itam_tag_series_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      itam_vendors: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          id: number
          is_deleted: boolean | null
          name: string
          notes: string | null
          organisation_id: string | null
          tenant_id: number
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: number
          is_deleted?: boolean | null
          name: string
          notes?: string | null
          organisation_id?: string | null
          tenant_id: number
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: number
          is_deleted?: boolean | null
          name?: string
          notes?: string | null
          organisation_id?: string | null
          tenant_id?: number
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      license_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string
          created_at: string | null
          id: number
          license_id: number
          notes: string | null
          organisation_id: string | null
          revoked_at: string | null
          tenant_id: number
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to: string
          created_at?: string | null
          id?: number
          license_id: number
          notes?: string | null
          organisation_id?: string | null
          revoked_at?: string | null
          tenant_id: number
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string
          created_at?: string | null
          id?: number
          license_id?: number
          notes?: string | null
          organisation_id?: string | null
          revoked_at?: string | null
          tenant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "license_assignments_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "asset_licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_assignments_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "license_assignments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      monitor_data: {
        Row: {
          cpu_usage: number | null
          disk_usage: number | null
          error_message: string | null
          id: number
          memory_usage: number | null
          metadata: Json | null
          monitor_id: number
          recorded_at: string | null
          response_time: number | null
          status: string | null
        }
        Insert: {
          cpu_usage?: number | null
          disk_usage?: number | null
          error_message?: string | null
          id?: number
          memory_usage?: number | null
          metadata?: Json | null
          monitor_id: number
          recorded_at?: string | null
          response_time?: number | null
          status?: string | null
        }
        Update: {
          cpu_usage?: number | null
          disk_usage?: number | null
          error_message?: string | null
          id?: number
          memory_usage?: number | null
          metadata?: Json | null
          monitor_id?: number
          recorded_at?: string | null
          response_time?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monitor_data_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
        ]
      }
      monitored_machines: {
        Row: {
          created_at: string | null
          id: number
          ip_address: string | null
          last_update_check: string | null
          machine_name: string
          machine_type: string
          organisation_id: string | null
          os_version: string | null
          tenant_id: number
          update_status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          ip_address?: string | null
          last_update_check?: string | null
          machine_name: string
          machine_type?: string
          organisation_id?: string | null
          os_version?: string | null
          tenant_id: number
          update_status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          ip_address?: string | null
          last_update_check?: string | null
          machine_name?: string
          machine_type?: string
          organisation_id?: string | null
          os_version?: string | null
          tenant_id?: number
          update_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monitored_machines_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitored_machines_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_alerts: {
        Row: {
          alert_type: string
          condition: string
          created_at: string | null
          id: number
          is_active: boolean | null
          monitor_id: number | null
          notification_channels: Json | null
          organisation_id: string | null
          service_id: number | null
          severity: string | null
          tenant_id: number
          threshold: number | null
          updated_at: string | null
        }
        Insert: {
          alert_type: string
          condition: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          monitor_id?: number | null
          notification_channels?: Json | null
          organisation_id?: string | null
          service_id?: number | null
          severity?: string | null
          tenant_id: number
          threshold?: number | null
          updated_at?: string | null
        }
        Update: {
          alert_type?: string
          condition?: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          monitor_id?: number | null
          notification_channels?: Json | null
          organisation_id?: string | null
          service_id?: number | null
          severity?: string | null
          tenant_id?: number
          threshold?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_alerts_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_alerts_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_alerts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_incidents: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string | null
          detected_at: string | null
          id: number
          incident_number: string
          monitor_id: number | null
          organisation_id: string | null
          resolved_at: string | null
          service_id: number | null
          severity: string | null
          status: string | null
          tenant_id: number
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          detected_at?: string | null
          id?: number
          incident_number: string
          monitor_id?: number | null
          organisation_id?: string | null
          resolved_at?: string | null
          service_id?: number | null
          severity?: string | null
          status?: string | null
          tenant_id: number
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          detected_at?: string | null
          id?: number
          incident_number?: string
          monitor_id?: number | null
          organisation_id?: string | null
          resolved_at?: string | null
          service_id?: number | null
          severity?: string | null
          status?: string | null
          tenant_id?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_incidents_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_incidents_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_incidents_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_incidents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      monitors: {
        Row: {
          check_interval: number | null
          configuration: Json | null
          created_at: string | null
          created_by: string | null
          endpoint: string | null
          id: number
          is_active: boolean | null
          name: string
          organisation_id: string | null
          tenant_id: number
          timeout: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          check_interval?: number | null
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          endpoint?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          organisation_id?: string | null
          tenant_id: number
          timeout?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          check_interval?: number | null
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          endpoint?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          organisation_id?: string | null
          tenant_id?: number
          timeout?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monitors_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          organisation_id: string | null
          read_at: string | null
          tenant_id: number | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          organisation_id?: string | null
          read_at?: string | null
          tenant_id?: number | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          organisation_id?: string | null
          read_at?: string | null
          tenant_id?: number | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      organisation_users: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string | null
          joined_at: string | null
          organisation_id: string
          role_id: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organisation_id: string
          role_id?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organisation_id?: string
          role_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organisation_users_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organisation_users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          account_type: string | null
          active_tools: string[] | null
          address: string | null
          billing_email: string | null
          created_at: string | null
          domain: string | null
          gst_number: string | null
          id: string
          logo_url: string | null
          name: string
          plan: string | null
          plan_activated_at: string | null
          plan_expires_at: string | null
          plan_id: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          account_type?: string | null
          active_tools?: string[] | null
          address?: string | null
          billing_email?: string | null
          created_at?: string | null
          domain?: string | null
          gst_number?: string | null
          id?: string
          logo_url?: string | null
          name: string
          plan?: string | null
          plan_activated_at?: string | null
          plan_expires_at?: string | null
          plan_id?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          account_type?: string | null
          active_tools?: string[] | null
          address?: string | null
          billing_email?: string | null
          created_at?: string | null
          domain?: string | null
          gst_number?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          plan?: string | null
          plan_activated_at?: string | null
          plan_expires_at?: string | null
          plan_id?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          card_brand: string
          card_exp_month: number
          card_exp_year: number
          card_last4: string
          created_at: string | null
          id: string
          is_default: boolean | null
          organisation_id: string
          stripe_payment_method_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          card_brand: string
          card_exp_month: number
          card_exp_year: number
          card_last4: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          organisation_id: string
          stripe_payment_method_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          card_brand?: string
          card_exp_month?: number
          card_exp_year?: number
          card_last4?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          organisation_id?: string
          stripe_payment_method_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          label: string
          module: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          label: string
          module?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          label?: string
          module?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          selected_tools: string[] | null
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          selected_tools?: string[] | null
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          selected_tools?: string[] | null
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      recovery_verification_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string
          id: string
          type: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          type: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          type?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          organisation_id: string
          role_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          organisation_id: string
          role_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          organisation_id?: string
          role_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_api_keys: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          organisation_id: string | null
          scopes: string[] | null
          token: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          organisation_id?: string | null
          scopes?: string[] | null
          token: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          organisation_id?: string | null
          scopes?: string[] | null
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saas_api_keys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "saas_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saas_api_keys_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "saas_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_billing_history: {
        Row: {
          amount: number
          bill_period_end: string
          bill_period_start: string
          created_at: string | null
          id: string
          invoice_url: string | null
          organisation_id: string | null
          payment_provider: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          bill_period_end: string
          bill_period_start: string
          created_at?: string | null
          id?: string
          invoice_url?: string | null
          organisation_id?: string | null
          payment_provider?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bill_period_end?: string
          bill_period_start?: string
          created_at?: string | null
          id?: string
          invoice_url?: string | null
          organisation_id?: string | null
          payment_provider?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saas_billing_history_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "saas_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          enabled_for_orgs: string[] | null
          enabled_for_plans: string[] | null
          feature_key: string
          feature_name: string
          id: string
          is_global_enabled: boolean | null
          rollout_percentage: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled_for_orgs?: string[] | null
          enabled_for_plans?: string[] | null
          feature_key: string
          feature_name: string
          id?: string
          is_global_enabled?: boolean | null
          rollout_percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled_for_orgs?: string[] | null
          enabled_for_plans?: string[] | null
          feature_key?: string
          feature_name?: string
          id?: string
          is_global_enabled?: boolean | null
          rollout_percentage?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      saas_org_user_links: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          org_role: string | null
          organisation_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          org_role?: string | null
          organisation_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          org_role?: string | null
          organisation_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saas_org_user_links_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "saas_organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saas_org_user_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "saas_users"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_organisations: {
        Row: {
          active_users_count: number | null
          billing_cycle: string | null
          created_at: string | null
          custom_domain: string | null
          id: string
          logo_url: string | null
          max_users_allowed: number | null
          name: string
          next_billing_date: string | null
          onboarding_completed: boolean | null
          plan_name: string | null
          status: string | null
          stripe_customer_id: string | null
          subscription_plan_id: string | null
          updated_at: string | null
        }
        Insert: {
          active_users_count?: number | null
          billing_cycle?: string | null
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          logo_url?: string | null
          max_users_allowed?: number | null
          name: string
          next_billing_date?: string | null
          onboarding_completed?: boolean | null
          plan_name?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          subscription_plan_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active_users_count?: number | null
          billing_cycle?: string | null
          created_at?: string | null
          custom_domain?: string | null
          id?: string
          logo_url?: string | null
          max_users_allowed?: number | null
          name?: string
          next_billing_date?: string | null
          onboarding_completed?: boolean | null
          plan_name?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          subscription_plan_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saas_organisations_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_system_logs: {
        Row: {
          description: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          metadata: Json | null
          performed_by: string | null
          timestamp: string | null
        }
        Insert: {
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          timestamp?: string | null
        }
        Update: {
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          performed_by?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saas_system_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "saas_users"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_usage_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_type: string
          metric_unit: string | null
          metric_value: number
          organisation_id: string | null
          recorded_at: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_unit?: string | null
          metric_value: number
          organisation_id?: string | null
          recorded_at?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_unit?: string | null
          metric_value?: number
          organisation_id?: string | null
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saas_usage_metrics_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "saas_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string
          global_status: string | null
          id: string
          last_login_at: string | null
          multi_org: boolean | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          global_status?: string | null
          id?: string
          last_login_at?: string | null
          multi_org?: boolean | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          global_status?: string | null
          id?: string
          last_login_at?: string | null
          multi_org?: boolean | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      saas_webhooks: {
        Row: {
          created_at: string | null
          event_triggers: string[] | null
          id: string
          last_triggered_at: string | null
          organisation_id: string | null
          retry_count: number | null
          secret: string
          status: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          event_triggers?: string[] | null
          id?: string
          last_triggered_at?: string | null
          organisation_id?: string | null
          retry_count?: number | null
          secret: string
          status?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          event_triggers?: string[] | null
          id?: string
          last_triggered_at?: string | null
          organisation_id?: string | null
          retry_count?: number | null
          secret?: string
          status?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_webhooks_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "saas_organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_worker_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          job_type: string
          last_error: string | null
          max_retries: number | null
          payload: Json | null
          retries: number | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          job_type: string
          last_error?: string | null
          max_retries?: number | null
          payload?: Json | null
          retries?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          job_type?: string
          last_error?: string | null
          max_retries?: number | null
          payload?: Json | null
          retries?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_health: {
        Row: {
          checked_at: string | null
          error_message: string | null
          id: number
          response_time: number | null
          service_id: number
          status: string
        }
        Insert: {
          checked_at?: string | null
          error_message?: string | null
          id?: number
          response_time?: number | null
          service_id: number
          status: string
        }
        Update: {
          checked_at?: string | null
          error_message?: string | null
          id?: number
          response_time?: number | null
          service_id?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_health_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          last_check: string | null
          name: string
          organisation_id: string | null
          service_type: string | null
          status: string | null
          tenant_id: number
          updated_at: string | null
          uptime_percentage: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          last_check?: string | null
          name: string
          organisation_id?: string | null
          service_type?: string | null
          status?: string | null
          tenant_id: number
          updated_at?: string | null
          uptime_percentage?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          last_check?: string | null
          name?: string
          organisation_id?: string | null
          service_type?: string | null
          status?: string | null
          tenant_id?: number
          updated_at?: string | null
          uptime_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "services_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      srm_approvals: {
        Row: {
          approver_id: string
          comments: string | null
          created_at: string | null
          id: number
          request_id: number
          status: string
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          approver_id: string
          comments?: string | null
          created_at?: string | null
          id?: number
          request_id: number
          status?: string
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          approver_id?: string
          comments?: string | null
          created_at?: string | null
          id?: number
          request_id?: number
          status?: string
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "srm_approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "individual_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "srm_approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "srm_approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "srm_approvals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      srm_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: number
          is_internal: boolean | null
          request_id: number
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: never
          is_internal?: boolean | null
          request_id: number
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: never
          is_internal?: boolean | null
          request_id?: number
          user_id?: string
        }
        Relationships: []
      }
      srm_sla_policies: {
        Row: {
          created_at: string | null
          fulfillment_time_minutes: number
          id: string
          is_active: boolean | null
          name: string
          priority: string
          response_time_minutes: number
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fulfillment_time_minutes: number
          id?: string
          is_active?: boolean | null
          name: string
          priority: string
          response_time_minutes: number
          tenant_id?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fulfillment_time_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: string
          response_time_minutes?: number
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_deleted: boolean | null
          notes: string | null
          resolved: boolean | null
          resolved_date: string | null
          subscription_id: string | null
          tenant_id: number
          trigger_date: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          notes?: string | null
          resolved?: boolean | null
          resolved_date?: string | null
          subscription_id?: string | null
          tenant_id: number
          trigger_date?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          notes?: string | null
          resolved?: boolean | null
          resolved_date?: string | null
          subscription_id?: string | null
          tenant_id?: number
          trigger_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_alerts_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_deleted: boolean | null
          name: string
          tenant_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_deleted?: boolean | null
          name: string
          tenant_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_deleted?: boolean | null
          name?: string
          tenant_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscription_cost_history: {
        Row: {
          billing_period_end: string
          billing_period_start: string
          cost: number
          created_at: string
          currency: string
          id: string
          invoice_number: string | null
          is_deleted: boolean | null
          paid_date: string | null
          subscription_id: string
          tenant_id: number
        }
        Insert: {
          billing_period_end: string
          billing_period_start: string
          cost: number
          created_at?: string
          currency?: string
          id?: string
          invoice_number?: string | null
          is_deleted?: boolean | null
          paid_date?: string | null
          subscription_id: string
          tenant_id: number
        }
        Update: {
          billing_period_end?: string
          billing_period_start?: string
          cost?: number
          created_at?: string
          currency?: string
          id?: string
          invoice_number?: string | null
          is_deleted?: boolean | null
          paid_date?: string | null
          subscription_id?: string
          tenant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "subscription_cost_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          features: Json
          id: string
          max_storage_mb: number | null
          max_tools: number
          max_users: number
          monthly_price: number
          plan_name: string
          plan_tier: string | null
          sort_order: number | null
          updated_at: string | null
          yearly_price: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          features?: Json
          id?: string
          max_storage_mb?: number | null
          max_tools?: number
          max_users?: number
          monthly_price?: number
          plan_name: string
          plan_tier?: string | null
          sort_order?: number | null
          updated_at?: string | null
          yearly_price?: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          features?: Json
          id?: string
          max_storage_mb?: number | null
          max_tools?: number
          max_users?: number
          monthly_price?: number
          plan_name?: string
          plan_tier?: string | null
          sort_order?: number | null
          updated_at?: string | null
          yearly_price?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          next_billing_date: string | null
          organisation_id: string
          period: string | null
          plan_id: string | null
          plan_name: string
          renewal_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          next_billing_date?: string | null
          organisation_id: string
          period?: string | null
          plan_id?: string | null
          plan_name: string
          renewal_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          next_billing_date?: string | null
          organisation_id?: string
          period?: string | null
          plan_id?: string | null
          plan_name?: string
          renewal_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions_licenses: {
        Row: {
          assigned_date: string | null
          assigned_to_device_id: string | null
          assigned_to_user_id: string | null
          created_at: string | null
          created_by: string | null
          expiry_date: string | null
          id: string
          license_key: string | null
          organisation_id: string
          status: string | null
          tool_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_date?: string | null
          assigned_to_device_id?: string | null
          assigned_to_user_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          license_key?: string | null
          organisation_id: string
          status?: string | null
          tool_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_date?: string | null
          assigned_to_device_id?: string | null
          assigned_to_user_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          license_key?: string | null
          organisation_id?: string
          status?: string | null
          tool_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_licenses_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "individual_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_licenses_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_licenses_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_licenses_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_licenses_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "subscriptions_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions_payments: {
        Row: {
          amount: number
          billing_period_end: string
          billing_period_start: string
          created_at: string | null
          created_by: string | null
          currency: string | null
          id: string
          invoice_url: string | null
          organisation_id: string
          payment_date: string | null
          payment_method: string | null
          status: string | null
          tool_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          billing_period_end: string
          billing_period_start: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          invoice_url?: string | null
          organisation_id: string
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
          tool_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          invoice_url?: string | null
          organisation_id?: string
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
          tool_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_payments_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_payments_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "subscriptions_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions_reminders: {
        Row: {
          created_at: string | null
          id: string
          message: string
          organisation_id: string
          reminder_date: string
          reminder_type: string | null
          tool_id: string
          triggered: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          organisation_id: string
          reminder_date: string
          reminder_type?: string | null
          tool_id: string
          triggered?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          organisation_id?: string
          reminder_date?: string
          reminder_type?: string | null
          tool_id?: string
          triggered?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_reminders_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_reminders_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "subscriptions_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions_tools: {
        Row: {
          auto_renew: boolean | null
          billing_cycle_months: number | null
          category: string | null
          category_id: string | null
          contract_file_id: string | null
          cost: number
          created_at: string | null
          created_by: string | null
          currency: string | null
          department_id: string | null
          id: string
          invoice_folder_id: string | null
          license_count: number | null
          next_billing_date: string | null
          notes: string | null
          organisation_id: string
          renewal_date: string | null
          status: string | null
          subscription_type: string | null
          tool_name: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          billing_cycle_months?: number | null
          category?: string | null
          category_id?: string | null
          contract_file_id?: string | null
          cost?: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          department_id?: string | null
          id?: string
          invoice_folder_id?: string | null
          license_count?: number | null
          next_billing_date?: string | null
          notes?: string | null
          organisation_id: string
          renewal_date?: string | null
          status?: string | null
          subscription_type?: string | null
          tool_name: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          billing_cycle_months?: number | null
          category?: string | null
          category_id?: string | null
          contract_file_id?: string | null
          cost?: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          department_id?: string | null
          id?: string
          invoice_folder_id?: string | null
          license_count?: number | null
          next_billing_date?: string | null
          notes?: string | null
          organisation_id?: string
          renewal_date?: string | null
          status?: string | null
          subscription_type?: string | null
          tool_name?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_tools_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "subscription_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tools_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_tools_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "subscriptions_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions_vendors: {
        Row: {
          address: Json | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          notes: string | null
          organisation_id: string
          phone: string | null
          updated_at: string | null
          vendor_name: string
          website: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          organisation_id: string
          phone?: string | null
          updated_at?: string | null
          vendor_name: string
          website?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          organisation_id?: string
          phone?: string | null
          updated_at?: string | null
          vendor_name?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_vendors_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admin_users: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          permissions: string[] | null
          role: Database["public"]["Enums"]["super_admin_role"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: string[] | null
          role: Database["public"]["Enums"]["super_admin_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: string[] | null
          role?: Database["public"]["Enums"]["super_admin_role"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_devices: {
        Row: {
          created_at: string
          device_name: string
          device_uuid: string
          failed_updates_count: number | null
          id: string
          is_deleted: boolean | null
          last_seen: string | null
          last_update_install: string | null
          last_update_scan: string | null
          notes: string | null
          os_build: string | null
          os_type: string
          os_version: string | null
          pending_critical_count: number | null
          pending_total_count: number | null
          tenant_id: number
          update_compliance_status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_name: string
          device_uuid: string
          failed_updates_count?: number | null
          id?: string
          is_deleted?: boolean | null
          last_seen?: string | null
          last_update_install?: string | null
          last_update_scan?: string | null
          notes?: string | null
          os_build?: string | null
          os_type: string
          os_version?: string | null
          pending_critical_count?: number | null
          pending_total_count?: number | null
          tenant_id: number
          update_compliance_status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_name?: string
          device_uuid?: string
          failed_updates_count?: number | null
          id?: string
          is_deleted?: boolean | null
          last_seen?: string | null
          last_update_install?: string | null
          last_update_scan?: string | null
          notes?: string | null
          os_build?: string | null
          os_type?: string
          os_version?: string | null
          pending_critical_count?: number | null
          pending_total_count?: number | null
          tenant_id?: number
          update_compliance_status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_installed_updates: {
        Row: {
          created_at: string
          device_id: string
          id: string
          install_date: string
          install_method: string | null
          kb_number: string
          status: string | null
          tenant_id: number
          title: string
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          install_date: string
          install_method?: string | null
          kb_number: string
          status?: string | null
          tenant_id: number
          title: string
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          install_date?: string
          install_method?: string | null
          kb_number?: string
          status?: string | null
          tenant_id?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_installed_updates_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "system_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      system_pending_updates: {
        Row: {
          classification: string | null
          created_at: string
          detected_at: string
          device_id: string
          download_size_mb: number | null
          id: string
          is_deleted: boolean | null
          kb_number: string
          release_date: string | null
          restart_required: boolean | null
          severity: string | null
          tenant_id: number
          title: string
        }
        Insert: {
          classification?: string | null
          created_at?: string
          detected_at?: string
          device_id: string
          download_size_mb?: number | null
          id?: string
          is_deleted?: boolean | null
          kb_number: string
          release_date?: string | null
          restart_required?: boolean | null
          severity?: string | null
          tenant_id: number
          title: string
        }
        Update: {
          classification?: string | null
          created_at?: string
          detected_at?: string
          device_id?: string
          download_size_mb?: number | null
          id?: string
          is_deleted?: boolean | null
          kb_number?: string
          release_date?: string | null
          restart_required?: boolean | null
          severity?: string | null
          tenant_id?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_pending_updates_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "system_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      system_update_alerts: {
        Row: {
          alert_type: string
          created_at: string
          device_id: string | null
          id: string
          message: string
          resolved: boolean | null
          resolved_at: string | null
          severity: string
          tenant_id: number
        }
        Insert: {
          alert_type: string
          created_at?: string
          device_id?: string | null
          id?: string
          message: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity: string
          tenant_id: number
        }
        Update: {
          alert_type?: string
          created_at?: string
          device_id?: string | null
          id?: string
          message?: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string
          tenant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "system_update_alerts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "system_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      system_update_history: {
        Row: {
          attempt_number: number | null
          device_id: string
          error_code: string | null
          id: string
          is_deleted: boolean | null
          kb_number: string
          logs: string | null
          performed_at: string
          status: string
          tenant_id: number
        }
        Insert: {
          attempt_number?: number | null
          device_id: string
          error_code?: string | null
          id?: string
          is_deleted?: boolean | null
          kb_number: string
          logs?: string | null
          performed_at?: string
          status: string
          tenant_id: number
        }
        Update: {
          attempt_number?: number | null
          device_id?: string
          error_code?: string | null
          id?: string
          is_deleted?: boolean | null
          kb_number?: string
          logs?: string | null
          performed_at?: string
          status?: string
          tenant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "system_update_history_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "system_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      system_update_ingest_logs: {
        Row: {
          device_id: string | null
          id: string
          ingested_at: string
          payload: Json
          tenant_id: number
        }
        Insert: {
          device_id?: string | null
          id?: string
          ingested_at?: string
          payload: Json
          tenant_id: number
        }
        Update: {
          device_id?: string | null
          id?: string
          ingested_at?: string
          payload?: Json
          tenant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "system_update_ingest_logs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "system_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      system_updates: {
        Row: {
          available_version: string | null
          created_at: string | null
          current_version: string | null
          id: number
          install_date: string | null
          machine_id: number | null
          organisation_id: string | null
          severity: string | null
          status: string | null
          tenant_id: number
          update_kb: string | null
          update_name: string
          update_type: string
          updated_at: string | null
        }
        Insert: {
          available_version?: string | null
          created_at?: string | null
          current_version?: string | null
          id?: number
          install_date?: string | null
          machine_id?: number | null
          organisation_id?: string | null
          severity?: string | null
          status?: string | null
          tenant_id: number
          update_kb?: string | null
          update_name: string
          update_type: string
          updated_at?: string | null
        }
        Update: {
          available_version?: string | null
          created_at?: string | null
          current_version?: string | null
          id?: number
          install_date?: string | null
          machine_id?: number | null
          organisation_id?: string | null
          severity?: string | null
          status?: string | null
          tenant_id?: number
          update_kb?: string | null
          update_name?: string
          update_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_updates_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "monitored_machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_updates_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_updates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      team_groups: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
          organisation_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          organisation_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          organisation_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_groups_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          added_at: string | null
          added_by: string
          id: string
          role: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          added_at?: string | null
          added_by: string
          id?: string
          role?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          added_at?: string | null
          added_by?: string
          id?: string
          role?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          domain: string | null
          id: number
          name: string
          status: string | null
          subscription_plan: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: never
          name: string
          status?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: never
          name?: string
          status?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: number
          organisation_id: string | null
          priority: string | null
          reporter_id: string | null
          status: string | null
          tenant_id: number
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: never
          organisation_id?: string | null
          priority?: string | null
          reporter_id?: string | null
          status?: string | null
          tenant_id: number
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: never
          organisation_id?: string | null
          priority?: string | null
          reporter_id?: string | null
          status?: string | null
          tenant_id?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "individual_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_inactive_notices: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          message: string
          title: string
          tool_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          title: string
          tool_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          title?: string
          tool_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tool"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          key: string
          monthly_price: number | null
          name: string
          price: number | null
          updated_at: string | null
          yearly_price: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          monthly_price?: number | null
          name: string
          price?: number | null
          updated_at?: string | null
          yearly_price?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          monthly_price?: number | null
          name?: string
          price?: number | null
          updated_at?: string | null
          yearly_price?: number | null
        }
        Relationships: []
      }
      units_of_production_log: {
        Row: {
          asset_id: number
          created_at: string | null
          id: string
          profile_id: string
          tenant_id: number
          units_consumed: number
          usage_period: string
        }
        Insert: {
          asset_id: number
          created_at?: string | null
          id?: string
          profile_id: string
          tenant_id: number
          units_consumed: number
          usage_period: string
        }
        Update: {
          asset_id?: number
          created_at?: string | null
          id?: string
          profile_id?: string
          tenant_id?: number
          units_consumed?: number
          usage_period?: string
        }
        Relationships: []
      }
      update_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          device_id: string | null
          id: string
          is_read: boolean | null
          job_id: string | null
          message: string | null
          organisation_id: string | null
          read_at: string | null
          read_by: string | null
          severity: string | null
          tenant_id: number
          ticket_id: number | null
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_read?: boolean | null
          job_id?: string | null
          message?: string | null
          organisation_id?: string | null
          read_at?: string | null
          read_by?: string | null
          severity?: string | null
          tenant_id: number
          ticket_id?: number | null
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_read?: boolean | null
          job_id?: string | null
          message?: string | null
          organisation_id?: string | null
          read_at?: string | null
          read_by?: string | null
          severity?: string | null
          tenant_id?: number
          ticket_id?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "update_alerts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "update_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_alerts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "update_rollout_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_alerts_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      update_completions: {
        Row: {
          completed_at: string | null
          completed_by: string
          completion_month: string
          created_at: string | null
          device_id: string
          id: string
          is_manual: boolean | null
          notes: string | null
          organisation_id: string | null
          tenant_id: number
        }
        Insert: {
          completed_at?: string | null
          completed_by: string
          completion_month: string
          created_at?: string | null
          device_id: string
          id?: string
          is_manual?: boolean | null
          notes?: string | null
          organisation_id?: string | null
          tenant_id: number
        }
        Update: {
          completed_at?: string | null
          completed_by?: string
          completion_month?: string
          created_at?: string | null
          device_id?: string
          id?: string
          is_manual?: boolean | null
          notes?: string | null
          organisation_id?: string | null
          tenant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "update_completions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "update_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_completions_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_completions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      update_devices: {
        Row: {
          asset_id: number
          asset_tag: string | null
          created_at: string | null
          department: string | null
          device_name: string
          device_type: string
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          last_update_check: string | null
          location: string | null
          metadata: Json | null
          organisation_id: string | null
          os_name: string | null
          os_version: string | null
          owner_id: string | null
          owner_name: string | null
          pending_updates_count: number | null
          tenant_id: number
          update_status: string | null
          updated_at: string | null
        }
        Insert: {
          asset_id: number
          asset_tag?: string | null
          created_at?: string | null
          department?: string | null
          device_name: string
          device_type: string
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          last_update_check?: string | null
          location?: string | null
          metadata?: Json | null
          organisation_id?: string | null
          os_name?: string | null
          os_version?: string | null
          owner_id?: string | null
          owner_name?: string | null
          pending_updates_count?: number | null
          tenant_id: number
          update_status?: string | null
          updated_at?: string | null
        }
        Update: {
          asset_id?: number
          asset_tag?: string | null
          created_at?: string | null
          department?: string | null
          device_name?: string
          device_type?: string
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          last_update_check?: string | null
          location?: string | null
          metadata?: Json | null
          organisation_id?: string | null
          os_name?: string | null
          os_version?: string | null
          owner_id?: string | null
          owner_name?: string | null
          pending_updates_count?: number | null
          tenant_id?: number
          update_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "update_devices_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_devices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      update_job_devices: {
        Row: {
          completed_at: string | null
          created_at: string | null
          device_id: string
          error_message: string | null
          id: string
          job_id: string
          logs: Json | null
          progress: number | null
          retry_count: number | null
          started_at: string | null
          status: string | null
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          device_id: string
          error_message?: string | null
          id?: string
          job_id: string
          logs?: Json | null
          progress?: number | null
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          device_id?: string
          error_message?: string | null
          id?: string
          job_id?: string
          logs?: Json | null
          progress?: number | null
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "update_job_devices_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "update_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_job_devices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "update_rollout_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_job_devices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      update_rollout_jobs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          auto_reboot: boolean | null
          completed_at: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          job_type: string | null
          maintenance_window_end: string | null
          maintenance_window_start: string | null
          max_retries: number | null
          name: string
          organisation_id: string | null
          requires_approval: boolean | null
          rollback_on_failure: boolean | null
          scheduled_at: string | null
          started_at: string | null
          status: string | null
          target_filter: Json | null
          target_type: string | null
          tenant_id: number
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          auto_reboot?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          job_type?: string | null
          maintenance_window_end?: string | null
          maintenance_window_start?: string | null
          max_retries?: number | null
          name: string
          organisation_id?: string | null
          requires_approval?: boolean | null
          rollback_on_failure?: boolean | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          target_filter?: Json | null
          target_type?: string | null
          tenant_id: number
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          auto_reboot?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          job_type?: string | null
          maintenance_window_end?: string | null
          maintenance_window_start?: string | null
          max_retries?: number | null
          name?: string
          organisation_id?: string | null
          requires_approval?: boolean | null
          rollback_on_failure?: boolean | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string | null
          target_filter?: Json | null
          target_type?: string | null
          tenant_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "update_rollout_jobs_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_rollout_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mfa_settings: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          enabled_at: string | null
          id: string
          is_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled_at?: string | null
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          enabled_at?: string | null
          id?: string
          is_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_org_map: {
        Row: {
          created_at: string | null
          id: string
          organisation_id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organisation_id: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organisation_id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_org_map_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "individual_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_recovery_options: {
        Row: {
          created_at: string
          id: string
          recovery_email: string | null
          recovery_email_verified: boolean | null
          recovery_phone: string | null
          recovery_phone_verified: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recovery_email?: string | null
          recovery_email_verified?: boolean | null
          recovery_phone?: string | null
          recovery_phone_verified?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recovery_email?: string | null
          recovery_email_verified?: boolean | null
          recovery_phone?: string | null
          recovery_phone_verified?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tenant_id?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown
          login_time: string | null
          logout_time: string | null
          session_data: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          login_time?: string | null
          logout_time?: string | null
          session_data?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          login_time?: string | null
          logout_time?: string | null
          session_data?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_tools: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          tool_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          tool_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tools_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "individual_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tools_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tools_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tools_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "individual_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tools_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "organization_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tools_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string
          id: string
          is_superadmin: boolean | null
          last_login: string | null
          name: string | null
          organisation_id: string
          phone: string | null
          role: string | null
          status: string | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_superadmin?: boolean | null
          last_login?: string | null
          name?: string | null
          organisation_id: string
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_superadmin?: boolean | null
          last_login?: string | null
          name?: string | null
          organisation_id?: string
          phone?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "users_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      individual_users: {
        Row: {
          account_name: string | null
          auth_user_id: string | null
          created_at: string | null
          email: string | null
          id: string | null
          is_superadmin: boolean | null
          last_login: string | null
          name: string | null
          organisation_id: string | null
          phone: string | null
          role: string | null
          status: string | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "users_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_users: {
        Row: {
          account_type: string | null
          auth_user_id: string | null
          created_at: string | null
          email: string | null
          id: string | null
          is_superadmin: boolean | null
          last_login: string | null
          name: string | null
          organisation_id: string | null
          organisation_name: string | null
          phone: string | null
          role: string | null
          status: string | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "users_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auth_organisation_id: { Args: never; Returns: string }
      bulk_soft_delete_problems: {
        Args: { problem_ids: number[] }
        Returns: undefined
      }
      bulk_soft_delete_tickets: {
        Args: { ticket_ids: number[] }
        Returns: undefined
      }
      calculate_sla_due_date: {
        Args: {
          org_id?: string
          tenant_id_param?: number
          ticket_priority: string
        }
        Returns: string
      }
      can_activate_tool: { Args: { org_id: string }; Returns: boolean }
      can_add_user: { Args: { org_id: string }; Returns: boolean }
      can_enable_tool: { Args: { org_id: string }; Returns: boolean }
      can_invite_user: { Args: { org_id: string }; Returns: boolean }
      check_and_flag_sla_breaches: { Args: never; Returns: undefined }
      check_sla_breach: { Args: never; Returns: undefined }
      check_subscription_expiry: { Args: never; Returns: undefined }
      check_subscription_limit: {
        Args: { limit_type: string; org_id: string }
        Returns: boolean
      }
      clean_expired_recovery_codes: { Args: never; Returns: undefined }
      create_notification: {
        Args: {
          p_message: string
          p_organisation_id?: string
          p_tenant_id?: number
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: string
      }
      generate_asset_tag: { Args: { tenant_id_param: number }; Returns: string }
      generate_change_number: {
        Args: { p_org_id: string; p_tenant_id: number }
        Returns: string
      }
      generate_change_request_number: {
        Args: { p_tenant_id: number }
        Returns: string
      }
      generate_helpdesk_ticket_number: {
        Args: { p_org_id: string; p_tenant_id: number }
        Returns: string
      }
      generate_invitation_token: { Args: never; Returns: string }
      generate_problem_number: {
        Args: { p_org_id: string; p_tenant_id: number }
        Returns: string
      }
      generate_srm_request_number: {
        Args: { p_org_id: string; p_tenant_id: number }
        Returns: string
      }
      generate_unified_request_number: {
        Args: {
          p_org_id: string
          p_request_type: Database["public"]["Enums"]["request_type"]
          p_tenant_id: number
        }
        Returns: string
      }
      get_appmaster_admin_details: {
        Args: never
        Returns: {
          admin_role: string
          created_at: string
          created_by: string
          email: string
          id: string
          is_active: boolean
          last_login: string
          name: string
          permissions: Json
          status: string
          updated_at: string
          user_id: string
        }[]
      }
      get_appmaster_role: { Args: { _user_id: string }; Returns: string }
      get_current_subscription: {
        Args: { org_id: string }
        Returns: {
          features: Json
          id: string
          max_tools: number
          max_users: number
          next_billing_date: string
          plan_id: string
          plan_name: string
          renewal_date: string
          status: string
        }[]
      }
      get_license_usage: {
        Args: { tool_id_param: string }
        Returns: {
          assigned_licenses: number
          available_licenses: number
          total_licenses: number
          usage_percentage: number
        }[]
      }
      get_monthly_burn_rate: { Args: { org_id: string }; Returns: number }
      get_next_asset_number: {
        Args: { p_organisation_id: string }
        Returns: number
      }
      get_next_asset_tags: {
        Args: { p_limit?: number; p_organisation_id: string }
        Returns: {
          category_name: string
          suggested_tags: string[]
        }[]
      }
      get_subscription_limits: {
        Args: { org_id: string }
        Returns: {
          current_tools: number
          current_users: number
          days_until_renewal: number
          features: Json
          max_tools: number
          max_users: number
          status: string
        }[]
      }
      get_upcoming_renewals: {
        Args: { days_ahead?: number; org_id: string }
        Returns: {
          cost: number
          days_until_renewal: number
          renewal_date: string
          tool_id: string
          tool_name: string
          vendor_name: string
        }[]
      }
      get_user_account_type: { Args: never; Returns: string }
      get_user_org: { Args: never; Returns: string }
      get_user_org_fallback: { Args: never; Returns: string }
      get_user_org_if_admin: { Args: never; Returns: string }
      get_user_org_role: { Args: { _org_id: string }; Returns: string }
      get_user_tenant: { Args: { _user_id: string }; Returns: number }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_feature: {
        Args: { feature_key: string; org_id: string }
        Returns: boolean
      }
      has_feature_access: {
        Args: { feature_key: string; org_id: string }
        Returns: boolean
      }
      has_org_access: { Args: { _org_id: string }; Returns: boolean }
      has_permission: {
        Args: { permission_key: string; user_id_param: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_super_admin_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      is_appmaster_admin: { Args: { _user_id: string }; Returns: boolean }
      is_org_admin_user: { Args: never; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin_user: { Args: never; Returns: boolean }
      soft_delete_problem: {
        Args: { problem_id_param: number }
        Returns: undefined
      }
      soft_delete_ticket: {
        Args: { ticket_id_param: number }
        Returns: undefined
      }
      user_belongs_to_org_or_tenant: {
        Args: { _organisation_id: string; _tenant_id: number }
        Returns: boolean
      }
      user_has_tool_access: {
        Args: { tool_key: string; user_auth_id: string }
        Returns: boolean
      }
      verify_account_type: {
        Args: { _account_type: string; _email: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "manager" | "staff" | "viewer"
      broadcast_target_audience:
        | "individual_users"
        | "organization_admins"
        | "organization_users"
        | "all_users"
      notification_type:
        | "profile_update"
        | "role_change"
        | "ticket_created"
        | "ticket_updated"
        | "system_alert"
        | "broadcast"
        | "general"
      request_type: "ticket" | "service_request"
      super_admin_role:
        | "super_admin"
        | "saas_manager"
        | "saas_support_agent"
        | "billing_manager"
        | "read_only_auditor"
      user_type: "individual" | "organization" | "appmaster_admin"
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
      app_role: ["owner", "admin", "manager", "staff", "viewer"],
      broadcast_target_audience: [
        "individual_users",
        "organization_admins",
        "organization_users",
        "all_users",
      ],
      notification_type: [
        "profile_update",
        "role_change",
        "ticket_created",
        "ticket_updated",
        "system_alert",
        "broadcast",
        "general",
      ],
      request_type: ["ticket", "service_request"],
      super_admin_role: [
        "super_admin",
        "saas_manager",
        "saas_support_agent",
        "billing_manager",
        "read_only_auditor",
      ],
      user_type: ["individual", "organization", "appmaster_admin"],
    },
  },
} as const
