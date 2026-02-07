-- BUSINESS VERIFICATION GATE MIGRATION
-- Adds verification workflow to businesses table
-- Creates profiles table for admin role management
-- Updates RLS policies to gate access based on verification status

-- =====================================================
-- 1. CREATE PROFILES TABLE (for admin identification)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'business' CHECK (role IN ('admin', 'business')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies: users can view their own profile, admins can view all
CREATE POLICY "View Own Profile" ON public.profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Admins View All Profiles" ON public.profiles
FOR SELECT
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Only admins can update profiles
CREATE POLICY "Admins Manage Profiles" ON public.profiles
FOR ALL
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- 2. ADD VERIFICATION COLUMNS TO BUSINESSES TABLE
-- =====================================================

ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'draft' 
    CHECK (verification_status IN ('draft', 'pending', 'approved', 'rejected'));

-- =====================================================
-- 3. MIGRATE EXISTING DATA
-- =====================================================

-- Set all existing businesses to 'approved' status
UPDATE public.businesses
SET 
    verification_status = 'approved',
    verified_at = NOW()
WHERE verification_status = 'draft';

-- Create profile records for all existing users (set as 'business' by default)
INSERT INTO public.profiles (id, role)
SELECT DISTINCT id, 'business'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Check if a business is verified (approved)
CREATE OR REPLACE FUNCTION public.is_business_verified(b_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM businesses 
    WHERE id = $1 AND verification_status = 'approved'
  );
$$;

-- =====================================================
-- 5. UPDATE RLS POLICIES FOR BUSINESSES TABLE
-- =====================================================

-- Drop existing business policy to recreate with verification logic
DROP POLICY IF EXISTS "Access Business" ON public.businesses;

-- Business owners can SELECT their own business
CREATE POLICY "View Own Business" ON public.businesses
FOR SELECT
USING (
  owner_id = auth.uid() 
  OR 
  is_business_member(id)
);

-- Business owners can UPDATE their business ONLY if status is 'draft' or 'rejected'
-- This allows them to edit and resubmit
CREATE POLICY "Update Own Business (Draft/Rejected)" ON public.businesses
FOR UPDATE
USING (
  owner_id = auth.uid() 
  AND verification_status IN ('draft', 'rejected')
)
WITH CHECK (
  owner_id = auth.uid()
  AND verification_status IN ('draft', 'rejected')
);

-- Business owners can INSERT (create) their business
CREATE POLICY "Create Own Business" ON public.businesses
FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- Admins can UPDATE verification fields on any business
CREATE POLICY "Admins Manage Verification" ON public.businesses
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- Admins can view all businesses
CREATE POLICY "Admins View All Businesses" ON public.businesses
FOR SELECT
USING (is_admin());

-- =====================================================
-- 6. GATE ACCESS TO MAIN APP TABLES
-- =====================================================

-- Orders: Only accessible if user's business is verified
DROP POLICY IF EXISTS "Access Orders" ON public.orders;

CREATE POLICY "Access Orders (Verified Only)" ON public.orders
FOR ALL
USING (
    -- Must be a member of the business
    (is_business_member(business_id) OR EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid()))
    AND
    -- Business must be verified
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND verification_status = 'approved')
);

-- Customers: Only accessible if user's business is verified
DROP POLICY IF EXISTS "Access Customers" ON public.customers;

CREATE POLICY "Access Customers (Verified Only)" ON public.customers
FOR ALL
USING (
    (is_business_member(business_id) OR EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid()))
    AND
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND verification_status = 'approved')
);

-- Order Activity: Only accessible if user's business is verified
DROP POLICY IF EXISTS "Access Activity" ON public.order_activity;

CREATE POLICY "Access Activity (Verified Only)" ON public.order_activity
FOR ALL
USING (
    order_id IN (
        SELECT id FROM orders WHERE 
        (is_business_member(business_id) OR EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid()))
        AND EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND verification_status = 'approved')
    )
);

-- Deliveries: Only accessible if user's business is verified
DROP POLICY IF EXISTS "Access Deliveries" ON public.deliveries;

CREATE POLICY "Access Deliveries (Verified Only)" ON public.deliveries
FOR ALL
USING (
    order_id IN (
        SELECT id FROM orders WHERE 
        (is_business_member(business_id) OR EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid()))
        AND EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND verification_status = 'approved')
    )
);

-- Business Members: Gate based on business verification
DROP POLICY IF EXISTS "View Members" ON public.business_members;
DROP POLICY IF EXISTS "Manage Members" ON public.business_members;

CREATE POLICY "View Members (Verified Only)" ON public.business_members
FOR SELECT
USING (
  (user_id = auth.uid() OR is_business_member(business_id))
  AND
  EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND verification_status = 'approved')
);

CREATE POLICY "Manage Members (Verified Only)" ON public.business_members
FOR ALL
USING (
  (EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid())
   OR is_business_admin(business_id))
  AND
  EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND verification_status = 'approved')
);

-- =====================================================
-- 7. GRANTS
-- =====================================================

GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_business_verified(uuid) TO anon, authenticated, service_role;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Summary:
-- ✅ Created profiles table with admin role support
-- ✅ Added verification columns to businesses table
-- ✅ Migrated existing businesses to 'approved' status
-- ✅ Created helper functions for admin and verification checks
-- ✅ Updated RLS policies to gate access based on verification
-- ✅ All main app tables now require verified business status
