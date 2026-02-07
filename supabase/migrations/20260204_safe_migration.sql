-- SAFE MIGRATION V2 - Handles dependencies correctly
-- Run this version to fix the "cannot drop function" error

-- =====================================================
-- 0. CLEANUP (Drop policies first to avoid dependency errors)
-- =====================================================

-- Drop policies that depend on is_admin()
DROP POLICY IF EXISTS "Admins Manage Verification" ON public.businesses;
DROP POLICY IF EXISTS "Admins View All Businesses" ON public.businesses;
DROP POLICY IF EXISTS "Manage Members" ON public.business_members;
DROP POLICY IF EXISTS "Manage Members (Verified Only)" ON public.business_members;

-- =====================================================
-- 1. ADD VERIFICATION COLUMNS TO BUSINESSES (if not exist)
-- =====================================================

DO $$ 
BEGIN
    -- Add verification columns one by one, ignoring if they already exist
    ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
    ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
    ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);
    ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    
    -- Add verification_status with constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'businesses' AND column_name = 'verification_status') THEN
        ALTER TABLE public.businesses 
        ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'draft' 
        CHECK (verification_status IN ('draft', 'pending', 'approved', 'rejected'));
    END IF;
END $$;

-- =====================================================
-- 2. MIGRATE EXISTING DATA
-- =====================================================

-- Set all existing businesses to 'approved' status (if they're still 'draft')
UPDATE public.businesses
SET 
    verification_status = 'approved',
    verified_at = NOW()
WHERE verification_status = 'draft' OR verified_at IS NULL;

-- Create profile records for all existing users (if they don't exist)
INSERT INTO public.profiles (id, role)
SELECT DISTINCT id, 'business'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. HELPER FUNCTIONS (Use CASCADE to handle any lingering dependencies)
-- =====================================================

-- Drop and recreate functions with CASCADE
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
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

DROP FUNCTION IF EXISTS public.is_business_verified(uuid) CASCADE;
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
-- 4. RECREATE RLS POLICIES
-- =====================================================

-- Business Policies
DROP POLICY IF EXISTS "Access Business" ON public.businesses;
DROP POLICY IF EXISTS "View Own Business" ON public.businesses;
DROP POLICY IF EXISTS "Update Own Business (Draft/Rejected)" ON public.businesses;
DROP POLICY IF EXISTS "Create Own Business" ON public.businesses;
-- (Admin policies dropped in step 0, recreated here)

CREATE POLICY "View Own Business" ON public.businesses
FOR SELECT
USING (
  owner_id = auth.uid() 
  OR 
  is_business_member(id)
);

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

CREATE POLICY "Create Own Business" ON public.businesses
FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Admins Manage Verification" ON public.businesses
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins View All Businesses" ON public.businesses
FOR SELECT
USING (is_admin());

-- =====================================================
-- 5. GATE ACCESS TO MAIN APP TABLES
-- =====================================================

-- Orders
DROP POLICY IF EXISTS "Access Orders" ON public.orders;
DROP POLICY IF EXISTS "Access Orders (Verified Only)" ON public.orders;

CREATE POLICY "Access Orders (Verified Only)" ON public.orders
FOR ALL
USING (
    (is_business_member(business_id) OR EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid()))
    AND
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND verification_status = 'approved')
);

-- Customers
DROP POLICY IF EXISTS "Access Customers" ON public.customers;
DROP POLICY IF EXISTS "Access Customers (Verified Only)" ON public.customers;

CREATE POLICY "Access Customers (Verified Only)" ON public.customers
FOR ALL
USING (
    (is_business_member(business_id) OR EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid()))
    AND
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND verification_status = 'approved')
);

-- Order Activity
DROP POLICY IF EXISTS "Access Activity" ON public.order_activity;
DROP POLICY IF EXISTS "Access Activity (Verified Only)" ON public.order_activity;

CREATE POLICY "Access Activity (Verified Only)" ON public.order_activity
FOR ALL
USING (
    order_id IN (
        SELECT id FROM orders WHERE 
        (is_business_member(business_id) OR EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid()))
        AND EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND verification_status = 'approved')
    )
);

-- Deliveries
DROP POLICY IF EXISTS "Access Deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Access Deliveries (Verified Only)" ON public.deliveries;

CREATE POLICY "Access Deliveries (Verified Only)" ON public.deliveries
FOR ALL
USING (
    order_id IN (
        SELECT id FROM orders WHERE 
        (is_business_member(business_id) OR EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid()))
        AND EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND verification_status = 'approved')
    )
);

-- Business Members
DROP POLICY IF EXISTS "View Members" ON public.business_members;
DROP POLICY IF EXISTS "View Members (Verified Only)" ON public.business_members;
-- (Manage Members dropped in step 0, recreated here)

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
-- 6. GRANTS
-- =====================================================

GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_business_verified(uuid) TO anon, authenticated, service_role;

-- =====================================================
-- DONE!
-- =====================================================

SELECT 'Migration completed successfully!' as status;
