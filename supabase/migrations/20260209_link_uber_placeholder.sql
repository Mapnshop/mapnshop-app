-- 1. Find the Business ID for the user
DO $$
DECLARE
    target_business_id UUID;
BEGIN
    -- Get Business ID owned by the email user
    SELECT b.id INTO target_business_id
    FROM businesses b
    JOIN user_profiles up ON up.id = b.owner_id
    WHERE up.email = 'mrlaksaci@gmail.com'
    LIMIT 1;

    IF target_business_id IS NULL THEN
        RAISE NOTICE 'Business not found for mrlaksaci@gmail.com';
        RETURN;
    END IF;

    RAISE NOTICE 'Linking Business ID: %', target_business_id;

    -- 2. Insert or Update the Integration
    INSERT INTO integrations (business_id, provider, status, external_store_id)
    VALUES (
        target_business_id,
        'uber_eats',
        'connected',
        'PLACEHOLDER-UBER-STORE-ID'  -- <--- THIS IS THE ID WE WILL USE FOR TESTING
    )
    ON CONFLICT (business_id, provider) 
    DO UPDATE SET 
        status = 'connected',
        external_store_id = 'PLACEHOLDER-UBER-STORE-ID';

END $$;
