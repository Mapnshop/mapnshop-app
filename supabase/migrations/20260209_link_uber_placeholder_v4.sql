-- Link Business to Uber Placeholder (Using auth.users if permissions allow, or manual ID)
-- RUN THIS IN SUPABASE SQL EDITOR

DO $$
DECLARE
    target_user_id UUID;
    target_business_id UUID;
BEGIN
    ----------------------------------------------------------------
    -- OPTION 1: Look up by Email (Requires access to auth.users) --
    ----------------------------------------------------------------
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = 'mrlaksaci@gmail.com'
    LIMIT 1;

    ----------------------------------------------------------------
    -- OPTION 2: If Option 1 fails (permissions), PASTE UUID HERE --
    ----------------------------------------------------------------
    -- If the above is NULL, uncomment the line below and paste your User UID
    -- target_user_id := 'YOUR-USER-UID-FROM-SUPABASE-DASHBOARD'; 

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User mrlaksaci@gmail.com not found in auth.users. Please paste your User UID manually in the script.';
    END IF;

    -- Find the Business
    SELECT id INTO target_business_id
    FROM public.businesses
    WHERE owner_id = target_user_id
    LIMIT 1;

    IF target_business_id IS NULL THEN
        RAISE EXCEPTION 'No business found for User ID %', target_user_id;
    END IF;

    -- Link Integration
    INSERT INTO public.integrations (business_id, provider, status, external_store_id)
    VALUES (target_business_id, 'uber_eats', 'connected', 'PLACEHOLDER-UBER-STORE-ID')
    ON CONFLICT (business_id, provider) 
    DO UPDATE SET 
        status = 'connected', 
        external_store_id = 'PLACEHOLDER-UBER-STORE-ID';

    RAISE NOTICE 'SUCCESS! Linked Business % to Placeholder Uber Store', target_business_id;
END $$;
