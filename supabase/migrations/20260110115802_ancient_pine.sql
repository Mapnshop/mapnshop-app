/*
  # MapNShop Database Schema

  1. New Tables
    - `businesses`
      - `id` (uuid, primary key)
      - `name` (text)
      - `address` (text)
      - `lat` (float)
      - `lng` (float)
      - `phone` (text)
      - `opening_hours` (text)
      - `owner_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)

    - `orders`
      - `id` (uuid, primary key)
      - `business_id` (uuid, foreign key to businesses)
      - `customer_name` (text)
      - `customer_phone` (text)
      - `address` (text)
      - `description` (text)
      - `price` (decimal)
      - `source` (enum: manual, phone, whatsapp, walk-in)
      - `status` (enum: created, preparing, ready, completed)
      - `delivery_required` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `deliveries`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `status` (enum: requested, assigned, picked_up, delivered)
      - `pickup_time` (timestamp)
      - `fee` (decimal)
      - `created_at` (timestamp)

    - `activity_logs`
      - `id` (uuid, primary key)
      - `entity_type` (text)
      - `entity_id` (uuid)
      - `action` (text)
      - `timestamp` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for business owners to manage their own data
*/

-- Create custom types
CREATE TYPE order_source AS ENUM ('manual', 'phone', 'whatsapp', 'walk-in');
CREATE TYPE order_status AS ENUM ('created', 'preparing', 'ready', 'completed');
CREATE TYPE delivery_status AS ENUM ('requested', 'assigned', 'picked_up', 'delivered');

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  lat float DEFAULT 0,
  lng float DEFAULT 0,
  phone text NOT NULL,
  opening_hours text DEFAULT 'Mon-Fri 9AM-6PM',
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  address text DEFAULT '',
  description text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  source order_source DEFAULT 'manual',
  status order_status DEFAULT 'created',
  delivery_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  status delivery_status DEFAULT 'requested',
  pickup_time timestamptz NOT NULL,
  fee decimal(10,2) DEFAULT 5.00,
  created_at timestamptz DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for businesses
CREATE POLICY "Business owners can read own business"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Business owners can insert own business"
  ON businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Business owners can update own business"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Create RLS policies for orders
CREATE POLICY "Business owners can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can insert orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Create RLS policies for deliveries
CREATE POLICY "Business owners can read deliveries for own orders"
  ON deliveries
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN businesses b ON o.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can insert deliveries for own orders"
  ON deliveries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN businesses b ON o.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update deliveries for own orders"
  ON deliveries
  FOR UPDATE
  TO authenticated
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN businesses b ON o.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
  );

-- Create RLS policies for activity_logs
CREATE POLICY "Business owners can read activity logs for own entities"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    entity_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    ) OR
    entity_id IN (
      SELECT o.id FROM orders o
      JOIN businesses b ON o.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can insert activity logs"
  ON activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for orders updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();