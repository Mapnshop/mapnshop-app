-- Corrected Link Script
DO $$
DECLARE
    target_business_id UUID;
    target_user_id UUID;
BEGIN
    -- 1. Find User ID from auth.users (requires permission) OR profiles
    -- Since we might not have access to auth.users in this context, let's try profiles
    -- Assuming table is 'profiles' based on error
    
    SELECT id INTO target_user_id
    FROM profiles
    WHERE email = 'mrlaksaci@gmail.com';  -- Check if email column exists in profiles

    -- Fallback: If email is not in profiles, we might need another way or just ask user for UUID.
    -- But let's try to query businesses directly if we can matches owner_id
    -- Wait, businesses table has owner_id.
    
    -- If profiles table has no email, we can't link by email easily without auth.users access.
    -- BUT, usually `profiles` is a mirror.

    IF target_user_id IS NULL THEN
       -- Try to find business directly if possible? No, we need owner.
       -- Let's try to find ANY business for now just to make it work?
       -- No, user gave specific email.
       RAISE NOTICE 'User not found in profiles. Trying to find business via internal query...';
    END IF;

    SELECT id INTO target_business_id
    FROM businesses
    WHERE owner_id = target_user_id
    LIMIT 1;
    
    -- If still null, maybe the user hasn't created a business yet?
    IF target_business_id IS NULL THEN
         RAISE EXCEPTION 'Business not found for mrlaksaci@gmail.com (User ID: %). Ensure the user has created a business.', target_user_id;
    END IF;

    -- 2. Insert/Update
    INSERT INTO integrations (business_id, provider, status, external_store_id)
    VALUES (target_business_id, 'uber_eats', 'connected', 'PLACEHOLDER-UBER-STORE-ID')
    ON CONFLICT (business_id, provider) 
    DO UPDATE SET status = 'connected', external_store_id = 'PLACEHOLDER-UBER-STORE-ID';
    
    RAISE NOTICE 'SUCCESS: Linked Business % to Uber Store PLACEHOLDER-UBER-STORE-ID', target_business_id;
END $$;
