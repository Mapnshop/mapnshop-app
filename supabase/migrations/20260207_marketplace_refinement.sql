/*
  Migration: 20260207_marketplace_refinement.sql
  Description: Refines integrations and orders tables for production-grade marketplace support.
*/

-- 1. Refine Integrations Table
ALTER TABLE public.integrations 
ADD COLUMN IF NOT EXISTS last_webhook_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ;

-- Ensure last_error is present (added in previous migration as last_sync_error, let's standardize)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='integrations' AND column_name='last_sync_error') THEN
        ALTER TABLE public.integrations RENAME COLUMN last_sync_error TO last_error;
    ELSE
        ALTER TABLE public.integrations ADD COLUMN last_error TEXT;
    END IF;
END $$;


-- 2. Create Public View for Integrations (Secure)
-- This view allows clients to see status but NEVER see credentials_encrypted
CREATE OR REPLACE VIEW public.integrations_public AS
SELECT 
    id,
    business_id,
    provider,
    status,
    external_store_id,
    last_webhook_at,
    last_sync_at,
    last_error,
    created_at,
    updated_at
FROM public.integrations;

-- Grant access to the view
GRANT SELECT ON public.integrations_public TO authenticated;

-- REVOKE access to the raw table from authenticated users to enforce security
REVOKE SELECT ON public.integrations FROM authenticated;
-- We still need INSERT/UPDATE/DELETE for owners, but we can handle that via RLS or explicit grants if needed.
-- Actually, the requirement says "Lock down direct table SELECT from client entirely".
-- But we might need UPDATE for disconnect? No, disconnect will be an Edge Function.
-- Connect is also an Edge Function.
-- So clients DO NOT need direct access to `integrations` table at all!
REVOKE ALL ON public.integrations FROM authenticated;
-- Only Service Role (Edge Functions) will access the raw table.


-- 3. Refine Orders Table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Ensure sync_state is correct
-- We already added sync_state text in previous migration.
-- Let's ensure constraints.
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_sync_state_check;
-- First update the data while no constraint exists (or is dropped)
UPDATE public.orders SET sync_state = 'ok' WHERE sync_state = 'synced';
-- Then add the new constraint that includes 'ok'
ALTER TABLE public.orders ADD CONSTRAINT orders_sync_state_check CHECK (sync_state IN ('ok', 'pending', 'error'));


-- 4. Create Order Events Table (Audit Log)
CREATE TABLE IF NOT EXISTS public.order_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    provider TEXT, -- 'uber_eats', 'doordash'
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for order_events (Viewable by business members)
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View Order Events" ON public.order_events
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.business_members 
        WHERE business_id = order_events.business_id 
        AND user_id = auth.uid()
    )
    OR 
    EXISTS (
        SELECT 1 FROM public.businesses 
        WHERE id = order_events.business_id 
        AND owner_id = auth.uid()
    )
);

-- Grant privileges
GRANT ALL ON public.order_events TO authenticated;
GRANT ALL ON public.order_events TO service_role;
