/*
  Migration: 20260207_unified_inbox.sql
  Description: Adds allergy_note column and ensures source column supports new providers.
*/

-- 1. Add allergy_note to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS allergy_note TEXT;

-- 2. Ensure source column is flexible enough or update check constraint if strict
-- Check if existing constraint exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_source_check') THEN
        ALTER TABLE public.orders DROP CONSTRAINT orders_source_check;
    END IF;
END $$;

-- Re-add constraint with new sources (including snake_case and Title Case to support legacy/transition)
-- User specified: manual | uber_eats | doordash
-- Existing app uses: 'manual', 'phone', 'whatsapp', 'walk-in', 'Uber Eats', 'Deliveroo' etc.
-- We will allow both for now to avoid breaking existing data, but prefer snake_case for new integrations.
ALTER TABLE public.orders 
ADD CONSTRAINT orders_source_check 
CHECK (source IN (
    'manual', 'phone', 'whatsapp', 'walk-in', 
    'Uber Eats', 'uber_eats', 
    'DoorDash', 'doordash', 
    'Deliveroo', 'Just Eat', 'Hungry Panda', 'Talabat'
));
