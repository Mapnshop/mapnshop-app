-- FIX UPDATE POLICY FOR RESUBMISSION
-- The previous policy prevented users from verifying their own business because "pending" wasn't in the allowed check list.

-- 1. Drop the restrictive policy
DROP POLICY IF EXISTS "Update Own Business (Draft/Rejected)" ON public.businesses;

-- 2. Recreate it with "pending" allowed in the WITH CHECK clause
CREATE POLICY "Update Own Business (Draft/Rejected)" ON public.businesses
FOR UPDATE
USING (
  owner_id = auth.uid() 
  AND verification_status IN ('draft', 'rejected')
)
WITH CHECK (
  owner_id = auth.uid()
  AND verification_status IN ('draft', 'rejected', 'pending') -- Added 'pending' here so they can submit!
);
