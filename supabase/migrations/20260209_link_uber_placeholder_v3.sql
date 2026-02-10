-- Link Business to Uber Placeholder (Corrected Table Name)
DO $$
DECLARE
    target_business_id UUID;
    target_user_id UUID;
BEGIN
    -- 1. Find the User ID from public.profiles
    SELECT id INTO target_user_id
    FROM public.profiles
    WHERE email = 'mrlaksaci@gmail.com'
    LIMIT 1;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User mrlaksaci@gmail.com not found in public.profiles table.';
    END IF;

    -- 2. Find the Business owned by this user
    SELECT id INTO target_business_id
    FROM public.businesses
    WHERE owner_id = target_user_id
    LIMIT 1;

    IF target_business_id IS NULL THEN
        RAISE EXCEPTION 'No business found owned by user ID %', target_user_id;
    END IF;

    RAISE NOTICE 'Found Business ID: %', target_business_id;

    -- 3. Insert or Update the Integration
    INSERT INTO public.integrations (business_id, provider, status, external_store_id)
    VALUES (
        target_business_id,
        'uber_eats',
        'connected',
        'PLACEHOLDER-UBER-STORE-ID'
    )
    ON CONFLICT (business_id, provider) 
    DO UPDATE SET 
        status = 'connected',
        external_store_id = 'PLACEHOLDER-UBER-STORE-ID';

    RAISE NOTICE 'SUCCESS: Linked Business to Uber Store ID: PLACEHOLDER-UBER-STORE-ID';
END $$;
