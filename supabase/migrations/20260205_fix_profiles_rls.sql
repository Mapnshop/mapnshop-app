-- FIX PROFILES RLS
-- Run this to ensure the profiles table is accessible

-- 1. Enable RLS (good practice, ensures secure access)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Policy: Users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 3. Create Policy: Admins can read all profiles (optional but useful)
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. Grant access just in case
GRANT ALL ON public.profiles TO authenticated;

-- 5. DIAGNOSTIC: Check if your user is an admin
-- You can run this separately to check your status
-- SELECT * FROM public.profiles WHERE id = auth.uid();
