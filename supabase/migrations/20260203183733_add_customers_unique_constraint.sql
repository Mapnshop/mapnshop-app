-- Add unique constraint to customers table for business_id and phone combination
-- This enables proper upsert operations when creating orders

-- First, remove any duplicate entries (keeping the most recent one)
DELETE FROM customers a USING customers b
WHERE a.id < b.id 
  AND a.business_id = b.business_id 
  AND a.phone = b.phone;

-- Add the unique constraint
ALTER TABLE customers 
ADD CONSTRAINT customers_business_phone_unique 
UNIQUE (business_id, phone);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_business_phone 
ON customers(business_id, phone);
