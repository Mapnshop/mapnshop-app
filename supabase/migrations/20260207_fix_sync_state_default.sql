-- Fix the default value for sync_state which was causing insert errors
-- The check constraint allows ('ok', 'pending', 'error') but default was 'synced'

-- 1. Update the default value to a valid state
ALTER TABLE public.orders ALTER COLUMN sync_state SET DEFAULT 'ok';

-- 2. Ensure no invalid data remains (just in case)
UPDATE public.orders 
SET sync_state = 'ok' 
WHERE sync_state = 'synced';
