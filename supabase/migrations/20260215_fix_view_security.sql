/*
  Migration: 20260215_fix_view_security.sql
  Description: Fixes security definer issue on integrations_public view and grants safe access.
*/

-- 1. Alter View to use Invoker Security (Best Practice)
-- This ensures RLS policies of the invoking user are enforced.
ALTER VIEW public.integrations_public SET (security_invoker = true);

-- 2. Grant Access to Base Table Columns (Safe Subset)
-- Since we are now using security_invoker, the user needs permission on the underlying table.
-- We previously revoked all access in 20260207_marketplace_refinement.sql.
-- We explicitly GRANT SELECT only on non-sensitive columns (excluding credentials_encrypted).

GRANT SELECT (
    id, 
    business_id, 
    provider, 
    status, 
    external_store_id, 
    last_error, 
    last_webhook_at, 
    last_sync_at, 
    created_at, 
    updated_at
) ON public.integrations TO authenticated;
