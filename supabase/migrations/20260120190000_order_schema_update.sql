/* 
  Migration: 20260120190000_order_schema_update.sql
  Description: Adds pricing breakdown columns to orders and default settings to businesses.
*/

-- Update orders table with pricing breakdown
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS subtotal numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total numeric DEFAULT 0;

-- Update businesses table with defaults
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS default_tax_rate numeric DEFAULT 0, -- Percentage (e.g., 10 for 10%)
ADD COLUMN IF NOT EXISTS default_delivery_fee numeric DEFAULT 0;

-- Backfill existing orders (approximate)
-- We assume the existing 'price' was the total. 
-- We'll set total = price, subtotal = price, tax = 0, delivery_fee = 0 for consistency.
UPDATE orders 
SET 
  total = price,
  subtotal = price,
  tax = 0,
  delivery_fee = 0
WHERE total = 0;
