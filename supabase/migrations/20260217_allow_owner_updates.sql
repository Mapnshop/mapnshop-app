-- FIX: Allow owners to update their business regardless of status
-- Previous policy "Update Own Business (Draft/Rejected)" was too restrictive.
-- It prevented owners from updating settings like "Business Hours" or "Phone" once the business was approved or pending.

-- 1. Drop the restrictive policy
DROP POLICY IF EXISTS "Update Own Business (Draft/Rejected)" ON public.businesses;

-- Also drop the "Update Own Business" if it exists from a previous bad migration to be safe/clean
DROP POLICY IF EXISTS "Update Own Business" ON public.businesses;

-- 2. Create the new general policy that allows updates for any status
CREATE POLICY "Update Own Business" ON public.businesses
FOR UPDATE
USING (
  owner_id = auth.uid()
)
WITH CHECK (
  owner_id = auth.uid()
  -- We implicitly allow them to keep the status as is or change it if the API allows.
  -- The API logic normally handles status transitions (e.g. resubmit sets it to pending).
  -- This pure RLS just says "If you own it, you can write to it".
);
