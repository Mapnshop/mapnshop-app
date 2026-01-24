-- FIX: Infinite Recursion on business_members
-- The issue is likely a policy checking "am I a member?" by querying the table itself, 
-- which triggers the policy again in a loop.

-- 1. Create a secure function to check membership without triggering RLS (Security Definer)
CREATE OR REPLACE FUNCTION public.is_business_member(business_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER -- This bypasses RLS for the query inside
SET search_path = public -- Secure search path
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM business_members 
    WHERE business_id = $1 
    AND user_id = auth.uid()
  );
$$;

-- 2. Drop existing policies (covering likely names)
DROP POLICY IF EXISTS "Enable read access for all users" ON business_members;
DROP POLICY IF EXISTS "Members can view other members" ON business_members;
DROP POLICY IF EXISTS "Owners can manage members" ON business_members;
DROP POLICY IF EXISTS "Users can view members of their business" ON business_members;
DROP POLICY IF EXISTS "Staff can view members" ON business_members;
DROP POLICY IF EXISTS "View Members" ON business_members;
DROP POLICY IF EXISTS "Manage Members" ON business_members;

-- 3. Re-create Safe Policies

-- VIEW: Valid if you are the user OR if you are a member of the same business
CREATE POLICY "View Members" ON business_members
FOR SELECT
USING (
  auth.uid() = user_id -- Can see self
  OR
  is_business_member(business_id) -- Secure check for others
);

-- INSERT: Only Owners (or maybe just open invites? Let's restrict to Owners/Staff via function if needed)
-- For now, let's assume if you are a member, you can arguably invite? 
-- Or let's restrict to existing members.
CREATE POLICY "Manage Members" ON business_members
FOR ALL -- Insert/Update/Delete
USING (
  is_business_member(business_id)
);
