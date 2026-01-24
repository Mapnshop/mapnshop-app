/* 
  Migration: 20260120200000_business_os_v2.sql
  Description: Adds Customers, Order Activity Log, and Order Enhancements (Cancellation, Media).
*/

-- 1. Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT REFERENCES locations(id), -- Optional link if we want structured locations later, but text is fine for simplified
  address_text TEXT, -- Simple text address
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_order_at TIMESTAMPTZ
);

-- Compound index for fast lookup by phone within a business
CREATE INDEX IF NOT EXISTS idx_customers_business_phone ON customers(business_id, phone);

-- 2. Create Order Activity Log Table
CREATE TABLE IF NOT EXISTS order_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- Who performed the action
  action TEXT NOT NULL, -- 'status_change', 'edit', 'note', 'cancellation', 'create'
  details JSONB, -- Stores previous values, notes, or specific diffs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_activity_order ON order_activity(order_id);

-- 3. Update Orders Table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb; -- Array of image URLs/paths

-- 4. Enable RLS on new tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_activity ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Customers: Staff can view/edit customers for their business
CREATE POLICY "Staff can view customers" ON customers
  FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM business_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can insert customers" ON customers
  FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM business_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can update customers" ON customers
  FOR UPDATE
  USING (
    business_id IN (
      SELECT business_id FROM business_members 
      WHERE user_id = auth.uid()
    )
  );

-- Order Activity: Staff can view/insert activity for their business's orders
-- Optimization: We link via orders -> business_id
CREATE POLICY "Staff can view activity" ON order_activity
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE business_id IN (
        SELECT business_id FROM business_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Staff can insert activity" ON order_activity
  FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders 
      WHERE business_id IN (
        SELECT business_id FROM business_members 
        WHERE user_id = auth.uid()
      )
    )
  );
