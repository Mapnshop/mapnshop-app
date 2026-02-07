export interface User {
  id: string;
  email: string;
  role: 'business';
  created_at: string;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id?: string;
  email?: string;
  role: 'owner' | 'admin' | 'staff';
  status: 'active' | 'invited';
  created_at: string;
}


export interface Business {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  opening_hours: string;
  category: 'retail' | 'restaurant' | 'service' | 'other';
  owner_id: string;
  default_tax_rate?: number;
  default_delivery_fee?: number;
  currency?: string; // e.g., 'CAD', 'USD'
  created_at: string;
  // Verification fields
  submitted_at?: string;
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
  verification_status: 'draft' | 'pending' | 'approved' | 'rejected';
}

export interface Profile {
  id: string;
  role: 'admin' | 'business';
  created_at: string;
}



export interface Order {
  id: string;
  business_id: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  description: string;
  notes?: string;
  price: number; // Keep for backward compatibility, represents Total
  subtotal?: number;
  tax?: number;
  delivery_fee?: number;
  total?: number;
  source: 'manual' | 'phone' | 'whatsapp' | 'walk-in' | 'Uber Eats' | 'Deliveroo' | 'Just Eat' | 'Hungry Panda' | 'Talabat';
  source_details?: Record<string, any>;
  status: 'created' | 'preparing' | 'ready' | 'completed' | 'cancelled'; // Added cancelled
  cancellation_reason?: string; // Added
  attachments?: string[]; // Added (JSONB array of strings)
  delivery_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  address_text?: string;
  notes?: string;
  created_at: string;
  last_order_at?: string;
}

export interface OrderActivity {
  id: string;
  order_id: string;
  user_id: string;
  action: 'status_change' | 'edit' | 'note' | 'cancellation' | 'create';
  details?: Record<string, any>;
  created_at: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  status: 'requested' | 'assigned' | 'picked_up' | 'delivered';
  pickup_time: string;
  fee: number;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  timestamp: string;
}

export interface DashboardData {
  new_orders_count: number;
  today_orders: Order[];
  total_revenue_today: number;
}

export interface DailyReport {
  orders_today: number;
  delivered_count: number;
  pickup_count: number;
  total_revenue: number;
}