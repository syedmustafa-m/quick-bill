import { supabaseAdmin } from './supabase';
import bcrypt from 'bcrypt';
import type { Database } from './supabase';

type User = Database['public']['Tables']['users']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];
type Invoice = Database['public']['Tables']['invoices']['Row'];
type InvoiceItem = Database['public']['Tables']['invoice_items']['Row'];

// User operations
export const userService = {
  async createUser(email: string, password: string, name?: string) {
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserByEmail(email: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) return null;
    return data;
  },

  async getUserById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async verifyEmail(token: string) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        email_verified: new Date().toISOString(),
        verification_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq('verification_token', token)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Client operations
export const clientService = {
  async getClientsByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getClientById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert({
        ...clientData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateClient(id: string, updates: Partial<Client>) {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteClient(id: string) {
    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Invoice operations
export const invoiceService = {
  async getInvoicesByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        client:clients(*)
      `)
      .eq('client.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getInvoiceById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        items:invoice_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, items: Omit<InvoiceItem, 'id' | 'created_at' | 'updated_at'>[]) {
    // Start a transaction
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert({
        ...invoiceData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Insert invoice items
    if (items.length > 0) {
      const { error: itemsError } = await supabaseAdmin
        .from('invoice_items')
        .insert(
          items.map(item => ({
            ...item,
            invoice_id: invoice.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
        );

      if (itemsError) throw itemsError;
    }

    return invoice;
  },

  async updateInvoice(id: string, updates: Partial<Invoice>, items?: Omit<InvoiceItem, 'id' | 'created_at' | 'updated_at'>[]) {
    const { data, error } = await supabaseAdmin
      .from('invoices')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update items if provided
    if (items) {
      // Delete existing items
      await supabaseAdmin
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      // Insert new items
      if (items.length > 0) {
        const { error: itemsError } = await supabaseAdmin
          .from('invoice_items')
          .insert(
            items.map(item => ({
              ...item,
              invoice_id: id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }))
          );

        if (itemsError) throw itemsError;
      }
    }

    return data;
  },

  async deleteInvoice(id: string) {
    // Delete invoice items first
    await supabaseAdmin
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id);

    // Delete invoice
    const { error } = await supabaseAdmin
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getInvoiceStats(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select(`
        status,
        amount,
        client:clients(user_id)
      `)
      .eq('client.user_id', userId);

    if (error) throw error;

    const stats = {
      totalRevenue: 0,
      totalInvoices: data.length,
      paidInvoices: data.filter(invoice => invoice.status === 'PAID').length,
    };

    data.forEach(invoice => {
      if (invoice.status === 'PAID') {
        stats.totalRevenue += invoice.amount;
      }
    });

    return stats;
  },
}; 