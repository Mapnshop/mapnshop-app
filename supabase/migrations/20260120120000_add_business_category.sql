-- Create business category enum
DO $$ BEGIN
    CREATE TYPE business_category AS ENUM ('retail', 'restaurant', 'service', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add category column to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS category business_category DEFAULT 'other';

-- Update RLS if needed (not needed for new column usually, but good to know)
-- Policies usually cover the whole row.
