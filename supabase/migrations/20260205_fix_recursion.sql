-- FIX INFINITE RECURSION IN PROFILES
-- The previous policy caused recursion because checking "is admin" queried the table itself while verifying the policy.

-- 1. Drop the problematic policy
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

-- 2. Create a clean policy using the SECURITY DEFINER function we created earlier
-- This avoids recursion because the function runs with owner permissions, bypassing RLS during the check.
CREATE POLICY "Admins can read all profiles" ON public.profiles
FOR SELECT
USING (public.is_admin());

-- 3. Ensure "Users can read own profile" is still there (it was fine, but just in case)
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 4. Make sure is_admin is definitely compiled and working
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER -- This is the magic keyword that stops recursion
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;
