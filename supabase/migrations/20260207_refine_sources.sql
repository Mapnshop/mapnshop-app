-- 1. Drop the check constraint if it exists (from unified_inbox.sql)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_source_check;

-- 2. Convert the source column from ENUM to TEXT
-- We use ::TEXT to cast the existing enum values to strings
ALTER TABLE public.orders 
ALTER COLUMN source TYPE TEXT USING source::TEXT;

-- 3. Drop the default value if it depends on the enum, then set a text default
ALTER TABLE public.orders ALTER COLUMN source SET DEFAULT 'manual';

-- 4. Drop the enum type if it is no longer used
DROP TYPE IF EXISTS order_source;

-- 5. Migrate existing 'walk-in' orders to 'check-in'
UPDATE public.orders 
SET source = 'check-in' 
WHERE source = 'walk-in';

-- 6. Add a comment explaining the Source column usage
COMMENT ON COLUMN public.orders.source IS 'Source of the order: manual, check-in, phone, whatsapp, instagram, uber_eats, doordash, or custom delivery app name';
