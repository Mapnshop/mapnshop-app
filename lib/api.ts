import { supabase } from './supabase';
import { Platform } from 'react-native';
import type { Business, Order, Delivery, DashboardData, DailyReport, BusinessMember, Customer, OrderActivity } from '@/types';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Auth API
export const authApi = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new ApiError(error.message);
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new ApiError(error.message);
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      // If the session is missing, we're effectively signed out anyway.
      if (error.message === 'Auth session missing!') return;
      throw new ApiError(error.message);
    }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw new ApiError(error.message);
    return user;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://example.com/update-password',
    });
    if (error) throw new ApiError(error.message);
  },

  async updateUser(attributes: { email?: string; password?: string }) {
    const { data, error } = await supabase.auth.updateUser(attributes);
    if (error) throw new ApiError(error.message);
    return data;
  },

  async deleteUser() {
    // 1. Get the current user and their business
    const user = await this.getCurrentUser();
    if (!user) return;

    // Fetch the business to get its ID
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (business) {
      const businessId = business.id;

      // 2. Delete Order Dependencies (Activity & Deliveries)
      // We need order IDs first
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('business_id', businessId);

      if (orders && orders.length > 0) {
        const orderIds = orders.map(o => o.id);

        // Delete Activity
        await supabase
          .from('order_activity')
          .delete()
          .in('order_id', orderIds);

        // Delete Deliveries
        await supabase
          .from('deliveries')
          .delete()
          .in('order_id', orderIds);

        // Delete Orders
        await supabase
          .from('orders')
          .delete()
          .eq('business_id', businessId);
      }

      // 3. Delete Business Relations
      await supabase
        .from('customers')
        .delete()
        .eq('business_id', businessId);

      await supabase
        .from('business_members')
        .delete()
        .eq('business_id', businessId);

      // 4. Finally Delete Business
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId);

      if (error) {
        throw new ApiError('Failed to delete business: ' + error.message);
      }
    }
  }
};

// Business API
export const businessApi = {
  async create(business: Omit<Business, 'id' | 'created_at' | 'owner_id' | 'verification_status' | 'submitted_at' | 'verified_at' | 'verified_by' | 'rejection_reason'>) {
    const user = await authApi.getCurrentUser();
    if (!user) throw new ApiError('Not authenticated');

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        ...business,
        owner_id: user.id,
        verification_status: 'pending',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new ApiError(error.message);

    // Auto-add owner to members table to ensure consistent access logic
    const { error: memberError } = await supabase
      .from('business_members')
      .insert({
        business_id: data.id,
        user_id: user.id,
        role: 'owner',
        status: 'active'
      });

    if (memberError) console.error('Failed to add owner to members table:', memberError);

    return data as Business;
  },

  async getByOwnerId(ownerId: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (error) throw new ApiError(error.message);
    return data as Business | null;
  },

  async update(id: string, updates: Partial<Business>) {
    const { data, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ApiError(error.message);
    return data as Business;
  },

  async checkMembership(userId: string, email: string) {
    // Check if user is a member of any business
    const { data, error } = await supabase
      .from('business_members')
      .select('*, businesses(*)')
      .eq('email', email)
      .maybeSingle(); // Use maybeSingle to avoid error if not found

    if (error) return null; // Ignore error, just return null
    if (!data) return null;

    // If found, we must ensure user_id is linked.
    // Ideally done via trigger, but we'll try to update it here lazily if RLS allows.
    if (!data.user_id) {
      await supabase
        .from('business_members')
        .update({ user_id: userId, status: 'active' })
        .eq('id', data.id);
    }

    return data.businesses as unknown as Business;
  },

  async resubmit(businessId: string) {
    const { data, error } = await supabase
      .from('businesses')
      .update({
        verification_status: 'pending',
        submitted_at: new Date().toISOString(),
        rejection_reason: null,
      })
      .eq('id', businessId)
      .select()
      .single();

    if (error) throw new ApiError(error.message);
    return data as Business;
  }
};



// Orders API
export const ordersApi = {
  async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (error) throw new ApiError(error.message);
    return data as Order;
  },

  async getByBusinessId(businessId: string, options?: {
    status?: Order['status'] | 'active' | 'completed' | 'cancelled',
    source?: 'manual' | 'uber_eats' | 'doordash', // Unified source filter
    search?: string,
    page?: number,
    limit?: number
  }) {
    let query = supabase
      .from('orders')
      .select('*, customer:customers(*)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    // Status Filter
    if (options?.status) {
      if (options.status === 'active') {
        query = query.in('status', ['created', 'preparing', 'ready']);
      } else if (options.status === 'completed') {
        query = query.eq('status', 'completed');
      } else if (options.status === 'cancelled') {
        query = query.eq('status', 'cancelled');
      } else {
        query = query.eq('status', options.status);
      }
    }

    // Source Filter
    if (options?.source) {
      if (options.source === 'manual') {
        query = query.in('source', ['manual', 'phone', 'whatsapp', 'walk-in', 'check-in', 'instagram']);
      } else if (options.source === 'uber_eats') {
        query = query.in('source', ['Uber Eats', 'uber_eats']);
      } else if (options.source === 'doordash') {
        query = query.in('source', ['DoorDash', 'doordash']);
      }
    }

    // Search Filter
    if (options?.search) {
      const term = options.search.toLowerCase();
      const isId = !isNaN(Number(term));
      if (isId) {
        query = query.eq('id', term);
      } else {
        query = query.ilike('description', `%${term}%`);
      }
    }

    // Pagination
    if (options?.page !== undefined && options?.limit !== undefined) {
      const from = options.page * options.limit;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) throw new ApiError(error.message);
    return data as Order[];
  },

  async list(businessId: string, _statusFilter?: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw new ApiError(error.message);
    return data as Order[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new ApiError(error.message);
    return data as Order;
  },

  async updateStatus(id: string, status: Order['status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ApiError(error.message);
    return data as Order;
  },

  async update(id: string, updates: Partial<Order>) {
    const { data, error } = await supabase
      .from('orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ApiError(error.message);
    return data as Order;
  }
};

export const customersApi = {
  async getByPhone(businessId: string, phone: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', businessId)
      .eq('phone', phone)
      .single();

    // It's okay if not found
    if (error && error.code !== 'PGRST116') throw new ApiError(error.message);
    return data as Customer | null;
  },

  async upsert(customer: Partial<Customer>) {
    const { data, error } = await supabase
      .from('customers')
      .upsert(customer, { onConflict: 'business_id, phone' })
      .select()
      .single();

    if (error) throw new ApiError(error.message);
    return data as Customer;
  },

  async listRecent(businessId: string, limit = 10) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', businessId)
      .order('last_order_at', { ascending: false })
      .limit(limit);

    if (error) throw new ApiError(error.message);
    return data as Customer[];
  },

  async search(businessId: string, query: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', businessId)
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(5);

    if (error) {
      console.error('Search API Error:', error);
      throw new ApiError(error.message);
    }
    return (data || []) as Customer[];
  },

  async getStats(customerId: string) {
    // 1. Get total spend and count
    const { data: orders, error } = await supabase
      .from('orders')
      .select('price, total, created_at, status, id')
      .eq('customer_id', customerId) // Assuming orders are linked by customer_id
      .neq('status', 'cancelled'); // Exclude cancelled

    // Note: If orders are only linked by phone, we might need to query by phone.
    // But ideally we use customer_id if available. 
    // Fallback: If no customer_id on orders, we can't easily link unless we query by phone 
    // stored on the customer object. Let's assume for now we might need to fetch the customer first 
    // to get the phone if we only have ID, OR we pass the phone to this function.

    // Let's refine this: API will take `phone` as well to be robust, or we assume `customerId` linkage.
    // Given the current schema, orders might NOT have `customer_id` set if created manually without linking.
    // Let's use PHONE as the connector for now since that's our primary key constraint logic.

    if (error) throw new ApiError(error.message);

    const totalSpend = orders.reduce((sum, o) => sum + (o.total || o.price), 0);
    const orderCount = orders.length;

    // 2. Get last 5 orders
    // We already have them in 'orders' if the list is small, but if large, we should separate queries.
    // For MVP, since we fetched all to calc total (DB aggregation is better but this is JS),
    // let's just sort and slice.

    const lastOrders = orders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    return {
      totalSpend,
      orderCount,
      lastOrders
    };
  },

  // Overloading to support fetching by phone if needed
  async getStatsByPhone(businessId: string, phone: string) {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('price, total, created_at, status, id')
      .eq('business_id', businessId)
      .eq('customer_phone', phone)
      .neq('status', 'cancelled');

    if (error) throw new ApiError(error.message);

    const totalSpend = orders.reduce((sum, o) => sum + (o.total || o.price), 0);
    const orderCount = orders.length;

    const lastOrders = orders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    return {
      totalSpend,
      orderCount,
      lastOrders
    };
  }
};

export const activityApi = {
  async logAction(orderId: string, action: OrderActivity['action'], details?: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('order_activity')
      .insert({
        order_id: orderId,
        user_id: user.id,
        action,
        details
      });

    if (error) console.error('Failed to log activity:', error);
  },

  async getByOrderId(orderId: string) {
    const { data, error } = await supabase
      .from('order_activity')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw new ApiError(error.message);
    return data as OrderActivity[];
  }
};


// Delivery API
export const deliveryApi = {
  async create(delivery: Omit<Delivery, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('deliveries')
      .insert(delivery)
      .select()
      .single();

    if (error) throw new ApiError(error.message);
    return data as Delivery;
  },

  async updateStatus(id: string, status: Delivery['status']) {
    const { data, error } = await supabase
      .from('deliveries')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new ApiError(error.message);
    return data as Delivery;
  },

  async getByOrderId(orderId: string) {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error && error.code !== 'PGRST116') throw new ApiError(error.message);
    return data as Delivery | null;
  }
};

// Members API
export const membersApi = {
  async getByBusinessId(businessId: string) {
    const { data, error } = await supabase
      .from('business_members')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw new ApiError(error.message);
    return data as BusinessMember[];
  },

  async invite(businessId: string, email: string, role: BusinessMember['role']) {
    // 1. Check if user already exists in auth
    // For MVP, we just create the invite record.
    // In a real app, this would trigger an email via Edge Function.

    // Check if updated/existing
    const { data, error } = await supabase
      .from('business_members')
      .insert({
        business_id: businessId,
        email: email.toLowerCase(),
        role,
        status: 'invited'
      })
      .select()
      .single();

    if (error) throw new ApiError(error.message);
    return data as BusinessMember;
  },

  async remove(id: string) {
    const { error } = await supabase
      .from('business_members')
      .delete()
      .eq('id', id);

    if (error) throw new ApiError(error.message);
  }
};

// Dashboard API
export const dashboardApi = {
  async getDashboardData(businessId: string, dateRange: 'today' | 'yesterday' | 'week' = 'today'): Promise<DashboardData> {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    // Set time to end of day for cleaner comparisons if needed, 
    // but typically gte/lte works best with ISO strings.

    if (dateRange === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (dateRange === 'yesterday') {
      startDate.setDate(today.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(today.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
    } else if (dateRange === 'week') {
      startDate.setDate(today.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    }

    let query = supabase
      .from('orders')
      .select('*')
      .eq('business_id', businessId);

    if (dateRange === 'yesterday') {
      query = query.gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
    } else {
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false });

    if (error) throw new ApiError(error.message);

    const newOrdersCount = orders.filter((order: Order) => order.status === 'created').length;
    const totalRevenue = orders.reduce((sum: number, order: Order) => sum + order.price, 0);

    return {
      new_orders_count: newOrdersCount,
      today_orders: orders.slice(0, 5), // Preview of latest 5 orders
      total_revenue_today: totalRevenue,
    };
  },

  async getDailyReport(businessId: string, dateRange: 'today' | 'yesterday' | 'week' = 'today'): Promise<DailyReport> {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (dateRange === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (dateRange === 'yesterday') {
      startDate.setDate(today.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(today.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
    } else if (dateRange === 'week') {
      startDate.setDate(today.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    }

    let query = supabase
      .from('orders')
      .select('*')
      .eq('business_id', businessId);

    if (dateRange === 'yesterday') {
      query = query.gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString());
    } else {
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data: orders, error } = await query;

    if (error) throw new ApiError(error.message);

    const deliveredCount = orders.filter((order: Order) => order.delivery_required).length;
    const pickupCount = orders.filter((order: Order) => !order.delivery_required).length;
    const totalRevenue = orders.reduce((sum: number, order: Order) => sum + order.price, 0);

    return {
      orders_today: orders.length,
      delivered_count: deliveredCount,
      pickup_count: pickupCount,
      total_revenue: totalRevenue,
    };
  }
};

export const storageApi = {
  async uploadImage(uri: string): Promise<string> {
    try {

      const response = await fetch(uri);
      const blob = await response.blob();

      const filename = `attachment_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      let body: any = blob;

      if (Platform.OS !== 'web') {
        const arrayBuffer = await new Response(blob).arrayBuffer();
        body = arrayBuffer;
      }

      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(filename, body, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error("Supabase Storage Upload Error:", error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (error: any) {
      console.error('Upload trace failed:', error);
      throw new ApiError('Failed to upload image: ' + (error.message || JSON.stringify(error)));
    }
  },

  async deleteImage(pathOrUrl: string) {
    try {
      // Extract the path if a full URL is provided
      // URL format: .../storage/v1/object/public/attachments/filename.jpg
      // We need just: filename.jpg (or whatever follows /attachments/)

      let path = pathOrUrl;
      if (pathOrUrl.includes('/attachments/')) {
        path = pathOrUrl.split('/attachments/')[1];
      }

      const { error } = await supabase.storage
        .from('attachments')
        .remove([path]);

      if (error) throw error;
    } catch (error: any) {
      console.error('Delete failed:', error);
      throw new ApiError('Failed to delete image: ' + (error.message || JSON.stringify(error)));
    }
  }
};

// Profile API
export const profileApi = {
  async getCurrentProfile() {
    const user = await authApi.getCurrentUser();
    if (!user) throw new ApiError('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw new ApiError(error.message);
    return data;
  },

  async isAdmin() {
    try {
      const profile = await this.getCurrentProfile();
      return profile?.role === 'admin';
    } catch {
      return false;
    }
  }
};

// Admin API
export const adminApi = {
  async listPendingBusinesses() {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('verification_status', 'pending')
      .order('submitted_at', { ascending: false });

    if (error) throw new ApiError(error.message);
    return data as Business[];
  },

  async approveBusiness(businessId: string) {
    const user = await authApi.getCurrentUser();
    if (!user) throw new ApiError('Not authenticated');

    const { data, error } = await supabase
      .from('businesses')
      .update({
        verification_status: 'approved',
        verified_at: new Date().toISOString(),
        verified_by: user.id,
        rejection_reason: null,
      })
      .eq('id', businessId)
      .select()
      .single();

    if (error) throw new ApiError(error.message);
    return data as Business;
  },

  async rejectBusiness(businessId: string, reason: string) {
    const user = await authApi.getCurrentUser();
    if (!user) throw new ApiError('Not authenticated');

    const { data, error } = await supabase
      .from('businesses')
      .update({
        verification_status: 'rejected',
        rejection_reason: reason,
        verified_by: user.id,
      })
      .eq('id', businessId)
      .select()
      .single();

    if (error) throw new ApiError(error.message);
    return data as Business;
  }
};
