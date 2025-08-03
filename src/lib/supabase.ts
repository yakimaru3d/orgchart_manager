import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          subdomain: string;
          subscription_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subdomain: string;
          subscription_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          subdomain?: string;
          subscription_status?: string;
          updated_at?: string;
        };
      };
      employees: {
        Row: {
          id: string;
          tenant_id: string;
          employee_id: string;
          first_name: string;
          last_name: string;
          email: string;
          join_date: string;
          department: string;
          position: string;
          manager_id: string | null;
          profile_image: string | null;
          phone_number: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          employee_id: string;
          first_name: string;
          last_name: string;
          email: string;
          join_date: string;
          department: string;
          position: string;
          manager_id?: string | null;
          profile_image?: string | null;
          phone_number?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          email?: string;
          department?: string;
          position?: string;
          manager_id?: string | null;
          profile_image?: string | null;
          phone_number?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      recruitment_plans: {
        Row: {
          id: string;
          tenant_id: string;
          position_title: string;
          department: string;
          reporting_manager_id: string | null;
          required_skills: string[];
          estimated_salary: number;
          target_hire_date: string;
          urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
          reason: 'EXPANSION' | 'REPLACEMENT' | 'NEW_INITIATIVE';
          status: 'PLANNED' | 'APPROVED' | 'IN_PROGRESS' | 'HIRED' | 'CANCELLED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          position_title: string;
          department: string;
          reporting_manager_id?: string | null;
          required_skills?: string[];
          estimated_salary: number;
          target_hire_date: string;
          urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
          reason?: 'EXPANSION' | 'REPLACEMENT' | 'NEW_INITIATIVE';
          status?: 'PLANNED' | 'APPROVED' | 'IN_PROGRESS' | 'HIRED' | 'CANCELLED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          position_title?: string;
          department?: string;
          reporting_manager_id?: string | null;
          required_skills?: string[];
          estimated_salary?: number;
          target_hire_date?: string;
          urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
          reason?: 'EXPANSION' | 'REPLACEMENT' | 'NEW_INITIATIVE';
          status?: 'PLANNED' | 'APPROVED' | 'IN_PROGRESS' | 'HIRED' | 'CANCELLED';
          updated_at?: string;
        };
      };
      departments: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          parent_id: string | null;
          manager_id: string | null;
          level: number;
          description: string | null;
          color: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          parent_id?: string | null;
          manager_id?: string | null;
          level?: number;
          description?: string | null;
          color?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          parent_id?: string | null;
          manager_id?: string | null;
          level?: number;
          description?: string | null;
          color?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      employee_history: {
        Row: {
          id: string;
          tenant_id: string;
          employee_id: string;
          type: 'DEPARTMENT_CHANGE' | 'POSITION_CHANGE' | 'PROMOTION';
          from_value: string;
          to_value: string;
          effective_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          employee_id: string;
          type: 'DEPARTMENT_CHANGE' | 'POSITION_CHANGE' | 'PROMOTION';
          from_value: string;
          to_value: string;
          effective_date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          type?: 'DEPARTMENT_CHANGE' | 'POSITION_CHANGE' | 'PROMOTION';
          from_value?: string;
          to_value?: string;
          effective_date?: string;
          notes?: string | null;
        };
      };
      org_versions: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          created_by: string;
          is_active: boolean;
          is_draft: boolean;
          tag: string | null;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          created_by: string;
          is_active?: boolean;
          is_draft?: boolean;
          tag?: string | null;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          is_active?: boolean;
          is_draft?: boolean;
          tag?: string | null;
          metadata?: any;
          updated_at?: string;
        };
      };
      version_snapshots: {
        Row: {
          id: string;
          tenant_id: string;
          version_id: string;
          entity_type: 'employee' | 'department';
          entity_id: string;
          snapshot_data: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          version_id: string;
          entity_type: 'employee' | 'department';
          entity_id: string;
          snapshot_data: any;
          created_at?: string;
        };
        Update: {
          snapshot_data?: any;
        };
      };
      version_changes: {
        Row: {
          id: string;
          tenant_id: string;
          version_id: string;
          entity_type: 'employee' | 'department';
          entity_id: string;
          field_name: string;
          old_value: any;
          new_value: any;
          change_type: 'CREATE' | 'UPDATE' | 'DELETE';
          impact_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          version_id: string;
          entity_type: 'employee' | 'department';
          entity_id: string;
          field_name: string;
          old_value?: any;
          new_value?: any;
          change_type: 'CREATE' | 'UPDATE' | 'DELETE';
          impact_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
          created_at?: string;
        };
        Update: {
          field_name?: string;
          old_value?: any;
          new_value?: any;
          change_type?: 'CREATE' | 'UPDATE' | 'DELETE';
          impact_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          tenant_id: string;
          first_name: string;
          last_name: string;
          role: 'employee' | 'manager' | 'hr' | 'admin';
          department: string | null;
          employee_id: string | null;
          phone_number: string | null;
          profile_image: string | null;
          bio: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tenant_id: string;
          first_name: string;
          last_name: string;
          role?: 'employee' | 'manager' | 'hr' | 'admin';
          department?: string | null;
          employee_id?: string | null;
          phone_number?: string | null;
          profile_image?: string | null;
          bio?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          role?: 'employee' | 'manager' | 'hr' | 'admin';
          department?: string | null;
          employee_id?: string | null;
          phone_number?: string | null;
          profile_image?: string | null;
          bio?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
    };
  };
}