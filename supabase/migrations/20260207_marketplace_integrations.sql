/*
  Migration: 20260207_marketplace_integrations.sql
  Description: Adds integrations table and updates orders for marketplace support.
*/

-- 1. Create Integrations Table
CREATE TABLE public.integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('uber_eats', 'doordash')),
    status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'connected', 'error')),
    credentials_encrypted TEXT, -- Intentionally restricted via Column Privileges
    external_store_id TEXT,
    last_sync_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, provider)
);

-- 2. Update Orders Table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS external_order_id TEXT,
ADD COLUMN IF NOT EXISTS source_details JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS sync_state TEXT DEFAULT 'synced' CHECK (sync_state IN ('synced', 'error', 'pending')),
ADD COLUMN IF NOT EXISTS last_sync_error TEXT;

-- Add Unique Constraint for Upserts
-- We need to ensure (business_id, source, external_order_id) is unique.
-- Note: 'source' is an ENUM.
ALTER TABLE public.orders 
ADD CONSTRAINT orders_business_source_external_id_key 
UNIQUE (business_id, source, external_order_id);

-- 3. Security (RLS & Privileges)

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Grant Access to Authenticated Users (Excluding credentials_encrypted)
-- We first REVOKE default ALL privileges to ensure only specific columns are granted.
REVOKE ALL ON public.integrations FROM authenticated;
GRANT SELECT (id, business_id, provider, status, external_store_id, last_sync_error, created_at, updated_at) 
ON public.integrations TO authenticated;

GRANT INSERT, UPDATE, DELETE ON public.integrations TO authenticated;

-- RLS Policies

-- View Integrations: Members can view integrations for their business
CREATE POLICY "View Integrations" ON public.integrations
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM business_members 
        WHERE business_id = integrations.business_id 
        AND user_id = auth.uid()
    )
    OR 
    EXISTS (
        SELECT 1 FROM businesses 
        WHERE id = integrations.business_id 
        AND owner_id = auth.uid()
    )
);

-- Manage Integrations: Only Owners and Admins can manage
CREATE POLICY "Manage Integrations" ON public.integrations
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM business_members 
        WHERE business_id = integrations.business_id 
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
    OR 
    EXISTS (
        SELECT 1 FROM businesses 
        WHERE id = integrations.business_id 
        AND owner_id = auth.uid()
    )
);

-- 4. Triggers
-- Update updated_at
CREATE TRIGGER update_integrations_timestamp 
BEFORE UPDATE ON public.integrations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
