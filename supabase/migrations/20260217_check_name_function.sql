-- Function to check if a business name already exists (case-insensitive)
-- Security Definer allows this to run with system privileges, bypassing RLS
-- enabling "anonymous" or "authenticated" users to check names without seeing all business data.

CREATE OR REPLACE FUNCTION check_business_name_exists(name_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM businesses
    WHERE name ILIKE name_to_check
  );
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION check_business_name_exists(text) TO anon, authenticated, service_role;
