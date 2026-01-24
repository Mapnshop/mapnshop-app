-- MASTER SCHEMA MIGRATION
-- USE THIS TO RESET YOUR DATABASE TO A CLEAN STATE
-- WARNING: THIS deletes ALL DATA in the public schema!

-- 1. Reset Schema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Types & Extensions
CREATE TYPE order_source AS ENUM ('manual', 'phone', 'whatsapp', 'walk-in', 'Uber Eats', 'Deliveroo', 'Just Eat', 'Hungry Panda', 'Talabat');
CREATE TYPE order_status AS ENUM ('created', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE delivery_status AS ENUM ('requested', 'assigned', 'picked_up', 'delivered');
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'staff');
CREATE TYPE member_status AS ENUM ('active', 'invited');

-- 3. Tables

-- Businesses
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    category TEXT DEFAULT 'other',
    opening_hours TEXT,
    lat FLOAT DEFAULT 0,
    lng FLOAT DEFAULT 0,
    currency TEXT DEFAULT 'CAD',
    default_tax_rate NUMERIC DEFAULT 0,
    default_delivery_fee NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Members
CREATE TABLE public.business_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id), 
    email TEXT,
    role member_role NOT NULL DEFAULT 'staff',
    status member_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers (Missing in V1)
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_text TEXT, 
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_order_at TIMESTAMPTZ
);
CREATE INDEX idx_customers_business_phone ON customers(business_id, phone);


-- Orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL, -- Added Link
    customer_name TEXT NOT NULL, -- Fallback / Cache
    customer_phone TEXT NOT NULL, -- Fallback / Cache
    address TEXT,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    subtotal NUMERIC DEFAULT 0,
    tax NUMERIC DEFAULT 0,
    delivery_fee NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    source order_source DEFAULT 'manual',
    status order_status DEFAULT 'created',
    delivery_required BOOLEAN DEFAULT false,
    notes TEXT,
    cancellation_reason TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Activity (Audit Log)
CREATE TABLE public.order_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliveries
CREATE TABLE public.deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status delivery_status DEFAULT 'requested',
    pickup_time TIMESTAMPTZ,
    fee NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Push Tokens
CREATE TABLE public.user_push_tokens (
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    token TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, token)
);

-- 4. Helper Functions (SECURITY DEFINER to bypass RLS loops)

-- Check if current user is a member of the business (any role)
CREATE OR REPLACE FUNCTION public.is_business_member(b_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_id = $1 AND user_id = auth.uid()
  );
$$;

-- Check if current user is an admin/owner of the business
CREATE OR REPLACE FUNCTION public.is_business_admin(b_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM business_members 
    WHERE business_id = $1 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  );
$$;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_businesses_timestamp BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_timestamp BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_timestamp BEFORE UPDATE ON business_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_timestamp BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Row Level Security (RLS) & Policies

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

-- Business Policies
CREATE POLICY "Access Business" ON businesses
FOR ALL
USING (
  owner_id = auth.uid() 
  OR 
  is_business_member(id)
);

-- Member Policies
CREATE POLICY "View Members" ON business_members
FOR SELECT
USING (
  user_id = auth.uid() -- View self
  OR
  is_business_member(business_id) -- View co-workers
);

CREATE POLICY "Manage Members" ON business_members
FOR ALL
USING (
  -- Owner role in businesses table
  EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid())
  OR
  -- Admin role in members table
  is_business_admin(business_id)
);

-- Order Policies
CREATE POLICY "Access Orders" ON orders
FOR ALL
USING (
    is_business_member(business_id) 
    OR 
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid())
);

-- Customer Policies
CREATE POLICY "Access Customers" ON customers
FOR ALL
USING (
    is_business_member(business_id) 
    OR 
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid())
);


-- Activity Policies
CREATE POLICY "Access Activity" ON order_activity
FOR ALL
USING (
    order_id IN (SELECT id FROM orders) -- Relies on Order RLS
);

-- Delivery Policies
CREATE POLICY "Access Deliveries" ON deliveries
FOR ALL
USING (
    order_id IN (SELECT id FROM orders) -- Relies on Order RLS
);

-- Push Token Policies
CREATE POLICY "Manage Own Tokens" ON user_push_tokens
FOR ALL
USING (user_id = auth.uid());


-- 6. Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'attachments' );

DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;
CREATE POLICY "Authenticated Uploads" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'attachments' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Authenticated Deletes" ON storage.objects;
CREATE POLICY "Authenticated Deletes" ON storage.objects FOR DELETE USING ( bucket_id = 'attachments' AND auth.role() = 'authenticated' );

-- 7. GRANTS (Crucial for RLS to work)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- Ensure future tables get grants too
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
