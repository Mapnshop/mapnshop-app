-- FIX SCRIPT: Run this to ensure all features work

-- 1. Ensure 'attachments' bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'attachments' );

DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;
CREATE POLICY "Authenticated Uploads" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'attachments' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Authenticated Deletes" ON storage.objects;
CREATE POLICY "Authenticated Deletes" ON storage.objects FOR DELETE USING ( bucket_id = 'attachments' AND auth.role() = 'authenticated' );

-- 2. Ensure 'orders' table has 'attachments' column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tax NUMERIC DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS total NUMERIC DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Ensure 'businesses' table has 'currency' and default settings
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'CAD';

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS default_tax_rate NUMERIC DEFAULT 0;

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS default_delivery_fee NUMERIC DEFAULT 0;

-- 4. Ensure 'order_activity' table exists
CREATE TABLE IF NOT EXISTS order_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_activity_order ON order_activity(order_id);

-- Enable RLS for order_activity
ALTER TABLE order_activity ENABLE ROW LEVEL SECURITY;

-- 5. Policies for order_activity (using DO block to avoid errors if they exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_activity' AND policyname = 'Staff can view activity') THEN
        CREATE POLICY "Staff can view activity" ON order_activity FOR SELECT USING (
            order_id IN (SELECT id FROM orders WHERE business_id IN (SELECT business_id FROM business_members WHERE user_id = auth.uid()))
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_activity' AND policyname = 'Staff can insert activity') THEN
        CREATE POLICY "Staff can insert activity" ON order_activity FOR INSERT WITH CHECK (
            order_id IN (SELECT id FROM orders WHERE business_id IN (SELECT business_id FROM business_members WHERE user_id = auth.uid()))
        );
    END IF;
END $$;
