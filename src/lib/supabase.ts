import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiYnVoaXVvd25uY295dG11dHB0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDYzNDk0OCwiZXhwIjoyMDY2MjEwOTQ4fQ.p67TdO9_jzxBt0Xqr6MHr_Ta_g1vjrRvQgRxf0oclU0";

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required');
}
if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required');
}
if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

// Client-side Supabase client (for browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (for API routes, bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database types based on your current schema
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          password: string | null;
          created_at: string;
          updated_at: string;
          email_verified: string | null;
          verification_token: string | null;
          first_name: string | null;
          last_name: string | null;
          designation: string | null;
          department: string | null;
          company_name: string | null;
          profile_picture_url: string | null;
          company_logo_url: string | null;
          brand_theme: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          email?: string | null;
          password?: string | null;
          created_at?: string;
          updated_at?: string;
          email_verified?: string | null;
          verification_token?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          designation?: string | null;
          department?: string | null;
          company_name?: string | null;
          profile_picture_url?: string | null;
          company_logo_url?: string | null;
          brand_theme?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          password?: string | null;
          created_at?: string;
          updated_at?: string;
          email_verified?: string | null;
          verification_token?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          designation?: string | null;
          department?: string | null;
          company_name?: string | null;
          profile_picture_url?: string | null;
          company_logo_url?: string | null;
          brand_theme?: string | null;
        };
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          contact_name: string | null;
          email: string;
          phone: string | null;
          address: string | null;
          website: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          contact_name?: string | null;
          email: string;
          phone?: string | null;
          address?: string | null;
          website?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          contact_name?: string | null;
          email?: string;
          phone?: string | null;
          address?: string | null;
          website?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          status: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
          amount: number;
          due_date: string | null;
          notes: string | null;
          client_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          status?: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
          amount: number;
          due_date?: string | null;
          notes?: string | null;
          client_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          status?: 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
          amount?: number;
          due_date?: string | null;
          notes?: string | null;
          client_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          description: string;
          quantity: number;
          unit_price: number;
          total: number;
          invoice_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          description: string;
          quantity: number;
          unit_price: number;
          total: number;
          invoice_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          description?: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          invoice_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 